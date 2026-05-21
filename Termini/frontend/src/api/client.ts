const defaultHeaders = {
  'Content-Type': 'application/json',
}

const TOKEN_KEY = 'termini_token'

const API_BASE =
  (import.meta as any)?.env?.VITE_API_BASE_URL != null
    ? String((import.meta as any).env.VITE_API_BASE_URL)
    : ''

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

export function setStoredToken(token: string | null) {
  if (token) localStorage.setItem(TOKEN_KEY, token)
  else localStorage.removeItem(TOKEN_KEY)
}

/** Raw response text; use `message` (from Error) for UI. */
export class ApiError extends Error {
  status: number
  body: string

  constructor(status: number, body: string) {
    const friendly = formatApiErrorMessage(body, status)
    super(friendly)
    this.status = status
    this.body = body
    this.name = 'ApiError'
  }
}

/** Prefer Spring-style JSON `message` / `detail` / `error` over dumping the whole body. */
export function formatApiErrorMessage(body: string, status: number): string {
  const trimmed = (body ?? '').trim()
  if (!trimmed) {
    return status ? `Gabim ${status}` : 'Gabim në rrjet'
  }
  const looksJson = trimmed.startsWith('{') || trimmed.startsWith('[')
  if (looksJson) {
    try {
      const j = JSON.parse(trimmed) as Record<string, unknown>
      const msg = j.message
      if (typeof msg === 'string' && msg.trim()) return msg.trim()
      const detail = j.detail
      if (typeof detail === 'string' && detail.trim()) return detail.trim()
      const err = j.error
      if (typeof err === 'string' && err.trim()) return err.trim()
    } catch {
      /* fall through */
    }
  }
  return trimmed
}

/** Albanian UI text for common English auth API messages (login screens). */
export function toAlbanianAuthError(text: string): string {
  const raw = (text ?? '').trim()
  if (!raw) return 'Hyrja dështoi.'
  const lower = raw.toLowerCase()
  if (
    lower === 'invalid credentials' ||
    lower === 'bad credentials' ||
    /invalid\s+credentials/i.test(raw) ||
    /bad\s+credentials/i.test(raw)
  ) {
    return 'Email-i ose fjalëkalimi është i gabuar.'
  }
  if (/invalid\s+(username|user\s*name)\s*(or|\/|,)\s*password/i.test(raw)) {
    return 'Email-i ose fjalëkalimi është i gabuar.'
  }
  if (/username\s+or\s+password\s+is\s+incorrect/i.test(raw)) {
    return 'Email-i ose fjalëkalimi është i gabuar.'
  }
  return raw
}

export async function apiJson<T>(path: string, init?: RequestInit): Promise<T> {
  const token = getStoredToken()
  const headers: Record<string, string> = {
    ...defaultHeaders,
    ...(init?.headers as Record<string, string> | undefined),
  }
  const skipBearer =
    path.includes('/api/v1/auth/login') ||
    path.includes('/api/v1/auth/register') ||
    path.includes('/api/v1/auth/owner/register')
  if (token && !skipBearer) headers['Authorization'] = `Bearer ${token}`

  const base = API_BASE.replace(/\/+$/, '')
  const url =
    base && path.startsWith('/')
      ? `${base}${path}`
      : base
        ? `${base}/${path.replace(/^\/+/, '')}`
        : path

  const res = await fetch(url, {
    ...init,
    headers,
  })
  const text = await res.text()
  if (!res.ok) {
    throw new ApiError(res.status, text || res.statusText)
  }
  if (res.status === 204 || text.length === 0) {
    return undefined as T
  }
  try {
    return JSON.parse(text) as T
  } catch {
    return text as unknown as T
  }
}
