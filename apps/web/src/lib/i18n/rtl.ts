/**
 * RTL (Right-to-Left) CSS utilities and helpers for Arabic, Urdu, and Hebrew support
 */

/**
 * CSS-in-JS helper for RTL-aware spacing
 * Use with inline styles or styled-components
 */
export const rtlSpacing = {
  marginStart: (value: string | number) => ({
    marginInlineStart: value,
  }),
  marginEnd: (value: string | number) => ({
    marginInlineEnd: value,
  }),
  paddingStart: (value: string | number) => ({
    paddingInlineStart: value,
  }),
  paddingEnd: (value: string | number) => ({
    paddingInlineEnd: value,
  }),
  start: (value: string | number) => ({
    insetInlineStart: value,
  }),
  end: (value: string | number) => ({
    insetInlineEnd: value,
  }),
};

/**
 * RTL-aware transform utilities
 */
export const rtlTransform = {
  // Flip an element horizontally (useful for icons)
  flip: 'scaleX(-1)',
  // Rotate for RTL
  rotateForRtl: (deg: number, isRtl: boolean) => (isRtl ? -deg : deg),
};

/**
 * Get RTL-aware class names for common patterns
 */
export function getRtlClasses(isRtl: boolean) {
  return {
    // Text alignment
    textStart: isRtl ? 'text-right' : 'text-left',
    textEnd: isRtl ? 'text-left' : 'text-right',

    // Flexbox
    flexRowReverse: isRtl ? 'flex-row-reverse' : 'flex-row',

    // Margins
    mlAuto: isRtl ? 'mr-auto' : 'ml-auto',
    mrAuto: isRtl ? 'ml-auto' : 'mr-auto',

    // Padding (logical properties work in modern browsers)
    ps: 'ps', // padding-inline-start
    pe: 'pe', // padding-inline-end
    ms: 'ms', // margin-inline-start
    me: 'me', // margin-inline-end

    // Positioning
    start0: isRtl ? 'right-0' : 'left-0',
    end0: isRtl ? 'left-0' : 'right-0',

    // Borders
    borderStart: isRtl ? 'border-r' : 'border-l',
    borderEnd: isRtl ? 'border-l' : 'border-r',
    roundedStart: isRtl ? 'rounded-r' : 'rounded-l',
    roundedEnd: isRtl ? 'rounded-l' : 'rounded-r',

    // Icons that need flipping
    iconFlip: isRtl ? 'scale-x-[-1]' : '',
  };
}

/**
 * Tailwind CSS classes for RTL support
 * Add these to your tailwind.config.js
 */
export const rtlTailwindClasses = `
/* RTL-aware utility classes */
.rtl-flip {
  transform: scaleX(-1);
}

[dir="rtl"] .rtl\\:flip {
  transform: scaleX(-1);
}

[dir="rtl"] .rtl\\:text-right {
  text-align: right;
}

[dir="ltr"] .ltr\\:text-left {
  text-align: left;
}

/* Logical properties (work in all modern browsers) */
.ps-0 { padding-inline-start: 0; }
.ps-1 { padding-inline-start: 0.25rem; }
.ps-2 { padding-inline-start: 0.5rem; }
.ps-3 { padding-inline-start: 0.75rem; }
.ps-4 { padding-inline-start: 1rem; }
.ps-5 { padding-inline-start: 1.25rem; }
.ps-6 { padding-inline-start: 1.5rem; }
.ps-8 { padding-inline-start: 2rem; }

.pe-0 { padding-inline-end: 0; }
.pe-1 { padding-inline-end: 0.25rem; }
.pe-2 { padding-inline-end: 0.5rem; }
.pe-3 { padding-inline-end: 0.75rem; }
.pe-4 { padding-inline-end: 1rem; }
.pe-5 { padding-inline-end: 1.25rem; }
.pe-6 { padding-inline-end: 1.5rem; }
.pe-8 { padding-inline-end: 2rem; }

.ms-0 { margin-inline-start: 0; }
.ms-1 { margin-inline-start: 0.25rem; }
.ms-2 { margin-inline-start: 0.5rem; }
.ms-3 { margin-inline-start: 0.75rem; }
.ms-4 { margin-inline-start: 1rem; }
.ms-auto { margin-inline-start: auto; }

.me-0 { margin-inline-end: 0; }
.me-1 { margin-inline-end: 0.25rem; }
.me-2 { margin-inline-end: 0.5rem; }
.me-3 { margin-inline-end: 0.75rem; }
.me-4 { margin-inline-end: 1rem; }
.me-auto { margin-inline-end: auto; }

.start-0 { inset-inline-start: 0; }
.end-0 { inset-inline-end: 0; }

.border-s { border-inline-start-width: 1px; }
.border-e { border-inline-end-width: 1px; }

.rounded-s { border-start-start-radius: 0.25rem; border-end-start-radius: 0.25rem; }
.rounded-e { border-start-end-radius: 0.25rem; border-end-end-radius: 0.25rem; }
`;

/**
 * Font families for different scripts
 */
export const FONT_FAMILIES = {
  // Latin scripts (English, Spanish, French, German)
  latin: '"Inter", system-ui, -apple-system, sans-serif',

  // Arabic script
  arabic:
    '"Noto Sans Arabic", "Geeza Pro", "Traditional Arabic", "Simplified Arabic", sans-serif',

  // Urdu/Persian (Nastaliq style)
  urdu: '"Noto Nastaliq Urdu", "Jameel Noori Nastaleeq", "Nafees Web Naskh", sans-serif',

  // Hindi/Devanagari
  hindi: '"Noto Sans Devanagari", "Mangal", "Kokila", sans-serif',
};

/**
 * Get appropriate font family for language
 */
export function getFontFamily(lang: string): string {
  switch (lang) {
    case 'ar':
      return FONT_FAMILIES.arabic;
    case 'ur':
      return FONT_FAMILIES.urdu;
    case 'hi':
      return FONT_FAMILIES.hindi;
    default:
      return FONT_FAMILIES.latin;
  }
}

/**
 * CSS custom properties for RTL
 */
export const rtlCssVars = `
:root {
  --direction: ltr;
  --text-align: left;
  --text-align-opposite: right;
  --float-start: left;
  --float-end: right;
}

[dir="rtl"] {
  --direction: rtl;
  --text-align: right;
  --text-align-opposite: left;
  --float-start: right;
  --float-end: left;
}
`;
