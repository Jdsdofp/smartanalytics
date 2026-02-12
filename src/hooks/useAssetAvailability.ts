// src/hooks/useAssetAvailability.ts
import { useState, useCallback } from 'react';

interface AssetAvailabilityData {
  company_id: number;
  asset_id: number;
  asset_code: string;
  asset_name: string;
  property_tag: string | null;
  brand: string | null;
  model: string | null;
  serial_number: string | null;
  category_code: string;
  category_name: string;
  group_code: string | null;
  group_name: string | null;
  type_code: string | null;
  type_name: string | null;
  condition_code: string;
  condition_name: string;
  disposition_code: string | null;
  disposition_name: string | null;
  status: string;
  custody_owner_code: string | null;
  custody_owner_name: string | null;
  custody_assigned_code: string;
  custody_assigned_name: string;
  department_code: string | null;
  department_name: string | null;
  cost_center_code: string | null;
  cost_center_name: string | null;
  site_home_code: string | null;
  site_home_name: string | null;
  area_home_code: string | null;
  area_home_name: string | null;
  zone_home_code: string | null;
  zone_home_name: string | null;
  site_current_code: string;
  site_current_name: string;
  area_current_code: string;
  area_current_name: string;
  zone_current_code: string;
  zone_current_name: string;
  latitude: number | null;
  longitude: number | null;
  last_seen_datetime: string;
  last_seen_formatted: string;
  last_seen_by: string | null;
  days_since_seen: number;
  time_in_current_zone: number | null;
  next_service_date: string | null;
  next_service_formatted: string | null;
  days_until_service: number | null;
  service_status: string;
  expiration_datetime: string | null;
  expiration_date_formatted: string | null;
  warranty_start: string | null;
  warranty_end: string | null;
  warranty_end_formatted: string | null;
  warranty_days_remaining: number | null;
  warranty_status: string;
  warranty_code: string | null;
  warranty_contact: string | null;
  service_warranty_start: string | null;
  service_warranty_end: string | null;
  service_end_formatted: string | null;
  insurance_start: string | null;
  insurance_end: string | null;
  insured_end_formatted: string | null;
  insurance_days_remaining: number | null;
  insurance_status: string;
  insurance_code: string | null;
  insurance_policy: string | null;
  insurance_company: string | null;
  insurance_cost: string;
  purchase_cost: string;
  purchase_date: string | null;
  purchased_from: string | null;
  is_alarmed: string;
  alarmed_date: string | null;
  is_misplaced: string;
  audit_status: string;
  last_audit_date: string | null;
  audited_by: string | null;
  last_workorder_id: number | null;
  last_workorder_date: string | null;
  last_inspector: string | null;
  created_date: string;
  created_date_formatted: string;
  created_by: string;
  modified_date: string | null;
  modified_date_formatted: string | null;
  modified_by: string | null;
  notes: string | null;
  criticality: number | null;
  classification: string | null;
}

interface AssetAvailabilityFilters {
  sites?: string[];
  areas?: string[];
  zones?: string[];
  types?: string[];
  categories?: string[];
  custody?: string[];
  conditions?: string[];
  statuses?: string[];
  departments?: string[];
  cost_centers?: string[];
  searchBy?: string;
  dateFrom?: string;
  dateTo?: string;
  searchTerm?: string;
  service_status?: string[];
  warranty_status?: string[];
  insurance_status?: string[];
  is_alarmed?: number;
  is_misplaced?: number;
}

interface AssetAvailabilityStatistics {
  company_id: number;
  total_assets: number;
  active_assets: number;
  inactive_assets: number;
  alarmed_assets: number;
  misplaced_assets: number;
  overdue_maintenance: number;
  warranty_expired: number;
  insurance_expired: number;
  sites_count: number;
  areas_count: number;
  zones_count: number;
}

interface FilterOption {
  id: number;
  code: string;
  name: string;
}

interface Pagination {
  total: number;
  limit: number;
  offset: number;
  page: number;
  totalPages: number;
}

const useAssetAvailability = () => {
  const [data, setData] = useState<AssetAvailabilityData[]>([]);
  const [statistics, setStatistics] = useState<AssetAvailabilityStatistics | null>(null);
  const [pagination, setPagination] = useState<Pagination>({
    total: 0,
    limit: 10,
    offset: 0,
    page: 1,
    totalPages: 0
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filter options
  const [filterOptions, setFilterOptions] = useState<{
    sites: FilterOption[];
    areas: FilterOption[];
    zones: FilterOption[];
    types: FilterOption[];
    categories: FilterOption[];
    custody: FilterOption[];
  }>({
    sites: [],
    areas: [],
    zones: [],
    types: [],
    categories: [],
    custody: []
  });

  /**
   * Fetch Asset Availability Data
   */
  const fetchAssetAvailability = useCallback(async (
    companyId: number,
    filters?: AssetAvailabilityFilters,
    limit: number = 10,
    offset: number = 0
  ) => {
    try {
      setLoading(true);
      setError(null);

      // Build query parameters
      const queryParams = new URLSearchParams({
        limit: limit.toString(),
        offset: offset.toString()
      });

      // Add filters to query params
      if (filters) {
        if (filters.sites?.length) queryParams.append('sites', filters.sites.join(','));
        if (filters.areas?.length) queryParams.append('areas', filters.areas.join(','));
        if (filters.zones?.length) queryParams.append('zones', filters.zones.join(','));
        if (filters.types?.length) queryParams.append('types', filters.types.join(','));
        if (filters.categories?.length) queryParams.append('categories', filters.categories.join(','));
        if (filters.custody?.length) queryParams.append('custody', filters.custody.join(','));
        if (filters.conditions?.length) queryParams.append('conditions', filters.conditions.join(','));
        if (filters.statuses?.length) queryParams.append('statuses', filters.statuses.join(','));
        if (filters.departments?.length) queryParams.append('departments', filters.departments.join(','));
        if (filters.cost_centers?.length) queryParams.append('cost_centers', filters.cost_centers.join(','));
        if (filters.service_status?.length) queryParams.append('service_status', filters.service_status.join(','));
        if (filters.warranty_status?.length) queryParams.append('warranty_status', filters.warranty_status.join(','));
        if (filters.insurance_status?.length) queryParams.append('insurance_status', filters.insurance_status.join(','));
        
        if (filters.searchBy) queryParams.append('searchBy', filters.searchBy);
        if (filters.dateFrom) queryParams.append('dateFrom', filters.dateFrom);
        if (filters.dateTo) queryParams.append('dateTo', filters.dateTo);
        if (filters.searchTerm) queryParams.append('searchTerm', filters.searchTerm);
        if (filters.is_alarmed !== undefined) queryParams.append('is_alarmed', filters.is_alarmed.toString());
        if (filters.is_misplaced !== undefined) queryParams.append('is_misplaced', filters.is_misplaced.toString());
      }

      const response = await fetch(
        `https://apinode.smartxhub.cloud/api/dashboard/asset/${companyId}/asset-availability?${queryParams.toString()}`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch asset availability data');
      }

      const result = await response.json();

      if (result.success) {
        setData(result.data);
        setPagination(result.pagination);
      } else {
        throw new Error(result.error || 'Unknown error occurred');
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      console.error('Error fetching asset availability:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Fetch Asset Availability Statistics
   */
  const fetchStatistics = useCallback(async (
    companyId: number,
    filters?: AssetAvailabilityFilters
  ) => {
    try {
      setLoading(true);
      setError(null);

      // Build query parameters
      const queryParams = new URLSearchParams();

      if (filters) {
        if (filters.sites?.length) queryParams.append('sites', filters.sites.join(','));
        if (filters.areas?.length) queryParams.append('areas', filters.areas.join(','));
        if (filters.zones?.length) queryParams.append('zones', filters.zones.join(','));
        if (filters.categories?.length) queryParams.append('categories', filters.categories.join(','));
        if (filters.custody?.length) queryParams.append('custody', filters.custody.join(','));
        if (filters.searchTerm) queryParams.append('searchTerm', filters.searchTerm);
      }

      const response = await fetch(
        `https://apinode.smartxhub.cloud/api/dashboard/asset/${companyId}/asset-availability-statistics?${queryParams.toString()}`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch statistics');
      }

      const result = await response.json();

      if (result.success) {
        setStatistics(result.data);
      } else {
        throw new Error(result.error || 'Unknown error occurred');
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      console.error('Error fetching statistics:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Fetch Filter Options
   */
  const fetchFilterOptions = useCallback(async (
    companyId: number,
    filterType: 'sites' | 'areas' | 'zones' | 'types' | 'categories' | 'custody'
  ) => {
    try {
      const response = await fetch(
        `https://apinode.smartxhub.cloud/api/dashboard/asset/${companyId}/availability-filter-options/${filterType}`
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch ${filterType} options`);
      }

      const result = await response.json();

      if (result.success) {
        setFilterOptions(prev => ({
          ...prev,
          [filterType]: result.data
        }));
      }

    } catch (err) {
      console.error(`Error fetching ${filterType} options:`, err);
    }
  }, []);

  /**
   * Fetch All Filter Options
   */
  const fetchAllFilterOptions = useCallback(async (companyId: number) => {
    const filterTypes: Array<'sites' | 'areas' | 'zones' | 'types' | 'categories' | 'custody'> = [
      'sites', 'areas', 'zones', 'types', 'categories', 'custody'
    ];

    await Promise.all(
      filterTypes.map(type => fetchFilterOptions(companyId, type))
    );
  }, [fetchFilterOptions]);

  return {
    data,
    statistics,
    pagination,
    loading,
    error,
    filterOptions,
    fetchAssetAvailability,
    fetchStatistics,
    fetchFilterOptions,
    fetchAllFilterOptions
  };
};

export default useAssetAvailability;