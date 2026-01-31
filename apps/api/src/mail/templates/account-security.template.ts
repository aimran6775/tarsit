/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * ACCOUNT SECURITY EMAIL TEMPLATE
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * Sent for security-related events like password changes, new logins, etc.
 * Uses the Tarsit design system for consistent branding.
 * ═══════════════════════════════════════════════════════════════════════════════
 */

import { baseTemplate, emailComponents } from './base.template';
import { colors, icons, typography } from './design-system';

const { button, text, heading, glassCard, infoBox } = emailComponents;

export type SecurityEventType =
  | 'password_changed'
  | 'email_changed'
  | 'new_login'
  | 'two_factor_enabled'
  | 'two_factor_disabled';

export interface AccountSecurityProps {
  firstName: string;
  eventType: SecurityEventType;
  ipAddress?: string;
  location?: string;
  device?: string;
  timestamp: Date;
  securityUrl: string;
}

const eventConfig: Record<
  SecurityEventType,
  { title: string; description: string; icon: (color: string, size: number) => string }
> = {
  password_changed: {
    title: 'Password Changed',
    description: 'Your password has been successfully changed.',
    icon: icons.lock,
  },
  email_changed: {
    title: 'Email Address Updated',
    description: 'Your email address has been successfully updated.',
    icon: icons.mail,
  },
  new_login: {
    title: 'New Login Detected',
    description: 'A new login to your account was detected.',
    icon: icons.user,
  },
  two_factor_enabled: {
    title: 'Two-Factor Authentication Enabled',
    description: 'Two-factor authentication has been enabled on your account.',
    icon: icons.shield,
  },
  two_factor_disabled: {
    title: 'Two-Factor Authentication Disabled',
    description: 'Two-factor authentication has been disabled on your account.',
    icon: icons.alertTriangle,
  },
};

export const accountSecurityTemplate = ({
  firstName,
  eventType,
  ipAddress,
  location,
  device,
  timestamp,
  securityUrl,
}: AccountSecurityProps): string => {
  const config = eventConfig[eventType];
  const formattedTime = timestamp.toLocaleString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const isWarning = eventType === 'new_login' || eventType === 'two_factor_disabled';
  const heroColor = isWarning ? colors.warning : '#10b981';
  const heroGlow = isWarning
    ? '0 0 30px rgba(245, 158, 11, 0.4)'
    : '0 0 30px rgba(16, 185, 129, 0.4)';
  const heroBg = isWarning
    ? `linear-gradient(135deg, ${colors.warning} 0%, #d97706 100%)`
    : 'linear-gradient(135deg, #10b981 0%, #059669 100%)';

  const content = `
    <!-- Hero section with security icon -->
    <table role="presentation" cellpadding="0" cellspacing="0" style="width: 100%; margin-bottom: 24px;">
      <tr>
        <td align="center">
          <div style="width: 80px; height: 80px; background: ${heroBg}; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 16px; box-shadow: ${heroGlow};">
            ${config.icon('#ffffff', 40)}
          </div>
        </td>
      </tr>
    </table>
    
    ${heading(config.title)}
    
    ${text(`Hi ${firstName},`)}
    
    ${text(config.description)}
    
    <!-- Event details card -->
    ${glassCard(`
      <table role="presentation" cellpadding="0" cellspacing="0" style="width: 100%;">
        <tr>
          <td style="padding: 8px 0; border-bottom: 1px solid ${colors.glassBorder};">
            <table role="presentation" cellpadding="0" cellspacing="0" style="width: 100%;">
              <tr>
                <td style="width: 32px; vertical-align: top; padding-top: 2px;">
                  ${icons.clock(colors.accent, 20)}
                </td>
                <td>
                  <p style="margin: 0 0 4px 0; color: ${colors.accent}; font-size: ${typography.sizeXs}; text-transform: uppercase; letter-spacing: 0.5px; font-weight: ${typography.weightSemibold}; font-family: ${typography.fontFamily};">
                    When
                  </p>
                  <p style="margin: 0; color: ${colors.textPrimary}; font-size: ${typography.sizeBase}; font-family: ${typography.fontFamily};">
                    ${formattedTime}
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
        ${ipAddress ? `
        <tr>
          <td style="padding: 8px 0; border-bottom: 1px solid ${colors.glassBorder};">
            <table role="presentation" cellpadding="0" cellspacing="0" style="width: 100%;">
              <tr>
                <td style="width: 32px; vertical-align: top; padding-top: 2px;">
                  ${icons.mapPin(colors.accent, 20)}
                </td>
                <td>
                  <p style="margin: 0 0 4px 0; color: ${colors.accent}; font-size: ${typography.sizeXs}; text-transform: uppercase; letter-spacing: 0.5px; font-weight: ${typography.weightSemibold}; font-family: ${typography.fontFamily};">
                    IP Address
                  </p>
                  <p style="margin: 0; color: ${colors.textPrimary}; font-size: ${typography.sizeBase}; font-family: ${typography.fontFamily};">
                    ${ipAddress}${location ? ` (${location})` : ''}
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
        ` : ''}
        ${device ? `
        <tr>
          <td style="padding: 8px 0;">
            <table role="presentation" cellpadding="0" cellspacing="0" style="width: 100%;">
              <tr>
                <td style="width: 32px; vertical-align: top; padding-top: 2px;">
                  ${icons.robot(colors.accent, 20)}
                </td>
                <td>
                  <p style="margin: 0 0 4px 0; color: ${colors.accent}; font-size: ${typography.sizeXs}; text-transform: uppercase; letter-spacing: 0.5px; font-weight: ${typography.weightSemibold}; font-family: ${typography.fontFamily};">
                    Device
                  </p>
                  <p style="margin: 0; color: ${colors.textPrimary}; font-size: ${typography.sizeBase}; font-family: ${typography.fontFamily};">
                    ${device}
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
        ` : ''}
      </table>
    `)}
    
    ${isWarning ? infoBox("If this wasn't you, please secure your account immediately by changing your password.", 'warning') : ''}
    
    ${button('Review Security Settings', securityUrl, true)}
    
    ${text("If you didn't make this change, please contact our support team immediately.", true)}
  `;

  return baseTemplate({
    previewText: `Security Alert: ${config.title}`,
    content,
  });
};

export const accountSecuritySubject = (eventType: SecurityEventType) => {
  const titles: Record<SecurityEventType, string> = {
    password_changed: 'Your Password Has Been Changed',
    email_changed: 'Your Email Address Has Been Updated',
    new_login: 'New Login to Your Account',
    two_factor_enabled: 'Two-Factor Authentication Enabled',
    two_factor_disabled: 'Two-Factor Authentication Disabled',
  };
  return `Security Alert: ${titles[eventType]}`;
};
