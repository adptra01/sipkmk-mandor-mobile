# Product Requirements Document (PRD)
# Sistem Informasi Pengendalian Material Konstruksi (SI-PKMK)

## 1. Pendahuluan & Ringkasan Eksekutif
Sistem Informasi Pengendalian Material Konstruksi (SI-PKMK) adalah platform digital terintegrasi untuk mencatat, mengendalikan, dan mengaudit pergerakan material proyek konstruksi mulai dari perencanaan kebutuhan (BoQ/RAB), penerimaan di lapangan, penyimpanan di gudang, hingga penggunaan pada pekerjaan fisik proyek.

Tujuan utama sistem adalah mencegah pemborosan (*waste*), menghindari selisih stok fisik vs catatan (*stock discrepancy*), mendokumentasikan bukti fisik material secara efisien, serta menyediakan jejak audit (*audit trail*) transparan untuk keperluan pengawasan dan tata kelola proyek.

---

## 2. Sasaran & Parameter Keputusan

| Parameter | Keputusan | Rasional / Standar |
|---|---|---|
| **Bahasa Antarmuka (UI)** | Bahasa Indonesia | Memudahkan operasional staf logistik, pengawas lapangan, mandor, dan manajemen. |
| **Frekuensi Revisi Desain** | Estimasi Rata-rata Industri (1–2x per fase / addendum proyek) | Siklus revisi BoQ diakomodasi bertahap dengan mekanisme versioning tanpa merusak historis data sebelumnya. |
| **Audit Log** | Wajib (*Mandatory*) | Mencatat identitas pengguna, timestamp, alamat IP, tipe aksi, dan delta data (sebelum/sesudah) untuk setiap mutasi/perubahan data. |
| **Kompresi Gambar** | Otomatis di sisi sistem | Foto nota, surat jalan, dan fisik material dikompresi otomatis (target < 500KB per file) untuk efisiensi penyimpanan dan kelancaran akses lapangan dengan koneksi seluler terbatas. |

---

## 3. Peran Pengguna (*User Roles & Permissions*)

1. **Super Admin / System Administrator:** Pengaturan sistem, manajemen user, backup, dan monitoring audit log.
2. **Project Manager / Site Manager:** Melihat dashboard kemajuan, persetujuan revisi desain/BoQ, persetujuan permintaan material skala besar.
3. **Site Engineer / Quantity Surveyor (QS):** Input BoQ/RAB rencana material, input pengajuan perubahan desain (addendum), analisis deviasi kebutuhan.
4. **Petugas Gudang & Logistik Lapangan:** Pencatatan kedatangan material (surat jalan + foto), pencatatan pengeluaran material ke mandor/subkon, stock opname berkala.
5. **Quality Control (QC) / Pengawas:** Verifikasi kualitas material masuk (diterima/ditolak dengan catatan & foto inspeksi).
6. **Auditor Internal / Pemilik Proyek:** Akses *read-only* untuk melihat laporan, pergerakan stok, dan rekam audit.

---

## 4. Kebutuhan Fungsional (*Functional Requirements*)

### 4.1 Modul Master Data & Manajemen Proyek
- Kelola data multi-proyek (Nama proyek, lokasi, durasi, nilai kontrak).
- Master data material (Kode material, nama, kategori/tipe, spesifikasi teknis, satuan baku: m3, sak, batang, kg, dll.).
- Master data supplier / vendor dan subkontraktor/mandor.
- Master data lokasi gudang / staging area proyek.

### 4.2 Perencanaan Material & Integrasi Revisi Desain
- Input Bill of Quantities (BoQ) rencana material per item pekerjaan/WBS.
- Fitur revisi desain bertahap (Versioning: Rev 0, Rev 1, Rev 2):
  - Pencatatan alasan revisi, tanggal disetujui, dan dokumen pendukung.
  - Perhitungan otomatis deviasi kebutuhan material (tambah/kurang).
  - Pembekuan (*lock*) data revisi lama untuk menjaga integritas data historis.

### 4.3 Logistik & Pergerakan Material (*Material Flow*)
- **Penerimaan Material (Material Inflow):**
  - Input nomor PO, nomor surat jalan (DO), nama supplier, tanggal kedatangan.
  - Form checklist inspeksi kualitas (Lolos/Reject).
  - Upload foto surat jalan dan foto fisik barang dengan kompresi gambar otomatis.
- **Pengeluaran Material (Material Outflow):**
  - Input bukti permintaan pengeluaran material (BPM / Material Requisition Form).
  - Pencatatan zona/bagian pekerjaan dan penerima material.
- **Retur & Scrap/Waste:**
  - Pencatatan material sisa/rusak/retur ke supplier atau gudang utama.
- **Stock Opname:**
  - Penyesuaian stok berkala dengan catatan selisih dan approval berjenjang.

### 4.4 Modul Upload & Kompresi Gambar
- Menerima format: JPG, JPEG, PNG, WEBP.
- Kompresi otomatis di sisi server/backend (maksimum resolusi Full HD 1920x1080, target kompresi rasio 60–80% kualitas visual terjaga).
- Penyimpanan file terstruktur per proyek dan tanggal.
- Pembuatan thumbnail untuk preview cepat pada tabel/daftar.

### 4.5 Modul Audit Log (*Audit Trail*)
- Pencatatan otomatis setiap aktivitas kritis:
  - Login, logout, gagal login.
  - Penambahan, pengubahan, dan penghapusan data transaksi material.
  - Persetujuan (*approval*) dan penolakan revisi/pengeluaran material.
- Struktur data log: ID transaksi, User ID, Role, Waktu (ISO 8601), Tipe Aksi (CREATE/UPDATE/DELETE/APPROVE), Modul/Tabel, Nilai Sebelum (*Old Value*), Nilai Sesudah (*New Value*), IP Address.
- Data log bersifat *append-only* (tidak dapat diubah/dihapus via UI).

### 4.6 Dashboard & Pelaporan
- Dashboard ringkasan stok kritis (material mendekati batas minimum).
- Grafik perbandingan Rencana (BoQ) vs Realisasi Kedatangan vs Pemakaian Aktual.
- Ekspor laporan ke format Excel (XLSX) dan PDF:
  - Laporan Mutasi Stok (Saldo awal, masuk, keluar, saldo akhir).
  - Laporan Deviasi Revisi Desain.
  - Laporan Log Audit Pengendalian Material.

---

## 5. Kebutuhan Non-Fungsional (*Non-Functional Requirements*)

1. **Bahasa & Aksesibilitas:** 100% antarmuka, notifikasi, pesan validasi, dan label form dalam Bahasa Indonesia baku yang ringkas.
2. **Kinerja Kompresi:** Waktu kompresi gambar rata-rata < 1.5 detik per gambar pada file awal ukuran hingga 10MB.
3. **Respon Sistem:** Waktu muat halaman data tabel < 1 detik untuk 10.000 record dengan paginasi server-side.
4. **Integritas & Keamanan Data:**
   - Password di-hash menggunakan Argon2id atau Bcrypt.
   - Akses API dilindungi token JWT / session terenkripsi.
   - Role-Based Access Control (RBAC) ketat pada tingkat middleware.
5. **Reliabilitas:** Skema backup berkala untuk database dan folder upload media.

---

## 6. Arsitektur Teknis & Pilihan Stack

| Komponen | Teknologi | Peran & Alasan |
|---|---|---|
| **Backend API & Core** | **Laravel 11** | Business logic terpusat, Domain Actions, REST API via API Resources, Auth via **Laravel Sanctum**. |
| **Web Dashboard** | **Filament v3 + Livewire** | Panel Pengawas & Admin: Manajemen Proyek/Unit, RAB/BoQ, verifikasi & approval, laporan, dan RBAC. |
| **Aplikasi Lapangan** | **React 18 + Vite 6 PWA** | Aplikasi Mandor: Input material, foto bukti, offline-first dengan **Dexie/IndexedDB**, outbox + service worker (Workbox), sinkronisasi by UUID. (Flutter dibatalkan — tidak perlu SDK/emulator.) |
| **Database Server** | **MySQL 8** (produksi cPanel) / **MariaDB** (DDEV) | Integritas relasional, transaksi ACID, pencatatan pergerakan stok, dan versioning BoQ/RAB. |
| **Autentikasi & RBAC** | **Laravel Sanctum** + **Spatie Permission** | Token autentikasi mobile & scoping akses berbasis peran dan penugasan proyek. |
| **Audit Trail** | **Spatie Activitylog** | Mencatat riwayat mutasi stok, approval, perubahan RAB, dan transaksi secara otomatis (old vs new values). |
| **Background Processing** | **Redis + Laravel Queue** | Kompresi gambar asinkron, pemrosesan laporan, impor BoQ Excel via **Maatwebsite Excel**. |
| **Dokumentasi API** | **Scramble** | Dokumentasi OpenAPI otomatis (`/docs/api`) untuk konsumsi tim mobile. |
| **Testing & Tooling** | **PHPUnit** (backend) + **Node test runner** (mobile) | Pengujian unit/fitur backend dan pengujian payload/status sinkronisasi mobile. |

### 6.1 Desain Offline-First (Aplikasi Mandor — React PWA)
- **Local Outbox Queue:** Transaksi lapangan dicatat ke Dexie/IndexedDB lokal dengan status `pending_sync` dan diberi `UUID` lokal (`crypto.randomUUID()`).
- **Idempotency Key:** `uuid` dikirim ke backend `POST /api/sync/usages`; retry tidak menduplikasi data (teruji: replay → 409/idempoten).
- **Service Worker (Workbox):** Precache app shell (7 entry) → aplikasi tetap terbuka tanpa sinyal; runtime cache master data (`/api/materials`, `/api/projects`) StaleWhileRevalidate; `/api/sync` NetworkOnly.
- **Auto-sync:** saat event `online` & pesan `SIPKMK_SYNC` dari service worker, antrean dikirim otomatis.
- **Batasan Akses Offline:** Pembuatan catatan pemakaian diizinkan offline; proses *Approval* dan perubahan revisi RAB wajib online (hanya via panel Filament).

### 6.2 Keputusan Multi-Tenancy
- **Default Baseline:** Single Company Multi-Project (dengan kolom `company_id` / `tenant_id` opsional di skema utama untuk antisipasi SaaS masa depan tanpa over-engineering saat MVP).


---

## 7. Rencana Rilis (Milestones)
- **Fase 1 (MVP):** Auth + RBAC, Master Data Proyek & Material, Penerimaan & Pengeluaran Material, Kompresi Gambar, Audit Log Dasar.
- **Fase 2:** Modul Revisi Desain (Versioning BoQ), Laporan Dinamis (Excel/PDF), Stock Opname.
- **Fase 3:** Dashboard Analitik Kebutuhan vs Realisasi, Ekspor Laporan Otomatis, Notifikasi Stok Kritis.

---

## 8. Spesifikasi Aplikasi Mobile (Repo Ini)

### 8.1 Kontrak API (backend cPanel)
Base URL produksi: `http://curious-lime-sloth.101-50-1-74.cpanel.site/api` (bisa dioverride via `VITE_API_BASE`).

| Endpoint | Method | Fungsi |
|---|---|---|
| `/login` | POST | Auth → `{token, user:{id, nama, email, peran[], proyek[]}}` |
| `/me` | GET | Validasi token & data user |
| `/materials` | GET | Master material (Resource berbahasa Indonesia: `kode/nama/satuan`) |
| `/projects` | GET | Proyek yang ditugaskan ke user |
| `/sync/usages` | POST | Kirim transaksi offline (idempoten by UUID) |
| `/photos` | POST | Upload foto bukti (kompresi server WebP) |

### 8.2 Fitur Mobile
- Login Sanctum + restore sesi dari token tersimpan.
- Dashboard: jumlah proyek, antrean pending, status koneksi (Daring/Luring).
- Form pemakaian material: proyek, gudang, tujuan (unit rumah/cost pool), material dinamis, foto dengan kompresi klien (canvas → WebP, maks 1280px, quality 0.7), catatan.
- Outbox IndexedDB: status `pending_sync`/`synced`/`failed`, retry aman, hapus yang tersinkronisasi.
- Sinkronisasi manual & otomatis (event online / service worker message).

### 8.3 Deploy
- Hosting: **Cloudflare Pages** — `https://sipkmk-mandor.pages.dev`.
- Mode: manual dari lokal via `wrangler pages deploy dist` (token CF punya IP restriction → CI GitHub Actions dinonaktifkan; lihat `CONTRACT.md`).

### 8.4 Peran yang Menggunakan Mobile
Mandor / Petugas Gudang / QC lapangan (peran kantor memakai panel Filament di backend).
