/**
 * Base email template with Tarsit branding
 * All email templates extend this base layout
 */

export interface BaseTemplateProps {
  previewText?: string;
  content: string;
  footerText?: string;
}

export const baseTemplate = ({ previewText, content, footerText }: BaseTemplateProps): string => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>Tarsit</title>
  ${previewText ? `<span style="display:none;font-size:1px;color:#ffffff;line-height:1px;max-height:0px;max-width:0px;opacity:0;overflow:hidden;">${previewText}</span>` : ''}
  <style>
    /* Reset styles */
    body, table, td, p, a, li, blockquote {
      -webkit-text-size-adjust: 100%;
      -ms-text-size-adjust: 100%;
    }
    table, td {
      mso-table-lspace: 0pt;
      mso-table-rspace: 0pt;
    }
    img {
      -ms-interpolation-mode: bicubic;
      border: 0;
      height: auto;
      line-height: 100%;
      outline: none;
      text-decoration: none;
    }
    body {
      margin: 0 !important;
      padding: 0 !important;
      width: 100% !important;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
    }
    
    /* Dark mode support */
    @media (prefers-color-scheme: dark) {
      .email-bg { background-color: #1a1a2e !important; }
      .content-bg { background-color: #16213e !important; }
      .text-primary { color: #ffffff !important; }
      .text-secondary { color: #a0aec0 !important; }
    }
    
    /* Responsive styles */
    @media only screen and (max-width: 600px) {
      .container { width: 100% !important; padding: 0 16px !important; }
      .content-padding { padding: 24px 16px !important; }
      .button { padding: 14px 24px !important; }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #f4f4f7;">
  <table role="presentation" class="email-bg" style="width: 100%; background-color: #f4f4f7; padding: 40px 0;">
    <tr>
      <td align="center">
        <table role="presentation" class="container" style="width: 100%; max-width: 600px; margin: 0 auto;">
          <!-- Header with Logo -->
          <tr>
            <td style="padding: 0 0 24px 0; text-align: center;">
              <div style="display: inline-flex; align-items: center; gap: 8px;">
                <div style="width: 40px; height: 40px; background: linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%); border-radius: 10px; display: inline-flex; align-items: center; justify-content: center;">
                  <span style="color: white; font-size: 20px; font-weight: bold;">T</span>
                </div>
                <span style="font-size: 24px; font-weight: 700; color: #1a1a2e;">Tarsit</span>
              </div>
            </td>
          </tr>
          
          <!-- Main Content Card -->
          <tr>
            <td>
              <table role="presentation" class="content-bg" style="width: 100%; background-color: #ffffff; border-radius: 16px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
                <tr>
                  <td class="content-padding" style="padding: 40px 48px;">
                    ${content}
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 32px 0; text-align: center;">
              <p class="text-secondary" style="margin: 0 0 16px 0; font-size: 14px; color: #6b7280;">
                ${footerText || 'Connecting small businesses to the world'}
              </p>
              <p class="text-secondary" style="margin: 0; font-size: 12px; color: #9ca3af;">
                &copy; ${new Date().getFullYear()} Tarsit. All rights reserved.
              </p>
              <p style="margin: 16px 0 0 0;">
                <a href="https://tarsit.com" style="color: #7c3aed; text-decoration: none; font-size: 12px; margin: 0 8px;">Website</a>
                <span style="color: #d1d5db;">|</span>
                <a href="https://tarsit.com/help" style="color: #7c3aed; text-decoration: none; font-size: 12px; margin: 0 8px;">Help Center</a>
                <span style="color: #d1d5db;">|</span>
                <a href="https://tarsit.com/privacy" style="color: #7c3aed; text-decoration: none; font-size: 12px; margin: 0 8px;">Privacy</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

/**
 * Common UI components for email templates
 */
export const emailComponents = {
  /** Primary CTA button */
  button: (text: string, href: string, fullWidth = false) => `
    <table role="presentation" style="width: ${fullWidth ? '100%' : 'auto'}; margin: 24px 0;">
      <tr>
        <td align="center">
          <a href="${href}" class="button" style="display: inline-block; background: linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%); color: #ffffff; font-size: 16px; font-weight: 600; text-decoration: none; padding: 16px 32px; border-radius: 12px; box-shadow: 0 4px 14px 0 rgba(124, 58, 237, 0.4);">
            ${text}
          </a>
        </td>
      </tr>
    </table>
  `,

  /** Secondary/outline button */
  secondaryButton: (text: string, href: string) => `
    <table role="presentation" style="width: auto; margin: 16px 0;">
      <tr>
        <td align="center">
          <a href="${href}" style="display: inline-block; background: #f3f4f6; color: #374151; font-size: 14px; font-weight: 500; text-decoration: none; padding: 12px 24px; border-radius: 8px; border: 1px solid #e5e7eb;">
            ${text}
          </a>
        </td>
      </tr>
    </table>
  `,

  /** Info box with icon */
  infoBox: (content: string, type: 'info' | 'warning' | 'success' = 'info') => {
    const colors = {
      info: { bg: '#eff6ff', border: '#3b82f6', text: '#1e40af' },
      warning: { bg: '#fffbeb', border: '#f59e0b', text: '#92400e' },
      success: { bg: '#ecfdf5', border: '#10b981', text: '#065f46' },
    };
    const c = colors[type];
    return `
      <table role="presentation" style="width: 100%; margin: 24px 0;">
        <tr>
          <td style="background-color: ${c.bg}; border-left: 4px solid ${c.border}; padding: 16px 20px; border-radius: 8px;">
            <p style="margin: 0; color: ${c.text}; font-size: 14px; line-height: 1.5;">
              ${content}
            </p>
          </td>
        </tr>
      </table>
    `;
  },

  /** Divider line */
  divider: () => `
    <table role="presentation" style="width: 100%; margin: 24px 0;">
      <tr>
        <td style="border-top: 1px solid #e5e7eb;"></td>
      </tr>
    </table>
  `,

  /** Heading */
  heading: (text: string, level: 1 | 2 | 3 = 1) => {
    const sizes = { 1: '28px', 2: '22px', 3: '18px' };
    return `<h${level} class="text-primary" style="margin: 0 0 16px 0; color: #1a1a2e; font-size: ${sizes[level]}; font-weight: 700; line-height: 1.3;">${text}</h${level}>`;
  },

  /** Paragraph text */
  text: (content: string, muted = false) => `
    <p class="${muted ? 'text-secondary' : 'text-primary'}" style="margin: 0 0 16px 0; color: ${muted ? '#6b7280' : '#374151'}; font-size: 16px; line-height: 1.6;">
      ${content}
    </p>
  `,

  /** Code/token display */
  code: (text: string) => `
    <table role="presentation" style="width: 100%; margin: 20px 0;">
      <tr>
        <td align="center">
          <div style="display: inline-block; background-color: #f3f4f6; padding: 16px 32px; border-radius: 8px; font-family: 'SF Mono', Monaco, 'Courier New', monospace; font-size: 24px; font-weight: 600; letter-spacing: 4px; color: #1a1a2e;">
            ${text}
          </div>
        </td>
      </tr>
    </table>
  `,

  /** Feature list with checkmarks */
  featureList: (items: string[]) => `
    <table role="presentation" style="width: 100%; margin: 16px 0;">
      ${items.map(item => `
        <tr>
          <td style="padding: 8px 0; vertical-align: top; width: 24px;">
            <span style="color: #10b981; font-size: 16px;">✓</span>
          </td>
          <td style="padding: 8px 0; padding-left: 12px; color: #374151; font-size: 15px;">
            ${item}
          </td>
        </tr>
      `).join('')}
    </table>
  `,
};
