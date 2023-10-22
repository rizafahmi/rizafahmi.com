---
title: 'Membuat PaaS Sendiri dengan Dokku'
permalink: '/paas-dokku/'
date: 2023-10-22
tags: tulisan
layout: tulisan
description: Bagaimana membuat Platform-as-a-Service (PaaS) sendiri dengan Dokku. Artikel ini akan membahas cara instalasi, konfigurasi dan cara penggelaran atau deployment.
---

> Ini adalah artikel dari materi yang dibawakan di acara Cloud Day Indonesia 2023 beberapa waktu yang lalu.

![](/assets/images/cloud-day.png)

# Platform as a Service

Platform-as-a-service (PaaS) adalah sebuah servis yang menyediakan
infrastruktur komputasi awan atau *cloud* namun dikelola sepenuhnya
untuk mengembangkan, dan mengelola aplikasi web. Dengan PaaS, pengembang
aplikasi dapat lebih fokus untuk mengembangkan produk dan fitur tanpa
perlu mengurus infrastruktur fisik seperti server, jaringan, ataupun
basis data atau *database*.

![Ilustrasi PaaS](/assets/images/PaaS.png)
<!-- ![](/assets/images/15gfsa-v2.jpg) -->

Dengan PaaS, kita bisa fokus mengembangkan produk dan berbagai fitur dan
mengutamakan produktivitas pengembang aplikasi. Dengan beberapa tahap,
aplikasi yang tadinya berjalan di mesin lokal dapat dinikmati pengguna
di seluruh belahan dunia.

# Tentang Dokku

Dokku adalah sebuah proyek sumber terbuka atau *open-source* yang dapat
digunakan untuk membangun PaaS kita sendiri tanpa tergantung kepada
pihak tertentu. Kita dapat melakukan instalasi Dokku di berbagai
penyedia jasa komputasi awan hingga server fisik sekalipun!

Dikembangkan diatas teknologi kontainer Docker dan http proxy nginx,
pengguna dapat dengan mudah mengelola, mengkonfigurasi, dan melakukan
penggelaran atau *deployment* aplikasi web dengan lebih cepat dan
efisien. Selain itu, Dokku juga mendukung *auto-scaling*, kompatibel
dengan buildpacks yang juga digunakan Heroku, serta integrasi dengan
layanan komputasi awan seperti AWS, DigitalOcean, GCP dan yang lainnya.

Karena terbuka, Dokku mewariskan sifat fleksibilitas bila dibutuhkan
kita bisa mengganti arsitektur semau kita. Misalkan, kita ingin
mengganti nginx dengan HAproxy ataupun Traefik.

Ekosistem Dokku pun terbilang sudah cukup lengkap dengan dukungan
*add-ons*. Kita bisa memanfaatkan *add-ons* untuk menambahkan basis
data, *caching*, *messaging queue*, *auth* dan banyak lagi.

# Menjajal Dokku

Untuk menjajal Dokku kita bisa siapkan sebuah mesin virtual seperti EC2
dari AWS ataupun servis serupa. Lalu akses server via ssh dan jangan
lupa lakukan update dan upgrade sebelum instalasi Dokku.

``` shell
# Contoh jika menggunakan linux ubuntu/debian
$ sudo apt update
$ sudo apt upgrade
```

Selanjutnya lakukan instalasi Dokku seperti yang tertera di
dokumentasinya.

``` shell
$ wget -NP . https://dokku.com/install/v0.31.1/bootstrap.sh
$ sudo DOKKU_TAG=v0.31.1 bash bootstrap.sh
```

Lakukan sedikit konfigurasi untuk otorisasi via ssh. Dan Dokku siap
digunakan.

``` shell
$ sudo su # act as super user
%> cat /home/admin/.ssh/authorized_keys | dokku ssh-keys:add admin
```

# Demo deployment dengan Dokku

Sekarang Dokku sudah dapat dijalankan dengan menulis perintah
`dokku`{.shell}

``` text
$ dokku
Usage: dokku [--quiet|--trace|--force] COMMAND <app> [command-specific-options]

Primary help options, type "dokku COMMAND:help" for more details, or dokku help --all to see all commands.

Commands:

    app-json                 Manage app-json settings for an app
    apps                     Manage apps
    builder                  Manage builder settings for an app
    builder-dockerfile       Manage the dockerfile builder integration for an app
    builder-lambda           Manage the lambda builder integration for an app
    builder-null             No-op builder plugin
    builder-pack             Manage the pack builder integration for an app
    buildpacks               Manage buildpack settings for an app
    caddy                    Manage the caddy proxy integration
    certs                    Manage SSL (TLS) certs
    checks                   Manage zero-downtime settings
    cleanup                  Cleans up exited/dead Docker containers and removes dangling images
    config                   Manage global and app-specific config vars
    cron                     Manage scheduled cron tasks
    docker-options           Manage docker options for an app
    domains                  Manage domains used by the proxy
    enter                    Enter running app containers
    events                   Manage event logging
    git                      Manage app deploys via git
    haproxy                  Manage the haproxy proxy integration
    help                     Print the list of commands
    logs                     Manage log integration for an app
    network                  Manage network settings for an app
    nginx                    Manage the nginx proxy
    openresty                Manage the openresty proxy integration
    plugin                   Manage installed plugins
    ports                    Manage ports for an app
    proxy                    Manage the proxy integration for an app
    ps                       Manage app processes
    registry                 Manage registry settings for an app
    repo                     Manage the app's repo
    resource                 Manage resource settings for an app
    run                      Run a one-off process inside a container
    scheduler                Manage scheduler settings for an app
    scheduler-docker-local   Manage the docker-local scheduler integration for an app
    scheduler-null           No-op scheduler plugin
    shell                    Interactive dokku prompt
    ssh-keys                 Manage public ssh keys used for deployment
    storage                  Manage mounted volumes
    trace                    Manage trace mode
    traefik                  Manage the traefik proxy integration
    url                      Show the first URL for an application (compatibility)
    urls                     Show all URLs for an application
    version                  Print dokku's version

```

## Menyiapkan Dokku untuk penggelaran aplikasi

Langkah pertama untuk menyiapkan Dokku untuk penggelaran adalah untuk
membuat aplikasi via perintah dokku.

``` text
$ dokku apps:help
Usage: dokku apps[:COMMAND]

Manage apps

Additional commands:
    apps:clone <old-app> <new-app>   Clones an app
    apps:create <app>                Create a new app
    apps:destroy <app>               Permanently destroy an app
    apps:exists <app>                Checks if an app exists
    apps:list                        List your apps
    apps:lock <app>                  Locks an app for deployment
    apps:locked <app>                Checks if an app is locked for deployment
    apps:rename <old-app> <new-app>  Rename an app
    apps:report [<app>] [<flag>]     Display report about an app
    apps:unlock <app>                Unlocks an app for deployment

```

Jalankan perintah berikut di server.

``` shell
$ dokku apps:create dokku_express
-----> Creating dokku_express…
=====> Global server virtual host not set, disabling app host…

$ dokku app:list
=====> My Apps
dokku_express

```

## Menggelar Aplikasi web

Dengan asumsi sudah memiliki aplikasi yang siap digelar, dalam contoh
ini adalah sebuah aplikasi Node.js sederhana.

![Screenshot aplikasi](/assets/images/dokku-app.png)

### Mengirimkan kode ke Dokku

Kirimkan kode yang ingin digelar ke server Dokku via git.

    $ git remote add dokku dokku@<ip.addr>:landing
    $ git push dokku main

Dan, bukan sulap bukan sihir secara otomatis Dokku dapat mendeteksi
aplikasi kita, yang dibangun dengan NodeJS dan menyiapkan platform untuk
penggelaran lengkap dengan versi dan *dependencies* yang sesuai.

## Konfigurasi Domain/subdomain

Kembali ke Dokku server, mari sekarang kita konfigurasi domain/subdomain
agar aplikasi yang baru digelar dapat diakses dengan domain yang sudah
disiapkan.

![](/assets/images/dokku-route53.png)

Jika teman-teman memiliki domain bisa lakukan konfigurasi via Route 53.
Dan jika belum memiliki domain aplikasi dapat diakses via public ip
address yang bisa didapat di EC2.

``` shell
$ dokku domains:report
=====> landing domains information
       Domains app enabled: false
       Domains app vhosts:
       Domains global enabled: false
       Domains global vhosts:

$ dokku domains:add-global <ip.addr>
-----> Added <ip.addr>

$ dokku domains:add dokku_express <ip.addr>
-----> Added <ip.addr> to dokku_express
-----> Configuring <ip.addr>… (using build-in template)
-----> Creating http nginx.conf
       Reloading nginx

$ dokku domains:report
=====> dokku_express domains information
       Domains app enabled: true
       Domains app vhosts: <ip.addr>
       Domains global enabled: true
       Domains global vhosts: <ip.addr>
```

Dan sekarang aplikasi kita sudah dapat diakses via public ip address 🎉

![](/assets/images/dokku-ip-addr.png)

### Subdomain

Aplikasi yang digelar ke Dokku bisa lebih dari satu tentunya. Kita bisa
memanfaatkan konfigurasi subdomain untuk mengarahkan satu aplikasi ke
subdomain tertentu. Misalnya kita ingin mengarahkan aplikasi
`dokku_express` kita ke subdomain <https://express.wiraku.dev>. Tentunya
kita harus memiliki domain wiraku.dev terlebih dahulu.

Dengan bantuan Route 53 dari AWS kita bisa mengarahkan domain yang kita
miliki ke ip address di EC2 tempat dimana servis Dokku berada. Lalu kita
bisa melakukan konfigurasi domain dan subdomain via perintah `dokku`.

![](/assets/images/dokku-route-53-2.png)

Lakukan langkah berikut untuk mengembalikan konfigurasi domain ke awal
lagi.

``` shell
$ dokku domains:clear-global
-----> Clearing global domains
$ dokku domains:clear dokku_express
=====> Global server virtual host not set, disabling vhosts...
-----> No port set, setting to random open high port
-----> Random port 40211
-----> Creating http nginx.conf
       Reloading nginx
-----> Cleared domains in dokku_express

$ dokku domains:report
=====> landing domains information
       Domains app enabled:    false
       Domains app vhosts:
       Domains global enabled: false
       Domains global vhosts:
```

Kemudian lakukan konfigurasi kembali untuk domain dan subdomain pilihan.

``` shell
$ dokku domains:set-global wiraku.dev
-----> Added wiraku.dev

$ dokku domains:set dokku_express express.wiraku.dev
-----> Set wiraku.dev for dokku_express
-----> Configuring dokku_express.wiraku.dev... (using template)
-----> Creating http nginx.conf
       Reloading nginx

$ dokku domains:report
=====> dokku_express domains information
       Domains app enabled:    true
       Domains app vhosts:     express.wiraku.dev
       Domains global enabled: true
       Domains global vhosts:  wiraku.dev

```

Karena satu dan lain hal, untuk mengakses halaman web dengan domain
sekarang kudu aman, kita harus menyediakan ssl certificate atau via
https. Sebelum itu, mari pastikan subdomain sudah sesuai dengan bantuan
`curl`.

``` shell
$ curl http://express.wiraku.dev
<!DOCTYPE html>
<html lang="en">
<head>
    <title>Deploy with dokku</title>
</head>
<body>

  <h1>Deploy with dokku</h1>
  <p>App version: 0.0.3</p>

</body>
</html>
```

Tapi tenang saja, Dokku punya solusinya dengan bantuan *plugin*
letsencrypt yang merupakan salah satu *plugin* resmi yang dikembangkan
langsung oleh tim Dokku.

``` shell
$ sudo su
%> dokku plugin:install https://github.com/dokku/dokku-letsencrypt.git
Cloning into 'letsencrypt'...
remote: Enumerating objects: 1103, done.
remote: Counting objects: 100% (434/434), done.
...
Resolving deltas: 100% (703/703), done.
-----> Plugin letsencrypt enabled
...
Adding user dokku to group adm

%> exit

```

Dan sekarang *plugin* letsencrypt sudah siap digunakan. Pekerjaan yang
cukup menjengkelkan memang untuk melakukan ini semua secara manual.
Belum lagi untuk proses memperpanjang sertifikat. Dengan *plugin* ini,
bahkan kita bisa lakukan perpanjangan secara otomatis!

``` shell
$ dokku letsencrypt:help
Usage: dokku letsencrypt[:COMMAND]

Manage the letsencrypt integration
Additional commands:
    letsencrypt:active <app>                     Verify if letsencrypt is active for an app
    letsencrypt:auto-renew [<app>]               Auto-renew app if renewal is necessary
    letsencrypt:cleanup <app>                    Remove stale certificate directories for app
    letsencrypt:cron-job [--add --remove]        Add or remove a cron job that periodically calls auto-renew.
    letsencrypt:disable <app>                    Disable letsencrypt for an app
    letsencrypt:enable <app>                     Enable or renew letsencrypt for an app
    letsencrypt:help                             Display letsencrypt help
    letsencrypt:list                             List letsencrypt-secured apps with certificate expiry times
    letsencrypt:revoke <app>                     Revoke letsencrypt certificate for app
    letsencrypt:set <app> <property> (<value>)   Set or clear a letsencrypt property for an app

```

Jalankan perintah `dokku letsencrypt:enable` untuk mengizinkan subdomain
`express` dijalankan via https.

``` shell
$ dokku letsencrypt:set --global email <email@domain.com>
=====> Setting email to <email@domain.com>

$ dokku letsencrypt:enable express
=====> Enabling letsencrypt for express
-----> Enabling ACME proxy for express...
-----> Getting letsencrypt certificate for express via HTTP-01
         - Domain 'express.wiraku.dev'
No key found for account <email@domain.com>. Generating a P256 key.
Saved key to /certs/accounts/acme-v02.api.letsencrypt.org/<email@domain.com>/keys...
[INFO] acme: Registering account for <email@domain.com>
...
-----> Certificate retrieved successfully.
-----> Installing let's encrypt certificates
-----> Configuring express.wiraku.dev
-----> Done

```

![](/assets/images/dokku-ssl-complete.png)

# Fitur ekstra

Ada banyak lagi fitur tambahan dari Dokku, baik *plugin* resmi yang
dikembangkan tim Dokku langsung ataupun yang dikembangkan oleh
komunitas. Sebut saja basis data seperti postgresql, *caching* seperti
redis, hingga alat seperti Grafana pun sudah tersedia.

Ada juga fitur tambahan seperti antarmuka berbasis web sehingga proses
administrasi yang tadinya kita jalankan via terminal dapat dilakukan via
antarmuka web.

# Kesimpulan

Di artikel ini kita sudah membahas tentang apa itu PaaS, tentang Dokku
dan bagaimana cara instalasi Dokku di server AWS, melakukan konfigurasi
dan demo singkat penggelaran dengan Dokku. Kita juga sudah melakukan
konfigurasi domain dan subdomain yang ternyata cukup sederhana.

Dengan adanya Dokku dan beberapa servis serupa, kita dapat membangun
Platform-as-a-Service (PaaS) sendiri baik untuk digunakan untuk
keperluan pribadi ataupun untuk meraup keuntungan.

# Referensi

-   [Deploy RoR with
    Dokku](https://railsnotes.xyz/blog/deploying-ruby-on-rails-with-dokku-redis-sidekiq-arm-docker-hetzner)
-   [Deploy SaaS app with
    Dokku](https://medium.com/geekculture/how-to-create-a-saas-web-application-part-3-setting-up-the-dev-environment-dokku-53032ed26e2b)
