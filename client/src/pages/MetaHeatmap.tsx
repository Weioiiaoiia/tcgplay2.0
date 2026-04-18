import TopNav from "@/components/TopNav";
import { trpc } from "@/lib/trpc";
import { useState, useMemo } from "react";
import { TrendingUp, TrendingDown, Minus, Loader2, RefreshCw } from "lucide-react";
import { toast } from "sonner";

export default function MetaHeatmap() {
  const [game, setGame] = useState<"pokemon" | "onepiece">("pokemon");
  const input = useMemo(() => ({ game, limit: 20 }), [game]);
  const { data: rows, isLoading } = trpc.meta.heatmap.useQuery(input);
  const utils = trpc.useUtils();
  const generate = trpc.meta.generate.useMutation({
    onSuccess: (r) => { toast.success(`生成 ${r.generated} 条热度数据`); utils.meta.heatmap.invalidate(); },
    onError: (e) => toast.error(e.message),
  });

  const TrendIcon = ({ t }: { t: string }) =>
    t === "up" ? <TrendingUp className="h-3.5 w-3.5 text-green-500" /> :
    t === "down" ? <TrendingDown className="h-3.5 w-3.5 text-red-400" /> :
    <Minus className="h-3.5 w-3.5 text-black/25" />;

  return (
    <div className="min-h-screen">
      <TopNav />
      <main className="container py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold text-neutral-950">Meta 竞技热力图</h1>
            <p className="text-xs text-black/38 mt-1">卡牌出场率、胜率趋势</p>
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
          <div className="space-y-2">{Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-14 animate-[shimmer_1.8s_ease-in-out_infinite] rounded-xl border border-black/6 bg-[#f3efe8]" />)}</div>
        ) : rows?.length ? (
          <div className="glass-panel overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-black/6">
                  <th className="text-left py-3 px-4 text-[11px] font-semibold text-black/40 uppercase tracking-wider">卡牌</th>
                  <th className="text-center py-3 px-4 text-[11px] font-semibold text-black/40 uppercase tracking-wider">出场率</th>
                  <th className="text-center py-3 px-4 text-[11px] font-semibold text-black/40 uppercase tracking-wider">胜率</th>
                  <th className="text-center py-3 px-4 text-[11px] font-semibold text-black/40 uppercase tracking-wider">趋势</th>
                  <th className="text-left py-3 px-4 text-[11px] font-semibold text-black/40 uppercase tracking-wider">备注</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r: any, i: number) => (
                  <tr key={r.id} className="border-b border-black/4 last:border-0 hover:bg-black/[0.02] transition">
                    <td className="py-3 px-4 font-medium text-neutral-950">{r.cardName}</td>
                    <td className="py-3 px-4 text-center">
                      <div className="inline-flex items-center gap-2">
                        <div className="w-20 h-1.5 rounded-full bg-black/8 overflow-hidden">
                          <div className="h-full rounded-full bg-neutral-950" style={{ width: `${r.appearances}%` }} />
                        </div>
                        <span className="text-xs text-black/50">{r.appearances}%</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="text-xs font-semibold text-neutral-950">{r.winRate}%</span>
                    </td>
                    <td className="py-3 px-4 text-center"><TrendIcon t={r.trend} /></td>
                    <td className="py-3 px-4 text-xs text-black/40">{r.notes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="glass-panel py-16 text-center">
            <p className="text-sm text-black/38">暂无热度数据</p>
            <p className="mt-1 text-xs text-black/25">请点击"生成"按钮获取分析数据</p>
          </div>
        )}
      </main>
    </div>
  );
}
