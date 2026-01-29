// src/components/Logistics/Orders/GlobalMetricsCompact.tsx
import { CheckCircleIcon, ClockIcon, CubeIcon } from '@heroicons/react/24/outline';
import type { GlobalOrderMetrics } from '../../../../../hooks/useOrders';

interface GlobalMetricsCompactProps {
  metrics: GlobalOrderMetrics | null;
}

export function GlobalMetricsCompact({ metrics }: GlobalMetricsCompactProps) {
  if (!metrics) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Total Items */}
      <div className="bg-white rounded-lg shadow-md border-l-4 border-gray-500 p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-600 font-medium mb-1">Total Items</p>
            <p className="text-2xl font-bold text-gray-900">
              {metrics.total_items.toLocaleString()}
            </p>
          </div>
          <div className="bg-gray-100 rounded-full p-3">
            <CubeIcon className="w-6 h-6 text-gray-600" />
          </div>
        </div>
      </div>

      {/* Scanned */}
      <div className="bg-white rounded-lg shadow-md border-l-4 border-green-500 p-4">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-xs text-green-700 font-medium mb-1">Scanned Items</p>
            <p className="text-2xl font-bold text-green-600">
              {metrics.completed_items.toLocaleString()}
            </p>
            <div className="mt-2 flex items-center gap-2">
              <div className="flex-1 bg-gray-200 rounded-full h-1.5">
                <div
                  className="bg-green-500 h-1.5 rounded-full transition-all"
                  style={{ width: `${metrics.percentage_complete}%` }}
                />
              </div>
              <span className="text-xs font-semibold text-green-600">
                {Number(metrics.percentage_complete).toFixed(1)}%
              </span>
            </div>
          </div>
          <div className="bg-green-100 rounded-full p-3">
            <CheckCircleIcon className="w-6 h-6 text-green-600" />
          </div>
        </div>
      </div>

      {/* Not Scanned */}
      <div className="bg-white rounded-lg shadow-md border-l-4 border-orange-500 p-4">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-xs text-orange-700 font-medium mb-1">Not Scanned</p>
            <p className="text-2xl font-bold text-orange-600">
              {metrics.items_pending.toLocaleString()}
            </p>
            <div className="mt-2 flex items-center gap-2">
              <div className="flex-1 bg-gray-200 rounded-full h-1.5">
                <div
                  className="bg-orange-500 h-1.5 rounded-full transition-all"
                  style={{ width: `${metrics.percentage_incomplete}%` }}
                />
              </div>
              <span className="text-xs font-semibold text-orange-600">
                {Number(metrics.percentage_incomplete).toFixed(1)}%
              </span>
            </div>
          </div>
          <div className="bg-orange-100 rounded-full p-3">
            <ClockIcon className="w-6 h-6 text-orange-600" />
          </div>
        </div>
      </div>
    </div>
  );
}