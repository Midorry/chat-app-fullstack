import { Message } from './massage.model';
import { User } from './user.model';

export interface Conversation {
  _id?: string;
  isGroup: boolean;
  name?: string; // optional, vì 1-1 thì không có name
  avatar?: string;
  members: User[]; // populated từ ObjectId -> User
  admins?: User[]; // optional
  createdBy: User; // populated
  lastMessage?: Message; // optional
}
