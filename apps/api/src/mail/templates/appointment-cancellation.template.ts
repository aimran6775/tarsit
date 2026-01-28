import { baseTemplate, emailComponents } from './base.template';

export interface AppointmentCancellationProps {
  firstName: string;
  businessName: string;
  serviceName: string;
  appointmentDate: Date;
  canceledBy: 'customer' | 'business';
  reason?: string;
  rebookUrl: string;
}

export const appointmentCancellationTemplate = ({
  firstName,
  businessName,
  serviceName,
  appointmentDate,
  canceledBy,
  reason,
  rebookUrl,
}: AppointmentCancellationProps): string => {
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

  const content = `
    ${emailComponents.heading('Appointment Cancelled ❌')}
    
    ${emailComponents.text(`Hi ${firstName},`)}
    
    ${emailComponents.text(`Your appointment with <strong>${businessName}</strong> has been cancelled${canceledBy === 'business' ? ' by the business' : ''}.`)}
    
    <table role="presentation" style="width: 100%; margin: 24px 0; background: #fef2f2; border-radius: 12px; border-left: 4px solid #ef4444;">
      <tr>
        <td style="padding: 24px;">
          <table role="presentation" style="width: 100%;">
            <tr>
              <td style="padding: 8px 0;">
                <strong style="color: #991b1b; font-size: 12px; text-transform: uppercase;">Service</strong><br>
                <span style="color: #1f2937; font-size: 16px;">${serviceName}</span>
              </td>
            </tr>
            <tr>
              <td style="padding: 8px 0;">
                <strong style="color: #991b1b; font-size: 12px; text-transform: uppercase;">Originally Scheduled</strong><br>
                <span style="color: #1f2937; font-size: 16px;">${formattedDate} at ${formattedTime}</span>
              </td>
            </tr>
            ${reason ? `
            <tr>
              <td style="padding: 8px 0;">
                <strong style="color: #991b1b; font-size: 12px; text-transform: uppercase;">Reason</strong><br>
                <span style="color: #1f2937; font-size: 14px;">${reason}</span>
              </td>
            </tr>
            ` : ''}
          </table>
        </td>
      </tr>
    </table>
    
    ${emailComponents.text("We're sorry for any inconvenience. Would you like to book another appointment?")}
    
    ${emailComponents.button('Book Another Appointment', rebookUrl, true)}
  `;

  return baseTemplate({
    previewText: `Your appointment with ${businessName} has been cancelled`,
    content,
    footerText: 'We hope to see you again soon!',
  });
};

export const appointmentCancellationSubject = (businessName: string) => 
  `Appointment Cancelled - ${businessName}`;
