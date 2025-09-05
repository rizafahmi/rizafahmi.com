---
title: 🌱 Membangun Prototipe Aplikasi dengan Elixir Phoenix
created: 2025-09-04
modified: 2025-09-05
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

![](/assets/images/prototipe/event-listing.png)

![](/assets/images/prototipe/event-detail.png)

![](/assets/images/prototipe/event-create.png)


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
