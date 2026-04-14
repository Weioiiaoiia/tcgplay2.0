/*
 * TCGPlay Footer — Rich, premium, alive
 * Renaiss connection status + Legal disclaimer + Brand bar
 */
import { ShieldCheck, ExternalLink } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-white/[0.05]">
      {/* Renaiss connection status */}
      <div className="container py-12">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 p-6 rounded-2xl bg-white/[0.015] border border-white/[0.05]">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-10 h-10 rounded-xl bg-emerald-400/[0.06] border border-emerald-400/[0.1] flex items-center justify-center">
                <span className="text-[14px] font-bold text-emerald-400/70">R</span>
              </div>
              <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-[oklch(0.07_0.005_260)] animate-pulse" />
            </div>
            <div>
              <h4 className="text-[14px] font-semibold text-white/70">Renaiss Protocol</h4>
              <p className="text-[12px] text-white/25 mt-0.5">BNB Chain · 实时数据同步中</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-[11px] text-white/20">延迟</p>
              <p className="text-[13px] text-emerald-400/60 font-mono">~120ms</p>
            </div>
            <div className="w-px h-8 bg-white/[0.06] hidden sm:block" />
            <div className="text-right hidden sm:block">
              <p className="text-[11px] text-white/20">区块高度</p>
              <p className="text-[13px] text-white/40 font-mono">#48,291,037</p>
            </div>
            <a href="#" onClick={(e) => e.preventDefault()} className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-white/[0.04] border border-white/[0.06] text-[12px] text-white/40 hover:bg-white/[0.07] hover:text-white/60 transition-all">
              <ExternalLink className="w-3 h-3" />
              查看协议
            </a>
          </div>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="container pb-12">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center justify-center gap-2.5 mb-5">
            <ShieldCheck className="w-4 h-4 text-white/20" />
            <p className="text-[11px] tracking-[0.15em] uppercase text-white/20">
              Legal Disclaimer
            </p>
          </div>
          <div className="p-6 rounded-2xl bg-white/[0.015] border border-white/[0.04]">
            <p className="text-[12px] text-white/25 leading-[1.9] text-center">
              TCGPlay 是一个独立的第三方卡牌信息聚合展示平台，与任何卡牌游戏发行商、IP 持有者无任何关联或合作关系。
              本平台展示的所有卡牌图片、名称及相关信息仅用于信息展示目的，所有图片均通过协议方公开链接实时引用，TCGPlay 不存储、不托管、不生成任何受版权保护的图像。
              所有卡牌游戏品牌及其相关知识产权均归各自权利人所有。
              本平台不生产、销售或分发任何实体或数字卡牌产品，亦不对任何交易行为承担责任。
              如有任何知识产权方面的疑虑，请通过官方渠道与我们联系，我们将立即响应并处理。
            </p>
          </div>
          <p className="text-[10px] text-white/12 text-center mt-3">
            All trademarks, logos, and brand names are the property of their respective owners. Use of these names does not imply endorsement.
          </p>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/[0.04]">
        <div className="container py-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-5 h-5 rounded-md bg-gradient-to-br from-white/15 to-white/[0.04] border border-white/[0.08] flex items-center justify-center">
              <span className="text-[8px] font-bold text-white/70">T</span>
            </div>
            <p className="text-[12px] text-white/20">
              &copy; 2026 TCGPlay. All rights reserved.
            </p>
          </div>
          <div className="flex items-center gap-6">
            <span className="text-[12px] text-white/15 hover:text-white/30 transition-colors cursor-pointer">隐私政策</span>
            <span className="text-[12px] text-white/15 hover:text-white/30 transition-colors cursor-pointer">使用条款</span>
            <span className="text-[12px] text-white/15 hover:text-white/30 transition-colors cursor-pointer">知识产权声明</span>
            <span className="text-[12px] text-white/15 hover:text-white/30 transition-colors cursor-pointer">联系我们</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
