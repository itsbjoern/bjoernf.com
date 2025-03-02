import json
import os

final = {}
for root, _, files in os.walk("data/"):
    for file_n in files:
        if file_n == "combined.json":
            continue
        with open(root + "/" + file_n) as f:
            data = json.load(f)
            final[file_n.split(".")[0].split("-", 1)[1]] = data
json.dump(final, open("data/combined.json", "w+"))
