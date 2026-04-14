/**
 * CardDataContext — 全局卡牌数据缓存
 *
 * 核心设计：
 * 1. 在 App 层提供全局数据，路由切换不重新 fetch
 * 2. 后端已用 listedOnly=true，所有数据都是真实在售卡牌
 * 3. 后台静默刷新，不阻塞 UI
 * 4. 详情页从缓存秒读 + API 备用兜底
 */
import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
  type ReactNode,
} from "react";
import type { RenaissCard } from "@/lib/renaissApi";
import { fetchRenaissCards, forceRefresh, fetchCardDetail } from "@/lib/renaissApi";

interface CardDataContextType {
  allCards: RenaissCard[];
  loading: boolean;
  initialLoaded: boolean;
  error: string | null;
  lastUpdated: Date;
  totalCount: number;
  refreshData: () => Promise<void>;
  getCardByTokenId: (tokenId: string) => RenaissCard | undefined;
  fetchSingleCard: (tokenId: string) => Promise<RenaissCard | null>;
}

const CardDataContext = createContext<CardDataContextType | null>(null);

const REFRESH_INTERVAL = 30_000;

export function CardDataProvider({ children }: { children: ReactNode }) {
  const [allCards, setAllCards] = useState<RenaissCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [initialLoaded, setInitialLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const isMountedRef = useRef(true);
  const fetchingRef = useRef(false);

  const loadData = useCallback(
    async (showLoading = false) => {
      if (fetchingRef.current) return;
      fetchingRef.current = true;
      try {
        if (showLoading) setLoading(true);
        const data = await fetchRenaissCards();
        if (!isMountedRef.current) return;
        // 后端已经只返回 listedOnly 卡牌，这里直接使用
        setAllCards(data.cards);
        setLastUpdated(new Date(data.lastUpdated));
        setError(null);
        setInitialLoaded(true);
      } catch (err) {
        console.error("Failed to load cards:", err);
        if (isMountedRef.current) {
          setError("数据加载失败，请稍后重试");
        }
      } finally {
        if (isMountedRef.current) setLoading(false);
        fetchingRef.current = false;
      }
    },
    []
  );

  // Initial load
  useEffect(() => {
    isMountedRef.current = true;
    loadData(true);
    return () => {
      isMountedRef.current = false;
    };
  }, [loadData]);

  // Auto-refresh every 30 seconds (silent, no loading state)
  useEffect(() => {
    const timer = setInterval(() => {
      loadData(false);
    }, REFRESH_INTERVAL);
    return () => clearInterval(timer);
  }, [loadData]);

  // Manual refresh
  const refreshData = useCallback(async () => {
    setLoading(true);
    try {
      await forceRefresh();
      await new Promise((r) => setTimeout(r, 2000));
      await loadData(false);
    } catch {
      await loadData(true);
    } finally {
      setLoading(false);
    }
  }, [loadData]);

  // Get card from cache by tokenId — O(1) with Map would be better but array.find is fine for ~1400 items
  const getCardByTokenId = useCallback(
    (tokenId: string) => {
      return allCards.find((c) => c.tokenId === tokenId);
    },
    [allCards]
  );

  // Fetch single card from API as fallback
  const fetchSingleCard = useCallback(async (tokenId: string) => {
    return fetchCardDetail(tokenId);
  }, []);

  return (
    <CardDataContext.Provider
      value={{
        allCards,
        loading,
        initialLoaded,
        error,
        lastUpdated,
        totalCount: allCards.length,
        refreshData,
        getCardByTokenId,
        fetchSingleCard,
      }}
    >
      {children}
    </CardDataContext.Provider>
  );
}

export function useCardData() {
  const ctx = useContext(CardDataContext);
  if (!ctx) throw new Error("useCardData must be used within CardDataProvider");
  return ctx;
}
