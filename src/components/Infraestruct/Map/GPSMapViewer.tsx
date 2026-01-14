// src/components/Map/GPSMapViewer.tsx

// Adicione estas importações no início do arquivo
import { GeoJSON as LeafletGeoJSON } from 'react-leaflet';
import { useEffect, useState, useRef, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import 'leaflet/dist/leaflet.css';
import 'leaflet-polylinedecorator';
import 'leaflet.heat';
import * as L from "leaflet";

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
  FireIcon,
  ArrowsPointingOutIcon, // 🆕 NOVO ÍCONE
  ArrowsPointingInIcon,  // 🆕 NOVO ÍCONE
} from '@heroicons/react/24/outline';
import { exportGPSPointToPDF } from '../../../utils/exportGPSPointToPDF'
import { useTranslation } from 'react-i18next';
import { t } from 'i18next';
import { useCompany } from '../../../hooks/useCompany';
import PersonSensorMapPopup from '../Components/PersonSensorPopup';
import MapTrackingModal from './MapTrackingModal';

// =====================================
// 👷 ÍCONES PERSONALIZADOS PARA TRABALHADORES
// =====================================

const createWorkerIcon = (color: string = '#3b82f6', photoUrl?: string, userName?: string) => {
  return L.divIcon({
    html: `
      <div style="
        position: relative;
        width: 42px;
        height: 42px;
        background-color: ${color};
        border: 3px solid white;
        border-radius: 50%;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        overflow: hidden;
      ">
        ${photoUrl ? `
          <img 
            src="${photoUrl}" 
            alt="${userName || 'Worker'}"
            style="
              width: 100%;
              height: 100%;
              object-fit: cover;
            "
            onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';"
          />
          <div style="
            display: none;
            width: 100%;
            height: 100%;
            background-color: ${color};
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: bold;
            font-size: 16px;
          ">👷</div>
        ` : `
          <div style="
            color: white;
            font-weight: bold;
            font-size: 18px;
          ">👷</div>
        `}
        <div style="
          position: absolute;
          bottom: -2px;
          right: -2px;
          width: 12px;
          height: 12px;
          background-color: ${color};
          border: 2px solid white;
          border-radius: 50%;
        "></div>
      </div>
    `,
    className: 'custom-worker-icon',
    iconSize: [42, 42],
    iconAnchor: [21, 42],
    popupAnchor: [0, -42],
  });
};

const getUserPhotoUrl = (point: GPSPoint): string | undefined => {
  if (point.Image_hash) {
    return `https://smartmachine.smartxhub.cloud/imagem/${point.Image_hash}`;
  }
  return undefined;
};

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
// 🔢 ÍCONE CUSTOMIZADO PARA CLUSTERS
// =====================================
const createClusterCustomIcon = (cluster: any) => {
  const count = cluster.getChildCount();

  let sizeClass = 'small';
  if (count > 50) {
    sizeClass = 'large';
  } else if (count > 10) {
    sizeClass = 'medium';
  }

  return L.divIcon({
    html: `
      <div class="custom-cluster-icon ${sizeClass}">
        <div style="
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
        ">
          <span style="font-size: ${sizeClass === 'large' ? '18px' : '16px'};">
            👷
          </span>
          <span style="
            font-weight: bold;
            margin-top: -2px;
            font-size: ${sizeClass === 'large' ? '14px' : '12px'};
          ">
            ${count}
          </span>
        </div>
      </div>
    `,
    className: 'custom-cluster-marker',
    iconSize: L.point(
      sizeClass === 'large' ? 60 : sizeClass === 'medium' ? 50 : 40,
      sizeClass === 'large' ? 60 : sizeClass === 'medium' ? 50 : 40
    ),
  });
};

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

const DEVICE_COLORS = [
  '#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6',
  '#ec4899', '#14b8a6', '#f97316', '#6366f1', '#84cc16',
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
    name: t('gpsMap.map.streets'),
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; OpenStreetMap',
    maxNativeZoom: 19,
    maxZoom: 22
  },
  satellite: {
    name: t('gpsMap.map.satellite'),
    url: 'https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}',
    attribution: '&copy; Google',
    maxNativeZoom: 21,
    maxZoom: 22
  },
  terrain: {
    name: t('gpsMap.map.terrain'),
    url: 'https://mt1.google.com/vt/lyrs=p&x={x}&y={y}&z={z}',
    attribution: '&copy; Google',
    maxNativeZoom: 20,
    maxZoom: 22
  },
  dark: {
    name: t('gpsMap.map.dark'),
    url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    attribution: '&copy; CARTO',
    maxNativeZoom: 20,
    maxZoom: 22
  },
};
//@ts-ignore
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
  battery_level?: number;
  dynamic_motion_state?: string;
  Item_Name?: string;
  Image_hash?: string;
  id?: number;
}

interface DeviceInfo {
  person_code: string;
  person_name: string;
}

interface GPSFilters {
  dev_eui: string[];
  start_date: string;
  end_date: string;
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

interface Zone {
  id: number;
  company_id: number;
  group_name: string;
  boundary_name: string;
  code: string;
  active: boolean;
  date_start: string;
  date_end: string;
  notes: string;
  geojson_data: any;
}

// =====================================
// 🗺️ COMPONENTES AUXILIARES DO MAPA
// =====================================
function ControlledAutoZoom({
  position,
  isPlaying,
  autoZoomEnabled,
  shouldApplyZoom
}: {
  position: [number, number] | null;
  isPlaying: boolean;
  autoZoomEnabled: boolean;
  shouldApplyZoom: boolean;
}) {
  const map = useMap();

  useEffect(() => {
    if (!autoZoomEnabled || !shouldApplyZoom || !position || !isPlaying) return;

    map.setView(position, 17, {
      animate: true,
      duration: 1.0,
      easeLinearity: 0.25
    });
  }, [position, isPlaying, autoZoomEnabled, shouldApplyZoom, map]);

  return null;
}



// =====================================
// 🎯 COMPONENTE PRINCIPAL
// =====================================

const GPSMapViewer = () => {
  const { t } = useTranslation();
  const { companyId } = useCompany()
  
  // 🆕 ESTADOS PARA FULLSCREEN
  const [isFullscreen, setIsFullscreen] = useState(false);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  
  const [shouldApplyPlayerZoom, setShouldApplyPlayerZoom] = useState(false);
  const [data, setData] = useState<GPSPoint[]>([]);
  const [stats, setStats] = useState<GPSStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [availableDevices, setAvailableDevices] = useState<DeviceInfo[]>([]);
  const [loadingDevices, setLoadingDevices] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPoint, setSelectedPoint] = useState<GPSPoint | any>(null);

  const [showFilters, setShowFilters] = useState(true);
  const [filters, setFilters] = useState<GPSFilters>({
    dev_eui: [],
    start_date: '',
    end_date: '',
    max_accuracy: '100',
    min_accuracy: '',
  });

  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<GPSResponse['pagination'] | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentPointIndex, setCurrentPointIndex] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState(1000);
  const [autoZoomEnabled, setAutoZoomEnabled] = useState(true);

  const [mapType, setMapType] = useState<keyof typeof MAP_TYPES>('satellite');
  const [showHeatmap, setShowHeatmap] = useState(false);

  const [loadingPopupData, setLoadingPopupData] = useState<string | null>(null);
  const [sensorDataCache, setSensorDataCache] = useState<Record<string, any>>({});
  //@ts-ignore
  const [loadingSensorData, setLoadingSensorData] = useState(false);

  const [trackingModalOpen, setTrackingModalOpen] = useState(false);
  const [trackingDevice, setTrackingDevice] = useState<{
    code: string;
    name?: string;
    photoUrl?: string;
  } | null>(null);

  const [center] = useState<[number, number]>([-2.5307, -44.3068]);

  const playIntervalRef = useRef<any | null>(null);

  const [zones, setZones] = useState<Zone[]>([]);
  const [showZones, setShowZones] = useState(true);
  const [zonesError, setZonesError] = useState<string | null>(null);
  const [loadingZones, setLoadingZones] = useState(false);
  const [clusteringEnabled, setClusteringEnabled] = useState(true);

  // 🆕 FUNÇÃO PARA TOGGLE FULLSCREEN
  const toggleFullscreen = useCallback(() => {
    if (!mapContainerRef.current) return;

    if (!document.fullscreenElement) {
      mapContainerRef.current.requestFullscreen().then(() => {
        setIsFullscreen(true);
      }).catch((err) => {
        console.error('Erro ao entrar em fullscreen:', err);
      });
    } else {
      document.exitFullscreen().then(() => {
        setIsFullscreen(false);
      }).catch((err) => {
        console.error('Erro ao sair do fullscreen:', err);
      });
    }
  }, []);

  // 🆕 LISTENER PARA MUDANÇAS NO FULLSCREEN (ESC, etc)
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  const handleOpenTracking = useCallback((point: GPSPoint) => {
    console.log('🗺️ Abrindo modal de tracking para:', point.dev_eui);
    
    setTrackingDevice({
      code: point.dev_eui,
      name: point.Item_Name || 'Trabalhador',
      photoUrl: point.Image_hash 
        ? `https://smartmachine.smartxhub.cloud/imagem/${point.Image_hash}` 
        : undefined
    });
    setTrackingModalOpen(true);
  }, []);

  const convertToPersonSensorData = (point: GPSPoint, sensorData?: any) => {
    return {
      sensor_id: point.id || 0,
      person_code: point.dev_eui,
      person_name: point.Item_Name || 'Trabalhador',
      dev_uid: point.dev_eui,
      latitude: point.gps_latitude,
      longitude: point.gps_longitude,
      battery_level: point.battery_level,
      motion_status: point.dynamic_motion_state,
      Image_hash: point.Image_hash,
      last_report_datetime: point.timestamp,
      ...sensorData,
      company_id: companyId,
      is_active: true,
      sensor_model: 'GPS Tracker',
    };
  };

  const handleMarkerClick = useCallback(async (point: GPSPoint) => {
    console.log('👆 Clicou no marcador:', point.dev_eui);

    const personCode = point.dev_eui;

    if (!personCode) {
      console.warn('⚠️ Marcador sem person_code');
      return;
    }

    if (loadingPopupData === personCode) {
      console.log('⏳ Já está carregando dados para:', personCode);
      return;
    }

    if (sensorDataCache[personCode]) {
      console.log('✅ Dados já estão no cache:', personCode);
      return;
    }

    console.log('🔍 Buscando dados detalhados para:', personCode);
    setLoadingPopupData(personCode);

    try {
      const url = `https://apinode.smartxhub.cloud/api/dashboard/devices/${companyId}/person-sensors/code/${personCode}`;
      console.log('📡 URL:', url);

      const response = await fetch(url);

      if (response.ok) {
        const result = await response.json();

        if (result.success && result.data) {
          console.log('✅ Dados carregados com sucesso!');

          setSensorDataCache(prev => ({
            ...prev,
            [personCode]: result.data
          }));
        }
      } else {
        console.error('❌ Erro na API:', response.status);
      }
    } catch (error) {
      console.error('❌ Erro ao buscar dados:', error);
    } finally {
      setLoadingPopupData(null);
    }
  }, [companyId, sensorDataCache, loadingPopupData]);

  // =====================================
  // 🔍 FUNÇÃO AUXILIAR PARA BUSCA
  // =====================================
  const getDeviceDisplayName = (device: DeviceInfo): string => {
    return `${device.person_code} - ${device.person_name}`;
  };

  const filterDevicesBySearch = (devices: DeviceInfo[], search: string): DeviceInfo[] => {
    if (!search) return devices;

    const searchLower = search.toLowerCase();
    return devices.filter(device =>
      device.person_code.toLowerCase().includes(searchLower) ||
      device.person_name.toLowerCase().includes(searchLower)
    );
  };

  // =====================================
  // 📅 CONFIGURAR DATAS INICIAIS
  // =====================================
  useEffect(() => {
    const now = new Date();
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);

    const formatDateTimeLocal = (date: Date): string => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');

      return `${year}-${month}-${day}T${hours}:${minutes}`;
    };

    setFilters(prev => ({
      ...prev,
      start_date: formatDateTimeLocal(yesterday),
      end_date: formatDateTimeLocal(now)
    }));
  }, []);

  // =====================================
  // 🚀 BUSCAR DADOS AUTOMATICAMENTE
  // =====================================
  useEffect(() => {
    if (filters.start_date && filters.end_date) {
      fetchGPSData(1);
    }
  }, [filters.start_date, filters.end_date]);

  // =====================================
  // 📡 FETCH DE DISPOSITIVOS
  // =====================================
  const fetchAvailableDevices = useCallback(async () => {
    setLoadingDevices(true);
    try {
      const response = await fetch(
        `https://apinode.smartxhub.cloud/api/dashboard/devices/${companyId}/device/list`
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
    } finally {
      setLoadingDevices(false);
    }
  }, [companyId]);

  useEffect(() => {
    fetchAvailableDevices();
  }, [fetchAvailableDevices]);

  // =====================================
  // 📡 FETCH DE DADOS GPS
  // =====================================
  const fetchGPSData = useCallback(async (pageNum: number = 1) => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        page: pageNum.toString(),
        limit: '1000',
        sortBy: 'log_id',
        sortOrder: 'DESC',
      });

      if (filters.dev_eui.length > 0) {
        params.append('dev_eui', filters.dev_eui.join(','));
      }

      if (filters.start_date) {
        const startDate = new Date(filters.start_date);
        params.append('start_date', startDate.toISOString());
      }

      if (filters.end_date) {
        const endDate = new Date(filters.end_date);
        params.append('end_date', endDate.toISOString());
      }

      if (filters.min_accuracy) params.append('min_accuracy', filters.min_accuracy);

      const response = await fetch(
        `https://apinode.smartxhub.cloud/api/dashboard/devices/${companyId}/gps-route?${params}`
      );

      if (!response.ok) {
        throw new Error('Falha ao carregar dados GPS');
      }

      const result: GPSResponse = await response.json();

      setData(result.data);
      setPagination(result.pagination);
      setCurrentPointIndex(0);
      setIsPlaying(false);

      await fetchStats();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
      console.error('Error fetching GPS data:', err);
    } finally {
      setLoading(false);
    }
  }, [filters, companyId]);

  const fetchStats = async () => {
    try {
      const params = new URLSearchParams();
      if (filters.dev_eui.length > 0) {
        params.append('dev_eui', filters.dev_eui.join(','));
      }
      if (filters.start_date) params.append('start_date', filters.start_date);
      if (filters.end_date) params.append('end_date', filters.end_date);

      const response = await fetch(
        `https://apinode.smartxhub.cloud/api/dashboard/devices/${companyId}/gps-stats`
      );

      if (response.ok) {
        const result = await response.json();
        setStats(result.data);
      }
    } catch (err) {
      console.error('Error fetching GPS stats:', err);
    }
  };

  const fetchZones = useCallback(async () => {
    setLoadingZones(true);
    setZonesError(null);

    try {
      const url = `https://apinode.smartxhub.cloud/api/dashboard/devices/${companyId}/zones/active`;

      const response = await fetch(url);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ [GPSMapViewer] Response error:', errorText);
        throw new Error(`Falha ao carregar zonas: ${response.status} ${errorText}`);
      }

      const result = await response.json();

      if (result.success && Array.isArray(result.data)) {
        setZones(result.data);
      } else {
        console.warn('⚠️ [GPSMapViewer] Resposta inválida:', result);
      }
    } catch (err) {
      console.error('❌ [GPSMapViewer] Erro ao buscar zonas:', err);
      const errorMsg = err instanceof Error ? err.message : 'Erro desconhecido';
      console.error('Erro ao buscar zonas:', errorMsg);
      setZonesError(errorMsg);
    } finally {
      setLoadingZones(false);
    }
  }, [companyId]);

  useEffect(() => {
    fetchZones();
  }, [fetchZones]);

  const getZoneStyle = (feature: any) => {
    const color = feature.properties.color?.replace('%23', '#') || '#5319FF';

    return {
      color: color,
      weight: feature.properties.weight || 3,
      opacity: feature.properties.opacity || 1,
      fillColor: feature.properties.fillColor || color,
      fillOpacity: feature.properties.fillOpacity || 0.2,
      dashArray: feature.properties.dashArray || null,
    };
  };

  const onEachZone = (feature: any, layer: L.Layer, zoneInfo: Zone) => {
    const popupContent = `
      <div style="font-family: Arial, sans-serif; min-width: 200px;">
        <h3 style="margin: 0 0 10px 0; color: #333;">${zoneInfo.boundary_name}</h3>
        <p style="margin: 5px 0;"><strong>Grupo:</strong> ${zoneInfo.group_name}</p>
        <p style="margin: 5px 0;"><strong>Código:</strong> ${zoneInfo.code}</p>
        <p style="margin: 5px 0;"><strong>Status:</strong> 
          <span style="color: ${zoneInfo.active ? 'green' : 'red'}">
            ${zoneInfo.active ? '✓ Ativa' : '✗ Inativa'}
          </span>
        </p>
        ${zoneInfo.notes ? `<p style="margin: 5px 0;"><strong>Obs:</strong> ${zoneInfo.notes}</p>` : ''}
      </div>
    `;

    layer.bindPopup(popupContent);

    layer.on({
      mouseover: (e) => {
        const layer = e.target;
        layer.setStyle({
          weight: 5,
          fillOpacity: 0.4,
        });
      },
      mouseout: (e) => {
        const layer = e.target;
        layer.setStyle(getZoneStyle(feature));
      },
    });
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

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
    setShouldApplyPlayerZoom(true);
  };

  const stopPlayback = () => {
    setIsPlaying(false);
    setCurrentPointIndex(0);
    setShouldApplyPlayerZoom(false);
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

  const dataByDevice = validData.reduce((acc, point) => {
    if (!acc[point.dev_eui]) {
      acc[point.dev_eui] = [];
    }
    acc[point.dev_eui].push(point);
    return acc;
  }, {} as Record<string, GPSPoint[]>);

  const uniqueDevices = Object.keys(dataByDevice);

  const currentPosition =
    validData.length > 0 && currentPointIndex < validData.length
      ? [validData[currentPointIndex].gps_latitude, validData[currentPointIndex].gps_longitude] as [number, number]
      : null;

  const progress = validData.length > 0 ? ((currentPointIndex / (validData.length - 1)) * 100) : 0;

  // =====================================
  // 🎨 HANDLERS DE FILTROS
  // =====================================
  const toggleDevice = (personCode: string) => {
    setFilters((prev) => {
      const isSelected = prev.dev_eui.includes(personCode);
      return {
        ...prev,
        dev_eui: isSelected
          ? prev.dev_eui.filter((d) => d !== personCode)
          : [...prev.dev_eui, personCode],
      };
    });
  };

  const selectAllDevices = () => {
    setFilters((prev) => ({
      ...prev,
      dev_eui: availableDevices.map(d => d.person_code),
    }));
  };

  const deselectAllDevices = () => {
    setFilters((prev) => ({
      ...prev,
      dev_eui: [],
    }));
  };

  const handleRemoveDevEui = (personCode: string) => {
    setFilters((prev) => ({
      ...prev,
      dev_eui: prev.dev_eui.filter((d) => d !== personCode),
    }));
  };

  const handleClearFilters = () => {
    setFilters({
      dev_eui: [],
      start_date: '',
      end_date: '',
      max_accuracy: '100',
      min_accuracy: '',
    });
  };

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

  const filteredDevices = filterDevicesBySearch(availableDevices, searchTerm);

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
                <h2 className="text-xl font-bold text-white">{t('gpsMap.title')}</h2>
                <p className="text-sm text-blue-100">
                  {t('gpsMap.subtitle')}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setClusteringEnabled(!clusteringEnabled)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${clusteringEnabled
                  ? 'bg-purple-500 hover:bg-purple-600 text-white'
                  : 'bg-white/20 hover:bg-white/30 text-white'
                  }`}
                title={clusteringEnabled ? 'Desativar Agrupamento' : 'Ativar Agrupamento'}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="h-5 w-5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 6.878V6a2.25 2.25 0 012.25-2.25h7.5A2.25 2.25 0 0118 6v.878m-12 0c.235-.083.487-.128.75-.128h10.5c.263 0 .515.045.75.128m-12 0A2.25 2.25 0 004.5 9v.878m13.5-3A2.25 2.25 0 0119.5 9v.878m0 0a2.246 2.246 0 00-.75-.128H5.25c-.263 0-.515.045-.75.128m15 0A2.25 2.25 0 0121 12v6a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 18v-6c0-.98.626-1.813 1.5-2.122"
                  />
                </svg>
                Agrupar ({clusteringEnabled ? 'ON' : 'OFF'})
              </button>

              <button
                onClick={() => {
                  setShowZones(!showZones);
                }}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${showZones
                  ? 'bg-purple-500 hover:bg-purple-600 text-white'
                  : 'bg-white/20 hover:bg-white/30 text-white'
                  }`}
                title={showZones ? 'Ocultar Cercas' : 'Mostrar Cercas'}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="h-5 w-5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 6.75V15m6-6v8.25m.503 3.498l4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 00-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0z"
                  />
                </svg>
                Cercas ({zones.length})
              </button>

              <button
                onClick={() => setShowHeatmap(!showHeatmap)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${showHeatmap
                  ? 'bg-orange-500 hover:bg-orange-600 text-white'
                  : 'bg-white/20 hover:bg-white/30 text-white'
                  }`}
                title={showHeatmap ? t('gpsMap.map.hideHeatmap') : t('gpsMap.map.showHeatmap')}
              >
                <FireIcon className="h-5 w-5" />
                {t('gpsMap.map.heatmap')}
              </button>

              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-colors"
              >
                <FunnelIcon className="h-5 w-5" />
                {showFilters ? t('gpsMap.filters.hide') : t('gpsMap.filters.show')}
              </button>
            </div>
          </div>
        </div>

        {zonesError && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <div className="flex items-center gap-2">
              <ExclamationCircleIcon className="h-5 w-5 text-red-600" />
              <p className="text-sm text-red-600">
                Erro ao carregar cercas: {zonesError}
              </p>
            </div>
          </div>
        )}

        {/* Filtros */}
        {showFilters && (
          <div className="bg-gray-50 border-b border-gray-200 px-6 py-4">
            <div className="space-y-4">
              {/* Dev EUI Dropdown */}
              <div className="dropdown-container">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('gpsMap.filters.devices')}
                  {loadingDevices && (
                    <span className="ml-2 text-xs text-gray-500 animate-pulse">
                      {t('gpsMap.filters.loadingDevices')}
                    </span>
                  )}
                </label>

                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    disabled={loadingDevices || availableDevices.length === 0}
                    className="w-full flex items-center justify-between px-4 py-2.5 bg-white border border-gray-300 rounded-lg hover:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:bg-gray-50 disabled:cursor-not-allowed"
                  >
                    <span className="text-sm text-gray-700">
                      {filters.dev_eui.length === 0
                        ? t('gpsMap.filters.selectDevices')
                        : t('gpsMap.filters.devicesSelected', { count: filters.dev_eui.length })}
                    </span>
                    <svg
                      className={`w-5 h-5 text-gray-400 transition-transform ${isDropdownOpen ? 'transform rotate-180' : ''}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {isDropdownOpen && (
                    <div className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg max-h-80 overflow-hidden">
                      <div className="sticky top-0 bg-white border-b border-gray-200 p-3 space-y-2">
                        <div className="relative">
                          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <input
                            type="text"
                            placeholder="Buscar por código ou nome..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            onClick={(e) => e.stopPropagation()}
                          />
                          {searchTerm && (
                            <button
                              onClick={() => setSearchTerm('')}
                              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                              <XMarkIcon className="h-4 w-4" />
                            </button>
                          )}
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={selectAllDevices}
                              className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                            >
                              {t('gpsMap.filters.selectAll')}
                            </button>
                            <span className="text-gray-300">|</span>
                            <button
                              type="button"
                              onClick={deselectAllDevices}
                              className="text-xs text-red-600 hover:text-red-800 font-medium"
                            >
                              {t('gpsMap.filters.clear')}
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
                      </div>

                      <div className="overflow-y-auto max-h-64">
                        {filteredDevices.length === 0 ? (
                          <div className="px-4 py-8 text-center text-sm text-gray-500">
                            {searchTerm ? 'Nenhum dispositivo encontrado' : t('gpsMap.filters.noDevices')}
                          </div>
                        ) : (
                          filteredDevices.map((device) => {
                            const isSelected = filters.dev_eui.includes(device.person_code);
                            const color = getDeviceColor(device.person_code, filters.dev_eui);

                            return (
                              <label
                                key={device.person_code}
                                className={`flex items-center px-4 py-2.5 hover:bg-blue-50 cursor-pointer transition-colors border-l-4 ${isSelected ? 'bg-blue-50' : 'border-l-transparent'
                                  }`}
                                style={{
                                  borderLeftColor: isSelected ? color : 'transparent',
                                }}
                              >
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  onChange={() => toggleDevice(device.person_code)}
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
                                    className={`text-sm ${isSelected ? 'font-semibold text-gray-900' : 'text-gray-700'
                                      }`}
                                  >
                                    {getDeviceDisplayName(device)}
                                  </span>
                                </span>
                              </label>
                            );
                          })
                        )}
                      </div>

                      <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-3 py-2">
                        <div className="flex items-center justify-between">
                          <p className="text-xs text-gray-600">
                            {filteredDevices.length} de {availableDevices.length} dispositivos
                            {searchTerm && ' (filtrado)'}
                          </p>
                          {searchTerm && (
                            <button
                              onClick={() => setSearchTerm('')}
                              className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                            >
                              Limpar filtro
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {filters.dev_eui.length > 0 && (
                  <div className="mt-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">
                        {t('gpsMap.filters.selected', { count: filters.dev_eui.length })}
                      </span>
                      <button
                        onClick={deselectAllDevices}
                        className="text-xs text-red-600 hover:text-red-800 font-medium"
                      >
                        {t('gpsMap.filters.removeAll')}
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2 p-3 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg border border-blue-200 max-h-32 overflow-y-auto">
                      {filters.dev_eui.map((personCode) => {
                        const device = availableDevices.find(d => d.person_code === personCode);
                        const color = getDeviceColor(personCode, filters.dev_eui);
                        return (
                          <span
                            key={personCode}
                            className="inline-flex items-center gap-2 px-3 py-1.5 bg-white rounded-full text-sm border-2 shadow-sm hover:shadow-md transition-shadow"
                            style={{ borderColor: color }}
                          >
                            <span
                              className="w-3 h-3 rounded-full ring-2 ring-white"
                              style={{ backgroundColor: color }}
                            ></span>
                            <span className="font-semibold text-gray-700">
                              {device ? getDeviceDisplayName(device) : personCode}
                            </span>
                            <button
                              onClick={() => handleRemoveDevEui(personCode)}
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
                    {t('gpsMap.filters.startDate')}
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
                    {t('gpsMap.filters.endDate')}
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
                    {t('gpsMap.filters.minAccuracy')}
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
                    {t('gpsMap.filters.maxAccuracy')}
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

              {/* Botões de Ação */}
              <div className="flex gap-2">
                <button
                  onClick={handleApplyFilters}
                  disabled={loading}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
                >
                  <MagnifyingGlassIcon className="h-5 w-5" />
                  {loading ? t('gpsMap.filters.searching') : t('gpsMap.filters.applyFilters')}
                </button>
                <button
                  onClick={handleClearFilters}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  {t('gpsMap.filters.clear')}
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
                <p className="text-xs text-gray-600">{t('gpsMap.stats.totalPoints')}</p>
                <p className="text-lg font-bold text-blue-600">
                  {toNumber(stats.total_records).toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-600">{t('gpsMap.stats.devices')}</p>
                <p className="text-lg font-bold text-blue-600">
                  {toNumber(stats.unique_devices)}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-600">{t('gpsMap.stats.avgAccuracy')}</p>
                <p className="text-lg font-bold text-blue-600">
                  {formatNumber(stats.avg_accuracy, 1)}m
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-600">{t('gpsMap.stats.minAccuracy')}</p>
                <p className="text-sm font-medium text-green-600">
                  {formatNumber(stats.min_accuracy, 1)}m
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-600">{t('gpsMap.stats.maxAccuracy')}</p>
                <p className="text-sm font-medium text-red-600">
                  {formatNumber(stats.max_accuracy, 1)}m
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-600">{t('gpsMap.stats.firstRecord')}</p>
                <p className="text-xs font-medium text-gray-900">
                  {stats.oldest_record
                    ? new Date(stats.oldest_record).toLocaleDateString('pt-BR')
                    : 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-600">{t('gpsMap.stats.lastRecord')}</p>
                <p className="text-xs font-medium text-gray-900">
                  {stats.newest_record
                    ? new Date(stats.newest_record).toLocaleDateString('pt-BR')
                    : 'N/A'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Controles do Player */}
        {validData.length > 0 && (
          <div className="bg-white border-b border-gray-200 px-6 py-4">
            <div className="space-y-4">
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

                <button
                  onClick={() => setAutoZoomEnabled(!autoZoomEnabled)}
                  className={`px-3 py-2 rounded-lg transition-colors ${autoZoomEnabled
                    ? 'bg-green-100 text-green-700'
                    : 'bg-gray-100 text-gray-600'
                    }`}
                  title="Zoom Automático"
                >
                  {t('gpsMap.player.autoZoom')} {autoZoomEnabled ? '✓' : '✗'}
                </button>
              </div>

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

        {/* Seletor de Tipo de Mapa */}
        {validData.length > 0 && (
          <div className="bg-white border-b border-gray-200 px-6 py-3">
            <div className="flex items-center justify-center gap-4">
              <span className="text-sm font-medium text-gray-700">{t('gpsMap.map.type')}</span>
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

        {/* 🆕 MAPA COM BOTÃO DE FULLSCREEN */}
        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center h-[700px]">
              <div className="text-center">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">{t('gpsMap.status.loading')}</p>
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
                  {t('gpsMap.status.tryAgain')}
                </button>
              </div>
            </div>
          ) : data.length === 0 ? (
            <div className="flex items-center justify-center h-[700px]">
              <div className="text-center">
                <MapPinIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">{t('gpsMap.modes.noRoute')}</p>
                <p className="text-sm text-gray-500 mt-2">
                  {t('gpsRouteMap.map.configureFilters')}
                </p>
              </div>
            </div>
          ) : (
            <div 
              ref={mapContainerRef}
              className={`relative rounded-lg shadow-md ${isFullscreen ? 'bg-white' : ''}`}
            >
              {/* 🆕 BOTÃO DE FULLSCREEN */}
              <button
                onClick={toggleFullscreen}
                className="absolute top-4 right-4 z-[1000] bg-white hover:bg-gray-100 text-gray-700 p-3 rounded-lg shadow-lg transition-all duration-200 hover:shadow-xl border border-gray-200"
                title={isFullscreen ? 'Sair do Fullscreen (ESC)' : 'Fullscreen'}
              >
                {isFullscreen ? (
                  <ArrowsPointingInIcon className="h-5 w-5" />
                ) : (
                  <ArrowsPointingOutIcon className="h-5 w-5" />
                )}
              </button>

              <MapContainer
                center={currentPosition || center}
                zoom={13}
                maxZoom={22}
                zoomControl={false}
                style={{ 
                  height: isFullscreen ? '100vh' : '100vh', 
                  width: '100%' 
                }}
                className="rounded-lg"
              >
                <TileLayer
                  attribution={MAP_TYPES[mapType].attribution}
                  url={MAP_TYPES[mapType].url}
                  maxNativeZoom={MAP_TYPES[mapType]?.maxNativeZoom}
                  maxZoom={MAP_TYPES[mapType].maxZoom}
                />

                <ControlledAutoZoom
                  position={currentPosition}
                  isPlaying={isPlaying}
                  autoZoomEnabled={autoZoomEnabled}
                  shouldApplyZoom={shouldApplyPlayerZoom}
                />

                <HeatmapLayer points={validData} show={showHeatmap} />

                {showZones && zones.map((zone) => (
                  <LeafletGeoJSON
                    key={zone.id}
                    data={zone.geojson_data}
                    style={getZoneStyle}
                    onEachFeature={(feature, layer) => onEachZone(feature, layer, zone)}
                  />
                ))}

                {clusteringEnabled ? (
                  <MarkerClusterGroup
                    chunkedLoading
                    iconCreateFunction={createClusterCustomIcon}
                    maxClusterRadius={50}
                    spiderfyOnMaxZoom={true}
                    showCoverageOnHover={true}
                    zoomToBoundsOnClick={true}
                    removeOutsideVisibleBounds={true}
                  >
                    {validData.map((point, index) => {
                      const isStart = index === 0;
                      const isEnd = index === validData.length - 1;
                      const isCurrent = index === currentPointIndex;

                      const deviceColor = getDeviceColor(point.dev_eui, uniqueDevices);
                      const photoUrl = getUserPhotoUrl(point);
                      const userName = point.Item_Name || 'Trabalhador';

                      let icon;

                      if (isStart) {
                        icon = createWorkerIcon('#22c55e', photoUrl, userName);
                      } else if (isEnd) {
                        icon = createWorkerIcon('#ef4444', photoUrl, userName);
                      } else if (isCurrent) {
                        icon = createCurrentWorkerIcon('#eab308');
                      } else {
                        icon = createWorkerIcon(deviceColor, photoUrl, userName);
                      }

                      const personCode = point.dev_eui;
                      const cachedData = sensorDataCache[personCode];
                      const sensorData = convertToPersonSensorData(point, cachedData);

                      return (
                        <Marker
                          key={`${point.dev_eui}-${index}`}
                          position={[point.gps_latitude, point.gps_longitude]}
                          icon={icon}
                          eventHandlers={{
                            click: () => handleMarkerClick(point)
                          }}
                        >
                          <PersonSensorMapPopup
                            sensor={sensorData}
                            loading={loadingPopupData === personCode}
                            onViewDetails={() => {
                              setSelectedPoint(point);
                              setIsModalOpen(true);
                            }}
                            onTracking={() => {
                              handleOpenTracking(point);
                            }}
                          />
                        </Marker>
                      );
                    })}
                  </MarkerClusterGroup>
                ) : (
                  <>
                    {validData.map((point, index) => {
                      const isStart = index === 0;
                      const isEnd = index === validData.length - 1;
                      const isCurrent = index === currentPointIndex;

                      const deviceColor = getDeviceColor(point.dev_eui, uniqueDevices);
                      const photoUrl = getUserPhotoUrl(point);
                      const userName = point.Item_Name || t('gpsMap.gpsMap.popup.unknownWorker');

                      let icon;
                      let status;

                      if (isStart) {
                        icon = createWorkerIcon('#22c55e', photoUrl, userName);
                        status = t('gpsRouteMap.markers.start');
                      } else if (isEnd) {
                        icon = createWorkerIcon('#ef4444', photoUrl, userName);
                        status = t('gpsRouteMap.markers.end');
                      } else if (isCurrent) {
                        icon = createCurrentWorkerIcon('#eab308');
                        status = t('gpsRouteMap.markers.currentPosition');
                      } else {
                        icon = createWorkerIcon(deviceColor, photoUrl, userName);
                        status = `${t('gpsRouteMap.markers.point')} ${index + 1}`;
                      }

                      return (
                        <Marker
                          key={`${point.dev_eui}-${index}`}
                          position={[point.gps_latitude, point.gps_longitude]}
                          icon={icon}
                        >
                          <Popup>
                            <div className="p-2 min-w-[240px] max-w-[280px]">
                              <div className="flex items-center gap-3 mb-3 pb-2 border-b border-gray-200">
                                <div className="flex-shrink-0">
                                  {point.Image_hash ? (
                                    <img
                                      src={`https://smartmachine.smartxhub.cloud/imagem/${point.Image_hash}`}
                                      alt={point.Item_Name || t('gpsMap.gpsMap.popup.unknownWorker')}
                                      className="w-12 h-12 rounded-full object-cover border-2 border-gray-300"
                                    />
                                  ) : (
                                    <div className="w-12 h-12 rounded-full bg-blue-100 border-2 border-blue-300 flex items-center justify-center">
                                      <span className="text-lg">👷</span>
                                    </div>
                                  )}
                                </div>

                                <div className="flex-1 min-w-0">
                                  <h3 className="font-semibold text-gray-900 text-sm truncate">
                                    {point.Item_Name || t('gpsMap.gpsMap.popup.unknownWorker')}
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

                              <div className="mb-3">
                                <div className="flex items-center justify-between">
                                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full font-medium">
                                    {status}
                                  </span>
                                  <span className="text-xs text-gray-500">
                                    {new Date(point.timestamp).toLocaleTimeString(t('gpsMap.gpsMap.popup.locale'))}
                                  </span>
                                </div>
                                <div className="text-xs text-gray-500 mt-1">
                                  {new Date(point.timestamp).toLocaleDateString(t('gpsMap.gpsMap.popup.locale'))}
                                </div>
                              </div>

                              <div className="space-y-2 text-sm">
                                <div className="grid grid-cols-2 gap-2">
                                  <div>
                                    <span className="text-gray-600 font-medium">{t('gpsMap.gpsMap.popup.latitude')}:</span>
                                    <div className="text-gray-900 font-mono text-xs">{point.gps_latitude}</div>
                                  </div>
                                  <div>
                                    <span className="text-gray-600 font-medium">{t('gpsMap.gpsMap.popup.longitude')}:</span>
                                    <div className="text-gray-900 font-mono text-xs">{point.gps_longitude}</div>
                                  </div>
                                </div>

                                <div className="pt-2 border-t border-gray-100 space-y-1">
                                  {point.battery_level && (
                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center gap-1">
                                        <BoltIcon className="h-4 w-4 text-yellow-600" />
                                        <span className="text-gray-600 font-medium">{t('gpsMap.gpsMap.popup.battery')}:</span>
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
                                      <span className="text-gray-600 font-medium">{t('gpsMap.gpsMap.popup.status')}:</span>
                                      <div className="flex items-center gap-1">
                                        {point.dynamic_motion_state === 'MOVING' ? (
                                          <>
                                            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                            <span className="text-green-600 font-medium text-xs">{t('gpsMap.gpsMap.popup.moving')}</span>
                                          </>
                                        ) : (
                                          <>
                                            <div className="w-2 h-2 rounded-full bg-gray-400" />
                                            <span className="text-gray-600 text-xs">{t('gpsMap.gpsMap.popup.stopped')}</span>
                                          </>
                                        )}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>

                              <div className="mt-3 pt-2 border-t border-gray-200">
                                <button
                                  onClick={() => {
                                    setSelectedPoint(point);
                                    setIsModalOpen(true);
                                  }}
                                  className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors flex items-center justify-center gap-2"
                                >
                                  <MapPinIcon className="h-4 w-4" />
                                  {t('gpsMap.gpsMap.markers.viewDetails')}
                                </button>
                              </div>
                            </div>
                          </Popup>
                        </Marker>
                      );
                    })}
                  </>
                )}
              </MapContainer>
              {/* Modal de Tracking */}
  {trackingModalOpen && trackingDevice && (
    <MapTrackingModal
      isOpen={trackingModalOpen}
      onClose={() => setTrackingModalOpen(false)}
      deviceCode={trackingDevice.code}
      deviceName={trackingDevice.name}
      photoUrl={trackingDevice.photoUrl}
    />
  )}
            </div>
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

        {/* Legenda das Zones */}
        {validData.length > 0 && zones.length > 0 && showZones && (
          <div className="bg-purple-50 border-t border-purple-200 px-6 py-4">
            <div className="mb-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-semibold text-gray-700">
                  🗺️ Cercas Virtuais ({zones.length})
                </h4>
                <button
                  onClick={fetchZones}
                  disabled={loadingZones}
                  className="text-xs text-purple-600 hover:text-purple-800 flex items-center gap-1"
                  title="Recarregar cercas"
                >
                  <ArrowPathIcon className={`h-4 w-4 ${loadingZones ? 'animate-spin' : ''}`} />
                  Atualizar
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {zones.map((zone) => {
                  const color = zone.geojson_data?.features?.[0]?.properties?.color?.replace('%23', '#') || '#5319FF';

                  return (
                    <div
                      key={zone.id}
                      className="flex items-center gap-3 p-3 bg-white rounded-lg border border-purple-200 hover:shadow-md transition-shadow"
                    >
                      <div
                        className="w-4 h-4 rounded border-2 border-white shadow-sm flex-shrink-0"
                        style={{ backgroundColor: color }}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate">
                          {zone.boundary_name}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          {zone.group_name} • {zone.code}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Legenda */}
        {validData.length > 0 && (
          <div className="bg-gray-50 border-t border-gray-200 px-6 py-4">
            {uniqueDevices.length > 0 && (
              <div className="mb-4">
                <h4 className="text-sm font-semibold text-gray-700 mb-3">
                  {t('gpsMap.legend.workers')} ({uniqueDevices.length})
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

                    const latestPoint = dataByDevice[devEui].reduce((latest, current) =>
                      new Date(current.timestamp) > new Date(latest.timestamp) ? current : latest
                    );

                    const userName = latestPoint.Item_Name || t('gpsMap.worker.unidentified');
                    const userImage = latestPoint.Image_hash;

                    return (
                      <div
                        key={devEui}
                        className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow"
                      >
                        <div className="flex-shrink-0">
                          {userImage ? (
                            <img
                              src={`https://smartmachine.smartxhub.cloud/imagem/${userImage}`}
                              alt={userName}
                              className="w-10 h-10 rounded-full object-cover border-2 border-gray-300"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.style.display = 'none';
                                target.nextElementSibling?.classList.remove('hidden');
                              }}
                            />
                          ) : null}
                          <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center border-2 border-gray-300 ${userImage ? 'hidden' : ''}`}
                            style={{ backgroundColor: `${color}20` }}
                          >
                            <span className="text-lg">👷</span>
                          </div>
                        </div>

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
                                {devicePointCount} {devicePointCount === 1 ? t('gpsMap.worker.point') : t('gpsMap.worker.points')}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-col items-center gap-1">
                          <div className="text-lg">👷</div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {uniqueDevices.length > 8 && (
                  <div className="text-center mt-2">
                    <span className="text-xs text-gray-500 bg-white px-3 py-1 rounded-full border border-gray-200">
                      {t('gpsMap.legend.scrollHint')}
                    </span>
                  </div>
                )}
              </div>
            )}

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
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <MapPinIcon className="h-6 w-6 text-white" />
                  <div>
                    <h3 className="text-lg font-bold text-white">{t('gpsMap.modal.title')}</h3>
                    <p className="text-blue-100 text-sm">
                      {t('gpsMap.modal.subtitle')}
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

            <div className="overflow-y-auto max-h-[calc(90vh-80px)]">
              <div className="p-6">
                <div className="flex items-center gap-4 mb-6 pb-4 border-b border-gray-200">
                  <div className="flex-shrink-0">
                    {selectedPoint.Image_hash ? (
                      <img
                        src={`https://smartmachine.smartxhub.cloud/imagem/${selectedPoint.Image_hash}`}
                        alt={selectedPoint.Item_Name || t('gpsMap.modal.defaultUserName')}
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
                      {selectedPoint.Item_Name || t('gpsMap.modal.unnamedWorker')}
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
<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <MapPinIcon className="h-5 w-5 text-blue-500" />
                  {t('gpsMap.modal.location')}
                </h4>

                <div className="space-y-3">
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-600">{t('gpsMap.modal.latitude')}</label>
                        <p className="text-lg font-mono text-gray-900 font-bold">
                          {selectedPoint.gps_latitude}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">{t('gpsMap.modal.longitude')}</label>
                        <p className="text-lg font-mono text-gray-900 font-bold">
                          {selectedPoint.gps_longitude}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <label className="text-sm font-medium text-gray-600 mb-2 block">{t('gpsMap.modal.gpsAccuracy')}</label>
                    <div className="flex items-center justify-between">
                      <span className={`px-3 py-2 rounded-full text-sm font-medium ${selectedPoint.gps_accuracy < 10 ? 'bg-green-100 text-green-800 border border-green-200' :
                        selectedPoint.gps_accuracy < 25 ? 'bg-yellow-100 text-yellow-800 border border-yellow-200' :
                          'bg-red-100 text-red-800 border border-red-200'
                        }`}>
                        {selectedPoint.gps_accuracy} {t('gpsMap.modal.meters')}
                      </span>
                      <div className="text-right">
                        <div className="text-xs text-gray-500">{t('gpsMap.modal.quality')}</div>
                        <div className="text-sm font-medium text-gray-900">
                          {selectedPoint.gps_accuracy < 10 ? t('gpsMap.modal.excellent') :
                            selectedPoint.gps_accuracy < 25 ? t('gpsMap.modal.good') : t('gpsMap.modal.regular')}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <BoltIcon className="h-5 w-5 text-yellow-500" />
                  {t('gpsMap.modal.deviceStatus')}
                </h4>

                <div className="space-y-3">
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <label className="text-sm font-medium text-gray-600">{t('gpsMap.modal.readingTime')}</label>
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
                        <label className="text-sm font-medium text-gray-600">{t('gpsMap.modal.batteryLevel')}</label>
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
                        {selectedPoint.battery_level > 50 ? t('gpsMap.modal.batteryGood') :
                          selectedPoint.battery_level > 20 ? t('gpsMap.modal.batteryModerate') : t('gpsMap.modal.batteryLow')}
                      </div>
                    </div>
                  )}

                  {selectedPoint.dynamic_motion_state && (
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                      <label className="text-sm font-medium text-gray-600 mb-2 block">{t('gpsMap.modal.motionStatus')}</label>
                      <div className="flex items-center gap-3">
                        {selectedPoint.dynamic_motion_state === 'MOVING' ? (
                          <>
                            <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse"></div>
                            <span className="text-green-700 font-medium text-lg">{t('gpsMap.modal.moving')}</span>
                          </>
                        ) : (
                          <>
                            <div className="w-3 h-3 rounded-full bg-gray-400"></div>
                            <span className="text-gray-700 text-lg">{t('gpsMap.modal.stopped')}</span>
                          </>
                        )}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {selectedPoint.dynamic_motion_state === 'MOVING'
                          ? t('gpsMap.modal.movingDescription')
                          : t('gpsMap.modal.stoppedDescription')
                        }
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-gray-200">
              <h4 className="text-lg font-semibold text-gray-900 mb-3">{t('gpsMap.modal.technicalInfo')}</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                <div className="bg-gray-50 p-3 rounded-lg">
                  <label className="text-gray-600 font-medium">DEV_EUI</label>
                  <p className="font-mono text-gray-900 truncate" title={selectedPoint.dev_eui}>
                    {selectedPoint.dev_eui}
                  </p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <label className="text-gray-600 font-medium">{t('gpsMap.modal.originalTimestamp')}</label>
                  <p className="text-gray-900 font-mono text-xs">
                    {new Date(selectedPoint.timestamp).toISOString()}
                  </p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <label className="text-gray-600 font-medium">{t('gpsMap.modal.recordId')}</label>
                  <p className="text-gray-900 font-mono">
                    #{selectedPoint?.id || t('gpsMap.modal.notAvailable')}
                  </p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <label className="text-gray-600 font-medium">{t('gpsMap.modal.connectionStatus')}</label>
                  <p className="text-green-600 font-medium flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                    {t('gpsMap.modal.online')}
                  </p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <label className="text-gray-600 font-medium">{t('gpsMap.modal.deviceType')}</label>
                  <p className="text-gray-900">{t('gpsMap.modal.gpsTracker')}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <label className="text-gray-600 font-medium">{t('gpsMap.modal.lastUpdate')}</label>
                  <p className="text-gray-900">
                    {new Date(selectedPoint.timestamp).toLocaleString('pt-BR')}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h5 className="font-medium text-blue-900 mb-2">{t('gpsMap.modal.shareCoordinates')}</h5>
              <div className="flex items-center gap-2">
                <code className="flex-1 bg-white px-3 py-2 rounded border border-blue-300 text-sm text-gray-700 font-mono">
                  {selectedPoint.gps_latitude}, {selectedPoint.gps_longitude}
                </code>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(`${selectedPoint.gps_latitude}, ${selectedPoint.gps_longitude}`);
                  }}
                  className="px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm"
                >
                  {t('gpsMap.modal.copy')}
                </button>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-600">
                {t('gpsMap.modal.updatedAt')} {new Date(selectedPoint.timestamp).toLocaleString('pt-BR')}
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  {t('gpsMap.modal.close')}
                </button>
                <button
                  onClick={() => {
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
                  {t('gpsMap.modal.exportPDF')}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )}

  {/* Modal de Tracking */}
  {trackingModalOpen && trackingDevice && (
    <MapTrackingModal
      isOpen={trackingModalOpen}
      onClose={() => setTrackingModalOpen(false)}
      deviceCode={trackingDevice.code}
      deviceName={trackingDevice.name}
      photoUrl={trackingDevice.photoUrl}
    />
  )}
</>);
};
export default GPSMapViewer;