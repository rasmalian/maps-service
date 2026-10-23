# Klipang Green 2 - Map Monitor Service

Aplikasi peta monitoring lingkungan Klipang Green 2 berbasis web yang mobile-friendly, tanpa dependensi build tools atau API Key eksternal (menggunakan OpenStreetMap via Leaflet).

## Fitur Utama

1. **Interactive Perumahan Map**:
   - Peta responsif dan touch-friendly untuk HP (Android/iOS).
   - Tanpa Google Maps API Key (Leaflet + OpenStreetMap CDN).
   - Tombol GPS untuk langsung menuju lokasi posisi saat ini.

2. **Marker Alarm & Bahaya**:
   - Klik marker alarm untuk membuka panel aksi.
   - **Ping / Test Alarm (3 Detik)**: Membunyikan nada uji coba via Web Audio API.
   - **5 Pilihan Alarm Bahaya**:
     - 🐗 Hewan Liar
     - 🔥 Kebakaran
     - 🌊 Kebanjiran
     - 🥷 Pencurian
     - ⚠️ Bahaya Lain
   - Sirine darurat sintetis kontinu berbunyi otomatis di perangkat tanpa perlu file MP3 eksternal, lengkap dengan radar pulsing merah di peta dan banner darurat global.
   - Tombol Hentikan Sirine.
   - **Integrasi Webhook Telegram (Cloudflare Worker)**:
     - Menghubungkan alarm langsung ke Telegram Bot via Cloudflare Worker (`https://summer-rt9.demigod1337.workers.dev/`).
     - Tombol **Ping / Test**: Mengirim sinyal `action=ping` (mengubah title grup ke `20` untuk trigger bunyi beep 3 detik).
     - Tombol **Matikan Sirine / Mute Global**: Mengirim sinyal `action=stop` (mengubah title grup ke `101` untuk mematikan sirine).
     - Mendukung routing multi-bot (Bot 1 s.d. Bot 4) sesuai titik alarm masing-masing dengan aman tanpa mengekspos token bot ke klien:
       - **Bot 1**: Alarm Safir 3
       - **Bot 2**: Alarm Safir 2
       - **Bot 3**: Alarm Kalimaya Timur
       - **Bot 4**: Alarm Kalimaya Barat

3. **Marker CCTV & Live Stream HLS**:
   - **CCTV Safir 2**: Terintegrasi langsung dengan video feed live streaming HLS (`.m3u8`) resmi Pemerintah Kota Semarang (`livepantau.semarangkota.go.id`). Posisi marker dioptimalkan agar tidak saling bertumpuk dengan marker alarm sekitar.
   - Klik marker CCTV menampilkan preview thumbnail mini live camera dengan badge `🔴 LIVE STREAM`.
   - Mode Fullscreen CCTV viewer interaktif didukung Hls.js dengan fallback otomatis ke simulasi kanvas jika kamera kota sedang maintenance/offline.
   - Dilengkapi live digital clock OSD, scanline visual effect, dan tombol capture snapshot foto langsung dari frame video real-time.

4. **Tambah & Kelola Marker**:
   - Tombol **+ Tambah**: Sentuh titik mana saja di peta perumahan untuk menaruh marker baru.
   - Pilih jenis marker (Alarm atau CCTV).
   - Tersimpan otomatis di `localStorage` peramban (data tidak hilang saat refresh).

5. **Direktori UMKM & Kuliner Warga (Google Sheets API)**:
   - Terhubung langsung ke Google Sheets via Google Apps Script Web App API.
   - Menampilkan pin interaktif tematik (🍔 Kuliner, 🧺 Laundry, 🏪 Toko, ☕ Kafe).
   - Indikator status toko real-time (`🟢 BUKA` / `🔴 TUTUP`) dan banner promo.
   - Tombol pesan langsung via WhatsApp dengan pesan otomatis.
   - Tombol switch layer di header untuk menampilkan/menyembunyikan UMKM kapan saja.
   - **Fitur Live UMKM Status & Toast (10 Detik)**:
     - Muncul toast notifikasi `🏷️ Siap Kirim` atau `🔴 Sedang Tutup` selama 10 detik saat pin UMKM diklik.
     - **Live Spotlight Ticker**: Peta secara otomatis menampilkan toko warga yang sedang buka dan siap kirim secara berkala. Mengetuk toast langsung memusatkan peta ke toko tersebut dan membuka menu/promonya.

6. **Sistem Keamanan & Portal Login Akses (.yayahay)**:
   - Halaman depan (`index.html`) sebagai portal login terproteksi.
   - Kredensial username & password diverifikasi secara aman via endpoint Cloudflare Worker (`/auth`) menggunakan tanda tangan kriptografis HMAC-SHA256.
   - **Nol Kredensial di GitHub**: Username dan password disimpan di Cloudflare Worker Environment Variables / Secrets (`AUTH_USER` & `AUTH_PASS`), sehingga 100% aman dan tidak pernah masuk git commit.
   - Sesi login terproteksi disimpan di browser (`sessionStorage` / `localStorage`).
   - Dashboard monitoring utama berjalan di route `.yayahay` (`yayahay.html`) dengan proteksi redirect otomatis jika belum login dan tombol Logout terintegrasi.

---

## Cara Upload ke GitHub & Langsung Live Gratis

Ada 2 cara paling mudah dan gratis agar langsung online:

### Opsi A: Menggunakan Cloudflare Pages (Rekomendasi Terbaik)
1. **Push ke GitHub**:
   ```bash
   git init
   git add .
   git commit -m "Initial release maps service"
   git branch -M main
   git remote add origin https://github.com/USERNAME/NAMA-REPO.git
   git push -u origin main
   ```
2. Buka dashboard [Cloudflare Pages](https://dash.cloudflare.com/) -> **Compute (Workers) & Pages** -> **Create application** -> **Pages** -> **Connect to Git**.
3. Pilih repository GitHub kamu.
4. Pada **Build settings**:
   - **Framework preset**: `None`
   - **Build command**: *(kosongkan)*
   - **Build output directory**: `/` *(root folder)*
5. Klik **Save and Deploy**. Web app kamu langsung live di domain `https://nama-proyek.pages.dev` dalam hitungan detik!

---

### Opsi B: Menggunakan GitHub Pages Langsung
1. Setelah push code ke repository GitHub kamu di atas.
2. Buka tab **Settings** di halaman repository GitHub kamu.
3. Di menu sebelah kiri, pilih **Pages**.
4. Pada bagian **Build and deployment** -> **Source**:
   - Pilih **Deploy from a branch**.
   - Branch: `main` / `root (/)`.
5. Klik **Save**.
6. Dalam 1-2 menit, situsmu akan live di URL: `https://USERNAME.github.io/NAMA-REPO/`.
