import { Component, inject, ViewEncapsulation } from '@angular/core';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { Router } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { ToastModule } from 'primeng/toast';
import { LocalStorageService } from '../../../../../services/localstorage.service';

@Component({
  selector: 'app-register',
  imports: [
    CardModule,
    ToastModule,
    ButtonModule,
    InputTextModule,
    ReactiveFormsModule,
  ],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss',
  encapsulation: ViewEncapsulation.None,
})
export class RegisterComponent {
  private localStorageService = inject(LocalStorageService);
  private messageService = inject(MessageService);
  private router = inject(Router);

  register: FormGroup = new FormGroup({
    username: new FormControl('', [
      Validators.required,
      Validators.minLength(6),
    ]),
    password: new FormControl('', [
      Validators.required,
      Validators.minLength(6),
    ]),
    confirmPassword: new FormControl('', [
      Validators.required,
      Validators.minLength(6),
    ]),
    email: new FormControl('', [Validators.required, Validators.email]),
  });

  passwordsMatch: boolean = false;

  ngOnInit() {
    this.register
      .get('password')
      ?.valueChanges.subscribe(() => this.checkPasswords());
    this.register
      .get('confirmPassword')
      ?.valueChanges.subscribe(() => this.checkPasswords());

    this.ensureAdminExists();
  }

  checkPasswords() {
    const password = this.register.get('password')?.value;
    const confirmPassword = this.register.get('confirmPassword')?.value;
    this.passwordsMatch = password === confirmPassword;

    if (this.passwordsMatch) {
      this.register.get('confirmPassword')?.setErrors(null);
    } else {
      this.register.get('confirmPassword')?.setErrors({ mismatch: true });
    }
  }

  ensureAdminExists() {
    let storedData = this.localStorageService.getItem<any[]>('myData') || [];
    const adminExists = storedData.some(
      (user) => user.email === 'admin@example.com'
    );

    if (!adminExists) {
      const adminUser = {
        id: 0,
        username: 'Admin',
        email: 'admin@example.com',
        password: 'admin123',
        role: 'admin',
      };
      storedData.push(adminUser);
      this.localStorageService.setItem('myData', storedData);
    }
  }

  registerFun() {
    const registerValues = this.register.value;
    let storedData = this.localStorageService.getItem<any[]>('myData') || [];

    if (storedData.some((user) => user.email === registerValues.email)) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Email is already registered. Please choose a different email.',
      });
      return this.register.reset();
    }

    const userId = storedData.length + 1;
    const newUser = {
      id: userId,
      username: registerValues.username,
      email: registerValues.email,
      password: registerValues.password,
      role: 'customer', // Default role
    };

    storedData.push(newUser);
    this.localStorageService.setItem('myData', storedData);

    this.messageService.add({
      severity: 'success',
      summary: 'Success',
      detail: 'You have registered successfully',
    });

    this.router.navigate(['/login']);
  }
}
