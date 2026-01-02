// src/hooks/usePersonSensors.ts

import { useState, useEffect, useCallback } from 'react';

// =====================================
// 📊 INTERFACES
// =====================================

export interface PersonSensorData {
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
  
  category_code?: string;
  category_name?: string;
  category_id?: number;
  role_code?: string;
  role_name?: string;
  
  group_code?: string;
  group_name?: string;
  department_code?: string;
  department_name?: string;
  
  status_code?: string;
  status_name?: string;
  
  current_site_code?: string;
  current_site_name?: string;
  current_zone_code?: string;
  current_zone_description?: string;
  current_zone_id?: number;
  current_area_code?: string;
  current_area_description?: string;
  
  latitude?: number;
  longitude?: number;
  
  temperature?: number;
  temperature_unit?: string;
  temperature_category?: string;
  temperature_minutes_ago?: number;
  
  battery_level?: number;
  battery_status?: string;
  battery_charging?: string;
  battery_minutes_ago?: number;
  
  motion_status?: string;
  motion_minutes_ago?: number;
  
  button1_status?: string;
  button1_minutes_ago?: number;
  button2_status?: string;
  button2_minutes_ago?: number;
  
  alarm1_status?: string;
  alarm1_minutes_ago?: number;
  alarm2_status?: string;
  alarm2_minutes_ago?: number;
  
  mandown_alert_status?: string;
  alert_priority?: number;
  alert_score?: number;
  has_any_alert?: boolean;
  
  sensor_state?: string;
  
  last_report_datetime?: string;
  minutes_since_report?: number;
  hours_since_report?: number;
  days_since_report?: number;
  report_freshness?: string;
  freshness_score?: number;
  
  health_score?: number;
  is_active_last_5h?: boolean;
  is_at_risk?: boolean;
  is_alarmed?: boolean;
  
  Image_hash?: string;
  
  [key: string]: any;
}

export interface PersonSensorFilters {
  person_code?: string;
  person_name?: string;
  category_id?: number;
  status_code?: string;
  is_alarmed?: boolean;
  is_at_risk?: boolean;
  min_battery_level?: number;
  max_battery_level?: number;
  motion_status?: string;
  current_zone_id?: number;
  health_score_min?: number;
  health_score_max?: number;
  report_freshness?: string;
  is_active_last_5h?: boolean;
}

export interface PersonSensorStats {
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
}

interface UsePersonSensorsReturn {
  sensors: PersonSensorData[];
  stats: PersonSensorStats | null;
  loading: boolean;
  error: string | null;
  fetchSensors: (filters?: PersonSensorFilters) => Promise<void>;
  fetchStats: () => Promise<void>;
  getSensorById: (sensorId: number) => Promise<PersonSensorData | null>;
  getSensorByCode: (personCode: string) => Promise<PersonSensorData | null>;
  getSensorsWithAlerts: () => Promise<PersonSensorData[]>;
  getSensorsByZone: (zoneId: number) => Promise<PersonSensorData[]>;
  getSensorsWithLowBattery: (threshold?: number) => Promise<PersonSensorData[]>;
  getInactiveSensors: (hoursThreshold?: number) => Promise<PersonSensorData[]>;
  getSensorsInMotion: () => Promise<PersonSensorData[]>;
  getSensorsWithGPS: () => Promise<PersonSensorData[]>;
  refresh: () => Promise<void>;
}

// =====================================
// 🪝 HOOK PERSONALIZADO
// =====================================

export const usePersonSensors = (
  companyId: number,
  initialFilters?: PersonSensorFilters
): UsePersonSensorsReturn => {
  const [sensors, setSensors] = useState<PersonSensorData[]>([]);
  const [stats, setStats] = useState<PersonSensorStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const baseUrl = 'https://apinode.smartxhub.cloud/api/dashboard/devices';

  // =====================================
  // 📡 FUNÇÕES DE FETCH
  // =====================================

  const buildQueryString = (filters?: PersonSensorFilters): string => {
    if (!filters) return '';

    const params = new URLSearchParams();

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value.toString());
      }
    });

    const queryString = params.toString();
    return queryString ? `?${queryString}` : '';
  };

  const fetchSensors = useCallback(
    async (filters?: PersonSensorFilters) => {
      setLoading(true);
      setError(null);

      try {
        const queryString = buildQueryString(filters || initialFilters);
        const url = `${baseUrl}/${companyId}/person-sensors${queryString}`;

        const response = await fetch(url);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();

        if (result.success && Array.isArray(result.data)) {
          setSensors(result.data);
        } else {
          throw new Error('Invalid response format');
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
        setError(errorMessage);
        console.error('Error fetching sensors:', err);
      } finally {
        setLoading(false);
      }
    },
    [companyId, initialFilters]
  );

  const fetchStats = useCallback(async () => {
    try {
      const url = `${baseUrl}/${companyId}/person-sensors/stats`;
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.success && result.data) {
        setStats(result.data);
      }
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  }, [companyId]);

  const getSensorById = useCallback(
    async (sensorId: number): Promise<PersonSensorData | null> => {
      try {
        const url = `${baseUrl}/${companyId}/person-sensors/${sensorId}`;
        const response = await fetch(url);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();

        if (result.success && result.data) {
          return result.data;
        }

        return null;
      } catch (err) {
        console.error('Error fetching sensor by ID:', err);
        return null;
      }
    },
    [companyId]
  );

  const getSensorByCode = useCallback(
    async (personCode: string): Promise<PersonSensorData | null> => {
      try {
        const url = `${baseUrl}/${companyId}/person-sensors/code/${personCode}`;
        const response = await fetch(url);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();

        if (result.success && result.data) {
          return result.data;
        }

        return null;
      } catch (err) {
        console.error('Error fetching sensor by code:', err);
        return null;
      }
    },
    [companyId]
  );

  const getSensorsWithAlerts = useCallback(async (): Promise<PersonSensorData[]> => {
    try {
      const url = `${baseUrl}/${companyId}/person-sensors/alerts`;
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.success && Array.isArray(result.data)) {
        return result.data;
      }

      return [];
    } catch (err) {
      console.error('Error fetching sensors with alerts:', err);
      return [];
    }
  }, [companyId]);

  const getSensorsByZone = useCallback(
    async (zoneId: number): Promise<PersonSensorData[]> => {
      try {
        const url = `${baseUrl}/${companyId}/person-sensors/zone/${zoneId}`;
        const response = await fetch(url);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();

        if (result.success && Array.isArray(result.data)) {
          return result.data;
        }

        return [];
      } catch (err) {
        console.error('Error fetching sensors by zone:', err);
        return [];
      }
    },
    [companyId]
  );

  const getSensorsWithLowBattery = useCallback(
    async (threshold: number = 20): Promise<PersonSensorData[]> => {
      try {
        const url = `${baseUrl}/${companyId}/person-sensors/low-battery?threshold=${threshold}`;
        const response = await fetch(url);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();

        if (result.success && Array.isArray(result.data)) {
          return result.data;
        }

        return [];
      } catch (err) {
        console.error('Error fetching sensors with low battery:', err);
        return [];
      }
    },
    [companyId]
  );

  const getInactiveSensors = useCallback(
    async (hoursThreshold: number = 5): Promise<PersonSensorData[]> => {
      try {
        const url = `${baseUrl}/${companyId}/person-sensors/inactive?hours=${hoursThreshold}`;
        const response = await fetch(url);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();

        if (result.success && Array.isArray(result.data)) {
          return result.data;
        }

        return [];
      } catch (err) {
        console.error('Error fetching inactive sensors:', err);
        return [];
      }
    },
    [companyId]
  );

  const getSensorsInMotion = useCallback(async (): Promise<PersonSensorData[]> => {
    try {
      const url = `${baseUrl}/${companyId}/person-sensors/in-motion`;
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.success && Array.isArray(result.data)) {
        return result.data;
      }

      return [];
    } catch (err) {
      console.error('Error fetching sensors in motion:', err);
      return [];
    }
  }, [companyId]);

  const getSensorsWithGPS = useCallback(async (): Promise<PersonSensorData[]> => {
    try {
      const url = `${baseUrl}/${companyId}/person-sensors/with-gps`;
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.success && Array.isArray(result.data)) {
        return result.data;
      }

      return [];
    } catch (err) {
      console.error('Error fetching sensors with GPS:', err);
      return [];
    }
  }, [companyId]);

  const refresh = useCallback(async () => {
    await Promise.all([fetchSensors(initialFilters), fetchStats()]);
  }, [fetchSensors, fetchStats, initialFilters]);

  // =====================================
  // 🔄 EFFECTS
  // =====================================

  useEffect(() => {
    fetchSensors(initialFilters);
    fetchStats();
  }, [fetchSensors, fetchStats]);

  return {
    sensors,
    stats,
    loading,
    error,
    fetchSensors,
    fetchStats,
    getSensorById,
    getSensorByCode,
    getSensorsWithAlerts,
    getSensorsByZone,
    getSensorsWithLowBattery,
    getInactiveSensors,
    getSensorsInMotion,
    getSensorsWithGPS,
    refresh,
  };
};

export default usePersonSensors;