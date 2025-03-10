import { Injectable } from '@angular/core';
import { LocalStorageService } from './localstorage.service';
import { User } from '../interface/user.interface';
import { LocalStorageKeys } from '../enum/localstorage.enum';
import { Subject } from 'rxjs';
@Injectable({
  providedIn: 'root',
})
export class AuthService {
  logoutEvent = new Subject<void>();

  constructor(private localStorageService: LocalStorageService) {
    this.ensureAdminExists();
  }

  private ensureAdminExists() {
    let users =
      this.localStorageService.getItem<any[]>(LocalStorageKeys.MYDATA) || [];
    const adminExists = users.some(
      (user) => user.email === 'admin@example.com'
    );

    if (!adminExists) {
      users.push({
        id: 0,
        username: 'Admin',
        email: 'admin@example.com',
        password: 'admin123',
        role: 'admin',
      });
      this.localStorageService.setItem('myData', users);
    }
  }

  // ✅ Registers a new user
  register(username: string, email: string, password: string): boolean {
    let users =
      this.localStorageService.getItem<any[]>(LocalStorageKeys.MYDATA) || [];

    if (users.some((user) => user.email === email)) {
      return false;
    }

    const newUser = {
      id: users.length + 1,
      username,
      email,
      password,
      role: 'customer',
    };

    users.push(newUser);
    this.localStorageService.setItem(LocalStorageKeys.MYDATA, users);
    return true;
  }

  login(username: string, password: string): boolean {
    let users =
      this.localStorageService.getItem<User[]>(LocalStorageKeys.MYDATA) || [];
    const user = users.find(
      (u) => u.username === username && u.password === password
    );

    if (user) {
      this.localStorageService.setItem(LocalStorageKeys.ISLOGGED, 'true');
      this.localStorageService.setItem(LocalStorageKeys.CURRENTUSER, user);
      this.localStorageService.setItem(LocalStorageKeys.CURRENTROLE, user.role);
      return true;
    }
    return false;
  }

  logout() {
    this.localStorageService.removeItem(LocalStorageKeys.ISLOGGED);
    this.localStorageService.removeItem(LocalStorageKeys.CURRENTUSER);
    this.localStorageService.removeItem(LocalStorageKeys.CURRENTROLE);
    this.logoutEvent.next();
  }

  getCurrentUser() {
    const user = this.localStorageService.getItem<User>(
      LocalStorageKeys.LOGGEDINUSER
    );
    return user && user.id ? user : null; // Ensure it has an 'id'
  }

  isLoggedIn(): boolean {
    return !!this.localStorageService.getItem(LocalStorageKeys.ISLOGGED);
  }

  isAdmin(): boolean {
    return (
      this.localStorageService.getItem(LocalStorageKeys.CURRENTROLE) ===
      LocalStorageKeys.ADMIN
    );
  }
}
