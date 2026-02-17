// src/components/Map/ImprovedPersonSensorPopup.tsx

import { Popup } from 'react-leaflet';
import { useTranslation } from 'react-i18next';
import {
  UserCircleIcon,
  MapPinIcon,
  BoltIcon,
  FireIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  SignalIcon,
  HeartIcon,
  ArrowPathIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';

// =====================================
// 📊 INTERFACES
// =====================================

interface PersonSensorData {
  sensor_id?: number;
  person_id?: number;
  person_code?: string;
  person_name?: string;
  is_active?: boolean;
  dev_uid?: string;
  sensor_model?: string;
  
  category_name?: string;
  role_name?: string;
  department_name?: string;
  group_name?: string;
  
  status_name?: string;
  
  current_zone_description?: string;
  current_area_description?: string;
  current_site_name?: string;
  
  latitude?: number;
  longitude?: number;
  
  temperature?: number;
  temperature_unit?: string;
  temperature_category?: string;
  
  battery_level?: number;
  battery_status?: string;
  battery_charging?: string;
  
  motion_status?: string;
  motion_minutes_ago?: number;
  
  mandown_alert_status?: string;
  alert_priority?: number;
  has_any_alert?: boolean;
  
  last_report_datetime?: string;
  minutes_since_report?: number;
  hours_since_report?: number;
  report_freshness?: string;
  
  health_score?: number;
  is_at_risk?: boolean;
  is_alarmed?: boolean;
  
  Image_hash?: string;
}

interface PersonSensorMapPopupProps {
  sensor: PersonSensorData;
  loading?: boolean;
  onViewDetails?: (sensor: PersonSensorData) => void;
  onTracking?: (sensor: PersonSensorData) => void;
}

// =====================================
// 🎨 COMPONENTES AUXILIARES
// =====================================

const BatteryIndicator: React.FC<{ level?: number; status?: string; charging?: string }> = ({ 
  level, 
  status,
  charging 
}) => {
  const { t } = useTranslation();
  
  if (level === undefined) return null;

  const getBatteryColor = () => {
    if (level > 70) return '#10b981';
    if (level > 40) return '#eab308';
    if (level > 20) return '#f97316';
    return '#ef4444';
  };

  const isCharging = charging?.toUpperCase().includes('CHARGING') || 
                     charging?.toUpperCase().includes('YES');
  
  const isCritical = level <= 20;

  return (
    <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm p-2 rounded-lg border border-gray-200/50">
      <div className="relative flex-shrink-0">
        <svg width="32" height="18" viewBox="0 0 32 18" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect 
            x="1" 
            y="2" 
            width="26" 
            height="14" 
            rx="2" 
            stroke="#6b7280" 
            strokeWidth="1.5"
            fill="white"
          />
          <rect 
            x="2.5" 
            y="3.5" 
            width={`${(level / 100) * 23}`}
            height="11" 
            rx="1" 
            fill={getBatteryColor()}
          />
          <rect 
            x="27" 
            y="6" 
            width="4" 
            height="6" 
            rx="1" 
            fill="#6b7280"
          />
          {isCharging && (
            <g>
              <path 
                d="M15 4L12 10H16L13 16" 
                stroke="#eab308" 
                strokeWidth="1.5" 
                strokeLinecap="round" 
                strokeLinejoin="round"
                fill="none"
              />
            </g>
          )}
        </svg>
        
        {isCharging && (
          <div className="absolute -top-1 -right-1">
            <BoltIcon className="h-3 w-3 text-yellow-500 animate-pulse" />
          </div>
        )}
        
        {isCritical && !isCharging && (
          <div className="absolute -top-1 -right-1">
            <ExclamationTriangleIcon className="h-3.5 w-3.5 text-red-600 animate-bounce" />
          </div>
        )}
      </div>

      <div className="flex-1">
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] text-gray-600 font-medium">{t('personSensorPopup.battery')}:</span>
          <span className={`text-xs font-bold ${isCritical ? 'text-red-600' : 'text-gray-900'}`}>
            {level}%
          </span>
          {isCritical && !isCharging && (
            <span className="text-[9px] text-red-600 font-bold animate-pulse">
              ⚠️ {t('personSensorPopup.critical')}
            </span>
          )}
        </div>
        {status && <div className="text-[9px] text-gray-500">{status}</div>}
        {isCharging && <div className="text-[9px] text-yellow-600 font-medium">⚡ {t('personSensorPopup.charging')}</div>}
      </div>
    </div>
  );
};

const MotionCard: React.FC<{ status?: string; minutes_ago?: number }> = ({ 
  status, 
  minutes_ago 
}) => {
  const { t } = useTranslation();
  
  if (!status) return null;

  const isMoving = status.toUpperCase().includes('MOTION') || 
                   status.toUpperCase().includes('MOVING');

  return (
    <div className={`bg-gradient-to-br ${isMoving ? 'from-green-50 via-emerald-50 to-teal-50' : 'from-gray-50 to-slate-50'} border ${isMoving ? 'border-green-300' : 'border-gray-300'} rounded-lg p-2 shadow-sm hover:shadow-md transition-all`}>
      <div className="flex items-center gap-1.5 mb-1">
        <div className={`w-2.5 h-2.5 rounded-full ${isMoving ? 'bg-green-500 animate-pulse shadow-lg shadow-green-500/50' : 'bg-gray-400'}`} />
        <span className="text-[9px] font-semibold text-gray-600 uppercase tracking-wide">{t('personSensorPopup.movement')}</span>
      </div>
      <div className={`text-sm font-bold ${isMoving ? 'text-green-700' : 'text-gray-700'} mb-0.5`}>
        {isMoving ? `🏃 ${t('personSensorPopup.moving')}` : `🛑 ${t('personSensorPopup.stopped')}`}
      </div>
      {minutes_ago !== undefined && (
        <div className="text-[9px] text-gray-600 font-medium">
          {t('personSensorPopup.ago')} {minutes_ago < 60 ? `${minutes_ago}${t('personSensorPopup.minutes')}` : `${Math.floor(minutes_ago / 60)}${t('personSensorPopup.hours')}`}
        </div>
      )}
    </div>
  );
};

const TemperatureCard: React.FC<{ 
  temperature?: number; 
  unit?: string;
  category?: string;
}> = ({ temperature, unit = '°C', category }) => {
  const { t } = useTranslation();
  
  if (temperature === undefined) return null;

  const getTempColor = () => {
    if (temperature > 35) return { 
      bg: 'from-red-50 via-red-100 to-orange-100', 
      border: 'border-red-300', 
      text: 'text-red-600', 
      icon: 'text-red-500',
      glow: 'shadow-red-500/30'
    };
    if (temperature > 28) return { 
      bg: 'from-orange-50 via-orange-100 to-yellow-100', 
      border: 'border-orange-300', 
      text: 'text-orange-600', 
      icon: 'text-orange-500',
      glow: 'shadow-orange-500/30'
    };
    if (temperature < 10) return { 
      bg: 'from-blue-50 via-cyan-50 to-sky-100', 
      border: 'border-blue-300', 
      text: 'text-blue-600', 
      icon: 'text-blue-500',
      glow: 'shadow-blue-500/30'
    };
    return { 
      bg: 'from-green-50 via-emerald-50 to-teal-100', 
      border: 'border-green-300', 
      text: 'text-green-600', 
      icon: 'text-green-500',
      glow: 'shadow-green-500/30'
    };
  };

  const colors = getTempColor();

  return (
    <div className={`bg-gradient-to-br ${colors.bg} border ${colors.border} rounded-lg p-2 shadow-sm hover:shadow-md ${colors.glow} transition-all`}>
      <div className="flex items-center gap-1.5 mb-1">
        <FireIcon className={`h-3.5 w-3.5 ${colors.icon}`} />
        <span className="text-[9px] font-semibold text-gray-600 uppercase tracking-wide">{t('personSensorPopup.temperature')}</span>
      </div>
      <div className={`text-lg font-bold ${colors.text} leading-none mb-0.5`}>
        {Number(temperature).toFixed(1)}{unit}
      </div>
      {category && (
        <div className="text-[9px] text-gray-600 font-medium">
          {category}
        </div>
      )}
    </div>
  );
};

const HealthScoreCard: React.FC<{ score?: number; is_at_risk?: boolean }> = ({ 
  score, 
  is_at_risk 
}) => {
  const { t } = useTranslation();
  
  if (score === undefined) return null;

  const getScoreColors = () => {
    if (score >= 80) return { 
      bg: 'from-green-50 via-emerald-100 to-teal-100', 
      border: 'border-green-300', 
      text: 'text-green-600', 
      icon: 'text-green-500',
      glow: 'shadow-green-500/30'
    };
    if (score >= 60) return { 
      bg: 'from-yellow-50 via-yellow-100 to-amber-100', 
      border: 'border-yellow-300', 
      text: 'text-yellow-600', 
      icon: 'text-yellow-500',
      glow: 'shadow-yellow-500/30'
    };
    if (score >= 40) return { 
      bg: 'from-orange-50 via-orange-100 to-red-100', 
      border: 'border-orange-300', 
      text: 'text-orange-600', 
      icon: 'text-orange-500',
      glow: 'shadow-orange-500/30'
    };
    return { 
      bg: 'from-red-50 via-red-100 to-rose-100', 
      border: 'border-red-300', 
      text: 'text-red-600', 
      icon: 'text-red-500',
      glow: 'shadow-red-500/30'
    };
  };

  const getScoreLabel = () => {
    if (score >= 80) return t('personSensorPopup.excellent');
    if (score >= 60) return t('personSensorPopup.good');
    if (score >= 40) return t('personSensorPopup.regular');
    return t('personSensorPopup.critical_status');
  };

  const colors = getScoreColors();

  return (
    <div className={`bg-gradient-to-br ${colors.bg} border ${colors.border} rounded-lg p-2 shadow-sm hover:shadow-md ${colors.glow} transition-all`}>
      <div className="flex items-center gap-1.5 mb-1">
        <HeartIcon className={`h-3.5 w-3.5 ${colors.icon} ${score < 60 ? 'animate-pulse' : ''}`} />
        <span className="text-[9px] font-semibold text-gray-600 uppercase tracking-wide">{t('personSensorPopup.health')}</span>
      </div>
      <div className={`text-2xl font-bold ${colors.text} leading-none mb-0.5`}>
        {score}
      </div>
      <div className="text-[10px] text-gray-600 font-medium">
        {getScoreLabel()}
      </div>
      {is_at_risk && (
        <div className="flex items-center gap-0.5 text-red-600 text-[9px] font-bold mt-1 bg-red-100 px-1.5 py-0.5 rounded animate-pulse">
          <ExclamationTriangleIcon className="h-2.5 w-2.5" />
          {t('personSensorPopup.at_risk')}
        </div>
      )}
    </div>
  );
};

const AlertBadge: React.FC<{ has_alert?: boolean; priority?: number; status?: string }> = ({ 
  has_alert, 
  priority, 
  status 
}) => {
  const { t } = useTranslation();


  
  if (!has_alert) return null;

  const getPriorityColor = () => {
    if (!priority) return 'bg-gradient-to-r from-yellow-100 to-yellow-200 text-yellow-800 border-yellow-400 shadow-yellow-500/30';
    if (priority >= 8) return 'bg-gradient-to-r from-red-100 to-red-200 text-red-800 border-red-400 animate-pulse shadow-lg shadow-red-500/50';
    if (priority >= 5) return 'bg-gradient-to-r from-orange-100 to-orange-200 text-orange-800 border-orange-400 shadow-orange-500/30';
    return 'bg-gradient-to-r from-yellow-100 to-yellow-200 text-yellow-800 border-yellow-400 shadow-yellow-500/30';
  };

  return (
    <div className={`px-2.5 py-1.5 rounded-lg border-2 ${getPriorityColor()} font-medium text-xs flex items-center gap-2 shadow-md`}>
      <ExclamationTriangleIcon className="h-4 w-4 animate-pulse" />
      <div>
        <div className="font-bold">{status || t('personSensorPopup.active_alert')}</div>
        {priority && <div className="text-[9px] opacity-80">{t('personSensorPopup.priority')}: {priority}</div>}
      </div>
    </div>
  );
};

// =====================================
// 🗺️ COMPONENTE PRINCIPAL
// =====================================

export const ImprovedPersonSensorPopup: React.FC<PersonSensorMapPopupProps> = ({
  sensor,
  loading = false,
  onViewDetails,
  onTracking,
}) => {
  const { t } = useTranslation();
  
  const data = sensor;
  const photoUrl = data.Image_hash
    ? `https://smartmachine.smartxhub.cloud/imagem/${data.Image_hash}`
    : undefined;



  return (
    <Popup maxWidth={400} minWidth={350} className="custom-sensor-popup">
      <div className="p-2.5 bg-gradient-to-br from-gray-50 to-blue-50/30" style={{ maxWidth: '400px' }}>
        {/* Header com foto e info básica */}
        <div className="flex items-start gap-2 mb-2 pb-2 border-b-2 border-gradient-to-r from-blue-200 to-purple-200">
          <div className="flex-shrink-0 relative">
            {photoUrl ? (
              <img
                src={photoUrl}
                alt={data.person_name || t('personSensorPopup.worker')}
                className="w-11 h-11 rounded-full object-cover border-2 border-blue-400 shadow-lg ring-2 ring-blue-200/50"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  target.nextElementSibling?.classList.remove('hidden');
                }}
              />
            ) : null}
            <div
              className={`w-11 h-11 rounded-full bg-gradient-to-br from-blue-400 via-blue-500 to-purple-500 flex items-center justify-center shadow-lg ring-2 ring-blue-200/50 ${
                photoUrl ? 'hidden' : ''
              }`}
            >
              <UserCircleIcon className="h-6 w-6 text-white" />
            </div>
            {data.is_active && (
              <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full animate-pulse shadow-lg shadow-green-500/50" />
            )}
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-bold text-gray-900 truncate flex items-center gap-1">
              {data.person_name || t('personSensorPopup.worker')}
              {data.is_active && <SparklesIcon className="h-3 w-3 text-green-500" />}
            </h3>
            <code className="text-[10px] font-mono text-gray-600 bg-white/80 backdrop-blur-sm px-2 py-1 rounded-md border border-gray-200/50 block mt-0.5 shadow-sm">
              {data.person_code || data.dev_uid}
            </code>
            {loading && (
              <div className="flex items-center gap-1 mt-1 bg-blue-50 px-2 py-0.5 rounded-full">
                <ArrowPathIcon className="h-2.5 w-2.5 text-blue-500 animate-spin" />
                <span className="text-[9px] text-blue-600 font-medium">{t('personSensorPopup.loading')}</span>
              </div>
            )}
          </div>
        </div>

        {/* Alertas */}
        {data.has_any_alert && (
          <div className="mb-2">
            <AlertBadge
              has_alert={data.has_any_alert}
              priority={data.alert_priority}
              status={data.mandown_alert_status}
            />
          </div>
        )}

        {/* Informações Organizacionais */}
        {(data.category_name || data.role_name || data.department_name || data.group_name) && (
          <div className="mb-2">
            <h4 className="text-[9px] font-bold text-gray-600 uppercase mb-1 flex items-center gap-1 tracking-wide">
              <div className="w-1 h-3 bg-gradient-to-b from-blue-500 to-purple-500 rounded-full"></div>
              📋 {t('personSensorPopup.organizational_info')}
            </h4>
            <div className="space-y-0.5 text-xs bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-2 rounded-lg border border-blue-200/50 shadow-sm">
              {data.category_name && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 font-medium">{t('personSensorPopup.category')}:</span>
                  <span className="font-semibold text-gray-900 bg-white/80 px-2 py-0.5 rounded">{data.category_name}</span>
                </div>
              )}
              {data.role_name && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 font-medium">{t('personSensorPopup.role')}:</span>
                  <span className="font-semibold text-gray-900 bg-white/80 px-2 py-0.5 rounded">{data.role_name}</span>
                </div>
              )}
              {data.department_name && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 font-medium">{t('personSensorPopup.department')}:</span>
                  <span className="font-semibold text-gray-900 bg-white/80 px-2 py-0.5 rounded">{data.department_name}</span>
                </div>
              )}
              {data.group_name && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 font-medium">{t('personSensorPopup.group')}:</span>
                  <span className="font-semibold text-gray-900 bg-white/80 px-2 py-0.5 rounded">{data.group_name}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Status e Localização */}
        <div className="mb-2">
          <h4 className="text-[9px] font-bold text-gray-600 uppercase mb-1 flex items-center gap-1 tracking-wide">
            <div className="w-1 h-3 bg-gradient-to-b from-purple-500 to-pink-500 rounded-full"></div>
            📍 {t('personSensorPopup.status_location')}
          </h4>
          <div className="space-y-1 text-xs bg-white/80 backdrop-blur-sm p-2 rounded-lg border border-gray-200/50 shadow-sm">
            {data.status_name && (
              <div className="flex items-center gap-1.5">
                <SignalIcon className="h-3 w-3 text-blue-500" />
                <span className="text-gray-600 font-medium">{t('personSensorPopup.status')}:</span>
                <span className="px-2 py-0.5 bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 rounded-full text-[10px] font-bold shadow-sm">
                  {data.status_name}
                </span>
              </div>
            )}

            {data.current_zone_description && (
              <div className="flex items-start gap-1.5">
                <MapPinIcon className="h-3 w-3 text-purple-500 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <span className="text-gray-600 font-medium">{t('personSensorPopup.zone')}: </span>
                  <span className="font-semibold text-gray-900">{data.current_zone_description}</span>
                </div>
              </div>
            )}

            {data.current_area_description && (
              <div className="flex items-start gap-1.5">
                <MapPinIcon className="h-3 w-3 text-green-500 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <span className="text-gray-600 font-medium">{t('personSensorPopup.area')}: </span>
                  <span className="font-semibold text-gray-900">{data.current_area_description}</span>
                </div>
              </div>
            )}

            {data.current_site_name && (
              <div className="flex items-start gap-1.5">
                <MapPinIcon className="h-3 w-3 text-orange-500 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <span className="text-gray-600 font-medium">{t('personSensorPopup.site')}: </span>
                  <span className="font-semibold text-gray-900">{data.current_site_name}</span>
                </div>
              </div>
            )}

            {(data.latitude && data.longitude) && (
              <div className="text-[9px] bg-gradient-to-r from-gray-100 to-slate-100 p-1.5 rounded-md font-mono text-gray-700 mt-1 border border-gray-200/50 shadow-sm">
                📍 {data.latitude}, {data.longitude}
              </div>
            )}
          </div>
        </div>

        {/* Métricas do Sensor */}
        <div className="mb-2">
          <h4 className="text-[9px] font-bold text-gray-600 uppercase mb-1 flex items-center gap-1 tracking-wide">
            <div className="w-1 h-3 bg-gradient-to-b from-green-500 to-teal-500 rounded-full"></div>
            📊 {t('personSensorPopup.sensor_metrics')}
          </h4>
          <div className="space-y-1.5">
            {/* Bateria */}
            {data.battery_level !== undefined && (
              <BatteryIndicator 
                level={data.battery_level} 
                status={data.battery_status}
                charging={data.battery_charging}
              />
            )}

            {/* Grid 3 colunas com Cards */}
            <div className="grid grid-cols-3 gap-1.5">
              {data.health_score !== undefined && (
                <HealthScoreCard score={data.health_score} is_at_risk={data.is_at_risk} />
              )}

              {data.motion_status && (
                <MotionCard status={data.motion_status} minutes_ago={data.motion_minutes_ago} />
              )}

              {data.temperature !== undefined && (
                <TemperatureCard
                  temperature={data.temperature}
                  unit={data.temperature_unit}
                  category={data.temperature_category}
                />
              )}
            </div>
          </div>
        </div>

        {/* Última Atualização */}
        <div className="mb-2">
          <h4 className="text-[9px] font-bold text-gray-600 uppercase mb-1 flex items-center gap-1 tracking-wide">
            <div className="w-1 h-3 bg-gradient-to-b from-orange-500 to-red-500 rounded-full"></div>
            🕐 {t('personSensorPopup.last_update')}
          </h4>
          <div className="flex items-center gap-1.5 p-2 bg-white/80 backdrop-blur-sm rounded-lg border border-gray-200/50 shadow-sm">
            <ClockIcon className="h-4 w-4 text-gray-500" />
            <div className="flex-1">
              {data.last_report_datetime ? (
                <>
                  <div className="text-xs font-semibold text-gray-900">
                    {new Date(data.last_report_datetime).toLocaleString('pt-BR')}
                  </div>
                  {data.report_freshness && (
                    <div className="text-[9px] text-gray-500 font-medium">{data.report_freshness}</div>
                  )}
                  {data.minutes_since_report !== undefined && (
                    <div className="text-[9px] text-gray-400 font-medium">
                      {t('personSensorPopup.ago')}{' '}
                      {data.minutes_since_report < 60
                        ? `${data.minutes_since_report} ${t('personSensorPopup.minutes')}`
                        : `${Math.floor(data.minutes_since_report / 60)}${t('personSensorPopup.hours')}`}
                    </div>
                  )}
                </>
              ) : (
                <div className="text-xs text-gray-500">{t('personSensorPopup.no_data')}</div>
              )}
            </div>
          </div>
        </div>

        {/* Dispositivo */}
        {data.sensor_model && (
          <div className="mb-2 text-[10px] bg-white/80 backdrop-blur-sm p-2 rounded-lg border border-gray-200/50 shadow-sm">
            <div className="flex justify-between items-center">
              <span className="text-gray-600 font-medium">{t('personSensorPopup.model')}:</span>
              <span className="font-mono text-gray-900 font-bold">{data.sensor_model}</span>
            </div>
          </div>
        )}

        {/* Botões de Ação */}
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => onTracking?.(data)}
            className="group cursor-pointer py-2.5 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-600 hover:via-teal-600 hover:to-cyan-600 text-white text-xs font-bold rounded-lg transition-all transform hover:scale-[1.03] active:scale-[0.98] flex items-center justify-center gap-2 shadow-lg hover:shadow-xl shadow-teal-500/50"
          >
            <svg 
              className="h-4 w-4 group-hover:rotate-12 transition-transform" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2.5} 
                d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" 
              />
            </svg>
            <span>{t('personSensorPopup.tracking')}</span>
          </button>

          <button
            onClick={() => onViewDetails?.(data)}
            className="group cursor-pointer py-2.5 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 hover:from-blue-600 hover:via-indigo-600 hover:to-purple-600 text-white text-xs font-bold rounded-lg transition-all transform hover:scale-[1.03] active:scale-[0.98] flex items-center justify-center gap-2 shadow-lg hover:shadow-xl shadow-purple-500/50"
          >
            <MapPinIcon className="h-4 w-4 group-hover:scale-110 transition-transform" />
            <span>{t('personSensorPopup.details')}</span>
          </button>
        </div>

      </div>
    </Popup>
  );
};

export default ImprovedPersonSensorPopup;