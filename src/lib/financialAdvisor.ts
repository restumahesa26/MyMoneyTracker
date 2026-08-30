import { Transaction, Category, Account, DashboardMetrics } from "@/types";
import { parseISO, getDay, differenceInDays } from "date-fns";

export interface PillarScore {
  name: string;
  score: number; // 0 - 100
  weight: number; // e.g. 0.25
  grade: "Sangat Baik" | "Baik" | "Perlu Perhatian" | "Kritis";
  statusText: string;
  advice: string;
  metricValue: string;
}

export interface FinancialHealthAnalysis {
  overallScore: number; // 0 - 100
  grade: "A+" | "A" | "B" | "C" | "D";
  gradeTitle: string;
  summaryVerdict: string;
  pillars: {
    savings: PillarScore;
    runway: PillarScore;
    budget: PillarScore;
    growth: PillarScore;
    diversification: PillarScore;
  };
  strengths: string[];
  weaknesses: string[];
  priorityActions: Array<{
    id: string;
    title: string;
    description: string;
    impact: "Tinggi" | "Sedang" | "Kritis";
    category: "TABUNGAN" | "ANGGARAN" | "DANA_DARURAT" | "EFISIENSI";
  }>;
}

export interface Rule503020Bucket {
  name: string;
  type: "NEEDS" | "WANTS" | "SAVINGS";
  targetPercent: number;
  actualPercent: number;
  actualAmount: number;
  targetAmount: number;
  differenceAmount: number; // actual - target
  status: "IDEAL" | "OVER" | "UNDER";
  color: string;
  categories: Array<{
    id: string;
    name: string;
    amount: number;
    percentOfTotal: number;
    color: string;
  }>;
}

export interface Rule503020Analysis {
  totalIncome: number;
  totalExpense: number;
  netSavings: number;
  buckets: {
    needs: Rule503020Bucket;
    wants: Rule503020Bucket;
    savings: Rule503020Bucket;
  };
  consultantVerdict: string;
  rebalanceRecommendations: string[];
}

export interface LatteFactorItem {
  name: string;
  count: number;
  totalAmount: number;
  avgAmount: number;
  annualizedImpact: number;
  categoryName: string;
}

export interface CategorySpikeItem {
  categoryId: string;
  categoryName: string;
  currentAmount: number;
  previousAmount: number;
  growthPercent: number;
  color: string;
}

export interface LeakAndAnomalyReport {
  latteFactorItems: LatteFactorItem[];
  totalLatteSpend: number;
  latteAnnualizedImpact: number;
  categorySpikes: CategorySpikeItem[];
  weekendVsWeekday: {
    weekendTotal: number;
    weekdayTotal: number;
    weekendAvgPerDay: number;
    weekdayAvgPerDay: number;
    weekendExpenseRatio: number; // % of total expense spent on Saturday & Sunday
    isWeekendHeavy: boolean;
  };
  topSingleExpenses: Transaction[];
  actionableSavingsPlaybook: Array<{
    title: string;
    potentialMonthlySave: number;
    difficulty: "Mudah" | "Sedang" | "Menantang";
    tip: string;
  }>;
}

// -------------------------------------------------------------
// 1. HEALTH SCORE & PILLAR CALCULATIONS
// -------------------------------------------------------------

export function calculateFinancialHealthScore(
  metrics: DashboardMetrics,
  categories: Category[],
  filteredTransactions: Transaction[],
  accounts: Account[]
): FinancialHealthAnalysis {
  const { totalIncome, totalExpense, savingsRate, dailyBurnRate, totalBalance } = metrics;

  // --- Pillar 1: Savings & Wealth Accumulation (Weight: 25%) ---
  let savingsScore = 0;
  let savingsGrade: PillarScore["grade"] = "Kritis";
  let savingsStatus = "Defisit / Belum Menabung";
  let savingsAdvice = "Pengeluaran melampaui pemasukan. Tinjau kembali pos pengeluaran sekunder Anda.";

  if (savingsRate >= 30) {
    savingsScore = 100;
    savingsGrade = "Sangat Baik";
    savingsStatus = "Sangat Prima (>30%)";
    savingsAdvice = "Tingkat tabungan luar biasa. Alokasikan kelebihan dana ini ke instrumen investasi produktif.";
  } else if (savingsRate >= 20) {
    savingsScore = 85;
    savingsGrade = "Baik";
    savingsStatus = "Standar Ideal (20-30%)";
    savingsAdvice = "Rasio tabungan sehat sesuai standar ideal konsultan keuangan 20%. Pertahankan konsistensi ini.";
  } else if (savingsRate >= 10) {
    savingsScore = 60;
    savingsGrade = "Perlu Perhatian";
    savingsStatus = "Cukup (10-20%)";
    savingsAdvice = "Tingkatkan rasio tabungan mendekati 20% dengan memangkas pos keinginan (wants).";
  } else if (savingsRate > 0) {
    savingsScore = 40;
    savingsGrade = "Perlu Perhatian";
    savingsStatus = "Rendah (<10%)";
    savingsAdvice = "Rasio tabungan rentan. Coba alokasikan tabungan di awal gajian (pay yourself first).";
  }

  const p1: PillarScore = {
    name: "Rasio Tabungan & Akumulasi Aset",
    score: savingsScore,
    weight: 0.25,
    grade: savingsGrade,
    statusText: savingsStatus,
    advice: savingsAdvice,
    metricValue: `${savingsRate.toFixed(1)}% dari Pemasukan`,
  };

  // --- Pillar 2: Emergency Fund Runway Resilience (Weight: 25%) ---
  const monthlyBurn = dailyBurnRate * 30;
  const runwayMonths = monthlyBurn > 0 ? totalBalance / monthlyBurn : (totalBalance > 0 ? 12 : 0);

  let runwayScore = 0;
  let runwayGrade: PillarScore["grade"] = "Kritis";
  let runwayStatus = "Kritis (< 1 Bulan)";
  let runwayAdvice = "Dana darurat sangat tipis. Prioritaskan pembangunan bantalan likuiditas minimal 3 bulan.";

  if (runwayMonths >= 6) {
    runwayScore = 100;
    runwayGrade = "Sangat Baik";
    runwayStatus = "Sangat Tangguh (≥ 6 Bulan)";
    runwayAdvice = "Ketahanan dana darurat Anda sangat kuat untuk menghadapi segala dinamika tak terduga.";
  } else if (runwayMonths >= 3) {
    runwayScore = 80;
    runwayGrade = "Baik";
    runwayStatus = "Aman (3 - 6 Bulan)";
    runwayAdvice = "Bantalan dana darurat sudah berada di zona aman standar keuangan profesional.";
  } else if (runwayMonths >= 1.5) {
    runwayScore = 55;
    runwayGrade = "Perlu Perhatian";
    runwayStatus = "Moderat (1.5 - 3 Bulan)";
    runwayAdvice = "Tingkatkan akumulasi dana darurat hingga mencapai minimal 3-6 bulan pengeluaran rutin.";
  } else if (runwayMonths >= 0.5) {
    runwayScore = 30;
    runwayGrade = "Kritis";
    runwayStatus = "Rentan (< 1.5 Bulan)";
    runwayAdvice = "Segera kurangi pengeluaran non-esensial dan amankan cadangan kas ke dompet likuid.";
  }

  const p2: PillarScore = {
    name: "Ketahanan Dana Darurat (Cash Runway)",
    score: runwayScore,
    weight: 0.25,
    grade: runwayGrade,
    statusText: runwayStatus,
    advice: runwayAdvice,
    metricValue: runwayMonths > 12 ? "> 12 Bulan" : `${runwayMonths.toFixed(1)} Bulan Operasional`,
  };

  // --- Pillar 3: Budget Discipline & Variance Control (Weight: 20%) ---
  const budgetedCats = categories.filter((c) => c.type === "EXPENSE" && c.budgetLimit && c.budgetLimit > 0);
  let budgetScore = 75; // default neutral if no budget configured
  let budgetGrade: PillarScore["grade"] = "Baik";
  let budgetStatus = "Belum Ada Target";
  let budgetAdvice = "Atur batas anggaran pada kategori untuk pemantauan disiplin belanja otomatis.";
  let budgetMetric = "0 Kategori Dibatasi";

  if (budgetedCats.length > 0) {
    const spentMap: Record<string, number> = {};
    filteredTransactions
      .filter((tx) => tx.type === "EXPENSE")
      .forEach((tx) => {
        spentMap[tx.categoryId] = (spentMap[tx.categoryId] || 0) + tx.amount;
      });

    let overbudgetCount = 0;
    let warningCount = 0;

    budgetedCats.forEach((c) => {
      const limit = c.budgetLimit || 1;
      const spent = spentMap[c.id] || 0;
      const ratio = spent / limit;
      if (ratio > 1) overbudgetCount++;
      else if (ratio >= 0.85) warningCount++;
    });

    const overRatio = overbudgetCount / budgetedCats.length;
    if (overbudgetCount === 0 && warningCount === 0) {
      budgetScore = 100;
      budgetGrade = "Sangat Baik";
      budgetStatus = "100% On-Budget";
      budgetAdvice = "Semua kategori terkendali rapi di bawah batas pagu anggaran. Disiplin sangat baik!";
    } else if (overbudgetCount === 0) {
      budgetScore = 80;
      budgetGrade = "Baik";
      budgetStatus = `${warningCount} Pos Mendekati Batas`;
      budgetAdvice = "Ada beberapa pos mendekati pagu anggaran, rem pengeluaran hingga akhir periode.";
    } else if (overRatio <= 0.3) {
      budgetScore = 55;
      budgetGrade = "Perlu Perhatian";
      budgetStatus = `${overbudgetCount} Pos Overbudget`;
      budgetAdvice = "Terdapat pos pengeluaran yang bocor melampaui batas anggaran. Lakukan evaluasi batas.";
    } else {
      budgetScore = 30;
      budgetGrade = "Kritis";
      budgetStatus = `${overbudgetCount} Pos Jebol`;
      budgetAdvice = "Sebagian besar pos anggaran melampaui limit. Perlu restrukturisasi gaya hidup segera.";
    }

    budgetMetric = `${budgetedCats.length - overbudgetCount}/${budgetedCats.length} Pos Terkendali`;
  }

  const p3: PillarScore = {
    name: "Disiplin Anggaran (Budget Adherence)",
    score: budgetScore,
    weight: 0.2,
    grade: budgetGrade,
    statusText: budgetStatus,
    advice: budgetAdvice,
    metricValue: budgetMetric,
  };

  // --- Pillar 4: Net Cashflow Growth & Momentum (Weight: 15%) ---
  let growthScore = 70;
  let growthGrade: PillarScore["grade"] = "Baik";
  let growthStatus = "Stabil";
  let growthAdvice = "Arus kas stabil seimbang.";

  const { incomeGrowth, expenseGrowth } = metrics;
  if (totalIncome > totalExpense && expenseGrowth <= incomeGrowth) {
    growthScore = 95;
    growthGrade = "Sangat Baik";
    growthStatus = "Momentum Positif";
    growthAdvice = "Pemasukan tumbuh lebih cepat daripada pengeluaran. Anda berada di jalur percepatan finansial.";
  } else if (totalIncome > totalExpense) {
    growthScore = 75;
    growthGrade = "Baik";
    growthStatus = "Surplus Terjaga";
    growthAdvice = "Arus kas surplus, namun waspadai kenaikan persentase pengeluaran (lifestyle creep).";
  } else {
    growthScore = 35;
    growthGrade = "Kritis";
    growthStatus = "Defisit / Kontraksi";
    growthAdvice = "Pengeluaran meningkat drastis atau pemasukan menurun tajam dari periode sebelumnya.";
  }

  const p4: PillarScore = {
    name: "Momentum & Kualitas Arus Kas",
    score: growthScore,
    weight: 0.15,
    grade: growthGrade,
    statusText: growthStatus,
    advice: growthAdvice,
    metricValue: `Pemasukan ${incomeGrowth >= 0 ? "+" : ""}${incomeGrowth.toFixed(0)}% | Belanja ${
      expenseGrowth >= 0 ? "+" : ""
    }${expenseGrowth.toFixed(0)}%`,
  };

  // --- Pillar 5: Expense Concentration & Diversification (Weight: 15%) ---
  let divScore = 80;
  let divGrade: PillarScore["grade"] = "Baik";
  let divStatus = "Terdistribusi Sehat";
  let divAdvice = "Pengeluaran tersebar seimbang pada berbagai pos kebutuhan.";

  const expenseTxs = filteredTransactions.filter((tx) => tx.type === "EXPENSE");
  const catTotals: Record<string, number> = {};
  expenseTxs.forEach((tx) => {
    catTotals[tx.categoryName || "Lainnya"] = (catTotals[tx.categoryName || "Lainnya"] || 0) + tx.amount;
  });

  const maxCatSpend = Object.values(catTotals).reduce((max, v) => Math.max(max, v), 0);
  const maxCatRatio = totalExpense > 0 ? (maxCatSpend / totalExpense) * 100 : 0;

  if (maxCatRatio > 55) {
    divScore = 45;
    divGrade = "Perlu Perhatian";
    divStatus = "Konsentrasi Tinggi";
    divAdvice = `Terdapat 1 kategori yang mendominasi ${maxCatRatio.toFixed(0)}% dari seluruh pengeluaran. Cek potensi inefisiensi.`;
  } else if (maxCatRatio > 40) {
    divScore = 65;
    divGrade = "Baik";
    divStatus = "Konsentrasi Cukup";
    divAdvice = "Sebaran pengeluaran cukup baik, pastikan pos terbesar merupakan kebutuhan pokok.";
  } else {
    divScore = 95;
    divGrade = "Sangat Baik";
    divStatus = "Sangat Seimbang";
    divAdvice = "Portofolio pengeluaran terdistribusi merata dan tidak bergantung pada satu pos belanja berlebih.";
  }

  const p5: PillarScore = {
    name: "Diversifikasi Beban Pengeluaran",
    score: divScore,
    weight: 0.15,
    grade: divGrade,
    statusText: divStatus,
    advice: divAdvice,
    metricValue: `Kategori Tertinggi: ${maxCatRatio.toFixed(0)}% Beban`,
  };

  // --- Overall Weighted Score ---
  const overallScore = Math.round(
    p1.score * p1.weight +
    p2.score * p2.weight +
    p3.score * p3.weight +
    p4.score * p4.weight +
    p5.score * p5.weight
  );

  let grade: FinancialHealthAnalysis["grade"] = "C";
  let gradeTitle = "Waspada / Perlu Optimasi";
  let summaryVerdict = "Kondisi keuangan memerlukan beberapa pembenahan strategis untuk mencapai stabilitas jangka panjang.";

  if (overallScore >= 90) {
    grade = "A+";
    gradeTitle = "Mandiri & Tangguh Finansial";
    summaryVerdict = "Luar biasa! Fondasi keuangan Anda sangat solid dengan tabungan kuat, dana darurat kokoh, dan arus kas surplus.";
  } else if (overallScore >= 80) {
    grade = "A";
    gradeTitle = "Sangat Sehat & Prima";
    summaryVerdict = "Kondisi keuangan Anda sangat prima. Disiplin finansial Anda berada di atas rata-rata klien umum.";
  } else if (overallScore >= 65) {
    grade = "B";
    gradeTitle = "Sehat & Terkendali";
    summaryVerdict = "Struktur keuangan Anda secara umum sehat, namun ada beberapa pos belanja gaya hidup yang dapat diefisiensikan.";
  } else if (overallScore >= 50) {
    grade = "C";
    gradeTitle = "Waspada / Perlu Pembenahan";
    summaryVerdict = "Arus kas Anda cukup ketat. Perlu pengetatan anggaran dan pembentukan buffer dana darurat lebih serius.";
  } else {
    grade = "D";
    gradeTitle = "Kritis / Defisit Arus Kas";
    summaryVerdict = "Peringatan darurat: Pengeluaran melebihi pemasukan atau dana cadangan habis. Segera lakukan restrukturisasi pos belanja.";
  }

  // Strengths & Weaknesses
  const strengths: string[] = [];
  const weaknesses: string[] = [];

  if (p1.score >= 80) strengths.push("Rasio tabungan prima memenuhi target wealth building.");
  else weaknesses.push("Rasio tabungan masih di bawah ambang rekomendasi 20%.");

  if (p2.score >= 80) strengths.push("Bantalan dana darurat (runway) sangat memadai.");
  else weaknesses.push("Ketahanan dana darurat tipis (< 3 bulan pengeluaran).");

  if (p3.score >= 80) strengths.push("Disiplin kepatuhan terhadap batas anggaran sangat terjaga.");
  else if (p3.score < 60) weaknesses.push("Terdapat kebocoran pagu anggaran pada kategori pengeluaran.");

  if (p4.score >= 80) strengths.push("Momentum pertumbuhan arus kas bersih positif dan terkontrol.");
  else if (p4.score < 60) weaknesses.push("Tren pertumbuhan pengeluaran melampaui pemasukan.");

  // Priority Actions (Contextual 3-step action items)
  const priorityActions: FinancialHealthAnalysis["priorityActions"] = [];

  if (runwayMonths < 3) {
    priorityActions.push({
      id: "act_emergency",
      title: "Perkuat Bantalan Dana Darurat ke 3-6 Bulan",
      description: `Saat ini saldo kas Anda sanggup membiayai ~${runwayMonths.toFixed(1)} bulan. Sisihkan minimal 10-15% pemasukan rutin ke instrumen likuid (misal Tabungan Berbunga / Reksadana Pasar Uang) hingga mencapai Rp ${(monthlyBurn * 3).toLocaleString("id-ID")}.`,
      impact: "Kritis",
      category: "DANA_DARURAT",
    });
  }

  if (savingsRate < 20) {
    priorityActions.push({
      id: "act_savings",
      title: "Terapkan Prinsip 'Pay Yourself First' Minimal 20%",
      description: "Pindahkan minimal 20% dari setiap pemasukan yang masuk langsung ke rekening tabungan/investasi terkunci sebelum membelanjakan sisanya.",
      impact: "Tinggi",
      category: "TABUNGAN",
    });
  }

  if (p3.score < 75) {
    priorityActions.push({
      id: "act_budget",
      title: "Evaluasi & Pasang Pagu Anggaran Pos Belanja Bocor",
      description: "Tetapkan batas maksimum pengeluaran pada pos belanja harian dan makanan di luar rumah agar terhindar dari overspending di pertengahan bulan.",
      impact: "Tinggi",
      category: "ANGGARAN",
    });
  }

  if (priorityActions.length < 3) {
    priorityActions.push({
      id: "act_invest",
      title: "Optimalkan Surplus Dana ke Investasi Produktif",
      description: "Dengan rasio tabungan dan likuiditas yang sudah sehat, alokasikan surplus bulanan ke portofolio investasi bertumbuh (Reksadana Saham / Obligasi / SBN) untuk melawan inflasi.",
      impact: "Sedang",
      category: "EFISIENSI",
    });
  }

  return {
    overallScore,
    grade,
    gradeTitle,
    summaryVerdict,
    pillars: {
      savings: p1,
      runway: p2,
      budget: p3,
      growth: p4,
      diversification: p5,
    },
    strengths,
    weaknesses,
    priorityActions: priorityActions.slice(0, 3),
  };
}

// -------------------------------------------------------------
// 2. THE 50 / 30 / 20 RULE ANALYSIS
// -------------------------------------------------------------

const NEEDS_KEYWORDS = [
  "makan", "food", "sembako", "transport", "bensin", "ojol", "tagihan", "listrik",
  "air", "wifi", "internet", "pulsa", "kesehatan", "obat", "dokter", "sewa",
  "kost", "cicilan", "pendidikan", "kuliah", "sekolah", "utilitas", "bills", "health", "car", "utensils"
];

const WANTS_KEYWORDS = [
  "hiburan", "game", "nongkrong", "kafe", "kopi", "belanja", "shopping", "baju",
  "fashion", "hobi", "liburan", "hotel", "nonton", "bioskop", "streaming", "gamepad2", "shoppingbag"
];

export function analyze503020Rule(
  metrics: DashboardMetrics,
  categories: Category[],
  filteredTransactions: Transaction[]
): Rule503020Analysis {
  const { totalIncome, totalExpense } = metrics;
  // If income is 0, use totalExpense as baseline for structure visualization
  const baseIncome = totalIncome > 0 ? totalIncome : totalExpense > 0 ? totalExpense : 1;

  const needsCatTotals: Record<string, { name: string; amount: number; color: string }> = {};
  const wantsCatTotals: Record<string, { name: string; amount: number; color: string }> = {};

  let totalNeeds = 0;
  let totalWants = 0;

  filteredTransactions
    .filter((tx) => tx.type === "EXPENSE")
    .forEach((tx) => {
      const catName = (tx.categoryName || "").toLowerCase();
      const catIcon = (tx.categoryIcon || "").toLowerCase();
      const isWant = WANTS_KEYWORDS.some((kw) => catName.includes(kw) || catIcon.includes(kw));

      const catKey = tx.categoryId || "other";
      const itemColor = tx.categoryColor || (isWant ? "#8B5CF6" : "#0284C7");

      if (isWant) {
        totalWants += tx.amount;
        if (!wantsCatTotals[catKey]) {
          wantsCatTotals[catKey] = { name: tx.categoryName || "Keinginan", amount: 0, color: itemColor };
        }
        wantsCatTotals[catKey].amount += tx.amount;
      } else {
        totalNeeds += tx.amount;
        if (!needsCatTotals[catKey]) {
          needsCatTotals[catKey] = { name: tx.categoryName || "Kebutuhan", amount: 0, color: itemColor };
        }
        needsCatTotals[catKey].amount += tx.amount;
      }
    });

  const netSavings = Math.max(0, totalIncome - totalExpense);

  const needsPercent = (totalNeeds / baseIncome) * 100;
  const wantsPercent = (totalWants / baseIncome) * 100;
  const savingsPercent = totalIncome > 0 ? (netSavings / totalIncome) * 100 : 0;

  const targetNeeds = baseIncome * 0.5;
  const targetWants = baseIncome * 0.3;
  const targetSavings = totalIncome > 0 ? totalIncome * 0.2 : 0;

  const needsBucket: Rule503020Bucket = {
    name: "Kebutuhan Pokok (Needs)",
    type: "NEEDS",
    targetPercent: 50,
    actualPercent: needsPercent,
    actualAmount: totalNeeds,
    targetAmount: targetNeeds,
    differenceAmount: totalNeeds - targetNeeds,
    status: needsPercent <= 50 ? "IDEAL" : "OVER",
    color: "#0284C7", // Sky blue
    categories: Object.entries(needsCatTotals).map(([id, item]) => ({
      id,
      name: item.name,
      amount: item.amount,
      percentOfTotal: totalNeeds > 0 ? (item.amount / totalNeeds) * 100 : 0,
      color: item.color,
    })),
  };

  const wantsBucket: Rule503020Bucket = {
    name: "Gaya Hidup & Keinginan (Wants)",
    type: "WANTS",
    targetPercent: 30,
    actualPercent: wantsPercent,
    actualAmount: totalWants,
    targetAmount: targetWants,
    differenceAmount: totalWants - targetWants,
    status: wantsPercent <= 30 ? "IDEAL" : "OVER",
    color: "#8B5CF6", // Violet/Purple
    categories: Object.entries(wantsCatTotals).map(([id, item]) => ({
      id,
      name: item.name,
      amount: item.amount,
      percentOfTotal: totalWants > 0 ? (item.amount / totalWants) * 100 : 0,
      color: item.color,
    })),
  };

  const savingsBucket: Rule503020Bucket = {
    name: "Tabungan & Investasi (Savings)",
    type: "SAVINGS",
    targetPercent: 20,
    actualPercent: savingsPercent,
    actualAmount: netSavings,
    targetAmount: targetSavings,
    differenceAmount: netSavings - targetSavings,
    status: savingsPercent >= 20 ? "IDEAL" : "UNDER",
    color: "#10B981", // Emerald
    categories: [
      {
        id: "savings_net",
        name: "Surplus Bersih Disimpan",
        amount: netSavings,
        percentOfTotal: 100,
        color: "#10B981",
      },
    ],
  };

  // Sort subcategories descending
  needsBucket.categories.sort((a, b) => b.amount - a.amount);
  wantsBucket.categories.sort((a, b) => b.amount - a.amount);

  // Consultant Verdict & Rebalancing Recommendations
  let consultantVerdict = "";
  const rebalanceRecommendations: string[] = [];

  if (wantsPercent > 30 && savingsPercent < 20) {
    const overWantsAmt = totalWants - targetWants;
    consultantVerdict = `Gaya hidup (Wants) Anda menyerap ${wantsPercent.toFixed(1)}% pemasukan (melebihi batas ideal 30%). Mengakibatkan porsi Tabungan tertekan menjadi ${savingsPercent.toFixed(1)}%.`;
    rebalanceRecommendations.push(
      `Pangkas pos pengeluaran gaya hidup sebesar Rp ${Math.round(overWantsAmt).toLocaleString("id-ID")} dan alihkan langsung ke pos Tabungan/Investasi.`
    );
  } else if (needsPercent > 55) {
    consultantVerdict = `Beban kebutuhan pokok (Needs) menyerap ${needsPercent.toFixed(1)}% pemasukan. Ruang gerak finansial Anda cenderung sempit.`;
    rebalanceRecommendations.push(
      "Cari alternatif efisiensi pada pos tagihan/utilitas dan pertimbangkan eksplorasi sumber pemasukan tambahan (side income)."
    );
  } else if (savingsPercent >= 25) {
    consultantVerdict = `Alokasi finansial Anda sangat luar biasa! Tabungan mencapai ${savingsPercent.toFixed(1)}%, jauh melampaui batas minimum 20%.`;
    rebalanceRecommendations.push(
      "Maksimalkan compound interest dengan membagi tabungan ke instrumen pasar modal/SBN untuk pertumbuhan aset jangka panjang."
    );
  } else {
    consultantVerdict = `Struktur 50/30/20 Anda berada dalam rentang toleransi seimbang (${needsPercent.toFixed(0)}% Kebutuhan / ${wantsPercent.toFixed(0)}% Keinginan / ${savingsPercent.toFixed(0)}% Tabungan).`;
    rebalanceRecommendations.push("Pertahankan disiplin proporsi ini pada setiap siklus penerimaan gaji.");
  }

  return {
    totalIncome,
    totalExpense,
    netSavings,
    buckets: {
      needs: needsBucket,
      wants: wantsBucket,
      savings: savingsBucket,
    },
    consultantVerdict,
    rebalanceRecommendations,
  };
}

// -------------------------------------------------------------
// 3. LEAK & ANOMALY DETECTION (LATTE FACTOR & SPIKES)
// -------------------------------------------------------------

export function detectFinancialLeaksAndSpikes(
  filteredTransactions: Transaction[],
  categories: Category[],
  metrics: DashboardMetrics
): LeakAndAnomalyReport {
  const expenseTxs = filteredTransactions.filter((tx) => tx.type === "EXPENSE");

  // 1. Latte Factor: Small repetitive expenses (< Rp 100.000)
  const microTxs = expenseTxs.filter((tx) => tx.amount > 0 && tx.amount <= 100000);
  const microGroups: Record<string, { count: number; totalAmount: number; cat: string }> = {};

  microTxs.forEach((tx) => {
    // Group by description or category
    const cleanDesc = (tx.description || tx.categoryName || "Jajan Kecil").trim();
    const key = cleanDesc.toLowerCase();
    if (!microGroups[key]) {
      microGroups[key] = { count: 0, totalAmount: 0, cat: tx.categoryName || "Lainnya" };
    }
    microGroups[key].count += 1;
    microGroups[key].totalAmount += tx.amount;
  });

  const latteFactorItems: LatteFactorItem[] = Object.entries(microGroups)
    .map(([desc, data]) => ({
      name: desc.charAt(0).toUpperCase() + desc.slice(1),
      count: data.count,
      totalAmount: data.totalAmount,
      avgAmount: Math.round(data.totalAmount / data.count),
      annualizedImpact: data.totalAmount * 12, // annualized estimate
      categoryName: data.cat,
    }))
    .filter((item) => item.count >= 2 || item.totalAmount >= 100000)
    .sort((a, b) => b.totalAmount - a.totalAmount)
    .slice(0, 5);

  const totalLatteSpend = latteFactorItems.reduce((acc, i) => acc + i.totalAmount, 0);
  const latteAnnualizedImpact = totalLatteSpend * 12;

  // 2. Weekend vs Weekday analysis
  let weekendTotal = 0;
  let weekdayTotal = 0;
  let weekendCount = 0;
  let weekdayCount = 0;

  expenseTxs.forEach((tx) => {
    try {
      const d = parseISO(tx.date.substring(0, 10));
      const day = getDay(d);
      if (day === 0 || day === 6) {
        weekendTotal += tx.amount;
        weekendCount++;
      } else {
        weekdayTotal += tx.amount;
        weekdayCount++;
      }
    } catch {}
  });

  const totalExpense = metrics.totalExpense || 1;
  const weekendExpenseRatio = (weekendTotal / totalExpense) * 100;
  const weekendAvgPerDay = weekendTotal / 2; // Saturday + Sunday representation
  const weekdayAvgPerDay = weekdayTotal / 5; // Mon - Fri representation
  const isWeekendHeavy = weekendAvgPerDay > weekdayAvgPerDay * 1.4;

  // 3. Top Single Outflows
  const topSingleExpenses = [...expenseTxs].sort((a, b) => b.amount - a.amount).slice(0, 5);

  // 4. Actionable Playbook Savings
  const actionableSavingsPlaybook = [
    {
      title: "Optimasi Jajan & Kopi Harian (The Latte Factor)",
      potentialMonthlySave: Math.round(totalLatteSpend * 0.4),
      difficulty: "Mudah" as const,
      tip: "Batasi frekuensi beli kopi/jajan di luar menjadi 2x seminggu. Buat kopi/seduhan sendiri di rumah atau kantor.",
    },
    {
      title: "Eliminasi Biaya Pengantaran / Admin Ojek Online",
      potentialMonthlySave: 150000,
      difficulty: "Mudah" as const,
      tip: "Gunakan fitur pickup langsung, manfaatkan promo bundling, atau bawa bekal saat bepergian.",
    },
    {
      title: "Audit Langganan Digital & Membership Jarang Terpakai",
      potentialMonthlySave: 200000,
      difficulty: "Sedang" as const,
      tip: "Cek kembali tagihan langganan streaming film, musik, cloud, atau gym yang jarang digunakan dalam 30 hari terakhir.",
    },
    {
      title: "Terapkan 'Aturan 48 Jam' untuk Belanja Online",
      potentialMonthlySave: Math.round((metrics.totalExpense * 0.1) || 300000),
      difficulty: "Sedang" as const,
      tip: "Tunda checkout barang non-esensial di keranjang e-commerce selama 48 jam untuk meredam impulsive buying.",
    },
  ];

  return {
    latteFactorItems,
    totalLatteSpend,
    latteAnnualizedImpact,
    categorySpikes: [],
    weekendVsWeekday: {
      weekendTotal,
      weekdayTotal,
      weekendAvgPerDay,
      weekdayAvgPerDay,
      weekendExpenseRatio,
      isWeekendHeavy,
    },
    topSingleExpenses,
    actionableSavingsPlaybook,
  };
}

// -------------------------------------------------------------
// 4. FORECAST & WEALTH ACCUMULATION SIMULATOR
// -------------------------------------------------------------

export interface ForecastPoint {
  monthLabel: string;
  baselineBalance: number;
  optimizedBalance: number;
  investedCompoundedBalance: number;
}

export function calculateFutureProjections(
  currentBalance: number,
  monthlyIncome: number,
  monthlyExpense: number,
  expenseReductionPercent: number = 10,
  incomeIncreasePercent: number = 0,
  annualInvestmentYield: number = 0.07 // 7% conservative p.a.
): {
  points: ForecastPoint[];
  summary1Year: { baseline: number; optimized: number; delta: number };
  summary3Year: { baseline: number; optimized: number; delta: number };
  summary5Year: { baseline: number; optimized: number; delta: number };
} {
  const months = [
    "Bln 1", "Bln 2", "Bln 3", "Bln 4", "Bln 5", "Bln 6",
    "Bln 7", "Bln 8", "Bln 9", "Bln 10", "Bln 11", "Bln 12"
  ];

  const currentNetMonthly = monthlyIncome - monthlyExpense;
  const optimizedExpense = monthlyExpense * (1 - expenseReductionPercent / 100);
  const optimizedIncome = monthlyIncome * (1 + incomeIncreasePercent / 100);
  const optimizedNetMonthly = optimizedIncome - optimizedExpense;

  const monthlyRate = annualInvestmentYield / 12;

  let baseBal = currentBalance;
  let optBal = currentBalance;
  let compBal = currentBalance;

  const points: ForecastPoint[] = [];

  for (let m = 0; m < 12; m++) {
    baseBal += currentNetMonthly;
    optBal += optimizedNetMonthly;
    compBal = (compBal + optimizedNetMonthly) * (1 + monthlyRate);

    points.push({
      monthLabel: months[m],
      baselineBalance: Math.max(0, Math.round(baseBal)),
      optimizedBalance: Math.max(0, Math.round(optBal)),
      investedCompoundedBalance: Math.max(0, Math.round(compBal)),
    });
  }

  // Multi-year math
  const calcYear = (years: number) => {
    const totalMonths = years * 12;
    const base = currentBalance + currentNetMonthly * totalMonths;
    const opt = currentBalance + optimizedNetMonthly * totalMonths;
    return {
      baseline: Math.max(0, Math.round(base)),
      optimized: Math.max(0, Math.round(opt)),
      delta: Math.max(0, Math.round(opt - base)),
    };
  };

  return {
    points,
    summary1Year: calcYear(1),
    summary3Year: calcYear(3),
    summary5Year: calcYear(5),
  };
}
