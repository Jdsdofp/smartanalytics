// import type { MenuItemProps } from '../components/layout/Menu'

// interface FilterResult {
//   item: MenuItemProps
//   hasVisibleChildren: boolean
//   hasPermission: boolean
// }

// /**
//  * Filtra menu baseado APENAS nas permissions retornadas pela API
//  * Compara permissionCode com os códigos retornados
//  * 
//  * Lógica:
//  * - Itens FOLHA (sem children): visível apenas se tem permissionCode e usuário tem permissão
//  * - Itens PAI (com children): visível se tem permissão direta OU tem filhos visíveis
//  * - Itens AVÓ (categorias): visível apenas se tem filhos visíveis
//  */
// export const filterMenuByPermissions = (
//   items: MenuItemProps[],
//   userPermissions: Set<string>
// ): MenuItemProps[] => {
  
//   const hasPermission = (code?: string): boolean => {
//     if (!code) return true // Se não tem código, libera (permissão aberta)
//     return userPermissions.has(code)
//   }

//   const processItem = (item: MenuItemProps): FilterResult => {
//     // Se o item já está marcado como hidden, não processa
//     if (item.hidden === true) {
//       return {
//         item,
//         hasVisibleChildren: false,
//         hasPermission: false
//       }
//     }

//     // 1. Verifica se o item tem permissão direta
//     const itemHasPermission = hasPermission(item.permissionCode)

//     // 2. Se tem filhos, processa recursivamente
//     if (item.children && item.children.length > 0) {
//       const processedChildren = item.children.map(child => processItem(child))

//       // 3. Filtra apenas filhos visíveis (que têm permissão OU filhos visíveis)
//       const visibleChildren = processedChildren
//         .filter(result => result.hasPermission || result.hasVisibleChildren)
//         .map(result => result.item)

//       // 4. Tem filhos visíveis?
//       const hasVisibleChildren = visibleChildren.length > 0

//       // 5. Pai é visível se:
//       //    - Tem permissão direta OU
//       //    - Tem pelo menos um filho visível
//       const shouldBeVisible = itemHasPermission || hasVisibleChildren

//       return {
//         item: {
//           ...item,
//           children: visibleChildren,
//           hidden: !shouldBeVisible
//         },
//         hasVisibleChildren,
//         hasPermission: itemHasPermission
//       }
//     }

//     // 6. Item folha (opção final) - só visível se tem permissão
//     // Se não tem permissionCode definido, considera como tendo permissão
//     const shouldBeVisible = itemHasPermission

//     return {
//       item: {
//         ...item,
//         hidden: !shouldBeVisible
//       },
//       hasVisibleChildren: false,
//       hasPermission: itemHasPermission
//     }
//   }

//   // Processa todos os itens do primeiro nível
//   return items
//     .map(item => processItem(item))
//     .filter(result => result.hasPermission || result.hasVisibleChildren)
//     .map(result => result.item)
// }


import type { MenuItemProps } from '../components/layout/Menu'

interface FilterResult {
  item: MenuItemProps
  hasVisibleChildren: boolean
  hasPermission: boolean
}

/**
 * Filtra menu baseado APENAS nas permissions retornadas pela API
 * Lógica mais rigorosa: 
 * - Itens FOLHA: visível apenas se tem permissionCode E usuário tem permissão
 * - Itens PAI/AVÔ: visível apenas se tem permissionCode E usuário tem permissão E tem filhos visíveis
 * - Se não tem permissionCode, considera como permissão aberta
 */
export const filterMenuByPermissions = (
  items: MenuItemProps[],
  userPermissions: Set<string>
): MenuItemProps[] => {
  
  const hasPermission = (code?: string): boolean => {
    if (!code) return true // Se não tem código, libera (permissão aberta)
    return userPermissions.has(code)
  }

  const processItem = (item: MenuItemProps): FilterResult => {
    // Se o item já está marcado como hidden, não processa
    if (item.hidden === true) {
      return {
        item,
        hasVisibleChildren: false,
        hasPermission: false
      }
    }

    // Verifica se o item tem permissão direta
    const itemHasPermission = hasPermission(item.permissionCode)

    // Se tem filhos, processa recursivamente
    if (item.children && item.children.length > 0) {
      const processedChildren = item.children.map(child => processItem(child))
      
      // Filtra apenas filhos visíveis
      const visibleChildren = processedChildren
        .filter(result => result.hasPermission || result.hasVisibleChildren)
        .map(result => result.item)

      const hasVisibleChildren = visibleChildren.length > 0

      // NOVA LÓGICA: Item pai/avô só é visível se:
      // 1. Tem permissão direta (se tiver permissionCode) E
      // 2. Tem pelo menos um filho visível
      let shouldBeVisible = hasVisibleChildren
      
      // Se o item tem um permissionCode específico, requer permissão
      if (item.permissionCode) {
        shouldBeVisible = itemHasPermission && hasVisibleChildren
      }

      return {
        item: {
          ...item,
          children: visibleChildren,
          hidden: !shouldBeVisible
        },
        hasVisibleChildren,
        hasPermission: itemHasPermission && hasVisibleChildren
      }
    }

    // Item folha - só visível se tem permissão
    // Se não tem permissionCode definido, considera como tendo permissão
    const shouldBeVisible = itemHasPermission

    return {
      item: {
        ...item,
        hidden: !shouldBeVisible
      },
      hasVisibleChildren: false,
      hasPermission: itemHasPermission
    }
  }

  // Processa todos os itens do primeiro nível
  return items
    .map(item => processItem(item))
    .filter(result => !result.item.hidden)
    .map(result => result.item)
}