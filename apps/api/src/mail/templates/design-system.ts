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
  // COLORS
  // ═══════════════════════════════════════════════════════════════════════════════
  colors: {
    // Background colors
    bgPrimary: '#0a0a0a',      // Main background - near black
    bgSecondary: '#171717',    // Card background
    bgTertiary: '#262626',     // Nested elements
    bgElevated: '#1a1a1a',     // Elevated surfaces
    
    // Glass effect backgrounds
    glassBg: 'rgba(255, 255, 255, 0.05)',
    glassBgHover: 'rgba(255, 255, 255, 0.08)',
    glassBorder: 'rgba(255, 255, 255, 0.1)',
    
    // Text colors
    textPrimary: '#ffffff',
    textSecondary: 'rgba(255, 255, 255, 0.7)',
    textMuted: 'rgba(255, 255, 255, 0.5)',
    textSubtle: 'rgba(255, 255, 255, 0.3)',
    
    // Accent colors - Purple/Violet
    accentPrimary: '#a855f7',   // Purple 500
    accentLight: '#c084fc',     // Purple 400
    accentDark: '#9333ea',      // Purple 600
    accentGlow: 'rgba(168, 85, 247, 0.3)',
    
    // Primary brand - Indigo
    brandPrimary: '#4f46e5',    // Indigo 600
    brandLight: '#6366f1',      // Indigo 500
    brandDark: '#4338ca',       // Indigo 700
    
    // Semantic colors
    success: '#10b981',
    successMuted: 'rgba(16, 185, 129, 0.2)',
    successBg: '#065f46',
    warning: '#f59e0b',
    warningMuted: 'rgba(245, 158, 11, 0.2)',
    warningBg: '#92400e',
    error: '#ef4444',
    errorMuted: 'rgba(239, 68, 68, 0.2)',
    errorBg: '#991b1b',
    info: '#3b82f6',
    infoMuted: 'rgba(59, 130, 246, 0.2)',
    infoBg: '#1e40af',
    
    // Light mode fallbacks (for email clients that force light mode)
    lightBgPrimary: '#f8fafc',
    lightBgSecondary: '#ffffff',
    lightTextPrimary: '#0f172a',
    lightTextSecondary: '#475569',
  },

  // ═══════════════════════════════════════════════════════════════════════════════
  // GRADIENTS
  // ═══════════════════════════════════════════════════════════════════════════════
  gradients: {
    accent: 'linear-gradient(135deg, #a855f7 0%, #6366f1 100%)',
    accentHover: 'linear-gradient(135deg, #c084fc 0%, #818cf8 100%)',
    brand: 'linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)',
    dark: 'linear-gradient(180deg, #0a0a0a 0%, #171717 100%)',
    glass: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
    hero: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f0f23 100%)',
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
    magicWand: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M15 4V2M15 16V14M8 9H10M20 9H22M17.8 11.8L19 13M17.8 6.2L19 5M3 21L12 12M12.2 6.2L11 5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`,
    
    // Check circle icon
    checkCircle: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M22 11.08V12C21.9988 14.1564 21.3005 16.2547 20.0093 17.9818C18.7182 19.709 16.9033 20.9725 14.8354 21.5839C12.7674 22.1953 10.5573 22.1219 8.53447 21.3746C6.51168 20.6273 4.78465 19.2461 3.61096 17.4371C2.43727 15.628 1.87979 13.4881 2.02168 11.3363C2.16356 9.18455 2.99721 7.13631 4.39828 5.49706C5.79935 3.85781 7.69279 2.71537 9.79619 2.24013C11.8996 1.7649 14.1003 1.98232 16.07 2.85999" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M22 4L12 14.01L9 11.01" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`,
    
    // Shield icon
    shield: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 22C12 22 20 18 20 12V5L12 2L4 5V12C4 18 12 22 12 22Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`,
    
    // Clock icon
    clock: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
      <path d="M12 6V12L16 14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
    </svg>`,
    
    // Calendar icon
    calendar: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" stroke-width="2"/>
      <path d="M16 2V6M8 2V6M3 10H21" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
    </svg>`,
    
    // Star icon
    star: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`,
    
    // Location pin icon
    mapPin: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M21 10C21 17 12 23 12 23C12 23 3 17 3 10C3 7.61305 3.94821 5.32387 5.63604 3.63604C7.32387 1.94821 9.61305 1 12 1C14.3869 1 16.6761 1.94821 18.364 3.63604C20.0518 5.32387 21 7.61305 21 10Z" stroke="currentColor" stroke-width="2"/>
      <circle cx="12" cy="10" r="3" stroke="currentColor" stroke-width="2"/>
    </svg>`,
    
    // User icon
    user: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
      <circle cx="12" cy="7" r="4" stroke="currentColor" stroke-width="2"/>
    </svg>`,
    
    // Sparkles icon (for Tars AI)
    sparkles: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 3L13.5 8.5L19 10L13.5 11.5L12 17L10.5 11.5L5 10L10.5 8.5L12 3Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M19 15L19.5 17L21.5 17.5L19.5 18L19 20L18.5 18L16.5 17.5L18.5 17L19 15Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`,
  },
};

// Export individual sections for convenience
export const { colors, gradients, typography, spacing, borderRadius, shadows, icons } = emailDesignSystem;

// Type exports
export type EmailColors = typeof emailDesignSystem.colors;
export type EmailGradients = typeof emailDesignSystem.gradients;
export type EmailTypography = typeof emailDesignSystem.typography;
