import { useEffect, useRef, useState } from 'react';
import * as echarts from 'echarts';
import { ArrowDownTrayIcon, ChartBarIcon, CheckCircleIcon, ClipboardDocumentCheckIcon, CubeIcon, CurrencyDollarIcon, DocumentTextIcon, ExclamationTriangleIcon, MapPinIcon, PresentationChartLineIcon, WrenchScrewdriverIcon } from '@heroicons/react/24/outline';

export default function AssetManagement() {
  const [activeSection, setActiveSection] = useState('dashboard');

  // Refs para os charts
  const chartDepartmentRef = useRef(null);
  const chartCategoryCostRef = useRef(null);
  const chartCostCenterRef = useRef(null);
  const chartInvestmentRef = useRef(null);
  const chartDepreciationRef = useRef(null);
  const chartCoverageRef = useRef(null);
  const chartMaintenanceRef = useRef(null);
  const chartAuditRef = useRef(null);

  // Chart Data
  const departmentData = [
    { name: 'IT Department', value: 234 },
    { name: 'Operations', value: 347 },
    { name: 'Finance', value: 156 },
    { name: 'HR', value: 89 },
    { name: 'Marketing', value: 123 },
    { name: 'Sales', value: 187 },
    { name: 'R&D', value: 98 }
  ];

  const categoryCostData = [
    { name: 'Computers', value: 450000 },
    { name: 'Vehicles', value: 380000 },
    { name: 'Equipment', value: 310000 },
    { name: 'Furniture', value: 220000 },
    { name: 'Appliances', value: 180000 },
    { name: 'Tools', value: 120000 }
  ];

  // Initialize Department Chart
  const initDepartmentChart = () => {
    if (chartDepartmentRef.current) {
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
          data: departmentData,
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
    if (chartCategoryCostRef.current) {
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
          data: categoryCostData.map(d => d.name),
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
          data: categoryCostData.map(d => d.value),
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
    if (chartCostCenterRef.current) {
      const chart = echarts.init(chartCostCenterRef.current);
      const data = [
        { name: 'CC-001 Operations', value: 347 },
        { name: 'CC-002 IT', value: 234 },
        { name: 'CC-003 Manufacturing', value: 412 },
        { name: 'CC-004 Logistics', value: 156 },
        { name: 'No Cost Center', value: 85 }
      ];

      chart.setOption({
        tooltip: {
          trigger: 'axis',
          axisPointer: { type: 'shadow' }
        },
        xAxis: { type: 'value' },
        yAxis: {
          type: 'category',
          data: data.map(d => d.name)
        },
        series: [{
          type: 'bar',
          data: data.map(d => d.value),
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
    if (chartInvestmentRef.current) {
      const chart = echarts.init(chartInvestmentRef.current);
      const ccData = ['CC-001', 'CC-002', 'CC-003', 'CC-004', 'NO_CC'];
      const purchase = [892500, 567800, 723400, 345600, 523000];
      const replacement = [1120000, 710000, 905000, 432000, 650000];

      chart.setOption({
        tooltip: {
          trigger: 'axis',
          axisPointer: { type: 'shadow' }
        },
        legend: {
          data: ['Purchase Cost', 'Replacement Cost'],
          bottom: 10
        },
        xAxis: { type: 'value', axisLabel: { formatter: '${value/1000}K' } },
        yAxis: { type: 'category', data: ccData },
        series: [
          {
            name: 'Purchase Cost',
            type: 'bar',
            data: purchase,
            itemStyle: { color: '#5B93FF' }
          },
          {
            name: 'Replacement Cost',
            type: 'bar',
            data: replacement,
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
    if (chartDepreciationRef.current) {
      const chart = echarts.init(chartDepreciationRef.current);
      const categories = ['Electronics', 'Vehicles', 'Machinery', 'Furniture', 'Tools'];
      const original = [1500000, 1200000, 1100000, 850000, 700000];
      const current = [1125000, 840000, 935000, 720000, 595000];

      chart.setOption({
        tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
        legend: { data: ['Original Value', 'Current Value'], bottom: 10 },
        xAxis: { type: 'category', data: categories, axisLabel: { rotate: 45 } },
        yAxis: { type: 'value', axisLabel: { formatter: '${value/1000}K' } },
        series: [
          {
            name: 'Original Value',
            type: 'bar',
            data: original,
            itemStyle: { color: '#FF9500' }
          },
          {
            name: 'Current Value',
            type: 'bar',
            data: current,
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
    if (chartCoverageRef.current) {
      const chart = echarts.init(chartCoverageRef.current);
      chart.setOption({
        tooltip: { trigger: 'item' },
        legend: { bottom: 10 },
        series: [{
          type: 'pie',
          radius: '60%',
          data: [
            { name: 'Insurance Expires This Month', value: 23 },
            { name: 'Warranty Expires This Month', value: 15 },
            { name: 'Insurance Already Expired', value: 8 },
            { name: 'Warranty Already Expired', value: 12 }
          ],
          label: { formatter: '{b}\n{c}' }
        }],
        color: ['#FF9500', '#5B93FF', '#FF4757', '#E67E22']
      });

      return () => chart.dispose();
    }
  };

  // Initialize Maintenance Chart
  const initMaintenanceChart = () => {
    if (chartMaintenanceRef.current) {
      const chart = echarts.init(chartMaintenanceRef.current);
      const weeks = ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
      const scheduled = [15, 12, 8, 12];

      chart.setOption({
        tooltip: { trigger: 'axis' },
        xAxis: { type: 'category', data: weeks },
        yAxis: { type: 'value' },
        series: [{
          type: 'bar',
          data: scheduled,
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
    if (chartAuditRef.current) {
      const chart = echarts.init(chartAuditRef.current);
      const categories = ['Electronics', 'Vehicles', 'Machinery', 'Furniture', 'Tools', 'Safety', 'IT Equipment'];
      const compliance = [85, 72, 68, 91, 77, 88, 79];

      chart.setOption({
        tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
        xAxis: { type: 'category', data: categories, axisLabel: { rotate: 45, interval: 0 } },
        yAxis: { type: 'value', max: 100, axisLabel: { formatter: '{value}%' } },
        series: [{
          type: 'bar',
          data: compliance,
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
    initChartsForSection(activeSection);

    const handleResize = () => {
      initChartsForSection(activeSection);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [activeSection]);

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
                <span className="px-1.5 py-0.5 bg-red-500 text-white text-[9px] font-semibold rounded-full min-w-[16px] text-center">
                  12
                </span>
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
                <span className="px-1.5 py-0.5 bg-orange-500 text-white text-[9px] font-semibold rounded-full min-w-[16px] text-center">
                  23
                </span>
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

            {/* KPI Cards Row */}
            <div className="grid grid-cols-6 gap-5 mb-5 max-xl:grid-cols-3 max-lg:grid-cols-2 max-md:grid-cols-1">
              <div className="bg-white rounded-xl p-5 flex flex-col gap-3 shadow-[0_2px_8px_rgba(0,0,0,0.06)] transition-all hover:shadow-[0_4px_12px_rgba(0,0,0,0.1)] hover:-translate-y-0.5 relative overflow-hidden">
                <div className="flex justify-between items-start">
                  <div className="text-xs font-medium text-gray-600 uppercase tracking-wide">Total Assets</div>
                  <div className="w-10 h-10 rounded-[10px] flex items-center justify-center text-white bg-[#5B93FF]">
                    <CubeIcon className="w-6 h-6" />
                  </div>
                </div>
                <div className="text-[32px] font-bold text-gray-900 leading-none">1,234</div>
                <div className="flex items-center gap-1.5 text-xs">
                  <div className="flex items-center gap-1 font-medium text-[#2DD36F]">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5.293 7.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L6.707 7.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                    <span>12.5%</span>
                  </div>
                  <span>vs last month</span>
                </div>
              </div>

              <div className="bg-white rounded-xl p-5 flex flex-col gap-3 shadow-[0_2px_8px_rgba(0,0,0,0.06)] transition-all hover:shadow-[0_4px_12px_rgba(0,0,0,0.1)] hover:-translate-y-0.5 relative overflow-hidden">
                <div className="flex justify-between items-start">
                  <div className="text-xs font-medium text-gray-600 uppercase tracking-wide">Total Categories</div>
                  <div className="w-10 h-10 rounded-[10px] flex items-center justify-center text-white bg-[#2DD36F]">
                    <ChartBarIcon className="w-6 h-6" />
                  </div>
                </div>
                <div className="text-[32px] font-bold text-gray-900 leading-none">45</div>
                <div className="flex items-center gap-1.5 text-xs">
                  <div className="flex items-center gap-1 font-medium text-gray-600">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                    </svg>
                    <span>0%</span>
                  </div>
                  <span>no change</span>
                </div>
              </div>

              <div className="bg-white rounded-xl p-5 flex flex-col gap-3 shadow-[0_2px_8px_rgba(0,0,0,0.06)] transition-all hover:shadow-[0_4px_12px_rgba(0,0,0,0.1)] hover:-translate-y-0.5 relative overflow-hidden">
                <div className="flex justify-between items-start">
                  <div className="text-xs font-medium text-gray-600 uppercase tracking-wide">Total Investment</div>
                  <div className="w-10 h-10 rounded-[10px] flex items-center justify-center text-white bg-[#9D4EDD]">
                    <CurrencyDollarIcon className="w-6 h-6" />
                  </div>
                </div>
                <div className="text-[32px] font-bold text-gray-900 leading-none">$2.50M</div>
                <div className="flex items-center gap-1.5 text-xs">
                  <div className="flex items-center gap-1 font-medium text-[#2DD36F]">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5.293 7.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L6.707 7.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                    <span>8.3%</span>
                  </div>
                  <span>vs last quarter</span>
                </div>
              </div>

              <div className="bg-white rounded-xl p-5 flex flex-col gap-3 shadow-[0_2px_8px_rgba(0,0,0,0.06)] transition-all hover:shadow-[0_4px_12px_rgba(0,0,0,0.1)] hover:-translate-y-0.5 relative overflow-hidden">
                <div className="flex justify-between items-start">
                  <div className="text-xs font-medium text-gray-600 uppercase tracking-wide">Misplaced Items</div>
                  <div className="w-10 h-10 rounded-[10px] flex items-center justify-center text-white bg-[#FF9500]">
                    <ExclamationTriangleIcon className="w-6 h-6" />
                  </div>
                </div>
                <div className="text-[32px] font-bold text-gray-900 leading-none">12</div>
                <div className="flex items-center gap-1.5 text-xs">
                  <div className="flex items-center gap-1 font-medium text-[#FF4757]">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M14.707 12.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 14.586V3a1 1 0 012 0v11.586l2.293-2.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span>-25%</span>
                  </div>
                  <span>improvement</span>
                </div>
              </div>

              <div className="bg-white rounded-xl p-5 flex flex-col gap-3 shadow-[0_2px_8px_rgba(0,0,0,0.06)] transition-all hover:shadow-[0_4px_12px_rgba(0,0,0,0.1)] hover:-translate-y-0.5 relative overflow-hidden">
                <div className="flex justify-between items-start">
                  <div className="text-xs font-medium text-gray-600 uppercase tracking-wide">Maintenance Due</div>
                  <div className="w-10 h-10 rounded-[10px] flex items-center justify-center text-white bg-[#FF4757]">
                    <WrenchScrewdriverIcon className="w-6 h-6" />
                  </div>
                </div>
                <div className="text-[32px] font-bold text-gray-900 leading-none">23</div>
                <div className="flex items-center gap-1.5 text-xs">
                  <div className="flex items-center gap-1 font-medium text-[#2DD36F]">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5.293 7.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L6.707 7.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                    <span>15%</span>
                  </div>
                  <span>needs attention</span>
                </div>
              </div>

              <div className="bg-white rounded-xl p-5 flex flex-col gap-3 shadow-[0_2px_8px_rgba(0,0,0,0.06)] transition-all hover:shadow-[0_4px_12px_rgba(0,0,0,0.1)] hover:-translate-y-0.5 relative overflow-hidden">
                <div className="flex justify-between items-start">
                  <div className="text-xs font-medium text-gray-600 uppercase tracking-wide">Serial Completion</div>
                  <div className="w-10 h-10 rounded-[10px] flex items-center justify-center text-white bg-[#00D4AA]">
                    <CheckCircleIcon className="w-6 h-6" />
                  </div>
                </div>
                <div className="text-[32px] font-bold text-gray-900 leading-none">87%</div>
                <div className="flex items-center gap-1.5 text-xs">
                  <div className="flex items-center gap-1 font-medium text-[#2DD36F]">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5.293 7.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L6.707 7.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                    <span>3%</span>
                  </div>
                  <span>data quality</span>
                </div>
              </div>
            </div>

            {/* Age Bracket Cards Row */}
            <div className="grid grid-cols-4 gap-5 mb-5 max-lg:grid-cols-2 max-md:grid-cols-1">
              <div className="bg-gradient-to-br from-[#8B5CF6] to-[#6B46C1] rounded-xl p-6 text-white shadow-[0_4px_12px_rgba(139,92,246,0.3)] transition-all hover:-translate-y-1 hover:shadow-[0_8px_20px_rgba(139,92,246,0.4)]">
                <div className="text-[13px] font-medium opacity-90 mb-2">Assets 0-3 Months</div>
                <div className="text-[40px] font-bold leading-none">156</div>
              </div>

              <div className="bg-gradient-to-br from-[#8B5CF6] to-[#6B46C1] rounded-xl p-6 text-white shadow-[0_4px_12px_rgba(139,92,246,0.3)] transition-all hover:-translate-y-1 hover:shadow-[0_8px_20px_rgba(139,92,246,0.4)]">
                <div className="text-[13px] font-medium opacity-90 mb-2">Assets 3-12 Months</div>
                <div className="text-[40px] font-bold leading-none">289</div>
              </div>

              <div className="bg-gradient-to-br from-[#8B5CF6] to-[#6B46C1] rounded-xl p-6 text-white shadow-[0_4px_12px_rgba(139,92,246,0.3)] transition-all hover:-translate-y-1 hover:shadow-[0_8px_20px_rgba(139,92,246,0.4)]">
                <div className="text-[13px] font-medium opacity-90 mb-2">Assets 1-2 Years</div>
                <div className="text-[40px] font-bold leading-none">412</div>
              </div>

              <div className="bg-gradient-to-br from-[#8B5CF6] to-[#6B46C1] rounded-xl p-6 text-white shadow-[0_4px_12px_rgba(139,92,246,0.3)] transition-all hover:-translate-y-1 hover:shadow-[0_8px_20px_rgba(139,92,246,0.4)]">
                <div className="text-[13px] font-medium opacity-90 mb-2">Assets Over 2 Years</div>
                <div className="text-[40px] font-bold leading-none">377</div>
              </div>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-2 gap-5 mb-5 max-lg:grid-cols-1">
              <div className="bg-white rounded-xl p-6 shadow-[0_2px_8px_rgba(0,0,0,0.06)]">
                <div className="flex justify-between items-center mb-5">
                  <div className="text-base font-semibold text-gray-900">Assets by Department</div>
                  <div className="flex gap-2">
                    <button className="w-9 h-9 rounded-lg border-0 bg-gray-100 text-gray-600 cursor-pointer flex items-center justify-center hover:bg-gray-300 transition-all" title="Download">
                      <i className="fas fa-download"></i>
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
                      <i className="fas fa-download"></i>
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
                  <span className="text-base font-semibold text-gray-900">687 (55.7%)</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-gray-300 last:border-b-0">
                  <span className="text-sm text-gray-600">Available</span>
                  <span className="text-base font-semibold text-gray-900">412 (33.4%)</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-gray-300 last:border-b-0">
                  <span className="text-sm text-gray-600">In Transit</span>
                  <span className="text-base font-semibold text-gray-900">89 (7.2%)</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-gray-300 last:border-b-0">
                  <span className="text-sm text-gray-600">Under Maintenance</span>
                  <span className="text-base font-semibold text-gray-900">46 (3.7%)</span>
                </div>
              </div>

              <div className="bg-white rounded-xl p-5 shadow-[0_2px_8px_rgba(0,0,0,0.06)]">
                <h3 className="mb-4 text-base font-semibold">Financial Summary</h3>
                <div className="flex justify-between items-center py-3 border-b border-gray-300 last:border-b-0">
                  <span className="text-sm text-gray-600">Purchase Cost</span>
                  <span className="text-base font-semibold text-gray-900">$2.50M</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-gray-300 last:border-b-0">
                  <span className="text-sm text-gray-600">Replacement Cost</span>
                  <span className="text-base font-semibold text-gray-900">$3.12M</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-gray-300 last:border-b-0">
                  <span className="text-sm text-gray-600">Net Book Value</span>
                  <span className="text-base font-semibold text-gray-900">$2.18M</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-gray-300 last:border-b-0">
                  <span className="text-sm text-gray-600">Depreciation</span>
                  <span className="text-base font-semibold text-gray-900">$320K</span>
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
              <p className="text-sm text-gray-600">Real-time location and reading status</p>
            </div>

            {/* Alert Cards */}
            <div className="grid grid-cols-3 gap-5 mb-5 max-lg:grid-cols-1">
              <div className="bg-white rounded-xl p-5 border-l-4 border-[#FF4757] shadow-[0_2px_8px_rgba(0,0,0,0.06)] bg-[rgba(255,71,87,0.05)]">
                <div className="flex items-center gap-2.5 mb-2">
                  <i className="text-lg fas fa-exclamation-circle text-[#FF4757]"></i>
                  <div className="text-sm font-semibold">Critical: Unread Assets &gt; 30 Days</div>
                </div>
                <div className="text-[13px] text-gray-600 leading-relaxed">
                  <strong>47 assets</strong> haven't been read in over 30 days. Total value at risk: <strong>$876K</strong>. Immediate attention required.
                </div>
              </div>

              <div className="bg-white rounded-xl p-5 border-l-4 border-[#FF9500] shadow-[0_2px_8px_rgba(0,0,0,0.06)] bg-[rgba(255,149,0,0.05)]">
                <div className="flex items-center gap-2.5 mb-2">
                  <i className="text-lg fas fa-map-marker-alt text-[#FF9500]"></i>
                  <div className="text-sm font-semibold">Warning: Out of Place Assets</div>
                </div>
                <div className="text-[13px] text-gray-600 leading-relaxed">
                  <strong>89 assets</strong> are currently outside their designated home locations. Review and relocate as needed.
                </div>
              </div>

              <div className="bg-white rounded-xl p-5 border-l-4 border-[#5B93FF] shadow-[0_2px_8px_rgba(0,0,0,0.06)] bg-[rgba(91,147,255,0.05)]">
                <div className="flex items-center gap-2.5 mb-2">
                  <i className="text-lg fas fa-bell text-[#5B93FF]"></i>
                  <div className="text-sm font-semibold">Info: Alarmed Assets</div>
                </div>
                <div className="text-[13px] text-gray-600 leading-relaxed">
                  <strong>12 assets</strong> triggered alarms in the last 24 hours. All cases under investigation.
                </div>
              </div>
            </div>

            {/* Tracking Table */}
            <div className="bg-white rounded-xl p-6 shadow-[0_2px_8px_rgba(0,0,0,0.06)] overflow-x-auto">
              <div className="flex justify-between items-center p-0 mb-5">
                <div className="text-base font-semibold text-gray-900">Real-Time Asset Location</div>
                <input type="text" placeholder="Search assets..." className="p-2 px-3 border border-gray-300 rounded-lg w-[250px]" />
              </div>
              <table className="w-full border-collapse">
                <thead className="bg-gray-100 rounded-lg">
                  <tr>
                    <th className="p-3 text-left font-semibold text-xs uppercase text-gray-600 tracking-wide">Asset Code</th>
                    <th className="p-3 text-left font-semibold text-xs uppercase text-gray-600 tracking-wide">Asset Name</th>
                    <th className="p-3 text-left font-semibold text-xs uppercase text-gray-600 tracking-wide">Current Location</th>
                    <th className="p-3 text-left font-semibold text-xs uppercase text-gray-600 tracking-wide">Last Seen</th>
                    <th className="p-3 text-left font-semibold text-xs uppercase text-gray-600 tracking-wide">Status</th>
                    <th className="p-3 text-left font-semibold text-xs uppercase text-gray-600 tracking-wide">Value</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="hover:bg-gray-100">
                    <td className="p-3.5 px-3 border-b border-gray-300 text-sm">AST-1001</td>
                    <td className="p-3.5 px-3 border-b border-gray-300 text-sm">Laptop Dell XPS 15</td>
                    <td className="p-3.5 px-3 border-b border-gray-300 text-sm">Site A / Area 1 / Zone 12</td>
                    <td className="p-3.5 px-3 border-b border-gray-300 text-sm">2 hours ago</td>
                    <td className="p-3.5 px-3 border-b border-gray-300 text-sm">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-semibold uppercase tracking-wide bg-[rgba(45,211,111,0.15)] text-[#2DD36F]">Active</span>
                    </td>
                    <td className="p-3.5 px-3 border-b border-gray-300 text-sm">$1,500</td>
                  </tr>
                  <tr className="hover:bg-gray-100">
                    <td className="p-3.5 px-3 border-b border-gray-300 text-sm">AST-1002</td>
                    <td className="p-3.5 px-3 border-b border-gray-300 text-sm">Forklift Toyota 8FD25</td>
                    <td className="p-3.5 px-3 border-b border-gray-300 text-sm">Site B / Area 3 / Zone 5</td>
                    <td className="p-3.5 px-3 border-b border-gray-300 text-sm">15 min ago</td>
                    <td className="p-3.5 px-3 border-b border-gray-300 text-sm">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-semibold uppercase tracking-wide bg-[rgba(45,211,111,0.15)] text-[#2DD36F]">Active</span>
                    </td>
                    <td className="p-3.5 px-3 border-b border-gray-300 text-sm">$18,500</td>
                  </tr>
                  <tr className="hover:bg-gray-100">
                    <td className="p-3.5 px-3 border-b border-gray-300 text-sm">AST-1003</td>
                    <td className="p-3.5 px-3 border-b border-gray-300 text-sm">Scanner Zebra TC52</td>
                    <td className="p-3.5 px-3 border-b border-gray-300 text-sm">Site A / Area 2 / Zone 8</td>
                    <td className="p-3.5 px-3 border-b border-gray-300 text-sm">3 days ago</td>
                    <td className="p-3.5 px-3 border-b border-gray-300 text-sm">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-semibold uppercase tracking-wide bg-[rgba(255,149,0,0.15)] text-[#FF9500]">Inactive</span>
                    </td>
                    <td className="p-3.5 px-3 border-b border-gray-300 text-sm">$850</td>
                  </tr>
                  <tr className="hover:bg-gray-100">
                    <td className="p-3.5 px-3 border-b border-gray-300 text-sm">AST-1004</td>
                    <td className="p-3.5 px-3 border-b border-gray-300 text-sm">Pallet Jack Electric</td>
                    <td className="p-3.5 px-3 border-b border-gray-300 text-sm">Unknown</td>
                    <td className="p-3.5 px-3 border-b border-gray-300 text-sm">Never</td>
                    <td className="p-3.5 px-3 border-b border-gray-300 text-sm">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-semibold uppercase tracking-wide bg-[rgba(255,71,87,0.15)] text-[#FF4757]">Never Seen</span>
                    </td>
                    <td className="p-3.5 px-3 border-b border-gray-300 text-sm">$2,200</td>
                  </tr>
                  <tr className="hover:bg-gray-100">
                    <td className="p-3.5 px-3 text-sm">AST-1005</td>
                    <td className="p-3.5 px-3 text-sm">Safety Equipment Set</td>
                    <td className="p-3.5 px-3 text-sm">Site C / Area 1 / Zone 3</td>
                    <td className="p-3.5 px-3 text-sm">1 hour ago</td>
                    <td className="p-3.5 px-3 text-sm">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-semibold uppercase tracking-wide bg-[rgba(45,211,111,0.15)] text-[#2DD36F]">Active</span>
                    </td>
                    <td className="p-3.5 px-3 text-sm">$450</td>
                  </tr>
                </tbody>
              </table>
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
                <div className="text-[32px] font-bold text-gray-900 leading-none">$2.50M</div>
                <div className="flex items-center gap-1 font-medium text-[#2DD36F]">
                  <i className="fas fa-arrow-up"></i>
                  <span>8.3% YoY</span>
                </div>
              </div>

              <div className="bg-white rounded-xl p-5 flex flex-col gap-3 shadow-[0_2px_8px_rgba(0,0,0,0.06)]">
                <div className="text-xs font-medium text-gray-600 uppercase tracking-wide">Replacement Cost</div>
                <div className="text-[32px] font-bold text-gray-900 leading-none">$3.12M</div>
                <div className="flex items-center gap-1 font-medium text-[#2DD36F]">
                  <i className="fas fa-arrow-up"></i>
                  <span>$620K premium</span>
                </div>
              </div>

              <div className="bg-white rounded-xl p-5 flex flex-col gap-3 shadow-[0_2px_8px_rgba(0,0,0,0.06)]">
                <div className="text-xs font-medium text-gray-600 uppercase tracking-wide">Net Book Value</div>
                <div className="text-[32px] font-bold text-gray-900 leading-none">$2.18M</div>
                <div className="flex items-center gap-1 font-medium text-[#FF4757]">
                  <i className="fas fa-arrow-down"></i>
                  <span>-12.8% depreciation</span>
                </div>
              </div>

              <div className="bg-white rounded-xl p-5 flex flex-col gap-3 shadow-[0_2px_8px_rgba(0,0,0,0.06)]">
                <div className="text-xs font-medium text-gray-600 uppercase tracking-wide">Uninsured Value</div>
                <div className="text-[32px] font-bold text-gray-900 leading-none">$387K</div>
                <div className="flex items-center gap-1 font-medium text-[#FF4757]">
                  <i className="fas fa-exclamation-triangle"></i>
                  <span>At Risk</span>
                </div>
              </div>
            </div>

            {/* Financial Alerts */}
            <div className="bg-white rounded-xl p-5 border-l-4 border-[#FF4757] mb-4 shadow-[0_2px_8px_rgba(0,0,0,0.06)] bg-[rgba(255,71,87,0.05)]">
              <div className="flex items-center gap-2.5 mb-2">
                <i className="text-lg fas fa-exclamation-triangle text-[#FF4757]"></i>
                <div className="text-sm font-semibold">Critical: Missing Cost Center Assignment</div>
              </div>
              <div className="text-[13px] text-gray-600 leading-relaxed">
                <strong>156 assets</strong> (12.6%) do not have a cost center assigned. Total value: <strong>$523K</strong>. This creates governance risk and prevents proper financial tracking. Immediate action required.
              </div>
            </div>

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
                  <tr className="hover:bg-gray-100">
                    <td className="p-3.5 px-3 border-b border-gray-300 text-sm">CC-001 Operations</td>
                    <td className="p-3.5 px-3 border-b border-gray-300 text-sm">347</td>
                    <td className="p-3.5 px-3 border-b border-gray-300 text-sm">$892,500</td>
                    <td className="p-3.5 px-3 border-b border-gray-300 text-sm">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-semibold uppercase tracking-wide bg-[rgba(45,211,111,0.15)] text-[#2DD36F]">72%</span>
                    </td>
                    <td className="p-3.5 px-3 border-b border-gray-300 text-sm">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-semibold uppercase tracking-wide bg-[rgba(45,211,111,0.15)] text-[#2DD36F]">94%</span>
                    </td>
                  </tr>
                  <tr className="hover:bg-gray-100">
                    <td className="p-3.5 px-3 border-b border-gray-300 text-sm">CC-002 IT</td>
                    <td className="p-3.5 px-3 border-b border-gray-300 text-sm">234</td>
                    <td className="p-3.5 px-3 border-b border-gray-300 text-sm">$567,800</td>
                    <td className="p-3.5 px-3 border-b border-gray-300 text-sm">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-semibold uppercase tracking-wide bg-[rgba(45,211,111,0.15)] text-[#2DD36F]">68%</span>
                    </td>
                    <td className="p-3.5 px-3 border-b border-gray-300 text-sm">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-semibold uppercase tracking-wide bg-[rgba(45,211,111,0.15)] text-[#2DD36F]">88%</span>
                    </td>
                  </tr>
                  <tr className="hover:bg-gray-100">
                    <td className="p-3.5 px-3 border-b border-gray-300 text-sm">CC-003 Manufacturing</td>
                    <td className="p-3.5 px-3 border-b border-gray-300 text-sm">412</td>
                    <td className="p-3.5 px-3 border-b border-gray-300 text-sm">$723,400</td>
                    <td className="p-3.5 px-3 border-b border-gray-300 text-sm">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-semibold uppercase tracking-wide bg-[rgba(255,149,0,0.15)] text-[#FF9500]">45%</span>
                    </td>
                    <td className="p-3.5 px-3 border-b border-gray-300 text-sm">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-semibold uppercase tracking-wide bg-[rgba(255,149,0,0.15)] text-[#FF9500]">76%</span>
                    </td>
                  </tr>
                  <tr className="hover:bg-gray-100">
                    <td className="p-3.5 px-3 text-sm">NO_CC (Unassigned)</td>
                    <td className="p-3.5 px-3 text-sm">156</td>
                    <td className="p-3.5 px-3 text-sm">$523,000</td>
                    <td className="p-3.5 px-3 text-sm">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-semibold uppercase tracking-wide bg-[rgba(255,71,87,0.15)] text-[#FF4757]">N/A</span>
                    </td>
                    <td className="p-3.5 px-3 text-sm">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-semibold uppercase tracking-wide bg-[rgba(255,71,87,0.15)] text-[#FF4757]">42%</span>
                    </td>
                  </tr>
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
                <div className="text-[32px] font-bold text-gray-900 leading-none">23</div>
                <div className="flex items-center gap-1 font-medium text-[#FF4757]">
                  <i className="fas fa-arrow-up"></i>
                  <span>Needs attention</span>
                </div>
              </div>

              <div className="bg-white rounded-xl p-5 flex flex-col gap-3 shadow-[0_2px_8px_rgba(0,0,0,0.06)]">
                <div className="text-xs font-medium text-gray-600 uppercase tracking-wide">Due This Week</div>
                <div className="text-[32px] font-bold text-gray-900 leading-none">15</div>
              </div>

              <div className="bg-white rounded-xl p-5 flex flex-col gap-3 shadow-[0_2px_8px_rgba(0,0,0,0.06)]">
                <div className="text-xs font-medium text-gray-600 uppercase tracking-wide">Due This Month</div>
                <div className="text-[32px] font-bold text-gray-900 leading-none">47</div>
              </div>

              <div className="bg-white rounded-xl p-5 flex flex-col gap-3 shadow-[0_2px_8px_rgba(0,0,0,0.06)]">
                <div className="text-xs font-medium text-gray-600 uppercase tracking-wide">Completed This Month</div>
                <div className="text-[32px] font-bold text-gray-900 leading-none">89</div>
                <div className="flex items-center gap-1 font-medium text-[#2DD36F]">
                  <i className="fas fa-arrow-up"></i>
                  <span>On track</span>
                </div>
              </div>
            </div>

            {/* Overdue Table */}
            <div className="bg-white rounded-xl p-6 shadow-[0_2px_8px_rgba(0,0,0,0.06)] overflow-x-auto mb-5">
              <div className="flex justify-between items-center p-0 mb-5">
                <div className="text-base font-semibold text-gray-900">Critical Overdue Service Items</div>
              </div>
              <table className="w-full border-collapse">
                <thead className="bg-gray-100 rounded-lg">
                  <tr>
                    <th className="p-3 text-left font-semibold text-xs uppercase text-gray-600 tracking-wide">Asset Code</th>
                    <th className="p-3 text-left font-semibold text-xs uppercase text-gray-600 tracking-wide">Asset Name</th>
                    <th className="p-3 text-left font-semibold text-xs uppercase text-gray-600 tracking-wide">Due Date</th>
                    <th className="p-3 text-left font-semibold text-xs uppercase text-gray-600 tracking-wide">Days Overdue</th>
                    <th className="p-3 text-left font-semibold text-xs uppercase text-gray-600 tracking-wide">Priority</th>
                    <th className="p-3 text-left font-semibold text-xs uppercase text-gray-600 tracking-wide">Value</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="hover:bg-gray-100">
                    <td className="p-3.5 px-3 border-b border-gray-300 text-sm">AST-2045</td>
                    <td className="p-3.5 px-3 border-b border-gray-300 text-sm">Forklift Toyota</td>
                    <td className="p-3.5 px-3 border-b border-gray-300 text-sm">Jan 15, 2026</td>
                    <td className="p-3.5 px-3 border-b border-gray-300 text-sm">18 days</td>
                    <td className="p-3.5 px-3 border-b border-gray-300 text-sm">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-semibold uppercase tracking-wide bg-[rgba(255,71,87,0.15)] text-[#FF4757]">URGENT</span>
                    </td>
                    <td className="p-3.5 px-3 border-b border-gray-300 text-sm">$18,500</td>
                  </tr>
                  <tr className="hover:bg-gray-100">
                    <td className="p-3.5 px-3 border-b border-gray-300 text-sm">AST-3012</td>
                    <td className="p-3.5 px-3 border-b border-gray-300 text-sm">HVAC System Unit 3</td>
                    <td className="p-3.5 px-3 border-b border-gray-300 text-sm">Jan 20, 2026</td>
                    <td className="p-3.5 px-3 border-b border-gray-300 text-sm">13 days</td>
                    <td className="p-3.5 px-3 border-b border-gray-300 text-sm">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-semibold uppercase tracking-wide bg-[rgba(255,71,87,0.15)] text-[#FF4757]">URGENT</span>
                    </td>
                    <td className="p-3.5 px-3 border-b border-gray-300 text-sm">$12,300</td>
                  </tr>
                  <tr className="hover:bg-gray-100">
                    <td className="p-3.5 px-3 text-sm">AST-1567</td>
                    <td className="p-3.5 px-3 text-sm">Conveyor Belt Main</td>
                    <td className="p-3.5 px-3 text-sm">Jan 28, 2026</td>
                    <td className="p-3.5 px-3 text-sm">5 days</td>
                    <td className="p-3.5 px-3 text-sm">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-semibold uppercase tracking-wide bg-[rgba(255,149,0,0.15)] text-[#FF9500]">HIGH</span>
                    </td>
                    <td className="p-3.5 px-3 text-sm">$8,900</td>
                  </tr>
                </tbody>
              </table>
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
              <p className="text-sm text-gray-600">Compliance tracking and audit status</p>
            </div>

            {/* Audit KPIs */}
            <div className="grid grid-cols-4 gap-5 mb-5 max-lg:grid-cols-2 max-md:grid-cols-1">
              <div className="bg-white rounded-xl p-5 flex flex-col gap-3 shadow-[0_2px_8px_rgba(0,0,0,0.06)]">
                <div className="text-xs font-medium text-gray-600 uppercase tracking-wide">Audit Compliance</div>
                <div className="text-[32px] font-bold text-gray-900 leading-none">76.5%</div>
                <div className="flex items-center gap-1 font-medium text-[#2DD36F]">
                  <i className="fas fa-arrow-up"></i>
                  <span>+5.2% vs Q3</span>
                </div>
              </div>

              <div className="bg-white rounded-xl p-5 flex flex-col gap-3 shadow-[0_2px_8px_rgba(0,0,0,0.06)]">
                <div className="text-xs font-medium text-gray-600 uppercase tracking-wide">Audited Assets</div>
                <div className="text-[32px] font-bold text-gray-900 leading-none">944</div>
              </div>

              <div className="bg-white rounded-xl p-5 flex flex-col gap-3 shadow-[0_2px_8px_rgba(0,0,0,0.06)]">
                <div className="text-xs font-medium text-gray-600 uppercase tracking-wide">Unaudited Assets</div>
                <div className="text-[32px] font-bold text-gray-900 leading-none">290</div>
                <div className="flex items-center gap-1 font-medium text-[#FF4757]">
                  <i className="fas fa-arrow-down"></i>
                  <span>-12% improvement</span>
                </div>
              </div>

              <div className="bg-white rounded-xl p-5 flex flex-col gap-3 shadow-[0_2px_8px_rgba(0,0,0,0.06)]">
                <div className="text-xs font-medium text-gray-600 uppercase tracking-wide">Audited This Month</div>
                <div className="text-[32px] font-bold text-gray-900 leading-none">127</div>
              </div>
            </div>

            {/* Audit Priority Table */}
            <div className="bg-white rounded-xl p-6 shadow-[0_2px_8px_rgba(0,0,0,0.06)] overflow-x-auto mb-5">
              <div className="flex justify-between items-center p-0 mb-5">
                <div className="text-base font-semibold text-gray-900">Unaudited High-Priority Assets</div>
              </div>
              <table className="w-full border-collapse">
                <thead className="bg-gray-100 rounded-lg">
                  <tr>
                    <th className="p-3 text-left font-semibold text-xs uppercase text-gray-600 tracking-wide">Asset Code</th>
                    <th className="p-3 text-left font-semibold text-xs uppercase text-gray-600 tracking-wide">Asset Name</th>
                    <th className="p-3 text-left font-semibold text-xs uppercase text-gray-600 tracking-wide">Days Since Creation</th>
                    <th className="p-3 text-left font-semibold text-xs uppercase text-gray-600 tracking-wide">Value</th>
                    <th className="p-3 text-left font-semibold text-xs uppercase text-gray-600 tracking-wide">Priority</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="hover:bg-gray-100">
                    <td className="p-3.5 px-3 border-b border-gray-300 text-sm">AST-5678</td>
                    <td className="p-3.5 px-3 border-b border-gray-300 text-sm">CNC Machine Haas</td>
                    <td className="p-3.5 px-3 border-b border-gray-300 text-sm">127 days</td>
                    <td className="p-3.5 px-3 border-b border-gray-300 text-sm">$45,000</td>
                    <td className="p-3.5 px-3 border-b border-gray-300 text-sm">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-semibold uppercase tracking-wide bg-[rgba(255,71,87,0.15)] text-[#FF4757]">CRITICAL</span>
                    </td>
                  </tr>
                  <tr className="hover:bg-gray-100">
                    <td className="p-3.5 px-3 border-b border-gray-300 text-sm">AST-5679</td>
                    <td className="p-3.5 px-3 border-b border-gray-300 text-sm">Laser Cutter Industrial</td>
                    <td className="p-3.5 px-3 border-b border-gray-300 text-sm">95 days</td>
                    <td className="p-3.5 px-3 border-b border-gray-300 text-sm">$32,500</td>
                    <td className="p-3.5 px-3 border-b border-gray-300 text-sm">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-semibold uppercase tracking-wide bg-[rgba(255,71,87,0.15)] text-[#FF4757]">CRITICAL</span>
                    </td>
                  </tr>
                  <tr className="hover:bg-gray-100">
                    <td className="p-3.5 px-3 text-sm">AST-5680</td>
                    <td className="p-3.5 px-3 text-sm">Robot Arm KUKA</td>
                    <td className="p-3.5 px-3 text-sm">156 days</td>
                    <td className="p-3.5 px-3 text-sm">$18,900</td>
                    <td className="p-3.5 px-3 text-sm">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-semibold uppercase tracking-wide bg-[rgba(255,149,0,0.15)] text-[#FF9500]">HIGH</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Audit Chart */}
            <div className="bg-white rounded-xl p-6 shadow-[0_2px_8px_rgba(0,0,0,0.06)]">
              <div className="flex justify-between items-center mb-5">
                <div className="text-base font-semibold text-gray-900">Audit Compliance by Category</div>
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