import { Injectable } from '@angular/core';
import {
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  Router,
} from '@angular/router';
import { LocalStorageKeys } from '../enum/localstorage.enum';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(private router: Router) {}

  canActivate(
    _next: ActivatedRouteSnapshot,
    _state: RouterStateSnapshot
  ): boolean {
    if (!localStorage.getItem(LocalStorageKeys.isLogged)) {
      this.router.navigate(['/login']);
      return false;
    }
    console.log('User is authenticated. Allowing access.');
    return true;
  }
}
