// src/components/RawDataExplorer.tsx
import { useState, useEffect, useMemo } from 'react';
// import { useDebounce } from 'use-debounce';

import {
  FunnelIcon,
  ArrowDownTrayIcon,
  ArrowPathIcon,
  XMarkIcon,
  MagnifyingGlassIcon,
} from '@heroicons/react/24/outline';

// =====================================
// 📊 INTERFACES E TIPOS
// =====================================

interface Column {
  key: string;
  label: string;
  sortable?: boolean;
  filterable?: boolean;
  render?: (value: any, row: any) => React.ReactNode;
}

interface TableConfig {
  id: string;
  label: string;
  icon: string;
  endpoint: string;
  exportTable: string;
  columns: Column[];
  filters: FilterConfig[];
}

interface FilterConfig {
  key: string;
  label: string;
  type: 'text' | 'select' | 'date' | 'number';
  options?: Array<{ value: string; label: string }>;
}

interface PaginatedResponse {
  data: any[];
  pagination: {
    current_page: number;
    per_page: number;
    total_records: number;
    total_pages: number;
  };
}

interface PaginationState {
  current_page: number;
  per_page: number;
  total_records: number;
  total_pages: number;
}

// =====================================
// 🎨 SUB-COMPONENTES
// =====================================

// Props interfaces para os componentes
interface FilterBarProps {
  filters: FilterConfig[];
  activeFilters: Record<string, any>;
  onFilterChange: (key: string, value: any) => void;
  onClearFilters: () => void;
}

interface ActiveFiltersProps {
  filters: Record<string, any>;
  onRemove: (key: string) => void;
}

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalRecords: number;
  perPage: number;
  onPageChange: (page: number) => void;
  onPerPageChange: (perPage: number) => void;
}

interface DataTableProps {
  data: any[];
  loading: boolean;
  onColumnFiltersChange: (filters: Record<string, string>) => void;
  currentColumnFilters: Record<string, string>;
}

// Filter Bar Component
const FilterBar: React.FC<FilterBarProps> = ({ 
  filters, 
  activeFilters, 
  onFilterChange, 
  onClearFilters 
}) => {
  const [showFilters, setShowFilters] = useState(false);

  return (
    <div className="bg-white border-b border-gray-200">
      <div className="px-6 py-4">
        {/* 🔍 Barra de Pesquisa Global */}
        <div className="mb-4">
          <div className="relative">
            <input
              type="text"
              value={activeFilters.search_text || ''}
              onChange={(e) => onFilterChange('search_text', e.target.value)}
              placeholder="🔍 Pesquisa global rápida..."
              className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <div className="absolute inset-y-0 left-0 flex items-center pl-3">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
            </div>
            {activeFilters.search_text && (
              <button
                onClick={() => onFilterChange('search_text', '')}
                className="absolute inset-y-0 right-0 flex items-center pr-3"
              >
                <XMarkIcon className="h-5 w-5 text-gray-400 hover:text-gray-600" />
              </button>
            )}
          </div>
          <p className="mt-1 text-sm text-gray-500">
            Use a pesquisa global ou os filtros individuais em cada coluna da tabela
          </p>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              <FunnelIcon className="h-5 w-5" />
              Filtros Avançados
              {Object.keys(activeFilters).filter(key => key !== 'search_text').length > 0 && (
                <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-blue-600 rounded-full">
                  {Object.keys(activeFilters).filter(key => key !== 'search_text').length}
                </span>
              )}
            </button>
            
            <div className="text-sm text-gray-600">
              💡 <strong>Dica:</strong> Use os filtros em cada coluna da tabela para buscas específicas
            </div>
          </div>
          
          {Object.keys(activeFilters).length > 0 && (
            <button
              onClick={onClearFilters}
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              Limpar filtros globais
            </button>
          )}
        </div>

        {/* Filtros Avançados */}
        {showFilters && (
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filters.map((filter) => (
              <div key={filter.key}>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {filter.label}
                </label>
                {filter.type === 'text' && (
                  <input
                    type="text"
                    value={activeFilters[filter.key] || ''}
                    onChange={(e) => onFilterChange(filter.key, e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    placeholder={`Filtrar por ${filter.label.toLowerCase()}`}
                  />
                )}
                {filter.type === 'select' && (
                  <select
                    value={activeFilters[filter.key] || ''}
                    onChange={(e) => onFilterChange(filter.key, e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Todos</option>
                    {filter.options?.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                )}
                {filter.type === 'date' && (
                  <input
                    type="date"
                    value={activeFilters[filter.key] || ''}
                    onChange={(e) => onFilterChange(filter.key, e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                )}
                {filter.type === 'number' && (
                  <input
                    type="number"
                    value={activeFilters[filter.key] || ''}
                    onChange={(e) => onFilterChange(filter.key, e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    placeholder={filter.label}
                  />
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// Active Filters Display
const ActiveFilters: React.FC<ActiveFiltersProps> = ({ 
  filters, 
  onRemove 
}) => {
  if (Object.keys(filters).length === 0) return null;

  return (
    <div className="px-6 py-3 bg-gray-50 border-b border-gray-200">
      <div className="flex flex-wrap gap-2">
        <span className="text-sm text-gray-500">Filtros ativos:</span>
        {Object.entries(filters).map(([key, value]) => (
          <span
            key={key}
            className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
          >
            <span className="font-medium">{key}:</span>
            <span>{value}</span>
            <button
              onClick={() => onRemove(key)}
              className="ml-1 hover:text-blue-900"
            >
              <XMarkIcon className="h-4 w-4" />
            </button>
          </span>
        ))}
      </div>
    </div>
  );
};

// Pagination Component
const Pagination: React.FC<PaginationProps> = ({ 
  currentPage, 
  totalPages, 
  totalRecords,
  perPage,
  onPageChange,
  onPerPageChange 
}) => {
  const startRecord = (currentPage - 1) * perPage + 1;
  const endRecord = Math.min(currentPage * perPage, totalRecords);

  return (
    <div className="bg-white px-6 py-4 border-t border-gray-200">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-700">
            Mostrando {startRecord} - {endRecord} de {totalRecords} registros
          </span>
          <select
            value={perPage}
            onChange={(e) => onPerPageChange(Number(e.target.value))}
            className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
          >
            <option value={25}>25 por página</option>
            <option value={50}>50 por página</option>
            <option value={100}>100 por página</option>
            <option value={200}>200 por página</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onPageChange(1)}
            disabled={currentPage === 1}
            className="px-3 py-1 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Primeira
          </button>
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-3 py-1 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Anterior
          </button>
          
          <span className="px-4 py-1 text-sm text-gray-700">
            Página {currentPage} de {totalPages}
          </span>
          
          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-3 py-1 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Próxima
          </button>
          <button
            onClick={() => onPageChange(totalPages)}
            disabled={currentPage === totalPages}
            className="px-3 py-1 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Última
          </button>
        </div>
      </div>
    </div>
  );
};

// Data Table Component integrado com backend
const DataTable: React.FC<DataTableProps> = ({ 
  data, 
  loading,
  onColumnFiltersChange,
  currentColumnFilters
}) => {
  const [localColumnFilters, setLocalColumnFilters] = useState<Record<string, string>>({});

  // 🔄 Sincroniza com os filtros do parent
  useEffect(() => {
    setLocalColumnFilters(currentColumnFilters);
  }, [currentColumnFilters]);

  // 🔍 Detecta automaticamente as colunas
  const columns = data.length > 0 ? Object.keys(data[0]) : [];

  // 🎯 Aplica filtros LOCAIS apenas para visualização rápida
  const locallyFilteredData = useMemo(() => {
    if (data.length === 0) return [];

    let result = [...data];

    // Filtro local para feedback imediato
    result = result.filter((row) => {
      return Object.entries(localColumnFilters).every(([col, filterValue]) => {
        if (!filterValue.trim()) return true;
        
        const cellValue = String(row[col] ?? '').toLowerCase();
        const searchTerm = filterValue.toLowerCase().trim();
        
        return cellValue.includes(searchTerm);
      });
    });

    return result;
  }, [data, localColumnFilters]);

  // 🎯 Handler para filtros de coluna (com debounce para o backend)
  const handleColumnFilterChange = (column: string, value: string) => {
    // Atualiza localmente para feedback imediato
    setLocalColumnFilters(prev => {
      const newFilters = { ...prev };
      
      if (!value.trim()) {
        delete newFilters[column];
      } else {
        newFilters[column] = value;
      }
      
      return newFilters;
    });

    // Envia para o backend após um delay
    setTimeout(() => {
      const newFilters = { ...currentColumnFilters };
      
      if (!value.trim()) {
        delete newFilters[column];
      } else {
        newFilters[column] = value;
      }
      
      onColumnFiltersChange(newFilters);
    }, 800); // Debounce de 800ms
  };

  // 🎯 Limpar todos os filtros
  const clearAllColumnFilters = () => {
    setLocalColumnFilters({});
    onColumnFiltersChange({});
  };

  // ⏳ Estados de loading
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Nenhum registro encontrado</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto overflow-y-auto max-h-[600px]">
      {/* Header com contador de filtros */}
      {Object.keys(localColumnFilters).length > 0 && (
        <div className="px-6 py-2 bg-blue-50 border-b border-blue-200">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <span className="text-blue-700 font-medium">
                🔍 Filtros ativos: {Object.keys(localColumnFilters).length}
              </span>
              {Object.entries(localColumnFilters).map(([col, value]) => (
                <span 
                  key={col} 
                  className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs"
                >
                  {col}: "{value}"
                  <button
                    onClick={() => handleColumnFilterChange(col, '')}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <XMarkIcon className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
            <button
              onClick={clearAllColumnFilters}
              className="text-blue-700 hover:text-blue-900 text-xs font-medium"
            >
              Limpar todos os filtros
            </button>
          </div>
        </div>
      )}

      <table className="min-w-full divide-y divide-gray-300 text-sm">
        <thead className="bg-gray-50 sticky top-0 z-10">
          <tr>
            {columns.map((col) => (
              <th
                key={col}
                className="px-3 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider"
              >
                <div className="flex flex-col gap-1">
                  {/* Header da coluna */}
                  <div className="flex items-center justify-between">
                    <span className="font-semibold">{col}</span>
                    
                    {/* Indicador de filtro ativo */}
                    {localColumnFilters[col] && (
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <button
                          onClick={() => handleColumnFilterChange(col, '')}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          <XMarkIcon className="h-3 w-3" />
                        </button>
                      </div>
                    )}
                  </div>
                  
                  {/* Input de filtro */}
                  <div className="relative">
                    <input
                      type="text"
                      placeholder={`Filtrar ${col}...`}
                      value={localColumnFilters[col] || ''}
                      onChange={(e) => handleColumnFilterChange(col, e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                      className="w-full px-2 py-1 text-xs text-gray-700 bg-white border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 normal-case font-normal"
                    />
                    
                    {/* Loading indicator durante o filtro */}
                    {loading && localColumnFilters[col] && (
                      <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                        <div className="animate-spin rounded-full h-3 w-3 border-b-1 border-blue-500"></div>
                      </div>
                    )}
                  </div>
                </div>
              </th>
            ))}
          </tr>
        </thead>
        
        <tbody className="bg-white divide-y divide-gray-200">
          {locallyFilteredData.map((row, idx) => (
            <tr key={idx} className="hover:bg-gray-50 transition-colors">
              {columns.map((col) => (
                <td key={col} className="px-3 py-3 text-gray-900 whitespace-nowrap">
                  <div className="max-w-[200px] truncate" title={String(row[col] ?? '—')}>
                    {typeof row[col] === 'object' && row[col] !== null
                      ? JSON.stringify(row[col])
                      : row[col] !== null && row[col] !== undefined
                      ? String(row[col])
                      : '—'}
                  </div>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      
      {/* Informações sobre os dados */}
      <div className="px-6 py-3 bg-gray-50 border-t border-gray-200 text-xs text-gray-500">
        <div className="flex items-center justify-between">
          <span>
            {Object.keys(localColumnFilters).length > 0 ? (
              <>
                📊 Mostrando {locallyFilteredData.length} registro(s) 
                <span className="text-blue-600 ml-1">
                  (filtrado(s) localmente - aguardando busca no servidor)
                </span>
              </>
            ) : (
              `📊 Mostrando ${data.length} registro(s)`
            )}
          </span>
          
          {Object.keys(localColumnFilters).length > 0 && (
            <span className="text-orange-600">
              ⚡ Filtro local - servidor será atualizado automaticamente
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

// =====================================
// 🎯 COMPONENTE PRINCIPAL
// =====================================

const RawDataExplorer: React.FC = () => {
  // States
  const [columnFilters, setColumnFilters] = useState<Record<string, string>>({});
  const [activeTab, setActiveTab] = useState<string>('gps');
  const [data, setData] = useState<any[]>([]);
  const [pagination, setPagination] = useState<PaginationState>({
    current_page: 1,
    per_page: 50,
    total_records: 0,
    total_pages: 0,
  });
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState<Record<string, any>>({});
  const [exporting, setExporting] = useState(false);
  
  // Usando useDebounce apenas para os filtros que realmente precisam
//   const [debouncedFilters] = useDebounce(filters, 500);

  // Table Configurations
  const tableConfigs: Record<string, TableConfig> = {
    gps: {
      id: 'gps',
      label: 'GPS Reports',
      icon: '📍',
      endpoint: '/api/dashboard/devices/raw/gps-reports',
      exportTable: 'device_gps_report_monitoring',
      columns: [
        { key: 'dev_eui', label: 'Device EUI' },
        { key: 'customer_name', label: 'Cliente' },
        { 
          key: 'timestamp', 
          label: 'Timestamp',
          render: (val) => val ? new Date(val).toLocaleString('pt-BR') : 'N/A'
        },
        { 
          key: 'gps_latitude', 
          label: 'Latitude',
          render: (val) => {
            if (val === null || val === undefined || isNaN(val)) return 'N/A';
            return Number(val).toFixed(6);
          }
        },
        { 
          key: 'gps_longitude', 
          label: 'Longitude',
          render: (val) => {
            if (val === null || val === undefined || isNaN(val)) return 'N/A';
            return Number(val).toFixed(6);
          }
        },
        { 
          key: 'gps_accuracy', 
          label: 'Precisão (m)',
          render: (val) => {
            if (val === null || val === undefined || isNaN(val)) return 'N/A';
            return `${Number(val).toFixed(1)}m`;
          }
        },
        { 
          key: 'battery_level', 
          label: 'Bateria',
          render: (val) => {
            if (val === null || val === undefined || isNaN(val)) return 'N/A';
            const battery = Number(val);
            return (
              <span className={`font-medium ${
                battery >= 30 ? 'text-green-600' : 
                battery >= 20 ? 'text-yellow-600' : 
                'text-red-600'
              }`}>
                {battery}%
              </span>
            );
          }
        },
        { 
          key: 'dynamic_motion_state', 
          label: 'Estado',
          render: (val) => {
            if (!val) return 'N/A';
            return (
              <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                val === 'MOVING' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
              }`}>
                {val}
              </span>
            );
          }
        },
        { 
          key: 'speed', 
          label: 'Velocidade',
          render: (val) => {
            if (val === null || val === undefined || isNaN(val)) return 'N/A';
            return `${Number(val).toFixed(1)} km/h`;
          }
        },
      ],
      filters: [
        { key: 'dev_eui', label: 'Device EUI', type: 'text' },
        { key: 'customer_name', label: 'Cliente', type: 'text' },
        { 
          key: 'event_type', 
          label: 'Tipo de Evento', 
          type: 'select',
          options: [
            { value: 'SOS_MODE_START', label: 'SOS Start' },
            { value: 'SOS_MODE_END', label: 'SOS End' },
            { value: 'MOTION_START', label: 'Motion Start' },
            { value: 'MOTION_END', label: 'Motion End' },
            { value: 'GEOFENCE_ENTRY', label: 'Geofence Entry' },
            { value: 'GEOFENCE_EXIT', label: 'Geofence Exit' },
          ]
        },
        { 
          key: 'is_valid_event', 
          label: 'Evento Válido', 
          type: 'select',
          options: [
            { value: 'true', label: 'Sim' },
            { value: 'false', label: 'Não' },
          ]
        },
        { key: 'battery_min', label: 'Bateria Mínima (%)', type: 'number' },
        { key: 'battery_max', label: 'Bateria Máxima (%)', type: 'number' },
        { key: 'start_date', label: 'Data Inicial', type: 'date' },
        { key: 'end_date', label: 'Data Final', type: 'date' },
      ],
    },
    // ... outras configurações de tabela (events, scanning, configuration, errors)
    events: {
      id: 'events',
      label: 'Events',
      icon: '🚨',
      endpoint: '/api/dashboard/devices/raw/events',
      exportTable: 'device_events_management',
      columns: [
        { key: 'dev_eui', label: 'Device EUI' },
        { key: 'customer_name', label: 'Cliente' },
        { 
          key: 'event_timestamp', 
          label: 'Timestamp',
          render: (val) => val ? new Date(val).toLocaleString('pt-BR') : 'N/A'
        },
        { 
          key: 'event_type', 
          label: 'Tipo de Evento',
          render: (val) => {
            if (!val) return 'N/A';
            return (
              <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-800">
                {val}
              </span>
            );
          }
        },
        { 
          key: 'is_valid_event', 
          label: 'Válido',
          render: (val) => (
            <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
              val ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
              {val ? 'Sim' : 'Não'}
            </span>
          )
        },
        { 
          key: 'battery_level', 
          label: 'Bateria (%)',
          render: (val) => {
            if (val === null || val === undefined || isNaN(val)) return 'N/A';
            return `${Number(val)}%`;
          }
        },
        { 
          key: 'temperature', 
          label: 'Temperatura (°C)',
          render: (val) => {
            if (val === null || val === undefined || isNaN(val)) return 'N/A';
            return `${Number(val).toFixed(1)}°C`;
          }
        },
      ],
      filters: [
        { key: 'dev_eui', label: 'Device EUI', type: 'text' },
        { key: 'customer_name', label: 'Cliente', type: 'text' },
        { 
          key: 'event_type', 
          label: 'Tipo de Evento', 
          type: 'select',
          options: [
            { value: 'SOS_MODE_START', label: 'SOS Start' },
            { value: 'SOS_MODE_END', label: 'SOS End' },
            { value: 'MOTION_START', label: 'Motion Start' },
            { value: 'MOTION_END', label: 'Motion End' },
            { value: 'GEOFENCE_ENTRY', label: 'Geofence Entry' },
            { value: 'GEOFENCE_EXIT', label: 'Geofence Exit' },
          ]
        },
        { 
          key: 'is_valid_event', 
          label: 'Evento Válido', 
          type: 'select',
          options: [
            { value: 'true', label: 'Sim' },
            { value: 'false', label: 'Não' },
          ]
        },
        { key: 'start_date', label: 'Data Inicial', type: 'date' },
        { key: 'end_date', label: 'Data Final', type: 'date' },
      ],
    },
    scanning: {
      id: 'scanning',
      label: 'Scanning',
      icon: '📡',
      endpoint: '/api/dashboard/devices/raw/scanning',
      exportTable: 'device_scanning_monitoring',
      columns: [
        { key: 'dev_eui', label: 'Device EUI' },
        { key: 'customer_name', label: 'Cliente' },
        { 
          key: 'timestamp', 
          label: 'Timestamp',
          render: (val) => val ? new Date(val).toLocaleString('pt-BR') : 'N/A'
        },
        { 
          key: 'scan_type', 
          label: 'Tipo de Scan',
          render: (val) => val || 'N/A'
        },
        { 
          key: 'battery_level', 
          label: 'Bateria (%)',
          render: (val) => {
            if (val === null || val === undefined || isNaN(val)) return 'N/A';
            return `${Number(val)}%`;
          }
        },
      ],
      filters: [
        { key: 'dev_eui', label: 'Device EUI', type: 'text' },
        { key: 'customer_name', label: 'Cliente', type: 'text' },
        { key: 'start_date', label: 'Data Inicial', type: 'date' },
        { key: 'end_date', label: 'Data Final', type: 'date' },
      ],
    },
    configuration: {
      id: 'configuration',
      label: 'Configuration',
      icon: '⚙️',
      endpoint: '/api/dashboard/devices/raw/configuration',
      exportTable: 'device_configuration_management',
      columns: [
        { key: 'dev_eui', label: 'Device EUI' },
        { key: 'customer_name', label: 'Cliente' },
        { 
          key: 'config_timestamp', 
          label: 'Timestamp',
          render: (val) => val ? new Date(val).toLocaleString('pt-BR') : 'N/A'
        },
        { 
          key: 'tracking_mode', 
          label: 'Modo de Rastreamento',
          render: (val) => {
            if (!val) return 'N/A';
            return (
              <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                {val}
              </span>
            );
          }
        },
        { 
          key: 'tracking_ul_period', 
          label: 'Período (s)',
          render: (val) => {
            if (val === null || val === undefined || isNaN(val)) return 'N/A';
            return `${Number(val)}s`;
          }
        },
        { 
          key: 'battery_level', 
          label: 'Bateria (%)',
          render: (val) => {
            if (val === null || val === undefined || isNaN(val)) return 'N/A';
            return `${Number(val)}%`;
          }
        },
        { 
          key: 'temperature', 
          label: 'Temperatura (°C)',
          render: (val) => {
            if (val === null || val === undefined || isNaN(val)) return 'N/A';
            return `${Number(val).toFixed(1)}°C`;
          }
        },
      ],
      filters: [
        { key: 'dev_eui', label: 'Device EUI', type: 'text' },
        { key: 'customer_name', label: 'Cliente', type: 'text' },
        { 
          key: 'tracking_mode', 
          label: 'Modo', 
          type: 'select',
          options: [
            { value: 'MOTION_TRACKING', label: 'Motion Tracking' },
            { value: 'PERMANENT_TRACKING', label: 'Permanent Tracking' },
          ]
        },
        { key: 'start_date', label: 'Data Inicial', type: 'date' },
        { key: 'end_date', label: 'Data Final', type: 'date' },
      ],
    },
    errors: {
      id: 'errors',
      label: 'GPS Errors',
      icon: '❌',
      endpoint: '/api/dashboard/devices/raw/gps-errors',
      exportTable: 'device_gps_error_management',
      columns: [
        { key: 'dev_eui', label: 'Device EUI' },
        { key: 'customer_name', label: 'Cliente' },
        { 
          key: 'timestamp', 
          label: 'Timestamp',
          render: (val) => val ? new Date(val).toLocaleString('pt-BR') : 'N/A'
        },
        { 
          key: 'error_type', 
          label: 'Tipo de Erro',
          render: (val) => {
            if (!val) return 'N/A';
            return (
              <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">
                {val}
              </span>
            );
          }
        },
        { 
          key: 'error_message', 
          label: 'Mensagem',
          render: (val) => val || 'N/A'
        },
      ],
      filters: [
        { key: 'dev_eui', label: 'Device EUI', type: 'text' },
        { key: 'customer_name', label: 'Cliente', type: 'text' },
        { key: 'error_type', label: 'Tipo de Erro', type: 'text' },
        { key: 'start_date', label: 'Data Inicial', type: 'date' },
        { key: 'end_date', label: 'Data Final', type: 'date' },
      ],
    },
  };

  const currentConfig = tableConfigs[activeTab];

  // 🆕 Atualize o fetchData para incluir column_filters
  const fetchData = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: pagination.current_page.toString(),
        limit: pagination.per_page.toString(),
        ...filters,
      });

      // 🆕 Adiciona filtros de coluna como JSON
      if (Object.keys(columnFilters).length > 0) {
        params.append('column_filters', JSON.stringify(columnFilters));
      }

      const response = await fetch(`https://api-dashboards-u1oh.onrender.com${currentConfig.endpoint}?${params}`);
      const result: PaginatedResponse = await response.json();

      setData(result.data);
      setPagination(result.pagination);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  // 🆕 Handler para filtros de coluna
  const handleColumnFiltersChange = (filters: Record<string, string>) => {
    setColumnFilters(filters);
    setPagination(prev => ({ ...prev, current_page: 1 })); // Reset para primeira página
  };

  // Export Data
  const handleExport = async (format: 'json' | 'csv') => {
    setExporting(true);
    try {
      const params = new URLSearchParams(filters);
      const url = `https://api-dashboards-u1oh.onrender.com/api/dashboard/devices/export/${currentConfig.exportTable}/${format}?${params}`;
      
      const response = await fetch(url);
      const blob = await response.blob();
      
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = `${currentConfig.exportTable}_${new Date().toISOString().split('T')[0]}.${format}`;
      link.click();
    } catch (error) {
      console.error('Error exporting data:', error);
    } finally {
      setExporting(false);
    }
  };

  // Handlers
  const handleFilterChange = (key: string, value: any) => {
    setFilters(prev => {
      if (!value) {
        const { [key]: removed, ...rest } = prev;
        return rest;
      }
      return { ...prev, [key]: value };
    });
    setPagination(prev => ({ ...prev, current_page: 1 }));
  };

  const handleClearFilters = () => {
    setFilters({});
    setPagination(prev => ({ ...prev, current_page: 1 }));
  };

  const handlePageChange = (page: number) => {
    setPagination(prev => ({ ...prev, current_page: page }));
  };

  const handlePerPageChange = (perPage: number) => {
    setPagination(prev => ({ ...prev, per_page: perPage, current_page: 1 }));
  };

  // Effects
  useEffect(() => {
    fetchData();
  }, [activeTab, pagination.current_page, pagination.per_page, filters, columnFilters]);

  return (
    <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white">
            📊 Explorador de Dados Brutos
          </h2>
          <div className="flex items-center gap-2">
            <button
              onClick={fetchData}
              disabled={loading}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-white/20 hover:bg-white/30 rounded-md transition-colors disabled:opacity-50"
            >
              <ArrowPathIcon className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
              Atualizar
            </button>
            <div className="relative group">
              <button
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-white/20 hover:bg-white/30 rounded-md transition-colors"
              >
                <ArrowDownTrayIcon className="h-5 w-5" />
                Exportar
              </button>
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 hidden group-hover:block">
                <button
                  onClick={() => handleExport('json')}
                  disabled={exporting}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Exportar JSON
                </button>
                <button
                  onClick={() => handleExport('csv')}
                  disabled={exporting}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Exportar CSV
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 bg-gray-50 overflow-x-auto">
        <nav className="flex space-x-4 px-6">
          {Object.values(tableConfigs).map((config) => (
            <button
              key={config.id}
              onClick={() => {
                setActiveTab(config.id);
                setFilters({});
                setPagination(prev => ({ ...prev, current_page: 1 }));
              }}
              className={`
                flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors
                ${activeTab === config.id
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }
              `}
            >
              <span className="text-lg">{config.icon}</span>
              {config.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Filters */}
      <FilterBar
        filters={currentConfig.filters}
        activeFilters={filters}
        onFilterChange={handleFilterChange}
        onClearFilters={handleClearFilters}
      />

      {/* Active Filters */}
      <ActiveFilters
        filters={filters}
        onRemove={(key) => handleFilterChange(key, '')}
      />

      {/* Data Table */}
      <DataTable
        data={data}
        loading={loading}
        onColumnFiltersChange={handleColumnFiltersChange}
        currentColumnFilters={columnFilters}
      />

      {/* Pagination */}
      {!loading && data.length > 0 && (
        <Pagination
          currentPage={pagination.current_page}
          totalPages={pagination.total_pages}
          totalRecords={pagination.total_records}
          perPage={pagination.per_page}
          onPageChange={handlePageChange}
          onPerPageChange={handlePerPageChange}
        />
      )}
    </div>
  );
};

export default RawDataExplorer;