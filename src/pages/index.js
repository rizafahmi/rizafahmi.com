import React from 'react';
import Seo from '../components/Seo';
import Layout from '../components/layout';
import { Link, graphql } from 'gatsby';

import riza from '../images/riza.jpg';

const IndexPage = ({ data }) =>
  console.log(data) || (
    <Layout>
      <Seo
        data={{
          frontmatter: { title: "Hi, I'm Riza!" },
          fields: { slug: '/' }
        }}
      />
      <div className="flex mb-4">
        <div className="w-2/5 pt-3">
          <div className="">
            <img
              alt="portrait"
              src={riza}
              className="h-16 block rounded-full mx-auto"
            />
          </div>
          <div className="py-6 pr-3 lg:pr-6">
            <h4 className="py-3 text-grey font-normal">RECENT ARTICLES</h4>
            <ul className="leading-loose list-reset">
              {data &&
                data.allMarkdownRemark.edges.map(
                  ({ node }) =>
                    console.log(node) || (
                      <li className="py-3">
                        <Link
                          to={node.fields.slug}
                          rel="noopener noreferrer"
                          className="no-underline"
                        >
                          {node.frontmatter.title}
                        </Link>
                      </li>
                    )
                )}
            </ul>
          </div>
          <div className="py-6 pr-3 lg:pr-6">
            <h4 className="py-3 text-grey font-normal">ON THE WEB</h4>
            <ul className="leading-loose list-reset">
              <li className="py-3 inline-block">
                <a
                  href="https://twitter.com/rizafahmi22"
                  target="_blank"
                  className="inline-block no-underline"
                  rel="noopener noreferrer"
                >
                  <svg
                    className="align-middle h-6 inline-block fill-current "
                    id="ei-sc-twitter-icon"
                    viewBox="0 0 50 50"
                    width="15%"
                    height="15%"
                  >
                    <path d="M39.2 16.8c-1.1.5-2.2.8-3.5 1 1.2-.8 2.2-1.9 2.7-3.3-1.2.7-2.5 1.2-3.8 1.5-1.1-1.2-2.7-1.9-4.4-1.9-3.3 0-6.1 2.7-6.1 6.1 0 .5.1.9.2 1.4-5-.2-9.5-2.7-12.5-6.3-.5.7-.8 1.7-.8 2.8 0 2.1 1.1 4 2.7 5-1 0-1.9-.3-2.7-.8v.1c0 2.9 2.1 5.4 4.9 5.9-.5.1-1 .2-1.6.2-.4 0-.8 0-1.1-.1.8 2.4 3 4.2 5.7 4.2-2.1 1.6-4.7 2.6-7.5 2.6-.5 0-1 0-1.4-.1 2.4 1.9 5.6 2.9 9 2.9 11.1 0 17.2-9.2 17.2-17.2V20c1.2-.9 2.2-1.9 3-3.2z" />
                  </svg>
                  <span className="align-baseline lg:visible xl:visible md:visible invisible">
                    twitter.com/rizafahmi22
                  </span>
                </a>
              </li>
              <li className="py-3 inline-block">
                <a
                  href="https://facebook.com/rizafahmi"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block no-underline"
                >
                  <svg
                    id="ei-sc-facebook-icon"
                    className="align-middle h-6 inline-block fill-current"
                    viewBox="0 0 50 50"
                    width="15%"
                    height="15%"
                  >
                    <path d="M26 20v-3c0-1.3.3-2 2.4-2H31v-5h-4c-5 0-7 3.3-7 7v3h-4v5h4v15h6V25h4.4l.6-5h-5z" />
                  </svg>
                  <span className="align-baseline lg:visible xl:visible md:visible invisible">
                    facebook.com/rizafahmi
                  </span>
                </a>
              </li>
              <li className="py-3 inline-block">
                <a
                  href="https://instagram.com/rizafahmi"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block no-underline"
                >
                  <svg
                    id="ei-sc-instagram-icon"
                    viewBox="0 0 50 50"
                    className="align-middle h-6 inline-block fill-current"
                    width="15%"
                    height="15%"
                  >
                    <path d="M25 12c-3.53 0-3.973.015-5.36.078-1.384.063-2.329.283-3.156.604a6.372 6.372 0 0 0-2.302 1.5 6.372 6.372 0 0 0-1.5 2.303c-.321.826-.54 1.771-.604 3.155C12.015 21.027 12 21.47 12 25c0 3.53.015 3.973.078 5.36.063 1.384.283 2.329.604 3.155.333.855.777 1.58 1.5 2.303a6.372 6.372 0 0 0 2.302 1.5c.827.32 1.772.54 3.156.604 1.387.063 1.83.078 5.36.078 3.53 0 3.973-.015 5.36-.078 1.384-.063 2.329-.283 3.155-.604a6.371 6.371 0 0 0 2.303-1.5 6.372 6.372 0 0 0 1.5-2.303c.32-.826.54-1.771.604-3.155.063-1.387.078-1.83.078-5.36 0-3.53-.015-3.973-.078-5.36-.063-1.384-.283-2.329-.605-3.155a6.372 6.372 0 0 0-1.499-2.303 6.371 6.371 0 0 0-2.303-1.5c-.826-.32-1.771-.54-3.155-.604C28.973 12.015 28.53 12 25 12m0 2.342c3.471 0 3.882.014 5.253.076 1.267.058 1.956.27 2.414.448.607.236 1.04.517 1.495.972.455.455.736.888.972 1.495.178.458.39 1.146.448 2.414.062 1.37.076 1.782.076 5.253s-.014 3.882-.076 5.253c-.058 1.268-.27 1.956-.448 2.414a4.028 4.028 0 0 1-.972 1.495 4.027 4.027 0 0 1-1.495.972c-.458.178-1.147.39-2.414.448-1.37.062-1.782.076-5.253.076s-3.883-.014-5.253-.076c-1.268-.058-1.956-.27-2.414-.448a4.027 4.027 0 0 1-1.495-.972 4.03 4.03 0 0 1-.972-1.495c-.178-.458-.39-1.146-.448-2.414-.062-1.37-.076-1.782-.076-5.253s.014-3.882.076-5.253c.058-1.268.27-1.956.448-2.414.236-.607.517-1.04.972-1.495a4.028 4.028 0 0 1 1.495-.972c.458-.178 1.146-.39 2.414-.448 1.37-.062 1.782-.076 5.253-.076" />
                    <path d="M25 18a7 7 0 1 0 0 14 7 7 0 0 0 0-14m0 11.5a4.5 4.5 0 1 1 0-9 4.5 4.5 0 0 1 0 9m8.7-11.4a1.6 1.6 0 1 1-3.2 0 1.6 1.6 0 0 1 3.2 0" />
                  </svg>
                  <span className="md:visible align-baseline lg:visible xl:visible invisible">
                    instagram.com/rizafahmi
                  </span>
                </a>
              </li>
              <li className="py-3 inline-block">
                <a
                  href="https://linkedin.com/in/rizafahmi"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block no-underline"
                >
                  <svg
                    className="align-middle h-6 inline-block fill-current"
                    id="ei-sc-linkedin-icon"
                    viewBox="0 0 50 50"
                    width="15%"
                    height="15%"
                  >
                    <path d="M36.1 12H13.9c-1.1 0-1.9.8-1.9 1.9v22.2c0 1 .9 1.9 1.9 1.9h22.2c1.1 0 1.9-.8 1.9-1.9V13.9c0-1.1-.9-1.9-1.9-1.9zM20 34h-4V22h4v12zm-2-13.6c-1.3 0-2.4-1.1-2.4-2.4 0-1.3 1.1-2.4 2.4-2.4 1.3 0 2.4 1.1 2.4 2.4 0 1.3-1.1 2.4-2.4 2.4zM34 34h-4v-6c0-1.6-.4-3.2-2-3.2s-2 1.6-2 3.2v6h-4V22h4v1.4h.2c.5-1 1.8-1.8 3.3-1.8 3.7 0 4.5 2.4 4.5 5.4v7z" />
                  </svg>
                  <span className="md:visible align-baseline lg:visible xl:visible invisible">
                    linkedin.com/in/rizafahmi
                  </span>
                </a>
              </li>
              <li className="py-3 inline-block">
                <a
                  href="https://github.com/rizafahmi"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block no-underline"
                >
                  <svg
                    className="align-middle h-6 inline-block fill-current"
                    id="ei-sc-github-icon"
                    viewBox="0 0 50 50"
                    width="15%"
                    height="15%"
                  >
                    <path d="M25 10c-8.3 0-15 6.7-15 15 0 6.6 4.3 12.2 10.3 14.2.8.1 1-.3 1-.7v-2.6c-4.2.9-5.1-2-5.1-2-.7-1.7-1.7-2.2-1.7-2.2-1.4-.9.1-.9.1-.9 1.5.1 2.3 1.5 2.3 1.5 1.3 2.3 3.5 1.6 4.4 1.2.1-1 .5-1.6 1-2-3.3-.4-6.8-1.7-6.8-7.4 0-1.6.6-3 1.5-4-.2-.4-.7-1.9.1-4 0 0 1.3-.4 4.1 1.5 1.2-.3 2.5-.5 3.8-.5 1.3 0 2.6.2 3.8.5 2.9-1.9 4.1-1.5 4.1-1.5.8 2.1.3 3.6.1 4 1 1 1.5 2.4 1.5 4 0 5.8-3.5 7-6.8 7.4.5.5 1 1.4 1 2.8v4.1c0 .4.3.9 1 .7 6-2 10.2-7.6 10.2-14.2C40 16.7 33.3 10 25 10z" />
                  </svg>
                  <span className="md:visible align-baseline lg:visible xl:visible invisible">
                    github.com/rizafahmi
                  </span>
                </a>
              </li>
              <li className="py-3 inline-block">
                <a
                  href="https://youtube.com/rizafahmi"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block no-underline"
                >
                  <svg
                    className="align-middle h-6 inline-block fill-current"
                    id="ei-sc-youtube-icon"
                    viewBox="0 0 50 50"
                    width="15%"
                    height="15%"
                  >
                    <path d="M39.7 18.6s-.3-2.1-1.2-3c-1.1-1.2-2.4-1.2-3-1.3C31.3 14 25 14 25 14s-6.3 0-10.5.3c-.6.1-1.9.1-3 1.3-.9.9-1.2 3-1.2 3S10 21 10 23.4v2.2c0 2.4.3 4.9.3 4.9s.3 2.1 1.2 3c1.1 1.2 2.6 1.2 3.3 1.3 2.4.1 10.2.2 10.2.2s6.3 0 10.5-.3c.6-.1 1.9-.1 3-1.3.9-.9 1.2-3 1.2-3s.3-2.4.3-4.8v-2.2c0-2.4-.3-4.8-.3-4.8zm-17.8 9.8V20l8.1 4.2-8.1 4.2z" />
                  </svg>
                  <span className="md:visible align-baseline lg:visible xl:visible invisible">
                    youtube.com/rizafahmi
                  </span>
                </a>
              </li>
              <li className="py-3 inline-block">
                <a
                  href="https://emailoctopus.com/lists/c26e1c25-0833-11e9-a3c9-06b79b628af2/forms/subscribe"
                  rel="noopener noreferrer"
                  className="inline-block no-underline"
                >
                  <svg
                    className="align-middle h-6 inline-block fill-current"
                    id="ei-envelope-icon"
                    viewBox="0 0 50 50"
                    width="15%"
                    height="15%"
                  >
                    <path
                      opacity=".9"
                      d="M31.796 24.244l9.97 9.97-1.415 1.414-9.97-9.97z"
                    />
                    <path
                      opacity=".9"
                      d="M18.278 24.287l1.414 1.414-9.9 9.9-1.414-1.41z"
                    />
                    <path d="M25 29.9c-1.5 0-3.1-.6-4.2-1.8L8.3 15.7l1.4-1.4 12.5 12.5c1.6 1.6 4.1 1.6 5.7 0l12.5-12.5 1.4 1.4-12.6 12.5c-1.1 1.1-2.7 1.7-4.2 1.7z" />
                    <path d="M39 38H11c-1.7 0-3-1.3-3-3V15c0-1.7 1.3-3 3-3h28c1.7 0 3 1.3 3 3v20c0 1.7-1.3 3-3 3zM11 14c-.6 0-1 .4-1 1v20c0 .6.4 1 1 1h28c.6 0 1-.4 1-1V15c0-.6-.4-1-1-1H11z" />
                  </svg>
                  <span className="md:visible align-baseline lg:visible xl:visible invisible">
                    Email Newsletter
                  </span>
                </a>
              </li>
              <li className="py-3 inline-block">
                <a href="/rss.xml" className="inline-block no-underline">
                  <svg
                    className="align-middle h-6 inline-block fill-current"
                    id="ei-link-icon"
                    viewBox="0 0 50 50"
                    width="15%"
                    height="15%"
                  >
                    <path d="M24 30.2c0 .2.1.5.1.8 0 1.4-.5 2.6-1.5 3.6l-2 2c-1 1-2.2 1.5-3.6 1.5-2.8 0-5.1-2.3-5.1-5.1 0-1.4.5-2.6 1.5-3.6l2-2c1-1 2.2-1.5 3.6-1.5.3 0 .5 0 .8.1l1.5-1.5c-.7-.3-1.5-.4-2.3-.4-1.9 0-3.6.7-4.9 2l-2 2c-1.3 1.3-2 3-2 4.9 0 3.8 3.1 6.9 6.9 6.9 1.9 0 3.6-.7 4.9-2l2-2c1.3-1.3 2-3 2-4.9 0-.8-.1-1.6-.4-2.3L24 30.2z" />
                    <path d="M33 10.1c-1.9 0-3.6.7-4.9 2l-2 2c-1.3 1.3-2 3-2 4.9 0 .8.1 1.6.4 2.3l1.5-1.5c0-.2-.1-.5-.1-.8 0-1.4.5-2.6 1.5-3.6l2-2c1-1 2.2-1.5 3.6-1.5 2.8 0 5.1 2.3 5.1 5.1 0 1.4-.5 2.6-1.5 3.6l-2 2c-1 1-2.2 1.5-3.6 1.5-.3 0-.5 0-.8-.1l-1.5 1.5c.7.3 1.5.4 2.3.4 1.9 0 3.6-.7 4.9-2l2-2c1.3-1.3 2-3 2-4.9 0-3.8-3.1-6.9-6.9-6.9z" />
                    <path d="M20 31c-.3 0-.5-.1-.7-.3-.4-.4-.4-1 0-1.4l10-10c.4-.4 1-.4 1.4 0s.4 1 0 1.4l-10 10c-.2.2-.4.3-.7.3z" />
                  </svg>
                  <span className="md:visible align-baseline lg:visible xl:visible invisible">
                    RSS Feed
                  </span>
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="w-3/5 align-top">
          <h2 className="inline-block pt-3 pb-3">Hi, I'm Riza.</h2>
          <p className="leading-loose py-3">
            Right now, I{"'"}m building coding school with my friend{' '}
            <a
              href="http://ronishak.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              Ronald Ishak
            </a>
            . It
            {"'"}s called{' '}
            <a
              href="https://hacktiv8.com/"
              target="_blank"
              rel="noopener noreferrer"
            >
              HACKTIV8
            </a>
            . If you need some guidance on programming and career in software
            development, let me know!
          </p>
          <p className="leading-loose py-3">
            I run{' '}
            <a
              href="https://www.jakartajs.org/"
              target="_blank"
              rel="noopener noreferrer"
            >
              JakartaJS
            </a>
            , a community for JavaScript Ninja nearby Jakarta area. We held
            meetup every single month. I also run{' '}
            <a
              href="https://www.facebook.com/groups/DevCJakarta/"
              target="_blank"
              rel="noopener noreferrer"
            >
              Facebook
              {"'"}s Developer Circles Jakarta
            </a>
            . So if you are nearby Jakarta, please do come or become our speaker
            at the meetup.
          </p>
          <p className="leading-loose py-3">
            In my spare time, I also produce a podcast called{' '}
            <a
              href="https://ceritanyadeveloper.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              Ceritanya Developer Podcast
            </a>
            . I interviewed prolific developers, software engineers, and
            technology person from Indonesia. To motivate, inspire and encourage
            young developers to become a great one.
          </p>
          <div
            id="subscription-box"
            className="leading-loose py-3 my-6 px-3 border border-grey-darker border-solid"
          >
            Ocassionally, I send an email to my list. I talk about all
            tech-related, making stuff, tips and tricks for developers, and
            interesting events.{' '}
            <form method="POST" className="">
              <input
                className="mr-6 shadow appearence-none border rounded py-3 px-3 my-2 leading-tight focus:outline-none focus:shadow-outline"
                type="email"
                name="email"
                id="email"
                required={true}
                placeholder="me@email.com"
              />
              <a
                href="https://emailoctopus.com/lists/c26e1c25-0833-11e9-a3c9-06b79b628af2/forms/subscribe"
                className="bg-yellow-light hover:bg-grey-darker text-yellow-darker font-bold py-3 px-3 rounded focus:outline-none focus:shadow-outline"
              >
                Subscribe
              </a>
            </form>
          </div>
          <p className="leading-loose py-3">
            Also, I do a screencast for{' '}
            <a
              href="https://randomscreencast.com/"
              target="_blank"
              rel="noopener noreferrer"
            >
              Random Screencast
            </a>{' '}
            on random technology and random time. I also experiment with{' '}
            <a href="/live" rel="noopener noreferrer">
              live streaming
            </a>{' '}
            format recently.
          </p>
          <p className="leading-loose py-3">
            Recently I run a publication called{' '}
            <a
              href="https://medium.com/pujanggateknologi"
              target="_blank"
              rel="noopener noreferrer"
            >
              Pujangga Teknologi
            </a>{' '}
            to produce technology related, awesome quality, written content in
            Bahasa Indonesia, weekly basis.
          </p>
          <div className="leading-loose py-3">
            <h2>
              The Best Things I{"'"}
              ve Published
            </h2>
            <ul>
              <li>
                <a
                  href="/2016/09/02/jadilah-developer-dengan-faktor-x/"
                  rel="noopener noreferrer"
                >
                  Jadilah Developer Dengan Faktor X
                </a>{' '}
                -- This article featured in{' '}
                <a
                  href="https://id.techinasia.com/talk/tip-menjadi-developer-sukses"
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  TechInAsia
                </a>
                , and{' '}
                <a
                  href="https://blog.hacktiv8.com/jadilah-developer-dengan-faktor-x/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  blog Hacktiv8
                </a>
                .
              </li>
              <li>
                <a
                  href="https://id.techinasia.com/podcast-tech-in-asia-23-oktober-2015"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  AppsCoast Special Episode with TechInAsia Podcast
                </a>{' '}
                -- This special episode in collaboration with{' '}
                <a
                  href="https://id.techinasia.com"
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  TechInAsia Indonesia
                </a>{' '}
                covered two similar hot startups at that time:{' '}
                <a
                  href="https://id.techinasia.com/aplikasi-android-asisten-pribadi-virtual-halo-diana"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Halo Diana
                </a>{' '}
                and{' '}
                <a
                  href="https://id.techinasia.com/review-yesboss"
                  target="_blank"
                  rel="noreferrer noopener"
                >
                  YesBoss
                </a>
                !
              </li>
              <li>
                <a
                  href="2016/07/20/indonesia-butuh-lebih-banyak-developer/"
                  rel="noopener noreferrer"
                >
                  Indonesia Butuh Lebih Banyak Developer Kan?!
                </a>{' '}
                -- Random thought of mine about developer hiring crunch that
                happens in Indonesia. Also featured in{' '}
                <a
                  href="https://blog.hacktiv8.com/indonesia-butuh-lebih-banyak-developer-kan/"
                  target="_blank"
                  rel="noreferrer noopener"
                >
                  HACKTIV8 blog
                </a>
                .
              </li>
              <li>
                <a
                  href="https://ceritanyadeveloper.com/dicky-arinal/"
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  devs[0] = Dicky Arinal, Ceritanya Developer Podcast
                </a>{' '}
                -- Interviewed one elegant software developer who lives and
                works offshore. He
                {"'"}s a great teacher and mentor who focus on fundamental
                things.
              </li>
              <li>
                <a
                  href="https://randomscreencast.com/15-vim-config/"
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  VIM Configuration From Scratch
                </a>{' '}
                -- This screencast episode explains how to setup your VIM editor
                from scratch.
              </li>
            </ul>
          </div>
        </div>
      </div>
    </Layout>
  );

export default IndexPage;

export const pageQuery = graphql`
  query MyQuery {
    allMarkdownRemark(limit: 5, sort: { fields: fields___slug, order: DESC }) {
      edges {
        node {
          fields {
            slug
          }
          frontmatter {
            title
          }
        }
      }
    }
  }
`;
