import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Message } from '../models/massage.model';

@Injectable({ providedIn: 'root' })
export class MessageService {
  private apiUrl = 'http://localhost:3000/api/messages';

  // BehaviorSubject để lưu trạng thái các tin nhắn
  private messagesSubject = new BehaviorSubject<Message[]>([]);
  public messages$ = this.messagesSubject.asObservable();

  constructor(private http: HttpClient) {}

  // Gọi API lấy tin nhắn theo conversationId
  getMessages(conversationId: string): void {
    this.http.get<Message[]>(`${this.apiUrl}/${conversationId}`).subscribe({
      next: (messages) => this.setMessages(messages),
      error: (err) => console.error('Lỗi khi lấy message: ', err),
    });
  }

  getMessagesByPage(
    conversationId: string,
    page: number,
    limit: number
  ): Observable<Message[]> {
    return this.http.get<Message[]>(
      `${this.apiUrl}/${conversationId}?page=${page}&limit=${limit}`
    );
  }

  prependMessages(messages: Message[]) {
    const currentMessages = this.messagesSubject.getValue();
    // console.log('currentMessages:', currentMessages);
    // console.log('Messages:', messages);
    this.messagesSubject.next([...messages, ...currentMessages]);
  }

  // Gửi tin nhắn mới
  sendMessage(data: any): Observable<Message> {
    return this.http.post<Message>(`${this.apiUrl}`, data);
  }

  // Cập nhật toàn bộ danh sách tin nhắn
  setMessages(messages: Message[]) {
    this.messagesSubject.next(messages);
  }

  // Thêm một tin nhắn vào danh sách hiện tại
  addMessage(newMessage: Message) {
    const current = this.messagesSubject.getValue();
    this.messagesSubject.next([...current, newMessage]);
  }

  // Xóa danh sách tin nhắn hiện tại (khi chuyển cuộc trò chuyện)
  clearMessages() {
    this.messagesSubject.next([]);
  }

  addMessageToStore(message: Message) {
    const current = this.messagesSubject.value;
    this.messagesSubject.next([...current, message]);
  }
}
