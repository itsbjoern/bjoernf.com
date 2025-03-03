from datetime import datetime
import json

import load

# public_folder = "../../../../public"


if __name__ == "__main__":
    result = load.create_random_article_links()

    today = datetime.now()
    day_str = today.strftime("%Y-%m-%d")
    result["date"] = day_str

    game = {
        "regular": result,
    }

    with open("wikipedia-game.json", "w+") as f:
        json.dump(game, f, indent=2)
