import type { BuildCtx } from "@quartz-community/types";
import type { FontSpecification } from "../types";

export const QUARTZ_DEFAULT_HEADER = "Schibsted Grotesk";
export const QUARTZ_DEFAULT_BODY = "Source Sans Pro";
export const QUARTZ_DEFAULT_CODE = "IBM Plex Mono";

export interface ConfiguredTypography {
  title?: FontSpecification;
  header?: FontSpecification;
  body?: FontSpecification;
  code?: FontSpecification;
}

function isFontSpecification(value: unknown): value is FontSpecification {
  if (typeof value === "string") return value.trim().length > 0;
  return (
    typeof value === "object" &&
    value !== null &&
    typeof (value as { name?: unknown }).name === "string"
  );
}

/**
 * Reads `configuration.theme.typography` from the Quartz build context.
 * Only well-formed font specifications are returned; anything else is omitted.
 */
export function readConfiguredTypography(ctx: BuildCtx | undefined): ConfiguredTypography {
  const theme = ctx?.cfg?.configuration?.theme as { typography?: unknown } | undefined;
  const typography = theme?.typography;
  if (typeof typography !== "object" || typography === null) return {};

  const result: ConfiguredTypography = {};
  for (const role of ["title", "header", "body", "code"] as const) {
    const spec = (typography as Record<string, unknown>)[role];
    if (isFontSpecification(spec)) result[role] = spec;
  }
  return result;
}

/**
 * Font specifications used to load fonts (Google Fonts / self-hosted):
 * plugin options first, then `configuration.theme.typography`, then the Quartz defaults.
 */
export function resolveFontSpecs(
  options: ConfiguredTypography,
  typography: ConfiguredTypography,
): {
  title?: FontSpecification;
  header: FontSpecification;
  body: FontSpecification;
  code: FontSpecification;
} {
  return {
    title: options.title ?? typography.title,
    header: options.header ?? typography.header ?? QUARTZ_DEFAULT_HEADER,
    body: options.body ?? typography.body ?? QUARTZ_DEFAULT_BODY,
    code: options.code ?? typography.code ?? QUARTZ_DEFAULT_CODE,
  };
}
