export interface Chat {
  id: string;
  business: {
    id: string;
    name: string;
    slug: string;
    logoImage?: string;
    category: { name: string };
    city: string;
    state: string;
    phone?: string;
    email?: string;
  };
  lastMessage?: {
    content: string;
    createdAt: string;
    senderId: string;
    isRead: boolean;
  };
  unreadCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Message {
  id: string;
  chatId: string;
  senderId: string;
  senderType: 'user' | 'business';
  content: string;
  type?: 'TEXT' | 'IMAGE' | 'FILE' | 'SYSTEM';
  attachments?: string[];
  isRead: boolean;
  readAt?: string;
  createdAt: string;
  sender?: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    avatar?: string;
  };
}
