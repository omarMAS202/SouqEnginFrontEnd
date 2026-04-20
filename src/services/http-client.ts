import { appConfig } from '@/config/app'

export class ApiError extends Error {
  status: number
  details?: unknown

  constructor(message: string, status: number, details?: unknown) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.details = details
  }
}

function resolveUrl(path: string) {
  const base = appConfig.apiBaseUrl.replace(/\/$/, '')
  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  return `${base}${normalizedPath}`
}

async function parseResponseBody(response: Response) {
  const contentType = response.headers.get('content-type') ?? ''

  if (contentType.includes('application/json')) {
    return response.json()
  }

  const text = await response.text()
  return text ? { detail: text } : null
}

export async function httpRequest<T>(
  path: string,
  init: RequestInit & {
    accessToken?: string | null
  } = {},
): Promise<{ data: T; response: Response }> {
  const headers = new Headers(init.headers)
  headers.set('Accept', 'application/json')

  if (init.body && !(init.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }

  if (init.accessToken) {
    headers.set('Authorization', `Bearer ${init.accessToken}`)
  }

  const response = await fetch(resolveUrl(path), {
    ...init,
    headers,
  })

  const body = await parseResponseBody(response)

  if (!response.ok) {
    const message =
      typeof body === 'object' &&
      body !== null &&
      'detail' in body &&
      typeof body.detail === 'string'
        ? body.detail
        : `Request failed with status ${response.status}.`

    throw new ApiError(message, response.status, body)
  }

  return {
    data: body as T,
    response,
  }
}
