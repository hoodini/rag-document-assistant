import { create } from 'zustand';
import { Chat, ChatMessage, Document, DocumentInsight } from '@/types';

interface AppState {
  // Document state
  documents: Document[];
  selectedDocument: Document | null;
  isUploading: boolean;
  setDocuments: (documents: Document[]) => void;
  addDocument: (document: Document) => void;
  removeDocument: (id: string) => void;
  setSelectedDocument: (document: Document | null) => void;
  setIsUploading: (isUploading: boolean) => void;
  
  // Chat state
  chats: Chat[];
  currentChat: Chat | null;
  isLoadingChat: boolean;
  addChat: (chat: Chat) => void;
  setChats: (chats: Chat[]) => void;
  setCurrentChat: (chat: Chat | null) => void;
  addMessageToCurrentChat: (message: ChatMessage) => void;
  setIsLoadingChat: (isLoading: boolean) => void;
  
  // Insights state
  insights: DocumentInsight[];
  isLoadingInsights: boolean;
  setInsights: (insights: DocumentInsight[]) => void;
  addInsight: (insight: DocumentInsight) => void;
  setIsLoadingInsights: (isLoading: boolean) => void;
  
  // UI state
  sidebarOpen: boolean;
  currentView: 'chat' | 'documents' | 'insights';
  toggleSidebar: () => void;
  setCurrentView: (view: 'chat' | 'documents' | 'insights') => void;
}

export const useAppStore = create<AppState>((set) => ({
  // Document state
  documents: [],
  selectedDocument: null,
  isUploading: false,
  setDocuments: (documents) => set({ documents }),
  addDocument: (document) => set((state) => ({ 
    documents: [...state.documents, document] 
  })),
  removeDocument: (id) => set((state) => ({ 
    documents: state.documents.filter((doc) => doc.id !== id) 
  })),
  setSelectedDocument: (document) => set({ selectedDocument: document }),
  setIsUploading: (isUploading) => set({ isUploading }),
  
  // Chat state
  chats: [],
  currentChat: null,
  isLoadingChat: false,
  addChat: (chat) => set((state) => ({ 
    chats: [...state.chats, chat],
    currentChat: chat
  })),
  setChats: (chats) => set({ chats }),
  setCurrentChat: (chat) => set({ currentChat: chat }),
  addMessageToCurrentChat: (message) => set((state) => {
    if (!state.currentChat) return state;
    
    const updatedChat = {
      ...state.currentChat,
      messages: [...state.currentChat.messages, message],
      updatedAt: new Date()
    };
    
    const updatedChats = state.chats.map((chat) => 
      chat.id === updatedChat.id ? updatedChat : chat
    );
    
    return {
      currentChat: updatedChat,
      chats: updatedChats
    };
  }),
  setIsLoadingChat: (isLoadingChat) => set({ isLoadingChat }),
  
  // Insights state
  insights: [],
  isLoadingInsights: false,
  setInsights: (insights) => set({ insights }),
  addInsight: (insight) => set((state) => ({ 
    insights: [...state.insights, insight] 
  })),
  setIsLoadingInsights: (isLoadingInsights) => set({ isLoadingInsights }),
  
  // UI state
  sidebarOpen: true,
  currentView: 'chat',
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setCurrentView: (currentView) => set({ currentView })
})); 