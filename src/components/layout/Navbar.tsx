// src/components/layout/Navbar.tsx
import {
  HomeIcon,
  ChartBarIcon,
  DocumentTextIcon,
  Cog6ToothIcon,
} from '@heroicons/react/24/outline'
import { useCompany } from '../hooks/useCompany'

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
  const { primaryColor } = useCompany()

  const defaultItems: NavItem[] = [
    { label: 'Dashboard', icon: HomeIcon, active: true },
    { label: 'Analytics', icon: ChartBarIcon },
    { label: 'Relatórios', icon: DocumentTextIcon },
    { label: 'Configurações', icon: Cog6ToothIcon },
  ]

  const navItems = items || defaultItems

  return (
    <nav className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
      <div className="w-full px-2 sm:px-4">
        <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto sm:justify-center">
          {navItems.map((item, index) => {
            const Icon = item.icon
            return (
              <button
                key={index}
                onClick={item.onClick}
                title={item.label}
                className={`relative flex flex-col sm:flex-row items-center justify-center
                           gap-1 sm:gap-2 py-3 sm:py-4 px-2 sm:px-4
                           font-medium whitespace-nowrap transition-all rounded-t-lg
                           min-w-[60px] sm:min-w-0
                           ${item.active
                    ? 'text-company-primary'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
                  }`}
                style={item.active ? { color: primaryColor } : undefined}
              >
                <Icon className="w-5 h-5 sm:w-5 sm:h-5 flex-shrink-0" />
                <span className="hidden min-[300px]:inline text-xs sm:text-sm md:text-base">
                  {item.label}
                </span>
                {item.active && (
                  <span 
                    className="absolute bottom-0 left-0 right-0 h-0.5"
                    style={{ backgroundColor: primaryColor || '#0ea5e9' }}
                  />
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