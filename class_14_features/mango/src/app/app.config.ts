import {
  APP_INITIALIZER,
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
} from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { API_URL } from './tokens/api-url.token';
import { environment } from '../environments/environment';
import { provideHttpClient, withInterceptors, withXhr } from '@angular/common/http';
import { loadingInterceptor } from './shared/interceptors/loading.interceptor';
import { provideDevtoolsConfig } from '@ngrx-toolkit/core';
import { authInterceptor } from './shared/interceptors/auth.interceptor';
import { refreshTokenInterceptor } from './shared/interceptors/refresh-token.interceptor';
import { provideTranslateService } from '@ngx-translate/core';
import { provideTranslateHttpLoader } from '@ngx-translate/http-loader';
import { LanguageService } from './shared/services/language.service';
import { MatPaginatorIntl } from '@angular/material/paginator';
import { TranslatedPaginatorIntl } from './shared/services/translated-paginator-intl.service';

function initLanguage(language: LanguageService) {
  return () => language.init();
}

// ApplicationConfig is the standalone-app replacement for the old root NgModule -
// it just registers app-wide providers (dependency injection tokens) via bootstrapApplication.
export const appConfig: ApplicationConfig = {
  providers: [
    // Global handler that reports uncaught errors instead of letting them fail silently.
    provideBrowserGlobalErrorListeners(),
    // Registers the Router service app-wide and wires up our `routes` array - without this,
    // <router-outlet> and routerLink would have nothing to talk to.
    provideRouter(routes),
    provideHttpClient(
      withXhr(),
      withInterceptors([loadingInterceptor, authInterceptor, refreshTokenInterceptor]),
    ),
    { provide: API_URL, useValue: environment.apiUrl },
    // Signal stores connect to the Redux DevTools browser extension via the
    // @ngrx-toolkit/core Redux DevTools bridge. The extension sees window.__REDUX_DEVTOOLS_EXTENSION__.
    provideDevtoolsConfig({ name: 'Mango' }),
    provideTranslateService({
      loader: provideTranslateHttpLoader({ prefix: '/i18n/', suffix: '.json' }),
      fallbackLang: 'en',
      lang: 'en',
    }),
    // Localises the Material paginator's built-in labels ("Items per page", "1 - 10 of 42").
    { provide: MatPaginatorIntl, useClass: TranslatedPaginatorIntl },
    {
      provide: APP_INITIALIZER,
      useFactory: initLanguage,
      deps: [LanguageService],
      multi: true,
    },
  ],
};
