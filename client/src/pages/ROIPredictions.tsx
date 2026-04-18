import TopNav from "@/components/TopNav";
import { trpc } from "@/lib/trpc";
import { useState, useMemo } from "react";
import { Loader2, RefreshCw } from "lucide-react";
import { toast } from "sonner";

const ratingColors: Record<string, string> = {
  S: "bg-amber-100 text-amber-800 border-amber-200",
  A: "bg-emerald-50 text-emerald-700 border-emerald-200",
  B: "bg-blue-50 text-blue-600 border-blue-200",
  C: "bg-neutral-100 text-neutral-500 border-neutral-200",
};

export default function ROIPredictions() {
  const [game, setGame] = useState<"pokemon" | "onepiece">("pokemon");
  const input = useMemo(() => ({ game, limit: 20 }), [game]);
  const { data: rows, isLoading } = trpc.roi.list.useQuery(input);
  const utils = trpc.useUtils();
  const generate = trpc.roi.generate.useMutation({
    onSuccess: (r) => { toast.success(`生成 ${r.generated} 条预测`); utils.roi.list.invalidate(); },
    onError: (e) => toast.error(e.message),
  });

  return (
    <div className="min-h-screen">
      <TopNav />
      <main className="container py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold text-neutral-950">ROI 投资预测</h1>
            <p className="text-xs text-black/38 mt-1">S/A/B/C 评级 · AI 分析置信度</p>
          </div>
          <div className="flex items-center gap-2">
            {(["pokemon", "onepiece"] as const).map((g) => (
              <button key={g} onClick={() => setGame(g)} className={`px-3.5 py-1.5 rounded-full text-sm font-medium transition ${game === g ? "bg-neutral-950 text-white" : "bg-white/60 text-black/50 border border-black/8"}`}>
                {g === "pokemon" ? "宝可梦" : "航海王"}
              </button>
            ))}
            <button onClick={() => generate.mutate({ game })} disabled={generate.isPending} className="flex items-center gap-1 rounded-full bg-neutral-950 px-3 py-1.5 text-xs font-medium text-white disabled:opacity-50">
              {generate.isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : <RefreshCw className="h-3 w-3" />} 生成
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">{Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-32 animate-[shimmer_1.8s_ease-in-out_infinite] rounded-xl border border-black/6 bg-[#f3efe8]" />)}</div>
        ) : rows?.length ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {rows.map((r: any) => (
              <div key={r.id} className="insight-card p-4">
                <div className="flex items-start justify-between">
                  <h3 className="text-sm font-semibold text-neutral-950">{r.cardName}</h3>
                  <span className={`inline-flex items-center justify-center h-7 w-7 rounded-full text-xs font-bold border ${ratingColors[r.rating] || ratingColors.C}`}>
                    {r.rating}
                  </span>
                </div>
                <div className="mt-3">
                  <div className="micro-label mb-1">置信度</div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 rounded-full bg-black/8 overflow-hidden">
                      <div className="h-full rounded-full bg-neutral-950 transition-all" style={{ width: `${r.confidence}%` }} />
                    </div>
                    <span className="text-xs font-semibold text-neutral-950">{r.confidence}%</span>
                  </div>
                </div>
                <p className="mt-2.5 text-xs text-black/45 leading-relaxed">{r.rationale}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="glass-panel py-16 text-center">
            <p className="text-sm text-black/38">暂无预测数据</p>
            <p className="mt-1 text-xs text-black/25">请点击"生成"按钮获取 AI 分析</p>
          </div>
        )}
      </main>
    </div>
  );
}
