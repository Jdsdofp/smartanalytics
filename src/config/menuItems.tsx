// src/config/menuItems.tsx
import {
  ChartBarIcon,
  ChartPieIcon,
  DocumentChartBarIcon,
  TableCellsIcon,
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
  ArchiveBoxIcon,
  HomeModernIcon,
  ServerIcon,
  ChartBarSquareIcon,
  MapIcon,
} from '@heroicons/react/24/outline'
import type { MenuItemProps } from '../components/layout/Menu'


export const menuItemsRaw: MenuItemProps[] = [
  {
    icon: ChartBarIcon,
    label: 'Dashboard',
    path: '/'
  },
  {
    icon: CubeIcon,
    label: 'Assets Analytics',
    path: '/MN0400_002',
    children: [
      {
        icon: DocumentTextIcon,
        label: 'ISO 55000 Standards',
        path: '/MN0400_010',
        children: [
          { icon: DocumentChartBarIcon, label: 'Asset Management System', path: '/MN0400_013', permissionCode: 'MN0400_012' },
          { icon: ChartBarIcon, label: 'ISO 55000 Compliance Overview', path: '/MN0400_011', permissionCode: 'MN0400_010' },
          { icon: TableCellsIcon, label: 'ISO 55001 Requirements Status', path: '/MN0400_012', permissionCode: 'MN0400_011' },
          { icon: DocumentTextIcon, label: 'ISO 55002 Gap Analysis', path: '/MN0400_014', permissionCode: 'MN0400_014', disabled: true },
          { icon: DocumentTextIcon, label: 'Strategic Asset Management Plan', path: '/MN0400_015', permissionCode: 'MN0400_015', disabled: true }
        ]
      },
      {
        icon: ChartPieIcon,
        label: 'Financial & Cost Analysis',
        path: '/MN0400_020',
        hidden: true,
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
        icon: ShieldCheckIcon,
        label: 'Performance & Risk',
        path: '/MN0400_030',
        hidden: true,
        children: [
          { icon: ChartBarIcon, label: 'Asset Health Score', path: '/MN0400_031', permissionCode: 'MN0400_031' },
          { icon: TableCellsIcon, label: 'Asset Criticality Matrix', path: '/MN0400_032', permissionCode: 'MN0400_032' },
          { icon: ChartBarIcon, label: 'Risk Exposure by Category', path: '/MN0400_033', permissionCode: 'MN0400_033' },
          { icon: DocumentChartBarIcon, label: 'Failure Mode Analysis', path: '/MN0400_034', permissionCode: 'MN0400_034' },
          { icon: DocumentTextIcon, label: 'End-of-Life Forecast', path: '/MN0400_035', permissionCode: 'MN0400_035' }
        ]
      },
      {
        icon: DocumentChartBarIcon,
        label: 'Strategic Planning',
        path: '/MN0400_040',
        hidden: true,
        children: [
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
    icon: UserGroupIcon,
    label: 'People Analytics',
    path: '/MN0400_003',
    hidden: false,
    children: [
      {
        icon: UserGroupIcon,
        label: 'Workforce Planning',
        path: '/MN0400_110',
        hidden: true,
        children: [
          { icon: ChartPieIcon, label: 'Workforce Composition', path: '/MN0400_111', permissionCode: 'MN0400_111' },
          { icon: MapPinIcon, label: 'Headcount by Location & Role', path: '/MN0400_112', permissionCode: 'MN0400_112' },
          { icon: ChartBarIcon, label: 'Turnover & Retention Analysis', path: '/MN0400_113', permissionCode: 'MN0400_113' },
          { icon: DocumentTextIcon, label: 'Succession Planning Readiness', path: '/MN0400_114', permissionCode: 'MN0400_114' },
        ]
      },
      {
        icon: AcademicCapIcon,
        label: 'Talent & Development',
        path: '/MN0400_120',
        disabled: true,
        children: [
          { icon: ChartBarIcon, label: 'Onboarding Cycle Time', path: '/MN0400_121', permissionCode: 'MN0400_121' },
          { icon: TableCellsIcon, label: 'Competency Gap Analysis', path: '/MN0400_122', permissionCode: 'MN0400_122' },
          { icon: ChartBarIcon, label: 'Training Effectiveness', path: '/MN0400_123', permissionCode: 'MN0400_123' },
          { icon: DocumentTextIcon, label: 'Certification Compliance Status', path: '/MN0400_124', permissionCode: 'MN0400_124' },
          { icon: DocumentTextIcon, label: 'Skills Inventory Matrix', path: '/MN0400_125', permissionCode: 'MN0400_125' }
        ]
      },
      {
        icon: ShieldCheckIcon,
        label: 'Safety & Wellbeing',
        path: '/MN0400_130',
        children: [
          { icon: MapIcon, label: 'GPS Tracking', path: '/MN0400_132', permissionCode: 'MN0400_132' },
          { icon: ChartBarIcon, label: 'Real-time People Visibility', path: '/MN0400_131', permissionCode: 'MN0400_131' },
          { icon: DocumentChartBarIcon, label: 'Boundary Access Analytics', path: '/MN0400_133', permissionCode: 'MN0400_133' },
          { icon: ChartBarSquareIcon, label: 'Temperature Compliance', path: '/MN0400_134', permissionCode: 'MN0400_134' },
          { icon: DocumentTextIcon, label: 'Risks Management', path: '/MN0400_135', permissionCode: 'MN0400_135' },
        ]
      },
      {
        icon: ChartPieIcon,
        label: 'Cost & Productivity',
        path: '/MN0400_140',
        disabled: true,
        children: [
          { icon: ChartPieIcon, label: 'Labor Cost Distribution', path: '/MN0400_141', permissionCode: 'MN0400_141' },
          { icon: ChartBarIcon, label: 'Productivity Metrics', path: '/MN0400_142', permissionCode: 'MN0400_142' },
          { icon: ChartBarIcon, label: 'Overtime Analysis', path: '/MN0400_143', permissionCode: 'MN0400_143' },
          { icon: DocumentTextIcon, label: 'Cost per Employee by Location', path: '/MN0400_144', permissionCode: 'MN0400_144' }
        ]
      }
    ]
  },
  {
    icon: BuildingOfficeIcon,
    label: 'Infrastructure Analytics',
    path: '/MN0400_004',
    hidden: false,
    children: [
      {
        icon: ServerIcon,
        label: 'Site Survey',
        path: '/MN0400_210',
        children: [
          { icon: ChartBarIcon, label: 'Device Logs & Monitoring', path: '/MN0400_211', permissionCode: 'MN0500_110' },
          { icon: ChartBarIcon, label: 'Overall Equipment Effectiveness', path: '/MN0400_212', permissionCode: 'MN0400_212' }
        ]
      },
    ]
  },
  {
    icon: TruckIcon,
    label: 'Logistics Analytics',
    path: '/MN0400_005',
    children: [
      {
        icon: ArchiveBoxIcon,
        label: 'Inventory Management',
        path: '/MN0400_310',
        children: [
          { icon: ChartBarIcon, label: 'Inventory Health Score', path: '/MN0400_311', permissionCode: 'MN0400_311' },
          { icon: MapPinIcon, label: 'Stock Distribution by Location', path: '/MN0400_312', permissionCode: 'MN0400_312' },
          { icon: ChartBarIcon, label: 'Inventory Turnover Ratio', path: '/MN0400_313', permissionCode: 'MN0400_313' },
          { icon: ChartBarIcon, label: 'Stock-out & Overstock Analysis', path: '/MN0400_314', permissionCode: 'MN0400_314' },
          { icon: DocumentTextIcon, label: 'Days of Inventory on Hand', path: '/MN0400_315', permissionCode: 'MN0400_315' },
          { icon: DocumentTextIcon, label: 'ABC Analysis', path: '/MN0400_316', permissionCode: 'MN0400_316' }
        ]
      },
      {
        icon: DocumentChartBarIcon,
        label: 'Supply Chain Performance',
        path: '/MN0400_320',
        hidden: true,
        children: [
          { icon: ChartPieIcon, label: 'Supply Chain Cost Analysis', path: '/MN0400_321', permissionCode: 'MN0400_321' },
          { icon: TableCellsIcon, label: 'Supplier Performance Scorecard', path: '/MN0400_322', permissionCode: 'MN0400_322' },
          { icon: ChartBarIcon, label: 'Lead Time Analysis', path: '/MN0400_323', permissionCode: 'MN0400_323' },
          { icon: DocumentTextIcon, label: 'Perfect Order Rate', path: '/MN0400_324', permissionCode: 'MN0400_324' },
          { icon: DocumentTextIcon, label: 'Order Fulfillment Cycle Time', path: '/MN0400_325', permissionCode: 'MN0400_325' }
        ]
      },
      {
        icon: TruckIcon,
        label: 'Transportation & Distribution',
        path: '/MN0400_330',
        children: [
          { icon: ChartBarIcon, label: 'Transportation Cost per Unit', path: '/MN0400_331', permissionCode: 'MN0400_331' },
          { icon: ChartBarIcon, label: 'Asset Distribution', path: '/MN0400_332', permissionCode: 'MN0400_332' },
          { icon: ChartBarIcon, label: 'On-Time Delivery Performance', path: '/MN0400_333', permissionCode: 'MN0400_333' },
          { icon: DocumentTextIcon, label: 'Route Optimization Analysis', path: '/MN0400_334', permissionCode: 'MN0400_334' },
        ]
      },
      {
        icon: HomeModernIcon,
        label: 'Warehouse Operations',
        path: '/MN0400_340',
        children: [
          { icon: ChartBarIcon, label: 'Warehouse Space Utilization', path: '/MN0400_341', permissionCode: 'MN0400_341' },
          { icon: ChartBarIcon, label: 'Picking & Packing Efficiency', path: '/MN0400_342', permissionCode: 'MN0400_342' },
          { icon: ChartBarIcon, label: 'Dock Door Utilization', path: '/MN0400_343', permissionCode: 'MN0400_343' },
          { icon: DocumentTextIcon, label: 'Warehouse Orders Overview', path: '/MN0400_344', permissionCode: 'MN0400_344' }
        ]
      },
      {
        icon: ChartPieIcon,
        label: 'Demand Planning',
        path: '/MN0400_350',
        hidden: true,
        children: [
          { icon: ChartBarIcon, label: 'Demand Forecast Accuracy', path: '/MN0400_351', permissionCode: 'MN0400_351' },
          { icon: ChartBarIcon, label: 'Seasonal Demand Patterns', path: '/MN0400_352', permissionCode: 'MN0400_352' },
          { icon: DocumentTextIcon, label: 'Forecast vs Actual Analysis', path: '/MN0400_353', permissionCode: 'MN0400_353' }
        ]
      }
    ]
  },
  {
    icon: ShieldCheckIcon,
    label: 'Certificates Analytics',
    path: '/MN0400_006',
    children: [
      {
        icon: DocumentCheckIcon,
        label: 'Compliance & Status',
        path: '/MN0400_410',
        children: [
          { icon: ChartPieIcon, label: 'Certificate Status Overview', path: '/MN0400_511', permissionCode: 'MN0400_510' },
          { icon: ChartBarIcon, label: 'Compliance Rate by Category', path: '/MN0400_412', permissionCode: 'MN0400_412' },
          { icon: TableCellsIcon, label: 'Superview Certificates', path: '/MN0400_413', permissionCode: 'MN0400_413' },
          { icon: DocumentTextIcon, label: 'Non-Compliance Report', path: '/MN0400_414', permissionCode: 'MN0400_414' },
          { icon: ChartBarIcon, label: 'Renewal Success Rate', path: '/MN0400_415', permissionCode: 'MN0400_415' }
        ]
      },
      {
        icon: CalendarIcon,
        label: 'Expiration & Renewal',
        path: '/MN0400_420',
        hidden: true,
        children: [
          { icon: ChartBarIcon, label: 'Expiring Certificates Timeline', path: '/MN0400_421', permissionCode: 'MN0400_421' },
          { icon: ClockIcon, label: 'Days to Expiration Analysis', path: '/MN0400_422', permissionCode: 'MN0400_422' },
          { icon: ChartPieIcon, label: 'Renewal Pipeline Status', path: '/MN0400_423', permissionCode: 'MN0400_423' },
          { icon: DocumentTextIcon, label: 'Renewal Cycle Time', path: '/MN0400_424', permissionCode: 'MN0400_424' },
          { icon: BellAlertIcon, label: 'Alert & Notification History', path: '/MN0400_425', permissionCode: 'MN0400_425' }
        ]
      },
      {
        icon: BuildingOfficeIcon,
        label: 'Organization & Distribution',
        path: '/MN0400_430',
        hidden: true,
        children: [
          { icon: MapPinIcon, label: 'Certificates by Location', path: '/MN0400_431' },
          { icon: UserGroupIcon, label: 'Certificates by Department', path: '/MN0400_432', permissionCode: 'MN0400_432' },
          { icon: ChartBarIcon, label: 'Certificate Holder Analysis', path: '/MN0400_433', permissionCode: 'MN0400_433' },
          { icon: TableCellsIcon, label: 'Asset-Certificate Mapping', path: '/MN0400_434', permissionCode: 'MN0400_434' },
          { icon: DocumentTextIcon, label: 'Vendor Certificate Tracking', path: '/MN0400_435', permissionCode: 'MN0400_435' }
        ]
      },
      {
        icon: ChartBarIcon,
        label: 'Performance & Trends',
        path: '/MN0400_440',
        hidden: true,
        children: [
          { icon: ChartBarIcon, label: 'Certificate Issuance Trends', path: '/MN0400_441', permissionCode: 'MN0400_441' },
          { icon: ChartPieIcon, label: 'Certificate Type Distribution', path: '/MN0400_442', permissionCode: 'MN0400_442' },
          { icon: DocumentChartBarIcon, label: 'Processing Time Analysis', path: '/MN0400_443', permissionCode: 'MN0400_443' },
          { icon: ChartBarIcon, label: 'Audit Trail & Changes', path: '/MN0400_444', permissionCode: 'MN0400_444' },
          { icon: DocumentTextIcon, label: 'Certificate Lifecycle KPIs', path: '/MN0400_445', permissionCode: 'MN0400_445' }
        ]
      },
      {
        icon: CurrencyDollarIcon,
        label: 'Cost & Investment',
        path: '/MN0400_450',
        hidden: true,
        children: [
          { icon: ChartPieIcon, label: 'Certification Cost Analysis', path: '/MN0400_451', permissionCode: 'MN0400_451' },
          { icon: ChartBarIcon, label: 'Cost per Certificate Type', path: '/MN0400_452', permissionCode: 'MN0400_452' },
          { icon: DocumentTextIcon, label: 'ROI on Certifications', path: '/MN0400_453', permissionCode: 'MN0400_453' },
          { icon: ChartBarIcon, label: 'Budget vs Actual Spend', path: '/MN0400_454', permissionCode: 'MN0400_454' },
          { icon: DocumentTextIcon, label: 'Future Investment Forecast', path: '/MN0400_455', permissionCode: 'MN0400_455' }
        ]
      },
      {
        icon: ShieldExclamationIcon,
        label: 'Risk & Quality',
        path: '/MN0400_460',
        hidden: true,
        children: [
          { icon: ChartBarIcon, label: 'Risk Score by Certificate', path: '/MN0400_461', permissionCode: 'MN0400_461' },
          { icon: TableCellsIcon, label: 'Critical Certificate Register', path: '/MN0400_462', permissionCode: 'MN0400_462' },
          { icon: DocumentChartBarIcon, label: 'Quality Assurance Metrics', path: '/MN0400_463', permissionCode: 'MN0400_463' },
          { icon: ChartBarIcon, label: 'Regulatory Compliance Score', path: '/MN0400_464', permissionCode: 'MN0400_464' },
          { icon: DocumentTextIcon, label: 'Incident & Violation Tracking', path: '/MN0400_465', permissionCode: 'MN0400_465' }
        ]
      }
    ]
  },
]