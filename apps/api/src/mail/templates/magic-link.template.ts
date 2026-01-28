import { baseTemplate, emailComponents } from './base.template';

const { button, text, heading, infoBox } = emailComponents;

export interface MagicLinkEmailProps {
  firstName: string;
  magicLinkUrl: string;
  expiresInMinutes?: number;
}

export const magicLinkEmailTemplate = ({
  firstName,
  magicLinkUrl,
  expiresInMinutes = 15,
}: MagicLinkEmailProps): string => {
  const content = `
    ${heading('Sign in to Tarsit 🔮')}
    
    ${text(`Hi ${firstName || 'there'},`)}
    
    ${text('Click the button below to securely sign in to your Tarsit account. No password needed!')}
    
    ${button('Sign In to Tarsit', magicLinkUrl, true)}
    
    ${infoBox(`
      <strong>🔒 Security Info:</strong><br>
      • This link expires in ${expiresInMinutes} minutes<br>
      • Can only be used once<br>
      • If you didn't request this, just ignore this email
    `, 'info')}
    
    ${text(`Or copy and paste this link into your browser:`, true)}
    <p style="margin: 8px 0 0 0; word-break: break-all; font-size: 12px; color: #6b7280; background: #f3f4f6; padding: 12px; border-radius: 6px;">
      ${magicLinkUrl}
    </p>
  `;

  return baseTemplate({
    previewText: 'Your magic link to sign in to Tarsit',
    content,
    footerText: 'You received this email because a magic link was requested for your account.',
  });
};

export const magicLinkEmailSubject = 'Sign in to Tarsit - Magic Link 🔮';
