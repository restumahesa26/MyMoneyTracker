<div align="center">

# 💎 MyMoneyTracker (MMT)
### *Next-Gen Personal Finance & Smart Wealth Operating System*

[![Next.js](https://img.shields.io/badge/Next.js-14.2.23-black?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Firebase](https://img.shields.io/badge/Firebase_Firestore-Cloud_Sync-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)](https://firebase.google.com/)
[![Framer Motion](https://img.shields.io/badge/Framer_Motion-Smooth_FX-0055FF?style=for-the-badge&logo=framer&logoColor=white)](https://www.framer.com/motion/)
[![License](https://img.shields.io/badge/License-MIT-emerald?style=for-the-badge)](LICENSE)

<br />

> **MyMoneyTracker** adalah platform manajemen keuangan pribadi modern dengan estetika futuristik *glassmorphism*, pelacakan mutasi multi-rekening/e-wallet secara *real-time*, analitik arus kas mendalam (*deep analytics*), serta sistem **Dual-Mode Data Engine** (Cloud Firebase vs Offline JSON Dummy Data).

[🚀 Live Preview](#-fitur-unggulan) • [✨ Fitur Utama](#-fitur-unggulan) • [⚙️ Panduan Instalasi](#️-panduan-instalasi--menjalankan-proyek) • [📁 Struktur Folder](#-arsitektur--struktur-direktori) • [🛡️ Keamanan & Data](#-dual-mode-data-engine)

---

</div>

<br />

## 🌟 Mengapa MyMoneyTracker?

MyMoneyTracker dirancang untuk mengatasi masalah lambatnya aplikasi pencatatan keuangan konvensional. Dengan mengusung paradigma **Instant 0ms Feedback**, pengguna dapat langsung mencatat transaksi harian tanpa perlu menunggu proses *data-crunching* metrik yang berat di awal.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                             │
│   ⚡ Catat Cepat ──► 💳 Multi-Dompet ──► 📊 Executive Dashboard ──► 🧠 AI Pro│
│     (Halaman Utama)   (BCA, GoPay, Kas)    (5 KPI Scorecards)     Analytics │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## ✨ Fitur Unggulan

### 1. ⚡ Stasiun Pencatatan Instan (*Catat Cepat - Home View*)
- **Fokus Transaksi Cepat**: Halaman utama aplikasi langsung menyajikan konsol input pengeluaran, pemasukan, dan transfer saldo antar dompet.
- **Chip Nominal Cepat**: Tombol pintas instan (`+10rb`, `+20rb`, `+50rb`, `+100rb`, `+500rb`, `+1jt`) untuk pengisian nominal dalam 1 sentuhan.
- **Pintasan Tanggal & Waktu**: Tombol cepat *"Hari Ini"*, *"Kemarin"*, dan *datetime picker* fleksibel untuk mencatat transaksi tanggal lampau (*backdate*).
- **Pemilih Visual Kategori & Dompet**: Ikon visual warna-warni yang langsung menampilkan sisa saldo terkini secara *live*.
- **Perayaan Confetti**: Animasi partikel perayaan interaktif setiap kali mencatat pemasukan atau transaksi berhasil.

### 2. 📊 Executive Financial Dashboard (`/dashboard`)
- **5 KPI Scorecards Canggih**:
  - 💰 **Total Saldo Bersih (*Net Worth*)** — Agregasi seluruh rekening & aset.
  - 📈 **Total Pemasukan & Pertumbuhan %** vs periode sebelumnya.
  - 📉 **Total Pengeluaran & Pertumbuhan %** vs periode sebelumnya.
  - 🎯 **Tingkat Tabungan (*Savings Rate %*)** — Efisiensi arus kas.
  - 🔥 **Laju Pembakaran Harian (*Daily Burn Rate*)** — Rata-rata pengeluaran per hari.
- **Cashflow Area Trend Graph**: Grafik visual gradien *Smooth Curved Line Chart* interaktif dengan Recharts.
- **Category Donut Breakdown**: Distribusi alokasi pengeluaran per kategori secara visual.
- **Financial Health Insights**: Analisis otomatis kesehatan keuangan & rekomendasi berbasis aturan 50/30/20.

### 3. 🧠 Analisis Keuangan Mendalam (`/analytics`)
- **Pola Pengeluaran Hari dalam Seminggu**: Bar chart analisis hari apa Anda paling boros.
- **Pemantauan Budget vs Realisasi**: Progress bar dengan sistem *warning indicator* dinamis (Aman, Waspada, Overbudget).
- **Proyeksi Daya Tahan Keuangan (*Cash Runway*)**: Estimasi berapa bulan cadangan dana Anda dapat bertahan jika tanpa penghasilan.

### 4. 💳 Manajemen Multi-Dompet & Rekening (`/wallets`)
- Kelola berbagai jenis rekening: **Bank Transfer** (BCA, Mandiri, BRI, dll), **E-Wallet** (GoPay, OVO, Dana), **Kas Tunai**, dan **Investasi**.
- Pemilih warna tema kartu (*Color Palette*) dan ikon dinamis kustom.
- Mutasi saldo otomatis saat transaksi dicatat, diedit, atau dihapus.
- Fitur **Transfer Antar Dompet** dengan validasi kecukupan saldo.

### 5. 🏷️ Kategori & Manajemen Batas Anggaran (`/categories`)
- Kustomisasi kategori tak terbatas untuk tipe Pemasukan & Pengeluaran.
- Fitur penetapan **Batas Budget Bulanan (*Monthly Budget Limit*)**.
- Tombol **"Muat Kategori Bawaan"** untuk mengimpor template kategori standar secara instan.

### 6. 🌐 Dual-Mode Data Engine (Cloud vs Local JSON)
- ☁️ **Mode Data Real (Firebase Cloud Firestore)**: Menyimpan & menyinkronkan data secara *real-time* di bawah UID autentikasi Google atau Email/Password Anda. Mulai dengan akun bersih (*clean slate*).
- 📁 **Mode Dummy / Mock Data (JSON)**: Menggunakan data simulasi realistis dari [`src/data/dummyData.json`](file:///d:/Project%20Web/2026/my_money_tracker/src/data/dummyData.json) yang disimpan di LocalStorage peramban untuk pengujian *offline* tanpa memerlukan koneksi internet/Firebase.
- Beralih antar mode hanya dengan 1 klik pada menu **Pengaturan (`/settings`)**.

### 7. 🎨 Desain Ultra-Modern & UX Premium
- **Full Fluid Container**: Tampilan desktop memanfaatkan lebar layar secara optimal (*container-fluid* dengan margin ergonomis).
- **Mobile Drawer & Bottom Navigation**: Navigasi responsif untuk smartphone dengan tombol FAB modal melayang.
- **Portal Modal System**: Semua pop-up modal di-*render* via React Portal (`document.body`) dengan `z-[100]` sehingga tidak pernah terpotong atau tertutup *Navbar*.
- **Top Shimmer Progress Bar**: Indikator *loading bar* gradien di bagian atas layar dengan *Instant 0ms click feedback*.
- **Tema Terang & Gelap (*Dark / Light / System Theme*)** dengan transisi halus.
- **Portabilitas Data Lengkap**: Ekspor data ke format **.CSV** (spreadsheet) dan cadangan lengkap **.JSON** (Backup & Restore).

---

## 🛠️ Tech Stack & Ekosistem

| Lapisan | Teknologi | Deskripsi |
| :--- | :--- | :--- |
| **Framework** | [Next.js 14 (App Router)](https://nextjs.org/) | Server & Client Components berkinerja tinggi |
| **Language** | [TypeScript 5](https://www.typescriptlang.org/) | *Type-safety* ketat dan arsitektur kode bersih |
| **Styling** | [Tailwind CSS 3.4](https://tailwindcss.com/) | *Utility-first* CSS modern dengan kustom tema |
| **Icons** | [Lucide React](https://lucide.dev/) | Koleksi ikon vektor SVG elegan & konsisten |
| **Animations** | [Framer Motion](https://www.framer.com/motion/) | Transisi halaman & mikro-animasi UI |
| **Charts** | [Recharts](https://recharts.org/) | Grafik visualisasi data interaktif & responsif |
| **Database & Auth** | [Google Firebase v10](https://firebase.google.com/) | Cloud Firestore & Firebase Authentication |
| **FX & Feedback** | [Canvas Confetti](https://www.npmjs.com/package/canvas-confetti) + [Sonner](https://sonner.emilkowal.ski/) | Notifikasi toast dan efek visual perayaan |
| **Date Utility** | [date-fns](https://date-fns.org/) | Manipulasi dan format tanggal lokal |

---

## 📁 Arsitektur & Struktur Direktori

```text
my_money_tracker/
├── src/
│   ├── app/                          # Next.js 14 App Router Pages
│   │   ├── analytics/page.tsx        # Pro Analytics & Cash Runway
│   │   ├── categories/page.tsx       # Manajemen Kategori & Budget Limit
│   │   ├── dashboard/page.tsx        # Executive Dashboard & Scorecards
│   │   ├── login/page.tsx            # Autentikasi Google, Email & Demo
│   │   ├── settings/page.tsx         # Pengaturan Sumber Data & Tema
│   │   ├── transactions/page.tsx     # Riwayat Transaksi & Filter Multi-Kriteria
│   │   ├── wallets/page.tsx          # Manajemen Dompet & Mutasi Saldo
│   │   ├── layout.tsx                # Root HTML Layout & Providers
│   │   ├── loading.tsx               # Next.js App Router Suspense Loader
│   │   ├── globals.css               # Global CSS & Tailwind Directives
│   │   └── page.tsx                  # Halaman Utama: Catat Cepat
│   ├── components/
│   │   ├── analytics/                # Komponen Grafik Cashflow & Breakdown
│   │   ├── categories/               # Modal & List Kategori
│   │   ├── dashboard/                # Scorecards, Date Filter, & Transaksi Terkini
│   │   ├── layout/                   # Navbar, Sidebar, MobileNav, PageTransition
│   │   ├── transactions/             # Modal Transaksi & Transfer Saldo
│   │   ├── ui/                       # DynamicIcon & ModalPortal (document.body)
│   │   └── wallets/                  # Kartu Dompet & Modal Tambah Akun
│   ├── context/
│   │   ├── AuthContext.tsx           # State Autentikasi Firebase & Guest Mode
│   │   └── FinanceContext.tsx        # State Global Transaksi, Mutasi, & Data Source
│   ├── data/
│   │   └── dummyData.json            # Dataset Simulasi Default Offline
│   ├── lib/
│   │   ├── constants.ts              # Palet Warna & Ikon Bawaan
│   │   ├── firebase.ts               # Inisialisasi Firebase Client SDK
│   │   ├── formatters.ts             # Formatter Rupiah (IDR) & Tanggal
│   │   └── utils.ts                  # Classnames merge & generator
│   └── types/
│       └── index.ts                  # Deklarasi Type & Interface TypeScript
├── .env.example                      # Contoh Format Environment Variable
├── .gitignore                        # Konfigurasi File Git Ignore
├── package.json                      # Dependencies & Script Project
├── tailwind.config.ts                # Konfigurasi Desain & Animasi Tailwind
└── tsconfig.json                     # Konfigurasi TypeScript Compiler
```

---

## ⚡ Panduan Instalasi & Menjalankan Proyek

### 1. Kloning Repositori
```bash
git clone https://github.com/restumahesa26/MyMoneyTracker.git
cd MyMoneyTracker
```

### 2. Instalasi Dependencies
```bash
npm install
```

### 3. Konfigurasi Environment Variables (Opsional untuk Mode Cloud Firebase)
Buat file `.env.local` di direktori utama (atau gunakan mode **Dummy Data JSON** yang langsung aktif tanpa konfigurasi):

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

### 4. Jalankan Development Server
```bash
npm run dev
```

Buka peramban Anda di **`http://localhost:3000`** 🎉.

### 5. Build untuk Produksi
```bash
npm run build
npm run start
```

---

## 💡 Navigasi Halaman Utama

| Rute | Nama Halaman | Fungsi Utama |
| :--- | :--- | :--- |
| `/` | **Catat Cepat** | Formulir instan untuk mencatat pengeluaran, pemasukan, dan transfer saldo |
| `/dashboard` | **Dashboard & Ringkasan** | 5 Kartu Skor Metrik, Grafik Arus Kas, Diagram Kategori, & Ringkasan |
| `/analytics` | **Analisis Mendalam** | Grafik belanja harian, rasio tabungan, budget tracking, & *cash runway* |
| `/transactions`| **Riwayat Transaksi** | Pencarian, multi-filter, ekspor CSV, dan manajemen data transaksi |
| `/wallets` | **Dompet & Akun** | Pengelolaan saldo dompet (BCA, Mandiri, GoPay, OVO, Cash) |
| `/categories` | **Kategori & Budget** | Kustomisasi kategori dan pembatasan pagu anggaran bulanan |
| `/settings` | **Pengaturan** | Penggantian sumber data (Firebase vs Dummy JSON), tema, & backup |

---

## 🤝 Kontribusi & Dukungan

Kontribusi selalu terbuka! Jika Anda memiliki ide perbaikan atau menemukan kendala:
1. *Fork* repositori ini
2. Buat branch fitur baru (`git checkout -b feature/FiturKeren`)
3. *Commit* perubahan Anda (`git commit -m 'Menambahkan Fitur Keren'`)
4. *Push* ke branch (`git push origin feature/FiturKeren`)
5. Ajukan sebuah **Pull Request**

---

## 📜 Lisensi

Didistribusikan di bawah lisensi **MIT License**. Lihat file `LICENSE` untuk rincian selengkapnya.

---

<div align="center">

Dibuat dengan ❤️ & dedikasi untuk kebebasan finansial Anda oleh **[Restu Mahesa](https://github.com/restumahesa26)**.

⭐ *Jangan lupa berikan bintang (Star) pada repositori ini jika Anda menyukainya!* ⭐

</div>
