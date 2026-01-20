// // src/hooks/useTemperatureAnalytics.ts
// import { useState, useEffect } from "react";
// import axios from "axios";
// import { useCompany } from "./useCompany";

// // URL da API
// // https://apinode.smartxhub.cloud - prod
// // http://localhost:4000 - dev
// const API_BASE_URL = "https://apinode.smartxhub.cloud/api/dashboard/temperature";

// // =====================================
// // 📝 INTERFACES
// // =====================================

// export interface TemperatureExposureEvent {
//     event_hour_bucket: string;
//     company_id: number;
//     event_id: number;
//     event_time: string;
//     timestamp_ms: number;
//     person_code: string;
//     person_name: string;
//     ambient_temp: number;
//     exposure_type: string;
//     severity: string;
//     response_priority: string;
//     color_code: string;
//     alert_message: string;
//     location: string;
//     site: string;
//     area: string;
//     zone: string;
//     work_shift: string;
//     event_date: string;
//     event_hour: number;
// }

// export interface TemperatureCurrent {
//     person_code: string;
//     person_name: string;
//     company_id: number;
//     category: string;
//     ambient_temp: number;
//     temp_unit: string;
//     last_reading: string;
//     minutes_ago: number;
//     thermal_condition: string;
//     risk_level: string;
//     is_critical_temp: boolean;
//     heat_stress_risk: boolean;
//     cold_exposure_risk: boolean;
//     is_comfortable: boolean;
//     current_location: string;
//     site_name: string;
//     area_name: string;
//     zone_name: string;
//     lat: number | null;
//     lng: number | null;
//     temp_display: string;
//     status_color: string;
//     status_message: string;
//     work_shift: string;
// }

// export interface TemperatureExposureStats {
//     total_events: number;
//     critical_events: number;
//     high_events: number;
//     medium_events: number;
//     low_events: number;
//     unique_persons: number;
//     avg_temp: number;
//     max_temp: number;
//     min_temp: number;
//     events_by_severity: Array<{ severity: string; count: number; percentage: number }>;
//     events_by_exposure_type: Array<{ exposure_type: string; count: number; percentage: number }>;
//     events_by_shift: Array<{ work_shift: string; count: number; percentage: number }>;
//     events_by_hour: Array<{ hour: number; count: number; avg_temp: number }>;
//     top_affected_persons: Array<{
//         person_code: string;
//         person_name: string;
//         event_count: number;
//         avg_temp: number;
//         max_temp: number;
//     }>;
//     events_by_location: Array<{
//         site: string;
//         area: string;
//         zone: string;
//         count: number;
//         avg_temp: number;
//     }>;
// }

// export interface TemperatureCurrentStats {
//     total_persons: number;
//     critical_count: number;
//     high_risk_count: number;
//     medium_risk_count: number;
//     low_risk_count: number;
//     heat_stress_count: number;
//     cold_exposure_count: number;
//     comfortable_count: number;
//     avg_temp: number;
//     max_temp: number;
//     min_temp: number;
//     by_thermal_condition: Array<{ thermal_condition: string; count: number; percentage: number }>;
//     by_risk_level: Array<{ risk_level: string; count: number; percentage: number }>;
//     by_category: Array<{ category: string; count: number; avg_temp: number }>;
//     by_location: Array<{
//         site_name: string;
//         area_name: string;
//         zone_name: string;
//         count: number;
//         avg_temp: number;
//         critical_count: number;
//     }>;
// }

// export interface TemperatureTrend {
//     time_bucket: string;
//     time_bucket_15min: string;
//     timestamp_ms: number;
//     person_code: string;
//     person_name: string;
//     avg_temp: number;
//     min_temp: number;
//     max_temp: number;
//     temp_stddev: number;
//     reading_count: number;
//     temp_variation: number;
//     comfort_status: string;
//     had_critical_temp: boolean;
//     zone: string;
//     date: string;
//     hour: number;
// }

// export interface DistanceStats {
//     total_movements: number;
//     total_distance_km: number;
//     avg_distance_per_movement: number;
//     unique_persons: number;
//     active_days: number;
//     by_person: Array<{
//         person_code: string;
//         person_name: string;
//         total_distance_km: number;
//         movement_count: number;
//         avg_distance_meters: number;
//         active_days: number;
//     }>;
//     by_category: Array<{
//         category_name: string;
//         total_distance_km: number;
//         movement_count: number;
//         avg_distance_meters: number;
//         person_count: number;
//     }>;
//     by_hour: Array<{
//         hour_of_day: number;
//         total_distance_km: number;
//         movement_count: number;
//         avg_distance_meters: number;
//     }>;
//     by_day_of_week: Array<{
//         day_of_week: number;
//         day_name: string;
//         total_distance_km: number;
//         movement_count: number;
//         avg_distance_meters: number;
//     }>;
// }

// export interface TemperatureFilters {
//     start_date?: string;
//     end_date?: string;
//     severities?: string[];
//     thermal_conditions?: string[];
//     risk_levels?: string[];
//     zones?: string[];
//     person_codes?: string[];
// }

// export interface ComfortAnalysis {
//     overall: Array<{ comfort_status: string; count: number; percentage: number }>;
//     by_hour: Array<{ hour: number; comfort_status: string; count: number; avg_temp: number }>;
//     by_zone: Array<{
//         zone: string;
//         comfort_status: string;
//         count: number;
//         avg_temp: number;
//         unique_persons: number;
//     }>;
// }

// // =====================================
// // 🎣 HOOK
// // =====================================

// export const useTemperatureAnalytics = (
//     activeTab: string,
//     autoRefresh: boolean = false,
//     refreshInterval: number = 30000 // 30 segundos
// ) => {
//     const { companyId } = useCompany();
//     const [loading, setLoading] = useState(false);
//     const [error, setError] = useState<string | null>(null);

//     // Estados para cada tipo de dado
//     const [exposureStats, setExposureStats] = useState<TemperatureExposureStats | null>(null);
//     const [currentStats, setCurrentStats] = useState<TemperatureCurrentStats | null>(null);
//     const [criticalPersons, setCriticalPersons] = useState<TemperatureCurrent[]>([]);
//     const [exposureEvents, setExposureEvents] = useState<TemperatureExposureEvent[]>([]);
//     const [exposureTimeline, setExposureTimeline] = useState<any[]>([]);
//     const [temperatureHeatmap, setTemperatureHeatmap] = useState<any[]>([]);
//     const [trends, setTrends] = useState<TemperatureTrend[]>([]);
//     const [comfortAnalysis, setComfortAnalysis] = useState<ComfortAnalysis | null>(null);
//     const [zonePatterns, setZonePatterns] = useState<any[]>([]);
//     const [variationAnalysis, setVariationAnalysis] = useState<any[]>([]);
//     const [distanceStats, setDistanceStats] = useState<DistanceStats | null>(null);
//     const [distancePatterns, setDistancePatterns] = useState<any[]>([]);

//     // Filtros
//     const [filters, setFilters] = useState<TemperatureFilters>({
//         severities: [],
//         thermal_conditions: [],
//         risk_levels: [],
//     });

//     // =====================================
//     // 🔧 FUNÇÕES DE FETCH INDIVIDUAIS
//     // =====================================

//     const fetchExposureStats = async () => {
//         const params = new URLSearchParams();
//         if (filters.start_date) params.append('start_date', filters.start_date);
//         if (filters.end_date) params.append('end_date', filters.end_date);

//         const { data } = await axios.get(
//             `${API_BASE_URL}/${companyId}/exposure/stats?${params.toString()}`
//         );
//         setExposureStats(data.data);
//     };

//     const fetchCurrentStats = async () => {
//         const { data } = await axios.get(
//             `${API_BASE_URL}/${companyId}/current/stats`
//         );
//         setCurrentStats(data.data);
//     };

//     const fetchCriticalPersons = async () => {
//         const { data } = await axios.get(
//             `${API_BASE_URL}/${companyId}/current/critical`
//         );
//         setCriticalPersons(data.data || []);
//     };

//     const fetchExposureEvents = async (customFilters?: TemperatureFilters) => {
//         const params = new URLSearchParams();
//         params.append('limit', '100');

//         const activeFilters = customFilters || filters;

//         if (activeFilters.severities && activeFilters.severities.length > 0) {
//             params.append('severity', activeFilters.severities.join(','));
//         }
//         if (activeFilters.start_date) params.append('start_date', activeFilters.start_date);
//         if (activeFilters.end_date) params.append('end_date', activeFilters.end_date);
//         if (activeFilters.zones && activeFilters.zones.length > 0) {
//             params.append('zone', activeFilters.zones.join(','));
//         }

//         const { data } = await axios.get(
//             `${API_BASE_URL}/${companyId}/exposure/events?${params.toString()}`
//         );
//         setExposureEvents(data.data || []);
//     };

//     const fetchExposureTimeline = async () => {
//         const params = new URLSearchParams();
//         if (filters.start_date) params.append('start_date', filters.start_date);
//         if (filters.end_date) params.append('end_date', filters.end_date);

//         const { data } = await axios.get(
//             `${API_BASE_URL}/${companyId}/exposure/timeline?${params.toString()}`
//         );
//         setExposureTimeline(data.data || []);
//     };

//     const fetchTemperatureHeatmap = async () => {
//         const { data } = await axios.get(
//             `${API_BASE_URL}/${companyId}/current/heatmap`
//         );
//         setTemperatureHeatmap(data.data || []);
//     };

//     const fetchTrends = async () => {
//         const params = new URLSearchParams();
//         if (filters.start_date) params.append('start_date', filters.start_date);
//         if (filters.end_date) params.append('end_date', filters.end_date);
//         params.append('limit', '1000');

//         const { data } = await axios.get(
//             `${API_BASE_URL}/${companyId}/trends?${params.toString()}`
//         );
//         setTrends(data.data || []);
//     };

//     const fetchComfortAnalysis = async () => {
//         const params = new URLSearchParams();
//         if (filters.start_date) params.append('start_date', filters.start_date);
//         if (filters.end_date) params.append('end_date', filters.end_date);

//         const { data } = await axios.get(
//             `${API_BASE_URL}/${companyId}/trends/comfort?${params.toString()}`
//         );
//         setComfortAnalysis(data.data || null);
//     };

//     const fetchZonePatterns = async () => {
//         const params = new URLSearchParams();
//         if (filters.start_date) params.append('start_date', filters.start_date);
//         if (filters.end_date) params.append('end_date', filters.end_date);

//         const { data } = await axios.get(
//             `${API_BASE_URL}/${companyId}/trends/zone-patterns?${params.toString()}`
//         );
//         setZonePatterns(data.data || []);
//     };

//     const fetchVariationAnalysis = async () => {
//         const params = new URLSearchParams();
//         if (filters.start_date) params.append('start_date', filters.start_date);
//         if (filters.end_date) params.append('end_date', filters.end_date);

//         const { data } = await axios.get(
//             `${API_BASE_URL}/${companyId}/trends/variation?${params.toString()}`
//         );
//         setVariationAnalysis(data.data || []);
//     };

//     const fetchDistanceStats = async () => {
//         const params = new URLSearchParams();
//         if (filters.start_date) params.append('start_date', filters.start_date);
//         if (filters.end_date) params.append('end_date', filters.end_date);

//         const { data } = await axios.get(
//             `${API_BASE_URL}/${companyId}/distance/stats?${params.toString()}`
//         );
//         setDistanceStats(data.data || null);
//     };

//     const fetchDistancePatterns = async () => {
//         const params = new URLSearchParams();
//         if (filters.start_date) params.append('start_date', filters.start_date);
//         if (filters.end_date) params.append('end_date', filters.end_date);

//         const { data } = await axios.get(
//             `${API_BASE_URL}/${companyId}/distance/patterns?${params.toString()}`
//         );
//         setDistancePatterns(data.data || []);
//     };

//     // =====================================
//     // 🔄 CARREGAR DADOS BASEADO NA ABA
//     // =====================================

//     useEffect(() => {
//         if (!companyId) return;

//         const fetchData = async () => {
//             setLoading(true);
//             setError(null);

//             try {
//                 switch (activeTab) {
//                     case "overview":
//                         await Promise.all([
//                             fetchExposureStats(),
//                             fetchCurrentStats(),
//                             fetchCriticalPersons(),
//                             fetchExposureTimeline(),
//                         ]);
//                         break;

//                     case "exposure":
//                         await Promise.all([
//                             fetchExposureStats(),
//                             fetchExposureEvents(),
//                             fetchExposureTimeline(),
//                         ]);
//                         break;

//                     case "current":
//                         await Promise.all([
//                             fetchCurrentStats(),
//                             fetchCriticalPersons(),
//                             fetchTemperatureHeatmap(),
//                         ]);
//                         break;

//                     case "trends":
//                         await Promise.all([
//                             fetchTrends(),
//                             fetchComfortAnalysis(),
//                             fetchZonePatterns(),
//                             fetchVariationAnalysis(),
//                         ]);
//                         break;

//                     case "distance":
//                         await Promise.all([
//                             fetchDistanceStats(),
//                             fetchDistancePatterns(),
//                         ]);
//                         break;

//                     case "map":
//                         await fetchTemperatureHeatmap();
//                         break;

//                     default:
//                         // Carregar dados essenciais
//                         await Promise.all([
//                             fetchExposureStats(),
//                             fetchCurrentStats(),
//                             fetchCriticalPersons(),
//                         ]);
//                         break;
//                 }
//             } catch (err: any) {
//                 console.error("Error fetching temperature analytics:", err);
//                 setError(err.message || "Erro ao carregar dados");
//             } finally {
//                 setLoading(false);
//             }
//         };

//         fetchData();
//     }, [companyId, activeTab, filters.start_date, filters.end_date]);

//     // =====================================
//     // 🔄 AUTO-REFRESH
//     // =====================================

//     useEffect(() => {
//         if (!autoRefresh || !companyId) return;

//         const interval = setInterval(async () => {
//             try {
//                 // Atualizar dados em tempo real
//                 await Promise.all([
//                     fetchCurrentStats(),
//                     fetchCriticalPersons(),
//                     fetchTemperatureHeatmap(),
//                 ]);
//             } catch (err) {
//                 console.error("Error during auto-refresh:", err);
//             }
//         }, refreshInterval);

//         return () => clearInterval(interval);
//     }, [autoRefresh, companyId, refreshInterval]);

//     // =====================================
//     // ✨ APLICAR FILTROS
//     // =====================================

//     const applyFilters = async () => {
//         setLoading(true);
//         try {
//             await fetchExposureEvents(filters);
//         } catch (err) {
//             console.error("Error applying filters:", err);
//         } finally {
//             setLoading(false);
//         }
//     };

//     // =====================================
//     // 📤 RETORNO DO HOOK
//     // =====================================

//     return {
//         // Dados
//         exposureStats,
//         currentStats,
//         criticalPersons,
//         exposureEvents,
//         exposureTimeline,
//         temperatureHeatmap,
//         trends,
//         comfortAnalysis,
//         zonePatterns,
//         variationAnalysis,
//         distanceStats,
//         distancePatterns,

//         // Estados
//         loading,
//         error,

//         // Filtros
//         filters,
//         setFilters,
//         applyFilters,

//         // Funções para refresh manual
//         refreshExposureStats: fetchExposureStats,
//         refreshCurrentStats: fetchCurrentStats,
//         refreshCriticalPersons: fetchCriticalPersons,
//         refreshExposureEvents: fetchExposureEvents,
//         refreshExposureTimeline: fetchExposureTimeline,
//         refreshTemperatureHeatmap: fetchTemperatureHeatmap,
//         refreshTrends: fetchTrends,
//         refreshComfortAnalysis: fetchComfortAnalysis,
//         refreshZonePatterns: fetchZonePatterns,
//         refreshVariationAnalysis: fetchVariationAnalysis,
//         refreshDistanceStats: fetchDistanceStats,
//         refreshDistancePatterns: fetchDistancePatterns,
//     };
// };


// src/hooks/useTemperatureAnalytics.ts
import { useState, useEffect } from "react";
import axios from "axios";
import { useCompany } from "./useCompany";

const API_BASE_URL = "https://apinode.smartxhub.cloud/api/dashboard/temperature";

// =====================================
// 📝 INTERFACES
// =====================================

export interface TemperatureFilters {
  start_date?: string;
  end_date?: string;
  groupBy?: 'hour' | 'day' | 'week';
  severities?: string[];
  searchTerm?: string;
}

// =====================================
// 🎣 HOOK
// =====================================

export const useTemperatureAnalytics = (
  activeTab: string = 'overview',
  autoRefresh: boolean = false,
  refreshInterval: number = 30000
) => {
  const { companyId } = useCompany();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Estados para Overview
  const [exposureStats, setExposureStats] = useState<any>(null);
  const [currentStats, setCurrentStats] = useState<any>(null);
  const [criticalPersons, setCriticalPersons] = useState<any[]>([]);
  const [exposureTimeline, setExposureTimeline] = useState<any[]>([]);
  const [exposureEvents, setExposureEvents] = useState<any[]>([]);
  const [heatmapData, setHeatmapData] = useState<any[]>([]);

  // Estados para Temperature Trends
  const [temperatureTrends, setTemperatureTrends] = useState<any>(null);
  const [comfortAnalysis, setComfortAnalysis] = useState<any>(null);
  const [zonePatterns, setZonePatterns] = useState<any>(null);
  const [variationAnalysis, setVariationAnalysis] = useState<any>(null);
  const [personTimeSeries, setPersonTimeSeries] = useState<any>(null);

  // Estados para Distance Analytics
  const [distanceStats, setDistanceStats] = useState<any>(null);
  const [distancePatterns, setDistancePatterns] = useState<any>(null);
  const [categoryComparison, setCategoryComparison] = useState<any>(null);
  const [personActivity, setPersonActivity] = useState<any>(null);

  const [activityHeatmap, setActivityHeatmap] = useState<any[]>([]);

  // Filtros
  const [filters, setFilters] = useState<TemperatureFilters>({
    start_date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end_date: new Date().toISOString().split('T')[0],
    groupBy: 'day',
  });

  // =====================================
  // 🔧 FETCH OVERVIEW DATA
  // =====================================
  const fetchOverviewData = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (filters.start_date) params.append('start_date', filters.start_date);
      if (filters.end_date) params.append('end_date', filters.end_date);

      const [
        exposureStatsRes,
        currentStatsRes,
        criticalPersonsRes,
        exposureTimelineRes,
        exposureEventsRes,
        heatmapRes,
      ] = await Promise.all([
        axios.get(`${API_BASE_URL}/${companyId}/exposure/stats?${params}`),
        axios.get(`${API_BASE_URL}/${companyId}/current/stats`),
        axios.get(`${API_BASE_URL}/${companyId}/current/critical`),
        axios.get(`${API_BASE_URL}/${companyId}/exposure/timeline?${params}`),
        axios.get(`${API_BASE_URL}/${companyId}/exposure/events?${params}`),
        axios.get(`${API_BASE_URL}/${companyId}/current/heatmap`),
      ]);

      setExposureStats(exposureStatsRes.data.data);
      setCurrentStats(currentStatsRes.data.data);
      setCriticalPersons(criticalPersonsRes.data.data || []);
      setExposureTimeline(exposureTimelineRes.data.data || []);
      setExposureEvents(exposureEventsRes.data.data || []);
      setHeatmapData(heatmapRes.data.data || []);
    } catch (err: any) {
      console.error('Error fetching overview data:', err);
      setError(err.message || 'Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  // =====================================
  // 🔧 FETCH TRENDS DATA
  // =====================================
  const fetchTrendsData = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (filters.start_date) params.append('startDate', filters.start_date);
      if (filters.end_date) params.append('endDate', filters.end_date);
      if (filters.groupBy) params.append('groupBy', filters.groupBy);

      const [trendsRes, comfortRes, zoneRes, variationRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/${companyId}/trends?${params}`),
        axios.get(`${API_BASE_URL}/${companyId}/trends/comfort?${params}`),
        axios.get(`${API_BASE_URL}/${companyId}/trends/zone-patterns?${params}`),
        axios.get(`${API_BASE_URL}/${companyId}/trends/variation?${params}`),
      ]);

      setTemperatureTrends(trendsRes.data.data);
      setComfortAnalysis(comfortRes.data.data);
      setZonePatterns(zoneRes.data.data);
      setVariationAnalysis(variationRes.data.data);
    } catch (err: any) {
      console.error('Error fetching trends data:', err);
      setError(err.message || 'Erro ao carregar tendências');
    } finally {
      setLoading(false);
    }
  };

  // =====================================
  // 🔧 FETCH DISTANCE DATA
  // =====================================
  const fetchDistanceData = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (filters.start_date) params.append('startDate', filters.start_date);
      if (filters.end_date) params.append('endDate', filters.end_date);
      if (filters.groupBy) params.append('groupBy', filters.groupBy);

      const [statsRes, patternsRes, comparisonRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/${companyId}/distance/stats?${params}`),
        axios.get(`${API_BASE_URL}/${companyId}/distance/patterns?${params}`),
        axios.get(`${API_BASE_URL}/${companyId}/distance/category-comparison?${params}`),
      ]);

      setDistanceStats(statsRes.data.data);
      setDistancePatterns(patternsRes.data.data);
      setCategoryComparison(comparisonRes.data.data);
    } catch (err: any) {
      console.error('Error fetching distance data:', err);
      setError(err.message || 'Erro ao carregar dados de distância');
    } finally {
      setLoading(false);
    }
  };

  // =====================================
  // 🔧 FETCH PERSON TIME SERIES
  // =====================================
  const fetchPersonTimeSeries = async (personCode: string) => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filters.start_date) params.append('startDate', filters.start_date);
      if (filters.end_date) params.append('endDate', filters.end_date);

      const response = await axios.get(
        `${API_BASE_URL}/${companyId}/trends/person/${personCode}?${params}`
      );
      setPersonTimeSeries(response.data.data);
    } catch (err: any) {
      console.error('Error fetching person time series:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // =====================================
  // 🔧 FETCH PERSON ACTIVITY
  // =====================================
  const fetchPersonActivity = async (personCode: string) => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filters.start_date) params.append('startDate', filters.start_date);
      if (filters.end_date) params.append('endDate', filters.end_date);

      const response = await axios.get(
        `${API_BASE_URL}/${companyId}/distance/person/${personCode}?${params}`
      );
      setPersonActivity(response.data.data);
    } catch (err: any) {
      console.error('Error fetching person activity:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchActivityHeatmap = async (metric: 'temperature' | 'events' = 'temperature') => {
  try {
    setLoading(true);
    const params = new URLSearchParams();
    if (filters.start_date) params.append('startDate', filters.start_date);
    if (filters.end_date) params.append('endDate', filters.end_date);
    params.append('metric', metric);

    const response = await axios.get(
      `${API_BASE_URL}/${companyId}/heatmap?${params}`
    );
    setActivityHeatmap(response.data.data || []);
  } catch (err: any) {
    console.error('Error fetching heatmap:', err);
    setError(err.message);
  } finally {
    setLoading(false);
  }
};

  // =====================================
  // 🔄 CARREGAR DADOS BASEADO NA ABA
  // =====================================
  useEffect(() => {
    if (!companyId) return;

    switch (activeTab) {
      case 'overview':
        fetchOverviewData();
        break;
      case 'trends':
        fetchTrendsData();
        break;
      case 'distance':
        fetchDistanceData();
        break;
      default:
        fetchOverviewData();
    }
  }, [companyId, activeTab, filters.start_date, filters.end_date, filters.groupBy]);

  // =====================================
  // 🔄 AUTO-REFRESH
  // =====================================
  useEffect(() => {
    if (!autoRefresh || !companyId) return;

    const interval = setInterval(() => {
      if (activeTab === 'overview') {
        fetchOverviewData();
      }
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, companyId, activeTab, refreshInterval]);

  // =====================================
  // 📤 RETORNO DO HOOK
  // =====================================
  return {
    // Overview data
    exposureStats,
    currentStats,
    criticalPersons,
    exposureTimeline,
    exposureEvents,
    heatmapData,

    // Trends data
    temperatureTrends,
    comfortAnalysis,
    zonePatterns,
    variationAnalysis,
    personTimeSeries,

    // Distance data
    distanceStats,
    distancePatterns,
    categoryComparison,
    personActivity,

    activityHeatmap,
    fetchActivityHeatmap,

    // Control
    loading,
    error,
    filters,
    setFilters,

    // Functions
    fetchPersonTimeSeries,
    fetchPersonActivity,
    refetch: fetchOverviewData,
  };
};