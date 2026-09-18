import { inject, Injectable, signal } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import type { Lang } from '../../core/types/lang.type';

// One key, one place. Hard-coding the string in three methods is how you end up
// reading 'mango_language' and writing 'mango_lang' without noticing.
const LANG_STORAGE_KEY = 'mango_language';

// 'root' = a single shared instance. The language is app-wide state, so every component
// that injects this service must see the SAME currentLang signal.
@Injectable({ providedIn: 'root' })
export class LanguageService {
  private translate = inject(TranslateService);

  readonly available: Lang[] = ['en', 'mk'];
  // A signal (not a plain field) so templates re-render the moment the language changes.
  // ngx-translate has its own currentLang, but it is not a signal - this is our reactive mirror.
  readonly currentLang = signal<Lang>('en');

  // Called once at startup by APP_INITIALIZER (see app.config.ts) so the first screen
  // already renders in the saved language instead of flashing English first.
  init() {
    // getItem returns null when nothing was saved - the `as Lang` cast is a promise to
    // TypeScript, not a check, so the ?? 'en' fallback below is what actually keeps us safe.
    const savedLang = localStorage.getItem(LANG_STORAGE_KEY) as Lang | undefined;
    this.use(savedLang ?? 'en');
  }

  use(lang: Lang) {
    // use() tells ngx-translate to load /i18n/<lang>.json (via the HTTP loader) and
    // re-render every `| translate` pipe in the app. Everything below just keeps the
    // rest of the world in sync with that switch.
    this.translate.use(lang);
    this.currentLang.set(lang);
    localStorage.setItem(LANG_STORAGE_KEY, lang);
    // Sets <html lang="mk">. Not cosmetic: screen readers pick the right voice and
    // browsers offer the right translation prompt based on this attribute.
    document.documentElement.lang = lang;
  }

  toggle() {
    this.use(this.currentLang() === 'mk' ? 'en' : 'mk');
  }
}
