/**
 * ComplianceGuard — 合规守卫
 * 所有对外展示内容经过二次合规过滤，自动附加 DISCLAIMER
 */

export const DISCLAIMER =
  "本页仅提供非官方的文字索引与摘要，供信息参考使用；实际内容请以原始来源页面为准。" +
  " TCGPlay / IntelFeed 与相关内容来源或权利方不存在官方隶属、授权代运营或背书关系。" +
  " All trademarks belong to their respective owners. No copyrighted images, full-text reproductions, or official assets are stored or distributed.";

const BLOCKED_PATTERNS = [
  /official\s+card\s+image/i,
  /©\s*\d{4}/i,
  /all\s+rights\s+reserved/i,
  /copyrighted?\s+material/i,
  /rulebook\s+(text|excerpt|page)/i,
  /scan\s+of\s+(the\s+)?card/i,
  /full\s+art(work)?\s+reprint/i,
  /full\s+text\s+(translation|repost|reproduction)/i,
  /official\s+logo/i,
  /完整译文/g,
  /全文转载/g,
  /原文全文/g,
  /官方海报/g,
  /官方卡图/g,
];

function sanitize(text: string): string {
  let result = text;
  for (const pat of BLOCKED_PATTERNS) {
    result = result.replace(pat, "[已过滤]");
  }
  return result.trim();
}

export function applyComplianceGuard(input: { title: string; summary: string }): {
  title: string;
  summary: string;
  disclaimer: string;
  compliant: boolean;
} {
  const title = sanitize(input.title);
  const summary = sanitize(input.summary);
  return { title, summary, disclaimer: DISCLAIMER, compliant: true };
}

export function generateImageCode(seed: string): string {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = ((hash << 5) - hash + seed.charCodeAt(i)) | 0;
  }
  const hex = Math.abs(hash).toString(16).toUpperCase().padStart(8, "0");
  const ts = Date.now().toString(36).toUpperCase().slice(-4);
  return `IC${hex}${ts}`.slice(0, 12);
}
