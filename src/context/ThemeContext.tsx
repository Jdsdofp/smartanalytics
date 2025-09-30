import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'

interface ThemeContextType {
  darkMode: boolean
  toggleDarkMode: () => void
  setTheme: (isDark: boolean) => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

interface ThemeProviderProps {
  children: ReactNode
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
    <ThemeContext.Provider value={{ darkMode, toggleDarkMode, setTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme deve ser usado dentro de um ThemeProvider')
  }
  return context
}