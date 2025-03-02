import { Component, inject, ViewEncapsulation } from '@angular/core';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { Router } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { ToastModule } from 'primeng/toast';
import { AuthService } from '../../../../../services/auth.service';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CardModule,
    InputTextModule,
    ReactiveFormsModule,
    ToastModule,
    ButtonModule,
    TranslateModule,
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
  encapsulation: ViewEncapsulation.None,
})
export class LoginComponent {
  private authService = inject(AuthService);
  private messageService = inject(MessageService);
  private router = inject(Router);

  loginForm = new FormGroup({
    username: new FormControl('', [
      Validators.required,
      Validators.minLength(5),
    ]),
    password: new FormControl('', [
      Validators.required,
      Validators.minLength(5),
    ]),
  });

  signin() {
    if (this.loginForm.valid) {
      const { username, password } = this.loginForm.value;

      if (this.authService.login(username!, password!)) {
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Logged in successfully',
        });
        this.router.navigate(['/home']);
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
