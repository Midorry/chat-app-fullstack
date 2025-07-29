import { Component, Input } from '@angular/core';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-message',
  templateUrl: './message.component.html',
  styleUrls: ['./message.component.scss'],
})
export class MessageComponent {
  @Input() content: string = '';
  @Input() sendTime: string | undefined = '';
  @Input() username: string | undefined = '';
  @Input() userId: string | undefined = '';

  checkSender = () => {
    if (this.userId === this.userService.getLocalUserId()) {
      return false;
    } else {
      return true;
    }
  };

  constructor(private userService: UserService) {}
}
