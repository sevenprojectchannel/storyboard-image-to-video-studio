# STORYBOARD IMAGE TO VIDEO STUDIO 🎬

[![Production Ready](https://img.shields.io/badge/status-production--ready-emerald.svg)]()
[![React 19](https://img.shields.io/badge/React-19.0-61dafb.svg)]()
[![Vite 6](https://img.shields.io/badge/Vite-6.0-646cff.svg)]()
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4-38bdf8.svg)]()
[![Google Gemini BYOK](https://img.shields.io/badge/Google%20Gemini-BYOK-f59e0b.svg)]()

> Aplikasi web profesional sinematik untuk menganalisis gambar storyboard multi-panel dan menghasilkan prompt serta skema JSON **Image-to-Video** berkesinambungan tinggi (default sequence: 10 detik, 5 scene @ 2 detik/scene).

---

## 🌟 Fitur Utama

- **Master Visual Reference**: Menjaga integritas storyboard original sebagai *"SOURCE OF TRUTH"*.
- **Storyboard Multi-Panel Detection**: Ekstraksi durasi, visual deskriptif, aksi dinamis, pergerakan kamera, efek partikel/atmosfer, dan audio/foley tiap adegan.
- **Continuity Engine**: Memastikan konsistensi identitas karakter, pakaian, wajah, pencahayaan, arah vektor, dan kesinambungan momentum antar-adegan tanpa efek teleportasi/morphing.
- **22 Global Motion Rules**: Dilengkapi 22 aturan sinematik baku untuk generator video AI generasi terbaru (Runway Gen-3, Kling, Sora, Luma Dream Machine, Pika).
- **Prompt Conflict Analyzer**: Mendeteksi kontradiksi fisik/kamera (*fast movement* vs *slow motion*, *fixed camera* vs *rapid tracking*, dll.) dengan tombol resolusi otomatis `[ FIX AUTOMATICALLY ]`.
- **JSON Validator & Auto-Fix**: Validasi skema output real-time dengan status `JSON VALID` / `JSON ERROR`.
- **Centralized BYOK (Bring Your Own Key)**: Konfigurasi Gemini API Key aman di browser pengguna (`localStorage`) tanpa server perantara atau logging.
- **Interactive Visual Timeline**: Timeline bar dinamis 0s–10s dengan card sequencing & reordering otomatis.
- **One-Click Clipboard & Exporters**: Salin prompt/JSON dalam sekali klik, serta unduh `image-to-video-storyboard-10s.json` dan prompt `.txt`.

---

## 🚀 Menjalankan Secara Lokal

### Prasyarat
- [Node.js](https://nodejs.org/) (versi 18+)
- npm atau pnpm

### Instalasi & Menjalankan

```bash
# 1. Clone repository
git clone <URL_REPO_GITHUB_ANDA>
cd storyboard-image-to-video-studio

# 2. Install dependensi
npm install

# 3. Jalankan server development
npm run dev
```

Buka browser di `http://localhost:5173/`.

---

## 📦 Build Produksi

```bash
npm run build
```

Hasil build siap saji akan dibuat di folder `dist/`.

---

## 🌐 Deploy ke GitHub Pages

Repository ini sudah dilengkapi workflow otomatis GitHub Actions di [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml).

### Cara Mengaktifkan:
1. Push branch `main` atau `master` ke GitHub.
2. Di halaman repository GitHub Anda, buka menu **Settings** > **Pages**.
3. Di bagian **Build and deployment** > **Source**, pilih **GitHub Actions**.
4. Website akan otomatis di-build dan tayang di `https://<username>.github.io/<nama-repo>/`.

---

## 📄 Lisensi
MIT License © 2026 Seven Studio.
