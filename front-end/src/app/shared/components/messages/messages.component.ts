import { Component, Input } from '@angular/core';
import { User } from 'src/app/models/user.model';
import { ConversationService } from 'src/app/services/conversation.service';
import { MessageService } from 'src/app/services/message.service';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-messages',
  templateUrl: './messages.component.html',
  styleUrls: ['./messages.component.scss'],
})
export class MessagesComponent {
  @Input() conversationId: string | null = null;
  @Input() otherUserId: string | null = null;

  otherUserData: User | null = null;
  ngOnChanges() {
    if (this.conversationId) {
      this.getMessagesByConversationId(this.conversationId);
      this.getConversation(this.conversationId);
    }
    if (this.otherUserId) {
      // this.getOtherUser(this.otherUserId);
    }
  }

  getMessagesByConversationId(id: string) {
    this.messageService.getMessages(id).subscribe({
      next: (res) => {
        console.log(res);
      },
      error: (err) => {
        console.error('Lỗi khi lấy message: ', err);
      },
    });
  }

  getOtherUser(id: string) {
    this.userService.getUserById(id).subscribe({
      next: (res) => {
        this.otherUserData = res;
        console.log(res);
      },
      error: (err) => {
        console.error('Lỗi khi lấy người dùng khác: ', err);
      },
    });
  }

  getConversation(id: string) {
    this.conversationService.getConversationById(id).subscribe({
      next: (res) => {
        console.log(res.conversation.members);
        const members = res.conversation.members;
        const otherUser = members.find((m: any) => m._id !== this.otherUserId);

        if (otherUser) {
          this.otherUserData = otherUser; // gán để hiển thị lên giao diện
          console.log('Người còn lại:', this.otherUserData);
        }
      },
      error: (err) => {
        console.error('Lỗi khi lấy người dùng khác: ', err);
      },
    });
  }
  constructor(
    private messageService: MessageService,
    private userService: UserService,
    private conversationService: ConversationService
  ) {}
}
