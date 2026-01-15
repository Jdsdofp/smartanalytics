// src/hooks/useRiskManagement.ts
import { useState, useEffect } from "react";
import axios from "axios";
import { useCompany } from "./useCompany";

// URL da API
//https://apinode.smartxhub.cloud - prod
//http://localhost:4000 - dev
const API_BASE_URL = "https://apinode.smartxhub.cloud/api";

// =====================================
// 📝 INTERFACES
// =====================================

export interface KPIData {
    total_active_badges: number;
    critical_badges: number;
    high_risk_badges: number;
    mandown_count: number;
    sos_count: number;
    alarm_count: number;
    immobile_badge_count: number;
    high_impact_count: number;
    critical_state_count: number;
    extreme_temp_count: number;
    battery_critical_count: number;
    avg_risk_score: number;
    avg_battery_percent: number;
    avg_temperature: number;
    avg_gforce: number;
}

export interface StateKPIData {
    critical_state_badges: number;
    degraded_badges: number;
    degrading_badges: number;
    recovering_badges: number;
    damage_badges: number;
    no_power_badges: number;
    failure_badges: number;
    abnormal_badges: number;
    avg_composite_risk: number;
}

export interface RiskTimelineData {
    hour_bucket: string;
    badges_critical_state: number;
    badges_high_risk_state: number;
    badges_medium_risk_state: number;
    badges_low_risk_state: number;
    total_active_badges: number;
    pct_critical: number;
}

export interface StateDistributionData {
    state_name: string;
    badge_count: number;
    percentage: number;
    color: string;
}

export interface DegradationEvent {
    degradation_time: string;
    badge_number: string;
    image_hash: string;
    name: string;
    code_category: string;
    degradation_type: string;
    current_state: string;
    previous_state: string;
    degradation_severity_score: number;
    event_severity: string;
    trend_direction: string;
    hours_in_previous_state: number;
}

export interface PredictiveRanking {
    badge_number: string;
    current_state_name: string;
    predictive_risk_score: number;
    predictive_risk_level: string;
    critical_state_count_24h: number;
    degradation_transitions_24h: number;
    emergency_history_7d: number;
    alarm_history_7d: number;
    avg_battery_7d: number;
    risk_recommendation: string;
}

export interface GPSLocation {
    badge_number: string;
    latitude: number;
    longitude: number;
    risk_level: string;
    risk_score: number;
    ambient_temp_c: number;
    battery_percent: number;
    state_description: string;
    marker_type: string;
    seconds_since_update: number;
}

export interface MotionTimelineData {
    hour_bucket: string;
    max_gforce: number;
    avg_gforce: number;
    impact_count: number;
    badges_with_impact: number;
}

export interface ImpactDistributionData {
    severity_level: string;
    count: number;
    percentage: number;
    color: string;
}

export interface ImmobilityAlert {
    badge_number: string;
    duration_minutes: number;
    severity: string;
    latitude: number;
    longitude: number;
    last_gforce: number;
    last_event_time: string;
    state_description: string;
}

export interface BatteryDistribution {
    range_label: string;
    badge_count: number;
    percentage: number;
}

export interface EventFilters {
    severities: string[];
    degradationTypes: string[];
    startDate?: string;
    endDate?: string;
    searchTerm?: string;
}

// =====================================
// 🎣 HOOK
// =====================================

export const useRiskManagement = (
    activeTab: string,
    //@ts-ignore
    autoRefresh: boolean = false,
    //@ts-ignore
    refreshInterval: number = 30000 // 30 segundos
) => {
    const { companyId } = useCompany();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Estados para cada tipo de dado
    const [kpis, setKpis] = useState<KPIData | null>(null);
    const [stateKpis, setStateKpis] = useState<StateKPIData | null>(null);
    const [timeline, setTimeline] = useState<RiskTimelineData[]>([]);
    const [stateDistribution, setStateDistribution] = useState<StateDistributionData[]>([]);
    const [events, setEvents] = useState<DegradationEvent[]>([]);
    const [ranking, setRanking] = useState<PredictiveRanking[]>([]);
    const [locations, setLocations] = useState<GPSLocation[]>([]);
    const [motionTimeline, setMotionTimeline] = useState<MotionTimelineData[]>([]);
    const [impactDistribution, setImpactDistribution] = useState<ImpactDistributionData[]>([]);
    const [immobilityAlerts, setImmobilityAlerts] = useState<ImmobilityAlert[]>([]);
    const [batteryDistribution, setBatteryDistribution] = useState<BatteryDistribution[]>([]);
    // Adicionar ao hook
    const [eventFilters, setEventFilters] = useState<EventFilters>({
        severities: ['CRITICAL', 'HIGH'],
        degradationTypes: [],
    });

    // =====================================
    // 🔧 FUNÇÕES DE FETCH INDIVIDUAIS
    // =====================================

    const fetchKPIs = async () => {
        const { data } = await axios.get(
            `${API_BASE_URL}/dashboard/risk/${companyId}/kpis`
        );
        setKpis(data.data);
    };

    const fetchStateKPIs = async () => {
        const { data } = await axios.get(
            `${API_BASE_URL}/dashboard/risk/${companyId}/state-kpis`
        );
        setStateKpis(data.data);
    };

    const fetchRiskTimeline = async () => {
        const { data } = await axios.get(
            `${API_BASE_URL}/dashboard/risk/${companyId}/risk-timeline`
        );
        setTimeline(data.data || []);
    };

    const fetchStateDistribution = async () => {
        const { data } = await axios.get(
            `${API_BASE_URL}/dashboard/risk/${companyId}/state-distribution`
        );
        setStateDistribution(data.data || []);
    };

    // const fetchDegradationEvents = async () => {
    //     const { data } = await axios.get(
    //         `${API_BASE_URL}/dashboard/risk/${companyId}/degradation-events?limit=100`
    //     );
    //     setEvents(data.data || []);
    // };

    const fetchDegradationEvents = async (filters?: EventFilters) => {
    const params = new URLSearchParams();
    params.append('limit', '100');
    
    if (filters?.severities && filters.severities.length > 0) {
        params.append('severities', filters.severities.join(','));
    }
    
    if (filters?.degradationTypes && filters.degradationTypes.length > 0) {
        params.append('degradationTypes', filters.degradationTypes.join(','));
    }
    
    if (filters?.startDate) {
        params.append('startDate', filters.startDate);
    }
    
    if (filters?.endDate) {
        params.append('endDate', filters.endDate);
    }
    
    if (filters?.searchTerm) {
        params.append('searchTerm', filters.searchTerm);
    }

    const { data } = await axios.get(
        `${API_BASE_URL}/dashboard/risk/${companyId}/degradation-events?${params.toString()}`
    );
    setEvents(data.data || []);
};


    const fetchPredictiveRanking = async () => {
        const { data } = await axios.get(
            `${API_BASE_URL}/dashboard/risk/${companyId}/predictive-ranking?limit=20`
        );
        setRanking(data.data || []);
    };

    const fetchGPSLocations = async () => {
        const { data } = await axios.get(
            `${API_BASE_URL}/dashboard/risk/${companyId}/gps-locations`
        );
        setLocations(data.data || []);
    };

    const fetchMotionTimeline = async () => {
        const { data } = await axios.get(
            `${API_BASE_URL}/dashboard/risk/${companyId}/motion-timeline`
        );
        setMotionTimeline(data.data || []);
    };

    const fetchImpactDistribution = async () => {
        const { data } = await axios.get(
            `${API_BASE_URL}/dashboard/risk/${companyId}/impact-distribution`
        );
        setImpactDistribution(data.data || []);
    };

    const fetchImmobilityAlerts = async () => {
        const { data } = await axios.get(
            `${API_BASE_URL}/dashboard/risk/${companyId}/immobility-alerts`
        );
        setImmobilityAlerts(data.data || []);
    };

    // Função para calcular distribuição de bateria dos KPIs
    //@ts-ignore
    const calculateBatteryDistribution = (kpisData: KPIData) => {
        // Mock data - você pode ajustar baseado nos dados reais
        const distribution = [
            { range_label: 'Critical\n(<10%)', badge_count: 2, percentage: 16.7 },
            { range_label: 'Low\n(10-20%)', badge_count: 3, percentage: 25.0 },
            { range_label: 'Medium\n(20-40%)', badge_count: 4, percentage: 33.3 },
            { range_label: 'Good\n(>40%)', badge_count: 3, percentage: 25.0 },
        ];
        setBatteryDistribution(distribution);
    };

    // =====================================
    // 🔄 CARREGAR DADOS BASEADO NA ABA
    // =====================================

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
                            fetchStateKPIs(),
                            fetchRiskTimeline(),
                            fetchStateDistribution(),
                        ]);
                        break;

                    case "motion":
                        await Promise.all([
                            fetchMotionTimeline(),
                            fetchImpactDistribution(),
                        ]);
                        break;

                    case "state":
                        await Promise.all([
                            fetchStateDistribution(),
                            fetchRiskTimeline(),
                            fetchImmobilityAlerts(),
                        ]);
                        break;

                    case "trends":
                        await Promise.all([
                            fetchRiskTimeline(),
                            fetchStateDistribution(),
                            fetchPredictiveRanking(),
                        ]);
                        break;

                    case "events":
                        await fetchDegradationEvents();
                        break;

                    case "map":
                        await fetchGPSLocations();
                        break;

                    default:
                        // Carregar dados essenciais para qualquer aba
                        await Promise.all([
                            fetchKPIs(),
                            fetchStateKPIs(),
                        ]);
                        break;
                }
            } catch (err: any) {
                console.error("Error fetching risk data:", err);
                setError(err.message || "Erro ao carregar dados");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [companyId, activeTab]);

    // =====================================
    // 🔄 AUTO-REFRESH
    // =====================================

    // useEffect(() => {
    //     if (!autoRefresh || !companyId) return;

    //     const interval = setInterval(async () => {
    //         try {
    //             // Atualizar apenas KPIs e dados em tempo real
    //             await Promise.all([
    //                 fetchKPIs(),
    //                 fetchStateKPIs(),
    //                 fetchGPSLocations(),
    //             ]);
    //         } catch (err) {
    //             console.error("Error during auto-refresh:", err);
    //         }
    //     }, refreshInterval);

    //     return () => clearInterval(interval);
    // }, [autoRefresh, companyId, refreshInterval]);

    // =====================================
    // 🔄 ATUALIZAR BATTERY DISTRIBUTION
    // =====================================

    useEffect(() => {
        if (kpis) {
            calculateBatteryDistribution(kpis);
        }
    }, [kpis]);

    // ✨ FUNÇÃO PARA APLICAR FILTROS
    const applyEventFilters = async () => {
        setLoading(true);
        try {
            await fetchDegradationEvents(eventFilters);
        } catch (err) {
            console.error("Error applying filters:", err);
        } finally {
            setLoading(false);
        }
    };

    // =====================================
    // 📤 RETORNO DO HOOK
    // =====================================

    return {
        // Dados
        kpis,
        stateKpis,
        timeline,
        stateDistribution,
        events,
        ranking,
        locations,
        motionTimeline,
        impactDistribution,
        immobilityAlerts,
        batteryDistribution,

        // Estados
        loading,
        error,

        // ✨ NOVOS RETORNOS PARA FILTROS
        eventFilters,
        setEventFilters,
        applyEventFilters,

        // Funções para refresh manual
        refreshKPIs: fetchKPIs,
        refreshStateKPIs: fetchStateKPIs,
        refreshTimeline: fetchRiskTimeline,
        refreshStateDistribution: fetchStateDistribution,
        refreshEvents: fetchDegradationEvents,
        refreshRanking: fetchPredictiveRanking,
        refreshLocations: fetchGPSLocations,
        refreshMotionTimeline: fetchMotionTimeline,
        refreshImpactDistribution: fetchImpactDistribution,
        refreshImmobilityAlerts: fetchImmobilityAlerts
    };
};