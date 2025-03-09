import { Component, Inject, PLATFORM_ID } from '@angular/core';
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

  constructor(private translate: TranslateService) {
    const savedLang = localStorage.getItem('lang') || LanguageKeys.ENGLISH; // Default to English
    translate.setDefaultLang(savedLang);
    translate.use(savedLang);
  }
  ngOnInit(): void {}
}
