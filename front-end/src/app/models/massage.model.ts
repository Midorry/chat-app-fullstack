export interface Message {
  _id?: string;
  conversationId: string;
  senderId: { _id: string; username?: string; avatar?: string };
  content: string;
  type?: string;
  attachments?: string[];
  seenBy?: string[];
  createdAt?: string;
}
