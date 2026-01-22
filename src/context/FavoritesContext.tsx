// src/context/FavoritesContext.tsx
import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import { useAuth } from './AuthContext'

interface Favorite {
  id: string
  title: string
  path: string
  icon: string
  category: string
}

interface FavoritesContextType {
  favorites: Favorite[]
  addFavorite: (favorite: Omit<Favorite, 'id'>) => void
  removeFavorite: (id: string) => void
  isFavorite: (path: string) => boolean
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined)

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [favorites, setFavorites] = useState<Favorite[]>([])

  // Carregar favoritos do localStorage quando o componente monta
  useEffect(() => {
    if (user?.id) {
      const stored = localStorage.getItem(`favorites_${user.id}`)
      if (stored) {
        setFavorites(JSON.parse(stored))
      }
    }
  }, [user?.id])

  // Salvar favoritos no localStorage sempre que mudar
  useEffect(() => {
    if (user?.id) {
      localStorage.setItem(`favorites_${user.id}`, JSON.stringify(favorites))
    }
  }, [favorites, user?.id])

  const addFavorite = (favorite: Omit<Favorite, 'id'>) => {
    const newFavorite = {
      ...favorite,
      id: `fav_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    }
    setFavorites(prev => [...prev, newFavorite])
  }

  const removeFavorite = (id: string) => {
    setFavorites(prev => prev.filter(fav => fav.id !== id))
  }

  const isFavorite = (path: string) => {
    return favorites.some(fav => fav.path === path)
  }

  return (
    <FavoritesContext.Provider value={{ favorites, addFavorite, removeFavorite, isFavorite }}>
      {children}
    </FavoritesContext.Provider>
  )
}

export function useFavorites() {
  const context = useContext(FavoritesContext)
  if (!context) {
    throw new Error('useFavorites must be used within FavoritesProvider')
  }
  return context
}