/**
 * Design note — Fog-white precision exhibition system.
 * This file should present wallet lookup as a quiet concierge interaction:
 * luminous surface, editorial spacing, and restrained motion that supports trust.
 */
import { useState } from "react";
import { motion } from "framer-motion";
import { AlertCircle, ArrowRight, Loader2, Wallet } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useWallet } from "@/contexts/WalletContext";

export default function WalletConnect() {
  const { connectWallet, loading, error } = useWallet();
  const { t } = useTranslation();
  const [inputAddr, setInputAddr] = useState("");

  const handleConnect = async () => {
    const addr = inputAddr.trim();
    if (!addr) return;
    await connectWallet(addr);
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Enter") {
      void handleConnect();
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden px-4 pb-16 pt-28 sm:px-6 sm:pt-32">
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,#f7f4ee_0%,#f1ede5_48%,#f8f6f1_100%)]" />
      <div className="absolute inset-x-0 top-0 -z-10 h-[30rem] bg-[radial-gradient(circle_at_12%_18%,rgba(213,190,143,0.2),transparent_34%),radial-gradient(circle_at_88%_12%,rgba(123,138,159,0.12),transparent_28%),radial-gradient(circle_at_50%_80%,rgba(255,255,255,0.65),transparent_40%)]" />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        className="container"
      >
        <div className="mx-auto grid max-w-6xl gap-5 lg:grid-cols-[1.1fr_0.92fr]">
          <section className="rounded-[2.2rem] border border-black/8 bg-white/74 p-6 shadow-[0_30px_90px_-42px_rgba(24,24,27,0.34)] backdrop-blur-xl sm:p-8 lg:p-10">
            <div className="mb-5 flex items-center gap-3 text-[0.7rem] uppercase tracking-[0.34em] text-black/34">
              <span className="h-px w-10 bg-black/12" />
              Collection / Wallet Address Lookup
            </div>
            <h1 className="max-w-2xl font-serif text-4xl leading-[0.95] text-neutral-950 sm:text-5xl lg:text-6xl">
              输入地址，直接查询藏品
            </h1>
            <p className="mt-5 max-w-xl text-sm leading-7 text-black/48 sm:text-[0.96rem]">
              继续使用地址输入查询，不改成强制钱包连接。
            </p>

            <div className="mt-10 grid gap-3 sm:grid-cols-3">
              {[
                { label: "Lookup Mode", value: "Address input" },
                { label: "Data Source", value: "Renaiss holdings" },
                { label: "Interaction", value: "Cache-first refresh" },
              ].map((item) => (
                <div
                  key={item.label}
                  className="rounded-[1.35rem] border border-black/8 bg-[#f6f2eb] px-4 py-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)]"
                >
                  <div className="text-[0.6rem] uppercase tracking-[0.24em] text-black/28">
                    {item.label}
                  </div>
                  <div className="mt-2 text-sm font-medium text-black/72">{item.value}</div>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-[2.2rem] border border-black/8 bg-white/82 p-6 shadow-[0_34px_100px_-44px_rgba(24,24,27,0.34)] backdrop-blur-xl sm:p-8">
            <div className="mx-auto max-w-xl">
              <div className="flex h-14 w-14 items-center justify-center rounded-[1.25rem] border border-black/8 bg-[linear-gradient(180deg,#fffdfa,#f3eee5)] text-neutral-950 shadow-[0_20px_45px_-26px_rgba(24,24,27,0.24)]">
                <Wallet className="h-6 w-6" />
              </div>

              <h2 className="mt-6 text-2xl font-semibold text-neutral-950 sm:text-[2rem]">
                {t("collection.wallet.title")}
              </h2>
              <p className="mt-3 text-sm leading-7 text-black/46">
                输入有效地址后即可读取对应持仓，并保留缓存恢复能力。
              </p>

              <div className="mt-8 space-y-4">
                <label className="block rounded-[1.4rem] border border-black/8 bg-[#f7f4ee] px-4 py-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.75)]">
                  <div className="text-[0.62rem] uppercase tracking-[0.24em] text-black/30">
                    Wallet Address
                  </div>
                  <input
                    type="text"
                    value={inputAddr}
                    onChange={(event) => setInputAddr(event.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="0x..."
                    className="mt-2 w-full bg-transparent font-mono text-sm text-black/76 outline-none placeholder:text-black/24"
                    disabled={loading}
                  />
                </label>

                {error ? (
                  <motion.div
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-start gap-3 rounded-[1.2rem] border border-red-200 bg-red-50 px-4 py-3 text-red-700"
                  >
                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                    <span className="text-sm leading-6">{error}</span>
                  </motion.div>
                ) : null}

                <button
                  onClick={() => void handleConnect()}
                  disabled={loading || !inputAddr.trim()}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-neutral-950 px-5 py-3.5 text-sm font-medium text-white transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-45"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      {t("collection.wallet.loading")}
                    </>
                  ) : (
                    <>
                      {t("collection.wallet.connect")}
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>
              </div>

              <p className="mt-5 text-xs leading-6 text-black/36">
                支持地址查询、缓存恢复与后续结果刷新。
              </p>
            </div>
          </section>
        </div>
      </motion.div>
    </div>
  );
}
