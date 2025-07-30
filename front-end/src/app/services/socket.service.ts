import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { environment } from '../environments/environment';
import { Message } from '../models/massage.model';

@Injectable({ providedIn: 'root' })
export class SocketService {
  private socket: Socket;

  constructor() {
    this.socket = io(environment.socketUrl); // URL server backend
  }

  // Kết nối socket
  connect(eventName: string, callback: (...args: any[]) => void) {
    this.socket.on(eventName, callback);
  }

  disconnect(eventName: string, callback: (...args: any[]) => void) {
    this.socket.off(eventName, callback);
  }

  // Emit 1 sự kiện
  emit(event: string, data: any): void {
    this.socket.emit(event, data);
  }

  // Lắng nghe 1 sự kiện
  listenReceiveMessage(callback: (message: Message) => void) {
    this.socket.on('receiveMessage', callback);
  }
}
