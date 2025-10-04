import { useEffect, useRef } from 'react';
import * as echarts from 'echarts';
import { useTheme } from '../../context/ThemeContext';

export default function ComponentMN0400_012() {
  const { darkMode } = useTheme();
  
  const chartRef1 = useRef<HTMLDivElement>(null);
  const chartRef2 = useRef<HTMLDivElement>(null);
  const chartRef3 = useRef<HTMLDivElement>(null);
  const chartRef4 = useRef<HTMLDivElement>(null);
  const chartRef5 = useRef<HTMLDivElement>(null);
  const chartRef6 = useRef<HTMLDivElement>(null);
  const chartRef7 = useRef<HTMLDivElement>(null);
  const chartRef8 = useRef<HTMLDivElement>(null);
  const chartRef9 = useRef<HTMLDivElement>(null);
  const chartRef10 = useRef<HTMLDivElement>(null);
  const chartRef11 = useRef<HTMLDivElement>(null);
  const chartRef12 = useRef<HTMLDivElement>(null);
  const chartRef13 = useRef<HTMLDivElement>(null);
  const chartRef14 = useRef<HTMLDivElement>(null);

//   const [charts, setCharts] = useState<echarts.ECharts[]>([]);

  // Função para obter cores baseadas no tema
  const getThemeColors = () => {
    return {
      background: darkMode ? '#1f2937' : '#ffffff',
      textColor: darkMode ? '#f3f4f6' : '#1f2937',
      gridColor: darkMode ? '#374151' : '#e5e7eb',
      tooltipBg: darkMode ? '#374151' : '#ffffff',
      tooltipBorder: darkMode ? '#4b5563' : '#e5e7eb',
    };
  };

  // Configuração base para todos os gráficos
  const getBaseChartConfig = () => {
    const colors = getThemeColors();
    return {
      backgroundColor: 'transparent',
      textStyle: {
        color: colors.textColor,
      },
      title: {
        textStyle: {
          color: colors.textColor,
          fontSize: 16,
          fontWeight: 'bold',
        },
      },
      tooltip: {
        backgroundColor: colors.tooltipBg,
        borderColor: colors.tooltipBorder,
        borderWidth: 1,
        textStyle: {
          color: colors.textColor,
        },
      },
      legend: {
        textStyle: {
          color: colors.textColor,
        },
      },
      grid: {
        borderColor: colors.gridColor,
      },
      xAxis: {
        axisLine: {
          lineStyle: {
            color: colors.gridColor,
          },
        },
        axisLabel: {
          color: colors.textColor,
        },
        splitLine: {
          lineStyle: {
            color: colors.gridColor,
          },
        },
      },
      yAxis: {
        axisLine: {
          lineStyle: {
            color: colors.gridColor,
          },
        },
        axisLabel: {
          color: colors.textColor,
        },
        splitLine: {
          lineStyle: {
            color: colors.gridColor,
          },
        },
        nameTextStyle: {
          color: colors.textColor,
        },
      },
    };
  };

  useEffect(() => {
    const chartInstances: echarts.ECharts[] = [];
    const baseConfig = getBaseChartConfig();

    // Chart 1: Asset Performance Scores by Category
    if (chartRef1.current) {
      const chart = echarts.init(chartRef1.current);
      chartInstances.push(chart);
      
      chart.setOption({
        ...baseConfig,
        title: {
          ...baseConfig.title,
          text: 'Asset Performance Scores by Category',
          left: 'center',
        },
        tooltip: {
          ...baseConfig.tooltip,
          trigger: 'axis',
          axisPointer: { type: 'shadow' },
        },
        legend: {
          ...baseConfig.legend,
          data: ['Maintenance Score', 'Utilization Score', 'Documentation Score'],
          bottom: 10,
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '15%',
          top: '15%',
          containLabel: true,
        },
        xAxis: {
          ...baseConfig.xAxis,
          type: 'category',
          data: ['Vehicles', 'Equipment', 'IT Assets', 'Machinery', 'Buildings', 'Tools', 'Furniture', 'Safety Gear'],
          axisLabel: { ...baseConfig.xAxis.axisLabel, rotate: 45, interval: 0 },
        },
        yAxis: {
          ...baseConfig.yAxis,
          type: 'value',
          name: 'Score',
          max: 5,
        },
        series: [
          {
            name: 'Maintenance Score',
            type: 'bar',
            data: [4.2, 3.8, 4.5, 3.5, 4.1, 3.9, 4.0, 4.3],
            itemStyle: { color: '#5470c6' },
          },
          {
            name: 'Utilization Score',
            type: 'bar',
            data: [3.9, 4.1, 4.3, 3.7, 3.8, 4.0, 3.6, 4.2],
            itemStyle: { color: '#91cc75' },
          },
          {
            name: 'Documentation Score',
            type: 'bar',
            data: [4.0, 3.6, 4.6, 3.4, 4.2, 3.7, 3.9, 4.1],
            itemStyle: { color: '#fac858' },
          },
        ],
      });
    }

    // Chart 2: Asset Value Analysis by Category
    if (chartRef2.current) {
      const chart = echarts.init(chartRef2.current);
      chartInstances.push(chart);
      
      chart.setOption({
        ...baseConfig,
        title: {
          ...baseConfig.title,
          text: 'Asset Value Analysis by Category',
          left: 'center',
        },
        tooltip: {
          ...baseConfig.tooltip,
          trigger: 'axis',
          axisPointer: { type: 'shadow' },
          formatter: (params: any) => {
            let result = params[0].name + '<br/>';
            params.forEach((item: any) => {
              result += `${item.marker} ${item.seriesName}: $${(item.value / 1000).toFixed(0)}K<br/>`;
            });
            return result;
          },
        },
        legend: {
          ...baseConfig.legend,
          data: ['Current Value', 'Purchase Cost', 'Replacement Cost'],
          bottom: 10,
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '15%',
          top: '15%',
          containLabel: true,
        },
        xAxis: {
          ...baseConfig.xAxis,
          type: 'category',
          data: ['Vehicles', 'Equipment', 'IT Assets', 'Machinery', 'Buildings', 'Tools'],
          axisLabel: { ...baseConfig.xAxis.axisLabel, rotate: 45, interval: 0 },
        },
        yAxis: {
          ...baseConfig.yAxis,
          type: 'value',
          name: 'Value (USD)',
          axisLabel: {
            ...baseConfig.yAxis.axisLabel,
            formatter: (value: number) => `$${(value / 1000).toFixed(0)}K`,
          },
        },
        series: [
          {
            name: 'Current Value',
            type: 'bar',
            data: [450000, 320000, 280000, 550000, 1200000, 45000],
            itemStyle: { color: '#5470c6' },
          },
          {
            name: 'Purchase Cost',
            type: 'bar',
            data: [500000, 350000, 300000, 600000, 1300000, 50000],
            itemStyle: { color: '#91cc75' },
          },
          {
            name: 'Replacement Cost',
            type: 'bar',
            data: [550000, 380000, 350000, 650000, 1400000, 55000],
            itemStyle: { color: '#fac858' },
          },
        ],
      });
    }

    // Chart 3: Asset Utilization Score Distribution
    if (chartRef3.current) {
      const chart = echarts.init(chartRef3.current);
      chartInstances.push(chart);
      
      chart.setOption({
        ...baseConfig,
        title: {
          ...baseConfig.title,
          text: 'Asset Utilization Score Distribution',
          left: 'center',
        },
        tooltip: {
          ...baseConfig.tooltip,
          trigger: 'axis',
          axisPointer: { type: 'shadow' },
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '10%',
          top: '15%',
          containLabel: true,
        },
        xAxis: {
          ...baseConfig.xAxis,
          type: 'category',
          data: ['Very Low (1)', 'Low (2)', 'Medium (3)', 'High (4)', 'Very High (5)'],
        },
        yAxis: {
          ...baseConfig.yAxis,
          type: 'value',
          name: 'Count',
        },
        series: [
          {
            name: 'Assets',
            type: 'bar',
            data: [12, 28, 145, 98, 45],
            itemStyle: {
              color: (params: any) => {
                const colors = ['#ef4444', '#f97316', '#eab308', '#84cc16', '#22c55e'];
                return colors[params.dataIndex];
              },
            },
          },
        ],
      });
    }

    // Chart 4: Asset Value Depreciation Trends
    if (chartRef4.current) {
      const chart = echarts.init(chartRef4.current);
      chartInstances.push(chart);
      
      const years = Array.from({ length: 10 }, (_, i) => (new Date().getFullYear() - 9 + i).toString());
      
      chart.setOption({
        ...baseConfig,
        title: {
          ...baseConfig.title,
          text: 'Asset Value Depreciation Trends by Purchase Year',
          left: 'center',
        },
        tooltip: {
          ...baseConfig.tooltip,
          trigger: 'axis',
          formatter: (params: any) => {
            let result = params[0].name + '<br/>';
            params.forEach((item: any) => {
              result += `${item.marker} ${item.seriesName}: $${(item.value / 1000).toFixed(0)}K<br/>`;
            });
            return result;
          },
        },
        legend: {
          ...baseConfig.legend,
          data: ['Average Current Value', 'Average Purchase Cost', 'Average Replacement Cost'],
          bottom: 10,
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '15%',
          top: '15%',
          containLabel: true,
        },
        xAxis: {
          ...baseConfig.xAxis,
          type: 'category',
          data: years,
          boundaryGap: false,
        },
        yAxis: {
          ...baseConfig.yAxis,
          type: 'value',
          name: 'Value (USD)',
          axisLabel: {
            ...baseConfig.yAxis.axisLabel,
            formatter: (value: number) => `$${(value / 1000).toFixed(0)}K`,
          },
        },
        series: [
          {
            name: 'Average Current Value',
            type: 'line',
            data: [180000, 165000, 155000, 145000, 138000, 132000, 128000, 125000, 122000, 120000],
            smooth: true,
            itemStyle: { color: '#5470c6' },
            areaStyle: { opacity: 0.3 },
          },
          {
            name: 'Average Purchase Cost',
            type: 'line',
            data: [200000, 200000, 200000, 200000, 200000, 200000, 200000, 200000, 200000, 200000],
            smooth: true,
            itemStyle: { color: '#91cc75' },
            lineStyle: { type: 'dashed' },
          },
          {
            name: 'Average Replacement Cost',
            type: 'line',
            data: [220000, 225000, 230000, 235000, 240000, 245000, 250000, 255000, 260000, 265000],
            smooth: true,
            itemStyle: { color: '#fac858' },
          },
        ],
      });
    }

    // Chart 5: Asset Activity Tracking by Category
    if (chartRef5.current) {
      const chart = echarts.init(chartRef5.current);
      chartInstances.push(chart);
      
      chart.setOption({
        ...baseConfig,
        title: {
          ...baseConfig.title,
          text: 'Asset Activity Tracking by Category',
          left: 'center',
        },
        tooltip: {
          ...baseConfig.tooltip,
          trigger: 'axis',
          axisPointer: { type: 'shadow' },
        },
        legend: {
          ...baseConfig.legend,
          data: ['Active Last 30 Days', 'Audited Last Year', 'Maintained Last Quarter'],
          bottom: 10,
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '15%',
          top: '15%',
          containLabel: true,
        },
        xAxis: {
          ...baseConfig.xAxis,
          type: 'category',
          data: ['Vehicles', 'Equipment', 'IT Assets', 'Machinery', 'Buildings', 'Tools'],
          axisLabel: { ...baseConfig.xAxis.axisLabel, rotate: 45, interval: 0 },
        },
        yAxis: {
          ...baseConfig.yAxis,
          type: 'value',
          name: 'Count',
        },
        series: [
          {
            name: 'Active Last 30 Days',
            type: 'bar',
            data: [45, 38, 52, 29, 15, 67],
            itemStyle: { color: '#22c55e' },
          },
          {
            name: 'Audited Last Year',
            type: 'bar',
            data: [42, 35, 48, 27, 14, 63],
            itemStyle: { color: '#3b82f6' },
          },
          {
            name: 'Maintained Last Quarter',
            type: 'bar',
            data: [40, 33, 45, 25, 13, 60],
            itemStyle: { color: '#f97316' },
          },
        ],
      });
    }

    // Chart 6: ISO 55001 Compliance Status Distribution (Pie)
    if (chartRef6.current) {
      const chart = echarts.init(chartRef6.current);
      chartInstances.push(chart);
      
      chart.setOption({
        ...baseConfig,
        title: {
          ...baseConfig.title,
          text: 'ISO 55001 Compliance Status Distribution',
          left: 'center',
        },
        tooltip: {
          ...baseConfig.tooltip,
          trigger: 'item',
          formatter: '{a} <br/>{b}: {c} ({d}%)',
        },
        legend: {
          ...baseConfig.legend,
          orient: 'vertical',
          right: 10,
          top: 'center',
        },
        series: [
          {
            name: 'Compliance Status',
            type: 'pie',
            radius: ['40%', '70%'],
            avoidLabelOverlap: false,
            itemStyle: {
              borderRadius: 10,
              borderColor: darkMode ? '#1f2937' : '#fff',
              borderWidth: 2,
            },
            label: {
              show: true,
              formatter: '{b}: {d}%',
              color: getThemeColors().textColor,
            },
            emphasis: {
              label: {
                show: true,
                fontSize: 16,
                fontWeight: 'bold',
              },
            },
            data: [
              { value: 185, name: 'Compliant', itemStyle: { color: '#22c55e' } },
              { value: 78, name: 'Partially Compliant', itemStyle: { color: '#eab308' } },
              { value: 45, name: 'Non-Compliant', itemStyle: { color: '#ef4444' } },
              { value: 20, name: 'Unknown', itemStyle: { color: '#9ca3af' } },
            ],
          },
        ],
      });
    }

    // Chart 7: Asset Health Status Distribution
    if (chartRef7.current) {
      const chart = echarts.init(chartRef7.current);
      chartInstances.push(chart);
      
      chart.setOption({
        ...baseConfig,
        title: {
          ...baseConfig.title,
          text: 'Asset Health Status Distribution',
          left: 'center',
        },
        tooltip: {
          ...baseConfig.tooltip,
          trigger: 'axis',
          axisPointer: { type: 'shadow' },
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '10%',
          top: '15%',
          containLabel: true,
        },
        xAxis: {
          ...baseConfig.xAxis,
          type: 'category',
          data: ['Excellent', 'Good', 'Fair', 'Poor', 'Critical'],
        },
        yAxis: {
          ...baseConfig.yAxis,
          type: 'value',
          name: 'Count',
        },
        series: [
          {
            name: 'Assets',
            type: 'bar',
            data: [68, 142, 89, 25, 4],
            itemStyle: {
              color: (params: any) => {
                const colors = ['#22c55e', '#84cc16', '#eab308', '#f97316', '#ef4444'];
                return colors[params.dataIndex];
              },
            },
            label: {
              show: true,
              position: 'top',
              color: getThemeColors().textColor,
            },
          },
        ],
      });
    }

    // Chart 8: Asset Maintenance Status Distribution
    if (chartRef8.current) {
      const chart = echarts.init(chartRef8.current);
      chartInstances.push(chart);
      
      chart.setOption({
        ...baseConfig,
        title: {
          ...baseConfig.title,
          text: 'Asset Maintenance Status Distribution',
          left: 'center',
        },
        tooltip: {
          ...baseConfig.tooltip,
          trigger: 'axis',
          axisPointer: { type: 'shadow' },
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '15%',
          top: '15%',
          containLabel: true,
        },
        xAxis: {
          ...baseConfig.xAxis,
          type: 'category',
          data: ['Overdue', 'Due Soon\n(7 days)', 'Due Soon\n(30 days)', 'Up to Date', 'No Schedule'],
        },
        yAxis: {
          ...baseConfig.yAxis,
          type: 'value',
          name: 'Count',
        },
        series: [
          {
            name: 'Assets',
            type: 'bar',
            data: [23, 15, 47, 198, 45],
            itemStyle: {
              color: (params: any) => {
                const colors = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#9ca3af'];
                return colors[params.dataIndex];
              },
            },
            label: {
              show: true,
              position: 'top',
              color: getThemeColors().textColor,
            },
          },
        ],
      });
    }

    // Chart 9: Risk Score by Asset Category (Time Series)
    if (chartRef9.current) {
      const chart = echarts.init(chartRef9.current);
      chartInstances.push(chart);
      
      chart.setOption({
        ...baseConfig,
        title: {
          ...baseConfig.title,
          text: 'Risk Score by Asset Category',
          left: 'center',
        },
        tooltip: {
          ...baseConfig.tooltip,
          trigger: 'axis',
        },
        legend: {
          ...baseConfig.legend,
          data: ['Vehicles', 'Equipment', 'IT Assets', 'Machinery', 'Buildings', 'Tools'],
          bottom: 10,
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '15%',
          top: '15%',
          containLabel: true,
        },
        xAxis: {
          ...baseConfig.xAxis,
          type: 'category',
          data: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
          boundaryGap: false,
        },
        yAxis: {
          ...baseConfig.yAxis,
          type: 'value',
          name: 'Risk Score',
          max: 5,
        },
        series: [
          {
            name: 'Vehicles',
            type: 'line',
            data: [2.8, 2.9, 2.7, 2.8, 2.9, 3.0],
            smooth: true,
          },
          {
            name: 'Equipment',
            type: 'line',
            data: [3.2, 3.1, 3.3, 3.2, 3.1, 3.0],
            smooth: true,
          },
          {
            name: 'IT Assets',
            type: 'line',
            data: [2.5, 2.4, 2.6, 2.5, 2.4, 2.3],
            smooth: true,
          },
          {
            name: 'Machinery',
            type: 'line',
            data: [3.5, 3.6, 3.4, 3.5, 3.6, 3.7],
            smooth: true,
          },
          {
            name: 'Buildings',
            type: 'line',
            data: [2.9, 2.8, 3.0, 2.9, 2.8, 2.7],
            smooth: true,
          },
          {
            name: 'Tools',
            type: 'line',
            data: [3.1, 3.0, 3.2, 3.1, 3.0, 2.9],
            smooth: true,
          },
        ],
      });
    }

    // Chart 10: Maintenance Schedule Status by Category
    if (chartRef10.current) {
      const chart = echarts.init(chartRef10.current);
      chartInstances.push(chart);
      
      chart.setOption({
        ...baseConfig,
        title: {
          ...baseConfig.title,
          text: 'Maintenance Schedule Status by Category',
          left: 'center',
        },
        tooltip: {
          ...baseConfig.tooltip,
          trigger: 'axis',
          axisPointer: { type: 'shadow' },
        },
        legend: {
          ...baseConfig.legend,
          data: ['Overdue', 'Due in 30 days', 'On Schedule'],
          bottom: 10,
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '15%',
          top: '15%',
          containLabel: true,
        },
        xAxis: {
          ...baseConfig.xAxis,
          type: 'category',
          data: ['Vehicles', 'Equipment', 'IT Assets', 'Machinery', 'Buildings', 'Tools'],
          axisLabel: { ...baseConfig.xAxis.axisLabel, rotate: 45, interval: 0 },
        },
        yAxis: {
          ...baseConfig.yAxis,
          type: 'value',
          name: 'Count',
        },
        series: [
          {
            name: 'Overdue',
            type: 'bar',
            stack: 'total',
            data: [5, 8, 3, 12, 2, 9],
            itemStyle: { color: '#ef4444' },
          },
          {
            name: 'Due in 30 days',
            type: 'bar',
            stack: 'total',
            data: [8, 12, 6, 15, 4, 14],
            itemStyle: { color: '#f97316' },
          },
          {
            name: 'On Schedule',
            type: 'bar',
            stack: 'total',
            data: [32, 18, 43, 2, 9, 44],
            itemStyle: { color: '#22c55e' },
          },
        ],
      });
    }

    // Chart 11: Warranty & Insurance Status by Category
    if (chartRef11.current) {
      const chart = echarts.init(chartRef11.current);
      chartInstances.push(chart);
      
      chart.setOption({
        ...baseConfig,
        title: {
          ...baseConfig.title,
          text: 'Warranty & Insurance Status by Category',
          left: 'center',
        },
        tooltip: {
          ...baseConfig.tooltip,
          trigger: 'axis',
          axisPointer: { type: 'shadow' },
        },
        legend: {
          ...baseConfig.legend,
          data: ['Warranty Valid', 'Warranty Expired', 'Insurance Valid', 'Insurance Expired'],
          bottom: 10,
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '15%',
          top: '15%',
          containLabel: true,
        },
        xAxis: {
          ...baseConfig.xAxis,
          type: 'category',
          data: ['Vehicles', 'Equipment', 'IT Assets', 'Machinery', 'Buildings', 'Tools'],
          axisLabel: { ...baseConfig.xAxis.axisLabel, rotate: 45, interval: 0 },
        },
        yAxis: {
          ...baseConfig.yAxis,
          type: 'value',
          name: 'Count',
        },
        series: [
          {
            name: 'Warranty Valid',
            type: 'bar',
            data: [28, 22, 38, 15, 8, 42],
            itemStyle: { color: '#22c55e' },
          },
          {
            name: 'Warranty Expired',
            type: 'bar',
            data: [17, 16, 14, 14, 7, 25],
            itemStyle: { color: '#ef4444' },
          },
          {
            name: 'Insurance Valid',
            type: 'bar',
            data: [35, 28, 45, 20, 12, 55],
            itemStyle: { color: '#10b981' },
          },
          {
            name: 'Insurance Expired',
            type: 'bar',
            data: [10, 10, 7, 9, 3, 12],
            itemStyle: { color: '#dc2626' },
          },
        ],
      });
    }

    // Chart 12: Asset Lifecycle Stage Distribution
    if (chartRef12.current) {
      const chart = echarts.init(chartRef12.current);
      chartInstances.push(chart);
      
      chart.setOption({
        ...baseConfig,
        title: {
          ...baseConfig.title,
          text: 'Asset Lifecycle Stage Distribution',
          left: 'center',
        },
        tooltip: {
          ...baseConfig.tooltip,
          trigger: 'axis',
          axisPointer: { type: 'shadow' },
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '10%',
          top: '15%',
          containLabel: true,
        },
        xAxis: {
          ...baseConfig.xAxis,
          type: 'category',
          data: ['Planning', 'Acquisition', 'Operation', 'Maintenance', 'Disposal'],
        },
        yAxis: {
          ...baseConfig.yAxis,
          type: 'value',
          name: 'Count',
        },
        series: [
          {
            name: 'Assets',
            type: 'bar',
            data: [15, 42, 178, 85, 8],
            itemStyle: {
              color: (params: any) => {
                const colors = ['#3b82f6', '#22c55e', '#10b981', '#f59e0b', '#ef4444'];
                return colors[params.dataIndex];
              },
            },
            label: {
              show: true,
              position: 'top',
              fontSize: 12,
              color: getThemeColors().textColor,
            },
          },
        ],
      });
    }

    // Chart 13: Recommended Actions Distribution
    if (chartRef13.current) {
      const chart = echarts.init(chartRef13.current);
      chartInstances.push(chart);
      
      chart.setOption({
        ...baseConfig,
        title: {
          ...baseConfig.title,
          text: 'Recommended Actions Distribution',
          left: 'center',
        },
        tooltip: {
          ...baseConfig.tooltip,
          trigger: 'axis',
          axisPointer: { type: 'shadow' },
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '10%',
          top: '15%',
          containLabel: true,
        },
        xAxis: {
          ...baseConfig.xAxis,
          type: 'value',
          name: 'Count',
        },
        yAxis: {
          ...baseConfig.yAxis,
          type: 'category',
          data: ['Monitor', 'Maintain', 'Inspect', 'Replace', 'Retire'],
        },
        series: [
          {
            name: 'Assets',
            type: 'bar',
            data: [145, 98, 56, 23, 6],
            itemStyle: {
              color: (params: any) => {
                const colors = ['#22c55e', '#eab308', '#f97316', '#ef4444', '#dc2626'];
                return colors[params.dataIndex];
              },
            },
            label: {
              show: true,
              position: 'right',
              fontSize: 12,
              color: getThemeColors().textColor,
            },
          },
        ],
      });
    }

    // Chart 14: Asset Age Analysis by Category
    if (chartRef14.current) {
      const chart = echarts.init(chartRef14.current);
      chartInstances.push(chart);
      
      chart.setOption({
        ...baseConfig,
        title: {
          ...baseConfig.title,
          text: 'Asset Age Analysis by Category',
          left: 'center',
        },
        tooltip: {
          ...baseConfig.tooltip,
          trigger: 'axis',
          axisPointer: { type: 'shadow' },
        },
        legend: {
          ...baseConfig.legend,
          data: ['Average Age', 'Max Age', 'Min Age'],
          bottom: 10,
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '15%',
          top: '15%',
          containLabel: true,
        },
        xAxis: {
          ...baseConfig.xAxis,
          type: 'category',
          data: ['Vehicles', 'Equipment', 'IT Assets', 'Machinery', 'Buildings', 'Tools'],
          axisLabel: { ...baseConfig.xAxis.axisLabel, rotate: 45, interval: 0 },
        },
        yAxis: {
          ...baseConfig.yAxis,
          type: 'value',
          name: 'Years',
        },
        series: [
          {
            name: 'Average Age',
            type: 'bar',
            data: [7.2, 8.5, 4.3, 12.1, 25.6, 5.8],
            itemStyle: { color: '#3b82f6' },
          },
          {
            name: 'Max Age',
            type: 'bar',
            data: [15, 18, 10, 25, 45, 12],
            itemStyle: { color: '#ef4444' },
          },
          {
            name: 'Min Age',
            type: 'bar',
            data: [1, 2, 0.5, 3, 5, 0.8],
            itemStyle: { color: '#22c55e' },
          },
        ],
      });
    }

    // setCharts(chartInstances);

    const handleResize = () => {
      chartInstances.forEach(chart => chart.resize());
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chartInstances.forEach(chart => chart.dispose());
    };
  }, [darkMode]);

  return (
    <div className={`w-full min-h-screen p-4 md:p-6 ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Header */}
      <div className="mb-6">
        <h1 className={`text-2xl md:text-3xl font-bold mb-2 ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>
          Asset Management - ISO 55001 Compliance KPIs
        </h1>
        <p className={`text-sm md:text-base ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          Comprehensive dashboard for asset management and compliance tracking
        </p>
      </div>

      {/* Main KPIs Section */}
      <div className={`rounded-lg shadow-md p-4 md:p-6 mb-6 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
        <h2 className={`text-lg md:text-xl font-bold mb-4 ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>
          Main KPIs ISO 55001
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3 md:gap-4">
          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg p-3 md:p-4 text-white shadow-md hover:shadow-lg transition-shadow">
            <div className="text-xs font-medium mb-1">Overall Risk Score</div>
            <div className="text-xl md:text-2xl font-bold">2.8</div>
          </div>
          
          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg p-3 md:p-4 text-white shadow-md hover:shadow-lg transition-shadow">
            <div className="text-xs font-medium mb-1">Asset Health Score</div>
            <div className="text-xl md:text-2xl font-bold">3.2</div>
          </div>
          
          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg p-3 md:p-4 text-white shadow-md hover:shadow-lg transition-shadow">
            <div className="text-xs font-medium mb-1">Maintenance Risk</div>
            <div className="text-xl md:text-2xl font-bold">2.5</div>
          </div>
          
          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg p-3 md:p-4 text-white shadow-md hover:shadow-lg transition-shadow">
            <div className="text-xs font-medium mb-1">Criticality Risk</div>
            <div className="text-xl md:text-2xl font-bold">2.9</div>
          </div>
          
          <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg p-3 md:p-4 text-white shadow-md hover:shadow-lg transition-shadow">
            <div className="text-xs font-medium mb-1">Avg Warranty Days</div>
            <div className="text-xl md:text-2xl font-bold">45</div>
          </div>
          
          <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg p-3 md:p-4 text-white shadow-md hover:shadow-lg transition-shadow">
            <div className="text-xs font-medium mb-1">Maintenance Due Days</div>
            <div className="text-xl md:text-2xl font-bold">18</div>
          </div>
          
          <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg p-3 md:p-4 text-white shadow-md hover:shadow-lg transition-shadow">
            <div className="text-xs font-medium mb-1">Audit Compliance %</div>
            <div className="text-xl md:text-2xl font-bold">78%</div>
          </div>
          
          <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-lg p-3 md:p-4 text-white shadow-md hover:shadow-lg transition-shadow">
            <div className="text-xs font-medium mb-1">Critical Assets</div>
            <div className="text-xl md:text-2xl font-bold">12</div>
          </div>
        </div>
      </div>

      {/* Financial KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className={`rounded-lg shadow-md p-4 md:p-6 hover:shadow-lg transition-shadow ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <div className="flex items-center justify-between mb-2">
            <div className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Total Cost of Ownership
            </div>
          </div>
          <div className={`text-2xl md:text-3xl font-bold ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>
            $2.4M
          </div>
          <div className="mt-2 text-xs text-green-600">↑ 5.2% from last quarter</div>
        </div>
        
        <div className={`rounded-lg shadow-md p-4 md:p-6 hover:shadow-lg transition-shadow ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <div className="flex items-center justify-between mb-2">
            <div className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Value at Risk
            </div>
          </div>
          <div className="text-2xl md:text-3xl font-bold text-red-600">$850K</div>
          <div className="mt-2 text-xs text-red-600">↑ 12% from last quarter</div>
        </div>
        
        <div className={`rounded-lg shadow-md p-4 md:p-6 hover:shadow-lg transition-shadow ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <div className="flex items-center justify-between mb-2">
            <div className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Documentation Completeness
            </div>
          </div>
          <div className="text-2xl md:text-3xl font-bold text-green-600">89%</div>
          <div className="mt-2 text-xs text-green-600">↑ 3% from last quarter</div>
        </div>
        
        <div className={`rounded-lg shadow-md p-4 md:p-6 hover:shadow-lg transition-shadow ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <div className="flex items-center justify-between mb-2">
            <div className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Average Asset ROI
            </div>
          </div>
          <div className="text-2xl md:text-3xl font-bold text-green-600">18.5%</div>
          <div className="mt-2 text-xs text-green-600">↑ 2.1% from last quarter</div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="space-y-6">
        {/* Chart 1 */}
        <div className={`rounded-lg shadow-md p-4 md:p-6 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <div ref={chartRef1} className="w-full" style={{ height: '400px' }} />
        </div>

        {/* Charts 2 and 3 side by side */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className={`rounded-lg shadow-md p-4 md:p-6 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <div ref={chartRef2} className="w-full" style={{ height: '400px' }} />
          </div>
          <div className={`rounded-lg shadow-md p-4 md:p-6 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <div ref={chartRef3} className="w-full" style={{ height: '400px' }} />
          </div>
        </div>

        {/* Chart 4 */}
        <div className={`rounded-lg shadow-md p-4 md:p-6 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <div ref={chartRef4} className="w-full" style={{ height: '400px' }} />
        </div>

        {/* Chart 5 */}
        <div className={`rounded-lg shadow-md p-4 md:p-6 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <div ref={chartRef5} className="w-full" style={{ height: '400px' }} />
        </div>

        {/* Charts 6 and 7 side by side */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className={`rounded-lg shadow-md p-4 md:p-6 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <div ref={chartRef6} className="w-full" style={{ height: '400px' }} />
          </div>
          <div className={`rounded-lg shadow-md p-4 md:p-6 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <div ref={chartRef7} className="w-full" style={{ height: '400px' }} />
          </div>
        </div>

        {/* Charts 8 and 12 side by side */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className={`rounded-lg shadow-md p-4 md:p-6 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <div ref={chartRef8} className="w-full" style={{ height: '400px' }} />
          </div>
          <div className={`rounded-lg shadow-md p-4 md:p-6 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <div ref={chartRef12} className="w-full" style={{ height: '400px' }} />
          </div>
        </div>

        {/* Charts 13 and 14 side by side */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className={`rounded-lg shadow-md p-4 md:p-6 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <div ref={chartRef13} className="w-full" style={{ height: '400px' }} />
          </div>
          <div className={`rounded-lg shadow-md p-4 md:p-6 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <div ref={chartRef14} className="w-full" style={{ height: '400px' }} />
          </div>
        </div>

        {/* Performance and Health Section */}
        <div className={`rounded-lg shadow-md p-4 md:p-6 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <h2 className={`text-lg md:text-xl font-bold mb-4 ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>
            Health and Performance
          </h2>
          <div ref={chartRef9} className="w-full" style={{ height: '450px' }} />
        </div>

        {/* Chart 10 */}
        <div className={`rounded-lg shadow-md p-4 md:p-6 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <div ref={chartRef10} className="w-full" style={{ height: '450px' }} />
        </div>

        {/* Chart 11 */}
        <div className={`rounded-lg shadow-md p-4 md:p-6 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <div ref={chartRef11} className="w-full" style={{ height: '400px' }} />
        </div>

        {/* Critical Assets Table */}
        <div className={`rounded-lg shadow-md p-4 md:p-6 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <h3 className={`text-base md:text-lg font-bold mb-4 ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>
            Critical Assets - Immediate Attention Required
          </h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className={darkMode ? 'bg-gray-700' : 'bg-gray-50'}>
                <tr>
                  <th className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                    Asset Name
                  </th>
                  <th className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                    Category
                  </th>
                  <th className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                    Criticality
                  </th>
                  <th className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                    Overall Risk
                  </th>
                  <th className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                    Health Score
                  </th>
                  <th className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                    Age (Years)
                  </th>
                  <th className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                    Current Value
                  </th>
                  <th className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                    Recommended Action
                  </th>
                </tr>
              </thead>
              <tbody className={`divide-y ${darkMode ? 'divide-gray-700 bg-gray-800' : 'divide-gray-200 bg-white'}`}>
                {[
                  {
                    name: 'Hydraulic Press #5',
                    category: 'Machinery',
                    criticality: 'High',
                    risk: 4.8,
                    health: 1.5,
                    age: 15,
                    value: '$125,000',
                    action: 'Replace',
                  },
                  {
                    name: 'Forklift FL-012',
                    category: 'Vehicles',
                    criticality: 'High',
                    risk: 4.5,
                    health: 2.0,
                    age: 12,
                    value: '$45,000',
                    action: 'Inspect',
                  },
                  {
                    name: 'HVAC System B',
                    category: 'Buildings',
                    criticality: 'Critical',
                    risk: 4.7,
                    health: 1.8,
                    age: 18,
                    value: '$85,000',
                    action: 'Replace',
                  },
                  {
                    name: 'Server Rack SR-03',
                    category: 'IT Assets',
                    criticality: 'High',
                    risk: 4.2,
                    health: 2.3,
                    age: 8,
                    value: '$35,000',
                    action: 'Maintain',
                  },
                  {
                    name: 'Conveyor Belt C-7',
                    category: 'Equipment',
                    criticality: 'High',
                    risk: 4.6,
                    health: 1.9,
                    age: 14,
                    value: '$55,000',
                    action: 'Inspect',
                  },
                ].map((asset, idx) => (
                  <tr key={idx} className={darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}>
                    <td className={`px-4 py-4 whitespace-nowrap text-sm font-medium ${darkMode ? 'text-gray-200' : 'text-gray-900'}`}>
                      {asset.name}
                    </td>
                    <td className={`px-4 py-4 whitespace-nowrap text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      {asset.category}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        asset.criticality === 'Critical' 
                          ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' 
                          : 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
                      }`}>
                        {asset.criticality}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className={`w-16 rounded-full h-2.5 mr-2 ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
                          <div
                            className={`h-2.5 rounded-full ${
                              asset.risk >= 4.5 ? 'bg-red-600' : 'bg-orange-600'
                            }`}
                            style={{ width: `${(asset.risk / 5) * 100}%` }}
                          />
                        </div>
                        <span className={`text-sm ${darkMode ? 'text-gray-200' : 'text-gray-900'}`}>
                          {asset.risk}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className={`w-16 rounded-full h-2.5 mr-2 ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
                          <div
                            className={`h-2.5 rounded-full ${
                              asset.health <= 2 ? 'bg-red-600' : 'bg-yellow-600'
                            }`}
                            style={{ width: `${(asset.health / 5) * 100}%` }}
                          />
                        </div>
                        <span className={`text-sm ${darkMode ? 'text-gray-200' : 'text-gray-900'}`}>
                          {asset.health}
                        </span>
                      </div>
                    </td>
                    <td className={`px-4 py-4 whitespace-nowrap text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      {asset.age}
                    </td>
                    <td className={`px-4 py-4 whitespace-nowrap text-sm ${darkMode ? 'text-gray-200' : 'text-gray-900'}`}>
                      {asset.value}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        asset.action === 'Replace' 
                          ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' 
                          : asset.action === 'Inspect'
                          ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
                          : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                      }`}>
                        {asset.action}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Additional Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
          <div className={`rounded-lg shadow-md p-4 md:p-6 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <h3 className={`text-sm font-medium mb-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Misplaced Assets
            </h3>
            <div className="text-3xl md:text-4xl font-bold text-red-600 mb-2">7</div>
            <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
              Assets requiring location verification
            </p>
            <div className={`mt-4 pt-4 ${darkMode ? 'border-t border-gray-700' : 'border-t border-gray-200'}`}>
              <button className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium">
                View Details →
              </button>
            </div>
          </div>

          <div className={`rounded-lg shadow-md p-4 md:p-6 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <h3 className={`text-sm font-medium mb-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Pending Audits
            </h3>
            <div className="text-3xl md:text-4xl font-bold text-orange-600 mb-2">23</div>
            <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
              Assets due for audit this month
            </p>
            <div className={`mt-4 pt-4 ${darkMode ? 'border-t border-gray-700' : 'border-t border-gray-200'}`}>
              <button className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium">
                Schedule Audits →
              </button>
            </div>
          </div>

          <div className={`rounded-lg shadow-md p-4 md:p-6 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <h3 className={`text-sm font-medium mb-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Maintenance Backlog
            </h3>
            <div className="text-3xl md:text-4xl font-bold text-yellow-600 mb-2">15</div>
            <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
              Overdue maintenance tasks
            </p>
            <div className={`mt-4 pt-4 ${darkMode ? 'border-t border-gray-700' : 'border-t border-gray-200'}`}>
              <button className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium">
                View Tasks →
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}