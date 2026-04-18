const PRIVATE_HOST_PATTERNS = [
  /^localhost$/i,
  /^127\./,
  /^10\./,
  /^192\.168\./,
  /^172\.(1[6-9]|2\d|3[0-1])\./,
  /^0\./,
  /^169\.254\./,
  /^::1$/i,
  /^fc/i,
  /^fd/i,
  /^fe80:/i,
];

const BLOCKED_PROTOCOLS = new Set(["javascript:", "data:", "file:", "ftp:", "ws:", "wss:"]);

export interface LinkSafetyResult {
  ok: boolean;
  normalizedUrl?: string;
  reason?: string;
}

function hasPrivateHostname(hostname: string): boolean {
  const lower = hostname.trim().toLowerCase();
  return PRIVATE_HOST_PATTERNS.some((pattern) => pattern.test(lower));
}

export function inspectExternalUrl(rawUrl: string): LinkSafetyResult {
  try {
    const trimmed = rawUrl.trim();
    if (!trimmed) return { ok: false, reason: "链接为空" };

    const url = new URL(trimmed);
    if (BLOCKED_PROTOCOLS.has(url.protocol)) {
      return { ok: false, reason: `禁止的链接协议: ${url.protocol}` };
    }
    if (url.protocol !== "https:") {
      return { ok: false, reason: "仅允许 HTTPS 链接" };
    }
    if (url.username || url.password) {
      return { ok: false, reason: "链接中不允许包含账号或密码" };
    }
    if (!url.hostname) {
      return { ok: false, reason: "缺少主机名" };
    }
    if (hasPrivateHostname(url.hostname)) {
      return { ok: false, reason: "禁止内网、本机或保留地址" };
    }

    url.hash = "";
    return { ok: true, normalizedUrl: url.toString() };
  } catch {
    return { ok: false, reason: "链接格式无效" };
  }
}

export function ensureSafeFeedUrl(rawUrl: string): string {
  const result = inspectExternalUrl(rawUrl);
  if (!result.ok || !result.normalizedUrl) {
    throw new Error(result.reason || "链接不安全");
  }
  return result.normalizedUrl;
}

export function sanitizeOutboundUrl(candidateUrl: string | null | undefined, fallbackUrl: string): string {
  if (candidateUrl) {
    const candidate = inspectExternalUrl(candidateUrl);
    if (candidate.ok && candidate.normalizedUrl) return candidate.normalizedUrl;
  }
  const fallback = inspectExternalUrl(fallbackUrl);
  return fallback.ok && fallback.normalizedUrl ? fallback.normalizedUrl : "";
}
