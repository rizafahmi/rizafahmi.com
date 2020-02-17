import React from 'react';

const Menu = () => (
  <div className="bg-grey-lightest">
    <div className={`text-center max-w-xl mx-auto p-4 md:p-8 text-sm`}>
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
          <a href="/newsletter" rel="noopener noreferrer">
            Newsletter
          </a>
        </li>
        <li className="mx-4">
          <a
            className="bg-yellow-light hover:bg-grey-light p-1"
            href="/bukuexpress"
          >
            Book
          </a>
        </li>
        <li className="mx-4">
          <a
            className="hover:bg-grey-light p-1"
            href="https://karyakarsa.com/rizafahmi"
            rel="noopener noreferrer"
            target="_blank"
          >
            Support
          </a>
        </li>
      </ul>
    </div>
  </div>
);

export default Menu;
