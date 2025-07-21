import { Component } from '@angular/core';

@Component({
  selector: 'app-main-layout',
  templateUrl: './main-layout.component.html',
  styleUrls: ['./main-layout.component.scss'],
})
export class MainLayoutComponent {
  selectedConversationId: string | null = null;
  otherUserId: string | null = null;

  onConversationSelected(id: string) {
    this.selectedConversationId = id;
  }
  onUserId(id: string) {
    this.otherUserId = id;
  }
}
