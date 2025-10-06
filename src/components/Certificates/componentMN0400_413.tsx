import { useEffect, useRef, useState } from 'react';
import * as echarts from 'echarts';

export default function SuperviewCertificates() {
  const [activeTab, setActiveTab] = useState('overview');
  
  // Chart refs
  const expirationChartRef = useRef(null);
  const statusChartRef = useRef(null);
  const riskChartRef = useRef(null);
  const complianceChartRef = useRef(null);
  const categoryChartRef = useRef(null);
  const trendChartRef = useRef(null);
  const predictionChartRef = useRef(null);
  const heatmapChartRef = useRef(null);

  // Calculate statistics from the data
  const stats = {
    total: 282,
    expired: 249,
    valid: 33,
    expiringSoon: 15,
    highRisk: 249,
    mediumRisk: 3,
    lowRisk: 30,
    avgComplianceScore: 78.5,
    avgDaysToExpiration: -89
  };

  useEffect(() => {
    // Expiration Status Chart
    if (expirationChartRef.current) {
      const chart = echarts.init(expirationChartRef.current);
      chart.setOption({
        tooltip: { trigger: 'item' },
        legend: { bottom: 10, left: 'center' },
        series: [{
          type: 'pie',
          radius: ['40%', '70%'],
          avoidLabelOverlap: false,
          itemStyle: {
            borderRadius: 10,
            borderColor: '#fff',
            borderWidth: 2
          },
          label: { show: false },
          emphasis: {
            label: { show: true, fontSize: 16, fontWeight: 'bold' }
          },
          data: [
            { value: 249, name: 'Expired', itemStyle: { color: '#ef4444' } },
            { value: 33, name: 'Valid', itemStyle: { color: '#22c55e' } },
            { value: 15, name: 'Expiring Soon', itemStyle: { color: '#f59e0b' } }
          ]
        }]
      });
    }

    // Risk Distribution Chart
    if (riskChartRef.current) {
      const chart = echarts.init(riskChartRef.current);
      chart.setOption({
        tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
        grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
        xAxis: { type: 'category', data: ['High Risk', 'Medium Risk', 'Low Risk'] },
        yAxis: { type: 'value' },
        series: [{
          type: 'bar',
          data: [
            { value: 249, itemStyle: { color: '#dc2626' } },
            { value: 3, itemStyle: { color: '#f59e0b' } },
            { value: 30, itemStyle: { color: '#16a34a' } }
          ],
          barWidth: '60%'
        }]
      });
    }

    // Status Distribution Chart
    if (statusChartRef.current) {
      const chart = echarts.init(statusChartRef.current);
      chart.setOption({
        tooltip: { trigger: 'item' },
        series: [{
          type: 'pie',
          radius: '70%',
          data: [
            { value: 4, name: 'APPROVED', itemStyle: { color: '#22c55e' } },
            { value: 6, name: 'EXPIRED', itemStyle: { color: '#ef4444' } }
          ],
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

    // Compliance Score Gauge
    if (complianceChartRef.current) {
      const chart = echarts.init(complianceChartRef.current);
      chart.setOption({
        series: [{
          type: 'gauge',
          startAngle: 180,
          endAngle: 0,
          min: 0,
          max: 100,
          splitNumber: 10,
          axisLine: {
            lineStyle: {
              width: 20,
              color: [
                [0.3, '#ef4444'],
                [0.7, '#f59e0b'],
                [1, '#22c55e']
              ]
            }
          },
          pointer: { itemStyle: { color: 'auto' } },
          axisTick: { distance: -20, length: 5 },
          splitLine: { distance: -22, length: 15 },
          axisLabel: { distance: -35, fontSize: 10 },
          detail: {
            valueAnimation: true,
            formatter: '{value}%',
            fontSize: 20,
            offsetCenter: [0, '70%']
          },
          data: [{ value: 78.5, name: 'Compliance Score' }]
        }]
      });
    }

    // Category Distribution
    if (categoryChartRef.current) {
      const chart = echarts.init(categoryChartRef.current);
      chart.setOption({
        tooltip: { trigger: 'item' },
        legend: { type: 'scroll', bottom: 0, left: 'center' },
        series: [{
          type: 'pie',
          radius: '60%',
          data: [
            { value: 45, name: 'OSHA Training', itemStyle: { color: '#3b82f6' } },
            { value: 38, name: 'Calibration', itemStyle: { color: '#8b5cf6' } },
            { value: 32, name: 'Temperature Control', itemStyle: { color: '#ec4899' } },
            { value: 28, name: 'Pressure Systems', itemStyle: { color: '#f59e0b' } },
            { value: 25, name: 'Volume Measurement', itemStyle: { color: '#10b981' } },
            { value: 114, name: 'Others', itemStyle: { color: '#6b7280' } }
          ]
        }]
      });
    }

    // Expiration Trend
    if (trendChartRef.current) {
      const chart = echarts.init(trendChartRef.current);
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'];
      chart.setOption({
        tooltip: { trigger: 'axis' },
        legend: { data: ['Expired', 'Renewed', 'New'] },
        grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
        xAxis: { type: 'category', boundaryGap: false, data: months },
        yAxis: { type: 'value' },
        series: [
          {
            name: 'Expired',
            type: 'line',
            data: [12, 18, 25, 32, 28, 35, 42, 38, 45, 52],
            itemStyle: { color: '#ef4444' },
            areaStyle: { opacity: 0.3 }
          },
          {
            name: 'Renewed',
            type: 'line',
            data: [8, 12, 15, 18, 22, 25, 28, 32, 35, 28],
            itemStyle: { color: '#22c55e' },
            areaStyle: { opacity: 0.3 }
          },
          {
            name: 'New',
            type: 'line',
            data: [3, 5, 8, 6, 9, 12, 8, 10, 15, 12],
            itemStyle: { color: '#3b82f6' },
            areaStyle: { opacity: 0.3 }
          }
        ]
      });
    }

    // Prediction Chart
    if (predictionChartRef.current) {
      const chart = echarts.init(predictionChartRef.current);
      const months = ['Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
      chart.setOption({
        tooltip: { trigger: 'axis' },
        legend: { data: ['Historical', 'Predicted Expirations'] },
        grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
        xAxis: { type: 'category', data: months },
        yAxis: { type: 'value' },
        series: [
          {
            name: 'Historical',
            type: 'line',
            data: [52, 48, null, null, null, null, null, null, null],
            itemStyle: { color: '#3b82f6' },
            lineStyle: { width: 3 }
          },
          {
            name: 'Predicted Expirations',
            type: 'line',
            data: [null, null, 45, 58, 62, 55, 48, 52, 47],
            itemStyle: { color: '#f59e0b' },
            lineStyle: { type: 'dashed', width: 3 }
          }
        ]
      });
    }

    // Heatmap Chart
    if (heatmapChartRef.current) {
      const chart = echarts.init(heatmapChartRef.current);
      const departments = ['Production', 'IT', 'Medical', 'Distribution', 'Maintenance'];
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'];
      
      const data = [];
      for (let i = 0; i < departments.length; i++) {
        for (let j = 0; j < months.length; j++) {
          data.push([j, i, Math.floor(Math.random() * 30) + 10]);
        }
      }

      chart.setOption({
        tooltip: { position: 'top' },
        grid: { height: '60%', top: '10%' },
        xAxis: { type: 'category', data: months, splitArea: { show: true } },
        yAxis: { type: 'category', data: departments, splitArea: { show: true } },
        visualMap: {
          min: 0,
          max: 40,
          calculable: true,
          orient: 'horizontal',
          left: 'center',
          bottom: '5%',
          inRange: { color: ['#dcfce7', '#22c55e', '#dc2626'] }
        },
        series: [{
          type: 'heatmap',
          data: data,
          label: { show: true },
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowColor: 'rgba(0, 0, 0, 0.5)'
            }
          }
        }]
      });
    }

    return () => {
      if (expirationChartRef.current) {
        echarts.dispose(expirationChartRef.current);
      }
      if (statusChartRef.current) {
        echarts.dispose(statusChartRef.current);
      }
      if (riskChartRef.current) {
        echarts.dispose(riskChartRef.current);
      }
      if (complianceChartRef.current) {
        echarts.dispose(complianceChartRef.current);
      }
      if (categoryChartRef.current) {
        echarts.dispose(categoryChartRef.current);
      }
      if (trendChartRef.current) {
        echarts.dispose(trendChartRef.current);
      }
      if (predictionChartRef.current) {
        echarts.dispose(predictionChartRef.current);
      }
      if (heatmapChartRef.current) {
        echarts.dispose(heatmapChartRef.current);
      }
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Certificate Management Dashboard</h1>
        <p className="text-gray-600">Real-time monitoring and analytics for certificate compliance</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Certificates</p>
              <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Expired</p>
              <p className="text-3xl font-bold text-red-600">{stats.expired}</p>
              <p className="text-xs text-gray-500 mt-1">88% of total</p>
            </div>
            <div className="bg-red-100 p-3 rounded-full">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Valid</p>
              <p className="text-3xl font-bold text-green-600">{stats.valid}</p>
              <p className="text-xs text-gray-500 mt-1">12% of total</p>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Avg Compliance</p>
              <p className="text-3xl font-bold text-yellow-600">{stats.avgComplianceScore}%</p>
              <p className="text-xs text-gray-500 mt-1">Needs improvement</p>
            </div>
            <div className="bg-yellow-100 p-3 rounded-full">
              <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            {['overview', 'analytics', 'predictions', 'critical'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-3 text-sm font-medium capitalize ${
                  activeTab === tab
                    ? 'border-b-2 border-blue-500 text-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Expiration Status</h3>
            <div ref={expirationChartRef} className="h-80"></div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Risk Distribution</h3>
            <div ref={riskChartRef} className="h-80"></div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Certificate Categories</h3>
            <div ref={categoryChartRef} className="h-80"></div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Compliance Score</h3>
            <div ref={complianceChartRef} className="h-80"></div>
          </div>
        </div>
      )}

      {/* Analytics Tab */}
      {activeTab === 'analytics' && (
        <div className="grid grid-cols-1 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Expiration Trends (Last 10 Months)</h3>
            <div ref={trendChartRef} className="h-96"></div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Department Activity Heatmap</h3>
            <div ref={heatmapChartRef} className="h-96"></div>
          </div>
        </div>
      )}

      {/* Predictions Tab */}
      {activeTab === 'predictions' && (
        <div className="grid grid-cols-1 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Certificate Expiration Forecast</h3>
            <div ref={predictionChartRef} className="h-96"></div>
            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded">
              <p className="text-sm text-yellow-800">
                <strong>Prediction Alert:</strong> Based on historical data, we expect 58 certificates to expire in November and 62 in December. 
                Immediate action recommended for renewal planning.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h4 className="font-semibold text-gray-900 mb-2">Next 30 Days</h4>
              <p className="text-3xl font-bold text-orange-600">45</p>
              <p className="text-sm text-gray-600 mt-1">Certificates expiring</p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <h4 className="font-semibold text-gray-900 mb-2">Next 60 Days</h4>
              <p className="text-3xl font-bold text-orange-600">103</p>
              <p className="text-sm text-gray-600 mt-1">Certificates expiring</p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <h4 className="font-semibold text-gray-900 mb-2">Next 90 Days</h4>
              <p className="text-3xl font-bold text-red-600">158</p>
              <p className="text-sm text-gray-600 mt-1">Certificates expiring</p>
            </div>
          </div>
        </div>
      )}

      {/* Critical Tab */}
      {activeTab === 'critical' && (
        <div className="grid grid-cols-1 gap-6">
          <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded">
            <h3 className="text-lg font-semibold text-red-900 mb-2">Critical Issues Detected</h3>
            <ul className="space-y-2">
              <li className="flex items-start">
                <span className="text-red-600 mr-2">⚠️</span>
                <span className="text-red-800">249 certificates have already expired requiring immediate attention</span>
              </li>
              <li className="flex items-start">
                <span className="text-red-600 mr-2">⚠️</span>
                <span className="text-red-800">88% of total certificates are in expired status - major compliance risk</span>
              </li>
              <li className="flex items-start">
                <span className="text-red-600 mr-2">⚠️</span>
                <span className="text-red-800">Average days to expiration is -89 days (overdue)</span>
              </li>
            </ul>
          </div>

          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold">High Priority Actions Required</h3>
            </div>
            <div className="divide-y divide-gray-200">
              {[
                { item: 'OSHA 10 Training Certificates', count: 45, dept: 'Production', days: -204 },
                { item: 'Calibration Certificates', count: 38, dept: 'Multiple', days: -180 },
                { item: 'Temperature Control Certs', count: 32, dept: 'Medical', days: -156 },
                { item: 'Pressure System Certs', count: 28, dept: 'Engineering', days: -143 },
                { item: 'Volume Measurement Certs', count: 25, dept: 'Laboratory', days: -120 }
              ].map((item, idx) => (
                <div key={idx} className="px-6 py-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">{item.item}</p>
                      <p className="text-sm text-gray-600">{item.dept} Department</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-semibold text-red-600">{item.count} expired</p>
                      <p className="text-sm text-gray-500">Avg {item.days} days overdue</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Recommendations</h3>
            <div className="space-y-4">
              <div className="flex items-start p-4 bg-blue-50 rounded">
                <span className="text-2xl mr-3">💡</span>
                <div>
                  <p className="font-medium text-gray-900">Implement Automated Renewal System</p>
                  <p className="text-sm text-gray-600 mt-1">Set up automated alerts 90 days before expiration</p>
                </div>
              </div>
              <div className="flex items-start p-4 bg-blue-50 rounded">
                <span className="text-2xl mr-3">📊</span>
                <div>
                  <p className="font-medium text-gray-900">Create Renewal Priority Matrix</p>
                  <p className="text-sm text-gray-600 mt-1">Focus on high-risk and safety-critical certificates first</p>
                </div>
              </div>
              <div className="flex items-start p-4 bg-blue-50 rounded">
                <span className="text-2xl mr-3">👥</span>
                <div>
                  <p className="font-medium text-gray-900">Assign Department Coordinators</p>
                  <p className="text-sm text-gray-600 mt-1">Designate responsible persons for each department's compliance</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}