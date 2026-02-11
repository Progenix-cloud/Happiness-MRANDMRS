'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface User {
  id: string
  _id: string
  email: string
  name: string
  phone?: string
  roles: string[]
  category?: string
  registrationStatus: 'pending' | 'approved' | 'rejected'
  happinessPassportCount: number
  verifiedEntriesCount: number
  profileImage?: string
  bio?: string
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  register: (data: RegisterData) => Promise<void>
  logout: () => void
  updateProfile: (data: Partial<User>) => Promise<void>
  checkAuth: () => Promise<void>
}

interface RegisterData {
  email: string
  password: string
  name: string
  phone?: string
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Check for existing session on mount
  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      // Check for token in localStorage (from Google OAuth)
      const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null
      
      const headers: Record<string, string> = {}
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }
      
      const response = await fetch('/api/auth/me', {
        headers: headers.Authorization ? headers : undefined,
        credentials: 'include',
      })
      if (response.ok) {
        const userData = await response.json()
        setUser({
          ...userData,
          id: userData._id || userData.id,
        })
        
        // If we had a localStorage token, set it as a cookie for future requests
        if (token) {
          // The auth_token cookie should be set by the server on login/google endpoints
          // But as a fallback, we ensure localStorage stays in sync
        }
      } else {
        // Clear invalid token from localStorage
        if (token) {
          localStorage.removeItem('auth_token')
        }
      }
    } catch (error) {
      console.error('Auth check failed:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const login = async (email: string, password: string) => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Login failed')
      }

      setUser({
        ...data.user,
        id: data.user._id || data.user.id,
      })
      // Session cookie will be set by server (HttpOnly cookie)
    } finally {
      setIsLoading(false)
    }
  }

  const register = async (data: RegisterData) => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Registration failed')
      }

      // Server sets HttpOnly verification cookie; client needn't store token
      if (result.user) {
        setUser({
          ...result.user,
          id: result.user._id || result.user.id,
        })
      }
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    setUser(null)
    // Ask server to clear cookie
    try {
      fetch('/api/auth/logout', { method: 'POST', credentials: 'include' })
    } catch (e) {
      // ignore
    }
  }

  const updateProfile = async (data: Partial<User>) => {
    const response = await fetch('/api/auth/me', {
      method: 'PUT',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      throw new Error('Failed to update profile')
    }

    const updatedUser = await response.json()
    setUser({
      ...updatedUser,
      id: updatedUser._id || updatedUser.id,
    })
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        updateProfile,
        checkAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

