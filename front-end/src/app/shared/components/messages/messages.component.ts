import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  Input,
  NgZone,
  ViewChild,
} from '@angular/core';
import { Subscription } from 'rxjs';
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
  loadingMessages = true;
  private hasScrolled = false;
  private messagesSubscription!: Subscription;

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
          console.warn('bottomAnchor chưa tồn tại');
        }
      }, 50); // delay nhỏ để view đảm bảo update
    });
  }

  ngOnDestroy(): void {
    this.socketService.disconnect('receiveMessage', this.onReceiveMessage);
    if (this.messagesSubscription) {
      this.messagesSubscription.unsubscribe();
    }
  }

  // define callback là method riêng để huỷ dễ hơn
  onReceiveMessage = (newMessage: Message) => {
    // console.log('not oke: ', newMessage.conversationId);
    if (newMessage.conversationId === this.conversationId) {
      // console.log('oke');
      this.messageService.addMessage(newMessage);
      setTimeout(() => this.scrollToBottom(), 100);
    }
  };

  checkDataReady = () => {
    if (this.messagesSubscription) {
      this.loadingMessages = false;
    }
  };

  ngOnInit() {
    console.log('Conversation ID:', this.conversationId);
    this.messagesSubscription = this.messages$.subscribe(() => {
      this.hasScrolled = false;
      this.checkDataReady();
      this.cdr.detectChanges(); // ép Angular cập nhật View
    });
  }

  ngOnChanges() {
    if (this.conversationId) {
      this.getMessagesByConversationId(this.conversationId);
      this.conversationService
        .getConversationById(this.conversationId)
        .subscribe({
          next: (res) => {
            this.conversationInfo = res.conversation;
            this.otherUserData = this.conversationInfo?.members.find(
              (m) => m._id !== this.currentUserId
            );
          },
          error: (err) => {
            console.error('Lỗi khi lấy chi tiết hội thoại: ', err);
          },
        });

      this.socketService.emit('join', {
        userId: this.currentUserId,
        conversationId: this.conversationId,
      });

      // ✅ Gỡ listener cũ trước khi gắn mới
      this.socketService.disconnect('receiveMessage', this.onReceiveMessage);
      this.socketService.connect('receiveMessage', this.onReceiveMessage);
    }

    if (this.otherUserId) {
      // this.getOtherUser(this.otherUserId);
    }
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
