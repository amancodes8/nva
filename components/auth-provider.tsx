'use client'

import { createContext, useContext, useState, useEffect } from 'react'

interface AuthContextType {
  isAuthenticated: boolean
  user: any
  login: (email: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState(null)

  useEffect(() => {
    // Check for existing session
    const token = localStorage.getItem('auth-token')
    if (token) {
      setIsAuthenticated(true)
      // In a real app, validate token and get user data
    }
  }, [])

  const login = async (email: string, password: string) => {
    // Simulate login
    localStorage.setItem('auth-token', 'mock-token')
    setIsAuthenticated(true)
    setUser({ email })
  }

  const logout = () => {
    localStorage.removeItem('auth-token')
    setIsAuthenticated(false)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout }}>
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
