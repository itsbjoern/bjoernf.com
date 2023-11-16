import type { APIRoute } from "astro";
import Inter from "src/assets/Inter-Regular.ttf?url";
import sharp from "sharp";

export const GET: APIRoute = async ({ request, url }) => {
  const params = new URL(request.url).searchParams;
  const imageUrl = params.get("image") || "";

  if (!imageUrl || !imageUrl.startsWith("/")) {
    return new Response(null, {
      status: 400,
      statusText: "Bad Request",
    });
  }

  let buffer = null;
  try {
    const imageData = await fetch(url.origin + imageUrl);
    buffer = await imageData.arrayBuffer();
  } catch {
    return new Response(null, {
      status: 400,
      statusText: "Bad Request",
    });
  }
  const coverImage = await sharp(buffer)
    .resize({
      width: 300,
      height: 300,
      fit: "cover",
    })
    .toBuffer();

  const title = params.get("title");
  if (!title) {
    return new Response(null, {
      status: 400,
      statusText: "Bad Request",
    });
  }
  const sharpTitleImage = await sharp({
    text: {
      text: `"${title}"`,
      font: "Inter",
      dpi: 500,
      width: 750,
      align: "center",
      wrap: "word",
      rgba: true,
    },
  });

  const titleMeta = await sharpTitleImage.metadata();
  const titleImage = await sharpTitleImage.webp().toBuffer();

  const image = await sharp({
    create: {
      width: 1200,
      height: 630,
      channels: 3,
      background: { r: 255, g: 255, b: 255 },
    },
  })
    .composite([
      { input: coverImage, left: 50, top: 50 },
      {
        input: titleImage,
        left: 400 + Math.round(750 / 2 - titleMeta.width! / 2),
        top: Math.round(630 / 2 - titleMeta.height! / 2),
      },
    ])
    .webp()
    .toBuffer();

  return new Response(image, {
    headers: {
      "content-type": "image/webp",
    },
  });
};
