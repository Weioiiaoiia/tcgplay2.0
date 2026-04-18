import TopNav from "@/components/TopNav";
import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { Play, Square, Zap, Plus, Trash2, Wifi, WifiOff, Loader2, CheckCircle, XCircle, ToggleLeft, ToggleRight } from "lucide-react";
import { toast } from "sonner";

export default function EngineStatus() {
  const utils = trpc.useUtils();
  const { data: stats } = trpc.engine.stats.useQuery();
  const { data: sources } = trpc.engine.allSources.useQuery();

  const triggerScrape = trpc.engine.triggerScrape.useMutation({
    onSuccess: (r) => { toast.success(`抓取完成：${r.insightsCreated} 条新情报`); utils.engine.stats.invalidate(); },
    onError: (e) => toast.error(e.message),
  });
  const triggerAll = trpc.engine.triggerAll.useMutation({
    onSuccess: (r) => { toast.success(`全量运行完成：${r.scrape.insightsCreated} 条情报`); utils.engine.stats.invalidate(); },
    onError: (e) => toast.error(e.message),
  });
  const startSch = trpc.engine.startScheduler.useMutation({
    onSuccess: () => { toast.success("调度器已启动"); utils.engine.stats.invalidate(); },
  });
  const stopSch = trpc.engine.stopScheduler.useMutation({
    onSuccess: () => { toast.success("调度器已停止"); utils.engine.stats.invalidate(); },
  });
  const toggleSrc = trpc.engine.toggleSource.useMutation({
    onSuccess: () => { utils.engine.allSources.invalidate(); utils.engine.stats.invalidate(); },
  });
  const deleteSrc = trpc.engine.deleteSource.useMutation({
    onSuccess: () => { toast.success("已删除"); utils.engine.allSources.invalidate(); },
  });
  const testUrl = trpc.engine.testUrl.useMutation();

  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState("");
  const [newUrl, setNewUrl] = useState("");
  const [newSection, setNewSection] = useState<"tcg" | "web3" | "collector">("web3");
  const addSrc = trpc.engine.addSource.useMutation({
    onSuccess: () => { toast.success("已添加"); setShowAdd(false); setNewName(""); setNewUrl(""); utils.engine.allSources.invalidate(); },
  });

  const running = triggerScrape.isPending || triggerAll.isPending;

  return (
    <div className="min-h-screen">
      <TopNav />
      <main className="container py-8">
        <h1 className="text-xl font-bold text-neutral-950 mb-1">引擎状态</h1>
        <p className="text-xs text-black/38 mb-6">调度器控制 · 数据源管理 · 运行日志</p>

        {/* Scheduler Controls */}
        <div className="glass-panel p-5 mb-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex-1 min-w-[200px]">
              <div className="micro-label mb-1">调度器状态</div>
              <div className="flex items-center gap-2">
                <span className={`h-2.5 w-2.5 rounded-full ${stats?.scheduler?.running ? "bg-green-500 animate-pulse" : "bg-black/15"}`} />
                <span className="text-sm font-semibold text-neutral-950">{stats?.scheduler?.running ? "运行中" : "已停止"}</span>
              </div>
              {stats?.scheduler?.lastRunTime && (
                <p className="text-[11px] text-black/30 mt-1">上次运行: {new Date(stats.scheduler.lastRunTime).toLocaleString("zh-CN")}</p>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {stats?.scheduler?.running ? (
                <button onClick={() => stopSch.mutate()} className="flex items-center gap-1.5 rounded-full bg-red-50 border border-red-200 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-100 transition">
                  <Square className="h-3.5 w-3.5" /> 停止调度器
                </button>
              ) : (
                <button onClick={() => startSch.mutate()} className="flex items-center gap-1.5 rounded-full bg-green-50 border border-green-200 px-4 py-2 text-sm font-medium text-green-700 hover:bg-green-100 transition">
                  <Play className="h-3.5 w-3.5" /> 启动调度器
                </button>
              )}
              <button onClick={() => triggerScrape.mutate()} disabled={running} className="flex items-center gap-1.5 rounded-full bg-neutral-950 px-4 py-2 text-sm font-medium text-white hover:bg-black transition disabled:opacity-50">
                {running ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Zap className="h-3.5 w-3.5" />} 立即抓取
              </button>
              <button onClick={() => triggerAll.mutate()} disabled={running} className="flex items-center gap-1.5 rounded-full border border-black/12 bg-white/70 px-4 py-2 text-sm font-medium text-neutral-950 hover:bg-white transition disabled:opacity-50">
                {running ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Zap className="h-3.5 w-3.5" />} 全量运行
              </button>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {[
            { label: "情报总数", value: stats?.totalInsights ?? 0 },
            { label: "预警数", value: stats?.totalAlerts ?? 0 },
            { label: "数据源", value: stats?.totalSources ?? 0 },
            { label: "已启用", value: stats?.totalEnabledSources ?? 0 },
          ].map((s) => (
            <div key={s.label} className="stat-card">
              <div className="micro-label">{s.label}</div>
              <div className="text-xl font-bold text-neutral-950 mt-1">{s.value}</div>
            </div>
          ))}
        </div>

        {/* Recent Runs */}
        <div className="glass-panel p-5 mb-6">
          <div className="micro-label mb-3">最近运行日志</div>
          {stats?.recentRuns?.length ? (
            <div className="space-y-2">
              {stats.recentRuns.map((run: any) => (
                <div key={run.id} className="flex items-center gap-3 text-sm">
                  {run.status === "success" ? <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" /> : run.status === "error" ? <XCircle className="h-4 w-4 text-red-500 flex-shrink-0" /> : <Loader2 className="h-4 w-4 text-blue-500 animate-spin flex-shrink-0" />}
                  <span className="text-neutral-950 font-medium">{run.status}</span>
                  <span className="text-black/30 text-xs">{new Date(run.startedAt).toLocaleString("zh-CN")}</span>
                  <span className="text-black/30 text-xs">+{run.insightsCreated ?? 0} 情报 / +{run.alertsCreated ?? 0} 预警</span>
                  {run.errorMessage && <span className="text-red-500 text-xs truncate max-w-[200px]">{run.errorMessage}</span>}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-black/30">暂无运行记录</p>
          )}
        </div>

        {/* Data Sources */}
        <div className="glass-panel p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="micro-label">数据源管理</div>
            <button onClick={() => setShowAdd(!showAdd)} className="flex items-center gap-1 rounded-full bg-neutral-950 px-3 py-1.5 text-xs font-medium text-white hover:bg-black transition">
              <Plus className="h-3 w-3" /> 添加
            </button>
          </div>

          {showAdd && (
            <div className="border border-black/8 rounded-xl p-4 mb-4 bg-white/50 space-y-3">
              <input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="名称" className="w-full rounded-lg border border-black/8 bg-white/70 px-3 py-2 text-sm" />
              <input value={newUrl} onChange={(e) => setNewUrl(e.target.value)} placeholder="RSS URL" className="w-full rounded-lg border border-black/8 bg-white/70 px-3 py-2 text-sm" />
              <select value={newSection} onChange={(e) => setNewSection(e.target.value as any)} className="rounded-lg border border-black/8 bg-white/70 px-3 py-2 text-sm">
                <option value="tcg">TCG</option>
                <option value="web3">Crypto</option>
                <option value="collector">收藏</option>
              </select>
              <div className="flex gap-2">
                <button onClick={() => addSrc.mutate({ name: newName, url: newUrl, section: newSection })} disabled={!newName || !newUrl} className="rounded-full bg-neutral-950 px-4 py-1.5 text-xs font-medium text-white disabled:opacity-50">保存</button>
                <button onClick={() => setShowAdd(false)} className="rounded-full border border-black/8 px-4 py-1.5 text-xs font-medium text-black/50">取消</button>
              </div>
            </div>
          )}

          <div className="space-y-2">
            {sources?.map((src: any) => (
              <div key={src.id} className="flex items-center gap-3 p-3 rounded-xl border border-black/6 bg-white/40">
                <button
                  onClick={() => toggleSrc.mutate({ sourceId: src.id, enabled: !src.enabled })}
                  className="flex-shrink-0"
                  title={src.enabled ? "点击禁用" : "点击启用"}
                >
                  {src.enabled ? <ToggleRight className="h-5 w-5 text-green-500" /> : <ToggleLeft className="h-5 w-5 text-black/20" />}
                </button>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-neutral-950 truncate">{src.name}</div>
                  <div className="text-[11px] text-black/30 truncate">{src.url}</div>
                </div>
                <span className="chip">{src.section === "web3" ? "Crypto" : src.section === "tcg" ? "TCG" : src.section === "collector" ? "收藏" : src.section}</span>
                <button
                  onClick={() => testUrl.mutate({ url: src.url })}
                  className="p-1.5 rounded-full hover:bg-black/5 transition"
                  title="测试连通性"
                >
                  {testUrl.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin text-black/30" /> : testUrl.data?.ok ? <Wifi className="h-3.5 w-3.5 text-green-500" /> : <WifiOff className="h-3.5 w-3.5 text-black/25" />}
                </button>
                <button onClick={() => deleteSrc.mutate({ sourceId: src.id })} className="p-1.5 rounded-full hover:bg-red-50 transition" title="删除">
                  <Trash2 className="h-3.5 w-3.5 text-red-400" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
