import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class LoginGuard implements CanActivate {
  constructor(private router: Router) {}

  canActivate(): boolean | UrlTree {
    const token = localStorage.getItem('token');
    if (token) {
      // Nếu đã đăng nhập, chuyển hướng về trang chủ
      return this.router.parseUrl('');
    }
    return true; // cho vào login nếu chưa có token
  }
}
