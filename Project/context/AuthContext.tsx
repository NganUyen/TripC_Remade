'use client'

import { createContext, useContext, useState, ReactNode } from 'react'

interface User {
  id: string
  name: string
  email: string
}

interface AuthContextType {
  user: User | null
  login: (user: User) => void
  logout: () => void
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  
  const login = (userData: User) => {
    setUser(userData)
  }
  
  const logout = () => {
    setUser(null)
  }
  
  const value = {
    user,
    login,
    logout,
    isAuthenticated: !!user,
  }
  
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
