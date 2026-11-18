# Changelog — SI-PKMK Mobile PWA

## 2026-11-18 — Inisialisasi repo mobile & deploy Cloudflare
- Baru: repo mandiri `adptra01/sipkmk-mandor-mobile` (dipisah dari `inventaris-material` agar deploy backend/cPanel & mobile/Cloudflare terpisah).
- Baru: React 18 + Vite 6 + JS + Dexie/IndexedDB; lapisan offline-first (`api.js`, `db.js`, `sync.js`, `payload.js`, `AuthContext.jsx`).
- Baru: UI Bahasa Indonesia — Login, Beranda, Pemakaian (form + outbox + kompresi foto), Sinkronisasi, Layout; PWA/Workbox (service worker, manifest, indikator Daring/Luring).
- Baru: 11 unit test Node (`npm test`) untuk payload sync & transisi status offline.
- Fixed: `API_BASE` di bundle produksi masih pointing ke DDEV → diubah ke `http://curious-lime-sloth.101-50-1-74.cpanel.site/api` via `VITE_API_BASE`.
- Deploy: Cloudflare Pages `https://sipkmk-mandor.pages.dev` (manual via wrangler; token CF punya IP restriction sehingga CI dihapus).
- Dokumen: `docs/PRD-SI-PKMK.md`, `docs/TASKING.md` ditambahkan.

## 2026-11-18 — Keputusan teknologi
- Flutter **dibatalkan** → React web PWA (tanpa SDK/emulator, sesuai syarat "biar gak banyak install environment").
- React Native/Expo tidak dipakai di MVP (opsi konversi via EAS Build tetap terbuka).
- Model AI yang dipakai untuk pengembangan: Claude Sonnet, GPT-6 Luna, Qwen4-Max, Gemini-4 Argon, Kimi K3.1 Pro, Gemini-3.8-Flash (verifikasi), Beam-free (factory/seeder BE), DeepSeek-flash (fix migrasi MySQL).
