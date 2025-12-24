// src/hooks/useBoundaryAnalytics.ts
import { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:4000/api';

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

export const useBoundaryAnalytics = (companyId: number, activeTab: string, selectedPeriod: '7d' | '30d' | '90d') => {
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
  const [sankeyData, setSankeyData] = useState<SankeyDataItem[]>([]);
  const [topTransitions, setTopTransitions] = useState<TopTransitionItem[]>([]);
  const [durationBuckets, setDurationBuckets] = useState<any>(null);
  const [alertRate, setAlertRate] = useState<any[]>([]);
  const [topPeople, setTopPeople] = useState<any[]>([]);
  const [frequencyAnalysis, setFrequencyAnalysis] = useState<any[]>([]);
  const [realTimeStatus, setRealTimeStatus] = useState<any[]>([]);

  // Função para converter dados do Sankey para o formato esperado
  const convertSankeyData = (apiData: any[]): SankeyDataItem[] => {
    return apiData.map(item => ({
      source: item.source,
      target: item.target,
      value: item.value,
      avg_time: item.avg_time
    }));
  };

  // Função para converter dados de Top Transitions
  const convertTopTransitions = (apiData: any[]): TopTransitionItem[] => {
    return apiData.map(item => ({
      from_boundary_name: item.from_boundary_name,
      to_boundary_name: item.to_boundary_name,
      transition_count: item.transition_count,
      avg_minutes: item.avg_minutes
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
          case 'overview':
            await Promise.all([
              fetchKPIs(),
              fetchTopBoundaries(),
              fetchShiftDistribution(),
              fetchRealTimeStatus()
            ]);
            break;

          case 'temporal':
            await Promise.all([
              fetchTimeSeries(),
              fetchWeeklyTrends(),
              fetchWeeklyPattern()
            ]);
            break;

          case 'heatmap':
            await fetchHeatmap();
            break;

          case 'anomalies':
            await fetchAnomalies();
            break;

          case 'flow':
            await Promise.all([
              fetchSankeyData(),
              fetchTopTransitions()
            ]);
            break;

          case 'compliance':
            await Promise.all([
              fetchDurationBuckets(),
              fetchAlertRate()
            ]);
            break;

          case 'rankings':
            await Promise.all([
              fetchTopPeople(),
              fetchFrequencyAnalysis()
            ]);
            break;
        }
      } catch (err: any) {
        setError(err.message || 'Erro ao carregar dados');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [companyId, activeTab, selectedPeriod]);

  // Funções de fetch individuais
  const fetchKPIs = async () => {
    const { data } = await axios.get(`${API_BASE_URL}/dashboard/boundary/${companyId}/kpis`);
    setKpis(data.data);
  };

  const fetchTopBoundaries = async () => {
    const { data } = await axios.get(`${API_BASE_URL}/dashboard/boundary/${companyId}/top-boundaries?limit=10`);
    setTopBoundaries(data.data);
  };

  const fetchShiftDistribution = async () => {
    const { data } = await axios.get(`${API_BASE_URL}/dashboard/boundary/${companyId}/shift-distribution`);
    setShiftDistribution(data.data);
  };

  const fetchTimeSeries = async () => {
    const days = selectedPeriod === '7d' ? 7 : selectedPeriod === '30d' ? 30 : 90;
    const { data } = await axios.get(`${API_BASE_URL}/dashboard/boundary/${companyId}/time-series?days=${days}`);
    setTimeSeries(data.data);
  };

  const fetchWeeklyTrends = async () => {
    const { data } = await axios.get(`${API_BASE_URL}/dashboard/boundary/${companyId}/weekly-trends?weeks=8`);
    setWeeklyTrends(data.data);
  };

  const fetchWeeklyPattern = async () => {
    const { data } = await axios.get(`${API_BASE_URL}/dashboard/boundary/${companyId}/weekly-pattern`);
    setWeeklyPattern(data.data);
  };

  const fetchHeatmap = async () => {
    const { data } = await axios.get(`${API_BASE_URL}/dashboard/boundary/${companyId}/heatmap?days=30`);
    setHeatmap(data.data);
  };

  const fetchAnomalies = async () => {
    const { data } = await axios.get(`${API_BASE_URL}/dashboard/boundary/${companyId}/anomalies?limit=100`);
    setAnomalies(data.data);
  };

  const fetchSankeyData = async () => {
    try {
      const { data } = await axios.get(`${API_BASE_URL}/dashboard/boundary/${companyId}/sankey?minTransitions=5`);
      setSankeyData(convertSankeyData(data.data));
    } catch (err) {
      console.error('Error fetching sankey data:', err);
      setSankeyData([]);
    }
  };

  const fetchTopTransitions = async () => {
    try {
      const { data } = await axios.get(`${API_BASE_URL}/dashboard/boundary/${companyId}/top-transitions?limit=20`);
      setTopTransitions(convertTopTransitions(data.data));
    } catch (err) {
      console.error('Error fetching top transitions:', err);
      setTopTransitions([]);
    }
  };

  const fetchDurationBuckets = async () => {
    const { data } = await axios.get(`${API_BASE_URL}/dashboard/boundary/${companyId}/duration-buckets`);
    setDurationBuckets(data.data);
  };

  const fetchAlertRate = async () => {
    const { data } = await axios.get(`${API_BASE_URL}/dashboard/boundary/${companyId}/alert-rate?limit=10`);
    setAlertRate(data.data);
  };

  const fetchTopPeople = async () => {
    const { data } = await axios.get(`${API_BASE_URL}/dashboard/boundary/${companyId}/top-people?limit=10`);
    setTopPeople(data.data);
  };

  const fetchFrequencyAnalysis = async () => {
    const { data } = await axios.get(`${API_BASE_URL}/dashboard/boundary/${companyId}/frequency?limit=10`);
    setFrequencyAnalysis(data.data);
  };

  const fetchRealTimeStatus = async () => {
    const { data } = await axios.get(`${API_BASE_URL}/dashboard/boundary/${companyId}/real-time-status?limit=20`);
    setRealTimeStatus(data.data);
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
    sankeyData,
    topTransitions,
    durationBuckets,
    alertRate,
    topPeople,
    frequencyAnalysis,
    realTimeStatus,
    loading,
    error
  };
};