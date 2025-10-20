// src/components/Map/GPSMapViewer.tsx
import { useEffect, useState, useRef, useCallback } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-polylinedecorator';
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
} from '@heroicons/react/24/outline';

// =====================================
// 🛠️ HELPER FUNCTIONS
// =====================================
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
interface GPSPoint {
  dev_eui: string;
  timestamp: string;
  gps_latitude: number;
  gps_longitude: number;
  gps_accuracy: number;
}

interface GPSFilters {
  dev_eui: string[];
  start_date: string;
  end_date: string;
  valid_gps_only: boolean;
  max_accuracy: string;
  min_accuracy: string;
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

// function RouteArrows({ positions }: { positions: [number, number][] }) {
//   const map = useMap();
//   const decoratorRef = useRef<L.Polyline | null>(null);

//   useEffect(() => {
//     if (positions.length > 1 && map) {
//       if (decoratorRef.current) {
//         map.removeLayer(decoratorRef.current);
//       }

//       const polyline = L.polyline(positions, { color: 'transparent', weight: 0 });
//       const decorator = L.polylineDecorator(polyline, {
//         patterns: [{
//           offset: '5%',
//           repeat: 50,
//           symbol: L.Symbol.arrowHead({
//             pixelSize: 12,
//             polygon: false,
//             pathOptions: {
//               stroke: true,
//               weight: 2,
//               color: '#1e40af',
//               opacity: 0.8,
//             }
//           })
//         }]
//       }).addTo(map);

//       decoratorRef.current = decorator as any;

//       return () => {
//         if (decoratorRef.current) {
//           map.removeLayer(decoratorRef.current);
//         }
//       };
//     }
//   }, [positions, map]);

//   return null;
// }

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

  // Filtros
  const [showFilters, setShowFilters] = useState(true);
  const [filters, setFilters] = useState<GPSFilters>({
    dev_eui: [],
    start_date: '',
    end_date: '',
    valid_gps_only: true,
    max_accuracy: '100',
    min_accuracy: '',
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
        `https://api-dashboards-u1oh.onrender.com/api/dashboard/devices/api/gps-stats?${params}`
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
    if (isPlaying && data.length > 0) {
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
  }, [isPlaying, data.length, playbackSpeed]);

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
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <MapPinIcon className="h-8 w-8 text-white" />
            <div>
              <h2 className="text-xl font-bold text-white">Visualizador de Rotas GPS</h2>
              <p className="text-sm text-blue-100">
                Explore trajetórias e históricos de movimentação
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-colors"
          >
            <FunnelIcon className="h-5 w-5" />
            {showFilters ? 'Ocultar' : 'Mostrar'} Filtros
          </button>
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
                    className={`w-5 h-5 text-gray-400 transition-transform ${
                      isDropdownOpen ? 'transform rotate-180' : ''
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
                              className={`flex items-center px-4 py-2.5 hover:bg-blue-50 cursor-pointer transition-colors border-l-4 ${
                                isSelected ? 'bg-blue-50' : 'border-l-transparent'
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
                                  className={`text-sm font-mono ${
                                    isSelected ? 'font-semibold text-gray-900' : 'text-gray-700'
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

      {/* Player Controls */}
      {validData.length > 0 && (
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
                className={`px-3 py-2 rounded-lg transition-colors ${
                  autoZoomEnabled
                    ? 'bg-green-100 text-green-700'
                    : 'bg-gray-100 text-gray-600'
                }`}
                title="Zoom Automático"
              >
                Auto Zoom {autoZoomEnabled ? '✓' : '✗'}
              </button>

              {/* Tipo de Mapa */}
              <select
                value={mapType}
                onChange={(e) => setMapType(e.target.value as keyof typeof MAP_TYPES)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
              >
                {Object.entries(MAP_TYPES).map(([key, value]) => (
                  <option key={key} value={key}>
                    {value.name}
                  </option>
                ))}
              </select>
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
              <p className="text-gray-600">Nenhuma rota carregada</p>
              <p className="text-sm text-gray-500 mt-2">
                Configure os filtros e clique em "Aplicar Filtros"
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
              autoZoomEnabled={autoZoomEnabled}
            />

            <MapBounds positions={positions} />

            {/* Marcadores - Pontos dos Dispositivos */}
            {/* Marcadores - Pontos dos Dispositivos */}
            {validData.map((point, index) => {
              const isStart = index === 0;
              const isEnd = index === validData.length - 1;
              const isCurrent = index === currentPointIndex;

              // Mostrar mais pontos já que não temos linhas conectando
              const showIntermediate = uniqueDevices.length === 1 
                ? index % 5 === 0   // A cada 5 pontos
                : index % 10 === 0; // A cada 10 pontos para múltiplos

              if (!isStart && !isEnd && !isCurrent && !showIntermediate) return null;

              const deviceColor = getDeviceColor(point.dev_eui, uniqueDevices);

              let color = deviceColor;
              let radius = 6; // Aumentado de 4 para 6 (sem linhas, pontos precisam ser mais visíveis)

              if (isStart) {
                color = '#22c55e';
                radius = 10; // Verde para início
              } else if (isEnd) {
                color = '#ef4444';
                radius = 10; // Vermelho para fim
              } else if (isCurrent) {
                color = '#eab308';
                radius = 12; // Amarelo para ponto atual (player)
              }

              return (
                <CircleMarker
                  key={`${point.dev_eui}-${index}`}
                  center={[point.gps_latitude, point.gps_longitude]}
                  radius={radius}
                  pathOptions={{
                    color,
                    fillColor: color,
                    fillOpacity: isCurrent ? 0.9 : 0.7, // Mais opaco já que não há linhas
                    weight: isCurrent ? 3 : 2,
                  }}
                >
                  <Popup>
                    <div className="p-2">
                      <strong className="text-sm" style={{ color: deviceColor }}>
                        {isStart
                          ? '🟢 Início'
                          : isEnd
                          ? '🔴 Fim'
                          : isCurrent
                          ? '⭐ Atual'
                          : `📍 Ponto ${index + 1}`}
                      </strong>
                      <div className="mt-2 text-xs space-y-1">
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
                      </div>
                    </div>
                  </Popup>
                </CircleMarker>
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
                Dispositivos ({uniqueDevices.length})
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {uniqueDevices.map((devEui) => {
                  const color = getDeviceColor(devEui, uniqueDevices);
                  const devicePointCount = dataByDevice[devEui].length;
                  
                  return (
                    <div
                      key={devEui}
                      className="flex items-center gap-3 p-2 bg-white rounded-lg border border-gray-200"
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full border-2 border-white shadow-md"
                          style={{ backgroundColor: color }}
                        ></div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p
                          className="text-xs font-mono font-semibold truncate"
                          style={{ color: color }}
                          title={devEui}
                        >
                          {devEui}
                        </p>
                        <p className="text-xs text-gray-500">
                          {devicePointCount} pontos
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Legenda de Status dos Pontos */}
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-3">Status dos Pontos</h4>
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
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GPSMapViewer;