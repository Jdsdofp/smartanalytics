// src/components/AssetManagement/AssetExportSystem.tsx
import { useState, useMemo } from 'react';
import {
  ArrowDownTrayIcon,
  DocumentArrowDownIcon,
  MapPinIcon,
  CurrencyDollarIcon,
  CubeIcon,
  BanknotesIcon,
  ShieldCheckIcon,
  WrenchScrewdriverIcon,
  ClipboardDocumentCheckIcon,
  ServerIcon,
  ChartBarIcon,
  DocumentTextIcon,
  MapIcon,
  CheckCircleIcon,
  MagnifyingGlassIcon,
  Squares2X2Icon,
  ListBulletIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import * as XLSX from 'xlsx';
import { useCompany } from '../../hooks/useCompany';

// =====================================
// 📋 INTERFACES
// =====================================

interface ExportTemplate {
  id: string;
  icon: any;
  title: string;
  description: string;
  endpoint: string;
  iconColor: string;
  bgColor: string;
  category: string;
}

type ViewMode = 'cards' | 'list';

// =====================================
// 🎨 CATEGORIES
// =====================================

const CATEGORIES = [
  { id: 'all', label: 'Todos' },
  { id: 'location', label: 'Localização' },
  { id: 'financial', label: 'Financeiro' },
  { id: 'asset', label: 'Ativos' },
  { id: 'tracking', label: 'Rastreamento' },
  { id: 'compliance', label: 'Conformidade' },
  { id: 'integration', label: 'Integração' },
];

// =====================================
// 🎨 EXPORT TEMPLATES (Complete primeiro)
// =====================================

const EXPORT_TEMPLATES: ExportTemplate[] = [
  {
    id: 'asset_complete',
    icon: DocumentArrowDownIcon,
    title: 'Complete Inventory',
    description: 'Comprehensive export with all key fields',
    endpoint: 'asset_complete',
    iconColor: 'text-gray-700',
    bgColor: 'bg-gray-50 hover:bg-gray-100',
    category: 'asset',
  },
  {
    id: 'asset_locations',
    icon: MapPinIcon,
    title: 'Asset Locations',
    description: 'GPS coordinates, zones, sites, and area assignments',
    endpoint: 'asset_locations',
    iconColor: 'text-blue-600',
    bgColor: 'bg-blue-50 hover:bg-blue-100',
    category: 'location',
  },
  {
    id: 'asset_purchase',
    icon: CurrencyDollarIcon,
    title: 'Purchase Information',
    description: 'Costs, suppliers, PO numbers, and purchase dates',
    endpoint: 'asset_purchase',
    iconColor: 'text-green-600',
    bgColor: 'bg-green-50 hover:bg-green-100',
    category: 'financial',
  },
  {
    id: 'asset_properties',
    icon: CubeIcon,
    title: 'Asset Properties',
    description: 'Brand, model, serial, and 20+ custom fields',
    endpoint: 'asset_properties',
    iconColor: 'text-purple-600',
    bgColor: 'bg-purple-50 hover:bg-purple-100',
    category: 'asset',
  },
  {
    id: 'asset_financial',
    icon: BanknotesIcon,
    title: 'Financial Data',
    description: 'Depreciation, cost centers, net book value',
    endpoint: 'asset_financial',
    iconColor: 'text-emerald-600',
    bgColor: 'bg-emerald-50 hover:bg-emerald-100',
    category: 'financial',
  },
  {
    id: 'asset_insurance',
    icon: ShieldCheckIcon,
    title: 'Insurance Coverage',
    description: 'Policies, coverage dates, insurance companies',
    endpoint: 'asset_insurance',
    iconColor: 'text-indigo-600',
    bgColor: 'bg-indigo-50 hover:bg-indigo-100',
    category: 'compliance',
  },
  {
    id: 'asset_warranty',
    icon: WrenchScrewdriverIcon,
    title: 'Warranty & Maintenance',
    description: 'Warranty periods, schedules, work orders',
    endpoint: 'asset_warranty',
    iconColor: 'text-orange-600',
    bgColor: 'bg-orange-50 hover:bg-orange-100',
    category: 'compliance',
  },
  {
    id: 'asset_custody',
    icon: ClipboardDocumentCheckIcon,
    title: 'Custody & Ownership',
    description: 'Ownership, department assignments, responsibility',
    endpoint: 'asset_custody',
    iconColor: 'text-cyan-600',
    bgColor: 'bg-cyan-50 hover:bg-cyan-100',
    category: 'compliance',
  },
  {
    id: 'asset_sap',
    icon: ServerIcon,
    title: 'SAP Integration',
    description: 'Material documents, lots, SAP tracking data',
    endpoint: 'asset_sap',
    iconColor: 'text-blue-700',
    bgColor: 'bg-blue-50 hover:bg-blue-100',
    category: 'integration',
  },
  {
    id: 'asset_audit',
    icon: ChartBarIcon,
    title: 'Audit Status',
    description: 'Cycle counts, verification, audit tracking',
    endpoint: 'asset_audit',
    iconColor: 'text-pink-600',
    bgColor: 'bg-pink-50 hover:bg-pink-100',
    category: 'compliance',
  },
  {
    id: 'asset_tracking',
    icon: MapIcon,
    title: 'RFID Tracking',
    description: 'RFID reads, antenna data, GPS positioning',
    endpoint: 'asset_tracking',
    iconColor: 'text-teal-600',
    bgColor: 'bg-teal-50 hover:bg-teal-100',
    category: 'tracking',
  },
  {
    id: 'asset_alarm',
    icon: DocumentTextIcon,
    title: 'Alarm Events',
    description: 'Alarm events, mustering, emergency response',
    endpoint: 'asset_alarm',
    iconColor: 'text-red-600',
    bgColor: 'bg-red-50 hover:bg-red-100',
    category: 'tracking',
  },
];

// =====================================
// 🎯 COMPONENT
// =====================================

export default function AssetExportSystem() {
  const { companyId } = useCompany();
  const [exportStatus, setExportStatus] = useState<{ [key: string]: 'idle' | 'exporting' | 'completed' }>({});
  const [completed, setCompleted] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [viewMode, setViewMode] = useState<ViewMode>('cards');

  // Filtered templates
  const filteredTemplates = useMemo(() => {
    return EXPORT_TEMPLATES.filter((t) => {
      const matchesSearch =
        search.trim() === '' ||
        t.title.toLowerCase().includes(search.toLowerCase()) ||
        t.description.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = activeCategory === 'all' || t.category === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [search, activeCategory]);

  // Handle export
  const handleExport = async (template: ExportTemplate) => {
    const { id, endpoint, title } = template;
    try {
      setExportStatus((prev) => ({ ...prev, [id]: 'exporting' }));

      const response = await fetch(
        `https://apinode.smartxhub.cloud/api/dashboard/asset/${companyId}/export/${endpoint}`
      );

      if (!response.ok) throw new Error(`Export failed: ${response.statusText}`);

      const result = await response.json();

      if (!result.success || !result.data || result.data.length === 0) {
        alert(`No data found for ${title}`);
        setExportStatus((prev) => ({ ...prev, [id]: 'idle' }));
        return;
      }

      const worksheet = XLSX.utils.json_to_sheet(result.data);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Assets');

      const timestamp = new Date().toISOString().split('T')[0];
      const filename = `${endpoint}_${timestamp}.xlsx`;
      XLSX.writeFile(workbook, filename);

      setCompleted((prev) => new Set([...prev, id]));
      setExportStatus((prev) => ({ ...prev, [id]: 'completed' }));

      setTimeout(() => {
        setExportStatus((prev) => ({ ...prev, [id]: 'idle' }));
      }, 3000);
    } catch (error) {
      console.error('Export error:', error);
      alert(`Export failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setExportStatus((prev) => ({ ...prev, [id]: 'idle' }));
    }
  };

  // Shared button renderer
  const renderButton = (template: ExportTemplate, compact = false) => {
    const status = exportStatus[template.id] || 'idle';
    return (
      <button
        onClick={() => handleExport(template)}
        disabled={status === 'exporting'}
        className={`
          ${compact ? 'py-1.5 px-3 text-xs' : 'py-2.5 px-4 text-sm'}
          rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-1.5 whitespace-nowrap
          ${status === 'exporting'
            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
            : status === 'completed'
            ? 'bg-green-500 text-white hover:bg-green-600'
            : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700'
          }
        `}
      >
        {status === 'exporting' ? (
          <>
            <svg className="animate-spin h-3.5 w-3.5" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <span>Exportando...</span>
          </>
        ) : status === 'completed' ? (
          <>
            <CheckCircleIcon className="w-4 h-4" />
            <span>Exportado!</span>
          </>
        ) : (
          <>
            <ArrowDownTrayIcon className="w-4 h-4" />
            <span>{compact ? 'Exportar' : 'Export to Excel'}</span>
          </>
        )}
      </button>
    );
  };

  return (
    <div className="space-y-5">

      {/* Header */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
            <ArrowDownTrayIcon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">Asset Data Export System</h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              Exporte seus dados em formato Excel. Todos os exports são filtrados pela empresa ID ({companyId}) 
              e excluem registros deletados logicamente.
            </p>
          </div>
        </div>
      </div>

      {/* Search + View Toggle bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar export... (ex: localização, SAP, RFID...)"
            className="w-full pl-9 pr-9 py-2.5 rounded-xl border border-gray-200 bg-white text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <XMarkIcon className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center bg-gray-100 rounded-xl p-1 gap-1 self-start sm:self-auto">
          <button
            onClick={() => setViewMode('cards')}
            title="Visualização em cards"
            className={`p-2 rounded-lg transition-all duration-200 ${
              viewMode === 'cards'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Squares2X2Icon className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            title="Visualização em lista"
            className={`p-2 rounded-lg transition-all duration-200 ${
              viewMode === 'list'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <ListBulletIcon className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {CATEGORIES.map((cat) => {
          const count = cat.id === 'all'
            ? EXPORT_TEMPLATES.length
            : EXPORT_TEMPLATES.filter((t) => t.category === cat.id).length;

          return (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`
                flex-shrink-0 flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-sm font-medium
                transition-all duration-200 border
                ${activeCategory === cat.id
                  ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                  : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50 hover:border-gray-300'
                }
              `}
            >
              {cat.label}
              <span
                className={`
                  text-xs rounded-full px-1.5 py-0.5 font-semibold
                  ${activeCategory === cat.id ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-500'}
                `}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Results count */}
      {(search || activeCategory !== 'all') && (
        <p className="text-xs text-gray-500">
          {filteredTemplates.length === 0
            ? 'Nenhum resultado encontrado.'
            : `${filteredTemplates.length} export${filteredTemplates.length !== 1 ? 's' : ''} encontrado${filteredTemplates.length !== 1 ? 's' : ''}`}
          {search && (
            <> para <span className="font-medium text-gray-700">"{search}"</span></>
          )}
        </p>
      )}

      {/* Empty state */}
      {filteredTemplates.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <MagnifyingGlassIcon className="w-10 h-10 text-gray-300 mb-3" />
          <p className="text-gray-500 text-sm font-medium">Nenhum export encontrado</p>
          <p className="text-gray-400 text-xs mt-1">Tente outro termo ou categoria</p>
          <button
            onClick={() => { setSearch(''); setActiveCategory('all'); }}
            className="mt-4 text-blue-600 text-sm hover:underline"
          >
            Limpar filtros
          </button>
        </div>
      )}

      {/* === CARD VIEW === */}
      {viewMode === 'cards' && filteredTemplates.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTemplates.map((template) => {
            const Icon = template.icon;
            const status = exportStatus[template.id] || 'idle';
            const isCompleted = completed.has(template.id);
            const isFirst = template.id === 'asset_complete';

            return (
              <div
                key={template.id}
                className={`
                  relative bg-white rounded-xl p-5 border transition-all duration-300 
                  hover:shadow-lg hover:-translate-y-1
                  ${isFirst ? 'border-blue-200 ring-1 ring-blue-100' : 'border-gray-200'}
                  ${status === 'exporting' ? 'ring-2 ring-blue-500 ring-offset-2' : ''}
                `}
              >
                {/* "Completo" badge no primeiro card */}
                {isFirst && (
                  <span className="absolute top-3 right-3 bg-blue-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide">
                    Completo
                  </span>
                )}

                {/* Ícone */}
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-3 ${template.bgColor.split(' ')[0]}`}>
                  <Icon className={`w-6 h-6 ${template.iconColor}`} />
                </div>

                {/* Title + Description */}
                <h4 className="text-base font-semibold text-gray-900 mb-1">{template.title}</h4>
                <p className="text-sm text-gray-500 mb-4 line-clamp-2">{template.description}</p>

                {/* Button */}
                <div className="w-full">{renderButton(template)}</div>

                {/* Completed indicator */}
                {isCompleted && status === 'idle' && !isFirst && (
                  <div className="absolute top-3 right-3">
                    <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                      <CheckCircleIcon className="w-4 h-4 text-green-600" />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* === LIST VIEW === */}
      {viewMode === 'list' && filteredTemplates.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden divide-y divide-gray-100">
          {filteredTemplates.map((template) => {
            const Icon = template.icon;
            const status = exportStatus[template.id] || 'idle';
            const isCompleted = completed.has(template.id);
            const isFirst = template.id === 'asset_complete';

            return (
              <div
                key={template.id}
                className={`
                  flex items-center gap-4 px-5 py-4 transition-colors
                  ${isFirst ? 'bg-blue-50/40' : 'hover:bg-gray-50'}
                  ${status === 'exporting' ? 'bg-blue-50' : ''}
                `}
              >
                {/* Icon */}
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${template.bgColor.split(' ')[0]}`}>
                  <Icon className={`w-5 h-5 ${template.iconColor}`} />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-gray-900 truncate">{template.title}</span>
                    {isFirst && (
                      <span className="bg-blue-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide flex-shrink-0">
                        Completo
                      </span>
                    )}
                    {isCompleted && status === 'idle' && (
                      <CheckCircleIcon className="w-4 h-4 text-green-500 flex-shrink-0" />
                    )}
                  </div>
                  <p className="text-xs text-gray-500 truncate">{template.description}</p>
                </div>

                {/* Category badge */}
                <span className="hidden sm:inline-flex text-[11px] font-medium text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full capitalize flex-shrink-0">
                  {CATEGORIES.find((c) => c.id === template.category)?.label || template.category}
                </span>

                {/* Button */}
                <div className="flex-shrink-0">{renderButton(template, true)}</div>
              </div>
            );
          })}
        </div>
      )}

      {/* Footer Info */}
      <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
        <div className="flex items-start gap-3">
          <span className="flex-shrink-0 mt-0.5">ℹ️</span>
          <div className="text-sm text-gray-600 space-y-1">
            <p><strong>Formato:</strong> Excel (.xlsx) — compatível com Microsoft Excel, Google Sheets e LibreOffice</p>
            <p><strong>Nomenclatura:</strong> template-name_YYYY-MM-DD.xlsx (ex: asset_locations_2025-02-17.xlsx)</p>
            <p><strong>Filtro de dados:</strong> Apenas registros ativos da empresa ID {companyId}</p>
          </div>
        </div>
      </div>
    </div>
  );
}