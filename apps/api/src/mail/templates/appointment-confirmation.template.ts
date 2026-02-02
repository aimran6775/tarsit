/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * APPOINTMENT CONFIRMATION EMAIL TEMPLATE
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * Sent when a customer's appointment has been confirmed.
 * Uses the Tarsit design system for consistent branding.
 * ═══════════════════════════════════════════════════════════════════════════════
 */

import { baseTemplate, emailComponents } from './base.template';
import { colors, icons, typography } from './design-system';

const { button, text, heading, infoBox, divider, glassCard } = emailComponents;

export interface AppointmentConfirmationProps {
  firstName: string;
  businessName: string;
  serviceName: string;
  appointmentDate: Date;
  appointmentTime: string;
  businessAddress: string;
  businessPhone?: string;
  notes?: string;
}

export const appointmentConfirmationTemplate = ({
  firstName,
  businessName,
  serviceName,
  appointmentDate,
  appointmentTime,
  businessAddress,
  businessPhone,
  notes,
}: AppointmentConfirmationProps): string => {
  const formattedDate = appointmentDate.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const content = `
    <!-- Hero section with calendar icon -->
    <table role="presentation" cellpadding="0" cellspacing="0" style="width: 100%; margin-bottom: 24px;">
      <tr>
        <td align="center">
          <div style="width: 80px; height: 80px; background: ${colors.successMuted}; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 16px;">
            ${icons.calendar(colors.success, 40)}
          </div>
        </td>
      </tr>
    </table>
    
    ${heading('Appointment Confirmed')}
    
    ${text(`Hi ${firstName},`)}
    
    ${text(`Great news! Your appointment with <strong>${businessName}</strong> has been confirmed.`)}
    
    <!-- Appointment details card -->
    ${glassCard(`
      <table role="presentation" cellpadding="0" cellspacing="0" style="width: 100%;">
        <tr>
          <td style="padding: 12px 0; border-bottom: 1px solid ${colors.glassBorder};">
            <p style="margin: 0 0 4px 0; color: ${colors.textMuted}; font-size: ${typography.sizeXs}; text-transform: uppercase; letter-spacing: 0.5px; font-weight: ${typography.weightMedium}; font-family: ${typography.fontFamily};">
              Service
            </p>
            <p style="margin: 0; color: ${colors.textPrimary}; font-size: ${typography.sizeBase}; font-weight: ${typography.weightMedium}; font-family: ${typography.fontFamily};">
              ${serviceName}
            </p>
          </td>
        </tr>
        <tr>
          <td style="padding: 12px 0; border-bottom: 1px solid ${colors.glassBorder};">
            <table role="presentation" cellpadding="0" cellspacing="0" style="width: 100%;">
              <tr>
                <td style="vertical-align: top; width: 24px; padding-top: 2px;">
                  ${icons.calendar(colors.accentPrimary, 16)}
                </td>
                <td style="padding-left: 12px;">
                  <p style="margin: 0 0 4px 0; color: ${colors.textMuted}; font-size: ${typography.sizeXs}; text-transform: uppercase; letter-spacing: 0.5px; font-weight: ${typography.weightMedium}; font-family: ${typography.fontFamily};">
                    Date & Time
                  </p>
                  <p style="margin: 0; color: ${colors.textPrimary}; font-size: ${typography.sizeBase}; font-weight: ${typography.weightMedium}; font-family: ${typography.fontFamily};">
                    ${formattedDate} at ${appointmentTime}
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
        <tr>
          <td style="padding: 12px 0; ${businessPhone || notes ? `border-bottom: 1px solid ${colors.glassBorder};` : ''}">
            <table role="presentation" cellpadding="0" cellspacing="0" style="width: 100%;">
              <tr>
                <td style="vertical-align: top; width: 24px; padding-top: 2px;">
                  ${icons.mapPin(colors.accentPrimary, 16)}
                </td>
                <td style="padding-left: 12px;">
                  <p style="margin: 0 0 4px 0; color: ${colors.textMuted}; font-size: ${typography.sizeXs}; text-transform: uppercase; letter-spacing: 0.5px; font-weight: ${typography.weightMedium}; font-family: ${typography.fontFamily};">
                    Location
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
          <td style="padding: 12px 0; ${notes ? `border-bottom: 1px solid ${colors.glassBorder};` : ''}">
            <p style="margin: 0 0 4px 0; color: ${colors.textMuted}; font-size: ${typography.sizeXs}; text-transform: uppercase; letter-spacing: 0.5px; font-weight: ${typography.weightMedium}; font-family: ${typography.fontFamily};">
              Contact
            </p>
            <p style="margin: 0; color: ${colors.textPrimary}; font-size: ${typography.sizeBase}; font-family: ${typography.fontFamily};">
              ${businessPhone}
            </p>
          </td>
        </tr>
        ` : ''}
        ${notes ? `
        <tr>
          <td style="padding: 12px 0;">
            <p style="margin: 0 0 4px 0; color: ${colors.textMuted}; font-size: ${typography.sizeXs}; text-transform: uppercase; letter-spacing: 0.5px; font-weight: ${typography.weightMedium}; font-family: ${typography.fontFamily};">
              Notes
            </p>
            <p style="margin: 0; color: ${colors.textSecondary}; font-size: ${typography.sizeSm}; font-style: italic; font-family: ${typography.fontFamily};">
              "${notes}"
            </p>
          </td>
        </tr>
        ` : ''}
      </table>
    `)}
    
    ${divider()}
    
    ${infoBox('Need to reschedule or cancel? You can manage your appointments from your tarsit dashboard.', 'info')}
    
    ${button('View Appointment', 'https://tarsit.com/appointments', true)}
  `;

  return baseTemplate({
    previewText: `Your appointment with ${businessName} is confirmed for ${formattedDate}`,
    content,
  });
};

export const appointmentConfirmationSubject = (businessName: string) =>
  `Appointment Confirmed - ${businessName}`;
