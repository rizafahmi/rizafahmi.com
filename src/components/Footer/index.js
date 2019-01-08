import React from 'react';
// import config from '../../config/config';

const Footer = () => (
  <div className="bg-grey-lightest">
    <div className="text-center max-w-xl mx-auto p-4 md:p-8 text-sm">
      <ul className="list-reset inline-flex">
        <li className="mx-4">
          <a href="/">Home</a>
        </li>
        <li className="mx-4">
          <a href="/">About</a>
        </li>
        <li className="mx-4">
          <a href="/articles">Articles</a>
        </li>
        <li className="mx-4">
          <a
            href="https://emailoctopus.com/lists/c26e1c25-0833-11e9-a3c9-06b79b628af2/forms/subscribe"
            rel="noopener noreferrer"
          >
            Newsletter
          </a>
        </li>
      </ul>
    </div>
  </div>
);

export default Footer;
