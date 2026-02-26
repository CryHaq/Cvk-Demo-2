/**
 * Chat Type Definitions
 * 
 * Bu interface'ler hem mock API'de hem de gerçek API'de kullanılacak.
 */

export interface ChatSession {
  id: string;
  userInfo: {
    name: string;
    email: string;
    phone?: string;
  };
  agent?: {
    id?: number;
    name: string;
    avatar: string;
    title: string;
  };
  createdAt: string;
  status?: 'active' | 'waiting' | 'closed';
}

export interface ChatMessage {
  id: number;
  sender: 'user' | 'agent' | 'system';
  text: string;
  timestamp: string;
  agentName?: string;
  agentAvatar?: string;
  attachmentUrl?: string;
}

export interface ChatAgent {
  id: number;
  name: string;
  email: string;
  avatar: string;
  title: string;
  status: 'online' | 'busy' | 'offline';
  maxChats?: number;
}

export interface QuickReply {
  id: number;
  category: string;
  text: string;
  sortOrder?: number;
}
