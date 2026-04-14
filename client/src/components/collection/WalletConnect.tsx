import { useState } from "react";
import { motion } from "framer-motion";
import { Wallet, Loader2, AlertCircle } from "lucide-react";
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
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="fixed inset-0 pointer-events-none">
        <div
          className="absolute top-1/2 left-1/2 h-[400px] w-[400px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-[0.03] sm:h-[600px] sm:w-[600px]"
          style={{
            background: "radial-gradient(circle, oklch(0.85 0.15 85), transparent 70%)",
          }}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="relative w-full max-w-md"
      >
        <div
          className="rounded-2xl border border-white/[0.08] p-6 sm:p-8"
          style={{
            background: "oklch(0.11 0.005 260 / 0.9)",
            backdropFilter: "blur(40px)",
            boxShadow: "0 25px 80px -20px rgba(0,0,0,0.6)",
          }}
        >
          <div className="mb-5 flex justify-center sm:mb-6">
            <div
              className="flex h-12 w-12 items-center justify-center rounded-xl border border-white/[0.08] sm:h-14 sm:w-14"
              style={{
                background: "linear-gradient(135deg, oklch(0.85 0.15 85 / 0.15), oklch(0.85 0.15 85 / 0.05))",
              }}
            >
              <Wallet className="h-5 w-5 sm:h-6 sm:w-6" style={{ color: "oklch(0.85 0.15 85)" }} />
            </div>
          </div>

          <h2 className="mb-1.5 text-center text-lg font-bold text-white/90 sm:mb-2 sm:text-xl">
            {t("collection.wallet.title")}
          </h2>
          <p className="mb-6 text-center text-[12px] text-white/40 sm:mb-8 sm:text-[13px]">
            {t("collection.wallet.description")}
          </p>

          <div className="space-y-3 sm:space-y-4">
            <input
              type="text"
              value={inputAddr}
              onChange={(event) => setInputAddr(event.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="0x..."
              className="w-full rounded-xl border border-white/[0.08] px-3 py-2.5 text-[13px] font-mono text-white/90 placeholder:text-white/20 transition-all duration-300 focus:border-[oklch(0.85_0.15_85/0.4)] focus:outline-none sm:px-4 sm:py-3 sm:text-[14px]"
              style={{ background: "oklch(0.08 0.005 260 / 0.8)" }}
              disabled={loading}
            />

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2"
              >
                <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
                <span className="text-[11px] text-red-400 sm:text-[12px]">{error}</span>
              </motion.div>
            )}

            <button
              onClick={() => void handleConnect()}
              disabled={loading || !inputAddr.trim()}
              className="flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-[13px] font-semibold transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-40 sm:py-3 sm:text-[14px]"
              style={{
                background: loading
                  ? "oklch(0.65 0.12 85)"
                  : "linear-gradient(135deg, oklch(0.85 0.15 85), oklch(0.75 0.13 85))",
                color: "oklch(0.1 0.005 260)",
              }}
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {t("collection.wallet.loading")}
                </>
              ) : (
                t("collection.wallet.connect")
              )}
            </button>
          </div>

          <p className="mt-5 text-center text-[10px] text-white/20 sm:mt-6 sm:text-[11px]">
            {t("collection.wallet.note")}
          </p>
        </div>
      </motion.div>
    </div>
  );
}
