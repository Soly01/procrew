import { Routes } from '@angular/router';
import { AuthGuard } from '../../guards/Auth.guard';
import { BlanklayoutComponent } from './layoutComponents/blanklayout/blanklayout.component';
import { BasiclayoutComponent } from './layoutComponents/basiclayout/basiclayout.component';
export const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },
  {
    path: '',
    component: BlanklayoutComponent,
    children: [
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
    ],
  },
  {
    path: '',
    component: BasiclayoutComponent,
    children: [
      {
        path: 'home',
        loadComponent: () =>
          import('./Components/home/home.component').then(
            (c) => c.HomeComponent
          ),
        canActivate: [AuthGuard],
      },
      {
        path: 'shop',
        loadComponent: () =>
          import('./Components/shop/shop.component').then(
            (c) => c.ShopComponent
          ),
        canActivate: [AuthGuard],
      },
      {
        path: 'cart',
        loadComponent: () =>
          import('./Components/cart/cart.component').then(
            (c) => c.CartComponent
          ),
        canActivate: [AuthGuard],
      },
      {
        path: 'orders',
        loadComponent: () =>
          import('./Components/orders/orders.component').then(
            (c) => c.OrdersComponent
          ),
        canActivate: [AuthGuard],
      },
      {
        path: 'product/:id',
        loadComponent: () =>
          import('./Components/product-details/product-details.component').then(
            (c) => c.ProductDetailsComponent
          ),
        canActivate: [AuthGuard],
      },
    ],
  },
];
