import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { LocalStorageService } from '../../../../services/localstorage.service';
import { ButtonModule } from 'primeng/button';
import { LocalStorageKeys } from '../../../../enum/localstorage.enum';
import { LanguageKeys } from './../../../../enum/language.enum';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, TranslateModule, ButtonModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent {
  private translate = inject(TranslateService);
  private localStorageService = inject(LocalStorageService);
  currentRole = this.localStorageService.getItem(LocalStorageKeys.currentRole);
  currentLang: string;

  constructor() {
    const savedLang = this.localStorageService.getItem(
      LocalStorageKeys.language
    );

    // Ensure savedLang is a string, otherwise default to 'en'
    this.currentLang =
      typeof savedLang === 'string' ? savedLang : LanguageKeys.ENGLISH;

    this.translate.setDefaultLang(this.currentLang);
    this.translate.use(this.currentLang);

    this.setDocumentAttributes();
  }

  switchLanguage() {
    this.currentLang =
      this.currentLang === LanguageKeys.ENGLISH
        ? LanguageKeys.ARABIC
        : LanguageKeys.ENGLISH;
    this.translate.use(this.currentLang);
    this.localStorageService.setItem(
      LocalStorageKeys.language,
      this.currentLang
    );

    this.setDocumentAttributes();
  }

  private setDocumentAttributes() {
    document.documentElement.setAttribute(
      LocalStorageKeys.language,
      this.currentLang
    );
    document.documentElement.setAttribute(
      'dir',
      this.currentLang === 'ar' ? 'rtl' : 'ltr'
    );
  }
}
