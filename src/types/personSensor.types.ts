// src/types/personSensor.types.ts

/**
 * =====================================
 * 📊 TIPOS DE DADOS DE SENSORES DE PESSOAS
 * =====================================
 */

/**
 * Interface principal de dados do sensor de pessoa
 */
export interface PersonSensorData {
  // ===== IDENTIFICAÇÃO =====
  sensor_id: number;
  person_id: number;
  company_id: number;
  company_name: string;
  person_code: string;
  person_name: string;
  is_active: boolean;
  dev_uid: string;
  sensor_model: string;
  firmware_version?: string;

  // ===== CATEGORIA E FUNÇÃO =====
  category_code?: string;
  category_name?: string;
  category_id?: number;
  role_code?: string;
  role_name?: string;

  // ===== GRUPO E DEPARTAMENTO =====
  group_code?: string;
  group_name?: string;
  department_code?: string;
  department_name?: string;
  cost_center_code?: string;
  cost_center_name?: string;

  // ===== STATUS =====
  status_code?: string;
  status_name?: string;
  status_group?: string;

  // ===== LOCALIZAÇÃO ATUAL =====
  current_site_code?: string;
  current_site_name?: string;
  current_zone_code?: string;
  current_zone_description?: string;
  current_zone_id?: number;
  current_area_code?: string;
  current_area_description?: string;
  current_area_id?: number;
  current_country?: string;
  current_state?: string;
  current_city?: string;

  // ===== COORDENADAS GPS =====
  longitude?: number;
  latitude?: number;

  // ===== TEMPERATURA =====
  temperature?: number;
  temperature_unit?: string;
  temperature_last_updated?: string;
  temperature_range?: number;
  temperature_range_changed?: string;
  temperature_category?: TemperatureCategory;
  temperature_minutes_ago?: number;

  // ===== BATERIA =====
  battery_level?: number;
  battery_unit?: string;
  battery_last_updated?: string;
  battery_range?: number;
  battery_range_changed?: string;
  battery_charging?: string;
  battery_status?: BatteryStatus;
  battery_score?: number;
  battery_minutes_ago?: number;

  // ===== MOVIMENTO =====
  motion_status?: MotionStatus;
  motion_status_numeric?: number;
  motion_last_updated?: string;
  motion_last_changed?: string;
  motion_minutes_ago?: number;

  // ===== BOTÕES =====
  button1_status?: ButtonStatus;
  button1_numeric?: number;
  button1_last_updated?: string;
  button1_last_changed?: string;
  button1_minutes_ago?: number;
  button2_status?: ButtonStatus;
  button2_numeric?: number;
  button2_last_updated?: string;
  button2_last_changed?: string;
  button2_minutes_ago?: number;

  // ===== ALARMES =====
  alarm1_status?: AlarmStatus;
  alarm1_numeric?: number;
  alarm1_last_updated?: string;
  alarm1_last_changed?: string;
  alarm1_minutes_ago?: number;
  alarm2_status?: AlarmStatus;
  alarm2_numeric?: number;
  alarm2_last_updated?: string;
  alarm2_last_changed?: string;
  alarm2_minutes_ago?: number;

  // ===== MAN DOWN ALERT =====
  mandown_alert_status?: AlarmStatus;
  mandown_alert_numeric?: number;
  mandown_alert_last_updated?: string;
  mandown_alert_last_changed?: string;
  alert_priority?: number;
  alert_score?: number;
  has_any_alert?: boolean;

  // ===== ESTADO DO SENSOR =====
  sensor_state?: SensorState;
  sensor_state_numeric?: number;
  sensor_state_last_updated?: string;
  sensor_state_last_changed?: string;

  // ===== ÚLTIMO RELATÓRIO =====
  last_report_datetime?: string;
  last_report_date?: string;
  last_report_time?: string;
  last_report_hour?: number;
  minutes_since_report?: number;
  hours_since_report?: number;
  days_since_report?: number;
  report_freshness?: ReportFreshness;
  freshness_score?: number;

  // ===== INFORMAÇÕES TÉCNICAS =====
  event_type?: string;
  work_mode?: WorkMode;
  gps_age?: number;
  loc_fail_reason?: string;
  loc_fail_reason_descr?: string;
  last_dwell_time?: string;

  // ===== ALARMES E STATUS =====
  item_alarm_status?: string;
  is_alarmed?: boolean;
  alarmed_by?: string;
  alarmed_date?: string;
  is_searched?: string;

  // ===== SCORES =====
  health_score?: number;
  is_active_last_5h?: boolean;
  is_at_risk?: boolean;

  // ===== METADADOS =====
  view_generated_at?: string;
  view_generated_date?: string;

  // ===== ADICIONAL (para integração com outros sistemas) =====
  Image_hash?: string;
}

/**
 * =====================================
 * 📝 TIPOS ENUMERADOS
 * =====================================
 */

export type TemperatureCategory = 'COLD' | 'COMFORTABLE' | 'WARM' | 'HOT';

export type BatteryStatus = 'GOOD' | 'CRITICAL';

export type MotionStatus = 'STATIC' | 'IN MOTION' | 'MOVING';

export type ButtonStatus = 'ON' | 'OFF';

export type AlarmStatus = 'ON' | 'OFF';

export type SensorState = 
  | 'POWERED'
  | 'NOT_DEFINED'
  | 'NORMAL'
  | 'WARNING'
  | 'ERROR';

export type ReportFreshness = 
  | 'REAL_TIME'
  | 'TODAY'
  | 'OUTDATED';

export type WorkMode = 
  | 'PERMANENT_TRACKING'
  | 'MOTION_TRACKING'
  | 'SCHEDULED';

/**
 * =====================================
 * 🔍 FILTROS
 * =====================================
 */

export interface PersonSensorFilters {
  person_code?: string;
  person_name?: string;
  category_id?: number;
  status_code?: string;
  is_alarmed?: boolean;
  is_at_risk?: boolean;
  min_battery_level?: number;
  max_battery_level?: number;
  motion_status?: MotionStatus;
  current_zone_id?: number;
  health_score_min?: number;
  health_score_max?: number;
  report_freshness?: ReportFreshness;
  is_active_last_5h?: boolean;
}

/**
 * =====================================
 * 📊 RESPOSTA DA API
 * =====================================
 */

export interface PersonSensorApiResponse<T = PersonSensorData> {
  success: boolean;
  data: T;
  total?: number;
  filters_applied?: PersonSensorFilters;
}

export interface PersonSensorListApiResponse {
  success: boolean;
  data: PersonSensorData[];
  total: number;
  filters_applied?: PersonSensorFilters;
}

export interface PersonSensorStatsResponse {
  success: boolean;
  data: {
    total_sensors: number;
    active_sensors: number;
    alarmed_sensors: number;
    at_risk_sensors: number;
    low_battery_sensors: number;
    moving_sensors: number;
    active_last_5h: number;
    avg_battery_level: number;
    avg_health_score: number;
    avg_temperature: number;
    total_zones_occupied: number;
  };
}

/**
 * =====================================
 * 🎨 HELPERS DE STATUS
 * =====================================
 */

export interface StatusColor {
  color: string;
  text: string;
  bgColor: string;
  textColor?: string;
  icon?: string;
}

export const getBatteryStatusColor = (level?: number): StatusColor => {
  if (!level) return { 
    color: 'gray', 
    text: 'N/A', 
    bgColor: 'bg-gray-100', 
    textColor: 'text-gray-800' 
  };
  if (level > 70) return { 
    color: 'green', 
    text: 'Excelente', 
    bgColor: 'bg-green-500', 
    textColor: 'text-green-800' 
  };
  if (level > 40) return { 
    color: 'yellow', 
    text: 'Bom', 
    bgColor: 'bg-yellow-500', 
    textColor: 'text-yellow-800' 
  };
  if (level > 20) return { 
    color: 'orange', 
    text: 'Atenção', 
    bgColor: 'bg-orange-500', 
    textColor: 'text-orange-800' 
  };
  return { 
    color: 'red', 
    text: 'Crítico', 
    bgColor: 'bg-red-500', 
    textColor: 'text-red-800' 
  };
};

export const getTemperatureStatusColor = (category?: TemperatureCategory): StatusColor => {
  if (!category) return { 
    color: 'gray', 
    text: 'N/A', 
    bgColor: 'bg-gray-100', 
    icon: '🌡️' 
  };
  
  switch (category) {
    case 'COLD':
      return { color: 'blue', text: 'Frio', bgColor: 'bg-blue-100', icon: '❄️' };
    case 'COMFORTABLE':
      return { color: 'green', text: 'Confortável', bgColor: 'bg-green-100', icon: '✅' };
    case 'WARM':
      return { color: 'yellow', text: 'Quente', bgColor: 'bg-yellow-100', icon: '🌡️' };
    case 'HOT':
      return { color: 'red', text: 'Muito Quente', bgColor: 'bg-red-100', icon: '🔥' };
    default:
      return { color: 'gray', text: category, bgColor: 'bg-gray-100', icon: '🌡️' };
  }
};

export const getHealthScoreColor = (score?: number): StatusColor => {
  if (!score && score !== 0) return { 
    color: 'gray', 
    text: 'N/A', 
    bgColor: 'bg-gray-100' 
  };
  if (score >= 80) return { 
    color: 'green', 
    text: 'Excelente', 
    bgColor: 'bg-green-100' 
  };
  if (score >= 60) return { 
    color: 'yellow', 
    text: 'Bom', 
    bgColor: 'bg-yellow-100' 
  };
  if (score >= 40) return { 
    color: 'orange', 
    text: 'Regular', 
    bgColor: 'bg-orange-100' 
  };
  return { 
    color: 'red', 
    text: 'Crítico', 
    bgColor: 'bg-red-100' 
  };
};

export const getFreshnessStatusColor = (freshness?: ReportFreshness): StatusColor => {
  if (!freshness) return { 
    color: 'gray', 
    text: 'N/A', 
    bgColor: 'bg-gray-100', 
    icon: '⏱️' 
  };
  
  switch (freshness) {
    case 'REAL_TIME':
      return { color: 'green', text: 'Tempo Real', bgColor: 'bg-green-100', icon: '🟢' };
    case 'TODAY':
      return { color: 'blue', text: 'Hoje', bgColor: 'bg-blue-100', icon: '📅' };
    case 'OUTDATED':
      return { color: 'red', text: 'Desatualizado', bgColor: 'bg-red-100', icon: '⚠️' };
    default:
      return { color: 'gray', text: freshness, bgColor: 'bg-gray-100', icon: '⏱️' };
  }
};

/**
 * =====================================
 * 🛠️ FUNÇÕES UTILITÁRIAS
 * =====================================
 */

/**
 * Formata data e hora
 */
export const formatDateTime = (
  dateString?: string, 
  locale: string = 'pt-BR'
): string => {
  if (!dateString) return 'N/A';
  try {
    return new Date(dateString).toLocaleString(locale);
  } catch {
    return dateString;
  }
};

/**
 * Formata apenas data
 */
export const formatDate = (
  dateString?: string, 
  locale: string = 'pt-BR'
): string => {
  if (!dateString) return 'N/A';
  try {
    return new Date(dateString).toLocaleDateString(locale);
  } catch {
    return dateString;
  }
};

/**
 * Formata apenas hora
 */
export const formatTime = (
  dateString?: string, 
  locale: string = 'pt-BR'
): string => {
  if (!dateString) return 'N/A';
  try {
    return new Date(dateString).toLocaleTimeString(locale);
  } catch {
    return dateString;
  }
};

/**
 * Valida se um sensor tem GPS válido
 */
export const hasValidGPS = (sensor: PersonSensorData): boolean => {
  return !!(
    sensor.latitude && 
    sensor.longitude && 
    sensor.latitude !== 0 && 
    sensor.longitude !== 0
  );
};

/**
 * Verifica se um sensor está em situação crítica
 */
export const isCritical = (sensor: PersonSensorData): boolean => {
  return !!(
    sensor.is_alarmed ||
    sensor.is_at_risk ||
    (sensor.battery_level && sensor.battery_level <= 10) ||
    sensor.mandown_alert_status === 'ON'
  );
};

/**
 * Obtém cor do marcador baseado no status do sensor
 */
export const getMarkerColor = (sensor: PersonSensorData): string => {
  if (sensor.is_alarmed) return '#ef4444';      // Vermelho
  if (sensor.is_at_risk) return '#f59e0b';      // Laranja
  if (sensor.motion_status === 'IN MOTION' || sensor.motion_status === 'MOVING') 
    return '#10b981';                            // Verde
  if (sensor.battery_level && sensor.battery_level <= 20) 
    return '#f97316';                            // Laranja
  return '#3b82f6';                              // Azul
};

/**
 * Obtém URL da foto do usuário
 */
export const getUserPhotoUrl = (sensor: PersonSensorData): string | undefined => {
  if (sensor.Image_hash) {
    return `https://smartmachine.smartxhub.cloud/imagem/${sensor.Image_hash}`;
  }
  return undefined;
};