import { useState, useEffect } from 'react'
import {
  ChartBarIcon,
  ChartPieIcon,
  ChevronDownIcon,
  XMarkIcon,
  DocumentChartBarIcon,
  TableCellsIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  UserGroupIcon,
  BuildingOfficeIcon,
  TruckIcon,
  CubeIcon,
  DocumentTextIcon,
  ClipboardDocumentListIcon,
  WrenchScrewdriverIcon,
  MapPinIcon,
  AcademicCapIcon,
  ShieldCheckIcon,
  CalendarIcon,
  ServerIcon,
  BoltIcon,
  ArchiveBoxIcon,
  HomeModernIcon,
} from '@heroicons/react/24/outline'
import { useAuth } from '../../context/AuthContext'
import { useCompany } from '../hooks/useCompany'

interface MenuItemProps {
  icon: React.ComponentType<{ className?: string }>
  label: string
  active?: boolean
  badge?: number
  onClick?: () => void
  path?: string
  children?: MenuItemProps[]
  collapsed?: boolean
  level?: number
}

function MenuItem({ 
  icon: Icon, 
  label, 
  active, 
  badge, 
  onClick, 
  path, 
  children, 
  collapsed, 
  level = 0,
  onToggle 
}: MenuItemProps & { onToggle?: (path: string, isOpen: boolean) => void }) {
  const [isOpen, setIsOpen] = useState(false)
  const [showPopover, setShowPopover] = useState(false)
  const [popoverPosition, setPopoverPosition] = useState({ top: 100, left: 0 })

  const hasChildren = children && children.length > 0
  const isActive = active

  const handleClick = () => {
    if (hasChildren && !collapsed) {
      const newState = !isOpen
      setIsOpen(newState)
      if (onToggle && path) {
        onToggle(path, newState)
      }
    } else if (path) {
      console.log('Navigating to:', path)
    }
    onClick?.()
  }

  const handleMouseEnter = (e: React.MouseEvent<HTMLDivElement>) => {
    if (collapsed && level === 0) {
      const rect = e.currentTarget.getBoundingClientRect()
      setPopoverPosition({
        top: rect.top + (rect.height / 2) - 20,
        left: rect.right + 8
      })
      setShowPopover(true)
    }
  }

  const paddingLeft = level === 0 ? 'px-4' : level === 1 ? 'pl-8' : 'pl-12'

  return (
    <>
      <div
        className="relative"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={() => collapsed && setShowPopover(false)}
      >
        <button
          onClick={handleClick}
          title={collapsed ? label : undefined}
          className={`w-full flex items-center ${collapsed && level === 0 ? 'justify-center' : 'justify-between'} ${paddingLeft} pr-4 py-2.5 rounded-lg
                     transition-colors group relative text-sm
                     ${isActive
              ? 'text-company-primary bg-company-primary bg-opacity-10'
              : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
            } cursor-pointer`}
        >
          <div className={`flex items-center ${collapsed && level === 0 ? '' : 'gap-3'}`}>
            <Icon className={`${level === 0 ? 'w-5 h-5' : 'w-4 h-4'} flex-shrink-0`} />
            {(!collapsed || level > 0) && <span className={`${level === 0 ? 'font-semibold' : level === 1 ? 'font-medium' : 'font-normal'}`}>{label}</span>}
          </div>

          {(!collapsed || level > 0) && (
            <div className="flex items-center gap-2">
              {badge && (
                <span className="px-2 py-0.5 text-xs font-semibold rounded-full 
                               bg-red-500 text-white">
                  {badge}
                </span>
              )}
              {hasChildren && (
                <ChevronDownIcon
                  className={`w-4 h-4 max-[450px]:w-3 max-[450px]:h-3 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                />
              )}
            </div>
          )}
        </button>

        {hasChildren && !collapsed && (
          <div
            className={`mt-1 space-y-0.5 overflow-hidden transition-all duration-300 ease-in-out
                       ${isOpen ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'}`}
          >
            {children.map((child, index) => (
              <div key={index} className="relative">
                <div className="absolute left-6 top-0 bottom-1/2 w-3 border-l-2 border-b-2 border-gray-300 dark:border-gray-600 rounded-bl-lg" />
                
                {index < children.length - 1 && (
                  <div className="absolute left-6 top-1/2 bottom-0 w-3 border-l-2 border-gray-300 dark:border-gray-600" />
                )}
                
                <div className="pl-9">
                  <MenuItem
                    {...child}
                    collapsed={collapsed}
                    level={level + 1}
                    onToggle={onToggle}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {collapsed && showPopover && level === 0 && (
        <div
          className="fixed min-w-[280px] max-w-[400px] z-[9999]
                     bg-white dark:bg-gray-800 rounded-lg shadow-xl
                     border border-gray-200 dark:border-gray-700
                     py-2 max-h-[80vh] overflow-y-auto"
          style={{
            top: `${popoverPosition.top - 70}px`,
            left: `${popoverPosition.left}px`
          }}
          onMouseEnter={() => setShowPopover(true)}
          onMouseLeave={() => setShowPopover(false)}
        >
          <div
            className="absolute -left-2 top-6 w-0 h-0 
                       border-t-8 border-t-transparent
                       border-r-8 border-r-gray-200 dark:border-r-gray-700
                       border-b-8 border-b-transparent"
          />
          <div
            className="absolute -left-[7px] top-6 w-0 h-0 
                       border-t-8 border-t-transparent
                       border-r-8 border-r-white dark:border-r-gray-800
                       border-b-8 border-b-transparent"
          />

          <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <Icon className="w-5 h-5 text-gray-700 dark:text-gray-300" />
              <span className="font-semibold text-gray-900 dark:text-gray-100">
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

          {hasChildren && (
            <div className="py-1">
              {children.map((child, index) => (
                <PopoverSubmenu key={index} item={child} />
              ))}
            </div>
          )}
        </div>
      )}
    </>
  )
}

function PopoverSubmenu({ item }: { item: MenuItemProps }) {
  const [isOpen, setIsOpen] = useState(false)
  const hasChildren = item.children && item.children.length > 0

  return (
    <div>
      <button
        onClick={() => {
          if (hasChildren) {
            setIsOpen(!isOpen)
          } else if (item.path) {
            console.log('Navigating to:', item.path)
          }
          item.onClick?.()
        }}
        className="w-full flex items-center justify-between gap-3 px-4 py-2.5
                   text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700
                   transition-colors text-left"
      >
        <div className="flex items-center gap-3">
          <item.icon className="w-4 h-4 flex-shrink-0" />
          <span className="text-sm font-medium">{item.label}</span>
        </div>
        {hasChildren && (
          <ChevronDownIcon className={`w-4 h-4 max-[450px]:w-3 max-[450px]:h-3 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        )}
      </button>

      {hasChildren && (
        <div
          className={`overflow-hidden transition-all duration-300 ease-in-out
                     ${isOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}
        >
          <div className="bg-gray-50 dark:bg-gray-900/50">
            {item.children!.map((subitem, index) => (
              <div key={index} className="relative">
                <div className="absolute left-6 top-0 bottom-1/2 w-3 border-l-2 border-b-2 border-gray-300 dark:border-gray-600 rounded-bl-lg" />
                
                {index < item.children!.length - 1 && (
                  <div className="absolute left-6 top-1/2 bottom-0 w-3 border-l-2 border-gray-300 dark:border-gray-600" />
                )}
                
                <button
                  onClick={() => {
                    if (subitem.path) console.log('Navigating to:', subitem.path)
                    subitem.onClick?.()
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2 pl-12
                           text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800
                           transition-colors text-left relative z-10"
                >
                  <subitem.icon className="w-3.5 h-3.5 flex-shrink-0" />
                  <span className="text-sm">{subitem.label}</span>
                </button>
              </div>
            ))}
          </div>
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
  const [collapsed, setCollapsed] = useState(false)
  const [openItems, setOpenItems] = useState<Set<string>>(new Set())
  const { company } = useCompany()
  const { user } = useAuth()

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

  const handleItemToggle = (path: string, isOpenState: boolean) => {
    setOpenItems(prev => {
      const newSet = new Set(prev)
      if (isOpenState) {
        newSet.add(path)
      } else {
        newSet.delete(path)
      }
      return newSet
    })
  }

  const getMenuWidth = (): string => {
    if (collapsed) return 'lg:w-20'
    
    let maxDepth = 0
    openItems.forEach(item => {
      const depth = item.split('/').filter(Boolean).length
      maxDepth = Math.max(maxDepth, depth)
    })

    const widths = ['w-80', 'w-[400px]', 'w-[480px]', 'w-[560px]']
    return widths[Math.min(maxDepth, widths.length - 1)] || 'w-80'
  }

  const menuItems: MenuItemProps[] = [
    {
      icon: ChartBarIcon,
      label: 'Dashboard',
      path: '/',
    },
    {
      icon: CubeIcon,
      label: 'Assets',
      path: '/assets',
      children: [
        {
          icon: DocumentTextIcon,
          label: 'ISO 55000 Standards',
          path: '/assets/iso',
          children: [
            { icon: ChartBarIcon, label: 'ISO 55000 Overview', path: '/assets/iso/overview' },
            { icon: TableCellsIcon, label: 'ISO 55001 Requirements', path: '/assets/iso/requirements' },
            { icon: DocumentTextIcon, label: 'ISO 55002 Guidelines', path: '/assets/iso/guidelines' },
            { icon: DocumentChartBarIcon, label: 'Asset Management Policy', path: '/assets/iso/policy' },
          ]
        },
        {
          icon: ClipboardDocumentListIcon,
          label: 'Work Orders',
          path: '/assets/work-orders',
          children: [
            { icon: ChartBarIcon, label: 'Create Work Order', path: '/assets/work-orders/create' },
            { icon: TableCellsIcon, label: 'Pending Orders', path: '/assets/work-orders/pending' },
            { icon: DocumentTextIcon, label: 'Completed Orders', path: '/assets/work-orders/completed' },
            { icon: CalendarIcon, label: 'Scheduled Maintenance', path: '/assets/work-orders/scheduled' },
          ]
        },
        {
          icon: ClipboardDocumentListIcon,
          label: 'Inspections',
          path: '/assets/inspections',
          children: [
            { icon: CalendarIcon, label: 'Inspection Schedule', path: '/assets/inspections/schedule' },
            { icon: DocumentChartBarIcon, label: 'Inspection Reports', path: '/assets/inspections/reports' },
            { icon: DocumentTextIcon, label: 'Templates', path: '/assets/inspections/templates' },
            { icon: ShieldCheckIcon, label: 'Compliance Tracking', path: '/assets/inspections/compliance' },
          ]
        },
        {
          icon: MapPinIcon,
          label: 'Locations',
          path: '/assets/locations',
          children: [
            { icon: MapPinIcon, label: 'Location Map', path: '/assets/locations/map' },
            { icon: TableCellsIcon, label: 'Location Hierarchy', path: '/assets/locations/hierarchy' },
            { icon: CubeIcon, label: 'Assets by Location', path: '/assets/locations/assets' },
          ]
        },
        {
          icon: CubeIcon,
          label: 'Asset Lifecycle',
          path: '/assets/lifecycle',
          children: [
            { icon: DocumentTextIcon, label: 'Asset Registry', path: '/assets/lifecycle/registry' },
          ]
        },
      ],
    },
    {
      icon: UserGroupIcon,
      label: 'People',
      path: '/people',
      children: [
        {
          icon: UserGroupIcon,
          label: 'Employee Management',
          path: '/people/employees',
          children: [
            { icon: UserGroupIcon, label: 'Employee Directory', path: '/people/employees/directory' },
            { icon: ChartBarIcon, label: 'Onboarding', path: '/people/employees/onboarding' },
            { icon: TableCellsIcon, label: 'Offboarding', path: '/people/employees/offboarding' },
            { icon: DocumentTextIcon, label: 'Personnel Records', path: '/people/employees/records' },
          ]
        },
        {
          icon: AcademicCapIcon,
          label: 'Training & Certification',
          path: '/people/training',
          children: [
            { icon: AcademicCapIcon, label: 'Training Programs', path: '/people/training/programs' },
            { icon: CalendarIcon, label: 'Training Schedule', path: '/people/training/schedule' },
            { icon: DocumentTextIcon, label: 'Certifications', path: '/people/training/certifications' },
            { icon: TableCellsIcon, label: 'Skills Matrix', path: '/people/training/skills' },
          ]
        },
        {
          icon: ShieldCheckIcon,
          label: 'Safety & Health',
          path: '/people/safety',
          children: [
            { icon: DocumentChartBarIcon, label: 'Incident Reports', path: '/people/safety/incidents' },
            { icon: AcademicCapIcon, label: 'Safety Training', path: '/people/safety/training' },
            { icon: ShieldCheckIcon, label: 'PPE Management', path: '/people/safety/ppe' },
            { icon: ChartBarIcon, label: 'Health Monitoring', path: '/people/safety/health' },
          ]
        },
        {
          icon: CalendarIcon,
          label: 'Scheduling',
          path: '/people/scheduling',
          children: [
            { icon: CalendarIcon, label: 'Shift Planning', path: '/people/scheduling/shifts' },
            { icon: TableCellsIcon, label: 'Time & Attendance', path: '/people/scheduling/attendance' },
            { icon: DocumentTextIcon, label: 'Leave Management', path: '/people/scheduling/leave' },
            { icon: ChartBarIcon, label: 'Performance Reviews', path: '/people/scheduling/reviews' },
          ]
        },
      ],
    },
    {
      icon: BuildingOfficeIcon,
      label: 'Infrastructure',
      path: '/infrastructure',
      children: [
        {
          icon: HomeModernIcon,
          label: 'Facilities Management',
          path: '/infrastructure/facilities',
          children: [
            { icon: BuildingOfficeIcon, label: 'Buildings', path: '/infrastructure/facilities/buildings' },
            { icon: BoltIcon, label: 'Utilities', path: '/infrastructure/facilities/utilities' },
            { icon: WrenchScrewdriverIcon, label: 'HVAC Systems', path: '/infrastructure/facilities/hvac' },
            { icon: ShieldCheckIcon, label: 'Security Systems', path: '/infrastructure/facilities/security' },
          ]
        },
        {
          icon: WrenchScrewdriverIcon,
          label: 'Equipment & Machinery',
          path: '/infrastructure/equipment',
          children: [
            { icon: CubeIcon, label: 'Equipment Inventory', path: '/infrastructure/equipment/inventory' },
            { icon: CalendarIcon, label: 'Maintenance Schedule', path: '/infrastructure/equipment/maintenance' },
            { icon: WrenchScrewdriverIcon, label: 'Calibration', path: '/infrastructure/equipment/calibration' },
            { icon: ChartBarIcon, label: 'Downtime Tracking', path: '/infrastructure/equipment/downtime' },
          ]
        },
        {
          icon: ServerIcon,
          label: 'IT Infrastructure',
          path: '/infrastructure/it',
          children: [
            { icon: ServerIcon, label: 'Network', path: '/infrastructure/it/network' },
            { icon: ServerIcon, label: 'Servers', path: '/infrastructure/it/servers' },
            { icon: CubeIcon, label: 'Devices', path: '/infrastructure/it/devices' },
            { icon: DocumentTextIcon, label: 'Software Licenses', path: '/infrastructure/it/licenses' },
          ]
        },
        {
          icon: BoltIcon,
          label: 'Energy Management',
          path: '/infrastructure/energy',
          children: [
            { icon: ChartBarIcon, label: 'Consumption Monitoring', path: '/infrastructure/energy/consumption' },
            { icon: BoltIcon, label: 'Efficiency Programs', path: '/infrastructure/energy/efficiency' },
            { icon: BoltIcon, label: 'Renewable Sources', path: '/infrastructure/energy/renewable' },
          ]
        },
        {
          icon: DocumentChartBarIcon,
          label: 'Infrastructure Projects',
          path: '/infrastructure/projects'
        },
      ],
    },
    {
      icon: TruckIcon,
      label: 'Logistics',
      path: '/logistics',
      children: [
        {
          icon: ArchiveBoxIcon,
          label: 'Inventory Management',
          path: '/logistics/inventory',
          children: [
            { icon: ChartBarIcon, label: 'Stock Levels', path: '/logistics/inventory/stock' },
            { icon: DocumentTextIcon, label: 'Purchase Orders', path: '/logistics/inventory/purchase' },
            { icon: ArchiveBoxIcon, label: 'Receiving', path: '/logistics/inventory/receiving' },
            { icon: TableCellsIcon, label: 'Cycle Counting', path: '/logistics/inventory/counting' },
          ]
        },
        {
          icon: HomeModernIcon,
          label: 'Warehouse Management',
          path: '/logistics/warehouse',
          children: [
            { icon: MapPinIcon, label: 'Warehouse Layout', path: '/logistics/warehouse/layout' },
            { icon: ArchiveBoxIcon, label: 'Picking & Packing', path: '/logistics/warehouse/picking' },
            { icon: TruckIcon, label: 'Shipping', path: '/logistics/warehouse/shipping' },
            { icon: DocumentTextIcon, label: 'Returns', path: '/logistics/warehouse/returns' },
          ]
        },
        {
          icon: TruckIcon,
          label: 'Transportation',
          path: '/logistics/transportation',
          children: [
            { icon: TruckIcon, label: 'Fleet Management', path: '/logistics/transportation/fleet' },
            { icon: MapPinIcon, label: 'Route Planning', path: '/logistics/transportation/routes' },
            { icon: ChartBarIcon, label: 'Shipment Tracking', path: '/logistics/transportation/tracking' },
            { icon: DocumentTextIcon, label: 'Carrier Management', path: '/logistics/transportation/carriers' },
          ]
        },
        {
          icon: DocumentChartBarIcon,
          label: 'Supply Chain',
          path: '/logistics/supply',
          children: [
            { icon: UserGroupIcon, label: 'Supplier Management', path: '/logistics/supply/suppliers' },
            { icon: DocumentTextIcon, label: 'Procurement', path: '/logistics/supply/procurement' },
            { icon: DocumentTextIcon, label: 'Contracts', path: '/logistics/supply/contracts' },
            { icon: ChartBarIcon, label: 'Performance Metrics', path: '/logistics/supply/metrics' },
          ]
        },
        {
          icon: ChartPieIcon,
          label: 'Logistics Analytics',
          path: '/logistics/analytics'
        },
      ],
    },
  ]

  const menuWidth = getMenuWidth()

  return (
    <>
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed lg:static top-0 left-0 z-40 h-screen lg:h-auto
                   bg-white dark:bg-gray-900 
                   border-r border-gray-200 dark:border-gray-800
                   transition-all duration-300 lg:translate-x-0 flex-shrink-0
                   ${isOpen ? 'translate-x-0' : '-translate-x-full'}
                   ${menuWidth}`}
      >
        <div className="flex flex-col h-full lg:h-screen lg:sticky lg:top-0">
          <div className="h-16 flex items-center justify-between px-4 border-b 
                         border-gray-200 dark:border-gray-800 flex-shrink-0">
            {!collapsed && (
              <h2 className="text-lg font-bold truncate text-company-primary">
                {company?.full_name || 'Menu'}
              </h2>
            )}

            <div className="flex items-center gap-2 ml-auto">
              <button
                onClick={() => setCollapsed(!collapsed)}
                title={collapsed ? 'Expandir menu' : 'Recolher menu'}
                className="hidden lg:block p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800
                         transition-colors flex-shrink-0 text-company-primary"
              >
                {collapsed ? (
                  <ChevronRightIcon className="w-5 h-5" />
                ) : (
                  <ChevronLeftIcon className="w-5 h-5" />
                )}
              </button>

              <button
                onClick={onClose}
                title="Fechar menu"
                className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 flex-shrink-0"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>
          </div>

          {!collapsed && (
            <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-company-primary flex items-center justify-center flex-shrink-0">
                  <span className="text-white dark:text-gray-100 font-semibold text-sm">
                    {user?.name?.split(' ').map(n => n.charAt(0).toUpperCase()).join('').slice(0, 2) || 'U'}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                    {user?.name}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                    {user?.email}
                  </p>
                </div>
              </div>
            </div>
          )}

          <nav className="flex-1 overflow-y-auto overflow-x-hidden p-4 space-y-1">
            {menuItems.map((item, index) => (
              <MenuItem
                key={index}
                {...item}
                collapsed={collapsed}
                onToggle={handleItemToggle}
              />
            ))}
          </nav>
        </div>
      </aside>
    </>
  )
}

export default Menu