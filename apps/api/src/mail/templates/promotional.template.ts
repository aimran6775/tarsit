/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * PROMOTIONAL EMAIL TEMPLATE
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * Used by businesses to send promotional emails to their customers.
 * Supports announcements, offers, and general marketing.
 * Uses the Tarsit design system for consistent branding.
 * ═══════════════════════════════════════════════════════════════════════════════
 */

import { baseTemplate, emailComponents } from './base.template';
import { borderRadius, colors, gradients, icons, typography } from './design-system';

const { button, text, heading, glassCard, divider } = emailComponents;

export type PromotionType = 'announcement' | 'offer' | 'event' | 'newsletter';

export interface PromotionalEmailProps {
  recipientName: string;
  businessName: string;
  businessLogo?: string;
  promotionType: PromotionType;
  title: string;
  subtitle?: string;
  bodyContent: string;
  ctaText: string;
  ctaUrl: string;
  expiresAt?: Date;
  discountCode?: string;
  imageUrl?: string;
  unsubscribeUrl: string;
}

const promotionConfig: Record<
  PromotionType,
  { icon: (color: string, size: number) => string; gradient: string }
> = {
  announcement: {
    icon: icons.sparkles,
    gradient: gradients.accent,
  },
  offer: {
    icon: icons.star,
    gradient: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
  },
  event: {
    icon: icons.calendar,
    gradient: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
  },
  newsletter: {
    icon: icons.mail,
    gradient: gradients.accent,
  },
};

export const promotionalEmailTemplate = ({
  recipientName,
  businessName,
  businessLogo,
  promotionType,
  title,
  subtitle,
  bodyContent,
  ctaText,
  ctaUrl,
  expiresAt,
  discountCode,
  imageUrl,
  unsubscribeUrl,
}: PromotionalEmailProps): string => {
  const config = promotionConfig[promotionType];
  const formattedExpiry = expiresAt
    ? expiresAt.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : null;

  const content = `
    <!-- Business header -->
    ${businessLogo ? `
    <table role="presentation" cellpadding="0" cellspacing="0" style="width: 100%; margin-bottom: 24px;">
      <tr>
        <td align="center">
          <img src="${businessLogo}" alt="${businessName}" style="max-height: 60px; max-width: 200px;" />
        </td>
      </tr>
    </table>
    ` : ''}
    
    <!-- Hero section -->
    <table role="presentation" cellpadding="0" cellspacing="0" style="width: 100%; margin-bottom: 24px;">
      <tr>
        <td align="center">
          <div style="width: 80px; height: 80px; background: ${config.gradient}; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 16px; box-shadow: 0 0 30px rgba(168, 85, 247, 0.4);">
            ${config.icon('#ffffff', 40)}
          </div>
        </td>
      </tr>
    </table>
    
    ${heading(title)}
    
    ${subtitle ? `
    <p style="margin: 0 0 24px 0; text-align: center; color: ${colors.textSecondary}; font-size: ${typography.sizeLg}; font-family: ${typography.fontFamily};">
      ${subtitle}
    </p>
    ` : ''}
    
    ${text(`Hi ${recipientName},`)}
    
    <!-- Main content -->
    <div style="color: ${colors.textSecondary}; font-size: ${typography.sizeBase}; line-height: 1.7; font-family: ${typography.fontFamily}; margin: 16px 0;">
      ${bodyContent}
    </div>
    
    ${imageUrl ? `
    <table role="presentation" cellpadding="0" cellspacing="0" style="width: 100%; margin: 24px 0;">
      <tr>
        <td>
          <img src="${imageUrl}" alt="Promotion" style="width: 100%; max-width: 100%; height: auto; border-radius: ${borderRadius.lg}; border: 1px solid ${colors.glassBorder};" />
        </td>
      </tr>
    </table>
    ` : ''}
    
    ${discountCode ? `
    ${glassCard(`
      <table role="presentation" cellpadding="0" cellspacing="0" style="width: 100%;">
        <tr>
          <td align="center" style="padding: 16px;">
            <p style="margin: 0 0 8px 0; color: ${colors.accent}; font-size: ${typography.sizeXs}; text-transform: uppercase; letter-spacing: 0.5px; font-weight: ${typography.weightSemibold}; font-family: ${typography.fontFamily};">
              Your Discount Code
            </p>
            <div style="background: ${colors.bgTertiary}; border: 2px dashed ${colors.accent}; border-radius: ${borderRadius.lg}; padding: 16px 32px; display: inline-block;">
              <p style="margin: 0; font-size: ${typography.size2xl}; font-weight: ${typography.weightBold}; color: ${colors.textPrimary}; font-family: monospace; letter-spacing: 4px;">
                ${discountCode}
              </p>
            </div>
            ${formattedExpiry ? `
            <p style="margin: 12px 0 0 0; color: ${colors.textMuted}; font-size: ${typography.sizeSm}; font-family: ${typography.fontFamily};">
              ${icons.clock(colors.warning, 14)} Expires: ${formattedExpiry}
            </p>
            ` : ''}
          </td>
        </tr>
      </table>
    `)}
    ` : ''}
    
    ${formattedExpiry && !discountCode ? `
    <table role="presentation" cellpadding="0" cellspacing="0" style="width: 100%; margin: 16px 0;">
      <tr>
        <td align="center">
          <p style="margin: 0; color: ${colors.warning}; font-size: ${typography.sizeSm}; font-family: ${typography.fontFamily};">
            ${icons.clock(colors.warning, 14)} Offer expires: ${formattedExpiry}
          </p>
        </td>
      </tr>
    </table>
    ` : ''}
    
    ${button(ctaText, ctaUrl, true)}
    
    ${divider()}
    
    <p style="margin: 0; text-align: center; color: ${colors.textMuted}; font-size: ${typography.sizeXs}; font-family: ${typography.fontFamily};">
      This email was sent by <strong>${businessName}</strong> via tarsit.<br />
      <a href="${unsubscribeUrl}" style="color: ${colors.accent}; text-decoration: none;">Unsubscribe</a> from emails by this business.
    </p>
  `;

  return baseTemplate({
    previewText: `${businessName}: ${title}`,
    content,
    footerText: `Sent by ${businessName}`,
  });
};

export const promotionalEmailSubject = (businessName: string, title: string) =>
  `${businessName}: ${title}`;
