import { baseTemplate, emailComponents } from './base.template';

export interface AppointmentReminderProps {
  firstName: string;
  businessName: string;
  serviceName: string;
  appointmentDate: Date;
  businessAddress: string;
  businessPhone?: string;
  appointmentUrl: string;
}

export const appointmentReminderTemplate = ({
  firstName,
  businessName,
  serviceName,
  appointmentDate,
  businessAddress,
  businessPhone,
  appointmentUrl,
}: AppointmentReminderProps): string => {
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
    ${emailComponents.heading('Appointment Reminder ⏰')}
    
    ${emailComponents.text(`Hi ${firstName},`)}
    
    ${emailComponents.text(`This is a friendly reminder about your upcoming appointment tomorrow!`)}
    
    <table role="presentation" style="width: 100%; margin: 24px 0; background: linear-gradient(135deg, #eff6ff 0%, #e0e7ff 100%); border-radius: 12px; border-left: 4px solid #3b82f6;">
      <tr>
        <td style="padding: 24px;">
          <table role="presentation" style="width: 100%;">
            <tr>
              <td style="padding: 8px 0;">
                <strong style="color: #1e40af; font-size: 12px; text-transform: uppercase;">Business</strong><br>
                <span style="color: #1f2937; font-size: 18px; font-weight: 600;">${businessName}</span>
              </td>
            </tr>
            <tr>
              <td style="padding: 8px 0;">
                <strong style="color: #1e40af; font-size: 12px; text-transform: uppercase;">Service</strong><br>
                <span style="color: #1f2937; font-size: 16px;">${serviceName}</span>
              </td>
            </tr>
            <tr>
              <td style="padding: 8px 0;">
                <strong style="color: #1e40af; font-size: 12px; text-transform: uppercase;">When</strong><br>
                <span style="color: #1f2937; font-size: 16px;">${formattedDate} at ${formattedTime}</span>
              </td>
            </tr>
            <tr>
              <td style="padding: 8px 0;">
                <strong style="color: #1e40af; font-size: 12px; text-transform: uppercase;">Where</strong><br>
                <span style="color: #1f2937; font-size: 16px;">${businessAddress}</span>
              </td>
            </tr>
            ${businessPhone ? `
            <tr>
              <td style="padding: 8px 0;">
                <strong style="color: #1e40af; font-size: 12px; text-transform: uppercase;">Contact</strong><br>
                <span style="color: #1f2937; font-size: 16px;">${businessPhone}</span>
              </td>
            </tr>
            ` : ''}
          </table>
        </td>
      </tr>
    </table>
    
    ${emailComponents.infoBox('Need to reschedule? Visit your dashboard to manage your appointments.', 'info')}
    
    ${emailComponents.button('View Appointment', appointmentUrl, true)}
  `;

  return baseTemplate({
    previewText: `Reminder: Your appointment with ${businessName} is tomorrow`,
    content,
  });
};

export const appointmentReminderSubject = (businessName: string) => 
  `Reminder: Appointment Tomorrow with ${businessName} ⏰`;
