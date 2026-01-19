// src/components/Infraestruct/componentMN0400_134.tsx

import { useState, useEffect, useRef } from 'react';
import * as echarts from 'echarts';
import { useCompany } from '../../hooks/useCompany';

// ============================================
// TYPES & INTERFACES
// ============================================

interface CurrentTemperature {
  person_code: string;
  person_name: string;
  category: string;
  ambient_temp: number;
  thermal_condition: string;
  risk_level: string;
  is_critical_temp: boolean;
  is_comfortable: boolean;
  site_code: string;
  area_code: string;
  zone_code: string;
  work_shift: string;
  reading_date: string;
  reading_hour: number;
  last_reading: string;
  has_gps: boolean;
}

interface TemperatureTrend {
  person_code: string;
  person_name: string;
  time_bucket: string;
  date: string;
  hour: number;
  avg_temp: number;
  min_temp: number;
  max_temp: number;
  temp_variance: number;
  comfort_status: string;
  had_critical_temp: boolean;
  high_variation: boolean;
  zone: string;
}

interface ExposureEvent {
  person_code: string;
  person_name: string;
  person_category: string;
  exposure_type: string;
  severity: string;
  response_priority: string;
  ambient_temp: number;
  event_time: string;
  event_date: string;
  event_hour: number;
  site: string;
  area: string;
  zone: string;
  work_shift: string;
}

interface DistanceHourly {
  Person_Code: string;
  Person_Name: string;
  category_code: string;
  category_name: string;
  tracking_date: string;
  hour_of_day: number;
  day_name: string;
  distance_km: number;
  movement_count: number;
}

interface ApiResponse<T> {
  data: T[];
  pagination: {
    current_page: number;
    per_page: number;
    total_records: number;
    total_pages: number;
  };
}

interface Filters {
  start_date?: string;
  end_date?: string;
  person_code?: string;
  thermal_condition?: string;
  risk_level?: string;
  exposure_type?: string;
  severity?: string;
  zone?: string;
  work_shift?: string;
}

// ============================================
// COMPONENTE PRINCIPAL
// ============================================

export default function TemperatureAnalytics() {
  const { companyId } = useCompany();

  // States
  const [activeTab, setActiveTab] = useState<'overview' | 'trends' | 'exposure' | 'distance'>('overview');
  //@ts-ignore
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<Filters>({
    start_date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end_date: new Date().toISOString().split('T')[0],
  });

  // Loading states individuais
  const [loadingStates, setLoadingStates] = useState({
    current: false,
    trends: false,
    exposure: false,
    distance: false,
  });

  // Data states
  const [currentTemperatures, setCurrentTemperatures] = useState<ApiResponse<CurrentTemperature> | null>(null);
  const [temperatureTrends, setTemperatureTrends] = useState<ApiResponse<TemperatureTrend> | null>(null);
  const [exposureEvents, setExposureEvents] = useState<ApiResponse<ExposureEvent> | null>(null);
  const [distanceData, setDistanceData] = useState<ApiResponse<DistanceHourly> | null>(null);

  // Chart refs
  const overviewChartRef = useRef<HTMLDivElement>(null);
  const riskDistributionRef = useRef<HTMLDivElement>(null);
  const temperatureTrendRef = useRef<HTMLDivElement>(null);
  const exposureChartRef = useRef<HTMLDivElement>(null);
  const distanceChartRef = useRef<HTMLDivElement>(null);
  const heatmapRef = useRef<HTMLDivElement>(null);

  // Chart instance refs
  const overviewChartInstanceRef = useRef<echarts.ECharts | null>(null);
  const riskChartInstanceRef = useRef<echarts.ECharts | null>(null);
  const trendChartInstanceRef = useRef<echarts.ECharts | null>(null);
  const exposureChartInstanceRef = useRef<echarts.ECharts | null>(null);
  const distanceChartInstanceRef = useRef<echarts.ECharts | null>(null);
  const heatmapChartInstanceRef = useRef<echarts.ECharts | null>(null);

  // ============================================
  // FETCH DATA COM TIMEOUT
  // ============================================

  const fetchWithTimeout = async (url: string, timeout = 30000) => {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, {
        signal: controller.signal,
      });
      clearTimeout(id);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      clearTimeout(id);
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('Requisição demorou muito tempo (timeout)');
      }
      throw error;
    }
  };

  const fetchCurrentTemperatures = async () => {
    setLoadingStates(prev => ({ ...prev, current: true }));
    try {
      const queryParams = new URLSearchParams({
        page: '1',
        limit: '1000',
        ...(filters.start_date && { reading_date: filters.start_date }),
        ...(filters.thermal_condition && { thermal_condition: filters.thermal_condition }),
        ...(filters.risk_level && { risk_level: filters.risk_level }),
        ...(filters.zone && { zone_code: filters.zone }),
        ...(filters.work_shift && { work_shift: filters.work_shift }),
      });

      console.log('📊 Fetching current temperatures...');
      const data = await fetchWithTimeout(
        `/api/dashboard/temperature/${companyId}/temperature/current?${queryParams}`
      );
      console.log('✅ Current temperatures loaded:', data.data?.length || 0, 'records');
      setCurrentTemperatures(data);
    } catch (error) {
      console.error('❌ Error fetching current temperatures:', error);
      setError(error instanceof Error ? error.message : 'Erro ao carregar temperaturas');
    } finally {
      setLoadingStates(prev => ({ ...prev, current: false }));
    }
  };

  const fetchTemperatureTrends = async () => {
    setLoadingStates(prev => ({ ...prev, trends: true }));
    try {
      const queryParams = new URLSearchParams({
        page: '1',
        limit: '1000',
        sortBy: 'time_bucket',
        sortOrder: 'ASC',
        ...(filters.start_date && { start_date: filters.start_date }),
        ...(filters.end_date && { end_date: filters.end_date }),
        ...(filters.person_code && { person_code: filters.person_code }),
        ...(filters.zone && { zone: filters.zone }),
      });

      console.log('📊 Fetching temperature trends...');
      const data = await fetchWithTimeout(
        `/api/dashboard/temperature/${companyId}/temperature/trends?${queryParams}`
      );
      console.log('✅ Temperature trends loaded:', data.data?.length || 0, 'records');
      setTemperatureTrends(data);
    } catch (error) {
      console.error('❌ Error fetching temperature trends:', error);
      // Não mostra erro se já tiver dados de outras abas
    } finally {
      setLoadingStates(prev => ({ ...prev, trends: false }));
    }
  };

  const fetchExposureEvents = async () => {
    setLoadingStates(prev => ({ ...prev, exposure: true }));
    try {
      const queryParams = new URLSearchParams({
        page: '1',
        limit: '100',
        ...(filters.start_date && { start_date: filters.start_date }),
        ...(filters.end_date && { end_date: filters.end_date }),
        ...(filters.exposure_type && { exposure_type: filters.exposure_type }),
        ...(filters.severity && { severity: filters.severity }),
        ...(filters.zone && { zone: filters.zone }),
      });

      console.log('📊 Fetching exposure events...');
      const data = await fetchWithTimeout(
        `/api/dashboard/temperature/${companyId}/temperature/exposure-events?${queryParams}`
      );
      console.log('✅ Exposure events loaded:', data.data?.length || 0, 'records');
      setExposureEvents(data);
    } catch (error) {
      console.error('❌ Error fetching exposure events:', error);
    } finally {
      setLoadingStates(prev => ({ ...prev, exposure: false }));
    }
  };

  const fetchDistanceData = async () => {
    setLoadingStates(prev => ({ ...prev, distance: true }));
    try {
      const queryParams = new URLSearchParams({
        page: '1',
        limit: '1000',
        ...(filters.start_date && { start_date: filters.start_date }),
        ...(filters.end_date && { end_date: filters.end_date }),
      });

      console.log('📊 Fetching distance data...');
      const data = await fetchWithTimeout(
        `/api/dashboard/temperature/${companyId}/distance/hourly?${queryParams}`
      );
      console.log('✅ Distance data loaded:', data.data?.length || 0, 'records');
      setDistanceData(data);
    } catch (error) {
      console.error('❌ Error fetching distance data:', error);
    } finally {
      setLoadingStates(prev => ({ ...prev, distance: false }));
    }
  };

  const fetchAllData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('🔄 Starting data fetch for all endpoints...');
      await Promise.allSettled([
        fetchCurrentTemperatures(),
        fetchTemperatureTrends(),
        fetchExposureEvents(),
        fetchDistanceData(),
      ]);
      console.log('✅ All data fetch completed');
    } catch (error) {
      console.error('❌ Error in fetchAllData:', error);
      setError('Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (companyId) {
      fetchAllData();
    }
  }, [companyId, filters]);

  // ============================================
  // CHART: OVERVIEW - TEMPERATURA POR CONDIÇÃO TÉRMICA
  // ============================================

  useEffect(() => {
    if (!currentTemperatures?.data.length || !overviewChartRef.current) {
      console.log('⏸️ Overview chart: waiting for data or ref');
      return;
    }

    console.log('📊 Rendering overview chart with', currentTemperatures.data.length, 'records');

    if (overviewChartInstanceRef.current) {
      overviewChartInstanceRef.current.dispose();
    }

    const chart = echarts.init(overviewChartRef.current);
    overviewChartInstanceRef.current = chart;

    const thermalConditions = currentTemperatures.data.reduce((acc, item) => {
      acc[item.thermal_condition] = (acc[item.thermal_condition] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const option: echarts.EChartsOption = {
      title: {
        text: 'Distribuição por Condição Térmica',
        left: 'center',
        textStyle: { fontSize: 16, fontWeight: 'bold' },
      },
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
          type: 'pie',
          radius: '60%',
          data: Object.entries(thermalConditions).map(([name, value]) => ({
            name,
            value,
          })),
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

    chart.setOption(option);
    console.log('✅ Overview chart rendered successfully');

    const handleResize = () => chart.resize();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.dispose();
      overviewChartInstanceRef.current = null;
    };
  }, [currentTemperatures]);

  // ============================================
  // CHART: DISTRIBUIÇÃO DE RISCO
  // ============================================

  useEffect(() => {
    if (!currentTemperatures?.data.length || !riskDistributionRef.current) {
      console.log('⏸️ Risk chart: waiting for data or ref');
      return;
    }

    console.log('📊 Rendering risk distribution chart');

    if (riskChartInstanceRef.current) {
      riskChartInstanceRef.current.dispose();
    }

    const chart = echarts.init(riskDistributionRef.current);
    riskChartInstanceRef.current = chart;

    const riskLevels = currentTemperatures.data.reduce((acc, item) => {
      acc[item.risk_level] = (acc[item.risk_level] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const option: echarts.EChartsOption = {
      title: {
        text: 'Distribuição de Nível de Risco',
        left: 'center',
        textStyle: { fontSize: 16, fontWeight: 'bold' },
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' },
      },
      xAxis: {
        type: 'category',
        data: Object.keys(riskLevels),
      },
      yAxis: {
        type: 'value',
        name: 'Quantidade',
      },
      series: [
        {
          type: 'bar',
          data: Object.entries(riskLevels).map(([name, value]) => ({
            value,
            itemStyle: {
              color:
                name === 'ALTO'
                  ? '#ef4444'
                  : name === 'MÉDIO'
                  ? '#f59e0b'
                  : '#10b981',
            },
          })),
          barWidth: '60%',
        },
      ],
    };

    chart.setOption(option);
    console.log('✅ Risk distribution chart rendered successfully');

    const handleResize = () => chart.resize();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.dispose();
      riskChartInstanceRef.current = null;
    };
  }, [currentTemperatures]);

  // ============================================
  // CHART: TENDÊNCIA DE TEMPERATURA AO LONGO DO TEMPO
  // ============================================

  useEffect(() => {
    if (!temperatureTrends?.data.length || !temperatureTrendRef.current) {
      console.log('⏸️ Trend chart: waiting for data or ref');
      return;
    }

    console.log('📊 Rendering temperature trend chart with', temperatureTrends.data.length, 'records');

    if (trendChartInstanceRef.current) {
      trendChartInstanceRef.current.dispose();
    }

    const chart = echarts.init(temperatureTrendRef.current);
    trendChartInstanceRef.current = chart;

    const sortedData = [...temperatureTrends.data].sort(
      (a, b) => new Date(a.time_bucket).getTime() - new Date(b.time_bucket).getTime()
    );

    const option: echarts.EChartsOption = {
      title: {
        text: 'Tendência de Temperatura',
        left: 'center',
        textStyle: { fontSize: 16, fontWeight: 'bold' },
      },
      tooltip: {
        trigger: 'axis',
      },
      legend: {
        data: ['Média', 'Mínima', 'Máxima'],
        top: 30,
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true,
      },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: sortedData.map((item) => {
          const date = new Date(item.time_bucket);
          return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1)
            .toString()
            .padStart(2, '0')} ${item.hour}h`;
        }),
      },
      yAxis: {
        type: 'value',
        name: 'Temperatura (°C)',
      },
      series: [
        {
          name: 'Média',
          type: 'line',
          data: sortedData.map((item) => item.avg_temp),
          smooth: true,
          itemStyle: { color: '#3b82f6' },
        },
        {
          name: 'Mínima',
          type: 'line',
          data: sortedData.map((item) => item.min_temp),
          smooth: true,
          itemStyle: { color: '#10b981' },
        },
        {
          name: 'Máxima',
          type: 'line',
          data: sortedData.map((item) => item.max_temp),
          smooth: true,
          itemStyle: { color: '#ef4444' },
        },
      ],
    };

    chart.setOption(option);
    console.log('✅ Temperature trend chart rendered successfully');

    const handleResize = () => chart.resize();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.dispose();
      trendChartInstanceRef.current = null;
    };
  }, [temperatureTrends]);

  // ============================================
  // CHART: EVENTOS DE EXPOSIÇÃO POR SEVERIDADE
  // ============================================

  useEffect(() => {
    if (!exposureEvents?.data.length || !exposureChartRef.current) {
      console.log('⏸️ Exposure chart: waiting for data or ref');
      return;
    }

    console.log('📊 Rendering exposure events chart with', exposureEvents.data.length, 'records');

    if (exposureChartInstanceRef.current) {
      exposureChartInstanceRef.current.dispose();
    }

    const chart = echarts.init(exposureChartRef.current);
    exposureChartInstanceRef.current = chart;

    const severityCounts = exposureEvents.data.reduce((acc, item) => {
      acc[item.severity] = (acc[item.severity] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const option: echarts.EChartsOption = {
      title: {
        text: 'Eventos de Exposição por Severidade',
        left: 'center',
        textStyle: { fontSize: 16, fontWeight: 'bold' },
      },
      tooltip: {
        trigger: 'item',
        formatter: '{b}: {c} ({d}%)',
      },
      legend: {
        orient: 'horizontal',
        bottom: 10,
      },
      series: [
        {
          type: 'pie',
          radius: ['40%', '70%'],
          avoidLabelOverlap: false,
          itemStyle: {
            borderRadius: 10,
            borderColor: '#fff',
            borderWidth: 2,
          },
          label: {
            show: false,
            position: 'center',
          },
          emphasis: {
            label: {
              show: true,
              fontSize: 20,
              fontWeight: 'bold',
            },
          },
          labelLine: {
            show: false,
          },
          data: Object.entries(severityCounts).map(([name, value]) => ({
            name,
            value,
            itemStyle: {
              color:
                name === 'CRÍTICA'
                  ? '#dc2626'
                  : name === 'ALTA'
                  ? '#f59e0b'
                  : name === 'MÉDIA'
                  ? '#fbbf24'
                  : '#10b981',
            },
          })),
        },
      ],
    };

    chart.setOption(option);
    console.log('✅ Exposure events chart rendered successfully');

    const handleResize = () => chart.resize();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.dispose();
      exposureChartInstanceRef.current = null;
    };
  }, [exposureEvents]);

  // ============================================
  // CHART: DISTÂNCIA POR HORA DO DIA
  // ============================================

  useEffect(() => {
    if (!distanceData?.data.length || !distanceChartRef.current) {
      console.log('⏸️ Distance chart: waiting for data or ref');
      return;
    }

    console.log('📊 Rendering distance chart with', distanceData.data.length, 'records');

    if (distanceChartInstanceRef.current) {
      distanceChartInstanceRef.current.dispose();
    }

    const chart = echarts.init(distanceChartRef.current);
    distanceChartInstanceRef.current = chart;

    const hourlyDistance = distanceData.data.reduce((acc, item) => {
      const hour = item.hour_of_day;
      if (!acc[hour]) {
        acc[hour] = { total: 0, count: 0 };
      }
      acc[hour].total += item.distance_km;
      acc[hour].count += 1;
      return acc;
    }, {} as Record<number, { total: number; count: number }>);

    const hours = Array.from({ length: 24 }, (_, i) => i);
    const avgDistances = hours.map((hour) => {
      const data = hourlyDistance[hour];
      return data ? data.total / data.count : 0;
    });

    const option: echarts.EChartsOption = {
      title: {
        text: 'Distância Média Percorrida por Hora',
        left: 'center',
        textStyle: { fontSize: 16, fontWeight: 'bold' },
      },
      tooltip: {
        trigger: 'axis',
        formatter: (params: any) => {
          const value = params[0].value.toFixed(2);
          return `${params[0].name}: ${value} km`;
        },
      },
      xAxis: {
        type: 'category',
        data: hours.map((h) => `${h}h`),
        name: 'Hora do Dia',
      },
      yAxis: {
        type: 'value',
        name: 'Distância (km)',
      },
      series: [
        {
          type: 'bar',
          data: avgDistances,
          itemStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: '#3b82f6' },
              { offset: 1, color: '#1d4ed8' },
            ]),
          },
        },
      ],
    };

    chart.setOption(option);
    console.log('✅ Distance chart rendered successfully');

    const handleResize = () => chart.resize();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.dispose();
      distanceChartInstanceRef.current = null;
    };
  }, [distanceData]);

  // ============================================
  // CHART: HEATMAP DE TEMPERATURA POR HORA E DIA
  // ============================================

  useEffect(() => {
    if (!temperatureTrends?.data.length || !heatmapRef.current) {
      console.log('⏸️ Heatmap: waiting for data or ref');
      return;
    }

    console.log('📊 Rendering heatmap with', temperatureTrends.data.length, 'records');

    if (heatmapChartInstanceRef.current) {
      heatmapChartInstanceRef.current.dispose();
    }

    const chart = echarts.init(heatmapRef.current);
    heatmapChartInstanceRef.current = chart;

    const hours = Array.from({ length: 24 }, (_, i) => i);
    const dates = [...new Set(temperatureTrends.data.map((item) => item.date))].sort();

    const heatmapData = temperatureTrends.data.map((item) => {
      const dateIndex = dates.indexOf(item.date);
      const hourIndex = item.hour;
      return [hourIndex, dateIndex, item.avg_temp];
    });

    const option: echarts.EChartsOption = {
      title: {
        text: 'Mapa de Calor: Temperatura por Hora e Data',
        left: 'center',
        textStyle: { fontSize: 16, fontWeight: 'bold' },
      },
      tooltip: {
        position: 'top',
        formatter: (params: any) => {
          const hour = params.data[0];
          const dateIndex = params.data[1];
          const temp = params.data[2];
          return `${dates[dateIndex]} ${hour}h<br/>Temperatura: ${temp.toFixed(1)}°C`;
        },
      },
      grid: {
        height: '70%',
        top: '15%',
      },
      xAxis: {
        type: 'category',
        data: hours.map((h) => `${h}h`),
        splitArea: {
          show: true,
        },
      },
      yAxis: {
        type: 'category',
        data: dates.map((d) => {
          const date = new Date(d);
          return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1)
            .toString()
            .padStart(2, '0')}`;
        }),
        splitArea: {
          show: true,
        },
      },
      visualMap: {
        min: Math.min(...heatmapData.map((d) => d[2])),
        max: Math.max(...heatmapData.map((d) => d[2])),
        calculable: true,
        orient: 'horizontal',
        left: 'center',
        bottom: '0%',
        inRange: {
          color: ['#313695', '#4575b4', '#74add1', '#abd9e9', '#e0f3f8', '#ffffbf', '#fee090', '#fdae61', '#f46d43', '#d73027', '#a50026'],
        },
      },
      series: [
        {
          type: 'heatmap',
          data: heatmapData,
          label: {
            show: false,
          },
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowColor: 'rgba(0, 0, 0, 0.5)',
            },
          },
        },
      ],
    };

    chart.setOption(option);
    console.log('✅ Heatmap rendered successfully');

    const handleResize = () => chart.resize();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.dispose();
      heatmapChartInstanceRef.current = null;
    };
  }, [temperatureTrends]);

  // ============================================
  // RENDER
  // ============================================

  const anyLoading = Object.values(loadingStates).some(v => v);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Análise de Temperatura e Movimentação</h1>
        <p className="mt-2 text-gray-600">Dashboard completo de monitoramento térmico e distâncias percorridas</p>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-red-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"/>
            </svg>
            <p className="text-red-800 font-medium">{error}</p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Filtros</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Data Início</label>
            <input
              type="date"
              value={filters.start_date || ''}
              onChange={(e) => setFilters({ ...filters, start_date: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Data Fim</label>
            <input
              type="date"
              value={filters.end_date || ''}
              onChange={(e) => setFilters({ ...filters, end_date: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Condição Térmica</label>
            <select
              value={filters.thermal_condition || ''}
              onChange={(e) => setFilters({ ...filters, thermal_condition: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Todas</option>
              <option value="CONFORTÁVEL">Confortável</option>
              <option value="QUENTE">Quente</option>
              <option value="FRIO">Frio</option>
              <option value="MUITO QUENTE">Muito Quente</option>
              <option value="MUITO FRIO">Muito Frio</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nível de Risco</label>
            <select
              value={filters.risk_level || ''}
              onChange={(e) => setFilters({ ...filters, risk_level: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Todos</option>
              <option value="BAIXO">Baixo</option>
              <option value="MÉDIO">Médio</option>
              <option value="ALTO">Alto</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Turno</label>
            <select
              value={filters.work_shift || ''}
              onChange={(e) => setFilters({ ...filters, work_shift: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Todos</option>
              <option value="MANHÃ">Manhã</option>
              <option value="TARDE">Tarde</option>
              <option value="NOITE">Noite</option>
              <option value="MADRUGADA">Madrugada</option>
            </select>
          </div>
        </div>
      </div>

      {/* Loading Indicator */}
      {anyLoading && (
        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6">
          <div className="flex items-center">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600 mr-3"></div>
            <p className="text-blue-800 font-medium">
              Carregando dados... 
              {loadingStates.current && ' Temperaturas'}
              {loadingStates.trends && ' Tendências'}
              {loadingStates.exposure && ' Exposições'}
              {loadingStates.distance && ' Distâncias'}
            </p>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      {currentTemperatures && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total de Pessoas</p>
                <p className="text-3xl font-bold text-gray-900">{currentTemperatures.data.length}</p>
              </div>
              <div className="bg-blue-100 rounded-full p-3">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Temperatura Crítica</p>
                <p className="text-3xl font-bold text-red-600">
                  {currentTemperatures.data.filter((d) => d.is_critical_temp).length}
                </p>
              </div>
              <div className="bg-red-100 rounded-full p-3">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Eventos de Exposição</p>
                <p className="text-3xl font-bold text-orange-600">{exposureEvents?.data.length || 0}</p>
              </div>
              <div className="bg-orange-100 rounded-full p-3">
                <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Distância Total (km)</p>
                <p className="text-3xl font-bold text-green-600">
                  {distanceData?.data.reduce((sum, d) => sum + d.distance_km, 0).toFixed(1) || 0}
                </p>
              </div>
              <div className="bg-green-100 rounded-full p-3">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'overview', label: 'Visão Geral' },
              { id: 'trends', label: 'Tendências' },
              { id: 'exposure', label: 'Exposição' },
              { id: 'distance', label: 'Distâncias' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      <>
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg shadow-md p-6">
                {loadingStates.current ? (
                  <div className="flex items-center justify-center h-96">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                  </div>
                ) : currentTemperatures?.data.length ? (
                  <div ref={overviewChartRef} className="w-full h-96"></div>
                ) : (
                  <div className="flex items-center justify-center h-96 text-gray-500">
                    Sem dados disponíveis
                  </div>
                )}
              </div>
              <div className="bg-white rounded-lg shadow-md p-6">
                {loadingStates.current ? (
                  <div className="flex items-center justify-center h-96">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                  </div>
                ) : currentTemperatures?.data.length ? (
                  <div ref={riskDistributionRef} className="w-full h-96"></div>
                ) : (
                  <div className="flex items-center justify-center h-96 text-gray-500">
                    Sem dados disponíveis
                  </div>
                )}
              </div>
            </div>

            {/* Tabela de Temperatura Atual */}
            {currentTemperatures?.data && currentTemperatures.data.length > 0 && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-lg font-semibold mb-4">Temperatura Atual</h2>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pessoa</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Categoria</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Temperatura</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Condição</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Risco</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Local</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Turno</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {currentTemperatures.data.slice(0, 10).map((item, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{item.person_name}</div>
                            <div className="text-sm text-gray-500">{item.person_code}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.category}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`text-sm font-semibold ${
                              item.is_critical_temp ? 'text-red-600' : 'text-gray-900'
                            }`}>
                              {item.ambient_temp.toFixed(1)}°C
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              item.thermal_condition === 'CONFORTÁVEL'
                                ? 'bg-green-100 text-green-800'
                                : item.thermal_condition.includes('QUENTE')
                                ? 'bg-red-100 text-red-800'
                                : 'bg-blue-100 text-blue-800'
                            }`}>
                              {item.thermal_condition}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              item.risk_level === 'ALTO'
                                ? 'bg-red-100 text-red-800'
                                : item.risk_level === 'MÉDIO'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-green-100 text-green-800'
                            }`}>
                              {item.risk_level}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.zone_code}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.work_shift}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Trends Tab */}
        {activeTab === 'trends' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              {loadingStates.trends ? (
                <div className="flex items-center justify-center h-96">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
              ) : temperatureTrends?.data.length ? (
                <div ref={temperatureTrendRef} className="w-full h-96"></div>
              ) : (
                <div className="flex items-center justify-center h-96 text-gray-500">
                  Sem dados de tendências disponíveis
                </div>
              )}
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              {loadingStates.trends ? (
                <div className="flex items-center justify-center h-[500px]">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
              ) : temperatureTrends?.data.length ? (
                <div ref={heatmapRef} className="w-full h-[500px]"></div>
              ) : (
                <div className="flex items-center justify-center h-[500px] text-gray-500">
                  Sem dados para o mapa de calor
                </div>
              )}
            </div>
          </div>
        )}

        {/* Exposure Tab */}
        {activeTab === 'exposure' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              {loadingStates.exposure ? (
                <div className="flex items-center justify-center h-96">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
              ) : exposureEvents?.data.length ? (
                <div ref={exposureChartRef} className="w-full h-96"></div>
              ) : (
                <div className="flex items-center justify-center h-96 text-gray-500">
                  Sem eventos de exposição
                </div>
              )}
            </div>

            {exposureEvents?.data && exposureEvents.data.length > 0 && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-lg font-semibold mb-4">Eventos de Exposição</h2>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pessoa</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Severidade</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Prioridade</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Temperatura</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data/Hora</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Local</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {exposureEvents.data.slice(0, 10).map((item, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{item.person_name}</div>
                            <div className="text-sm text-gray-500">{item.person_code}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.exposure_type}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              item.severity === 'CRÍTICA'
                                ? 'bg-red-100 text-red-800'
                                : item.severity === 'ALTA'
                                ? 'bg-orange-100 text-orange-800'
                                : item.severity === 'MÉDIA'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-green-100 text-green-800'
                            }`}>
                              {item.severity}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.response_priority}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                            {item.ambient_temp.toFixed(1)}°C
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {new Date(item.event_time).toLocaleString('pt-BR')}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.zone}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Distance Tab */}
        {activeTab === 'distance' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              {loadingStates.distance ? (
                <div className="flex items-center justify-center h-96">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
              ) : distanceData?.data.length ? (
                <div ref={distanceChartRef} className="w-full h-96"></div>
              ) : (
                <div className="flex items-center justify-center h-96 text-gray-500">
                  Sem dados de distância
                </div>
              )}
            </div>

            {distanceData?.data && distanceData.data.length > 0 && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-lg font-semibold mb-4">Distâncias Percorridas</h2>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pessoa</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Categoria</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hora</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dia</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Distância (km)</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Movimentos</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {distanceData.data.slice(0, 10).map((item, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{item.Person_Name}</div>
                            <div className="text-sm text-gray-500">{item.Person_Code}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.category_name}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {new Date(item.tracking_date).toLocaleDateString('pt-BR')}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.hour_of_day}h</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.day_name}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-blue-600">
                            {item.distance_km.toFixed(2)} km
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.movement_count}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </>
    </div>
  );
}