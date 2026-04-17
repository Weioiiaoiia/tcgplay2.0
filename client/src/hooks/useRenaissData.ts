/**
 * useRenaissData — 筛选和排序 hook
 *
 * 从全局 CardDataContext 读取数据，只负责本地筛选/排序
 * 不再自己 fetch 数据，避免重复请求
 */
import { useState, useMemo } from "react";
import { useCardData } from "@/contexts/CardDataContext";

export type SortBy =
  | "newest"
  | "price-asc"
  | "price-desc"
  | "grade"
  | "fmv"
  | "premium";

export interface Filters {
  search: string;
  category: string;
  gradeFilter: string;
  graderCompany: string;
  priceMin: number;
  priceMax: number;
  language: string;
  yearFrom: string;
  yearTo: string;
  sortBy: SortBy;
}

const DEFAULT_FILTERS: Filters = {
  search: "",
  category: "all",
  gradeFilter: "all",
  graderCompany: "all",
  priceMin: 0,
  priceMax: 100000,
  language: "all",
  yearFrom: "",
  yearTo: "",
  sortBy: "newest",
};

export function useRenaissData() {
  const {
    allCards,
    loading,
    initialLoaded,
    error,
    lastUpdated,
    totalCount,
    refreshData,
  } = useCardData();

  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);

  // Filter and sort — purely local, instant
  const cards = useMemo(() => {
    let result = [...allCards];

    // Search
    if (filters.search.trim()) {
      const q = filters.search.toLowerCase();
      result = result.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.pokemonName.toLowerCase().includes(q) ||
          c.serial.toLowerCase().includes(q) ||
          c.setName.toLowerCase().includes(q) ||
          c.cardNumber.toLowerCase().includes(q)
      );
    }

    // Category
    if (filters.category !== "all") {
      result = result.filter(
        (c) => c.category.toLowerCase() === filters.category.toLowerCase()
      );
    }

    // Grade
    if (filters.gradeFilter !== "all") {
      if (filters.gradeFilter === "≤6") {
        result = result.filter((c) => {
          const num = parseFloat(c.grade);
          return !isNaN(num) && num <= 6;
        });
      } else {
        result = result.filter((c) => c.grade.includes(filters.gradeFilter));
      }
    }

    // Grader company (PSA / BGS / CGC / TAG)
    if (filters.graderCompany !== "all") {
      result = result.filter(
        (c) => c.gradingCompany.toUpperCase() === filters.graderCompany.toUpperCase()
      );
    }

    // Price
    result = result.filter(
      (c) =>
        c.askPriceUSDT >= filters.priceMin &&
        c.askPriceUSDT <= filters.priceMax
    );

    // Language
    if (filters.language !== "all") {
      result = result.filter((c) => c.language === filters.language);
    }

    // Year range
    if (filters.yearFrom) {
      const from = parseInt(filters.yearFrom);
      if (!isNaN(from)) {
        result = result.filter((c) => parseInt(c.year) >= from);
      }
    }
    if (filters.yearTo) {
      const to = parseInt(filters.yearTo);
      if (!isNaN(to)) {
        result = result.filter((c) => parseInt(c.year) <= to);
      }
    }

    // Sort
    switch (filters.sortBy) {
      case "newest":
        // Already sorted by listDate desc from backend
        break;
      case "price-asc":
        result.sort((a, b) => a.askPriceUSDT - b.askPriceUSDT);
        break;
      case "price-desc":
        result.sort((a, b) => b.askPriceUSDT - a.askPriceUSDT);
        break;
      case "grade":
        result.sort((a, b) => {
          const ga = parseInt(a.grade) || 0;
          const gb = parseInt(b.grade) || 0;
          return gb - ga;
        });
        break;
      case "fmv":
        result.sort((a, b) => b.fmvPriceUSD - a.fmvPriceUSD);
        break;
      case "premium":
        result.sort((a, b) => a.premiumRate - b.premiumRate);
        break;
    }

    return result;
  }, [allCards, filters]);

  return {
    cards,
    allCards,
    loading,
    initialLoaded,
    error,
    filters,
    setFilters,
    lastUpdated,
    refreshData,
    totalCount,
  };
}
