import { DocumentTextIcon, ExclamationTriangleIcon, FunnelIcon, TableCellsIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { useState } from "react";
import { useTranslation } from "react-i18next";

// Adicione esta interface junto com as outras interfaces no topo do arquivo
interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExport: (type: 'excel' | 'pdf', exportAll: boolean) => void;
  filteredCount: number;
  totalCount: number;
  hasActiveFilters: boolean;
}

// Adicione este componente antes do DeviceLogsView
const ExportModal = ({
  isOpen,
  onClose,
  onExport,
  filteredCount,
  totalCount,
  hasActiveFilters
}: ExportModalProps) => {
  const { t } = useTranslation();
  const [exportType, setExportType] = useState<'excel' | 'pdf'>('excel');
  const [exportScope, setExportScope] = useState<'filtered' | 'all'>('filtered');

  if (!isOpen) return null;

  const handleExport = () => {
    onExport(exportType, exportScope === 'all');
    onClose();
  };



    const glassColor = exportType === "excel"
    ? "bg-gradient-to-br from-green-100/70 to-white/40 border-green-300/40 shadow-green-500/20"
    : exportType === "pdf"
    ? "bg-gradient-to-br from-red-100/70 to-white/40 border-red-300/40 shadow-red-500/20"
    : "bg-white/80 border-white/30";


  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div
       className="fixed inset-0 bg-black/30 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />

      <div className="flex min-h-full items-center justify-center p-4">
        {/* <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full"> */}
       <div
  className={`relative rounded-xl shadow-2xl max-w-md w-full transition-all duration-300
    ${exportType ? "backdrop-blur-2xl" : "backdrop-blur-lg"}
    ${glassColor}
  `}
>





          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <DocumentTextIcon className="h-6 w-6 text-blue-600" />
              {t('lowBatteryTable.modal.title')}
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Escolha do formato */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                {t('lowBatteryTable.modal.format')}
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setExportType('excel')}
                  className={`flex items-center justify-center gap-2 p-4 rounded-lg border-2 transition-all ${
                    exportType === 'excel'
                      ? 'border-green-500 bg-green-50 text-green-700'
                      : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <TableCellsIcon className="h-6 w-6" />
                  <span className="font-medium">Excel</span>
                </button>
                <button
                  onClick={() => setExportType('pdf')}
                  className={`flex items-center justify-center gap-2 p-4 rounded-lg border-2 transition-all ${
                    exportType === 'pdf'
                      ? 'border-red-500 bg-red-50 text-red-700'
                      : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <DocumentTextIcon className="h-6 w-6" />
                  <span className="font-medium">PDF</span>
                </button>
              </div>
            </div>

            {/* Escolha do escopo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                {t('lowBatteryTable.modal.scope')}
              </label>
              <div className="space-y-3">
                {/* Dados filtrados */}
                <button
                  onClick={() => setExportScope('filtered')}
                  className={`w-full flex items-start gap-3 p-4 rounded-lg border-2 transition-all ${
                    exportScope === 'filtered'
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-300 bg-white hover:bg-gray-50'
                  }`}
                >
                  <div className="flex-shrink-0 mt-0.5">
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        exportScope === 'filtered'
                          ? 'border-blue-500 bg-blue-500'
                          : 'border-gray-300'
                      }`}
                    >
                      {exportScope === 'filtered' && (
                        <div className="w-2 h-2 bg-white rounded-full" />
                      )}
                    </div>
                  </div>
                  <div className="flex-1 text-left">
                    <p className={`font-medium ${
                      exportScope === 'filtered' ? 'text-blue-900' : 'text-gray-900'
                    }`}>
                      {t('lowBatteryTable.modal.filteredData')}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      {hasActiveFilters
                        ? t('lowBatteryTable.modal.filteredDescription', { count: filteredCount })
                        : t('lowBatteryTable.modal.currentPageDescription', { count: filteredCount })}
                    </p>
                    {hasActiveFilters && (
                      <div className="mt-2 flex items-center gap-1 text-xs text-blue-600">
                        <FunnelIcon className="h-3 w-3" />
                        <span>{t('lowBatteryTable.modal.activeFilters')}</span>
                      </div>
                    )}
                  </div>
                </button>

                {/* Todos os dados */}
                <button
                  onClick={() => setExportScope('all')}
                  className={`w-full flex items-start gap-3 p-4 rounded-lg border-2 transition-all ${
                    exportScope === 'all'
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-300 bg-white hover:bg-gray-50'
                  }`}
                >
                  <div className="flex-shrink-0 mt-0.5">
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        exportScope === 'all'
                          ? 'border-blue-500 bg-blue-500'
                          : 'border-gray-300'
                      }`}
                    >
                      {exportScope === 'all' && (
                        <div className="w-2 h-2 bg-white rounded-full" />
                      )}
                    </div>
                  </div>
                  <div className="flex-1 text-left">
                    <p className={`font-medium ${
                      exportScope === 'all' ? 'text-blue-900' : 'text-gray-900'
                    }`}>
                      {t('lowBatteryTable.modal.allData')}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      {t('lowBatteryTable.modal.allDataDescription', { count: totalCount })}
                    </p>
                    {totalCount > 1000 && (
                      <div className="mt-2 flex items-center gap-1 text-xs text-amber-600">
                        <ExclamationTriangleIcon className="h-3 w-3" />
                        <span>{t('lowBatteryTable.modal.largeDatasetWarning')}</span>
                      </div>
                    )}
                  </div>
                </button>
              </div>
            </div>

            {/* Info sobre o que será exportado */}
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-700">
                <span className="font-medium">{t('lowBatteryTable.modal.willExport')}:</span>
                <br />
                {exportScope === 'filtered'
                  ? t('lowBatteryTable.modal.willExportFiltered', { 
                      count: filteredCount,
                      format: exportType.toUpperCase() 
                    })
                  : t('lowBatteryTable.modal.willExportAll', { 
                      count: totalCount,
                      format: exportType.toUpperCase() 
                    })}
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              {t('lowBatteryTable.modal.cancel')}
            </button>
            <button
              onClick={handleExport}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium text-white rounded-md transition-colors ${
                exportType === 'excel'
                  ? 'bg-green-600 hover:bg-green-700'
                  : 'bg-red-600 hover:bg-red-700'
              }`}
            >
              {exportType === 'excel' ? (
                <TableCellsIcon className="h-4 w-4" />
              ) : (
                <DocumentTextIcon className="h-4 w-4" />
              )}
              {t('lowBatteryTable.modal.exportButton')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExportModal;