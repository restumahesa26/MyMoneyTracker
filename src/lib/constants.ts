import { Account, Category } from "@/types";

export const DEFAULT_ACCOUNTS: Account[] = [
  {
    id: "acc_bca",
    name: "Bank BCA",
    type: "BANK",
    balance: 14500000,
    icon: "Landmark",
    color: "#2563EB", // Blue
    accountNumber: "8830129841",
    createdAt: new Date().toISOString(),
  },
  {
    id: "acc_mandiri",
    name: "Bank Mandiri",
    type: "BANK",
    balance: 8250000,
    icon: "Building2",
    color: "#0284C7", // Sky
    accountNumber: "13700192847",
    createdAt: new Date().toISOString(),
  },
  {
    id: "acc_gopay",
    name: "GoPay",
    type: "E_WALLET",
    balance: 750000,
    icon: "Smartphone",
    color: "#059669", // Emerald
    createdAt: new Date().toISOString(),
  },
  {
    id: "acc_ovo",
    name: "OVO",
    type: "E_WALLET",
    balance: 320000,
    icon: "Zap",
    color: "#7C3AED", // Violet
    createdAt: new Date().toISOString(),
  },
  {
    id: "acc_cash",
    name: "Uang Tunai (Dompet)",
    type: "CASH",
    balance: 650000,
    icon: "Wallet",
    color: "#D97706", // Amber
    createdAt: new Date().toISOString(),
  },
];

export const DEFAULT_CATEGORIES: Category[] = [
  // EXPENSE CATEGORIES
  {
    id: "cat_food",
    name: "Makanan & Minuman",
    type: "EXPENSE",
    icon: "Utensils",
    color: "#F43F5E", // Rose
    budgetLimit: 3000000,
    createdAt: new Date().toISOString(),
  },
  {
    id: "cat_transport",
    name: "Transportasi & Bensin",
    type: "EXPENSE",
    icon: "Car",
    color: "#F97316", // Orange
    budgetLimit: 1200000,
    createdAt: new Date().toISOString(),
  },
  {
    id: "cat_bills",
    name: "Tagihan & Utilitas (Listrik, Wifi)",
    type: "EXPENSE",
    icon: "Receipt",
    color: "#EAB308", // Yellow
    budgetLimit: 1500000,
    createdAt: new Date().toISOString(),
  },
  {
    id: "cat_shopping",
    name: "Belanja & Kebutuhan",
    type: "EXPENSE",
    icon: "ShoppingBag",
    color: "#EC4899", // Pink
    budgetLimit: 2000000,
    createdAt: new Date().toISOString(),
  },
  {
    id: "cat_entertainment",
    name: "Hiburan & Rekreasi",
    type: "EXPENSE",
    icon: "Gamepad2",
    color: "#8B5CF6", // Purple
    budgetLimit: 1000000,
    createdAt: new Date().toISOString(),
  },
  {
    id: "cat_health",
    name: "Kesehatan & Medis",
    type: "EXPENSE",
    icon: "HeartPulse",
    color: "#06B6D4", // Cyan
    budgetLimit: 800000,
    createdAt: new Date().toISOString(),
  },
  {
    id: "cat_education",
    name: "Edukasi & Buku",
    type: "EXPENSE",
    icon: "GraduationCap",
    color: "#3B82F6", // Blue
    budgetLimit: 500000,
    createdAt: new Date().toISOString(),
  },
  {
    id: "cat_social",
    name: "Sedekah & Donasi",
    type: "EXPENSE",
    icon: "HeartHandshake",
    color: "#10B981", // Emerald
    budgetLimit: 1000000,
    createdAt: new Date().toISOString(),
  },
  {
    id: "cat_other_exp",
    name: "Pengeluaran Lainnya",
    type: "EXPENSE",
    icon: "CircleEllipsis",
    color: "#64748B", // Slate
    budgetLimit: 500000,
    createdAt: new Date().toISOString(),
  },

  // INCOME CATEGORIES
  {
    id: "cat_salary",
    name: "Gaji Utama",
    type: "INCOME",
    icon: "Briefcase",
    color: "#10B981", // Emerald
    createdAt: new Date().toISOString(),
  },
  {
    id: "cat_freelance",
    name: "Freelance & Side Project",
    type: "INCOME",
    icon: "Laptop",
    color: "#06B6D4", // Cyan
    createdAt: new Date().toISOString(),
  },
  {
    id: "cat_investment",
    name: "Investasi & Dividen",
    type: "INCOME",
    icon: "TrendingUp",
    color: "#6366F1", // Indigo
    createdAt: new Date().toISOString(),
  },
  {
    id: "cat_business",
    name: "Bisnis / Usaha",
    type: "INCOME",
    icon: "Store",
    color: "#F59E0B", // Amber
    createdAt: new Date().toISOString(),
  },
  {
    id: "cat_gift",
    name: "Hadiah & Bonus",
    type: "INCOME",
    icon: "Gift",
    color: "#EC4899", // Pink
    createdAt: new Date().toISOString(),
  },
  {
    id: "cat_other_inc",
    name: "Pemasukan Lainnya",
    type: "INCOME",
    icon: "PlusCircle",
    color: "#64748B", // Slate
    createdAt: new Date().toISOString(),
  },
];

export const AVAILABLE_ICONS = [
  "Utensils",
  "Car",
  "Receipt",
  "ShoppingBag",
  "Gamepad2",
  "HeartPulse",
  "GraduationCap",
  "HeartHandshake",
  "Briefcase",
  "Laptop",
  "TrendingUp",
  "Store",
  "Gift",
  "Landmark",
  "Building2",
  "Smartphone",
  "Zap",
  "Wallet",
  "CreditCard",
  "Coffee",
  "Home",
  "Plane",
  "Dumbbell",
  "Film",
  "Music",
  "Tv",
  "Shield",
  "PiggyBank",
  "DollarSign",
  "Tag",
  "Sparkles",
  "CircleEllipsis",
];

export const COLOR_PALETTE = [
  "#10B981", // Emerald
  "#059669", // Dark Emerald
  "#06B6D4", // Cyan
  "#0284C7", // Sky
  "#2563EB", // Blue
  "#6366F1", // Indigo
  "#7C3AED", // Violet
  "#8B5CF6", // Purple
  "#EC4899", // Pink
  "#F43F5E", // Rose
  "#E11D48", // Crimson
  "#F97316", // Orange
  "#F59E0B", // Amber
  "#EAB308", // Yellow
  "#84CC16", // Lime
  "#64748B", // Slate
];
