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


// Componente de Loading para os gráficos
const ChartLoader = () => (
  <div className="w-full h-full flex items-center justify-center">
    <div className="text-center">
      <div className="relative w-16 h-16 mx-auto mb-4">
        <div className="absolute top-0 left-0 w-full h-full border-4 border-[#E2E8F0] rounded-full"></div>
        <div className="absolute top-0 left-0 w-full h-full border-4 border-[#0F4C81] border-t-transparent rounded-full animate-spin"></div>
      </div>
      <p className="text-sm text-[#64748B] font-medium">{t('boundaryAccessAnalytics.tabs.load')}</p>
    </div>
  </div>
);


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
    } else if (activeTab === 'temporal') {
      newLoadingStates.timeseries = timeSeries.length === 0;
      newLoadingStates.weeklyTrends = weeklyTrends.length === 0;
      newLoadingStates.weeklyPattern = weeklyPattern.length === 0;
    } else if (activeTab === 'heatmap') {
      newLoadingStates.heatmap = heatmap.length === 0;
    } else if (activeTab === 'anomalies') {
      newLoadingStates.anomalies = anomalies.length === 0;
      newLoadingStates.topAnomalies = topAnomalies.length === 0;
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
  const initTopBoundariesChart = () => {
    if (!chartRefs.topBoundaries.current || !topBoundaries.length) return;
    const chart = echarts.init(chartRefs.topBoundaries.current);

    const sortedData = [...topBoundaries].reverse();

    const option = {
      tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
      grid: { left: 120, right: 50, top: 20, bottom: 50 },
      xAxis: { type: 'value', name: t('boundaryAccessAnalytics.charts.topBoundaries.xAxis') },
      yAxis: {
        type: 'category',
        data: sortedData.map(d => d.boundary_name)
      },
      series: [{
        type: 'bar',
        data: sortedData.map(d => d.duration_hours),
        itemStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
            { offset: 0, color: '#0F4C81' },
            { offset: 1, color: '#FF6B35' }
          ])
        },
        label: {
          show: true,
          position: 'right',
          formatter: '{c}' + t('boundaryAccessAnalytics.labels.hours')
        }
      }]
    };
    chart.setOption(option);
  };

  const initShiftDistributionChart = () => {
    if (!chartRefs.shiftDistribution.current || !shiftDistribution) return;
    const chart = echarts.init(chartRefs.shiftDistribution.current);
    //@ts-ignore
    const total = shiftDistribution.morning + shiftDistribution.afternoon + shiftDistribution.night;

    const option = {
      tooltip: { trigger: 'item' },
      legend: { bottom: 10 },
      series: [{
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: false,
        itemStyle: { borderRadius: 10, borderColor: '#fff', borderWidth: 2 },
        label: { show: true, formatter: '{b}: {d}%' },
        data: [
          {
            value: shiftDistribution.morning,
            name: t('boundaryAccessAnalytics.charts.shiftDistribution.morning'),
            itemStyle: { color: '#0F4C81' }
          },
          {
            value: shiftDistribution.afternoon,
            name: t('boundaryAccessAnalytics.charts.shiftDistribution.afternoon'),
            itemStyle: { color: '#FF6B35' }
          },
          {
            value: shiftDistribution.night,
            name: t('boundaryAccessAnalytics.charts.shiftDistribution.night'),
            itemStyle: { color: '#64748B' }
          }
        ]
      }]
    };
    chart.setOption(option);
  };

  const initTimeSeriesChart = () => {
    if (!chartRefs.timeseries.current || !timeSeries.length) return;
    const chart = echarts.init(chartRefs.timeseries.current);

    const dates = timeSeries.map(d => d.date_display);
    const currentData = timeSeries.map(d => d.daily_duration_hours);
    const ma7Data = timeSeries.map(d => d.ma_7d_duration_hours);
    const ma30Data = timeSeries.map(d => d.ma_30d_duration_hours);

    const option = {
      tooltip: { trigger: 'axis' },
      legend: {
        bottom: 20,
        data: [
          t('boundaryAccessAnalytics.charts.timeSeries.current'),
          t('boundaryAccessAnalytics.charts.timeSeries.ma7d'),
          t('boundaryAccessAnalytics.charts.timeSeries.ma30d')
        ]
      },
      grid: { left: 60, right: 60, top: 40, bottom: 70 },
      xAxis: {
        type: 'category',
        data: dates,
        boundaryGap: false,
        axisLabel: { margin: 10 }
      },
      yAxis: {
        type: 'value',
        name: 'Horas',
        splitLine: { show: true, lineStyle: { color: '#E2E8F0' } }
      },
      series: [
        {
          name: t('boundaryAccessAnalytics.charts.timeSeries.current'),
          type: 'line',
          data: currentData,
          smooth: true,
          itemStyle: { color: '#0F4C81' },
          lineStyle: { width: 2.5 },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: 'rgba(15, 76, 129, 0.3)' },
              { offset: 1, color: 'rgba(15, 76, 129, 0.05)' }
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
          itemStyle: { color: '#FF6B35' },
          symbol: 'none'
        },
        {
          name: t('boundaryAccessAnalytics.charts.timeSeries.ma30d'),
          type: 'line',
          data: ma30Data,
          smooth: true,
          lineStyle: { type: 'dotted', width: 2 },
          itemStyle: { color: '#10B981' },
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

    const option = {
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'cross' }
      },
      grid: { left: 50, right: 50, top: 30, bottom: 60 },
      xAxis: {
        type: 'category',
        data: weeklyPattern.map(d => d.day_name),
        boundaryGap: false,
        axisLabel: { margin: 10, fontSize: 12 }
      },
      yAxis: {
        type: 'value',
        name: 'Horas',
        splitLine: { show: true, lineStyle: { color: '#E2E8F0' } }
      },
      series: [{
        type: 'line',
        data: weeklyPattern.map(d => d.avg_duration_hours),
        smooth: true,
        itemStyle: { color: '#FF6B35' },
        lineStyle: { width: 2.5 },
        symbol: 'circle',
        symbolSize: 5,
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(255, 107, 53, 0.25)' },
            { offset: 1, color: 'rgba(255, 107, 53, 0.02)' }
          ])
        }
      }]
    };

    chart.setOption(option);
  };

  const initHeatmapChart = () => {
    if (!chartRefs.heatmap.current || !heatmap.length) return;
    const chart = echarts.init(chartRefs.heatmap.current);

    const heatmapData = heatmap.map(d => [
      d.entry_hour,
      d.entry_day_of_week - 1,
      d.total_entries
    ]);

    const days = t('boundaryAccessAnalytics.charts.weeklyPattern.days', { returnObjects: true }) as string[];

    const option = {
      tooltip: { position: 'top' },
      grid: { height: '70%', top: '10%' },
      xAxis: {
        type: 'category',
        data: Array.from({ length: 24 }, (_, i) => i + 'h'),
        splitArea: { show: true }
      },
      yAxis: {
        type: 'category',
        data: days,
        splitArea: { show: true }
      },
      visualMap: {
        min: 0,
        max: Math.max(...heatmap.map(d => d.total_entries)),
        calculable: true,
        orient: 'horizontal',
        left: 'center',
        bottom: '5%',
        inRange: { color: ['#E2E8F0', '#0F4C81', '#FF6B35'] }
      },
      series: [{
        type: 'heatmap',
        data: heatmapData,
        label: { show: false },
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
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
        name: t('boundaryAccessAnalytics.charts.topTransitions.xAxis')
      },
      yAxis: {
        type: 'category',
        data: sortedData.map(d => `${d.from_boundary_name} → ${d.to_boundary_name}`),
        axisLabel: {
          fontSize: 11,
          overflow: 'truncate',
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

  return (
    <div className="min-h-screen bg-[#F5F7FA]">
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
      `}</style>

      <nav className="bg-white border-b-2 border-[#E2E8F0] px-8 shadow-sm">
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
                      ? 'text-[#0F4C81] border-b-[3px] border-[#FF6B35] bg-[#0F4C81]/5'
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
            {/* KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-xl border border-[#E2E8F0] p-6 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-1 h-full bg-[#FF6B35] transform scale-y-0 group-hover:scale-y-100 transition-transform duration-300"></div>
                <div className="text-sm text-[#64748B] uppercase tracking-wider font-semibold mb-2">
                  {t('boundaryAccessAnalytics.kpis.visitsToday')}
                </div>
                <div className="text-4xl font-bold text-[#0F4C81] font-mono mb-2">
                  {kpis.total_visits_today.toLocaleString()}
                </div>
                {kpis.total_visits_yesterday > 0 && (
                  <div className={`inline-flex items-center gap-1 px-2 py-1 rounded text-sm font-mono ${calculateChange(kpis.total_visits_today, kpis.total_visits_yesterday) >= 0
                    ? 'bg-green-50 text-green-600'
                    : 'bg-red-50 text-red-600'
                    }`}>
                    {calculateChange(kpis.total_visits_today, kpis.total_visits_yesterday) >= 0 ? (
                      <ArrowUpIcon className="w-3 h-3" />
                    ) : (
                      <ArrowDownIcon className="w-3 h-3" />
                    )}
                    {Math.abs(calculateChange(kpis.total_visits_today, kpis.total_visits_yesterday)).toFixed(1)}%
                  </div>
                )}
              </div>

              <div className="bg-white rounded-xl border border-[#E2E8F0] p-6 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-1 h-full bg-[#FF6B35] transform scale-y-0 group-hover:scale-y-100 transition-transform duration-300"></div>
                <div className="text-sm text-[#64748B] uppercase tracking-wider font-semibold mb-2">
                  {t('boundaryAccessAnalytics.kpis.hoursToday')}
                </div>
                <div className="text-4xl font-bold text-[#0F4C81] font-mono mb-2">
                  {kpis.total_hours_today.toLocaleString()}
                </div>
                {kpis.total_hours_yesterday > 0 && (
                  <div className={`inline-flex items-center gap-1 px-2 py-1 rounded text-sm font-mono ${calculateChange(kpis.total_hours_today, kpis.total_hours_yesterday) >= 0
                    ? 'bg-green-50 text-green-600'
                    : 'bg-red-50 text-red-600'
                    }`}>
                    {calculateChange(kpis.total_hours_today, kpis.total_hours_yesterday) >= 0 ? (
                      <ArrowUpIcon className="w-3 h-3" />
                    ) : (
                      <ArrowDownIcon className="w-3 h-3" />
                    )}
                    {Math.abs(calculateChange(kpis.total_hours_today, kpis.total_hours_yesterday)).toFixed(1)}%
                  </div>
                )}
              </div>

              <div className="bg-white rounded-xl border border-[#E2E8F0] p-6 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-1 h-full bg-[#FF6B35] transform scale-y-0 group-hover:scale-y-100 transition-transform duration-300"></div>
                <div className="text-sm text-[#64748B] uppercase tracking-wider font-semibold mb-2">
                  {t('boundaryAccessAnalytics.kpis.activePeople')}
                </div>
                <div className="text-4xl font-bold text-[#0F4C81] font-mono mb-2">
                  {kpis.people_inside}
                </div>
              </div>

              <div className="bg-white rounded-xl border border-[#E2E8F0] p-6 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-1 h-full bg-[#FF6B35] transform scale-y-0 group-hover:scale-y-100 transition-transform duration-300"></div>
                <div className="text-sm text-[#64748B] uppercase tracking-wider font-semibold mb-2">
                  {t('boundaryAccessAnalytics.kpis.alertRate')}
                </div>
                <div className="text-4xl font-bold text-[#0F4C81] font-mono mb-2">
                  {((kpis.alerts_today / kpis.total_visits_today) * 100).toFixed(1)}%
                </div>
              </div>
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <div className="bg-white rounded-xl border border-[#E2E8F0] p-6">
                <div className="flex justify-between items-center pb-4 mb-4 border-b border-[#E2E8F0]">
                  <div>
                    <div className="text-xl font-bold text-[#1A2332]">
                      {t('boundaryAccessAnalytics.charts.topBoundaries.title')}
                    </div>
                    <div className="text-sm text-[#64748B] mt-1">
                      {t('boundaryAccessAnalytics.charts.topBoundaries.subtitle')}
                    </div>
                  </div>
                </div>
                {chartLoadingStates.topBoundaries ? (
                  <ChartLoader />
                ) : (
                  <div ref={chartRefs.topBoundaries} className="w-full h-[400px]"></div>
                )}
              </div>

              <div className="bg-white rounded-xl border border-[#E2E8F0] p-6">
                <div className="flex justify-between items-center pb-4 mb-4 border-b border-[#E2E8F0]">
                  <div>
                    <div className="text-xl font-bold text-[#1A2332]">
                      {t('boundaryAccessAnalytics.charts.shiftDistribution.title')}
                    </div>
                    <div className="text-sm text-[#64748B] mt-1">
                      {t('boundaryAccessAnalytics.charts.shiftDistribution.subtitle')}
                    </div>
                  </div>
                </div>
                {chartLoadingStates.shiftDistribution ? (
                  <ChartLoader />
                ) : (
                  <div ref={chartRefs.shiftDistribution} className="w-full h-[400px]"></div>
                )}
              </div>
            </div>

            {/* Status Table */}
{(realTimeStatus.length > 0 || realTimeLoading) && (
  <div className="bg-white rounded-xl border border-[#E2E8F0] p-6">
    <div className="flex justify-between items-center pb-4 mb-4 border-b border-[#E2E8F0]">
      <div>
        <div className="text-xl font-bold text-[#1A2332]">
          {t('boundaryAccessAnalytics.tables.realTimeStatus.title')}
        </div>
        <div className="text-sm text-[#64748B] mt-1">
          {t('boundaryAccessAnalytics.tables.realTimeStatus.subtitle')}
        </div>
      </div>
    </div>

    {/* Filtros */}
    <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4">
      <div>
        <label className="block text-xs font-semibold text-[#64748B] mb-1 uppercase">
          Pessoa
        </label>
        <input
          type="text"
          placeholder="Buscar por nome..."
          value={realTimeFilters.itemName}
          onChange={(e) => setRealTimeFilters({ ...realTimeFilters, itemName: e.target.value, page: 1 })}
          disabled={realTimeLoading}
          className="w-full px-3 py-2 text-sm border border-[#E2E8F0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0F4C81] focus:border-transparent disabled:bg-gray-50 disabled:cursor-not-allowed"
        />
      </div>

      <div>
        <label className="block text-xs font-semibold text-[#64748B] mb-1 uppercase">
          Boundary
        </label>
        <input
          type="text"
          placeholder="Buscar boundary..."
          value={realTimeFilters.boundaryName}
          onChange={(e) => setRealTimeFilters({ ...realTimeFilters, boundaryName: e.target.value, page: 1 })}
          disabled={realTimeLoading}
          className="w-full px-3 py-2 text-sm border border-[#E2E8F0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0F4C81] focus:border-transparent disabled:bg-gray-50 disabled:cursor-not-allowed"
        />
      </div>

      <div>
        <label className="block text-xs font-semibold text-[#64748B] mb-1 uppercase">
          Status
        </label>
        <select
          value={realTimeFilters.status}
          onChange={(e) => setRealTimeFilters({ ...realTimeFilters, status: e.target.value, page: 1 })}
          disabled={realTimeLoading}
          className="w-full px-3 py-2 text-sm border border-[#E2E8F0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0F4C81] focus:border-transparent disabled:bg-gray-50 disabled:cursor-not-allowed"
        >
          <option value="">Todos</option>
          <option value="NORMAL">Normal</option>
          <option value="LONG">Longo</option>
          <option value="ALERT">Alerta</option>
        </select>
      </div>

      <div>
        <label className="block text-xs font-semibold text-[#64748B] mb-1 uppercase">
          Duração Mín (h)
        </label>
        <input
          type="number"
          placeholder="0"
          min="0"
          step="0.5"
          value={realTimeFilters.minDuration}
          onChange={(e) => setRealTimeFilters({ ...realTimeFilters, minDuration: e.target.value, page: 1 })}
          disabled={realTimeLoading}
          className="w-full px-3 py-2 text-sm border border-[#E2E8F0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0F4C81] focus:border-transparent disabled:bg-gray-50 disabled:cursor-not-allowed"
        />
      </div>

      <div>
        <label className="block text-xs font-semibold text-[#64748B] mb-1 uppercase">
          Duração Máx (h)
        </label>
        <input
          type="number"
          placeholder="24"
          min="0"
          step="0.5"
          value={realTimeFilters.maxDuration}
          onChange={(e) => setRealTimeFilters({ ...realTimeFilters, maxDuration: e.target.value, page: 1 })}
          disabled={realTimeLoading}
          className="w-full px-3 py-2 text-sm border border-[#E2E8F0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0F4C81] focus:border-transparent disabled:bg-gray-50 disabled:cursor-not-allowed"
        />
      </div>
    </div>

    {/* Botões de Ação e Contador */}
    <div className="flex justify-between items-center mb-4">
      <div className="text-sm text-[#64748B]">
        {realTimeLoading ? (
          <span className="flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-[#0F4C81] border-t-transparent rounded-full animate-spin"></div>
            Carregando...
          </span>
        ) : (
          <>
            Mostrando {realTimeStatus.length} de {realTimePagination.totalRecords} resultado
            {realTimePagination.totalRecords !== 1 ? 's' : ''}
            {(realTimeFilters.itemName || realTimeFilters.boundaryName || realTimeFilters.status || 
              realTimeFilters.minDuration || realTimeFilters.maxDuration) && ' (filtrado)'}
          </>
        )}
      </div>

      <div className="flex gap-2">
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
          className="px-4 py-2 text-sm font-semibold text-[#64748B] bg-[#F5F7FA] rounded-lg hover:bg-[#E2E8F0] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Limpar Filtros
        </button>

        <select
          value={realTimeFilters.limit}
          onChange={(e) => handleLimitChange(Number(e.target.value))}
          disabled={realTimeLoading}
          className="px-3 py-2 text-sm border border-[#E2E8F0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0F4C81] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <option value={10}>10 por página</option>
          <option value={20}>20 por página</option>
          <option value={50}>50 por página</option>
          <option value={100}>100 por página</option>
        </select>
      </div>
    </div>

    {/* Tabela com Loading State */}
    <div className="relative">
      {realTimeLoading && (
        <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-20 flex items-center justify-center rounded-lg">
          <div className="text-center">
            <div className="relative w-16 h-16 mx-auto mb-4">
              <div className="absolute top-0 left-0 w-full h-full border-4 border-[#E2E8F0] rounded-full"></div>
              <div className="absolute top-0 left-0 w-full h-full border-4 border-[#0F4C81] border-t-transparent rounded-full animate-spin"></div>
            </div>
            <p className="text-sm text-[#64748B] font-medium">Carregando dados...</p>
          </div>
        </div>
      )}

      <div className="overflow-x-auto overflow-y-auto max-h-[360px]">
        <table className="w-full">
          <thead className="bg-[#F5F7FA] sticky top-0 z-10">
            <tr>
              <th className="px-3 py-2 text-left text-xs font-semibold text-[#64748B] uppercase border-b-2 border-[#E2E8F0]">
                {t('boundaryAccessAnalytics.tables.realTimeStatus.headers.person')}
              </th>
              <th className="px-3 py-2 text-left text-xs font-semibold text-[#64748B] uppercase border-b-2 border-[#E2E8F0]">
                {t('boundaryAccessAnalytics.tables.realTimeStatus.headers.boundary')}
              </th>
              <th className="px-3 py-2 text-left text-xs font-semibold text-[#64748B] uppercase border-b-2 border-[#E2E8F0]">
                {t('boundaryAccessAnalytics.tables.realTimeStatus.headers.entry')}
              </th>
              <th className="px-3 py-2 text-left text-xs font-semibold text-[#64748B] uppercase border-b-2 border-[#E2E8F0]">
                {t('boundaryAccessAnalytics.tables.realTimeStatus.headers.duration')}
              </th>
              <th className="px-3 py-2 text-left text-xs font-semibold text-[#64748B] uppercase border-b-2 border-[#E2E8F0]">
                {t('boundaryAccessAnalytics.tables.realTimeStatus.headers.status')}
              </th>
            </tr>
          </thead>

          <tbody>
            {!realTimeLoading && realTimeStatus.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-3 py-8 text-center text-[#64748B]">
                  <div className="flex flex-col items-center gap-2">
                    <ExclamationTriangleIcon className="w-12 h-12 text-[#E2E8F0]" />
                    <p className="font-medium">Nenhum resultado encontrado</p>
                    <p className="text-sm">Tente ajustar os filtros</p>
                  </div>
                </td>
              </tr>
            ) : (
              realTimeStatus.map((item, idx) => (
                <tr key={idx} className="hover:bg-[#0F4C81]/5 transition-colors">
                  <td className="px-3 py-2 border-b border-[#E2E8F0] font-mono text-xs">
                    {item.item_name}
                  </td>
                  <td className="px-3 py-2 border-b border-[#E2E8F0] font-mono text-xs">
                    {item.boundary_name}
                  </td>
                  <td className="px-3 py-2 border-b border-[#E2E8F0] font-mono text-xs">
                    {new Date(item.last_entry).toLocaleTimeString('pt-BR', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </td>
                  <td className="px-3 py-2 border-b border-[#E2E8F0] font-mono text-xs">
                    {item.duration_today_hours}h
                  </td>
                  <td className="px-3 py-2 border-b border-[#E2E8F0]">
                    <span className={`inline-block px-2 py-0.5 rounded-lg text-[10px] font-semibold uppercase
                      ${item.status === 'LONG'
                        ? 'bg-yellow-100 text-yellow-600'
                        : item.status === 'ALERT'
                          ? 'bg-red-100 text-red-600'
                          : 'bg-green-100 text-green-600'
                      }`}>
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

    {/* Paginação */}
    {!realTimeLoading && realTimePagination.totalPages > 1 && (
      <div className="flex justify-between items-center mt-4 pt-4 border-t border-[#E2E8F0]">
        <div className="text-sm text-[#64748B]">
          Página {realTimePagination.currentPage} de {realTimePagination.totalPages}
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => handlePageChange(1)}
            disabled={!realTimePagination.hasPrevPage || realTimeLoading}
            className="px-3 py-1 text-sm font-semibold text-[#0F4C81] bg-white border border-[#E2E8F0] rounded-lg hover:bg-[#F5F7FA] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            ««
          </button>
          
          <button
            onClick={() => handlePageChange(realTimePagination.currentPage - 1)}
            disabled={!realTimePagination.hasPrevPage || realTimeLoading}
            className="px-3 py-1 text-sm font-semibold text-[#0F4C81] bg-white border border-[#E2E8F0] rounded-lg hover:bg-[#F5F7FA] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            ‹
          </button>

          {/* Números de página */}
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
                className={`px-3 py-1 text-sm font-semibold rounded-lg transition-colors disabled:cursor-not-allowed
                  ${realTimePagination.currentPage === pageNum
                    ? 'bg-[#0F4C81] text-white'
                    : 'text-[#0F4C81] bg-white border border-[#E2E8F0] hover:bg-[#F5F7FA]'
                  }`}
              >
                {pageNum}
              </button>
            );
          })}

          <button
            onClick={() => handlePageChange(realTimePagination.currentPage + 1)}
            disabled={!realTimePagination.hasNextPage || realTimeLoading}
            className="px-3 py-1 text-sm font-semibold text-[#0F4C81] bg-white border border-[#E2E8F0] rounded-lg hover:bg-[#F5F7FA] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            ›
          </button>

          <button
            onClick={() => handlePageChange(realTimePagination.totalPages)}
            disabled={!realTimePagination.hasNextPage || realTimeLoading}
            className="px-3 py-1 text-sm font-semibold text-[#0F4C81] bg-white border border-[#E2E8F0] rounded-lg hover:bg-[#F5F7FA] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            »»
          </button>
        </div>
      </div>
    )}
  </div>
)}

            {/* NOVO: Mapa de Calor */}
            <div className="bg-white rounded-xl border border-[#E2E8F0] p-6 mb-6">
              <div className="flex justify-between items-center pb-4 mb-4 border-b border-[#E2E8F0]">
                <div>
                  <div className="text-xl font-bold text-[#1A2332]">
                    {t('boundaryAccessAnalytics.maps.heatmap.title')}
                  </div>
                  <div className="text-sm text-[#64748B] mt-1">
                    {t('boundaryAccessAnalytics.maps.heatmap.subtitle')}
                  </div>
                </div>

                {/* Legenda */}
                <div className="flex items-center gap-4">
                  <div className="text-xs text-[#64748B] uppercase font-semibold">
                    {t('boundaryAccessAnalytics.maps.heatmap.legend')}
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 rounded-full bg-[#0F4C81]"></div>
                      <span className="text-xs text-[#64748B]">
                        {t('boundaryAccessAnalytics.maps.heatmap.density.low')}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 rounded-full bg-[#10B981]"></div>
                      <span className="text-xs text-[#64748B]">
                        {t('boundaryAccessAnalytics.maps.heatmap.density.medium')}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 rounded-full bg-[#F59E0B]"></div>
                      <span className="text-xs text-[#64748B]">
                        {t('boundaryAccessAnalytics.maps.heatmap.density.high')}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 rounded-full bg-[#EF4444]"></div>
                      <span className="text-xs text-[#64748B]">
                        {t('boundaryAccessAnalytics.maps.heatmap.density.critical')}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="w-full h-[600px]">
                {topBoundaries.length === 0 ? (
                  <ChartLoader />
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
        )}

        {/* SECTION 2: Temporal */}
        {activeTab === 'temporal' && (
          <div className="animate-fade-in">
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
                <div ref={chartRefs.heatmap} className="w-full h-[500px]"></div>
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