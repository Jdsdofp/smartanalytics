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
} from '@heroicons/react/24/outline';
import * as echarts from 'echarts';
import type { EChartsOption } from 'echarts';

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import RawDataExplorer from './DataGrid/gridMN0400_211';

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
                Detalhes do Dispositivo
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
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Cliente</p>
                  <p className="mt-1 text-sm font-semibold text-gray-900">{device.customer_name}</p>
                </div>
                <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Estado</p>
                  <p className="mt-1 text-sm font-semibold">
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${
                      device.dynamic_motion_state === 'MOVING' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {device.dynamic_motion_state === 'MOVING' ? '🚶 Movimento' : '⏸️ Estático'}
                    </span>
                  </p>
                </div>
                <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Bateria</p>
                  <div className="mt-1 flex items-center gap-2">
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          device.battery_level >= 30 ? 'bg-green-500' : 
                          device.battery_level >= 20 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${device.battery_level}%` }}
                      />
                    </div>
                    <span className="text-sm font-semibold text-gray-900">{device.battery_level}%</span>
                  </div>
                </div>
                <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Última Atualização</p>
                  <p className="mt-1 text-xs font-medium text-gray-900">
                    {new Date(device.timestamp).toLocaleString('pt-BR')}
                  </p>
                </div>
              </div>
            </div>

            <div className="border-b border-gray-200 px-6">
              <nav className="-mb-px flex space-x-8">
                {[
                  { id: 'info', label: 'Informações', icon: '📋' },
                  { id: 'route', label: 'Rota (24h)', icon: '🗺️' },
                  { id: 'events', label: 'Eventos', icon: '🚨' },
                  { id: 'config', label: 'Configuração', icon: '⚙️' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveDetailsTab(tab.id as any)}
                    className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm ${
                      activeDetailsTab === tab.id
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
                        <h4 className="text-lg font-semibold text-gray-900 mb-4">📋 Informações Gerais</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm text-gray-500">Device EUI</p>
                            <p className="mt-1 text-sm font-mono font-medium text-gray-900">{device.dev_eui}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Cliente</p>
                            <p className="mt-1 text-sm font-medium text-gray-900">{device.customer_name}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Nível de Bateria</p>
                            <p className="mt-1 text-sm font-medium text-gray-900">{device.battery_level}%</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Estado de Movimento</p>
                            <p className="mt-1 text-sm font-medium text-gray-900">{device.dynamic_motion_state}</p>
                          </div>
                        </div>
                      </div>

                      {device.gps_latitude && device.gps_longitude && (
                        <div className="bg-white border border-gray-200 rounded-lg p-6">
                          <h4 className="text-lg font-semibold text-gray-900 mb-4">📍 Localização GPS</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <p className="text-sm text-gray-500">Latitude</p>
                              <p className="mt-1 text-sm font-mono font-medium text-gray-900">
                                {device.gps_latitude.toFixed(6)}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500">Longitude</p>
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
                              📍 {deviceDetails.route24h.length} posições registradas nas últimas 24 horas
                            </p>
                          </div>
                          <div className="overflow-y-auto max-h-[400px]">
                            <table className="min-w-full divide-y divide-gray-300">
                              <thead className="bg-gray-50 sticky top-0">
                                <tr>
                                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Horário</th>
                                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Latitude</th>
                                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Longitude</th>
                                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Velocidade</th>
                                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Bateria</th>
                                </tr>
                              </thead>
                              <tbody className="bg-white divide-y divide-gray-200">
                                {deviceDetails.route24h.map((point, idx) => (
                                  <tr key={idx} className="hover:bg-gray-50">
                                    <td className="px-4 py-3 text-sm text-gray-900">
                                      {new Date(point.timestamp).toLocaleString('pt-BR')}
                                    </td>
                                    <td className="px-4 py-3 text-sm font-mono text-gray-900">
                                      {point.latitude.toFixed(6)}
                                    </td>
                                    <td className="px-4 py-3 text-sm font-mono text-gray-900">
                                      {point.longitude.toFixed(6)}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-900">
                                      {point.speed ? `${point.speed.toFixed(1)} km/h` : 'N/A'}
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
                          <p className="mt-2">Nenhuma rota registrada nas últimas 24 horas</p>
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
                              🚨 {deviceDetails.recentEvents.length} eventos recentes
                            </p>
                          </div>
                          <div className="space-y-3">
                            {deviceDetails.recentEvents.map((event, idx) => (
                              <div key={idx} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                                <div className="flex items-start justify-between">
                                  <div>
                                    <p className="font-medium text-gray-900">{event.event_type}</p>
                                    <p className="text-xs text-gray-500 mt-1">
                                      {new Date(event.event_timestamp).toLocaleString('pt-BR')}
                                    </p>
                                  </div>
                                  <span className="text-xs font-medium text-gray-600">
                                    🔋 {event.battery_level}%
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </>
                      ) : (
                        <div className="text-center py-12 text-gray-500">
                          <ShieldExclamationIcon className="mx-auto h-12 w-12 text-gray-400" />
                          <p className="mt-2">Nenhum evento recente registrado</p>
                        </div>
                      )}
                    </div>
                  )}

                  {activeDetailsTab === 'config' && (
                    <div className="space-y-6">
                      {deviceDetails?.configuration ? (
                        <div className="bg-white border border-gray-200 rounded-lg p-6">
                          <h4 className="text-lg font-semibold text-gray-900 mb-4">⚙️ Configuração Atual</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <p className="text-sm text-gray-500">Modo de Rastreamento</p>
                              <p className="mt-1 text-sm font-medium text-gray-900">
                                {deviceDetails.configuration.tracking_mode}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500">Período de Uplink</p>
                              <p className="mt-1 text-sm font-medium text-gray-900">
                                {deviceDetails.configuration.tracking_ul_period}s
                              </p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500">Bateria na Última Config</p>
                              <p className="mt-1 text-sm font-medium text-gray-900">
                                {deviceDetails.configuration.battery_level}%
                              </p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500">Última Reconfiguração</p>
                              <p className="mt-1 text-sm font-medium text-gray-900">
                                {new Date(deviceDetails.configuration.last_config).toLocaleString('pt-BR')}
                              </p>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-12 text-gray-500">
                          <Cog6ToothIcon className="mx-auto h-12 w-12 text-gray-400" />
                          <p className="mt-2">Configuração não disponível</p>
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
              Fechar
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
  if (!isOpen || !device) return null;

  const position: [number, number] = [
    device.gps_latitude || 0,
    device.gps_longitude || 0
  ];

  const isSOSAlert = device.dynamic_motion_state === 'SOS_ACTIVE';

  return (
    <div className="fixed inset-0 z-50 flex min-h-full items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="relative bg-white rounded-lg shadow-xl max-w-4xl w-full">
        <div className={`flex items-center justify-between p-6 border-b ${
          isSOSAlert ? 'border-red-200 bg-red-50' : 'border-gray-200'
        }`}>
          <div>
            <div className="flex items-center gap-2">
              {isSOSAlert && (
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 animate-pulse">
                  🚨 ALERTA SOS ATIVO
                </span>
              )}
              <h3 className={`text-lg font-semibold ${isSOSAlert ? 'text-red-900' : 'text-gray-900'}`}>
                📍 Localização do Dispositivo
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
          <div className={`h-[500px] rounded-lg overflow-hidden border-2 ${
            isSOSAlert ? 'border-red-400' : 'border-gray-200'
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
                      <p className="font-bold text-red-600 mb-1">🚨 ALERTA SOS</p>
                    )}
                    <p className="font-semibold">{device.dev_eui}</p>
                    <p className="text-sm text-gray-600">{device.customer_name}</p>
                    <p className="text-xs text-gray-500 mt-1">Bateria: {device.battery_level}%</p>
                    <p className="text-xs text-gray-500">
                      Estado: {device.dynamic_motion_state === 'SOS_ACTIVE' ? 'SOS ATIVO' : device.dynamic_motion_state}
                    </p>
                  </div>
                </Popup>
              </Marker>
            </MapContainer>
          </div>
        </div>

        <div className="px-6 pb-6">
          <div className={`grid grid-cols-2 md:grid-cols-4 gap-4 rounded-lg p-4 ${
            isSOSAlert ? 'bg-red-50' : 'bg-gray-50'
          }`}>
            <div>
              <p className="text-xs text-gray-500">Estado</p>
              <p className={`mt-1 font-medium ${isSOSAlert ? 'text-red-900' : 'text-gray-900'}`}>
                {device.dynamic_motion_state === 'SOS_ACTIVE' 
                  ? '🚨 SOS ATIVO' 
                  : device.dynamic_motion_state === 'MOVING' 
                  ? '🚶 Em Movimento' 
                  : '⏸️ Estático'}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Bateria</p>
              <p className={`mt-1 font-medium ${
                device.battery_level < 20 ? 'text-red-600' : 'text-gray-900'
              }`}>
                {device.battery_level}%
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Latitude</p>
              <p className="mt-1 font-mono text-sm text-gray-900">{device.gps_latitude?.toFixed(6)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Longitude</p>
              <p className="mt-1 font-mono text-sm text-gray-900">{device.gps_longitude?.toFixed(6)}</p>
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
            Abrir no Google Maps
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Fechar
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

const AlertBadge = ({ 
  type, 
  count 
}: { 
  type: 'sos' | 'battery' | 'offline';
  count: number;
}) => {
  const config = {
    sos: {
      label: 'SOS Ativo',
      icon: ShieldExclamationIcon,
      color: 'bg-red-100 text-red-800 ring-red-600/20',
    },
    battery: {
      label: 'Bateria Baixa',
      icon: BoltIcon,
      color: 'bg-yellow-100 text-yellow-800 ring-yellow-600/20',
    },
    offline: {
      label: 'Offline',
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
  const [loading, setLoading] = useState(true);
  const [overview, setOverview] = useState<DashboardOverview | null>(null);
  const [motionDevices, setMotionDevices] = useState<DevicePosition[]>([]);
  const [gatewayQuality, setGatewayQuality] = useState<GatewaySignal[]>([]);
  const [eventTypes, setEventTypes] = useState<EventTypeStats[]>([]);
  const [customerStats, setCustomerStats] = useState<CustomerActivity[]>([]);
  
  const [activeTab, setActiveTab] = useState<'overview' | 'devices' | 'events' | 'network' | 'customers' | 'rawdata'>('overview');
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

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

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

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
              formatter: '{b}: {c} ({d}%)',
            },
            legend: {
              orient: 'vertical',
              left: 'left',
            },
            series: [
              {
                name: 'Status da Bateria',
                type: 'pie',
                radius: '70%',
                data: [
                  { value: overview.kpis.battery_health.healthy_devices, name: 'Saudável (≥30%)', itemStyle: { color: '#10b981' } },
                  { value: overview.kpis.battery_health.warning_devices, name: 'Atenção (20-29%)', itemStyle: { color: '#f59e0b' } },
                  { value: overview.kpis.battery_health.critical_devices, name: 'Crítico (<20%)', itemStyle: { color: '#ef4444' } },
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
              data: overview.kpis.accuracy_distribution.map(d => d.accuracy_range),
              axisLabel: {
                rotate: 45,
                fontSize: 11,
              },
            },
            yAxis: {
              type: 'value',
              name: 'Quantidade',
            },
            series: [
              {
                name: 'Relatórios',
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
                data: ['RSSI Médio', 'SNR Médio', 'Contagem de Relatórios'],
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
                  name: 'RSSI/SNR',
                  position: 'left',
                },
                {
                  type: 'value',
                  name: 'Contagem',
                  position: 'right',
                },
              ],
              series: [
                {
                  name: 'RSSI Médio',
                  type: 'line',
                  data: gatewayQuality.map(g => g.avg_rssi),
                  itemStyle: { color: '#3b82f6' },
                },
                {
                  name: 'SNR Médio',
                  type: 'line',
                  data: gatewayQuality.map(g => g.avg_snr),
                  itemStyle: { color: '#10b981' },
                },
                {
                  name: 'Contagem de Relatórios',
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
                data: ['Eventos Válidos', 'Duplicados'],
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
                name: 'Quantidade',
              },
              series: [
                {
                  name: 'Eventos Válidos',
                  type: 'bar',
                  stack: 'total',
                  data: eventTypes.map(e => e.valid_events),
                  itemStyle: { color: '#10b981' },
                },
                {
                  name: 'Duplicados',
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
          <h3 className="mt-2 text-sm font-medium text-gray-900">Erro ao carregar dados</h3>
          <button
            onClick={fetchData}
            className="mt-4 inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Device Logs & Monitoring</h1>
            <p className="mt-2 text-sm text-gray-600">
              Última atualização: {new Date(overview.generated_at).toLocaleString('pt-BR')}
            </p>
          </div>
          <button
            onClick={fetchData}
            disabled={refreshing}
            className="inline-flex items-center gap-2 px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ArrowPathIcon className={`h-5 w-5 ${refreshing ? 'animate-spin' : ''}`} />
            Atualizar
          </button>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <AlertBadge type="sos" count={overview.alerts.active_sos_count} />
          <AlertBadge type="battery" count={overview.alerts.low_battery_count} />
          <AlertBadge type="offline" count={overview.alerts.offline_count} />
        </div>
      </div>

      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8 overflow-x-auto">
          {[
            { id: 'overview', label: 'Visão Geral', icon: ChartBarIcon },
            { id: 'devices', label: 'Dispositivos', icon: DevicePhoneMobileIcon },
            { id: 'events', label: 'Eventos', icon: ShieldExclamationIcon },
            { id: 'network', label: 'Rede', icon: SignalIcon },
            { id: 'customers', label: 'Clientes', icon: MapPinIcon },
            { id: 'rawdata', label: 'Dados Brutos', icon: DocumentChartBarIcon },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <tab.icon className="h-5 w-5" />
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <KPICard
              title="Device Uptime"
              value={`${overview.kpis.uptime.uptime_percentage}%`}
              subtitle={`${overview.kpis.uptime.devices_online} de ${overview.kpis.uptime.total_devices} online`}
              icon={SignalIcon}
              color="green"
              trend="up"
            />
            <KPICard
              title="Taxa de Sucesso GPS"
              value={`${overview.kpis.gps_success.success_rate_percent}%`}
              subtitle={`${overview.kpis.gps_success.valid_gps_reports} relatórios válidos`}
              icon={MapPinIcon}
              color="blue"
              trend="up"
            />
            <KPICard
              title="Saúde da Bateria"
              value={`${overview.kpis.battery_health.health_percentage}%`}
              subtitle={`${overview.kpis.battery_health.critical_devices} dispositivos críticos`}
              icon={BoltIcon}
              color={overview.kpis.battery_health.critical_devices > 10 ? 'red' : 'yellow'}
              trend={overview.kpis.battery_health.critical_devices > 10 ? 'down' : 'neutral'}
            />
            <KPICard
              title="Alertas Ativos"
              value={overview.alerts.active_sos_count}
              subtitle={`${overview.alerts.low_battery_count} baterias baixas`}
              icon={ExclamationTriangleIcon}
              color={overview.alerts.active_sos_count > 0 ? 'red' : 'green'}
              trend={overview.alerts.active_sos_count > 0 ? 'down' : 'neutral'}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ChartContainer id="battery-chart" title="Distribuição de Saúde da Bateria" />
            <ChartContainer id="accuracy-chart" title="Precisão de Posição GPS" />
          </div>

          {overview.alerts.active_sos_count > 0 && (
            <div className="bg-white rounded-lg shadow-sm border border-red-200 p-6">
              <h3 className="text-lg font-semibold text-red-900 mb-4 flex items-center gap-2">
                <ShieldExclamationIcon className="h-6 w-6" />
                Alertas SOS Ativos ({overview.alerts.active_sos_count})
              </h3>
              <DataTable
                columns={[
                  { key: 'dev_eui', label: 'Device EUI' },
                  { key: 'customer_name', label: 'Cliente' },
                  { 
                    key: 'sos_start_time', 
                    label: 'Início',
                    render: (val) => new Date(val).toLocaleString('pt-BR'),
                  },
                  { 
                    key: 'minutes_elapsed', 
                    label: 'Tempo Decorrido',
                    render: (val) => `${val} min`,
                  },
                  { 
                    key: 'battery_level', 
                    label: 'Bateria',
                    render: (val) => (
                      <span className={`font-semibold ${val < 20 ? 'text-red-600' : 'text-green-600'}`}>
                        {val}%
                      </span>
                    ),
                  },
                  {
                    key: 'actions',
                    label: 'Localização',
                    render: (_, row) => {
                      const device: DevicePosition = {
                        dev_eui: row.dev_eui,
                        customer_name: row.customer_name,
                        dynamic_motion_state: 'SOS_ACTIVE',
                        timestamp: row.sos_start_time,
                        battery_level: row.battery_level,
                        gps_latitude: row.gps_latitude,
                        gps_longitude: row.gps_longitude,
                      };

                      return (
                        <button
                          onClick={() => openMapModal(device)}
                          className="text-blue-600 hover:text-blue-800 text-xs font-medium underline"
                        >
                          📍 Ver no Mapa
                        </button>
                      );
                    },
                  },
                ]}
                data={overview.alerts.active_sos_list}
              />
            </div>
          )}

          {overview.alerts.low_battery_count > 0 && (
            <div className="bg-white rounded-lg shadow-sm border border-yellow-200 p-6">
              <h3 className="text-lg font-semibold text-yellow-900 mb-4 flex items-center gap-2">
                <BoltIcon className="h-6 w-6" />
                Dispositivos com Bateria Baixa ({overview.alerts.low_battery_count})
              </h3>
              <DataTable
                columns={[
                  { key: 'dev_eui', label: 'Device EUI' },
                  { key: 'customer_name', label: 'Cliente' },
                  { 
                    key: 'battery_level', 
                    label: 'Nível',
                    render: (val) => (
                      <div className="flex items-center gap-2">
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${val < 10 ? 'bg-red-600' : 'bg-yellow-500'}`}
                            style={{ width: `${val}%` }}
                          />
                        </div>
                        <span className="font-semibold">{val}%</span>
                      </div>
                    ),
                  },
                  { 
                    key: 'timestamp', 
                    label: 'Última Atualização',
                    render: (val) => new Date(val).toLocaleString('pt-BR'),
                  },
                ]}
                data={overview.alerts.low_battery_devices}
              />
            </div>
          )}
        </div>
      )}

      {activeTab === 'devices' && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por Device EUI ou Cliente..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <DevicePhoneMobileIcon className="h-6 w-6" />
              Status de Movimento dos Dispositivos ({filteredMotionDevices.length})
            </h3>
            
            <div className="overflow-y-auto max-h-[600px]">
              <DataTable
                columns={[
                  { key: 'dev_eui', label: 'Device EUI' },
                  { key: 'customer_name', label: 'Cliente' },
                  { 
                    key: 'dynamic_motion_state', 
                    label: 'Estado',
                    render: (val) => (
                      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${
                        val === 'MOVING' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {val === 'MOVING' ? '🚶 Em Movimento' : '⏸️ Estático'}
                      </span>
                    ),
                  },
                  { 
                    key: 'battery_level', 
                    label: 'Bateria',
                    render: (val) => (
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${
                              val >= 30 ? 'bg-green-500' : 
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
                    label: 'Última Posição',
                    render: (val) => new Date(val).toLocaleString('pt-BR'),
                  },
                  {
                    key: 'actions',
                    label: 'Ações',
                    render: (_, row) => (
                      <div className="flex gap-2">
                        {row.gps_latitude && row.gps_longitude && (
                          <button
                            onClick={() => openMapModal(row)}
                            className="text-blue-600 hover:text-blue-800 text-xs font-medium"
                          >
                            📍 Mapa
                          </button>
                        )}
                        <button 
                          onClick={() => openDetailsModal(row)}
                          className="text-purple-600 hover:text-purple-800 text-xs font-medium"
                        >
                          📊 Detalhes
                        </button>
                      </div>
                    ),
                  },
                ]}
                data={filteredMotionDevices}
                emptyMessage="Nenhum dispositivo encontrado"
              />
            </div>
          </div>

          {overview.alerts.offline_count > 0 && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <SignalSlashIcon className="h-6 w-6 text-gray-500" />
                Dispositivos Offline ({overview.alerts.offline_count})
              </h3>
              <DataTable
                columns={[
                  { key: 'dev_eui', label: 'Device EUI' },
                  { key: 'customer_name', label: 'Cliente' },
                  { 
                    key: 'last_position', 
                    label: 'Última Posição',
                    render: (val) => new Date(val).toLocaleString('pt-BR'),
                  },
                  { 
                    key: 'hours_offline', 
                    label: 'Tempo Offline',
                    render: (val) => (
                      <span className={`font-semibold ${
                        val > 72 ? 'text-red-600' : 
                        val > 48 ? 'text-orange-600' : 'text-yellow-600'
                      }`}>
                        {val}h
                      </span>
                    ),
                  },
                  { 
                    key: 'battery_level', 
                    label: 'Bateria',
                    render: (val) => val ? `${val}%` : 'N/A',
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
          <ChartContainer id="events-chart" title="Distribuição de Tipos de Eventos (24h)" height="500px" />

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <ChartBarIcon className="h-6 w-6" />
              Estatísticas de Eventos
            </h3>
            <DataTable
              columns={[
                { key: 'event_type', label: 'Tipo de Evento' },
                { 
                  key: 'total', 
                  label: 'Total',
                  render: (val) => (
                    <span className="font-semibold text-gray-900">{val.toLocaleString()}</span>
                  ),
                },
                { 
                  key: 'valid_events', 
                  label: 'Válidos',
                  render: (val) => (
                    <span className="text-green-600 font-medium">{val.toLocaleString()}</span>
                  ),
                },
                { 
                  key: 'duplicate_events', 
                  label: 'Duplicados',
                  render: (val) => (
                    <span className="text-red-600 font-medium">{val.toLocaleString()}</span>
                  ),
                },
                { 
                  key: 'unique_devices', 
                  label: 'Dispositivos Únicos',
                  render: (val) => (
                    <span className="text-blue-600 font-medium">{val}</span>
                  ),
                },
                {
                  key: 'duplication_rate',
                  label: 'Taxa de Duplicação',
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
              emptyMessage="Nenhum evento registrado nas últimas 24 horas"
            />
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">📖 Legenda de Tipos de Eventos</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { type: 'SOS_MODE_START', desc: 'Início de alerta SOS', color: 'red' },
                { type: 'SOS_MODE_END', desc: 'Fim de alerta SOS', color: 'green' },
                { type: 'MOTION_START', desc: 'Início de movimento', color: 'blue' },
                { type: 'MOTION_END', desc: 'Fim de movimento', color: 'gray' },
                { type: 'GEOFENCE_ENTRY', desc: 'Entrada em geofence', color: 'purple' },
                { type: 'GEOFENCE_EXIT', desc: 'Saída de geofence', color: 'orange' },
              ].map((item) => (
                <div key={item.type} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className={`w-3 h-3 rounded-full bg-${item.color}-500`} />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{item.type}</p>
                    <p className="text-xs text-gray-500">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'network' && (
        <div className="space-y-6">
          <ChartContainer id="gateway-chart" title="Qualidade de Sinal por Gateway" height="500px" />

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <SignalIcon className="h-6 w-6" />
              Estatísticas de Gateways ({gatewayQuality.length})
            </h3>
            <DataTable
              columns={[
                { key: 'gateway_name', label: 'Gateway' },
                { 
                  key: 'report_count', 
                  label: 'Relatórios',
                  render: (val) => (
                    <span className="font-semibold text-blue-600">{val.toLocaleString()}</span>
                  ),
                },
                { 
                  key: 'avg_rssi', 
                  label: 'RSSI Médio',
                  render: (val) => {
                    if (val == null || isNaN(val)) return 'N/A';
                    const rssi = Number(val).toFixed(1);
                    return (
                      <span className={`font-medium ${
                        val > -80 ? 'text-green-600' : 
                        val > -100 ? 'text-yellow-600' : 'text-red-600'
                      }`}>
                        {rssi} dBm
                      </span>
                    );
                  },
                },
                { 
                  key: 'avg_snr', 
                  label: 'SNR Médio',
                  render: (val) => {
                    if (val == null || isNaN(val)) return 'N/A';
                    const snr = Number(val).toFixed(1);
                    return (
                      <span className={`font-medium ${
                        val > 5 ? 'text-green-600' : 
                        val > 0 ? 'text-yellow-600' : 'text-red-600'
                      }`}>
                        {snr} dB
                      </span>
                    );
                  },
                },
                { 
                  key: 'min_rssi', 
                  label: 'RSSI Min',
                  render: (val) => {
                    if (val == null || isNaN(val)) return 'N/A';
                    return `${Number(val).toFixed(1)} dBm`;
                  },
                },
                { 
                  key: 'max_rssi', 
                  label: 'RSSI Max',
                  render: (val) => {
                    if (val == null || isNaN(val)) return 'N/A';
                    return `${Number(val).toFixed(1)} dBm`;
                  },
                },
                {
                  key: 'quality',
                  label: 'Qualidade',
                  render: (_, row) => {
                    if (row.avg_rssi == null || isNaN(row.avg_rssi)) return 'N/A';
                    
                    const quality = row.avg_rssi > -80 ? 'Excelente' : 
                                   row.avg_rssi > -90 ? 'Bom' : 
                                   row.avg_rssi > -100 ? 'Regular' : 'Ruim';
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
              emptyMessage="Nenhum dado de gateway disponível"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Gateways Ativos</p>
                  <p className="mt-2 text-3xl font-semibold text-gray-900">{gatewayQuality.length}</p>
                </div>
                <SignalIcon className="h-10 w-10 text-blue-600" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">RSSI Médio Geral</p>
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
                  <p className="text-sm font-medium text-gray-600">Total de Relatórios</p>
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
                placeholder="Buscar por Cliente ou Domínio..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <MapPinIcon className="h-6 w-6" />
              Atividade por Cliente ({filteredCustomers.length})
            </h3>
            <DataTable
              columns={[
                { key: 'customer_name', label: 'Cliente' },
                { key: 'domain_name', label: 'Domínio' },
                { 
                  key: 'total_devices', 
                  label: 'Dispositivos',
                  render: (val) => (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      <DevicePhoneMobileIcon className="h-4 w-4" />
                      {val}
                    </span>
                  ),
                },
                { 
                  key: 'total_reports', 
                  label: 'Relatórios (24h)',
                  render: (val) => (
                    <span className="font-semibold text-gray-900">{val.toLocaleString()}</span>
                  ),
                },
                { 
                  key: 'avg_battery', 
                  label: 'Bateria Média',
                  render: (val) => {
                    if (val == null || isNaN(val)) return 'N/A';
                    
                    const battery = Number(val).toFixed(1);
                    const percentage = Math.min(100, Math.max(0, val));
                    
                    return (
                      <div className="flex items-center gap-2">
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${
                              val >= 30 ? 'bg-green-500' : 
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
                  label: 'Última Atividade',
                  render: (val) => {
                    const date = new Date(val);
                    const now = new Date();
                    const diffMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
                    
                    let timeAgo = '';
                    if (diffMinutes < 60) {
                      timeAgo = `${diffMinutes} min atrás`;
                    } else if (diffMinutes < 1440) {
                      timeAgo = `${Math.floor(diffMinutes / 60)}h atrás`;
                    } else {
                      timeAgo = `${Math.floor(diffMinutes / 1440)}d atrás`;
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
                  label: 'Ações',
                  render: (_, row) => (
                    <button 
                      onClick={() => {
                        console.log('Cliente:', row.customer_name);
                      }}
                      className="text-blue-600 hover:text-blue-800 text-xs font-medium"
                    >
                      Ver Detalhes →
                    </button>
                  ),
                },
              ]}
              data={filteredCustomers}
              emptyMessage="Nenhum cliente encontrado"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <p className="text-sm font-medium text-gray-600">Total de Clientes</p>
              <p className="mt-2 text-3xl font-semibold text-gray-900">{customerStats.length}</p>
            </div>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <p className="text-sm font-medium text-gray-600">Total de Dispositivos</p>
              <p className="mt-2 text-3xl font-semibold text-gray-900">
                {customerStats.reduce((sum, c) => sum + c.total_devices, 0)}
              </p>
            </div>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <p className="text-sm font-medium text-gray-600">Total de Relatórios</p>
              <p className="mt-2 text-3xl font-semibold text-gray-900">
                {customerStats.reduce((sum, c) => sum + c.total_reports, 0).toLocaleString()}
              </p>
            </div>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <p className="text-sm font-medium text-gray-600">Bateria Média Geral</p>
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