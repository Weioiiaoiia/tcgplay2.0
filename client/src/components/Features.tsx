/*
 * TCGPlay Features — 11 modules, pure text, no icons
 * Clean bento grid with typography-only design
 */
import { motion } from "framer-motion";
import { toast } from "sonner";
import { useLocation } from "wouter";

const features = [
  {
    title: "卡库系统",
    en: "My Collection",
    desc: "绑定 Renaiss 钱包，秒级同步所有链上卡牌资产。统一管理、智能分类、一键检索，你的数字收藏从此井然有序。",
    size: "large",
    route: "/my-collection",
  },
  {
    title: "展览厅",
    en: "Gallery",
    desc: "沉浸式 3D 虚拟展示空间。环境光影随卡牌稀有度动态变化，打造博物馆级的个人收藏展览体验。",
    size: "normal",
  },
  {
    title: "卡牌编年史",
    en: "Card Chronicle",
    desc: "AI 驱动的卡牌传记引擎。将链上流转数据转化为史诗级叙事，每位持有者可铸造不可篡改的传承寄语。",
    size: "normal",
  },
  {
    title: "市场图鉴",
    en: "Market Index",
    desc: "实时聚合 Renaiss 平台全部在售卡牌。智能搜索、多维筛选，让你第一时间捕捉市场动态与稀有机会。",
    size: "large",
  },
  {
    title: "卡牌星图",
    en: "Card Constellation",
    desc: "算法解析卡牌隐藏属性关联，在数字星空中绘制引力线。发现你收藏体系中从未察觉的深层联系。",
    size: "normal",
  },
  {
    title: "收藏家 DNA",
    en: "Collector DNA",
    desc: "深度分析交易行为与持有偏好，生成独一无二的收藏家基因图谱与人格原型——你是猎手、守护者还是冒险家？",
    size: "normal",
  },
  {
    title: "卡牌图集",
    en: "Card Album",
    desc: "选择 3-9 张卡牌一键生成艺术级组合照。支持跨钱包混搭合影，梦幻光影与精美相框打造收藏艺术品。",
    size: "normal",
  },
  {
    title: "智能钱包",
    en: "Smart Wallet",
    desc: "Privy 驱动的无缝登录体验。支持 Google、邮箱、Twitter 一键授权，自动生成非托管嵌入式钱包，兼容 MetaMask。",
    size: "normal",
  },
  {
    title: "多语言生态",
    en: "Global Reach",
    desc: "中、英、日、韩四语实时切换。所有界面文本、系统提示与社区内容均无缝适配，连接全球收藏家社区。",
    size: "normal",
  },
  {
    title: "生涯总结",
    en: "Career Summary",
    desc: "个性化的卡牌交易生涯报告。最值得的入手、最痛的卖飞、最久的持有——配幽默文案与精美数据可视化。",
    size: "normal",
  },
  {
    title: "合规引擎",
    en: "Compliance Engine",
    desc: "100% 链上实时引用，零图片存储。内置版权合规防火墙与快速侵权响应机制，确保平台在法律框架内绝对安全。",
    size: "large",
  },
];

function FeatureCard({ f, i }: { f: (typeof features)[0]; i: number }) {
  const isLarge = f.size === "large";
  const [, setLocation] = useLocation();

  const handleClick = () => {
    if (f.route) {
      setLocation(f.route);
    } else {
      toast(f.title, { description: "功能即将上线" });
    }
  };

  return (
    <motion.button
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-30px" }}
      transition={{ duration: 0.45, delay: i * 0.04 }}
      onClick={handleClick}
      className={`group relative text-left overflow-hidden rounded-2xl border border-white/[0.05] hover:border-white/[0.1] transition-all duration-500 ${
        isLarge ? "sm:col-span-2 p-8 sm:p-10" : "p-6 sm:p-8"
      }`}
    >
      {/* Subtle hover background */}
      <div className="absolute inset-0 bg-white/[0.01] group-hover:bg-white/[0.025] transition-colors duration-500" />

      {/* Content — pure text */}
      <div className="relative z-10">
        {/* Number index */}
        <span className="text-[11px] font-mono text-white/10 tracking-wider mb-4 block">
          {String(i + 1).padStart(2, "0")}
        </span>

        {/* Title row */}
        <div className="flex items-baseline gap-3 mb-3">
          <h3 className={`font-semibold text-white/85 group-hover:text-white transition-colors duration-300 ${isLarge ? "text-[20px]" : "text-[16px]"}`}>
            {f.title}
          </h3>
          <span className="text-[11px] text-white/15 tracking-wide">{f.en}</span>
          {f.route && (
            <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-400/10 text-emerald-400/60 border border-emerald-400/15 font-medium">
              LIVE
            </span>
          )}
        </div>

        {/* Thin separator */}
        <div className="w-8 h-px bg-white/[0.08] group-hover:w-12 group-hover:bg-white/[0.15] transition-all duration-500 mb-4" />

        {/* Description */}
        <p className={`text-white/30 group-hover:text-white/45 leading-[1.8] transition-colors duration-500 ${isLarge ? "text-[14px] max-w-xl" : "text-[13px]"}`}>
          {f.desc}
        </p>
      </div>
    </motion.button>
  );
}

export default function Features() {
  return (
    <section id="features" className="py-28">
      <div className="container">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-16"
        >
          <p className="text-[13px] tracking-[0.15em] uppercase text-white/25 mb-3">
            Platform Features
          </p>
          <h2 className="text-[clamp(1.75rem,4vw,3rem)] font-bold tracking-tight text-white leading-tight">
            为收藏家而生的<br />
            <span className="text-white/35">11 项核心能力</span>
          </h2>
          <p className="mt-5 text-[16px] text-white/30 max-w-xl">
            从链上数据聚合到 AI 叙事引擎，从 3D 展览空间到收藏家人格解码。
            每一项功能都是市场首创。
          </p>
        </motion.div>

        {/* Bento grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((f, i) => (
            <FeatureCard key={f.en} f={f} i={i} />
          ))}
        </div>

        {/* Bottom note */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="mt-10 text-center"
        >
          <p className="text-[12px] text-white/15">
            所有功能均基于 Renaiss 链上公开数据，遵循严格的知识产权合规标准
          </p>
        </motion.div>
      </div>
    </section>
  );
}
