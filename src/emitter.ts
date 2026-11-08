import fs from "fs";
import path from "path";
import type { QuartzEmitterPlugin, BuildCtx, FilePath } from "@quartz-community/types";
import type { FontsOptions } from "./types";
import { googleFontHref } from "./util/google-fonts";
import { processGoogleFonts } from "./util/process-fonts";
import { readConfiguredTypography, resolveFontSpecs } from "./util/typography";

const defaultOptions: FontsOptions = {
  useThemeFonts: true,
  fontOrigin: "googleFonts",
};

export const FontsEmitter: QuartzEmitterPlugin<Partial<FontsOptions>> = (
  userOptions?: Partial<FontsOptions>,
) => {
  const options: FontsOptions = { ...defaultOptions, ...userOptions };

  return {
    name: "FontsEmitter",
    async *emit(ctx: BuildCtx, _content: unknown[], _resources: unknown): AsyncGenerator<FilePath> {
      if (options.fontOrigin !== "selfHosted") {
        return;
      }

      const href = googleFontHref(resolveFontSpecs(options, readConfiguredTypography(ctx)));

      const cssResponse = await fetch(href);
      if (!cssResponse.ok) {
        throw new Error(
          `[FontsEmitter] Failed to fetch Google Fonts CSS: ${cssResponse.status} ${cssResponse.statusText}`,
        );
      }
      const cssText = await cssResponse.text();

      const { processedStylesheet, fontFiles } = processGoogleFonts(cssText);

      const fontsDir = path.join(ctx.argv.output, "static", "fonts");
      await fs.promises.mkdir(fontsDir, { recursive: true });

      for (const fontFile of fontFiles) {
        const fontResponse = await fetch(fontFile.url);
        if (!fontResponse.ok) {
          throw new Error(
            `[FontsEmitter] Failed to fetch font file: ${fontFile.url} (${fontResponse.status} ${fontResponse.statusText})`,
          );
        }
        const buf = await fontResponse.arrayBuffer();
        const filePath = path.join(fontsDir, `${fontFile.filename}.${fontFile.extension}`);
        await fs.promises.writeFile(filePath, Buffer.from(buf));
        yield filePath as FilePath;
      }

      const cssPath = path.join(fontsDir, "quartz-fonts.css");
      await fs.promises.writeFile(cssPath, processedStylesheet);
      yield cssPath as FilePath;
    },
  };
};
