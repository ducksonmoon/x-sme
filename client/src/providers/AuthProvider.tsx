import React, { createContext, useContext, useEffect, ReactNode } from 'react'
import { useAuthStore } from '@store/authStore'
import { api } from '@services/api'

interface AuthContextType {
  user: any | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (userData: any) => Promise<void>
  logout: () => void
  refreshToken: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const { user, isAuthenticated, isLoading, setUser, setAuthenticated, setLoading } = useAuthStore()

  const login = async (email: string, password: string) => {
    try {
      setLoading(true)
      const response = await api.post('/auth/login', { email, password })
      const { user: userData, token } = response.data
      
      localStorage.setItem('token', token)
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`
      
      setUser(userData)
      setAuthenticated(true)
    } catch (error) {
      console.error('Login error:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const register = async (userData: any) => {
    try {
      setLoading(true)
      const response = await api.post('/auth/register', userData)
      const { user: newUser, token } = response.data
      
      localStorage.setItem('token', token)
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`
      
      setUser(newUser)
      setAuthenticated(true)
    } catch (error) {
      console.error('Register error:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    delete api.defaults.headers.common['Authorization']
    setUser(null)
    setAuthenticated(false)
  }

  const refreshToken = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        setLoading(false)
        return
      }

      api.defaults.headers.common['Authorization'] = `Bearer ${token}`
      const response = await api.get('/auth/me')
      setUser(response.data.user)
      setAuthenticated(true)
    } catch (error) {
      console.error('Token refresh error:', error)
      logout()
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    refreshToken()
  }, [])

  const value: AuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    login,
    register,
    logout,
    refreshToken,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
} 