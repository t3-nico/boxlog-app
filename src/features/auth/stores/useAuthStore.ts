/**
 * Zustand認証ストア
 * Context APIから移行してパフォーマンスを最適化
 *
 * @see docs/architecture/AUTH_STORE.md
 */
import { createClient } from '@/lib/supabase/client'
import type { AuthError, AuthResponse, OAuthResponse, Session, User } from '@supabase/supabase-js'
import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

interface UserMetadata {
  [key: string]: string | number | boolean | null
}

interface AuthState {
  // State
  user: User | null
  session: Session | null
  loading: boolean
  error: string | null

  // Actions
  initialize: () => Promise<void>
  signUp: (email: string, password: string, metadata?: UserMetadata) => Promise<AuthResponse>
  signIn: (email: string, password: string) => Promise<AuthResponse>
  signInWithOAuth: (provider: 'google' | 'apple' | 'github') => Promise<OAuthResponse>
  signOut: () => Promise<{ error: AuthError | null }>
  resetPassword: (email: string) => Promise<{ error: AuthError | null }>
  updatePassword: (password: string) => Promise<AuthResponse>
  clearError: () => void

  // Internal
  _setUser: (user: User | null) => void
  _setSession: (session: Session | null) => void
  _setLoading: (loading: boolean) => void
  _setError: (error: string | null) => void
}

export const useAuthStore = create<AuthState>()(
  devtools(
    (set, get) => ({
      // Initial state
      user: null,
      session: null,
      loading: true,
      error: null,

      // Initialize authentication state
      initialize: async () => {
        try {
          const supabase = createClient()
          const { data, error } = await supabase.auth.getSession()

          if (error) {
            console.error('Session retrieval error:', error)
            set({ error: error.message, loading: false })
            return
          }

          set({
            session: data.session,
            user: data.session?.user ?? null,
            loading: false,
            error: null,
          })

          // Listen to auth state changes
          const {
            data: { subscription },
          } = supabase.auth.onAuthStateChange((_event, session) => {
            console.log('Auth state changed:', _event)
            set({
              session,
              user: session?.user ?? null,
            })
          })

          // Cleanup subscription on unmount
          if (typeof window !== 'undefined') {
            window.addEventListener('beforeunload', () => {
              subscription.unsubscribe()
            })
          }
        } catch (err) {
          console.error('Initialization error:', err)
          const errorMessage = err instanceof Error ? err.message : 'Failed to initialize auth'
          set({ error: errorMessage, loading: false })
        }
      },

      // Sign up with email and password
      signUp: async (email, password, metadata) => {
        set({ loading: true, error: null })

        try {
          const supabase = createClient()
          const result = await supabase.auth.signUp({
            email,
            password,
            options: {
              data: metadata,
            },
          })

          if (result.error) {
            set({ error: result.error.message, loading: false })
          } else {
            set({
              session: result.data.session,
              user: result.data.user,
              loading: false,
              error: null,
            })
          }

          return result
        } catch (err) {
          const errorMessage = err instanceof Error ? err.message : 'Sign up failed'
          set({ error: errorMessage, loading: false })
          return {
            data: { user: null, session: null },
            error: { message: errorMessage } as AuthError,
          }
        }
      },

      // Sign in with email and password
      signIn: async (email, password) => {
        set({ loading: true, error: null })

        try {
          const supabase = createClient()
          const result = await supabase.auth.signInWithPassword({
            email,
            password,
          })

          if (result.error) {
            set({ error: result.error.message, loading: false })
          } else {
            set({
              session: result.data.session,
              user: result.data.user,
              loading: false,
              error: null,
            })
          }

          return result
        } catch (err) {
          const errorMessage = err instanceof Error ? err.message : 'Sign in failed'
          set({ error: errorMessage, loading: false })
          return {
            data: { user: null, session: null },
            error: { message: errorMessage } as AuthError,
          }
        }
      },

      // Sign in with OAuth
      signInWithOAuth: async (provider) => {
        set({ loading: true, error: null })

        try {
          const supabase = createClient()
          const result = await supabase.auth.signInWithOAuth({
            provider,
            options: {
              redirectTo: `${window.location.origin}/auth/callback`,
            },
          })

          if (result.error) {
            set({ error: result.error.message, loading: false })
          }

          return result
        } catch (err) {
          const errorMessage = err instanceof Error ? err.message : 'OAuth sign in failed'
          set({ error: errorMessage, loading: false })
          return {
            data: { provider, url: null },
            error: { message: errorMessage } as AuthError,
          }
        }
      },

      // Sign out
      signOut: async () => {
        set({ loading: true, error: null })

        try {
          const supabase = createClient()
          const result = await supabase.auth.signOut()

          if (result.error) {
            set({ error: result.error.message, loading: false })
          } else {
            set({
              user: null,
              session: null,
              loading: false,
              error: null,
            })
          }

          return { error: result.error }
        } catch (err) {
          const errorMessage = err instanceof Error ? err.message : 'Sign out failed'
          set({ error: errorMessage, loading: false })
          return { error: { message: errorMessage } as AuthError }
        }
      },

      // Reset password
      resetPassword: async (email) => {
        set({ loading: true, error: null })

        try {
          const supabase = createClient()
          const result = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/auth/reset-password`,
          })

          if (result.error) {
            set({ error: result.error.message, loading: false })
          } else {
            set({ loading: false })
          }

          return { error: result.error }
        } catch (err) {
          const errorMessage = err instanceof Error ? err.message : 'Password reset failed'
          set({ error: errorMessage, loading: false })
          return { error: { message: errorMessage } as AuthError }
        }
      },

      // Update password
      updatePassword: async (password) => {
        set({ loading: true, error: null })

        try {
          const supabase = createClient()
          const result = await supabase.auth.updateUser({ password })

          if (result.error) {
            set({ error: result.error.message, loading: false })
          } else {
            set({ loading: false })
          }

          return result
        } catch (err) {
          const errorMessage = err instanceof Error ? err.message : 'Password update failed'
          set({ error: errorMessage, loading: false })
          return {
            data: { user: null },
            error: { message: errorMessage } as AuthError,
          }
        }
      },

      // Clear error
      clearError: () => {
        set({ error: null })
      },

      // Internal setters (for direct state manipulation if needed)
      _setUser: (user) => set({ user }),
      _setSession: (session) => set({ session }),
      _setLoading: (loading) => set({ loading }),
      _setError: (error) => set({ error }),
    }),
    {
      name: 'auth-store',
    }
  )
)

// Selectors for optimized component re-renders
export const selectUser = (state: AuthState) => state.user
export const selectSession = (state: AuthState) => state.session
export const selectLoading = (state: AuthState) => state.loading
export const selectError = (state: AuthState) => state.error
export const selectIsAuthenticated = (state: AuthState) => !!state.user
