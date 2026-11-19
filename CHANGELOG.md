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

## 2026-11-19 — Impeccable design skill + a11y fix
- Installed `impeccable.style` skill (v4.9.1) into `.opencode/skills/impeccable/` (43 reference playbooks + detector CLI).
- Audit via `impeccable detect` (viewport 390×844): 1 finding — low contrast pada `.btn-primary` (white text on #f59e0b = 2.1:1, butuh 4.5:1).
- Fix: teks tombol primer diubah ke `var(--text)` (#1f2937, ~8:1), tombol danger ke `#dc2626` + white (5.0:1).
- Re-audit: 0 findings. `npm test` 11/11 lolos, `npm run build` sukses (PWA precache 7 entry). Ter-push ke `adptra01/sipkmk-mandor-mobile`.

## 2026-11-19 — Hardening offline-first & audit a11y
- Hardening: race condition guard (in-flight lock + queued sync), per-user outbox scoping, 401 handling + auto-logout, photo upload ke /api/photos (best-effort), AbortController timeout (15s/30s), cache master refresh saat daring.
- Hardening: validasi input terpusat (`validateUsageInput`), tanggal lokal (`getLocalDateString`), code-splitting (vendor-react, vendor-dexie), Workbox runtime caching host-agnostik.
- A11y: hapus emoji → SVG icon, `:focus-visible`, `prefers-reduced-motion`, `env(safe-area-inset-*)`, `touch-action: manipulation`, `tabular-nums`.
- Fixed: AuthContext pisah `initializing` (boot) vs `submitting` (form) → form login tidak ter-reset saat gagal.
- Fixed: `watchPending` re-export di sync.js untuk kompatibilitas.
- Verified: `npm test` 11/11, `npm run build` sukses (PWA precache 7 entry).
- Deploy: CF Pages `https://sipkmk-mandor.pages.dev` (bundle HTTPS, sw.js 200).
