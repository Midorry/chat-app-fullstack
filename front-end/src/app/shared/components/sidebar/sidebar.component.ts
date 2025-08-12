import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ConversationService } from 'src/app/services/conversation.service';
import { SocketService } from 'src/app/services/socket.service';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
})
export class SidebarComponent {
  logout() {
    const currentUserId = this.userService.getLocalUserId();
    // Xử lý logout
    localStorage.clear();
    this.conversationService.clearConversations();
    this.socketService.emit('user-disconnected', currentUserId);
    this.router.navigate(['/login']);
  }
  constructor(
    private router: Router,
    private conversationService: ConversationService,
    private socketService: SocketService,
    private userService: UserService
  ) {}
}
