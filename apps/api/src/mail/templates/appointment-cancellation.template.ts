/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * APPOINTMENT CANCELLATION EMAIL TEMPLATE
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * Sent when an appointment has been cancelled.
 * Uses the Tarsit design system for consistent branding.
 * ═══════════════════════════════════════════════════════════════════════════════
 */

import { baseTemplate, emailComponents } from './base.template';
import { borderRadius, colors, icons, typography } from './design-system';

const { button, text, heading, divider, glassCard } = emailComponents;

export interface AppointmentCancellationProps {
  firstName: string;
  businessName: string;
  serviceName: string;
  appointmentDate: Date;
  canceledBy: 'customer' | 'business';
  reason?: string;
  rebookUrl: string;
}

export const appointmentCancellationTemplate = ({
  firstName,
  businessName,
  serviceName,
  appointmentDate,
  canceledBy,
  reason,
  rebookUrl,
}: AppointmentCancellationProps): string => {
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

  const content = `
    <!-- Hero section with X icon -->
    <table role="presentation" cellpadding="0" cellspacing="0" style="width: 100%; margin-bottom: 24px;">
      <tr>
        <td align="center">
          <div style="width: 80px; height: 80px; background: ${colors.errorMuted}; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 16px;">
            ${icons.x(colors.error, 40)}
          </div>
        </td>
      </tr>
    </table>
    
    ${heading('Appointment Cancelled')}
    
    ${text(`Hi ${firstName},`)}
    
    ${text(`Your appointment with <strong>${businessName}</strong> has been cancelled${canceledBy === 'business' ? ' by the business' : ''}.`)}
    
    <!-- Cancellation details card -->
    <table role="presentation" cellpadding="0" cellspacing="0" style="width: 100%; margin: 24px 0; background: ${colors.errorMuted}; border-left: 4px solid ${colors.error}; border-radius: ${borderRadius.lg};">
      <tr>
        <td style="padding: 24px;">
          <table role="presentation" cellpadding="0" cellspacing="0" style="width: 100%;">
            <tr>
              <td style="padding: 8px 0; border-bottom: 1px solid rgba(239, 68, 68, 0.2);">
                <p style="margin: 0 0 4px 0; color: ${colors.error}; font-size: ${typography.sizeXs}; text-transform: uppercase; letter-spacing: 0.5px; font-weight: ${typography.weightSemibold}; font-family: ${typography.fontFamily};">
                  Service
                </p>
                <p style="margin: 0; color: ${colors.textPrimary}; font-size: ${typography.sizeBase}; font-family: ${typography.fontFamily};">
                  ${serviceName}
                </p>
              </td>
            </tr>
            <tr>
              <td style="padding: 8px 0; ${reason ? `border-bottom: 1px solid rgba(239, 68, 68, 0.2);` : ''}">
                <p style="margin: 0 0 4px 0; color: ${colors.error}; font-size: ${typography.sizeXs}; text-transform: uppercase; letter-spacing: 0.5px; font-weight: ${typography.weightSemibold}; font-family: ${typography.fontFamily};">
                  Originally Scheduled
                </p>
                <p style="margin: 0; color: ${colors.textPrimary}; font-size: ${typography.sizeBase}; font-family: ${typography.fontFamily};">
                  ${formattedDate} at ${formattedTime}
                </p>
              </td>
            </tr>
            ${reason ? `
            <tr>
              <td style="padding: 8px 0;">
                <p style="margin: 0 0 4px 0; color: ${colors.error}; font-size: ${typography.sizeXs}; text-transform: uppercase; letter-spacing: 0.5px; font-weight: ${typography.weightSemibold}; font-family: ${typography.fontFamily};">
                  Reason
                </p>
                <p style="margin: 0; color: ${colors.textSecondary}; font-size: ${typography.sizeSm}; font-family: ${typography.fontFamily};">
                  ${reason}
                </p>
              </td>
            </tr>
            ` : ''}
          </table>
        </td>
      </tr>
    </table>
    
    ${divider()}
    
    ${text("We're sorry for any inconvenience. Would you like to book another appointment?")}
    
    ${button('Book Another Appointment', rebookUrl, true)}
  `;

  return baseTemplate({
    previewText: `Your appointment with ${businessName} has been cancelled`,
    content,
    footerText: 'We hope to see you again soon!',
  });
};

export const appointmentCancellationSubject = (businessName: string) =>
  `Appointment Cancelled - ${businessName}`;
