export const AUTH_COOKIES = {
  ACCESS_TOKEN: 'access_token',
  REFRESH_TOKEN: 'refresh_token',
} as const;

export const AUTH_TOKEN_EXPIRATION = {
  ACCESS_TOKEN_SECONDS: 15 * 60, // 15 minutes (900s)
  REFRESH_TOKEN_SECONDS: 7 * 24 * 60 * 60, // 7 days (604,800s)
} as const;
