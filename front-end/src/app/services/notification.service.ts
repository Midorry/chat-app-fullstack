import { Injectable } from '@angular/core';
import { NzNotificationService } from 'ng-zorro-antd/notification';

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  constructor(private notification: NzNotificationService) {}

  show(message: string, type: 'success' | 'error' | 'info' | 'warning') {
    this.notification.create(type, 'Thông báo', message);
  }
}
