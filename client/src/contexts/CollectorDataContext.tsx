/**
 * CollectorDataContext — Collector 市场数据全局缓存
 *
 * 与 CardDataContext（Renaiss）并行运行，互不干扰。
 * 在 App 层挂载，路由切换不重新 fetch。
 * 数据来自服务端 /api/collector/listings（Playwright 实时抓取）。
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
import {
  fetchCollectorCards,
  saveCollectorCache,
  loadCollectorCache,
  REFRESH_INTERVAL_MS,
  type CollectorCard,
} from "@/lib/collectorApi";

interface CollectorDataContextType {
  allCards: CollectorCard[];
  loading: boolean;
  initialLoaded: boolean;
  error: string | null;
  lastUpdated: Date;
  totalCount: number;
  refreshData: () => Promise<void>;
}

const CollectorDataContext = createContext<CollectorDataContextType | null>(null);

export function CollectorDataProvider({ children }: { children: ReactNode }) {
  const [allCards, setAllCards] = useState<CollectorCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [initialLoaded, setInitialLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const isMountedRef = useRef(true);
  const fetchingRef = useRef(false);

  /** 从 localStorage 加载缓存（立即显示旧数据，同时后台刷新） */
  const hydrateFromCache = useCallback(() => {
    if (typeof window === "undefined") return false;
    const cached = loadCollectorCache();
    if (!cached || cached.cards.length === 0) return false;
    setAllCards(cached.cards);
    setLastUpdated(new Date(cached.time));
    setInitialLoaded(true);
    setLoading(false);
    return true;
  }, []);

  const loadData = useCallback(async (showLoading = false) => {
    if (fetchingRef.current) return;
    fetchingRef.current = true;
    try {
      if (showLoading) setLoading(true);
      const result = await fetchCollectorCards();
      if (!isMountedRef.current) return;
      setAllCards(result.cards);
      setLastUpdated(new Date(result.lastUpdated));
      setError(null);
      setInitialLoaded(true);
      if (result.cards.length > 0) {
        saveCollectorCache(result.cards);
      }
    } catch (err) {
      console.error("[Collector] Failed to load cards:", err);
      if (isMountedRef.current) {
        setError("Collector 数据加载中，服务器正在抓取实时数据，请稍候…");
      }
    } finally {
      if (isMountedRef.current) setLoading(false);
      fetchingRef.current = false;
    }
  }, []);

  // 初始加载：先显示缓存，同时后台拉取最新数据
  useEffect(() => {
    isMountedRef.current = true;
    const hadCache = hydrateFromCache();
    // 无论是否有缓存，都触发后台刷新（不显示 loading 骨架）
    loadData(!hadCache);
    return () => {
      isMountedRef.current = false;
    };
  }, [hydrateFromCache, loadData]);

  // 每 30 秒静默刷新
  useEffect(() => {
    const timer = setInterval(() => {
      loadData(false);
    }, REFRESH_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [loadData]);

  const refreshData = useCallback(async () => {
    setLoading(true);
    await loadData(false);
  }, [loadData]);

  return (
    <CollectorDataContext.Provider
      value={{
        allCards,
        loading,
        initialLoaded,
        error,
        lastUpdated,
        totalCount: allCards.length,
        refreshData,
      }}
    >
      {children}
    </CollectorDataContext.Provider>
  );
}

export function useCollectorData() {
  const ctx = useContext(CollectorDataContext);
  if (!ctx) throw new Error("useCollectorData must be used within CollectorDataProvider");
  return ctx;
}
