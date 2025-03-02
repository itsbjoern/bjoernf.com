import requests
import random
import json
import time
from bs4 import BeautifulSoup
from collections import deque
from datetime import datetime, timedelta
from threading import Thread

BREADTH = 4
DEPTH = 6
NUM_THREADS = 7

random_article_link = "https://en.wikipedia.org/api/rest_v1/page/random/summary"
user_agent = "https://bjoernf.com/games/wiki-sort (mail@bjoernf.com)"
request_times = deque(maxlen=200)


def make_request(url):
    while len(request_times) >= 200 and datetime.now() - request_times[0] < timedelta(
        seconds=1
    ):
        time.sleep(0.005)
    request_times.append(datetime.now())
    response = requests.get(url, headers={"User-Agent": user_agent})
    response.raise_for_status()
    return response


def get_random_article():
    try:
        response = make_request(random_article_link)
        return response.json()
    except requests.RequestException as e:
        print("Error fetching random article.")
        print(e)
        return None


def get_article_links(title):
    url = f"https://en.wikipedia.org/api/rest_v1/page/html/{title}"
    try:
        response = make_request(url)
        soup = BeautifulSoup(response.text, "html.parser")
        links = [
            {
                "url": f"https://en.wikipedia.org{a['href']}",
                "title": a.get("title", a.text),
                "summary": "",
            }
            for a in soup.select("section p > a[rel='mw:WikiLink']")
            if ":" not in a["href"]
            and "redlink" not in a["href"]  # Exclude special pages
        ]
        return links
    except requests.RequestException as e:
        print(f"Error fetching links for article: {title}")
        print(e)
        return []


def get_article_summary(title):
    url = f"https://en.wikipedia.org/api/rest_v1/page/summary/{title}"
    try:
        response = make_request(url)
        response.raise_for_status()
        data = response.json()
        return data
    except requests.RequestException as e:
        print(f"Error fetching summary for article: {title}")
        print(e)
        return {}


def fetch_links_recursive(title, current_depth, pick_size, urls, title_words):
    links = get_article_links(title)
    # Only the first level uses pick_size, subsequent levels use 1
    num_links_to_pick = pick_size if current_depth == 1 else 1

    # Page should have at least 10 links to be sufficiently "large"
    if len(links) < 10 or len(links) < num_links_to_pick:
        return None

    i = 0
    while True:
        random_links = random.sample(links, num_links_to_pick)

        can_break = True
        for link in random_links:
            if link["url"] in urls:
                can_break = False
                break
            link_words = link["title"].split(" ")
            if any(word in title_words for word in link_words):
                can_break = False

        if can_break:
            for link in random_links:
                urls.append(link["url"])
                title_words.extend(link["title"].split(" "))
            break

        i += 1
        if i > 10:
            return None

    result = []
    for link in random_links:
        print(f"Fetching content for: {link['title']} - {link['url']}")
        summary = get_article_summary(link["title"])
        link["summary"] = summary.get("extract", "")
        link["image"] = summary.get("thumbnail", {}).get("source", "")

        nested_links = []
        if current_depth < DEPTH:
            i = 0
            while True:
                nested_links = fetch_links_recursive(
                    link["title"], current_depth + 1, 1, urls, title_words
                )
                if nested_links:
                    break
                i += 1
                if i > 3:
                    print(f"Failed to fetch nested links for: {link['title']}")
                    urls.remove(link["url"])
                    for word in link["title"].split(" "):
                        title_words.remove(word)

                    return fetch_links_recursive(
                        title, current_depth, pick_size, urls, title_words
                    )

        result.append(
            {
                "text": link["title"],
                "url": link["url"],
                "title": link["title"],
                "summary": link["summary"],
                "image": link["image"],
                "links": nested_links,
            }
        )
        print(f"Content fetched for: {link['title']}")
    return result


def create_random_article_links(day_offset):
    random_article = get_random_article()
    if not random_article:
        return create_random_article_links(day_offset)

    title = random_article["title"]
    url = random_article["content_urls"]["desktop"]["page"]
    summary = random_article.get("extract", "")
    image = random_article.get("thumbnail", {}).get("source", "")

    title_words = title.split(" ")
    urls = [url]
    nested_links = fetch_links_recursive(title, 1, BREADTH, urls, title_words)
    while not nested_links:
        return create_random_article_links(day_offset)

    result = {
        "text": title,
        "url": url,
        "title": title,
        "summary": summary,
        "image": image,
        "links": nested_links,
    }
    today = datetime.now()
    for_day = today + timedelta(days=day_offset)
    day_str = for_day.strftime("%Y-%m-%d")
    with open(f"data/links-{day_str}.json", "w+") as f:
        json.dump(result, f, indent=2)


def worker(day_offset):
    create_random_article_links(day_offset)


if __name__ == "__main__":
    threads = []
    for i in range(NUM_THREADS):
        t = Thread(target=worker, args=(i,))
        threads.append(t)
        t.start()

    for t in threads:
        t.join()
