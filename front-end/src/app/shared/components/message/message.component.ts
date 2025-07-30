import { Component, Input } from '@angular/core';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-message',
  templateUrl: './message.component.html',
  styleUrls: ['./message.component.scss'],
})
export class MessageComponent {
  @Input() content: string = '';
  @Input() type?: string;
  @Input() attachments?: string[];
  @Input() sendTime: string | undefined = '';
  @Input() username: string | undefined = '';
  @Input() userId: string | undefined = '';

  localhostBackEnd: string = 'http://localhost:3000';
  previewImage: string | null = null;

  openImageModal(url: string) {
    const img = new Image();
    img.onload = () => {
      this.previewImage = url;
    };
    img.src = url;
  }

  closeImageModal() {
    this.previewImage = null;
  }

  checkSender = () => {
    if (this.userId === this.userService.getLocalUserId()) {
      return false;
    } else {
      return true;
    }
  };

  ngOnInit() {
    if (this.type === 'image' && this.attachments?.[0]) {
      const img = new Image();
      img.src = this.localhostBackEnd + this.attachments[0];
    }
  }

  constructor(private userService: UserService) {}
}
