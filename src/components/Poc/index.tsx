// src/components/Poc/index.tsx

import { 
  CheckIcon, 
  XMarkIcon, 
  UserIcon, 
  CameraIcon,
  ClipboardDocumentListIcon 
} from '@heroicons/react/24/solid';

export default function Poc() {
  const epiStatus = [
    { name: 'Luva Esquerda', code: 'LUV-018', detected: false },
    { name: 'Luva Direita', code: 'LUV-001', detected: true },
    { name: 'Balaclava', code: 'Não detectado', detected: false },
    { name: 'Uniforme/Casaco', code: 'UNI-052', detected: true },
    { name: 'Botas', code: 'BOT-001', detected: true },
    { name: 'Calça Térmica', code: 'CAL-069', detected: false },
  ];

  const allEpisOk = epiStatus.every(epi => epi.detected);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 to-blue-700 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <ClipboardDocumentListIcon className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-800">Sistema de Verificação de EPIs</h1>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-gray-700 font-medium">Conectado</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Captura de Imagem */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center gap-2 mb-4">
              <CameraIcon className="w-6 h-6 text-gray-600" />
              <h2 className="text-xl font-bold text-gray-800">Captura de Imagem</h2>
            </div>
            
            <div className="relative bg-gray-100 rounded-lg overflow-hidden mb-4">
              <img 
                src="/api/placeholder/400/300" 
                alt="Captura da câmera"
                className="w-full h-auto"
              />
              <div className="absolute top-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
                2024-11-17 18:39:06
              </div>
            </div>

            <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 rounded-lg transition-colors shadow-md">
              Verificar EPIs
            </button>
          </div>

          {/* Informações e Status */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center gap-2 mb-4">
              <UserIcon className="w-6 h-6 text-gray-600" />
              <h2 className="text-xl font-bold text-gray-800">Informações e Status</h2>
            </div>

            {/* Operador Info */}
            <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                  <UserIcon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-800">Operador 56</h3>
                  <p className="text-sm text-gray-600">Código: EMP731</p>
                </div>
              </div>
            </div>

            {/* Status Geral */}
            <div className={`${allEpisOk ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'} border-2 rounded-lg p-4 mb-6`}>
              <div className="flex items-center gap-2">
                {allEpisOk ? (
                  <>
                    <CheckIcon className="w-5 h-5 text-green-600" />
                    <span className="font-semibold text-gray-800">Todos os EPIs OK</span>
                  </>
                ) : (
                  <>
                    <XMarkIcon className="w-5 h-5 text-red-600" />
                    <span className="font-semibold text-gray-800">EPIs faltando</span>
                  </>
                )}
              </div>
            </div>

            {/* Ilustração */}
            <div className="bg-gray-100 rounded-lg p-8 flex items-center justify-center">
              <div className="text-center">
                <div className="w-48 h-64 bg-gray-700 rounded-full mx-auto mb-4 relative">
                  <div className="absolute top-8 left-1/2 transform -translate-x-1/2 w-16 h-12 bg-gray-800 rounded-full">
                    <div className="absolute top-1/2 left-1/4 w-3 h-2 bg-white rounded-sm"></div>
                    <div className="absolute top-1/2 right-1/4 w-3 h-2 bg-white rounded-sm"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Detalhes dos EPIs */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mt-6">
          <div className="flex items-center gap-2 mb-4">
            <ClipboardDocumentListIcon className="w-6 h-6 text-gray-600" />
            <h2 className="text-xl font-bold text-gray-800">Detalhes dos EPIs</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {epiStatus.map((epi, index) => (
              <div
                key={index}
                className={`${
                  epi.detected
                    ? 'bg-green-50 border-green-300'
                    : 'bg-red-50 border-red-300'
                } border-2 rounded-lg p-4 flex items-center justify-between`}
              >
                <div>
                  <h3 className="font-bold text-gray-800">{epi.name}</h3>
                  <p className="text-sm text-gray-600">{epi.code}</p>
                </div>
                {epi.detected ? (
                  <CheckIcon className="w-6 h-6 text-green-600" />
                ) : (
                  <XMarkIcon className="w-6 h-6 text-red-600" />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}