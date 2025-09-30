// src/components/layout/Navbar.tsx
import {
  HomeIcon,
  ChartBarIcon,
  DocumentTextIcon,
  Cog6ToothIcon,
} from '@heroicons/react/24/outline'

interface NavItem {
  label: string
  icon: React.ComponentType<{ className?: string }>
  active?: boolean
  onClick?: () => void
}

interface NavbarProps {
  items?: NavItem[]
}

function Navbar({ items }: NavbarProps) {
  const defaultItems: NavItem[] = [
    { label: 'Dashboard', icon: HomeIcon, active: true },
    { label: 'Analytics', icon: ChartBarIcon },
    { label: 'Relatórios', icon: DocumentTextIcon },
    { label: 'Configurações', icon: Cog6ToothIcon },
  ]

  const navItems = items || defaultItems

  return (
    <nav className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
      <div className="container mx-auto px-4">
        <div className="flex items-center gap-2 overflow-x-auto">
          {navItems.map((item, index) => {
            const Icon = item.icon
            return (
              <button
                key={index}
                onClick={item.onClick}
                className={`relative flex items-center gap-2 py-4 px-4 font-medium whitespace-nowrap
                           transition-colors rounded-t-lg
                           ${item.active
                             ? 'text-primary-600 dark:text-primary-400'
                             : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
                           }`}
              >
                <Icon className="w-5 h-5" />
                {item.label}
                {item.active && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5
                                 bg-primary-600 dark:bg-primary-400" />
                )}
              </button>
            )
          })}
        </div>
      </div>
    </nav>
  )
}

export default Navbar