import { Routes } from '@angular/router';
import { AuthGuard } from '../../guards/Auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./Components/Auth/login/login.component').then(
        (c) => c.LoginComponent
      ),
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./Components/Auth/register/register.component').then(
        (c) => c.RegisterComponent
      ),
  },
  {
    path: 'home',
    loadComponent: () =>
      import('./Components/home/home.component').then((c) => c.HomeComponent),
    canActivate: [AuthGuard],
  },
];
