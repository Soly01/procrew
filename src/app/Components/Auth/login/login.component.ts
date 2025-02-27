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
  selector: 'app-login',
  imports: [
    CardModule,
    InputTextModule,
    ReactiveFormsModule,
    ToastModule,
    ButtonModule,
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
  encapsulation: ViewEncapsulation.None,
})
export class LoginComponent {
  login: FormGroup = new FormGroup({
    username: new FormControl('', [
      Validators.required,
      Validators.minLength(5),
    ]),
    password: new FormControl('', [
      Validators.required,
      Validators.minLength(5),
    ]),
  });

  constructor(private messageService: MessageService, private router: Router) {}

  signin() {
    if (this.login.valid) {
      const enteredUsername = this.login.get('username')?.value;
      const enteredPassword = this.login.get('password')?.value;

      const userData = JSON.parse(localStorage.getItem('myData') || '[]');

      const user = userData.find(
        (u: any) =>
          u.username === enteredUsername && u.password === enteredPassword
      );

      if (user) {
        localStorage.setItem('isLogged', 'true');
        localStorage.setItem('currentUser', JSON.stringify(user)); // Store full user object

        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Logged in successfully',
        });

        this.router.navigate(['/home']); // ✅ Everyone goes to home now
      } else {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Invalid Username or Password',
        });
      }
    }
  }

  register() {
    this.router.navigate(['/register']);
  }
}
