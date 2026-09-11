import { patchState, signalStoreFeature, withMethods, withState } from '@ngrx/signals';

// Keys live in constants, not inline strings. Typo a string in one of four places and you
// get a silent bug: you write a token under one key and read `null` back from another.
const ACCESS_TOKEN_KEY = 'mango_access_token';
const REFRESH_TOKEN_KEY = 'mango_refresh_token';

export type TokenState = {
  // Two tokens on purpose: the ACCESS token is short-lived and sent with every request,
  // the REFRESH token is long-lived and only used to get a new access token.
  accessToken: string | null;
  refreshToken: string | null;
};

// const initialState: TokenState = {
//   accessToken: null,
//   refreshToken: null,
// };

// A feature whose only job is "where do tokens live". Splitting it out means AuthStore
// never touches localStorage directly - swap this file for cookies later and nothing
// else in the app changes.
export function withTokenStorage() {
  return signalStoreFeature(
    // The initial state is READ FROM localStorage, not hardcoded to null. That single
    // line is what keeps you logged in after a page refresh - without it, every reload
    // starts the store empty and the navbar flips back to "Login".
    withState<TokenState>({
      accessToken: localStorage.getItem(ACCESS_TOKEN_KEY),
      refreshToken: localStorage.getItem(REFRESH_TOKEN_KEY),
    }),
    withMethods((store) => ({
      setTokens(accessToken: string, refreshToken: string): void {
        // Always write BOTH places: patchState updates the in-memory signals so the UI
        // reacts instantly, localStorage makes it survive a refresh. Skip one and the
        // two sources of truth drift apart.
        patchState(store, { accessToken, refreshToken });
        localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
        localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
      },
      clearTokens() {
        // Logout is the mirror image. Forget removeItem and the user "logs out" until
        // they refresh the page - then they are magically logged in again.
        patchState(store, { accessToken: null, refreshToken: null });
        localStorage.removeItem(ACCESS_TOKEN_KEY);
        localStorage.removeItem(REFRESH_TOKEN_KEY);
      },
    })),
  );
}
