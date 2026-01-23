// src/components/Logistics/Orders/OrderItemsModal.tsx
import { useEffect } from 'react';
import { useOrderItems, type OrderItem, type OrdersSummary } from '../../../../../hooks/useOrders';
import { useCompany } from '../../../../../hooks/useCompany';
import { ExportButtons } from './ExportButtons';
import { exportToPDF, exportToExcel, exportToCSV, exportToTextTabular } from '../../../../../utils/tableExports';

interface OrderItemsModalProps {
  isOpen: boolean;
  onClose: () => void;
  flowId: number;
  orderCode: string;
  orderDetails?: OrdersSummary; // ⭐ Adicionar detalhes da ordem
}

export function OrderItemsModal({ isOpen, onClose, flowId, orderCode, orderDetails }: OrderItemsModalProps) {
  const { companyId } = useCompany();
  const { items, loading, error } = useOrderItems(Number(companyId), flowId);

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
      'complete': 'bg-gradient-to-r from-green-100 to-green-200 text-green-800 border border-green-300',
      'in_progress': 'bg-gradient-to-r from-yellow-100 to-yellow-200 text-yellow-800 border border-yellow-300',
      'info_received': 'bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 border border-blue-300',
      'out_for_delivery': 'bg-gradient-to-r from-purple-100 to-purple-200 text-purple-800 border border-purple-300',
      'delivered': 'bg-gradient-to-r from-teal-100 to-teal-200 text-teal-800 border border-teal-300'
    };
    return classes[status] || 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800 border border-gray-300';
  };

  const formatStatusName = (status: string) => {
    return status.replace(/-/g, ' ').replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const getProgressBarColor = (percentage: number) => {
    if (percentage >= 80) return 'bg-gradient-to-r from-green-400 to-green-500';
    if (percentage >= 50) return 'bg-gradient-to-r from-yellow-400 to-yellow-500';
    if (percentage >= 25) return 'bg-gradient-to-r from-orange-400 to-orange-500';
    return 'bg-gradient-to-r from-red-400 to-red-500';
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
          {/* Header com detalhes expandidos */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-5 rounded-t-2xl">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                  <span className="text-3xl">📦</span>
                  Order Items Details
                </h2>
                
                {/* Informações básicas */}
                <div className="mt-3 grid grid-cols-2 gap-x-6 gap-y-2">
                  <div>
                    <p className="text-blue-200 text-xs font-medium">Order Code</p>
                    <code className="bg-blue-700 px-2 py-0.5 rounded text-white font-mono text-sm">
                      {orderCode}
                    </code>
                  </div>
                  
                  <div>
                    <p className="text-blue-200 text-xs font-medium">Flow ID</p>
                    <span className="text-white font-semibold text-sm">{flowId}</span>
                  </div>

                  {orderDetails && (
                    <>
                      <div>
                        <p className="text-blue-200 text-xs font-medium">Subject</p>
                        <span className="text-white font-semibold text-sm" title={orderDetails.subject}>
                          {orderDetails.subject || '-'}
                        </span>
                      </div>

                      <div>
                        <p className="text-blue-200 text-xs font-medium">Status</p>
                        <span className={`px-2 py-0.5 inline-flex text-[10px] font-bold rounded-full ${getStatusBadgeClass(orderDetails.status_job)}`}>
                          {formatStatusName(orderDetails.status_job)}
                        </span>
                      </div>

                      <div>
                        <p className="text-blue-200 text-xs font-medium">Job Type</p>
                        <span className="text-white font-semibold text-sm">{orderDetails.job_type_name}</span>
                      </div>

                      <div>
                        <p className="text-blue-200 text-xs font-medium">Job Class</p>
                        <span className="text-white font-semibold text-sm">{orderDetails.job_class_name}</span>
                      </div>

                      <div>
                        <p className="text-blue-200 text-xs font-medium">Custody</p>
                        <span className="text-white font-semibold text-sm">{orderDetails.to_custody_name}</span>
                      </div>

                      <div>
                        <p className="text-blue-200 text-xs font-medium">Zone</p>
                        <span className="text-white font-semibold text-sm">{orderDetails.to_zone_name}</span>
                      </div>

                      <div>
                        <p className="text-blue-200 text-xs font-medium">Due Date</p>
                        <span className="text-white font-semibold text-sm">
                          {new Date(orderDetails.due_date).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>

                      <div>
                        <p className="text-blue-200 text-xs font-medium">Progress</p>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="flex-1 bg-blue-800 rounded-full h-2 overflow-hidden">
                            <div
                              className={`h-2 rounded-full transition-all ${getProgressBarColor(orderDetails.percentual_concluido)}`}
                              style={{ width: `${Math.min(orderDetails.percentual_concluido, 100)}%` }}
                            />
                          </div>
                          <span className="text-white text-xs font-bold w-10">
                            {Number(orderDetails.percentual_concluido).toFixed(0)}%
                          </span>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3 ml-4">
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
            </div>
          </div>

          {/* Content - Tabela de Items */}
          <div className="flex-1 overflow-auto p-6">
            {loading ? (
              <div className="space-y-4">
                <div className="animate-pulse space-y-3">
                  {[1, 2, 3, 4, 5].map(i => (
                    <div key={i} className="h-20 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg"></div>
                  ))}
                </div>
              </div>
            ) : error ? (
              <div className="bg-red-50 border-2 border-red-200 rounded-xl p-8 text-center">
                <span className="text-6xl mb-4 block">⚠️</span>
                <p className="text-red-800 font-semibold text-lg">Error loading items</p>
                <p className="text-red-600 mt-2">{error}</p>
              </div>
            ) : items.length === 0 ? (
              <div className="text-center py-12">
                <span className="text-8xl mb-4 block">📭</span>
                <p className="text-gray-500 font-semibold text-xl">No items found</p>
                <p className="text-gray-400 mt-2">This order doesn't have any items yet</p>
              </div>
            ) : (
              <div className="overflow-hidden rounded-xl border border-gray-200">
                <div className="overflow-y-auto" style={{ maxHeight: 'calc(90vh - 380px)' }}>
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gradient-to-r from-gray-50 to-gray-100 sticky top-0 z-10">
                      <tr>
                        <th className="px-4 py-2.5 text-left text-[10px] font-bold text-gray-700 uppercase tracking-wider">
                          Item Code
                        </th>
                        <th className="px-4 py-2.5 text-left text-[10px] font-bold text-gray-700 uppercase tracking-wider">
                          Item Name
                        </th>
                        <th className="px-4 py-2.5 text-left text-[10px] font-bold text-gray-700 uppercase tracking-wider">
                          Brand / Model
                        </th>
                        <th className="px-4 py-2.5 text-left text-[10px] font-bold text-gray-700 uppercase tracking-wider">
                          Serial
                        </th>
                        <th className="px-4 py-2.5 text-left text-[10px] font-bold text-gray-700 uppercase tracking-wider">
                          Category
                        </th>
                        <th className="px-4 py-2.5 text-left text-[10px] font-bold text-gray-700 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-4 py-2.5 text-left text-[10px] font-bold text-gray-700 uppercase tracking-wider">
                          Custody
                        </th>
                        <th className="px-4 py-2.5 text-left text-[10px] font-bold text-gray-700 uppercase tracking-wider">
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
                          <td className="px-4 py-2.5 whitespace-nowrap">
                            <code className="text-[10px] bg-gradient-to-r from-gray-100 to-gray-200 px-2 py-1 rounded-md font-mono font-semibold text-gray-700 border border-gray-300">
                              {item.code}
                            </code>
                          </td>
                          <td className="px-4 py-2.5">
                            <div className="text-xs font-semibold text-gray-900 max-w-xs">
                              {item.item_name}
                            </div>
                            <div className="text-[10px] text-gray-500 mt-0.5">
                              {item.item_aux_code}
                            </div>
                          </td>
                          <td className="px-4 py-2.5">
                            <div className="text-xs font-medium text-gray-900">{item.brand}</div>
                            <div className="text-[10px] text-gray-500">{item.model}</div>
                          </td>
                          <td className="px-4 py-2.5 whitespace-nowrap">
                            <span className="text-[10px] font-mono text-gray-700 bg-gray-100 px-2 py-1 rounded">
                              {item.serial || '-'}
                            </span>
                          </td>
                          <td className="px-4 py-2.5 whitespace-nowrap">
                            <span className="text-xs text-gray-700 font-medium">
                              {item.category}
                            </span>
                          </td>
                          <td className="px-4 py-2.5 whitespace-nowrap">
                            <span className={`px-2 py-1 inline-flex text-[10px] leading-4 font-bold rounded-full ${getStatusBadgeClass(item.tranfer_status)}`}>
                              {formatStatusName(item.tranfer_status)}
                            </span>
                          </td>
                          <td className="px-4 py-2.5">
                            <div>
                              <div className="text-xs font-semibold text-gray-900">
                                {item.custody_assigned}
                              </div>
                              <div className="text-[10px] text-gray-500 mt-0.5">
                                {item.custody_code}
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-2.5 whitespace-nowrap">
                            {item.tranfer_date ? (
                              <div>
                                <div className="text-xs text-gray-900 font-medium">
                                  {new Date(item.tranfer_date).toLocaleDateString('en-US', {
                                    month: 'short',
                                    day: 'numeric',
                                    year: 'numeric'
                                  })}
                                </div>
                                <div className="text-[10px] text-gray-500">
                                  {new Date(item.tranfer_date).toLocaleTimeString('en-US', {
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </div>
                              </div>
                            ) : (
                              <span className="text-xs text-gray-400">Pending</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 rounded-b-2xl border-t border-gray-200 flex items-center justify-between">
            <div className="text-sm text-gray-600 font-medium">
              Total Items: <span className="font-bold text-gray-900">{items.length}</span>
              {orderDetails && (
                <>
                  {' • '}
                  Completed: <span className="font-bold text-green-600">{orderDetails.items_concluidos}</span>
                  {' • '}
                  Pending: <span className="font-bold text-orange-600">{orderDetails.items_pendentes}</span>
                </>
              )}
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