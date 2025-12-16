// components/CertificateMapWithStates.tsx
import {  useEffect, useRef } from 'react';
import {  useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import 'leaflet.markercluster';
import 'leaflet.heat';


// Fix para ícones do Leaflet
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// =====================================
// 🗺️ CAMADA DE ESTADOS (GeoJSON)
// =====================================
interface StateLayerProps {
  statesData: any[];
  show: boolean;
}
//@ts-ignore
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
// 🔥 COMPONENTE HEATMAP
// =====================================
interface HeatmapLayerProps {
  points: any[];
  show: boolean;
}
//@ts-ignore
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

// Incluir aqui todo o código do MarkerClusterLayer, createCertificateIcon, etc
// do arquivo anterior... (para economizar espaço vou resumir)

// ... [resto do código do componente anterior] ...

// Adicionar no return principal, após o TileLayer:

/*
{showStates && mapData?.states && mapData.states.length > 0 && (
  <StateLayer statesData={mapData.states} show={showStates} />
)}
*/

// E no controles, adicionar:

/*
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
*/