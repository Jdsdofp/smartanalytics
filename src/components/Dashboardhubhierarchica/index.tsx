import { useNavigate } from "react-router-dom"
import Layout from "../../components/layout/Layout"
import { useFavorites } from "../../context/FavoritesContext"
import { useState } from "react"

interface Dashboard {
  id: string
  title: string
  path: string
  icon: string
}

interface CategoryGroup {
  category: string
  icon: string
  color: string
  dashboards: Dashboard[]
}

export default function DashboardHubHierarchical() {
  const navigate = useNavigate()
  //@ts-ignore
  const { favorites, toggleFavorite } = useFavorites()
  const [expandedCategory, setExpandedCategory] = useState<string | null>("Assets")

  const categoryGroups: CategoryGroup[] = [
    {
      category: "Assets",
      icon: "📦",
      color: "indigo",
      dashboards: [
        { id: "MN0400_011", title: "Assets Overview", path: "/MN0400_011", icon: "📊" },
        { id: "MN0400_012", title: "Assets Management", path: "/MN0400_012", icon: "🏷️" },
        { id: "MN0400_013", title: "Assets Analytics", path: "/MN0400_013", icon: "📈" }
      ]
    },
    {
      category: "People",
      icon: "👥",
      color: "cyan",
      dashboards: [
        { id: "MN0400_111", title: "People Analytics", path: "/MN0400_111", icon: "👤" }
      ]
    },
    {
      category: "Certificates",
      icon: "📜",
      color: "purple",
      dashboards: [
        { id: "MN0400_511", title: "Certificate Status", path: "/MN0400_511", icon: "✅" },
        { id: "MN0400_412", title: "Certificate Details", path: "/MN0400_412", icon: "🔍" },
        { id: "MN0400_413", title: "Certificate Reports", path: "/MN0400_413", icon: "📋" }
      ]
    },
    {
      category: "Locations",
      icon: "📍",
      color: "green",
      dashboards: [
        { id: "MN0400_312", title: "Locations Analytics", path: "/MN0400_312", icon: "🗺️" }
      ]
    },
    {
      category: "Infrastructure",
      icon: "🏗️",
      color: "orange",
      dashboards: [
        { id: "MN0400_131", title: "Infrastructure Overview", path: "/MN0400_131", icon: "📊" },
        { id: "MN0400_132", title: "Infrastructure Monitoring", path: "/MN0400_132", icon: "📡" },
        { id: "MN0400_133", title: "Infrastructure Analytics", path: "/MN0400_133", icon: "📈" },
        { id: "MN0400_134", title: "Infrastructure Reports", path: "/MN0400_134", icon: "📋" },
        { id: "MN0400_135", title: "Infrastructure Management", path: "/MN0400_135", icon: "⚙️" },
        { id: "MN0400_211", title: "Device Logs & Monitoring", path: "/MN0400_211", icon: "🖥️" }
      ]
    },
    {
      category: "Logistics",
      icon: "🚚",
      color: "pink",
      dashboards: [
        { id: "MN0400_344", title: "Logistics Analytics", path: "/MN0400_344", icon: "📦" }
      ]
    }
  ]
  //@ts-ignore
  const getColorClasses = (color: string) => ({
    bg: `bg-${color}-500`,
    bgLight: `bg-${color}-50 dark:bg-${color}-950`,
    border: `border-${color}-200 dark:border-${color}-800`,
    text: `text-${color}-700 dark:text-${color}-300`,
    hover: `hover:bg-${color}-100 dark:hover:bg-${color}-900`
  })

  const isFavorite = (id: string) => favorites.some(fav => fav.id === id)

  const handleToggleFavorite = (dashboard: Dashboard, category: string, e: React.MouseEvent) => {
    e.stopPropagation()
    toggleFavorite({
      id: dashboard.id,
      title: dashboard.title,
      path: dashboard.path,
      category: category,
      icon: dashboard.icon
    })
  }

  const totalDashboards = categoryGroups.reduce((sum, group) => sum + group.dashboards.length, 0)

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
        <div className="container mx-auto p-6">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              🎯 Dashboard Hub
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Navegação hierárquica por categorias
            </p>
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800">
              <span className="text-sm text-gray-600 dark:text-gray-400">Total:</span>
              <span className="text-2xl font-bold text-gray-900 dark:text-gray-100">{totalDashboards}</span>
              <span className="text-sm text-gray-600 dark:text-gray-400">dashboards</span>
            </div>
          </div>

          {/* Hierarchical View */}
          <div className="max-w-7xl mx-auto">
            {/* Central Hub */}
            <div className="flex justify-center mb-8">
              <div className="relative">
                <div className="w-32 h-32 gradient-company rounded-full flex items-center justify-center shadow-xl">
                  <div className="text-center text-white">
                    <div className="text-4xl mb-1">🎯</div>
                    <div className="text-xs font-bold">HUB</div>
                  </div>
                </div>
                {/* Connection lines */}
                <svg className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] pointer-events-none -z-10">
                  {categoryGroups.map((_, index) => {
                    const angle = (index * 360) / categoryGroups.length
                    const radian = (angle - 90) * (Math.PI / 180)
                    const x1 = 400
                    const y1 = 300
                    const x2 = 400 + Math.cos(radian) * 280
                    const y2 = 300 + Math.sin(radian) * 220
                    return (
                      <line
                        key={index}
                        x1={x1}
                        y1={y1}
                        x2={x2}
                        y2={y2}
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeDasharray="5,5"
                        className="text-gray-300 dark:text-gray-700"
                        opacity="0.5"
                      />
                    )
                  })}
                </svg>
              </div>
            </div>

            {/* Categories in Circle */}
            <div className="relative min-h-[500px]">
              {categoryGroups.map((group, index) => {
                const total = categoryGroups.length
                const angle = (index * 360) / total
                const radian = (angle - 90) * (Math.PI / 180)
                const distance = 280
                const x = Math.cos(radian) * distance
                const y = Math.sin(radian) * distance

                const isExpanded = expandedCategory === group.category

                return (
                  <div
                    key={group.category}
                    className="absolute top-1/2 left-1/2 transition-all duration-300"
                    style={{
                      transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`
                    }}
                  >
                    {/* Category Button */}
                    <button
                      onClick={() => setExpandedCategory(isExpanded ? null : group.category)}
                      className={`relative group ${
                        group.color === 'indigo' ? 'bg-indigo-500' :
                        group.color === 'cyan' ? 'bg-cyan-500' :
                        group.color === 'purple' ? 'bg-purple-500' :
                        group.color === 'green' ? 'bg-green-500' :
                        group.color === 'orange' ? 'bg-orange-500' :
                        'bg-pink-500'
                      } text-white rounded-full w-24 h-24 flex flex-col items-center justify-center shadow-lg hover:shadow-xl transition-all ${
                        isExpanded ? 'scale-110 ring-4 ring-white dark:ring-gray-900' : 'hover:scale-105'
                      }`}
                    >
                      <div className="text-3xl mb-1">{group.icon}</div>
                      <div className="text-xs font-bold">{group.category}</div>
                      <div className="text-xs opacity-75">({group.dashboards.length})</div>
                    </button>

                    {/* Expanded Dashboards */}
                    {isExpanded && (
                      <div
                        className="absolute top-full left-1/2 -translate-x-1/2 mt-4 w-72 bg-white dark:bg-gray-900 rounded-lg shadow-xl border border-gray-200 dark:border-gray-800 p-4 z-10 animate-fadeIn"
                      >
                        <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
                          <span className="text-xl">{group.icon}</span>
                          {group.category}
                        </h3>
                        <div className="space-y-2">
                          {group.dashboards.map((dashboard) => (
                            <div
                              key={dashboard.id}
                              onClick={() => navigate(dashboard.path)}
                              className="group/item flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer transition-all"
                            >
                              <div className="text-2xl">{dashboard.icon}</div>
                              <div className="flex-1 min-w-0">
                                <div className="font-medium text-gray-900 dark:text-gray-100 text-sm">
                                  {dashboard.title}
                                </div>
                                <div className="text-xs text-gray-500 font-mono">
                                  {dashboard.id}
                                </div>
                              </div>
                              <button
                                onClick={(e) => handleToggleFavorite(dashboard, group.category, e)}
                                className="flex-shrink-0"
                              >
                                <svg
                                  className={`w-5 h-5 transition-all ${
                                    isFavorite(dashboard.id)
                                      ? "text-yellow-500 fill-yellow-500"
                                      : "text-gray-400 group-hover/item:text-yellow-500"
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
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {/* Quick Access Grid at Bottom */}
          <div className="mt-16">
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4 text-center">
              Acesso Rápido
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              {categoryGroups.map((group) => (
                <div
                  key={group.category}
                  className={`p-4 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-center ${
                    group.color === 'indigo' ? 'hover:border-indigo-500' :
                    group.color === 'cyan' ? 'hover:border-cyan-500' :
                    group.color === 'purple' ? 'hover:border-purple-500' :
                    group.color === 'green' ? 'hover:border-green-500' :
                    group.color === 'orange' ? 'hover:border-orange-500' :
                    'hover:border-pink-500'
                  } transition-all cursor-pointer`}
                  onClick={() => setExpandedCategory(group.category)}
                >
                  <div className="text-3xl mb-2">{group.icon}</div>
                  <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                    {group.category}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {group.dashboards.length} dashboard{group.dashboards.length > 1 ? 's' : ''}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateX(-50%) translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </Layout>
  )
}