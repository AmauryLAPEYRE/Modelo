import { create } from 'zustand';
import { MessageModel } from '../../domain/entities/MessageModel';
import { useAuthStore } from './authStore';

interface ConversationInfo {
  id: string; // applicationId
  partnerId: string;
  partnerName: string;
  partnerPicture?: string;
  lastMessage?: MessageModel;
  unreadCount: number;
  serviceId: string;
  serviceTitle: string;
}

interface MessageState {
  // État
  conversations: ConversationInfo[];
  messages: Record<string, MessageModel[]>; // conversationId -> messages
  currentConversationId: string | null;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  setConversations: (conversations: ConversationInfo[]) => void;
  addConversation: (conversation: ConversationInfo) => void;
  updateConversation: (conversationId: string, data: Partial<ConversationInfo>) => void;
  removeConversation: (conversationId: string) => void;
  
  setMessages: (conversationId: string, messages: MessageModel[]) => void;
  addMessage: (conversationId: string, message: MessageModel) => void;
  updateMessage: (conversationId: string, messageId: string, data: Partial<MessageModel>) => void;
  
  setCurrentConversation: (conversationId: string | null) => void;
  
  markConversationAsRead: (conversationId: string) => void;
  
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  
  // Getters
  getConversationById: (conversationId: string) => ConversationInfo | undefined;
  getMessagesForConversation: (conversationId: string) => MessageModel[];
  getConversationWithUser: (userId: string) => ConversationInfo | undefined;
  getTotalUnreadCount: () => number;
}

/**
 * Store Zustand pour gérer les messages
 */
export const useMessageStore = create<MessageState>((set, get) => ({
  // État initial
  conversations: [],
  messages: {},
  currentConversationId: null,
  isLoading: false,
  error: null,
  
  // Actions
  setConversations: (conversations: ConversationInfo[]) => set({ conversations }),
  
  addConversation: (conversation: ConversationInfo) => set(state => ({
    conversations: [...state.conversations, conversation]
  })),
  
  updateConversation: (conversationId: string, data: Partial<ConversationInfo>) => set(state => ({
    conversations: state.conversations.map(conv => 
      conv.id === conversationId 
        ? { ...conv, ...data } 
        : conv
    )
  })),
  
  removeConversation: (conversationId: string) => set(state => ({
    conversations: state.conversations.filter(conv => conv.id !== conversationId),
    messages: {
      ...state.messages,
      [conversationId]: undefined
    }
  })),
  
  setMessages: (conversationId: string, messages: MessageModel[]) => set(state => ({
    messages: {
      ...state.messages,
      [conversationId]: messages
    }
  })),
  
  addMessage: (conversationId: string, message: MessageModel) => set(state => {
    const currentMessages = state.messages[conversationId] || [];
    const newMessages = [...currentMessages, message];
    
    // Mettre à jour le dernier message et le compteur de non lus dans la conversation
    const userId = get().currentUserId;
    const conversations = state.conversations.map(conv => {
      if (conv.id === conversationId) {
        return {
          ...conv,
          lastMessage: message,
          unreadCount: message.senderId !== userId 
            ? conv.unreadCount + 1 
            : conv.unreadCount
        };
      }
      return conv;
    });
    
    return {
      messages: {
        ...state.messages,
        [conversationId]: newMessages
      },
      conversations
    };
  }),
  
  updateMessage: (conversationId: string, messageId: string, data: Partial<MessageModel>) => set(state => {
    const currentMessages = state.messages[conversationId] || [];
    const updatedMessages = currentMessages.map(msg => 
      msg.id === messageId 
        ? { ...msg, ...data } 
        : msg
    );
    
    return {
      messages: {
        ...state.messages,
        [conversationId]: updatedMessages
      }
    };
  }),
  
  setCurrentConversation: (conversationId: string | null) => set({ currentConversationId: conversationId }),
  
  markConversationAsRead: (conversationId: string) => set(state => {
    // Marquer tous les messages comme lus
    const currentMessages = state.messages[conversationId] || [];
    const userId = get().currentUserId;
    
    const updatedMessages = currentMessages.map(msg => {
      if (msg.receiverId === userId && !msg.isRead) {
        return { ...msg, isRead: true, readAt: new Date() };
      }
      return msg;
    });
    
    // Mettre à jour le compteur de non lus dans la conversation
    const conversations = state.conversations.map(conv => {
      if (conv.id === conversationId) {
        return {
          ...conv,
          unreadCount: 0
        };
      }
      return conv;
    });
    
    return {
      messages: {
        ...state.messages,
        [conversationId]: updatedMessages
      },
      conversations
    };
  }),
  
  setLoading: (isLoading: boolean) => set({ isLoading }),
  
  setError: (error: string | null) => set({ error }),
  
  // Getter pour une conversation par ID
  getConversationById: (conversationId: string) => {
    return get().conversations.find(conv => conv.id === conversationId);
  },
  
  // Getter pour les messages d'une conversation
  getMessagesForConversation: (conversationId: string) => {
    return get().messages[conversationId] || [];
  },
  
  // Getter pour une conversation avec un utilisateur spécifique
  getConversationWithUser: (userId: string) => {
    return get().conversations.find(conv => conv.partnerId === userId);
  },
  
  // Getter pour le nombre total de messages non lus
  getTotalUnreadCount: () => {
    return get().conversations.reduce((total, conv) => total + conv.unreadCount, 0);
  },
  
  // Propriété calculée pour l'ID de l'utilisateur courant
  get currentUserId(): string {
    const user = useAuthStore.getState().user;
    return user?.id || '';
  }
}));