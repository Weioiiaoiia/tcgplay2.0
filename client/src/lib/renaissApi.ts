/**
 * Renaiss Protocol API Service
 * 通过 Renaiss tRPC API 获取真实链上卡牌数据
 */

export interface CardData {
  id: string;
  tokenId: string;
  name: string;
  ownerAddress: string;
  fmvPriceInUSD: string; // cents string e.g. "17200" = $172.00
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

// Parse FMV from cents string to dollar number
export function parseFMV(fmvStr: string): number {
  const cents = parseInt(fmvStr, 10);
  if (isNaN(cents)) return 0;
  return cents / 100;
}

// Get PSA grade number
export function getGradeNumber(grade: string): number {
  const match = grade.match(/^(\d+)/);
  return match ? parseInt(match[1], 10) : 0;
}

// Get PSA cert URL
export function getPSAUrl(serial: string): string {
  const certNum = serial.replace(/^PSA/, '');
  return `https://www.psacard.com/cert/${certNum}`;
}

// Get Renaiss card URL
export function getRenaissUrl(tokenId: string): string {
  return `https://www.renaiss.xyz/card/${tokenId}`;
}
