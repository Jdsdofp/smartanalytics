import { useEffect, useRef, useState } from 'react';
import * as echarts from 'echarts';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import listPlugin from '@fullcalendar/list';
import interactionPlugin from '@fullcalendar/interaction';
import CertificateReportGrid from './Reports/reportMN0400_511';
import { useCompany } from '../../hooks/useCompany';
import { t } from 'i18next';
import CertificateMap from './Reports/CertificateMap';

// ============= INTERFACES ATUALIZADAS =============
interface ObservabilityKPIs {
  dataQuality: {
    completenessScore: number;
    recordsWithCompleteData: number;
    recordsWithIncompleteData: number;
  };
  processHealth: {
    onTimeRenewals: number;
    delayedRenewals: number;
    avgProcessingTime: number;
  };
  predictability: {
    highPredictability: number;
    mediumPredictability: number;
    lowPredictability: number;
    avgPredictabilityScore: number;
  };
}

interface Analytics {
  totalCertificates: number;
  validCertificates: number;
  expiredCertificates: number;
  expiringSoon: number;
  expiring90Days: number;
  expiring180Days: number;
  averageRenewalScore: number;
  averageExpirationRisk: number;
  averageComplianceScore: number;
  averageComplexityScore: number;
  highRisk: number;
  mediumRisk: number;
  lowRisk: number;
  totalFinancialRisk: number;
  totalAssetValueAtRisk: number;
  anomaliesDetected: number;
  averageAnomalyScore: number;
  urgentActions: number;
}

interface RenewalForecast {
  month: number;
  totalRenewals: number;
  highRisk: number;
  mediumRisk: number;
  lowRisk: number;
  estimatedCost: number;
  avgRenewalProbability: number;
}

interface DepartmentRiskAnalysis {
  name: string;
  total: number;
  expired: number;
  expiringSoon: number;
  highRisk: number;
  totalFinancialRisk: number;
  avgRenewalScore: number;
  riskScore: number;
}

interface CertificateTypeAnalysis {
  name: string;
  description: string;
  total: number;
  expired: number;
  expiringSoon: number;
  avgComplexity: number;
  avgComplianceScore: number;
}

interface ApiResponse {
  analytics: Analytics;
  riskDistribution: Array<{ name: string; value: number; color: string }>;
  validityStatusData: Array<{ name: string; value: number; percentage: string }>;
  strategicDistribution: {
    critical: number;
    high: number;
    standard: number;
    low: number;
  };
  departmentRiskAnalysis: DepartmentRiskAnalysis[];
  certificateTypeAnalysis: CertificateTypeAnalysis[];
  brandAnalysis: Array<{
    name: string;
    total: number;
    expired: number;
    avgValidityDays: number;
  }>;
  locationAnalysis: Array<{
    name: string;
    total: number;
    expired: number;
    expiringSoon: number;
  }>;
  custodyAnalysis: Array<{
    name: string;
    email: string;
    total: number;
    expired: number;
    expiringSoon: number;
    urgentActions: number;
  }>;
  automationReadiness: {
    high: number;
    medium: number;
    low: number;
    percentage: string;
  };
  recommendedActions: Record<string, any[]>;
  concurrentRenewalsAnalysis: {
    noConcurrency: number;
    lowConcurrency: number;
    mediumConcurrency: number;
    highConcurrency: number;
    maxConcurrent: number;
  };
  riskComplexityMatrix: {
    highRisk_highComplexity: number;
    highRisk_lowComplexity: number;
    lowRisk_highComplexity: number;
    lowRisk_lowComplexity: number;
  };
  renewalForecast: RenewalForecast[];
  observabilityKPIs: ObservabilityKPIs;
  calendarEvents: Array<any>;
  generatedAt: string;
  dataFreshness: string;
}

export default function PredictiveCertificateAnalysis() {
  const { companyId } = useCompany();
  const token = sessionStorage.getItem('token')
  console.log('token aqui', token)
  

  const [activeTab, setActiveTab] = useState<string>('overview');
  const [data, setData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [calendarView, setCalendarView] = useState<'month' | 'week' | 'day' | 'year'>('month');
  const [selectedFilter, setSelectedFilter] = useState<string | null>(null);
  const [showFilteredList, setShowFilteredList] = useState(false);

  // Chart refs - Atualizados
  const riskDistributionRef = useRef<HTMLDivElement>(null);
  const renewalForecastRef = useRef<HTMLDivElement>(null);
  const departmentRiskRef = useRef<HTMLDivElement>(null);
  const complexityMatrixRef = useRef<HTMLDivElement>(null);
  const validityStatusRef = useRef<HTMLDivElement>(null);
  const automationReadinessRef = useRef<HTMLDivElement>(null);
  const concurrentRenewalsRef = useRef<HTMLDivElement>(null);
  const strategicImportanceRef = useRef<HTMLDivElement>(null);
  const certificateTypeRef = useRef<HTMLDivElement>(null);
  const brandAnalysisRef = useRef<HTMLDivElement>(null);
  const locationAnalysisRef = useRef<HTMLDivElement>(null);
  const calendarRef = useRef<any>(null);

  // Fetch data from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch(`https://apinode.smartxhub.cloud/api/dashboard/certificates/${companyId}`);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        setData(result);

        console.log('📊 API Response:', result);
        console.log('📅 Calendar Events:', result?.calendarEvents?.length);
        console.log('🎯 Observability KPIs:', result?.observabilityKPIs);
      } catch (err) {
        setError(err as Error);
        console.error('❌ Error fetching analytics:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [companyId]);

  // Função para lidar com clique no evento do calendário
  const handleEventClick = (clickInfo: any) => {
    const event = clickInfo.event;
    const props = event.extendedProps;

    alert(`
      Certificate: ${event.title}
      Item Code: ${props.itemCode || 'N/A'}
      Status: ${props.status}
      Department: ${props.department}
      Location: ${props.location || 'N/A'}
      Custody: ${props.custody || 'N/A'}
      Brand: ${props.brand || 'N/A'}
      Model: ${props.model || 'N/A'}
      Days to Expiration: ${props.daysToExpiration}
      Risk Level: ${props.riskLevel}
      Renewal Probability: ${props.renewalProbability}%
      Compliance Score: ${props.complianceScore}
      Recommended Action: ${props.recommendedAction}
      Financial Impact: R$ ${props.financialImpact}
      Strategic Importance: ${props.strategicImportance}
      Expiration Date: ${event.start?.toLocaleDateString()}
    `);
  };

  // Atualizar view do calendário
  const changeCalendarView = (view: 'month' | 'week' | 'day' | 'year') => {
    setCalendarView(view);
    const calendarApi = calendarRef.current?.getApi();
    if (calendarApi) {
      if (view === 'month') calendarApi.changeView('dayGridMonth');
      else if (view === 'week') calendarApi.changeView('timeGridWeek');
      else if (view === 'day') calendarApi.changeView('timeGridDay');
      else if (view === 'year') calendarApi.changeView('dayGridYear');
    }
  };

  // Função para filtrar eventos por status
  const handleLegendClick = (filter: string) => {
    if (selectedFilter === filter) {
      setSelectedFilter(null);
      setShowFilteredList(false);
    } else {
      setSelectedFilter(filter);
      setShowFilteredList(true);
    }
  };

  // Filtrar eventos baseado no filtro selecionado
  const getFilteredEvents = () => {
    if (!data?.calendarEvents) return [];

    if (!selectedFilter) return data.calendarEvents;

    return data.calendarEvents.filter(event => {
      const status = event.extendedProps?.status?.toLowerCase();
      const daysToExpiration = event.extendedProps?.daysToExpiration;

      switch (selectedFilter) {
        case 'expired':
          return status === 'expired' || daysToExpiration < 0;
        case 'expiring-soon':
          return daysToExpiration >= 0 && daysToExpiration <= 30;
        case 'expiring':
          return daysToExpiration > 30 && daysToExpiration <= 90;
        case 'valid':
          return status === 'available' && daysToExpiration > 90;
        default:
          return true;
      }
    });
  };

  // Obter label do filtro
  const getFilterLabel = (filter: string | null) => {
    switch (filter) {
      case 'expired':
        return t('predictiveCertificateAnalysis.status.expired');
      case 'expiring-soon':
        return t('predictiveCertificateAnalysis.calendar.expiringSoon');
      case 'expiring':
        return t('predictiveCertificateAnalysis.calendar.expiring');
      case 'valid':
        return t('predictiveCertificateAnalysis.status.valid');
      default:
        return t('predictiveCertificateAnalysis.quickStats.totalCertificates');
    }
  };

  // ============= FUNÇÕES DE CRIAÇÃO DE GRÁFICOS - ATUALIZADAS =============

  const createOverviewCharts = () => {
    if (!data) return;

    // DISTRIBUIÇÃO DE RISCO - AJUSTADO
    if (riskDistributionRef.current) {
      echarts.dispose(riskDistributionRef.current);
      const chart = echarts.init(riskDistributionRef.current);
      chart.setOption({
        title: {
          text: t('predictiveCertificateAnalysis.charts.riskLevelDistribution'),
          left: 'center',
          top: 10,
          textStyle: { fontSize: 16, fontWeight: 'bold' }
        },
        tooltip: {
          trigger: 'item',
          formatter: '{b}: {c} ({d}%)'
        },
        legend: {
          bottom: 10,
          left: 'center',
          orient: 'horizontal'
        },
        grid: {
          containLabel: true
        },
        series: [{
          type: 'pie',
          radius: ['40%', '65%'],
          center: ['50%', '50%'],
          avoidLabelOverlap: true,
          itemStyle: {
            borderRadius: 8,
            borderColor: '#fff',
            borderWidth: 2
          },
          label: {
            show: true,
            position: 'outside',
            formatter: '{b}\n{c} ({d}%)',
            fontSize: 11
          },
          labelLine: {
            show: true,
            length: 15,
            length2: 10
          },
          emphasis: {
            label: { show: true, fontSize: 14, fontWeight: 'bold' },
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.5)'
            }
          },
          data: data.riskDistribution.map(item => ({
            value: item.value,
            name: item.name,
            itemStyle: { color: item.color }
          }))
        }]
      });
    }

    // STATUS DE VALIDADE - COM I18N
    if (validityStatusRef.current) {
      echarts.dispose(validityStatusRef.current);
      const chart = echarts.init(validityStatusRef.current);
      chart.setOption({
        title: {
          text: t('predictiveCertificateAnalysis.charts.certificateStatusDistribution'),
          left: 'center',
          top: 10,
          textStyle: { fontSize: 16, fontWeight: 'bold' }
        },
        tooltip: {
          trigger: 'item',
          formatter: (params: any) => {
            const translatedName = t(`predictiveCertificateAnalysis.charts.certificateStatus.${params.data.originalName}`);
            return `${translatedName}: ${params.value} (${params.percent}%)`;
          }
        },
        legend: {
          bottom: 10,
          left: 'center',
          orient: 'horizontal',
          type: 'scroll',
          formatter: (name: any) => {
            // Extrai o nome original da string "Nome Traduzido (12.7%)"
            const match = name.match(/^(.+?)\s*\(/);
            return match ? match[1] : name;
          }
        },
        series: [{
          type: 'pie',
          radius: '60%',
          center: ['50%', '50%'],
          data: data.validityStatusData.map(item => ({
            value: item.value,
            originalName: item.name, // Mantém o nome original para referência
            name: `${t(`predictiveCertificateAnalysis.charts.certificateStatus.${item.name}`)} (${item.percentage}%)`,
            itemStyle: {
              // Opcional: cores personalizadas por status
              color: {
                'VALID': '#10b981',
                'EXPIRED': '#ef4444',
                'EXPIRING_SOON': '#f59e0b',
                'EXPIRING_MEDIUM': '#eab308',
                'NO_EXPIRATION': '#6b7280'
              }[item.name]
            }
          })),
          label: {
            show: true,
            position: 'outside',
            formatter: '{b}',
            fontSize: 11
          },
          labelLine: {
            show: true,
            length: 15,
            length2: 10
          },
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.5)'
            }
          }
        }]
      });
    }

    // ANÁLISE POR DEPARTAMENTO - COM RÓTULOS DE DADOS
    if (departmentRiskRef.current) {
      echarts.dispose(departmentRiskRef.current);
      const chart = echarts.init(departmentRiskRef.current);
      const top10Depts = data.departmentRiskAnalysis.slice(0, 10);
      chart.setOption({
        title: {
          text: t('predictiveCertificateAnalysis.charts.departmentPerformance'),
          left: 'center',
          top: 10,
          textStyle: { fontSize: 16, fontWeight: 'bold' }
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: { type: 'shadow' },
          formatter: (params: any) => {
            const dept = top10Depts[params[0].dataIndex];
            return `<div style="padding: 8px;">
                <strong style="font-size: 13px;">${dept.name}</strong><br/>
                <span style="font-size: 12px;">Total: <strong>${dept.total}</strong></span><br/>
                <span style="font-size: 12px;">${t('predictiveCertificateAnalysis.status.expired')}: <strong style="color: #ef4444;">${dept.expired}</strong></span><br/>
                <span style="font-size: 12px;">${t('predictiveCertificateAnalysis.calendar.expiring')}: <strong style="color: #f59e0b;">${dept.expiringSoon}</strong></span><br/>
                <span style="font-size: 12px;">${t('predictiveCertificateAnalysis.risk.highRisk')}: <strong style="color: #dc2626;">${dept.highRisk}</strong></span><br/>
                <span style="font-size: 12px;">${t('predictiveCertificateAnalysis.kpi.financialRisk')}: <strong>R$ ${dept.totalFinancialRisk.toFixed(2)}</strong></span><br/>
                <span style="font-size: 12px;">Avg Renewal: <strong>${dept.avgRenewalScore.toFixed(1)}</strong></span>
              </div>`;
          }
        },
        legend: {
          data: ['Total', t('predictiveCertificateAnalysis.status.expired'), t('predictiveCertificateAnalysis.calendar.expiring'), t('predictiveCertificateAnalysis.risk.highRisk')],
          bottom: 10,
          type: 'scroll'
        },
        grid: {
          left: '5%',
          right: '5%',
          top: '15%',
          bottom: '20%',
          containLabel: true
        },
        xAxis: {
          type: 'category',
          data: top10Depts.map(d => d.name),
          axisLabel: {
            interval: 0,
            rotate: 35,
            fontSize: 10,
            overflow: 'truncate',
            width: 80
          }
        },
        yAxis: {
          type: 'value',
          name: 'Quantidade',
          nameTextStyle: {
            fontSize: 12,
            padding: [0, 0, 0, 10]
          }
        },
        series: [
          {
            name: 'Total',
            type: 'bar',
            data: top10Depts.map(d => d.total),
            itemStyle: { color: '#3b82f6' },
            barMaxWidth: 40,
            label: {
              show: true,
              position: 'top',
              fontSize: 11,
              fontWeight: 'bold',
              color: '#3b82f6',
              formatter: '{c}'
            }
          },
          {
            name: t('predictiveCertificateAnalysis.status.expired'),
            type: 'bar',
            data: top10Depts.map(d => d.expired),
            itemStyle: { color: '#ef4444' },
            barMaxWidth: 40,
            label: {
              show: true,
              position: 'top',
              fontSize: 11,
              fontWeight: 'bold',
              color: '#ef4444',
              formatter: '{c}'
            }
          },
          {
            name: t('predictiveCertificateAnalysis.calendar.expiring'),
            type: 'bar',
            data: top10Depts.map(d => d.expiringSoon),
            itemStyle: { color: '#f59e0b' },
            barMaxWidth: 40,
            label: {
              show: true,
              position: 'top',
              fontSize: 11,
              fontWeight: 'bold',
              color: '#f59e0b',
              formatter: '{c}'
            }
          },
          {
            name: t('predictiveCertificateAnalysis.risk.highRisk'),
            type: 'bar',
            data: top10Depts.map(d => d.highRisk),
            itemStyle: { color: '#dc2626' },
            barMaxWidth: 40,
            label: {
              show: true,
              position: 'top',
              fontSize: 11,
              fontWeight: 'bold',
              color: '#dc2626',
              formatter: '{c}'
            }
          }
        ]
      });
    }

    // MATRIZ RISCO vs COMPLEXIDADE - CORRIGIDO
    if (complexityMatrixRef.current) {
      echarts.dispose(complexityMatrixRef.current);
      const chart = echarts.init(complexityMatrixRef.current);
      const matrix = data.riskComplexityMatrix;

      const maxValue = Math.max(
        matrix.highRisk_highComplexity,
        matrix.highRisk_lowComplexity,
        matrix.lowRisk_highComplexity,
        matrix.lowRisk_lowComplexity
      );

      chart.setOption({
        title: {
          text: t('predictiveCertificateAnalysis.kpi.riskComplexityMatrix'),
          left: 'center',
          top: 10,
          textStyle: { fontSize: 16, fontWeight: 'bold' }
        },
        tooltip: {
          position: 'top',
          formatter: (params: any) => {
            const complexityLabels = [
              t('predictiveCertificateAnalysis.kpi.lowComplexity'),
              t('predictiveCertificateAnalysis.kpi.highComplexity')
            ];
            const riskLabels = [
              t('predictiveCertificateAnalysis.kpi.lowRisk'),
              t('predictiveCertificateAnalysis.kpi.highComplexity')
            ];

            return `<div style="padding: 8px;">
                    <strong>${riskLabels[params.data[1]]} / ${complexityLabels[params.data[0]]}</strong><br/>
                    ${t('predictiveCertificateAnalysis.kpi.quantity')}: <strong>${params.data[2]}</strong>
                  </div>`;
          }
        },
        grid: {
          left: '15%',
          right: '10%',
          top: '20%',
          bottom: '20%',
          containLabel: true
        },
        xAxis: {
          type: 'category',
          data: [
            t('predictiveCertificateAnalysis.kpi.lowComplexity'),
            t('predictiveCertificateAnalysis.kpi.highComplexity')
          ],
          splitArea: {
            show: true
          },
          axisLabel: {
            fontSize: 11,
            interval: 0
          }
        },
        yAxis: {
          type: 'category',
          data: [
            t('predictiveCertificateAnalysis.kpi.lowRisk'),
            'Alto Risco'
          ],
          splitArea: {
            show: true
          },
          axisLabel: {
            fontSize: 11,
            interval: 0
          }
        },
        visualMap: {
          min: 0,
          max: maxValue,
          calculable: true,
          orient: 'horizontal',
          left: 'center',
          bottom: 10,
          inRange: {
            color: ['#d1fae5', '#10b981', '#f59e0b', '#ef4444']
          },
          text: ['Alto', 'Baixo'],
          textStyle: {
            fontSize: 11
          }
        },
        series: [{
          name: 'Certificados',
          type: 'heatmap',
          data: [
            [0, 0, matrix.lowRisk_lowComplexity],
            [1, 0, matrix.lowRisk_highComplexity],
            [0, 1, matrix.highRisk_lowComplexity],
            [1, 1, matrix.highRisk_highComplexity]
          ],
          label: {
            show: true,
            fontSize: 18,
            fontWeight: 'bold',
            color: '#fff'
          },
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowColor: 'rgba(0, 0, 0, 0.5)'
            }
          }
        }]
      });
    }
  };

  // ============= CORREÇÕES PARA PREDICTABILITY =============
  const createPredictabilityCharts = () => {
    if (!data) return;

    // PREVISÃO DE RENOVAÇÕES - MELHORADO
    if (renewalForecastRef.current) {
      echarts.dispose(renewalForecastRef.current);
      const chart = echarts.init(renewalForecastRef.current);
      const monthNames = [
        t('predictiveCertificateAnalysis.kpi.month1'),
        t('predictiveCertificateAnalysis.kpi.month2'),
        t('predictiveCertificateAnalysis.kpi.month3'),
        t('predictiveCertificateAnalysis.kpi.month4'),
        t('predictiveCertificateAnalysis.kpi.month5'),
        t('predictiveCertificateAnalysis.kpi.month6'),
        t('predictiveCertificateAnalysis.kpi.month7'),
        t('predictiveCertificateAnalysis.kpi.month8'),
        t('predictiveCertificateAnalysis.kpi.month9'),
        t('predictiveCertificateAnalysis.kpi.month10'),
        t('predictiveCertificateAnalysis.kpi.month11'),
        t('predictiveCertificateAnalysis.kpi.month12')
      ];

      chart.setOption({
        title: {
          text: t('predictiveCertificateAnalysis.charts.renewalUrgencyTrend'),
          left: 'center',
          top: 10,
          textStyle: { fontSize: 16, fontWeight: 'bold' }
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: { type: 'cross' }
        },
        legend: {
          data: [
            t('predictiveCertificateAnalysis.risk.highRisk'),
            t('predictiveCertificateAnalysis.risk.mediumRisk'),
            t('predictiveCertificateAnalysis.risk.lowRisk'),
            'Custo Estimado'
          ],
          bottom: 10,
          type: 'scroll'
        },
        grid: {
          left: '5%',
          right: '8%',
          top: '15%',
          bottom: '15%',
          containLabel: true
        },
        xAxis: {
          type: 'category',
          boundaryGap: false,
          data: monthNames,
          axisLabel: {
            fontSize: 11,
            rotate: 0
          }
        },
        yAxis: [
          {
            type: 'value',
            name: 'Quantidade',
            position: 'left',
            nameTextStyle: {
              fontSize: 12
            },
            axisLabel: {
              fontSize: 11
            }
          },
          {
            type: 'value',
            name: 'Custo (R$)',
            position: 'right',
            nameTextStyle: {
              fontSize: 12
            },
            axisLabel: {
              formatter: (value: number) => `R$ ${(value / 1000).toFixed(0)}k`,
              fontSize: 11
            }
          }
        ],
        series: [
          {
            name: t('predictiveCertificateAnalysis.risk.highRisk'),
            type: 'line',
            stack: 'Total',
            smooth: true,
            lineStyle: { width: 0 },
            showSymbol: false,
            areaStyle: { opacity: 0.8, color: '#ef4444' },
            emphasis: { focus: 'series' },
            data: data.renewalForecast.map(item => item.highRisk)
          },
          {
            name: t('predictiveCertificateAnalysis.risk.mediumRisk'),
            type: 'line',
            stack: 'Total',
            smooth: true,
            lineStyle: { width: 0 },
            showSymbol: false,
            areaStyle: { opacity: 0.8, color: '#f59e0b' },
            emphasis: { focus: 'series' },
            data: data.renewalForecast.map(item => item.mediumRisk)
          },
          {
            name: t('predictiveCertificateAnalysis.risk.lowRisk'),
            type: 'line',
            stack: 'Total',
            smooth: true,
            lineStyle: { width: 0 },
            showSymbol: false,
            areaStyle: { opacity: 0.8, color: '#10b981' },
            emphasis: { focus: 'series' },
            data: data.renewalForecast.map(item => item.lowRisk)
          },
          {
            name: 'Custo Estimado',
            type: 'line',
            yAxisIndex: 1,
            smooth: true,
            lineStyle: { width: 3, color: '#3b82f6' },
            itemStyle: { color: '#3b82f6' },
            symbol: 'circle',
            symbolSize: 6,
            data: data.renewalForecast.map(item => item.estimatedCost)
          }
        ]
      });
    }

    // AUTOMAÇÃO - GAUGE MELHORADO
    if (automationReadinessRef.current) {
      echarts.dispose(automationReadinessRef.current);
      const chart = echarts.init(automationReadinessRef.current);
      const percentage = parseFloat(data.automationReadiness.percentage);

      chart.setOption({
        title: {
          text: t('predictiveCertificateAnalysis.kpi.automationReadiness'),
          left: 'center',
          top: 10,
          textStyle: { fontSize: 16, fontWeight: 'bold' }
        },
        tooltip: {
          formatter: '{a} <br/>{b} : {c}%'
        },
        series: [{
          name: 'Prontidão',
          type: 'gauge',
          startAngle: 180,
          endAngle: 0,
          min: 0,
          max: 100,
          splitNumber: 5,
          center: ['50%', '70%'],
          radius: '80%',
          itemStyle: {
            color: percentage >= 70 ? '#10b981' : percentage >= 40 ? '#f59e0b' : '#ef4444'
          },
          progress: {
            show: true,
            width: 20
          },
          pointer: {
            show: true,
            length: '60%',
            width: 6
          },
          axisLine: {
            lineStyle: {
              width: 20,
              color: [[1, '#e5e7eb']]
            }
          },
          axisTick: {
            show: true,
            distance: -25,
            length: 8,
            lineStyle: {
              color: '#999',
              width: 1
            }
          },
          splitLine: {
            show: true,
            distance: -30,
            length: 15,
            lineStyle: {
              color: '#999',
              width: 2
            }
          },
          axisLabel: {
            show: true,
            distance: -45,
            color: '#999',
            fontSize: 11
          },
          detail: {
            valueAnimation: true,
            formatter: '{value}%',
            fontSize: 28,
            fontWeight: 'bold',
            color: 'auto',
            offsetCenter: [0, '-10%']
          },
          data: [{
            value: percentage,
            name: 'Automação'
          }]
        }]
      });
    }

    // RENOVAÇÕES CONCORRENTES - MELHORADO
    if (concurrentRenewalsRef.current) {
      echarts.dispose(concurrentRenewalsRef.current);
      const chart = echarts.init(concurrentRenewalsRef.current);
      const concurrent = data.concurrentRenewalsAnalysis;

      chart.setOption({
        title: {
          text: t('predictiveCertificateAnalysis.charts.concurrentRenewalsAnalysis'),
          left: 'center',
          top: 10,
          textStyle: { fontSize: 16, fontWeight: 'bold' }
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: { type: 'shadow' },
          formatter: (params: any) => {
            return `<div style="padding: 8px;">
                    <strong>${params[0].name}</strong><br/>
                    Certificados: <strong>${params[0].value}</strong>
                  </div>`;
          }
        },
        grid: {
          left: '5%',
          right: '5%',
          top: '20%',
          bottom: '10%',
          containLabel: true
        },
        xAxis: {
          type: 'category',
          data: ['Sem Concorrência', 'Baixa (1-5)', 'Média (6-10)', 'Alta (>10)'],
          axisLabel: {
            fontSize: 11,
            interval: 0,
            rotate: 0
          }
        },
        yAxis: {
          type: 'value',
          name: 'Certificados',
          nameTextStyle: {
            fontSize: 12
          },
          axisLabel: {
            fontSize: 11
          }
        },
        series: [{
          type: 'bar',
          data: [
            { value: concurrent.noConcurrency, itemStyle: { color: '#10b981' } },
            { value: concurrent.lowConcurrency, itemStyle: { color: '#3b82f6' } },
            { value: concurrent.mediumConcurrency, itemStyle: { color: '#f59e0b' } },
            { value: concurrent.highConcurrency, itemStyle: { color: '#ef4444' } }
          ],
          barMaxWidth: 60,
          label: {
            show: true,
            position: 'top',
            formatter: '{c}',
            fontSize: 12,
            fontWeight: 'bold'
          },
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowColor: 'rgba(0, 0, 0, 0.3)'
            }
          }
        }]
      });
    }

    // IMPORTÂNCIA ESTRATÉGICA - RADAR MELHORADO
    if (strategicImportanceRef.current) {
      echarts.dispose(strategicImportanceRef.current);
      const chart = echarts.init(strategicImportanceRef.current);
      const strategic = data.strategicDistribution;
      const maxVal = Math.max(strategic.critical, strategic.high, strategic.standard, strategic.low);

      chart.setOption({
        title: {
          text: t('predictiveCertificateAnalysis.charts.strategicImportance'),
          left: 'center',
          top: 10,
          textStyle: { fontSize: 16, fontWeight: 'bold' }
        },
        tooltip: {
          trigger: 'item',
          formatter: (params: any) => {
            return `<div style="padding: 8px;">
                    <strong>${params.name}</strong><br/>
                    Valor: <strong>${params.value}</strong>
                  </div>`;
          }
        },
        radar: {
          center: ['50%', '55%'],
          radius: '65%',
          indicator: [
            { name: 'Crítico', max: maxVal },
            { name: 'Alto', max: maxVal },
            { name: 'Padrão', max: maxVal },
            { name: 'Baixo', max: maxVal }
          ],
          axisName: {
            fontSize: 12,
            color: '#666'
          },
          splitArea: {
            areaStyle: {
              color: ['rgba(59, 130, 246, 0.05)', 'rgba(59, 130, 246, 0.1)']
            }
          }
        },
        series: [{
          type: 'radar',
          data: [{
            value: [strategic.critical, strategic.high, strategic.standard, strategic.low],
            name: 'Distribuição',
            areaStyle: {
              color: 'rgba(59, 130, 246, 0.3)',
              opacity: 0.7
            },
            lineStyle: {
              color: '#3b82f6',
              width: 2
            },
            symbol: 'circle',
            symbolSize: 6,
            itemStyle: {
              color: '#3b82f6'
            },
            label: {
              show: true,
              formatter: '{c}',
              fontSize: 11,
              fontWeight: 'bold'
            }
          }]
        }]
      });
    }
  };

  // ============= CORREÇÕES PARA OBSERVABILITY =============
  const createObservabilityCharts = () => {
    if (!data) return;

    // ANÁLISE POR TIPO DE CERTIFICADO - MELHORADO
    if (certificateTypeRef.current) {
      echarts.dispose(certificateTypeRef.current);
      const chart = echarts.init(certificateTypeRef.current);
      const top10Types = data.certificateTypeAnalysis.slice(0, 10);

      chart.setOption({
        title: {
          text: 'Análise por Tipo de Certificado',
          left: 'center',
          top: 10,
          textStyle: { fontSize: 16, fontWeight: 'bold' }
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: { type: 'shadow' }
        },
        legend: {
          data: ['Total', t('predictiveCertificateAnalysis.status.expired'), t('predictiveCertificateAnalysis.calendar.expiring')],
          bottom: 10,
          type: 'scroll'
        },
        grid: {
          left: '5%',
          right: '5%',
          top: '15%',
          bottom: '20%',
          containLabel: true
        },
        xAxis: {
          type: 'category',
          data: top10Types.map(t => t.name),
          axisLabel: {
            interval: 0,
            rotate: 35,
            fontSize: 10,
            overflow: 'truncate',
            width: 80
          }
        },
        yAxis: {
          type: 'value',
          nameTextStyle: {
            fontSize: 12
          },
          axisLabel: {
            fontSize: 11
          }
        },
        series: [
          {
            name: 'Total',
            type: 'bar',
            data: top10Types.map(t => t.total),
            itemStyle: { color: '#3b82f6' },
            barMaxWidth: 40
          },
          {
            name: t('predictiveCertificateAnalysis.status.expired'),
            type: 'bar',
            data: top10Types.map(t => t.expired),
            itemStyle: { color: '#ef4444' },
            barMaxWidth: 40
          },
          {
            name: t('predictiveCertificateAnalysis.calendar.expiring'),
            type: 'bar',
            data: top10Types.map(t => t.expiringSoon),
            itemStyle: { color: '#f59e0b' },
            barMaxWidth: 40
          }
        ]
      });
    }

    // TOP MARCAS - MELHORADO
    if (brandAnalysisRef.current) {
      echarts.dispose(brandAnalysisRef.current);
      const chart = echarts.init(brandAnalysisRef.current);

      chart.setOption({
        title: {
          text: t('predictiveCertificateAnalysis.charts.brandReliability'),
          left: 'center',
          top: 10,
          textStyle: { fontSize: 16, fontWeight: 'bold' }
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: { type: 'shadow' },
          formatter: (params: any) => {
            const brand = data.brandAnalysis[params[0].dataIndex];
            return `<div style="padding: 8px;">
                    <strong style="font-size: 13px;">${brand.name}</strong><br/>
                    <span style="font-size: 12px;">Total: <strong>${brand.total}</strong></span><br/>
                    <span style="font-size: 12px;">${t('predictiveCertificateAnalysis.status.expired')}: <strong style="color: #ef4444;">${brand.expired}</strong></span><br/>
                    <span style="font-size: 12px;">Validade Média: <strong>${brand.avgValidityDays.toFixed(0)} dias</strong></span>
                  </div>`;
          }
        },
        grid: {
          left: '5%',
          right: '5%',
          top: '15%',
          bottom: '5%',
          containLabel: true
        },
        xAxis: {
          type: 'value',
          nameTextStyle: {
            fontSize: 12
          },
          axisLabel: {
            fontSize: 11
          }
        },
        yAxis: {
          type: 'category',
          data: data.brandAnalysis.map(b => b.name),
          axisLabel: {
            fontSize: 11,
            overflow: 'truncate',
            width: 120
          }
        },
        series: [{
          type: 'bar',
          data: data.brandAnalysis.map(b => b.total),
          itemStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
              { offset: 0, color: '#10b981' },
              { offset: 1, color: '#3b82f6' }
            ]),
            borderRadius: [0, 4, 4, 0]
          },
          barMaxWidth: 30,
          label: {
            show: true,
            position: 'right',
            formatter: '{c}',
            fontSize: 11,
            fontWeight: 'bold'
          },
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowColor: 'rgba(0, 0, 0, 0.3)'
            }
          }
        }]
      });
    }

    // LOCALIZAÇÕES - MELHORADO
    if (locationAnalysisRef.current) {
      echarts.dispose(locationAnalysisRef.current);
      const chart = echarts.init(locationAnalysisRef.current);

      chart.setOption({
        title: {
          text: 'Top 10 Localizações',
          left: 'center',
          top: 10,
          textStyle: { fontSize: 16, fontWeight: 'bold' }
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: { type: 'shadow' }
        },
        legend: {
          data: ['Total', t('predictiveCertificateAnalysis.status.expired'), t('predictiveCertificateAnalysis.calendar.expiringSoon')],
          bottom: 10,
          type: 'scroll'
        },
        grid: {
          left: '5%',
          right: '5%',
          top: '15%',
          bottom: '20%',
          containLabel: true
        },
        xAxis: {
          type: 'category',
          data: data.locationAnalysis.map(l => l.name),
          axisLabel: {
            interval: 0,
            rotate: 35,
            fontSize: 10,
            overflow: 'truncate',
            width: 80
          }
        },
        yAxis: {
          type: 'value',
          nameTextStyle: {
            fontSize: 12
          },
          axisLabel: {
            fontSize: 11
          }
        },
        series: [
          {
            name: 'Total',
            type: 'bar',
            data: data.locationAnalysis.map(l => l.total),
            itemStyle: { color: '#3b82f6' },
            barMaxWidth: 40
          },
          {
            name: t('predictiveCertificateAnalysis.status.expired'),
            type: 'bar',
            data: data.locationAnalysis.map(l => l.expired),
            itemStyle: { color: '#ef4444' },
            barMaxWidth: 40
          },
          {
            name: t('predictiveCertificateAnalysis.calendar.expiringSoon'),
            type: 'bar',
            data: data.locationAnalysis.map(l => l.expiringSoon),
            itemStyle: { color: '#f59e0b' },
            barMaxWidth: 40
          }
        ]
      });
    }
  };

  // Efeito para criar gráficos quando a tab muda
  useEffect(() => {
    if (loading || !data) return;

    setTimeout(() => {
      if (activeTab === 'overview') {
        createOverviewCharts();
      } else if (activeTab === 'predictability') {
        createPredictabilityCharts();
      } else if (activeTab === 'observability') {
        createObservabilityCharts();
      }
    }, 100);

    return () => {
      [riskDistributionRef, renewalForecastRef, departmentRiskRef, complexityMatrixRef,
        validityStatusRef, automationReadinessRef, concurrentRenewalsRef, strategicImportanceRef,
        certificateTypeRef, brandAnalysisRef, locationAnalysisRef
      ].forEach(ref => {
        if (ref.current) {
          echarts.dispose(ref.current);
        }
      });
    };
  }, [data, loading, activeTab]);

  // ============= RENDERIZAÇÃO =============

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">{t('predictiveCertificateAnalysis.loading')}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6 flex items-center justify-center">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
          <p className="text-red-800 font-semibold mb-2">{t('predictiveCertificateAnalysis.error')}</p>
          <p className="text-red-600 text-sm">{error.message}</p>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const tabs = [
    { key: 'overview', translation: t('predictiveCertificateAnalysis.tabs.overview') },
    { key: 'predictability', translation: t('predictiveCertificateAnalysis.tabs.predictability') },
    { key: 'observability', translation: t('predictiveCertificateAnalysis.tabs.observability') },
    { key: 'map', translation: 'Mapa' },
    { key: 'calendar', translation: t('predictiveCertificateAnalysis.tabs.calendar') },
    { key: 'report', translation: t('predictiveCertificateAnalysis.tabs.report') }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      {/* HEADER */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-slate-800 mb-2">
              🎯 {t('predictiveCertificateAnalysis.title')}
            </h1>
            <p className="text-slate-600">
              {t('predictiveCertificateAnalysis.subtitle', { total: data.analytics.totalCertificates.toLocaleString() })}
            </p>
          </div>

          <div className="flex items-center gap-4">
            
            <div className="text-right">
              <div className="text-sm text-slate-500">Last Update</div>
              <div className="text-lg font-semibold text-slate-700">
                {new Date(data.generatedAt).toLocaleString('pt-BR')}
              </div>
              <div className="text-xs text-green-600 flex items-center justify-end gap-1 mt-1">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                {data.dataFreshness}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* KPIs PRINCIPAIS - ATUALIZADOS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4 mb-8">
        {/* Total */}
        <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500 hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-600 text-sm font-medium">TOTAL</p>
              <p className="text-3xl font-bold text-slate-800 mt-2">{data.analytics.totalCertificates.toLocaleString()}</p>
              <p className="text-xs text-slate-500 mt-1">Certificates</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Expired */}
        <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-red-500 hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-600 text-sm font-medium">{t('predictiveCertificateAnalysis.kpi.expiredCertificates').toUpperCase()}</p>
              <p className="text-3xl font-bold text-red-600 mt-2">{data.analytics.expiredCertificates.toLocaleString()}</p>
              <p className="text-red-500 text-xs mt-1">
                {t('predictiveCertificateAnalysis.kpi.ofTotal', {
                  percentage: ((data.analytics.expiredCertificates / data.analytics.totalCertificates) * 100).toFixed(1)
                })}
              </p>
            </div>
            <div className="bg-red-100 p-3 rounded-full">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
          </div>
        </div>

        {/* High Risk */}
        <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-orange-500 hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-600 text-sm font-medium">{t('predictiveCertificateAnalysis.kpi.highRiskItems').toUpperCase()}</p>
              <p className="text-3xl font-bold text-orange-600 mt-2">{data.analytics.highRisk.toLocaleString()}</p>
              <p className="text-orange-500 text-xs mt-1">
                {t('predictiveCertificateAnalysis.kpi.ofTotal', {
                  percentage: ((data.analytics.highRisk / data.analytics.totalCertificates) * 100).toFixed(1)
                })}
              </p>
            </div>
            <div className="bg-orange-100 p-3 rounded-full">
              <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Urgent Actions */}
        <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-purple-500 hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-600 text-sm font-medium">{t('predictiveCertificateAnalysis.kpi.urgentRiskItems').toUpperCase()}</p>
              <p className="text-3xl font-bold text-purple-600 mt-2">{data.analytics.urgentActions.toLocaleString()}</p>
              <p className="text-xs text-slate-500 mt-1">{t('predictiveCertificateAnalysis.kpi.actionsRequired')}</p>
            </div>
            <div className="bg-purple-100 p-3 rounded-full">
              <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Financial Risk */}
        <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500 hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-600 text-sm font-medium">{t('predictiveCertificateAnalysis.kpi.financialRisk').toUpperCase()}</p>
              <p className="text-2xl font-bold text-slate-800 mt-2">R$ {(data.analytics.totalFinancialRisk / 1000).toFixed(1)}k</p>
              <p className="text-xs text-slate-500 mt-1">{t('predictiveCertificateAnalysis.kpi.TotalAtRisk')}</p>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Compliance */}
        <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-indigo-500 hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-600 text-sm font-medium">{t('predictiveCertificateAnalysis.kpi.compliance').toUpperCase()}</p>
              <p className="text-3xl font-bold text-indigo-600 mt-2">{data.analytics.averageComplianceScore.toFixed(0)}%</p>
              <p className="text-xs text-slate-500 mt-1">{t('predictiveCertificateAnalysis.kpi.averageScore')}</p>
            </div>
            <div className="bg-indigo-100 p-3 rounded-full">
              <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* KPIs DE OBSERVABILIDADE */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
          <div className="flex items-center space-x-2 mb-4">
            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <h3 className="font-semibold text-slate-800">{t('predictiveCertificateAnalysis.kpi.dataQuality')}</h3>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-600">{t('predictiveCertificateAnalysis.kpi.completeness')}:</span>
              <span className="font-bold text-blue-600">{data.observabilityKPIs.dataQuality.completenessScore.toFixed(1)}%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-600">{t('predictiveCertificateAnalysis.kpi.complete')}:</span>
              <span className="font-medium text-green-600">{data.observabilityKPIs.dataQuality.recordsWithCompleteData}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-600">{t('predictiveCertificateAnalysis.kpi.incomplete')}:</span>
              <span className="font-medium text-orange-600">{data.observabilityKPIs.dataQuality.recordsWithIncompleteData}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
          <div className="flex items-center space-x-2 mb-4">
            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="font-semibold text-slate-800">{t('predictiveCertificateAnalysis.kpi.processHealth')}</h3>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-600">{t('predictiveCertificateAnalysis.kpi.onTime')}:</span>
              <span className="font-medium text-green-600">{data.observabilityKPIs.processHealth.onTimeRenewals}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-600">{t('predictiveCertificateAnalysis.kpi.delayed')}:</span>
              <span className="font-medium text-red-600">{data.observabilityKPIs.processHealth.delayedRenewals}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-600">{t('predictiveCertificateAnalysis.kpi.avgTime')}:</span>
              <span className="font-medium text-slate-800">{t('predictiveCertificateAnalysis.kpi.days', { days: data.observabilityKPIs.processHealth.avgProcessingTime.toFixed(0) })}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
          <div className="flex items-center space-x-2 mb-4">
            <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
            <h3 className="font-semibold text-slate-800">{t('predictiveCertificateAnalysis.kpi.predictability')}</h3>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-600">{t('predictiveCertificateAnalysis.kpi.high')}:</span>
              <span className="font-medium text-green-600">{data.observabilityKPIs.predictability.highPredictability}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-600">{t('predictiveCertificateAnalysis.kpi.medium')}:</span>
              <span className="font-medium text-yellow-600">{data.observabilityKPIs.predictability.mediumPredictability}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-600">{t('predictiveCertificateAnalysis.kpi.avgScore')}:</span>
              <span className="font-bold text-purple-600">{data.observabilityKPIs.predictability.avgPredictabilityScore.toFixed(1)}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* ANOMALIAS ALERT */}
      {data.analytics.anomaliesDetected > 0 && (
        <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-xl shadow-lg p-6 mb-8 border-l-4 border-red-500">
          <div className="flex items-center space-x-3">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div>
              <h3 className="text-lg font-bold text-red-800">{t('predictiveCertificateAnalysis.kpi.anomaliesDetected')}</h3>
              <p className="text-sm text-red-700 mt-1">
                {t('predictiveCertificateAnalysis.kpi.unusualPatternsIdentified', { total: data.analytics.anomaliesDetected, score: data.analytics.averageAnomalyScore })}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TABS */}
      <div className="mb-6">
        <div className="border-b border-slate-200 overflow-x-auto">
          <nav className="flex space-x-8">
            {tabs.map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === tab.key
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                  }`}
              >
                {tab.translation}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* TAB CONTENT - OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Primeira linha - 2 gráficos maiores */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div ref={riskDistributionRef} className="w-full" style={{ height: '400px' }}></div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <div ref={validityStatusRef} className="w-full" style={{ height: '400px' }}></div>
            </div>
          </div>

          {/* Segunda linha - Departamento (full width) */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div ref={departmentRiskRef} className="w-full" style={{ height: '450px' }}></div>
          </div>

          {/* Terceira linha - Matriz de Complexidade */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div ref={complexityMatrixRef} className="w-full" style={{ height: '400px' }}></div>
            </div>

            {/* Espaço para adicionar outro gráfico ou métricas */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-slate-800 mb-4">Métricas Adicionais</h3>
              <div className="space-y-4">
                <div className="p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg">
                  <p className="text-sm text-slate-600">Score Médio de Renovação</p>
                  <p className="text-3xl font-bold text-blue-600">{data.analytics.averageRenewalScore.toFixed(1)}%</p>
                </div>

                <div className="p-4 bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg">
                  <p className="text-sm text-slate-600">Score Médio de Compliance</p>
                  <p className="text-3xl font-bold text-purple-600">{data.analytics.averageComplianceScore.toFixed(1)}%</p>
                </div>

                <div className="p-4 bg-gradient-to-r from-orange-50 to-orange-100 rounded-lg">
                  <p className="text-sm text-slate-600">Risco Médio de Expiração</p>
                  <p className="text-3xl font-bold text-orange-600">{data.analytics.averageExpirationRisk.toFixed(1)}%</p>
                </div>

                <div className="p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-lg">
                  <p className="text-sm text-slate-600">Complexidade Média</p>
                  <p className="text-3xl font-bold text-green-600">{data.analytics.averageComplexityScore.toFixed(1)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT - PREDICTABILITY */}
      {activeTab === 'predictability' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div ref={renewalForecastRef} className="w-full h-96"></div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div ref={automationReadinessRef} className="w-full h-80"></div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <div ref={concurrentRenewalsRef} className="w-full h-80"></div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <div ref={strategicImportanceRef} className="w-full h-80"></div>
            </div>
          </div>

          {/* Insights de Previsibilidade */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h4 className="text-md font-semibold text-slate-800 mb-4">{t('predictiveCertificateAnalysis.trends.predictedOutcomes')}</h4>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-slate-50 rounded">
                  <span className="text-sm text-slate-700">{t('predictiveCertificateAnalysis.trends.renewalSuccessRate')}</span>
                  <span className="text-sm font-bold text-green-600">{data.analytics.averageRenewalScore.toFixed(1)}%</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-slate-50 rounded">
                  <span className="text-sm text-slate-700">{t('predictiveCertificateAnalysis.trends.automationCandidates')}</span>
                  <span className="text-sm font-bold text-blue-600">{data.automationReadiness.high}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-slate-50 rounded">
                  <span className="text-sm text-slate-700">Max Concurrent</span>
                  <span className="text-sm font-bold text-purple-600">{data.concurrentRenewalsAnalysis.maxConcurrent}</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <h4 className="text-md font-semibold text-slate-800 mb-4">{t('predictiveCertificateAnalysis.kpi.automationReadiness')}</h4>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-green-50 rounded">
                  <span className="text-sm text-slate-700">{t('predictiveCertificateAnalysis.kpi.highReadiness')}</span>
                  <span className="text-sm font-bold text-green-600">{data.automationReadiness.high}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-yellow-50 rounded">
                  <span className="text-sm text-slate-700">{t('predictiveCertificateAnalysis.kpi.mediumReadiness')}</span>
                  <span className="text-sm font-bold text-yellow-600">{data.automationReadiness.medium}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-red-50 rounded">
                  <span className="text-sm text-slate-700">{t('predictiveCertificateAnalysis.kpi.lowReadiness')}</span>
                  <span className="text-sm font-bold text-red-600">{data.automationReadiness.low}</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <h4 className="text-md font-semibold text-slate-800 mb-4">{t('predictiveCertificateAnalysis.charts.strategicDistribution')}</h4>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-red-50 rounded">
                  <span className="text-sm text-slate-700">{t('predictiveCertificateAnalysis.kpi.critical')}</span>
                  <span className="text-sm font-bold text-red-600">{data.strategicDistribution.critical}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-orange-50 rounded">
                  <span className="text-sm text-slate-700">{t('predictiveCertificateAnalysis.kpi.high')}</span>
                  <span className="text-sm font-bold text-orange-600">{data.strategicDistribution.high}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-blue-50 rounded">
                  <span className="text-sm text-slate-700">{t('predictiveCertificateAnalysis.kpi.standard')}</span>
                  <span className="text-sm font-bold text-blue-600">{data.strategicDistribution.standard}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'map' && (
        <CertificateMap companyId={companyId} />
      )}

      {/* TAB CONTENT - OBSERVABILITY */}
      {activeTab === 'observability' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div ref={certificateTypeRef} className="w-full h-80"></div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <div ref={brandAnalysisRef} className="w-full h-80"></div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 lg:col-span-2">
              <div ref={locationAnalysisRef} className="w-full h-80"></div>
            </div>
          </div>

          {/* Tabela de Custódia */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">{t('predictiveCertificateAnalysis.kpi.custodyAnalysis')}</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">{t('predictiveCertificateAnalysis.kpi.responsible')}</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">{t('predictiveCertificateAnalysis.kpi.email')}</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-slate-500 uppercase">Total</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-slate-500 uppercase">{t('predictiveCertificateAnalysis.status.expired')}</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-slate-500 uppercase">{t('predictiveCertificateAnalysis.calendar.expiring')}</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-slate-500 uppercase">{t('predictiveCertificateAnalysis.kpi.urgentActions')}</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200">
                  {data.custodyAnalysis.slice(0, 10).map((custody, index) => (
                    <tr key={index} className="hover:bg-slate-50">
                      <td className="px-4 py-3 text-sm font-medium text-slate-800">{custody.name}</td>
                      <td className="px-4 py-3 text-sm text-slate-600">{custody.email || 'N/A'}</td>
                      <td className="px-4 py-3 text-sm text-center font-medium">{custody.total}</td>
                      <td className="px-4 py-3 text-sm text-center text-red-600">{custody.expired}</td>
                      <td className="px-4 py-3 text-sm text-center text-orange-600">{custody.expiringSoon}</td>
                      <td className="px-4 py-3 text-sm text-center">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${custody.urgentActions > 5
                          ? 'bg-red-100 text-red-800'
                          : custody.urgentActions > 0
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-green-100 text-green-800'
                          }`}>
                          {custody.urgentActions}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT - CALENDAR */}
      {activeTab === 'calendar' && (
        <div className="grid grid-cols-1 gap-6">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
              <h3 className="text-lg font-semibold text-slate-800">
                {t('predictiveCertificateAnalysis.calendar.certificateExpirationCalendar')}
              </h3>

              <div className="flex gap-2">
                <button
                  onClick={() => changeCalendarView('day')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${calendarView === 'day'
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                >
                  {t('predictiveCertificateAnalysis.calendar.day')}
                </button>
                <button
                  onClick={() => changeCalendarView('week')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${calendarView === 'week'
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                >
                  {t('predictiveCertificateAnalysis.calendar.week')}
                </button>
                <button
                  onClick={() => changeCalendarView('month')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${calendarView === 'month'
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                >
                  {t('predictiveCertificateAnalysis.calendar.month')}
                </button>
                <button
                  onClick={() => changeCalendarView('year')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${calendarView === 'year'
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                >
                  {t('predictiveCertificateAnalysis.calendar.year')}
                </button>
              </div>
            </div>

            <div className="flex flex-wrap gap-4 mb-6">
              <button
                onClick={() => handleLegendClick('expired')}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${selectedFilter === 'expired'
                  ? 'bg-red-100 ring-2 ring-red-500'
                  : 'hover:bg-slate-50'
                  }`}
              >
                <div className="w-4 h-4 rounded bg-red-500"></div>
                <span className="text-sm text-slate-600 font-medium">{t('predictiveCertificateAnalysis.calendar.expired')}</span>
              </button>

              <button
                onClick={() => handleLegendClick('expiring-soon')}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${selectedFilter === 'expiring-soon'
                  ? 'bg-orange-100 ring-2 ring-orange-500'
                  : 'hover:bg-slate-50'
                  }`}
              >
                <div className="w-4 h-4 rounded bg-orange-500"></div>
                <span className="text-sm text-slate-600 font-medium">{t('predictiveCertificateAnalysis.calendar.expiringSoon')}</span>
              </button>

              <button
                onClick={() => handleLegendClick('expiring')}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${selectedFilter === 'expiring'
                  ? 'bg-yellow-100 ring-2 ring-yellow-400'
                  : 'hover:bg-slate-50'
                  }`}
              >
                <div className="w-4 h-4 rounded bg-yellow-400"></div>
                <span className="text-sm text-slate-600 font-medium">{t('predictiveCertificateAnalysis.calendar.expiring')}</span>
              </button>

              <button
                onClick={() => handleLegendClick('valid')}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${selectedFilter === 'valid'
                  ? 'bg-green-100 ring-2 ring-green-500'
                  : 'hover:bg-slate-50'
                  }`}
              >
                <div className="w-4 h-4 rounded bg-green-500"></div>
                <span className="text-sm text-slate-600 font-medium">{t('predictiveCertificateAnalysis.calendar.valid')}</span>
              </button>

              {selectedFilter && (
                <button
                  onClick={() => {
                    setSelectedFilter(null);
                    setShowFilteredList(false);
                  }}
                  className="ml-auto px-4 py-2 bg-slate-700 text-white rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors"
                >
                  {t('predictiveCertificateAnalysis.calendar.clearFilter')}
                </button>
              )}
            </div>

            <div className="calendar-container">
              <FullCalendar
                ref={calendarRef}
                plugins={[dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin]}
                initialView="dayGridMonth"
                headerToolbar={{
                  left: 'prev,next today',
                  center: 'title',
                  right: 'dayGridMonth,timeGridWeek,timeGridDay,listMonth'
                }}
                events={getFilteredEvents()}
                eventClick={handleEventClick}
                height="auto"
                editable={false}
                selectable={true}
                selectMirror={true}
                dayMaxEvents={true}
                weekends={true}
                eventTimeFormat={{
                  hour: '2-digit',
                  minute: '2-digit',
                  meridiem: false
                }}
              />
            </div>
          </div>

          {showFilteredList && selectedFilter && (
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-slate-800">
                  {getFilterLabel(selectedFilter)} ({getFilteredEvents().length})
                </h3>
                <button
                  onClick={() => setShowFilteredList(false)}
                  className="text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">{t('predictiveCertificateAnalysis.table.certificate')}</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">{t('predictiveCertificateAnalysis.table.department')}</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Location</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">{t('predictiveCertificateAnalysis.table.expirationDate')}</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">{t('predictiveCertificateAnalysis.table.daysToExpiration')}</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Risk</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {getFilteredEvents().map((event) => (
                      <tr key={event.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-4 py-3 text-sm text-slate-800 font-medium">{event.title}</td>
                        <td className="px-4 py-3 text-sm text-slate-600">{event.extendedProps?.department || 'N/A'}</td>
                        <td className="px-4 py-3 text-sm text-slate-600">{event.extendedProps?.location || 'N/A'}</td>
                        <td className="px-4 py-3 text-sm text-slate-600">{new Date(event.start).toLocaleDateString('pt-BR')}</td>
                        <td className="px-4 py-3 text-sm">
                          <span className={`font-semibold ${event.extendedProps?.daysToExpiration < 0 ? 'text-red-600' :
                            event.extendedProps?.daysToExpiration <= 30 ? 'text-orange-600' :
                              event.extendedProps?.daysToExpiration <= 90 ? 'text-yellow-600' : 'text-green-600'
                            }`}>
                            {event.extendedProps?.daysToExpiration}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${event.extendedProps?.riskLevel === 'HIGH' ? 'bg-red-100 text-red-800' :
                            event.extendedProps?.riskLevel === 'MEDIUM' ? 'bg-orange-100 text-orange-800' : 'bg-green-100 text-green-800'
                            }`}>
                            {event.extendedProps?.riskLevel || 'N/A'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <span className="text-xs text-slate-600">{event.extendedProps?.recommendedAction || 'N/A'}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h4 className="text-sm font-medium text-slate-600 mb-2">{t('predictiveCertificateAnalysis.calendar.thisWeek')}</h4>
              <p className="text-3xl font-bold text-slate-800">
                {data.calendarEvents?.filter((e: any) => {
                  const eventDate = new Date(e.start);
                  const now = new Date();
                  const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
                  return eventDate >= now && eventDate <= weekFromNow;
                }).length || 0}
              </p>
              <p className="text-xs text-slate-500 mt-1">{t('predictiveCertificateAnalysis.calendar.certificatesExpiring')}</p>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <h4 className="text-sm font-medium text-slate-600 mb-2">{t('predictiveCertificateAnalysis.calendar.thisMonth')}</h4>
              <p className="text-3xl font-bold text-slate-800">
                {data.analytics.expiringSoon}
              </p>
              <p className="text-xs text-slate-500 mt-1">{t('predictiveCertificateAnalysis.calendar.certificatesExpiring')}</p>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <h4 className="text-sm font-medium text-slate-600 mb-2">{t('predictiveCertificateAnalysis.calendar.next90Days')}</h4>
              <p className="text-3xl font-bold text-slate-800">{data.analytics.expiring90Days}</p>
              <p className="text-xs text-slate-500 mt-1">{t('predictiveCertificateAnalysis.calendar.certificatesExpiring')}</p>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <h4 className="text-sm font-medium text-slate-600 mb-2">{t('predictiveCertificateAnalysis.calendar.alreadyExpired')}</h4>
              <p className="text-3xl font-bold text-red-600">{data.analytics.expiredCertificates}</p>
              <p className="text-xs text-slate-500 mt-1">{t('predictiveCertificateAnalysis.calendar.needsImmediateAction')}</p>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT - REPORT */}
      {activeTab === 'report' && (
        <div className="mb-1">
          <CertificateReportGrid />
        </div>
      )}

      {/* QUICK STATS FOOTER */}
      <div className="mt-8 bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-slate-800 mb-4">{t('predictiveCertificateAnalysis.quickStats.quickStatistics')}</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          <div className="text-center p-4 bg-slate-50 rounded-lg">
            <p className="text-2xl font-bold text-slate-800">{data.analytics.totalCertificates}</p>
            <p className="text-sm text-slate-600">Total</p>
          </div>
          <div className="text-center p-4 bg-slate-50 rounded-lg">
            <p className="text-2xl font-bold text-slate-800">{data.certificateTypeAnalysis.length}</p>
            <p className="text-sm text-slate-600">{t('predictiveCertificateAnalysis.quickStats.certificateTypes')}</p>
          </div>
          <div className="text-center p-4 bg-slate-50 rounded-lg">
            <p className="text-2xl font-bold text-slate-800">{data.departmentRiskAnalysis.length}</p>
            <p className="text-sm text-slate-600">{t('predictiveCertificateAnalysis.quickStats.departments')}</p>
          </div>
          <div className="text-center p-4 bg-slate-50 rounded-lg">
            <p className="text-2xl font-bold text-slate-800">{data.brandAnalysis.length}</p>
            <p className="text-sm text-slate-600">Brands</p>
          </div>
          <div className="text-center p-4 bg-slate-50 rounded-lg">
            <p className="text-2xl font-bold text-slate-800">{data.locationAnalysis.length}</p>
            <p className="text-sm text-slate-600">Locations</p>
          </div>
          <div className="text-center p-4 bg-slate-50 rounded-lg">
            <p className="text-2xl font-bold text-slate-800">{data.custodyAnalysis.length}</p>
            <p className="text-sm text-slate-600">Custodians</p>
          </div>
        </div>
      </div>
    </div>
  );
}