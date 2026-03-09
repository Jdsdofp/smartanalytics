// src/components/CamAutomationPeople/modals/CameraConfigModal.tsx
// Modal de configuração de câmeras com suporte a:
// - Câmeras locais (USB/embutida)
// - Câmeras IP via URL
// - Modo "Single Camera" (mesma câmera para face e EPI)

// import React, { useState } from 'react';
// import { X, Camera, Wifi, Video } from 'lucide-react';
// import type { CamRole, CameraSourceType, SysConfig, CameraHook } from '../../../hooks/useCamAutomation';

// interface CameraConfigModalProps {
//   isOpen: boolean;
//   onClose: () => void;
//   sysConfig: SysConfig;
//   cameraHook: CameraHook;
//   onSave: (config: Partial<SysConfig>) => void;
// }

// export function CameraConfigModal({ 
//   isOpen, 
//   onClose, 
//   sysConfig, 
//   cameraHook,
//   onSave 
// }: CameraConfigModalProps) {
//   const [useSingleCamera, setUseSingleCamera] = useState(sysConfig.useSingleCamera);
//   const [testingCamera, setTestingCamera] = useState<CamRole | null>(null);

//   if (!isOpen) return null;

//   const handleSave = () => {
//     onSave({ 
//       useSingleCamera,
//       cameraSourceType: cameraHook.sourceTypes,
//       cameraIpUrl: cameraHook.ipUrls,
//     });
//     onClose();
//   };

//   const testCamera = async (role: CamRole) => {
//     setTestingCamera(role);
//     try {
//       await cameraHook.startStream(role);
//       setTimeout(() => {
//         cameraHook.stopStream(role);
//         setTestingCamera(null);
//       }, 3000);
//     } catch (error) {
//       console.error('Erro ao testar câmera:', error);
//       setTestingCamera(null);
//     }
//   };

//   const CameraRoleConfig = ({ role, label }: { role: CamRole; label: string }) => {
//     const sourceType = cameraHook.sourceTypes[role];
//     const isLocal = sourceType === 'local';

//     return (
//       <div className="space-y-3 p-4 bg-gray-50 rounded-lg">
//         <div className="flex items-center justify-between">
//           <h4 className="font-semibold text-gray-900 flex items-center gap-2">
//             <Camera className="w-4 h-4" />
//             {label}
//           </h4>
          
//           {/* Tipo de Câmera */}
//           <select
//             value={sourceType}
//             onChange={(e) => cameraHook.setSourceType(role, e.target.value as CameraSourceType)}
//             className="px-3 py-1.5 border rounded-md text-sm"
//           >
//             <option value="local">📹 Local (USB)</option>
//             <option value="ip_url">🌐 IP (URL)</option>
//           </select>
//         </div>

//         {/* Configuração Local */}
//         {isLocal && (
//           <div className="space-y-2">
//             <label className="text-sm text-gray-600">Dispositivo:</label>
//             <select
//               value={cameraHook.getAssignment(role) || ''}
//               onChange={(e) => cameraHook.assignDevice(role, e.target.value)}
//               className="w-full px-3 py-2 border rounded-md"
//             >
//               <option value="">Selecione uma câmera...</option>
//               {cameraHook.devices.map(device => (
//                 <option key={device.deviceId} value={device.deviceId}>
//                   {device.label || `Câmera ${device.deviceId.slice(0, 8)}...`}
//                 </option>
//               ))}
//             </select>
//           </div>
//         )}

//         {/* Configuração IP */}
//         {!isLocal && (
//           <div className="space-y-2">
//             <label className="text-sm text-gray-600">URL da Câmera IP:</label>
//             <input
//               type="text"
//               placeholder="http://admin:senha@192.168.1.100:8070/snapshot.cgi"
//               value={cameraHook.ipUrls[role] || ''}
//               onChange={(e) => cameraHook.setIpUrl(role, e.target.value)}
//               className="w-full px-3 py-2 border rounded-md font-mono text-sm"
//             />
//             <p className="text-xs text-gray-500">
//               💡 Exemplo: http://usuario:senha@IP:porta/cgi-bin/snapshot.cgi?channel=1
//             </p>
//           </div>
//         )}

//         {/* Botão Testar */}
//         {(isLocal ? cameraHook.getAssignment(role) : cameraHook.ipUrls[role]) && (
//           <button
//             onClick={() => testCamera(role)}
//             disabled={testingCamera === role}
//             className="w-full px-3 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-gray-300 flex items-center justify-center gap-2"
//           >
//             {testingCamera === role ? (
//               <>
//                 <Video className="w-4 h-4 animate-pulse" />
//                 Testando...
//               </>
//             ) : (
//               <>
//                 <Video className="w-4 h-4" />
//                 Testar Câmera (3s)
//               </>
//             )}
//           </button>
//         )}
//       </div>
//     );
//   };

//   return (
//     <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
//       <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        
//         {/* Header */}
//         <div className="flex items-center justify-between p-6 border-b">
//           <h2 className="text-xl font-bold text-gray-900">Configuração de Câmeras</h2>
//           <button
//             onClick={onClose}
//             className="p-2 hover:bg-gray-100 rounded-full transition-colors"
//           >
//             <X className="w-5 h-5" />
//           </button>
//         </div>

//         {/* Content */}
//         <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
//           {/* Modo Single Camera */}
//           <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
//             <label className="flex items-start gap-3 cursor-pointer">
//               <input
//                 type="checkbox"
//                 checked={useSingleCamera}
//                 onChange={(e) => setUseSingleCamera(e.target.checked)}
//                 className="mt-1 w-5 h-5"
//               />
//               <div>
//                 <div className="font-semibold text-blue-900">
//                   Usar Mesma Câmera para Face e EPI
//                 </div>
//                 <div className="text-sm text-blue-700 mt-1">
//                   Recomendado quando há apenas uma câmera disponível. A câmera configurada
//                   em "Face" será usada tanto para reconhecimento facial quanto para detecção de EPI.
//                 </div>
//               </div>
//             </label>
//           </div>

//           {/* Configuração Câmera Face */}
//           <CameraRoleConfig role="face" label="Câmera Face" />

//           {/* Configuração Câmeras Corpo (apenas se não for single camera) */}
//           {!useSingleCamera && (
//             <>
//               <CameraRoleConfig role="body1" label="Câmera Corpo 1" />
//               <CameraRoleConfig role="body2" label="Câmera Corpo 2 (Opcional)" />
//             </>
//           )}

//           {/* Avisos */}
//           <div className="space-y-2">
//             <div className="text-xs text-gray-600 bg-yellow-50 border border-yellow-200 rounded p-3">
//               <strong>⚠️ Câmeras IP:</strong> Se houver erro de CORS, configure o backend 
//               para fazer proxy das requisições de imagem.
//             </div>
//             <div className="text-xs text-gray-600 bg-green-50 border border-green-200 rounded p-3">
//               <strong>✅ Formato URL:</strong> http://usuario:senha@192.168.1.100:8070/snapshot.cgi
//             </div>
//           </div>
//         </div>

//         {/* Footer */}
//         <div className="flex gap-3 p-6 border-t bg-gray-50">
//           <button
//             onClick={onClose}
//             className="flex-1 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-100"
//           >
//             Cancelar
//           </button>
//           <button
//             onClick={handleSave}
//             className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
//           >
//             Salvar Configurações
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }


// src/components/CamAutomationPeople/modals/CameraConfigModal.tsx
// Modal de configuração de câmeras com suporte a:
// - Câmeras locais (USB/embutida)
// - Câmeras IP via URL
// - Modo "Single Camera" (mesma câmera para face e EPI)

import { useState } from 'react';
import { 
  XMarkIcon, 
  CameraIcon, 
  VideoCameraIcon
} from '@heroicons/react/24/outline';
import type { CamRole, CameraSourceType, SysConfig, CameraHook } from '../../../hooks/useCamAutomation';

interface CameraConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  sysConfig: SysConfig;
  cameraHook: CameraHook;
  onSave: (config: Partial<SysConfig>) => void;
}

export function CameraConfigModal({ 
  isOpen, 
  onClose, 
  sysConfig, 
  cameraHook,
  onSave 
}: CameraConfigModalProps) {
  const [useSingleCamera, setUseSingleCamera] = useState(sysConfig.useSingleCamera);
  const [testingCamera, setTestingCamera] = useState<CamRole | null>(null);

  if (!isOpen) return null;

  const handleSave = () => {
    onSave({ 
      useSingleCamera,
      cameraSourceType: cameraHook.sourceTypes,
      cameraIpUrl: cameraHook.ipUrls,
    });
    onClose();
  };

  const testCamera = async (role: CamRole) => {
    setTestingCamera(role);
    try {
      await cameraHook.startStream(role);
      setTimeout(() => {
        cameraHook.stopStream(role);
        setTestingCamera(null);
      }, 3000);
    } catch (error) {
      console.error('Erro ao testar câmera:', error);
      setTestingCamera(null);
    }
  };

  const CameraRoleConfig = ({ role, label }: { role: CamRole; label: string }) => {
    const sourceType = cameraHook.sourceTypes[role];
    const isLocal = sourceType === 'local';

    return (
      <div className="space-y-3 p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center justify-between">
          <h4 className="font-semibold text-gray-900 flex items-center gap-2">
            <CameraIcon className="w-5 h-5" />
            {label}
          </h4>
          
          {/* Tipo de Câmera */}
          <select
            value={sourceType}
            onChange={(e) => cameraHook.setSourceType(role, e.target.value as CameraSourceType)}
            className="px-3 py-1.5 border rounded-md text-sm"
          >
            <option value="local">📹 Local (USB)</option>
            <option value="ip_url">🌐 IP (URL)</option>
          </select>
        </div>

        {/* Configuração Local */}
        {isLocal && (
          <div className="space-y-2">
            <label className="text-sm text-gray-600">Dispositivo:</label>
            <select
              value={cameraHook.getAssignment(role) || ''}
              onChange={(e) => cameraHook.assignDevice(role, e.target.value)}
              className="w-full px-3 py-2 border rounded-md"
            >
              <option value="">Selecione uma câmera...</option>
              {cameraHook.devices.map(device => (
                <option key={device.deviceId} value={device.deviceId}>
                  {device.label || `Câmera ${device.deviceId.slice(0, 8)}...`}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Configuração IP */}
        {!isLocal && (
          <div className="space-y-2">
            <label className="text-sm text-gray-600">URL da Câmera IP:</label>
            <input
              type="text"
              placeholder="http://admin:senha@192.168.1.100:8070/snapshot.cgi"
              value={cameraHook.ipUrls[role] || ''}
              onChange={(e) => cameraHook.setIpUrl(role, e.target.value)}
              className="w-full px-3 py-2 border rounded-md font-mono text-sm"
            />
            <p className="text-xs text-gray-500">
              💡 Exemplo: http://usuario:senha@IP:porta/cgi-bin/snapshot.cgi?channel=1
            </p>
          </div>
        )}

        {/* Botão Testar */}
        {(isLocal ? cameraHook.getAssignment(role) : cameraHook.ipUrls[role]) && (
          <button
            onClick={() => testCamera(role)}
            disabled={testingCamera === role}
            className="w-full px-3 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-gray-300 flex items-center justify-center gap-2"
          >
            {testingCamera === role ? (
              <>
                <VideoCameraIcon className="w-5 h-5 animate-pulse" />
                Testando...
              </>
            ) : (
              <>
                <VideoCameraIcon className="w-5 h-5" />
                Testar Câmera (3s)
              </>
            )}
          </button>
        )}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-bold text-gray-900">Configuração de Câmeras</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* Modo Single Camera */}
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={useSingleCamera}
                onChange={(e) => setUseSingleCamera(e.target.checked)}
                className="mt-1 w-5 h-5"
              />
              <div>
                <div className="font-semibold text-blue-900">
                  Usar Mesma Câmera para Face e EPI
                </div>
                <div className="text-sm text-blue-700 mt-1">
                  Recomendado quando há apenas uma câmera disponível. A câmera configurada
                  em "Face" será usada tanto para reconhecimento facial quanto para detecção de EPI.
                </div>
              </div>
            </label>
          </div>

          {/* Configuração Câmera Face */}
          <CameraRoleConfig role="face" label="Câmera Face" />

          {/* Configuração Câmeras Corpo (apenas se não for single camera) */}
          {!useSingleCamera && (
            <>
              <CameraRoleConfig role="body1" label="Câmera Corpo 1" />
              <CameraRoleConfig role="body2" label="Câmera Corpo 2 (Opcional)" />
            </>
          )}

          {/* Avisos */}
          <div className="space-y-2">
            <div className="text-xs text-gray-600 bg-yellow-50 border border-yellow-200 rounded p-3">
              <strong>⚠️ Câmeras IP:</strong> Se houver erro de CORS, configure o backend 
              para fazer proxy das requisições de imagem.
            </div>
            <div className="text-xs text-gray-600 bg-green-50 border border-green-200 rounded p-3">
              <strong>✅ Formato URL:</strong> http://usuario:senha@192.168.1.100:8070/snapshot.cgi
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-6 border-t bg-gray-50">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-100"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Salvar Configurações
          </button>
        </div>
      </div>
    </div>
  );
}