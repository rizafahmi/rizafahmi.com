---
title: 'Tutorial Singkat Tentang Tensorflow.js'
date: 2018-07-25
permalink: /2018/07/25/screencast-singkat-tentang-tensorflow-js/
layout: tulisan
---

Tensorflow.js adalah sebuah library yang dibangun diatas deeplearn.js untuk membuat modul deep learninglangsung dari web browser! Deep learning sendiri adalah sebuah cabang dari machine learning dan juga artificial intelligence. Dengan Tensorflow.js kita dapat membuat implementasi Convolutional Neural Network (CNN), Recurrent Neural Network (RNN) dan lain sebagainya.

[Tensorflow](https://tensorflow.org/) sendiri merupakan library yang ditulis dengan bahasa C++ dan biasanya digunakan dengan bahasa pemrograman Python. Dengan adanya tensorflow.js, kita sekarang sudah bisa menggunakan beberapa fitur tensorflow di sisi web browser tanpa harus dibebani oleh instalasi yang cukup ‘menantang’. Dengan Tensorflow.js kita tinggal melakukan instalasi dengan npm install @tensorflow/tfjs ataupun juga dengan menggunakan CDN.

Berikut ini adalah cuplikan kode untuk memprediksi harga rumah berdasarkan luas tanah/luas bangunan.

```javascript
import * as tf from '@tensorflow/tfjs';

// Define a model for linear regression.
const model = tf.sequential();
model.add(tf.layers.dense({ units: 1, inputShape: [1] }));

// Prepare the model for training: Specify the loss and the optimizer.
model.compile({ loss: 'meanSquaredError', optimizer: 'sgd' });

// Provide some housing data
const xs = tf.tensor1d([7.9, 8.1, 8.3, 8.5, 8.6, 8.4]);
const ys = tf.tensor1d([738967, 742371, 750984, 759598, 763905, 755291]);

// Train the model using the data provided
model.fit(xs, ys).then(() => {
  const form = document.getElementById('myform');
  const inputText = document.getElementById('inputText');
  const predictPlaceholder = document.getElementById('predict');

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    // Use the model to predict or to inference
    const output = model.predict(
      tf.tensor2d([parseFloat(inputText.value) / 10], [1, 1])
    );
    predictPlaceholder.innerHTML = formatting(Array.from(output.dataSync())[0]);
  });
});

const formatting = (num) => {
  num *= 1000;
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
};
```

Untuk mengetahui lebih lanjut silakan simak video berikut ini.

<center><iframe width="560" height="315" src="https://www.youtube.com/embed/iO_-8c3fqZM" frameborder="0" allowfullscreen></iframe></center>

**Repo**: [GitHub](https://github.com/rizafahmi/simple-predict-tfjs-vanilla)

## Referensi

- [https://js.tensorflow.org](https://js.tensorflow.org/)

- [https://parceljs.org/](https://parceljs.org/)

- [http://www.carbondesignsystem.com/](http://www.carbondesignsystem.com/)

Artikel ini dirangkum dari [episode ke-18 randomscreencast.com](https://randomscreencast.com/18-tensorflowjs/).
