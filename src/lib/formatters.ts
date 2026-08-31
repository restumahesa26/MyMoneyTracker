import {
  format,
  isToday,
  isYesterday,
  parseISO,
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  subDays,
  subMonths,
  startOfYear,
  endOfYear,
} from "date-fns";
import { id } from "date-fns/locale";
import { DateFilterState, DateRangePreset } from "@/types";

export function formatIDR(amount: number, hideBalance: boolean = false): string {
  if (hideBalance) {
    return "Rp ••••••";
  }
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatCompactIDR(amount: number, hideBalance: boolean = false): string {
  if (hideBalance) {
    return "Rp •••";
  }
  if (Math.abs(amount) >= 1_000_000_000) {
    return `Rp ${(amount / 1_000_000_000).toFixed(1)} M`;
  }
  if (Math.abs(amount) >= 1_000_000) {
    return `Rp ${(amount / 1_000_000).toFixed(1)} jt`;
  }
  if (Math.abs(amount) >= 1_000) {
    return `Rp ${(amount / 1_000).toFixed(0)} rb`;
  }
  return formatIDR(amount);
}

export function formatDate(dateString: string): string {
  try {
    const date = typeof dateString === "string" ? parseISO(dateString) : new Date(dateString);
    if (isToday(date)) {
      return `Hari Ini, ${format(date, "HH:mm")}`;
    }
    if (isYesterday(date)) {
      return `Kemarin, ${format(date, "HH:mm")}`;
    }
    return format(date, "d MMM yyyy, HH:mm", { locale: id });
  } catch (e) {
    return dateString;
  }
}

export function formatDateOnly(dateString: string): string {
  try {
    const date = typeof dateString === "string" ? parseISO(dateString) : new Date(dateString);
    return format(date, "d MMMM yyyy", { locale: id });
  } catch (e) {
    return dateString;
  }
}

export function getDateFilterRange(
  preset: DateRangePreset,
  customStart?: string,
  customEnd?: string,
  monthIndex?: number,
  yearNumber?: number
): DateFilterState {
  const now = new Date();

  switch (preset) {
    case "today":
      return {
        preset: "today",
        startDate: format(startOfDay(now), "yyyy-MM-dd"),
        endDate: format(endOfDay(now), "yyyy-MM-dd"),
        label: "Hari Ini",
      };

    case "yesterday": {
      const yesterday = subDays(now, 1);
      return {
        preset: "yesterday",
        startDate: format(startOfDay(yesterday), "yyyy-MM-dd"),
        endDate: format(endOfDay(yesterday), "yyyy-MM-dd"),
        label: "Kemarin",
      };
    }

    case "last7days": {
      const sevenDaysAgo = subDays(now, 6);
      return {
        preset: "last7days",
        startDate: format(startOfDay(sevenDaysAgo), "yyyy-MM-dd"),
        endDate: format(endOfDay(now), "yyyy-MM-dd"),
        label: "7 Hari Terakhir",
      };
    }

    case "last30days": {
      const thirtyDaysAgo = subDays(now, 29);
      return {
        preset: "last30days",
        startDate: format(startOfDay(thirtyDaysAgo), "yyyy-MM-dd"),
        endDate: format(endOfDay(now), "yyyy-MM-dd"),
        label: "30 Hari Terakhir",
      };
    }

    case "thisMonth":
      return {
        preset: "thisMonth",
        startDate: format(startOfMonth(now), "yyyy-MM-dd"),
        endDate: format(endOfMonth(now), "yyyy-MM-dd"),
        label: `Bulan Ini (${format(now, "MMMM yyyy", { locale: id })})`,
      };

    case "lastMonth": {
      const prevMonth = subMonths(now, 1);
      return {
        preset: "lastMonth",
        startDate: format(startOfMonth(prevMonth), "yyyy-MM-dd"),
        endDate: format(endOfMonth(prevMonth), "yyyy-MM-dd"),
        label: `Bulan Lalu (${format(prevMonth, "MMMM yyyy", { locale: id })})`,
      };
    }

    case "thisYear":
      return {
        preset: "thisYear",
        startDate: format(startOfYear(now), "yyyy-MM-dd"),
        endDate: format(endOfYear(now), "yyyy-MM-dd"),
        label: `Tahun ${format(now, "yyyy")}`,
      };

    case "customMonth": {
      const targetYear = yearNumber ?? now.getFullYear();
      const targetMonth = monthIndex ?? now.getMonth();
      const targetDate = new Date(targetYear, targetMonth, 1);
      return {
        preset: "customMonth",
        startDate: format(startOfMonth(targetDate), "yyyy-MM-dd"),
        endDate: format(endOfMonth(targetDate), "yyyy-MM-dd"),
        selectedMonth: targetMonth,
        selectedYear: targetYear,
        label: format(targetDate, "MMMM yyyy", { locale: id }),
      };
    }

    case "customRange": {
      const start = customStart || format(startOfMonth(now), "yyyy-MM-dd");
      const end = customEnd || format(endOfMonth(now), "yyyy-MM-dd");
      return {
        preset: "customRange",
        startDate: start,
        endDate: end,
        label: `${formatDateOnly(start)} - ${formatDateOnly(end)}`,
      };
    }

    case "all":
    default:
      return {
        preset: "all",
        startDate: "2020-01-01",
        endDate: "2099-12-31",
        label: "Semua Waktu",
      };
  }
}
