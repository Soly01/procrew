import { inject, Injectable } from '@angular/core';
import {
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  Router,
} from '@angular/router';
import { LocalStorageKeys } from '../enum/localstorage.enum';
import { MessageService } from 'primeng/api';

@Injectable({
  providedIn: 'root',
})
export class LoginGuard implements CanActivate {
  private router = inject(Router);

  canActivate(
    _next: ActivatedRouteSnapshot,
    _state: RouterStateSnapshot
  ): boolean {
    if (localStorage.getItem(LocalStorageKeys.ISLOGGED)) {
      this.router.navigate(['/home']);
      return false;
    }
    // this.messageService.add({
    //   severity: 'error',
    //   summary: 'Error',
    //   detail: 'You Already Logged In ',
    // });
    return true;
  }
}
