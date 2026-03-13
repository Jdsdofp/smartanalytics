// src/hooks/useAssetMaps.ts
import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

// =====================================================
// INTERFACES
// =====================================================

export interface GPSAsset {
    code: string;
    name: string;
    latitude: number;
    longitude: number;
    category: string;
    condition: string;
    custody: string;
    site: string;
    area: string;
    zone: string;
    last_seen: string;
    next_service: string;
    warranty_ends: string;
    active: boolean;
    alarmed: boolean;
    status: 'success' | 'warning' | 'danger' | 'inactive';
}

export interface GPSStats {
    total_assets: number;
    assets_with_gps: number;
    active_assets: number;
    alarmed_assets: number;
    inactive_assets: number;
    overdue_service: number;
    misplaced_assets: number;
    gps_coverage_pct: number;
}

export interface GPSFilters {
    sites: FilterOption[];
    categories: FilterOption[];
    custodies: FilterOption[];
}

export interface FilterOption {
    id: number;
    code: string;
    name: string;
}

export interface GPSMapFilters {
    site?: string;
    category?: string;
    custody?: string;
    search?: string;
    limit?: number;
}

export interface GPSHistory {
    id: number;
    asset_code: string;
    latitude: number;
    longitude: number;
    gps_accuracy: number;
    gps_altitude: number;
    zone_name: string;
    recorded_at: string;
    update_source: string;
    updated_by: string;
    movement_type: string;
    distance_moved_meters: number;
}

export interface GPSAlert {
    id: number;
    asset_code: string;
    alert_type: string;
    alert_severity: string;
    alert_message: string;
    alert_details: string;
    latitude: number;
    longitude: number;
    alert_status: string;
    created_at: string;
}

export interface UpdateGPSPayload {
    asset_code: string;
    latitude: number;
    longitude: number;
    accuracy?: number;
    altitude?: number;
    source?: string;
    updated_by?: string;
}

export interface BulkUpdateGPSPayload {
    assets: Array<{
        asset_code: string;
        latitude: number;
        longitude: number;
        accuracy?: number;
        altitude?: number;
    }>;
    source?: string;
    updated_by?: string;
}

// =====================================================
// CONFIGURAÇÃO DA API
// =====================================================

const API_BASE_URL = 'https://apinode.smartxhub.cloud/api/dashboard';
const COMPANY_ID = 10; // Default company ID

// Create axios instance
const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// =====================================================
// HOOK: useAssetMaps
// =====================================================

export const useAssetMaps = (companyId: number = COMPANY_ID) => {
    // Estados
    const [assets, setAssets] = useState<GPSAsset[]>([]);
    const [stats, setStats] = useState<GPSStats | null>(null);
    const [filters, setFilters] = useState<GPSFilters | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    // =====================================================
    // FUNÇÃO: Fetch GPS Map Data
    // =====================================================
    const fetchMapData = useCallback(async (filterParams: GPSMapFilters = {}) => {
        setLoading(true);
        setError(null);

        try {
            const params = {
                ...filterParams
            };

            // URL: http://localhost:4000/api/dashboard/asset/10/gps/map
            const response = await api.get(`/asset/${companyId}/gps/map`, { params });

            if (response.data.success) {
                setAssets(response.data.data);
            } else {
                throw new Error(response.data.error || 'Erro ao buscar dados do mapa');
            }
        } catch (err: any) {
            const errorMessage = err.response?.data?.message || err.message || 'Erro desconhecido';
            setError(errorMessage);
            console.error('Error fetching map data:', err);
        } finally {
            setLoading(false);
        }
    }, [companyId]);

    // =====================================================
    // FUNÇÃO: Fetch GPS Statistics
    // =====================================================
    const fetchStats = useCallback(async () => {
        try {
            // URL: http://localhost:4000/api/dashboard/asset/10/gps/stats
            const response = await api.get(`/asset/${companyId}/gps/stats`);

            if (response.data.success) {
                setStats(response.data.data);
            } else {
                throw new Error(response.data.error || 'Erro ao buscar estatísticas');
            }
        } catch (err: any) {
            console.error('Error fetching stats:', err);
        }
    }, [companyId]);

    // =====================================================
    // FUNÇÃO: Fetch GPS Filters
    // =====================================================
    const fetchFilters = useCallback(async () => {
        try {
            // URL: http://localhost:4000/api/dashboard/asset/10/gps/filters
            const response = await api.get(`/asset/${companyId}/gps/filters`);

            if (response.data.success) {
                setFilters(response.data.data);
            } else {
                throw new Error(response.data.error || 'Erro ao buscar filtros');
            }
        } catch (err: any) {
            console.error('Error fetching filters:', err);
        }
    }, [companyId]);

    // =====================================================
    // FUNÇÃO: Update Single Asset GPS
    // =====================================================
    const updateAssetGPS = useCallback(async (payload: UpdateGPSPayload) => {
        try {
            // URL: http://localhost:4000/api/dashboard/asset/10/gps/update
            const response = await api.post(`/asset/${companyId}/gps/update`, payload);

            if (response.data.success) {
                // Refresh map data after update
                await fetchMapData();
                return {
                    success: true,
                    message: response.data.message
                };
            } else {
                throw new Error(response.data.error || 'Erro ao atualizar GPS');
            }
        } catch (err: any) {
            const errorMessage = err.response?.data?.message || err.message || 'Erro desconhecido';
            return {
                success: false,
                message: errorMessage
            };
        }
    }, [companyId, fetchMapData]);

    // =====================================================
    // FUNÇÃO: Bulk Update GPS
    // =====================================================
    const bulkUpdateGPS = useCallback(async (payload: BulkUpdateGPSPayload) => {
        try {
            // URL: http://localhost:4000/api/dashboard/asset/10/gps/bulk-update
            const response = await api.post(`/asset/${companyId}/gps/bulk-update`, payload);

            if (response.data.success) {
                // Refresh map data after update
                await fetchMapData();
                return {
                    success: true,
                    summary: response.data.summary,
                    details: response.data.details
                };
            } else {
                throw new Error(response.data.error || 'Erro ao atualizar GPS em lote');
            }
        } catch (err: any) {
            const errorMessage = err.response?.data?.message || err.message || 'Erro desconhecido';
            return {
                success: false,
                message: errorMessage
            };
        }
    }, [companyId, fetchMapData]);

    // =====================================================
    // FUNÇÃO: Fetch GPS History
    // =====================================================
    const fetchHistory = useCallback(async (assetCode: string, limit: number = 100): Promise<GPSHistory[]> => {
        try {
            // URL: http://localhost:4000/api/dashboard/asset/10/gps/history/EQ-001
            const response = await api.get(`/asset/${companyId}/gps/history/${assetCode}`, {
                params: { limit }
            });

            if (response.data.success) {
                return response.data.data;
            } else {
                throw new Error(response.data.error || 'Erro ao buscar histórico');
            }
        } catch (err: any) {
            console.error('Error fetching history:', err);
            return [];
        }
    }, [companyId]);

    // =====================================================
    // FUNÇÃO: Fetch GPS Alerts
    // =====================================================
    const fetchAlerts = useCallback(async (alertType?: string, alertStatus: string = 'active'): Promise<GPSAlert[]> => {
        try {
            // URL: http://localhost:4000/api/dashboard/asset/10/gps/alerts
            const response = await api.get(`/asset/${companyId}/gps/alerts`, {
                params: { 
                    alert_type: alertType,
                    alert_status: alertStatus
                }
            });

            if (response.data.success) {
                return response.data.data;
            } else {
                throw new Error(response.data.error || 'Erro ao buscar alertas');
            }
        } catch (err: any) {
            console.error('Error fetching alerts:', err);
            return [];
        }
    }, [companyId]);

    // =====================================================
    // FUNÇÃO: Refresh All Data
    // =====================================================
    const refreshAll = useCallback(async (filterParams: GPSMapFilters = {}) => {
        setLoading(true);
        try {
            await Promise.all([
                fetchMapData(filterParams),
                fetchStats(),
                fetchFilters()
            ]);
        } finally {
            setLoading(false);
        }
    }, [fetchMapData, fetchStats, fetchFilters]);

    // =====================================================
    // EFEITO: Carregar dados iniciais
    // =====================================================
    useEffect(() => {
        refreshAll();
    }, [refreshAll]);

    // =====================================================
    // RETORNO DO HOOK
    // =====================================================
    return {
        // Estados
        assets,
        stats,
        filters,
        loading,
        error,

        // Funções
        fetchMapData,
        fetchStats,
        fetchFilters,
        updateAssetGPS,
        bulkUpdateGPS,
        fetchHistory,
        fetchAlerts,
        refreshAll,

        // Utilitários
        clearError: () => setError(null),
        setAssets,
    };
};

// =====================================================
// EXPORT DEFAULT
// =====================================================
export default useAssetMaps;