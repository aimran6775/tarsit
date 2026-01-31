/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * APPOINTMENT STATUS EMAIL TEMPLATE
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * Sent when an appointment status changes (confirmed, completed).
 * Uses the Tarsit design system for consistent branding.
 * ═══════════════════════════════════════════════════════════════════════════════
 */

import { baseTemplate, emailComponents } from './base.template';
import { colors, icons, typography } from './design-system';

const { button, text, heading, glassCard, divider } = emailComponents;

export interface AppointmentStatusProps {
  firstName: string;
  businessName: string;
  serviceName: string;
  appointmentDate: Date;
  status: 'CONFIRMED' | 'COMPLETED';
  reviewUrl?: string;
}

export const appointmentStatusTemplate = ({
  firstName,
  businessName,
  serviceName,
  appointmentDate,
  status,
  reviewUrl,
}: AppointmentStatusProps): string => {
  const formattedDate = appointmentDate.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const formattedTime = appointmentDate.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });

  const isConfirmed = status === 'CONFIRMED';
  const statusText = isConfirmed ? 'Confirmed' : 'Completed';
  const heroIcon = isConfirmed ? icons.checkCircle('#ffffff', 40) : icons.celebration('#ffffff', 40);
  const heroGlow = isConfirmed
    ? '0 0 30px rgba(16, 185, 129, 0.4)'
    : '0 0 30px rgba(168, 85, 247, 0.4)';
  const heroBg = isConfirmed
    ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
    : colors.gradientPrimary;

  const content = `
    <!-- Hero section with status icon -->
    <table role="presentation" cellpadding="0" cellspacing="0" style="width: 100%; margin-bottom: 24px;">
      <tr>
        <td align="center">
          <div style="width: 80px; height: 80px; background: ${heroBg}; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 16px; box-shadow: ${heroGlow};">
            ${heroIcon}
          </div>
        </td>
      </tr>
    </table>
    
    ${heading(`Appointment ${statusText}`)}
    
    ${text(`Hi ${firstName},`)}
    
    ${text(isConfirmed
      ? `Great news! Your appointment with <strong>${businessName}</strong> has been confirmed.`
      : `Your appointment with <strong>${businessName}</strong> is now complete!`
    )}
    
    <!-- Appointment details card -->
    ${glassCard(`
      <table role="presentation" cellpadding="0" cellspacing="0" style="width: 100%;">
        <tr>
          <td style="padding: 8px 0; border-bottom: 1px solid ${colors.glassBorder};">
            <table role="presentation" cellpadding="0" cellspacing="0" style="width: 100%;">
              <tr>
                <td style="width: 32px; vertical-align: top; padding-top: 2px;">
                  ${icons.sparkles(colors.accent, 20)}
                </td>
                <td>
                  <p style="margin: 0 0 4px 0; color: ${colors.accent}; font-size: ${typography.sizeXs}; text-transform: uppercase; letter-spacing: 0.5px; font-weight: ${typography.weightSemibold}; font-family: ${typography.fontFamily};">
                    Service
                  </p>
                  <p style="margin: 0; color: ${colors.textPrimary}; font-size: ${typography.sizeBase}; font-family: ${typography.fontFamily};">
                    ${serviceName}
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
        <tr>
          <td style="padding: 8px 0;">
            <table role="presentation" cellpadding="0" cellspacing="0" style="width: 100%;">
              <tr>
                <td style="width: 32px; vertical-align: top; padding-top: 2px;">
                  ${icons.calendar(colors.accent, 20)}
                </td>
                <td>
                  <p style="margin: 0 0 4px 0; color: ${colors.accent}; font-size: ${typography.sizeXs}; text-transform: uppercase; letter-spacing: 0.5px; font-weight: ${typography.weightSemibold}; font-family: ${typography.fontFamily};">
                    Date & Time
                  </p>
                  <p style="margin: 0; color: ${colors.textPrimary}; font-size: ${typography.sizeBase}; font-family: ${typography.fontFamily};">
                    ${formattedDate} at ${formattedTime}
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    `)}
    
    ${!isConfirmed && reviewUrl ? `
      ${divider()}
      ${text("We hope you had a great experience! Would you mind taking a moment to share your feedback?")}
      ${button('Leave a Review', reviewUrl, true)}
    ` : ''}
    
    ${isConfirmed ? text("We look forward to seeing you!", true) : ''}
  `;

  return baseTemplate({
    previewText: `Your appointment with ${businessName} has been ${statusText.toLowerCase()}`,
    content,
    footerText: !isConfirmed ? 'Thank you for choosing Tarsit!' : undefined,
  });
};

export const appointmentStatusSubject = (businessName: string, status: 'CONFIRMED' | 'COMPLETED') =>
  `Appointment ${status === 'CONFIRMED' ? 'Confirmed' : 'Completed'} - ${businessName}`;
