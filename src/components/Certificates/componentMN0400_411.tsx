import { useEffect, useRef, useState } from 'react';
import * as echarts from 'echarts';

export default function PredictiveCertificateAnalysis() {
  const [activeTab, setActiveTab] = useState('overview');
  
  // Chart refs
  const statusChartRef = useRef(null);
  const riskChartRef = useRef(null);
  const timelineChartRef = useRef(null);
  const departmentChartRef = useRef(null);
  const costChartRef = useRef(null);
  const expirationChartRef = useRef(null);
  const issuerChartRef = useRef(null);
  const trendChartRef = useRef(null);

  // Sample data based on the CSV structure
  const certificateData = {
    total: 48,
    expired: 35,
    approved: 13,
    expiring90Days: 8,
    expiringSoon: 5,
    highRisk: 32,
    mediumRisk: 4,
    lowRisk: 12,
    totalFinancialRisk: 23803.00,
    avgRenewalProbability: 65.2,
    departments: [
      { name: 'Production', count: 12, expired: 9 },
      { name: 'Patient Care Assets', count: 14, expired: 6 },
      { name: 'IT Department', count: 8, expired: 6 },
      { name: 'Medical Department', count: 10, expired: 2 },
      { name: 'Internal Assets', count: 4, expired: 0 }
    ],
    certificateTypes: [
      { name: 'OSHA Certifications', count: 10, expired: 8 },
      { name: 'Equipment Calibration', count: 15, expired: 5 },
      { name: 'Maintenance Preventive', count: 12, expired: 6 },
      { name: 'Safety Training', count: 6, expired: 5 },
      { name: 'Other', count: 5, expired: 3 }
    ]
  };

  useEffect(() => {
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
            { value: 35, name: 'Expired', itemStyle: { color: '#ef4444' } },
            { value: 13, name: 'Approved', itemStyle: { color: '#10b981' } },
            { value: 5, name: 'Expiring Soon', itemStyle: { color: '#f59e0b' } }
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
            { value: 32, itemStyle: { color: '#ef4444' } },
            { value: 4, itemStyle: { color: '#f59e0b' } },
            { value: 12, itemStyle: { color: '#10b981' } }
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
          data: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
        },
        yAxis: {
          type: 'value'
        },
        series: [
          {
            name: 'Expired',
            type: 'bar',
            stack: 'total',
            data: [5, 3, 8, 2, 6, 4, 2, 3, 1, 0, 0, 1],
            itemStyle: { color: '#ef4444' }
          },
          {
            name: 'Expiring 0-30 Days',
            type: 'bar',
            stack: 'total',
            data: [0, 0, 0, 0, 0, 0, 0, 1, 2, 1, 1, 0],
            itemStyle: { color: '#f97316' }
          },
          {
            name: 'Expiring 31-90 Days',
            type: 'bar',
            stack: 'total',
            data: [0, 1, 0, 0, 0, 0, 1, 0, 1, 2, 2, 1],
            itemStyle: { color: '#fbbf24' }
          },
          {
            name: 'Valid',
            type: 'bar',
            stack: 'total',
            data: [1, 2, 0, 1, 0, 1, 0, 0, 0, 1, 2, 5],
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
            { name: 'High Value Assets', value: 15940, itemStyle: { color: '#ef4444' } },
            { name: 'Medium Cost Items', value: 5863, itemStyle: { color: '#f59e0b' } },
            { name: 'Low Cost Items', value: 2000, itemStyle: { color: '#10b981' } }
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
          data: [18, 8, 6, 3, 3, 5, 5],
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

    // Issuer Reliability Chart
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
          data: [90, 90, 90, 90, 90],
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

    // Renewal Urgency Trend
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
            data: [8, 9, 7, 10, 8, 6],
            itemStyle: { color: '#ef4444' },
            areaStyle: { opacity: 0.3 }
          },
          {
            name: 'Planned Renewals',
            type: 'line',
            data: [2, 3, 2, 1, 2, 3],
            itemStyle: { color: '#f59e0b' },
            areaStyle: { opacity: 0.3 }
          },
          {
            name: 'Future Renewals',
            type: 'line',
            data: [1, 1, 2, 2, 3, 4],
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
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-slate-800 mb-2">Certificate Management Analytics</h1>
        <p className="text-slate-600">Predictive analysis and strategic insights for certificate lifecycle management</p>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-red-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-600 text-sm font-medium">Expired Certificates</p>
              <p className="text-3xl font-bold text-slate-800 mt-2">{certificateData.expired}</p>
              <p className="text-red-600 text-xs mt-1">Immediate Action Required</p>
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
              <p className="text-3xl font-bold text-slate-800 mt-2">{certificateData.approved}</p>
              <p className="text-green-600 text-xs mt-1">In Good Standing</p>
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
              <p className="text-3xl font-bold text-slate-800 mt-2">{certificateData.highRisk}</p>
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
              <p className="text-3xl font-bold text-slate-800 mt-2">${(certificateData.totalFinancialRisk/1000).toFixed(1)}K</p>
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
                <p className="text-sm text-red-700 mt-1">35 certificates are expired and require immediate renewal</p>
              </div>
              <div className="p-4 bg-orange-50 border-l-4 border-orange-500 rounded">
                <p className="text-sm font-semibold text-orange-800">High Priority</p>
                <p className="text-sm text-orange-700 mt-1">8 certificates expiring within 90 days</p>
              </div>
              <div className="p-4 bg-blue-50 border-l-4 border-blue-500 rounded">
                <p className="text-sm font-semibold text-blue-800">Strategic Insight</p>
                <p className="text-sm text-blue-700 mt-1">Production department has highest renewal workload (12 certificates)</p>
              </div>
              <div className="p-4 bg-purple-50 border-l-4 border-purple-500 rounded">
                <p className="text-sm font-semibold text-purple-800">Operational Impact</p>
                <p className="text-sm text-purple-700 mt-1">Patient Care Assets showing 43% expiration rate - potential compliance risk</p>
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
                  <span className="text-sm font-bold text-green-600">65%</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-slate-50 rounded">
                  <span className="text-sm text-slate-700">Automation Candidates</span>
                  <span className="text-sm font-bold text-blue-600">18</span>
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
                  <span className="text-sm text-slate-700">Prioritize OSHA certifications renewal</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-600 mr-2">✓</span>
                  <span className="text-sm text-slate-700">Implement automated reminders for 90-day window</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-600 mr-2">✓</span>
                  <span className="text-sm text-slate-700">Review high-risk department workflows</span>
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
                      strokeDasharray={`${(27/48) * 351.86} 351.86`} />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-2xl font-bold text-slate-800">56%</span>
                  </div>
                </div>
                <p className="text-sm text-slate-600 mt-4 text-center">Current compliance rate requires improvement</p>
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
            <p className="text-2xl font-bold text-slate-800">{certificateData.total}</p>
            <p className="text-sm text-slate-600">Total Certificates</p>
          </div>
          <div className="text-center p-4 bg-slate-50 rounded-lg">
            <p className="text-2xl font-bold text-slate-800">5</p>
            <p className="text-sm text-slate-600">Certificate Types</p>
          </div>
          <div className="text-center p-4 bg-slate-50 rounded-lg">
            <p className="text-2xl font-bold text-slate-800">5</p>
            <p className="text-sm text-slate-600">Departments</p>
          </div>
          <div className="text-center p-4 bg-slate-50 rounded-lg">
            <p className="text-2xl font-bold text-slate-800">8</p>
            <p className="text-sm text-slate-600">Active Issuers</p>
          </div>
        </div>
        </div>
    </div>
    );
}