import { getDb } from "@/utils/database";

export const GET = async () => {
  const database = await getDb();
  const posts = await database
    .posts()
    .find({ published: { $exists: true } })
    .sort({ "published.publishedAt": -1 })
    .toArray();

  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?>
<urlset
      xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
      xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
      xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
            http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">
  <url>
    <loc>https://bjoernf.com</loc>
    <lastmod>2022-02-24T14:09:27+00:00</lastmod>
    <priority>1.00</priority>
  </url>
  <url>
    <loc>https://bjoernf.com/blog</loc>
    <lastmod>2022-02-24T14:09:27+00:00</lastmod>
    <priority>0.70</priority>
  </url>
  <url>
    <loc>https://bjoernf.com/projects</loc>
    <lastmod>2022-02-24T14:09:27+00:00</lastmod>
    <priority>0.70</priority>
  </url>
  ${posts
    .map(
      (post) => `<url>
    <loc>https://bjoernf.com/blog/${post._id.toString()}</loc>
    <lastmod>${post.published?.publishedAt?.toISOString()}</lastmod>
    <priority>0.80</priority>
  </url>`,
    )
    .join("\n")}
  <url>
    <loc>https://bjoernf.com/about</loc>
    <lastmod>2022-02-24T14:09:27+00:00</lastmod>
    <priority>0.50</priority>
  </url>
</urlset>`,
    {
      headers: {
        "Content-Type": "text/xml; charset=utf-8",
      },
    },
  );
};
