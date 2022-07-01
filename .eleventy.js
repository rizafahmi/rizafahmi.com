const pluginRss = require('@11ty/eleventy-plugin-rss');
const syntaxHighlight = require('@11ty/eleventy-plugin-syntaxhighlight');

module.exports = function(eleventyConfig) {
  eleventyConfig.addPassthroughCopy('assets');
  eleventyConfig.addPassthroughCopy('src/_redirects');
  eleventyConfig.addPlugin(syntaxHighlight);
  eleventyConfig.addPlugin(pluginRss);

  return {
    dir: { input: 'src', output: 'dist' },
    dataTemplate: 'njk',
    markdownTemplateEngine: 'njk'
  };
};
