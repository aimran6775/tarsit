/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * TEAM INVITATION EMAIL TEMPLATE
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * Sent when someone is invited to join a business team.
 * Uses the Tarsit design system for consistent branding.
 * ═══════════════════════════════════════════════════════════════════════════════
 */

import { baseTemplate, emailComponents } from './base.template';
import { colors, icons, typography } from './design-system';

const { button, text, heading, infoBox, glassCard } = emailComponents;

export interface TeamInvitationProps {
  inviteeName: string;
  businessName: string;
  inviterName: string;
  role: string;
  permissions: string[];
  acceptUrl: string;
}

export const teamInvitationTemplate = ({
  inviteeName,
  businessName,
  inviterName,
  role,
  permissions,
  acceptUrl,
}: TeamInvitationProps): string => {
  const content = `
    <!-- Hero section with user plus icon -->
    <table role="presentation" cellpadding="0" cellspacing="0" style="width: 100%; margin-bottom: 24px;">
      <tr>
        <td align="center">
          <div style="width: 80px; height: 80px; background: ${colors.gradientPrimary}; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 16px; box-shadow: 0 0 30px rgba(168, 85, 247, 0.4);">
            ${icons.user('#ffffff', 40)}
          </div>
        </td>
      </tr>
    </table>
    
    ${heading("You're Invited!")}
    
    ${text(`Hi ${inviteeName || 'there'},`)}
    
    ${text(`<strong>${inviterName}</strong> has invited you to join the team at <strong>${businessName}</strong> on tarsit.`)}
    
    <!-- Role and permissions card -->
    ${glassCard(`
      <table role="presentation" cellpadding="0" cellspacing="0" style="width: 100%;">
        <tr>
          <td align="center" style="padding-bottom: 20px;">
            <span style="display: inline-block; background: ${colors.gradientPrimary}; color: white; padding: 10px 24px; border-radius: 30px; font-size: ${typography.sizeSm}; font-weight: ${typography.weightSemibold}; font-family: ${typography.fontFamily}; box-shadow: 0 4px 12px rgba(168, 85, 247, 0.3);">
              ${role}
            </span>
          </td>
        </tr>
        <tr>
          <td>
            <p style="margin: 0 0 12px 0; color: ${colors.accent}; font-size: ${typography.sizeXs}; text-transform: uppercase; letter-spacing: 0.5px; font-weight: ${typography.weightSemibold}; font-family: ${typography.fontFamily};">
              Your Permissions:
            </p>
            <table role="presentation" cellpadding="0" cellspacing="0" style="width: 100%;">
              ${permissions.map(p => `
                <tr>
                  <td style="padding: 8px 0; vertical-align: top; width: 24px;">
                    ${icons.check('#10b981', 16)}
                  </td>
                  <td style="padding: 8px 0; padding-left: 8px; color: ${colors.textSecondary}; font-size: ${typography.sizeSm}; font-family: ${typography.fontFamily};">
                    ${p}
                  </td>
                </tr>
              `).join('')}
            </table>
          </td>
        </tr>
      </table>
    `)}
    
    ${button('Accept Invitation', acceptUrl, true)}
    
    ${infoBox('This invitation will expire in 7 days.', 'warning')}
    
    ${text("If you don't recognize this business or didn't expect this invitation, you can safely ignore this email.", true)}
  `;

  return baseTemplate({
    previewText: `${inviterName} invited you to join ${businessName}`,
    content,
  });
};

export const teamInvitationSubject = (businessName: string) =>
  `You're Invited to Join ${businessName} on tarsit`;
