import { Component, EventEmitter, Output } from '@angular/core';
import { Conversation } from 'src/app/models/conversation.model';
import { ConversationView } from 'src/app/models/conversationview.model';
import { User } from 'src/app/models/user.model';
import { AuthService } from 'src/app/services/auth.service';
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
  userConversation: ConversationView[] = [];
  userId = localStorage.getItem('userId');
  @Output() conversationSelected = new EventEmitter<string>();
  @Output() otherUser = new EventEmitter<string>();

  selectConversation(convoId: string) {
    this.conversationSelected.emit(convoId);
  }
  selectUserToChat(userId: string) {
    this.otherUser.emit(userId);
    this.conversationService.startChat(userId).subscribe((convo) => {
      this.conversationSelected.emit(convo._id); // convo là object vừa được tạo từ backend
    });
  }

  onSearch(): void {
    console.log('Đang tìm:', this.searchValue);
    // Gọi API hoặc lọc danh sách ở đây
  }
  constructor(
    private userService: UserService,
    private conversationService: ConversationService
  ) {
    if (this.userId) {
      console.log(this.userId);
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
            console.log(this.userConversation);
          },
        });
    }
  }
}
