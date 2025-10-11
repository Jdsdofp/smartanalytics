import { useEffect, useRef } from 'react';
import * as echarts from 'echarts';
import { useTheme } from '../../context/ThemeContext';


export default function AssetManagement() {
  const { darkMode } = useTheme();
   
  const pieChartRef = useRef(null);
  const barChartRef = useRef(null);
  const donutChartRef = useRef(null);
  const trendChartRef = useRef(null);

  // Cores baseadas no tema
  const getColors = () => ({
    text: darkMode ? '#e5e7eb' : '#111827',
    textSecondary: darkMode ? '#9ca3af' : '#6b7280',
    background: darkMode ? '#1f2937' : '#ffffff',
    border: darkMode ? '#374151' : '#e5e7eb',
    gridLine: darkMode ? '#374151' : '#e5e7eb'
  });

  //  // Atualizar gráfico de PIE com dados reais
  // useEffect(() => {
  //   if (pieChartRef.current) {
  //     const pieChart = echarts.init(pieChartRef.current);
  //     const pieOption = {
  //       // ... configurações ...
  //       series: [{
  //         type: 'pie',
  //         radius: ['40%', '70%'],
  //         data: statusData.map(item => ({
  //           value: parseFloat(item.percentage),
  //           name: item.status,
  //           itemStyle: { color: item.color }
  //         }))
  //       }]
  //     };
  //     pieChart.setOption(pieOption);
  //   }
  // }, [statusData, darkMode]);

  // // Atualizar gráfico de BARRAS com dados reais
  // useEffect(() => {
  //   if (barChartRef.current && brandsData.length > 0) {
  //     const barChart = echarts.init(barChartRef.current);
  //     const barOption = {
  //       // ... configurações ...
  //       yAxis: {
  //         type: 'category',
  //         data: brandsData.map(b => b.brand).reverse()
  //       },
  //       series: [{
  //         type: 'bar',
  //         data: brandsData.map(b => b.count).reverse()
  //       }]
  //     };
  //     barChart.setOption(barOption);
  //   }
  // }, [brandsData, darkMode]);

  // // Atualizar gráfico DONUT com dados reais
  // useEffect(() => {
  //   if (donutChartRef.current && riskData.length > 0) {
  //     const donutChart = echarts.init(donutChartRef.current);
  //     const donutOption = {
  //       // ... configurações ...
  //       series: [{
  //         type: 'pie',
  //         radius: ['40%', '70%'],
  //         data: riskData.map(item => ({
  //           value: item.count,
  //           name: item.riskLevel,
  //           itemStyle: { color: item.color }
  //         }))
  //       }]
  //     };
  //     donutChart.setOption(donutOption);
  //   }
  // }, [riskData, darkMode]);

  // // Atualizar gráfico de TENDÊNCIAS com dados reais
  // useEffect(() => {
  //   if (trendChartRef.current && trendsData) {
  //     const trendChart = echarts.init(trendChartRef.current);
  //     const trendOption = {
  //       // ... configurações ...
  //       xAxis: {
  //         type: 'category',
  //         data: trendsData.companies
  //       },
  //       series: [
  //         {
  //           name: '7-Day Trend',
  //           type: 'bar',
  //           data: trendsData.trend7Days,
  //           itemStyle: { color: '#F2495C' }
  //         },
  //         {
  //           name: '30-Day Trend',
  //           type: 'bar',
  //           data: trendsData.trend30Days,
  //           itemStyle: { color: '#FF9830' }
  //         },
  //         {
  //           name: '90-Day Trend',
  //           type: 'bar',
  //           data: trendsData.trend90Days,
  //           itemStyle: { color: '#5794F2' }
  //         }
  //       ]
  //     };
  //     trendChart.setOption(trendOption);
  //   }
  // }, [trendsData, darkMode]);

  // if (loading) {
  //   return (
  //     <div className="flex items-center justify-center h-screen">
  //       <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
  //     </div>
  //   );
  // }



  useEffect(() => {
    const colors = getColors();
    
    if (pieChartRef.current) {
      const pieChart = echarts.init(pieChartRef.current);
      const pieOption = {
        backgroundColor: 'transparent',
        title: {
          text: 'Certificates by Validity Status (%)',
          left: 'center',
          top: 10,
          textStyle: { 
            fontSize: 16, 
            fontWeight: 'normal',
            color: colors.text
          }
        },
        tooltip: {
          trigger: 'item',
          formatter: '{b}: {c} ({d}%)',
          backgroundColor: darkMode ? '#374151' : '#ffffff',
          borderColor: colors.border,
          textStyle: { color: colors.text }
        },
        legend: {
          orient: 'vertical',
          right: 10,
          top: 'center',
          textStyle: { color: colors.text }
        },
        series: [
          {
            type: 'pie',
            radius: ['40%', '70%'],
            avoidLabelOverlap: false,
            itemStyle: {
              borderRadius: 10,
              borderColor: colors.background,
              borderWidth: 2
            },
            label: {
              show: true,
              formatter: '{d}%',
              color: colors.text
            },
            data: [
              { value: 65.5, name: 'VALID', itemStyle: { color: '#73BF69' } },
              { value: 22.3, name: 'EXPIRED', itemStyle: { color: '#E02F44' } },
              { value: 8.7, name: 'EXPIRING_SOON', itemStyle: { color: '#FF9830' } },
              { value: 3.5, name: 'NO_EXPIRATION', itemStyle: { color: '#5794F2' } }
            ]
          }
        ]
      };
      pieChart.setOption(pieOption);
      
      const resizePie = () => pieChart.resize();
      window.addEventListener('resize', resizePie);
      return () => {
        window.removeEventListener('resize', resizePie);
        pieChart.dispose();
      };
    }
  }, [darkMode]);

  useEffect(() => {
    const colors = getColors();
    
    if (barChartRef.current) {
      const barChart = echarts.init(barChartRef.current);
      const barOption = {
        backgroundColor: 'transparent',
        title: {
          text: 'Top 10 brands or models with the most certificates',
          left: 'center',
          top: 10,
          textStyle: { 
            fontSize: 16, 
            fontWeight: 'normal',
            color: colors.text
          }
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: { type: 'shadow' },
          backgroundColor: darkMode ? '#374151' : '#ffffff',
          borderColor: colors.border,
          textStyle: { color: colors.text }
        },
        grid: {
          left: '15%',
          right: '5%',
          bottom: '10%',
          top: '15%'
        },
        xAxis: {
          type: 'value',
          axisLine: { lineStyle: { color: colors.gridLine } },
          axisLabel: { color: colors.textSecondary },
          splitLine: { lineStyle: { color: colors.gridLine } }
        },
        yAxis: {
          type: 'category',
          data: ['Brand J', 'Brand I', 'Brand H', 'Brand G', 'Brand F', 
                 'Brand E', 'Brand D', 'Brand C', 'Brand B', 'Brand A'],
          axisLabel: {
            interval: 0,
            color: colors.textSecondary
          },
          axisLine: { lineStyle: { color: colors.gridLine } }
        },
        series: [
          {
            type: 'bar',
            data: [45, 52, 58, 63, 71, 78, 85, 92, 105, 128],
            itemStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
                { offset: 0, color: '#5794F2' },
                { offset: 1, color: '#8AB8FF' }
              ]),
              borderRadius: [0, 5, 5, 0]
            },
            label: {
              show: true,
              position: 'right',
              formatter: '{c}',
              color: colors.text
            }
          }
        ]
      };
      barChart.setOption(barOption);
      
      const resizeBar = () => barChart.resize();
      window.addEventListener('resize', resizeBar);
      return () => {
        window.removeEventListener('resize', resizeBar);
        barChart.dispose();
      };
    }
  }, [darkMode]);

  useEffect(() => {
    const colors = getColors();
    
    if (donutChartRef.current) {
      const donutChart = echarts.init(donutChartRef.current);
      const donutOption = {
        backgroundColor: 'transparent',
        title: {
          text: 'Companies by Risk Category',
          left: 'center',
          top: 10,
          textStyle: { 
            fontSize: 16, 
            fontWeight: 'normal',
            color: colors.text
          }
        },
        tooltip: {
          trigger: 'item',
          formatter: '{b}: {c} companies ({d}%)',
          backgroundColor: darkMode ? '#374151' : '#ffffff',
          borderColor: colors.border,
          textStyle: { color: colors.text }
        },
        legend: {
          orient: 'vertical',
          right: 10,
          top: 'center',
          textStyle: { color: colors.text }
        },
        series: [
          {
            type: 'pie',
            radius: ['40%', '70%'],
            center: ['40%', '55%'],
            data: [
              { value: 5, name: 'CRITICAL_RISK', itemStyle: { color: '#E02F44' } },
              { value: 12, name: 'HIGH_RISK', itemStyle: { color: '#FF9830' } },
              { value: 28, name: 'MEDIUM_RISK', itemStyle: { color: '#FADE2A' } },
              { value: 35, name: 'LOW_RISK', itemStyle: { color: '#8AB8FF' } },
              { value: 45, name: 'MINIMAL_RISK', itemStyle: { color: '#73BF69' } }
            ],
            label: {
              show: true,
              formatter: '{b}\n{d}%',
              color: colors.text
            },
            labelLine: {
              show: true,
              lineStyle: { color: colors.text }
            }
          }
        ]
      };
      donutChart.setOption(donutOption);
      
      const resizeDonut = () => donutChart.resize();
      window.addEventListener('resize', resizeDonut);
      return () => {
        window.removeEventListener('resize', resizeDonut);
        donutChart.dispose();
      };
    }
  }, [darkMode]);

  useEffect(() => {
    const colors = getColors();
    
    if (trendChartRef.current) {
      const trendChart = echarts.init(trendChartRef.current);
      const companies = ['Company A', 'Company B', 'Company C', 'Company D', 'Company E'];
      const trendOption = {
        backgroundColor: 'transparent',
        title: {
          text: 'Certificate Issuance Trends (Top 5 Companies)',
          left: 'center',
          top: 10,
          textStyle: { 
            fontSize: 16, 
            fontWeight: 'normal',
            color: colors.text
          }
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: { type: 'shadow' },
          backgroundColor: darkMode ? '#374151' : '#ffffff',
          borderColor: colors.border,
          textStyle: { color: colors.text }
        },
        legend: {
          data: ['7-Day Trend', '30-Day Trend', '90-Day Trend'],
          top: 40,
          textStyle: { color: colors.text }
        },
        grid: {
          left: '15%',
          right: '5%',
          bottom: '10%',
          top: '20%'
        },
        xAxis: {
          type: 'category',
          data: companies,
          axisLine: { lineStyle: { color: colors.gridLine } },
          axisLabel: { color: colors.textSecondary }
        },
        yAxis: {
          type: 'value',
          axisLine: { lineStyle: { color: colors.gridLine } },
          axisLabel: { color: colors.textSecondary },
          splitLine: { lineStyle: { color: colors.gridLine } }
        },
        series: [
          {
            name: '7-Day Trend',
            type: 'bar',
            data: [5, 8, 12, 6, 9],
            itemStyle: { color: '#F2495C' }
          },
          {
            name: '30-Day Trend',
            type: 'bar',
            data: [18, 25, 32, 22, 28],
            itemStyle: { color: '#FF9830' }
          },
          {
            name: '90-Day Trend',
            type: 'bar',
            data: [45, 62, 75, 58, 68],
            itemStyle: { color: '#5794F2' }
          }
        ]
      };
      trendChart.setOption(trendOption);
      
      const resizeTrend = () => trendChart.resize();
      window.addEventListener('resize', resizeTrend);
      return () => {
        window.removeEventListener('resize', resizeTrend);
        trendChart.dispose();
      };
    }
  }, [darkMode]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6 transition-colors">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Asset Management - Certificate & Permit Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Monitor and track certificate compliance and risk status
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 mb-8">
          <div className="bg-green-500 dark:bg-green-600 rounded-lg p-4 text-white shadow-lg transition-colors">
            <div className="text-sm opacity-90 mb-1">Total Certificates</div>
          <div className="text-3xl font-bold">Total </div>
          </div>
          
          <div className="bg-orange-500 dark:bg-orange-600 rounded-lg p-4 text-white shadow-lg transition-colors">
            <div className="text-sm opacity-90 mb-1">Expiring Next 90 Days</div>
            <div className="text-3xl font-bold">87</div>
            <div className="text-xs opacity-90 mt-1">7.0%</div>
          </div>
          
          <div className="bg-green-600 dark:bg-green-700 rounded-lg p-4 text-white shadow-lg transition-colors">
            <div className="text-sm opacity-90 mb-1">Compliance Score</div>
            <div className="text-3xl font-bold">87.5%</div>
          </div>
          
          <div className="bg-yellow-500 dark:bg-yellow-600 rounded-lg p-4 text-white shadow-lg transition-colors">
            <div className="text-sm opacity-90 mb-1">Urgency Score</div>
            <div className="text-3xl font-bold">42.3</div>
          </div>
          
          <div className="bg-blue-500 dark:bg-blue-600 rounded-lg p-4 text-white shadow-lg transition-colors">
            <div className="text-sm opacity-90 mb-1">Issued Last 90 Days</div>
            <div className="text-3xl font-bold">156</div>
            <div className="text-xs opacity-90 mt-1">12.5%</div>
          </div>
          
          <div className="bg-green-600 dark:bg-green-700 rounded-lg p-4 text-white shadow-lg transition-colors">
            <div className="text-sm opacity-90 mb-1">Critical Risk Companies</div>
            <div className="text-3xl font-bold">3</div>
          </div>
        </div>

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 transition-colors">
            <div ref={pieChartRef} className="w-full h-96"></div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 transition-colors">
            <div ref={barChartRef} className="w-full h-96"></div>
          </div>
        </div>

        {/* Charts Row 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 transition-colors">
            <div ref={donutChartRef} className="w-full h-96"></div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 transition-colors">
            <div ref={trendChartRef} className="w-full h-96"></div>
          </div>
        </div>

        {/* Department Table */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 transition-colors">
          <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
            Certified by Departments
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-100 dark:bg-gray-700 border-b dark:border-gray-600">
                <tr>
                  <th className="text-left p-3 font-medium text-gray-700 dark:text-gray-300">
                    Department
                  </th>
                  <th className="text-center p-3 font-medium text-gray-700 dark:text-gray-300">
                    Total Certificates
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  <td className="p-3 text-gray-900 dark:text-gray-100">Operations</td>
                  <td className="text-center p-3 font-semibold text-gray-900 dark:text-gray-100">342</td>
                </tr>
                <tr className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  <td className="p-3 text-gray-900 dark:text-gray-100">Maintenance</td>
                  <td className="text-center p-3 font-semibold text-gray-900 dark:text-gray-100">289</td>
                </tr>
                <tr className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  <td className="p-3 text-gray-900 dark:text-gray-100">Safety & Quality</td>
                  <td className="text-center p-3 font-semibold text-gray-900 dark:text-gray-100">215</td>
                </tr>
                <tr className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  <td className="p-3 text-gray-900 dark:text-gray-100">Engineering</td>
                  <td className="text-center p-3 font-semibold text-gray-900 dark:text-gray-100">187</td>
                </tr>
                <tr className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  <td className="p-3 text-gray-900 dark:text-gray-100">Logistics</td>
                  <td className="text-center p-3 font-semibold text-gray-900 dark:text-gray-100">142</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}