import { useNavigate } from "react-router-dom"
import { useTranslation } from "react-i18next"
import Layout from "../../components/layout/Layout"
import { useFavorites } from "../../context/FavoritesContext"
import { useState } from "react"

interface Dashboard {
  id: string
  title: string
  description: string
  path: string
  category: string
  icon: string
  color: string
  stats?: {
    label: string
    value: string | number
  }[]
}

export default function DashboardHub() {
  const navigate = useNavigate()
  //@ts-ignore
  const { t } = useTranslation()
  //@ts-ignore
  const { favorites, toggleFavorite } = useFavorites()
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [searchTerm, setSearchTerm] = useState("")

  const dashboards: Dashboard[] = [
    // Analytics - Assets
    {
      id: "MN0400_011",
      title: "Assets Overview",
      description: "Visão geral de todos os ativos",
      path: "/MN0400_011",
      category: "Assets",
      icon: "📦",
      color: "bg-indigo-500"
    },
    {
      id: "MN0400_012",
      title: "Assets Management",
      description: "Gerenciamento detalhado de ativos",
      path: "/MN0400_012",
      category: "Assets",
      icon: "🏷️",
      color: "bg-indigo-600"
    },
    {
      id: "MN0400_013",
      title: "Assets Analytics",
      description: "Análise avançada de ativos",
      path: "/MN0400_013",
      category: "Assets",
      icon: "📊",
      color: "bg-indigo-700"
    },

    // Analytics - People
    {
      id: "MN0400_111",
      title: "People Analytics",
      description: "Análise de pessoas e equipes",
      path: "/MN0400_111",
      category: "People",
      icon: "👥",
      color: "bg-cyan-500"
    },

    // Analytics - Certificates
    {
      id: "MN0400_511",
      title: "Certificate Status Overview",
      description: "Visão geral do status dos certificados",
      path: "/MN0400_511",
      category: "Certificates",
      icon: "📜",
      color: "bg-purple-500"
    },
    {
      id: "MN0400_412",
      title: "Certificate Details",
      description: "Detalhes e análise de certificados",
      path: "/MN0400_412",
      category: "Certificates",
      icon: "🔍",
      color: "bg-purple-600"
    },
    {
      id: "MN0400_413",
      title: "Certificate Reports",
      description: "Relatórios de certificados",
      path: "/MN0400_413",
      category: "Certificates",
      icon: "📋",
      color: "bg-purple-700"
    },

    // Analytics - Locations
    {
      id: "MN0400_312",
      title: "Locations Analytics",
      description: "Análise de localização e GPS",
      path: "/MN0400_312",
      category: "Locations",
      icon: "📍",
      color: "bg-green-500"
    },

    // Analytics - Infrastructure
    {
      id: "MN0400_131",
      title: "Infrastructure Overview",
      description: "Visão geral da infraestrutura",
      path: "/MN0400_131",
      category: "Infrastructure",
      icon: "🏗️",
      color: "bg-orange-500"
    },
    {
      id: "MN0400_132",
      title: "Infrastructure Monitoring",
      description: "Monitoramento de infraestrutura",
      path: "/MN0400_132",
      category: "Infrastructure",
      icon: "📡",
      color: "bg-orange-600"
    },
    {
      id: "MN0400_133",
      title: "Infrastructure Analytics",
      description: "Análise de infraestrutura",
      path: "/MN0400_133",
      category: "Infrastructure",
      icon: "📈",
      color: "bg-orange-700"
    },
    {
      id: "MN0400_134",
      title: "Infrastructure Reports",
      description: "Relatórios de infraestrutura",
      path: "/MN0400_134",
      category: "Infrastructure",
      icon: "📊",
      color: "bg-orange-800"
    },
    {
      id: "MN0400_135",
      title: "Infrastructure Management",
      description: "Gerenciamento de infraestrutura",
      path: "/MN0400_135",
      category: "Infrastructure",
      icon: "⚙️",
      color: "bg-orange-900"
    },
    {
      id: "MN0400_211",
      title: "Device Logs & Monitoring",
      description: "Logs e monitoramento de dispositivos",
      path: "/MN0400_211",
      category: "Infrastructure",
      icon: "🖥️",
      color: "bg-orange-400"
    },

    // Analytics - Logistics
    {
      id: "MN0400_344",
      title: "Logistics Analytics",
      description: "Análise de logística e distribuição",
      path: "/MN0400_344",
      category: "Logistics",
      icon: "🚚",
      color: "bg-pink-500"
    }
  ]

  const categories = [
    { id: "all", name: "Todos", icon: "🌐" },
    { id: "Assets", name: "Assets", icon: "📦" },
    { id: "People", name: "People", icon: "👥" },
    { id: "Certificates", name: "Certificates", icon: "📜" },
    { id: "Locations", name: "Locations", icon: "📍" },
    { id: "Infrastructure", name: "Infrastructure", icon: "🏗️" },
    { id: "Logistics", name: "Logistics", icon: "🚚" }
  ]

  const filteredDashboards = dashboards.filter(dashboard => {
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
      id: dashboard.id,
      title: dashboard.title,
      path: dashboard.path,
      category: dashboard.category,
      icon: dashboard.icon
    })
  }

  const getCategoryStats = (category: string) => {
    if (category === "all") return dashboards.length
    return dashboards.filter(d => d.category === category).length
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
                    {dashboards.length}
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
                    ({getCategoryStats(category.id)})
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
                      {dashboard.category}
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
          <div className="mt-8 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
            {categories.slice(1).map((category) => (
              <div
                key={category.id}
                className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-4 text-center"
              >
                <div className="text-2xl mb-2">{category.icon}</div>
                <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {getCategoryStats(category.id)}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {category.name}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  )
}