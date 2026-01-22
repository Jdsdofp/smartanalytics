// src/components/Logistics/Orders/FilterPanel.tsx
import { useState } from 'react';
import type { OrderFilters } from '../../../../../hooks/useOrders';

interface FilterPanelProps {
  onApplyFilters: (filters: OrderFilters) => void;
  onResetFilters: () => void;
}

export function FilterPanel({ onApplyFilters, onResetFilters }: FilterPanelProps) {
  const [filters, setFilters] = useState<OrderFilters>({});

  const handleApply = () => {
    onApplyFilters(filters);
  };

  const handleReset = () => {
    setFilters({});
    onResetFilters();
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-8">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <span>🔍</span>
          Filters
        </h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Date Range */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
          <input
            type="date"
            value={filters.startDate || ''}
            onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
          <input
            type="date"
            value={filters.endDate || ''}
            onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Search */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
          <input
            type="text"
            placeholder="Order code or name..."
            value={filters.searchTerm || ''}
            onChange={(e) => setFilters({ ...filters, searchTerm: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Buttons */}
        <div className="flex items-end gap-2">
          <button
            onClick={handleApply}
            className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors font-medium"
          >
            Apply
          </button>
          <button
            onClick={handleReset}
            className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
          >
            Reset
          </button>
        </div>
      </div>

      {/* Status Filters */}
      <div className="mt-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
        <div className="flex flex-wrap gap-2">
          {['complete', 'in_progress', 'info_received', 'out_for_delivery', 'delivered'].map(status => (
            <label key={status} className="inline-flex items-center">
              <input
                type="checkbox"
                checked={filters.status?.includes(status) || false}
                onChange={(e) => {
                  const newStatus = e.target.checked
                    ? [...(filters.status || []), status]
                    : (filters.status || []).filter(s => s !== status);
                  setFilters({ ...filters, status: newStatus.length > 0 ? newStatus : undefined });
                }}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700 capitalize">
                {status.replace(/_/g, ' ')}
              </span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}