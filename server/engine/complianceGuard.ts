/**
 * ComplianceGuard — 合规守卫
 * 所有对外展示内容经过二次合规过滤，自动附加 DISCLAIMER
 */

export const DISCLAIMER =
  "This is an AI-generated synthesis for informational purposes only. " +
  "TCGPlay / IntelFeed is not affiliated with any original content creator or rights holder. " +
  "All trademarks belong to their respective owners. No copyrighted images are stored or distributed.";

const BLOCKED_PATTERNS = [
  /official\s+card\s+image/i,
  /©\s*\d{4}/i,
  /all\s+rights\s+reserved/i,
  /copyrighted?\s+material/i,
  /rulebook\s+(text|excerpt|page)/i,
  /scan\s+of\s+(the\s+)?card/i,
  /full\s+art(work)?\s+reprint/i,
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
