import { Component, Input } from '@angular/core';
import { Message } from 'src/app/models/massage.model';
import { ConversationService } from 'src/app/services/conversation.service';
import { MessageService } from 'src/app/services/message.service';
import { SocketService } from 'src/app/services/socket.service';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-message-input',
  templateUrl: './message-input.component.html',
  styleUrls: ['./message-input.component.scss'],
})
export class MessageInputComponent {
  @Input() conversationId: string | null = null;
  messageText = '';

  sendMessage() {
    if (!this.messageText.trim()) return;
    // console.log('Sending:', this.messageText);
    const conversationId = this.conversationId;
    if (!conversationId) return;
    const content = this.messageText;
    const senderId = this.userService.getLocalUserId();
    if (!senderId) {
      console.error('Không tìm thấy senderId trong localStorage.');
      return;
    }
    const messageData: Message = {
      conversationId: conversationId,
      senderId: { _id: senderId },
      content,
      seenBy: [senderId],
    };
    this.messageService.sendMessage(messageData).subscribe({
      next: (res) => {
        // console.log('send message', res);
        this.socketService.emit('sendMessage', res);
        this.conversationService.updateConversationOnNewMessage(res);
        this.conversationService.updateConversationUnseenCount([
          { conversationId, unseenCount: 0 },
        ]);
        this.socketService.emit('markAsSeen', {
          userId: senderId,
          conversationId: conversationId,
        });
        this.messageText = '';
      },
      error: (err) => {
        console.error('Lỗi khi gửi tin nhắn: ', err);
      },
    });
  }
  constructor(
    private messageService: MessageService,
    private userService: UserService,
    private conversationService: ConversationService,
    private socketService: SocketService
  ) {}
}
