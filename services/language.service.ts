import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class LanguageService {
  private langSubject = new BehaviorSubject<'en' | 'ar'>(this.getLanguage());
  lang$ = this.langSubject.asObservable(); // Observable to listen for language changes

  setLanguage(lang: 'en' | 'ar') {
    localStorage.setItem('lang', lang); // Save to localStorage
    this.langSubject.next(lang); // Notify subscribers
  }

  getLanguage(): 'en' | 'ar' {
    const lang = localStorage.getItem('language');
    return lang === 'ar' ? 'ar' : 'en'; // Ensure strict type check
  }
}
