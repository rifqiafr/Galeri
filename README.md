# PixelVault — Personal Visual Storage

> Aplikasi web penyimpanan foto pribadi modern tanpa sistem login. Mengutamakan kecepatan akses, antarmuka bersih responsif di seluruh perangkat, manajemen aset visual, serta unduhan resolusi asli tanpa kompresi.

![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=flat&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=flat&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat&logo=javascript&logoColor=black)
![GitHub Pages](https://img.shields.io/badge/GitHub%20Pages-222222?style=flat&logo=githubpages&logoColor=white)

---

## 🌟 Fitur Utama

- **Zero-Friction Access**: Buka dan langsung gunakan tanpa hambatan login/registrasi.
- **Batch Upload Engine**: Mendukung *drag-and-drop* banyak file sekaligus (JPEG, PNG, WebP) dengan progress bar real-time.
- **Clipboard Paste (`Ctrl + V`)**: Bisa langsung menempelkan gambar dari *screenshot* atau clipboard tanpa perlu menyimpan file terlebih dahulu.
- **Manajemen Aset Ganda (Dual-Asset)**: Otomatis membuat thumbnail ringan untuk performa halaman super cepat dan menyimpan file master tanpa kompresi.
- **Unduh Resolusi Asli (Original Resolution Download)**: Mengembalikan file persis dengan kualitas dan resolusi asli pertama kali diunggah.
- **Mode Lightbox Split-View**: Pratinjau gambar resolusi tinggi dengan alat zoom, navigasi panah keyboard (`←` / `→` / `Esc`), dan gestur sentuh *swipe* untuk ponsel/tablet.
- **Pencarian Cepat & Sorting**: Cari instan berdasarkan judul, album, atau nama file, serta urutkan berdasarkan terbaru, terlama, nama, atau ukuran.
- **100% Responsif**: Dioptimalkan untuk Smartphone, Tablet, Laptop, dan Layar Desktop.

---

## 🚀 Panduan Deploy ke GitHub Pages (github.io)

Proyek ini dibuat menggunakan murni **HTML5, Vanilla CSS, dan Modern JavaScript**, sehingga dapat di-hosting secara gratis di **GitHub Pages** tanpa perlu konfigurasi server backend.

### Langkah-langkah:

1. **Buat Repositori Baru di GitHub**:
   - Buka [github.com/new](https://github.com/new).
   - Beri nama repositori, misalnya: `pixelvault` atau `galeri-foto`.
   - Pilih visibilitas **Public**.
   - Klik **Create repository**.

2. **Inisialisasi Git & Push ke GitHub**:
   Jalankan perintah berikut di terminal/PowerShell pada folder ini (`c:\laragon\www\Galeri`):
   ```bash
   git init
   git add .
   git commit -m "Initial commit PixelVault"
   git branch -M main
   git remote add origin https://github.com/USERNAME/NAMA-REPOSITORI.git
   git push -u origin main
   ```
   *(Ganti `USERNAME` dan `NAMA-REPOSITORI` sesuai akun GitHub Anda)*

3. **Aktifkan GitHub Pages**:
   - Masuk ke tab **Settings** di repositori GitHub Anda.
   - Pilih menu **Pages** di bilah navigasi kiri.
   - Pada bagian **Build and deployment > Branch**:
     - Pilih Branch: `main`
     - Folder: `/ (root)`
     - Klik tombol **Save**.

4. **Selesai! Akses Web Anda**:
   Dalam 1–2 menit, web Anda akan aktif dan dapat diakses di:
   ```text
   https://USERNAME.github.io/NAMA-REPOSITORI/
   ```

---

## 💻 Menjalankan Secara Lokal

Cukup buka berkas `index.html` langsung di browser Anda, atau jalankan melalui Laragon / Live Server:
```text
http://localhost/Galeri/
```
