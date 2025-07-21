import { Component } from '@angular/core';

@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.scss'],
})
export class UserListComponent {
  searchValue = '';

  onSearch(): void {
    console.log('Đang tìm:', this.searchValue);
    // Gọi API hoặc lọc danh sách ở đây
  }
}
