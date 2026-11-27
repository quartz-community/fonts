import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import type { BuildCtx } from "@quartz-community/types";
import { FontsEmitter } from "../src/index";
import type { FontsOptions } from "../src/types";
import { SELF_HOSTED_STYLESHEET } from "../src/transformer";

// Google Fonts' CSS as served to a client without a browser user agent (truetype)
const GOOGLE_CSS = `/* latin */
@font-face {
  font-family: 'Inter';
  font-style: normal;
  font-weight: 400;
  src: url(https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfMZg.ttf) format('truetype');
}
@font-face {
  font-family: 'Fira Code';
  font-style: normal;
  font-weight: 400;
  src: url(https://fonts.gstatic.com/s/firacode/v22/uU9eCBsR6Z2vfE9aq3bL0fxyUs4tcw4W_D1sFVc.woff2) format('woff2');
}
`;

describe("FontsEmitter (fontOrigin: selfHosted)", () => {
  let out: string;
  let requested: string[];
  beforeEach(async () => {
    out = await fs.mkdtemp(path.join(os.tmpdir(), "fonts-emit-"));
    requested = [];
    vi.stubGlobal("fetch", async (url: string) => {
      requested.push(url);
      if (url.startsWith("https://fonts.googleapis.com/")) return new Response(GOOGLE_CSS);
      return new Response(new Uint8Array([1, 2, 3, url.length % 256]));
    });
  });
  afterEach(async () => {
    vi.unstubAllGlobals();
    await fs.rm(out, { recursive: true, force: true });
  });

  async function emit(options: Partial<FontsOptions>, configuration: Record<string, unknown> = {}) {
    const ctx = { argv: { output: out }, cfg: { configuration } } as unknown as BuildCtx;
    const files: string[] = [];
    for await (const file of FontsEmitter(options).emit(ctx, [], {
      css: [],
      js: [],
      additionalHead: [],
    }) as AsyncGenerator<string>)
      files.push(file);
    return files;
  }

  it("downloads every font file next to a rewritten stylesheet in static/fonts/", async () => {
    const files = await emit({ fontOrigin: "selfHosted", body: "Inter", code: "Fira Code" });
    const fontsDir = path.join(out, "static", "fonts");
    expect(files).toEqual([
      path.join(fontsDir, "UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfMZg.ttf"),
      path.join(fontsDir, "uU9eCBsR6Z2vfE9aq3bL0fxyUs4tcw4W_D1sFVc.woff2"),
      path.join(fontsDir, "quartz-fonts.css"),
    ]);
    // the stylesheet the transformer links pages to
    expect(files.at(-1)).toBe(path.join(out, SELF_HOSTED_STYLESHEET));
    const css = await fs.readFile(path.join(fontsDir, "quartz-fonts.css"), "utf8");
    expect(css).toContain(
      "src: url(UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfMZg.ttf) format('truetype');",
    );
    expect(css).toContain(
      "src: url(uU9eCBsR6Z2vfE9aq3bL0fxyUs4tcw4W_D1sFVc.woff2) format('woff2');",
    );
    expect(css).not.toContain("gstatic");
    expect([...(await fs.readFile(files[0]!))].slice(0, 3)).toEqual([1, 2, 3]);
  });

  it("requests the configured fonts from Google Fonts", async () => {
    await emit({ fontOrigin: "selfHosted", body: "Inter", code: "Fira Code" });
    const href = decodeURIComponent(requested[0]!);
    expect(href).toMatch(/^https:\/\/fonts\.googleapis\.com\/css2\?/);
    expect(href).toContain("family=Inter");
    expect(href).toContain("family=Fira Code");
    expect(requested).toHaveLength(3);
  });

  it("falls back to configuration.theme.typography", async () => {
    await emit({ fontOrigin: "selfHosted" }, { theme: { typography: { body: "Lora" } } });
    expect(decodeURIComponent(requested[0]!)).toContain("family=Lora");
  });

  it.each([["googleFonts"], ["local"]] as const)(
    "emits and downloads nothing for fontOrigin: %s",
    async (fontOrigin) => {
      expect(await emit({ fontOrigin })).toEqual([]);
      expect(requested).toEqual([]);
    },
  );

  it("emits nothing by default (googleFonts)", async () => {
    expect(await emit({})).toEqual([]);
  });

  it("fails the build with the URL when a download fails", async () => {
    vi.stubGlobal("fetch", async (url: string) =>
      url.startsWith("https://fonts.googleapis.com/")
        ? new Response(GOOGLE_CSS)
        : new Response("", { status: 404, statusText: "Not Found" }),
    );
    await expect(emit({ fontOrigin: "selfHosted" })).rejects.toThrow(
      /Failed to fetch font file: https:\/\/fonts\.gstatic\.com\/.*404 Not Found/,
    );
    vi.stubGlobal("fetch", async () => new Response("", { status: 500, statusText: "Oops" }));
    await expect(emit({ fontOrigin: "selfHosted" })).rejects.toThrow(/Google Fonts CSS: 500 Oops/);
  });
});
