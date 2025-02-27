import { Component, ViewEncapsulation } from '@angular/core';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { Router } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { ToastModule } from 'primeng/toast';

@Component({
  selector: 'app-register',
  standalone: true,
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
  constructor(private messageService: MessageService, private router: Router) {}
  value: string | undefined;
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
    this.register.get('password')?.valueChanges.subscribe(() => {
      this.checkPasswords();
    });
    this.register.get('confirmPassword')?.valueChanges.subscribe(() => {
      this.checkPasswords();
    });
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
  registerFun() {
    const registerValues = this.register.value;

    const storedData = localStorage.getItem('myData');

    let existingData: any[] = [];
    if (storedData) {
      try {
        existingData = JSON.parse(storedData);
      } catch (error) {
        console.error('Error parsing JSON data from localStorage:', error);
        existingData = [];
      }
    }

    const isEmailAlreadyRegistered = existingData.some(
      (user: any) => user.email === registerValues.email
    );

    if (isEmailAlreadyRegistered) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Email is already registered. Please choose a different email.',
      });
      return this.register.reset();
    }

    const userId = existingData.length + 1;
    const newUser = {
      id: userId,
      ...registerValues,
    };
    existingData.push(newUser);

    localStorage.setItem('myData', JSON.stringify(existingData));

    this.messageService.add({
      severity: 'success',
      summary: 'Success',
      detail: 'You have Registerd Successfully',
    });
    this.router.navigate(['/login']);
  }
}
