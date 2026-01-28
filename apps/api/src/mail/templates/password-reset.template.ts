import { baseTemplate, emailComponents } from './base.template';

const { button, text, heading, infoBox, divider } = emailComponents;

export interface PasswordResetEmailProps {
  firstName: string;
  resetUrl: string;
  expiresInMinutes?: number;
}

export const passwordResetEmailTemplate = ({
  firstName,
  resetUrl,
  expiresInMinutes = 60,
}: PasswordResetEmailProps): string => {
  const content = `
    ${heading('Reset Your Password 🔐')}
    
    ${text(`Hi ${firstName || 'there'},`)}
    
    ${text('We received a request to reset your password for your Tarsit account. Click the button below to choose a new password.')}
    
    ${button('Reset Password', resetUrl, true)}
    
    ${infoBox(`
      <strong>⏰ Time Sensitive:</strong><br>
      This link will expire in ${expiresInMinutes} minutes for security reasons.
    `, 'warning')}
    
    ${divider()}
    
    ${text(`Didn't request this? No worries — your password won't be changed unless you click the button above. If you're concerned about your account security, you can <a href="https://tarsit.com/help" style="color: #7c3aed;">contact our support team</a>.`, true)}
    
    ${text(`Or copy and paste this link into your browser:`, true)}
    <p style="margin: 8px 0 0 0; word-break: break-all; font-size: 12px; color: #6b7280; background: #f3f4f6; padding: 12px; border-radius: 6px;">
      ${resetUrl}
    </p>
  `;

  return baseTemplate({
    previewText: 'Reset your Tarsit password',
    content,
    footerText: 'You received this email because a password reset was requested for your account.',
  });
};

export const passwordResetEmailSubject = 'Reset Your Password - Tarsit';
