# Kontrak Aplikasi React Mandor SI-PKMK

Semua agent WAJIB baca. Stack: **React 18 + Vite 6 + JS (JSX)**, Dexie (IndexedDB), react-router-dom 6. Node 24 di DDEV. Tailwind TIDAK dipakai — CSS biasa.

## Lokasi
- Root: `/mnt/DiskD/Projects/inventaris-material/mobile/`
- Build: `cd /mnt/DiskD/Projects/inventaris-material && ddev exec -d /var/www/html/mobile npm run build`
- Base URL API: `https://inventaris-material.ddev.site:8443/api` (konstanta `API_BASE`).

## API
- `POST /login` body `{email,password,device_name}` → `{token, user:{id,nama,email,peran[],proyek[]}}`
- `GET /me`, `GET /materials`, `GET /projects`, `POST /sync/usages` (Bearer token)
- Sync body: `{uuid, project_id, warehouse_id, destination_type, destination_id, user_id, usage_date, note, recorded_at, items:[{material_id, quantity}]}`

## Pembagian File (JANGAN menulis di luar owner-mu)

### Agent R1 — Core lib (api, db, auth context, sync)
Owner:
- `src/lib/api.js` — ekspor `API_BASE`, `setToken/getToken/clearToken` (localStorage), `apiRequest(path, options)` (fetch + Bearer + parse JSON, throw Error dengan `data.pesan`), `login(email,password)`, `getMaterials()`, `getProjects()`, `syncUsage(payload)`.
- `src/lib/db.js` — Dexie DB `sipkmk` v1, tabel: `outbox` (id auto, uuid unique, projectId, warehouseId, destinationType, destinationId, usageDate, note, recordedAt, status, attempts, payloadJson, createdAt), `materials` (id, code, name, unit), `projects` (id, code, name). Index: `uuid`, `status`, `&uuid`. Ekspor `db`, helper `addOutbox(payload)`, `pendingOutbox()`, `markSynced(uuid)`, `markFailed(uuid,error)`, `cacheMaster({materials,projects})`.
- `src/lib/sync.js` — ekspor `syncNow()` (baca pending outbox, kirim via api.syncUsage, update status; return `{total, berhasil, gagal}`), `watchPending(callback)` pakai dexie `liveQuery`.
- `src/context/AuthContext.jsx` — `AuthProvider`, `useAuth()` dengan `{user, token, login(email,pass), logout(), loading, error}`; saat mount cek token di localStorage & fetch `/me`.

### Agent R2 — Screens & components
Owner:
- `src/main.jsx`, `src/App.jsx`, `src/styles.css`
- `src/components/Layout.jsx` — AppBar + bottom nav (Beranda, Pemakaian, Sinkronisasi), children.
- `src/screens/LoginScreen.jsx`, `HomeScreen.jsx`, `UsageScreen.jsx`, `SyncScreen.jsx`.

R2 mengimpor dari R1: `useAuth` (`src/context/AuthContext.jsx`), `db`/helper (`src/lib/db.js`), `syncNow`/`watchPending` (`src/lib/sync.js`), `getMaterials/getProjects` (`src/lib/api.js`).

## Aturan
- Semua teks UI **Bahasa Indonesia**.
- Tanpa TypeScript. JSX biasa.
- CSS sederhana di `styles.css` (responsive mobile, warna primer amber #f59e0b).
- Fitur offline: form pemakaian simpan ke outbox (uuid via `crypto.randomUUID()`), status `pending_sync`; sync manual via tombol; retry aman (idempotency UUID di backend).
- TIDAK ada approval offline.
- Jangan install dependency baru (sudah: react, react-dom, react-router-dom, dexie, vite).
- Pastikan `npm run build` lolos.
## Deploy Cloudflare Pages (CATATAN PENTING)
Token Cloudflare yang tersedia punya **IP restriction** — hanya IP lokal (`182.9.226.116`) yang diizinkan.
IP GitHub Actions dan server cPanel (`101.50.1.74`) ditolak dengan `Authentication error [code: 10000]`.
Karena itu deploy OTOMATIS lewat GitHub Actions TIDAK bisa dipakai sampai token diganti dengan token tanpa IP restriction.

### Deploy manual dari lokal (working)
```bash
cd /mnt/DiskD/Projects/sipkmk-mandor-mobile
VITE_API_BASE=http://curious-lime-sloth.101-50-1-74.cpanel.site/api npm run build
export CLOUDFLARE_API_TOKEN='<token>'
export CLOUDFLARE_ACCOUNT_ID='4a7d3bef1e03585177e274194cab3aa7'
npx --yes wrangler@3.99.0 pages deploy dist --project-name=sipkmk-mandor --branch=master
```
URL produksi: https://sipkmk-mandor.pages.dev

### Mengaktifkan CI kembali
Buat token CF baru tanpa IP restriction (permission: Account → Cloudflare Pages → Edit), simpan sebagai
GitHub Secrets `CLOUDFLARE_API_TOKEN` & `CLOUDFLARE_ACCOUNT_ID`, lalu restore workflow:
`git show 4b2ced0:.github/workflows/deploy.yml > .github/workflows/deploy.yml` (dari repo lama) atau tulis ulang.
