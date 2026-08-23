"use client";

import React, { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Navbar } from "./Navbar";
import { Sidebar } from "./Sidebar";
import { MobileNav } from "./MobileNav";
import { PageTransition } from "./PageTransition";
import { TransactionModal } from "@/components/transactions/TransactionModal";
import { TransferModal } from "@/components/transactions/TransferModal";
import { Loader2 } from "lucide-react";

export const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  const [isTxModalOpen, setIsTxModalOpen] = useState(false);
  const [txModalInitialType, setTxModalInitialType] = useState<"INCOME" | "EXPENSE">("EXPENSE");
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isLoginPage = pathname === "/login";

  // Redirect to login if not authenticated and not already on login page
  React.useEffect(() => {
    if (!loading && !user && !isLoginPage) {
      router.push("/login");
    }
  }, [user, loading, isLoginPage, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-[#090d16] text-slate-600 dark:text-slate-300">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-600 dark:text-indigo-400 mb-4" />
        <p className="text-sm font-medium animate-pulse">Memuat data keuangan Anda...</p>
      </div>
    );
  }

  if (isLoginPage) {
    return <main className="min-h-screen">{children}</main>;
  }

  if (!user) {
    return null; // Will redirect via useEffect
  }

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-[#090d16] text-slate-900 dark:text-slate-100 flex flex-col transition-colors">
      {/* Top Navbar with Fluid Width & Mobile Menu Button */}
      <Navbar
        onOpenTransactionModal={(type = "EXPENSE") => {
          setTxModalInitialType(type);
          setIsTxModalOpen(true);
        }}
        onOpenTransferModal={() => setIsTransferModalOpen(true)}
        onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
      />

      {/* Main Fluid Layout with Sidebar */}
      <div className="flex-1 flex w-full pb-20 lg:pb-8">
        <Sidebar
          isMobileOpen={isMobileMenuOpen}
          onCloseMobile={() => setIsMobileMenuOpen(false)}
          onOpenTransactionModal={(type = "EXPENSE") => {
            setTxModalInitialType(type);
            setIsTxModalOpen(true);
          }}
          onOpenTransferModal={() => setIsTransferModalOpen(true)}
        />

        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 w-full max-w-full overflow-hidden">
          <PageTransition>{children}</PageTransition>
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileNav
        onOpenTransactionModal={() => {
          setTxModalInitialType("EXPENSE");
          setIsTxModalOpen(true);
        }}
      />

      {/* Global Modals */}
      <TransactionModal
        isOpen={isTxModalOpen}
        onClose={() => setIsTxModalOpen(false)}
        initialType={txModalInitialType}
      />

      <TransferModal
        isOpen={isTransferModalOpen}
        onClose={() => setIsTransferModalOpen(false)}
      />
    </div>
  );
};
