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
import { useTranslation } from 'react-i18next';
import { useCompany } from '../../../hooks/useCompany';

// Tipos de mapas disponíveis
// Tipos de mapas disponíveis - ATUALIZADO
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
    // ⭐ ALTERNATIVA: Google Satellite (sem API key)
    url: 'https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}',
    attribution: '&copy; Google',
    maxNativeZoom: 21, // ✅ Suporta zoom muito maior!
    maxZoom: 22
  },
  terrain: {
    name: 'Terreno',
    // ⭐ ALTERNATIVA: Google Terrain
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
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  maxZoom: 20,
});

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
        maxZoom: 15
      });
    }
  }, [positions, map]);

  return null;
}

// Componente para controlar o zoom automático
// function AutoZoom({
//   position,
//   isPlaying,
//   isDragging,
//   autoZoomEnabled
// }: {
//   position: [number, number] | null;
//   isPlaying: boolean;
//   isDragging: boolean;
//   autoZoomEnabled: boolean;
// }) {
//   const map = useMap();
//   const lastZoomRef = useRef<number>(map.getZoom());
//   const lastPositionRef = useRef<[number, number] | null>(null);
//   const zoomTimeoutRef = useRef<any | null>(null);

//   useEffect(() => {
//     if (!autoZoomEnabled || !position) return;

//     if (zoomTimeoutRef.current) {
//       clearTimeout(zoomTimeoutRef.current);
//     }

//     const currentZoom = map.getZoom();
//     const shouldApplyZoom = () => {
//       if (!lastPositionRef.current) return true;

//       const distance = L.latLng(position).distanceTo(L.latLng(lastPositionRef.current));
//       return distance > 100 || isPlaying || isDragging;
//     };

//     if (shouldApplyZoom()) {
//       let targetZoom: number;

//       if (isDragging) {
//         targetZoom = 17;
//       } else if (isPlaying) {
//         targetZoom = 15;
//       } else {
//         targetZoom = lastZoomRef.current;
//       }

//       if (Math.abs(currentZoom - targetZoom) >= 1) {
//         zoomTimeoutRef.current = setTimeout(() => {
//           map.setView(position, targetZoom, {
//             animate: true,
//             duration: 1.5,
//             easeLinearity: 0.25
//           });
//           lastZoomRef.current = targetZoom;
//         }, 300);
//       } else {
//         map.panTo(position, {
//           animate: true,
//           duration: 1,
//           easeLinearity: 0.25
//         });
//       }

//       lastPositionRef.current = position;
//     }

//     return () => {
//       if (zoomTimeoutRef.current) {
//         clearTimeout(zoomTimeoutRef.current);
//       }
//     };
//   }, [position, isPlaying, isDragging, autoZoomEnabled, map]);

//   useEffect(() => {
//     if (!autoZoomEnabled) {
//       lastPositionRef.current = null;
//       if (zoomTimeoutRef.current) {
//         clearTimeout(zoomTimeoutRef.current);
//       }
//     }
//   }, [autoZoomEnabled]);

//   return null;
// }


// Componente para controlar o zoom automático - VERSÃO CORRIGIDA
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
  const zoomTimeoutRef = useRef<any | null>(null);
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (!autoZoomEnabled || !position) return;

    // Não aplicar zoom no primeiro render para evitar conflito com MapBounds
    if (isFirstRender.current) {
      isFirstRender.current = false;
      lastPositionRef.current = position;
      return;
    }

    const shouldApplyZoom = () => {
      if (!lastPositionRef.current) return true;
      
      const distance = L.latLng(position).distanceTo(L.latLng(lastPositionRef.current));
      
      // Aplicar zoom apenas se a distância for significativa
      return distance > 10; // Apenas se mover mais de 10 metros
    };

    const getOptimalZoom = (): number => {
      if (isDragging) return 17; // Zoom próximo durante arraste
      if (isPlaying) return 16;  // Zoom durante reprodução
      return 17; // Zoom padrão
    };

    if (shouldApplyZoom()) {
      if (zoomTimeoutRef.current) {
        clearTimeout(zoomTimeoutRef.current);
      }

      zoomTimeoutRef.current = setTimeout(() => {
        const targetZoom = getOptimalZoom();
        const duration = isPlaying ? 1.0 : 1.5;
        
        map.setView(position, targetZoom, {
          animate: true,
          duration,
          easeLinearity: 0.25
        });
        
        lastPositionRef.current = position;
      }, isPlaying ? 100 : 0);
    }

    return () => {
      if (zoomTimeoutRef.current) {
        clearTimeout(zoomTimeoutRef.current);
      }
    };
  }, [position, isPlaying, isDragging, autoZoomEnabled, map]);

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
  onAutoZoomToggle,
  mapType,
  onMapTypeChange
}: {
  autoZoomEnabled: boolean;
  onAutoZoomToggle: (enabled: boolean) => void;
  mapType: keyof typeof MAP_TYPES;
  onMapTypeChange: (type: keyof typeof MAP_TYPES) => void;
}) {
  const { t } = useTranslation();
  const map = useMap();
  const [showMapTypes, setShowMapTypes] = useState(false);

  return (
    <>
      <div className="leaflet-top leaflet-right">
        <div className="leaflet-control leaflet-bar flex flex-col bg-white rounded-md shadow-lg border border-gray-200 overflow-hidden">
          {/* Botão de Zoom In */}
          <button
            onClick={() => map.zoomIn()}
            className="flex items-center justify-center w-10 h-10 hover:bg-gray-100 transition-colors border-b border-gray-200"
            title={t('gpsRouteMap.map.zoomIn')}
          >
            <MagnifyingGlassPlusIcon className="h-4 w-4 text-gray-700" />
          </button>

          {/* Botão de Zoom Out */}
          <button
            onClick={() => map.zoomOut()}
            className="flex items-center justify-center w-10 h-10 hover:bg-gray-100 transition-colors border-b border-gray-200"
            title={t('gpsRouteMap.map.zoomOut')}
          >
            <MagnifyingGlassMinusIcon className="h-4 w-4 text-gray-700" />
          </button>

          {/* Botão de Auto Zoom */}
          <button
            onClick={() => onAutoZoomToggle(!autoZoomEnabled)}
            className={`flex items-center justify-center w-10 h-10 transition-colors border-b border-gray-200 ${
              autoZoomEnabled 
                ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
            title={autoZoomEnabled ? t('gpsRouteMap.player.autoZoomDisable') : t('gpsRouteMap.player.autoZoomEnable')}
          >
            <div className="flex flex-col items-center">
              <span className="text-xs font-bold">A</span>
              <div className={`w-2 h-1 rounded-full ${autoZoomEnabled ? 'bg-green-500' : 'bg-gray-400'}`}></div>
            </div>
          </button>

          {/* Botão de Tipo de Mapa */}
          <button
            onClick={() => setShowMapTypes(!showMapTypes)}
            className="flex items-center justify-center w-10 h-10 bg-white text-gray-700 hover:bg-gray-100 transition-colors"
            title={t('gpsRouteMap.map.mapType')}
          >
            <span className="text-lg">🗺️</span>
          </button>
        </div>
      </div>

      {/* Menu de Tipos de Mapa */}
      {showMapTypes && (
        <div
          className="leaflet-top leaflet-right"
          style={{
            marginTop: '180px',
            marginRight: '10px'
          }}
        >
          <div className="leaflet-control leaflet-bar bg-white rounded-md shadow-lg border border-gray-200 p-3 min-w-[160px]">
            <div className="text-sm font-semibold text-gray-800 mb-3 pb-2 border-b border-gray-200">
              {t('gpsRouteMap.map.mapType')}
            </div>
            <div className="space-y-2">
              {(Object.keys(MAP_TYPES) as Array<keyof typeof MAP_TYPES>).map((type) => (
                <button
                  key={type}
                  onClick={() => {
                    onMapTypeChange(type);
                    setShowMapTypes(false);
                  }}
                  className={`w-full text-left px-3 py-2 text-sm rounded-md transition-all duration-200 flex items-center gap-3 ${
                    mapType === type 
                      ? 'bg-blue-50 text-blue-700 font-semibold border border-blue-200' 
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <div className={`w-3 h-3 rounded-full border-2 ${
                    mapType === type ? 'bg-blue-500 border-blue-500' : 'bg-white border-gray-400'
                  }`}></div>
                  <span>{MAP_TYPES[type].name}</span>
                </button>
              ))}
            </div>
            
            {/* Legenda de Status do Auto Zoom */}
            <div className="mt-3 pt-3 border-t border-gray-200">
              <div className="flex items-center justify-between text-xs text-gray-600">
                <span>Auto Zoom:</span>
                <span className={`font-medium ${autoZoomEnabled ? 'text-green-600' : 'text-gray-500'}`}>
                  {autoZoomEnabled ? 'Ativo' : 'Inativo'}
                </span>
              </div>
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
  const { t } = useTranslation();
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
        dragstart: handleDragStart,
        dragend: handleDragEnd,
      }}
      autoPan={true}
    >
      <Popup>
        <div className="p-2">
          <strong className="text-sm">{t('gpsRouteMap.markers.currentPosition')}</strong>
          <div className="mt-2 text-xs space-y-1">
            <div><strong>{t('gpsRouteMap.markers.time')}:</strong> {new Date(validData[currentPointIndex].timestamp).toLocaleString()}</div>
            <div><strong>{t('gpsRouteMap.markers.latitude')}:</strong> {validData[currentPointIndex].gps_latitude.toFixed(6)}</div>
            <div><strong>{t('gpsRouteMap.markers.longitude')}:</strong> {validData[currentPointIndex].gps_longitude.toFixed(6)}</div>
            <div><strong>{t('gpsRouteMap.markers.accuracy')}:</strong> {validData[currentPointIndex].gps_accuracy}m</div>
            <div><strong>{t('gpsRouteMap.markers.progress')}:</strong> {currentPointIndex + 1} {t('gpsRouteMap.markers.of')} {validData.length}</div>
            <div className="mt-2 text-green-600 font-medium">
              💡 {t('gpsRouteMap.player.dragTip')}
            </div>
          </div>
        </div>
      </Popup>
    </Marker>
  );
}

const GPSRouteMapLeaflet = () => {
  const { t } = useTranslation();
  const {companyId} = useCompany()
  const [data, setData] = useState<GPSPoint[]>([]);
  const [loading, setLoading] = useState(false);
  const [devEui, setDevEui] = useState('20635F0241000AB7');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [maxAccuracy, setMaxAccuracy] = useState('');
  const [limit, setLimit] = useState(200);
  const [showFilters, setShowFilters] = useState(false);

  // // Estados para o player da rota
  // const [isPlaying, setIsPlaying] = useState(false);
  // const [currentPointIndex, setCurrentPointIndex] = useState(0);
  // const [playbackSpeed, setPlaybackSpeed] = useState(1);
  // const [progress, setProgress] = useState(0);
  // const [isDragging, setIsDragging] = useState(false);
  // const [autoZoomEnabled, setAutoZoomEnabled] = useState(true);
  // const [mapType, setMapType] = useState<keyof typeof MAP_TYPES>('streets');
  // const playbackIntervalRef = useRef<any | null>(null);

  
  // Estados para o player da rota - ATUALIZADOS
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentPointIndex, setCurrentPointIndex] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [progress, setProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [autoZoomEnabled, setAutoZoomEnabled] = useState(true);
  const [shouldApplyPlayerZoom, setShouldApplyPlayerZoom] = useState(false); // NOVO ESTADO
  const [mapType, setMapType] = useState<keyof typeof MAP_TYPES>('streets');
  const playbackIntervalRef = useRef<any | null>(null);

  const fetchGPSRoute = async () => {
    if (!devEui) {
      alert(t('gpsRouteMap.alerts.noDeviceEUI'));
      return;
    }

    console.warn(shouldApplyPlayerZoom)

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
        `https://api-dashboards-u1oh.onrender.com/api/dashboard/devices/${companyId}/gps-route/raw?${params}`
      );
      const result = await response.json();

      if (result.data && result.data.length > 0) {
        console.log('📍 GPS Data loaded:', result.data.length, 'points');
        setData(result.data);
        resetPlayer();
      } else {
        setData([]);
        alert(t('gpsRouteMap.alerts.noData'));
      }
    } catch (error) {
      console.error('Error fetching GPS route:', error);
      alert(t('gpsRouteMap.alerts.error'));
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
  // const startPlayback = () => {
  //   if (validData.length === 0) return;

  //   setIsPlaying(true);
  //   playbackIntervalRef.current = setInterval(() => {
  //     setCurrentPointIndex(prev => {
  //       const nextIndex = prev + 1;
  //       if (nextIndex >= validData.length) {
  //         stopPlayback();
  //         return prev;
  //       }
  //       setProgress((nextIndex / (validData.length - 1)) * 100);
  //       return nextIndex;
  //     });
  //   }, 1000 / playbackSpeed);
  // };

  // const pausePlayback = () => {
  //   setIsPlaying(false);
  //   if (playbackIntervalRef.current) {
  //     clearInterval(playbackIntervalRef.current);
  //     playbackIntervalRef.current = null;
  //   }
  // };

  // const stopPlayback = () => {
  //   setIsPlaying(false);
  //   setCurrentPointIndex(0);
  //   setProgress(0);
  //   if (playbackIntervalRef.current) {
  //     clearInterval(playbackIntervalRef.current);
  //     playbackIntervalRef.current = null;
  //   }
  // };

  // const resetPlayer = () => {
  //   stopPlayback();
  //   setCurrentPointIndex(0);
  //   setProgress(0);
  // };

  // Funções do player da rota - ATUALIZADAS
const startPlayback = () => {
  if (validData.length === 0) return;

  setIsPlaying(true);
  setShouldApplyPlayerZoom(true); // Habilitar zoom do player
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
  setShouldApplyPlayerZoom(false); // Desabilitar zoom do player
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
                {t('gpsRouteMap.title')}
              </h2>
              <p className="text-sm text-white/80 mt-1">
                {t('gpsRouteMap.subtitle')}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-white/20 hover:bg-white/30 rounded-md transition-colors"
            >
              <FunnelIcon className="h-5 w-5" />
              <span className="hidden sm:inline">{t('gpsRouteMap.filters.showFilters')}</span>
            </button>
            <button
              onClick={fetchGPSRoute}
              disabled={loading}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-white/20 hover:bg-white/30 rounded-md transition-colors disabled:opacity-50"
            >
              <ArrowPathIcon className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">{t('gpsRouteMap.filters.load')}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="bg-gray-50 border-b border-gray-200 px-6 py-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <MagnifyingGlassIcon className="h-4 w-4 inline mr-1" />
                {t('gpsRouteMap.filters.deviceEUI')}
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
                {t('gpsRouteMap.filters.startDate')}
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
                {t('gpsRouteMap.filters.endDate')}
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
                {t('gpsRouteMap.filters.maxAccuracy')}
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
                {t('gpsRouteMap.filters.pointLimit')}
              </label>
              <select
                value={limit}
                onChange={(e) => setLimit(Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value={50}>{t('gpsRouteMap.filters.pointOptions.50')}</option>
                <option value={100}>{t('gpsRouteMap.filters.pointOptions.100')}</option>
                <option value={200}>{t('gpsRouteMap.filters.pointOptions.200')}</option>
                <option value={500}>{t('gpsRouteMap.filters.pointOptions.500')}</option>
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={handleClearFilters}
                className="w-full px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                <XMarkIcon className="h-4 w-4 inline mr-1" />
                {t('gpsRouteMap.filters.clearFilters')}
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
                  {t('gpsRouteMap.player.title')}
                </span>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={previousPoint}
                    disabled={currentPointIndex === 0}
                    className="p-2 rounded-full bg-white border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    title={t('gpsRouteMap.player.previous')}
                  >
                    <BackwardIcon className="h-4 w-4" />
                  </button>

                  {!isPlaying ? (
                    <button
                      onClick={startPlayback}
                      className="p-2 rounded-full bg-green-500 text-white hover:bg-green-600"
                      title={t('gpsRouteMap.player.play')}
                    >
                      <PlayIcon className="h-4 w-4" />
                    </button>
                  ) : (
                    <button
                      onClick={pausePlayback}
                      className="p-2 rounded-full bg-yellow-500 text-white hover:bg-yellow-600"
                      title={t('gpsRouteMap.player.pause')}
                    >
                      <PauseIcon className="h-4 w-4" />
                    </button>
                  )}

                  <button
                    onClick={stopPlayback}
                    className="p-2 rounded-full bg-red-500 text-white hover:bg-red-600"
                    title={t('gpsRouteMap.player.stop')}
                  >
                    <StopIcon className="h-4 w-4" />
                  </button>

                  <button
                    onClick={nextPoint}
                    disabled={currentPointIndex === validData.length - 1}
                    className="p-2 rounded-full bg-white border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    title={t('gpsRouteMap.player.next')}
                  >
                    <ForwardIcon className="h-4 w-4" />
                  </button>
                </div>

                <select
                  value={playbackSpeed}
                  onChange={(e) => setPlaybackSpeed(Number(e.target.value))}
                  className="px-3 py-1 border border-gray-300 rounded-md text-sm"
                >
                  <option value={0.5}>{t('gpsRouteMap.player.speeds.0.5')}</option>
                  <option value={1}>{t('gpsRouteMap.player.speeds.1')}</option>
                  <option value={2}>{t('gpsRouteMap.player.speeds.2')}</option>
                  <option value={5}>{t('gpsRouteMap.player.speeds.5')}</option>
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
                    <span>{t('gpsRouteMap.player.autoZoom')}</span>
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
                <span>{t('gpsRouteMap.markers.start')}: {new Date(validData[0].timestamp).toLocaleTimeString()}</span>
                <span>{t('gpsRouteMap.markers.current')}: {new Date(validData[currentPointIndex].timestamp).toLocaleTimeString()}</span>
                <span>{t('gpsRouteMap.markers.end')}: {new Date(validData[validData.length - 1].timestamp).toLocaleTimeString()}</span>
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
                {t('gpsRouteMap.player.tip')} {autoZoomEnabled
                  ? t('gpsRouteMap.player.autoZoomEnabled')
                  : t('gpsRouteMap.player.autoZoomDisabled')}
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
              <p className="text-xs text-gray-600">{t('gpsRouteMap.stats.totalPoints')}</p>
              <p className="text-lg font-bold text-blue-600">{validData.length}</p>
            </div>
            <div>
              <p className="text-xs text-gray-600">{t('gpsRouteMap.stats.averageAccuracy')}</p>
              <p className="text-lg font-bold text-blue-600">
                {(validData.reduce((sum, p) => sum + p.gps_accuracy, 0) / validData.length).toFixed(1)}m
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-600">{t('gpsRouteMap.stats.firstPoint')}</p>
              <p className="text-xs font-medium text-gray-900">
                {new Date(validData[0].timestamp).toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-600">{t('gpsRouteMap.stats.lastPoint')}</p>
              <p className="text-xs font-medium text-gray-900">
                {new Date(validData[validData.length - 1].timestamp).toLocaleString()}
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
              <p className="text-gray-600">{t('gpsRouteMap.map.loading')}</p>
            </div>
          </div>
        ) : data.length === 0 ? (
          <div className="flex items-center justify-center h-[700px]">
            <div className="text-center">
              <MapPinIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">{t('gpsRouteMap.map.noRoute')}</p>
              <button
                onClick={fetchGPSRoute}
                className="mt-4 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
              >
                {t('gpsRouteMap.map.loadRoute')}
              </button>
            </div>
          </div>
        ) : (
          <MapContainer
            center={center}
            zoom={13}
            maxZoom={22}
            zoomControl={false}
            style={{ height: '700px', width: '100%' }}
            className="rounded-lg shadow-md"
          >
            {/* TileLayer dinâmico baseado no mapType */}
                <TileLayer
                  attribution={MAP_TYPES[mapType].attribution}
                  // url={MAP_TYPES[mapType].url}
                  url={MAP_TYPES[mapType].url}
                  maxNativeZoom={MAP_TYPES[mapType].maxNativeZoom}  // ✅ Zoom do servidor
                  maxZoom={MAP_TYPES[mapType].maxZoom}              // ✅ Zoom máximo permitido
            />

            {/* Controles customizados com todas as props */}
            <ZoomControls
              autoZoomEnabled={autoZoomEnabled}
              onAutoZoomToggle={setAutoZoomEnabled}
              mapType={mapType}
              onMapTypeChange={setMapType}
            />

            {/* Zoom automático */}
            <AutoZoom
              position={currentPosition}
              isPlaying={isPlaying}
              isDragging={isDragging}
              autoZoomEnabled={autoZoomEnabled}
            />

            {/* <MapBounds positions={positions} /> */}
            {(!isPlaying && !isDragging) && <MapBounds positions={positions} />}

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
                        {isStart ? t('gpsRouteMap.markers.start') : isEnd ? t('gpsRouteMap.markers.end') : `${t('gpsRouteMap.markers.point')} ${index + 1}`}
                      </strong>
                      <div className="mt-2 text-xs space-y-1">
                        <div><strong>{t('gpsRouteMap.markers.time')}:</strong> {new Date(point.timestamp).toLocaleString()}</div>
                        <div><strong>{t('gpsRouteMap.markers.latitude')}:</strong> {point.gps_latitude.toFixed(6)}</div>
                        <div><strong>{t('gpsRouteMap.markers.longitude')}:</strong> {point.gps_longitude.toFixed(6)}</div>
                        <div><strong>{t('gpsRouteMap.markers.accuracy')}:</strong> {point.gps_accuracy}m</div>
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
              <span className="text-gray-700 font-medium">{t('gpsRouteMap.legend.startPoint')}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-blue-500 border-2 border-white shadow"></div>
              <span className="text-gray-700">{t('gpsRouteMap.legend.intermediatePoints')}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-full bg-red-500 border-2 border-white shadow"></div>
              <span className="text-gray-700 font-medium">{t('gpsRouteMap.legend.endPoint')}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-full bg-yellow-500 border-2 border-white shadow"></div>
              <span className="text-gray-700 font-medium">{t('gpsRouteMap.legend.player')}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-full bg-blue-500 border-2 border-white shadow">
                <div className="w-3 h-3 rounded-full bg-white mx-auto mt-1"></div>
              </div>
              <span className="text-gray-700 font-medium">{t('gpsRouteMap.legend.autoZoom')} {autoZoomEnabled ? '✅' : '❌'}</span>
            </div>
          </div>
          <p className="text-center text-xs text-gray-500 mt-3">
            💡 {autoZoomEnabled
              ? t('gpsRouteMap.player.autoZoomEnabled')
              : t('gpsRouteMap.player.autoZoomDisabled')}
          </p>
        </div>
      )}
    </div>
  );
};

export default GPSRouteMapLeaflet;