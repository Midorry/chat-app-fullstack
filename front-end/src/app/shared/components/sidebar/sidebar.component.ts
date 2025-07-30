import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ConversationService } from 'src/app/services/conversation.service';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
})
export class SidebarComponent {
  logout() {
    // Xử lý logout, ví dụ:
    localStorage.clear();
    this.conversationService.clearConversations();
    this.router.navigate(['/login']);
  }
  constructor(
    private router: Router,
    private conversationService: ConversationService
  ) {}
}
