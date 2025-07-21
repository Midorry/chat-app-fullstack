import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { environment } from '../environments/environment';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class SocketService {
  private socket: Socket;

  constructor() {
    this.socket = io(environment.socketUrl); // URL server backend
  }

  // Kết nối socket
  connect(): void {
    if (!this.socket.connected) {
      this.socket.connect();
    }
  }

  // Ngắt kết nối
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
    }
  }

  // Emit 1 sự kiện
  emit(event: string, data: any): void {
    this.socket.emit(event, data);
  }

  // Lắng nghe 1 sự kiện
  listen(event: string) {
    return new Observable((subscriber) => {
      this.socket.on(event, (data) => subscriber.next(data));
    });
  }
}
