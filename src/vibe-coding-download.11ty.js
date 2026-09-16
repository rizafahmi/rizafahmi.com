import { renderKitPdf } from "./libs/vibe-coding.js";

export default class {
  data() {
    return {
      permalink: "/vibe-coding/panduan.pdf",
      eleventyExcludeFromCollections: true,
    };
  }

  async render({ vibeCoding }) {
    return renderKitPdf(vibeCoding);
  }
}
