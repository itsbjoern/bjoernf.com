import sharp from "sharp";

const svg =
  '<svg width="1200" height="630" version="1.1" xmlns="http://www.w3.org/2000/svg">' +
  "  <defs>" +
  '      <linearGradient id="gr" x1="0" x2="1" y1="0" y2="1">' +
  '        <stop offset="30%" stop-color="#fff" stop-opacity="0"/>' +
  '        <stop offset="100%" stop-color="#888" stop-opacity="100"/>' +
  "      </linearGradient>" +
  "  </defs>" +
  '<rect x="0" y="0" width="1200" height="630" fill="url(#gr)"/>' +
  "</svg>";

type ImageProps = {
  buffer: Buffer | null;
  title: string;
  subtitle?: string;
};

const clamp = (num: number, min: number, max: number) =>
  Math.min(Math.max(num, min), max);

const getCompositePosition = (
  canvasWidth: number,
  canvasHeight: number,
  elementWidth: number,
  elementHeight: number,
  desiredX: number,
  desiredY: number,
) => ({
  left: clamp(desiredX, 0, canvasWidth - elementWidth),
  top: clamp(desiredY, 0, canvasHeight - elementHeight),
});

export const createImage = async ({ buffer, title, subtitle }: ImageProps) => {
  let coverImage;
  if (buffer) {
    coverImage = await sharp(buffer)
      .resize({
        width: 300,
        height: 300,
        fit: "cover",
      })
      .toBuffer();
  } else {
    coverImage = await sharp({
      create: {
        width: 300,
        height: 300,
        channels: 3,
        background: { r: 255, g: 255, b: 255 },
      },
    })
      .png()
      .toBuffer();
  }

  const sharpTitleImage = sharp({
    text: {
      text: title,
      font: "Roboto",
      dpi: 500,
      width: 750,
      align: "center",
      wrap: "word",
      rgba: true,
    },
  });
  const titleMeta = await sharpTitleImage.metadata();
  const titleImage = await sharpTitleImage.png().toBuffer();

  let subtitleBuffer = null;
  let subtitleMeta = null;
  if (subtitle) {
    const subtitleImage = sharp({
      text: {
        text: subtitle,
        font: "Roboto",
        dpi: 250,
        width: 750,
        align: "left",
        rgba: true,
      },
    });

    subtitleMeta = await subtitleImage.metadata();
    subtitleBuffer = await subtitleImage.png().toBuffer();
  }

  const cr = await sharp({
    text: {
      text: '<span foreground="#ddd">Björn Friedrichs</span>',
      font: "Roboto",
      dpi: 200,
      width: 750,
      align: "left",
      rgba: true,
    },
  })
    .png()
    .toBuffer();

  const gradient = await sharp(Buffer.from(svg)).png().toBuffer();

  const sidebar = await sharp({
    create: {
      width: 400,
      height: 630,
      channels: 3,
      background: { r: 0, g: 0, b: 0 },
    },
  })
    .png()
    .toBuffer();

  const CANVAS_WIDTH = 1200;
  const CANVAS_HEIGHT = 630;

  const image = await sharp({
    create: {
      width: CANVAS_WIDTH,
      height: CANVAS_HEIGHT,
      channels: 3,
      background: { r: 255, g: 255, b: 255 },
    },
  })
    .composite([
      { input: sidebar, left: 0, top: 0 },
      { input: gradient, left: 0, top: 0 },
      {
        input: coverImage,
        ...getCompositePosition(CANVAS_WIDTH, CANVAS_HEIGHT, 300, 300, 50, 50),
      },
      {
        input: titleImage,
        ...getCompositePosition(
          CANVAS_WIDTH,
          CANVAS_HEIGHT,
          titleMeta.width!,
          titleMeta.height!,
          400 + Math.round(800 / 2 - titleMeta.width! / 2),
          Math.round(630 / 2 - titleMeta.height! / 2),
        ),
      },
      ...(subtitleBuffer
        ? [
            {
              input: subtitleBuffer,
              ...getCompositePosition(
                CANVAS_WIDTH,
                CANVAS_HEIGHT,
                subtitleMeta!.width!,
                subtitleMeta!.height!,
                400 + Math.round(800 / 2 - subtitleMeta!.width! / 2),
                Math.round(630 / 2 - titleMeta.height! / 2 - 75),
              ),
            },
          ]
        : []),
      {
        input: cr,
        ...getCompositePosition(
          CANVAS_WIDTH,
          CANVAS_HEIGHT,
          750, // width of cr text
          30, // approximate height of cr text
          50,
          630 - 50 - 30,
        ),
      },
    ])
    .png()
    .toBuffer();

  return image;
};
