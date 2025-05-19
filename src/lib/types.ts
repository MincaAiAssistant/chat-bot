export interface Attachment {
  name: string;
  mime: string;
  size: number;
  id: string;
  type: string;
}

export interface Message {
  messageid: string;
  chatid: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: Date;
  parent_message_id?: string;
  updated_at: Date;
  attachments?: Attachment[];
}

// Client Chat Assistant Types
export interface ClientChat {
  sessionId: string;
  lastMessage: string;
  lastTimestamp: Date;
  totalMessages: number;
}
export interface ClientMessage {
  messageid: string;
  role: 'user' | 'assistant';
  files?: Attachment[];
  created_at: Date;
  sessionId: string;
  content: string;
}

export interface CustomerChat {
  sessionid: string;
  created_at: Date;
  updated_at: Date;
}

export interface CustomerMessage {
  messageid: string;
  sessionid: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: Date;
  attachments?: Attachment[];
}
