import { h } from "preact";
import type { QuartzTransformerPlugin, CSSResource } from "@quartz-community/types";
import type { FontSpecification, FontsOptions } from "./types";
import { OBSIDIAN_SANS_STACK, OBSIDIAN_MONO_STACK } from "./defaults";
import { readFontRegistry, isQuartzThemeEnabled } from "./util/registry";
import { googleFontHref } from "./util/google-fonts";
import { validateFontSpec } from "./util/validate";
import { pathToRoot } from "@quartz-community/utils";
import type { FullSlug } from "@quartz-community/types";
import {
  QUARTZ_DEFAULT_BODY,
  QUARTZ_DEFAULT_CODE,
  QUARTZ_DEFAULT_HEADER,
  readConfiguredTypography,
  resolveFontSpecs,
} from "./util/typography";
import type { ConfiguredTypography } from "./util/typography";

const HEADING_LEVELS = ["h1", "h2", "h3", "h4", "h5", "h6"] as const;

export const SELF_HOSTED_STYLESHEET = "static/fonts/quartz-fonts.css";

const defaultOptions: FontsOptions = {
  useThemeFonts: true,
  fontOrigin: "googleFonts",
};

function toFontFamily(spec: FontSpecification): string {
  if (typeof spec === "string") return spec;
  return spec.name;
}

interface ResolvedFonts {
  title: string;
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

function resolveFonts(options: FontsOptions, typography: ConfiguredTypography): ResolvedFonts {
  const registry = options.useThemeFonts !== false ? readFontRegistry() : undefined;

  if (options.useThemeFonts !== false && !registry) {
    if (isQuartzThemeEnabled()) {
      console.warn(
        "[Fonts] QuartzTheme is enabled but its font registry is empty. " +
          "Ensure QuartzTheme runs before Fonts (lower defaultOrder number). " +
          "Falling back to Obsidian defaults.",
      );
    }
  }

  const themeFonts = registry?.fonts ?? {};

  const resolve = (
    spec: FontSpecification | undefined,
    ...fallbacks: (string | undefined)[]
  ): string => {
    if (spec !== undefined) return toFontFamily(spec);
    for (const fb of fallbacks) {
      if (fb !== undefined) return fb;
    }
    return OBSIDIAN_SANS_STACK;
  };

  const body = resolve(
    options.body,
    themeFonts["--font-text"],
    typography.body && toFontFamily(typography.body),
    QUARTZ_DEFAULT_BODY,
    OBSIDIAN_SANS_STACK,
  );
  const header = resolve(
    options.header,
    themeFonts["--font-text"],
    typography.header && toFontFamily(typography.header),
    QUARTZ_DEFAULT_HEADER,
    OBSIDIAN_SANS_STACK,
  );
  const code = resolve(
    options.code,
    themeFonts["--font-monospace"],
    typography.code && toFontFamily(typography.code),
    QUARTZ_DEFAULT_CODE,
    OBSIDIAN_MONO_STACK,
  );
  const interfaceFont = resolve(
    options.interface,
    themeFonts["--font-interface"],
    OBSIDIAN_SANS_STACK,
  );
  const title = resolve(options.title, typography.title && toFontFamily(typography.title), header);

  const resolveHeading = (level: 1 | 2 | 3 | 4 | 5 | 6): string => {
    const levelKey = `h${level}` as keyof FontsOptions;
    const themeVarKey = `--h${level}-font`;
    const userSpec = options[levelKey] as FontSpecification | undefined;

    if (userSpec !== undefined) return toFontFamily(userSpec);
    if (themeFonts[themeVarKey]) return themeFonts[themeVarKey];
    if (options.header !== undefined) return toFontFamily(options.header);
    if (themeFonts["--font-text"]) return themeFonts["--font-text"];
    return header;
  };

  return {
    title,
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

function runValidation(options: FontsOptions): void {
  const specs: Array<{
    role: string;
    spec: FontSpecification;
    fontRole: "title" | "header" | "body" | "code";
  }> = [];

  if (options.title) specs.push({ role: "title", spec: options.title, fontRole: "title" });
  if (options.header) specs.push({ role: "header", spec: options.header, fontRole: "header" });
  if (options.body) specs.push({ role: "body", spec: options.body, fontRole: "body" });
  if (options.code) specs.push({ role: "code", spec: options.code, fontRole: "code" });

  const headingLevels = ["h1", "h2", "h3", "h4", "h5", "h6"] as const;
  for (const level of headingLevels) {
    const spec = options[level];
    if (spec) specs.push({ role: level, spec, fontRole: "header" });
  }

  for (const { role, spec, fontRole } of specs) {
    const warnings = validateFontSpec(role, spec, fontRole);
    for (const w of warnings) {
      console.warn(`[Fonts] ${w.role}: ${w.message}`);
    }
  }
}

/**
 * Quartz's font variables, plus Obsidian's (--font-text, --hN-font, …). With
 * QuartzTheme active the theme's CSS owns Obsidian's variables — setting them on
 * :root would leak into the theme through `--h1-font: inherit` and friends — so
 * they are only emitted for roles the user configured explicitly.
 */
export function buildLayeredCSS(
  fonts: ResolvedFonts,
  options: Partial<FontsOptions> = {},
  themeActive = false,
): string {
  const obsidianVars: [string, string, keyof FontsOptions | undefined][] = [
    ["--font-text", fonts.body, "body"],
    ["--font-interface", fonts.interface, "interface"],
    ["--font-monospace", fonts.code, "code"],
    ...HEADING_LEVELS.map(
      (level) => [`--${level}-font`, fonts[level], level] as [string, string, keyof FontsOptions],
    ),
  ];
  const explicit = (key: keyof FontsOptions | undefined) =>
    key !== undefined &&
    (options[key] !== undefined ||
      (key.startsWith("h") && key.length === 2 && options.header !== undefined));
  return [
    "@layer quartz-fonts {",
    "  :root {",
    `    --titleFont: ${fonts.title};`,
    `    --bodyFont: ${fonts.body};`,
    `    --headerFont: ${fonts.header};`,
    `    --codeFont: ${fonts.code};`,
    ...obsidianVars
      .filter(([, , key]) => !themeActive || explicit(key))
      .map(([name, value]) => `    ${name}: ${value};`),
    "  }",
    "}",
  ].join("\n");
}

/**
 * Unlayered heading fonts beat every layered stylesheet. Without a theme they
 * apply the configured header font everywhere. With QuartzTheme (it registers
 * its fonts), the theme's own CSS sets heading fonts (Obsidian's --hN-font
 * chain), so only headings the user configured explicitly are forced.
 */
export function buildUnlayeredCSS(
  fonts: ResolvedFonts,
  options: Partial<FontsOptions> = {},
  themeActive = false,
): string {
  const levels = themeActive
    ? HEADING_LEVELS.filter((level) => options[level] !== undefined || options.header !== undefined)
    : HEADING_LEVELS;
  return levels.map((level) => `${level} { font-family: ${fonts[level]}; }`).join("\n");
}

function buildGoogleFontsHead(options: FontsOptions, typography: ConfiguredTypography): unknown[] {
  const href = googleFontHref(resolveFontSpecs(options, typography));

  return [
    h("link", { rel: "preconnect", href: "https://fonts.googleapis.com" }),
    h("link", { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" }),
    h("link", { rel: "stylesheet", href }),
  ];
}

export const Fonts: QuartzTransformerPlugin<Partial<FontsOptions>> = (
  userOptions?: Partial<FontsOptions>,
) => {
  const options: FontsOptions = { ...defaultOptions, ...userOptions };

  if (options.fontOrigin === "googleFonts") {
    runValidation(options);
  }

  return {
    name: "Fonts",
    textTransform(_ctx, src) {
      return src;
    },
    externalResources(ctx) {
      const typography = readConfiguredTypography(ctx);
      const fonts = resolveFonts(options, typography);

      const themeActive = options.useThemeFonts !== false && readFontRegistry() !== undefined;
      const unlayered = buildUnlayeredCSS(fonts, options, themeActive);
      const css: CSSResource[] = [
        { content: buildLayeredCSS(fonts, options, themeActive), inline: true },
      ];
      if (unlayered) css.push({ content: unlayered, inline: true });

      let additionalHead: unknown[] = [];
      if (options.fontOrigin === "googleFonts") {
        additionalHead = buildGoogleFontsHead(options, typography);
      } else if (options.fontOrigin === "selfHosted") {
        // Relative to the page so it works on localhost and under a base path (jackyzha0/quartz#2547).
        additionalHead = [
          (fileData: { slug?: string }) =>
            h("link", {
              rel: "stylesheet",
              href: `${pathToRoot((fileData?.slug ?? "index") as FullSlug)}/${SELF_HOSTED_STYLESHEET}`,
            }),
        ];
      }

      return { css, js: [], additionalHead };
    },
  };
};
