"use client";

import React from "react";
import { useFinance } from "@/context/FinanceContext";
import { DebtOverviewCards } from "@/components/debts/DebtOverviewCards";
import { DebtCardList } from "@/components/debts/DebtCardList";

export default function DebtsPage() {
  const { debts } = useFinance();

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Top Overview Metric Cards */}
      <DebtOverviewCards debts={debts} />

      {/* Main List of Debts & Payment Tools */}
      <DebtCardList />
    </div>
  );
}
