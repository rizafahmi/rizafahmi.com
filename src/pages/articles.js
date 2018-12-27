import React from 'react';
import Seo from '../components/Seo';
import get from 'lodash/get';
import { Link } from 'gatsby';
import Layout from '../components/layout';
import { graphql } from 'gatsby';

class BlogIndexPage extends React.Component {
  render() {
    const posts = get(this, 'props.data.allMarkdownRemark.edges');
    return (
      <Layout>
        <Seo
          data={{
            frontmatter: { title: "Hi, I'm Riza. These are my articles" },
            fields: { slug: '/' }
          }}
        />
        <div className="align-top text-center">
          <h1 className="inline-block pt-3 pb-3">ARTICLES</h1>
        </div>
        <div className="align-top">
          <p className="leading-loose py-3">
            Hi, I{"'"}m Riza. These are my articles.
          </p>
          <ul className="leading-loose">
            {posts.map(({ node }) => {
              const title = get(node, 'frontmatter.title') || node.fields.slug;
              return (
                <li>
                  <Link to={node.fields.slug}>{title}</Link>
                </li>
              );
            })}
          </ul>
        </div>
      </Layout>
    );
  }
}

export default BlogIndexPage;

export const pageQuery = graphql`
  query IndexQuery {
    site {
      siteMetadata {
        title
      }
    }
    allMarkdownRemark(sort: { fields: [frontmatter___date], order: DESC }) {
      edges {
        node {
          excerpt(pruneLength: 300)
          fields {
            slug
          }
          frontmatter {
            date(formatString: "DD MMMM, YYYY")
            title
            cover {
              childImageSharp {
                sizes(maxWidth: 630) {
                  ...GatsbyImageSharpSizes
                }
              }
            }
          }
        }
      }
    }
  }
`;
