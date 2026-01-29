import { useNavigate } from "react-router-dom"
import Layout from "../../components/layout/Layout"
import { useFavorites } from "../../context/FavoritesContext"
import { useMemo, useState } from "react"
import { filterMenuByPermissions } from "../../utils/menuPermissions"
import { menuItemsRaw } from "../../config/menuItems"
import { usePermissions } from "../../hooks/usePermissions"
import type { MenuItemProps } from "../../components/layout/Menu"

interface Dashboard {
  id: string
  title: string
  description: string
  path: string
  icon: string
  tags?: string[]
  status?: 'active' | 'beta' | 'new'
  permissionCode?: string
}
//@ts-ignore
interface CategoryColumn {
  category: string
  icon: string
  color: string
  dashboards: Dashboard[]
}

// Mapeamento de ícones do menu para emojis
const iconToEmoji: Record<string, string> = {
  'ChartBarIcon': '📊',
  'ChartPieIcon': '🥧',
  'CubeIcon': '📦',
  'UserGroupIcon': '👥',
  'BuildingOfficeIcon': '🏗️',
  'TruckIcon': '🚚',
  'ShieldCheckIcon': '📜',
  'DocumentTextIcon': '📄',
  'MapPinIcon': '📍',
  'MapIcon': '🗺️',
  'DocumentChartBarIcon': '📈',
  'TableCellsIcon': '📋',
  'ServerIcon': '🖥️',
  'ArchiveBoxIcon': '📦',
  'HomeModernIcon': '🏢',
  'AcademicCapIcon': '🎓',
  'CalendarIcon': '📅',
  'BellAlertIcon': '🔔',
  'CurrencyDollarIcon': '💰',
  'ShieldExclamationIcon': '⚠️',
  'DocumentCheckIcon': '✅',
  'ClockIcon': '🕐',
  'ChartBarSquareIcon': '📊',
}

// Ícones por categoria
const categoryIcons: Record<string, string> = {
  'Assets Analytics': '📦',
  'People Analytics': '👥',
  'Certificates Analytics': '📜',
  'Infrastructure Analytics': '🏗️',
  'Logistics Analytics': '🚚',
}

// Cores por categoria
const categoryColorMap: Record<string, string> = {
  'Assets Analytics': 'indigo',
  'People Analytics': 'cyan',
  'Certificates Analytics': 'purple',
  'Infrastructure Analytics': 'orange',
  'Logistics Analytics': 'pink',
}

export default function DashboardHubKanban() {
  const navigate = useNavigate()
  //@ts-ignore
  const { favorites, toggleFavorite } = useFavorites()
  const [hoveredCard, setHoveredCard] = useState<string | null>(null)
  const { userPermissions } = usePermissions()

  // Função recursiva para extrair dashboards por categoria
  const extractDashboardsByCategory = (
    items: MenuItemProps[], 
    parentCategory?: string,
    level: number = 0
  ): Record<string, Dashboard[]> => {
    const dashboardsByCategory: Record<string, Dashboard[]> = {}

    items.forEach(item => {
      if (item.disabled || item.hidden) return

      let category = parentCategory

      if (level === 0 && item.label.includes('Analytics')) {
        category = item.label
      }

      const hasChildren = item.children && item.children.length > 0
      const isValidDashboard = item.path && item.path !== '/' && category && !hasChildren

      if (isValidDashboard) {
        const iconName = item.icon.name || 'ChartBarIcon'
        const emoji = iconToEmoji[iconName] || '📊'
        //@ts-ignore
        if (!dashboardsByCategory[category]) {
          //@ts-ignore
          dashboardsByCategory[category] = []
        }

        // Gera tags baseadas no título
        const tags: string[] = []
        if (item.label.includes('Analytics')) tags.push('Analytics')
        if (item.label.includes('Overview')) tags.push('Overview')
        if (item.label.includes('Management')) tags.push('Management')
        if (item.label.includes('Report')) tags.push('Reports')
        if (item.label.includes('Monitoring')) tags.push('Monitoring')
        if (item.label.includes('Status')) tags.push('Status')
        if (item.label.includes('Detail')) tags.push('Details')
        //@ts-ignore
        dashboardsByCategory[category].push({
          //@ts-ignore
          id: item.path.replace('/', ''),
          title: item.label,
          description: `Análise de ${item.label.toLowerCase()}`,
          path: item.path,
          icon: emoji,
          tags: tags.length > 0 ? tags : ['Dashboard'],
          status: 'active',
          permissionCode: item.permissionCode
        })
      }

      if (item.children && item.children.length > 0) {
        const enabledChildren = item.children.filter(child => !child.disabled && !child.hidden)
        if (enabledChildren.length > 0) {
          const childDashboards = extractDashboardsByCategory(enabledChildren, category, level + 1)
          Object.keys(childDashboards).forEach(cat => {
            if (!dashboardsByCategory[cat]) {
              dashboardsByCategory[cat] = []
            }
            dashboardsByCategory[cat].push(...childDashboards[cat])
          })
        }
      }
    })

    return dashboardsByCategory
  }

  // Extrai colunas com permissões
  const columns = useMemo(() => {
    const filteredMenu = filterMenuByPermissions(menuItemsRaw, userPermissions)
    const dashboardsByCategory = extractDashboardsByCategory(filteredMenu, undefined, 0)

    return Object.keys(dashboardsByCategory)
      .filter(category => dashboardsByCategory[category].length > 0)
      .map(category => ({
        category: category.replace(' Analytics', ''),
        icon: categoryIcons[category] || '📊',
        color: categoryColorMap[category] || 'gray',
        dashboards: dashboardsByCategory[category]
      }))
      .sort((a, b) => a.category.localeCompare(b.category))
  }, [userPermissions])

  const getColorClasses = (color: string) => {
    const colorMap: Record<string, any> = {
      indigo: { bg: 'bg-indigo-500', light: 'bg-indigo-50 dark:bg-indigo-950', border: 'border-indigo-200 dark:border-indigo-800' },
      cyan: { bg: 'bg-cyan-500', light: 'bg-cyan-50 dark:bg-cyan-950', border: 'border-cyan-200 dark:border-cyan-800' },
      purple: { bg: 'bg-purple-500', light: 'bg-purple-50 dark:bg-purple-950', border: 'border-purple-200 dark:border-purple-800' },
      green: { bg: 'bg-green-500', light: 'bg-green-50 dark:bg-green-950', border: 'border-green-200 dark:border-green-800' },
      orange: { bg: 'bg-orange-500', light: 'bg-orange-50 dark:bg-orange-950', border: 'border-orange-200 dark:border-orange-800' },
      pink: { bg: 'bg-pink-500', light: 'bg-pink-50 dark:bg-pink-950', border: 'border-pink-200 dark:border-pink-800' }
    }
    return colorMap[color] || colorMap.indigo
  }

  const isFavorite = (id: string) => favorites.some(fav => fav.id === id)

  const handleToggleFavorite = (dashboard: Dashboard, category: string, e: React.MouseEvent) => {
    e.stopPropagation()
    toggleFavorite({
      //@ts-ignore
      id: dashboard.id,
      title: dashboard.title,
      path: dashboard.path,
      category: category,
      icon: dashboard.icon,
      permissionCode: dashboard.permissionCode
    })
  }

  const totalDashboards = columns.reduce((sum, col) => sum + col.dashboards.length, 0)

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
        <div className="p-6">
          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                  📌 Dashboard Hub - Kanban View
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  Visualização organizada por categorias
                </p>
              </div>
              <div className="bg-white dark:bg-gray-900 px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-800">
                <div className="text-sm text-gray-600 dark:text-gray-400">Total</div>
                <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{totalDashboards}</div>
              </div>
            </div>
          </div>

          {columns.length > 0 ? (
            /* Kanban Board */
            <div className="flex gap-4 overflow-x-auto pb-4">
              {columns.map((column) => {
                const colors = getColorClasses(column.color)
                return (
                  <div
                    key={column.category}
                    className="flex-shrink-0 w-80"
                  >
                    {/* Column Header */}
                    <div className={`${colors.bg} text-white rounded-t-lg p-4 sticky top-0 z-10`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">{column.icon}</span>
                          <h2 className="font-bold text-lg">{column.category}</h2>
                        </div>
                        <span className="bg-white/20 px-2 py-1 rounded-full text-sm font-medium">
                          {column.dashboards.length}
                        </span>
                      </div>
                    </div>

                    {/* Column Content */}
                    <div className={`${colors.light} ${colors.border} border-x border-b rounded-b-lg p-3 space-y-3 min-h-[200px]`}>
                      {column.dashboards.map((dashboard) => (
                        <div
                          key={dashboard.id}
                          onClick={() => navigate(dashboard.path)}
                          onMouseEnter={() => setHoveredCard(dashboard.id)}
                          onMouseLeave={() => setHoveredCard(null)}
                          className={`bg-white dark:bg-gray-900 rounded-lg border-2 ${
                            hoveredCard === dashboard.id 
                              ? `${colors.border} shadow-lg scale-105` 
                              : 'border-gray-200 dark:border-gray-800 shadow-sm'
                          } p-4 cursor-pointer transition-all duration-200`}
                        >
                          {/* Card Header */}
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-2 flex-1">
                              <div className="text-2xl">{dashboard.icon}</div>
                              <div className="flex-1 min-w-0">
                                <h3 className="font-bold text-gray-900 dark:text-gray-100 text-sm leading-tight">
                                  {dashboard.title}
                                </h3>
                              </div>
                            </div>
                            <button
                              onClick={(e) => handleToggleFavorite(dashboard, column.category, e)}
                              className="flex-shrink-0 ml-2"
                            >
                              <svg
                                className={`w-5 h-5 transition-all ${
                                  isFavorite(dashboard.id)
                                    ? "text-yellow-500 fill-yellow-500"
                                    : "text-gray-400 hover:text-yellow-500"
                                }`}
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                                />
                              </svg>
                            </button>
                          </div>

                          {/* Description */}
                          <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">
                            {dashboard.description}
                          </p>

                          {/* Tags */}
                          {dashboard.tags && dashboard.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mb-3">
                              {dashboard.tags.map((tag) => (
                                <span
                                  key={tag}
                                  className="px-2 py-0.5 text-xs bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-full"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}

                          {/* Footer */}
                          <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-800">
                            <span className="text-xs text-gray-500 font-mono">
                              {dashboard.id}
                            </span>
                            {dashboard.status && (
                              <span className={`text-xs px-2 py-0.5 rounded-full ${
                                dashboard.status === 'new' ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' :
                                dashboard.status === 'beta' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' :
                                'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
                              }`}>
                                {dashboard.status}
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                Nenhum dashboard disponível
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Você não tem permissão para acessar nenhum dashboard
              </p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}