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
}

interface AuthContextType {
  user: User | null
  login: (username: string, password: string) => Promise<void>
  // register: (name: string, email: string, password: string) => Promise<void>
  logout: () => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Verifica se há usuário salvo ao iniciar
  useEffect(() => {
    const savedUser = sessionStorage.getItem('user')
    const savedwebKey = sessionStorage.getItem('webKey')
    
    if (savedUser && savedwebKey) {
      setUser(JSON.parse(savedUser))
    }
    setIsLoading(false)
  }, [])

  const login = async (username: string, password: string) => {
    try {
      const options = {
        method: 'post',
        url: 'https://smartmachine.smartxhub.cloud/unified-auth',
        headers: {
          'Accept': '*/*',
          'User-Agent': 'Flashpost',
          'Content-Type': 'application/json'
        },
        data: {
          login: username,
          password: password
        }
      }

      const response = await axios.request(options)
      
      // Verifica se o login foi bem-sucedido
      if (!response.data.success || response.data.authentication.status !== 'authenticated') {
        throw new Error('Falha na autenticação')
      }

      const authData = response.data.authentication
      const companyData = response.data.company
      const profile = authData.user_profile

      // Extrai os dados do usuário
      const userData = {
        id: profile.id.toString(),
        name: profile.firstName && profile.lastName 
          ? `${profile.firstName} ${profile.lastName}`.trim() 
          : profile.userName || profile.login,
        email: profile.email,
        login: profile.login,
        role: profile.role,
        type: profile.type,
        active: profile.active,
        timeZone: profile.timeZone,
        companyId: response.data.company_id,
        companyName: companyData.details.full_name,
        webKey: authData.web_key.key
      }

      setUser(userData)
      sessionStorage.setItem('user', JSON.stringify(userData))
      sessionStorage.setItem('webKey', authData.web_key.key)
      sessionStorage.setItem('companyData', JSON.stringify(companyData))
      sessionStorage.setItem('theme', JSON.stringify(response.data.theme))
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

  // const register = async (name: string, email: string, password: string) => {
  //   // Se você tiver um endpoint de registro, implemente aqui
  //   // Por enquanto, mantendo a lógica de fallback
  //   await new Promise(resolve => setTimeout(resolve, 1000))
    
  //   throw new Error('Funcionalidade de registro não implementada. Entre em contato com o administrador.')
  // }

  const logout = () => {
    setUser(null)
    sessionStorage.removeItem('user')
    sessionStorage.removeItem('webKey')
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