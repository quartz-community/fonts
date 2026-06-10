import { QuartzTransformerPlugin } from '@quartz-community/types';
export { QuartzEmitterPlugin, QuartzTransformerPlugin } from '@quartz-community/types';
import { QuartzFontsOptions } from './types.js';
export { FontFileEntry, FontSpecification, GoogleFontFile, ProcessedFontResult, QuartzFontRegistry } from './types.js';
export { QuartzFontsEmitter } from './emitter.js';

declare const QuartzFonts: QuartzTransformerPlugin<Partial<QuartzFontsOptions>>;

export { QuartzFonts, QuartzFontsOptions };
