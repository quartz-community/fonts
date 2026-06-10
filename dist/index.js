import { createRequire } from 'module';

createRequire(import.meta.url);

// src/defaults.ts
var OBSIDIAN_SANS_STACK = 'ui-sans-serif, -apple-system, BlinkMacSystemFont, system-ui, "Segoe UI", Roboto, "Inter", "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", sans-serif';
var OBSIDIAN_MONO_STACK = 'ui-monospace, SFMono-Regular, "Cascadia Mono", "Roboto Mono", "DejaVu Sans Mono", "Liberation Mono", Menlo, Monaco, "Consolas", "Source Code Pro", monospace';

// src/util/registry.ts
var REGISTRY_KEY = "__quartzFonts";
function readFontRegistry() {
  const registry = globalThis[REGISTRY_KEY];
  if (registry && typeof registry === "object" && "themeName" in registry && "fonts" in registry) {
    return registry;
  }
  return void 0;
}
function isQuartzThemeEnabled() {
  return REGISTRY_KEY in globalThis;
}

// src/transformer.ts
var defaultOptions = {
  useThemeFonts: true
};
function resolveFonts(options) {
  const registry = options.useThemeFonts !== false ? readFontRegistry() : void 0;
  if (options.useThemeFonts !== false && !registry) {
    if (isQuartzThemeEnabled()) {
      console.warn(
        "[QuartzFonts] QuartzTheme is enabled but its font registry is empty. Ensure QuartzTheme runs before QuartzFonts (lower defaultOrder number). Falling back to Obsidian defaults."
      );
    }
  }
  const themeFonts = registry?.fonts ?? {};
  const body = options.body ?? themeFonts["--font-text"] ?? OBSIDIAN_SANS_STACK;
  const header = options.header ?? themeFonts["--font-text"] ?? OBSIDIAN_SANS_STACK;
  const code = options.code ?? themeFonts["--font-monospace"] ?? OBSIDIAN_MONO_STACK;
  const interfaceFont = options.interface ?? themeFonts["--font-interface"] ?? OBSIDIAN_SANS_STACK;
  const resolveHeading = (level) => {
    const levelKey = `h${level}`;
    const themeVarKey = `--h${level}-font`;
    return options[levelKey] ?? themeFonts[themeVarKey] ?? options.header ?? themeFonts["--font-text"] ?? header;
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
    h6: resolveHeading(6)
  };
}
function buildLayeredCSS(fonts) {
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
    "}"
  ].join("\n");
}
function buildUnlayeredCSS(fonts) {
  return [
    `h1 { font-family: ${fonts.h1}; }`,
    `h2 { font-family: ${fonts.h2}; }`,
    `h3 { font-family: ${fonts.h3}; }`,
    `h4 { font-family: ${fonts.h4}; }`,
    `h5 { font-family: ${fonts.h5}; }`,
    `h6 { font-family: ${fonts.h6}; }`
  ].join("\n");
}
var QuartzFonts = (userOptions) => {
  const options = { ...defaultOptions, ...userOptions };
  return {
    name: "QuartzFonts",
    textTransform(_ctx, src) {
      return src;
    },
    externalResources(_ctx) {
      const fonts = resolveFonts(options);
      const css = [
        { content: buildLayeredCSS(fonts), inline: true },
        { content: buildUnlayeredCSS(fonts), inline: true }
      ];
      return { css, js: [], additionalHead: [] };
    }
  };
};

export { QuartzFonts };
//# sourceMappingURL=index.js.map
//# sourceMappingURL=index.js.map