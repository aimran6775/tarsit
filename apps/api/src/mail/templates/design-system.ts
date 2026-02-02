/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * TARSIT EMAIL DESIGN SYSTEM
 * ═══════════════════════════════════════════════════════════════════════════════
 * 
 * Synchronized with the frontend design system (apps/web/src/styles/theme.css)
 * All email templates use these tokens for consistent branding.
 * 
 * THEME: Dark Glass Morphism + Purple Accents (matching web app)
 * ═══════════════════════════════════════════════════════════════════════════════
 */

export const emailDesignSystem = {
  // ═══════════════════════════════════════════════════════════════════════════════
  // COLORS - Light mode friendly for email clients
  // ═══════════════════════════════════════════════════════════════════════════════
  colors: {
    // Background colors - Light theme for email compatibility
    bgPrimary: '#f8fafc',      // Main background - light slate
    bgSecondary: '#ffffff',    // Card background - white
    bgTertiary: '#f1f5f9',     // Nested elements - light gray
    bgElevated: '#ffffff',     // Elevated surfaces
    
    // Glass effect backgrounds - solid colors for email
    glassBg: '#f1f5f9',
    glassBgHover: '#e2e8f0',
    glassBorder: '#e2e8f0',
    
    // Text colors - dark for light background
    textPrimary: '#0f172a',
    textSecondary: '#475569',
    textMuted: '#64748b',
    textSubtle: '#94a3b8',
    
    // Accent colors - Purple/Violet (solid for email)
    accentPrimary: '#7c3aed',   // Violet 600 - darker for better contrast
    accentLight: '#8b5cf6',     // Violet 500
    accentDark: '#6d28d9',      // Violet 700
    accentGlow: '#ede9fe',      // Violet 100 - solid glow effect
    
    // Primary brand - Indigo
    brandPrimary: '#4f46e5',    // Indigo 600
    brandLight: '#6366f1',      // Indigo 500
    brandDark: '#4338ca',       // Indigo 700
    
    // Semantic colors - solid backgrounds for email
    success: '#059669',
    successMuted: '#d1fae5',
    successBg: '#ecfdf5',
    warning: '#d97706',
    warningMuted: '#fef3c7',
    warningBg: '#fffbeb',
    error: '#dc2626',
    errorMuted: '#fee2e2',
    errorBg: '#fef2f2',
    info: '#2563eb',
    infoMuted: '#dbeafe',
    infoBg: '#eff6ff',
    
    // Button colors (solid for email)
    buttonBg: '#7c3aed',
    buttonText: '#ffffff',
    buttonBorder: '#7c3aed',
  },

  // ═══════════════════════════════════════════════════════════════════════════════
  // GRADIENTS - Solid colors for email client compatibility
  // ═══════════════════════════════════════════════════════════════════════════════
  gradients: {
    accent: '#7c3aed',          // Solid violet for buttons
    accentHover: '#6d28d9',     // Darker on hover
    brand: '#4f46e5',           // Solid indigo
    dark: '#1e293b',            // Slate 800
    glass: '#f1f5f9',           // Light gray
    hero: '#f8fafc',            // Light background
  },

  // ═══════════════════════════════════════════════════════════════════════════════
  // TYPOGRAPHY
  // ═══════════════════════════════════════════════════════════════════════════════
  typography: {
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
    fontFamilyMono: "'SF Mono', Monaco, 'Courier New', monospace",
    
    // Font sizes
    sizeXs: '12px',
    sizeSm: '14px',
    sizeBase: '16px',
    sizeLg: '18px',
    sizeXl: '20px',
    size2xl: '24px',
    size3xl: '30px',
    size4xl: '36px',
    
    // Line heights
    lineHeightTight: '1.25',
    lineHeightNormal: '1.5',
    lineHeightRelaxed: '1.625',
    
    // Font weights
    weightNormal: '400',
    weightMedium: '500',
    weightSemibold: '600',
    weightBold: '700',
  },

  // ═══════════════════════════════════════════════════════════════════════════════
  // SPACING
  // ═══════════════════════════════════════════════════════════════════════════════
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '12px',
    lg: '16px',
    xl: '24px',
    '2xl': '32px',
    '3xl': '48px',
    '4xl': '64px',
  },

  // ═══════════════════════════════════════════════════════════════════════════════
  // BORDER RADIUS
  // ═══════════════════════════════════════════════════════════════════════════════
  borderRadius: {
    sm: '6px',
    md: '8px',
    lg: '12px',
    xl: '16px',
    '2xl': '24px',
    full: '9999px',
  },

  // ═══════════════════════════════════════════════════════════════════════════════
  // SHADOWS
  // ═══════════════════════════════════════════════════════════════════════════════
  shadows: {
    sm: '0 1px 2px rgba(0, 0, 0, 0.5)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.5)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.5)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.5)',
    glow: '0 0 20px rgba(168, 85, 247, 0.3)',
    glowStrong: '0 0 40px rgba(168, 85, 247, 0.5)',
    button: '0 4px 14px rgba(168, 85, 247, 0.4)',
  },

  // ═══════════════════════════════════════════════════════════════════════════════
  // ICONS (SVG inline for email compatibility)
  // ═══════════════════════════════════════════════════════════════════════════════
  icons: {
    // Magic wand icon
    magicWand: (color = 'currentColor', size = 24) => `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M15 4V2M15 16V14M8 9H10M20 9H22M17.8 11.8L19 13M17.8 6.2L19 5M3 21L12 12M12.2 6.2L11 5" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`,
    
    // Check circle icon
    checkCircle: (color = 'currentColor', size = 24) => `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M22 11.08V12C21.9988 14.1564 21.3005 16.2547 20.0093 17.9818C18.7182 19.709 16.9033 20.9725 14.8354 21.5839C12.7674 22.1953 10.5573 22.1219 8.53447 21.3746C6.51168 20.6273 4.78465 19.2461 3.61096 17.4371C2.43727 15.628 1.87979 13.4881 2.02168 11.3363C2.16356 9.18455 2.99721 7.13631 4.39828 5.49706C5.79935 3.85781 7.69279 2.71537 9.79619 2.24013C11.8996 1.7649 14.1003 1.98232 16.07 2.85999" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M22 4L12 14.01L9 11.01" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`,
    
    // Shield icon
    shield: (color = 'currentColor', size = 24) => `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 22C12 22 20 18 20 12V5L12 2L4 5V12C4 18 12 22 12 22Z" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`,
    
    // Clock icon
    clock: (color = 'currentColor', size = 24) => `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="10" stroke="${color}" stroke-width="2"/>
      <path d="M12 6V12L16 14" stroke="${color}" stroke-width="2" stroke-linecap="round"/>
    </svg>`,
    
    // Calendar icon
    calendar: (color = 'currentColor', size = 24) => `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="3" y="4" width="18" height="18" rx="2" stroke="${color}" stroke-width="2"/>
      <path d="M16 2V6M8 2V6M3 10H21" stroke="${color}" stroke-width="2" stroke-linecap="round"/>
    </svg>`,
    
    // Star icon
    star: (color = 'currentColor', size = 24) => `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`,
    
    // Location pin icon
    mapPin: (color = 'currentColor', size = 24) => `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M21 10C21 17 12 23 12 23C12 23 3 17 3 10C3 7.61305 3.94821 5.32387 5.63604 3.63604C7.32387 1.94821 9.61305 1 12 1C14.3869 1 16.6761 1.94821 18.364 3.63604C20.0518 5.32387 21 7.61305 21 10Z" stroke="${color}" stroke-width="2"/>
      <circle cx="12" cy="10" r="3" stroke="${color}" stroke-width="2"/>
    </svg>`,
    
    // User icon
    user: (color = 'currentColor', size = 24) => `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" stroke="${color}" stroke-width="2" stroke-linecap="round"/>
      <circle cx="12" cy="7" r="4" stroke="${color}" stroke-width="2"/>
    </svg>`,
    
    // Sparkles icon (for Tars AI)
    sparkles: (color = 'currentColor', size = 24) => `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 3L13.5 8.5L19 10L13.5 11.5L12 17L10.5 11.5L5 10L10.5 8.5L12 3Z" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M19 15L19.5 17L21.5 17.5L19.5 18L19 20L18.5 18L16.5 17.5L18.5 17L19 15Z" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`,
    
    // Mail/envelope icon
    mail: (color = 'currentColor', size = 24) => `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="2" y="4" width="20" height="16" rx="2" stroke="${color}" stroke-width="2"/>
      <path d="M22 6L12 13L2 6" stroke="${color}" stroke-width="2" stroke-linecap="round"/>
    </svg>`,
    
    // Lock icon
    lock: (color = 'currentColor', size = 24) => `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="3" y="11" width="18" height="11" rx="2" stroke="${color}" stroke-width="2"/>
      <path d="M7 11V7C7 4.23858 9.23858 2 12 2C14.7614 2 17 4.23858 17 7V11" stroke="${color}" stroke-width="2" stroke-linecap="round"/>
    </svg>`,
    
    // Key icon
    key: (color = 'currentColor', size = 24) => `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="8" cy="15" r="5" stroke="${color}" stroke-width="2"/>
      <path d="M12 11L21 2M21 2L17 2M21 2V6" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`,
    
    // Alert/warning triangle icon
    alertTriangle: (color = 'currentColor', size = 24) => `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M10.29 3.86L1.82 18C1.64 18.3 1.55 18.64 1.55 19C1.55 19.36 1.64 19.7 1.82 20C2 20.3 2.26 20.56 2.58 20.74C2.9 20.92 3.26 21.01 3.63 21H20.37C20.74 21.01 21.1 20.92 21.42 20.74C21.74 20.56 22 20.3 22.18 20C22.36 19.7 22.45 19.36 22.45 19C22.45 18.64 22.36 18.3 22.18 18L13.71 3.86C13.53 3.56 13.27 3.32 12.95 3.15C12.63 2.98 12.27 2.89 11.9 2.89C11.53 2.89 11.17 2.98 10.85 3.15C10.53 3.32 10.27 3.56 10.09 3.86H10.29Z" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M12 9V13M12 17H12.01" stroke="${color}" stroke-width="2" stroke-linecap="round"/>
    </svg>`,
    
    // Info circle icon
    infoCircle: (color = 'currentColor', size = 24) => `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="10" stroke="${color}" stroke-width="2"/>
      <path d="M12 16V12M12 8H12.01" stroke="${color}" stroke-width="2" stroke-linecap="round"/>
    </svg>`,
    
    // Success/check icon
    check: (color = 'currentColor', size = 24) => `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M20 6L9 17L4 12" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`,
    
    // X/close icon
    x: (color = 'currentColor', size = 24) => `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M18 6L6 18M6 6L18 18" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`,
    
    // Celebration/party icon
    celebration: (color = 'currentColor', size = 24) => `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M5.5 21L3 3L21.5 11L13 13L5.5 21Z" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M14 7L17 4M19 10L22 11M16 14L18 17" stroke="${color}" stroke-width="2" stroke-linecap="round"/>
    </svg>`,
    
    // Search/discover icon
    search: (color = 'currentColor', size = 24) => `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="11" cy="11" r="8" stroke="${color}" stroke-width="2"/>
      <path d="M21 21L16.65 16.65" stroke="${color}" stroke-width="2" stroke-linecap="round"/>
    </svg>`,
    
    // Message/chat icon
    message: (color = 'currentColor', size = 24) => `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M21 15C21 15.5304 20.7893 16.0391 20.4142 16.4142C20.0391 16.7893 19.5304 17 19 17H7L3 21V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V15Z" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`,
    
    // Robot/AI icon  
    robot: (color = 'currentColor', size = 24) => `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="3" y="8" width="18" height="12" rx="2" stroke="${color}" stroke-width="2"/>
      <path d="M12 4V8M9 4H15" stroke="${color}" stroke-width="2" stroke-linecap="round"/>
      <circle cx="9" cy="14" r="2" fill="${color}"/>
      <circle cx="15" cy="14" r="2" fill="${color}"/>
    </svg>`,
    
    // Lightbulb/tip icon
    lightbulb: (color = 'currentColor', size = 24) => `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M9 18H15M10 22H14M12 2C8.13 2 5 5.13 5 9C5 11.38 6.19 13.47 8 14.74V17C8 17.55 8.45 18 9 18H15C15.55 18 16 17.55 16 17V14.74C17.81 13.47 19 11.38 19 9C19 5.13 15.87 2 12 2Z" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`,
    
    // Diamond/bullet icon
    diamond: (color = 'currentColor', size = 24) => `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2L22 12L12 22L2 12L12 2Z" fill="${color}"/>
    </svg>`,
    
    // Arrow right icon
    arrowRight: (color = 'currentColor', size = 24) => `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`,
    
    // Camera/Instagram icon
    camera: (color = 'currentColor', size = 24) => `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="2" y="2" width="20" height="20" rx="5" stroke="${color}" stroke-width="2"/>
      <circle cx="12" cy="12" r="4" stroke="${color}" stroke-width="2"/>
      <circle cx="18" cy="6" r="1" fill="${color}"/>
    </svg>`,
  },
};

// Export individual sections for convenience
export const { gradients, typography, spacing, borderRadius, shadows, icons } = emailDesignSystem;

// Colors with convenience aliases
export const colors = {
  ...emailDesignSystem.colors,
  // Convenience aliases used in templates
  accent: emailDesignSystem.colors.accentPrimary,
  gradientPrimary: emailDesignSystem.gradients.accent,
  glassBackground: emailDesignSystem.colors.glassBg,
};

// Type exports
export type EmailColors = typeof emailDesignSystem.colors;
export type EmailGradients = typeof emailDesignSystem.gradients;
export type EmailTypography = typeof emailDesignSystem.typography;
