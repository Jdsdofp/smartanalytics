// src/components/Infraestruct/componentMN0400_134_FIXED.tsx

import { useState, useEffect, useRef } from 'react';
import * as echarts from 'echarts';
import { useTemperatureAnalytics } from '../../hooks/useTemperatureAnalytics';

export default function TemperatureAnalytics() {
  //@ts-ignore
  const [activeTab, setActiveTab] = useState('overview');

  const {
    exposureStats,
    currentStats,
    criticalPersons,
    exposureTimeline,
    loading,
    error,
    filters,
    setFilters,
  } = useTemperatureAnalytics(activeTab);

  // Refs
  const severityChartRef = useRef<HTMLDivElement>(null);
  const hourlyChartRef = useRef<HTMLDivElement>(null);
  const riskChartRef = useRef<HTMLDivElement>(null);
  const timelineChartRef = useRef<HTMLDivElement>(null);
  
  // Estado para controlar se os gráficos já foram inicializados
  const [chartsInitialized, setChartsInitialized] = useState(false);

  // ============================================
  // DEBUG: Log dos dados
  // ============================================
  useEffect(() => {
    console.log('📊 exposureStats:', exposureStats);
    console.log('📊 currentStats:', currentStats);
    console.log('📊 criticalPersons:', criticalPersons);
    console.log('📊 exposureTimeline:', exposureTimeline);
  }, [exposureStats, currentStats, criticalPersons, exposureTimeline]);

  // ============================================
  // Verificar se todos os dados estão carregados
  // ============================================
  useEffect(() => {
    if (exposureStats && currentStats && exposureTimeline) {
      console.log('✅ Todos os dados carregados!');
      setChartsInitialized(true);
    }
  }, [exposureStats, currentStats, exposureTimeline]);

  // ============================================
  // GRÁFICO 1: Severidade (Donut)
  // ============================================
  useEffect(() => {
    if (!severityChartRef.current || !chartsInitialized) {
      return;
    }

    // Verificar se há dados válidos
    if (!exposureStats?.events_by_severity?.length) {
      console.log('⚠️ Dados de severidade insuficientes');
      return;
    }

    console.log('✅ Criando gráfico de severidade com dados:', exposureStats.events_by_severity);

    const chart = echarts.init(severityChartRef.current);

    const option: echarts.EChartsOption = {
      title: {
        text: 'Eventos por Severidade',
        left: 'center',
        textStyle: { fontSize: 16, fontWeight: 'bold' },
      },
      tooltip: {
        trigger: 'item',
        formatter: '{b}: {c} eventos ({d}%)',
      },
      legend: {
        orient: 'vertical',
        left: 'left',
        top: 'middle',
      },
      series: [
        {
          name: 'Severidade',
          type: 'pie',
          radius: ['40%', '70%'],
          avoidLabelOverlap: true,
          itemStyle: {
            borderRadius: 8,
            borderColor: '#fff',
            borderWidth: 2,
          },
          label: {
            show: true,
            formatter: '{b}\n{c}',
          },
          data: exposureStats.events_by_severity.map((item: any) => ({
            value: item.count,
            name: item.severity,
            itemStyle: {
              color:
                item.severity === 'CRITICAL'
                  ? '#ff4d4f'
                  : item.severity === 'HIGH'
                  ? '#ff7a45'
                  : item.severity === 'MEDIUM'
                  ? '#ffa940'
                  : '#52c41a',
            },
          })),
        },
      ],
    };

    chart.setOption(option);

    const handleResize = () => chart.resize();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.dispose();
    };
  }, [exposureStats, chartsInitialized]);

  // ============================================
  // GRÁFICO 2: Eventos por Hora (Bar + Line)
  // ============================================
  useEffect(() => {
    if (!hourlyChartRef.current || !chartsInitialized) {
      return;
    }

    // Verificar se há dados válidos
    if (!exposureStats?.events_by_hour?.length) {
      console.log('⚠️ Dados por hora insuficientes');
      return;
    }

    console.log('✅ Criando gráfico por hora:', exposureStats.events_by_hour);

    const chart = echarts.init(hourlyChartRef.current);

    const option: echarts.EChartsOption = {
      title: {
        text: 'Eventos e Temperatura por Hora',
        left: 'center',
        textStyle: { fontSize: 16, fontWeight: 'bold' },
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'cross' },
      },
      legend: {
        data: ['Eventos', 'Temperatura Média'],
        bottom: 0,
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '12%',
        containLabel: true,
      },
      xAxis: {
        type: 'category',
        data: exposureStats.events_by_hour.map((item: any) => `${item.hour}h`),
      },
      yAxis: [
        {
          type: 'value',
          name: 'Eventos',
          position: 'left',
        },
        {
          type: 'value',
          name: 'Temp. (°C)',
          position: 'right',
        },
      ],
      series: [
        {
          name: 'Eventos',
          type: 'bar',
          data: exposureStats.events_by_hour.map((item: any) => item.count),
          itemStyle: {
            color: '#ff7a45',
            borderRadius: [4, 4, 0, 0],
          },
        },
        {
          name: 'Temperatura Média',
          type: 'line',
          yAxisIndex: 1,
          data: exposureStats.events_by_hour.map((item: any) =>
            item.avg_temp ? parseFloat(item.avg_temp.toFixed(1)) : 0
          ),
          smooth: true,
          lineStyle: { width: 3, color: '#1890ff' },
          itemStyle: { color: '#1890ff' },
        },
      ],
    };

    chart.setOption(option);

    const handleResize = () => chart.resize();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.dispose();
    };
  }, [exposureStats, chartsInitialized]);

  // ============================================
  // GRÁFICO 3: Nível de Risco (Pie)
  // ============================================
  useEffect(() => {
    if (!riskChartRef.current || !chartsInitialized) {
      return;
    }

    // Verificar se há dados válidos
    if (!currentStats?.by_risk_level?.length) {
      console.log('⚠️ Dados de risco insuficientes');
      return;
    }

    console.log('✅ Criando gráfico de risco:', currentStats.by_risk_level);

    const chart = echarts.init(riskChartRef.current);

    const option: echarts.EChartsOption = {
      title: {
        text: 'Distribuição de Risco Atual',
        left: 'center',
        textStyle: { fontSize: 16, fontWeight: 'bold' },
      },
      tooltip: {
        trigger: 'item',
        formatter: '{b}: {c} pessoas ({d}%)',
      },
      legend: {
        orient: 'horizontal',
        bottom: 0,
      },
      series: [
        {
          name: 'Nível de Risco',
          type: 'pie',
          radius: '60%',
          center: ['50%', '45%'],
          data: currentStats.by_risk_level.map((item: any) => ({
            value: item.count,
            name: item.risk_level,
            itemStyle: {
              color:
                item.risk_level === 'CRITICAL'
                  ? '#ff4d4f'
                  : item.risk_level === 'HIGH'
                  ? '#ff7a45'
                  : item.risk_level === 'MEDIUM'
                  ? '#ffa940'
                  : '#52c41a',
            },
          })),
          label: {
            formatter: '{b}\n{c}',
          },
        },
      ],
    };

    chart.setOption(option);

    const handleResize = () => chart.resize();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.dispose();
    };
  }, [currentStats, chartsInitialized]);

  // ============================================
  // GRÁFICO 4: Timeline
  // ============================================
  useEffect(() => {
    if (!timelineChartRef.current || !chartsInitialized) {
      return;
    }

    // Verificar se há dados válidos
    if (!exposureTimeline?.length) {
      console.log('⚠️ Dados de timeline insuficientes');
      return;
    }

    console.log('✅ Criando gráfico timeline:', exposureTimeline);

    const chart = echarts.init(timelineChartRef.current);

    // Ordenar timeline
    const sortedTimeline = [...exposureTimeline].sort(
      (a: any, b: any) =>
        new Date(`${a.event_date} ${a.event_hour}:00`).getTime() -
        new Date(`${b.event_date} ${b.event_hour}:00`).getTime()
    );

    const option: echarts.EChartsOption = {
      title: {
        text: 'Timeline de Eventos',
        left: 'center',
        textStyle: { fontSize: 16, fontWeight: 'bold' },
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'cross' },
      },
      legend: {
        data: ['Total Eventos', 'Eventos Críticos', 'Temp. Média'],
        bottom: 0,
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '10%',
        containLabel: true,
      },
      xAxis: {
        type: 'category',
        data: sortedTimeline.map((item: any) => `${item.event_date.substring(5)} ${item.event_hour}h`),
        axisLabel: {
          rotate: 45,
          fontSize: 10,
        },
      },
      yAxis: [
        {
          type: 'value',
          name: 'Eventos',
        },
        {
          type: 'value',
          name: 'Temp.',
          position: 'right',
        },
      ],
      series: [
        {
          name: 'Total Eventos',
          type: 'bar',
          data: sortedTimeline.map((item: any) => item.event_count),
          itemStyle: { color: '#1890ff' },
        },
        {
          name: 'Eventos Críticos',
          type: 'bar',
          data: sortedTimeline.map((item: any) => item.critical_count),
          itemStyle: { color: '#ff4d4f' },
        },
        {
          name: 'Temp. Média',
          type: 'line',
          yAxisIndex: 1,
          data: sortedTimeline.map((item: any) => item.avg_temp?.toFixed(1)),
          smooth: true,
          itemStyle: { color: '#52c41a' },
        },
      ],
    };

    chart.setOption(option);

    const handleResize = () => chart.resize();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.dispose();
    };
  }, [exposureTimeline, chartsInitialized]);

  // ============================================
  // RENDER
  // ============================================

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h3 className="text-lg font-bold text-red-800">Erro</h3>
          <p className="text-red-700">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">📊 Análise de Temperatura</h1>
        <p className="text-gray-600">Monitoramento em tempo real</p>
      </div>

      {/* Debug Info */}
      {/* <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
        <p className="text-sm font-mono">
          <strong>Debug:</strong> exposureStats={exposureStats ? '✅' : '❌'} | 
          currentStats={currentStats ? '✅' : '❌'} | 
          criticalPersons={criticalPersons?.length || 0} | 
          timeline={exposureTimeline?.length || 0} |
          chartsInitialized={chartsInitialized ? '✅' : '❌'}
        </p>
      </div> */}

      {/* Date Filter */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="flex gap-3 items-center">
          <label className="font-semibold">📅 Período:</label>
          <input
            type="date"
            value={filters.start_date || ''}
            onChange={(e) => setFilters({ ...filters, start_date: e.target.value })}
            className="px-3 py-2 border rounded"
          />
          <span>até</span>
          <input
            type="date"
            value={filters.end_date || ''}
            onChange={(e) => setFilters({ ...filters, end_date: e.target.value })}
            className="px-3 py-2 border rounded"
          />
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <div className="bg-blue-50 p-6 rounded-lg shadow">
          <p className="text-blue-700 text-sm font-semibold">Total de Eventos</p>
          <p className="text-4xl font-bold text-blue-900">
            {exposureStats?.total_events?.toLocaleString() || 0}
          </p>
        </div>

        <div className="bg-red-50 p-6 rounded-lg shadow">
          <p className="text-red-700 text-sm font-semibold">Eventos Críticos</p>
          <p className="text-4xl font-bold text-red-900">
            {exposureStats?.critical_events?.toLocaleString() || 0}
          </p>
        </div>

        <div className="bg-purple-50 p-6 rounded-lg shadow">
          <p className="text-purple-700 text-sm font-semibold">Pessoas Afetadas</p>
          <p className="text-4xl font-bold text-purple-900">
            {exposureStats?.unique_persons?.toLocaleString() || 0}
          </p>
        </div>

        <div className="bg-orange-50 p-6 rounded-lg shadow">
          <p className="text-orange-700 text-sm font-semibold">Temp. Média</p>
          <p className="text-4xl font-bold text-orange-900">
            {exposureStats?.avg_temp?.toFixed(1) || 0}°C
          </p>
        </div>
      </div>

      {/* Current Stats */}
      {currentStats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <p className="text-gray-600 text-sm">Total de Pessoas</p>
            <p className="text-3xl font-bold">{currentStats.total_persons || 0}</p>
          </div>
          <div className="bg-red-50 p-6 rounded-lg shadow">
            <p className="text-red-600 text-sm">Críticos</p>
            <p className="text-3xl font-bold text-red-600">{currentStats.critical_count || 0}</p>
          </div>
          <div className="bg-orange-50 p-6 rounded-lg shadow">
            <p className="text-orange-600 text-sm">Estresse Térmico</p>
            <p className="text-3xl font-bold text-orange-600">{currentStats.heat_stress_count || 0}</p>
          </div>
          <div className="bg-green-50 p-6 rounded-lg shadow">
            <p className="text-green-600 text-sm">Confortáveis</p>
            <p className="text-3xl font-bold text-green-600">{currentStats.comfortable_count || 0}</p>
          </div>
        </div>
      )}

      {/* Charts - Apenas mostrar quando dados estiverem prontos */}
      {chartsInitialized ? (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <div className="bg-white p-6 rounded-lg shadow">
              <div ref={severityChartRef} style={{ height: '400px' }}></div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <div ref={riskChartRef} style={{ height: '400px' }}></div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow mb-6">
            <div ref={hourlyChartRef} style={{ height: '450px' }}></div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow mb-6">
            <div ref={timelineChartRef} style={{ height: '450px' }}></div>
          </div>
        </>
      ) : (
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Carregando gráficos...</p>
          </div>
        </div>
      )}

      {/* Critical Table */}
      {criticalPersons && criticalPersons.length > 0 && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="bg-red-50 p-4">
            <h3 className="text-xl font-bold text-red-800">
              ⚠️ {criticalPersons.length} Pessoa(s) Crítica(s)
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-bold">Pessoa</th>
                  <th className="px-6 py-3 text-left text-xs font-bold">Temperatura</th>
                  <th className="px-6 py-3 text-left text-xs font-bold">Condição</th>
                  <th className="px-6 py-3 text-left text-xs font-bold">Localização</th>
                  <th className="px-6 py-3 text-left text-xs font-bold">Última Leitura</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y">
                {criticalPersons.map((person: any) => (
                  <tr key={person.person_code} className="hover:bg-red-50">
                    <td className="px-6 py-4">
                      <div className="text-sm font-bold">{person.person_name}</div>
                      <div className="text-xs text-gray-500">{person.person_code}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-4 py-2 text-xl font-bold rounded bg-red-100 text-red-800">
                        🌡️ {person.ambient_temp}°C
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 text-sm rounded-full bg-red-100 text-red-800">
                        {person.thermal_condition}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm">{person.zone_name}</div>
                      <div className="text-xs text-gray-500">{person.area_name}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-medium">
                        {person.minutes_ago} min atrás
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}