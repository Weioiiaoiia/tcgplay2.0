import { ShieldCheck } from "lucide-react";
import { useMemo, useState } from "react";

type LegalDialogKey = "privacy" | "terms" | "ip" | null;

export default function Footer() {
  const [activeDialog, setActiveDialog] = useState<LegalDialogKey>(null);

  const dialogContent = useMemo(() => {
    if (!activeDialog) return null;

    return {
      privacy: {
        title: "隐私说明",
        paragraphs: [
          "本项目仅在页面层面展示公开可访问的情报标题、摘要、来源与发布时间，用于帮助用户快速发现卡牌与加密市场中的重要信息。",
          "页面默认不会要求用户提交个人敏感信息，若未来接入登录、订阅或收藏能力，将在相应功能中单独提示所需信息与用途。",
          "抓取过程中会优先使用健康且安全的 HTTPS 来源，并对危险链接、异常跳转或高风险地址进行过滤，降低浏览风险。",
          "若第三方来源变更其数据策略、访问策略或版权要求，本项目会以来源方规则为优先，并在必要时调整展示方式。",
          "继续使用本页面，即表示你理解本项目的主要用途是情报整理与辅助浏览，而非替代原始站点或原始信息发布主体。"
        ]
      },
      terms: {
        title: "使用条款",
        paragraphs: [
          "本页面提供的内容主要来自公开新闻源、公开资讯页与可安全访问的数据接口，内容仅供研究、观察和信息参考。",
          "我们不保证所有第三方内容持续可用，也不对第三方页面更新延迟、字段变更或临时不可访问承担责任。",
          "用户在阅读情报后，如需进行进一步交易、下单、收藏或投资决策，应回到原始来源自行核验。",
          "页面中展示的统计数字、最新时间与来源数量会随抓取结果动态变化，因此应被视为实时快照，而不是永久固定结论。",
          "若发现来源异常、链接失效或展示错误，可以后续继续调整规则，但在任何情况下都应以来源原文与原站为最终依据。"
        ]
      },
      ip: {
        title: "知识产权说明",
        paragraphs: [
          "本项目不主张第三方新闻标题、品牌名称、商标、卡牌名称及相关标识的所有权，这些权利归原始权利人或对应发布主体所有。",
          "页面目标是聚合与整理公开信息，而不是复制、分发或售卖受保护的原始内容资源。",
          "若页面中存在对第三方名称、来源或公开资料的引用，其目的仅限于信息标注、来源识别与索引导航。",
          "如果权利方认为某些展示方式需要调整，可以在后续版本中进一步优化来源呈现、摘要长度或跳转方式。",
          "本说明旨在清晰界定页面的展示边界，使情报工具在可读性、可用性与合规表达之间保持平衡。"
        ]
      }
    }[activeDialog];
  }, [activeDialog]);

  return (
    <>
      <footer className="border-t border-black/8 bg-[linear-gradient(180deg,rgba(248,246,241,0.96),rgba(241,236,226,0.92))]">
        <div className="container pb-10 pt-12 sm:pb-12">
          <div className="mx-auto max-w-4xl rounded-[2rem] border border-black/8 bg-white/74 p-6 shadow-[0_30px_90px_-48px_rgba(24,24,27,0.3)] backdrop-blur-xl sm:p-8">
            <div className="mb-5 flex items-center justify-center gap-2.5">
              <ShieldCheck className="h-4 w-4 text-black/42" />
              <p className="text-[0.68rem] uppercase tracking-[0.28em] text-black/36">使用与来源说明</p>
            </div>
            <p className="text-center text-[0.92rem] leading-8 text-black/52">
              本站聚合公开可访问的卡牌与加密情报，重点提供更清晰的浏览路径、中文筛选体验与安全链接跳转，不构成投资、交易或版权替代服务。
            </p>
            <p className="mt-4 text-center text-xs leading-6 text-black/34">
              所有第三方标题、品牌、商标与原始内容权利归各自权利方所有；如需最终判断，请以前往原始来源核验为准。
            </p>
          </div>
        </div>

        <div className="border-t border-black/8">
          <div className="container flex flex-col items-center justify-between gap-4 py-5 sm:flex-row">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full border border-black/8 bg-white text-[0.7rem] font-semibold text-neutral-950">
                T
              </div>
              <p className="text-sm text-black/46">TCGPlay 情报系统</p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-5">
              <button type="button" onClick={() => setActiveDialog("privacy")} className="text-sm text-black/42 transition hover:text-black">
                隐私说明
              </button>
              <button type="button" onClick={() => setActiveDialog("terms")} className="text-sm text-black/42 transition hover:text-black">
                使用条款
              </button>
              <button type="button" onClick={() => setActiveDialog("ip")} className="text-sm text-black/42 transition hover:text-black">
                知识产权
              </button>
              <a href="/intel" className="text-sm text-black/42 transition hover:text-black">
                情报引擎
              </a>
            </div>
          </div>
        </div>
      </footer>

      {activeDialog && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/18 p-4 backdrop-blur-sm" onClick={() => setActiveDialog(null)}>
          <div
            className="max-h-[70vh] w-full max-w-3xl overflow-y-auto rounded-[2rem] border border-black/8 bg-[#f7f4ee] p-6 text-neutral-950 shadow-[0_40px_120px_-44px_rgba(24,24,27,0.42)] sm:p-8"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4">
              <h3 className="text-xl font-semibold tracking-[0.01em] text-neutral-950 sm:text-2xl">{dialogContent?.title}</h3>
              <button
                type="button"
                onClick={() => setActiveDialog(null)}
                className="rounded-full border border-black/8 bg-white/80 px-3 py-1 text-sm text-black/52 transition hover:text-black"
              >
                关闭
              </button>
            </div>
            <div className="mt-6 space-y-4 pr-1">
              {dialogContent?.paragraphs.map((paragraph, index) => (
                <p key={index} className="text-sm leading-8 text-black/58">
                  {paragraph}
                </p>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
