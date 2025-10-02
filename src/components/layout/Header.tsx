// src/components/layout/Header.tsx
import ThemeToggle from '../ThemeToggle'
import { useAuth } from '../../context/AuthContext'
import { useCompany } from '../hooks/useCompany'

interface HeaderProps {
  onMenuClick?: () => void
}

function Header({ onMenuClick }: HeaderProps) {
  const { user, logout } = useAuth()
  const { company, logo } = useCompany()

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-200 dark:border-gray-800
                       bg-white dark:bg-gray-900 shadow-sm">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo e Menu Mobile */}
        <div className="flex items-center gap-4">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800
                       transition-colors"
            aria-label="Toggle menu"
          >
            <svg
              className="w-6 h-6 text-gray-700 dark:text-gray-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>

          {/* Logo + Nome da Empresa */}
          <div className="flex items-center gap-3">
            {logo ? (
              <img
                // src={logo}
                src="/logo10.png"
                alt={company?.full_name || 'Logo'}
                className="h-15 w-auto max-w-[120px] object-contain"
              />
            ) : (
              <img
                src="/logo10.png"
                alt="Smart Analytics Logo"
                className="h-10 w-10 object-contain"
              />
            )}
            <h1 className="text-xl font-bold text-primary-600 dark:text-primary-400 max-[400px]:hidden">
              {/* {company?.full_name || 'Smart Analytics'} */ 'Smart Analytics'}
            </h1>
          </div>
        </div>

        {/* Ações do Header */}
        <div className="flex items-center gap-4">
          {/* Search */}
          <div className="hidden md:flex items-center">
            <input
              type="search"
              placeholder="Buscar..."
              className="px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-800
                       text-gray-900 dark:text-gray-100
                       border border-gray-300 dark:border-gray-700
                       focus:outline-none focus:ring-2 focus:ring-primary-500
                       w-64"
            />
          </div>

          {/* Notificações */}
          <button
            className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800
                     transition-colors"
            aria-label="Notifications"
          >
            <svg
              className="w-6 h-6 text-gray-700 dark:text-gray-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
              />
            </svg>
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>

          {/* Theme Toggle */}
          <ThemeToggle />

          {/* User Menu com Dropdown */}
          <div className="relative group">
            <button
              className="flex items-center gap-2 p-2 rounded-lg
                       hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center bg-company-primary"
                // style={{ backgroundColor: primaryColor || '#0ea5e9' }}
              >
                <span className="text-white font-semibold text-sm">
                  {user?.name
                    ? user.name.split(' ').map(n => n.charAt(0).toUpperCase()).join('').slice(0, 2)
                    : 'U'}
                </span>
              </div>
              <div className="hidden lg:block text-left">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {user?.name}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {user?.role}
                </p>
              </div>
              <svg
                className="w-4 h-4 text-gray-500 dark:text-gray-400 hidden lg:block"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* Dropdown Menu */}
            <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-lg 
                          border border-gray-200 dark:border-gray-700 py-2
                          opacity-0 invisible group-hover:opacity-100 group-hover:visible
                          transition-all duration-200 z-50">
              {/* User Info */}
              <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {user?.name}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {user?.email}
                </p>
              </div>

              {/* Menu Items */}
              <button className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300
                               hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Meu Perfil
              </button>

              <button className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300
                               hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Configurações
              </button>

              <div className="border-t border-gray-200 dark:border-gray-700 my-2"></div>

              <button
                onClick={logout}
                className="w-full px-4 py-2 text-left text-sm text-red-600 dark:text-red-400
                         hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Sair
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header