// src/components/DataGrid/DevicePayloadStatsGrid.tsx

import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import {
    ArrowPathIcon,
    SignalIcon,
    BoltIcon,
    ClockIcon,
    ChartBarIcon,
    FunnelIcon,
    XMarkIcon,
    ArrowUpIcon,
    ArrowDownIcon,
    ArrowsUpDownIcon,
} from '@heroicons/react/24/outline';
import { useCompany } from '../../../hooks/useCompany';

// =====================================
// 📊 INTERFACES
// =====================================
interface DevicePayloadStats {
    dev_eui: string;
    object_name: string;
    total_payloads: number;
    avg_per_hour: number;
    Thinkpark_last_payload_time: string;
    last_payload_type: string;
    last_reported_battery_level: number;
}

interface FilterOptions {
    dev_eui: string;
    object_name: string;
    raw_position_type: string;
    min_battery_level: number;
    max_battery_level: number;
    min_payloads: number;
    max_payloads: number;
}

interface Pagination {
    current_page: number;
    per_page: number;
    total_records: number;
    total_pages: number;
}

// =====================================
// 🎨 COMPONENTE DE FILTROS
// =====================================
const PayloadFilters = ({
    filters,
    onFiltersChange,
    onClearFilters,
    activeFiltersCount,
}: {
    filters: FilterOptions;
    onFiltersChange: (filters: FilterOptions) => void;
    onClearFilters: () => void;
    activeFiltersCount: number;
}) => {
    const { t } = useTranslation();
    const [isOpen, setIsOpen] = useState(false);
     const dropdownRef = useRef<HTMLDivElement>(null);


    const updateFilter = (key: keyof FilterOptions, value: any) => {
        onFiltersChange({
            ...filters,
            [key]: value,
        });
    };

     return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 transition-all ${
          activeFiltersCount > 0
            ? 'bg-blue-50 border-blue-500 text-blue-700 hover:bg-blue-100'
            : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
        }`}
      >
        <FunnelIcon className="h-5 w-5" />
        <span className="font-medium">
          {t('devicePayloadStats.filters.title')}
          {activeFiltersCount > 0 && ` (${activeFiltersCount})`}
        </span>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-[600px] bg-white rounded-lg shadow-xl border border-gray-200 z-50 max-h-[80vh] overflow-y-auto">
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">
              {t('devicePayloadStats.filters.payloadFilters')}
            </h3>
            <div className="flex items-center gap-2">
              {activeFiltersCount > 0 && (
                <button
                  onClick={onClearFilters}
                  className="text-sm text-red-600 hover:text-red-700 font-medium"
                >
                  {t('devicePayloadStats.filters.clearAll')}
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Filtros */}
          <div className="p-4 space-y-6">
            {/* Device EUI */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('devicePayloadStats.filters.deviceEui')}
              </label>
              <input
                type="text"
                value={filters.dev_eui}
                onChange={(e) => updateFilter('dev_eui', e.target.value)}
                placeholder={t('devicePayloadStats.filters.deviceEuiPlaceholder')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md font-mono text-sm"
              />
            </div>

            {/* Nome do Objeto */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('devicePayloadStats.filters.objectName')}
              </label>
              <input
                type="text"
                value={filters.object_name}
                onChange={(e) => updateFilter('object_name', e.target.value)}
                placeholder={t('devicePayloadStats.filters.objectNamePlaceholder')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>

            {/* Tipo de Payload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('devicePayloadStats.filters.payloadType')}
              </label>
              <select
                value={filters.raw_position_type}
                onChange={(e) => updateFilter('raw_position_type', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="">{t('devicePayloadStats.filters.all')}</option>
                <option value="GPS">GPS</option>
                <option value="WIFI">WIFI</option>
                <option value="BLE">BLE</option>
              </select>
            </div>

            {/* Nível de Bateria */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('devicePayloadStats.filters.batteryLevel')}
              </label>
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={filters.min_battery_level}
                  onChange={(e) => updateFilter('min_battery_level', parseInt(e.target.value) || 0)}
                  placeholder={t('devicePayloadStats.filters.min')}
                  className="px-3 py-2 border border-gray-300 rounded-md"
                />
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={filters.max_battery_level}
                  onChange={(e) => updateFilter('max_battery_level', parseInt(e.target.value) || 100)}
                  placeholder={t('devicePayloadStats.filters.max')}
                  className="px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
            </div>

            {/* Quantidade de Payloads */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('devicePayloadStats.filters.payloadQuantity')}
              </label>
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="number"
                  min="0"
                  value={filters.min_payloads}
                  onChange={(e) => updateFilter('min_payloads', parseInt(e.target.value) || 0)}
                  placeholder={t('devicePayloadStats.filters.min')}
                  className="px-3 py-2 border border-gray-300 rounded-md"
                />
                <input
                  type="number"
                  min="0"
                  value={filters.max_payloads}
                  onChange={(e) => updateFilter('max_payloads', parseInt(e.target.value) || 0)}
                  placeholder={t('devicePayloadStats.filters.max')}
                  className="px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 p-4 flex items-center justify-between">
            <span className="text-sm text-gray-600">
              {activeFiltersCount > 0
                ? t('devicePayloadStats.filters.activeFilters', { count: activeFiltersCount })
                : t('devicePayloadStats.filters.noActiveFilters')}
            </span>
            <button
              onClick={() => setIsOpen(false)}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              {t('devicePayloadStats.filters.apply')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// =====================================
// 📊 COMPONENTE PRINCIPAL
// =====================================
export default function DevicePayloadStatsGrid() {
    const { t } = useTranslation();
    const { companyId } = useCompany();

    const [data, setData] = useState<DevicePayloadStats[]>([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(25);
    const [pagination, setPagination] = useState<Pagination>({
        current_page: 1,
        per_page: 25,
        total_records: 0,
        total_pages: 1,
    });

    const [sortBy, setSortBy] = useState('total_payloads');
    const [sortOrder, setSortOrder] = useState<'ASC' | 'DESC'>('DESC');

    const [filters, setFilters] = useState<FilterOptions>({
        dev_eui: '',
        object_name: '',
        raw_position_type: '',
        min_battery_level: 0,
        max_battery_level: 100,
        min_payloads: 0,
        max_payloads: 0,
    });

    const fetchData = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                page: page.toString(),
                limit: limit.toString(),
                sortBy,
                sortOrder,
            });

            // Adicionar filtros
            if (filters.dev_eui) params.append('dev_eui', filters.dev_eui);
            if (filters.object_name) params.append('object_name', filters.object_name);
            if (filters.raw_position_type) params.append('raw_position_type', filters.raw_position_type);
            if (filters.min_battery_level > 0) params.append('min_battery_level', filters.min_battery_level.toString());
            if (filters.max_battery_level < 100) params.append('max_battery_level', filters.max_battery_level.toString());
            if (filters.min_payloads > 0) params.append('min_payloads', filters.min_payloads.toString());
            if (filters.max_payloads > 0) params.append('max_payloads', filters.max_payloads.toString());

            const response = await fetch(
                `http://localhost:4000/api/dashboard/devices/${companyId}/device-payloads?${params}`
            );
            const result = await response.json();

            setData(result.data || []);
            setPagination(result.pagination);
        } catch (error) {
            console.error('Error fetching device payload stats:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (companyId) {
            fetchData();
        }
    }, [companyId, page, limit, sortBy, sortOrder, filters]);

    const handleSort = (field: string) => {
        if (sortBy === field) {
            setSortOrder(sortOrder === 'ASC' ? 'DESC' : 'ASC');
        } else {
            setSortBy(field);
            setSortOrder('DESC');
        }
        setPage(1);
    };

    const getActiveFiltersCount = () => {
        let count = 0;
        if (filters.dev_eui) count++;
        if (filters.object_name) count++;
        if (filters.raw_position_type) count++;
        if (filters.min_battery_level > 0 || filters.max_battery_level < 100) count++;
        if (filters.min_payloads > 0 || filters.max_payloads > 0) count++;
        return count;
    };
    //@ts-ignore
    const SortableHeader = ({ field, children }: { field: string; children: React.ReactNode }) => {
        const isActive = sortBy === field;
        return (
            <th
                onClick={() => handleSort(field)}
                className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer select-none transition-colors ${isActive ? 'text-blue-600 bg-blue-50' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                    }`}
            >
                <div className="flex items-center gap-2">
                    <span>{children}</span>
                    {isActive ? (
                        sortOrder === 'ASC' ? (
                            <ArrowUpIcon className="h-4 w-4" />
                        ) : (
                            <ArrowDownIcon className="h-4 w-4" />
                        )
                    ) : (
                        <ArrowsUpDownIcon className="h-4 w-4 opacity-30" />
                    )}
                </div>
            </th>
        );
    };

     return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <SignalIcon className="h-6 w-6 text-blue-600" />
            {t('devicePayloadStats.title')}
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            {t('devicePayloadStats.devicesWithActivity', { count: pagination.total_records })}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <PayloadFilters
            filters={filters}
            onFiltersChange={setFilters}
            onClearFilters={() =>
              setFilters({
                dev_eui: '',
                object_name: '',
                raw_position_type: '',
                min_battery_level: 0,
                max_battery_level: 100,
                min_payloads: 0,
                max_payloads: 0,
              })
            }
            activeFiltersCount={getActiveFiltersCount()}
          />

          <button
            onClick={fetchData}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400"
          >
            <ArrowPathIcon className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            {t('devicePayloadStats.update')}
          </button>
        </div>
      </div>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-4">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3 border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-blue-600 font-medium">
                {t('devicePayloadStats.cards.totalDevices')}
              </p>
              <p className="text-xl font-bold text-blue-900">{pagination.total_records}</p>
            </div>
            <SignalIcon className="h-8 w-8 text-blue-600 opacity-50" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-3 border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-green-600 font-medium">
                {t('devicePayloadStats.cards.totalPayloads')}
              </p>
              <p className="text-xl font-bold text-green-900">
                {data.reduce((sum, d) => sum + (Number(d.total_payloads) || 0), 0)}
              </p>
            </div>
            <ChartBarIcon className="h-8 w-8 text-green-600 opacity-50" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-3 border border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-purple-600 font-medium">
                {t('devicePayloadStats.cards.avgPerHour')}
              </p>
              <p className="text-xl font-bold text-purple-900">
                {data.length > 0
                  ? (
                      data.reduce((sum, d) => sum + (Number(d.avg_per_hour) || 0), 0) / data.length
                    ).toFixed(1)
                  : '0'}
              </p>
            </div>
            <ClockIcon className="h-8 w-8 text-purple-600 opacity-50" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg p-3 border border-yellow-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-yellow-600 font-medium">
                {t('devicePayloadStats.cards.avgBattery')}
              </p>
              <p className="text-xl font-bold text-yellow-900">
                {data.length > 0
                  ? Math.round(
                      data
                        .map((d) => Number(d.last_reported_battery_level) || 0)
                        .reduce((sum, level) => sum + level, 0) / data.length
                    )
                  : '0'}
                %
              </p>
            </div>
            <BoltIcon className="h-8 w-8 text-yellow-600 opacity-50" />
          </div>
        </div>
      </div>

      {/* Tabela */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <>
          <div className="border border-gray-300 rounded-lg overflow-hidden">
            <div className="overflow-y-auto max-h-[500px]">
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-50 sticky top-0 z-10">
                  <tr>
                    <th
                      className="px-3 py-2 text-left text-[10px] font-medium text-gray-500 uppercase tracking-wider cursor-pointer select-none hover:bg-gray-100"
                      onClick={() => handleSort('dev_eui')}
                    >
                      <div className="flex items-center gap-1">
                        <span>{t('devicePayloadStats.table.deviceEui')}</span>
                        {sortBy === 'dev_eui' &&
                          (sortOrder === 'ASC' ? (
                            <ArrowUpIcon className="h-3 w-3" />
                          ) : (
                            <ArrowDownIcon className="h-3 w-3" />
                          ))}
                      </div>
                    </th>
                    <th
                      className="px-3 py-2 text-left text-[10px] font-medium text-gray-500 uppercase tracking-wider cursor-pointer select-none hover:bg-gray-100"
                      onClick={() => handleSort('object_name')}
                    >
                      <div className="flex items-center gap-1">
                        <span>{t('devicePayloadStats.table.objectName')}</span>
                        {sortBy === 'object_name' &&
                          (sortOrder === 'ASC' ? (
                            <ArrowUpIcon className="h-3 w-3" />
                          ) : (
                            <ArrowDownIcon className="h-3 w-3" />
                          ))}
                      </div>
                    </th>
                    <th
                      className="px-3 py-2 text-left text-[10px] font-medium text-gray-500 uppercase tracking-wider cursor-pointer select-none hover:bg-gray-100"
                      onClick={() => handleSort('total_payloads')}
                    >
                      <div className="flex items-center gap-1">
                        <span>{t('devicePayloadStats.table.payloads')}</span>
                        {sortBy === 'total_payloads' &&
                          (sortOrder === 'ASC' ? (
                            <ArrowUpIcon className="h-3 w-3" />
                          ) : (
                            <ArrowDownIcon className="h-3 w-3" />
                          ))}
                      </div>
                    </th>
                    <th
                      className="px-3 py-2 text-left text-[10px] font-medium text-gray-500 uppercase tracking-wider cursor-pointer select-none hover:bg-gray-100"
                      onClick={() => handleSort('avg_per_hour')}
                    >
                      <div className="flex items-center gap-1">
                        <span>{t('devicePayloadStats.table.avgHour')}</span>
                        {sortBy === 'avg_per_hour' &&
                          (sortOrder === 'ASC' ? (
                            <ArrowUpIcon className="h-3 w-3" />
                          ) : (
                            <ArrowDownIcon className="h-3 w-3" />
                          ))}
                      </div>
                    </th>
                    <th
                      className="px-3 py-2 text-left text-[10px] font-medium text-gray-500 uppercase tracking-wider cursor-pointer select-none hover:bg-gray-100"
                      onClick={() => handleSort('Thinkpark_last_payload_time')}
                    >
                      <div className="flex items-center gap-1">
                        <span>{t('devicePayloadStats.table.lastPayload')}</span>
                        {sortBy === 'Thinkpark_last_payload_time' &&
                          (sortOrder === 'ASC' ? (
                            <ArrowUpIcon className="h-3 w-3" />
                          ) : (
                            <ArrowDownIcon className="h-3 w-3" />
                          ))}
                      </div>
                    </th>
                    <th
                      className="px-3 py-2 text-left text-[10px] font-medium text-gray-500 uppercase tracking-wider cursor-pointer select-none hover:bg-gray-100"
                      onClick={() => handleSort('last_payload_type')}
                    >
                      <div className="flex items-center gap-1">
                        <span>{t('devicePayloadStats.table.type')}</span>
                        {sortBy === 'last_payload_type' &&
                          (sortOrder === 'ASC' ? (
                            <ArrowUpIcon className="h-3 w-3" />
                          ) : (
                            <ArrowDownIcon className="h-3 w-3" />
                          ))}
                      </div>
                    </th>
                    <th
                      className="px-3 py-2 text-left text-[10px] font-medium text-gray-500 uppercase tracking-wider cursor-pointer select-none hover:bg-gray-100"
                      onClick={() => handleSort('last_reported_battery_level')}
                    >
                      <div className="flex items-center gap-1">
                        <span>{t('devicePayloadStats.table.battery')}</span>
                        {sortBy === 'last_reported_battery_level' &&
                          (sortOrder === 'ASC' ? (
                            <ArrowUpIcon className="h-3 w-3" />
                          ) : (
                            <ArrowDownIcon className="h-3 w-3" />
                          ))}
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {data.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-8 text-center text-sm text-gray-500">
                        {t('devicePayloadStats.table.noData')}
                      </td>
                    </tr>
                  ) : (
                    data.map((device, idx) => (
                      <tr key={idx} className="hover:bg-gray-50 transition-colors">
                        <td className="px-3 py-2 whitespace-nowrap">
                          <span className="font-mono text-[11px] text-gray-900">
                            {device.dev_eui}
                          </span>
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap">
                          <span className="text-[11px] font-medium text-gray-900">
                            {device.object_name}
                          </span>
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800">
                            {device.total_payloads}
                          </span>
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap">
                          <span className="text-[11px] text-gray-900">{device.avg_per_hour}</span>
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap">
                          <div className="text-[10px]">
                            <div className="text-gray-900">
                              {new Date(device.Thinkpark_last_payload_time).toLocaleDateString(
                                'pt-BR',
                                {
                                  day: '2-digit',
                                  month: '2-digit',
                                  year: '2-digit',
                                }
                              )}
                            </div>
                            <div className="text-gray-500">
                              {new Date(device.Thinkpark_last_payload_time).toLocaleTimeString(
                                'pt-BR',
                                {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                }
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap">
                          <span
                            className={`inline-flex px-1.5 py-0.5 rounded-full text-[9px] font-medium ${
                              device.last_payload_type === 'GPS'
                                ? 'bg-green-100 text-green-800'
                                : device.last_payload_type === 'WIFI'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-purple-100 text-purple-800'
                            }`}
                          >
                            {device.last_payload_type}
                          </span>
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap">
                          <div className="flex items-center gap-1.5">
                            <div className="w-12 bg-gray-200 rounded-full h-1.5">
                              <div
                                className={`h-1.5 rounded-full transition-all ${
                                  device.last_reported_battery_level >= 30
                                    ? 'bg-green-500'
                                    : device.last_reported_battery_level >= 20
                                    ? 'bg-yellow-500'
                                    : 'bg-red-500'
                                }`}
                                style={{ width: `${device.last_reported_battery_level}%` }}
                              />
                            </div>
                            <span className="text-[10px] font-medium text-gray-900 min-w-[30px]">
                              {device.last_reported_battery_level}%
                            </span>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Paginação */}
          <div className="flex flex-col sm:flex-row items-center justify-between mt-4 px-4 py-3 bg-gray-50 border-t border-gray-200 rounded-b-lg gap-3">
            <div className="text-xs text-gray-700">
              {t('devicePayloadStats.pagination.showing')}{' '}
              <span className="font-medium">{(page - 1) * limit + 1}</span>{' '}
              {t('devicePayloadStats.pagination.to')}{' '}
              <span className="font-medium">{Math.min(page * limit, pagination.total_records)}</span>{' '}
              {t('devicePayloadStats.pagination.of')}{' '}
              <span className="font-medium">{pagination.total_records}</span>{' '}
              {t('devicePayloadStats.pagination.results')}
            </div>

            <div className="flex items-center gap-3">
              <select
                value={limit}
                onChange={(e) => {
                  setLimit(Number(e.target.value));
                  setPage(1);
                }}
                className="rounded-md border-gray-300 text-xs py-1"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>

              <div className="flex gap-1">
                <button
                  onClick={() => setPage(page - 1)}
                  disabled={page === 1}
                  className="px-2 py-1 text-xs border rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                >
                  ←
                </button>
                <span className="px-2 py-1 text-xs font-medium">
                  {page} / {pagination.total_pages}
                </span>
                <button
                  onClick={() => setPage(page + 1)}
                  disabled={page === pagination.total_pages}
                  className="px-2 py-1 text-xs border rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                >
                  →
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}