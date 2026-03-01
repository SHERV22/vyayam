import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth'
import { doc, serverTimestamp, setDoc } from 'firebase/firestore'
import { auth, db, firebaseConfigError } from '../firebase/config'

const GUEST_SESSION_KEY = 'vyayam_guest_session'

export interface AppUser {
  uid: string
  email: string | null
  name: string | null
  isGuest: boolean
}

export interface RegisterInput {
  name: string
  email: string
  password: string
}

export interface AuthContextValue {
  user: AppUser | null
  loading: boolean
  configError: string | null
  register: (input: RegisterInput) => Promise<void>
  login: (email: string, password: string) => Promise<void>
  loginAsGuest: () => void
  logout: () => Promise<void>
}

export const AuthContext = createContext<AuthContextValue | null>(null)

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AppUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const persistedGuest = localStorage.getItem(GUEST_SESSION_KEY)

    if (persistedGuest) {
      setUser({
        uid: 'guest-local',
        email: null,
        name: 'Guest',
        isGuest: true,
      })
      setLoading(false)
      return
    }

    if (!auth) {
      setLoading(false)
      return
    }

    const unsubscribe = onAuthStateChanged(auth, (nextUser) => {
      if (!nextUser) {
        setUser(null)
      } else {
        setUser({
          uid: nextUser.uid,
          email: nextUser.email,
          name: nextUser.displayName,
          isGuest: false,
        })
      }
      setLoading(false)
    })

    return unsubscribe
  }, [])

  const register = useCallback(async ({ name, email, password }: RegisterInput) => {
    if (!auth || !db) {
      throw new Error(firebaseConfigError ?? 'Firebase is not configured')
    }

    localStorage.removeItem(GUEST_SESSION_KEY)

    const credential = await createUserWithEmailAndPassword(auth, email, password)

    await setDoc(doc(db, 'users', credential.user.uid), {
      name,
      email,
      createdAt: serverTimestamp(),
    })
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    if (!auth) {
      throw new Error(firebaseConfigError ?? 'Firebase is not configured')
    }

    localStorage.removeItem(GUEST_SESSION_KEY)

    await signInWithEmailAndPassword(auth, email, password)
  }, [])

  const loginAsGuest = useCallback(() => {
    localStorage.setItem(GUEST_SESSION_KEY, '1')
    setUser({
      uid: 'guest-local',
      email: null,
      name: 'Guest',
      isGuest: true,
    })
    setLoading(false)
  }, [])

  const logout = useCallback(async () => {
    if (user?.isGuest) {
      localStorage.removeItem(GUEST_SESSION_KEY)
      setUser(null)
      return
    }

    if (!auth) {
      throw new Error(firebaseConfigError ?? 'Firebase is not configured')
    }

    await signOut(auth)
  }, [user])

  const value = useMemo(
    () => ({
      user,
      loading,
      configError: firebaseConfigError,
      register,
      login,
      loginAsGuest,
      logout,
    }),
    [loading, login, loginAsGuest, logout, register, user],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
