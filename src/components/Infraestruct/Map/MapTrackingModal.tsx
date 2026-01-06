// // src/components/Map/MapTrackingModal.tsx

// import { useState, useEffect, useRef, useCallback } from 'react';
// import { MapContainer, TileLayer, Marker, Polyline, Popup, useMap, CircleMarker } from 'react-leaflet';
// import L from 'leaflet';
// import 'leaflet/dist/leaflet.css';

// // Importar e declarar tipos para polylineDecorator
// import 'leaflet-polylinedecorator';

// // Declaração de tipos para leaflet-polylinedecorator
// declare module 'leaflet' {
//   namespace Symbol {
//     function arrowHead(options: any): any;
//   }
//   function polylineDecorator(line: L.Polyline, options: any): any;
// }

// import {
//   XMarkIcon,
//   MapPinIcon,
//   PlayIcon,
//   PauseIcon,
//   StopIcon,
//   ForwardIcon,
//   BackwardIcon,
//   ArrowPathIcon,
//   MagnifyingGlassPlusIcon,
//   MagnifyingGlassMinusIcon,
//   HandThumbUpIcon,
//   ClockIcon,
//   MapIcon,
//   CalendarIcon,
//   ExclamationTriangleIcon,
// } from '@heroicons/react/24/outline';
// import { useCompany } from '../../../hooks/useCompany';

// // =====================================
// // 🗺️ TIPOS DE MAPAS
// // =====================================
// const MAP_TYPES = {
//   streets: {
//     name: 'Ruas',
//     url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
//     attribution: '&copy; OpenStreetMap',
//     maxNativeZoom: 19,
//     maxZoom: 22
//   },
//   satellite: {
//     name: 'Satélite',
//     url: 'https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}',
//     attribution: '&copy; Google',
//     maxNativeZoom: 21,
//     maxZoom: 22
//   },
//   terrain: {
//     name: 'Terreno',
//     url: 'https://mt1.google.com/vt/lyrs=p&x={x}&y={y}&z={z}',
//     attribution: '&copy; Google',
//     maxNativeZoom: 20,
//     maxZoom: 22
//   },
//   dark: {
//     name: 'Escuro',
//     url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
//     attribution: '&copy; CARTO',
//     maxNativeZoom: 20,
//     maxZoom: 22
//   },
// };

// // Fix para ícones do Leaflet
// delete (L.Icon.Default.prototype as any)._getIconUrl;
// L.Icon.Default.mergeOptions({
//   iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
//   iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
//   shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
// });

// // Ícone para o marcador de reprodução
// const playerIcon = new L.Icon({
//   iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-gold.png',
//   shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
//   iconSize: [32, 52],
//   iconAnchor: [16, 52],
//   popupAnchor: [1, -44],
//   shadowSize: [52, 52]
// });

// // =====================================
// // 📦 INTERFACES
// // =====================================
// interface GPSPoint {
//   dev_eui: string;
//   timestamp: string;
//   gps_latitude: number | string;
//   gps_longitude: number | string;
//   gps_accuracy: number | null;
//   item_name?: string;
  
//   // 📍 Localização
//   zone_name?: string;
//   area_name?: string;
  
//   // 🚨 Alertas e Eventos
//   geofence_status?: string;
//   has_geofence_alert?: number;
//   boundary_alert_details?: string;
//   alarm1_value?: number;
//   alarm2_value?: number;
//   mandown_alert?: number;
//   tamper_alert?: number;
//   button1_pressed?: number;
//   button2_pressed?: number;
//   button3_pressed?: number;
//   alert_status?: string;
//   alert_severity_score?: number;
//   has_any_alert?: number;
  
//   // 🏃 Movimento
//   distance_moved_meters?: number;
//   movement_category?: string;
//   movement_score?: number;
//   is_moving?: number;
  
//   // 🔋 Status
//   activity_status?: string;
  
//   // ⏰ Tempo
//   event_hour?: number;
//   event_minute?: number;
//   time_period?: string;
  
//   // 🎯 Campos calculados pelo backend
//   event_type?: string | null;
//   event_color?: string;
//   event_description?: string | null;
//   event_severity?: number;
//   event_icon?: string;
// }

// interface EventSummary {
//   total_events: number;
//   events_by_type: Record<string, number>;
//   has_critical_events: boolean;
// }

// interface MapTrackingModalProps {
//   isOpen: boolean;
//   onClose: () => void;
//   deviceCode: string;
//   deviceName?: string;
//   photoUrl?: string;
// }

// type DateRangeType = '12h' | '24h' | '7d' | 'custom';

// // =====================================
// // 🎯 COMPONENTES AUXILIARES
// // =====================================

// // Componente para ajustar o mapa aos bounds
// function MapBounds({ positions }: { positions: [number, number][] }) {
//   const map = useMap();

//   useEffect(() => {
//     if (positions.length > 0) {
//       try {
//         const bounds = L.latLngBounds(positions);
//         map.fitBounds(bounds, {
//           padding: [60, 60],
//           maxZoom: 19,
//           animate: true,
//           duration: 1.5
//         });
//       } catch (error) {
//         console.error('Error fitting bounds:', error);
//       }
//     }
//   }, [positions, map]);

//   return null;
// }

// // Componente para controlar o zoom automático
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
//   const lastPositionRef = useRef<[number, number] | null>(null);
//   const zoomTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
//   const isFirstRender = useRef(true);

//   useEffect(() => {
//     if (!autoZoomEnabled || !position) return;

//     if (isFirstRender.current) {
//       isFirstRender.current = false;
//       lastPositionRef.current = position;
//       return;
//     }

//     const shouldApplyZoom = () => {
//       if (!lastPositionRef.current) return true;
//       const distance = L.latLng(position).distanceTo(L.latLng(lastPositionRef.current));
//       return distance > 5;
//     };

//     const getOptimalZoom = (): number => {
//       if (isDragging) return 19;
//       if (isPlaying) return 19;
//       return 19;
//     };

//     if (shouldApplyZoom()) {
//       if (zoomTimeoutRef.current) {
//         clearTimeout(zoomTimeoutRef.current);
//       }

//       zoomTimeoutRef.current = setTimeout(() => {
//         try {
//           const targetZoom = getOptimalZoom();
//           const duration = isPlaying ? 0.8 : 1.2;

//           map.setView(position, targetZoom, {
//             animate: true,
//             duration,
//             easeLinearity: 0.2
//           });

//           lastPositionRef.current = position;
//         } catch (error) {
//           console.error('Error in AutoZoom:', error);
//         }
//       }, isPlaying ? 50 : 0);
//     }

//     return () => {
//       if (zoomTimeoutRef.current) {
//         clearTimeout(zoomTimeoutRef.current);
//       }
//     };
//   }, [position, isPlaying, isDragging, autoZoomEnabled, map]);

//   return null;
// }


// // 🧭 Componente de Bússola
// // 🧭 Componente de Bússola Premium
// function Compass() {
//   const map = useMap();
//   const [rotation, setRotation] = useState(0);
//   const [isHovered, setIsHovered] = useState(false);

//   useEffect(() => {
//     const updateRotation = () => {
//       const bearing = (map as any).getBearing ? (map as any).getBearing() : 0;
//       setRotation(-bearing);
//     };

//     map.on('rotate', updateRotation);
//     map.on('moveend', updateRotation);
    
//     updateRotation();

//     return () => {
//       map.off('rotate', updateRotation);
//       map.off('moveend', updateRotation);
//     };
//   }, [map]);

//   const handleClick = () => {
//     // Reset orientação do mapa para Norte
//     if ((map as any).setBearing) {
//       (map as any).setBearing(0);
//     }
//   };

//   return (
//     <>
//       <div 
//         className="leaflet-top leaflet-left"
//         style={{
//           marginTop: '10px',
//           marginLeft: '10px',
//           zIndex: 1000,
//         }}
//       >
//         <div 
//           className={`leaflet-control leaflet-bar relative w-24 h-24 cursor-pointer transition-all duration-300 ${
//             isHovered ? 'scale-110' : 'scale-100'
//           }`}
//           onMouseEnter={() => setIsHovered(true)}
//           onMouseLeave={() => setIsHovered(false)}
//           onClick={handleClick}
//           title="Clique para orientar ao Norte"
//         >
//           {/* Sombra externa animada */}
//           <div className={`absolute inset-0 rounded-full transition-all duration-300 ${
//             isHovered 
//               ? 'shadow-2xl shadow-blue-500/50' 
//               : 'shadow-xl shadow-gray-400/50'
//           }`}></div>
          
//           {/* Container principal */}
//           <div className="absolute inset-0 rounded-full bg-gradient-to-br from-slate-800 via-slate-700 to-slate-900 overflow-hidden border-4 border-white">
            
//             {/* Efeito de brilho animado */}
//             <div className={`absolute inset-0 bg-gradient-to-br from-blue-400/20 to-transparent transition-opacity duration-300 ${
//               isHovered ? 'opacity-100' : 'opacity-0'
//             }`}></div>
            
//             {/* Círculos concêntricos decorativos */}
//             <div className="absolute inset-3 rounded-full border-2 border-slate-600/50"></div>
//             <div className="absolute inset-5 rounded-full border border-slate-500/30"></div>
            
//             {/* Marcações de graus (cada 30°) */}
//             {[...Array(12)].map((_, i) => {
//               const angle = i * 30;
//               const isCardinal = angle % 90 === 0;
//               return (
//                 <div
//                   key={i}
//                   className="absolute top-1/2 left-1/2 origin-bottom"
//                   style={{
//                     transform: `translate(-50%, -50%) rotate(${angle}deg) translateY(-38px)`,
//                     height: isCardinal ? '8px' : '4px',
//                     width: isCardinal ? '2px' : '1px',
//                   }}
//                 >
//                   <div className={`${isCardinal ? 'bg-white' : 'bg-slate-400'} w-full h-full`}></div>
//                 </div>
//               );
//             })}
            
//             {/* Rosa dos ventos rotativa */}
//             <div 
//               className="absolute inset-0 flex items-center justify-center transition-transform duration-700 ease-out"
//               style={{ transform: `rotate(${rotation}deg)` }}
//             >
//               {/* Estrela de 8 pontas de fundo */}
//               <svg className="absolute w-20 h-20" viewBox="0 0 100 100">
//                 <defs>
//                   <radialGradient id="starGradient">
//                     <stop offset="0%" stopColor="#60a5fa" stopOpacity="0.3" />
//                     <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.1" />
//                   </radialGradient>
//                 </defs>
//                 {[...Array(8)].map((_, i) => {
//                   const angle = (i * 45 - 90) * (Math.PI / 180);
//                   const x = 50 + Math.cos(angle) * 35;
//                   const y = 50 + Math.sin(angle) * 35;
//                   return (
//                     <line
//                       key={i}
//                       x1="50"
//                       y1="50"
//                       x2={x}
//                       y2={y}
//                       stroke="url(#starGradient)"
//                       strokeWidth={i % 2 === 0 ? "2" : "1"}
//                     />
//                   );
//                 })}
//               </svg>
              
//               {/* Seta Norte (Vermelha premium) */}
//               <div className="absolute top-1">
//                 <div className="relative">
//                   <svg width="28" height="36" viewBox="0 0 28 36">
//                     <defs>
//                       <linearGradient id="northGradient" x1="0%" y1="0%" x2="0%" y2="100%">
//                         <stop offset="0%" stopColor="#ef4444" />
//                         <stop offset="100%" stopColor="#dc2626" />
//                       </linearGradient>
//                       <filter id="northShadow">
//                         <feDropShadow dx="0" dy="2" stdDeviation="2" floodOpacity="0.4"/>
//                       </filter>
//                     </defs>
//                     <path
//                       d="M 14 2 L 4 32 L 14 26 L 24 32 Z"
//                       fill="url(#northGradient)"
//                       filter="url(#northShadow)"
//                       stroke="#7f1d1d"
//                       strokeWidth="1"
//                     />
//                     <path
//                       d="M 14 2 L 14 26"
//                       stroke="white"
//                       strokeWidth="1"
//                       opacity="0.6"
//                     />
//                   </svg>
//                 </div>
//               </div>
              
//               {/* Seta Sul (Branca/Azul premium) */}
//               <div className="absolute bottom-1">
//                 <svg width="28" height="36" viewBox="0 0 28 36">
//                   <defs>
//                     <linearGradient id="southGradient" x1="0%" y1="0%" x2="0%" y2="100%">
//                       <stop offset="0%" stopColor="#e5e7eb" />
//                       <stop offset="100%" stopColor="#9ca3af" />
//                     </linearGradient>
//                     <filter id="southShadow">
//                       <feDropShadow dx="0" dy="2" stdDeviation="2" floodOpacity="0.3"/>
//                     </filter>
//                   </defs>
//                   <path
//                     d="M 14 34 L 4 4 L 14 10 L 24 4 Z"
//                     fill="url(#southGradient)"
//                     filter="url(#southShadow)"
//                     stroke="#4b5563"
//                     strokeWidth="1"
//                   />
//                 </svg>
//               </div>
              
//               {/* Setas Leste/Oeste (Douradas) */}
//               <div className="absolute right-1">
//                 <svg width="36" height="28" viewBox="0 0 36 28">
//                   <defs>
//                     <linearGradient id="eastGradient" x1="0%" y1="0%" x2="100%" y2="0%">
//                       <stop offset="0%" stopColor="#fbbf24" />
//                       <stop offset="100%" stopColor="#f59e0b" />
//                     </linearGradient>
//                   </defs>
//                   <path
//                     d="M 34 14 L 4 4 L 10 14 L 4 24 Z"
//                     fill="url(#eastGradient)"
//                     opacity="0.7"
//                     stroke="#92400e"
//                     strokeWidth="0.5"
//                   />
//                 </svg>
//               </div>
              
//               <div className="absolute left-1">
//                 <svg width="36" height="28" viewBox="0 0 36 28">
//                   <defs>
//                     <linearGradient id="westGradient" x1="100%" y1="0%" x2="0%" y2="0%">
//                       <stop offset="0%" stopColor="#fbbf24" />
//                       <stop offset="100%" stopColor="#f59e0b" />
//                     </linearGradient>
//                   </defs>
//                   <path
//                     d="M 2 14 L 32 4 L 26 14 L 32 24 Z"
//                     fill="url(#westGradient)"
//                     opacity="0.7"
//                     stroke="#92400e"
//                     strokeWidth="0.5"
//                   />
//                 </svg>
//               </div>
//             </div>
            
//             {/* Letras dos pontos cardeais com efeito neon */}
//             <div 
//               className="absolute inset-0 flex items-center justify-center transition-transform duration-700 ease-out"
//               style={{ transform: `rotate(${rotation}deg)` }}
//             >
//               {/* N (Norte) - Vermelho com brilho */}
//               <div 
//                 className="absolute top-2 left-1/2 transform -translate-x-1/2 font-black text-lg tracking-wider"
//                 style={{ 
//                   color: '#ef4444',
//                   textShadow: '0 0 10px rgba(239, 68, 68, 0.8), 0 0 20px rgba(239, 68, 68, 0.4)',
//                   fontFamily: 'Arial Black, sans-serif',
//                 }}
//               >
//                 N
//               </div>
              
//               {/* S (Sul) - Branco */}
//               <div 
//                 className="absolute bottom-2 left-1/2 transform -translate-x-1/2 font-bold text-base text-slate-300"
//                 style={{ 
//                   textShadow: '0 1px 3px rgba(0, 0, 0, 0.5)',
//                   fontFamily: 'Arial, sans-serif',
//                 }}
//               >
//                 S
//               </div>
              
//               {/* E (Leste) - Dourado */}
//               <div 
//                 className="absolute right-2 top-1/2 transform -translate-y-1/2 font-bold text-base"
//                 style={{ 
//                   color: '#fbbf24',
//                   textShadow: '0 0 8px rgba(251, 191, 36, 0.6)',
//                   fontFamily: 'Arial, sans-serif',
//                 }}
//               >
//                 E
//               </div>
              
//               {/* W (Oeste) - Dourado */}
//               <div 
//                 className="absolute left-2 top-1/2 transform -translate-y-1/2 font-bold text-base"
//                 style={{ 
//                   color: '#fbbf24',
//                   textShadow: '0 0 8px rgba(251, 191, 36, 0.6)',
//                   fontFamily: 'Arial, sans-serif',
//                 }}
//               >
//                 W
//               </div>
//             </div>
            
//             {/* Ponto central com múltiplas camadas */}
//             <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50">
//               <div className="relative w-4 h-4">
//                 {/* Anel externo animado */}
//                 <div className={`absolute inset-0 rounded-full bg-blue-400/30 transition-all duration-300 ${
//                   isHovered ? 'scale-150 opacity-0' : 'scale-100 opacity-100'
//                 }`}></div>
                
//                 {/* Anel médio */}
//                 <div className="absolute inset-0.5 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 shadow-lg"></div>
                
//                 {/* Ponto central brilhante */}
//                 <div className="absolute inset-1 rounded-full bg-white shadow-inner"></div>
                
//                 {/* Reflexo */}
//                 <div className="absolute top-1 left-1 w-1 h-1 rounded-full bg-white/80"></div>
//               </div>
//             </div>
            
//             {/* Borda interna com brilho */}
//             <div className="absolute inset-0 rounded-full border-2 border-white/10"></div>
//           </div>
          
//           {/* Anel externo decorativo */}
//           <div className="absolute inset-[-4px] rounded-full border-2 border-slate-300/50"></div>
//         </div>
//       </div>

//       {/* Tooltip flutuante */}
//       {isHovered && (
//         <div 
//           className="leaflet-top leaflet-left"
//           style={{
//             marginTop: '110px',
//             marginLeft: '10px',
//             zIndex: 999,
//           }}
//         >
//           <div className="bg-slate-800 text-white text-xs px-3 py-2 rounded-lg shadow-xl border border-slate-600 animate-fadeIn">
//             <div className="font-semibold mb-0.5">🧭 Bússola</div>
//             <div className="text-slate-300">Clique para orientar ao Norte</div>
//           </div>
//         </div>
//       )}

//       {/* Adicionar animação fadeIn no style */}
//       <style>{`
//         @keyframes fadeIn {
//           from {
//             opacity: 0;
//             transform: translateY(-10px);
//           }
//           to {
//             opacity: 1;
//             transform: translateY(0);
//           }
//         }
//         .animate-fadeIn {
//           animation: fadeIn 0.3s ease-out;
//         }
//       `}</style>
//     </>
//   );
// }


// // Componente para adicionar setas decorativas na rota
// function RouteArrows({ positions }: { positions: [number, number][] }) {
//   const map = useMap();
//   const decoratorRef = useRef<any>(null);

//   useEffect(() => {
//     if (positions.length > 1 && map) {
//       try {
//         if (decoratorRef.current) {
//           map.removeLayer(decoratorRef.current);
//           decoratorRef.current = null;
//         }

//         const polyline = L.polyline(positions, {
//           color: 'transparent',
//           weight: 0,
//         });

//         const decorator = (L as any).polylineDecorator(polyline, {
//           patterns: [
//             {
//               offset: '5%',
//               repeat: 60,
//               symbol: (L.Symbol as any).arrowHead({
//                 pixelSize: 15,
//                 polygon: false,
//                 pathOptions: {
//                   stroke: true,
//                   weight: 3,
//                   color: '#fbbf24',
//                   opacity: 0.9,
//                 }
//               })
//             }
//           ]
//         }).addTo(map);

//         decoratorRef.current = decorator;

//         return () => {
//           if (decoratorRef.current) {
//             try {
//               map.removeLayer(decoratorRef.current);
//             } catch (e) {
//               console.warn('Error removing decorator:', e);
//             }
//           }
//         };
//       } catch (error) {
//         console.error('Error creating route arrows:', error);
//       }
//     }
//   }, [positions, map]);

//   return null;
// }

// // Componente de controles de zoom
// function ZoomControls({
//   autoZoomEnabled,
//   onAutoZoomToggle,
//   mapType,
//   onMapTypeChange
// }: {
//   autoZoomEnabled: boolean;
//   onAutoZoomToggle: (enabled: boolean) => void;
//   mapType: keyof typeof MAP_TYPES;
//   onMapTypeChange: (type: keyof typeof MAP_TYPES) => void;
// }) {
//   const map = useMap();
//   const [showMapTypes, setShowMapTypes] = useState(false);

//   return (
//     <>
//       <div className="leaflet-top leaflet-right">
//         <div className="leaflet-control leaflet-bar flex flex-col bg-white rounded-lg shadow-xl border-2 border-gray-300 overflow-hidden">
//           <button
//             onClick={() => map.zoomIn()}
//             className="flex items-center justify-center w-12 h-12 hover:bg-blue-50 transition-all duration-200 border-b-2 border-gray-200"
//             title="Aumentar Zoom"
//           >
//             <MagnifyingGlassPlusIcon className="h-5 w-5 text-gray-700" />
//           </button>

//           <button
//             onClick={() => map.zoomOut()}
//             className="flex items-center justify-center w-12 h-12 hover:bg-blue-50 transition-all duration-200 border-b-2 border-gray-200"
//             title="Diminuir Zoom"
//           >
//             <MagnifyingGlassMinusIcon className="h-5 w-5 text-gray-700" />
//           </button>

//           <button
//             onClick={() => onAutoZoomToggle(!autoZoomEnabled)}
//             className={`flex items-center justify-center w-12 h-12 transition-all duration-200 border-b-2 border-gray-200 ${
//               autoZoomEnabled
//                 ? 'bg-gradient-to-br from-green-100 to-emerald-100 text-green-700 hover:from-green-200 hover:to-emerald-200'
//                 : 'bg-white text-gray-700 hover:bg-gray-50'
//             }`}
//             title={autoZoomEnabled ? 'Desativar Auto Zoom' : 'Ativar Auto Zoom'}
//           >
//             <div className="flex flex-col items-center">
//               <span className="text-sm font-bold">A</span>
//               <div className={`w-3 h-1.5 rounded-full mt-0.5 ${autoZoomEnabled ? 'bg-green-500' : 'bg-gray-400'}`}></div>
//             </div>
//           </button>

//           <button
//             onClick={() => setShowMapTypes(!showMapTypes)}
//             className="flex items-center justify-center w-12 h-12 bg-white text-gray-700 hover:bg-blue-50 transition-all duration-200"
//             title="Tipo de Mapa"
//           >
//             <MapIcon className="h-5 w-5" />
//           </button>
//         </div>
//       </div>

//       {showMapTypes && (
//         <div
//           className="leaflet-top leaflet-right"
//           style={{
//             marginTop: '200px',
//             marginRight: '10px'
//           }}
//         >
//           <div className="leaflet-control leaflet-bar bg-white rounded-lg shadow-xl border-2 border-gray-300 p-4 min-w-[180px]">
//             <div className="text-sm font-bold text-gray-800 mb-3 pb-2 border-b-2 border-gray-200 flex items-center gap-2">
//               <MapIcon className="h-4 w-4" />
//               Tipo de Mapa
//             </div>
//             <div className="space-y-2">
//               {(Object.keys(MAP_TYPES) as Array<keyof typeof MAP_TYPES>).map((type) => (
//                 <button
//                   key={type}
//                   onClick={() => {
//                     onMapTypeChange(type);
//                     setShowMapTypes(false);
//                   }}
//                   className={`w-full text-left px-4 py-2.5 text-sm rounded-lg transition-all duration-200 flex items-center gap-3 ${
//                     mapType === type
//                       ? 'bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 font-semibold border-2 border-blue-300 shadow-md'
//                       : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900 border-2 border-transparent'
//                   }`}
//                 >
//                   <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
//                     mapType === type ? 'bg-blue-500 border-blue-500' : 'bg-white border-gray-400'
//                   }`}>
//                     {mapType === type && (
//                       <div className="w-2 h-2 rounded-full bg-white"></div>
//                     )}
//                   </div>
//                   <span>{MAP_TYPES[type].name}</span>
//                 </button>
//               ))}
//             </div>
//           </div>
//         </div>
//       )}
//     </>
//   );
// }

// // Função para encontrar o ponto mais próximo na linha
// function findClosestPointOnLine(
//   point: [number, number],
//   line: [number, number][]
// ): { point: [number, number], index: number, distance: number } {
//   let closestPoint: [number, number] = line[0];
//   let closestIndex = 0;
//   let minDistance = Number.MAX_VALUE;

//   for (let i = 0; i < line.length - 1; i++) {
//     const segmentStart = line[i];
//     const segmentEnd = line[i + 1];

//     const projected = projectPointOnSegment(point, segmentStart, segmentEnd);
//     const distance = L.latLng(point).distanceTo(L.latLng(projected));

//     if (distance < minDistance) {
//       minDistance = distance;
//       closestPoint = projected;
//       closestIndex = i;
//     }
//   }

//   let exactClosestIndex = 0;
//   let exactMinDistance = Number.MAX_VALUE;

//   line.forEach((linePoint, index) => {
//     const distance = L.latLng(point).distanceTo(L.latLng(linePoint));
//     if (distance < exactMinDistance) {
//       exactMinDistance = distance;
//       exactClosestIndex = index;
//     }
//   });

//   if (exactMinDistance < 10) {
//     return {
//       point: line[exactClosestIndex],
//       index: exactClosestIndex,
//       distance: exactMinDistance
//     };
//   }

//   return {
//     point: closestPoint,
//     index: closestIndex,
//     distance: minDistance
//   };
// }

// // Função para projetar um ponto em um segmento de linha
// function projectPointOnSegment(
//   point: [number, number],
//   segmentStart: [number, number],
//   segmentEnd: [number, number]
// ): [number, number] {
//   const x = point[1], y = point[0];
//   const x1 = segmentStart[1], y1 = segmentStart[0];
//   const x2 = segmentEnd[1], y2 = segmentEnd[0];

//   const dx = x2 - x1;
//   const dy = y2 - y1;

//   const px = x - x1;
//   const py = y - y1;

//   const dot = px * dx + py * dy;
//   const lenSq = dx * dx + dy * dy;

//   let param = 0;
//   if (lenSq !== 0) {
//     param = dot / lenSq;
//   }

//   param = Math.max(0, Math.min(1, param));

//   const projectedX = x1 + param * dx;
//   const projectedY = y1 + param * dy;

//   return [projectedY, projectedX];
// }

// // Componente para o marcador draggable que segue a linha
// function DraggableRouteMarker({
//   positions,
//   currentPointIndex,
//   onIndexChange,
//   validData,
//   onDraggingChange
// }: {
//   positions: [number, number][];
//   currentPointIndex: number;
//   onIndexChange: (index: number) => void;
//   validData: GPSPoint[];
//   onDraggingChange: (dragging: boolean) => void;
// }) {
//   const markerRef = useRef<L.Marker | null>(null);
//   const [isDragging, setIsDragging] = useState(false);

//   useEffect(() => {
//     if (markerRef.current && positions[currentPointIndex] && !isDragging) {
//       markerRef.current.setLatLng(positions[currentPointIndex]);
//     }
//   }, [currentPointIndex, positions, isDragging]);

//   const handleDrag = (e: L.DragEndEvent) => {
//     const marker = e.target;
//     const position = marker.getLatLng();
//     const draggedPosition: [number, number] = [position.lat, position.lng];

//     const closest = findClosestPointOnLine(draggedPosition, positions);
//     marker.setLatLng(closest.point);

//     let newIndex = 0;
//     let minDistance = Number.MAX_VALUE;

//     positions.forEach((pos, index) => {
//       const distance = L.latLng(closest.point).distanceTo(L.latLng(pos));
//       if (distance < minDistance) {
//         minDistance = distance;
//         newIndex = index;
//       }
//     });

//     if (newIndex !== currentPointIndex) {
//       onIndexChange(newIndex);
//     }
//   };

//   const handleDragStart = () => {
//     setIsDragging(true);
//     onDraggingChange(true);
//   };

//   const handleDragEnd = (e: L.DragEndEvent) => {
//     setIsDragging(false);
//     onDraggingChange(false);
//     handleDrag(e);
//   };

//   if (!positions[currentPointIndex]) return null;

//   const currentPoint = validData[currentPointIndex];
//   const timeSinceStart = new Date(currentPoint.timestamp).getTime() - new Date(validData[0].timestamp).getTime();
//   const minutes = Math.floor(timeSinceStart / 60000);

//   return (
//     <Marker
//       position={positions[currentPointIndex]}
//       icon={playerIcon}
//       draggable={true}
//       ref={markerRef}
//       eventHandlers={{
//         dragstart: handleDragStart,
//         dragend: handleDragEnd,
//       }}
//       autoPan={true}
//     >
//       <Popup className="custom-popup">
//         <div className="p-3">
//           <div className="flex items-center gap-2 mb-3 pb-2 border-b-2 border-yellow-200">
//             <span className="text-2xl">📍</span>
//             <strong className="text-base text-gray-900">Posição Atual</strong>
//           </div>
//           <div className="space-y-2 text-sm">
//             <div className="flex items-center gap-2 bg-blue-50 p-2 rounded-md">
//               <ClockIcon className="h-4 w-4 text-blue-600" />
//               <span className="text-gray-700">{new Date(currentPoint.timestamp).toLocaleString('pt-BR')}</span>
//             </div>
//             <div className="grid grid-cols-2 gap-2 text-xs">
//               <div className="bg-gray-50 p-2 rounded">
//                 <div className="text-gray-600">Latitude</div>
//                 <div className="font-semibold text-gray-900">{Number(currentPoint.gps_latitude).toFixed(6)}</div>
//               </div>
//               <div className="bg-gray-50 p-2 rounded">
//                 <div className="text-gray-600">Longitude</div>
//                 <div className="font-semibold text-gray-900">{Number(currentPoint.gps_longitude).toFixed(6)}</div>
//               </div>
//             </div>
//             {currentPoint.gps_accuracy && (
//               <div className="bg-green-50 p-2 rounded-md">
//                 <div className="text-xs text-gray-600">Precisão GPS</div>
//                 <div className="font-semibold text-green-700">{currentPoint.gps_accuracy}m</div>
//               </div>
//             )}
//             <div className="bg-purple-50 p-2 rounded-md">
//               <div className="text-xs text-gray-600">Progresso</div>
//               <div className="font-semibold text-purple-700">
//                 {currentPointIndex + 1} de {validData.length} pontos
//               </div>
//             </div>
//             <div className="bg-orange-50 p-2 rounded-md">
//               <div className="text-xs text-gray-600">Tempo decorrido</div>
//               <div className="font-semibold text-orange-700">{minutes} minutos</div>
//             </div>
//             <div className="mt-3 pt-2 border-t-2 border-yellow-200 text-center">
//               <div className="flex items-center justify-center gap-2 text-green-600 font-medium text-xs">
//                 <HandThumbUpIcon className="h-4 w-4" />
//                 <span>Arraste para navegar</span>
//               </div>
//             </div>
//           </div>
//         </div>
//       </Popup>
//     </Marker>
//   );
// }

// // =====================================
// // 🗺️ COMPONENTE PRINCIPAL
// // =====================================
// const MapTrackingModal: React.FC<MapTrackingModalProps> = ({
//   isOpen,
//   onClose,
//   deviceCode,
//   deviceName = 'Trabalhador',
//   photoUrl
// }) => {
//   const { companyId } = useCompany();

//   const [data, setData] = useState<GPSPoint[]>([]);
//   const [eventSummary, setEventSummary] = useState<EventSummary | null>(null);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState<string | null>(null);

//   const [isPlaying, setIsPlaying] = useState(false);
//   const [currentPointIndex, setCurrentPointIndex] = useState(0);
//   const [playbackSpeed, setPlaybackSpeed] = useState(2);
//   const [progress, setProgress] = useState(0);
//   const [isDragging, setIsDragging] = useState(false);
//   const [autoZoomEnabled, setAutoZoomEnabled] = useState(true);
//   const [mapType, setMapType] = useState<keyof typeof MAP_TYPES>('satellite');
//   const [mapReady, setMapReady] = useState(false);
//   const [autoPlayTriggered, setAutoPlayTriggered] = useState(false);

//   // 🗓️ Estados para controle de data
//   const [dateRange, setDateRange] = useState<DateRangeType>('12h');
//   const [customStartDate, setCustomStartDate] = useState<string>('');
//   const [customEndDate, setCustomEndDate] = useState<string>('');

//   const playbackIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

//   // 🗓️ Função para calcular o range de datas
//   const getDateRange = useCallback((): { start: Date; end: Date } => {
//     const now = new Date();
    
//     switch (dateRange) {
//       case '12h':
//         return {
//           start: new Date(now.getTime() - 12 * 60 * 60 * 1000),
//           end: now
//         };
//       case '24h':
//         return {
//           start: new Date(now.getTime() - 24 * 60 * 60 * 1000),
//           end: now
//         };
//       case '7d':
//         return {
//           start: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
//           end: now
//         };
//       case 'custom':
//         return {
//           start: customStartDate ? new Date(customStartDate) : new Date(now.getTime() - 24 * 60 * 60 * 1000),
//           end: customEndDate ? new Date(customEndDate) : now
//         };
//       default:
//         return {
//           start: new Date(now.getTime() - 12 * 60 * 60 * 1000),
//           end: now
//         };
//     }
//   }, [dateRange, customStartDate, customEndDate]);

//   // 🗓️ Função para formatar o período exibido
//   const getDateRangeLabel = useCallback((): string => {
//     const { start, end } = getDateRange();
    
//     switch (dateRange) {
//       case '12h':
//         return 'Últimas 12h';
//       case '24h':
//         return 'Últimas 24h';
//       case '7d':
//         return 'Últimos 7 dias';
//       case 'custom':
//         return `${start.toLocaleDateString('pt-BR')} - ${end.toLocaleDateString('pt-BR')}`;
//       default:
//         return 'Período não definido';
//     }
//   }, [dateRange, getDateRange]);

//   // =====================================
//   // 📡 BUSCAR DADOS GPS
//   // =====================================
//   const fetchGPSRoute = useCallback(async () => {
//     if (!deviceCode || !companyId) return;

//     setLoading(true);
//     setError(null);
//     setMapReady(false);
//     setAutoPlayTriggered(false);

//     try {
//       const { start, end } = getDateRange();

//       const params = new URLSearchParams({
//         dev_eui: deviceCode,
//         limit: '200',
//         sortBy: 'timestamp',
//         sortOrder: 'ASC',
//         valid_gps_only: 'true',
//         start_date: start.toISOString(),
//         end_date: end.toISOString(),
//       });

//       console.log('📅 Fetching GPS route with date range:', {
//         start: start.toISOString(),
//         end: end.toISOString(),
//         range: dateRange
//       });

//       const response = await fetch(
//         `https://apinode.smartxhub.cloud/api/dashboard/devices/${companyId}/gps-route/raw?${params}`
//       );

//       if (!response.ok) {
//         throw new Error('Falha ao carregar rota GPS');
//       }

//       const result = await response.json();

//       if (result.data && result.data.length > 0) {
//         console.log('📍 GPS Data loaded:', result.data.length, 'points');
//         console.log('📊 Event Summary:', result.event_summary);
//         setData(result.data);
//         setEventSummary(result.event_summary || null);
//         resetPlayer();
        
//         setTimeout(() => {
//           setMapReady(true);
//           window.dispatchEvent(new Event('resize'));
//         }, 300);
//       } else {
//         setData([]);
//         setEventSummary(null);
//         setError(`Nenhum dado GPS encontrado no período: ${getDateRangeLabel()}`);
//       }
//     } catch (err) {
//       console.error('Error fetching GPS route:', err);
//       setError(err instanceof Error ? err.message : 'Erro ao carregar rota');
//     } finally {
//       setLoading(false);
//     }
//   }, [deviceCode, companyId, dateRange, customStartDate, customEndDate, getDateRange, getDateRangeLabel]);

//   useEffect(() => {
//     if (isOpen && deviceCode) {
//       setMapReady(false);
//       setData([]);
//       setEventSummary(null);
//       setAutoPlayTriggered(false);
//       fetchGPSRoute();
//     }

//     return () => {
//       if (playbackIntervalRef.current) {
//         clearInterval(playbackIntervalRef.current);
//       }
//       setMapReady(false);
//       setAutoPlayTriggered(false);
//     };
//   }, [isOpen, deviceCode, fetchGPSRoute]);

//   // Auto-play quando o mapa estiver pronto
//   useEffect(() => {
//     if (mapReady && validData.length > 0 && !autoPlayTriggered) {
//       setTimeout(() => {
//         startPlayback();
//         setAutoPlayTriggered(true);
//       }, 1000);
//     }
//   }, [mapReady, autoPlayTriggered]);

//   // Force resize do mapa quando os dados estiverem prontos
//   useEffect(() => {
//     if (mapReady && validData.length > 0) {
//       const timer = setTimeout(() => {
//         window.dispatchEvent(new Event('resize'));
//       }, 100);

//       return () => clearTimeout(timer);
//     }
//   }, [mapReady]);

//   // =====================================
//   // 🎮 CONTROLES DO PLAYER
//   // =====================================
  
//   const startPlayback = () => {
//     if (validData.length === 0) return;

//     setIsPlaying(true);
//     playbackIntervalRef.current = setInterval(() => {
//       setCurrentPointIndex(prev => {
//         const nextIndex = prev + 1;
//         if (nextIndex >= validData.length) {
//           stopPlayback();
//           return prev;
//         }
//         setProgress((nextIndex / (validData.length - 1)) * 100);
//         return nextIndex;
//       });
//     }, 1000 / playbackSpeed);
//   };

//   const pausePlayback = () => {
//     setIsPlaying(false);
//     if (playbackIntervalRef.current) {
//       clearInterval(playbackIntervalRef.current);
//       playbackIntervalRef.current = null;
//     }
//   };

//   const stopPlayback = () => {
//     setIsPlaying(false);
//     setCurrentPointIndex(0);
//     setProgress(0);
//     if (playbackIntervalRef.current) {
//       clearInterval(playbackIntervalRef.current);
//       playbackIntervalRef.current = null;
//     }
//   };

//   const resetPlayer = () => {
//     stopPlayback();
//     setCurrentPointIndex(0);
//     setProgress(0);
//   };

//   const goToPoint = (index: number) => {
//     const newIndex = Math.max(0, Math.min(index, validData.length - 1));
//     setCurrentPointIndex(newIndex);
//     setProgress((newIndex / (validData.length - 1)) * 100);
//   };

//   const nextPoint = () => {
//     if (currentPointIndex < validData.length - 1) {
//       const newIndex = currentPointIndex + 1;
//       setCurrentPointIndex(newIndex);
//       setProgress((newIndex / (validData.length - 1)) * 100);
//     }
//   };

//   const previousPoint = () => {
//     if (currentPointIndex > 0) {
//       const newIndex = currentPointIndex - 1;
//       setCurrentPointIndex(newIndex);
//       setProgress((newIndex / (validData.length - 1)) * 100);
//     }
//   };

//   const handleMarkerIndexChange = (newIndex: number) => {
//     goToPoint(newIndex);
//     if (isPlaying) {
//       pausePlayback();
//     }
//   };

//   const handleDraggingChange = (dragging: boolean) => {
//     setIsDragging(dragging);
//   };

//   // =====================================
//   // 📊 PROCESSAR DADOS
//   // =====================================
//   const processedData = data.map(point => ({
//     ...point,
//     gps_latitude: typeof point.gps_latitude === 'string'
//       ? parseFloat(point.gps_latitude)
//       : point.gps_latitude,
//     gps_longitude: typeof point.gps_longitude === 'string'
//       ? parseFloat(point.gps_longitude)
//       : point.gps_longitude,
//   }));

//   const validData = processedData.filter(
//     point => 
//       !isNaN(point.gps_latitude) && 
//       !isNaN(point.gps_longitude) &&
//       point.gps_latitude !== 0 &&
//       point.gps_longitude !== 0 &&
//       Math.abs(point.gps_latitude) <= 90 &&
//       Math.abs(point.gps_longitude) <= 180
//   );

//   const positions: [number, number][] = validData.map(point => [
//     point.gps_latitude,
//     point.gps_longitude
//   ]);

//   const currentPosition = validData[currentPointIndex]
//     ? [validData[currentPointIndex].gps_latitude, validData[currentPointIndex].gps_longitude] as [number, number]
//     : null;

//   const defaultCenter: [number, number] = [-2.4833, -44.2167];
//   const center = positions.length > 0 ? positions[0] : defaultCenter;

//   // Calcular precisão média (apenas pontos com gps_accuracy válido)
//   const averageAccuracy = validData.filter(p => p.gps_accuracy !== null).length > 0
//     ? validData.filter(p => p.gps_accuracy !== null).reduce((sum, p) => sum + (p.gps_accuracy || 0), 0) / validData.filter(p => p.gps_accuracy !== null).length
//     : 0;

//   // =====================================
//   // 🎨 RENDERIZAÇÃO
//   // =====================================
//   if (!isOpen) return null;

//   return (
//     <div 
//       className="fixed inset-0 bg-white/10 backdrop-blur-md flex items-center justify-center p-6" 
//       style={{ 
//         zIndex: 9999,
//         background: 'rgba(255, 255, 255, 0.05)',
//         backdropFilter: 'blur(12px) saturate(180%)',
//         WebkitBackdropFilter: 'blur(12px) saturate(180%)',
//       }}
//       onClick={onClose}
//     >
//       <div 
//         className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl overflow-hidden flex flex-col w-full max-w-[95vw] h-[92vh] border border-white/20"
//         style={{
//           boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37), inset 0 0 0 1px rgba(255, 255, 255, 0.18)',
//         }}
//         onClick={(e) => e.stopPropagation()}
//       >
//         {/* Header Compacto */}
//         <div className="bg-gradient-to-r from-green-600 via-emerald-600 to-blue-600 px-4 py-2 shadow-lg rounded-t-2xl">
//           <div className="flex items-center justify-between">
//             <div className="flex items-center gap-3">
//               {photoUrl ? (
//                 <div className="relative">
//                   <img
//                     src={photoUrl}
//                     alt={deviceName}
//                     className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-lg"
//                     onError={(e) => {
//                       const target = e.target as HTMLImageElement;
//                       target.style.display = 'none';
//                     }}
//                   />
//                   <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 rounded-full border-2 border-white"></div>
//                 </div>
//               ) : (
//                 <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center shadow-lg">
//                   <span className="text-2xl">👷</span>
//                 </div>
//               )}
//               <div>
//                 <h2 className="text-lg font-bold text-white flex items-center gap-2">
//                   <MapPinIcon className="h-5 w-5" />
//                   {deviceName}
//                 </h2>
//                 <p className="text-xs text-white/90 flex items-center gap-1.5">
//                   <CalendarIcon className="h-3 w-3" />
//                   {getDateRangeLabel()} • {deviceCode}
//                 </p>
//               </div>
//             </div>

//             <div className="flex items-center gap-2">
//               {/* Seletor de Período */}
//               <div className="flex items-center gap-2">
//                 <select
//                   value={dateRange}
//                   onChange={(e) => {
//                     const newRange = e.target.value as DateRangeType;
//                     setDateRange(newRange);
//                     if (newRange !== 'custom') {
//                       setTimeout(() => fetchGPSRoute(), 100);
//                     }
//                   }}
//                   className="px-3 py-1.5 text-xs bg-white/20 text-white border border-white/30 rounded-lg backdrop-blur-sm hover:bg-white/30 transition-all font-medium"
//                   disabled={loading}
//                 >
//                   <option value="12h">Últimas 12h</option>
//                   <option value="24h">Últimas 24h</option>
//                   <option value="7d">Últimos 7 dias</option>
//                   <option value="custom">Personalizado</option>
//                 </select>

//                 {dateRange === 'custom' && (
//                   <div className="flex items-center gap-2">
//                     <input
//                       type="datetime-local"
//                       value={customStartDate}
//                       onChange={(e) => setCustomStartDate(e.target.value)}
//                       className="px-2 py-1 text-xs bg-white/20 text-white border border-white/30 rounded-lg backdrop-blur-sm"
//                       max={customEndDate || new Date().toISOString().slice(0, 16)}
//                     />
//                     <span className="text-white text-xs font-medium">até</span>
//                     <input
//                       type="datetime-local"
//                       value={customEndDate}
//                       onChange={(e) => setCustomEndDate(e.target.value)}
//                       className="px-2 py-1 text-xs bg-white/20 text-white border border-white/30 rounded-lg backdrop-blur-sm"
//                       min={customStartDate}
//                       max={new Date().toISOString().slice(0, 16)}
//                     />
//                     <button
//                       onClick={fetchGPSRoute}
//                       disabled={loading || !customStartDate || !customEndDate}
//                       className="px-3 py-1.5 text-xs bg-white/30 hover:bg-white/40 text-white rounded-lg backdrop-blur-sm transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed"
//                     >
//                       Aplicar
//                     </button>
//                   </div>
//                 )}
//               </div>

//               <button
//                 onClick={fetchGPSRoute}
//                 disabled={loading}
//                 className="p-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-all duration-200 disabled:opacity-50 backdrop-blur-sm shadow-md"
//                 title="Atualizar"
//               >
//                 <ArrowPathIcon className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
//               </button>
//               <button
//                 onClick={onClose}
//                 className="p-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-all duration-200 backdrop-blur-sm shadow-md"
//               >
//                 <XMarkIcon className="h-5 w-5" />
//               </button>
//             </div>
//           </div>
//         </div>

//         {/* Player Controls Compacto */}
//         {validData.length > 0 && (
//           <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border-b border-yellow-200 px-4 py-2 shadow-inner">
//             <div className="flex items-center justify-between gap-4">
//               {/* Controles principais */}
//               <div className="flex items-center gap-3">
//                 <div className="flex items-center gap-1.5 bg-white rounded-lg px-2 py-1 shadow-md">
//                   <button
//                     onClick={previousPoint}
//                     disabled={currentPointIndex === 0}
//                     className="p-1.5 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
//                     title="Anterior"
//                   >
//                     <BackwardIcon className="h-4 w-4 text-gray-700" />
//                   </button>

//                   {!isPlaying ? (
//                     <button
//                       onClick={startPlayback}
//                       className="p-2 rounded-lg bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:from-green-600 hover:to-emerald-600 shadow-md transition-all"
//                       title="Reproduzir"
//                     >
//                       <PlayIcon className="h-4 w-4" />
//                     </button>
//                   ) : (
//                     <button
//                       onClick={pausePlayback}
//                       className="p-2 rounded-lg bg-gradient-to-r from-yellow-500 to-orange-500 text-white hover:from-yellow-600 hover:to-orange-600 shadow-md transition-all"
//                       title="Pausar"
//                     >
//                       <PauseIcon className="h-4 w-4" />
//                     </button>
//                   )}

//                   <button
//                     onClick={stopPlayback}
//                     className="p-1.5 rounded-lg bg-gradient-to-r from-red-500 to-rose-500 text-white hover:from-red-600 hover:to-rose-600 shadow-md transition-all"
//                     title="Parar"
//                   >
//                     <StopIcon className="h-4 w-4" />
//                   </button>

//                   <button
//                     onClick={nextPoint}
//                     disabled={currentPointIndex === validData.length - 1}
//                     className="p-1.5 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
//                     title="Próximo"
//                   >
//                     <ForwardIcon className="h-4 w-4 text-gray-700" />
//                   </button>
//                 </div>

//                 <select
//                   value={playbackSpeed}
//                   onChange={(e) => {
//                     setPlaybackSpeed(Number(e.target.value));
//                     if (isPlaying) {
//                       pausePlayback();
//                       setTimeout(() => startPlayback(), 100);
//                     }
//                   }}
//                   className="px-3 py-1.5 border border-gray-300 rounded-lg text-xs font-semibold bg-white shadow-md hover:border-blue-400 transition-all"
//                 >
//                   <option value={0.5}>🐢 0.5x</option>
//                   <option value={1}>🚶 1x</option>
//                   <option value={2}>🏃 2x</option>
//                   <option value={5}>🚀 5x</option>
//                   <option value={10}>⚡ 10x</option>
//                 </select>

//                 <div className="text-sm font-bold text-gray-800 bg-white px-3 py-1.5 rounded-lg shadow-md">
//                   {currentPointIndex + 1}/{validData.length}
//                 </div>
//               </div>

//               {/* Barra de progresso */}
//               <div className="flex-1 max-w-xl">
//                 <div className="flex justify-between text-xs font-medium text-gray-700 mb-1">
//                   <span>🟢 {new Date(validData[0].timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
//                   <span className="text-blue-600">📍 {new Date(validData[currentPointIndex].timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
//                   <span>🔴 {new Date(validData[validData.length - 1].timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
//                 </div>
//                 <input
//                   type="range"
//                   min="0"
//                   max={validData.length - 1}
//                   value={currentPointIndex}
//                   onChange={(e) => {
//                     goToPoint(Number(e.target.value));
//                     if (isPlaying) pausePlayback();
//                   }}
//                   className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider-thumb"
//                   style={{
//                     background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${progress}%, #e5e7eb ${progress}%, #e5e7eb 100%)`
//                   }}
//                 />
//               </div>

//               {/* Stats rápidas */}
//               <div className="flex items-center gap-3 text-xs">
//                 <div className="bg-white rounded-lg px-3 py-1.5 shadow-md border border-blue-100 text-center">
//                   <div className="text-gray-600 font-medium">Pontos</div>
//                   <div className="text-sm font-bold text-blue-600">{validData.length}</div>
//                 </div>
//                 {averageAccuracy > 0 && (
//                   <div className="bg-white rounded-lg px-3 py-1.5 shadow-md border border-green-100 text-center">
//                     <div className="text-gray-600 font-medium">Precisão</div>
//                     <div className="text-sm font-bold text-green-600">
//                       {averageAccuracy.toFixed(0)}m
//                     </div>
//                   </div>
//                 )}
//                 {eventSummary && eventSummary.total_events > 0 && (
//                   <div className={`rounded-lg px-3 py-1.5 shadow-md border text-center ${
//                     eventSummary.has_critical_events 
//                       ? 'bg-red-50 border-red-200' 
//                       : 'bg-orange-50 border-orange-200'
//                   }`}>
//                     <div className="text-gray-600 font-medium flex items-center gap-1">
//                       <ExclamationTriangleIcon className="h-3 w-3" />
//                       Eventos
//                     </div>
//                     <div className={`text-sm font-bold ${
//                       eventSummary.has_critical_events ? 'text-red-600' : 'text-orange-600'
//                     }`}>
//                       {eventSummary.total_events}
//                     </div>
//                   </div>
//                 )}
//               </div>
//             </div>
//           </div>
//         )}

//         {/* Legenda de Eventos - só mostrar se houver eventos */}
//         {eventSummary && eventSummary.total_events > 0 && (
//           <div className="bg-gradient-to-r from-gray-50 to-slate-50 border-b border-gray-200 px-4 py-2">
//             <div className="flex flex-wrap items-center justify-center gap-4 text-xs">
//               <div className="flex items-center gap-2">
//                 <div className="w-4 h-4 rounded-full bg-red-600 border-2 border-white shadow-md"></div>
//                 <span className="text-gray-700 font-medium">🚨 Emergência</span>
//               </div>
//               <div className="flex items-center gap-2">
//                 <div className="w-4 h-4 rounded-full bg-orange-500 border-2 border-white shadow-md"></div>
//                 <span className="text-gray-700 font-medium">⚠️ Alerta</span>
//               </div>
//               <div className="flex items-center gap-2">
//                 <div className="w-4 h-4 rounded-full bg-blue-500 border-2 border-white shadow-md"></div>
//                 <span className="text-gray-700 font-medium">🚧 Geofence</span>
//               </div>
//               <div className="flex items-center gap-2">
//                 <div className="w-4 h-4 rounded-full bg-green-500 border-2 border-white shadow-md"></div>
//                 <span className="text-gray-700 font-medium">🏃 Movimento</span>
//               </div>
//               <div className="flex items-center gap-2">
//                 <div className="w-4 h-4 rounded-full bg-gray-500 border-2 border-white shadow-md"></div>
//                 <span className="text-gray-700 font-medium">⏸️ Parado</span>
//               </div>
//             </div>
//           </div>
//         )}

//         {/* Map Container */}
//         <div className="flex-1 relative">
//           {loading ? (
//             <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50">
//               <div className="text-center">
//                 <div className="relative">
//                   <div className="animate-spin rounded-full h-20 w-20 border-b-4 border-blue-600 mx-auto mb-4"></div>
//                   <MapPinIcon className="h-8 w-8 text-blue-600 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
//                 </div>
//                 <p className="text-gray-700 font-semibold text-lg">Carregando rota GPS...</p>
//                 <p className="text-gray-500 text-sm mt-2">{getDateRangeLabel()}</p>
//               </div>
//             </div>
//           ) : error ? (
//             <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-red-50 to-rose-50">
//               <div className="text-center max-w-md">
//                 <MapPinIcon className="h-20 w-20 text-red-500 mx-auto mb-4" />
//                 <p className="text-red-600 font-bold text-lg mb-2">{error}</p>
//                 <p className="text-gray-600 text-sm mb-4">
//                   Tente selecionar outro período ou verifique se o dispositivo enviou dados GPS
//                 </p>
//                 <button
//                   onClick={fetchGPSRoute}
//                   className="mt-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 font-semibold shadow-lg transition-all duration-200"
//                 >
//                   Tentar Novamente
//                 </button>
//               </div>
//             </div>
//           ) : validData.length === 0 ? (
//             <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-50 to-slate-50">
//               <div className="text-center">
//                 <MapPinIcon className="h-20 w-20 text-gray-400 mx-auto mb-4" />
//                 <p className="text-gray-700 font-bold text-lg">Nenhuma rota encontrada</p>
//                 <p className="text-gray-500 text-sm mt-2">
//                   Não há dados GPS válidos para o período selecionado
//                 </p>
//                 <p className="text-gray-400 text-xs mt-1">{getDateRangeLabel()}</p>
//               </div>
//             </div>
//           ) : mapReady ? (
//             <div className="absolute inset-0">
//               <MapContainer
//                 center={center}
//                 zoom={19}
//                 maxZoom={22}
//                 zoomControl={false}
//                 style={{ height: '100%', width: '100%' }}
//                 className="rounded-b-2xl shadow-lg z-0"
//                 key={`map-${deviceCode}-${validData.length}`}
//               >
//                 <TileLayer
//                   attribution={MAP_TYPES[mapType].attribution}
//                   url={MAP_TYPES[mapType].url}
//                   maxNativeZoom={MAP_TYPES[mapType].maxNativeZoom}
//                   maxZoom={MAP_TYPES[mapType].maxZoom}
//                 />

//                 <Compass />

//                 <ZoomControls
//                   autoZoomEnabled={autoZoomEnabled}
//                   onAutoZoomToggle={setAutoZoomEnabled}
//                   mapType={mapType}
//                   onMapTypeChange={setMapType}
//                 />

//                 <AutoZoom
//                   position={currentPosition}
//                   isPlaying={isPlaying}
//                   isDragging={isDragging}
//                   autoZoomEnabled={autoZoomEnabled}
//                 />

//                 {(!isPlaying && !isDragging) && <MapBounds positions={positions} />}

//                 {positions.length > 1 && (
//                   <Polyline
//                     positions={positions}
//                     pathOptions={{
//                       color: '#3b82f6',
//                       weight: 8,
//                       opacity: 0.9,
//                       lineCap: 'round',
//                       lineJoin: 'round',
//                     }}
//                   />
//                 )}

//                 {positions.length > 1 && <RouteArrows positions={positions} />}

//                 <DraggableRouteMarker
//                   positions={positions}
//                   currentPointIndex={currentPointIndex}
//                   onIndexChange={handleMarkerIndexChange}
//                   validData={validData}
//                   onDraggingChange={handleDraggingChange}
//                 />

//                 {validData.map((point, index) => {
//                   const isStart = index === 0;
//                   const isEnd = index === validData.length - 1;
//                   const hasEvent = point.event_type !== null && point.event_type !== undefined;

//                   // Mostrar: início, fim, eventos importantes ou a cada 20 pontos
//                   if (!isStart && !isEnd && !hasEvent && index % 20 !== 0) return null;

//                   // Usar cor do evento se existir, senão usar cor padrão
//                   let color = point.event_color || (isStart ? '#22c55e' : isEnd ? '#ef4444' : '#3b82f6');
                  
//                   // Tamanho baseado na severidade do evento
//                   let radius = isStart || isEnd ? 10 : 5;
//                   if (hasEvent && point.event_severity) {
//                     radius = point.event_severity >= 4 ? 12 : point.event_severity >= 3 ? 10 : 8;
//                   }

//                   return (
//                     <CircleMarker
//                       key={`marker-${index}`}
//                       center={[point.gps_latitude, point.gps_longitude]}
//                       radius={radius}
//                       pathOptions={{
//                         color,
//                         fillColor: color,
//                         fillOpacity: hasEvent ? 0.85 : 0.7,
//                         weight: hasEvent ? 3 : 2,
//                       }}
//                     >
//                       <Popup>
//                         <div className="p-3 min-w-[280px]">
//                           {/* Header */}
//                           <strong className="text-base flex items-center gap-2 mb-2">
//                             {point.event_icon || (isStart ? '🟢' : isEnd ? '🔴' : '📍')} 
//                             {isStart ? 'Início da Rota' : isEnd ? 'Fim da Rota' : `Ponto ${index + 1}`}
//                           </strong>
                          
//                           {/* Descrição do Evento */}
//                           {hasEvent && point.event_description && (
//                             <div className={`mb-3 p-2 rounded-md font-semibold text-sm ${
//                               (point.event_severity || 0) >= 4 ? 'bg-red-100 text-red-800 border border-red-300' :
//                               (point.event_severity || 0) >= 3 ? 'bg-orange-100 text-orange-800 border border-orange-300' :
//                               (point.event_severity || 0) >= 2 ? 'bg-blue-100 text-blue-800 border border-blue-300' :
//                               'bg-green-100 text-green-800 border border-green-300'
//                             }`}>
//                               {point.event_description}
//                             </div>
//                           )}
                          
//                           {/* Informações Básicas */}
//                           <div className="text-sm space-y-1.5">
//                             <div className="flex items-center gap-2 bg-blue-50 p-2 rounded">
//                               <ClockIcon className="h-4 w-4 text-blue-600 flex-shrink-0" />
//                               <span className="text-gray-700 text-xs">
//                                 {new Date(point.timestamp).toLocaleString('pt-BR')}
//                               </span>
//                             </div>
                            
//                             <div className="grid grid-cols-2 gap-2 text-xs">
//                               <div className="bg-gray-50 p-2 rounded">
//                                 <div className="text-gray-600">Latitude</div>
//                                 <div className="font-semibold text-gray-900">
//                                   {Number(point.gps_latitude).toFixed(6)}
//                                 </div>
//                               </div>
//                               <div className="bg-gray-50 p-2 rounded">
//                                 <div className="text-gray-600">Longitude</div>
//                                 <div className="font-semibold text-gray-900">
//                                   {Number(point.gps_longitude).toFixed(6)}
//                                 </div>
//                               </div>
//                             </div>

//                             {point.gps_accuracy && (
//                               <div className="bg-green-50 p-2 rounded">
//                                 <div className="text-xs text-gray-600">Precisão GPS</div>
//                                 <div className="font-semibold text-green-700 text-sm">
//                                   {point.gps_accuracy}m
//                                 </div>
//                               </div>
//                             )}

//                             {/* Localização */}
//                             {(point.zone_name || point.area_name) && (
//                               <div className="bg-purple-50 p-2 rounded">
//                                 <div className="text-xs text-gray-600">Localização</div>
//                                 {point.zone_name && (
//                                   <div className="text-sm font-semibold text-purple-700">
//                                     📍 {point.zone_name}
//                                   </div>
//                                 )}
//                                 {point.area_name && (
//                                   <div className="text-xs text-purple-600">
//                                     {point.area_name}
//                                   </div>
//                                 )}
//                               </div>
//                             )}

//                             {/* Movimento */}
//                             {point.distance_moved_meters !== undefined && point.distance_moved_meters > 0 && (
//                               <div className="bg-amber-50 p-2 rounded">
//                                 <div className="text-xs text-gray-600">Movimento</div>
//                                 <div className="text-sm font-semibold text-amber-700">
//                                   🏃 {point.distance_moved_meters.toFixed(0)}m • {point.movement_category}
//                                 </div>
//                               </div>
//                             )}

//                             {/* Alertas Ativos */}
//                             {hasEvent && (
//                               <div className="mt-2 pt-2 border-t border-gray-200">
//                                 <div className="text-xs font-semibold text-gray-600 mb-1">
//                                   Status de Alertas:
//                                 </div>
//                                 <div className="space-y-1 text-xs">
//                                   {point.mandown_alert === 1 && (
//                                     <div className="text-red-700 flex items-center gap-1">
//                                       🚨 Queda Detectada
//                                     </div>
//                                   )}
//                                   {(point.button1_pressed === 1 || 
//                                     point.button2_pressed === 1 || 
//                                     point.button3_pressed === 1) && (
//                                     <div className="text-red-700 flex items-center gap-1">
//                                       🔴 Botão de Pânico Ativado
//                                     </div>
//                                   )}
//                                   {point.tamper_alert === 1 && (
//                                     <div className="text-orange-700 flex items-center gap-1">
//                                       ⚠️ Violação Detectada
//                                     </div>
//                                   )}
//                                   {point.alarm1_value === 1 && (
//                                     <div className="text-orange-700 flex items-center gap-1">
//                                       🔔 Alarme 1 Ativo
//                                     </div>
//                                   )}
//                                   {point.alarm2_value === 1 && (
//                                     <div className="text-orange-700 flex items-center gap-1">
//                                       🔔 Alarme 2 Ativo
//                                     </div>
//                                   )}
//                                   {point.has_geofence_alert === 1 && (
//                                     <div className="text-blue-700 flex items-center gap-1">
//                                       🚧 {point.boundary_alert_details || 'Cruzou Geofence'}
//                                     </div>
//                                   )}
//                                 </div>
//                               </div>
//                             )}
//                           </div>
//                         </div>
//                       </Popup>
//                     </CircleMarker>
//                   );
//                 })}
//               </MapContainer>
//             </div>
//           ) : (
//             <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50">
//               <div className="text-center">
//                 <div className="animate-pulse">
//                   <MapPinIcon className="h-20 w-20 text-blue-500 mx-auto mb-4" />
//                 </div>
//                 <p className="text-gray-700 font-semibold text-lg">Preparando mapa...</p>
//               </div>
//             </div>
//           )}
//         </div>
//       </div>

//       <style>{`
//         .slider-thumb::-webkit-slider-thumb {
//           appearance: none;
//           width: 20px;
//           height: 20px;
//           border-radius: 50%;
//           background: linear-gradient(135deg, #3b82f6, #1e40af);
//           cursor: pointer;
//           box-shadow: 0 2px 8px rgba(59, 130, 246, 0.5);
//           border: 2px solid white;
//         }

//         .slider-thumb::-moz-range-thumb {
//           width: 20px;
//           height: 20px;
//           border-radius: 50%;
//           background: linear-gradient(135deg, #3b82f6, #1e40af);
//           cursor: pointer;
//           box-shadow: 0 2px 8px rgba(59, 130, 246, 0.5);
//           border: 2px solid white;
//         }

//         .custom-popup .leaflet-popup-content-wrapper {
//           border-radius: 12px;
//           box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
//         }

//         input[type="datetime-local"]::-webkit-calendar-picker-indicator {
//           filter: invert(1);
//         }
//       `}</style>
//     </div>
//   );
// };

// export default MapTrackingModal;

// src/components/Map/MapTrackingModal.tsx

import { useState, useEffect, useRef, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, Popup, useMap, CircleMarker } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useTranslation } from 'react-i18next'; // Adicione esta importação

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
  CalendarIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import { useCompany } from '../../../hooks/useCompany';

// =====================================
// 🗺️ TIPOS DE MAPAS
// =====================================
// Atualize os tipos de mapa para usar as traduções
const getMapTypes = (t: any) => ({
  streets: {
    name: t('mapTrackingModal.mapTypes.streets'),
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; OpenStreetMap',
    maxNativeZoom: 19,
    maxZoom: 22
  },
  satellite: {
    name: t('mapTrackingModal.mapTypes.satellite'),
    url: 'https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}',
    attribution: '&copy; Google',
    maxNativeZoom: 21,
    maxZoom: 22
  },
  terrain: {
    name: t('mapTrackingModal.mapTypes.terrain'),
    url: 'https://mt1.google.com/vt/lyrs=p&x={x}&y={y}&z={z}',
    attribution: '&copy; Google',
    maxNativeZoom: 20,
    maxZoom: 22
  },
  dark: {
    name: t('mapTrackingModal.mapTypes.dark'),
    url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    attribution: '&copy; CARTO',
    maxNativeZoom: 20,
    maxZoom: 22
  },
});

// Fix para ícones do Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Ícone para o marcador de reprodução
const playerIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-gold.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [32, 52],
  iconAnchor: [16, 52],
  popupAnchor: [1, -44],
  shadowSize: [52, 52]
});

// =====================================
// 📦 INTERFACES
// =====================================
interface GPSPoint {
  dev_eui: string;
  timestamp: string;
  gps_latitude: number | string;
  gps_longitude: number | string;
  gps_accuracy: number | null;
  item_name?: string;
  
  // 📍 Localização
  zone_name?: string;
  area_name?: string;
  
  // 🚨 Alertas e Eventos
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
  
  // 🔋 Status
  activity_status?: string;
  
  // ⏰ Tempo
  event_hour?: number;
  event_minute?: number;
  time_period?: string;
  
  // 🎯 Campos calculados pelo backend
  event_type?: string | null;
  event_color?: string;
  event_description?: string | null;
  event_severity?: number;
  event_icon?: string;
}

interface EventSummary {
  total_events: number;
  events_by_type: Record<string, number>;
  has_critical_events: boolean;
}

interface MapTrackingModalProps {
  isOpen: boolean;
  onClose: () => void;
  deviceCode: string;
  deviceName?: string;
  photoUrl?: string;
}

type DateRangeType = '12h' | '24h' | '7d' | 'custom';

// =====================================
// 🎯 COMPONENTES AUXILIARES
// =====================================

// Componente para ajustar o mapa aos bounds
function MapBounds({ positions }: { positions: [number, number][] }) {
  const map = useMap();

  useEffect(() => {
    if (positions.length > 0) {
      try {
        const bounds = L.latLngBounds(positions);
        map.fitBounds(bounds, {
          padding: [60, 60],
          maxZoom: 19,
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

// Componente para controlar o zoom automático
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
      return distance > 5;
    };

    const getOptimalZoom = (): number => {
      if (isDragging) return 19;
      if (isPlaying) return 19;
      return 19;
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

// 🧭 Componente de Bússola Premium
function Compass() {
  const { t } = useTranslation(); // Adicione esta linha
  const map = useMap();
  const [rotation, setRotation] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const updateRotation = () => {
      const bearing = (map as any).getBearing ? (map as any).getBearing() : 0;
      setRotation(-bearing);
    };

    map.on('rotate', updateRotation);
    map.on('moveend', updateRotation);
    
    updateRotation();

    return () => {
      map.off('rotate', updateRotation);
      map.off('moveend', updateRotation);
    };
  }, [map]);

  const handleClick = () => {
    // Reset orientação do mapa para Norte
    if ((map as any).setBearing) {
      (map as any).setBearing(0);
    }
  };

  return (
    <>
      <div 
        className="leaflet-top leaflet-left"
        style={{
          marginTop: '10px',
          marginLeft: '10px',
          zIndex: 1000,
        }}
      >
        <div 
          className={`leaflet-control leaflet-bar relative w-24 h-24 cursor-pointer transition-all duration-300 ${
            isHovered ? 'scale-110' : 'scale-100'
          }`}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          onClick={handleClick}
          title={t('mapTrackingModal.compass.clickToNorth')}
        >
          {/* Sombra externa animada */}
          <div className={`absolute inset-0 rounded-full transition-all duration-300 ${
            isHovered 
              ? 'shadow-2xl shadow-blue-500/50' 
              : 'shadow-xl shadow-gray-400/50'
          }`}></div>
          
          {/* Container principal */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-slate-800 via-slate-700 to-slate-900 overflow-hidden border-4 border-white">
            
            {/* Efeito de brilho animado */}
            <div className={`absolute inset-0 bg-gradient-to-br from-blue-400/20 to-transparent transition-opacity duration-300 ${
              isHovered ? 'opacity-100' : 'opacity-0'
            }`}></div>
            
            {/* Círculos concêntricos decorativos */}
            <div className="absolute inset-3 rounded-full border-2 border-slate-600/50"></div>
            <div className="absolute inset-5 rounded-full border border-slate-500/30"></div>
            
            {/* Marcações de graus (cada 30°) */}
            {[...Array(12)].map((_, i) => {
              const angle = i * 30;
              const isCardinal = angle % 90 === 0;
              return (
                <div
                  key={i}
                  className="absolute top-1/2 left-1/2 origin-bottom"
                  style={{
                    transform: `translate(-50%, -50%) rotate(${angle}deg) translateY(-38px)`,
                    height: isCardinal ? '8px' : '4px',
                    width: isCardinal ? '2px' : '1px',
                  }}
                >
                  <div className={`${isCardinal ? 'bg-white' : 'bg-slate-400'} w-full h-full`}></div>
                </div>
              );
            })}
            
            {/* Rosa dos ventos rotativa */}
            <div 
              className="absolute inset-0 flex items-center justify-center transition-transform duration-700 ease-out"
              style={{ transform: `rotate(${rotation}deg)` }}
            >
              {/* Estrela de 8 pontas de fundo */}
              <svg className="absolute w-20 h-20" viewBox="0 0 100 100">
                <defs>
                  <radialGradient id="starGradient">
                    <stop offset="0%" stopColor="#60a5fa" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.1" />
                  </radialGradient>
                </defs>
                {[...Array(8)].map((_, i) => {
                  const angle = (i * 45 - 90) * (Math.PI / 180);
                  const x = 50 + Math.cos(angle) * 35;
                  const y = 50 + Math.sin(angle) * 35;
                  return (
                    <line
                      key={i}
                      x1="50"
                      y1="50"
                      x2={x}
                      y2={y}
                      stroke="url(#starGradient)"
                      strokeWidth={i % 2 === 0 ? "2" : "1"}
                    />
                  );
                })}
              </svg>
              
              {/* Seta Norte (Vermelha premium) */}
              <div className="absolute top-1">
                <div className="relative">
                  <svg width="28" height="36" viewBox="0 0 28 36">
                    <defs>
                      <linearGradient id="northGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#ef4444" />
                        <stop offset="100%" stopColor="#dc2626" />
                      </linearGradient>
                      <filter id="northShadow">
                        <feDropShadow dx="0" dy="2" stdDeviation="2" floodOpacity="0.4"/>
                      </filter>
                    </defs>
                    <path
                      d="M 14 2 L 4 32 L 14 26 L 24 32 Z"
                      fill="url(#northGradient)"
                      filter="url(#northShadow)"
                      stroke="#7f1d1d"
                      strokeWidth="1"
                    />
                    <path
                      d="M 14 2 L 14 26"
                      stroke="white"
                      strokeWidth="1"
                      opacity="0.6"
                    />
                  </svg>
                </div>
              </div>
              
              {/* Seta Sul (Branca/Azul premium) */}
              <div className="absolute bottom-1">
                <svg width="28" height="36" viewBox="0 0 28 36">
                  <defs>
                    <linearGradient id="southGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#e5e7eb" />
                      <stop offset="100%" stopColor="#9ca3af" />
                    </linearGradient>
                    <filter id="southShadow">
                      <feDropShadow dx="0" dy="2" stdDeviation="2" floodOpacity="0.3"/>
                    </filter>
                  </defs>
                  <path
                    d="M 14 34 L 4 4 L 14 10 L 24 4 Z"
                    fill="url(#southGradient)"
                    filter="url(#southShadow)"
                    stroke="#4b5563"
                    strokeWidth="1"
                  />
                </svg>
              </div>
              
              {/* Setas Leste/Oeste (Douradas) */}
              <div className="absolute right-1">
                <svg width="36" height="28" viewBox="0 0 36 28">
                  <defs>
                    <linearGradient id="eastGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#fbbf24" />
                      <stop offset="100%" stopColor="#f59e0b" />
                    </linearGradient>
                  </defs>
                  <path
                    d="M 34 14 L 4 4 L 10 14 L 4 24 Z"
                    fill="url(#eastGradient)"
                    opacity="0.7"
                    stroke="#92400e"
                    strokeWidth="0.5"
                  />
                </svg>
              </div>
              
              <div className="absolute left-1">
                <svg width="36" height="28" viewBox="0 0 36 28">
                  <defs>
                    <linearGradient id="westGradient" x1="100%" y1="0%" x2="0%" y2="0%">
                      <stop offset="0%" stopColor="#fbbf24" />
                      <stop offset="100%" stopColor="#f59e0b" />
                    </linearGradient>
                  </defs>
                  <path
                    d="M 2 14 L 32 4 L 26 14 L 32 24 Z"
                    fill="url(#westGradient)"
                    opacity="0.7"
                    stroke="#92400e"
                    strokeWidth="0.5"
                  />
                </svg>
              </div>
            </div>
            
            {/* Letras dos pontos cardeais com efeito neon */}
            <div 
              className="absolute inset-0 flex items-center justify-center transition-transform duration-700 ease-out"
              style={{ transform: `rotate(${rotation}deg)` }}
            >
              {/* N (Norte) - Vermelho com brilho */}
              <div 
                className="absolute top-2 left-1/2 transform -translate-x-1/2 font-black text-lg tracking-wider"
                style={{ 
                  color: '#ef4444',
                  textShadow: '0 0 10px rgba(239, 68, 68, 0.8), 0 0 20px rgba(239, 68, 68, 0.4)',
                  fontFamily: 'Arial Black, sans-serif',
                }}
              >
                {t('mapTrackingModal.compass.north')}
              </div>
              
              {/* S (Sul) - Branco */}
              <div 
                className="absolute bottom-2 left-1/2 transform -translate-x-1/2 font-bold text-base text-slate-300"
                style={{ 
                  textShadow: '0 1px 3px rgba(0, 0, 0, 0.5)',
                  fontFamily: 'Arial, sans-serif',
                }}
              >
                {t('mapTrackingModal.compass.south')}
              </div>
              
              {/* E (Leste) - Dourado */}
              <div 
                className="absolute right-2 top-1/2 transform -translate-y-1/2 font-bold text-base"
                style={{ 
                  color: '#fbbf24',
                  textShadow: '0 0 8px rgba(251, 191, 36, 0.6)',
                  fontFamily: 'Arial, sans-serif',
                }}
              >
                {t('mapTrackingModal.compass.east')}
              </div>
              
              {/* W (Oeste) - Dourado */}
              <div 
                className="absolute left-2 top-1/2 transform -translate-y-1/2 font-bold text-base"
                style={{ 
                  color: '#fbbf24',
                  textShadow: '0 0 8px rgba(251, 191, 36, 0.6)',
                  fontFamily: 'Arial, sans-serif',
                }}
              >
                {t('mapTrackingModal.compass.west')}
              </div>
            </div>
            
            {/* Ponto central com múltiplas camadas */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50">
              <div className="relative w-4 h-4">
                {/* Anel externo animado */}
                <div className={`absolute inset-0 rounded-full bg-blue-400/30 transition-all duration-300 ${
                  isHovered ? 'scale-150 opacity-0' : 'scale-100 opacity-100'
                }`}></div>
                
                {/* Anel médio */}
                <div className="absolute inset-0.5 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 shadow-lg"></div>
                
                {/* Ponto central brilhante */}
                <div className="absolute inset-1 rounded-full bg-white shadow-inner"></div>
                
                {/* Reflexo */}
                <div className="absolute top-1 left-1 w-1 h-1 rounded-full bg-white/80"></div>
              </div>
            </div>
            
            {/* Borda interna com brilho */}
            <div className="absolute inset-0 rounded-full border-2 border-white/10"></div>
          </div>
          
          {/* Anel externo decorativo */}
          <div className="absolute inset-[-4px] rounded-full border-2 border-slate-300/50"></div>
        </div>
      </div>

      {/* Tooltip flutuante */}
      {isHovered && (
        <div 
          className="leaflet-top leaflet-left"
          style={{
            marginTop: '110px',
            marginLeft: '10px',
            zIndex: 999,
          }}
        >
          <div className="bg-slate-800 text-white text-xs px-3 py-2 rounded-lg shadow-xl border border-slate-600 animate-fadeIn">
            <div className="font-semibold mb-0.5">🧭 {t('mapTrackingModal.compass.title')}</div>
            <div className="text-slate-300">{t('mapTrackingModal.compass.clickToNorth')}</div>
          </div>
        </div>
      )}

      {/* Adicionar animação fadeIn no style */}
      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </>
  );
}

// Componente para adicionar setas decorativas na rota
function RouteArrows({ positions }: { positions: [number, number][] }) {
  const map = useMap();
  const decoratorRef = useRef<any>(null);

  useEffect(() => {
    if (positions.length > 1 && map) {
      try {
        if (decoratorRef.current) {
          map.removeLayer(decoratorRef.current);
          decoratorRef.current = null;
        }

        const polyline = L.polyline(positions, {
          color: 'transparent',
          weight: 0,
        });

        const decorator = (L as any).polylineDecorator(polyline, {
          patterns: [
            {
              offset: '5%',
              repeat: 60,
              symbol: (L.Symbol as any).arrowHead({
                pixelSize: 15,
                polygon: false,
                pathOptions: {
                  stroke: true,
                  weight: 3,
                  color: '#fbbf24',
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

// Componente de controles de zoom
function ZoomControls({
  autoZoomEnabled,
  onAutoZoomToggle,
  mapType,
  onMapTypeChange
}: {
  autoZoomEnabled: boolean;
  onAutoZoomToggle: (enabled: boolean) => void;
  mapType: keyof ReturnType<typeof getMapTypes>;
  onMapTypeChange: (type: keyof ReturnType<typeof getMapTypes>) => void;
}) {
  const { t } = useTranslation(); // Adicione esta linha
  const map = useMap();
  const [showMapTypes, setShowMapTypes] = useState(false);
  
  const MAP_TYPES = getMapTypes(t); // Use a função getMapTypes com tradução

  return (
    <>
      <div className="leaflet-top leaflet-right">
        <div className="leaflet-control leaflet-bar flex flex-col bg-white rounded-lg shadow-xl border-2 border-gray-300 overflow-hidden">
          <button
            onClick={() => map.zoomIn()}
            className="flex items-center justify-center w-12 h-12 hover:bg-blue-50 transition-all duration-200 border-b-2 border-gray-200"
            title={t('mapTrackingModal.zoomControls.zoomIn')}
          >
            <MagnifyingGlassPlusIcon className="h-5 w-5 text-gray-700" />
          </button>

          <button
            onClick={() => map.zoomOut()}
            className="flex items-center justify-center w-12 h-12 hover:bg-blue-50 transition-all duration-200 border-b-2 border-gray-200"
            title={t('mapTrackingModal.zoomControls.zoomOut')}
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
            title={autoZoomEnabled 
              ? t('mapTrackingModal.zoomControls.autoZoomOff')
              : t('mapTrackingModal.zoomControls.autoZoomOn')
            }
          >
            <div className="flex flex-col items-center">
              <span className="text-sm font-bold">{t('mapTrackingModal.autoZoom.enabled')}</span>
              <div className={`w-3 h-1.5 rounded-full mt-0.5 ${autoZoomEnabled ? 'bg-green-500' : 'bg-gray-400'}`}></div>
            </div>
          </button>

          <button
            onClick={() => setShowMapTypes(!showMapTypes)}
            className="flex items-center justify-center w-12 h-12 bg-white text-gray-700 hover:bg-blue-50 transition-all duration-200"
            title={t('mapTrackingModal.zoomControls.mapType')}
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
              {t('mapTrackingModal.zoomControls.mapType')}
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
  validData: GPSPoint[];
  onDraggingChange: (dragging: boolean) => void;
}) {
  const { t } = useTranslation(); // Adicione esta linha
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
            <strong className="text-base text-gray-900">{t('mapTrackingModal.popups.currentPosition.title')}</strong>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2 bg-blue-50 p-2 rounded-md">
              <ClockIcon className="h-4 w-4 text-blue-600" />
              <span className="text-gray-700">{new Date(currentPoint.timestamp).toLocaleString('pt-BR')}</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-gray-50 p-2 rounded">
                <div className="text-gray-600">{t('mapTrackingModal.popups.currentPosition.latitude')}</div>
                <div className="font-semibold text-gray-900">{Number(currentPoint.gps_latitude).toFixed(6)}</div>
              </div>
              <div className="bg-gray-50 p-2 rounded">
                <div className="text-gray-600">{t('mapTrackingModal.popups.currentPosition.longitude')}</div>
                <div className="font-semibold text-gray-900">{Number(currentPoint.gps_longitude).toFixed(6)}</div>
              </div>
            </div>
            {currentPoint.gps_accuracy && (
              <div className="bg-green-50 p-2 rounded-md">
                <div className="text-xs text-gray-600">{t('mapTrackingModal.popups.currentPosition.gpsAccuracy')}</div>
                <div className="font-semibold text-green-700">{currentPoint.gps_accuracy}m</div>
              </div>
            )}
            <div className="bg-purple-50 p-2 rounded-md">
              <div className="text-xs text-gray-600">{t('mapTrackingModal.popups.currentPosition.progress')}</div>
              <div className="font-semibold text-purple-700">
                {currentPointIndex + 1} {t('mapTrackingModal.general.points')} {t('mapTrackingModal.popups.currentPosition.points')}
              </div>
            </div>
            <div className="bg-orange-50 p-2 rounded-md">
              <div className="text-xs text-gray-600">{t('mapTrackingModal.popups.currentPosition.elapsedTime')}</div>
              <div className="font-semibold text-orange-700">
                {minutes} {t('mapTrackingModal.popups.currentPosition.minutes')}
              </div>
            </div>
            <div className="mt-3 pt-2 border-t-2 border-yellow-200 text-center">
              <div className="flex items-center justify-center gap-2 text-green-600 font-medium text-xs">
                <HandThumbUpIcon className="h-4 w-4" />
                <span>{t('mapTrackingModal.popups.currentPosition.dragToNavigate')}</span>
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
  const { t } = useTranslation(); // Adicione esta linha
  const { companyId } = useCompany();

  const [data, setData] = useState<GPSPoint[]>([]);
  const [eventSummary, setEventSummary] = useState<EventSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentPointIndex, setCurrentPointIndex] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState(2);
  const [progress, setProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [autoZoomEnabled, setAutoZoomEnabled] = useState(true);
  const [mapType, setMapType] = useState<keyof ReturnType<typeof getMapTypes>>('satellite');
  const [mapReady, setMapReady] = useState(false);
  const [autoPlayTriggered, setAutoPlayTriggered] = useState(false);

  // 🗓️ Estados para controle de data
  const [dateRange, setDateRange] = useState<DateRangeType>('12h');
  const [customStartDate, setCustomStartDate] = useState<string>('');
  const [customEndDate, setCustomEndDate] = useState<string>('');

  const playbackIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Obter tipos de mapa traduzidos
  const MAP_TYPES = getMapTypes(t);

  // 🗓️ Função para calcular o range de datas
  const getDateRange = useCallback((): { start: Date; end: Date } => {
    const now = new Date();
    
    switch (dateRange) {
      case '12h':
        return {
          start: new Date(now.getTime() - 12 * 60 * 60 * 1000),
          end: now
        };
      case '24h':
        return {
          start: new Date(now.getTime() - 24 * 60 * 60 * 1000),
          end: now
        };
      case '7d':
        return {
          start: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
          end: now
        };
      case 'custom':
        return {
          start: customStartDate ? new Date(customStartDate) : new Date(now.getTime() - 24 * 60 * 60 * 1000),
          end: customEndDate ? new Date(customEndDate) : now
        };
      default:
        return {
          start: new Date(now.getTime() - 12 * 60 * 60 * 1000),
          end: now
        };
    }
  }, [dateRange, customStartDate, customEndDate]);

  // 🗓️ Função para formatar o período exibido
  const getDateRangeLabel = useCallback((): string => {
    const { start, end } = getDateRange();
    
    switch (dateRange) {
      case '12h':
        return t('mapTrackingModal.header.last12h');
      case '24h':
        return t('mapTrackingModal.header.last24h');
      case '7d':
        return t('mapTrackingModal.header.last7d');
      case 'custom':
        return `${start.toLocaleDateString('pt-BR')} - ${end.toLocaleDateString('pt-BR')}`;
      default:
        return t('mapTrackingModal.general.date');
    }
  }, [dateRange, getDateRange, t]);

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
      const { start, end } = getDateRange();

      const params = new URLSearchParams({
        dev_eui: deviceCode,
        limit: '200',
        sortBy: 'timestamp',
        sortOrder: 'ASC',
        valid_gps_only: 'true',
        start_date: start.toISOString(),
        end_date: end.toISOString(),
      });

      console.log('📅 Fetching GPS route with date range:', {
        start: start.toISOString(),
        end: end.toISOString(),
        range: dateRange
      });

      const response = await fetch(
        `https://apinode.smartxhub.cloud/api/dashboard/devices/${companyId}/gps-route/raw?${params}`
      );

      if (!response.ok) {
        throw new Error(t('mapTrackingModal.loading.errorLoadingRoute'));
      }

      const result = await response.json();

      if (result.data && result.data.length > 0) {
        console.log('📍 GPS Data loaded:', result.data.length, 'points');
        console.log('📊 Event Summary:', result.event_summary);
        setData(result.data);
        setEventSummary(result.event_summary || null);
        resetPlayer();
        
        setTimeout(() => {
          setMapReady(true);
          window.dispatchEvent(new Event('resize'));
        }, 300);
      } else {
        setData([]);
        setEventSummary(null);
        setError(`${t('mapTrackingModal.loading.noRouteFound')}: ${getDateRangeLabel()}`);
      }
    } catch (err) {
      console.error('Error fetching GPS route:', err);
      setError(err instanceof Error ? err.message : t('mapTrackingModal.loading.errorLoadingRoute'));
    } finally {
      setLoading(false);
    }
  }, [deviceCode, companyId, dateRange, customStartDate, customEndDate, getDateRange, getDateRangeLabel, t]);

  useEffect(() => {
    if (isOpen && deviceCode) {
      setMapReady(false);
      setData([]);
      setEventSummary(null);
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
      }, 1000);
    }
  }, [mapReady, autoPlayTriggered]);

  // Force resize do mapa quando os dados estiverem prontos
  useEffect(() => {
    if (mapReady && validData.length > 0) {
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

  // Calcular precisão média (apenas pontos com gps_accuracy válido)
  const averageAccuracy = validData.filter(p => p.gps_accuracy !== null).length > 0
    ? validData.filter(p => p.gps_accuracy !== null).reduce((sum, p) => sum + (p.gps_accuracy || 0), 0) / validData.filter(p => p.gps_accuracy !== null).length
    : 0;

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
                  <CalendarIcon className="h-3 w-3" />
                  {getDateRangeLabel()} • {deviceCode}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Seletor de Período */}
              <div className="flex items-center gap-2">
                <select
                  value={dateRange}
                  onChange={(e) => {
                    const newRange = e.target.value as DateRangeType;
                    setDateRange(newRange);
                    if (newRange !== 'custom') {
                      setTimeout(() => fetchGPSRoute(), 100);
                    }
                  }}
                  className="px-3 py-1.5 text-xs bg-white/20 text-white border border-white/30 rounded-lg backdrop-blur-sm hover:bg-white/30 transition-all font-medium"
                  disabled={loading}
                >
                  <option value="12h">{t('mapTrackingModal.header.last12h')}</option>
                  <option value="24h">{t('mapTrackingModal.header.last24h')}</option>
                  <option value="7d">{t('mapTrackingModal.header.last7d')}</option>
                  <option value="custom">{t('mapTrackingModal.header.custom')}</option>
                </select>

                {dateRange === 'custom' && (
                  <div className="flex items-center gap-2">
                    <input
                      type="datetime-local"
                      value={customStartDate}
                      onChange={(e) => setCustomStartDate(e.target.value)}
                      className="px-2 py-1 text-xs bg-white/20 text-white border border-white/30 rounded-lg backdrop-blur-sm"
                      max={customEndDate || new Date().toISOString().slice(0, 16)}
                    />
                    <span className="text-white text-xs font-medium">{t('mapTrackingModal.header.to')}</span>
                    <input
                      type="datetime-local"
                      value={customEndDate}
                      onChange={(e) => setCustomEndDate(e.target.value)}
                      className="px-2 py-1 text-xs bg-white/20 text-white border border-white/30 rounded-lg backdrop-blur-sm"
                      min={customStartDate}
                      max={new Date().toISOString().slice(0, 16)}
                    />
                    <button
                      onClick={fetchGPSRoute}
                      disabled={loading || !customStartDate || !customEndDate}
                      className="px-3 py-1.5 text-xs bg-white/30 hover:bg-white/40 text-white rounded-lg backdrop-blur-sm transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {t('mapTrackingModal.header.apply')}
                    </button>
                  </div>
                )}
              </div>

              <button
                onClick={fetchGPSRoute}
                disabled={loading}
                className="p-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-all duration-200 disabled:opacity-50 backdrop-blur-sm shadow-md"
                title={t('mapTrackingModal.header.refresh')}
              >
                <ArrowPathIcon className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
              </button>
              <button
                onClick={onClose}
                className="p-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-all duration-200 backdrop-blur-sm shadow-md"
                title={t('mapTrackingModal.header.close')}
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Player Controls Compacto */}
        {validData.length > 0 && (
          <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border-b border-yellow-200 px-4 py-2 shadow-inner">
            <div className="flex items-center justify-between gap-4">
              {/* Controles principais */}
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5 bg-white rounded-lg px-2 py-1 shadow-md">
                  <button
                    onClick={previousPoint}
                    disabled={currentPointIndex === 0}
                    className="p-1.5 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    title={t('mapTrackingModal.controls.previous')}
                  >
                    <BackwardIcon className="h-4 w-4 text-gray-700" />
                  </button>

                  {!isPlaying ? (
                    <button
                      onClick={startPlayback}
                      className="p-2 rounded-lg bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:from-green-600 hover:to-emerald-600 shadow-md transition-all"
                      title={t('mapTrackingModal.controls.play')}
                    >
                      <PlayIcon className="h-4 w-4" />
                    </button>
                  ) : (
                    <button
                      onClick={pausePlayback}
                      className="p-2 rounded-lg bg-gradient-to-r from-yellow-500 to-orange-500 text-white hover:from-yellow-600 hover:to-orange-600 shadow-md transition-all"
                      title={t('mapTrackingModal.controls.pause')}
                    >
                      <PauseIcon className="h-4 w-4" />
                    </button>
                  )}

                  <button
                    onClick={stopPlayback}
                    className="p-1.5 rounded-lg bg-gradient-to-r from-red-500 to-rose-500 text-white hover:from-red-600 hover:to-rose-600 shadow-md transition-all"
                    title={t('mapTrackingModal.controls.stop')}
                  >
                    <StopIcon className="h-4 w-4" />
                  </button>

                  <button
                    onClick={nextPoint}
                    disabled={currentPointIndex === validData.length - 1}
                    className="p-1.5 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    title={t('mapTrackingModal.controls.next')}
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
                  <option value={0.5}>{t('mapTrackingModal.controls.turtle')}</option>
                  <option value={1}>{t('mapTrackingModal.controls.walk')}</option>
                  <option value={2}>{t('mapTrackingModal.controls.run')}</option>
                  <option value={5}>{t('mapTrackingModal.controls.rocket')}</option>
                  <option value={10}>{t('mapTrackingModal.controls.lightning')}</option>
                </select>

                <div className="text-sm font-bold text-gray-800 bg-white px-3 py-1.5 rounded-lg shadow-md">
                  {currentPointIndex + 1}/{validData.length}
                </div>
              </div>

              {/* Barra de progresso */}
              <div className="flex-1 max-w-xl">
                <div className="flex justify-between text-xs font-medium text-gray-700 mb-1">
                  <span>🟢 {new Date(validData[0].timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
                  <span className="text-blue-600">📍 {t('mapTrackingModal.controls.currentPosition')}: {new Date(validData[currentPointIndex].timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
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
                  <div className="text-gray-600 font-medium">{t('mapTrackingModal.controls.points')}</div>
                  <div className="text-sm font-bold text-blue-600">{validData.length}</div>
                </div>
                {averageAccuracy > 0 && (
                  <div className="bg-white rounded-lg px-3 py-1.5 shadow-md border border-green-100 text-center">
                    <div className="text-gray-600 font-medium">{t('mapTrackingModal.controls.accuracy')}</div>
                    <div className="text-sm font-bold text-green-600">
                      {averageAccuracy.toFixed(0)} {t('mapTrackingModal.general.meters')}
                    </div>
                  </div>
                )}
                {eventSummary && eventSummary.total_events > 0 && (
                  <div className={`rounded-lg px-3 py-1.5 shadow-md border text-center ${
                    eventSummary.has_critical_events 
                      ? 'bg-red-50 border-red-200' 
                      : 'bg-orange-50 border-orange-200'
                  }`}>
                    <div className="text-gray-600 font-medium flex items-center gap-1">
                      <ExclamationTriangleIcon className="h-3 w-3" />
                      {t('mapTrackingModal.controls.events')}
                    </div>
                    <div className={`text-sm font-bold ${
                      eventSummary.has_critical_events ? 'text-red-600' : 'text-orange-600'
                    }`}>
                      {eventSummary.total_events}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Legenda de Eventos - só mostrar se houver eventos */}
        {eventSummary && eventSummary.total_events > 0 && (
          <div className="bg-gradient-to-r from-gray-50 to-slate-50 border-b border-gray-200 px-4 py-2">
            <div className="flex flex-wrap items-center justify-center gap-4 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-red-600 border-2 border-white shadow-md"></div>
                <span className="text-gray-700 font-medium">{t('mapTrackingModal.legend.emergency')}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-orange-500 border-2 border-white shadow-md"></div>
                <span className="text-gray-700 font-medium">{t('mapTrackingModal.legend.alert')}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-blue-500 border-2 border-white shadow-md"></div>
                <span className="text-gray-700 font-medium">{t('mapTrackingModal.legend.geofence')}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-green-500 border-2 border-white shadow-md"></div>
                <span className="text-gray-700 font-medium">{t('mapTrackingModal.legend.movement')}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-gray-500 border-2 border-white shadow-md"></div>
                <span className="text-gray-700 font-medium">{t('mapTrackingModal.legend.stopped')}</span>
              </div>
            </div>
          </div>
        )}

        {/* Map Container */}
        <div className="flex-1 relative">
          {loading ? (
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50">
              <div className="text-center">
                <div className="relative">
                  <div className="animate-spin rounded-full h-20 w-20 border-b-4 border-blue-600 mx-auto mb-4"></div>
                  <MapPinIcon className="h-8 w-8 text-blue-600 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
                </div>
                <p className="text-gray-700 font-semibold text-lg">{t('mapTrackingModal.loading.loadingRoute')}</p>
                <p className="text-gray-500 text-sm mt-2">{getDateRangeLabel()}</p>
              </div>
            </div>
          ) : error ? (
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-red-50 to-rose-50">
              <div className="text-center max-w-md">
                <MapPinIcon className="h-20 w-20 text-red-500 mx-auto mb-4" />
                <p className="text-red-600 font-bold text-lg mb-2">{error}</p>
                <p className="text-gray-600 text-sm mb-4">
                  {t('mapTrackingModal.loading.checkAnotherPeriod')}
                </p>
                <button
                  onClick={fetchGPSRoute}
                  className="mt-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 font-semibold shadow-lg transition-all duration-200"
                >
                  {t('mapTrackingModal.loading.tryAgain')}
                </button>
              </div>
            </div>
          ) : validData.length === 0 ? (
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-50 to-slate-50">
              <div className="text-center">
                <MapPinIcon className="h-20 w-20 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-700 font-bold text-lg">{t('mapTrackingModal.loading.noRouteFound')}</p>
                <p className="text-gray-500 text-sm mt-2">
                  {t('mapTrackingModal.loading.noValidGPSData')}
                </p>
                <p className="text-gray-400 text-xs mt-1">{getDateRangeLabel()}</p>
              </div>
            </div>
          ) : mapReady ? (
            <div className="absolute inset-0">
              <MapContainer
                center={center}
                zoom={19}
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

                <Compass />

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
                  const hasEvent = point.event_type !== null && point.event_type !== undefined;

                  // Mostrar: início, fim, eventos importantes ou a cada 20 pontos
                  if (!isStart && !isEnd && !hasEvent && index % 20 !== 0) return null;

                  // Usar cor do evento se existir, senão usar cor padrão
                  let color = point.event_color || (isStart ? '#22c55e' : isEnd ? '#ef4444' : '#3b82f6');
                  
                  // Tamanho baseado na severidade do evento
                  let radius = isStart || isEnd ? 10 : 5;
                  if (hasEvent && point.event_severity) {
                    radius = point.event_severity >= 4 ? 12 : point.event_severity >= 3 ? 10 : 8;
                  }

                  return (
                    <CircleMarker
                      key={`marker-${index}`}
                      center={[point.gps_latitude, point.gps_longitude]}
                      radius={radius}
                      pathOptions={{
                        color,
                        fillColor: color,
                        fillOpacity: hasEvent ? 0.85 : 0.7,
                        weight: hasEvent ? 3 : 2,
                      }}
                    >
                      <Popup>
                        <div className="p-3 min-w-[280px]">
                          {/* Header */}
                          <strong className="text-base flex items-center gap-2 mb-2">
                            {point.event_icon || (isStart ? '🟢' : isEnd ? '🔴' : '📍')} 
                            {isStart 
                              ? t('mapTrackingModal.popups.routePoint.start')
                              : isEnd 
                                ? t('mapTrackingModal.popups.routePoint.end')
                                : `${t('mapTrackingModal.popups.routePoint.point')} ${index + 1}`
                            }
                          </strong>
                          
                          {/* Descrição do Evento */}
                          {hasEvent && point.event_description && (
                            <div className={`mb-3 p-2 rounded-md font-semibold text-sm ${
                              (point.event_severity || 0) >= 4 ? 'bg-red-100 text-red-800 border border-red-300' :
                              (point.event_severity || 0) >= 3 ? 'bg-orange-100 text-orange-800 border border-orange-300' :
                              (point.event_severity || 0) >= 2 ? 'bg-blue-100 text-blue-800 border border-blue-300' :
                              'bg-green-100 text-green-800 border border-green-300'
                            }`}>
                              {point.event_description}
                            </div>
                          )}
                          
                          {/* Informações Básicas */}
                          <div className="text-sm space-y-1.5">
                            <div className="flex items-center gap-2 bg-blue-50 p-2 rounded">
                              <ClockIcon className="h-4 w-4 text-blue-600 flex-shrink-0" />
                              <span className="text-gray-700 text-xs">
                                {new Date(point.timestamp).toLocaleString('pt-BR')}
                              </span>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-2 text-xs">
                              <div className="bg-gray-50 p-2 rounded">
                                <div className="text-gray-600">{t('mapTrackingModal.popups.currentPosition.latitude')}</div>
                                <div className="font-semibold text-gray-900">
                                  {Number(point.gps_latitude).toFixed(6)}
                                </div>
                              </div>
                              <div className="bg-gray-50 p-2 rounded">
                                <div className="text-gray-600">{t('mapTrackingModal.popups.currentPosition.longitude')}</div>
                                <div className="font-semibold text-gray-900">
                                  {Number(point.gps_longitude).toFixed(6)}
                                </div>
                              </div>
                            </div>

                            {point.gps_accuracy && (
                              <div className="bg-green-50 p-2 rounded">
                                <div className="text-xs text-gray-600">{t('mapTrackingModal.popups.currentPosition.gpsAccuracy')}</div>
                                <div className="font-semibold text-green-700 text-sm">
                                  {point.gps_accuracy}m
                                </div>
                              </div>
                            )}

                            {/* Localização */}
                            {(point.zone_name || point.area_name) && (
                              <div className="bg-purple-50 p-2 rounded">
                                <div className="text-xs text-gray-600">{t('mapTrackingModal.popups.routePoint.location')}</div>
                                {point.zone_name && (
                                  <div className="text-sm font-semibold text-purple-700">
                                    📍 {point.zone_name}
                                  </div>
                                )}
                                {point.area_name && (
                                  <div className="text-xs text-purple-600">
                                    {point.area_name}
                                  </div>
                                )}
                              </div>
                            )}

                            {/* Movimento */}
                            {point.distance_moved_meters !== undefined && point.distance_moved_meters > 0 && (
                              <div className="bg-amber-50 p-2 rounded">
                                <div className="text-xs text-gray-600">{t('mapTrackingModal.popups.routePoint.movement')}</div>
                                <div className="text-sm font-semibold text-amber-700">
                                  🏃 {point.distance_moved_meters.toFixed(0)} {t('mapTrackingModal.popups.routePoint.meters')} • {point.movement_category}
                                </div>
                              </div>
                            )}

                            {/* Alertas Ativos */}
                            {hasEvent && (
                              <div className="mt-2 pt-2 border-t border-gray-200">
                                <div className="text-xs font-semibold text-gray-600 mb-1">
                                  {t('mapTrackingModal.popups.routePoint.alertStatus')}
                                </div>
                                <div className="space-y-1 text-xs">
                                  {point.mandown_alert === 1 && (
                                    <div className="text-red-700 flex items-center gap-1">
                                      {t('mapTrackingModal.popups.routePoint.fallDetected')}
                                    </div>
                                  )}
                                  {(point.button1_pressed === 1 || 
                                    point.button2_pressed === 1 || 
                                    point.button3_pressed === 1) && (
                                    <div className="text-red-700 flex items-center gap-1">
                                      {t('mapTrackingModal.popups.routePoint.panicButton')}
                                    </div>
                                  )}
                                  {point.tamper_alert === 1 && (
                                    <div className="text-orange-700 flex items-center gap-1">
                                      {t('mapTrackingModal.popups.routePoint.tamperDetected')}
                                    </div>
                                  )}
                                  {point.alarm1_value === 1 && (
                                    <div className="text-orange-700 flex items-center gap-1">
                                      {t('mapTrackingModal.popups.routePoint.alarm1Active')}
                                    </div>
                                  )}
                                  {point.alarm2_value === 1 && (
                                    <div className="text-orange-700 flex items-center gap-1">
                                      {t('mapTrackingModal.popups.routePoint.alarm2Active')}
                                    </div>
                                  )}
                                  {point.has_geofence_alert === 1 && (
                                    <div className="text-blue-700 flex items-center gap-1">
                                      🚧 {point.boundary_alert_details || t('mapTrackingModal.popups.routePoint.geofenceCrossed')}
                                    </div>
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
                <p className="text-gray-700 font-semibold text-lg">{t('mapTrackingModal.loading.preparingMap')}</p>
              </div>
            </div>
          )}
        </div>
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

        input[type="datetime-local"]::-webkit-calendar-picker-indicator {
          filter: invert(1);
        }
      `}</style>
    </div>
  );
};

export default MapTrackingModal;