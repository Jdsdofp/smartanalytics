import { useMemo } from 'react'
import { useAuth } from '../context/AuthContext'

export const usePermissions = () => {
  const { user } = useAuth()

  // Set de permissões do usuário para lookup O(1)
  const userPermissions = useMemo(() => {
    if (!user?.permissions || !Array.isArray(user.permissions)) {
      return new Set<string>()
    }
    return new Set(user.permissions)
  }, [user?.permissions])

  /**
   * Verifica se o usuário tem a permissão específica
   * Se não há código de permissão, libera automaticamente
   */
  const hasPermission = (permissionCode?: string): boolean => {
    if (!permissionCode) return true
    return userPermissions.has(permissionCode)
  }

  return {
    userPermissions,
    hasPermission
  }
}