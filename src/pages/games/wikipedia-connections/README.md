# Wiki-sort

This game is a Wordle like daily game.

This game shows you a start and end page on Wikipedia, for each page it gives you a list of links to other pages. Your goal is to navigate from the start page to the end page by clicking on the links. When you get a link is correct it get's locked in with green color, otherwise the selection is not saved.

The links can be dragged and dropped to reorder them.

## Tech

The game is built using the Astro framework and Typescript, it is NOT using any other libraries or technologies. And implements it's own drag and drop components. There is no API required, the data files will be manually supplied, the underlying game data will have the following format:

```json
{
  "url": "https://wikipedia/...",
  "title": "Title",
  "summary": "Summary of page",
  "links": [
    {
      "url": "https://wikipedia/...",
      "title": "Title"
    }
  ]
}
```
