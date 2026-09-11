import { InjectionToken } from '@angular/core';

// A plain string has no class to inject, so we create an InjectionToken as its DI "key".
// The value is supplied once in app.config.ts; the text 'API_URL' only shows up in error messages.
export const API_URL = new InjectionToken<string>('API_URL');
