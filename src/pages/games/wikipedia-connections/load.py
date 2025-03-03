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
NUM_THREADS = 1

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


def get_title_words(title):
    clean_title = "".join(c for c in title if c.isalnum() or c.isspace()).lower()
    title_words = clean_title.split(" ")

    # Allow for some common words
    final_title_words = []
    for word in title_words:
        if word in ["the", "of", "and", "in", "on", "a", "an"]:
            continue
        if word in ["is", "was", "are", "were", "be", "been", "being"]:
            continue
        if word in ["to", "from", "by", "with", "as", "at", "for", "or", "not"]:
            continue
        if word in ["this", "that", "these", "those"]:
            continue
        if word in ["it", "its", "it's", "they", "their", "them"]:
            continue
        if word in ["he", "his", "him", "she", "her", "hers"]:
            continue
        if word in ["i", "me", "my", "mine", "you", "your", "yours"]:
            continue
        if word in ["we", "us", "our", "ours"]:
            continue
        if word in ["all", "any", "some", "none", "more", "most", "much", "many"]:
            continue
        if word in ["about", "into", "over", "under", "through", "around"]:
            continue
        if word in ["up", "down", "left", "right", "back", "front"]:
            continue
        final_title_words.append(word)

    return final_title_words


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

            link_words = get_title_words(link["title"])
            if any(word in title_words for word in link_words):
                can_break = False

        if can_break:
            for link in random_links:
                urls.append(link["url"])

                link_words = get_title_words(link["title"])
                title_words.extend(link_words)
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

                    link_words = get_title_words(link["title"])
                    for word in link_words:
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


def create_random_article_links():
    random_article = get_random_article()
    if not random_article:
        return create_random_article_links()

    title = random_article["title"]
    url = random_article["content_urls"]["desktop"]["page"]
    summary = random_article.get("extract", "")
    image = random_article.get("thumbnail", {}).get("source", "")

    title_words = get_title_words(title)
    urls = [url]
    nested_links = fetch_links_recursive(title, 1, BREADTH, urls, title_words)
    while not nested_links:
        return create_random_article_links()

    result = {
        "text": title,
        "url": url,
        "title": title,
        "summary": summary,
        "image": image,
        "links": nested_links,
    }

    return result


def worker(day_offset):
    result = create_random_article_links(day_offset)
    today = datetime.now()
    for_day = today + timedelta(days=day_offset)
    day_str = for_day.strftime("%Y-%m-%d")

    with open(f"data/links-{day_str}.json", "w+") as f:
        json.dump(result, f, indent=2)


if __name__ == "__main__":
    threads = []
    for i in range(NUM_THREADS):
        t = Thread(target=worker, args=(i,))
        threads.append(t)
        t.start()

    for t in threads:
        t.join()
