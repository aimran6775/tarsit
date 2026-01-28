import { baseTemplate, emailComponents } from './base.template';

export interface ReviewNotificationProps {
  businessOwnerName: string;
  businessName: string;
  reviewerName: string;
  rating: number;
  reviewText?: string;
  reviewUrl: string;
}

export const reviewNotificationTemplate = ({
  businessOwnerName,
  businessName,
  reviewerName,
  rating,
  reviewText,
  reviewUrl,
}: ReviewNotificationProps): string => {
  const stars = '★'.repeat(rating) + '☆'.repeat(5 - rating);
  
  const content = `
    ${emailComponents.heading('New Review for Your Business ⭐')}
    
    ${emailComponents.text(`Hi ${businessOwnerName},`)}
    
    ${emailComponents.text(`Great news! <strong>${reviewerName}</strong> just left a review for <strong>${businessName}</strong>.`)}
    
    <table role="presentation" style="width: 100%; margin: 24px 0; background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); border-radius: 12px; padding: 24px;">
      <tr>
        <td style="text-align: center;">
          <div style="font-size: 32px; letter-spacing: 4px; color: #f59e0b;">${stars}</div>
          <div style="margin-top: 8px; font-size: 14px; color: #92400e;">${rating} out of 5 stars</div>
        </td>
      </tr>
    </table>
    
    ${reviewText ? `
      <table role="presentation" style="width: 100%; margin: 16px 0;">
        <tr>
          <td style="background: #f9fafb; border-left: 4px solid #7c3aed; padding: 16px 20px; border-radius: 8px; font-style: italic; color: #4b5563;">
            "${reviewText}"
          </td>
        </tr>
      </table>
    ` : ''}
    
    ${emailComponents.button('View & Respond', reviewUrl, true)}
    
    ${emailComponents.text('Responding to reviews helps build trust with potential customers and shows you value feedback.', true)}
  `;

  return baseTemplate({
    previewText: `${reviewerName} left a ${rating}-star review for ${businessName}`,
    content,
  });
};

export const reviewNotificationSubject = (rating: number) => 
  `New ${rating}-Star Review for Your Business ⭐`;
