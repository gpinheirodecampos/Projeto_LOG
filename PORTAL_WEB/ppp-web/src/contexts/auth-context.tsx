import React, { createContext, useContext, useState, useEffect } from 'react'

interface AuthContextType {
  isAuthenticated: boolean
  user: User | null
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
  loading: boolean
}

interface User {
  id: string
  name: string
  email: string
  role: string
  company: string
  permissions: string[]
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  // Check if user is already logged in (from localStorage)
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const storedAuth = localStorage.getItem('auth')
        if (storedAuth) {
          const { user: storedUser, token } = JSON.parse(storedAuth)
          if (token && storedUser) {
            setUser(storedUser)
            setIsAuthenticated(true)
          }
        }
      } catch (error) {
        console.error('Error checking authentication:', error)
        localStorage.removeItem('auth')
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [])

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setLoading(true)
      
      // Demo authentication - accept any email/password
      // In production, this would be an API call
      await new Promise(resolve => setTimeout(resolve, 800)) // Simulate API delay
      
      // For demo, just log the password usage (remove in production)
      console.log('Login attempt for:', email, 'with password provided:', !!password)
      
      const mockUser: User = {
        id: '1',
        name: 'Gabriel Campos',
        email: email,
        role: 'CompanyAdmin',
        company: 'Transportes Brasil LTDA',
        permissions: [
          'drivers.read', 'drivers.create', 'drivers.update', 'drivers.delete',
          'vehicles.read', 'vehicles.create', 'vehicles.update', 
          'reports.read', 'reports.export',
          'dashboard.view'
        ]
      }

      const authData = {
        user: mockUser,
        token: 'demo-jwt-token-' + Date.now(),
        expiresAt: Date.now() + (24 * 60 * 60 * 1000) // 24 hours
      }

      localStorage.setItem('auth', JSON.stringify(authData))
      setUser(mockUser)
      setIsAuthenticated(true)
      
      return true
    } catch (error) {
      console.error('Login error:', error)
      return false
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    localStorage.removeItem('auth')
    setUser(null)
    setIsAuthenticated(false)
  }

  const value = {
    isAuthenticated,
    user,
    login,
    logout,
    loading
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