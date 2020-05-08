import React from 'react';

import Layout from '../components/layout';

const BukuExpress = () => {
  return (
    <Layout>
      <div className="align-top text-center">
        <h1 className="inline-block pt-3 pb-3">HALO Web Server</h1>
        <h2>Dengan Express dan NodeJS</h2>
      </div>
      <div className="align-top">
        <div className="leading-loose py-3">
          <p>
            Saya sedang dalam proses menyusun sebuah buku elektronik (ebook)
            tentang bagaimana membuat aplikasi web menggunakan{' '}
            <a
              href="https://nodejs.org"
              target="_blank"
              rel="noopener noreferrer"
            >
              Node.js
            </a>
            ,{' '}
            <a
              href="https://expressjs.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              Express{' '}
            </a>
            dan database{' '}
            <a
              href="https://www.postgresql.org/"
              target="_blank"
              rel="noopener noreferrer"
            >
              PostgreSQL
            </a>{' '}
            dengan cara membuat sesuatu. Kita akan sama-sama membuat aplikasi
            "Express Notes", sebuah aplikasi untuk catatan online.
          </p>
          <div
            id="subscription-box"
            className="leading-loose py-3 my-6 px-3 border border-grey-darker border-solid"
          >
            <h3>Harga</h3>
            <ul>
              <li className="text-xl">
                <strong>Pre-release</strong>:{' '}
                <span className="bg-yellow-light text-yellow-darker p-2">
                  IDR 75.000
                </span>
              </li>
              <li>
                <strike>Normal: IDR 150.000</strike>
              </li>
            </ul>
          </div>
          <h3>
            Silakan menuju ke halaman{' '}
            <a
              href="https://karyakarsa.com/rizafahmi/buku-halo-web-server-dengan-express-dan-nodejs"
              target="_blank"
              rel="noopener noreferrer"
            >
              karyakarsa berikut
            </a>{' '}
            untuk melakukan pembayaran. Pembayaran dapat dilakukan via gopay,
            ovo ataupun transfer bank. Butuh informasi lebih lanjut silakan
            hubungi via{' '}
            <a
              href="https://t.me/rizafahmi"
              target="_blank"
              rel="noopener noreferrer"
            >
              telegram
            </a>{' '}
            di{' '}
            <a
              href="https://t.me/rizafahmi"
              target="_blank"
              rel="noopener noreferrer"
            >
              t.me/rizafahmi
            </a>
            .
          </h3>
          <hr />
          <h4>Daftar Isi</h4>
          <p>
            <ul>
              <li>Chapter 1 Aplikasi Yang Akan Kita Buat</li>
              <li>Chapter 2 Keahlian Yang Dibutuhkan</li>
              <li>Chapter 3 Tentang Node.js</li>
              <li>Chapter 4 HTTP Server</li>
              <li>Chapter 5 Node.js Server Framework</li>
              <li>Chapter 6 Kenapa Express</li>
              <li>Chapter 7 Fitur-fitur Express</li>
              <li>Chapter 8 Mulai Menggunakan Express</li>
              <li>Chapter 9 Fitur Dasar Express Notes</li>
              <li>Chapter 10 Koneksi Database</li>
              <li>Chapter 11 Middleware</li>
              <li>Chapter 12 Modul User dan Otentikasi</li>
              <li>Chapter 13 Deployment</li>
            </ul>
          </p>
        </div>
      </div>
    </Layout>
  );
};

export default BukuExpress;
