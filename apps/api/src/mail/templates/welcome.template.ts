import { baseTemplate, emailComponents } from './base.template';

const { button, text, heading, featureList, divider } = emailComponents;

export interface WelcomeEmailProps {
  firstName: string;
  appUrl: string;
}

export const welcomeEmailTemplate = ({
  firstName,
  appUrl,
}: WelcomeEmailProps): string => {
  const content = `
    ${heading('Welcome to Tarsit! 🎉')}
    
    ${text(`Hi ${firstName},`)}
    
    ${text('Thank you for joining Tarsit — the platform that connects you with amazing local businesses in your community!')}
    
    ${text("Here's what you can do with Tarsit:")}
    
    ${featureList([
      'Discover local businesses near you',
      'Read and write authentic reviews',
      'Book appointments directly',
      'Chat with business owners',
      'Save your favorite spots',
      'Get personalized recommendations from Tars AI',
    ])}
    
    ${button('Start Exploring', appUrl, true)}
    
    ${divider()}
    
    ${text('Need help getting started? Our AI assistant Tars is always here to help you find exactly what you need.', true)}
  `;

  return baseTemplate({
    previewText: `Welcome to Tarsit, ${firstName}! Start discovering local businesses.`,
    content,
  });
};

export const welcomeEmailSubject = 'Welcome to Tarsit! 🎉';
