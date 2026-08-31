"use client";

import React, { createContext, useContext, useEffect, useState, useMemo } from "react";
import {
  collection,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  Firestore,
} from "firebase/firestore";
import { db, isFirebaseConfigured } from "@/lib/firebase";
import { useAuth } from "./AuthContext";
import {
  Account,
  Category,
  Transaction,
  DateFilterState,
  DashboardMetrics,
  DataSourceMode,
} from "@/types";
import { DEFAULT_CATEGORIES } from "@/lib/constants";
import dummyData from "@/data/dummyData.json";
import { getDateFilterRange } from "@/lib/formatters";
import { generateId, cleanForFirestore } from "@/lib/utils";
import {
  parseISO,
  isWithinInterval,
  startOfDay,
  endOfDay,
  differenceInDays,
  subDays,
} from "date-fns";
import { toast } from "sonner";

interface FinanceContextType {
  accounts: Account[];
  categories: Category[];
  transactions: Transaction[];
  filteredTransactions: Transaction[];
  dateFilter: DateFilterState;
  setDateFilter: (filter: DateFilterState) => void;
  metrics: DashboardMetrics;
  loading: boolean;
  dataSource: DataSourceMode;
  setDataSource: (mode: DataSourceMode) => void;
  addTransaction: (data: Omit<Transaction, "id" | "createdAt">) => Promise<void>;
  updateTransaction: (id: string, data: Partial<Transaction>) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  addAccount: (data: Omit<Account, "id" | "createdAt">) => Promise<void>;
  updateAccount: (id: string, data: Partial<Account>) => Promise<void>;
  deleteAccount: (id: string) => Promise<void>;
  addCategory: (data: Omit<Category, "id" | "createdAt">) => Promise<void>;
  updateCategory: (id: string, data: Partial<Category>) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  loadDefaultCategoriesToReal: () => Promise<void>;
  transferFunds: (
    fromAccountId: string,
    toAccountId: string,
    amount: number,
    description?: string,
    date?: string
  ) => Promise<void>;
  resetToDemoData: () => void;
  resetToDefaultJSON: () => void;
  isBalanceHidden: boolean;
  setIsBalanceHidden: (hidden: boolean) => void;
  toggleBalanceVisibility: (forced?: boolean) => void;
  exportDataJSON: () => string;
  exportDataCSV: () => string;
  importDataJSON: (jsonString: string) => boolean;
}

const FinanceContext = createContext<FinanceContextType>({} as FinanceContextType);

export const FinanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isDemo } = useAuth();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [dateFilter, setDateFilter] = useState<DateFilterState>(
    getDateFilterRange("thisMonth")
  );

  // Data source mode: "FIREBASE" or "LOCAL_DUMMY"
  const [dataSource, setDataSourceState] = useState<DataSourceMode>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("mmt_data_source") as DataSourceMode | null;
      if (saved === "FIREBASE" || saved === "LOCAL_DUMMY") return saved;
    }
    return isFirebaseConfigured() ? "FIREBASE" : "LOCAL_DUMMY";
  });

  const setDataSource = (mode: DataSourceMode) => {
    setDataSourceState(mode);
    if (typeof window !== "undefined") {
      localStorage.setItem("mmt_data_source", mode);
    }
  };

  // Balance visibility privacy state
  const [isBalanceHidden, setIsBalanceHiddenState] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("mmt_hide_balance");
      return saved === "true";
    }
    return false;
  });

  const setIsBalanceHidden = (hidden: boolean) => {
    setIsBalanceHiddenState(hidden);
    if (typeof window !== "undefined") {
      localStorage.setItem("mmt_hide_balance", String(hidden));
    }
  };

  const toggleBalanceVisibility = (forced?: boolean) => {
    const nextVal = typeof forced === "boolean" ? forced : !isBalanceHidden;
    setIsBalanceHidden(nextVal);
    if (nextVal) {
      toast.info("Mode Privasi Aktif", {
        description: "Saldo dompet dan rekening berhasil disembunyikan.",
      });
    } else {
      toast.success("Mode Privasi Nonaktif", {
        description: "Saldo dompet dan rekening kini ditampilkan.",
      });
    }
  };

  // Load Initial Data (Firestore or Local JSON)
  useEffect(() => {
    if (dataSource === "FIREBASE") {
      // Real Data Mode
      if (!user) {
        setAccounts([]);
        setCategories([]);
        setTransactions([]);
        setLoading(false);
        return;
      }

      const useFirestore = isFirebaseConfigured() && Boolean(db) && !isDemo;

      if (useFirestore && db && user) {
        setLoading(true);
        const userId = user.uid;
        const firestore = db as Firestore;

        // Listen to Real Accounts
        const accountsRef = collection(firestore, "users", userId, "accounts");
        const unSubAccounts = onSnapshot(
          accountsRef,
          (snapshot) => {
            const accs = snapshot.docs.map((d) => d.data() as Account);
            setAccounts(accs);
          },
          (error) => {
            console.error("Firestore accounts listener error:", error);
            toast.error(
              "Gagal membaca dompet dari Firestore. Pastikan Firestore Security Rules di Firebase Console mengizinkan akses read/write."
            );
          }
        );

        // Listen to Real Categories
        const categoriesRef = collection(firestore, "users", userId, "categories");
        const unSubCategories = onSnapshot(
          categoriesRef,
          (snapshot) => {
            const cats = snapshot.docs.map((d) => d.data() as Category);
            setCategories(cats);
          },
          (error) => {
            console.error("Firestore categories listener error:", error);
          }
        );

        // Listen to Real Transactions
        const transactionsRef = collection(firestore, "users", userId, "transactions");
        const q = query(transactionsRef, orderBy("date", "desc"));
        const unSubTransactions = onSnapshot(
          q,
          (snapshot) => {
            const txs = snapshot.docs.map((d) => d.data() as Transaction);
            setTransactions(txs);
            setLoading(false);
          },
          (error) => {
            console.error("Firestore transactions listener error:", error);
            setLoading(false);
          }
        );

        return () => {
          unSubAccounts();
          unSubCategories();
          unSubTransactions();
        };
      } else {
        // Real Data Mode but in Demo or offline
        try {
          setLoading(true);
          const realStorageKey = `mmt_real_local_${user?.uid || "custom"}`;
          const localData = localStorage.getItem(realStorageKey);
          if (localData) {
            const parsed = JSON.parse(localData);
            setAccounts(parsed.accounts || []);
            setCategories(parsed.categories || []);
            setTransactions(parsed.transactions || []);
          } else {
            setAccounts([]);
            setCategories([]);
            setTransactions([]);
          }
        } catch (e) {
          setAccounts([]);
          setCategories([]);
          setTransactions([]);
        } finally {
          setLoading(false);
        }
      }
    } else {
      // Local JSON Dummy Data Mode
      try {
        setLoading(true);
        const dummyStorageKey = "mmt_dummy_data";
        const localData = localStorage.getItem(dummyStorageKey);
        if (localData) {
          const parsed = JSON.parse(localData);
          setAccounts(parsed.accounts || (dummyData.accounts as Account[]));
          setCategories(parsed.categories || (dummyData.categories as Category[]));
          setTransactions(parsed.transactions || (dummyData.transactions as Transaction[]));
        } else {
          const initialAcc = dummyData.accounts as Account[];
          const initialCat = dummyData.categories as Category[];
          const initialTx = dummyData.transactions as Transaction[];
          setAccounts(initialAcc);
          setCategories(initialCat);
          setTransactions(initialTx);
          localStorage.setItem(
            dummyStorageKey,
            JSON.stringify({
              accounts: initialAcc,
              categories: initialCat,
              transactions: initialTx,
            })
          );
        }
      } catch (err) {
        console.error("Local dummy data load error:", err);
      } finally {
        setLoading(false);
      }
    }
  }, [user, isDemo, dataSource]);

  // Sync to LocalStorage when in Local Dummy mode or offline real mode
  const persistLocal = (newAcc: Account[], newCat: Category[], newTx: Transaction[]) => {
    try {
      const key =
        dataSource === "LOCAL_DUMMY"
          ? "mmt_dummy_data"
          : `mmt_real_local_${user?.uid || "custom"}`;

      localStorage.setItem(
        key,
        JSON.stringify({
          accounts: newAcc,
          categories: newCat,
          transactions: newTx,
        })
      );
    } catch (e) {
      console.error("Failed to persist to localStorage", e);
    }
  };

  // Helper to load default category templates into Real Data if user wants templates
  const loadDefaultCategoriesToReal = async () => {
    const isOnlineFirestore =
      dataSource === "FIREBASE" && !isDemo && isFirebaseConfigured() && Boolean(db) && Boolean(user);

    if (isOnlineFirestore && db && user) {
      const firestore = db as Firestore;
      for (const cat of DEFAULT_CATEGORIES) {
        await setDoc(doc(firestore, "users", user.uid, "categories", cat.id), cleanForFirestore(cat));
      }
    } else {
      setCategories(DEFAULT_CATEGORIES);
      persistLocal(accounts, DEFAULT_CATEGORIES, transactions);
    }
  };

  // Filter Transactions based on active DateFilter
  const filteredTransactions = useMemo(() => {
    if (dateFilter.preset === "all") return transactions;

    const start = startOfDay(parseISO(dateFilter.startDate));
    const end = endOfDay(parseISO(dateFilter.endDate));

    return transactions.filter((tx) => {
      try {
        const txDate = parseISO(tx.date.substring(0, 10));
        return isWithinInterval(txDate, { start, end });
      } catch (e) {
        return true;
      }
    });
  }, [transactions, dateFilter]);

  // Calculate Dashboard Metrics and Comparative Growth
  const metrics: DashboardMetrics = useMemo(() => {
    const totalBalance = accounts.reduce((acc, a) => acc + (a.balance || 0), 0);

    let totalIncome = 0;
    let totalExpense = 0;

    filteredTransactions.forEach((tx) => {
      if (tx.type === "INCOME") {
        totalIncome += tx.amount;
      } else if (tx.type === "EXPENSE") {
        totalExpense += tx.amount;
      }
    });

    const netSavings = totalIncome - totalExpense;
    const savingsRate = totalIncome > 0 ? Math.max(0, (netSavings / totalIncome) * 100) : 0;

    let previousIncome = 0;
    let previousExpense = 0;

    if (dateFilter.preset !== "all") {
      const currentStart = parseISO(dateFilter.startDate);
      const currentEnd = parseISO(dateFilter.endDate);
      const dayDiff = Math.max(1, differenceInDays(currentEnd, currentStart) + 1);

      const prevEnd = subDays(currentStart, 1);
      const prevStart = subDays(prevEnd, dayDiff - 1);

      const prevFiltered = transactions.filter((tx) => {
        try {
          const txDate = parseISO(tx.date.substring(0, 10));
          return isWithinInterval(txDate, {
            start: startOfDay(prevStart),
            end: endOfDay(prevEnd),
          });
        } catch {
          return false;
        }
      });

      prevFiltered.forEach((tx) => {
        if (tx.type === "INCOME") previousIncome += tx.amount;
        if (tx.type === "EXPENSE") previousExpense += tx.amount;
      });
    }

    const incomeGrowth =
      previousIncome > 0 ? ((totalIncome - previousIncome) / previousIncome) * 100 : 0;
    const expenseGrowth =
      previousExpense > 0 ? ((totalExpense - previousExpense) / previousExpense) * 100 : 0;

    const start = parseISO(dateFilter.startDate);
    const end = parseISO(dateFilter.endDate);
    const totalDays = Math.max(1, differenceInDays(end, start) + 1);
    const dailyBurnRate = totalExpense / totalDays;

    return {
      totalBalance,
      totalIncome,
      totalExpense,
      netSavings,
      savingsRate,
      dailyBurnRate,
      previousIncome,
      previousExpense,
      incomeGrowth,
      expenseGrowth,
      transactionCount: filteredTransactions.length,
    };
  }, [accounts, filteredTransactions, transactions, dateFilter]);

  // 1. Add Transaction
  const addTransaction = async (data: Omit<Transaction, "id" | "createdAt">) => {
    const newId = "tx_" + generateId();
    const newTx: Transaction = {
      ...data,
      id: newId,
      createdAt: new Date().toISOString(),
    };

    const updatedAccounts = accounts.map((acc) => {
      if (data.type === "INCOME" && acc.id === data.accountId) {
        return { ...acc, balance: acc.balance + data.amount };
      }
      if (data.type === "EXPENSE" && acc.id === data.accountId) {
        return { ...acc, balance: acc.balance - data.amount };
      }
      if (data.type === "TRANSFER") {
        if (acc.id === data.accountId) {
          return { ...acc, balance: acc.balance - data.amount };
        }
        if (acc.id === data.toAccountId) {
          return { ...acc, balance: acc.balance + data.amount };
        }
      }
      return acc;
    });

    const updatedTransactions = [newTx, ...transactions];

    if (dataSource === "FIREBASE" && !isDemo && isFirebaseConfigured() && db && user) {
      try {
        const firestore = db as Firestore;
        await setDoc(doc(firestore, "users", user.uid, "transactions", newId), cleanForFirestore(newTx));
        for (const acc of updatedAccounts) {
          await updateDoc(doc(firestore, "users", user.uid, "accounts", acc.id), {
            balance: acc.balance,
          });
        }
      } catch (err: any) {
        console.error("Firestore transaction write error:", err);
        toast.error("Gagal sinkronisasi ke Firestore: " + err.message);
        throw err;
      }
    } else {
      setAccounts(updatedAccounts);
      setTransactions(updatedTransactions);
      persistLocal(updatedAccounts, categories, updatedTransactions);
    }
  };

  // 2. Update Transaction
  const updateTransaction = async (id: string, data: Partial<Transaction>) => {
    const oldTx = transactions.find((t) => t.id === id);
    if (!oldTx) return;

    let updatedAccounts = [...accounts];

    updatedAccounts = updatedAccounts.map((acc) => {
      if (oldTx.type === "INCOME" && acc.id === oldTx.accountId) {
        return { ...acc, balance: acc.balance - oldTx.amount };
      }
      if (oldTx.type === "EXPENSE" && acc.id === oldTx.accountId) {
        return { ...acc, balance: acc.balance + oldTx.amount };
      }
      if (oldTx.type === "TRANSFER") {
        if (acc.id === oldTx.accountId) {
          return { ...acc, balance: acc.balance + oldTx.amount };
        }
        if (acc.id === oldTx.toAccountId) {
          return { ...acc, balance: acc.balance - oldTx.amount };
        }
      }
      return acc;
    });

    const mergedTx: Transaction = {
      ...oldTx,
      ...data,
      updatedAt: new Date().toISOString(),
    };

    updatedAccounts = updatedAccounts.map((acc) => {
      if (mergedTx.type === "INCOME" && acc.id === mergedTx.accountId) {
        return { ...acc, balance: acc.balance + mergedTx.amount };
      }
      if (mergedTx.type === "EXPENSE" && acc.id === mergedTx.accountId) {
        return { ...acc, balance: acc.balance - mergedTx.amount };
      }
      if (mergedTx.type === "TRANSFER") {
        if (acc.id === mergedTx.accountId) {
          return { ...acc, balance: acc.balance - mergedTx.amount };
        }
        if (acc.id === mergedTx.toAccountId) {
          return { ...acc, balance: acc.balance + mergedTx.amount };
        }
      }
      return acc;
    });

    const updatedTransactions = transactions.map((t) => (t.id === id ? mergedTx : t));

    if (dataSource === "FIREBASE" && !isDemo && isFirebaseConfigured() && db && user) {
      try {
        const firestore = db as Firestore;
        await updateDoc(
          doc(firestore, "users", user.uid, "transactions", id),
          cleanForFirestore({ ...mergedTx }) as Record<string, any>
        );
        for (const acc of updatedAccounts) {
          await updateDoc(doc(firestore, "users", user.uid, "accounts", acc.id), {
            balance: acc.balance,
          });
        }
      } catch (err: any) {
        console.error("Firestore update error:", err);
        toast.error("Gagal memperbarui di Firestore: " + err.message);
        throw err;
      }
    } else {
      setAccounts(updatedAccounts);
      setTransactions(updatedTransactions);
      persistLocal(updatedAccounts, categories, updatedTransactions);
    }
  };

  // 3. Delete Transaction
  const deleteTransaction = async (id: string) => {
    const oldTx = transactions.find((t) => t.id === id);
    if (!oldTx) return;

    const updatedAccounts = accounts.map((acc) => {
      if (oldTx.type === "INCOME" && acc.id === oldTx.accountId) {
        return { ...acc, balance: acc.balance - oldTx.amount };
      }
      if (oldTx.type === "EXPENSE" && acc.id === oldTx.accountId) {
        return { ...acc, balance: acc.balance + oldTx.amount };
      }
      if (oldTx.type === "TRANSFER") {
        if (acc.id === oldTx.accountId) {
          return { ...acc, balance: acc.balance + oldTx.amount };
        }
        if (acc.id === oldTx.toAccountId) {
          return { ...acc, balance: acc.balance - oldTx.amount };
        }
      }
      return acc;
    });

    const updatedTransactions = transactions.filter((t) => t.id !== id);

    if (dataSource === "FIREBASE" && !isDemo && isFirebaseConfigured() && db && user) {
      try {
        const firestore = db as Firestore;
        await deleteDoc(doc(firestore, "users", user.uid, "transactions", id));
        for (const acc of updatedAccounts) {
          await updateDoc(doc(firestore, "users", user.uid, "accounts", acc.id), {
            balance: acc.balance,
          });
        }
      } catch (err: any) {
        console.error("Firestore delete error:", err);
        toast.error("Gagal menghapus dari Firestore: " + err.message);
        throw err;
      }
    } else {
      setAccounts(updatedAccounts);
      setTransactions(updatedTransactions);
      persistLocal(updatedAccounts, categories, updatedTransactions);
    }
  };

  // 4. Transfer Funds Helper
  const transferFunds = async (
    fromAccountId: string,
    toAccountId: string,
    amount: number,
    description?: string,
    date?: string
  ) => {
    const fromAcc = accounts.find((a) => a.id === fromAccountId);
    const toAcc = accounts.find((a) => a.id === toAccountId);
    if (!fromAcc || !toAcc) return;

    await addTransaction({
      type: "TRANSFER",
      amount,
      date: date || new Date().toISOString(),
      description: description || `Transfer dari ${fromAcc.name} ke ${toAcc.name}`,
      categoryId: "cat_transfer",
      categoryName: "Transfer Antar Dompet",
      categoryIcon: "ArrowRightLeft",
      categoryColor: "#6366F1",
      accountId: fromAcc.id,
      accountName: fromAcc.name,
      accountIcon: fromAcc.icon,
      toAccountId: toAcc.id,
      toAccountName: toAcc.name,
      tags: ["#transfer"],
    });
  };

  // 5. Account CRUD
  const addAccount = async (data: Omit<Account, "id" | "createdAt">) => {
    const newId = "acc_" + generateId();
    const newAcc: Account = {
      ...data,
      id: newId,
      createdAt: new Date().toISOString(),
    };
    const updated = [...accounts, newAcc];
    if (dataSource === "FIREBASE" && !isDemo && isFirebaseConfigured() && db && user) {
      try {
        const firestore = db as Firestore;
        await setDoc(doc(firestore, "users", user.uid, "accounts", newId), cleanForFirestore(newAcc));
      } catch (err: any) {
        console.error("Firestore addAccount error:", err);
        toast.error("Gagal menyimpan dompet ke Cloud Firestore: " + err.message);
        throw err;
      }
    } else {
      setAccounts(updated);
      persistLocal(updated, categories, transactions);
    }
  };

  const updateAccount = async (id: string, data: Partial<Account>) => {
    const updated = accounts.map((a) => (a.id === id ? { ...a, ...data } : a));
    if (dataSource === "FIREBASE" && !isDemo && isFirebaseConfigured() && db && user) {
      try {
        const firestore = db as Firestore;
        await updateDoc(
          doc(firestore, "users", user.uid, "accounts", id),
          cleanForFirestore(data) as Record<string, any>
        );
      } catch (err: any) {
        console.error("Firestore updateAccount error:", err);
        toast.error("Gagal update dompet di Firestore: " + err.message);
        throw err;
      }
    } else {
      setAccounts(updated);
      persistLocal(updated, categories, transactions);
    }
  };

  const deleteAccount = async (id: string) => {
    const updated = accounts.filter((a) => a.id !== id);
    if (dataSource === "FIREBASE" && !isDemo && isFirebaseConfigured() && db && user) {
      try {
        const firestore = db as Firestore;
        await deleteDoc(doc(firestore, "users", user.uid, "accounts", id));
      } catch (err: any) {
        console.error("Firestore deleteAccount error:", err);
        toast.error("Gagal menghapus dompet dari Firestore: " + err.message);
        throw err;
      }
    } else {
      setAccounts(updated);
      persistLocal(updated, categories, transactions);
    }
  };

  // 6. Category CRUD
  const addCategory = async (data: Omit<Category, "id" | "createdAt">) => {
    const newId = "cat_" + generateId();
    const newCat: Category = {
      ...data,
      id: newId,
      createdAt: new Date().toISOString(),
    };
    const updated = [...categories, newCat];
    if (dataSource === "FIREBASE" && !isDemo && isFirebaseConfigured() && db && user) {
      try {
        const firestore = db as Firestore;
        await setDoc(doc(firestore, "users", user.uid, "categories", newId), cleanForFirestore(newCat));
      } catch (err: any) {
        console.error("Firestore addCategory error:", err);
        toast.error("Gagal menyimpan kategori ke Firestore: " + err.message);
        throw err;
      }
    } else {
      setCategories(updated);
      persistLocal(accounts, updated, transactions);
    }
  };

  const updateCategory = async (id: string, data: Partial<Category>) => {
    const updated = categories.map((c) => (c.id === id ? { ...c, ...data } : c));
    if (dataSource === "FIREBASE" && !isDemo && isFirebaseConfigured() && db && user) {
      try {
        const firestore = db as Firestore;
        await updateDoc(
          doc(firestore, "users", user.uid, "categories", id),
          cleanForFirestore(data) as Record<string, any>
        );
      } catch (err: any) {
        console.error("Firestore updateCategory error:", err);
        toast.error("Gagal update kategori di Firestore: " + err.message);
        throw err;
      }
    } else {
      setCategories(updated);
      persistLocal(accounts, updated, transactions);
    }
  };

  const deleteCategory = async (id: string) => {
    const updated = categories.filter((c) => c.id !== id);
    if (dataSource === "FIREBASE" && !isDemo && isFirebaseConfigured() && db && user) {
      try {
        const firestore = db as Firestore;
        await deleteDoc(doc(firestore, "users", user.uid, "categories", id));
      } catch (err: any) {
        console.error("Firestore deleteCategory error:", err);
        toast.error("Gagal hapus kategori di Firestore: " + err.message);
        throw err;
      }
    } else {
      setCategories(updated);
      persistLocal(accounts, updated, transactions);
    }
  };

  // Reset to default Dummy Data from JSON file
  const resetToDefaultJSON = () => {
    const initialAcc = dummyData.accounts as Account[];
    const initialCat = dummyData.categories as Category[];
    const initialTx = dummyData.transactions as Transaction[];
    setAccounts(initialAcc);
    setCategories(initialCat);
    setTransactions(initialTx);
    persistLocal(initialAcc, initialCat, initialTx);
  };

  const resetToDemoData = resetToDefaultJSON;

  // Export JSON & CSV
  const exportDataJSON = () => {
    return JSON.stringify({ accounts, categories, transactions }, null, 2);
  };

  const exportDataCSV = () => {
    const headers = [
      "ID",
      "Tanggal",
      "Tipe",
      "Nominal",
      "Kategori",
      "Akun/Dompet",
      "Tujuan Transfer",
      "Deskripsi",
      "Tags",
    ];
    const rows = transactions.map((tx) => [
      `"${tx.id}"`,
      `"${tx.date}"`,
      `"${tx.type}"`,
      tx.amount,
      `"${tx.categoryName || ""}"`,
      `"${tx.accountName || ""}"`,
      `"${tx.toAccountName || ""}"`,
      `"${(tx.description || "").replace(/"/g, '""')}"`,
      `"${(tx.tags || []).join(", ")}"`,
    ]);
    return [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
  };

  const importDataJSON = (jsonString: string): boolean => {
    try {
      const parsed = JSON.parse(jsonString);
      if (Array.isArray(parsed.accounts) && Array.isArray(parsed.transactions)) {
        setAccounts(parsed.accounts);
        if (Array.isArray(parsed.categories)) setCategories(parsed.categories);
        setTransactions(parsed.transactions);
        persistLocal(
          parsed.accounts,
          parsed.categories || DEFAULT_CATEGORIES,
          parsed.transactions
        );
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  return (
    <FinanceContext.Provider
      value={{
        accounts,
        categories,
        transactions,
        filteredTransactions,
        dateFilter,
        setDateFilter,
        metrics,
        loading,
        dataSource,
        setDataSource,
        addTransaction,
        updateTransaction,
        deleteTransaction,
        addAccount,
        updateAccount,
        deleteAccount,
        addCategory,
        updateCategory,
        deleteCategory,
        loadDefaultCategoriesToReal,
        transferFunds,
        resetToDemoData,
        resetToDefaultJSON,
        isBalanceHidden,
        setIsBalanceHidden,
        toggleBalanceVisibility,
        exportDataJSON,
        exportDataCSV,
        importDataJSON,
      }}
    >
      {children}
    </FinanceContext.Provider>
  );
};

export const useFinance = () => useContext(FinanceContext);
