import { QuartzTransformerPlugin } from '@quartz-community/types';
export { QuartzTransformerPlugin } from '@quartz-community/types';
import { QuartzFontsOptions } from './types.js';
export { FontFileEntry, QuartzFontRegistry } from './types.js';

declare const QuartzFonts: QuartzTransformerPlugin<Partial<QuartzFontsOptions>>;

export { QuartzFonts, QuartzFontsOptions };
