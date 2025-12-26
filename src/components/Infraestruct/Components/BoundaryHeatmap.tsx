// src/components/BoundaryHeatmap.tsx - Versão Simplificada

import { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.heat';

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
  center?: [number, number];
  zoom?: number;
}

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

export default function BoundaryHeatmap({ boundaries, center, zoom = 13 }: BoundaryHeatmapProps) {
  const getColor = (visits: number) => {
    if (visits > 100) return '#EF4444';
    if (visits > 50) return '#FF6B35';
    if (visits > 20) return '#F59E0B';
    if (visits > 10) return '#10B981';
    return '#0F4C81';
  };

  const getRadius = (visits: number) => {
    const base = Math.sqrt(visits || 1) * 3;
    return Math.min(Math.max(base, 8), 40);
  };

  const validBoundaries = boundaries.filter(
    b => b.centroid_lat && b.centroid_lng && 
    !isNaN(b.centroid_lat) && !isNaN(b.centroid_lng)
  );

  if (validBoundaries.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-100 rounded-lg">
        <p className="text-gray-500">Nenhum boundary com coordenadas válidas</p>
      </div>
    );
  }

  return (
    <MapContainer
      center={center || [-5.089167, -42.801944]}
      zoom={zoom}
      style={{ width: '100%', height: '100%', borderRadius: '0.75rem' }}
      className="z-0"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <HeatmapLayer boundaries={validBoundaries} />

      {validBoundaries.map((boundary) => (
        <CircleMarker
          key={boundary.boundary_id}
          center={[boundary.centroid_lat, boundary.centroid_lng]}
          radius={getRadius(boundary.visits)}
          pathOptions={{
            fillColor: getColor(boundary.visits),
            color: '#fff',
            weight: 2,
            opacity: 1,
            fillOpacity: 0.7
          }}
        >
          <Popup>
            <div style={{ fontFamily: "'Outfit', sans-serif", minWidth: '200px' }}>
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
              <div style={{ fontSize: '12px', color: '#64748B', lineHeight: '1.8' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <strong>Visitas (30d):</strong> 
                  <span style={{ fontFamily: 'monospace', color: '#0F4C81', fontWeight: 'bold' }}>
                    {boundary.visits.toLocaleString()}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <strong>Duração Total:</strong> 
                  <span style={{ fontFamily: 'monospace' }}>
                    {boundary.duration_hours.toFixed(1)}h
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <strong>Pessoas Dentro:</strong> 
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
  );
}