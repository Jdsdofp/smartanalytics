import { useEffect, useRef, useState } from 'react';
import * as echarts from 'echarts';
import { ArrowDownTrayIcon, ChartBarIcon, CheckCircleIcon, ClipboardDocumentCheckIcon, CubeIcon, CurrencyDollarIcon, DocumentTextIcon, ExclamationTriangleIcon, MapPinIcon, PresentationChartLineIcon, WrenchScrewdriverIcon } from '@heroicons/react/24/outline';
import useAssetManagement from '../../hooks/useAssetManagement';

export default function AssetManagement() {
  const [activeSection, setActiveSection] = useState('dashboard');
  
  // Use o hook personalizado
  const {
    loading,
    error,
    charts,
    kpi,
    ageBrackets,
    alerts,
    financial,
    executive,
    tracking,
    costCenters,
    maintenance,
    audit,
  } = useAssetManagement();

  // Refs para os charts
  const chartDepartmentRef = useRef(null);
  const chartCategoryCostRef = useRef(null);
  const chartCostCenterRef = useRef(null);
  const chartInvestmentRef = useRef(null);
  const chartDepreciationRef = useRef(null);
  const chartCoverageRef = useRef(null);
  const chartMaintenanceRef = useRef(null);
  const chartAuditRef = useRef(null);

  // Initialize Department Chart
  const initDepartmentChart = () => {
    if (chartDepartmentRef.current && charts.department.length > 0) {
      const chart = echarts.init(chartDepartmentRef.current);
      chart.setOption({
        tooltip: {
          trigger: 'item',
          formatter: '{b}: {c} ({d}%)'
        },
        legend: {
          orient: 'vertical',
          right: 10,
          top: 'center',
          textStyle: { fontSize: 12 }
        },
        series: [{
          type: 'pie',
          radius: ['40%', '70%'],
          data: charts.department,
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.5)'
            }
          },
          label: {
            show: true,
            formatter: '{b}\n{d}%'
          }
        }],
        color: ['#5B93FF', '#2DD36F', '#FF9500', '#FF4757', '#00D4AA', '#9D4EDD', '#E67E22']
      });

      return () => chart.dispose();
    }
  };

  // Initialize Category Cost Chart
  const initCategoryCostChart = () => {
    if (chartCategoryCostRef.current && charts.categoryCost.length > 0) {
      const chart = echarts.init(chartCategoryCostRef.current);
      chart.setOption({
        tooltip: {
          trigger: 'axis',
          axisPointer: { type: 'shadow' },
          formatter: function (params: any) {
            return params[0].name + '<br/>$' + (params[0].value / 1000).toFixed(0) + 'K';
          }
        },
        xAxis: {
          type: 'category',
          data: charts.categoryCost.map((d: any) => d.name),
          axisLabel: { rotate: 45, interval: 0 }
        },
        yAxis: {
          type: 'value',
          axisLabel: {
            formatter: function (value: any) {
              return '$' + (value / 1000).toFixed(0) + 'K';
            }
          }
        },
        series: [{
          type: 'bar',
          data: charts.categoryCost.map((d: any) => d.value),
          itemStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: '#5B93FF' },
              { offset: 1, color: '#4A7FE6' }
            ]),
            borderRadius: [8, 8, 0, 0]
          },
          label: {
            show: true,
            position: 'top',
            formatter: function (params: any) {
              return '$' + (params.value / 1000).toFixed(0) + 'K';
            }
          }
        }],
        grid: { left: '10%', right: '5%', bottom: '15%', top: '5%' }
      });

      return () => chart.dispose();
    }
  };

  // Initialize Cost Center Chart
  const initCostCenterChart = () => {
    if (chartCostCenterRef.current && charts.costCenter.length > 0) {
      const chart = echarts.init(chartCostCenterRef.current);
      
      chart.setOption({
        tooltip: {
          trigger: 'axis',
          axisPointer: { type: 'shadow' }
        },
        xAxis: { type: 'value' },
        yAxis: {
          type: 'category',
          data: charts.costCenter.map((d: any) => d.name)
        },
        series: [{
          type: 'bar',
          data: charts.costCenter.map((d: any) => d.value),
          itemStyle: {
            color: '#2DD36F',
            borderRadius: [0, 5, 5, 0]
          },
          label: { show: true, position: 'right' }
        }],
        grid: { left: '25%', right: '10%' }
      });

      return () => chart.dispose();
    }
  };

  // Initialize Investment Chart
  const initInvestmentChart = () => {
    if (chartInvestmentRef.current && charts.investment.categories.length > 0) {
      const chart = echarts.init(chartInvestmentRef.current);
      
      chart.setOption({
        tooltip: {
          trigger: 'axis',
          axisPointer: { type: 'shadow' }
        },
        legend: {
          data: ['Purchase Cost', 'Replacement Cost'],
          bottom: 10
        },
        xAxis: { 
          type: 'value', 
          axisLabel: { formatter: '${value/1000}K' } 
        },
        yAxis: { 
          type: 'category', 
          data: charts.investment.categories 
        },
        series: [
          {
            name: 'Purchase Cost',
            type: 'bar',
            data: charts.investment.purchase,
            itemStyle: { color: '#5B93FF' }
          },
          {
            name: 'Replacement Cost',
            type: 'bar',
            data: charts.investment.replacement,
            itemStyle: { color: '#9D4EDD' }
          }
        ],
        grid: { left: '15%', right: '10%', bottom: '15%' }
      });

      return () => chart.dispose();
    }
  };

  // Initialize Depreciation Chart
  const initDepreciationChart = () => {
    if (chartDepreciationRef.current && charts.depreciation.categories.length > 0) {
      const chart = echarts.init(chartDepreciationRef.current);
      
      chart.setOption({
        tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
        legend: { data: ['Original Value', 'Current Value'], bottom: 10 },
        xAxis: { 
          type: 'category', 
          data: charts.depreciation.categories, 
          axisLabel: { rotate: 45 } 
        },
        yAxis: { 
          type: 'value', 
          axisLabel: { formatter: '${value/1000}K' } 
        },
        series: [
          {
            name: 'Original Value',
            type: 'bar',
            data: charts.depreciation.original,
            itemStyle: { color: '#FF9500' }
          },
          {
            name: 'Current Value',
            type: 'bar',
            data: charts.depreciation.current,
            itemStyle: { color: '#2DD36F' }
          }
        ],
        grid: { left: '10%', right: '5%', bottom: '20%' }
      });

      return () => chart.dispose();
    }
  };

  // Initialize Coverage Chart
  const initCoverageChart = () => {
    if (chartCoverageRef.current && charts.coverage.length > 0) {
      const chart = echarts.init(chartCoverageRef.current);
      
      chart.setOption({
        tooltip: { trigger: 'item' },
        legend: { bottom: 10 },
        series: [{
          type: 'pie',
          radius: '60%',
          data: charts.coverage,
          label: { formatter: '{b}\n{c}' }
        }],
        color: ['#FF9500', '#5B93FF', '#FF4757', '#E67E22']
      });

      return () => chart.dispose();
    }
  };

  // Initialize Maintenance Chart
  const initMaintenanceChart = () => {
    if (chartMaintenanceRef.current && charts.maintenance.weeks.length > 0) {
      const chart = echarts.init(chartMaintenanceRef.current);
      
      chart.setOption({
        tooltip: { trigger: 'axis' },
        xAxis: { type: 'category', data: charts.maintenance.weeks },
        yAxis: { type: 'value' },
        series: [{
          type: 'bar',
          data: charts.maintenance.scheduled,
          itemStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: '#00D4AA' },
              { offset: 1, color: '#00A884' }
            ]),
            borderRadius: [8, 8, 0, 0]
          },
          label: { show: true, position: 'top' }
        }],
        grid: { left: '10%', right: '5%', bottom: '10%' }
      });

      return () => chart.dispose();
    }
  };

  // Initialize Audit Chart
  const initAuditChart = () => {
    if (chartAuditRef.current && charts.audit.categories.length > 0) {
      const chart = echarts.init(chartAuditRef.current);
      
      chart.setOption({
        tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
        xAxis: { 
          type: 'category', 
          data: charts.audit.categories, 
          axisLabel: { rotate: 45, interval: 0 } 
        },
        yAxis: { 
          type: 'value', 
          max: 100, 
          axisLabel: { formatter: '{value}%' } 
        },
        series: [{
          type: 'bar',
          data: charts.audit.compliance,
          itemStyle: {
            color: function (params: any) {
              if (params.value >= 80) return '#2DD36F';
              if (params.value >= 60) return '#FF9500';
              return '#FF4757';
            },
            borderRadius: [8, 8, 0, 0]
          },
          label: { show: true, position: 'top', formatter: '{c}%' }
        }],
        grid: { left: '10%', right: '5%', bottom: '20%' }
      });

      return () => chart.dispose();
    }
  };

  // Initialize charts based on active section
  const initChartsForSection = (sectionId: any) => {
    setTimeout(() => {
      if (sectionId === 'dashboard' || sectionId === 'executive') {
        initDepartmentChart();
        initCategoryCostChart();
        initCostCenterChart();
        initInvestmentChart();
      }

      if (sectionId === 'financial') {
        initDepreciationChart();
        initCoverageChart();
      }

      if (sectionId === 'maintenance') {
        initMaintenanceChart();
      }

      if (sectionId === 'audit') {
        initAuditChart();
      }
    }, 100);
  };

  // Handle section change
  const showSection = (sectionId: any) => {
    setActiveSection(sectionId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Initialize charts on mount and when section changes
  useEffect(() => {
    if (!loading) {
      initChartsForSection(activeSection);
    }

    const handleResize = () => {
      if (!loading) {
        initChartsForSection(activeSection);
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [activeSection, loading, charts]);

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary-500 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg font-medium">Loading Asset Dashboard...</p>
          <p className="text-gray-500 text-sm mt-2">Please wait while we fetch your data</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-center max-w-md">
          <ExclamationTriangleIcon className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Dashboard</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-100 text-gray-900">
      
      {/* Sidebar Navigation */}
      <nav className="bg-white border-b border-gray-200 overflow-x-auto overflow-y-hidden scrollbar-hide">
        <ul className="list-none p-0 m-0 flex h-12 justify-center gap-2 px-4 min-w-max max-[1450px]:justify-start">
          {/* Dashboard */}
          <li className="list-none h-full">
            <button
              onClick={() => showSection('dashboard')}
              className="cursor-pointer flex items-center h-full transition-all duration-200"
            >
              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full transition-all duration-200 ${
                activeSection === 'dashboard'
                  ? 'bg-gradient-to-br from-primary-300 to-primary-700 text-white'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`}>
                <ChartBarIcon className="w-4 h-4" />
                <span className="text-sm font-medium max-md:hidden">Dashboard</span>
              </div>
            </button>
          </li>

          {/* Executive Overview */}
          <li className="list-none h-full">
            <button
              onClick={() => showSection('executive')}
              className="cursor-pointer flex items-center h-full transition-all duration-200"
            >
              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full transition-all duration-200 ${
                activeSection === 'executive'
                  ? 'bg-gradient-to-br from-primary-300 to-primary-700 text-white'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`}>
                <PresentationChartLineIcon className="w-4 h-4" />
                <span className="text-sm font-medium max-md:hidden">Executive</span>
              </div>
            </button>
          </li>

          {/* Asset Tracking */}
          <li className="list-none h-full">
            <button
              onClick={() => showSection('tracking')}
              className="cursor-pointer flex items-center h-full transition-all duration-200"
            >
              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full transition-all duration-200 relative ${
                activeSection === 'tracking'
                  ? 'bg-gradient-to-br from-primary-300 to-primary-700 text-white'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`}>
                <MapPinIcon className="w-4 h-4" />
                <span className="text-sm font-medium max-md:hidden">Tracking</span>
                {tracking.totalOutOfPlace > 0 && (
                  <span className="px-1.5 py-0.5 bg-red-500 text-white text-[9px] font-semibold rounded-full min-w-[16px] text-center">
                    {tracking.totalOutOfPlace}
                  </span>
                )}
              </div>
            </button>
          </li>

          {/* Financial Control */}
          <li className="list-none h-full">
            <button
              onClick={() => showSection('financial')}
              className="cursor-pointer flex items-center h-full transition-all duration-200"
            >
              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full transition-all duration-200 ${
                activeSection === 'financial'
                  ? 'bg-gradient-to-br from-primary-300 to-primary-700 text-white'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`}>
                <CurrencyDollarIcon className="w-4 h-4" />
                <span className="text-sm font-medium max-md:hidden">Financial</span>
              </div>
            </button>
          </li>

          {/* Maintenance */}
          <li className="list-none h-full">
            <button
              onClick={() => showSection('maintenance')}
              className="cursor-pointer flex items-center h-full transition-all duration-200"
            >
              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full transition-all duration-200 relative ${
                activeSection === 'maintenance'
                  ? 'bg-gradient-to-br from-primary-300 to-primary-700 text-white'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`}>
                <WrenchScrewdriverIcon className="w-4 h-4" />
                <span className="text-sm font-medium max-md:hidden">Maintenance</span>
                {maintenance.overdue > 0 && (
                  <span className="px-1.5 py-0.5 bg-orange-500 text-white text-[9px] font-semibold rounded-full min-w-[16px] text-center">
                    {maintenance.overdue}
                  </span>
                )}
              </div>
            </button>
          </li>

          {/* Audit & Governance */}
          <li className="list-none h-full">
            <button
              onClick={() => showSection('audit')}
              className="cursor-pointer flex items-center h-full transition-all duration-200"
            >
              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full transition-all duration-200 ${
                activeSection === 'audit'
                  ? 'bg-gradient-to-br from-primary-300 to-primary-700 text-white'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`}>
                <ClipboardDocumentCheckIcon className="w-4 h-4" />
                <span className="text-sm font-medium max-md:hidden">Audit</span>
              </div>
            </button>
          </li>

          {/* Custom Reports */}
          <li className="list-none h-full">
            <button
              onClick={() => showSection('reports')}
              className="cursor-pointer flex items-center h-full transition-all duration-200"
            >
              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full transition-all duration-200 ${
                activeSection === 'reports'
                  ? 'bg-gradient-to-br from-primary-300 to-primary-700 text-white'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`}>
                <DocumentTextIcon className="w-4 h-4" />
                <span className="text-sm font-medium max-md:hidden">Reports</span>
              </div>
            </button>
          </li>

          {/* Export Data */}
          <li className="list-none h-full">
            <button
              onClick={() => showSection('exports')}
              className="cursor-pointer flex items-center h-full transition-all duration-200"
            >
              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full transition-all duration-200 ${
                activeSection === 'exports'
                  ? 'bg-gradient-to-br from-primary-300 to-primary-700 text-white'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`}>
                <ArrowDownTrayIcon className="w-4 h-4" />
                <span className="text-sm font-medium max-md:hidden">Export</span>
              </div>
            </button>
          </li>
        </ul>
      </nav>

      {/* Main Content */}
      <div className="ml-0 p-1 min-h-[calc(100vh-130px)]">

        {/* SECTION: DASHBOARD */}
        {activeSection === 'dashboard' && (
          <div className="animate-[fadeIn_0.3s]">
            <div className="mb-8">
              <h1 className="text-[28px] font-bold text-gray-900 mb-2">Asset Management Dashboard</h1>
              <p className="text-sm text-gray-600">Real-time overview of your asset portfolio</p>
            </div>

            {/* KPI Cards Row - DADOS REAIS */}
            <div className="grid grid-cols-6 gap-5 mb-5 max-xl:grid-cols-3 max-lg:grid-cols-2 max-md:grid-cols-1">
              {/* Total Assets */}
              <div className="bg-white rounded-xl p-5 flex flex-col gap-3 shadow-[0_2px_8px_rgba(0,0,0,0.06)] transition-all hover:shadow-[0_4px_12px_rgba(0,0,0,0.1)] hover:-translate-y-0.5 relative overflow-hidden">
                <div className="flex justify-between items-start">
                  <div className="text-xs font-medium text-gray-600 uppercase tracking-wide">Total Assets</div>
                  <div className="w-10 h-10 rounded-[10px] flex items-center justify-center text-white bg-[#5B93FF]">
                    <CubeIcon className="w-6 h-6" />
                  </div>
                </div>
                <div className="text-[32px] font-bold text-gray-900 leading-none">
                  {kpi.totalAssets.toLocaleString()}
                </div>
                <div className="flex items-center gap-1.5 text-xs">
                  <div className={`flex items-center gap-1 font-medium ${
                    kpi.assetsTrend.isPositive ? 'text-[#2DD36F]' : 'text-[#FF4757]'
                  }`}>
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d={
                        kpi.assetsTrend.direction === 'up' 
                          ? "M5.293 7.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L6.707 7.707a1 1 0 01-1.414 0z"
                          : kpi.assetsTrend.direction === 'down'
                          ? "M14.707 12.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 14.586V3a1 1 0 012 0v11.586l2.293-2.293a1 1 0 011.414 0z"
                          : "M3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                      } clipRule="evenodd" />
                    </svg>
                    <span>{kpi.assetsTrend.value.toFixed(1)}%</span>
                  </div>
                  <span className="text-gray-600">vs last month</span>
                </div>
              </div>

              {/* Total Categories */}
              <div className="bg-white rounded-xl p-5 flex flex-col gap-3 shadow-[0_2px_8px_rgba(0,0,0,0.06)] transition-all hover:shadow-[0_4px_12px_rgba(0,0,0,0.1)] hover:-translate-y-0.5 relative overflow-hidden">
                <div className="flex justify-between items-start">
                  <div className="text-xs font-medium text-gray-600 uppercase tracking-wide">Total Categories</div>
                  <div className="w-10 h-10 rounded-[10px] flex items-center justify-center text-white bg-[#2DD36F]">
                    <ChartBarIcon className="w-6 h-6" />
                  </div>
                </div>
                <div className="text-[32px] font-bold text-gray-900 leading-none">
                  {kpi.totalCategories}
                </div>
                <div className="flex items-center gap-1.5 text-xs">
                  <div className="flex items-center gap-1 font-medium text-gray-600">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                    </svg>
                    <span>0%</span>
                  </div>
                  <span className="text-gray-600">no change</span>
                </div>
              </div>

              {/* Total Investment */}
              <div className="bg-white rounded-xl p-5 flex flex-col gap-3 shadow-[0_2px_8px_rgba(0,0,0,0.06)] transition-all hover:shadow-[0_4px_12px_rgba(0,0,0,0.1)] hover:-translate-y-0.5 relative overflow-hidden">
                <div className="flex justify-between items-start">
                  <div className="text-xs font-medium text-gray-600 uppercase tracking-wide">Total Investment</div>
                  <div className="w-10 h-10 rounded-[10px] flex items-center justify-center text-white bg-[#9D4EDD]">
                    <CurrencyDollarIcon className="w-6 h-6" />
                  </div>
                </div>
                <div className="text-[32px] font-bold text-gray-900 leading-none">
                  {kpi.totalInvestment}
                </div>
                <div className="flex items-center gap-1.5 text-xs">
                  <span className="text-gray-600">from purchase costs</span>
                </div>
              </div>

              {/* Misplaced Items */}
              <div className="bg-white rounded-xl p-5 flex flex-col gap-3 shadow-[0_2px_8px_rgba(0,0,0,0.06)] transition-all hover:shadow-[0_4px_12px_rgba(0,0,0,0.1)] hover:-translate-y-0.5 relative overflow-hidden">
                <div className="flex justify-between items-start">
                  <div className="text-xs font-medium text-gray-600 uppercase tracking-wide">Misplaced Items</div>
                  <div className="w-10 h-10 rounded-[10px] flex items-center justify-center text-white bg-[#FF9500]">
                    <ExclamationTriangleIcon className="w-6 h-6" />
                  </div>
                </div>
                <div className="text-[32px] font-bold text-gray-900 leading-none">
                  {kpi.misplacedItems}
                </div>
                <div className="flex items-center gap-1.5 text-xs">
                  <div className={`flex items-center gap-1 font-medium ${
                    kpi.misplacedTrend.isPositive ? 'text-[#2DD36F]' : 'text-[#FF4757]'
                  }`}>
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d={
                        kpi.misplacedTrend.direction === 'down' 
                          ? "M14.707 12.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 14.586V3a1 1 0 012 0v11.586l2.293-2.293a1 1 0 011.414 0z"
                          : kpi.misplacedTrend.direction === 'up'
                          ? "M5.293 7.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L6.707 7.707a1 1 0 01-1.414 0z"
                          : "M3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                      } clipRule="evenodd" />
                    </svg>
                    <span>{kpi.misplacedTrend.value.toFixed(1)}%</span>
                  </div>
                  <span className="text-gray-600">
                    {kpi.misplacedTrend.isPositive ? 'improvement' : 'increase'}
                  </span>
                </div>
              </div>

              {/* Maintenance Due */}
              <div className="bg-white rounded-xl p-5 flex flex-col gap-3 shadow-[0_2px_8px_rgba(0,0,0,0.06)] transition-all hover:shadow-[0_4px_12px_rgba(0,0,0,0.1)] hover:-translate-y-0.5 relative overflow-hidden">
                <div className="flex justify-between items-start">
                  <div className="text-xs font-medium text-gray-600 uppercase tracking-wide">Maintenance Due</div>
                  <div className="w-10 h-10 rounded-[10px] flex items-center justify-center text-white bg-[#FF4757]">
                    <WrenchScrewdriverIcon className="w-6 h-6" />
                  </div>
                </div>
                <div className="text-[32px] font-bold text-gray-900 leading-none">
                  {kpi.maintenanceDue}
                </div>
                <div className="flex items-center gap-1.5 text-xs">
                  <span className="text-gray-600">needs attention</span>
                </div>
              </div>

              {/* Serial Completion */}
              <div className="bg-white rounded-xl p-5 flex flex-col gap-3 shadow-[0_2px_8px_rgba(0,0,0,0.06)] transition-all hover:shadow-[0_4px_12px_rgba(0,0,0,0.1)] hover:-translate-y-0.5 relative overflow-hidden">
                <div className="flex justify-between items-start">
                  <div className="text-xs font-medium text-gray-600 uppercase tracking-wide">Serial Completion</div>
                  <div className="w-10 h-10 rounded-[10px] flex items-center justify-center text-white bg-[#00D4AA]">
                    <CheckCircleIcon className="w-6 h-6" />
                  </div>
                </div>
                <div className="text-[32px] font-bold text-gray-900 leading-none">
                  {kpi.serialCompletion}%
                </div>
                <div className="flex items-center gap-1.5 text-xs">
                  <span className="text-gray-600">data quality</span>
                </div>
              </div>
            </div>

            {/* Age Bracket Cards Row - DADOS REAIS */}
            <div className="grid grid-cols-4 gap-5 mb-5 max-lg:grid-cols-2 max-md:grid-cols-1">
              {ageBrackets.map((bracket: any, index: number) => (
                <div key={index} className="bg-gradient-to-br from-[#8B5CF6] to-[#6B46C1] rounded-xl p-6 text-white shadow-[0_4px_12px_rgba(139,92,246,0.3)] transition-all hover:-translate-y-1 hover:shadow-[0_8px_20px_rgba(139,92,246,0.4)]">
                  <div className="text-[13px] font-medium opacity-90 mb-2">{bracket.label}</div>
                  <div className="text-[40px] font-bold leading-none">{bracket.count}</div>
                </div>
              ))}
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-2 gap-5 mb-5 max-lg:grid-cols-1">
              <div className="bg-white rounded-xl p-6 shadow-[0_2px_8px_rgba(0,0,0,0.06)]">
                <div className="flex justify-between items-center mb-5">
                  <div className="text-base font-semibold text-gray-900">Assets by Department</div>
                  <div className="flex gap-2">
                    <button className="w-9 h-9 rounded-lg border-0 bg-gray-100 text-gray-600 cursor-pointer flex items-center justify-center hover:bg-gray-300 transition-all" title="Download">
                      <ArrowDownTrayIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div ref={chartDepartmentRef} className="w-full h-[350px]"></div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-[0_2px_8px_rgba(0,0,0,0.06)]">
                <div className="flex justify-between items-center mb-5">
                  <div className="text-base font-semibold text-gray-900">Average Purchase Cost by Category</div>
                  <div className="flex gap-2">
                    <button className="w-9 h-9 rounded-lg border-0 bg-gray-100 text-gray-600 cursor-pointer flex items-center justify-center hover:bg-gray-300 transition-all" title="Download">
                      <ArrowDownTrayIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div ref={chartCategoryCostRef} className="w-full h-[350px]"></div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-5 max-lg:grid-cols-1">
              <div className="bg-white rounded-xl p-6 shadow-[0_2px_8px_rgba(0,0,0,0.06)]">
                <div className="flex justify-between items-center mb-5">
                  <div className="text-base font-semibold text-gray-900">Assets by Cost Center</div>
                </div>
                <div ref={chartCostCenterRef} className="w-full h-[350px]"></div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-[0_2px_8px_rgba(0,0,0,0.06)]">
                <div className="flex justify-between items-center mb-5">
                  <div className="text-base font-semibold text-gray-900">Investment by Cost Center</div>
                </div>
                <div ref={chartInvestmentRef} className="w-full h-[350px]"></div>
              </div>
            </div>
          </div>
        )}

        {/* SECTION: EXECUTIVE OVERVIEW */}
        {activeSection === 'executive' && (
          <div className="animate-[fadeIn_0.3s]">
            <div className="mb-8">
              <h1 className="text-[28px] font-bold text-gray-900 mb-2">Executive Overview</h1>
              <p className="text-sm text-gray-600">High-level insights for management decisions</p>
            </div>

            <div className="grid grid-cols-2 gap-5 max-lg:grid-cols-1">
              <div className="bg-white rounded-xl p-5 shadow-[0_2px_8px_rgba(0,0,0,0.06)]">
                <h3 className="mb-4 text-base font-semibold">Asset Distribution Summary</h3>
                <div className="flex justify-between items-center py-3 border-b border-gray-300 last:border-b-0">
                  <span className="text-sm text-gray-600">In Use</span>
                  <span className="text-base font-semibold text-gray-900">
                    {executive.distribution.inUse.toLocaleString()} ({((executive.distribution.inUse / kpi.totalAssets) * 100).toFixed(1)}%)
                  </span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-gray-300 last:border-b-0">
                  <span className="text-sm text-gray-600">Available</span>
                  <span className="text-base font-semibold text-gray-900">
                    {executive.distribution.available.toLocaleString()} ({((executive.distribution.available / kpi.totalAssets) * 100).toFixed(1)}%)
                  </span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-gray-300 last:border-b-0">
                  <span className="text-sm text-gray-600">In Transit</span>
                  <span className="text-base font-semibold text-gray-900">
                    {executive.distribution.inTransit.toLocaleString()} ({((executive.distribution.inTransit / kpi.totalAssets) * 100).toFixed(1)}%)
                  </span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-gray-300 last:border-b-0">
                  <span className="text-sm text-gray-600">Under Maintenance</span>
                  <span className="text-base font-semibold text-gray-900">
                    {executive.distribution.underMaintenance.toLocaleString()} ({((executive.distribution.underMaintenance / kpi.totalAssets) * 100).toFixed(1)}%)
                  </span>
                </div>
              </div>

              <div className="bg-white rounded-xl p-5 shadow-[0_2px_8px_rgba(0,0,0,0.06)]">
                <h3 className="mb-4 text-base font-semibold">Financial Summary</h3>
                <div className="flex justify-between items-center py-3 border-b border-gray-300 last:border-b-0">
                  <span className="text-sm text-gray-600">Purchase Cost</span>
                  <span className="text-base font-semibold text-gray-900">
                    ${(executive.financial.purchaseCost / 1000000).toFixed(2)}M
                  </span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-gray-300 last:border-b-0">
                  <span className="text-sm text-gray-600">Replacement Cost</span>
                  <span className="text-base font-semibold text-gray-900">
                    ${(executive.financial.replacementCost / 1000000).toFixed(2)}M
                  </span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-gray-300 last:border-b-0">
                  <span className="text-sm text-gray-600">Net Book Value</span>
                  <span className="text-base font-semibold text-gray-900">
                    ${(executive.financial.netBookValue / 1000000).toFixed(2)}M
                  </span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-gray-300 last:border-b-0">
                  <span className="text-sm text-gray-600">Depreciation</span>
                  <span className="text-base font-semibold text-gray-900">
                    ${(executive.financial.depreciation / 1000).toFixed(0)}K
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SECTION: ASSET TRACKING */}
        {activeSection === 'tracking' && (
          <div className="animate-[fadeIn_0.3s]">
            <div className="mb-8">
              <h1 className="text-[28px] font-bold text-gray-900 mb-2">Asset Tracking</h1>
              <p className="text-sm text-gray-600">Real-time location and status monitoring</p>
            </div>

            {/* Alert Cards */}
            <div className="grid grid-cols-3 gap-5 mb-5 max-lg:grid-cols-1">
              <div className="bg-white rounded-xl p-5 border-l-4 border-[#FF4757] shadow-[0_2px_8px_rgba(0,0,0,0.06)] bg-[rgba(255,71,87,0.05)]">
                <div className="flex items-center gap-2.5 mb-2">
                  <ExclamationTriangleIcon className="w-5 h-5 text-[#FF4757]" />
                  <div className="text-sm font-semibold">Critical: Assets Out of Place</div>
                </div>
                <div className="text-[13px] text-gray-600 leading-relaxed">
                  <strong>{tracking.totalOutOfPlace} assets</strong> are currently outside their designated locations. 
                  Total value at risk: <strong>${(tracking.totalValueAtRisk / 1000).toFixed(0)}K</strong>. 
                  Avg days out: <strong>{tracking.avgDaysOutOfPlace}</strong>.
                </div>
              </div>

              <div className="bg-white rounded-xl p-5 border-l-4 border-[#FF9500] shadow-[0_2px_8px_rgba(0,0,0,0.06)] bg-[rgba(255,149,0,0.05)]">
                <div className="flex items-center gap-2.5 mb-2">
                  <MapPinIcon className="w-5 h-5 text-[#FF9500]" />
                  <div className="text-sm font-semibold">Warning: Unread Assets</div>
                </div>
                <div className="text-[13px] text-gray-600 leading-relaxed">
                  <strong>{alerts.critical.unread} assets</strong> haven't been read in over 7 days. 
                  Review tracking status and investigate potential issues.
                </div>
              </div>

              <div className="bg-white rounded-xl p-5 border-l-4 border-[#5B93FF] shadow-[0_2px_8px_rgba(0,0,0,0.06)] bg-[rgba(91,147,255,0.05)]">
                <div className="flex items-center gap-2.5 mb-2">
                  <i className="text-lg fas fa-bell text-[#5B93FF]"></i>
                  <div className="text-sm font-semibold">Info: Alarmed Assets</div>
                </div>
                <div className="text-[13px] text-gray-600 leading-relaxed">
                  <strong>{alerts.critical.alarmed} assets</strong> have triggered alarms. 
                  All cases under investigation.
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SECTION: FINANCIAL CONTROL */}
        {activeSection === 'financial' && (
          <div className="animate-[fadeIn_0.3s]">
            <div className="mb-8">
              <h1 className="text-[28px] font-bold text-gray-900 mb-2">Financial Control</h1>
              <p className="text-sm text-gray-600">CFO dashboard for asset governance</p>
            </div>

            {/* Financial KPIs */}
            <div className="grid grid-cols-4 gap-5 mb-5 max-lg:grid-cols-2 max-md:grid-cols-1">
              <div className="bg-white rounded-xl p-5 flex flex-col gap-3 shadow-[0_2px_8px_rgba(0,0,0,0.06)]">
                <div className="text-xs font-medium text-gray-600 uppercase tracking-wide">Total Purchase Cost</div>
                <div className="text-[32px] font-bold text-gray-900 leading-none">
                  ${(financial.totalPurchaseCost / 1000000).toFixed(2)}M
                </div>
              </div>

              <div className="bg-white rounded-xl p-5 flex flex-col gap-3 shadow-[0_2px_8px_rgba(0,0,0,0.06)]">
                <div className="text-xs font-medium text-gray-600 uppercase tracking-wide">Replacement Cost</div>
                <div className="text-[32px] font-bold text-gray-900 leading-none">
                  ${(financial.totalReplacementCost / 1000000).toFixed(2)}M
                </div>
              </div>

              <div className="bg-white rounded-xl p-5 flex flex-col gap-3 shadow-[0_2px_8px_rgba(0,0,0,0.06)]">
                <div className="text-xs font-medium text-gray-600 uppercase tracking-wide">Net Book Value</div>
                <div className="text-[32px] font-bold text-gray-900 leading-none">
                  ${(financial.totalNetBookValue / 1000000).toFixed(2)}M
                </div>
              </div>

              <div className="bg-white rounded-xl p-5 flex flex-col gap-3 shadow-[0_2px_8px_rgba(0,0,0,0.06)]">
                <div className="text-xs font-medium text-gray-600 uppercase tracking-wide">Uninsured Value</div>
                <div className="text-[32px] font-bold text-gray-900 leading-none">
                  ${(financial.uninsuredValue / 1000).toFixed(0)}K
                </div>
                <div className="flex items-center gap-1 font-medium text-[#FF4757]">
                  <ExclamationTriangleIcon className="w-3 h-3" />
                  <span className="text-xs">At Risk</span>
                </div>
              </div>
            </div>

            {/* Financial Alert */}
            {alerts.financial.missingCostCenter > 0 && (
              <div className="bg-white rounded-xl p-5 border-l-4 border-[#FF4757] mb-4 shadow-[0_2px_8px_rgba(0,0,0,0.06)] bg-[rgba(255,71,87,0.05)]">
                <div className="flex items-center gap-2.5 mb-2">
                  <ExclamationTriangleIcon className="w-5 h-5 text-[#FF4757]" />
                  <div className="text-sm font-semibold">Critical: Missing Cost Center Assignment</div>
                </div>
                <div className="text-[13px] text-gray-600 leading-relaxed">
                  <strong>{alerts.financial.missingCostCenter} assets</strong> do not have a cost center assigned. 
                  This creates governance risk and prevents proper financial tracking. Immediate action required.
                </div>
              </div>
            )}

            {/* Charts */}
            <div className="grid grid-cols-2 gap-5 mb-5 max-lg:grid-cols-1">
              <div className="bg-white rounded-xl p-6 shadow-[0_2px_8px_rgba(0,0,0,0.06)]">
                <div className="flex justify-between items-center mb-5">
                  <div className="text-base font-semibold text-gray-900">Depreciation Analysis</div>
                </div>
                <div ref={chartDepreciationRef} className="w-full h-[350px]"></div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-[0_2px_8px_rgba(0,0,0,0.06)]">
                <div className="flex justify-between items-center mb-5">
                  <div className="text-base font-semibold text-gray-900">Insurance & Warranty Expiring</div>
                </div>
                <div ref={chartCoverageRef} className="w-full h-[350px]"></div>
              </div>
            </div>

            {/* Cost Center Performance Table */}
            <div className="bg-white rounded-xl p-6 shadow-[0_2px_8px_rgba(0,0,0,0.06)] overflow-x-auto">
              <div className="flex justify-between items-center p-0 mb-5">
                <div className="text-base font-semibold text-gray-900">Cost Center Financial Performance</div>
              </div>
              <table className="w-full border-collapse">
                <thead className="bg-gray-100 rounded-lg">
                  <tr>
                    <th className="p-3 text-left font-semibold text-xs uppercase text-gray-600 tracking-wide">Cost Center</th>
                    <th className="p-3 text-left font-semibold text-xs uppercase text-gray-600 tracking-wide">Assets</th>
                    <th className="p-3 text-left font-semibold text-xs uppercase text-gray-600 tracking-wide">Total Investment</th>
                    <th className="p-3 text-left font-semibold text-xs uppercase text-gray-600 tracking-wide">Utilization</th>
                    <th className="p-3 text-left font-semibold text-xs uppercase text-gray-600 tracking-wide">Data Quality</th>
                  </tr>
                </thead>
                <tbody>
                  {costCenters.map((cc: any, index: number) => (
                    <tr key={index} className="hover:bg-gray-100">
                      <td className="p-3.5 px-3 border-b border-gray-300 text-sm">{cc.name}</td>
                      <td className="p-3.5 px-3 border-b border-gray-300 text-sm">{cc.assets}</td>
                      <td className="p-3.5 px-3 border-b border-gray-300 text-sm">
                        ${(cc.investment / 1000).toFixed(0)}K
                      </td>
                      <td className="p-3.5 px-3 border-b border-gray-300 text-sm">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-semibold uppercase tracking-wide ${
                          cc.utilization >= 70 ? 'bg-[rgba(45,211,111,0.15)] text-[#2DD36F]' :
                          cc.utilization >= 50 ? 'bg-[rgba(255,149,0,0.15)] text-[#FF9500]' :
                          'bg-[rgba(255,71,87,0.15)] text-[#FF4757]'
                        }`}>
                          {cc.utilization}%
                        </span>
                      </td>
                      <td className="p-3.5 px-3 border-b border-gray-300 text-sm">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-semibold uppercase tracking-wide ${
                          cc.dataQuality >= 90 ? 'bg-[rgba(45,211,111,0.15)] text-[#2DD36F]' :
                          cc.dataQuality >= 70 ? 'bg-[rgba(255,149,0,0.15)] text-[#FF9500]' :
                          'bg-[rgba(255,71,87,0.15)] text-[#FF4757]'
                        }`}>
                          {cc.dataQuality}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* SECTION: MAINTENANCE */}
        {activeSection === 'maintenance' && (
          <div className="animate-[fadeIn_0.3s]">
            <div className="mb-8">
              <h1 className="text-[28px] font-bold text-gray-900 mb-2">Maintenance & Compliance</h1>
              <p className="text-sm text-gray-600">Service scheduling and overdue tracking</p>
            </div>

            {/* Maintenance KPIs */}
            <div className="grid grid-cols-4 gap-5 mb-5 max-lg:grid-cols-2 max-md:grid-cols-1">
              <div className="bg-white rounded-xl p-5 flex flex-col gap-3 shadow-[0_2px_8px_rgba(0,0,0,0.06)]">
                <div className="text-xs font-medium text-gray-600 uppercase tracking-wide">Overdue Maintenance</div>
                <div className="text-[32px] font-bold text-gray-900 leading-none">
                  {maintenance.overdue}
                </div>
                <div className="flex items-center gap-1 font-medium text-[#FF4757]">
                  <ExclamationTriangleIcon className="w-3 h-3" />
                  <span className="text-xs">Needs attention</span>
                </div>
              </div>

              <div className="bg-white rounded-xl p-5 flex flex-col gap-3 shadow-[0_2px_8px_rgba(0,0,0,0.06)]">
                <div className="text-xs font-medium text-gray-600 uppercase tracking-wide">Due This Week</div>
                <div className="text-[32px] font-bold text-gray-900 leading-none">
                  {maintenance.dueThisWeek}
                </div>
              </div>

              <div className="bg-white rounded-xl p-5 flex flex-col gap-3 shadow-[0_2px_8px_rgba(0,0,0,0.06)]">
                <div className="text-xs font-medium text-gray-600 uppercase tracking-wide">Due This Month</div>
                <div className="text-[32px] font-bold text-gray-900 leading-none">
                  {maintenance.dueThisMonth}
                </div>
              </div>

              <div className="bg-white rounded-xl p-5 flex flex-col gap-3 shadow-[0_2px_8px_rgba(0,0,0,0.06)]">
                <div className="text-xs font-medium text-gray-600 uppercase tracking-wide">Completed This Month</div>
                <div className="text-[32px] font-bold text-gray-900 leading-none">
                  {maintenance.completedThisMonth}
                </div>
                <div className="flex items-center gap-1 font-medium text-[#2DD36F]">
                  <CheckCircleIcon className="w-3 h-3" />
                  <span className="text-xs">{maintenance.completionRate}% rate</span>
                </div>
              </div>
            </div>

            {/* Maintenance Chart */}
            <div className="bg-white rounded-xl p-6 shadow-[0_2px_8px_rgba(0,0,0,0.06)]">
              <div className="flex justify-between items-center mb-5">
                <div className="text-base font-semibold text-gray-900">Maintenance Schedule - Next 30 Days</div>
              </div>
              <div ref={chartMaintenanceRef} className="w-full h-[350px]"></div>
            </div>
          </div>
        )}

        {/* SECTION: AUDIT & GOVERNANCE */}
        {activeSection === 'audit' && (
          <div className="animate-[fadeIn_0.3s]">
            <div className="mb-8">
              <h1 className="text-[28px] font-bold text-gray-900 mb-2">Audit & Governance</h1>
              <p className="text-sm text-gray-600">Compliance tracking and work order status</p>
            </div>

            {/* Audit KPIs */}
            <div className="grid grid-cols-4 gap-5 mb-5 max-lg:grid-cols-2 max-md:grid-cols-1">
              <div className="bg-white rounded-xl p-5 flex flex-col gap-3 shadow-[0_2px_8px_rgba(0,0,0,0.06)]">
                <div className="text-xs font-medium text-gray-600 uppercase tracking-wide">Work Order Pass Rate</div>
                <div className="text-[32px] font-bold text-gray-900 leading-none">
                  {audit.workOrderPassRate.toFixed(1)}%
                </div>
                <div className={`flex items-center gap-1 font-medium ${
                  audit.workOrderPassRate >= 80 ? 'text-[#2DD36F]' : 'text-[#FF9500]'
                }`}>
                  <CheckCircleIcon className="w-3 h-3" />
                  <span className="text-xs">
                    {audit.workOrderPassRate >= 80 ? 'Good' : 'Needs improvement'}
                  </span>
                </div>
              </div>

              <div className="bg-white rounded-xl p-5 flex flex-col gap-3 shadow-[0_2px_8px_rgba(0,0,0,0.06)]">
                <div className="text-xs font-medium text-gray-600 uppercase tracking-wide">Total Work Orders</div>
                <div className="text-[32px] font-bold text-gray-900 leading-none">
                  {audit.totalWorkOrders}
                </div>
              </div>

              <div className="bg-white rounded-xl p-5 flex flex-col gap-3 shadow-[0_2px_8px_rgba(0,0,0,0.06)]">
                <div className="text-xs font-medium text-gray-600 uppercase tracking-wide">Passed Inspections</div>
                <div className="text-[32px] font-bold text-gray-900 leading-none">
                  {audit.passed}
                </div>
              </div>

              <div className="bg-white rounded-xl p-5 flex flex-col gap-3 shadow-[0_2px_8px_rgba(0,0,0,0.06)]">
                <div className="text-xs font-medium text-gray-600 uppercase tracking-wide">Failed Inspections</div>
                <div className="text-[32px] font-bold text-gray-900 leading-none">
                  {audit.failed}
                </div>
                <div className="flex items-center gap-1 font-medium text-[#FF4757]">
                  <ExclamationTriangleIcon className="w-3 h-3" />
                  <span className="text-xs">Requires attention</span>
                </div>
              </div>
            </div>

            {/* Audit Chart */}
            <div className="bg-white rounded-xl p-6 shadow-[0_2px_8px_rgba(0,0,0,0.06)]">
              <div className="flex justify-between items-center mb-5">
                <div className="text-base font-semibold text-gray-900">Compliance by Category</div>
              </div>
              <div ref={chartAuditRef} className="w-full h-[350px]"></div>
            </div>
          </div>
        )}

        {/* SECTION: REPORTS */}
        {activeSection === 'reports' && (
          <div className="animate-[fadeIn_0.3s]">
            <div className="mb-8">
              <h1 className="text-[28px] font-bold text-gray-900 mb-2">Custom Reports</h1>
              <p className="text-sm text-gray-600">Generate and schedule custom reports</p>
            </div>

            <div className="bg-white rounded-xl p-5 shadow-[0_2px_8px_rgba(0,0,0,0.06)] max-w-[600px]">
              <h3 className="mb-5">Report Templates</h3>
              <div className="flex justify-between items-center py-3 border-b border-gray-300">
                <span className="text-sm text-gray-600">Executive Summary</span>
                <button className="px-5 py-2.5 bg-[#5B93FF] text-white border-0 rounded-lg text-sm font-medium cursor-pointer hover:bg-[#4A7FE6]">Generate</button>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-gray-300">
                <span className="text-sm text-gray-600">Financial Summary</span>
                <button className="px-5 py-2.5 bg-[#5B93FF] text-white border-0 rounded-lg text-sm font-medium cursor-pointer hover:bg-[#4A7FE6]">Generate</button>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-gray-300">
                <span className="text-sm text-gray-600">Compliance Report</span>
                <button className="px-5 py-2.5 bg-[#5B93FF] text-white border-0 rounded-lg text-sm font-medium cursor-pointer hover:bg-[#4A7FE6]">Generate</button>
              </div>
              <div className="flex justify-between items-center py-3">
                <span className="text-sm text-gray-600">Asset Inventory</span>
                <button className="px-5 py-2.5 bg-[#5B93FF] text-white border-0 rounded-lg text-sm font-medium cursor-pointer hover:bg-[#4A7FE6]">Generate</button>
              </div>
            </div>
          </div>
        )}

        {/* SECTION: EXPORTS */}
        {activeSection === 'exports' && (
          <div className="animate-[fadeIn_0.3s]">
            <div className="mb-8">
              <h1 className="text-[28px] font-bold text-gray-900 mb-2">Export Data</h1>
              <p className="text-sm text-gray-600">Download data in various formats</p>
            </div>

            <div className="bg-white rounded-xl p-5 shadow-[0_2px_8px_rgba(0,0,0,0.06)] max-w-[600px]">
              <h3 className="mb-5">Export Options</h3>
              <div className="flex justify-between items-center py-3 border-b border-gray-300">
                <span className="text-sm text-gray-600">Export to Excel (XLSX)</span>
                <button className="px-5 py-2.5 bg-[#5B93FF] text-white border-0 rounded-lg text-sm font-medium cursor-pointer hover:bg-[#4A7FE6]">Download</button>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-gray-300">
                <span className="text-sm text-gray-600">Export to CSV</span>
                <button className="px-5 py-2.5 bg-[#5B93FF] text-white border-0 rounded-lg text-sm font-medium cursor-pointer hover:bg-[#4A7FE6]">Download</button>
              </div>
              <div className="flex justify-between items-center py-3">
                <span className="text-sm text-gray-600">Export to PDF</span>
                <button className="px-5 py-2.5 bg-[#5B93FF] text-white border-0 rounded-lg text-sm font-medium cursor-pointer hover:bg-[#4A7FE6]">Download</button>
              </div>
            </div>
          </div>
        )}

      </div>

      <style>{`
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