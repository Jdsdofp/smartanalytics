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
  MapPinIcon,
  AcademicCapIcon,
  ShieldCheckIcon,
  CalendarIcon,
  BellAlertIcon,
  CurrencyDollarIcon,
  ShieldExclamationIcon,
  DocumentCheckIcon,
  ClockIcon,
} from '@heroicons/react/24/outline'
import { useAuth } from '../../context/AuthContext'
import { useCompany } from '../../hooks/useCompany'
import { useNavigate, useLocation } from 'react-router-dom'

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
  disabled?: boolean
  hidden?: boolean
}

function MenuItem({
  icon: Icon,
  label,
  badge,
  onClick,
  path,
  children,
  collapsed,
  level = 0,
  disabled = false,
  hidden = false,
  onToggle,
  currentPath,
  openItems
}: MenuItemProps & {
  onToggle?: (path: string, isOpen: boolean) => void,
  currentPath?: string,
  openItems?: Set<string>
}) {
  const [showPopover, setShowPopover] = useState(false)
  const [popoverPosition, setPopoverPosition] = useState({ top: 100, left: 0 })

  const hasChildren = children && children.length > 0
  const isActive = path === currentPath
  const isOpen = path ? openItems?.has(path) : false

  if (hidden) return null

  const navigate = useNavigate()

  const handleClick = () => {
    if (disabled) return

    if (hasChildren && !collapsed) {
      const newState = !isOpen
      if (onToggle && path) {
        onToggle(path, newState)
      }
    } else if (path) {
      navigate(path)
    }
    onClick?.()
  }

  const handleMouseEnter = (e: React.MouseEvent<HTMLDivElement>) => {
    if (collapsed && level === 0 && !disabled) {
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
          disabled={disabled}
          className={`w-full flex items-center ${collapsed && level === 0 ? 'justify-center' : 'justify-between'} ${paddingLeft} pr-4 py-2.5 rounded-lg
                     transition-colors group relative text-sm
                     ${disabled
              ? 'text-gray-400 dark:text-gray-600 cursor-not-allowed opacity-50'
              : isActive
                ? 'text-white bg-company-primary'
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer'
            }`}
        >
          <div className={`flex items-center ${collapsed && level === 0 ? '' : 'gap-3'}`}>
            <Icon className={`${level === 0 ? 'w-5 h-5' : 'w-4 h-4'} flex-shrink-0`} />
            {(!collapsed || level > 0) && <span className={`${level === 0 ? 'font-semibold' : level === 1 ? 'font-medium' : 'font-normal text-left'}`}>{label}</span>}
          </div>

          {(!collapsed || level > 0) && (
            <div className="flex items-center gap-2">
              {badge && (
                <span className="px-2 py-0.5 text-xs font-semibold rounded-full 
                               bg-red-500 text-white">
                  {badge}
                </span>
              )}
              {hasChildren && !disabled && (
                <ChevronDownIcon
                  className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
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
            {children.filter(child => !child.hidden).map((child, index) => (
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
                    currentPath={currentPath}
                    openItems={openItems}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {collapsed && showPopover && level === 0 && !disabled && (
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
          <div className="absolute -left-2 top-6 w-0 h-0 border-t-8 border-t-transparent border-r-8 border-r-gray-200 dark:border-r-gray-700 border-b-8 border-b-transparent" />
          <div className="absolute -left-[7px] top-6 w-0 h-0 border-t-8 border-t-transparent border-r-8 border-r-white dark:border-r-gray-800 border-b-8 border-b-transparent" />

          <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <Icon className="w-5 h-5 text-gray-700 dark:text-gray-300" />
              <span className="font-semibold text-gray-900 dark:text-gray-100">{label}</span>
              {badge && <span className="ml-auto px-2 py-1 text-xs font-semibold rounded-full bg-red-500 text-white">{badge}</span>}
            </div>
          </div>

          {hasChildren && (
            <div className="py-1">
              {children.map((child, index) => (
                <PopoverSubmenu key={index} item={child} currentPath={currentPath} />
              ))}
            </div>
          )}
        </div>
      )}
    </>
  )
}

function PopoverSubmenu({ item, currentPath }: { item: MenuItemProps, currentPath?: string }) {
  const [isOpen, setIsOpen] = useState(false)
  if (item.hidden) return null
  const hasChildren = item.children && item.children.length > 0
  const navigate = useNavigate()
  const isActive = item.path === currentPath

  return (
    <div>
      <button
        onClick={() => {
          if (item.disabled) return

          if (hasChildren) {
            setIsOpen(!isOpen)
          } else if (item.path) {
            navigate(item.path)
          }
          item.onClick?.()
        }}
        disabled={item.disabled}
        className={`w-full flex items-center justify-between gap-3 px-4 py-2.5 transition-colors text-left
                   ${item.disabled
            ? 'text-gray-400 dark:text-gray-600 cursor-not-allowed opacity-50'
            : isActive
              ? 'text-company-primary bg-company-primary bg-opacity-10'
              : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
          }`}
      >
        <div className="flex items-center gap-3">
          <item.icon className="w-4 h-4 flex-shrink-0" />
          <span className="text-sm font-medium">{item.label}</span>
        </div>
        {hasChildren && !item.disabled && <ChevronDownIcon className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />}
      </button>

      {hasChildren && (
        <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}>
          <div className="bg-gray-50 dark:bg-gray-900/50">
            {item.children!.map((subitem, index) => {
              const isSubActive = subitem.path === currentPath
              return (
                <div key={index} className="relative">
                  <div className="absolute left-6 top-0 bottom-1/2 w-3 border-l-2 border-b-2 border-gray-300 dark:border-gray-600 rounded-bl-lg" />
                  {index < item.children!.length - 1 && <div className="absolute left-6 top-1/2 bottom-0 w-3 border-l-2 border-gray-300 dark:border-gray-600" />}
                  <button
                    onClick={() => {
                      if (subitem.disabled) return
                      if (subitem.path) {
                        navigate(subitem.path)
                      }
                      subitem.onClick?.()
                    }}
                    disabled={subitem.disabled}
                    className={`w-full flex items-center gap-3 px-4 py-2 pl-12 transition-colors text-left relative z-10
                               ${subitem.disabled
                        ? 'text-gray-400 dark:text-gray-600 cursor-not-allowed opacity-50'
                        : isSubActive
                          ? 'text-company-primary bg-company-primary bg-opacity-10'
                          : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                      }`}
                  >
                    <subitem.icon className="w-3.5 h-3.5 flex-shrink-0" />
                    <span className="text-sm">{subitem.label}</span>
                  </button>
                </div>
              )
            })}
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

// Função auxiliar para encontrar todos os pais de um caminho
const findParentPaths = (items: MenuItemProps[], targetPath: string, parentPaths: string[] = []): string[] => {
  for (const item of items) {
    if (item.path === targetPath) {
      return parentPaths
    }

    if (item.children && item.path) {
      const found = findParentPaths(item.children, targetPath, [...parentPaths, item.path])
      if (found.length > 0 || item.children.some(child => child.path === targetPath)) {
        return item.path ? [...parentPaths, item.path] : parentPaths
      }
    }
  }
  return []
}

function Menu({ isOpen = true, onClose }: MenuProps) {
  const location = useLocation()
  const { company } = useCompany()
  const { user } = useAuth()

  const [collapsed, setCollapsed] = useState(() => {
    const saved = localStorage.getItem('menuCollapsed')
    return saved ? JSON.parse(saved) : false
  })

  const [openItems, setOpenItems] = useState<Set<string>>(() => {
    const saved = localStorage.getItem('menuOpenItems')
    return saved ? new Set(JSON.parse(saved)) : new Set()
  })

  const menuItems: MenuItemProps[] = [
    {
      icon: ChartBarIcon, label: 'Dashboard', path: '/'
    },
    {
      icon: CubeIcon, label: 'Assets Analytics', path: '/MN0400_002',
      children: [
        {
          icon: DocumentTextIcon, label: 'ISO 55000 Standards', path: '/MN0400_010', children: [
            { icon: ChartBarIcon, label: 'ISO 55000 Compliance Overview', path: '/MN0400_011' },
            { icon: TableCellsIcon, label: 'ISO 55001 Requirements Status', path: '/MN0400_012' },
            { icon: DocumentChartBarIcon, label: 'Asset Management System Maturity', path: '/MN0400_013' },
            { icon: DocumentTextIcon, label: 'ISO 55002 Gap Analysis', path: '/MN0400_014', disabled: true },
            { icon: DocumentTextIcon, label: 'Strategic Asset Management Plan', path: '/MN0400_015', disabled: true }
          ]
        },
        {
          icon: ChartPieIcon, label: 'Financial & Cost Analysis', path: '/MN0400_020', disabled: true,
            children: [
            { icon: ChartBarIcon, label: 'Total Cost of Ownership (TCO)', path: '/MN0400_021' },
            { icon: ChartPieIcon, label: 'Capital Asset Distribution', path: '/MN0400_022', disabled: true },
            { icon: ChartBarIcon, label: 'Asset Lifecycle Cost Analysis', path: '/MN0400_023', disabled: true },
            { icon: ChartBarIcon, label: 'ROI & Payback Period', path: '/MN0400_024', disabled: true },
            { icon: DocumentTextIcon, label: 'Asset Depreciation Trends', path: '/MN0400_025', disabled: true },
            { icon: DocumentTextIcon, label: 'Budget vs Actual Analysis', path: '/MN0400_026', disabled: true }
          ]
        },
        {
          icon: ShieldCheckIcon, label: 'Performance & Risk', path: '/MN0400_030', disabled: true, children: [
            { icon: ChartBarIcon, label: 'Asset Health Score', path: '/MN0400_031', disabled: true },
            { icon: TableCellsIcon, label: 'Asset Criticality Matrix', path: '/MN0400_032', disabled: true },
            { icon: ChartBarIcon, label: 'Risk Exposure by Category', path: '/MN0400_033', disabled: true },
            { icon: DocumentChartBarIcon, label: 'Failure Mode Analysis', path: '/MN0400_034', disabled: true },
            { icon: DocumentTextIcon, label: 'End-of-Life Forecast', path: '/MN0400_035', disabled: true }
          ]
        },
        {
          icon: DocumentChartBarIcon, label: 'Strategic Planning', path: '/MN0400_040', disabled: true, children: [
            { icon: ChartPieIcon, label: 'Asset Portfolio Overview', path: '/MN0400_041', disabled: true },
            { icon: MapPinIcon, label: 'Assets by Location Hierarchy', path: '/MN0400_042', disabled: true },
            { icon: ChartBarIcon, label: 'Capacity Planning & Utilization', path: '/MN0400_043', disabled: true },
            { icon: DocumentTextIcon, label: 'Asset Replacement Strategy', path: '/MN0400_044', disabled: true },
            { icon: DocumentTextIcon, label: 'Long-term Investment Forecast', path: '/MN0400_045', disabled: true }
          ]
        }
      ]
    },
    {
      icon: UserGroupIcon, label: 'People Analytics', path: '/MN0400_003',
      children: [
        {
          icon: UserGroupIcon, label: 'Workforce Planning', path: '/MN0400_110', children: [
            { icon: ChartPieIcon, label: 'Workforce Composition', path: '/MN0400_111' },
            { icon: MapPinIcon, label: 'Headcount by Location & Role', path: '/MN0400_112', disabled: true },
            { icon: ChartBarIcon, label: 'Turnover & Retention Analysis', path: '/MN0400_113', disabled: true },
            { icon: DocumentTextIcon, label: 'Succession Planning Readiness', path: '/MN0400_114', disabled: true }
          ]
        },
        {
          icon: AcademicCapIcon, label: 'Talent & Development', path: '/MN0400_120', disabled: true, children: [
            { icon: ChartBarIcon, label: 'Onboarding Cycle Time', path: '/MN0400_121', disabled: true },
            { icon: TableCellsIcon, label: 'Competency Gap Analysis', path: '/MN0400_122', disabled: true },
            { icon: ChartBarIcon, label: 'Training Effectiveness', path: '/MN0400_123', disabled: true },
            { icon: DocumentTextIcon, label: 'Certification Compliance Status', path: '/MN0400_124', disabled: true },
            { icon: DocumentTextIcon, label: 'Skills Inventory Matrix', path: '/MN0400_125', disabled: true }
          ]
        },
        {
          icon: ShieldCheckIcon, label: 'Safety & Wellbeing', path: '/MN0400_130', disabled: true, children: [
            { icon: ChartBarIcon, label: 'Safety Leading Indicators', path: '/MN0400_131', disabled: true },
            { icon: ChartBarIcon, label: 'Incident Rate Trends', path: '/MN0400_132', disabled: true },
            { icon: DocumentChartBarIcon, label: 'Near-Miss Analysis', path: '/MN0400_133', disabled: true },
            { icon: DocumentTextIcon, label: 'Safety Compliance Score', path: '/MN0400_134', disabled: true }
          ]
        },
        {
          icon: ChartPieIcon, label: 'Cost & Productivity', path: '/MN0400_140', disabled: true, children: [
            { icon: ChartPieIcon, label: 'Labor Cost Distribution', path: '/MN0400_141', disabled: true },
            { icon: ChartBarIcon, label: 'Productivity Metrics', path: '/MN0400_142', disabled: true },
            { icon: ChartBarIcon, label: 'Overtime Analysis', path: '/MN0400_143', disabled: true },
            { icon: DocumentTextIcon, label: 'Cost per Employee by Location', path: '/MN0400_144', disabled: true }
          ]
        }
      ]
    },
    {
      icon: BuildingOfficeIcon, label: 'Infrastructure Analytics', path: '/MN0400_004', hidden: true,
      children: []
    },
    {
      icon: TruckIcon, label: 'Logistics Analytics', path: '/MN0400_005', hidden: true,
      children: []
    },
    {
      icon: ShieldCheckIcon,
      label: 'Certificates Analytics',
      path: '/MN0400_006',
      children: [{
        icon: DocumentCheckIcon, label: 'Compliance & Status', path: '/MN0400_410',
        children: [
          { icon: ChartPieIcon, label: 'Certificate Status Overview', path: '/MN0400_411' },
          { icon: ChartBarIcon, label: 'Compliance Rate by Category', path: '/MN0400_412' },
          { icon: TableCellsIcon, label: 'Superview Certificates', path: '/MN0400_413' },
          { icon: DocumentTextIcon, label: 'Non-Compliance Report', path: '/MN0400_414', disabled: true },
          { icon: ChartBarIcon, label: 'Renewal Success Rate', path: '/MN0400_415', disabled: true }
        ]
      },
      {
        icon: CalendarIcon,
        label: 'Expiration & Renewal',
        path: '/MN0400_420',
        disabled: true,
        children: [
          { icon: ChartBarIcon, label: 'Expiring Certificates Timeline', path: '/MN0400_421' },
          { icon: ClockIcon, label: 'Days to Expiration Analysis', path: '/MN0400_422' },
          { icon: ChartPieIcon, label: 'Renewal Pipeline Status', path: '/MN0400_423', disabled: true },
          { icon: DocumentTextIcon, label: 'Renewal Cycle Time', path: '/MN0400_424', disabled: true },
          { icon: BellAlertIcon, label: 'Alert & Notification History', path: '/MN0400_425', disabled: true }
        ]
      },
      {
        icon: BuildingOfficeIcon,
        label: 'Organization & Distribution',
        path: '/MN0400_430',
        disabled: true,
        children: [
          { icon: MapPinIcon, label: 'Certificates by Location', path: '/MN0400_431' },
          { icon: UserGroupIcon, label: 'Certificates by Department', path: '/MN0400_432', disabled: true },
          { icon: ChartBarIcon, label: 'Certificate Holder Analysis', path: '/MN0400_433', disabled: true },
          { icon: TableCellsIcon, label: 'Asset-Certificate Mapping', path: '/MN0400_434', disabled: true },
          { icon: DocumentTextIcon, label: 'Vendor Certificate Tracking', path: '/MN0400_435', disabled: true }
        ]
      },
      {
        icon: ChartBarIcon,
        label: 'Performance & Trends',
        path: '/MN0400_440',
        disabled: true,
        children: [
          { icon: ChartBarIcon, label: 'Certificate Issuance Trends', path: '/MN0400_441', disabled: true },
          { icon: ChartPieIcon, label: 'Certificate Type Distribution', path: '/MN0400_442', disabled: true },
          { icon: DocumentChartBarIcon, label: 'Processing Time Analysis', path: '/MN0400_443', disabled: true },
          { icon: ChartBarIcon, label: 'Audit Trail & Changes', path: '/MN0400_444', disabled: true },
          { icon: DocumentTextIcon, label: 'Certificate Lifecycle KPIs', path: '/MN0400_445', disabled: true }
        ]
      },
      {
        icon: CurrencyDollarIcon,
        label: 'Cost & Investment',
        path: '/MN0400_450',
        disabled: true,
        children: [
          { icon: ChartPieIcon, label: 'Certification Cost Analysis', path: '/MN0400_451', disabled: true },
          { icon: ChartBarIcon, label: 'Cost per Certificate Type', path: '/MN0400_452', disabled: true },
          { icon: DocumentTextIcon, label: 'ROI on Certifications', path: '/MN0400_453', disabled: true },
          { icon: ChartBarIcon, label: 'Budget vs Actual Spend', path: '/MN0400_454', disabled: true },
          { icon: DocumentTextIcon, label: 'Future Investment Forecast', path: '/MN0400_455', disabled: true }
        ]
      },
      {
        icon: ShieldExclamationIcon,
        label: 'Risk & Quality',
        path: '/MN0400_460',
        disabled: true,
        children: [
          { icon: ChartBarIcon, label: 'Risk Score by Certificate', path: '/MN0400_461', disabled: true },
          { icon: TableCellsIcon, label: 'Critical Certificate Register', path: '/MN0400_462', disabled: true },
          { icon: DocumentChartBarIcon, label: 'Quality Assurance Metrics', path: '/MN0400_463', disabled: true },
          { icon: ChartBarIcon, label: 'Regulatory Compliance Score', path: '/MN0400_464', disabled: true },
          { icon: DocumentTextIcon, label: 'Incident & Violation Tracking', path: '/MN0400_465', disabled: true }
        ]
      }
      ]
    }
  ]


  //  const menuItems: MenuItemProps[] = [
  //   {
  //     icon: ChartBarIcon, label: 'Dashboard', path: '/'
  //   },
  //   {
  //     icon: CubeIcon, label: 'Assets Analytics', path: '/MN0400_002',
  //     children: [
  //       {
  //         icon: DocumentTextIcon, label: 'ISO 55000 Standards', path: '/MN0400_010', children: [
  //           { icon: ChartBarIcon, label: 'ISO 55000 Compliance Overview', path: '/MN0400_011' },
  //           { icon: TableCellsIcon, label: 'ISO 55001 Requirements Status', path: '/MN0400_012', disabled: false },
  //           { icon: DocumentChartBarIcon, label: 'Asset Management System Maturity', path: '/MN0400_013', disabled: false },
  //           { icon: DocumentTextIcon, label: 'ISO 55002 Gap Analysis', path: '/MN0400_014', disabled: true },
  //           { icon: DocumentTextIcon, label: 'Strategic Asset Management Plan', path: '/MN0400_015', disabled: true }
  //         ]
  //       },
  //       {
  //         icon: ChartPieIcon, label: 'Financial & Cost Analysis', path: '/MN0400_020', children: [
  //           { icon: ChartBarIcon, label: 'Total Cost of Ownership (TCO)', path: '/MN0400_021', disabled: false },
  //           { icon: ChartPieIcon, label: 'Capital Asset Distribution', path: '/MN0400_022', disabled: true },
  //           { icon: ChartBarIcon, label: 'Asset Lifecycle Cost Analysis', path: '/MN0400_023', disabled: true },
  //           { icon: ChartBarIcon, label: 'ROI & Payback Period', path: '/MN0400_024', disabled: true },
  //           { icon: DocumentTextIcon, label: 'Asset Depreciation Trends', path: '/MN0400_025', disabled: true },
  //           { icon: DocumentTextIcon, label: 'Budget vs Actual Analysis', path: '/MN0400_026', disabled: true }
  //         ]
  //       },
  //       {
  //         icon: ShieldCheckIcon, label: 'Performance & Risk', path: '/MN0400_030', children: [
  //           { icon: ChartBarIcon, label: 'Asset Health Score', path: '/MN0400_031', disabled: true },
  //           { icon: TableCellsIcon, label: 'Asset Criticality Matrix', path: '/MN0400_032', disabled: true },
  //           { icon: ChartBarIcon, label: 'Risk Exposure by Category', path: '/MN0400_033', disabled: true },
  //           { icon: DocumentChartBarIcon, label: 'Failure Mode Analysis', path: '/MN0400_034', disabled: true },
  //           { icon: DocumentTextIcon, label: 'End-of-Life Forecast', path: '/MN0400_035', disabled: true }
  //         ]
  //       },
  //       {
  //         icon: DocumentChartBarIcon, label: 'Strategic Planning', path: '/MN0400_040', children: [
  //           { icon: ChartPieIcon, label: 'Asset Portfolio Overview', path: '/MN0400_041', disabled: true },
  //           { icon: MapPinIcon, label: 'Assets by Location Hierarchy', path: '/MN0400_042', disabled: true },
  //           { icon: ChartBarIcon, label: 'Capacity Planning & Utilization', path: '/MN0400_043', disabled: true },
  //           { icon: DocumentTextIcon, label: 'Asset Replacement Strategy', path: '/MN0400_044', disabled: true },
  //           { icon: DocumentTextIcon, label: 'Long-term Investment Forecast', path: '/MN0400_045', disabled: true }
  //         ]
  //       }
  //     ]
  //   },
  //   {
  //     icon: UserGroupIcon, label: 'People Analytics', path: '/MN0400_003',
  //     children: [
  //       {
  //         icon: UserGroupIcon, label: 'Workforce Planning', path: '/MN0400_110', children: [
  //           { icon: ChartPieIcon, label: 'Workforce Composition', path: '/MN0400_111' },
  //           { icon: MapPinIcon, label: 'Headcount by Location & Role', path: '/MN0400_112', disabled: true },
  //           { icon: ChartBarIcon, label: 'Turnover & Retention Analysis', path: '/MN0400_113', disabled: true },
  //           { icon: DocumentTextIcon, label: 'Succession Planning Readiness', path: '/MN0400_114', disabled: true }
  //         ]
  //       },
  //       {
  //         icon: AcademicCapIcon, label: 'Talent & Development', path: '/MN0400_120', children: [
  //           { icon: ChartBarIcon, label: 'Onboarding Cycle Time', path: '/MN0400_121', disabled: true },
  //           { icon: TableCellsIcon, label: 'Competency Gap Analysis', path: '/MN0400_122', disabled: true },
  //           { icon: ChartBarIcon, label: 'Training Effectiveness', path: '/MN0400_123', disabled: true },
  //           { icon: DocumentTextIcon, label: 'Certification Compliance Status', path: '/MN0400_124', disabled: true },
  //           { icon: DocumentTextIcon, label: 'Skills Inventory Matrix', path: '/MN0400_125', disabled: true }
  //         ]
  //       },
  //       {
  //         icon: ShieldCheckIcon, label: 'Safety & Wellbeing', path: '/MN0400_130', children: [
  //           { icon: ChartBarIcon, label: 'Safety Leading Indicators', path: '/MN0400_131', disabled: true },
  //           { icon: ChartBarIcon, label: 'Incident Rate Trends', path: '/MN0400_132', disabled: true },
  //           { icon: DocumentChartBarIcon, label: 'Near-Miss Analysis', path: '/MN0400_133', disabled: true },
  //           { icon: DocumentTextIcon, label: 'Safety Compliance Score', path: '/MN0400_134', disabled: true }
  //         ]
  //       },
  //       {
  //         icon: ChartPieIcon, label: 'Cost & Productivity', path: '/MN0400_140', children: [
  //           { icon: ChartPieIcon, label: 'Labor Cost Distribution', path: '/MN0400_141', disabled: true },
  //           { icon: ChartBarIcon, label: 'Productivity Metrics', path: '/MN0400_142', disabled: true },
  //           { icon: ChartBarIcon, label: 'Overtime Analysis', path: '/MN0400_143', disabled: true },
  //           { icon: DocumentTextIcon, label: 'Cost per Employee by Location', path: '/MN0400_144', disabled: true }
  //         ]
  //       }
  //     ]
  //   },
  //   {
  //     icon: BuildingOfficeIcon, label: 'Infrastructure Analytics', path: '/MN0400_004', hidden: true,
  //     children: [
  //       {
  //         icon: ServerIcon, label: 'Reliability & Performance', path: '/MN0400_210', children: [
  //           { icon: ChartBarIcon, label: 'Equipment Reliability Index', path: '/MN0400_211', disabled: true },
  //           { icon: ChartBarIcon, label: 'Overall Equipment Effectiveness', path: '/MN0400_212', disabled: true },
  //           { icon: ChartBarIcon, label: 'Uptime & Availability', path: '/MN0400_213', disabled: true },
  //           { icon: DocumentTextIcon, label: 'Mean Time Between Failures', path: '/MN0400_214', disabled: true },
  //           { icon: DocumentTextIcon, label: 'Mean Time To Repair', path: '/MN0400_215', disabled: true }
  //         ]
  //       },
  //       {
  //         icon: WrenchScrewdriverIcon, label: 'Maintenance & Operations', path: '/MN0400_220', children: [
  //           { icon: ChartPieIcon, label: 'Maintenance Cost by Category', path: '/MN0400_221', disabled: true },
  //           { icon: ChartBarIcon, label: 'Predictive Maintenance Insights', path: '/MN0400_222', disabled: true },
  //           { icon: ChartBarIcon, label: 'Work Order Completion Rate', path: '/MN0400_223', disabled: true },
  //           { icon: DocumentTextIcon, label: 'Preventive vs Reactive Maintenance', path: '/MN0400_224', disabled: true },
  //           { icon: DocumentTextIcon, label: 'Maintenance Backlog Analysis', path: '/MN0400_225', disabled: true }
  //         ]
  //       },
  //       {
  //         icon: BoltIcon, label: 'Energy & Sustainability', path: '/MN0400_230', children: [
  //           { icon: ChartBarIcon, label: 'Energy Consumption Trends', path: '/MN0400_231', disabled: true },
  //           { icon: ChartPieIcon, label: 'Carbon Footprint Analysis', path: '/MN0400_232', disabled: true },
  //           { icon: ChartBarIcon, label: 'Energy Cost per Unit', path: '/MN0400_233', disabled: true },
  //           { icon: DocumentTextIcon, label: 'Sustainability KPIs', path: '/MN0400_234', disabled: true }
  //         ]
  //       },
  //       {
  //         icon: HomeModernIcon, label: 'Facilities Management', path: '/MN0400_240', children: [
  //           { icon: ChartBarIcon, label: 'Facility Utilization Heatmap', path: '/MN0400_241', disabled: true },
  //           { icon: ChartBarIcon, label: 'Space Optimization Analysis', path: '/MN0400_242', disabled: true },
  //           { icon: DocumentTextIcon, label: 'Facility Condition Assessment', path: '/MN0400_243', disabled: true }
  //         ]
  //       }
  //     ]
  //   },
  //   {
  //     icon: TruckIcon, label: 'Logistics Analytics', path: '/MN0400_005', hidden: true,
  //     children: [
  //       {
  //         icon: ArchiveBoxIcon, label: 'Inventory Management', path: '/MN0400_310', children: [
  //           { icon: ChartBarIcon, label: 'Inventory Health Score', path: '/MN0400_311', disabled: true },
  //           { icon: MapPinIcon, label: 'Stock Distribution by Location', path: '/MN0400_312', disabled: true },
  //           { icon: ChartBarIcon, label: 'Inventory Turnover Ratio', path: '/MN0400_313', disabled: true },
  //           { icon: ChartBarIcon, label: 'Stock-out & Overstock Analysis', path: '/MN0400_314', disabled: true },
  //           { icon: DocumentTextIcon, label: 'Days of Inventory on Hand', path: '/MN0400_315', disabled: true },
  //           { icon: DocumentTextIcon, label: 'ABC Analysis', path: '/MN0400_316', disabled: true }
  //         ]
  //       },
  //       {
  //         icon: DocumentChartBarIcon, label: 'Supply Chain Performance', path: '/MN0400_320', children: [
  //           { icon: ChartPieIcon, label: 'Supply Chain Cost Analysis', path: '/MN0400_321', disabled: true },
  //           { icon: TableCellsIcon, label: 'Supplier Performance Scorecard', path: '/MN0400_322', disabled: true },
  //           { icon: ChartBarIcon, label: 'Lead Time Analysis', path: '/MN0400_323', disabled: true },
  //           { icon: DocumentTextIcon, label: 'Perfect Order Rate', path: '/MN0400_324', disabled: true },
  //           { icon: DocumentTextIcon, label: 'Order Fulfillment Cycle Time', path: '/MN0400_325', disabled: true }
  //         ]
  //       },
  //       {
  //         icon: TruckIcon, label: 'Transportation & Distribution', path: '/MN0400_330', children: [
  //           { icon: ChartBarIcon, label: 'Transportation Cost per Unit', path: '/MN0400_331', disabled: true },
  //           { icon: ChartBarIcon, label: 'Fleet Utilization', path: '/MN0400_332', disabled: true },
  //           { icon: ChartBarIcon, label: 'On-Time Delivery Performance', path: '/MN0400_333', disabled: true },
  //           { icon: DocumentTextIcon, label: 'Route Optimization Analysis', path: '/MN0400_334', disabled: true }
  //         ]
  //       },
  //       {
  //         icon: HomeModernIcon, label: 'Warehouse Operations', path: '/MN0400_340', children: [
  //           { icon: ChartBarIcon, label: 'Warehouse Space Utilization', path: '/MN0400_341', disabled: true },
  //           { icon: ChartBarIcon, label: 'Picking & Packing Efficiency', path: '/MN0400_342', disabled: true },
  //           { icon: ChartBarIcon, label: 'Dock Door Utilization', path: '/MN0400_343', disabled: true },
  //           { icon: DocumentTextIcon, label: 'Warehouse Productivity Metrics', path: '/MN0400_344', disabled: true }
  //         ]
  //       },
  //       {
  //         icon: ChartPieIcon, label: 'Demand Planning', path: '/MN0400_350', children: [
  //           { icon: ChartBarIcon, label: 'Demand Forecast Accuracy', path: '/MN0400_351', disabled: true },
  //           { icon: ChartBarIcon, label: 'Seasonal Demand Patterns', path: '/MN0400_352', disabled: true },
  //           { icon: DocumentTextIcon, label: 'Forecast vs Actual Analysis', path: '/MN0400_353', disabled: true }
  //         ]
  //       }
  //     ]
  //   },
  //   {
  //     icon: ShieldCheckIcon,
  //     label: 'Certificates Analytics',
  //     path: '/MN0400_006',
  //     children: [{
  //       icon: DocumentCheckIcon, label: 'Compliance & Status', path: '/MN0400_410',
  //       children: [
  //         { icon: ChartPieIcon, label: 'Certificate Status Overview', path: '/MN0400_411', disabled: false },
  //         { icon: ChartBarIcon, label: 'Compliance Rate by Category', path: '/MN0400_412', disabled: false },
  //         { icon: TableCellsIcon, label: 'Superview Certificates', path: '/MN0400_413', disabled: false },
  //         { icon: DocumentTextIcon, label: 'Non-Compliance Report', path: '/MN0400_414', disabled: true },
  //         { icon: ChartBarIcon, label: 'Renewal Success Rate', path: '/MN0400_415', disabled: true }
  //       ]
  //     },
  //     {
  //       icon: CalendarIcon,
  //       label: 'Expiration & Renewal',
  //       path: '/MN0400_420',
  //       disabled: true,
  //       children: [
  //         {
  //           icon: ChartBarIcon,
  //           label: 'Expiring Certificates Timeline',
  //           path: '/MN0400_421',
  //           disabled: false
  //         },
  //         {
  //           icon: ClockIcon,
  //           label: 'Days to Expiration Analysis',
  //           path: '/MN0400_422',
  //           disabled: false
  //         },
  //         {
  //           icon: ChartPieIcon,
  //           label: 'Renewal Pipeline Status',
  //           path: '/MN0400_423',
  //           disabled: true
  //         },
  //         {
  //           icon: DocumentTextIcon,
  //           label: 'Renewal Cycle Time',
  //           path: '/MN0400_424',
  //           disabled: true
  //         },
  //         {
  //           icon: BellAlertIcon,
  //           label: 'Alert & Notification History',
  //           path: '/MN0400_425',
  //           disabled: true
  //         }
  //       ]
  //     },
  //     {
  //       icon: BuildingOfficeIcon,
  //       label: 'Organization & Distribution',
  //       path: '/MN0400_430',
  //       disabled: true,
  //       children: [
  //         {
  //           icon: MapPinIcon,
  //           label: 'Certificates by Location',
  //           path: '/MN0400_431',
  //           disabled: false
  //         },
  //         {
  //           icon: UserGroupIcon,
  //           label: 'Certificates by Department',
  //           path: '/MN0400_432',
  //           disabled: true
  //         },
  //         {
  //           icon: ChartBarIcon,
  //           label: 'Certificate Holder Analysis',
  //           path: '/MN0400_433',
  //           disabled: true
  //         },
  //         {
  //           icon: TableCellsIcon,
  //           label: 'Asset-Certificate Mapping',
  //           path: '/MN0400_434',
  //           disabled: true
  //         },
  //         {
  //           icon: DocumentTextIcon,
  //           label: 'Vendor Certificate Tracking',
  //           path: '/MN0400_435',
  //           disabled: true
  //         }
  //       ]
  //     },
  //     {
  //       icon: ChartBarIcon,
  //       label: 'Performance & Trends',
  //       path: '/MN0400_440',
  //       disabled: true,
  //       children: [
  //         {
  //           icon: ChartBarIcon,
  //           label: 'Certificate Issuance Trends',
  //           path: '/MN0400_441',
  //           disabled: true
  //         },
  //         {
  //           icon: ChartPieIcon,
  //           label: 'Certificate Type Distribution',
  //           path: '/MN0400_442',
  //           disabled: true
  //         },
  //         {
  //           icon: DocumentChartBarIcon,
  //           label: 'Processing Time Analysis',
  //           path: '/MN0400_443',
  //           disabled: true
  //         },
  //         {
  //           icon: ChartBarIcon,
  //           label: 'Audit Trail & Changes',
  //           path: '/MN0400_444',
  //           disabled: true
  //         },
  //         {
  //           icon: DocumentTextIcon,
  //           label: 'Certificate Lifecycle KPIs',
  //           path: '/MN0400_445',
  //           disabled: true
  //         }
  //       ]
  //     },
  //     {
  //       icon: CurrencyDollarIcon,
  //       label: 'Cost & Investment',
  //       path: '/MN0400_450',
  //       disabled: true,
  //       children: [
  //         {
  //           icon: ChartPieIcon,
  //           label: 'Certification Cost Analysis',
  //           path: '/MN0400_451',
  //           disabled: true
  //         },
  //         {
  //           icon: ChartBarIcon,
  //           label: 'Cost per Certificate Type',
  //           path: '/MN0400_452',
  //           disabled: true
  //         },
  //         {
  //           icon: DocumentTextIcon,
  //           label: 'ROI on Certifications',
  //           path: '/MN0400_453',
  //           disabled: true
  //         },
  //         {
  //           icon: ChartBarIcon,
  //           label: 'Budget vs Actual Spend',
  //           path: '/MN0400_454',
  //           disabled: true
  //         },
  //         {
  //           icon: DocumentTextIcon,
  //           label: 'Future Investment Forecast',
  //           path: '/MN0400_455',
  //           disabled: true
  //         }
  //       ]
  //     },
  //     {
  //       icon: ShieldExclamationIcon,
  //       label: 'Risk & Quality',
  //       path: '/MN0400_460',
  //       disabled: true,
  //       children: [
  //         {
  //           icon: ChartBarIcon,
  //           label: 'Risk Score by Certificate',
  //           path: '/MN0400_461',
  //           disabled: true
  //         },
  //         {
  //           icon: TableCellsIcon,
  //           label: 'Critical Certificate Register',
  //           path: '/MN0400_462',
  //           disabled: true
  //         },
  //         {
  //           icon: DocumentChartBarIcon,
  //           label: 'Quality Assurance Metrics',
  //           path: '/MN0400_463',
  //           disabled: true
  //         },
  //         {
  //           icon: ChartBarIcon,
  //           label: 'Regulatory Compliance Score',
  //           path: '/MN0400_464',
  //           disabled: true
  //         },
  //         {
  //           icon: DocumentTextIcon,
  //           label: 'Incident & Violation Tracking',
  //           path: '/MN0400_465',
  //           disabled: true
  //         }
  //       ]
  //     }
  //     ]
  //   }
  // ]


  // Salva collapsed no localStorage
  useEffect(() => {
    localStorage.setItem('menuCollapsed', JSON.stringify(collapsed))
  }, [collapsed])

  // Salva openItems no localStorage
  useEffect(() => {
    localStorage.setItem('menuOpenItems', JSON.stringify(Array.from(openItems)))
  }, [openItems])

  // Abre automaticamente os pais da rota atual quando a rota muda
  useEffect(() => {
    const parents = findParentPaths(menuItems, location.pathname)
    if (parents.length > 0) {
      setOpenItems(prev => {
        const newSet = new Set(prev)
        parents.forEach(p => newSet.add(p))
        return newSet
      })
    }
  }, [location.pathname])

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) setCollapsed(false)
    }
    window.addEventListener('resize', handleResize)
    handleResize()
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const handleItemToggle = (path: string, isOpenState: boolean) => {
    setOpenItems(prev => {
      const newSet = new Set(prev)
      if (isOpenState) newSet.add(path)
      else newSet.delete(path)
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

  const menuWidth = getMenuWidth()

  return (
    <>
      {isOpen && <div className="lg:hidden fixed inset-0 bg-black/50 z-40" onClick={onClose} />}

      <aside className={`fixed lg:static top-0 left-0 z-40 h-screen lg:h-auto bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 transition-all duration-300 lg:translate-x-0 flex-shrink-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'} ${menuWidth}`}>
        <div className="flex flex-col h-full lg:h-screen lg:sticky lg:top-0">
          <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200 dark:border-gray-800 flex-shrink-0">
            {!collapsed && <h2 className="text-lg font-bold truncate text-company-primary">{company?.full_name || 'Menu'}</h2>}
            <div className="flex items-center gap-2 ml-auto">
              <button onClick={() => setCollapsed(!collapsed)} title={collapsed ? 'Expandir menu' : 'Recolher menu'} className="hidden lg:block p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors flex-shrink-0 text-company-primary">
                {collapsed ? <ChevronRightIcon className="w-5 h-5" /> : <ChevronLeftIcon className="w-5 h-5" />}
              </button>
              <button onClick={onClose} title="Fechar menu" className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 flex-shrink-0">
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
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{user?.name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user?.email}</p>
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
                currentPath={location.pathname}
                openItems={openItems}
              />
            ))}
          </nav>
        </div>
      </aside>
    </>
  )
}

export default Menu