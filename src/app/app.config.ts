import {
  ApplicationConfig,
  importProvidersFrom,
  provideZoneChangeDetection,
  runInInjectionContext,
} from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import {
  provideClientHydration,
  withEventReplay,
} from '@angular/platform-browser';
import { providePrimeNG } from 'primeng/config';
import Aura from '@primeng/themes/aura';
import { provideAnimations } from '@angular/platform-browser/animations';
import { HttpClient, provideHttpClient } from '@angular/common/http';
import {
  TranslateLoader,
  TranslateModule,
  TranslateService,
} from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { APP_INITIALIZER } from '@angular/core';
import { lastValueFrom } from 'rxjs';
import { LocalStorageKeys } from './enum/localstorage.enum';
import { LanguageKeys } from './enum/language.enum';
import { LocalStorageService } from './services/localstorage.service';

export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http, './i18n/', '.json');
}

function initializeTranslation(translate: TranslateService) {
  return () =>
    lastValueFrom(translate.use('en')).catch(() => {
      console.error('Translation failed to load');
    });
}
export function appInitializerFactory(
  translate: TranslateService,
  localStorageService: LocalStorageService
) {
  return () => {
    const savedLang =
      localStorageService.getItem<string>(LocalStorageKeys.LANGUAGE) ||
      LanguageKeys.ENGLISH;
    translate.use(savedLang);
    document.documentElement.setAttribute(
      'dir',
      savedLang === 'ar' ? 'rtl' : 'ltr'
    );
  };
}
export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideClientHydration(withEventReplay()),
    providePrimeNG({
      theme: {
        preset: Aura,
        options: {
          darkModeSelector: 'none',
        },
      },
    }),
    importProvidersFrom(
      TranslateModule.forRoot({
        loader: {
          provide: TranslateLoader,
          useFactory: HttpLoaderFactory,
          deps: [HttpClient],
        },
      })
    ),
    provideAnimations(),
    provideHttpClient(),
    {
      provide: APP_INITIALIZER,
      useFactory: (translate: TranslateService) => () =>
        initializeTranslation(translate),
      deps: [TranslateService],
      multi: true,
    },
  ],
};
