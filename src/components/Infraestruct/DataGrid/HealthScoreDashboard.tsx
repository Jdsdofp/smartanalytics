// src/components/HealthScoreDashboard.tsx
import { ArrowDownIcon, ArrowPathIcon, ArrowUpIcon, InformationCircleIcon } from '@heroicons/react/24/outline';
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

interface HealthScoreData {
  NAME: string;
  VALUE: string;
  total_devices: number;
}

// interface HealthScoreSummary {
//   total_categories: number;
//   total_devices: number;
//   avg_health_score: string;
//   best_category: HealthScoreData | null;
//   worst_category: HealthScoreData | null;
// }

const HealthScoreDashboard: React.FC<{ companyId: any }> = ({ companyId }) => {
  const { t } = useTranslation();
  const [data, setData] = useState<HealthScoreData[]>([]);
  //   const [summary, setSummary] = useState<HealthScoreSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Buscar dados da API
  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`https://apinode.smartxhub.cloud/api/dashboard/devices/${companyId}/health-score/category`);
      const result = await response.json();

      if (result.success) {
        setData(result.data);
        // setSummary(result.summary);
      } else {
        throw new Error(result.error || 'Failed to fetch data');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [companyId]);

  // Converter VALUE de string para número
  const getNumericValue = (value: string): number => {
    return parseFloat(value) || 0;
  };

  // Calcular média real dos scores
  //   const calculateRealAverage = (data: HealthScoreData[]): string => {
  //     if (data.length === 0) return '0.0';

  //     const total = data.reduce((sum, item) => {
  //       return sum + getNumericValue(item.VALUE);
  //     }, 0);

  //     return (total / data.length).toFixed(1);
  //   };

  // Função para obter cor baseada no score
  const getScoreColor = (score: string) => {
    const numericScore = getNumericValue(score);
    if (numericScore >= 80) return 'bg-green-100 text-green-800 border-green-200';
    if (numericScore >= 60) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    if (numericScore >= 40) return 'bg-orange-100 text-orange-800 border-orange-200';
    return 'bg-red-100 text-red-800 border-red-200';
  };

  // Função para obter cor do texto do score
  const getScoreTextColor = (score: string) => {
    const numericScore = getNumericValue(score);
    if (numericScore >= 80) return 'text-green-600';
    if (numericScore >= 60) return 'text-yellow-600';
    if (numericScore >= 40) return 'text-orange-600';
    return 'text-red-600';
  };

  // Função para obter status
  const getStatus = (score: string) => {
    const numericScore = getNumericValue(score);
    if (numericScore >= 80) return t('healthScore.table.status.excellent');
    if (numericScore >= 60) return t('healthScore.table.status.good');
    if (numericScore >= 40) return t('healthScore.table.status.fair');
    return t('healthScore.table.status.critical');
  };

  // Dados ordenados para a tabela
  const sortedData = [...data].sort((a, b) =>
    sortOrder === 'desc' ? getNumericValue(b.VALUE) - getNumericValue(a.VALUE) : getNumericValue(a.VALUE) - getNumericValue(b.VALUE)
  );

  // Paginação
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = sortedData.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(sortedData.length / itemsPerPage);

  // Calcular estatísticas atualizadas
  //   const realAverage = calculateRealAverage(data);
  const totalDevices = data.reduce((sum, item) => sum + item.total_devices, 0);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-64 p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <p className="mt-4 text-gray-600">{t('healthScore.loading')}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <InformationCircleIcon className="h-5 w-5 text-red-400" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">
              {t('healthScore.error.title')}
            </h3>
            <p className="text-sm text-red-600 mt-1">{error}</p>
          </div>
        </div>
        <div className="mt-4">
          <button
            onClick={fetchData}
            className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            <ArrowPathIcon className="h-4 w-4 mr-2" />
            {t('healthScore.error.retry')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4">

      {/* Tabela de Dados */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900">{t('healthScore.table.title')}</h3>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500">
                {t('healthScore.table.summary', {
                  categories: data.length,
                  devices: totalDevices
                })}
              </span>
              <select
                value={sortOrder}
                onChange={(e) => {
                  setSortOrder(e.target.value as 'desc' | 'asc');
                  setCurrentPage(1);
                }}
                className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="desc">{t('healthScore.table.sort.desc')}</option>
                <option value="asc">{t('healthScore.table.sort.asc')}</option>
              </select>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('healthScore.table.headers.category')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('healthScore.table.headers.healthScore')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('healthScore.table.headers.devices')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('healthScore.table.headers.status')}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentItems.map((item, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{item.NAME}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getScoreColor(item.VALUE)}`}>
                        {item.VALUE}%
                      </span>
                      {getNumericValue(item.VALUE) >= 80 && <ArrowUpIcon className="h-4 w-4 text-green-500" />}
                      {getNumericValue(item.VALUE) < 40 && <ArrowDownIcon className="h-4 w-4 text-red-500" />}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {item.total_devices}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`text-sm font-medium ${getScoreTextColor(item.VALUE)}`}>
                      {getStatus(item.VALUE)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Paginação */}
        <div className="px-6 py-4 border-t border-gray-200">
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-700">
              {t('healthScore.table.pagination.showing', {
                start: indexOfFirstItem + 1,
                end: Math.min(indexOfLastItem, sortedData.length),
                total: sortedData.length
              })}
            </p>
            <div className="flex space-x-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              > 
                {t('healthScore.table.pagination.previous')}
              </button>
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {t('healthScore.table.pagination.next')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HealthScoreDashboard;