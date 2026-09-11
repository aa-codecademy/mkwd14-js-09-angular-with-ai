import { patchState, signalStoreFeature, withMethods, withState } from '@ngrx/signals';

const ACCESS_TOKEN_KEY = 'mango_access_token';
const REFRESH_TOKEN_KEY = 'mango_refresh_token';

export type TokenState = {
  accessToken: string | null;
  refreshToken: string | null;
};

// const initialState: TokenState = {
//   accessToken: null,
//   refreshToken: null,
// };

export function withTokenStorage() {
  return signalStoreFeature(
    withState<TokenState>({
      accessToken: localStorage.getItem(ACCESS_TOKEN_KEY),
      refreshToken: localStorage.getItem(REFRESH_TOKEN_KEY),
    }),
    withMethods((store) => ({
      setTokens(accessToken: string, refreshToken: string): void {
        patchState(store, { accessToken, refreshToken });
        localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
        localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
      },
      clearTokens() {
        patchState(store, { accessToken: null, refreshToken: null });
        localStorage.removeItem(ACCESS_TOKEN_KEY);
        localStorage.removeItem(REFRESH_TOKEN_KEY);
      },
    })),
  );
}
