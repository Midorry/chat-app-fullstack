import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  NgZone,
  Output,
} from '@angular/core';
import { ConversationView } from 'src/app/models/conversationview.model';
import { User } from 'src/app/models/user.model';
import { ConversationService } from 'src/app/services/conversation.service';
import { SocketService } from 'src/app/services/socket.service';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.scss'],
})
export class UserListComponent {
  searchValue = '';
  allUser: User[] = [];
  filteredUsers: User[] = [];
  isSearchFocused = false;
  userConversation: ConversationView[] = [];
  userId = localStorage.getItem('userId');
  conversationId = '';
  intervalId: any;
  dataReady = false;
  localhostBackend = 'http://localhost:3000';

  @Output() conversationSelected = new EventEmitter<string>();

  private unseenCountCallback = (counts: any) => {
    // console.log('Unseen count cập nhật:', counts);
    this.ngZone.run(() => {
      this.updateConversationUnseenCount(counts);
    });
  };

  selectConversation(convoId: string) {
    this.conversationSelected.emit(convoId);
    this.conversationId = convoId;
    this.socketService.emit('markAsSeen', {
      userId: JSON.parse(this.userId!),
      conversationId: convoId,
    });

    this.conversationService.markConversationAsSeen(convoId);
  }
  selectUserToChat(userId: string) {
    this.conversationService.startChat(userId).subscribe((convo) => {
      // console.log(convo);

      this.conversationSelected.emit(convo._id); // convo là object vừa được tạo từ backend
      this.conversationService.getUserConversations(
        this.userService.getLocalUserId()!
      );
    });
  }

  onFocus() {
    this.isSearchFocused = true;
  }

  onBlur() {
    // Delay 200ms để cho phép click vào user trước khi ẩn
    setTimeout(() => {
      this.isSearchFocused = false;
    }, 200);
  }

  onSearch(): void {
    const keyword = this.searchValue.toLowerCase().trim();
    if (keyword) {
      this.filteredUsers = this.allUser.filter((user) =>
        user.username!.toLowerCase().includes(keyword)
      );
    } else {
      this.filteredUsers = this.allUser;
    }
  }

  getSenderName(convo: ConversationView): string | undefined {
    const senderId = convo.lastMessage?.senderId?._id?.toString();
    const currentUserId = JSON.parse(this.userId!).trim();

    return senderId === currentUserId
      ? 'Bạn'
      : convo.lastMessage?.senderId?.username;
  }

  updateConversationUnseenCount(
    counts: { conversationId: string; unseenCount: number }[]
  ) {
    this.userConversation = this.userConversation.map((convo) => {
      const updated = counts.find((c) => c.conversationId === convo._id);
      return updated ? { ...convo, unseenCount: updated.unseenCount } : convo;
    });
  }

  fetchUsers(): void {
    if (this.userId) {
      this.userService.getAllUsersExceptMe().subscribe({
        next: (res) => {
          this.allUser = res;
          this.checkDataReady();
        },
        error: (err) => {
          console.error('Lỗi khi lấy dữ liệu người dùng: ', err);
          this.checkDataReady();
        },
      });
    }
  }

  checkDataReady() {
    const hasUserData = Array.isArray(this.allUser) && this.allUser.length > 0;
    const hasConversationData =
      Array.isArray(this.userConversation) && this.userConversation.length > 0;

    if (hasUserData || hasConversationData) {
      this.dataReady = true;
      // console.log('ready:', this.allUser, this.userConversation);
    } else {
      // console.log('unready:', this.allUser, this.userConversation);
    }
  }

  ngOnInit(): void {
    this.socketService.connect('unseenCountUpdated', this.unseenCountCallback);
    this.conversationService.getUserConversations(
      this.userService.getLocalUserId()!
    );

    this.socketService.listenReceiveMessage((message) => {
      this.conversationService.handleIncomingMessage(
        message,
        this.userService.getLocalUserId()!
      );
    });

    this.conversationService.conversations$.subscribe((conversations) => {
      this.userConversation = conversations;
      this.checkDataReady();
    });

    this.fetchUsers();

    this.intervalId = setInterval(() => {
      this.cdr.detectChanges();
    }, 60000);
  }

  ngOnDestroy(): void {
    this.socketService.disconnect(
      'unseenCountUpdated',
      this.unseenCountCallback
    );
    clearInterval(this.intervalId);
  }

  constructor(
    private userService: UserService,
    private conversationService: ConversationService,
    private socketService: SocketService,
    private ngZone: NgZone,
    private cdr: ChangeDetectorRef
  ) {}
}
