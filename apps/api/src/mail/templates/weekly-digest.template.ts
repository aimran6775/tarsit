/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * WEEKLY DIGEST EMAIL TEMPLATE
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * Sent to business owners with a summary of their weekly activity.
 * Uses the Tarsit design system for consistent branding.
 * ═══════════════════════════════════════════════════════════════════════════════
 */

import { baseTemplate, emailComponents } from './base.template';
import { borderRadius, colors, gradients, icons, typography } from './design-system';

const { button, text, heading, glassCard, divider } = emailComponents;

export interface WeeklyDigestStats {
  newAppointments: number;
  completedAppointments: number;
  cancelledAppointments: number;
  newReviews: number;
  averageRating: number;
  profileViews: number;
  newMessages: number;
}

export interface WeeklyDigestProps {
  businessOwnerName: string;
  businessName: string;
  weekStart: Date;
  weekEnd: Date;
  stats: WeeklyDigestStats;
  topReview?: {
    reviewerName: string;
    rating: number;
    text: string;
  };
  dashboardUrl: string;
}

const formatStat = (value: number, label: string, icon: string) => `
  <td style="text-align: center; padding: 16px 8px;">
    <div style="margin-bottom: 8px;">${icon}</div>
    <p style="margin: 0; font-size: ${typography.size2xl}; font-weight: ${typography.weightBold}; color: ${colors.textPrimary}; font-family: ${typography.fontFamily};">
      ${value}
    </p>
    <p style="margin: 4px 0 0 0; font-size: ${typography.sizeXs}; color: ${colors.textMuted}; text-transform: uppercase; letter-spacing: 0.5px; font-family: ${typography.fontFamily};">
      ${label}
    </p>
  </td>
`;

export const weeklyDigestTemplate = ({
  businessOwnerName,
  businessName,
  weekStart,
  weekEnd,
  stats,
  topReview,
  dashboardUrl,
}: WeeklyDigestProps): string => {
  const formatDate = (date: Date) =>
    date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

  const starDisplay = topReview
    ? Array.from({ length: 5 }, (_, i) => {
        const isFilled = i < topReview.rating;
        return icons.star(isFilled ? '#fbbf24' : 'rgba(255, 255, 255, 0.2)', 16);
      }).join('')
    : '';

  const content = `
    <!-- Hero section with sparkles icon -->
    <table role="presentation" cellpadding="0" cellspacing="0" style="width: 100%; margin-bottom: 24px;">
      <tr>
        <td align="center">
          <div style="width: 80px; height: 80px; background: ${gradients.accent}; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 16px; box-shadow: 0 0 30px rgba(168, 85, 247, 0.4);">
            ${icons.sparkles('#ffffff', 40)}
          </div>
        </td>
      </tr>
    </table>
    
    ${heading('Your Weekly Summary')}
    
    ${text(`Hi ${businessOwnerName},`)}
    
    ${text(`Here's how <strong>${businessName}</strong> performed from ${formatDate(weekStart)} to ${formatDate(weekEnd)}.`)}
    
    <!-- Stats grid -->
    ${glassCard(`
      <table role="presentation" cellpadding="0" cellspacing="0" style="width: 100%;">
        <tr>
          ${formatStat(stats.newAppointments, 'New Bookings', icons.calendar(colors.accent, 24))}
          ${formatStat(stats.completedAppointments, 'Completed', icons.checkCircle('#10b981', 24))}
          ${formatStat(stats.profileViews, 'Profile Views', icons.user(colors.accent, 24))}
        </tr>
      </table>
    `)}
    
    <!-- Secondary stats -->
    <table role="presentation" cellpadding="0" cellspacing="0" style="width: 100%; margin-top: 16px;">
      <tr>
        <td style="width: 50%; padding-right: 8px;">
          <table role="presentation" cellpadding="0" cellspacing="0" style="width: 100%; background: ${colors.glassBg}; border: 1px solid ${colors.glassBorder}; border-radius: ${borderRadius.lg};">
            <tr>
              <td style="padding: 16px; text-align: center;">
                <p style="margin: 0 0 4px 0; font-size: ${typography.sizeLg}; font-weight: ${typography.weightBold}; color: ${colors.textPrimary}; font-family: ${typography.fontFamily};">
                  ${stats.newReviews}
                </p>
                <p style="margin: 0; font-size: ${typography.sizeXs}; color: ${colors.textMuted}; text-transform: uppercase; font-family: ${typography.fontFamily};">
                  New Reviews
                </p>
              </td>
            </tr>
          </table>
        </td>
        <td style="width: 50%; padding-left: 8px;">
          <table role="presentation" cellpadding="0" cellspacing="0" style="width: 100%; background: ${colors.glassBg}; border: 1px solid ${colors.glassBorder}; border-radius: ${borderRadius.lg};">
            <tr>
              <td style="padding: 16px; text-align: center;">
                <p style="margin: 0 0 4px 0; font-size: ${typography.sizeLg}; font-weight: ${typography.weightBold}; color: ${colors.textPrimary}; font-family: ${typography.fontFamily};">
                  ${stats.averageRating > 0 ? stats.averageRating.toFixed(1) : '--'}
                </p>
                <p style="margin: 0; font-size: ${typography.sizeXs}; color: ${colors.textMuted}; text-transform: uppercase; font-family: ${typography.fontFamily};">
                  Avg Rating
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
    
    ${topReview ? `
      ${divider()}
      
      <p style="margin: 0 0 12px 0; color: ${colors.accent}; font-size: ${typography.sizeXs}; text-transform: uppercase; letter-spacing: 0.5px; font-weight: ${typography.weightSemibold}; font-family: ${typography.fontFamily};">
        Top Review This Week
      </p>
      
      <table role="presentation" cellpadding="0" cellspacing="0" style="width: 100%; background: ${colors.glassBg}; border: 1px solid ${colors.glassBorder}; border-radius: ${borderRadius.lg};">
        <tr>
          <td style="padding: 20px;">
            <div style="margin-bottom: 8px;">
              ${starDisplay}
            </div>
            <p style="margin: 0 0 8px 0; font-style: italic; color: ${colors.textSecondary}; font-size: ${typography.sizeSm}; line-height: 1.6; font-family: ${typography.fontFamily};">
              "${topReview.text}"
            </p>
            <p style="margin: 0; color: ${colors.textMuted}; font-size: ${typography.sizeXs}; font-family: ${typography.fontFamily};">
              — ${topReview.reviewerName}
            </p>
          </td>
        </tr>
      </table>
    ` : ''}
    
    ${divider()}
    
    ${button('View Full Analytics', dashboardUrl, true)}
    
    ${text("Keep up the great work! We're here to help you grow.", true)}
  `;

  return baseTemplate({
    previewText: `${businessName} Weekly Summary: ${stats.newAppointments} new bookings, ${stats.newReviews} reviews`,
    content,
  });
};

export const weeklyDigestSubject = (businessName: string) =>
  `${businessName} - Your Weekly Business Summary`;
