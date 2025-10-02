import React, { useEffect, useRef } from 'react';
import * as echarts from 'echarts';
import { 
  UserGroupIcon, 
  ClockIcon, 
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ChartBarIcon,
  BriefcaseIcon
} from '@heroicons/react/24/outline';
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
  subtitle?: string;
}

interface ComplianceMetric {
  metrica: string;
  valor: number;
  unidade: string;
}

interface EmployeeScore {
  name: string;
  department: string;
  score: number;
  status: string;
  workHours: number;
}

interface DepartmentScore {
  department: string;
  totalEmployees: number;
  avgScore: number;
  status: string;
  compliant: number;
  critical: number;
}

export default function PeopleComponent() {
  const { darkMode } = useTheme();
  const { t } = useTranslation();

 // Dados simulados baseados no Grafana
  const complianceMetrics: ComplianceMetric[] = [
    { metrica: 'CONFORMIDADE_GERAL', valor: 87.5, unidade: '%' },
    { metrica: 'PAUSAS_ADEQUADAS', valor: 92.3, unidade: '%' },
    { metrica: 'VIOLACOES_JORNADA', valor: 3, unidade: t('people.employees') },
    { metrica: 'ALERTAS_CRITICOS', valor: 7, unidade: t('people.occurrences') }
  ];

  const workTimeData: ChartData[] = [
    { name: 'João Silva', value: 176 },
    { name: 'Maria Santos', value: 168 },
    { name: 'Pedro Costa', value: 165 },
    { name: 'Ana Lima', value: 158 },
    { name: 'Carlos Souza', value: 152 },
    { name: 'Juliana Alves', value: 148 },
    { name: 'Roberto Dias', value: 145 },
    { name: 'Fernanda Rocha', value: 142 }
  ];

  const departmentScores: DepartmentScore[] = [
    { department: 'TI', totalEmployees: 25, avgScore: 89.5, status: t('people.status.excellent'), compliant: 23, critical: 0 },
    { department: 'Operações', totalEmployees: 45, avgScore: 78.2, status: t('people.status.good'), compliant: 38, critical: 2 },
    { department: 'Logística', totalEmployees: 32, avgScore: 72.8, status: t('people.status.regular'), compliant: 25, critical: 4 },
    { department: 'Produção', totalEmployees: 58, avgScore: 65.3, status: t('people.status.regular'), compliant: 42, critical: 8 }
  ];

  const employeeScores: EmployeeScore[] = [
    { name: 'João Silva', department: 'TI', score: 95, status: t('people.status.excellent'), workHours: 8.2 },
    { name: 'Maria Santos', department: 'Operações', score: 88, status: t('people.status.excellent'), workHours: 7.9 },
    { name: 'Pedro Costa', department: 'TI', score: 86, status: t('people.status.excellent'), workHours: 8.1 },
    { name: 'Ana Lima', department: 'Logística', score: 75, status: t('people.status.good'), workHours: 8.5 },
    { name: 'Carlos Souza', department: 'Produção', score: 68, status: t('people.status.regular'), workHours: 8.8 },
    { name: 'Juliana Alves', department: 'Operações', score: 82, status: t('people.status.good'), workHours: 8.0 }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-8">
          {t('people.title')}
        </h1>

        {/* Métricas de Conformidade */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {complianceMetrics.map((metric, index) => (
            <ComplianceCard key={index} metric={metric} />
          ))}
        </div>

        {/* Cards de Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatCard
            title={t('people.stats.working')}
            value="45.2h"
            subtitle={t('people.stats.totalTime')}
            icon={BriefcaseIcon}
            color="bg-green-500"
          />
          <StatCard
            title={t('people.stats.onBreak')}
            value="8.3h"
            subtitle={t('people.stats.totalTime')}
            icon={ClockIcon}
            color="bg-red-500"
          />
          <StatCard
            title={t('people.stats.avgDifference')}
            value="-12 min"
            subtitle={t('people.stats.plannedVsActual')}
            icon={ChartBarIcon}
            color="bg-blue-500"
          />
          <StatCard
            title={t('people.stats.active')}
            value="156"
            subtitle={t('people.employees')}
            icon={UserGroupIcon}
            color="bg-purple-500"
          />
        </div>

        {/* Seção: Visão por Funcionário */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
            <UserGroupIcon className="w-6 h-6" />
            {t('people.employeeView')}
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Tempo Total por Funcionário */}
            <ChartCard title={t('people.charts.totalWorkTime')}>
              <HorizontalBarChart data={workTimeData} darkMode={darkMode} />
            </ChartCard>

            {/* Tabela de Média de Horas */}
            <ChartCard title={t('people.charts.avgWorkHours')}>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700">
                      <th className="text-left py-2 px-3 text-gray-700 dark:text-gray-300">
                        {t('people.employee')}
                      </th>
                      <th className="text-right py-2 px-3 text-gray-700 dark:text-gray-300">
                        {t('people.averageHours')}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {workTimeData.map((employee, index) => (
                      <tr
                        key={index}
                        className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800"
                      >
                        <td className="py-2 px-3 text-gray-900 dark:text-gray-100">
                          {employee.name}
                        </td>
                        <td className="py-2 px-3 text-right text-gray-900 dark:text-gray-100">
                          {(employee.value / 20).toFixed(1)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </ChartCard>
          </div>
        </div>

        {/* Tabelas de Score */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Score Departamental */}
          <ChartCard title={t('people.charts.departmentScore')}>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left py-2 px-3 text-gray-700 dark:text-gray-300">
                      {t('people.department')}
                    </th>
                    <th className="text-center py-2 px-3 text-gray-700 dark:text-gray-300">
                      {t('people.score')}
                    </th>
                    <th className="text-center py-2 px-3 text-gray-700 dark:text-gray-300">
                      {t('people.status')}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {departmentScores.map((dept, index) => (
                    <tr
                      key={index}
                      className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800"
                    >
                      <td className="py-3 px-3 text-gray-900 dark:text-gray-100">
                        <div className="font-medium">{dept.department}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {dept.totalEmployees} {t('people.employees')}
                        </div>
                      </td>
                      <td className="py-3 px-3 text-center">
                        <div className="flex items-center justify-center">
                          <div
                            className="w-full max-w-[120px] h-6 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700"
                          >
                            <div
                              className={`h-full flex items-center justify-center text-xs font-bold text-white ${
                                dept.avgScore >= 80
                                  ? 'bg-green-500'
                                  : dept.avgScore >= 60
                                  ? 'bg-yellow-500'
                                  : 'bg-red-500'
                              }`}
                              style={{ width: `${dept.avgScore}%` }}
                            >
                              {dept.avgScore}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-3 text-center text-gray-900 dark:text-gray-100">
                        {dept.status}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </ChartCard>

          {/* Score Total */}
          <ChartCard title={t('people.charts.totalScore')}>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left py-2 px-3 text-gray-700 dark:text-gray-300">
                      {t('people.employee')}
                    </th>
                    <th className="text-center py-2 px-3 text-gray-700 dark:text-gray-300">
                      {t('people.score')}
                    </th>
                    <th className="text-center py-2 px-3 text-gray-700 dark:text-gray-300">
                      {t('people.status')}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {employeeScores.map((employee, index) => (
                    <tr
                      key={index}
                      className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800"
                    >
                      <td className="py-3 px-3 text-gray-900 dark:text-gray-100">
                        <div className="font-medium">{employee.name}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {employee.department} • {employee.workHours}h/{t('people.day')}
                        </div>
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span
                          className={`inline-flex items-center justify-center w-12 h-12 rounded-full text-sm font-bold text-white ${
                            employee.score >= 85
                              ? 'bg-green-500'
                              : employee.score >= 70
                              ? 'bg-yellow-500'
                              : 'bg-red-500'
                          }`}
                        >
                          {employee.score}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-center text-gray-900 dark:text-gray-100">
                        {employee.status}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </ChartCard>
        </div>
      </div>
    </div>
  );
}

function ComplianceCard({ metric }: { metric: ComplianceMetric }) {
  const { t } = useTranslation();

  const getColor = () => {
    if (metric.metrica === 'CONFORMIDADE_GERAL' || metric.metrica === 'PAUSAS_ADEQUADAS') {
      return metric.valor >= 80 ? 'bg-green-500' : metric.valor >= 60 ? 'bg-yellow-500' : 'bg-red-500';
    }
    return 'bg-blue-500';
  };

  const getIcon = () => {
    if (metric.metrica === 'CONFORMIDADE_GERAL') return CheckCircleIcon;
    if (metric.metrica === 'PAUSAS_ADEQUADAS') return ClockIcon;
    if (metric.metrica === 'VIOLACOES_JORNADA') return ExclamationTriangleIcon;
    return ExclamationTriangleIcon;
  };

  const Icon = getIcon();

  const getMetricName = (metricKey: string) => {
    const metricMap: { [key: string]: string } = {
      'CONFORMIDADE_GERAL': t('people.metrics.overallCompliance'),
      'PAUSAS_ADEQUADAS': t('people.metrics.adequateBreaks'),
      'VIOLACOES_JORNADA': t('people.metrics.workdayViolations'),
      'ALERTAS_CRITICOS': t('people.metrics.criticalAlerts')
    };
    return metricMap[metricKey] || metricKey.replace(/_/g, ' ');
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg shadow border border-gray-200 dark:border-gray-800 p-4">
      <div className="flex items-center justify-between mb-2">
        <div className={`${getColor()} p-2 rounded-lg`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
      </div>
      <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
        {getMetricName(metric.metrica)}
      </p>
      <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
        {metric.valor} {metric.unidade}
      </p>
    </div>
  );
}

function StatCard({ title, value, subtitle, icon: Icon, color }: StatCardProps) {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg shadow border border-gray-200 dark:border-gray-800 p-4">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{value}</p>
          {subtitle && (
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">{subtitle}</p>
          )}
        </div>
        <div className={`${color} p-3 rounded-lg`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
      </div>
    </div>
  );
}

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg shadow border border-gray-200 dark:border-gray-800 p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">{title}</h3>
      {children}
    </div>
  );
}

function HorizontalBarChart({ data, darkMode }: { data: ChartData[]; darkMode: boolean }) {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstanceRef = useRef<echarts.ECharts | null>(null);

  useEffect(() => {
    if (!chartRef.current) return;

    if (chartInstanceRef.current) {
      chartInstanceRef.current.dispose();
    }

    const chart = echarts.init(chartRef.current, darkMode ? 'dark' : undefined);
    chartInstanceRef.current = chart;

    const option = {
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow'
        },
        backgroundColor: darkMode ? '#1f2937' : '#ffffff',
        borderColor: darkMode ? '#374151' : '#e5e7eb',
        textStyle: {
          color: darkMode ? '#f3f4f6' : '#111827'
        }
      },
      grid: {
        left: '15%',
        right: '10%',
        top: '5%',
        bottom: '5%',
        containLabel: false
      },
      xAxis: {
        type: 'value',
        axisLabel: {
          color: darkMode ? '#9ca3af' : '#6b7280',
          formatter: '{value}h'
        },
        splitLine: {
          lineStyle: {
            color: darkMode ? '#374151' : '#e5e7eb'
          }
        }
      },
      yAxis: {
        type: 'category',
        data: data.map(item => item.name),
        axisLabel: {
          color: darkMode ? '#9ca3af' : '#6b7280',
          fontSize: 11
        },
        axisLine: {
          lineStyle: {
            color: darkMode ? '#374151' : '#e5e7eb'
          }
        }
      },
      series: [
        {
          type: 'bar',
          data: data.map(item => item.value),
          itemStyle: {
            color: new echarts.graphic.LinearGradient(1, 0, 0, 0, [
              { offset: 0, color: '#10b981' },
              { offset: 1, color: '#34d399' }
            ]),
            borderRadius: [0, 4, 4, 0]
          },
          label: {
            show: true,
            position: 'right',
            formatter: '{c}h',
            color: darkMode ? '#d1d5db' : '#374151',
            fontSize: 11
          }
        }
      ]
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