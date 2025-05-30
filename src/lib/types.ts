export interface Message {
  messageid: string;
  role: 'customer' | 'agent';
  created_at: Date;
  content: string;
}
