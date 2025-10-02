import React, { useEffect, useRef } from 'react';
import * as echarts from 'echarts';
import { ChartBarIcon, CubeIcon, BanknotesIcon, ExclamationTriangleIcon, WrenchScrewdriverIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { useTheme } from '../../context/ThemeContext';
import { useTranslation } from 'react-i18next';

interface ChartData {
  name: string;
  value: number;
}

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  warning?: boolean;
}

interface AgeStatCardProps {
  title: string;
  value: number;
}

interface ChartCardProps {
  title: string;
  children: React.ReactNode;
}

interface PieChartProps {
  data: ChartData[];
  chartId: string;
}

interface BarChartProps {
  data: ChartData[];
  chartId: string;
  isHorizontal?: boolean;
}

export default function Assets() {
  const { t } = useTranslation();

  // Dados simulados baseados no dashboard do Grafana
  const statsData = {
    totalAssets: 1234,
    totalCategories: 45,
    totalInvestment: 2500000,
    misplacedItems: 12,
    maintenanceDue: 23,
    serialCompletion: 87,
    age0_3Months: 156,
    age3_12Months: 289,
    age1_2Years: 412,
    ageOver2Years: 377
  };

  const departmentData = [
    { name: t('assets.departments.it'), value: 245 },
    { name: t('assets.departments.operations'), value: 198 },
    { name: t('assets.departments.finance'), value: 156 },
    { name: t('assets.departments.hr'), value: 123 },
    { name: t('assets.departments.marketing'), value: 98 },
    { name: t('assets.departments.sales'), value: 187 },
    { name: t('assets.departments.rd'), value: 227 }
  ];

  const categoryData = [
    { name: t('assets.categories.computers'), value: 320 },
    { name: t('assets.categories.furniture'), value: 280 },
    { name: t('assets.categories.appliances'), value: 210 },
    { name: t('assets.categories.vehicles'), value: 145 },
    { name: t('assets.categories.equipment'), value: 189 },
    { name: t('assets.categories.tools'), value: 90 }
  ];

  const categoryInvestment = [
    { name: t('assets.categories.computers'), value: 450000 },
    { name: t('assets.categories.vehicles'), value: 380000 },
    { name: t('assets.categories.equipment'), value: 320000 },
    { name: t('assets.categories.furniture'), value: 280000 },
    { name: t('assets.categories.appliances'), value: 210000 },
    { name: t('assets.categories.tools'), value: 150000 }
  ];

  const costCenterData = [
    { name: t('assets.costCenters.engineering'), value: 312 },
    { name: t('assets.costCenters.operations'), value: 245 },
    { name: t('assets.costCenters.administration'), value: 198 },
    { name: t('assets.costCenters.customerService'), value: 167 },
    { name: t('assets.costCenters.logistics'), value: 145 }
  ];

  const groupData = [
    { name: t('assets.groups.groupA'), value: 234 },
    { name: t('assets.groups.groupB'), value: 198 },
    { name: t('assets.groups.groupC'), value: 167 },
    { name: t('assets.groups.groupD'), value: 145 },
    { name: t('assets.groups.groupE'), value: 123 }
  ];

  const dispositionData = [
    { name: t('assets.disposition.active'), value: 1020 },
    { name: t('assets.disposition.disposed'), value: 98 },
    { name: t('assets.disposition.maintenance'), value: 67 },
    { name: t('assets.disposition.retired'), value: 49 }
  ];

  const cycleCountData = [
    { name: t('assets.categories.computers'), value: 24 },
    { name: t('assets.categories.equipment'), value: 18 },
    { name: t('assets.categories.furniture'), value: 15 },
    { name: t('assets.categories.appliances'), value: 12 },
    { name: t('assets.categories.tools'), value: 9 }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-8">
          {t('assets.title')}
        </h1>
        
        {/* Stats Cards Row 1 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 mb-6">
          <StatCard
            title={t('assets.stats.totalAssets')}
            value={statsData.totalAssets}
            icon={CubeIcon}
            color="bg-blue-500"
          />
          <StatCard
            title={t('assets.stats.totalCategories')}
            value={statsData.totalCategories}
            icon={ChartBarIcon}
            color="bg-green-500"
          />
          <StatCard
            title={t('assets.stats.totalInvestment')}
            value={`$${(statsData.totalInvestment / 1000000).toFixed(2)}M`}
            icon={BanknotesIcon}
            color="bg-purple-500"
          />
          <StatCard
            title={t('assets.stats.misplacedItems')}
            value={statsData.misplacedItems}
            icon={ExclamationTriangleIcon}
            color="bg-orange-500"
            warning={statsData.misplacedItems > 10}
          />
          <StatCard
            title={t('assets.stats.maintenanceDue')}
            value={statsData.maintenanceDue}
            icon={WrenchScrewdriverIcon}
            color="bg-red-500"
            warning={statsData.maintenanceDue > 20}
          />
          <StatCard
            title={t('assets.stats.serialCompletion')}
            value={`${statsData.serialCompletion}%`}
            icon={CheckCircleIcon}
            color="bg-teal-500"
          />
        </div>

        {/* Stats Cards Row 2 - Age Distribution */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <AgeStatCard 
            title={t('assets.ageDistribution.0_3Months')} 
            value={statsData.age0_3Months} 
          />
          <AgeStatCard 
            title={t('assets.ageDistribution.3_12Months')} 
            value={statsData.age3_12Months} 
          />
          <AgeStatCard 
            title={t('assets.ageDistribution.1_2Years')} 
            value={statsData.age1_2Years} 
          />
          <AgeStatCard 
            title={t('assets.ageDistribution.over2Years')} 
            value={statsData.ageOver2Years} 
          />
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChartCard title={t('assets.charts.assetsByDepartment')}>
            <PieChart data={departmentData} chartId="dept-chart" />
          </ChartCard>
          
          <ChartCard title={t('assets.charts.averagePurchaseCost')}>
            <BarChart data={categoryInvestment} chartId="investment-chart" />
          </ChartCard>
          
          <ChartCard title={t('assets.charts.assetsByCostCenter')}>
            <PieChart data={costCenterData} chartId="cost-center-chart" />
          </ChartCard>
          
          <ChartCard title={t('assets.charts.investmentByCostCenter')}>
            <BarChart data={categoryInvestment} chartId="cost-investment-chart" />
          </ChartCard>
          
          <ChartCard title={t('assets.charts.assetsByCategory')}>
            <PieChart data={categoryData} chartId="category-chart" />
          </ChartCard>
          
          <ChartCard title={t('assets.charts.assetsByGroup')}>
            <BarChart data={groupData} chartId="group-chart" isHorizontal={false} />
          </ChartCard>
          
          <ChartCard title={t('assets.charts.assetDisposition')}>
            <PieChart data={dispositionData} chartId="disposition-chart" />
          </ChartCard>
          
          <ChartCard title={t('assets.charts.averageCycleCount')}>
            <BarChart data={cycleCountData} chartId="cycle-chart" />
          </ChartCard>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon: Icon, color, warning }: StatCardProps) {
  const bgColor = warning ? 'bg-red-100 dark:bg-red-900/20' : 'bg-white dark:bg-gray-900';
  const textColor = warning ? 'text-red-800 dark:text-red-400' : 'text-gray-900 dark:text-gray-100';
  
  return (
    <div className={`${bgColor} rounded-lg shadow p-4 border border-gray-200 dark:border-gray-800`}>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">{title}</p>
          <p className={`text-2xl font-bold ${textColor}`}>{value}</p>
        </div>
        <div className={`${color} p-3 rounded-lg`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
      </div>
    </div>
  );
}

function AgeStatCard({ title, value }: AgeStatCardProps) {
  return (
    <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg shadow p-4">
      <p className="text-sm font-medium text-white/90 mb-1">{title}</p>
      <p className="text-3xl font-bold text-white">{value}</p>
    </div>
  );
}

function ChartCard({ title, children }: ChartCardProps) {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg shadow border border-gray-200 dark:border-gray-800 p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">{title}</h3>
      {children}
    </div>
  );
}

function PieChart({ data }: PieChartProps) {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstanceRef = useRef<echarts.ECharts | null>(null);
  const { darkMode } = useTheme();

  useEffect(() => {
    if (!chartRef.current) return;

    // Se já existe uma instância, descarta
    if (chartInstanceRef.current) {
      chartInstanceRef.current.dispose();
    }

    // Cria nova instância com o tema correto
    const chart = echarts.init(chartRef.current, darkMode ? 'dark' : undefined);
    chartInstanceRef.current = chart;

    const option = {
      tooltip: {
        trigger: 'item',
        formatter: '{b}: {c} ({d}%)',
        backgroundColor: darkMode ? '#1f2937' : '#ffffff',
        borderColor: darkMode ? '#374151' : '#e5e7eb',
        textStyle: {
          color: darkMode ? '#f3f4f6' : '#111827'
        }
      },
      legend: {
        orient: 'vertical',
        right: 10,
        top: 'center',
        textStyle: {
          fontSize: 12,
          color: darkMode ? '#d1d5db' : '#374151'
        }
      },
      series: [
        {
          type: 'pie',
          radius: ['40%', '70%'],
          avoidLabelOverlap: false,
          itemStyle: {
            borderRadius: 10,
            borderColor: darkMode ? '#111827' : '#fff',
            borderWidth: 2
          },
          label: {
            show: false,
            position: 'center'
          },
          emphasis: {
            label: {
              show: true,
              fontSize: 16,
              fontWeight: 'bold',
              color: darkMode ? '#f3f4f6' : '#111827'
            }
          },
          labelLine: {
            show: false
          },
          data: data
        }
      ],
      color: ['#5470c6', '#91cc75', '#fac858', '#ee6666', '#73c0de', '#3ba272', '#fc8452', '#9a60b4']
    };

    chart.setOption(option);

    const handleResize = () => chart.resize();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (chartInstanceRef.current) {
        chartInstanceRef.current.dispose();
        chartInstanceRef.current = null;
      }
    };
  }, [data, darkMode]);

  return <div ref={chartRef} style={{ width: '100%', height: '300px' }} />;
}

function BarChart({ data }: BarChartProps) {
  const chartRef = useRef(null);

  useEffect(() => {
    if (!chartRef.current) return;

    const chart = echarts.init(chartRef.current);

    const option = {
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow'
        },
        formatter: (params: any) => {
          const item = params[0];
          const value = typeof item.value === 'number' && item.value > 10000
            ? `$${(item.value / 1000).toFixed(0)}k`
            : item.value;
          return `${item.name}: ${value}`;
        }
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '15%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        data: data.map(item => item.name),
        axisLabel: {
          rotate: 45,
          fontSize: 11
        }
      },
      yAxis: {
        type: 'value'
      },
      series: [
        {
          type: 'bar',
          data: data.map(item => item.value),
          itemStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: '#83bff6' },
              { offset: 0.5, color: '#188df0' },
              { offset: 1, color: '#188df0' }
            ]),
            borderRadius: [4, 4, 0, 0]
          },
          emphasis: {
            itemStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: '#2378f7' },
                { offset: 0.7, color: '#2378f7' },
                { offset: 1, color: '#83bff6' }
              ])
            }
          }
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
  }, [data]);

  return <div ref={chartRef} style={{ width: '100%', height: '300px' }} />;
}