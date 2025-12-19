// src/hooks/useBoundaryAnalytics.ts
import { useState, useEffect } from 'react';
// https://apinode.smartxhub.cloud
const API_BASE_URL = 'https://apinode.smartxhub.cloud/api/dashboard/boundary'; // Altere para a URL correta da sua API
// const baseURL = '/api/dashboard/boundary';

interface DashboardKPIs {
  total_hours_today: number;
  total_visits_today: number;
  total_hours_yesterday: number;
  total_visits_yesterday: number;
  total_hours_7d: number;
  total_visits_7d: number;
  total_hours_30d: number;
  total_visits_30d: number;
  people_inside: number;
  alerts_today: number;
  total_boundaries: number;
  total_people: number;
}

interface TopBoundary {
  boundary_id: number;
  boundary_name: string;
  group_name: string;
  duration_hours: number;
  visits: number;
}

interface ShiftDistribution {
  morning: number;
  afternoon: number;
  night: number;
  total: number;
}

interface TimeSeries {
  entry_date: string;
  date_display: string;
  daily_duration_hours: number;
  daily_visits: number;
  ma_7d_duration_hours: number;
  ma_7d_visits: number;
  ma_30d_duration_hours: number;
  ma_30d_visits: number;
  trend_direction: string;
  volatility_7d: number;
}

interface WeeklyTrend {
  year_week: string;
  boundary_name: string;
  duration_current_week_hours: number;
  visits_current_week: number;
  duration_last_week_hours: number;
  visits_last_week: number;
  wow_duration_change_pct: number;
}

interface WeeklyPattern {
  day_of_week: number;
  day_name: string;
  avg_duration_hours: number;
  avg_visits: number;
}

interface HeatmapData {
  entry_hour: number;
  entry_day_of_week: number;
  total_entries: number;
  total_duration: number;
}

interface Anomaly {
  entry_date: string;
  item_name: string;
  boundary_name: string;
  duration_hours: number;
  avg_duration_hours: number;
  z_score_duration: number;
  anomaly_level: string;
}

interface AnomalyKPIs {
  detected_anomalies: number;
  avg_z_score: number;
  extreme_anomalies: number;
  high_anomalies: number;
}

interface SankeyData {
  source: string;
  target: string;
  value: number;
}

interface Transition {
  from_boundary_name: string;
  to_boundary_name: string;
  transition_count: number;
  avg_minutes: number;
  transition_type: string;
}

interface ComplianceMetrics {
  avg_compliance_rate: number;
  avg_alert_rate: number;
  avg_off_hours_pct: number;
  avg_weekend_pct: number;
  avg_long_visit_pct: number;
}

interface DurationBuckets {
  very_short: number;
  short: number;
  medium: number;
  long: number;
  very_long: number;
}

interface AlertRate {
  boundary_id: number;
  boundary_name: string;
  alert_rate_pct: number;
  total_visits: number;
}

interface ComplianceSummary {
  boundary_name: string;
  total_visits: number;
  alert_rate_pct: number;
  off_hours_entry_pct: number;
  weekend_visit_pct: number;
  status: string;
}

interface TopPerson {
  item_id: number;
  item_name: string;
  primary_boundary_name: string;
  total_duration_hours: number;
  total_visits: number;
}

interface FrequencyAnalysis {
  item_name: string;
  boundary_name: string;
  avg_visits_per_day: number;
  total_visits: number;
}

interface RealTimeStatus {
  item_id: number;
  item_name: string;
  boundary_id: number;
  boundary_name: string;
  last_entry: string;
  duration_today_hours: number;
  is_currently_inside: number;
  total_alerts: number;
  status: 'NORMAL' | 'LONG' | 'ALERT';
}

export const useBoundaryAnalytics = (
  companyId: string | number,
  activeTab: string,
  selectedPeriod: '7d' | '30d' | '90d' = '30d'
) => {
  // Estados para cada tipo de dado
  const [kpis, setKpis] = useState<DashboardKPIs | null>(null);
  const [topBoundaries, setTopBoundaries] = useState<TopBoundary[]>([]);
  const [shiftDistribution, setShiftDistribution] = useState<ShiftDistribution | null>(null);
  const [timeSeries, setTimeSeries] = useState<TimeSeries[]>([]);
  const [weeklyTrends, setWeeklyTrends] = useState<WeeklyTrend[]>([]);
  const [weeklyPattern, setWeeklyPattern] = useState<WeeklyPattern[]>([]);
  const [heatmap, setHeatmap] = useState<HeatmapData[]>([]);
  const [anomalies, setAnomalies] = useState<Anomaly[]>([]);
  const [anomalyKPIs, setAnomalyKPIs] = useState<AnomalyKPIs | null>(null);
  const [sankeyData, setSankeyData] = useState<SankeyData[]>([]);
  const [topTransitions, setTopTransitions] = useState<Transition[]>([]);
  const [complianceMetrics, setComplianceMetrics] = useState<ComplianceMetrics | null>(null);
  const [durationBuckets, setDurationBuckets] = useState<DurationBuckets | null>(null);
  const [alertRate, setAlertRate] = useState<AlertRate[]>([]);
  const [complianceSummary, setComplianceSummary] = useState<ComplianceSummary[]>([]);
  const [topPeople, setTopPeople] = useState<TopPerson[]>([]);
  const [frequencyAnalysis, setFrequencyAnalysis] = useState<FrequencyAnalysis[]>([]);
  const [realTimeStatus, setRealTimeStatus] = useState<RealTimeStatus[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Helper function para fazer fetch
  const fetchData = async <T,>(endpoint: string): Promise<T> => {
    try {
      const response = await fetch(`${API_BASE_URL}/${companyId}/${endpoint}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const json = await response.json();
      return json.data;
    } catch (err) {
      console.error(`Error fetching ${endpoint}:`, err);
      throw err;
    }
  };

  // Carregar dados baseado na tab ativa
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);

      try {
        // Dados básicos sempre carregados
        if (activeTab === 'overview') {
          const [kpisData, topBoundariesData, shiftData, statusData] = await Promise.all([
            fetchData<DashboardKPIs>('kpis'),
            fetchData<TopBoundary[]>(`top-boundaries?period=${selectedPeriod}&limit=10`),
            fetchData<ShiftDistribution>('shift-distribution'),
            fetchData<RealTimeStatus[]>('real-time-status?limit=10')
          ]);

          setKpis(kpisData);
          setTopBoundaries(topBoundariesData);
          setShiftDistribution(shiftData);
          setRealTimeStatus(statusData);
        }

        // Temporal
        else if (activeTab === 'temporal') {
          const days = selectedPeriod === '7d' ? 7 : selectedPeriod === '30d' ? 30 : 90;
          
          const [timeSeriesData, weeklyTrendsData, weeklyPatternData] = await Promise.all([
            fetchData<TimeSeries[]>(`time-series?days=${days}`),
            fetchData<WeeklyTrend[]>('weekly-trends?weeks=8'),
            fetchData<WeeklyPattern[]>('weekly-pattern')
          ]);

          setTimeSeries(timeSeriesData);
          setWeeklyTrends(weeklyTrendsData);
          setWeeklyPattern(weeklyPatternData);
        }

        // Heatmap
        else if (activeTab === 'heatmap') {
          const heatmapData = await fetchData<HeatmapData[]>('heatmap');
          setHeatmap(heatmapData);
        }

        // Anomalies
        else if (activeTab === 'anomalies') {
          const [anomaliesData, anomalyKPIsData] = await Promise.all([
            fetchData<Anomaly[]>('anomalies?minZScore=2.0&days=30'),
            fetchData<AnomalyKPIs>('anomaly-kpis')
          ]);

          setAnomalies(anomaliesData);
          setAnomalyKPIs(anomalyKPIsData);
        }

        // Flow
        else if (activeTab === 'flow') {
          const [sankeyFlowData, transitionsData] = await Promise.all([
            fetchData<SankeyData[]>('sankey?minTransitions=5'),
            fetchData<Transition[]>('top-transitions?limit=20')
          ]);

          setSankeyData(sankeyFlowData);
          setTopTransitions(transitionsData);
        }

        // Compliance
        else if (activeTab === 'compliance') {
          const [complianceData, bucketsData, alertRateData, summaryData] = await Promise.all([
            fetchData<ComplianceMetrics>('compliance-metrics'),
            fetchData<DurationBuckets>('duration-buckets'),
            fetchData<AlertRate[]>('alert-rate'),
            fetchData<ComplianceSummary[]>('compliance-summary')
          ]);

          setComplianceMetrics(complianceData);
          setDurationBuckets(bucketsData);
          setAlertRate(alertRateData);
          setComplianceSummary(summaryData);
        }

        // Rankings
        else if (activeTab === 'rankings') {
          const [topPeopleData, frequencyData] = await Promise.all([
            fetchData<TopPerson[]>('top-people?limit=10&metric=duration'),
            fetchData<FrequencyAnalysis[]>('frequency?minFrequency=2')
          ]);

          setTopPeople(topPeopleData);
          setFrequencyAnalysis(frequencyData);
        }

      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro desconhecido');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [companyId, activeTab, selectedPeriod]);

  // Carregar KPIs sempre (para o header)
  useEffect(() => {
    const loadKPIs = async () => {
      try {
        const kpisData = await fetchData<DashboardKPIs>('kpis');
        setKpis(kpisData);
      } catch (err) {
        console.error('Error loading KPIs:', err);
      }
    };

    if (!kpis) {
      loadKPIs();
    }
  }, [companyId]);

  return {
    kpis,
    topBoundaries,
    shiftDistribution,
    timeSeries,
    weeklyTrends,
    weeklyPattern,
    heatmap,
    anomalies,
    anomalyKPIs,
    sankeyData,
    topTransitions,
    complianceMetrics,
    durationBuckets,
    alertRate,
    complianceSummary,
    topPeople,
    frequencyAnalysis,
    realTimeStatus,
    loading,
    error
  };
};