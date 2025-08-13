import sharp from "sharp";

export async function compositeOnColor(
  foregroundPng: Buffer,
  hex = "#FFFFFF",
  padding = 40,
) {
  const fg = sharp(foregroundPng);
  const meta = await fg.metadata();
  const width = (meta.width ?? 1000) + padding * 2;
  const height = (meta.height ?? 1000) + padding * 2;

  const bg = await sharp({
    create: { width, height, channels: 3, background: hex },
  })
    .png()
    .toBuffer();

  const out = await sharp(bg)
    .composite([{ input: await fg.png().toBuffer(), gravity: "center" }])
    .png()
    .toBuffer();

  return out;
}
