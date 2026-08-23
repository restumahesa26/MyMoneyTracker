export type TransactionType = "INCOME" | "EXPENSE" | "TRANSFER";

export type AccountType = "BANK" | "E_WALLET" | "CASH" | "CREDIT" | "INVESTMENT";

export type DataSourceMode = "FIREBASE" | "LOCAL_DUMMY";

export interface Account {
  id: string;
  name: string;
  type: AccountType;
  balance: number;
  icon: string;
  color: string;
  accountNumber?: string;
  createdAt: string; // ISO string or timestamp string
}

export interface Category {
  id: string;
  name: string;
  type: "INCOME" | "EXPENSE";
  icon: string;
  color: string;
  budgetLimit?: number | null; // Monthly budget limit in IDR
  createdAt: string;
}

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  date: string; // YYYY-MM-DD or ISO string
  description: string;
  categoryId: string;
  categoryName: string;
  categoryIcon?: string;
  categoryColor?: string;
  accountId: string;
  accountName: string;
  accountIcon?: string;
  toAccountId?: string; // For transfers
  toAccountName?: string;
  tags?: string[];
  createdAt: string;
  updatedAt?: string;
}

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  currency: string;
  isDemo?: boolean;
  createdAt: string;
}

export type DateRangePreset =
  | "today"
  | "yesterday"
  | "last7days"
  | "last30days"
  | "thisMonth"
  | "lastMonth"
  | "thisYear"
  | "customMonth"
  | "customRange"
  | "all";

export interface DateFilterState {
  preset: DateRangePreset;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  selectedMonth?: number; // 0-11
  selectedYear?: number;
  label: string;
}

export interface DashboardMetrics {
  totalBalance: number;
  totalIncome: number;
  totalExpense: number;
  netSavings: number;
  savingsRate: number; // percentage
  dailyBurnRate: number;
  previousIncome: number;
  previousExpense: number;
  incomeGrowth: number; // % vs previous period
  expenseGrowth: number; // % vs previous period
  transactionCount: number;
}
