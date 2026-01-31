import { baseTemplate, emailComponents } from './base.template';

export interface AppointmentConfirmationProps {
  firstName: string;
  businessName: string;
  serviceName: string;
  appointmentDate: Date;
  appointmentTime: string;
  businessAddress: string;
  businessPhone?: string;
  notes?: string;
}

export const appointmentConfirmationTemplate = ({
  firstName,
  businessName,
  serviceName,
  appointmentDate,
  appointmentTime,
  businessAddress,
  businessPhone,
  notes,
}: AppointmentConfirmationProps): string => {
  const formattedDate = appointmentDate.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const content = `
    ${emailComponents.heading('Appointment Confirmed')}
    
    ${emailComponents.text(`Hi ${firstName},`)}
    
    ${emailComponents.text(`Great news! Your appointment with <strong>${businessName}</strong> has been confirmed.`)}
    
    <table role="presentation" style="width: 100%; margin: 24px 0; background: #f9fafb; border-radius: 12px; padding: 24px;">
      <tr>
        <td>
          <table role="presentation" style="width: 100%;">
            <tr>
              <td style="padding: 8px 0;">
                <strong style="color: #6b7280; font-size: 12px; text-transform: uppercase;">Service</strong><br>
                <span style="color: #1f2937; font-size: 16px;">${serviceName}</span>
              </td>
            </tr>
            <tr>
              <td style="padding: 8px 0;">
                <strong style="color: #6b7280; font-size: 12px; text-transform: uppercase;">Date & Time</strong><br>
                <span style="color: #1f2937; font-size: 16px;">${formattedDate} at ${appointmentTime}</span>
              </td>
            </tr>
            <tr>
              <td style="padding: 8px 0;">
                <strong style="color: #6b7280; font-size: 12px; text-transform: uppercase;">Location</strong><br>
                <span style="color: #1f2937; font-size: 16px;">${businessAddress}</span>
              </td>
            </tr>
            ${businessPhone ? `
            <tr>
              <td style="padding: 8px 0;">
                <strong style="color: #6b7280; font-size: 12px; text-transform: uppercase;">Contact</strong><br>
                <span style="color: #1f2937; font-size: 16px;">${businessPhone}</span>
              </td>
            </tr>
            ` : ''}
            ${notes ? `
            <tr>
              <td style="padding: 8px 0;">
                <strong style="color: #6b7280; font-size: 12px; text-transform: uppercase;">Notes</strong><br>
                <span style="color: #1f2937; font-size: 14px;">${notes}</span>
              </td>
            </tr>
            ` : ''}
          </table>
        </td>
      </tr>
    </table>
    
    ${emailComponents.infoBox('Need to reschedule or cancel? You can manage your appointments from your Tarsit dashboard.', 'info')}
    
    ${emailComponents.button('View Appointment', 'https://tarsit.com/appointments', true)}
  `;

  return baseTemplate({
    previewText: `Your appointment with ${businessName} is confirmed for ${formattedDate}`,
    content,
  });
};

export const appointmentConfirmationSubject = (businessName: string) => 
  `Appointment Confirmed - ${businessName}`;
