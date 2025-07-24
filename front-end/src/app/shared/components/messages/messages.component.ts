import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  Input,
  NgZone,
  ViewChild,
} from '@angular/core';
import { Conversation } from 'src/app/models/conversation.model';
import { Message } from 'src/app/models/massage.model';
import { User } from 'src/app/models/user.model';
import { ConversationService } from 'src/app/services/conversation.service';
import { MessageService } from 'src/app/services/message.service';
import { SocketService } from 'src/app/services/socket.service';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-messages',
  templateUrl: './messages.component.html',
  styleUrls: ['./messages.component.scss'],
})
export class MessagesComponent {
  @Input() conversationId: string | null = null;
  @Input() otherUserId: string | null = null;
  @ViewChild('bottomAnchor') private bottomAnchor!: ElementRef;

  currentUserId = this.userService.getLocalUserId();
  conversationInfo: Conversation | null = null;
  otherUserData: User | undefined = undefined;
  private hasScrolled = false;

  ngAfterViewChecked() {
    if (!this.hasScrolled) {
      this.scrollToBottom();
      this.hasScrolled = true;
    }
  }

  private scrollToBottom(): void {
    this.ngZone.runOutsideAngular(() => {
      setTimeout(() => {
        if (this.bottomAnchor?.nativeElement) {
          this.bottomAnchor.nativeElement.scrollIntoView({
            behavior: 'smooth',
          });
        } else {
          console.warn('⚠️ bottomAnchor chưa tồn tại');
        }
      }, 50); // delay nhỏ để view đảm bảo update
    });
  }

  ngOnDestroy(): void {
    this.socketService.disconnect('receiveMessage', this.onReceiveMessage);
  }

  // define callback là method riêng để huỷ dễ hơn
  onReceiveMessage = (newMessage: Message) => {
    console.log('not oke: ', newMessage.conversationId);
    if (newMessage.conversationId === this.conversationId) {
      console.log('oke');
      this.messageService.addMessage(newMessage);
      setTimeout(() => this.scrollToBottom(), 100);
    }
  };

  ngOnChanges() {
    if (this.conversationId) {
      this.getMessagesByConversationId(this.conversationId);
      this.conversationService
        .getConversationById(this.conversationId)
        .subscribe({
          next: (res) => {
            this.conversationInfo = res.conversation;
            console.log('info conversation', this.conversationInfo);
            this.otherUserData = this.conversationInfo?.members.find(
              (m) => m._id !== this.currentUserId
            );
            console.log('info other user', this.otherUserData);
          },
          error: (err) => {
            console.error('Lỗi khi lấy chi tiết hội thoại: ', err);
          },
        });
      this.socketService.emit('join', this.conversationId);
      this.socketService.connect('receiveMessage', this.onReceiveMessage);
    }
    if (this.otherUserId) {
      // this.getOtherUser(this.otherUserId);
    }
    this.messages$.subscribe(() => {
      this.hasScrolled = false;
      this.cdr.detectChanges(); // ép Angular cập nhật View
    });
  }

  getMessagesByConversationId(id: string) {
    this.messageService.getMessages(id);
  }

  get messages$() {
    return this.messageService.messages$;
  }

  constructor(
    private messageService: MessageService,
    private userService: UserService,
    private conversationService: ConversationService,
    private socketService: SocketService,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone
  ) {}
}
