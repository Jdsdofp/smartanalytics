//src/components/Infraestruct/componentMN0400_133.tsx
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
    const days = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    
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
      xAxis: { type: 'value', name: 'Horas' },
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
        label: { show: true, position: 'right', formatter: '{c}h' }
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
          { value: 45, name: 'Manhã (6h-12h)', itemStyle: { color: '#0F4C81' } },
          { value: 42, name: 'Tarde (12h-18h)', itemStyle: { color: '#FF6B35' } },
          { value: 13, name: 'Noite (18h-6h)', itemStyle: { color: '#64748B' } }
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
      legend: { bottom: 10, data: ['Atual', 'MA 7d', 'MA 30d'] },
      grid: { left: 80, right: 80, top: 50, bottom: 80 },
      xAxis: { type: 'category', data: dates, boundaryGap: false },
      yAxis: { type: 'value', name: 'Horas' },
      series: [
        {
          name: 'Atual',
          type: 'line',
          data: data,
          itemStyle: { color: '#0F4C81' },
          areaStyle: { opacity: 0.2 }
        },
        {
          name: 'MA 7d',
          type: 'line',
          data: ma7,
          smooth: true,
          lineStyle: { type: 'dashed' },
          itemStyle: { color: '#FF6B35' }
        },
        {
          name: 'MA 30d',
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
      legend: { bottom: 10 },
      grid: { left: 80, right: 80, top: 20, bottom: 80 },
      xAxis: { type: 'category', data: ['S45', 'S46', 'S47', 'S48', 'S49', 'S50', 'S51', 'S52'] },
      yAxis: { type: 'value', name: 'Horas' },
      series: [
        {
          name: 'Semana Atual',
          type: 'bar',
          data: [3200, 3450, 3100, 3580, 3320, 3690, 3420, 3750],
          itemStyle: { color: '#0F4C81' }
        },
        {
          name: 'Semana Anterior',
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
    const option = {
      tooltip: { trigger: 'axis' },
      grid: { left: 80, right: 80, top: 20, bottom: 80 },
      xAxis: { type: 'category', data: ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'] },
      yAxis: { type: 'value', name: 'Visitas' },
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
        data: ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'],
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
          return `Data: ${params.value[0]}<br/>Duração: ${params.value[1].toFixed(1)}h<br/>Z-Score: ${params.value[2].toFixed(1)}`;
        }
      },
      grid: { left: 80, right: 80, top: 50, bottom: 80 },
      xAxis: { type: 'category', name: 'Data' },
      yAxis: { type: 'value', name: 'Duração (horas)' },
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
    const option = {
      tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
      grid: { left: 80, right: 50, top: 20, bottom: 80 },
      xAxis: { type: 'category', data: ['<30min', '30m-2h', '2h-4h', '4h-8h', '>8h'] },
      yAxis: { type: 'value', name: 'Visitas' },
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
      xAxis: { type: 'value', name: '%', max: 10 },
      yAxis: { type: 'category', data: ['Zona E', 'Zona D', 'Zona C', 'Zona B', 'Zona A'] },
      series: [{
        type: 'bar',
        data: [2.1, 2.8, 3.2, 5.4, 6.7],
        itemStyle: {
          color: (params: any) => {
            return params.value > 5 ? '#EF4444' : params.value > 3 ? '#F59E0B' : '#10B981';
          }
        },
        label: { show: true, position: 'right', formatter: '{c}%' }
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
      xAxis: { type: 'value', name: 'Horas (30d)' },
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
      xAxis: { type: 'value', name: 'Visitas/Dia' },
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
    { id: 'overview', label: 'Overview', icon: ChartBarIcon },
    { id: 'temporal', label: 'Análise Temporal', icon: ClockIcon },
    { id: 'heatmap', label: 'Heatmap', icon: FireIcon },
    { id: 'anomalies', label: 'Anomalias', icon: ExclamationTriangleIcon },
    { id: 'flow', label: 'Fluxo & Movimento', icon: ArrowPathIcon },
    { id: 'compliance', label: 'Compliance', icon: ShieldCheckIcon },
    { id: 'rankings', label: 'Rankings', icon: TrophyIcon }
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

      {/* Navigation Tabs - Agora rola com a página */}
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
                <div className="text-sm text-[#64748B] uppercase tracking-wider font-semibold mb-2">Visitas Hoje</div>
                <div className="text-4xl font-bold text-[#0F4C81] font-mono mb-2">1,247</div>
                <div className="inline-flex items-center gap-1 px-2 py-1 bg-green-50 text-green-600 rounded text-sm font-mono">
                  <ArrowUpIcon className="w-3 h-3" />
                  12.5%
                </div>
              </div>

              <div className="bg-white rounded-xl border border-[#E2E8F0] p-6 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-1 h-full bg-[#FF6B35] transform scale-y-0 group-hover:scale-y-100 transition-transform duration-300"></div>
                <div className="text-sm text-[#64748B] uppercase tracking-wider font-semibold mb-2">Horas Hoje</div>
                <div className="text-4xl font-bold text-[#0F4C81] font-mono mb-2">3,892</div>
                <div className="inline-flex items-center gap-1 px-2 py-1 bg-green-50 text-green-600 rounded text-sm font-mono">
                  <ArrowUpIcon className="w-3 h-3" />
                  8.3%
                </div>
              </div>

              <div className="bg-white rounded-xl border border-[#E2E8F0] p-6 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-1 h-full bg-[#FF6B35] transform scale-y-0 group-hover:scale-y-100 transition-transform duration-300"></div>
                <div className="text-sm text-[#64748B] uppercase tracking-wider font-semibold mb-2">Pessoas Ativas</div>
                <div className="text-4xl font-bold text-[#0F4C81] font-mono mb-2">342</div>
                <div className="inline-flex items-center gap-1 px-2 py-1 bg-red-50 text-red-600 rounded text-sm font-mono">
                  <ArrowDownIcon className="w-3 h-3" />
                  2.1%
                </div>
              </div>

              <div className="bg-white rounded-xl border border-[#E2E8F0] p-6 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-1 h-full bg-[#FF6B35] transform scale-y-0 group-hover:scale-y-100 transition-transform duration-300"></div>
                <div className="text-sm text-[#64748B] uppercase tracking-wider font-semibold mb-2">Taxa de Alertas</div>
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
                    <div className="text-xl font-bold text-[#1A2332]">Top 10 Boundaries</div>
                    <div className="text-sm text-[#64748B] mt-1">Por duração total (30 dias)</div>
                  </div>
                </div>
                <div ref={chartRefs.topBoundaries} className="w-full h-[400px]"></div>
              </div>

              <div className="bg-white rounded-xl border border-[#E2E8F0] p-6">
                <div className="flex justify-between items-center pb-4 mb-4 border-b border-[#E2E8F0]">
                  <div>
                    <div className="text-xl font-bold text-[#1A2332]">Distribuição por Turno</div>
                    <div className="text-sm text-[#64748B] mt-1">Última semana</div>
                  </div>
                </div>
                <div ref={chartRefs.shiftDistribution} className="w-full h-[400px]"></div>
              </div>
            </div>

            {/* Status Table */}
            <div className="bg-white rounded-xl border border-[#E2E8F0] p-6">
              <div className="flex justify-between items-center pb-4 mb-4 border-b border-[#E2E8F0]">
                <div>
                  <div className="text-xl font-bold text-[#1A2332]">Status em Tempo Real</div>
                  <div className="text-sm text-[#64748B] mt-1">Pessoas dentro de boundaries agora</div>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-[#F5F7FA]">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-[#64748B] uppercase tracking-wider border-b-2 border-[#E2E8F0]">Pessoa</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-[#64748B] uppercase tracking-wider border-b-2 border-[#E2E8F0]">Boundary</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-[#64748B] uppercase tracking-wider border-b-2 border-[#E2E8F0]">Entrada</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-[#64748B] uppercase tracking-wider border-b-2 border-[#E2E8F0]">Duração</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-[#64748B] uppercase tracking-wider border-b-2 border-[#E2E8F0]">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="hover:bg-[#0F4C81]/5 transition-colors">
                      <td className="px-4 py-4 border-b border-[#E2E8F0] font-mono text-sm">João Silva</td>
                      <td className="px-4 py-4 border-b border-[#E2E8F0] font-mono text-sm">Zona A</td>
                      <td className="px-4 py-4 border-b border-[#E2E8F0] font-mono text-sm">13:45</td>
                      <td className="px-4 py-4 border-b border-[#E2E8F0] font-mono text-sm">2h 15min</td>
                      <td className="px-4 py-4 border-b border-[#E2E8F0]">
                        <span className="inline-block px-3 py-1 bg-green-100 text-green-600 rounded-xl text-xs font-semibold uppercase tracking-wide">Normal</span>
                      </td>
                    </tr>
                    <tr className="hover:bg-[#0F4C81]/5 transition-colors">
                      <td className="px-4 py-4 border-b border-[#E2E8F0] font-mono text-sm">Maria Santos</td>
                      <td className="px-4 py-4 border-b border-[#E2E8F0] font-mono text-sm">Zona B</td>
                      <td className="px-4 py-4 border-b border-[#E2E8F0] font-mono text-sm">14:20</td>
                      <td className="px-4 py-4 border-b border-[#E2E8F0] font-mono text-sm">1h 40min</td>
                      <td className="px-4 py-4 border-b border-[#E2E8F0]">
                        <span className="inline-block px-3 py-1 bg-green-100 text-green-600 rounded-xl text-xs font-semibold uppercase tracking-wide">Normal</span>
                      </td>
                    </tr>
                    <tr className="hover:bg-[#0F4C81]/5 transition-colors">
                      <td className="px-4 py-4 border-b border-[#E2E8F0] font-mono text-sm">Pedro Costa</td>
                      <td className="px-4 py-4 border-b border-[#E2E8F0] font-mono text-sm">Zona C</td>
                      <td className="px-4 py-4 border-b border-[#E2E8F0] font-mono text-sm">10:30</td>
                      <td className="px-4 py-4 border-b border-[#E2E8F0] font-mono text-sm">5h 30min</td>
                      <td className="px-4 py-4 border-b border-[#E2E8F0]">
                        <span className="inline-block px-3 py-1 bg-yellow-100 text-yellow-600 rounded-xl text-xs font-semibold uppercase tracking-wide">Longo</span>
                      </td>
                    </tr>
                    <tr className="hover:bg-[#0F4C81]/5 transition-colors">
                      <td className="px-4 py-4 border-b border-[#E2E8F0] font-mono text-sm">Ana Paula</td>
                      <td className="px-4 py-4 border-b border-[#E2E8F0] font-mono text-sm">Zona A</td>
                      <td className="px-4 py-4 border-b border-[#E2E8F0] font-mono text-sm">15:10</td>
                      <td className="px-4 py-4 border-b border-[#E2E8F0] font-mono text-sm">50min</td>
                      <td className="px-4 py-4 border-b border-[#E2E8F0]">
                        <span className="inline-block px-3 py-1 bg-green-100 text-green-600 rounded-xl text-xs font-semibold uppercase tracking-wide">Normal</span>
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
                  <div className="text-xl font-bold text-[#1A2332]">Time Series com Médias Móveis</div>
                  <div className="text-sm text-[#64748B] mt-1">Duração total por dia (últimos 30 dias)</div>
                </div>
                <div className="flex gap-2">
                  <button className="px-4 py-2 bg-[#0F4C81] text-white border border-[#0F4C81] rounded-lg text-sm font-semibold">30 dias</button>
                  <button className="px-4 py-2 bg-white border border-[#E2E8F0] rounded-lg text-sm font-semibold hover:border-[#0F4C81] hover:text-[#0F4C81]">7 dias</button>
                  <button className="px-4 py-2 bg-white border border-[#E2E8F0] rounded-lg text-sm font-semibold hover:border-[#0F4C81] hover:text-[#0F4C81]">90 dias</button>
                </div>
              </div>
              <div ref={chartRefs.timeseries} className="w-full h-[500px]"></div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl border border-[#E2E8F0] p-6">
                <div className="flex justify-between items-center pb-4 mb-4 border-b border-[#E2E8F0]">
                  <div>
                    <div className="text-xl font-bold text-[#1A2332]">Tendências Semanais (WoW)</div>
                    <div className="text-sm text-[#64748B] mt-1">Últimas 8 semanas</div>
                  </div>
                </div>
                <div ref={chartRefs.weeklyTrends} className="w-full h-[400px]"></div>
              </div>

              <div className="bg-white rounded-xl border border-[#E2E8F0] p-6">
                <div className="flex justify-between items-center pb-4 mb-4 border-b border-[#E2E8F0]">
                  <div>
                    <div className="text-xl font-bold text-[#1A2332]">Padrão Semanal</div>
                    <div className="text-sm text-[#64748B] mt-1">Por dia da semana</div>
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
                  <div className="text-xl font-bold text-[#1A2332]">Heatmap de Atividade</div>
                  <div className="text-sm text-[#64748B] mt-1">Hora x Dia da Semana (últimos 30 dias)</div>
                </div>
                <select className="px-4 py-2 border border-[#E2E8F0] rounded-lg text-sm font-semibold">
                  <option>Todas as Boundaries</option>
                  <option>Zona A</option>
                  <option>Zona B</option>
                  <option>Zona C</option>
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
                <div className="text-sm text-[#64748B] uppercase tracking-wider font-semibold mb-2">Anomalias Detectadas</div>
                <div className="text-4xl font-bold text-[#0F4C81] font-mono mb-2">23</div>
                <div className="inline-flex items-center gap-1 px-2 py-1 bg-red-50 text-red-600 rounded text-sm font-mono">
                  <ArrowUpIcon className="w-3 h-3" />
                  5
                </div>
              </div>

              <div className="bg-white rounded-xl border border-[#E2E8F0] p-6 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-1 h-full bg-[#FF6B35] transform scale-y-0 group-hover:scale-y-100 transition-transform duration-300"></div>
                <div className="text-sm text-[#64748B] uppercase tracking-wider font-semibold mb-2">Z-Score Médio</div>
                <div className="text-4xl font-bold text-[#0F4C81] font-mono mb-2">2.8</div>
                <div className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-50 text-yellow-600 rounded text-sm font-mono">
                  <ArrowUpIcon className="w-3 h-3" />
                  0.3
                </div>
              </div>

              <div className="bg-white rounded-xl border border-[#E2E8F0] p-6 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-1 h-full bg-[#FF6B35] transform scale-y-0 group-hover:scale-y-100 transition-transform duration-300"></div>
                <div className="text-sm text-[#64748B] uppercase tracking-wider font-semibold mb-2">Extreme ({'>'}3.0)</div>
                <div className="text-4xl font-bold text-[#0F4C81] font-mono mb-2">7</div>
                <div className="inline-flex items-center gap-1 px-2 py-1 bg-red-50 text-red-600 rounded text-sm font-mono">
                  <ArrowUpIcon className="w-3 h-3" />
                  2
                </div>
              </div>

              <div className="bg-white rounded-xl border border-[#E2E8F0] p-6 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-1 h-full bg-[#FF6B35] transform scale-y-0 group-hover:scale-y-100 transition-transform duration-300"></div>
                <div className="text-sm text-[#64748B] uppercase tracking-wider font-semibold mb-2">High ({'>'}2.0)</div>
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
                  <div className="text-xl font-bold text-[#1A2332]">Anomalias por Z-Score</div>
                  <div className="text-sm text-[#64748B] mt-1">Últimos 30 dias</div>
                </div>
              </div>
              <div ref={chartRefs.anomalies} className="w-full h-[500px]"></div>
            </div>

            <div className="bg-white rounded-xl border border-[#E2E8F0] p-6">
              <div className="flex justify-between items-center pb-4 mb-4 border-b border-[#E2E8F0]">
                <div>
                  <div className="text-xl font-bold text-[#1A2332]">Top 10 Anomalias</div>
                  <div className="text-sm text-[#64748B] mt-1">Ordenado por Z-Score</div>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-[#F5F7FA]">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-[#64748B] uppercase tracking-wider border-b-2 border-[#E2E8F0]">Data</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-[#64748B] uppercase tracking-wider border-b-2 border-[#E2E8F0]">Pessoa</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-[#64748B] uppercase tracking-wider border-b-2 border-[#E2E8F0]">Boundary</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-[#64748B] uppercase tracking-wider border-b-2 border-[#E2E8F0]">Duração</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-[#64748B] uppercase tracking-wider border-b-2 border-[#E2E8F0]">Média</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-[#64748B] uppercase tracking-wider border-b-2 border-[#E2E8F0]">Z-Score</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-[#64748B] uppercase tracking-wider border-b-2 border-[#E2E8F0]">Nível</th>
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
                        <span className="inline-block px-3 py-1 bg-red-100 text-red-600 rounded-xl text-xs font-semibold uppercase tracking-wide">EXTREME</span>
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
                        <span className="inline-block px-3 py-1 bg-red-100 text-red-600 rounded-xl text-xs font-semibold uppercase tracking-wide">EXTREME</span>
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
                        <span className="inline-block px-3 py-1 bg-yellow-100 text-yellow-600 rounded-xl text-xs font-semibold uppercase tracking-wide">HIGH</span>
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
                  <div className="text-xl font-bold text-[#1A2332]">Fluxo de Movimento (Sankey)</div>
                  <div className="text-sm text-[#64748B] mt-1">Transições entre boundaries (últimos 7 dias)</div>
                </div>
              </div>
              <div ref={chartRefs.sankey} className="w-full h-[500px]"></div>
            </div>

            <div className="bg-white rounded-xl border border-[#E2E8F0] p-6">
              <div className="flex justify-between items-center pb-4 mb-4 border-b border-[#E2E8F0]">
                <div>
                  <div className="text-xl font-bold text-[#1A2332]">Top 20 Transições</div>
                  <div className="text-sm text-[#64748B] mt-1">Mais frequentes</div>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-[#F5F7FA]">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-[#64748B] uppercase tracking-wider border-b-2 border-[#E2E8F0]">De</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-[#64748B] uppercase tracking-wider border-b-2 border-[#E2E8F0]">Para</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-[#64748B] uppercase tracking-wider border-b-2 border-[#E2E8F0]">Transições</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-[#64748B] uppercase tracking-wider border-b-2 border-[#E2E8F0]">Tempo Médio</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-[#64748B] uppercase tracking-wider border-b-2 border-[#E2E8F0]">Tipo</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="hover:bg-[#0F4C81]/5 transition-colors">
                      <td className="px-4 py-4 border-b border-[#E2E8F0] font-mono text-sm">Zona A</td>
                      <td className="px-4 py-4 border-b border-[#E2E8F0] font-mono text-sm">Zona B</td>
                      <td className="px-4 py-4 border-b border-[#E2E8F0] font-mono text-sm">142</td>
                      <td className="px-4 py-4 border-b border-[#E2E8F0] font-mono text-sm">8.5 min</td>
                      <td className="px-4 py-4 border-b border-[#E2E8F0]">
                        <span className="inline-block px-3 py-1 bg-blue-100 text-blue-600 rounded-xl text-xs font-semibold uppercase tracking-wide">SAME GROUP</span>
                      </td>
                    </tr>
                    <tr className="hover:bg-[#0F4C81]/5 transition-colors">
                      <td className="px-4 py-4 border-b border-[#E2E8F0] font-mono text-sm">Zona B</td>
                      <td className="px-4 py-4 border-b border-[#E2E8F0] font-mono text-sm">Zona C</td>
                      <td className="px-4 py-4 border-b border-[#E2E8F0] font-mono text-sm">98</td>
                      <td className="px-4 py-4 border-b border-[#E2E8F0] font-mono text-sm">12.3 min</td>
                      <td className="px-4 py-4 border-b border-[#E2E8F0]">
                        <span className="inline-block px-3 py-1 bg-yellow-100 text-yellow-600 rounded-xl text-xs font-semibold uppercase tracking-wide">CROSS GROUP</span>
                      </td>
                    </tr>
                    <tr className="hover:bg-[#0F4C81]/5 transition-colors">
                      <td className="px-4 py-4 border-b border-[#E2E8F0] font-mono text-sm">Zona C</td>
                      <td className="px-4 py-4 border-b border-[#E2E8F0] font-mono text-sm">Zona A</td>
                      <td className="px-4 py-4 border-b border-[#E2E8F0] font-mono text-sm">67</td>
                      <td className="px-4 py-4 border-b border-[#E2E8F0] font-mono text-sm">15.7 min</td>
                      <td className="px-4 py-4 border-b border-[#E2E8F0]">
                        <span className="inline-block px-3 py-1 bg-yellow-100 text-yellow-600 rounded-xl text-xs font-semibold uppercase tracking-wide">CROSS GROUP</span>
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
                <div className="text-sm text-[#64748B] uppercase tracking-wider font-semibold mb-2">Taxa de Conformidade</div>
                <div className="text-4xl font-bold text-[#0F4C81] font-mono mb-2">94.2%</div>
                <div className="inline-flex items-center gap-1 px-2 py-1 bg-green-50 text-green-600 rounded text-sm font-mono">
                  <ArrowUpIcon className="w-3 h-3" />
                  1.5%
                </div>
              </div>

              <div className="bg-white rounded-xl border border-[#E2E8F0] p-6 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-1 h-full bg-[#FF6B35] transform scale-y-0 group-hover:scale-y-100 transition-transform duration-300"></div>
                <div className="text-sm text-[#64748B] uppercase tracking-wider font-semibold mb-2">Visitas Fora de Horário</div>
                <div className="text-4xl font-bold text-[#0F4C81] font-mono mb-2">8.3%</div>
                <div className="inline-flex items-center gap-1 px-2 py-1 bg-red-50 text-red-600 rounded text-sm font-mono">
                  <ArrowUpIcon className="w-3 h-3" />
                  0.5%
                </div>
              </div>

              <div className="bg-white rounded-xl border border-[#E2E8F0] p-6 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-1 h-full bg-[#FF6B35] transform scale-y-0 group-hover:scale-y-100 transition-transform duration-300"></div>
                <div className="text-sm text-[#64748B] uppercase tracking-wider font-semibold mb-2">Visitas {'>'}4h</div>
                <div className="text-4xl font-bold text-[#0F4C81] font-mono mb-2">12.1%</div>
                <div className="inline-flex items-center gap-1 px-2 py-1 bg-red-50 text-red-600 rounded text-sm font-mono">
                  <ArrowUpIcon className="w-3 h-3" />
                  2.3%
                </div>
              </div>

              <div className="bg-white rounded-xl border border-[#E2E8F0] p-6 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-1 h-full bg-[#FF6B35] transform scale-y-0 group-hover:scale-y-100 transition-transform duration-300"></div>
                <div className="text-sm text-[#64748B] uppercase tracking-wider font-semibold mb-2">Fim de Semana</div>
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
                    <div className="text-xl font-bold text-[#1A2332]">Distribuição de Duração</div>
                    <div className="text-sm text-[#64748B] mt-1">Buckets de tempo</div>
                  </div>
                </div>
                <div ref={chartRefs.durationBuckets} className="w-full h-[400px]"></div>
              </div>

              <div className="bg-white rounded-xl border border-[#E2E8F0] p-6">
                <div className="flex justify-between items-center pb-4 mb-4 border-b border-[#E2E8F0]">
                  <div>
                    <div className="text-xl font-bold text-[#1A2332]">Taxa de Alertas por Boundary</div>
                    <div className="text-sm text-[#64748B] mt-1">Últimos 30 dias</div>
                  </div>
                </div>
                <div ref={chartRefs.alertRate} className="w-full h-[400px]"></div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-[#E2E8F0] p-6">
              <div className="flex justify-between items-center pb-4 mb-4 border-b border-[#E2E8F0]">
                <div>
                  <div className="text-xl font-bold text-[#1A2332]">Resumo de Compliance</div>
                  <div className="text-sm text-[#64748B] mt-1">Por boundary</div>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-[#F5F7FA]">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-[#64748B] uppercase tracking-wider border-b-2 border-[#E2E8F0]">Boundary</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-[#64748B] uppercase tracking-wider border-b-2 border-[#E2E8F0]">Visitas</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-[#64748B] uppercase tracking-wider border-b-2 border-[#E2E8F0]">Taxa Alertas</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-[#64748B] uppercase tracking-wider border-b-2 border-[#E2E8F0]">Fora Horário</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-[#64748B] uppercase tracking-wider border-b-2 border-[#E2E8F0]">Fim Semana</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-[#64748B] uppercase tracking-wider border-b-2 border-[#E2E8F0]">Status</th>
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
                        <span className="inline-block px-3 py-1 bg-green-100 text-green-600 rounded-xl text-xs font-semibold uppercase tracking-wide">OK</span>
                      </td>
                    </tr>
                    <tr className="hover:bg-[#0F4C81]/5 transition-colors">
                      <td className="px-4 py-4 border-b border-[#E2E8F0] font-mono text-sm">Zona B</td>
                      <td className="px-4 py-4 border-b border-[#E2E8F0] font-mono text-sm">289</td>
                      <td className="px-4 py-4 border-b border-[#E2E8F0] font-mono text-sm">5.4%</td>
                      <td className="px-4 py-4 border-b border-[#E2E8F0] font-mono text-sm">12.3%</td>
                      <td className="px-4 py-4 border-b border-[#E2E8F0] font-mono text-sm">4.8%</td>
                      <td className="px-4 py-4 border-b border-[#E2E8F0]">
                        <span className="inline-block px-3 py-1 bg-yellow-100 text-yellow-600 rounded-xl text-xs font-semibold uppercase tracking-wide">Atenção</span>
                      </td>
                    </tr>
                    <tr className="hover:bg-[#0F4C81]/5 transition-colors">
                      <td className="px-4 py-4 border-b border-[#E2E8F0] font-mono text-sm">Zona C</td>
                      <td className="px-4 py-4 border-b border-[#E2E8F0] font-mono text-sm">198</td>
                      <td className="px-4 py-4 border-b border-[#E2E8F0] font-mono text-sm">2.8%</td>
                      <td className="px-4 py-4 border-b border-[#E2E8F0] font-mono text-sm">6.1%</td>
                      <td className="px-4 py-4 border-b border-[#E2E8F0] font-mono text-sm">3.2%</td>
                      <td className="px-4 py-4 border-b border-[#E2E8F0]">
                        <span className="inline-block px-3 py-1 bg-green-100 text-green-600 rounded-xl text-xs font-semibold uppercase tracking-wide">OK</span>
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
                    <div className="text-xl font-bold text-[#1A2332]">Top 10 Pessoas</div>
                    <div className="text-sm text-[#64748B] mt-1">Por duração total (30 dias)</div>
                  </div>
                </div>
                <div ref={chartRefs.topPeople} className="w-full h-[400px]"></div>
              </div>

              <div className="bg-white rounded-xl border border-[#E2E8F0] p-6">
                <div className="flex justify-between items-center pb-4 mb-4 border-b border-[#E2E8F0]">
                  <div>
                    <div className="text-xl font-bold text-[#1A2332]">Top 10 por Frequência</div>
                    <div className="text-sm text-[#64748B] mt-1">Visitas por dia</div>
                  </div>
                </div>
                <div ref={chartRefs.frequency} className="w-full h-[400px]"></div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-[#E2E8F0] p-6">
              <div className="flex justify-between items-center pb-4 mb-4 border-b border-[#E2E8F0]">
                <div>
                  <div className="text-xl font-bold text-[#1A2332]">Ranking Detalhado</div>
                  <div className="text-sm text-[#64748B] mt-1">Últimos 30 dias</div>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-[#F5F7FA]">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-[#64748B] uppercase tracking-wider border-b-2 border-[#E2E8F0]">#</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-[#64748B] uppercase tracking-wider border-b-2 border-[#E2E8F0]">Pessoa</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-[#64748B] uppercase tracking-wider border-b-2 border-[#E2E8F0]">Boundary Principal</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-[#64748B] uppercase tracking-wider border-b-2 border-[#E2E8F0]">Duração (30d)</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-[#64748B] uppercase tracking-wider border-b-2 border-[#E2E8F0]">Visitas</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-[#64748B] uppercase tracking-wider border-b-2 border-[#E2E8F0]">Dias Ativos</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-[#64748B] uppercase tracking-wider border-b-2 border-[#E2E8F0]">Média/Visita</th>
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