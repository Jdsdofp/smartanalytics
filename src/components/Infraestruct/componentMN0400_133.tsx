// src/components/BoundaryAccessAnalytics.tsx
import { useState, useEffect, useRef } from 'react';
import * as echarts from 'echarts';
import {
  ChartBarIcon,
  ClockIcon,
  FireIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon,
  ShieldCheckIcon,
  TrophyIcon,
  ArrowUpIcon,
  ArrowDownIcon
} from '@heroicons/react/24/outline';
import { t } from 'i18next';
import { useBoundaryAnalytics } from '../../hooks/useBoundaryAnalytics';
import { useCompany } from '../../hooks/useCompany';
import BoundaryHeatmap from './Components/BoundaryHeatmap';
import BoundaryTransitionSankey from './Components/BoundaryDurationChart';
import WeekdayWeekendComparison from './Components/WeekdayWeekendComparison';
import BoundaryTrendsChart from './Components/BoundaryTrendsChart';
import BoundaryAnomaliesChart from './Components/BoundaryAnomaliesChart';
import { useTheme } from '../../context/ThemeContext';
import EnhancedHeatmap from './Components/EnhancedHeatmap';



// ✅ ADICIONAR função helper para cores do dark mode
const getChartColors = (darkMode: boolean) => ({
  // Cores principais
  primary: darkMode ? '#60A5FA' : '#0F4C81',
  primaryDark: darkMode ? '#3B82F6' : '#0284c7',
  accent: darkMode ? '#FB923C' : '#FF6B35',

  // Cores de fundo
  backgroundColor: darkMode ? '#1F2937' : '#FFFFFF',
  gridColor: darkMode ? '#374151' : '#E2E8F0',

  // Cores de texto
  textColor: darkMode ? '#E5E7EB' : '#1A2332',
  textColorSecondary: darkMode ? '#9CA3AF' : '#64748B',

  // Cores para séries
  series: {
    blue: darkMode ? '#60A5FA' : '#0F4C81',
    orange: darkMode ? '#FB923C' : '#FF6B35',
    green: darkMode ? '#34D399' : '#10B981',
    red: darkMode ? '#F87171' : '#EF4444',
    yellow: darkMode ? '#FBBF24' : '#F59E0B',
    purple: darkMode ? '#A78BFA' : '#A855F7',
    gray: darkMode ? '#6B7280' : '#64748B',
  },

  // Gradientes
  gradients: {
    primary: darkMode
      ? ['#60A5FA', '#3B82F6']
      : ['#0F4C81', '#FF6B35'],
    success: darkMode
      ? ['#34D399', '#10B981']
      : ['#10B981', '#059669'],
    warning: darkMode
      ? ['#FBBF24', '#F59E0B']
      : ['#F59E0B', '#D97706'],
  }
});



// Componente de Loading para os gráficos
const ChartLoader = () => {
  const { darkMode } = useTheme();
  return (
    <div className="w-full h-full flex items-center justify-center">
      <div className="text-center">
        <div className="relative w-16 h-16 mx-auto mb-4">
          <div className={`absolute top-0 left-0 w-full h-full border-4 rounded-full ${darkMode ? 'border-gray-700' : 'border-[#E2E8F0]'
            }`}></div>
          <div className={`absolute top-0 left-0 w-full h-full border-4 border-t-transparent rounded-full animate-spin ${darkMode ? 'border-blue-500' : 'border-[#0F4C81]'
            }`}></div>
        </div>
        <p className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-[#64748B]'
          }`}>
          {t('boundaryAccessAnalytics.tabs.load')}
        </p>
      </div>
    </div>
  );
};


// Criar hook de debounce
const useDebounce = (value: string, delay: number) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};


export default function BoundaryAccessAnalytics() {
  const { darkMode } = useTheme();
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedPeriod, setSelectedPeriod] = useState<'7d' | '30d' | '90d'>('30d');
  const [chartLoadingStates, setChartLoadingStates] = useState<Record<string, boolean>>({});
  // Adicionar estados de filtro no início do componente
  const [realTimeFilters, setRealTimeFilters] = useState({
    itemName: '',
    boundaryName: '',
    status: '',
    minDuration: '',
    maxDuration: '',
    page: 1,
    limit: 20
  });
  //@ts-ignore
  const [tempFilters, setTempFilters] = useState({
    itemName: '',
    boundaryName: '',
    status: '',
    minDuration: '',
    maxDuration: '',
    page: 1,
    limit: 20
  });

  const debouncedItemName = useDebounce(tempFilters.itemName, 500);
  const debouncedBoundaryName = useDebounce(tempFilters.boundaryName, 500);

  const { companyId } = useCompany()

  // Custom hook para gerenciar todos os dados
  const {
    kpis,
    topBoundaries,
    shiftDistribution,
    timeSeries,
    weeklyTrends,
    weeklyPattern,
    heatmap,
    anomalies,
    anomalyKpis,
    topAnomalies,
    sankeyData,
    topTransitions,
    durationBuckets,
    alertRate,
    complianceSummary,
    complianceMetrics,
    topPeople,
    frequencyAnalysis,
    detailedRanking,
    realTimeStatus,
    realTimePagination,
    realTimeLoading,
    filterOptions,
    filterOptionsLoading,
    boundaryTransitionsByDuration,
    weekdayWeekendData,
    boundaryTrends,
    boundaryAnomalies,
    boundaryMapData,
    activeZones,
    loading,
    error
  } = useBoundaryAnalytics(companyId as any, activeTab, selectedPeriod, realTimeFilters);

  const chartRefs = {
    topBoundaries: useRef(null),
    shiftDistribution: useRef(null),
    timeseries: useRef(null),
    weeklyTrends: useRef(null),
    weeklyPattern: useRef(null),
    heatmap: useRef(null),
    anomalies: useRef(null),
    sankey: useRef(null),
    topTransitions: useRef(null),
    durationBuckets: useRef(null),
    alertRate: useRef(null),
    topPeople: useRef(null),
    frequency: useRef(null)
  };

  // Atualizar estados de loading baseado na aba ativa e dados disponíveis
  useEffect(() => {
    const newLoadingStates: Record<string, boolean> = {};

    if (activeTab === 'overview') {
      newLoadingStates.topBoundaries = topBoundaries.length === 0;
      newLoadingStates.shiftDistribution = !shiftDistribution;
      newLoadingStates.boundaryMap = boundaryMapData.length === 0;
      newLoadingStates.boundaryTransitions = boundaryTransitionsByDuration.length === 0; // ✅ ADICIONAR
      newLoadingStates.weekdayWeekendData = weekdayWeekendData.length === 0;
      newLoadingStates.boundaryTrends = boundaryTrends.length === 0;

    } else if (activeTab === 'temporal') {
      newLoadingStates.timeseries = timeSeries.length === 0;
      newLoadingStates.weeklyTrends = weeklyTrends.length === 0;
      newLoadingStates.weeklyPattern = weeklyPattern.length === 0;
    } else if (activeTab === 'heatmap') {
      newLoadingStates.heatmap = heatmap.length === 0;
    } else if (activeTab === 'anomalies') {
      newLoadingStates.anomalies = anomalies.length === 0;
      newLoadingStates.topAnomalies = topAnomalies.length === 0;
      newLoadingStates.boundaryAnomalies = boundaryAnomalies.length === 0;
    } else if (activeTab === 'flow') {
      newLoadingStates.sankey = sankeyData.length === 0;
      newLoadingStates.topTransitions = topTransitions.length === 0;
    } else if (activeTab === 'compliance') {
      newLoadingStates.durationBuckets = !durationBuckets;
      newLoadingStates.alertRate = alertRate.length === 0;
      newLoadingStates.complianceSummary = complianceSummary.length === 0;
    } else if (activeTab === 'rankings') {
      newLoadingStates.topPeople = topPeople.length === 0;
      newLoadingStates.frequency = frequencyAnalysis.length === 0;
      newLoadingStates.detailedRanking = detailedRanking.length === 0;
    }

    setChartLoadingStates(newLoadingStates);
  }, [
    activeTab,
    topBoundaries,
    shiftDistribution,
    boundaryMapData,
    timeSeries,
    weeklyTrends,
    weeklyPattern,
    heatmap,
    anomalies,
    anomalyKpis,
    topAnomalies,
    sankeyData,
    topTransitions,
    durationBuckets,
    alertRate,
    complianceSummary,
    topPeople,
    frequencyAnalysis,
    boundaryTransitionsByDuration,
    boundaryTrends,
    detailedRanking
  ]);

  useEffect(() => {
    const timer = setTimeout(() => {
      initCharts(activeTab);
    }, 100);

    const handleResize = () => {
      Object.values(chartRefs).forEach(ref => {
        if (ref.current) {
          const instance = echarts.getInstanceByDom(ref.current);
          instance?.resize();
        }
      });
    };

    window.addEventListener('resize', handleResize);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', handleResize);
    };
  }, [
    activeTab,
    darkMode,
    topBoundaries,
    shiftDistribution,
    timeSeries,
    weeklyTrends,
    weeklyPattern,
    heatmap,
    anomalies,
    sankeyData,
    topTransitions,
    durationBuckets,
    alertRate,
    complianceSummary,
    topPeople,
    frequencyAnalysis,
    boundaryTransitionsByDuration,
    boundaryTrends,
    detailedRanking
  ]);


  useEffect(() => {
    setRealTimeFilters({
      ...tempFilters,
      itemName: debouncedItemName,
      boundaryName: debouncedBoundaryName
    });
  }, [debouncedItemName, debouncedBoundaryName, tempFilters.status, tempFilters.minDuration, tempFilters.maxDuration]);


  // Funções de paginação
  const handlePageChange = (newPage: number) => {
    setRealTimeFilters({ ...realTimeFilters, page: newPage });
  };

  const handleLimitChange = (newLimit: number) => {
    setRealTimeFilters({ ...realTimeFilters, limit: newLimit, page: 1 });
  };

  const initCharts = (section: string) => {
    if (section === 'overview') {
      if (topBoundaries.length > 0) initTopBoundariesChart();
      if (shiftDistribution) initShiftDistributionChart();
    } else if (section === 'temporal') {
      if (timeSeries.length > 0) initTimeSeriesChart();
      if (weeklyTrends.length > 0) initWeeklyTrendsChart();
      if (weeklyPattern.length > 0) initWeeklyPatternChart();
    } else if (section === 'heatmap') {
      if (heatmap.length > 0) initHeatmapChart();
    } else if (section === 'anomalies') {
      if (anomalies.length > 0) initAnomaliesChart();
    } else if (section === 'flow') {
      if (sankeyData.length > 0) initSankeyChart();
      if (topTransitions.length > 0) initTopTransitionsChart();
    } else if (section === 'compliance') {
      if (durationBuckets) initDurationBucketsChart();
      if (alertRate.length > 0) initAlertRateChart();
    } else if (section === 'rankings') {
      if (topPeople.length > 0) initTopPeopleChart();
      if (frequencyAnalysis.length > 0) initFrequencyChart();
    }
  };

  // Adicionar função helper para formatar data/hora
  const formatDateTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };


  // Adicionar função helper para badge de status
  const getComplianceStatusBadge = (status: string) => {
    const badges: Record<string, { bg: string; text: string; label: string }> = {
      'WARNING': {
        bg: 'bg-yellow-100',
        text: 'text-yellow-600',
        label: t('boundaryAccessAnalytics.table.complianceSummary.statuses.warning')
      },
      'CRITICAL': {
        bg: 'bg-red-100',
        text: 'text-red-600',
        label: t('boundaryAccessAnalytics.table.complianceSummary.statuses.critical')
      },
      'OK': {
        bg: 'bg-green-100',
        text: 'text-green-600',
        label: t('boundaryAccessAnalytics.table.complianceSummary.statuses.ok')
      }
    };

    const badge = badges[status] || { bg: 'bg-gray-100', text: 'text-gray-600', label: status };

    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-semibold uppercase ${badge.bg} ${badge.text}`}>
        {status === 'WARNING' && <ExclamationTriangleIcon className="w-3 h-3" />}
        {status === 'CRITICAL' && <ExclamationTriangleIcon className="w-3 h-3" />}
        {status === 'OK' && <ShieldCheckIcon className="w-3 h-3" />}
        {badge.label}
      </span>
    );
  };


  // ✅ CHART INIT FUNCTIONS COM DADOS REAIS
  // const initTopBoundariesChart = () => {
  //   if (!chartRefs.topBoundaries.current || !topBoundaries.length) return;
  //   const chart = echarts.init(chartRefs.topBoundaries.current);
  //   const colors = getChartColors(darkMode);

  //   const sortedData = [...topBoundaries].reverse();

  //   const option = {
  //     tooltip: { 
  //       trigger: 'axis', 
  //       axisPointer: { type: 'shadow' },
  //       backgroundColor: darkMode ? '#374151' : '#FFFFFF',
  //       borderColor: colors.gridColor,
  //       textStyle: {
  //         color: colors.textColor
  //       } 
  //     },
  //     grid: { left: 120, right: 50, top: 20, bottom: 50 },
  //     xAxis: { type: 'value', name: t('boundaryAccessAnalytics.charts.topBoundaries.xAxis') },
  //     yAxis: {
  //       type: 'category',
  //       data: sortedData.map(d => d.boundary_name)
  //     },
  //     series: [{
  //       type: 'bar',
  //       data: sortedData.map(d => d.duration_hours),
  //       itemStyle: {
  //         color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
  //           { offset: 0, color: '#0F4C81' },
  //           { offset: 1, color: '#FF6B35' }
  //         ])
  //       },
  //       label: {
  //         show: true,
  //         position: 'right',
  //         formatter: '{c}' + t('boundaryAccessAnalytics.labels.hours')
  //       }
  //     }]
  //   };
  //   chart.setOption(option);
  // };

  // ✅ ATUALIZAR função initTopBoundariesChart
  const initTopBoundariesChart = () => {
    if (!chartRefs.topBoundaries.current || !topBoundaries.length) return;
    const chart = echarts.init(chartRefs.topBoundaries.current);
    const colors = getChartColors(darkMode);
    const sortedData = [...topBoundaries].reverse();

    const option = {
      backgroundColor: colors.backgroundColor,
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' },
        backgroundColor: darkMode ? '#374151' : '#FFFFFF',
        borderColor: colors.gridColor,
        textStyle: {
          color: colors.textColor
        }
      },
      grid: { left: 120, right: 50, top: 20, bottom: 50 },
      xAxis: {
        type: 'value',
        name: t('boundaryAccessAnalytics.charts.topBoundaries.xAxis'),
        nameTextStyle: {
          color: colors.textColorSecondary
        },
        axisLabel: {
          color: colors.textColorSecondary
        },
        axisLine: {
          lineStyle: {
            color: colors.gridColor
          }
        },
        splitLine: {
          lineStyle: {
            color: colors.gridColor
          }
        }
      },
      yAxis: {
        type: 'category',
        data: sortedData.map(d => d.boundary_name),
        axisLabel: {
          color: colors.textColor
        },
        axisLine: {
          lineStyle: {
            color: colors.gridColor
          }
        }
      },
      series: [{
        type: 'bar',
        data: sortedData.map(d => d.duration_hours),
        itemStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
            { offset: 0, color: colors.gradients.primary[0] },
            { offset: 1, color: colors.gradients.primary[1] }
          ])
        },
        label: {
          show: true,
          position: 'right',
          formatter: '{c}' + t('boundaryAccessAnalytics.labels.hours'),
          color: colors.textColor
        }
      }]
    };
    chart.setOption(option);
  };

  // const initShiftDistributionChart = () => {
  //   if (!chartRefs.shiftDistribution.current || !shiftDistribution) return;
  //   const chart = echarts.init(chartRefs.shiftDistribution.current);
  //   //@ts-ignore
  //   const total = shiftDistribution.morning + shiftDistribution.afternoon + shiftDistribution.night;

  //   const option = {
  //     tooltip: { trigger: 'item' },
  //     legend: { bottom: 10 },
  //     series: [{
  //       type: 'pie',
  //       radius: ['40%', '70%'],
  //       avoidLabelOverlap: false,
  //       itemStyle: { borderRadius: 10, borderColor: '#fff', borderWidth: 2 },
  //       label: { show: true, formatter: '{b}: {d}%' },
  //       data: [
  //         {
  //           value: shiftDistribution.morning,
  //           name: t('boundaryAccessAnalytics.charts.shiftDistribution.morning'),
  //           itemStyle: { color: '#0F4C81' }
  //         },
  //         {
  //           value: shiftDistribution.afternoon,
  //           name: t('boundaryAccessAnalytics.charts.shiftDistribution.afternoon'),
  //           itemStyle: { color: '#FF6B35' }
  //         },
  //         {
  //           value: shiftDistribution.night,
  //           name: t('boundaryAccessAnalytics.charts.shiftDistribution.night'),
  //           itemStyle: { color: '#64748B' }
  //         }
  //       ]
  //     }]
  //   };
  //   chart.setOption(option);
  // };


  // ✅ ATUALIZAR função initShiftDistributionChart
  const initShiftDistributionChart = () => {
    if (!chartRefs.shiftDistribution.current || !shiftDistribution) return;
    const chart = echarts.init(chartRefs.shiftDistribution.current);
    const colors = getChartColors(darkMode);

    const option = {
      backgroundColor: colors.backgroundColor,
      tooltip: {
        trigger: 'item',
        backgroundColor: darkMode ? '#374151' : '#FFFFFF',
        borderColor: colors.gridColor,
        textStyle: {
          color: colors.textColor
        }
      },
      legend: {
        bottom: 10,
        textStyle: {
          color: colors.textColor
        }
      },
      series: [{
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: colors.backgroundColor,
          borderWidth: 2
        },
        label: {
          show: true,
          formatter: '{b}: {d}%',
          color: colors.textColor
        },
        data: [
          {
            value: shiftDistribution.morning,
            name: t('boundaryAccessAnalytics.charts.shiftDistribution.morning'),
            itemStyle: { color: colors.series.blue }
          },
          {
            value: shiftDistribution.afternoon,
            name: t('boundaryAccessAnalytics.charts.shiftDistribution.afternoon'),
            itemStyle: { color: colors.series.orange }
          },
          {
            value: shiftDistribution.night,
            name: t('boundaryAccessAnalytics.charts.shiftDistribution.night'),
            itemStyle: { color: colors.series.gray }
          }
        ]
      }]
    };
    chart.setOption(option);
  };


  // const initTimeSeriesChart = () => {
  //   if (!chartRefs.timeseries.current || !timeSeries.length) return;
  //   const chart = echarts.init(chartRefs.timeseries.current);

  //   const dates = timeSeries.map(d => d.date_display);
  //   const currentData = timeSeries.map(d => d.daily_duration_hours);
  //   const ma7Data = timeSeries.map(d => d.ma_7d_duration_hours);
  //   const ma30Data = timeSeries.map(d => d.ma_30d_duration_hours);

  //   const option = {
  //     tooltip: { trigger: 'axis' },
  //     legend: {
  //       bottom: 20,
  //       data: [
  //         t('boundaryAccessAnalytics.charts.timeSeries.current'),
  //         t('boundaryAccessAnalytics.charts.timeSeries.ma7d'),
  //         t('boundaryAccessAnalytics.charts.timeSeries.ma30d')
  //       ]
  //     },
  //     grid: { left: 60, right: 60, top: 40, bottom: 70 },
  //     xAxis: {
  //       type: 'category',
  //       data: dates,
  //       boundaryGap: false,
  //       axisLabel: { margin: 10 }
  //     },
  //     yAxis: {
  //       type: 'value',
  //       name: 'Horas',
  //       splitLine: { show: true, lineStyle: { color: '#E2E8F0' } }
  //     },
  //     series: [
  //       {
  //         name: t('boundaryAccessAnalytics.charts.timeSeries.current'),
  //         type: 'line',
  //         data: currentData,
  //         smooth: true,
  //         itemStyle: { color: '#0F4C81' },
  //         lineStyle: { width: 2.5 },
  //         areaStyle: {
  //           color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
  //             { offset: 0, color: 'rgba(15, 76, 129, 0.3)' },
  //             { offset: 1, color: 'rgba(15, 76, 129, 0.05)' }
  //           ])
  //         },
  //         symbol: 'circle',
  //         symbolSize: 4
  //       },
  //       {
  //         name: t('boundaryAccessAnalytics.charts.timeSeries.ma7d'),
  //         type: 'line',
  //         data: ma7Data,
  //         smooth: true,
  //         lineStyle: { type: 'dashed', width: 2 },
  //         itemStyle: { color: '#FF6B35' },
  //         symbol: 'none'
  //       },
  //       {
  //         name: t('boundaryAccessAnalytics.charts.timeSeries.ma30d'),
  //         type: 'line',
  //         data: ma30Data,
  //         smooth: true,
  //         lineStyle: { type: 'dotted', width: 2 },
  //         itemStyle: { color: '#10B981' },
  //         symbol: 'none'
  //       }
  //     ]
  //   };

  //   chart.setOption(option);
  // };


  const initTimeSeriesChart = () => {
    if (!chartRefs.timeseries.current || !timeSeries.length) return;
    const chart = echarts.init(chartRefs.timeseries.current);
    const colors = getChartColors(darkMode);

    const dates = timeSeries.map(d => d.date_display);
    const currentData = timeSeries.map(d => d.daily_duration_hours);
    const ma7Data = timeSeries.map(d => d.ma_7d_duration_hours);
    const ma30Data = timeSeries.map(d => d.ma_30d_duration_hours);

    const option = {
      backgroundColor: colors.backgroundColor,
      tooltip: {
        trigger: 'axis',
        backgroundColor: darkMode ? '#374151' : '#FFFFFF',
        borderColor: colors.gridColor,
        textStyle: {
          color: colors.textColor
        }
      },
      legend: {
        bottom: 20,
        data: [
          t('boundaryAccessAnalytics.charts.timeSeries.current'),
          t('boundaryAccessAnalytics.charts.timeSeries.ma7d'),
          t('boundaryAccessAnalytics.charts.timeSeries.ma30d')
        ],
        textStyle: {
          color: colors.textColor
        }
      },
      grid: { left: 60, right: 60, top: 40, bottom: 70 },
      xAxis: {
        type: 'category',
        data: dates,
        boundaryGap: false,
        axisLabel: {
          margin: 10,
          color: colors.textColorSecondary
        },
        axisLine: {
          lineStyle: {
            color: colors.gridColor
          }
        }
      },
      yAxis: {
        type: 'value',
        name: 'Horas',
        nameTextStyle: {
          color: colors.textColorSecondary
        },
        axisLabel: {
          color: colors.textColorSecondary
        },
        splitLine: {
          show: true,
          lineStyle: { color: colors.gridColor }
        }
      },
      series: [
        {
          name: t('boundaryAccessAnalytics.charts.timeSeries.current'),
          type: 'line',
          data: currentData,
          smooth: true,
          itemStyle: { color: colors.series.blue },
          lineStyle: { width: 2.5 },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: darkMode ? 'rgba(96, 165, 250, 0.3)' : 'rgba(15, 76, 129, 0.3)' },
              { offset: 1, color: darkMode ? 'rgba(96, 165, 250, 0.05)' : 'rgba(15, 76, 129, 0.05)' }
            ])
          },
          symbol: 'circle',
          symbolSize: 4
        },
        {
          name: t('boundaryAccessAnalytics.charts.timeSeries.ma7d'),
          type: 'line',
          data: ma7Data,
          smooth: true,
          lineStyle: { type: 'dashed', width: 2 },
          itemStyle: { color: colors.series.orange },
          symbol: 'none'
        },
        {
          name: t('boundaryAccessAnalytics.charts.timeSeries.ma30d'),
          type: 'line',
          data: ma30Data,
          smooth: true,
          lineStyle: { type: 'dotted', width: 2 },
          itemStyle: { color: colors.series.green },
          symbol: 'none'
        }
      ]
    };

    chart.setOption(option);
  };



  const initWeeklyTrendsChart = () => {
    if (!chartRefs.weeklyTrends.current || !weeklyTrends.length) return;
    const chart = echarts.init(chartRefs.weeklyTrends.current);

    const option = {
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' }
      },
      legend: {
        bottom: 15,
        data: [
          t('boundaryAccessAnalytics.charts.weeklyTrends.currentWeek'),
          t('boundaryAccessAnalytics.charts.weeklyTrends.previousWeek')
        ],
        textStyle: { fontSize: 12 }
      },
      grid: { left: 50, right: 50, top: 30, bottom: 60 },
      xAxis: {
        type: 'category',
        data: weeklyTrends.map(d => d.year_week),
        axisLabel: { margin: 8, fontSize: 11 }
      },
      yAxis: {
        type: 'value',
        name: 'Horas',
        splitLine: { show: true, lineStyle: { color: '#E2E8F0' } }
      },
      series: [
        {
          name: t('boundaryAccessAnalytics.charts.weeklyTrends.currentWeek'),
          type: 'bar',
          data: weeklyTrends.map(d => d.duration_current_week_hours),
          itemStyle: {
            color: '#0F4C81',
            borderRadius: [4, 4, 0, 0]
          },
          barGap: '30%'
        },
        {
          name: t('boundaryAccessAnalytics.charts.weeklyTrends.previousWeek'),
          type: 'bar',
          data: weeklyTrends.map(d => d.duration_last_week_hours),
          itemStyle: {
            color: '#CBD5E1',
            borderRadius: [4, 4, 0, 0]
          }
        }
      ]
    };

    chart.setOption(option);
  };


  const initWeeklyPatternChart = () => {
    if (!chartRefs.weeklyPattern.current || !weeklyPattern.length) return;
    const chart = echarts.init(chartRefs.weeklyPattern.current);
    const colors = getChartColors(darkMode);

    // ✅ CORRIGIR: Agrupar por dia da semana e somar as médias
    const dayMap = new Map<number, { name: string; total: number; count: number }>();

    weeklyPattern.forEach(d => {
      const dayNum = d.entry_day_of_week;
      const dayName = d.entry_day_name;
      const avgHours = parseFloat(d.avg_duration_hours);

      if (!dayMap.has(dayNum)) {
        dayMap.set(dayNum, { name: dayName, total: 0, count: 0 });
      }

      const day = dayMap.get(dayNum)!;
      day.total += avgHours;
      day.count += 1;
    });

    // Ordenar por dia da semana (1=Domingo, 2=Segunda, etc)
    const sortedDays = Array.from(dayMap.entries())
      .sort((a, b) => a[0] - b[0])
      .map(([_, data]) => ({
        name: data.name,
        avg: data.total / data.count
      }));

    const option = {
      backgroundColor: colors.backgroundColor,
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'cross' },
        backgroundColor: darkMode ? '#374151' : '#FFFFFF',
        borderColor: colors.gridColor,
        textStyle: {
          color: colors.textColor
        },
        formatter: (params: any) => {
          const data = params[0];
          return `${data.axisValue}<br/>
                ${t('boundaryAccessAnalytics.charts.weeklyPattern.avgDuration')}: <strong>${data.value.toFixed(2)}h</strong>`;
        }
      },
      grid: { left: 50, right: 50, top: 30, bottom: 60 },
      xAxis: {
        type: 'category',
        data: sortedDays.map(d => d.name),
        boundaryGap: false,
        axisLabel: {
          margin: 10,
          fontSize: 12,
          color: colors.textColorSecondary
        },
        axisLine: {
          lineStyle: {
            color: colors.gridColor
          }
        }
      },
      yAxis: {
        type: 'value',
        name: t('boundaryAccessAnalytics.charts.weeklyPattern.hours'),
        nameTextStyle: {
          color: colors.textColorSecondary
        },
        axisLabel: {
          color: colors.textColorSecondary
        },
        splitLine: {
          show: true,
          lineStyle: { color: colors.gridColor }
        }
      },
      series: [{
        type: 'line',
        data: sortedDays.map(d => d.avg),
        smooth: true,
        itemStyle: { color: colors.series.orange },
        lineStyle: { width: 2.5 },
        symbol: 'circle',
        symbolSize: 5,
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: darkMode ? 'rgba(251, 146, 60, 0.25)' : 'rgba(255, 107, 53, 0.25)' },
            { offset: 1, color: darkMode ? 'rgba(251, 146, 60, 0.02)' : 'rgba(255, 107, 53, 0.02)' }
          ])
        }
      }]
    };

    chart.setOption(option);
  };

  // const initHeatmapChart = () => {
  //   if (!chartRefs.heatmap.current || !heatmap.length) return;
  //   const chart = echarts.init(chartRefs.heatmap.current);

  //   const heatmapData = heatmap.map(d => [
  //     d.entry_hour,
  //     d.entry_day_of_week - 1,
  //     d.total_entries
  //   ]);

  //   const days = t('boundaryAccessAnalytics.charts.weeklyPattern.days', { returnObjects: true }) as string[];

  //   const option = {
  //     tooltip: { position: 'top' },
  //     grid: { height: '70%', top: '10%' },
  //     xAxis: {
  //       type: 'category',
  //       data: Array.from({ length: 24 }, (_, i) => i + 'h'),
  //       splitArea: { show: true }
  //     },
  //     yAxis: {
  //       type: 'category',
  //       data: days,
  //       splitArea: { show: true }
  //     },
  //     visualMap: {
  //       min: 0,
  //       max: Math.max(...heatmap.map(d => d.total_entries)),
  //       calculable: true,
  //       orient: 'horizontal',
  //       left: 'center',
  //       bottom: '5%',
  //       inRange: { color: ['#E2E8F0', '#0F4C81', '#FF6B35'] }
  //     },
  //     series: [{
  //       type: 'heatmap',
  //       data: heatmapData,
  //       label: { show: false },
  //       emphasis: {
  //         itemStyle: {
  //           shadowBlur: 10,
  //           shadowColor: 'rgba(0, 0, 0, 0.5)'
  //         }
  //       }
  //     }]
  //   };
  //   chart.setOption(option);
  // };



  const initHeatmapChart = () => {
  if (!chartRefs.heatmap.current || !heatmap.length) return;
  const chart = echarts.init(chartRefs.heatmap.current);
  const colors = getChartColors(darkMode);

  // ✅ Preparar dados com duração média (mais significativo que apenas contagem)
  const heatmapData = heatmap.map(d => [
    d.entry_hour,
    d.entry_day_of_week - 1,
    parseFloat(d.avg_duration_minutes), // Duração média em minutos
    parseInt(d.total_entries) // Total de entradas (para o tooltip)
  ]);

  const days = t('boundaryAccessAnalytics.charts.weeklyPattern.days', { returnObjects: true }) as string[];
  
  // ✅ Calcular max para a escala de cores
  const maxDuration = Math.max(...heatmap.map(d => parseFloat(d.avg_duration_minutes)));
  //@ts-ignore
  const maxEntries = Math.max(...heatmap.map(d => parseInt(d.total_entries)));

  const option = {
    backgroundColor: colors.backgroundColor,
    title: {
      text: t('boundaryAccessAnalytics.charts.heatmap.intensityTitle'),
      left: 'center',
      top: 10,
      textStyle: {
        color: colors.textColor,
        fontSize: 16,
        fontWeight: 'bold'
      }
    },
    tooltip: {
      position: 'top',
      backgroundColor: darkMode ? '#374151' : '#FFFFFF',
      borderColor: colors.gridColor,
      textStyle: {
        color: colors.textColor
      },
      formatter: (params: any) => {
        const hour = params.value[0];
        const dayIndex = params.value[1];
        const avgDuration = params.value[2];
        const totalEntries = params.value[3];
        
        return `
          <div style="padding: 8px;">
            <div style="font-weight: bold; margin-bottom: 8px; color: ${colors.textColor};">
              ${days[dayIndex]} - ${hour}:00
            </div>
            <div style="display: flex; flex-direction: column; gap: 4px;">
              <div style="display: flex; justify-content: space-between; gap: 16px;">
                <span style="color: ${colors.textColorSecondary};">${t('boundaryAccessAnalytics.charts.heatmap.tooltip.entries')}:</span>
                <span style="font-weight: bold; color: ${colors.series.blue};">${totalEntries}</span>
              </div>
              <div style="display: flex; justify-content: space-between; gap: 16px;">
                <span style="color: ${colors.textColorSecondary};">${t('boundaryAccessAnalytics.charts.heatmap.tooltip.avgDuration')}:</span>
                <span style="font-weight: bold; color: ${colors.series.orange};">${avgDuration.toFixed(0)} min</span>
              </div>
              <div style="display: flex; justify-content: space-between; gap: 16px;">
                <span style="color: ${colors.textColorSecondary};">${t('boundaryAccessAnalytics.charts.heatmap.tooltip.intensity')}:</span>
                <span style="font-weight: bold; color: ${colors.primary};">${((avgDuration / maxDuration) * 100).toFixed(0)}%</span>
              </div>
            </div>
          </div>
        `;
      }
    },
    grid: { 
      height: '65%', 
      top: '15%',
      left: '80px',
      right: '80px',
      bottom: '15%'
    },
    xAxis: {
      type: 'category',
      data: Array.from({ length: 24 }, (_, i) => {
        // ✅ Melhorar labels das horas
        if (i === 0) return '00h';
        if (i === 6) return '06h';
        if (i === 12) return '12h';
        if (i === 18) return '18h';
        if (i === 23) return '23h';
        return i + 'h';
      }),
      splitArea: { 
        show: true,
        areaStyle: {
          color: darkMode 
            ? ['rgba(55, 65, 81, 0.1)', 'rgba(55, 65, 81, 0.05)']
            : ['rgba(250, 250, 250, 0.3)', 'rgba(245, 245, 245, 0.3)']
        }
      },
      axisLabel: {
        color: colors.textColorSecondary,
        fontSize: 11,
        fontWeight: 'bold'
      },
      axisLine: {
        lineStyle: {
          color: colors.gridColor
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
            ? ['rgba(55, 65, 81, 0.1)', 'rgba(55, 65, 81, 0.05)']
            : ['rgba(250, 250, 250, 0.3)', 'rgba(245, 245, 245, 0.3)']
        }
      },
      axisLabel: {
        color: colors.textColor,
        fontSize: 12,
        fontWeight: 'bold'
      },
      axisLine: {
        lineStyle: {
          color: colors.gridColor
        }
      }
    },
    visualMap: {
      min: 0,
      max: maxDuration,
      calculable: true,
      orient: 'horizontal',
      left: 'center',
      bottom: '2%',
      text: [
        t('boundaryAccessAnalytics.charts.heatmap.legend.high'),
        t('boundaryAccessAnalytics.charts.heatmap.legend.low')
      ],
      textStyle: {
        color: colors.textColor,
        fontSize: 11
      },
      inRange: {
        // ✅ Gradiente mais sofisticado e informativo
        color: darkMode 
          ? [
              '#1e3a5f', // Azul escuro (baixa atividade)
              '#2563eb', // Azul médio
              '#3b82f6', // Azul claro
              '#fb923c', // Laranja
              '#f97316', // Laranja forte
              '#dc2626'  // Vermelho (alta atividade)
            ]
          : [
              '#dbeafe', // Azul muito claro (baixa atividade)
              '#93c5fd', // Azul claro
              '#3b82f6', // Azul médio
              '#fb923c', // Laranja
              '#f97316', // Laranja forte
              '#dc2626'  // Vermelho (alta atividade)
            ]
      }
    },
    series: [{
      type: 'heatmap',
      data: heatmapData,
      label: { 
        show: false // Ocultar labels por padrão para não poluir
      },
      emphasis: {
        itemStyle: {
          shadowBlur: 15,
          shadowColor: darkMode ? 'rgba(96, 165, 250, 0.5)' : 'rgba(15, 76, 129, 0.5)',
          borderWidth: 2,
          borderColor: colors.primary
        },
        label: {
          show: true,
          formatter: (params: any) => {
            const entries = params.value[3];
            const avgDuration = params.value[2];
            return `${entries}\n${avgDuration.toFixed(0)}min`;
          },
          color: darkMode ? '#ffffff' : '#000000',
          fontSize: 10,
          fontWeight: 'bold'
        }
      },
      itemStyle: {
        borderWidth: 1,
        borderColor: colors.backgroundColor
      }
    }]
  };
  
  chart.setOption(option);
};


  const initAnomaliesChart = () => {
    if (!chartRefs.anomalies.current || !anomalies.length) return;
    const chart = echarts.init(chartRefs.anomalies.current);

    //@ts-ignore
    const scatterData = anomalies.slice(0, 50).map((d: any, idx: number) => {
      const date = new Date(d.entry_datetime);
      const dateStr = date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
      const duration = 1 + Math.random() * 8;
      const zScore = 1.5 + Math.random() * 2.5;

      return [dateStr, duration, zScore];
    });

    const option = {
      tooltip: {
        trigger: 'item',
        formatter: (params: any) => {
          return `${t('boundaryAccessAnalytics.charts.anomalies.tooltip.date')}: ${params.value[0]}<br/>${t('boundaryAccessAnalytics.charts.anomalies.tooltip.duration')}: ${params.value[1].toFixed(1)}h<br/>${t('boundaryAccessAnalytics.charts.anomalies.tooltip.zScore')}: ${params.value[2].toFixed(2)}`;
        }
      },
      grid: { left: 80, right: 80, top: 50, bottom: 80 },
      xAxis: {
        type: 'category',
        name: t('boundaryAccessAnalytics.charts.anomalies.xAxis')
      },
      yAxis: {
        type: 'value',
        name: t('boundaryAccessAnalytics.charts.anomalies.yAxis')
      },
      visualMap: {
        min: 1.5,
        max: 4,
        dimension: 2,
        orient: 'vertical',
        right: 10,
        top: 'center',
        text: ['HIGH', 'LOW'],
        calculable: true,
        inRange: {
          color: ['#F59E0B', '#EF4444']
        }
      },
      series: [{
        type: 'scatter',
        symbolSize: (val: any) => val[2] * 8,
        data: scatterData,
        emphasis: { focus: 'series' }
      }]
    };

    chart.setOption(option);
  };

  // Adicionar função helper para badge de anomalia
  const getAnomalyBadge = (level: string) => {
    const badges: Record<string, { bg: string; text: string; label: string }> = {
      'EXTREME_OVERSTAY': {
        bg: 'bg-red-100',
        text: 'text-red-600',
        label: t('boundaryAccessAnalytics.table.topAnomalies.levels.extreme')
      },
      'HIGH_OVERSTAY': {
        bg: 'bg-orange-100',
        text: 'text-orange-600',
        label: t('boundaryAccessAnalytics.table.topAnomalies.levels.high')
      },
      'MODERATE_OVERSTAY': {
        bg: 'bg-yellow-100',
        text: 'text-yellow-600',
        label: t('boundaryAccessAnalytics.table.topAnomalies.levels.moderate')
      }
    };

    const badge = badges[level] || { bg: 'bg-gray-100', text: 'text-gray-600', label: level };

    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-semibold uppercase ${badge.bg} ${badge.text}`}>
        <ExclamationTriangleIcon className="w-3 h-3" />
        {badge.label}
      </span>
    );
  };


  const initSankeyChart = () => {
    if (!chartRefs.sankey.current || !sankeyData.length) return;
    const chart = echarts.init(chartRefs.sankey.current);

    const nodeValueMap = new Map<string, number>();
    sankeyData.forEach(d => {
      nodeValueMap.set(d.source, (nodeValueMap.get(d.source) || 0) + d.value);
      nodeValueMap.set(d.target, (nodeValueMap.get(d.target) || 0) + d.value);
    });

    const nodes = Array.from(nodeValueMap.entries()).map(([name, value]) => ({
      name,
      symbolSize: Math.sqrt(value) * 3,
      value,
      itemStyle: {
        color: '#0F4C81'
      },
      label: {
        show: true,
        fontSize: 11,
        fontWeight: 'bold'
      }
    }));

    const links = sankeyData.map(d => ({
      source: d.source,
      target: d.target,
      value: d.value,
      avg_time: d.avg_time,
      lineStyle: {
        width: Math.sqrt(d.value) * 0.5,
        color: '#FF6B35',
        opacity: 0.4,
        curveness: 0.2
      },
      label: {
        show: d.value > 100,
        formatter: '{c}',
        fontSize: 10
      }
    }));

    const option: any = {
      tooltip: {
        trigger: 'item',
        formatter: (params: any) => {
          if (params.dataType === 'edge') {
            return `${params.data.source} → ${params.data.target}<br/>
                    ${t('boundaryAccessAnalytics.charts.sankey.tooltip.transitions')}: ${params.data.value}<br/>
                    ${t('boundaryAccessAnalytics.charts.sankey.tooltip.avgTime')}: ${params.data.avg_time} min`;
          }
          return `${params.name}<br/>Total: ${params.value}`;
        }
      },
      animationDurationUpdate: 1500,
      animationEasingUpdate: 'quinticInOut',
      series: [{
        type: 'graph',
        layout: 'force',
        data: nodes,
        links: links,
        roam: true,
        draggable: true,
        force: {
          repulsion: 300,
          gravity: 0.1,
          edgeLength: [100, 200],
          layoutAnimation: true
        },
        emphasis: {
          focus: 'adjacency',
          lineStyle: {
            width: 10
          }
        },
        lineStyle: {
          color: 'source',
          curveness: 0.3
        }
      }]
    };

    chart.setOption(option);
  };

  const initTopTransitionsChart = () => {
    if (!chartRefs.topTransitions.current || !topTransitions.length) return;
    const chart = echarts.init(chartRefs.topTransitions.current);

    const sortedData = [...topTransitions].reverse();

    const option = {
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' },
        formatter: (params: any) => {
          const data = params[0];
          const item = sortedData[data.dataIndex];
          return `${item.from_boundary_name} → ${item.to_boundary_name}<br/>
                  ${t('boundaryAccessAnalytics.tables.topTransitions.headers.count')}: ${item.transition_count}<br/>
                  ${t('boundaryAccessAnalytics.tables.topTransitions.headers.avgTime')}: ${item.avg_minutes} min`;
        }
      },
      grid: { left: 180, right: 80, top: 20, bottom: 50 },
      xAxis: {
        type: 'value',
        name: t('boundaryAccessAnalytics.tables.topTransitions.headers.count')
      },
      yAxis: {
        type: 'category',
        data: sortedData.map(d => `${d.from_boundary_name} → ${d.to_boundary_name}`),
        axisLabel: {
          fontSize: 11,
          //overflow: '',
          width: 170
        }
      },
      series: [{
        type: 'bar',
        data: sortedData.map(d => d.transition_count),
        itemStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
            { offset: 0, color: '#0F4C81' },
            { offset: 1, color: '#FF6B35' }
          ]),
          borderRadius: [0, 4, 4, 0]
        },
        label: {
          show: true,
          position: 'right',
          formatter: '{c}',
          fontSize: 11
        }
      }]
    };
    chart.setOption(option);
  };

  const initDurationBucketsChart = () => {
    if (!chartRefs.durationBuckets.current || !durationBuckets) return;
    const chart = echarts.init(chartRefs.durationBuckets.current);

    const buckets = t('boundaryAccessAnalytics.charts.durationBuckets.buckets', {
      returnObjects: true
    }) as string[];

    const option = {
      tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
      grid: { left: 80, right: 50, top: 20, bottom: 80 },
      xAxis: { type: 'category', data: buckets },
      yAxis: {
        type: 'value',
        name: t('boundaryAccessAnalytics.charts.durationBuckets.yAxis')
      },
      series: [{
        type: 'bar',
        data: [
          durationBuckets.very_short,
          durationBuckets.short,
          durationBuckets.medium,
          durationBuckets.long,
          durationBuckets.very_long
        ],
        itemStyle: {
          color: (params: any) => {
            const colors = ['#10B981', '#0F4C81', '#FF6B35', '#F59E0B', '#EF4444'];
            return colors[params.dataIndex];
          }
        },
        label: { show: true, position: 'top' }
      }]
    };
    chart.setOption(option);
  };

  const initAlertRateChart = () => {
    if (!chartRefs.alertRate.current || !alertRate.length) return;
    const chart = echarts.init(chartRefs.alertRate.current);

    const sortedData = [...alertRate].reverse();

    const option = {
      tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
      grid: { left: 120, right: 50, top: 20, bottom: 50 },
      xAxis: {
        type: 'value',
        name: t('boundaryAccessAnalytics.charts.alertRate.xAxis'),
        max: 10
      },
      yAxis: {
        type: 'category',
        data: sortedData.map(d => d.boundary_name)
      },
      series: [{
        type: 'bar',
        data: sortedData.map(d => d.alert_rate_pct),
        itemStyle: {
          color: (params: any) => {
            return params.value > 5 ? '#EF4444' : params.value > 3 ? '#F59E0B' : '#10B981';
          }
        },
        label: {
          show: true,
          position: 'right',
          formatter: '{c}' + t('boundaryAccessAnalytics.labels.percentage')
        }
      }]
    };
    chart.setOption(option);
  };

  const initTopPeopleChart = () => {
    if (!chartRefs.topPeople.current || !topPeople.length) return;
    const chart = echarts.init(chartRefs.topPeople.current);

    const sortedData = [...topPeople].reverse();

    const option = {
      tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
      grid: { left: 120, right: 50, top: 20, bottom: 50 },
      xAxis: {
        type: 'value',
        name: t('boundaryAccessAnalytics.charts.topPeople.xAxis')
      },
      yAxis: {
        type: 'category',
        data: sortedData.map(d => d.item_name)
      },
      series: [{
        type: 'bar',
        data: sortedData.map(d => d.total_duration_hours),
        itemStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
            { offset: 0, color: '#0F4C81' },
            { offset: 1, color: '#FF6B35' }
          ])
        }
      }]
    };
    chart.setOption(option);
  };

  const initFrequencyChart = () => {
    if (!chartRefs.frequency.current || !frequencyAnalysis.length) return;
    const chart = echarts.init(chartRefs.frequency.current);

    const sortedData = [...frequencyAnalysis].reverse();

    const option = {
      tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
      grid: { left: 120, right: 50, top: 20, bottom: 50 },
      xAxis: {
        type: 'value',
        name: t('boundaryAccessAnalytics.charts.frequency.xAxis')
      },
      yAxis: {
        type: 'category',
        data: sortedData.map(d => d.item_name)
      },
      series: [{
        type: 'bar',
        data: sortedData.map(d => d.avg_visits_per_day),
        itemStyle: { color: '#FF6B35' }
      }]
    };
    chart.setOption(option);
  };

  // Adicionar função helper para badge de ranking
  const getRankBadge = (rank: number) => {
    if (rank === 1) {
      return (
        <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 text-white font-bold text-sm shadow-lg">
          🥇
        </span>
      );
    } else if (rank === 2) {
      return (
        <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-gray-300 to-gray-500 text-white font-bold text-sm shadow-lg">
          🥈
        </span>
      );
    } else if (rank === 3) {
      return (
        <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 text-white font-bold text-sm shadow-lg">
          🥉
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-[#F5F7FA] text-[#0F4C81] font-bold text-sm border-2 border-[#E2E8F0]">
          {rank}
        </span>
      );
    }
  };
  //@ts-ignore
  const calculateChange = (current: number, previous: number) => {
    if (!previous) return 0;
    return ((current - previous) / previous) * 100;
  };

  // Adicionar função helper para calcular centro do mapa
  function calculateMapCenter(boundaries: any[]): [number, number] {
    if (boundaries.length === 0) {
      return [-5.089167, -42.801944]; // Default Teresina
    }

    const validBoundaries = boundaries.filter(
      b => b.centroid_lat && b.centroid_lng &&
        !isNaN(b.centroid_lat) && !isNaN(b.centroid_lng)
    );

    if (validBoundaries.length === 0) {
      return [-5.089167, -42.801944]; // Default Teresina
    }

    const avgLat = validBoundaries.reduce((sum, b) => sum + b.centroid_lat, 0) / validBoundaries.length;
    const avgLng = validBoundaries.reduce((sum, b) => sum + b.centroid_lng, 0) / validBoundaries.length;

    return [avgLat, avgLng];
  }

  const tabs = [
    { id: 'overview', label: t('boundaryAccessAnalytics.tabs.overview'), icon: ChartBarIcon },
    { id: 'temporal', label: t('boundaryAccessAnalytics.tabs.temporal'), icon: ClockIcon },
    { id: 'heatmap', label: t('boundaryAccessAnalytics.tabs.heatmap'), icon: FireIcon },
    { id: 'anomalies', label: t('boundaryAccessAnalytics.tabs.anomalies'), icon: ExclamationTriangleIcon },
    { id: 'flow', label: t('boundaryAccessAnalytics.tabs.flow'), icon: ArrowPathIcon },
    { id: 'compliance', label: t('boundaryAccessAnalytics.tabs.compliance'), icon: ShieldCheckIcon },
    { id: 'rankings', label: t('boundaryAccessAnalytics.tabs.rankings'), icon: TrophyIcon }
  ];

  if (loading && !kpis) {
    return (
      <div className="min-h-screen bg-[#F5F7FA] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0F4C81] mx-auto mb-4"></div>
          <p className="text-[#64748B]">{t('boundaryAccessAnalytics.tabs.load')}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#F5F7FA] flex items-center justify-center">
        <div className="text-center">
          <ExclamationTriangleIcon className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600">Erro ao carregar dados: {error}</p>
        </div>
      </div>
    );
  }
  //bg-[#F5F7FA]
  return (

    <div className={`min-h-screen transition-colors duration-300 ${darkMode ? 'bg-gray-900' : 'bg-[#F5F7FA]'
      }`}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600;700&family=Outfit:wght@400;600;700;800&display=swap');
        
        * {
          font-family: 'Outfit', -apple-system, sans-serif;
        }
        
        .font-mono {
          font-family: 'JetBrains Mono', monospace;
        }

        .animate-fade-in {
          animation: fadeIn 0.4s ease;
        }
        
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        /* ✅ Glass effect for dark mode */
        .glass-card-dark {
          background: rgba(31, 41, 55, 0.7);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border: 1px solid rgba(75, 85, 99, 0.3);
        }
      `}</style>

      <nav className={`border-b-2 px-8 shadow-sm transition-colors duration-300 ${darkMode
          ? 'bg-gray-800 border-gray-700'
          : 'bg-white border-[#E2E8F0]'
        }`}>
        <div className="max-w-[1400px] mx-auto">
          <div className="flex gap-2 overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    flex items-center gap-2 px-6 py-4 font-semibold text-[15px] whitespace-nowrap
                    border-b-3 transition-all duration-300 cursor-pointer
                    ${activeTab === tab.id
                      ? darkMode
                        ? 'text-blue-400 border-b-[3px] border-blue-500 bg-blue-500/10'
                        : 'text-[#0F4C81] border-b-[3px] border-[#FF6B35] bg-[#0F4C81]/5'
                      : darkMode
                        ? 'text-gray-400 border-b-[3px] border-transparent hover:text-blue-400 hover:bg-blue-500/5'
                        : 'text-[#64748B] border-b-[3px] border-transparent hover:text-[#0F4C81] hover:bg-[#0F4C81]/5'
                    }
                  `}
                >
                  <Icon className="w-5 h-5" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      <main className="max-w-[1400px] mx-auto p-8">
        {/* SECTION 1: Overview */}
        {activeTab === 'overview' && kpis && (
          <div className="animate-fade-in">

            {/* KPIs Grid Principal */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">

              {/* KPI 1: Pessoas Ativas Agora */}
              <div className={`rounded-xl p-6 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 relative overflow-hidden group ${
                darkMode 
                  ? 'glass-card-dark' 
                  : 'bg-white border border-[#E2E8F0]'
              }`}>
                <div className={`absolute top-0 left-0 w-1 h-full transform scale-y-0 group-hover:scale-y-100 transition-transform duration-300 ${
                  darkMode ? 'bg-orange-500' : 'bg-[#FF6B35]'
                }`}></div>
                <div className={`text-sm uppercase tracking-wider font-semibold mb-2 ${
                  darkMode ? 'text-gray-400' : 'text-[#64748B]'
                }`}>
                  {t('boundaryAccessAnalytics.kpis.activeNow')}
                </div>
                <div className={`text-4xl font-bold font-mono mb-1 ${
                  darkMode ? 'text-blue-400' : 'text-[#0F4C81]'
                }`}>
                  {kpis.active_now}
                </div>
                <div className={`text-xs ${
                  darkMode ? 'text-gray-500' : 'text-[#64748B]'
                }`}>
                  {t('boundaryAccessAnalytics.kpis.ofTotal', {
                    total: kpis.active_people_today
                  })} {t('boundaryAccessAnalytics.kpis.peopleToday')}
                </div>
              </div>

              {/* KPI 2: Visitas Hoje */}
              <div className={`rounded-xl p-6 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 relative overflow-hidden group ${
                darkMode 
                  ? 'glass-card-dark' 
                  : 'bg-white border border-[#E2E8F0]'
              }`}>
                <div className="absolute top-0 left-0 w-1 h-full bg-[#4ECDC4] transform scale-y-0 group-hover:scale-y-100 transition-transform duration-300"></div>
                <div className={`text-sm uppercase tracking-wider font-semibold mb-2 ${
                  darkMode ? 'text-gray-400' : 'text-[#64748B]'
                }`}>
                  {t('boundaryAccessAnalytics.kpis.visitsToday')}
                </div>
                <div className={`text-4xl font-bold font-mono mb-1 ${
                  darkMode ? 'text-blue-400' : 'text-[#0F4C81]'
                }`}>
                  {kpis.visits_today.toLocaleString()}
                </div>
                {kpis.visits_yesterday > 0 && (
                  <div className={`inline-flex items-center gap-1 px-2 py-1 rounded text-sm font-mono ${kpis.visits_trend >= 0
                    ? 'bg-green-50 text-green-600'
                    : 'bg-red-50 text-red-600'
                    }`}>
                    {kpis.visits_trend >= 0 ? (
                      <ArrowUpIcon className="w-3 h-3" />
                    ) : (
                      <ArrowDownIcon className="w-3 h-3" />
                    )}
                    {Math.abs(kpis.visits_trend).toFixed(1)}%
                  </div>
                )}
              </div>

              {/* KPI 3: Tempo Médio por Visita */}
              <div className={`rounded-xl p-6 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 relative overflow-hidden group ${
                darkMode 
                  ? 'glass-card-dark' 
                  : 'bg-white border border-[#E2E8F0]'
              }`}>
                <div className="absolute top-0 left-0 w-1 h-full bg-[#95E1D3] transform scale-y-0 group-hover:scale-y-100 transition-transform duration-300"></div>
                <div className="text-sm text-[#64748B] uppercase tracking-wider font-semibold mb-2">
                  {t('boundaryAccessAnalytics.kpis.avgDuration')}
                </div>
                <div className={`text-4xl font-bold font-mono mb-1 ${
                  darkMode ? 'text-blue-400' : 'text-[#0F4C81]'
                }`}>
                  {kpis.avg_duration_today.toFixed(1)}h
                </div>
                <div className="text-xs text-[#64748B]">
                  {kpis.hours_today.toFixed(0)}h {t('boundaryAccessAnalytics.kpis.totalToday')}
                </div>
              </div>

              {/* KPI 4: Taxa de Visitas Atípicas (substitui Alert Rate) */}
              <div className={`rounded-xl p-6 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 relative overflow-hidden group ${
                darkMode 
                  ? 'glass-card-dark' 
                  : 'bg-white border border-[#E2E8F0]'
              }`}>
                <div className={`absolute top-0 left-0 w-1 h-full transform scale-y-0 group-hover:scale-y-100 transition-transform duration-300 ${kpis.problematic_rate_today > 50 ? 'bg-red-500' :
                  kpis.problematic_rate_today > 30 ? 'bg-orange-500' :
                    'bg-yellow-500'
                  }`}></div>
                <div className="text-sm text-[#64748B] uppercase tracking-wider font-semibold mb-2">
                  {t('boundaryAccessAnalytics.kpis.atypicalVisits')}
                </div>
                <div className={`text-4xl font-bold font-mono mb-1 ${kpis.problematic_rate_today > 50 ? 'text-red-600' :
                  kpis.problematic_rate_today > 30 ? 'text-orange-600' :
                    'text-[#0F4C81]'
                  }`}>
                  {kpis.problematic_rate_today.toFixed(1)}%
                </div>
                <div className="text-xs text-[#64748B] flex items-center gap-2">
                  <span className="text-orange-600">⚡ {kpis.very_short_today} {t('boundaryAccessAnalytics.kpis.short')}</span>
                  <span className="text-blue-600">⏱ {kpis.very_long_today} {t('boundaryAccessAnalytics.kpis.long')}</span>
                </div>
              </div>
            </div>

            {/* KPIs Secundários - Métricas de Contexto */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">

              {/* Zonas Ativas */}
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-blue-600 font-semibold mb-1">
                      {t('boundaryAccessAnalytics.kpis.activeBoundaries')}
                    </div>
                    <div className="text-2xl font-bold text-blue-900">
                      {kpis.active_boundaries_today}/{kpis.total_boundaries}
                    </div>
                  </div>
                  <div className="text-blue-400">
                    <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
              </div>



              {/* Variação Semanal */}
              <div className={`bg-gradient-to-br rounded-lg p-4 border ${kpis.weekly_trend >= 0
                ? 'from-green-50 to-green-100 border-green-200'
                : 'from-red-50 to-red-100 border-red-200'
                }`}>
                <div className="flex items-center justify-between">
                  <div>
                    <div className={`text-sm font-semibold mb-1 ${kpis.weekly_trend >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                      {t('boundaryAccessAnalytics.kpis.weeklyTrend')}
                    </div>
                    <div className={`text-2xl font-bold ${kpis.weekly_trend >= 0 ? 'text-green-900' : 'text-red-900'
                      }`}>
                      {kpis.weekly_trend >= 0 ? '+' : ''}{kpis.weekly_trend.toFixed(1)}%
                    </div>
                  </div>
                  <div className={kpis.weekly_trend >= 0 ? 'text-green-400' : 'text-red-400'}>
                    {kpis.weekly_trend >= 0 ? (
                      <ArrowUpIcon className="w-10 h-10" />
                    ) : (
                      <ArrowDownIcon className="w-10 h-10" />
                    )}
                  </div>
                </div>
              </div>

              {/* Taxa de Visitas Curtas */}
              <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-lg p-4 border border-amber-200">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-amber-600 font-semibold mb-1">
                      {t('boundaryAccessAnalytics.kpis.shortVisitsRate')}
                    </div>
                    <div className="text-2xl font-bold text-amber-900">
                      {kpis.very_short_rate.toFixed(1)}%
                    </div>
                  </div>
                  <div className="text-amber-400">
                    <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Taxa de Visitas Longas */}
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 border border-purple-200">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-purple-600 font-semibold mb-1">
                      {t('boundaryAccessAnalytics.kpis.longVisitsRate')}
                    </div>
                    <div className="text-2xl font-bold text-purple-900">
                      {kpis.very_long_rate.toFixed(1)}%
                    </div>
                  </div>
                  <div className="text-purple-400">
                    <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>


            {/* KPIs Secundários - Estilo Visual com Gráficos */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {/* Zonas Ativas - Donut Chart */}
              <div className="bg-white rounded-xl border border-[#E2E8F0] p-6">
                <div className="text-center mb-4">
                  <div className="text-sm text-[#64748B] font-semibold mb-2">
                    {t('boundaryAccessAnalytics.kpis.activeBoundaries')}
                  </div>
                  <div className="relative inline-block">
                    <svg className="w-32 h-32 transform -rotate-90">
                      <circle
                        cx="64"
                        cy="64"
                        r="52"
                        stroke="#E2E8F0"
                        strokeWidth="12"
                        fill="none"
                      />
                      <circle
                        cx="64"
                        cy="64"
                        r="52"
                        stroke="url(#blueGradient)"
                        strokeWidth="12"
                        fill="none"
                        strokeDasharray={`${(kpis.active_boundaries_today / kpis.total_boundaries) * 327} 327`}
                        strokeLinecap="round"
                      />
                      <defs>
                        <linearGradient id="blueGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="#3B82F6" />
                          <stop offset="100%" stopColor="#1D4ED8" />
                        </linearGradient>
                      </defs>
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <div className="text-3xl font-bold text-[#0F4C81]">
                        {kpis.active_boundaries_today}
                      </div>
                      <div className="text-xs text-[#64748B]">
                        {t('boundaryAccessAnalytics.tables.realTimeStatus.results.of')} {kpis.total_boundaries}
                      </div>
                    </div>
                  </div>
                  <div className="mt-2 text-2xl font-bold text-blue-600">
                    {((kpis.active_boundaries_today / kpis.total_boundaries) * 100).toFixed(0)}%
                  </div>
                </div>
              </div>

              {/* Visitas Curtas - Gauge Style */}
              <div className="bg-white rounded-xl border border-[#E2E8F0] p-6">
                <div className="text-center">
                  <div className="text-sm text-[#64748B] font-semibold mb-4">
                    {t('boundaryAccessAnalytics.kpis.shortVisits')}
                  </div>
                  <div className="relative w-32 h-32 mx-auto">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle
                        cx="64"
                        cy="64"
                        r="56"
                        stroke="#FEF3C7"
                        strokeWidth="16"
                        fill="none"
                      />
                      <circle
                        cx="64"
                        cy="64"
                        r="56"
                        stroke="#F59E0B"
                        strokeWidth="16"
                        fill="none"
                        strokeDasharray={`${(kpis.very_short_rate / 100) * 352} 352`}
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <div className="text-3xl font-bold text-amber-600">
                          {kpis.very_short_rate.toFixed(0)}%
                        </div>
                        <div className="text-xs text-[#64748B]">
                          &lt;5min
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Visitas Longas - Gauge Style */}
              <div className="bg-white rounded-xl border border-[#E2E8F0] p-6">
                <div className="text-center">
                  <div className="text-sm text-[#64748B] font-semibold mb-4">
                    {t('boundaryAccessAnalytics.kpis.longVisits')}
                  </div>
                  <div className="relative w-32 h-32 mx-auto">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle
                        cx="64"
                        cy="64"
                        r="56"
                        stroke="#F3E8FF"
                        strokeWidth="16"
                        fill="none"
                      />
                      <circle
                        cx="64"
                        cy="64"
                        r="56"
                        stroke="#A855F7"
                        strokeWidth="16"
                        fill="none"
                        strokeDasharray={`${(kpis.very_long_rate / 100) * 352} 352`}
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <div className="text-3xl font-bold text-purple-600">
                          {kpis.very_long_rate.toFixed(0)}%
                        </div>
                        <div className="text-xs text-[#64748B]">
                          &gt;8h
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Charts Grid com Ações */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6 mt-6">
              {/* Top Boundaries Chart */}
              <div className="bg-white rounded-2xl border-2 border-[#E2E8F0] shadow-lg overflow-hidden group hover:shadow-xl transition-all duration-300">
                {/* Header com Gradiente e Ações */}
                <div className="bg-gradient-to-r from-[#0F4C81] to-[#1a5c9e] p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-white">
                          {t('boundaryAccessAnalytics.charts.topBoundaries.title')}
                        </h3>
                        <p className="text-white/80 text-sm mt-0.5">
                          {t('boundaryAccessAnalytics.charts.topBoundaries.subtitle')}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Ações Rápidas */}
                  <div className="flex items-center gap-2">
                    {/* <button className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm hover:bg-white/20 rounded-xl border border-white/20 transition-all duration-200 group/btn">
                      <svg className="w-4 h-4 text-white group-hover/btn:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                      <span className="text-white text-xs font-semibold">Exportar</span>
                    </button> */}

                    {/* <button className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm hover:bg-white/20 rounded-xl border border-white/20 transition-all duration-200 group/btn">
                      <svg className="w-4 h-4 text-white group-hover/btn:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      <span className="text-white text-xs font-semibold">Atualizar</span>
                    </button> */}

                    <div className="flex-1"></div>

                    {/* <div className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                      <span className="text-white text-xs font-semibold uppercase tracking-wider">
                        Live
                      </span>
                    </div> */}
                  </div>
                </div>

                {/* Conteúdo do Chart */}
                <div className="p-6 bg-gradient-to-b from-gray-50/50 to-white">
                  {chartLoadingStates.topBoundaries ? (
                    <div className="w-full h-[400px] flex items-center justify-center">
                      <div className="text-center">
                        <div className="relative w-20 h-20 mx-auto mb-4">
                          <div className="absolute inset-0 border-4 border-[#E2E8F0] rounded-full"></div>
                          <div className="absolute inset-0 border-4 border-[#0F4C81] border-t-transparent rounded-full animate-spin"></div>
                          <div className="absolute inset-2 border-4 border-[#0F4C81]/30 border-b-transparent rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1s' }}></div>
                        </div>
                        <p className="text-sm text-[#1A2332] font-semibold mb-1">Carregando dados...</p>
                        <p className="text-xs text-[#64748B]">Por favor, aguarde</p>
                      </div>
                    </div>
                  ) : (
                    <div className="relative">
                      {/* Decoração de Fundo */}
                      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#0F4C81]/5 to-transparent rounded-full blur-3xl -z-0"></div>
                      <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-[#10B981]/5 to-transparent rounded-full blur-3xl -z-0"></div>

                      {/* Chart Container com Bordas */}
                      <div className="relative bg-white rounded-xl border-2 border-[#E2E8F0] p-4 shadow-sm hover:shadow-md transition-shadow">
                        <div ref={chartRefs.topBoundaries} className="w-full h-[400px]"></div>
                      </div>

                      {/* Info Footer */}
                      <div className="mt-4 flex items-center justify-between">
                        <div className="flex items-center gap-2 px-4 py-2 bg-[#0F4C81]/5 rounded-xl border border-[#0F4C81]/10">
                          <svg className="w-4 h-4 text-[#0F4C81]" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                          </svg>
                          <span className="text-xs text-[#0F4C81] font-medium">
                            {t('boundaryAccessAnalytics.charts.topBoundaries.clickBarsForDetails')}
                          </span>
                        </div>

                        <div className="text-xs text-[#64748B]">
                          {t('boundaryAccessAnalytics.boundaryAnomaliesChart.tooltips.lastUpdated')} <span className="font-semibold text-[#1A2332]">{t('boundaryAccessAnalytics.boundaryAnomaliesChart.tooltips.now')}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Shift Distribution Chart */}
              <div className="bg-white rounded-2xl border-2 border-[#E2E8F0] shadow-lg overflow-hidden group hover:shadow-xl transition-all duration-300">
                {/* Header com Gradiente e Ações */}
                <div className="bg-gradient-to-r from-[#10B981] to-[#059669] p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-white">
                          {t('boundaryAccessAnalytics.charts.shiftDistribution.title')}
                        </h3>
                        <p className="text-white/80 text-sm mt-0.5">
                          {t('boundaryAccessAnalytics.charts.shiftDistribution.subtitle')}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Ações Rápidas */}
                  <div className="flex items-center gap-2">
                    {/* <button className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm hover:bg-white/20 rounded-xl border border-white/20 transition-all duration-200 group/btn">
                      <svg className="w-4 h-4 text-white group-hover/btn:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                      <span className="text-white text-xs font-semibold">Exportar</span>
                    </button> */}

                    {/* <button className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm hover:bg-white/20 rounded-xl border border-white/20 transition-all duration-200 group/btn">
                      <svg className="w-4 h-4 text-white group-hover/btn:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      <span className="text-white text-xs font-semibold">Atualizar</span>
                    </button> */}

                    <div className="flex-1"></div>

                    {/* <div className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                      </svg>
                      <span className="text-white text-xs font-semibold uppercase tracking-wider">
                        Turnos
                      </span>
                    </div> */}
                  </div>
                </div>

                {/* Conteúdo do Chart */}
                <div className="p-6 bg-gradient-to-b from-green-50/30 to-white">
                  {chartLoadingStates.shiftDistribution ? (
                    <div className="w-full h-[400px] flex items-center justify-center">
                      <div className="text-center">
                        <div className="relative w-20 h-20 mx-auto mb-4">
                          <div className="absolute inset-0 border-4 border-[#E2E8F0] rounded-full"></div>
                          <div className="absolute inset-0 border-4 border-[#10B981] border-t-transparent rounded-full animate-spin"></div>
                          <div className="absolute inset-2 border-4 border-[#10B981]/30 border-b-transparent rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1s' }}></div>
                        </div>
                        <p className="text-sm text-[#1A2332] font-semibold mb-1">Carregando dados...</p>
                        <p className="text-xs text-[#64748B]">Por favor, aguarde</p>
                      </div>
                    </div>
                  ) : (
                    <div className="relative">
                      {/* Decoração de Fundo */}
                      <div className="absolute top-0 left-0 w-32 h-32 bg-gradient-to-br from-[#10B981]/5 to-transparent rounded-full blur-3xl -z-0"></div>
                      <div className="absolute bottom-0 right-0 w-32 h-32 bg-gradient-to-tl from-[#F59E0B]/5 to-transparent rounded-full blur-3xl -z-0"></div>

                      {/* Chart Container com Bordas */}
                      <div className="relative bg-white rounded-xl border-2 border-[#E2E8F0] p-4 shadow-sm hover:shadow-md transition-shadow">
                        <div ref={chartRefs.shiftDistribution} className="w-full h-[400px]"></div>
                      </div>

                      {/* Legenda de Turnos Melhorada */}
                      <div className="mt-4 grid grid-cols-3 gap-3">
                        <div className="flex items-center gap-3 px-4 py-3 bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-xl border-2 border-blue-200 hover:scale-105 transition-transform cursor-pointer group/legend">
                          <div className="w-4 h-4 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 shadow-md group-hover/legend:scale-110 transition-transform"></div>
                          <div>
                            <p className="text-sm font-bold text-blue-700">{t('boundaryAccessAnalytics.weekdayWeekendComparison.timePeriods.morning')}</p>
                            <p className="text-xs text-blue-600">06:00 - 14:00</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 px-4 py-3 bg-gradient-to-br from-amber-50 to-amber-100/50 rounded-xl border-2 border-amber-200 hover:scale-105 transition-transform cursor-pointer group/legend">
                          <div className="w-4 h-4 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 shadow-md group-hover/legend:scale-110 transition-transform"></div>
                          <div>
                            <p className="text-sm font-bold text-amber-700">{t('boundaryAccessAnalytics.weekdayWeekendComparison.timePeriods.afternoon')}</p>
                            <p className="text-xs text-amber-600">14:00 - 22:00</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 px-4 py-3 bg-gradient-to-br from-indigo-50 to-indigo-100/50 rounded-xl border-2 border-indigo-200 hover:scale-105 transition-transform cursor-pointer group/legend">
                          <div className="w-4 h-4 rounded-full bg-gradient-to-br from-indigo-400 to-indigo-600 shadow-md group-hover/legend:scale-110 transition-transform"></div>
                          <div>
                            <p className="text-sm font-bold text-indigo-700">{t('boundaryAccessAnalytics.weekdayWeekendComparison.timePeriods.night')}</p>
                            <p className="text-xs text-indigo-600">22:00 - 06:00</p>
                          </div>
                        </div>
                      </div>

                      {/* Info Footer */}
                      <div className="mt-4 text-center text-xs text-[#64748B]">
                        {t('boundaryAccessAnalytics.weekdayWeekendComparison.distributionBasedOn')} <span className="font-semibold text-[#1A2332]">{/* total de registros aqui */} {t('boundaryAccessAnalytics.weekdayWeekendComparison.records')}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>



            {/* Status Table */}
            {(realTimeStatus.length > 0 || realTimeLoading) && (
              <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm overflow-hidden">
                {/* Header com Gradiente */}
                <div className="bg-gradient-to-r from-[#0F4C81] to-[#1a5c9e] p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-white">
                          {t('boundaryAccessAnalytics.tables.realTimeStatus.title')}
                        </h3>
                        <p className="text-sm text-white/80 mt-0.5">
                          {t('boundaryAccessAnalytics.tables.realTimeStatus.subtitle')}
                        </p>
                      </div>
                    </div>

                    {/* Badge de Status Ao Vivo */}
                    <div className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-xl">
                      <div className="relative">
                        <div className="w-2.5 h-2.5 bg-green-400 rounded-full animate-pulse"></div>
                        <div className="absolute inset-0 w-2.5 h-2.5 bg-green-400 rounded-full animate-ping"></div>
                      </div>
                      <span className="text-sm font-semibold text-white">{t('boundaryAccessAnalytics.tables.realTimeStatus.headers.live')}</span>
                    </div>
                  </div>
                </div>

                {/* Filtros Modernos */}
                <div className="p-6 bg-gradient-to-b from-gray-50 to-white border-b border-[#E2E8F0]">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                    {/* Filtro de Pessoa */}
                    <div className="group">
                      <label className="flex items-center gap-2 text-xs font-bold text-[#64748B] mb-2 uppercase tracking-wider">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        {t('boundaryAccessAnalytics.tables.realTimeStatus.filters.person')}
                      </label>
                      <div className="relative">
                        <select
                          value={realTimeFilters.itemName}
                          onChange={(e) => setRealTimeFilters({ ...realTimeFilters, itemName: e.target.value, page: 1 })}
                          disabled={realTimeLoading || filterOptionsLoading}
                          className="w-full pl-10 pr-4 py-2.5 text-sm border-2 border-[#E2E8F0] rounded-xl 
                                  focus:outline-none focus:ring-2 focus:ring-[#0F4C81]/20 focus:border-[#0F4C81] 
                                  disabled:bg-gray-50 disabled:cursor-not-allowed
                                  transition-all duration-200 appearance-none cursor-pointer
                                  hover:border-[#0F4C81]/50 group-hover:shadow-sm"
                          style={{
                            backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                            backgroundPosition: 'right 0.5rem center',
                            backgroundRepeat: 'no-repeat',
                            backgroundSize: '1.5em 1.5em',
                          }}
                        >
                          <option value="">{t('boundaryAccessAnalytics.tables.realTimeStatus.filters.allPersons')}</option>
                          {filterOptions.items.map((item) => (
                            <option key={item.item_id} value={item.item_name}>
                              {item.item_name} {item.item_code && `(${item.item_code})`}
                            </option>
                          ))}
                        </select>
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                          <svg className="w-5 h-5 text-[#64748B]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                          </svg>
                        </div>
                      </div>
                    </div>

                    {/* Filtro de Boundary */}
                    <div className="group">
                      <label className="flex items-center gap-2 text-xs font-bold text-[#64748B] mb-2 uppercase tracking-wider">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        {t('boundaryAccessAnalytics.tables.realTimeStatus.filters.boundary')}
                      </label>
                      <div className="relative">
                        <select
                          value={realTimeFilters.boundaryName}
                          onChange={(e) => setRealTimeFilters({ ...realTimeFilters, boundaryName: e.target.value, page: 1 })}
                          disabled={realTimeLoading || filterOptionsLoading}
                          className="w-full pl-10 pr-4 py-2.5 text-sm border-2 border-[#E2E8F0] rounded-xl 
                                  focus:outline-none focus:ring-2 focus:ring-[#0F4C81]/20 focus:border-[#0F4C81] 
                                  disabled:bg-gray-50 disabled:cursor-not-allowed
                                  transition-all duration-200 appearance-none cursor-pointer
                                  hover:border-[#0F4C81]/50 group-hover:shadow-sm"
                          style={{
                            backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                            backgroundPosition: 'right 0.5rem center',
                            backgroundRepeat: 'no-repeat',
                            backgroundSize: '1.5em 1.5em',
                          }}
                        >
                          <option value="">{t('boundaryAccessAnalytics.tables.realTimeStatus.filters.allBoundaries')}</option>
                          {filterOptions.boundaries.map((boundary) => (
                            <option key={boundary.boundary_id} value={boundary.boundary_name}>
                              {boundary.boundary_name}
                            </option>
                          ))}
                        </select>
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                          <svg className="w-5 h-5 text-[#64748B]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
                          </svg>
                        </div>
                      </div>
                    </div>

                    {/* Filtro de Status */}
                    <div className="group">
                      <label className="flex items-center gap-2 text-xs font-bold text-[#64748B] mb-2 uppercase tracking-wider">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {t('boundaryAccessAnalytics.tables.realTimeStatus.filters.status')}
                      </label>
                      <div className="relative">
                        <select
                          value={realTimeFilters.status}
                          onChange={(e) => setRealTimeFilters({ ...realTimeFilters, status: e.target.value, page: 1 })}
                          disabled={realTimeLoading}
                          className="w-full pl-10 pr-4 py-2.5 text-sm border-2 border-[#E2E8F0] rounded-xl 
                                  focus:outline-none focus:ring-2 focus:ring-[#0F4C81]/20 focus:border-[#0F4C81] 
                                  disabled:bg-gray-50 disabled:cursor-not-allowed
                                  transition-all duration-200 appearance-none cursor-pointer
                                  hover:border-[#0F4C81]/50 group-hover:shadow-sm"
                          style={{
                            backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                            backgroundPosition: 'right 0.5rem center',
                            backgroundRepeat: 'no-repeat',
                            backgroundSize: '1.5em 1.5em',
                          }}
                        >
                          <option value="">{t('boundaryAccessAnalytics.tables.realTimeStatus.filters.allStatus')}</option>
                          <option value="NORMAL">{t('boundaryAccessAnalytics.tables.realTimeStatus.statusOptions.normal')}</option>
                          <option value="LONG">{t('boundaryAccessAnalytics.tables.realTimeStatus.statusOptions.long')}</option>
                          <option value="ALERT">{t('boundaryAccessAnalytics.tables.realTimeStatus.statusOptions.alert')}</option>
                        </select>
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                          <svg className="w-5 h-5 text-[#64748B]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                          </svg>
                        </div>
                      </div>
                    </div>

                    {/* Duração Mín */}
                    <div className="group">
                      <label className="flex items-center gap-2 text-xs font-bold text-[#64748B] mb-2 uppercase tracking-wider">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {t('boundaryAccessAnalytics.tables.realTimeStatus.filters.minDuration')}
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          placeholder="0h"
                          min="0"
                          step="0.5"
                          value={realTimeFilters.minDuration}
                          onChange={(e) => setRealTimeFilters({ ...realTimeFilters, minDuration: e.target.value, page: 1 })}
                          disabled={realTimeLoading}
                          className="w-full pl-10 pr-4 py-2.5 text-sm border-2 border-[#E2E8F0] rounded-xl 
                                  focus:outline-none focus:ring-2 focus:ring-[#0F4C81]/20 focus:border-[#0F4C81] 
                                  disabled:bg-gray-50 disabled:cursor-not-allowed
                                  transition-all duration-200
                                  hover:border-[#0F4C81]/50 group-hover:shadow-sm"
                        />
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                          <svg className="w-5 h-5 text-[#64748B]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                          </svg>
                        </div>
                      </div>
                    </div>

                    {/* Duração Máx */}
                    <div className="group">
                      <label className="flex items-center gap-2 text-xs font-bold text-[#64748B] mb-2 uppercase tracking-wider">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {t('boundaryAccessAnalytics.tables.realTimeStatus.filters.maxDuration')}
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          placeholder="24h"
                          min="0"
                          step="0.5"
                          value={realTimeFilters.maxDuration}
                          onChange={(e) => setRealTimeFilters({ ...realTimeFilters, maxDuration: e.target.value, page: 1 })}
                          disabled={realTimeLoading}
                          className="w-full pl-10 pr-4 py-2.5 text-sm border-2 border-[#E2E8F0] rounded-xl 
                                  focus:outline-none focus:ring-2 focus:ring-[#0F4C81]/20 focus:border-[#0F4C81] 
                                  disabled:bg-gray-50 disabled:cursor-not-allowed
                                  transition-all duration-200
                                  hover:border-[#0F4C81]/50 group-hover:shadow-sm"
                        />
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                          <svg className="w-5 h-5 text-[#64748B]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Barra de Ações */}
                  <div className="flex flex-wrap items-center justify-between gap-4 mt-6 pt-6 border-t border-[#E2E8F0]">
                    {/* Contador de Resultados */}
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl border-2 border-[#E2E8F0]">
                        {realTimeLoading ? (
                          <>
                            <div className="w-4 h-4 border-2 border-[#0F4C81] border-t-transparent rounded-full animate-spin"></div>
                            <span className="text-sm font-medium text-[#64748B]">
                              {t('boundaryAccessAnalytics.tables.realTimeStatus.loading.spinner')}
                            </span>
                          </>
                        ) : (
                          <>
                            <svg className="w-5 h-5 text-[#0F4C81]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <span className="text-sm font-semibold text-[#1A2332]">
                              {realTimeStatus.length}
                            </span>
                            <span className="text-sm text-[#64748B]">
                              {t('boundaryAccessAnalytics.tables.realTimeStatus.results.of')} {realTimePagination.totalRecords}
                            </span>
                            {(realTimeFilters.itemName || realTimeFilters.boundaryName || realTimeFilters.status ||
                              realTimeFilters.minDuration || realTimeFilters.maxDuration) && (
                                <span className="inline-flex items-center gap-1 ml-2 px-2 py-0.5 bg-[#0F4C81]/10 text-[#0F4C81] rounded-lg text-xs font-semibold">
                                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                                  </svg>
                                  {t('boundaryAccessAnalytics.tables.realTimeStatus.results.filtered')}
                                </span>
                              )}
                          </>
                        )}
                      </div>
                    </div>

                    {/* Botões de Ação */}
                    <div className="flex items-center gap-3">
                      {/* Limpar Filtros */}
                      <button
                        onClick={() => setRealTimeFilters({
                          itemName: '',
                          boundaryName: '',
                          status: '',
                          minDuration: '',
                          maxDuration: '',
                          page: 1,
                          limit: 20
                        })}
                        disabled={realTimeLoading}
                        className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-[#64748B] 
                                bg-white border-2 border-[#E2E8F0] rounded-xl 
                                hover:bg-gray-50 hover:border-gray-300 hover:text-[#1A2332]
                                disabled:opacity-50 disabled:cursor-not-allowed
                                transition-all duration-200 shadow-sm hover:shadow"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        {t('boundaryAccessAnalytics.tables.realTimeStatus.actions.clearFilters')}
                      </button>

                      {/* Items por Página */}
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-[#64748B] uppercase tracking-wider">
                          {t('boundaryAccessAnalytics.tables.realTimeStatus.headers.show')}:
                        </span>
                        <select
                          value={realTimeFilters.limit}
                          onChange={(e) => handleLimitChange(Number(e.target.value))}
                          disabled={realTimeLoading}
                          className="pl-3 pr-8 py-2.5 text-sm font-medium border-2 border-[#E2E8F0] rounded-xl 
                                  focus:outline-none focus:ring-2 focus:ring-[#0F4C81]/20 focus:border-[#0F4C81]
                                  disabled:opacity-50 disabled:cursor-not-allowed
                                  transition-all duration-200 appearance-none cursor-pointer bg-white
                                  hover:border-[#0F4C81]/50 shadow-sm hover:shadow"
                          style={{
                            backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                            backgroundPosition: 'right 0.5rem center',
                            backgroundRepeat: 'no-repeat',
                            backgroundSize: '1.5em 1.5em',
                          }}
                        >
                          <option value={10}>10</option>
                          <option value={20}>20</option>
                          <option value={50}>50</option>
                          <option value={100}>100</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Tabela Estilizada */}
                <div className="relative">
                  {realTimeLoading && (
                    <div className="absolute inset-0 bg-white/90 backdrop-blur-md z-20 flex items-center justify-center">
                      <div className="text-center">
                        <div className="relative w-20 h-20 mx-auto mb-4">
                          <div className="absolute inset-0 border-4 border-[#E2E8F0] rounded-full"></div>
                          <div className="absolute inset-0 border-4 border-[#0F4C81] border-t-transparent rounded-full animate-spin"></div>
                          <div className="absolute inset-2 border-4 border-[#0F4C81]/30 border-b-transparent rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1s' }}></div>
                        </div>
                        <p className="text-sm text-[#1A2332] font-semibold mb-1">
                          {t('boundaryAccessAnalytics.tables.realTimeStatus.loading.data')}
                        </p>
                        <p className="text-xs text-[#64748B]">{t('boundaryAccessAnalytics.tables.realTimeStatus.loading.wait')}</p>
                      </div>
                    </div>
                  )}

                  <div className="overflow-x-auto">
                    <div className="max-h-[500px] overflow-y-auto">
                      <table className="w-full">
                        <thead className="bg-gradient-to-r from-gray-50 to-gray-100 sticky top-0 z-10">
                          <tr>
                            <th className="px-6 py-4 text-left">
                              <div className="flex items-center gap-2">
                                <svg className="w-4 h-4 text-[#0F4C81]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                                <span className="text-xs font-bold text-[#1A2332] uppercase tracking-wider">
                                  {t('boundaryAccessAnalytics.tables.realTimeStatus.headers.person')}
                                </span>
                              </div>
                            </th>
                            <th className="px-6 py-4 text-left">
                              <div className="flex items-center gap-2">
                                <svg className="w-4 h-4 text-[#0F4C81]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                </svg>
                                <span className="text-xs font-bold text-[#1A2332] uppercase tracking-wider">
                                  {t('boundaryAccessAnalytics.tables.realTimeStatus.headers.boundary')}
                                </span>
                              </div>
                            </th>
                            <th className="px-6 py-4 text-left">
                              <div className="flex items-center gap-2">
                                <svg className="w-4 h-4 text-[#0F4C81]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span className="text-xs font-bold text-[#1A2332] uppercase tracking-wider">
                                  {t('boundaryAccessAnalytics.tables.realTimeStatus.headers.entry')}
                                </span>
                              </div>
                            </th>
                            <th className="px-6 py-4 text-left">
                              <div className="flex items-center gap-2">
                                <svg className="w-4 h-4 text-[#0F4C81]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span className="text-xs font-bold text-[#1A2332] uppercase tracking-wider">
                                  {t('boundaryAccessAnalytics.tables.realTimeStatus.headers.duration')}
                                </span>
                              </div>
                            </th>
                            <th className="px-6 py-4 text-left">
                              <div className="flex items-center gap-2">
                                <svg className="w-4 h-4 text-[#0F4C81]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span className="text-xs font-bold text-[#1A2332] uppercase tracking-wider">
                                  {t('boundaryAccessAnalytics.tables.realTimeStatus.headers.status')}
                                </span>
                              </div>
                            </th>
                          </tr>
                        </thead>

                        <tbody className="divide-y divide-[#E2E8F0]">
                          {!realTimeLoading && realTimeStatus.length === 0 ? (
                            <tr>
                              <td colSpan={5} className="px-6 py-16">
                                <div className="flex flex-col items-center gap-4 text-center">
                                  <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center">
                                    <ExclamationTriangleIcon className="w-10 h-10 text-gray-400" />
                                  </div>
                                  <div>
                                    <p className="text-lg font-bold text-[#1A2332] mb-1">
                                      {t('boundaryAccessAnalytics.tables.realTimeStatus.results.noneFound')}
                                    </p>
                                    <p className="text-sm text-[#64748B]">
                                      {t('boundaryAccessAnalytics.tables.realTimeStatus.results.tryFilters')}
                                    </p>
                                  </div>
                                </div>
                              </td>
                            </tr>
                          ) : (
                            realTimeStatus.map((item, idx) => (
                              <tr
                                key={idx}
                                className="group hover:bg-gradient-to-r hover:from-[#0F4C81]/5 hover:to-transparent 
                                        transition-all duration-200 cursor-pointer"
                              >
                                <td className="px-6 py-4">
                                  <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-gradient-to-br from-[#0F4C81] to-[#1a5c9e] rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-sm group-hover:shadow-md transition-shadow">
                                      {item.item_name.substring(0, 2).toUpperCase()}
                                    </div>
                                    <span className="text-sm font-semibold text-[#1A2332] group-hover:text-[#0F4C81] transition-colors">
                                      {item.item_name}
                                    </span>
                                  </div>
                                </td>
                                <td className="px-6 py-4">
                                  <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 bg-[#0F4C81] rounded-full"></div>
                                    <span className="text-sm text-[#64748B] group-hover:text-[#1A2332] transition-colors">
                                      {item.boundary_name}
                                    </span>
                                  </div>
                                </td>
                                <td className="px-6 py-4">
                                  <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-gray-50 group-hover:bg-white rounded-lg border border-[#E2E8F0] transition-colors">
                                    <svg className="w-4 h-4 text-[#0F4C81]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <span className="text-sm font-mono font-medium text-[#1A2332]">
                                      {new Date(item.last_entry).toLocaleTimeString('pt-BR', {
                                        hour: '2-digit',
                                        minute: '2-digit'
                                      })}
                                    </span>
                                  </div>
                                </td>
                                <td className="px-6 py-4">
                                  <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 group-hover:bg-blue-100 rounded-lg border border-blue-200 transition-colors">
                                    <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                    </svg>
                                    <span className="text-sm font-mono font-bold text-blue-700">
                                      {item.duration_today_hours}h
                                    </span>
                                  </div>
                                </td>
                                <td className="px-6 py-4">
                                  <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider shadow-sm
                                    ${item.status === 'LONG'
                                      ? 'bg-gradient-to-r from-yellow-100 to-yellow-50 text-yellow-700 border border-yellow-200'
                                      : item.status === 'ALERT'
                                        ? 'bg-gradient-to-r from-red-100 to-red-50 text-red-700 border border-red-200'
                                        : 'bg-gradient-to-r from-green-100 to-green-50 text-green-700 border border-green-200'
                                    }`}>
                                    {item.status === 'LONG' ? (
                                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                      </svg>
                                    ) : item.status === 'ALERT' ? (
                                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                      </svg>
                                    ) : (
                                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                      </svg>
                                    )}
                                    {item.status === 'LONG'
                                      ? t('boundaryAccessAnalytics.tables.realTimeStatus.statuses.long')
                                      : item.status === 'ALERT'
                                        ? 'ALERTA'
                                        : t('boundaryAccessAnalytics.tables.realTimeStatus.statuses.normal')}
                                  </span>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

                {/* Paginação Moderna */}
                {!realTimeLoading && realTimePagination.totalPages > 1 && (
                  <div className="flex flex-wrap items-center justify-between gap-4 p-6 bg-gradient-to-b from-white to-gray-50 border-t border-[#E2E8F0]">
                    {/* Info da Página */}
                    <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl border-2 border-[#E2E8F0] shadow-sm">
                      <svg className="w-5 h-5 text-[#0F4C81]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <span className="text-sm font-medium text-[#64748B]">
                        {t('boundaryAccessAnalytics.tables.realTimeStatus.pagination.page')}
                      </span>
                      <span className="text-sm font-bold text-[#0F4C81]">
                        {realTimePagination.currentPage}
                      </span>
                      <span className="text-sm text-[#64748B]">
                        {t('boundaryAccessAnalytics.tables.realTimeStatus.results.of')}
                      </span>
                      <span className="text-sm font-bold text-[#1A2332]">
                        {realTimePagination.totalPages}
                      </span>
                    </div>

                    {/* Controles de Navegação */}
                    <div className="flex items-center gap-2">
                      {/* Primeira Página */}
                      <button
                        onClick={() => handlePageChange(1)}
                        disabled={!realTimePagination.hasPrevPage || realTimeLoading}
                        className="w-10 h-10 flex items-center justify-center text-[#0F4C81] bg-white border-2 border-[#E2E8F0] 
                                rounded-xl hover:bg-[#0F4C81] hover:text-white hover:border-[#0F4C81]
                                disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:text-[#0F4C81]
                                transition-all duration-200 shadow-sm hover:shadow font-bold"
                        title="Primeira página"
                      >
                        ««
                      </button>

                      {/* Página Anterior */}
                      <button
                        onClick={() => handlePageChange(realTimePagination.currentPage - 1)}
                        disabled={!realTimePagination.hasPrevPage || realTimeLoading}
                        className="w-10 h-10 flex items-center justify-center text-[#0F4C81] bg-white border-2 border-[#E2E8F0] 
                                rounded-xl hover:bg-[#0F4C81] hover:text-white hover:border-[#0F4C81]
                                disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:text-[#0F4C81]
                                transition-all duration-200 shadow-sm hover:shadow font-bold"
                        title="Página anterior"
                      >
                        ‹
                      </button>

                      {/* Números de Página */}
                      <div className="flex items-center gap-2">
                        {Array.from({ length: Math.min(5, realTimePagination.totalPages) }, (_, i) => {
                          let pageNum;
                          if (realTimePagination.totalPages <= 5) {
                            pageNum = i + 1;
                          } else if (realTimePagination.currentPage <= 3) {
                            pageNum = i + 1;
                          } else if (realTimePagination.currentPage >= realTimePagination.totalPages - 2) {
                            pageNum = realTimePagination.totalPages - 4 + i;
                          } else {
                            pageNum = realTimePagination.currentPage - 2 + i;
                          }

                          return (
                            <button
                              key={pageNum}
                              onClick={() => handlePageChange(pageNum)}
                              disabled={realTimeLoading}
                              className={`min-w-[40px] h-10 px-3 flex items-center justify-center rounded-xl font-bold text-sm
                                      transition-all duration-200 shadow-sm hover:shadow
                                      disabled:cursor-not-allowed
                                ${realTimePagination.currentPage === pageNum
                                  ? 'bg-gradient-to-r from-[#0F4C81] to-[#1a5c9e] text-white border-2 border-[#0F4C81] shadow-md scale-105'
                                  : 'text-[#0F4C81] bg-white border-2 border-[#E2E8F0] hover:bg-[#F5F7FA] hover:border-[#0F4C81]/50'
                                }`}
                            >
                              {pageNum}
                            </button>
                          );
                        })}
                      </div>

                      {/* Próxima Página */}
                      <button
                        onClick={() => handlePageChange(realTimePagination.currentPage + 1)}
                        disabled={!realTimePagination.hasNextPage || realTimeLoading}
                        className="w-10 h-10 flex items-center justify-center text-[#0F4C81] bg-white border-2 border-[#E2E8F0] 
                                rounded-xl hover:bg-[#0F4C81] hover:text-white hover:border-[#0F4C81]
                                disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:text-[#0F4C81]
                                transition-all duration-200 shadow-sm hover:shadow font-bold"
                        title="Próxima página"
                      >
                        ›
                      </button>

                      {/* Última Página */}
                      <button
                        onClick={() => handlePageChange(realTimePagination.totalPages)}
                        disabled={!realTimePagination.hasNextPage || realTimeLoading}
                        className="w-10 h-10 flex items-center justify-center text-[#0F4C81] bg-white border-2 border-[#E2E8F0] 
                                rounded-xl hover:bg-[#0F4C81] hover:text-white hover:border-[#0F4C81]
                                disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:text-[#0F4C81]
                                transition-all duration-200 shadow-sm hover:shadow font-bold"
                        title="Última página"
                      >
                        »»
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* NOVO: Mapa de Calor */}
            <div className={`bg-white rounded-2xl border-2 border-[#E2E8F0] shadow-lg overflow-hidden mb-6 transition-all duration-300 mt-6`}>
              {/* Header Moderno */}
              <div className="bg-gradient-to-r from-[#0F4C81] to-[#1a5c9e] p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-white mb-1">
                        {t('boundaryAccessAnalytics.maps.heatmap.title')}
                      </h3>
                      <p className="text-white/80 text-sm">
                        {t('boundaryAccessAnalytics.maps.heatmap.subtitle')}
                      </p>
                    </div>
                  </div>

                  {/* Stats Badge */}
                  <div className="hidden lg:flex items-center gap-4 px-6 py-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                        <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-xs text-white/80 font-medium">{t('boundaryAccessAnalytics.maps.heatmap.summary.totalBoundaries')}</p>
                        <p className="text-2xl font-bold text-white">{boundaryMapData.length}</p>
                      </div>
                    </div>
                    <div className="w-px h-12 bg-white/20"></div>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                        <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-xs text-white/80 font-medium">{t('boundaryAccessAnalytics.maps.heatmap.summary.zoneActive')}</p>
                        <p className="text-2xl font-bold text-white">{activeZones.length}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Container do Mapa */}
              <div className="relative">
                <div className="w-full h-[700px] p-6">
                  {topBoundaries.length === 0 ? (
                    <div className="w-full h-full flex items-center justify-center">
                      <ChartLoader />
                    </div>
                  ) : (
                    <BoundaryHeatmap
                      boundaries={boundaryMapData}
                      center={calculateMapCenter(boundaryMapData)}
                      zones={activeZones}
                      zoom={13}
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SECTION 2: Temporal */}
        {activeTab === 'temporal' && (
          <div className="animate-fade-in">

            <WeekdayWeekendComparison
              data={weekdayWeekendData}
              loading={loading}
              title="Análise: Dia Útil vs Final de Semana"
            />

            <BoundaryTrendsChart
              data={boundaryTrends}
              loading={loading}
            />

            <div className="bg-white rounded-xl border border-[#E2E8F0] p-6 mb-6">
              <div className="flex justify-between items-start pb-4 mb-4 border-b border-[#E2E8F0]">
                <div>
                  <div className="text-xl font-bold text-[#1A2332]">
                    {t('boundaryAccessAnalytics.charts.timeSeries.title')}
                  </div>
                  <div className="text-sm text-[#64748B] mt-1">
                    {t('boundaryAccessAnalytics.charts.timeSeries.subtitle')}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setSelectedPeriod('7d')}
                    className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all ${selectedPeriod === '7d'
                      ? 'bg-[#0F4C81] text-white border border-[#0F4C81]'
                      : 'bg-[#F5F7FA] text-[#64748B] border border-[#E2E8F0] hover:border-[#0F4C81] hover:text-[#0F4C81]'
                      }`}
                  >
                    {t('boundaryAccessAnalytics.tabs.days', { "days": '7' })}
                  </button>
                  <button
                    onClick={() => setSelectedPeriod('30d')}
                    className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all ${selectedPeriod === '30d'
                      ? 'bg-[#0F4C81] text-white border border-[#0F4C81]'
                      : 'bg-[#F5F7FA] text-[#64748B] border border-[#E2E8F0] hover:border-[#0F4C81] hover:text-[#0F4C81]'
                      }`}
                  >
                    {t('boundaryAccessAnalytics.tabs.days', { "days": '30' })}
                  </button>
                  <button
                    onClick={() => setSelectedPeriod('90d')}
                    className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all ${selectedPeriod === '90d'
                      ? 'bg-[#0F4C81] text-white border border-[#0F4C81]'
                      : 'bg-[#F5F7FA] text-[#64748B] border border-[#E2E8F0] hover:border-[#0F4C81] hover:text-[#0F4C81]'
                      }`}
                  >
                    {t('boundaryAccessAnalytics.tabs.days', { "days": '90' })}
                  </button>
                </div>
              </div>
              {chartLoadingStates.timeseries ? (
                <ChartLoader />
              ) : (
                <div ref={chartRefs.timeseries} className="w-full h-[500px]"></div>
              )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl border border-[#E2E8F0] p-6">
                <div className="pb-4 mb-4 border-b border-[#E2E8F0]">
                  <div className="text-lg font-bold text-[#1A2332]">
                    {t('boundaryAccessAnalytics.charts.weeklyTrends.title')}
                  </div>
                  <div className="text-sm text-[#64748B] mt-1">
                    {t('boundaryAccessAnalytics.charts.weeklyTrends.subtitle')}
                  </div>
                </div>
                {chartLoadingStates.weeklyTrends ? (
                  <ChartLoader />
                ) : (
                  <div ref={chartRefs.weeklyTrends} className="w-full h-[400px]"></div>
                )}
              </div>

              <div className="bg-white rounded-xl border border-[#E2E8F0] p-6">
                <div className="pb-4 mb-4 border-b border-[#E2E8F0]">
                  <div className="text-lg font-bold text-[#1A2332]">
                    {t('boundaryAccessAnalytics.charts.weeklyPattern.title')}
                  </div>
                  <div className="text-sm text-[#64748B] mt-1">
                    {t('boundaryAccessAnalytics.charts.weeklyPattern.subtitle')}
                  </div>
                </div>
                {chartLoadingStates.weeklyPattern ? (
                  <ChartLoader />
                ) : (
                  <div ref={chartRefs.weeklyPattern} className="w-full h-[400px]"></div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* SECTION 3: Heatmap */}
        {activeTab === 'heatmap' && (
          <div className="animate-fade-in">
            <div className="bg-white rounded-xl border border-[#E2E8F0] p-6">
              <div className="flex justify-between items-center pb-4 mb-4 border-b border-[#E2E8F0]">
                <div>
                  <div className="text-xl font-bold text-[#1A2332]">
                    {t('boundaryAccessAnalytics.charts.heatmap.title')}
                  </div>
                  <div className="text-sm text-[#64748B] mt-1">
                    {t('boundaryAccessAnalytics.charts.heatmap.subtitle')}
                  </div>
                </div>
              </div>
              {chartLoadingStates.heatmap ? (
                <ChartLoader />
              ) : (
                // <div ref={chartRefs.heatmap} className="w-full h-[500px]"></div>
                  <div className="animate-fade-in">
                  <EnhancedHeatmap 
                    data={heatmap}
                    loading={loading}
                  />
                </div>
              )}
            </div>
          </div>
        )}

        {/* SECTION 4: Anomalies */}
        {activeTab === 'anomalies' && (
          <div className="animate-fade-in">

            {/* KPIs de Anomalias */}
            {anomalyKpis && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">

                <div className="bg-white rounded-xl border border-[#E2E8F0] p-6 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 relative overflow-hidden group">
                  <div className="absolute top-0 left-0 w-1 h-full bg-[#FF6B35] transform scale-y-0 group-hover:scale-y-100 transition-transform duration-300"></div>
                  <div className="text-sm text-[#64748B] uppercase tracking-wider font-semibold mb-2">
                    {t('boundaryAccessAnalytics.anomalyKpis.detectedAnomalies')}
                  </div>
                  <div className="text-4xl font-bold text-[#0F4C81] font-mono mb-2">
                    {anomalyKpis.detected_anomalies.toLocaleString()}
                  </div>
                  <div className="text-xs text-[#64748B] mt-1">
                    {t('boundaryAccessAnalytics.anomalyKpis.totalDetected')}
                  </div>
                </div>

                <div className="bg-white rounded-xl border border-[#E2E8F0] p-6 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 relative overflow-hidden group">
                  <div className="absolute top-0 left-0 w-1 h-full bg-[#EF4444] transform scale-y-0 group-hover:scale-y-100 transition-transform duration-300"></div>
                  <div className="text-sm text-[#64748B] uppercase tracking-wider font-semibold mb-2">
                    {t('boundaryAccessAnalytics.anomalyKpis.extremeAnomalies')}
                  </div>
                  <div className="text-4xl font-bold text-[#EF4444] font-mono mb-2">
                    {parseInt(anomalyKpis.extreme_anomalies).toLocaleString()}
                  </div>
                  <div className="inline-flex items-center gap-1 px-2 py-1 rounded bg-red-50 text-red-600 text-xs font-semibold">
                    <ExclamationTriangleIcon className="w-3 h-3" />
                    {t('boundaryAccessAnalytics.anomalyKpis.critical')}
                  </div>
                </div>

                <div className="bg-white rounded-xl border border-[#E2E8F0] p-6 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 relative overflow-hidden group">
                  <div className="absolute top-0 left-0 w-1 h-full bg-[#F59E0B] transform scale-y-0 group-hover:scale-y-100 transition-transform duration-300"></div>
                  <div className="text-sm text-[#64748B] uppercase tracking-wider font-semibold mb-2">
                    {t('boundaryAccessAnalytics.anomalyKpis.highAnomalies')}
                  </div>
                  <div className="text-4xl font-bold text-[#F59E0B] font-mono mb-2">
                    {parseInt(anomalyKpis.high_anomalies).toLocaleString()}
                  </div>
                  <div className="inline-flex items-center gap-1 px-2 py-1 rounded bg-yellow-50 text-yellow-600 text-xs font-semibold">
                    <ExclamationTriangleIcon className="w-3 h-3" />
                    {t('boundaryAccessAnalytics.anomalyKpis.warning')}
                  </div>
                </div>

                <div className="bg-white rounded-xl border border-[#E2E8F0] p-6 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 relative overflow-hidden group">
                  <div className="absolute top-0 left-0 w-1 h-full bg-[#10B981] transform scale-y-0 group-hover:scale-y-100 transition-transform duration-300"></div>
                  <div className="text-sm text-[#64748B] uppercase tracking-wider font-semibold mb-2">
                    {t('boundaryAccessAnalytics.anomalyKpis.avgZScore')}
                  </div>
                  <div className="text-4xl font-bold text-[#0F4C81] font-mono mb-2">
                    {anomalyKpis.avg_z_score.toFixed(4)}
                  </div>
                  <div className="text-xs text-[#64748B] mt-1">
                    {t('boundaryAccessAnalytics.anomalyKpis.standardDeviation')}
                  </div>
                </div>
              </div>
            )}

            <BoundaryAnomaliesChart data={boundaryAnomalies} loading={loading} />

            {/* Gráfico de Anomalias - Largura Total */}
            <div className="bg-white rounded-xl border border-[#E2E8F0] p-6 mb-6">
              <div className="flex justify-between items-center pb-4 mb-4 border-b border-[#E2E8F0]">
                <div>
                  <div className="text-xl font-bold text-[#1A2332]">
                    {t('boundaryAccessAnalytics.charts.anomalies.title')}
                  </div>
                  <div className="text-sm text-[#64748B] mt-1">
                    {t('boundaryAccessAnalytics.charts.anomalies.subtitle')}
                  </div>
                </div>
              </div>
              {chartLoadingStates.anomalies ? (
                <ChartLoader />
              ) : (
                <div ref={chartRefs.anomalies} className="w-full h-[500px]"></div>
              )}
            </div>

            {/* Tabela Top 10 Anomalias - Largura Total */}
            <div className="bg-white rounded-xl border border-[#E2E8F0] p-6">
              <div className="flex justify-between items-center pb-4 mb-4 border-b border-[#E2E8F0]">
                <div>
                  <div className="text-xl font-bold text-[#1A2332]">
                    {t('boundaryAccessAnalytics.table.topAnomalies.title')}
                  </div>
                  <div className="text-sm text-[#64748B] mt-1">
                    {t('boundaryAccessAnalytics.table.topAnomalies.subtitle')}
                  </div>
                </div>
              </div>

              {chartLoadingStates.topAnomalies ? (
                <ChartLoader />
              ) : (
                <div className="overflow-x-auto overflow-y-auto max-h-[500px]">
                  <table className="w-full">
                    <thead className="bg-[#F5F7FA] sticky top-0 z-10">
                      <tr>
                        <th className="px-3 py-2 text-left text-xs font-semibold text-[#64748B] uppercase border-b-2 border-[#E2E8F0]">
                          #
                        </th>
                        <th className="px-3 py-2 text-left text-xs font-semibold text-[#64748B] uppercase border-b-2 border-[#E2E8F0]">
                          {t('boundaryAccessAnalytics.table.topAnomalies.headers.datetime')}
                        </th>
                        <th className="px-3 py-2 text-left text-xs font-semibold text-[#64748B] uppercase border-b-2 border-[#E2E8F0]">
                          {t('boundaryAccessAnalytics.table.topAnomalies.headers.person')}
                        </th>
                        <th className="px-3 py-2 text-left text-xs font-semibold text-[#64748B] uppercase border-b-2 border-[#E2E8F0]">
                          {t('boundaryAccessAnalytics.table.topAnomalies.headers.boundary')}
                        </th>
                        <th className="px-3 py-2 text-right text-xs font-semibold text-[#64748B] uppercase border-b-2 border-[#E2E8F0]">
                          {t('boundaryAccessAnalytics.table.topAnomalies.headers.duration')}
                        </th>
                        <th className="px-3 py-2 text-right text-xs font-semibold text-[#64748B] uppercase border-b-2 border-[#E2E8F0]">
                          {t('boundaryAccessAnalytics.table.topAnomalies.headers.zScore')}
                        </th>
                        <th className="px-3 py-2 text-center text-xs font-semibold text-[#64748B] uppercase border-b-2 border-[#E2E8F0]">
                          {t('boundaryAccessAnalytics.table.topAnomalies.headers.level')}
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {topAnomalies.map((item, idx) => (
                        <tr key={idx} className="hover:bg-[#0F4C81]/5 transition-colors">
                          <td className="px-3 py-2 border-b border-[#E2E8F0] text-sm font-bold text-[#0F4C81]">
                            {idx + 1}
                          </td>
                          <td className="px-3 py-2 border-b border-[#E2E8F0] font-mono text-xs">
                            {formatDateTime(item.entry_datetime)}
                          </td>
                          <td className="px-3 py-2 border-b border-[#E2E8F0] text-xs font-medium">
                            {item.item_name}
                          </td>
                          <td className="px-3 py-2 border-b border-[#E2E8F0] text-xs">
                            {item.boundary_name}
                          </td>
                          <td className="px-3 py-2 border-b border-[#E2E8F0] font-mono text-xs text-right">
                            {parseFloat(item.duration_hours).toFixed(2)}h
                          </td>
                          <td className="px-3 py-2 border-b border-[#E2E8F0] font-mono text-xs text-right font-bold text-[#EF4444]">
                            {item.z_score.toFixed(2)}
                          </td>
                          <td className="px-3 py-2 border-b border-[#E2E8F0] text-center">
                            {getAnomalyBadge(item.anomaly_level)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* SECTION 5: Flow */}
        {activeTab === 'flow' && (
          <div className="animate-fade-in">

            {/* Logo após os KPIs Secundários - Estilo Visual com Gráficos */}
            <div className="mb-8">
              {chartLoadingStates.boundaryDuration !== false && topBoundaries.length === 0 ? (
                <div className="bg-white rounded-2xl border-2 border-[#E2E8F0] shadow-lg overflow-hidden p-6">
                  <div className="w-full h-[450px] flex items-center justify-center">
                    <div className="text-center">
                      <div className="relative w-20 h-20 mx-auto mb-4">
                        <div className="absolute inset-0 border-4 border-[#E2E8F0] rounded-full"></div>
                        <div className="absolute inset-0 border-4 border-[#0F4C81] border-t-transparent rounded-full animate-spin"></div>
                        <div className="absolute inset-2 border-4 border-[#0F4C81]/30 border-b-transparent rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1s' }}></div>
                      </div>
                      <p className="text-sm text-[#1A2332] font-semibold mb-1">Carregando análise de duração...</p>
                      <p className="text-xs text-[#64748B]">Por favor, aguarde</p>
                    </div>
                  </div>
                </div>
              ) : (

                <BoundaryTransitionSankey
                  data={boundaryTransitionsByDuration}
                  loading={loading}
                  title={t('boundaryAccessAnalytics.boundaryTransitionSankey.title')}
                />
              )}
            </div>

            <div className="bg-white rounded-xl border border-[#E2E8F0] p-6 mb-6">
              <div className="flex justify-between items-center pb-4 mb-4 border-b border-[#E2E8F0]">
                <div>
                  <div className="text-xl font-bold text-[#1A2332]">
                    {t('boundaryAccessAnalytics.charts.sankey.title')}
                  </div>
                  <div className="text-sm text-[#64748B] mt-1">
                    {t('boundaryAccessAnalytics.charts.sankey.subtitle')}
                  </div>
                </div>
              </div>
              {chartLoadingStates.sankey ? (
                <ChartLoader />
              ) : (
                <div ref={chartRefs.sankey} className="w-full h-[600px]"></div>
              )}
            </div>

            <div className="bg-white rounded-xl border border-[#E2E8F0] p-6">
              <div className="flex justify-between items-center pb-4 mb-4 border-b border-[#E2E8F0]">
                <div>
                  <div className="text-xl font-bold text-[#1A2332]">
                    {t('boundaryAccessAnalytics.tables.topTransitions.title')}
                  </div>
                  <div className="text-sm text-[#64748B] mt-1">
                    {t('boundaryAccessAnalytics.tables.topTransitions.subtitle')}
                  </div>
                </div>
              </div>
              {chartLoadingStates.topTransitions ? (
                <ChartLoader />
              ) : (
                <div ref={chartRefs.topTransitions} className="w-full h-[500px]"></div>
              )}
            </div>
          </div>
        )}

        {/* SECTION 6: Compliance */}
        {activeTab === 'compliance' && (
          <div className="animate-fade-in">
            {/* KPIs de Compliance Metrics */}
            {complianceMetrics && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                <div className="bg-white rounded-xl border border-[#E2E8F0] p-6 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 relative overflow-hidden group">
                  <div className="absolute top-0 left-0 w-1 h-full bg-[#0F4C81] transform scale-y-0 group-hover:scale-y-100 transition-transform duration-300"></div>
                  <div className="text-sm text-[#64748B] uppercase tracking-wider font-semibold mb-2">
                    {t('boundaryAccessAnalytics.complianceMetrics.totalVisits')}
                  </div>
                  <div className="text-4xl font-bold text-[#0F4C81] font-mono mb-2">
                    {parseInt(complianceMetrics.total_visits).toLocaleString()}
                  </div>
                  <div className="text-xs text-[#64748B] mt-1">
                    {t('boundaryAccessAnalytics.complianceMetrics.allBoundaries')}
                  </div>
                </div>

                <div className="bg-white rounded-xl border border-[#E2E8F0] p-6 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 relative overflow-hidden group">
                  <div className="absolute top-0 left-0 w-1 h-full bg-[#EF4444] transform scale-y-0 group-hover:scale-y-100 transition-transform duration-300"></div>
                  <div className="text-sm text-[#64748B] uppercase tracking-wider font-semibold mb-2">
                    {t('boundaryAccessAnalytics.complianceMetrics.totalAlerts')}
                  </div>
                  <div className="text-4xl font-bold text-[#EF4444] font-mono mb-2">
                    {parseInt(complianceMetrics.total_alerts).toLocaleString()}
                  </div>
                  <div className="inline-flex items-center gap-1 px-2 py-1 rounded bg-red-50 text-red-600 text-xs font-semibold">
                    <ExclamationTriangleIcon className="w-3 h-3" />
                    {parseFloat(complianceMetrics.avg_alert_rte).toFixed(1)}% {t('boundaryAccessAnalytics.complianceMetrics.avgRate')}
                  </div>
                </div>

                <div className="bg-white rounded-xl border border-[#E2E8F0] p-6 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 relative overflow-hidden group">
                  <div className="absolute top-0 left-0 w-1 h-full bg-[#F59E0B] transform scale-y-0 group-hover:scale-y-100 transition-transform duration-300"></div>
                  <div className="text-sm text-[#64748B] uppercase tracking-wider font-semibold mb-2">
                    {t('boundaryAccessAnalytics.complianceMetrics.offHoursEntries')}
                  </div>
                  <div className="text-4xl font-bold text-[#F59E0B] font-mono mb-2">
                    {parseInt(complianceMetrics.total_off_hours).toLocaleString()}
                  </div>
                  <div className="inline-flex items-center gap-1 px-2 py-1 rounded bg-orange-50 text-orange-600 text-xs font-semibold">
                    <ClockIcon className="w-3 h-3" />
                    {parseFloat(complianceMetrics.avg_off_hours_pct).toFixed(1)}% {t('boundaryAccessAnalytics.complianceMetrics.avgRate')}
                  </div>
                </div>

                <div className="bg-white rounded-xl border border-[#E2E8F0] p-6 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 relative overflow-hidden group">
                  <div className="absolute top-0 left-0 w-1 h-full bg-[#10B981] transform scale-y-0 group-hover:scale-y-100 transition-transform duration-300"></div>
                  <div className="text-sm text-[#64748B] uppercase tracking-wider font-semibold mb-2">
                    {t('boundaryAccessAnalytics.complianceMetrics.weekendVisits')}
                  </div>
                  <div className="text-4xl font-bold text-[#10B981] font-mono mb-2">
                    {parseInt(complianceMetrics.total_weekend).toLocaleString()}
                  </div>
                  <div className="inline-flex items-center gap-1 px-2 py-1 rounded bg-green-50 text-green-600 text-xs font-semibold">
                    {parseFloat(complianceMetrics.avg_weekend_pct).toFixed(1)}% {t('boundaryAccessAnalytics.complianceMetrics.avgRate')}
                  </div>
                </div>
              </div>
            )}

            {/* Gráficos */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <div className="bg-white rounded-xl border border-[#E2E8F0] p-6">
                <div className="flex justify-between items-center pb-4 mb-4 border-b border-[#E2E8F0]">
                  <div>
                    <div className="text-xl font-bold text-[#1A2332]">
                      {t('boundaryAccessAnalytics.charts.durationBuckets.title')}
                    </div>
                    <div className="text-sm text-[#64748B] mt-1">
                      {t('boundaryAccessAnalytics.charts.durationBuckets.subtitle')}
                    </div>
                  </div>
                </div>
                {chartLoadingStates.durationBuckets ? (
                  <ChartLoader />
                ) : (
                  <div ref={chartRefs.durationBuckets} className="w-full h-[400px]"></div>
                )}
              </div>

              <div className="bg-white rounded-xl border border-[#E2E8F0] p-6">
                <div className="flex justify-between items-center pb-4 mb-4 border-b border-[#E2E8F0]">
                  <div>
                    <div className="text-xl font-bold text-[#1A2332]">
                      {t('boundaryAccessAnalytics.charts.alertRate.title')}
                    </div>
                    <div className="text-sm text-[#64748B] mt-1">
                      {t('boundaryAccessAnalytics.charts.alertRate.subtitle')}
                    </div>
                  </div>
                </div>
                {chartLoadingStates.alertRate ? (
                  <ChartLoader />
                ) : (
                  <div ref={chartRefs.alertRate} className="w-full h-[400px]"></div>
                )}
              </div>
            </div>

            {/* Tabela de Compliance Summary */}
            <div className="bg-white rounded-xl border border-[#E2E8F0] p-6">
              <div className="flex justify-between items-center pb-4 mb-4 border-b border-[#E2E8F0]">
                <div>
                  <div className="text-xl font-bold text-[#1A2332]">
                    {t('boundaryAccessAnalytics.table.complianceSummary.title')}
                  </div>
                  <div className="text-sm text-[#64748B] mt-1">
                    {t('boundaryAccessAnalytics.table.complianceSummary.subtitle')}
                  </div>
                </div>
              </div>

              {chartLoadingStates.complianceSummary ? (
                <ChartLoader />
              ) : (
                <div className="overflow-x-auto overflow-y-auto max-h-[500px]">
                  <table className="w-full">
                    <thead className="bg-[#F5F7FA] sticky top-0 z-10">
                      <tr>
                        <th className="px-3 py-2 text-left text-xs font-semibold text-[#64748B] uppercase border-b-2 border-[#E2E8F0]">
                          {t('boundaryAccessAnalytics.table.complianceSummary.headers.boundary')}
                        </th>
                        <th className="px-3 py-2 text-right text-xs font-semibold text-[#64748B] uppercase border-b-2 border-[#E2E8F0]">
                          {t('boundaryAccessAnalytics.table.complianceSummary.headers.totalVisits')}
                        </th>
                        <th className="px-3 py-2 text-right text-xs font-semibold text-[#64748B] uppercase border-b-2 border-[#E2E8F0]">
                          {t('boundaryAccessAnalytics.table.complianceSummary.headers.alertRate')}
                        </th>
                        <th className="px-3 py-2 text-right text-xs font-semibold text-[#64748B] uppercase border-b-2 border-[#E2E8F0]">
                          {t('boundaryAccessAnalytics.table.complianceSummary.headers.offHours')}
                        </th>
                        <th className="px-3 py-2 text-right text-xs font-semibold text-[#64748B] uppercase border-b-2 border-[#E2E8F0]">
                          {t('boundaryAccessAnalytics.table.complianceSummary.headers.weekend')}
                        </th>
                        <th className="px-3 py-2 text-center text-xs font-semibold text-[#64748B] uppercase border-b-2 border-[#E2E8F0]">
                          {t('boundaryAccessAnalytics.table.complianceSummary.headers.status')}
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {Array.isArray(complianceSummary) && complianceSummary.map((item, idx) => (
                        <tr key={idx} className="hover:bg-[#0F4C81]/5 transition-colors">
                          <td className="px-3 py-2 border-b border-[#E2E8F0] text-sm font-medium">
                            {item.boundary_name}
                          </td>
                          <td className="px-3 py-2 border-b border-[#E2E8F0] font-mono text-sm text-right">
                            {item.total_visits.toLocaleString()}
                          </td>
                          <td className="px-3 py-2 border-b border-[#E2E8F0] font-mono text-sm text-right">
                            <span className={`font-semibold ${parseFloat(item.alert_rate_pct) > 50 ? 'text-red-600' : 'text-[#64748B]'}`}>
                              {parseFloat(item.alert_rate_pct).toFixed(1)}%
                            </span>
                          </td>
                          <td className="px-3 py-2 border-b border-[#E2E8F0] font-mono text-sm text-right">
                            <span className={`font-semibold ${parseFloat(item.off_hours_entry_pct) > 50 ? 'text-orange-600' : 'text-[#64748B]'}`}>
                              {parseFloat(item.off_hours_entry_pct).toFixed(1)}%
                            </span>
                          </td>
                          <td className="px-3 py-2 border-b border-[#E2E8F0] font-mono text-sm text-right">
                            <span className={`font-semibold ${parseFloat(item.weekend_visit_pct) > 30 ? 'text-yellow-600' : 'text-[#64748B]'}`}>
                              {parseFloat(item.weekend_visit_pct).toFixed(1)}%
                            </span>
                          </td>
                          <td className="px-3 py-2 border-b border-[#E2E8F0] text-center">
                            {getComplianceStatusBadge(item.status)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* SECTION 7: Rankings */}
        {activeTab === 'rankings' && (
          <div className="animate-fade-in">
            {/* Gráficos */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <div className="bg-white rounded-xl border border-[#E2E8F0] p-6">
                <div className="flex justify-between items-center pb-4 mb-4 border-b border-[#E2E8F0]">
                  <div>
                    <div className="text-xl font-bold text-[#1A2332]">
                      {t('boundaryAccessAnalytics.charts.topPeople.title')}
                    </div>
                    <div className="text-sm text-[#64748B] mt-1">
                      {t('boundaryAccessAnalytics.charts.topPeople.subtitle')}
                    </div>
                  </div>
                </div>
                {chartLoadingStates.topPeople ? (
                  <ChartLoader />
                ) : (
                  <div ref={chartRefs.topPeople} className="w-full h-[400px]"></div>
                )}
              </div>

              <div className="bg-white rounded-xl border border-[#E2E8F0] p-6">
                <div className="flex justify-between items-center pb-4 mb-4 border-b border-[#E2E8F0]">
                  <div>
                    <div className="text-xl font-bold text-[#1A2332]">
                      {t('boundaryAccessAnalytics.charts.frequency.title')}
                    </div>
                    <div className="text-sm text-[#64748B] mt-1">
                      {t('boundaryAccessAnalytics.charts.frequency.subtitle')}
                    </div>
                  </div>
                </div>
                {chartLoadingStates.frequency ? (
                  <ChartLoader />
                ) : (
                  <div ref={chartRefs.frequency} className="w-full h-[400px]"></div>
                )}
              </div>
            </div>

            {/* Tabela de Ranking Detalhado */}
            <div className="bg-white rounded-xl border border-[#E2E8F0] p-6">
              <div className="flex justify-between items-center pb-4 mb-4 border-b border-[#E2E8F0]">
                <div>
                  <div className="text-xl font-bold text-[#1A2332]">
                    {t('boundaryAccessAnalytics.table.detailedRanking.title')}
                  </div>
                  <div className="text-sm text-[#64748B] mt-1">
                    {t('boundaryAccessAnalytics.table.detailedRanking.subtitle')}
                  </div>
                </div>
              </div>

              {chartLoadingStates.detailedRanking ? (
                <ChartLoader />
              ) : (
                <div className="overflow-x-auto overflow-y-auto max-h-[600px]">
                  <table className="w-full">
                    <thead className="bg-[#F5F7FA] sticky top-0 z-10">
                      <tr>
                        <th className="px-3 py-2 text-center text-xs font-semibold text-[#64748B] uppercase border-b-2 border-[#E2E8F0]">
                          {t('boundaryAccessAnalytics.table.detailedRanking.headers.rank')}
                        </th>
                        <th className="px-3 py-2 text-left text-xs font-semibold text-[#64748B] uppercase border-b-2 border-[#E2E8F0]">
                          {t('boundaryAccessAnalytics.table.detailedRanking.headers.person')}
                        </th>
                        <th className="px-3 py-2 text-left text-xs font-semibold text-[#64748B] uppercase border-b-2 border-[#E2E8F0]">
                          {t('boundaryAccessAnalytics.table.detailedRanking.headers.boundary')}
                        </th>
                        <th className="px-3 py-2 text-right text-xs font-semibold text-[#64748B] uppercase border-b-2 border-[#E2E8F0]">
                          {t('boundaryAccessAnalytics.table.detailedRanking.headers.duration')}
                        </th>
                        <th className="px-3 py-2 text-right text-xs font-semibold text-[#64748B] uppercase border-b-2 border-[#E2E8F0]">
                          {t('boundaryAccessAnalytics.table.detailedRanking.headers.visits')}
                        </th>
                        <th className="px-3 py-2 text-right text-xs font-semibold text-[#64748B] uppercase border-b-2 border-[#E2E8F0]">
                          {t('boundaryAccessAnalytics.table.detailedRanking.headers.activeDays')}
                        </th>
                        <th className="px-3 py-2 text-right text-xs font-semibold text-[#64748B] uppercase border-b-2 border-[#E2E8F0]">
                          {t('boundaryAccessAnalytics.table.detailedRanking.headers.avgPerVisit')}
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {Array.isArray(detailedRanking) && detailedRanking.map((item, idx) => (
                        <tr key={idx} className="hover:bg-[#0F4C81]/5 transition-colors">
                          <td className="px-3 py-2 border-b border-[#E2E8F0] text-center">
                            {getRankBadge(item.rank)}
                          </td>
                          <td className="px-3 py-2 border-b border-[#E2E8F0] text-sm font-medium">
                            {item.item_name}
                          </td>
                          <td className="px-3 py-2 border-b border-[#E2E8F0] text-xs">
                            {item.boundary_name}
                          </td>
                          <td className="px-3 py-2 border-b border-[#E2E8F0] font-mono text-sm text-right font-bold text-[#0F4C81]">
                            {parseFloat(item.duration).toFixed(2)}h
                          </td>
                          <td className="px-3 py-2 border-b border-[#E2E8F0] font-mono text-sm text-right">
                            {item.visits.toLocaleString()}
                          </td>
                          <td className="px-3 py-2 border-b border-[#E2E8F0] font-mono text-sm text-right">
                            {item.total_active_days}
                          </td>
                          <td className="px-3 py-2 border-b border-[#E2E8F0] font-mono text-xs text-right text-[#64748B]">
                            {parseFloat(item.avg_per_visit).toFixed(2)} min
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}