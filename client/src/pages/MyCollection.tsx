import { useState } from 'react';
import { useWallet } from '@/contexts/WalletContext';
import { Link } from 'wouter';
import { ArrowLeft } from 'lucide-react';
import WalletConnect from '@/components/collection/WalletConnect';
import CardGrid from '@/components/collection/CardGrid';
import CardDetail from '@/components/collection/CardDetail';
import { type CardData } from '@/lib/renaissApi';

export default function MyCollection() {
  const { connected, loading } = useWallet();
  const [selectedCard, setSelectedCard] = useState<CardData | null>(null);

  return (
    <div className="min-h-screen bg-[oklch(0.07_0.005_260)]">
      {/* Top navigation bar */}
      <nav className="fixed top-0 inset-x-0 z-50">
        <div
          className="absolute inset-0"
          style={{
            backgroundColor: 'oklch(0.07 0.005 260 / 0.88)',
            backdropFilter: 'blur(24px) saturate(1.2)',
          }}
        />
        <div className="absolute bottom-0 inset-x-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, oklch(1 0 0 / 0.06), transparent)' }} />

        <div className="relative container flex items-center justify-between h-14">
          {/* Back to home */}
          <Link
            href="/"
            className="flex items-center gap-2 text-white/50 hover:text-white/80 transition-colors duration-300"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-[13px] font-medium">返回</span>
          </Link>

          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-white/15 to-white/[0.04] border border-white/[0.08] flex items-center justify-center">
              <span className="text-[11px] font-bold text-white/80">T</span>
            </div>
            <span className="text-[15px] font-semibold tracking-tight text-white/90">
              TCGPlay
            </span>
          </div>

          {/* Renaiss status */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-400/[0.06] border border-emerald-400/[0.1]">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[11px] text-emerald-400/70 font-medium">Renaiss</span>
          </div>
        </div>
      </nav>

      {!connected && !loading ? (
        <WalletConnect />
      ) : (
        <>
          <CardGrid onCardClick={setSelectedCard} />
          <CardDetail card={selectedCard} onClose={() => setSelectedCard(null)} />
        </>
      )}
    </div>
  );
}
