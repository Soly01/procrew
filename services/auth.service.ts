import { Injectable } from '@angular/core';
import { LocalStorageService } from './localstorage.service';
import { User } from '../interface/user.interface';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor(private localStorageService: LocalStorageService) {
    this.ensureAdminExists();
  }

  private ensureAdminExists() {
    let users = this.localStorageService.getItem<any[]>('myData') || [];
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
    let users = this.localStorageService.getItem<any[]>('myData') || [];

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
    this.localStorageService.setItem('myData', users);
    return true;
  }

  login(username: string, password: string): boolean {
    let users = this.localStorageService.getItem<any[]>('myData') || [];
    const user = users.find(
      (u) => u.username === username && u.password === password
    );

    if (user) {
      this.localStorageService.setItem('isLogged', true);
      this.localStorageService.setItem('currentUser', user);
      this.localStorageService.setItem('currentRole', user.role);
      return true;
    }
    return false;
  }

  logout() {
    this.localStorageService.removeItem('isLogged');
    this.localStorageService.removeItem('currentUser');
    this.localStorageService.removeItem('currentRole');
  }

  getCurrentUser() {
    const user = this.localStorageService.getItem<User>('loggedInUser');
    return user && user.id ? user : null; // Ensure it has an 'id'
  }

  isLoggedIn(): boolean {
    return !!this.localStorageService.getItem('isLogged');
  }

  isAdmin(): boolean {
    return this.localStorageService.getItem('currentRole') === 'admin';
  }
}
