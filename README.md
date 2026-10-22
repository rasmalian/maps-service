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

3. **Marker CCTV**:
   - Klik marker CCTV menampilkan preview thumbnail mini live camera.
   - Klik thumbnail untuk memperbesar ke mode Fullscreen CCTV viewer lengkap dengan live digital clock, scanline security OSD, dan tombol capture snapshot foto.

4. **Tambah & Kelola Marker**:
   - Tombol **+ Tambah**: Sentuh titik mana saja di peta perumahan untuk menaruh marker baru.
   - Pilih jenis marker (Alarm atau CCTV).
   - Tersimpan otomatis di `localStorage` peramban (data tidak hilang saat refresh).

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
