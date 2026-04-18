import { describe, expect, it } from "vitest";
import { applyComplianceGuard, generateImageCode, DISCLAIMER } from "./engine/complianceGuard";

describe("ComplianceGuard", () => {
  it("sanitizes blocked patterns", () => {
    const result = applyComplianceGuard({
      title: "Official card image leak",
      summary: "This contains © 2024 copyrighted material and all rights reserved text",
    });
    expect(result.title).toContain("[已过滤]");
    expect(result.summary).toContain("[已过滤]");
    expect(result.compliant).toBe(true);
    expect(result.disclaimer).toBe(DISCLAIMER);
  });

  it("passes clean content through", () => {
    const result = applyComplianceGuard({
      title: "宝可梦 TCG 新卡组分析",
      summary: "超梦 ex 在最近赛事中表现出色",
    });
    expect(result.title).toBe("宝可梦 TCG 新卡组分析");
    expect(result.summary).toBe("超梦 ex 在最近赛事中表现出色");
    expect(result.disclaimer).toBe(DISCLAIMER);
  });
});

describe("ImageCode", () => {
  it("generates a 12-char code starting with IC", () => {
    const code = generateImageCode("test-seed-123");
    expect(code).toMatch(/^IC[A-Z0-9]{10}$/);
    expect(code.length).toBe(12);
  });

  it("generates different codes for different seeds", () => {
    const a = generateImageCode("seed-a");
    const b = generateImageCode("seed-b");
    expect(a).not.toBe(b);
  });
});
