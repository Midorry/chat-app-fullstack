import { Component } from '@angular/core';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  NonNullableFormBuilder,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzUploadFile, NzUploadXHRArgs } from 'ng-zorro-antd/upload';
import { Observable, Observer, of, Subscription } from 'rxjs';
import { User } from 'src/app/models/user.model';
import { AuthService } from 'src/app/services/auth.service';
import { NotificationService } from 'src/app/services/notification.service';
import { UploadService } from 'src/app/services/upload.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
})
export class RegisterComponent {
  loading: boolean = false;
  selectedFile!: File;
  avatarUrl: string | ArrayBuffer | null = null;
  registerForm: FormGroup<{
    userName: FormControl<string>;
    email: FormControl<string>;
    password: FormControl<string>;
    confirmPassword: FormControl<string>;
  }> = this.fb.group({
    userName: [
      '',
      [Validators.required, Validators.minLength(3), Validators.maxLength(10)],
    ],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    confirmPassword: [
      '',
      [Validators.required, this.matchOtherValidator('password')],
    ],
  });

  submitForm(): void {
    if (!this.selectedFile) {
      this.msg.error('Vui lòng chọn ảnh');
      return;
    }

    if (!this.registerForm.valid) {
      Object.values(this.registerForm.controls).forEach((control) => {
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

    this.uploadService.uploadImage(formData).subscribe({
      next: (uploadRes: any) => {
        const imageUrl = uploadRes.url;

        // Sau khi upload thành công thì Đăng ký user
        const userData: User = {
          avatar: imageUrl, // dùng link ảnh
          username: this.registerForm.value.userName || '',
          email: this.registerForm.value.email || '',
          password: this.registerForm.value.password || '',
        };

        this.authService.register(userData).subscribe({
          next: (res) => {
            this.notification.show('Đăng ký thành công', 'success');
            this.router.navigate(['/login']);
          },
          error: (err) => {
            if (err.status === 400) {
              this.notification.show(
                'Email đã được đăng ký, vui lòng dùng email khác',
                'error'
              );
            } else {
              this.notification.show(
                'Đăng ký thất bại, vui lòng thử lại',
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
  }

  matchOtherValidator(otherControlName: string): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.parent) return null;

      const otherControl = control.parent.get(otherControlName);
      if (!otherControl) return null;

      return control.value === otherControl.value
        ? null
        : { confirmMismatch: true };
    };
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

  constructor(
    private fb: NonNullableFormBuilder,
    private authService: AuthService,
    private uploadService: UploadService,
    private notification: NotificationService,
    private router: Router,
    private msg: NzMessageService
  ) {}
}
