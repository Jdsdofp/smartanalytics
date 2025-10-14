import { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, Popup, useMap, CircleMarker } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-polylinedecorator';
import {
  MapPinIcon,
  ArrowPathIcon,
  MagnifyingGlassIcon,
  CalendarIcon,
  FunnelIcon,
  XMarkIcon,
  PlayIcon,
  PauseIcon,
  StopIcon,
  ForwardIcon,
  BackwardIcon,
  HandThumbUpIcon,
  MagnifyingGlassPlusIcon,
  MagnifyingGlassMinusIcon,
} from '@heroicons/react/24/outline';


// Fix para ícones do Leaflet
// delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Ícones customizados
// const startIcon = new L.Icon({
//   iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
//   shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
//   iconSize: [25, 41],
//   iconAnchor: [12, 41],
//   popupAnchor: [1, -34],
//   shadowSize: [41, 41]
// });

// const endIcon = new L.Icon({
//   iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
//   shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
//   iconSize: [25, 41],
//   iconAnchor: [12, 41],
//   popupAnchor: [1, -34],
//   shadowSize: [41, 41]
// });

// const waypointIcon = new L.Icon({
//   iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
//   shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
//   iconSize: [20, 33],
//   iconAnchor: [10, 33],
//   popupAnchor: [1, -28],
//   shadowSize: [33, 33]
// });

// Ícone para o marcador de reprodução
const playerIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-gold.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

interface GPSPoint {
  dev_eui: string;
  timestamp: string;
  gps_latitude: string | number;
  gps_longitude: string | number;
  gps_accuracy: number;
}


// Componente para ajustar o mapa aos bounds
function MapBounds({ positions }: { positions: [number, number][] }) {
  const map = useMap();
  
  useEffect(() => {
    if (positions.length > 0) {
      const bounds = L.latLngBounds(positions);
      map.fitBounds(bounds, { 
        padding: [50, 50], 
        maxZoom: 15 // Zoom inicial mais conservador
      });
    }
  }, [positions, map]);
  
  return null;
}

// Componente para controlar o zoom automático - CORRIGIDO
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
  const lastZoomRef = useRef<number>(map.getZoom());
  const lastPositionRef = useRef<[number, number] | null>(null);
  const zoomTimeoutRef = useRef<any | null>(null);

  useEffect(() => {
    if (!autoZoomEnabled || !position) return;

    // Limpa timeout anterior
    if (zoomTimeoutRef.current) {
      clearTimeout(zoomTimeoutRef.current);
    }

    const currentZoom = map.getZoom();
    const shouldApplyZoom = () => {
      // Se não há posição anterior, aplica zoom
      if (!lastPositionRef.current) return true;
      
      // Calcula distância desde a última posição
      const distance = L.latLng(position).distanceTo(L.latLng(lastPositionRef.current));
      
      // Só aplica zoom se moveu significativamente (pelo menos 100 metros)
      // OU se é o início da reprodução/arraste
      return distance > 100 || isPlaying || isDragging;
    };

    if (shouldApplyZoom()) {
      // Define zoom baseado no modo
      let targetZoom: number;
      
      if (isDragging) {
        targetZoom = 17; // Zoom mais próximo durante arraste
      } else if (isPlaying) {
        targetZoom = 15; // Zoom médio durante reprodução
      } else {
        targetZoom = lastZoomRef.current; // Mantém zoom atual
      }

      // Só aplica zoom se for significativamente diferente do atual
      // E se não estiver muito recente
      if (Math.abs(currentZoom - targetZoom) >= 1) {
        // Pequeno delay para agrupar movimentos rápidos
        zoomTimeoutRef.current = setTimeout(() => {
          map.setView(position, targetZoom, {
            animate: true,
            duration: 1.5, // Animação um pouco mais lenta
            easeLinearity: 0.25
          });
          lastZoomRef.current = targetZoom;
        }, 300);
      } else {
        // Apenas centraliza sem mudar zoom
        map.panTo(position, {
          animate: true,
          duration: 1,
          easeLinearity: 0.25
        });
      }

      lastPositionRef.current = position;
    }

    return () => {
      if (zoomTimeoutRef.current) {
        clearTimeout(zoomTimeoutRef.current);
      }
    };
  }, [position, isPlaying, isDragging, autoZoomEnabled, map]);

  // Efeito para resetar quando desativar o auto zoom
  useEffect(() => {
    if (!autoZoomEnabled) {
      lastPositionRef.current = null;
      if (zoomTimeoutRef.current) {
        clearTimeout(zoomTimeoutRef.current);
      }
    }
  }, [autoZoomEnabled]);

  return null;
}

// Componente para adicionar setas decorativas na rota
function RouteArrows({ positions }: { positions: [number, number][] }) {
  const map = useMap();
  const decoratorRef = useRef<L.Polyline | null>(null);

  useEffect(() => {
    if (positions.length > 1 && map) {
      if (decoratorRef.current) {
        map.removeLayer(decoratorRef.current);
      }

      const polyline = L.polyline(positions, {
        color: 'transparent',
        weight: 0,
      });

      const decorator = L.polylineDecorator(polyline, {
        patterns: [
          {
            offset: '5%',
            repeat: 50,
            symbol: L.Symbol.arrowHead({
              pixelSize: 12,
              polygon: false,
              pathOptions: {
                stroke: true,
                weight: 2,
                color: '#1e40af',
                opacity: 0.8,
              }
            })
          }
        ]
      }).addTo(map);

      decoratorRef.current = decorator as any;

      return () => {
        if (decoratorRef.current) {
          map.removeLayer(decoratorRef.current);
        }
      };
    }
  }, [positions, map]);

  return null;
}

function ZoomControls({ 
  autoZoomEnabled, 
  onAutoZoomToggle 
}: { 
  autoZoomEnabled: boolean;
  onAutoZoomToggle: (enabled: boolean) => void;
}) {
  const map = useMap();
  
  return (
    <div className="leaflet-top leaflet-right">
      <div className="leaflet-control leaflet-bar flex flex-col">
        <button 
          className="leaflet-control-zoom-in"
          onClick={() => {
            map.zoomIn();
            // Quando usuário controla manualmente, desativa auto zoom temporariamente?
          }}
          style={{
            width: '30px',
            height: '30px',
            lineHeight: '30px',
            fontSize: '18px',
            fontWeight: 'bold',
            cursor: 'pointer',
            border: 'none',
            backgroundColor: 'white'
          }}
        >
          +
        </button>
        <button 
          className="leaflet-control-zoom-out"
          onClick={() => {
            map.zoomOut();
          }}
          style={{
            width: '30px',
            height: '30px',
            lineHeight: '30px',
            fontSize: '18px',
            fontWeight: 'bold',
            cursor: 'pointer',
            border: 'none',
            backgroundColor: 'white',
            borderTop: '1px solid #ccc'
          }}
        >
          -
        </button>
        <button 
          className={`leaflet-control-auto-zoom ${
            autoZoomEnabled ? 'bg-blue-500 text-white' : 'bg-white text-gray-700'
          }`}
          onClick={() => onAutoZoomToggle(!autoZoomEnabled)}
          style={{
            width: '30px',
            height: '30px',
            lineHeight: '30px',
            fontSize: '12px',
            fontWeight: 'bold',
            cursor: 'pointer',
            border: 'none',
            borderTop: '1px solid #ccc'
          }}
          title="Zoom Automático"
        >
          A
        </button>
      </div>
    </div>
  );
}

// Função para encontrar o ponto mais próximo na linha (projeção na polilinha)
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

// Componente para o marcador draggable que segue a linha
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
  // const map = useMap();
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

  return (
    <Marker
      position={positions[currentPointIndex]}
      icon={playerIcon}
      draggable={true}
      ref={markerRef}
      eventHandlers={{
        // drag: handleDrag,
        dragstart: handleDragStart,
        dragend: handleDragEnd,
      }}
      autoPan={true}
    >
      <Popup>
        <div className="p-2">
          <strong className="text-sm">🎯 Posição Atual do Player</strong>
          <div className="mt-2 text-xs space-y-1">
            <div><strong>Horário:</strong> {new Date(validData[currentPointIndex].timestamp).toLocaleString('pt-BR')}</div>
            <div><strong>Latitude:</strong> {validData[currentPointIndex].gps_latitude.toFixed(6)}</div>
            <div><strong>Longitude:</strong> {validData[currentPointIndex].gps_longitude.toFixed(6)}</div>
            <div><strong>Precisão:</strong> {validData[currentPointIndex].gps_accuracy}m</div>
            <div><strong>Progresso:</strong> {currentPointIndex + 1} de {validData.length}</div>
            <div className="mt-2 text-green-600 font-medium">
              💡 Arraste-me ao longo da linha azul!
            </div>
          </div>
        </div>
      </Popup>
    </Marker>
  );
}

const GPSRouteMapLeaflet = () => {
  const [data, setData] = useState<GPSPoint[]>([]);
  const [loading, setLoading] = useState(false);
  const [devEui, setDevEui] = useState('20635F0241000AB7');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [maxAccuracy, setMaxAccuracy] = useState('');
  const [limit, setLimit] = useState(200);
  const [showFilters, setShowFilters] = useState(false);
  
  // Estados para o player da rota
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentPointIndex, setCurrentPointIndex] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [progress, setProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [autoZoomEnabled, setAutoZoomEnabled] = useState(true);
  const playbackIntervalRef = useRef<any | null>(null);

  const fetchGPSRoute = async () => {
    if (!devEui) {
      alert('Por favor, insira um Device EUI');
      return;
    }

    setLoading(true);
    try {
      const params = new URLSearchParams({
        dev_eui: devEui,
        limit: limit.toString(),
        sortBy: 'timestamp',
        sortOrder: 'ASC',
        valid_gps_only: 'true',
      });

      if (startDate) params.append('start_date', startDate);
      if (endDate) params.append('end_date', endDate);
      if (maxAccuracy) params.append('max_accuracy', maxAccuracy);

      const response = await fetch(
        `https://api-dashboards-u1oh.onrender.com/api/dashboard/devices/gps-route/raw?${params}`
      );
      const result = await response.json();

      if (result.data && result.data.length > 0) {
        console.log('📍 GPS Data loaded:', result.data.length, 'points');
        setData(result.data);
        resetPlayer();
      } else {
        setData([]);
        alert('Nenhum dado encontrado para os filtros aplicados');
      }
    } catch (error) {
      console.error('Error fetching GPS route:', error);
      alert('Erro ao carregar dados GPS');
    } finally {
      setLoading(false);
    }
  };

  const handleClearFilters = () => {
    setStartDate('');
    setEndDate('');
    setMaxAccuracy('');
    setLimit(200);
  };

  // Funções do player da rota
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

  useEffect(() => {
    return () => {
      if (playbackIntervalRef.current) {
        clearInterval(playbackIntervalRef.current);
      }
    };
  }, []);

  // Processar dados
  const processedData = data.map(point => ({
    ...point,
    gps_latitude: typeof point.gps_latitude === 'string' 
      ? parseFloat(point.gps_latitude) 
      : point.gps_latitude,
    gps_longitude: typeof point.gps_longitude === 'string'
      ? parseFloat(point.gps_longitude)
      : point.gps_longitude,
  }));

  const validData = processedData.filter(
    point => !isNaN(point.gps_latitude) && !isNaN(point.gps_longitude)
  );

  // Preparar posições para o mapa
  const positions: [number, number][] = validData.map(point => [
    point.gps_latitude,
    point.gps_longitude
  ]);

  // Posição atual para o zoom automático
  const currentPosition = validData[currentPointIndex] 
    ? [validData[currentPointIndex].gps_latitude, validData[currentPointIndex].gps_longitude] as [number, number]
    : null;

  // Centro padrão (caso não haja dados)
  const defaultCenter: [number, number] = [-2.4833, -44.2167];
  const center = positions.length > 0 ? positions[0] : defaultCenter;


  return (
    <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-blue-600 px-6 py-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <MapPinIcon className="h-8 w-8 text-white" />
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-white">
                Mapa de Rota GPS
              </h2>
              <p className="text-sm text-white/80 mt-1">
                Visualize a rota do dispositivo com Leaflet
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-white/20 hover:bg-white/30 rounded-md transition-colors"
            >
              <FunnelIcon className="h-5 w-5" />
              <span className="hidden sm:inline">Filtros</span>
            </button>
            <button
              onClick={fetchGPSRoute}
              disabled={loading}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-white/20 hover:bg-white/30 rounded-md transition-colors disabled:opacity-50"
            >
              <ArrowPathIcon className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Carregar</span>
            </button>
          </div>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="bg-gray-50 border-b border-gray-200 px-6 py-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* ... (filtros existentes permanecem iguais) ... */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <MagnifyingGlassIcon className="h-4 w-4 inline mr-1" />
                Device EUI
              </label>
              <input
                type="text"
                value={devEui}
                onChange={(e) => setDevEui(e.target.value)}
                placeholder="20635F0241000AB7"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <CalendarIcon className="h-4 w-4 inline mr-1" />
                Data Inicial
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <CalendarIcon className="h-4 w-4 inline mr-1" />
                Data Final
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Precisão Máxima (m)
              </label>
              <input
                type="number"
                value={maxAccuracy}
                onChange={(e) => setMaxAccuracy(e.target.value)}
                placeholder="50"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Limite de Pontos
              </label>
              <select
                value={limit}
                onChange={(e) => setLimit(Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value={50}>50 pontos</option>
                <option value={100}>100 pontos</option>
                <option value={200}>200 pontos</option>
                <option value={500}>500 pontos</option>
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={handleClearFilters}
                className="w-full px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                <XMarkIcon className="h-4 w-4 inline mr-1" />
                Limpar Filtros
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Player Controls */}
      {validData.length > 0 && (
        <div className="bg-yellow-50 border-b border-yellow-200 px-6 py-4">
          <div className="flex flex-col space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <span className="text-sm font-medium text-gray-700">
                  Player de Rota:
                </span>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={previousPoint}
                    disabled={currentPointIndex === 0}
                    className="p-2 rounded-full bg-white border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <BackwardIcon className="h-4 w-4" />
                  </button>
                  
                  {!isPlaying ? (
                    <button
                      onClick={startPlayback}
                      className="p-2 rounded-full bg-green-500 text-white hover:bg-green-600"
                    >
                      <PlayIcon className="h-4 w-4" />
                    </button>
                  ) : (
                    <button
                      onClick={pausePlayback}
                      className="p-2 rounded-full bg-yellow-500 text-white hover:bg-yellow-600"
                    >
                      <PauseIcon className="h-4 w-4" />
                    </button>
                  )}
                  
                  <button
                    onClick={stopPlayback}
                    className="p-2 rounded-full bg-red-500 text-white hover:bg-red-600"
                  >
                    <StopIcon className="h-4 w-4" />
                  </button>
                  
                  <button
                    onClick={nextPoint}
                    disabled={currentPointIndex === validData.length - 1}
                    className="p-2 rounded-full bg-white border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ForwardIcon className="h-4 w-4" />
                  </button>
                </div>
                
                <select
                  value={playbackSpeed}
                  onChange={(e) => setPlaybackSpeed(Number(e.target.value))}
                  className="px-3 py-1 border border-gray-300 rounded-md text-sm"
                >
                  <option value={0.5}>0.5x</option>
                  <option value={1}>1x</option>
                  <option value={2}>2x</option>
                  <option value={5}>5x</option>
                </select>

                {/* Controle de Zoom Automático */}
                <div className="flex items-center space-x-2">
                  <label className="flex items-center space-x-1 text-sm text-gray-700">
                    <input
                      type="checkbox"
                      checked={autoZoomEnabled}
                      onChange={(e) => setAutoZoomEnabled(e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span>Zoom Auto</span>
                  </label>
                  <div className="flex items-center text-xs text-gray-500">
                    {autoZoomEnabled ? (
                      <MagnifyingGlassPlusIcon className="h-4 w-4 text-green-500" />
                    ) : (
                      <MagnifyingGlassMinusIcon className="h-4 w-4 text-gray-400" />
                    )}
                  </div>
                </div>
              </div>
              
              <div className="text-sm text-gray-600">
                {currentPointIndex + 1} / {validData.length}
                {autoZoomEnabled && (
                  <span className="ml-2 text-green-500">🔍</span>
                )}
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-gray-600">
                <span>Início: {new Date(validData[0].timestamp).toLocaleTimeString('pt-BR')}</span>
                <span>Atual: {new Date(validData[currentPointIndex].timestamp).toLocaleTimeString('pt-BR')}</span>
                <span>Fim: {new Date(validData[validData.length - 1].timestamp).toLocaleTimeString('pt-BR')}</span>
              </div>
              
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              
              <input
                type="range"
                min="0"
                max={validData.length - 1}
                value={currentPointIndex}
                onChange={(e) => goToPoint(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            {/* Instruções de arraste */}
            <div className="flex items-center justify-center space-x-2 text-xs text-gray-600 bg-yellow-100 px-3 py-2 rounded-md">
              <HandThumbUpIcon className="h-4 w-4" />
              <span>
                💡 <strong>Dica:</strong> {autoZoomEnabled 
                  ? 'Zoom automático ativado - o mapa acompanhará o movimento!' 
                  : 'Ative o Zoom Auto para o mapa acompanhar o movimento'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Stats */}
      {validData.length > 0 && (
        <div className="bg-blue-50 border-b border-blue-200 px-6 py-3">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <p className="text-xs text-gray-600">Total de Pontos</p>
              <p className="text-lg font-bold text-blue-600">{validData.length}</p>
            </div>
            <div>
              <p className="text-xs text-gray-600">Precisão Média</p>
              <p className="text-lg font-bold text-blue-600">
                {(validData.reduce((sum, p) => sum + p.gps_accuracy, 0) / validData.length).toFixed(1)}m
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-600">Primeiro Ponto</p>
              <p className="text-xs font-medium text-gray-900">
                {new Date(validData[0].timestamp).toLocaleString('pt-BR')}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-600">Último Ponto</p>
              <p className="text-xs font-medium text-gray-900">
                {new Date(validData[validData.length - 1].timestamp).toLocaleString('pt-BR')}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Map */}
      <div className="p-6">
        {loading ? (
          <div className="flex items-center justify-center h-[700px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Carregando dados GPS...</p>
            </div>
          </div>
        ) : data.length === 0 ? (
          <div className="flex items-center justify-center h-[700px]">
            <div className="text-center">
              <MapPinIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Nenhuma rota carregada</p>
              <button
                onClick={fetchGPSRoute}
                className="mt-4 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
              >
                Carregar Rota
              </button>
            </div>
          </div>
        ) : (
          <MapContainer
            center={center}
            zoom={13}
            maxZoom={22}
            zoomControl={false} // Desabilita controles padrão para usar os customizados
            style={{ height: '700px', width: '100%' }}
            className="rounded-lg shadow-md"
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              maxZoom={22}
            />
            
            {/* Controles customizados com zoom automático */}
            <ZoomControls 
              autoZoomEnabled={autoZoomEnabled}
              onAutoZoomToggle={setAutoZoomEnabled}
            />
            
            {/* Zoom automático */}
            <AutoZoom 
              position={currentPosition}
              isPlaying={isPlaying}
              isDragging={isDragging}
              autoZoomEnabled={autoZoomEnabled}
            />
            
            <MapBounds positions={positions} />
            
            {/* Linha da rota */}
            {positions.length > 1 && (
              <Polyline
                positions={positions}
                pathOptions={{
                  color: '#3b82f6',
                  weight: 6,
                  opacity: 0.8,
                }}
              />
            )}
            
            {/* Setas indicando direção */}
            {positions.length > 1 && <RouteArrows positions={positions} />}
            
            {/* Marcador do player que segue a linha */}
            <DraggableRouteMarker
              positions={positions}
              currentPointIndex={currentPointIndex}
              onIndexChange={handleMarkerIndexChange}
              validData={validData}
              onDraggingChange={handleDraggingChange}
            />
            
            {/* Marcadores estáticos apenas para pontos importantes */}
            {validData.map((point, index) => {
              const isStart = index === 0;
              const isEnd = index === validData.length - 1;
              // const isCurrent = index === currentPointIndex;

              if (!isStart && !isEnd && index % 20 !== 0) return null;

              const color = isStart
                ? '#22c55e'
                : isEnd
                ? '#ef4444'
                : '#3b82f6';

              const radius = isStart || isEnd ? 8 : 4;

              return (
                <CircleMarker
                  key={index}
                  center={[point.gps_latitude, point.gps_longitude]}
                  radius={radius}
                  pathOptions={{
                    color,
                    fillColor: color,
                    fillOpacity: 0.5,
                    weight: 1,
                  }}
                >
                  <Popup>
                    <div className="p-2">
                      <strong className="text-sm">
                        {isStart ? '🟢 Início' : isEnd ? '🔴 Fim' : `📍 Ponto ${index + 1}`}
                      </strong>
                      <div className="mt-2 text-xs space-y-1">
                        <div><strong>Horário:</strong> {new Date(point.timestamp).toLocaleString('pt-BR')}</div>
                        <div><strong>Latitude:</strong> {point.gps_latitude.toFixed(6)}</div>
                        <div><strong>Longitude:</strong> {point.gps_longitude.toFixed(6)}</div>
                        <div><strong>Precisão:</strong> {point.gps_accuracy}m</div>
                      </div>
                    </div>
                  </Popup>
                </CircleMarker>
              );
            })}
          </MapContainer>
        )}
      </div>

      {/* Legend */}
      {validData.length > 0 && (
        <div className="bg-gray-50 border-t border-gray-200 px-6 py-4">
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-full bg-green-500 border-2 border-white shadow"></div>
              <span className="text-gray-700 font-medium">Ponto Inicial</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-blue-500 border-2 border-white shadow"></div>
              <span className="text-gray-700">Pontos Intermediários</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-full bg-red-500 border-2 border-white shadow"></div>
              <span className="text-gray-700 font-medium">Ponto Final</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-full bg-yellow-500 border-2 border-white shadow"></div>
              <span className="text-gray-700 font-medium">Player (Segue a Linha)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-full bg-blue-500 border-2 border-white shadow">
                <div className="w-3 h-3 rounded-full bg-white mx-auto mt-1"></div>
              </div>
              <span className="text-gray-700 font-medium">Zoom Auto {autoZoomEnabled ? '✅' : '❌'}</span>
            </div>
          </div>
          <p className="text-center text-xs text-gray-500 mt-3">
            💡 {autoZoomEnabled 
              ? 'Zoom automático ativado! O mapa acompanhará o marcador durante a reprodução e arraste.' 
              : 'Ative o Zoom Auto para o mapa acompanhar automaticamente o movimento!'}
          </p>
        </div>
      )}
    </div>
  );
};

export default GPSRouteMapLeaflet;