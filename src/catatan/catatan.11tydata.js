export default {
  eleventyComputed: {
    /**
     * Set `image` to the generated OG image path for articles that
     * don't already have a custom image/cover.  head.njk picks this
     * up via the `image` variable.
     */
    image(data) {
      // If the author already set a non-empty image or cover, keep it.
      if (data.image && data.image.length > 0) return data.image;
      if (data.cover && data.cover.length > 0) return data.cover;

      // Derive slug from the page fileSlug (filename without extension).
      const slug = data.page && data.page.fileSlug;
      if (!slug) return "/assets/images/og-twitter.png";

      return `/og/${slug}.png`;
    },
  },
};
