const syntaxHighlight = require('@11ty/eleventy-plugin-syntaxhighlight');
module.exports = function(eleventyConfig) {
  eleventyConfig.addPassthroughCopy('assets');
  eleventyConfig.addPlugin(syntaxHighlight);

  return {
    dir: { input: 'src', output: 'dist' },
    dataTemplate: 'njk',
    markdownTemplateEngine: 'njk'
  };
};
