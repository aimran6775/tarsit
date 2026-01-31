/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * VERIFICATION STATUS EMAIL TEMPLATE
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * Sent to business owners when their verification status changes.
 * Uses the Tarsit design system for consistent branding.
 * ═══════════════════════════════════════════════════════════════════════════════
 */

import { baseTemplate, emailComponents } from './base.template';
import { borderRadius, colors, icons, typography } from './design-system';

const { button, text, heading, featureList, glassCard } = emailComponents;

export interface VerificationStatusProps {
  businessOwnerName: string;
  businessName: string;
  status: 'approved' | 'rejected';
  adminNotes?: string;
  dashboardUrl: string;
}

export const verificationStatusTemplate = ({
  businessOwnerName,
  businessName,
  status,
  adminNotes,
  dashboardUrl,
}: VerificationStatusProps): string => {
  const isApproved = status === 'approved';

  const content = isApproved ? `
    <!-- Hero section with checkmark icon -->
    <table role="presentation" cellpadding="0" cellspacing="0" style="width: 100%; margin-bottom: 24px;">
      <tr>
        <td align="center">
          <div style="width: 80px; height: 80px; background: linear-gradient(135deg, #10b981 0%, #059669 100%); border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 16px; box-shadow: 0 0 30px rgba(16, 185, 129, 0.4);">
            ${icons.checkCircle('#ffffff', 40)}
          </div>
        </td>
      </tr>
    </table>
    
    ${heading('Congratulations!')}
    
    ${text(`Hi ${businessOwnerName},`)}
    
    ${text(`Great news! Your business <strong>${businessName}</strong> has been <strong style="color: #10b981;">verified</strong>!`)}
    
    <!-- Verification success card -->
    ${glassCard(`
      <table role="presentation" cellpadding="0" cellspacing="0" style="width: 100%;">
        <tr>
          <td align="center" style="padding: 16px;">
            <div style="margin-bottom: 12px;">${icons.shield('#10b981', 48)}</div>
            <p style="margin: 0 0 8px 0; font-size: ${typography.sizeLg}; font-weight: ${typography.weightBold}; color: ${colors.textPrimary}; font-family: ${typography.fontFamily};">
              Business Verified
            </p>
            <p style="margin: 0; font-size: ${typography.sizeSm}; color: ${colors.textMuted}; font-family: ${typography.fontFamily};">
              Your business now has a verified badge
            </p>
          </td>
        </tr>
      </table>
    `)}
    
    ${text("Here's what this means for you:")}
    
    ${featureList([
      'Verified badge displayed on your business profile',
      'Higher visibility in search results',
      'Increased trust from potential customers',
      'Access to premium business features',
    ])}
    
    ${button('Go to Dashboard', dashboardUrl, true)}
  ` : `
    <!-- Hero section with alert icon -->
    <table role="presentation" cellpadding="0" cellspacing="0" style="width: 100%; margin-bottom: 24px;">
      <tr>
        <td align="center">
          <div style="width: 80px; height: 80px; background: ${colors.errorMuted}; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 16px;">
            ${icons.alertTriangle(colors.error, 40)}
          </div>
        </td>
      </tr>
    </table>
    
    ${heading('Verification Update Required')}
    
    ${text(`Hi ${businessOwnerName},`)}
    
    ${text(`We've reviewed your verification request for <strong>${businessName}</strong> and need some additional information before we can verify your business.`)}
    
    ${adminNotes ? `
      <table role="presentation" cellpadding="0" cellspacing="0" style="width: 100%; margin: 24px 0; background: ${colors.errorMuted}; border-radius: ${borderRadius.lg}; border-left: 4px solid ${colors.error};">
        <tr>
          <td style="padding: 24px;">
            <table role="presentation" cellpadding="0" cellspacing="0" style="width: 100%;">
              <tr>
                <td style="width: 24px; vertical-align: top; padding-top: 2px;">
                  ${icons.message(colors.error, 18)}
                </td>
                <td>
                  <p style="margin: 0 0 8px 0; color: ${colors.error}; font-size: ${typography.sizeSm}; font-weight: ${typography.weightSemibold}; font-family: ${typography.fontFamily};">
                    Feedback from our team:
                  </p>
                  <p style="margin: 0; color: ${colors.textPrimary}; font-size: ${typography.sizeBase}; line-height: 1.6; font-family: ${typography.fontFamily};">
                    ${adminNotes}
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    ` : ''}
    
    ${text("Please update the required information and resubmit your verification request. If you have any questions, our support team is here to help.")}
    
    ${button('Update Business Info', dashboardUrl, true)}
    
    <table role="presentation" cellpadding="0" cellspacing="0" style="width: 100%; margin-top: 12px;">
      <tr>
        <td align="center">
          <a href="https://tarsit.com/help" style="display: inline-block; padding: 12px 24px; color: ${colors.textMuted}; text-decoration: none; font-size: ${typography.sizeSm}; font-family: ${typography.fontFamily}; border: 1px solid ${colors.glassBorder}; border-radius: ${borderRadius.lg};">
            Contact Support
          </a>
        </td>
      </tr>
    </table>
  `;

  return baseTemplate({
    previewText: isApproved
      ? `Congratulations! ${businessName} is now verified`
      : `Action needed: ${businessName} verification update`,
    content,
  });
};

export const verificationStatusSubject = (businessName: string, status: 'approved' | 'rejected') =>
  status === 'approved'
    ? `${businessName} is Now Verified!`
    : `Action Required: ${businessName} Verification`;
