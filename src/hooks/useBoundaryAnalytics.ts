// src/hooks/useBoundaryAnalytics.ts
import { useState, useEffect } from "react";
import axios from "axios";
//https://apinode.smartxhub.cloud prod
//http://localhost:4000 dev
const API_BASE_URL = "https://apinode.smartxhub.cloud/api";

interface SankeyDataItem {
  source: string;
  target: string;
  value: number;
  avg_time: string;
}

interface TopTransitionItem {
  from_boundary_name: string;
  to_boundary_name: string;
  transition_count: number;
  avg_minutes: string;
}

// Adicionar interface
interface AnomalyKPIs {
  detected_anomalies: number;
  avg_z_score: number;
  extreme_anomalies: string;
  high_anomalies: string;
}

// Adicionar interface
interface TopAnomalyItem {
  entry_datetime: string;
  item_name: string;
  boundary_name: string;
  duration_hours: string;
  avg_duration_minutes: string;
  z_score: number;
  anomaly_level: string;
}

// Adicionar interface
interface ComplianceSummaryItem {
  boundary_name: string;
  total_visits: number;
  alert_rate_pct: string;
  off_hours_entry_pct: string;
  weekend_visit_pct: string;
  status: string;
}

// Adicionar interface
interface ComplianceMetrics {
  avg_alert_rte: string;
  avg_off_hours_pct: string;
  avg_weekend_pct: string;
  total_visits: string;
  total_alerts: string;
  total_off_hours: string;
  total_weekend: string;
}

// Adicionar interface
interface DetailedRankingItem {
  rank: number;
  item_name: string;
  boundary_name: string;
  duration: string;
  visits: number;
  total_active_days: number;
  avg_per_visit: string;
}

// Adicionar interface para dados do mapa
interface BoundaryMapData {
  boundary_id: number;
  boundary_name: string;
  geojson_data: any;
  centroid_lat: number;
  centroid_lng: number;
  visits: number;
  duration_hours: number;
  is_currently_inside: number;
}

// Adicionar interface para zonas
interface ActiveZone {
  id: number;
  company_id: number;
  group_name: string;
  boundary_name: string;
  code: string;
  active: number;
  geojson_data: any;
}

// Adicionar interfaces
interface RealTimeFilters {
  itemName?: string;
  boundaryName?: string;
  status?: string;
  minDuration?: string;
  maxDuration?: string;
  page?: number;
  limit?: number;
}
//@ts-ignore
interface RealTimeStatusResponse {
  data: any[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalRecords: number;
    limit: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

// Adicionar interfaces
interface FilterOption {
  boundary_id?: number;
  boundary_name?: string;
  item_id?: number;
  item_code?: string;
  item_name?: string;
  group_name?: string;
}

interface FilterOptions {
  boundaries: FilterOption[];
  items: FilterOption[];
  groups: FilterOption[];
  statuses: { value: string; label: string; }[];
}


// Adicionar interface ANTES do export
interface BoundaryTransitionByDuration {
  from_boundary: string;
  to_boundary: string;
  duration_range: string;
  transition_count: number;
  avg_duration: number;
  sample_users: string;
}

// ✅ ADICIONAR INTERFACE
interface WeekdayWeekendData {
  boundary_id: number;
  boundary_name: string;
  day_type: string;
  days_analyzed: number;
  total_visits: string;
  avg_visits_per_day: string;
  total_unique_items: string;
  avg_unique_items_per_day: string;
  avg_duration_minutes: string;
  avg_total_hours_per_day: string;
  morning_percentage: string;
  afternoon_percentage: string;
  night_percentage: string;
  very_short_pct: string;
  short_pct: string;
  medium_pct: string;
  long_pct: string;
  very_long_pct: string;
  alert_percentage: string;
  total_alarm1: string | null;
  total_alarm2: string | null;
  total_mandown: string | null;
  total_tamper: string | null;
}

// ✅ ADICIONAR INTERFACE
interface BoundaryTrendData {
  period: string;
  boundary_id: number;
  boundary_name: string;
  total_visits: string;
  avg_daily_visits: string;
  total_unique_items: string;
  avg_daily_unique_items: string;
  avg_duration: string;
  avg_total_hours: string;
  visits_change: string | null;
  visits_change_pct: string | null;
  morning_visits: string;
  afternoon_visits: string;
  night_visits: string;
  total_alerts: string;
  total_alarm_events: string | null;
}

interface BoundaryAnomalyData {
  entry_date: string;
  boundary_id: number;
  boundary_name: string;
  day_type: string;
  total_visits: number;
  avg_visit_duration_minutes: string;
  alert_rate: string;
  expected_visits: string;
  expected_duration: string;
  expected_alert_rate: string;
  visits_zscore: number;
  duration_zscore: number;
  alert_rate_zscore: number | null;
  anomaly_type: string;
  alarm1_count: string | null;
  alarm2_count: string | null;
  mandown_count: string | null;
  tamper_count: string | null;
}

export const  useBoundaryAnalytics = (
  companyId: number,
  activeTab: string,
  selectedPeriod: "7d" | "30d" | "90d",
  realTimeFilters?: RealTimeFilters // Adicionar parâmetro
) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Estados para cada tipo de dado
  const [kpis, setKpis] = useState<any>(null);
  const [topBoundaries, setTopBoundaries] = useState<any[]>([]);
  const [shiftDistribution, setShiftDistribution] = useState<any>(null);
  const [timeSeries, setTimeSeries] = useState<any[]>([]);
  const [weeklyTrends, setWeeklyTrends] = useState<any[]>([]);
  const [weeklyPattern, setWeeklyPattern] = useState<any[]>([]);
  const [heatmap, setHeatmap] = useState<any[]>([]);
  const [anomalies, setAnomalies] = useState<any[]>([]);
  // Adicionar estado
  const [anomalyKpis, setAnomalyKpis] = useState<AnomalyKPIs | null>(null);
  // Adicionar estado
  const [topAnomalies, setTopAnomalies] = useState<TopAnomalyItem[]>([]);
  // Adicionar estado
  const [complianceSummary, setComplianceSummary] = useState<ComplianceSummaryItem[]>([]);
  // Adicionar estado
  const [complianceMetrics, setComplianceMetrics] = useState<ComplianceMetrics | null>(null);
  // Adicionar estado
  const [detailedRanking, setDetailedRanking] = useState<DetailedRankingItem[]>([]);
    // Adicionar novo estado para dados do mapa
  const [boundaryMapData, setBoundaryMapData] = useState<BoundaryMapData[]>([]);
    // Adicionar novo estado para zonas ativas
  const [activeZones, setActiveZones] = useState<ActiveZone[]>([]);
  // Adicionar estado
  const [boundaryTransitionsByDuration, setBoundaryTransitionsByDuration] = useState<BoundaryTransitionByDuration[]>([]);
    // ✅ ADICIONAR ESTADO
  const [weekdayWeekendData, setWeekdayWeekendData] = useState<WeekdayWeekendData[]>([]);
  // ✅ ADICIONAR ESTADO
  const [boundaryTrends, setBoundaryTrends] = useState<BoundaryTrendData[]>([]);
  // Estados para diferentes tipos de dados
  const [boundaryAnomalies, setBoundaryAnomalies] = useState<BoundaryAnomalyData[]>([]);


  


  const [sankeyData, setSankeyData] = useState<SankeyDataItem[]>([]);
  const [topTransitions, setTopTransitions] = useState<TopTransitionItem[]>([]);
  const [durationBuckets, setDurationBuckets] = useState<any>(null);
  const [alertRate, setAlertRate] = useState<any[]>([]);
  const [topPeople, setTopPeople] = useState<any[]>([]);
  const [frequencyAnalysis, setFrequencyAnalysis] = useState<any[]>([]);
  const [realTimeStatus, setRealTimeStatus] = useState<any[]>([]);
  const [realTimePagination, setRealTimePagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalRecords: 0,
    limit: 20,
    hasNextPage: false,
    hasPrevPage: false
  });
  const [realTimeLoading, setRealTimeLoading] = useState(false);
  
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    boundaries: [],
    items: [],
    groups: [],
    statuses: []
  });
  const [filterOptionsLoading, setFilterOptionsLoading] = useState(false);

  // Função para converter dados do Sankey para o formato esperado
  const convertSankeyData = (apiData: any[]): SankeyDataItem[] => {
    return apiData.map((item) => ({
      source: item.source,
      target: item.target,
      value: item.value,
      avg_time: item.avg_time,
    }));
  };

  // Função para converter dados de Top Transitions
  const convertTopTransitions = (apiData: any[]): TopTransitionItem[] => {
    return apiData.map((item) => ({
      from_boundary_name: item.from_boundary_name,
      to_boundary_name: item.to_boundary_name,
      transition_count: item.transition_count,
      avg_minutes: item.avg_minutes,
    }));
  };

  // Carregar dados baseado na aba ativa
  useEffect(() => {
    if (!companyId) return;

    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        switch (activeTab) {
          case "overview":
            await Promise.all([
              fetchKPIs(),
              fetchTopBoundaries(),
              fetchShiftDistribution(),
              fetchRealTimeStatus(),
              fetchBoundaryMapData(),
              fetchActiveZones(),
              fetchBoundaryTransitionsByDuration(),
              fetchWeekdayWeekendData(),
              fetchBoundaryTrends(),
              fetchWeekdayWeekendAnalysis(),
              fetchBoundaryAnomalies()
            ]);
            break;

          case "temporal":
            await Promise.all([
              fetchTimeSeries(),
              fetchWeeklyTrends(),
              fetchWeeklyPattern(),
              fetchWeekdayWeekendData(),
            ]);
            break;

          case "heatmap":
            await fetchHeatmap();
            break;

          case "anomalies":
            await fetchAnomalies();
            await fetchAnomalyKpis();
            await fetchTopAnomalies();
            break;

          case "flow":
            await Promise.all([fetchSankeyData(), fetchTopTransitions()]);
            break;

          case "compliance":
            await Promise.all([
              fetchDurationBuckets(),
              fetchAlertRate(),
              fetchComplianceSummary(),
              fetchComplianceMetrics(),
            ]);
            break;

          case "rankings":
            await Promise.all([
              fetchTopPeople(),
              fetchFrequencyAnalysis(),
              fetchDetailedRanking(),
            ]);
            break;
        }
      } catch (err: any) {
        setError(err.message || "Erro ao carregar dados");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [companyId, activeTab, selectedPeriod, realTimeFilters]);


    // Carregar opções de filtros
  useEffect(() => {
    if (!companyId) return;

    const fetchFilterOptions = async () => {
      setFilterOptionsLoading(true);
      try {
        const { data } = await axios.get(
          `${API_BASE_URL}/dashboard/boundary/${companyId}/filter-options`
        );
        setFilterOptions(data.data);
      } catch (err) {
        console.error('Error fetching filter options:', err);
      } finally {
        setFilterOptionsLoading(false);
      }
    };

    fetchFilterOptions();
  }, [companyId]);





  // ✅ ADICIONAR FUNÇÃO DE FETCH
  const fetchWeekdayWeekendData = async () => {
    try {
      const { data } = await axios.get(
        `${API_BASE_URL}/dashboard/boundary/${companyId}/weekday-vs-weekend-analysis`
      );
      setWeekdayWeekendData(data.data || []);
    } catch (err) {
      console.error('Error fetching weekday vs weekend data:', err);
      setWeekdayWeekendData([]);
    }
  };


   // Fetch weekday vs weekend analysis
  const fetchWeekdayWeekendAnalysis = async () => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/dashboard/boundary/${companyId}/weekday-vs-weekend-analysis`
      );
      setWeekdayWeekendData(response.data.data || []);
    } catch (err) {
      console.error('Error fetching weekday-weekend analysis:', err);
      throw err;
    }
  };

    // Fetch boundary anomalies
  const fetchBoundaryAnomalies = async () => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/dashboard/boundary/${companyId}/boundary-anomalies`
      );
      setBoundaryAnomalies(response.data.data || []);
    } catch (err) {
      console.error('Error fetching boundary anomalies:', err);
      throw err;
    }
  };



// ✅ ADICIONAR FUNÇÃO DE FETCH
const fetchBoundaryTrends = async () => {
  try {
    const { data } = await axios.get(
      `${API_BASE_URL}/dashboard/boundary/${companyId}/boundary-trends`
    );
    setBoundaryTrends(data.data || []);
  } catch (err) {
    console.error('Error fetching boundary trends:', err);
    setBoundaryTrends([]);
  }
};


  // Adicionar função de fetch
  const fetchAnomalyKpis = async () => {
    const { data } = await axios.get(
      `${API_BASE_URL}/dashboard/boundary/${companyId}/anomaly-kpis`
    );
    setAnomalyKpis(data.data);
  };

  // Funções de fetch individuais
  const fetchKPIs = async () => {
    const { data } = await axios.get(
      `${API_BASE_URL}/dashboard/boundary/${companyId}/kpis`
    );
    setKpis(data.data);
  };

  const fetchTopBoundaries = async () => {
    const { data } = await axios.get(
      `${API_BASE_URL}/dashboard/boundary/${companyId}/top-boundaries?limit=10`
    );
    setTopBoundaries(data.data);
  };

  const fetchShiftDistribution = async () => {
    const { data } = await axios.get(
      `${API_BASE_URL}/dashboard/boundary/${companyId}/shift-distribution`
    );
    setShiftDistribution(data.data);
  };



  // Adicionar função de fetch
const fetchBoundaryTransitionsByDuration = async () => {
  try {
    const { data } = await axios.get(
      `${API_BASE_URL}/dashboard/boundary/${companyId}/transitions-by-duration`
    );
    setBoundaryTransitionsByDuration(data.data || []);
  } catch (err) {
    console.error('Error fetching boundary transitions by duration:', err);
    setBoundaryTransitionsByDuration([]);
  }
};

  // Adicionar função de fetch para dados do mapa
  const fetchBoundaryMapData = async () => {
    try {
      const { data } = await axios.get(
        `${API_BASE_URL}/dashboard/boundary/${companyId}/map-data`
      );
      
      // Processar dados para garantir formato correto
      const processedData = (data.data || []).map((item: any) => ({
        boundary_id: item.boundary_id,
        boundary_name: item.boundary_name,
        geojson_data: typeof item.geojson_data === 'string' 
          ? JSON.parse(item.geojson_data) 
          : item.geojson_data,
        centroid_lat: parseFloat(item.centroid_lat || item.lat || 0),
        centroid_lng: parseFloat(item.centroid_lng || item.log || 0),
        visits: parseInt(item.visits || 0),
        duration_hours: parseFloat(item.duration_hours || 0),
        is_currently_inside: parseInt(item.is_currently_inside || 0)
      }));

      setBoundaryMapData(processedData);
    } catch (err) {
      console.error("Error fetching boundary map data:", err);
      setBoundaryMapData([]);
    }
  };

  // Adicionar função de fetch para zonas ativas
  const fetchActiveZones = async () => {
    try {
      const { data } = await axios.get(
        `${API_BASE_URL}/dashboard/devices/${companyId}/zones/active`
      );
      setActiveZones(data.data || []);
    } catch (err) {
      console.error("Error fetching active zones:", err);
      setActiveZones([]);
    }
  };

  const fetchTimeSeries = async () => {
    const days =
      selectedPeriod === "7d" ? 7 : selectedPeriod === "30d" ? 30 : 90;
    const { data } = await axios.get(
      `${API_BASE_URL}/dashboard/boundary/${companyId}/time-series?days=${days}`
    );
    setTimeSeries(data.data);
  };

  const fetchWeeklyTrends = async () => {
    const { data } = await axios.get(
      `${API_BASE_URL}/dashboard/boundary/${companyId}/weekly-trends?weeks=8`
    );
    setWeeklyTrends(data.data);
  };

  const fetchWeeklyPattern = async () => {
    const { data } = await axios.get(
      `${API_BASE_URL}/dashboard/boundary/${companyId}/weekly-pattern`
    );
    setWeeklyPattern(data.data);
  };

  const fetchHeatmap = async () => {
    const { data } = await axios.get(
      `${API_BASE_URL}/dashboard/boundary/${companyId}/heatmap?days=30`
    );
    setHeatmap(data.data);
  };

  const fetchAnomalies = async () => {
    const { data } = await axios.get(
      `${API_BASE_URL}/dashboard/boundary/${companyId}/anomalies?limit=100`
    );
    setAnomalies(data.data);
  };

  // Adicionar função de fetch
  const fetchTopAnomalies = async () => {
    try {
      const { data } = await axios.get(
        `${API_BASE_URL}/dashboard/boundary/${companyId}/top-anomalies`
      );
      // A API retorna { data: [...] }
      setTopAnomalies(data.data || []);
    } catch (err) {
      console.error("Error fetching top anomalies:", err);
      setTopAnomalies([]);
    }
  };

  const fetchSankeyData = async () => {
    try {
      const { data } = await axios.get(
        `${API_BASE_URL}/dashboard/boundary/${companyId}/sankey?minTransitions=5`
      );
      setSankeyData(convertSankeyData(data.data));
    } catch (err) {
      console.error("Error fetching sankey data:", err);
      setSankeyData([]);
    }
  };

  const fetchTopTransitions = async () => {
    try {
      const { data } = await axios.get(
        `${API_BASE_URL}/dashboard/boundary/${companyId}/top-transitions?limit=20`
      );
      setTopTransitions(convertTopTransitions(data.data));
    } catch (err) {
      console.error("Error fetching top transitions:", err);
      setTopTransitions([]);
    }
  };

  const fetchDurationBuckets = async () => {
    const { data } = await axios.get(
      `${API_BASE_URL}/dashboard/boundary/${companyId}/duration-buckets`
    );
    setDurationBuckets(data.data);
  };

  const fetchAlertRate = async () => {
    const { data } = await axios.get(
      `${API_BASE_URL}/dashboard/boundary/${companyId}/alert-rate?limit=10`
    );
    setAlertRate(data.data);
  };

  // Adicionar função de fetch
  const fetchComplianceSummary = async () => {
    try {
      const { data } = await axios.get(
        `${API_BASE_URL}/dashboard/boundary/${companyId}/compliance-summary`
      );
      // A API retorna { data: [...] }
      setComplianceSummary(data.data || []);
    } catch (err) {
      console.error("Error fetching compliance summary:", err);
      setComplianceSummary([]);
    }
  };

  // Adicionar função de fetch
  const fetchComplianceMetrics = async () => {
    try {
      const { data } = await axios.get(
        `${API_BASE_URL}/dashboard/boundary/${companyId}/compliance-metrics`
      );
      setComplianceMetrics(data.data);
    } catch (err) {
      console.error("Error fetching compliance metrics:", err);
      setComplianceMetrics(null);
    }
  };

  const fetchTopPeople = async () => {
    const { data } = await axios.get(
      `${API_BASE_URL}/dashboard/boundary/${companyId}/top-people?limit=10`
    );
    setTopPeople(data.data);
  };

  const fetchFrequencyAnalysis = async () => {
    const { data } = await axios.get(
      `${API_BASE_URL}/dashboard/boundary/${companyId}/frequency?limit=10`
    );
    setFrequencyAnalysis(data.data);
  };

  // Adicionar função de fetch

const fetchDetailedRanking = async () => {
  try {
    const { data } = await axios.get(`${API_BASE_URL}/dashboard/boundary/${companyId}/detailed-ranking?limit=10`);
    // A API retorna { data: [...] }
    setDetailedRanking(data.data || []);
  } catch (err) {
    console.error('Error fetching detailed ranking:', err);
    setDetailedRanking([]);
  }
};

 // Atualizar fetchRealTimeStatus
  const fetchRealTimeStatus = async () => {
    setRealTimeLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('limit', String(realTimeFilters?.limit || 20));
      params.append('page', String(realTimeFilters?.page || 1));

      if (realTimeFilters?.itemName) {
        params.append('itemName', realTimeFilters.itemName);
      }
      if (realTimeFilters?.boundaryName) {
        params.append('boundaryName', realTimeFilters.boundaryName);
      }
      if (realTimeFilters?.status) {
        params.append('status', realTimeFilters.status);
      }
      if (realTimeFilters?.minDuration) {
        params.append('minDuration', realTimeFilters.minDuration);
      }
      if (realTimeFilters?.maxDuration) {
        params.append('maxDuration', realTimeFilters.maxDuration);
      }

      const { data } = await axios.get(
        `${API_BASE_URL}/dashboard/boundary/${companyId}/real-time-status?${params.toString()}`
      );
      
      setRealTimeStatus(data.data || []);
      if (data.pagination) {
        setRealTimePagination(data.pagination);
      }
    } catch (err) {
      console.error('Error fetching real-time status:', err);
      setRealTimeStatus([]);
    } finally {
      setRealTimeLoading(false);
    }
  };

  return {
    kpis,
    topBoundaries,
    shiftDistribution,
    timeSeries,
    weeklyTrends,
    weeklyPattern,
    heatmap,
    anomalies,
    anomalyKpis,
    topAnomalies,
    sankeyData,
    topTransitions,
    durationBuckets,
    alertRate,
    complianceSummary,
    complianceMetrics,
    topPeople,
    frequencyAnalysis,
    detailedRanking,
    realTimeStatus,
    realTimePagination,
    realTimeLoading,
    filterOptions,
    filterOptionsLoading,
    boundaryMapData,
    activeZones,
    boundaryTransitionsByDuration,
    weekdayWeekendData, // ✅ ADICIONAR AQUI
    boundaryTrends, 
    boundaryAnomalies,
    loading,
    error,
  };
};
