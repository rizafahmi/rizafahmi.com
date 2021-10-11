const pluginRss = require('@11ty/eleventy-plugin-rss');
const syntaxHighlight = require('@11ty/eleventy-plugin-syntaxhighlight');
const slugify = require('slugify');

module.exports = function (eleventyConfig) {
  eleventyConfig.addPassthroughCopy('assets');
  eleventyConfig.addPlugin(syntaxHighlight);
  eleventyConfig.addPlugin(pluginRss);

  eleventyConfig.addFilter('getLessonByTitle', function (lessons, title) {
    const currentLesson = lessons.find(function (lesson) {
      return lesson.title === title;
    });
    return currentLesson;
  });

  eleventyConfig.addFilter('filterLessons', function (lessons, courseId) {
    const lessonsCourse = lessons.filter(function (lesson) {
      return lesson.courses.id === courseId;
    });
    return lessonsCourse;
  });

  eleventyConfig.addFilter('slugify', function (title) {
    return slugify(title, {
      lower: true,
      replacement: '-',
      remove: /[*+~.·,()'"`´%!?¿:@]/g,
    });
  });

  return {
    dir: { input: 'src', output: 'dist' },
    dataTemplate: 'njk',
    markdownTemplateEngine: 'njk',
  };
};
