import path from "node:path";
import { fileURLToPath } from "node:url";
import { generateOgImage } from "../src/libs/og-image.js";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

await generateOgImage({
  title: "Riza Fahmi",
  excerpt: "Catatan tentang pemrograman, AI, Elixir, dan web development oleh Co-Founder HACKTIV8.",
  tags: [],
  date: null,
  outputPath: path.join(root, "assets/images/og-twitter.png"),
});

console.log("Updated assets/images/og-twitter.png");
