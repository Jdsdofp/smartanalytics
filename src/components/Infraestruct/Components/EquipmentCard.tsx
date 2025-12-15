// EquipmentCard.tsx
import React from 'react';
import { useTranslation } from 'react-i18next';
import { 
  CheckCircleIcon, 
  XCircleIcon, 
  QuestionMarkCircleIcon,
  DevicePhoneMobileIcon 
} from '@heroicons/react/24/outline';

interface CardData {
  label: string;
  value: number;
  percentage?: number;
}

interface EquipmentCardProps {
  card: CardData;
  cardKey: 'total' | 'online' | 'offline' | 'noData';
  isLoading?: boolean;
}

const cardConfig = {
  total: {
    gradient: 'from-blue-500 to-blue-600',
    bgGradient: 'from-blue-50 to-blue-100',
    icon: DevicePhoneMobileIcon,
    iconColor: 'text-blue-600',
    borderColor: 'border-blue-200',
    hoverShadow: 'hover:shadow-blue-200/50',
    glowColor: '#3b82f6'
  },
  online: {
    gradient: 'from-green-500 to-emerald-600',
    bgGradient: 'from-green-50 to-emerald-100',
    icon: CheckCircleIcon,
    iconColor: 'text-green-600',
    borderColor: 'border-green-200',
    hoverShadow: 'hover:shadow-green-200/50',
    glowColor: '#10b981'
  },
  offline: {
    gradient: 'from-red-500 to-rose-600',
    bgGradient: 'from-red-50 to-rose-100',
    icon: XCircleIcon,
    iconColor: 'text-red-600',
    borderColor: 'border-red-200',
    hoverShadow: 'hover:shadow-red-200/50',
    glowColor: '#ef4444'
  },
  noData: {
    gradient: 'from-gray-500 to-gray-600',
    bgGradient: 'from-gray-50 to-gray-100',
    icon: QuestionMarkCircleIcon,
    iconColor: 'text-gray-600',
    borderColor: 'border-gray-200',
    hoverShadow: 'hover:shadow-gray-200/50',
    glowColor: '#6b7280'
  }
};

export const EquipmentCard: React.FC<EquipmentCardProps> = ({ card, cardKey, isLoading = false }) => {
  const { t } = useTranslation();
  const config = cardConfig[cardKey];
  const Icon = config.icon;

  // Busca a tradução baseada no cardKey
  const translatedTitle = t(`dashboardCard.equipmentCards.${cardKey}`);

  return (
    <div className="relative">
      <div className={`
        relative overflow-hidden
        bg-white rounded-lg 
        border-2 ${config.borderColor}
        shadow-lg ${config.hoverShadow}
        transition-all duration-300 ease-in-out
        hover:scale-105 hover:shadow-xl
        group cursor-pointer
      `}>
        {/* Borda animada no topo quando loading */}
        {isLoading && (
          <div className="absolute top-0 left-0 right-0 h-[2px] overflow-hidden rounded-t-lg">
            <div 
              className="absolute inset-0 w-full h-full"
              style={{
                animation: 'slideRight 1.5s ease-in-out infinite',
                background: `linear-gradient(to right, transparent 0%, ${config.glowColor} 50%, transparent 100%)`,
              }}
            />
          </div>
        )}

        {/* Gradiente de fundo sutil */}
        <div className={`absolute inset-0 bg-gradient-to-br ${config.bgGradient} opacity-50`} />
        
        {/* Efeito de brilho no hover */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-10 transform -skew-x-12 group-hover:translate-x-full transition-all duration-700" />

        <div className="relative px-3 py-4">
          <div className="flex items-center justify-between mb-2">
            {/* Ícone com gradiente + Label ao lado */}
            <div className="flex items-center gap-2">
              <div className={`
                inline-flex p-1.5 rounded-md
                bg-gradient-to-br ${config.gradient}
                shadow-md group-hover:shadow-lg
                transition-shadow duration-300
                ${isLoading ? 'animate-pulse' : ''}
              `}>
                <Icon className="h-4 w-4 text-white" />
              </div>
              
              {/* Label traduzido ao lado do ícone */}
              <p className={`text-xs font-semibold uppercase tracking-wide ${config.iconColor}`}>
                {translatedTitle}
              </p>
            </div>
            
            {/* Percentual */}
            {card.percentage !== undefined && (
              <span className={`text-xs font-semibold ${config.iconColor} ${isLoading ? 'animate-pulse' : ''}`}>
                {card.percentage}%
              </span>
            )}
          </div>

          {/* Valor */}
          <div className="mb-2">
            <span className={`
              text-2xl font-bold bg-gradient-to-r ${config.gradient} 
              bg-clip-text text-transparent
              ${isLoading ? 'animate-pulse' : ''}
            `}>
              {card.value.toLocaleString('pt-BR')}
            </span>
          </div>

          {/* Barra de progresso */}
          {card.percentage !== undefined && (
            <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className={`h-full bg-gradient-to-r ${config.gradient} rounded-full transition-all duration-500 ease-out ${
                  isLoading ? 'animate-pulse' : ''
                }`}
                style={{ width: `${Math.min(card.percentage, 100)}%` }}
              />
            </div>
          )}
        </div>
      </div>

      {/* Adicionar keyframes no style global ou inline */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes slideRight {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
      `}} />
    </div>
  );
};