// src/components/AssetManagement/AssetExportSystem.tsx
import { useState } from 'react';
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
  CheckCircleIcon
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
}


// =====================================
// 🎨 EXPORT TEMPLATES
// =====================================

const EXPORT_TEMPLATES: ExportTemplate[] = [
  {
    id: 'asset_locations',
    icon: MapPinIcon,
    title: 'Asset Locations',
    description: 'GPS coordinates, zones, sites, and area assignments',
    endpoint: 'asset_locations',
    iconColor: 'text-blue-600',
    bgColor: 'bg-blue-50 hover:bg-blue-100'
  },
  {
    id: 'asset_purchase',
    icon: CurrencyDollarIcon,
    title: 'Purchase Information',
    description: 'Costs, suppliers, PO numbers, and purchase dates',
    endpoint: 'asset_purchase',
    iconColor: 'text-green-600',
    bgColor: 'bg-green-50 hover:bg-green-100'
  },
  {
    id: 'asset_properties',
    icon: CubeIcon,
    title: 'Asset Properties',
    description: 'Brand, model, serial, and 20+ custom fields',
    endpoint: 'asset_properties',
    iconColor: 'text-purple-600',
    bgColor: 'bg-purple-50 hover:bg-purple-100'
  },
  {
    id: 'asset_financial',
    icon: BanknotesIcon,
    title: 'Financial Data',
    description: 'Depreciation, cost centers, net book value',
    endpoint: 'asset_financial',
    iconColor: 'text-emerald-600',
    bgColor: 'bg-emerald-50 hover:bg-emerald-100'
  },
  {
    id: 'asset_insurance',
    icon: ShieldCheckIcon,
    title: 'Insurance Coverage',
    description: 'Policies, coverage dates, insurance companies',
    endpoint: 'asset_insurance',
    iconColor: 'text-indigo-600',
    bgColor: 'bg-indigo-50 hover:bg-indigo-100'
  },
  {
    id: 'asset_warranty',
    icon: WrenchScrewdriverIcon,
    title: 'Warranty & Maintenance',
    description: 'Warranty periods, schedules, work orders',
    endpoint: 'asset_warranty',
    iconColor: 'text-orange-600',
    bgColor: 'bg-orange-50 hover:bg-orange-100'
  },
  {
    id: 'asset_custody',
    icon: ClipboardDocumentCheckIcon,
    title: 'Custody & Ownership',
    description: 'Ownership, department assignments, responsibility',
    endpoint: 'asset_custody',
    iconColor: 'text-cyan-600',
    bgColor: 'bg-cyan-50 hover:bg-cyan-100'
  },
  {
    id: 'asset_sap',
    icon: ServerIcon,
    title: 'SAP Integration',
    description: 'Material documents, lots, SAP tracking data',
    endpoint: 'asset_sap',
    iconColor: 'text-blue-700',
    bgColor: 'bg-blue-50 hover:bg-blue-100'
  },
  {
    id: 'asset_audit',
    icon: ChartBarIcon,
    title: 'Audit Status',
    description: 'Cycle counts, verification, audit tracking',
    endpoint: 'asset_audit',
    iconColor: 'text-pink-600',
    bgColor: 'bg-pink-50 hover:bg-pink-100'
  },
  {
    id: 'asset_tracking',
    icon: MapIcon,
    title: 'RFID Tracking',
    description: 'RFID reads, antenna data, GPS positioning',
    endpoint: 'asset_tracking',
    iconColor: 'text-teal-600',
    bgColor: 'bg-teal-50 hover:bg-teal-100'
  },
  {
    id: 'asset_alarm',
    icon: DocumentTextIcon,
    title: 'Alarm Events',
    description: 'Alarm events, mustering, emergency response',
    endpoint: 'asset_alarm',
    iconColor: 'text-red-600',
    bgColor: 'bg-red-50 hover:bg-red-100'
  },
  {
    id: 'asset_complete',
    icon: DocumentArrowDownIcon,
    title: 'Complete Inventory',
    description: 'Comprehensive export with all key fields',
    endpoint: 'asset_complete',
    iconColor: 'text-gray-700',
    bgColor: 'bg-gray-50 hover:bg-gray-100'
  }
];

// =====================================
// 🎯 COMPONENT
// =====================================

export default function AssetExportSystem() {
  const { companyId } = useCompany()
  const [exportStatus, setExportStatus] = useState<{ [key: string]: 'idle' | 'exporting' | 'completed' }>({});
  const [completed, setCompleted] = useState<Set<string>>(new Set());

  // Handle export
  const handleExport = async (template: ExportTemplate) => {
    const { id, endpoint, title } = template;

    try {
      // Set status to exporting
      setExportStatus(prev => ({ ...prev, [id]: 'exporting' }));

      // Call API
      const response = await fetch(
        `https://apinode.smartxhub.cloud/api/dashboard/asset/${companyId}/export/${endpoint}`
      );

      if (!response.ok) {
        throw new Error(`Export failed: ${response.statusText}`);
      }

      const result = await response.json();

      if (!result.success || !result.data || result.data.length === 0) {
        alert(`No data found for ${title}`);
        setExportStatus(prev => ({ ...prev, [id]: 'idle' }));
        return;
      }

      // Generate Excel file
      const worksheet = XLSX.utils.json_to_sheet(result.data);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Assets');

      // Generate filename with timestamp
      const timestamp = new Date().toISOString().split('T')[0];
      const filename = `${endpoint}_${timestamp}.xlsx`;

      // Download file
      XLSX.writeFile(workbook, filename);

      // Mark as completed
      setCompleted(prev => new Set([...prev, id]));
      setExportStatus(prev => ({ ...prev, [id]: 'completed' }));

      // Reset status after 3 seconds
      setTimeout(() => {
        setExportStatus(prev => ({ ...prev, [id]: 'idle' }));
      }, 3000);

    } catch (error) {
      console.error('Export error:', error);
      alert(`Export failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setExportStatus(prev => ({ ...prev, [id]: 'idle' }));
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
            <ArrowDownTrayIcon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              Asset Data Export System
            </h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              Export your asset data in Excel format. All exports are filtered by company ID ({companyId}) 
              and exclude logically deleted records. Files download automatically to your default folder.
            </p>
          </div>
        </div>
      </div>

      {/* Export Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {EXPORT_TEMPLATES.map((template) => {
          const Icon = template.icon;
          const status = exportStatus[template.id] || 'idle';
          const isCompleted = completed.has(template.id);

          return (
            <div
              key={template.id}
              className={`
                relative bg-white rounded-xl p-5 border border-gray-200 
                transition-all duration-300 hover:shadow-lg hover:-translate-y-1
                ${status === 'exporting' ? 'ring-2 ring-blue-500 ring-offset-2' : ''}
              `}
            >
              {/* Icon */}
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-3 ${template.bgColor}`}>
                <Icon className={`w-6 h-6 ${template.iconColor}`} />
              </div>

              {/* Title and Description */}
              <h4 className="text-base font-semibold text-gray-900 mb-1">
                {template.title}
              </h4>
              <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                {template.description}
              </p>

              {/* Export Button */}
              <button
                onClick={() => handleExport(template)}
                disabled={status === 'exporting'}
                className={`
                  w-full py-2.5 px-4 rounded-lg font-medium text-sm
                  transition-all duration-200 flex items-center justify-center gap-2
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
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle 
                        className="opacity-25" 
                        cx="12" 
                        cy="12" 
                        r="10" 
                        stroke="currentColor" 
                        strokeWidth="4"
                        fill="none"
                      />
                      <path 
                        className="opacity-75" 
                        fill="currentColor" 
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    <span>Exporting...</span>
                  </>
                ) : status === 'completed' ? (
                  <>
                    <CheckCircleIcon className="w-5 h-5" />
                    <span>Exported!</span>
                  </>
                ) : (
                  <>
                    <ArrowDownTrayIcon className="w-5 h-5" />
                    <span>Export to Excel</span>
                  </>
                )}
              </button>

              {/* Completion Indicator */}
              {isCompleted && status === 'idle' && (
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

      {/* Footer Info */}
      <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
        <div className="flex items-start gap-3">
          <div className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5">
            ℹ️
          </div>
          <div className="text-sm text-gray-600 space-y-1">
            <p><strong>File Format:</strong> Excel (.xlsx) - Compatible with Microsoft Excel, Google Sheets, and LibreOffice</p>
            <p><strong>File Naming:</strong> template-name_YYYY-MM-DD.xlsx (e.g., asset_locations_2025-02-17.xlsx)</p>
            <p><strong>Data Filtering:</strong> All exports include only active records for company ID {companyId}</p>
          </div>
        </div>
      </div>
    </div>
  );
}