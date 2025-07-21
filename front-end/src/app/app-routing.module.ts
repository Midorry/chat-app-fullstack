import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MainLayoutComponent } from './core/layouts/main-layout/main-layout.component';
import { LoginComponent } from './core/auth/pages/login/login.component';
import { RegisterComponent } from './core/auth/pages/register/register.component';

const routes: Routes = [
  {
    path: '',
    component: MainLayoutComponent,
    // children: [
    //   // { path: 'chat', component: ChatPageComponent },
    //   // { path: 'profile', component: ProfilePageComponent },
    //   // { path: '', redirectTo: 'chat', pathMatch: 'full' }
    // ],
  },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: '**', redirectTo: '' }, // fallback
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
