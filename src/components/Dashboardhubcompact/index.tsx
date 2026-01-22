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
  lastAccessed?: string
  accessCount?: number
}

export default function DashboardHubCompact() {
  const navigate = useNavigate()
  //@ts-ignore
  const { t } = useTranslation()
  //@ts-ignore
  const { favorites, toggleFavorite } = useFavorites()
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")

  const dashboards: Dashboard[] = [
    // Assets
    {
      id: "MN0400_011",
      title: "Assets Overview",
      description: "Visão geral de ativos",
      path: "/MN0400_011",
      category: "Assets",
      icon: "📦",
      color: "bg-indigo-500",
      lastAccessed: "2024-01-20",
      accessCount: 45
    },
    {
      id: "MN0400_012",
      title: "Assets Management",
      description: "Gerenciamento de ativos",
      path: "/MN0400_012",
      category: "Assets",
      icon: "🏷️",
      color: "bg-indigo-600",
      lastAccessed: "2024-01-19",
      accessCount: 32
    },
    {
      id: "MN0400_013",
      title: "Assets Analytics",
      description: "Análise de ativos",
      path: "/MN0400_013",
      category: "Assets",
      icon: "📊",
      color: "bg-indigo-700",
      lastAccessed: "2024-01-18",
      accessCount: 28
    },

    // People
    {
      id: "MN0400_111",
      title: "People Analytics",
      description: "Análise de pessoas",
      path: "/MN0400_111",
      category: "People",
      icon: "👥",
      color: "bg-cyan-500",
      lastAccessed: "2024-01-21",
      accessCount: 67
    },

    // Certificates
    {
      id: "MN0400_511",
      title: "Certificate Status",
      description: "Status de certificados",
      path: "/MN0400_511",
      category: "Certificates",
      icon: "📜",
      color: "bg-purple-500",
      lastAccessed: "2024-01-22",
      accessCount: 89
    },
    {
      id: "MN0400_412",
      title: "Certificate Details",
      description: "Detalhes de certificados",
      path: "/MN0400_412",
      category: "Certificates",
      icon: "🔍",
      color: "bg-purple-600",
      lastAccessed: "2024-01-20",
      accessCount: 54
    },
    {
      id: "MN0400_413",
      title: "Certificate Reports",
      description: "Relatórios de certificados",
      path: "/MN0400_413",
      category: "Certificates",
      icon: "📋",
      color: "bg-purple-700",
      lastAccessed: "2024-01-19",
      accessCount: 41
    },

    // Locations
    {
      id: "MN0400_312",
      title: "Locations Analytics",
      description: "Análise de localizações",
      path: "/MN0400_312",
      category: "Locations",
      icon: "📍",
      color: "bg-green-500",
      lastAccessed: "2024-01-21",
      accessCount: 76
    },

    // Infrastructure
    {
      id: "MN0400_131",
      title: "Infrastructure Overview",
      description: "Visão geral de infraestrutura",
      path: "/MN0400_131",
      category: "Infrastructure",
      icon: "🏗️",
      color: "bg-orange-500",
      lastAccessed: "2024-01-20",
      accessCount: 38
    },
    {
      id: "MN0400_132",
      title: "Infrastructure Monitoring",
      description: "Monitoramento",
      path: "/MN0400_132",
      category: "Infrastructure",
      icon: "📡",
      color: "bg-orange-600",
      lastAccessed: "2024-01-19",
      accessCount: 52
    },
    {
      id: "MN0400_133",
      title: "Infrastructure Analytics",
      description: "Análise de infraestrutura",
      path: "/MN0400_133",
      category: "Infrastructure",
      icon: "📈",
      color: "bg-orange-700",
      lastAccessed: "2024-01-18",
      accessCount: 29
    },
    {
      id: "MN0400_134",
      title: "Infrastructure Reports",
      description: "Relatórios",
      path: "/MN0400_134",
      category: "Infrastructure",
      icon: "📊",
      color: "bg-orange-800",
      lastAccessed: "2024-01-17",
      accessCount: 24
    },
    {
      id: "MN0400_135",
      title: "Infrastructure Management",
      description: "Gerenciamento",
      path: "/MN0400_135",
      category: "Infrastructure",
      icon: "⚙️",
      color: "bg-orange-900",
      lastAccessed: "2024-01-16",
      accessCount: 19
    },
    {
      id: "MN0400_211",
      title: "Device Logs",
      description: "Logs de dispositivos",
      path: "/MN0400_211",
      category: "Infrastructure",
      icon: "🖥️",
      color: "bg-orange-400",
      lastAccessed: "2024-01-22",
      accessCount: 91
    },

    // Logistics
    {
      id: "MN0400_344",
      title: "Logistics Analytics",
      description: "Análise de logística",
      path: "/MN0400_344",
      category: "Logistics",
      icon: "🚚",
      color: "bg-pink-500",
      lastAccessed: "2024-01-21",
      accessCount: 63
    }
  ]

  const categories = ["all", "Assets", "People", "Certificates", "Locations", "Infrastructure", "Logistics"]

  const filteredDashboards = dashboards.filter(
    d => selectedCategory === "all" || d.category === selectedCategory
  )

  const isFavorite = (id: string) => favorites.some(fav => fav.id === id)

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

  const mostAccessed = [...dashboards].sort((a, b) => (b.accessCount || 0) - (a.accessCount || 0)).slice(0, 5)

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
        <div className="container mx-auto p-6">
          {/* Header com Stats */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-6">
            <div className="lg:col-span-3 gradient-company p-6 rounded-lg text-white">
              <h1 className="text-3xl font-bold mb-2">📊 Dashboard Hub</h1>
              <p className="text-white/90">Central unificada de dashboards e análises</p>
            </div>
            <div className="bg-white dark:bg-gray-900 p-6 rounded-lg border border-gray-200 dark:border-gray-800 flex flex-col justify-center">
              <div className="text-4xl font-bold text-gray-900 dark:text-gray-100">{dashboards.length}</div>
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
                        ({dashboards.filter(d => cat === "all" || d.category === cat).length})
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