/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * PASSWORD RESET EMAIL TEMPLATE
 * ═══════════════════════════════════════════════════════════════════════════════
 * 
 * Password recovery email with security warnings and expiration notice.
 * Uses the Tarsit design system for consistent branding.
 * ═══════════════════════════════════════════════════════════════════════════════
 */

import { baseTemplate, emailComponents } from './base.template';
import { borderRadius, colors, icons, typography } from './design-system';

const { button, text, heading, infoBox, smallText, divider, glassCard } = emailComponents;

export interface PasswordResetEmailProps {
  firstName: string;
  resetUrl: string;
  expiresInMinutes?: number;
  ipAddress?: string;
  requestedAt?: Date;
}

export const passwordResetEmailTemplate = ({
  firstName,
  resetUrl,
  expiresInMinutes = 60,
  ipAddress,
  requestedAt = new Date(),
}: PasswordResetEmailProps): string => {
  
  const formattedTime = requestedAt.toLocaleString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZoneName: 'short',
  });

  const content = `
    <!-- Hero section with lock icon -->
    <table role="presentation" cellpadding="0" cellspacing="0" style="width: 100%; margin-bottom: 24px;">
      <tr>
        <td align="center">
          <div style="width: 80px; height: 80px; background: ${colors.warningMuted}; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 16px;">
            ${icons.lock(colors.warning, 40)}
          </div>
        </td>
      </tr>
    </table>
    
    ${heading('Reset Your Password')}
    
    ${text(`Hi ${firstName || 'there'},`)}
    
    ${text("We received a request to reset your password for your tarsit account. Click the button below to create a new password.")}
    
    ${button('Reset Password', resetUrl, true)}
    
    <!-- Expiration warning -->
    ${glassCard(`
      <table role="presentation" cellpadding="0" cellspacing="0" style="width: 100%;">
        <tr>
          <td style="vertical-align: middle; width: 48px;">
            <div style="width: 40px; height: 40px; background: ${colors.warningMuted}; border-radius: 10px; text-align: center; padding: 8px; box-sizing: border-box;">
              ${icons.clock(colors.warning, 24)}
            </div>
          </td>
          <td style="padding-left: 16px;">
            <p style="margin: 0 0 4px 0; color: ${colors.textPrimary}; font-size: ${typography.sizeBase}; font-weight: ${typography.weightSemibold}; font-family: ${typography.fontFamily};">
              Link expires in ${expiresInMinutes} minutes
            </p>
            <p style="margin: 0; color: ${colors.textMuted}; font-size: ${typography.sizeSm}; font-family: ${typography.fontFamily};">
              After that, you'll need to request a new reset link
            </p>
          </td>
        </tr>
      </table>
    `)}
    
    ${divider()}
    
    <!-- Security tips -->
    <table role="presentation" cellpadding="0" cellspacing="0" style="width: 100%; margin-bottom: 16px;">
      <tr>
        <td>
          <p style="margin: 0 0 16px 0; color: ${colors.textMuted}; font-size: ${typography.sizeSm}; font-weight: ${typography.weightSemibold}; text-transform: uppercase; letter-spacing: 0.5px; font-family: ${typography.fontFamily};">
            <span style="display: inline-block; vertical-align: middle; margin-right: 8px;">${icons.shield(colors.textMuted, 16)}</span>
            Password Tips
          </p>
        </td>
      </tr>
    </table>
    
    <table role="presentation" cellpadding="0" cellspacing="0" style="width: 100%; background: ${colors.bgTertiary}; border-radius: ${borderRadius.lg}; padding: 20px;">
      <tr>
        <td style="padding: 16px 20px;">
          <table role="presentation" cellpadding="0" cellspacing="0" style="width: 100%;">
            <tr>
              <td style="padding: 6px 0; vertical-align: top; width: 24px;">
                ${icons.check(colors.success, 14)}
              </td>
              <td style="padding: 6px 0; padding-left: 8px; color: ${colors.textSecondary}; font-size: ${typography.sizeSm}; font-family: ${typography.fontFamily};">
                Use at least 12 characters
              </td>
            </tr>
            <tr>
              <td style="padding: 6px 0; vertical-align: top; width: 24px;">
                ${icons.check(colors.success, 14)}
              </td>
              <td style="padding: 6px 0; padding-left: 8px; color: ${colors.textSecondary}; font-size: ${typography.sizeSm}; font-family: ${typography.fontFamily};">
                Mix uppercase, lowercase, numbers & symbols
              </td>
            </tr>
            <tr>
              <td style="padding: 6px 0; vertical-align: top; width: 24px;">
                ${icons.check(colors.success, 14)}
              </td>
              <td style="padding: 6px 0; padding-left: 8px; color: ${colors.textSecondary}; font-size: ${typography.sizeSm}; font-family: ${typography.fontFamily};">
                Avoid common words or personal info
              </td>
            </tr>
            <tr>
              <td style="padding: 6px 0; vertical-align: top; width: 24px;">
                ${icons.check(colors.success, 14)}
              </td>
              <td style="padding: 6px 0; padding-left: 8px; color: ${colors.textSecondary}; font-size: ${typography.sizeSm}; font-family: ${typography.fontFamily};">
                Don't reuse passwords from other sites
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
    
    ${divider()}
    
    ${infoBox(
      "<strong>Didn't request this?</strong> If you didn't request a password reset, please ignore this email. Your password will remain unchanged and your account is secure.",
      'warning'
    )}
    
    <!-- Request details -->
    ${ipAddress ? `
    <table role="presentation" cellpadding="0" cellspacing="0" style="width: 100%; margin-top: 16px;">
      <tr>
        <td>
          ${smallText(`Request details: ${formattedTime}${ipAddress ? ` • IP: ${ipAddress}` : ''}`)}
        </td>
      </tr>
    </table>
    ` : ''}
    
    ${smallText('Or copy and paste this link into your browser:')}
    <table role="presentation" cellpadding="0" cellspacing="0" style="width: 100%;">
      <tr>
        <td style="background: ${colors.bgTertiary}; padding: 12px 16px; border-radius: ${borderRadius.md}; word-break: break-all;">
          <a href="${resetUrl}" style="color: ${colors.accentLight}; font-size: ${typography.sizeXs}; font-family: ${typography.fontFamilyMono}; text-decoration: none;">
            ${resetUrl}
          </a>
        </td>
      </tr>
    </table>
  `;

  return baseTemplate({
    previewText: `Reset your tarsit password - expires in ${expiresInMinutes} minutes`,
    content,
    footerText: 'You received this email because a password reset was requested for your tarsit account.',
    showSocialLinks: false,
  });
};

export const passwordResetEmailSubject = 'Reset Your tarsit Password';
