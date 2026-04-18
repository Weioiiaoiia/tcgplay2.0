import TopNav from "@/components/TopNav";
import ImageCode from "@/components/ImageCode";
import { trpc } from "@/lib/trpc";
import { useMemo } from "react";
import { AlertTriangle, ExternalLink, Shield } from "lucide-react";

const sevColor: Record<string, string> = {
  high: "bg-red-50 text-red-700 border-red-200",
  medium: "bg-amber-50 text-amber-700 border-amber-200",
  low: "bg-blue-50 text-blue-600 border-blue-200",
};

const DISCLAIMER = "This is an AI-generated synthesis for informational purposes only. TCGPlay / IntelFeed is not affiliated with any original content creator or rights holder. All trademarks belong to their respective owners. No copyrighted images are stored or distributed.";

export default function Alerts() {
  const input = useMemo(() => ({ limit: 40 }), []);
  const { data: alerts, isLoading } = trpc.alerts.list.useQuery(input);

  return (
    <div className="min-h-screen">
      <TopNav />
      <main className="container py-8">
        <div className="mb-6">
          <h1 className="text-xl font-bold text-neutral-950">预警中心</h1>
          <p className="text-xs text-black/38 mt-1">AI 自动识别的高关注事件</p>
        </div>

        <div className="space-y-3">
          {isLoading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-24 animate-[shimmer_1.8s_ease-in-out_infinite] rounded-xl border border-black/6 bg-[#f3efe8]" />
            ))
          ) : alerts?.length ? (
            alerts.map((a: any) => (
              <div key={a.id} className="insight-card p-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className={`h-5 w-5 flex-shrink-0 mt-0.5 ${a.severity === "high" ? "text-red-500" : a.severity === "medium" ? "text-amber-500" : "text-blue-400"}`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold ${sevColor[a.severity] || sevColor.low}`}>
                        {a.severity.toUpperCase()}
                      </span>
                      <span className="text-[11px] text-black/30">{new Date(a.createdAt).toLocaleString("zh-CN")}</span>
                    </div>
                    <h3 className="text-sm font-semibold text-neutral-950">{a.title}</h3>
                    <p className="mt-1 text-xs text-black/50 leading-relaxed">{a.description}</p>
                    <div className="mt-2 flex items-center gap-3">
                      <ImageCode code={a.imageCode} compact />
                      {a.source && <span className="text-[10px] text-black/30">{a.source}</span>}
                      {a.sourceUrl && (
                        <a href={a.sourceUrl} target="_blank" rel="noopener noreferrer" className="text-[10px] text-black/30 hover:text-black/60 flex items-center gap-0.5">
                          原文 <ExternalLink className="h-2.5 w-2.5" />
                        </a>
                      )}
                    </div>
                    <p className="mt-1.5 text-[9px] italic text-black/20">{DISCLAIMER}</p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="glass-panel py-16 text-center">
              <Shield className="h-8 w-8 text-black/15 mx-auto mb-3" />
              <p className="text-sm text-black/38">暂无预警</p>
              <p className="mt-1 text-xs text-black/25">引擎抓取后将自动识别预警事件</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
