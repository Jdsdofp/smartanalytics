// src/context/AuthContext.tsx
import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'

interface User {
  id: string
  name: string
  email: string
}

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string) => Promise<void>
  logout: () => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Verifica se há usuário salvo no localStorage ao iniciar
  useEffect(() => {
    const savedUser = localStorage.getItem('user')
    if (savedUser) {
      setUser(JSON.parse(savedUser))
    }
    setIsLoading(false)
  }, [])

  const login = async (email: string, password: string) => {
    // Simula uma chamada à API
    // Substitua isso pela sua chamada real à API
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Validação básica (substitua pela validação real)
    const users = JSON.parse(localStorage.getItem('users') || '[]')
    const foundUser = users.find((u: any) => u.email === email && u.password === password)
    
    if (!foundUser) {
      throw new Error('Email ou senha incorretos')
    }

    const userData = {
      id: foundUser.id,
      name: foundUser.name,
      email: foundUser.email
    }
    
    setUser(userData)
    localStorage.setItem('user', JSON.stringify(userData))
  }

  const register = async (name: string, email: string, password: string) => {
    // Simula uma chamada à API
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Validação básica
    const users = JSON.parse(localStorage.getItem('users') || '[]')
    
    if (users.some((u: any) => u.email === email)) {
      throw new Error('Email já cadastrado')
    }

    const newUser = {
      id: Date.now().toString(),
      name,
      email,
      password // Em produção, NUNCA salve senhas sem criptografia!
    }
    
    users.push(newUser)
    localStorage.setItem('users', JSON.stringify(users))
    
    const userData = {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email
    }
    
    setUser(userData)
    localStorage.setItem('user', JSON.stringify(userData))
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('user')
  }

  return (
    <AuthContext.Provider value={{ user, login, register, logout, isLoading }}>
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