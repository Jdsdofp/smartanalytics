import { useState, useEffect, useCallback } from 'react';
import axios, { AxiosError } from 'axios';
import { useCompany } from './useCompany';

/**
 * Interface para dados de ativo processados
 */
interface ProcessedAssetData {
    codigo: string;
    nome: string;
    serie: string;
    categoria: string;
    condicao: string;
    estado: string;
    ultimoVisto: string;
    custodia: string;
    zonaAtualCodigo: string;
    zonaAtualDescricao: string;
    codigoTag: string;
}

/**
 * Interface para estatísticas de categoria
 */
interface CategoryStats {
    lessThan30: number;
    between30And60: number;
    between60And90: number;
    moreThan90: number;
    total: number;
}

/**
 * Interface para estatísticas de custódia
 */
interface CustodyStats {
    custody: string;
    categories: {
        [category: string]: CategoryStats;
    };
    total: number;
}

/**
 * Interface para estatísticas globais
 */
interface GlobalStats {
    lessThan30: number;
    between30And60: number;
    between60And90: number;
    moreThan90: number;
    total: number;
    totalAssets: number;
}

/**
 * Interface para resposta da API
 */
interface ApiResponse {
    success: boolean;
    data: {
        assets: ProcessedAssetData[];
        custodyStats: CustodyStats[];
        globalStats: GlobalStats;
        updateTime: string;
    };
    message?: string;
}

/**
 * Interface para grupos de custódia (formato frontend)
 */
interface CustodyGroups {
    [custody: string]: {
        [category: string]: number[]; // [<30, 30-60, 60-90, >90]
    };
}

/**
 * Interface para opções do hook
 */
interface UsePackingDistributionOptions {
    companyId: number;
    baseURL?: string;
    autoFetch?: boolean;
    refetchInterval?: number;
}

/**
 * Interface para retorno do hook
 */
interface UsePackingDistributionReturn {
    // Dados processados para o frontend
    custodyGroups: CustodyGroups;
    totalStats: number[];
    updateTime: string;
    assets: ProcessedAssetData[];
    
    // Estados
    loading: boolean;
    error: string | null;
    
    // Funções
    refetch: () => Promise<void>;
    fetchWithFilters: (filters: FilterOptions) => Promise<void>;
    exportData: () => void;
}

/**
 * Interface para filtros
 */
interface FilterOptions {
    custody?: string;
    category?: string;
    estado?: string;
    ageCategory?: 'lessThan30' | 'between30And60' | 'between60And90' | 'moreThan90';
    startDate?: string;
    endDate?: string;
}

/**
 * Hook customizado para gerenciar dados de distribuição de empacotamento
 * 
 * @param options - Opções de configuração do hook
 * @returns Objeto com dados, estados e funções para gerenciar a distribuição
 * 
 * @example
 * ```tsx
 * const {
 *   custodyGroups,
 *   totalStats,
 *   updateTime,
 *   loading,
 *   error,
 *   refetch
 * } = usePackingDistribution({
 *   companyId: 192,
 *   autoFetch: true
 * });
 * ```
 */
export const usePackingDistribution = ({
    baseURL = 'https://apinode.smartxhub.cloud/api',
    autoFetch = true,
    refetchInterval,
}: UsePackingDistributionOptions): UsePackingDistributionReturn => {
    // Estados
    const { companyId } = useCompany()
    const [custodyGroups, setCustodyGroups] = useState<CustodyGroups>({});
    const [totalStats, setTotalStats] = useState<number[]>([0, 0, 0, 0]);
    const [updateTime, setUpdateTime] = useState<string>('');
    const [assets, setAssets] = useState<ProcessedAssetData[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    /**
     * Converte estatísticas da API para o formato do frontend
     */
    const convertToCustodyGroups = useCallback((custodyStats: CustodyStats[]): CustodyGroups => {
        const groups: CustodyGroups = {};

        custodyStats.forEach((custodyStat) => {
            const custodyName = custodyStat.custody;
            groups[custodyName] = {};

            Object.entries(custodyStat.categories).forEach(([categoryName, stats]) => {
                groups[custodyName][categoryName] = [
                    stats.lessThan30,
                    stats.between30And60,
                    stats.between60And90,
                    stats.moreThan90,
                ];
            });
        });

        return groups;
    }, []);

    /**
     * Converte estatísticas globais para array
     */
    const convertToTotalStats = useCallback((globalStats: GlobalStats): number[] => {
        return [
            globalStats.lessThan30,
            globalStats.between30And60,
            globalStats.between60And90,
            globalStats.moreThan90,
        ];
    }, []);

    /**
     * Formata o tempo de atualização
     */
    const formatUpdateTime = useCallback((isoTime: string): string => {
        const date = new Date(isoTime);
        return date.toLocaleString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
        });
    }, []);

    /**
     * Busca dados da API
     */
    const fetchData = useCallback(async (filters?: FilterOptions) => {
        try {
            setLoading(true);
            setError(null);

            // Determina a URL baseado se há filtros
            let url = `${baseURL}/dashboard/packaging/${companyId}/distribution`;
            
            if (filters && Object.keys(filters).length > 0) {
                url += '/filtered';
                const params = new URLSearchParams();
                
                Object.entries(filters).forEach(([key, value]) => {
                    if (value !== undefined && value !== null) {
                        params.append(key, String(value));
                    }
                });
                
                if (params.toString()) {
                    url += `?${params.toString()}`;
                }
            }

            const response = await axios.get<ApiResponse>(url);

            if (response.data.success) {
                const { custodyStats, globalStats, updateTime: apiUpdateTime, assets: apiAssets } = response.data.data;

                // Converte dados para formato do frontend
                const groups = convertToCustodyGroups(custodyStats);
                const stats = convertToTotalStats(globalStats);
                const formattedTime = formatUpdateTime(apiUpdateTime);

                // Atualiza estados
                setCustodyGroups(groups);
                setTotalStats(stats);
                setUpdateTime(formattedTime);
                setAssets(apiAssets);
            } else {
                setError(response.data.message || 'Erro ao carregar dados');
            }
        } catch (err) {
            const axiosError = err as AxiosError;
            console.error('Erro ao buscar dados de distribuição:', axiosError);
            
            if (axiosError.response) {
                setError(`Erro do servidor: ${axiosError.response.status}`);
            } else if (axiosError.request) {
                setError('Erro de conexão: não foi possível conectar ao servidor');
            } else {
                setError('Erro ao processar requisição');
            }
        } finally {
            setLoading(false);
        }
    }, [companyId, baseURL, convertToCustodyGroups, convertToTotalStats, formatUpdateTime]);

    /**
     * Função para recarregar dados
     */
    const refetch = useCallback(async () => {
        await fetchData();
    }, [fetchData]);

    /**
     * Função para buscar com filtros
     */
    const fetchWithFilters = useCallback(async (filters: FilterOptions) => {
        await fetchData(filters);
    }, [fetchData]);

    /**
     * Exporta dados para CSV
     */
    const exportData = useCallback(() => {
        const exportUrl = `${baseURL}/dashboard/packaging/${companyId}/export`;
        window.open(exportUrl, '_blank');
    }, [baseURL, companyId]);

    /**
     * Busca inicial de dados
     */
    useEffect(() => {
        if (autoFetch) {
            fetchData();
        }
    }, [autoFetch, fetchData]);

    /**
     * Configurar refetch automático se especificado
     */
    useEffect(() => {
        if (refetchInterval && refetchInterval > 0) {
            const interval = setInterval(() => {
                fetchData();
            }, refetchInterval);

            return () => clearInterval(interval);
        }
    }, [refetchInterval, fetchData]);

    return {
        // Dados
        custodyGroups,
        totalStats,
        updateTime,
        assets,
        
        // Estados
        loading,
        error,
        
        // Funções
        refetch,
        fetchWithFilters,
        exportData,
    };
};

export default usePackingDistribution;