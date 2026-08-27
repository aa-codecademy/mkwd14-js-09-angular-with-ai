// Dev-mode environment config. The Angular CLI file-replaces this with environment.prod.ts
// when building with `--configuration production` (see angular.json's fileReplacements).
// apiUrl is provided app-wide through the API_URL injection token in app.config.ts, so services
// never hardcode a URL directly - only this file needs to change per environment.
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api',
};
