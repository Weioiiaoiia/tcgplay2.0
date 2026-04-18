import TopNav from "@/components/TopNav";
import ImageCode from "@/components/ImageCode";
import { trpc } from "@/lib/trpc";
import { useMemo } from "react";

const DISCLAIMER = "This is an AI-generated synthesis for informational purposes only. TCGPlay / IntelFeed is not affiliated with any original content creator or rights holder. All trademarks belong to their respective owners. No copyrighted images are stored or distributed.";

function formatSectionLabel(section?: string) {
  if (section === "web3") return "Crypto";
  if (section === "tcg") return "TCG";
  if (section === "collector") return "收藏";
  return section || "";
}

function AccountColumn({ sourceName, label }: { sourceName: string; label: string }) {
  const input = useMemo(() => ({ sourceName, limit: 30 }), [sourceName]);
  const { data: items, isLoading, refetch } = trpc.insights.bySource.useQuery(input);

  return (
    <div className="flex-1 min-w-0">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-lg font-bold text-neutral-950">{label}</h2>
          <p className="text-sm text-black/35 mt-0.5">{items?.length ?? 0} insights</p>
        </div>
        <button onClick={() => refetch()} className="rounded-full border border-black/10 px-4 py-1.5 text-xs font-medium text-black/30 hover:text-neutral-950 hover:border-black/25 transition-colors">
          Refresh
        </button>
      </div>

      <div className="space-y-3">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-28 rounded-xl bg-black/4 animate-pulse" />
          ))
        ) : items?.length ? (
          items.map((item: any) => (
            <a key={item.id} href={item.sourceUrl || "#"} target="_blank" rel="noopener noreferrer"
              className="block rounded-xl border border-black/6 bg-white/70 backdrop-blur-sm p-5 hover:bg-white hover:shadow-lg hover:shadow-black/4 hover:-translate-y-0.5 transition-all duration-300">
              <div className="flex items-center gap-2 mb-2">
                <span className="rounded-full bg-black/6 px-2.5 py-0.5 text-[10px] font-bold text-black/40 uppercase tracking-wider">{formatSectionLabel(item.section)}</span>
                {item.publishedAt && <span className="text-sm text-black/45">{new Date(item.publishedAt).toLocaleDateString("zh-CN", { month: "long", day: "numeric" })}</span>}
                <span className="text-sm text-black/40 ml-auto">fetched {new Date(item.fetchedAt).toLocaleString("zh-CN")}</span>
              </div>
              <h3 className="text-base font-bold text-neutral-950 leading-snug">{item.title}</h3>
              <p className="mt-2 text-sm text-black/40 leading-relaxed line-clamp-3">{item.summary}</p>
              <div className="mt-3 pt-3 border-t border-black/8 space-y-1.5">
                <div className="flex items-center justify-between">
                  <ImageCode code={item.imageCode} compact />
                </div>
                <p className="text-xs font-mono text-black/35">ImageCode: {item.imageCode}</p>
              </div>
              <p className="mt-2 text-[10px] text-black/25 leading-relaxed">{DISCLAIMER}</p>
            </a>
          ))
        ) : (
          <div className="rounded-xl border border-black/6 bg-white/50 py-16 text-center">
            <p className="text-sm text-black/30">No data yet</p>
            <p className="text-xs text-black/20 mt-1">Engine is auto-fetching...</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function Web3Board() {
  return (
    <div className="min-h-screen bg-[#faf8f4]">
      <TopNav />
      <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-black text-neutral-950 tracking-tight">RC Hub</h1>
          <p className="text-sm text-black/35 mt-1">@renaissxyz vs @Collector_Crypt — side-by-side AI digest comparison</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          <div className="flex-1 rounded-2xl border border-black/6 bg-white/40 backdrop-blur-sm p-6">
            <AccountColumn sourceName="@renaissxyz (X/Twitter)" label="@renaissxyz" />
          </div>
          <div className="hidden lg:block w-px bg-black/10 self-stretch" />
          <div className="flex-1 rounded-2xl border border-black/6 bg-white/40 backdrop-blur-sm p-6">
            <AccountColumn sourceName="@Collector_Crypt (X/Twitter)" label="@Collector_Crypt" />
          </div>
        </div>
      </div>
    </div>
  );
}
