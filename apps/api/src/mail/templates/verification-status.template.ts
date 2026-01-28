import { baseTemplate, emailComponents } from './base.template';

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
    ${emailComponents.heading('Congratulations! 🎉')}
    
    ${emailComponents.text(`Hi ${businessOwnerName},`)}
    
    ${emailComponents.text(`Great news! Your business <strong>${businessName}</strong> has been <strong style="color: #10b981;">verified</strong>!`)}
    
    <table role="presentation" style="width: 100%; margin: 24px 0; background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%); border-radius: 12px; text-align: center; padding: 32px;">
      <tr>
        <td>
          <div style="font-size: 48px; margin-bottom: 16px;">✅</div>
          <div style="font-size: 20px; font-weight: 700; color: #065f46;">Business Verified</div>
          <div style="font-size: 14px; color: #047857; margin-top: 8px;">Your business now has a verified badge</div>
        </td>
      </tr>
    </table>
    
    ${emailComponents.text("Here's what this means for you:")}
    
    ${emailComponents.featureList([
      'Verified badge displayed on your business profile',
      'Higher visibility in search results',
      'Increased trust from potential customers',
      'Access to premium business features',
    ])}
    
    ${emailComponents.button('Go to Dashboard', dashboardUrl, true)}
  ` : `
    ${emailComponents.heading('Verification Update Required ⚠️')}
    
    ${emailComponents.text(`Hi ${businessOwnerName},`)}
    
    ${emailComponents.text(`We've reviewed your verification request for <strong>${businessName}</strong> and need some additional information before we can verify your business.`)}
    
    ${adminNotes ? `
      <table role="presentation" style="width: 100%; margin: 24px 0; background: #fef2f2; border-radius: 12px; border-left: 4px solid #ef4444;">
        <tr>
          <td style="padding: 24px;">
            <strong style="color: #991b1b; font-size: 14px;">Feedback from our team:</strong>
            <p style="color: #1f2937; margin: 12px 0 0 0; font-size: 15px;">${adminNotes}</p>
          </td>
        </tr>
      </table>
    ` : ''}
    
    ${emailComponents.text("Please update the required information and resubmit your verification request. If you have any questions, our support team is here to help.")}
    
    ${emailComponents.button('Update Business Info', dashboardUrl, true)}
    
    ${emailComponents.secondaryButton('Contact Support', 'https://tarsit.com/help')}
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
    ? `🎉 ${businessName} is Now Verified!`
    : `Action Required: ${businessName} Verification`;
