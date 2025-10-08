import { useEffect, useRef, useState } from 'react';
import * as echarts from 'echarts';
import { useQuery } from '@apollo/client/react';
import { GET_PREDICTIVE_CERTIFICATES } from '../../graphql/queries';

// Definindo as interfaces para os tipos
interface Certificate {
  expiration_date: string;
  certificate_status_name: string;
  is_expiring_90_days: boolean;
  is_expiring_soon: boolean;
  combined_risk_score: number;
  department_name?: string;
  certificate_type?: string;
  financial_risk_value?: number;
  renewal_probability_score?: number;
}

interface ProcessedCertificate extends Certificate {
  daysToExpiration: number;
}

interface DepartmentStats {
  name: string;
  count: number;
  expired: number;
}

interface CertificateTypeStats {
  name: string;
  count: number;
  expired: number;
}

interface MonthStats {
  expired: number;
  expiring_0_30: number;
  expiring_31_90: number;
  valid: number;
}

interface DaysToExpirationRanges {
  under_minus_200: number;
  minus_200_to_minus_100: number;
  minus_100_to_minus_50: number;
  minus_50_to_0: number;
  zero_to_50: number;
  range_50_to_100: number;
  over_100: number;
}

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
  departments: DepartmentStats[];
  certificateTypes: CertificateTypeStats[];
  expirationByMonth: { [key: number]: MonthStats };
  daysToExpirationRanges: DaysToExpirationRanges;
}

interface GraphQLResponse {
  predictiveCertificates?: Certificate[];
}

export default function PredictiveCertificateAnalysis() {
  const [activeTab, setActiveTab] = useState<string>('overview');
  
  const { data, loading, error, refetch } = useQuery<GraphQLResponse>(GET_PREDICTIVE_CERTIFICATES, {
    fetchPolicy: 'cache-and-network',
    notifyOnNetworkStatusChange: true,
  });

  useEffect(() => {
    refetch();
  }, []);

  // Chart refs
  const statusChartRef = useRef<HTMLDivElement>(null);
  const riskChartRef = useRef<HTMLDivElement>(null);
  const timelineChartRef = useRef<HTMLDivElement>(null);
  const departmentChartRef = useRef<HTMLDivElement>(null);
  const costChartRef = useRef<HTMLDivElement>(null);
  const expirationChartRef = useRef<HTMLDivElement>(null);
  const issuerChartRef = useRef<HTMLDivElement>(null);
  const trendChartRef = useRef<HTMLDivElement>(null);

  // Processa dados do GraphQL
  const processGraphQLData = (): ProcessedData | null => {
    if (!data?.predictiveCertificates) {
      return null;
    }

    const certs = data.predictiveCertificates;
    const now = Date.now();

    // Calcula days to expiration
    const certsWithDays: ProcessedCertificate[] = certs.map(cert => {
      const expDate = parseInt(cert.expiration_date);
      const daysToExpiration = Math.floor((expDate - now) / (1000 * 60 * 60 * 24));
      return { ...cert, daysToExpiration };
    });

    // Status counts
    const expired = certsWithDays.filter(c => c.certificate_status_name === 'EXPIRED').length;
    const approved = certsWithDays.filter(c => c.certificate_status_name === 'APPROVED').length;
    const expiring90Days = certsWithDays.filter(c => c.is_expiring_90_days).length;
    const expiringSoon = certsWithDays.filter(c => c.is_expiring_soon).length;

    // Risk counts
    const highRisk = certsWithDays.filter(c => c.combined_risk_score >= 60).length;
    const mediumRisk = certsWithDays.filter(c => c.combined_risk_score >= 30 && c.combined_risk_score < 60).length;
    const lowRisk = certsWithDays.filter(c => c.combined_risk_score < 30).length;

    // Department stats
    const deptMap: { [key: string]: DepartmentStats } = {};
    certsWithDays.forEach(cert => {
      const dept = cert.department_name || 'Unknown';
      if (!deptMap[dept]) {
        deptMap[dept] = { name: dept, count: 0, expired: 0 };
      }
      deptMap[dept].count++;
      if (cert.certificate_status_name === 'EXPIRED') {
        deptMap[dept].expired++;
      }
    });

    // Certificate types
    const typeMap: { [key: string]: CertificateTypeStats } = {};
    certsWithDays.forEach(cert => {
      const type = cert.certificate_type || 'Unknown';
      if (!typeMap[type]) {
        typeMap[type] = { name: type, count: 0, expired: 0 };
      }
      typeMap[type].count++;
      if (cert.certificate_status_name === 'EXPIRED') {
        typeMap[type].expired++;
      }
    });

    // Expiration by month
    const monthMap: { [key: number]: MonthStats } = {};
    certsWithDays.forEach(cert => {
      const date = new Date(parseInt(cert.expiration_date));
      const monthKey = date.getMonth();
      if (!monthMap[monthKey]) {
        monthMap[monthKey] = { expired: 0, expiring_0_30: 0, expiring_31_90: 0, valid: 0 };
      }
      
      if (cert.certificate_status_name === 'EXPIRED') {
        monthMap[monthKey].expired++;
      } else if (cert.daysToExpiration > 0 && cert.daysToExpiration <= 30) {
        monthMap[monthKey].expiring_0_30++;
      } else if (cert.daysToExpiration > 30 && cert.daysToExpiration <= 90) {
        monthMap[monthKey].expiring_31_90++;
      } else if (cert.daysToExpiration > 90) {
        monthMap[monthKey].valid++;
      }
    });

    // Days to expiration ranges
    const ranges: DaysToExpirationRanges = {
      under_minus_200: 0,
      minus_200_to_minus_100: 0,
      minus_100_to_minus_50: 0,
      minus_50_to_0: 0,
      zero_to_50: 0,
      range_50_to_100: 0,
      over_100: 0
    };
    
    certsWithDays.forEach(cert => {
      const days = cert.daysToExpiration;
      if (days < -200) ranges.under_minus_200++;
      else if (days >= -200 && days < -100) ranges.minus_200_to_minus_100++;
      else if (days >= -100 && days < -50) ranges.minus_100_to_minus_50++;
      else if (days >= -50 && days < 0) ranges.minus_50_to_0++;
      else if (days >= 0 && days < 50) ranges.zero_to_50++;
      else if (days >= 50 && days < 100) ranges.range_50_to_100++;
      else ranges.over_100++;
    });

    // Financial risk
    const totalFinancialRisk = certsWithDays.reduce((sum, cert) => sum + (cert.financial_risk_value || 0), 0);
    const avgRenewalProbability = certsWithDays.length > 0 
      ? certsWithDays.reduce((sum, cert) => sum + (cert.renewal_probability_score || 0), 0) / certsWithDays.length
      : 0;

    return {
      total: certs.length,
      expired,
      approved,
      expiring90Days,
      expiringSoon,
      highRisk,
      mediumRisk,
      lowRisk,
      totalFinancialRisk,
      avgRenewalProbability,
      departments: Object.values(deptMap).sort((a, b) => b.count - a.count).slice(0, 5),
      certificateTypes: Object.values(typeMap).sort((a, b) => b.count - a.count).slice(0, 5),
      expirationByMonth: monthMap,
      daysToExpirationRanges: ranges
    };
  };

  const certificateData = processGraphQLData();

  useEffect(() => {
    if (loading || !data || !certificateData) return;

    // Status Distribution Chart
    if (statusChartRef.current) {
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
          data: [
            { value: certificateData.expired, name: 'Expired', itemStyle: { color: '#ef4444' } },
            { value: certificateData.approved, name: 'Approved', itemStyle: { color: '#10b981' } },
            { value: certificateData.expiringSoon, name: 'Expiring Soon', itemStyle: { color: '#f59e0b' } }
          ]
        }]
      });
    }

    // Risk Distribution Chart
    if (riskChartRef.current) {
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

    // Expiration Timeline Chart
    if (timelineChartRef.current) {
      const chart = echarts.init(timelineChartRef.current);
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const expiredData = months.map((_, i) => certificateData.expirationByMonth[i]?.expired || 0);
      const expiring0_30Data = months.map((_, i) => certificateData.expirationByMonth[i]?.expiring_0_30 || 0);
      const expiring31_90Data = months.map((_, i) => certificateData.expirationByMonth[i]?.expiring_31_90 || 0);
      const validData = months.map((_, i) => certificateData.expirationByMonth[i]?.valid || 0);
      
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

    // Department Performance Chart
    if (departmentChartRef.current) {
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

    // Financial Risk Chart
    if (costChartRef.current) {
      const chart = echarts.init(costChartRef.current);
      chart.setOption({
        tooltip: {
          trigger: 'item',
          formatter: '{b}: ${c}'
        },
        series: [{
          type: 'treemap',
          data: [
            { name: 'High Value Assets', value: certificateData.totalFinancialRisk * 0.67, itemStyle: { color: '#ef4444' } },
            { name: 'Medium Cost Items', value: certificateData.totalFinancialRisk * 0.25, itemStyle: { color: '#f59e0b' } },
            { name: 'Low Cost Items', value: certificateData.totalFinancialRisk * 0.08, itemStyle: { color: '#10b981' } }
          ],
          label: {
            show: true,
            formatter: '{b}\n${c}'
          }
        }]
      });
    }

    // Days to Expiration Distribution
    if (expirationChartRef.current) {
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

    // Issuer Reliability Chart (mock data - não está no GraphQL)
    if (issuerChartRef.current) {
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
          data: ['FUSION', 'ACME Industries', 'Community Fox', 'Hospital Smartx', 'Certification Acme']
        },
        series: [{
          type: 'bar',
          data: [90, 88, 85, 82, 78],
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

    // Renewal Urgency Trend (mock forecast)
    if (trendChartRef.current) {
      const chart = echarts.init(trendChartRef.current);
      chart.setOption({
        tooltip: {
          trigger: 'axis'
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
          data: ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5', 'Week 6']
        },
        yAxis: {
          type: 'value'
        },
        series: [
          {
            name: 'Urgent Renewals',
            type: 'line',
            data: [45, 52, 48, 58, 51, 42],
            itemStyle: { color: '#ef4444' },
            areaStyle: { opacity: 0.3 }
          },
          {
            name: 'Planned Renewals',
            type: 'line',
            data: [18, 22, 19, 15, 21, 25],
            itemStyle: { color: '#f59e0b' },
            areaStyle: { opacity: 0.3 }
          },
          {
            name: 'Future Renewals',
            type: 'line',
            data: [12, 15, 18, 22, 28, 35],
            itemStyle: { color: '#10b981' },
            areaStyle: { opacity: 0.3 }
          }
        ]
      });
    }

    return () => {
      if (statusChartRef.current) echarts.dispose(statusChartRef.current);
      if (riskChartRef.current) echarts.dispose(riskChartRef.current);
      if (timelineChartRef.current) echarts.dispose(timelineChartRef.current);
      if (departmentChartRef.current) echarts.dispose(departmentChartRef.current);
      if (costChartRef.current) echarts.dispose(costChartRef.current);
      if (expirationChartRef.current) echarts.dispose(expirationChartRef.current);
      if (issuerChartRef.current) echarts.dispose(issuerChartRef.current);
      if (trendChartRef.current) echarts.dispose(trendChartRef.current);
    };
  }, [data, loading, certificateData]);

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
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-slate-800 mb-2">Certificate Management Analytics</h1>
        <p className="text-slate-600">Predictive analysis for {certificateData.total.toLocaleString()} certificates</p>
      </div>

      {/* Key Metrics Cards */}
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

      {/* Tabs */}
      <div className="mb-6">
        <div className="border-b border-slate-200">
          <nav className="flex space-x-8">
            {['overview', 'risk-analysis', 'trends'].map(tab => (
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

      {/* Overview Tab */}
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

      {/* Risk Analysis Tab */}
      {activeTab === 'risk-analysis' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-lg p-6 lg:col-span-2">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">Days Until Expiration Distribution</h3>
            <div ref={expirationChartRef} className="w-full h-80"></div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">Issuer Reliability Scores</h3>
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
                <p className="text-sm text-blue-700 mt-1">{certificateData.departments[0]?.name} has highest renewal workload ({certificateData.departments[0]?.count.toLocaleString()} certificates)</p>
              </div>
              <div className="p-4 bg-purple-50 border-l-4 border-purple-500 rounded">
                <p className="text-sm font-semibold text-purple-800">High Risk</p>
                <p className="text-sm text-purple-700 mt-1">{certificateData.highRisk.toLocaleString()} certificates classified as high risk requiring attention</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Trends Tab */}
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
                  <span className="text-sm text-slate-700">Prioritize {certificateData.certificateTypes[0]?.name} renewal</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-600 mr-2">✓</span>
                  <span className="text-sm text-slate-700">Implement automated reminders for 90-day window</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-600 mr-2">✓</span>
                  <span className="text-sm text-slate-700">Review {certificateData.departments[0]?.name} workflows</span>
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

      {/* Footer Stats */}
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