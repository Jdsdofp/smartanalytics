// src/components/Logistics/Orders/OrdersTable.tsx
import { useState, useMemo } from 'react';
import type { OrdersSummary } from '../../../../../hooks/useOrders';
import { OrderItemsModal } from './OrderItemsModal';
import { ExportButtons } from './ExportButtons';
import { exportToPDF, exportToExcel, exportToCSV, exportToTextTabular } from '../../../../../utils/tableExports';
import { useCompany } from '../../../../../hooks/useCompany';

interface OrdersTableProps {
  orders: OrdersSummary[];
  loading?: boolean;
}

export function OrdersTable({ orders, loading }: OrdersTableProps) {
  const { logo } = useCompany()
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<keyof OrdersSummary>('due_date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  
  // Modal state
  // E atualizar o state:
  const [selectedOrder, setSelectedOrder] = useState<{ 
    flowId: number; 
    orderCode: string;
    orderDetails: OrdersSummary;
  } | null>(null);

  // ... (manter todo o código de filtering, sorting, pagination existente)

  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      const searchLower = searchTerm.toLowerCase();
      return (
        order.code_user_job.toLowerCase().includes(searchLower) ||
        order.job_type_name.toLowerCase().includes(searchLower) ||
        order.status_job.toLowerCase().includes(searchLower) ||
        order.subject?.toLowerCase().includes(searchLower) ||
        order.identifier1?.toLowerCase().includes(searchLower)
      );
    });
  }, [orders, searchTerm]);

  const sortedOrders = useMemo(() => {
    return [...filteredOrders].sort((a, b) => {
      let aValue = a[sortField];
      let bValue = b[sortField];

      if (sortField === 'due_date') {
        aValue = new Date(aValue as string).getTime();
        bValue = new Date(bValue as string).getTime();
      }

      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
      }

      const aStr = String(aValue || '');
      const bStr = String(bValue || '');
      
      if (sortDirection === 'asc') {
        return aStr.localeCompare(bStr);
      }
      return bStr.localeCompare(aStr);
    });
  }, [filteredOrders, sortField, sortDirection]);

  const totalPages = Math.ceil(sortedOrders.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedOrders = sortedOrders.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  const handleItemsPerPageChange = (value: number) => {
    setItemsPerPage(value);
    setCurrentPage(1);
  };

  const handleSort = (field: keyof OrdersSummary) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

const handleRowClick = (order: OrdersSummary) => {
  setSelectedOrder({
    flowId: order.id,
    orderCode: order.code_user_job,
    orderDetails: order // ⭐ Passar os detalhes completos
  });
};

  const handleCloseModal = () => {
    setSelectedOrder(null);
  };

  // =====================================
  // 📤 EXPORT HANDLERS
  // =====================================


  

  const handleExport = (format: 'pdf' | 'excel' | 'csv' | 'text') => {
    const columns = [
      { header: 'Order Code', key: 'code_user_job' as keyof OrdersSummary },
      { header: 'Subject', key: 'subject' as keyof OrdersSummary },
      { header: 'Job Type', key: 'job_type_name' as keyof OrdersSummary },
      { header: 'Job Class', key: 'job_class_name' as keyof OrdersSummary },
      { header: 'Status', key: 'status_job' as keyof OrdersSummary },
      { header: 'Total Items', key: 'total_items' as keyof OrdersSummary },
      { header: 'Items Completed', key: 'items_concluidos' as keyof OrdersSummary },
      { header: 'Items Pending', key: 'items_pendentes' as keyof OrdersSummary },
      { header: 'Progress (%)', key: 'percentual_concluido' as keyof OrdersSummary },
      { header: 'Custody', key: 'to_custody_name' as keyof OrdersSummary },
      { header: 'Zone', key: 'to_zone_name' as keyof OrdersSummary },
      { header: 'Due Date', key: 'due_date' as keyof OrdersSummary },
    ];

    const fileName = 'orders_list';
    const title = 'Orders List Report';

    // Use sortedOrders para exportar TODOS os dados filtrados, não apenas a página atual
    switch (format) {
      case 'pdf':
        exportToPDF(sortedOrders, columns, fileName, title, undefined, logo);
        break;
      case 'excel':
        exportToExcel(sortedOrders, columns, fileName, 'Orders');
        break;
      case 'csv':
        exportToCSV(sortedOrders, columns, fileName);
        break;
      case 'text':
        exportToTextTabular(sortedOrders, columns, fileName);
        break;
    }
  };

  
  // ... (manter utility functions existentes)

  const formatStatusName = (status: string) => {
    return status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const getStatusBadgeClass = (status: string) => {
    const classes: Record<string, string> = {
      'complete': 'bg-gradient-to-r from-green-100 to-green-200 text-green-800 border border-green-300',
      'in_progress': 'bg-gradient-to-r from-yellow-100 to-yellow-200 text-yellow-800 border border-yellow-300',
      'info_received': 'bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 border border-blue-300',
      'out_for_delivery': 'bg-gradient-to-r from-purple-100 to-purple-200 text-purple-800 border border-purple-300',
      'delivered': 'bg-gradient-to-r from-teal-100 to-teal-200 text-teal-800 border border-teal-300'
    };
    return classes[status] || 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800 border border-gray-300';
  };

  const getProgressBarColor = (percentage: number) => {
    if (percentage >= 80) return 'bg-gradient-to-r from-green-400 to-green-500';
    if (percentage >= 50) return 'bg-gradient-to-r from-yellow-400 to-yellow-500';
    if (percentage >= 25) return 'bg-gradient-to-r from-orange-400 to-orange-500';
    return 'bg-gradient-to-r from-red-400 to-red-500';
  };

  const SortIcon = ({ field }: { field: keyof OrdersSummary }) => {
    if (sortField !== field) {
      return <span className="text-gray-400">⇅</span>;
    }
    return <span className="text-blue-600">{sortDirection === 'asc' ? '↑' : '↓'}</span>;
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-1/4"></div>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="h-16 bg-gradient-to-r from-gray-100 to-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

return (
  <>
    <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
      {/* Header com Search e Export */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <span className="text-xl">📋</span>
              Orders List
            </h3>
            <p className="text-xs text-gray-600 mt-1">
              {sortedOrders.length} of {orders.length} orders • Click a row to view items
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Search */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search orders..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="pl-10 pr-4 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full sm:w-64 text-xs"
              />
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
                🔍
              </span>
            </div>

            {/* Export Button */}
            <ExportButtons onExport={handleExport} disabled={sortedOrders.length === 0} />
          </div>
        </div>
      </div>
      
      {/* Tabela */}
      <div className="overflow-x-auto" style={{ maxHeight: '600px' }}>
        <div className="overflow-y-auto" style={{ maxHeight: '600px' }}>
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gradient-to-r from-gray-50 to-gray-100 sticky top-0 z-10">
              <tr>
                <th 
                  className="px-4 py-2.5 text-left text-[10px] font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-200 transition-colors"
                  onClick={() => handleSort('code_user_job')}
                >
                  <div className="flex items-center gap-1.5">
                    Order Code
                    <SortIcon field="code_user_job" />
                  </div>
                </th>
                <th 
                  className="px-4 py-2.5 text-left text-[10px] font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-200 transition-colors"
                  onClick={() => handleSort('subject')}
                >
                  <div className="flex items-center gap-1.5">
                    Subject
                    <SortIcon field="subject" />
                  </div>
                </th>
                <th 
                  className="px-4 py-2.5 text-left text-[10px] font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-200 transition-colors"
                  onClick={() => handleSort('job_type_name')}
                >
                  <div className="flex items-center gap-1.5">
                    Job Type
                    <SortIcon field="job_type_name" />
                  </div>
                </th>
                <th 
                  className="px-4 py-2.5 text-left text-[10px] font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-200 transition-colors"
                  onClick={() => handleSort('status_job')}
                >
                  <div className="flex items-center gap-1.5">
                    Status
                    <SortIcon field="status_job" />
                  </div>
                </th>
                <th 
                  className="px-4 py-2.5 text-left text-[10px] font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-200 transition-colors"
                  onClick={() => handleSort('total_items')}
                >
                  <div className="flex items-center gap-1.5">
                    Items
                    <SortIcon field="total_items" />
                  </div>
                </th>
                <th 
                  className="px-4 py-2.5 text-left text-[10px] font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-200 transition-colors"
                  onClick={() => handleSort('percentual_concluido')}
                >
                  <div className="flex items-center gap-1.5">
                    Progress
                    <SortIcon field="percentual_concluido" />
                  </div>
                </th>
                <th 
                  className="px-4 py-2.5 text-left text-[10px] font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-200 transition-colors"
                  onClick={() => handleSort('to_custody_name')}
                >
                  <div className="flex items-center gap-1.5">
                    Custody
                    <SortIcon field="to_custody_name" />
                  </div>
                </th>
                <th 
                  className="px-4 py-2.5 text-left text-[10px] font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-200 transition-colors"
                  onClick={() => handleSort('due_date')}
                >
                  <div className="flex items-center gap-1.5">
                    Due Date
                    <SortIcon field="due_date" />
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {paginatedOrders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <span className="text-6xl">📭</span>
                      <p className="text-gray-500 font-medium">No orders found</p>
                      <p className="text-xs text-gray-400">
                        {searchTerm ? 'Try adjusting your search criteria' : 'No data available'}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedOrders.map((order, index) => (
                  <tr 
                    key={order.id} 
                    onClick={() => handleRowClick(order)}
                    className={`cursor-pointer hover:bg-blue-50 hover:shadow-md transition-all duration-150 ${
                      index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'
                    }`}
                  >
                    <td className="px-4 py-2.5 whitespace-nowrap">
                      <code className="text-[10px] bg-gradient-to-r from-gray-100 to-gray-200 px-2 py-1 rounded-md font-mono font-semibold text-gray-700 border border-gray-300">
                        {order.code_user_job}
                      </code>
                    </td>
                    <td className="px-4 py-2.5">
                      <div className="text-xs font-semibold text-gray-900 max-w-xs truncate" title={order.subject}>
                        {order.subject || '-'}
                      </div>
                      <div className="text-[10px] text-gray-500 font-medium mt-0.5">
                        {order.identifier1}
                      </div>
                    </td>
                    <td className="px-4 py-2.5">
                      <div>
                        <div className="text-xs font-semibold text-gray-900">{order.job_type_name}</div>
                        <div className="text-[10px] text-gray-500 font-medium mt-0.5">{order.job_class_name}</div>
                      </div>
                    </td>
                    <td className="px-4 py-2.5 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-[10px] leading-4 font-bold rounded-full ${getStatusBadgeClass(order.status_job)}`}>
                        {formatStatusName(order.status_job)}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 whitespace-nowrap">
                      <div className="text-xs font-semibold text-gray-900">{order.total_items}</div>
                      <div className="text-[10px] text-gray-500">
                        <span className="font-medium text-green-600">{order.items_concluidos}</span> / {' '}
                        <span className="font-medium text-orange-600">{order.items_pendentes}</span>
                      </div>
                    </td>
                    <td className="px-4 py-2.5 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden shadow-inner">
                          <div
                            className={`h-2 rounded-full transition-all duration-500 ${getProgressBarColor(order.percentual_concluido)}`}
                            style={{ width: `${Math.min(order.percentual_concluido, 100)}%` }}
                          />
                        </div>
                        <span className="text-[10px] font-bold text-gray-700 w-10 text-right">
                          {Number(order.percentual_concluido).toFixed(0)}%
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-2.5">
                      <div>
                        <div className="text-xs font-semibold text-gray-900">{order.to_custody_name}</div>
                        <div className="text-[10px] text-gray-500 font-medium mt-0.5">{order.to_zone_name}</div>
                      </div>
                    </td>
                    <td className="px-4 py-2.5 whitespace-nowrap">
                      <div className="text-xs text-gray-900 font-medium">
                        {new Date(order.due_date).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </div>
                      <div className="text-[10px] text-gray-500">
                        {new Date(order.due_date).toLocaleTimeString('en-US', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination Footer */}
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-3 border-t border-gray-200">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <label className="text-xs text-gray-700 font-medium">Rows per page:</label>
            <select
              value={itemsPerPage}
              onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
              className="border border-gray-300 rounded-lg px-2 py-1 text-xs focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>

          <div className="text-xs text-gray-600 font-medium">
            Showing {startIndex + 1} to {Math.min(endIndex, sortedOrders.length)} of {sortedOrders.length} results
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handlePageChange(1)}
              disabled={currentPage === 1}
              className="px-2 py-1 rounded-lg border border-gray-300 text-xs font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              ««
            </button>
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-2 py-1 rounded-lg border border-gray-300 text-xs font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              ‹
            </button>
            
            <div className="flex gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }
                
                return (
                  <button
                    key={pageNum}
                    onClick={() => handlePageChange(pageNum)}
                    className={`px-2 py-1 rounded-lg text-xs font-medium transition-all ${
                      currentPage === pageNum
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'border border-gray-300 text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-2 py-1 rounded-lg border border-gray-300 text-xs font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              ›
            </button>
            <button
              onClick={() => handlePageChange(totalPages)}
              disabled={currentPage === totalPages}
              className="px-2 py-1 rounded-lg border border-gray-300 text-xs font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              »»
            </button>
          </div>
        </div>
      </div>
    </div>

    {/* Modal */}
    {selectedOrder && (
  <OrderItemsModal
    isOpen={!!selectedOrder}
    onClose={handleCloseModal}
    flowId={selectedOrder.flowId}
    orderCode={selectedOrder.orderCode}
    orderDetails={selectedOrder.orderDetails} // ⭐ Passar orderDetails
  />
)}
  </>
);
}