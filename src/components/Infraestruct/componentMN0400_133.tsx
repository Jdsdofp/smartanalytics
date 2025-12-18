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

export default function BoundaryAccessAnalytics() {
  const [activeTab, setActiveTab] = useState('overview');
  
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
  }, [activeTab]);

  // Mock data generators
  const generateTimeSeriesData = (days = 30) => {
    const data = [];
    const dates = [];
    const ma7 = [];
    const ma30 = [];
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      dates.push(date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }));
      
      const base = 3500;
      const variation = Math.sin(i / 7) * 500 + Math.random() * 400;
      data.push(Math.round(base + variation));
    }
    
    for (let i = 0; i < data.length; i++) {
      if (i >= 6) {
        ma7.push(Math.round(data.slice(i-6, i+1).reduce((a,b) => a+b) / 7));
      } else {
        ma7.push(null);
      }
      
      if (i >= 29) {
        ma30.push(Math.round(data.slice(i-29, i+1).reduce((a,b) => a+b) / 30));
      } else {
        ma30.push(null);
      }
    }
    
    return { dates, data, ma7, ma30 };
  };

  const generateHeatmapData = () => {
    const data: any[] = [];
    const hours = Array.from({length: 24}, (_, i) => i);
    const days = t('boundaryAccessAnalytics.charts.weeklyPattern.days', { returnObjects: true }) as string[];
    
    //@ts-ignore
    days.forEach((day: string, dayIdx) => {
      hours.forEach(hour => {
        let value = Math.random() * 50;
        if (dayIdx >= 1 && dayIdx <= 5 && hour >= 8 && hour <= 18) {
          value += 50 + Math.random() * 100;
        }
        data.push([hour, dayIdx, Math.round(value)]);
      });
    });
    
    return data;
  };

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

  const initTopBoundariesChart = () => {
    if (!chartRefs.topBoundaries.current) return;
    const chart = echarts.init(chartRefs.topBoundaries.current);
    const option = {
      tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
      grid: { left: 120, right: 50, top: 20, bottom: 50 },
      xAxis: { type: 'value', name: t('boundaryAccessAnalytics.charts.topBoundaries.xAxis') },
      yAxis: {
        type: 'category',
        data: ['Zona J', 'Zona I', 'Zona H', 'Zona G', 'Zona F', 'Zona E', 'Zona D', 'Zona C', 'Zona B', 'Zona A']
      },
      series: [{
        type: 'bar',
        data: [892, 1023, 1156, 1289, 1421, 1654, 1887, 2120, 2453, 2786],
        itemStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
            { offset: 0, color: '#0F4C81' },
            { offset: 1, color: '#FF6B35' }
          ])
        },
        label: { show: true, position: 'right', formatter: '{c}' + t('boundaryAccessAnalytics.labels.hours') }
      }]
    };
    chart.setOption(option);
  };

  const initShiftDistributionChart = () => {
    if (!chartRefs.shiftDistribution.current) return;
    const chart = echarts.init(chartRefs.shiftDistribution.current);
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
          { value: 45, name: t('boundaryAccessAnalytics.charts.shiftDistribution.morning'), itemStyle: { color: '#0F4C81' } },
          { value: 42, name: t('boundaryAccessAnalytics.charts.shiftDistribution.afternoon'), itemStyle: { color: '#FF6B35' } },
          { value: 13, name: t('boundaryAccessAnalytics.charts.shiftDistribution.night'), itemStyle: { color: '#64748B' } }
        ]
      }]
    };
    chart.setOption(option);
  };

  const initTimeSeriesChart = () => {
    if (!chartRefs.timeseries.current) return;
    const chart = echarts.init(chartRefs.timeseries.current);
    const { dates, data, ma7, ma30 } = generateTimeSeriesData(30);
    
    const option = {
      tooltip: { trigger: 'axis' },
      legend: { 
        bottom: 10, 
        data: [
          t('boundaryAccessAnalytics.charts.timeSeries.current'), 
          t('boundaryAccessAnalytics.charts.timeSeries.ma7d'), 
          t('boundaryAccessAnalytics.charts.timeSeries.ma30d')
        ] 
      },
      grid: { left: 80, right: 80, top: 50, bottom: 80 },
      xAxis: { type: 'category', data: dates, boundaryGap: false },
      yAxis: { type: 'value', name: t('boundaryAccessAnalytics.charts.timeSeries.yAxis') },
      series: [
        {
          name: t('boundaryAccessAnalytics.charts.timeSeries.current'),
          type: 'line',
          data: data,
          itemStyle: { color: '#0F4C81' },
          areaStyle: { opacity: 0.2 }
        },
        {
          name: t('boundaryAccessAnalytics.charts.timeSeries.ma7d'),
          type: 'line',
          data: ma7,
          smooth: true,
          lineStyle: { type: 'dashed' },
          itemStyle: { color: '#FF6B35' }
        },
        {
          name: t('boundaryAccessAnalytics.charts.timeSeries.ma30d'),
          type: 'line',
          data: ma30,
          smooth: true,
          lineStyle: { type: 'dotted' },
          itemStyle: { color: '#10B981' }
        }
      ]
    };
    chart.setOption(option);
  };

  const initWeeklyTrendsChart = () => {
    if (!chartRefs.weeklyTrends.current) return;
    const chart = echarts.init(chartRefs.weeklyTrends.current);
    const option = {
      tooltip: { trigger: 'axis' },
      legend: { 
        bottom: 10,
        data: [
          t('boundaryAccessAnalytics.charts.weeklyTrends.currentWeek'),
          t('boundaryAccessAnalytics.charts.weeklyTrends.previousWeek')
        ]
      },
      grid: { left: 80, right: 80, top: 20, bottom: 80 },
      xAxis: { type: 'category', data: ['S45', 'S46', 'S47', 'S48', 'S49', 'S50', 'S51', 'S52'] },
      yAxis: { type: 'value', name: t('boundaryAccessAnalytics.charts.weeklyTrends.yAxis') },
      series: [
        {
          name: t('boundaryAccessAnalytics.charts.weeklyTrends.currentWeek'),
          type: 'bar',
          data: [3200, 3450, 3100, 3580, 3320, 3690, 3420, 3750],
          itemStyle: { color: '#0F4C81' }
        },
        {
          name: t('boundaryAccessAnalytics.charts.weeklyTrends.previousWeek'),
          type: 'bar',
          data: [3100, 3250, 3300, 3400, 3200, 3500, 3300, 3420],
          itemStyle: { color: '#E2E8F0' }
        }
      ]
    };
    chart.setOption(option);
  };

  const initWeeklyPatternChart = () => {
    if (!chartRefs.weeklyPattern.current) return;
    const chart = echarts.init(chartRefs.weeklyPattern.current);
    const days = t('boundaryAccessAnalytics.charts.weeklyPattern.days', { returnObjects: true }) as string[];
    
    const option = {
      tooltip: { trigger: 'axis' },
      grid: { left: 80, right: 80, top: 20, bottom: 80 },
      xAxis: { type: 'category', data: days },
      yAxis: { type: 'value', name: t('boundaryAccessAnalytics.charts.weeklyPattern.yAxis') },
      series: [{
        type: 'line',
        data: [120, 842, 856, 823, 891, 867, 245],
        smooth: true,
        itemStyle: { color: '#FF6B35' },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(255, 107, 53, 0.3)' },
            { offset: 1, color: 'rgba(255, 107, 53, 0.05)' }
          ])
        }
      }]
    };
    chart.setOption(option);
  };

  const initHeatmapChart = () => {
    if (!chartRefs.heatmap.current) return;
    const chart = echarts.init(chartRefs.heatmap.current);
    const data = generateHeatmapData();
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
        max: 200,
        calculable: true,
        orient: 'horizontal',
        left: 'center',
        bottom: '5%',
        inRange: { color: ['#E2E8F0', '#0F4C81', '#FF6B35'] }
      },
      series: [{
        type: 'heatmap',
        data: data,
        label: { show: false },
        emphasis: { itemStyle: { shadowBlur: 10, shadowColor: 'rgba(0, 0, 0, 0.5)' } }
      }]
    };
    chart.setOption(option);
  };

  const initAnomaliesChart = () => {
    if (!chartRefs.anomalies.current) return;
    const chart = echarts.init(chartRefs.anomalies.current);
    const data = [];
    
    for (let i = 0; i < 30; i++) {
      const date = new Date();
      date.setDate(date.getDate() - (29 - i));
      const dateStr = date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
      
      if (Math.random() > 0.7) {
        const zscore = 1.5 + Math.random() * 2.5;
        const duration = 2 + Math.random() * 6;
        data.push([dateStr, duration, zscore]);
      }
    }
    
    const option = {
      tooltip: {
        trigger: 'item',
        formatter: (params: any) => {
          return `${t('boundaryAccessAnalytics.charts.anomalies.tooltip.date')}: ${params.value[0]}<br/>${t('boundaryAccessAnalytics.charts.anomalies.tooltip.duration')}: ${params.value[1].toFixed(1)}h<br/>${t('boundaryAccessAnalytics.charts.anomalies.tooltip.zScore')}: ${params.value[2].toFixed(1)}`;
        }
      },
      grid: { left: 80, right: 80, top: 50, bottom: 80 },
      xAxis: { type: 'category', name: t('boundaryAccessAnalytics.charts.anomalies.xAxis') },
      yAxis: { type: 'value', name: t('boundaryAccessAnalytics.charts.anomalies.yAxis') },
      visualMap: {
        min: 1.5,
        max: 4,
        dimension: 2,
        orient: 'vertical',
        right: 10,
        top: 'center',
        text: ['HIGH', 'LOW'],
        calculable: true,
        inRange: { color: ['#F59E0B', '#EF4444'] }
      },
      series: [{
        type: 'scatter',
        symbolSize: (val: any) => val[2] * 8,
        data: data,
        emphasis: { focus: 'series' }
      }]
    };
    chart.setOption(option);
  };

  const initSankeyChart = () => {
    if (!chartRefs.sankey.current) return;
    const chart = echarts.init(chartRefs.sankey.current);
    const option = {
      tooltip: { trigger: 'item' },
      series: [{
        type: 'sankey',
        layout: 'none',
        emphasis: { focus: 'adjacency' },
        data: [
          { name: 'Entrada' },
          { name: 'Zona A' },
          { name: 'Zona B' },
          { name: 'Zona C' },
          { name: 'Saída' }
        ],
        links: [
          { source: 'Entrada', target: 'Zona A', value: 142 },
          { source: 'Entrada', target: 'Zona B', value: 98 },
          { source: 'Entrada', target: 'Zona C', value: 67 },
          { source: 'Zona A', target: 'Zona B', value: 89 },
          { source: 'Zona A', target: 'Zona C', value: 34 },
          { source: 'Zona B', target: 'Zona A', value: 56 },
          { source: 'Zona B', target: 'Zona C', value: 78 },
          { source: 'Zona C', target: 'Zona A', value: 45 },
          { source: 'Zona C', target: 'Zona B', value: 23 },
          { source: 'Zona A', target: 'Saída', value: 102 },
          { source: 'Zona B', target: 'Saída', value: 87 },
          { source: 'Zona C', target: 'Saída', value: 56 }
        ],
        itemStyle: { color: '#0F4C81', borderColor: '#0F4C81' },
        lineStyle: { color: 'gradient', curveness: 0.5 }
      }]
    };
    chart.setOption(option);
  };

  const initDurationBucketsChart = () => {
    if (!chartRefs.durationBuckets.current) return;
    const chart = echarts.init(chartRefs.durationBuckets.current);
    const buckets = t('boundaryAccessAnalytics.charts.durationBuckets.buckets', { returnObjects: true }) as string[];
    
    const option = {
      tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
      grid: { left: 80, right: 50, top: 20, bottom: 80 },
      xAxis: { type: 'category', data: buckets },
      yAxis: { type: 'value', name: t('boundaryAccessAnalytics.charts.durationBuckets.yAxis') },
      series: [{
        type: 'bar',
        data: [234, 567, 389, 142, 45],
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
    if (!chartRefs.alertRate.current) return;
    const chart = echarts.init(chartRefs.alertRate.current);
    const option = {
      tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
      grid: { left: 120, right: 50, top: 20, bottom: 50 },
      xAxis: { type: 'value', name: t('boundaryAccessAnalytics.charts.alertRate.xAxis'), max: 10 },
      yAxis: { type: 'category', data: ['Zona E', 'Zona D', 'Zona C', 'Zona B', 'Zona A'] },
      series: [{
        type: 'bar',
        data: [2.1, 2.8, 3.2, 5.4, 6.7],
        itemStyle: {
          color: (params: any) => {
            return params.value > 5 ? '#EF4444' : params.value > 3 ? '#F59E0B' : '#10B981';
          }
        },
        label: { show: true, position: 'right', formatter: '{c}' + t('boundaryAccessAnalytics.labels.percentage') }
      }]
    };
    chart.setOption(option);
  };

  const initTopPeopleChart = () => {
    if (!chartRefs.topPeople.current) return;
    const chart = echarts.init(chartRefs.topPeople.current);
    const option = {
      tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
      grid: { left: 120, right: 50, top: 20, bottom: 50 },
      xAxis: { type: 'value', name: t('boundaryAccessAnalytics.charts.topPeople.xAxis') },
      yAxis: {
        type: 'category',
        data: ['P10', 'P9', 'P8', 'P7', 'P6', 'P5', 'P4', 'P3', 'P2', 'P1']
      },
      series: [{
        type: 'bar',
        data: [45.2, 52.3, 58.7, 61.2, 64.8, 67.3, 70.1, 72.1, 78.3, 89.5],
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
    if (!chartRefs.frequency.current) return;
    const chart = echarts.init(chartRefs.frequency.current);
    const option = {
      tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
      grid: { left: 120, right: 50, top: 20, bottom: 50 },
      xAxis: { type: 'value', name: t('boundaryAccessAnalytics.charts.frequency.xAxis') },
      yAxis: {
        type: 'category',
        data: ['P10', 'P9', 'P8', 'P7', 'P6', 'P5', 'P4', 'P3', 'P2', 'P1']
      },
      series: [{
        type: 'bar',
        data: [2.1, 2.3, 2.5, 2.8, 3.1, 3.4, 3.7, 4.2, 4.6, 5.2],
        itemStyle: { color: '#FF6B35' }
      }]
    };
    chart.setOption(option);
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
        {activeTab === 'overview' && (
          <div className="animate-fade-in">
            {/* KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-xl border border-[#E2E8F0] p-6 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-1 h-full bg-[#FF6B35] transform scale-y-0 group-hover:scale-y-100 transition-transform duration-300"></div>
                <div className="text-sm text-[#64748B] uppercase tracking-wider font-semibold mb-2">{t('boundaryAccessAnalytics.kpis.visitsToday')}</div>
                <div className="text-4xl font-bold text-[#0F4C81] font-mono mb-2">1,247</div>
                <div className="inline-flex items-center gap-1 px-2 py-1 bg-green-50 text-green-600 rounded text-sm font-mono">
                  <ArrowUpIcon className="w-3 h-3" />
                  12.5%
                </div>
              </div>

              <div className="bg-white rounded-xl border border-[#E2E8F0] p-6 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-1 h-full bg-[#FF6B35] transform scale-y-0 group-hover:scale-y-100 transition-transform duration-300"></div>
                <div className="text-sm text-[#64748B] uppercase tracking-wider font-semibold mb-2">{t('boundaryAccessAnalytics.kpis.hoursToday')}</div>
                <div className="text-4xl font-bold text-[#0F4C81] font-mono mb-2">3,892</div>
                <div className="inline-flex items-center gap-1 px-2 py-1 bg-green-50 text-green-600 rounded text-sm font-mono">
                  <ArrowUpIcon className="w-3 h-3" />
                  8.3%
                </div>
              </div>

              <div className="bg-white rounded-xl border border-[#E2E8F0] p-6 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-1 h-full bg-[#FF6B35] transform scale-y-0 group-hover:scale-y-100 transition-transform duration-300"></div>
                <div className="text-sm text-[#64748B] uppercase tracking-wider font-semibold mb-2">{t('boundaryAccessAnalytics.kpis.activePeople')}</div>
                <div className="text-4xl font-bold text-[#0F4C81] font-mono mb-2">342</div>
                <div className="inline-flex items-center gap-1 px-2 py-1 bg-red-50 text-red-600 rounded text-sm font-mono">
                  <ArrowDownIcon className="w-3 h-3" />
                  2.1%
                </div>
              </div>

              <div className="bg-white rounded-xl border border-[#E2E8F0] p-6 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-1 h-full bg-[#FF6B35] transform scale-y-0 group-hover:scale-y-100 transition-transform duration-300"></div>
                <div className="text-sm text-[#64748B] uppercase tracking-wider font-semibold mb-2">{t('boundaryAccessAnalytics.kpis.alertRate')}</div>
                <div className="text-4xl font-bold text-[#0F4C81] font-mono mb-2">4.2%</div>
                <div className="inline-flex items-center gap-1 px-2 py-1 bg-green-50 text-green-600 rounded text-sm font-mono">
                  <ArrowDownIcon className="w-3 h-3" />
                  1.8%
                </div>
              </div>
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <div className="bg-white rounded-xl border border-[#E2E8F0] p-6">
                <div className="flex justify-between items-center pb-4 mb-4 border-b border-[#E2E8F0]">
                  <div>
                    <div className="text-xl font-bold text-[#1A2332]">{t('boundaryAccessAnalytics.charts.topBoundaries.title')}</div>
                    <div className="text-sm text-[#64748B] mt-1">{t('boundaryAccessAnalytics.charts.topBoundaries.subtitle')}</div>
                  </div>
                </div>
                <div ref={chartRefs.topBoundaries} className="w-full h-[400px]"></div>
              </div>

              <div className="bg-white rounded-xl border border-[#E2E8F0] p-6">
                <div className="flex justify-between items-center pb-4 mb-4 border-b border-[#E2E8F0]">
                  <div>
                    <div className="text-xl font-bold text-[#1A2332]">{t('boundaryAccessAnalytics.charts.shiftDistribution.title')}</div>
                    <div className="text-sm text-[#64748B] mt-1">{t('boundaryAccessAnalytics.charts.shiftDistribution.subtitle')}</div>
                  </div>
                </div>
                <div ref={chartRefs.shiftDistribution} className="w-full h-[400px]"></div>
              </div>
            </div>

            {/* Status Table */}
            <div className="bg-white rounded-xl border border-[#E2E8F0] p-6">
              <div className="flex justify-between items-center pb-4 mb-4 border-b border-[#E2E8F0]">
                <div>
                  <div className="text-xl font-bold text-[#1A2332]">{t('boundaryAccessAnalytics.tables.realTimeStatus.title')}</div>
                  <div className="text-sm text-[#64748B] mt-1">{t('boundaryAccessAnalytics.tables.realTimeStatus.subtitle')}</div>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-[#F5F7FA]">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-[#64748B] uppercase tracking-wider border-b-2 border-[#E2E8F0]">{t('boundaryAccessAnalytics.tables.realTimeStatus.headers.person')}</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-[#64748B] uppercase tracking-wider border-b-2 border-[#E2E8F0]">{t('boundaryAccessAnalytics.tables.realTimeStatus.headers.boundary')}</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-[#64748B] uppercase tracking-wider border-b-2 border-[#E2E8F0]">{t('boundaryAccessAnalytics.tables.realTimeStatus.headers.entry')}</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-[#64748B] uppercase tracking-wider border-b-2 border-[#E2E8F0]">{t('boundaryAccessAnalytics.tables.realTimeStatus.headers.duration')}</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-[#64748B] uppercase tracking-wider border-b-2 border-[#E2E8F0]">{t('boundaryAccessAnalytics.tables.realTimeStatus.headers.status')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="hover:bg-[#0F4C81]/5 transition-colors">
                      <td className="px-4 py-4 border-b border-[#E2E8F0] font-mono text-sm">João Silva</td>
                      <td className="px-4 py-4 border-b border-[#E2E8F0] font-mono text-sm">Zona A</td>
                      <td className="px-4 py-4 border-b border-[#E2E8F0] font-mono text-sm">13:45</td>
                      <td className="px-4 py-4 border-b border-[#E2E8F0] font-mono text-sm">2h 15min</td>
                      <td className="px-4 py-4 border-b border-[#E2E8F0]">
                        <span className="inline-block px-3 py-1 bg-green-100 text-green-600 rounded-xl text-xs font-semibold uppercase tracking-wide">{t('boundaryAccessAnalytics.tables.realTimeStatus.statuses.normal')}</span>
                      </td>
                    </tr>
                    <tr className="hover:bg-[#0F4C81]/5 transition-colors">
                      <td className="px-4 py-4 border-b border-[#E2E8F0] font-mono text-sm">Maria Santos</td>
                      <td className="px-4 py-4 border-b border-[#E2E8F0] font-mono text-sm">Zona B</td>
                      <td className="px-4 py-4 border-b border-[#E2E8F0] font-mono text-sm">14:20</td>
                      <td className="px-4 py-4 border-b border-[#E2E8F0] font-mono text-sm">1h 40min</td>
                      <td className="px-4 py-4 border-b border-[#E2E8F0]">
                        <span className="inline-block px-3 py-1 bg-green-100 text-green-600 rounded-xl text-xs font-semibold uppercase tracking-wide">{t('boundaryAccessAnalytics.tables.realTimeStatus.statuses.normal')}</span>
                      </td>
                    </tr>
                    <tr className="hover:bg-[#0F4C81]/5 transition-colors">
                      <td className="px-4 py-4 border-b border-[#E2E8F0] font-mono text-sm">Pedro Costa</td>
                      <td className="px-4 py-4 border-b border-[#E2E8F0] font-mono text-sm">Zona C</td>
                      <td className="px-4 py-4 border-b border-[#E2E8F0] font-mono text-sm">10:30</td>
                      <td className="px-4 py-4 border-b border-[#E2E8F0] font-mono text-sm">5h 30min</td>
                      <td className="px-4 py-4 border-b border-[#E2E8F0]">
                        <span className="inline-block px-3 py-1 bg-yellow-100 text-yellow-600 rounded-xl text-xs font-semibold uppercase tracking-wide">{t('boundaryAccessAnalytics.tables.realTimeStatus.statuses.long')}</span>
                      </td>
                    </tr>
                    <tr className="hover:bg-[#0F4C81]/5 transition-colors">
                      <td className="px-4 py-4 border-b border-[#E2E8F0] font-mono text-sm">Ana Paula</td>
                      <td className="px-4 py-4 border-b border-[#E2E8F0] font-mono text-sm">Zona A</td>
                      <td className="px-4 py-4 border-b border-[#E2E8F0] font-mono text-sm">15:10</td>
                      <td className="px-4 py-4 border-b border-[#E2E8F0] font-mono text-sm">50min</td>
                      <td className="px-4 py-4 border-b border-[#E2E8F0]">
                        <span className="inline-block px-3 py-1 bg-green-100 text-green-600 rounded-xl text-xs font-semibold uppercase tracking-wide">{t('boundaryAccessAnalytics.tables.realTimeStatus.statuses.normal')}</span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* SECTION 2: Temporal */}
        {activeTab === 'temporal' && (
          <div className="animate-fade-in">
            <div className="bg-white rounded-xl border border-[#E2E8F0] p-6 mb-6">
              <div className="flex justify-between items-center pb-4 mb-4 border-b border-[#E2E8F0]">
                <div>
                  <div className="text-xl font-bold text-[#1A2332]">{t('boundaryAccessAnalytics.charts.timeSeries.title')}</div>
                  <div className="text-sm text-[#64748B] mt-1">{t('boundaryAccessAnalytics.charts.timeSeries.subtitle')}</div>
                </div>
                <div className="flex gap-2">
                  <button className="px-4 py-2 bg-[#0F4C81] text-white border border-[#0F4C81] rounded-lg text-sm font-semibold">{t('boundaryAccessAnalytics.buttons.days30')}</button>
                  <button className="px-4 py-2 bg-white border border-[#E2E8F0] rounded-lg text-sm font-semibold hover:border-[#0F4C81] hover:text-[#0F4C81]">{t('boundaryAccessAnalytics.buttons.days7')}</button>
                  <button className="px-4 py-2 bg-white border border-[#E2E8F0] rounded-lg text-sm font-semibold hover:border-[#0F4C81] hover:text-[#0F4C81]">{t('boundaryAccessAnalytics.buttons.days90')}</button>
                </div>
              </div>
              <div ref={chartRefs.timeseries} className="w-full h-[500px]"></div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl border border-[#E2E8F0] p-6">
                <div className="flex justify-between items-center pb-4 mb-4 border-b border-[#E2E8F0]">
                  <div>
                    <div className="text-xl font-bold text-[#1A2332]">{t('boundaryAccessAnalytics.charts.weeklyTrends.title')}</div>
                    <div className="text-sm text-[#64748B] mt-1">{t('boundaryAccessAnalytics.charts.weeklyTrends.subtitle')}</div>
                  </div>
                </div>
                <div ref={chartRefs.weeklyTrends} className="w-full h-[400px]"></div>
              </div>

              <div className="bg-white rounded-xl border border-[#E2E8F0] p-6">
                <div className="flex justify-between items-center pb-4 mb-4 border-b border-[#E2E8F0]">
                  <div>
                    <div className="text-xl font-bold text-[#1A2332]">{t('boundaryAccessAnalytics.charts.weeklyPattern.title')}</div>
                    <div className="text-sm text-[#64748B] mt-1">{t('boundaryAccessAnalytics.charts.weeklyPattern.subtitle')}</div>
                  </div>
                </div>
                <div ref={chartRefs.weeklyPattern} className="w-full h-[400px]"></div>
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
                  <div className="text-xl font-bold text-[#1A2332]">{t('boundaryAccessAnalytics.charts.heatmap.title')}</div>
                  <div className="text-sm text-[#64748B] mt-1">{t('boundaryAccessAnalytics.charts.heatmap.subtitle')}</div>
                </div>
                <select className="px-4 py-2 border border-[#E2E8F0] rounded-lg text-sm font-semibold">
                  <option>{t('boundaryAccessAnalytics.filters.allBoundaries')}</option>
                  <option>{t('boundaryAccessAnalytics.filters.zoneA')}</option>
                  <option>{t('boundaryAccessAnalytics.filters.zoneB')}</option>
                  <option>{t('boundaryAccessAnalytics.filters.zoneC')}</option>
                </select>
              </div>
              <div ref={chartRefs.heatmap} className="w-full h-[500px]"></div>
            </div>
          </div>
        )}

        {/* SECTION 4: Anomalies */}
        {activeTab === 'anomalies' && (
          <div className="animate-fade-in">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-xl border border-[#E2E8F0] p-6 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-1 h-full bg-[#FF6B35] transform scale-y-0 group-hover:scale-y-100 transition-transform duration-300"></div>
                <div className="text-sm text-[#64748B] uppercase tracking-wider font-semibold mb-2">{t('boundaryAccessAnalytics.kpis.detectedAnomalies')}</div>
                <div className="text-4xl font-bold text-[#0F4C81] font-mono mb-2">23</div>
                <div className="inline-flex items-center gap-1 px-2 py-1 bg-red-50 text-red-600 rounded text-sm font-mono">
                  <ArrowUpIcon className="w-3 h-3" />
                  5
                </div>
              </div>

              <div className="bg-white rounded-xl border border-[#E2E8F0] p-6 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-1 h-full bg-[#FF6B35] transform scale-y-0 group-hover:scale-y-100 transition-transform duration-300"></div>
                <div className="text-sm text-[#64748B] uppercase tracking-wider font-semibold mb-2">{t('boundaryAccessAnalytics.kpis.averageZScore')}</div>
                <div className="text-4xl font-bold text-[#0F4C81] font-mono mb-2">2.8</div>
                <div className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-50 text-yellow-600 rounded text-sm font-mono">
                  <ArrowUpIcon className="w-3 h-3" />
                  0.3
                </div>
              </div>

              <div className="bg-white rounded-xl border border-[#E2E8F0] p-6 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-1 h-full bg-[#FF6B35] transform scale-y-0 group-hover:scale-y-100 transition-transform duration-300"></div>
                <div className="text-sm text-[#64748B] uppercase tracking-wider font-semibold mb-2">{t('boundaryAccessAnalytics.kpis.extremeAnomalies')}</div>
                <div className="text-4xl font-bold text-[#0F4C81] font-mono mb-2">7</div>
                <div className="inline-flex items-center gap-1 px-2 py-1 bg-red-50 text-red-600 rounded text-sm font-mono">
                  <ArrowUpIcon className="w-3 h-3" />
                  2
                </div>
              </div>

              <div className="bg-white rounded-xl border border-[#E2E8F0] p-6 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-1 h-full bg-[#FF6B35] transform scale-y-0 group-hover:scale-y-100 transition-transform duration-300"></div>
                <div className="text-sm text-[#64748B] uppercase tracking-wider font-semibold mb-2">{t('boundaryAccessAnalytics.kpis.highAnomalies')}</div>
                <div className="text-4xl font-bold text-[#0F4C81] font-mono mb-2">16</div>
                <div className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-50 text-yellow-600 rounded text-sm font-mono">
                  <ArrowUpIcon className="w-3 h-3" />
                  3
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-[#E2E8F0] p-6 mb-6">
              <div className="flex justify-between items-center pb-4 mb-4 border-b border-[#E2E8F0]">
                <div>
                  <div className="text-xl font-bold text-[#1A2332]">{t('boundaryAccessAnalytics.charts.anomalies.title')}</div>
                  <div className="text-sm text-[#64748B] mt-1">{t('boundaryAccessAnalytics.charts.anomalies.subtitle')}</div>
                </div>
              </div>
              <div ref={chartRefs.anomalies} className="w-full h-[500px]"></div>
            </div>

            <div className="bg-white rounded-xl border border-[#E2E8F0] p-6">
              <div className="flex justify-between items-center pb-4 mb-4 border-b border-[#E2E8F0]">
                <div>
                  <div className="text-xl font-bold text-[#1A2332]">{t('boundaryAccessAnalytics.tables.topAnomalies.title')}</div>
                  <div className="text-sm text-[#64748B] mt-1">{t('boundaryAccessAnalytics.tables.topAnomalies.subtitle')}</div>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-[#F5F7FA]">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-[#64748B] uppercase tracking-wider border-b-2 border-[#E2E8F0]">{t('boundaryAccessAnalytics.tables.topAnomalies.headers.date')}</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-[#64748B] uppercase tracking-wider border-b-2 border-[#E2E8F0]">{t('boundaryAccessAnalytics.tables.topAnomalies.headers.person')}</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-[#64748B] uppercase tracking-wider border-b-2 border-[#E2E8F0]">{t('boundaryAccessAnalytics.tables.topAnomalies.headers.boundary')}</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-[#64748B] uppercase tracking-wider border-b-2 border-[#E2E8F0]">{t('boundaryAccessAnalytics.tables.topAnomalies.headers.duration')}</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-[#64748B] uppercase tracking-wider border-b-2 border-[#E2E8F0]">{t('boundaryAccessAnalytics.tables.topAnomalies.headers.average')}</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-[#64748B] uppercase tracking-wider border-b-2 border-[#E2E8F0]">{t('boundaryAccessAnalytics.tables.topAnomalies.headers.zScore')}</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-[#64748B] uppercase tracking-wider border-b-2 border-[#E2E8F0]">{t('boundaryAccessAnalytics.tables.topAnomalies.headers.level')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="hover:bg-[#0F4C81]/5 transition-colors">
                      <td className="px-4 py-4 border-b border-[#E2E8F0] font-mono text-sm">11/12/2024</td>
                      <td className="px-4 py-4 border-b border-[#E2E8F0] font-mono text-sm">Pedro Costa</td>
                      <td className="px-4 py-4 border-b border-[#E2E8F0] font-mono text-sm">Zona A</td>
                      <td className="px-4 py-4 border-b border-[#E2E8F0] font-mono text-sm">8.5h</td>
                      <td className="px-4 py-4 border-b border-[#E2E8F0] font-mono text-sm">2.3h</td>
                      <td className="px-4 py-4 border-b border-[#E2E8F0] font-mono text-sm">3.8</td>
                      <td className="px-4 py-4 border-b border-[#E2E8F0]">
                        <span className="inline-block px-3 py-1 bg-red-100 text-red-600 rounded-xl text-xs font-semibold uppercase tracking-wide">{t('boundaryAccessAnalytics.tables.topAnomalies.levels.extreme')}</span>
                      </td>
                    </tr>
                    <tr className="hover:bg-[#0F4C81]/5 transition-colors">
                      <td className="px-4 py-4 border-b border-[#E2E8F0] font-mono text-sm">10/12/2024</td>
                      <td className="px-4 py-4 border-b border-[#E2E8F0] font-mono text-sm">Ana Silva</td>
                      <td className="px-4 py-4 border-b border-[#E2E8F0] font-mono text-sm">Zona C</td>
                      <td className="px-4 py-4 border-b border-[#E2E8F0] font-mono text-sm">7.2h</td>
                      <td className="px-4 py-4 border-b border-[#E2E8F0] font-mono text-sm">3.1h</td>
                      <td className="px-4 py-4 border-b border-[#E2E8F0] font-mono text-sm">3.2</td>
                      <td className="px-4 py-4 border-b border-[#E2E8F0]">
                        <span className="inline-block px-3 py-1 bg-red-100 text-red-600 rounded-xl text-xs font-semibold uppercase tracking-wide">{t('boundaryAccessAnalytics.tables.topAnomalies.levels.extreme')}</span>
                      </td>
                    </tr>
                    <tr className="hover:bg-[#0F4C81]/5 transition-colors">
                      <td className="px-4 py-4 border-b border-[#E2E8F0] font-mono text-sm">09/12/2024</td>
                      <td className="px-4 py-4 border-b border-[#E2E8F0] font-mono text-sm">Carlos Lima</td>
                      <td className="px-4 py-4 border-b border-[#E2E8F0] font-mono text-sm">Zona B</td>
                      <td className="px-4 py-4 border-b border-[#E2E8F0] font-mono text-sm">6.8h</td>
                      <td className="px-4 py-4 border-b border-[#E2E8F0] font-mono text-sm">2.8h</td>
                      <td className="px-4 py-4 border-b border-[#E2E8F0] font-mono text-sm">2.9</td>
                      <td className="px-4 py-4 border-b border-[#E2E8F0]">
                        <span className="inline-block px-3 py-1 bg-yellow-100 text-yellow-600 rounded-xl text-xs font-semibold uppercase tracking-wide">{t('boundaryAccessAnalytics.tables.topAnomalies.levels.high')}</span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* SECTION 5: Flow */}
        {activeTab === 'flow' && (
          <div className="animate-fade-in">
            <div className="bg-white rounded-xl border border-[#E2E8F0] p-6 mb-6">
              <div className="flex justify-between items-center pb-4 mb-4 border-b border-[#E2E8F0]">
                <div>
                  <div className="text-xl font-bold text-[#1A2332]">{t('boundaryAccessAnalytics.charts.sankey.title')}</div>
                  <div className="text-sm text-[#64748B] mt-1">{t('boundaryAccessAnalytics.charts.sankey.subtitle')}</div>
                </div>
              </div>
              <div ref={chartRefs.sankey} className="w-full h-[500px]"></div>
            </div>

            <div className="bg-white rounded-xl border border-[#E2E8F0] p-6">
              <div className="flex justify-between items-center pb-4 mb-4 border-b border-[#E2E8F0]">
                <div>
                  <div className="text-xl font-bold text-[#1A2332]">{t('boundaryAccessAnalytics.tables.topTransitions.title')}</div>
                  <div className="text-sm text-[#64748B] mt-1">{t('boundaryAccessAnalytics.tables.topTransitions.subtitle')}</div>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-[#F5F7FA]">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-[#64748B] uppercase tracking-wider border-b-2 border-[#E2E8F0]">{t('boundaryAccessAnalytics.tables.topTransitions.headers.from')}</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-[#64748B] uppercase tracking-wider border-b-2 border-[#E2E8F0]">{t('boundaryAccessAnalytics.tables.topTransitions.headers.to')}</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-[#64748B] uppercase tracking-wider border-b-2 border-[#E2E8F0]">{t('boundaryAccessAnalytics.tables.topTransitions.headers.transitions')}</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-[#64748B] uppercase tracking-wider border-b-2 border-[#E2E8F0]">{t('boundaryAccessAnalytics.tables.topTransitions.headers.avgTime')}</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-[#64748B] uppercase tracking-wider border-b-2 border-[#E2E8F0]">{t('boundaryAccessAnalytics.tables.topTransitions.headers.type')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="hover:bg-[#0F4C81]/5 transition-colors">
                      <td className="px-4 py-4 border-b border-[#E2E8F0] font-mono text-sm">Zona A</td>
                      <td className="px-4 py-4 border-b border-[#E2E8F0] font-mono text-sm">Zona B</td>
                      <td className="px-4 py-4 border-b border-[#E2E8F0] font-mono text-sm">142</td>
                      <td className="px-4 py-4 border-b border-[#E2E8F0] font-mono text-sm">8.5 {t('boundaryAccessAnalytics.labels.minutes')}</td>
                      <td className="px-4 py-4 border-b border-[#E2E8F0]">
                        <span className="inline-block px-3 py-1 bg-blue-100 text-blue-600 rounded-xl text-xs font-semibold uppercase tracking-wide">{t('boundaryAccessAnalytics.tables.topTransitions.types.sameGroup')}</span>
                      </td>
                    </tr>
                    <tr className="hover:bg-[#0F4C81]/5 transition-colors">
                      <td className="px-4 py-4 border-b border-[#E2E8F0] font-mono text-sm">Zona B</td>
                      <td className="px-4 py-4 border-b border-[#E2E8F0] font-mono text-sm">Zona C</td>
                      <td className="px-4 py-4 border-b border-[#E2E8F0] font-mono text-sm">98</td>
                      <td className="px-4 py-4 border-b border-[#E2E8F0] font-mono text-sm">12.3 {t('boundaryAccessAnalytics.labels.minutes')}</td>
                      <td className="px-4 py-4 border-b border-[#E2E8F0]">
                        <span className="inline-block px-3 py-1 bg-yellow-100 text-yellow-600 rounded-xl text-xs font-semibold uppercase tracking-wide">{t('boundaryAccessAnalytics.tables.topTransitions.types.crossGroup')}</span>
                      </td>
                    </tr>
                    <tr className="hover:bg-[#0F4C81]/5 transition-colors">
                      <td className="px-4 py-4 border-b border-[#E2E8F0] font-mono text-sm">Zona C</td>
                      <td className="px-4 py-4 border-b border-[#E2E8F0] font-mono text-sm">Zona A</td>
                      <td className="px-4 py-4 border-b border-[#E2E8F0] font-mono text-sm">67</td>
                      <td className="px-4 py-4 border-b border-[#E2E8F0] font-mono text-sm">15.7 {t('boundaryAccessAnalytics.labels.minutes')}</td>
                      <td className="px-4 py-4 border-b border-[#E2E8F0]">
                        <span className="inline-block px-3 py-1 bg-yellow-100 text-yellow-600 rounded-xl text-xs font-semibold uppercase tracking-wide">{t('boundaryAccessAnalytics.tables.topTransitions.types.crossGroup')}</span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* SECTION 6: Compliance */}
        {activeTab === 'compliance' && (
          <div className="animate-fade-in">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-xl border border-[#E2E8F0] p-6 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-1 h-full bg-[#FF6B35] transform scale-y-0 group-hover:scale-y-100 transition-transform duration-300"></div>
                <div className="text-sm text-[#64748B] uppercase tracking-wider font-semibold mb-2">{t('boundaryAccessAnalytics.kpis.complianceRate')}</div>
                <div className="text-4xl font-bold text-[#0F4C81] font-mono mb-2">94.2%</div>
                <div className="inline-flex items-center gap-1 px-2 py-1 bg-green-50 text-green-600 rounded text-sm font-mono">
                  <ArrowUpIcon className="w-3 h-3" />
                  1.5%
                </div>
              </div>

              <div className="bg-white rounded-xl border border-[#E2E8F0] p-6 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-1 h-full bg-[#FF6B35] transform scale-y-0 group-hover:scale-y-100 transition-transform duration-300"></div>
                <div className="text-sm text-[#64748B] uppercase tracking-wider font-semibold mb-2">{t('boundaryAccessAnalytics.kpis.offHoursVisits')}</div>
                <div className="text-4xl font-bold text-[#0F4C81] font-mono mb-2">8.3%</div>
                <div className="inline-flex items-center gap-1 px-2 py-1 bg-red-50 text-red-600 rounded text-sm font-mono">
                  <ArrowUpIcon className="w-3 h-3" />
                  0.5%
                </div>
              </div>

              <div className="bg-white rounded-xl border border-[#E2E8F0] p-6 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-1 h-full bg-[#FF6B35] transform scale-y-0 group-hover:scale-y-100 transition-transform duration-300"></div>
                <div className="text-sm text-[#64748B] uppercase tracking-wider font-semibold mb-2">{t('boundaryAccessAnalytics.kpis.longVisits')}</div>
                <div className="text-4xl font-bold text-[#0F4C81] font-mono mb-2">12.1%</div>
                <div className="inline-flex items-center gap-1 px-2 py-1 bg-red-50 text-red-600 rounded text-sm font-mono">
                  <ArrowUpIcon className="w-3 h-3" />
                  2.3%
                </div>
              </div>

              <div className="bg-white rounded-xl border border-[#E2E8F0] p-6 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-1 h-full bg-[#FF6B35] transform scale-y-0 group-hover:scale-y-100 transition-transform duration-300"></div>
                <div className="text-sm text-[#64748B] uppercase tracking-wider font-semibold mb-2">{t('boundaryAccessAnalytics.kpis.weekendVisits')}</div>
                <div className="text-4xl font-bold text-[#0F4C81] font-mono mb-2">3.7%</div>
                <div className="inline-flex items-center gap-1 px-2 py-1 bg-green-50 text-green-600 rounded text-sm font-mono">
                  <ArrowDownIcon className="w-3 h-3" />
                  0.8%
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <div className="bg-white rounded-xl border border-[#E2E8F0] p-6">
                <div className="flex justify-between items-center pb-4 mb-4 border-b border-[#E2E8F0]">
                  <div>
                    <div className="text-xl font-bold text-[#1A2332]">{t('boundaryAccessAnalytics.charts.durationBuckets.title')}</div>
                    <div className="text-sm text-[#64748B] mt-1">{t('boundaryAccessAnalytics.charts.durationBuckets.subtitle')}</div>
                  </div>
                </div>
                <div ref={chartRefs.durationBuckets} className="w-full h-[400px]"></div>
              </div>

              <div className="bg-white rounded-xl border border-[#E2E8F0] p-6">
                <div className="flex justify-between items-center pb-4 mb-4 border-b border-[#E2E8F0]">
                  <div>
                    <div className="text-xl font-bold text-[#1A2332]">{t('boundaryAccessAnalytics.charts.alertRate.title')}</div>
                    <div className="text-sm text-[#64748B] mt-1">{t('boundaryAccessAnalytics.charts.alertRate.subtitle')}</div>
                  </div>
                </div>
                <div ref={chartRefs.alertRate} className="w-full h-[400px]"></div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-[#E2E8F0] p-6">
              <div className="flex justify-between items-center pb-4 mb-4 border-b border-[#E2E8F0]">
                <div>
                  <div className="text-xl font-bold text-[#1A2332]">{t('boundaryAccessAnalytics.tables.complianceSummary.title')}</div>
                  <div className="text-sm text-[#64748B] mt-1">{t('boundaryAccessAnalytics.tables.complianceSummary.subtitle')}</div>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-[#F5F7FA]">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-[#64748B] uppercase tracking-wider border-b-2 border-[#E2E8F0]">{t('boundaryAccessAnalytics.tables.complianceSummary.headers.boundary')}</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-[#64748B] uppercase tracking-wider border-b-2 border-[#E2E8F0]">{t('boundaryAccessAnalytics.tables.complianceSummary.headers.visits')}</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-[#64748B] uppercase tracking-wider border-b-2 border-[#E2E8F0]">{t('boundaryAccessAnalytics.tables.complianceSummary.headers.alertRate')}</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-[#64748B] uppercase tracking-wider border-b-2 border-[#E2E8F0]">{t('boundaryAccessAnalytics.tables.complianceSummary.headers.offHours')}</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-[#64748B] uppercase tracking-wider border-b-2 border-[#E2E8F0]">{t('boundaryAccessAnalytics.tables.complianceSummary.headers.weekend')}</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-[#64748B] uppercase tracking-wider border-b-2 border-[#E2E8F0]">{t('boundaryAccessAnalytics.tables.complianceSummary.headers.status')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="hover:bg-[#0F4C81]/5 transition-colors">
                      <td className="px-4 py-4 border-b border-[#E2E8F0] font-mono text-sm">Zona A</td>
                      <td className="px-4 py-4 border-b border-[#E2E8F0] font-mono text-sm">342</td>
                      <td className="px-4 py-4 border-b border-[#E2E8F0] font-mono text-sm">3.2%</td>
                      <td className="px-4 py-4 border-b border-[#E2E8F0] font-mono text-sm">5.8%</td>
                      <td className="px-4 py-4 border-b border-[#E2E8F0] font-mono text-sm">2.1%</td>
                      <td className="px-4 py-4 border-b border-[#E2E8F0]">
                        <span className="inline-block px-3 py-1 bg-green-100 text-green-600 rounded-xl text-xs font-semibold uppercase tracking-wide">{t('boundaryAccessAnalytics.tables.complianceSummary.statuses.ok')}</span>
                      </td>
                    </tr>
                    <tr className="hover:bg-[#0F4C81]/5 transition-colors">
                      <td className="px-4 py-4 border-b border-[#E2E8F0] font-mono text-sm">Zona B</td>
                      <td className="px-4 py-4 border-b border-[#E2E8F0] font-mono text-sm">289</td>
                      <td className="px-4 py-4 border-b border-[#E2E8F0] font-mono text-sm">5.4%</td>
                      <td className="px-4 py-4 border-b border-[#E2E8F0] font-mono text-sm">12.3%</td>
                      <td className="px-4 py-4 border-b border-[#E2E8F0] font-mono text-sm">4.8%</td>
                      <td className="px-4 py-4 border-b border-[#E2E8F0]">
                        <span className="inline-block px-3 py-1 bg-yellow-100 text-yellow-600 rounded-xl text-xs font-semibold uppercase tracking-wide">{t('boundaryAccessAnalytics.tables.complianceSummary.statuses.warning')}</span>
                      </td>
                    </tr>
                    <tr className="hover:bg-[#0F4C81]/5 transition-colors">
                      <td className="px-4 py-4 border-b border-[#E2E8F0] font-mono text-sm">Zona C</td>
                      <td className="px-4 py-4 border-b border-[#E2E8F0] font-mono text-sm">198</td>
                      <td className="px-4 py-4 border-b border-[#E2E8F0] font-mono text-sm">2.8%</td>
                      <td className="px-4 py-4 border-b border-[#E2E8F0] font-mono text-sm">6.1%</td>
                      <td className="px-4 py-4 border-b border-[#E2E8F0] font-mono text-sm">3.2%</td>
                      <td className="px-4 py-4 border-b border-[#E2E8F0]">
                        <span className="inline-block px-3 py-1 bg-green-100 text-green-600 rounded-xl text-xs font-semibold uppercase tracking-wide">{t('boundaryAccessAnalytics.tables.complianceSummary.statuses.ok')}</span>
                      </td>
                    </tr>
                  </tbody>
                </table>
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
                    <div className="text-xl font-bold text-[#1A2332]">{t('boundaryAccessAnalytics.charts.topPeople.title')}</div>
                    <div className="text-sm text-[#64748B] mt-1">{t('boundaryAccessAnalytics.charts.topPeople.subtitle')}</div>
                  </div>
                </div>
                <div ref={chartRefs.topPeople} className="w-full h-[400px]"></div>
              </div>

              <div className="bg-white rounded-xl border border-[#E2E8F0] p-6">
                <div className="flex justify-between items-center pb-4 mb-4 border-b border-[#E2E8F0]">
                  <div>
                    <div className="text-xl font-bold text-[#1A2332]">{t('boundaryAccessAnalytics.charts.frequency.title')}</div>
                    <div className="text-sm text-[#64748B] mt-1">{t('boundaryAccessAnalytics.charts.frequency.subtitle')}</div>
                  </div>
                </div>
                <div ref={chartRefs.frequency} className="w-full h-[400px]"></div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-[#E2E8F0] p-6">
              <div className="flex justify-between items-center pb-4 mb-4 border-b border-[#E2E8F0]">
                <div>
                  <div className="text-xl font-bold text-[#1A2332]">{t('boundaryAccessAnalytics.tables.detailedRanking.title')}</div>
                  <div className="text-sm text-[#64748B] mt-1">{t('boundaryAccessAnalytics.tables.detailedRanking.subtitle')}</div>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-[#F5F7FA]">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-[#64748B] uppercase tracking-wider border-b-2 border-[#E2E8F0]">{t('boundaryAccessAnalytics.tables.detailedRanking.headers.rank')}</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-[#64748B] uppercase tracking-wider border-b-2 border-[#E2E8F0]">{t('boundaryAccessAnalytics.tables.detailedRanking.headers.person')}</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-[#64748B] uppercase tracking-wider border-b-2 border-[#E2E8F0]">{t('boundaryAccessAnalytics.tables.detailedRanking.headers.mainBoundary')}</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-[#64748B] uppercase tracking-wider border-b-2 border-[#E2E8F0]">{t('boundaryAccessAnalytics.tables.detailedRanking.headers.duration')}</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-[#64748B] uppercase tracking-wider border-b-2 border-[#E2E8F0]">{t('boundaryAccessAnalytics.tables.detailedRanking.headers.visits')}</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-[#64748B] uppercase tracking-wider border-b-2 border-[#E2E8F0]">{t('boundaryAccessAnalytics.tables.detailedRanking.headers.activeDays')}</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-[#64748B] uppercase tracking-wider border-b-2 border-[#E2E8F0]">{t('boundaryAccessAnalytics.tables.detailedRanking.headers.avgPerVisit')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="hover:bg-[#0F4C81]/5 transition-colors">
                      <td className="px-4 py-4 border-b border-[#E2E8F0] font-mono text-sm">1</td>
                      <td className="px-4 py-4 border-b border-[#E2E8F0] font-mono text-sm">Pedro Costa</td>
                      <td className="px-4 py-4 border-b border-[#E2E8F0] font-mono text-sm">Zona A</td>
                      <td className="px-4 py-4 border-b border-[#E2E8F0] font-mono text-sm">89.5h</td>
                      <td className="px-4 py-4 border-b border-[#E2E8F0] font-mono text-sm">45</td>
                      <td className="px-4 py-4 border-b border-[#E2E8F0] font-mono text-sm">22</td>
                      <td className="px-4 py-4 border-b border-[#E2E8F0] font-mono text-sm">2.0h</td>
                    </tr>
                    <tr className="hover:bg-[#0F4C81]/5 transition-colors">
                      <td className="px-4 py-4 border-b border-[#E2E8F0] font-mono text-sm">2</td>
                      <td className="px-4 py-4 border-b border-[#E2E8F0] font-mono text-sm">Maria Santos</td>
                      <td className="px-4 py-4 border-b border-[#E2E8F0] font-mono text-sm">Zona B</td>
                      <td className="px-4 py-4 border-b border-[#E2E8F0] font-mono text-sm">78.3h</td>
                      <td className="px-4 py-4 border-b border-[#E2E8F0] font-mono text-sm">52</td>
                      <td className="px-4 py-4 border-b border-[#E2E8F0] font-mono text-sm">24</td>
                      <td className="px-4 py-4 border-b border-[#E2E8F0] font-mono text-sm">1.5h</td>
                    </tr>
                    <tr className="hover:bg-[#0F4C81]/5 transition-colors">
                      <td className="px-4 py-4 border-b border-[#E2E8F0] font-mono text-sm">3</td>
                      <td className="px-4 py-4 border-b border-[#E2E8F0] font-mono text-sm">João Silva</td>
                      <td className="px-4 py-4 border-b border-[#E2E8F0] font-mono text-sm">Zona C</td>
                      <td className="px-4 py-4 border-b border-[#E2E8F0] font-mono text-sm">72.1h</td>
                      <td className="px-4 py-4 border-b border-[#E2E8F0] font-mono text-sm">38</td>
                      <td className="px-4 py-4 border-b border-[#E2E8F0] font-mono text-sm">19</td>
                      <td className="px-4 py-4 border-b border-[#E2E8F0] font-mono text-sm">1.9h</td>
                    </tr>
                  </tbody>
                </table>
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