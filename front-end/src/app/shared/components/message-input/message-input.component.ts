import { Component } from '@angular/core';

@Component({
  selector: 'app-message-input',
  templateUrl: './message-input.component.html',
  styleUrls: ['./message-input.component.scss'],
})
export class MessageInputComponent {
  messageText = '';

  sendMessage() {
    if (!this.messageText.trim()) return;
    console.log('Sending:', this.messageText);
    // TODO: gửi message
    this.messageText = '';
  }
}
