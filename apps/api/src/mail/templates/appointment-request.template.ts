/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * APPOINTMENT REQUEST EMAIL TEMPLATE
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * Sent to business owners when a customer requests an appointment.
 * Uses the Tarsit design system for consistent branding.
 * ═══════════════════════════════════════════════════════════════════════════════
 */

import { baseTemplate, emailComponents } from './base.template';
import { colors, icons, typography } from './design-system';

const { button, text, heading, infoBox, divider, glassCard } = emailComponents;

export interface AppointmentRequestProps {
  businessOwnerName: string;
  businessName: string;
  customerName: string;
  serviceName: string;
  appointmentDate: Date;
  notes?: string;
  dashboardUrl: string;
}

export const appointmentRequestTemplate = ({
  businessOwnerName,
  businessName,
  customerName,
  serviceName,
  appointmentDate,
  notes,
  dashboardUrl,
}: AppointmentRequestProps): string => {
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
    <!-- Hero section with calendar icon -->
    <table role="presentation" cellpadding="0" cellspacing="0" style="width: 100%; margin-bottom: 24px;">
      <tr>
        <td align="center">
          <div style="width: 80px; height: 80px; background: ${colors.infoMuted}; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 16px;">
            ${icons.calendar(colors.info, 40)}
          </div>
        </td>
      </tr>
    </table>
    
    ${heading('New Appointment Request')}
    
    ${text(`Hi ${businessOwnerName},`)}
    
    ${text(`You have a new appointment request for <strong>${businessName}</strong>!`)}
    
    <!-- Request details card -->
    ${glassCard(`
      <table role="presentation" cellpadding="0" cellspacing="0" style="width: 100%;">
        <tr>
          <td style="padding: 12px 0; border-bottom: 1px solid ${colors.glassBorder};">
            <table role="presentation" cellpadding="0" cellspacing="0" style="width: 100%;">
              <tr>
                <td style="vertical-align: top; width: 24px; padding-top: 2px;">
                  ${icons.user(colors.accentPrimary, 16)}
                </td>
                <td style="padding-left: 12px;">
                  <p style="margin: 0 0 4px 0; color: ${colors.textMuted}; font-size: ${typography.sizeXs}; text-transform: uppercase; letter-spacing: 0.5px; font-weight: ${typography.weightMedium}; font-family: ${typography.fontFamily};">
                    Customer
                  </p>
                  <p style="margin: 0; color: ${colors.textPrimary}; font-size: ${typography.sizeBase}; font-weight: ${typography.weightSemibold}; font-family: ${typography.fontFamily};">
                    ${customerName}
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
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
          <td style="padding: 12px 0; ${notes ? `border-bottom: 1px solid ${colors.glassBorder};` : ''}">
            <table role="presentation" cellpadding="0" cellspacing="0" style="width: 100%;">
              <tr>
                <td style="vertical-align: top; width: 24px; padding-top: 2px;">
                  ${icons.clock(colors.accentPrimary, 16)}
                </td>
                <td style="padding-left: 12px;">
                  <p style="margin: 0 0 4px 0; color: ${colors.textMuted}; font-size: ${typography.sizeXs}; text-transform: uppercase; letter-spacing: 0.5px; font-weight: ${typography.weightMedium}; font-family: ${typography.fontFamily};">
                    Requested Date & Time
                  </p>
                  <p style="margin: 0; color: ${colors.textPrimary}; font-size: ${typography.sizeBase}; font-weight: ${typography.weightMedium}; font-family: ${typography.fontFamily};">
                    ${formattedDate} at ${formattedTime}
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
        ${notes ? `
        <tr>
          <td style="padding: 12px 0;">
            <p style="margin: 0 0 4px 0; color: ${colors.textMuted}; font-size: ${typography.sizeXs}; text-transform: uppercase; letter-spacing: 0.5px; font-weight: ${typography.weightMedium}; font-family: ${typography.fontFamily};">
              Notes from Customer
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
    
    ${infoBox('Please respond to this request within 24 hours to confirm or reschedule.', 'warning')}
    
    ${button('View & Respond', dashboardUrl, true)}
  `;

  return baseTemplate({
    previewText: `New appointment request from ${customerName}`,
    content,
  });
};

export const appointmentRequestSubject = (customerName: string) =>
  `New Appointment Request from ${customerName}`;
