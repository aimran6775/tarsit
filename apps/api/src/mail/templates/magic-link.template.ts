/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * MAGIC LINK EMAIL TEMPLATE
 * ═══════════════════════════════════════════════════════════════════════════════
 * 
 * Passwordless authentication email with security info and expiration warning.
 * Uses the Tarsit design system for consistent branding.
 * ═══════════════════════════════════════════════════════════════════════════════
 */

import { baseTemplate, emailComponents } from './base.template';
import { borderRadius, colors, typography } from './design-system';

const { button, text, heading, infoBox, smallText, divider, glassCard } = emailComponents;

export interface MagicLinkEmailProps {
  firstName: string;
  magicLinkUrl: string;
  expiresInMinutes?: number;
  ipAddress?: string;
  userAgent?: string;
  requestedAt?: Date;
}

export const magicLinkEmailTemplate = ({
  firstName,
  magicLinkUrl,
  expiresInMinutes = 15,
  ipAddress,
  userAgent,
  requestedAt = new Date(),
}: MagicLinkEmailProps): string => {
  
  const formattedTime = requestedAt.toLocaleString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZoneName: 'short',
  });

  // Parse user agent for friendly device name
  const getDeviceName = (ua?: string): string => {
    if (!ua) return 'Unknown device';
    if (ua.includes('iPhone')) return 'iPhone';
    if (ua.includes('iPad')) return 'iPad';
    if (ua.includes('Android')) return 'Android device';
    if (ua.includes('Mac')) return 'Mac';
    if (ua.includes('Windows')) return 'Windows PC';
    if (ua.includes('Linux')) return 'Linux computer';
    return 'Web browser';
  };

  const content = `
    <!-- Hero section with magic wand icon -->
    <table role="presentation" cellpadding="0" cellspacing="0" style="width: 100%; margin-bottom: 24px;">
      <tr>
        <td align="center">
          <div style="width: 80px; height: 80px; background: ${colors.accentGlow}; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 16px;">
            <span style="font-size: 40px;">🔮</span>
          </div>
        </td>
      </tr>
    </table>
    
    ${heading('Sign in to Tarsit')}
    
    ${text(`Hey ${firstName || 'there'}! 👋`)}
    
    ${text('You requested a magic link to sign in to your Tarsit account. Click the button below to securely access your account — no password needed!')}
    
    ${button('✨ Sign In Now', magicLinkUrl, true)}
    
    <!-- Expiration warning -->
    ${glassCard(`
      <table role="presentation" cellpadding="0" cellspacing="0" style="width: 100%;">
        <tr>
          <td style="vertical-align: middle; width: 48px;">
            <div style="width: 40px; height: 40px; background: ${colors.warningMuted}; border-radius: 10px; text-align: center; line-height: 40px;">
              <span style="font-size: 20px;">⏱️</span>
            </div>
          </td>
          <td style="padding-left: 16px;">
            <p style="margin: 0 0 4px 0; color: ${colors.textPrimary}; font-size: ${typography.sizeBase}; font-weight: ${typography.weightSemibold}; font-family: ${typography.fontFamily};">
              Link expires in ${expiresInMinutes} minutes
            </p>
            <p style="margin: 0; color: ${colors.textMuted}; font-size: ${typography.sizeSm}; font-family: ${typography.fontFamily};">
              For security, this link can only be used once
            </p>
          </td>
        </tr>
      </table>
    `)}
    
    ${divider()}
    
    <!-- Security info section -->
    <table role="presentation" cellpadding="0" cellspacing="0" style="width: 100%; margin-bottom: 16px;">
      <tr>
        <td>
          <p style="margin: 0 0 16px 0; color: ${colors.textMuted}; font-size: ${typography.sizeSm}; font-weight: ${typography.weightSemibold}; text-transform: uppercase; letter-spacing: 0.5px; font-family: ${typography.fontFamily};">
            🔒 Security Details
          </p>
        </td>
      </tr>
    </table>
    
    <table role="presentation" cellpadding="0" cellspacing="0" style="width: 100%; background: ${colors.bgTertiary}; border-radius: ${borderRadius.lg}; overflow: hidden;">
      <tr>
        <td style="padding: 16px 20px; border-bottom: 1px solid ${colors.glassBorder};">
          <table role="presentation" cellpadding="0" cellspacing="0" style="width: 100%;">
            <tr>
              <td style="color: ${colors.textMuted}; font-size: ${typography.sizeSm}; width: 100px; font-family: ${typography.fontFamily};">Requested</td>
              <td style="color: ${colors.textPrimary}; font-size: ${typography.sizeSm}; font-family: ${typography.fontFamily};">${formattedTime}</td>
            </tr>
          </table>
        </td>
      </tr>
      ${ipAddress ? `
      <tr>
        <td style="padding: 16px 20px; border-bottom: 1px solid ${colors.glassBorder};">
          <table role="presentation" cellpadding="0" cellspacing="0" style="width: 100%;">
            <tr>
              <td style="color: ${colors.textMuted}; font-size: ${typography.sizeSm}; width: 100px; font-family: ${typography.fontFamily};">IP Address</td>
              <td style="color: ${colors.textPrimary}; font-size: ${typography.sizeSm}; font-family: ${typography.fontFamilyMono};">${ipAddress}</td>
            </tr>
          </table>
        </td>
      </tr>
      ` : ''}
      <tr>
        <td style="padding: 16px 20px;">
          <table role="presentation" cellpadding="0" cellspacing="0" style="width: 100%;">
            <tr>
              <td style="color: ${colors.textMuted}; font-size: ${typography.sizeSm}; width: 100px; font-family: ${typography.fontFamily};">Device</td>
              <td style="color: ${colors.textPrimary}; font-size: ${typography.sizeSm}; font-family: ${typography.fontFamily};">${getDeviceName(userAgent)}</td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
    
    ${divider()}
    
    ${infoBox(
      "<strong>Didn't request this?</strong> If you didn't try to sign in, you can safely ignore this email. Your account is secure.",
      'warning'
    )}
    
    ${smallText('Or copy and paste this link into your browser:')}
    <table role="presentation" cellpadding="0" cellspacing="0" style="width: 100%;">
      <tr>
        <td style="background: ${colors.bgTertiary}; padding: 12px 16px; border-radius: ${borderRadius.md}; word-break: break-all;">
          <a href="${magicLinkUrl}" style="color: ${colors.accentLight}; font-size: ${typography.sizeXs}; font-family: ${typography.fontFamilyMono}; text-decoration: none;">
            ${magicLinkUrl}
          </a>
        </td>
      </tr>
    </table>
  `;

  return baseTemplate({
    previewText: `🔮 Your Tarsit magic link - expires in ${expiresInMinutes} minutes`,
    content,
    footerText: 'You received this email because a magic link was requested for your Tarsit account.',
    showSocialLinks: false,
  });
};

export const magicLinkEmailSubject = '🔮 Your Magic Link to Sign In';
