import { baseTemplate, emailComponents } from './base.template';

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
    ${emailComponents.heading('Verify Your Email ✉️')}
    
    ${emailComponents.text(`Hi ${firstName || 'there'},`)}
    
    ${emailComponents.text('Thanks for signing up for Tarsit! Please verify your email address to complete your registration and unlock all features.')}
    
    ${emailComponents.button('Verify Email Address', verificationUrl, true)}
    
    ${emailComponents.infoBox(`
      This verification link will expire in ${expiresInHours} hours.
    `, 'info')}
    
    ${emailComponents.text(`Or copy and paste this link into your browser:`, true)}
    <p style="margin: 8px 0 0 0; word-break: break-all; font-size: 12px; color: #6b7280; background: #f3f4f6; padding: 12px; border-radius: 6px;">
      ${verificationUrl}
    </p>
  `;

  return baseTemplate({
    previewText: 'Verify your email to complete your Tarsit registration',
    content,
    footerText: 'You received this email because you signed up for a Tarsit account.',
  });
};

export const verificationEmailSubject = 'Verify Your Email - Tarsit';
