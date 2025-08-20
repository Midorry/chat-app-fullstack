import { Component, Input } from '@angular/core';
import { Message } from 'src/app/models/massage.model';
import { ConversationService } from 'src/app/services/conversation.service';
import { MessageService } from 'src/app/services/message.service';
import { SocketService } from 'src/app/services/socket.service';
import { UploadService } from 'src/app/services/upload.service';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-message-input',
  templateUrl: './message-input.component.html',
  styleUrls: ['./message-input.component.scss'],
})
export class MessageInputComponent {
  @Input() conversationId: string | null = null;
  messageText = '';
  previewImageUrl: string | null = null;
  selectedFile: File | null = null;

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        this.previewImageUrl = reader.result as string;
      };
      reader.readAsDataURL(file);

      // Lưu file tạm vào một biến để xử lý khi gửi
      this.selectedFile = file;
    }
  }

  removePreview() {
    this.previewImageUrl = null;
  }

  async sendMessage() {
    const conversationId = this.conversationId;
    const senderId = this.userService.getLocalUserId();

    if (!conversationId || !senderId) return;

    let messagePayload: Message = {
      conversationId: conversationId,
      senderId: { _id: senderId },
      content: this.messageText.trim(),
      seenBy: [senderId],
    };

    // Nếu có ảnh đang được preview thì upload
    if (this.selectedFile) {
      const formData = new FormData();
      formData.append('image', this.selectedFile);

      try {
        this.uploadService.uploadImage(formData).subscribe((res) => {
          if (res && res.url) {
            const imageMessage: Message = {
              conversationId: conversationId,
              senderId: { _id: senderId },
              content: '',
              type: 'image',
              attachments: [res.url],
              createdAt: new Date().toISOString(),
              seenBy: [senderId],
            };

            this.messageService.sendMessage(imageMessage).subscribe({
              next: (savedMessage) => {
                this.socketService.emit('sendMessage', savedMessage);
                this.conversationService.updateConversationOnNewMessage(
                  savedMessage
                );

                this.conversationService.updateConversationUnseenCount([
                  { conversationId, unseenCount: 0 },
                ]);
                this.socketService.emit('markAsSeen', {
                  userId: senderId,
                  conversationId: conversationId,
                });
              },
              error: (err) => {
                console.error('Lỗi khi lưu tin nhắn ảnh: ', err);
              },
            });

            this.previewImageUrl = null;
            this.selectedFile = null;
          } else {
            console.error('Upload ảnh không thành công:', res);
          }
        });
      } catch (err) {
        console.error('Lỗi khi upload ảnh:', err);
        return;
      }

      this.selectedFile = null;
      this.previewImageUrl = null;
    }

    if (!messagePayload.content && !messagePayload.attachments?.length) return;

    this.messageService.sendMessage(messagePayload).subscribe({
      next: (res) => {
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
    private uploadService: UploadService,
    private userService: UserService,
    private conversationService: ConversationService,
    private socketService: SocketService
  ) {}
}
