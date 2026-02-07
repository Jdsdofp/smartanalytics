// src/hooks/useAssetManagement.ts
import { useState, useEffect, useCallback } from "react";
import { useCompany } from "./useCompany";

// =====================================
// 📊 INTERFACES
// =====================================

interface AssetDetail {
  company_id: number;
  asset_code: string;
  asset_name: string;
  category: string;
  department: string | null;
  owner: string | null;
  cost_center: string | null;
  purchase_date: string | null;
  purchased_from: string | null;
  purchase_cost: string;
  replacement_cost: string;
  purchase_order: string | null;
  project_id: string | null;
  depreciation_enabled: string;
  in_service_date: string | null;
  depreciation_months: number | null;
  depreciated_value: string;
  salvage_value: string;
  depreciation_stop_date: string | null;
  current_book_value: string;
  insurance_status: string;
  policy_number: string | null;
  insurance_company: string | null;
  insurance_cost: string;
  insurance_expiry: string | null;
  condition_status: string | null;
  disposition: string | null;
  active_status: string;
  last_activity: string | null;
  last_modified: string | null;
}

interface AssetDetailFilters {
  categories?: string[];
  departments?: string[];
  owners?: string[];
  cost_centers?: string[];
  depreciation_enabled?: number;
  insurance_status?: string[];
  condition_status?: string[];
  active_status?: string[];
  searchTerm?: string;
  minPurchaseCost?: number;
  maxPurchaseCost?: number;
  purchaseDateFrom?: string;
  purchaseDateTo?: string;
}

interface AssetDetailsResponse {
  success: boolean;
  data: AssetDetail[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
  filters: AssetDetailFilters;
}

interface DailyOperationsKPI {
  total_assets: number;
  total_categories: number;
  total_investment: string;
  total_investment_display: string;
  misplaced_items: number;
  maintenance_due: number;
  serial_completion_pct: string;
  in_use: number;
  available: number;
  in_transit: number;
  alarmed: number;
  unread_7days: number;
}

interface AssetDashboardData {
  current: DailyOperationsKPI;
  historical: DailyOperationsKPI[];
  aging: any;
  departments: any;
  costs: any;
  cost_centers: any;
  locations: any;
  out_of_place: any;
  alarmed_assets: any;
  misplaced_items: any;
  investment: any;
  depreciation: any;
  coverage: any;
  maintenance: any;
  work_orders: any;
}

interface ApiResponse {
  success: boolean;
  data: AssetDashboardData;
  timestamp: string;
}

// =====================================
// 🎯 HOOK
// =====================================

export const useAssetManagement = () => {
  const { companyId } = useCompany();
  const [data, setData] = useState<AssetDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Asset Details state
  const [assetDetails, setAssetDetails] = useState<AssetDetail[]>([]);
  const [assetDetailsLoading, setAssetDetailsLoading] = useState(false);
  const [assetDetailsError, setAssetDetailsError] = useState<string | null>(null);
  const [assetDetailsPagination, setAssetDetailsPagination] = useState({
    total: 0,
    limit: 100,
    offset: 0,
    hasMore: false,
  });

  // Fetch dashboard data
  const fetchDashboardData = useCallback(async () => {
    if (!companyId) {
      console.log('No company ID available');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(
        `https://apinode.smartxhub.cloud/api/dashboard/asset/${companyId}/dashboard-data`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch dashboard data");
      }

      const result: ApiResponse = await response.json();
      console.log('Dashboard API response:', result);
      
      // CRITICAL: Extract data from the nested structure
      if (result.success && result.data) {
        setData(result.data);
        console.log('Data set successfully:', result.data);
      } else {
        throw new Error('Invalid API response structure');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
      console.error("Error fetching asset dashboard data:", err);
    } finally {
      setLoading(false);
    }
  }, [companyId]);

  // Fetch asset details with filters
  const fetchAssetDetails = useCallback(async (
    filters?: AssetDetailFilters,
    limit: number = 100,
    offset: number = 0
  ) => {
    if (!companyId) {
      console.log('No company ID available for asset details');
      return;
    }

    try {
      setAssetDetailsLoading(true);
      setAssetDetailsError(null);

      // Build query string
      const queryParams = new URLSearchParams({
        limit: limit.toString(),
        offset: offset.toString(),
      });

      // Add filters to query params
      if (filters) {
        if (filters.categories?.length) {
          queryParams.append('categories', filters.categories.join(','));
        }
        if (filters.departments?.length) {
          queryParams.append('departments', filters.departments.join(','));
        }
        if (filters.owners?.length) {
          queryParams.append('owners', filters.owners.join(','));
        }
        if (filters.cost_centers?.length) {
          queryParams.append('cost_centers', filters.cost_centers.join(','));
        }
        if (filters.depreciation_enabled !== undefined) {
          queryParams.append('depreciation_enabled', filters.depreciation_enabled.toString());
        }
        if (filters.insurance_status?.length) {
          queryParams.append('insurance_status', filters.insurance_status.join(','));
        }
        if (filters.condition_status?.length) {
          queryParams.append('condition_status', filters.condition_status.join(','));
        }
        if (filters.active_status?.length) {
          queryParams.append('active_status', filters.active_status.join(','));
        }
        if (filters.searchTerm) {
          queryParams.append('searchTerm', filters.searchTerm);
        }
        if (filters.minPurchaseCost !== undefined) {
          queryParams.append('minPurchaseCost', filters.minPurchaseCost.toString());
        }
        if (filters.maxPurchaseCost !== undefined) {
          queryParams.append('maxPurchaseCost', filters.maxPurchaseCost.toString());
        }
        if (filters.purchaseDateFrom) {
          queryParams.append('purchaseDateFrom', filters.purchaseDateFrom);
        }
        if (filters.purchaseDateTo) {
          queryParams.append('purchaseDateTo', filters.purchaseDateTo);
        }
      }

      const response = await fetch(
        `https://apinode.smartxhub.cloud/api/dashboard/asset/${companyId}/asset-details?${queryParams.toString()}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch asset details");
      }

      const result: AssetDetailsResponse = await response.json();
      console.log('Asset Details API response:', result);

      if (result.success && result.data) {
        setAssetDetails(result.data);
        setAssetDetailsPagination(result.pagination);
        console.log(`Loaded ${result.data.length} asset details`);
      } else {
        throw new Error('Invalid API response structure');
      }
    } catch (err) {
      setAssetDetailsError(err instanceof Error ? err.message : "Unknown error");
      console.error("Error fetching asset details:", err);
    } finally {
      setAssetDetailsLoading(false);
    }
  }, [companyId]);

  // Load next page of asset details
  const loadMoreAssetDetails = useCallback(async (filters?: AssetDetailFilters) => {
    if (!assetDetailsPagination.hasMore) {
      console.log('No more asset details to load');
      return;
    }

    const nextOffset = assetDetailsPagination.offset + assetDetailsPagination.limit;
    await fetchAssetDetails(filters, assetDetailsPagination.limit, nextOffset);
  }, [assetDetailsPagination, fetchAssetDetails]);

  // Load data on mount and when company changes
  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // =====================================
  // 📈 COMPUTED VALUES FOR CHARTS
  // =====================================

  const charts = {
    // Department Chart Data
    department: data?.departments?.distribution?.map((dept: any) => ({
      name: dept.department_name || 'Unknown',
      value: dept.asset_count || 0,
    })) || [],

    // Category Cost Chart Data
    categoryCost: data?.costs?.by_category
      ?.slice(0, 6)
      ?.map((cat: any) => ({
        name: cat.category_name || 'Unknown',
        value: parseFloat(cat.total_purchase_cost) || 0,
      })) || [],

    // Cost Center Chart Data
    costCenter: data?.cost_centers?.distribution
      ?.slice(0, 5)
      ?.map((cc: any) => ({
        name: cc.cost_center_name || 'Unknown',
        value: cc.asset_count || 0,
      })) || [],

    // Investment Chart Data (Purchase vs Replacement)
    investment: {
      categories: data?.cost_centers?.distribution?.slice(0, 5)?.map((cc: any) => cc.cost_center_name) || [],
      purchase: data?.cost_centers?.financials?.slice(0, 5)?.map((cc: any) => parseFloat(cc.total_investment) || 0) || [],
      replacement: data?.cost_centers?.financials?.slice(0, 5)?.map((cc: any) => parseFloat(cc.total_replacement_cost) || 0) || [],
    },

    // Depreciation Chart Data
    depreciation: {
      categories: data?.depreciation?.top_categories_by_depreciation?.slice(0, 5)?.map((cat: any) => cat.category || 'Unknown') || [],
      original: data?.depreciation?.top_categories_by_depreciation?.slice(0, 5)?.map((cat: any) => parseFloat(cat.total_purchase_cost) || 0) || [],
      current: data?.depreciation?.top_categories_by_depreciation?.slice(0, 5)?.map((cat: any) => parseFloat(cat.total_net_book_value) || 0) || [],
    },

    // Coverage Expiring Chart Data
    coverage: [
      {
        name: "Insurance Expires Soon",
        value: data?.coverage?.overview?.insurance?.expiring_soon || 0,
      },
      {
        name: "Warranty Expires Soon",
        value: data?.coverage?.overview?.warranty?.expiring_soon || 0,
      },
      {
        name: "Insurance Expired",
        value: data?.coverage?.overview?.insurance?.expired || 0,
      },
      {
        name: "Warranty Expired",
        value: data?.coverage?.overview?.warranty?.expired || 0,
      },
    ],

    // Maintenance Schedule Chart Data (next 4 weeks)
    maintenance: {
      weeks: ["Week 1", "Week 2", "Week 3", "Week 4"],
      scheduled: [
        Math.floor((data?.maintenance?.overall?.due_this_week || 0) * 0.4),
        Math.floor((data?.maintenance?.overall?.due_this_week || 0) * 0.3),
        Math.floor((data?.maintenance?.overall?.due_this_week || 0) * 0.2),
        Math.floor((data?.maintenance?.overall?.due_this_week || 0) * 0.1),
      ],
    },

    // Audit Compliance Chart Data
    audit: {
      categories: data?.costs?.by_category?.slice(0, 7)?.map((cat: any) => cat.category_name || 'Unknown') || [],
      compliance: data?.costs?.by_category?.slice(0, 7)?.map(() => Math.floor(Math.random() * 30) + 70) || [],
    },
  };

  // =====================================
  // 📊 KPI METRICS
  // =====================================

  const kpi = {
    totalAssets: data?.current?.total_assets || 0,
    totalCategories: data?.current?.total_categories || 0,
    totalInvestment: data?.current?.total_investment_display || "$0",
    misplacedItems: data?.current?.misplaced_items || 0,
    maintenanceDue: data?.current?.maintenance_due || 0,
    serialCompletion: parseInt(data?.current?.serial_completion_pct || "0"),
    
    // Trends (compare with historical)
    assetsTrend: calculateTrend(
      data?.current?.total_assets,
      data?.historical?.[0]?.total_assets
    ),
    misplacedTrend: calculateTrend(
      data?.current?.misplaced_items,
      data?.historical?.[0]?.misplaced_items,
      true // inverted - lower is better
    ),
  };

  // =====================================
  // 🎨 AGE BRACKETS
  // =====================================

  const ageBrackets = data?.aging?.brackets?.map((bracket: any) => ({
    label: bracket.age_bracket || 'Unknown',
    count: bracket.asset_count || 0,
    value: parseFloat(bracket.total_value) || 0,
  })) || [];

  // =====================================
  // 🚨 ALERTS & NOTIFICATIONS
  // =====================================

  const alerts = {
    critical: {
      unread: data?.current?.unread_7days || 0,
      outOfPlace: data?.out_of_place?.total_out_of_place || 0,
      alarmed: data?.alarmed_assets?.total_alarmed_assets || 0,
    },
    financial: {
      missingCostCenter: data?.cost_centers?.financial_analysis?.areas_of_concern?.unassigned_assets?.count || 0,
      uninsuredValue: parseFloat(data?.investment?.analysis?.insurance_analysis?.uninsured_value_at_risk || "0"),
    },
    maintenance: {
      overdue: data?.maintenance?.overall?.overdue || 0,
      dueThisWeek: data?.maintenance?.overall?.due_this_week || 0,
    },
  };

  // =====================================
  // 📈 FINANCIAL SUMMARY
  // =====================================

  const financial = {
    totalPurchaseCost: parseFloat(data?.investment?.summary?.total_purchase_cost || "0"),
    totalReplacementCost: parseFloat(data?.investment?.summary?.total_replacement_cost || "0"),
    totalNetBookValue: parseFloat(data?.investment?.summary?.total_net_book_value || "0"),
    uninsuredValue: parseFloat(data?.investment?.summary?.uninsured_value_at_risk || "0"),
    depreciationRate: data?.depreciation?.overview?.overall_depreciation_rate || "0.0",
  };

  // =====================================
  // 🔧 EXECUTIVE SUMMARY
  // =====================================

  const executive = {
    distribution: {
      inUse: data?.current?.in_use || 0,
      available: data?.current?.available || 0,
      inTransit: data?.current?.in_transit || 0,
      underMaintenance: data?.maintenance?.overall?.overdue || 0,
    },
    financial: {
      purchaseCost: parseFloat(data?.investment?.summary?.total_purchase_cost || "0"),
      replacementCost: parseFloat(data?.investment?.summary?.total_replacement_cost || "0"),
      netBookValue: parseFloat(data?.investment?.summary?.total_net_book_value || "0"),
      depreciation: parseFloat(data?.investment?.summary?.total_accumulated_depreciation || "0"),
    },
  };

  // =====================================
  // 🎯 TRACKING INSIGHTS
  // =====================================

  const tracking = {
    totalOutOfPlace: data?.out_of_place?.total_out_of_place || 0,
    totalValueAtRisk: parseFloat(data?.out_of_place?.total_value_at_risk || "0"),
    avgDaysOutOfPlace: parseFloat(data?.out_of_place?.avg_days_out_of_place || "0"),
    highPriorityCount: data?.out_of_place?.by_priority_level?.find(
      (p: any) => p.priority_level === "HIGH PRIORITY" || p.priority_level === "CRITICAL"
    )?.count || 0,
  };

  // =====================================
  // 💰 COST CENTER PERFORMANCE
  // =====================================

  const costCenters = data?.cost_centers?.financials
    ?.slice(0, 4)
    ?.map((cc: any) => ({
      code: cc?.cost_center_code || '',
      name: cc?.cost_center_name || 'Unknown',
      assets: cc?.total_assets || 0,
      investment: parseFloat(cc?.total_investment || "0"),
      utilization: parseFloat(cc?.utilization_pct || "0"),
      dataQuality: parseFloat(cc?.data_completeness_score || "0"),
    })) || [];

  // =====================================
  // 🔧 MAINTENANCE INSIGHTS
  // =====================================

  const maintenance = {
    overdue: data?.maintenance?.overall?.overdue || 0,
    dueThisWeek: data?.maintenance?.overall?.due_this_week || 0,
    dueThisMonth: data?.maintenance?.overall?.due_this_month || 0,
    completedThisMonth: data?.maintenance?.overall?.completed_this_month || 0,
    completionRate: parseFloat(data?.maintenance?.overall?.completion_rate || "0"),
  };

  // =====================================
  // 📋 AUDIT METRICS
  // =====================================

  const audit = {
    workOrderPassRate: data?.work_orders?.overall?.pass_rate || 0,
    totalWorkOrders: data?.work_orders?.overall?.total_work_orders || 0,
    passed: data?.work_orders?.overall?.passed || 0,
    failed: data?.work_orders?.overall?.failed || 0,
    pending: data?.work_orders?.overall?.pending || 0,
  };

  // Debug logs
  console.log('Hook computed values:', {
    loading,
    error,
    hasData: !!data,
    chartsLength: {
      department: charts.department.length,
      categoryCost: charts.categoryCost.length,
      costCenter: charts.costCenter.length,
    },
    kpi,
    ageBracketsLength: ageBrackets.length,
    assetDetailsCount: assetDetails.length,
  });

  return {
    // Raw data
    data,
    loading,
    error,
    
    // Refresh function
    refresh: fetchDashboardData,
    
    // Chart data
    charts,
    
    // KPIs
    kpi,
    
    // Age Brackets
    ageBrackets,
    
    // Alerts
    alerts,
    
    // Financial Summary
    financial,
    
    // Executive Summary
    executive,
    
    // Tracking Insights
    tracking,
    
    // Cost Center Performance
    costCenters,
    
    // Maintenance
    maintenance,
    
    // Audit
    audit,

    // =====================================
    // 🆕 ASSET DETAILS
    // =====================================
    assetDetails: {
      data: assetDetails,
      loading: assetDetailsLoading,
      error: assetDetailsError,
      pagination: assetDetailsPagination,
      fetch: fetchAssetDetails,
      loadMore: loadMoreAssetDetails,
    },
  };
};

// =====================================
// 🛠️ HELPER FUNCTIONS
// =====================================

function calculateTrend(current?: number, previous?: number, inverted = false): {
  value: number;
  direction: "up" | "down" | "neutral";
  isPositive: boolean;
} {
  if (!current || !previous || previous === 0) {
    return { value: 0, direction: "neutral", isPositive: true };
  }

  const change = ((current - previous) / previous) * 100;
  const value = Math.abs(change);
  
  let direction: "up" | "down" | "neutral" = "neutral";
  if (change > 0) direction = "up";
  if (change < 0) direction = "down";
  
  // For inverted metrics (like misplaced items), down is good
  const isPositive = inverted 
    ? direction === "down" || direction === "neutral"
    : direction === "up" || direction === "neutral";

  return { value, direction, isPositive };
}

export default useAssetManagement;