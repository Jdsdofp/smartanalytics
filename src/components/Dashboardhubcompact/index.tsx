import { useNavigate } from "react-router-dom"
import { useTranslation } from "react-i18next"
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
  category: string
  icon: string
  color: string
  permissionCode?: string
  lastAccessed?: string
  accessCount?: number
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

// Cores por categoria
const categoryColors: Record<string, string> = {
  'Assets Analytics': 'bg-indigo-500',
  'People Analytics': 'bg-cyan-500',
  'Certificates Analytics': 'bg-purple-500',
  'Infrastructure Analytics': 'bg-orange-500',
  'Logistics Analytics': 'bg-pink-500',
}

export default function DashboardHubCompact() {
  const navigate = useNavigate()
  //@ts-ignore
  const { t } = useTranslation()
  //@ts-ignore
  const { favorites, toggleFavorite } = useFavorites()
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const { userPermissions } = usePermissions()

  // Função recursiva para extrair todos os dashboards da árvore do menu
  const extractDashboards = (
    items: MenuItemProps[], 
    parentCategory?: string,
    level: number = 0
  ): Dashboard[] => {
    const dashboards: Dashboard[] = []

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
        
        // Simula dados de acesso (você pode buscar do backend depois)
        const accessCount = Math.floor(Math.random() * 100)
        
        dashboards.push({
          //@ts-ignore
          id: item.path.replace('/', ''),
          title: item.label,
          description: `Análise de ${item.label.toLowerCase()}`,
          //@ts-ignore
          path: item.path,
          //@ts-ignore
          category: category,
          icon: emoji,
          //@ts-ignore
          color: categoryColors[category] || 'bg-gray-500',
          permissionCode: item.permissionCode,
          accessCount: accessCount,
          lastAccessed: new Date().toISOString().split('T')[0]
        })
      }

      if (item.children && item.children.length > 0) {
        const enabledChildren = item.children.filter(child => !child.disabled && !child.hidden)
        if (enabledChildren.length > 0) {
          dashboards.push(...extractDashboards(enabledChildren, category, level + 1))
        }
      }
    })

    return dashboards
  }

  // Extrai dashboards com permissões
  const allDashboards = useMemo(() => {
    const filteredMenu = filterMenuByPermissions(menuItemsRaw, userPermissions)
    return extractDashboards(filteredMenu, undefined, 0)
  }, [userPermissions])

  // Extrai categorias únicas
  const categories = useMemo(() => {
    const uniqueCategories = new Set(allDashboards.map(d => d.category))
    return ['all', ...Array.from(uniqueCategories).map(cat => cat.replace(' Analytics', ''))]
  }, [allDashboards])

  const filteredDashboards = allDashboards.filter(
    d => selectedCategory === "all" || d.category.includes(selectedCategory)
  )

  const mostAccessed = useMemo(() => {
    return [...allDashboards]
      .sort((a, b) => (b.accessCount || 0) - (a.accessCount || 0))
      .slice(0, 5)
  }, [allDashboards])

  const isFavorite = (id: string) => favorites.some(fav => fav.id === id)

  const handleToggleFavorite = (dashboard: Dashboard, e: React.MouseEvent) => {
    e.stopPropagation()
    toggleFavorite({
      //@ts-ignore
      id: dashboard.id,
      title: dashboard.title,
      path: dashboard.path,
      category: dashboard.category,
      icon: dashboard.icon,
      permissionCode: dashboard.permissionCode
    })
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
        <div className="container mx-auto p-6">
          {/* Header com Stats */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-6">
            <div className="lg:col-span-3 gradient-company p-6 rounded-lg text-white">
              <h1 className="text-3xl font-bold mb-2">📊 Dashboard Hub - Compact View</h1>
              <p className="text-white/90">Central unificada de dashboards e análises</p>
            </div>
            <div className="bg-white dark:bg-gray-900 p-6 rounded-lg border border-gray-200 dark:border-gray-800 flex flex-col justify-center">
              <div className="text-4xl font-bold text-gray-900 dark:text-gray-100">{allDashboards.length}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Dashboards disponíveis</div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Sidebar */}
            <div className="lg:col-span-1 space-y-4">
              {/* View Mode Toggle */}
              <div className="bg-white dark:bg-gray-900 p-4 rounded-lg border border-gray-200 dark:border-gray-800">
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">Visualização</h3>
                <div className="flex gap-2">
                  <button
                    onClick={() => setViewMode("grid")}
                    className={`flex-1 py-2 px-3 rounded-lg transition-all ${
                      viewMode === "grid"
                        ? "bg-blue-500 text-white"
                        : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
                    }`}
                  >
                    <svg className="w-4 h-4 mx-auto" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M4 4h7v7H4V4zm0 9h7v7H4v-7zm9-9h7v7h-7V4zm0 9h7v7h-7v-7z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => setViewMode("list")}
                    className={`flex-1 py-2 px-3 rounded-lg transition-all ${
                      viewMode === "list"
                        ? "bg-blue-500 text-white"
                        : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
                    }`}
                  >
                    <svg className="w-4 h-4 mx-auto" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M4 6h16v2H4V6zm0 5h16v2H4v-2zm0 5h16v2H4v-2z" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Category Filter */}
              <div className="bg-white dark:bg-gray-900 p-4 rounded-lg border border-gray-200 dark:border-gray-800">
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">Categorias</h3>
                <div className="space-y-2">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`w-full text-left py-2 px-3 rounded-lg transition-all ${
                        selectedCategory === cat
                          ? "bg-blue-500 text-white font-medium"
                          : "bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                      }`}
                    >
                      {cat === "all" ? "🌐 Todos" : cat}
                      <span className="float-right text-xs opacity-75">
                        ({allDashboards.filter(d => cat === "all" || d.category.includes(cat)).length})
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Most Accessed */}
              <div className="bg-white dark:bg-gray-900 p-4 rounded-lg border border-gray-200 dark:border-gray-800">
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
                  🔥 Mais Acessados
                </h3>
                <div className="space-y-2">
                  {mostAccessed.map((dash, idx) => (
                    <div
                      key={dash.id}
                      onClick={() => navigate(dash.path)}
                      className="flex items-center gap-2 p-2 rounded-lg bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer transition-all"
                    >
                      <div className="text-lg font-bold text-gray-400 w-6">{idx + 1}</div>
                      <div className="text-xl">{dash.icon}</div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-medium text-gray-900 dark:text-gray-100 truncate">
                          {dash.title}
                        </div>
                        <div className="text-xs text-gray-500">{dash.accessCount} acessos</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3">
              {viewMode === "grid" ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {filteredDashboards.map((dashboard) => (
                    <div
                      key={dashboard.id}
                      onClick={() => navigate(dashboard.path)}
                      className="group relative bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-lg transition-all cursor-pointer hover:scale-105"
                    >
                      <button
                        onClick={(e) => handleToggleFavorite(dashboard, e)}
                        className="absolute top-2 right-2 z-10 p-1.5 rounded-lg bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm"
                      >
                        <svg
                          className={`w-4 h-4 ${
                            isFavorite(dashboard.id)
                              ? "text-yellow-500 fill-yellow-500"
                              : "text-gray-400"
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

                      <div className="p-4">
                        <div className={`${dashboard.color} w-12 h-12 rounded-lg flex items-center justify-center text-2xl mb-3`}>
                          {dashboard.icon}
                        </div>
                        <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-1">{dashboard.title}</h3>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">{dashboard.description}</p>
                        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-500">
                          <span className="font-mono">{dashboard.id}</span>
                          <span>{dashboard.accessCount} acessos</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredDashboards.map((dashboard) => (
                    <div
                      key={dashboard.id}
                      onClick={() => navigate(dashboard.path)}
                      className="group flex items-center gap-4 p-4 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 hover:shadow-md transition-all cursor-pointer"
                    >
                      <div className={`${dashboard.color} w-12 h-12 rounded-lg flex items-center justify-center text-2xl flex-shrink-0`}>
                        {dashboard.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-gray-900 dark:text-gray-100">{dashboard.title}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{dashboard.description}</p>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span className="font-mono">{dashboard.id}</span>
                        <span>{dashboard.accessCount} acessos</span>
                        <button
                          onClick={(e) => handleToggleFavorite(dashboard, e)}
                          className="p-2"
                        >
                          <svg
                            className={`w-5 h-5 ${
                              isFavorite(dashboard.id)
                                ? "text-yellow-500 fill-yellow-500"
                                : "text-gray-400"
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
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}