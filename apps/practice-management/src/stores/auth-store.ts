import { create } from 'zustand'

interface User {
  id: string
  email: string
  name: string
  role: string
}

interface AuthState {
  user: User | null
  isLoading: boolean
  setUser: (user: User | null) => void
  setLoading: (loading: boolean) => void
  logout: () => Promise<void>
  checkAuth: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: true,
  setUser: (user) => set({ user }),
  setLoading: (isLoading) => set({ isLoading }),
  logout: async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    set({ user: null })
    window.location.href = '/login'
  },
  checkAuth: async () => {
    try {
      const res = await fetch('/api/auth/me')
      if (res.ok) {
        const data = await res.json()
        set({ user: data.user, isLoading: false })
      } else {
        set({ user: null, isLoading: false })
      }
    } catch {
      set({ user: null, isLoading: false })
    }
  }
}))
