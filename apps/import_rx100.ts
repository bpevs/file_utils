// Import and sort photos from my rx100.
// Bonus: Query for additional exif data if missing
import { copy, ensureDir, exists, join, resolve } from "../deps.ts";

const RX100_PATH = "/Volumes/untitled";
const PHOTO_PATH = join(RX100_PATH, "DCIM");
const VID_PATH = join(RX100_PATH, "private", "M4ROOT", "CLIP");
const DESKTOP = join(Deno.env.get("HOME"), "Desktop");

for await (const dirEntry of Deno.readDir(PHOTO_PATH)) {
  if (dirEntry.isDirectory) {
    const [_, yearText, month, day] = dirEntry.name.match(/^(....)(..)(..)/);
    const yearName = String(Number(yearText) + 1020);
    const monthName = [yearName, month].join("_");
    const dayName = [yearName, month, day].join("_");
    const prevLocation = join(PHOTO_PATH, dirEntry.name);
    const nextContainer = join(DESKTOP, "photos", monthName);
    const nextLocation = join(nextContainer, dayName);
    if (await exists(nextLocation)) continue;
    await ensureDir(nextContainer);
    await copy(prevLocation, nextLocation);
  }
}

for await (const dirEntry of Deno.readDir(VID_PATH)) {
  const prevLocation = join(VID_PATH, dirEntry.name);
  const nextContainer = join(DESKTOP, "videos");
  const nextLocation = join(nextContainer, dirEntry.name.toLowerCase());
  if (await exists(nextLocation)) continue;
  await ensureDir(nextContainer);
  if (/mp4|xml/i.test(dirEntry.name)) {
    await copy(prevLocation, nextLocation);
  }
}
