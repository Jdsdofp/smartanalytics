import { useAuth } from "../../context/AuthContext"
import { useCompany } from "../../hooks/useCompany"
import Layout from "../../components/layout/Layout"
import { useNavigate } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { useFavorites } from "../../context/FavoritesContext"

export default function Home() {
  const { user } = useAuth()
  const { company } = useCompany()
  const { favorites } = useFavorites()
  const { t } = useTranslation()
  const navigate = useNavigate()

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'Analytics': 'bg-blue-500',
      'Certificates': 'bg-purple-500',
      'Locations': 'bg-green-500',
      'Infrastructure': 'bg-orange-500',
      'Logistics': 'bg-pink-500',
      'People': 'bg-cyan-500',
      'Assets': 'bg-indigo-500'
    }
    return colors[category] || 'bg-gray-500'
  }

  return (
    <Layout showEmbedButton={false} showFavoriteButton={false}>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
        <div className="flex flex-col lg:flex-row">
          <main className="flex-1 w-full">
            <div className="container mx-auto p-6">
              {/* Banner com gradiente da empresa */}
              <div className="mb-6 gradient-company p-6 rounded-lg text-white shadow-lg fade-in">
                <h2 className="text-3xl font-bold mb-2">
                  {t('home.welcome', { name: user?.name })}
                </h2>
                <p className="text-white/90">
                  {company?.details?.full_name} | {user?.role}
                </p>
              </div>

              {/* NOVO: Card de Acesso ao Dashboard Hub */}
              <div className="mb-6 fade-in">
                <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl shadow-xl overflow-hidden">
                  <div className="p-6 md:flex md:items-center md:justify-between">
                    <div className="flex-1 mb-4 md:mb-0">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="bg-white/20 backdrop-blur-sm p-3 rounded-lg">
                          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 16a1 1 0 011-1h4a1 1 0 011 1v3a1 1 0 01-1 1H5a1 1 0 01-1-1v-3zM14 16a1 1 0 011-1h4a1 1 0 011 1v3a1 1 0 01-1 1h-4a1 1 0 01-1-1v-3z" />
                          </svg>
                        </div>
                        <div>
                          <h3 className="text-2xl font-bold text-white">
                            📊 Dashboard Hub
                          </h3>
                          <p className="text-white/90 text-sm">
                            Acesse todos os 16 dashboards em um só lugar
                          </p>
                        </div>
                      </div>
                      <p className="text-white/80 text-sm">
                        4 visualizações diferentes: Grid, Compacta, Hierárquica e Kanban
                      </p>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row gap-2">
                      <button
                        onClick={() => navigate('/dashboard-hub')}
                        className="px-6 py-3 bg-white text-blue-600 rounded-lg font-semibold hover:bg-gray-100 transition-all shadow-lg hover:shadow-xl hover:scale-105"
                      >
                        Abrir Hub
                      </button>
                      <div className="relative group">
                        <button className="px-4 py-3 bg-white/20 backdrop-blur-sm text-white rounded-lg font-semibold hover:bg-white/30 transition-all">
                          Visualizações ▾
                        </button>
                        <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-900 rounded-lg shadow-xl border border-gray-200 dark:border-gray-800 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                          <button
                            onClick={() => navigate('/dashboard-hub')}
                            className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-t-lg"
                          >
                            📊 Grid View
                          </button>
                          <button
                            onClick={() => navigate('/dashboard-hub/compact')}
                            className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-900 dark:text-gray-100"
                          >
                            📋 Compact View
                          </button>
                          <button
                            onClick={() => navigate('/dashboard-hub/hierarchical')}
                            className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-900 dark:text-gray-100"
                          >
                            🎯 Hierarchical View
                          </button>
                          <button
                            onClick={() => navigate('/dashboard-hub/kanban')}
                            className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-b-lg"
                          >
                            📌 Kanban View
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Área de Favoritos */}
              {favorites.length > 0 && (
                <div className="mb-6 fade-in">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <svg className="w-6 h-6 text-yellow-500" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                      </svg>
                      <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                        {t('home.favorites')}
                      </h3>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        ({favorites.length})
                      </span>
                    </div>
                    <button
                      onClick={() => navigate('/dashboard-hub')}
                      className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      Ver todos os dashboards →
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {favorites.map((favorite) => (
                      <div
                        key={favorite.id}
                        onClick={() => navigate(favorite.path)}
                        className="group relative p-4 rounded-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-lg transition-all cursor-pointer hover:scale-105"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <div className={`flex-shrink-0 w-10 h-10 ${getCategoryColor(favorite.category)} rounded-lg flex items-center justify-center text-white text-xl`}>
                              {favorite.icon}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-semibold text-gray-900 dark:text-gray-100 truncate">
                                {favorite.title}
                              </h4>
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                {favorite.category}
                              </p>
                            </div>
                          </div>
                          
                          <svg 
                            className="w-5 h-5 text-yellow-500 flex-shrink-0" 
                            fill="currentColor" 
                            viewBox="0 0 24 24"
                          >
                            <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                          </svg>
                        </div>

                        <div className="mt-2 flex items-center gap-2">
                          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                          <span className="text-xs text-gray-400 dark:text-gray-500 font-mono">
                            {favorite.path}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Cards de acesso rápido a categorias */}
              <div className="mb-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                  Acesso Rápido por Categoria
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                  {[
                    { category: 'Assets', icon: '📦', color: 'indigo', count: 3 },
                    { category: 'People', icon: '👥', color: 'cyan', count: 1 },
                    { category: 'Certificates', icon: '📜', color: 'purple', count: 3 },
                    { category: 'Locations', icon: '📍', color: 'green', count: 1 },
                    { category: 'Infrastructure', icon: '🏗️', color: 'orange', count: 6 },
                    { category: 'Logistics', icon: '🚚', color: 'pink', count: 1 }
                  ].map((cat) => (
                    <button
                      key={cat.category}
                      onClick={() => navigate('/dashboard-hub')}
                      className={`p-4 rounded-lg border-2 ${
                        cat.color === 'indigo' ? 'border-indigo-200 dark:border-indigo-800 hover:border-indigo-500' :
                        cat.color === 'cyan' ? 'border-cyan-200 dark:border-cyan-800 hover:border-cyan-500' :
                        cat.color === 'purple' ? 'border-purple-200 dark:border-purple-800 hover:border-purple-500' :
                        cat.color === 'green' ? 'border-green-200 dark:border-green-800 hover:border-green-500' :
                        cat.color === 'orange' ? 'border-orange-200 dark:border-orange-800 hover:border-orange-500' :
                        'border-pink-200 dark:border-pink-800 hover:border-pink-500'
                      } bg-white dark:bg-gray-900 hover:shadow-md transition-all text-center group`}
                    >
                      <div className="text-3xl mb-2">{cat.icon}</div>
                      <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                        {cat.category}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {cat.count} dashboard{cat.count > 1 ? 's' : ''}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Cards de informações */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Card Perfil */}
                <div className="p-6 rounded-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-md transition-shadow fade-in">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                      {t('home.yourProfile')}
                    </h3>
                    <svg className="w-8 h-8 text-company-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <div className="space-y-2 text-sm">
                    <p className="text-gray-600 dark:text-gray-400">
                      <strong>{t('home.email')}:</strong> {user?.email}
                    </p>
                    <p className="text-gray-600 dark:text-gray-400">
                      <strong>{t('home.login')}:</strong> {user?.login}
                    </p>
                    <p className="text-gray-600 dark:text-gray-400">
                      <strong>{t('home.type')}:</strong> {user?.type}
                    </p>
                  </div>
                </div>

                {/* Card Status */}
                <div className="p-6 rounded-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-md transition-shadow fade-in">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                      {t('home.status')}
                    </h3>
                    <svg className="w-8 h-8 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="space-y-2 text-sm">
                    <p className="text-gray-600 dark:text-gray-400">
                      <strong>{t('home.account')}:</strong> 
                      <span className={user?.active ? 'text-green-500' : 'text-red-500'}>
                        {user?.active ? t('home.active') : t('home.inactive')}
                      </span>
                    </p>
                    <p className="text-gray-600 dark:text-gray-400">
                      <strong>{t('home.timezone')}:</strong> {user?.timeZone}
                    </p>
                    <p className="text-gray-600 dark:text-gray-400">
                      <strong>{t('home.id')}:</strong> {user?.id}
                    </p>
                  </div>
                </div>

                {/* NOVO: Card Dashboard Hub */}
                <div className="p-6 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-sm hover:shadow-md transition-shadow fade-in cursor-pointer"
                     onClick={() => navigate('/dashboard-hub')}>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-semibold">
                      Dashboard Hub
                    </h3>
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 16a1 1 0 011-1h4a1 1 0 011 1v3a1 1 0 01-1 1H5a1 1 0 01-1-1v-3zM14 16a1 1 0 011-1h4a1 1 0 011 1v3a1 1 0 01-1 1h-4a1 1 0 01-1-1v-3z" />
                    </svg>
                  </div>
                  <div className="space-y-2 text-sm">
                    <p className="text-white/90">
                      <strong>Total:</strong> 16 dashboards
                    </p>
                    <p className="text-white/90">
                      <strong>Categorias:</strong> 6
                    </p>
                    <p className="text-white/90">
                      <strong>Visualizações:</strong> 4 tipos
                    </p>
                  </div>
                  <button className="mt-4 w-full py-2 bg-white/20 backdrop-blur-sm rounded-lg hover:bg-white/30 transition-all font-semibold">
                    Acessar Hub →
                  </button>
                </div>
              </div>

              {/* Informações técnicas */}
              <div className="mt-6 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
                <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  {t('home.technicalInfo')}
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-gray-600 dark:text-gray-400">
                  <p><strong>{t('home.companyId')}:</strong> {user?.companyId}</p>
                  <p><strong>{t('home.webKey')}:</strong> {user?.webKey?.substring(0, 20)}...</p>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </Layout>
  )
}