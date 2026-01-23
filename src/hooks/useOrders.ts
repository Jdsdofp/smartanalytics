// src/hooks/useOrders.ts
import { useState, useEffect, useCallback } from "react";
import { useCompany } from "./useCompany";

// =====================================
// 📝 INTERFACES
// =====================================

export interface OrdersKPISummary {
  total_orders: number;
  total_items: number;
  orders_complete: number;
  orders_in_progress: number;
  orders_info_received: number;
  avg_completion_rate: number;
  avg_items_per_order: number;
  orders_pending: number;
  orders_by_status: {
    status: string;
    count: number;
    percentage: number;
  }[];
  top_job_types: {
    job_type: string;
    order_count: number;
    completion_rate: number;
  }[];
}

export interface JobTypePerformance {
  job_type_code: string;
  job_type_name: string;
  job_type_model: string;
  total_orders: number;
  total_items: number;
  orders_info_received: number;
  orders_in_progress: number;
  orders_complete: number;
  orders_out_for_delivery: number;
  orders_delivered: number;
  total_items_reserved: number;
  total_items_transferred: number;
  total_items_complete: number;
  total_items_delivered: number;
  avg_completion_pct: number;
  avg_items_per_order: number;
  first_order_date: string;
  last_order_date: string;
  active_days: number;
}

export interface TimelineData {
  date_bucket: string;
  orders_created: number;
  orders_completed: number;
  items_processed: number;
  avg_completion_pct: number;
}

export interface ItemStatusDistribution {
  status: string;
  count: number;
  percentage: number;
  color: string;
}

export interface OrdersSummary {
  id: number;
  identifier1: string;
  code_user_job: string;
  subject: string;
  status_job: string;
  flow_type: string;
  due_date: string;
  to_custody_name: string;
  to_custody_code: string;
  to_zone_name: string;
  job_type_name: string;
  job_class_code: string;
  job_class_name: string;
  total_items: number;
  items_concluidos: number;
  items_pendentes: number;
  percentual_concluido: number;
}

// =====================================
// 📝 ADICIONAR INTERFACE
// =====================================

export interface OrderItem {
  company_id: number;
  code: string;
  item_name: string;
  obj_id: number;
  flow_manager_code: string;
  flow_id: number;
  flow_identifier1: string;
  flow_identifier2: string;
  flow_to_zone: string;
  flow_create_date: string;
  flow_modified_date: string;
  flow_modified_by: string;
  tranfer_date: string | null;
  transfer_by: string;
  tranfer_status: string;
  transfer_status_description: string | null;
  transfer_audited_date: string | null;
  transfer_audited_by: string | null;
  lot: string;
  expiration_date: string | null;
  brand: string;
  model: string;
  serial: string;
  item_aux_code: string;
  category: string;
  item_status_name: string;
  condition: string;
  asset_group_code: string | null;
  asset_group_name: string | null;
  department_code: string | null;
  department_name: string | null;
  cost_center_code: string | null;
  cost_center_name: string | null;
  custody_code: string;
  custody_aux_code: string;
  custody_assigned: string;
}

export interface ItemWithContext {
  item_code: string;
  item_name: string;
  obj_id: number;
  flow_manager_code: string;
  flow_id: number;
  flow_identifier1: string;
  flow_identifier2: string;
  flow_to_zone: string;
  flow_create_date: string;
  flow_modified_date: string;
  flow_modified_by: string;
  tranfer_date: string | null;
  transfer_by: string;
  item_status: string;
  tranfer_status_description: string;
  tranfer_audited_date: string | null;
  tranfer_audited_by: string;
  lot: string;
  expiration_date: string | null;
  brand: string;
  item_model: string;
  serial: string;
  item_aux_code: string;
  category: string;
  item_status_name: string;
  condition: string;
  asset_group_code: string;
  asset_group_name: string;
  department_code: string;
  department_name: string;
  cost_center_code: string;
  cost_center_name: string;
  custody_code: string;
  custody_aux_code: string;
  custody_assigned: string;
  job_type_code: string;
  job_type_name: string;
  job_type_model: string;
  order_status: string;
  order_assigned_date: string | null;
  order_code: string;
}

export interface DashboardData {
  kpiSummary: OrdersKPISummary;
  jobTypePerformance: JobTypePerformance[];
  timeline: TimelineData[];
  statusDistribution: ItemStatusDistribution[];
  recentOrders: OrdersSummary[];
  timestamp: string;
}

export interface OrderFilters {
  status?: string[];
  jobTypes?: string[];
  searchTerm?: string;
  startDate?: string;
  endDate?: string;
}

export interface ItemFilters {
  status?: string[];
  jobTypes?: string[];
  categories?: string[];
  searchTerm?: string;
  startDate?: string;
  endDate?: string;
}

export interface PaginationInfo {
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
}

// =====================================
// 🎯 API BASE URL
// =====================================
//https://apinode.smartxhub.cloud
const API_BASE_URL = "https://apinode.smartxhub.cloud/api/dashboard/orders";

// =====================================
// 🔧 HELPER FUNCTIONS
// =====================================

const buildQueryString = (params: Record<string, any>): string => {
  const searchParams = new URLSearchParams();

  Object.keys(params).forEach((key) => {
    const value = params[key];
    if (value !== null && value !== undefined && value !== "") {
      if (Array.isArray(value) && value.length > 0) {
        searchParams.set(key, value.join(","));
      } else if (!Array.isArray(value)) {
        searchParams.set(key, String(value));
      }
    }
  });

  return searchParams.toString();
};

const fetchAPI = async <T>(
  endpoint: string,
  params?: Record<string, any>,
): Promise<T> => {
  const queryString = params ? buildQueryString(params) : "";
  const url = `${API_BASE_URL}${endpoint}${queryString ? `?${queryString}` : ""}`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`API Error: ${response.status} ${response.statusText}`);
  }

  const result = await response.json();

  if (!result.success) {
    throw new Error(result.error || "API request failed");
  }

  return result.data;
};

// =====================================
// 🎣 MAIN HOOK
// =====================================

export const useOrders = () => {
  const { companyId } = useCompany();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Dashboard data
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(
    null,
  );
  const [kpiSummary, setKpiSummary] = useState<OrdersKPISummary | null>(null);
  const [jobTypePerformance, setJobTypePerformance] = useState<
    JobTypePerformance[]
  >([]);
  const [timeline, setTimeline] = useState<TimelineData[]>([]);
  const [itemStatusDistribution, setItemStatusDistribution] = useState<
    ItemStatusDistribution[]
  >([]);

  // Orders & Items
  const [orders, setOrders] = useState<OrdersSummary[]>([]);
  const [items, setItems] = useState<ItemWithContext[]>([]);
  const [itemsPagination, setItemsPagination] = useState<PaginationInfo | null>(
    null,
  );

  // ... estados existentes ...
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);

  // =====================================
  // 📊 DASHBOARD DATA
  // =====================================

  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await fetchAPI<DashboardData>(
        `/${companyId}/dashboard-data`,
      );
      setDashboardData(data);
      setKpiSummary(data.kpiSummary);
      setJobTypePerformance(data.jobTypePerformance);
      setTimeline(data.timeline);
      setItemStatusDistribution(data.statusDistribution);
      //   setOrders(data.recentOrders);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch dashboard data";
      setError(errorMessage);
      console.error("Error fetching dashboard data:", err);
    } finally {
      setLoading(false);
    }
  }, [companyId]);

  // =====================================
  // 📈 KPI SUMMARY
  // =====================================

  const fetchKPISummary = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await fetchAPI<OrdersKPISummary>(
        `/${companyId}/kpi-summary`,
      );
      setKpiSummary(data);
      return data;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch KPI summary";
      setError(errorMessage);
      console.error("Error fetching KPI summary:", err);
      return null;
    } finally {
      setLoading(false);
    }
  }, [companyId]);

  // =====================================
  // 💼 JOB TYPE PERFORMANCE
  // =====================================

  const fetchJobTypePerformance = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await fetchAPI<JobTypePerformance[]>(
        `/${companyId}/job-type-performance`,
      );
      setJobTypePerformance(data);
      return data;
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Failed to fetch job type performance";
      setError(errorMessage);
      console.error("Error fetching job type performance:", err);
      return [];
    } finally {
      setLoading(false);
    }
  }, [companyId]);

  // =====================================
  // 📅 TIMELINE
  // =====================================

  const fetchTimeline = useCallback(
    async (days: number = 30) => {
      setLoading(true);
      setError(null);

      try {
        const data = await fetchAPI<TimelineData[]>(`/${companyId}/timeline`, {
          days,
        });
        setTimeline(data);
        return data;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to fetch timeline";
        setError(errorMessage);
        console.error("Error fetching timeline:", err);
        return [];
      } finally {
        setLoading(false);
      }
    },
    [companyId],
  );

  // =====================================
  // 🎨 ITEM STATUS DISTRIBUTION
  // =====================================

  const fetchItemStatusDistribution = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await fetchAPI<ItemStatusDistribution[]>(
        `/${companyId}/item-status-distribution`,
      );
      setItemStatusDistribution(data);
      return data;
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Failed to fetch item status distribution";
      setError(errorMessage);
      console.error("Error fetching item status distribution:", err);
      return [];
    } finally {
      setLoading(false);
    }
  }, [companyId]);

  // =====================================
  // 📦 ORDERS SUMMARY
  // =====================================

  const fetchOrders = useCallback(
    async (filters?: OrderFilters, limit: number = 100) => {
      setLoading(true);
      setError(null);

      try {
        const params: Record<string, any> = { limit };

        if (filters?.status) params.status = filters.status;
        if (filters?.jobTypes) params.jobTypes = filters.jobTypes;
        if (filters?.searchTerm) params.searchTerm = filters.searchTerm;
        if (filters?.startDate)
          params.startDate = filters.startDate + " 00:00:00";
        if (filters?.endDate) params.endDate = filters.endDate + " 23:59:59";

        const data = await fetchAPI<OrdersSummary[]>(
          `/${companyId}/orders-summary`,
          params,
        );
        setOrders(data);
        return data;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to fetch orders";
        setError(errorMessage);
        console.error("Error fetching orders:", err);
        return [];
      } finally {
        setLoading(false);
      }
    },
    [companyId],
  );

  // =====================================
  // 📦 GET ORDER ITEMS
  // =====================================

  const fetchOrderItems = useCallback(
    async (flowId: number) => {
      setLoading(true);
      setError(null);

      try {
        const data = await fetchAPI<OrderItem[]>(
          `/${companyId}/order/${flowId}/items`,
        );
        setOrderItems(data);
        return data;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to fetch order items";
        setError(errorMessage);
        console.error("Error fetching order items:", err);
        return [];
      } finally {
        setLoading(false);
      }
    },
    [companyId],
  );

  // =====================================
  // 📋 ITEMS WITH CONTEXT
  // =====================================

  const fetchItems = useCallback(
    async (page: number = 1, filters?: ItemFilters, limit: number = 50) => {
      setLoading(true);
      setError(null);

      try {
        const params: Record<string, any> = {
          limit,
          offset: (page - 1) * limit,
        };

        if (filters?.status) params.status = filters.status;
        if (filters?.jobTypes) params.jobTypes = filters.jobTypes;
        if (filters?.categories) params.categories = filters.categories;
        if (filters?.searchTerm) params.searchTerm = filters.searchTerm;
        if (filters?.startDate) params.startDate = filters.startDate;
        if (filters?.endDate) params.endDate = filters.endDate;

        const response = await fetch(
          `${API_BASE_URL}/${companyId}/items?${buildQueryString(params)}`,
        );

        if (!response.ok) {
          throw new Error(`API Error: ${response.status}`);
        }

        const result = await response.json();

        if (!result.success) {
          throw new Error(result.error || "Failed to fetch items");
        }

        setItems(result.data);
        setItemsPagination(result.pagination);

        return {
          data: result.data,
          pagination: result.pagination,
        };
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to fetch items";
        setError(errorMessage);
        console.error("Error fetching items:", err);
        return {
          data: [],
          pagination: null,
        };
      } finally {
        setLoading(false);
      }
    },
    [companyId],
  );

  // =====================================
  // 🔄 AUTO-REFRESH
  // =====================================

  useEffect(() => {
    fetchDashboardData();

    // Auto-refresh a cada 5 minutos
    const interval = setInterval(
      () => {
        fetchDashboardData();
      },
      5 * 60 * 1000,
    );

    return () => clearInterval(interval);
  }, [fetchDashboardData]);

  // =====================================
  // 🎯 RETURN
  // =====================================

  return {
    // State
    loading,
    error,

    // Dashboard data
    dashboardData,
    kpiSummary,
    jobTypePerformance,
    timeline,
    itemStatusDistribution,
    orders,
    items,
    itemsPagination,
    orderItems,

    // Fetch functions
    fetchDashboardData,
    fetchKPISummary,
    fetchJobTypePerformance,
    fetchTimeline,
    fetchItemStatusDistribution,
    fetchOrders,
    fetchOrderItems,
    fetchItems,
  };
};

// =====================================
// 🎨 UTILITY HOOKS
// =====================================

/**
 * Hook simplificado para buscar apenas KPIs
 */
export const useOrdersKPI = (companyId: number) => {
  const [kpiSummary, setKpiSummary] = useState<OrdersKPISummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchKPISummary = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await fetchAPI<OrdersKPISummary>(
        `/${companyId}/kpi-summary`,
      );
      setKpiSummary(data);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch KPI summary";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [companyId]);

  useEffect(() => {
    fetchKPISummary();
  }, [fetchKPISummary]);

  return { kpiSummary, loading, error, refetch: fetchKPISummary };
};

/**
 * Hook para buscar orders com filtros
 */
export const useOrdersList = (companyId: number, filters?: OrderFilters) => {
  const [orders, setOrders] = useState<OrdersSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const params: Record<string, any> = { limit: 100 };

      if (filters?.status) params.status = filters.status;
      if (filters?.jobTypes) params.jobTypes = filters.jobTypes;
      if (filters?.searchTerm) params.searchTerm = filters.searchTerm;
      if (filters?.startDate) params.startDate = filters.startDate;
      if (filters?.endDate) params.endDate = filters.endDate;

      const data = await fetchAPI<OrdersSummary[]>(
        `/${companyId}/orders-summary`,
        params,
      );
      setOrders(data);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch orders";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [companyId, filters]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  return { orders, loading, error, refetch: fetchOrders };
};

/**
 * Hook para buscar items de uma order específica
 */
export const useOrderItems = (companyId: number, flowId: number) => {
  const [items, setItems] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchItems = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await fetchAPI<OrderItem[]>(
        `/${companyId}/order/${flowId}/items`,
      );
      setItems(data);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch order items";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [companyId, flowId]);

  useEffect(() => {
    if (flowId) {
      fetchItems();
    }
  }, [fetchItems, flowId]);

  return { items, loading, error, refetch: fetchItems };
};

/**
 * Hook para buscar items com paginação
 */
export const useItemsList = (
  companyId: number,
  page: number = 1,
  filters?: ItemFilters,
) => {
  const [items, setItems] = useState<ItemWithContext[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchItems = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const params: Record<string, any> = {
        limit: 50,
        offset: (page - 1) * 50,
      };

      if (filters?.status) params.status = filters.status;
      if (filters?.jobTypes) params.jobTypes = filters.jobTypes;
      if (filters?.categories) params.categories = filters.categories;
      if (filters?.searchTerm) params.searchTerm = filters.searchTerm;
      if (filters?.startDate) params.startDate = filters.startDate;
      if (filters?.endDate) params.endDate = filters.endDate;

      const response = await fetch(
        `${API_BASE_URL}/${companyId}/items?${buildQueryString(params)}`,
      );

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || "Failed to fetch items");
      }

      setItems(result.data);
      setPagination(result.pagination);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch items";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [companyId, page, filters]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  return { items, pagination, loading, error, refetch: fetchItems };
};
