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

// Ícones por categoria
const categoryIcons: Record<string, string> = {
  'Assets Analytics': '📦',
  'People Analytics': '👥',
  'Certificates Analytics': '📜',
  'Infrastructure Analytics': '🏗️',
  'Logistics Analytics': '🚚',
}

export default function DashboardHub() {
  const navigate = useNavigate()
  //@ts-ignore
  const { t } = useTranslation()
  //@ts-ignore
  const { favorites, toggleFavorite } = useFavorites()
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [searchTerm, setSearchTerm] = useState("")
  const { userPermissions } = usePermissions()

  // Função recursiva para extrair todos os dashboards da árvore do menu
  const extractDashboards = (
    items: MenuItemProps[], 
    parentCategory?: string,
    level: number = 0
  ): Dashboard[] => {
    const dashboards: Dashboard[] = []

    items.forEach(item => {
      // IMPORTANTE: Pula itens disabled ou hidden
      if (item.disabled || item.hidden) {
        return
      }

      let category = parentCategory

      // Se estamos no nível 0 e o item contém "Analytics", ele É a categoria
      if (level === 0 && item.label.includes('Analytics')) {
        category = item.label
      }

      // IMPORTANTE: Só adiciona se o item NÃO TEM FILHOS (é um dashboard final)
      // E tem path válido e uma categoria definida
      const hasChildren = item.children && item.children.length > 0
      const isValidDashboard = item.path && item.path !== '/' && category && !hasChildren

      if (isValidDashboard) {
        const iconName = item.icon.name || 'ChartBarIcon'
        const emoji = iconToEmoji[iconName] || '📊'
        
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
          permissionCode: item.permissionCode
        })
      }

      // Processa recursivamente os filhos
      if (item.children && item.children.length > 0) {
        //@ts-ignore
        const enabledChildren = item.children.filter(child => !child.disabled && !child.hidden)
        if (enabledChildren.length > 0) {
          dashboards.push(...extractDashboards(enabledChildren, category, level + 1))
        }
      }
    })

    return dashboards
  }

  // Filtra o menu com base nas permissões e extrai os dashboards
  const allDashboards = useMemo(() => {
    const filteredMenu = filterMenuByPermissions(menuItemsRaw, userPermissions)
    const dashboards = extractDashboards(filteredMenu, undefined, 0)
    
    console.log('📊 Total de dashboards (apenas finais):', dashboards.length)
    console.log('📊 Dashboards:', dashboards.map(d => `${d.title} (${d.path})`))
    
    return dashboards
  }, [userPermissions])

  // Extrai categorias únicas APENAS dos dashboards que foram extraídos
  const categories = useMemo(() => {
    const uniqueCategories = new Set(allDashboards.map(d => d.category))
    
    const categoryList = Array.from(uniqueCategories)
      .map(cat => {
        const count = allDashboards.filter(d => d.category === cat).length
        return {
          id: cat,
          name: cat.replace(' Analytics', ''),
          icon: categoryIcons[cat] || '📊',
          count: count
        }
      })
      .filter(cat => cat.count > 0)
      .sort((a, b) => a.name.localeCompare(b.name))

    return [
      { id: "all", name: "Todos", icon: "🌐", count: allDashboards.length },
      ...categoryList
    ]
  }, [allDashboards])

  const filteredDashboards = allDashboards.filter(dashboard => {
    const matchesCategory = selectedCategory === "all" || dashboard.category === selectedCategory
    const matchesSearch = dashboard.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         dashboard.description.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesCategory && matchesSearch
  })

  const isFavorite = (dashboardId: string) => {
    return favorites.some(fav => fav.id === dashboardId)
  }

  const handleToggleFavorite = (dashboard: Dashboard, e: React.MouseEvent) => {
    e.stopPropagation()
    toggleFavorite({
      //@ts-ignore
      id: dashboard.id,
      title: dashboard.title,
      path: dashboard.path,
      category: dashboard.category,
      icon: dashboard.icon
    })
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
        <div className="container mx-auto p-6">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                  📊 Dashboard Hub
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  Central de todos os dashboards e análises do sistema
                </p>
              </div>
              <div className="flex items-center gap-4">
                <div className="px-4 py-2 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Total:</span>
                  <span className="ml-2 text-xl font-bold text-gray-900 dark:text-gray-100">
                    {allDashboards.length}
                  </span>
                </div>
              </div>
            </div>

            {/* Search Bar */}
            <div className="relative mb-6">
              <input
                type="text"
                placeholder="Buscar dashboards..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-3 pl-12 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-gray-100"
              />
              <svg
                className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>

            {/* Category Filters */}
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    selectedCategory === category.id
                      ? "bg-blue-500 text-white shadow-lg scale-105"
                      : "bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-800 hover:shadow-md"
                  }`}
                >
                  <span className="mr-2">{category.icon}</span>
                  {category.name}
                  <span className="ml-2 text-xs opacity-75">
                    ({category.count})
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Dashboards Grid */}
          {filteredDashboards.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredDashboards.map((dashboard) => (
                <div
                  key={dashboard.id}
                  className="group relative bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer hover:scale-105"
                  onClick={() => navigate(dashboard.path)}
                >
                  {/* Favorite Button */}
                  <button
                    onClick={(e) => handleToggleFavorite(dashboard, e)}
                    className="absolute top-4 right-4 z-10 p-2 rounded-lg bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm hover:bg-white dark:hover:bg-gray-800 transition-all"
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

                  {/* Icon Header */}
                  <div className={`${dashboard.color} p-6 rounded-t-xl`}>
                    <div className="text-5xl mb-2">{dashboard.icon}</div>
                    <div className="text-xs text-white/80 uppercase tracking-wider">
                      {dashboard.category.replace(' Analytics', '')}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2">
                      {dashboard.title}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                      {dashboard.description}
                    </p>

                    {/* Footer */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-800">
                      <span className="text-xs text-gray-500 dark:text-gray-500 font-mono">
                        {dashboard.id}
                      </span>
                      <svg
                        className="w-5 h-5 text-gray-400 group-hover:text-blue-500 transition-colors"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13 7l5 5m0 0l-5 5m5-5H6"
                        />
                      </svg>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                Nenhum dashboard encontrado
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Tente ajustar os filtros ou termo de busca
              </p>
            </div>
          )}

          {/* Quick Stats */}
          {categories.length > 1 && (
            <div className={`mt-8 grid gap-4 ${
              categories.length === 2 ? 'grid-cols-1' :
              categories.length === 3 ? 'grid-cols-2' :
              categories.length === 4 ? 'grid-cols-2 md:grid-cols-3' :
              categories.length === 5 ? 'grid-cols-2 md:grid-cols-4' :
              categories.length === 6 ? 'grid-cols-2 md:grid-cols-3 lg:grid-cols-5' :
              'grid-cols-2 md:grid-cols-3 lg:grid-cols-6'
            }`}>
              {categories.slice(1).map((category) => (
                <div
                  key={category.id}
                  className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-4 text-center cursor-pointer hover:shadow-lg transition-all hover:scale-105"
                  onClick={() => setSelectedCategory(category.id)}
                >
                  <div className="text-3xl mb-2">{category.icon}</div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {category.count}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                    {category.name}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}