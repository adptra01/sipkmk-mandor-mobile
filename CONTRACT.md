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