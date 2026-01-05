// src/components/Map/MapTrackingModal.tsx

import { useState, useEffect, useRef, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, Popup, useMap, CircleMarker } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Importar e declarar tipos para polylineDecorator
import 'leaflet-polylinedecorator';

// Declaração de tipos para leaflet-polylinedecorator
declare module 'leaflet' {
  namespace Symbol {
    function arrowHead(options: any): any;
  }
  function polylineDecorator(line: L.Polyline, options: any): any;
}

import {
  XMarkIcon,
  MapPinIcon,
  PlayIcon,
  PauseIcon,
  StopIcon,
  ForwardIcon,
  BackwardIcon,
  ArrowPathIcon,
  MagnifyingGlassPlusIcon,
  MagnifyingGlassMinusIcon,
  HandThumbUpIcon,
  ClockIcon,
  MapIcon,
} from '@heroicons/react/24/outline';
import { useCompany } from '../../../hooks/useCompany';

// =====================================
// 🗺️ TIPOS DE MAPAS
// =====================================
const MAP_TYPES = {
  streets: {
    name: 'Ruas',
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; OpenStreetMap',
    maxNativeZoom: 19,
    maxZoom: 22
  },
  satellite: {
    name: 'Satélite',
    url: 'https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}',
    attribution: '&copy; Google',
    maxNativeZoom: 21,
    maxZoom: 22
  },
  terrain: {
    name: 'Terreno',
    url: 'https://mt1.google.com/vt/lyrs=p&x={x}&y={y}&z={z}',
    attribution: '&copy; Google',
    maxNativeZoom: 20,
    maxZoom: 22
  },
  dark: {
    name: 'Escuro',
    url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    attribution: '&copy; CARTO',
    maxNativeZoom: 20,
    maxZoom: 22
  },
};

// Fix para ícones do Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Ícone para o marcador de reprodução - MELHORADO
const playerIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-gold.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [32, 52],
  iconAnchor: [16, 52],
  popupAnchor: [1, -44],
  shadowSize: [52, 52]
});

// =====================================
// 🎯 FUNÇÕES DE CLASSIFICAÇÃO DE EVENTOS
// =====================================

// Função para identificar o tipo de evento
function getEventType(point: GPSPoint): string | null {
  if (point.mandown_alert === 1) return 'MANDOWN';
  if (point.button1_pressed === 1 || point.button2_pressed === 1 || point.button3_pressed === 1) return 'PANIC_BUTTON';
  if (point.tamper_alert === 1) return 'TAMPER';
  if (point.alarm1_value === 1) return 'ALARM1';
  if (point.alarm2_value === 1) return 'ALARM2';
  if (point.has_geofence_alert === 1 && point.geofence_status === 'BOUNDARY_CROSSED') return 'BOUNDARY_CROSSED';
  if ((point.movement_score ?? 0) >= 80 && (point.distance_moved_meters ?? 0) > 50) return 'HIGH_MOVEMENT';
  if (point.is_moving === 0 && point.movement_category === 'STATIONARY') return 'STOPPED';
  return null;
}

// Função para obter a cor do evento
function getEventColor(point: GPSPoint): string {
  if (point.mandown_alert === 1) return '#DC2626'; // Vermelho escuro (CRÍTICO)
  if (point.button1_pressed === 1 || point.button2_pressed === 1 || point.button3_pressed === 1) return '#EF4444'; // Vermelho (PÂNICO)
  if (point.tamper_alert === 1) return '#F59E0B'; // Laranja (VIOLAÇÃO)
  if (point.alarm1_value === 1 || point.alarm2_value === 1) return '#F97316'; // Laranja claro (ALARME)
  if (point.has_geofence_alert === 1) return '#3B82F6'; // Azul (GEOFENCE)
  if ((point.movement_score ?? 0) >= 80) return '#10B981'; // Verde (MOVIMENTO ALTO)
  if (point.is_moving === 0) return '#6B7280'; // Cinza (PARADO)
  return '#94A3B8'; // Cinza claro (SEM EVENTO)
}

// Função para obter a descrição do evento
function getEventDescription(point: GPSPoint): string | null {
  if (point.mandown_alert === 1) return '🚨 Queda Detectada - Emergência!';
  if (point.button1_pressed === 1) return '🔴 Botão de Pânico 1 Pressionado';
  if (point.button2_pressed === 1) return '🔴 Botão de Pânico 2 Pressionado';
  if (point.button3_pressed === 1) return '🔴 Botão de Pânico 3 Pressionado';
  if (point.tamper_alert === 1) return '⚠️ Violação do Dispositivo';
  if (point.alarm1_value === 1) return '🔔 Alarme 1 Ativado';
  if (point.alarm2_value === 1) return '🔔 Alarme 2 Ativado';
  if (point.has_geofence_alert === 1 && point.geofence_status === 'BOUNDARY_CROSSED') {
    return `🚧 Cruzou Limite: ${point.boundary_alert_details || 'Área desconhecida'}`;
  }
  if ((point.movement_score ?? 0) >= 80) {
    return `🏃 Movimento Rápido (${point.distance_moved_meters?.toFixed(0)}m)`;
  }
  if (point.is_moving === 0) return '⏸️ Dispositivo Parado';
  return null;
}

// Função para obter o nível de severidade
function getEventSeverity(point: GPSPoint): number {
  if (point.mandown_alert === 1) return 5; // CRÍTICO
  if (point.button1_pressed === 1 || point.button2_pressed === 1 || point.button3_pressed === 1) return 4; // ALTO
  if (point.tamper_alert === 1) return 3; // MÉDIO-ALTO
  if (point.alarm1_value === 1 || point.alarm2_value === 1) return 3; // MÉDIO
  if (point.has_geofence_alert === 1) return 2; // BAIXO-MÉDIO
  if ((point.movement_score ?? 0) >= 80) return 1; // INFORMATIVO
  return 0; // SEM EVENTO
}

// Função para obter ícone do evento
function getEventIcon(eventType: string | null): string {
  switch (eventType) {
    case 'MANDOWN': return '🚨';
    case 'PANIC_BUTTON': return '🔴';
    case 'TAMPER': return '⚠️';
    case 'ALARM1':
    case 'ALARM2': return '🔔';
    case 'BOUNDARY_CROSSED': return '🚧';
    case 'HIGH_MOVEMENT': return '🏃';
    case 'STOPPED': return '⏸️';
    default: return '📍';
  }
}

// =====================================
// 📦 INTERFACES
// =====================================
interface GPSPoint {
  dev_eui: string;
  timestamp: string;
  gps_latitude: number | string;
  gps_longitude: number | string;
  gps_accuracy: number;
  battery_level?: number;
  dynamic_motion_state?: string;
  Item_Name?: string;
  
  // 🚨 Campos de Eventos e Alertas
  geofence_status?: string;
  has_geofence_alert?: number;
  boundary_alert_details?: string;
  alarm1_value?: number;
  alarm2_value?: number;
  mandown_alert?: number;
  tamper_alert?: number;
  button1_pressed?: number;
  button2_pressed?: number;
  button3_pressed?: number;
  alert_status?: string;
  alert_severity_score?: number;
  has_any_alert?: number;
  
  // 🏃 Movimento
  distance_moved_meters?: number;
  movement_category?: string;
  movement_score?: number;
  is_moving?: number;
  
  // 📍 Localização
  zone_name?: string;
  area_name?: string;
  
  // 🎯 Campos calculados para eventos
  event_type?: string;
  event_color?: string;
  event_description?: string;
  event_severity?: number;
}

interface MapTrackingModalProps {
  isOpen: boolean;
  onClose: () => void;
  deviceCode: string;
  deviceName?: string;
  photoUrl?: string;
}

// =====================================
// 🎯 COMPONENTES AUXILIARES
// =====================================

// Componente para ajustar o mapa aos bounds - MELHORADO
function MapBounds({ positions }: { positions: [number, number][] }) {
  const map = useMap();

  useEffect(() => {
    if (positions.length > 0) {
      try {
        const bounds = L.latLngBounds(positions);
        map.fitBounds(bounds, {
          padding: [60, 60],
          maxZoom: 19, // Zoom muito mais próximo
          animate: true,
          duration: 1.5
        });
      } catch (error) {
        console.error('Error fitting bounds:', error);
      }
    }
  }, [positions, map]);

  return null;
}

// Componente para controlar o zoom automático - MELHORADO
function AutoZoom({
  position,
  isPlaying,
  isDragging,
  autoZoomEnabled
}: {
  position: [number, number] | null;
  isPlaying: boolean;
  isDragging: boolean;
  autoZoomEnabled: boolean;
}) {
  const map = useMap();
  const lastPositionRef = useRef<[number, number] | null>(null);
  const zoomTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (!autoZoomEnabled || !position) return;

    if (isFirstRender.current) {
      isFirstRender.current = false;
      lastPositionRef.current = position;
      return;
    }

    const shouldApplyZoom = () => {
      if (!lastPositionRef.current) return true;
      const distance = L.latLng(position).distanceTo(L.latLng(lastPositionRef.current));
      return distance > 5; // Mais sensível
    };

    const getOptimalZoom = (): number => {
      if (isDragging) return 19; // Muito mais próximo
      if (isPlaying) return 19; // Muito mais próximo
      return 19; // Muito mais próximo
    };

    if (shouldApplyZoom()) {
      if (zoomTimeoutRef.current) {
        clearTimeout(zoomTimeoutRef.current);
      }

      zoomTimeoutRef.current = setTimeout(() => {
        try {
          const targetZoom = getOptimalZoom();
          const duration = isPlaying ? 0.8 : 1.2;

          map.setView(position, targetZoom, {
            animate: true,
            duration,
            easeLinearity: 0.2
          });

          lastPositionRef.current = position;
        } catch (error) {
          console.error('Error in AutoZoom:', error);
        }
      }, isPlaying ? 50 : 0);
    }

    return () => {
      if (zoomTimeoutRef.current) {
        clearTimeout(zoomTimeoutRef.current);
      }
    };
  }, [position, isPlaying, isDragging, autoZoomEnabled, map]);

  return null;
}

// Componente para adicionar setas decorativas na rota - MELHORADO
function RouteArrows({ positions }: { positions: [number, number][] }) {
  const map = useMap();
  const decoratorRef = useRef<any>(null);

  useEffect(() => {
    if (positions.length > 1 && map) {
      try {
        // Remover decorator anterior
        if (decoratorRef.current) {
          map.removeLayer(decoratorRef.current);
          decoratorRef.current = null;
        }

        // Criar polyline invisível para o decorator
        const polyline = L.polyline(positions, {
          color: 'transparent',
          weight: 0,
        });

        // Criar decorator com setas - VISUAL MELHORADO
        const decorator = (L as any).polylineDecorator(polyline, {
          patterns: [
            {
              offset: '5%',
              repeat: 60, // Mais setas
              symbol: (L.Symbol as any).arrowHead({
                pixelSize: 15, // Setas maiores
                polygon: false,
                pathOptions: {
                  stroke: true,
                  weight: 3,
                  color: '#fbbf24', // Dourado
                  opacity: 0.9,
                }
              })
            }
          ]
        }).addTo(map);

        decoratorRef.current = decorator;

        return () => {
          if (decoratorRef.current) {
            try {
              map.removeLayer(decoratorRef.current);
            } catch (e) {
              console.warn('Error removing decorator:', e);
            }
          }
        };
      } catch (error) {
        console.error('Error creating route arrows:', error);
      }
    }
  }, [positions, map]);

  return null;
}

// Componente de controles de zoom - MELHORADO
function ZoomControls({
  autoZoomEnabled,
  onAutoZoomToggle,
  mapType,
  onMapTypeChange
}: {
  autoZoomEnabled: boolean;
  onAutoZoomToggle: (enabled: boolean) => void;
  mapType: keyof typeof MAP_TYPES;
  onMapTypeChange: (type: keyof typeof MAP_TYPES) => void;
}) {
  const map = useMap();
  const [showMapTypes, setShowMapTypes] = useState(false);

  return (
    <>
      <div className="leaflet-top leaflet-right">
        <div className="leaflet-control leaflet-bar flex flex-col bg-white rounded-lg shadow-xl border-2 border-gray-300 overflow-hidden">
          <button
            onClick={() => map.zoomIn()}
            className="flex items-center justify-center w-12 h-12 hover:bg-blue-50 transition-all duration-200 border-b-2 border-gray-200"
            title="Aumentar Zoom"
          >
            <MagnifyingGlassPlusIcon className="h-5 w-5 text-gray-700" />
          </button>

          <button
            onClick={() => map.zoomOut()}
            className="flex items-center justify-center w-12 h-12 hover:bg-blue-50 transition-all duration-200 border-b-2 border-gray-200"
            title="Diminuir Zoom"
          >
            <MagnifyingGlassMinusIcon className="h-5 w-5 text-gray-700" />
          </button>

          <button
            onClick={() => onAutoZoomToggle(!autoZoomEnabled)}
            className={`flex items-center justify-center w-12 h-12 transition-all duration-200 border-b-2 border-gray-200 ${
              autoZoomEnabled
                ? 'bg-gradient-to-br from-green-100 to-emerald-100 text-green-700 hover:from-green-200 hover:to-emerald-200'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
            title={autoZoomEnabled ? 'Desativar Auto Zoom' : 'Ativar Auto Zoom'}
          >
            <div className="flex flex-col items-center">
              <span className="text-sm font-bold">A</span>
              <div className={`w-3 h-1.5 rounded-full mt-0.5 ${autoZoomEnabled ? 'bg-green-500' : 'bg-gray-400'}`}></div>
            </div>
          </button>

          <button
            onClick={() => setShowMapTypes(!showMapTypes)}
            className="flex items-center justify-center w-12 h-12 bg-white text-gray-700 hover:bg-blue-50 transition-all duration-200"
            title="Tipo de Mapa"
          >
            <MapIcon className="h-5 w-5" />
          </button>
        </div>
      </div>

      {showMapTypes && (
        <div
          className="leaflet-top leaflet-right"
          style={{
            marginTop: '200px',
            marginRight: '10px'
          }}
        >
          <div className="leaflet-control leaflet-bar bg-white rounded-lg shadow-xl border-2 border-gray-300 p-4 min-w-[180px]">
            <div className="text-sm font-bold text-gray-800 mb-3 pb-2 border-b-2 border-gray-200 flex items-center gap-2">
              <MapIcon className="h-4 w-4" />
              Tipo de Mapa
            </div>
            <div className="space-y-2">
              {(Object.keys(MAP_TYPES) as Array<keyof typeof MAP_TYPES>).map((type) => (
                <button
                  key={type}
                  onClick={() => {
                    onMapTypeChange(type);
                    setShowMapTypes(false);
                  }}
                  className={`w-full text-left px-4 py-2.5 text-sm rounded-lg transition-all duration-200 flex items-center gap-3 ${
                    mapType === type
                      ? 'bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 font-semibold border-2 border-blue-300 shadow-md'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900 border-2 border-transparent'
                  }`}
                >
                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                    mapType === type ? 'bg-blue-500 border-blue-500' : 'bg-white border-gray-400'
                  }`}>
                    {mapType === type && (
                      <div className="w-2 h-2 rounded-full bg-white"></div>
                    )}
                  </div>
                  <span>{MAP_TYPES[type].name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// Função para encontrar o ponto mais próximo na linha
function findClosestPointOnLine(
  point: [number, number],
  line: [number, number][]
): { point: [number, number], index: number, distance: number } {
  let closestPoint: [number, number] = line[0];
  let closestIndex = 0;
  let minDistance = Number.MAX_VALUE;

  for (let i = 0; i < line.length - 1; i++) {
    const segmentStart = line[i];
    const segmentEnd = line[i + 1];

    const projected = projectPointOnSegment(point, segmentStart, segmentEnd);
    const distance = L.latLng(point).distanceTo(L.latLng(projected));

    if (distance < minDistance) {
      minDistance = distance;
      closestPoint = projected;
      closestIndex = i;
    }
  }

  let exactClosestIndex = 0;
  let exactMinDistance = Number.MAX_VALUE;

  line.forEach((linePoint, index) => {
    const distance = L.latLng(point).distanceTo(L.latLng(linePoint));
    if (distance < exactMinDistance) {
      exactMinDistance = distance;
      exactClosestIndex = index;
    }
  });

  if (exactMinDistance < 10) {
    return {
      point: line[exactClosestIndex],
      index: exactClosestIndex,
      distance: exactMinDistance
    };
  }

  return {
    point: closestPoint,
    index: closestIndex,
    distance: minDistance
  };
}

// Função para projetar um ponto em um segmento de linha
function projectPointOnSegment(
  point: [number, number],
  segmentStart: [number, number],
  segmentEnd: [number, number]
): [number, number] {
  const x = point[1], y = point[0];
  const x1 = segmentStart[1], y1 = segmentStart[0];
  const x2 = segmentEnd[1], y2 = segmentEnd[0];

  const dx = x2 - x1;
  const dy = y2 - y1;

  const px = x - x1;
  const py = y - y1;

  const dot = px * dx + py * dy;
  const lenSq = dx * dx + dy * dy;

  let param = 0;
  if (lenSq !== 0) {
    param = dot / lenSq;
  }

  param = Math.max(0, Math.min(1, param));

  const projectedX = x1 + param * dx;
  const projectedY = y1 + param * dy;

  return [projectedY, projectedX];
}

// Componente para o marcador draggable que segue a linha - MELHORADO
function DraggableRouteMarker({
  positions,
  currentPointIndex,
  onIndexChange,
  validData,
  onDraggingChange
}: {
  positions: [number, number][];
  currentPointIndex: number;
  onIndexChange: (index: number) => void;
  validData: any[];
  onDraggingChange: (dragging: boolean) => void;
}) {
  const markerRef = useRef<L.Marker | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    if (markerRef.current && positions[currentPointIndex] && !isDragging) {
      markerRef.current.setLatLng(positions[currentPointIndex]);
    }
  }, [currentPointIndex, positions, isDragging]);

  const handleDrag = (e: L.DragEndEvent) => {
    const marker = e.target;
    const position = marker.getLatLng();
    const draggedPosition: [number, number] = [position.lat, position.lng];

    const closest = findClosestPointOnLine(draggedPosition, positions);
    marker.setLatLng(closest.point);

    let newIndex = 0;
    let minDistance = Number.MAX_VALUE;

    positions.forEach((pos, index) => {
      const distance = L.latLng(closest.point).distanceTo(L.latLng(pos));
      if (distance < minDistance) {
        minDistance = distance;
        newIndex = index;
      }
    });

    if (newIndex !== currentPointIndex) {
      onIndexChange(newIndex);
    }
  };

  const handleDragStart = () => {
    setIsDragging(true);
    onDraggingChange(true);
  };

  const handleDragEnd = (e: L.DragEndEvent) => {
    setIsDragging(false);
    onDraggingChange(false);
    handleDrag(e);
  };

  if (!positions[currentPointIndex]) return null;

  const currentPoint = validData[currentPointIndex];
  const timeSinceStart = new Date(currentPoint.timestamp).getTime() - new Date(validData[0].timestamp).getTime();
  const minutes = Math.floor(timeSinceStart / 60000);

  return (
    <Marker
      position={positions[currentPointIndex]}
      icon={playerIcon}
      draggable={true}
      ref={markerRef}
      eventHandlers={{
        dragstart: handleDragStart,
        dragend: handleDragEnd,
      }}
      autoPan={true}
    >
      <Popup className="custom-popup">
        <div className="p-3">
          <div className="flex items-center gap-2 mb-3 pb-2 border-b-2 border-yellow-200">
            <span className="text-2xl">📍</span>
            <strong className="text-base text-gray-900">Posição Atual</strong>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2 bg-blue-50 p-2 rounded-md">
              <ClockIcon className="h-4 w-4 text-blue-600" />
              <span className="text-gray-700">{new Date(currentPoint.timestamp).toLocaleString('pt-BR')}</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-gray-50 p-2 rounded">
                <div className="text-gray-600">Latitude</div>
                <div className="font-semibold text-gray-900">{currentPoint.gps_latitude.toFixed(6)}</div>
              </div>
              <div className="bg-gray-50 p-2 rounded">
                <div className="text-gray-600">Longitude</div>
                <div className="font-semibold text-gray-900">{currentPoint.gps_longitude.toFixed(6)}</div>
              </div>
            </div>
            <div className="bg-green-50 p-2 rounded-md">
              <div className="text-xs text-gray-600">Precisão GPS</div>
              <div className="font-semibold text-green-700">{currentPoint.gps_accuracy}m</div>
            </div>
            <div className="bg-purple-50 p-2 rounded-md">
              <div className="text-xs text-gray-600">Progresso</div>
              <div className="font-semibold text-purple-700">
                {currentPointIndex + 1} de {validData.length} pontos
              </div>
            </div>
            <div className="bg-orange-50 p-2 rounded-md">
              <div className="text-xs text-gray-600">Tempo decorrido</div>
              <div className="font-semibold text-orange-700">{minutes} minutos</div>
            </div>
            <div className="mt-3 pt-2 border-t-2 border-yellow-200 text-center">
              <div className="flex items-center justify-center gap-2 text-green-600 font-medium text-xs">
                <HandThumbUpIcon className="h-4 w-4" />
                <span>Arraste para navegar</span>
              </div>
            </div>
          </div>
        </div>
      </Popup>
    </Marker>
  );
}

// =====================================
// 🗺️ COMPONENTE PRINCIPAL
// =====================================
const MapTrackingModal: React.FC<MapTrackingModalProps> = ({
  isOpen,
  onClose,
  deviceCode,
  deviceName = 'Trabalhador',
  photoUrl
}) => {
  const { companyId } = useCompany();

  const [data, setData] = useState<GPSPoint[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentPointIndex, setCurrentPointIndex] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState(2); // Velocidade padrão 2x
  const [progress, setProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [autoZoomEnabled, setAutoZoomEnabled] = useState(true);
  const [mapType, setMapType] = useState<keyof typeof MAP_TYPES>('satellite');
  const [mapReady, setMapReady] = useState(false);
  const [autoPlayTriggered, setAutoPlayTriggered] = useState(false);

  const playbackIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // =====================================
  // 📡 BUSCAR DADOS GPS
  // =====================================
  const fetchGPSRoute = useCallback(async () => {
    if (!deviceCode || !companyId) return;

    setLoading(true);
    setError(null);
    setMapReady(false);
    setAutoPlayTriggered(false);

    try {
      const now = new Date();
      const twelveHoursAgo = new Date(now.getTime() - 12 * 60 * 60 * 1000);

      const params = new URLSearchParams({
        dev_uid: deviceCode,
        start_date: twelveHoursAgo.toISOString(),
        end_date: now.toISOString(),
        limit: '500',
        sortBy: 'timestamp',
        sortOrder: 'ASC',
        valid_gps_only: 'true',
        max_accuracy: '100',
      });

      // 🎯 Nova API com eventos incluídos!
      const response = await fetch(
        `https://apinode.smartxhub.cloud/api/dashboard/devices/${companyId}/gps-route?${params}`
      );

      if (!response.ok) {
        throw new Error('Falha ao carregar rota GPS');
      }

      const result = await response.json();

      if (result.success && result.data && result.data.length > 0) {
        console.log('📍 GPS Data loaded:', result.data.length, 'points');
        console.log('🎯 Sample point with events:', result.data[0]);
        setData(result.data);
        resetPlayer();
        
        setTimeout(() => {
          setMapReady(true);
          window.dispatchEvent(new Event('resize'));
        }, 300);
      } else {
        setData([]);
        setError('Nenhum dado GPS encontrado nas últimas 12 horas');
      }
    } catch (err) {
      console.error('Error fetching GPS route:', err);
      setError(err instanceof Error ? err.message : 'Erro ao carregar rota');
    } finally {
      setLoading(false);
    }
  }, [deviceCode, companyId]);

  useEffect(() => {
    if (isOpen && deviceCode) {
      setMapReady(false);
      setData([]);
      setAutoPlayTriggered(false);
      fetchGPSRoute();
    }

    return () => {
      if (playbackIntervalRef.current) {
        clearInterval(playbackIntervalRef.current);
      }
      setMapReady(false);
      setAutoPlayTriggered(false);
    };
  }, [isOpen, deviceCode, fetchGPSRoute]);

  // Auto-play quando o mapa estiver pronto
  useEffect(() => {
    if (mapReady && validData.length > 0 && !autoPlayTriggered) {
      setTimeout(() => {
        startPlayback();
        setAutoPlayTriggered(true);
      }, 1000); // Aguarda 1 segundo após o mapa estar pronto
    }
  }, [mapReady, autoPlayTriggered]);

  // Force resize do mapa quando os dados estiverem prontos
  useEffect(() => {
    if (mapReady && validData.length > 0) {
      console.log('🗺️ Mapa pronto para renderizar:', {
        center,
        positions: positions.length,
        validData: validData.length
      });
      
      const timer = setTimeout(() => {
        window.dispatchEvent(new Event('resize'));
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [mapReady]);

  // =====================================
  // 🎮 CONTROLES DO PLAYER
  // =====================================
  
  const startPlayback = () => {
    if (validData.length === 0) return;

    setIsPlaying(true);
    playbackIntervalRef.current = setInterval(() => {
      setCurrentPointIndex(prev => {
        const nextIndex = prev + 1;
        if (nextIndex >= validData.length) {
          stopPlayback();
          return prev;
        }
        setProgress((nextIndex / (validData.length - 1)) * 100);
        return nextIndex;
      });
    }, 1000 / playbackSpeed);
  };

  const pausePlayback = () => {
    setIsPlaying(false);
    if (playbackIntervalRef.current) {
      clearInterval(playbackIntervalRef.current);
      playbackIntervalRef.current = null;
    }
  };

  const stopPlayback = () => {
    setIsPlaying(false);
    setCurrentPointIndex(0);
    setProgress(0);
    if (playbackIntervalRef.current) {
      clearInterval(playbackIntervalRef.current);
      playbackIntervalRef.current = null;
    }
  };

  const resetPlayer = () => {
    stopPlayback();
    setCurrentPointIndex(0);
    setProgress(0);
  };

  const goToPoint = (index: number) => {
    const newIndex = Math.max(0, Math.min(index, validData.length - 1));
    setCurrentPointIndex(newIndex);
    setProgress((newIndex / (validData.length - 1)) * 100);
  };

  const nextPoint = () => {
    if (currentPointIndex < validData.length - 1) {
      const newIndex = currentPointIndex + 1;
      setCurrentPointIndex(newIndex);
      setProgress((newIndex / (validData.length - 1)) * 100);
    }
  };

  const previousPoint = () => {
    if (currentPointIndex > 0) {
      const newIndex = currentPointIndex - 1;
      setCurrentPointIndex(newIndex);
      setProgress((newIndex / (validData.length - 1)) * 100);
    }
  };

  const handleMarkerIndexChange = (newIndex: number) => {
    goToPoint(newIndex);
    if (isPlaying) {
      pausePlayback();
    }
  };

  const handleDraggingChange = (dragging: boolean) => {
    setIsDragging(dragging);
  };

  // =====================================
  // 📊 PROCESSAR DADOS
  // =====================================
  const processedData = data.map(point => ({
    ...point,
    gps_latitude: typeof point.gps_latitude === 'string'
      ? parseFloat(point.gps_latitude)
      : point.gps_latitude,
    gps_longitude: typeof point.gps_longitude === 'string'
      ? parseFloat(point.gps_longitude)
      : point.gps_longitude,
    timestamp: point.timestamp //point.event_timestamp, // Suportar ambos os nomes
  }));

  const validData = processedData.filter(
    point => 
      !isNaN(point.gps_latitude) && 
      !isNaN(point.gps_longitude) &&
      point.gps_latitude !== 0 &&
      point.gps_longitude !== 0 &&
      Math.abs(point.gps_latitude) <= 90 &&
      Math.abs(point.gps_longitude) <= 180
  );

  const positions: [number, number][] = validData.map(point => [
    point.gps_latitude,
    point.gps_longitude
  ]);

  const currentPosition = validData[currentPointIndex]
    ? [validData[currentPointIndex].gps_latitude, validData[currentPointIndex].gps_longitude] as [number, number]
    : null;

  const defaultCenter: [number, number] = [-2.4833, -44.2167];
  const center = positions.length > 0 ? positions[0] : defaultCenter;

  // =====================================
  // 🎨 RENDERIZAÇÃO
  // =====================================
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-white/10 backdrop-blur-md flex items-center justify-center p-6" 
      style={{ 
        zIndex: 9999,
        background: 'rgba(255, 255, 255, 0.05)',
        backdropFilter: 'blur(12px) saturate(180%)',
        WebkitBackdropFilter: 'blur(12px) saturate(180%)',
      }}
      onClick={onClose}
    >
      <div 
        className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl overflow-hidden flex flex-col w-full max-w-[95vw] h-[92vh] border border-white/20"
        style={{
          boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37), inset 0 0 0 1px rgba(255, 255, 255, 0.18)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Compacto */}
        <div className="bg-gradient-to-r from-green-600 via-emerald-600 to-blue-600 px-4 py-2 shadow-lg rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {photoUrl ? (
                <div className="relative">
                  <img
                    src={photoUrl}
                    alt={deviceName}
                    className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-lg"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                    }}
                  />
                  <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 rounded-full border-2 border-white"></div>
                </div>
              ) : (
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center shadow-lg">
                  <span className="text-2xl">👷</span>
                </div>
              )}
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <MapPinIcon className="h-5 w-5" />
                  {deviceName}
                </h2>
                <p className="text-xs text-white/90 flex items-center gap-1.5">
                  <ClockIcon className="h-3 w-3" />
                  Últimas 12h • {deviceCode}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={fetchGPSRoute}
                disabled={loading}
                className="p-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-all duration-200 disabled:opacity-50 backdrop-blur-sm shadow-md"
                title="Atualizar"
              >
                <ArrowPathIcon className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
              </button>
              <button
                onClick={onClose}
                className="p-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-all duration-200 backdrop-blur-sm shadow-md"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Player Controls Compacto */}
        {validData.length > 0 && (
          <>
            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border-b border-yellow-200 px-4 py-2 shadow-inner">
            <div className="flex items-center justify-between gap-4">
              {/* Controles principais */}
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5 bg-white rounded-lg px-2 py-1 shadow-md">
                  <button
                    onClick={previousPoint}
                    disabled={currentPointIndex === 0}
                    className="p-1.5 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    title="Anterior"
                  >
                    <BackwardIcon className="h-4 w-4 text-gray-700" />
                  </button>

                  {!isPlaying ? (
                    <button
                      onClick={startPlayback}
                      className="p-2 rounded-lg bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:from-green-600 hover:to-emerald-600 shadow-md transition-all"
                      title="Reproduzir"
                    >
                      <PlayIcon className="h-4 w-4" />
                    </button>
                  ) : (
                    <button
                      onClick={pausePlayback}
                      className="p-2 rounded-lg bg-gradient-to-r from-yellow-500 to-orange-500 text-white hover:from-yellow-600 hover:to-orange-600 shadow-md transition-all"
                      title="Pausar"
                    >
                      <PauseIcon className="h-4 w-4" />
                    </button>
                  )}

                  <button
                    onClick={stopPlayback}
                    className="p-1.5 rounded-lg bg-gradient-to-r from-red-500 to-rose-500 text-white hover:from-red-600 hover:to-rose-600 shadow-md transition-all"
                    title="Parar"
                  >
                    <StopIcon className="h-4 w-4" />
                  </button>

                  <button
                    onClick={nextPoint}
                    disabled={currentPointIndex === validData.length - 1}
                    className="p-1.5 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    title="Próximo"
                  >
                    <ForwardIcon className="h-4 w-4 text-gray-700" />
                  </button>
                </div>

                <select
                  value={playbackSpeed}
                  onChange={(e) => {
                    setPlaybackSpeed(Number(e.target.value));
                    if (isPlaying) {
                      pausePlayback();
                      setTimeout(() => startPlayback(), 100);
                    }
                  }}
                  className="px-3 py-1.5 border border-gray-300 rounded-lg text-xs font-semibold bg-white shadow-md hover:border-blue-400 transition-all"
                >
                  <option value={0.5}>🐢 0.5x</option>
                  <option value={1}>🚶 1x</option>
                  <option value={2}>🏃 2x</option>
                  <option value={5}>🚀 5x</option>
                  <option value={10}>⚡ 10x</option>
                </select>

                <div className="text-sm font-bold text-gray-800 bg-white px-3 py-1.5 rounded-lg shadow-md">
                  {currentPointIndex + 1}/{validData.length}
                </div>
              </div>

              {/* Barra de progresso */}
              <div className="flex-1 max-w-xl">
                <div className="flex justify-between text-xs font-medium text-gray-700 mb-1">
                  <span>🟢 {new Date(validData[0].timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
                  <span className="text-blue-600">📍 {new Date(validData[currentPointIndex].timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
                  <span>🔴 {new Date(validData[validData.length - 1].timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max={validData.length - 1}
                  value={currentPointIndex}
                  onChange={(e) => {
                    goToPoint(Number(e.target.value));
                    if (isPlaying) pausePlayback();
                  }}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider-thumb"
                  style={{
                    background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${progress}%, #e5e7eb ${progress}%, #e5e7eb 100%)`
                  }}
                />
              </div>

              {/* Stats rápidas */}
              <div className="flex items-center gap-3 text-xs">
                <div className="bg-white rounded-lg px-3 py-1.5 shadow-md border border-blue-100 text-center">
                  <div className="text-gray-600 font-medium">Pontos</div>
                  <div className="text-sm font-bold text-blue-600">{validData.length}</div>
                </div>
                <div className="bg-white rounded-lg px-3 py-1.5 shadow-md border border-green-100 text-center">
                  <div className="text-gray-600 font-medium">Precisão</div>
                  <div className="text-sm font-bold text-green-600">
                    {(validData.reduce((sum, p) => sum + p.gps_accuracy, 0) / validData.length).toFixed(0)}m
                  </div>
                </div>
              </div>
            </div>

            {/* Legenda de Eventos */}
            <div className="bg-gradient-to-r from-gray-50 to-slate-50 border-b border-gray-200 px-4 py-2">
              <div className="flex flex-wrap items-center justify-center gap-4 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-red-600 border-2 border-white shadow-md"></div>
                  <span className="text-gray-700 font-medium">🚨 Emergência</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-orange-500 border-2 border-white shadow-md"></div>
                  <span className="text-gray-700 font-medium">⚠️ Alerta</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-blue-500 border-2 border-white shadow-md"></div>
                  <span className="text-gray-700 font-medium">🚧 Geofence</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-green-500 border-2 border-white shadow-md"></div>
                  <span className="text-gray-700 font-medium">🏃 Movimento</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-gray-500 border-2 border-white shadow-md"></div>
                  <span className="text-gray-700 font-medium">⏸️ Parado</span>
                </div>
              </div>
            </div>
            </div>
          </>
        )}

        {/* Map Container - ALTURA MÁXIMA */}
        <div className="flex-1 relative">
          {loading ? (
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50">
              <div className="text-center">
                <div className="relative">
                  <div className="animate-spin rounded-full h-20 w-20 border-b-4 border-blue-600 mx-auto mb-4"></div>
                  <MapPinIcon className="h-8 w-8 text-blue-600 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
                </div>
                <p className="text-gray-700 font-semibold text-lg">Carregando rota GPS...</p>
                <p className="text-gray-500 text-sm mt-2">Aguarde um momento</p>
              </div>
            </div>
          ) : error ? (
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-red-50 to-rose-50">
              <div className="text-center">
                <MapPinIcon className="h-20 w-20 text-red-500 mx-auto mb-4" />
                <p className="text-red-600 font-bold text-lg">{error}</p>
                <button
                  onClick={fetchGPSRoute}
                  className="mt-6 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 font-semibold shadow-lg transition-all duration-200"
                >
                  Tentar Novamente
                </button>
              </div>
            </div>
          ) : validData.length === 0 ? (
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-50 to-slate-50">
              <div className="text-center">
                <MapPinIcon className="h-20 w-20 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-700 font-bold text-lg">Nenhuma rota encontrada</p>
                <p className="text-gray-500 text-sm mt-2">
                  Não há dados GPS válidos nas últimas 12 horas
                </p>
              </div>
            </div>
          ) : mapReady ? (
            <div className="absolute inset-0">
              <MapContainer
                center={center}
                zoom={19} // Zoom máximo inicial
                maxZoom={22}
                zoomControl={false}
                style={{ height: '100%', width: '100%' }}
                className="rounded-b-2xl shadow-lg z-0"
                key={`map-${deviceCode}-${validData.length}`}
              >
                <TileLayer
                  attribution={MAP_TYPES[mapType].attribution}
                  url={MAP_TYPES[mapType].url}
                  maxNativeZoom={MAP_TYPES[mapType].maxNativeZoom}
                  maxZoom={MAP_TYPES[mapType].maxZoom}
                />

                <ZoomControls
                  autoZoomEnabled={autoZoomEnabled}
                  onAutoZoomToggle={setAutoZoomEnabled}
                  mapType={mapType}
                  onMapTypeChange={setMapType}
                />

                <AutoZoom
                  position={currentPosition}
                  isPlaying={isPlaying}
                  isDragging={isDragging}
                  autoZoomEnabled={autoZoomEnabled}
                />

                {(!isPlaying && !isDragging) && <MapBounds positions={positions} />}

                {positions.length > 1 && (
                  <Polyline
                    positions={positions}
                    pathOptions={{
                      color: '#3b82f6',
                      weight: 8,
                      opacity: 0.9,
                      lineCap: 'round',
                      lineJoin: 'round',
                    }}
                  />
                )}

                {positions.length > 1 && <RouteArrows positions={positions} />}

                <DraggableRouteMarker
                  positions={positions}
                  currentPointIndex={currentPointIndex}
                  onIndexChange={handleMarkerIndexChange}
                  validData={validData}
                  onDraggingChange={handleDraggingChange}
                />

                {validData.map((point, index) => {
                  const isStart = index === 0;
                  const isEnd = index === validData.length - 1;
                  const eventType = getEventType(point);
                  const hasEvent = eventType !== null;
                  const eventColor = getEventColor(point);
                  const eventDescription = getEventDescription(point);
                  const eventSeverity = getEventSeverity(point);

                  // Renderizar marcador de evento importante ou pontos especiais
                  if (!isStart && !isEnd && !hasEvent && index % 20 !== 0) return null;

                  let color = isStart ? '#22c55e' : isEnd ? '#ef4444' : '#3b82f6';
                  let radius = isStart || isEnd ? 10 : 5;
                  
                  // Se tem evento, usar cor e tamanho do evento
                  if (hasEvent) {
                    color = eventColor;
                    radius = eventSeverity >= 3 ? 12 : eventSeverity >= 2 ? 9 : 6;
                  }

                  return (
                    <CircleMarker
                      key={`marker-${index}`}
                      center={[point.gps_latitude, point.gps_longitude]}
                      radius={radius}
                      pathOptions={{
                        color,
                        fillColor: color,
                        fillOpacity: hasEvent ? 0.8 : 0.7,
                        weight: hasEvent ? 3 : 2,
                      }}
                    >
                      <Popup>
                        <div className="p-3 min-w-[250px]">
                          <strong className="text-base flex items-center gap-2">
                            {isStart ? '🟢 Início' : isEnd ? '🔴 Fim' : hasEvent ? getEventIcon(eventType) : '📍'} 
                            {isStart ? 'Início da Jornada' : isEnd ? 'Fim da Jornada' : `Ponto ${index + 1}`}
                          </strong>
                          
                          {/* Mostrar descrição do evento se houver */}
                          {hasEvent && eventDescription && (
                            <div className={`mt-2 p-2 rounded-md font-semibold text-sm ${
                              eventSeverity >= 4 ? 'bg-red-100 text-red-800' :
                              eventSeverity >= 3 ? 'bg-orange-100 text-orange-800' :
                              eventSeverity >= 2 ? 'bg-blue-100 text-blue-800' :
                              'bg-green-100 text-green-800'
                            }`}>
                              {eventDescription}
                            </div>
                          )}
                          
                          <div className="mt-2 text-sm space-y-1">
                            <div><strong>Hora:</strong> {new Date(point.timestamp).toLocaleString('pt-BR')}</div>
                            <div><strong>Latitude:</strong> {point.gps_latitude.toFixed(6)}</div>
                            <div><strong>Longitude:</strong> {point.gps_longitude.toFixed(6)}</div>
                            <div><strong>Precisão:</strong> {point.gps_accuracy}m</div>
                            
                            {/* Informações adicionais se houver */}
                            {point.zone_name && (
                              <div><strong>Zona:</strong> {point.zone_name}</div>
                            )}
                            {point.area_name && (
                              <div><strong>Área:</strong> {point.area_name}</div>
                            )}
                            {point.distance_moved_meters !== undefined && point.distance_moved_meters > 0 && (
                              <div><strong>Distância Movida:</strong> {point.distance_moved_meters.toFixed(0)}m</div>
                            )}
                            
                            {/* Mostrar alertas ativos */}
                            {hasEvent && (
                              <div className="mt-2 pt-2 border-t border-gray-200">
                                <div className="text-xs font-semibold text-gray-600 mb-1">Status de Alertas:</div>
                                <div className="space-y-1 text-xs">
                                  {point.mandown_alert === 1 && (
                                    <div className="text-red-700">🚨 Queda Detectada</div>
                                  )}
                                  {(point.button1_pressed === 1 || point.button2_pressed === 1 || point.button3_pressed === 1) && (
                                    <div className="text-red-700">🔴 Botão de Pânico Ativado</div>
                                  )}
                                  {point.tamper_alert === 1 && (
                                    <div className="text-orange-700">⚠️ Violação Detectada</div>
                                  )}
                                  {point.alarm1_value === 1 && (
                                    <div className="text-orange-700">🔔 Alarme 1 Ativo</div>
                                  )}
                                  {point.alarm2_value === 1 && (
                                    <div className="text-orange-700">🔔 Alarme 2 Ativo</div>
                                  )}
                                  {point.has_geofence_alert === 1 && (
                                    <div className="text-blue-700">🚧 Cruzou Geofence</div>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </Popup>
                    </CircleMarker>
                  );
                })}
              </MapContainer>
            </div>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50">
              <div className="text-center">
                <div className="animate-pulse">
                  <MapPinIcon className="h-20 w-20 text-blue-500 mx-auto mb-4" />
                </div>
                <p className="text-gray-700 font-semibold text-lg">Preparando mapa...</p>
              </div>
            </div>
          )}
        </div>
      

      <style>{`
        .slider-thumb::-webkit-slider-thumb {
          appearance: none;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: linear-gradient(135deg, #3b82f6, #1e40af);
          cursor: pointer;
          box-shadow: 0 2px 8px rgba(59, 130, 246, 0.5);
          border: 2px solid white;
        }

        .slider-thumb::-moz-range-thumb {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: linear-gradient(135deg, #3b82f6, #1e40af);
          cursor: pointer;
          box-shadow: 0 2px 8px rgba(59, 130, 246, 0.5);
          border: 2px solid white;
        }

        .custom-popup .leaflet-popup-content-wrapper {
          border-radius: 12px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
        }
      `}</style>
    </div>
    </div>
  )
};

export default MapTrackingModal;