import { Component, EventEmitter, Output } from '@angular/core';
import { Conversation } from 'src/app/models/conversation.model';
import { ConversationView } from 'src/app/models/conversationview.model';
import { User } from 'src/app/models/user.model';
import { ConversationService } from 'src/app/services/conversation.service';
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
  @Output() conversationSelected = new EventEmitter<string>();

  selectConversation(convoId: string) {
    this.conversationSelected.emit(convoId);
  }
  selectUserToChat(userId: string) {
    this.conversationService.startChat(userId).subscribe((convo) => {
      console.log(convo);

      this.conversationSelected.emit(convo._id); // convo là object vừa được tạo từ backend

      this.conversationService
        .getUserConversations(this.userService.getLocalUserId()!)
        .subscribe({
          next: (res) => {
            this.userConversation = res;
            console.log(
              'danh sách hội thoại người dùng',
              this.userConversation
            );
          },
          error: (err) => {
            console.error('Lỗi khi lấy danh sách hội thoại: ', err);
          },
        });
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

  fetchUsers(): void {
    if (this.userId) {
      this.userService.getAllUsersExceptMe().subscribe({
        next: (res) => {
          this.allUser = res;
          console.log(this.allUser);
        },
        error: (err) => {
          console.error('Lỗi khi lấy dữ liệu người dùng: ', err);
        },
      });
      this.conversationService
        .getUserConversations(JSON.parse(this.userId))
        .subscribe({
          next: (res) => {
            this.userConversation = res;
            console.log(
              'danh sách hội thoại người dùng',
              this.userConversation
            );
          },
          error: (err) => {
            console.error('Lỗi khi lấy danh sách hội thoại: ', err);
          },
        });
    }
  }

  ngOnInit(): void {
    this.fetchUsers();
  }

  constructor(
    private userService: UserService,
    private conversationService: ConversationService
  ) {}
}
