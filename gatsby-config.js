module.exports = {
  siteMetadata: {
    title: "Hi, I'm Riza!",
    author: 'Riza Fahmi',
    description:
      'Building software? An app? I send newsletter with stories, best practices, lessons learned and random stuff such as podcast episode, screencast and more.',
    siteUrl: 'https://rizafahmi.com'
  },
  plugins: [
    'gatsby-plugin-sharp',
    'gatsby-transformer-sharp',
    {
      resolve: `gatsby-plugin-google-analytics`,
      options: {
        trackingId: '<your-google-analytics-tracking-id>',
        head: true,
        anonymize: true,
        respectDNT: false,
        exclude: []
      }
    },
    {
      // RSS feed for your gatsby blog
      resolve: 'gatsby-plugin-feed'
    },
    {
      // location of your blog posts
      resolve: `gatsby-source-filesystem`,
      options: {
        path: `${__dirname}/src/pages`,
        name: 'pages'
      }
    },
    {
      resolve: `gatsby-transformer-remark`,
      options: {
        plugins: [
          {
            resolve: `gatsby-remark-images`,
            options: {
              maxWidth: 1140
            }
          },
          {
            resolve: `gatsby-remark-responsive-iframe`,
            options: {
              wrapperStyle: `margin-bottom: 1.0725rem`
            }
          },
          'gatsby-remark-prismjs',
          'gatsby-remark-copy-linked-files',
          'gatsby-remark-smartypants'
        ]
      }
    },
    'gatsby-plugin-react-helmet'
  ]
};
