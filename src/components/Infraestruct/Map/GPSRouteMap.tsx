// src/components/GPSRouteMap.tsx
import { useEffect, useRef, useState } from 'react';
import * as echarts from 'echarts';
import type { EChartsOption } from 'echarts';
import { useTranslation } from 'react-i18next';
import {
  MapPinIcon,
  ArrowPathIcon,
  MagnifyingGlassIcon,
  CalendarIcon,
  FunnelIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';

interface GPSPoint {
  dev_eui: string;
  timestamp: string;
  gps_latitude: number;
  gps_longitude: number;
  gps_accuracy: number;
}

interface GPSRouteMapProps {
  devEui?: string;
}

const GPSRouteMap: React.FC<GPSRouteMapProps> = ({ devEui: initialDevEui }) => {
  const { t } = useTranslation();
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<echarts.ECharts | null>(null);

  const [data, setData] = useState<GPSPoint[]>([]);
  const [loading, setLoading] = useState(false);
  const [devEui, setDevEui] = useState(initialDevEui || '20635F0241000AB7');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [maxAccuracy, setMaxAccuracy] = useState('');
  const [limit, setLimit] = useState(200);
  const [showFilters, setShowFilters] = useState(false);

  const fetchGPSRoute = async () => {
    if (!devEui) {
      alert(t('gpsRoute.alerts.devEuiRequired'));
      return;
    }

    setLoading(true);
    try {
      const params = new URLSearchParams({
        dev_eui: devEui,
        limit: limit.toString(),
        sortBy: 'timestamp',
        sortOrder: 'DESC',
        valid_gps_only: 'true',
      });

      if (startDate) params.append('start_date', startDate);
      if (endDate) params.append('end_date', endDate);
      if (maxAccuracy) params.append('max_accuracy', maxAccuracy);

      const response = await fetch(
        `http://localhost:3306/api/dashboard/devices/gps-route/raw?${params}`
      );
      const result = await response.json();

      if (result.data && result.data.length > 0) {
        setData(result.data.reverse()); // Inverte para ordem cronológica
      } else {
        setData([]);
        alert(t('gpsRoute.alerts.noData'));
      }
    } catch (error) {
      console.error('Error fetching GPS route:', error);
      alert(t('gpsRoute.alerts.error'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialDevEui) {
      fetchGPSRoute();
    }
  }, []);

  useEffect(() => {
    if (!chartRef.current || data.length === 0) return;

    // Inicializar ou obter instância do chart
    if (!chartInstance.current) {
      chartInstance.current = echarts.init(chartRef.current);
    }

    const chart = chartInstance.current;

    // Processar dados
    const routeData = data.map((point) => [point.gps_longitude, point.gps_latitude]);
    
    // Calcular centro e bounds do mapa
    const lats = data.map(p => p.gps_latitude);
    const lons = data.map(p => p.gps_longitude);
    // const centerLat = lats.reduce((a, b) => a + b, 0) / lats.length;
    // const centerLon = lons.reduce((a, b) => a + b, 0) / lons.length;

    // Calcular zoom baseado na dispersão dos pontos
    const latRange = Math.max(...lats) - Math.min(...lats);
    const lonRange = Math.max(...lons) - Math.min(...lons);
    // const maxRange = Math.max(latRange, lonRange);
    // const zoom = maxRange > 1 ? 8 : maxRange > 0.1 ? 10 : 12;

    // Preparar dados para o mapa
    const scatterData = data.map((point, index) => ({
      name: `Point ${index + 1}`,
      value: [point.gps_longitude, point.gps_latitude],
      timestamp: new Date(point.timestamp).toLocaleString('pt-BR'),
      accuracy: point.gps_accuracy,
      isFirst: index === 0,
      isLast: index === data.length - 1,
    }));

    // ✅ USAR CANVAS AO INVÉS DE GEO (não precisa do mapa mundial)
    const option: EChartsOption = {
      title: {
        text: t('gpsRoute.chart.title'),
        subtext: `${data.length} ${t('gpsRoute.chart.points')} | ${devEui}`,
        left: 'center',
        textStyle: {
          fontSize: 18,
          fontWeight: 'bold',
        },
        subtextStyle: {
          fontSize: 12,
          color: '#666',
        },
      },
      tooltip: {
        trigger: 'item',
        formatter: (params: any) => {
          const data = params.data;
          return `
            <div style="padding: 8px;">
              <strong>${data.isFirst ? '🟢 ' + t('gpsRoute.chart.start') : data.isLast ? '🔴 ' + t('gpsRoute.chart.end') : '📍 ' + data.name}</strong><br/>
              <strong>${t('gpsRoute.chart.time')}:</strong> ${data.timestamp}<br/>
              <strong>${t('gpsRoute.chart.coordinates')}:</strong><br/>
              &nbsp;&nbsp;Lat: ${data.value[1].toFixed(6)}<br/>
              &nbsp;&nbsp;Lon: ${data.value[0].toFixed(6)}<br/>
              <strong>${t('gpsRoute.chart.accuracy')}:</strong> ${data.accuracy}m
            </div>
          `;
        },
      },
      grid: {
        left: '5%',
        right: '5%',
        top: '15%',
        bottom: '10%',
        containLabel: true,
      },
      xAxis: {
        type: 'value',
        name: 'Longitude',
        nameLocation: 'center',
        nameGap: 30,
        min: Math.min(...lons) - lonRange * 0.1,
        max: Math.max(...lons) + lonRange * 0.1,
        axisLabel: {
          formatter: (value: number) => value.toFixed(4),
        },
      },
      yAxis: {
        type: 'value',
        name: 'Latitude',
        nameLocation: 'center',
        nameGap: 50,
        min: Math.min(...lats) - latRange * 0.1,
        max: Math.max(...lats) + latRange * 0.1,
        axisLabel: {
          formatter: (value: number) => value.toFixed(4),
        },
      },
      series: [
        // Linha da rota
        {
          name: t('gpsRoute.chart.route'),
          type: 'line',
          data: routeData,
          lineStyle: {
            color: '#3b82f6',
            width: 2,
          },
          symbol: 'none',
          zlevel: 1,
        },
        // Pontos GPS
        {
          name: t('gpsRoute.chart.points'),
          type: 'scatter',
          data: scatterData,
          symbolSize: (_, params: any) => {
            const data = params.data;
            if (data.isFirst || data.isLast) return 20;
            return 12;
          },
          itemStyle: {
            color: (params: any) => {
              const data = params.data;
              if (data.isFirst) return '#10b981'; // Verde - início
              if (data.isLast) return '#ef4444'; // Vermelho - fim
              return '#3b82f6'; // Azul - pontos intermediários
            },
            borderColor: '#fff',
            borderWidth: 2,
          },
          emphasis: {
            scale: 1.5,
            itemStyle: {
              shadowBlur: 10,
              shadowColor: 'rgba(0, 0, 0, 0.3)',
            },
          },
          zlevel: 2,
        },
      ],
    };

    chart.setOption(option, true);

    // Resize handler
    const handleResize = () => {
      chart.resize();
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [data, t, devEui]);

  useEffect(() => {
    return () => {
      if (chartInstance.current) {
        chartInstance.current.dispose();
        chartInstance.current = null;
      }
    };
  }, []);

  const handleClearFilters = () => {
    setStartDate('');
    setEndDate('');
    setMaxAccuracy('');
    setLimit(200);
  };

  return (
    <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-blue-600 px-6 py-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <MapPinIcon className="h-8 w-8 text-white" />
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-white">
                {t('gpsRoute.title')}
              </h2>
              <p className="text-sm text-white/80 mt-1">
                {t('gpsRoute.subtitle')}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-white/20 hover:bg-white/30 rounded-md transition-colors"
            >
              <FunnelIcon className="h-5 w-5" />
              <span className="hidden sm:inline">{t('gpsRoute.filters')}</span>
            </button>
            <button
              onClick={fetchGPSRoute}
              disabled={loading}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-white/20 hover:bg-white/30 rounded-md transition-colors disabled:opacity-50"
            >
              <ArrowPathIcon className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">{t('gpsRoute.load')}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="bg-gray-50 border-b border-gray-200 px-6 py-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <MagnifyingGlassIcon className="h-4 w-4 inline mr-1" />
                {t('gpsRoute.fields.devEui')}
              </label>
              <input
                type="text"
                value={devEui}
                onChange={(e) => setDevEui(e.target.value)}
                placeholder="20635F0241000AB7"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <CalendarIcon className="h-4 w-4 inline mr-1" />
                {t('gpsRoute.fields.startDate')}
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <CalendarIcon className="h-4 w-4 inline mr-1" />
                {t('gpsRoute.fields.endDate')}
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('gpsRoute.fields.maxAccuracy')}
              </label>
              <input
                type="number"
                value={maxAccuracy}
                onChange={(e) => setMaxAccuracy(e.target.value)}
                placeholder="50"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('gpsRoute.fields.limit')}
              </label>
              <select
                value={limit}
                onChange={(e) => setLimit(Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value={50}>50 {t('gpsRoute.fields.points')}</option>
                <option value={100}>100 {t('gpsRoute.fields.points')}</option>
                <option value={200}>200 {t('gpsRoute.fields.points')}</option>
                <option value={500}>500 {t('gpsRoute.fields.points')}</option>
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={handleClearFilters}
                className="w-full px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                <XMarkIcon className="h-4 w-4 inline mr-1" />
                {t('gpsRoute.clearFilters')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Stats */}
      {data.length > 0 && (
        <div className="bg-blue-50 border-b border-blue-200 px-6 py-3">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <p className="text-xs text-gray-600">{t('gpsRoute.stats.totalPoints')}</p>
              <p className="text-lg font-bold text-blue-600">{data.length}</p>
            </div>
            <div>
              <p className="text-xs text-gray-600">{t('gpsRoute.stats.avgAccuracy')}</p>
              <p className="text-lg font-bold text-blue-600">
                {(data.reduce((sum, p) => sum + p.gps_accuracy, 0) / data.length).toFixed(1)}m
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-600">{t('gpsRoute.stats.firstPoint')}</p>
              <p className="text-xs font-medium text-gray-900">
                {new Date(data[0].timestamp).toLocaleString('pt-BR')}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-600">{t('gpsRoute.stats.lastPoint')}</p>
              <p className="text-xs font-medium text-gray-900">
                {new Date(data[data.length - 1].timestamp).toLocaleString('pt-BR')}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Chart */}
      <div className="p-6">
        {loading ? (
          <div className="flex items-center justify-center h-[600px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">{t('gpsRoute.loading')}</p>
            </div>
          </div>
        ) : data.length === 0 ? (
          <div className="flex items-center justify-center h-[600px]">
            <div className="text-center">
              <MapPinIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">{t('gpsRoute.noData')}</p>
              <button
                onClick={fetchGPSRoute}
                className="mt-4 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
              >
                {t('gpsRoute.loadRoute')}
              </button>
            </div>
          </div>
        ) : (
          <div ref={chartRef} style={{ width: '100%', height: '600px' }} />
        )}
      </div>

      {/* Legend */}
      {data.length > 0 && (
        <div className="bg-gray-50 border-t border-gray-200 px-6 py-4">
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-green-500 border-2 border-white"></div>
              <span className="text-gray-700">{t('gpsRoute.legend.start')}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-blue-500 border-2 border-white"></div>
              <span className="text-gray-700">{t('gpsRoute.legend.intermediate')}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-red-500 border-2 border-white"></div>
              <span className="text-gray-700">{t('gpsRoute.legend.end')}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-0.5 bg-blue-500"></div>
              <span className="text-gray-700">{t('gpsRoute.legend.route')}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GPSRouteMap;