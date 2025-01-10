---
title: 🪴 Konsep Pemrograman Fungsional
created: 2024-12-30
modified: 2025-01-06
layout: tulisan
tags:
  - catatan
  - ide
  - fungsional-elixir
eleventyExcludeFromCollections: false
---
Dalam dunia pengembangan perangkat lunak yang semakin kompleks, pemrograman fungsional bisa menjadi udara segar bagi para developer. Fungsional adalah sebuah paradigma pemrograman yang menekankan penggunaan **fungsi** sebagai konsep utama. Berbeda dengan paradigma lain yang fokus pada langkah-langkah untuk mengubah *state* atau data, **pemrograman fungsional fokus pada transformasi data** melalui fungsi.

Artikel berikut akan membahas tentang konsep pemrograman fungsional agar dapat lebih dimengerti dan digunakan untuk memprogram sehari-hari. Tidak hanya dapat digunakan untuk bahasa fungsional, saat ini hampir semua bahasa bisa menerapkan konsep fungsional meski paradigma bahasa yang digunakan OOP atau paradigma lainnya. Meskipun artikel ini sebagian besar akan menggunakan bahasa fungsional [Elixir](https://elixir-lang.org). Yang belum familiar dengan bahasa yang satu ini, boleh cek [artikel sebelumnya](https://rizafahmi.com/catatan/bahasa-fungsional-elixir/).

Dalam paradigma fungsional, semuanya berbasis fungsi (tentu saja) dengan tiga prinsip dasar yaitu: pure function, immutability dan first-class function. Mari kita bahas satu-per-satu.

## *First-class Function*
Dalam pemrograman fungsional, fungsi bukan sekadar blok kode yang menjalankan tugas tertentu. Fungsi adalah **warga negara kelas satu (*first-class citizen*)**, artinya mereka diperlakukan setara dengan tipe data lainnya seperti integer, string, atau list.

Dengan *first-class function*, kita bisa:
- **Membuat kode yang lebih modular**: Fungsi kecil bisa digunakan kembali di berbagai bagian program.
- **Kode lebih fleksibel**: Kita bisa mengirimkan fungsi sebagai argumen atau mengembalikan fungsi sebagai hasil, memungkinkan pola desain seperti *higher-order function* dan *currying*.
- **Kode mudah dikelola**: Kode menjadi lebih ekspresif dan mudah dipahami karena alur logika bisa dipecah menjadi fungsi-fungsi kecil.

Dengan *first-class function*, kita bisa 'memainkan' fungsi seperti bermain Lego. Kita bisa menyusun, memecah, dan menggabungkannya sesuai kebutuhan, menciptakan kode yang lebih dinamis dan powerful.

Berikut contoh menyimpan fungsi ke variable, bisa digunakan untuk membuat fungsi anonim. Di sini, kita menyimpan fungsi dalam sebuah variabel dengan nama `calculator`. Fungsi ini menggunakan pencocokan pola atau *pattern matching* untuk menentukan operasi yang akan dilakukan berdasarkan input. Kita bisa memanggil fungsi ini seperti memanggil fungsi biasa.

```elixir
# Fungsi disimpan dalam variabel
calculator = fn
  {:add, a, b} -> a + b
  {:subtract, a, b} -> a - b
  {:multiply, a, b} -> a * b
  {:divide, a, b} when b != 0 -> a / b
end

# Menggunakan fungsi yang disimpan dalam variabel
IO.puts calculator.({:add, 10, 5})      # Output: 15
IO.puts calculator.({:multiply, 4, 3})   # Output: 12
```

Berikutnya mari kita lihat contoh bagaimana mengirimkan fungsi sebagai argumen dari sebuah fungsi. Fungsi `process_numbers/2` menerima struktur data list (`numbers`) dan sebuah fungsi (`processor_fn`), lalu mengaplikasikan fungsi tersebut ke setiap elemen list menggunakan `Enum.map/2`. Dua fungsi anonim yang dibuat untuk menggandakan (`double_fn`) dan mengkuadratkan (`square_fn`) sebuah angka lalu dapat digunakan untuk menggandakan dan mengkuadratkan isi dari struktur data list.

```elixir
defmodule NumberProcessor do
  # Fungsi yang menerima list dan fungsi sebagai parameter
  def process_numbers(numbers, processor_fn) do
    Enum.map(numbers, processor_fn)
  end
end

# Membuat beberapa fungsi processor
double_fn = fn x -> x * 2 end
square_fn = fn x -> x * x end

numbers = [1, 2, 3, 4, 5]
doubled_numbers = NumberProcessor.process_numbers(numbers, double_fn)                   # [2, 4, 6, 8, 10]
squared_numbers = NumberProcessor.process_numbers(numbers, square_fn)                   # [1, 4, 9, 16, 25]
```

Berikutnya, kode dibawah ini menunjukkan bagaimana fungsi bisa mengembalikan fungsi lain (*currying*), memungkinkan fungsi menjadi lebih dinamis berdasarkan parameter yang diberikan.
Fungsi ini menerima sebuah faktor (`factor`) dan mengembalikan fungsi baru yang mengalikan input dengan faktor tersebut. Lalu kita membuat fungsi `triple`, sebuah fungsi baru yang dibuat dengan memanfaatkan fungsi sebelumnya yaitu `create_multiplier/1`. Fungsi ini akan mengalikan nilai input dengan angka 3.

```elixir
defmodule MathFactory do
  # Fungsi yang mengembalikan fungsi lain
  def create_multiplier(factor) do
    fn number -> number * factor end
  end

end

# Menggunakan function factory
triple = MathFactory.create_multiplier(3)
IO.puts(triple.(6))  # 6 * 3 = 18
```

Fungsi juga bisa disimpan kedalam struktur data (seperti map) dan dipanggil secara dinamis seperti contoh kode dibawah ini.
Contohnya `function_collection.increment.(5)` memanggil fungsi `increment` dengan input `5`, menghasilkan `6`.

```elixir
function_collection = %{
  increment: fn x -> x + 1 end,
  decrement: fn x -> x - 1 end,
  double: fn x -> x * 2 end
}

# Menggunakan fungsi dari collection
IO.puts function_collection.increment.(5)  # Output: 6
IO.puts function_collection.double.(4)     # Output: 8
```

## *Pure Function*
*Pure function* adalah salah satu konsep inti dalam pemrograman fungsional. Fungsi ini memiliki dua sifat utama:
1. **Deterministik**: Untuk input yang sama, fungsi selalu menghasilkan output yang sama.
2. **Tidak memiliki efek samping (*no side effects*)**: Fungsi tidak mengubah *state* di luar fungsi tersebut atau berinteraksi dengan variable diluar fungsi seperti mencetak ke layar, membaca file, atau mengubah variabel global.

*Pure function* sudah pasti menghasilkan output yang sama jika inputnya sama. Hal ini sering disebut _referential transparency_. Dalam paradigma fungsional kita akan sangat sering menulis *pure function* dan berusaha seminimal mungkin menulis dan menggunakan fungsi dengan efek samping seperti menyimpan ke file atau database.

Sebaliknya *impure function* atau fungsi dengan efek samping adalah fungsi yang bisa saja menghasilkan output berbeda meski input yang diberikan sama. Usahakan penggunaan fungsi yang memiliki efek samping dalam dosis yang paling minimal. 

```elixir
# Pure Function
def calculate_discount(price, discount_percentage) do
  discount_amount = price * (discount_percentage / 100)
  price - discount_amount
end

# Impure Function
def get_product_price(product_id) do
  case Req.get("https://api.store.com/products/#{product_id}") do
    {:ok, %Req.Response{status: 200, body: body}} ->
      {:ok, body}  # Req otomatis decode JSON response
    {:error, %Req.Error{reason: reason}} -> 
      {:error, "Gagal mengambil data produk: #{reason}"}
  end
end
```

Karena *pure function* selalu menghasilkan output yang sama untuk input yang sama, perilakunya sangat mudah diprediksi. Ini membuat kode lebih mudah dipahami, dianalisa dan dikelola. Sekaligus mudah diuji karena tidak bergantung pada *state* atau variable diluar konteks fungsi tersebut.
### Beberapa trik keren menggunakan *pure function*
#### *Partial Application*
***Partial application*** adalah teknik dalam pemrograman fungsional untuk membuat fungsi baru dengan "memberikan sebagian" parameter dari fungsi yang sudah ada. Dengan kata lain, kita bisa mengisi beberapa parameter awal dari sebuah fungsi dan menghasilkan fungsi baru yang hanya membutuhkan parameter sisanya.

Teknik ini sangat berguna untuk membuat fungsi yang lebih spesifik dari fungsi yang lebih umum. Dengan teknik ini, kita dapat menghindari pengulangan kode dan membuat kode lebih modular dan ekspresif.

Misalnya, kita memiliki fungsi umum untuk menghitung diskon:

```elixir
defmodule Discount do
  def calculate_discount(price, discount_percentage) do
    price * (1 - discount_percentage / 100)
  end
end
```

Kita bisa menggunakan teknik *partial application* untuk membuat fungsi baru yang sudah memiliki nilai `discount_percentage` tertentu, misalnya fungsi untuk diskon 10%.

```elixir
# Membuat fungsi baru dengan diskon 10%
apply_10_percent_discount = fn discount -> 
  Discount.calculate_discount(discount, 10)
end

# Menggunakan fungsi baru
IO.puts(apply_10_percent_discount.(100))  # Output: 90.0
IO.puts(apply_10_percent_discount.(200))  # Output: 180.0
```

#### *Function Composition*
***Function composition*** adalah teknik dalam pemrograman fungsional untuk menggabungkan dua atau lebih fungsi sedemikian rupa sehingga **output dari satu fungsi menjadi input untuk fungsi berikutnya**. Dengan kata lain, *function composition* memungkinkan kita membuat alur transformasi data yang mengalir secara alami dari satu fungsi ke fungsi lainnya.

Konsep ini sangat erat kaitannya dengan **transformasi data**. Data diproses melalui serangkaian fungsi yang masing-masing melakukan tugas spesifik. *Function composition* memungkinkan kita merangkai fungsi-fungsi ini dengan cara yang elegan dan ekspresif.

Misalnya kita ingin mengubah judul artikel menjadi *slug* sehingga dapat digunakan untuk URL. Langkah-langkah yang akan kita tempuh untuk melakukan transformasi dari judul artikel menjadi slug kurang lebih seperti ilustrasi dibawah ini.

```text
title |> lowercase() |> remove_special_chars() |> replace_space()
```

Atau jika digambarkan sebagai diagram, kurang lebih seperti ini.

![](/assets/images/diagram-mermaid.png)

Judul artikel dikonversi menjadi huruf kecil semua (*lowercase*), lalu hapus karakter seperti `*,?!` dll jika ada, dan terakhir konversi semua spasi menjadi `-`.

```elixir
title = "Paradigma Fungsional dengan Elixir!"
lowercase_title = String.downcase(title) # "paradigma fungsional dengan elixir!"
safe_lowercase_title = String.replace(lowercase_title, ~r/[^a-z0-9\s]/, "") # "paradigma fungsional dengan elixir"
nospace_safe_lowercase_title = String.replace(safe_lowercase_title, ~r/\s+/, "-") # "paradigma-fungsional-dengan-elixir"
```

Atau bisa juga disingkat tanpa ditampung ke variable seperti dibawah.

```elixir
String.replace(String.replace(String.downcase(title), ~r/[^a-z0-9\s]/, ""), ~r/\s+/, "-")
```

Hasilnya tetap sama, lebih singkat meskipun kode menjadi lebih sulit dibaca karena harus dipahami dari bagian dalam terlebih dahulu (String.downcase) baru ke bagian luar hingga selesai (String.replace).

Jika menggunakan bahasa Elixir, kita bisa menggunakan *pipe operator* untuk memudahkan transformasi data seperti ini. **Pipe Operator (`|>`)** adalah fitur dalam bahasa pemrograman Elixir dan beberapa bahasa fungsional lainnya yang memungkinkan kita untuk **merangkai fungsi** dengan cara yang lebih ekspresif dan mudah dibaca. *Pipe operator* **mengambil hasil dari ekspresi di sebelah kirinya dan meneruskannya sebagai argumen pertama ke fungsi di sebelah kanan**.

```elixir
# Versi sebelumnya
String.replace(String.replace(String.downcase(title), ~r/[^a-z0-9\s]/, ""), ~r/\s+/, "-")

# Versi pipe
title
|> String.downcase()
|> String.replace(~r/[^a-z0-9\s]/, "")
|> String.replace(~r/\s+/, "-")
```

Nah dengan *pipe*, kita bisa lebih mudah membacanya, dari atas kebawah. Atau kalau mau dibuat satu baris berarti bacanya dari kiri ke kanan.

```elixir
title |> String.downcase() |> String.replace(~r/[^a-z0-9\s]/, "") |> String.replace(~r/\s+/, "-")
```

Elixir dan F# menggunakan notasi `|>` untuk hal ini. Jika teman-teman pernah menggunakan notasi `|` di bash script atau command line unix/linux juga sama cara kerjanya.

```sh
$ grep "error" data.txt | wc -l
```

`grep "error" data.txt` akan mencari semua baris yang mengandung kata "error".    
Lalu hasilnya dilanjutkan ke perintah berikutnya (`wc -l`) untuk menghitung jumlah baris dari output yang diterima.

#### *Currying*
*Currying* adalah proses mengubah fungsi yang menerima banyak argumen menjadi serangkaian fungsi yang masing-masing menerima satu argumen. Misalnya, fungsi `add/2` yang menerima dua argumen bisa dibuat versi "kari"-nya menjadi fungsi `add_curry/1` yang menerima satu argumen dan mengembalikan fungsi baru yang menerima argumen kedua.
Kuncinya ada pada fungsi yang menerima satu argumen namun tidak mengembalikan nilai, melainkan mengembalikan fungsi berikutnya. Karena dalam paradigma fungsional, fungsi sama levelnya dengan data, nilai dan variable sehingga dapat menjadi nilai kembalian (*return*), dikirimkan lewat argumen ke fungsi lain dan sebagainya.

```elixir
def add(a, b) do
	a + b
end

IO.puts(add(5, 6))              # 11
```

Fungsi add ini menerima 2 argumen dan mengembalikan nilai yaitu jumlah argumen pertama dengan argumen kedua. Kita bisa membuat versi "kari" dari fungsi add ini dengan memanfaatkan fungsi anonim.

```elixir
add = fn a -> 
  fn b -> 
    a + b 
  end 
end

add.(5).(6)                    # 11
```

Menariknya, fungsi "kari" ini bisa digunakan untuk membuat fungsi spesifik sehingga dapat digunakan berulang-ulang sesuai kebutuhan. Sebagai informasi tambahan, fungsi anonim di Elixir dieksekusi dengan menambahkan `.` atau tanda titik untuk membedakan eksekusi fungsi dengan nama (*named function*) dan fungsi anonim (*anonymous function*).

```elixir
add = fn a ->
  fn b ->
    a + b
  end
end

add.(5).(6)                    # 11
add_five = add.(5)             # return function
result = add_five.(6)          # 11
result = add_five.(15)         # 20
```

Sedikit trivia: istilah *currying* disini bukan berasal dari *curry* atau hidangan kari atau gulai tapi berasal dari nama seorang matematikawan dan logikawan bernama **Haskell Brooks Curry**. Dialah yang mengembangkan konsep ini dalam bidang matematika dan logika. Namanya dicatut menjadi sebuah bahasa pemrograman Haskell dan konsep fungsional *currying*.

#### *Memoization*
***Memoization*** adalah teknik optimasi dalam pemrograman di mana hasil dari fungsi yang mahal (*expensive function execution*) disimpan, sehingga jika fungsi tersebut dipanggil lagi dengan argumen yang sama, hasilnya bisa langsung menggunakan hasil sebelumnya tanpa perlu menghitung ulang. Teknik ini sangat berguna untuk meningkatkan performa, terutama saat bekerja dengan fungsi rekursif atau fungsi yang membutuhkan komputasi intensif.

Mari kita tengok contoh sederhana yang cukup sering digunakan: fungsi fibonacci.

```elixir
defmodule Fibonacci do
  def fib(0), do: 0
  def fib(1), do: 1
  def fib(n), do: fib(n - 1) + fib(n - 2)
end
```

Fungsi diatas, jika dijalankan dengan angka yang semakin besar, waktu yang dibutuhkan akan semakin lama, dan meningkat secara eksponensial. Contoh hasil eksekusi dibawah memperlihatkan peningkatan signifikan dari fibonacci 30 yang membutuhkan 200-an milidetik menjadi 3 detik untuk menghasilkan fibonacci 40.

```shell
$ time ./fibonacci 20
The 20th Fibonacci number is: 6765

________________________________________________________
Executed in  186.83 millis

$ time ./fibonacci 30
The 30th Fibonacci number is: 832040

________________________________________________________
Executed in  211.43 millis

$ time ./fibonacci 40
The 40th Fibonacci number is: 102334155

________________________________________________________
Executed in    3.00 secs
```

Mari sekarang kita gunakan teknik *memoization* dengan menyimpan hasil fibonacci terdahulu.

```elixir
defmodule Fibonacci do
  def fib(n), do: fib(n, %{0 => 0, 1 => 1})

  defp fib(0, cache), do: {cache[0], cache}
  defp fib(1, cache), do: {cache[1], cache}
  defp fib(n, cache) do
    case cache[n] do
      nil ->
        {result1, cache} = fib(n - 1, cache)
        {result2, cache} = fib(n - 2, cache)
        result = result1 + result2
        {result, Map.put(cache, n, result)}
      cached_result ->
        {cached_result, cache}
    end
  end
end
```

Kita coba bandingkan hasil eksekusinya.

```shell
$ time ./fibonacci 20
The 20th Fibonacci number is: 6765

________________________________________________________
Executed in  155.38 millis

$ time ./fibonacci 30
The 30th Fibonacci number is: 832040

________________________________________________________
Executed in  162.81 millis

$ time ./fibonacci 40
The 40th Fibonacci number is: 102334155

________________________________________________________
Executed in  164.74 millis
```

Perbedaan signifikan ketika kode melakukan perhitungan fibonacci 40. Dari yang sebelumnya **memakan waktu 3 detik menjadi 165 milidetik saja!**

## *Immutability*
*Immutability* berarti data atau *state* tidak dapat diubah setelah dibuat. Alih-alih mengubah data yang ada, kita membuat data baru berdasarkan data lama. Ini berbeda dengan paradigma pemrograman lain, seringkali data diubah secara langsung dan menimpa data sebelumnya. Seperti yang sudah dibahas dibagian *Function Composition* bahwa paradigma fungsional fokus untuk melakukan transformasi data dibandingkan perubahan data atau *state* atau objek.

```elixir
iex> List.delete_at(list, -1)
[2, 3, 5, 7]
iex> list ++ [13]
[2, 3, 5, 7, 11, 13]
iex> list
[2, 3, 5, 7, 11]
```

Kunci utama *immutability* adalah tak peduli apapun operasi yang dilakukan, akan selalu mengembalikan nilai yang baru.

*Immutability* membuat kode lebih aman untuk konkurensi karena tidak ada risiko *race condition*. Selain itu, kode menjadi lebih mudah ditelusuri (*debug*) karena data tidak berubah secara tak terduga.

Mari kita lihat contoh kode keranjang belanja sederhana. Pertama, kita lihat versi *mutable* dengan JavaScript.

```javascript
class SimpleCart {
  constructor() {
    this.items = [];
    this.total = 0;
  }

  addItem(id, name, price) {
    // Cari item yang sudah ada
    const existingItem = this.items.find(item => item.id === id);

    if (existingItem) {
      // Jika item sudah ada, tambahkan quantity-nya
      existingItem.quantity += 1;
    } else {
      // Jika item belum ada, tambahkan item baru
      this.items.push({ id, name, price, quantity: 1 });
    }

    // Update total harga
    this.total += price;
  }

  removeItem(id) {
    // Cari item yang akan dihapus
    const itemIndex = this.items.findIndex(item => item.id === id);

    if (itemIndex !== -1) {
      const [removedItem] = this.items.splice(itemIndex, 1);
      // Update total harga
      this.total -= removedItem.price * removedItem.quantity;
    }
  }
}

// Contoh penggunaan:
const cart = new SimpleCart();
cart.addItem("book1", "Elixir in Action", 500000);
cart.addItem("book1", "Elixir in Action", 500000);  // Menambah quantity
cart.addItem("book2", "Programming Elixir", 450000);

console.log(cart);

// Output:
// SimpleCart {
//   items: [
//     { id: 'book1', name: 'Elixir in Action', price: 500000, quantity: 2 },
//     { id: 'book2', name: 'Programming Elixir', price: 450000, quantity: 1 }
//   ],
//   total: 1450000
// }

cart.removeItem("book1");
console.log(cart);

// Output setelah menghapus:
// SimpleCart {
//   items: [
//     { id: 'book2', name: 'Programming Elixir', price: 450000, quantity: 1 }
//   ],
//   total: 450000
// }
```

Dan berikut adalah versi *immutable* dengan Elixir.

```elixir
defmodule SimpleCart do
  @doc "Membuat cart kosong"
  def new do
    %{items: [], total: 0}
  end

  def add_item(cart, id, name, price) do
    # Cari item yang sudah ada
    case Enum.find(cart.items, &(&1.id == id)) do
      # Jika belum ada, tambah ke cart
      nil ->
        new_item = %{id: id, name: name, price: price, quantity: 1}
        %{
          items: [new_item | cart.items],
          total: cart.total + price
        }
      # Jika sudah ada, tambah qty saja
      item ->
        updated_items = Enum.map(cart.items, fn
          %{id: ^id} = i -> %{i | quantity: i.quantity + 1}
          other_item -> other_item
        end)
        
        %{
          items: updated_items,
          total: cart.total + price
        }
    end
  end

  def remove_item(cart, id) do
    case Enum.find(cart.items, &(&1.id == id)) do
      nil -> 
        cart
      
      item ->
        %{
          items: Enum.filter(cart.items, &(&1.id != id)),
          total: cart.total - (item.price * item.quantity)
        }
    end
  end
end

# Contoh penggunaan:
cart = SimpleCart.new()
       |> SimpleCart.add_item("book1", "Elixir in Action", 500_000)
       |> SimpleCart.add_item("book1", "Elixir in Action", 500_000)  # Menambah quantity
       |> SimpleCart.add_item("book2", "Programming Elixir", 450_000)
```


## Kesimpulan
Pemrograman fungsional adalah paradigma yang menawarkan pendekatan yang lebih aman, mudah diprediksi, dan efisien dalam pengembangan perangkat lunak. Dengan fokus pada **transformasi data** melalui fungsi, paradigma ini memungkinkan kita untuk menulis kode yang lebih modular, mudah diuji, dan aman untuk konkurensi.

Dalam artikel ini, kita telah menjelajahi beberapa konsep dasar pemrograman fungsional, seperti:
- **First-class Function**: Fungsi yang diperlakukan setara dengan tipe data lainnya, memungkinkan fleksibilitas dalam penggunaan dan pengelolaan kode.
- **Pure Function**: Fungsi yang selalu menghasilkan output yang sama untuk input yang sama, tanpa efek samping, membuat kode lebih mudah diprediksi dan diuji.
- **Immutability**: Data yang tidak dapat diubah setelah dibuat, memastikan keamanan dan konsistensi dalam pengelolaan state.
- **Function Composition** dan **Pipe Operator**: Teknik untuk merangkai fungsi-fungsi kecil menjadi alur pemrosesan data yang kompleks dan mudah dibaca.
- **Currying**: Teknik untuk mengubah fungsi yang menerima banyak argumen menjadi serangkaian fungsi yang masing-masing menerima satu argumen, meningkatkan modularitas dan fleksibilitas.
- **Memoization**: Teknik optimasi yang menyimpan hasil fungsi untuk menghindari komputasi ulang, meningkatkan performa terutama untuk fungsi rekursif atau intensif.

Dengan memahami dan menerapkan konsep-konsep ini, kita bisa menulis kode yang lebih ekspresif, modular, dan efisien. Pemrograman fungsional bukan hanya tentang menulis kode, tetapi juga tentang cara berpikir yang lebih terstruktur dan terorganisir.

## Referensi dan Bacaan Lanjutan
Jika teman-teman ingin mempelajari lebih lanjut tentang pemrograman fungsional dengan Elixir, berikut beberapa referensi yang bisa teman-teman baca:
- **"Programming Elixir"** oleh Dave Thomas
- **"Learn Functional Programming with Elixir"** oleh Ullises Almeida
- **Dokumentasi Resmi Elixir** tentang fungsi, pipe operator, dan konsep fungsional lainnya.
- [Video livestreaming belajar Elixir](https://youtube.com/playlist?list=PLTY2nW4jwtG8V_eYUz6qQp1ywP4wN3R4k&feature=shared)

Selamat mencoba!
