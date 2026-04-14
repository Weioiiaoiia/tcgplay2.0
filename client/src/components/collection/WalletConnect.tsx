import { useState } from 'react';
import { motion } from 'framer-motion';
import { useWallet } from '@/contexts/WalletContext';
import { Wallet, Loader2, AlertCircle } from 'lucide-react';

export default function WalletConnect() {
  const { connectWallet, loading, error } = useWallet();
  const [inputAddr, setInputAddr] = useState('');

  const handleConnect = async () => {
    const addr = inputAddr.trim();
    if (!addr) return;
    await connectWallet(addr);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleConnect();
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      {/* Background subtle gradient */}
      <div className="fixed inset-0 pointer-events-none">
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] sm:w-[600px] h-[400px] sm:h-[600px] rounded-full opacity-[0.03]"
          style={{
            background: 'radial-gradient(circle, oklch(0.85 0.15 85), transparent 70%)',
          }}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="relative w-full max-w-md"
      >
        {/* Glass card */}
        <div
          className="rounded-2xl p-6 sm:p-8 border border-white/[0.08]"
          style={{
            background: 'oklch(0.11 0.005 260 / 0.9)',
            backdropFilter: 'blur(40px)',
            boxShadow: '0 25px 80px -20px rgba(0,0,0,0.6)',
          }}
        >
          {/* Icon */}
          <div className="flex justify-center mb-5 sm:mb-6">
            <div
              className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl flex items-center justify-center border border-white/[0.08]"
              style={{
                background: 'linear-gradient(135deg, oklch(0.85 0.15 85 / 0.15), oklch(0.85 0.15 85 / 0.05))',
              }}
            >
              <Wallet className="w-5 h-5 sm:w-6 sm:h-6" style={{ color: 'oklch(0.85 0.15 85)' }} />
            </div>
          </div>

          {/* Title */}
          <h2 className="text-lg sm:text-xl font-bold text-center text-white/90 mb-1.5 sm:mb-2">
            链接 Renaiss 钱包
          </h2>
          <p className="text-[12px] sm:text-[13px] text-white/40 text-center mb-6 sm:mb-8">
            输入你的 Renaiss 内置钱包地址，即可查看链上卡牌收藏
          </p>

          {/* Input */}
          <div className="space-y-3 sm:space-y-4">
            <input
              type="text"
              value={inputAddr}
              onChange={(e) => setInputAddr(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="0x..."
              className="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl text-[13px] sm:text-[14px] font-mono text-white/90 placeholder:text-white/20 border border-white/[0.08] focus:border-[oklch(0.85_0.15_85/0.4)] focus:outline-none transition-all duration-300"
              style={{
                background: 'oklch(0.08 0.005 260 / 0.8)',
              }}
              disabled={loading}
            />

            {/* Error */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/20"
              >
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                <span className="text-[11px] sm:text-[12px] text-red-400">{error}</span>
              </motion.div>
            )}

            {/* Button */}
            <button
              onClick={handleConnect}
              disabled={loading || !inputAddr.trim()}
              className="w-full py-2.5 sm:py-3 rounded-xl text-[13px] sm:text-[14px] font-semibold transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              style={{
                background: loading
                  ? 'oklch(0.65 0.12 85)'
                  : 'linear-gradient(135deg, oklch(0.85 0.15 85), oklch(0.75 0.13 85))',
                color: 'oklch(0.1 0.005 260)',
              }}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  正在获取链上数据...
                </>
              ) : (
                '链接钱包'
              )}
            </button>
          </div>

          {/* Footer note */}
          <p className="text-[10px] sm:text-[11px] text-white/20 text-center mt-5 sm:mt-6">
            仅支持 Renaiss 平台内置钱包地址
          </p>
        </div>
      </motion.div>
    </div>
  );
}
