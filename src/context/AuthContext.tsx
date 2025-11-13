// src/context/AuthContext.tsx
import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import axios from 'axios'

interface User {
  id: string
  name: string
  email: string
  login: string
  role: string
  type: string
  active: boolean
  timeZone: string
  companyId: number
  companyName: string
  webKey: string
  language?: string
  permissions?: string[]  // ← ADICIONAR
  company?: {             // ← ADICIONAR
    components?: string[]
  }
}

interface AuthContextType {
  user: User | null
  login: (username: string, password: string) => Promise<void>
  logout: () => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// URL da sua API backend
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://apinode.smartxhub.cloud/api'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Verifica se há usuário salvo ao iniciar
  useEffect(() => {
    const savedUser = sessionStorage.getItem('user')
    const savedToken = sessionStorage.getItem('token')
    
    if (savedUser && savedToken) {
      setUser(JSON.parse(savedUser))
    }
    setIsLoading(false)
  }, [])

  const login = async (username: string, password: string) => {
    try {
      const options = {
        method: 'post',
        url: `${API_BASE_URL}/auth/login`,
        headers: {
          'Accept': '*/*',
          'Content-Type': 'application/json'
        },
        data: {
          login: username,
          password: password
        }
      }

      const response = await axios.request(options)
      
      // Verifica se o login foi bem-sucedido
      if (!response.data.success || !response.data.token) {
        throw new Error('Falha na autenticação')
      }

      const { user: userProfile, webKey, companyData, theme } = response.data

      // Extrai os dados do usuário
      const userData = {
        id: userProfile.id.toString(),
        name: userProfile.firstName && userProfile.lastName
          ? `${userProfile.firstName} ${userProfile.lastName}`.trim()
          : userProfile.userName || userProfile.login,
        email: userProfile.email,
        login: userProfile.login,
        role: userProfile.role,
        type: userProfile.type,
        active: userProfile.active,
        timeZone: userProfile.timeZone,
        companyId: userProfile.company.id,
        companyName: userProfile.company.name,
        webKey: webKey,
        language: userProfile.language,
        // ← ADICIONAR PERMISSÕES
        permissions: userProfile.permissions || [],
        // ← ADICIONAR COMPONENTES
        company: {
          components: companyData.components || []
        }
      }

      setUser(userData)
      
      // Salva os dados no sessionStorage
      sessionStorage.setItem('token', response.data.token)
      sessionStorage.setItem('user', JSON.stringify(userData))
      sessionStorage.setItem('webKey', webKey)
      sessionStorage.setItem('companyData', JSON.stringify(companyData))
      sessionStorage.setItem('theme', JSON.stringify(theme))

    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(
          error.response?.data?.message || 
          'Erro ao fazer login. Verifique suas credenciais.'
        )
      }
      throw new Error('Erro ao conectar com o servidor')
    }
  }

  const logout = () => {
    setUser(null)
    sessionStorage.removeItem('token')
    sessionStorage.removeItem('user')
    sessionStorage.removeItem('webKey')
    sessionStorage.removeItem('companyData')
    sessionStorage.removeItem('theme')
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider')
  }
  return context
}