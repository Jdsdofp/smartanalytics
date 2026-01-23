// src/components/Logistics/Orders/OrderItemsModal.tsx
import { useEffect } from 'react';
import { useOrderItems, type OrderItem } from '../../../../../hooks/useOrders';
import { useCompany } from '../../../../../hooks/useCompany';
// Adicione no início do componente OrderItemsModal
import { ExportButtons } from './ExportButtons';
import { exportToPDF, exportToExcel, exportToCSV, exportToTextTabular } from '../../../../../utils/tableExports';


interface OrderItemsModalProps {
  isOpen: boolean;
  onClose: () => void;
  flowId: number;
  orderCode: string;
}

export function OrderItemsModal({ isOpen, onClose, flowId, orderCode }: OrderItemsModalProps) {
  const { companyId } = useCompany();
  const { items, loading, error } = useOrderItems(Number(companyId), flowId);

  // Adicione o handler de export dentro do componente
const handleExport = (format: 'pdf' | 'excel' | 'csv' | 'text') => {
  const columns = [
    { header: 'Item Code', key: 'code' as keyof OrderItem },
    { header: 'Item Name', key: 'item_name' as keyof OrderItem },
    { header: 'Brand', key: 'brand' as keyof OrderItem },
    { header: 'Model', key: 'model' as keyof OrderItem },
    { header: 'Serial', key: 'serial' as keyof OrderItem },
    { header: 'Category', key: 'category' as keyof OrderItem },
    { header: 'Status', key: 'tranfer_status' as keyof OrderItem },
    { header: 'Custody', key: 'custody_assigned' as keyof OrderItem },
    { header: 'Custody Code', key: 'custody_code' as keyof OrderItem },
    { header: 'Transfer Date', key: 'tranfer_date' as keyof OrderItem },
  ];

    const fileName = `order_items_${orderCode}`;
  const title = `Order Items - ${orderCode}`;

  switch (format) {
    case 'pdf':
      exportToPDF(items, columns, fileName, title);
      break;
    case 'excel':
      exportToExcel(items, columns, fileName, 'Items');
      break;
    case 'csv':
      exportToCSV(items, columns, fileName);
      break;
    case 'text':
      exportToTextTabular(items, columns, fileName);
      break;
  }
};

  // Close modal on ESC key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleEsc);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const getStatusBadgeClass = (status: string) => {
    const classes: Record<string, string> = {
      'transfered': 'bg-gradient-to-r from-green-100 to-green-200 text-green-800 border border-green-300',
      'found': 'bg-gradient-to-r from-purple-100 to-purple-200 text-purple-800 border border-purple-300',
      'shipped': 'bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 border border-blue-300',
      'validated': 'bg-gradient-to-r from-teal-100 to-teal-200 text-teal-800 border border-teal-300',
      'in-use': 'bg-gradient-to-r from-yellow-100 to-yellow-200 text-yellow-800 border border-yellow-300',
      'not-found': 'bg-gradient-to-r from-red-100 to-red-200 text-red-800 border border-red-300',
      'not-validated': 'bg-gradient-to-r from-orange-100 to-orange-200 text-orange-800 border border-orange-300',
    };
    return classes[status] || 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800 border border-gray-300';
  };

  const formatStatusName = (status: string) => {
    return status.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 overflow-hidden flex items-center justify-center p-4">
        <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-7xl max-h-[90vh] flex flex-col">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-5 rounded-t-2xl flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                <span className="text-3xl">📦</span>
                Order Items Details
              </h2>
              <p className="text-blue-100 text-sm mt-1">
                Order: <code className="bg-blue-700 px-2 py-0.5 rounded text-white font-mono">{orderCode}</code>
                {' • '}
                Flow ID: <span className="font-semibold">{flowId}</span>
              </p>
            </div>
            <div className="flex items-center gap-3">
    <ExportButtons onExport={handleExport} disabled={items.length === 0 || loading} />
    <button
      onClick={onClose}
      className="text-white hover:bg-blue-700 rounded-lg p-2 transition-colors"
      aria-label="Close modal"
    >
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
      </svg>
    </button>
  </div>
            <button
              onClick={onClose}
              className="text-white hover:bg-blue-700 rounded-lg p-2 transition-colors"
              aria-label="Close modal"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-auto p-6">
            {loading ? (
              // Loading State
              <div className="space-y-4">
                <div className="animate-pulse space-y-3">
                  {[1, 2, 3, 4, 5].map(i => (
                    <div key={i} className="h-20 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg"></div>
                  ))}
                </div>
              </div>
            ) : error ? (
              // Error State
              <div className="bg-red-50 border-2 border-red-200 rounded-xl p-8 text-center">
                <span className="text-6xl mb-4 block">⚠️</span>
                <p className="text-red-800 font-semibold text-lg">Error loading items</p>
                <p className="text-red-600 mt-2">{error}</p>
              </div>
            ) : items.length === 0 ? (
              // Empty State
              <div className="text-center py-12">
                <span className="text-8xl mb-4 block">📭</span>
                <p className="text-gray-500 font-semibold text-xl">No items found</p>
                <p className="text-gray-400 mt-2">This order doesn't have any items yet</p>
              </div>
            ) : (
              // Items Table
              <div className="overflow-x-auto rounded-xl border border-gray-200">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gradient-to-r from-gray-50 to-gray-100 sticky top-0">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                        Item Code
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                        Item Name
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                        Brand / Model
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                        Serial
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                        Category
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                        Custody
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                        Transfer Date
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-100">
                    {items.map((item, index) => (
                      <tr 
                        key={item.obj_id}
                        className={`hover:bg-blue-50 transition-colors ${
                          index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'
                        }`}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <code className="text-xs bg-gradient-to-r from-gray-100 to-gray-200 px-3 py-1.5 rounded-md font-mono font-semibold text-gray-700 border border-gray-300">
                            {item.code}
                          </code>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm font-semibold text-gray-900 max-w-xs">
                            {item.item_name}
                          </div>
                          <div className="text-xs text-gray-500 mt-0.5">
                            {item.item_aux_code}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-gray-900">{item.brand}</div>
                          <div className="text-xs text-gray-500">{item.model}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm font-mono text-gray-700 bg-gray-100 px-2 py-1 rounded">
                            {item.serial || '-'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-gray-700 font-medium">
                            {item.category}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-3 py-1.5 inline-flex text-xs leading-5 font-bold rounded-full ${getStatusBadgeClass(item.tranfer_status)}`}>
                            {formatStatusName(item.tranfer_status)}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <div className="text-sm font-semibold text-gray-900">
                              {item.custody_assigned}
                            </div>
                            <div className="text-xs text-gray-500 mt-0.5">
                              {item.custody_code}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {item.tranfer_date ? (
                            <div>
                              <div className="text-sm text-gray-900 font-medium">
                                {new Date(item.tranfer_date).toLocaleDateString('en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                  year: 'numeric'
                                })}
                              </div>
                              <div className="text-xs text-gray-500">
                                {new Date(item.tranfer_date).toLocaleTimeString('en-US', {
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </div>
                            </div>
                          ) : (
                            <span className="text-sm text-gray-400">Pending</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 rounded-b-2xl border-t border-gray-200 flex items-center justify-between">
            <div className="text-sm text-gray-600 font-medium">
              Total Items: <span className="font-bold text-gray-900">{items.length}</span>
            </div>
            <button
              onClick={onClose}
              className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all shadow-md hover:shadow-lg"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}