// src/components/AssetManagementGrid.tsx
import { useState, useEffect, useMemo, useRef } from 'react';
import {
  ShieldExclamationIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  SignalIcon,
  SignalSlashIcon,
  MapPinIcon,
  ClockIcon,
  WrenchScrewdriverIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ArrowPathIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  XMarkIcon,
  BarsArrowDownIcon,
  BarsArrowUpIcon,
} from '@heroicons/react/24/outline';

// import { useTranslation } from 'react-i18next';
import { useCompany } from '../../../hooks/useCompany';
import { useTranslation } from 'react-i18next';

// =====================================
// 📊 INTERFACES
// =====================================
interface AssetDevice {
  device_id: string;
  category: string;
  current_status: string;
  alert_level: string;
  health_score: number;
  last_heartbeat: string;
  hours_no_comm: number;
  comm_status: 'NO DATA' | 'ACTIVE' | 'RECENT' | 'STALE' | 'CRITICAL';
  last_gps_date: string;
  days_no_gps: number;
  gps_status: 'NO GPS' | 'TODAY' | 'RECENT' | 'OUTDATED';
  risk_level: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  recommended_action: string;
  issues: string;
}

interface AssetSummary {
  total_devices: number;
  critical_devices: number;
  high_risk_devices: number;
  medium_risk_devices: number;
  low_risk_devices: number;
  actions: {
    replace: number;
    inspect: number;
    maintain: number;
    check_gps: number;
    monitor: number;
  };
  communication: {
    active: number;
    recent: number;
    stale: number;
    critical: number;
    no_data: number;
  };
  avg_health_score: string;
}

interface AssetManagementResponse {
  success: boolean;
  data: AssetDevice[];
  summary: AssetSummary;
  pagination: {
    current_page: number;
    total_pages: number;
    total_count: number;
    has_next: boolean;
    has_prev: boolean;
    limit: number;
  };
}

// =====================================
// 🎨 COMPONENTE PRINCIPAL
// =====================================
export default function AssetManagementGrid() {
  const { t } = useTranslation();
  const { companyId } = useCompany();
  
  // Estados
  const [data, setData] = useState<AssetDevice[]>([]);
  // const [summary, setSummary] = useState<AssetSummary | null>(null);
  const [loading, setLoading] = useState(true);
  // const [error, setError] = useState<string | null>(null);
  
  // ✅ ESTADOS PARA PAGINAÇÃO E FILTROS
  const [pagination, setPagination] = useState({
    current_page: 1,
    total_pages: 1,
    total_count: 0,
    has_next: false,
    has_prev: false,
    limit: 50
  });

  // Filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRiskLevel, setSelectedRiskLevel] = useState<string>('all');
  const [selectedCommStatus, setSelectedCommStatus] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);
  
  // Ordenação
  const [sortBy, setSortBy] = useState<keyof AssetDevice>('risk_level');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  
  // ✅ Estado para limite de itens por página
  const [itemsPerPage, setItemsPerPage] = useState(50);

  // ✅ NOVOS ESTADOS PARA FILTROS EXCEL
  const [columnFilters, setColumnFilters] = useState<{
    device_id: string;
    category: string;
    risk_level: string;
    comm_status: string;
    gps_status: string;
    recommended_action: string;
  }>({
    device_id: '',
    category: '',
    risk_level: '',
    comm_status: '',
    gps_status: '',
    recommended_action: ''
  });

  const [activeFilterColumn, setActiveFilterColumn] = useState<string | null>(null);
  const filterRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  // =====================================
  // 📡 FETCH DATA
  // =====================================
  const fetchData = async (page: number = 1) => {
    if (!companyId) {
      console.log('Aguardando companyId...');
      return;
    }
    
    try {
      setLoading(true);
      // setError(null);
      
      // ✅ Construir query parameters
      const params = new URLSearchParams({
        page: page.toString(),
        limit: itemsPerPage.toString(),
        sortBy: sortBy,
        sortOrder: sortOrder,
        ...(searchTerm && { search: searchTerm }),
        ...(selectedRiskLevel !== 'all' && { riskLevel: selectedRiskLevel }),
        ...(selectedCommStatus !== 'all' && { commStatus: selectedCommStatus }),
        ...(selectedCategory !== 'all' && { category: selectedCategory })
      });

      const response = await fetch(
        `https://api-dashboards-u1oh.onrender.com/api/dashboard/devices/${companyId}/sensor-heartbeat?${params}`
      );
      
      if (!response.ok) throw new Error('Failed to fetch data');
      
      const result: AssetManagementResponse = await response.json();
      
      if (result.success) {
        setData(result.data);
        // setSummary(result.summary);
        setPagination(result.pagination || {
          current_page: 1,
          total_pages: 1,
          total_count: 0,
          has_next: false,
          has_prev: false,
          limit: itemsPerPage
        });
      } else {
        throw new Error('API returned error');
      }
    } catch (err) {
      // setError(err instanceof Error ? err.message : 'Unknown error');
      console.error('Error fetching asset management data:', err);
    } finally {
      setLoading(false);
    }
  };

  
  useEffect(() => {
    fetchData(1);
  }, [companyId, sortBy, sortOrder, itemsPerPage]);


  // ✅ useEffect para filtros (com debounce)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchData(1);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, selectedRiskLevel, selectedCommStatus, selectedCategory]);


  // ✅ FUNÇÕES PARA PAGINAÇÃO
  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.total_pages) {
      fetchData(newPage);
    }
  };

  const handleItemsPerPageChange = (newLimit: number) => {
    setItemsPerPage(newLimit);
  };

  // ✅ FUNÇÃO: Resetar filtros
  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedRiskLevel('all');
    setSelectedCommStatus('all');
    setSelectedCategory('all');
    setColumnFilters({
      device_id: '',
      category: '',
      risk_level: '',
      comm_status: '',
      gps_status: '',
      recommended_action: ''
    });
    setSortBy('risk_level');
    setSortOrder('desc');
    setItemsPerPage(50);
  };

  // ✅ FUNÇÃO: Gerar array de páginas para exibição
  const getPageNumbers = () => {
    const current = pagination.current_page;
    const total = pagination.total_pages;
    const delta = 2;
    const range = [];
    const rangeWithDots = [];

    for (let i = Math.max(2, current - delta); i <= Math.min(total - 1, current + delta); i++) {
      range.push(i);
    }

    if (current - delta > 2) {
      rangeWithDots.push(1, '...');
    } else {
      rangeWithDots.push(1);
    }

    rangeWithDots.push(...range);

    if (current + delta < total - 1) {
      rangeWithDots.push('...', total);
    } else if (total > 1) {
      rangeWithDots.push(total);
    }

    return rangeWithDots;
  };

  // ✅ NOVAS FUNÇÕES PARA FILTROS EXCEL
  const handleColumnFilterChange = (column: string, value: string) => {
    setColumnFilters(prev => ({
      ...prev,
      [column]: value
    }));
  };

  const clearColumnFilter = (column: string) => {
    setColumnFilters(prev => ({
      ...prev,
      [column]: ''
    }));
  };

  const toggleFilterDropdown = (column: string) => {
    setActiveFilterColumn(activeFilterColumn === column ? null : column);
  };

  // ✅ FUNÇÃO: Obter valores únicos para dropdowns de filtro
  const getUniqueValues = (column: keyof AssetDevice) => {
    const values = data.map(item => item[column]);
    return Array.from(new Set(values)).filter(Boolean).sort();
  };

  // ✅ FUNÇÃO: Aplicar filtros de coluna
  const filteredData = useMemo(() => {
    return data.filter(item => {
      return Object.entries(columnFilters).every(([column, filterValue]) => {
        if (!filterValue) return true;
        
        const itemValue = item[column as keyof AssetDevice];
        if (typeof itemValue === 'string') {
          return itemValue.toLowerCase().includes(filterValue.toLowerCase());
        }
        return String(itemValue).includes(filterValue);
      });
    });
  }, [data, columnFilters]);

  // ✅ Fechar dropdown ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (activeFilterColumn && 
          filterRefs.current[activeFilterColumn] && 
          !filterRefs.current[activeFilterColumn]?.contains(event.target as Node)) {
        setActiveFilterColumn(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [activeFilterColumn]);
  
  // =====================================
  // 🎨 HELPER FUNCTIONS
  // =====================================
  const getRiskBadgeColor = (level: string) => {
    switch (level) {
      case 'CRITICAL': return 'bg-red-100 text-red-800 border-red-300';
      case 'HIGH': return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'LOW': return 'bg-green-100 text-green-800 border-green-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };
  
  const getRiskIcon = (level: string) => {
    switch (level) {
      case 'CRITICAL': return <ShieldExclamationIcon className="h-4 w-4" />;
      case 'HIGH': return <ExclamationTriangleIcon className="h-4 w-4" />;
      case 'MEDIUM': return <ExclamationTriangleIcon className="h-4 w-4" />;
      case 'LOW': return <CheckCircleIcon className="h-4 w-4" />;
      default: return null;
    }
  };
  
  const getCommStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'bg-green-100 text-green-800';
      case 'RECENT': return 'bg-blue-100 text-blue-800';
      case 'STALE': return 'bg-yellow-100 text-yellow-800';
      case 'CRITICAL': return 'bg-red-100 text-red-800';
      case 'NO DATA': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };
  
  const getHealthScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    if (score >= 40) return 'text-orange-600';
    return 'text-red-600';
  };
  
  const formatAction = (action: string) => {
    const [type, ...rest] = action.split(' - ');
    return { type, description: rest.join(' - ') };
  };
  
  const getActionIcon = (action: string) => {
    if (action.startsWith('REPLACE')) return <ShieldExclamationIcon className="h-4 w-4" />;
    if (action.startsWith('INSPECT')) return <MagnifyingGlassIcon className="h-4 w-4" />;
    if (action.startsWith('MAINTAIN')) return <WrenchScrewdriverIcon className="h-4 w-4" />;
    if (action.startsWith('CHECK GPS')) return <MapPinIcon className="h-4 w-4" />;
    return <CheckCircleIcon className="h-4 w-4" />;
  };
  
  const toggleSort = (column: keyof AssetDevice) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('desc');
    }
  };
  
  // =====================================
  // 🎨 COMPONENTE DE FILTRO DE COLUNA
  // =====================================
  const ColumnFilter = ({ column, label }: { column: string; label: string }) => {
    const hasFilter = !!columnFilters[column as keyof typeof columnFilters];
    const uniqueValues = getUniqueValues(column as keyof AssetDevice);

    return (
      <div className="relative" ref={(el: any) => filterRefs.current[column] = el}>
        <div className="flex items-center gap-1">
          <span>{label}</span>
          <button
            onClick={() => toggleFilterDropdown(column)}
            className={`p-1 rounded hover:bg-gray-200 transition-colors ${
              hasFilter ? 'text-blue-600' : 'text-gray-400'
            } ${activeFilterColumn === column ? 'bg-gray-200' : ''}`}
          >
            <FunnelIcon className="h-3 w-3" />
          </button>
          {hasFilter && (
            <button
              onClick={() => clearColumnFilter(column)}
              className="p-1 rounded hover:bg-gray-200 text-red-500 transition-colors"
            >
              <XMarkIcon className="h-3 w-3" />
            </button>
          )}
        </div>

        {/* Dropdown de Filtro */}
        {activeFilterColumn === column && (
          <div className="absolute top-full left-0 mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-30">
            <div className="p-2">
              {/* Filtro de Texto */}
              <input
                type="text"
                placeholder={`${t('assetManagement.searchPlaceholder')}...`}
                value={columnFilters[column as keyof typeof columnFilters]}
                onChange={(e) => handleColumnFilterChange(column, e.target.value)}
                className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                autoFocus
              />
              
              {/* Lista de Valores Únicos (para colunas com poucos valores) */}
              {uniqueValues.length > 0 && uniqueValues.length <= 10 && (
                <div className="mt-2 max-h-32 overflow-y-auto">
                  {uniqueValues.map((value, index) => (
                    <div
                      key={index}
                      onClick={() => handleColumnFilterChange(column, String(value))}
                      className="px-2 py-1 text-sm hover:bg-gray-100 cursor-pointer rounded"
                    >
                      {String(value)}
                    </div>
                  ))}
                </div>
              )}
              
              {/* Botões de Ação */}
              <div className="mt-2 flex justify-between border-t pt-2">
                <button
                  onClick={() => clearColumnFilter(column)}
                  className="px-2 py-1 text-xs text-gray-600 hover:text-gray-800"
                >
                  {t('assetManagement.filters.reset')}
                </button>
                <button
                  onClick={() => setActiveFilterColumn(null)}
                  className="px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  {t('assetManagement.filters.show')}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  // =====================================
  // 🎨 RENDER PRINCIPAL
  // =====================================
  return (
    <div className="space-y-4">
      {/* ✅ CARDS DE RESUMO COMPACTOS */}
      {/* {summary && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200 p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-blue-700">Total</p>
                <p className="mt-1 text-lg font-bold text-blue-900">{summary.total_devices}</p>
              </div>
              <SignalIcon className="h-5 w-5 text-blue-600" />
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg border border-red-200 p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-red-700">Críticos</p>
                <p className="mt-1 text-lg font-bold text-red-900">{summary.critical_devices}</p>
              </div>
              <ShieldExclamationIcon className="h-5 w-5 text-red-600" />
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg border border-orange-200 p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-orange-700">Alto Risco</p>
                <p className="mt-1 text-lg font-bold text-orange-900">{summary.high_risk_devices}</p>
              </div>
              <ExclamationTriangleIcon className="h-5 w-5 text-orange-600" />
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg border border-yellow-200 p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-yellow-700">Médio Risco</p>
                <p className="mt-1 text-lg font-bold text-yellow-900">{summary.medium_risk_devices}</p>
              </div>
              <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg border border-green-200 p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-green-700">Baixo Risco</p>
                <p className="mt-1 text-lg font-bold text-green-900">{summary.low_risk_devices}</p>
              </div>
              <CheckCircleIcon className="h-5 w-5 text-green-600" />
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg border border-purple-200 p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-purple-700">Health Médio</p>
                <p className="mt-1 text-lg font-bold text-purple-900">{summary.avg_health_score}</p>
              </div>
              <CheckCircleIcon className="h-5 w-5 text-purple-600" />
            </div>
          </div>
        </div>
      )} */}
      
      {/* ✅ TABELA UNIFICADA COM CONTROLES INTEGRADOS */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        
        {/* ✅ CABEÇALHO DA TABELA COM CONTROLES */}
        <div className="border-b border-gray-200 bg-gray-50 px-6 py-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            {/* Título e Status */}
            <div className="flex items-center gap-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{t('assetManagement.title')}</h3>
                <p className="text-sm text-gray-600">
                  {loading ? t('assetManagement.loading') : t('assetManagement.devicesCount', {
              count: filteredData.length,
              total: pagination.total_count
            })}
            {Object.values(columnFilters).some(filter => filter) && (
              <span className="ml-2 text-blue-600">
                {t('assetManagement.filtered')}
              </span>
            )}
                </p>
              </div>
              
              {/* Indicador de Ordenação */}
              <div className="hidden sm:flex items-center gap-2 text-sm text-gray-500">
                <span>{t('assetManagement.sortedBy')}</span>
                <span className="font-medium text-gray-700 capitalize">
                  {sortBy.replace('_', ' ')} 
                  {sortOrder === 'asc' ? 
                    <BarsArrowUpIcon className="h-4 w-4 inline ml-1" /> : 
                    <BarsArrowDownIcon className="h-4 w-4 inline ml-1" />
                  }
                </span>
              </div>
            </div>

            {/* ✅ CONTROLES DE AÇÃO COMPACTOS */}
            <div className="flex flex-col sm:flex-row gap-3">
              {/* Busca Integrada */}
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder={t('assetManagement.searchPlaceholder')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 text-sm w-full sm:w-64 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              {/* Botões de Ação */}
              <div className="flex gap-2">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center gap-2 px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 bg-white"
                >
                  <FunnelIcon className="h-4 w-4" />
                  {t('assetManagement.filters.show')}
                  {showFilters ? <ChevronUpIcon className="h-3 w-3" /> : <ChevronDownIcon className="h-3 w-3" />}
                </button>

                <button
                  onClick={handleResetFilters}
                  className="flex items-center gap-2 px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 bg-white"
                   title={t('assetManagement.filters.reset')}
                >
                  <XMarkIcon className="h-4 w-4" />
                  {t('assetManagement.filters.reset')}
                </button>
                
                <button
                  onClick={() => fetchData(pagination.current_page)}
                  disabled={loading}
                  className="flex items-center gap-2 px-3 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ArrowPathIcon className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                  {loading ? t('assetManagement.filters.refreshing') : t('assetManagement.filters.refresh')}
                </button>
              </div>
            </div>
          </div>

          {/* ✅ PAINEL DE FILTROS EXPANDIDO INTEGRADO */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-gray-200 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-2">
                  {t('assetManagement.filters.riskLevel.label')}
                </label>
                <select
                  value={selectedRiskLevel}
                  onChange={(e) => setSelectedRiskLevel(e.target.value)}
                  className="w-full text-sm border border-gray-300 rounded-md py-2 px-3 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">{t('assetManagement.filters.riskLevel.all')}</option>
                  <option value="CRITICAL">{t('assetManagement.filters.riskLevel.critical')}</option>
                  <option value="HIGH">{t('assetManagement.filters.riskLevel.high')}</option>
                  <option value="MEDIUM">{t('assetManagement.filters.riskLevel.medium')}</option>
                  <option value="LOW">{t('assetManagement.filters.riskLevel.low')}</option>
                </select>
              </div>
              
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-2">
                  {t('assetManagement.filters.commStatus.label')}
                </label>
                <select
                  value={selectedCommStatus}
                  onChange={(e) => setSelectedCommStatus(e.target.value)}
                  className="w-full text-sm border border-gray-300 rounded-md py-2 px-3 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">{t('assetManagement.filters.commStatus.all')}</option>
                  <option value="ACTIVE">{t('assetManagement.filters.commStatus.active')}</option>
                  <option value="RECENT">{t('assetManagement.filters.commStatus.recent')}</option>
                  <option value="STALE">{t('assetManagement.filters.commStatus.stale')}</option>
                  <option value="CRITICAL">{t('assetManagement.filters.commStatus.critical')}</option>
                  <option value="NO DATA">{t('assetManagement.filters.commStatus.noData')}</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-2">
                  {t('assetManagement.filters.riskLevel.label')}
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full text-sm border border-gray-300 rounded-md py-2 px-3 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">{t('assetManagement.filters.category.all')}</option>
                  <option value="Wearable">{t('assetManagement.filters.category.wearable')}</option>
                  <option value="Vehicle">{t('assetManagement.filters.category.vehicle')}</option>
                  <option value="Asset">{t('assetManagement.filters.category.asset')}</option>
                  <option value="Sensor">{t('assetManagement.filters.category.sensor')}</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-2">
                  {t('assetManagement.filters.category.label')}
                </label>
                <select
                  value={itemsPerPage}
                  onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
                  className="w-full text-sm border border-gray-300 rounded-md py-2 px-3 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value={25}>25 {t('assetManagement.filters.itemsPerPage').toLowerCase()}</option>
                  <option value={50}>50 {t('assetManagement.filters.itemsPerPage').toLowerCase()}</option>
                  <option value={100}>100 {t('assetManagement.filters.itemsPerPage').toLowerCase()}</option>
                  <option value={200}>200 {t('assetManagement.filters.itemsPerPage').toLowerCase()}</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* ✅ TABELA COM SCROLL E LOADING OVERLAY */}
        <div className="relative bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden flex flex-col" style={{ height: '600px' }}>
          
          {/* ✅ OVERLAY DE LOADING */}
          {loading && (
            <div className="absolute inset-0 bg-balck bg-opacity-60 backdrop-blur-sm z-20 flex items-center justify-center">
              <div className="text-center">
                <div className="flex items-center justify-center mb-4">
                  <div className="relative">
                    <ArrowPathIcon className="h-12 w-12 animate-spin text-blue-600" />
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 opacity-20 rounded-full blur-sm"></div>
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('assetManagement.loadingOverlay.title')}</h3>
                <p className="text-sm text-gray-600">{t('assetManagement.loadingOverlay.description')}</p>
                <div className="mt-4 flex justify-center">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <div className="overflow-auto flex-1">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50 sticky top-0 z-10">
                <tr>
                  {/* Device ID com Filtro */}
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                    <div className="flex items-center gap-2">
                      <ColumnFilter column="device_id" label={t('assetManagement.table.columns.deviceId')} />
                      <button
                        onClick={() => toggleSort('device_id')}
                        className="p-1 rounded hover:bg-gray-200 transition-colors"
                      >
                        {sortBy === 'device_id' && (
                          sortOrder === 'asc' ? <ChevronUpIcon className="h-3 w-3" /> : <ChevronDownIcon className="h-3 w-3" />
                        )}
                      </button>
                    </div>
                  </th>

                  {/* Categoria com Filtro */}
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                    <div className="flex items-center gap-2">
                      <ColumnFilter column="category" label={t('assetManagement.table.columns.category')} />
                    </div>
                  </th>

                  {/* Risco com Filtro */}
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                    <div className="flex items-center gap-2">
                      <ColumnFilter column="risk_level" label={t('assetManagement.table.columns.risk')} />
                      <button
                        onClick={() => toggleSort('risk_level')}
                        className="p-1 rounded hover:bg-gray-200 transition-colors"
                      >
                        {sortBy === 'risk_level' && (
                          sortOrder === 'asc' ? <ChevronUpIcon className="h-3 w-3" /> : <ChevronDownIcon className="h-3 w-3" />
                        )}
                      </button>
                    </div>
                  </th>

                  {/* Health Score com Ordenação */}
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                    <div className="flex items-center gap-2">
                      <span>{t('assetManagement.table.columns.health')}</span>
                      <button
                        onClick={() => toggleSort('health_score')}
                        className="p-1 rounded hover:bg-gray-200 transition-colors"
                      >
                        {sortBy === 'health_score' && (
                          sortOrder === 'asc' ? <ChevronUpIcon className="h-3 w-3" /> : <ChevronDownIcon className="h-3 w-3" />
                        )}
                      </button>
                    </div>
                  </th>

                  {/* Comunicação com Filtro */}
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                    <div className="flex items-center gap-2">
                      <ColumnFilter column="comm_status" label={t('assetManagement.table.columns.communication')} />
                    </div>
                  </th>

                  {/* GPS com Filtro */}
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                    <div className="flex items-center gap-2">
                      <ColumnFilter column="gps_status" label={t('assetManagement.table.columns.gps')} />
                    </div>
                  </th>

                  {/* Ação Recomendada com Filtro */}
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                    <div className="flex items-center gap-2">
                      <ColumnFilter column="recommended_action" label={t('assetManagement.table.columns.recommendedAction')} />
                    </div>
                  </th>

                  {/* Problemas */}
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                    {t('assetManagement.table.columns.issues')}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredData.map((device) => {
                  const action = formatAction(device.recommended_action);
                  
                  return (
                    <tr key={device.device_id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                        {device.device_id}
                      </td>
                      
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800">
                          {device.category}
                        </span>
                      </td>
                      
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium border ${getRiskBadgeColor(device.risk_level)}`}>
                          {getRiskIcon(device.risk_level)}
                          {device.risk_level}
                        </span>
                      </td>
                      
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-gray-200 rounded-full h-2 w-16">
                            <div
                              className={`h-2 rounded-full ${
                                device.health_score >= 80 ? 'bg-green-500' :
                                device.health_score >= 60 ? 'bg-yellow-500' :
                                device.health_score >= 40 ? 'bg-orange-500' : 'bg-red-500'
                              }`}
                              style={{ width: `${device.health_score}%` }}
                            />
                          </div>
                          <span className={`text-xs font-semibold ${getHealthScoreColor(device.health_score)}`}>
                            {device.health_score}
                          </span>
                        </div>
                      </td>
                      
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="space-y-1">
                          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${getCommStatusColor(device.comm_status)}`}>
                            {device.comm_status === 'ACTIVE' || device.comm_status === 'RECENT' 
                              ? <SignalIcon className="h-3 w-3" />
                              : <SignalSlashIcon className="h-3 w-3" />
                            }
                            {device.comm_status}
                          </span>
                          <div className="flex items-center gap-1 text-xs text-gray-500">
                            <ClockIcon className="h-3 w-3" />
                            {device.hours_no_comm}h
                          </div>
                        </div>
                      </td>
                      
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="space-y-1">
                          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${
                            device.gps_status === 'TODAY' ? 'bg-green-100 text-green-800' :
                            device.gps_status === 'RECENT' ? 'bg-blue-100 text-blue-800' :
                            device.gps_status === 'OUTDATED' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            <MapPinIcon className="h-3 w-3" />
                            {device.gps_status}
                          </span>
                          <div className="text-xs text-gray-500">
                            {device.days_no_gps}d
                          </div>
                        </div>
                      </td>
                      
                      <td className="px-4 py-3">
                        <div className="flex items-start gap-2">
                          <div className="mt-0.5">
                            {getActionIcon(device.recommended_action)}
                          </div>
                          <div>
                            <div className={`text-xs font-semibold ${
                              action.type === 'REPLACE' ? 'text-red-700' :
                              action.type === 'INSPECT' ? 'text-orange-700' :
                              action.type === 'MAINTAIN' ? 'text-yellow-700' :
                              action.type === 'CHECK GPS' ? 'text-blue-700' :
                              'text-green-700'
                            }`}>
                              {action.type}
                            </div>
                            <div className="text-xs text-gray-600 max-w-xs">
                              {action.description}
                            </div>
                          </div>
                        </div>
                      </td>
                      
                      <td className="px-4 py-3">
                        {device.issues ? (
                          <div className="text-xs text-gray-600 max-w-xs">
                            {device.issues}
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400 italic">{t('assetManagement.table.noIssues')}</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            
            {/* Empty State */}
            {filteredData.length === 0 && !loading && (
              <div className="text-center py-12">
                <MagnifyingGlassIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">{t('assetManagement.table.noData')}</h3>
                <p className="mt-1 text-sm text-gray-500">
                  {t('assetManagement.table.noDataDescription')}
                </p>
              </div>
            )}
          </div>
          
          {/* ✅ PAGINAÇÃO INFERIOR FIXA */}
          {pagination.total_pages > 1 && !loading && (
            <div className="border-t border-gray-200 bg-white px-6 py-4 sticky bottom-0">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-sm text-gray-700">
                  {/* Página <span className="font-medium">{pagination.current_page}</span> de{' '}
                  <span className="font-medium">{pagination.total_pages}</span> •{' '}
                  <span className="font-medium">{filteredData.length}</span> de{' '}
                  <span className="font-medium">{pagination.total_count}</span> resultados
                  {Object.values(columnFilters).some(filter => filter) && (
                    <span className="ml-2 text-blue-600 text-xs">(filtrado)</span>
                  )} */}

                  {t('assetManagement.pagination.pageInfo', {
                    current: pagination.current_page,
                    total: pagination.total_pages,
                    shown: filteredData.length,
                    totalCount: pagination.total_count
                  })}
                  {Object.values(columnFilters).some(filter => filter) && (
                    <span className="ml-2 text-blue-600 text-xs">
                      {t('assetManagement.filtered')}
                    </span>
                  )}
                </div>
                
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handlePageChange(1)}
                    disabled={pagination.current_page === 1}
                    className="p-2 text-gray-500 hover:text-gray-700 disabled:opacity-30 disabled:cursor-not-allowed"
                    title={t('assetManagement.pagination.firstPage')}
                  >
                    <ChevronLeftIcon className="h-4 w-4" />
                    <ChevronLeftIcon className="h-4 w-4 -ml-3" />
                  </button>
                  
                  <button
                    onClick={() => handlePageChange(pagination.current_page - 1)}
                    disabled={!pagination.has_prev}
                    className="p-2 text-gray-500 hover:text-gray-700 disabled:opacity-30 disabled:cursor-not-allowed"
                    title="Página anterior"
                  >
                    <ChevronLeftIcon className="h-4 w-4" />
                  </button>
                  
                  <div className="flex items-center gap-1 mx-2">
                    {getPageNumbers().map((page, index) => (
                      page === '...' ? (
                        <span key={index} className="px-2 text-gray-400">...</span>
                      ) : (
                        <button
                          key={index}
                          onClick={() => handlePageChange(page as number)}
                          className={`min-w-[2rem] px-2 py-1 text-sm rounded ${
                            pagination.current_page === page
                              ? 'bg-blue-600 text-white'
                              : 'text-gray-700 hover:bg-gray-100'
                          }`}
                        >
                          {page}
                        </button>
                      )
                    ))}
                  </div>
                  
                  <button
                    onClick={() => handlePageChange(pagination.current_page + 1)}
                    disabled={!pagination.has_next}
                    className="p-2 text-gray-500 hover:text-gray-700 disabled:opacity-30 disabled:cursor-not-allowed"
                    title="Próxima página"
                  >
                    <ChevronRightIcon className="h-4 w-4" />
                  </button>
                  
                  <button
                    onClick={() => handlePageChange(pagination.total_pages)}
                    disabled={pagination.current_page === pagination.total_pages}
                    className="p-2 text-gray-500 hover:text-gray-700 disabled:opacity-30 disabled:cursor-not-allowed"
                    title="Última página"
                  >
                    <ChevronRightIcon className="h-4 w-4" />
                    <ChevronRightIcon className="h-4 w-4 -ml-3" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}