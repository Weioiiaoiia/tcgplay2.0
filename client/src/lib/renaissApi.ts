/**
 * Renaiss Marketplace Data Service
 *
 * 通过后端代理从 Renaiss tRPC API 获取全部在售卡牌数据
 * 后端每 30 秒自动刷新缓存，解决跨域限制
 * 数据来源: Renaiss Protocol (BNB Chain)
 */

export interface RenaissCard {
  id: string;
  tokenId: string;
  itemId: string;
  name: string;
  setName: string;
  cardNumber: string;
  pokemonName: string;
  ownerAddress: string;
  askPriceUSDT: number;
  fmvPriceUSD: number;
  frontImageUrl: string;
  grade: string;
  gradingCompany: string;
  year: number;
  serial: string;
  language: string;
  ownerUsername: string;
  category: string;
  premiumRate: number;
  listedAt?: string;
}

// Renaiss 官网图片代理 URL
const RENAISS_IMAGE_BASE = "https://www.renaiss.xyz/_next/image";

export function getRenaissImageUrl(
  originalUrl: string,
  width: number = 640
): string {
  return `${RENAISS_IMAGE_BASE}?url=${encodeURIComponent(originalUrl)}&w=${width}&q=75`;
}

export function getHighResImageUrl(originalUrl: string): string {
  return `${RENAISS_IMAGE_BASE}?url=${encodeURIComponent(originalUrl)}&w=1920&q=90`;
}

// 从后端 API 获取全部卡牌
export async function fetchRenaissCards(): Promise<{
  cards: RenaissCard[];
  total: number;
  lastUpdated: number;
}> {
  const res = await fetch("/api/cards");
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

// 获取单张卡牌详情
export async function fetchCardDetail(
  tokenId: string
): Promise<RenaissCard | null> {
  const res = await fetch(`/api/cards/${tokenId}`);
  if (!res.ok) return null;
  const data = await res.json();
  return data.card || null;
}

// 强制刷新
export async function forceRefresh(): Promise<{
  total: number;
  lastUpdated: number;
}> {
  const res = await fetch("/api/refresh", { method: "POST" });
  return res.json();
}

// 获取服务状态
export async function fetchStatus(): Promise<{
  total: number;
  lastUpdated: number;
  isFetching: boolean;
}> {
  const res = await fetch("/api/status");
  return res.json();
}

// 稀有度等级映射
export function getGradeLevel(grade: string): string {
  if (grade.includes("10")) return "Gem Mint";
  if (grade.includes("9")) return "Mint";
  if (grade.includes("8")) return "NM-MT";
  if (grade.includes("7")) return "NM";
  return grade;
}

export function getGradeColor(grade: string): string {
  if (grade.includes("10")) return "text-amber-400";
  if (grade.includes("9")) return "text-sky-400";
  if (grade.includes("8")) return "text-emerald-400";
  return "text-white/50";
}

export function getGradeBg(grade: string): string {
  if (grade.includes("10")) return "bg-amber-400/10 border-amber-400/20";
  if (grade.includes("9")) return "bg-sky-400/10 border-sky-400/20";
  if (grade.includes("8")) return "bg-emerald-400/10 border-emerald-400/20";
  return "bg-white/5 border-white/10";
}

// Renaiss 官网卡牌 URL
export function getRenaissCardUrl(tokenId: string): string {
  return `https://www.renaiss.xyz/card/${tokenId}`;
}

// PSA 官网 URL
export function getPSAUrl(serial: string): string {
  const certNum = serial.replace("PSA", "");
  return `https://www.psacard.com/cert/${certNum}`;
}

// ============================================================
// Legacy CardData type — used by WalletContext & collection components
// ============================================================

export interface CardData {
  id: string;
  tokenId: string;
  name: string;
  ownerAddress: string;
  fmvPriceInUSD: string;
  frontImageUrl: string;
  backImageUrl: string | null;
  serial: string;
  grade: string;
  year: number;
  setName: string;
  cardNumber: string;
  pokemonName: string;
  language: string;
  gradingCompany: string;
  vaultLocation: string;
  askPriceInUSDT: string;
  type: string;
}

// Parse FMV from cents string to USD number
export function parseFMV(raw: string | number | null | undefined): number {
  if (!raw) return 0;
  const num = parseFloat(String(raw));
  if (num > 1000) return num / 100;
  return num;
}

// Extract numeric grade from grade string
export function getGradeNumber(grade: string): number {
  const match = grade.match(/(\d+)/);
  return match ? parseInt(match[1], 10) : 0;
}

// Renaiss card URL (legacy alias)
export function getRenaissUrl(tokenId: string): string {
  return getRenaissCardUrl(tokenId);
}
