module.exports = function(eleventyConfig) {
  eleventyConfig.addPassthroughCopy('assets');

  return {
    dir: { input: 'src', output: 'dist' },
    dataTemplate: 'njk',
    markdownTemplateEngine: 'njk'
  };
};
