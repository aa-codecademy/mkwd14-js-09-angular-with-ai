// Production counterpart to environment.ts, swapped in at build time. Gotcha: apiUrl here is
// still pointing at localhost - in a real deploy this must be changed to the real API host,
// otherwise the production build silently tries to call a dev server.
export const environment = {
  production: true,
  apiUrl: 'http://localhost:3000/api'
};
