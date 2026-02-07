---
title: "Rangkuman Acara Developer Circles Jakarta Build Day 2018"
date: 2018-07-12
permalink: /2018/07/12/rangkuman-acara-devc-jakarta-build-day-2018/
cover: "./devc.jpeg"
layout: tulisan
tags:
  - catatan
  - komunitas
  - rangkuman

---

## Meetup DeveloperCircles Jakarta Build Day 2018

Di awal bulan juli ini [DevC Jakarta](https://www.facebook.com/groups/DevCJakarta/) baru saja selesai mengadakan meetup yang secara regular dilakukan setiap bulannya. Berbeda dengan meetup di bulan sebelumnya, meetup kali ini cukup spesial. Ya, DevC Jakarta menggelar sebuah _event_ global namanya [ Build Day 2018 ](https://developers.facebook.com/blog/post/2018/05/01/developer-circles-community-challenge/). DevC diseluruh dunia sudah dan akan menggelar perhelatan serupa.

Build Day sendiri merupakan inisiasi dari. Facebook dalam rangka ‘merangsang’ dan menantang developer dan makers untuk membuat sebuah karya dengan tema community building. Seperti yang disampaikan di [F8 Developer Conference](https://medium.com/@rizafahmi22/f8-silicon-valley-trip-day-1-4b501b0bfd8a) beberapa waktu yang lalu.

Dan karena ini adalah momen spesial, DevC Jakarta melakukannya dengan cara yang spesial pula. Jika _meetup_ bulanan dilakukan satu hari, kali ini kita melakukannya dua hari berturut-turut! Hari pertama kita menggelar acara _TechTalk_ untuk memberi inspirasi dan aspirasi disusul dengan acara Ideation untuk memformulasikan ide menjadi sebuah produk yang siap untuk dikembangkan. Tujuan akhirnya adalah mengajak teman-teman developer dan _maker_ untuk mengikuti [Build Day](https://devcommunitychallenge.devpost.com/) yang diikuti oleh ribuan orang diseluruh dunia.

Lebih spesial lagi, TechTalk kali ini mendatangkan dua orang pembicara keren. Mereka berdua adalah developer Facebook yang berasal dari Indonesia! TechTalk dibuka oleh Mas Ziyad Bazed yang berbagi _insight_ tentang bagaimana Facebook membangun aplikasi yang _secure_. Dilanjutkan dengan Mas Riandy yang memberikan tips dan trik mengembangkan chatbot terutama untuk platform Messenger.

## Insight Menarik Dari Dua Engineer Facebook Asal Indonesia

Mas Ziyad memulai presentasi dengan memperkenalkan dirinya sebagai Engineer yang sudah berkarya selama kurang lebih empat tahun di Facebook dan juga memperlihatkan _screenshot_ dari aplikasi Facebook Lite, sebuah aplikasi Facebook versi ringan untuk mengakomodir user dengan keterbatasan data dan device. Kelebihan dari Facebook Lite ini adalah mampu menghemat data dan lebih ramah terutama dalam penggunaan memori handphone.

Saya jadi teringat bagaimana Mas Ziyad berbagi ilmu ketika mengisi acara serupa tahun 2017 silam. Saat itu Mas Ziyad berbicara tentang teknologi dibelakang Facebook Lite dan seputar development aplikasi di platform Android.

![Sesi Ziyad Bazed](/assets/images/rangkuman/ziyad.jpeg)_Sesi Ziyad Bazed_

Masuk ke topik utama, Mas Ziyad memaparkan beberapa hal terkait kultur pengembangan aplikasi di internal Facebook seperti kultur code review, continuous delivery, monorepo dan mono branch hingga perjalanan dari perkembangan library/framework yang digunakan oleh facebook dari awal hingga saat ini. Seperti yang kita ketahui bersama, Facebook berawal dari sebuah media sosial online hingga sekarang memiliki berbagai produk lainnya seperti Instagram, Oculus, WhatsApp, Messenger dan lain sebagainya. Berikut beberapa hal-hal menarik yang saya dapatkan:

- Facebook menerapkan code review (tentu saja)

- Facebook juga melakukan crowdsourcing untuk membasmi bugs (bountyhunter) dan mengeluarkan sekitar 6 juta dolar untuk itu

- Facebook menerapkan* open codebase* dan monorepo sehingga semua code dari seluruh produk facebook dapat diakses oleh seluruh karyawan facebook dan tentunya dapat berkontribusi kepada produk yang diinginkan.

- Facebook juga menerapkan mono branch. Hanya branch master. Sedikit mengejutkan karena biasanya untuk best practice ada beberapa branch yang digunakan seperti devel atau development branch. Dengan menerapkan mono branch, proses code review dan merge harus benar-benar ‘rapi’ sehingga kemungkinan yang dapat merusak branch master harus diminimalisir.

- Seluruh produk Facebook menggunakan stack yang minimal. Produk yang menggunakan konsep _microservice_ atau _micro frontend_ dengan teknologi yang berbeda hampir tidak ada. Stack yang digunakan cukup _straightforward_ dan _no brainer_.

- Seperti yang kita ketahui bersama, Facebook menggunakan PHP saat pengembangan awal. Setelah beberapa waktu, Facebook kemudian mengembangkan sebuah bahasa baru, [HackLang](https://hacklang.org/) yang merupakan pengembangan lebih lengkap dari PHP, terutama beberapa fitur yang dibutuhkan Facebook dan belum tersedia di PHP saat itu dan juga ditambah dengan beberapa tweak sehingga mampu mencapai performa yang diinginkan oleh Facebook.

- Sudah seperti rahasia umum di kalangan developer Facebook, ketika ada indikasi bahwa yang mereka lakukan adalah hal berbahaya biasanya para developer ini menandainya dengan membuat variable yang menunjukkan hal tersebut. Misalnya saja `dangerouslySetInnerHTML`, `UNSAFE_componentWillMount` dan lain sebagainya.

- Tim _engineering_ Facebook tidak memiliki tim _tester_ atau QA. _Engineer_ sendiri yang bertanggungjawab melakukan testing terhadap _code_-nya.

## Building Your Chatbot on Messenger

Sesi TechTalk kemudian dilanjutkan oleh Mas Riandy yang membawakan topik tentang bagaimana dan mengapa membuat messenger bot. Ada lima langkah mudah dalam membuat messenger bot:

1. _Generate access token_

2. Menerima data dengan _webhooks_

3. Mengirimkan data ke Graph API. Bisa menggunakan template seperti _button, generic, receipt, carousel,_ dll.

4. Buat bot kamu semakin mudah ditemukan dengan:

5. _Plugin_ “send to messenger”

6. Shortlink seperti m.me/CNN

7. Messenger code, yang lebih keren dari qr code

8. Persenjatai bot kamu dengan kemampuan bahasa dengan wit.ai

![Sesi Mas Riandy](/assets/images/rangkuman/riandy.jpeg)_Sesi Mas Riandy_

Mas Riandy juga membahas. beberapa fitur keren dari Messenger seperti _card_, _user’s identity_, kemampuan menampilkan web dengan _webview_, _qr code_ yang keren dan beda, dll.

Kemudian Mas Riandy juga membahas tentang bagaimana sebuah bot sebenarnya bekerja di belakang layar. Secara sederhana, sebenarnya hanya menggunakan dua API, yaitu _send_ dan _receive_.

Dan untuk membuat sebuah bot lebih menarik, _bot_ _messenger_ juga dapat dipersenjatai dengan teknik Natural Language Processing atau NLP dengan bantuan [wit.ai](https://wit.ai/) ataupun produk sejenis seperti [dialogflow](https://dialogflow.com/), dan lain sebagainya.

## Hari kedua

Beberapa hari sebelum acara dimulai, para peserta yang sudah memiliki ide atau yang belum diminta untuk mengisi form pendaftaran. Dari 105 pendaftar, ada 40 peserta terpilih yang berkesempatan mengikuti acara di hari kedua yang kita namakan Ideathon. Konsepnya mirip dengan hackathon, bedanya adalah ini baru tahap formulasi ide jadi belum ada proses development aplikasi di tahapan ini.

![Sesi mentoring Ideathon](/assets/images/rangkuman/mentoring.jpeg)_Sesi mentoring Ideathon_

Tujuan Ideathon ini adalah untuk melatih kreatifitas sekaligus mendorong teman-teman developer dan maker untuk mengikuti Build Day yang diadakan secara global oleh Facebook.

Dan agar kesempatan menang lebih tinggi, Ideathon juga menghadirkan mentor-mentor dan juri ternama. Berikut beberapa diantaranya:

- Russel Siregar, Product Manager at Quipper

- Rosidi Pratama, Product Manager at Kumparan

- Rian Agustama, Product Manager at Bukalapak

- Bima Arafah, Head of Product at Kumparan

- I Gede Agastya Darma Laksana, Engineer at Kumparan

- Winner Manurung, Product Manager at Blibli.com

- Irvan Adhitya, Engineer at Style Theory

- Willy Anderson, Product Manager at Blibli.com

- Rizki Ridha, UX Researcher at Blibli.com

- Irfan Maulana, Engineer at bizzy

- Alfandio Greshaldi, UX Researcher at Blibli.com

- Abdurrachman Mappuji, Engineer at MidTrans

Mentor-mentor kemudian dibagi kedalam grup-grup dan memberikan _insight_ terhadap ide awal peserta hingga mengarahkan mereka untuk memikirkan fitur-fitur dari berbagai sisi baik itu produk, UI/UX hingga teknologi yang digunakan.

Ideathon ditutup dengan presentasi dari seluruh kelompok dan ada dua yang mendapatkan award: Best Idea dan Favorite Idea pilihan komunitas.

Berikut adalah ketujuh ide yang masuk babak penjurian:

- Termentori — [https://m.facebook.com/groups/313087542449350?view=permalink&id=468718680219568](https://m.facebook.com/groups/313087542449350?view=permalink&id=468718680219568)

- Taninesia — [https://m.facebook.com/groups/313087542449350?view=permalink&id=468719696886133](https://m.facebook.com/groups/313087542449350?view=permalink&id=468719696886133)

- Goyong — [https://m.facebook.com/groups/313087542449350?view=permalink&id=468749936883109](https://m.facebook.com/groups/313087542449350?view=permalink&id=468749936883109)

- Traveasy — [https://m.facebook.com/groups/313087542449350?view=permalink&id=468743473550422](https://m.facebook.com/groups/313087542449350?view=permalink&id=468743473550422)

- Doktersiaga — [https://www.facebook.com/groups/DevCJakarta/permalink/468747403550029/](https://www.facebook.com/groups/DevCJakarta/permalink/468747403550029/)

- Vigibot — [https://m.facebook.com/groups/313087542449350?view=permalink&id=468722373552532](https://m.facebook.com/groups/313087542449350?view=permalink&id=468722373552532)

- Educare — [https://m.facebook.com/groups/313087542449350?view=permalink&id=468721536885949](https://m.facebook.com/groups/313087542449350?view=permalink&id=468721536885949)

Dan pemenang _best idea_ adalah DoktorSiaga, tim yang beranggotakan tiga orang: Fatah Iskandar Akbar, Fadelli Yahya Polosoro, dan Erwin RA.

Sedangkan ide favorit jatuh kepada tim Taninesia berdasarkan jumlah like dan komentar yang berhasil mereka kumpulkan di Facebook. Tim Taninesia sendiri, yang beranggotakan enam orang, memiliki fokus pada para petani Indonesia. Mirip dengan DoktorSiaga, Taninesia juga merupakan chatbot.

Selamat buat tim yang menang. Yang belum berhasil tetap bisa mengikuti Facebook Community Challenge 2018 yang deadline-nya tanggal 26 Juli 2018. Hadiah 30 ribu US dolar menunggu!

Sebagai informasi tambahan, produk buatan teman-teman dari bandung dengan nama BurhanBot berhasil mendapatkan peringkat ketiga di perhelatan yang sama di tahun lalu.

Ditunggu kehadirannya di even DeveloperCircles berikutnya dan buat teman-teman yang tertarik untuk bergabung dengan komunitas DeveloperCircles Jakarta, silakan gabung di grup kita di [https://www.facebook.com/groups/DevCJakarta/.](https://www.facebook.com/groups/DevCJakarta/.)
