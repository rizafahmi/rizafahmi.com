---
title: Menggunakan whisper.cpp untuk transkripsi audio
created: 2024-09-272
modified: 2024-09-272
layout: tulisan
tags:
  - catatan
  - ide
eleventyExcludeFromCollections: true
---
* git clone https://github.com/ggerganov/whisper.cpp.git
* download the model
	* sh ./models/download-ggml-model.sh medium
* fatal error: 'Accelerate/Accelerate.h' file not found
```
#   include <Accelerate/Accelerate.h>
            ^~~~~~~~~~~~~~~~~~~~~~~~~
1 error generated.
make: *** [ggml/src/ggml-blas.o] Error 1
```
* Ternyata ada nix package nya, ya install nix package nya saja lah kalau begitu ^_^