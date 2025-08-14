import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  NgZone,
  Output,
} from '@angular/core';
import { Router } from '@angular/router';
import { distinctUntilChanged, filter } from 'rxjs';
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
  isSelected = false;
  checkFillDataConversation = false;

  @Output() conversationSelected = new EventEmitter<string>();
  @Output() selected = new EventEmitter<boolean>();

  private unseenCountCallback = (counts: any) => {
    // console.log('Unseen count cập nhật:', counts);
    this.ngZone.run(() => {
      this.updateConversationUnseenCount(counts);
    });
  };

  logout() {
    const currentUserId = this.userService.getLocalUserId();
    // Xử lý logout
    localStorage.clear();
    this.conversationService.clearConversations();
    this.socketService.emit('user-disconnected', currentUserId);
    this.router.navigate(['/login']);
  }

  selectConversation(convoId: string) {
    this.isSelected = true;
    this.selected.emit(this.isSelected);
    this.conversationSelected.emit(convoId);
    this.conversationId = convoId;
    this.socketService.emit('markAsSeen', {
      userId: JSON.parse(this.userId!),
      conversationId: convoId,
    });

    this.conversationService.markConversationAsSeen(convoId);
  }
  selectUserToChat(userId: string) {
    this.isSelected = true;
    this.selected.emit(this.isSelected);
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

    this.conversationService.conversations$
      .pipe(
        distinctUntilChanged(
          (prev, curr) => JSON.stringify(prev) === JSON.stringify(curr)
        )
      )
      .subscribe((conversations) => {
        // console.log('Subscriber nhận:', conversations);

        if (conversations.length > 0) {
          this.userConversation = conversations;
          this.checkFillDataConversation = true;
        } else if (!this.checkFillDataConversation) {
          // console.log('fetch user');
          // Lần đầu tiên không có conversation
          this.fetchUsers();
        }

        this.checkDataReady();
      });

    // this.intervalId = setInterval(() => {
    //   this.cdr.detectChanges();
    // }, 60000);
  }

  ngOnDestroy(): void {
    this.socketService.disconnect(
      'unseenCountUpdated',
      this.unseenCountCallback
    );
    // clearInterval(this.intervalId);
  }

  constructor(
    private userService: UserService,
    private conversationService: ConversationService,
    private socketService: SocketService,
    private ngZone: NgZone,
    private cdr: ChangeDetectorRef,
    private router: Router
  ) {}
}
