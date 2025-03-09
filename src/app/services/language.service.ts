import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { LanguageKeys } from '../enum/language.enum';
import { LocalStorageKeys } from '../enum/localstorage.enum';
@Injectable({
  providedIn: 'root',
})
export class LanguageService {
  private langSubject = new BehaviorSubject<
    LanguageKeys.ENGLISH | LanguageKeys.ARABIC
  >(this.getLanguage());
  lang$ = this.langSubject.asObservable(); // Observable to listen for LANGUAGE changes

  setLanguage(lang: LanguageKeys.ENGLISH | LanguageKeys.ARABIC) {
    localStorage.setItem(LocalStorageKeys.LANGUAGE, lang); // Save to localStorage
    this.langSubject.next(lang); // Notify subscribers
  }

  getLanguage(): LanguageKeys.ENGLISH | LanguageKeys.ARABIC {
    const lang = localStorage.getItem(LocalStorageKeys.LANGUAGE);
    return lang === LanguageKeys.ARABIC
      ? LanguageKeys.ARABIC
      : LanguageKeys.ENGLISH; // Ensure strict type check
  }
}
