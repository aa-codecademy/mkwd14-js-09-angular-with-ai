// Production variant of environment.ts - the Angular CLI swaps this in for a `--configuration production`
// build. Gotcha for this lesson: apiUrl still points at localhost, so a real prod build would need this
// changed to the deployed API's URL.
export const environment = {
  production: true,
  apiUrl: 'http://localhost:3000/api'
};
