// src/components/layout/Menu.tsx
import { useState } from 'react'
import {
  ChartBarIcon,
  ChartPieIcon,
  UsersIcon,
  Cog6ToothIcon,
  ChatBubbleLeftRightIcon,
  QuestionMarkCircleIcon,
  ChevronDownIcon,
  XMarkIcon,
  ArrowRightOnRectangleIcon,
  ShieldCheckIcon,
  PaintBrushIcon,
  BellIcon,
  DocumentChartBarIcon,
  TableCellsIcon,
} from '@heroicons/react/24/outline'

interface MenuItemProps {
  icon: React.ComponentType<{ className?: string }>
  label: string
  active?: boolean
  badge?: number
  onClick?: () => void
  children?: MenuItemProps[]
}

function MenuItem({ icon: Icon, label, active, badge, onClick, children }: MenuItemProps) {
  const [isOpen, setIsOpen] = useState(false)

  const hasChildren = children && children.length > 0

  return (
    <div>
      <button
        onClick={() => {
          if (hasChildren) {
            setIsOpen(!isOpen)
          }
          onClick?.()
        }}
        className={`w-full flex items-center justify-between px-4 py-3 rounded-lg
                   transition-colors group
                   ${active 
                     ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400' 
                     : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                   }`}
      >
        <div className="flex items-center gap-3">
          <Icon className="w-5 h-5" />
          <span className="font-medium">{label}</span>
        </div>

        <div className="flex items-center gap-2">
          {badge && (
            <span className="px-2 py-1 text-xs font-semibold rounded-full 
                           bg-red-500 text-white">
              {badge}
            </span>
          )}
          {hasChildren && (
            <ChevronDownIcon 
              className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
            />
          )}
        </div>
      </button>

      {/* Submenu */}
      {hasChildren && isOpen && (
        <div className="ml-8 mt-1 space-y-1">
          {children.map((child, index) => (
            <MenuItem key={index} {...child} />
          ))}
        </div>
      )}
    </div>
  )
}

interface MenuProps {
  isOpen?: boolean
  onClose?: () => void
}

function Menu({ isOpen = true, onClose }: MenuProps) {
  const menuItems: MenuItemProps[] = [
    {
      icon: ChartBarIcon,
      label: 'Dashboard',
      active: true,
    },
    {
      icon: ChartPieIcon,
      label: 'Analytics',
      badge: 3,
      children: [
        { icon: DocumentChartBarIcon, label: 'Relatórios' },
        { icon: ChartBarIcon, label: 'Gráficos' },
        { icon: TableCellsIcon, label: 'Tabelas' },
      ],
    },
    {
      icon: UsersIcon,
      label: 'Usuários',
    },
    {
      icon: Cog6ToothIcon,
      label: 'Configurações',
      children: [
        { icon: ShieldCheckIcon, label: 'Segurança' },
        { icon: PaintBrushIcon, label: 'Aparência' },
        { icon: BellIcon, label: 'Notificações' },
      ],
    },
    {
      icon: ChatBubbleLeftRightIcon,
      label: 'Mensagens',
      badge: 12,
    },
    {
      icon: QuestionMarkCircleIcon,
      label: 'Ajuda',
    },
  ]

  return (
    <>
      {/* Overlay para mobile */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={onClose}
        />
      )}

      {/* Menu Sidebar */}
      <aside
        className={`fixed lg:sticky top-0 left-0 z-40 h-screen
                   w-64 bg-white dark:bg-gray-900 
                   border-r border-gray-200 dark:border-gray-800
                   transition-transform duration-300 lg:translate-x-0
                   ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="h-16 flex items-center justify-between px-4 border-b 
                         border-gray-200 dark:border-gray-800">
            <h2 className="text-lg font-bold text-primary-600 dark:text-primary-400">
              Menu
            </h2>
            <button
              onClick={onClose}
              title="Close menu"
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>

          {/* Menu Items */}
          <nav className="flex-1 overflow-y-auto p-4 space-y-2">
            {menuItems.map((item, index) => (
              <MenuItem key={index} {...item} />
            ))}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-800">
            <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg
                             text-red-600 dark:text-red-400
                             hover:bg-red-50 dark:hover:bg-red-900/20
                             transition-colors">
              <ArrowRightOnRectangleIcon className="w-5 h-5" />
              <span className="font-medium">Sair</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  )
}

export default Menu