import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MainLayoutComponent } from './core/layouts/main-layout/main-layout.component';
import { LoginComponent } from './core/auth/pages/login/login.component';
import { RegisterComponent } from './core/auth/pages/register/register.component';
import { AuthGuard } from './core/auth/guards/auth.guard';
import { LoginGuard } from './core/auth/guards/login.guard';

const routes: Routes = [
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [AuthGuard],
    // children: [
    //   // { path: 'chat', component: ChatPageComponent },
    //   // { path: 'profile', component: ProfilePageComponent },
    //   // { path: '', redirectTo: 'chat', pathMatch: 'full' }
    // ],
  },
  { path: 'login', component: LoginComponent, canActivate: [LoginGuard] },
  { path: 'register', component: RegisterComponent },
  { path: '**', redirectTo: '' }, // fallback
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
