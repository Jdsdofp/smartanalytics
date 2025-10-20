// src/components/DeviceLogsView.tsx
import { useState, useEffect } from 'react';
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
  PlayIcon,
  PauseIcon,
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

// =====================================
// 📊 INTERFACES
// =====================================
interface DashboardOverview {
  kpis: {
    uptime: {
      devices_online: number;
      total_devices: number;
      uptime_percentage: number;
    };
    gps_success: {
      total_reports: number;
      valid_gps_reports: number;
      success_rate_percent: number;
    };
    battery_health: {
      total_devices: number;
      healthy_devices: number;
      warning_devices: number;
      critical_devices: number;
      health_percentage: number;
    };
    accuracy_distribution: Array<{
      accuracy_range: string;
      report_count: number;
      percentage: number;
    }>;
  };
  alerts: {
    active_sos_count: number;
    active_sos_list: Array<{
      dev_eui: string;
      customer_name: string;
      sos_start_time: string;
      gps_latitude: number;
      gps_longitude: number;
      battery_level: number;
      minutes_elapsed: number;
    }>;
    low_battery_count: number;
    low_battery_devices: Array<{
      dev_eui: string;
      customer_name: string;
      battery_level: number;
      timestamp: string;
    }>;
    offline_count: number;
    offline_devices: Array<{
      dev_eui: string;
      customer_name: string;
      last_position: string;
      hours_offline: number;
    }>;
  };
  generated_at: string;
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

const DetailsModal = ({ device, isOpen, onClose }: DetailsModalProps) => {
  const [loading, setLoading] = useState(false);
  const [deviceDetails, setDeviceDetails] = useState<DeviceDetails | null>(null);
  const [activeDetailsTab, setActiveDetailsTab] = useState<'info' | 'route' | 'events' | 'config'>('info');

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
        fetch(`https://api-dashboards-u1oh.onrender.com/api/dashboard/devices/route/${device.dev_eui}`),
        fetch(`https://api-dashboards-u1oh.onrender.com/api/dashboard/devices/events/${device.dev_eui}?limit=10`),
        fetch(`https://api-dashboards-u1oh.onrender.com/api/dashboard/devices/config/${device.dev_eui}`),
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

// =====================================
// 🎨 COMPONENTES DE UI
// =====================================
const KPICard = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  color = 'blue'
}: {
  title: string;
  value: string | number;
  subtitle: string;
  icon: any;
  trend?: 'up' | 'down' | 'neutral';
  color?: 'blue' | 'green' | 'yellow' | 'red' | 'purple';
}) => {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600 ring-blue-500/10',
    green: 'bg-green-50 text-green-600 ring-green-500/10',
    yellow: 'bg-yellow-50 text-yellow-600 ring-yellow-500/10',
    red: 'bg-red-50 text-red-600 ring-red-500/10',
    purple: 'bg-purple-50 text-purple-600 ring-purple-500/10',
  };

  const trendColors = {
    up: 'text-green-600',
    down: 'text-red-600',
    neutral: 'text-gray-600',
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="mt-2 text-3xl font-semibold text-gray-900">{value}</p>
          <p className={`mt-2 text-sm ${trend ? trendColors[trend] : 'text-gray-500'}`}>
            {subtitle}
          </p>
        </div>
        <div className={`rounded-full p-3 ${colorClasses[color]}`}>
          <Icon className="h-8 w-8" />
        </div>
      </div>
    </div>
  );
};

const AlertBadge = ({ type, count }: { type: 'sos' | 'battery' | 'offline'; count: number }) => {
  const { t } = useTranslation();

  const config = {
    sos: {
      label: t('deviceLogs.alerts.sos'),
      icon: ShieldExclamationIcon,
      color: 'bg-red-100 text-red-800 ring-red-600/20',
    },
    battery: {
      label: t('deviceLogs.alerts.battery'),
      icon: BoltIcon,
      color: 'bg-yellow-100 text-yellow-800 ring-yellow-600/20',
    },
    offline: {
      label: t('deviceLogs.alerts.offline'),
      icon: SignalSlashIcon,
      color: 'bg-gray-100 text-gray-800 ring-gray-600/20',
    },
  };

  const { label, icon: Icon, color } = config[type];

  return (
    <div className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium ring-1 ring-inset ${color}`}>
      <Icon className="h-5 w-5" />
      <span>{label}: {count}</span>
    </div>
  );
};

const DataTable = ({
  columns,
  data,
  emptyMessage = 'Nenhum dado disponível'
}: {
  columns: Array<{ key: string; label: string; render?: (value: any, row: any) => React.ReactNode }>;
  data: any[];
  emptyMessage?: string;
}) => {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-300">
        <thead className="bg-gray-50">
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-6 py-8 text-center text-gray-500">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row, idx) => (
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

export default function DeviceLogsView() {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [overview, setOverview] = useState<DashboardOverview | null>(null);
  const [motionDevices, setMotionDevices] = useState<DevicePosition[]>([]);
  const [gatewayQuality, setGatewayQuality] = useState<GatewaySignal[]>([]);
  const [eventTypes, setEventTypes] = useState<EventTypeStats[]>([]);
  const [customerStats, setCustomerStats] = useState<CustomerActivity[]>([]);

  const [activeTab, setActiveTab] = useState<'overview' | 'mapview' | 'devices' | 'events' | 'network' | 'customers' | 'rawdata'>('overview');
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  // ✨ NOVO: Estados para controle de refresh
  const [autoRefreshEnabled, setAutoRefreshEnabled] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(30000); // 30 segundos padrão

  const [selectedDevice, setSelectedDevice] = useState<DevicePosition | null>(null);
  const [isMapModalOpen, setIsMapModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

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
    try {
      const [overviewRes, motionRes, gatewayRes, eventsRes, customerRes] = await Promise.all([
        fetch('https://api-dashboards-u1oh.onrender.com/api/dashboard/devices/dashboard/overview'),
        fetch('https://api-dashboards-u1oh.onrender.com/api/dashboard/devices/motion-state'),
        fetch('https://api-dashboards-u1oh.onrender.com/api/dashboard/devices/gateway-quality'),
        fetch('https://api-dashboards-u1oh.onrender.com/api/dashboard/devices/events/types'),
        fetch('https://api-dashboards-u1oh.onrender.com/api/dashboard/devices/customer-stats'),
      ]);

      const overviewData = await overviewRes.json();
      const motionData = await motionRes.json();
      const gatewayData = await gatewayRes.json();
      const eventsData = await eventsRes.json();
      const customerData = await customerRes.json();

      setOverview(overviewData);
      setMotionDevices(motionData);
      setGatewayQuality(gatewayData);
      setEventTypes(eventsData);
      setCustomerStats(customerData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // ✨ ATUALIZADO: useEffect com controle de auto-refresh
  useEffect(() => {
    fetchData(); // Buscar dados inicialmente
    
    let interval: any;
    
    if (autoRefreshEnabled) {
      interval = setInterval(fetchData, refreshInterval);
    }
    
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [autoRefreshEnabled, refreshInterval]);

  // ✨ NOVA FUNÇÃO: Alternar auto-refresh
  const toggleAutoRefresh = () => {
    setAutoRefreshEnabled(prev => !prev);
  };

  // ✨ NOVA FUNÇÃO: Alterar intervalo de refresh
  const handleIntervalChange = (interval: number) => {
    setRefreshInterval(interval);
  };

  // ✨ NOVA FUNÇÃO: Refresh manual
  const handleManualRefresh = () => {
    fetchData();
  };

  useEffect(() => {
    if (!overview) return;

    const timer = setTimeout(() => {
      try {
        const batteryElement = document.getElementById('battery-chart');
        if (batteryElement) {
          const batteryChart = echarts.init(batteryElement);
          const batteryOption: EChartsOption = {
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
                    value: overview.kpis.battery_health.healthy_devices,
                    name: t('batteryChart.healthy'),
                    itemStyle: { color: '#10b981' }
                  },
                  {
                    value: overview.kpis.battery_health.warning_devices,
                    name: t('batteryChart.warning'),
                    itemStyle: { color: '#f59e0b' }
                  },
                  {
                    value: overview.kpis.battery_health.critical_devices,
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
          batteryChart.setOption(batteryOption);
        }

        const accuracyElement = document.getElementById('accuracy-chart');
        if (accuracyElement) {
          const accuracyChart = echarts.init(accuracyElement);
          const accuracyOption: EChartsOption = {
            tooltip: {
              trigger: 'axis',
              axisPointer: { type: 'shadow' },
            },
            grid: {
              left: '3%',
              right: '4%',
              bottom: '3%',
              containLabel: true,
            },
            xAxis: {
              type: 'category',
              data: overview.kpis.accuracy_distribution.map(d => {
                const range = d.accuracy_range;
                if (range.includes('Excellent')) return t('accuracyChart.accuracyRanges.excellent');
                if (range.includes('Good')) return t('accuracyChart.accuracyRanges.good');
                if (range.includes('Fair')) return t('accuracyChart.accuracyRanges.fair');
                if (range.includes('Poor')) return t('accuracyChart.accuracyRanges.poor');
                return range;
              }),
              axisLabel: {
                rotate: 45,
                fontSize: 11,
              },
            },
            yAxis: {
              type: 'value',
              name: t('accuracyChart.yAxis.name'),
            },
            series: [
              {
                name: t('accuracyChart.series.name'),
                type: 'bar',
                data: overview.kpis.accuracy_distribution.map(d => ({
                  value: d.report_count,
                  itemStyle: {
                    color: d.accuracy_range.includes('Excellent') ? '#10b981' :
                      d.accuracy_range.includes('Good') ? '#3b82f6' :
                        d.accuracy_range.includes('Fair') ? '#f59e0b' : '#ef4444',
                  },
                })),
                label: {
                  show: true,
                  position: 'top',
                  formatter: '{c}',
                },
              },
            ],
          };
          accuracyChart.setOption(accuracyOption);
        }

        if (gatewayQuality.length > 0) {
          const gatewayElement = document.getElementById('gateway-chart');
          if (gatewayElement) {
            const gatewayChart = echarts.init(gatewayElement);
            const gatewayOption: EChartsOption = {
              tooltip: {
                trigger: 'axis',
                axisPointer: { type: 'cross' },
              },
              legend: {
                data: [
                  t('gatewayChart.legend.avgRssi'),
                  t('gatewayChart.legend.avgSnr'),
                  t('gatewayChart.legend.reportCount')
                ],
              },
              grid: {
                left: '3%',
                right: '4%',
                bottom: '10%',
                containLabel: true,
              },
              xAxis: {
                type: 'category',
                data: gatewayQuality.map(g => g.gateway_name),
                axisLabel: {
                  rotate: 45,
                  fontSize: 10,
                },
              },
              yAxis: [
                {
                  type: 'value',
                  name: t('gatewayChart.yAxis.rssiSnr'),
                  position: 'left',
                },
                {
                  type: 'value',
                  name: t('gatewayChart.yAxis.count'),
                  position: 'right',
                },
              ],
              series: [
                {
                  name: t('gatewayChart.legend.avgRssi'),
                  type: 'line',
                  data: gatewayQuality.map(g => g.avg_rssi),
                  itemStyle: { color: '#3b82f6' },
                },
                {
                  name: t('gatewayChart.legend.avgSnr'),
                  type: 'line',
                  data: gatewayQuality.map(g => g.avg_snr),
                  itemStyle: { color: '#10b981' },
                },
                {
                  name: t('gatewayChart.legend.reportCount'),
                  type: 'bar',
                  yAxisIndex: 1,
                  data: gatewayQuality.map(g => g.report_count),
                  itemStyle: { color: '#8b5cf6' },
                },
              ],
            };
            gatewayChart.setOption(gatewayOption);
          }
        }

        if (eventTypes.length > 0) {
          const eventsElement = document.getElementById('events-chart');
          if (eventsElement) {
            const eventsChart = echarts.init(eventsElement);
            const eventsOption: EChartsOption = {
              tooltip: {
                trigger: 'axis',
                axisPointer: { type: 'shadow' },
              },
              legend: {
                data: [
                  t('eventsChart.legend.validEvents'),
                  t('eventsChart.legend.duplicates')
                ],
              },
              grid: {
                left: '3%',
                right: '4%',
                bottom: '15%',
                containLabel: true,
              },
              xAxis: {
                type: 'category',
                data: eventTypes.map(e => e.event_type),
                axisLabel: {
                  rotate: 45,
                  fontSize: 10,
                },
              },
              yAxis: {
                type: 'value',
                name: t('eventsChart.yAxis.name'),
              },
              series: [
                {
                  name: t('eventsChart.legend.validEvents'),
                  type: 'bar',
                  stack: 'total',
                  data: eventTypes.map(e => e.valid_events),
                  itemStyle: { color: '#10b981' },
                },
                {
                  name: t('eventsChart.legend.duplicates'),
                  type: 'bar',
                  stack: 'total',
                  data: eventTypes.map(e => e.duplicate_events),
                  itemStyle: { color: '#ef4444' },
                },
              ],
            };
            eventsChart.setOption(eventsOption);
          }
        }
      } catch (error) {
        console.error('Error initializing charts:', error);
      }
    }, 100);

    return () => {
      clearTimeout(timer);

      const batteryElement = document.getElementById('battery-chart');
      const accuracyElement = document.getElementById('accuracy-chart');
      const gatewayElement = document.getElementById('gateway-chart');
      const eventsElement = document.getElementById('events-chart');

      if (batteryElement) {
        const batteryInstance = echarts.getInstanceByDom(batteryElement);
        batteryInstance?.dispose();
      }
      if (accuracyElement) {
        const accuracyInstance = echarts.getInstanceByDom(accuracyElement);
        accuracyInstance?.dispose();
      }
      if (gatewayElement) {
        const gatewayInstance = echarts.getInstanceByDom(gatewayElement);
        gatewayInstance?.dispose();
      }
      if (eventsElement) {
        const eventsInstance = echarts.getInstanceByDom(eventsElement);
        eventsInstance?.dispose();
      }
    };
  }, [overview, gatewayQuality, eventTypes, activeTab]);

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
            <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg">
              <div className={`w-3 h-3 rounded-full ${autoRefreshEnabled ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
              <span className="text-sm text-gray-700">
                {autoRefreshEnabled ? 'Auto-refresh ativo' : 'Auto-refresh pausado'}
              </span>
            </div>

            {/* Seletor de Intervalo */}
            <select
              value={refreshInterval}
              onChange={(e) => handleIntervalChange(Number(e.target.value))}
              disabled={!autoRefreshEnabled}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
            >
              <option value={10000}>10 segundos</option>
              <option value={30000}>30 segundos</option>
              <option value={60000}>1 minuto</option>
              <option value={300000}>5 minutos</option>
            </select>

            {/* Botão Toggle Auto-Refresh */}
            <button
              onClick={toggleAutoRefresh}
              className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                autoRefreshEnabled 
                  ? 'bg-orange-100 text-orange-700 hover:bg-orange-200' 
                  : 'bg-green-100 text-green-700 hover:bg-green-200'
              }`}
            >
              {autoRefreshEnabled ? (
                <>
                  <PauseIcon className="h-4 w-4" />
                  Pausar
                </>
              ) : (
                <>
                  <PlayIcon className="h-4 w-4" />
                  Ativar
                </>
              )}
            </button>

            {/* Botão Refresh Manual */}
            <button
              onClick={handleManualRefresh}
              disabled={refreshing}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors"
            >
              <ArrowPathIcon className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
              {refreshing ? 'Atualizando...' : 'Atualizar'}
            </button>
          </div>
        </div>

        {/* Alertas */}
        <div className="flex flex-wrap gap-3">
          <AlertBadge type="sos" count={overview.alerts.active_sos_count} />
          <AlertBadge type="battery" count={overview.alerts.low_battery_count} />
          <AlertBadge type="offline" count={overview.alerts.offline_count} />
        </div>
      </div>

      {/* Tabs de Navegação */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8 overflow-x-auto">
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
            <div className={`w-2 h-2 rounded-full ${autoRefreshEnabled ? 'bg-green-500' : 'bg-gray-400'}`} />
            <span className="text-sm text-gray-600">
              Última atualização: {new Date().toLocaleTimeString('pt-BR')}
            </span>
          </div>
          {refreshing && (
            <span className="text-sm text-blue-600 animate-pulse flex items-center gap-2">
              <ArrowPathIcon className="h-4 w-4 animate-spin" />
              Atualizando dados...
            </span>
          )}
        </div>
      </div>

      {/* ✅ TAB OVERVIEW COM KPIs TRADUZIDOS */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <KPICard
              title={t('deviceLogs.kpis.deviceUptime.title')}
              value={`${overview.kpis.uptime.uptime_percentage}%`}
              subtitle={t('deviceLogs.kpis.deviceUptime.subtitle', {
                online: overview.kpis.uptime.devices_online,
                total: overview.kpis.uptime.total_devices
              })}
              icon={SignalIcon}
              color="green"
              trend="up"
            />
            {/* <KPICard
              title={t('deviceLogs.kpis.gpsSuccess.title')}
              value={`${overview.kpis.gps_success.success_rate_percent}%`}
              subtitle={t('deviceLogs.kpis.gpsSuccess.subtitle', {
                valid: overview.kpis.gps_success.valid_gps_reports
              })}
              icon={MapPinIcon}
              color="blue"
              trend="up"
            /> */}
            <KPICard
              title={t('deviceLogs.kpis.batteryHealth.title')}
              value={`${overview.kpis.battery_health.health_percentage}%`}
              subtitle={t('deviceLogs.kpis.batteryHealth.subtitle', {
                critical: overview.kpis.battery_health.critical_devices
              })}
              icon={BoltIcon}
              color={overview.kpis.battery_health.critical_devices > 10 ? 'red' : 'yellow'}
            />
            <KPICard
              title={t('deviceLogs.kpis.activeAlerts.title')}
              value={overview.alerts.active_sos_count}
              subtitle={t('deviceLogs.kpis.activeAlerts.subtitle', {
                lowBattery: overview.alerts.low_battery_count
              })}
              icon={ExclamationTriangleIcon}
              color={overview.alerts.active_sos_count > 0 ? 'red' : 'green'}
            />
          </div>

          {/* ✅ GRÁFICOS COM RESPONSIVIDADE */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 min-w-0">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {t('deviceLogs.charts.batteryDistribution')}
              </h3>
              <div className="w-full h-64 sm:h-80 min-h-64 overflow-hidden">
                <div id="battery-chart" className="w-full h-full min-w-0" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 min-w-0">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {t('deviceLogs.charts.gpsAccuracy')}
              </h3>
              <div className="w-full h-64 sm:h-80 min-h-64 overflow-hidden">
                <div id="accuracy-chart" className="w-full h-full min-w-0" />
              </div>
            </div>
          </div>

          {/* ✅ ALERTAS SOS TRADUZIDOS */}
          {overview.alerts.active_sos_count > 0 && (
            <div className="bg-white rounded-lg shadow-sm border border-red-200 p-4 sm:p-6">
              <h3 className="text-lg font-semibold text-red-900 mb-4 flex items-center gap-2">
                <ShieldExclamationIcon className="h-6 w-6" />
                {t('deviceLogs.sosAlerts.title', { count: overview.alerts.active_sos_count })}
              </h3>
              <div className="overflow-x-auto">
                <DataTable

                  columns={[
                    { key: 'dev_eui', label: t('deviceLogs.tables.deviceEui') },
                    { key: 'customer_name', label: t('deviceLogs.tables.customer') },
                    {
                      key: 'sos_start_time',
                      label: t('deviceLogs.tables.startTime'),
                      render: (val) => new Date(val).toLocaleString(),
                    },
                    {
                      key: 'minutes_elapsed',
                      label: t('deviceLogs.tables.timeElapsed'),
                      render: (val) => t('deviceLogs.sosAlerts.minutesAgo', { minutes: val }),
                    },
                    {
                      key: 'battery_level',
                      label: t('deviceLogs.tables.battery'),
                      render: (val) => (
                        <span className={`font-semibold ${val < 20 ? 'text-red-600' : 'text-green-600'}`}>
                          {val}%
                        </span>
                      ),
                    },
                    {
                      key: 'actions',
                      label: t('deviceLogs.tables.location'),
                      render: (_, row) => (
                        <button
                          onClick={() => openMapModal(row)}
                          className="text-blue-600 hover:text-blue-800 text-xs font-medium underline"
                        >
                          {t('deviceLogs.tables.viewOnMap')}
                        </button>
                      ),
                    },
                  ]}
                  data={overview.alerts.active_sos_list}
                />
              </div>
            </div>
          )}

        </div>
      )}


      {/* ✅ TAB OVERVIEW COM KPIs TRADUZIDOS */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <KPICard
              title={t('deviceLogs.kpis.deviceUptime.title')}
              value={`${overview.kpis.uptime.uptime_percentage}%`}
              subtitle={t('deviceLogs.kpis.deviceUptime.subtitle', {
                online: overview.kpis.uptime.devices_online,
                total: overview.kpis.uptime.total_devices
              })}
              icon={SignalIcon}
              color="green"
              trend="up"
            />
            {/* <KPICard
              title={t('deviceLogs.kpis.gpsSuccess.title')}
              value={`${overview.kpis.gps_success.success_rate_percent}%`}
              subtitle={t('deviceLogs.kpis.gpsSuccess.subtitle', {
                valid: overview.kpis.gps_success.valid_gps_reports
              })}
              icon={MapPinIcon}
              color="blue"
              trend="up"
            /> */}
            <KPICard
              title={t('deviceLogs.kpis.batteryHealth.title')}
              value={`${overview.kpis.battery_health.health_percentage}%`}
              subtitle={t('deviceLogs.kpis.batteryHealth.subtitle', {
                critical: overview.kpis.battery_health.critical_devices
              })}
              icon={BoltIcon}
              color={overview.kpis.battery_health.critical_devices > 10 ? 'red' : 'yellow'}
            />
            <KPICard
              title={t('deviceLogs.kpis.activeAlerts.title')}
              value={overview.alerts.active_sos_count}
              subtitle={t('deviceLogs.kpis.activeAlerts.subtitle', {
                lowBattery: overview.alerts.low_battery_count
              })}
              icon={ExclamationTriangleIcon}
              color={overview.alerts.active_sos_count > 0 ? 'red' : 'green'}
            />
          </div>

          {/* ✅ GRÁFICOS COM RESPONSIVIDADE */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 min-w-0">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {t('deviceLogs.charts.batteryDistribution')}
              </h3>
              <div className="w-full h-64 sm:h-80 min-h-64 overflow-hidden">
                <div id="battery-chart" className="w-full h-full min-w-0" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 min-w-0">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {t('deviceLogs.charts.gpsAccuracy')}
              </h3>
              <div className="w-full h-64 sm:h-80 min-h-64 overflow-hidden">
                <div id="accuracy-chart" className="w-full h-full min-w-0" />
              </div>
            </div>
          </div>

          {/* ✅ ALERTAS SOS TRADUZIDOS */}
          {overview.alerts.active_sos_count > 0 && (
            <div className="bg-white rounded-lg shadow-sm border border-red-200 p-4 sm:p-6">
              <h3 className="text-lg font-semibold text-red-900 mb-4 flex items-center gap-2">
                <ShieldExclamationIcon className="h-6 w-6" />
                {t('deviceLogs.sosAlerts.title', { count: overview.alerts.active_sos_count })}
              </h3>
              <div className="overflow-x-auto">
                <DataTable

                  columns={[
                    { key: 'dev_eui', label: t('deviceLogs.tables.deviceEui') },
                    { key: 'customer_name', label: t('deviceLogs.tables.customer') },
                    {
                      key: 'sos_start_time',
                      label: t('deviceLogs.tables.startTime'),
                      render: (val) => new Date(val).toLocaleString(),
                    },
                    {
                      key: 'minutes_elapsed',
                      label: t('deviceLogs.tables.timeElapsed'),
                      render: (val) => t('deviceLogs.sosAlerts.minutesAgo', { minutes: val }),
                    },
                    {
                      key: 'battery_level',
                      label: t('deviceLogs.tables.battery'),
                      render: (val) => (
                        <span className={`font-semibold ${val < 20 ? 'text-red-600' : 'text-green-600'}`}>
                          {val}%
                        </span>
                      ),
                    },
                    {
                      key: 'actions',
                      label: t('deviceLogs.tables.location'),
                      render: (_, row) => (
                        <button
                          onClick={() => openMapModal(row)}
                          className="text-blue-600 hover:text-blue-800 text-xs font-medium underline"
                        >
                          {t('deviceLogs.tables.viewOnMap')}
                        </button>
                      ),
                    },
                  ]}
                  data={overview.alerts.active_sos_list}
                />
              </div>
            </div>
          )}

          <GPSRouteMapLeaflet />
        </div>
      )}

      {activeTab === 'mapview' && (
        <GPSMapViewer />
      )}

      {activeTab === 'devices' && (
        <div className="space-y-6">
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

            <div className="overflow-y-auto max-h-[600px]">
              <DataTable
                columns={[
                  { key: 'dev_eui', label: t('deviceLogs.tables.deviceEui') },
                  { key: 'customer_name', label: t('deviceLogs.tables.customer') },
                  {
                    key: 'dynamic_motion_state',
                    label: t('deviceLogs.tables.state'),
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

              />
            </div>
          </div>

          {overview.alerts.offline_count > 0 && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <SignalSlashIcon className="h-6 w-6 text-gray-500" />
                {t('offlineDevices.title')} ({overview.alerts.offline_count})
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
                data={overview.alerts.offline_devices}
              />
            </div>
          )}
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