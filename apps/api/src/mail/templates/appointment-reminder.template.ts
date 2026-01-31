/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * APPOINTMENT REMINDER EMAIL TEMPLATE
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * Sent as a reminder before an upcoming appointment.
 * Uses the Tarsit design system for consistent branding.
 * ═══════════════════════════════════════════════════════════════════════════════
 */

import { baseTemplate, emailComponents } from './base.template';
import { colors, icons, typography } from './design-system';

const { button, text, heading, infoBox, glassCard } = emailComponents;

export interface AppointmentReminderProps {
  firstName: string;
  businessName: string;
  serviceName: string;
  appointmentDate: Date;
  businessAddress: string;
  businessPhone?: string;
  appointmentUrl: string;
}

export const appointmentReminderTemplate = ({
  firstName,
  businessName,
  serviceName,
  appointmentDate,
  businessAddress,
  businessPhone,
  appointmentUrl,
}: AppointmentReminderProps): string => {
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
    <!-- Hero section with clock icon -->
    <table role="presentation" cellpadding="0" cellspacing="0" style="width: 100%; margin-bottom: 24px;">
      <tr>
        <td align="center">
          <div style="width: 80px; height: 80px; background: ${colors.gradientPrimary}; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 16px; box-shadow: 0 0 30px rgba(168, 85, 247, 0.4);">
            ${icons.clock('#ffffff', 40)}
          </div>
        </td>
      </tr>
    </table>
    
    ${heading('Appointment Tomorrow')}
    
    ${text(`Hi ${firstName},`)}
    
    ${text(`This is a friendly reminder about your upcoming appointment!`)}
    
    <!-- Appointment details card -->
    ${glassCard(`
      <table role="presentation" cellpadding="0" cellspacing="0" style="width: 100%;">
        <tr>
          <td style="padding: 8px 0; border-bottom: 1px solid ${colors.glassBorder};">
            <table role="presentation" cellpadding="0" cellspacing="0" style="width: 100%;">
              <tr>
                <td style="width: 32px; vertical-align: top; padding-top: 2px;">
                  ${icons.diamond(colors.accent, 20)}
                </td>
                <td>
                  <p style="margin: 0 0 4px 0; color: ${colors.accent}; font-size: ${typography.sizeXs}; text-transform: uppercase; letter-spacing: 0.5px; font-weight: ${typography.weightSemibold}; font-family: ${typography.fontFamily};">
                    Business
                  </p>
                  <p style="margin: 0; color: ${colors.textPrimary}; font-size: ${typography.sizeLg}; font-weight: ${typography.weightSemibold}; font-family: ${typography.fontFamily};">
                    ${businessName}
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
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
          <td style="padding: 8px 0; border-bottom: 1px solid ${colors.glassBorder};">
            <table role="presentation" cellpadding="0" cellspacing="0" style="width: 100%;">
              <tr>
                <td style="width: 32px; vertical-align: top; padding-top: 2px;">
                  ${icons.calendar(colors.accent, 20)}
                </td>
                <td>
                  <p style="margin: 0 0 4px 0; color: ${colors.accent}; font-size: ${typography.sizeXs}; text-transform: uppercase; letter-spacing: 0.5px; font-weight: ${typography.weightSemibold}; font-family: ${typography.fontFamily};">
                    When
                  </p>
                  <p style="margin: 0; color: ${colors.textPrimary}; font-size: ${typography.sizeBase}; font-family: ${typography.fontFamily};">
                    ${formattedDate} at ${formattedTime}
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
        <tr>
          <td style="padding: 8px 0; ${businessPhone ? `border-bottom: 1px solid ${colors.glassBorder};` : ''}">
            <table role="presentation" cellpadding="0" cellspacing="0" style="width: 100%;">
              <tr>
                <td style="width: 32px; vertical-align: top; padding-top: 2px;">
                  ${icons.mapPin(colors.accent, 20)}
                </td>
                <td>
                  <p style="margin: 0 0 4px 0; color: ${colors.accent}; font-size: ${typography.sizeXs}; text-transform: uppercase; letter-spacing: 0.5px; font-weight: ${typography.weightSemibold}; font-family: ${typography.fontFamily};">
                    Where
                  </p>
                  <p style="margin: 0; color: ${colors.textPrimary}; font-size: ${typography.sizeBase}; font-family: ${typography.fontFamily};">
                    ${businessAddress}
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
        ${businessPhone ? `
        <tr>
          <td style="padding: 8px 0;">
            <table role="presentation" cellpadding="0" cellspacing="0" style="width: 100%;">
              <tr>
                <td style="width: 32px; vertical-align: top; padding-top: 2px;">
                  ${icons.mail(colors.accent, 20)}
                </td>
                <td>
                  <p style="margin: 0 0 4px 0; color: ${colors.accent}; font-size: ${typography.sizeXs}; text-transform: uppercase; letter-spacing: 0.5px; font-weight: ${typography.weightSemibold}; font-family: ${typography.fontFamily};">
                    Contact
                  </p>
                  <p style="margin: 0; color: ${colors.textPrimary}; font-size: ${typography.sizeBase}; font-family: ${typography.fontFamily};">
                    ${businessPhone}
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
        ` : ''}
      </table>
    `)}
    
    ${infoBox('Need to reschedule? Visit your dashboard to manage your appointments.', 'info')}
    
    ${button('View Appointment', appointmentUrl, true)}
  `;

  return baseTemplate({
    previewText: `Reminder: Your appointment with ${businessName} is tomorrow`,
    content,
  });
};

export const appointmentReminderSubject = (businessName: string) =>
  `Reminder: Appointment Tomorrow with ${businessName}`;
