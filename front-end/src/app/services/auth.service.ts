import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { User } from '../models/user.model';
import { environment } from '../environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthService {
  // private apiUrl = 'http://localhost:3000/api';
  private apiUrl = `${environment.apiUrl}/api`;

  constructor(private http: HttpClient) {}

  login(userData: any): Observable<{ user: User; token: string }> {
    return this.http.post<{
      user: User;
      token: string;
    }>(`${this.apiUrl}/auth/login`, userData);
  }

  register(userData: any): Observable<User> {
    return this.http.post<User>(`${this.apiUrl}/auth/register`, userData);
  }
}
