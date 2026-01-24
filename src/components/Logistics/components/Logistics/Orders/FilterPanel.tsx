// src/components/Logistics/Orders/FilterPanel.tsx
import { useState, useEffect } from 'react';
import { 
  FunnelIcon, 
  MagnifyingGlassIcon,
  CalendarIcon,
  XMarkIcon,
  CheckIcon
} from '@heroicons/react/24/outline';
import type { OrderFilters } from '../../../../../hooks/useOrders';

interface FilterPanelProps {
  onApplyFilters: (filters: OrderFilters) => void;
  onResetFilters: () => void;
  initialFilters?: OrderFilters;
}

export function FilterPanel({ onApplyFilters, onResetFilters, initialFilters }: FilterPanelProps) {
  const [filters, setFilters] = useState<OrderFilters>({});
  const [isExpanded, setIsExpanded] = useState(false);

  // =====================================
  // 🔄 SYNC WITH INITIAL FILTERS
  // =====================================
  useEffect(() => {
    console.log('FilterPanel - initialFilters received:', initialFilters);
    if (initialFilters && Object.keys(initialFilters).length > 0) {
      setFilters(initialFilters);
      console.log('FilterPanel - filters updated to:', initialFilters);
    }
  }, [initialFilters]);

  const statusOptions = [
    { value: 'complete', label: 'Complete', color: 'green' },
    { value: 'in_progress', label: 'In Progress', color: 'orange' },
    { value: 'info_received', label: 'Info Received', color: 'blue' },
    { value: 'out_for_delivery', label: 'Out for Delivery', color: 'purple' },
    { value: 'delivered', label: 'Delivered', color: 'teal' }
  ];

  const handleApply = () => {
    console.log('Applying filters:', filters);
    onApplyFilters(filters);
  };

  const handleReset = () => {
    console.log('Resetting filters');
    setFilters({});
    onResetFilters();
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.startDate) count++;
    if (filters.endDate) count++;
    if (filters.searchTerm) count++;
    if (filters.status && filters.status.length > 0) count += filters.status.length;
    if (filters.jobTypes && filters.jobTypes.length > 0) count += filters.jobTypes.length;
    return count;
  };

  // Helper para formatar data para input type="date" (YYYY-MM-DD)
  const formatDateForInput = (dateString: string | undefined): string => {
    if (!dateString) return '';
    
    console.log('formatDateForInput input:', dateString);
    
    // Se já está no formato YYYY-MM-DD, retorna direto
    if (dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
      return dateString;
    }
    
    // Se tem hora junto (YYYY-MM-DD HH:mm:ss), extrai só a data
    if (dateString.includes(' ')) {
      return dateString.split(' ')[0];
    }
    
    return dateString;
  };

  // Helper para formatar data para exibição (DD/MM/YYYY)
  const formatDateForDisplay = (dateString: string | undefined): string => {
    if (!dateString) return '';
    
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  const activeCount = getActiveFiltersCount();

  // Debug: log do estado atual
  useEffect(() => {
    console.log('FilterPanel - current filters state:', filters);
    console.log('FilterPanel - active count:', activeCount);
  }, [filters, activeCount]);

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden mb-8">
      {/* Header - Always Visible */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-blue-500 rounded-xl p-2.5 shadow-lg">
              <FunnelIcon className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">Filters</h3>
              <p className="text-xs text-gray-600">
                {activeCount > 0 ? `${activeCount} active filter${activeCount > 1 ? 's' : ''}` : 'No filters applied'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {activeCount > 0 && (
              <button
                onClick={handleReset}
                className="cursor-pointer text-sm text-red-600 hover:text-red-700 font-medium px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors flex items-center gap-1"
              >
                <XMarkIcon className="w-4 h-4" />
                Clear All
              </button>
            )}
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="cursor-pointer text-sm text-blue-600 hover:text-blue-700 font-medium px-3 py-1.5 rounded-lg hover:bg-blue-100 transition-colors"
            >
              {isExpanded ? 'Hide' : 'Show'} Filters
            </button>
          </div>
        </div>
      </div>

      {/* Filter Content - Collapsible */}
      {isExpanded && (
        <div className="p-6 space-y-6">
          {/* Date Range & Search */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Start Date */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <CalendarIcon className="cursor-pointer w-4 h-4 text-gray-500" />
                Start Date
              </label>
              <input
                type="date"
                value={formatDateForInput(filters.startDate)}
                onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                className="cursor-pointer w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
              {/* {filters.startDate && (
                <p className="mt-1.5 text-xs text-gray-600 flex items-center gap-1">
                  <CalendarIcon className="w-3 h-3" />
                  Selected: {formatDateForDisplay(filters.startDate)}
                </p>
              )} */}
            </div>

            {/* End Date */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <CalendarIcon className="cursor-pointer w-4 h-4 text-gray-500" />
                End Date
              </label>
              <input
                type="date"
                value={formatDateForInput(filters.endDate)}
                onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                className="cursor-pointer w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
              {/* {filters.endDate && (
                <p className="mt-1.5 text-xs text-gray-600 flex items-center gap-1">
                  <CalendarIcon className="w-3 h-3" />
                  Selected: {formatDateForDisplay(filters.endDate)}
                </p>
              )} */}
            </div>

            {/* Search */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <MagnifyingGlassIcon className="w-4 h-4 text-gray-500" />
                Search
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Order code, job type..."
                  value={filters.searchTerm || ''}
                  onChange={(e) => setFilters({ ...filters, searchTerm: e.target.value })}
                  className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
                <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
              {filters.searchTerm && (
                <p className="mt-1.5 text-xs text-gray-600">
                  Searching for: <span className="font-semibold">"{filters.searchTerm}"</span>
                </p>
              )}
            </div>
          </div>

          {/* Status Filters */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Order Status
            </label>
            <div className="flex flex-wrap gap-3">
              {statusOptions.map(({ value, label, color }) => {
                const isSelected = filters.status?.includes(value) || false;
                
                const colorClasses: Record<string, string> = {
                  green: isSelected 
                    ? 'bg-green-500 text-white border-green-500' 
                    : 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100',
                  orange: isSelected 
                    ? 'bg-orange-500 text-white border-orange-500' 
                    : 'bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100',
                  blue: isSelected 
                    ? 'bg-blue-500 text-white border-blue-500' 
                    : 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100',
                  purple: isSelected 
                    ? 'bg-purple-500 text-white border-purple-500' 
                    : 'bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100',
                  teal: isSelected 
                    ? 'bg-teal-500 text-white border-teal-500' 
                    : 'bg-teal-50 text-teal-700 border-teal-200 hover:bg-teal-100'
                };

                return (
                  <button
                    key={value}
                    onClick={() => {
                      const newStatus = isSelected
                        ? (filters.status || []).filter(s => s !== value)
                        : [...(filters.status || []), value];
                      setFilters({ 
                        ...filters, 
                        status: newStatus.length > 0 ? newStatus : undefined 
                      });
                    }}
                    className={`
                     cursor-pointer px-4 py-2.5 rounded-xl border-2 font-medium text-sm
                      transition-all duration-200
                      flex items-center gap-2
                      ${colorClasses[color]}
                    `}
                  >
                    {isSelected && <CheckIcon className="w-4 h-4" />}
                    {label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-200">
            <div className="text-sm text-gray-600">
              {activeCount > 0 && (
                <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full font-medium">
                  {activeCount} filter{activeCount > 1 ? 's' : ''} active
                </span>
              )}
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={handleReset}
                className="cursor-pointer px-6 py-2.5 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all font-medium flex items-center gap-2"
              >
                <XMarkIcon className="w-4 h-4" />
                Reset
              </button>
              <button
                onClick={handleApply}
                className="cursor-pointer px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all font-medium shadow-lg shadow-blue-500/30 flex items-center gap-2"
              >
                <CheckIcon className="w-4 h-4" />
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Active Filters Summary (quando collapsed) */}
      {!isExpanded && activeCount > 0 && (
        <div className="px-6 py-3 bg-gray-50 border-t border-gray-200">
          <div className="flex flex-wrap gap-2">
            {filters.startDate && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-xs font-medium">
                <CalendarIcon className="w-3 h-3" />
                From: {formatDateForDisplay(filters.startDate)}
              </span>
            )}
            {filters.endDate && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-xs font-medium">
                <CalendarIcon className="w-3 h-3" />
                To: {formatDateForDisplay(filters.endDate)}
              </span>
            )}
            {filters.searchTerm && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-700 rounded-lg text-xs font-medium">
                <MagnifyingGlassIcon className="w-3 h-3" />
                Search: {filters.searchTerm}
              </span>
            )}
            {filters.status?.map(status => (
              <span key={status} className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-lg text-xs font-medium">
                Status: {status.replace(/_/g, ' ')}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}