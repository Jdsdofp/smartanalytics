// src/components/Poc/index.tsx

import {
  CheckIcon,
  XMarkIcon,
  UserIcon,
  CameraIcon,
  ClipboardDocumentListIcon,
  ExclamationTriangleIcon,
  Cog6ToothIcon
} from '@heroicons/react/24/solid';
import { useState } from 'react';
import peopleImg from '../../assets/images/api/people.png';
import headImg from '../../assets/images/api/head.png';
import handLeftImg from '../../assets/images/api/hand_left.png';
import handRightImg from '../../assets/images/api/hand_right.png';
import bootsImg from '../../assets/images/api/boots.png';

export default function Poc() {
  const [epiStatus, setEpiStatus] = useState([
    { name: 'Luva Esquerda', code: 'LUV-018', detected: false, position: 'left-hand' },
    { name: 'Luva Direita', code: 'LUV-001', detected: false, position: 'right-hand' },
    { name: 'Balaclava', code: 'Não detectado', detected: false, position: 'head' },
    { name: 'Uniforme/Casaco', code: 'UNI-052', detected: true, position: 'body' },
    { name: 'Botas', code: 'BOT-001', detected: false, position: 'boots' },
    { name: 'Calça Térmica', code: 'CAL-069', detected: false, position: 'legs' },
  ]);

  const [showControls, setShowControls] = useState(false);

  const allEpisOk = epiStatus.every(epi => epi.detected);

  // Função para obter o status de um item específico
  const getEpiStatus = (position: string) => {
    return epiStatus.find(epi => epi.position === position)?.detected || false;
  };

  // Função para alternar o status de um EPI
  const toggleEpiStatus = (position: string) => {
    setEpiStatus(prev => prev.map(epi => 
      epi.position === position ? { ...epi, detected: !epi.detected } : epi
    ));
  };

  // Funções para cenários pré-definidos
  const setAllDetected = () => {
    setEpiStatus(prev => prev.map(epi => ({ ...epi, detected: true })));
  };

  const setAllMissing = () => {
    setEpiStatus(prev => prev.map(epi => ({ ...epi, detected: false })));
  };

  const setRandom = () => {
    setEpiStatus(prev => prev.map(epi => ({ 
      ...epi, 
      detected: Math.random() > 0.5 
    })));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 to-blue-700 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <ClipboardDocumentListIcon className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Sistema de Verificação de EPIs</h1>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowControls(!showControls)}
              className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg transition-colors"
            >
              <Cog6ToothIcon className="w-5 h-5" />
              <span className="text-sm font-medium">Controles</span>
            </button>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-gray-700 font-medium text-sm sm:text-base">Conectado</span>
            </div>
          </div>
        </div>

        {/* Painel de Controles */}
        {showControls && (
          <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <Cog6ToothIcon className="w-6 h-6 text-gray-600" />
              <h2 className="text-lg sm:text-xl font-bold text-gray-800">Controles de Teste</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              <button
                onClick={setAllDetected}
                className="bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
              >
                Todos OK
              </button>
              <button
                onClick={setAllMissing}
                className="bg-red-500 hover:bg-red-600 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
              >
                Todos Faltando
              </button>
              <button
                onClick={setRandom}
                className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
              >
                Aleatório
              </button>
              <button
                onClick={() => setEpiStatus(prev => prev.map(epi => 
                  epi.position === 'body' ? { ...epi, detected: true } : { ...epi, detected: false }
                ))}
                className="bg-purple-500 hover:bg-purple-600 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
              >
                Apenas Uniforme
              </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              {epiStatus.map((epi, index) => (
                <div key={index} className="flex flex-col items-center">
                  <button
                    onClick={() => toggleEpiStatus(epi.position)}
                    className={`w-full py-2 px-3 rounded-lg font-medium text-sm transition-colors ${
                      epi.detected
                        ? 'bg-green-100 text-green-700 hover:bg-green-200'
                        : 'bg-red-100 text-red-700 hover:bg-red-200'
                    }`}
                  >
                    {epi.name}
                  </button>
                  <span className="text-xs text-gray-500 mt-1">
                    {epi.detected ? '✓' : '✗'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {/* Coluna da Esquerda - Captura e Informações */}
          <div className="space-y-4 sm:space-y-6">
            {/* Captura de Imagem */}
            <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6">
              <div className="flex items-center gap-2 mb-4">
                <CameraIcon className="w-6 h-6 text-gray-600" />
                <h2 className="text-lg sm:text-xl font-bold text-gray-800">Captura de Imagem</h2>
              </div>

              <div className="relative bg-gray-100 rounded-lg overflow-hidden mb-4">
                <img
                  src="/api/placeholder/400/250"
                  alt="Captura da câmera"
                  className="w-full h-auto"
                />
                <div className="absolute top-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
                  2024-11-17 18:39:06
                </div>
              </div>

              <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 sm:py-4 rounded-lg transition-colors shadow-md text-sm sm:text-base">
                Verificar EPIs
              </button>
            </div>

            {/* Informações do Operador */}
            <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6">
              <div className="flex items-center gap-2 mb-4">
                <UserIcon className="w-6 h-6 text-gray-600" />
                <h2 className="text-lg sm:text-xl font-bold text-gray-800">Informações do Operador</h2>
              </div>

              <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4">
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
              <div className={`${allEpisOk ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'} border-2 rounded-lg p-4 mt-4`}>
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
            </div>
          </div>

          {/* Coluna da Direita - Ilustração dos EPIs */}
          <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6">
            <div className="flex items-center gap-2 mb-4">
              <ClipboardDocumentListIcon className="w-6 h-6 text-gray-600" />
              <h2 className="text-lg sm:text-xl font-bold text-gray-800">Verificação Visual dos EPIs</h2>
            </div>

            <div className="bg-gradient-to-b from-gray-50 to-gray-100 rounded-lg p-4 sm:p-6">
              <div className="relative flex items-center justify-center" style={{ minHeight: '320px' }}>
                <div className="relative" style={{ width: '160px', height: '300px' }}>

                  {/* Imagem Principal do Corpo */}
                  <img
                    src={peopleImg}
                    alt="Operador"
                    className="w-full h-full object-contain relative z-0"
                  />

                  {/* OVERLAYS DOS EPIs FALTANDO */}
                  {/* Balaclava (head) */}
                  {!getEpiStatus('head') && (
                    <img
                      src={headImg}
                      alt="head missing"
                      className="absolute top-2 left-1/2 transform -translate-x-1/2 w-13 opacity-90"
                      style={{ top: '3%', left: '48%' }}
                    />
                  )}

                  {/* Luva Esquerda - Ajustada mais para o centro */}
                  {!getEpiStatus('left-hand') && (
                    <img
                      src={handLeftImg}
                      alt="hand left missing"
                      className="absolute w-8 opacity-90"
                      style={{ top: '48%', right: '9%' }}
                    />
                  )}

                  {/* Luva Direita - Ajustada mais para o centro */}
                  {!getEpiStatus('right-hand') && (
                    <img
                      src={handRightImg}
                      alt="hand right missing"
                      className="absolute w-8 opacity-90"
                      style={{ top: '48%', left: '5%' }}
                    />
                  )}

                  {/* Botas */}
                  {!getEpiStatus('boots') && (
                    <img
                      src={bootsImg}
                      alt="boots missing"
                      className="absolute bottom-2 left-1/2 transform -translate-x-1/2 w-25 opacity-90"
                      style={{ bottom: '4%', left: '47%' }}
                    />
                  )}

                  {/* Indicadores posicionados ao redor da imagem */}

                  {/* Balaclava - Topo (1) */}
                  <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 flex flex-col items-center">
                    {!getEpiStatus('head') ? (
                      <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center animate-pulse shadow-lg border-2 border-white">
                        <ExclamationTriangleIcon className="w-4 h-4 text-white" />
                      </div>
                    ) : (
                      <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center shadow-lg border-2 border-white">
                        <CheckIcon className="w-4 h-4 text-white" />
                      </div>
                    )}
                    <span className="text-xs font-medium text-gray-700 mt-1 bg-white px-2 py-1 rounded shadow-sm">
                      Balaclava
                    </span>
                  </div>

                  {/* Uniforme - Centro Direita (2) */}
                  <div className="absolute top-12 -right-12 flex flex-col items-center">
                    {!getEpiStatus('body') ? (
                      <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center animate-pulse shadow-lg border-2 border-white">
                        <ExclamationTriangleIcon className="w-4 h-4 text-white" />
                      </div>
                    ) : (
                      <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center shadow-lg border-2 border-white">
                        <CheckIcon className="w-4 h-4 text-white" />
                      </div>
                    )}
                    <span className="text-xs font-medium text-gray-700 mt-1 bg-white px-2 py-1 rounded shadow-sm whitespace-nowrap">
                      Uniforme
                    </span>
                  </div>

                  {/* Luva Esquerda - Direita (3) */}
                  <div className="absolute top-32 -right-12 flex flex-col items-center">
                    {!getEpiStatus('left-hand') ? (
                      <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center animate-pulse shadow-lg border-2 border-white">
                        <ExclamationTriangleIcon className="w-4 h-4 text-white" />
                      </div>
                    ) : (
                      <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center shadow-lg border-2 border-white">
                        <CheckIcon className="w-4 h-4 text-white" />
                      </div>
                    )}
                    <span className="text-xs font-medium text-gray-700 mt-1 bg-white px-2 py-1 rounded shadow-sm whitespace-nowrap">
                      Luva Esq.
                    </span>
                  </div>

                  {/* Calça Térmica - Esquerda Inferior (4) */}
                  <div className="absolute bottom-16 -left-12 flex flex-col items-center">
                    {!getEpiStatus('legs') ? (
                      <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center animate-pulse shadow-lg border-2 border-white">
                        <ExclamationTriangleIcon className="w-4 h-4 text-white" />
                      </div>
                    ) : (
                      <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center shadow-lg border-2 border-white">
                        <CheckIcon className="w-4 h-4 text-white" />
                      </div>
                    )}
                    <span className="text-xs font-medium text-gray-700 mt-1 bg-white px-2 py-1 rounded shadow-sm whitespace-nowrap">
                      Calça
                    </span>
                  </div>

                  {/* Luva Direita - Esquerda (5) */}
                  <div className="absolute top-32 -left-12 flex flex-col items-center">
                    {!getEpiStatus('right-hand') ? (
                      <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center animate-pulse shadow-lg border-2 border-white">
                        <ExclamationTriangleIcon className="w-4 h-4 text-white" />
                      </div>
                    ) : (
                      <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center shadow-lg border-2 border-white">
                        <CheckIcon className="w-4 h-4 text-white" />
                      </div>
                    )}
                    <span className="text-xs font-medium text-gray-700 mt-1 bg-white px-2 py-1 rounded shadow-sm whitespace-nowrap">
                      Luva Dir.
                    </span>
                  </div>

                  {/* Botas - Base (6) */}
                  <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 flex flex-col items-center">
                    {!getEpiStatus('boots') ? (
                      <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center animate-pulse shadow-lg border-2 border-white">
                        <ExclamationTriangleIcon className="w-4 h-4 text-white" />
                      </div>
                    ) : (
                      <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center shadow-lg border-2 border-white">
                        <CheckIcon className="w-4 h-4 text-white" />
                      </div>
                    )}
                    <span className="text-xs font-medium text-gray-700 mt-1 bg-white px-2 py-1 rounded shadow-sm">
                      Botas
                    </span>
                  </div>
                </div>
              </div>

              {/* Legenda */}
              <div className="mt-6 pt-4 border-t border-gray-200 flex items-center justify-center gap-4 sm:gap-6 text-xs sm:text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full border-2 border-white shadow"></div>
                  <span className="text-gray-700 font-medium">Detectado</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse border-2 border-white shadow"></div>
                  <span className="text-gray-700 font-medium">Faltando</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Detalhes dos EPIs */}
        <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 mt-4 sm:mt-6">
          <div className="flex items-center gap-2 mb-4">
            <ClipboardDocumentListIcon className="w-6 h-6 text-gray-600" />
            <h2 className="text-lg sm:text-xl font-bold text-gray-800">Detalhes dos EPIs</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {epiStatus.map((epi, index) => (
              <div
                key={index}
                className={`${epi.detected
                    ? 'bg-green-50 border-green-300'
                    : 'bg-red-50 border-red-300'
                  } border-2 rounded-lg p-3 sm:p-4 flex items-center justify-between transition-all hover:shadow-md`}
              >
                <div>
                  <h3 className="font-bold text-gray-800 text-sm sm:text-base">{epi.name}</h3>
                  <p className="text-xs sm:text-sm text-gray-600">{epi.code}</p>
                </div>
                {epi.detected ? (
                  <CheckIcon className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
                ) : (
                  <XMarkIcon className="w-5 h-5 sm:w-6 sm:h-6 text-red-600" />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}