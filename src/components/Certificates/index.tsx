import React, { useRef, useEffect, useState } from 'react';
import * as echarts from 'echarts';
import { 
  ChevronDownIcon, 
  ChevronUpIcon, 
  ExclamationTriangleIcon, 
  CalendarIcon, 
  ChartBarIcon,
  ArrowTrendingUpIcon
} from '@heroicons/react/24/outline';

interface CertificateData {
  id: number;
  company_name: string;
  certificate_type: string;
  certificate_status_name: string;
  item_name: string;
  issue_date: string;
  expiration_date: string;
  days_until_expiration: number;
  validity_status: string;
  combined_risk_score: number;
  renewal_urgency_level: string;
  asset_criticality: string;
  department_name: string;
  cost_center_name: string;
  is_expiring_soon: number;
  is_expiring_90_days: number;
  is_expired: number;
}

interface CertificateDashboardProps {
  data: CertificateData[];
}

const CertificateDashboard: React.FC<CertificateDashboardProps> = ({ data }) => {
  const chartRef1 = useRef<HTMLDivElement>(null);
  const chartRef2 = useRef<HTMLDivElement>(null);
  const chartRef3 = useRef<HTMLDivElement>(null);
  const chartRef4 = useRef<HTMLDivElement>(null);
  const [expanded, setExpanded] = useState(true);

  // Estatísticas calculadas
  const stats = {
    total: data.length,
    expiringSoon: data.filter(item => item.is_expiring_soon).length,
    expiring90Days: data.filter(item => item.is_expiring_90_days).length,
    expired: data.filter(item => item.is_expired).length,
    avgRiskScore: Math.round(data.reduce((acc, item) => acc + item.combined_risk_score, 0) / data.length),
    highRisk: data.filter(item => item.combined_risk_score > 70).length,
    mediumRisk: data.filter(item => item.combined_risk_score > 30 && item.combined_risk_score <= 70).length,
    lowRisk: data.filter(item => item.combined_risk_score <= 30).length,
  };

  useEffect(() => {
    if (!chartRef1.current || !chartRef2.current || !chartRef3.current || !chartRef4.current) return;

    // Gráfico 1: Distribuição por Status de Validade
    const chart1 = echarts.init(chartRef1.current);
    chart1.setOption({
      title: {
        text: 'Distribuição por Status de Validade',
        left: 'center',
        textStyle: {
          fontSize: 14,
          fontWeight: 'bold'
        }
      },
      tooltip: {
        trigger: 'item',
        formatter: '{a} <br/>{b}: {c} ({d}%)'
      },
      legend: {
        orient: 'vertical',
        left: 'left',
        top: 'bottom'
      },
      series: [
        {
          name: 'Status',
          type: 'pie',
          radius: ['40%', '70%'],
          avoidLabelOverlap: false,
          itemStyle: {
            borderRadius: 10,
            borderColor: '#fff',
            borderWidth: 2
          },
          label: {
            show: false,
            position: 'center'
          },
          emphasis: {
            label: {
              show: true,
              fontSize: 18,
              fontWeight: 'bold'
            }
          },
          labelLine: {
            show: false
          },
          data: [
            { value: stats.expired, name: 'Expirados', itemStyle: { color: '#ef4444' } },
            { value: stats.expiringSoon, name: 'Expirando em Breve', itemStyle: { color: '#f59e0b' } },
            { value: stats.expiring90Days, name: 'Expira em 90 Dias', itemStyle: { color: '#eab308' } },
            { value: stats.total - stats.expired - stats.expiringSoon - stats.expiring90Days, name: 'Válidos', itemStyle: { color: '#10b981' } }
          ]
        }
      ]
    });

    // Gráfico 2: Distribuição de Risco
    const chart2 = echarts.init(chartRef2.current);
    chart2.setOption({
      title: {
        text: 'Distribuição de Nível de Risco',
        left: 'center',
        textStyle: {
          fontSize: 14,
          fontWeight: 'bold'
        }
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow'
        }
      },
      xAxis: {
        type: 'category',
        data: ['Baixo Risco', 'Risco Médio', 'Alto Risco']
      },
      yAxis: {
        type: 'value',
        name: 'Quantidade'
      },
      series: [
        {
          name: 'Certificados',
          type: 'bar',
          data: [
            { value: stats.lowRisk, itemStyle: { color: '#10b981' } },
            { value: stats.mediumRisk, itemStyle: { color: '#eab308' } },
            { value: stats.highRisk, itemStyle: { color: '#ef4444' } }
          ],
          label: {
            show: true,
            position: 'top'
          }
        }
      ]
    });

    // Gráfico 3: Dias até Expiração
    const chart3 = echarts.init(chartRef3.current);
    const expirationData = data.map(item => item.days_until_expiration).sort((a, b) => a - b);
    chart3.setOption({
      title: {
        text: 'Distribuição - Dias até Expiração',
        left: 'center',
        textStyle: {
          fontSize: 14,
          fontWeight: 'bold'
        }
      },
      tooltip: {
        trigger: 'axis',
        formatter: '{b}: {c} dias'
      },
      xAxis: {
        type: 'category',
        data: expirationData.map((_, index) => (index + 1).toString()),
        name: 'Certificados'
      },
      yAxis: {
        type: 'value',
        name: 'Dias até Expiração'
      },
      series: [
        {
          name: 'Dias até Expiração',
          type: 'line',
          data: expirationData,
          smooth: true,
          lineStyle: {
            color: '#3b82f6',
            width: 3
          },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: 'rgba(59, 130, 246, 0.6)' },
              { offset: 1, color: 'rgba(59, 130, 246, 0.1)' }
            ])
          },
          markLine: {
            data: [
              {
                name: 'Zona Crítica',
                yAxis: 30,
                lineStyle: {
                  color: '#ef4444',
                  type: 'dashed'
                },
                label: {
                  formatter: '30 dias (Crítico)'
                }
              },
              {
                name: 'Zona de Atenção',
                yAxis: 90,
                lineStyle: {
                  color: '#f59e0b',
                  type: 'dashed'
                },
                label: {
                  formatter: '90 dias (Atenção)'
                }
              }
            ]
          }
        }
      ]
    });

    // Gráfico 4: Risco vs Dias até Expiração
    const chart4 = echarts.init(chartRef4.current);
    const scatterData = data.map(item => [
      item.days_until_expiration,
      item.combined_risk_score,
      item.item_name
    ]);
    
    chart4.setOption({
      title: {
        text: 'Risco vs Dias até Expiração',
        left: 'center',
        textStyle: {
          fontSize: 14,
          fontWeight: 'bold'
        }
      },
      tooltip: {
        formatter: function (params: any) {
          return `${params.data[2]}<br/>Dias: ${params.data[0]}<br/>Risco: ${params.data[1]}`;
        }
      },
      xAxis: {
        type: 'value',
        name: 'Dias até Expiração',
        nameLocation: 'middle',
        nameGap: 30
      },
      yAxis: {
        type: 'value',
        name: 'Score de Risco',
        nameLocation: 'middle',
        nameGap: 30
      },
      series: [
        {
          name: 'Certificados',
          type: 'scatter',
          data: scatterData,
          symbolSize: function (data: number[]) {
            return Math.max(10, 20 - data[0] / 20);
          },
          itemStyle: {
            color: function (params: any) {
              const risk = params.data[1];
              const days = params.data[0];
              if (days <= 30 || risk > 70) return '#ef4444'; // Vermelho - Crítico
              if (days <= 90 || risk > 40) return '#f59e0b'; // Laranja - Atenção
              return '#10b981'; // Verde - OK
            }
          },
          emphasis: {
            focus: 'series',
            scale: true
          }
        }
      ],
      visualMap: {
        type: 'piecewise',
        show: false,
        pieces: [
          { gt: 0, lte: 30, color: '#ef4444' },
          { gt: 30, lte: 90, color: '#f59e0b' },
          { gt: 90, color: '#10b981' }
        ],
        orient: 'horizontal',
        left: 'center',
        bottom: 0
      }
    });

    // Responsividade
    const handleResize = () => {
      chart1.resize();
      chart2.resize();
      chart3.resize();
      chart4.resize();
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chart1.dispose();
      chart2.dispose();
      chart3.dispose();
      chart4.dispose();
    };
  }, [data, stats]);

  return (
    <div className="bg-white rounded-lg shadow-lg border border-gray-200 mb-6">
      {/* Cabeçalho */}
      <div 
        className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200 cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center space-x-3">
          <ChartBarIcon className="w-6 h-6 text-blue-600" />
          <h2 className="text-xl font-bold text-gray-800">Dashboard de Análise de Certificados</h2>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <CalendarIcon className="w-4 h-4" />
            <span>Atualizado: {new Date().toLocaleDateString('pt-BR')}</span>
          </div>
          {expanded ? 
            <ChevronUpIcon className="w-5 h-5 text-gray-600" /> : 
            <ChevronDownIcon className="w-5 h-5 text-gray-600" />
          }
        </div>
      </div>

      {expanded && (
        <>
          {/* Cards de Estatísticas */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4 bg-gray-50 border-b">
            <div className="bg-white rounded-lg p-4 shadow border">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-gray-600">Total de Certificados</h3>
                <ChartBarIcon className="w-5 h-5 text-blue-500" />
              </div>
              <p className="text-2xl font-bold text-gray-800 mt-2">{stats.total}</p>
            </div>

            <div className="bg-white rounded-lg p-4 shadow border">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-gray-600">Expirando em 90 Dias</h3>
                <ExclamationTriangleIcon className="w-5 h-5 text-yellow-500" />
              </div>
              <p className="text-2xl font-bold text-yellow-600 mt-2">{stats.expiring90Days}</p>
              <p className="text-xs text-gray-500 mt-1">
                {((stats.expiring90Days / stats.total) * 100).toFixed(1)}% do total
              </p>
            </div>

            <div className="bg-white rounded-lg p-4 shadow border">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-gray-600">Alto Risco</h3>
                <ExclamationTriangleIcon className="w-5 h-5 text-red-500" />
              </div>
              <p className="text-2xl font-bold text-red-600 mt-2">{stats.highRisk}</p>
              <p className="text-xs text-gray-500 mt-1">
                Score médio: {stats.avgRiskScore}
              </p>
            </div>

            <div className="bg-white rounded-lg p-4 shadow border">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-gray-600">Tendência</h3>
                <ArrowTrendingUpIcon className="w-5 h-5 text-green-500" />
              </div>
              <p className="text-2xl font-bold text-gray-800 mt-2">
                {stats.expired > 0 ? 'Crítico' : 'Estável'}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {stats.expired} expirados
              </p>
            </div>
          </div>

          {/* Grid de Gráficos */}
          <div className="p-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg p-4 shadow border">
                <div ref={chartRef1} className="w-full h-80" />
              </div>
              <div className="bg-white rounded-lg p-4 shadow border">
                <div ref={chartRef2} className="w-full h-80" />
              </div>
              <div className="bg-white rounded-lg p-4 shadow border">
                <div ref={chartRef3} className="w-full h-80" />
              </div>
              <div className="bg-white rounded-lg p-4 shadow border">
                <div ref={chartRef4} className="w-full h-80" />
              </div>
            </div>

            {/* Legenda de Cores */}
            <div className="mt-6 flex flex-wrap gap-4 justify-center text-xs">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-red-500 rounded"></div>
                <span>Crítico (≤30 dias ou risco {'>'}70)</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-yellow-500 rounded"></div>
                <span>Atenção (≤90 dias ou risco {'>'}40)</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded"></div>
                <span>Normal ({'>'}90 dias e risco ≤40)</span>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default CertificateDashboard;