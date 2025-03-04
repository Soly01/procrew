import { Component, Inject, PLATFORM_ID } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { TranslateService } from '@ngx-translate/core';
import translationsEN from '../../public/i18n/en.json';
import { LocalStorageService } from '../../services/localstorage.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ToastModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  providers: [MessageService],
})
export class AppComponent {
  title = 'procrewTask';
  private isBrowser!: boolean;

  constructor(
    private translate: TranslateService,
    @Inject(PLATFORM_ID) private platformId: object,
    private localStorageService: LocalStorageService
  ) {
    const savedLang = localStorage.getItem('lang') || 'en'; // Default to English
    translate.setDefaultLang(savedLang);
    translate.use(savedLang);
  }
  ngOnInit(): void {
    if (this.isBrowser) {
      this.localStorageService.setItem('testKey', 'testValue');
      console.log(this.localStorageService.getItem('testKey'));
    }
  }
}
