import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { LocalStorageService } from '../../../../services/localstorage.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, TranslateModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent {
  private translate = inject(TranslateService);
  private localStorageService = inject(LocalStorageService);

  currentLang: string;

  constructor() {
    const savedLang = this.localStorageService.getItem('language');

    // Ensure savedLang is a string, otherwise default to 'en'
    this.currentLang = typeof savedLang === 'string' ? savedLang : 'en';

    this.translate.setDefaultLang(this.currentLang);
    this.translate.use(this.currentLang);

    this.setDocumentAttributes();
  }

  switchLanguage() {
    this.currentLang = this.currentLang === 'en' ? 'ar' : 'en';
    this.translate.use(this.currentLang);
    this.localStorageService.setItem('language', this.currentLang);

    this.setDocumentAttributes();
  }

  private setDocumentAttributes() {
    document.documentElement.setAttribute('lang', this.currentLang);
    document.documentElement.setAttribute(
      'dir',
      this.currentLang === 'ar' ? 'rtl' : 'ltr'
    );
  }
}
