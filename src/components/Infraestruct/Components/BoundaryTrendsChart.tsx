// src/components/BoundaryTrendsChart.tsx
import React, { useEffect, useRef, useState } from 'react';
import * as echarts from 'echarts';
import { ArrowPathIcon, ArrowTrendingDownIcon, ArrowTrendingUpIcon, ChartBarIcon } from '@heroicons/react/24/outline';
import { t } from 'i18next';

interface BoundaryTrendData {
  period: string;
  boundary_id: number;
  boundary_name: string;
  total_visits: string;
  avg_daily_visits: string;
  total_unique_items: string;
  avg_daily_unique_items: string;
  avg_duration: string;
  avg_total_hours: string;
  visits_change: string | null;
  visits_change_pct: string | null;
  morning_visits: string;
  afternoon_visits: string;
  night_visits: string;
  total_alerts: string;
  total_alarm_events: string | null;
}

interface Props {
  data: BoundaryTrendData[];
  loading: boolean;
  title?: string;
}

type ChartType = 'line' | 'area' | 'bar' | 'change';
type MetricType = 'visits' | 'duration' | 'unique_items';

const BoundaryTrendsChart: React.FC<Props> = ({
  data,
  loading,
  title
}) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstanceRef = useRef<echarts.ECharts | null>(null);
  
  const [chartType, setChartType] = useState<ChartType>('line');
  const [selectedMetric, setSelectedMetric] = useState<MetricType>('visits');
  const [selectedBoundaries, setSelectedBoundaries] = useState<string[]>([]);
  const [showAll, setShowAll] = useState(true);

  // Extrair boundaries únicas
  const boundaries = [...new Set(data.map(d => d.boundary_name))];

  useEffect(() => {
    if (boundaries.length > 0 && selectedBoundaries.length === 0) {
      // Selecionar top 5 boundaries por padrão
      const topBoundaries = getTopBoundaries(5);
      setSelectedBoundaries(topBoundaries);
    }
  }, [boundaries, data]);

  useEffect(() => {
    if (data && data.length > 0 && chartRef.current && !loading && selectedBoundaries.length > 0) {
      initChart();
    }

    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.dispose();
      }
    };
  }, [data, loading, chartType, selectedMetric, selectedBoundaries]);

  useEffect(() => {
    const handleResize = () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.resize();
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const getTopBoundaries = (limit: number): string[] => {
    const boundaryTotals = boundaries.map(boundary => {
      const total = data
        .filter(d => d.boundary_name === boundary)
        .reduce((sum, d) => sum + parseFloat(d.total_visits), 0);
      return { boundary, total };
    });

    return boundaryTotals
      .sort((a, b) => b.total - a.total)
      .slice(0, limit)
      .map(b => b.boundary);
  };

  const initChart = () => {
    if (!chartRef.current || !data || data.length === 0) return;

    if (chartInstanceRef.current) {
      chartInstanceRef.current.dispose();
    }

    const chart = echarts.init(chartRef.current);
    chartInstanceRef.current = chart;

    let option: echarts.EChartsOption;

    switch (chartType) {
      case 'line':
        option = getLineChartOption();
        break;
      case 'area':
        option = getAreaChartOption();
        break;
      case 'bar':
        option = getBarChartOption();
        break;
      case 'change':
        option = getChangeChartOption();
        break;
      default:
        option = getLineChartOption();
    }

    chart.setOption(option);
  };

  const getLineChartOption = (): echarts.EChartsOption => {
    const boundariesToShow = showAll ? boundaries : selectedBoundaries;
    
    // Agrupar dados por período
    const periods = [...new Set(data.map(d => formatDate(d.period)))];
    ///@ts-ignore
    const series = boundariesToShow.map((boundary, index) => {
      const boundaryData = periods.map(period => {
        const item = data.find(
          d => d.boundary_name === boundary && formatDate(d.period) === period
        );
        return item ? getMetricValue(item, selectedMetric) : 0;
      });

      return {
        name: boundary,
        type: 'line',
        data: boundaryData,
        smooth: true,
        symbol: 'circle',
        symbolSize: 6,
        lineStyle: {
          width: 3,
          shadowColor: getColorForBoundary(boundary, 0.3),
          shadowBlur: 8
        },
        itemStyle: {
          color: getColorForBoundary(boundary),
          borderColor: '#fff',
          borderWidth: 2
        },
        emphasis: {
          scale: true,
          focus: 'series'
        }
      };
    });

    return {
      tooltip: {
        trigger: 'axis',
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderColor: '#e5e7eb',
        borderWidth: 1,
        textStyle: { color: '#1f2937' },
        axisPointer: {
          type: 'cross',
          label: {
            backgroundColor: '#6b7280'
          }
        }
      },
      legend: {
        data: boundariesToShow,
        top: 10,
        type: 'scroll',
        textStyle: { fontSize: 11, fontWeight: 600 }
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '15%',
        top: boundariesToShow.length > 5 ? '15%' : '10%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        data: periods,
        boundaryGap: false,
        axisLabel: {
          fontSize: 10,
          color: '#6b7280',
          rotate: 45
        },
        axisLine: {
          lineStyle: { color: '#e5e7eb' }
        }
      },
      yAxis: {
        type: 'value',
        name: getMetricLabel(selectedMetric),
        nameTextStyle: {
          fontSize: 12,
          fontWeight: 600,
          color: '#374151'
        },
        axisLabel: {
          fontSize: 11,
          color: '#6b7280'
        },
        splitLine: {
          lineStyle: { color: '#f3f4f6', type: 'dashed' }
        }
      },
      ///@ts-ignore
      series: series,
      dataZoom: periods.length > 15 ? [
        {
          type: 'slider',
          show: true,
          xAxisIndex: [0],
          start: 70,
          end: 100,
          height: 25,
          bottom: 5
        }
      ] : []
    };
  };

  const getAreaChartOption = (): echarts.EChartsOption => {
    const boundariesToShow = showAll ? boundaries : selectedBoundaries;
    const periods = [...new Set(data.map(d => formatDate(d.period)))];

    const series = boundariesToShow.map(boundary => {
      const boundaryData = periods.map(period => {
        const item = data.find(
          d => d.boundary_name === boundary && formatDate(d.period) === period
        );
        return item ? getMetricValue(item, selectedMetric) : 0;
      });

      return {
        name: boundary,
        type: 'line',
        data: boundaryData,
        smooth: true,
        stack: 'Total',
        areaStyle: {
          opacity: 0.6
        },
        emphasis: {
          focus: 'series'
        },
        lineStyle: {
          width: 2
        }
      };
    });

    return {
      tooltip: {
        trigger: 'axis',
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderColor: '#e5e7eb',
        borderWidth: 1,
        axisPointer: {
          type: 'cross'
        }
      },
      legend: {
        data: boundariesToShow,
        top: 10,
        type: 'scroll',
        textStyle: { fontSize: 11, fontWeight: 600 }
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '15%',
        top: '15%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        data: periods,
        boundaryGap: false,
        axisLabel: {
          fontSize: 10,
          color: '#6b7280',
          rotate: 45
        }
      },
      yAxis: {
        type: 'value',
        name: getMetricLabel(selectedMetric),
        nameTextStyle: {
          fontSize: 12,
          fontWeight: 600
        }
      },
      ///@ts-ignore
      series: series
    };
  };

  const getBarChartOption = (): echarts.EChartsOption => {
    const boundariesToShow = showAll ? boundaries : selectedBoundaries;
    const periods = [...new Set(data.map(d => formatDate(d.period)))];

    const series = boundariesToShow.map(boundary => {
      const boundaryData = periods.map(period => {
        const item = data.find(
          d => d.boundary_name === boundary && formatDate(d.period) === period
        );
        return item ? getMetricValue(item, selectedMetric) : 0;
      });

      return {
        name: boundary,
        type: 'bar',
        data: boundaryData,
        itemStyle: {
          borderRadius: [4, 4, 0, 0]
        }
      };
    });

    return {
      tooltip: {
        trigger: 'axis',
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderColor: '#e5e7eb',
        borderWidth: 1,
        axisPointer: {
          type: 'shadow'
        }
      },
      legend: {
        data: boundariesToShow,
        top: 10,
        type: 'scroll',
        textStyle: { fontSize: 11, fontWeight: 600 }
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '15%',
        top: '15%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        data: periods,
        axisLabel: {
          fontSize: 10,
          color: '#6b7280',
          rotate: 45
        }
      },
      yAxis: {
        type: 'value',
        name: getMetricLabel(selectedMetric),
        nameTextStyle: {
          fontSize: 12,
          fontWeight: 600
        }
      },
      ///@ts-ignore
      series: series
    };
  };

  const getChangeChartOption = (): echarts.EChartsOption => {
    const boundariesToShow = showAll ? boundaries : selectedBoundaries;
    const periods = [...new Set(data.map(d => formatDate(d.period)))];

    const series = boundariesToShow.map(boundary => {
      const boundaryData = periods.map(period => {
        const item = data.find(
          d => d.boundary_name === boundary && formatDate(d.period) === period
        );
        
        if (!item || !item.visits_change_pct) return 0;
        return parseFloat(item.visits_change_pct);
      });

      return {
        name: boundary,
        type: 'bar',
        data: boundaryData,
        itemStyle: {
          borderRadius: [4, 4, 0, 0],
          color: (params: any) => {
            return params.value >= 0 ? '#10b981' : '#ef4444';
          }
        },
        label: {
          show: true,
          position: 'top',
          fontSize: 9,
          formatter: (params: any) => {
            const val = params.value;
            if (val === 0) return '';
            return val > 0 
              ? t('boundaryAccessAnalytics.boundaryTrendsChart.format.growthPositive', { value: val.toFixed(1) })
              : t('boundaryAccessAnalytics.boundaryTrendsChart.format.growthNegative', { value: val.toFixed(1) });
          }
        }
      };
    });

    return {
      tooltip: {
        trigger: 'axis',
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderColor: '#e5e7eb',
        borderWidth: 1,
        formatter: (params: any) => {
          let tooltip = `<div style="font-weight: bold; margin-bottom: 4px;">${params[0].axisValue}</div>`;
          params.forEach((item: any) => {
            const val = item.value;
            const color = val >= 0 ? '#10b981' : '#ef4444';
            const icon = val >= 0 ? '▲' : '▼';
            const formattedValue = val > 0 
              ? t('boundaryAccessAnalytics.boundaryTrendsChart.format.growthPositive', { value: val.toFixed(1) })
              : t('boundaryAccessAnalytics.boundaryTrendsChart.format.growthNegative', { value: val.toFixed(1) });
            tooltip += `<div style="color: ${color}; margin-bottom: 2px;">
              ${icon} ${item.seriesName}: <strong>${formattedValue}</strong>
            </div>`;
          });
          return tooltip;
        }
      },
      legend: {
        data: boundariesToShow,
        top: 10,
        type: 'scroll',
        textStyle: { fontSize: 11, fontWeight: 600 }
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '15%',
        top: '15%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        data: periods,
        axisLabel: {
          fontSize: 10,
          color: '#6b7280',
          rotate: 45
        }
      },
      yAxis: {
        type: 'value',
        name: t('boundaryAccessAnalytics.boundaryTrendsChart.labels.variation'),
        nameTextStyle: {
          fontSize: 12,
          fontWeight: 600
        },
        axisLabel: {
          formatter: (value: number) => t('boundaryAccessAnalytics.boundaryTrendsChart.format.percentage', { value })
        },
        splitLine: {
          lineStyle: {
            type: 'dashed'
          }
        }
      },
      ///@ts-ignore
      series: series
    };
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
  };

  const getMetricValue = (item: BoundaryTrendData, metric: MetricType): number => {
    switch (metric) {
      case 'visits':
        return parseFloat(item.total_visits);
      case 'duration':
        return parseFloat(item.avg_duration);
      case 'unique_items':
        return parseFloat(item.total_unique_items);
      default:
        return 0;
    }
  };

  const getMetricLabel = (metric: MetricType): string => {
    return t(`boundaryAccessAnalytics.boundaryTrendsChart.labels.${metric}`);
  };

  const getColorForBoundary = (boundary: string, opacity: number = 1): string => {
    const colors = [
      '#3b82f6', '#10b981', '#f59e0b', '#ef4444', 
      '#8b5cf6', '#06b6d4', '#ec4899', '#84cc16'
    ];
    
    let hash = 0;
    for (let i = 0; i < boundary.length; i++) {
      hash = boundary.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    const color = colors[Math.abs(hash) % colors.length];
    
    if (opacity < 1) {
      const r = parseInt(color.slice(1, 3), 16);
      const g = parseInt(color.slice(3, 5), 16);
      const b = parseInt(color.slice(5, 7), 16);
      return `rgba(${r}, ${g}, ${b}, ${opacity})`;
    }
    
    return color;
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
    if (!showAll) {
      setSelectedBoundaries(getTopBoundaries(5));
    }
  };

  // Calcular estatísticas
  const latestData = data.filter(d => d.period === data[0]?.period);
  const totalVisits = latestData.reduce((sum, d) => sum + parseFloat(d.total_visits), 0);
  const avgGrowth = latestData
    .filter(d => d.visits_change_pct)
    .reduce((sum, d) => sum + parseFloat(d.visits_change_pct || '0'), 0) / latestData.filter(d => d.visits_change_pct).length;

  const showLoading = loading;
  const showEmpty = !loading && (!data || data.length === 0);
  const showChart = !loading && data && data.length > 0;

  return (
    <div className="bg-white rounded-2xl border-2 border-[#E2E8F0] shadow-lg overflow-hidden mt-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#8b5cf6] to-[#7c3aed] p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center">
              <ChartBarIcon className="w-8 h-8 text-white" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-white mb-1">
                {title || t('boundaryAccessAnalytics.boundaryTrendsChart.title')}
              </h3>
              <p className="text-white/80 text-sm">
                {t('boundaryAccessAnalytics.boundaryTrendsChart.subtitle')}
              </p>
            </div>
          </div>

          {showChart && (
            <div className="hidden lg:flex items-center gap-4">
              <div className="px-6 py-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20">
                <p className="text-xs text-white/80 font-medium">
                  {t('boundaryAccessAnalytics.boundaryTrendsChart.labels.totalVisits')}
                </p>
                <p className="text-xl font-bold text-white">{totalVisits.toLocaleString()}</p>
              </div>
              <div className="px-6 py-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20">
                <p className="text-xs text-white/80 font-medium">
                  {t('boundaryAccessAnalytics.boundaryTrendsChart.labels.avgGrowth')}
                </p>
                <div className="flex items-center gap-1">
                  {avgGrowth >= 0 ? (
                    <ArrowTrendingUpIcon className="w-5 h-5 text-green-300" />
                  ) : (
                    <ArrowTrendingDownIcon className="w-5 h-5 text-red-300" />
                  )}
                  <p className="text-xl font-bold text-white">
                    {avgGrowth > 0 
                      ? t('boundaryAccessAnalytics.boundaryTrendsChart.format.growthPositive', { value: avgGrowth.toFixed(1) })
                      : t('boundaryAccessAnalytics.boundaryTrendsChart.format.growthNegative', { value: avgGrowth.toFixed(1) })
                    }
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="p-6 bg-gradient-to-b from-purple-50/30 to-white">
        {/* Controls */}
        {showChart && (
          <div className="mb-6 space-y-4">
            {/* Chart Type Selection */}
            <div className="flex flex-wrap gap-3">
              <div className="flex items-center gap-2 p-1 bg-gray-100 rounded-xl">
                <button
                  onClick={() => setChartType('line')}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                    chartType === 'line'
                      ? 'bg-white text-purple-600 shadow-md'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {t('boundaryAccessAnalytics.boundaryTrendsChart.chartTypes.line')}
                </button>
                <button
                  onClick={() => setChartType('area')}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                    chartType === 'area'
                      ? 'bg-white text-purple-600 shadow-md'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {t('boundaryAccessAnalytics.boundaryTrendsChart.chartTypes.area')}
                </button>
                <button
                  onClick={() => setChartType('bar')}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                    chartType === 'bar'
                      ? 'bg-white text-purple-600 shadow-md'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {t('boundaryAccessAnalytics.boundaryTrendsChart.chartTypes.bar')}
                </button>
                <button
                  onClick={() => setChartType('change')}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                    chartType === 'change'
                      ? 'bg-white text-purple-600 shadow-md'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {t('boundaryAccessAnalytics.boundaryTrendsChart.chartTypes.change')}
                </button>
              </div>

              {/* Metric Selection */}
              {chartType !== 'change' && (
                <div className="flex items-center gap-2 p-1 bg-gray-100 rounded-xl">
                  <button
                    onClick={() => setSelectedMetric('visits')}
                    className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                      selectedMetric === 'visits'
                        ? 'bg-white text-purple-600 shadow-md'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    {t('boundaryAccessAnalytics.boundaryTrendsChart.metrics.visits')}
                  </button>
                  <button
                    onClick={() => setSelectedMetric('duration')}
                    className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                      selectedMetric === 'duration'
                        ? 'bg-white text-purple-600 shadow-md'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    {t('boundaryAccessAnalytics.boundaryTrendsChart.metrics.duration')}
                  </button>
                  <button
                    onClick={() => setSelectedMetric('unique_items')}
                    className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                      selectedMetric === 'unique_items'
                        ? 'bg-white text-purple-600 shadow-md'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    {t('boundaryAccessAnalytics.boundaryTrendsChart.metrics.unique_items')}
                  </button>
                </div>
              )}
            </div>

            {/* Boundary Selection */}
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={toggleShowAll}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  showAll
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {t('boundaryAccessAnalytics.boundaryTrendsChart.buttons.all')}
              </button>
              {boundaries.slice(0, 10).map(boundary => (
                <button
                  key={boundary}
                  onClick={() => toggleBoundary(boundary)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    selectedBoundaries.includes(boundary) && !showAll
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                  style={{
                    borderLeft: `4px solid ${getColorForBoundary(boundary)}`
                  }}
                >
                  {boundary.length > 20 ? boundary.substring(0, 20) + '...' : boundary}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Loading State */}
        {showLoading && (
          <div className="flex items-center justify-center h-[500px]">
            <div className="flex flex-col items-center gap-3">
              <ArrowPathIcon className="w-8 h-8 text-purple-500 animate-spin" />
              <p className="text-gray-600 text-sm">
                {t('boundaryAccessAnalytics.boundaryTrendsChart.states.loading')}
              </p>
            </div>
          </div>
        )}

        {/* Empty State */}
        {showEmpty && (
          <div className="flex items-center justify-center h-[500px]">
            <div className="text-center">
              <ChartBarIcon className="w-16 h-16 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 font-medium">
                {t('boundaryAccessAnalytics.boundaryTrendsChart.states.noData.title')}
              </p>
              <p className="text-gray-400 text-sm mt-1">
                {t('boundaryAccessAnalytics.boundaryTrendsChart.states.noData.description')}
              </p>
            </div>
          </div>
        )}

        {/* Chart Container */}
        <div className={showChart ? 'block' : 'hidden'}>
          <div className="relative bg-white rounded-xl border-2 border-[#E2E8F0] p-6 shadow-sm">
            <div
              ref={chartRef}
              className="w-full"
              style={{ height: '550px' }}
            />
          </div>

          {/* Footer Info */}
          <div className="mt-4 flex items-center justify-between px-2">
            <div className="flex items-center gap-2 px-4 py-2 bg-purple-50 rounded-xl border border-purple-200">
              <svg className="w-4 h-4 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <span className="text-xs text-purple-700 font-medium">
                {chartType === 'change' 
                  ? t('boundaryAccessAnalytics.boundaryTrendsChart.tooltips.variationHelp')
                  : t('boundaryAccessAnalytics.boundaryTrendsChart.tooltips.chartHelp')
                }
              </span>
            </div>

            <div className="text-xs text-gray-500">
              {t('boundaryAccessAnalytics.boundaryTrendsChart.footer.dateRange')} • {t('boundaryAccessAnalytics.boundaryTrendsChart.footer.updated')}: <span className="font-semibold text-gray-700">{new Date().toLocaleDateString('pt-BR')}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BoundaryTrendsChart;