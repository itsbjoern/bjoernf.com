import { getDb } from "@/utils/database";
import type { Post } from "@/utils/models";
import type { APIRoute } from "astro";
import type { Filter } from "mongodb";

export const GET: APIRoute = async ({ url, params }) => {
  const tag = params.tag;
  let query: Filter<Post> = { published: { $exists: true } };
  if (tag) {
    query["published.tags"] = tag;
  }
  const database = await getDb();
  const posts = await database.posts().find(query).toArray();
  return new Response(
    `<rss xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:content="http://purl.org/rss/1.0/modules/content/" xmlns:atom="http://www.w3.org/2005/Atom" version="2.0" encoding="UTF-8">
  <channel>
    <title>
    <![CDATA[ Björn Friedrichs' Blog${tag ? ` | ${tag}` : ""} ]]>
    </title>
    <description>
    <![CDATA[ A mere stream of thoughts ]]>
    </description>
    <link>${url.origin}</link>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    ${posts
      .map(
        (post) =>
          `<item>
            <title>
            <![CDATA[ ${post.published?.title} ]]>
            </title>
            <description>
            <![CDATA[ ${post.published?.summary?.replace(/\0/g, "") ?? ""} ]]>
            </description>
            <link>${url.origin}/blog/${post._id.toString()}</link>
            <guid isPermaLink="false">${
              url.origin
            }/blog/${post._id.toString()}</guid>
            <pubDate>${post.published?.publishedAt?.toUTCString()}</pubDate>
            <content:encoded><![CDATA[ ${
              post.published?.html?.replace(/\0/g, "") ?? ""
            } ]]></content:encoded>
          </item>`,
      )
      .join("")}
  </channel>
</rss>`,
    {
      headers: {
        "Content-Type": "text/xml; charset=utf-8",
      },
    },
  );
};
