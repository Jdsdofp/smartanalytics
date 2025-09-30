// src/components/layout/Header.tsx
import ThemeToggle from '../ThemeToggle'

interface HeaderProps {
  onMenuClick?: () => void
}

function Header({ onMenuClick }: HeaderProps) {
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

          {/* Logo + Nome */}
          <div className="flex items-center gap-3">
            <img 
              src="/logo_smartxanalytics.png" 
              alt="Smart Analytics Logo" 
              className="h-15 w-15 object-contain"
            />
            <h1 className="text-xl font-bold text-primary-600 dark:text-primary-400">
              Smart Analytics
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

          {/* User Avatar */}
          <button className="flex items-center gap-2 p-2 rounded-lg
                           hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
            <div className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center">
              <span className="text-white font-semibold text-sm">JM</span>
            </div>
          </button>
        </div>
      </div>
    </header>
  )
}

export default Header