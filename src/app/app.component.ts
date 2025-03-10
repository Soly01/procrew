import { Component, inject, Inject, PLATFORM_ID } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { TranslateService } from '@ngx-translate/core';
import { LocalStorageService } from '../../src/app/services/localstorage.service';
import { LocalStorageKeys } from './enum/localstorage.enum';
import { LanguageKeys } from './enum/language.enum';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ToastModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  providers: [MessageService],
})
export class AppComponent {
  title = 'procrewTask';
  private translate = inject(TranslateService);
  private LocalStorageService = inject(LocalStorageService);

  ngOnInit() {
    const savedLang =
      this.LocalStorageService.getItem<string>(LocalStorageKeys.LANGUAGE) ||
      LanguageKeys.ENGLISH;

    this.translate.use(savedLang);
    this.setDocumentAttributes(savedLang);
  }

  private setDocumentAttributes(lang: string) {
    document.documentElement.setAttribute(LocalStorageKeys.LANGUAGE, lang);
    document.documentElement.setAttribute('dir', lang === 'ar' ? 'rtl' : 'ltr');
  }
}
