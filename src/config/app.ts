export const appConfig = {
  appName: 'SOUQ ENGINE',
  storageKey: 'souq-engine-db',
  authStorageKey: 'souq-auth-session',
  apiBaseUrl: process.env.NEXT_PUBLIC_API_BASE_URL ?? '',
  useMockApi: process.env.NEXT_PUBLIC_USE_MOCK_API !== 'false',
}

export const authCookieNames = {
  session: 'souq-session',
  role: 'souq-role',
} as const
