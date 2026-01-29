// src/components/Logistics/Orders/OrderItemsModal.tsx
import { useEffect } from 'react';
import { useOrderItems, type OrderItem, type OrdersSummary } from '../../../../../hooks/useOrders';
import { useCompany } from '../../../../../hooks/useCompany';
import { ExportButtons } from './ExportButtons';
import { exportToPDF, exportToExcel, exportToCSV, exportToTextTabular } from '../../../../../utils/tableExports';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface OrderItemsModalProps {
  isOpen: boolean;
  onClose: () => void;
  flowId: number;
  orderCode: string;
  orderDetails?: OrdersSummary;
}

export function OrderItemsModal({ isOpen, onClose, flowId, orderCode, orderDetails }: OrderItemsModalProps) {
  const { companyId, company } = useCompany();

  const { items, loading, error } = useOrderItems(Number(companyId), flowId);

  const handleExport = (format: 'pdf' | 'excel' | 'csv' | 'text') => {
    const columns = [
      { header: 'Item Code', key: 'code' as keyof OrderItem },
      { header: 'Item Name', key: 'item_name' as keyof OrderItem },
      { header: 'Brand', key: 'brand' as keyof OrderItem },
      { header: 'Model', key: 'model' as keyof OrderItem },
      { header: 'Serial', key: 'serial' as keyof OrderItem },
      { header: 'Category', key: 'category' as keyof OrderItem },
      { header: 'Status', key: 'Flow_status' as keyof OrderItem },
      { header: 'Custody', key: 'custody_assigned' as keyof OrderItem },
      { header: 'Custody Code', key: 'custody_code' as keyof OrderItem },
      { header: 'Last Update Item', key: 'Item_Flow_Modified_Date' as keyof OrderItem }
    ];

    const fileName = `order_items_${orderCode}`;
    const title = `Order Items - ${orderCode}`;
    const companyLogoBase64 = company?.details?.logo ?? '';

    const enrichedMetadata = orderDetails ? {
      ...orderDetails,
      code_user_job: orderCode
    } : undefined;

    switch (format) {
      case 'pdf':
        exportToPDF(items, columns, fileName, title, enrichedMetadata, companyLogoBase64);
        break;
      case 'excel':
        exportToExcel(items, columns, fileName, 'Items', enrichedMetadata);
        break;
      case 'csv':
        exportToCSV(items, columns, fileName, enrichedMetadata);
        break;
      case 'text':
        exportToTextTabular(items, columns, fileName, enrichedMetadata);
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
      'transfered': 'bg-green-50 text-green-700 border border-green-200',
      'found': 'bg-purple-50 text-purple-700 border border-purple-200',
      'shipped': 'bg-blue-50 text-blue-700 border border-blue-200',
      'validated': 'bg-teal-50 text-teal-700 border border-teal-200',
      'in-use': 'bg-yellow-50 text-yellow-700 border border-yellow-200',
      'not scanned': 'bg-orange-50 text-orange-700 border border-orange-200',
      'scanned': 'bg-green-50 text-green-700 border border-green-200',
      'in_progress': 'bg-yellow-50 text-yellow-700 border border-yellow-200',
      'info_received': 'bg-blue-50 text-blue-700 border border-blue-200',
      'out_for_delivery': 'bg-purple-50 text-purple-700 border border-purple-200',
      'delivered': 'bg-teal-50 text-teal-700 border border-teal-200'
    };
    return classes[status] || 'bg-gray-50 text-gray-700 border border-gray-200';
  };

  const formatStatusName = (status: string) => {
    return status.replace(/-/g, ' ').replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const getProgressBarColor = (percentage: number) => {
    if (percentage >= 80) return 'bg-green-500';
    if (percentage >= 50) return 'bg-yellow-500';
    if (percentage >= 25) return 'bg-orange-500';
    return 'bg-red-500';
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-all duration-300"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 overflow-hidden flex items-center justify-center p-4">
        <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-7xl max-h-[90vh] flex flex-col">
          {/* Header Compacto */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4 rounded-t-xl">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                📦 Order Items Details
              </h2>
              <div className="flex items-center gap-2">
                <ExportButtons onExport={handleExport} disabled={items.length === 0 || loading} />
                <button
                  onClick={onClose}
                  className="text-white hover:bg-white/20 rounded-lg p-1.5 transition-colors"
                  aria-label="Close modal"
                >
                  <XMarkIcon className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Grid Compacto de Informações */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-x-4 gap-y-2 text-xs">
              {/* Order Code */}
              <div>
                <p className="text-blue-200 font-medium mb-0.5">Order Code</p>
                <code className="bg-blue-700/50 px-2 py-0.5 rounded text-white font-mono">
                  {orderCode}
                </code>
              </div>

              {/* Flow ID */}
              <div>
                <p className="text-blue-200 font-medium mb-0.5">Flow ID</p>
                <span className="text-white font-semibold">{flowId}</span>
              </div>

              {orderDetails && (
                <>
                  {/* Subject */}
                  <div className="col-span-2">
                    <p className="text-blue-200 font-medium mb-0.5">Subject</p>
                    <span className="text-white font-semibold truncate block" title={orderDetails.subject}>
                      {orderDetails.subject || '-'}
                    </span>
                  </div>

                  {/* Status */}
                  <div>
                    <p className="text-blue-200 font-medium mb-0.5">Status</p>
                    <span className={`px-2 py-0.5 inline-flex text-[10px] font-bold rounded-md ${getStatusBadgeClass(orderDetails.status_job)}`}>
                      {formatStatusName(orderDetails.status_job)}
                    </span>
                  </div>

                  {/* Progress */}
                  <div>
                    <p className="text-blue-200 font-medium mb-0.5">Progress</p>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-blue-900/50 rounded-full h-1.5 overflow-hidden">
                        <div
                          className={`h-1.5 rounded-full transition-all ${getProgressBarColor(orderDetails.percentual_concluido)}`}
                          style={{ width: `${Math.min(orderDetails.percentual_concluido, 100)}%` }}
                        />
                      </div>
                      <span className="text-white text-xs font-bold min-w-[35px]">
                        {Number(orderDetails.percentual_concluido).toFixed(0)}%
                      </span>
                    </div>
                  </div>

                  {/* Job Type */}
                  <div>
                    <p className="text-blue-200 font-medium mb-0.5">Job Type</p>
                    <span className="text-white font-semibold truncate block" title={orderDetails.job_type_name}>
                      {orderDetails.job_type_name}
                    </span>
                  </div>

                  {/* Job Class */}
                  <div>
                    <p className="text-blue-200 font-medium mb-0.5">Job Class</p>
                    <span className="text-white font-semibold truncate block" title={orderDetails.job_class_name}>
                      {orderDetails.job_class_name}
                    </span>
                  </div>

                  {/* Custody */}
                  <div>
                    <p className="text-blue-200 font-medium mb-0.5">Custody</p>
                    <span className="text-white font-semibold truncate block" title={orderDetails.to_custody_name}>
                      {orderDetails.to_custody_name}
                    </span>
                  </div>

                  {/* Zone */}
                  <div>
                    <p className="text-blue-200 font-medium mb-0.5">Zone</p>
                    <span className="text-white font-semibold truncate block" title={orderDetails.to_zone_name}>
                      {orderDetails.to_zone_name}
                    </span>
                  </div>

                  {/* Scheduled Date */}
                  <div>
                    <p className="text-blue-200 font-medium mb-0.5">Scheduled</p>
                    <span className="text-white font-semibold">
                      {new Date(orderDetails.scheduled_Date).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </span>
                  </div>

                  {/* Items Stats */}
                  <div>
                    <p className="text-blue-200 font-medium mb-0.5">Items</p>
                    <span className="text-white font-semibold">
                      <span className="text-green-300">{orderDetails.items_concluidos}</span>
                      <span className="text-blue-200 mx-1">/</span>
                      <span>{orderDetails.total_items}</span>
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Content - Tabela de Items */}
          <div className="flex-1 overflow-auto p-2">
            {loading ? (
              <div className="space-y-3">
                <div className="animate-pulse space-y-3">
                  {[1, 2, 3, 4, 5].map(i => (
                    <div key={i} className="h-16 bg-gray-200 rounded-lg"></div>
                  ))}
                </div>
              </div>
            ) : error ? (
              <div className="bg-red-50 border border-red-200 rounded-xl p-8 text-center">
                <span className="text-5xl mb-4 block">⚠️</span>
                <p className="text-red-800 font-semibold text-lg">Error loading items</p>
                <p className="text-red-600 mt-2 text-sm">{error}</p>
              </div>
            ) : items.length === 0 ? (
              <div className="text-center py-12">
                <span className="text-6xl mb-4 block">📭</span>
                <p className="text-gray-500 font-semibold text-lg">No items found</p>
                <p className="text-gray-400 mt-2 text-sm">This order doesn't have any items yet</p>
              </div>
            ) : (
              <div className="overflow-hidden rounded-xl border border-gray-200 shadow-sm">
                <div className="overflow-auto" style={{ maxHeight: 'calc(90vh - 240px)' }}>
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50 sticky top-0 z-10">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                          Item Code
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                          Item Name
                        </th>
                        {/* <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                          Brand / Model
                        </th> */}
                        {/* <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                          Serial
                        </th> */}
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                          Category
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                          Custody
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                          Last Update
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {items.map((item) => (
                        <tr
                          key={item.obj_id}
                          className="hover:bg-gray-50 transition-colors"
                        >
                          <td className="px-4 py-3 whitespace-nowrap">
                            <code className="text-xs bg-gray-100 px-2 py-1 rounded font-mono text-gray-700 border border-gray-200">
                              {item.code}
                            </code>
                          </td>
                          <td className="px-4 py-3">
                            <div className="text-sm font-medium text-gray-900">
                              {item.item_name}
                            </div>
                            <div className="text-xs text-gray-500 mt-0.5">
                              {item.item_aux_code}
                            </div>
                          </td>
                          {/* <td className="px-4 py-3">
                            <div className="text-sm text-gray-900">{item.brand}</div>
                            <div className="text-xs text-gray-500">{item.model}</div>
                          </td> */}
                          {/* <td className="px-4 py-3 whitespace-nowrap">
                            <span className="text-xs font-mono text-gray-700 bg-gray-50 px-2 py-1 rounded border border-gray-200">
                              {item.serial || '-'}
                            </span>
                          </td> */}
                          <td className="px-4 py-3 whitespace-nowrap">
                            <span className="text-sm text-gray-700">
                              {item.category}
                            </span>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <span className={`px-2.5 inline-flex text-xs font-medium rounded-full ${getStatusBadgeClass(item.Flow_status)}`}>
                              {formatStatusName(item.Flow_status)}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="text-sm font-medium text-gray-900">
                              {item.custody_assigned}
                            </div>
                            <div className="text-xs text-gray-500 mt-0.5">
                              {item.custody_code}
                            </div>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            {item.Item_Flow_Modified_Date ? (
                              <div>
                                <div className="text-sm text-gray-900">
                                  {new Date(item.Item_Flow_Modified_Date).toLocaleDateString('en-US', {
                                    timeZone: 'UTC',
                                    month: 'short',
                                    day: 'numeric',
                                    year: 'numeric'
                                  })}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {new Date(item.Item_Flow_Modified_Date).toLocaleTimeString('en-US', {
                                    timeZone: 'UTC',
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
              </div>
            )}
          </div>

          {/* Footer Compacto */}
          <div className="bg-gray-50 px-6 py-3 rounded-b-xl border-t border-gray-200 flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Total: <span className="font-bold text-gray-900">{items.length}</span>
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
              className="px-5 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors text-sm shadow-sm"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}