// src/components/Logistics/componentMN0400_344_IMPROVED.tsx
import { useEffect, useRef } from 'react';
import { useCompany } from '../../hooks/useCompany';
import { useOrders } from '../../hooks/useOrders';
import * as echarts from 'echarts';
import { LoadingSpinner } from './components/Logistics/Orders/LoadingSpinner';
import { ErrorDisplay } from './components/Logistics/Orders/ErrorDisplay';
import { KPICard } from './components/Logistics/Orders/KPICard';
import { FilterPanel } from './components/Logistics/Orders/FilterPanel';
import { ChartCard } from './components/Logistics/Orders/ChartCard';
import { ExportButton } from './components/Logistics/Orders/ExportButton';
import { OrdersTable } from './components/Logistics/Orders/OrdersTable';


export default function OrderDashboard() {
  const { companyId } = useCompany();
  const {
    loading,
    error,
    kpiSummary,
    jobTypePerformance,
    timeline,
    itemStatusDistribution,
    orders,
    fetchOrders,
    fetchDashboardData
  } = useOrders();

  // Refs para charts
  const chartsRef = useRef<{
    orderStatus?: echarts.ECharts;
    jobPerformance?: echarts.ECharts;
    timeline?: echarts.ECharts;
    itemStatus?: echarts.ECharts;
  }>({});

  // =====================================
  // 📊 CHART CONFIGURATIONS
  // =====================================

  const getOrderStatusChartOption = (data: any[]) => ({
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
  });

  const getJobPerformanceChartOption = (data: any[]) => ({
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
      data: data.map(d => d.job_type_code),
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
        data: data.map(d => d.total_orders),
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
        data: data.map(d => d.avg_completion_pct),
        itemStyle: { color: '#10b981' },
        lineStyle: { width: 3 },
        smooth: true
      }
    ]
  });

  const getTimelineChartOption = (data: any[]) => ({
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
      data: data.map(d => new Date(d.date_bucket).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })),
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
        data: data.map(d => d.orders_created),
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
        data: data.map(d => d.orders_completed),
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
        data: data.map(d => d.items_processed),
        itemStyle: { color: '#f59e0b' },
        lineStyle: { width: 2 }
      }
    ]
  });

  const getItemStatusChartOption = (data: any[]) => ({
    title: {
      text: 'Item Status Distribution',
      left: 'center',
      textStyle: { fontSize: 16, fontWeight: 600, color: '#1f2937' }
    },
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c} items ({d}%)'
    },
    legend: {
      orient: 'vertical',
      left: 'left',
      top: 'middle',
      textStyle: { fontSize: 12 }
    },
    series: [{
      type: 'pie',
      radius: ['40%', '70%'],
      center: ['60%', '50%'],
      data: data.map(item => ({
        value: item.count,
        name: formatStatusName(item.status),
        itemStyle: { color: item.color }
      })),
      emphasis: {
        label: {
          show: true,
          fontSize: 14,
          fontWeight: 'bold'
        }
      },
      label: {
        formatter: '{b}\n{d}%',
        fontSize: 12
      }
    }]
  });

  // =====================================
  // 🎨 UTILITY FUNCTIONS
  // =====================================

  const formatStatusName = (status: string) => {
    return status;
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

  const exportChartAsPNG = (chartInstance: echarts.ECharts | undefined, filename: string) => {
    if (!chartInstance) return;

    const url = chartInstance.getDataURL({
      type: 'png',
      pixelRatio: 2,
      backgroundColor: '#fff'
    });

    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename}_${new Date().toISOString().slice(0, 10)}.png`;
    link.click();
  };

  // =====================================
  // 🔄 CHART UPDATES
  // =====================================

  useEffect(() => {
    if (kpiSummary?.orders_by_status && chartsRef.current.orderStatus) {
      chartsRef.current.orderStatus.setOption(getOrderStatusChartOption(kpiSummary.orders_by_status));
    }
  }, [kpiSummary]);

  useEffect(() => {
    if (jobTypePerformance && chartsRef.current.jobPerformance) {
      chartsRef.current.jobPerformance.setOption(getJobPerformanceChartOption(jobTypePerformance));
    }
  }, [jobTypePerformance]);

  useEffect(() => {
    if (timeline && chartsRef.current.timeline) {
      chartsRef.current.timeline.setOption(getTimelineChartOption(timeline));
    }
  }, [timeline]);

  useEffect(() => {
    if (itemStatusDistribution && chartsRef.current.itemStatus) {
      chartsRef.current.itemStatus.setOption(getItemStatusChartOption(itemStatusDistribution));
    }
  }, [itemStatusDistribution]);

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
              Real-time monitoring and analytics • Company ID: {companyId}
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
            value={kpiSummary.total_orders}
            subtitle={`${kpiSummary.total_items} items total`}
            icon="📦"
            color="blue"
          />
          <KPICard
            title="Completed"
            value={kpiSummary.orders_complete}
            subtitle={`${((kpiSummary.orders_complete / kpiSummary.total_orders) * 100)}% of total`}
            icon="✅"
            color="green"
          />
          <KPICard
            title="In Progress"
            value={kpiSummary.orders_in_progress}
            subtitle="Currently active"
            icon="🔄"
            color="yellow"
          />
          <KPICard
            title="Info Received"
            value={kpiSummary.orders_info_received}
            subtitle="Pending start"
            icon="📨"
            color="indigo"
          />
          <KPICard
            title="Completion Rate"
            value={`${kpiSummary.avg_completion_rate}%`}
            subtitle="Average across all orders"
            icon="📊"
            color="purple"
          />
          <KPICard
            title="Items per Order"
            value={kpiSummary.avg_items_per_order}
            subtitle="Average"
            icon="📋"
            color="blue"
          />
        </div>
      )}

      {/* Filters */}
      <FilterPanel
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
              onExport={() => exportChartAsPNG(chartsRef.current.orderStatus, 'order_status')}
              label="Export PNG"
            />
          }
        >
          <div
            ref={(el) => {
              if (el && !chartsRef.current.orderStatus) {
                chartsRef.current.orderStatus = echarts.init(el);
              }
            }}
            className="w-full h-96"
          />
        </ChartCard>

        {/* Item Status Chart */}
        <ChartCard
          title="🎨 Item Status Distribution"
          actions={
            <ExportButton
              onExport={() => exportChartAsPNG(chartsRef.current.itemStatus, 'item_status')}
              label="Export PNG"
            />
          }
        >
          <div
            ref={(el) => {
              if (el && !chartsRef.current.itemStatus) {
                chartsRef.current.itemStatus = echarts.init(el);
              }
            }}
            className="w-full h-96"
          />
        </ChartCard>
      </div>

      {/* Job Performance Chart */}
      <div className="mb-8">
        <ChartCard
          title="💼 Job Type Performance Analysis"
          actions={
            <ExportButton
              onExport={() => exportChartAsPNG(chartsRef.current.jobPerformance, 'job_performance')}
              label="Export PNG"
            />
          }
        >
          <div
            ref={(el) => {
              if (el && !chartsRef.current.jobPerformance) {
                chartsRef.current.jobPerformance = echarts.init(el);
              }
            }}
            className="w-full h-96"
          />
        </ChartCard>
      </div>

      {/* Timeline Chart */}
      <div className="mb-8">
        <ChartCard
          title="📅 Orders Timeline"
          actions={
            <ExportButton
              onExport={() => exportChartAsPNG(chartsRef.current.timeline, 'orders_timeline')}
              label="Export PNG"
            />
          }
        >
          <div
            ref={(el) => {
              if (el && !chartsRef.current.timeline) {
                chartsRef.current.timeline = echarts.init(el);
              }
            }}
            className="w-full h-96"
          />
        </ChartCard>
      </div>

      {/* Orders Table */}
      <OrdersTable orders={orders} loading={loading} />
    </div>
  );
}