import type { ProcessedFontResult, GoogleFontFile } from "../types";

const fontMimeMap: Record<string, string> = {
  truetype: "ttf",
  woff: "woff",
  woff2: "woff2",
  opentype: "otf",
};

const fontUrlPattern =
  /url\((https:\/\/fonts.gstatic.com\/.+(?:\/|(?:kit=))(.+?)[.&].+?)\)\sformat\('(\w+?)'\);/g;

/**
 * Rewrites Google Fonts URLs to local files. Font files are written next to the
 * stylesheet (`static/fonts/`), so the rewritten URLs are relative to it and work
 * regardless of host or base path (jackyzha0/quartz#2547).
 */
export function processGoogleFonts(stylesheet: string): ProcessedFontResult {
  const fontFiles: GoogleFontFile[] = [];

  const processedStylesheet = stylesheet.replace(
    fontUrlPattern,
    (match, url: string, filename: string, format: string) => {
      const extension = fontMimeMap[format] ?? format;
      const rewrittenUrl = `${filename}.${extension}`;
      fontFiles.push({ url, filename, extension });
      return match.replace(url, rewrittenUrl);
    },
  );

  return { processedStylesheet, fontFiles };
}
