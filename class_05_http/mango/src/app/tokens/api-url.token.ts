import { InjectionToken } from '@angular/core';

// A plain string/interface can't be a DI token by itself (TypeScript types vanish at runtime), so
// InjectionToken gives us a unique, injectable identifier for a value that isn't a class - here, the
// API base URL. Its actual value is set once in app.config.ts (`{ provide: API_URL, useValue: ... }`)
// and any service can then `inject(API_URL)` to get it, instead of hardcoding the URL everywhere.
export const API_URL = new InjectionToken<string>('API_URL');
