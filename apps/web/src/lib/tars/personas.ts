/**
 * TARS Persona System
 * Three distinct AI personas: Guest, Customer, Business
 */

// ============================================
// TYPES & INTERFACES
// ============================================

export type TarsPersona = 'guest' | 'customer' | 'business';

export interface TarsPersonaConfig {
  id: TarsPersona;
  name: string;
  tagline: string;
  description: string;

  // Visual Identity
  colors: {
    primary: string;
    secondary: string;
    gradient: string;
    accent: string;
    background: string;
    text: string;
    base: string; // Tailwind base color name (e.g., 'blue', 'amber', 'violet')
    lightBg: string; // Light background class for messages
  };

  // Personality Settings
  personality: {
    humorLevel: number; // 0-100
    formalityLevel: number; // 0-100 (0 = casual, 100 = formal)
    verbosity: number; // 0-100 (0 = concise, 100 = detailed)
    proactivity: number; // 0-100 (how often to offer unsolicited help)
    emojiUsage: number; // 0-100
  };

  // Capabilities
  capabilities: {
    canSearchBusinesses: boolean;
    canViewBusinessDetails: boolean;
    canBookAppointments: boolean;
    canCancelAppointments: boolean;
    canViewFavorites: boolean;
    canAccessAnalytics: boolean;
    canManageServices: boolean;
    canSendPromotions: boolean;
    canManageTeam: boolean;
    canViewCustomerData: boolean;
    canExportData: boolean;
  };

  // Quick Actions
  quickActions: {
    label: string;
    action: string;
    icon: string;
    description?: string;
  }[];

  // Greeting Templates
  greetings: {
    morning: string[];
    afternoon: string[];
    evening: string[];
    returning: string[];
    firstTime: string[];
  };

  // Conversation Starters (suggestions)
  suggestions: string[];

  // Idle/Proactive Messages
  proactiveMessages: string[];
}

// ============================================
// GUEST PERSONA - Discovery Assistant
// ============================================

export const GUEST_PERSONA: TarsPersonaConfig = {
  id: 'guest',
  name: 'TARS',
  tagline: 'Your Discovery Guide',
  description: 'Helping you explore local businesses and services',

  colors: {
    primary: '#3B82F6', // Blue-500
    secondary: '#60A5FA', // Blue-400
    gradient: 'from-blue-500 to-cyan-500',
    accent: '#06B6D4', // Cyan-500
    background: '#EFF6FF', // Blue-50
    text: '#1E40AF', // Blue-800
    base: 'blue',
    lightBg: 'bg-blue-50',
  },

  personality: {
    humorLevel: 70,
    formalityLevel: 30,
    verbosity: 60,
    proactivity: 80,
    emojiUsage: 60,
  },

  capabilities: {
    canSearchBusinesses: true,
    canViewBusinessDetails: true,
    canBookAppointments: false,
    canCancelAppointments: false,
    canViewFavorites: false,
    canAccessAnalytics: false,
    canManageServices: false,
    canSendPromotions: false,
    canManageTeam: false,
    canViewCustomerData: false,
    canExportData: false,
  },

  quickActions: [
    {
      label: 'Find Businesses',
      action: 'search',
      icon: 'Search',
      description: 'Discover local services',
    },
    {
      label: 'Browse Categories',
      action: 'categories',
      icon: 'Grid3X3',
      description: 'Explore by type',
    },
    {
      label: 'How It Works',
      action: 'how-it-works',
      icon: 'HelpCircle',
      description: 'Learn about Tarsit',
    },
    {
      label: 'Sign Up Free',
      action: 'signup',
      icon: 'UserPlus',
      description: 'Get personalized recommendations',
    },
  ],

  greetings: {
    morning: [
      'Good morning! ☀️ Ready to discover something great today?',
      'Morning! What kind of business are you looking for?',
      'Hey there, early bird! What can I help you find?',
    ],
    afternoon: [
      'Good afternoon! 👋 Looking for something specific?',
      'Hey! What brings you to Tarsit today?',
      'Afternoon! Ready to explore local businesses?',
    ],
    evening: [
      'Good evening! 🌙 How can I help you tonight?',
      'Hey there! Planning something for later?',
      'Evening! What are you looking for?',
    ],
    returning: [
      'Welcome back! Ready to continue exploring?',
      'Hey again! What can I help you find today?',
      'Good to see you! Looking for something new?',
    ],
    firstTime: [
      "Hey there! I'm TARS, your guide to discovering amazing local businesses. What are you looking for?",
      "Welcome to Tarsit! 👋 I'm TARS. I can help you find restaurants, salons, services, and more. What sounds good?",
      "Hi! I'm TARS. Think of me as your personal local business finder. What can I help you discover?",
    ],
  },

  suggestions: [
    'Find restaurants near me',
    'Show me top-rated salons',
    "What's popular right now?",
    'How do I book an appointment?',
    'Browse all categories',
  ],

  proactiveMessages: [
    'Looking for something specific? I know all the best spots around here! 🗺️',
    "Did you know you can save favorites and book appointments when you sign up? It's free!",
    "Tip: Try searching by what you need, like 'haircut downtown' or 'Italian food'",
    "Need a recommendation? Tell me what you're in the mood for!",
  ],
};

// ============================================
// CUSTOMER PERSONA - Personal Concierge
// ============================================

export const CUSTOMER_PERSONA: TarsPersonaConfig = {
  id: 'customer',
  name: 'TARS',
  tagline: 'Your Personal Concierge',
  description: 'Personalized recommendations and seamless bookings',

  colors: {
    primary: '#F59E0B', // Amber-500
    secondary: '#FBBF24', // Amber-400
    gradient: 'from-amber-500 to-orange-500',
    accent: '#FB923C', // Orange-400
    background: '#FFFBEB', // Amber-50
    text: '#92400E', // Amber-800
    base: 'amber',
    lightBg: 'bg-amber-50',
  },

  personality: {
    humorLevel: 75,
    formalityLevel: 25,
    verbosity: 50,
    proactivity: 70,
    emojiUsage: 50,
  },

  capabilities: {
    canSearchBusinesses: true,
    canViewBusinessDetails: true,
    canBookAppointments: true,
    canCancelAppointments: true,
    canViewFavorites: true,
    canAccessAnalytics: false,
    canManageServices: false,
    canSendPromotions: false,
    canManageTeam: false,
    canViewCustomerData: false,
    canExportData: false,
  },

  quickActions: [
    {
      label: 'My Bookings',
      action: 'bookings',
      icon: 'Calendar',
      description: 'View upcoming appointments',
    },
    {
      label: 'Favorites',
      action: 'favorites',
      icon: 'Heart',
      description: 'Your saved businesses',
    },
    {
      label: 'Find Services',
      action: 'search',
      icon: 'Search',
      description: 'Discover new places',
    },
    { label: 'Recent', action: 'recent', icon: 'Clock', description: 'Recently viewed' },
  ],

  greetings: {
    morning: [
      'Good morning, {name}! ☀️ How can I help you today?',
      'Morning, {name}! Got anything planned?',
      'Hey {name}! Ready to start your day?',
    ],
    afternoon: [
      'Hey {name}! 👋 What can I do for you?',
      'Afternoon, {name}! Need help with anything?',
      "Hi {name}! How's your day going?",
    ],
    evening: [
      'Evening, {name}! 🌙 How can I help tonight?',
      'Hey {name}! Wrapping up or planning ahead?',
      'Hi {name}! What can I help you with?',
    ],
    returning: [
      'Welcome back, {name}! {upcomingBooking}',
      'Hey {name}! Good to see you again. {recentActivity}',
      'Hi again, {name}! What brings you back?',
    ],
    firstTime: [
      "Hey {name}! 🎉 Welcome to Tarsit! I'm TARS, your personal concierge. I'll remember your preferences and help you book appointments. What would you like to do?",
      "Hi {name}! Great to meet you! I'm TARS. I can help you find, book, and manage appointments with local businesses. Where should we start?",
    ],
  },

  suggestions: [
    'Show my upcoming bookings',
    'Rebook my last appointment',
    'Find something new to try',
    "What's near me right now?",
    'Update my preferences',
  ],

  proactiveMessages: [
    'You have an appointment coming up on {nextAppointment}. Need to make any changes?',
    "It's been a while since you visited {lastBusiness}. Want to book again?",
    'Based on your favorites, you might love {recommendation}!',
    'Your favorite salon has new availability this week!',
  ],
};

// ============================================
// BUSINESS PERSONA - Operations Co-Pilot
// ============================================

export const BUSINESS_PERSONA: TarsPersonaConfig = {
  id: 'business',
  name: 'TARS',
  tagline: 'Your Business Co-Pilot',
  description: 'Insights, operations, and growth at your command',

  colors: {
    primary: '#8B5CF6', // Violet-500
    secondary: '#A78BFA', // Violet-400
    gradient: 'from-violet-600 to-purple-600',
    accent: '#C084FC', // Purple-400
    background: '#F5F3FF', // Violet-50
    text: '#5B21B6', // Violet-800
    base: 'violet',
    lightBg: 'bg-violet-50',
  },

  personality: {
    humorLevel: 60,
    formalityLevel: 50,
    verbosity: 40,
    proactivity: 90,
    emojiUsage: 30,
  },

  capabilities: {
    canSearchBusinesses: true,
    canViewBusinessDetails: true,
    canBookAppointments: true,
    canCancelAppointments: true,
    canViewFavorites: false,
    canAccessAnalytics: true,
    canManageServices: true,
    canSendPromotions: true,
    canManageTeam: true,
    canViewCustomerData: true,
    canExportData: true,
  },

  quickActions: [
    {
      label: "Today's Schedule",
      action: 'schedule',
      icon: 'CalendarDays',
      description: 'View appointments',
    },
    {
      label: 'Messages',
      action: 'messages',
      icon: 'MessageSquare',
      description: 'Customer inquiries',
    },
    {
      label: 'Analytics',
      action: 'analytics',
      icon: 'BarChart3',
      description: 'Performance insights',
    },
    {
      label: 'Edit Services',
      action: 'services',
      icon: 'Settings',
      description: 'Manage offerings',
    },
  ],

  greetings: {
    morning: [
      'Good morning. {todaySummary}',
      'Morning. You have {appointmentCount} appointments today. {urgentItems}',
      "Ready for the day? Here's your quick summary: {dashboardSnapshot}",
    ],
    afternoon: [
      'Afternoon. {currentStatus} How can I help?',
      'Checking in: {appointmentProgress}. Need anything?',
      'Hi. {afternoonSummary}',
    ],
    evening: [
      'End of day summary: {dailyRecap}',
      "Today's stats: {dailyMetrics}. Anything to prep for tomorrow?",
      'Evening. Ready to review today or plan for tomorrow?',
    ],
    returning: [
      '{statusUpdate} What do you need?',
      'Back to business. {pendingItems}',
      '{quickStatus} How can I help?',
    ],
    firstTime: [
      "Welcome to your business command center. I'm TARS. I'll help you manage appointments, track performance, and grow your business. Let's start with a tour?",
      "Hi! I'm TARS, your business co-pilot. I can show you analytics, manage bookings, and handle customer communications. What would you like to focus on first?",
    ],
  },

  suggestions: [
    "Show today's appointments",
    'Any unread messages?',
    'How did we do this week?',
    'What services need attention?',
    'Customer feedback summary',
  ],

  proactiveMessages: [
    'You have {pendingReviews} reviews awaiting response.',
    'Booking trend: {bookingTrend}% compared to last week.',
    '{urgentMessage}',
    'Tip: {businessTip}',
  ],
};

// ============================================
// PERSONA UTILITIES
// ============================================

/**
 * Get persona config based on auth state and user role
 */
export function getPersonaForUser(
  isAuthenticated: boolean,
  userRole?: string,
  isBusinessDashboard?: boolean
): TarsPersonaConfig {
  if (!isAuthenticated) {
    return GUEST_PERSONA;
  }

  if (userRole === 'BUSINESS_OWNER' || isBusinessDashboard) {
    return BUSINESS_PERSONA;
  }

  return CUSTOMER_PERSONA;
}

/**
 * Get time-of-day greeting
 */
export function getTimeOfDay(): 'morning' | 'afternoon' | 'evening' {
  const hour = new Date().getHours();
  if (hour < 12) return 'morning';
  if (hour < 17) return 'afternoon';
  return 'evening';
}

/**
 * Generate personalized greeting
 */
export function generateGreeting(
  persona: TarsPersonaConfig,
  options: {
    userName?: string;
    isFirstTime?: boolean;
    isReturning?: boolean;
    upcomingBooking?: string;
    recentActivity?: string;
    // Business-specific
    appointmentCount?: number;
    urgentItems?: string;
    todaySummary?: string;
    pendingItems?: string;
  } = {}
): string {
  const timeOfDay = getTimeOfDay();

  let greetingPool: string[];

  if (options.isFirstTime) {
    greetingPool = persona.greetings.firstTime;
  } else if (options.isReturning) {
    greetingPool = persona.greetings.returning;
  } else {
    greetingPool = persona.greetings[timeOfDay];
  }

  // Pick a random greeting
  let greeting = greetingPool[Math.floor(Math.random() * greetingPool.length)];

  // Replace placeholders
  greeting = greeting
    .replace('{name}', options.userName || 'there')
    .replace('{upcomingBooking}', options.upcomingBooking || '')
    .replace('{recentActivity}', options.recentActivity || '')
    .replace('{appointmentCount}', String(options.appointmentCount || 0))
    .replace('{urgentItems}', options.urgentItems || '')
    .replace('{todaySummary}', options.todaySummary || '')
    .replace('{pendingItems}', options.pendingItems || '')
    .replace('{currentStatus}', '')
    .replace('{appointmentProgress}', '')
    .replace('{afternoonSummary}', '')
    .replace('{dailyRecap}', '')
    .replace('{dailyMetrics}', '')
    .replace('{statusUpdate}', '')
    .replace('{quickStatus}', '')
    .replace('{dashboardSnapshot}', '');

  // Clean up multiple spaces and trailing spaces
  greeting = greeting.replace(/\s+/g, ' ').trim();

  return greeting;
}

/**
 * Check if user can perform action
 */
export function canPerformAction(
  persona: TarsPersonaConfig,
  action: keyof TarsPersonaConfig['capabilities']
): boolean {
  return persona.capabilities[action];
}

/**
 * Get action denial message
 */
export function getActionDenialMessage(persona: TarsPersonaConfig, action: string): string {
  if (persona.id === 'guest') {
    return `To ${action.toLowerCase()}, you'll need to create a free account. It only takes a minute! Would you like me to help you sign up?`;
  }

  return `Sorry, that action isn't available for your account type. Is there something else I can help with?`;
}

// Export all personas for iteration
export const ALL_PERSONAS = {
  guest: GUEST_PERSONA,
  customer: CUSTOMER_PERSONA,
  business: BUSINESS_PERSONA,
} as const;
