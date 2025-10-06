import { useEffect, useRef, useState } from 'react';
import * as echarts from 'echarts';

export default function PredictiveCertificateTimeseries() {
  const [selectedCompany, setSelectedCompany] = useState('all');
  const healthChartRef = useRef(null);
  const riskChartRef = useRef(null);
  const workloadChartRef = useRef(null);
  const trendsChartRef = useRef(null);

  const companies = [
    {
      id: 10,
      name: "SMARTX HUB",
      totalCerts: 38,
      activeCerts: 9,
      expiredCerts: 28,
      healthScore: 57.82,
      riskScore: 60,
      complianceScore: 25.53,
      automationReadiness: 2.16,
      capacityUtilization: 50,
      criticalAlerts: 0,
      highAlerts: 0,
      mediumAlerts: 1,
      riskCategory: "HIGH_RISK",
      renewalRate: 23.68,
      efficiencyScore: 14.71,
      forecastAccuracy: 60
    },
    {
      id: 28,
      name: "HEALTHCARE DEMO",
      totalCerts: 5,
      activeCerts: 0,
      expiredCerts: 5,
      healthScore: 47.10,
      riskScore: 60,
      complianceScore: 0,
      automationReadiness: 2.60,
      capacityUtilization: 50,
      criticalAlerts: 0,
      highAlerts: 0,
      mediumAlerts: 0,
      riskCategory: "HIGH_RISK",
      renewalRate: 0,
      efficiencyScore: 3.00,
      forecastAccuracy: 60
    },
    {
      id: 63,
      name: "DEMONSTRAÇÃO SAÚDE",
      totalCerts: 13,
      activeCerts: 8,
      expiredCerts: 1,
      healthScore: 87.23,
      riskScore: 75,
      complianceScore: 83.08,
      automationReadiness: 1.00,
      capacityUtilization: 50,
      criticalAlerts: 0,
      highAlerts: 0,
      mediumAlerts: 4,
      riskCategory: "MEDIUM_RISK",
      renewalRate: 92.31,
      efficiencyScore: -4.00,
      forecastAccuracy: 75
    },
    {
      id: 610,
      name: "GRUPO PULSA",
      totalCerts: 3934,
      activeCerts: 2976,
      expiredCerts: 2,
      healthScore: 93.37,
      riskScore: 75,
      complianceScore: 99.95,
      automationReadiness: 2.52,
      capacityUtilization: 95,
      criticalAlerts: 0,
      highAlerts: 0,
      mediumAlerts: 0,
      riskCategory: "LOW_RISK",
      renewalRate: 98.91,
      efficiencyScore: -9.02,
      forecastAccuracy: 75
    }
  ];

  const filteredCompanies = selectedCompany === 'all' 
    ? companies 
    : companies.filter(c => c.id === parseInt(selectedCompany));

  const avgMetrics = {
    healthScore: (companies.reduce((sum, c) => sum + c.healthScore, 0) / companies.length).toFixed(2),
    complianceScore: (companies.reduce((sum, c) => sum + c.complianceScore, 0) / companies.length).toFixed(2),
    renewalRate: (companies.reduce((sum, c) => sum + c.renewalRate, 0) / companies.length).toFixed(2),
    totalCerts: companies.reduce((sum, c) => sum + c.totalCerts, 0),
    activeCerts: companies.reduce((sum, c) => sum + c.activeCerts, 0),
    expiredCerts: companies.reduce((sum, c) => sum + c.expiredCerts, 0)
  };

  useEffect(() => {
    if (healthChartRef.current) {
      const chart = echarts.init(healthChartRef.current);
      const option = {
        title: {
          text: 'Health Score vs Compliance',
          left: 'center',
          textStyle: { fontSize: 14, fontWeight: 'bold' }
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: { type: 'shadow' }
        },
        legend: {
          data: ['Health Score', 'Compliance Score'],
          bottom: 0
        },
        grid: { left: '3%', right: '4%', bottom: '15%', containLabel: true },
        xAxis: {
          type: 'category',
          data: filteredCompanies.map(c => c.name),
          axisLabel: { interval: 0, rotate: 30, fontSize: 10 }
        },
        yAxis: { type: 'value', max: 100 },
        series: [
          {
            name: 'Health Score',
            type: 'bar',
            data: filteredCompanies.map(c => c.healthScore),
            itemStyle: { color: '#10b981' }
          },
          {
            name: 'Compliance Score',
            type: 'bar',
            data: filteredCompanies.map(c => c.complianceScore),
            itemStyle: { color: '#3b82f6' }
          }
        ]
      };
      chart.setOption(option);
      return () => chart.dispose();
    }
  }, [selectedCompany]);

  useEffect(() => {
    if (riskChartRef.current) {
      const chart = echarts.init(riskChartRef.current);
      const riskData = [
        { value: companies.filter(c => c.riskCategory === 'HIGH_RISK').length, name: 'Alto Risco' },
        { value: companies.filter(c => c.riskCategory === 'MEDIUM_RISK').length, name: 'Médio Risco' },
        { value: companies.filter(c => c.riskCategory === 'LOW_RISK').length, name: 'Baixo Risco' }
      ];
      
      const option = {
        title: {
          text: 'Distribuição de Risco',
          left: 'center',
          textStyle: { fontSize: 14, fontWeight: 'bold' }
        },
        tooltip: { trigger: 'item' },
        legend: { orient: 'vertical', left: 'left', top: 'middle' },
        series: [
          {
            type: 'pie',
            radius: ['40%', '70%'],
            center: ['60%', '50%'],
            data: riskData,
            emphasis: {
              itemStyle: {
                shadowBlur: 10,
                shadowOffsetX: 0,
                shadowColor: 'rgba(0, 0, 0, 0.5)'
              }
            },
            itemStyle: {
              color: (params: any) => {
                const colors = ['#ef4444', '#f59e0b', '#10b981'];
                return colors[params.dataIndex];
              }
            }
          }
        ]
      };
      chart.setOption(option);
      return () => chart.dispose();
    }
  }, []);

  useEffect(() => {
    if (workloadChartRef.current) {
      const chart = echarts.init(workloadChartRef.current);
      const option = {
        title: {
          text: 'Capacidade e Certificados',
          left: 'center',
          textStyle: { fontSize: 14, fontWeight: 'bold' }
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: { type: 'cross' }
        },
        legend: {
          data: ['Certificados Ativos', 'Certificados Expirados', 'Utilização (%)'],
          bottom: 0
        },
        grid: { left: '3%', right: '4%', bottom: '15%', containLabel: true },
        xAxis: {
          type: 'category',
          data: filteredCompanies.map(c => c.name),
          axisLabel: { interval: 0, rotate: 30, fontSize: 10 }
        },
        yAxis: [
          { type: 'value', name: 'Certificados' },
          { type: 'value', name: 'Utilização (%)', max: 100 }
        ],
        series: [
          {
            name: 'Certificados Ativos',
            type: 'bar',
            data: filteredCompanies.map(c => c.activeCerts),
            itemStyle: { color: '#10b981' }
          },
          {
            name: 'Certificados Expirados',
            type: 'bar',
            data: filteredCompanies.map(c => c.expiredCerts),
            itemStyle: { color: '#ef4444' }
          },
          {
            name: 'Utilização (%)',
            type: 'line',
            yAxisIndex: 1,
            data: filteredCompanies.map(c => c.capacityUtilization),
            itemStyle: { color: '#8b5cf6' },
            lineStyle: { width: 3 }
          }
        ]
      };
      chart.setOption(option);
      return () => chart.dispose();
    }
  }, [selectedCompany]);

  useEffect(() => {
    if (trendsChartRef.current) {
      const chart = echarts.init(trendsChartRef.current);
      const option = {
        title: {
          text: 'Taxa de Renovação vs Eficiência',
          left: 'center',
          textStyle: { fontSize: 14, fontWeight: 'bold' }
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: { type: 'cross' }
        },
        legend: {
          data: ['Taxa de Renovação (%)', 'Score de Eficiência'],
          bottom: 0
        },
        grid: { left: '3%', right: '4%', bottom: '15%', containLabel: true },
        xAxis: {
          type: 'category',
          data: filteredCompanies.map(c => c.name),
          axisLabel: { interval: 0, rotate: 30, fontSize: 10 }
        },
        yAxis: [
          { type: 'value', name: 'Renovação (%)' },
          { type: 'value', name: 'Eficiência' }
        ],
        series: [
          {
            name: 'Taxa de Renovação (%)',
            type: 'line',
            data: filteredCompanies.map(c => c.renewalRate),
            itemStyle: { color: '#3b82f6' },
            lineStyle: { width: 3 },
            smooth: true
          },
          {
            name: 'Score de Eficiência',
            type: 'line',
            yAxisIndex: 1,
            data: filteredCompanies.map(c => c.efficiencyScore),
            itemStyle: { color: '#f59e0b' },
            lineStyle: { width: 3 },
            smooth: true
          }
        ]
      };
      chart.setOption(option);
      return () => chart.dispose();
    }
  }, [selectedCompany]);

  const getRiskColor = (category: any) => {
    switch(category) {
      case 'HIGH_RISK': return 'bg-red-100 text-red-800 border-red-300';
      case 'MEDIUM_RISK': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'LOW_RISK': return 'bg-green-100 text-green-800 border-green-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-800 mb-2">
            Predictive Certificate Analysis
          </h1>
          <p className="text-slate-600 text-lg">
            Overview Estratégica - Análise Preditiva de Certificados
          </p>
        </div>

        {/* Filter */}
        <div className="mb-6 bg-white rounded-lg shadow p-4">
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            Filtrar por Empresa
          </label>
          <select 
            aria-label="Filtrar por Empresa"
            value={selectedCompany}
            onChange={(e) => setSelectedCompany(e.target.value)}
            className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">Todas as Empresas</option>
            {companies.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-blue-500">
            <div className="text-sm font-semibold text-slate-600 mb-1">Health Score Médio</div>
            <div className="text-3xl font-bold text-slate-800">{avgMetrics.healthScore}%</div>
            <div className="text-xs text-slate-500 mt-1">Indicador de saúde geral</div>
          </div>
          
          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-green-500">
            <div className="text-sm font-semibold text-slate-600 mb-1">Compliance Médio</div>
            <div className="text-3xl font-bold text-slate-800">{avgMetrics.complianceScore}%</div>
            <div className="text-xs text-slate-500 mt-1">Conformidade regulatória</div>
          </div>
          
          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-purple-500">
            <div className="text-sm font-semibold text-slate-600 mb-1">Total de Certificados</div>
            <div className="text-3xl font-bold text-slate-800">{avgMetrics.totalCerts}</div>
            <div className="text-xs text-slate-500 mt-1">{avgMetrics.activeCerts} ativos, {avgMetrics.expiredCerts} expirados</div>
          </div>
          
          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-orange-500">
            <div className="text-sm font-semibold text-slate-600 mb-1">Taxa de Renovação</div>
            <div className="text-3xl font-bold text-slate-800">{avgMetrics.renewalRate}%</div>
            <div className="text-xs text-slate-500 mt-1">Renovações no prazo</div>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-md p-6">
            <div ref={healthChartRef} style={{ height: '350px' }}></div>
          </div>
          
          <div className="bg-white rounded-xl shadow-md p-6">
            <div ref={riskChartRef} style={{ height: '350px' }}></div>
          </div>
          
          <div className="bg-white rounded-xl shadow-md p-6">
            <div ref={workloadChartRef} style={{ height: '350px' }}></div>
          </div>
          
          <div className="bg-white rounded-xl shadow-md p-6">
            <div ref={trendsChartRef} style={{ height: '350px' }}></div>
          </div>
        </div>

        {/* Company Details Table */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="p-6 border-b border-slate-200">
            <h2 className="text-xl font-bold text-slate-800">Detalhamento por Empresa</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Empresa</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Risco</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-slate-600 uppercase">Health</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-slate-600 uppercase">Compliance</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-slate-600 uppercase">Certificados</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-slate-600 uppercase">Alertas</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-slate-600 uppercase">Utilização</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredCompanies.map((company) => (
                  <tr key={company.id} className="hover:bg-slate-50 transition">
                    <td className="px-6 py-4 text-sm font-medium text-slate-800">{company.name}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${getRiskColor(company.riskCategory)}`}>
                        {company.riskCategory.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right text-sm font-semibold text-slate-700">
                      {company.healthScore.toFixed(1)}%
                    </td>
                    <td className="px-6 py-4 text-right text-sm font-semibold text-slate-700">
                      {company.complianceScore.toFixed(1)}%
                    </td>
                    <td className="px-6 py-4 text-right text-sm text-slate-600">
                      <div className="font-semibold">{company.totalCerts}</div>
                      <div className="text-xs text-slate-500">{company.activeCerts} ativos</div>
                    </td>
                    <td className="px-6 py-4 text-right text-sm">
                      <div className="flex gap-1 justify-end">
                        {company.criticalAlerts > 0 && (
                          <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded">{company.criticalAlerts}</span>
                        )}
                        {company.highAlerts > 0 && (
                          <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs rounded">{company.highAlerts}</span>
                        )}
                        {company.mediumAlerts > 0 && (
                          <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded">{company.mediumAlerts}</span>
                        )}
                        {company.criticalAlerts === 0 && company.highAlerts === 0 && company.mediumAlerts === 0 && (
                          <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded">OK</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right text-sm font-semibold text-slate-700">
                      {company.capacityUtilization}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Strategic Insights */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl shadow-md p-6 border border-blue-200">
            <h3 className="text-lg font-bold text-blue-900 mb-3">🎯 Insights Estratégicos</h3>
            <ul className="space-y-2 text-sm text-blue-800">
              <li>• GRUPO PULSA lidera com 93.37% de health score</li>
              <li>• 2 empresas em alto risco necessitam atenção imediata</li>
              <li>• Oportunidade de automação em processos manuais</li>
            </ul>
          </div>
          
          <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl shadow-md p-6 border border-amber-200">
            <h3 className="text-lg font-bold text-amber-900 mb-3">⚠️ Áreas de Atenção</h3>
            <ul className="space-y-2 text-sm text-amber-800">
              <li>• SMARTX HUB: 28 certificados expirados</li>
              <li>• HEALTHCARE DEMO: 0% de compliance score</li>
              <li>• Baixa taxa de renovação em 2 empresas</li>
            </ul>
          </div>
          
          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl shadow-md p-6 border border-green-200">
            <h3 className="text-lg font-bold text-green-900 mb-3">✅ Recomendações</h3>
            <ul className="space-y-2 text-sm text-green-800">
              <li>• Implementar automação para renovações</li>
              <li>• Priorizar empresas de alto risco</li>
              <li>• Melhorar processos de compliance</li>
            </ul>
          </div>
        </div>

      </div>
    </div>
  );
}