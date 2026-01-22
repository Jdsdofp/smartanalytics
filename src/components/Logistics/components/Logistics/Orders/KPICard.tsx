// src/components/Logistics/Orders/KPICard.tsx
interface KPICardProps {
  title: string;
  value: number | string;
  subtitle?: string;
  icon?: string;
  color?: 'blue' | 'green' | 'yellow' | 'purple' | 'indigo' | 'red';
  trend?: {
    value: number;
    direction: 'up' | 'down' | 'neutral';
  };
}

export function KPICard({ title, value, subtitle, icon, color = 'blue', trend }: KPICardProps) {
  const colorClasses = {
    blue: 'border-blue-500 text-blue-500',
    green: 'border-green-500 text-green-500',
    yellow: 'border-yellow-500 text-yellow-500',
    purple: 'border-purple-500 text-purple-500',
    indigo: 'border-indigo-500 text-indigo-500',
    red: 'border-red-500 text-red-500'
  };

  const trendClasses = {
    up: 'text-green-600',
    down: 'text-red-600',
    neutral: 'text-gray-600'
  };

  return (
    <div className={`bg-white rounded-lg shadow-md p-6 border-l-4 ${colorClasses[color].split(' ')[0]} hover:shadow-lg transition-shadow`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex-1">
          <p className="text-sm text-gray-600 font-medium uppercase tracking-wide">{title}</p>
          <p className="text-3xl font-bold mt-2 text-gray-900">{value}</p>
          {subtitle && (
            <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
          )}
          {trend && (
            <div className={`flex items-center gap-1 mt-2 text-sm font-semibold ${trendClasses[trend.direction]}`}>
              {trend.direction === 'up' && '↑'}
              {trend.direction === 'down' && '↓'}
              {trend.direction === 'neutral' && '→'}
              <span>{Math.abs(trend.value)}%</span>
            </div>
          )}
        </div>
        {icon && (
          <div className={`text-4xl ${colorClasses[color].split(' ')[1]}`}>
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}