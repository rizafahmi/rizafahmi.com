import React from 'react';
import Img from 'gatsby-image';
import { graphql, Link } from 'gatsby';
import Seo from '../components/Seo';
import Social from '../components/Social';
// import config from '../config/config';
import Layout from '../components/layout';

require('../../node_modules/prismjs/themes/prism-tomorrow.css');
require('../../node_modules/prismjs/plugins/line-numbers/prism-line-numbers.css');

const GITHUB_USERNAME = 'rizafahmi';
const GITHUB_REPO = 'rizafahmi.com-v2';

class BlogPostTemplate extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      data: null,
      showModal: false
    };
  }
  handleModal = (e) => {
    e.preventDefault();
    this.setState({
      showModal: !this.state.showModal
    });
  };

  render() {
    let post = this.props.data.markdownRemark;
    const { previous, next } = this.props.pageContext;
    const url = 'https://rizafahmi.com' + this.props.location.pathname;
    const { slug } = this.props.pageContext;
    post.fields = { slug };
    const editUrl = `https://github.com/${GITHUB_USERNAME}/${GITHUB_REPO}/edit/master/src/pages${slug}index.md`;

    return (
      <Layout>
        <div className="text-left p-4">
          <Seo data={post} />
          {post.frontmatter.cover && (
            <Img
              sizes={post.frontmatter.cover.childImageSharp.sizes}
              alt={post.frontmatter.title}
              className="w-full"
            />
          )}

          <h1 className="text-3xl lg:text-5xl text-blue-darker font-normal mt-6 mb-2">
            {post.frontmatter.title}
          </h1>
          <p className="block mb-8 pb-4 border-b-2">
            <span role="img" aria-label="blog post date">
              📅
            </span>{' '}
            {post.frontmatter.date} 📗 {post.timeToRead} minutes read,{' '}
            <a href={editUrl} target="_blank" rel="noopener noreferrer">
              Edit on GitHub
            </a>
          </p>
          <div
            className="blog-content leading-loose"
            dangerouslySetInnerHTML={{ __html: post.html }}
          />
          <div className="typo">
            <a href={editUrl} target="_blank" rel="noopener noreferrer">
              Find a typo? Edit on GitHub
            </a>
          </div>
          <div className="mt-16 pt-8 social-content text-center border-t">
            <p className="font-light">
              Did you enjoy this post? Buy me some{' '}
              <span role="img" aria-label="traktir" style={{ fontSize: 32 }}>
                ☕
              </span>{' '}
              with gopay or ovo.
            </p>
            <ul class="list-reset inline-flex">
              <li class="p-4">
                <div
                  role="button"
                  tabindex="0"
                  className="SocialMediaShareButton SocialMediaShareButton--twitter button"
                >
                  <div style={{ width: 256 }}>
                    <a
                      href="https://karyakarsa.com/checkout/207"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <img
                        alt="karyakarsa logo"
                        src={require('../images/karyakarsa-logo-black.svg')}
                      />
                    </a>
                  </div>
                </div>
              </li>
            </ul>
          </div>
          <div className="mt-16 pt-8 social-content text-center border-t">
            <p className="font-light">
              Did you enjoy this post? Share the{' '}
              <span role="img" aria-label="love the post">
                ❤️
              </span>{' '}
              with others.
            </p>
            <Social url={url} title={post.frontmatter.title} />
          </div>

          <ul
            className="mt-8 border-t-2 pt-4"
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'space-between',
              listStyle: 'none',
              paddingLeft: 0
            }}
          >
            <li>
              {previous && (
                <Link
                  to={previous.fields.slug}
                  rel="prev"
                  className="text-blue-darker"
                >
                  ← {previous.frontmatter.title}
                </Link>
              )}
            </li>
            <li>
              {next && (
                <Link
                  to={next.fields.slug}
                  rel="next"
                  className="text-indigo-darker hover:text-indigo-lighter"
                >
                  {next.frontmatter.title} →
                </Link>
              )}
            </li>
          </ul>
        </div>
        <a
          href="javascript:;"
          target="_blank"
          rel="noopener noreferrer"
          title="Traktir saya segelas kopi"
          onClick={this.handleModal}
          className="float"
          style={{
            position: 'fixed',
            width: '60px',
            height: '60px',
            right: '40px',
            backgroundColor: '#FFF383',
            borderRadius: '50px',
            textAlign: 'center',
            boxShadow: '2px 2px 3px #999',
            fontSize: '3em',
            bottom: '18px'
          }}
          alt="Traktir saya segelas kopi"
        >
          {this.state.showModal === true ? (
            <svg focusable="false" aria-hidden="true" width="16" height="20">
              <path
                fill="#ff00ff"
                d="M13.978 12.637l-1.341 1.341L6.989 8.33l-5.648 5.648L0 12.637l5.648-5.648L0 1.341 1.341 0l5.648 5.648L12.637 0l1.341 1.341L8.33 6.989l5.648 5.648z"
                fill-rule="evenodd"
              ></path>
            </svg>
          ) : (
            '☕'
          )}
        </a>
        {this.state.showModal === true && (
          <iframe
            src="https://karyakarsa.com/checkout/207"
            className="modal"
            style={{
              backgroundColor: '#fff',
              position: 'fixed',
              margin: 0,
              padding: 0,
              right: '18px',
              bottom: '98px',
              width: 400,
              maxWidth: 500,
              height: 'calc(100% - 140px)',
              boxShadow: 'rgba(0, 0, 0, 0.4) 0px 8px 16px',
              zIndex: 999
            }}
          ></iframe>
        )}
      </Layout>
    );
  }
}

export default BlogPostTemplate;

export const pageQuery = graphql`
  query BlogPostBySlug($slug: String!) {
    site {
      siteMetadata {
        title
        author
      }
    }
    markdownRemark(fields: { slug: { eq: $slug } }) {
      id
      html
      timeToRead
      excerpt(pruneLength: 280)
      frontmatter {
        title
        date(formatString: "DD MMMM, YYYY")
        cover {
          childImageSharp {
            sizes(maxWidth: 1140, maxHeight: 420) {
              ...GatsbyImageSharpSizes_withWebp
            }
          }
        }
      }
    }
  }
`;
