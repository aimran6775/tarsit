/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * REVIEW NOTIFICATION EMAIL TEMPLATE
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * Sent to business owners when they receive a new review.
 * Uses the Tarsit design system for consistent branding.
 * ═══════════════════════════════════════════════════════════════════════════════
 */

import { baseTemplate, emailComponents } from './base.template';
import { borderRadius, colors, icons, typography } from './design-system';

const { button, text, heading, glassCard, divider } = emailComponents;

export interface ReviewNotificationProps {
  businessOwnerName: string;
  businessName: string;
  reviewerName: string;
  rating: number;
  reviewText?: string;
  reviewUrl: string;
}

export const reviewNotificationTemplate = ({
  businessOwnerName,
  businessName,
  reviewerName,
  rating,
  reviewText,
  reviewUrl,
}: ReviewNotificationProps): string => {
  // Generate star display using SVG icons
  const starDisplay = Array.from({ length: 5 }, (_, i) => {
    const isFilled = i < rating;
    return `<td style="padding: 0 2px;">${icons.star(isFilled ? '#fbbf24' : 'rgba(255, 255, 255, 0.2)', 28)}</td>`;
  }).join('');

  const content = `
    <!-- Hero section with star icon -->
    <table role="presentation" cellpadding="0" cellspacing="0" style="width: 100%; margin-bottom: 24px;">
      <tr>
        <td align="center">
          <div style="width: 80px; height: 80px; background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%); border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 16px; box-shadow: 0 0 30px rgba(251, 191, 36, 0.4);">
            ${icons.star('#ffffff', 40)}
          </div>
        </td>
      </tr>
    </table>
    
    ${heading('New Review Received')}
    
    ${text(`Hi ${businessOwnerName},`)}
    
    ${text(`Great news! <strong>${reviewerName}</strong> just left a review for <strong>${businessName}</strong>.`)}
    
    <!-- Star rating display -->
    ${glassCard(`
      <table role="presentation" cellpadding="0" cellspacing="0" style="width: 100%;">
        <tr>
          <td align="center" style="padding: 16px 0;">
            <table role="presentation" cellpadding="0" cellspacing="0">
              <tr>
                ${starDisplay}
              </tr>
            </table>
            <p style="margin: 12px 0 0 0; color: ${colors.textMuted}; font-size: ${typography.sizeSm}; font-family: ${typography.fontFamily};">
              ${rating} out of 5 stars
            </p>
          </td>
        </tr>
      </table>
    `)}
    
    ${reviewText ? `
      <table role="presentation" cellpadding="0" cellspacing="0" style="width: 100%; margin: 16px 0;">
        <tr>
          <td style="background: ${colors.glassBackground}; border: 1px solid ${colors.glassBorder}; border-left: 4px solid ${colors.accent}; padding: 20px 24px; border-radius: ${borderRadius.lg};">
            <table role="presentation" cellpadding="0" cellspacing="0" style="width: 100%;">
              <tr>
                <td style="width: 24px; vertical-align: top; padding-top: 2px;">
                  ${icons.message(colors.accent, 18)}
                </td>
                <td>
                  <p style="margin: 0; font-style: italic; color: ${colors.textSecondary}; font-size: ${typography.sizeBase}; line-height: 1.6; font-family: ${typography.fontFamily};">
                    "${reviewText}"
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    ` : ''}
    
    ${button('View & Respond', reviewUrl, true)}
    
    ${text('Responding to reviews helps build trust with potential customers and shows you value feedback.', true)}
  `;

  return baseTemplate({
    previewText: `${reviewerName} left a ${rating}-star review for ${businessName}`,
    content,
  });
};

export const reviewNotificationSubject = (rating: number) =>
  `New ${rating}-Star Review for Your Business`;
