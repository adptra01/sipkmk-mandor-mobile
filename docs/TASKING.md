# Daftar Tugas — SI-PKMK Mobile PWA (Repo `sipkmk-mandor-mobile`)

> Stack: React 18 + Vite 6 + JS + Dexie/IndexedDB + Workbox (PWA). Backend: Laravel 11 (repo `inventaris-material`).

Status: ✅ = selesai & terverifikasi · ⏳ = sedang dikerjakan · [ ] = belum

---

## Tahap M1 — Fondasi & Data Offline
- ✅ **M1-01**: Scaffold Vite + React 18, dependency lokal (react, react-dom, react-router-dom, dexie), tanpa environment baru.
- ✅ **M1-02**: `lib/api.js` — Sanctum Bearer, `API_BASE` bisa dioverride via `VITE_API_BASE`, normalisasi field Resource Indonesia (`kode/nama/satuan` → `code/name/unit`).
- ✅ **M1-03**: `lib/db.js` — Dexie/IndexedDB: tabel `outbox` (uuid unik), `materials`, `projects`; helper `addOutbox`, `pendingOutbox`, `markSynced`, `markFailed`, `cacheMaster`, `watchPending`.
- ✅ **M1-04**: `lib/sync.js` + `lib/payload.js` — `buildSyncPayload()` (snake_case, buang field internal), idempoten by UUID, `nextStatus()` transisi status, auto-sync saat online & pesan SW.
- ✅ **M1-05**: `context/AuthContext.jsx` — login, logout, restore token via `/me`.

## Tahap M2 — UI & Fitur Lapangan
- ✅ **M2-01**: LoginScreen — form Bahasa Indonesia, error jelas, indikator loading.
- ✅ **M2-02**: HomeScreen — sambutan, kartu proyek & antrean, status koneksi, tombol sync.
- ✅ **M2-03**: UsageScreen — form pemakaian (proyek/gudang/tujuan/material dinamis/qty/foto/catatan) → simpan ke outbox + daftar antrean ber-status.
- ✅ **M2-04**: SyncScreen — sinkronisasi manual, daftar semua outbox, hapus yang tersinkronisasi.
- ✅ **M2-05**: Layout + styles.css — bottom nav, header,theme amber, mobile-first.
- ⏳ **M2-06**: Perbaikan UI/UX lanjutan + audit aksesibilitas (Web Interface Guidelines: aria-label, focus-visible, prefers-reduced-motion, empty/loading/error state, anti-emoji, safe-area) — sedang dierjakan agen.

## Tahap M3 — Foto & PWA
- ✅ **M3-01**: `lib/photo.js` — kompresi klien via canvas (WebP, maks 1280px, quality 0.7) + fallback JPEG; preview dataURL.
- ✅ **M3-02**: PWA/Workbox — `vite-plugin-pwa`, manifest, icon, service worker (`dist/sw.js`), precache 7 entry, runtime cache master data & NetworkOnly sync, indikator Daring/Luring.
- ✅ **M3-03**: Endpoint backend `POST /api/photos` (kompresi server WebP via Intervention Image) — di repo backend.

## Tahap M4 — Testing
- ✅ **M4-01**: `test/sync.test.js` + `test/offline.test.js` — **11 test** Node built-in (`npm test`), verifikasi payload snake_case, UUID utuh, field internal dibuang, transisi status & retry.
- ✅ **M4-02**: `npm run build` sukses (PWA precache 7 entry).

## Tahap M5 — Deploy & Operasional
- ✅ **M5-01**: Deploy manual ke Cloudflare Pages — `https://sipkmk-mandor.pages.dev`, `VITE_API_BASE` pointing ke backend cPanel.
- ✅ **M5-02**: Token CF punya IP restriction → workflow GitHub Actions dihapus, prosedur deploy manual didokumentasikan di `CONTRACT.md`.
- [ ] **M5-03**: CI otomatis mobile — aktifkan kembali setelah token CF tanpa IP restriction dibuat (restore workflow dari git history).
- [ ] **M5-04**: Custom domain (mis. `sipkmk.gadinggardatamaperkasa.co.id`) + SSL di Cloudflare.
- [ ] **M5-05**: Monitoring & notifikasi error (Sentry / CF Analytics), backup konfigurasi.

## Catatan Keputusan
- **Flutter dibatalkan** → React web PWA (tidak perlu SDK/emulator; sesuai syarat "biar gak banyak install environment").
- **React Native (Expo) tidak dipakai** untuk MVP; opsi konversi terbuka bila butuh akses kamera/background-sync native & distribusi APK (via EAS Build, tanpa SDK lokal).
- Repo dipisah dari backend sejak commit `7f01b84` agar deploy backend (cPanel) & mobile (Cloudflare) benar-benar terpisah.
