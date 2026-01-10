import type { APIRoute } from "astro";
import { getCollection } from "astro:content";
import fs from "node:fs";
import { createImage } from "@/utils/createImage";

export const prerender = true;
export const getStaticPaths = async () => {
  const posts = await getCollection("blog");

  return posts.map((post) => ({
    params: { post: post.data.slugs[0] },
    props: { post },
  }));
};

export const GET: APIRoute = async ({ props, url, }) => {
  let buffer: Buffer | null = null;
  if (props.post.data.image) {
    try {
      const imageUrl = props.post.data.image.src
        .replace("/@fs", "")
        // bit weird but this is an ordering issue
        // at prebuild time the static folder is not yet in the client but instead in the server dist folder
        // Only after the server build is it moved to the client folder
        .replace("/static", "dist/server/static")
        .split("?")[0];

      const imageData = await fs.promises.readFile(imageUrl);
      buffer = imageData;
    } catch (err) {
      console.log(err);
      console.log(props.post.data.image.src);
    }
  }

  return new Response(
    await createImage({
      buffer,
      title: props.post.data.title,
      subtitle:
        "Published on " +
        new Date(props.post.data.createdAt).toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        }),
    }) as BodyInit,
    {
      headers: {
        "content-type": "image/png",
      },
    },
  );
};
