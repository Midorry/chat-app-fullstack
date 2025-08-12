import { Component } from '@angular/core';
import { SocketService } from './services/socket.service';
import { UserService } from './services/user.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  title = 'chat-app';

  private onUserStatusChanged = (data: { userId: string; online: boolean }) => {
    this.userService.updateUserStatus(data.userId, data.online);
  };

  constructor(
    private socketService: SocketService,
    private userService: UserService
  ) {}

  ngOnInit() {
    this.socketService.emit('joinAll', this.userService.getLocalUserId);

    this.socketService.connect('user-status-changed', this.onUserStatusChanged);
  }

  ngOnDestroy(): void {
    this.socketService.disconnect(
      'user-status-changed',
      this.onUserStatusChanged
    );
  }
}
