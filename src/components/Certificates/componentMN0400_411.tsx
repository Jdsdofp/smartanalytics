import { useEffect, useRef, useState } from 'react';
import * as echarts from 'echarts';

import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import listPlugin from '@fullcalendar/list';
import interactionPlugin from '@fullcalendar/interaction';

// import '../../../fullcalendar-custom.css';

interface ProcessedData {
  total: number;
  expired: number;
  approved: number;
  expiring90Days: number;
  expiringSoon: number;
  highRisk: number;
  mediumRisk: number;
  lowRisk: number;
  totalFinancialRisk: number;
  avgRenewalProbability: number;
  departments: Array<{ name: string; count: number; expired: number }>;
  certificateTypes: Array<{ name: string; count: number; expired: number }>;
  expirationByMonth: { [key: number]: any };
  daysToExpirationRanges: any;
  renewalTrend: {
    urgent: number[];
    planned: number[];
    future: number[];
  };
  calendarEvents: Array<{
    id: string;
    title: string;
    start: string;
    color: string;
    extendedProps: any;
  }>;
}

interface ApiResponse {
  analytics: any;
  statusData: any[];
  riskData: any[];
  brandsData: any[];
  trendsData: any[];
  expirationByMonth: any;
  departments: any[];
  certificateTypes: any[];
  daysToExpirationRanges: any;
  renewalTrend: {
    urgent: number[];
    planned: number[];
    future: number[];
  };
  calendarEvents: Array<any>;
  processedData: ProcessedData;
}

export default function PredictiveCertificateAnalysis() {
  const company_id = sessionStorage.getItem('companyData') ? JSON.parse(sessionStorage.getItem('companyData') || '{}') : null;
  const companyId = company_id?.details?.company_id;
  
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [data, setData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [calendarView, setCalendarView] = useState<'month' | 'week' | 'day' | 'year'>('month');
  const [selectedFilter, setSelectedFilter] = useState<string | null>(null);
  const [showFilteredList, setShowFilteredList] = useState(false);

  // Chart refs
  const statusChartRef = useRef<HTMLDivElement>(null);
  const riskChartRef = useRef<HTMLDivElement>(null);
  const timelineChartRef = useRef<HTMLDivElement>(null);
  const departmentChartRef = useRef<HTMLDivElement>(null);
  const costChartRef = useRef<HTMLDivElement>(null);
  const expirationChartRef = useRef<HTMLDivElement>(null);
  const issuerChartRef = useRef<HTMLDivElement>(null);
  const trendChartRef = useRef<HTMLDivElement>(null);
  const calendarRef = useRef<any>(null);

  // Fetch data from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch(`https://api-dashboards-u1oh.onrender.com/api/dashboard/certificates/${companyId}`);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        setData(result);

        console.log('API Response:', result);
        console.log('Calendar Events:', result?.processedData?.calendarEvents);
        console.log('Number of events:', result?.processedData?.calendarEvents?.length);
      } catch (err) {
        setError(err as Error);
        console.error('Error fetching analytics:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [companyId]);

  const certificateData = data?.processedData || null;

  // Função para lidar com clique no evento do calendário
  const handleEventClick = (clickInfo: any) => {
    const event = clickInfo.event;
    const props = event.extendedProps;
    
    alert(`
      Certificate: ${event.title}
      Status: ${props.status}
      Department: ${props.department}
      Brand: ${props.brand || 'N/A'}
      Days to Expiration: ${props.daysToExpiration}
      Risk Score: ${props.riskScore}
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
    if (!certificateData?.calendarEvents) return [];
    
    if (!selectedFilter) return certificateData.calendarEvents;

    return certificateData.calendarEvents.filter(event => {
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
          return status === 'approved' && daysToExpiration > 90;
        default:
          return true;
      }
    });
  };

  // Obter label do filtro
  const getFilterLabel = (filter: string | null) => {
    switch (filter) {
      case 'expired':
        return 'Expired Certificates';
      case 'expiring-soon':
        return 'Expiring Soon (0-30 days)';
      case 'expiring':
        return 'Expiring (31-90 days)';
      case 'valid':
        return 'Valid Certificates';
      default:
        return 'All Certificates';
    }
  };

  // Função para criar os gráficos da tab Overview
  const createOverviewCharts = () => {
    if (!data || !certificateData) return;

    // STATUS DISTRIBUTION CHART
    if (statusChartRef.current) {
      echarts.dispose(statusChartRef.current);
      const chart = echarts.init(statusChartRef.current);
      chart.setOption({
        tooltip: {
          trigger: 'item',
          formatter: '{b}: {c} ({d}%)'
        },
        legend: {
          bottom: '5%',
          left: 'center'
        },
        series: [{
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
              fontSize: 20,
              fontWeight: 'bold'
            }
          },
          data: data.statusData.map(item => ({
            value: item.value,
            name: item.name,
            itemStyle: {
              color: item.name === 'Expired' ? '#ef4444' 
                   : item.name === 'Approved' ? '#10b981' 
                   : '#f59e0b'
            }
          }))
        }]
      });
    }

    // RISK DISTRIBUTION CHART
    if (riskChartRef.current) {
      echarts.dispose(riskChartRef.current);
      const chart = echarts.init(riskChartRef.current);
      chart.setOption({
        tooltip: {
          trigger: 'axis',
          axisPointer: { type: 'shadow' }
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true
        },
        xAxis: {
          type: 'category',
          data: ['High Risk', 'Medium Risk', 'Low Risk'],
          axisLabel: { interval: 0, rotate: 0 }
        },
        yAxis: {
          type: 'value'
        },
        series: [{
          data: [
            { value: certificateData.highRisk, itemStyle: { color: '#ef4444' } },
            { value: certificateData.mediumRisk, itemStyle: { color: '#f59e0b' } },
            { value: certificateData.lowRisk, itemStyle: { color: '#10b981' } }
          ],
          type: 'bar',
          barWidth: '60%',
          label: {
            show: true,
            position: 'top',
            formatter: '{c}'
          }
        }]
      });
    }

    // EXPIRATION TIMELINE CHART
    if (timelineChartRef.current) {
      echarts.dispose(timelineChartRef.current);
      const chart = echarts.init(timelineChartRef.current);
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            
      const expirationByMonth = certificateData.expirationByMonth as Record<string, any>;

      const expiredData = months.map((_, i) => {
        const monthData = expirationByMonth[i.toString()] ?? expirationByMonth[String(i)];
        return monthData?.expired ?? 0;
      });

      const expiring0_30Data = months.map((_, i) => {
        const monthData = expirationByMonth[i.toString()] ?? expirationByMonth[String(i)];
        return monthData?.expiring_0_30 ?? 0;
      });

      const expiring31_90Data = months.map((_, i) => {
        const monthData = expirationByMonth[i.toString()] ?? expirationByMonth[String(i)];
        return monthData?.expiring_31_90 ?? 0;
      });

      const validData = months.map((_, i) => {
        const monthData = expirationByMonth[i.toString()] ?? expirationByMonth[String(i)];
        return monthData?.valid ?? 0;
      });

      chart.setOption({
        tooltip: {
          trigger: 'axis',
          axisPointer: { type: 'cross' }
        },
        legend: {
          data: ['Expired', 'Expiring 0-30 Days', 'Expiring 31-90 Days', 'Valid'],
          bottom: '5%'
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '15%',
          containLabel: true
        },
        xAxis: {
          type: 'category',
          data: months
        },
        yAxis: {
          type: 'value'
        },
        series: [
          {
            name: 'Expired',
            type: 'bar',
            stack: 'total',
            data: expiredData,
            itemStyle: { color: '#ef4444' }
          },
          {
            name: 'Expiring 0-30 Days',
            type: 'bar',
            stack: 'total',
            data: expiring0_30Data,
            itemStyle: { color: '#f97316' }
          },
          {
            name: 'Expiring 31-90 Days',
            type: 'bar',
            stack: 'total',
            data: expiring31_90Data,
            itemStyle: { color: '#fbbf24' }
          },
          {
            name: 'Valid',
            type: 'bar',
            stack: 'total',
            data: validData,
            itemStyle: { color: '#10b981' }
          }
        ]
      });
    }

    // DEPARTMENT PERFORMANCE CHART
    if (departmentChartRef.current) {
      echarts.dispose(departmentChartRef.current);
      const chart = echarts.init(departmentChartRef.current);
      chart.setOption({
        tooltip: {
          trigger: 'axis',
          axisPointer: { type: 'shadow' }
        },
        legend: {
          data: ['Total Certificates', 'Expired'],
          bottom: '5%'
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '15%',
          containLabel: true
        },
        xAxis: {
          type: 'category',
          data: certificateData.departments.map(d => d.name),
          axisLabel: { interval: 0, rotate: 30 }
        },
        yAxis: {
          type: 'value'
        },
        series: [
          {
            name: 'Total Certificates',
            type: 'bar',
            data: certificateData.departments.map(d => d.count),
            itemStyle: { color: '#3b82f6' }
          },
          {
            name: 'Expired',
            type: 'bar',
            data: certificateData.departments.map(d => d.expired),
            itemStyle: { color: '#ef4444' }
          }
        ]
      });
    }

    // FINANCIAL RISK CHART
    if (costChartRef.current) {
      echarts.dispose(costChartRef.current);
      const chart = echarts.init(costChartRef.current);
      chart.setOption({
        tooltip: {
          trigger: 'item',
          formatter: '{b}: ${c}'
        },
        series: [{
          type: 'treemap',
          data: [
            { 
              name: 'High Value Assets', 
              value: certificateData.totalFinancialRisk * 0.67, 
              itemStyle: { color: '#ef4444' } 
            },
            { 
              name: 'Medium Cost Items', 
              value: certificateData.totalFinancialRisk * 0.25, 
              itemStyle: { color: '#f59e0b' } 
            },
            { 
              name: 'Low Cost Items', 
              value: certificateData.totalFinancialRisk * 0.08, 
              itemStyle: { color: '#10b981' } 
            }
          ],
          label: {
            show: true,
            formatter: '{b}\n${c}'
          }
        }]
      });
    }
  };

  // Função para criar os gráficos da tab Risk Analysis
  const createRiskAnalysisCharts = () => {
    if (!data || !certificateData) return;

    // DAYS TO EXPIRATION DISTRIBUTION
    if (expirationChartRef.current) {
      echarts.dispose(expirationChartRef.current);
      const chart = echarts.init(expirationChartRef.current);
      const ranges = certificateData.daysToExpirationRanges;
      
      chart.setOption({
        tooltip: {
          trigger: 'axis'
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true
        },
        xAxis: {
          type: 'category',
          data: ['< -200', '-200 to -100', '-100 to -50', '-50 to 0', '0 to 50', '50 to 100', '> 100'],
          axisLabel: { rotate: 30 }
        },
        yAxis: {
          type: 'value',
          name: 'Count'
        },
        series: [{
          data: [
            ranges.under_minus_200,
            ranges.minus_200_to_minus_100,
            ranges.minus_100_to_minus_50,
            ranges.minus_50_to_0,
            ranges.zero_to_50,
            ranges.range_50_to_100,
            ranges.over_100
          ],
          type: 'line',
          smooth: true,
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: 'rgba(59, 130, 246, 0.5)' },
              { offset: 1, color: 'rgba(59, 130, 246, 0.1)' }
            ])
          },
          itemStyle: { color: '#3b82f6' }
        }]
      });
    }

    // BRAND RELIABILITY
    if (issuerChartRef.current && data.brandsData.length > 0) {
      echarts.dispose(issuerChartRef.current);
      const chart = echarts.init(issuerChartRef.current);
      chart.setOption({
        tooltip: {
          trigger: 'axis',
          axisPointer: { type: 'shadow' }
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true
        },
        xAxis: {
          type: 'value',
          max: 100
        },
        yAxis: {
          type: 'category',
          data: data.brandsData.map(b => b.name)
        },
        series: [{
          type: 'bar',
          data: data.brandsData.map((_, index) => 90 - (index * 3)),
          itemStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
              { offset: 0, color: '#10b981' },
              { offset: 1, color: '#3b82f6' }
            ])
          },
          label: {
            show: true,
            position: 'right',
            formatter: '{c}%'
          }
        }]
      });
    }
  };

  // Função para criar os gráficos da tab Trends
  const createTrendsCharts = () => {
    if (!data || !certificateData) return;

    // RENEWAL URGENCY TREND
    if (trendChartRef.current) {
      echarts.dispose(trendChartRef.current);
      const chart = echarts.init(trendChartRef.current);
      
      const hasRenewalData = certificateData.renewalTrend && 
                             certificateData.renewalTrend.urgent.length > 0;

      const urgentData = hasRenewalData 
        ? certificateData.renewalTrend.urgent 
        : [certificateData.expired, certificateData.expired, certificateData.expired, 
           certificateData.expired, certificateData.expired, certificateData.expired];
      
      const plannedData = hasRenewalData 
        ? certificateData.renewalTrend.planned 
        : [certificateData.expiring90Days, certificateData.expiring90Days, 
           certificateData.expiring90Days, certificateData.expiring90Days, 
           certificateData.expiring90Days, certificateData.expiring90Days];
      
      const futureData = hasRenewalData 
        ? certificateData.renewalTrend.future 
        : [certificateData.approved, certificateData.approved, certificateData.approved, 
           certificateData.approved, certificateData.approved, certificateData.approved];

      chart.setOption({
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'cross',
            label: {
              backgroundColor: '#6a7985'
            }
          }
        },
        legend: {
          data: ['Urgent Renewals', 'Planned Renewals', 'Future Renewals'],
          bottom: '5%'
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '15%',
          containLabel: true
        },
        xAxis: {
          type: 'category',
          boundaryGap: false,
          data: ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5', 'Week 6']
        },
        yAxis: {
          type: 'value'
        },
        series: [
          {
            name: 'Urgent Renewals',
            type: 'line',
            data: urgentData,
            itemStyle: { color: '#ef4444' },
            areaStyle: { 
              opacity: 0.3,
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: 'rgba(239, 68, 68, 0.5)' },
                { offset: 1, color: 'rgba(239, 68, 68, 0.1)' }
              ])
            },
            emphasis: {
              focus: 'series'
            },
            smooth: true
          },
          {
            name: 'Planned Renewals',
            type: 'line',
            data: plannedData,
            itemStyle: { color: '#f59e0b' },
            areaStyle: { 
              opacity: 0.3,
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: 'rgba(245, 158, 11, 0.5)' },
                { offset: 1, color: 'rgba(245, 158, 11, 0.1)' }
              ])
            },
            emphasis: {
              focus: 'series'
            },
            smooth: true
          },
          {
            name: 'Future Renewals',
            type: 'line',
            data: futureData,
            itemStyle: { color: '#10b981' },
            areaStyle: { 
              opacity: 0.3,
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: 'rgba(16, 185, 129, 0.5)' },
                { offset: 1, color: 'rgba(16, 185, 129, 0.1)' }
              ])
            },
            emphasis: {
              focus: 'series'
            },
            smooth: true
          }
        ]
      });
    }
  };

  // Efeito para criar gráficos quando a tab muda
  useEffect(() => {
    if (loading || !data || !certificateData) return;

    setTimeout(() => {
      if (activeTab === 'overview') {
        createOverviewCharts();
      } else if (activeTab === 'risk-analysis') {
        createRiskAnalysisCharts();
      } else if (activeTab === 'trends') {
        createTrendsCharts();
      }
    }, 100);

    return () => {
      [statusChartRef, riskChartRef, timelineChartRef, departmentChartRef, 
       costChartRef, expirationChartRef, issuerChartRef, trendChartRef
      ].forEach(ref => {
        if (ref.current) {
          echarts.dispose(ref.current);
        }
      });
    };
  }, [data, loading, certificateData, activeTab]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading certificate data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6 flex items-center justify-center">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
          <p className="text-red-800 font-semibold mb-2">Error loading data</p>
          <p className="text-red-600 text-sm">{error.message}</p>
        </div>
      </div>
    );
  }

  if (!certificateData) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-slate-800 mb-2">Certificate Management Analytics</h1>
        <p className="text-slate-600">Predictive analysis for {certificateData.total.toLocaleString()} certificates</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-red-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-600 text-sm font-medium">Expired Certificates</p>
              <p className="text-3xl font-bold text-slate-800 mt-2">{certificateData.expired.toLocaleString()}</p>
              <p className="text-red-600 text-xs mt-1">{((certificateData.expired/certificateData.total)*100).toFixed(1)}% of Total</p>
            </div>
            <div className="bg-red-100 p-3 rounded-full">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-600 text-sm font-medium">Valid Certificates</p>
              <p className="text-3xl font-bold text-slate-800 mt-2">{certificateData.approved.toLocaleString()}</p>
              <p className="text-green-600 text-xs mt-1">{((certificateData.approved/certificateData.total)*100).toFixed(1)}% of Total</p>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-orange-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-600 text-sm font-medium">High Risk Items</p>
              <p className="text-3xl font-bold text-slate-800 mt-2">{certificateData.highRisk.toLocaleString()}</p>
              <p className="text-orange-600 text-xs mt-1">{((certificateData.highRisk/certificateData.total)*100).toFixed(1)}% of Total</p>
            </div>
            <div className="bg-orange-100 p-3 rounded-full">
              <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-600 text-sm font-medium">Financial Risk</p>
              <p className="text-3xl font-bold text-slate-800 mt-2">${(certificateData.totalFinancialRisk/1000).toFixed(0)}K</p>
              <p className="text-blue-600 text-xs mt-1">Assets at Risk</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      <div className="mb-6">
        <div className="border-b border-slate-200">
          <nav className="flex space-x-8">
            {['overview', 'risk-analysis', 'trends', 'calendar'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                }`}
              >
                {tab.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">Certificate Status Distribution</h3>
            <div ref={statusChartRef} className="w-full h-80"></div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">Risk Level Distribution</h3>
            <div ref={riskChartRef} className="w-full h-80"></div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 lg:col-span-2">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">Expiration Timeline by Month</h3>
            <div ref={timelineChartRef} className="w-full h-80"></div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">Department Performance</h3>
            <div ref={departmentChartRef} className="w-full h-80"></div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">Financial Risk by Category</h3>
            <div ref={costChartRef} className="w-full h-80"></div>
          </div>
        </div>
      )}

      {activeTab === 'risk-analysis' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-lg p-6 lg:col-span-2">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">Days Until Expiration Distribution</h3>
            <div ref={expirationChartRef} className="w-full h-80"></div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">Brand Reliability Scores</h3>
            <div ref={issuerChartRef} className="w-full h-80"></div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">Critical Insights</h3>
            <div className="space-y-4">
              <div className="p-4 bg-red-50 border-l-4 border-red-500 rounded">
                <p className="text-sm font-semibold text-red-800">Critical Alert</p>
                <p className="text-sm text-red-700 mt-1">{certificateData.expired.toLocaleString()} certificates are expired and require immediate renewal</p>
              </div>
              <div className="p-4 bg-orange-50 border-l-4 border-orange-500 rounded">
                <p className="text-sm font-semibold text-orange-800">High Priority</p>
                <p className="text-sm text-orange-700 mt-1">{certificateData.expiring90Days.toLocaleString()} certificates expiring within 90 days</p>
              </div>
              <div className="p-4 bg-blue-50 border-l-4 border-blue-500 rounded">
                <p className="text-sm font-semibold text-blue-800">Strategic Insight</p>
                <p className="text-sm text-blue-700 mt-1">
                  {certificateData.departments[0]?.name || 'N/A'} has highest renewal workload ({certificateData.departments[0]?.count.toLocaleString() || 0} certificates)
                </p>
              </div>
              <div className="p-4 bg-purple-50 border-l-4 border-purple-500 rounded">
                <p className="text-sm font-semibold text-purple-800">High Risk</p>
                <p className="text-sm text-purple-700 mt-1">{certificateData.highRisk.toLocaleString()} certificates classified as high risk requiring attention</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'trends' && (
        <div className="grid grid-cols-1 gap-6">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">Renewal Urgency Trend (6-Week Forecast)</h3>
            <div ref={trendChartRef} className="w-full h-96"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h4 className="text-md font-semibold text-slate-800 mb-4">Predicted Outcomes</h4>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-slate-50 rounded">
                  <span className="text-sm text-slate-700">Renewal Success Rate</span>
                  <span className="text-sm font-bold text-green-600">{certificateData.avgRenewalProbability.toFixed(1)}%</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-slate-50 rounded">
                  <span className="text-sm text-slate-700">Automation Candidates</span>
                  <span className="text-sm font-bold text-blue-600">{Math.round(certificateData.total * 0.15)}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-slate-50 rounded">
                  <span className="text-sm text-slate-700">Avg. Renewal Time</span>
                  <span className="text-sm font-bold text-purple-600">45 days</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <h4 className="text-md font-semibold text-slate-800 mb-4">Top Recommendations</h4>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <span className="text-green-600 mr-2">✓</span>
                  <span className="text-sm text-slate-700">
                    Prioritize {certificateData.certificateTypes[0]?.name || 'certificate'} renewal
                  </span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-600 mr-2">✓</span>
                  <span className="text-sm text-slate-700">Implement automated reminders for 90-day window</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-600 mr-2">✓</span>
                  <span className="text-sm text-slate-700">
                    Review {certificateData.departments[0]?.name || 'department'} workflows
                  </span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-600 mr-2">✓</span>
                  <span className="text-sm text-slate-700">Schedule bulk renewals for Q4</span>
                </li>
              </ul>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <h4 className="text-md font-semibold text-slate-800 mb-4">Compliance Score</h4>
              <div className="flex flex-col items-center justify-center h-full">
                <div className="relative w-32 h-32">
                  <svg className="transform -rotate-90 w-32 h-32">
                    <circle cx="64" cy="64" r="56" stroke="#e5e7eb" strokeWidth="12" fill="none" />
                    <circle cx="64" cy="64" r="56" stroke="#3b82f6" strokeWidth="12" fill="none"
                      strokeDasharray={`${(certificateData.approved/certificateData.total) * 351.86} 351.86`} />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-2xl font-bold text-slate-800">
                      {Math.round((certificateData.approved/certificateData.total) * 100)}%
                    </span>
                  </div>
                </div>
                <p className="text-sm text-slate-600 mt-4 text-center">Current compliance rate</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'calendar' && (
        <div className="grid grid-cols-1 gap-6">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
              <h3 className="text-lg font-semibold text-slate-800">
                Certificate Expiration Calendar
              </h3>
              
              <div className="flex gap-2">
                <button
                  onClick={() => changeCalendarView('day')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    calendarView === 'day'
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  Day
                </button>
                <button
                  onClick={() => changeCalendarView('week')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    calendarView === 'week'
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  Week
                </button>
                <button
                  onClick={() => changeCalendarView('month')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    calendarView === 'month'
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  Month
                </button>
                <button
                  onClick={() => changeCalendarView('year')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    calendarView === 'year'
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  Year
                </button>
              </div>
            </div>

            <div className="flex flex-wrap gap-4 mb-6">
              <button
                onClick={() => handleLegendClick('expired')}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${
                  selectedFilter === 'expired'
                    ? 'bg-red-100 ring-2 ring-red-500'
                    : 'hover:bg-slate-50'
                }`}
              >
                <div className="w-4 h-4 rounded bg-red-500"></div>
                <span className="text-sm text-slate-600 font-medium">Expired</span>
              </button>
              
              <button
                onClick={() => handleLegendClick('expiring-soon')}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${
                  selectedFilter === 'expiring-soon'
                    ? 'bg-orange-100 ring-2 ring-orange-500'
                    : 'hover:bg-slate-50'
                }`}
              >
                <div className="w-4 h-4 rounded bg-orange-500"></div>
                <span className="text-sm text-slate-600 font-medium">Expiring Soon (0-30 days)</span>
              </button>
              
              <button
                onClick={() => handleLegendClick('expiring')}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${
                  selectedFilter === 'expiring'
                    ? 'bg-yellow-100 ring-2 ring-yellow-400'
                    : 'hover:bg-slate-50'
                }`}
              >
                <div className="w-4 h-4 rounded bg-yellow-400"></div>
                <span className="text-sm text-slate-600 font-medium">Expiring (31-90 days)</span>
              </button>
              
              <button
                onClick={() => handleLegendClick('valid')}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${
                  selectedFilter === 'valid'
                    ? 'bg-green-100 ring-2 ring-green-500'
                    : 'hover:bg-slate-50'
                }`}
              >
                <div className="w-4 h-4 rounded bg-green-500"></div>
                <span className="text-sm text-slate-600 font-medium">Valid</span>
              </button>

              {selectedFilter && (
                <button
                  onClick={() => {
                    setSelectedFilter(null);
                    setShowFilteredList(false);
                  }}
                  className="ml-auto px-4 py-2 bg-slate-700 text-white rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors"
                >
                  Clear Filter
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
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                        Certificate
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                        Department
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                        Brand
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                        Expiration Date
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                        Days to Expiration
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                        Risk Score
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {getFilteredEvents().length > 0 ? (
                      getFilteredEvents().map((event) => (
                        <tr key={event.id} className="hover:bg-slate-50 transition-colors">
                          <td className="px-4 py-3 text-sm text-slate-800 font-medium">
                            {event.title}
                          </td>
                          <td className="px-4 py-3 text-sm text-slate-600">
                            {event.extendedProps?.department || 'N/A'}
                          </td>
                          <td className="px-4 py-3 text-sm text-slate-600">
                            {event.extendedProps?.brand || 'N/A'}
                          </td>
                          <td className="px-4 py-3 text-sm text-slate-600">
                            {new Date(event.start).toLocaleDateString('pt-BR')}
                          </td>
                          <td className="px-4 py-3 text-sm">
                            <span className={`font-semibold ${
                              event.extendedProps?.daysToExpiration < 0 ? 'text-red-600' :
                              event.extendedProps?.daysToExpiration <= 30 ? 'text-orange-600' :
                              event.extendedProps?.daysToExpiration <= 90 ? 'text-yellow-600' :
                              'text-green-600'
                            }`}>
                              {event.extendedProps?.daysToExpiration} days
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              event.extendedProps?.riskScore >= 70 ? 'bg-red-100 text-red-800' :
                              event.extendedProps?.riskScore >= 40 ? 'bg-orange-100 text-orange-800' :
                              'bg-green-100 text-green-800'
                            }`}>
                              {event.extendedProps?.riskScore || 'N/A'}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${
                              event.extendedProps?.status?.toLowerCase() === 'expired' ? 'bg-red-100 text-red-800' :
                              event.extendedProps?.status?.toLowerCase() === 'approved' ? 'bg-green-100 text-green-800' :
                              'bg-yellow-100 text-yellow-800'
                            }`}>
                              {event.extendedProps?.status || 'N/A'}
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={7} className="px-4 py-8 text-center text-slate-500">
                          No certificates found for this filter
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h4 className="text-sm font-medium text-slate-600 mb-2">This Week</h4>
              <p className="text-3xl font-bold text-slate-800">
                {certificateData.calendarEvents?.filter((e: any) => {
                  const eventDate = new Date(e.start);
                  const now = new Date();
                  const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
                  return eventDate >= now && eventDate <= weekFromNow;
                }).length || 0}
              </p>
              <p className="text-xs text-slate-500 mt-1">Certificates expiring</p>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <h4 className="text-sm font-medium text-slate-600 mb-2">This Month</h4>
              <p className="text-3xl font-bold text-slate-800">
                {certificateData.calendarEvents?.filter((e: any) => {
                  const eventDate = new Date(e.start);
                  const now = new Date();
                  const monthFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
                  return eventDate >= now && eventDate <= monthFromNow;
                }).length || 0}
              </p>
              <p className="text-xs text-slate-500 mt-1">Certificates expiring</p>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <h4 className="text-sm font-medium text-slate-600 mb-2">Next 90 Days</h4>
              <p className="text-3xl font-bold text-slate-800">
                {certificateData.expiring90Days}
              </p>
              <p className="text-xs text-slate-500 mt-1">Certificates expiring</p>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <h4 className="text-sm font-medium text-slate-600 mb-2">Already Expired</h4>
              <p className="text-3xl font-bold text-red-600">
                {certificateData.expired}
              </p>
              <p className="text-xs text-slate-500 mt-1">Needs immediate action</p>
            </div>
          </div>
        </div>
      )}

      <div className="mt-8 bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-slate-800 mb-4">Quick Statistics</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-slate-50 rounded-lg">
            <p className="text-2xl font-bold text-slate-800">{certificateData.total.toLocaleString()}</p>
            <p className="text-sm text-slate-600">Total Certificates</p>
          </div>
          <div className="text-center p-4 bg-slate-50 rounded-lg">
            <p className="text-2xl font-bold text-slate-800">{certificateData.certificateTypes.length}</p>
            <p className="text-sm text-slate-600">Certificate Types</p>
          </div>
          <div className="text-center p-4 bg-slate-50 rounded-lg">
            <p className="text-2xl font-bold text-slate-800">{certificateData.departments.length}</p>
            <p className="text-sm text-slate-600">Departments</p>
          </div>
          <div className="text-center p-4 bg-slate-50 rounded-lg">
            <p className="text-2xl font-bold text-slate-800">{certificateData.highRisk.toLocaleString()}</p>
            <p className="text-sm text-slate-600">High Risk Items</p>
          </div>
        </div>
      </div>
    </div>
  );
}