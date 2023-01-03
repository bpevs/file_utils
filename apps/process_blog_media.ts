/**
 * Process photos, videos, and audio for my blog.
 * Uses Imagemagick for images, ffmpeg for videos/audio
 *
 * @todo
 *   - Build HTML string for gallery copypasta
 *   - Handle png
 *   - Audio .* -> *.mp3
 */

import {
  basename,
  ColorSpace,
  ensureDir,
  dirname,
  ensureFile,
  join,
  ImageMagick,
  IMagickImage,
  initializeImageMagick,
  MagickFormat,
  OrientationType,
} from "../deps.ts";

const { TopLeft, BottomRight } = OrientationType;

const [baseDir] = Deno.args;

await initializeImageMagick(); // make sure to initialize first!

for await (const dirEntry of Deno.readDir(baseDir)) {
  if (/\.jpg$/i.test(dirEntry.name)) {
    const fileLocation = join(baseDir, dirEntry.name);
    const optimizedFileName = dirEntry.name.replace(".JPG", ".jpg");
    console.log(fileLocation);

    const data: Uint8Array = await Deno.readFile(fileLocation);
    await ensureDir(`${baseDir}/medium/`);
    await ensureDir(`${baseDir}/full/`);

    medium(data, baseDir, optimizedFileName);
    full(data, baseDir, optimizedFileName);
  }
}


// Blog-post Size
function medium(data, baseDir, fileName) {
  ImageMagick.read(data, (img: IMagickImage) => {
    img.quality = 85;
    const orientation = img.orientation;
    img.strip();
    img.resize(1200, 680);
    if (orientation == 6) img.rotate(90);

    img.write(
      (data: Uint8Array) => Deno.writeFile(`${baseDir}/medium/${fileName}`, data),
      MagickFormat.Jpeg,
    );
  });
}

// Full-Sized
function full(data, baseDir, fileName) {
  ImageMagick.read(data, (img: IMagickImage) => {
    const orientation = img.orientation;
    img.strip();
    if (orientation == 6) img.rotate(90);

    img.write(
      (data: Uint8Array) => Deno.writeFile(`${baseDir}/full/${fileName}`, data),
      MagickFormat.Jpeg,
    );
  });
}
