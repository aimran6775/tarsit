/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * TARSIT BASE EMAIL TEMPLATE
 * ═══════════════════════════════════════════════════════════════════════════════
 * 
 * Premium dark glass-morphism email template matching the Tarsit web app design.
 * All email templates extend this base layout for consistent branding.
 * 
 * Features:
 * - Dark mode by default (matching app theme)
 * - Glass-morphism effects where supported
 * - Responsive design
 * - Email client compatibility (Outlook, Gmail, Apple Mail, etc.)
 * ═══════════════════════════════════════════════════════════════════════════════
 */

import { borderRadius, colors, gradients, shadows, spacing, typography } from './design-system';

export interface BaseTemplateProps {
  previewText?: string;
  content: string;
  footerText?: string;
  showSocialLinks?: boolean;
}

/**
 * Tarsit Logo as inline SVG (works in all email clients)
 */
const tarsitLogo = `
  <table role="presentation" cellpadding="0" cellspacing="0" style="margin: 0 auto;">
    <tr>
      <td style="vertical-align: middle; padding-right: 12px;">
        <div style="width: 48px; height: 48px; background: ${gradients.accent}; border-radius: 14px; display: inline-block; text-align: center; line-height: 48px; box-shadow: ${shadows.glow};">
          <span style="color: #ffffff; font-size: 24px; font-weight: 700; font-family: ${typography.fontFamily};">T</span>
        </div>
      </td>
      <td style="vertical-align: middle;">
        <span style="font-size: 28px; font-weight: 700; color: ${colors.textPrimary}; font-family: ${typography.fontFamily}; letter-spacing: -0.5px;">Tarsit</span>
      </td>
    </tr>
  </table>
`;

/**
 * Social links footer section
 */
const socialLinks = `
  <table role="presentation" cellpadding="0" cellspacing="0" style="margin: 0 auto;">
    <tr>
      <td style="padding: 0 8px;">
        <a href="https://twitter.com/tarsit" style="display: inline-block; width: 36px; height: 36px; background: ${colors.glassBg}; border-radius: 8px; text-align: center; line-height: 36px; text-decoration: none;">
          <span style="color: ${colors.textSecondary}; font-size: 16px;">𝕏</span>
        </a>
      </td>
      <td style="padding: 0 8px;">
        <a href="https://instagram.com/tarsit" style="display: inline-block; width: 36px; height: 36px; background: ${colors.glassBg}; border-radius: 8px; text-align: center; line-height: 36px; text-decoration: none;">
          <span style="color: ${colors.textSecondary}; font-size: 16px;">📷</span>
        </a>
      </td>
      <td style="padding: 0 8px;">
        <a href="https://linkedin.com/company/tarsit" style="display: inline-block; width: 36px; height: 36px; background: ${colors.glassBg}; border-radius: 8px; text-align: center; line-height: 36px; text-decoration: none;">
          <span style="color: ${colors.textSecondary}; font-size: 16px;">in</span>
        </a>
      </td>
    </tr>
  </table>
`;

export const baseTemplate = ({ 
  previewText, 
  content, 
  footerText,
  showSocialLinks = true 
}: BaseTemplateProps): string => `
<!DOCTYPE html>
<html lang="en" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="x-apple-disable-message-reformatting">
  <meta name="color-scheme" content="dark light">
  <meta name="supported-color-schemes" content="dark light">
  <title>Tarsit</title>
  
  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:AllowPNG/>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <![endif]-->
  
  <style>
    /* Reset */
    body, table, td, p, a, li, blockquote {
      -webkit-text-size-adjust: 100%;
      -ms-text-size-adjust: 100%;
      margin: 0;
      padding: 0;
    }
    table, td {
      mso-table-lspace: 0pt;
      mso-table-rspace: 0pt;
      border-collapse: collapse;
    }
    img {
      -ms-interpolation-mode: bicubic;
      border: 0;
      height: auto;
      line-height: 100%;
      outline: none;
      text-decoration: none;
    }
    body {
      margin: 0 !important;
      padding: 0 !important;
      width: 100% !important;
      min-width: 100% !important;
      font-family: ${typography.fontFamily};
      background-color: ${colors.bgPrimary};
    }
    
    /* Dark mode support */
    :root {
      color-scheme: dark light;
      supported-color-schemes: dark light;
    }
    
    @media (prefers-color-scheme: light) {
      .dark-mode-bg { background-color: ${colors.lightBgPrimary} !important; }
      .dark-mode-card { background-color: ${colors.lightBgSecondary} !important; }
      .dark-mode-text { color: ${colors.lightTextPrimary} !important; }
      .dark-mode-text-secondary { color: ${colors.lightTextSecondary} !important; }
    }
    
    /* Responsive */
    @media only screen and (max-width: 600px) {
      .container { width: 100% !important; padding: 0 16px !important; }
      .content-padding { padding: 32px 24px !important; }
      .mobile-full { width: 100% !important; }
      .mobile-center { text-align: center !important; }
      .mobile-padding { padding-left: 16px !important; padding-right: 16px !important; }
    }
    
    /* Button hover states (for supported clients) */
    .button:hover {
      transform: translateY(-1px);
      box-shadow: ${shadows.glowStrong} !important;
    }
    
    /* Link styles */
    a {
      color: ${colors.accentLight};
      text-decoration: none;
    }
    a:hover {
      color: ${colors.accentPrimary};
    }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: ${colors.bgPrimary}; -webkit-font-smoothing: antialiased;">
  
  <!-- Preview text -->
  ${previewText ? `
  <div style="display: none; max-height: 0; overflow: hidden; mso-hide: all;">
    ${previewText}
    ${'&nbsp;'.repeat(150)}
  </div>
  ` : ''}
  
  <!-- Email wrapper -->
  <table role="presentation" class="dark-mode-bg" cellpadding="0" cellspacing="0" style="width: 100%; background-color: ${colors.bgPrimary};">
    <tr>
      <td align="center" style="padding: 48px 16px;">
        
        <!-- Container -->
        <table role="presentation" class="container" cellpadding="0" cellspacing="0" style="width: 100%; max-width: 600px;">
          
          <!-- Logo -->
          <tr>
            <td align="center" style="padding-bottom: 32px;">
              ${tarsitLogo}
            </td>
          </tr>
          
          <!-- Main content card -->
          <tr>
            <td>
              <table role="presentation" class="dark-mode-card" cellpadding="0" cellspacing="0" style="width: 100%; background: ${colors.bgSecondary}; border: 1px solid ${colors.glassBorder}; border-radius: ${borderRadius['2xl']}; overflow: hidden; box-shadow: ${shadows.lg};">
                
                <!-- Accent top border -->
                <tr>
                  <td style="height: 4px; background: ${gradients.accent};"></td>
                </tr>
                
                <!-- Content -->
                <tr>
                  <td class="content-padding" style="padding: 48px 48px 40px 48px;">
                    ${content}
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 40px 24px 0 24px;">
              
              <!-- Social links -->
              ${showSocialLinks ? `
              <table role="presentation" cellpadding="0" cellspacing="0" style="width: 100%; margin-bottom: 24px;">
                <tr>
                  <td align="center">
                    ${socialLinks}
                  </td>
                </tr>
              </table>
              ` : ''}
              
              <!-- Footer text -->
              <table role="presentation" cellpadding="0" cellspacing="0" style="width: 100%;">
                <tr>
                  <td align="center">
                    <p class="dark-mode-text-secondary" style="margin: 0 0 12px 0; font-size: ${typography.sizeSm}; color: ${colors.textMuted}; line-height: 1.5;">
                      ${footerText || 'Connecting you with amazing local businesses'}
                    </p>
                  </td>
                </tr>
                <tr>
                  <td align="center">
                    <p style="margin: 0 0 16px 0; font-size: ${typography.sizeXs}; color: ${colors.textSubtle};">
                      © ${new Date().getFullYear()} Tarsit. All rights reserved.
                    </p>
                  </td>
                </tr>
                <tr>
                  <td align="center">
                    <table role="presentation" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding: 0 12px;">
                          <a href="https://tarsit.com" style="color: ${colors.accentLight}; font-size: ${typography.sizeXs}; text-decoration: none;">Website</a>
                        </td>
                        <td style="color: ${colors.textSubtle}; font-size: ${typography.sizeXs};">•</td>
                        <td style="padding: 0 12px;">
                          <a href="https://tarsit.com/help" style="color: ${colors.accentLight}; font-size: ${typography.sizeXs}; text-decoration: none;">Help Center</a>
                        </td>
                        <td style="color: ${colors.textSubtle}; font-size: ${typography.sizeXs};">•</td>
                        <td style="padding: 0 12px;">
                          <a href="https://tarsit.com/privacy" style="color: ${colors.accentLight}; font-size: ${typography.sizeXs}; text-decoration: none;">Privacy</a>
                        </td>
                        <td style="color: ${colors.textSubtle}; font-size: ${typography.sizeXs};">•</td>
                        <td style="padding: 0 12px;">
                          <a href="https://tarsit.com/unsubscribe" style="color: ${colors.accentLight}; font-size: ${typography.sizeXs}; text-decoration: none;">Unsubscribe</a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * EMAIL COMPONENTS
 * ═══════════════════════════════════════════════════════════════════════════════
 * Reusable UI components for building email content
 */

export const emailComponents = {
  
  /**
   * Primary CTA button with glow effect
   */
  button: (text: string, href: string, fullWidth = false): string => `
    <table role="presentation" cellpadding="0" cellspacing="0" style="width: ${fullWidth ? '100%' : 'auto'}; margin: 24px 0;">
      <tr>
        <td align="center">
          <a href="${href}" class="button" style="display: inline-block; background: ${gradients.accent}; color: #ffffff; font-size: ${typography.sizeLg}; font-weight: ${typography.weightSemibold}; text-decoration: none; padding: 16px 40px; border-radius: ${borderRadius.xl}; box-shadow: ${shadows.button}; font-family: ${typography.fontFamily};">
            ${text}
          </a>
        </td>
      </tr>
    </table>
  `,

  /**
   * Secondary/ghost button
   */
  secondaryButton: (text: string, href: string): string => `
    <table role="presentation" cellpadding="0" cellspacing="0" style="width: auto; margin: 16px 0;">
      <tr>
        <td align="center">
          <a href="${href}" style="display: inline-block; background: ${colors.glassBg}; color: ${colors.textPrimary}; font-size: ${typography.sizeSm}; font-weight: ${typography.weightMedium}; text-decoration: none; padding: 12px 24px; border-radius: ${borderRadius.lg}; border: 1px solid ${colors.glassBorder}; font-family: ${typography.fontFamily};">
            ${text}
          </a>
        </td>
      </tr>
    </table>
  `,

  /**
   * Main heading (h1)
   */
  heading: (text: string, emoji?: string): string => `
    <h1 class="dark-mode-text" style="margin: 0 0 8px 0; color: ${colors.textPrimary}; font-size: ${typography.size3xl}; font-weight: ${typography.weightBold}; line-height: ${typography.lineHeightTight}; font-family: ${typography.fontFamily};">
      ${text} ${emoji ? `<span style="font-size: ${typography.size2xl};">${emoji}</span>` : ''}
    </h1>
  `,

  /**
   * Subheading (h2)
   */
  subheading: (text: string): string => `
    <h2 class="dark-mode-text" style="margin: 24px 0 8px 0; color: ${colors.textPrimary}; font-size: ${typography.sizeXl}; font-weight: ${typography.weightSemibold}; line-height: ${typography.lineHeightTight}; font-family: ${typography.fontFamily};">
      ${text}
    </h2>
  `,

  /**
   * Paragraph text
   */
  text: (content: string, muted = false): string => `
    <p class="${muted ? 'dark-mode-text-secondary' : 'dark-mode-text'}" style="margin: 0 0 16px 0; color: ${muted ? colors.textSecondary : colors.textPrimary}; font-size: ${typography.sizeBase}; line-height: ${typography.lineHeightRelaxed}; font-family: ${typography.fontFamily};">
      ${content}
    </p>
  `,

  /**
   * Small/muted text
   */
  smallText: (content: string): string => `
    <p class="dark-mode-text-secondary" style="margin: 0 0 12px 0; color: ${colors.textMuted}; font-size: ${typography.sizeSm}; line-height: ${typography.lineHeightNormal}; font-family: ${typography.fontFamily};">
      ${content}
    </p>
  `,

  /**
   * Alert/info box with icon indicator
   */
  infoBox: (content: string, type: 'info' | 'warning' | 'success' | 'error' = 'info'): string => {
    const styles = {
      info: { bg: colors.infoMuted, border: colors.info, icon: 'ℹ️' },
      warning: { bg: colors.warningMuted, border: colors.warning, icon: '⚠️' },
      success: { bg: colors.successMuted, border: colors.success, icon: '✅' },
      error: { bg: colors.errorMuted, border: colors.error, icon: '❌' },
    };
    const s = styles[type];
    return `
      <table role="presentation" cellpadding="0" cellspacing="0" style="width: 100%; margin: 24px 0;">
        <tr>
          <td style="background: ${s.bg}; border-left: 4px solid ${s.border}; padding: 16px 20px; border-radius: ${borderRadius.lg};">
            <table role="presentation" cellpadding="0" cellspacing="0">
              <tr>
                <td style="vertical-align: top; padding-right: 12px; font-size: 18px;">${s.icon}</td>
                <td>
                  <p class="dark-mode-text" style="margin: 0; color: ${colors.textPrimary}; font-size: ${typography.sizeSm}; line-height: ${typography.lineHeightRelaxed}; font-family: ${typography.fontFamily};">
                    ${content}
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    `;
  },

  /**
   * Glass-style card for highlighting info
   */
  glassCard: (content: string): string => `
    <table role="presentation" cellpadding="0" cellspacing="0" style="width: 100%; margin: 24px 0;">
      <tr>
        <td style="background: ${colors.bgTertiary}; border: 1px solid ${colors.glassBorder}; padding: 24px; border-radius: ${borderRadius.xl};">
          ${content}
        </td>
      </tr>
    </table>
  `,

  /**
   * Detail row for appointment/order info
   */
  detailRow: (label: string, value: string, icon?: string): string => `
    <table role="presentation" cellpadding="0" cellspacing="0" style="width: 100%; margin-bottom: 16px;">
      <tr>
        <td style="vertical-align: top; width: 24px; padding-right: 12px;">
          ${icon ? `<span style="font-size: 16px;">${icon}</span>` : ''}
        </td>
        <td>
          <p style="margin: 0 0 2px 0; color: ${colors.textMuted}; font-size: ${typography.sizeXs}; text-transform: uppercase; letter-spacing: 0.5px; font-weight: ${typography.weightMedium}; font-family: ${typography.fontFamily};">
            ${label}
          </p>
          <p class="dark-mode-text" style="margin: 0; color: ${colors.textPrimary}; font-size: ${typography.sizeBase}; font-weight: ${typography.weightMedium}; font-family: ${typography.fontFamily};">
            ${value}
          </p>
        </td>
      </tr>
    </table>
  `,

  /**
   * Divider line
   */
  divider: (): string => `
    <table role="presentation" cellpadding="0" cellspacing="0" style="width: 100%; margin: 24px 0;">
      <tr>
        <td style="border-top: 1px solid ${colors.glassBorder};"></td>
      </tr>
    </table>
  `,

  /**
   * Code/token display (for OTP, verification codes)
   */
  code: (text: string): string => `
    <table role="presentation" cellpadding="0" cellspacing="0" style="width: 100%; margin: 24px 0;">
      <tr>
        <td align="center">
          <div style="display: inline-block; background: ${colors.bgTertiary}; border: 1px solid ${colors.glassBorder}; padding: 20px 40px; border-radius: ${borderRadius.xl};">
            <span style="font-family: ${typography.fontFamilyMono}; font-size: 32px; font-weight: ${typography.weightBold}; letter-spacing: 8px; color: ${colors.accentPrimary};">
              ${text}
            </span>
          </div>
        </td>
      </tr>
    </table>
  `,

  /**
   * Feature list with checkmarks
   */
  featureList: (items: string[]): string => `
    <table role="presentation" cellpadding="0" cellspacing="0" style="width: 100%; margin: 20px 0;">
      ${items.map(item => `
        <tr>
          <td style="padding: 8px 0; vertical-align: top; width: 28px;">
            <span style="color: ${colors.success}; font-size: 16px;">✓</span>
          </td>
          <td class="dark-mode-text" style="padding: 8px 0; padding-left: 8px; color: ${colors.textPrimary}; font-size: ${typography.sizeSm}; line-height: ${typography.lineHeightNormal}; font-family: ${typography.fontFamily};">
            ${item}
          </td>
        </tr>
      `).join('')}
    </table>
  `,

  /**
   * Accent-colored link text
   */
  link: (text: string, href: string): string => `
    <a href="${href}" style="color: ${colors.accentLight}; text-decoration: none; font-weight: ${typography.weightMedium};">${text}</a>
  `,

  /**
   * Spacer
   */
  spacer: (height: string = spacing.xl): string => `
    <table role="presentation" cellpadding="0" cellspacing="0" style="width: 100%;">
      <tr>
        <td style="height: ${height};"></td>
      </tr>
    </table>
  `,

  /**
   * Image with border radius
   */
  image: (src: string, alt: string, width = '100%'): string => `
    <table role="presentation" cellpadding="0" cellspacing="0" style="width: 100%; margin: 16px 0;">
      <tr>
        <td>
          <img src="${src}" alt="${alt}" style="width: ${width}; height: auto; border-radius: ${borderRadius.lg}; display: block;" />
        </td>
      </tr>
    </table>
  `,
};
