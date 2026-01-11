/**
 * TARS Voice Style Service
 * Adjusts response tone and style based on persona personality settings
 */

import { Injectable } from '@nestjs/common';

export interface PersonalitySettings {
  humorLevel: number; // 0-100
  formalityLevel: number; // 0-100 (0 = casual, 100 = formal)
  verbosity: number; // 0-100 (0 = concise, 100 = detailed)
  emojiUsage: number; // 0-100
}

export interface StyleOptions {
  responseLength?: 'short' | 'medium' | 'long';
  includeFollowUp?: boolean;
  context?: string;
}

// Persona presets matching frontend config
const PERSONA_PERSONALITIES: Record<string, PersonalitySettings> = {
  guest: {
    humorLevel: 70,
    formalityLevel: 30,
    verbosity: 60,
    emojiUsage: 60,
  },
  customer: {
    humorLevel: 75,
    formalityLevel: 25,
    verbosity: 50,
    emojiUsage: 50,
  },
  business: {
    humorLevel: 60,
    formalityLevel: 50,
    verbosity: 40,
    emojiUsage: 30,
  },
};

@Injectable()
export class TarsVoiceService {
  /**
   * Get personality settings for a persona
   */
  getPersonality(persona: string): PersonalitySettings {
    return PERSONA_PERSONALITIES[persona] || PERSONA_PERSONALITIES.guest;
  }

  /**
   * Generate a style instruction for the AI based on personality
   */
  generateStyleInstruction(persona: string): string {
    const personality = this.getPersonality(persona);
    const instructions: string[] = [];

    // Formality level
    if (personality.formalityLevel < 30) {
      instructions.push('Use a casual, friendly tone like talking to a friend');
      instructions.push('Feel free to use contractions and informal language');
    } else if (personality.formalityLevel < 60) {
      instructions.push('Use a conversational but professional tone');
      instructions.push('Balance friendliness with professionalism');
    } else {
      instructions.push('Maintain a professional, business-appropriate tone');
      instructions.push('Use clear, precise language');
    }

    // Humor level
    if (personality.humorLevel > 70) {
      instructions.push('Include light humor and playful comments when appropriate');
      instructions.push("Don't be afraid to make jokes or witty observations");
    } else if (personality.humorLevel > 40) {
      instructions.push('Occasional light humor is fine but keep focus on being helpful');
    } else {
      instructions.push('Keep responses focused and matter-of-fact');
    }

    // Verbosity
    if (personality.verbosity < 40) {
      instructions.push('Keep responses concise and to-the-point');
      instructions.push('Prioritize brevity over detail');
    } else if (personality.verbosity < 70) {
      instructions.push('Provide enough detail to be helpful without being verbose');
    } else {
      instructions.push('Feel free to provide detailed explanations when helpful');
    }

    // Emoji usage
    if (personality.emojiUsage > 60) {
      instructions.push('Use emojis to add personality and visual interest');
    } else if (personality.emojiUsage > 30) {
      instructions.push('Use emojis sparingly for emphasis');
    } else {
      instructions.push('Minimize or avoid emoji usage');
    }

    return instructions.join('. ') + '.';
  }

  /**
   * Adjust a response based on personality settings (post-processing)
   */
  adjustResponse(response: string, persona: string, options?: StyleOptions): string {
    const personality = this.getPersonality(persona);
    let adjusted = response;

    // Trim for concise personas
    if (personality.verbosity < 40 && options?.responseLength !== 'long') {
      // Try to trim to first paragraph or first 2-3 sentences
      const sentences = adjusted.split(/[.!?]+/).filter((s) => s.trim());
      if (sentences.length > 3) {
        adjusted = sentences.slice(0, 3).join('. ') + '.';
      }
    }

    // Add follow-up for proactive personas
    if (options?.includeFollowUp && personality.humorLevel > 50) {
      const followUps = this.getFollowUpSuggestions(persona, options.context);
      if (followUps.length > 0) {
        adjusted += `\n\n${followUps[0]}`;
      }
    }

    return adjusted;
  }

  /**
   * Get follow-up suggestions based on persona
   */
  private getFollowUpSuggestions(persona: string, _context?: string): string[] {
    const suggestions: Record<string, string[]> = {
      guest: [
        'Want me to show you some options? 🔍',
        'Shall I help you find something specific?',
        'I can search for more if you like!',
        'Ready to explore more? Just ask!',
      ],
      customer: [
        "Need help booking? I'm here!",
        'Want me to check your favorites for availability?',
        'Should I find something similar?',
        'I can help you compare options!',
      ],
      business: [
        'Need more details on any of these?',
        'Want me to drill down into the data?',
        'I can help you take action on this.',
        'Should I suggest next steps?',
      ],
    };

    return suggestions[persona] || suggestions.guest;
  }

  /**
   * Generate greeting based on time and persona
   */
  generateTimeBasedGreeting(persona: string, userName?: string, timeOfDay?: string): string {
    const time = timeOfDay || this.getCurrentTimeOfDay();
    // Personality could be used for more customization in the future
    void this.getPersonality(persona);

    const greetings: Record<string, Record<string, string[]>> = {
      guest: {
        morning: [
          'Good morning! ☀️ Ready to discover something great?',
          'Morning! What can I help you find today?',
          'Hey there, early bird! 🐦 Looking for something?',
        ],
        afternoon: [
          'Good afternoon! What brings you here today?',
          'Hi there! Searching for something specific?',
          'Afternoon! How can I help you discover local businesses?',
        ],
        evening: [
          'Good evening! Need help finding a place tonight?',
          'Evening! Looking for dinner or something else? 🌙',
          'Hey! Planning your evening? Let me help!',
        ],
      },
      customer: {
        morning: [
          `Good morning${userName ? `, ${userName}` : ''}! ☀️ How can I help today?`,
          `Morning${userName ? `, ${userName}` : ''}! Ready to discover something new?`,
        ],
        afternoon: [
          `Good afternoon${userName ? `, ${userName}` : ''}! What can I do for you?`,
          `Hey${userName ? `, ${userName}` : ''}! Need help with anything?`,
        ],
        evening: [
          `Good evening${userName ? `, ${userName}` : ''}! Planning something tonight?`,
          `Evening${userName ? `, ${userName}` : ''}! How can I help?`,
        ],
      },
      business: {
        morning: [
          `Good morning${userName ? `, ${userName}` : ''}. Ready to check on your business?`,
          'Morning. Your dashboard is ready.',
        ],
        afternoon: [
          `Afternoon${userName ? `, ${userName}` : ''}. How can I assist?`,
          'Good afternoon. What do you need?',
        ],
        evening: [
          `Evening${userName ? `, ${userName}` : ''}. Checking in before close?`,
          'Good evening. Need anything before wrapping up?',
        ],
      },
    };

    const personaGreetings = greetings[persona] || greetings.guest;
    const timeGreetings = personaGreetings[time] || personaGreetings.afternoon;

    return timeGreetings[Math.floor(Math.random() * timeGreetings.length)];
  }

  private getCurrentTimeOfDay(): string {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return 'morning';
    if (hour >= 12 && hour < 17) return 'afternoon';
    return 'evening';
  }
}
