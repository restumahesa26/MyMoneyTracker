# System Prompt & Specification: Personal Finance Tracker (Next.js + Firebase)

> **Instruksi untuk AI Assistant / IDE Agent:**
> Bertindaklah sebagai Senior Full-Stack Web Developer & Firebase Architect. Bangun aplikasi web pencatatan keuangan pribadi (*Personal Finance Management Web App*) yang modern, elegan, responsif, dan kaya fitur dengan **Firebase (Firestore & Auth)** sebagai backend.

---

## 1. TECH STACK & ARSITEKTUR

- **Framework:** Next.js (App Router, TypeScript)
- **Database & Backend:** Firebase Client SDK v10+ (Cloud Firestore) + Firebase Authentication (Google Sign-In & Email/Password)
- **UI & Styling:** Tailwind CSS, Lucide React (Icons), Framer Motion (Mikro-interaksi)
- **Komponen UI:** Shadcn UI / Radix Primitives (Dialog, Popover, Dropdown, Tabs, Calendar, Select, Tooltip, Sonner Toast)
- **Charts / Visualisasi:** Recharts
- **Form Handling & Validasi:** React Hook Form + Zod
- **Tema:** `next-themes` (Dark Mode & Light Mode dengan transisi elegan)
- **Date Utilities:** `date-fns`

---

## 2. PANDUAN DESAIN & UI/UX (Modern & Elegant)

- **Palette & Typography:**
  - **Light Mode:** Background bersih (`#F8FAFC`), Card putih murni dengan border halus (`border-slate-200/80`), shadow elevasi lembut.
  - **Dark Mode:** Background gelap premium (`#0B0F17` / `#0F172A`), Card slate gelap (`#1E293B` / `#111827`) dengan aksen border tipis (`border-slate-800`).
  - **Aksen Warna:** Emerald/Teal untuk Uang Masuk (+), Rose/Crimson untuk Uang Keluar (-), Indigo/Violet untuk Analisis & Ringkasan.
- **Micro-interactions:** Skeleton loading saat Firestore fetching, animasi feedback saat submit, toast notifications (Sonner) saat transaksi berhasil disimpan/dihapus.
- **Responsif:** Mobile-first design yang nyaman diakses via Smartphone maupun Desktop layar lebar.

---

## 3. FITUR UTAMA & SPESIFIKASI DETAIL

### A. Autentikasi Pengguna (Multi-User Ready)
- Login / Register dengan Google Auth (Popup/Redirect) & Email/Password via Firebase Authentication.
- State listener `onAuthStateChanged` terintegrasi dengan Context API / Zustand.
- Protected Route: Halaman dashboard hanya bisa diakses jika user sudah login.

### B. Quick Action & Pencatatan Transaksi (Modal / Halaman Input)
1. **Tipe Transaksi:** Uang Masuk (Income) / Uang Keluar (Expense) / Transfer Antar Dompet.
2. **Fleksibilitas Tanggal (Backdating Support):**
   - Tombol Cepat: **"Hari Ini"**, **"Kemarin"**.
   - **Custom Date Picker:** Kalender interaktif untuk memilih tanggal spesifik di masa lalu (dengan input jam opsional).
3. **Detail Input:**
   - **Nominal (Amount):** Formatter mata uang otomatis (IDR / Rupiah, contoh: `Rp 50.000`).
   - **Kategori:** Dropdown dinamis tersinkronisasi dari Firestore.
   - **Dompet/Akun Sumber:** (BCA, Mandiri, Cash, Gopay, dll.).
   - **Catatan/Keterangan:** Input teks deskripsi transaksi.
   - **Tags:** (Opsional, misal: `#liburan`, `#kantor`, `#kebutuhan-pokok`).

### C. Dashboard Interaktif & Fleksibel
1. **Global Date Range Filter (Krusial):**
   - Preset Filter: **Hari Ini**, **7 Hari Terakhir (Mingguan)**, **Bulan Ini**, **Bulan Lalu**, **Kustom Bulan (e.g. Juli 2026)**, dan **Custom Date Range (Rentang Tanggal Tertentu)**.
2. **Scorecard Summary Cards:**
   - Total Saldo Bersih Saat Ini.
   - Total Pemasukan (sesuai filter aktif) + perbandingan % vs periode sebelumnya.
   - Total Pengeluaran (sesuai filter aktif) + perbandingan % vs periode sebelumnya.
   - *Net Savings Rate* (% uang yang tersimpan dari total pemasukan).
   - Rata-rata Pengeluaran Harian (*Daily Burn Rate*).
3. **Daftar Transaksi Terbaru:**
   - Tabel/List bersih dengan badge kategori berwarna, nominal (+ hijau / - merah), tanggal transaksi, dan tombol edit/delete.
   - Search bar & filter instan berdasarkan kategori/tipe.

### D. Modul Analisis Keuangan Mendalam (Deep Financial Analytics)
1. **Cashflow Trend Chart:** Area/Line chart interaktif membandingkan kurva Income vs Expense harian/mingguan.
2. **Expense Breakdown by Category:** Donut Chart interaktif dengan persentase dan daftar peringkat kategori pengeluaran terbesar (*Top Spending Categories*).
3. **Income Source Breakdown:** Donut/Bar Chart distribusi sumber pemasukan (Gaji, Freelance, Investasi, Bisnis).
4. **Day of Week & Time Pattern Analysis:** Bar chart pengeluaran berdasarkan hari (Senin - Minggu).
5. **Budget vs Actual Tracking:** Progress bar realisasi anggaran per kategori dengan indikator warna (Aman: Hijau, Waspada: Kuning >80%, Overbudget: Merah >100%).
6. **Financial Health Metrics & Insights:**
   - Rasio Tabungan (Savings Ratio).
   - Proyeksi *Cash Runway* / estimasi total pengeluaran sampai akhir bulan.
   - Highlight pengeluaran terbesar.

### E. Menu Pengaturan & Master Data (Settings)
1. **Manajemen Kategori:**
   - Tambah, Edit, Hapus kategori Pemasukan & Pengeluaran ke Firestore.
   - Kustomisasi Icon (Lucide Icons) dan Color Picker untuk setiap kategori.
   - Fitur Set Budget Bulanan per kategori.
2. **Manajemen Dompet / Akun (Wallets & Accounts):**
   - Tambah dompet (Bank Transfer, E-Wallet, Cash, Tabungan, Kartu Kredit).
   - Atur saldo awal (*Initial Balance*).
3. **Preferensi Aplikasi:**
   - Pilihan Tema: Light, Dark, System.
   - Format Mata Uang & Angka (Default: IDR - Rp).
   - Export Data (Export to CSV / JSON).

---

## 4. STRUKTUR DATABASE CLOUD FIRESTORE

Struktur data dibuat tersarang di bawah `users/{userId}` untuk keamanan dan isolasi data antar pengguna:

```text
firestore
├── users/ (collection)
│   └── {userId}/ (document)
│       ├── profile: { name, email, currency: "IDR", createdAt }
│       │
│       ├── accounts/ (sub-collection)
│       │   └── {accountId}/ (document)
│       │       ├── name: string ("BCA", "Gopay", "Cash")
│       │       ├── type: "BANK" | "E_WALLET" | "CASH" | "CREDIT"
│       │       ├── balance: number
│       │       ├── icon: string (e.g. "Wallet", "CreditCard")
│       │       ├── color: string (hex code)
│       │       └── createdAt: Timestamp
│       │
│       ├── categories/ (sub-collection)
│       │   └── {categoryId}/ (document)
│       │       ├── name: string ("Makanan & Minuman", "Gaji")
│       │       ├── type: "INCOME" | "EXPENSE"
│       │       ├── icon: string (e.g. "Utensils", "Briefcase")
│       │       ├── color: string (hex code)
│       │       ├── budgetLimit: number | null
│       │       └── createdAt: Timestamp
│       │
│       └── transactions/ (sub-collection)
│           └── {transactionId}/ (document)
│               ├── type: "INCOME" | "EXPENSE" | "TRANSFER"
│               ├── amount: number
│               ├── date: Timestamp (Mendukung tanggal lampau/kemarin/custom)
│               ├── description: string
│               ├── categoryId: string
│               ├── categoryName: string
│               ├── accountId: string
│               ├── accountName: string
│               ├── tags: string[]
│               ├── createdAt: Timestamp
│               └── updatedAt: Timestamp