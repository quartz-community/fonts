# @quartz-community/quartz-fonts

Fine-grained font control for Quartz sites. Supports per-heading fonts, automatic theme font discovery via [Quartz Themes](https://quartz.jzhao.xyz/plugins/ThemesCore), Google Fonts loading (from the CDN or self-hosted), and otherwise falls back to the fonts set in `configuration.theme.typography`.

## Installation

```bash
npx quartz plugin add @quartz-community/quartz-fonts
```

This plugin is already enabled in the default `quartz.config.yaml`.

## Usage

```yaml title="quartz.config.yaml"
plugins:
  - source: "@quartz-community/quartz-fonts"
    enabled: true
```

With custom fonts:

```yaml title="quartz.config.yaml"
plugins:
  - source: "@quartz-community/quartz-fonts"
    enabled: true
    options:
      body: '"Inter", sans-serif'
      header: '"Playfair Display", serif'
      code: '"JetBrains Mono", monospace'
```

## Configuration

Font options accept either a CSS font-family string or an object with Google Fonts loading control:

```yaml
# String form
body: '"Inter", sans-serif'

# Object form (for Google Fonts weight/italic control)
body:
  name: Inter
  weights: [400, 600, 700]
  includeItalic: true
```

| Option          | Type                | Default          | Description                                                                                                                           |
| --------------- | ------------------- | ---------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| `title`         | `FontSpecification` | `header` value   | Font family for the site title.                                                                                                       |
| `body`          | `FontSpecification` | see below        | Font family for body text.                                                                                                            |
| `header`        | `FontSpecification` | see below        | Default font family for all headings (h1-h6).                                                                                         |
| `code`          | `FontSpecification` | see below        | Font family for code and monospace elements.                                                                                          |
| `interface`     | `FontSpecification` | Obsidian default | Font family for UI elements.                                                                                                          |
| `h1`            | `FontSpecification` | `header` value   | Font family for h1 headings.                                                                                                          |
| `h2`            | `FontSpecification` | `header` value   | Font family for h2 headings.                                                                                                          |
| `h3`            | `FontSpecification` | `header` value   | Font family for h3 headings.                                                                                                          |
| `h4`            | `FontSpecification` | `header` value   | Font family for h4 headings.                                                                                                          |
| `h5`            | `FontSpecification` | `header` value   | Font family for h5 headings.                                                                                                          |
| `h6`            | `FontSpecification` | `header` value   | Font family for h6 headings.                                                                                                          |
| `useThemeFonts` | `boolean`           | `true`           | Use fonts from Quartz Themes as defaults when it is enabled.                                                                          |
| `fontOrigin`    | `string`            | `"googleFonts"`  | `"googleFonts"` to load from the Google Fonts CDN, `"selfHosted"` to download and serve them from the site, `"local"` for no loading. |

### Default options

```yaml title="quartz.config.yaml"
- source: "@quartz-community/quartz-fonts"
  enabled: true
  options:
    useThemeFonts: true
    fontOrigin: googleFonts
```

## How it works

Fonts resolves fonts using a priority chain:

```
Plugin option
  -> Theme font (from Quartz Themes, if enabled and useThemeFonts is on)
    -> configuration.theme.typography (header, body, code, title)
      -> Quartz defaults (Schibsted Grotesk, Source Sans Pro, IBM Plex Mono)
```

For individual headings, the resolution is:

```
h1 option -> theme --h1-font -> header option -> theme body font -> resolved header font
```

For the site title:

```
title option -> configuration.theme.typography.title -> resolved header font
```

The `interface` font comes from the option, then the theme's `--font-interface`, then Obsidian's default sans-serif stack.

With `fontOrigin: googleFonts` or `selfHosted`, the header, body, code and title fonts are loaded from Google Fonts: the plugin options if set, otherwise `configuration.theme.typography`, otherwise the Quartz defaults.

### With Quartz Themes

When [Quartz Themes](https://quartz.jzhao.xyz/plugins/ThemesCore) is enabled and runs before Fonts, theme fonts are automatically discovered and used as defaults. Any options you set in Fonts will override the theme fonts.

Fonts must run after Quartz Themes. This is handled automatically by `defaultOrder` (Quartz Themes = 10, Fonts = 60).

### Without Quartz Themes

Fonts works standalone. Without a theme, it uses `configuration.theme.typography` (or the Quartz defaults).

## Examples

```yaml title="quartz.config.yaml"
# Use theme fonts automatically (default behavior)
- source: "@quartz-community/quartz-fonts"
  enabled: true

# Override just the heading font
- source: "@quartz-community/quartz-fonts"
  enabled: true
  options:
    header: '"Playfair Display", serif'

# Full control with per-heading fonts
- source: "@quartz-community/quartz-fonts"
  enabled: true
  options:
    body: '"Inter", sans-serif'
    header: '"Playfair Display", serif'
    code: '"JetBrains Mono", monospace'
    h1: '"Playfair Display", serif'
    h2: '"Lora", serif'

# Load from Google Fonts automatically
- source: "@quartz-community/quartz-fonts"
  enabled: true
  options:
    fontOrigin: googleFonts
    body: Inter
    header: Playfair Display
    code: JetBrains Mono

# Google Fonts with weight/italic control
- source: "@quartz-community/quartz-fonts"
  enabled: true
  options:
    fontOrigin: googleFonts
    body:
      name: Inter
      weights: [400, 600, 700]
      includeItalic: true
    header:
      name: Playfair Display
      weights: [400, 700]
    code:
      name: JetBrains Mono
      weights: [400]

# Custom title font (separate from header)
- source: "@quartz-community/quartz-fonts"
  enabled: true
  options:
    fontOrigin: googleFonts
    title: Abril Fatface
    header: Playfair Display
    body: Inter
    code: JetBrains Mono

# Self-hosted fonts (downloaded at build time, no external requests)
- source: "@quartz-community/quartz-fonts"
  enabled: true
  options:
    fontOrigin: selfHosted
    body: Inter
    header: Playfair Display
    code: JetBrains Mono

# Ignore theme fonts entirely
- source: "@quartz-community/quartz-fonts"
  enabled: true
  options:
    useThemeFonts: false
    body: '"Inter", sans-serif'
```

## Self-Hosted Fonts

With `fontOrigin: selfHosted`, Fonts downloads the fonts from Google Fonts during the build, writes the font files to `static/fonts/` in the build output and generates a `quartz-fonts.css` stylesheet with `@font-face` rules pointing to them. The site then makes no requests to Google at runtime.

The stylesheet is linked relative to each page and the font files relative to the stylesheet, so self-hosted fonts work on `localhost`, on any host and under a base path; `baseUrl` is not needed.

## Google Fonts Validation

When `fontOrigin: googleFonts` is set and the optional [`google-font-metadata`](https://www.npmjs.com/package/google-font-metadata) package is installed, Fonts validates your font configuration at build time:

- Checks that font family names exist in Google Fonts.
- Warns if requested weights are not available for a font.
- Warns if italic is requested but the font doesn't support it.

Install it to enable validation:

```bash
npm install google-font-metadata
```

Validation warnings are logged to the console but do not block the build.

## Documentation

See the [Quartz documentation](https://quartz.jzhao.xyz/plugins/Fonts) for more information.

## License

MIT
