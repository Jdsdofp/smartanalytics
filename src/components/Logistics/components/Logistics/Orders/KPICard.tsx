// src/components/Logistics/Orders/KPICard.tsx
import React from 'react';

interface KPICardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  color: 'blue' | 'green' | 'yellow' | 'orange' | 'purple' | 'red' | 'teal';
  onClick?: () => void;
}

export function KPICard({ title, value, subtitle, icon, color, onClick }: KPICardProps) {
  const colorClasses = {
    blue: {
      bg: 'bg-blue-50',
      border: 'border-blue-500',
      iconBg: 'bg-blue-500',
      textValue: 'text-blue-600',
      textTitle: 'text-blue-700',
      glow: 'shadow-blue-200'
    },
    green: {
      bg: 'bg-green-50',
      border: 'border-green-500',
      iconBg: 'bg-green-500',
      textValue: 'text-green-600',
      textTitle: 'text-green-700',
      glow: 'shadow-green-200'
    },
    yellow: {
      bg: 'bg-yellow-50',
      border: 'border-yellow-500',
      iconBg: 'bg-yellow-500',
      textValue: 'text-yellow-600',
      textTitle: 'text-yellow-700',
      glow: 'shadow-yellow-200'
    },
    orange: {
      bg: 'bg-orange-50',
      border: 'border-orange-500',
      iconBg: 'bg-orange-500',
      textValue: 'text-orange-600',
      textTitle: 'text-orange-700',
      glow: 'shadow-orange-200'
    },
    purple: {
      bg: 'bg-purple-50',
      border: 'border-purple-500',
      iconBg: 'bg-purple-500',
      textValue: 'text-purple-600',
      textTitle: 'text-purple-700',
      glow: 'shadow-purple-200'
    },
    red: {
      bg: 'bg-red-50',
      border: 'border-red-500',
      iconBg: 'bg-red-500',
      textValue: 'text-red-600',
      textTitle: 'text-red-700',
      glow: 'shadow-red-200'
    },
    teal: {
      bg: 'bg-teal-50',
      border: 'border-teal-500',
      iconBg: 'bg-teal-500',
      textValue: 'text-teal-600',
      textTitle: 'text-teal-700',
      glow: 'shadow-teal-200'
    }
  };

  const colors = colorClasses[color];

  return (
    <div
      className={`
        relative
        ${colors.bg}
        rounded-2xl
        border-b-4 ${colors.border}
        shadow-lg ${colors.glow}
        transition-all duration-300
        hover:shadow-xl hover:scale-[1.02] hover:-translate-y-1
        ${onClick ? 'cursor-pointer' : ''}
        overflow-hidden
      `}
      onClick={onClick}
    >
      {/* Card Content */}
      <div className="p-5 flex items-center gap-4">
        {/* Icon Circle */}
        <div className={`
          ${colors.iconBg}
          rounded-full
          w-14 h-14
          flex items-center justify-center
          shadow-lg
          flex-shrink-0
        `}>
          <div className="text-white">
            {icon}
          </div>
        </div>

        {/* Text Content */}
        <div className="flex-1 min-w-0">
          {/* Title */}
          <h3 className={`${colors.textTitle} text-xs font-medium mb-1`}>
            {title}
          </h3>

          {/* Value */}
          <div className={`${colors.textValue} text-3xl font-bold tracking-tight`}>
            {value}
          </div>

          {/* Subtitle */}
          {subtitle && (
            <p className="text-gray-600 text-xs mt-1 font-medium">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      {/* Subtle Background Decoration */}
      <div className="absolute top-0 right-0 w-32 h-32 opacity-5">
        <div className={`${colors.iconBg} rounded-full w-full h-full -translate-y-8 translate-x-8`}></div>
      </div>
    </div>
  );
}