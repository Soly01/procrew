import { Component, inject, ViewEncapsulation } from '@angular/core';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { Router } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { ToastModule } from 'primeng/toast';
import { AuthService } from '../../../services/auth.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CardModule,
    ToastModule,
    ButtonModule,
    InputTextModule,
    ReactiveFormsModule,
    TranslateModule,
  ],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss',
  encapsulation: ViewEncapsulation.None,
})
export class RegisterComponent {
  private authService = inject(AuthService);
  private messageService = inject(MessageService);
  private router = inject(Router);
  private translate = inject(TranslateService);

  registerForm = new FormGroup({
    username: new FormControl('', [Validators.required]),
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [
      Validators.required,
      Validators.minLength(6),
    ]),
    confirmPassword: new FormControl('', [
      Validators.required,
      Validators.minLength(6),
    ]),
  });

  passwordsMatch = true;

  ngOnInit() {
    this.registerForm
      .get('password')
      ?.valueChanges.subscribe(() => this.checkPasswords());
    this.registerForm
      .get('confirmPassword')
      ?.valueChanges.subscribe(() => this.checkPasswords());
  }

  checkPasswords() {
    const password = this.registerForm.get('password')?.value;
    const confirmPassword = this.registerForm.get('confirmPassword')?.value;
    this.passwordsMatch = password === confirmPassword;

    if (!this.passwordsMatch) {
      this.registerForm.get('confirmPassword')?.setErrors({ mismatch: true });
    } else {
      this.registerForm.get('confirmPassword')?.setErrors(null);
    }
  }

  register() {
    if (this.registerForm.valid && this.passwordsMatch) {
      const { username, email, password } = this.registerForm.value;

      if (this.authService.register(username!, email!, password!)) {
        this.translate
          .get(['MESSAGES.SUCCESS', 'MESSAGES.REGISTER_SUCCESS'])
          .subscribe((translations) => {
            this.messageService.add({
              severity: 'success',
              summary: translations['MESSAGES.SUCCESS'],
              detail: translations['MESSAGES.REGISTER_SUCCESS'],
            });
          });

        this.router.navigate(['/login']);
      } else {
        this.translate
          .get(['MESSAGES.ERROR', 'MESSAGES.EMAIL_REGISTERED_ERROR'])
          .subscribe((translations) => {
            this.messageService.add({
              severity: 'error',
              summary: translations['MESSAGES.ERROR'],
              detail: translations['MESSAGES.EMAIL_REGISTERED_ERROR'],
            });
          });
      }
    }
  }
}
