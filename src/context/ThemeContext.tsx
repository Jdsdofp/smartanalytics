// src/context/ThemeContext.tsx
import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'

interface ThemeContextType {
  darkMode: boolean
  toggleDarkMode: () => void
  setTheme: (isDark: boolean) => void
  applyCompanyColors: (colors: any) => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

interface ThemeProviderProps {
  children: ReactNode
}

// Função auxiliar para verificar se a cor é branca ou muito clara
const isWhiteOrVeryLight = (color: string): boolean => {
  if (!color) return false
  
  const hex = color.replace('#', '')
  const r = parseInt(hex.substring(0, 2), 16)
  const g = parseInt(hex.substring(2, 4), 16)
  const b = parseInt(hex.substring(4, 6), 16)
  
  // Considera branco se todos os valores RGB forem >= 250
  return r >= 250 && g >= 250 && b >= 250
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [darkMode, setDarkMode] = useState(false)

  useEffect(() => {
    const savedTheme = localStorage.getItem('darkMode')
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    const isDark = savedTheme ? savedTheme === 'true' : prefersDark
    setDarkMode(isDark)
    updateTheme(isDark)
  }, [])

  const updateTheme = (isDark: boolean) => {
    const htmlElement = document.documentElement
    if (isDark) {
      htmlElement.classList.add('dark')
    } else {
      htmlElement.classList.remove('dark')
    }
  }

  const applyCompanyColors = (cssVariables: Record<string, string>) => {
    const root = document.documentElement
    
    // Verifica se a cor primária é branca
    const primaryColor = cssVariables['--color-primary']
    const fontTitleColor = cssVariables['--color-font-title']
    
    if (isWhiteOrVeryLight(primaryColor) && fontTitleColor) {
      // Se primary for branca, usa a cor do título como primária
      root.style.setProperty('--color-primary', fontTitleColor)
      
      // Ajusta a cor primary-dark para uma versão mais escura do título
      const darkened = darkenColor(fontTitleColor, 20)
      root.style.setProperty('--color-primary-dark', darkened)
      
      // Aplica as outras variáveis normalmente
      Object.entries(cssVariables).forEach(([key, value]) => {
        if (key !== '--color-primary' && key !== '--color-primary-dark' && value) {
          root.style.setProperty(key, value)
        }
      })
    } else {
      // Aplica normalmente se não for branca
      Object.entries(cssVariables).forEach(([key, value]) => {
        if (value) {
          root.style.setProperty(key, value)
        }
      })
    }
  }

  const toggleDarkMode = () => {
    const newMode = !darkMode
    setDarkMode(newMode)
    localStorage.setItem('darkMode', String(newMode))
    updateTheme(newMode)
  }

  const setTheme = (isDark: boolean) => {
    setDarkMode(isDark)
    localStorage.setItem('darkMode', String(isDark))
    updateTheme(isDark)
  }

  return (
    <ThemeContext.Provider value={{ darkMode, toggleDarkMode, setTheme, applyCompanyColors }}>
      {children}
    </ThemeContext.Provider>
  )
}

// Função auxiliar para escurecer uma cor
function darkenColor(color: string, percent: number): string {
  const hex = color.replace('#', '')
  const r = Math.max(0, parseInt(hex.substring(0, 2), 16) - (255 * percent / 100))
  const g = Math.max(0, parseInt(hex.substring(2, 4), 16) - (255 * percent / 100))
  const b = Math.max(0, parseInt(hex.substring(4, 6), 16) - (255 * percent / 100))
  
  return `#${Math.round(r).toString(16).padStart(2, '0')}${Math.round(g).toString(16).padStart(2, '0')}${Math.round(b).toString(16).padStart(2, '0')}`
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme deve ser usado dentro de um ThemeProvider')
  }
  return context
}