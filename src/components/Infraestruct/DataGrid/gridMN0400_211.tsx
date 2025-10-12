// src/components/RawDataExplorer.tsx
import { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import * as XLSX from 'xlsx';

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
    const { t } = useTranslation();
    const [showFilters, setShowFilters] = useState(false);

    return (
        <div className="bg-white border-b border-gray-200">
            <div className="px-6 py-4">
                <div className="mb-4">
                    <div className="relative">
                        <input
                            type="text"
                            value={activeFilters.search_text || ''}
                            onChange={(e) => onFilterChange('search_text', e.target.value)}
                            placeholder={t('rawDataExplorer.filters.globalSearchPlaceholder')}
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
                        {t('rawDataExplorer.filters.globalSearchHint')}
                    </p>
                </div>

                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                        >
                            <FunnelIcon className="h-5 w-5" />
                            {t('rawDataExplorer.filters.advancedFilters')}
                            {Object.keys(activeFilters).filter(key => key !== 'search_text').length > 0 && (
                                <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-blue-600 rounded-full">
                                    {Object.keys(activeFilters).filter(key => key !== 'search_text').length}
                                </span>
                            )}
                        </button>

                        <div className="text-sm text-gray-600">
                            💡 <strong>{t('rawDataExplorer.filters.tip')}:</strong> {t('rawDataExplorer.filters.tipMessage')}
                        </div>
                    </div>

                    {Object.keys(activeFilters).length > 0 && (
                        <button
                            onClick={onClearFilters}
                            className="text-sm text-gray-600 hover:text-gray-900"
                        >
                            {t('rawDataExplorer.filters.clearGlobalFilters')}
                        </button>
                    )}
                </div>

                {showFilters && (
                    <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filters.map((filter) => (
                            <div key={filter.key}>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    {t(`rawDataExplorer.filters.fields.${filter.key}`, filter.label)}
                                </label>
                                {filter.type === 'text' && (
                                    <input
                                        type="text"
                                        value={activeFilters[filter.key] || ''}
                                        onChange={(e) => onFilterChange(filter.key, e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                        placeholder={t('rawDataExplorer.filters.filterBy', { field: t(`rawDataExplorer.filters.fields.${filter.key}`, filter.label).toLowerCase() })}
                                    />
                                )}
                                {filter.type === 'select' && (
                                    <select
                                        value={activeFilters[filter.key] || ''}
                                        onChange={(e) => onFilterChange(filter.key, e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                    >
                                        <option value="">{t('rawDataExplorer.filters.all')}</option>
                                        {filter.options?.map((opt) => (
                                            <option key={opt.value} value={opt.value}>
                                                {t(`rawDataExplorer.filters.options.${opt.value}`, opt.label)}
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
                                        placeholder={t(`rawDataExplorer.filters.fields.${filter.key}`, filter.label)}
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
const ActiveFilters: React.FC<ActiveFiltersProps> = ({ filters, onRemove }) => {
    const { t } = useTranslation();
    
    if (Object.keys(filters).length === 0) return null;

    return (
        <div className="px-6 py-3 bg-gray-50 border-b border-gray-200">
            <div className="flex flex-wrap gap-2">
                <span className="text-sm text-gray-500">{t('rawDataExplorer.activeFilters')}:</span>
                {Object.entries(filters).map(([key, value]) => (
                    <span
                        key={key}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                    >
                        <span className="font-medium">{key}:</span>
                        <span>{value}</span>
                        <button onClick={() => onRemove(key)} className="ml-1 hover:text-blue-900">
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
    const { t } = useTranslation();
    const startRecord = (currentPage - 1) * perPage + 1;
    const endRecord = Math.min(currentPage * perPage, totalRecords);

    return (
        <div className="bg-white px-6 py-4 border-t border-gray-200">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <span className="text-sm text-gray-700">
                        {t('rawDataExplorer.pagination.showing', { start: startRecord, end: endRecord, total: totalRecords })}
                    </span>
                    <select
                        value={perPage}
                        onChange={(e) => onPerPageChange(Number(e.target.value))}
                        className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
                    >
                        <option value={25}>{t('rawDataExplorer.pagination.perPage', { count: 25 })}</option>
                        <option value={50}>{t('rawDataExplorer.pagination.perPage', { count: 50 })}</option>
                        <option value={100}>{t('rawDataExplorer.pagination.perPage', { count: 100 })}</option>
                        <option value={200}>{t('rawDataExplorer.pagination.perPage', { count: 200 })}</option>
                    </select>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={() => onPageChange(1)}
                        disabled={currentPage === 1}
                        className="px-3 py-1 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {t('rawDataExplorer.pagination.first')}
                    </button>
                    <button
                        onClick={() => onPageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="px-3 py-1 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {t('rawDataExplorer.pagination.previous')}
                    </button>

                    <span className="px-4 py-1 text-sm text-gray-700">
                        {t('rawDataExplorer.pagination.pageOf', { current: currentPage, total: totalPages })}
                    </span>

                    <button
                        onClick={() => onPageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="px-3 py-1 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {t('rawDataExplorer.pagination.next')}
                    </button>
                    <button
                        onClick={() => onPageChange(totalPages)}
                        disabled={currentPage === totalPages}
                        className="px-3 py-1 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {t('rawDataExplorer.pagination.last')}
                    </button>
                </div>
            </div>
        </div>
    );
};

// Data Table Component
const DataTable: React.FC<DataTableProps> = ({
    data,
    loading,
    onColumnFiltersChange,
    currentColumnFilters
}) => {
    const { t } = useTranslation();
    const [localColumnFilters, setLocalColumnFilters] = useState<Record<string, string>>({});

    useEffect(() => {
        setLocalColumnFilters(currentColumnFilters);
    }, [currentColumnFilters]);

    const columns = data.length > 0 ? Object.keys(data[0]) : [];

    const locallyFilteredData = useMemo(() => {
        if (data.length === 0) return [];
        let result = [...data];
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

    const handleColumnFilterChange = (column: string, value: string) => {
        setLocalColumnFilters(prev => {
            const newFilters = { ...prev };
            if (!value.trim()) {
                delete newFilters[column];
            } else {
                newFilters[column] = value;
            }
            return newFilters;
        });

        setTimeout(() => {
            const newFilters = { ...currentColumnFilters };
            if (!value.trim()) {
                delete newFilters[column];
            } else {
                newFilters[column] = value;
            }
            onColumnFiltersChange(newFilters);
        }, 800);
    };

    const clearAllColumnFilters = () => {
        setLocalColumnFilters({});
        onColumnFiltersChange({});
    };

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
                <p className="text-gray-500">{t('rawDataExplorer.table.noRecords')}</p>
            </div>
        );
    }

    return (
        <div className="overflow-x-auto overflow-y-auto max-h-[600px]">
            {Object.keys(localColumnFilters).length > 0 && (
                <div className="px-6 py-2 bg-blue-50 border-b border-blue-200">
                    <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                            <span className="text-blue-700 font-medium">
                                🔍 {t('rawDataExplorer.table.activeFilters', { count: Object.keys(localColumnFilters).length })}
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
                            {t('rawDataExplorer.table.clearAllFilters')}
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
                                    <div className="flex items-center justify-between">
                                        <span className="font-semibold">{col}</span>
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
                                    <div className="relative">
                                        <input
                                            type="text"
                                            placeholder={t('rawDataExplorer.table.filterColumn', { column: col })}
                                            value={localColumnFilters[col] || ''}
                                            onChange={(e) => handleColumnFilterChange(col, e.target.value)}
                                            onClick={(e) => e.stopPropagation()}
                                            className="w-full px-2 py-1 text-xs text-gray-700 bg-white border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 normal-case font-normal"
                                        />
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

            <div className="px-6 py-3 bg-gray-50 border-t border-gray-200 text-xs text-gray-500">
                <div className="flex items-center justify-between">
                    <span>
                        {Object.keys(localColumnFilters).length > 0 ? (
                            <>
                                📊 {t('rawDataExplorer.table.showingRecords', { count: locallyFilteredData.length })}
                                <span className="text-blue-600 ml-1">
                                    ({t('rawDataExplorer.table.filteredLocally')})
                                </span>
                            </>
                        ) : (
                            `📊 ${t('rawDataExplorer.table.showingRecords', { count: data.length })}`
                        )}
                    </span>
                </div>
            </div>
        </div>
    );
};

// =====================================
// 🎯 COMPONENTE PRINCIPAL
// =====================================

const RawDataExplorer: React.FC = () => {
    const { t } = useTranslation();
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

    const tableConfigs: Record<string, TableConfig> = {
        gps: {
            id: 'gps',
            label: t('rawDataExplorer.tabs.gps'),
            icon: '📍',
            endpoint: '/api/dashboard/devices/raw/gps-reports',
            exportTable: 'device_gps_report_monitoring',
            columns: [],
            filters: [
                { key: 'dev_eui', label: t('rawDataExplorer.filters.fields.dev_eui'), type: 'text' },
                { key: 'customer_name', label: t('rawDataExplorer.filters.fields.customer_name'), type: 'text' },
                { key: 'start_date', label: t('rawDataExplorer.filters.fields.start_date'), type: 'date' },
                { key: 'end_date', label: t('rawDataExplorer.filters.fields.end_date'), type: 'date' },
            ],
        },
        events: {
            id: 'events',
            label: t('rawDataExplorer.tabs.events'),
            icon: '🚨',
            endpoint: '/api/dashboard/devices/raw/events',
            exportTable: 'device_events_management',
            columns: [],
            filters: [
                { key: 'dev_eui', label: t('rawDataExplorer.filters.fields.dev_eui'), type: 'text' },
                { key: 'customer_name', label: t('rawDataExplorer.filters.fields.customer_name'), type: 'text' },
                { key: 'start_date', label: t('rawDataExplorer.filters.fields.start_date'), type: 'date' },
                { key: 'end_date', label: t('rawDataExplorer.filters.fields.end_date'), type: 'date' },
            ],
        },
        scanning: {
            id: 'scanning',
            label: t('rawDataExplorer.tabs.scanning'),
            icon: '📡',
            endpoint: '/api/dashboard/devices/raw/scanning',
            exportTable: 'device_scanning_monitoring',
            columns: [],
            filters: [
                { key: 'dev_eui', label: t('rawDataExplorer.filters.fields.dev_eui'), type: 'text' },
                { key: 'customer_name', label: t('rawDataExplorer.filters.fields.customer_name'), type: 'text' },
                { key: 'start_date', label: t('rawDataExplorer.filters.fields.start_date'), type: 'date' },
                { key: 'end_date', label: t('rawDataExplorer.filters.fields.end_date'), type: 'date' },
            ],
        },
        configuration: {
            id: 'configuration',
            label: t('rawDataExplorer.tabs.configuration'),
            icon: '⚙️',
            endpoint: '/api/dashboard/devices/raw/configuration',
            exportTable: 'device_configuration_management',
            columns: [],
            filters: [
                { key: 'dev_eui', label: t('rawDataExplorer.filters.fields.dev_eui'), type: 'text' },
                { key: 'customer_name', label: t('rawDataExplorer.filters.fields.customer_name'), type: 'text' },
                { key: 'start_date', label: t('rawDataExplorer.filters.fields.start_date'), type: 'date' },
                { key: 'end_date', label: t('rawDataExplorer.filters.fields.end_date'), type: 'date' },
            ],
        },
        errors: {
            id: 'errors',
            label: t('rawDataExplorer.tabs.errors'),
            icon: '❌',
            endpoint: '/api/dashboard/devices/raw/gps-errors',
            exportTable: 'device_gps_error_management',
            columns: [],
            filters: [
                { key: 'dev_eui', label: t('rawDataExplorer.filters.fields.dev_eui'), type: 'text' },
                { key: 'customer_name', label: t('rawDataExplorer.filters.fields.customer_name'), type: 'text' },
                { key: 'start_date', label: t('rawDataExplorer.filters.fields.start_date'), type: 'date' },
                { key: 'end_date', label: t('rawDataExplorer.filters.fields.end_date'), type: 'date' },
            ],
        },
    };

    const currentConfig = tableConfigs[activeTab];

    const fetchData = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                page: pagination.current_page.toString(),
                limit: pagination.per_page.toString(),
                ...filters,
            });

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

    const handleExportLocal = async (format: 'json' | 'csv' | 'xlsx') => {
        setExporting(true);
        try {
            const params = new URLSearchParams({
                ...filters,
                page: '1',
                limit: '999999',
            });

            if (Object.keys(columnFilters).length > 0) {
                params.append('column_filters', JSON.stringify(columnFilters));
            }

            const response = await fetch(`https://api-dashboards-u1oh.onrender.com${currentConfig.endpoint}?${params}`);
            const result: PaginatedResponse = await response.json();
            
            const exportData = result.data;
            const timestamp = new Date().toISOString().split('T')[0];
            const filename = `${currentConfig.exportTable}_${timestamp}`;

            if (format === 'json') {
                const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
                const link = document.createElement('a');
                link.href = window.URL.createObjectURL(blob);
                link.download = `${filename}.json`;
                link.click();
            } 
            else if (format === 'csv') {
                const ws = XLSX.utils.json_to_sheet(exportData);
                const csv = XLSX.utils.sheet_to_csv(ws);
                const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
                const link = document.createElement('a');
                link.href = window.URL.createObjectURL(blob);
                link.download = `${filename}.csv`;
                link.click();
            }
            else if (format === 'xlsx') {
                const ws = XLSX.utils.json_to_sheet(exportData);
                
                const colWidths = Object.keys(exportData[0] || {}).map(key => {
                    const maxLength = Math.max(
                        key.length,
                        ...exportData.map(row => String(row[key] || '').length)
                    );
                    return { wch: Math.min(maxLength + 2, 50) };
                });
                ws['!cols'] = colWidths;

                const wb = XLSX.utils.book_new();
                XLSX.utils.book_append_sheet(wb, ws, currentConfig.label);
                
                wb.Props = {
                    Title: `${currentConfig.label} - ${t('rawDataExplorer.export.rawData')}`,
                    Subject: t('rawDataExplorer.export.dataExport'),
                    Author: t('rawDataExplorer.export.monitoringSystem'),
                    CreatedDate: new Date()
                };

                XLSX.writeFile(wb, `${filename}.xlsx`);
            }

            alert(t('rawDataExplorer.export.success', { count: exportData.length }));
        } catch (error) {
            console.error('Error exporting data:', error);
            alert(t('rawDataExplorer.export.error'));
        } finally {
            setExporting(false);
        }
    };

    const handleColumnFiltersChange = (filters: Record<string, string>) => {
        setColumnFilters(filters);
        setPagination(prev => ({ ...prev, current_page: 1 }));
    };

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

    useEffect(() => {
        fetchData();
    }, [activeTab, pagination.current_page, pagination.per_page, filters, columnFilters]);

    return (
        <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-4 sm:px-6 py-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <h2 className="text-xl sm:text-2xl font-bold text-white whitespace-nowrap">
                        📊 {t('rawDataExplorer.title')}
                    </h2>
                    <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                        <button
                            onClick={fetchData}
                            disabled={loading}
                            className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 text-sm font-medium text-white bg-white/20 hover:bg-white/30 rounded-md transition-colors disabled:opacity-50"
                        >
                            <ArrowPathIcon className={`h-4 w-4 sm:h-5 sm:w-5 ${loading ? 'animate-spin' : ''}`} />
                            <span className="hidden sm:inline">{t('rawDataExplorer.refresh')}</span>
                        </button>
                        <div className="relative group">
                            <button
                                className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 text-sm font-medium text-white bg-white/20 hover:bg-white/30 rounded-md transition-colors"
                                disabled={exporting}
                            >
                                <ArrowDownTrayIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                                <span className="hidden sm:inline">
                                    {exporting ? t('rawDataExplorer.export.exporting') : t('rawDataExplorer.export.export')}
                                </span>
                            </button>
                            <div className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-xl z-10 hidden group-hover:block border border-gray-200">
                                <div className="py-1">
                                    <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase border-b border-gray-200">
                                        📊 {t('rawDataExplorer.export.localExport')}
                                    </div>
                                    <button
                                        onClick={() => handleExportLocal('xlsx')}
                                        disabled={exporting || data.length === 0}
                                        className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-green-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        <span className="mr-2">📗</span>
                                        <div>
                                            <div className="font-medium">{t('rawDataExplorer.export.formats.excel')}</div>
                                            <div className="text-xs text-gray-500">{t('rawDataExplorer.export.formats.excelDesc')}</div>
                                        </div>
                                    </button>
                                    <button
                                        onClick={() => handleExportLocal('csv')}
                                        disabled={exporting || data.length === 0}
                                        className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        <span className="mr-2">📄</span>
                                        <div>
                                            <div className="font-medium">{t('rawDataExplorer.export.formats.csv')}</div>
                                            <div className="text-xs text-gray-500">{t('rawDataExplorer.export.formats.csvDesc')}</div>
                                        </div>
                                    </button>
                                    <button
                                        onClick={() => handleExportLocal('json')}
                                        disabled={exporting || data.length === 0}
                                        className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-purple-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        <span className="mr-2">📋</span>
                                        <div>
                                            <div className="font-medium">{t('rawDataExplorer.export.formats.json')}</div>
                                            <div className="text-xs text-gray-500">{t('rawDataExplorer.export.formats.jsonDesc')}</div>
                                        </div>
                                    </button>
                                </div>
                                
                                {data.length > 0 && (
                                    <div className="px-4 py-2 text-xs text-gray-500 border-t border-gray-200 bg-gray-50">
                                        💡 {t('rawDataExplorer.export.availableRecords', { count: pagination.total_records })}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="border-b border-gray-200 bg-gray-50 overflow-x-auto">
                <nav className="flex space-x-2 sm:space-x-4 px-4 sm:px-6 min-w-max">
                    {Object.values(tableConfigs).map((config) => (
                        <button
                            key={config.id}
                            onClick={() => {
                                setActiveTab(config.id);
                                setFilters({});
                                setPagination(prev => ({ ...prev, current_page: 1 }));
                            }}
                            className={`
                                flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 sm:py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap
                                ${activeTab === config.id
                                    ? 'border-blue-600 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }
                            `}
                        >
                            <span className="text-base sm:text-lg">{config.icon}</span>
                            {config.label}
                        </button>
                    ))}
                </nav>
            </div>

            <FilterBar
                filters={currentConfig.filters}
                activeFilters={filters}
                onFilterChange={handleFilterChange}
                onClearFilters={handleClearFilters}
            />

            <ActiveFilters
                filters={filters}
                onRemove={(key) => handleFilterChange(key, '')}
            />

            <DataTable
                data={data}
                loading={loading}
                onColumnFiltersChange={handleColumnFiltersChange}
                currentColumnFilters={columnFilters}
            />

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