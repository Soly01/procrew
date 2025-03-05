import { Injectable } from '@angular/core';
import { LocalStorageService } from './localstorage.service';
import { User } from '../interface/user.interface';
import { LocalStorageKeys } from '../enum/localstorage.enum';
@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor(private localStorageService: LocalStorageService) {
    this.ensureAdminExists();
  }

  private ensureAdminExists() {
    let users =
      this.localStorageService.getItem<any[]>(LocalStorageKeys.myData) || [];
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
      this.localStorageService.getItem<any[]>(LocalStorageKeys.myData) || [];

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
    this.localStorageService.setItem(LocalStorageKeys.myData, users);
    return true;
  }

  login(username: string, password: string): boolean {
    let users =
      this.localStorageService.getItem<any[]>(LocalStorageKeys.myData) || [];
    const user = users.find(
      (u) => u.username === username && u.password === password
    );

    if (user) {
      this.localStorageService.setItem(LocalStorageKeys.isLogged, 'true');
      this.localStorageService.setItem(LocalStorageKeys.currentUser, user);
      this.localStorageService.setItem(LocalStorageKeys.currentRole, user.role);
      return true;
    }
    return false;
  }

  logout() {
    this.localStorageService.removeItem(LocalStorageKeys.isLogged);
    this.localStorageService.removeItem(LocalStorageKeys.currentUser);
    this.localStorageService.removeItem(LocalStorageKeys.currentRole);
  }

  getCurrentUser() {
    const user = this.localStorageService.getItem<User>(
      LocalStorageKeys.loggedInUser
    );
    return user && user.id ? user : null; // Ensure it has an 'id'
  }

  isLoggedIn(): boolean {
    return !!this.localStorageService.getItem(LocalStorageKeys.isLogged);
  }

  isAdmin(): boolean {
    return (
      this.localStorageService.getItem(LocalStorageKeys.currentRole) ===
      LocalStorageKeys.Admin
    );
  }
}
