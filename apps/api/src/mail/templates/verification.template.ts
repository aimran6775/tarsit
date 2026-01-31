/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * EMAIL VERIFICATION TEMPLATE
 * ═══════════════════════════════════════════════════════════════════════════════
 * 
 * Email verification for new accounts with verification link.
 * Uses the Tarsit design system for consistent branding.
 * ═══════════════════════════════════════════════════════════════════════════════
 */

import { baseTemplate, emailComponents } from './base.template';
import { borderRadius, colors, typography } from './design-system';

const { button, text, heading, infoBox, smallText, divider, glassCard } = emailComponents;

export interface VerificationEmailProps {
  firstName: string;
  verificationUrl: string;
  expiresInHours?: number;
}

export const verificationEmailTemplate = ({
  firstName,
  verificationUrl,
  expiresInHours = 24,
}: VerificationEmailProps): string => {
  
  const content = `
    <!-- Hero section with checkmark icon -->
    <table role="presentation" cellpadding="0" cellspacing="0" style="width: 100%; margin-bottom: 24px;">
      <tr>
        <td align="center">
          <div style="width: 80px; height: 80px; background: ${colors.infoMuted}; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 16px;">
            <span style="font-size: 40px;">✉️</span>
          </div>
        </td>
      </tr>
    </table>
    
    ${heading('Verify Your Email')}
    
    ${text(`Hi ${firstName || 'there'}! 👋`)}
    
    ${text("Thanks for signing up for Tarsit! Please verify your email address to complete your account setup and unlock all features.")}
    
    ${button('✓ Verify Email Address', verificationUrl, true)}
    
    <!-- Why verify section -->
    ${glassCard(`
      <table role="presentation" cellpadding="0" cellspacing="0" style="width: 100%;">
        <tr>
          <td>
            <p style="margin: 0 0 12px 0; color: ${colors.textPrimary}; font-size: ${typography.sizeSm}; font-weight: ${typography.weightSemibold}; font-family: ${typography.fontFamily};">
              Why verify your email?
            </p>
            <table role="presentation" cellpadding="0" cellspacing="0" style="width: 100%;">
              <tr>
                <td style="padding: 4px 0; vertical-align: top; width: 24px;">
                  <span style="color: ${colors.accentPrimary}; font-size: 14px;">✦</span>
                </td>
                <td style="padding: 4px 0; padding-left: 8px; color: ${colors.textSecondary}; font-size: ${typography.sizeXs}; font-family: ${typography.fontFamily};">
                  Write reviews and help others discover great businesses
                </td>
              </tr>
              <tr>
                <td style="padding: 4px 0; vertical-align: top; width: 24px;">
                  <span style="color: ${colors.accentPrimary}; font-size: 14px;">✦</span>
                </td>
                <td style="padding: 4px 0; padding-left: 8px; color: ${colors.textSecondary}; font-size: ${typography.sizeXs}; font-family: ${typography.fontFamily};">
                  Book appointments with local businesses
                </td>
              </tr>
              <tr>
                <td style="padding: 4px 0; vertical-align: top; width: 24px;">
                  <span style="color: ${colors.accentPrimary}; font-size: 14px;">✦</span>
                </td>
                <td style="padding: 4px 0; padding-left: 8px; color: ${colors.textSecondary}; font-size: ${typography.sizeXs}; font-family: ${typography.fontFamily};">
                  Receive important account notifications
                </td>
              </tr>
              <tr>
                <td style="padding: 4px 0; vertical-align: top; width: 24px;">
                  <span style="color: ${colors.accentPrimary}; font-size: 14px;">✦</span>
                </td>
                <td style="padding: 4px 0; padding-left: 8px; color: ${colors.textSecondary}; font-size: ${typography.sizeXs}; font-family: ${typography.fontFamily};">
                  Recover your account if you forget your password
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    `)}
    
    ${divider()}
    
    <!-- Expiration notice -->
    <table role="presentation" cellpadding="0" cellspacing="0" style="width: 100%; background: ${colors.bgTertiary}; border-radius: ${borderRadius.lg}; margin-bottom: 24px;">
      <tr>
        <td style="padding: 16px 20px;">
          <table role="presentation" cellpadding="0" cellspacing="0" style="width: 100%;">
            <tr>
              <td style="vertical-align: middle; width: 32px;">
                <span style="font-size: 18px;">⏰</span>
              </td>
              <td style="padding-left: 12px;">
                <p style="margin: 0; color: ${colors.textSecondary}; font-size: ${typography.sizeSm}; font-family: ${typography.fontFamily};">
                  This link expires in <strong style="color: ${colors.textPrimary};">${expiresInHours} hours</strong>
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
    
    ${infoBox(
      "If you didn't create a Tarsit account, you can safely ignore this email.",
      'info'
    )}
    
    ${smallText('Or copy and paste this link into your browser:')}
    <table role="presentation" cellpadding="0" cellspacing="0" style="width: 100%;">
      <tr>
        <td style="background: ${colors.bgTertiary}; padding: 12px 16px; border-radius: ${borderRadius.md}; word-break: break-all;">
          <a href="${verificationUrl}" style="color: ${colors.accentLight}; font-size: ${typography.sizeXs}; font-family: ${typography.fontFamilyMono}; text-decoration: none;">
            ${verificationUrl}
          </a>
        </td>
      </tr>
    </table>
  `;

  return baseTemplate({
    previewText: `✉️ Verify your email to complete your Tarsit account setup`,
    content,
    footerText: 'You received this email because you signed up for a Tarsit account.',
    showSocialLinks: false,
  });
};

export const verificationEmailSubject = '✉️ Verify Your Tarsit Email';
