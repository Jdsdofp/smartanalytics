// src/components/BoundaryMarkerMap.tsx
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useEffect } from 'react';

interface BoundaryMarkerMapProps {
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

const AutoFitBounds = ({ boundaries }: { boundaries: BoundaryMarkerMapProps['boundaries'] }) => {
  const map = useMap();

  useEffect(() => {
    if (boundaries.length === 0) return;

    const validPoints = boundaries.filter(b => b.centroid_lat && b.centroid_lng);
    if (validPoints.length === 0) return;

    const bounds = L.latLngBounds(
      validPoints.map(b => [
        parseFloat(String(b.centroid_lat)),
        parseFloat(String(b.centroid_lng))
      ])
    );

    map.fitBounds(bounds, { padding: [50, 50] });
  }, [map, boundaries]);

  return null;
};

export default function BoundaryMarkerMap({
  boundaries,
  center = [-5.089167, -42.801944],
  zoom = 13
}: BoundaryMarkerMapProps) {
  const getColor = (visits: number) => {
    if (visits > 100) return '#EF4444';
    if (visits > 50) return '#FF6B35';
    if (visits > 20) return '#F59E0B';
    if (visits > 10) return '#10B981';
    return '#0F4C81';
  };

  const getRadius = (visits: number) => {
    const base = Math.sqrt(visits) * 3;
    return Math.min(Math.max(base, 8), 40);
  };

  return (
    <MapContainer
      center={center}
      zoom={zoom}
      style={{ width: '100%', height: '100%', borderRadius: '0.75rem' }}
      className="z-0"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <AutoFitBounds boundaries={boundaries} />

      {boundaries.map((boundary) => {
        if (!boundary.centroid_lat || !boundary.centroid_lng) return null;

        const lat = parseFloat(String(boundary.centroid_lat));
        const lng = parseFloat(String(boundary.centroid_lng));

        return (
          <CircleMarker
            key={boundary.boundary_id}
            center={[lat, lng]}
            radius={getRadius(boundary.visits)}
            pathOptions={{
              fillColor: getColor(boundary.visits),
              color: getColor(boundary.visits),
              weight: 2,
              opacity: 0.8,
              fillOpacity: 0.6
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
                    <strong>Visitas:</strong> 
                    <span style={{ fontFamily: 'monospace', color: '#0F4C81', fontWeight: 'bold' }}>
                      {boundary.visits}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <strong>Duração:</strong> 
                    <span style={{ fontFamily: 'monospace' }}>
                      {boundary.duration_hours.toFixed(1)}h
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <strong>Pessoas dentro:</strong> 
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
        );
      })}
    </MapContainer>
  );
}