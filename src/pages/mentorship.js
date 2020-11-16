import React from 'react';

import Layout from '../components/layout';
import thumbnail from '../images/Phoenix youtube thumbnail.png';

const Mentorship = () => {
  return (
    <Layout>
      <div className="align-top text-center">
        <h1 className="inline-block pt-3 pb-3">Ceritanya Mentorship</h1>
      </div>
      <div className="align-top">
        <div className="leading-loose py-3">
          <p>
            Saya sedang dalam proses menyusun sebuah program mentorship online.
            Formatnya:
          </p>
          <ul>
            <li>
              <em>
                <strong>Self learning</strong>
              </em>{' '}
              dengan arahan mentor.
            </li>
            <li>
              <em>
                <strong>Project-based</strong> learning
              </em>
              .
            </li>
            <li>
              <em>Handcrafted learning roadmap</em>
            </li>
          </ul>
          <p>
            Silakan isi form ketertarikan di{' '}
            <a href="https://play.feedloop.io/q/mentorship" target="_blank">
              form berikut
            </a>
            .
          </p>
          <div
            id="subscription-box"
            className="leading-loose py-3 my-6 px-3 border border-grey-darker border-solid"
          >
            <h3>Investasi</h3>
            <div>
              <strong>Untuk 7 orang pertama yang terpilih</strong>:
              <span className="bg-yellow-light text-yellow-darker p-2">
                IDR 150.000
              </span>
            </div>
            <div>
              Setelahnya akan menjadi: <strike>IDR 350.000</strike>.
            </div>
          </div>
          <h3>Yang akan didapat</h3>
          <ul>
            <li>
              <em>Learning roadmap</em>
            </li>
            <li>1 sesi mentorship</li>
            <li>Butuh sesi mentorship tambahan? Harga yang sama berlaku</li>
          </ul>
          <h3>Langkah-langkah pendaftaran</h3>
          <ol>
            <li>
              Mengisi{' '}
              <a href="https://play.feedloop.io/q/mentorship" target="_blank">
                form ketertarikan
              </a>
            </li>
            <li>Form akan dievaluasi</li>
            <li>
              Keputusan apakah proses dapat dilanjutkan akan dikirimkan melalui
              email
            </li>
            <li>Mentee membayar uang muka</li>
            <li>
              Mentor mempersiapkan materi ajar dan <em>roadmap</em>
            </li>
            <li>Mentee mempelajari materi yang diberikan</li>
            <li>Mentee menentukan jadwal untuk sesi mentorship pertama</li>
            <li>Melakukan sesi mentorship</li>
            <li>Mentee melanjutkan proses belajar</li>
            <li>Jika dibutuhkan, mentee dapat meminta sesi mentorship</li>
            <li>Proses pembayaran sesi mentorship</li>
            <li>Melakukan sesi mentorship</li>
            <li>Pembelajaran selesai ditutup dengan mengerjakan project</li>
            <li>Mentee dan mentor mengevaluasi hasil belajar</li>
          </ol>
          <h3>Topik Mentorship</h3>
          <ul>
            <li>Frontend</li>
            <li>Backend</li>
            <li>DevOps basic</li>
            <li>Personal branding</li>
            <li>Intro to programming</li>
            <li>Learning how to learn</li>
            <li>Mobile</li>
            <li>Git</li>
            <li>Open source</li>
            <li>Developer tools, Vim, Git, zsh, etc</li>
            <li>Scaling</li>
            <li>Arsitektur</li>
            <li>Dan lain-lain, bisa request di isian form</li>
          </ul>
          <h3>Catatan</h3>
          <p>
            Bentuk dan formatnya masih akan terus digodok dan terbuka untuk
            didiskusikan. Biasanya kita mendiskusikannya di sesi livestreaming
            via{' '}
            <a href="https://youtu.be/gMi8sxQz6ls?t=4181" target="_blank">
              youtube
            </a>
            .
          </p>
          <a href="https://youtu.be/gMi8sxQz6ls?t=4181" target="_blank">
            <img src={thumbnail} />
          </a>
          <p>
            Catatan hasil <em>brainstorm</em> bisa dilihat di{' '}
            <a
              href="https://www.notion.so/rizafahmi/Mentoring-Online-a062733e999743d59ca00c1757309b47"
              target="_blank"
            >
              Notion
            </a>
            .
          </p>
        </div>
      </div>
    </Layout>
  );
};

export default Mentorship;
