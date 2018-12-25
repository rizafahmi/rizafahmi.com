import React from 'react';
import config from '../../config/config';

const Footer = () => (
  <div className="bg-grey-lightest">
    <div className="text-center max-w-xl mx-auto p-4 md:p-8 text-sm">
      <ul className="list-reset inline-flex">
        <li className="mx-4">
          <a href="/" rel="noopener noreferrer">
            Home
          </a>
        </li>
        <li className="mx-4">
          <a href="/" rel="noopener noreferrer">
            About
          </a>
        </li>
        <li className="mx-4">
          <a href="/articles" rel="noopener noreferrer">
            Articles
          </a>
        </li>
        <li className="mx-4">
          <a href="/subscribe" rel="noopener noreferrer">
            Newsletter
          </a>
        </li>
      </ul>
    </div>
  </div>
);

export default Footer;
