import React from 'react';
// import Seo from '../components/Seo';
import Layout from '../components/layout';

const LivePage = (props) => (
  <Layout>
    {/* <Seo data="" /> */}
    <div className="align-top text-center">
      <h1 className="inline-block pt-3 pb-3">Live Streaming</h1>
    </div>
    <div className="align-top">
      <p className="leading-loose py-3">
        Hi, I{"'"}m Riza. These are my video while I{"'"}m live stream.
      </p>
      <iframe
        title="Live Stream"
        width="800"
        height="450"
        src="https://www.youtube.com/embed/bzRKKWlFwD0"
        frameBorder="0"
        allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
        allowFullscreen
      />
    </div>
  </Layout>
);

export default LivePage;
