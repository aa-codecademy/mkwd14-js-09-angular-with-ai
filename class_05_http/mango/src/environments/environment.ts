// Dev-time config, swapped for environment.prod.ts in a production build (via fileReplacements in
// angular.json). Centralizing apiUrl here - instead of hardcoding it in each service - means changing
// backends only touches this one file, and it's consumed through the API_URL InjectionToken.
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api',
};
