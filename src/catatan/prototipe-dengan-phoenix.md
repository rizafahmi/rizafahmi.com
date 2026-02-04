---
title: Membangun Prototipe Aplikasi dengan Elixir Phoenix
created: 2025-09-04
modified: 2025-09-22
layout: tulisan
tags:
  - catatan
  - ide
eleventyExcludeFromCollections: true
---
## Pengantar

Artikel kali ini kita akan membangun prototipe aplikasi dengan Phoenix dan Elixir.

### Mau buat apa

EventFlow adalah aplikasi untuk mengelola komunitas. Dirancang untuk membantu komunitas mengelola dan berinteraksi dengan anggota, sekaligus menyediakan tempat untuk orang-orang menemukan komunitas yang relevan.

Fitur utama:
- Otentikasi
- Modul untuk mengelola komunitas
- Modul untuk mengelola acara atau event 
- Modul untuk mengelola RSVP acara atau event
- Eksplorasi dan pencarian komunitas
- Modul absensi/attendance
- Modul forum atau pesan/chat

![](/assets/images/prototipe/mindmap.png)

#### Tampilan Layar

![](/assets/images/prototipe/event-create.png)

![](/assets/images/prototipe/event-listing.png)

![](/assets/images/prototipe/event-detail.png)

![](/assets/images/prototipe/attendance.png)

![](/assets/images/prototipe/attendance-index.png)

![](/assets/images/prototipe/attendance-qr.png)

### Tujuan

Tujuannya untuk menunjukkan betapa mudahnya membangun aplikasi web ataupun prototipe dengan Phoenix. Tulisan ini lebih condong ke catatan daripada tutorial. Catatan dalam membangun sesuatu dari awal. Meskipun dapat juga dijadikan referensi untuk tutorial.

Harapannya, teman-teman yang membaca dapat mengikuti perjalanan mengembangkan aplikasi dari awal hingga akhir.

### Teknologi yang digunakan

*All in* menggunakan Phoenix dan Elixir.
- **Bahasa**: Elixir ~> 1.15
- **Framework**: Phoenix ~> 1.8.0
- **Database**: PostgreSQL with Ecto SQL
- **Frontend**: Phoenix LiveView with DaisyUI & Tailwind CSS
- **Otentikasi**: Passwordless with Phoenix Auth


## Persiapan Proyek

```shell
mix phx.new eventflow --binary-id --no-gettext
cd eventflow
```

Ubah konfigurasi database di `config/dev.exs` dan `config/test.exs`. Lalu pastikan servis databaase postgresql sudah dinyalakan.

### `config/dev.exs`

```diff
import Config

# Configure your database
config :eventflow, EventFlow.Repo,
- username: "postgres",
+ username: "riza",
- password: "postgres",
+ password: "",
  hostname: "localhost",
  database: "eventflow_dev",
  stacktrace: true,
  show_sensitive_data_on_connection_error: true,
  pool_size: 10

# ...
```

### `config/test.exs`

```diff
import Config

# Configure your database
#
# The MIX_TEST_PARTITION environment variable can be used
# to provide built-in test partitioning in CI environment.
# Run `mix help test` for more information.
config :eventflow, EventFlow.Repo,
- username: "postgres",
+ username: "riza",
- password: "postgres",
+ password: "",
  hostname: "localhost",
  database: "eventflow_test#{System.get_env("MIX_TEST_PARTITION")}",
  pool: Ecto.Adapters.SQL.Sandbox,
  pool_size: System.schedulers_online() * 2

```

```shell
mix ecto.create
```

```shell
mix phx.server
```

![](/assets/images/prototipe/phoenix.png)

Jalankan juga `mix test` untuk memastikan testing berjalan lancar.

```bash
$ mix test
Compiling 16 files (.ex)
Generated eventflow app
Running ExUnit with seed: 717094, max_cases: 20

.....
Finished in 0.04 seconds (0.01s async, 0.03s sync)
5 tests, 0 failures
```


```shell
git init
git add .
git commit -m "Init"
```

---


## Otentikasi

```bash
$ mix phx.gen.auth Accounts User users
An authentication system can be created in two different ways:
- Using Phoenix.LiveView (default)
- Using Phoenix.Controller only
Do you want to create a LiveView based authentication system? [Yn]
* creating priv/repo/migrations/20250905031019_create_users_auth_tables.exs
* creating lib/eventflow/accounts/user_notifier.ex
* creating lib/eventflow/accounts/user.ex
* creating lib/eventflow/accounts/user_token.ex
* creating lib/eventflow_web/user_auth.ex
* creating test/eventflow_web/user_auth_test.exs
* creating lib/eventflow_web/controllers/user_session_controller.ex
* creating test/eventflow_web/controllers/user_session_controller_test.exs
* creating lib/eventflow/accounts/scope.ex
* creating lib/eventflow_web/live/user_live/registration.ex
* creating test/eventflow_web/live/user_live/registration_test.exs
* creating lib/eventflow_web/live/user_live/login.ex
* creating test/eventflow_web/live/user_live/login_test.exs
* creating lib/eventflow_web/live/user_live/settings.ex
* creating test/eventflow_web/live/user_live/settings_test.exs
* creating lib/eventflow_web/live/user_live/confirmation.ex
* creating test/eventflow_web/live/user_live/confirmation_test.exs
* creating lib/eventflow/accounts.ex
* injecting lib/eventflow/accounts.ex
* creating test/eventflow/accounts_test.exs
* injecting test/eventflow/accounts_test.exs
* creating test/support/fixtures/accounts_fixtures.ex
* injecting test/support/fixtures/accounts_fixtures.ex
* injecting test/support/conn_case.ex
* injecting config/test.exs
* injecting config/config.exs
* injecting mix.exs
* injecting lib/eventflow_web/router.ex
* injecting lib/eventflow_web/router.ex - imports
* injecting lib/eventflow_web/router.ex - plug
* injecting lib/eventflow_web/components/layouts/root.html.heex

Please re-fetch your dependencies with the following command:

    $ mix deps.get

Remember to update your repository by running migrations:

    $ mix ecto.migrate
```

Karena kita ingin menggunakan LiveView, jawab dengan `Y`.

```shell
mix deps.get
mix ecto.migrate
mix phx.server
```

![](/assets/images/prototipe/auth.png)

![](/assets/images/prototipe/login.png)

![](/assets/images/prototipe/login-2.png)

![](/assets/images/prototipe/login-3.png)

![](/assets/images/prototipe/login-4.png)

### Menambahkan Nama untuk User

Registrasi dan login dengan email, tapi belum ada nama untuk modul User.

![](/assets/images/prototipe/name.png)


```elixir
defmodule EventFlow.Accounts.User do
  use Ecto.Schema
  import Ecto.Changeset

  @primary_key {:id, :binary_id, autogenerate: true}
  @foreign_key_type :binary_id
  schema "users" do
    field :email, :string
    field :password, :string, virtual: true, redact: true
    field :hashed_password, :string, redact: true
    field :confirmed_at, :utc_datetime
    field :authenticated_at, :utc_datetime, virtual: true

    timestamps(type: :utc_datetime)
  end

# ...
```

Mari jalankan test yang dibuatkan oleh generator yang dijalankan sebelumnya. Untuk memastikan testing berhasil sebelum melakukan perubahan atau _refactor_.

```bash
$ mix test
...
 24) test update password form updates the user password (EventFlowWeb.UserLive.SettingsTest)
     test/eventflow_web/live/user_live/settings_test.exs:98
     ** (RuntimeError) Phoenix LiveView requires lazy_html as a test dependency.
     Please add to your mix.exs:

     {:lazy_html, ">= 0.1.0", only: :test}

     code: {:ok, lv, _html} = live(conn, ~p"/users/settings")
     stacktrace:
       (phoenix_live_view 1.1.11) lib/phoenix_live_view/test/dom.ex:13: Phoenix.LiveViewTest.DOM.ensure_loaded
!/0
       (phoenix_live_view 1.1.11) lib/phoenix_live_view/test/live_view_test.ex:332: Phoenix.LiveViewTest.conne
ct_from_static_token/3
       test/eventflow_web/live/user_live/settings_test.exs:101: (test)

.......................................................................
Finished in 0.3 seconds (0.2s async, 0.08s sync)
110 tests, 24 failures
```

Sepertinya butuh `lazy_html` untuk menjalankan kode pengujian yang dihasilkan generator auth.

#### `mix.exs`

```diff
      {:jason, "~> 1.2"},
      {:dns_cluster, "~> 0.1.1"},
-     {:bandit, "~> 1.5"}
+     {:bandit, "~> 1.5"},
+     {:lazy_html, ">= 0.1.0", only: :test}
    ]
  end
  ...
```

```bash
$ mix deps.get
```

```bash
$ mix test
Generated eventflow app
Running ExUnit with seed: 351808, max_cases: 20

..............................................................................................................
Finished in 0.3 seconds (0.2s async, 0.08s sync)
110 tests, 0 failures
```

#### `lib/eventflow/accounts/user.ex`

```diff
defmodule EventFlow.Accounts.User do
  use Ecto.Schema
  import Ecto.Changeset

  @primary_key {:id, :binary_id, autogenerate: true}
  @foreign_key_type :binary_id
  schema "users" do
    field :email, :string
+   field :name, :string
    field :password, :string, virtual: true, redact: true
    field :hashed_password, :string, redact: true
    field :confirmed_at, :utc_datetime
    field :authenticated_at, :utc_datetime, virtual: true

    timestamps(type: :utc_datetime)
  end
...
```

Cek browser, error.

![](/assets/images/prototipe/name-error.png)

Coba jalankan test, dijamin akan banyak yang gagal. 

```bash
$ mix test
...
Finished in 0.3 seconds (0.2s async, 0.05s sync)
110 tests, 88 failures
```

Ada beberapa faktor yang menyebabkan hal ini:
1. Belum ada field name di database
2. Berbagai kode testing belum mengakomodir field name

Buat rancangan migrasi baru untuk menambahkan field name kedalam table database.

```bash
$ mix ecto.gen.migration add_user_name
* creating priv/repo/migrations/20250905035028_add_user_name.exs
```

#### `priv/repo/migrations/20250905035028_add_user_name.exs`

```diff
defmodule EventFlow.Repo.Migrations.AddUserName do
  use Ecto.Migration

  def change do
+   alter table(:users) do
+     add :name, :string
+   end
  end
end

```

Jalankan proses migrasi database

```bash
$ mix ecto.migrate
10:55:26.948 [info] == Running 20250905035028 EventFlow.Repo.Migrations.AddUserName.change/0 forward

10:55:26.949 [info] alter table users

10:55:26.952 [info] == Migrated 20250905035028 in 0.0s
```

Cek browser, sudah tidak error. Tapi nama belum digunakan. Coba logout, lalu ke halaman registrasi, belum ada input untuk nama.

![](/assets/images/prototipe/name-2.png)

Pastikan field name dapat digunakan di schema user.

#### `lib/eventflow/accounts/user.ex`

```diff
  def email_changeset(user, attrs, opts \\ []) do
    user
-   |> cast(attrs, [:email])
+   |> cast(attrs, [:email, :name])
    |> validate_email(opts)
  end
```

Tambahkan name ke form.

#### `lib/eventflow_web/live/user_live/registration.ex`

```diff
  <.form for={@form} id="registration_form" phx-submit="save" phx-change="validate">
+   <.input
+     field={@form[:name]}
+     type="text"
+     label="Name"
+     required
+     phx-mounted={JS.focus()}
+   />
    <.input
      field={@form[:email]}
      type="email"
      label="Email"
      autocomplete="username"
      required
-     phx-mounted={JS.focus()}
    />
  ...
```

Coba register dengan email yang beda.

![](/assets/images/prototipe/register-name.png)

Belum ada nama di header.

![](/assets/images/prototipe/register-name-2.png)

Mari tambahkan nama di template.

#### `lib/eventflow_web/components/layouts/root.html.heex`

```diff
  <%= if @current_scope do %>
    <li>
-     {@current_scope.user.email}
+     {@current_scope.user.name} ({@current_scope.user.email})
    </li>
  ...
```

Akhirnya...

![](/assets/images/prototipe/user-name.png)

Jalankan kembali testing. Tapi kok lolos semua? Wah ada yang aneh nih. 

```bash
$ mix test

Generated eventflow app
Running ExUnit with seed: 689918, max_cases: 20

..............................................................................................................
Finished in 0.3 seconds (0.3s async, 0.07s sync)
110 tests, 0 failures
```

Penyebabnya: field name bersifat opsional. Artinya kalaupun tidak diisi atau kosong, data tetap masuk. Mari kita ubah supaya name menjadi required.

#### `lib/eventflow/accounts/user.ex`

```diff
  def email_changeset(user, attrs, opts \\ []) do
    user
    |> cast(attrs, [:email])
    |> cast(attrs, [:email, :name])
    |> validate_email(opts)
+   |> validate_name()
  end

+ defp validate_name(changeset) do
+   changeset
+   |> validate_required([:name])
+   |> validate_length(:name, min: 2, max: 100)
+ end
  
  defp validate_email(changeset, opts) do
  ...
```

Sekarang kalau dijalankan, akan banyak error.

```bash
$ mix test

...
 87) test update_user_email/2 does not update email if token expired (EventFlow.AccountsTest)
     test/eventflow/accounts_test.exs:172
     ** (MatchError) no match of right hand side value: {:error, #Ecto.Changeset<action: :insert, changes: %{email: "user-576460752303422586@example.com"}, errors: [name: {"can't be blank", [validation: :required]}], data: #EventFlow.Accounts.User<>, valid?: false, ...>}
     stacktrace:
       (eventflow 0.1.0) test/support/fixtures/accounts_fixtures.ex:22: EventFlow.AccountsFixtures.unconfirmed_user_fixture/1
       test/eventflow/accounts_test.exs:137: EventFlow.AccountsTest.__ex_unit_setup_7_0/1
       EventFlow.AccountsTest.__ex_unit_describe_7/1


Finished in 0.3 seconds (0.2s async, 0.03s sync)
110 tests, 87 failures
```

Pada saat proses membuat user baru di kode testing, tambahkan nama sebagai sesuatu yang harus ada.

#### `test/support/fixtures/accounts_fixtures.ex`

```diff
  def unique_user_email, do: "user#{System.unique_integer()}@example.com"
  def valid_user_password, do: "hello world!"
+ def valid_user_name, do: "Some User #{System.unique_integer()}"

  def valid_user_attributes(attrs \\ %{}) do
    Enum.into(attrs, %{
-     email: unique_user_email()
+     email: unique_user_email(),
+     name: valid_user_name()
    })
  end
```


```bash
$ mix test

Generated eventflow app
Running ExUnit with seed: 711647, max_cases: 20

.........................................................................................

  1) test change_user_email/3 returns a user changeset (EventFlow.AccountsTest)
     test/eventflow/accounts_test.exs:110
     Assertion with == failed
     code:  assert changeset.required == [:email]
     left:  [:name, :email]
     right: [:email]
     stacktrace:
       test/eventflow/accounts_test.exs:112: (test)

....................
Finished in 0.4 seconds (0.3s async, 0.07s sync)
110 tests, 1 failure
```

Sisa 1 test yang gagal, ada di `test/eventflow/accounts_test.exs` baris 112. Yang harus ada sekarang bukan hanya email, tapi juga nama.

#### `test/eventflow/accounts_test.exs`

```diff
    test "returns a user changeset" do
      assert %Ecto.Changeset{} = changeset = Accounts.change_user_email(%User{})
-     assert changeset.required == [:email]
+     assert changeset.required == [:name, :email]
    end
```

```bash
$ mix test

Running ExUnit with seed: 639584, max_cases: 20

..............................................................................................................
Finished in 0.4 seconds (0.3s async, 0.08s sync)
110 tests, 0 failures
```

Semua testing lolos!

Mari simpan semua perubahan yang sudah dilakukan.

```shell
git add .
git commit -m "Add user name field with validation and UI updates"
```

---

## Deployment

Aplikasi kita sudah bisa registrasi, login dan logout. Artinya data pengguna sudah tersimpan kedalam database. Waktu yang tepat untuk deploy. Pendekatan yang saya senangi adalah deploy sedini mungkin sebelum aplikasi menjadi terlalu kompleks sehingga jika terjadi kesalahan masih bisa diatasi dengan mudah.

Kita akan meluncurkan aplikasi dengan menggunakan teknik kontainer. Docker adalah alat yang paling populer saat ini. Semua elemen akan menggunakan Docker mulai dari backend & frontend, database hingga proxy.

TODO: Diagram arsitektur.

Pertama kita akan siapkan segala sesuatunya di local terlebih dahulu baru kemudian datanya dikirimkan ke server, untuk dieksekusi di sisi server.

Jalankan `mix phx.gen.secret` dan hasilnya ditambahkan sebagai `SECRET_KEY_BASE` di `.env`.

```text
export SECRET_KEY_BASE=keyGeneratedByPhxGenSecretHere
```

File `.env` ini harus diabaikan dan tidak boleh disimpan di repo. Isinya nanti di _copas_ manual saja ketika akan menjalankan docker di server.

Untuk Dockerfile, Phoenix sudah menyediakan penggunaan docker untuk deployment dengan perintah `mix phx.gen.release --docker`.

Saya ingin agar setiap kali deployment proses migrasi database dijalankan, mari ubah sedikit `Dockerfile` agar sebelum menjalankan server jalankan migrasi terlebih dahulu dengan membuat file baru dengan nama `start`.

#### `Dockerfile`

```diff
# Only copy the final release from the build stage
COPY --from=builder --chown=nobody:root /app/_build/${MIX_ENV}/rel/eventflow ./

USER nobody

+ COPY --from=builder --chown=nobody:root /app/rel/overlays/bin/start ./bin/start
+ RUN chmod +x ./bin/start

# If using an environment that doesn't automatically reap zombie processes, it is
# advised to add an init process such as tini via `apt-get install`
# above and adding an entrypoint. See https://github.com/krallin/tini for details
# ENTRYPOINT ["/tini", "--"]

- CMD ["/app/bin/server"]
+ CMD ["/app/bin/start"]

```

Lalu buat file baru di folder `rel/overlays/bin/`

#### `rel/overlays/bin/start`

```sh
#!/bin/sh
set -eu

cd -P -- "$(dirname -- "$0")"
./migrate && ./server
```

Mari simpan perubahan yang kita lakukan ke repo.

```shell
$ git add --all .
$ git commit -m "Prepare Dockerfile, etc for deployment"
```

Agar dapat diakses dari server, kita buat repo GitHub dan kirim kodenya ke repo tersebut. Untuk membuat repo github, saya biasa menggunakan github cli

```shell
$ gh repo create
```

Lalu jalankan `git push` jika belum.

```shell
$ git push origin main
```

### Mempersiapkan Server

Untuk persiapan selanjutnya akan kita akan lakukan di sisi server. Siapkan dulu sebuah mesin virtual sebagai tujuan deployment. Saya akan menggunakan servis Compute Engine dari GCP. Berikut konfigurasinya.

![](/assets/images/prototipe/vm-spec.png)

TODO: Ganti ke docker
https://reintech.io/blog/setting-up-docker-docker-compose-debian-12


Bikin .env isinya SECRET_KEY_BASE

Connect ke email gmn caranya?
Pakai Swoosh Adapters Mailgun

Login ke server yang baru dibuat lewat ssh, instalasi Podman dan Podman Compose.

```shell
riza@eventflow:~$ sudo apt update && sudo apt upgrade -y
riza@eventflow:~$ sudo apt install -y podman podman-compose
riza@eventflow:~$ sudo apt install -y git
```

#### Kenapa Podman?

- https://www.threads.com/@riris_bayu/post/DKdk34yBTx-
- 99% sama

TODO

---

```shell
riza@eventflow-id:~$ sudo apt install qemu-system-x86
riza@eventflow:~$ podman machine init
riza@eventflow:~$ podman machine start
```

Mari cek podman

```shell
riza@eventflow:~$ sudo podman run -dit --name nginx -p 80:80 docker.io/nginx
riza@eventflow-id:~$ curl localhost
<!DOCTYPE html>
<html>
<head>
<title>Welcome to nginx!</title>
<style>
html { color-scheme: light dark; }
body { width: 35em; margin: 0 auto;
font-family: Tahoma, Verdana, Arial, sans-serif; }
</style>
</head>
<body>
<h1>Welcome to nginx!</h1>
<p>If you see this page, the nginx web server is successfully installed and
working. Further configuration is required.</p>

<p>For online documentation and support please refer to
<a href="http://nginx.org/">nginx.org</a>.<br/>
Commercial support is available at
<a href="http://nginx.com/">nginx.com</a>.</p>

<p><em>Thank you for using nginx.</em></p>
</body>
</html>
```

Podman berhasil menjalankan nginx di port 80.

```shell
riza@eventflow-id:~$ podman stop nginx
riza@eventflow-id:~$ podman rm nginx
```

Karena kita ingin menulis kode dan menjalankan docker/podman yang berhubungan dengan deployment di server, nantinya kita membutuhkan kemampuan untuk mengirimkan kode via ssh.


```shell
riza@eventflow:~$ ssh-keygen -t ed25519 -C "rizafahmi@gmail.com"
riza@eventflowd:~$ ssh-add ~/.ssh/id_ed25519
Identity added: /home/riza/.ssh/id_ed25519 (rizafahmi@gmail.com)
$ cat ~/.ssh/id_ed25519.pub
# Then select and copy the contents of the id_ed25519.pub file
# displayed in the terminal to your clipboard
```

![](/assets/images/prototipe/github-ssh.png)


Coba koneksi ke github via ssh.

```shell
riza@eventflow:~$ ssh -T git@github.com
The authenticity of host 'github.com (20.205.243.166)' can't be established.
ED25519 key fingerprint is SHA256:+DiY3wvvV6TuJJhbpZisf/zLDA0zPMSvHdkr4UvCoqU.
This key is not known by any other names.
Are you sure you want to continue connecting (yes/no/[fingerprint])? yes
Warning: Permanently added 'github.com' (ED25519) to the list of known hosts.
Hi rizafahmi! You've successfully authenticated, but GitHub does not provide shell access.
```

Pengaturan github dan ssh selesai! Sekarang mari unduh kode dan jalankan di server.

```shell
riza@eventflow:~$ git clone git@github.com:rizafahmi/eventflow.git
riza@eventflow:~$ cd eventflow/
```

Kode sudah didapat, saatnya mulai proses deployment. Namun sebelum itu, mari kita desain infrastruktur yang akan dibuat dengan docker dan docker-compose, atau dalam hal ini, podman.

![](/assets/images/prototipe/infra.png)

Seperti diagram arsitektur diatas, kita butuh beberapa kontainer tambahan yang dijalankan berbarengan. Utamanya database. Agar mudah dikelola, kita buat sebuah file `docker-compose.yaml`. 

#### `docker-compose.yaml`

```yaml
version: "3.9"
services:
  db:
    image: docker.io/library/postgres:17.6
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: eventflow
    volumes:
      - postgres_data:/var/lib/postgresql/data
  web:
    build: .
    depends_on:
      - db
    environment:
      PHX_HOST: localhost
      DATABASE_URL: ecto://postgres:postgres@db/eventflow
      SECRET_KEY_BASE: ${SECRET_KEY_BASE}
      MAILGUN_API_KEY: ${MAILGUN_API_KEY}
  proxy:
    image: docker.io/library/caddy:2.7.6
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./Caddyfile:/etc/caddy/Caddyfile
      - caddy_data:/data
      - caddy_config:/config
    depends_on:
      - web
    restart: unless-stopped
volumes:
  postgres_data:
  caddy_data:
  caddy_config:
```

#### `Caddyfile`

Proxy akan digunakan untuk http/https dan websocket juga. Karena aplikasi Phoenix menggunakan websocket. Untuk mendefinisikan konfigurasi server, kita akan gunakan ip address atau domain/subdomain server.

```text
eventflow.rizafahmi.com {
    # Enable compression
    encode zstd gzip

    # Proxy all requests to the Phoenix app
    reverse_proxy web:4000 {
        header_up Host {host}
        header_up X-Real_IP {remote}
        header_up X-Forwarded-For {remote}
        header_up X-Forwarded-Proto {schema}}

        transport http {
            keepalive 30s
        }
    }

    # Log in JSON format
    log {
        format json
    }
}
```

Jalankan docker/podman compose.

```shell
riza@eventflow-id:~/eventflow$ podman-compose up --build
```


Jangan lupa arahkan DNS domain/subdomain ke ip eksternal vm di gcp.

### Continuous Integration
#### Menambahkan credo dan dialyzer

### Kirim Email 


















---

## Catatan
- Express it as a model
- Map the model to a plan that is 1:1 with phx.live.gen
- Plan for less than 40 hours of work
	- Prioritize

### Filosofi
- Generator first, code second
- Generated code is the canonical representation of your app
- Generated code is complete, don't remove parts
- Don't change context module, make a module for commands
- Run mix test.watch < 5s
- Use liveview for everything
- phx.gen.auth
- Use component framework like petal.build or daisyui

## Sumber

```
https://youtu.be/BNmM2PyHs2c?feature=shared
```
