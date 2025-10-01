import { useState, useEffect } from 'react'
import {
  ChartBarIcon,
  ChartPieIcon,
  UsersIcon,
  Cog6ToothIcon,
  ChatBubbleLeftIcon,
  QuestionMarkCircleIcon,
  ChevronDownIcon,
  XMarkIcon,
  ArrowRightOnRectangleIcon,
  ShieldCheckIcon,
  PaintBrushIcon,
  BellIcon,
  DocumentChartBarIcon,
  TableCellsIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from '@heroicons/react/24/outline'

interface MenuItemProps {
  icon: React.ComponentType<{ className?: string }>
  label: string
  active?: boolean
  badge?: number
  onClick?: () => void
  children?: MenuItemProps[]
  collapsed?: boolean
}

function MenuItem({ icon: Icon, label, active, badge, onClick, children, collapsed }: MenuItemProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [showPopover, setShowPopover] = useState(false)
  const [popoverPosition, setPopoverPosition] = useState({ top: 100, left: 0 })

  const hasChildren = children && children.length > 0

  const handleMouseEnter = (e: React.MouseEvent<HTMLDivElement>) => {
    if (collapsed) {
      const rect = e.currentTarget.getBoundingClientRect()
      setPopoverPosition({
        top: rect.top + (rect.height / 2) - 20,
        left: rect.right + 8
      })
      setShowPopover(true)
    }
  }

  return (
    <>
      <div
        className="relative"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={() => collapsed && setShowPopover(false)}
      >
        <button
          onClick={() => {
            if (hasChildren && !collapsed) {
              setIsOpen(!isOpen)
            }
            onClick?.()
          }}
          title={collapsed ? label : undefined}
          className={`w-full flex items-center ${collapsed ? 'justify-center' : 'justify-between'} px-4 py-3 rounded-lg
                     transition-colors group relative
                     ${active
              ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 cursor-pointer'
              : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer'
            }`}
        >
          <div className={`flex items-center ${collapsed ? '' : 'gap-3'}`}>
            <Icon className="w-5 h-5 flex-shrink-0" />
            {!collapsed && <span className="font-medium">{label}</span>}
          </div>

          {!collapsed && (
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
          )}
        </button>

        {/* Submenu normal (quando não está collapsed) */}
        {hasChildren && !collapsed && (
          <div
            className={`relative ml-6 mt-1 space-y-1 overflow-hidden transition-all duration-500 ease-in-out
                       ${isOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}
          >
            {children.map((child, index) => (
              <div
                key={index}
                className="relative"
                style={{
                  animation: isOpen ? `slideIn 0.3s ease-out ${index * 0.1}s both` : 'none'
                }}
              >
                {/* Linha em L arredondada */}
                <div className="absolute left-0 top-0 bottom-1/2 w-3 border-l-2 border-b-2 border-gray-300 dark:border-gray-600 rounded-bl-lg" />

                {/* Linha vertical conectando aos próximos itens (exceto o último) */}
                {index < children.length - 1 && (
                  <div className="absolute left-0 top-1/2 bottom-0 w-3 border-l-2 border-gray-300 dark:border-gray-600" />
                )}

                <div className="pl-6">
                  <MenuItem {...child} collapsed={collapsed} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Popover para menu collapsed - renderizado no portal */}
      {collapsed && showPopover && (
        <div
          className="fixed min-w-[200px] z-[9999]
                     bg-white dark:bg-gray-800 rounded-lg shadow-xl
                     border border-gray-200 dark:border-gray-700
                     py-2 "
          style={{
            top: `${popoverPosition.top - 70}px`,
            left: `${popoverPosition.left}px`
          }}
          onMouseEnter={() => setShowPopover(true)}
          onMouseLeave={() => setShowPopover(false)}
        >
          {/* Setinha indicadora - borda cinza */}
          <div
            className="absolute -left-2 top-6 w-0 h-0 
                       border-t-8 border-t-transparent
                       border-r-8 border-r-gray-200 dark:border-r-gray-700
                       border-b-8 border-b-transparent"
          />
          {/* Setinha indicadora - preenchimento branco */}
          <div
            className="absolute -left-[7px] top-6 w-0 h-0 
                       border-t-8 border-t-transparent
                       border-r-8 border-r-white dark:border-r-gray-800
                       border-b-8 border-b-transparent"
          />

          {/* Header do popover */}
          <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <Icon className="w-5 h-5 text-gray-700 dark:text-gray-300" />
              <span className="font-medium text-gray-900 dark:text-gray-100">
                {label}
              </span>
              {badge && (
                <span className="ml-auto px-2 py-1 text-xs font-semibold rounded-full 
                               bg-red-500 text-white">
                  {badge}
                </span>
              )}
            </div>
          </div>

          {/* Submenu items no popover */}
          {hasChildren && (
            <div className="py-1 relative">
              {children.map((child, index) => (
                <div key={index} className="relative">
                  <div className="absolute left-4 top-0 bottom-1/2 w-3 border-l-2 border-b-2 border-gray-300 dark:border-gray-600 rounded-bl-lg" />
                  {/* Linha em L arredondada */}

                  {/* Linha vertical conectando aos próximos itens (exceto o último) */}
                  {index < children.length - 1 && (
                    <div className="absolute left-4 top-1/2 bottom-0 w-3 border-l-2 border-gray-300 dark:border-gray-600" />
                  )}
                  <button
                    onClick={child.onClick}
                    className="relative z-0 w-full flex items-center gap-3 px-4 py-2 pl-10 rounded-lg 
             text-gray-700 dark:text-gray-300
             transition-colors text-left
             before:absolute before:inset-0 before:left-8 before:right-2 before:rounded-lg 
             before:bg-transparent hover:before:bg-gray-100 dark:hover:before:bg-gray-700 before:-z-10 cursor-pointer"
                  >
                    <child.icon className="w-4 h-4 flex-shrink-0 relative z-10" />
                    <span className="text-sm relative z-10">{child.label}</span>
                  </button>


                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </>
  )
}

interface MenuProps {
  isOpen?: boolean
  onClose?: () => void
}

function Menu({ isOpen = true, onClose }: MenuProps) {
  const [collapsed, setCollapsed] = useState(false)

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setCollapsed(false)
      }
    }

    window.addEventListener('resize', handleResize)
    handleResize()

    return () => window.removeEventListener('resize', handleResize)
  }, [])

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
      icon: ChatBubbleLeftIcon,
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
        className={`fixed lg:static top-0 left-0 z-40 h-screen lg:h-auto
                   bg-white dark:bg-gray-900 
                   border-r border-gray-200 dark:border-gray-800
                   transition-all duration-300 lg:translate-x-0 flex-shrink-0
                   ${isOpen ? 'translate-x-0' : '-translate-x-full'}
                   ${collapsed ? 'lg:w-20' : 'w-64'}`}
      >
        <div className="flex flex-col h-full lg:h-screen lg:sticky lg:top-0">
          {/* Logo */}
          <div className="h-16 flex items-center justify-between px-4 border-b 
                         border-gray-200 dark:border-gray-800 flex-shrink-0">
            {!collapsed && (
              <h2 className="text-lg font-bold text-blue-600 dark:text-blue-400 truncate">
                Menu
              </h2>
            )}

            <div className="flex items-center gap-2 ml-auto">
              {/* Botão Collapse - apenas desktop */}
              <button
                onClick={() => setCollapsed(!collapsed)}
                title={collapsed ? 'Expandir menu' : 'Recolher menu'}
                className="hidden lg:block p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800
                         transition-colors flex-shrink-0"
              >
                {collapsed ? (
                  <ChevronRightIcon className="w-5 h-5 text-blue-600" />
                ) : (
                  <ChevronLeftIcon className="w-5 h-5 text-blue-600" />
                )}
              </button>

              {/* Botão Close - apenas mobile */}
              <button
                onClick={onClose}
                title="Fechar menu"
                className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 flex-shrink-0"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Menu Items */}
          <nav className="flex-1 overflow-y-auto overflow-x-hidden p-4 space-y-2">
            {menuItems.map((item, index) => (
              <MenuItem
                key={index}
                {...item}
                collapsed={collapsed}
              />
            ))}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-800 flex-shrink-0">
            <button
              onClick={() => alert('Logout')}
              title={collapsed ? 'Sair' : undefined}
              className={`w-full flex items-center ${collapsed ? 'justify-center' : 'gap-3'} px-4 py-3 rounded-lg
                       text-red-600 dark:text-red-400
                       hover:bg-red-50 dark:hover:bg-red-900/20
                       transition-colors group relative`}
            >
              <ArrowRightOnRectangleIcon className="w-5 h-5 flex-shrink-0" />
              {!collapsed && <span className="font-medium">Sair</span>}

              {/* Tooltip para collapsed */}
              {collapsed && (
                <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 dark:bg-gray-700 
                               text-white text-sm rounded whitespace-nowrap
                               opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                  Sair
                  <div className="absolute top-1/2 -left-2 w-0 h-0 -translate-y-1/2
                                 border-t-4 border-t-transparent
                                 border-b-4 border-b-transparent
                                 border-r-4 border-r-gray-900 dark:border-r-gray-700" />
                </div>
              )}
            </button>
          </div>
        </div>
      </aside>
    </>
  )
}

export default Menu