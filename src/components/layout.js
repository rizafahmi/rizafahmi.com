import React from 'react';
import Helmet from 'react-helmet';
import config from '../config/config';
import Menu from '../components/Menu';
import './index.css';

export default ({ children }) => (
  <div className="flex flex-col font-sans min-h-screen text-grey-darkest">
    <Menu />
    <Helmet
      title={config.siteTitle}
      meta={[{ name: 'description', content: config.siteDescription }]}
    />

    <div className="flex flex-col flex-1 max-w-xl mx-auto px-4 py-8 md:p-8 w-full">
      {children}
    </div>
    <Menu />
  </div>
);
