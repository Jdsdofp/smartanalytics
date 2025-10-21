// src/components/Map/GPSMapViewer.tsx
import { useEffect, useState, useRef, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-polylinedecorator';
// ⭐ ADICIONAR IMPORT DO HEATMAP
import 'leaflet.heat';
import {
  MapPinIcon,
  ArrowPathIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  XMarkIcon,
  PlayIcon,
  PauseIcon,
  StopIcon,
  ForwardIcon,
  BackwardIcon,
  ExclamationCircleIcon,
  BoltIcon,
  FireIcon, // ⭐ Ícone para o mapa de calor
} from '@heroicons/react/24/outline';
// ⭐ IMPORTAR FUNÇÃO DE EXPORTAÇÃO PDF
import { exportGPSPointToPDF } from '../../../utils/exportGPSPointToPDF'

// =====================================
// 👷 ÍCONES PERSONALIZADOS PARA TRABALHADORES
// =====================================

// Criar ícone personalizado para trabalhador
const createWorkerIcon = (color: string = '#3b82f6') => {
  return L.divIcon({
    html: `
      <div style="
        position: relative;
        width: 32px;
        height: 32px;
        background-color: ${color};
        border: 3px solid white;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        box-shadow: 0 2px 6px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <div style="
          transform: rotate(45deg);
          color: white;
          font-weight: bold;
          font-size: 16px;
          margin-top: -2px;
        ">👷</div>
      </div>
    `,
    className: 'custom-worker-icon',
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  });
};

// // Ícone para trabalhador em movimento...
// const createMovingWorkerIcon = (color: string = '#10b981') => {
//   return L.divIcon({
//     html: `
//       <div style="
//         position: relative;
//         width: 36px;
//         height: 36px;
//         background-color: ${color};
//         border: 3px solid white;
//         border-radius: 50% 50% 50% 0;
//         transform: rotate(-45deg);
//         box-shadow: 0 2px 8px rgba(0,0,0,0.4);
//         display: flex;
//         align-items: center;
//         justify-content: center;
//         animation: pulse 2s infinite;
//       ">
//         <div style="
//           transform: rotate(45deg);
//           color: white;
//           font-weight: bold;
//           font-size: 18px;
//           margin-top: -2px;
//         ">🚶</div>
//       </div>
//       <style>
//         @keyframes pulse {
//           0% { transform: rotate(-45deg) scale(1); }
//           50% { transform: rotate(-45deg) scale(1.1); }
//           100% { transform: rotate(-45deg) scale(1); }
//         }
//       </style>
//     `,
//     className: 'custom-moving-worker-icon',
//     iconSize: [36, 36],
//     iconAnchor: [18, 36],
//     popupAnchor: [0, -36],
//   });
// };

// // Ícone para trabalhador com alerta
// const createAlertWorkerIcon = (color: string = '#ef4444') => {
//   return L.divIcon({
//     html: `
//       <div style="
//         position: relative;
//         width: 40px;
//         height: 40px;
//         background-color: ${color};
//         border: 3px solid white;
//         border-radius: 50% 50% 50% 0;
//         transform: rotate(-45deg);
//         box-shadow: 0 2px 10px rgba(239,68,68,0.5);
//         display: flex;
//         align-items: center;
//         justify-content: center;
//         animation: alert-pulse 1.5s infinite;
//       ">
//         <div style="
//           transform: rotate(45deg);
//           color: white;
//           font-weight: bold;
//           font-size: 20px;
//           margin-top: -2px;
//         ">🚨</div>
//       </div>
//       <style>
//         @keyframes alert-pulse {
//           0% { 
//             transform: rotate(-45deg) scale(1);
//             box-shadow: 0 2px 10px rgba(239,68,68,0.5);
//           }
//           50% { 
//             transform: rotate(-45deg) scale(1.15);
//             box-shadow: 0 2px 20px rgba(239,68,68,0.8);
//           }
//           100% { 
//             transform: rotate(-45deg) scale(1);
//             box-shadow: 0 2px 10px rgba(239,68,68,0.5);
//           }
//         }
//       </style>
//     `,
//     className: 'custom-alert-worker-icon',
//     iconSize: [40, 40],
//     iconAnchor: [20, 40],
//     popupAnchor: [0, -40],
//   });
// };

//ajuste final

// Ícone para ponto atual (player)
const createCurrentWorkerIcon = (color: string = '#eab308') => {
  return L.divIcon({
    html: `
      <div style="
        position: relative;
        width: 44px;
        height: 44px;
        background: linear-gradient(135deg, ${color}, #f59e0b);
        border: 4px solid white;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        box-shadow: 0 4px 12px rgba(234,179,8,0.6);
        display: flex;
        align-items: center;
        justify-content: center;
        animation: current-pulse 2s infinite;
      ">
        <div style="
          transform: rotate(45deg);
          color: white;
          font-weight: bold;
          font-size: 22px;
          margin-top: -2px;
          text-shadow: 0 1px 2px rgba(0,0,0,0.3);
        ">⭐</div>
      </div>
      <style>
        @keyframes current-pulse {
          0% { transform: rotate(-45deg) scale(1); }
          50% { transform: rotate(-45deg) scale(1.2); }
          100% { transform: rotate(-45deg) scale(1); }
        }
      </style>
    `,
    className: 'custom-current-worker-icon',
    iconSize: [44, 44],
    iconAnchor: [22, 44],
    popupAnchor: [0, -44],
  });
};

// =====================================
// 🛠️ HELPER FUNCTIONS
// =====================================

// =====================================
// 🔥 COMPONENTE PARA MAPA DE CALOR
// =====================================
interface HeatmapLayerProps {
  points: any[];
  show: boolean;
}

const HeatmapLayer: React.FC<HeatmapLayerProps> = ({ points, show }) => {
  const map = useMap();
  const heatLayerRef = useRef<any>(null);

  useEffect(() => {
    if (!show) {
      if (heatLayerRef.current) {
        map.removeLayer(heatLayerRef.current);
        heatLayerRef.current = null;
      }
      return;
    }

    const heatData = points
      .filter(point => point.gps_latitude && point.gps_longitude)
      .map(point => {
        const lat = typeof point.gps_latitude === 'string' ? parseFloat(point.gps_latitude) : point.gps_latitude;
        const lng = typeof point.gps_longitude === 'string' ? parseFloat(point.gps_longitude) : point.gps_longitude;
        return [lat, lng, 0.5];
      });

    if (heatData.length === 0) return;

    if (heatLayerRef.current) {
      map.removeLayer(heatLayerRef.current);
    }

    // @ts-ignore
    heatLayerRef.current = L.heatLayer(heatData, {
      radius: 25,
      blur: 15,
      maxZoom: 17,
      max: 1.0,
      gradient: {
        0.0: 'blue',
        0.3: 'cyan',
        0.5: 'lime',
        0.7: 'yellow',
        1.0: 'red'
      }
    }).addTo(map);

    return () => {
      if (heatLayerRef.current) {
        map.removeLayer(heatLayerRef.current);
        heatLayerRef.current = null;
      }
    };
  }, [points, show, map]);

  return null;
};

const toNumber = (value: number | string | null | undefined, defaultValue: number = 0): number => {
  if (value === null || value === undefined) return defaultValue;
  const num = typeof value === 'string' ? parseFloat(value) : value;
  return isNaN(num) ? defaultValue : num;
};

const formatNumber = (value: number | string | null | undefined, decimals: number = 1): string => {
  const num = toNumber(value);
  return num.toFixed(decimals);
};

// Paleta de cores distintas para múltiplos dispositivos
const DEVICE_COLORS = [
  '#3b82f6', // blue-500
  '#ef4444', // red-500
  '#10b981', // green-500
  '#f59e0b', // amber-500
  '#8b5cf6', // violet-500
  '#ec4899', // pink-500
  '#14b8a6', // teal-500
  '#f97316', // orange-500
  '#6366f1', // indigo-500
  '#84cc16', // lime-500
];

const getDeviceColor = (devEui: string, allDevices: string[]): string => {
  const index = allDevices.indexOf(devEui);
  return DEVICE_COLORS[index % DEVICE_COLORS.length];
};

// =====================================
// 🗺️ CONFIGURAÇÕES DE MAPAS
// =====================================
const MAP_TYPES = {
  streets: {
    name: 'Ruas',
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; OpenStreetMap',
    maxZoom: 19
  },
  satellite: {
    name: 'Satélite',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: '&copy; Esri',
    maxZoom: 19,
  },
  terrain: {
    name: 'Terreno',
    url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
    attribution: '&copy; OpenTopoMap',
    maxZoom: 17,
  },
  dark: {
    name: 'Escuro',
    url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    attribution: '&copy; CARTO',
    maxZoom: 17,
  },
};

// Fix para ícones do Leaflet
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  maxZoom: 20,
});

// =====================================
// 📊 INTERFACES
// =====================================
// 📊 INTERFACES
interface GPSPoint {
  dev_eui: string;
  timestamp: string;
  gps_latitude: number;
  gps_longitude: number;
  gps_accuracy: number;
  battery_level?: number;
  dynamic_motion_state?: string;
  Item_Name?: string;
  Image_hash?: string;
  id?: number;
}

interface GPSFilters {
  dev_eui: string[];
  start_date: string;
  end_date: string;
  valid_gps_only: boolean;
  max_accuracy: string;
  min_accuracy: string;
  latest_only?: boolean;
}

interface GPSResponse {
  success: boolean;
  data: GPSPoint[];
  pagination: {
    current_page: number;
    per_page: number;
    total_records: number;
    total_pages: number;
    has_next: boolean;
    has_prev: boolean;
  };
  filters_applied: any;
}

interface GPSStats {
  total_records: number | string;
  unique_devices: number | string;
  oldest_record: string;
  newest_record: string;
  avg_accuracy: number | string | null;
  min_accuracy: number | string | null;
  max_accuracy: number | string | null;
}

// =====================================
// 🗺️ COMPONENTES AUXILIARES DO MAPA
// =====================================
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

function AutoZoom({
  position,
  isPlaying,
  autoZoomEnabled
}: {
  position: [number, number] | null;
  isPlaying: boolean;
  autoZoomEnabled: boolean;
}) {
  const map = useMap();
  const lastPositionRef = useRef<[number, number] | null>(null);

  useEffect(() => {
    if (!autoZoomEnabled || !position) return;

    const shouldApplyZoom = () => {
      if (!lastPositionRef.current) return true;
      const distance = L.latLng(position).distanceTo(L.latLng(lastPositionRef.current));
      return distance > 100 || isPlaying;
    };

    if (shouldApplyZoom()) {
      const targetZoom = isPlaying ? 15 : 17;
      map.setView(position, targetZoom, {
        animate: true,
        duration: 1.5,
        easeLinearity: 0.25
      });
      lastPositionRef.current = position;
    }
  }, [position, isPlaying, autoZoomEnabled, map]);

  return null;
}

// =====================================
// 🎯 COMPONENTE PRINCIPAL
// =====================================

const GPSMapViewer = () => {
  // Estados principais
  const [data, setData] = useState<GPSPoint[]>([]);
  const [stats, setStats] = useState<GPSStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Lista de dispositivos disponíveis
  const [availableDevices, setAvailableDevices] = useState<string[]>([]);
  const [loadingDevices, setLoadingDevices] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Estados do modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPoint, setSelectedPoint] = useState<GPSPoint | any>(null);

  // Filtros
  const [showFilters, setShowFilters] = useState(true);
  const [filters, setFilters] = useState<GPSFilters>({
    dev_eui: [],
    start_date: '',
    end_date: '',
    valid_gps_only: true,
    max_accuracy: '100',
    min_accuracy: '',
    latest_only: false,
  });

  // Paginação
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<GPSResponse['pagination'] | null>(null);

  // Player
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentPointIndex, setCurrentPointIndex] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState(1000);
  const [autoZoomEnabled, setAutoZoomEnabled] = useState(true);

  // Mapa
  const [mapType, setMapType] = useState<keyof typeof MAP_TYPES>('streets');
  // ⭐ Mapa de Calor
  const [showHeatmap, setShowHeatmap] = useState(false);

  const [center] = useState<[number, number]>([-2.5307, -44.3068]); // São Luís, MA

  const playIntervalRef = useRef<any | null>(null);

  // =====================================
  // 📡 FETCH DE DADOS
  // =====================================

  // Buscar lista de dispositivos disponíveis
  const fetchAvailableDevices = useCallback(async () => {
    setLoadingDevices(true);
    try {
      const response = await fetch(
        'https://api-dashboards-u1oh.onrender.com/api/dashboard/devices/device/list'
      );

      if (!response.ok) {
        throw new Error('Falha ao carregar lista de dispositivos');
      }

      const result = await response.json();

      if (result.success && Array.isArray(result.data)) {
        setAvailableDevices(result.data);
      }
    } catch (err) {
      console.error('Error fetching available devices:', err);
      // Não mostrar erro ao usuário, apenas log
    } finally {
      setLoadingDevices(false);
    }
  }, []);

  // Carregar lista de dispositivos ao montar componente
  useEffect(() => {
    fetchAvailableDevices();
  }, [fetchAvailableDevices]);

  const fetchGPSData = useCallback(async (pageNum: number = 1) => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        page: pageNum.toString(),
        limit: '1000',
        sortBy: 'timestamp',
        sortOrder: 'ASC',
      });

      // Adicionar filtros
      if (filters.dev_eui.length > 0) {
        params.append('dev_eui', filters.dev_eui.join(','));
      }
      if (filters.start_date) params.append('start_date', filters.start_date);
      if (filters.end_date) params.append('end_date', filters.end_date);
      if (filters.valid_gps_only) params.append('valid_gps_only', 'true');
      if (filters.max_accuracy) params.append('max_accuracy', filters.max_accuracy);
      if (filters.min_accuracy) params.append('min_accuracy', filters.min_accuracy);
      if (filters.latest_only) params.append('latest_only', 'true');

      const response = await fetch(
        `https://api-dashboards-u1oh.onrender.com/api/dashboard/devices/gps-data?${params}`
      );

      if (!response.ok) {
        throw new Error('Falha ao carregar dados GPS');
      }

      const result: GPSResponse = await response.json();

      setData(result.data);
      setPagination(result.pagination);
      setCurrentPointIndex(0);
      setIsPlaying(false);

      // Buscar estatísticas
      await fetchStats();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
      console.error('Error fetching GPS data:', err);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const fetchStats = async () => {
    try {
      const params = new URLSearchParams();
      if (filters.dev_eui.length > 0) {
        params.append('dev_eui', filters.dev_eui.join(','));
      }
      if (filters.start_date) params.append('start_date', filters.start_date);
      if (filters.end_date) params.append('end_date', filters.end_date);

      const response = await fetch(
        `https://api-dashboards-u1oh.onrender.com/api/dashboard/devices/gps-stats`
      );

      if (response.ok) {
        const result = await response.json();
        setStats(result.data);
      }
    } catch (err) {
      console.error('Error fetching GPS stats:', err);
    }
  };

  // =====================================
  // 🎮 CONTROLES DE PLAYBACK
  // =====================================
  useEffect(() => {
    if (isPlaying && data.length > 0 && !filters.latest_only) {
      playIntervalRef.current = setInterval(() => {
        setCurrentPointIndex((prev) => {
          if (prev >= data.length - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, playbackSpeed);
    }

    return () => {
      if (playIntervalRef.current) {
        clearInterval(playIntervalRef.current);
      }
    };
  }, [isPlaying, data.length, playbackSpeed, filters.latest_only]);

  const togglePlayPause = () => setIsPlaying(!isPlaying);
  const stopPlayback = () => {
    setIsPlaying(false);
    setCurrentPointIndex(0);
  };
  const goToNext = () => {
    setCurrentPointIndex((prev) => Math.min(prev + 1, data.length - 1));
  };
  const goToPrevious = () => {
    setCurrentPointIndex((prev) => Math.max(prev - 1, 0));
  };

  // =====================================
  // 📍 DADOS PARA O MAPA
  // =====================================
  const validData = data.filter(
    (point) =>
      point.gps_latitude &&
      point.gps_longitude &&
      !isNaN(point.gps_latitude) &&
      !isNaN(point.gps_longitude)
  );

  // Agrupar dados por dispositivo
  const dataByDevice = validData.reduce((acc, point) => {
    if (!acc[point.dev_eui]) {
      acc[point.dev_eui] = [];
    }
    acc[point.dev_eui].push(point);
    return acc;
  }, {} as Record<string, GPSPoint[]>);

  const uniqueDevices = Object.keys(dataByDevice);

  const positions: [number, number][] = validData.map((point) => [
    point.gps_latitude,
    point.gps_longitude,
  ]);

  const currentPosition =
    validData.length > 0 && currentPointIndex < validData.length
      ? [validData[currentPointIndex].gps_latitude, validData[currentPointIndex].gps_longitude] as [number, number]
      : null;

  const progress = validData.length > 0 ? ((currentPointIndex / (validData.length - 1)) * 100) : 0;

  // =====================================
  // 🎨 HANDLERS DE FILTROS
  // =====================================
  const toggleDevice = (devEui: string) => {
    setFilters((prev) => {
      const isSelected = prev.dev_eui.includes(devEui);
      return {
        ...prev,
        dev_eui: isSelected
          ? prev.dev_eui.filter((d) => d !== devEui)
          : [...prev.dev_eui, devEui],
      };
    });
  };

  const selectAllDevices = () => {
    setFilters((prev) => ({
      ...prev,
      dev_eui: [...availableDevices],
    }));
  };

  const deselectAllDevices = () => {
    setFilters((prev) => ({
      ...prev,
      dev_eui: [],
    }));
  };

  const handleRemoveDevEui = (devEui: string) => {
    setFilters((prev) => ({
      ...prev,
      dev_eui: prev.dev_eui.filter((d) => d !== devEui),
    }));
  };

  const handleClearFilters = () => {
    setFilters({
      dev_eui: [],
      start_date: '',
      end_date: '',
      valid_gps_only: true,
      max_accuracy: '100',
      min_accuracy: '',
      latest_only: false,
    });
  };

  // Fechar dropdown ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.dropdown-container')) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isDropdownOpen]);

  const handleApplyFilters = () => {
    setPage(1);
    fetchGPSData(1);
  };

  // =====================================
  // 🎨 RENDERIZAÇÃO
  // =====================================
  return (
    <>
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <MapPinIcon className="h-8 w-8 text-white" />
              <div>
                <h2 className="text-xl font-bold text-white">Rastreamento de Trabalhadores</h2>
                <p className="text-sm text-blue-100">
                  Monitoramento em tempo real da equipe em campo
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {/* ⭐ BOTÃO MAPA DE CALOR */}
              <button
                onClick={() => setShowHeatmap(!showHeatmap)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  showHeatmap
                    ? 'bg-orange-500 hover:bg-orange-600 text-white'
                    : 'bg-white/20 hover:bg-white/30 text-white'
                }`}
                title={showHeatmap ? 'Ocultar mapa de calor' : 'Mostrar mapa de calor'}
              >
                <FireIcon className="h-5 w-5" />
                Mapa de Calor
              </button>
              
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-colors"
              >
                <FunnelIcon className="h-5 w-5" />
                {showFilters ? 'Ocultar' : 'Mostrar'} Filtros
              </button>
            </div>
          </div>
        </div>

        {/* Filtros */}
        {showFilters && (
          <div className="bg-gray-50 border-b border-gray-200 px-6 py-4">
            <div className="space-y-4">
              {/* Dev EUI - Dropdown com Checkboxes */}
              <div className="dropdown-container">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Dispositivos (DEV_EUI)
                  {loadingDevices && (
                    <span className="ml-2 text-xs text-gray-500 animate-pulse">
                      Carregando...
                    </span>
                  )}
                </label>

                {/* Dropdown Button */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    disabled={loadingDevices || availableDevices.length === 0}
                    className="w-full flex items-center justify-between px-4 py-2.5 bg-white border border-gray-300 rounded-lg hover:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:bg-gray-50 disabled:cursor-not-allowed"
                  >
                    <span className="text-sm text-gray-700">
                      {filters.dev_eui.length === 0
                        ? 'Selecione dispositivos...'
                        : `${filters.dev_eui.length} dispositivo(s) selecionado(s)`}
                    </span>
                    <svg
                      className={`w-5 h-5 text-gray-400 transition-transform ${isDropdownOpen ? 'transform rotate-180' : ''
                        }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </button>

                  {/* Dropdown Menu */}
                  {isDropdownOpen && (
                    <div className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg max-h-80 overflow-hidden">
                      {/* Header com ações */}
                      <div className="sticky top-0 bg-gray-50 border-b border-gray-200 px-3 py-2 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={selectAllDevices}
                            className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                          >
                            Selecionar todos
                          </button>
                          <span className="text-gray-300">|</span>
                          <button
                            type="button"
                            onClick={deselectAllDevices}
                            className="text-xs text-red-600 hover:text-red-800 font-medium"
                          >
                            Limpar
                          </button>
                        </div>
                        <button
                          type="button"
                          onClick={fetchAvailableDevices}
                          disabled={loadingDevices}
                          className="text-xs text-gray-500 hover:text-gray-700"
                          title="Recarregar"
                        >
                          <ArrowPathIcon className="h-4 w-4" />
                        </button>
                      </div>

                      {/* Lista de dispositivos com checkboxes */}
                      <div className="overflow-y-auto max-h-64">
                        {availableDevices.length === 0 ? (
                          <div className="px-4 py-8 text-center text-sm text-gray-500">
                            Nenhum dispositivo disponível
                          </div>
                        ) : (
                          availableDevices.map((devEui) => {
                            const isSelected = filters.dev_eui.includes(devEui);
                            const color = getDeviceColor(devEui, filters.dev_eui);

                            return (
                              <label
                                key={devEui}
                                className={`flex items-center px-4 py-2.5 hover:bg-blue-50 cursor-pointer transition-colors border-l-4 ${isSelected ? 'bg-blue-50' : 'border-l-transparent'
                                  }`}
                                style={{
                                  borderLeftColor: isSelected ? color : 'transparent',
                                }}
                              >
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  onChange={() => toggleDevice(devEui)}
                                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                                />
                                <span className="ml-3 flex items-center gap-2 flex-1">
                                  {isSelected && (
                                    <span
                                      className="w-3 h-3 rounded-full ring-2 ring-white"
                                      style={{ backgroundColor: color }}
                                    />
                                  )}
                                  <span
                                    className={`text-sm font-mono ${isSelected ? 'font-semibold text-gray-900' : 'text-gray-700'
                                      }`}
                                  >
                                    {devEui}
                                  </span>
                                </span>
                              </label>
                            );
                          })
                        )}
                      </div>

                      {/* Footer com contador */}
                      {filters.dev_eui.length > 0 && (
                        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-3 py-2">
                          <p className="text-xs text-gray-600 text-center">
                            {filters.dev_eui.length} de {availableDevices.length} dispositivos selecionados
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Dispositivos selecionados - Tags com cores */}
                {filters.dev_eui.length > 0 && (
                  <div className="mt-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">
                        Selecionados ({filters.dev_eui.length})
                      </span>
                      <button
                        onClick={deselectAllDevices}
                        className="text-xs text-red-600 hover:text-red-800 font-medium"
                      >
                        Remover todos
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2 p-3 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg border border-blue-200 max-h-32 overflow-y-auto">
                      {filters.dev_eui.map((devEui) => {
                        const color = getDeviceColor(devEui, filters.dev_eui);
                        return (
                          <span
                            key={devEui}
                            className="inline-flex items-center gap-2 px-3 py-1.5 bg-white rounded-full text-sm border-2 shadow-sm hover:shadow-md transition-shadow"
                            style={{ borderColor: color }}
                          >
                            <span
                              className="w-3 h-3 rounded-full ring-2 ring-white"
                              style={{ backgroundColor: color }}
                            ></span>
                            <span className="font-mono font-semibold text-gray-700">
                              {devEui}
                            </span>
                            <button
                              onClick={() => handleRemoveDevEui(devEui)}
                              className="hover:bg-red-50 rounded-full p-1 transition-colors group"
                              title="Remover"
                            >
                              <XMarkIcon className="h-3.5 w-3.5 text-gray-400 group-hover:text-red-600" />
                            </button>
                          </span>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Data e Hora */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Data Inicial
                  </label>
                  <input
                    type="datetime-local"
                    value={filters.start_date}
                    onChange={(e) =>
                      setFilters({ ...filters, start_date: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Data Final
                  </label>
                  <input
                    type="datetime-local"
                    value={filters.end_date}
                    onChange={(e) =>
                      setFilters({ ...filters, end_date: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Accuracy */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Precisão Mínima (m)
                  </label>
                  <input
                    type="number"
                    value={filters.min_accuracy}
                    onChange={(e) =>
                      setFilters({ ...filters, min_accuracy: e.target.value })
                    }
                    placeholder="Ex: 0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Precisão Máxima (m)
                  </label>
                  <input
                    type="number"
                    value={filters.max_accuracy}
                    onChange={(e) =>
                      setFilters({ ...filters, max_accuracy: e.target.value })
                    }
                    placeholder="Ex: 100"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Apenas GPS Válido */}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="valid_gps"
                  checked={filters.valid_gps_only}
                  onChange={(e) =>
                    setFilters({ ...filters, valid_gps_only: e.target.checked })
                  }
                  className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                />
                <label htmlFor="valid_gps" className="text-sm text-gray-700">
                  Apenas pontos com GPS válido
                </label>
              </div>

              {/* Último Registro por Dispositivo */}
              <div className="flex items-center gap-2 p-3 bg-purple-50 rounded-lg border border-purple-200">
                <input
                  type="checkbox"
                  id="latest_only"
                  checked={filters.latest_only || false}
                  onChange={(e) =>
                    setFilters({ ...filters, latest_only: e.target.checked })
                  }
                  className="w-4 h-4 text-purple-600 rounded focus:ring-2 focus:ring-purple-500"
                />
                <label htmlFor="latest_only" className="text-sm text-purple-700 font-medium">
                  Apenas último registro de cada dispositivo
                </label>
                <span className="ml-2 px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full font-medium">
                  NOVO
                </span>
              </div>

              {/* Botões de Ação */}
              <div className="flex gap-2">
                <button
                  onClick={handleApplyFilters}
                  disabled={loading}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
                >
                  <MagnifyingGlassIcon className="h-5 w-5" />
                  {loading ? 'Buscando...' : 'Aplicar Filtros'}
                </button>
                <button
                  onClick={handleClearFilters}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Limpar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Estatísticas */}
        {stats && (
          <div className="bg-blue-50 border-b border-blue-200 px-6 py-3">
            {/* Indicador de Latest Only */}
            {filters.latest_only && (
              <div className="text-center mb-3">
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-700 text-sm rounded-full border border-purple-200">
                  <MapPinIcon className="h-4 w-4" />
                  Modo: Último registro por dispositivo
                </span>
              </div>
            )}

            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 text-center">
              <div>
                <p className="text-xs text-gray-600">Total Pontos</p>
                <p className="text-lg font-bold text-blue-600">
                  {toNumber(stats.total_records).toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-600">Dispositivos</p>
                <p className="text-lg font-bold text-blue-600">
                  {toNumber(stats.unique_devices)}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-600">Precisão Média</p>
                <p className="text-lg font-bold text-blue-600">
                  {formatNumber(stats.avg_accuracy, 1)}m
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-600">Precisão Mín</p>
                <p className="text-sm font-medium text-green-600">
                  {formatNumber(stats.min_accuracy, 1)}m
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-600">Precisão Máx</p>
                <p className="text-sm font-medium text-red-600">
                  {formatNumber(stats.max_accuracy, 1)}m
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-600">Primeiro Registro</p>
                <p className="text-xs font-medium text-gray-900">
                  {stats.oldest_record
                    ? new Date(stats.oldest_record).toLocaleDateString('pt-BR')
                    : 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-600">Último Registro</p>
                <p className="text-xs font-medium text-gray-900">
                  {stats.newest_record
                    ? new Date(stats.newest_record).toLocaleDateString('pt-BR')
                    : 'N/A'}
                </p>
              </div>
            </div>
          </div>
        )}

        {validData.length > 0 && !filters.latest_only && (
          <div className="bg-white border-b border-gray-200 px-6 py-4">
            <div className="space-y-4">
              {/* Controles de Reprodução */}
              <div className="flex items-center justify-center gap-4">
                <button
                  onClick={stopPlayback}
                  className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                  title="Parar"
                >
                  <StopIcon className="h-5 w-5" />
                </button>
                <button
                  onClick={goToPrevious}
                  className="p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
                  title="Anterior"
                >
                  <BackwardIcon className="h-5 w-5" />
                </button>
                <button
                  onClick={togglePlayPause}
                  className="p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  title={isPlaying ? 'Pausar' : 'Reproduzir'}
                >
                  {isPlaying ? (
                    <PauseIcon className="h-6 w-6" />
                  ) : (
                    <PlayIcon className="h-6 w-6" />
                  )}
                </button>
                <button
                  onClick={goToNext}
                  className="p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
                  title="Próximo"
                >
                  <ForwardIcon className="h-5 w-5" />
                </button>

                {/* Velocidade */}
                <select
                  value={playbackSpeed}
                  onChange={(e) => setPlaybackSpeed(Number(e.target.value))}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                >
                  <option value={2000}>0.5x</option>
                  <option value={1000}>1x</option>
                  <option value={500}>2x</option>
                  <option value={250}>4x</option>
                </select>

                {/* Auto Zoom */}
                <button
                  onClick={() => setAutoZoomEnabled(!autoZoomEnabled)}
                  className={`px-3 py-2 rounded-lg transition-colors ${autoZoomEnabled
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-100 text-gray-600'
                    }`}
                  title="Zoom Automático"
                >
                  Auto Zoom {autoZoomEnabled ? '✓' : '✗'}
                </button>
              </div>

              {/* Progress Info */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs text-gray-600">
                  <span>
                    Ponto: {currentPointIndex + 1} / {validData.length}
                  </span>
                  <span>
                    {validData[currentPointIndex] &&
                      new Date(validData[currentPointIndex].timestamp).toLocaleTimeString(
                        'pt-BR'
                      )}
                  </span>
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
                  onChange={(e) => setCurrentPointIndex(Number(e.target.value))}
                  className="w-full"
                />
              </div>
            </div>
          </div>
        )}

        {/* ⭐⭐ ADICIONE ESTE BLOCO - Seletor de Tipo de Mapa SEMPRE VISÍVEL */}
        {validData.length > 0 && (
          <div className="bg-white border-b border-gray-200 px-6 py-3">
            <div className="flex items-center justify-center gap-4">
              <span className="text-sm font-medium text-gray-700">Tipo de Mapa:</span>
              <select
                value={mapType}
                onChange={(e) => setMapType(e.target.value as keyof typeof MAP_TYPES)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {Object.entries(MAP_TYPES).map(([key, value]) => (
                  <option key={key} value={key}>
                    {value.name}
                  </option>
                ))}
              </select>

              {/* Opcional: Adicionar botão de auto zoom também aqui para ficar sempre disponível */}
              <button
                onClick={() => setAutoZoomEnabled(!autoZoomEnabled)}
                className={`px-3 py-2 rounded-lg transition-colors text-sm ${autoZoomEnabled
                    ? 'bg-green-100 text-green-700 border border-green-300'
                    : 'bg-gray-100 text-gray-600 border border-gray-300'
                  }`}
                title="Zoom Automático"
              >
                Auto Zoom {autoZoomEnabled ? '✓' : '✗'}
              </button>
            </div>
          </div>
        )}

        {/* Mensagem quando latest_only está ativo e há dados */}
        {validData.length > 0 && filters.latest_only && (
          <div className="bg-purple-50 border-b border-purple-200 px-6 py-4">
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 text-purple-700">
                <MapPinIcon className="h-5 w-5" />
                <span className="font-medium">
                  Modo de visualização: Última posição conhecida de cada dispositivo
                </span>
              </div>
              <p className="text-sm text-purple-600 mt-1">
                {validData.length} dispositivo(s) encontrado(s)
              </p>
            </div>
          </div>
        )}

        {/* Mapa */}
        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center h-[700px]">
              <div className="text-center">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Carregando dados GPS...</p>
              </div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center h-[700px]">
              <div className="text-center">
                <ExclamationCircleIcon className="h-16 w-16 text-red-500 mx-auto mb-4" />
                <p className="text-red-600 font-medium">{error}</p>
                <button
                  onClick={() => fetchGPSData(page)}
                  className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Tentar Novamente
                </button>
              </div>
            </div>
          ) : data.length === 0 ? (
            <div className="flex items-center justify-center h-[700px]">
              <div className="text-center">
                <MapPinIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">
                  {filters.latest_only
                    ? "Nenhum dispositivo encontrado"
                    : "Nenhuma rota carregada"
                  }
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  Configure os filtros e clique em 'Aplicar Filtros'
                </p>
              </div>
            </div>
          ) : (
            <MapContainer
              center={currentPosition || center}
              zoom={13}
              maxZoom={20}
              zoomControl={false}
              style={{ height: '700px', width: '100%' }}
              className="rounded-lg shadow-md"
            >
              <TileLayer
                attribution={MAP_TYPES[mapType].attribution}
                url={MAP_TYPES[mapType].url}
                maxZoom={MAP_TYPES[mapType].maxZoom}
              />

              <AutoZoom
                position={currentPosition}
                isPlaying={isPlaying}
                autoZoomEnabled={autoZoomEnabled && !filters.latest_only}
              />

              <MapBounds positions={positions} />

              {/* ⭐ MAPA DE CALOR */}
              <HeatmapLayer points={validData} show={showHeatmap} />

              {/* Marcadores - Pontos dos Dispositivos com ícones de trabalhador */}
              {validData.map((point, index) => {
                // ✨ Modo latest_only - mostrar todos os pontos como "última posição"
                if (filters.latest_only) {
                  const deviceColor = getDeviceColor(point.dev_eui, uniqueDevices);

                  return (
                    <Marker
                      key={`latest-${point.dev_eui}`}
                      position={[point.gps_latitude, point.gps_longitude]}
                      icon={createWorkerIcon(deviceColor)}
                    >
                      <Popup>
                        <div className="p-2 min-w-[240px] max-w-[280px]">
                          {/* Cabeçalho com informações do usuário */}
                          <div className="flex items-center gap-3 mb-3 pb-2 border-b border-gray-200">
                            {/* Avatar do usuário */}
                            <div className="flex-shrink-0">
                              {point.Image_hash ? (
                                <img
                                  src={`https://smartmachine.smartxhub.cloud/imagem/${point.Image_hash}`}
                                  alt={point.Item_Name || 'Usuário'}
                                  className="w-12 h-12 rounded-full object-cover border-2 border-gray-300"
                                />
                              ) : (
                                <div className="w-12 h-12 rounded-full bg-blue-100 border-2 border-blue-300 flex items-center justify-center">
                                  <span className="text-lg">👷</span>
                                </div>
                              )}
                            </div>

                            {/* Informações do usuário */}
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-gray-900 text-sm truncate">
                                {point.Item_Name || 'Trabalhador não identificado'}
                              </h3>
                              <div className="flex items-center gap-2 mt-1">
                                <div
                                  className="w-3 h-3 rounded-full border-2 border-white shadow-sm"
                                  style={{ backgroundColor: deviceColor }}
                                />
                                <code className="text-xs text-gray-600 font-mono truncate">
                                  {point.dev_eui}
                                </code>
                              </div>
                            </div>
                          </div>

                          {/* Status e timestamp */}
                          <div className="mb-3">
                            <div className="flex items-center justify-between">
                              <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full font-medium">
                                {status}
                              </span>
                              <span className="text-xs text-gray-500">
                                {new Date(point.timestamp).toLocaleTimeString('pt-BR')}
                              </span>
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                              {new Date(point.timestamp).toLocaleDateString('pt-BR')}
                            </div>
                          </div>

                          {/* Informações de localização */}
                          <div className="space-y-2 text-sm">
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <span className="text-gray-600 font-medium">Latitude:</span>
                                <div className="text-gray-900 font-mono text-xs">{point.gps_latitude}</div>
                              </div>
                              <div>
                                <span className="text-gray-600 font-medium">Longitude:</span>
                                <div className="text-gray-900 font-mono text-xs">{point.gps_longitude}</div>
                              </div>
                            </div>

                            <div className="flex items-center justify-between">
                              <span className="text-gray-600 font-medium">Precisão:</span>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${point.gps_accuracy < 10 ? 'bg-green-100 text-green-800' :
                                point.gps_accuracy < 25 ? 'bg-yellow-100 text-yellow-800' :
                                  'bg-red-100 text-red-800'
                                }`}>
                                {point.gps_accuracy}m
                              </span>
                            </div>

                            {/* Informações adicionais */}
                            <div className="pt-2 border-t border-gray-100 space-y-1">
                              {point.battery_level && (
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-1">
                                    <BoltIcon className="h-4 w-4 text-yellow-600" />
                                    <span className="text-gray-600 font-medium">Bateria:</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <div className="w-16 bg-gray-200 rounded-full h-2">
                                      <div
                                        className={`h-2 rounded-full ${point.battery_level > 50 ? 'bg-green-500' :
                                          point.battery_level > 20 ? 'bg-yellow-500' : 'bg-red-500'
                                          }`}
                                        style={{ width: `${point.battery_level}%` }}
                                      ></div>
                                    </div>
                                    <span className="text-xs font-medium w-8">{point.battery_level}%</span>
                                  </div>
                                </div>
                              )}

                              {point.dynamic_motion_state && (
                                <div className="flex items-center justify-between">
                                  <span className="text-gray-600 font-medium">Status:</span>
                                  <div className="flex items-center gap-1">
                                    {point.dynamic_motion_state === 'MOVING' ? (
                                      <>
                                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                        <span className="text-green-600 font-medium text-xs">Em movimento</span>
                                      </>
                                    ) : (
                                      <>
                                        <div className="w-2 h-2 rounded-full bg-gray-400" />
                                        <span className="text-gray-600 text-xs">Parado</span>
                                      </>
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Botão de ação */}
                          <div className="mt-3 pt-2 border-t border-gray-200">
                            <button
                              onClick={() => {
                                setSelectedPoint(point);
                                setIsModalOpen(true);
                              }}
                              className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors flex items-center justify-center gap-2"
                            >
                              <MapPinIcon className="h-4 w-4" />
                              Ver detalhes completos
                            </button>
                          </div>
                        </div>
                      </Popup>
                    </Marker>
                  );
                }

                // ✨ Lógica para quando NÃO está em latest_only
                const isStart = index === 0;
                const isEnd = index === validData.length - 1;
                const isCurrent = index === currentPointIndex;

                // Mostrar mais pontos já que não temos linhas conectando
                const showIntermediate = uniqueDevices.length === 1
                  ? index % 5 === 0   // A cada 5 pontos
                  : index % 10 === 0; // A cada 10 pontos para múltiplos

                if (!isStart && !isEnd && !isCurrent && !showIntermediate) return null;

                const deviceColor = getDeviceColor(point.dev_eui, uniqueDevices);

                let icon;

                if (isStart) {
                  icon = createWorkerIcon('#22c55e'); // Verde para início
                  status = '🟢 Início';
                } else if (isEnd) {
                  icon = createWorkerIcon('#ef4444'); // Vermelho para fim
                  status = '🔴 Fim';
                } else if (isCurrent) {
                  icon = createCurrentWorkerIcon('#eab308'); // Amarelo para ponto atual
                  status = '⭐ Atual';
                } else {
                  // Para pontos intermediários, usar ícone padrão
                  icon = createWorkerIcon(deviceColor);
                  status = `📍 Ponto ${index + 1}`;
                }

                return (
                  <Marker
                    key={`${point.dev_eui}-${index}`}
                    position={[point.gps_latitude, point.gps_longitude]}
                    icon={icon}
                  >
                    <Popup>
                      <div className="p-2 min-w-[220px]">
                        <div className="flex items-center gap-2 mb-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: deviceColor }}
                          />
                          <strong className="text-sm" style={{ color: deviceColor }}>

                          </strong>
                        </div>
                        <div className="text-xs space-y-1">
                          <div>
                            <strong>DEV_EUI:</strong>
                            <span style={{ color: deviceColor, fontWeight: 'bold' }}>
                              {' '}{point.dev_eui}
                            </span>
                          </div>
                          <div>
                            <strong>Horário:</strong>{' '}
                            {new Date(point.timestamp).toLocaleString('pt-BR')}
                          </div>
                          <div>
                            <strong>Latitude:</strong> {point.gps_latitude}
                          </div>
                          <div>
                            <strong>Longitude:</strong> {point.gps_longitude}
                          </div>
                          <div>
                            <strong>Precisão:</strong> {point.gps_accuracy}m
                          </div>
                          {point.battery_level && (
                            <div className="flex items-center gap-1">
                              <BoltIcon className="h-3 w-3 text-yellow-600" />
                              <strong>Bateria:</strong> {point.battery_level}%
                            </div>
                          )}
                          {point.dynamic_motion_state && (
                            <div className="flex items-center gap-1">
                              {point.dynamic_motion_state === 'MOVING' ? (
                                <>
                                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                  <span className="text-green-600 font-medium">Em movimento</span>
                                </>
                              ) : (
                                <>
                                  <div className="w-2 h-2 rounded-full bg-gray-400" />
                                  <span className="text-gray-600">Parado</span>
                                </>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </Popup>
                  </Marker>
                );
              })}
            </MapContainer>
          )}
        </div>

        {/* Paginação */}
        {pagination && pagination.total_pages > 1 && (
          <div className="bg-gray-50 border-t border-gray-200 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Página {pagination.current_page} de {pagination.total_pages} ({toNumber(pagination.total_records).toLocaleString()} registros)
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => fetchGPSData(page - 1)}
                  disabled={!pagination.has_prev || loading}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Anterior
                </button>
                <button
                  onClick={() => fetchGPSData(page + 1)}
                  disabled={!pagination.has_next || loading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Próxima
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Legenda */}
        {validData.length > 0 && (
          <div className="bg-gray-50 border-t border-gray-200 px-6 py-4">
            {/* Legenda de Dispositivos */}
            {uniqueDevices.length > 0 && (
              <div className="mb-4">
                <h4 className="text-sm font-semibold text-gray-700 mb-3">
                  {filters.latest_only ? 'Últimas Posições dos Trabalhadores' : 'Trabalhadores'}
                  ({uniqueDevices.length})
                </h4>
                <div
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 max-h-80 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 hover:scrollbar-thumb-gray-400"
                  style={{
                    scrollbarWidth: 'thin',
                    scrollbarColor: '#d1d5db #f3f4f6'
                  }}
                >
                  {uniqueDevices.map((devEui) => {
                    const color = getDeviceColor(devEui, uniqueDevices);
                    const devicePointCount = dataByDevice[devEui].length;

                    // Encontrar o ponto mais recente para este dispositivo para obter nome e imagem
                    const latestPoint = dataByDevice[devEui].reduce((latest, current) =>
                      new Date(current.timestamp) > new Date(latest.timestamp) ? current : latest
                    );

                    const userName = latestPoint.Item_Name || 'Trabalhador não identificado';
                    const userImage = latestPoint.Image_hash;

                    return (
                      <div
                        key={devEui}
                        className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow"
                      >
                        {/* Avatar do usuário */}
                        <div className="flex-shrink-0">
                          {userImage ? (
                            <img
                              src={`https://smartmachine.smartxhub.cloud/imagem/${userImage}`}
                              alt={userName}
                              className="w-10 h-10 rounded-full object-cover border-2 border-gray-300"
                              onError={(e) => {
                                // Fallback se a imagem não carregar
                                const target = e.target as HTMLImageElement;
                                target.style.display = 'none';
                                target.nextElementSibling?.classList.remove('hidden');
                              }}
                            />
                          ) : null}
                          {/* Fallback avatar */}
                          <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center border-2 border-gray-300 ${userImage ? 'hidden' : ''}`}
                            style={{ backgroundColor: `${color}20` }}
                          >
                            <span className="text-lg">👷</span>
                          </div>
                        </div>

                        {/* Informações do usuário */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <div
                              className="w-2 h-2 rounded-full border-2 border-white shadow-sm flex-shrink-0"
                              style={{ backgroundColor: color }}
                            ></div>
                            <p
                              className="text-sm font-semibold text-gray-900 truncate"
                              title={userName}
                            >
                              {userName}
                            </p>
                          </div>

                          <div className="space-y-1">
                            <code
                              className="text-xs text-gray-500 font-mono truncate block"
                              title={devEui}
                            >
                              {devEui}
                            </code>
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-gray-500">
                                {devicePointCount} {filters.latest_only ? 'posição' : devicePointCount === 1 ? 'ponto' : 'pontos'}
                              </span>

                              {/* Status online/offline baseado no timestamp */}
                              {filters.latest_only && (
                                <div className="flex items-center gap-1">
                                  <div
                                    className={`w-2 h-2 rounded-full ${Date.now() - new Date(latestPoint.timestamp).getTime() < 5 * 60 * 1000
                                      ? 'bg-green-500 animate-pulse'
                                      : 'bg-gray-400'
                                      }`}
                                  ></div>
                                  <span className="text-xs text-gray-500">
                                    {Date.now() - new Date(latestPoint.timestamp).getTime() < 5 * 60 * 1000 ? 'Online' : 'Offline'}
                                  </span>
                                </div>
                              )}
                            </div>

                            {/* Última atualização */}
                            {filters.latest_only && (
                              <div className="text-xs text-gray-400">
                                {new Date(latestPoint.timestamp).toLocaleTimeString('pt-BR')}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Ícone indicador */}
                        <div className="flex flex-col items-center gap-1">
                          {filters.latest_only ? (
                            <MapPinIcon className="h-5 w-5 text-blue-500" />
                          ) : (
                            <div className="text-lg">👷</div>
                          )}

                          {/* Indicador de precisão */}
                          {filters.latest_only && latestPoint.gps_accuracy && (
                            <span
                              className={`px-1.5 py-0.5 rounded-full text-xs font-medium ${latestPoint.gps_accuracy < 10 ? 'bg-green-100 text-green-800' :
                                latestPoint.gps_accuracy < 25 ? 'bg-yellow-100 text-yellow-800' :
                                  'bg-red-100 text-red-800'
                                }`}
                            >
                              {latestPoint.gps_accuracy}m
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Indicador de scroll */}
                {uniqueDevices.length > 8 && (
                  <div className="text-center mt-2">
                    <span className="text-xs text-gray-500 bg-white px-3 py-1 rounded-full border border-gray-200">
                      ↑↓ Role para ver mais trabalhadores
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Mostrar legenda de status apenas quando NÃO estiver em latest_only */}
            {!filters.latest_only && (
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-3">Status dos Trabalhadores</h4>
                <div className="flex flex-wrap items-center justify-center gap-6 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-green-500 border-2 border-white shadow"></div>
                    <span className="text-gray-700 font-medium">Primeiro Ponto</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-red-500 border-2 border-white shadow"></div>
                    <span className="text-gray-700 font-medium">Último Ponto</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-yellow-500 border-2 border-white shadow"></div>
                    <span className="text-gray-700 font-medium">Ponto Atual (Player)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-blue-500 border-2 border-white shadow"></div>
                    <span className="text-gray-700 font-medium">Pontos Intermediários</span>
                  </div>
                </div>
              </div>
            )}

            {/* Legenda adicional para o modo latest_only */}
            {filters.latest_only && (
              <div className="mt-4">
                <h4 className="text-sm font-semibold text-gray-700 mb-3">Status de Conexão</h4>
                <div className="flex flex-wrap items-center justify-center gap-6 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse"></div>
                    <span className="text-gray-700 font-medium">Online (últimos 5 min)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-gray-400"></div>
                    <span className="text-gray-700 font-medium">Offline</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-green-100 border-2 border-green-500"></div>
                    <span className="text-gray-700 font-medium">Precisão &lt; 10m</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-yellow-100 border-2 border-yellow-500"></div>
                    <span className="text-gray-700 font-medium">Precisão 10-25m</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-red-100 border-2 border-red-500"></div>
                    <span className="text-gray-700 font-medium">Precisão &gt; 25m</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      {/* Modal de Detalhes */}
      {isModalOpen && selectedPoint && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4" style={{ zIndex: 9999 }}>
          <div
            className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header do Modal */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <MapPinIcon className="h-6 w-6 text-white" />
                  <div>
                    <h3 className="text-lg font-bold text-white">Detalhes do Trabalhador</h3>
                    <p className="text-blue-100 text-sm">
                      Informações completas da localização
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-white hover:text-blue-200 transition-colors p-1 rounded-full hover:bg-white hover:bg-opacity-20"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>
            </div>

            {/* Conteúdo do Modal */}
            <div className="overflow-y-auto max-h-[calc(90vh-80px)]">
              <div className="p-6">
                {/* Cabeçalho com informações do usuário */}
                <div className="flex items-center gap-4 mb-6 pb-4 border-b border-gray-200">
                  <div className="flex-shrink-0">
                    {selectedPoint.Image_hash ? (
                      <img
                        src={`https://smartmachine.smartxhub.cloud/imagem/${selectedPoint.Image_hash}`}
                        alt={selectedPoint.Item_Name || 'Usuário'}
                        className="w-16 h-16 rounded-full object-cover border-4 border-gray-300 shadow-lg"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-blue-100 border-4 border-blue-300 flex items-center justify-center shadow-lg">
                        <span className="text-2xl">👷</span>
                      </div>
                    )}
                  </div>

                  <div className="flex-1">
                    <h2 className="text-xl font-bold text-gray-900">
                      {selectedPoint.Item_Name || 'Trabalhador não identificado'}
                    </h2>
                    <div className="flex items-center gap-2 mt-1">
                      <div
                        className="w-3 h-3 rounded-full border-2 border-white shadow-sm"
                        style={{
                          backgroundColor: getDeviceColor(selectedPoint.dev_eui, uniqueDevices)
                        }}
                      />
                      <code className="text-sm text-gray-600 font-mono">
                        {selectedPoint.dev_eui}
                      </code>
                    </div>
                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                      <span>📅 {new Date(selectedPoint.timestamp).toLocaleDateString('pt-BR')}</span>
                      <span>🕒 {new Date(selectedPoint.timestamp).toLocaleTimeString('pt-BR')}</span>
                    </div>
                  </div>
                </div>

                {/* Grid de Informações */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Coluna 1: Informações de Localização */}
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                      <MapPinIcon className="h-5 w-5 text-blue-500" />
                      Localização GPS
                    </h4>

                    <div className="space-y-3">
                      <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-sm font-medium text-gray-600">Latitude</label>
                            <p className="text-lg font-mono text-gray-900 font-bold">
                              {selectedPoint.gps_latitude}
                            </p>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-gray-600">Longitude</label>
                            <p className="text-lg font-mono text-gray-900 font-bold">
                              {selectedPoint.gps_longitude}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                        <label className="text-sm font-medium text-gray-600 mb-2 block">Precisão do GPS</label>
                        <div className="flex items-center justify-between">
                          <span className={`px-3 py-2 rounded-full text-sm font-medium ${selectedPoint.gps_accuracy < 10 ? 'bg-green-100 text-green-800 border border-green-200' :
                            selectedPoint.gps_accuracy < 25 ? 'bg-yellow-100 text-yellow-800 border border-yellow-200' :
                              'bg-red-100 text-red-800 border border-red-200'
                            }`}>
                            {selectedPoint.gps_accuracy} metros
                          </span>
                          <div className="text-right">
                            <div className="text-xs text-gray-500">Qualidade</div>
                            <div className="text-sm font-medium text-gray-900">
                              {selectedPoint.gps_accuracy < 10 ? '🎯 Excelente' :
                                selectedPoint.gps_accuracy < 25 ? '✅ Boa' : '⚠️ Regular'}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Coluna 2: Informações do Dispositivo */}
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                      <BoltIcon className="h-5 w-5 text-yellow-500" />
                      Status do Dispositivo
                    </h4>

                    <div className="space-y-3">
                      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                        <label className="text-sm font-medium text-gray-600">Data e Hora da Leitura</label>
                        <p className="text-lg font-medium text-gray-900">
                          {new Date(selectedPoint.timestamp).toLocaleDateString('pt-BR', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </p>
                        <p className="text-md text-gray-600 font-medium">
                          {new Date(selectedPoint.timestamp).toLocaleTimeString('pt-BR')}
                        </p>
                      </div>

                      {selectedPoint.battery_level && (
                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                          <div className="flex items-center justify-between mb-2">
                            <label className="text-sm font-medium text-gray-600">Nível da Bateria</label>
                            <span className={`text-sm font-bold ${selectedPoint.battery_level > 50 ? 'text-green-600' :
                              selectedPoint.battery_level > 20 ? 'text-yellow-600' : 'text-red-600'
                              }`}>
                              {selectedPoint.battery_level}%
                            </span>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="flex-1 bg-gray-200 rounded-full h-3">
                              <div
                                className={`h-3 rounded-full ${selectedPoint.battery_level > 50 ? 'bg-green-500' :
                                  selectedPoint.battery_level > 20 ? 'bg-yellow-500' : 'bg-red-500'
                                  }`}
                                style={{ width: `${selectedPoint.battery_level}%` }}
                              ></div>
                            </div>
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {selectedPoint.battery_level > 50 ? '🔋 Bateria em bom estado' :
                              selectedPoint.battery_level > 20 ? '⚡ Bateria moderada' : '🪫 Bateria fraca - recarregar'}
                          </div>
                        </div>
                      )}

                      {selectedPoint.dynamic_motion_state && (
                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                          <label className="text-sm font-medium text-gray-600 mb-2 block">Status de Movimento</label>
                          <div className="flex items-center gap-3">
                            {selectedPoint.dynamic_motion_state === 'MOVING' ? (
                              <>
                                <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse"></div>
                                <span className="text-green-700 font-medium text-lg">🚶 Em movimento</span>
                              </>
                            ) : (
                              <>
                                <div className="w-3 h-3 rounded-full bg-gray-400"></div>
                                <span className="text-gray-700 text-lg">🛑 Parado</span>
                              </>
                            )}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {selectedPoint.dynamic_motion_state === 'MOVING'
                              ? 'O dispositivo está se movendo ativamente'
                              : 'O dispositivo está parado há algum tempo'
                            }
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Informações Técnicas Expandidas */}
                <div className="mt-6 pt-4 border-t border-gray-200">
                  <h4 className="text-lg font-semibold text-gray-900 mb-3">Informações Técnicas</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <label className="text-gray-600 font-medium">DEV_EUI</label>
                      <p className="font-mono text-gray-900 truncate" title={selectedPoint.dev_eui}>
                        {selectedPoint.dev_eui}
                      </p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <label className="text-gray-600 font-medium">Timestamp Original</label>
                      <p className="text-gray-900 font-mono text-xs">
                        {new Date(selectedPoint.timestamp).toISOString()}
                      </p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <label className="text-gray-600 font-medium">ID do Registro</label>
                      <p className="text-gray-900 font-mono">
                        #{selectedPoint?.id || 'N/A'}
                      </p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <label className="text-gray-600 font-medium">Status da Conexão</label>
                      <p className="text-green-600 font-medium flex items-center gap-1">
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                        Online
                      </p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <label className="text-gray-600 font-medium">Tipo de Dispositivo</label>
                      <p className="text-gray-900">Tracker GPS</p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <label className="text-gray-600 font-medium">Última Atualização</label>
                      <p className="text-gray-900">
                        {new Date(selectedPoint.timestamp).toLocaleString('pt-BR')}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Coordenadas para Copiar */}
                <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h5 className="font-medium text-blue-900 mb-2">Coordenadas para compartilhamento</h5>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 bg-white px-3 py-2 rounded border border-blue-300 text-sm text-gray-700 font-mono">
                      {selectedPoint.gps_latitude}, {selectedPoint.gps_longitude}
                    </code>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(`${selectedPoint.gps_latitude}, ${selectedPoint.gps_longitude}`);
                        // Você pode adicionar um toast de confirmação aqui
                      }}
                      className="px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm"
                    >
                      Copiar
                    </button>
                  </div>
                </div>
              </div>
              {/* Footer do Modal */}
              <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
                <div className="flex justify-between items-center">
                  <div className="text-sm text-gray-600">
                    Dados atualizados em {new Date(selectedPoint.timestamp).toLocaleString('pt-BR')}
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setIsModalOpen(false)}
                      className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Fechar
                    </button>
                    <button
                      onClick={() => {
                        // ⭐ EXPORTAR PARA PDF COM GRÁFICOS
                        exportGPSPointToPDF(selectedPoint);
                      }}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="w-4 h-4"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m.75 12l3 3m0 0l3-3m-3 3v-6m-1.5-9H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
                        />
                      </svg>
                      Exportar PDF
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      )}

    </>



  );
};

export default GPSMapViewer;