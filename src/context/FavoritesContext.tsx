// src/context/FavoritesContext.tsx
import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import { useAuth } from './AuthContext'
import { usePermissions } from '../hooks/usePermissions'

interface Favorite {
  id: string
  title: string
  path: string
  icon: string
  category: string
  userId?: string        // ← ID do usuário que favoritou
  companyId?: number     // ← ID da empresa
  permissionCode?: string // ← Permissão necessária
  addedAt?: number       // ← Timestamp de quando foi adicionado
}

interface FavoritesContextType {
  favorites: Favorite[]
  addFavorite: (favorite: Omit<Favorite, 'id' | 'userId' | 'companyId' | 'addedAt'>) => void
  removeFavorite: (id: string) => void
  toggleFavorite: (favorite: Omit<Favorite, 'id' | 'userId' | 'companyId' | 'addedAt'>) => void
  isFavorite: (path: string) => boolean
  clearInvalidFavorites: () => void
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined)

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const { hasPermission } = usePermissions()
  const [favorites, setFavorites] = useState<Favorite[]>([])

  // Função para validar se um favorito é válido para o usuário atual
  const isValidFavorite = (favorite: Favorite): boolean => {
    if (!user) return false

    // Verifica se o favorito pertence ao usuário atual
    const belongsToCurrentUser = favorite.userId === user.id

    // Verifica se o favorito pertence à mesma empresa
    const belongsToCurrentCompany = favorite.companyId === user.companyId

    // Verifica se o usuário tem a permissão necessária (se houver)
    const hasRequiredPermission = favorite.permissionCode 
      ? hasPermission(favorite.permissionCode)
      : true

    return belongsToCurrentUser && belongsToCurrentCompany && hasRequiredPermission
  }

  // Função para limpar favoritos inválidos
  const clearInvalidFavorites = () => {
    if (!user) {
      setFavorites([])
      return
    }

    const validFavorites = favorites.filter(isValidFavorite)
    
    // Se houve remoção de favoritos inválidos, atualiza
    if (validFavorites.length !== favorites.length) {
      console.log(
        `🧹 Removidos ${favorites.length - validFavorites.length} favoritos inválidos`
      )
      setFavorites(validFavorites)
    }
  }

  // Carregar favoritos do localStorage quando o usuário mudar
  useEffect(() => {
    if (!user?.id) {
      setFavorites([])
      return
    }

    // Chave específica para usuário + empresa
    const storageKey = `favorites_${user.id}_${user.companyId}`
    const stored = localStorage.getItem(storageKey)
    
    if (stored) {
      try {
        const parsedFavorites = JSON.parse(stored) as Favorite[]
        
        // Valida todos os favoritos carregados
        const validFavorites = parsedFavorites.filter(isValidFavorite)
        
        if (validFavorites.length !== parsedFavorites.length) {
          console.log(
            `🧹 Carregados ${validFavorites.length} favoritos válidos de ${parsedFavorites.length} totais`
          )
        }
        
        setFavorites(validFavorites)
      } catch (error) {
        console.error('Erro ao carregar favoritos:', error)
        setFavorites([])
      }
    } else {
      setFavorites([])
    }
  }, [user?.id, user?.companyId])

  // Salvar favoritos no localStorage sempre que mudar
  useEffect(() => {
    if (!user?.id) return

    const storageKey = `favorites_${user.id}_${user.companyId}`
    
    if (favorites.length > 0) {
      localStorage.setItem(storageKey, JSON.stringify(favorites))
    } else {
      localStorage.removeItem(storageKey)
    }
  }, [favorites, user?.id, user?.companyId])

  // Limpar favoritos de outros usuários quando trocar de conta
  useEffect(() => {
    if (!user?.id) return

    // Remove favoritos de outros usuários do localStorage
    const currentKey = `favorites_${user.id}_${user.companyId}`
    const allKeys = Object.keys(localStorage)
    
    allKeys.forEach(key => {
      if (key.startsWith('favorites_') && key !== currentKey) {
        // Opcional: você pode comentar esta linha se quiser manter os favoritos de outros usuários
        // localStorage.removeItem(key)
      }
    })
  }, [user?.id, user?.companyId])

  const addFavorite = (favorite: Omit<Favorite, 'id' | 'userId' | 'companyId' | 'addedAt'>) => {
    if (!user) return

    const newFavorite: Favorite = {
      ...favorite,
      id: `fav_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId: user.id,
      companyId: user.companyId,
      addedAt: Date.now()
    }

    setFavorites(prev => [...prev, newFavorite])
  }

  const removeFavorite = (id: string) => {
    setFavorites(prev => prev.filter(fav => fav.id !== id))
  }

  const toggleFavorite = (favorite: Omit<Favorite, 'id' | 'userId' | 'companyId' | 'addedAt'>) => {
    const existing = favorites.find(fav => fav.path === favorite.path)
    
    if (existing) {
      removeFavorite(existing.id)
    } else {
      addFavorite(favorite)
    }
  }

  const isFavorite = (path: string) => {
    return favorites.some(fav => fav.path === path && isValidFavorite(fav))
  }

  return (
    <FavoritesContext.Provider value={{ 
      favorites, 
      addFavorite, 
      removeFavorite, 
      toggleFavorite,
      isFavorite,
      clearInvalidFavorites
    }}>
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