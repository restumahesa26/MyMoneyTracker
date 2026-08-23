"use client";

import React from "react";
import { WalletCardList } from "@/components/wallets/WalletCardList";

export default function WalletsPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      <WalletCardList />
    </div>
  );
}
