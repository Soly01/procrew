import { LocalStorageService } from './../../../services/localstorage.service';
import { Component, inject, OnInit, ViewEncapsulation } from '@angular/core';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { Router, RouterLink } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { ToastModule } from 'primeng/toast';
import { AuthService } from '../../../services/auth.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { LocalStorageKeys } from '../../../enum/localstorage.enum';
import { CommonModule } from '@angular/common';
import { LanguageKeys } from '../../../enum/language.enum';

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
    CommonModule,
    RouterLink,
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
  encapsulation: ViewEncapsulation.None,
})
export class LoginComponent implements OnInit {
  private authService = inject(AuthService);
  private messageService = inject(MessageService);
  private LocalStorageService = inject(LocalStorageService);
  private router = inject(Router);
  private translate = inject(TranslateService);
  currentLang!: string;

  ngOnInit(): void {
    this.authService.logoutEvent.subscribe(() => {
      this.loginForm.reset();
    });
    const savedLang = this.LocalStorageService.getItem(
      LocalStorageKeys.LANGUAGE
    );

    // Ensure savedLang is a string, otherwise default to 'en'
    this.currentLang =
      typeof savedLang === 'string' ? savedLang : LanguageKeys.ENGLISH;

    this.translate.setDefaultLang(this.currentLang);
    this.translate.use(this.currentLang);

    this.setDocumentAttributes();
  }
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
        this.translate
          .get(['MESSAGES.SUCCESS', 'MESSAGES.LOGIN_SUCCESS'])
          .subscribe((translations) => {
            this.messageService.add({
              severity: 'success',
              summary: translations['MESSAGES.SUCCESS'],
              detail: translations['MESSAGES.LOGIN_SUCCESS'],
            });
          });

        this.LocalStorageService.setItem(LocalStorageKeys.USERNAME, username);
        this.router.navigate(['/home']);
      } else {
        this.translate
          .get(['MESSAGES.ERROR', 'MESSAGES.INVALID_CREDENTIALS'])
          .subscribe((translations) => {
            this.messageService.add({
              severity: 'error',
              summary: translations['MESSAGES.ERROR'],
              detail: translations['MESSAGES.INVALID_CREDENTIALS'],
            });
          });
      }
    }
  }
  switchLanguage() {
    this.currentLang =
      this.currentLang === LanguageKeys.ENGLISH
        ? LanguageKeys.ARABIC
        : LanguageKeys.ENGLISH;
    this.translate.use(this.currentLang);
    this.LocalStorageService.setItem(
      LocalStorageKeys.LANGUAGE,
      this.currentLang
    );

    this.setDocumentAttributes();
  }

  private setDocumentAttributes() {
    document.documentElement.setAttribute(
      LocalStorageKeys.LANGUAGE,
      this.currentLang
    );
    document.documentElement.setAttribute(
      'dir',
      this.currentLang === 'ar' ? 'rtl' : 'ltr'
    );
  }
}
