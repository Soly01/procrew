import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-header',
  imports: [RouterLink, RouterLinkActive, TranslateModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent {
  private translate = inject(TranslateService);
  currentLang = 'en';

  constructor() {
    this.translate.setDefaultLang('en');
    this.translate.use('en');
  }

  switchLanguage() {
    this.currentLang = this.currentLang === 'en' ? 'ar' : 'en';
    this.translate.use(this.currentLang);
    document.documentElement.setAttribute('lang', this.currentLang);
    document.documentElement.setAttribute(
      'dir',
      this.currentLang === 'ar' ? 'rtl' : 'ltr'
    );
  }
}
