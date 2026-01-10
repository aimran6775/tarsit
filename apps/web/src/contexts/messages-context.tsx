'use client';

import { createContext, ReactNode, useCallback, useContext, useState } from 'react';

interface MessagesContextType {
  isOpen: boolean;
  openMessages: () => void;
  closeMessages: () => void;
  openChat: (chatId: string) => void;
  pendingChatId: string | null;
  clearPendingChat: () => void;
}

const MessagesContext = createContext<MessagesContextType | undefined>(undefined);

export function MessagesProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [pendingChatId, setPendingChatId] = useState<string | null>(null);

  const openMessages = useCallback(() => {
    setIsOpen(true);
  }, []);

  const closeMessages = useCallback(() => {
    setIsOpen(false);
    setPendingChatId(null);
  }, []);

  const openChat = useCallback((chatId: string) => {
    setPendingChatId(chatId);
    setIsOpen(true);
  }, []);

  const clearPendingChat = useCallback(() => {
    setPendingChatId(null);
  }, []);

  return (
    <MessagesContext.Provider
      value={{
        isOpen,
        openMessages,
        closeMessages,
        openChat,
        pendingChatId,
        clearPendingChat,
      }}
    >
      {children}
    </MessagesContext.Provider>
  );
}

export function useMessages() {
  const context = useContext(MessagesContext);
  if (context === undefined) {
    throw new Error('useMessages must be used within a MessagesProvider');
  }
  return context;
}
