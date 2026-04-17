/**
 * Collection page — unified with MarketLuxe design language.
 * Warm ivory, compact header, full-width layout.
 */
import { useState } from "react";
import { LogOut } from "lucide-react";
import { useLocation } from "wouter";
import { useWallet } from "@/contexts/WalletContext";
import WalletConnect from "@/components/collection/WalletConnect";
import CardGrid from "@/components/collection/CardGrid";
import CardDetail from "@/components/collection/CardDetail";
import { type CardData } from "@/lib/renaissApi";

export default function MyCollection() {
  const [, navigate] = useLocation();
  const { connected, loading, address, disconnectWallet } = useWallet();
  const [selectedCard, setSelectedCard] = useState<CardData | null>(null);

  const shortAddr = address ? `${address.slice(0, 6)}...${address.slice(-4)}` : "";

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#fbf8f2,#f5f0e8)] text-[#1a1612]">
      {/* 顶部导航栏 — 与市场监控完全一致 */}
      <header className="sticky top-0 z-50 border-b border-[#ece5d8] bg-[rgba(251,248,242,0.9)] backdrop-blur-2xl">
        <div className="w-full px-4 py-3 sm:px-5 lg:px-6 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/")}
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#e0d8cc] bg-white/75 text-[#6b6055] transition-all duration-300 hover:bg-[#1a1612] hover:text-white hover:border-[#1a1612]"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-[15px] tracking-tight text-[#1a1612]">我的藏品</span>
              {connected && (
                <span className="inline-flex items-center gap-1 rounded-full border border-[#b8e4c8] bg-[#edf9f2] px-2 py-0.5 text-[10px] font-medium text-[#2d7a4f]">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#4a9e6a] animate-pulse" />
                  已连接
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {connected && address && (
              <>
                <span className="hidden sm:block font-mono text-[11px] text-[#a89880] tabular-nums">
                  {shortAddr}
                </span>
                <button
                  onClick={disconnectWallet}
                  className="inline-flex items-center gap-1.5 rounded-full border border-[#e0d8cc] bg-white/75 px-3 py-1.5 text-[12px] font-medium text-[#6b6055] transition-all hover:bg-[#1a1612] hover:text-white hover:border-[#1a1612]"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">断开</span>
                </button>
              </>
            )}
          </div>
        </div>
      </header>

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
