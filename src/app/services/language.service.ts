import { inject, Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { LanguageKeys } from '../enum/language.enum';
import { LocalStorageKeys } from '../enum/localstorage.enum';
import { LocalStorageService } from './localstorage.service';
@Injectable({
  providedIn: 'root',
})
export class LanguageService {
  private localStroageService = inject(LocalStorageService);

  private langSubject = new BehaviorSubject<
    LanguageKeys.ENGLISH | LanguageKeys.ARABIC
  >(this.getLanguage());
  lang$ = this.langSubject.asObservable(); // Observable to listen for LANGUAGE changes

  setLanguage(lang: LanguageKeys.ENGLISH | LanguageKeys.ARABIC) {
    this.localStroageService.setItem(LocalStorageKeys.LANGUAGE, lang); // Save to localStorage
    this.langSubject.next(lang); // Notify subscribers
  }

  getLanguage(): LanguageKeys.ENGLISH | LanguageKeys.ARABIC {
    const lang = this.localStroageService.getItem<string>(
      LocalStorageKeys.LANGUAGE
    );
    return lang === LanguageKeys.ARABIC
      ? LanguageKeys.ARABIC
      : LanguageKeys.ENGLISH; // Ensure strict type check
  }
}
