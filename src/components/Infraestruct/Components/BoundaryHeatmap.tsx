// src/components/BoundaryHeatmap.tsx

import { useEffect, useRef, useState } from 'react';
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

export default function BoundaryHeatmap({ boundaries, zones = [], center, zoom = 13 }: BoundaryHeatmapProps) {
  const [mapType, setMapType] = useState<keyof typeof MAP_TYPES>('satellite');

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

  if (validBoundaries.length === 0 && validZones.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-100 rounded-lg">
        <p className="text-gray-500">Nenhum dado disponível para exibição</p>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full">
      {/* Seletor de Tipo de Mapa */}
      <div className="absolute top-4 right-4 z-[1000] bg-white rounded-lg shadow-lg border border-gray-200 p-2">
        <select
          value={mapType}
          onChange={(e) => setMapType(e.target.value as keyof typeof MAP_TYPES)}
          className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border-0 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
        >
          {Object.entries(MAP_TYPES).map(([key, value]) => (
            <option key={key} value={key}>
              🗺️ {value.name}
            </option>
          ))}
        </select>
      </div>

      <MapContainer
        center={center || [18.429, -93.208]}
        zoom={zoom}
        maxZoom={22}
        style={{ width: '100%', height: '100%', borderRadius: '0.75rem' }}
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
                  weight: 2,
                  opacity: 0.8,
                  fillOpacity: 0.15,
                  fillColor: color
                }}
                // @ts-ignore
                onEachFeature={(feature, layer) => {
                  layer.bindPopup(`
            <div style="font-family: 'Outfit', sans-serif; min-width: 180px;">
              <div style="font-weight: bold; font-size: 13px; color: #0F4C81; margin-bottom: 6px; border-bottom: 2px solid #E2E8F0; padding-bottom: 4px;">
                ${zone.boundary_name}
              </div>
              <div style="font-size: 11px; color: #64748B; line-height: 1.6;">
                <div style="margin-bottom: 3px;">
                  <strong>${t('boundaryAccessAnalytics.boundaryMarkerMap.zonePopup.code')}:</strong> <span style="font-family: monospace;">${zone.code}</span>
                </div>
                <div style="margin-bottom: 3px;">
                  <strong>${t('boundaryAccessAnalytics.boundaryMarkerMap.zonePopup.group')}:</strong> ${zone.group_name}
                </div>
                <div>
                  <span style="display: inline-block; padding: 2px 6px; background: ${statusColor}; color: white; border-radius: 4px; font-size: 9px; font-weight: bold;">
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
            radius={4}
            pathOptions={{
              fillColor: getColor(boundary.visits),
              color: '#fff',
              weight: 1,
              opacity: 0.9,
              fillOpacity: 0.8
            }}
          >
            <Popup>
              <div style={{ fontFamily: "'Outfit', sans-serif" }}>
                <div style={{
                  fontWeight: 'bold',
                  fontSize: '14px',
                  color: '#0F4C81',
                  marginBottom: '8px',
                  borderBottom: '2px solid #E2E8F0',
                  paddingBottom: '4px'
                }}>
                  {boundary.boundary_name}
                </div>
                <div style={{ fontSize: '12px', color: '#64748B', lineHeight: '1.6' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <strong>{t('boundaryAccessAnalytics.boundaryMarkerMap.popup.visits')}:</strong>
                    <span style={{ fontFamily: 'monospace', color: '#0F4C81', fontWeight: 'bold' }}>
                      {boundary.visits}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <strong>{t('boundaryAccessAnalytics.boundaryMarkerMap.popup.duration')}:</strong>
                    <span style={{ fontFamily: 'monospace' }}>
                      {boundary.duration_hours.toFixed(1)}h
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <strong>{t('boundaryAccessAnalytics.boundaryMarkerMap.popup.peopleInside')}:</strong>
                    <span
                      style={{
                        fontFamily: 'monospace',
                        color: boundary.is_currently_inside > 0 ? '#10B981' : '#64748B',
                        fontWeight: boundary.is_currently_inside > 0 ? 'bold' : 'normal'
                      }}
                    >
                      {boundary.is_currently_inside}
                    </span>
                  </div>
                </div>
              </div>
            </Popup>
          </CircleMarker>
        ))}
      </MapContainer>
    </div>
  );
}