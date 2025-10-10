import React, { useState, useMemo, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import * as echarts from 'echarts';
import { 
  ExclamationTriangleIcon, 
  UsersIcon, 
  MapPinIcon, 
  ArrowTrendingUpIcon, 
  CheckCircleIcon,
  FunnelIcon,
  ClockIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import 'leaflet/dist/leaflet.css';

// Tipagens da resposta da API
interface AlertInfo {
  active: boolean;
  geofence_status: string;
}

interface LocationInfo {
  lat: number;
  lng: number;
  distance_moved_m: number;
}

interface Item {
  id: string | number;
  name: string;
  location: LocationInfo;
  alerts: AlertInfo;
  zone_name: string;
  zone_code: string;
}

interface Zone {
  zone_code: string;
  zone_name: string;
  items: Item[];
}

interface Site {
  name: string;
  code: string;
  zones: Zone[];
}

interface Company {
  name: string;
}

interface Analytics {
  alerts_by_zone: { zone_name: string; alert_count: number }[];
  avg_distance_moved: number;
}

interface DashboardData {
  company: Company;
  site: Site;
  analytics: Analytics;
}

const REFRESH_INTERVAL = 30000; // 30 segundos

const LocationDashboard: React.FC = () => {
  const [selectedZone, setSelectedZone] = useState<string>('all');
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const pieChartRef = useRef<HTMLDivElement | null>(null);
  const barChartRef = useRef<HTMLDivElement | null>(null);

  

  const getCompanyId = () => {
    try {
      const companyData = sessionStorage.getItem('companyData');
      if (companyData) {
        const parsed = JSON.parse(companyData);
        return parsed?.details?.company_id as string | number;
      }
    } catch (err) {
      console.error('Erro ao ler companyData do sessionStorage:', err);
    }
    return null;
  };

  const companyId = getCompanyId();
  const API_URL = `https://api-dashboards-u1oh.onrender.com/api/dashboard/metrics/${companyId}`;

  const fetchData = async () => {
    if (!companyId) {
      setError('Company ID não encontrado no sessionStorage');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(API_URL);
      if (!response.ok) throw new Error(`Erro na API: ${response.status} ${response.statusText}`);

      const jsonData: DashboardData = await response.json();
      setData(jsonData);
      setLastUpdate(new Date());
      setLoading(false);
    } catch (err: any) {
      console.error('Erro ao buscar dados:', err);
      setError(err.message);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    if (companyId) {
      const interval = setInterval(fetchData, REFRESH_INTERVAL);
      return () => clearInterval(interval);
    }
  }, [companyId]);

  const allItems = useMemo<Item[]>(() => {
    if (!data?.site?.zones) return [];
    return data.site.zones.flatMap(zone =>
      zone.items.map(item => ({ ...item, zone_name: zone.zone_name, zone_code: zone.zone_code }))
    );
  }, [data]);

  const filteredItems = useMemo<Item[]>(() => {
    if (selectedZone === 'all') return allItems;
    return allItems.filter(item => item.zone_code === selectedZone);
  }, [selectedZone, allItems]);

  const alertStats = useMemo(() => {
    const active = filteredItems.filter(i => i.alerts?.active).length;
    return {
      active,
      safe: filteredItems.length - active,
      percentage:
        filteredItems.length > 0
          ? ((active / filteredItems.length) * 100).toFixed(1)
          : '0',
    };
  }, [filteredItems]);

  // Gráfico de Pizza
  useEffect(() => {
    if (!pieChartRef.current || !data) return;
    const chart = echarts.init(pieChartRef.current);
    const option = {
      backgroundColor: 'transparent',
      tooltip: { trigger: 'item' },
      legend: { bottom: '5%', left: 'center', textStyle: { color: '#cbd5e1' } },
      series: [
        {
          name: 'Status',
          type: 'pie',
          radius: ['40%', '70%'],
          label: { show: true, formatter: '{b}: {d}%', color: '#fff' },
          data: [
            { value: alertStats.active, name: 'Com Alertas', itemStyle: { color: '#ef4444' } },
            { value: alertStats.safe, name: 'Seguros', itemStyle: { color: '#22c55e' } }
          ]
        }
      ]
    };
    chart.setOption(option);
    const handleResize = () => chart.resize();
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      chart.dispose();
    };
  }, [alertStats, data]);

  // Gráfico de Barras
  useEffect(() => {
    if (!barChartRef.current || !data?.analytics?.alerts_by_zone) return;
    const chart = echarts.init(barChartRef.current);
    const alertsData = data.analytics.alerts_by_zone.map(z => ({
      name: z.zone_name.replace('REFINING - ', '').replace('RIYADH ', ''),
      value: z.alert_count
    }));

    const option = {
      backgroundColor: 'transparent',
      tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
      xAxis: {
        type: 'category',
        data: alertsData.map(d => d.name),
        axisLabel: { color: '#9ca3af', interval: 0, rotate: 15 }
      },
      yAxis: {
        type: 'value',
        axisLabel: { color: '#9ca3af' }
      },
      series: [
        {
          name: 'Alertas',
          type: 'bar',
          data: alertsData.map(d => d.value),
          itemStyle: { color: '#ef4444', borderRadius: [8, 8, 0, 0] }
        }
      ]
    };
    chart.setOption(option);
    const handleResize = () => chart.resize();
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      chart.dispose();
    };
  }, [data]);

  // Loading state
  if (loading && !data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <ArrowPathIcon className="w-16 h-16 text-blue-400 animate-spin mx-auto mb-4" />
          <p className="text-white text-xl font-semibold">Carregando dados...</p>
          <p className="text-slate-400 mt-2">
            {companyId ? `Conectando à API (Company ID: ${companyId})` : 'Company ID não encontrado'}
          </p>
        </div>
      </div>
    );
  }

  // Error state
  if (error && !data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <ExclamationTriangleIcon className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <p className="text-white text-xl font-semibold mb-2">Erro ao carregar dados</p>
          <p className="text-slate-400 mb-2">{error}</p>
          {!companyId && (
            <p className="text-amber-400 text-sm mb-4">
              Certifique-se de que o 'companyData' está salvo no sessionStorage
            </p>
          )}
          <button
            onClick={fetchData}
            disabled={!companyId}
            className="bg-blue-500 hover:bg-blue-600 disabled:bg-slate-600 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg font-semibold transition-colors flex items-center gap-2 mx-auto"
          >
            <ArrowPathIcon className="w-5 h-5" />
            Tentar Novamente
          </button>
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <div className="bg-slate-800/50 backdrop-blur-sm border-b border-slate-700 sticky top-0 z-50">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                <MapPinIcon className="w-8 h-8 text-blue-400" />
                {data.company?.name || 'Dashboard'}
              </h1>
              <p className="text-slate-400 text-sm mt-1">
                {data.site?.name || ''} {data.site?.code ? `- ${data.site.code}` : ''}
              </p>
            </div>
            <div className="flex gap-3 items-center">
              <div className="flex items-center gap-2 bg-slate-700/50 px-3 py-2 rounded-lg">
                <ClockIcon className="w-5 h-5 text-slate-400" />
                <div className="text-left">
                  <span className="text-slate-300 text-xs block">Última atualização</span>
                  <span className="text-white text-xs font-semibold">
                    {lastUpdate ? lastUpdate.toLocaleTimeString('pt-BR') : '--:--:--'}
                  </span>
                </div>
              </div>
              <button
                onClick={fetchData}
                disabled={loading}
                className="bg-blue-500 hover:bg-blue-600 disabled:bg-slate-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
              >
                <ArrowPathIcon className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                <span className="text-sm">Atualizar</span>
              </button>
              <div className="relative">
                <FunnelIcon className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <select 
                  value={selectedZone}
                  onChange={(e) => setSelectedZone(e.target.value)}
                  className="bg-slate-700 text-white pl-10 pr-4 py-2 rounded-lg border border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
                >
                  <option value="all">Todas as Zonas</option>
                  {data.site?.zones?.map(zone => (
                    <option key={zone.zone_code} value={zone.zone_code}>{zone.zone_name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-xl transform hover:scale-105 transition-transform">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium">Total de Badges</p>
                <p className="text-3xl font-bold mt-2">{filteredItems.length}</p>
              </div>
              <UsersIcon className="w-12 h-12 text-blue-200" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl p-6 text-white shadow-xl transform hover:scale-105 transition-transform">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-100 text-sm font-medium">Alertas Ativos</p>
                <p className="text-3xl font-bold mt-2">{alertStats.active}</p>
                <p className="text-red-100 text-xs mt-1">{alertStats.percentage}% do total</p>
              </div>
              <ExclamationTriangleIcon className="w-12 h-12 text-red-200" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white shadow-xl transform hover:scale-105 transition-transform">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium">Status Normal</p>
                <p className="text-3xl font-bold mt-2">{alertStats.safe}</p>
                <p className="text-green-100 text-xs mt-1">Dentro dos limites</p>
              </div>
              <CheckCircleIcon className="w-12 h-12 text-green-200" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white shadow-xl transform hover:scale-105 transition-transform">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm font-medium">Distância Média</p>
                <p className="text-3xl font-bold mt-2">
                  {data.analytics?.avg_distance_moved?.toFixed(0) || 0}m
                </p>
                <p className="text-purple-100 text-xs mt-1">Movimentação</p>
              </div>
              <ArrowTrendingUpIcon className="w-12 h-12 text-purple-200" />
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Map */}
          <div className="lg:col-span-2 bg-slate-800 rounded-xl shadow-xl overflow-hidden border border-slate-700">
            <div className="bg-slate-700/50 px-6 py-4 border-b border-slate-600 flex items-center gap-2">
              <MapPinIcon className="w-5 h-5 text-blue-400" />
              <h2 className="text-lg font-semibold text-white">Mapa de Localização em Tempo Real</h2>
            </div>
            <div className="h-[500px]">
              {filteredItems.length > 0 ? (
                <MapContainer 
                // zoom={15} 
                // center={[filteredItems[0].location.lat, filteredItems[0].location.lng] as any}
                  style={{ height: '100%', width: '100%' }}
                >
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  {filteredItems.map((item, idx) => (
                    <Marker 
                      key={`${item.id}-${idx}`}
                      position={[item.location.lat, item.location.lng]}
                    >
                      <Popup>
                        <div className="text-sm">
                          <p className="font-bold">{item.name}</p>
                          <p className="text-xs text-gray-600">ID: {item.id}</p>
                          <p className="text-xs text-gray-600">Zona: {item.zone_name}</p>
                          <p className="text-xs">Distância: {item.location.distance_moved_m.toFixed(2)}m</p>
                          <p className={`text-xs font-semibold ${item.alerts.active ? 'text-red-600' : 'text-green-600'}`}>
                            {item.alerts.geofence_status}
                          </p>
                        </div>
                      </Popup>
                      {item.alerts.active && (
                        <Circle 
                          center={[item.location.lat, item.location.lng]}
                          
                          pathOptions={{ color: 'red', fillColor: 'red', fillOpacity: 0.3 }}
                        />
                      )}
                    </Marker>
                  ))}
                </MapContainer>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <p className="text-slate-400">Nenhum item para exibir no mapa</p>
                </div>
              )}
            </div>
          </div>

          {/* Status Distribution */}
          <div className="bg-slate-800 rounded-xl shadow-xl border border-slate-700">
            <div className="bg-slate-700/50 px-6 py-4 border-b border-slate-600">
              <h2 className="text-lg font-semibold text-white">Distribuição de Status</h2>
            </div>
            <div className="p-6">
              <div ref={pieChartRef} style={{ width: '100%', height: '300px' }}></div>
              <div className="mt-6 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <span className="text-slate-300 text-sm">Com Alertas</span>
                  </div>
                  <span className="text-white font-semibold">{alertStats.active}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    <span className="text-slate-300 text-sm">Seguros</span>
                  </div>
                  <span className="text-white font-semibold">{alertStats.safe}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Alerts by Zone */}
          <div className="bg-slate-800 rounded-xl shadow-xl border border-slate-700">
            <div className="bg-slate-700/50 px-6 py-4 border-b border-slate-600 flex items-center gap-2">
              <ExclamationTriangleIcon className="w-5 h-5 text-red-400" />
              <h2 className="text-lg font-semibold text-white">Alertas por Zona</h2>
            </div>
            <div className="p-6">
              <div ref={barChartRef} style={{ width: '100%', height: '300px' }}></div>
            </div>
          </div>

          {/* Zone Summary */}
          <div className="bg-slate-800 rounded-xl shadow-xl border border-slate-700">
            <div className="bg-slate-700/50 px-6 py-4 border-b border-slate-600">
              <h2 className="text-lg font-semibold text-white">Resumo por Zona</h2>
            </div>
            <div className="p-6 space-y-4">
              {data.site?.zones?.map((zone, idx) => {
                const zoneAlerts = zone.items.filter(i => i.alerts?.active).length;
                const alertPercent = zone.items.length > 0 ? (zoneAlerts / zone.items.length) * 100 : 0;
                
                return (
                  <div key={idx} className="bg-slate-700/30 rounded-lg p-4 hover:bg-slate-700/50 transition-colors">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-white font-semibold">{zone.zone_name}</h3>
                      <span className="text-slate-400 text-sm">{zone.zone_code}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-slate-300">Total: {zone.items.length}</span>
                      <span className={`font-semibold ${zoneAlerts > 0 ? 'text-red-400' : 'text-green-400'}`}>
                        Alertas: {zoneAlerts}
                      </span>
                    </div>
                    <div className="w-full bg-slate-600 rounded-full h-2">
                      <div 
                        className="bg-red-500 h-2 rounded-full transition-all"
                        style={{width: `${alertPercent}%`}}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Recent Activity Table */}
        <div className="bg-slate-800 rounded-xl shadow-xl border border-slate-700">
          <div className="bg-slate-700/50 px-6 py-4 border-b border-slate-600 flex items-center gap-2">
            <ClockIcon className="w-5 h-5 text-blue-400" />
            <h2 className="text-lg font-semibold text-white">Atividade Recente</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-700/30">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Nome</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Zona</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Distância</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Geofence</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {filteredItems.slice(0, 10).map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-700/20 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">{item.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white font-medium">{item.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">{item.zone_name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">{item.location.distance_moved_m.toFixed(2)}m</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        item.alerts?.active ? 'bg-red-900/50 text-red-300' : 'bg-green-900/50 text-green-300'
                      }`}>
                        {item.alerts?.active ? 'Alerta' : 'Normal'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
                      {item.alerts?.geofence_status?.replace('_', ' ') || 'N/A'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LocationDashboard;