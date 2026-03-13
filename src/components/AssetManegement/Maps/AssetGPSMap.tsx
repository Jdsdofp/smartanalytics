// src/components/AssetManagement/AssetGPSMap.tsx
import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
// @ts-ignore
import 'leaflet.markercluster/dist/MarkerCluster.css';
// @ts-ignore
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
// @ts-ignore
import 'leaflet.markercluster';
import { MapPinIcon, ArrowDownTrayIcon, ArrowPathIcon, ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline';
import { useAssetMaps } from '../../../hooks/useAssetMaps';

// Tipos
interface Asset {
  code: string;
  name: string;
  latitude: number;
  longitude: number;
  last_seen: string;
  category: string;
  condition: string;
  custody: string;
  site: string;
  area: string;
  zone: string;
  next_service: string;
  warranty_ends: string;
  active: boolean;
  alarmed: boolean;
  status: 'success' | 'warning' | 'danger' | 'inactive';
}

interface AssetGPSMapProps {
  companyId?: number;
}

const AssetGPSMap = ({ companyId = 10 }: AssetGPSMapProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerClusterRef = useRef<L.MarkerClusterGroup | null>(null);

  // =====================================================
  // HOOK: useAssetMaps
  // =====================================================
  const {
    assets: allAssets,
    stats: apiStats,
    filters: filterOptions,
    loading: apiLoading,
    error: apiError,
    fetchMapData,
    refreshAll,
    clearError
  } = useAssetMaps(companyId);

  // Estados locais
  const [filteredAssets, setFilteredAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(false);
  const [isFiltersCollapsed, setIsFiltersCollapsed] = useState(false);

  // Filtros
  const [filters, setFilters] = useState({
    site: '',
    category: '',
    custody: '',
    searchText: ''
  });

  // Estatísticas locais (para manter compatibilidade com UI)
  const [stats, setStats] = useState({
    total: 0,
    onMap: 0,
    active: 0,
    alarmed: 0
  });

  // =====================================================
  // INICIALIZAR MAPA
  // =====================================================
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    // Criar mapa
    const map = L.map(mapRef.current).setView([28.5383, -81.3792], 13);

    // Adicionar tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19
    }).addTo(map);

    // Criar cluster group
    const markerCluster = L.markerClusterGroup({
      chunkedLoading: true,
      spiderfyOnMaxZoom: true,
      showCoverageOnHover: false,
      zoomToBoundsOnClick: true
    });

    map.addLayer(markerCluster);

    mapInstanceRef.current = map;
    markerClusterRef.current = markerCluster;

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // =====================================================
  // ATUALIZAR FILTROS QUANDO ASSETS MUDAR
  // =====================================================
  useEffect(() => {
    setFilteredAssets(allAssets);
  }, [allAssets]);

  // =====================================================
  // OBTER COR DO MARCADOR
  // =====================================================
  const getMarkerColor = (asset: Asset): string => {
    if (!asset.active) return '#6C757D'; // gray
    if (asset.alarmed) return '#DC3545'; // red
    if (asset.status === 'danger') return '#DC3545';
    if (asset.status === 'warning') return '#FFC107'; // yellow
    return '#28A745'; // green
  };

  // =====================================================
  // CRIAR ÍCONE CUSTOMIZADO
  // =====================================================
  const createCustomIcon = (color: string): L.DivIcon => {
    return L.divIcon({
      className: 'custom-marker',
      html: `<div style="
        background: ${color};
        width: 24px;
        height: 24px;
        border-radius: 50%;
        border: 3px solid white;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      "></div>`,
      iconSize: [24, 24],
      iconAnchor: [12, 12]
    });
  };

  // =====================================================
  // CRIAR POPUP
  // =====================================================
  const createPopupContent = (asset: Asset): string => {
    const statusBadge = asset.alarmed ? 'bg-red-100 text-red-700' :
      (asset.status === 'warning' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700');

    return `
      <div style="font-family: Inter, sans-serif; min-width: 250px;">
        <div style="font-size: 14px; font-weight: 700; margin-bottom: 10px; color: #1E1E1E;">
          [${asset.code}] ${asset.name}
        </div>
        <div style="display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px solid #E0E0E0;">
          <span style="font-size: 12px; color: #666;">Category:</span>
          <span style="font-size: 12px; font-weight: 600;">${asset.category}</span>
        </div>
        <div style="display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px solid #E0E0E0;">
          <span style="font-size: 12px; color: #666;">Condition:</span>
          <span class="inline-flex px-2 py-1 rounded text-xs font-semibold ${statusBadge}">
            ${asset.condition}
          </span>
        </div>
        <div style="display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px solid #E0E0E0;">
          <span style="font-size: 12px; color: #666;">Location:</span>
          <span style="font-size: 12px; font-weight: 600;">${asset.zone}</span>
        </div>
        <div style="display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px solid #E0E0E0;">
          <span style="font-size: 12px; color: #666;">Custody:</span>
          <span style="font-size: 12px; font-weight: 600;">${asset.custody}</span>
        </div>
        <div style="display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px solid #E0E0E0;">
          <span style="font-size: 12px; color: #666;">Last Seen:</span>
          <span style="font-size: 12px; font-weight: 600;">${asset.last_seen}</span>
        </div>
        <div style="display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px solid #E0E0E0;">
          <span style="font-size: 12px; color: #666;">Next Service:</span>
          <span style="font-size: 12px; font-weight: 600;">${asset.next_service}</span>
        </div>
        <div style="display: flex; justify-content: space-between; padding: 6px 0;">
          <span style="font-size: 12px; color: #666;">GPS:</span>
          <span style="font-size: 12px; font-weight: 600;">${Number(asset.latitude).toFixed(4)}, ${Number(asset.longitude).toFixed(4)}</span>
        </div>
        ${asset.alarmed ? '<div style="color: #DC3545; font-weight: 700; margin-top: 10px; text-align: center;">⚠️ ALARMED</div>' : ''}
      </div>
    `;
  };

  // =====================================================
  // ATUALIZAR MARCADORES
  // =====================================================
  const updateMarkers = () => {
    if (!markerClusterRef.current || !mapInstanceRef.current) return;

    markerClusterRef.current.clearLayers();

    const assetsWithGPS = filteredAssets.filter(a => a.latitude && a.longitude);

    assetsWithGPS.forEach(asset => {
      const color = getMarkerColor(asset);
      const icon = createCustomIcon(color);
      const marker = L.marker([asset.latitude, asset.longitude], { icon });

      marker.bindPopup(createPopupContent(asset));
      markerClusterRef.current?.addLayer(marker);
    });

    // Ajustar zoom para mostrar todos os marcadores
    if (assetsWithGPS.length > 0) {
      const group = L.featureGroup(
        assetsWithGPS.map(a => L.marker([a.latitude, a.longitude]))
      );
      mapInstanceRef.current.fitBounds(group.getBounds().pad(0.1));
    }

    // Atualizar estatísticas locais
    setStats({
      total: filteredAssets.length,
      onMap: assetsWithGPS.length,
      active: filteredAssets.filter(a => a.active).length,
      alarmed: filteredAssets.filter(a => a.alarmed).length
    });
  };

  // =====================================================
  // ATUALIZAR MARCADORES QUANDO FILTROS MUDAM
  // =====================================================
  useEffect(() => {
    updateMarkers();
  }, [filteredAssets]);

  // =====================================================
  // APLICAR FILTROS (AGORA USA A API)
  // =====================================================
  const applyFilters = async () => {
    setLoading(true);

    try {
      // Chamar API com filtros
      await fetchMapData({
        site: filters.site || undefined,
        category: filters.category || undefined,
        custody: filters.custody || undefined,
        search: filters.searchText || undefined,
        limit: 1000
      });
    } catch (error) {
      console.error('Erro ao aplicar filtros:', error);
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // EXPORTAR PARA CSV
  // =====================================================
  const exportToCSV = () => {
    const exportData = filteredAssets.map(asset => ({
      'Asset Code': asset.code,
      'Asset Name': asset.name,
      'Category': asset.category,
      'Condition': asset.condition,
      'Custody': asset.custody,
      'Site': asset.site,
      'Area': asset.area,
      'Zone': asset.zone,
      'Latitude': asset.latitude,
      'Longitude': asset.longitude,
      'Last Seen': asset.last_seen,
      'Next Service': asset.next_service,
      'Warranty Ends': asset.warranty_ends,
      'Status': asset.active ? 'Active' : 'Inactive',
      'Alarmed': asset.alarmed ? 'Yes' : 'No'
    }));

    const headers = Object.keys(exportData[0]);
    let csv = headers.join(',') + '\n';
    exportData.forEach(row => {
      csv += headers.map(h => `"${row[h as keyof typeof row]}"`).join(',') + '\n';
    });

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Asset_GPS_Tracking_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // =====================================================
  // REFRESH (RECARREGAR DADOS)
  // =====================================================
  const handleRefresh = async () => {
    setLoading(true);
    try {
      await refreshAll({
        site: filters.site || undefined,
        category: filters.category || undefined,
        custody: filters.custody || undefined,
        search: filters.searchText || undefined
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex gap-5 h-[calc(100vh-220px)]">
      {/* Sidebar com filtros */}
      <div className="w-[400px] bg-white rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.06)] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b-2 border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 text-gray-600 text-sm">
              <MapPinIcon className="w-4 h-4" />
              <span>Asset Tracking</span>
            </div>
            <button
              onClick={() => setIsFiltersCollapsed(!isFiltersCollapsed)}
              className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
              title={isFiltersCollapsed ? 'Expand Filters' : 'Collapse Filters'}
            >
              {isFiltersCollapsed ? (
                <ChevronDownIcon className="w-5 h-5 text-gray-600" />
              ) : (
                <ChevronUpIcon className="w-5 h-5 text-gray-600" />
              )}
            </button>
          </div>
          <h2 className="text-xl font-bold text-gray-900">GPS Map View</h2>
          
          {/* Erro da API */}
          {apiError && (
            <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
              <div className="flex-1">
                <p className="text-xs text-red-800 font-semibold">Erro ao carregar dados</p>
                <p className="text-xs text-red-600 mt-1">{apiError}</p>
              </div>
              <button 
                onClick={clearError}
                className="text-red-600 hover:text-red-800"
              >
                ✕
              </button>
            </div>
          )}
        </div>

        {/* Filtros */}
        <div 
          className={`flex-1 overflow-y-auto p-5 transition-all duration-300 ${
            isFiltersCollapsed ? 'max-h-0 p-0 opacity-0' : 'max-h-full opacity-100'
          }`}
          style={{ 
            display: isFiltersCollapsed ? 'none' : 'block'
          }}
        >
          <div className="text-xs font-bold uppercase text-gray-600 mb-4 tracking-wide">
            Filters
          </div>

          {/* Site */}
          <div className="mb-4">
            <label className="block text-xs font-semibold text-gray-900 mb-1.5">
              Current Site
            </label>
            <select
              className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-lg text-sm focus:outline-none focus:border-primary-500"
              value={filters.site}
              onChange={(e) => setFilters({ ...filters, site: e.target.value })}
              disabled={apiLoading}
            >
              <option value="">All Sites</option>
              {filterOptions?.sites.map(site => (
                <option key={site.id} value={site.name}>{site.name}</option>
              ))}
            </select>
          </div>

          {/* Category */}
          <div className="mb-4">
            <label className="block text-xs font-semibold text-gray-900 mb-1.5">
              Category
            </label>
            <select
              className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-lg text-sm focus:outline-none focus:border-primary-500"
              value={filters.category}
              onChange={(e) => setFilters({ ...filters, category: e.target.value })}
              disabled={apiLoading}
            >
              <option value="">All Categories</option>
              {filterOptions?.categories.map(category => (
                <option key={category.id} value={category.name}>{category.name}</option>
              ))}
            </select>
          </div>

          {/* Custody */}
          <div className="mb-4">
            <label className="block text-xs font-semibold text-gray-900 mb-1.5">
              Custody
            </label>
            <select
              className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-lg text-sm focus:outline-none focus:border-primary-500"
              value={filters.custody}
              onChange={(e) => setFilters({ ...filters, custody: e.target.value })}
              disabled={apiLoading}
            >
              <option value="">All Custodies</option>
              {filterOptions?.custodies.map(custody => (
                <option key={custody.id} value={custody.name}>{custody.name}</option>
              ))}
            </select>
          </div>

          {/* Search */}
          <div className="mb-4">
            <label className="block text-xs font-semibold text-gray-900 mb-1.5">
              Search by Code or Name
            </label>
            <input
              type="text"
              className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-lg text-sm focus:outline-none focus:border-primary-500"
              placeholder="Type to search..."
              value={filters.searchText}
              onChange={(e) => setFilters({ ...filters, searchText: e.target.value })}
              disabled={apiLoading}
            />
          </div>

          {/* Apply Button */}
          <button
            onClick={applyFilters}
            disabled={loading || apiLoading}
            className="w-full py-3 bg-primary-500 text-white rounded-lg text-sm font-semibold hover:bg-primary-600 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading || apiLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Loading...</span>
              </>
            ) : (
              <>
                <MapPinIcon className="w-4 h-4" />
                <span>Apply Filters</span>
              </>
            )}
          </button>
        </div>

        {/* Estatísticas */}
        <div className="p-5 border-t-2 border-gray-200 bg-gray-50">
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white p-3 rounded-lg border border-gray-200">
              <div className="text-[11px] font-semibold text-gray-600 uppercase mb-1">
                Total Assets
              </div>
              <div className="text-2xl font-bold text-primary-500">
                {apiStats?.total_assets || stats.total}
              </div>
            </div>

            <div className="bg-white p-3 rounded-lg border border-gray-200">
              <div className="text-[11px] font-semibold text-gray-600 uppercase mb-1">
                With GPS
              </div>
              <div className="text-2xl font-bold text-primary-500">
                {apiStats?.assets_with_gps || stats.onMap}
              </div>
            </div>

            <div className="bg-white p-3 rounded-lg border border-gray-200">
              <div className="text-[11px] font-semibold text-gray-600 uppercase mb-1">
                Active
              </div>
              <div className="text-2xl font-bold text-green-600">
                {apiStats?.active_assets || stats.active}
              </div>
            </div>

            <div className="bg-white p-3 rounded-lg border border-gray-200">
              <div className="text-[11px] font-semibold text-gray-600 uppercase mb-1">
                Alarmed
              </div>
              <div className="text-2xl font-bold text-red-600">
                {apiStats?.alarmed_assets || stats.alarmed}
              </div>
            </div>
          </div>

          {/* Coverage */}
          {apiStats && (
            <div className="mt-3 bg-white p-3 rounded-lg border border-gray-200">
              <div className="text-[11px] font-semibold text-gray-600 uppercase mb-2">
                GPS Coverage
              </div>
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-primary-500 h-2 rounded-full transition-all"
                    style={{ width: `${apiStats.gps_coverage_pct}%` }}
                  ></div>
                </div>
                <span className="text-sm font-bold text-gray-900">
                  {Number(apiStats.gps_coverage_pct).toFixed(1)}%
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Map Container */}
      <div className="flex-1 relative bg-white rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.06)] overflow-hidden">
        {/* Map Controls */}
        <div className="absolute top-5 right-5 z-[1000] flex gap-3">
          <button
            onClick={handleRefresh}
            disabled={loading || apiLoading}
            className="px-4 py-3 bg-blue-600 text-white rounded-lg text-sm font-semibold shadow-lg hover:bg-blue-700 transition-all flex items-center gap-2 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ArrowPathIcon className={`w-4 h-4 ${(loading || apiLoading) ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
          
          <button
            onClick={exportToCSV}
            disabled={filteredAssets.length === 0}
            className="px-4 py-3 bg-green-600 text-white rounded-lg text-sm font-semibold shadow-lg hover:bg-green-700 transition-all flex items-center gap-2 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ArrowDownTrayIcon className="w-4 h-4" />
            <span>Export CSV</span>
          </button>
        </div>

        {/* Legend */}
        <div className="absolute bottom-5 left-5 z-[1000] bg-white p-4 rounded-lg shadow-lg">
          <div className="text-xs font-bold uppercase text-gray-600 mb-3">
            Status Legend
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-green-500 border-2 border-white shadow"></div>
              <span className="text-xs text-gray-700">Active & Compliant</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-yellow-500 border-2 border-white shadow"></div>
              <span className="text-xs text-gray-700">Needs Attention</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-red-500 border-2 border-white shadow"></div>
              <span className="text-xs text-gray-700">Critical / Alarmed</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-gray-500 border-2 border-white shadow"></div>
              <span className="text-xs text-gray-700">Inactive</span>
            </div>
          </div>
        </div>

        {/* Map */}
        <div ref={mapRef} className="w-full h-full" />
      </div>
    </div>
  );
};

export default AssetGPSMap;