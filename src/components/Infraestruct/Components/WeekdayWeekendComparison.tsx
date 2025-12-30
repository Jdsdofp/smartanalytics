// src/components/WeekdayWeekendComparison.tsx
import React, { useEffect, useRef, useState } from 'react';
import * as echarts from 'echarts';
import { ArrowPathIcon, CalendarIcon, ChartBarIcon } from '@heroicons/react/24/outline';

interface WeekdayWeekendData {
  boundary_id: number;
  boundary_name: string;
  day_type: string;
  days_analyzed: number;
  total_visits: string;
  avg_visits_per_day: string;
  total_unique_items: string;
  avg_unique_items_per_day: string;
  avg_duration_minutes: string;
  avg_total_hours_per_day: string;
  morning_percentage: string;
  afternoon_percentage: string;
  night_percentage: string;
  very_short_pct: string;
  short_pct: string;
  medium_pct: string;
  long_pct: string;
  very_long_pct: string;
  alert_percentage: string;
  total_alarm1: string | null;
  total_alarm2: string | null;
  total_mandown: string | null;
  total_tamper: string | null;
}

interface Props {
  data: WeekdayWeekendData[];
  loading: boolean;
  title?: string;
}

type ChartType = 'visits' | 'duration' | 'period' | 'alerts';
type ViewMode = 'bar' | 'radar' | 'heatmap';

const WeekdayWeekendComparison: React.FC<Props> = ({
  data,
  loading,
  title = 'Análise: Dia Útil vs Final de Semana'
}) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstanceRef = useRef<echarts.ECharts | null>(null);
  const [chartType, setChartType] = useState<ChartType>('visits');
  const [viewMode, setViewMode] = useState<ViewMode>('bar');

  useEffect(() => {
    if (data && data.length > 0 && chartRef.current && !loading) {
      initChart();
    }

    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.dispose();
      }
    };
  }, [data, loading, chartType, viewMode]);

  useEffect(() => {
    const handleResize = () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.resize();
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const initChart = () => {
    if (!chartRef.current || !data || data.length === 0) return;

    if (chartInstanceRef.current) {
      chartInstanceRef.current.dispose();
    }

    const chart = echarts.init(chartRef.current);
    chartInstanceRef.current = chart;

    const option = viewMode === 'bar' 
      ? getBarChartOption() 
      : viewMode === 'radar'
      ? getRadarChartOption()
      : getHeatmapOption();
      
    chart.setOption(option);
  };

  const getBarChartOption = (): echarts.EChartsOption => {
    if (!data || data.length === 0) return {};

    const boundaries = [...new Set(data.map(d => d.boundary_name))];
    const weekdayData = boundaries.map(boundary => {
      const item = data.find(d => d.boundary_name === boundary && d.day_type === 'Weekday');
      return item ? getMetricValue(item, chartType) : 0;
    });
    const weekendData = boundaries.map(boundary => {
      const item = data.find(d => d.boundary_name === boundary && d.day_type === 'Weekend');
      return item ? getMetricValue(item, chartType) : 0;
    });

    return {
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' },
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderColor: '#e5e7eb',
        borderWidth: 1,
        textStyle: { color: '#1f2937' },
        formatter: (params: any) => {
          let tooltip = `<div style="font-weight: bold; margin-bottom: 8px; color: #111827;">${params[0].axisValue}</div>`;
          params.forEach((item: any) => {
            const icon = `<span style="display:inline-block;width:10px;height:10px;background-color:${item.color};border-radius:50%;margin-right:5px;"></span>`;
            tooltip += `<div style="margin-bottom: 4px;">${icon}${item.seriesName}: <strong>${formatMetricValue(item.value, chartType)}</strong></div>`;
          });
          return tooltip;
        }
      },
      legend: {
        data: ['Dia Útil', 'Final de Semana'],
        top: 10,
        textStyle: { fontSize: 12, fontWeight: 600 },
        itemGap: 20
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
        data: boundaries,
        axisLabel: {
          rotate: 45,
          fontSize: 11,
          fontWeight: 500,
          color: '#4b5563'
        },
        axisLine: {
          lineStyle: { color: '#e5e7eb' }
        }
      },
      yAxis: {
        type: 'value',
        name: getMetricLabel(chartType),
        nameTextStyle: { 
          fontSize: 12, 
          fontWeight: 600,
          color: '#374151'
        },
        axisLabel: {
          fontSize: 11,
          color: '#6b7280',
          formatter: (value: number) => formatYAxisValue(value, chartType)
        },
        splitLine: {
          lineStyle: { color: '#f3f4f6', type: 'dashed' }
        }
      },
      series: [
        {
          name: 'Dia Útil',
          type: 'bar',
          data: weekdayData,
          itemStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: '#3b82f6' },
              { offset: 1, color: '#2563eb' }
            ]),
            borderRadius: [6, 6, 0, 0],
            shadowColor: 'rgba(59, 130, 246, 0.3)',
            shadowBlur: 8
          },
          label: {
            show: true,
            position: 'top',
            fontSize: 10,
            fontWeight: 600,
            color: '#1f2937',
            formatter: (params: any) => formatMetricValue(params.value, chartType, true)
          },
          emphasis: {
            itemStyle: {
              color: '#3b82f6',
              shadowBlur: 15,
              shadowColor: 'rgba(59, 130, 246, 0.5)'
            }
          }
        },
        {
          name: 'Final de Semana',
          type: 'bar',
          data: weekendData,
          itemStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: '#10b981' },
              { offset: 1, color: '#059669' }
            ]),
            borderRadius: [6, 6, 0, 0],
            shadowColor: 'rgba(16, 185, 129, 0.3)',
            shadowBlur: 8
          },
          label: {
            show: true,
            position: 'top',
            fontSize: 10,
            fontWeight: 600,
            color: '#1f2937',
            formatter: (params: any) => formatMetricValue(params.value, chartType, true)
          },
          emphasis: {
            itemStyle: {
              color: '#10b981',
              shadowBlur: 15,
              shadowColor: 'rgba(16, 185, 129, 0.5)'
            }
          }
        }
      ],
      dataZoom: boundaries.length > 8 ? [
        {
          type: 'slider',
          show: true,
          xAxisIndex: [0],
          start: 0,
          end: 50,
          height: 25,
          bottom: 5,
          borderColor: '#e5e7eb',
          fillerColor: 'rgba(59, 130, 246, 0.1)',
          handleStyle: {
            color: '#3b82f6',
            borderColor: '#2563eb'
          },
          textStyle: {
            fontSize: 11,
            color: '#6b7280'
          }
        }
      ] : []
    };
  };

  const getRadarChartOption = (): echarts.EChartsOption => {
    if (!data || data.length === 0) return {};

    const boundaries = [...new Set(data.map(d => d.boundary_name))];
    const firstBoundary = boundaries[0];

    const weekday = data.find(d => d.boundary_name === firstBoundary && d.day_type === 'Weekday');
    const weekend = data.find(d => d.boundary_name === firstBoundary && d.day_type === 'Weekend');

    return {
      title: {
        text: `Padrões: ${firstBoundary}`,
        left: 'center',
        top: 10,
        textStyle: {
          fontSize: 14,
          fontWeight: 600,
          color: '#111827'
        }
      },
      tooltip: {
        trigger: 'item',
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderColor: '#e5e7eb',
        borderWidth: 1,
        textStyle: { color: '#1f2937' }
      },
      legend: {
        data: ['Dia Útil', 'Final de Semana'],
        top: 40,
        textStyle: { fontSize: 12, fontWeight: 600 }
      },
      radar: {
        indicator: [
          { name: 'Manhã (%)', max: 100 },
          { name: 'Tarde (%)', max: 100 },
          { name: 'Noite (%)', max: 100 },
          { name: 'Visitas Curtas (%)', max: 100 },
          { name: 'Visitas Médias (%)', max: 100 },
          { name: 'Taxa Alertas (%)', max: 100 }
        ],
        shape: 'polygon',
        splitNumber: 4,
        center: ['50%', '60%'],
        radius: '60%',
        axisName: {
          color: '#374151',
          fontSize: 11,
          fontWeight: 600
        },
        splitLine: {
          lineStyle: { color: '#e5e7eb' }
        },
        splitArea: {
          show: true,
          areaStyle: {
            color: ['rgba(59, 130, 246, 0.05)', 'rgba(59, 130, 246, 0.1)']
          }
        },
        axisLine: {
          lineStyle: { color: '#d1d5db' }
        }
      },
      series: [
        {
          name: 'Comparação',
          type: 'radar',
          data: [
            {
              value: weekday ? [
                parseFloat(weekday.morning_percentage),
                parseFloat(weekday.afternoon_percentage),
                parseFloat(weekday.night_percentage),
                parseFloat(weekday.very_short_pct),
                parseFloat(weekday.medium_pct),
                parseFloat(weekday.alert_percentage)
              ] : [],
              name: 'Dia Útil',
              areaStyle: {
                color: 'rgba(59, 130, 246, 0.25)',
                shadowColor: 'rgba(59, 130, 246, 0.3)',
                shadowBlur: 10
              },
              lineStyle: {
                color: '#3b82f6',
                width: 3,
                shadowColor: 'rgba(59, 130, 246, 0.5)',
                shadowBlur: 8
              },
              itemStyle: {
                color: '#3b82f6',
                borderColor: '#fff',
                borderWidth: 2
              }
            },
            {
              value: weekend ? [
                parseFloat(weekend.morning_percentage),
                parseFloat(weekend.afternoon_percentage),
                parseFloat(weekend.night_percentage),
                parseFloat(weekend.very_short_pct),
                parseFloat(weekend.medium_pct),
                parseFloat(weekend.alert_percentage)
              ] : [],
              name: 'Final de Semana',
              areaStyle: {
                color: 'rgba(16, 185, 129, 0.25)',
                shadowColor: 'rgba(16, 185, 129, 0.3)',
                shadowBlur: 10
              },
              lineStyle: {
                color: '#10b981',
                width: 3,
                shadowColor: 'rgba(16, 185, 129, 0.5)',
                shadowBlur: 8
              },
              itemStyle: {
                color: '#10b981',
                borderColor: '#fff',
                borderWidth: 2
              }
            }
          ]
        }
      ]
    };
  };

  const getHeatmapOption = (): echarts.EChartsOption => {
    if (!data || data.length === 0) return {};

    const boundaries = [...new Set(data.map(d => d.boundary_name))];
    const heatmapData: any[] = [];

    boundaries.forEach((boundary, boundaryIdx) => {
      const weekday = data.find(d => d.boundary_name === boundary && d.day_type === 'Weekday');
      const weekend = data.find(d => d.boundary_name === boundary && d.day_type === 'Weekend');

      if (weekday) {
        heatmapData.push([0, boundaryIdx, parseFloat(weekday.morning_percentage)]);
        heatmapData.push([1, boundaryIdx, parseFloat(weekday.afternoon_percentage)]);
        heatmapData.push([2, boundaryIdx, parseFloat(weekday.night_percentage)]);
      }

      if (weekend) {
        heatmapData.push([3, boundaryIdx, parseFloat(weekend.morning_percentage)]);
        heatmapData.push([4, boundaryIdx, parseFloat(weekend.afternoon_percentage)]);
        heatmapData.push([5, boundaryIdx, parseFloat(weekend.night_percentage)]);
      }
    });

    return {
      tooltip: {
        position: 'top',
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderColor: '#e5e7eb',
        borderWidth: 1,
        textStyle: { color: '#1f2937' },
        formatter: (params: any) => {
          const periods = [
            'Manhã (Dia Útil)', 'Tarde (Dia Útil)', 'Noite (Dia Útil)',
            'Manhã (FDS)', 'Tarde (FDS)', 'Noite (FDS)'
          ];
          return `<div style="font-weight: bold; margin-bottom: 4px;">${boundaries[params.value[1]]}</div>
                  <div>${periods[params.value[0]]}: <strong>${params.value[2].toFixed(1)}%</strong></div>`;
        }
      },
      grid: {
        left: '18%',
        right: '5%',
        top: '8%',
        bottom: '18%'
      },
      xAxis: {
        type: 'category',
        data: ['Manhã\n(Dia Útil)', 'Tarde\n(Dia Útil)', 'Noite\n(Dia Útil)',
          'Manhã\n(FDS)', 'Tarde\n(FDS)', 'Noite\n(FDS)'],
        splitArea: { show: true },
        axisLabel: {
          fontSize: 10,
          interval: 0,
          color: '#4b5563',
          fontWeight: 500
        },
        axisLine: {
          lineStyle: { color: '#e5e7eb' }
        }
      },
      yAxis: {
        type: 'category',
        data: boundaries,
        splitArea: { show: true },
        axisLabel: {
          fontSize: 11,
          color: '#4b5563',
          fontWeight: 500
        },
        axisLine: {
          lineStyle: { color: '#e5e7eb' }
        }
      },
      visualMap: {
        min: 0,
        max: 100,
        calculable: true,
        orient: 'horizontal',
        left: 'center',
        bottom: '2%',
        inRange: {
          color: ['#e0f2fe', '#38bdf8', '#0284c7', '#075985']
        },
        text: ['Alto', 'Baixo'],
        textStyle: { fontSize: 11, color: '#374151', fontWeight: 600 }
      },
      series: [
        {
          name: 'Visitas (%)',
          type: 'heatmap',
          data: heatmapData,
          label: {
            show: true,
            formatter: (params: any) => `${params.value[2].toFixed(0)}%`,
            fontSize: 10,
            fontWeight: 600,
            color: '#1f2937'
          },
          emphasis: {
            itemStyle: {
              shadowBlur: 15,
              shadowColor: 'rgba(0, 0, 0, 0.4)',
              borderColor: '#fff',
              borderWidth: 2
            }
          }
        }
      ]
    };
  };

  const getMetricValue = (item: WeekdayWeekendData, type: ChartType): number => {
    switch (type) {
      case 'visits':
        return parseFloat(item.total_visits);
      case 'duration':
        return parseFloat(item.avg_duration_minutes);
      case 'period':
        return parseFloat(item.afternoon_percentage);
      case 'alerts':
        return parseFloat(item.alert_percentage);
      default:
        return 0;
    }
  };

  const getMetricLabel = (type: ChartType): string => {
    const labels = {
      visits: 'Total de Visitas',
      duration: 'Duração Média (min)',
      period: 'Período Tarde (%)',
      alerts: 'Taxa de Alertas (%)'
    };
    return labels[type];
  };

  const formatMetricValue = (value: number, type: ChartType, short: boolean = false): string => {
    if (value === 0) return '0';
    
    switch (type) {
      case 'visits':
        return short ? `${value}` : `${value} visitas`;
      case 'duration':
        return short ? `${value.toFixed(0)}m` : `${value.toFixed(1)} min`;
      case 'period':
      case 'alerts':
        return `${value.toFixed(1)}%`;
      default:
        return value.toString();
    }
  };

  const formatYAxisValue = (value: number, type: ChartType): string => {
    if (type === 'period' || type === 'alerts') {
      return `${value}%`;
    }
    return value.toString();
  };

  // Cálculos de estatísticas
  const weekdayTotal = data
    .filter(d => d.day_type === 'Weekday')
    .reduce((sum, d) => sum + parseFloat(d.total_visits), 0);

  const weekendTotal = data
    .filter(d => d.day_type === 'Weekend')
    .reduce((sum, d) => sum + parseFloat(d.total_visits), 0);

  const weekdayAvgDuration = data
    .filter(d => d.day_type === 'Weekday')
    .reduce((sum, d) => sum + parseFloat(d.avg_duration_minutes), 0) /
    data.filter(d => d.day_type === 'Weekday').length;

  const weekendAvgDuration = data
    .filter(d => d.day_type === 'Weekend')
    .reduce((sum, d) => sum + parseFloat(d.avg_duration_minutes), 0) /
    data.filter(d => d.day_type === 'Weekend').length;

  const showLoading = loading;
  const showEmpty = !loading && (!data || data.length === 0);
  const showChart = !loading && data && data.length > 0;

  return (
    <div className="bg-white rounded-2xl border-2 border-[#E2E8F0] shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#3b82f6] to-[#2563eb] p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center">
              <CalendarIcon className="w-8 h-8 text-white" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-white mb-1">{title}</h3>
              <p className="text-white/80 text-sm">
                Comparativo de padrões de visitação e comportamento
              </p>
            </div>
          </div>

          {showChart && (
            <div className="hidden lg:flex items-center gap-4">
              <div className="px-6 py-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20">
                <p className="text-xs text-white/80 font-medium">Dia Útil</p>
                <p className="text-xl font-bold text-white">{weekdayTotal.toLocaleString()}</p>
                <p className="text-xs text-white/70">visitas</p>
              </div>
              <div className="px-6 py-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20">
                <p className="text-xs text-white/80 font-medium">Final de Semana</p>
                <p className="text-xl font-bold text-white">{weekendTotal.toLocaleString()}</p>
                <p className="text-xs text-white/70">visitas</p>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="p-6 bg-gradient-to-b from-blue-50/30 to-white">
        {/* Controls */}
        {showChart && (
          <div className="mb-6 flex flex-wrap gap-3">
            {/* View Mode */}
            <div className="flex items-center gap-2 p-1 bg-gray-100 rounded-xl">
              <button
                onClick={() => setViewMode('bar')}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                  viewMode === 'bar'
                    ? 'bg-white text-blue-600 shadow-md'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <ChartBarIcon className="w-4 h-4 inline mr-1" />
                Barras
              </button>
              <button
                onClick={() => setViewMode('radar')}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                  viewMode === 'radar'
                    ? 'bg-white text-blue-600 shadow-md'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Radar
              </button>
              <button
                onClick={() => setViewMode('heatmap')}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                  viewMode === 'heatmap'
                    ? 'bg-white text-blue-600 shadow-md'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Heatmap
              </button>
            </div>

            {/* Metric Selection (only for bar chart) */}
            {viewMode === 'bar' && (
              <div className="flex items-center gap-2 p-1 bg-gray-100 rounded-xl">
                <button
                  onClick={() => setChartType('visits')}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                    chartType === 'visits'
                      ? 'bg-white text-blue-600 shadow-md'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Visitas
                </button>
                <button
                  onClick={() => setChartType('duration')}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                    chartType === 'duration'
                      ? 'bg-white text-blue-600 shadow-md'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Duração
                </button>
                <button
                  onClick={() => setChartType('alerts')}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                    chartType === 'alerts'
                      ? 'bg-white text-blue-600 shadow-md'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Alertas
                </button>
              </div>
            )}
          </div>
        )}

        {/* Loading State */}
        {showLoading && (
          <div className="flex items-center justify-center h-[500px]">
            <div className="flex flex-col items-center gap-3">
              <ArrowPathIcon className="w-8 h-8 text-blue-500 animate-spin" />
              <p className="text-gray-600 text-sm">Carregando análise comparativa...</p>
            </div>
          </div>
        )}

        {/* Empty State */}
        {showEmpty && (
          <div className="flex items-center justify-center h-[500px]">
            <div className="text-center">
              <CalendarIcon className="w-16 h-16 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 font-medium">Nenhum dado disponível</p>
              <p className="text-gray-400 text-sm mt-1">
                Não há dados suficientes para análise comparativa
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
              style={{ height: viewMode === 'heatmap' ? '600px' : '500px' }}
            />
          </div>

          {/* Stats Cards */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border-2 border-blue-200">
              <p className="text-xs text-blue-600 font-semibold mb-1">DIA ÚTIL - VISITAS</p>
              <p className="text-2xl font-bold text-blue-900">{weekdayTotal.toLocaleString()}</p>
            </div>
            <div className="p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-xl border-2 border-green-200">
              <p className="text-xs text-green-600 font-semibold mb-1">FIM DE SEMANA - VISITAS</p>
              <p className="text-2xl font-bold text-green-900">{weekendTotal.toLocaleString()}</p>
            </div>
            <div className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl border-2 border-purple-200">
              <p className="text-xs text-purple-600 font-semibold mb-1">DIA ÚTIL - DURAÇÃO MÉDIA</p>
              <p className="text-2xl font-bold text-purple-900">{weekdayAvgDuration.toFixed(0)}m</p>
            </div>
            <div className="p-4 bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl border-2 border-orange-200">
              <p className="text-xs text-orange-600 font-semibold mb-1">FIM DE SEMANA - DURAÇÃO MÉDIA</p>
              <p className="text-2xl font-bold text-orange-900">{weekendAvgDuration.toFixed(0)}m</p>
            </div>
          </div>

          {/* Footer Info */}
          <div className="mt-4 flex items-center justify-between px-2">
            <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-xl border border-blue-200">
              <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <span className="text-xs text-blue-700 font-medium">
                Passe o mouse sobre os elementos para mais detalhes
              </span>
            </div>

            <div className="text-xs text-gray-500">
              Atualizado em: <span className="font-semibold text-gray-700">{new Date().toLocaleString('pt-BR')}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WeekdayWeekendComparison;