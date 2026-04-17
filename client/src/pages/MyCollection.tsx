/**
 * Design note — Fog-white precision exhibition system.
 * This page should feel like a premium portfolio viewing room: airy, luminous,
 * editorial, and functionally clear. Preserve address-input lookup and modal detail.
 */
import { useState } from "react";
import { ArrowLeft, Globe, LogOut } from "lucide-react";
import { Link } from "wouter";
import { useWallet } from "@/contexts/WalletContext";
import WalletConnect from "@/components/collection/WalletConnect";
import CardGrid from "@/components/collection/CardGrid";
import CardDetail from "@/components/collection/CardDetail";
import { type CardData } from "@/lib/renaissApi";

export default function MyCollection() {
  const { connected, loading, address, disconnectWallet } = useWallet();
  const [selectedCard, setSelectedCard] = useState<CardData | null>(null);

  const shortAddr = address ? `${address.slice(0, 6)}...${address.slice(-4)}` : "";

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f7f4ee_0%,#efebe2_40%,#f8f6f1_100%)] text-neutral-950">
      <div className="fixed inset-x-0 top-0 z-50 px-4 pt-4 sm:px-6">
        <nav className="mx-auto flex max-w-[1240px] items-center justify-between rounded-full border border-black/8 bg-white/76 px-4 py-3 shadow-[0_18px_60px_-36px_rgba(24,24,27,0.35)] backdrop-blur-xl sm:px-6">
          <div className="flex items-center gap-3 sm:gap-4">
            <Link
              href="/"
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-black/8 bg-[#f6f2eb] text-black/70 transition hover:bg-black hover:text-white"
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full border border-black/8 bg-[#f5f1ea] text-sm font-semibold text-neutral-950">
                T
              </div>
              <div>
                <div className="text-base font-semibold text-neutral-950">TCGPlay</div>
                <div className="hidden text-[0.62rem] uppercase tracking-[0.26em] text-black/30 sm:block">
                  Collection View
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {connected && address ? (
              <>
                <div className="hidden items-center gap-2 rounded-full border border-black/8 bg-[#f6f2eb] px-3 py-2 text-xs text-black/58 sm:inline-flex">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  {shortAddr}
                </div>
                <button
                  onClick={disconnectWallet}
                  className="inline-flex items-center gap-2 rounded-full border border-black/8 bg-white px-3 py-2 text-xs font-medium text-black/64 transition hover:bg-black hover:text-white"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  断开
                </button>
              </>
            ) : (
              <div className="inline-flex items-center gap-2 rounded-full border border-black/8 bg-[#f6f2eb] px-3 py-2 text-xs text-black/56">
                <Globe className="h-3.5 w-3.5" />
                Address Query
              </div>
            )}
          </div>
        </nav>
      </div>

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
