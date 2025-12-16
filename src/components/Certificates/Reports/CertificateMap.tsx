// components/CertificateMap.tsx
import { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import 'leaflet.markercluster';
import 'leaflet.heat';
import {
  MapPinIcon,
  FunnelIcon,
  XMarkIcon,
  FireIcon,
  MapIcon,
} from '@heroicons/react/24/outline';

// Fix para ícones do Leaflet
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// =====================================
// 🗺️ CONFIGURAÇÕES DE MAPAS
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
};

// =====================================
// 📊 INTERFACES
// =====================================
interface MapFilters {
  validityStatus?: string;
  riskLevel?: string;
  homeArea?: string;
  departmentCode?: string;
  certificateType?: string;
  searchTerm?: string;
}

interface CertificateMapProps {
  companyId: number | undefined;
}

interface MapData {
  markers: any[];
  clusters: any[];
  heatmapData: any[];
  states: any[];
  bounds: any;
}

interface Analytics {
  totalCertificates: number;
  validCertificates: number;
  expiredCertificates: number;
  expiringSoon: number;
  expiring90Days: number;
  highRisk: number;
  mediumRisk: number;
  lowRisk: number;
  avgComplianceScore: number;
  avgRenewalProbability: number;
  totalFinancialRisk: number;
}

// =====================================
// 🔥 COMPONENTE HEATMAP
// =====================================
interface HeatmapLayerProps {
  points: any[];
  show: boolean;
}

const HeatmapLayer: React.FC<HeatmapLayerProps> = ({ points, show }) => {
  const map = useMap();

  useEffect(() => {
    if (!show || points.length === 0) return;

    const heatData = points.map((point: any) => [
      point.lat,
      point.lng,
      point.intensity
    ]);

    // @ts-ignore
    const heatLayer = L.heatLayer(heatData, {
      radius: 25,
      blur: 15,
      maxZoom: 17,
      max: 1.0,
      gradient: {
        0.0: '#00ff00',
        0.5: '#ffff00',
        0.7: '#ff9900',
        1.0: '#ff0000'
      }
    }).addTo(map);

    return () => {
      map.removeLayer(heatLayer);
    };
  }, [points, show, map]);

  return null;
};

// =====================================
// 🗺️ COMPONENTE DE ESTADOS
// =====================================
interface StateLayerProps {
  statesData: any[];
  show: boolean;
}

const StateLayer: React.FC<StateLayerProps> = ({ statesData, show }) => {
  const map = useMap();
  const geoJsonLayerRef = useRef<any>(null);

  useEffect(() => {
    if (!show) {
      if (geoJsonLayerRef.current) {
        map.removeLayer(geoJsonLayerRef.current);
        geoJsonLayerRef.current = null;
      }
      return;
    }

    // Carregar GeoJSON dos estados brasileiros
    fetch('https://raw.githubusercontent.com/codeforamerica/click_that_hood/master/public/data/brazil-states.geojson')
      .then(response => response.json())
      .then(geojson => {
        // Criar mapa de dados por estado
        const stateMap = new Map();
        statesData.forEach(state => {
          stateMap.set(state.stateCode, state);
        });

        // Remover camada anterior se existir
        if (geoJsonLayerRef.current) {
          map.removeLayer(geoJsonLayerRef.current);
        }

        // Criar nova camada GeoJSON
        geoJsonLayerRef.current = L.geoJSON(geojson, {
          style: (feature) => {
            const stateCode = feature?.properties?.sigla || feature?.properties?.name;
            const stateData = stateMap.get(stateCode);

            if (!stateData) {
              return {
                fillColor: '#e5e7eb',
                fillOpacity: 0.3,
                color: '#9ca3af',
                weight: 1
              };
            }

            // Calcular cor baseado no risco
            const riskScore = stateData.riskScore || 0;
            let fillColor = '#10b981'; // verde (baixo risco)

            if (riskScore > 0.7) {
              fillColor = '#dc2626'; // vermelho (alto risco)
            } else if (riskScore > 0.5) {
              fillColor = '#f97316'; // laranja (risco médio-alto)
            } else if (riskScore > 0.3) {
              fillColor = '#fbbf24'; // amarelo (risco médio)
            } else if (riskScore > 0.1) {
              fillColor = '#84cc16'; // verde-amarelo (risco baixo-médio)
            }

            return {
              fillColor,
              fillOpacity: 0.5,
              color: '#ffffff',
              weight: 2,
              opacity: 1
            };
          },
          onEachFeature: (feature, layer) => {
            const stateCode = feature?.properties?.sigla || feature?.properties?.name;
            const stateName = feature?.properties?.name || stateCode;
            const stateData = stateMap.get(stateCode);

            if (stateData) {
              const popupContent = `
                <div style="min-width: 220px; font-family: system-ui;">
                  <div style="background: linear-gradient(135deg, #3b82f6, #8b5cf6); padding: 12px; margin: -10px -10px 12px -10px; border-radius: 4px 4px 0 0;">
                    <h3 style="margin: 0; color: white; font-size: 16px; font-weight: bold;">
                      ${stateName}
                    </h3>
                    <p style="margin: 4px 0 0 0; color: rgba(255,255,255,0.9); font-size: 12px;">
                      ${stateCode}
                    </p>
                  </div>

                  <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px; margin-bottom: 12px;">
                    <div style="background: #f1f5f9; padding: 8px; border-radius: 6px;">
                      <p style="margin: 0; font-size: 10px; color: #64748b; font-weight: 600;">TOTAL</p>
                      <p style="margin: 4px 0 0 0; font-size: 18px; color: #1e293b; font-weight: bold;">
                        ${stateData.total}
                      </p>
                    </div>
                    
                    <div style="background: #fee2e2; padding: 8px; border-radius: 6px;">
                      <p style="margin: 0; font-size: 10px; color: #991b1b; font-weight: 600;">EXPIRADOS</p>
                      <p style="margin: 4px 0 0 0; font-size: 18px; color: #dc2626; font-weight: bold;">
                        ${stateData.expired}
                      </p>
                    </div>
                    
                    <div style="background: #fed7aa; padding: 8px; border-radius: 6px;">
                      <p style="margin: 0; font-size: 10px; color: #9a3412; font-weight: 600;">EXPIRANDO</p>
                      <p style="margin: 4px 0 0 0; font-size: 18px; color: #ea580c; font-weight: bold;">
                        ${stateData.expiringSoon}
                      </p>
                    </div>
                    
                    <div style="background: #fef3c7; padding: 8px; border-radius: 6px;">
                      <p style="margin: 0; font-size: 10px; color: #92400e; font-weight: 600;">ALTO RISCO</p>
                      <p style="margin: 4px 0 0 0; font-size: 18px; color: #d97706; font-weight: bold;">
                        ${stateData.highRisk}
                      </p>
                    </div>
                  </div>

                  <div style="padding-top: 12px; border-top: 1px solid #e2e8f0;">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
                      <span style="font-size: 12px; color: #64748b;">Compliance Médio:</span>
                      <span style="font-size: 12px; font-weight: 600; color: ${stateData.avgCompliance > 70 ? '#16a34a' : stateData.avgCompliance > 50 ? '#d97706' : '#dc2626'};">
                        ${stateData.avgCompliance.toFixed(1)}%
                      </span>
                    </div>
                    
                    <div style="display: flex; justify-content: space-between;">
                      <span style="font-size: 12px; color: #64748b;">Risco Financeiro:</span>
                      <span style="font-size: 12px; font-weight: 600; color: #8b5cf6;">
                        R$ ${(stateData.totalRiskValue / 1000).toFixed(1)}k
                      </span>
                    </div>
                  </div>

                  <div style="margin-top: 12px; padding: 8px; background: linear-gradient(135deg, #eff6ff, #e0e7ff); border-radius: 6px; border-left: 3px solid #3b82f6;">
                    <p style="margin: 0; font-size: 11px; color: #1e40af;">
                      <strong>Score de Risco:</strong> ${(stateData.riskScore * 100).toFixed(1)}%
                    </p>
                  </div>
                </div>
              `;

              layer.bindPopup(popupContent, {
                className: 'state-popup'
              });

              // Hover effects
              layer.on({
                mouseover: (e) => {
                  const layer = e.target;
                  layer.setStyle({
                    weight: 3,
                    fillOpacity: 0.7
                  });
                },
                mouseout: (e) => {
                  geoJsonLayerRef.current.resetStyle(e.target);
                }
              });
            }
          }
        }).addTo(map);
      })
      .catch(error => {
        console.error('Erro ao carregar GeoJSON dos estados:', error);
      });

    return () => {
      if (geoJsonLayerRef.current) {
        map.removeLayer(geoJsonLayerRef.current);
        geoJsonLayerRef.current = null;
      }
    };
  }, [statesData, show, map]);

  return null;
};

// =====================================
// 🎯 COMPONENTE DE CLUSTERING
// =====================================
interface MarkerClusterLayerProps {
  markers: any[];
  showClusters: boolean;
  onMarkerClick: (marker: any) => void;
}

const MarkerClusterLayer: React.FC<MarkerClusterLayerProps> = ({ 
  markers, 
  showClusters,
  //@ts-ignore
  onMarkerClick 
}) => {
  const map = useMap();
  const clusterGroupRef = useRef<any>(null);

  useEffect(() => {
    if (!markers || markers.length === 0) return;

    // Remove cluster anterior se existir
    if (clusterGroupRef.current) {
      map.removeLayer(clusterGroupRef.current);
      clusterGroupRef.current = null;
    }

    if (showClusters) {
      // Criar novo cluster group com ícones customizados
      // @ts-ignore
      clusterGroupRef.current = L.markerClusterGroup({
        maxClusterRadius: 80,
        spiderfyOnMaxZoom: true,
        showCoverageOnHover: false,
        zoomToBoundsOnClick: true,
        iconCreateFunction: function (cluster: any) {
          const childCount = cluster.getChildCount();
          const markers = cluster.getAllChildMarkers();
          
          // Calcular estatísticas do cluster
          let highRisk = 0;
          let mediumRisk = 0;
          let lowRisk = 0;
          let expired = 0;

          markers.forEach((marker: any) => {
            const cert = marker.options.certificateData;
            if (cert) {
              // Contar por risco
              if (cert.riskLevel === 'HIGH' || cert.riskLevel === 'CRITICAL') {
                highRisk++;
              } else if (cert.riskLevel === 'MEDIUM') {
                mediumRisk++;
              } else {
                lowRisk++;
              }
              
              // Contar expirados
              if (cert.daysUntilExpiration < 0) {
                expired++;
              }
            }
          });

          // Determinar cor do cluster baseado no risco predominante
          let clusterColor = '#3b82f6'; // azul padrão
          let clusterClass = 'marker-cluster-blue';

          if (highRisk > childCount * 0.5) {
            clusterColor = '#ef4444'; // vermelho
            clusterClass = 'marker-cluster-red';
          } else if (expired > childCount * 0.3) {
            clusterColor = '#f97316'; // laranja
            clusterClass = 'marker-cluster-orange';
          } else if (mediumRisk > childCount * 0.5) {
            clusterColor = '#eab308'; // amarelo
            clusterClass = 'marker-cluster-yellow';
          } else if (lowRisk > childCount * 0.7) {
            clusterColor = '#22c55e'; // verde
            clusterClass = 'marker-cluster-green';
          }

          return L.divIcon({
            html: `
              <div style="
                background-color: ${clusterColor};
                width: 50px;
                height: 50px;
                border-radius: 50%;
                border: 4px solid white;
                box-shadow: 0 3px 10px rgba(0,0,0,0.3);
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                color: white;
                font-weight: bold;
              ">
                <div style="font-size: 18px; line-height: 1;">${childCount}</div>
                <div style="font-size: 8px; margin-top: 2px;">certificados</div>
              </div>
            `,
            className: `marker-cluster ${clusterClass}`,
            iconSize: L.point(50, 50),
          });
        }
      });

      // Adicionar marcadores ao cluster
      markers.forEach((marker: any) => {
        const cert = marker.certificate;
        const icon = createCertificateIcon(marker.color, marker.priority);

        const leafletMarker = L.marker(
          [marker.position.lat, marker.position.lng],
          { 
            icon,
            // @ts-ignore
            certificateData: cert // Anexar dados ao marker
          }
        );

        // Criar popup
        const popupContent = `
          <div style="min-width: 250px; font-family: system-ui, -apple-system, sans-serif;">
            <div style="margin-bottom: 12px; padding-bottom: 12px; border-bottom: 1px solid #e2e8f0;">
              <h3 style="font-weight: bold; margin: 0 0 4px 0; color: #1e293b; font-size: 14px;">
                ${cert.itemName || 'N/A'}
              </h3>
              <p style="font-size: 11px; color: #64748b; margin: 0;">
                ${cert.itemCode || 'N/A'}
              </p>
            </div>
            
            <div style="font-size: 12px; color: #475569; line-height: 1.8;">
              <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
                <span style="font-weight: 500;">Tipo:</span>
                <span>${cert.certificateType || 'N/A'}</span>
              </div>
              
              <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
                <span style="font-weight: 500;">Status:</span>
                <span style="
                  padding: 2px 8px;
                  border-radius: 12px;
                  font-size: 11px;
                  font-weight: 600;
                  ${cert.daysUntilExpiration < 0 
                    ? 'background-color: #fee2e2; color: #991b1b;'
                    : cert.daysUntilExpiration <= 30
                    ? 'background-color: #fed7aa; color: #9a3412;'
                    : 'background-color: #dcfce7; color: #166534;'
                  }
                ">
                  ${cert.validityStatus}
                </span>
              </div>
              
              <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
                <span style="font-weight: 500;">Dias p/ Expirar:</span>
                <span style="font-weight: 700; ${
                  cert.daysUntilExpiration < 0 
                    ? 'color: #dc2626;'
                    : cert.daysUntilExpiration <= 30
                    ? 'color: #ea580c;'
                    : 'color: #16a34a;'
                }">
                  ${cert.daysUntilExpiration}
                </span>
              </div>
              
              <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
                <span style="font-weight: 500;">Risco:</span>
                <span style="
                  padding: 2px 8px;
                  border-radius: 12px;
                  font-size: 11px;
                  font-weight: 600;
                  ${cert.riskLevel === 'HIGH' || cert.riskLevel === 'CRITICAL'
                    ? 'background-color: #fee2e2; color: #991b1b;'
                    : cert.riskLevel === 'MEDIUM'
                    ? 'background-color: #fef3c7; color: #92400e;'
                    : 'background-color: #dcfce7; color: #166534;'
                  }
                ">
                  ${cert.riskLevel || 'N/A'}
                </span>
              </div>
              
              <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
                <span style="font-weight: 500;">Departamento:</span>
                <span>${cert.department || 'N/A'}</span>
              </div>
              
              ${cert.location?.site ? `
                <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
                  <span style="font-weight: 500;">Local:</span>
                  <span>${cert.location.site}</span>
                </div>
              ` : ''}
            </div>
            
            <button 
              onclick="window.dispatchEvent(new CustomEvent('certificateDetailsClick', { detail: ${JSON.stringify(cert).replace(/"/g, '&quot;')} }))"
              style="
                margin-top: 12px;
                width: 100%;
                padding: 8px;
                background-color: #3b82f6;
                color: white;
                border: none;
                border-radius: 6px;
                cursor: pointer;
                font-weight: 500;
                font-size: 13px;
                transition: background-color 0.2s;
              "
              onmouseover="this.style.backgroundColor='#2563eb'"
              onmouseout="this.style.backgroundColor='#3b82f6'"
            >
              📋 Ver Detalhes Completos
            </button>
          </div>
        `;

        leafletMarker.bindPopup(popupContent, {
          maxWidth: 300,
          className: 'certificate-popup'
        });

        clusterGroupRef.current.addLayer(leafletMarker);
      });

      map.addLayer(clusterGroupRef.current);
    } else {
      // Sem clustering - adicionar marcadores individuais
      markers.forEach((marker: any) => {
        const cert = marker.certificate;
        const icon = createCertificateIcon(marker.color, marker.priority);

        const leafletMarker = L.marker(
          [marker.position.lat, marker.position.lng],
          { icon }
        );

        const popupContent = `
          <div style="min-width: 250px;">
            <h3 style="font-weight: bold; margin-bottom: 8px;">
              ${cert.itemName || 'N/A'}
            </h3>
            <p style="font-size: 12px; color: #64748b;">
              ${cert.itemCode || 'N/A'}
            </p>
            <hr style="margin: 12px 0;" />
            <div style="font-size: 12px;">
              <p><strong>Tipo:</strong> ${cert.certificateType || 'N/A'}</p>
              <p><strong>Dias p/ Expirar:</strong> ${cert.daysUntilExpiration || 0}</p>
              <p><strong>Risco:</strong> ${cert.riskLevel || 'N/A'}</p>
              <p><strong>Departamento:</strong> ${cert.department || 'N/A'}</p>
            </div>
          </div>
        `;

        leafletMarker.bindPopup(popupContent);
        leafletMarker.addTo(map);
      });
    }

    return () => {
      if (clusterGroupRef.current) {
        map.removeLayer(clusterGroupRef.current);
        clusterGroupRef.current = null;
      }
    };
  }, [markers, showClusters, map]);

  return null;
};

// =====================================
// 🎯 ÍCONE CUSTOMIZADO
// =====================================
//@ts-ignore
const createCertificateIcon = (color: string = '#3b82f6', priority: number = 1) => {
  // Definir emoji baseado no nível de risco
  let emoji = '📄';
  if (color === '#ef4444' || color === '#dc2626') {
    emoji = '🔴'; // Alto risco
  } else if (color === '#f97316' || color === '#ea580c') {
    emoji = '🟠'; // Médio risco
  } else if (color === '#22c55e' || color === '#16a34a') {
    emoji = '🟢'; // Baixo risco
  } else if (color === '#eab308') {
    emoji = '🟡'; // Atenção
  }

  return L.divIcon({
    html: `
      <div style="
        background-color: ${color};
        width: 32px;
        height: 32px;
        border-radius: 50%;
        border: 3px solid white;
        box-shadow: 0 2px 6px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 16px;
      ">${emoji}</div>
    `,
    className: 'custom-certificate-icon',
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  });
};

// =====================================
// 🎯 COMPONENTE PRINCIPAL
// =====================================
export default function CertificateMap({ companyId }: CertificateMapProps) {
  const [mapData, setMapData] = useState<MapData | null>(null);
  //@ts-ignore
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [filters, setFilters] = useState<MapFilters>({});
  const [availableFilters, setAvailableFilters] = useState<any>(null);
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [showClusters, setShowClusters] = useState(true);
  const [showStates, setShowStates] = useState(true);
  const [showFilters, setShowFilters] = useState(true);
  const [selectedMarker, setSelectedMarker] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mapType, setMapType] = useState<keyof typeof MAP_TYPES>('satellite');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [center] = useState<[number, number]>([-14.235, -51.925]); // Centro do Brasil

  // Listener para eventos de detalhes do certificado
  useEffect(() => {
    const handleDetailsClick = (event: any) => {
      setSelectedMarker(event.detail);
      setIsModalOpen(true);
    };

    window.addEventListener('certificateDetailsClick', handleDetailsClick);
    return () => {
      window.removeEventListener('certificateDetailsClick', handleDetailsClick);
    };
  }, []);

  // =====================================
  // 📡 FETCH FILTERS
  // =====================================
  useEffect(() => {
    if (!companyId) return;

    const fetchFilters = async () => {
      try {
        const response = await fetch(
          `https://apinode.smartxhub.cloud/api/dashboard/map-filters/${companyId}`
        );
        if (!response.ok) throw new Error('Failed to fetch filters');
        const result = await response.json();
        console.log('📊 Filtros carregados:', result);
        setAvailableFilters(result.filters);
      } catch (err) {
        console.error('❌ Error fetching filters:', err);
      }
    };

    fetchFilters();
  }, [companyId]);

  // =====================================
  // 📡 FETCH MAP DATA
  // =====================================
  useEffect(() => {
    if (!companyId) {
      setIsLoading(false);
      return;
    }

    const fetchMapData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const params = new URLSearchParams();
        if (filters.validityStatus) params.append('validityStatus', filters.validityStatus);
        if (filters.riskLevel) params.append('riskLevel', filters.riskLevel);
        if (filters.homeArea) params.append('homeArea', filters.homeArea);
        if (filters.departmentCode) params.append('departmentCode', filters.departmentCode);
        if (filters.certificateType) params.append('certificateType', filters.certificateType);
        if (filters.searchTerm) params.append('searchTerm', filters.searchTerm);

        const url = `https://apinode.smartxhub.cloud/api/dashboard/map-analytics/${companyId}?${params.toString()}`;
        console.log('🔍 Buscando dados do mapa:', url);

        const response = await fetch(url);

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to fetch map data');
        }

        const result = await response.json();
        console.log('📍 Dados recebidos:', {
          markers: result.data?.markers?.length || 0,
          analytics: result.analytics
        });

        setMapData(result.data);
        setAnalytics(result.analytics);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        setError(errorMessage);
        console.error('❌ Error fetching map data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMapData();
  }, [companyId, filters]);
  //@ts-ignore
  const handleApplyFilters = () => {
    // Força re-fetch ao aplicar filtros
    setFilters({ ...filters });
  };

  // =====================================
  // 🎨 RENDERIZAÇÃO
  // =====================================
  return (
    <div className="space-y-6">
      {/* Analytics Cards */}
      {/* {analytics && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          <div className="bg-white rounded-xl shadow-lg p-4 border-l-4 border-blue-500">
            <p className="text-slate-600 text-xs font-medium">TOTAL</p>
            <p className="text-2xl font-bold text-slate-800 mt-1">
              {analytics.totalCertificates}
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-4 border-l-4 border-red-500">
            <p className="text-slate-600 text-xs font-medium">EXPIRADOS</p>
            <p className="text-2xl font-bold text-red-600 mt-1">
              {analytics.expiredCertificates}
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-4 border-l-4 border-orange-500">
            <p className="text-slate-600 text-xs font-medium">ALTO RISCO</p>
            <p className="text-2xl font-bold text-orange-600 mt-1">
              {analytics.highRisk}
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-4 border-l-4 border-yellow-500">
            <p className="text-slate-600 text-xs font-medium">EXPIRA 30D</p>
            <p className="text-2xl font-bold text-yellow-600 mt-1">
              {analytics.expiringSoon}
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-4 border-l-4 border-green-500">
            <p className="text-slate-600 text-xs font-medium">COMPLIANCE</p>
            <p className="text-2xl font-bold text-green-600 mt-1">
              {analytics.avgComplianceScore.toFixed(0)}%
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-4 border-l-4 border-purple-500">
            <p className="text-slate-600 text-xs font-medium">RISCO R$</p>
            <p className="text-xl font-bold text-purple-600 mt-1">
              {(analytics.totalFinancialRisk / 1000).toFixed(1)}k
            </p>
          </div>
        </div>
      )} */}

      {/* Controles */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-slate-800">Controles do Mapa</h3>
          <div className="flex gap-3">
            <button
              onClick={() => setShowClusters(!showClusters)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                showClusters
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              📍 {showClusters ? '✓ Clustering' : 'Clustering'}
            </button>

            <button
              onClick={() => setShowStates(!showStates)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                showStates
                  ? 'bg-purple-600 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <MapIcon className="h-4 w-4" />
              {showStates ? '✓ Estados' : 'Estados'}
            </button>

            <button
              onClick={() => setShowHeatmap(!showHeatmap)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                showHeatmap
                  ? 'bg-red-600 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <FireIcon className="h-4 w-4" />
              {showHeatmap ? '✓ Heatmap' : 'Heatmap'}
            </button>

            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              <FunnelIcon className="h-4 w-4" />
              {showFilters ? 'Ocultar Filtros' : 'Mostrar Filtros'}
            </button>
          </div>
        </div>

        {/* Filtros */}
        {showFilters && availableFilters && (
          <div className="space-y-4 border-t pt-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <select
                className="px-3 py-2 border border-slate-300 rounded-lg text-sm"
                value={filters.validityStatus || ''}
                onChange={(e) => setFilters({ ...filters, validityStatus: e.target.value || undefined })}
              >
                <option value="">Todos os Status</option>
                {availableFilters.validityStatuses?.map((status: any) => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>

              <select
                className="px-3 py-2 border border-slate-300 rounded-lg text-sm"
                value={filters.riskLevel || ''}
                onChange={(e) => setFilters({ ...filters, riskLevel: e.target.value || undefined })}
              >
                <option value="">Todos os Riscos</option>
                {availableFilters.riskLevels?.map((risk: any) => (
                  <option key={risk.value} value={risk.value}>
                    {risk.label}
                  </option>
                ))}
              </select>

              {/* <select
                className="px-3 py-2 border border-slate-300 rounded-lg text-sm"
                value={filters.homeArea || ''}
                onChange={(e) => setFilters({ ...filters, homeArea: e.target.value || undefined })}
              >
                <option value="">Todas as Áreas</option>
                {availableFilters.areas?.map((area: any) => (
                  <option key={area.value} value={area.value}>
                    {area.label}
                  </option>
                ))}
              </select> */}
            </div>

            <div className="flex gap-2">
              {/* <input
                type="text"
                placeholder="Buscar..."
                className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm"
                value={filters.searchTerm || ''}
                onChange={(e) => setFilters({ ...filters, searchTerm: e.target.value || undefined })}
              /> */}

              {/* <button
                onClick={handleApplyFilters}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <MagnifyingGlassIcon className="h-5 w-5" />
              </button> */}

              {Object.values(filters).some((v) => v) && (
                <button
                  onClick={() => setFilters({})}
                  className="px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-800"
                >
                  Limpar
                </button>
              )}
            </div>

            <select
              value={mapType}
              onChange={(e) => setMapType(e.target.value as keyof typeof MAP_TYPES)}
              className="px-3 py-2 border border-slate-300 rounded-lg text-sm"
            >
              {Object.entries(MAP_TYPES).map(([key, value]) => (
                <option key={key} value={key}>
                  {value.name}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Mapa */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        {isLoading ? (
          <div className="flex items-center justify-center h-[600px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-slate-600">Carregando mapa...</p>
            </div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-[600px]">
            <div className="text-center">
              <p className="text-red-600 font-semibold mb-2">Erro ao carregar mapa</p>
              <p className="text-red-500 text-sm">{error}</p>
            </div>
          </div>
        ) : !mapData || !mapData.markers || mapData.markers.length === 0 ? (
          <div className="flex items-center justify-center h-[600px]">
            <div className="text-center">
              <MapPinIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Nenhum certificado encontrado</p>
              <p className="text-sm text-gray-500 mt-2">
                Configure os filtros para visualizar certificados no mapa
              </p>
            </div>
          </div>
        ) : (
          <MapContainer
            center={center}
            zoom={4}
            maxZoom={22}
            style={{ height: '600px', width: '100%' }}
            className="rounded-lg"
          >
            <TileLayer
              attribution={MAP_TYPES[mapType].attribution}
              url={MAP_TYPES[mapType].url}
              maxNativeZoom={MAP_TYPES[mapType]?.maxNativeZoom}
              maxZoom={MAP_TYPES[mapType].maxZoom}
            />

            {showStates && mapData?.states && mapData.states.length > 0 && (
              <StateLayer statesData={mapData.states} show={showStates} />
            )}

            {showHeatmap && mapData.heatmapData && (
              <HeatmapLayer points={mapData.heatmapData} show={showHeatmap} />
            )}

            <MarkerClusterLayer
              markers={mapData.markers}
              showClusters={showClusters}
              onMarkerClick={setSelectedMarker}
            />
          </MapContainer>
        )}
      </div>

      {/* Legenda */}
      {mapData && mapData.markers && mapData.markers.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h4 className="font-semibold text-slate-800 mb-4">Legenda</h4>
          
          {/* Legenda de Marcadores */}
          <div className="mb-6">
            <h5 className="text-sm font-medium text-slate-700 mb-3">Marcadores de Certificados</h5>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-red-500 border-4 border-white shadow-md flex items-center justify-center text-white font-bold text-xs">
                  🔴
                </div>
                <span className="text-sm text-slate-700">Alto Risco / Crítico</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-orange-500 border-4 border-white shadow-md flex items-center justify-center text-white font-bold text-xs">
                  🟠
                </div>
                <span className="text-sm text-slate-700">Médio Risco</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-yellow-500 border-4 border-white shadow-md flex items-center justify-center text-white font-bold text-xs">
                  🟡
                </div>
                <span className="text-sm text-slate-700">Atenção</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-green-500 border-4 border-white shadow-md flex items-center justify-center text-white font-bold text-xs">
                  🟢
                </div>
                <span className="text-sm text-slate-700">Baixo Risco</span>
              </div>
            </div>
          </div>

          {/* Legenda de Estados */}
          {showStates && mapData?.states && mapData.states.length > 0 && (
            <div className="mb-6 pt-6 border-t border-slate-200">
              <h5 className="text-sm font-medium text-slate-700 mb-3">Estados (Nível de Risco)</h5>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded border-2 border-white shadow-md" style={{ backgroundColor: '#10b981' }}></div>
                  <div>
                    <span className="text-xs font-medium text-slate-700 block">0-10%</span>
                    <span className="text-xs text-slate-500">Baixo</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded border-2 border-white shadow-md" style={{ backgroundColor: '#84cc16' }}></div>
                  <div>
                    <span className="text-xs font-medium text-slate-700 block">10-30%</span>
                    <span className="text-xs text-slate-500">Baixo-Médio</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded border-2 border-white shadow-md" style={{ backgroundColor: '#fbbf24' }}></div>
                  <div>
                    <span className="text-xs font-medium text-slate-700 block">30-50%</span>
                    <span className="text-xs text-slate-500">Médio</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded border-2 border-white shadow-md" style={{ backgroundColor: '#f97316' }}></div>
                  <div>
                    <span className="text-xs font-medium text-slate-700 block">50-70%</span>
                    <span className="text-xs text-slate-500">Médio-Alto</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded border-2 border-white shadow-md" style={{ backgroundColor: '#dc2626' }}></div>
                  <div>
                    <span className="text-xs font-medium text-slate-700 block">70%+</span>
                    <span className="text-xs text-slate-500">Alto</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="pt-4 border-t border-slate-200">
            <p className="text-sm text-slate-600">
              <strong>💡 Dica:</strong> {showClusters 
                ? 'Os números nos clusters mostram a quantidade de certificados agrupados. Clique para aproximar e ver detalhes individuais.'
                : 'Ative o "Clustering" para agrupar certificados próximos e facilitar a visualização.'
              }
              {showStates && ' Clique nos estados para ver estatísticas regionais.'}
            </p>
          </div>
        </div>
      )}

      {/* Modal de Detalhes */}
      {isModalOpen && selectedMarker && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4" 
          style={{ zIndex: 9999 }}
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-white">Detalhes do Certificado</h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-white hover:text-blue-200"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 rounded-lg">
                  <p className="text-sm text-slate-600 mb-1">Item</p>
                  <p className="font-semibold text-slate-800">{selectedMarker.itemName}</p>
                  <p className="text-xs text-slate-500 mt-1">{selectedMarker.itemCode}</p>
                </div>

                <div className="p-4 bg-slate-50 rounded-lg">
                  <p className="text-sm text-slate-600 mb-1">Departamento</p>
                  <p className="font-semibold text-slate-800">{selectedMarker.department || 'N/A'}</p>
                </div>

                <div className="p-4 bg-slate-50 rounded-lg">
                  <p className="text-sm text-slate-600 mb-1">Status</p>
                  <p className="font-semibold text-slate-800">{selectedMarker.validityStatus}</p>
                </div>

                <div className="p-4 bg-slate-50 rounded-lg">
                  <p className="text-sm text-slate-600 mb-1">Dias até Expiração</p>
                  <p className={`font-bold text-lg ${
                    selectedMarker.daysUntilExpiration < 0 ? 'text-red-600' :
                    selectedMarker.daysUntilExpiration <= 30 ? 'text-orange-600' : 'text-green-600'
                  }`}>
                    {selectedMarker.daysUntilExpiration}
                  </p>
                </div>

                <div className="p-4 bg-slate-50 rounded-lg">
                  <p className="text-sm text-slate-600 mb-1">Nível de Risco</p>
                  <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                    selectedMarker.riskLevel === 'HIGH' || selectedMarker.riskLevel === 'CRITICAL'
                      ? 'bg-red-100 text-red-800'
                      : selectedMarker.riskLevel === 'MEDIUM'
                      ? 'bg-orange-100 text-orange-800'
                      : 'bg-green-100 text-green-800'
                  }`}>
                    {selectedMarker.riskLevel}
                  </span>
                </div>

                <div className="p-4 bg-slate-50 rounded-lg">
                  <p className="text-sm text-slate-600 mb-1">Localização</p>
                  <p className="font-semibold text-slate-800">{selectedMarker.location?.site || 'N/A'}</p>
                  <p className="text-xs text-slate-500 mt-1">{selectedMarker.location?.area || 'N/A'}</p>
                </div>
              </div>
            </div>

            <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}