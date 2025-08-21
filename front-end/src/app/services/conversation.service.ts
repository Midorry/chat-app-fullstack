import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Conversation } from '../models/conversation.model';
import { ConversationView } from '../models/conversationview.model';
import { Message } from '../models/massage.model';
import { environment } from '../environments/environment';

@Injectable({ providedIn: 'root' })
export class ConversationService {
  // private apiUrl = 'http://localhost:3000/api/conversations';
  private apiUrl = `${environment.apiUrl}/api/conversations`;

  // Subject để lưu trữ và cập nhật danh sách
  private conversationsSubject = new BehaviorSubject<ConversationView[]>([]);
  public conversations$ = this.conversationsSubject.asObservable();

  constructor(private http: HttpClient) {}

  /** Gọi API lấy tất cả cuộc trò chuyện của user */
  getUserConversations(userId: string): void {
    this.http
      .get<ConversationView[]>(`${this.apiUrl}/user/${userId}`)
      .subscribe((conversations) => {
        this.conversationsSubject.next(conversations);
      });
  }

  /** Tạo conversation mới */
  createConversation(data: any): Observable<Conversation> {
    return this.http.post<Conversation>(`${this.apiUrl}`, data);
  }

  /** Tạo 1-1 chat */
  startChat(userId: string): Observable<Conversation> {
    return this.http.post<Conversation>(`${this.apiUrl}/create-one-to-one`, {
      userId,
    });
  }

  /** Lấy chi tiết 1 cuộc hội thoại */
  getConversationById(conversationId: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${conversationId}`);
  }

  /*Cập nhật danh sách conversation khi có tin nhắn mới */
  updateConversationOnNewMessage(newMessage: Message): void {
    const currentConversations = this.conversationsSubject.getValue();
    // console.log(newMessage);

    const updatedConversationIndex = currentConversations.findIndex(
      (c) => c._id === newMessage.conversationId
    );

    if (updatedConversationIndex !== -1) {
      const updatedConversation = {
        ...currentConversations[updatedConversationIndex],
        lastMessage: newMessage,
        updatedAt: new Date().toISOString(), // hoặc từ newMessage.createdAt
      };

      //Di chuyển conversation lên đầu
      const newConversations = [
        updatedConversation,
        ...currentConversations.filter(
          (_, i) => i !== updatedConversationIndex
        ),
      ];
      // console.log(newConversations);

      this.conversationsSubject.next(newConversations);
    }
  }

  updateConversationUnseenCount(
    counts: { conversationId: string; unseenCount: number }[]
  ) {
    const updated = this.conversationsSubject.value.map((convo) => {
      const match = counts.find((c) => c.conversationId === convo._id);
      return match ? { ...convo, unseenCount: match.unseenCount } : convo;
    });
    this.conversationsSubject.next(updated);
  }

  handleIncomingMessage(message: Message, currentUserId: string) {
    const current = this.conversationsSubject.getValue();
    const index = current.findIndex((c) => c._id === message.conversationId);

    if (index !== -1) {
      const convo = current[index];

      // Nếu current user không phải là người gửi thì tăng unseenCount
      const newUnseenCount =
        message.senderId._id !== currentUserId
          ? (convo.unseenCount || 0) + 1
          : convo.unseenCount;

      const updatedConvo = {
        ...convo,
        lastMessage: message,
        unseenCount: newUnseenCount,
      };

      const updatedList = [...current];
      updatedList[index] = updatedConvo;

      // Đưa conversation lên đầu list
      updatedList.sort((a, b) => {
        const aTime = new Date(a.lastMessage?.createdAt || 0).getTime();
        const bTime = new Date(b.lastMessage?.createdAt || 0).getTime();
        return bTime - aTime;
      });

      this.conversationsSubject.next(updatedList);
    } else {
      // Nếu là cuộc trò chuyện mới thì thêm vào
      this.getUserConversations(currentUserId); // hoặc gọi API lấy lại
    }
  }

  markConversationAsSeen(convoId: string) {
    const current = this.conversationsSubject.getValue();
    const updated = current.map((c) =>
      c._id === convoId ? { ...c, unseenCount: 0 } : c
    );
    this.conversationsSubject.next(updated);
  }

  clearConversations(): void {
    this.conversationsSubject.next([]); // Xóa toàn bộ dữ liệu cũ
  }
}
