"use client";

import React from "react";
import { CategoryList } from "@/components/categories/CategoryList";

export default function CategoriesPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      <CategoryList />
    </div>
  );
}
