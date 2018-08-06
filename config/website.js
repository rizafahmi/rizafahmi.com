const tailwind = require("../tailwind");

module.exports = {
  pathPrefix: "/", // Prefix for all links. If you deploy your site to example.com/portfolio your pathPrefix should be "/portfolio"

  siteTitle: "Riza Fahmi Portfolio", // Navigation and Site Title
  siteTitleAlt: "rizafahmi.com", // Alternative Site title for SEO
  siteUrl: "https://rizafahmi.com", // Domain of your site. No trailing slash!
  siteLanguage: "en", // Language Tag on <html> element
  siteLogo: "/logos/logo-1024.png", // Used for SEO and manifest
  siteDescription: "One stop solution for stalking me :)",

  siteFBAppID: "123456789", // Facebook App ID
  userTwitter: "@rizafahmi22", // Twitter Username
  ogSiteName: "rizafahmidotcom", // Facebook Site Name
  ogLanguage: "id_ID", // Facebook Language

  // Manifest and Progress color
  themeColor: tailwind.colors.orange,
  backgroundColor: tailwind.colors.blue
};
