import rss from "@astrojs/rss";
import { getCollection, render } from "astro:content";
import { experimental_AstroContainer as AstroContainer } from "astro/container";
import mdxRenderer from "@astrojs/mdx/server.js";
import sanitizeHtml from "sanitize-html";

// Create a new Astro container that we can render components with.
// See https://docs.astro.build/en/reference/container-reference/
const container = await AstroContainer.create();

// Load MDX and React renderer.
// Other renderers for UI frameworks (e.g. Vue, etc.) would need adding here if you were using those.
container.addServerRenderer({
  name: "mdx",
  renderer: mdxRenderer,
});

export async function GET(context: any) {
  let baseUrl = context.url?.origin ?? context.site.url;
  if (baseUrl.at(-1) === "/") baseUrl = baseUrl.slice(0, -1);

  const posts = await getCollection("blog");

  const sortedPosts = posts.sort((a, b) => {
    const aDate = new Date(a.data.createdAt);
    const bDate = new Date(b.data.createdAt);
    return bDate.getTime() - aDate.getTime();
  });

  const items = await Promise.all(
    sortedPosts.map(async (post) => {
      const { Content } = await render(post);

      const postHtml = await container.renderToString(Content);

      return {
        title: post.data.title,
        description: post.data.summary,
        url: `${context.site.url}/blog/${post.data.slugs[0]}`,
        date: new Date(post.data.createdAt),
        pubDate: new Date(post.data.createdAt),
        guid: `${context.site.url}/blog/${post.data.slugs[0]}`,
        content: sanitizeHtml(postHtml, {
          allowedTags: [...sanitizeHtml.defaults.allowedTags, "img"],
          allowedClasses: {},
          transformTags: {
            img: (tagName, attribs) => ({
              tagName,
              attribs: {
                ...attribs,
                src: attribs.src.startsWith("/")
                  ? `${baseUrl}${attribs.src}`
                  : attribs.src,
              },
            }),
          },
        }),
      };
    }),
  );

  return rss({
    title: "Björn Friedrichs' Blog",
    description: "A mere stream of thoughts",
    site: context.site,
    trailingSlash: false,
    items,
  });
}
