// src/components/DeviceLogsView.tsx
import { useState, useEffect, useRef, useMemo } from 'react';
import {
  SignalIcon,
  SignalSlashIcon,
  BoltIcon,
  MapPinIcon,
  ExclamationTriangleIcon,
  ShieldExclamationIcon,
  Cog6ToothIcon,
  ChartBarIcon,
  ArrowPathIcon,
  MagnifyingGlassIcon,
  ClockIcon,
  DevicePhoneMobileIcon,
  DocumentChartBarIcon,
  MapIcon,
  FunnelIcon,
  XMarkIcon,
  TableCellsIcon,
  DocumentTextIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  ArrowsUpDownIcon,
} from '@heroicons/react/24/outline';
import * as echarts from 'echarts';
import type { EChartsOption } from 'echarts';

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-polylinedecorator';
import RawDataExplorer from './DataGrid/gridMN0400_211';
import { useTranslation } from 'react-i18next';
import { t } from 'i18next';
import GPSRouteMapLeaflet from './Map/GPSRouteMap';
import GPSMapViewer from './Map/GPSMapViewer';
import { useCompany } from '../../hooks/useCompany';
import AssetManagementGrid from './DataGrid/AssetManagementGrid';
import HealthScoreDashboard from './DataGrid/HealthScoreDashboard';
import { exportToExcel, exportToPDF } from '../../utils/exportMN0400211';
import ExportModal from './Modal/exportModal';
import DevicePayloadStatsGrid from './DataGrid/DevicePayloadStatsGrid';

// =====================================
// 📊 INTERFACES ATUALIZADAS
// =====================================


interface DashboardOverview {
  kpis: {
    uptime: {
      devices_online: number;
      total_devices: number;
      uptime_percentage: string;
    };
    gps_success: {
      total_reports: number;
      valid_gps_reports: string;
      success_rate_percent: string;
    };
    battery_health: {
      total_devices: number;
      healthy_devices: string;
      warning_devices: string;
      critical_devices: string;
      health_percentage: string;
    };
    accuracy_distribution: Array<{
      accuracy_range: string;
      report_count: number;
      percentage: string;
    }>;
    battery_distribution: BatteryDistributionData[];
  };


  device_alerts: {
    active_sos_count: number;
    active_sos_list: any[];
    low_battery_count: number;
    low_battery_devices: Array<{
      dev_eui: string;
      customer_name: string;
      domain_name: string;
      timestamp: string;
      battery_level: number;
      battery_status: string;
      gps_latitude: string;
      gps_longitude: string;
      person_name: string;
      dev_uid: string;
      sensor_model: string;
      temperature: number;
      temperature_unit: string;
      motion_status: string;
      motion_status_numeric: number;
      battery_charging: string;
      battery_score: number;
      battery_freshness: string;
      battery_last_updated: string;
      battery_minutes_ago: number;
      temperature_last_updated: string;
      temperature_minutes_ago: number;
      temperature_freshness: string;
      motion_last_updated: string;
      motion_last_changed: string;
      motion_minutes_ago: number;
      motion_freshness: string;
      last_report_datetime: string;
      minutes_since_report: number;
      hours_since_report: number;
      days_since_report: number;
      report_freshness: string;
      report_status: string;
      freshness_score: number;
      gps_age: number | null;
      loc_fail_reason_descr: string | null;
    }>;
    offline_count: number;
    offline_devices: any[];
  };
  people_alerts: {
    summary: {
      total_people: number;
      alarm1_active: string;
      alarm2_active: string;
      any_alarm_active: string;
      button1_pressed: string;
      button2_pressed: string;
      any_button_pressed: string;
      mandown_alerts: string;
      people_with_alerts: string;
      highly_critical: string;
      critical: string;
      alerts: string;
    };
    active_alerts: Array<{
      person_code: string;
      person_name: string;
      dev_uid: string;
      department_name: string;
      role_name: string | null;
      current_zone_description: string;
      alarm1_status: string;
      alarm1_minutes_ago: number;
      alarm2_status: string;
      alarm2_minutes_ago: number;
      button1_status: string;
      button1_minutes_ago: number | null;
      button2_status: string;
      button2_minutes_ago: number | null;
      mandown_alert_status: string;
      mandown_alert_last_updated: string;
      alert_priority: string;
      alert_score: number;
      status_name: string;
      battery_level: number;
      last_report_datetime: string;
      minutes_since_report: number;
    }>;
    active_alerts_count: number;
    multiple_alerts: Array<{
      person_code: string;
      person_name: string;
      dev_uid: string;
      department_name: string;
      current_zone_description: string;
      active_alerts_count: number;
      active_alerts_list: string;
      alert_priority: string;
      alert_score: number;
      battery_level: number;
      last_report_datetime: string;
    }>;
    by_department: Array<{
      department_name: string;
      total_people: number;
      alarm1_count: string;
      alarm2_count: string;
      button1_count: string;
      button2_count: string;
      mandown_count: string;
      total_alerts: string;
      alert_percentage: string;
    }>;
    by_zone: Array<{
      zone: string;
      total_people: number;
      alarm1: string;
      alarm2: string;
      button1: string;
      button2: string;
      mandown: string;
      total_alerts: string;
      alert_density: string;
      avg_alert_score: string;
    }>;
    button_comparison: Array<{
      button_type: string;
      pressed: string;
      not_pressed: string;
      avg_minutes_since_press: string;
    }>;
    alarm_comparison: Array<{
      alarm_type: string;
      active: string;
      inactive: string;
      avg_minutes_active: string;
    }>;
  };
  generated_at: string;
  company_id: string;
}

interface DevicePosition {
  dev_eui: string;
  customer_name: string;
  dynamic_motion_state: string;
  timestamp: string;
  battery_level: number;
  gps_latitude?: number;
  gps_longitude?: number;
}

interface GatewaySignal {
  gateway_name: string;
  report_count: number;
  avg_rssi: number;
  avg_snr: number;
  min_rssi: number;
  max_rssi: number;
}

interface EventTypeStats {
  event_type: string;
  total: number;
  valid_events: number;
  duplicate_events: number;
  unique_devices: number;
}

interface CustomerActivity {
  customer_name: string;
  domain_name: string;
  total_devices: number;
  total_reports: number;
  avg_battery: number;
  last_activity: string;
}

interface DeviceDetails {
  device: DevicePosition;
  route24h: Array<{
    timestamp: string;
    latitude: number;
    longitude: number;
    speed?: number;
    battery_level: number;
  }>;
  recentEvents: Array<{
    event_type: string;
    event_timestamp: string;
    battery_level: number;
  }>;
  configuration: {
    tracking_mode: string;
    tracking_ul_period: number;
    battery_level: number;
    last_config: string;
  };
}

// =====================================
// 📊 COMPONENTE DE MODAL DE DETALHES
// =====================================
interface DetailsModalProps {
  device: DevicePosition | null;
  isOpen: boolean;
  onClose: () => void;
}


interface FilterOptions {
  personName: string;
  devUid?: string;
  batteryLevelMin: number;
  batteryLevelMax: number;
  batteryStatus: string[];
  motionStatus: string[];
  reportFreshness: string[];
  temperatureMin: number | undefined;
  temperatureMax: number | undefined;
}

interface LowBatteryTableFiltersProps {
  filters: FilterOptions;
  onFiltersChange: (filters: FilterOptions) => void;
  onClearFilters: () => void;
  activeFiltersCount: number;
}



// =====================================
// 🎨 COMPONENTE DE GRÁFICO DE PIZZA
// =====================================
interface BatteryPieChartProps {
  data: {
    healthy: number;
    warning: number;
    critical: number;
  };
}

interface BatteryDistributionData {
  status: string;
  device_count: number;
  percentage: number;
}

interface BatteryDistributionPieChartProps {
  data: BatteryDistributionData[];
}


// const LowBatteryTableFilters = ({
//   filters,
//   onFiltersChange,
//   onClearFilters,
//   activeFiltersCount
// }: LowBatteryTableFiltersProps) => {
//   const { t } = useTranslation();
//   const [isOpen, setIsOpen] = useState(false);
//   const dropdownRef = useRef<HTMLDivElement>(null);

//   // Fechar ao clicar fora
//   useEffect(() => {
//     const handleClickOutside = (event: MouseEvent) => {
//       if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
//         setIsOpen(false);
//       }
//     };

//     if (isOpen) {
//       document.addEventListener('mousedown', handleClickOutside);
//     }

//     return () => {
//       document.removeEventListener('mousedown', handleClickOutside);
//     };
//   }, [isOpen]);

//   const updateFilter = (key: keyof FilterOptions, value: any) => {
//     onFiltersChange({
//       ...filters,
//       [key]: value
//     });
//   };

//   const toggleArrayFilter = (key: 'batteryStatus' | 'motionStatus' | 'reportFreshness', value: string) => {
//     const currentArray = filters[key] || [];
//     if (currentArray.includes(value)) {
//       updateFilter(key, currentArray.filter(v => v !== value));
//     } else {
//       updateFilter(key, [...currentArray, value]);
//     }
//   };

//   const batteryStatusOptions = [
//     { value: 'CRITICAL', label: t('lowBatteryTable.filters.statuses.critical'), color: 'red' },
//     { value: 'WARNING', label: t('lowBatteryTable.filters.statuses.warning'), color: 'yellow' },
//     { value: 'HEALTHY', label: t('lowBatteryTable.filters.statuses.healthy'), color: 'green' }
//   ];

//   const motionStatusOptions = [
//     { value: 'MOVING', label: t('lowBatteryTable.filters.motion.moving'), icon: '🏃' },
//     { value: 'STATIC', label: t('lowBatteryTable.filters.motion.static'), icon: '⏸️' }
//   ];

//   const reportFreshnessOptions = [
//     { value: 'REAL_TIME', label: t('lowBatteryTable.filters.freshness.realTime'), color: 'green' },
//     { value: 'RECENT', label: t('lowBatteryTable.filters.freshness.recent'), color: 'blue' },
//     { value: 'STALE', label: t('lowBatteryTable.filters.freshness.stale'), color: 'gray' }
//   ];

//   return (
//     <div className="relative" ref={dropdownRef}>
//       {/* Botão de Filtros */}
//       <button
//         onClick={() => setIsOpen(!isOpen)}
//         className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 transition-all ${activeFiltersCount > 0
//           ? 'bg-blue-50 border-blue-500 text-blue-700 hover:bg-blue-100'
//           : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
//           }`}
//       >
//         <FunnelIcon className="h-5 w-5" />
//         <span className="font-medium">
//           {t('lowBatteryTable.filters.title')}
//           {activeFiltersCount > 0 && ` (${activeFiltersCount})`}
//         </span>
//       </button>

//       {/* Dropdown de Filtros */}
//       {isOpen && (
//         <div className="absolute top-full left-0 mt-2 w-[600px] bg-white rounded-lg shadow-xl border border-gray-200 z-50 max-h-[80vh] overflow-y-auto">
//           {/* Header */}
//           <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between">
//             <h3 className="text-lg font-semibold text-gray-900">
//               {t('lowBatteryTable.filters.title')}
//             </h3>
//             <div className="flex items-center gap-2">
//               {activeFiltersCount > 0 && (
//                 <button
//                   onClick={onClearFilters}
//                   className="text-sm text-red-600 hover:text-red-700 font-medium"
//                 >
//                   {t('lowBatteryTable.filters.clearAll')}
//                 </button>
//               )}
//               <button
//                 onClick={() => setIsOpen(false)}
//                 className="text-gray-400 hover:text-gray-600"
//               >
//                 <XMarkIcon className="h-5 w-5" />
//               </button>
//             </div>
//           </div>

//           {/* Filtros */}
//           <div className="p-4 space-y-6">
//             {/* Filtro de Nome */}
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">
//                 {t('lowBatteryTable.filters.personName')}
//               </label>
//               <input
//                 type="text"
//                 value={filters.personName}
//                 onChange={(e) => updateFilter('personName', e.target.value)}
//                 placeholder={t('lowBatteryTable.filters.personNamePlaceholder')}
//                 className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//               />
//             </div>

//             {/* Filtro de Nível de Bateria */}
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">
//                 {t('lowBatteryTable.filters.batteryLevel')}
//               </label>
//               <div className="grid grid-cols-2 gap-3">
//                 <div>
//                   <label className="block text-xs text-gray-600 mb-1">
//                     {t('lowBatteryTable.filters.min')}
//                   </label>
//                   <input
//                     type="number"
//                     min="0"
//                     max="100"
//                     value={filters.batteryLevelMin}
//                     onChange={(e) => updateFilter('batteryLevelMin', parseInt(e.target.value) || 0)}
//                     className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                   />
//                 </div>
//                 <div>
//                   <label className="block text-xs text-gray-600 mb-1">
//                     {t('lowBatteryTable.filters.max')}
//                   </label>
//                   <input
//                     type="number"
//                     min="0"
//                     max="100"
//                     value={filters.batteryLevelMax}
//                     onChange={(e) => updateFilter('batteryLevelMax', parseInt(e.target.value) || 100)}
//                     className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                   />
//                 </div>
//               </div>
//               {/* Range Visual */}
//               <div className="mt-3 px-2">
//                 <div className="relative h-2 bg-gray-200 rounded-full">
//                   <div
//                     className="absolute h-2 bg-blue-500 rounded-full"
//                     style={{
//                       left: `${filters.batteryLevelMin}%`,
//                       right: `${100 - filters.batteryLevelMax}%`
//                     }}
//                   />
//                 </div>
//                 <div className="flex justify-between text-xs text-gray-500 mt-1">
//                   <span>{filters.batteryLevelMin}%</span>
//                   <span>{filters.batteryLevelMax}%</span>
//                 </div>
//               </div>
//             </div>

//             {/* Filtro de Status da Bateria */}
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">
//                 {t('lowBatteryTable.filters.batteryStatus')}
//               </label>
//               <div className="flex flex-wrap gap-2">
//                 {batteryStatusOptions.map((option) => (
//                   <button
//                     key={option.value}
//                     onClick={() => toggleArrayFilter('batteryStatus', option.value)}
//                     className={`px-4 py-2 rounded-lg border-2 transition-all ${filters.batteryStatus.includes(option.value)
//                       ? `border-${option.color}-500 bg-${option.color}-50 text-${option.color}-700`
//                       : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
//                       }`}
//                   >
//                     {option.label}
//                   </button>
//                 ))}
//               </div>
//             </div>

//             {/* Filtro de Status de Movimento */}
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">
//                 {t('lowBatteryTable.filters.motionStatus')}
//               </label>
//               <div className="flex flex-wrap gap-2">
//                 {motionStatusOptions.map((option) => (
//                   <button
//                     key={option.value}
//                     onClick={() => toggleArrayFilter('motionStatus', option.value)}
//                     className={`px-4 py-2 rounded-lg border-2 transition-all ${filters.motionStatus.includes(option.value)
//                       ? 'border-blue-500 bg-blue-50 text-blue-700'
//                       : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
//                       }`}
//                   >
//                     <span className="mr-2">{option.icon}</span>
//                     {option.label}
//                   </button>
//                 ))}
//               </div>
//             </div>

//             {/* Filtro de Temperatura */}
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">
//                 {t('lowBatteryTable.filters.temperature')} (°C)
//               </label>
//               <div className="grid grid-cols-2 gap-3">
//                 <div>
//                   <label className="block text-xs text-gray-600 mb-1">
//                     {t('lowBatteryTable.filters.min')}
//                   </label>
//                   <input
//                     type="number"
//                     value={filters.temperatureMin || ''}
//                     onChange={(e) => updateFilter('temperatureMin', e.target.value ? parseFloat(e.target.value) : undefined)}
//                     placeholder="Ex: -10"
//                     className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                   />
//                 </div>
//                 <div>
//                   <label className="block text-xs text-gray-600 mb-1">
//                     {t('lowBatteryTable.filters.max')}
//                   </label>
//                   <input
//                     type="number"
//                     value={filters.temperatureMax || ''}
//                     onChange={(e) => updateFilter('temperatureMax', e.target.value ? parseFloat(e.target.value) : undefined)}
//                     placeholder="Ex: 50"
//                     className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                   />
//                 </div>
//               </div>
//             </div>

//             {/* Filtro de Freshness */}
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">
//                 {t('lowBatteryTable.filters.reportFreshness')}
//               </label>
//               <div className="flex flex-wrap gap-2">
//                 {reportFreshnessOptions.map((option) => (
//                   <button
//                     key={option.value}
//                     onClick={() => toggleArrayFilter('reportFreshness', option.value)}
//                     className={`px-4 py-2 rounded-lg border-2 transition-all ${filters.reportFreshness.includes(option.value)
//                       ? `border-${option.color}-500 bg-${option.color}-50 text-${option.color}-700`
//                       : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
//                       }`}
//                   >
//                     {option.label}
//                   </button>
//                 ))}
//               </div>
//             </div>
//           </div>

//           {/* Footer */}
//           <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 p-4 flex items-center justify-between">
//             <span className="text-sm text-gray-600">
//               {activeFiltersCount > 0
//                 ? t('lowBatteryTable.filters.activeFilters', { count: activeFiltersCount })
//                 : t('lowBatteryTable.filters.noActiveFilters')}
//             </span>
//             <button
//               onClick={() => setIsOpen(false)}
//               className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
//             >
//               {t('lowBatteryTable.filters.apply')}
//             </button>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

const BatteryDistributionPieChart = ({ data }: BatteryDistributionPieChartProps) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstanceRef = useRef<echarts.ECharts | null>(null);
  const { t } = useTranslation();

  useEffect(() => {
    if (!chartRef.current || !data || data.length === 0) return;

    // Criar ou obter instância
    if (!chartInstanceRef.current) {
      chartInstanceRef.current = echarts.init(chartRef.current);
    }

    // 🎨 Mapear cores vibrantes baseado no status
    const getColor = (status: string) => {
      const statusLower = status.toLowerCase();
      
      // Saudável - Verde vibrante
      if (statusLower.includes('Healthy') || statusLower.includes('healthy')) {
        return '#10b981'; // green-500
      }
      
      // Alerta/Warning - Amarelo/Laranja
      if (statusLower.includes('Alert') || statusLower.includes('warning')) {
        return '#f59e0b'; // amber-500
      }
      
      // Crítico - Vermelho vibrante
      if (statusLower.includes('Critical') || statusLower.includes('critical')) {
        return '#ef4444'; // red-500
      }
      
      // Fallback - Cinza
      return '#d1ba37ff'; // gray-500
    };

    const option: EChartsOption = {
      tooltip: {
        trigger: 'item',
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderColor: '#e5e7eb',
        borderWidth: 1,
        textStyle: {
          color: '#374151',
        },
        formatter: (params: any) => {
          const color = params.color;
          return `
            <div style="padding: 8px;">
              <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
                <div style="width: 12px; height: 12px; border-radius: 50%; background-color: ${color};"></div>
                <strong style="font-size: 14px;">${params.name}</strong>
              </div>
              <div style="font-size: 13px; color: #6b7280;">
                ${t('deviceLogs.batteryDistributionChart.devices')}: <strong style="color: #111827;">${params.value}</strong>
              </div>
              <div style="font-size: 13px; color: #6b7280;">
                ${t('deviceLogs.batteryDistributionChart.percentage')}: <strong style="color: #111827;">${params.data.percentage}%</strong>
              </div>
            </div>
          `;
        },
      },
      legend: {
        orient: 'vertical',
        left: 'left',
        top: 'center',
        itemGap: 16,
        itemWidth: 14,
        itemHeight: 14,
        textStyle: {
          fontSize: 13,
          color: '#374151',
          fontWeight: 500,
        },
        formatter: (name: string) => {
          const item = data.find(d => d.status === name);
          return `${name} (${item?.device_count || 0})`;
        },
      },
      series: [
        {
          name: t('deviceLogs.batteryDistributionChart.seriesName'),
          type: 'pie',
          radius: ['45%', '75%'], // Donut chart
          center: ['60%', '50%'],
          avoidLabelOverlap: true,
          itemStyle: {
            borderRadius: 8,
            borderColor: '#fff',
            borderWidth: 3,
          },
          label: {
            show: true,
            formatter: (params: any) => {
              return `{b|${params.name}}\n{per|${params.percent}%}`;
            },
            rich: {
              b: {
                fontSize: 12,
                fontWeight: 'bold',
                color: '#111827',
                lineHeight: 20,
              },
              per: {
                fontSize: 14,
                fontWeight: 'bold',
                color: '#374151',
                lineHeight: 20,
              },
            },
            fontSize: 12,
            color: '#374151',
          },
          labelLine: {
            show: true,
            length: 15,
            length2: 10,
            smooth: true,
          },
          emphasis: {
            label: {
              show: true,
              fontSize: 16,
              fontWeight: 'bold',
            },
            itemStyle: {
              shadowBlur: 20,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.3)',
              borderWidth: 4,
            },
            scale: true,
            scaleSize: 10,
          },
          data: data.map(item => ({
            value: item.device_count,
            name: item.status,
            percentage: item.percentage,
            itemStyle: { 
              color: getColor(item.status),
              shadowBlur: 10,
              shadowColor: 'rgba(0, 0, 0, 0.1)',
            },
          })),
        },
      ],
    };

    chartInstanceRef.current.setOption(option);

    // Resize handler
    const handleResize = () => {
      chartInstanceRef.current?.resize();
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [data, t]);

  // Cleanup ao desmontar
  useEffect(() => {
    return () => {
      chartInstanceRef.current?.dispose();
      chartInstanceRef.current = null;
    };
  }, []);

  return <div ref={chartRef} className="w-full h-full min-w-0" />;
};

const LowBatteryTableFilters = ({
  filters,
  onFiltersChange,
  onClearFilters,
  activeFiltersCount
}: LowBatteryTableFiltersProps) => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fechar ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const updateFilter = (key: keyof FilterOptions, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value
    });
  };

  const toggleArrayFilter = (key: 'batteryStatus' | 'motionStatus' | 'reportFreshness', value: string) => {
    const currentArray = filters[key] || [];
    if (currentArray.includes(value)) {
      updateFilter(key, currentArray.filter(v => v !== value));
    } else {
      updateFilter(key, [...currentArray, value]);
    }
  };

  const batteryStatusOptions = [
    { value: 'CRITICAL', label: t('lowBatteryTable.filters.statuses.critical'), color: 'red' },
    { value: 'WARNING', label: t('lowBatteryTable.filters.statuses.warning'), color: 'yellow' },
    { value: 'HEALTHY', label: t('lowBatteryTable.filters.statuses.healthy'), color: 'green' }
  ];

  const motionStatusOptions = [
    { value: 'MOVING', label: t('lowBatteryTable.filters.motion.moving'), icon: '🏃' },
    { value: 'STATIC', label: t('lowBatteryTable.filters.motion.static'), icon: '⏸️' }
  ];

  const reportFreshnessOptions = [
    { value: 'REAL_TIME', label: t('lowBatteryTable.filters.freshness.realTime'), color: 'green' },
    { value: 'RECENT', label: t('lowBatteryTable.filters.freshness.recent'), color: 'blue' },
    { value: 'STALE', label: t('lowBatteryTable.filters.freshness.stale'), color: 'gray' }
  ];

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Botão de Filtros */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg border-2 transition-all text-sm sm:text-base ${activeFiltersCount > 0
          ? 'bg-blue-50 border-blue-500 text-blue-700 hover:bg-blue-100'
          : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
          }`}
      >
        <FunnelIcon className="h-4 w-4 sm:h-5 sm:w-5" />
        <span className="font-medium">
          {t('lowBatteryTable.filters.title')}
          {activeFiltersCount > 0 && ` (${activeFiltersCount})`}
        </span>
      </button>

      {/* Dropdown de Filtros */}
      {isOpen && (
        <div className="fixed inset-x-4 top-20 sm:absolute sm:inset-x-auto sm:top-full sm:left-0 mt-2 w-auto sm:w-[600px] lg:w-[700px] bg-white rounded-lg shadow-xl border border-gray-200 z-50 max-h-[85vh] sm:max-h-[80vh] overflow-y-auto">
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-gray-200 p-3 sm:p-4 flex items-center justify-between">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900">
              {t('lowBatteryTable.filters.title')}
            </h3>
            <div className="flex items-center gap-2">
              {activeFiltersCount > 0 && (
                <button
                  onClick={onClearFilters}
                  className="text-xs sm:text-sm text-red-600 hover:text-red-700 font-medium"
                >
                  {t('lowBatteryTable.filters.clearAll')}
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Filtros */}
          <div className="p-3 sm:p-4 space-y-4 sm:space-y-6">
            {/* Filtro de Nome */}
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                {t('lowBatteryTable.filters.personName')}
              </label>
              <input
                type="text"
                value={filters.personName}
                onChange={(e) => updateFilter('personName', e.target.value)}
                placeholder={t('lowBatteryTable.filters.personNamePlaceholder')}
                className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Filtro de Device UID */}
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                {t('lowBatteryTable.filters.deviceUid')}
              </label>
              <input
                type="text"
                value={filters.devUid || ''}
                onChange={(e) => updateFilter('devUid', e.target.value)}
                placeholder={t('lowBatteryTable.filters.deviceUidPlaceholder')}
                className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono"
              />
            </div>

            {/* Filtro de Nível de Bateria */}
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                {t('lowBatteryTable.filters.batteryLevel')}
              </label>
              <div className="grid grid-cols-2 gap-2 sm:gap-3">
                <div>
                  <label className="block text-xs text-gray-600 mb-1">
                    {t('lowBatteryTable.filters.min')}
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={filters.batteryLevelMin}
                    onChange={(e) => updateFilter('batteryLevelMin', parseInt(e.target.value) || 0)}
                    className="w-full px-2 sm:px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">
                    {t('lowBatteryTable.filters.max')}
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={filters.batteryLevelMax}
                    onChange={(e) => updateFilter('batteryLevelMax', parseInt(e.target.value) || 100)}
                    className="w-full px-2 sm:px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              {/* Range Visual */}
              <div className="mt-3 px-2">
                <div className="relative h-2 bg-gray-200 rounded-full">
                  <div
                    className="absolute h-2 bg-blue-500 rounded-full"
                    style={{
                      left: `${filters.batteryLevelMin}%`,
                      right: `${100 - filters.batteryLevelMax}%`
                    }}
                  />
                </div>
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>{filters.batteryLevelMin}%</span>
                  <span>{filters.batteryLevelMax}%</span>
                </div>
              </div>
            </div>

            {/* Filtro de Status da Bateria */}
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                {t('lowBatteryTable.filters.batteryStatus')}
              </label>
              <div className="flex flex-wrap gap-2">
                {batteryStatusOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => toggleArrayFilter('batteryStatus', option.value)}
                    className={`px-3 sm:px-4 py-2 text-xs sm:text-sm rounded-lg border-2 transition-all ${filters.batteryStatus.includes(option.value)
                      ? `border-${option.color}-500 bg-${option.color}-50 text-${option.color}-700`
                      : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                      }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Filtro de Status de Movimento */}
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                {t('lowBatteryTable.filters.motionStatus')}
              </label>
              <div className="flex flex-wrap gap-2">
                {motionStatusOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => toggleArrayFilter('motionStatus', option.value)}
                    className={`px-3 sm:px-4 py-2 text-xs sm:text-sm rounded-lg border-2 transition-all ${filters.motionStatus.includes(option.value)
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                      }`}
                  >
                    <span className="mr-1 sm:mr-2">{option.icon}</span>
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Filtro de Temperatura */}
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                {t('lowBatteryTable.filters.temperature')} (°C)
              </label>
              <div className="grid grid-cols-2 gap-2 sm:gap-3">
                <div>
                  <label className="block text-xs text-gray-600 mb-1">
                    {t('lowBatteryTable.filters.min')}
                  </label>
                  <input
                    type="number"
                    value={filters.temperatureMin || ''}
                    onChange={(e) => updateFilter('temperatureMin', e.target.value ? parseFloat(e.target.value) : undefined)}
                    placeholder="Ex: -10"
                    className="w-full px-2 sm:px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">
                    {t('lowBatteryTable.filters.max')}
                  </label>
                  <input
                    type="number"
                    value={filters.temperatureMax || ''}
                    onChange={(e) => updateFilter('temperatureMax', e.target.value ? parseFloat(e.target.value) : undefined)}
                    placeholder="Ex: 50"
                    className="w-full px-2 sm:px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Filtro de Freshness */}
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                {t('lowBatteryTable.filters.reportFreshness')}
              </label>
              <div className="flex flex-wrap gap-2">
                {reportFreshnessOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => toggleArrayFilter('reportFreshness', option.value)}
                    className={`px-3 sm:px-4 py-2 text-xs sm:text-sm rounded-lg border-2 transition-all ${filters.reportFreshness.includes(option.value)
                      ? `border-${option.color}-500 bg-${option.color}-50 text-${option.color}-700`
                      : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                      }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 p-3 sm:p-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 sm:gap-0">
            <span className="text-xs sm:text-sm text-gray-600 text-center sm:text-left">
              {activeFiltersCount > 0
                ? t('lowBatteryTable.filters.activeFilters', { count: activeFiltersCount })
                : t('lowBatteryTable.filters.noActiveFilters')}
            </span>
            <button
              onClick={() => setIsOpen(false)}
              className="px-4 py-2 text-sm sm:text-base bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              {t('lowBatteryTable.filters.apply')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};



const DetailsModal = ({ device, isOpen, onClose }: DetailsModalProps) => {

  const { companyId } = useCompany()
  const [loading, setLoading] = useState(false);
  const [deviceDetails, setDeviceDetails] = useState<DeviceDetails | null>(null);
  const [activeDetailsTab, setActiveDetailsTab] = useState<'info' | 'route' | 'events' | 'config'>('info');



  // Adicione este estado no topo com os outros estados
  // const [healthScoreFilter, setHealthScoreFilter] = useState({
  //   excellent: true,
  //   good: true,
  //   fair: true,
  //   poor: true
  // });


  useEffect(() => {
    if (isOpen && device) {
      fetchDeviceDetails();
    }
  }, [isOpen, device]);

  const fetchDeviceDetails = async () => {
    if (!device) return;

    setLoading(true);
    try {
      const [routeRes, eventsRes, configRes] = await Promise.all([
        fetch(`https://apinode.smartxhub.cloud/api/dashboard/devices/${companyId}/route/${device.dev_eui}`),
        fetch(`https://apinode.smartxhub.cloud/api/dashboard/devices/${companyId}/events/${device.dev_eui}?limit=10`),
        fetch(`https://apinode.smartxhub.cloud/api/dashboard/devices/${companyId}/config/${device.dev_eui}`),
      ]);

      const routeData = await routeRes.json();
      const eventsData = await eventsRes.json();
      const configData = await configRes.json();

      setDeviceDetails({
        device,
        route24h: routeData,
        recentEvents: eventsData,
        configuration: configData,
      });
    } catch (error) {
      console.error('Error fetching device details:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !device) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />

      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-lg shadow-xl max-w-5xl w-full max-h-[90vh] overflow-hidden">
          <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50">
            <div>
              <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <DevicePhoneMobileIcon className="h-6 w-6 text-blue-600" />
                {t('deviceDetails.title')}
              </h3>
              <p className="mt-1 text-sm text-gray-600">{device.dev_eui}</p>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="overflow-y-auto max-h-[calc(90vh-180px)]">
            <div className="p-6 bg-gray-50">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                  <p className="text-xs text-gray-500 uppercase tracking-wide">{t('customer.label')}</p>
                  <p className="mt-1 text-sm font-semibold text-gray-900">{device.customer_name}</p>
                </div>
                <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                  <p className="text-xs text-gray-500 uppercase tracking-wide">{t('status.label')}</p>
                  <p className="mt-1 text-sm font-semibold">
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${device.dynamic_motion_state === 'MOVING' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                      {device.dynamic_motion_state === 'MOVING' ? t('motionState.moving') : '⏸️ ' + t('motionState.static')}
                    </span>
                  </p>
                </div>
                <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                  <p className="text-xs text-gray-500 uppercase tracking-wide">  {t('battery.label')}</p>
                  <div className="mt-1 flex items-center gap-2">
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${device.battery_level >= 30 ? 'bg-green-500' :
                          device.battery_level >= 20 ? 'bg-yellow-500' : 'bg-red-500'
                          }`}
                        style={{ width: `${device.battery_level}%` }}
                      />
                    </div>
                    <span className="text-sm font-semibold text-gray-900">{device.battery_level}%</span>
                  </div>
                </div>
                <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                  <p className="text-xs text-gray-500 uppercase tracking-wide">  {t('lastUpdate.label')}</p>
                  <p className="mt-1 text-xs font-medium text-gray-900">
                    {new Date(device.timestamp).toLocaleString('pt-BR')}
                  </p>
                </div>
              </div>
            </div>

            <div className="border-b border-gray-200 px-6">
              <nav className="-mb-px flex space-x-8">
                {[
                  { id: 'info', label: t('tabs.info'), icon: '📋' },
                  { id: 'route', label: t('tabs.route'), icon: '🗺️' },
                  { id: 'events', label: t('tabs.events'), icon: '🚨' },
                  { id: 'config', label: t('tabs.config'), icon: '⚙️' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveDetailsTab(tab.id as any)}
                    className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm ${activeDetailsTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                  >
                    <span>{tab.icon}</span>
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>

            <div className="p-6">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
              ) : (
                <>
                  {activeDetailsTab === 'info' && (
                    <div className="space-y-6">
                      <div className="bg-white border border-gray-200 rounded-lg p-6">
                        <h4 className="text-lg font-semibold text-gray-900 mb-4">
                          {t('generalInfo.title')}
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm text-gray-500">{t('generalInfo.deviceEUI')}</p>
                            <p className="mt-1 text-sm font-mono font-medium text-gray-900">{device.dev_eui}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">{t('generalInfo.customer')}</p>
                            <p className="mt-1 text-sm font-medium text-gray-900">{device.customer_name}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">{t('generalInfo.batteryLevel')}</p>
                            <p className="mt-1 text-sm font-medium text-gray-900">{device.battery_level}%</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">{t('generalInfo.motionState')}</p>
                            <p className="mt-1 text-sm font-medium text-gray-900">
                              {device.dynamic_motion_state === 'MOVING' ? t('motionState.moving') : t('motionState.static')}
                            </p>
                          </div>
                        </div>
                      </div>

                      {device.gps_latitude && device.gps_longitude && (
                        <div className="bg-white border border-gray-200 rounded-lg p-6">
                          <h4 className="text-lg font-semibold text-gray-900 mb-4">
                            {t('gpsLocation.title')}
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <p className="text-sm text-gray-500">{t('gpsLocation.latitude')}</p>
                              <p className="mt-1 text-sm font-mono font-medium text-gray-900">
                                {device.gps_latitude.toFixed(6)}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500">{t('gpsLocation.longitude')}</p>
                              <p className="mt-1 text-sm font-mono font-medium text-gray-900">
                                {device.gps_longitude.toFixed(6)}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {activeDetailsTab === 'route' && (
                    <div className="space-y-4">
                      {deviceDetails?.route24h && deviceDetails.route24h.length > 0 ? (
                        <>
                          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <p className="text-sm text-blue-800">
                              {t('route24h.positionsRegistered', { count: deviceDetails.route24h.length })}
                            </p>
                          </div>
                          <div className="overflow-y-auto max-h-[400px]">
                            <table className="min-w-full divide-y divide-gray-300">
                              <thead className="bg-gray-50 sticky top-0">
                                <tr>
                                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                    {t('route24h.time')}
                                  </th>
                                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                    {t('route24h.latitude')}
                                  </th>
                                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                    {t('route24h.longitude')}
                                  </th>
                                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                    {t('route24h.speed')}
                                  </th>
                                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                    {t('route24h.battery')}
                                  </th>
                                </tr>
                              </thead>
                              <tbody className="bg-white divide-y divide-gray-200">
                                {deviceDetails.route24h.map((point, idx) => (
                                  <tr key={idx} className="hover:bg-gray-50">
                                    <td className="px-4 py-3 text-sm text-gray-900">
                                      {new Date(point.timestamp).toLocaleString()}
                                    </td>
                                    <td className="px-4 py-3 text-sm font-mono text-gray-900">
                                      {point.latitude.toFixed(6)}
                                    </td>
                                    <td className="px-4 py-3 text-sm font-mono text-gray-900">
                                      {point.longitude.toFixed(6)}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-900">
                                      {point.speed ? `${point.speed.toFixed(1)} ${t('route24h.speedUnit')}` : t('route24h.notAvailable')}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-900">
                                      {point.battery_level}%
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </>
                      ) : (
                        <div className="text-center py-12 text-gray-500">
                          <MapPinIcon className="mx-auto h-12 w-12 text-gray-400" />
                          <p className="mt-2">{t('route24h.noRoute')}</p>
                        </div>
                      )}
                    </div>
                  )}

                  {activeDetailsTab === 'events' && (
                    <div className="space-y-4">
                      {deviceDetails?.recentEvents && deviceDetails.recentEvents.length > 0 ? (
                        <>
                          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                            <p className="text-sm text-purple-800">
                              {t('recentEvents.eventsCount', { count: deviceDetails.recentEvents.length })}
                            </p>
                          </div>
                          <div className="space-y-3">
                            {deviceDetails.recentEvents.map((event, idx) => (
                              <div key={idx} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                                <div className="flex items-start justify-between">
                                  <div>
                                    <p className="font-medium text-gray-900">{event.event_type}</p>
                                    <p className="text-xs text-gray-500 mt-1">
                                      {new Date(event.event_timestamp).toLocaleString()}
                                    </p>
                                  </div>
                                  <span className="text-xs font-medium text-gray-600">
                                    {t('recentEvents.battery', { level: event.battery_level })}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </>
                      ) : (
                        <div className="text-center py-12 text-gray-500">
                          <ShieldExclamationIcon className="mx-auto h-12 w-12 text-gray-400" />
                          <p className="mt-2">{t('recentEvents.noEvents')}</p>
                        </div>
                      )}
                    </div>
                  )}

                  {activeDetailsTab === 'config' && (
                    <div className="space-y-6">
                      {deviceDetails?.configuration ? (
                        <div className="bg-white border border-gray-200 rounded-lg p-6">
                          <h4 className="text-lg font-semibold text-gray-900 mb-4">
                            {t('deviceConfig.title')}
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <p className="text-sm text-gray-500">{t('deviceConfig.trackingMode')}</p>
                              <p className="mt-1 text-sm font-medium text-gray-900">
                                {deviceDetails.configuration.tracking_mode}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500">{t('deviceConfig.uplinkPeriod')}</p>
                              <p className="mt-1 text-sm font-medium text-gray-900">
                                {deviceDetails.configuration.tracking_ul_period}s
                              </p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500">{t('deviceConfig.batteryAtLastConfig')}</p>
                              <p className="mt-1 text-sm font-medium text-gray-900">
                                {deviceDetails.configuration.battery_level}%
                              </p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500">{t('deviceConfig.lastReconfiguration')}</p>
                              <p className="mt-1 text-sm font-medium text-gray-900">
                                {new Date(deviceDetails.configuration.last_config).toLocaleString()}
                              </p>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-12 text-gray-500">
                          <Cog6ToothIcon className="mx-auto h-12 w-12 text-gray-400" />
                          <p className="mt-2">{t('deviceConfig.notAvailable')}</p>
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              {t('common.close')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// =====================================
// 🗺️ FIX LEAFLET ICON ISSUE
// =====================================
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// =====================================
// 🗺️ COMPONENTE DE MODAL COM MAPA
// =====================================
interface MapModalProps {
  device: DevicePosition | null;
  isOpen: boolean;
  onClose: () => void;
}

const MapModal = ({ device, isOpen, onClose }: MapModalProps) => {

  const formatCoordinate = (coord: string | number | null | undefined): string => {
    if (coord === null || coord === undefined || coord === '') return 'N/A';

    try {
      const num = typeof coord === 'string' ? parseFloat(coord) : coord;
      if (isNaN(num)) return 'N/A';
      return num.toFixed(6);
    } catch {
      return 'N/A';
    }
  };

  if (!isOpen || !device) return null;

  const position: [number, number] = [
    device.gps_latitude || 0,
    device.gps_longitude || 0
  ];

  const isSOSAlert = device.dynamic_motion_state === 'SOS_ACTIVE';

  return (
    <div className="fixed inset-0 z-50 flex min-h-full items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="relative bg-white rounded-lg shadow-xl max-w-4xl w-full">
        <div className={`flex items-center justify-between p-6 border-b ${isSOSAlert ? 'border-red-200 bg-red-50' : 'border-gray-200'
          }`}>
          <div>
            <div className="flex items-center gap-2">
              {isSOSAlert && (
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 animate-pulse">
                  {t('locationModal.sosAlert')}
                </span>
              )}
              <h3 className={`text-lg font-semibold ${isSOSAlert ? 'text-red-900' : 'text-gray-900'}`}>
                {t('locationModal.title')}
              </h3>
            </div>
            <p className="mt-1 text-sm text-gray-600">
              {device.dev_eui} - {device.customer_name}
            </p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6">
          <div className={`h-[500px] rounded-lg overflow-hidden border-2 ${isSOSAlert ? 'border-red-400' : 'border-gray-200'
            }`}>
            <MapContainer
              center={position}
              zoom={15}
              style={{ height: '100%', width: '100%' }}
              scrollWheelZoom={true}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <Marker position={position}>
                <Popup>
                  <div className="p-2">
                    {isSOSAlert && (
                      <p className="font-bold text-red-600 mb-1">{t('locationModal.popup.sosAlert')}</p>
                    )}
                    <p className="font-semibold">{device.dev_eui}</p>
                    <p className="text-sm text-gray-600">{device.customer_name}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {t('locationModal.popup.battery')}: {device.battery_level}%
                    </p>
                    <p className="text-xs text-gray-500">
                      {t('locationModal.popup.status')}: {device.dynamic_motion_state === 'SOS_ACTIVE'
                        ? t('locationModal.status.sosActive')
                        : device.dynamic_motion_state}
                    </p>
                  </div>
                </Popup>
              </Marker>
            </MapContainer>
          </div>
        </div>

        <div className="px-6 pb-6">
          <div className={`grid grid-cols-2 md:grid-cols-4 gap-4 rounded-lg p-4 ${isSOSAlert ? 'bg-red-50' : 'bg-gray-50'
            }`}>
            <div>
              <p className="text-xs text-gray-500">{t('locationModal.metrics.status')}</p>
              <p className={`mt-1 font-medium ${isSOSAlert ? 'text-red-900' : 'text-gray-900'}`}>
                {device.dynamic_motion_state === 'SOS_ACTIVE'
                  ? t('locationModal.status.sosActive')
                  : device.dynamic_motion_state === 'MOVING'
                    ? t('locationModal.status.moving')
                    : t('locationModal.status.static')}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500">{t('locationModal.metrics.battery')}</p>
              <p className={`mt-1 font-medium ${device.battery_level < 20 ? 'text-red-600' : 'text-gray-900'
                }`}>
                {device.battery_level}%
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500">{t('locationModal.metrics.latitude')}</p>
              <p className="mt-1 font-mono text-sm text-gray-900">{formatCoordinate(device.gps_latitude)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">{t('locationModal.metrics.longitude')}</p>
              <p className="mt-1 font-mono text-sm text-gray-900">  {formatCoordinate(device.gps_longitude)}</p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 px-6 pb-6">
          <a
            href={`https://www.google.com/maps?q=${device.gps_latitude},${device.gps_longitude}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700"
          >
            {t('locationModal.actions.openGoogleMaps')}
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            {t('locationModal.actions.close')}
          </button>
        </div>
      </div>
    </div>
  );
};

type SortConfig = {
  key: string;
  direction: 'asc' | 'desc';
} | null

const DataTable = ({
  columns,
  data,
  emptyMessage = 'Nenhum dado disponível',
  sortableColumns = []
}: {
  columns: Array<{
    key: string;
    label: string;
    render?: (value: any, row: any) => React.ReactNode;
    sortValue?: (row: any) => any;
  }>;
  data: any[];
  emptyMessage?: string;
  sortableColumns?: string[];
}) => {
  const [sortConfig, setSortConfig] = useState<SortConfig>(null);

  const handleSort = (key: string) => {
    if (!sortableColumns.includes(key)) return;

    setSortConfig((current) => {
      if (current?.key === key) {
        return current.direction === 'asc'
          ? { key, direction: 'desc' }
          : null;
      }
      return { key, direction: 'asc' };
    });
  };

  const sortedData = useMemo(() => {
    if (!sortConfig) return data;

    const sorted = [...data].sort((a, b) => {
      const column = columns.find(col => col.key === sortConfig.key);
      const aValue = column?.sortValue ? column.sortValue(a) : a[sortConfig.key];
      const bValue = column?.sortValue ? column.sortValue(b) : b[sortConfig.key];

      if (aValue < bValue) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });

    return sorted;
  }, [data, sortConfig, columns]);

  const getSortIcon = (key: string) => {
    if (!sortableColumns.includes(key)) return null;

    if (sortConfig?.key !== key) {
      return <span className="ml-1 text-gray-400">⇅</span>;
    }

    return sortConfig.direction === 'asc'
      ? <span className="ml-1">↑</span>
      : <span className="ml-1">↓</span>;
  };

  return (
    <div className="overflow-x-auto border border-gray-300 rounded-lg">
      <div className="overflow-y-auto max-h-[600px]">
        <table className="min-w-full divide-y divide-gray-300">
          <thead className="bg-gray-50 sticky top-0 z-10">
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  onClick={() => handleSort(col.key)}
                  className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50 ${sortableColumns.includes(col.key) ? 'cursor-pointer hover:bg-gray-100 select-none' : ''
                    }`}
                >
                  <div className="flex items-center">
                    {col.label}
                    {getSortIcon(col.key)}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sortedData.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-6 py-8 text-center text-gray-500">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              sortedData.map((row, idx) => (
                <tr key={idx} className="hover:bg-gray-50 transition-colors">
                  {columns.map((col) => (
                    <td key={col.key} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {col.render ? col.render(row[col.key], row) : row[col.key]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const ChartContainer = ({
  id,
  title,
  height = '400px'
}: {
  id: string;
  title: string;
  height?: string;
}) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      <div id={id} style={{ height }} />
    </div>
  );
};


const EquipmentCard = ({ card, cardKey }: { card: any; cardKey: string }) => {

  const { t } = useTranslation();

  const colorClasses = {
    blue: 'bg-blue-50 border-blue-200',
    green: 'bg-green-50 border-green-200',
    red: 'bg-red-50 border-red-200',
    gray: 'bg-gray-50 border-gray-200',
  };

  const textColorClasses = {
    blue: 'text-blue-600',
    green: 'text-green-600',
    red: 'text-red-600',
    gray: 'text-gray-600',
  };

  const isPrimary = card.type === 'primary';

  // Busca a tradução baseada no cardKey
  const translatedTitle = t(`dashboardCard.equipmentCards.${cardKey}`);

  return (
    <div className={`rounded-lg border-2 p-6 transition-all hover:shadow-lg ${colorClasses[card.color as keyof typeof colorClasses]}`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className={`text-sm font-medium opacity-80 uppercase tracking-wide ${textColorClasses[card.color as keyof typeof textColorClasses]}`}>
            {/* {card.title} */}
            {translatedTitle}
          </p>
          <div className="mt-2 flex items-baseline gap-2">
            <p className={`font-bold ${isPrimary ? 'text-4xl' : 'text-3xl'} ${textColorClasses[card.color as keyof typeof textColorClasses]}`}>
              {card.value}
            </p>
            {card.percentage && (
              <span className={`text-sm font-medium opacity-75 ${textColorClasses[card.color as keyof typeof textColorClasses]}`}>
                ({card.percentage}%)
              </span>
            )}
          </div>
        </div>
        <div className="text-4xl">
          {card.icon}
        </div>
      </div>
    </div>
  );
};

const ActivityCard = ({ card, cardKey }: { card: any; cardKey: string }) => {
  const { t } = useTranslation();
  const colorClasses = {
    green: 'bg-green-50 border-green-200',
    orange: 'bg-orange-50 border-orange-200',
    yellow: 'bg-yellow-50 border-yellow-200',
  };

  const textColorClasses = {
    green: 'text-green-700',
    orange: 'text-orange-700',
    yellow: 'text-yellow-700',
  };

  // Busca a tradução baseada no cardKey
  const translatedTitle = t(`dashboardCard.activityCards.${cardKey}`);

  return (
    <div className={`rounded-lg border-2 p-5 transition-all hover:shadow-md ${colorClasses[card.color as keyof typeof colorClasses]}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className={`text-xs font-medium opacity-80 uppercase tracking-wide ${textColorClasses[card.color as keyof typeof textColorClasses]}`}>
            {/* {card.title} */}
            {translatedTitle}
          </p>
          <p className={`mt-1 text-3xl font-bold ${textColorClasses[card.color as keyof typeof textColorClasses]}`}>
            {card.value}
          </p>
        </div>
        <div className="text-3xl">
          {card.icon}
        </div>
      </div>
    </div>
  );
};

// const GPSCard = ({ card, cardKey }: { card: any; cardKey: string }) => {
//   const { t } = useTranslation();

//   const colorClasses = {
//     green: 'bg-gradient-to-br from-green-50 to-green-100 border-green-300',
//     blue: 'bg-gradient-to-br from-blue-50 to-blue-100 border-blue-300',
//     teal: 'bg-gradient-to-br from-teal-50 to-teal-100 border-teal-300',
//     red: 'bg-gradient-to-br from-red-50 to-red-100 border-red-300',
//   };

//   // Busca a tradução baseada no cardKey
//   const translatedTitle = t(`dashboardCard.gpsCards.${cardKey}`);
//   const translatedDescription = t(`dashboardCard.gpsCards.descriptions.${cardKey}`);


//   return (
//     <div className={`rounded-lg border-2 p-5 transition-all hover:shadow-lg ${colorClasses[card.color as keyof typeof colorClasses]}`}>
//       <div className="flex items-start gap-3">
//         <div className="text-3xl mt-1">
//           {card.icon}
//         </div>
//         <div className="flex-1">
//           <p className="text-sm font-semibold text-gray-700">
//             {/* {card.title} */}
//             {translatedTitle}
//           </p>
//           <p className="mt-1 text-3xl font-bold text-gray-900">
//             {card.value}
//           </p>
//           <p className="mt-1 text-xs text-gray-600">
//             {/* {card.description} */}
//             {translatedDescription}
//           </p>
//         </div>
//       </div>
//     </div>
//   );
// };

// Função para converter string para número seguro
const safeParseNumber = (value: string | number): number => {
  if (typeof value === 'number') return value;
  return parseFloat(value) || 0;
};

// Função para adaptar os dados da API
const adaptDashboardData = (apiData: any): DashboardOverview => {
  return {
    ...apiData,
    // Mantemos a estrutura original da API
  };
};


// Adicione este componente antes do DeviceLogsView:

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
}

const Pagination = ({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
  onLimitChange,
}: PaginationProps) => {
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);

      let startPage = Math.max(2, currentPage - 1);
      let endPage = Math.min(totalPages - 1, currentPage + 1);

      if (startPage > 2) pages.push('...');

      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }

      if (endPage < totalPages - 1) pages.push('...');
      pages.push(totalPages);
    }

    return pages;
  };

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 px-4 py-3 bg-gray-50 border-t border-gray-200 rounded-b-lg">
      {/* Info */}
      <div className="text-sm text-gray-700">
        {t('pagination.showing')} <span className="font-medium">{startItem}</span> {t('pagination.to')}{' '}
        <span className="font-medium">{endItem}</span> {t('pagination.of')}{' '}
        <span className="font-medium">{totalItems}</span> {t('pagination.results')}
      </div>

      {/* Controles */}
      <div className="flex items-center gap-4">
        {/* Items per page */}
        <div className="flex items-center gap-2">
          <label htmlFor="itemsPerPage" className="text-sm text-gray-700 whitespace-nowrap">
            {t('pagination.perPage')}
          </label>
          <select
            id="itemsPerPage"
            value={itemsPerPage}
            onChange={(e) => onLimitChange(Number(e.target.value))}
            className="rounded-md border-gray-300 text-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
        </div>

        {/* Navigation */}
        <nav className="flex items-center gap-2">
          {/* Previous */}
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            title={t('pagination.previous')}
          >
            ←
          </button>

          {/* Page numbers */}
          <div className="hidden sm:flex items-center gap-1">
            {getPageNumbers().map((page, idx) => (
              page === '...' ? (
                <span key={`ellipsis-${idx}`} className="px-3 py-2 text-sm text-gray-700">
                  ...
                </span>
              ) : (
                <button
                  key={page}
                  onClick={() => onPageChange(page as number)}
                  className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${currentPage === page
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
                    }`}
                >
                  {page}
                </button>
              )
            ))}
          </div>

          {/* Mobile: apenas número da página atual */}
          <div className="sm:hidden px-3 py-2 text-sm text-gray-700 font-medium">
            {t('pagination.page')} {currentPage} de {totalPages}
          </div>

          {/* Next */}
          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            title={t('pagination.next')}
          >
            →
          </button>
        </nav>
      </div>
    </div>
  );
};


interface QuickExportButtonsProps {
  data: any[];
  filters: any;
  totalItems?: number;
  isFiltered: boolean;
}

// export const QuickExportButtons = ({ data, filters }: QuickExportButtonsProps) => {
//   const { t, i18n } = useTranslation();
//   const [isExporting, setIsExporting] = useState<string | null>(null);

//   const getCurrentLocale = (): 'pt' | 'es' | 'en' => {
//     const lang = i18n.language.toLowerCase();
//     if (lang.startsWith('pt')) return 'pt';
//     if (lang.startsWith('es')) return 'es';
//     return 'en';
//   };

//   const handleQuickExport = async (type: 'excel' | 'pdf') => {
//     setIsExporting(type);
//     try {
//       const filename = `report_battery${new Date().toISOString().split('T')[0]}`;
//       const locale = getCurrentLocale();

//       if (type === 'excel') {
//         exportToExcel({
//           data,
//           filename,
//           includeFilters: true,
//           filters,
//           locale
//         });
//       } else {
//         exportToPDF({
//           data,
//           filename,
//           title: t('lowBatteryTable.export.pdfTitle'),
//           includeFilters: true,
//           filters,
//           orientation: 'landscape',
//           locale
//         });
//       }
//     } catch (error) {
//       console.error(`Erro ao exportar ${type}:`, error);
//       alert(t('export.error'));
//     } finally {
//       setIsExporting(null);
//     }
//   };

//   return (
//     <div className="flex items-center gap-2">
//       {/* Botão Excel */}
//       <button
//         onClick={() => handleQuickExport('excel')}
//         disabled={isExporting !== null || data.length === 0}
//         className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${data.length === 0
//           ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
//           : 'bg-green-600 text-white hover:bg-green-700'
//           }`}
//         title={t('export.excel.full')}
//       >
//         {isExporting === 'excel' ? (
//           <>
//             <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
//             <span className="text-sm">{t('export.exporting')}</span>
//           </>
//         ) : (
//           <>
//             <TableCellsIcon className="h-4 w-4" />
//             <span className="text-sm">Excel</span>
//           </>
//         )}
//       </button>

//       {/* Botão PDF */}
//       <button
//         onClick={() => handleQuickExport('pdf')}
//         disabled={isExporting !== null || data.length === 0}
//         className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${data.length === 0
//           ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
//           : 'bg-red-600 text-white hover:bg-red-700'
//           }`}
//         title={t('export.pdf.title')}
//       >
//         {isExporting === 'pdf' ? (
//           <>
//             <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
//             <span className="text-sm">{t('export.exporting')}</span>
//           </>
//         ) : (
//           <>
//             <DocumentTextIcon className="h-4 w-4" />
//             <span className="text-sm">PDF</span>
//           </>
//         )}
//       </button>
//     </div>
//   );
// };

//



export const QuickExportButtons = ({
  data,
  filters,
  totalItems,
  isFiltered
}: QuickExportButtonsProps) => {
  const { t, i18n } = useTranslation();
  const { companyId } = useCompany()
  const [isExporting, setIsExporting] = useState<string | null>(null);
  const [showExportModal, setShowExportModal] = useState(false);
  //@ts-ignore
  const [pendingExportType, setPendingExportType] = useState<'excel' | 'pdf' | null>(null);

  const getCurrentLocale = (): 'pt' | 'es' | 'en' => {
    const lang = i18n.language.toLowerCase();
    if (lang.startsWith('pt')) return 'pt';
    if (lang.startsWith('es')) return 'es';
    return 'en';
  };



  const handleExportClick = (type: 'excel' | 'pdf') => {
    setPendingExportType(type);
    setShowExportModal(true);
  };

  const handleExport = async (type: 'excel' | 'pdf', exportAll: boolean) => {
    setIsExporting(type);
    try {
      const filename = `battery_report_${new Date().toISOString().split('T')[0]}`;
      const locale = getCurrentLocale();

      // Se exportar tudo, precisa buscar todos os dados
      let dataToExport = data;
      if (exportAll) {
        // Aqui você fará uma chamada à API para buscar TODOS os dados
        const response = await fetch(
          `https://apinode.smartxhub.cloud/api/dashboard/devices/${companyId}/low-battery?limit=999999`
        );
        const result = await response.json();
        dataToExport = result.data || [];
      }

      if (type === 'excel') {
        exportToExcel({
          data: dataToExport,
          filename,
          includeFilters: !exportAll, // Só inclui filtros se não for exportação total
          filters: exportAll ? undefined : filters,
          locale
        });
      } else {
        exportToPDF({
          data: dataToExport,
          filename,
          title: t('lowBatteryTable.export.pdfTitle'),
          includeFilters: !exportAll,
          filters: exportAll ? undefined : filters,
          orientation: 'landscape',
          locale
        });
      }
    } catch (error) {
      console.error(`Erro ao exportar ${type}:`, error);
      alert(t('export.error'));
    } finally {
      setIsExporting(null);
      setPendingExportType(null);
    }
  };

  return (
    <>
      <div className="flex items-center gap-2">
        {/* Botão Excel */}
        <button
          onClick={() => handleExportClick('excel')}
          disabled={isExporting !== null || data.length === 0}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${data.length === 0
            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
            : 'bg-green-600 text-white hover:bg-green-700'
            }`}
          title={t('export.excel.full')}
        >
          {isExporting === 'excel' ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
              <span className="text-sm">{t('export.exporting')}</span>
            </>
          ) : (
            <>
              <TableCellsIcon className="h-4 w-4" />
              <span className="text-sm">Excel</span>
            </>
          )}
        </button>

        {/* Botão PDF */}
        <button
          onClick={() => handleExportClick('pdf')}
          disabled={isExporting !== null || data.length === 0}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${data.length === 0
            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
            : 'bg-red-600 text-white hover:bg-red-700'
            }`}
          title={t('export.pdf.title')}
        >
          {isExporting === 'pdf' ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
              <span className="text-sm">{t('export.exporting')}</span>
            </>
          ) : (
            <>
              <DocumentTextIcon className="h-4 w-4" />
              <span className="text-sm">PDF</span>
            </>
          )}
        </button>
      </div>

      {/* Modal de Exportação */}
      <ExportModal
        isOpen={showExportModal}
        onClose={() => {
          setShowExportModal(false);
          setPendingExportType(null);
        }}
        onExport={handleExport}
        filteredCount={data.length}
        totalCount={totalItems || 0}
        hasActiveFilters={isFiltered}
      />
    </>
  );
};




const BatteryPieChart = ({ data }: BatteryPieChartProps) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstanceRef = useRef<echarts.ECharts | null>(null);
  const { t } = useTranslation();

  useEffect(() => {
    if (!chartRef.current) return;

    // Criar ou obter instância
    if (!chartInstanceRef.current) {
      chartInstanceRef.current = echarts.init(chartRef.current);
    }

    const option: EChartsOption = {
      tooltip: {
        trigger: 'item',
        formatter: t('batteryChart.tooltip'),
      },
      legend: {
        orient: 'vertical',
        left: 'left',
      },
      series: [
        {
          name: t('batteryChart.seriesName'),
          type: 'pie',
          radius: '70%',
          data: [
            {
              value: data.healthy,
              name: t('batteryChart.healthy'),
              itemStyle: { color: '#10b981' }
            },
            {
              value: data.warning,
              name: t('batteryChart.warning'),
              itemStyle: { color: '#f59e0b' }
            },
            {
              value: data.critical,
              name: t('batteryChart.critical'),
              itemStyle: { color: '#ef4444' }
            },
          ],
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.5)',
            },
          },
        },
      ],
    };

    chartInstanceRef.current.setOption(option);

    // Resize handler
    const handleResize = () => {
      chartInstanceRef.current?.resize();
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [data, t]);

  // Cleanup ao desmontar
  useEffect(() => {
    return () => {
      chartInstanceRef.current?.dispose();
      chartInstanceRef.current = null;
    };
  }, []);

  return <div ref={chartRef} className="w-full h-full min-w-0" />;
};

export default function DeviceLogsView() {

  const { t } = useTranslation();
  const { companyId } = useCompany()
  const [loading, setLoading] = useState(true);
  const [overview, setOverview] = useState<DashboardOverview | null>(null);
  const [motionDevices, setMotionDevices] = useState<DevicePosition[]>([]);
  const [gatewayQuality, setGatewayQuality] = useState<GatewaySignal[]>([]);
  const [eventTypes, setEventTypes] = useState<EventTypeStats[]>([]);
  const [customerStats, setCustomerStats] = useState<CustomerActivity[]>([]);

  const [activeTab, setActiveTab] = useState<'overview' | 'mapview' | 'devices' | 'events' | 'network' | 'customers' | 'rawdata'>('overview');
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const [dashboardCards, setDashboardCards] = useState<any>(null);


  //Estado tabela baterias
  const [lowBatteryPage, setLowBatteryPage] = useState(1);
  const [lowBatteryLimit, setLowBatteryLimit] = useState(10);
  const [lowBatteryData, setLowBatteryData] = useState<any>({
    data: [],
    pagination: {
      currentPage: 1,
      totalPages: 1,
      totalItems: 0,
      itemsPerPage: 10,
      hasNextPage: false,
      hasPreviousPage: false,
    },
  });
  const [loadingLowBattery, setLoadingLowBattery] = useState(false);

  // Adicione estes estados junto com os outros estados de lowBattery
  const [sortField, setSortField] = useState<string>('battery_level');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // const [filters] = useState({
  //   personName: '',
  //   batteryLevelMin: 0,
  //   batteryLevelMax: 100,
  //   batteryStatus: [] as string[],
  //   motionStatus: [] as string[],
  //   reportFreshness: [] as string[],
  //   temperatureMin: undefined as number | undefined,
  //   temperatureMax: undefined as number | undefined,
  // });


  const [filters, setFilters] = useState<FilterOptions>({
    personName: '',
    devUid: '',
    batteryLevelMin: 0,
    batteryLevelMax: 100,
    batteryStatus: [] as string[],
    motionStatus: [] as string[],
    reportFreshness: [] as string[],
    temperatureMin: undefined,
    temperatureMax: undefined,
  });


  // Debounce para o filtro de nome (instale lodash se não tiver: npm install lodash @types/lodash)
  const [debouncedPersonName, setDebouncedPersonName] = useState('');

  // ✨ NOVO: Estados para controle de refresh
  // const [autoRefreshEnabled, setAutoRefreshEnabled] = useState(true);
  // const [refreshInterval, setRefreshInterval] = useState(60000); // 30 segundos padrão

  const [selectedDevice, setSelectedDevice] = useState<DevicePosition | null>(null);
  const [isMapModalOpen, setIsMapModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  const [healthScoreData, setHealthScoreData] = useState<any[]>([]);

  const openMapModal = (device: DevicePosition) => {
    setSelectedDevice(device);
    setIsMapModalOpen(true);
  };

  const closeMapModal = () => {
    setIsMapModalOpen(false);
    setSelectedDevice(null);
  };

  const openDetailsModal = (device: DevicePosition) => {
    setSelectedDevice(device);
    setIsDetailsModalOpen(true);
  };

  const closeDetailsModal = () => {
    setIsDetailsModalOpen(false);
    setSelectedDevice(null);
  };

  const fetchData = async () => {
    setRefreshing(true);

    console.log(healthScoreData)

    //https://apinode.smartxhub.cloud

    try {
      const [overviewRes, motionRes, gatewayRes, eventsRes, customerRes] = await Promise.all([
        fetch(`https://apinode.smartxhub.cloud/api/dashboard/devices/${companyId}/dashboard/overview`),
        fetch(`https://apinode.smartxhub.cloud/api/dashboard/devices/${companyId}/motion-state`),
        fetch(`https://apinode.smartxhub.cloud/api/dashboard/devices/${companyId}/gateway-quality`),
        fetch(`https://apinode.smartxhub.cloud/api/dashboard/devices/${companyId}/events/types`),
        fetch(`https://apinode.smartxhub.cloud/api/dashboard/devices/${companyId}/customer-stats`),
      ]);

      const overviewData = await overviewRes.json();
      const motionData = await motionRes.json();
      const gatewayData = await gatewayRes.json();
      const eventsData = await eventsRes.json();
      const customerData = await customerRes.json();


      // Adapte os dados da overview
      const adaptedOverview = adaptDashboardData(overviewData);

      setOverview(adaptedOverview);
      setMotionDevices(motionData);
      setGatewayQuality(gatewayData);
      setEventTypes(eventsData);
      setCustomerStats(customerData);

      // ✅ LOG PARA DEBUG - Verifique se battery_health existe

      await fetchDashboardCards();

    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);

    }
  };

  const fetchDashboardCards = async () => {
    try {
      const response = await fetch(
        `https://apinode.smartxhub.cloud/api/dashboard/devices/${companyId}/dashboards`
      );
      const data = await response.json();

      if (data.success) {
        setDashboardCards(data.data);
      }
    } catch (error) {
      console.error('Error fetching dashboard cards:', error);
    }
  };


  const fetchLowBatteryData = async (page: number = lowBatteryPage, limit: number = lowBatteryLimit) => {
    setLoadingLowBattery(true);
    try {
      // Construir query params
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        sortField,
        sortOrder,
      });

      // Adicionar filtros se existirem
      if (debouncedPersonName) params.append('personName', debouncedPersonName);
      if (filters.devUid) params.append('devUid', filters.devUid);
      if (filters.batteryLevelMin !== undefined) params.append('batteryLevelMin', filters.batteryLevelMin.toString());
      if (filters.batteryLevelMax !== undefined) params.append('batteryLevelMax', filters.batteryLevelMax.toString());
      if (filters.batteryStatus.length > 0) params.append('batteryStatus', filters.batteryStatus.join(','));
      if (filters.motionStatus.length > 0) params.append('motionStatus', filters.motionStatus.join(','));
      if (filters.reportFreshness.length > 0) params.append('reportFreshness', filters.reportFreshness.join(','));
      if (filters.temperatureMin !== undefined) params.append('temperatureMin', filters.temperatureMin.toString());
      if (filters.temperatureMax !== undefined) params.append('temperatureMax', filters.temperatureMax.toString());

      const response = await fetch(
        `https://apinode.smartxhub.cloud/api/dashboard/devices/${companyId}/low-battery?${params}`
      );
      const result = await response.json();

      const adaptedData = {
        data: result.data || [],
        pagination: {
          currentPage: result.page || 1,
          totalPages: result.totalPages || 1,
          totalItems: result.total || 0,
          itemsPerPage: result.limit || 10,
          hasNextPage: result.page < result.totalPages,
          hasPreviousPage: result.page > 1,
        },
      };

      setLowBatteryData(adaptedData);
    } catch (error) {
      console.error('Error fetching low battery data:', error);
    } finally {
      setLoadingLowBattery(false);
    }
  };

  // 1 ✨ ATUALIZADO: useEffect com controle de auto-refresh
  useEffect(() => {
    fetchData(); // Buscar dados inicialmente

    // let interval: any;

    // if (autoRefreshEnabled) {
    //   interval = setInterval(fetchData, refreshInterval);
    // }

    // return () => {
    //   if (interval) {
    //     clearInterval(interval);
    //   }
    // };
    //autoRefreshEnabled, refreshInterval
  }, []);

  // 2 useEffect para buscar quando mudar página ou limite
  useEffect(() => {
    if (companyId && activeTab === 'overview') {
      fetchLowBatteryData();
    }
  }, [companyId, lowBatteryPage, lowBatteryLimit, activeTab]);


  // 3 Adicione este useEffect para o gráfico de health score por categoria
  useEffect(() => {
    if (!overview || activeTab !== 'overview') return;

    const fetchHealthScoreData = async () => {
      try {
        const response = await fetch(`https://apinode.smartxhub.cloud/api/dashboard/devices/${companyId}/health-score/category`);
        const healthData = await response.json();

        if (healthData.success && healthData.data) {
          setHealthScoreData(healthData.data);

          // Inicializar o gráfico após um breve delay
          setTimeout(() => {
            initHealthScoreChart(healthData.data);
          }, 100);
        }
      } catch (error) {
        console.error('Error fetching health score data:', error);
      }
    };

    fetchHealthScoreData();
  }, [overview, activeTab, companyId]);

  // 4
  // useEffect(() => {
  //   if (!overview) return;

  //   // const timer = setTimeout(() => {
  //   // }, 100);
  //   try {
  //     const batteryElement = document.getElementById('battery-chart');
  //     if (batteryElement) {
  //       const batteryChart = echarts.init(batteryElement);
  //       const batteryOption: EChartsOption = {
  //         tooltip: {
  //           trigger: 'item',
  //           formatter: t('batteryChart.tooltip'),
  //         },
  //         legend: {
  //           orient: 'vertical',
  //           left: 'left',
  //         },
  //         series: [
  //           {
  //             name: t('batteryChart.seriesName'),
  //             type: 'pie',
  //             radius: '70%',
  //             data: [
  //               {
  //                 value: safeParseNumber(overview?.kpis.battery_health?.healthy_devices),
  //                 name: t('batteryChart.healthy'),
  //                 itemStyle: { color: '#10b981' }
  //               },
  //               {
  //                 value: safeParseNumber(overview.kpis.battery_health.warning_devices),
  //                 name: t('batteryChart.warning'),
  //                 itemStyle: { color: '#f59e0b' }
  //               },
  //               {
  //                 value: safeParseNumber(overview.kpis.battery_health.critical_devices),
  //                 name: t('batteryChart.critical'),
  //                 itemStyle: { color: '#ef4444' }
  //               },
  //             ],
  //             emphasis: {
  //               itemStyle: {
  //                 shadowBlur: 10,
  //                 shadowOffsetX: 0,
  //                 shadowColor: 'rgba(0, 0, 0, 0.5)',
  //               },
  //             },
  //           },
  //         ],
  //       };
  //       batteryChart.setOption(batteryOption);
  //     }

  //     const accuracyElement = document.getElementById('accuracy-chart');
  //     if (accuracyElement) {
  //       const accuracyChart = echarts.init(accuracyElement);
  //       const accuracyOption: EChartsOption = {
  //         tooltip: {
  //           trigger: 'axis',
  //           axisPointer: { type: 'shadow' },
  //         },
  //         grid: {
  //           left: '3%',
  //           right: '4%',
  //           bottom: '3%',
  //           containLabel: true,
  //         },
  //         xAxis: {
  //           type: 'category',
  //           data: overview.kpis.accuracy_distribution.map(d => {
  //             const range = d.accuracy_range;
  //             if (range.includes('Excellent')) return t('accuracyChart.accuracyRanges.excellent');
  //             if (range.includes('Good')) return t('accuracyChart.accuracyRanges.good');
  //             if (range.includes('Fair')) return t('accuracyChart.accuracyRanges.fair');
  //             if (range.includes('Poor')) return t('accuracyChart.accuracyRanges.poor');
  //             return range;
  //           }),
  //           axisLabel: {
  //             rotate: 45,
  //             fontSize: 11,
  //           },
  //         },
  //         yAxis: {
  //           type: 'value',
  //           name: t('accuracyChart.yAxis.name'),
  //         },
  //         series: [
  //           {
  //             name: t('accuracyChart.series.name'),
  //             type: 'bar',
  //             data: overview.kpis.accuracy_distribution.map(d => ({
  //               value: d.report_count,
  //               itemStyle: {
  //                 color: d.accuracy_range.includes('Excellent') ? '#10b981' :
  //                   d.accuracy_range.includes('Good') ? '#3b82f6' :
  //                     d.accuracy_range.includes('Fair') ? '#f59e0b' : '#ef4444',
  //               },
  //             })),
  //             label: {
  //               show: true,
  //               position: 'top',
  //               formatter: '{c}',
  //             },
  //           },
  //         ],
  //       };
  //       accuracyChart.setOption(accuracyOption);
  //     }

  //     if (gatewayQuality.length > 0) {
  //       const gatewayElement = document.getElementById('gateway-chart');
  //       if (gatewayElement) {
  //         const gatewayChart = echarts.init(gatewayElement);
  //         const gatewayOption: EChartsOption = {
  //           tooltip: {
  //             trigger: 'axis',
  //             axisPointer: { type: 'cross' },
  //           },
  //           legend: {
  //             data: [
  //               t('gatewayChart.legend.avgRssi'),
  //               t('gatewayChart.legend.avgSnr'),
  //               t('gatewayChart.legend.reportCount')
  //             ],
  //           },
  //           grid: {
  //             left: '3%',
  //             right: '4%',
  //             bottom: '10%',
  //             containLabel: true,
  //           },
  //           xAxis: {
  //             type: 'category',
  //             data: gatewayQuality.map(g => g.gateway_name),
  //             axisLabel: {
  //               rotate: 45,
  //               fontSize: 10,
  //             },
  //           },
  //           yAxis: [
  //             {
  //               type: 'value',
  //               name: t('gatewayChart.yAxis.rssiSnr'),
  //               position: 'left',
  //             },
  //             {
  //               type: 'value',
  //               name: t('gatewayChart.yAxis.count'),
  //               position: 'right',
  //             },
  //           ],
  //           series: [
  //             {
  //               name: t('gatewayChart.legend.avgRssi'),
  //               type: 'line',
  //               data: gatewayQuality.map(g => g.avg_rssi),
  //               itemStyle: { color: '#3b82f6' },
  //             },
  //             {
  //               name: t('gatewayChart.legend.avgSnr'),
  //               type: 'line',
  //               data: gatewayQuality.map(g => g.avg_snr),
  //               itemStyle: { color: '#10b981' },
  //             },
  //             {
  //               name: t('gatewayChart.legend.reportCount'),
  //               type: 'bar',
  //               yAxisIndex: 1,
  //               data: gatewayQuality.map(g => g.report_count),
  //               itemStyle: { color: '#8b5cf6' },
  //             },
  //           ],
  //         };
  //         gatewayChart.setOption(gatewayOption);
  //       }
  //     }

  //     if (eventTypes.length > 0) {
  //       const eventsElement = document.getElementById('events-chart');
  //       if (eventsElement) {
  //         const eventsChart = echarts.init(eventsElement);
  //         const eventsOption: EChartsOption = {
  //           tooltip: {
  //             trigger: 'axis',
  //             axisPointer: { type: 'shadow' },
  //           },
  //           legend: {
  //             data: [
  //               t('eventsChart.legend.validEvents'),
  //               t('eventsChart.legend.duplicates')
  //             ],
  //           },
  //           grid: {
  //             left: '3%',
  //             right: '4%',
  //             bottom: '15%',
  //             containLabel: true,
  //           },
  //           xAxis: {
  //             type: 'category',
  //             data: eventTypes.map(e => e.event_type),
  //             axisLabel: {
  //               rotate: 45,
  //               fontSize: 10,
  //             },
  //           },
  //           yAxis: {
  //             type: 'value',
  //             name: t('eventsChart.yAxis.name'),
  //           },
  //           series: [
  //             {
  //               name: t('eventsChart.legend.validEvents'),
  //               type: 'bar',
  //               stack: 'total',
  //               data: eventTypes.map(e => e.valid_events),
  //               itemStyle: { color: '#10b981' },
  //             },
  //             {
  //               name: t('eventsChart.legend.duplicates'),
  //               type: 'bar',
  //               stack: 'total',
  //               data: eventTypes.map(e => e.duplicate_events),
  //               itemStyle: { color: '#ef4444' },
  //             },
  //           ],
  //         };
  //         eventsChart.setOption(eventsOption);
  //       }
  //     }
  //   } catch (error) {
  //     console.error('Error initializing charts:', error);
  //   }

  //   return () => {
  //     // clearTimeout(timer);

  //     const batteryElement = document.getElementById('battery-chart');
  //     const accuracyElement = document.getElementById('accuracy-chart');
  //     const gatewayElement = document.getElementById('gateway-chart');
  //     const eventsElement = document.getElementById('events-chart');

  //     if (batteryElement) {
  //       const batteryInstance = echarts.getInstanceByDom(batteryElement);
  //       batteryInstance?.dispose();
  //     }
  //     if (accuracyElement) {
  //       const accuracyInstance = echarts.getInstanceByDom(accuracyElement);
  //       accuracyInstance?.dispose();
  //     }
  //     if (gatewayElement) {
  //       const gatewayInstance = echarts.getInstanceByDom(gatewayElement);
  //       gatewayInstance?.dispose();
  //     }
  //     if (eventsElement) {
  //       const eventsInstance = echarts.getInstanceByDom(eventsElement);
  //       eventsInstance?.dispose();
  //     }
  //   };
  // }, [overview, gatewayQuality, eventTypes, activeTab]);

  // 5 useEffect para debounce do nome
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedPersonName(filters.personName);
    }, 500);

    return () => clearTimeout(timer);
  }, [filters.personName]);

  // 6 useEffect para buscar quando mudar filtros, sort ou paginação
  useEffect(() => {
    if (companyId && activeTab === 'overview') {
      fetchLowBatteryData();
    }
  }, [
    companyId,
    lowBatteryPage,
    lowBatteryLimit,
    activeTab,
    sortField,
    sortOrder,
    debouncedPersonName,
    filters.devUid,
    filters.batteryLevelMin,
    filters.batteryLevelMax,
    filters.batteryStatus,
    filters.motionStatus,
    filters.reportFreshness,
    filters.temperatureMin,
    filters.temperatureMax,
  ]);

  //  ✨ NOVA FUNÇÃO: Alternar auto-refresh
  // const toggleAutoRefresh = () => {
  //   setAutoRefreshEnabled(prev => !prev);
  // };

  // // ✨ NOVA FUNÇÃO: Alterar intervalo de refresh
  // const handleIntervalChange = (interval: number) => {
  //   setRefreshInterval(interval);
  // };

  // ✨ NOVA FUNÇÃO: Refresh manual
  const handleManualRefresh = () => {
    fetchData();
  };


  // 3. ADICIONAR FUNÇÕES DE MANIPULAÇÃO DE FILTROS
  const handleFiltersChange = (newFilters: FilterOptions) => {
    setFilters(newFilters);
    setLowBatteryPage(1); // Resetar para primeira página ao filtrar
  };


  const handleClearFilters = () => {
    setFilters({
      personName: '',
      devUid: '',
      batteryLevelMin: 0,
      batteryLevelMax: 100,
      batteryStatus: [],
      motionStatus: [],
      reportFreshness: [],
      temperatureMin: undefined,
      temperatureMax: undefined,
    });
    setLowBatteryPage(1);
  };


  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.personName) count++;
    if (filters.batteryLevelMin !== 0 || filters.batteryLevelMax !== 100) count++;
    if (filters.batteryStatus.length > 0) count++;
    if (filters.motionStatus.length > 0) count++;
    if (filters.reportFreshness.length > 0) count++;
    if (filters.temperatureMin !== undefined || filters.temperatureMax !== undefined) count++;
    return count;
  };


  // Função auxiliar para determinar a cor baseada no score
  const getHealthScoreColor = (score: number): string => {
    if (score >= 80) return '#10b981'; // Verde para scores altos
    if (score >= 60) return '#f59e0b'; // Amarelo para scores médios
    if (score >= 40) return '#f97316'; // Laranja para scores baixos
    return '#ef4444'; // Vermelho para scores muito baixos
  };



  // Função para inicializar o gráfico de health score
  const initHealthScoreChart = (data: any[]) => {
    const chartElement = document.getElementById('health-score-chart');
    if (!chartElement) return;

    const chart = echarts.init(chartElement);

    // Ordenar dados por valor (maior para menor)
    const sortedData = [...data].sort((a, b) => parseFloat(b.VALUE) - parseFloat(a.VALUE));

    const option: EChartsOption = {
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow'
        },
        formatter: (params: any) => {
          const data = params[0];
          return `
          <strong>${data.name}</strong><br/>
          ${t('deviceLogs.healthScoreChart.score')}: <b>${data.value}%</b><br/>
          ${t('deviceLogs.healthScoreChart.devices')}: ${data.data.total_devices}
        `;
        }
      },
      legend: {
        type: 'scroll',
        top: 'bottom',
        textStyle: { fontSize: 11 },
        selectedMode: 'multiple', // permite selecionar mais de um filtro
      },
      grid: {
        left: '3%',
        right: '8%',
        bottom: '15%',
        top: '3%',
        containLabel: true
      },
      xAxis: {
        type: 'value',
        name: t('deviceLogs.healthScoreChart.xAxis.name'),
        nameLocation: 'middle',
        nameGap: 30,
        axisLabel: {
          formatter: '{value}%'
        },
        max: 100,
        min: 0
      },
      yAxis: {
        type: 'category',
        data: sortedData.map(item => item.NAME),
        axisLabel: {
          fontSize: 11,
          formatter: (value: string) => {
            // Truncar labels muito longos
            return value.length > 20 ? value.substring(0, 20) + '...' : value;
          }
        },
        axisTick: {
          alignWithLabel: true
        }
      },
      series: [
        {
          name: t('deviceLogs.healthScoreChart.series.name'),
          type: 'bar',
          data: sortedData.map(item => ({
            value: parseFloat(item.VALUE),
            total_devices: item.total_devices,
            itemStyle: {
              color: getHealthScoreColor(parseFloat(item.VALUE))
            }
          })),
          label: {
            show: true,
            position: 'right',
            formatter: '{c}%',
            fontSize: 11
          },
          emphasis: {
            focus: 'series',
            itemStyle: {
              shadowBlur: 10,
              shadowColor: 'rgba(0, 0, 0, 0.5)'
            }
          }
        }
      ],
      dataZoom: [
        {
          type: 'slider',
          yAxisIndex: 0,
          filterMode: 'filter',
          height: 20,
          bottom: 0,
          start: 0,
          end: 100
        }
      ]
    };

    chart.setOption(option);

    // Adicionar redimensionamento responsivo
    const handleResize = () => chart.resize();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.dispose();
    };
  };


  const filteredMotionDevices = motionDevices.filter(d =>
    d.dev_eui.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.customer_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredCustomers = customerStats.filter(c =>
    c.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.domain_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!overview) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <ExclamationTriangleIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            {t('error.title')}
          </h3>
          <button
            onClick={fetchData}
            className="mt-4 inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            {t('error.retry')}
          </button>
        </div>
      </div>
    );
  }


  const SortableHeader = ({
    field,
    children,
    bgClass = ''
  }: {
    field: string;
    children: React.ReactNode;
    bgClass?: string;
  }) => {
    const isActive = sortField === field;
    const isAsc = sortOrder === 'asc';

    return (
      <th
        onClick={() => {
          if (sortField === field) {
            setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc');
          } else {
            setSortField(field);
            setSortOrder('asc');
          }
          setLowBatteryPage(1);
        }}
        className={`px-2 py-2 text-left text-[10px] font-medium uppercase whitespace-nowrap cursor-pointer select-none transition-all duration-200 ${isActive
          ? 'text-blue-700 bg-blue-50'
          : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
          } ${bgClass}`}
      >
        <div className="flex items-center gap-1.5 group">
          <span className={isActive ? 'font-semibold' : ''}>{children}</span>

          {isActive ? (
            isAsc ? (
              <ArrowUpIcon className="w-3 h-3 animate-in fade-in duration-200" />
            ) : (
              <ArrowDownIcon className="w-3 h-3 animate-in fade-in duration-200" />
            )
          ) : (
            <ArrowsUpDownIcon className="w-3 h-3 opacity-30 group-hover:opacity-60 transition-opacity" />
          )}
        </div>
      </th>
    );
  };



  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* ✨ NOVO: Header com controles de refresh */}
      <div className="mb-8">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 mb-6">
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900">
              {t('deviceLogs.title')}
            </h1>
            <p className="mt-2 text-sm text-gray-600">
              {t('deviceLogs.lastUpdate')}: {new Date(overview.generated_at).toLocaleString('pt-BR')}
            </p>
          </div>

          {/* ✨ CONTROLES DE REFRESH */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
            {/* Status do Auto-Refresh */}
            {/* <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg">
              <div className={`w-3 h-3 rounded-full ${autoRefreshEnabled ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
              <span className="text-sm text-gray-700">
                {autoRefreshEnabled ? 'Auto-refresh ativo' : 'Auto-refresh pausado'}
              </span>
            </div> */}

            {/* Seletor de Intervalo */}
            {/* <select
              value={refreshInterval}
              onChange={(e) => handleIntervalChange(Number(e.target.value))}
              disabled={!autoRefreshEnabled}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
            > */}
            {/* <option value={10000}>10 segundos</option>
              <option value={30000}>30 segundos</option> */}
            {/* <option value={60000}>1 min</option>
              <option value={300000}>5 min</option>
            </select> */}

            {/* Botão Toggle Auto-Refresh */}
            {/* <button
              onClick={toggleAutoRefresh}
              className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition-colors ${autoRefreshEnabled
                ? 'bg-orange-100 text-orange-700 hover:bg-orange-200'
                : 'bg-green-100 text-green-700 hover:bg-green-200'
                }`}
            >
              {autoRefreshEnabled ? (
                <>
                  <PauseIcon className="h-4 w-4" />
                  {t('gpsMap.player.pause')}
                </>
              ) : (
                <>
                  <PlayIcon className="h-4 w-4" />
                  Active
                </>
              )}
            </button> */}

            {/* Botão Refresh Manual */}
            <button
              onClick={handleManualRefresh}
              disabled={refreshing}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors"
            >
              <ArrowPathIcon className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
              {refreshing ? t('deviceLogs.refreshing') : t('deviceLogs.refresh')}
            </button>
          </div>
        </div>

      </div>

      {/* Tabs de Navegação */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8 max-[856px]:overflow-x-auto">
          {[
            { id: 'overview', label: t('deviceLogs.tabs.overview'), icon: ChartBarIcon },
            { id: 'mapview', label: t('deviceLogs.tabs.mapview'), icon: MapIcon },
            { id: 'devices', label: t('deviceLogs.tabs.devices'), icon: DevicePhoneMobileIcon },
            { id: 'events', label: t('deviceLogs.tabs.events'), icon: ShieldExclamationIcon },
            { id: 'network', label: t('deviceLogs.tabs.network'), icon: SignalIcon },
            { id: 'customers', label: t('deviceLogs.tabs.customers'), icon: MapPinIcon },
            { id: 'rawdata', label: t('deviceLogs.tabs.rawData'), icon: DocumentChartBarIcon },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm ${activeTab === tab.id
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
            >
              <tab.icon className="h-5 w-5" />
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Indicador de Status do Refresh */}
      <div className="mb-4 p-3 bg-gray-100 rounded-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {/* <div className={`w-2 h-2 rounded-full ${autoRefreshEnabled ? 'bg-green-500' : 'bg-gray-400'}`} /> */}
            <span className="text-sm text-gray-600">
              {t('gpsMap.modal.lastUpdate')}: {new Date().toLocaleTimeString('pt-BR')}
            </span>
          </div>
          {refreshing && (
            <span className="text-sm text-blue-600 animate-pulse flex items-center gap-2">
              <ArrowPathIcon className="h-4 w-4 animate-spin" />
              {t('deviceLogs.updateData')}
            </span>
          )}
        </div>
      </div>

      {/* ✅ TAB OVERVIEW COM KPIs ATUALIZADOS */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* ✨ CARDS DE EQUIPAMENTOS */}
          {dashboardCards?.equipment_cards && (
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <DevicePhoneMobileIcon className="h-6 w-6" />
                {t('dashboard.equipmentStatus')}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <EquipmentCard card={dashboardCards.equipment_cards.total} cardKey="total" />
                <EquipmentCard card={dashboardCards.equipment_cards.online} cardKey="online" />
                <EquipmentCard card={dashboardCards.equipment_cards.offline} cardKey="offline" />
                <EquipmentCard card={dashboardCards.equipment_cards.no_data} cardKey="noData" />
              </div>
            </div>
          )}

          {/* ✨ CARDS DE ATIVIDADE */}
          {dashboardCards?.activity_cards && (
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <ClockIcon className="h-6 w-6" />
                {t('dashboard.recentActivity')}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <ActivityCard card={dashboardCards.activity_cards.active_last_hour} cardKey="activeLastHour" />
                <ActivityCard card={dashboardCards.activity_cards.silent_24h} cardKey="silent24h" />
                <ActivityCard card={dashboardCards.activity_cards.inactive_today} cardKey="inactiveToday" />
              </div>
            </div>
          )}

          {/* ✨ CARDS DE GPS */}
          {/* {dashboardCards?.gps_cards && (
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <MapPinIcon className="h-6 w-6" />
                {t('dashboard.gpsCoverage')}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <GPSCard card={dashboardCards.gps_cards.gps_today} cardKey="gpsToday" />
                <GPSCard card={dashboardCards.gps_cards.gps_yesterday} cardKey="gpsYesterday" />
                <GPSCard card={dashboardCards.gps_cards.gps_last_3days} cardKey="gpsLast3Days" />
                <GPSCard card={dashboardCards.gps_cards.gps_outdated} cardKey="gpsOutdated" />
              </div>
            </div>
          )} */}

          {/* ✨ MÉTRICAS RÁPIDAS */}
          {/* {dashboardCards?.quick_metrics && (
            <div className="bg-gradient-to-r from-purple-50 via-pink-50 to-blue-50 rounded-lg border-2 border-purple-200 p-6 shadow-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <ChartBarIcon className="h-6 w-6" />
                {t('dashboard.quickMetrics')}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="flex items-center gap-4">
                  <div className="flex-shrink-0 w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-2xl">🟢</span>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 font-medium">{t('dashboard.onlineRate')}</p>
                    <p className="text-2xl font-bold text-green-600">
                      {dashboardCards.quick_metrics.online_percentage}%
                    </p>
                    <p className="text-xs text-gray-500">{t('dashboard.devicesOnline')}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex-shrink-0 w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-2xl">⚡</span>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 font-medium">{t('dashboard.activityRate')}</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {dashboardCards.quick_metrics.active_rate}%
                    </p>
                    <p className="text-xs text-gray-500">{t('dashboard.activeDevices')}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex-shrink-0 w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center">
                    <span className="text-2xl">📍</span>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 font-medium">{t('dashboard.gpsCoverage')}</p>
                    <p className="text-2xl font-bold text-purple-600">
                      {dashboardCards.quick_metrics.gps_coverage}%
                    </p>
                    <p className="text-xs text-gray-500">{t('dashboard.recentGps')}</p>
                  </div>
                </div>
              </div>
            </div>
          )} */}

          {/* ✅ GRÁFICOS COM RESPONSIVIDADE - VERSÃO COM COMPONENTES */}
          {/* ✅ GRÁFICOS COM RESPONSIVIDADE - VERSÃO ATUALIZADA */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Gráfico de Pizza - Saúde da Bateria (BEM SIMPLES) */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 min-w-0">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {t('deviceLogs.charts.batteryDistribution')}
              </h3>
              <div className="w-full h-64 sm:h-80 min-h-64 overflow-hidden">
                <BatteryPieChart
                  data={{
                    healthy: safeParseNumber(overview?.kpis.battery_health?.healthy_devices),
                    warning: safeParseNumber(overview?.kpis.battery_health?.warning_devices),
                    critical: safeParseNumber(overview?.kpis.battery_health?.critical_devices),
                  }}
                />
              </div>
            </div>

            {/* 🆕 Gráfico de Pizza - Distribuição de Bateria (NOVO DA API) */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 min-w-0">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {t('deviceLogs.charts.batteryDistributionByStatus')}
              </h3>
              <div className="w-full h-64 sm:h-80 min-h-64 overflow-hidden">
                {overview?.kpis.battery_distribution && overview.kpis.battery_distribution.length > 0 ? (
                  <BatteryDistributionPieChart data={overview.kpis.battery_distribution} />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-gray-500">{t('deviceLogs.charts.noData')}</p>
                  </div>
                )}
              </div>
            </div>
          </div>


          {/* ✅ ALERTAS DE BATERIA BAIXA ATUALIZADOS */}

          <DevicePayloadStatsGrid />

          <div className="bg-white rounded-lg shadow-sm border border-yellow-200 p-4">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-4">
              <h3 className="text-lg font-semibold text-yellow-900 flex items-center gap-2">
                <BoltIcon className="h-6 w-6" />
                {t('lowBatteryTable.title')} ({lowBatteryData.pagination.totalItems})
              </h3>

              <QuickExportButtons
                data={lowBatteryData.data}
                filters={filters}
                totalItems={lowBatteryData?.pagination?.totalItems}
                isFiltered={getActiveFiltersCount() > 0}
              />
            </div>


            {/* ✨ ADICIONAR AQUI O COMPONENTE DE FILTROS */}
            <div className="mb-4">

              <LowBatteryTableFilters
                filters={filters}
                onFiltersChange={handleFiltersChange}
                onClearFilters={handleClearFilters}
                activeFiltersCount={getActiveFiltersCount()}
              />
            </div>




            {/* Loading State */}
            {loadingLowBattery ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-600"></div>
                <p className="ml-4 text-gray-600">{t('lowBatteryTable.loading')}</p>
              </div>
            ) : (
              <>
                {/* Tabela responsiva com scroll horizontal */}
                <div className="overflow-auto -mx-4 sm:mx-0 max-h-[600px]">
                  <div className="inline-block min-w-full align-middle">
                    <div className="shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
                      <table className="min-w-full divide-y divide-gray-300">
                        <thead className="bg-gray-50 sticky top-0 z-20">
                          <tr>
                            {/* Device Info */}
                            <SortableHeader field="person_name" bgClass='sticky left-0 z-10 bg-gray-50 px-2 py-2 text-left text-[10px] font-medium text-gray-500 uppercase whitespace-nowrap'>{t('lowBatteryTable.headers.person')}</SortableHeader>
                            <SortableHeader field="dev_uid" bgClass="px-2 py-2 text-left text-[10px] font-medium text-gray-500 uppercase whitespace-nowrap">{t('lowBatteryTable.headers.deviceUid')}</SortableHeader>
                            <SortableHeader field="sensor_model" bgClass='px-2 py-2 text-left text-[10px] font-medium text-gray-500 uppercase whitespace-nowrap'>{t('lowBatteryTable.headers.model')}</SortableHeader>

                            {/* Battery Info */}
                            <SortableHeader field="battery_level" bgClass='px-2 py-2 text-left text-[10px] font-medium text-gray-500 uppercase whitespace-nowrap bg-yellow-50'>{t('lowBatteryTable.headers.battery')}</SortableHeader>
                            <SortableHeader field="battery_status" bgClass='px-2 py-2 text-left text-[10px] font-medium text-gray-500 uppercase whitespace-nowrap bg-yellow-50'>{t('lowBatteryTable.headers.status')}</SortableHeader>
                            <SortableHeader field="battery_score" bgClass='px-2 py-2 text-left text-[10px] font-medium text-gray-500 uppercase whitespace-nowrap bg-yellow-50'>{t('lowBatteryTable.headers.score')}</SortableHeader>
                            <th className="px-2 py-2 text-left text-[10px] font-medium text-gray-500 uppercase whitespace-nowrap bg-yellow-50">{t('lowBatteryTable.headers.charging')}</th>
                            <th className="px-2 py-2 text-left text-[10px] font-medium text-gray-500 uppercase whitespace-nowrap bg-yellow-50">{t('lowBatteryTable.headers.updated')}</th>
                            <SortableHeader field="battery_minutes_ago" bgClass='px-2 py-2 text-left text-[10px] font-medium text-gray-500 uppercase whitespace-nowrap bg-yellow-50'>{t('lowBatteryTable.headers.minAgo')}</SortableHeader>
                            <th className="px-2 py-2 text-left text-[10px] font-medium text-gray-500 uppercase whitespace-nowrap bg-yellow-50">{t('lowBatteryTable.headers.fresh')}</th>

                            {/* GPS Info */}
                            <th className="px-2 py-2 text-left text-[10px] font-medium text-gray-500 uppercase whitespace-nowrap bg-red-50">{t('lowBatteryTable.headers.gpsAge')}</th>
                            <th className="px-2 py-2 text-left text-[10px] font-medium text-gray-500 uppercase whitespace-nowrap bg-red-50">{t('lowBatteryTable.headers.gpsFail')}</th>

                            {/* Temperature Info */}
                            <SortableHeader field="temperature" bgClass='px-2 py-2 text-left text-[10px] font-medium text-gray-500 uppercase whitespace-nowrap bg-blue-50'>{t('lowBatteryTable.headers.temp')}</SortableHeader>
                            <th className="px-2 py-2 text-left text-[10px] font-medium text-gray-500 uppercase whitespace-nowrap bg-blue-50">{t('lowBatteryTable.headers.updated')}</th>
                            {/* <SortableHeader field="temperature_minutes_ago" bgClass='px-2 py-2 text-left text-[10px] font-medium text-gray-500 uppercase whitespace-nowrap bg-blue-50'>{t('lowBatteryTable.headers.minAgo')}</SortableHeader>
                            <th className="px-2 py-2 text-left text-[10px] font-medium text-gray-500 uppercase whitespace-nowrap bg-blue-50">{t('lowBatteryTable.headers.fresh')}</th> */}

                            {/* Motion Info */}
                            <SortableHeader field="motion_status" bgClass='px-2 py-2 text-left text-[10px] font-medium text-gray-500 uppercase whitespace-nowrap bg-green-50'>{t('lowBatteryTable.headers.motion')}</SortableHeader>
                            {/* <th className="px-2 py-2 text-left text-[10px] font-medium text-gray-500 uppercase whitespace-nowrap bg-green-50">{t('lowBatteryTable.headers.value')}</th>
                            <th className="px-2 py-2 text-left text-[10px] font-medium text-gray-500 uppercase whitespace-nowrap bg-green-50">{t('lowBatteryTable.headers.updated')}</th>
                            <th className="px-2 py-2 text-left text-[10px] font-medium text-gray-500 uppercase whitespace-nowrap bg-green-50">{t('lowBatteryTable.headers.changed')}</th>
                            <SortableHeader field="motion_minutes_ago" bgClass='px-2 py-2 text-left text-[10px] font-medium text-gray-500 uppercase whitespace-nowrap bg-green-50'>{t('lowBatteryTable.headers.minAgo')}</SortableHeader> */}
                            <SortableHeader field="motion_freshness" bgClass='px-2 py-2 text-left text-[10px] font-medium text-gray-500 uppercase whitespace-nowrap bg-green-50'>{t('lowBatteryTable.headers.fresh')}</SortableHeader>
                            {/* <th className="px-2 py-2 text-left text-[10px] font-medium text-gray-500 uppercase whitespace-nowrap bg-green-50">{t('lowBatteryTable.headers.motion')}</th> */}

                            {/* Report Info */}
                            {/* <th className="px-2 py-2 text-left text-[10px] font-medium text-gray-500 uppercase whitespace-nowrap bg-purple-50">{t('lowBatteryTable.headers.fresh')}</th>
                            <SortableHeader field="minutes_since_report" bgClass='px-2 py-2 text-left text-[10px] font-medium text-gray-500 uppercase whitespace-nowrap bg-purple-50'>{t('lowBatteryTable.headers.min')}</SortableHeader>
                            <SortableHeader field="hours_since_report" bgClass='px-2 py-2 text-left text-[10px] font-medium text-gray-500 uppercase whitespace-nowrap bg-purple-50'>{t('lowBatteryTable.headers.hours')}</SortableHeader>
                            <SortableHeader field="days_since_report" bgClass='px-2 py-2 text-left text-[10px] font-medium text-gray-500 uppercase whitespace-nowrap bg-purple-50'>{t('lowBatteryTable.headers.days')}</SortableHeader> */}
                            <th className="px-2 py-2 text-left text-[10px] font-medium text-gray-500 uppercase whitespace-nowrap bg-purple-50">{t('lowBatteryTable.headers.fresh')}</th>
                            <th className="px-2 py-2 text-left text-[10px] font-medium text-gray-500 uppercase whitespace-nowrap bg-purple-50">{t('lowBatteryTable.headers.status')}</th>
                            <SortableHeader field="freshness_score" bgClass='px-2 py-2 text-left text-[10px] font-medium text-gray-500 uppercase whitespace-nowrap bg-purple-50'>{t('lowBatteryTable.headers.score')}</SortableHeader>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {lowBatteryData.data.length === 0 ? (
                            <tr>
                              <td colSpan={29} className="px-6 py-4 text-center text-sm text-gray-500">
                                {t('lowBatteryTable.noData')}
                              </td>
                            </tr>
                          ) : (
                            <>
                              {lowBatteryData.data.map((device: any, idx: number) => (

                                <tr key={idx} className="hover:bg-gray-50">
                                  {/* Device Info */}
                                  <td className="sticky left-0 z-10 bg-white px-2 py-2 whitespace-nowrap">
                                    <span className="font-medium text-[11px] text-gray-900">{device.person_name}</span>
                                  </td>
                                  <td className="px-2 py-2 whitespace-nowrap">
                                    <span className="font-mono text-[10px] text-gray-700">{device.dev_uid}</span>
                                  </td>
                                  <td className="px-2 py-2 whitespace-nowrap">
                                    <span className="text-[10px] text-gray-600">{device.sensor_model}</span>
                                  </td>

                                  {/* Battery Info */}
                                  <td className="px-2 py-2 whitespace-nowrap bg-yellow-50">
                                    <div className="flex items-center gap-1">
                                      <div className="w-12 bg-gray-200 rounded-full h-1.5">
                                        <div
                                          className={`h-1.5 rounded-full transition-all ${device.battery_level >= 30 ? 'bg-green-500' :
                                            device.battery_level >= 20 ? 'bg-yellow-500' :
                                              device.battery_level >= 10 ? 'bg-orange-500' : 'bg-red-500'
                                            }`}
                                          style={{ width: `${device.battery_level}%` }}
                                        />
                                      </div>
                                      <span className={`text-[11px] font-bold ${device.battery_level < 10 ? 'text-red-600' : 'text-yellow-600'
                                        }`}>
                                        {device.battery_level}%
                                      </span>
                                    </div>
                                  </td>
                                  <td className="px-2 py-2 whitespace-nowrap bg-yellow-50">
                                    <span className={`inline-flex px-1.5 py-0.5 rounded-full text-[9px] font-semibold ${device.battery_status === 'CRITICAL' ? 'bg-red-100 text-red-800' :
                                      device.battery_status === 'WARNING' ? 'bg-yellow-100 text-yellow-800' :
                                        'bg-green-100 text-green-800'
                                      }`}>
                                      {device.battery_status}
                                    </span>
                                  </td>
                                  <td className="px-2 py-2 whitespace-nowrap bg-yellow-50">
                                    <div className="relative w-8 h-8">
                                      <svg className="w-8 h-8 transform -rotate-90">
                                        <circle cx="16" cy="16" r="14" stroke="#e5e7eb" strokeWidth="3" fill="none" />
                                        <circle
                                          cx="16"
                                          cy="16"
                                          r="14"
                                          stroke={device.battery_score >= 30 ? '#10b981' : device.battery_score >= 20 ? '#f59e0b' : '#ef4444'}
                                          strokeWidth="3"
                                          fill="none"
                                          strokeDasharray={`${(device.battery_score / 100) * 87.96} 87.96`}
                                          className="transition-all duration-500"
                                        />
                                      </svg>
                                      <div className="absolute inset-0 flex items-center justify-center">
                                        <span className="text-[9px] font-bold">{device.battery_score}</span>
                                      </div>
                                    </div>
                                  </td>
                                  <td className="px-2 py-2 whitespace-nowrap bg-yellow-50">
                                    <span className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[9px] ${device.battery_charging === 'YES' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-600'
                                      }`}>
                                      {device.battery_charging === 'YES' ? '🔌' : '–'}
                                    </span>
                                  </td>
                                  <td className="px-2 py-2 whitespace-nowrap bg-yellow-50">
                                    <div className="text-[9px]">
                                      <div className="text-gray-900">{new Date(device.battery_last_updated).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}</div>
                                      <div className="text-gray-500">{new Date(device.battery_last_updated).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</div>
                                    </div>
                                  </td>
                                  <td className="px-2 py-2 whitespace-nowrap bg-yellow-50">
                                    <span className="text-[10px] text-gray-600">{device.battery_minutes_ago}m</span>
                                  </td>
                                  <td className="px-2 py-2 whitespace-nowrap bg-yellow-50">
                                    <span className="text-[9px]">{device.battery_freshness}</span>
                                  </td>

                                  {/* GPS Info */}
                                  <td className="px-2 py-2 whitespace-nowrap bg-red-50">
                                    {device.gps_age !== null ? (
                                      <span className={`text-[10px] font-medium ${device.gps_age < 30 ? 'text-green-600' :
                                        device.gps_age < 60 ? 'text-yellow-600' : 'text-red-600'
                                        }`}>
                                        {device.gps_age}m
                                      </span>
                                    ) : (
                                      <span className="text-[10px] text-gray-400">–</span>
                                    )}
                                  </td>
                                  <td className="px-2 py-2 whitespace-nowrap bg-red-50">
                                    {device.loc_fail_reason_descr !== null ? (
                                      <span className="text-[9px] text-red-600">{device.loc_fail_reason_descr}</span>
                                    ) : (
                                      <span className="text-[9px] text-green-600">✓ OK</span>
                                    )}
                                  </td>

                                  {/* Temperature Info */}
                                  <td className="px-2 py-2 whitespace-nowrap bg-blue-50">
                                    <span className={`font-medium text-[11px] ${device.temperature < 15 ? 'text-blue-600' :
                                      device.temperature > 30 ? 'text-red-600' : 'text-gray-700'
                                      }`}>
                                      {device.temperature}°{device.temperature_unit}
                                    </span>
                                  </td>
                                  <td className="px-2 py-2 whitespace-nowrap bg-blue-50">
                                    <div className="text-[9px]">
                                      <div className="text-gray-900">{new Date(device.temperature_last_updated).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}</div>
                                      <div className="text-gray-500">{new Date(device.temperature_last_updated).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</div>
                                    </div>
                                  </td>
                                  {/* <td className="px-2 py-2 whitespace-nowrap bg-blue-50">
                                    <span className="text-[10px] text-gray-600">{device.temperature_minutes_ago}m</span>
                                  </td>
                                  <td className="px-2 py-2 whitespace-nowrap bg-blue-50">
                                    <span className="text-[9px]">{device.temperature_freshness}</span>
                                  </td> */}

                                  {/* Motion Info */}
                                  <td className="px-2 py-2 whitespace-nowrap bg-green-50">
                                    <span className={`inline-flex px-1.5 py-0.5 rounded-full text-[9px] font-medium ${device.motion_status === 'MOVING' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-700'
                                      }`}>
                                      {device.motion_status === 'MOVING' ? '🏃' : '⏸️'}
                                    </span>
                                  </td>
                                  {/* <td className="px-2 py-2 whitespace-nowrap bg-green-50">
                                    <span className="text-[10px] text-gray-600">{device.motion_status_numeric}</span>
                                  </td>
                                  <td className="px-2 py-2 whitespace-nowrap bg-green-50">
                                    <div className="text-[9px]">
                                      <div className="text-gray-900">{new Date(device.motion_last_updated).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}</div>
                                      <div className="text-gray-500">{new Date(device.motion_last_updated).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</div>
                                    </div>
                                  </td>
                                  <td className="px-2 py-2 whitespace-nowrap bg-green-50">
                                    <div className="text-[9px]">
                                      <div className="text-gray-900">{new Date(device.motion_last_changed).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}</div>
                                      <div className="text-gray-500">{new Date(device.motion_last_changed).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</div>
                                    </div>
                                  </td>
                                  <td className="px-2 py-2 whitespace-nowrap bg-green-50">
                                    <span className="text-[10px] text-gray-600">{device.motion_minutes_ago}m</span>
                                  </td> */}
                                  <td className="px-2 py-2 whitespace-nowrap bg-green-50">
                                    <span className="text-[9px]">{device.motion_freshness}</span>
                                  </td>

                                  {/* Report Info */}
                                  {/* <td className="px-2 py-2 whitespace-nowrap bg-purple-50">
                                    <div className="text-[9px]">
                                      <div className="text-gray-900">{new Date(device.last_report_datetime).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}</div>
                                      <div className="text-gray-500">{new Date(device.last_report_datetime).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</div>
                                    </div>
                                  </td>
                                  <td className="px-2 py-2 whitespace-nowrap bg-purple-50">
                                    <span className="text-[10px] text-gray-600">{device.minutes_since_report}m</span>
                                  </td>
                                  <td className="px-2 py-2 whitespace-nowrap bg-purple-50">
                                    <span className="text-[10px] text-gray-600">{device.hours_since_report}h</span>
                                  </td>
                                  <td className="px-2 py-2 whitespace-nowrap bg-purple-50">
                                    <span className="text-[10px] text-gray-600">{device.days_since_report}d</span>
                                  </td> */}
                                  <td className="px-2 py-2 whitespace-nowrap bg-purple-50">
                                    <span className={`inline-flex px-1.5 py-0.5 rounded-full text-[9px] ${device.report_freshness === 'REAL_TIME' ? 'bg-green-100 text-green-800' :
                                      device.report_freshness === 'RECENT' ? 'bg-blue-100 text-blue-800' :
                                        'bg-gray-100 text-gray-700'
                                      }`}>
                                      {device.report_freshness}
                                    </span>
                                  </td>
                                  <td className="px-2 py-2 whitespace-nowrap bg-purple-50">
                                    <span className="text-[10px]">{device.report_status}</span>
                                  </td>
                                  <td className="px-2 py-2 whitespace-nowrap bg-purple-50">
                                    <div className="relative w-8 h-8">
                                      <svg className="w-8 h-8 transform -rotate-90">
                                        <circle cx="16" cy="16" r="14" stroke="#e5e7eb" strokeWidth="3" fill="none" />
                                        <circle
                                          cx="16"
                                          cy="16"
                                          r="14"
                                          stroke={
                                            device.freshness_score >= 80 ? '#10b981' :
                                              device.freshness_score >= 50 ? '#f59e0b' : '#ef4444'
                                          }
                                          strokeWidth="3"
                                          fill="none"
                                          strokeDasharray={`${(device.freshness_score / 100) * 87.96} 87.96`}
                                          className="transition-all duration-500"
                                        />
                                      </svg>
                                      <div className="absolute inset-0 flex items-center justify-center">
                                        <span className="text-[9px] font-bold">{device.freshness_score}</span>
                                      </div>
                                    </div>
                                  </td>
                                </tr>
                              ))}
                            </>)}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

                {/* Paginação */}
                <Pagination
                  currentPage={lowBatteryData.pagination.currentPage}
                  totalPages={lowBatteryData.pagination.totalPages}
                  totalItems={lowBatteryData.pagination.totalItems}
                  itemsPerPage={lowBatteryData.pagination.itemsPerPage}
                  onPageChange={(page) => setLowBatteryPage(page)}
                  onLimitChange={(limit) => {
                    setLowBatteryLimit(limit);
                    setLowBatteryPage(1);
                  }}
                />

                {/* Legenda das cores */}
                <div className="mt-4 flex flex-wrap gap-3 text-[10px] text-gray-600">
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 bg-yellow-50 border border-yellow-200 rounded"></div>
                    <span>{t('lowBatteryTable.legend.battery')}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 bg-blue-50 border border-blue-200 rounded"></div>
                    <span>{t('lowBatteryTable.legend.temperature')}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 bg-green-50 border border-green-200 rounded"></div>
                    <span>{t('lowBatteryTable.legend.motion')}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 bg-purple-50 border border-purple-200 rounded"></div>
                    <span>{t('lowBatteryTable.legend.report')}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 bg-red-50 border border-red-200 rounded"></div>
                    <span>{t('lowBatteryTable.legend.gps')}</span>
                  </div>
                </div>
              </>
            )}
          </div>

          <AssetManagementGrid />
          <HealthScoreDashboard companyId={companyId} />

        </div>
      )}

      {activeTab === 'mapview' && (
        <GPSMapViewer />
      )}

      {activeTab === 'devices' && (
        <div className="space-y-6">
          <GPSRouteMapLeaflet />
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder={t('deviceLogs.searchPlaceholder.devices')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <DevicePhoneMobileIcon className="h-6 w-6" />
              {t('deviceLogs.deviceMotion.title', { count: filteredMotionDevices.length })}
            </h3>

            <div className="overflow-y-hidden max-h-[600px]">
              <DataTable
                columns={[
                  { key: 'dev_eui', label: t('deviceLogs.tables.deviceEui') },
                  { key: 'customer_name', label: t('deviceLogs.tables.customer') },
                  {
                    key: 'dynamic_motion_state',
                    label: t('deviceLogs.tables.state'),
                    sortValue: (row) => row.dynamic_motion_state, // Valor usado para ordenação
                    render: (val) => (
                      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${val === 'MOVING' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                        {val === 'MOVING' ? '🚶 ' + t('deviceLogs.deviceStates.moving') : '⏸️ ' + t('deviceLogs.deviceStates.static')}
                      </span>
                    ),
                  },
                  {
                    key: 'battery_level',
                    label: t('deviceLogs.tables.battery'),
                    sortValue: (row) => row.battery_level, // Valor numérico para ordenação
                    render: (val) => (
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${val >= 30 ? 'bg-green-500' :
                              val >= 20 ? 'bg-yellow-500' : 'bg-red-500'
                              }`}
                            style={{ width: `${val}%` }}
                          />
                        </div>
                        <span className="text-xs font-medium">{val}%</span>
                      </div>
                    ),
                  },
                  {
                    key: 'timestamp',
                    label: t('deviceLogs.tables.lastPosition'),
                    render: (val) => new Date(val).toLocaleString('pt-BR'),
                  },
                  {
                    key: 'actions',
                    label: t('deviceLogs.tables.actions'),
                    render: (_, row) => (
                      <div className="flex gap-2">
                        {row.gps_latitude && row.gps_longitude && (
                          <button
                            onClick={() => openMapModal(row)}
                            className="text-blue-600 hover:text-blue-800 text-xs font-medium"
                          >
                            📍 {t('deviceLogs.tables.viewOnMap')}
                          </button>
                        )}
                        <button
                          onClick={() => openDetailsModal(row)}
                          className="text-purple-600 hover:text-purple-800 text-xs font-medium"
                        >
                          📊 {t('deviceLogs.tables.viewDetails')}
                        </button>
                      </div>
                    ),
                  },
                ]}
                data={filteredMotionDevices}
                emptyMessage={t('deviceLogs.tables.noDevicesFound')}
                sortableColumns={['dynamic_motion_state', 'battery_level']} // Colunas que podem ser ordenadas
              />
            </div>
          </div>

          {overview.device_alerts.offline_count > 0 && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <SignalSlashIcon className="h-6 w-6 text-gray-500" />
                {t('offlineDevices.title')} ({overview.device_alerts.offline_count})
              </h3>
              <DataTable
                columns={[
                  { key: 'dev_eui', label: t('offlineDevices.deviceEUI') },
                  { key: 'customer_name', label: t('offlineDevices.customer') },
                  {
                    key: 'last_position',
                    label: t('offlineDevices.lastPosition'),
                    render: (val) => new Date(val).toLocaleString('pt-BR'),
                  },
                  {
                    key: 'hours_offline',
                    label: t('offlineDevices.offlineTime'),
                    render: (val) => (
                      <span className={`font-semibold ${val > 72 ? 'text-red-600' :
                        val > 48 ? 'text-orange-600' : 'text-yellow-600'
                        }`}>
                        {val}h
                      </span>
                    ),
                  },
                  {
                    key: 'battery_level',
                    label: t('offlineDevices.battery'),
                    render: (val) => val ? `${val}%` : t('offlineDevices.notAvailable'),
                  },
                ]}
                data={overview.device_alerts.offline_devices}
              />
            </div>
          )}

          <DevicePayloadStatsGrid />

        </div>

      )}

      {activeTab === 'events' && (
        <div className="space-y-6">
          <ChartContainer id="events-chart" title={t('deviceLogs.charts.eventDistribution')} height="500px" />

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <ChartBarIcon className="h-6 w-6" />
              {t('deviceLog.events.legend')}
            </h3>
            <DataTable
              columns={[
                { key: 'event_type', label: t('deviceLog.events.eventType') },
                {
                  key: 'total',
                  label: t('deviceLog.events.total'),
                  render: (val) => (
                    <span className="font-semibold text-gray-900">{val.toLocaleString()}</span>
                  ),
                },
                {
                  key: 'valid_events',
                  label: t('deviceLog.events.valid'),
                  render: (val) => (
                    <span className="text-green-600 font-medium">{val.toLocaleString()}</span>
                  ),
                },
                {
                  key: 'duplicate_events',
                  label: t('deviceLog.events.duplicate'),
                  render: (val) => (
                    <span className="text-red-600 font-medium">{val.toLocaleString()}</span>
                  ),
                },
                {
                  key: 'unique_devices',
                  label: t('deviceLog.events.uniqueDevices'),
                  render: (val) => (
                    <span className="text-blue-600 font-medium">{val}</span>
                  ),
                },
                {
                  key: 'duplication_rate',
                  label: t('deviceLog.events.duplicationRate'),
                  render: (_, row) => {
                    const rate = row.total > 0
                      ? ((row.duplicate_events / row.total) * 100).toFixed(1)
                      : '0.0';
                    return (
                      <div className="flex items-center gap-2">
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-red-500 h-2 rounded-full"
                            style={{ width: `${Math.min(100, parseFloat(rate))}%` }}
                          />
                        </div>
                        <span className="text-xs font-medium">{rate}%</span>
                      </div>
                    );
                  },
                },
              ]}
              data={eventTypes}
              emptyMessage={t('deviceLogs.events.emptyMessage')}
            />
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {t('eventLegend.title')}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { type: 'SOS_MODE_START', color: 'red' },
                { type: 'SOS_MODE_END', color: 'green' },
                { type: 'MOTION_START', color: 'blue' },
                { type: 'MOTION_END', color: 'gray' },
                { type: 'GEOFENCE_ENTRY', color: 'purple' },
                { type: 'GEOFENCE_EXIT', color: 'orange' },
              ].map((item) => (
                <div key={item.type} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className={`w-3 h-3 rounded-full bg-${item.color}-500`} />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{item.type}</p>
                    <p className="text-xs text-gray-500">
                      {t(`eventLegend.types.${item.type}`)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'network' && (
        <div className="space-y-6">
          <ChartContainer
            id="gateway-chart"
            title={t('gateway.title')}
            height="500px"
          />

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <SignalIcon className="h-6 w-6" />
              {t('gateway.statsTitle')} ({gatewayQuality.length})
            </h3>
            <DataTable
              columns={[
                { key: 'gateway_name', label: t('gateway.gateway') },
                {
                  key: 'report_count',
                  label: t('gateway.reports'),
                  render: (val) => (
                    <span className="font-semibold text-blue-600">{val.toLocaleString()}</span>
                  ),
                },
                {
                  key: 'avg_rssi',
                  label: t('gateway.avgRssi'),
                  render: (val) => {
                    if (val == null || isNaN(val)) return t('gateway.notAvailable');
                    const rssi = Number(val).toFixed(1);
                    return (
                      <span className={`font-medium ${val > -80 ? 'text-green-600' :
                        val > -100 ? 'text-yellow-600' : 'text-red-600'
                        }`}>
                        {rssi} dBm
                      </span>
                    );
                  },
                },
                {
                  key: 'avg_snr',
                  label: t('gateway.avgSnr'),
                  render: (val) => {
                    if (val == null || isNaN(val)) return t('gateway.notAvailable');
                    const snr = Number(val).toFixed(1);
                    return (
                      <span className={`font-medium ${val > 5 ? 'text-green-600' :
                        val > 0 ? 'text-yellow-600' : 'text-red-600'
                        }`}>
                        {snr} dB
                      </span>
                    );
                  },
                },
                {
                  key: 'min_rssi',
                  label: t('gateway.minRssi'),
                  render: (val) => {
                    if (val == null || isNaN(val)) return t('gateway.notAvailable');
                    return `${Number(val).toFixed(1)} dBm`;
                  },
                },
                {
                  key: 'max_rssi',
                  label: t('gateway.maxRssi'),
                  render: (val) => {
                    if (val == null || isNaN(val)) return t('gateway.notAvailable');
                    return `${Number(val).toFixed(1)} dBm`;
                  },
                },
                {
                  key: 'quality',
                  label: t('gateway.quality'),
                  render: (_, row) => {
                    if (row.avg_rssi == null || isNaN(row.avg_rssi)) return t('gateway.notAvailable');

                    const quality = row.avg_rssi > -80 ? t('gateway.qualityLevels.excellent') :
                      row.avg_rssi > -90 ? t('gateway.qualityLevels.good') :
                        row.avg_rssi > -100 ? t('gateway.qualityLevels.fair') : t('gateway.qualityLevels.poor');
                    const color = row.avg_rssi > -80 ? 'green' :
                      row.avg_rssi > -90 ? 'blue' :
                        row.avg_rssi > -100 ? 'yellow' : 'red';
                    return (
                      <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium bg-${color}-100 text-${color}-800`}>
                        {quality}
                      </span>
                    );
                  },
                },
              ]}
              data={gatewayQuality}
              emptyMessage={t('gateway.emptyMessage')}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{t('gateway.metrics.activeGateways')}</p>
                  <p className="mt-2 text-3xl font-semibold text-gray-900">{gatewayQuality.length}</p>
                </div>
                <SignalIcon className="h-10 w-10 text-blue-600" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{t('gateway.metrics.overallAvgRssi')}</p>
                  <p className="mt-2 text-3xl font-semibold text-gray-900">
                    {gatewayQuality.length > 0
                      ? (gatewayQuality.reduce((sum, g) => sum + (g.avg_rssi || 0), 0) / gatewayQuality.length).toFixed(1)
                      : '0'
                    } dBm
                  </p>
                </div>
                <ChartBarIcon className="h-10 w-10 text-green-600" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{t('gateway.metrics.totalReports')}</p>
                  <p className="mt-2 text-3xl font-semibold text-gray-900">
                    {gatewayQuality.reduce((sum, g) => sum + (g.report_count || 0), 0).toLocaleString()}
                  </p>
                </div>
                <DevicePhoneMobileIcon className="h-10 w-10 text-purple-600" />
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'customers' && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder={t('customerActivity.searchPlaceholder')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <MapPinIcon className="h-6 w-6" />
              {t('customerActivity.title')} ({filteredCustomers.length})
            </h3>
            <DataTable
              columns={[
                { key: 'customer_name', label: t('customerActivity.customer') },
                { key: 'domain_name', label: t('customerActivity.domain') },
                {
                  key: 'total_devices',
                  label: t('customerActivity.devices'),
                  render: (val) => (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      <DevicePhoneMobileIcon className="h-4 w-4" />
                      {val}
                    </span>
                  ),
                },
                {
                  key: 'total_reports',
                  label: t('customerActivity.reports24h'),
                  render: (val) => (
                    <span className="font-semibold text-gray-900">{val.toLocaleString()}</span>
                  ),
                },
                {
                  key: 'avg_battery',
                  label: t('customerActivity.avgBattery'),
                  render: (val) => {
                    if (val == null || isNaN(val)) return t('customerActivity.notAvailable');

                    const battery = Number(val).toFixed(1);
                    const percentage = Math.min(100, Math.max(0, val));

                    return (
                      <div className="flex items-center gap-2">
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${val >= 30 ? 'bg-green-500' :
                              val >= 20 ? 'bg-yellow-500' : 'bg-red-500'
                              }`}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <span className="text-xs font-medium">{battery}%</span>
                      </div>
                    );
                  },
                },
                {
                  key: 'last_activity',
                  label: t('customerActivity.lastActivity'),
                  render: (val) => {
                    const date = new Date(val);
                    const now = new Date();
                    const diffMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

                    let timeAgo = '';
                    if (diffMinutes < 60) {
                      timeAgo = `${diffMinutes} ${t('customerActivity.timeAgo.minutes')}`;
                    } else if (diffMinutes < 1440) {
                      timeAgo = `${Math.floor(diffMinutes / 60)}${t('customerActivity.timeAgo.hours')}`;
                    } else {
                      timeAgo = `${Math.floor(diffMinutes / 1440)}${t('customerActivity.timeAgo.days')}`;
                    }

                    return (
                      <div className="flex items-center gap-2">
                        <ClockIcon className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-600">{timeAgo}</span>
                      </div>
                    );
                  },
                },
                {
                  key: 'actions',
                  label: t('customerActivity.actions'),
                  render: (_, row) => (
                    <button
                      onClick={() => {
                        console.log('Cliente:', row.customer_name);
                      }}
                      className="text-blue-600 hover:text-blue-800 text-xs font-medium"
                    >
                      {t('customerActivity.viewDetails')}
                    </button>
                  ),
                },
              ]}
              data={filteredCustomers}
              emptyMessage={t('customerActivity.emptyMessage')}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <p className="text-sm font-medium text-gray-600">{t('customerActivity.metrics.totalCustomers')}</p>
              <p className="mt-2 text-3xl font-semibold text-gray-900">{customerStats.length}</p>
            </div>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <p className="text-sm font-medium text-gray-600">{t('customerActivity.metrics.totalDevices')}</p>
              <p className="mt-2 text-3xl font-semibold text-gray-900">
                {customerStats.reduce((sum, c) => sum + c.total_devices, 0)}
              </p>
            </div>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <p className="text-sm font-medium text-gray-600">{t('customerActivity.metrics.totalReports')}</p>
              <p className="mt-2 text-3xl font-semibold text-gray-900">
                {customerStats.reduce((sum, c) => sum + c.total_reports, 0).toLocaleString()}
              </p>
            </div>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <p className="text-sm font-medium text-gray-600">{t('customerActivity.metrics.overallAvgBattery')}</p>
              <p className="mt-2 text-3xl font-semibold text-gray-900">
                {customerStats.length > 0
                  ? (customerStats.reduce((sum, c) => sum + c.avg_battery, 0) / customerStats.length).toFixed(1)
                  : '0'
                }%
              </p>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'rawdata' && (
        <RawDataExplorer />
      )}

      <MapModal
        device={selectedDevice}
        isOpen={isMapModalOpen}
        onClose={closeMapModal}
      />

      <DetailsModal
        device={selectedDevice}
        isOpen={isDetailsModalOpen}
        onClose={closeDetailsModal}
      />
    </div>
  );
}