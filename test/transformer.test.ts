import { describe, expect, it, beforeEach, afterEach } from "vitest";
import type { BuildCtx } from "@quartz-community/types";
import { QuartzFonts } from "../src/transformer";
import { OBSIDIAN_SANS_STACK, OBSIDIAN_MONO_STACK } from "../src/defaults";

const REGISTRY_KEY = "__quartzFonts";
const mockCtx = {} as BuildCtx;

function setRegistry(data: Record<string, unknown>) {
  (globalThis as Record<string, unknown>)[REGISTRY_KEY] = data;
}

function clearRegistry() {
  delete (globalThis as Record<string, unknown>)[REGISTRY_KEY];
}

function getCSSContent(plugin: ReturnType<typeof QuartzFonts>): string {
  const resources = plugin.externalResources!(mockCtx);
  return (resources?.css ?? []).map((r) => ("content" in r ? r.content : "")).join("\n");
}

describe("QuartzFonts", () => {
  afterEach(() => {
    clearRegistry();
  });

  describe("standalone (no QuartzTheme)", () => {
    it("uses Obsidian defaults when no options provided", () => {
      const css = getCSSContent(QuartzFonts());

      expect(css).toContain(`--bodyFont: ${OBSIDIAN_SANS_STACK}`);
      expect(css).toContain(`--codeFont: ${OBSIDIAN_MONO_STACK}`);
      expect(css).toContain(`--headerFont: ${OBSIDIAN_SANS_STACK}`);
    });

    it("applies user-provided body font", () => {
      const css = getCSSContent(QuartzFonts({ body: '"Inter", sans-serif' }));

      expect(css).toContain('--bodyFont: "Inter", sans-serif');
      expect(css).toContain('--font-text: "Inter", sans-serif');
    });

    it("applies user-provided header font to all headings", () => {
      const css = getCSSContent(QuartzFonts({ header: '"Playfair Display", serif' }));

      expect(css).toContain('--h1-font: "Playfair Display", serif');
      expect(css).toContain('--h6-font: "Playfair Display", serif');
    });

    it("applies per-heading overrides", () => {
      const css = getCSSContent(
        QuartzFonts({
          header: '"Lora", serif',
          h1: '"Playfair Display", serif',
          h3: '"Inter", sans-serif',
        }),
      );

      expect(css).toContain('--h1-font: "Playfair Display", serif');
      expect(css).toContain('--h2-font: "Lora", serif');
      expect(css).toContain('--h3-font: "Inter", sans-serif');
    });

    it("emits unlayered heading CSS", () => {
      const plugin = QuartzFonts({ header: '"Lora", serif' });
      const resources = plugin.externalResources!(mockCtx);
      const unlayeredCSS = (resources?.css ?? [])
        .map((r) => ("content" in r ? r.content : ""))
        .find((c) => c.includes("h1 { font-family:"));

      expect(unlayeredCSS).toBeDefined();
      expect(unlayeredCSS).toContain('h1 { font-family: "Lora", serif; }');
      expect(unlayeredCSS).not.toContain("@layer");
    });
  });

  describe("with QuartzTheme registry", () => {
    beforeEach(() => {
      setRegistry({
        themeName: "tokyo-night",
        fonts: {
          "--font-text": '"JetBrains Mono", monospace',
          "--font-monospace": '"Fira Code", monospace',
          "--h1-font": '"Custom H1 Font", serif',
        },
      });
    });

    it("reads theme fonts from registry", () => {
      const css = getCSSContent(QuartzFonts());

      expect(css).toContain('--bodyFont: "JetBrains Mono", monospace');
      expect(css).toContain('--codeFont: "Fira Code", monospace');
      expect(css).toContain('--h1-font: "Custom H1 Font", serif');
    });

    it("user options override theme fonts", () => {
      const css = getCSSContent(QuartzFonts({ body: '"Inter", sans-serif' }));

      expect(css).toContain('--bodyFont: "Inter", sans-serif');
      expect(css).toContain('--codeFont: "Fira Code", monospace');
    });

    it("useThemeFonts: false ignores registry", () => {
      const css = getCSSContent(QuartzFonts({ useThemeFonts: false }));

      expect(css).toContain(`--bodyFont: ${OBSIDIAN_SANS_STACK}`);
      expect(css).not.toContain("JetBrains Mono");
    });
  });

  describe("plugin metadata", () => {
    it("has the correct name", () => {
      const plugin = QuartzFonts();
      expect(plugin.name).toBe("QuartzFonts");
    });

    it("textTransform passes through source unchanged", () => {
      const plugin = QuartzFonts();
      const input = "# Hello World\n";
      const result = plugin.textTransform!(mockCtx, input);
      expect(result).toBe(input);
    });
  });
});
