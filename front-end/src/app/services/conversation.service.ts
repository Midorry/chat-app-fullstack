import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Conversation } from '../models/conversation.model';
import { ConversationView } from '../models/conversationview.model';

@Injectable({ providedIn: 'root' })
export class ConversationService {
  private apiUrl = 'http://localhost:3000/api/conversations';

  private selectedConversationIdSubject = new BehaviorSubject<string | null>(
    null
  );
  selectedConversationId$ = this.selectedConversationIdSubject.asObservable();

  constructor(private http: HttpClient) {}

  getUserConversations(userId: string): Observable<ConversationView[]> {
    return this.http.get<ConversationView[]>(`${this.apiUrl}/user/${userId}`);
  }

  createConversation(data: any): Observable<Conversation> {
    return this.http.post<Conversation>(`${this.apiUrl}`, data);
  }

  startChat(userId: string): Observable<Conversation> {
    return this.http.post<Conversation>(`${this.apiUrl}/create-one-to-one`, {
      userId,
    });
  }

  getConversationById(conversationId: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${conversationId}`);
  }
}
