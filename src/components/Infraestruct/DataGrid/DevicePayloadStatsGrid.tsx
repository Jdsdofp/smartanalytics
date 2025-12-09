// src/components/DataGrid/DevicePayloadStatsGrid.tsx

import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import {
    ArrowPathIcon,
    SignalIcon,
    ClockIcon,
    ChartBarIcon,
    FunnelIcon,
    XMarkIcon,
    ArrowUpIcon,
    ArrowDownIcon,
    ArrowsUpDownIcon,
    ArrowDownTrayIcon,
} from '@heroicons/react/24/outline';
import { useCompany } from '../../../hooks/useCompany';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
//@ts-ignore
import autoTable from 'jspdf-autotable';

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
// 📥 COMPONENTE DE MENU DE EXPORTAÇÃO
// =====================================

const ExportMenu = ({ 
    data,
    //@ts-ignore
    hasFilters,
    loading,
    onExport 
}: { 
    data: DevicePayloadStats[];
    hasFilters: boolean;
    loading: boolean;
    onExport: (format: 'excel' | 'csv' | 'txt' | 'pdf', exportAll: boolean) => void;
}) => {
    const { t } = useTranslation();
    const [isOpen, setIsOpen] = useState(false);
    const [showScopeMenu, setShowScopeMenu] = useState(false);
    const [selectedFormat, setSelectedFormat] = useState<'excel' | 'csv' | 'txt' | 'pdf' | null>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
                setShowScopeMenu(false);
                setSelectedFormat(null);
            }
        };

        if (isOpen || showScopeMenu) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen, showScopeMenu]);

    const handleFormatSelect = (format: 'excel' | 'csv' | 'txt' | 'pdf') => {
        // SEMPRE mostrar o menu de escopo para o usuário escolher
        setSelectedFormat(format);
        setShowScopeMenu(true);
        setIsOpen(false);
    };

    const handleScopeSelect = (exportAll: boolean) => {
        if (selectedFormat) {
            onExport(selectedFormat, exportAll);
            setShowScopeMenu(false);
            setSelectedFormat(null);
        }
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                disabled={data.length === 0 || loading}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
                {loading ? (
                    <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span className="font-medium">{t('devicePayloadStats.export.exporting')}</span>
                    </>
                ) : (
                    <>
                        <ArrowDownTrayIcon className="h-4 w-4" />
                        <span className="font-medium">{t('devicePayloadStats.export.button')}</span>
                    </>
                )}
            </button>

            {/* Menu de Formatos */}
            {isOpen && (
                <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 z-50 overflow-hidden">
                    <div className="py-1">
                        <button
                            onClick={() => handleFormatSelect('excel')}
                            className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-green-50 hover:text-green-700 transition-colors flex items-center gap-2"
                        >
                            <span>📊</span>
                            <span>{t('devicePayloadStats.export.excel')}</span>
                        </button>
                        <button
                            onClick={() => handleFormatSelect('csv')}
                            className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-green-50 hover:text-green-700 transition-colors flex items-center gap-2"
                        >
                            <span>📄</span>
                            <span>{t('devicePayloadStats.export.csv')}</span>
                        </button>
                        <button
                            onClick={() => handleFormatSelect('txt')}
                            className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-green-50 hover:text-green-700 transition-colors flex items-center gap-2"
                        >
                            <span>📝</span>
                            <span>{t('devicePayloadStats.export.txt')}</span>
                        </button>
                        <button
                            onClick={() => handleFormatSelect('pdf')}
                            className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-green-50 hover:text-green-700 transition-colors flex items-center gap-2"
                        >
                            <span>📕</span>
                            <span>{t('devicePayloadStats.export.pdf')}</span>
                        </button>
                    </div>
                </div>
            )}

            {/* Menu de Escopo (Filtrado ou Tudo) */}
            {showScopeMenu && (
                <div className="absolute top-full right-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-200 z-50 overflow-hidden">
                    <div className="p-3 bg-gray-50 border-b border-gray-200">
                        <p className="text-xs font-medium text-gray-700">
                            {t('devicePayloadStats.export.selectScope')}
                        </p>
                    </div>
                    <div className="py-1">
                        <button
                            onClick={() => handleScopeSelect(false)}
                            className="w-full px-4 py-3 text-left hover:bg-blue-50 transition-colors border-b border-gray-100"
                        >
                            <div className="flex items-center gap-3">
                                <FunnelIcon className="h-5 w-5 text-blue-600 flex-shrink-0" />
                                <div>
                                    <p className="text-sm font-medium text-gray-900">
                                        {t('devicePayloadStats.export.exportFiltered')}
                                    </p>
                                    <p className="text-xs text-gray-500 mt-0.5">
                                        {t('devicePayloadStats.export.exportFilteredDesc', { count: data.length })}
                                    </p>
                                </div>
                            </div>
                        </button>
                        <button
                            onClick={() => handleScopeSelect(true)}
                            className="w-full px-4 py-3 text-left hover:bg-green-50 transition-colors"
                        >
                            <div className="flex items-center gap-3">
                                <SignalIcon className="h-5 w-5 text-green-600 flex-shrink-0" />
                                <div>
                                    <p className="text-sm font-medium text-gray-900">
                                        {t('devicePayloadStats.export.exportAll')}
                                    </p>
                                    <p className="text-xs text-gray-500 mt-0.5">
                                        {t('devicePayloadStats.export.exportAllDesc')}
                                    </p>
                                </div>
                            </div>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

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

    // Fechar ao clicar fora
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

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
                <div className="absolute top-full right-0 mt-2 w-[90vw] sm:w-[600px] bg-white rounded-lg shadow-xl border border-gray-200 z-50 max-h-[80vh] overflow-y-auto">
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
                                <option value="BLE_BEACON_SCAN_SHORT_ID">BLE</option>
                                <option value="GPS_TIMEOUT">TIMEOUT</option>
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
    const [exportLoading, setExportLoading] = useState(false);
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

    const fetchData = async (customLimit?: number) => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                page: page.toString(),
                limit: (customLimit || limit).toString(),
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
                `https://apinode.smartxhub.cloud/api/dashboard/devices/${companyId}/device-payloads?${params}`
            );
            const result = await response.json();

            setData(result.data || []);
            setPagination(result.pagination);
            return result.data || [];
        } catch (error) {
            console.error('Error fetching device payload stats:', error);
            return [];
        } finally {
            setLoading(false);
        }
    };

    // Buscar todos os dados sem paginação
    const fetchAllData = async () => {
        setExportLoading(true);
        try {
            const params = new URLSearchParams({
                page: '1',
                limit: '999999', // Buscar todos
                sortBy,
                sortOrder,
            });

            const response = await fetch(
                `https://apinode.smartxhub.cloud/api/dashboard/devices/${companyId}/device-payloads?${params}`
            );
            const result = await response.json();
            return result.data || [];
        } catch (error) {
            console.error('Error fetching all device payload stats:', error);
            return [];
        } finally {
            setExportLoading(false);
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

    // =====================================
    // 📥 FUNÇÕES DE EXPORTAÇÃO
    // =====================================
    
    const handleExport = async (format: 'excel' | 'csv' | 'txt' | 'pdf', exportAll: boolean) => {
        const timestamp = new Date().toISOString().split('T')[0];
        const scope = exportAll ? 'all' : 'filtered';
        const filename = `device_payload_stats_${scope}_${timestamp}`;

        // Buscar dados apropriados
        const exportData = exportAll ? await fetchAllData() : data;

        if (exportData.length === 0) {
            alert(t('devicePayloadStats.export.noData'));
            return;
        }

        switch (format) {
            case 'excel':
                exportToExcel(filename, exportData);
                break;
            case 'csv':
                exportToCSV(filename, exportData);
                break;
            case 'txt':
                exportToTXT(filename, exportData);
                break;
            case 'pdf':
                exportToPDF(filename, exportData);
                break;
        }
    };

    const exportToExcel = (filename: string, exportData: DevicePayloadStats[]) => {
        const worksheet = XLSX.utils.json_to_sheet(
            exportData.map(device => ({
                'Device EUI': device.dev_eui,
                'Nome do Objeto': device.object_name,
                'Total de Payloads': device.total_payloads,
                'Média por Hora': device.avg_per_hour,
                'Último Payload': new Date(device.Thinkpark_last_payload_time).toLocaleString('pt-BR'),
                'Tipo': device.last_payload_type,
                'Bateria (%)': device.last_reported_battery_level,
            }))
        );

        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Device Payloads');

        // Ajustar largura das colunas
        const maxWidth = exportData.reduce((w, r) => Math.max(w, r.dev_eui.length), 10);
        worksheet['!cols'] = [
            { wch: maxWidth },
            { wch: 20 },
            { wch: 15 },
            { wch: 15 },
            { wch: 20 },
            { wch: 10 },
            { wch: 12 }
        ];

        XLSX.writeFile(workbook, `${filename}.xlsx`);
    };

    const exportToCSV = (filename: string, exportData: DevicePayloadStats[]) => {
        const headers = [
            'Device EUI',
            'Nome do Objeto',
            'Total de Payloads',
            'Média por Hora',
            'Último Payload',
            'Tipo',
            'Bateria (%)'
        ];

        const csvContent = [
            headers.join(','),
            ...exportData.map(device =>
                [
                    device.dev_eui,
                    `"${device.object_name}"`,
                    device.total_payloads,
                    device.avg_per_hour,
                    `"${new Date(device.Thinkpark_last_payload_time).toLocaleString('pt-BR')}"`,
                    device.last_payload_type,
                    device.last_reported_battery_level
                ].join(',')
            )
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `${filename}.csv`;
        link.click();
    };

    const exportToTXT = (filename: string, exportData: DevicePayloadStats[]) => {
        const colWidths = {
            devEui: 20,
            objectName: 25,
            payloads: 12,
            avgHour: 12,
            lastPayload: 20,
            type: 12,
            battery: 10
        };

        const padRight = (str: string, width: number) => str.padEnd(width, ' ');
        const padLeft = (str: string, width: number) => str.padStart(width, ' ');

        const header = [
            padRight('Device EUI', colWidths.devEui),
            padRight('Nome do Objeto', colWidths.objectName),
            padLeft('Payloads', colWidths.payloads),
            padLeft('Média/Hora', colWidths.avgHour),
            padRight('Último Payload', colWidths.lastPayload),
            padRight('Tipo', colWidths.type),
            padLeft('Bateria', colWidths.battery)
        ].join(' | ');

        const separator = '='.repeat(header.length);

        const rows = exportData.map(device => {
            const lastPayload = new Date(device.Thinkpark_last_payload_time).toLocaleString('pt-BR');
            return [
                padRight(device.dev_eui.substring(0, colWidths.devEui), colWidths.devEui),
                padRight(device.object_name.substring(0, colWidths.objectName), colWidths.objectName),
                padLeft(device.total_payloads.toString(), colWidths.payloads),
                padLeft(device.avg_per_hour.toString(), colWidths.avgHour),
                padRight(lastPayload.substring(0, colWidths.lastPayload), colWidths.lastPayload),
                padRight(device.last_payload_type.substring(0, colWidths.type), colWidths.type),
                padLeft(`${device.last_reported_battery_level}%`, colWidths.battery)
            ].join(' | ');
        });

        const txtContent = [
            'ESTATÍSTICAS DE PAYLOADS DOS DISPOSITIVOS',
            `Gerado em: ${new Date().toLocaleString('pt-BR')}`,
            `Total de dispositivos: ${exportData.length}`,
            '',
            separator,
            header,
            separator,
            ...rows,
            separator
        ].join('\n');

        const blob = new Blob([txtContent], { type: 'text/plain;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `${filename}.txt`;
        link.click();
    };

    const exportToPDF = (filename: string, exportData: DevicePayloadStats[]) => {
        const doc = new jsPDF();
        
        // Título
        doc.setFontSize(16);
        doc.text('Estatísticas de Payloads dos Dispositivos', 14, 15);
        
        // Info
        doc.setFontSize(10);
        doc.text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, 14, 22);
        doc.text(`Total de dispositivos: ${exportData.length}`, 14, 27);

        // Tabela
        autoTable(doc, {
            startY: 32,
            head: [['Device EUI', 'Objeto', 'Payloads', 'Média/h', 'Último Payload', 'Tipo', 'Bat.']],
            body: exportData.map(device => [
                device.dev_eui,
                device.object_name,
                device.total_payloads,
                device.avg_per_hour,
                new Date(device.Thinkpark_last_payload_time).toLocaleDateString('pt-BR'),
                device.last_payload_type,
                `${device.last_reported_battery_level}%`
            ]),
            styles: { 
                fontSize: 8,
                cellPadding: 2,
            },
            headStyles: {
                fillColor: [59, 130, 246],
                textColor: 255,
                fontStyle: 'bold'
            },
            columnStyles: {
                0: { cellWidth: 35 },
                1: { cellWidth: 35 },
                2: { cellWidth: 20, halign: 'right' },
                3: { cellWidth: 20, halign: 'right' },
                4: { cellWidth: 30 },
                5: { cellWidth: 25 },
                6: { cellWidth: 15, halign: 'right' }
            }
        });

        doc.save(`${filename}.pdf`);
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
                    <ExportMenu 
                        data={data}
                        hasFilters={getActiveFiltersCount() > 0}
                        loading={exportLoading}
                        onExport={handleExport}
                    />

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
                        onClick={() => fetchData()}
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

                        {/* Bateria Horizontal Premium */}
                        <div className="relative h-16 w-28 flex items-center">
                            {/* Sombra da bateria */}
                            <div className="absolute inset-0 bg-yellow-900 opacity-10 blur-sm rounded-lg transform translate-y-1"></div>

                            {/* Corpo Principal */}
                            <div className="relative w-24 h-12 border-[3px] border-yellow-700 rounded-lg overflow-hidden bg-gradient-to-b from-gray-50 to-white shadow-md">
                                {/* Preenchimento animado */}
                                <div
                                    className={`absolute left-0 top-0 bottom-0 transition-all duration-700 ease-out ${data.length > 0 &&
                                            Math.round(
                                                data
                                                    .map((d) => Number(d.last_reported_battery_level) || 0)
                                                    .reduce((sum, level) => sum + level, 0) / data.length
                                            ) >= 50
                                            ? 'bg-gradient-to-r from-green-600 via-green-400 to-green-300'
                                            : data.length > 0 &&
                                                Math.round(
                                                    data
                                                        .map((d) => Number(d.last_reported_battery_level) || 0)
                                                        .reduce((sum, level) => sum + level, 0) / data.length
                                                ) >= 20
                                                ? 'bg-gradient-to-r from-yellow-600 via-yellow-400 to-yellow-300'
                                                : 'bg-gradient-to-r from-red-600 via-red-400 to-red-300'
                                        }`}
                                    style={{
                                        width: `${data.length > 0
                                                ? Math.round(
                                                    data
                                                        .map((d) => Number(d.last_reported_battery_level) || 0)
                                                        .reduce((sum, level) => sum + level, 0) / data.length
                                                )
                                                : 0
                                            }%`
                                    }}
                                >
                                    {/* Reflexo/Brilho */}
                                    <div className="absolute inset-0 bg-gradient-to-b from-white via-transparent to-transparent opacity-40"></div>

                                    {/* Animação de pulso quando crítico */}
                                    {data.length > 0 &&
                                        Math.round(
                                            data
                                                .map((d) => Number(d.last_reported_battery_level) || 0)
                                                .reduce((sum, level) => sum + level, 0) / data.length
                                        ) < 20 && (
                                            <div className="absolute inset-0 bg-red-500 animate-pulse opacity-30"></div>
                                        )}
                                </div>

                                {/* Marcadores de nível */}
                                <div className="absolute inset-y-1 left-1/4 w-px bg-gray-400 opacity-20"></div>
                                <div className="absolute inset-y-1 left-1/2 w-px bg-gray-400 opacity-20"></div>
                                <div className="absolute inset-y-1 left-3/4 w-px bg-gray-400 opacity-20"></div>
                            </div>

                            {/* Terminal Positivo (Polo) */}
                            <div className="absolute -right-1 w-2 h-7 bg-yellow-700 rounded-r-md shadow-sm border-l-2 border-yellow-800"></div>

                            {/* Ícone de alerta quando crítico */}
                            {data.length > 0 &&
                                Math.round(
                                    data
                                        .map((d) => Number(d.last_reported_battery_level) || 0)
                                        .reduce((sum, level) => sum + level, 0) / data.length
                                ) < 20 && (
                                    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                                        <svg className="w-6 h-6 text-white drop-shadow-lg animate-pulse" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                )}
                        </div>
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
                                                        className={`inline-flex px-1.5 py-0.5 rounded-full text-[9px] font-medium ${device.last_payload_type === 'GPS'
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
                                                                className={`h-1.5 rounded-full transition-all ${device.last_reported_battery_level >= 30
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