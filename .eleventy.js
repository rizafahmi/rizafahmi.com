const pluginRss = require('@11ty/eleventy-plugin-rss');
const syntaxHighlight = require('@11ty/eleventy-plugin-syntaxhighlight');

module.exports = function (eleventyConfig) {
  eleventyConfig.addPassthroughCopy('assets');
  eleventyConfig.addPlugin(syntaxHighlight);
  eleventyConfig.addPlugin(pluginRss);

  eleventyConfig.addFilter('filterCourse', function (courses, url) {
    const [_, _course, slug] = url.split('/');
    const currentCourse = courses.find(function (course) {
      return course.slug === slug;
    });
    return currentCourse;
  });

  return {
    dir: { input: 'src', output: 'dist' },
    dataTemplate: 'njk',
    markdownTemplateEngine: 'njk',
  };
};
