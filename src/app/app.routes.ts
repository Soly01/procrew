import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./Components/login/login.component').then(
        (c) => c.LoginComponent
      ),
  },
  // {
  //   path: 'register',
  //   loadComponent: () =>
  //     import('./components/auth/register/register.component').then(
  //       (c) => c.RegisterComponent
  //     ),
  // },  {
  //   path: 'home',
  //   loadComponent: () =>
  //     import('./components/home/home.component').then((c) => c.HomeComponent),
  //   canActivate: [AuthGuard],
  // },
];
