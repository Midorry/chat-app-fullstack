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
  @ViewChild('scrollContainer') scrollContainer!: ElementRef;

  currentUserId = this.userService.getLocalUserId();
  conversationInfo: Conversation | null = null;
  otherUserData: User | undefined = undefined;
  loadingMessages = true;
  messages: Message[] = [];
  currentPage = 1;
  pageSize = 20;
  loading = false;
  allLoaded = false;
  localhostBackend = 'http://localhost:3000';

  private lastScrollHeight: number = 0;
  private isInitialScrollDone = false;
  private hasScrolled = false;
  private messagesSubscription!: Subscription;

  groupedMessages: {
    date: string;
    messages: Message[];
  }[] = [];

  ngAfterViewChecked() {
    // if (!this.hasScrolled) {
    //   this.scrollToBottom();
    //   this.hasScrolled = true;
    // }
    if (!this.isInitialScrollDone && this.scrollContainer) {
      this.ngZone.runOutsideAngular(() => {
        setTimeout(() => {
          this.loadOlderMessages();
          this.scrollToBottom();

          // Cập nhật biến trong zone an toàn
          this.ngZone.run(() => {
            this.isInitialScrollDone = true;
          });
        });
      });
    }
  }

  private scrollToBottom() {
    const container = this.scrollContainer?.nativeElement;
    if (container) {
      container.scrollTop = container.scrollHeight;
    }
  }

  ngOnDestroy(): void {
    this.socketService.disconnect('receiveMessage', this.onReceiveMessage);
    if (this.messagesSubscription) {
      this.messagesSubscription.unsubscribe();
    }
  }

  // define callback là method riêng để huỷ dễ hơn
  onReceiveMessage = (newMessage: Message) => {
    // console.log('not oke: ', newMessage);
    if (newMessage.conversationId === this.conversationId) {
      // console.log('oke');
      this.messageService.addMessage(newMessage);
      setTimeout(() => this.scrollToBottom(), 100);
    }
  };

  onScroll() {
    const scrollTop = this.scrollContainer.nativeElement.scrollTop;

    if (!this.isInitialScrollDone || this.loading || this.allLoaded) return;

    if (scrollTop === 0 && !this.loading) {
      this.loadOlderMessages();
    }
  }

  loadOlderMessages() {
    if (this.loading || this.allLoaded) {
      return;
    }
    this.lastScrollHeight = this.scrollContainer.nativeElement.scrollHeight;
    const container = this.scrollContainer.nativeElement;

    const previousScrollHeight = container.scrollHeight;
    const previousScrollTop = container.scrollTop;

    this.loading = true;
    this.messageService
      .getMessagesByPage(this.conversationId!, this.currentPage, this.pageSize)
      .subscribe({
        next: (olderMessages) => {
          if (olderMessages.length < this.pageSize) {
            this.allLoaded = true; //Không còn dữ liệu nữa
          }
          this.messageService.prependMessages(olderMessages);
          this.currentPage++;

          this.cdr.detectChanges(); // Cập nhật view

          this.ngZone.runOutsideAngular(() => {
            requestAnimationFrame(() => {
              const newScrollHeight = container.scrollHeight;
              const scrollDiff = newScrollHeight - previousScrollHeight;
              container.scrollTop = previousScrollTop + scrollDiff;
            });
          });

          this.loading = false;
        },
        error: (err) => {
          console.error('Lỗi khi load older messages:', err);
          this.loading = false;
        },
      });
  }

  checkDataReady = () => {
    if (this.messagesSubscription) {
      this.loadingMessages = false;
    }
  };

  groupMessagesByDate(
    messages: Message[]
  ): { date: string; messages: Message[] }[] {
    const grouped = new Map<string, Message[]>();

    messages.forEach((msg) => {
      const date = this.formatDateLabel(new Date(msg.createdAt!)); // convert timestamp thành chuỗi ngày phù hợp
      if (!grouped.has(date)) {
        grouped.set(date, []);
      }
      grouped.get(date)!.push(msg);
    });

    return Array.from(grouped.entries()).map(([date, messages]) => ({
      date,
      messages,
    }));
  }

  formatDateLabel(date: Date): string {
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    const dateOnly = date.toDateString();
    const todayOnly = today.toDateString();
    const yesterdayOnly = yesterday.toDateString();

    if (dateOnly === todayOnly) return 'Hôm nay';
    if (dateOnly === yesterdayOnly) return 'Hôm qua';
    return date.toLocaleDateString('vi-VN'); // ví dụ: 27/07/2025
  }

  onStatusChanged = (data: { userId: string; online: boolean }) => {
    if (this.otherUserData && data.userId === this.otherUserData._id) {
      this.otherUserData.online = data.online;
    }
  };

  ngOnInit() {
    if (this.conversationId) {
      this.loadOlderMessages(); // Load page 1
    }
    setTimeout(() => {
      this.scrollToBottom();
      this.isInitialScrollDone = true;
    }, 100);

    this.messagesSubscription = this.messages$.subscribe((messages) => {
      this.hasScrolled = false;

      this.groupedMessages = this.groupMessagesByDate(messages);
      this.checkDataReady();
    });
  }

  ngOnChanges() {
    if (this.conversationId) {
      this.currentPage = 1;
      this.allLoaded = false;
      this.loading = false;
      this.isInitialScrollDone = false;
      this.hasScrolled = false;
      this.loadingMessages = true;

      this.messageService.clearMessages();

      this.conversationService
        .getConversationById(this.conversationId)
        .subscribe({
          next: (res) => {
            this.conversationInfo = res.conversation;
            this.otherUserData = this.conversationInfo?.members.find(
              (m) => m._id !== this.currentUserId
            );

            // Khi đã biết đối phương, đăng ký lắng nghe trạng thái realtime
            if (this.otherUserData?._id) {
              this.socketService.disconnect(
                'user-status-changed',
                this.onStatusChanged
              );
              this.socketService.connect(
                'user-status-changed',
                this.onStatusChanged
              );
            }
          },
          error: (err) => {
            console.error('Lỗi khi lấy chi tiết hội thoại: ', err);
          },
        });

      this.socketService.emit('join', {
        userId: this.currentUserId,
        conversationId: this.conversationId,
      });

      this.socketService.disconnect('receiveMessage', this.onReceiveMessage);
      this.socketService.connect('receiveMessage', this.onReceiveMessage);
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
