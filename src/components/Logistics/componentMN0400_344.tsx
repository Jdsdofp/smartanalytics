// src/components/Logistics/componentMN0400_344_IMPROVED.tsx
import { useEffect, useRef, useState } from 'react';
import { useCompany } from '../../hooks/useCompany';
import { useOrders, type OrderFilters } from '../../hooks/useOrders';
import * as echarts from 'echarts';
import { LoadingSpinner } from './components/Logistics/Orders/LoadingSpinner';
import { ErrorDisplay } from './components/Logistics/Orders/ErrorDisplay';
import { KPICard } from './components/Logistics/Orders/KPICard';
import { FilterPanel } from './components/Logistics/Orders/FilterPanel';
import { ChartCard } from './components/Logistics/Orders/ChartCard';
import { ExportButton } from './components/Logistics/Orders/ExportButton';
import { OrdersTable } from './components/Logistics/Orders/OrdersTable';
import { ChartBarIcon, CheckCircleIcon, ClockIcon, ExclamationTriangleIcon, RectangleStackIcon, ShoppingBagIcon } from '@heroicons/react/24/outline';

export default function OrderDashboard() {
  //@ts-ignore
  const { companyId } = useCompany();
  
  const {
    loading,
    error,
    kpiSummary,
    jobTypePerformance,
    timeline,
    orders,
    fetchOrders,
    fetchDashboardData
  } = useOrders();

  // Refs para os elementos DOM dos gráficos
  const orderStatusChartRef = useRef<HTMLDivElement>(null);
  const jobPerformanceChartRef = useRef<HTMLDivElement>(null);
  const timelineChartRef = useRef<HTMLDivElement>(null);

  // Instâncias dos gráficos
  const orderStatusChartInstance = useRef<echarts.ECharts | null>(null);
  const jobPerformanceChartInstance = useRef<echarts.ECharts | null>(null);
  const timelineChartInstance = useRef<echarts.ECharts | null>(null);

    // State para filtros iniciais (últimos 7 dias)
  const [initialFilters, setInitialFilters] = useState<OrderFilters>({});

  // State para controlar quando os gráficos devem ser renderizados
  const [chartsReady, setChartsReady] = useState(false);

  // =====================================
  // 📊 CHART CONFIGURATIONS
  // =====================================

  const getOrderStatusChartOption = (data: any[]) => {
    if (!data || data.length === 0) {
      return {
        title: {
          text: 'Order Status Distribution',
          subtext: 'No data available',
          left: 'center',
          top: 'center',
          textStyle: { fontSize: 16, fontWeight: 600, color: '#1f2937' },
          subtextStyle: { color: '#6b7280' }
        }
      };
    }

    return {
      title: {
        text: 'Order Status Distribution',
        left: 'center',
        textStyle: { fontSize: 16, fontWeight: 600, color: '#1f2937' }
      },
      tooltip: {
        trigger: 'item',
        formatter: '{b}: {c} orders ({d}%)'
      },
      legend: {
        orient: 'vertical',
        left: 'left',
        top: 'middle',
        textStyle: { fontSize: 12 }
      },
      series: [{
        type: 'pie',
        radius: '65%',
        center: ['60%', '50%'],
        data: data.map(item => ({
          value: item.count,
          name: formatStatusName(item.status),
          itemStyle: { color: getStatusColor(item.status) }
        })),
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        },
        label: {
          formatter: '{b}\n{d}%',
          fontSize: 12
        }
      }]
    };
  };

  const getJobPerformanceChartOption = (data: any[]) => {
    if (!data || data.length === 0) {
      return {
        title: {
          text: 'Job Type Performance',
          subtext: 'No data available',
          left: 'center',
          top: 'center',
          textStyle: { fontSize: 16, fontWeight: 600, color: '#1f2937' },
          subtextStyle: { color: '#6b7280' }
        }
      };
    }

    return {
      title: {
        text: 'Job Type Performance',
        left: 'center',
        textStyle: { fontSize: 16, fontWeight: 600, color: '#1f2937' }
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' }
      },
      legend: {
        data: ['Total Orders', 'Completion Rate'],
        top: 30
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '15%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        data: data.map(d => d.job_type_code || 'N/A'),
        axisLabel: {
          rotate: 45,
          interval: 0,
          fontSize: 11
        }
      },
      yAxis: [
        {
          type: 'value',
          name: 'Orders',
          position: 'left',
          axisLine: { lineStyle: { color: '#3b82f6' } }
        },
        {
          type: 'value',
          name: 'Completion %',
          position: 'right',
          max: 100,
          axisLabel: { formatter: '{value}%' },
          axisLine: { lineStyle: { color: '#10b981' } }
        }
      ],
      series: [
        {
          name: 'Total Orders',
          type: 'bar',
          data: data.map(d => Number(d.total_orders) || 0),
          itemStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: '#60a5fa' },
              { offset: 1, color: '#3b82f6' }
            ])
          }
        },
        {
          name: 'Completion Rate',
          type: 'line',
          yAxisIndex: 1,
          data: data.map(d => Number(d.avg_completion_pct) || 0),
          itemStyle: { color: '#10b981' },
          lineStyle: { width: 3 },
          smooth: true
        }
      ]
    };
  };

  const getTimelineChartOption = (data: any[]) => {
    if (!data || data.length === 0) {
      return {
        title: {
          text: 'Orders Timeline (Last 30 Days)',
          subtext: 'No data available',
          left: 'center',
          top: 'center',
          textStyle: { fontSize: 16, fontWeight: 600, color: '#1f2937' },
          subtextStyle: { color: '#6b7280' }
        }
      };
    }

    return {
      title: {
        text: 'Orders Timeline (Last 30 Days)',
        left: 'center',
        textStyle: { fontSize: 16, fontWeight: 600, color: '#1f2937' }
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'cross' }
      },
      legend: {
        data: ['Created', 'Completed', 'Items Processed'],
        top: 30
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '5%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: data.map(d => {
          try {
            return new Date(d.date_bucket).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric'
            });
          } catch {
            return d.date_bucket || 'N/A';
          }
        }),
        axisLabel: { fontSize: 11, rotate: 30 }
      },
      yAxis: [
        {
          type: 'value',
          name: 'Orders',
          axisLine: { lineStyle: { color: '#6b7280' } }
        },
        {
          type: 'value',
          name: 'Items',
          position: 'right',
          axisLine: { lineStyle: { color: '#f59e0b' } }
        }
      ],
      series: [
        {
          name: 'Created',
          type: 'line',
          smooth: true,
          data: data.map(d => Number(d.orders_created) || 0),
          itemStyle: { color: '#3b82f6' },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: 'rgba(59, 130, 246, 0.3)' },
              { offset: 1, color: 'rgba(59, 130, 246, 0.05)' }
            ])
          }
        },
        {
          name: 'Completed',
          type: 'line',
          smooth: true,
          data: data.map(d => Number(d.orders_completed) || 0),
          itemStyle: { color: '#10b981' },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: 'rgba(16, 185, 129, 0.3)' },
              { offset: 1, color: 'rgba(16, 185, 129, 0.05)' }
            ])
          }
        },
        {
          name: 'Items Processed',
          type: 'line',
          smooth: true,
          yAxisIndex: 1,
          data: data.map(d => Number(d.items_processed) || 0),
          itemStyle: { color: '#f59e0b' },
          lineStyle: { width: 2 }
        }
      ]
    };
  };

  // =====================================
  // 🎨 UTILITY FUNCTIONS
  // =====================================

  const formatStatusName = (status: string) => {
    return status?.replace(/_/g, ' ').toUpperCase() || 'UNKNOWN';
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'complete': '#10b981',
      'in_progress': '#f59e0b',
      'info_received': '#3b82f6',
      'out_for_delivery': '#8b5cf6',
      'delivered': '#14b8a6'
    };
    return colors[status] || '#6b7280';
  };

  // =====================================
  // 📤 EXPORT FUNCTIONS
  // =====================================

  const exportChartAsPNG = (chartInstance: echarts.ECharts | null, filename: string) => {
    if (!chartInstance) {
      console.warn('Chart instance not found for export');
      return;
    }

    try {
      const url = chartInstance.getDataURL({
        type: 'png',
        pixelRatio: 2,
        backgroundColor: '#fff'
      });

      const link = document.createElement('a');
      link.href = url;
      link.download = `${filename}_${new Date().toISOString().slice(0, 10)}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error exporting chart:', error);
    }
  };

  // =====================================
  // 🔄 CHART INITIALIZATION & UPDATES
  // =====================================

  // Inicializar gráficos quando os dados estiverem prontos
  useEffect(() => {
    if (!loading && !error) {
      // Pequeno delay para garantir que o DOM esteja pronto
      const timer = setTimeout(() => {
        setChartsReady(true);
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [loading, error]);

  // Inicializar e atualizar gráfico de status
  useEffect(() => {
    if (!chartsReady || !orderStatusChartRef.current) return;

    // Destruir instância anterior se existir
    if (orderStatusChartInstance.current) {
      orderStatusChartInstance.current.dispose();
    }

    // Inicializar nova instância
    orderStatusChartInstance.current = echarts.init(orderStatusChartRef.current);

    // Aplicar opções
    const options = getOrderStatusChartOption(kpiSummary?.orders_by_status || []);
    orderStatusChartInstance.current.setOption(options);

    // Adicionar listener para resize
    const handleResize = () => {
      orderStatusChartInstance.current?.resize();
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (orderStatusChartInstance.current) {
        orderStatusChartInstance.current.dispose();
      }
    };
  }, [chartsReady, kpiSummary?.orders_by_status]);

  // Inicializar e atualizar gráfico de performance
  useEffect(() => {
    if (!chartsReady || !jobPerformanceChartRef.current) return;

    if (jobPerformanceChartInstance.current) {
      jobPerformanceChartInstance.current.dispose();
    }

    jobPerformanceChartInstance.current = echarts.init(jobPerformanceChartRef.current);
    const options = getJobPerformanceChartOption(jobTypePerformance || []);
    jobPerformanceChartInstance.current.setOption(options);

    const handleResize = () => {
      jobPerformanceChartInstance.current?.resize();
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (jobPerformanceChartInstance.current) {
        jobPerformanceChartInstance.current.dispose();
      }
    };
  }, [chartsReady, jobTypePerformance]);

  // Inicializar e atualizar gráfico de timeline
  useEffect(() => {
    if (!chartsReady || !timelineChartRef.current) return;

    if (timelineChartInstance.current) {
      timelineChartInstance.current.dispose();
    }

    timelineChartInstance.current = echarts.init(timelineChartRef.current);
    const options = getTimelineChartOption(timeline || []);
    timelineChartInstance.current.setOption(options);

    const handleResize = () => {
      timelineChartInstance.current?.resize();
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (timelineChartInstance.current) {
        timelineChartInstance.current.dispose();
      }
    };
  }, [chartsReady, timeline]);

  // =====================================
  // 🎯 INITIAL DATA LOAD
  // =====================================

  useEffect(() => {
    // Calcular últimos 7 dias
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 7);

    const defaultFilters: OrderFilters = {
      startDate: startDate.toISOString().split('T')[0], // formato YYYY-MM-DD
      endDate: endDate.toISOString().split('T')[0]
    };

    // Setar filtros iniciais para o FilterPanel
    setInitialFilters(defaultFilters);

    // Fazer busca inicial
    fetchOrders(defaultFilters);
    
    console.log('Initial filters applied:', defaultFilters);
  }, [fetchOrders]);


  // =====================================
  // 📄 LOADING & ERROR STATES
  // =====================================

  if (loading && !kpiSummary) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <ErrorDisplay error={error} onRetry={fetchDashboardData} />;
  }

  // =====================================
  // 🎯 RENDER
  // =====================================

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <span className="text-4xl">📦</span>
              Orders Dashboard
            </h1>
            <p className="text-gray-600 mt-2">
              Real-time monitoring and analytics
            </p>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-500">Last updated</div>
            <div className="text-lg font-semibold text-gray-900">
              {new Date().toLocaleTimeString()}
            </div>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      {kpiSummary && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-8">
          <KPICard
            title="Total Orders"
            value={kpiSummary.total_orders || 0}
            subtitle={`${Number(kpiSummary.total_items) || 0} items total`}
            icon={<ShoppingBagIcon className="w-7 h-7" />}
            color="blue"
          />
          <KPICard
            title="Completed"
            value={kpiSummary.orders_complete || 0}
            subtitle={`${kpiSummary.total_orders ? ((kpiSummary.orders_complete / kpiSummary.total_orders) * 100).toFixed(1) : '0'}% of total`}
            icon={<CheckCircleIcon className="w-7 h-7" />}
            color="green"
          />
          <KPICard
            title="In Progress"
            value={kpiSummary.orders_in_progress || 0}
            subtitle="Currently being processed"
            icon={<ClockIcon className="w-7 h-7" />}
            color="orange"
          />
          <KPICard
            title="Pending"
            value={kpiSummary.orders_pending || 0}
            subtitle="Awaiting processing"
            icon={<ExclamationTriangleIcon className="w-7 h-7" />}
            color="yellow"
          />
          <KPICard
            title="Completion Rate"
            value={`${Number(kpiSummary.avg_completion_rate || 0).toFixed(2)}%`}
            subtitle="Average across all orders"
            icon={<ChartBarIcon className="w-7 h-7" />}
            color="purple"
          />
          <KPICard
            title="Items per Order"
            value={Number(kpiSummary.avg_items_per_order || 0).toFixed(2)}
            subtitle="Average"
            icon={<RectangleStackIcon className="w-7 h-7" />}
            color="teal"
          />
        </div>
      )}

      {/* Filters */}
      <FilterPanel
        initialFilters={initialFilters}  // ← Certifique que está passando aqui
        onApplyFilters={fetchOrders}
        onResetFilters={() => fetchOrders()}
      />

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Order Status Chart */}
        <ChartCard
          title="📊 Order Status Distribution"
          actions={
            <ExportButton
              onExport={() => exportChartAsPNG(orderStatusChartInstance.current, 'order_status')}
              label="Export PNG"
            />
          }
        >
          <div
            ref={orderStatusChartRef}
            className="w-full h-96"
          />
        </ChartCard>

        {/* Job Performance Chart */}
        <ChartCard
          title="💼 Job Type Performance Analysis"
          actions={
            <ExportButton
              onExport={() => exportChartAsPNG(jobPerformanceChartInstance.current, 'job_performance')}
              label="Export PNG"
            />
          }
        >
          <div
            ref={jobPerformanceChartRef}
            className="w-full h-96"
          />
        </ChartCard>
      </div>

      {/* Timeline Chart - Full Width */}
      <div className="mb-8">
        <ChartCard
          title="📅 Orders Timeline (Last 30 Days)"
          actions={
            <ExportButton
              onExport={() => exportChartAsPNG(timelineChartInstance.current, 'orders_timeline')}
              label="Export PNG"
            />
          }
        >
          <div
            ref={timelineChartRef}
            className="w-full h-96"
          />
        </ChartCard>
      </div>

      {/* Orders Table */}
      <OrdersTable orders={orders} loading={loading} />
    </div>
  );
}