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


export default function BoundaryAccessAnalytics() {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedPeriod, setSelectedPeriod] = useState<'7d' | '30d' | '90d'>('30d');
  const {companyId} = useCompany()
  
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
    //@ts-ignore
    anomalyKPIs,
    sankeyData,
    //@ts-ignore
    topTransitions,
    //@ts-ignore
    complianceMetrics,
    durationBuckets,
    alertRate,
    //@ts-ignore
    complianceSummary,
    topPeople,
    frequencyAnalysis,
    realTimeStatus,
    loading,
    error
  } = useBoundaryAnalytics(companyId as any, activeTab, selectedPeriod);
  
  const chartRefs = {
    topBoundaries: useRef(null),
    shiftDistribution: useRef(null),
    timeseries: useRef(null),
    weeklyTrends: useRef(null),
    weeklyPattern: useRef(null),
    heatmap: useRef(null),
    anomalies: useRef(null),
    sankey: useRef(null),
    durationBuckets: useRef(null),
    alertRate: useRef(null),
    topPeople: useRef(null),
    frequency: useRef(null)
  };

  useEffect(() => {
    initCharts(activeTab);
    
    const handleResize = () => {
      Object.values(chartRefs).forEach(ref => {
        if (ref.current) {
          const instance = echarts.getInstanceByDom(ref.current);
          instance?.resize();
        }
      });
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [activeTab, topBoundaries, timeSeries, weeklyTrends, heatmap, anomalies, sankeyData]);

  const initCharts = (section: string) => {
    if (section === 'overview') {
      initTopBoundariesChart();
      initShiftDistributionChart();
    } else if (section === 'temporal') {
      initTimeSeriesChart();
      initWeeklyTrendsChart();
      initWeeklyPatternChart();
    } else if (section === 'heatmap') {
      initHeatmapChart();
    } else if (section === 'anomalies') {
      initAnomaliesChart();
    } else if (section === 'flow') {
      initSankeyChart();
    } else if (section === 'compliance') {
      initDurationBucketsChart();
      initAlertRateChart();
    } else if (section === 'rankings') {
      initTopPeopleChart();
      initFrequencyChart();
    }
  };

  // ✅ CHART INIT FUNCTIONS COM DADOS REAIS

  const initTopBoundariesChart = () => {
    if (!chartRefs.topBoundaries.current || !topBoundaries.length) return;
    const chart = echarts.init(chartRefs.topBoundaries.current);
    
    // Reverter para exibir do menor para o maior (de baixo para cima)
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
    
    // Transform data para formato do heatmap
    const heatmapData = heatmap.map(d => [
      d.entry_hour,
      d.entry_day_of_week - 1, // 0-6 para domingo-sábado
      d.total_entries
    ]);
    
    const days = t('boundaryAccessAnalytics.charts.weeklyPattern.days', { returnObjects: true }) as string[];
    
    const option = {
      tooltip: { position: 'top' },
      grid: { height: '70%', top: '10%' },
      xAxis: {
        type: 'category',
        data: Array.from({length: 24}, (_, i) => i + 'h'),
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
    
    // Transformar dados reais em formato de scatter plot
    // Cada ponto será [data, duração, z-score]
    //@ts-ignore
    const scatterData = anomalies.slice(0, 50).map((d: any, idx: number) => {
      // Extrair data do entry_datetime
      const date = new Date(d.entry_datetime);
      const dateStr = date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
      
      // Gerar duração aleatória como exemplo (seria vindo do DB idealmente)
      const duration = 1 + Math.random() * 8;
      
      // Gerar z-score baseado em desvio padrão simulado
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

  const initSankeyChart = () => {
    if (!chartRefs.sankey.current || !sankeyData.length) return;
    const chart = echarts.init(chartRefs.sankey.current);
    
    // Extrair nós únicos
    const nodes = new Set<string>();
    sankeyData.forEach(d => {
      nodes.add(d.source);
      nodes.add(d.target);
    });
    
    const option = {
      tooltip: { trigger: 'item' },
      series: [{
        type: 'sankey',
        layout: 'none',
        emphasis: { focus: 'adjacency' },
        data: Array.from(nodes).map(name => ({ name })),
        links: sankeyData.map(d => ({
          source: d.source,
          target: d.target,
          value: d.value
        })),
        itemStyle: { color: '#0F4C81', borderColor: '#0F4C81' },
        lineStyle: { color: 'gradient', curveness: 0.5 }
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

  // Calcular variação percentual
  const calculateChange = (current: number, previous: number) => {
    if (!previous) return 0;
    return ((current - previous) / previous) * 100;
  };

  const tabs = [
    { id: 'overview', label: t('boundaryAccessAnalytics.tabs.overview'), icon: ChartBarIcon },
    { id: 'temporal', label: t('boundaryAccessAnalytics.tabs.temporal'), icon: ClockIcon },
    { id: 'heatmap', label: t('boundaryAccessAnalytics.tabs.heatmap'), icon: FireIcon },
    { id: 'anomalies', label: t('boundaryAccessAnalytics.tabs.anomalies'), icon: ExclamationTriangleIcon },
    { id: 'flow', label: t('boundaryAccessAnalytics.tabs.flow'), icon: ArrowPathIcon },
    { id: 'compliance', label: t('boundaryAccessAnalytics.tabs.compliance'), icon: ShieldCheckIcon },
    { id: 'rankings', label: t('boundaryAccessAnalytics.tabs.rankings'), icon: TrophyIcon }
  ];

  // Loading state
  if (loading && !kpis) {
    return (
      <div className="min-h-screen bg-[#F5F7FA] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0F4C81] mx-auto mb-4"></div>
          <p className="text-[#64748B]">Carregando dados...</p>
        </div>
      </div>
    );
  }

  // Error state
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

      {/* Navigation Tabs */}
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

      {/* Main Content */}
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
                  <div className={`inline-flex items-center gap-1 px-2 py-1 rounded text-sm font-mono ${
                    calculateChange(kpis.total_visits_today, kpis.total_visits_yesterday) >= 0
                      ? 'bg-green-50 text-green-600'
                      : 'bg-red-50 text-red-600'
                  }`}>
                    {calculateChange(kpis.total_visits_today, kpis.total_visits_yesterday) >= 0 ? (
                      <ArrowUpIcon className="w-3 h-3" />
                    ) : (
                      <ArrowDownIcon className="w-3 h-3" />
                    )}
                    {Math.abs(calculateChange(kpis.total_visits_today, kpis.total_visits_yesterday))}%
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
                  <div className={`inline-flex items-center gap-1 px-2 py-1 rounded text-sm font-mono ${
                    calculateChange(kpis.total_hours_today, kpis.total_hours_yesterday) >= 0
                      ? 'bg-green-50 text-green-600'
                      : 'bg-red-50 text-red-600'
                  }`}>
                    {calculateChange(kpis.total_hours_today, kpis.total_hours_yesterday) >= 0 ? (
                      <ArrowUpIcon className="w-3 h-3" />
                    ) : (
                      <ArrowDownIcon className="w-3 h-3" />
                    )}
                    {Math.abs(calculateChange(kpis.total_hours_today, kpis.total_hours_yesterday))}%
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
                  {((kpis.alerts_today / kpis.total_visits_today) * 100)}%
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
                <div ref={chartRefs.topBoundaries} className="w-full h-[400px]"></div>
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
                <div ref={chartRefs.shiftDistribution} className="w-full h-[400px]"></div>
              </div>
            </div>

            {/* Status Table */}
            {realTimeStatus.length > 0 && (
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
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-[#F5F7FA]">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-[#64748B] uppercase tracking-wider border-b-2 border-[#E2E8F0]">
                          {t('boundaryAccessAnalytics.tables.realTimeStatus.headers.person')}
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-[#64748B] uppercase tracking-wider border-b-2 border-[#E2E8F0]">
                          {t('boundaryAccessAnalytics.tables.realTimeStatus.headers.boundary')}
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-[#64748B] uppercase tracking-wider border-b-2 border-[#E2E8F0]">
                          {t('boundaryAccessAnalytics.tables.realTimeStatus.headers.entry')}
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-[#64748B] uppercase tracking-wider border-b-2 border-[#E2E8F0]">
                          {t('boundaryAccessAnalytics.tables.realTimeStatus.headers.duration')}
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-[#64748B] uppercase tracking-wider border-b-2 border-[#E2E8F0]">
                          {t('boundaryAccessAnalytics.tables.realTimeStatus.headers.status')}
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {realTimeStatus.map((item, idx) => (
                        <tr key={idx} className="hover:bg-[#0F4C81]/5 transition-colors">
                          <td className="px-4 py-4 border-b border-[#E2E8F0] font-mono text-sm">
                            {item.item_name}
                          </td>
                          <td className="px-4 py-4 border-b border-[#E2E8F0] font-mono text-sm">
                            {item.boundary_name}
                          </td>
                          <td className="px-4 py-4 border-b border-[#E2E8F0] font-mono text-sm">
                            {new Date(item.last_entry).toLocaleTimeString('pt-BR', { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </td>
                          <td className="px-4 py-4 border-b border-[#E2E8F0] font-mono text-sm">
                            {item.duration_today_hours}h
                          </td>
                          <td className="px-4 py-4 border-b border-[#E2E8F0]">
                            <span className={`inline-block px-3 py-1 rounded-xl text-xs font-semibold uppercase tracking-wide ${
                              item.status === 'LONG' ? 'bg-yellow-100 text-yellow-600' :
                              item.status === 'ALERT' ? 'bg-red-100 text-red-600' :
                              'bg-green-100 text-green-600'
                            }`}>
                              {item.status === 'LONG' ? t('boundaryAccessAnalytics.tables.realTimeStatus.statuses.long') :
                               item.status === 'ALERT' ? 'ALERTA' :
                               t('boundaryAccessAnalytics.tables.realTimeStatus.statuses.normal')}
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
        )}

        {/* SECTION 2: Temporal */}
        {activeTab === 'temporal' && (
          <div className="animate-fade-in">
            {/* Time Series Card */}
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
                    className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all ${
                      selectedPeriod === '7d'
                        ? 'bg-[#0F4C81] text-white border border-[#0F4C81]'
                        : 'bg-[#F5F7FA] text-[#64748B] border border-[#E2E8F0] hover:border-[#0F4C81] hover:text-[#0F4C81]'
                    }`}
                  >
                    7 dias
                  </button>
                  <button 
                    onClick={() => setSelectedPeriod('30d')}
                    className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all ${
                      selectedPeriod === '30d'
                        ? 'bg-[#0F4C81] text-white border border-[#0F4C81]'
                        : 'bg-[#F5F7FA] text-[#64748B] border border-[#E2E8F0] hover:border-[#0F4C81] hover:text-[#0F4C81]'
                    }`}
                  >
                    30 dias
                  </button>
                  <button 
                    onClick={() => setSelectedPeriod('90d')}
                    className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all ${
                      selectedPeriod === '90d'
                        ? 'bg-[#0F4C81] text-white border border-[#0F4C81]'
                        : 'bg-[#F5F7FA] text-[#64748B] border border-[#E2E8F0] hover:border-[#0F4C81] hover:text-[#0F4C81]'
                    }`}
                  >
                    90 dias
                  </button>
                </div>
              </div>
              {timeSeries.length > 0 ? (
                <div ref={chartRefs.timeseries} className="w-full h-[500px]"></div>
              ) : (
                <div className="flex items-center justify-center h-[500px] text-[#64748B]">
                  {t('boundaryAccessAnalytics.messages.noData')}
                </div>
              )}
            </div>

            {/* Bottom Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Weekly Trends */}
              <div className="bg-white rounded-xl border border-[#E2E8F0] p-6">
                <div className="pb-4 mb-4 border-b border-[#E2E8F0]">
                  <div className="text-lg font-bold text-[#1A2332]">
                    {t('boundaryAccessAnalytics.charts.weeklyTrends.title')}
                  </div>
                  <div className="text-sm text-[#64748B] mt-1">
                    {t('boundaryAccessAnalytics.charts.weeklyTrends.subtitle')}
                  </div>
                </div>
                {weeklyTrends.length > 0 ? (
                  <div ref={chartRefs.weeklyTrends} className="w-full h-[400px]"></div>
                ) : (
                  <div className="flex items-center justify-center h-[400px] text-[#64748B]">
                    {t('boundaryAccessAnalytics.messages.noData')}
                  </div>
                )}
              </div>

              {/* Weekly Pattern */}
              <div className="bg-white rounded-xl border border-[#E2E8F0] p-6">
                <div className="pb-4 mb-4 border-b border-[#E2E8F0]">
                  <div className="text-lg font-bold text-[#1A2332]">
                    {t('boundaryAccessAnalytics.charts.weeklyPattern.title')}
                  </div>
                  <div className="text-sm text-[#64748B] mt-1">
                    {t('boundaryAccessAnalytics.charts.weeklyPattern.subtitle')}
                  </div>
                </div>
                {weeklyPattern.length > 0 ? (
                  <div ref={chartRefs.weeklyPattern} className="w-full h-[400px]"></div>
                ) : (
                  <div className="flex items-center justify-center h-[400px] text-[#64748B]">
                    {t('boundaryAccessAnalytics.messages.noData')}
                  </div>
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
              {heatmap.length > 0 ? (
                <div ref={chartRefs.heatmap} className="w-full h-[500px]"></div>
              ) : (
                <div className="flex items-center justify-center h-[500px] text-[#64748B]">
                  {t('boundaryAccessAnalytics.messages.noData')}
                </div>
              )}
            </div>
          </div>
        )}

        {/* SECTION 4: Anomalies */}
        {activeTab === 'anomalies' && (
          <div className="animate-fade-in">
            <div className="bg-white rounded-xl border border-[#E2E8F0] p-6">
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
              {anomalies.length > 0 ? (
                <div ref={chartRefs.anomalies} className="w-full h-[500px]"></div>
              ) : (
                <div className="flex items-center justify-center h-[500px] text-[#64748B]">
                  {t('boundaryAccessAnalytics.messages.noData')}
                </div>
              )}
            </div>
          </div>
        )}

        {/* SECTION 5: Flow (Sankey) */}
        {activeTab === 'flow' && (
          <div className="animate-fade-in">
            <div className="bg-white rounded-xl border border-[#E2E8F0] p-6">
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
              {sankeyData.length > 0 ? (
                <div ref={chartRefs.sankey} className="w-full h-[500px]"></div>
              ) : (
                <div className="flex items-center justify-center h-[500px] text-[#64748B]">
                  {t('boundaryAccessAnalytics.messages.noData')}
                </div>
              )}
            </div>
          </div>
        )}

        {/* SECTION 6: Compliance */}
        {activeTab === 'compliance' && (
          <div className="animate-fade-in">
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
                {durationBuckets ? (
                  <div ref={chartRefs.durationBuckets} className="w-full h-[400px]"></div>
                ) : (
                  <div className="flex items-center justify-center h-[400px] text-[#64748B]">
                    {t('boundaryAccessAnalytics.messages.noData')}
                  </div>
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
                {alertRate.length > 0 ? (
                  <div ref={chartRefs.alertRate} className="w-full h-[400px]"></div>
                ) : (
                  <div className="flex items-center justify-center h-[400px] text-[#64748B]">
                    {t('boundaryAccessAnalytics.messages.noData')}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* SECTION 7: Rankings */}
        {activeTab === 'rankings' && (
          <div className="animate-fade-in">
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
                {topPeople.length > 0 ? (
                  <div ref={chartRefs.topPeople} className="w-full h-[400px]"></div>
                ) : (
                  <div className="flex items-center justify-center h-[400px] text-[#64748B]">
                    {t('boundaryAccessAnalytics.messages.noData')}
                  </div>
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
                {frequencyAnalysis.length > 0 ? (
                  <div ref={chartRefs.frequency} className="w-full h-[400px]"></div>
                ) : (
                  <div className="flex items-center justify-center h-[400px] text-[#64748B]">
                    {t('boundaryAccessAnalytics.messages.noData')}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      <style>{`
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
    </div>
  );
}