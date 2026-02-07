---
title: "F8 Silicon Valley Trip Day 2"
date: 2018-05-21
permalink: /2018/05/21/f8-san-jose-trip-day-2/
cover: ""
layout: tulisan
tags:
  - catatan
  - komunitas
  - konferensi
  - travel

---

Ini adalah cerita berseri tentang perjalanan saya dan teman-teman Facebook Developer Circle Leads ke Silicon Valley dalam rangka mengikuti Facebook F8 Developer Conference. Ikuti dari [ bagian 0 ](/2018/05/08/f8-san-jose-trip-day-0/), dan [ bagian 1 ](/2018/05/14/f8-san-jose-trip-day-1/) supaya mendapatkan jalan ceritanya secara keseluruhan.

Tidak mau salah strategi lagi, F8 hari kedua saya fokuskan untuk menyaksikan berbagai _talk_ yang menarik. Satu hal menarik yang saya perhatikan dari _conference_ ini adalah setiap habis sesi talk, speaker _mojok_ disisi kiri atau kanan panggung dan menantikan beberapa _audience_ yang mau bertegur sapa dan bertanya. Ini hal baru buat saya, terutama _conference_ di Indonesia belum pernah saya melihat hal seperti ini dilakukan. Dan _audience_ juga cukup sopan untuk antri dan bergantian menyapa para pembicara.

## Keynote Hari Kedua

Kembali, jet lag menyerang. Banyak momen terlewat karena tidak tahan menahan kantuk. Untungnya ngga sampai _ngorok_ seperti orang yang berada dua _row_ dari saya 😈. Untuk hari kedua ini keynote dibawakan oleh Chief Technology Officer Facebook, Mike Schroepfer dan beberapa petinggi Facebook lainnya memaparkan tentang teknologi dan inovasi terkini yang dilakukan Facebook.

![Talk by CTO Facebook Mike Schroepfer](/assets/images/f82/1_kGLsZ2WXzljMjkMhh2fIBQ.jpeg)_Talk by CTO Facebook Mike Schroepfer_

Berbeda dengan hari pertama, kali ini saya duduk agak dibelakang karena sedikit telat pada saat masuk ke arena. Dari talk Mike diatas saya baru tersadar bahwa di Facebook, AI sudah digunakan dimana-mana. _AI is everywhere_! Ya ampun, saya yang sempat memilih mata kuliah AI dulu waktu di Binus menyia-nyiakan ilmu yang sebenarnya sudah saya ketahui dari dulu, dari tahun 2002-2003. Selaras yang dikatakan [Eric Nakagawa](https://rizafahmi.com/2018/05/14/f8-silicon-valley-trip-day-1/) yang saya jabarkan di artikel sebelumnya. Saya harus segera _upgrade_ ilmu nih!

Beberapa catatan penting lainnya:

- [PyTorch](https://pytorch.org/), sebuah library Machine Learning rilis versi 1.0.
- [Caffe2](https://caffe2.ai/), sebuah library deep learning juga dirilis.
- [ONNX](https://onnx.ai/), sebuah open platform untuk deep learning model juga dirilis. Hal ini memungkinkan beberapa platform sepert Amazon AWS, Microsoft Azure dan yang lainnya bisa saling berkolaborasi menghasilkan model yang lebih powerful.
- Sebuah web juga dirilis, khusus untuk pengembang AI [https://facebook.ai/developers](https://facebook.ai/developers).

Secara umum visi Facebook sepuluh tahun kedepan adalah AI, Connectivity, VR dan AR. Berikut [link videonya](https://developers.facebook.com/videos/f8-2018/f8-2018-day-2-keynote/).

## Beberapa Talk Menarik

Sehari sebelumnya saya sudah planning untuk menyaksikan talk-talk berikut:

- Duckling: An Overview of the Open Source Probabilistic Parser
- ~~Using Natural Language Processing to Enhance Your Messenger Conversations~~
- ~~Build Your First Messenger Instant Game~~
- How React Native Helps Companies Build Better Mobile Apps
- Building with React Native and React VR: Insights from Instagram and Oculus
- ~~How Camera Effects Helped Us to Grow Our Business~~
- ~~Audio and Speech Understanding System~~
- Investing in Innovators Through Developer Programs

Tapi tidak semua akhirnya bisa saya hadiri karena satu dan lain hal. _Talk_ pertama yang saya hadiri adalah tentang library [Duckling](https://github.com/facebook/duckling). Sebuah library Haskell yang bisa mem-_parsing_ text menjadi data yang lebih terstruktur seperti tanggal dan lainnya. Sayangnya _pace_-nya agak cepat sehingga saya ketinggalan. Dan juga karena koneksi internet yang cukup mengecewakan sehingga keinginan belajar Haskell berhenti ketika gagal menginstal package [haskell-stack](https://docs.haskellstack.org/en/stable/README/). Haha, alasan aja ini mah 😏.

![Install Haskell Stack gagal](/assets/images/f82/1_pjoseGiSS_VOq1dt3CrP2g.jpeg)_Install Haskell Stack gagal_

## React Native Panel Discussion

Kemudian saya menghadiri diskusi panel tentang React Native yang di moderatori oleh [Eric Nakagawa](https://twitter.com/ericnakagawa). Panel terdiri dari [Gina Trapani](https://twitter.com/ginatrapani) Director of Engineering at [Postlight](https://postlight.com/), [Sophie Alpert](https://github.com/sophiebits) Engineering Manager at Facebok, [Brian Leonard](https://twitter.com/bleonard?lang=en) CTO at [TaskRabbit](https://www.taskrabbit.com/), [Adrian Potra](https://www.linkedin.com/in/apotra/) Engineering Manager at [Skype](https://www.skype.com/en/), dan [Kenton Jacobsen](https://twitter.com/kentonjacobsen?lang=en) Director of Engineering at [Vogue](https://www.vogue.com/).

![ReactNative Discussion Panel](/assets/images/f82/1_zLCDavSW83EPIT-lAietKA.jpeg)_ReactNative Discussion Panel_

Seperti yang sudah bisa ditebak, Postlight, Facebook, TaskRabbit, Skype dan Vogue semua menggunakan ReactNative di _production_. Berikut beberapa catatan yang saya dapat dari diskusi panel ini:

- Skype mengunakan [ReactNative](https://facebook.github.io/react-native/) dengan [TypeScript](https://www.typescriptlang.org/). Mereka menggunakan [React](https://reactjs.org/) dan ReactNative untuk _solve cross-platform issue_. Mereka juga menggunakan [ReactXP](https://github.com/Microsoft/reactxp). Untuk hiring, mereka lebih fokus kepada orang-orang dengan tipe generalis.

- TaskRabbit pertama kali menggunakan ReactNative di aplikasi Tasker mereka. Yang tadinya tim mobile disemua platform ada enam orang, setelah menggunakan ReactNative, timnya bisa dipangkas menjadi 2 orang saja!

- Vogue menggunakan ReactNative dan [GraphQL](https://graphql.org/). Di Backend Vogue menggunakan [NodeJS](https://nodejs.org/en/).

- Facebook menggunakan ReactNative dimana-mana. Yang paling besar salah satunya di Facebook Marketplace yang diakses 800 juta orang per bulannya.

- PostLight menggunakan React sangat intensif di web dan mereka hanya punya 1 orang iOS engineer. Dan memilih ReactNative merupakan pilihan yang _no brainer_ buat PostLight. Terutama karena mereka juga banyak bekerjasama dengan instansi-instansi non-profit dengan budget minimal

Setelah diskusi selesai, saya melihat semua narasumber turun dari panggung dan menunggu di sisi panggung untuk _disamperin_ audience. Dan _audience_ juga membentuk antrian yang rapi dan bergantian bertanya atau sekedar _say hi_. Karena kemaren sudah berbincang banyak dengan Eric, saya memutuskan untuk _say hi_ ke [Gina Trapani](https://ginatrapani.org/). Buat yang belum tahu, Gina ini cukup populer dimasanya. Dia pembuat aplikasi [todo.txt](http://todotxt.org/), ex-founder [lifehacker](https://lifehacker.com/), pengisi acara di [twit.tv](https://twit.tv/episodes?credits_people=23), dan masih banyak lagi.

![With Gina Trapani](/assets/images/f82/1_uydj0iEZdDV4YwlIJROfjA.jpeg)_With Gina Trapani_

## ReactNative Dan ReactVR di Instagram dan Oculus

Talk selanjutnya yang saya hadiri berjudul “Building with React Native and React VR: Insights from Instagram and Oculus”. Dibawakan duet oleh [Brian Rosenfeld](https://www.instagram.com/brosenfeld/?hl=en) dari [Instagram](https://instagram.com) dan Mike Armstrong dari [Oculus](https://www.oculus.com/), mereka share apa dan bagaiman ReactNative dan ReactVR digunakan di perusahaan masing-masing.

Inti dari sesi ini adalah meskipun Instagram dan Oculus berasal dari dunia yang berbeda, yang satu adalah aplikasi mobile dan web dan lainnya mengembangkan platform virtual reality, tapi mereka menggunakan _framework_ yang sama, React (padahal katanya React bukan framework ya, ya sudahlah).

Di sesi ini sebenarnya mereka ‘jualan’ React sih dengan menjelaskan apa itu React, apa itu ReactNative dan ReactVR. Dan buat saya yang sudah menggunakan React, saya tidak perlu di-_convince_ lagi sih. Tapi presentasinya cukup menghibur dan mendapatkan _insight_ tambahan kenapa React itu keren!

![Sesi ReactNative dan ReactVR](/assets/images/f82/1_uBrvNLqvOB-MVKznzTcRXw.jpeg)_Sesi ReactNative dan ReactVR_

### Investing in Innovators Through Developer Programs

Dan sesi terakhir yang saya hadiri adalah sesi Developer Programs. Disini Kunbi Adeyemo dari Facebook sharing tentang bagaimana program Developer Circles mengubah hidup banyak orang. Salah satunya, [Nila](https://www.facebook.com/nilawilda) DevC Lead asal Surabaya. Tuh, slide-nya saya foto! Merinding episode kedua 😃.

![Nila on the slide](/assets/images/f82/1_qQi_vvtayQxkE3-ssIAl2Q.jpeg)_Nila on the slide_

Luar biasa ya kontingen Indonesia banyak di-_highlight_. Dan satu hal lagi yang baru saya tahu ternyata salah satu founder aplikasi belajar coding [SoloLearn](https://developers.facebook.com/videos/f8-2018/investing-in-innovators-through-developer-programs/), [Yeva Hyusyan](https://www.linkedin.com/in/yeva-hyusyan-5a16a220/) juga hasil ‘didikan’ Developer Program di Armenia.

Dan selesai sudah sesi-sesi _talk_ dan sekaligus F8 ditutup dengan Happy Hour sekaligus pengumuman pemenang Hackathon. Karena saya ngga ikutan, saya dan beberapa _leads_ memutuskan pulang ke hotel untuk isitirahat sejenak karena malamnya ada acara khusus untuk _leads_. Seperti acara pembubaran panitia gitu deh.

## Happy Hour For DevC Leads

Nah, _another great moment came at this event_. Setelah makan, minum, saling bertegur sapa, dan foto-foto (sumpah, para leads disini banyak banget yang hobi selfie!) saya mendapatkan momen yang sangat berharga meski sebentar.

![Maaf, saya kurang bisa wefie.](/assets/images/f82/1_HDGD81BS3J24_PgSn8gefQ.jpeg)_Maaf, saya kurang bisa wefie._

![With Leads, mother of Leads (Elisha) and Mother of mother of Leads (Alice).](/assets/images/f82/1_Dvj3KZGNDswBIHZrlmpSUA.jpeg)_With Leads, mother of Leads (Elisha) and Mother of mother of Leads (Alice)._

_Moment of truth_, atas inisiasi bro Firdaus, DevC Lead Surabaya saya dikenalkan oleh orang yang keren parah! Dia sangat terkenal di dunia p̶e̶r̶s̶i̶l̶a̶t̶a̶n̶ ReactNative. Tapi karena orangnya _low profile_ dan _super geek_, ngga banyak orang yang tahu. Namanya [Farid Safi](https://twitter.com/FaridSafi), DevC Lead Paris. Dia ini _master_-nya ReactNative. Kalo tahu ReactNative pasti tahu [Gifted Chat](https://github.com/FaridSafi/react-native-gifted-chat), salah satu project ReactNative yang jadi panduan banyak orang saat belajar. Dan yang Farid ini adalah orang yang buat Gifted Chat. Ya ampun, kenapa baru sempat ngobrol sekarang ya….

Dan yang lebih kerennya lagi adalah Farid ini juga membangun _coding bootcamp_ di Paris. Namanya[Le Reacteur](https://www.lereacteur.io/), sebuah _coding bootcamp fullstack_ JavaScript yang berdurasi 10 minggu. Jadilah kita saling _sharing_ tentang bagaimana suka-duka menjalankan _bootcamp_. Termasuk saya juga bertanya tentang _bootcamp_ lainnya yang saya tahu dan sepertinya lebih populer: [Le Wagon](https://www.lewagon.com/). Dan memang benar dugaan saya, mereka kompetitor. Dan saya bisa merasakan gimana rasanya punya kompetitor 😃.

![With Farid](/assets/images/f82/1_ScFO7DsZZOrqvJVsHJ_4qg.jpeg)_With Farid_

Sayangnya waktu kita terbatas, jadi cuma sempat ngobrol sebentar. Tapi tenang saja, kita bisa ngobrol _online_ kan ya. Yang penting kontak sudah didapat 🎉.

Dan usai sudah perhelatan [F8 Conference](https://www.f8.com/). Mungkin artikel selanjutnya saya akan share sedikit tentang pengalaman saya dan teman-teman leads mengelilingi Silicon Valley dalam rangka tur ke kantor-kantor startup ternama.

Kalau mau dengar penuturan langsung dari kami yang berangkat, silakan join [grup facebook DevC Jakarta](https://www.facebook.com/groups/DevCJakarta/). Kita akan mengadakan meetup khusus membahas tentang pengalaman kita di F8.
