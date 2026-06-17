import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { getStoredToken, setStoredToken } from '../api/client'
import {
  login as apiLogin,
  register as apiRegister,
} from '../api/terminiApi'
import type { AuthResponse, UserDto } from '../types'

const USER_KEY = 'termini_user'

type SessionValue = {
  user: UserDto | null
  token: string | null
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  register: (
    name: string,
    city: string,
    email: string,
    password: string,
  ) => Promise<void>
  /** Përditëso sesionin pas `registerOwner` ose përgjigjeje të ngjashme auth. */
  applyAuthResponse: (res: AuthResponse) => void
  logout: () => void
}

const SessionContext = createContext<SessionValue | null>(null)

function loadUserFromStorage(): UserDto | null {
  try {
    const raw = localStorage.getItem(USER_KEY)
    if (!raw) return null
    return JSON.parse(raw) as UserDto
  } catch {
    return null
  }
}

export function SessionProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserDto | null>(null)
  const [token, setToken] = useState<string | null>(null)

  useEffect(() => {
    const t = getStoredToken()
    if (t) setToken(t)
    setUser(loadUserFromStorage())
  }, [])

  const persist = useCallback((t: string | null, u: UserDto | null) => {
    setToken(t)
    setUser(u)
    setStoredToken(t)
    if (u) localStorage.setItem(USER_KEY, JSON.stringify(u))
    else localStorage.removeItem(USER_KEY)
  }, [])

  const login = useCallback(
    async (email: string, password: string) => {
      const res = await apiLogin({ email, password })
      persist(res.token, res.user)
    },
    [persist],
  )

  const register = useCallback(
    async (name: string, city: string, email: string, password: string) => {
      const res = await apiRegister({ name, city, email, password })
      persist(res.token, res.user)
    },
    [persist],
  )

  const logout = useCallback(() => {
    persist(null, null)
  }, [persist])

  const applyAuthResponse = useCallback(
    (res: AuthResponse) => {
      persist(res.token, res.user)
    },
    [persist],
  )

  const value = useMemo(
    () => ({
      user,
      token,
      isAuthenticated: Boolean(token && user),
      login,
      register,
      applyAuthResponse,
      logout,
    }),
    [user, token, login, register, applyAuthResponse, logout],
  )

  return (
    <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
  )
}

export function useSession(): SessionValue {
  const ctx = useContext(SessionContext)
  if (!ctx) throw new Error('useSession outside SessionProvider')
  return ctx
}
