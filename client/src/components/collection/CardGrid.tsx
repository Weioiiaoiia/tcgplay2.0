import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useWallet } from '@/contexts/WalletContext';
import { parseFMV, getGradeNumber, type CardData } from '@/lib/renaissApi';
import { RefreshCw, SlidersHorizontal, Search, X } from 'lucide-react';
import CardItem from './CardItem';

type SortOption = 'fmv-desc' | 'fmv-asc' | 'grade-desc' | 'year-desc';
type FilterOption = 'all' | 'pokemon' | 'psa10' | 'psa9';

export default function CardGrid({ onCardClick }: { onCardClick: (card: CardData) => void }) {
  const { cards, refreshCards, loading } = useWallet();
  const [filter, setFilter] = useState<FilterOption>('all');
  const [sort, setSort] = useState<SortOption>('fmv-desc');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);

  const filteredCards = useMemo(() => {
    let result = [...cards];

    // Search
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      result = result.filter(c =>
        c.pokemonName.toLowerCase().includes(q) ||
        c.serial.toLowerCase().includes(q) ||
        c.cardNumber.toLowerCase().includes(q) ||
        c.setName.toLowerCase().includes(q) ||
        c.name.toLowerCase().includes(q)
      );
    }

    // Filter
    switch (filter) {
      case 'pokemon':
        result = result.filter(c => c.type === 'POKEMON');
        break;
      case 'psa10':
        result = result.filter(c => getGradeNumber(c.grade) === 10);
        break;
      case 'psa9':
        result = result.filter(c => getGradeNumber(c.grade) === 9);
        break;
    }

    // Sort
    switch (sort) {
      case 'fmv-desc':
        result.sort((a, b) => parseInt(b.fmvPriceInUSD) - parseInt(a.fmvPriceInUSD));
        break;
      case 'fmv-asc':
        result.sort((a, b) => parseInt(a.fmvPriceInUSD) - parseInt(b.fmvPriceInUSD));
        break;
      case 'grade-desc':
        result.sort((a, b) => getGradeNumber(b.grade) - getGradeNumber(a.grade));
        break;
      case 'year-desc':
        result.sort((a, b) => b.year - a.year);
        break;
    }

    return result;
  }, [cards, filter, sort, searchQuery]);

  // Stats
  const totalCards = cards.length;
  const totalFMV = cards.reduce((sum, c) => sum + parseFMV(c.fmvPriceInUSD), 0);
  const uniqueCards = new Set(cards.map(c => c.pokemonName)).size;
  const avgGrade = cards.length
    ? cards.reduce((sum, c) => sum + getGradeNumber(c.grade), 0) / cards.length
    : 0;

  const psa10Count = cards.filter(c => getGradeNumber(c.grade) === 10).length;
  const psa9Count = cards.filter(c => getGradeNumber(c.grade) === 9).length;
  const pokemonCount = cards.filter(c => c.type === 'POKEMON').length;

  const filters: { key: FilterOption; label: string }[] = [
    { key: 'all', label: `All (${totalCards})` },
    { key: 'psa10', label: `PSA 10 (${psa10Count})` },
    { key: 'psa9', label: `PSA 9 (${psa9Count})` },
  ];

  const stats = [
    { label: 'TOTAL CARDS', value: totalCards.toString() },
    { label: 'PORTFOLIO VALUE', value: `$${totalFMV.toFixed(2)}`, highlight: true },
    { label: 'UNIQUE CARDS', value: uniqueCards.toString() },
    { label: 'AVG. GRADE', value: avgGrade.toFixed(2) },
  ];

  return (
    <div className="pt-20 pb-12 container">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-white/90">My Collection</h1>
        <button
          onClick={refreshCards}
          disabled={loading}
          className="p-2 rounded-lg text-white/30 hover:text-white/60 hover:bg-white/[0.04] transition-all duration-300 disabled:opacity-30"
          title="刷新数据"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3 mb-5 sm:mb-8">
        {stats.map((s) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-xl p-3 sm:p-4 border border-white/[0.06]"
            style={{ background: 'oklch(0.1 0.005 260 / 0.6)' }}
          >
            <div className="text-[9px] sm:text-[10px] uppercase tracking-wider text-white/30 mb-1 font-medium">
              {s.label}
            </div>
            <div
              className={`text-base sm:text-xl font-bold ${s.highlight ? '' : 'text-white/90'}`}
              style={s.highlight ? { color: 'oklch(0.85 0.15 85)' } : undefined}
            >
              {s.value}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Search bar */}
      <div className="mb-4 sm:mb-5">
        <div
          className={`relative flex items-center rounded-xl border transition-all duration-300 ${
            searchFocused
              ? 'border-[oklch(0.85_0.15_85/0.4)] bg-[oklch(0.1_0.005_260/0.9)]'
              : 'border-white/[0.08] bg-[oklch(0.08_0.005_260/0.6)]'
          }`}
        >
          <Search className="w-4 h-4 text-white/30 ml-3.5 shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            placeholder="搜索卡牌名称、序列号、卡号..."
            className="w-full px-3 py-2.5 text-[13px] text-white/80 placeholder:text-white/25 bg-transparent border-none outline-none"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="p-1.5 mr-2 rounded-md text-white/30 hover:text-white/60 hover:bg-white/[0.06] transition-all"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
        {searchQuery.trim() && (
          <div className="mt-2 text-[11px] text-white/30">
            找到 {filteredCards.length} 张匹配的卡牌
          </div>
        )}
      </div>

      {/* Filters + Sort */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 sm:mb-6 gap-3">
        <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap overflow-x-auto pb-1 sm:pb-0 -mx-1 px-1">
          {filters.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`px-2.5 sm:px-3.5 py-1.5 rounded-lg text-[11px] sm:text-[12px] font-medium transition-all duration-300 border whitespace-nowrap ${
                filter === f.key
                  ? 'border-[oklch(0.85_0.15_85/0.3)] text-[oklch(0.85_0.15_85)] bg-[oklch(0.85_0.15_85/0.08)]'
                  : 'border-white/[0.06] text-white/40 hover:text-white/60 hover:bg-white/[0.03]'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <SlidersHorizontal className="w-3.5 h-3.5 text-white/30" />
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortOption)}
            className="text-[12px] text-white/50 bg-transparent border-none outline-none cursor-pointer"
          >
            <option value="fmv-desc" className="bg-[oklch(0.1_0.005_260)]">FMV: High to Low</option>
            <option value="fmv-asc" className="bg-[oklch(0.1_0.005_260)]">FMV: Low to High</option>
            <option value="grade-desc" className="bg-[oklch(0.1_0.005_260)]">Grade: High to Low</option>
            <option value="year-desc" className="bg-[oklch(0.1_0.005_260)]">Year: Newest</option>
          </select>
        </div>
      </div>

      {/* Card grid - responsive columns */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-4">
        {filteredCards.map((card, i) => (
          <CardItem key={card.id} card={card} index={i} onClick={() => onCardClick(card)} />
        ))}
      </div>

      {filteredCards.length === 0 && !loading && (
        <div className="text-center py-20 text-white/30 text-sm">
          {searchQuery.trim() ? (
            <div>
              <div className="mb-2">未找到匹配 "{searchQuery}" 的卡牌</div>
              <button
                onClick={() => setSearchQuery('')}
                className="text-[oklch(0.85_0.15_85)] hover:underline text-[12px]"
              >
                清除搜索
              </button>
            </div>
          ) : (
            '没有找到匹配的卡牌'
          )}
        </div>
      )}
    </div>
  );
}
