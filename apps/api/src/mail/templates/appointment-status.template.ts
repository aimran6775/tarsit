import { baseTemplate, emailComponents } from './base.template';

export interface AppointmentStatusProps {
  firstName: string;
  businessName: string;
  serviceName: string;
  appointmentDate: Date;
  status: 'CONFIRMED' | 'COMPLETED';
  reviewUrl?: string;
}

export const appointmentStatusTemplate = ({
  firstName,
  businessName,
  serviceName,
  appointmentDate,
  status,
  reviewUrl,
}: AppointmentStatusProps): string => {
  const formattedDate = appointmentDate.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const formattedTime = appointmentDate.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });

  const isConfirmed = status === 'CONFIRMED';
  const statusEmoji = isConfirmed ? '✅' : '🎉';
  const statusText = isConfirmed ? 'Confirmed' : 'Completed';
  const bgGradient = isConfirmed 
    ? 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)'
    : 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)';
  const borderColor = isConfirmed ? '#10b981' : '#f59e0b';
  const labelColor = isConfirmed ? '#065f46' : '#92400e';

  const content = `
    ${emailComponents.heading(`Appointment ${statusText} ${statusEmoji}`)}
    
    ${emailComponents.text(`Hi ${firstName},`)}
    
    ${emailComponents.text(isConfirmed 
      ? `Great news! Your appointment with <strong>${businessName}</strong> has been confirmed.`
      : `Your appointment with <strong>${businessName}</strong> is now complete!`
    )}
    
    <table role="presentation" style="width: 100%; margin: 24px 0; background: ${bgGradient}; border-radius: 12px; border-left: 4px solid ${borderColor};">
      <tr>
        <td style="padding: 24px;">
          <table role="presentation" style="width: 100%;">
            <tr>
              <td style="padding: 8px 0;">
                <strong style="color: ${labelColor}; font-size: 12px; text-transform: uppercase;">Service</strong><br>
                <span style="color: #1f2937; font-size: 16px;">${serviceName}</span>
              </td>
            </tr>
            <tr>
              <td style="padding: 8px 0;">
                <strong style="color: ${labelColor}; font-size: 12px; text-transform: uppercase;">Date & Time</strong><br>
                <span style="color: #1f2937; font-size: 16px;">${formattedDate} at ${formattedTime}</span>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
    
    ${!isConfirmed && reviewUrl ? `
      ${emailComponents.text("We hope you had a great experience! Would you mind taking a moment to share your feedback?")}
      ${emailComponents.button('Leave a Review ⭐', reviewUrl, true)}
    ` : ''}
    
    ${isConfirmed ? emailComponents.text("We look forward to seeing you!", true) : ''}
  `;

  return baseTemplate({
    previewText: `Your appointment with ${businessName} has been ${statusText.toLowerCase()}`,
    content,
    footerText: !isConfirmed ? 'Thank you for choosing Tarsit!' : undefined,
  });
};

export const appointmentStatusSubject = (businessName: string, status: 'CONFIRMED' | 'COMPLETED') => 
  `Appointment ${status === 'CONFIRMED' ? 'Confirmed' : 'Completed'} - ${businessName}`;
