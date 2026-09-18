import { inject, Injectable, signal } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import type { Lang } from '../../core/types/lang.type';

const LANG_STORAGE_KEY = 'mango_language';

@Injectable({ providedIn: 'root' })
export class LanguageService {
  private translate = inject(TranslateService);

  readonly available: Lang[] = ['en', 'mk'];
  readonly currentLang = signal<Lang>('en');

  init() {
    const savedLang = localStorage.getItem(LANG_STORAGE_KEY) as Lang | undefined;
    this.use(savedLang ?? 'en');
  }

  use(lang: Lang) {
    this.translate.use(lang);
    this.currentLang.set(lang);
    localStorage.setItem(LANG_STORAGE_KEY, lang);
    document.documentElement.lang = lang;
  }

  toggle() {
    this.use(this.currentLang() === 'mk' ? 'en' : 'mk');
  }
}
