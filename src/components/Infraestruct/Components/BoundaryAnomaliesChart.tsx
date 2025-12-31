// src/components/BoundaryAnomaliesChart.tsx
import React, { useState, useEffect, useRef } from 'react';
import * as echarts from 'echarts';
import { 
  ExclamationTriangleIcon, 
  ChartBarIcon, 
  BoltIcon, 
  InformationCircleIcon 
} from '@heroicons/react/24/outline';
import { t } from 'i18next';

interface BoundaryAnomalyData {
  entry_date: string;
  boundary_id: number;
  boundary_name: string;
  day_type: string;
  total_visits: number;
  avg_visit_duration_minutes: string;
  alert_rate: string;
  expected_visits: string;
  expected_duration: string;
  expected_alert_rate: string;
  visits_zscore: number;
  duration_zscore: number;
  alert_rate_zscore: number | null;
  anomaly_type: string;
  alarm1_count: string | null;
  alarm2_count: string | null;
  mandown_count: string | null;
  tamper_count: string | null;
}

interface BoundaryAnomaliesChartProps {
  data: BoundaryAnomalyData[];
  loading?: boolean;
  title?: string;
}

type ChartType = 'scatter' | 'heatmap' | 'table';
type AnomalyFilter = 'all' | 'VISITS_ANOMALY' | 'DURATION_ANOMALY' | 'ALERT_ANOMALY';

const BoundaryAnomaliesChart: React.FC<BoundaryAnomaliesChartProps> = ({
  data = [],
  loading = false,
  title
}) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<echarts.ECharts | null>(null);

  const [chartType, setChartType] = useState<ChartType>('scatter');
  const [anomalyFilter, setAnomalyFilter] = useState<AnomalyFilter>('all');
  const [selectedBoundaries, setSelectedBoundaries] = useState<string[]>([]);
  const [showAll, setShowAll] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Filtrar dados baseado no filtro de anomalia
  const filteredData = data.filter(item => {
    if (anomalyFilter === 'all') return true;
    return item.anomaly_type === anomalyFilter;
  });

  // Filtrar por boundaries selecionados
  const displayData = showAll
    ? filteredData
    : filteredData.filter(item => selectedBoundaries.includes(item.boundary_name));

  // Obter boundaries únicos
  const uniqueBoundaries = Array.from(new Set(data.map(item => item.boundary_name))).sort();

  // Selecionar top 5 boundaries com mais anomalias por padrão
  useEffect(() => {
    if (data.length > 0 && selectedBoundaries.length === 0) {
      const boundaryCount = data.reduce((acc, item) => {
        acc[item.boundary_name] = (acc[item.boundary_name] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const topBoundaries = Object.entries(boundaryCount)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .map(([name]) => name);

      setSelectedBoundaries(topBoundaries);
      setShowAll(false);
    }
  }, [data]);

  // Estatísticas
  const totalAnomalies = displayData.length;
  const avgVisitsZScore = displayData.length > 0
    ? (displayData.reduce((sum, item) => sum + Math.abs(item.visits_zscore), 0) / displayData.length).toFixed(2)
    : '0.00';
  const criticalAnomalies = displayData.filter(item => Math.abs(item.visits_zscore) > 3).length;

  // Configurar gráfico baseado no tipo
  useEffect(() => {
    if (!chartRef.current || displayData.length === 0 || chartType === 'table') return;

    if (!chartInstance.current) {
      chartInstance.current = echarts.init(chartRef.current);
    }

    let option: echarts.EChartsOption;

    if (chartType === 'scatter') {
      // Scatter plot: Z-Score de visitas vs duração
      const scatterData = displayData.map(item => ({
        value: [item.visits_zscore, item.duration_zscore, item.total_visits],
        itemStyle: {
          color: getAnomalyColor(item.anomaly_type)
        },
        name: item.boundary_name,
        date: formatDate(item.entry_date)
      }));

      option = {
        backgroundColor: 'transparent',
        tooltip: {
          trigger: 'item',
          formatter: (params: any) => {
            const data = params.data;
            return `
              <div style="padding: 8px;">
                <strong>${data.name}</strong><br/>
                ${t('boundaryAccessAnalytics.boundaryAnomaliesChart.table.headers.date')}: ${data.date}<br/>
                ${t('boundaryAccessAnalytics.boundaryAnomaliesChart.table.headers.zScore')} ${t('boundaryAccessAnalytics.boundaryAnomaliesChart.filters.visits')}: ${data.value[0].toFixed(2)}<br/>
                ${t('boundaryAccessAnalytics.boundaryAnomaliesChart.table.headers.zScore')} ${t('boundaryAccessAnalytics.boundaryAnomaliesChart.filters.duration')}: ${data.value[1].toFixed(2)}<br/>
                ${t('boundaryAccessAnalytics.boundaryAnomaliesChart.table.headers.visits')}: ${data.value[2]}
              </div>
            `;
          }
        },
        grid: {
          left: '10%',
          right: '10%',
          top: '15%',
          bottom: '15%'
        },
        xAxis: {
          type: 'value',
          name: `${t('boundaryAccessAnalytics.boundaryAnomaliesChart.table.headers.zScore')} ${t('boundaryAccessAnalytics.boundaryAnomaliesChart.filters.visits')}`,
          nameLocation: 'middle',
          nameGap: 30,
          axisLine: { lineStyle: { color: '#666' } },
          splitLine: { 
            show: true, 
            lineStyle: { color: '#eee', type: 'dashed' } 
          }
        },
        yAxis: {
          type: 'value',
          name: `${t('boundaryAccessAnalytics.boundaryAnomaliesChart.table.headers.zScore')} ${t('boundaryAccessAnalytics.boundaryAnomaliesChart.filters.duration')}`,
          nameLocation: 'middle',
          nameGap: 40,
          axisLine: { lineStyle: { color: '#666' } },
          splitLine: { 
            show: true, 
            lineStyle: { color: '#eee', type: 'dashed' } 
          }
        },
        series: [
          {
            type: 'scatter',
            data: scatterData,
            symbolSize: (data: any) => Math.min(Math.max(data[2] * 2, 8), 40),
            emphasis: {
              focus: 'series',
              scale: 1.5
            },
            markLine: {
              silent: true,
              lineStyle: { color: '#999', type: 'dashed', width: 1 },
              data: [
                { xAxis: 0 },
                { yAxis: 0 },
                { xAxis: 2, lineStyle: { color: '#ff4444' } },
                { xAxis: -2, lineStyle: { color: '#ff4444' } },
                { yAxis: 2, lineStyle: { color: '#ff4444' } },
                { yAxis: -2, lineStyle: { color: '#ff4444' } }
              ]
            }
          }
        ]
      };
    } else if (chartType === 'heatmap') {
      // Heatmap: Intensidade de anomalias por boundary e data
      const dates = Array.from(new Set(displayData.map(item => formatDate(item.entry_date)))).sort();
      const boundaries = showAll 
        ? uniqueBoundaries 
        : selectedBoundaries;

      const heatmapData: any[] = [];
      const anomalyMatrix: Record<string, Record<string, number>> = {};

      displayData.forEach(item => {
        const date = formatDate(item.entry_date);
        const boundary = item.boundary_name;
        
        if (!anomalyMatrix[boundary]) anomalyMatrix[boundary] = {};
        anomalyMatrix[boundary][date] = (anomalyMatrix[boundary][date] || 0) + Math.abs(item.visits_zscore);
      });

      boundaries.forEach((boundary, boundaryIdx) => {
        dates.forEach((date, dateIdx) => {
          const value = anomalyMatrix[boundary]?.[date] || 0;
          heatmapData.push([dateIdx, boundaryIdx, value]);
        });
      });

      const maxValue = Math.max(...heatmapData.map(d => d[2]), 1);

      option = {
        backgroundColor: 'transparent',
        tooltip: {
          position: 'top',
          formatter: (params: any) => {
            const [dateIdx, boundaryIdx, value] = params.data;
            return `
              <div style="padding: 8px;">
                <strong>${boundaries[boundaryIdx]}</strong><br/>
                ${t('boundaryAccessAnalytics.boundaryAnomaliesChart.table.headers.date')}: ${dates[dateIdx]}<br/>
                ${t('boundaryAccessAnalytics.boundaryAnomaliesChart.table.headers.zScore')} Total: ${value.toFixed(2)}
              </div>
            `;
          }
        },
        grid: {
          left: '20%',
          right: '10%',
          top: '5%',
          bottom: '15%'
        },
        xAxis: {
          type: 'category',
          data: dates,
          splitArea: { show: true },
          axisLabel: { rotate: 45, fontSize: 10 }
        },
        yAxis: {
          type: 'category',
          data: boundaries,
          splitArea: { show: true },
          axisLabel: { fontSize: 11 }
        },
        visualMap: {
          min: 0,
          max: maxValue,
          calculable: true,
          orient: 'horizontal',
          left: 'center',
          bottom: '0%',
          inRange: {
            color: ['#e0f7fa', '#00acc1', '#006064']
          }
        },
        series: [
          {
            type: 'heatmap',
            data: heatmapData,
            label: {
              show: false
            },
            emphasis: {
              itemStyle: {
                shadowBlur: 10,
                shadowColor: 'rgba(0, 0, 0, 0.5)'
              }
            }
          }
        ]
      };
    }
    //@ts-ignore
    chartInstance.current.setOption(option);

    const handleResize = () => {
      chartInstance.current?.resize();
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [displayData, chartType, showAll, selectedBoundaries]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
  };

  const getAnomalyColor = (anomalyType: string) => {
    switch (anomalyType) {
      case 'VISITS_ANOMALY': return '#ff6b6b';
      case 'DURATION_ANOMALY': return '#ffa500';
      case 'ALERT_ANOMALY': return '#9b59b6';
      default: return '#95a5a6';
    }
  };

  const getAnomalyLabel = (anomalyType: string) => {
    return t(`boundaryAccessAnalytics.boundaryAnomaliesChart.anomalyTypes.${anomalyType}`, anomalyType);
  };

  const getSeverityBadge = (zscore: number) => {
    const absZScore = Math.abs(zscore);
    if (absZScore > 3) {
      return <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-700 font-medium">
        {t('boundaryAccessAnalytics.boundaryAnomaliesChart.severity.critical')}
      </span>;
    } else if (absZScore > 2) {
      return <span className="px-2 py-1 text-xs rounded-full bg-orange-100 text-orange-700 font-medium">
        {t('boundaryAccessAnalytics.boundaryAnomaliesChart.severity.high')}
      </span>;
    } else {
      return <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-700 font-medium">
        {t('boundaryAccessAnalytics.boundaryAnomaliesChart.severity.moderate')}
      </span>;
    }
  };

  const toggleBoundary = (boundary: string) => {
    setSelectedBoundaries(prev => {
      if (prev.includes(boundary)) {
        return prev.filter(b => b !== boundary);
      } else {
        return [...prev, boundary];
      }
    });
    setShowAll(false);
  };

  const toggleShowAll = () => {
    setShowAll(!showAll);
  };

  // Paginação para tabela
  const totalPages = Math.ceil(displayData.length / itemsPerPage);
  const paginatedData = displayData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex flex-col items-center justify-center h-96 text-gray-400">
          <ExclamationTriangleIcon className="w-16 h-16 mb-4" />
          <p className="text-lg">{t('boundaryAccessAnalytics.boundaryAnomaliesChart.states.noData.title')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden mt-6">
      {/* Header com gradiente */}
      <div className="bg-gradient-to-r from-red-600 to-orange-500 text-white p-6">
        <h3 className="text-xl font-bold mb-4">
          {title || t('boundaryAccessAnalytics.boundaryAnomaliesChart.title')}
        </h3>
        
        {/* Cards de estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white/80">
                  {t('boundaryAccessAnalytics.boundaryAnomaliesChart.statistics.totalAnomalies')}
                </p>
                <p className="text-2xl font-bold">{totalAnomalies}</p>
              </div>
              <ExclamationTriangleIcon className="w-8 h-8 text-white/80" />
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white/80">
                  {t('boundaryAccessAnalytics.boundaryAnomaliesChart.statistics.avgZScore')}
                </p>
                <p className="text-2xl font-bold">{avgVisitsZScore}</p>
              </div>
              <BoltIcon className="w-8 h-8 text-white/80" />
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white/80">
                  {t('boundaryAccessAnalytics.boundaryAnomaliesChart.statistics.criticalAnomalies')}
                </p>
                <p className="text-2xl font-bold">{criticalAnomalies}</p>
              </div>
              <ChartBarIcon className="w-8 h-8 text-white/80" />
            </div>
          </div>
        </div>
      </div>

      {/* Controles */}
      <div className="p-6 border-b space-y-4">
        {/* Tipo de visualização */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setChartType('scatter')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              chartType === 'scatter'
                ? 'bg-red-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {t('boundaryAccessAnalytics.boundaryAnomaliesChart.chartTypes.scatter')}
          </button>
          <button
            onClick={() => setChartType('heatmap')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              chartType === 'heatmap'
                ? 'bg-red-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {t('boundaryAccessAnalytics.boundaryAnomaliesChart.chartTypes.heatmap')}
          </button>
          <button
            onClick={() => setChartType('table')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              chartType === 'table'
                ? 'bg-red-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {t('boundaryAccessAnalytics.boundaryAnomaliesChart.chartTypes.table')}
          </button>
        </div>

        {/* Filtro de tipo de anomalia */}
        <div className="flex flex-wrap gap-2">
          <span className="text-sm font-medium text-gray-700 self-center mr-2">
            {t('boundaryAccessAnalytics.boundaryAnomaliesChart.filters.type')}:
          </span>
          <button
            onClick={() => setAnomalyFilter('all')}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
              anomalyFilter === 'all'
                ? 'bg-gray-700 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {t('boundaryAccessAnalytics.boundaryAnomaliesChart.filters.all')}
          </button>
          <button
            onClick={() => setAnomalyFilter('VISITS_ANOMALY')}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
              anomalyFilter === 'VISITS_ANOMALY'
                ? 'bg-red-600 text-white'
                : 'bg-red-100 text-red-700 hover:bg-red-200'
            }`}
          >
            {t('boundaryAccessAnalytics.boundaryAnomaliesChart.filters.visits')}
          </button>
          <button
            onClick={() => setAnomalyFilter('DURATION_ANOMALY')}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
              anomalyFilter === 'DURATION_ANOMALY'
                ? 'bg-orange-600 text-white'
                : 'bg-orange-100 text-orange-700 hover:bg-orange-200'
            }`}
          >
            {t('boundaryAccessAnalytics.boundaryAnomaliesChart.filters.duration')}
          </button>
          <button
            onClick={() => setAnomalyFilter('ALERT_ANOMALY')}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
              anomalyFilter === 'ALERT_ANOMALY'
                ? 'bg-purple-600 text-white'
                : 'bg-purple-100 text-purple-700 hover:bg-purple-200'
            }`}
          >
            {t('boundaryAccessAnalytics.boundaryAnomaliesChart.filters.alerts')}
          </button>
        </div>

        {/* Filtro de boundaries */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">
              {t('boundaryAccessAnalytics.boundaryAnomaliesChart.filters.boundaries')}:
            </span>
            <button
              onClick={toggleShowAll}
              className="text-sm text-red-600 hover:text-red-700 font-medium"
            >
              {showAll 
                ? t('boundaryAccessAnalytics.boundaryAnomaliesChart.filters.specific')
                : t('boundaryAccessAnalytics.boundaryAnomaliesChart.filters.showAll')
              }
            </button>
          </div>
          {!showAll && (
            <div className="flex flex-wrap gap-2">
              {uniqueBoundaries.map(boundary => (
                <button
                  key={boundary}
                  onClick={() => toggleBoundary(boundary)}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                    selectedBoundaries.includes(boundary)
                      ? 'bg-red-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {boundary}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Conteúdo */}
      <div className="p-6">
        {chartType === 'table' ? (
          <div className="space-y-4">
            {/* Tabela */}
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('boundaryAccessAnalytics.boundaryAnomaliesChart.table.headers.date')}
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('boundaryAccessAnalytics.boundaryAnomaliesChart.table.headers.boundary')}
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('boundaryAccessAnalytics.boundaryAnomaliesChart.table.headers.type')}
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('boundaryAccessAnalytics.boundaryAnomaliesChart.table.headers.visits')}
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('boundaryAccessAnalytics.boundaryAnomaliesChart.table.headers.zScore')}
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('boundaryAccessAnalytics.boundaryAnomaliesChart.table.headers.avgDuration')}
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('boundaryAccessAnalytics.boundaryAnomaliesChart.table.headers.severity')}
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {paginatedData.map((item, idx) => (
                    <tr key={idx} className="hover:bg-gray-50">
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                        {new Date(item.entry_date).toLocaleDateString('pt-BR')}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {item.boundary_name}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span
                          className="px-2 py-1 text-xs rounded-full font-medium"
                          style={{
                            backgroundColor: getAnomalyColor(item.anomaly_type) + '20',
                            color: getAnomalyColor(item.anomaly_type)
                          }}
                        >
                          {getAnomalyLabel(item.anomaly_type)}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-right text-gray-900">
                        {item.total_visits}
                        <span className="text-xs text-gray-500 ml-1">
                          ({t('boundaryAccessAnalytics.boundaryAnomaliesChart.table.expected')}: {parseFloat(item.expected_visits).toFixed(1)})
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-right font-mono text-gray-900">
                        {item.visits_zscore.toFixed(2)}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-right text-gray-900">
                        {parseFloat(item.avg_visit_duration_minutes).toFixed(1)}{t('boundaryAccessAnalytics.boundaryAnomaliesChart.table.minutes')}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-center">
                        {getSeverityBadge(item.visits_zscore)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Paginação */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  {t('boundaryAccessAnalytics.boundaryAnomaliesChart.table.showing')} {((currentPage - 1) * itemsPerPage) + 1} {t('boundaryAccessAnalytics.boundaryAnomaliesChart.table.to')} {Math.min(currentPage * itemsPerPage, displayData.length)} {t('boundaryAccessAnalytics.boundaryAnomaliesChart.table.of')} {displayData.length} {t('boundaryAccessAnalytics.boundaryAnomaliesChart.table.anomalies')}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1 rounded bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {t('boundaryAccessAnalytics.boundaryAnomaliesChart.pagination.previous')}
                  </button>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }
                      return (
                        <button
                          key={pageNum}
                          onClick={() => setCurrentPage(pageNum)}
                          className={`px-3 py-1 rounded ${
                            pageNum === currentPage
                              ? 'bg-red-600 text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>
                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 rounded bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {t('boundaryAccessAnalytics.boundaryAnomaliesChart.pagination.next')}
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div ref={chartRef} style={{ width: '100%', height: '500px' }} />
        )}
      </div>

      {/* Footer */}
      <div className="px-6 py-4 bg-gray-50 border-t flex items-center justify-between text-sm text-gray-600">
        <div className="flex items-center gap-2">
          <InformationCircleIcon className="w-4 h-4" />
          <span>{t('boundaryAccessAnalytics.boundaryAnomaliesChart.tooltips.zScoreExplanation')}</span>
        </div>
        <div>
          {t('boundaryAccessAnalytics.boundaryAnomaliesChart.tooltips.lastUpdated')}: {new Date().toLocaleString('pt-BR')}
        </div>
      </div>
    </div>
  );
};

export default BoundaryAnomaliesChart;