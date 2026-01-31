import { baseTemplate, emailComponents } from './base.template';

export interface AppointmentRequestProps {
  businessOwnerName: string;
  businessName: string;
  customerName: string;
  serviceName: string;
  appointmentDate: Date;
  notes?: string;
  dashboardUrl: string;
}

export const appointmentRequestTemplate = ({
  businessOwnerName,
  businessName,
  customerName,
  serviceName,
  appointmentDate,
  notes,
  dashboardUrl,
}: AppointmentRequestProps): string => {
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
    ${emailComponents.heading('New Appointment Request')}
    
    ${emailComponents.text(`Hi ${businessOwnerName},`)}
    
    ${emailComponents.text(`You have a new appointment request for <strong>${businessName}</strong>!`)}
    
    <table role="presentation" style="width: 100%; margin: 24px 0; background: #f9fafb; border-radius: 12px; padding: 24px;">
      <tr>
        <td>
          <table role="presentation" style="width: 100%;">
            <tr>
              <td style="padding: 8px 0;">
                <strong style="color: #6b7280; font-size: 12px; text-transform: uppercase;">Customer</strong><br>
                <span style="color: #1f2937; font-size: 16px;">${customerName}</span>
              </td>
            </tr>
            <tr>
              <td style="padding: 8px 0;">
                <strong style="color: #6b7280; font-size: 12px; text-transform: uppercase;">Service</strong><br>
                <span style="color: #1f2937; font-size: 16px;">${serviceName}</span>
              </td>
            </tr>
            <tr>
              <td style="padding: 8px 0;">
                <strong style="color: #6b7280; font-size: 12px; text-transform: uppercase;">Requested Date & Time</strong><br>
                <span style="color: #1f2937; font-size: 16px;">${formattedDate} at ${formattedTime}</span>
              </td>
            </tr>
            ${notes ? `
            <tr>
              <td style="padding: 8px 0;">
                <strong style="color: #6b7280; font-size: 12px; text-transform: uppercase;">Notes from Customer</strong><br>
                <span style="color: #1f2937; font-size: 14px; font-style: italic;">"${notes}"</span>
              </td>
            </tr>
            ` : ''}
          </table>
        </td>
      </tr>
    </table>
    
    ${emailComponents.infoBox('Please respond to this request within 24 hours to confirm or reschedule.', 'warning')}
    
    ${emailComponents.button('View & Respond', dashboardUrl, true)}
  `;

  return baseTemplate({
    previewText: `New appointment request from ${customerName}`,
    content,
  });
};

export const appointmentRequestSubject = (customerName: string) => 
  `New Appointment Request from ${customerName}`;
