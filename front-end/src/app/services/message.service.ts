import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Message } from '../models/massage.model';

@Injectable({ providedIn: 'root' })
export class MessageService {
  private apiUrl = 'http://localhost:3000/api/messages';

  constructor(private http: HttpClient) {}

  getMessages(conversationId: string): Observable<Message> {
    return this.http.get<Message>(`${this.apiUrl}/${conversationId}`);
  }

  sendMessage(data: any): Observable<Message> {
    return this.http.post<Message>(`${this.apiUrl}`, data);
  }
}
