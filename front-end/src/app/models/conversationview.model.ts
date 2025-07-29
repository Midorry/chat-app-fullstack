import { Message } from './massage.model';
import { User } from './user.model';

export interface ConversationView {
  _id: string;
  isGroup: boolean;
  name?: string;
  unseenCount: number;
  lastMessage?: Message;
  otherMember?: User; // nếu là 1-1 thì có field này
}
