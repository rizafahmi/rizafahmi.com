import React from 'react';

import Layout from '../components/layout';

const ThanksPage = () => {
  return (
    <Layout>
      <div className="align-top text-center">
        <h1 className="inline-block pt-3 pb-3">Thanks for subscribe!</h1>
      </div>
      <div className="align-top">
        <div className="leading-loose py-3">
          Thanks for subscribe to the email list. <hr />
          <a
            href="/"
            className="bg-black hover:bg-grey-darker text-yellow-light font-bold py-3 px-3 rounded focus:outline-none focus:shadow-outline"
          >
            Back to homepage
          </a>
        </div>
      </div>
    </Layout>
  );
};

export default ThanksPage;
