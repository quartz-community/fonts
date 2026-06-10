# @quartz-community/quartz-fonts

Fine-grained font control for Quartz sites. Supports per-heading fonts, automatic theme font discovery via [QuartzTheme](https://github.com/saberzero1/quartz-themes), and Obsidian-compatible defaults.

## Installation

```bash
npx quartz plugin add github:quartz-community/quartz-fonts
```

## Usage

```yaml title="quartz.config.yaml"
plugins:
  - source: github:quartz-community/quartz-fonts
    enabled: true
```

For advanced use cases, you can override in TypeScript:

```ts title="quartz.ts (override)"
import * as ExternalPlugin from "./.quartz/plugins";

ExternalPlugin.QuartzFonts({
  body: '"Inter", sans-serif',
  header: '"Playfair Display", serif',
  code: '"JetBrains Mono", monospace',
});
```

## Configuration

| Option          | Type      | Default          | Description                                                  |
| --------------- | --------- | ---------------- | ------------------------------------------------------------ |
| `body`          | `string`  | Obsidian default | Font family for body text.                                   |
| `header`        | `string`  | Obsidian default | Default font family for all headings (h1-h6).                |
| `code`          | `string`  | Obsidian default | Font family for code and monospace elements.                 |
| `interface`     | `string`  | Obsidian default | Font family for UI elements.                                 |
| `h1`            | `string`  | `header` value   | Font family for h1 headings.                                 |
| `h2`            | `string`  | `header` value   | Font family for h2 headings.                                 |
| `h3`            | `string`  | `header` value   | Font family for h3 headings.                                 |
| `h4`            | `string`  | `header` value   | Font family for h4 headings.                                 |
| `h5`            | `string`  | `header` value   | Font family for h5 headings.                                 |
| `h6`            | `string`  | `header` value   | Font family for h6 headings.                                 |
| `useThemeFonts` | `boolean` | `true`           | Use fonts from QuartzTheme as defaults when it is installed. |

### Default options

```yaml title="quartz.config.yaml"
- source: github:quartz-community/quartz-fonts
  enabled: true
  options:
    useThemeFonts: true
```

## How it works

QuartzFonts resolves fonts using a priority chain:

```
User config (plugin options)
  -> Theme fonts (from QuartzTheme, if installed)
    -> Obsidian defaults (system font stacks)
```

For individual headings, the resolution is:

```
h1 option -> header option -> theme --h1-font -> theme font -> Obsidian default
```

### With QuartzTheme

When [QuartzTheme](https://github.com/saberzero1/quartz-themes) is installed and runs before QuartzFonts, theme fonts are automatically discovered and used as defaults. Any options you set in QuartzFonts will override the theme fonts.

QuartzFonts must run after QuartzTheme. This is handled automatically by `defaultOrder` (QuartzTheme = 50, QuartzFonts = 60).

### Without QuartzTheme

QuartzFonts works standalone. Without a theme, it falls back to Obsidian's default system font stacks.

## Examples

```yaml title="quartz.config.yaml"
# Use theme fonts automatically (default behavior)
- source: github:quartz-community/quartz-fonts
  enabled: true

# Override just the heading font
- source: github:quartz-community/quartz-fonts
  enabled: true
  options:
    header: '"Playfair Display", serif'

# Full control with per-heading fonts
- source: github:quartz-community/quartz-fonts
  enabled: true
  options:
    body: '"Inter", sans-serif'
    header: '"Playfair Display", serif'
    code: '"JetBrains Mono", monospace'
    h1: '"Playfair Display", serif'
    h2: '"Lora", serif'

# Ignore theme fonts entirely
- source: github:quartz-community/quartz-fonts
  enabled: true
  options:
    useThemeFonts: false
    body: '"Inter", sans-serif'
```

## Documentation

See the [Quartz documentation](https://quartz.jzhao.xyz/plugins/QuartzFonts) for more information.

## License

MIT
