---
title: 'Struktur Data Elementer: Stack'
date: 2020-04-08
slug: 'struktur-data-elementer-stack'
cover: ''
draft: true
---

Kita akan membahas dua konsep struktur data yang cukup penting yaitu Stack dan Queue
setelah sebelumnya kita sudah membahas tentang [](notasi O besar) dan
[](rekursi). Dua struktur data ini sebenarnya digunakan dimana-mana, tanpa
kita sadari. Bisa saja salah satu fungsi inti yang sudah termasuk dalam bahasa
pemrograman pilihan dibelakang layar menggunakan salah satu atau kedua struktur data ini. Yang
paling mendasar, JavaScript menggunakan konsep Call Stack dalam proses eksekusi kodenya. Kita akan membahas tentang hal ini nanti.

# Struktur Data Stack

Konsep utama Stack adalah seperti sistem antrian yang terbalik. Nilai terakhir yang dimasukkan kedalam Stack akan menjadi nilai pertama yang akan keluar, atau populer disebut Last In First Out (LIFO). Untuk memasukkan nilai kedalam Stack biasanya menggunakan istilah _push_ dan untuk mengambil nilai dari Stack disebut juga dengan _pop_.

Jika teman-teman perhatikan, Stack berarti mirip sekali dengan struktur data Array, kan?! Array menggunakan konsep _push_ dan _pop_ juga meskipun kita dapat mengambil nilai dari array menggunakan indeks. Betul sekali, Stack adalah versi primitif dari Array karena Stack hanya memiliki metode _push_ dan _pop_ saja untuk berinteraksi dengan isinya.
