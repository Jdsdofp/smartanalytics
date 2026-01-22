// src/context/MenuContext.tsx
import { createContext, useContext, useState, type ReactNode, useEffect } from 'react'

interface MenuContextType {
  collapsed: boolean
  setCollapsed: (value: boolean) => void
  toggleCollapsed: () => void
}

const MenuContext = createContext<MenuContextType | undefined>(undefined)

export function MenuProvider({ children }: { children: ReactNode }) {
  const [collapsed, setCollapsed] = useState(() => {
    const saved = localStorage.getItem('menuCollapsed')
    return saved ? JSON.parse(saved) : false
  })

  // Salva no localStorage quando muda
  useEffect(() => {
    localStorage.setItem('menuCollapsed', JSON.stringify(collapsed))
  }, [collapsed])

  const toggleCollapsed = () => {
    setCollapsed((prev: any) => !prev)
  }

  return (
    <MenuContext.Provider value={{ collapsed, setCollapsed, toggleCollapsed }}>
      {children}
    </MenuContext.Provider>
  )
}

export function useMenu() {
  const context = useContext(MenuContext)
  if (!context) {
    throw new Error('useMenu must be used within MenuProvider')
  }
  return context
}