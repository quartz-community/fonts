import { createRequire } from 'module';

const require$1 = createRequire(import.meta.url);
var __require = /* @__PURE__ */ ((x2) => typeof require$1 !== "undefined" ? require$1 : typeof Proxy !== "undefined" ? new Proxy(x2, {
  get: (a2, b) => (typeof require$1 !== "undefined" ? require$1 : a2)[b]
}) : x2)(function(x2) {
  if (typeof require$1 !== "undefined") return require$1.apply(this, arguments);
  throw Error('Dynamic require of "' + x2 + '" is not supported');
});

// node_modules/preact/dist/preact.mjs
var n;
var l;
var u;
var v = [];
function _(l2, u2, t2) {
  var i2, o2, r2, e2 = {};
  for (r2 in u2) "key" == r2 ? i2 = u2[r2] : "ref" == r2 ? o2 = u2[r2] : e2[r2] = u2[r2];
  if (arguments.length > 2 && (e2.children = arguments.length > 3 ? n.call(arguments, 2) : t2), "function" == typeof l2) ;
  return m(l2, e2, i2, o2, null);
}
function m(n2, t2, i2, o2, r2) {
  var e2 = { type: n2, props: t2, key: i2, ref: o2, __k: null, __: null, __b: 0, __e: null, __c: null, constructor: void 0, __v: null == r2 ? ++u : r2, __i: -1, __u: 0 };
  return null != l.vnode && l.vnode(e2), e2;
}
n = v.slice, l = { __e: function(n2, l2, u2, t2) {
  for (var i2, o2, r2; l2 = l2.__; ) if ((i2 = l2.__c) && !i2.__) try {
    if ((o2 = i2.constructor) && null != o2.getDerivedStateFromError && (i2.setState(o2.getDerivedStateFromError(n2)), r2 = i2.__d), null != i2.componentDidCatch && (i2.componentDidCatch(n2, t2 || {}), r2 = i2.__d), r2) return i2.__E = i2;
  } catch (l3) {
    n2 = l3;
  }
  throw n2;
} }, u = 0, "function" == typeof Promise ? Promise.prototype.then.bind(Promise.resolve()) : setTimeout;

// src/defaults.ts
var OBSIDIAN_SANS_STACK = 'ui-sans-serif, -apple-system, BlinkMacSystemFont, system-ui, "Segoe UI", Roboto, "Inter", "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", sans-serif';
var OBSIDIAN_MONO_STACK = 'ui-monospace, SFMono-Regular, "Cascadia Mono", "Roboto Mono", "DejaVu Sans Mono", "Liberation Mono", Menlo, Monaco, "Consolas", "Source Code Pro", monospace';
var DEFAULT_WEIGHTS = {
  title: [400, 700],
  header: [400, 700],
  body: [400, 600],
  code: [400, 600]
};
var DEFAULT_ITALIC = {
  title: false,
  header: false,
  body: true,
  code: false
};

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

// src/util/google-fonts.ts
function normalizeFontSpec(spec) {
  return typeof spec === "string" ? { name: spec } : spec;
}
function mergeInto(map, role, spec) {
  const { name, weights, includeItalic } = normalizeFontSpec(spec);
  const resolvedWeights = weights ?? DEFAULT_WEIGHTS[role];
  const italic = includeItalic ?? DEFAULT_ITALIC[role];
  const existing = map.get(name);
  if (existing) {
    for (const w2 of resolvedWeights) existing.weights.add(w2);
    if (italic) existing.italic = true;
  } else {
    map.set(name, { name, weights: new Set(resolvedWeights), italic });
  }
}
function formatMergedEntry(entry) {
  const sortedWeights = [...entry.weights].sort((a2, b) => a2 - b);
  const features = [];
  if (entry.italic) {
    features.push("ital");
  }
  if (sortedWeights.length > 1) {
    const weightSpec = entry.italic ? sortedWeights.flatMap((w2) => [`0,${w2}`, `1,${w2}`]).sort().join(";") : sortedWeights.join(";");
    features.push(`wght@${weightSpec}`);
  }
  if (features.length > 0) {
    return `${entry.name}:${features.join(",")}`;
  }
  return entry.name;
}
function googleFontHref(fonts) {
  const merged = /* @__PURE__ */ new Map();
  mergeInto(merged, "header", fonts.header);
  mergeInto(merged, "body", fonts.body);
  mergeInto(merged, "code", fonts.code);
  if (fonts.title) {
    mergeInto(merged, "title", fonts.title);
  }
  const families = [...merged.values()].map(formatMergedEntry);
  const params = families.map((f2) => `family=${encodeURIComponent(f2)}`).join("&");
  return `https://fonts.googleapis.com/css2?${params}&display=swap`;
}

// src/util/validate.ts
var metadataCache = null;
function loadMetadata() {
  if (metadataCache === false) return void 0;
  if (metadataCache) return metadataCache;
  try {
    const { APIv1 } = __require("google-font-metadata");
    metadataCache = APIv1;
    return metadataCache;
  } catch {
    metadataCache = false;
    return void 0;
  }
}
function fontToId(family) {
  return family.toLowerCase().replace(/\s+/g, "-");
}
function validateFontSpec(role, spec, fontRole) {
  const metadata = loadMetadata();
  if (!metadata) return [];
  const warnings = [];
  const name = typeof spec === "string" ? spec : spec.name;
  const id = fontToId(name);
  const entry = metadata[id];
  if (!entry) {
    warnings.push({
      font: name,
      role,
      message: `"${name}" is not a recognized Google Font. It will be requested but may fail to load.`
    });
    return warnings;
  }
  const weights = typeof spec === "object" && spec.weights ? spec.weights : DEFAULT_WEIGHTS[fontRole];
  const italic = typeof spec === "object" && spec.includeItalic !== void 0 ? spec.includeItalic : DEFAULT_ITALIC[fontRole];
  for (const weight of weights) {
    if (!entry.weights.includes(weight)) {
      warnings.push({
        font: name,
        role,
        message: `"${name}" does not support weight ${weight}. Available weights: ${entry.weights.join(", ")}.`
      });
    }
  }
  if (italic && !entry.styles.includes("italic")) {
    warnings.push({
      font: name,
      role,
      message: `"${name}" does not support italic style. Available styles: ${entry.styles.join(", ")}.`
    });
  }
  return warnings;
}

// src/transformer.ts
var QUARTZ_DEFAULT_HEADER = "Schibsted Grotesk";
var QUARTZ_DEFAULT_BODY = "Source Sans Pro";
var QUARTZ_DEFAULT_CODE = "IBM Plex Mono";
var defaultOptions = {
  useThemeFonts: true,
  fontOrigin: "googleFonts"
};
function toFontFamily(spec) {
  if (typeof spec === "string") return spec;
  return spec.name;
}
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
  const resolve = (spec, ...fallbacks) => {
    if (spec !== void 0) return toFontFamily(spec);
    for (const fb of fallbacks) {
      if (fb !== void 0) return fb;
    }
    return OBSIDIAN_SANS_STACK;
  };
  const body = resolve(
    options.body,
    themeFonts["--font-text"],
    QUARTZ_DEFAULT_BODY,
    OBSIDIAN_SANS_STACK
  );
  const header = resolve(
    options.header,
    themeFonts["--font-text"],
    QUARTZ_DEFAULT_HEADER,
    OBSIDIAN_SANS_STACK
  );
  const code = resolve(
    options.code,
    themeFonts["--font-monospace"],
    QUARTZ_DEFAULT_CODE,
    OBSIDIAN_MONO_STACK
  );
  const interfaceFont = resolve(
    options.interface,
    themeFonts["--font-interface"],
    OBSIDIAN_SANS_STACK
  );
  const title = resolve(options.title, void 0, header);
  const resolveHeading = (level) => {
    const levelKey = `h${level}`;
    const themeVarKey = `--h${level}-font`;
    const userSpec = options[levelKey];
    if (userSpec !== void 0) return toFontFamily(userSpec);
    if (themeFonts[themeVarKey]) return themeFonts[themeVarKey];
    if (options.header !== void 0) return toFontFamily(options.header);
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
    h6: resolveHeading(6)
  };
}
function runValidation(options) {
  const specs = [];
  if (options.title) specs.push({ role: "title", spec: options.title, fontRole: "title" });
  if (options.header) specs.push({ role: "header", spec: options.header, fontRole: "header" });
  if (options.body) specs.push({ role: "body", spec: options.body, fontRole: "body" });
  if (options.code) specs.push({ role: "code", spec: options.code, fontRole: "code" });
  const headingLevels = ["h1", "h2", "h3", "h4", "h5", "h6"];
  for (const level of headingLevels) {
    const spec = options[level];
    if (spec) specs.push({ role: level, spec, fontRole: "header" });
  }
  for (const { role, spec, fontRole } of specs) {
    const warnings = validateFontSpec(role, spec, fontRole);
    for (const w2 of warnings) {
      console.warn(`[QuartzFonts] ${w2.role}: ${w2.message}`);
    }
  }
}
function buildLayeredCSS(fonts) {
  return [
    "@layer quartz-fonts {",
    "  :root {",
    `    --titleFont: ${fonts.title};`,
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
function buildGoogleFontsHead(options) {
  const headerSpec = options.header ?? QUARTZ_DEFAULT_HEADER;
  const bodySpec = options.body ?? QUARTZ_DEFAULT_BODY;
  const codeSpec = options.code ?? QUARTZ_DEFAULT_CODE;
  const href = googleFontHref({
    title: options.title,
    header: headerSpec,
    body: bodySpec,
    code: codeSpec
  });
  return [
    _("link", { rel: "preconnect", href: "https://fonts.googleapis.com" }),
    _("link", { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" }),
    _("link", { rel: "stylesheet", href })
  ];
}
var QuartzFonts = (userOptions) => {
  const options = { ...defaultOptions, ...userOptions };
  if (options.fontOrigin === "googleFonts") {
    runValidation(options);
  }
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
      const additionalHead = options.fontOrigin === "googleFonts" ? buildGoogleFontsHead(options) : [];
      return { css, js: [], additionalHead };
    }
  };
};

export { QuartzFonts };
//# sourceMappingURL=index.js.map
//# sourceMappingURL=index.js.map