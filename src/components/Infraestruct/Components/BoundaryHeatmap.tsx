// src/components/BoundaryHeatmap.tsx

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { MapContainer, TileLayer, CircleMarker, Popup, GeoJSON, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.heat';
import { t } from 'i18next';

interface BoundaryHeatmapProps {
  boundaries: Array<{
    boundary_id: number;
    boundary_name: string;
    centroid_lat: number;
    centroid_lng: number;
    visits: number;
    duration_hours: number;
    is_currently_inside: number;
  }>;
  zones?: Array<{
    id: number;
    company_id: number;
    group_name: string;
    boundary_name: string;
    code: string;
    active: number;
    geojson_data: any;
  }>;
  center?: [number, number];
  zoom?: number;
}

// 🗺️ CONFIGURAÇÕES DE TIPOS DE MAPA
const MAP_TYPES = {
  streets: {
    name: t('boundaryAccessAnalytics.mapTypes.streets'),
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; OpenStreetMap',
    maxNativeZoom: 19,
    maxZoom: 22
  },
  satellite: {
    name: t('boundaryAccessAnalytics.mapTypes.satellite'),
    url: 'https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}',
    attribution: '&copy; Google',
    maxNativeZoom: 21,
    maxZoom: 22
  },
  terrain: {
    name: t('boundaryAccessAnalytics.mapTypes.terrain'),
    url: 'https://mt1.google.com/vt/lyrs=p&x={x}&y={y}&z={z}',
    attribution: '&copy; Google',
    maxNativeZoom: 20,
    maxZoom: 22
  },
  dark: {
    name: t('boundaryAccessAnalytics.mapTypes.dark'),
    url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    attribution: '&copy; CARTO',
    maxNativeZoom: 20,
    maxZoom: 22
  },
};

const HeatmapLayer = ({ boundaries }: { boundaries: BoundaryHeatmapProps['boundaries'] }) => {
  const map = useMap();
  const heatLayerRef = useRef<L.HeatLayer | null>(null);

  useEffect(() => {
    if (!map || !boundaries.length) return;

    if (heatLayerRef.current) {
      map.removeLayer(heatLayerRef.current);
    }

    const heatData: [number, number, number][] = boundaries
      .filter(b => b.centroid_lat && b.centroid_lng &&
        !isNaN(b.centroid_lat) && !isNaN(b.centroid_lng))
      .map(b => {
        const maxVisits = Math.max(...boundaries.map(x => x.visits || 0));
        const intensity = maxVisits > 0 ? (b.visits || 0) / maxVisits : 0;
        return [b.centroid_lat, b.centroid_lng, intensity];
      });

    if (heatData.length === 0) return;

    // @ts-ignore
    const heatLayer = L.heatLayer(heatData, {
      radius: 35,
      blur: 30,
      maxZoom: 17,
      max: 1.0,
      gradient: {
        0.0: '#0F4C81',
        0.3: '#3B82F6',
        0.5: '#10B981',
        0.7: '#F59E0B',
        0.9: '#FF6B35',
        1.0: '#EF4444'
      }
    }).addTo(map);

    heatLayerRef.current = heatLayer;

    const bounds = L.latLngBounds(heatData.map(([lat, lng]) => [lat, lng]));
    map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });

    return () => {
      if (heatLayerRef.current) {
        map.removeLayer(heatLayerRef.current);
      }
    };
  }, [map, boundaries]);

  return null;
};

// Helper para decodificar cor hex
const decodeColor = (encodedColor: string): string => {
  try {
    return decodeURIComponent(encodedColor);
  } catch {
    return encodedColor;
  }
};

// Componente do conteúdo do mapa (reutilizável em ambos os modos)
const MapContent = ({ 
  mapType, 
  validBoundaries, 
  validZones, 
  center, 
  zoom, 
  getColor 
}: {
  mapType: keyof typeof MAP_TYPES;
  validBoundaries: BoundaryHeatmapProps['boundaries'];
  validZones: NonNullable<BoundaryHeatmapProps['zones']>;
  center?: [number, number];
  zoom: number;
  getColor: (visits: number) => string;
}) => {
  return (
    <MapContainer
      center={center || [18.429, -93.208]}
      zoom={zoom}
      maxZoom={22}
      style={{ width: '100%', height: '100%' }}
      className="z-0"
    >
      <TileLayer
        attribution={MAP_TYPES[mapType].attribution}
        url={MAP_TYPES[mapType].url}
        maxNativeZoom={MAP_TYPES[mapType].maxNativeZoom}
        maxZoom={MAP_TYPES[mapType].maxZoom}
      />

      {/* Heatmap Layer */}
      {validBoundaries.length > 0 && <HeatmapLayer boundaries={validBoundaries} />}

      {/* Zonas/Cercas (GeoJSON Polygons) */}
      {validZones.map((zone) => {
        try {
          const geoJsonData = typeof zone.geojson_data === 'string'
            ? JSON.parse(zone.geojson_data)
            : zone.geojson_data;

          const feature = geoJsonData.features?.[0];
          const color = feature?.properties?.color
            ? decodeColor(feature.properties.color)
            : '#0F4C81';

          const isActive = zone.active === 1;
          const statusText = isActive
            ? t('boundaryAccessAnalytics.boundaryMarkerMap.zonePopup.active')
            : t('boundaryAccessAnalytics.boundaryMarkerMap.zonePopup.inactive');
          const statusColor = isActive ? '#10B981' : '#EF4444';

          return (
            <GeoJSON
              key={zone.id}
              data={geoJsonData}
              style={{
                color: color,
                weight: 3,
                opacity: 0.9,
                fillOpacity: 0.2,
                fillColor: color,
                dashArray: '5, 5'
              }}
              // @ts-ignore
              onEachFeature={(feature, layer) => {
                layer.bindPopup(`
                  <div style="font-family: 'Outfit', sans-serif; min-width: 220px;">
                    <div style="background: linear-gradient(135deg, #0F4C81 0%, #1a5c9e 100%); color: white; padding: 12px; margin: -12px -12px 12px -12px; border-radius: 8px 8px 0 0;">
                      <div style="font-weight: bold; font-size: 15px; display: flex; align-items: center; gap: 8px;">
                        <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24" style="flex-shrink: 0;">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9"></path>
                        </svg>
                        ${zone.boundary_name}
                      </div>
                    </div>
                    <div style="font-size: 12px; color: #64748B; line-height: 1.8;">
                      <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #E2E8F0;">
                        <strong style="color: #1A2332;">Código:</strong> 
                        <span style="font-family: monospace; background: #F5F7FA; padding: 2px 8px; border-radius: 4px; color: #0F4C81; font-weight: 600;">${zone.code}</span>
                      </div>
                      <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #E2E8F0;">
                        <strong style="color: #1A2332;">Grupo:</strong> 
                        <span style="color: #64748B;">${zone.group_name}</span>
                      </div>
                      <div style="padding: 8px 0;">
                        <span style="display: inline-block; padding: 4px 12px; background: ${statusColor}; color: white; border-radius: 6px; font-size: 10px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.5px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                          ${statusText}
                        </span>
                      </div>
                    </div>
                  </div>
                `);
              }}
            />
          );
        } catch (error) {
          console.error(`Error rendering zone ${zone.id}:`, error);
          return null;
        }
      })}

      {/* Marcadores dos Boundaries */}
      {validBoundaries.map((boundary) => (
        <CircleMarker
          key={boundary.boundary_id}
          center={[boundary.centroid_lat, boundary.centroid_lng]}
          radius={6}
          pathOptions={{
            fillColor: getColor(boundary.visits),
            color: '#fff',
            weight: 2,
            opacity: 1,
            fillOpacity: 0.9
          }}
        >
          <Popup>
            <div style={{ fontFamily: "'Outfit', sans-serif", minWidth: '250px' }}>
              <div style={{
                background: 'linear-gradient(135deg, #0F4C81 0%, #1a5c9e 100%)',
                color: 'white',
                padding: '12px',
                margin: '-12px -12px 12px -12px',
                borderRadius: '8px 8px 0 0'
              }}>
                <div style={{
                  fontWeight: 'bold',
                  fontSize: '15px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {boundary.boundary_name}
                </div>
              </div>
              <div style={{ fontSize: '12px', color: '#64748B', lineHeight: '1.8' }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '10px 0',
                  borderBottom: '1px solid #E2E8F0'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    <strong style={{ color: '#1A2332' }}>{t('boundaryAccessAnalytics.boundaryMarkerMap.popup.visits')}:</strong>
                  </div>
                  <span style={{
                    fontFamily: 'monospace',
                    background: `linear-gradient(135deg, ${getColor(boundary.visits)} 0%, ${getColor(boundary.visits)}dd 100%)`,
                    color: 'white',
                    padding: '4px 12px',
                    borderRadius: '6px',
                    fontWeight: 'bold',
                    fontSize: '13px',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                  }}>
                    {boundary.visits}
                  </span>
                </div>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '10px 0',
                  borderBottom: '1px solid #E2E8F0'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <strong style={{ color: '#1A2332' }}>{t('boundaryAccessAnalytics.boundaryMarkerMap.popup.duration')}:</strong>
                  </div>
                  <span style={{
                    fontFamily: 'monospace',
                    background: '#F5F7FA',
                    padding: '4px 12px',
                    borderRadius: '6px',
                    color: '#0F4C81',
                    fontWeight: '600'
                  }}>
                    {boundary.duration_hours.toFixed(1)}h
                  </span>
                </div>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '10px 0'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <strong style={{ color: '#1A2332' }}>{t('boundaryAccessAnalytics.boundaryMarkerMap.popup.peopleInside')}:</strong>
                  </div>
                  <span style={{
                    fontFamily: 'monospace',
                    background: boundary.is_currently_inside > 0 ? 'linear-gradient(135deg, #10B981 0%, #059669 100%)' : '#F5F7FA',
                    color: boundary.is_currently_inside > 0 ? 'white' : '#64748B',
                    padding: '4px 12px',
                    borderRadius: '6px',
                    fontWeight: boundary.is_currently_inside > 0 ? 'bold' : '600',
                    boxShadow: boundary.is_currently_inside > 0 ? '0 2px 4px rgba(16, 185, 129, 0.3)' : 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}>
                    {boundary.is_currently_inside > 0 && (
                      <span style={{
                        width: '6px',
                        height: '6px',
                        background: 'white',
                        borderRadius: '50%',
                        display: 'inline-block',
                        animation: 'pulse 2s infinite'
                      }}></span>
                    )}
                    {boundary.is_currently_inside}
                  </span>
                </div>
              </div>
            </div>
          </Popup>
        </CircleMarker>
      ))}
    </MapContainer>
  );
};

export default function BoundaryHeatmap({ boundaries, zones = [], center, zoom = 13 }: BoundaryHeatmapProps) {
  const [mapType, setMapType] = useState<keyof typeof MAP_TYPES>('satellite');
  const [isFullscreen, setIsFullscreen] = useState(false);

  const getColor = (visits: number) => {
    if (visits > 100) return '#EF4444';
    if (visits > 50) return '#FF6B35';
    if (visits > 20) return '#F59E0B';
    if (visits > 10) return '#10B981';
    return '#0F4C81';
  };

  const validBoundaries = boundaries.filter(
    b => b.centroid_lat && b.centroid_lng &&
      !isNaN(b.centroid_lat) && !isNaN(b.centroid_lng)
  );

  const validZones = zones.filter(z => z.geojson_data && z.active === 1);

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  // Bloquear scroll do body quando em fullscreen
  useEffect(() => {
    if (isFullscreen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isFullscreen]);

  // Fechar fullscreen com tecla ESC
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false);
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isFullscreen]);

  if (validBoundaries.length === 0 && validZones.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl border-2 border-dashed border-gray-300">
        <div className="text-center p-8">
          <div className="w-20 h-20 bg-white rounded-2xl shadow-lg flex items-center justify-center mx-auto mb-4">
            <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
          </div>
          <p className="text-gray-600 font-semibold text-lg">Nenhum dado disponível</p>
          <p className="text-gray-400 text-sm mt-1">Não há boundaries ou zonas para exibir no mapa</p>
        </div>
      </div>
    );
  }

  // Mapa Normal (versão compacta)
  const normalMap = (
    <div className="relative w-full h-full rounded-2xl border-2 border-[#E2E8F0] bg-white overflow-hidden shadow-lg">
      {/* Mini Header */}
      <div className="absolute top-4 right-4 z-[1000] flex items-center gap-2">
        {/* Seletor de Tipo de Mapa */}
        <div className="relative">
          <select
            value={mapType}
            onChange={(e) => setMapType(e.target.value as keyof typeof MAP_TYPES)}
            className="pl-10 pr-10 py-2.5 text-sm font-medium bg-white/95 backdrop-blur-sm text-[#1A2332] border-2 border-[#E2E8F0] rounded-xl 
                     hover:bg-white focus:outline-none focus:ring-2 focus:ring-[#0F4C81]/20 cursor-pointer appearance-none transition-all duration-200 shadow-lg"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%231A2332' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
              backgroundPosition: 'right 0.5rem center',
              backgroundRepeat: 'no-repeat',
              backgroundSize: '1.5em 1.5em',
            }}
          >
            {Object.entries(MAP_TYPES).map(([key, value]) => (
              <option key={key} value={key}>
                {value.name}
              </option>
            ))}
          </select>
          <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
            <svg className="w-5 h-5 text-[#0F4C81]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
          </div>
        </div>

        {/* Botão Fullscreen */}
        <button
          onClick={toggleFullscreen}
          className="w-11 h-11 flex items-center justify-center bg-white/95 backdrop-blur-sm border-2 border-[#E2E8F0] rounded-xl 
                   hover:bg-[#0F4C81] hover:border-[#0F4C81] hover:scale-105 transition-all duration-200 group shadow-lg"
          title="Expandir mapa"
        >
          <svg className="w-5 h-5 text-[#0F4C81] group-hover:text-white group-hover:scale-110 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
          </svg>
        </button>
      </div>

      <MapContent 
        mapType={mapType}
        validBoundaries={validBoundaries}
        validZones={validZones}
        center={center}
        zoom={zoom}
        getColor={getColor}
      />
    </div>
  );

  // Modal Fullscreen
  const fullscreenModal = createPortal(
    <div 
      className={`fixed inset-0 z-[99999] flex items-center justify-center transition-all duration-300 ${
        isFullscreen ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}
    >
      {/* Overlay Escuro */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity duration-300"
        onClick={toggleFullscreen}
      />

      {/* Container do Modal */}
      <div className={`relative w-full h-full max-w-[98vw] max-h-[98vh] m-4 bg-white rounded-3xl shadow-2xl overflow-hidden transform transition-all duration-300 ${
        isFullscreen ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
      }`}>
        {/* Header do Modal */}
        <div className="absolute top-0 left-0 right-0 z-[1001] bg-gradient-to-r from-[#0F4C81] to-[#1a5c9e] p-6 shadow-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
              </div>
              <div>
                <h3 className="text-white font-bold text-xl">{t('boundaryAccessAnalytics.maps.heatmap.summary.heatmap')}</h3>
                <p className="text-white/80 text-sm">{t('boundaryAccessAnalytics.maps.heatmap.subtitle')}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Stats Rápidas */}
              <div className="hidden md:flex items-center gap-4 px-5 py-3 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-white text-sm font-semibold">{validBoundaries.length} Boundaries</span>
                </div>
                <div className="w-px h-5 bg-white/30"></div>
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 bg-blue-400 rounded-full animate-pulse"></div>
                  <span className="text-white text-sm font-semibold">{validZones.length} Zonas</span>
                </div>
              </div>

              {/* Controles */}
              <div className="flex items-center gap-2">
                {/* Seletor de Tipo de Mapa */}
                <div className="relative">
                  <select
                    value={mapType}
                    onChange={(e) => setMapType(e.target.value as keyof typeof MAP_TYPES)}
                    className="pl-11 pr-12 py-3 text-sm font-medium bg-white/10 backdrop-blur-sm text-white border-2 border-white/20 rounded-2xl 
                             hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/50 cursor-pointer appearance-none transition-all duration-200"
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='white' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                      backgroundPosition: 'right 0.75rem center',
                      backgroundRepeat: 'no-repeat',
                      backgroundSize: '1.5em 1.5em',
                    }}
                  >
                    {Object.entries(MAP_TYPES).map(([key, value]) => (
                      <option key={key} value={key} className="text-gray-900">
                        {value.name}
                      </option>
                    ))}
                  </select>
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                    </svg>
                  </div>
                </div>

                {/* Botão Fechar */}
                <button
                  onClick={toggleFullscreen}
                  className="w-12 h-12 flex items-center justify-center bg-white/10 backdrop-blur-sm border-2 border-white/20 rounded-2xl 
                           hover:bg-red-500 hover:border-red-500 hover:scale-105 hover:rotate-90 transition-all duration-300 group"
                  title="Fechar (ESC)"
                >
                  <svg className="w-6 h-6 text-white group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Legenda Flutuante */}
        <div className="absolute bottom-8 left-8 z-[1001] bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border-2 border-[#E2E8F0] p-5">
          <div className="flex items-center gap-3 mb-4 pb-3 border-b border-[#E2E8F0]">
            <div className="w-10 h-10 bg-gradient-to-br from-[#0F4C81] to-[#1a5c9e] rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-bold text-[#1A2332] uppercase tracking-wider">Intensidade de Visitas</p>
              <p className="text-xs text-[#64748B]">Densidade de acessos por boundary</p>
            </div>
          </div>
          
          <div className="space-y-2.5">
            {[
              { color: '#0F4C81', label: 'Baixa', range: '≤ 10 visitas' },
              { color: '#10B981', label: 'Média', range: '11 - 20 visitas' },
              { color: '#F59E0B', label: 'Alta', range: '21 - 50 visitas' },
              { color: '#FF6B35', label: 'Muito Alta', range: '51 - 100 visitas' },
              { color: '#EF4444', label: 'Crítica', range: '> 100 visitas' },
            ].map((item, idx) => (
              <div key={idx} className="flex items-center gap-3 group hover:bg-gray-50 p-2.5 rounded-xl transition-colors cursor-pointer">
                <div className="w-7 h-7 rounded-xl shadow-md group-hover:scale-110 group-hover:shadow-lg transition-all" style={{ backgroundColor: item.color }}></div>
                <div>
                  <p className="text-sm font-semibold text-[#1A2332]">{item.label}</p>
                  <p className="text-xs text-[#64748B]">{item.range}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Info de Zonas (se houver) */}
        {validZones.length > 0 && (
          <div className="absolute top-32 right-8 z-[1001] bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border-2 border-[#E2E8F0] p-5 max-w-xs">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
              <p className="text-sm font-bold text-[#1A2332] uppercase tracking-wider">{t('boundaryAccessAnalytics.maps.heatmap.summary.zoneActive')}</p>
            </div>
            <p className="text-xs text-[#64748B] leading-relaxed">
              {t('boundaryAccessAnalytics.maps.heatmap.summary.legendModal')}
            </p>
          </div>
        )}

        {/* Mapa */}
        <div className="w-full h-full" style={{ paddingTop: '96px' }}>
          <MapContent 
            mapType={mapType}
            validBoundaries={validBoundaries}
            validZones={validZones}
            center={center}
            zoom={zoom}
            getColor={getColor}
          />
        </div>

        {/* Hint ESC */}
        <div className="absolute bottom-8 right-8 z-[1001] px-4 py-2 bg-black/70 backdrop-blur-sm rounded-xl border border-white/20">
          <div className="flex items-center gap-2">
            <kbd className="px-2 py-1 bg-white/20 rounded text-white text-xs font-mono">ESC</kbd>
            <span className="text-white text-xs font-medium">para fechar</span>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );

  return (
    <>
      {normalMap}
      {fullscreenModal}
    </>
  );
}