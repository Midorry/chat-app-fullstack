import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { User } from '../models/user.model';
import { environment } from '../environments/environment';

@Injectable({ providedIn: 'root' })
export class UserService {
  // private apiUrl = 'http://localhost:3000/api/users';
  private apiUrl = `${environment.apiUrl}/api/users`;

  // Bộ nhớ tạm lưu danh sách users
  private usersSubject = new BehaviorSubject<User[]>([]);
  users$ = this.usersSubject.asObservable();

  constructor(private http: HttpClient) {}

  // Gọi khi load danh sách ban đầu
  getAllUsersExceptMe(): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}/all`);
  }

  getUserById(userId: string): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/${userId}`);
  }

  getLocalUserId(): string | null {
    const userId = localStorage.getItem('userId');
    return userId ? JSON.parse(userId) : null;
  }

  // Gọi khi có socket báo user online/offline
  updateUserStatus(userId: string, isOnline: boolean): void {
    const users = this.usersSubject.getValue();
    const index = users.findIndex((user) => user._id === userId);
    if (index !== -1) {
      users[index].online = isOnline;
      this.usersSubject.next([...users]);
    }
  }

  updateUser(userData: any): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/update`, userData);
  }
}
