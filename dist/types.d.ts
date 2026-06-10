export { BuildCtx, CSSResource, JSResource, QuartzTransformerPlugin, QuartzTransformerPluginInstance, StaticResources } from '@quartz-community/types';

interface QuartzFontsOptions {
    body?: string;
    header?: string;
    code?: string;
    interface?: string;
    h1?: string;
    h2?: string;
    h3?: string;
    h4?: string;
    h5?: string;
    h6?: string;
    useThemeFonts?: boolean;
}
interface QuartzFontRegistry {
    themeName: string;
    fonts: Record<string, string>;
    fontFiles?: FontFileEntry[];
    fontDir?: string;
}
interface FontFileEntry {
    family: string;
    style: string;
    weight: string;
    file: string;
    format: string;
    unicodeRange?: string | null;
}

export type { FontFileEntry, QuartzFontRegistry, QuartzFontsOptions };
