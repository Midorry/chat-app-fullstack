import { Component } from '@angular/core';
import {
  FormControl,
  FormGroup,
  NonNullableFormBuilder,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { User } from 'src/app/models/user.model';
import { AuthService } from 'src/app/services/auth.service';
import { NotificationService } from 'src/app/services/notification.service';
import { SocketService } from 'src/app/services/socket.service';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent {
  loginForm: FormGroup<{
    email: FormControl<string>;
    password: FormControl<string>;
  }> = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  submitForm(): void {
    const form = this.loginForm;

    // 👇 Luôn xóa lỗi "invalidLogin" trước khi kiểm tra hợp lệ
    // form.get('email')?.setErrors(null);
    // form.get('password')?.setErrors(null);
    const emailCtrl = this.loginForm.get('email');
    const passCtrl = this.loginForm.get('password');
    if (emailCtrl?.hasError('invalidLogin')) {
      const { invalidLogin, ...otherErrors } = emailCtrl.errors || {};
      emailCtrl.setErrors(Object.keys(otherErrors).length ? otherErrors : null);
    }
    if (passCtrl?.hasError('invalidLogin')) {
      const { invalidLogin, ...otherErrors } = passCtrl.errors || {};
      passCtrl.setErrors(Object.keys(otherErrors).length ? otherErrors : null);
    }
    form.updateValueAndValidity(); // cập nhật lại trạng thái

    form.markAllAsTouched();

    if (form.invalid) {
      return;
    }

    const email = form.get('email')?.value || '';
    const password = form.get('password')?.value || '';
    const userData: User = { email, password };

    this.authService.login(userData).subscribe({
      next: (res) => {
        localStorage.setItem('userId', JSON.stringify(res.user._id));
        localStorage.setItem('token', res.token);
        const currentUserId = this.userService.getLocalUserId();
        if (currentUserId) {
          this.socketService.emit('user-connected', currentUserId);
        }
        this.notification.show('Đăng nhập thành công', 'success');
        this.router.navigate(['/home']);
      },
      error: (err) => {
        console.error('Đăng nhập lỗi:', err);
        this.notification.show('Lỗi đăng nhập', 'error');
      },
    });
  }

  constructor(
    private fb: NonNullableFormBuilder,
    private authService: AuthService,
    private router: Router,
    private notification: NotificationService,
    private socketService: SocketService,
    private userService: UserService
  ) {}
  ngOnInit(): void {
    const emailControl = this.loginForm.get('email');
    const passControl = this.loginForm.get('password');

    emailControl?.valueChanges
      .pipe(debounceTime(100), distinctUntilChanged())
      .subscribe(() => {
        if (emailControl.errors?.['invalidLogin']) {
          const { invalidLogin, ...otherErrors } = emailControl.errors;
          emailControl.setErrors(
            Object.keys(otherErrors).length ? otherErrors : null
          );
        }
      });

    passControl?.valueChanges
      .pipe(debounceTime(100), distinctUntilChanged())
      .subscribe(() => {
        if (passControl.errors?.['invalidLogin']) {
          const { invalidLogin, ...otherErrors } = passControl.errors;
          passControl.setErrors(
            Object.keys(otherErrors).length ? otherErrors : null
          );
        }
      });
  }
}
