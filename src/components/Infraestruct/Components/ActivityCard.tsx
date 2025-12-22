// ActivityCard.tsx
import React from 'react';
import { useTranslation } from 'react-i18next';
import { 
  BoltIcon, 
  ClockIcon, 
  MapPinIcon
} from '@heroicons/react/24/outline';

interface CardData {
  label: string;
  value: number;
}

interface ActivityCardProps {
  card: CardData;
  cardKey: 'activeLastHour' | 'silent24h' | 'inactiveToday';
  isLoading?: boolean;
}

const cardConfig = {
  activeLastHour: {
    gradient: 'from-cyan-500 to-blue-600',
    bgGradient: 'from-cyan-50 to-blue-100',
    icon: BoltIcon,
    iconColor: 'text-cyan-600',
    borderColor: 'border-cyan-200',
    hoverShadow: 'hover:shadow-cyan-200/50',
    pulseColor: 'bg-cyan-400',
    glowColor: '#06b6d4'
  },
  silent24h: {
    gradient: 'from-amber-500 to-orange-600',
    bgGradient: 'from-amber-50 to-orange-100',
    icon: ClockIcon,
    iconColor: 'text-amber-600',
    borderColor: 'border-amber-200',
    hoverShadow: 'hover:shadow-amber-200/50',
    pulseColor: 'bg-amber-400',
    glowColor: '#f59e0b'
  },
  inactiveToday: {
    gradient: 'from-rose-500 to-purple-600',
    bgGradient: 'from-rose-50 to-purple-100',
    icon: MapPinIcon,
    iconColor: 'text-purple-600',
    borderColor: 'border-purple-200',
    hoverShadow: 'hover:shadow-purple-200/50',
    pulseColor: 'bg-purple-400',
    glowColor: '#b53ff4ff'
  }
};

export const ActivityCard: React.FC<ActivityCardProps> = ({ card, cardKey, isLoading = false }) => {
  const { t } = useTranslation();
  const config = cardConfig[cardKey];
  const Icon = config.icon;

  // Busca a tradução baseada no cardKey
  const translatedTitle = t(`dashboardCard.activityCards.${cardKey}`);

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

        {/* Gradiente de fundo */}
        <div className={`absolute inset-0 bg-gradient-to-br ${config.bgGradient} opacity-50`} />
        
        {/* Efeito de brilho */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-10 transform -skew-x-12 group-hover:translate-x-full transition-all duration-700" />

        <div className="relative p-3">
          {/* Ícone com pulse animation + Label ao lado */}
          <div className="flex items-center gap-2 mb-2">
            <div className="relative inline-flex">
              {cardKey === 'activeLastHour' && !isLoading && (
                <span className={`absolute inline-flex h-full w-full rounded-md ${config.pulseColor} opacity-75 animate-ping`} />
              )}
              <div className={`
                relative inline-flex p-1.5 rounded-md
                bg-gradient-to-br ${config.gradient}
                shadow-md group-hover:shadow-lg
                transition-shadow duration-300
                ${isLoading ? 'animate-pulse' : ''}
              `}>
                <Icon className="h-4 w-4 text-white" />
              </div>
            </div>
            
            {/* Label traduzido ao lado do ícone */}
            <p className={`text-xs font-semibold uppercase tracking-wide leading-tight ${config.iconColor}`}>
              {translatedTitle}
            </p>
          </div>

          {/* Valor com animação de contagem */}
          <div className="flex items-baseline gap-1.5">
            <span className={`
              text-2xl font-bold bg-gradient-to-r ${config.gradient} 
              bg-clip-text text-transparent
              group-hover:scale-110 transition-transform duration-300
              ${isLoading ? 'animate-pulse' : ''}
            `}>
              {card.value.toLocaleString('pt-BR')}
            </span>
            <span className="text-xs font-medium text-gray-500">
              {t('dashboardCard.activityCards.devices')}
            </span>
          </div>

          {/* Indicador visual */}
          <div className="mt-2 flex gap-0.5">
            {[...Array(5)].map((_, i) => (
              <div 
                key={i}
                className={`
                  h-1 flex-1 rounded-full
                  ${i < Math.min(Math.ceil((card.value / 100) * 5), 5) 
                    ? `bg-gradient-to-r ${config.gradient}` 
                    : 'bg-gray-200'}
                  transition-all duration-300
                  ${isLoading ? 'animate-pulse' : ''}
                `}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Adicionar keyframes */}
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