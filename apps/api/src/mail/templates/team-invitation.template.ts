import { baseTemplate, emailComponents } from './base.template';

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
    ${emailComponents.heading("You're Invited! 🎉")}
    
    ${emailComponents.text(`Hi ${inviteeName || 'there'},`)}
    
    ${emailComponents.text(`<strong>${inviterName}</strong> has invited you to join the team at <strong>${businessName}</strong> on Tarsit.`)}
    
    <table role="presentation" style="width: 100%; margin: 24px 0; background: linear-gradient(135deg, #eff6ff 0%, #e0e7ff 100%); border-radius: 12px; padding: 24px;">
      <tr>
        <td>
          <div style="text-align: center; margin-bottom: 20px;">
            <div style="display: inline-block; background: linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%); color: white; padding: 8px 16px; border-radius: 20px; font-size: 14px; font-weight: 600;">
              ${role}
            </div>
          </div>
          
          <div style="text-align: left;">
            <strong style="color: #1e40af; font-size: 12px; text-transform: uppercase;">Your Permissions:</strong>
            <table role="presentation" style="width: 100%; margin-top: 12px;">
              ${permissions.map(p => `
                <tr>
                  <td style="padding: 6px 0; vertical-align: top; width: 24px;">
                    <span style="color: #10b981; font-size: 14px;">✓</span>
                  </td>
                  <td style="padding: 6px 0; padding-left: 8px; color: #374151; font-size: 14px;">
                    ${p}
                  </td>
                </tr>
              `).join('')}
            </table>
          </div>
        </td>
      </tr>
    </table>
    
    ${emailComponents.button('Accept Invitation', acceptUrl, true)}
    
    ${emailComponents.infoBox('This invitation will expire in 7 days.', 'warning')}
    
    ${emailComponents.text("If you don't recognize this business or didn't expect this invitation, you can safely ignore this email.", true)}
  `;

  return baseTemplate({
    previewText: `${inviterName} invited you to join ${businessName}`,
    content,
  });
};

export const teamInvitationSubject = (businessName: string) => 
  `You're Invited to Join ${businessName} on Tarsit 🎉`;
