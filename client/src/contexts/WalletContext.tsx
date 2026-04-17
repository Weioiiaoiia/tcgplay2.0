import { createContext, useContext, useState, useCallback, useEffect, useRef, type ReactNode } from 'react';
import { type CardData } from '@/lib/renaissApi';

interface WalletState {
  address: string | null;
  cards: CardData[];
  loading: boolean;
  error: string | null;
  connected: boolean;
}

interface WalletContextType extends WalletState {
  connectWallet: (address: string) => Promise<void>;
  disconnectWallet: () => void;
  refreshCards: () => Promise<void>;
}

const WalletContext = createContext<WalletContextType | null>(null);

const CACHE_PREFIX = 'tcg_cards_';
const ADDR_KEY = 'tcg_wallet';

function getCached(addr: string): CardData[] | null {
  try {
    const d = JSON.parse(localStorage.getItem(CACHE_PREFIX + addr.toLowerCase()) || 'null');
    return d?.cards?.length > 0 ? d.cards : null;
  } catch { return null; }
}
function setCache(addr: string, cards: CardData[]) {
  try { localStorage.setItem(CACHE_PREFIX + addr.toLowerCase(), JSON.stringify({ cards, t: Date.now() })); } catch {}
}
function getLastAddr(): string | null {
  try { return localStorage.getItem(ADDR_KEY); } catch { return null; }
}
function setLastAddr(a: string | null) {
  try { a ? localStorage.setItem(ADDR_KEY, a) : localStorage.removeItem(ADDR_KEY); } catch {}
}
function preload(cards: CardData[]) {
  cards.forEach(c => { if (c.frontImageUrl) { const i = new Image(); i.src = c.frontImageUrl; } });
}

// Parse raw askPrice from wei or plain USDT string to a human-readable USDT string
function parseAskPrice(raw: any): string {
  if (!raw || raw === 'NO-ASK-PRICE') return 'NO-ASK-PRICE';
  const str = String(raw);
  // If length > 15, it's likely a wei (1e18) value
  if (str.length > 15) {
    try {
      const converted = Number(BigInt(str) / BigInt(1e14)) / 10000;
      return converted > 0 ? String(Math.round(converted * 100) / 100) : 'NO-ASK-PRICE';
    } catch {
      return 'NO-ASK-PRICE';
    }
  }
  const num = parseFloat(str);
  return Number.isFinite(num) && num > 0 ? String(Math.round(num * 100) / 100) : 'NO-ASK-PRICE';
}

// Parse a raw Renaiss API item into CardData
function parseCard(item: any): CardData {
  const getAttr = (trait: string) => {
    const attr = item.attributes?.find((a: any) => a.trait === trait);
    return attr?.value || '';
  };
  return {
    id: item.id,
    tokenId: item.tokenId,
    name: item.name,
    ownerAddress: item.ownerAddress,
    fmvPriceInUSD: item.fmvPriceInUSD || item.fmvPriceInUsd || '0',
    frontImageUrl: item.frontImageUrl,
    backImageUrl: item.backImageUrl || null,
    serial: item.serial || getAttr('Serial'),
    grade: item.grade || getAttr('Grade'),
    year: typeof item.year === 'number' ? item.year : parseInt(item.year || getAttr('Year')) || 0,
    setName: item.setName || '',
    cardNumber: item.cardNumber || '',
    pokemonName: item.pokemonName || item.name?.split('#')[0]?.trim()?.split(' ').pop() || 'Unknown',
    language: item.language || getAttr('Language'),
    gradingCompany: item.gradingCompany || getAttr('Grader') || 'PSA',
    vaultLocation: item.vaultLocation || 'platform',
    askPriceInUSDT: parseAskPrice(item.askPriceInUSDT),
    type: item.type || 'POKEMON',
  };
}

// Fetch a single page from Renaiss API directly
async function fetchPage(offset: number, limit: number): Promise<{ items: any[]; total: number }> {
  const input = JSON.stringify({
    "0": { json: { limit, offset, sortBy: "fmvPriceInUsd", sortOrder: "desc" } }
  });
  const url = `https://www.renaiss.xyz/api/trpc/collectible.list?batch=1&input=${encodeURIComponent(input)}`;

  const response = await fetch(url, {
    headers: {
      'Accept': '*/*',
      'Content-Type': 'application/json',
    },
  });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  const data = await response.json();
  const result = (data as any)[0]?.result?.data?.json;
  const items = result?.collection || result?.items || [];
  const total = result?.pagination?.total || 0;
  return { items, total };
}

// Fetch all cards for a wallet address by scanning Renaiss API
async function fetchWalletCards(walletAddress: string): Promise<CardData[]> {
  const addr = walletAddress.toLowerCase();
  const allCards: CardData[] = [];
  const limit = 100;

  // Fetch first page to get total
  const first = await fetchPage(0, limit);
  if (first.items.length === 0) return allCards;

  const total = first.total;

  // Process first page
  for (const item of first.items) {
    if ((item.ownerAddress || '').toLowerCase() === addr) {
      allCards.push(parseCard(item));
    }
  }

  // Fetch remaining pages concurrently (5 at a time)
  const offsets: number[] = [];
  for (let o = limit; o < total && o <= 10000; o += limit) {
    offsets.push(o);
  }

  const CONCURRENCY = 5;
  for (let i = 0; i < offsets.length; i += CONCURRENCY) {
    const batch = offsets.slice(i, i + CONCURRENCY);
    const results = await Promise.all(batch.map(o => fetchPage(o, limit)));
    for (const r of results) {
      for (const item of r.items) {
        if ((item.ownerAddress || '').toLowerCase() === addr) {
          allCards.push(parseCard(item));
        }
      }
    }
  }

  // Sort by FMV descending
  allCards.sort((a, b) => parseInt(b.fmvPriceInUSD) - parseInt(a.fmvPriceInUSD));
  return allCards;
}

export function WalletProvider({ children }: { children: ReactNode }) {
  const retryRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const [state, setState] = useState<WalletState>(() => {
    const last = getLastAddr();
    if (last) {
      const cached = getCached(last);
      if (cached) return { address: last, cards: cached, loading: false, error: null, connected: true };
    }
    return { address: null, cards: [], loading: false, error: null, connected: false };
  });

  // If restored from cache, background refresh
  useEffect(() => {
    const addr = getLastAddr();
    if (!addr || !state.connected || state.cards.length === 0) return;
    let cancelled = false;

    const tryRefresh = async () => {
      try {
        const cards = await fetchWalletCards(addr);
        if (cancelled) return;
        if (cards.length > 0) {
          setCache(addr, cards);
          preload(cards);
          setState(prev => ({ ...prev, cards }));
        }
      } catch {}
    };
    tryRefresh();
    return () => { cancelled = true; clearTimeout(retryRef.current); };
  }, []); // eslint-disable-line

  const connectWallet = useCallback(async (address: string) => {
    if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
      setState(prev => ({ ...prev, error: '无效的钱包地址格式' }));
      return;
    }

    // Instant from local cache
    const cached = getCached(address);
    if (cached) {
      setState({ address, cards: cached, loading: false, error: null, connected: true });
      setLastAddr(address);
      preload(cached);
      // Background refresh
      fetchWalletCards(address).then(cards => {
        if (cards.length > 0) {
          setCache(address, cards);
          preload(cards);
          setState(prev => ({ ...prev, cards }));
        }
      }).catch(() => {});
      return;
    }

    // No cache - fetch with loading spinner
    setState(prev => ({ ...prev, loading: true, error: null, address }));

    try {
      const cards = await fetchWalletCards(address);
      setCache(address, cards);
      setLastAddr(address);
      preload(cards);
      setState({
        address, cards, loading: false,
        error: cards.length === 0 ? '该钱包地址未找到 Renaiss 卡牌资产' : null,
        connected: true,
      });
    } catch (err) {
      setState(prev => ({
        ...prev, loading: false,
        error: err instanceof Error ? err.message : '获取失败',
      }));
    }
  }, []);

  const disconnectWallet = useCallback(() => {
    clearTimeout(retryRef.current);
    setLastAddr(null);
    setState({ address: null, cards: [], loading: false, error: null, connected: false });
  }, []);

  const refreshCards = useCallback(async () => {
    if (!state.address) return;
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const cards = await fetchWalletCards(state.address);
      setCache(state.address, cards);
      preload(cards);
      setState(prev => ({ ...prev, cards, loading: false }));
    } catch (err) {
      setState(prev => ({ ...prev, loading: false, error: err instanceof Error ? err.message : '刷新失败' }));
    }
  }, [state.address]);

  return (
    <WalletContext.Provider value={{ ...state, connectWallet, disconnectWallet, refreshCards }}>
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const ctx = useContext(WalletContext);
  if (!ctx) throw new Error('useWallet must be used within WalletProvider');
  return ctx;
}
