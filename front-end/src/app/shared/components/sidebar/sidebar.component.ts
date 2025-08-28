import { Component } from '@angular/core';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  NonNullableFormBuilder,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzUploadFile, NzUploadXHRArgs } from 'ng-zorro-antd/upload';
import { of, Subscription } from 'rxjs';
import { User } from 'src/app/models/user.model';
import { ConversationService } from 'src/app/services/conversation.service';
import { NotificationService } from 'src/app/services/notification.service';
import { SocketService } from 'src/app/services/socket.service';
import { UploadService } from 'src/app/services/upload.service';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
})
export class SidebarComponent {
  updateForm: FormGroup<{
    userName: FormControl<string>;
    email: FormControl<string>;
    password: FormControl<string>;
    confirmPassword: FormControl<string>;
  }> = this.fb.group(
    {
      userName: [
        '',
        [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(10),
        ],
      ],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.minLength(6)]],
      confirmPassword: [''],
    },
    { validators: this.passwordsMatchValidator }
  );
  isVisible = false;

  loading: boolean = false;
  selectedFile!: File;
  avatarUrl: string | ArrayBuffer | null = null;

  userId = this.userService.getLocalUserId();

  passwordsMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password')?.value;
    const confirmPassword = control.get('confirmPassword')?.value;

    // Nếu không nhập password thì không cần check confirmPassword
    if (!password && !confirmPassword) {
      return null;
    }

    // Nếu có password mà không có confirmPassword thì báo lỗi
    if (password && !confirmPassword) {
      control.get('confirmPassword')?.setErrors({ required: true });
      return { requiredConfirm: true };
    }

    // Nếu confirmPassword khác password thì báo lỗi
    if (password !== confirmPassword) {
      control.get('confirmPassword')?.setErrors({ mismatch: true });
      return { mismatch: true };
    }

    return null;
  }

  beforeUpload = (file: NzUploadFile): boolean => {
    // Lưu file để khi submit mới upload
    this.selectedFile = file as any;

    // Tạo preview bằng FileReader
    const reader = new FileReader();
    reader.onload = () => {
      this.avatarUrl = reader.result;
    };
    reader.readAsDataURL(file as any);

    return false; // Chặn upload tự động
  };

  dummyRequest = (item: NzUploadXHRArgs): Subscription => {
    // Giả lập request thành công ngay
    return of(true).subscribe(() => {
      item.onSuccess!(null, item.file, event);
    });
  };

  handleOk(): void {
    // if (!this.selectedFile) {
    //   this.msg.error('Vui lòng chọn ảnh');
    //   return;
    // }

    if (!this.updateForm.valid) {
      Object.values(this.updateForm.controls).forEach((control) => {
        if (control.invalid) {
          control.markAsDirty();
          control.updateValueAndValidity({ onlySelf: true });
        }
      });
      return;
    }

    // Upload ảnh trước
    const formData = new FormData();
    formData.append('image', this.selectedFile);
    console.log(this.selectedFile);
    if (this.selectedFile) {
      this.uploadService.uploadImage(formData).subscribe({
        next: (uploadRes: any) => {
          const imageUrl = uploadRes.url;

          // Sau khi upload thành công thì Đăng ký user
          const userData: User = {
            avatar: imageUrl, // dùng link ảnh
            username: this.updateForm.value.userName || '',
            email: this.updateForm.value.email || '',
            password: this.updateForm.value.password || '',
          };

          this.userService.updateUser(userData).subscribe({
            next: (res) => {
              this.notification.show('Cập nhật thành công', 'success');

              this.isVisible = false;
            },
            error: (err) => {
              if (err.status === 400) {
                this.notification.show(
                  'Email đã được sử dụng, vui lòng dùng email khác',
                  'error'
                );
              } else {
                this.notification.show(
                  'Cập nhật thất bại, vui lòng thử lại',
                  'error'
                );
              }
            },
          });
        },
        error: (err) => {
          this.msg.error('Upload ảnh thất bại');
          console.error(err);
        },
      });
    } else {
      const userData: User = {
        avatar: (this.avatarUrl as string) || undefined, // dùng link ảnh
        username: this.updateForm.value.userName || '',
        email: this.updateForm.value.email || '',
        password: this.updateForm.value.password || '',
      };

      this.userService.updateUser(userData).subscribe({
        next: (res) => {
          this.notification.show('Cập nhật thành công', 'success');

          this.isVisible = false;
        },
        error: (err) => {
          if (err.status === 400) {
            this.notification.show(
              'Email đã được sử dụng, vui lòng dùng email khác',
              'error'
            );
          } else {
            this.notification.show(
              'Cập nhật thất bại, vui lòng thử lại',
              'error'
            );
          }
        },
      });
    }
  }

  openProfileDialog(): void {
    this.userService.getUserById(this.userId || '').subscribe({
      next: (res) => {
        // console.log(res);
        this.avatarUrl = res?.avatar || '';
        this.updateForm.patchValue({
          // avatar: res.avatar,
          userName: res.username,
          email: res.email,
        });
      },
      error: (err) => {
        console.error('Lỗi khi lấy thông tin người dùng', err);
      },
    });

    this.isVisible = true;
  }

  handleCancel(): void {
    this.isVisible = false;
  }
  logout() {
    const currentUserId = this.userService.getLocalUserId();
    // Xử lý logout
    localStorage.clear();
    this.conversationService.clearConversations();
    this.socketService.emit('user-disconnected', currentUserId);
    this.router.navigate(['/login']);
  }
  constructor(
    private msg: NzMessageService,
    private uploadService: UploadService,
    private notification: NotificationService,
    private fb: NonNullableFormBuilder,
    private router: Router,
    private conversationService: ConversationService,
    private socketService: SocketService,
    private userService: UserService
  ) {}
}
