// src/components/BoundaryAccessAnalytics/Components/EnhancedHeatmap.tsx
import { useState, useEffect, useRef } from 'react';
import * as echarts from 'echarts';
import { t } from 'i18next';
import { useTheme } from '../../../context/ThemeContext';
import {
  FunnelIcon,
  CalendarIcon,
  ClockIcon,
  ChartBarIcon,
  FireIcon,
  MoonIcon,
  SunIcon,
  InformationCircleIcon,
  SparklesIcon,
  ChartPieIcon,
  MagnifyingGlassPlusIcon
} from '@heroicons/react/24/outline';

interface HeatmapData {
  entry_hour: number;
  entry_day_of_week: number;
  total_entries: string;
  total_duration: string;
  avg_duration_minutes: string;
}

interface EnhancedHeatmapProps {
  data: HeatmapData[];
  loading: boolean;
}

type ViewMode = 'duration' | 'frequency' | 'intensity';
type TimeFilter = 'all' | 'business' | 'after-hours' | 'weekend';

const EnhancedHeatmap: React.FC<EnhancedHeatmapProps> = ({ data, loading }) => {
  const { darkMode } = useTheme();
  const chartRef = useRef<HTMLDivElement>(null);
  const [chartInstance, setChartInstance] = useState<echarts.ECharts | null>(null);
  
  // Estados de filtros
  const [viewMode, setViewMode] = useState<ViewMode>('duration');
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('all');
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [selectedHour, setSelectedHour] = useState<number | null>(null);

  const days = t('boundaryAccessAnalytics.charts.weeklyPattern.days', { returnObjects: true }) as string[];
  const daysFullName = t('boundaryAccessAnalytics.enhancedHeatmap.daysFullName', { returnObjects: true }) as string[];

  // Cores para o dark mode
  const getChartColors = (darkMode: boolean) => ({
    background: darkMode ? '#1F2937' : '#FFFFFF',
    text: darkMode ? '#E5E7EB' : '#1A2332',
    textSecondary: darkMode ? '#9CA3AF' : '#64748B',
    grid: darkMode ? '#374151' : '#E2E8F0',
    primary: darkMode ? '#60A5FA' : '#0F4C81',
    accent: darkMode ? '#FB923C' : '#FF6B35',
  });

  const colors = getChartColors(darkMode);

  // Filtrar dados baseado nos filtros ativos
  const getFilteredData = () => {
    let filtered = [...data];

    // Filtro de período
    if (timeFilter === 'business') {
      // Segunda a Sexta, 6h-18h
      filtered = filtered.filter(d => 
        d.entry_day_of_week >= 2 && d.entry_day_of_week <= 6 &&
        d.entry_hour >= 6 && d.entry_hour < 18
      );
    } else if (timeFilter === 'after-hours') {
      // Fora do horário comercial
      filtered = filtered.filter(d => 
        d.entry_hour < 6 || d.entry_hour >= 18
      );
    } else if (timeFilter === 'weekend') {
      // Sábado e Domingo
      filtered = filtered.filter(d => 
        d.entry_day_of_week === 7 || d.entry_day_of_week === 1
      );
    }

    // Filtro de dia específico
    if (selectedDay !== null) {
      filtered = filtered.filter(d => d.entry_day_of_week === selectedDay);
    }

    // Filtro de hora específica
    if (selectedHour !== null) {
      filtered = filtered.filter(d => d.entry_hour === selectedHour);
    }

    return filtered;
  };

  // Calcular estatísticas
  const calculateStats = () => {
    const filtered = getFilteredData();
    
    const totalEntries = filtered.reduce((sum, d) => sum + parseInt(d.total_entries), 0);
    const totalDuration = filtered.reduce((sum, d) => sum + parseFloat(d.total_duration), 0);
    const avgDuration = totalEntries > 0 ? (totalDuration * 60) / totalEntries : 0;

    // Encontrar pico
    const peakData = filtered.reduce((max, d) => {
      const value = viewMode === 'duration' 
        ? parseFloat(d.avg_duration_minutes)
        : parseInt(d.total_entries);
      
      const maxValue = viewMode === 'duration'
        ? parseFloat(max.avg_duration_minutes)
        : parseInt(max.total_entries);

      return value > maxValue ? d : max;
    }, filtered[0] || { entry_hour: 0, entry_day_of_week: 1, total_entries: '0', avg_duration_minutes: '0' });

    // Calcular intensidade por período
    const morningData = filtered.filter(d => d.entry_hour >= 6 && d.entry_hour < 12);
    const afternoonData = filtered.filter(d => d.entry_hour >= 12 && d.entry_hour < 18);
    const nightData = filtered.filter(d => d.entry_hour >= 18 || d.entry_hour < 6);

    const morningActivity = morningData.reduce((sum, d) => sum + parseInt(d.total_entries), 0);
    const afternoonActivity = afternoonData.reduce((sum, d) => sum + parseInt(d.total_entries), 0);
    const nightActivity = nightData.reduce((sum, d) => sum + parseInt(d.total_entries), 0);

    const totalActivity = morningActivity + afternoonActivity + nightActivity;

    return {
      totalEntries,
      totalDuration: totalDuration.toFixed(1),
      avgDuration: avgDuration.toFixed(0),
      peakHour: peakData.entry_hour,
      peakDay: peakData.entry_day_of_week,
      peakValue: viewMode === 'duration' 
        ? parseFloat(peakData.avg_duration_minutes).toFixed(0)
        : peakData.total_entries,
      morningPct: totalActivity > 0 ? ((morningActivity / totalActivity) * 100).toFixed(1) : '0',
      afternoonPct: totalActivity > 0 ? ((afternoonActivity / totalActivity) * 100).toFixed(1) : '0',
      nightPct: totalActivity > 0 ? ((nightActivity / totalActivity) * 100).toFixed(1) : '0',
    };
  };

  const stats = data.length > 0 ? calculateStats() : null;

  // Inicializar e atualizar gráfico
  useEffect(() => {
    if (!chartRef.current || data.length === 0) return;

    const chart = chartInstance || echarts.init(chartRef.current);
    if (!chartInstance) setChartInstance(chart);

    const filtered = getFilteredData();

    // Preparar dados baseado no modo de visualização
    const heatmapData = filtered.map(d => {
      let value: number;
      
      if (viewMode === 'duration') {
        value = parseFloat(d.avg_duration_minutes);
      } else if (viewMode === 'frequency') {
        value = parseInt(d.total_entries);
      } else { // intensity
        value = parseFloat(d.avg_duration_minutes) * parseInt(d.total_entries);
      }

      return [
        d.entry_hour,
        d.entry_day_of_week - 1,
        value,
        parseInt(d.total_entries),
        parseFloat(d.avg_duration_minutes)
      ];
    });

    // Calcular max para escala
    const maxValue = Math.max(...heatmapData.map(d => d[2]));

    // Definir cores baseado no modo
    let colorRange: string[];
    
    if (viewMode === 'duration') {
      colorRange = darkMode 
        ? ['#1e3a5f', '#2563eb', '#3b82f6', '#fb923c', '#f97316', '#dc2626']
        : ['#dbeafe', '#93c5fd', '#3b82f6', '#fb923c', '#f97316', '#dc2626'];
    } else if (viewMode === 'frequency') {
      colorRange = darkMode
        ? ['#1e3a5f', '#2563eb', '#3b82f6', '#10b981', '#059669', '#047857']
        : ['#dbeafe', '#93c5fd', '#3b82f6', '#10b981', '#059669', '#047857'];
    } else {
      colorRange = darkMode
        ? ['#1e3a5f', '#7c3aed', '#a855f7', '#fb923c', '#f97316', '#dc2626']
        : ['#f3e8ff', '#c084fc', '#a855f7', '#fb923c', '#f97316', '#dc2626'];
    }

    const option: echarts.EChartsOption = {
      backgroundColor: colors.background,
      title: {
        text: viewMode === 'duration' 
          ? t('boundaryAccessAnalytics.enhancedHeatmap.titles.duration')
          : viewMode === 'frequency'
          ? t('boundaryAccessAnalytics.enhancedHeatmap.titles.frequency')
          : t('boundaryAccessAnalytics.enhancedHeatmap.titles.intensity'),
        left: 'center',
        top: 10,
        textStyle: {
          color: colors.text,
          fontSize: 16,
          fontWeight: 'bold'
        }
      },
      tooltip: {
        position: 'top',
        backgroundColor: darkMode ? '#374151' : '#FFFFFF',
        borderColor: colors.grid,
        borderWidth: 2,
        textStyle: {
          color: colors.text
        },
        formatter: (params: any) => {
          const hour = params.value[0];
          const dayIndex = params.value[1];
          const value = params.value[2];
          const entries = params.value[3];
          const avgDuration = params.value[4];
          
          return `
            <div style="padding: 12px; min-width: 200px;">
              <div style="font-weight: bold; margin-bottom: 12px; color: ${colors.text}; font-size: 14px; border-bottom: 2px solid ${colors.grid}; padding-bottom: 8px;">
                📅 ${daysFullName[dayIndex]} - ${hour}:00
              </div>
              <div style="display: flex; flex-direction: column; gap: 8px;">
                <div style="display: flex; justify-content: space-between; align-items: center; gap: 20px;">
                  <span style="color: ${colors.textSecondary}; display: flex; align-items: center; gap: 6px;">
                    <span style="font-size: 16px;">📊</span>
                    ${t('boundaryAccessAnalytics.enhancedHeatmap.tooltip.entries')}:
                  </span>
                  <span style="font-weight: bold; color: #3b82f6; font-size: 15px;">${entries}</span>
                </div>
                <div style="display: flex; justify-content: space-between; align-items: center; gap: 20px;">
                  <span style="color: ${colors.textSecondary}; display: flex; align-items: center; gap: 6px;">
                    <span style="font-size: 16px;">⏱️</span>
                    ${t('boundaryAccessAnalytics.enhancedHeatmap.tooltip.avgDuration')}:
                  </span>
                  <span style="font-weight: bold; color: #fb923c; font-size: 15px;">${avgDuration.toFixed(0)} min</span>
                </div>
                <div style="display: flex; justify-content: space-between; align-items: center; gap: 20px;">
                  <span style="color: ${colors.textSecondary}; display: flex; align-items: center; gap: 6px;">
                    <span style="font-size: 16px;">🔥</span>
                    ${t('boundaryAccessAnalytics.enhancedHeatmap.tooltip.intensity')}:
                  </span>
                  <span style="font-weight: bold; color: ${colors.primary}; font-size: 15px;">${((value / maxValue) * 100).toFixed(0)}%</span>
                </div>
              </div>
            </div>
          `;
        }
      },
      grid: { 
        height: '60%', 
        top: '18%',
        left: '100px',
        right: '100px',
        bottom: '18%'
      },
      xAxis: {
        type: 'category',
        data: Array.from({ length: 24 }, (_, i) => {
          if (i % 3 === 0) return i + 'h';
          return i + 'h';
        }),
        splitArea: { 
          show: true,
          areaStyle: {
            color: darkMode 
              ? ['rgba(55, 65, 81, 0.15)', 'rgba(55, 65, 81, 0.05)']
              : ['rgba(250, 250, 250, 0.5)', 'rgba(245, 245, 245, 0.3)']
          }
        },
        axisLabel: {
          color: colors.textSecondary,
          fontSize: 11,
          fontWeight: 'bold',
          interval: 0,
          rotate: 45
        },
        axisLine: {
          lineStyle: {
            color: colors.grid,
            width: 2
          }
        }
      },
      yAxis: {
        type: 'category',
        data: days,
        splitArea: { 
          show: true,
          areaStyle: {
            color: darkMode 
              ? ['rgba(55, 65, 81, 0.15)', 'rgba(55, 65, 81, 0.05)']
              : ['rgba(250, 250, 250, 0.5)', 'rgba(245, 245, 245, 0.3)']
          }
        },
        axisLabel: {
          color: colors.text,
          fontSize: 13,
          fontWeight: 'bold'
        },
        axisLine: {
          lineStyle: {
            color: colors.grid,
            width: 2
          }
        }
      },
      visualMap: {
        min: 0,
        max: maxValue,
        calculable: true,
        orient: 'horizontal',
        left: 'center',
        bottom: '3%',
        text: [
          t('boundaryAccessAnalytics.enhancedHeatmap.legend.high'),
          t('boundaryAccessAnalytics.enhancedHeatmap.legend.low')
        ],
        textStyle: {
          color: colors.text,
          fontSize: 12,
          fontWeight: 'bold'
        },
        inRange: {
          color: colorRange
        }
      },
      series: [{
        type: 'heatmap',
        data: heatmapData,
        label: { 
          show: false
        },
        emphasis: {
          itemStyle: {
            shadowBlur: 20,
            shadowColor: darkMode ? 'rgba(96, 165, 250, 0.6)' : 'rgba(15, 76, 129, 0.6)',
            borderWidth: 3,
            borderColor: colors.primary
          },
          label: {
            show: true,
            formatter: (params: any) => {
              const entries = params.value[3];
              const avgDuration = params.value[4];
              return `${entries}\n${avgDuration.toFixed(0)}m`;
            },
            color: '#ffffff',
            fontSize: 11,
            fontWeight: 'bold',
            backgroundColor: 'rgba(0,0,0,0.7)',
            padding: 4,
            borderRadius: 4
          }
        },
        itemStyle: {
          borderWidth: 2,
          borderColor: colors.background
        }
      }]
    };
    
    chart.setOption(option);

    const handleResize = () => chart.resize();
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [data, viewMode, timeFilter, selectedDay, selectedHour, darkMode]);

  if (loading) {
    return (
      <div className="w-full h-[600px] flex items-center justify-center">
        <div className="text-center">
          <div className="relative w-20 h-20 mx-auto mb-4">
            <div className={`absolute inset-0 border-4 rounded-full ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}></div>
            <div className={`absolute inset-0 border-4 border-t-transparent rounded-full animate-spin ${darkMode ? 'border-blue-500' : 'border-[#0F4C81]'}`}></div>
          </div>
          <p className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            {t('boundaryAccessAnalytics.enhancedHeatmap.loading')}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`rounded-2xl border-2 shadow-lg overflow-hidden transition-all duration-300 ${
      darkMode 
        ? 'bg-gray-800 border-gray-700' 
        : 'bg-white border-gray-200'
    }`}>
      {/* Header com filtros */}
      <div className={`p-6 border-b-2 ${darkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50'}`}>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
              darkMode ? 'bg-blue-500/20' : 'bg-blue-100'
            }`}>
              <CalendarIcon className={`w-6 h-6 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} />
            </div>
            <div>
              <h3 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {t('boundaryAccessAnalytics.enhancedHeatmap.title')}
              </h3>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                {t('boundaryAccessAnalytics.enhancedHeatmap.subtitle')}
              </p>
            </div>
          </div>
        </div>


             {/* ✅ NOVA SEÇÃO: Descrição do Objetivo - Versão Compacta */}
<div className={`mb-4 p-3 rounded-lg border-l-4 ${
  darkMode 
    ? 'bg-blue-500/10 border-blue-500 text-gray-300' 
    : 'bg-blue-50 border-blue-500 text-gray-700'
}`}>
  <div className="flex items-start gap-2">
    <InformationCircleIcon className={`w-4 h-4 flex-shrink-0 mt-0.5 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} />
    <div className="flex-1">
      <h4 className={`font-bold text-xs mb-1 ${darkMode ? 'text-blue-400' : 'text-blue-700'}`}>
        {t('boundaryAccessAnalytics.enhancedHeatmap.purpose.title')}
      </h4>
      <p className="text-xs leading-relaxed mb-2">
        {t('boundaryAccessAnalytics.enhancedHeatmap.purpose.description')}
      </p>
      <div className={`flex flex-wrap gap-1.5 text-[10px] ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md ${
          darkMode ? 'bg-gray-700' : 'bg-white border border-gray-200'
        }`}>
          <SparklesIcon className="w-3 h-3" />
          {t('boundaryAccessAnalytics.enhancedHeatmap.purpose.goals.patterns')}
        </span>
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md ${
          darkMode ? 'bg-gray-700' : 'bg-white border border-gray-200'
        }`}>
          <ClockIcon className="w-3 h-3" />
          {t('boundaryAccessAnalytics.enhancedHeatmap.purpose.goals.peaks')}
        </span>
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md ${
          darkMode ? 'bg-gray-700' : 'bg-white border border-gray-200'
        }`}>
          <ChartPieIcon className="w-3 h-3" />
          {t('boundaryAccessAnalytics.enhancedHeatmap.purpose.goals.optimize')}
        </span>
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md ${
          darkMode ? 'bg-gray-700' : 'bg-white border border-gray-200'
        }`}>
          <MagnifyingGlassPlusIcon className="w-3 h-3" />
          {t('boundaryAccessAnalytics.enhancedHeatmap.purpose.goals.anomalies')}
        </span>
      </div>
    </div>
  </div>
</div>



        {/* Filtros */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Modo de Visualização */}
          <div>
            <label className={`block text-xs font-bold mb-2 uppercase tracking-wider ${
              darkMode ? 'text-gray-400' : 'text-gray-600'
            }`}>
              <ChartBarIcon className="w-4 h-4 inline mr-1" />
              {t('boundaryAccessAnalytics.enhancedHeatmap.filters.viewMode')}
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => setViewMode('duration')}
                className={`px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                  viewMode === 'duration'
                    ? darkMode
                      ? 'bg-blue-600 text-white shadow-lg scale-105'
                      : 'bg-blue-600 text-white shadow-lg scale-105'
                    : darkMode
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <ClockIcon className="w-4 h-4 inline mr-1" />
                {t('boundaryAccessAnalytics.enhancedHeatmap.filters.duration')}
              </button>
              <button
                onClick={() => setViewMode('frequency')}
                className={`px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                  viewMode === 'frequency'
                    ? darkMode
                      ? 'bg-green-600 text-white shadow-lg scale-105'
                      : 'bg-green-600 text-white shadow-lg scale-105'
                    : darkMode
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <ChartBarIcon className="w-4 h-4 inline mr-1" />
                {t('boundaryAccessAnalytics.enhancedHeatmap.filters.frequency')}
              </button>
              <button
                onClick={() => setViewMode('intensity')}
                className={`px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                  viewMode === 'intensity'
                    ? darkMode
                      ? 'bg-purple-600 text-white shadow-lg scale-105'
                      : 'bg-purple-600 text-white shadow-lg scale-105'
                    : darkMode
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <FireIcon className="w-4 h-4 inline mr-1" />
                {t('boundaryAccessAnalytics.enhancedHeatmap.filters.intensity')}
              </button>
            </div>
          </div>

          {/* Filtro de Período */}
          <div>
            <label className={`block text-xs font-bold mb-2 uppercase tracking-wider ${
              darkMode ? 'text-gray-400' : 'text-gray-600'
            }`}>
              <FunnelIcon className="w-4 h-4 inline mr-1" />
              {t('boundaryAccessAnalytics.enhancedHeatmap.filters.timePeriod')}
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setTimeFilter('all')}
                className={`px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                  timeFilter === 'all'
                    ? darkMode
                      ? 'bg-blue-600 text-white shadow-lg'
                      : 'bg-blue-600 text-white shadow-lg'
                    : darkMode
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {t('boundaryAccessAnalytics.enhancedHeatmap.filters.all')}
              </button>
              <button
                onClick={() => setTimeFilter('business')}
                className={`px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                  timeFilter === 'business'
                    ? darkMode
                      ? 'bg-blue-600 text-white shadow-lg'
                      : 'bg-blue-600 text-white shadow-lg'
                    : darkMode
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <SunIcon className="w-3 h-3 inline mr-1" />
                {t('boundaryAccessAnalytics.enhancedHeatmap.filters.business')}
              </button>
              <button
                onClick={() => setTimeFilter('after-hours')}
                className={`px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                  timeFilter === 'after-hours'
                    ? darkMode
                      ? 'bg-blue-600 text-white shadow-lg'
                      : 'bg-blue-600 text-white shadow-lg'
                    : darkMode
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <MoonIcon className="w-3 h-3 inline mr-1" />
                {t('boundaryAccessAnalytics.enhancedHeatmap.filters.afterHours')}
              </button>
              <button
                onClick={() => setTimeFilter('weekend')}
                className={`px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                  timeFilter === 'weekend'
                    ? darkMode
                      ? 'bg-blue-600 text-white shadow-lg'
                      : 'bg-blue-600 text-white shadow-lg'
                    : darkMode
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {t('boundaryAccessAnalytics.enhancedHeatmap.filters.weekend')}
              </button>
            </div>
          </div>

          {/* Botão Limpar Filtros */}
          <div className="flex items-end">
            <button
              onClick={() => {
                setTimeFilter('all');
                setSelectedDay(null);
                setSelectedHour(null);
                setViewMode('duration');
              }}
              className={`w-full px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                darkMode
                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600 border border-gray-600'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border-2 border-gray-300'
              }`}
            >
              {t('boundaryAccessAnalytics.enhancedHeatmap.filters.clearAll')}
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className={`grid grid-cols-2 md:grid-cols-4 gap-4 p-6 border-b-2 ${
          darkMode ? 'border-gray-700 bg-gray-800/50' : 'border-gray-200 bg-gray-50'
        }`}>
          <div className={`p-4 rounded-xl ${darkMode ? 'bg-gray-700' : 'bg-white border border-gray-200'}`}>
            <div className={`text-xs font-semibold mb-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              📊 {t('boundaryAccessAnalytics.enhancedHeatmap.stats.totalEntries')}
            </div>
            <div className={`text-2xl font-bold ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>
              {stats.totalEntries.toLocaleString()}
            </div>
          </div>

          <div className={`p-4 rounded-xl ${darkMode ? 'bg-gray-700' : 'bg-white border border-gray-200'}`}>
            <div className={`text-xs font-semibold mb-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              ⏱️ {t('boundaryAccessAnalytics.enhancedHeatmap.stats.avgDuration')}
            </div>
            <div className={`text-2xl font-bold ${darkMode ? 'text-orange-400' : 'text-orange-600'}`}>
              {stats.avgDuration} min
            </div>
          </div>

          <div className={`p-4 rounded-xl ${darkMode ? 'bg-gray-700' : 'bg-white border border-gray-200'}`}>
            <div className={`text-xs font-semibold mb-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              🔥 {t('boundaryAccessAnalytics.enhancedHeatmap.stats.peakTime')}
            </div>
            <div className={`text-lg font-bold ${darkMode ? 'text-red-400' : 'text-red-600'}`}>
              {daysFullName[stats.peakDay - 1]} {stats.peakHour}:00
            </div>
          </div>

          <div className={`p-4 rounded-xl ${darkMode ? 'bg-gray-700' : 'bg-white border border-gray-200'}`}>
            <div className={`text-xs font-semibold mb-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              📈 {t('boundaryAccessAnalytics.enhancedHeatmap.stats.distribution')}
            </div>
            <div className="flex gap-2 text-xs font-bold">
              <span className="text-yellow-600">🌅 {stats.morningPct}%</span>
              <span className="text-orange-600">☀️ {stats.afternoonPct}%</span>
              <span className="text-blue-600">🌙 {stats.nightPct}%</span>
            </div>
          </div>
        </div>
      )}

      {/* Chart */}
      <div className="p-6">
        <div ref={chartRef} className="w-full h-[600px]"></div>
      </div>

      {/* Legenda explicativa */}
      <div className={`p-6 border-t-2 ${darkMode ? 'border-gray-700 bg-gray-800/50' : 'border-gray-200 bg-blue-50'}`}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className={`flex items-start gap-3 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            <ClockIcon className={`w-5 h-5 flex-shrink-0 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} />
            <div>
              <span className="font-bold">{t('boundaryAccessAnalytics.enhancedHeatmap.legend.durationMode')}:</span> {t('boundaryAccessAnalytics.enhancedHeatmap.legend.durationDesc')}
            </div>
          </div>
          <div className={`flex items-start gap-3 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            <ChartBarIcon className={`w-5 h-5 flex-shrink-0 ${darkMode ? 'text-green-400' : 'text-green-600'}`} />
            <div>
              <span className="font-bold">{t('boundaryAccessAnalytics.enhancedHeatmap.legend.frequencyMode')}:</span> {t('boundaryAccessAnalytics.enhancedHeatmap.legend.frequencyDesc')}
            </div>
          </div>
          <div className={`flex items-start gap-3 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            <FireIcon className={`w-5 h-5 flex-shrink-0 ${darkMode ? 'text-purple-400' : 'text-purple-600'}`} />
            <div>
              <span className="font-bold">{t('boundaryAccessAnalytics.enhancedHeatmap.legend.intensityMode')}:</span> {t('boundaryAccessAnalytics.enhancedHeatmap.legend.intensityDesc')}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedHeatmap;