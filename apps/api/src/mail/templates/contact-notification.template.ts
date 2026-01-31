/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * CONTACT NOTIFICATION EMAIL TEMPLATE
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * Sent to business owners when someone sends a message via their contact form.
 * Uses the Tarsit design system for consistent branding.
 * ═══════════════════════════════════════════════════════════════════════════════
 */

import { baseTemplate, emailComponents } from './base.template';
import { borderRadius, colors, icons, typography } from './design-system';

const { button, text, heading, glassCard } = emailComponents;

export interface ContactNotificationProps {
  businessOwnerName: string;
  businessName: string;
  senderName: string;
  senderEmail: string;
  senderPhone?: string;
  subject: string;
  message: string;
  dashboardUrl: string;
}

export const contactNotificationTemplate = ({
  businessOwnerName,
  businessName,
  senderName,
  senderEmail,
  senderPhone,
  subject,
  message,
  dashboardUrl,
}: ContactNotificationProps): string => {
  const content = `
    <!-- Hero section with message icon -->
    <table role="presentation" cellpadding="0" cellspacing="0" style="width: 100%; margin-bottom: 24px;">
      <tr>
        <td align="center">
          <div style="width: 80px; height: 80px; background: ${colors.gradientPrimary}; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 16px; box-shadow: 0 0 30px rgba(168, 85, 247, 0.4);">
            ${icons.message('#ffffff', 40)}
          </div>
        </td>
      </tr>
    </table>
    
    ${heading('New Message Received')}
    
    ${text(`Hi ${businessOwnerName},`)}
    
    ${text(`Someone has sent a message to <strong>${businessName}</strong> through your contact form.`)}
    
    <!-- Sender details card -->
    ${glassCard(`
      <table role="presentation" cellpadding="0" cellspacing="0" style="width: 100%;">
        <tr>
          <td style="padding: 8px 0; border-bottom: 1px solid ${colors.glassBorder};">
            <table role="presentation" cellpadding="0" cellspacing="0" style="width: 100%;">
              <tr>
                <td style="width: 32px; vertical-align: top; padding-top: 2px;">
                  ${icons.user(colors.accent, 20)}
                </td>
                <td>
                  <p style="margin: 0 0 4px 0; color: ${colors.accent}; font-size: ${typography.sizeXs}; text-transform: uppercase; letter-spacing: 0.5px; font-weight: ${typography.weightSemibold}; font-family: ${typography.fontFamily};">
                    From
                  </p>
                  <p style="margin: 0; color: ${colors.textPrimary}; font-size: ${typography.sizeBase}; font-family: ${typography.fontFamily};">
                    ${senderName}
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
                  ${icons.mail(colors.accent, 20)}
                </td>
                <td>
                  <p style="margin: 0 0 4px 0; color: ${colors.accent}; font-size: ${typography.sizeXs}; text-transform: uppercase; letter-spacing: 0.5px; font-weight: ${typography.weightSemibold}; font-family: ${typography.fontFamily};">
                    Email
                  </p>
                  <p style="margin: 0; color: ${colors.textPrimary}; font-size: ${typography.sizeBase}; font-family: ${typography.fontFamily};">
                    <a href="mailto:${senderEmail}" style="color: ${colors.accent}; text-decoration: none;">${senderEmail}</a>
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
        ${senderPhone ? `
        <tr>
          <td style="padding: 8px 0; border-bottom: 1px solid ${colors.glassBorder};">
            <table role="presentation" cellpadding="0" cellspacing="0" style="width: 100%;">
              <tr>
                <td style="width: 32px; vertical-align: top; padding-top: 2px;">
                  ${icons.clock(colors.accent, 20)}
                </td>
                <td>
                  <p style="margin: 0 0 4px 0; color: ${colors.accent}; font-size: ${typography.sizeXs}; text-transform: uppercase; letter-spacing: 0.5px; font-weight: ${typography.weightSemibold}; font-family: ${typography.fontFamily};">
                    Phone
                  </p>
                  <p style="margin: 0; color: ${colors.textPrimary}; font-size: ${typography.sizeBase}; font-family: ${typography.fontFamily};">
                    ${senderPhone}
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
        ` : ''}
        <tr>
          <td style="padding: 8px 0;">
            <table role="presentation" cellpadding="0" cellspacing="0" style="width: 100%;">
              <tr>
                <td style="width: 32px; vertical-align: top; padding-top: 2px;">
                  ${icons.sparkles(colors.accent, 20)}
                </td>
                <td>
                  <p style="margin: 0 0 4px 0; color: ${colors.accent}; font-size: ${typography.sizeXs}; text-transform: uppercase; letter-spacing: 0.5px; font-weight: ${typography.weightSemibold}; font-family: ${typography.fontFamily};">
                    Subject
                  </p>
                  <p style="margin: 0; color: ${colors.textPrimary}; font-size: ${typography.sizeBase}; font-weight: ${typography.weightSemibold}; font-family: ${typography.fontFamily};">
                    ${subject}
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    `)}
    
    <!-- Message content -->
    <table role="presentation" cellpadding="0" cellspacing="0" style="width: 100%; margin: 16px 0;">
      <tr>
        <td style="background: ${colors.glassBackground}; border: 1px solid ${colors.glassBorder}; border-left: 4px solid ${colors.accent}; padding: 20px 24px; border-radius: ${borderRadius.lg};">
          <p style="margin: 0 0 8px 0; color: ${colors.accent}; font-size: ${typography.sizeXs}; text-transform: uppercase; letter-spacing: 0.5px; font-weight: ${typography.weightSemibold}; font-family: ${typography.fontFamily};">
            Message
          </p>
          <p style="margin: 0; color: ${colors.textSecondary}; font-size: ${typography.sizeBase}; line-height: 1.6; font-family: ${typography.fontFamily}; white-space: pre-wrap;">
${message}
          </p>
        </td>
      </tr>
    </table>
    
    ${button('View in Dashboard', dashboardUrl, true)}
    
    ${text('Respond promptly to build trust with potential customers.', true)}
  `;

  return baseTemplate({
    previewText: `New message from ${senderName} for ${businessName}`,
    content,
  });
};

export const contactNotificationSubject = (senderName: string) =>
  `New Contact Form Message from ${senderName}`;
