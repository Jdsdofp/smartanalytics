// src/components/Infraestruct/componentMN0400_134_COMPLETE.tsx

import { useState, useEffect, useRef } from 'react';
import * as echarts from 'echarts';
import { useTemperatureAnalytics } from '../../hooks/useTemperatureAnalytics';
import TemperatureHeatmapCalendar from './Components/TemperatureHeatmapCalendar';

export default function TemperatureAnalytics() {
  const [activeTab, setActiveTab] = useState<'overview' | 'trends' | 'distance' | 'temperature'>('overview');
  const [heatmapMetric, setHeatmapMetric] = useState<'temperature' | 'events'>('temperature');

  // Estado para controle do agrupamento
  const [timelineGroupBy, setTimelineGroupBy] = useState<'hour' | 'day' | 'week'>('hour');
  const [timelineChartType, setTimelineChartType] = useState<'bar' | 'line' | 'line-area'>('bar');

  const {
    // Overview
    exposureStats,
    currentStats,
    criticalPersons,
    exposureTimeline,

    // Trends
    temperatureTrends,
    comfortAnalysis,
    zonePatterns,
    variationAnalysis,

    // Distance
    distanceStats,
    distancePatterns,
    categoryComparison,

    activityHeatmap,
    fetchActivityHeatmap,

    // Control
    loading,
    error,
    filters,
    setFilters,
  } = useTemperatureAnalytics(activeTab);

  // Refs para Overview
  const severityChartRef = useRef<HTMLDivElement>(null);
  const hourlyChartRef = useRef<HTMLDivElement>(null);
  const riskChartRef = useRef<HTMLDivElement>(null);
  const timelineChartRef = useRef<HTMLDivElement>(null);

  // Refs para Trends
  const trendsChartRef = useRef<HTMLDivElement>(null);
  const comfortDistChartRef = useRef<HTMLDivElement>(null);
  const comfortTimelineChartRef = useRef<HTMLDivElement>(null);
  const zoneStatsChartRef = useRef<HTMLDivElement>(null);
  const variationChartRef = useRef<HTMLDivElement>(null);

  // Refs para Distance
  const distanceCategoryChartRef = useRef<HTMLDivElement>(null);
  const distanceTempCorrChartRef = useRef<HTMLDivElement>(null);
  const distanceTimelineChartRef = useRef<HTMLDivElement>(null);
  const categoryComparisonChartRef = useRef<HTMLDivElement>(null);
  const tempGaugeChartRef = useRef<HTMLDivElement>(null);

  const [chartsInitialized, setChartsInitialized] = useState(false);


  // Função para agrupar dados
  const groupTimelineData = (data: any[], groupBy: 'hour' | 'day' | 'week') => {
    if (groupBy === 'hour') {
      return data.map(item => ({
        ...item,
        label: `${item.event_hour}h`,
        key: `${item.event_date}_${item.event_hour}`,
      }));
    }

    if (groupBy === 'day') {
      const grouped = data.reduce((acc: any, item: any) => {
        const date = new Date(item.event_date).toLocaleDateString('pt-BR');
        if (!acc[date]) {
          acc[date] = {
            label: date,
            key: date,
            event_count: 0,
            critical_count: 0,
            temps: [],
          };
        }
        acc[date].event_count += item.event_count;
        acc[date].critical_count += Number(item.critical_count);
        acc[date].temps.push(Number(item.avg_temp));
        return acc;
      }, {});

      return Object.values(grouped).map((item: any) => ({
        ...item,
        avg_temp: (item.temps.reduce((a: number, b: number) => a + b, 0) / item.temps.length).toFixed(2),
      }));
    }

    if (groupBy === 'week') {
      const grouped = data.reduce((acc: any, item: any) => {
        const date = new Date(item.event_date);
        const weekStart = new Date(date.setDate(date.getDate() - date.getDay()));
        const weekKey = weekStart.toLocaleDateString('pt-BR');

        if (!acc[weekKey]) {
          acc[weekKey] = {
            label: `Semana ${weekKey}`,
            key: weekKey,
            event_count: 0,
            critical_count: 0,
            temps: [],
          };
        }
        acc[weekKey].event_count += item.event_count;
        acc[weekKey].critical_count += Number(item.critical_count);
        acc[weekKey].temps.push(Number(item.avg_temp));
        return acc;
      }, {});

      return Object.values(grouped).map((item: any) => ({
        ...item,
        avg_temp: (item.temps.reduce((a: number, b: number) => a + b, 0) / item.temps.length).toFixed(2),
      }));
    }

    return data;
  };



  // ============================================
  // Verificar dados carregados
  // ============================================
  useEffect(() => {
    if (activeTab === 'overview' && exposureStats && currentStats && exposureTimeline) {
      setChartsInitialized(true);
      fetchActivityHeatmap(heatmapMetric);
      fetchActivityHeatmap(heatmapMetric);
    } else if (activeTab === 'trends' && temperatureTrends && comfortAnalysis) {
      setChartsInitialized(true);
    } else if (activeTab === 'distance' && distanceStats && distancePatterns) {
      setChartsInitialized(true);
    } else {
      setChartsInitialized(false);
    }
  }, [activeTab, exposureStats, currentStats, temperatureTrends, distanceStats]);

  // ============================================
  // CHARTS - OVERVIEW
  // ============================================

  // Gráfico 1: Severidade (Donut)
  useEffect(() => {
    if (!severityChartRef.current || !chartsInitialized || activeTab !== 'overview') return;
    if (!exposureStats?.events_by_severity?.length) return;

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
      series: [{
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
              item.severity === 'CRITICAL' ? '#ff4d4f' :
                item.severity === 'HIGH' ? '#ff7a45' :
                  item.severity === 'MEDIUM' ? '#ffa940' : '#52c41a',
          },
        })),
      }],
    };
    chart.setOption(option);

    const handleResize = () => chart.resize();
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      chart.dispose();
    };
  }, [exposureStats, chartsInitialized, activeTab]);

  // Gráfico 2: Eventos por Hora (Bar + Line) - COM RÓTULOS
  useEffect(() => {
    if (!hourlyChartRef.current || !chartsInitialized || activeTab !== 'overview') return;
    if (!exposureStats?.events_by_hour?.length) return;

    const chart = echarts.init(hourlyChartRef.current);
    const option: echarts.EChartsOption = {
      title: {
        text: 'Eventos e Temperatura por Hora',
        left: 'center',
        textStyle: {
          fontSize: 16,
          fontWeight: 600,
          color: '#1f2937',
        },
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'cross',
          crossStyle: {
            color: '#999',
          },
        },
        backgroundColor: 'rgba(50, 50, 50, 0.9)',
        borderColor: 'transparent',
        borderRadius: 8,
        padding: [12, 16],
        textStyle: {
          color: '#fff',
          fontSize: 13,
        },
        formatter: (params: any) => {
          const hour = params[0].name;
          let result = `<div style="font-weight: 600; margin-bottom: 8px; padding-bottom: 8px; border-bottom: 1px solid rgba(255,255,255,0.2);">${hour}</div>`;

          params.forEach((param: any) => {
            const icon = param.seriesName === 'Eventos' ? '📊' : '🌡️';
            const value = param.seriesName === 'Eventos'
              ? param.value.toLocaleString()
              : `${param.value}°C`;

            result += `
            <div style="display: flex; align-items: center; gap: 8px; margin-top: 6px;">
              <span style="font-size: 16px;">${icon}</span>
              <div style="flex: 1;">
                <div style="color: #9ca3af; font-size: 11px;">${param.seriesName}</div>
                <div style="font-weight: 700; color: ${param.color};">${value}</div>
              </div>
            </div>
          `;
          });

          return result;
        },
      },
      legend: {
        data: ['Eventos', 'Temperatura Média'],
        bottom: 0,
        itemGap: 20,
        textStyle: {
          fontSize: 12,
          color: '#374151',
        },
      },
      grid: {
        left: '3%',
        right: '5%',
        bottom: '12%',
        top: '15%',
        containLabel: true,
      },
      xAxis: {
        type: 'category',
        data: exposureStats.events_by_hour.map((item: any) => `${item.hour}h`),
        axisLabel: {
          fontSize: 11,
          color: '#6b7280',
          rotate: 0,
        },
        axisLine: {
          lineStyle: {
            color: '#e5e7eb',
          },
        },
        axisTick: {
          show: false,
        },
      },
      yAxis: [
        {
          type: 'value',
          name: 'Eventos',
          position: 'left',
          nameTextStyle: {
            fontSize: 12,
            color: '#374151',
            fontWeight: 600,
          },
          axisLabel: {
            fontSize: 11,
            color: '#6b7280',
            formatter: (value: number) => {
              if (value >= 1000) {
                return (value / 1000) + 'k';
              }
              return value.toString();
            },
          },
          splitLine: {
            lineStyle: {
              color: '#f3f4f6',
              type: 'dashed',
            },
          },
        },
        {
          type: 'value',
          name: 'Temp. (°C)',
          position: 'right',
          nameTextStyle: {
            fontSize: 12,
            color: '#374151',
            fontWeight: 600,
          },
          axisLabel: {
            fontSize: 11,
            color: '#6b7280',
            formatter: '{value}°C',
          },
          splitLine: {
            show: false,
          },
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
          emphasis: {
            itemStyle: {
              color: '#ff5722',
              shadowBlur: 10,
              shadowColor: 'rgba(255, 122, 69, 0.5)',
            },
          },
          barMaxWidth: 50,
          // ✅ RÓTULOS DE DADOS
          label: {
            show: true,
            position: 'top',
            fontSize: 11,
            fontWeight: 600,
            color: '#ff7a45',
            formatter: (params: any) => {
              if (params.value > 0) {
                return params.value >= 1000
                  ? (params.value / 1000) + 'k'
                  : params.value.toLocaleString();
              }
              return '';
            },
            distance: 5,
          },
        },
        {
          name: 'Temperatura Média',
          type: 'line',
          yAxisIndex: 1,
          data: exposureStats.events_by_hour.map((item: any) =>
            item.avg_temp ? parseFloat(item.avg_temp).toFixed(1) : 0
          ),
          smooth: true,
          lineStyle: {
            width: 3,
            color: '#1890ff',
          },
          itemStyle: {
            color: '#1890ff',
            borderWidth: 3,
            borderColor: '#fff',
          },
          symbol: 'circle',
          symbolSize: 8,
          emphasis: {
            itemStyle: {
              color: '#1890ff',
              borderWidth: 4,
              shadowBlur: 10,
              shadowColor: 'rgba(24, 144, 255, 0.5)',
            },
            lineStyle: {
              width: 4,
            },
          },
          // ✅ RÓTULOS DE DADOS NA LINHA
          label: {
            show: true,
            position: 'top',
            fontSize: 10,
            fontWeight: 600,
            color: '#1890ff',
            formatter: (params: any) => {
              return params.value ? `${params.value}°C` : '';
            },
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            padding: [3, 6],
            borderRadius: 4,
            borderColor: '#1890ff',
            borderWidth: 1,
            distance: 8,
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
  }, [exposureStats, chartsInitialized, activeTab]);

  // Gráfico 3: Nível de Risco (Pie)
  useEffect(() => {
    if (!riskChartRef.current || !chartsInitialized || activeTab !== 'overview') return;
    if (!currentStats?.by_risk_level?.length) return;

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
      series: [{
        name: 'Nível de Risco',
        type: 'pie',
        radius: '60%',
        center: ['50%', '45%'],
        data: currentStats.by_risk_level.map((item: any) => ({
          value: item.count,
          name: item.risk_level,
          itemStyle: {
            color:
              item.risk_level === 'CRITICAL' ? '#ff4d4f' :
                item.risk_level === 'HIGH' ? '#ff7a45' :
                  item.risk_level === 'MEDIUM' ? '#ffa940' : '#52c41a',
          },
        })),
        label: {
          formatter: '{b}\n{c}',
        },
      }],
    };
    chart.setOption(option);

    const handleResize = () => chart.resize();
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      chart.dispose();
    };
  }, [currentStats, chartsInitialized, activeTab]);

  // Gráfico 4: Timeline (COM CONTROLES DE AGRUPAMENTO)
  useEffect(() => {
    if (!timelineChartRef.current || !chartsInitialized || activeTab !== 'overview') return;
    if (!exposureTimeline?.length) return;

    const chart = echarts.init(timelineChartRef.current);

    const sortedTimeline = [...exposureTimeline].sort(
      (a: any, b: any) =>
        new Date(`${a.event_date} ${a.event_hour}:00`).getTime() -
        new Date(`${b.event_date} ${b.event_hour}:00`).getTime()
    );

    const groupedData = groupTimelineData(sortedTimeline, timelineGroupBy);

    // Determinar se é área
    const isArea = timelineChartType === 'line-area';
    const isBar = timelineChartType === 'bar';

    const option: echarts.EChartsOption = {
      title: {
        text: 'Timeline de Eventos',
        left: 'center',
        top: 10,
        textStyle: {
          fontSize: 16,
          fontWeight: 600,
          color: '#1f2937',
        },
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'cross',
          crossStyle: {
            color: '#999',
          },
        },
        backgroundColor: 'rgba(50, 50, 50, 0.9)',
        borderColor: 'transparent',
        borderRadius: 8,
        padding: [12, 16],
        textStyle: {
          color: '#fff',
          fontSize: 13,
        },
      },
      legend: {
        data: ['Total Eventos', 'Eventos Críticos', 'Temp. Média'],
        bottom: 15,
        itemGap: 20,
        textStyle: {
          fontSize: 12,
          color: '#374151',
        },
      },
      grid: {
        left: '3%',
        right: '5%',
        bottom: '15%',
        top: '12%',
        containLabel: true,
      },
      xAxis: {
        type: 'category',
        data: groupedData.map((item: any) => item.label),
        axisLabel: {
          rotate: timelineGroupBy === 'hour' ? 45 : 0,
          fontSize: 11,
          color: '#6b7280',
          margin: 12,
        },
        axisLine: {
          lineStyle: {
            color: '#e5e7eb',
          },
        },
        axisTick: {
          show: false,
        },
      },
      yAxis: [
        {
          type: 'value',
          name: 'Eventos',
          nameTextStyle: {
            fontSize: 12,
            color: '#374151',
            fontWeight: 600,
          },
          axisLabel: {
            fontSize: 11,
            color: '#6b7280',
            formatter: (value: number) => {
              if (value >= 1000) {
                return (value / 1000) + 'k';
              }
              return value.toString();
            },
          },
          splitLine: {
            lineStyle: {
              color: '#f3f4f6',
              type: 'dashed',
            },
          },
        },
        {
          type: 'value',
          name: 'Temp. (°C)',
          position: 'right',
          nameTextStyle: {
            fontSize: 12,
            color: '#374151',
            fontWeight: 600,
          },
          axisLabel: {
            fontSize: 11,
            color: '#6b7280',
            formatter: '{value}°C',
          },
          splitLine: {
            show: false,
          },
        },
      ],
      series: [
        {
          name: 'Total Eventos',
          type: isBar ? 'bar' : 'line', // ✅ CORREÇÃO
          data: groupedData.map((item: any) => item.event_count),
          itemStyle: {
            color: '#1890ff',
            borderRadius: isBar ? [4, 4, 0, 0] : undefined,
          },
          emphasis: {
            itemStyle: {
              color: '#096dd9',
              shadowBlur: 10,
              shadowColor: 'rgba(24, 144, 255, 0.5)',
            },
          },
          barMaxWidth: 40,
          smooth: !isBar,
          areaStyle: isArea ? {
            color: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                { offset: 0, color: 'rgba(24, 144, 255, 0.3)' },
                { offset: 1, color: 'rgba(24, 144, 255, 0.05)' },
              ],
            },
          } : undefined,
          label: {
            show: timelineGroupBy !== 'hour',
            position: 'top',
            fontSize: 10,
            fontWeight: 600,
            color: '#1890ff',
            formatter: (params: any) => {
              if (params.value > 0) {
                return params.value >= 1000
                  ? (params.value / 1000) + 'k'
                  : params.value.toString();
              }
              return '';
            },
            distance: 5,
          },
        },
        {
          name: 'Eventos Críticos',
          type: isBar ? 'bar' : 'line', // ✅ CORREÇÃO
          data: groupedData.map((item: any) => item.critical_count),
          itemStyle: {
            color: '#ff4d4f',
            borderRadius: isBar ? [4, 4, 0, 0] : undefined,
          },
          emphasis: {
            itemStyle: {
              color: '#cf1322',
              shadowBlur: 10,
              shadowColor: 'rgba(255, 77, 79, 0.5)',
            },
          },
          barMaxWidth: 40,
          smooth: !isBar,
          areaStyle: isArea ? {
            color: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                { offset: 0, color: 'rgba(255, 77, 79, 0.3)' },
                { offset: 1, color: 'rgba(255, 77, 79, 0.05)' },
              ],
            },
          } : undefined,
          label: {
            show: timelineGroupBy !== 'hour',
            position: 'top',
            fontSize: 10,
            fontWeight: 600,
            color: '#ff4d4f',
            formatter: (params: any) => {
              if (params.value > 0) {
                return params.value >= 1000
                  ? (params.value / 1000) + 'k'
                  : params.value.toString();
              }
              return '';
            },
            distance: 5,
          },
        },
        {
          name: 'Temp. Média',
          type: 'line',
          yAxisIndex: 1,
          data: groupedData.map((item: any) => Number(item.avg_temp).toFixed(2)),
          smooth: true,
          lineStyle: {
            width: 3,
            color: '#52c41a',
          },
          itemStyle: {
            color: '#52c41a',
            borderWidth: 3,
            borderColor: '#fff',
          },
          symbol: 'circle',
          symbolSize: 8,
          emphasis: {
            itemStyle: {
              color: '#52c41a',
              borderWidth: 4,
              shadowBlur: 10,
              shadowColor: 'rgba(82, 196, 26, 0.5)',
            },
            lineStyle: {
              width: 4,
            },
          },
          areaStyle: {
            color: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                { offset: 0, color: 'rgba(82, 196, 26, 0.2)' },
                { offset: 1, color: 'rgba(82, 196, 26, 0.05)' },
              ],
            },
          },
          label: {
            show: timelineGroupBy !== 'hour',
            position: 'top',
            fontSize: 10,
            fontWeight: 600,
            color: '#52c41a',
            formatter: (params: any) => {
              return params.value ? `${params.value}°C` : '';
            },
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            padding: [3, 6],
            borderRadius: 4,
            borderColor: '#52c41a',
            borderWidth: 1,
            distance: 8,
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
  }, [exposureTimeline, chartsInitialized, activeTab, timelineGroupBy, timelineChartType]);

  // ============================================
  // CHARTS - TEMPERATURE TRENDS
  // ============================================

  // Gráfico 1: Temperature Trends Over Time (COM RÓTULOS)
  useEffect(() => {
    if (!trendsChartRef.current || !chartsInitialized || activeTab !== 'trends') return;
    if (!temperatureTrends?.data?.length) return;

    const chart = echarts.init(trendsChartRef.current);
    const option: echarts.EChartsOption = {
      title: {
        text: 'Tendência de Temperatura ao Longo do Tempo',
        left: 'center',
        textStyle: {
          fontSize: 16,
          fontWeight: 600,
          color: '#1f2937',
        },
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'cross' },
        backgroundColor: 'rgba(50, 50, 50, 0.9)',
        borderColor: 'transparent',
        borderRadius: 8,
        padding: [12, 16],
        textStyle: {
          color: '#fff',
          fontSize: 13,
        },
      },
      legend: {
        data: ['Temp. Média', 'Temp. Máx', 'Temp. Mín', 'Eventos Críticos'],
        bottom: 0,
        itemGap: 20,
        textStyle: {
          fontSize: 12,
          color: '#374151',
        },
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '12%',
        top: '15%',
        containLabel: true,
      },
      xAxis: {
        type: 'category',
        data: temperatureTrends.data.map((item: any) => item.period),
        axisLabel: {
          rotate: 45,
          fontSize: 11,
          color: '#6b7280',
        },
        axisLine: {
          lineStyle: {
            color: '#e5e7eb',
          },
        },
      },
      yAxis: [
        {
          type: 'value',
          name: 'Temperatura (°C)',
          nameTextStyle: {
            fontSize: 12,
            color: '#374151',
            fontWeight: 600,
          },
          axisLabel: {
            fontSize: 11,
            color: '#6b7280',
            formatter: '{value}°C',
          },
          splitLine: {
            lineStyle: {
              color: '#f3f4f6',
              type: 'dashed',
            },
          },
        },
        {
          type: 'value',
          name: 'Eventos',
          position: 'right',
          nameTextStyle: {
            fontSize: 12,
            color: '#374151',
            fontWeight: 600,
          },
          axisLabel: {
            fontSize: 11,
            color: '#6b7280',
            formatter: (value: number) => {
              if (value >= 1000) {
                return (value / 1000) + 'k';
              }
              return value.toString();
            },
          },
          splitLine: {
            show: false,
          },
        },
      ],
      series: [
        {
          name: 'Temp. Média',
          type: 'line',
          data: temperatureTrends.data.map((item: any) => Number(item.avg_temp).toFixed(2)),
          smooth: true,
          lineStyle: {
            width: 3,
            color: '#1890ff',
          },
          itemStyle: {
            color: '#1890ff',
            borderWidth: 3,
            borderColor: '#fff',
          },
          symbol: 'circle',
          symbolSize: 8,
          emphasis: {
            itemStyle: {
              color: '#1890ff',
              borderWidth: 4,
              shadowBlur: 10,
              shadowColor: 'rgba(24, 144, 255, 0.5)',
            },
          },
          // ✅ RÓTULOS DE DADOS
          label: {
            show: true,
            position: 'top',
            fontSize: 10,
            fontWeight: 600,
            color: '#1890ff',
            formatter: (params: any) => {
              return params.value ? `${params.value}°C` : '';
            },
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            padding: [3, 6],
            borderRadius: 4,
            borderColor: '#1890ff',
            borderWidth: 1,
            distance: 8,
          },
        },
        {
          name: 'Temp. Máx',
          type: 'line',
          data: temperatureTrends.data.map((item: any) => Number(item.max_temp).toFixed(2)),
          lineStyle: {
            type: 'dashed',
            width: 2,
            color: '#ff4d4f',
          },
          itemStyle: {
            color: '#ff4d4f',
            borderWidth: 2,
            borderColor: '#fff',
          },
          symbol: 'circle',
          symbolSize: 6,
          emphasis: {
            itemStyle: {
              color: '#ff4d4f',
              borderWidth: 3,
              shadowBlur: 8,
              shadowColor: 'rgba(255, 77, 79, 0.5)',
            },
          },
          // ✅ RÓTULOS - Apenas em pontos alternados para não poluir
          label: {
            show: true,
            position: 'top',
            fontSize: 9,
            fontWeight: 600,
            color: '#ff4d4f',
            formatter: (params: any) => {
              // Mostrar apenas a cada 2 pontos
              if (params.dataIndex % 2 === 0) {
                return params.value ? `${params.value}°` : '';
              }
              return '';
            },
            distance: 5,
          },
        },
        {
          name: 'Temp. Mín',
          type: 'line',
          data: temperatureTrends.data.map((item: any) => Number(item.min_temp).toFixed(2)),
          lineStyle: {
            type: 'dashed',
            width: 2,
            color: '#52c41a',
          },
          itemStyle: {
            color: '#52c41a',
            borderWidth: 2,
            borderColor: '#fff',
          },
          symbol: 'circle',
          symbolSize: 6,
          emphasis: {
            itemStyle: {
              color: '#52c41a',
              borderWidth: 3,
              shadowBlur: 8,
              shadowColor: 'rgba(82, 196, 26, 0.5)',
            },
          },
          // ✅ RÓTULOS - Apenas em pontos alternados
          label: {
            show: true,
            position: 'bottom',
            fontSize: 9,
            fontWeight: 600,
            color: '#52c41a',
            formatter: (params: any) => {
              // Mostrar apenas a cada 2 pontos
              if (params.dataIndex % 2 === 1) {
                return params.value ? `${params.value}°` : '';
              }
              return '';
            },
            distance: 5,
          },
        },
        {
          name: 'Eventos Críticos',
          type: 'bar',
          yAxisIndex: 1,
          data: temperatureTrends.data.map((item: any) => item.critical_count),
          itemStyle: {
            color: 'rgba(255, 77, 79, 0.3)',
            borderRadius: [4, 4, 0, 0],
          },
          emphasis: {
            itemStyle: {
              color: 'rgba(255, 77, 79, 0.6)',
              shadowBlur: 10,
              shadowColor: 'rgba(255, 77, 79, 0.5)',
            },
          },
          barMaxWidth: 40,
          // ✅ RÓTULOS DE DADOS - Apenas se > 0
          label: {
            show: true,
            position: 'top',
            fontSize: 10,
            fontWeight: 600,
            color: '#ff4d4f',
            formatter: (params: any) => {
              // Mostrar apenas se houver eventos
              if (params.value > 0) {
                return params.value >= 1000
                  ? (params.value / 1000) + 'k'
                  : params.value.toString();
              }
              return '';
            },
            distance: 5,
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
  }, [temperatureTrends, chartsInitialized, activeTab]);

  // Gráfico 2: Comfort Distribution
  useEffect(() => {
    if (!comfortDistChartRef.current || !chartsInitialized || activeTab !== 'trends') return;
    if (!comfortAnalysis?.distribution?.length) return;

    const chart = echarts.init(comfortDistChartRef.current);
    const option: echarts.EChartsOption = {
      title: { text: 'Distribuição de Conforto Térmico', left: 'center' },
      tooltip: { trigger: 'item', formatter: '{b}: {c} ({d}%)' },
      legend: { orient: 'vertical', left: 'left' },
      series: [{
        name: 'Conforto',
        type: 'pie',
        radius: ['40%', '70%'],
        data: comfortAnalysis.distribution.map((item: any) => ({
          value: item.count,
          name: item.exposure_type,
        })),
        label: { formatter: '{b}\n{c}' },
      }],
    };
    chart.setOption(option);

    const handleResize = () => chart.resize();
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      chart.dispose();
    };
  }, [comfortAnalysis, chartsInitialized, activeTab]);

  // Gráfico 3: Comfort Timeline
  useEffect(() => {
    if (!comfortTimelineChartRef.current || !chartsInitialized || activeTab !== 'trends') return;
    if (!comfortAnalysis?.timeline?.length) return;

    const chart = echarts.init(comfortTimelineChartRef.current);
    const option: echarts.EChartsOption = {
      title: { text: 'Taxa de Conforto ao Longo do Tempo', left: 'center' },
      tooltip: { trigger: 'axis' },
      legend: { data: ['Taxa de Conforto (%)', 'Total de Eventos'], bottom: 0 },
      grid: { left: '3%', right: '4%', bottom: '10%', containLabel: true },
      xAxis: {
        type: 'category',
        data: comfortAnalysis.timeline.map((item: any) => item.event_date),
        axisLabel: { rotate: 45 },
      },
      yAxis: [
        { type: 'value', name: 'Taxa (%)', max: 100 },
        { type: 'value', name: 'Eventos', position: 'right' },
      ],
      series: [
        {
          name: 'Taxa de Conforto (%)',
          type: 'line',
          data: comfortAnalysis.timeline.map((item: any) => item.comfort_rate),
          smooth: true,
          areaStyle: { opacity: 0.3 },
          itemStyle: { color: '#52c41a' },
        },
        {
          name: 'Total de Eventos',
          type: 'bar',
          yAxisIndex: 1,
          data: comfortAnalysis.timeline.map((item: any) => item.total_events),
          itemStyle: { color: 'rgba(24, 144, 255, 0.5)' },
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
  }, [comfortAnalysis, chartsInitialized, activeTab]);

  // Gráfico 4: Zone Stats
  useEffect(() => {
    if (!zoneStatsChartRef.current || !chartsInitialized || activeTab !== 'trends') return;
    if (!zonePatterns?.zone_stats?.length) return;

    const chart = echarts.init(zoneStatsChartRef.current);
    const topZones = zonePatterns.zone_stats.slice(0, 10);

    const option: echarts.EChartsOption = {
      title: { text: 'Top 10 Zonas por Eventos', left: 'center' },
      tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
      legend: { data: ['Total Eventos', 'Eventos Críticos', 'Taxa de Conforto'], bottom: 0 },
      grid: { left: '3%', right: '4%', bottom: '12%', containLabel: true },
      xAxis: {
        type: 'category',
        data: topZones.map((item: any) => item.zone_name),
        axisLabel: { rotate: 45, fontSize: 10 },
      },
      yAxis: [
        { type: 'value', name: 'Eventos' },
        { type: 'value', name: 'Taxa (%)', max: 100, position: 'right' },
      ],
      series: [
        {
          name: 'Total Eventos',
          type: 'bar',
          data: topZones.map((item: any) => item.total_events),
          itemStyle: { color: '#1890ff' },
        },
        {
          name: 'Eventos Críticos',
          type: 'bar',
          data: topZones.map((item: any) => item.critical_count),
          itemStyle: { color: '#ff4d4f' },
        },
        {
          name: 'Taxa de Conforto',
          type: 'line',
          yAxisIndex: 1,
          data: topZones.map((item: any) => item.comfort_rate),
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
  }, [zonePatterns, chartsInitialized, activeTab]);

  // Gráfico 5: Variation by Hour
  useEffect(() => {
    if (!variationChartRef.current || !chartsInitialized || activeTab !== 'trends') return;
    if (!variationAnalysis?.by_hour?.length) return;

    const chart = echarts.init(variationChartRef.current);
    const option: echarts.EChartsOption = {
      title: { text: 'Variação de Temperatura por Hora do Dia', left: 'center' },
      tooltip: { trigger: 'axis' },
      legend: { data: ['Média', 'Amplitude'], bottom: 0 },
      grid: { left: '3%', right: '4%', bottom: '10%', containLabel: true },
      xAxis: {
        type: 'category',
        data: variationAnalysis.by_hour.map((item: any) => `${item.hour}h`),
      },
      yAxis: { type: 'value', name: 'Temperatura (°C)' },
      series: [
        {
          name: 'Média',
          type: 'line',
          data: variationAnalysis.by_hour.map((item: any) => item.avg_temp),
          smooth: true,
          itemStyle: { color: '#1890ff' },
        },
        {
          name: 'Amplitude',
          type: 'bar',
          data: variationAnalysis.by_hour.map((item: any) => item.temp_range),
          itemStyle: { color: 'rgba(255, 122, 69, 0.5)' },
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
  }, [variationAnalysis, chartsInitialized, activeTab]);

  // ============================================
  // CHARTS - DISTANCE ANALYTICS
  // ============================================

  // Gráfico 1: Distance by Category (MELHORADO)
  useEffect(() => {
    if (!distanceCategoryChartRef.current || !chartsInitialized || activeTab !== 'distance') return;
    if (!distanceStats?.by_category?.length) return;

    const chart = echarts.init(distanceCategoryChartRef.current);

    // Ordenar por contagem (maiores primeiro)
    const sortedData = [...distanceStats.by_category]
      .sort((a: any, b: any) => b.count - a.count)
      .map((item: any) => ({
        value: item.count,
        name: item.distance_category,
      }));

    const option: echarts.EChartsOption = {
      title: {
        text: 'Distribuição por Categoria de Distância',
        left: 'center',
        top: 10,
        textStyle: {
          fontSize: 16,
          fontWeight: 'bold',
        },
      },
      tooltip: {
        trigger: 'item',
        formatter: '{b}<br/>Eventos: {c} ({d}%)',
        backgroundColor: 'rgba(50, 50, 50, 0.9)',
        borderColor: '#333',
        borderWidth: 1,
        textStyle: {
          color: '#fff',
          fontSize: 13,
        },
      },
      legend: {
        orient: 'vertical',
        left: 10,
        top: 60,
        itemGap: 8,
        itemWidth: 20,
        itemHeight: 14,
        textStyle: {
          fontSize: 11,
          overflow: 'truncate',
          width: 180,
        },
        formatter: (name: string) => {
          // Truncar nomes muito longos
          if (name.length > 25) {
            return name.substring(0, 22) + '...';
          }
          return name;
        },
      },
      series: [
        {
          name: 'Zonas',
          type: 'pie',
          radius: ['35%', '65%'], // Donut para melhor visualização
          center: ['62%', '52%'], // Mover para direita para dar espaço à legenda
          avoidLabelOverlap: true,
          padAngle: 2, // Espaço entre fatias
          itemStyle: {
            borderRadius: 6,
            borderColor: '#fff',
            borderWidth: 2,
          },
          label: {
            show: true,
            position: 'outside',
            fontSize: 11,
            formatter: (params: any) => {
              // Mostrar apenas % para fatias pequenas
              if (params.percent < 5) {
                return `{d}%`;
              }
              // Truncar nome longo
              const name = params.name.length > 15
                ? params.name.substring(0, 12) + '...'
                : params.name;
              return `${name}\n${params.value} ({d}%)`;
            },
            overflow: 'truncate',
          },
          labelLine: {
            show: true,
            length: 15,
            length2: 8,
            smooth: true,
          },
          emphasis: {
            label: {
              show: true,
              fontSize: 13,
              fontWeight: 'bold',
            },
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.5)',
            },
          },
          data: sortedData,
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
  }, [distanceStats, chartsInitialized, activeTab]);

  // Gráfico 2: Distance-Temperature Correlation (COM RÓTULOS)
  useEffect(() => {
    if (!distanceTempCorrChartRef.current || !chartsInitialized || activeTab !== 'distance') return;
    if (!distanceStats?.distance_temp_correlation?.length) return;

    const chart = echarts.init(distanceTempCorrChartRef.current);

    // Ordenar e pegar top 10
    const sortedData = [...distanceStats.distance_temp_correlation]
      .sort((a: any, b: any) => b.event_count - a.event_count)
      .slice(0, 10);

    // Truncar nomes longos
    const formatLabel = (name: string) => {
      if (name.length > 20) {
        return name.substring(0, 17) + '...';
      }
      return name;
    };

    const option: echarts.EChartsOption = {
      title: {
        text: 'Correlação Distância vs Temperatura',
        left: 'center',
        top: 10,
        textStyle: {
          fontSize: 16,
          fontWeight: 600,
          color: '#1f2937',
        },
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow',
          shadowStyle: {
            color: 'rgba(0, 0, 0, 0.05)',
          },
        },
        backgroundColor: 'rgba(50, 50, 50, 0.9)',
        borderColor: 'transparent',
        borderRadius: 8,
        padding: [12, 16],
        textStyle: {
          color: '#fff',
          fontSize: 13,
        },
        formatter: (params: any) => {
          const category = params[0].name;
          let result = `<div style="font-weight: 600; margin-bottom: 8px; padding-bottom: 8px; border-bottom: 1px solid rgba(255,255,255,0.2);">${category}</div>`;

          params.forEach((param: any) => {
            const icon = param.seriesName === 'Temp. Média' ? '🌡️' : '⚠️';
            const value = param.seriesName === 'Temp. Média'
              ? `${param.value}°C`
              : param.value;

            result += `
            <div style="display: flex; align-items: center; gap: 8px; margin-top: 6px;">
              <span style="font-size: 16px;">${icon}</span>
              <div style="flex: 1;">
                <div style="color: #9ca3af; font-size: 11px;">${param.seriesName}</div>
                <div style="font-weight: 700; color: ${param.color};">${value}</div>
              </div>
            </div>
          `;
          });

          return result;
        },
      },
      legend: {
        data: ['Temp. Média', 'Eventos Críticos'],
        bottom: 15,
        itemGap: 20,
        itemWidth: 25,
        itemHeight: 14,
        textStyle: {
          fontSize: 12,
          color: '#374151',
        },
      },
      grid: {
        left: '3%',
        right: '5%',
        bottom: '15%',
        top: '12%',
        containLabel: true,
      },
      xAxis: {
        type: 'category',
        data: sortedData.map((item: any) => formatLabel(item.distance_category)),
        axisLabel: {
          rotate: 45,
          fontSize: 11,
          color: '#6b7280',
          margin: 12,
          interval: 0,
          overflow: 'truncate',
          width: 100,
        },
        axisLine: {
          lineStyle: {
            color: '#e5e7eb',
          },
        },
        axisTick: {
          show: false,
        },
      },
      yAxis: [
        {
          type: 'value',
          name: 'Temp. (°C)',
          nameTextStyle: {
            fontSize: 12,
            color: '#374151',
            fontWeight: 600,
          },
          axisLabel: {
            fontSize: 11,
            color: '#6b7280',
            formatter: '{value}°C',
          },
          splitLine: {
            lineStyle: {
              color: '#f3f4f6',
              type: 'dashed',
            },
          },
        },
        {
          type: 'value',
          name: 'Eventos',
          position: 'right',
          nameTextStyle: {
            fontSize: 12,
            color: '#374151',
            fontWeight: 600,
          },
          axisLabel: {
            fontSize: 11,
            color: '#6b7280',
            formatter: (value: number) => {
              if (value >= 1000) {
                return (value / 1000) + 'k';
              }
              return value.toString();
            },
          },
          splitLine: {
            show: false,
          },
        },
      ],
      series: [
        {
          name: 'Temp. Média',
          type: 'bar',
          data: sortedData.map((item: any) => Number(item.avg_temp).toFixed(2)),
          itemStyle: {
            color: '#ff7a45',
            borderRadius: [4, 4, 0, 0],
          },
          emphasis: {
            itemStyle: {
              color: '#ff5722',
              shadowBlur: 10,
              shadowColor: 'rgba(255, 122, 69, 0.5)',
            },
          },
          barMaxWidth: 60,
          // ✅ RÓTULOS DE DADOS
          label: {
            show: true,
            position: 'top',
            fontSize: 11,
            fontWeight: 600,
            color: '#ff7a45',
            formatter: (params: any) => {
              return params.value ? `${params.value}°C` : '';
            },
            distance: 5,
          },
        },
        {
          name: 'Eventos Críticos',
          type: 'line',
          yAxisIndex: 1,
          data: sortedData.map((item: any) => item.critical_count),
          smooth: true,
          lineStyle: {
            width: 3,
            color: '#ff4d4f',
          },
          itemStyle: {
            color: '#ff4d4f',
            borderWidth: 3,
            borderColor: '#fff',
          },
          symbol: 'circle',
          symbolSize: 10,
          emphasis: {
            itemStyle: {
              color: '#ff4d4f',
              borderWidth: 4,
              shadowBlur: 10,
              shadowColor: 'rgba(255, 77, 79, 0.5)',
            },
            lineStyle: {
              width: 4,
            },
          },
          // ✅ RÓTULOS DE DADOS NA LINHA
          label: {
            show: true,
            position: 'top',
            fontSize: 11,
            fontWeight: 600,
            color: '#ff4d4f',
            formatter: (params: any) => {
              return params.value || params.value === 0 ? params.value.toString() : '';
            },
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            padding: [4, 8],
            borderRadius: 4,
            borderColor: '#ff4d4f',
            borderWidth: 1,
            distance: 10,
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
  }, [distanceStats, chartsInitialized, activeTab]);

  // Gráfico 3: Distance Timeline (COM RÓTULOS)
  useEffect(() => {
    if (!distanceTimelineChartRef.current || !chartsInitialized || activeTab !== 'distance') return;
    if (!distancePatterns?.distance_timeline?.length) return;

    const chart = echarts.init(distanceTimelineChartRef.current);

    const option: echarts.EChartsOption = {
      title: {
        text: 'Padrão de Distância ao Longo do Tempo',
        left: 'center',
        top: 10,
        textStyle: {
          fontSize: 16,
          fontWeight: 600,
          color: '#1f2937',
        },
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'cross',
          crossStyle: {
            color: '#999',
          },
        },
        backgroundColor: 'rgba(50, 50, 50, 0.9)',
        borderColor: 'transparent',
        borderRadius: 8,
        padding: [12, 16],
        textStyle: {
          color: '#fff',
          fontSize: 13,
        },
        formatter: (params: any) => {
          const date = params[0].name;
          let result = `<div style="font-weight: 600; margin-bottom: 8px; padding-bottom: 8px; border-bottom: 1px solid rgba(255,255,255,0.2);">${date}</div>`;

          params.forEach((param: any) => {
            const icon = param.seriesName.includes('Total') ? '📊' : '📏';
            let value = '';

            if (param.seriesName.includes('Total')) {
              value = `${param.value} km`;
            } else {
              value = `${param.value || 0} m`;
            }

            result += `
            <div style="display: flex; align-items: center; gap: 8px; margin-top: 6px;">
              <span style="font-size: 16px;">${icon}</span>
              <div style="flex: 1;">
                <div style="color: #9ca3af; font-size: 11px;">${param.seriesName}</div>
                <div style="font-weight: 700; color: ${param.color};">${value}</div>
              </div>
            </div>
          `;
          });

          return result;
        },
      },
      legend: {
        data: ['Distância Total (km)', 'Distância Média (m)'],
        bottom: 15,
        itemGap: 20,
        itemWidth: 25,
        itemHeight: 14,
        textStyle: {
          fontSize: 12,
          color: '#374151',
        },
      },
      grid: {
        left: '3%',
        right: '5%',
        bottom: '15%',
        top: '12%',
        containLabel: true,
      },
      xAxis: {
        type: 'category',
        data: distancePatterns.distance_timeline.map((item: any) => item.period),
        axisLabel: {
          rotate: 45,
          fontSize: 11,
          color: '#6b7280',
          margin: 12,
        },
        axisLine: {
          lineStyle: {
            color: '#e5e7eb',
          },
        },
        axisTick: {
          show: false,
        },
      },
      yAxis: [
        {
          type: 'value',
          name: 'Distância Total (km)',
          nameTextStyle: {
            fontSize: 12,
            color: '#374151',
            fontWeight: 600,
          },
          axisLabel: {
            fontSize: 11,
            color: '#6b7280',
            formatter: '{value} km',
          },
          splitLine: {
            lineStyle: {
              color: '#f3f4f6',
              type: 'dashed',
            },
          },
        },
        {
          type: 'value',
          name: 'Média (m)',
          position: 'right',
          nameTextStyle: {
            fontSize: 12,
            color: '#374151',
            fontWeight: 600,
          },
          axisLabel: {
            fontSize: 11,
            color: '#6b7280',
            formatter: '{value} m',
          },
          splitLine: {
            show: false,
          },
        },
      ],
      series: [
        {
          name: 'Distância Total (km)',
          type: 'bar',
          data: distancePatterns.distance_timeline.map((item: any) => (item.total_distance / 1000)),
          itemStyle: {
            color: '#1890ff',
            borderRadius: [4, 4, 0, 0],
          },
          emphasis: {
            itemStyle: {
              color: '#096dd9',
              shadowBlur: 10,
              shadowColor: 'rgba(24, 144, 255, 0.5)',
            },
          },
          barMaxWidth: 50,
          // ✅ RÓTULOS DE DADOS
          label: {
            show: true,
            position: 'top',
            fontSize: 11,
            fontWeight: 600,
            color: '#1890ff',
            formatter: (params: any) => {
              const value = parseFloat(params.value);
              if (value > 0) {
                return value >= 1 ? `${value}k` : `${(value * 1000)}m`;
              }
              return '';
            },
            distance: 5,
          },
        },
        {
          name: 'Distância Média (m)',
          type: 'line',
          yAxisIndex: 1,
          data: distancePatterns.distance_timeline.map((item: any) => item.avg_distance),
          smooth: true,
          lineStyle: {
            width: 3,
            color: '#52c41a',
          },
          itemStyle: {
            color: '#52c41a',
            borderWidth: 3,
            borderColor: '#fff',
          },
          symbol: 'circle',
          symbolSize: 8,
          emphasis: {
            itemStyle: {
              color: '#52c41a',
              borderWidth: 4,
              shadowBlur: 10,
              shadowColor: 'rgba(82, 196, 26, 0.5)',
            },
            lineStyle: {
              width: 4,
            },
          },
          areaStyle: {
            color: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                { offset: 0, color: 'rgba(82, 196, 26, 0.2)' },
                { offset: 1, color: 'rgba(82, 196, 26, 0.05)' },
              ],
            },
          },
          // ✅ RÓTULOS DE DADOS NA LINHA
          label: {
            show: true,
            position: 'top',
            fontSize: 11,
            fontWeight: 600,
            color: '#52c41a',
            formatter: (params: any) => {
              return params.value ? `${params.value}m` : '';
            },
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            padding: [4, 8],
            borderRadius: 4,
            borderColor: '#52c41a',
            borderWidth: 1,
            distance: 10,
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
  }, [distancePatterns, chartsInitialized, activeTab]);

  // Gráfico 4: Category Comparison (COM RÓTULOS DE DADOS)
  useEffect(() => {
    if (!categoryComparisonChartRef.current || !chartsInitialized || activeTab !== 'distance') return;
    if (!categoryComparison?.comparison?.length) return;

    const chart = echarts.init(categoryComparisonChartRef.current);

    // Ordenar por total de eventos (maiores primeiro) e pegar top 10
    const sortedData = [...categoryComparison.comparison]
      .sort((a: any, b: any) => b.total_events - a.total_events)
      .slice(0, 10);

    // Truncar nomes longos
    const formatLabel = (name: string) => {
      if (name.length > 20) {
        return name.substring(0, 17) + '...';
      }
      return name;
    };

    const option: echarts.EChartsOption = {
      title: {
        text: 'Top 10 Categorias - Comparação Detalhada',
        left: 'center',
        top: 10,
        textStyle: {
          fontSize: 16,
          fontWeight: 600,
          color: '#1f2937',
        },
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow',
          shadowStyle: {
            color: 'rgba(0, 0, 0, 0.05)',
          },
        },
        backgroundColor: 'rgba(50, 50, 50, 0.9)',
        borderColor: 'transparent',
        borderRadius: 8,
        padding: [12, 16],
        textStyle: {
          color: '#fff',
          fontSize: 13,
        },
        formatter: (params: any) => {
          const category = params[0].name;
          let result = `<div style="font-weight: 600; margin-bottom: 8px; padding-bottom: 8px; border-bottom: 1px solid rgba(255,255,255,0.2);">${category}</div>`;

          params.forEach((param: any) => {
            const icon = param.seriesName === 'Taxa de Conforto (%)' ? '📈' : '📊';
            const value = param.seriesName === 'Taxa de Conforto (%)'
              ? `${param.value}%`
              : param.value.toLocaleString();

            result += `
            <div style="display: flex; align-items: center; gap: 8px; margin-top: 6px;">
              <span style="font-size: 16px;">${icon}</span>
              <div style="flex: 1;">
                <div style="color: #9ca3af; font-size: 11px;">${param.seriesName}</div>
                <div style="font-weight: 700; color: ${param.color};">${value}</div>
              </div>
            </div>
          `;
          });

          return result;
        },
      },
      legend: {
        data: ['Eventos Totais', 'Críticos', 'Taxa de Conforto (%)'],
        bottom: 15,
        itemGap: 20,
        itemWidth: 25,
        itemHeight: 14,
        textStyle: {
          fontSize: 12,
          color: '#374151',
        },
      },
      grid: {
        left: '3%',
        right: '5%',
        bottom: '18%',
        top: '15%',
        containLabel: true,
      },
      xAxis: {
        type: 'category',
        data: sortedData.map((item: any) => formatLabel(item.distance_category)),
        axisLabel: {
          rotate: 45,
          fontSize: 11,
          color: '#6b7280',
          margin: 12,
          interval: 0,
          overflow: 'truncate',
          width: 100,
        },
        axisLine: {
          lineStyle: {
            color: '#e5e7eb',
          },
        },
        axisTick: {
          show: false,
        },
      },
      yAxis: [
        {
          type: 'value',
          name: 'Eventos',
          nameTextStyle: {
            fontSize: 12,
            color: '#374151',
            fontWeight: 600,
            padding: [0, 0, 0, 0],
          },
          axisLabel: {
            fontSize: 11,
            color: '#6b7280',
            formatter: (value: number) => {
              if (value >= 1000) {
                return (value / 1000) + 'k';
              }
              return value.toString();
            },
          },
          splitLine: {
            lineStyle: {
              color: '#f3f4f6',
              type: 'dashed',
            },
          },
        },
        {
          type: 'value',
          name: 'Taxa (%)',
          max: 100,
          position: 'right',
          nameTextStyle: {
            fontSize: 12,
            color: '#374151',
            fontWeight: 600,
          },
          axisLabel: {
            fontSize: 11,
            color: '#6b7280',
            formatter: '{value}%',
          },
          splitLine: {
            show: false,
          },
        },
      ],
      series: [
        {
          name: 'Eventos Totais',
          type: 'bar',
          data: sortedData.map((item: any) => item.total_events),
          itemStyle: {
            color: '#1890ff',
            borderRadius: [4, 4, 0, 0],
          },
          emphasis: {
            itemStyle: {
              color: '#096dd9',
              shadowBlur: 10,
              shadowColor: 'rgba(24, 144, 255, 0.5)',
            },
          },
          barMaxWidth: 50,
          // ✅ RÓTULOS DE DADOS
          label: {
            show: true,
            position: 'top',
            fontSize: 11,
            fontWeight: 600,
            color: '#1890ff',
            formatter: (params: any) => {
              // Mostrar apenas se o valor for significativo
              if (params.value > 0) {
                return params.value >= 1000
                  ? (params.value / 1000) + 'k'
                  : params.value.toLocaleString();
              }
              return '';
            },
            distance: 5,
          },
        },
        {
          name: 'Críticos',
          type: 'bar',
          data: sortedData.map((item: any) => item.critical_count),
          itemStyle: {
            color: '#ff4d4f',
            borderRadius: [4, 4, 0, 0],
          },
          emphasis: {
            itemStyle: {
              color: '#cf1322',
              shadowBlur: 10,
              shadowColor: 'rgba(255, 77, 79, 0.5)',
            },
          },
          barMaxWidth: 50,
          // ✅ RÓTULOS DE DADOS
          label: {
            show: true,
            position: 'top',
            fontSize: 11,
            fontWeight: 600,
            color: '#ff4d4f',
            formatter: (params: any) => {
              if (params.value > 0) {
                return params.value >= 1000
                  ? (params.value / 1000) + 'k'
                  : params.value.toLocaleString();
              }
              return '';
            },
            distance: 5,
          },
        },
        {
          name: 'Taxa de Conforto (%)',
          type: 'line',
          yAxisIndex: 1,
          data: sortedData.map((item: any) => item.comfort_rate),
          smooth: true,
          lineStyle: {
            width: 3,
            color: '#52c41a',
          },
          itemStyle: {
            color: '#52c41a',
            borderWidth: 3,
            borderColor: '#fff',
          },
          symbol: 'circle',
          symbolSize: 8,
          emphasis: {
            itemStyle: {
              color: '#52c41a',
              borderWidth: 4,
              shadowBlur: 10,
              shadowColor: 'rgba(82, 196, 26, 0.5)',
            },
            lineStyle: {
              width: 4,
            },
          },
          areaStyle: {
            color: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                { offset: 0, color: 'rgba(82, 196, 26, 0.2)' },
                { offset: 1, color: 'rgba(82, 196, 26, 0.05)' },
              ],
            },
          },
          // ✅ RÓTULOS DE DADOS NA LINHA
          label: {
            show: true,
            position: 'top',
            fontSize: 11,
            fontWeight: 600,
            color: '#52c41a',
            formatter: (params: any) => {
              return params.value ? `${params.value}%` : '';
            },
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            padding: [4, 8],
            borderRadius: 4,
            borderColor: '#52c41a',
            borderWidth: 1,
            distance: 10,
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
  }, [categoryComparison, chartsInitialized, activeTab]);


  useEffect(() => {
    if (!tempGaugeChartRef.current || !chartsInitialized || activeTab !== 'trends') return;
    if (!variationAnalysis?.overall) return;

    const chart = echarts.init(tempGaugeChartRef.current);

    const stddev = Number(variationAnalysis.overall.temp_stddev);
    const avgTemp = Number(variationAnalysis.overall.avg_temp || 25);

    const normalizedTemp = Math.min(avgTemp / 50, 1);
    const normalizedStddev = Math.min(stddev / 10, 1);

    const option: echarts.EChartsOption = {
      series: [
        // Gauge 1: Temperatura Média
        {
          type: 'gauge',
          startAngle: 180,
          endAngle: 0,
          center: ['25%', '75%'],
          radius: '80%',
          min: 0,
          max: 1,
          splitNumber: 4,

          axisLine: {
            lineStyle: {
              width: 6,
              color: [
                [0.25, '#52c41a'],
                [0.5, '#1890ff'],
                [0.75, '#faad14'],
                [1, '#ff4d4f']
              ]
            }
          },

          pointer: {
            icon: 'path://M12.8,0.7l12,40.1H0.7L12.8,0.7z',
            length: '12%',
            width: 16,
            offsetCenter: [0, '-60%'],
            itemStyle: {
              color: 'auto',
              shadowColor: 'rgba(0, 0, 0, 0.3)',
              shadowBlur: 6
            }
          },

          axisTick: {
            length: 10,
            lineStyle: {
              color: 'auto',
              width: 2
            }
          },

          splitLine: {
            length: 16,
            lineStyle: {
              color: 'auto',
              width: 4
            }
          },

          axisLabel: {
            color: '#464646',
            fontSize: 11,
            distance: -40,
            rotate: 'tangential',
            formatter: function (value: number) {
              const temp = Math.round(value * 50);
              if (value === 0 || value === 0.5 || value === 1) {
                return temp + '°';
              }
              return '';
            }
          },

          title: {
            offsetCenter: [0, '-15%'],
            fontSize: 13,
            color: '#666',
            fontWeight: 600
          },

          detail: {
            fontSize: 28,
            offsetCenter: [0, '-40%'],
            valueAnimation: true,
            formatter: function (value: number) {
              const temp = Math.round(value * 50);
              return `{value|${temp}}{unit|°C}`;
            },
            rich: {
              value: {
                fontSize: 28,
                fontWeight: 'bold',
                color: 'inherit'
              },
              unit: {
                fontSize: 14,
                color: '#999',
                padding: [0, 0, 0, 3]
              }
            },
            color: 'inherit'
          },

          data: [
            {
              value: normalizedTemp,
              name: 'Temperatura Média'
            }
          ]
        },

        // Gauge 2: Desvio Padrão
        {
          type: 'gauge',
          startAngle: 180,
          endAngle: 0,
          center: ['75%', '75%'],
          radius: '80%',
          min: 0,
          max: 1,
          splitNumber: 4,

          axisLine: {
            lineStyle: {
              width: 6,
              color: [
                [0.2, '#52c41a'],   // Baixo
                [0.4, '#1890ff'],   // Normal
                [0.6, '#faad14'],   // Moderado
                [1, '#ff4d4f']      // Alto
              ]
            }
          },

          pointer: {
            icon: 'path://M12.8,0.7l12,40.1H0.7L12.8,0.7z',
            length: '12%',
            width: 16,
            offsetCenter: [0, '-60%'],
            itemStyle: {
              color: 'auto',
              shadowColor: 'rgba(0, 0, 0, 0.3)',
              shadowBlur: 6
            }
          },

          axisTick: {
            length: 10,
            lineStyle: {
              color: 'auto',
              width: 2
            }
          },

          splitLine: {
            length: 16,
            lineStyle: {
              color: 'auto',
              width: 4
            }
          },

          axisLabel: {
            color: '#464646',
            fontSize: 11,
            distance: -40,
            rotate: 'tangential',
            formatter: function (value: number) {
              const std = (value * 10).toFixed(1);
              if (value === 0 || value === 0.5 || value === 1) {
                return std + '°';
              }
              return '';
            }
          },

          title: {
            offsetCenter: [0, '-15%'],
            fontSize: 13,
            color: '#666',
            fontWeight: 600
          },

          detail: {
            fontSize: 28,
            offsetCenter: [0, '-40%'],
            valueAnimation: true,
            formatter: function (value: number) {
              const std = (value * 10).toFixed(1);
              return `{value|${std}}{unit|°C}`;
            },
            rich: {
              value: {
                fontSize: 28,
                fontWeight: 'bold',
                color: 'inherit'
              },
              unit: {
                fontSize: 14,
                color: '#999',
                padding: [0, 0, 0, 3]
              }
            },
            color: 'inherit'
          },

          data: [
            {
              value: normalizedStddev,
              name: 'Desvio Padrão'
            }
          ]
        }
      ]
    };

    chart.setOption(option);

    const handleResize = () => chart.resize();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.dispose();
    };
  }, [variationAnalysis, chartsInitialized, activeTab]);


  // ============================================
  // RENDER
  // ============================================

  if (loading && !chartsInitialized) {
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

      {/* Tabs */}
      <div className="bg-white rounded-2xl shadow-xl mb-6 p-2 border border-gray-200">
        <div className="flex gap-2">
          {/* Tab 1 */}
          <button
            onClick={() => setActiveTab('overview')}
            className={`cursor-pointer relative flex-1 flex items-center justify-center gap-3 px-6 py-4 rounded-xl font-bold transition-all duration-300 ${activeTab === 'overview'
              ? 'bg-gradient-to-br from-blue-600 to-blue-700 text-white shadow-2xl shadow-blue-500/50'
              : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
              }`}
          >
            <svg
              className={`w-6 h-6 ${activeTab === 'overview' ? 'text-white' : 'text-blue-600'}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <span>Visão Geral</span>
            {exposureStats?.critical_events > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                {exposureStats.critical_events}
              </span>
            )}
          </button>

          {/* Tab 2 */}
          <button
            onClick={() => setActiveTab('trends')}
            className={`cursor-pointer flex-1 flex items-center justify-center gap-3 px-6 py-4 rounded-xl font-bold transition-all duration-300 ${activeTab === 'trends'
              ? 'bg-gradient-to-br from-purple-600 to-purple-700 text-white shadow-2xl shadow-purple-500/50'
              : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
              }`}
          >
            <svg
              className={`w-6 h-6 ${activeTab === 'trends' ? 'text-white' : 'text-purple-600'}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
            <span>Tendências</span>
          </button>

          {/* Tab 3 */}
          <button
            onClick={() => setActiveTab('distance')}
            className={`cursor-pointer flex-1 flex items-center justify-center gap-3 px-6 py-4 rounded-xl font-bold transition-all duration-300 ${activeTab === 'distance'
              ? 'bg-gradient-to-br from-green-600 to-green-700 text-white shadow-2xl shadow-green-500/50'
              : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
              }`}
          >
            <svg
              className={`w-6 h-6 ${activeTab === 'distance' ? 'text-white' : 'text-green-600'}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span>Distância</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="flex gap-3 items-center flex-wrap">
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

          {(activeTab === 'trends' || activeTab === 'distance') && (
            <>
              <label className="font-semibold ml-4">Agrupar por:</label>
              <select
                value={filters.groupBy || 'day'}
                onChange={(e) => setFilters({ ...filters, groupBy: e.target.value as any })}
                className="px-3 py-2 border rounded"
              >
                <option value="hour">Hora</option>
                <option value="day">Dia</option>
                {activeTab === 'trends' && <option value="week">Semana</option>}
              </select>
            </>
          )}
        </div>
      </div>

      {/* ======================= */}
      {/* TAB: OVERVIEW */}
      {/* ======================= */}
      {activeTab === 'overview' && (
        <>
          {/* KPIs */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {/* Card 1: Total de Eventos */}
            <div className="bg-white p-4 rounded-xl shadow-sm border-[0.5px] border-gray-200 hover:shadow-md transition-shadow" style={{ boxShadow: 'inset 0 4px 16px rgba(59, 130, 246, 0.35)' }}>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 via-blue-500 to-blue-700 flex items-center justify-center shadow-lg shadow-blue-500/40">
                  <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <div>
                  <p className="text-gray-500 text-xs font-medium">Total de Eventos</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {exposureStats?.total_events?.toLocaleString() || 0}
                  </p>
                </div>
              </div>
            </div>

            {/* Card 2: Eventos Críticos */}
            <div className="bg-white p-4 rounded-xl shadow-sm border-[0.5px] border-gray-200 hover:shadow-md transition-shadow" style={{ boxShadow: 'inset 0 4px 16px rgba(239, 68, 68, 0.35)' }}>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-red-400 via-red-500 to-red-700 flex items-center justify-center shadow-lg shadow-red-500/40">
                  <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div>
                  <p className="text-gray-500 text-xs font-medium">Eventos Críticos</p>
                  <p className="text-2xl font-bold text-red-600">
                    {exposureStats?.critical_events?.toLocaleString() || 0}
                  </p>
                </div>
              </div>
            </div>

            {/* Card 3: Pessoas Afetadas */}
            <div className="bg-white p-4 rounded-xl shadow-sm border-[0.5px] border-gray-200 hover:shadow-md transition-shadow" style={{ boxShadow: 'inset 0 4px 16px rgba(168, 85, 247, 0.35)' }}>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-400 via-purple-500 to-purple-700 flex items-center justify-center shadow-lg shadow-purple-500/40">
                  <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-gray-500 text-xs font-medium">Pessoas Afetadas</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {exposureStats?.unique_persons?.toLocaleString() || 0}
                  </p>
                </div>
              </div>
            </div>

            {/* Card 4: Temperatura Média */}
            <div className="bg-white p-4 rounded-xl shadow-sm border-[0.5px] border-gray-200 hover:shadow-md transition-shadow" style={{ boxShadow: 'inset 0 4px 16px rgba(249, 115, 22, 0.35)' }}>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-400 via-orange-500 to-orange-700 flex items-center justify-center shadow-lg shadow-orange-500/40">
                  <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <div>
                  <p className="text-gray-500 text-xs font-medium">Temp. Média</p>
                  <p className="text-2xl font-bold text-orange-600">
                    {Number(exposureStats?.avg_temp || 0).toFixed(2)}°C
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Current Stats */}
          {currentStats && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              {/* Total de Pessoas */}
              <div className="bg-white p-4 rounded-xl shadow-sm border-[0.5px] border-gray-200 hover:shadow-md transition-shadow" style={{ boxShadow: 'inset 0 4px 16px rgba(99, 102, 241, 0.35)' }}>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-400 via-indigo-500 to-indigo-700 flex items-center justify-center shadow-lg shadow-indigo-500/40">
                    <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs font-medium">Total de Pessoas</p>
                    <p className="text-2xl font-bold text-indigo-600">{currentStats.total_persons || 0}</p>
                  </div>
                </div>
              </div>

              {/* Críticos */}
              <div className="bg-white p-4 rounded-xl shadow-sm border-[0.5px] border-gray-200 hover:shadow-md transition-shadow" style={{ boxShadow: 'inset 0 4px 16px rgba(239, 68, 68, 0.35)' }}>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-red-400 via-red-500 to-red-700 flex items-center justify-center shadow-lg shadow-red-500/40">
                    <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs font-medium">Críticos</p>
                    <p className="text-2xl font-bold text-red-600">{currentStats.critical_count || 0}</p>
                  </div>
                </div>
              </div>

              {/* Estresse Térmico */}
              <div className="bg-white p-4 rounded-xl shadow-sm border-[0.5px] border-gray-200 hover:shadow-md transition-shadow" style={{ boxShadow: 'inset 0 4px 16px rgba(249, 115, 22, 0.35)' }}>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-400 via-orange-500 to-orange-700 flex items-center justify-center shadow-lg shadow-orange-500/40">
                    <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs font-medium">Estresse Térmico</p>
                    <p className="text-2xl font-bold text-orange-600">{currentStats.heat_stress_count || 0}</p>
                  </div>
                </div>
              </div>

              {/* Confortáveis */}
              <div className="bg-white p-4 rounded-xl shadow-sm border-[0.5px] border-gray-200 hover:shadow-md transition-shadow" style={{ boxShadow: 'inset 0 4px 16px rgba(34, 197, 94, 0.35)' }}>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-400 via-green-500 to-green-700 flex items-center justify-center shadow-lg shadow-green-500/40">
                    <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs font-medium">Confortáveis</p>
                    <p className="text-2xl font-bold text-green-600">{currentStats.comfortable_count || 0}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Charts */}
          {chartsInitialized && (
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

              {/* <div className="bg-white p-6 rounded-lg shadow mb-6">
                <div ref={timelineChartRef} style={{ height: '450px' }}></div>
              </div> */}

              {/* Controles do Timeline */}
              <div className="bg-white p-6 rounded-lg shadow mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-gray-800">Timeline de Eventos</h3>

                  <div className="flex gap-4">
                    {/* Agrupamento */}
                    <div className="flex items-center gap-2">
                      <label className="text-sm font-semibold text-gray-700">Agrupar por:</label>
                      <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
                        <button
                          onClick={() => setTimelineGroupBy('hour')}
                          className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${timelineGroupBy === 'hour'
                            ? 'bg-blue-600 text-white shadow-md'
                            : 'text-gray-600 hover:text-gray-900'
                            }`}
                        >
                          Hora
                        </button>
                        <button
                          onClick={() => setTimelineGroupBy('day')}
                          className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${timelineGroupBy === 'day'
                            ? 'bg-blue-600 text-white shadow-md'
                            : 'text-gray-600 hover:text-gray-900'
                            }`}
                        >
                          Dia
                        </button>
                        <button
                          onClick={() => setTimelineGroupBy('week')}
                          className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${timelineGroupBy === 'week'
                            ? 'bg-blue-600 text-white shadow-md'
                            : 'text-gray-600 hover:text-gray-900'
                            }`}
                        >
                          Semana
                        </button>
                      </div>
                    </div>

                    {/* Tipo de Gráfico */}
                    <div className="flex items-center gap-2">
                      <label className="text-sm font-semibold text-gray-700">Visualização:</label>
                      <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
                        <button
                          onClick={() => setTimelineChartType('bar')}
                          className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${timelineChartType === 'bar'
                            ? 'bg-purple-600 text-white shadow-md'
                            : 'text-gray-600 hover:text-gray-900'
                            }`}
                        >
                          📊 Barras
                        </button>
                        <button
                          onClick={() => setTimelineChartType('line')}
                          className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${timelineChartType === 'line'
                            ? 'bg-purple-600 text-white shadow-md'
                            : 'text-gray-600 hover:text-gray-900'
                            }`}
                        >
                          📈 Linha
                        </button>
                        <button
                          onClick={() => setTimelineChartType('line-area')}
                          className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${timelineChartType === 'line-area'
                            ? 'bg-purple-600 text-white shadow-md'
                            : 'text-gray-600 hover:text-gray-900'
                            }`}
                        >
                          📉 Área
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div ref={timelineChartRef} style={{ height: '450px' }}></div>
              </div>
            </>
          )}

          {/* Heatmap de Atividade - VERSÃO PREMIUM */}
          <div className="mb-8">
            {/* Header Section */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-t-2xl p-6 shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-3">
                    <span className="text-3xl">🔥</span>
                    Mapa de Calor de Atividades
                  </h2>
                  <p className="text-blue-100 text-sm">
                    Visualize padrões de temperatura e eventos ao longo da semana
                  </p>
                </div>
              </div>
            </div>

            {/* Controls Section */}
            <div className="bg-white rounded-b-2xl shadow-lg border-t-0">
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-center gap-6">
                  {/* Metric Selector */}
                  <div className="flex items-center gap-3">
                    <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                      <span className="text-xl">📊</span>
                      Métrica:
                    </label>
                    <div className="flex gap-2 bg-gray-100 p-1.5 rounded-xl">
                      <button
                        onClick={() => setHeatmapMetric('temperature')}
                        className={`px-5 py-2.5 rounded-lg font-semibold text-sm transition-all duration-200 ${heatmapMetric === 'temperature'
                          ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-500/30 scale-105'
                          : 'bg-transparent text-gray-600 hover:text-gray-900'
                          }`}
                      >
                        🌡️ Temperatura
                      </button>
                      <button
                        onClick={() => setHeatmapMetric('events')}
                        className={`px-5 py-2.5 rounded-lg font-semibold text-sm transition-all duration-200 ${heatmapMetric === 'events'
                          ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-lg shadow-purple-500/30 scale-105'
                          : 'bg-transparent text-gray-600 hover:text-gray-900'
                          }`}
                      >
                        📈 Eventos
                      </button>
                    </div>
                  </div>

                  {/* Info Badge */}
                  <div className="ml-auto flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-lg border border-blue-200">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                    <span className="text-xs font-medium">
                      Cores mais intensas = Maior atividade
                    </span>
                  </div>
                </div>

                {/* Legend Helper */}
                <div className="mt-4 flex items-center gap-8 text-xs text-gray-600">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-blue-200"></div>
                    <span>Baixa atividade</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-orange-400"></div>
                    <span>Média atividade</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-600"></div>
                    <span>Alta atividade</span>
                  </div>
                </div>
              </div>

              {/* Heatmap Component */}
              <div className="p-6">
                <TemperatureHeatmapCalendar
                  data={activityHeatmap}
                  title={heatmapMetric === 'temperature'
                    ? 'Temperatura Média por Hora e Dia da Semana'
                    : 'Distribuição de Eventos por Hora e Dia da Semana'
                  }
                  metric={heatmapMetric}
                />
              </div>
            </div>
          </div>



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
                          <span className="text-sm font-medium">{person.minutes_ago} min atrás</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      {/* ======================= */}
      {/* TAB: TRENDS */}
      {/* ======================= */}
      {activeTab === 'trends' && chartsInitialized && (
        <>
          {/* KPIs for Trends - LAYOUT REORGANIZADO */}
          {temperatureTrends?.data && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
              {/* Card 1 */}
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl shadow-lg border border-blue-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-blue-600 text-2xl">📊</span>
                  <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full">Análise</span>
                </div>
                <p className="text-blue-700 text-sm font-semibold mb-1">Períodos Analisados</p>
                <p className="text-4xl font-bold text-blue-900">{temperatureTrends.data.length}</p>
              </div>

              {/* Card 2 */}
              <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl shadow-lg border border-green-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-green-600 text-2xl">✅</span>
                  <span className="bg-green-600 text-white text-xs px-2 py-1 rounded-full">Conforto</span>
                </div>
                <p className="text-green-700 text-sm font-semibold mb-1">Taxa de Conforto</p>
                <p className="text-4xl font-bold text-green-900">
                  {comfortAnalysis?.timeline?.[comfortAnalysis.timeline.length - 1]?.comfort_rate || 0}%
                </p>
              </div>

              {/* Card 3 */}
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl shadow-lg border border-purple-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-purple-600 text-2xl">📍</span>
                  <span className="bg-purple-600 text-white text-xs px-2 py-1 rounded-full">Zonas</span>
                </div>
                <p className="text-purple-700 text-sm font-semibold mb-1">Zonas Monitoradas</p>
                <p className="text-4xl font-bold text-purple-900">{zonePatterns?.zone_stats?.length || 0}</p>
              </div>

              {/* Card 4 - Destaque */}
              <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-xl shadow-lg border border-orange-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-orange-600 text-2xl">🌡️</span>
                  <span className="bg-orange-600 text-white text-xs px-2 py-1 rounded-full">Live</span>
                </div>
                <p className="text-orange-700 text-sm font-semibold mb-1">Status Térmico</p>
                <p className="text-lg font-bold text-orange-900">Ver Gauges ↓</p>
              </div>
            </div>
          )}

          {/* Gauges em Destaque */}
          <div className="bg-gradient-to-br from-slate-50 to-slate-100 p-8 rounded-2xl shadow-xl mb-6 border border-slate-200">
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-gray-800 mb-2">
                🌡️ Indicadores de Temperatura em Tempo Real
              </h3>
              <p className="text-gray-600">
                Monitoramento contínuo das condições térmicas do ambiente
              </p>
            </div>
            <div ref={tempGaugeChartRef} style={{ height: '320px' }}></div>

            {/* Legenda abaixo dos gauges */}
            <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-slate-300">
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <div className="w-3 h-3 rounded-full bg-gradient-to-r from-green-400 via-blue-400 via-yellow-400 to-red-400"></div>
                  <span className="text-sm font-semibold text-gray-700">Temperatura Média</span>
                </div>
                <p className="text-xs text-gray-600">Faixa: 0°C - 50°C</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <div className="w-3 h-3 rounded-full bg-gradient-to-r from-green-400 via-blue-400 via-yellow-400 to-red-400"></div>
                  <span className="text-sm font-semibold text-gray-700">Desvio Padrão</span>
                </div>
                <p className="text-xs text-gray-600">Faixa: 0°C - 10°C</p>
              </div>
            </div>
          </div>

          {/* Charts */}
          <div className="bg-white p-6 rounded-lg shadow mb-6">
            <div ref={trendsChartRef} style={{ height: '450px' }}></div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <div className="bg-white p-6 rounded-lg shadow">
              <div ref={comfortDistChartRef} style={{ height: '400px' }}></div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <div ref={comfortTimelineChartRef} style={{ height: '400px' }}></div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow mb-6">
            <div ref={zoneStatsChartRef} style={{ height: '450px' }}></div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow mb-6">
            <div ref={variationChartRef} style={{ height: '450px' }}></div>
          </div>
        </>
      )}

      {/* ======================= */}
      {/* TAB: DISTANCE */}
      {/* ======================= */}
      {activeTab === 'distance' && chartsInitialized && (
        <>
          {/* KPIs for Distance */}
          {distanceStats?.overall && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
              <div className="bg-blue-50 p-6 rounded-lg shadow">
                <p className="text-blue-700 text-sm font-semibold">Distância Total</p>
                <p className="text-4xl font-bold text-blue-900">
                  {(distanceStats.overall.total_distance / 1000)} km
                </p>
              </div>
              <div className="bg-green-50 p-6 rounded-lg shadow">
                <p className="text-green-700 text-sm font-semibold">Distância Média</p>
                <p className="text-4xl font-bold text-green-900">
                  {distanceStats.overall.avg_distance} m
                </p>
              </div>
              <div className="bg-purple-50 p-6 rounded-lg shadow">
                <p className="text-purple-700 text-sm font-semibold">Pessoas Ativas</p>
                <p className="text-4xl font-bold text-purple-900">{distanceStats.overall.unique_persons}</p>
              </div>
              <div className="bg-orange-50 p-6 rounded-lg shadow">
                <p className="text-orange-700 text-sm font-semibold">Total de Eventos</p>
                <p className="text-4xl font-bold text-orange-900">
                  {distanceStats.overall.total_events?.toLocaleString()}
                </p>
              </div>
            </div>
          )}

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <div className="bg-white p-6 rounded-lg shadow">
              <div ref={distanceCategoryChartRef} style={{ height: '400px' }}></div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <div ref={distanceTempCorrChartRef} style={{ height: '400px' }}></div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow mb-6">
            <div ref={distanceTimelineChartRef} style={{ height: '450px' }}></div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow mb-6">
            <div ref={categoryComparisonChartRef} style={{ height: '450px' }}></div>
          </div>

          {/* Top Persons Table - DESIGN MINIMALISTA COM SCROLL */}
          {distanceStats?.top_persons?.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border-[0.5px] border-gray-200 overflow-hidden">
              {/* Header Compacto */}
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                      <span>🏃‍♂️</span>
                      Top 20 Pessoas - Movimento
                    </h3>
                  </div>
                  <div className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-lg">
                    <span className="text-white font-bold text-sm">
                      {distanceStats.top_persons.length}
                    </span>
                  </div>
                </div>
              </div>

              {/* Table com Scroll */}
              <div className="overflow-x-auto overflow-y-auto max-h-[500px]">
                <table className="min-w-full divide-y divide-gray-100">
                  <thead className="bg-gray-50 sticky top-0 z-10">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-bold text-gray-600 uppercase">
                        #
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-bold text-gray-600 uppercase">
                        Pessoa
                      </th>
                      <th className="px-4 py-2 text-center text-xs font-bold text-gray-600 uppercase">
                        Movimentos
                      </th>
                      <th className="px-4 py-2 text-center text-xs font-bold text-gray-600 uppercase">
                        Eventos
                      </th>
                      <th className="px-4 py-2 text-center text-xs font-bold text-gray-600 uppercase">
                        Temp. Média
                      </th>
                      <th className="px-4 py-2 text-center text-xs font-bold text-gray-600 uppercase">
                        Temp. Máx
                      </th>
                      <th className="px-4 py-2 text-center text-xs font-bold text-gray-600 uppercase">
                        Zonas
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-50">
                    {distanceStats.top_persons.map((person: any, index: number) => (
                      <tr
                        key={person.person_code}
                        className="hover:bg-blue-50 transition-colors"
                      >
                        {/* Rank */}
                        <td className="px-4 py-2.5 whitespace-nowrap">
                          {index < 3 ? (
                            <span className={`
                    w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs
                    ${index === 0 ? 'bg-gradient-to-br from-yellow-400 to-yellow-600 text-white' : ''}
                    ${index === 1 ? 'bg-gradient-to-br from-gray-300 to-gray-400 text-gray-700' : ''}
                    ${index === 2 ? 'bg-gradient-to-br from-orange-400 to-orange-600 text-white' : ''}
                  `}>
                              {index + 1}
                            </span>
                          ) : (
                            <span className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 font-semibold text-xs">
                              {index + 1}
                            </span>
                          )}
                        </td>

                        {/* Pessoa */}
                        <td className="px-4 py-2.5">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold text-xs">
                              {person.person_name.charAt(0).toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <div className="text-xs font-bold text-gray-900 truncate max-w-[200px]">
                                {person.person_name}
                              </div>
                              <div className="text-[10px] text-gray-500 font-mono truncate">
                                {person.person_code}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Movimentos */}
                        <td className="px-4 py-2.5 text-center">
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-blue-50 border border-blue-200 text-xs font-bold text-blue-900">
                            🚶 {person.movement_count}
                          </span>
                        </td>

                        {/* Eventos */}
                        <td className="px-4 py-2.5 text-center">
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-800">
                            {person.event_count}
                          </span>
                        </td>

                        {/* Temp Média */}
                        <td className="px-4 py-2.5 text-center">
                          <span className={`
                  inline-flex px-2 py-1 rounded-md text-xs font-bold
                  ${Number(person.avg_temp) >= 35 ? 'bg-red-100 text-red-800' :
                              Number(person.avg_temp) >= 30 ? 'bg-orange-100 text-orange-800' :
                                'bg-green-100 text-green-800'}
                `}>
                            {Number(person.avg_temp).toFixed(1)}°
                          </span>
                        </td>

                        {/* Temp Máx */}
                        <td className="px-4 py-2.5 text-center">
                          <span className={`
                  inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-bold
                  ${Number(person.max_temp) >= 45 ? 'bg-red-100 text-red-800' :
                              Number(person.max_temp) >= 40 ? 'bg-orange-100 text-orange-800' :
                                'bg-yellow-100 text-yellow-800'}
                `}>
                            {Number(person.max_temp) >= 40 && <span>⚠️</span>}
                            {Number(person.max_temp).toFixed(1)}°
                          </span>
                        </td>

                        {/* Zonas */}
                        <td className="px-4 py-2.5 text-center">
                          <span className="inline-flex items-center gap-1 text-xs text-gray-700 font-semibold">
                            📍 {person.zones_visited}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Footer Compacto */}
              <div className="bg-gray-50 px-4 py-2 border-t border-gray-100">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-red-500"></span>
                      <span className="text-gray-600">Crítica ≥45°</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-orange-500"></span>
                      <span className="text-gray-600">Alta 40-45°</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-green-500"></span>
                      <span className="text-gray-600">Normal &lt;40°</span>
                    </div>
                  </div>
                  <div className="text-gray-400 text-[10px]">
                    Atualizado em tempo real
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}