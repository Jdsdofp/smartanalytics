// src/components/Infraestruct/TemperatureHeatmapCalendar.tsx

import { useEffect, useRef } from 'react';
import * as echarts from 'echarts';

interface HeatmapData {
  day: number;
  hour: number;
  value: number;
  events?: number;
  avg_temp?: number;
}

interface TemperatureHeatmapCalendarProps {
  data: HeatmapData[];
  title?: string;
  metric?: 'temperature' | 'events' | 'duration';
}

export default function TemperatureHeatmapCalendar({ 
  data, 
  title = 'Padrão de Atividade Semanal',
  metric = 'temperature'
}: TemperatureHeatmapCalendarProps) {
  const chartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!chartRef.current || !data?.length) return;

    const chart = echarts.init(chartRef.current);

    const days = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
    const hours = Array.from({ length: 24 }, (_, i) => {
      if (i === 0) return '00h';
      if (i < 10) return `0${i}h`;
      return `${i}h`;
    });

    const heatmapData = data.map(item => [
      item.hour,
      6 - item.day,
      item.value || 0
    ]);

    const values = heatmapData.map(item => item[2]);
    const minValue = Math.min(...values);
    const maxValue = Math.max(...values);

    // Paletas de cores profissionais
    const colorPalettes = {
      temperature: [
        '#1a237e', '#283593', '#303f9f', '#3949ab', '#3f51b5',
        '#5c6bc0', '#7986cb', '#9fa8da', '#c5cae9', '#e8eaf6',
        '#fff9c4', '#fff59d', '#fff176', '#ffee58', '#ffeb3b',
        '#fdd835', '#fbc02d', '#f9a825', '#f57f17', '#ff6f00',
        '#ff5722', '#f4511e', '#e64a19', '#d84315', '#bf360c'
      ],
      events: [
        '#e3f2fd', '#bbdefb', '#90caf9', '#64b5f6', '#42a5f5',
        '#2196f3', '#1e88e5', '#1976d2', '#1565c0', '#0d47a1'
      ]
    };

    const option: echarts.EChartsOption = {
      backgroundColor: '#fafafa',
      title: {
        text: title,
        left: 'center',
        top: 15,
        textStyle: {
          fontSize: 18,
          fontWeight: 600, // ✅ Número ao invés de string
          color: '#1f2937',
        },
        subtextStyle: {
          fontSize: 13,
          color: '#6b7280',
        }
      },
      tooltip: {
        position: 'top',
        backgroundColor: 'rgba(0, 0, 0, 0.85)',
        borderColor: 'transparent',
        borderRadius: 8,
        padding: [12, 16],
        textStyle: {
          color: '#fff',
          fontSize: 13,
        },
        formatter: (params: any) => {
          const hour = params.data[0];
          const dayIndex = 6 - params.data[1];
          const value = params.data[2];
          
          let unit = '°C';
          let label = 'Temperatura Média';
          let icon = '🌡️';
          
          if (metric === 'events') {
            unit = ' eventos';
            label = 'Total de Eventos';
            icon = '📊';
          } else if (metric === 'duration') {
            unit = ' min';
            label = 'Duração Média';
            icon = '⏱️';
          }
          
          return `
            <div style="min-width: 200px;">
              <div style="font-weight: 600; margin-bottom: 8px; font-size: 14px; border-bottom: 1px solid rgba(255,255,255,0.2); padding-bottom: 6px;">
                ${days[dayIndex]} às ${hours[hour]}
              </div>
              <div style="display: flex; align-items: center; gap: 8px; margin-top: 6px;">
                <span style="font-size: 18px;">${icon}</span>
                <div>
                  <div style="color: #9ca3af; font-size: 11px;">${label}</div>
                  <div style="font-weight: 700; font-size: 16px; color: #fff;">
                    ${value.toFixed(1)}${unit}
                  </div>
                </div>
              </div>
            </div>
          `;
        },
      },
      grid: {
        top: 90,
        bottom: 100,
        left: 100,
        right: 40,
        containLabel: false,
      },
      xAxis: {
        type: 'category',
        data: hours,
        splitArea: {
          show: true,
          areaStyle: {
            color: ['rgba(250, 250, 250, 0.3)', 'rgba(240, 240, 240, 0.3)']
          }
        },
        axisLine: {
          lineStyle: {
            color: '#e5e7eb',
            width: 2,
          }
        },
        axisLabel: {
          fontSize: 11,
          interval: 1,
          color: '#6b7280',
          margin: 12,
          fontWeight: 500, // ✅ Número ao invés de string
        },
        axisTick: {
          show: false,
        },
      },
      yAxis: {
        type: 'category',
        data: days,
        splitArea: {
          show: true,
          areaStyle: {
            color: ['rgba(250, 250, 250, 0.3)', 'rgba(240, 240, 240, 0.3)']
          }
        },
        axisLine: {
          lineStyle: {
            color: '#e5e7eb',
            width: 2,
          }
        },
        axisLabel: {
          fontSize: 12,
          color: '#374151',
          fontWeight: 600, // ✅ Número ao invés de string
          margin: 16,
        },
        axisTick: {
          show: false,
        },
      },
      visualMap: {
        min: minValue,
        max: maxValue,
        calculable: true,
        orient: 'horizontal',
        left: 'center',
        bottom: 10,
        itemWidth: 20,
        itemHeight: 280,
        inRange: {
          color: metric === 'temperature' 
            ? colorPalettes.temperature
            : colorPalettes.events,
        },
        text: metric === 'temperature' 
          ? ['Alta', 'Baixa']
          : ['Mais', 'Menos'],
        textStyle: {
          fontSize: 12,
          color: '#374151',
          fontWeight: 600, // ✅ Número ao invés de string
        },
        borderColor: '#e5e7eb',
        borderWidth: 1,
        padding: [8, 12],
        backgroundColor: '#ffffff'
      },
      series: [
        {
          name: metric === 'temperature' ? 'Temperatura' : 'Eventos',
          type: 'heatmap',
          data: heatmapData,
          label: {
            show: false,
          },
          emphasis: {
            itemStyle: {
              shadowBlur: 15,
              shadowColor: 'rgba(0, 0, 0, 0.3)',
              borderColor: '#fff',
              borderWidth: 2,
            },
            label: {
              show: true,
              fontSize: 12,
              fontWeight: 'bold', // ✅ 'bold' é aceito no label
              color: '#fff',
              formatter: (params: any) => {
                return params.data[2].toFixed(0);
              }
            }
          },
          itemStyle: {
            borderColor: '#fff',
            borderWidth: 3,
            borderRadius: 4,
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
  }, [data, title, metric]);

  return (
    <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-lg p-6 border border-gray-100">
      <div ref={chartRef} style={{ height: '550px', width: '100%' }}></div>
      
      {/* Info Cards */}
      <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-gray-200">
        <div className="text-center">
          <div className="text-3xl mb-2">📅</div>
          <div className="text-sm text-gray-600 font-medium">Período</div>
          <div className="text-lg font-bold text-gray-900">7 dias</div>
        </div>
        <div className="text-center">
          <div className="text-3xl mb-2">⏰</div>
          <div className="text-sm text-gray-600 font-medium">Horas Mapeadas</div>
          <div className="text-lg font-bold text-gray-900">24h/dia</div>
        </div>
        <div className="text-center">
          <div className="text-3xl mb-2">🔥</div>
          <div className="text-sm text-gray-600 font-medium">Total de Pontos</div>
          <div className="text-lg font-bold text-gray-900">{data?.length || 0}</div>
        </div>
      </div>
    </div>
  );
}