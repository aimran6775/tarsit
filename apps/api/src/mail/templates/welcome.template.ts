/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * WELCOME EMAIL TEMPLATE
 * ═══════════════════════════════════════════════════════════════════════════════
 * 
 * Onboarding email for new users with feature highlights and quick start guide.
 * Uses the Tarsit design system for consistent branding.
 * ═══════════════════════════════════════════════════════════════════════════════
 */

import { baseTemplate, emailComponents } from './base.template';
import { borderRadius, colors, icons, typography } from './design-system';

const { button, text, heading, divider, glassCard, smallText } = emailComponents;

export interface WelcomeEmailProps {
  firstName: string;
  appUrl?: string;
}

export const welcomeEmailTemplate = ({
  firstName,
  appUrl = 'https://tarsit.com',
}: WelcomeEmailProps): string => {
  
  const content = `
    <!-- Welcome hero with celebration -->
    <table role="presentation" cellpadding="0" cellspacing="0" style="width: 100%; margin-bottom: 24px;">
      <tr>
        <td align="center">
          <div style="width: 80px; height: 80px; background: ${colors.successMuted}; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 16px;">
            ${icons.celebration(colors.success, 40)}
          </div>
        </td>
      </tr>
    </table>
    
    ${heading('Welcome to Tarsit!')}
    
    ${text(`Hey ${firstName},`)}
    
    ${text("We're thrilled to have you join our community! Tarsit connects you with amazing local businesses — from cozy cafés to expert services, all in one place.")}
    
    ${button('Start Exploring', appUrl, true)}
    
    ${divider()}
    
    <!-- What you can do section -->
    <table role="presentation" cellpadding="0" cellspacing="0" style="width: 100%; margin-bottom: 16px;">
      <tr>
        <td>
          <p style="margin: 0 0 20px 0; color: ${colors.textPrimary}; font-size: ${typography.sizeLg}; font-weight: ${typography.weightSemibold}; font-family: ${typography.fontFamily};">
            Here's what you can do
          </p>
        </td>
      </tr>
    </table>
    
    <!-- Feature cards grid -->
    <table role="presentation" cellpadding="0" cellspacing="0" style="width: 100%;">
      <tr>
        <td style="padding-bottom: 12px;">
          ${featureCard(icons.search(colors.accentPrimary, 20), 'Discover', 'Find local businesses tailored to your interests and location')}
        </td>
      </tr>
      <tr>
        <td style="padding-bottom: 12px;">
          ${featureCard(icons.star(colors.accentPrimary, 20), 'Review', 'Share your experiences and help others find great spots')}
        </td>
      </tr>
      <tr>
        <td style="padding-bottom: 12px;">
          ${featureCard(icons.calendar(colors.accentPrimary, 20), 'Book', 'Schedule appointments directly with businesses')}
        </td>
      </tr>
      <tr>
        <td style="padding-bottom: 12px;">
          ${featureCard(icons.message(colors.accentPrimary, 20), 'Connect', 'Message business owners and get quick responses')}
        </td>
      </tr>
      <tr>
        <td>
          ${featureCard(icons.robot(colors.accentPrimary, 20), 'Ask Tars', 'Our AI assistant helps you find exactly what you need')}
        </td>
      </tr>
    </table>
    
    ${divider()}
    
    <!-- Quick tips section -->
    ${glassCard(`
      <table role="presentation" cellpadding="0" cellspacing="0" style="width: 100%;">
        <tr>
          <td style="vertical-align: top; width: 48px;">
            <div style="width: 40px; height: 40px; background: ${colors.accentGlow}; border-radius: 10px; text-align: center; padding: 8px; box-sizing: border-box;">
              ${icons.lightbulb(colors.accentPrimary, 24)}
            </div>
          </td>
          <td style="padding-left: 16px;">
            <p style="margin: 0 0 8px 0; color: ${colors.textPrimary}; font-size: ${typography.sizeBase}; font-weight: ${typography.weightSemibold}; font-family: ${typography.fontFamily};">
              Pro tip: Try Tars AI
            </p>
            <p style="margin: 0; color: ${colors.textSecondary}; font-size: ${typography.sizeSm}; line-height: 1.5; font-family: ${typography.fontFamily};">
              Just click the sparkle button anywhere in the app to ask Tars for personalized recommendations. Try "Find me a quiet café for working" or "Best-rated barber near me"!
            </p>
          </td>
        </tr>
      </table>
    `)}
    
    ${divider()}
    
    <!-- Support section -->
    <table role="presentation" cellpadding="0" cellspacing="0" style="width: 100%; text-align: center;">
      <tr>
        <td>
          ${smallText("Have questions? We're here to help!")}
          <table role="presentation" cellpadding="0" cellspacing="0" style="margin: 0 auto;">
            <tr>
              <td style="padding: 0 12px;">
                <a href="https://tarsit.com/help" style="color: ${colors.accentLight}; font-size: ${typography.sizeSm}; text-decoration: none; font-family: ${typography.fontFamily};">
                  Help Center
                </a>
              </td>
              <td style="color: ${colors.textSubtle};">•</td>
              <td style="padding: 0 12px;">
                <a href="mailto:support@tarsit.com" style="color: ${colors.accentLight}; font-size: ${typography.sizeSm}; text-decoration: none; font-family: ${typography.fontFamily};">
                  Contact Support
                </a>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  `;

  return baseTemplate({
    previewText: `Welcome to Tarsit, ${firstName}! Start discovering amazing local businesses.`,
    content,
    footerText: 'You received this email because you created a Tarsit account.',
  });
};

/**
 * Feature card component for welcome email
 */
function featureCard(icon: string, title: string, description: string): string {
  return `
    <table role="presentation" cellpadding="0" cellspacing="0" style="width: 100%; background: ${colors.bgTertiary}; border: 1px solid ${colors.glassBorder}; border-radius: ${borderRadius.lg};">
      <tr>
        <td style="padding: 16px 20px;">
          <table role="presentation" cellpadding="0" cellspacing="0" style="width: 100%;">
            <tr>
              <td style="vertical-align: top; width: 44px;">
                <div style="width: 36px; height: 36px; background: ${colors.glassBg}; border-radius: 8px; text-align: center; padding: 8px; box-sizing: border-box;">
                  ${icon}
                </div>
              </td>
              <td style="padding-left: 12px; vertical-align: middle;">
                <p style="margin: 0 0 4px 0; color: ${colors.textPrimary}; font-size: ${typography.sizeSm}; font-weight: ${typography.weightSemibold}; font-family: ${typography.fontFamily};">
                  ${title}
                </p>
                <p style="margin: 0; color: ${colors.textMuted}; font-size: ${typography.sizeXs}; line-height: 1.4; font-family: ${typography.fontFamily};">
                  ${description}
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  `;
}

export const welcomeEmailSubject = 'Welcome to Tarsit!';
