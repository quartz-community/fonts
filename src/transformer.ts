import type { QuartzTransformerPlugin, CSSResource } from "@quartz-community/types";
import type { QuartzFontsOptions } from "./types";
import { OBSIDIAN_SANS_STACK, OBSIDIAN_MONO_STACK } from "./defaults";
import { readFontRegistry, isQuartzThemeEnabled } from "./util/registry";

const defaultOptions: QuartzFontsOptions = {
  useThemeFonts: true,
};

interface ResolvedFonts {
  body: string;
  header: string;
  code: string;
  interface: string;
  h1: string;
  h2: string;
  h3: string;
  h4: string;
  h5: string;
  h6: string;
}

function resolveFonts(options: QuartzFontsOptions): ResolvedFonts {
  const registry = options.useThemeFonts !== false ? readFontRegistry() : undefined;

  if (options.useThemeFonts !== false && !registry) {
    if (isQuartzThemeEnabled()) {
      console.warn(
        "[QuartzFonts] QuartzTheme is enabled but its font registry is empty. " +
          "Ensure QuartzTheme runs before QuartzFonts (lower defaultOrder number). " +
          "Falling back to Obsidian defaults.",
      );
    }
  }

  const themeFonts = registry?.fonts ?? {};

  const body = options.body ?? themeFonts["--font-text"] ?? OBSIDIAN_SANS_STACK;

  const header = options.header ?? themeFonts["--font-text"] ?? OBSIDIAN_SANS_STACK;

  const code = options.code ?? themeFonts["--font-monospace"] ?? OBSIDIAN_MONO_STACK;

  const interfaceFont = options.interface ?? themeFonts["--font-interface"] ?? OBSIDIAN_SANS_STACK;

  const resolveHeading = (level: 1 | 2 | 3 | 4 | 5 | 6): string => {
    const levelKey = `h${level}` as keyof QuartzFontsOptions;
    const themeVarKey = `--h${level}-font`;

    return (
      (options[levelKey] as string | undefined) ??
      themeFonts[themeVarKey] ??
      options.header ??
      themeFonts["--font-text"] ??
      header
    );
  };

  return {
    body,
    header,
    code,
    interface: interfaceFont,
    h1: resolveHeading(1),
    h2: resolveHeading(2),
    h3: resolveHeading(3),
    h4: resolveHeading(4),
    h5: resolveHeading(5),
    h6: resolveHeading(6),
  };
}

function buildLayeredCSS(fonts: ResolvedFonts): string {
  return [
    "@layer quartz-fonts {",
    "  :root {",
    `    --bodyFont: ${fonts.body};`,
    `    --headerFont: ${fonts.header};`,
    `    --codeFont: ${fonts.code};`,
    `    --font-text: ${fonts.body};`,
    `    --font-interface: ${fonts.interface};`,
    `    --font-monospace: ${fonts.code};`,
    `    --h1-font: ${fonts.h1};`,
    `    --h2-font: ${fonts.h2};`,
    `    --h3-font: ${fonts.h3};`,
    `    --h4-font: ${fonts.h4};`,
    `    --h5-font: ${fonts.h5};`,
    `    --h6-font: ${fonts.h6};`,
    "  }",
    "}",
  ].join("\n");
}

function buildUnlayeredCSS(fonts: ResolvedFonts): string {
  return [
    `h1 { font-family: ${fonts.h1}; }`,
    `h2 { font-family: ${fonts.h2}; }`,
    `h3 { font-family: ${fonts.h3}; }`,
    `h4 { font-family: ${fonts.h4}; }`,
    `h5 { font-family: ${fonts.h5}; }`,
    `h6 { font-family: ${fonts.h6}; }`,
  ].join("\n");
}

export const QuartzFonts: QuartzTransformerPlugin<Partial<QuartzFontsOptions>> = (
  userOptions?: Partial<QuartzFontsOptions>,
) => {
  const options: QuartzFontsOptions = { ...defaultOptions, ...userOptions };

  return {
    name: "QuartzFonts",
    textTransform(_ctx, src) {
      return src;
    },
    externalResources(_ctx) {
      const fonts = resolveFonts(options);

      const css: CSSResource[] = [
        { content: buildLayeredCSS(fonts), inline: true },
        { content: buildUnlayeredCSS(fonts), inline: true },
      ];

      return { css, js: [], additionalHead: [] };
    },
  };
};
