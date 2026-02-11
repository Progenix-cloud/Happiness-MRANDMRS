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
      const response = await fetch('/api/auth/me')
      if (response.ok) {
        const userData = await response.json()
        setUser({
          ...userData,
          id: userData._id || userData.id,
        })
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
      
      // Store session
      localStorage.setItem('auth_token', data.token)
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

      if (result.requiresVerification) {
        // Store temporary token for verification
        localStorage.setItem('auth_token', result.token)
        setUser({
          ...result.user,
          id: result.user._id || result.user.id,
        })
      } else {
        setUser({
          ...result.user,
          id: result.user._id || result.user.id,
        })
        localStorage.setItem('auth_token', result.token)
      }
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('auth_token')
  }

  const updateProfile = async (data: Partial<User>) => {
    const response = await fetch('/api/auth/me', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
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

