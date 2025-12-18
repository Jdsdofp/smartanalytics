// //src/components/layout/Layout.tsx
// import { useState } from 'react'
// import Header from './Header'
// import Menu from './Menu'
// import { useSearchParams } from 'react-router-dom'

// interface LayoutProps {
//   children: React.ReactNode
// }

// export default function Layout({ children }: LayoutProps) {
//   const [menuOpen, setMenuOpen] = useState(false)

//   const [searchParams] = useSearchParams()
//   const isEmbedded = searchParams.get('embedded') === 'true'

//   return (
//     isEmbedded ? (
//       <div className="w-full sm:px-2 lg:px-1 sm:py-1">
//         {children}
//       </div>
//     ) : (
//       <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
//         <Header onMenuClick={() => setMenuOpen(!menuOpen)} />
//         <div className="flex flex-col lg:flex-row">
//           <Menu isOpen={menuOpen} onClose={() => setMenuOpen(false)} />
//           <main className="flex-1 w-full min-w-0">
//             <div className="w-full sm:px-2 lg:px-1 sm:py-1">
//               {children}
//             </div>
//           </main>
//         </div>
//       </div>
//     )
//   )
// }


// src/components/layout/Layout.tsx
// import { useState } from 'react'
// import Header from './Header'
// import Menu from './Menu'
// import { useSearchParams, useLocation } from 'react-router-dom'
// import { QRCodeSVG } from 'qrcode.react'

// interface LayoutProps {
//   children: React.ReactNode
// }

// export default function Layout({ children }: LayoutProps) {
//   const [menuOpen, setMenuOpen] = useState(false)
//   const [searchParams] = useSearchParams()
//   const location = useLocation()
//   const isEmbedded = searchParams.get('embedded') === 'true'

//   const [showEmbedModal, setShowEmbedModal] = useState(false)
//   const [embedUrl, setEmbedUrl] = useState('')
//   const [copySuccess, setCopySuccess] = useState(false)
//   const [generatingQR, setGeneratingQR] = useState(false)

//   // Função para criar URL curta sem serviço externo
//   const createShortUrl = (longUrl: string): string => {
//     const url = new URL(longUrl)
//     const params = new URLSearchParams(url.search)
//     const token = params.get('token')
//     const embedded = params.get('embedded')
    
//     // Cria URL curta apenas com path + params essenciais
//     const baseUrl = `${url.origin}${url.pathname}`
    
//     // Extrai apenas os primeiros caracteres do token (suficiente para autenticação)
//     const shortToken = token ? token.substring(0, 32) : '' // Reduz tamanho do token
    
//     return `${baseUrl}?e=${embedded}&t=${shortToken}`
//   }

//   const generateEmbedUrl = async () => {
//     setGeneratingQR(true)
//     const token = sessionStorage.getItem('token')
//     const baseUrl = window.location.origin
//     const currentPath = location.pathname
//     const embedUrlWithParams = `${baseUrl}${currentPath}?embedded=true&token=${token}`
    
//     setEmbedUrl(embedUrlWithParams)
//     setGeneratingQR(false)
//     setShowEmbedModal(true)
//   }

//   const copyToClipboard = async () => {
//     try {
//       await navigator.clipboard.writeText(embedUrl)
//       setCopySuccess(true)
//       setTimeout(() => setCopySuccess(false), 2000)
//     } catch (err) {
//       console.error('Erro ao copiar:', err)
//     }
//   }

//   const copyIframeCode = async () => {
//     const iframeCode = `<iframe src="${embedUrl}" width="100%" height="800" frameborder="0" allowfullscreen></iframe>`
//     try {
//       await navigator.clipboard.writeText(iframeCode)
//       setCopySuccess(true)
//       setTimeout(() => setCopySuccess(false), 2000)
//     } catch (err) {
//       console.error('Erro ao copiar:', err)
//     }
//   }

//   const downloadQRCode = () => {
//     const svg = document.getElementById('qr-code-svg')
//     if (!svg) return

//     const svgData = new XMLSerializer().serializeToString(svg)
//     const canvas = document.createElement('canvas')
//     const ctx = canvas.getContext('2d')
//     const img = new Image()

//     img.onload = () => {
//       canvas.width = img.width
//       canvas.height = img.height
//       ctx?.drawImage(img, 0, 0)
//       const pngFile = canvas.toDataURL('image/png')

//       const downloadLink = document.createElement('a')
//       downloadLink.download = 'dashboard-qrcode.png'
//       downloadLink.href = pngFile
//       downloadLink.click()
//     }

//     img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)))
//   }

//   // Gera URL otimizada para QR Code
//   const getQRUrl = () => {
//     return createShortUrl(embedUrl)
//   }

//   return (
//     <>
//       {isEmbedded ? (
//         <div className="w-full sm:px-2 lg:px-1 sm:py-1">
//           {children}
//         </div>
//       ) : (
//         <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
//           <Header onMenuClick={() => setMenuOpen(!menuOpen)} />
//           <div className="flex flex-col lg:flex-row">
//             <Menu isOpen={menuOpen} onClose={() => setMenuOpen(false)} />
//             <main className="flex-1 w-full min-w-0 relative">
//               <div className="w-full sm:px-2 lg:px-1 sm:py-1">
//                 <div className="relative">
//                   <div className="absolute top-2 right-2 z-30">
//                     <button
//                       onClick={generateEmbedUrl}
//                       disabled={generatingQR}
//                       className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-green-600 text-white rounded-full hover:from-green-700 hover:to-blue-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105 group disabled:opacity-50 disabled:cursor-not-allowed"
//                       title="Gerar link de incorporação"
//                     >
//                       <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
//                         <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75 22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3-4.5 16.5" />
//                       </svg>
//                       <span className="font-medium text-sm hidden sm:inline">Embed</span>
//                     </button>
//                   </div>
//                   {children}
//                 </div>
//               </div>
//             </main>
//           </div>
//         </div>
//       )}

//       {/* MODAL DE EMBED */}
//       {showEmbedModal && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
//           <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto animate-fadeIn">
//             <div className="p-6">
//               {/* Header do Modal */}
//               <div className="flex items-center justify-between mb-6">
//                 <div className="flex items-center gap-3">
//                   <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-3 rounded-lg">
//                     <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
//                     </svg>
//                   </div>
//                   <div>
//                     <h3 className="text-2xl font-bold text-slate-800 dark:text-white">Dashboard Embed</h3>
//                     <p className="text-sm text-slate-600 dark:text-slate-400">Compartilhe ou incorpore esta página</p>
//                   </div>
//                 </div>
//                 <button
//                   onClick={() => {
//                     setShowEmbedModal(false)
//                     setCopySuccess(false)
//                   }}
//                   className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors hover:bg-slate-100 dark:hover:bg-gray-700 rounded-full p-2"
//                 >
//                   <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
//                   </svg>
//                 </button>
//               </div>

//               {/* Grid com QR Code e Informações */}
//               <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
//                 {/* QR Code Section */}
//                 <div className="lg:col-span-1 flex flex-col items-center justify-center">
//                   <div className="bg-white dark:bg-gray-700 p-4 rounded-xl shadow-lg border-2 border-slate-200 dark:border-gray-600">
//                     <QRCodeSVG
//                       id="qr-code-svg"
//                       value={getQRUrl()}
//                       size={200}
//                       level="L"
//                       includeMargin={true}
//                       className="w-full h-auto"
//                     />
//                   </div>
//                   <button
//                     onClick={downloadQRCode}
//                     className="mt-4 flex items-center gap-2 px-4 py-2 bg-slate-700 dark:bg-slate-600 text-white rounded-lg hover:bg-slate-800 dark:hover:bg-slate-500 transition-colors text-sm font-medium"
//                   >
//                     <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
//                     </svg>
//                     Baixar QR Code
//                   </button>
//                   <p className="text-xs text-slate-500 dark:text-slate-400 text-center mt-2 px-2">
//                     Escaneie para acesso direto ao dashboard
//                   </p>
//                 </div>

//                 {/* URL e iFrame Section */}
//                 <div className="lg:col-span-2 space-y-6">
//                   {/* URL Completa */}
//                   <div>
//                     <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
//                       🔗 URL de Acesso
//                     </label>
//                     <div className="flex gap-2">
//                       <input
//                         type="text"
//                         value={embedUrl}
//                         readOnly
//                         className="flex-1 px-4 py-3 bg-slate-50 dark:bg-gray-700 border border-slate-200 dark:border-gray-600 rounded-lg text-sm text-slate-600 dark:text-slate-300 font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
//                         onClick={(e) => e.currentTarget.select()}
//                       />
//                       <button
//                         onClick={copyToClipboard}
//                         className={`px-6 py-3 rounded-lg font-medium transition-all ${
//                           copySuccess
//                             ? 'bg-green-500 text-white'
//                             : 'bg-blue-600 text-white hover:bg-blue-700'
//                         }`}
//                       >
//                         {copySuccess ? (
//                           <div className="flex items-center gap-2">
//                             <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
//                             </svg>
//                             <span className="hidden sm:inline">Ok!</span>
//                           </div>
//                         ) : (
//                           <div className="flex items-center gap-2">
//                             <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
//                             </svg>
//                             <span className="hidden sm:inline">Copiar</span>
//                           </div>
//                         )}
//                       </button>
//                     </div>
//                   </div>

//                   {/* Código iFrame */}
//                   <div>
//                     <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
//                       📋 Código HTML (Iframe)
//                     </label>
//                     <div className="relative">
//                       <textarea
//                         value={`<iframe src="${embedUrl}" width="100%" height="800" frameborder="0" allowfullscreen></iframe>`}
//                         readOnly
//                         rows={3}
//                         className="w-full px-4 py-3 bg-slate-50 dark:bg-gray-700 border border-slate-200 dark:border-gray-600 rounded-lg text-sm text-slate-600 dark:text-slate-300 font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
//                         onClick={(e) => e.currentTarget.select()}
//                       />
//                       <button
//                         onClick={copyIframeCode}
//                         className="absolute top-3 right-3 px-4 py-2 bg-white dark:bg-gray-600 border border-slate-200 dark:border-gray-500 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-gray-500 transition-colors shadow-sm"
//                       >
//                         {copySuccess ? '✓' : 'Copiar'}
//                       </button>
//                     </div>
//                   </div>

//                   {/* Info Cards */}
//                   <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
//                     <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 p-3 rounded-lg border border-blue-200 dark:border-blue-700">
//                       <div className="flex items-center gap-2 mb-1">
//                         <svg className="w-4 h-4 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
//                         </svg>
//                         <span className="text-xs font-semibold text-blue-900 dark:text-blue-300">QR Code</span>
//                       </div>
//                       <p className="text-xs text-blue-800 dark:text-blue-400">Acesso mobile rápido</p>
//                     </div>

//                     <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 p-3 rounded-lg border border-purple-200 dark:border-purple-700">
//                       <div className="flex items-center gap-2 mb-1">
//                         <svg className="w-4 h-4 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
//                         </svg>
//                         <span className="text-xs font-semibold text-purple-900 dark:text-purple-300">URL</span>
//                       </div>
//                       <p className="text-xs text-purple-800 dark:text-purple-400">Compartilhamento direto</p>
//                     </div>

//                     <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 p-3 rounded-lg border border-green-200 dark:border-green-700">
//                       <div className="flex items-center gap-2 mb-1">
//                         <svg className="w-4 h-4 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
//                         </svg>
//                         <span className="text-xs font-semibold text-green-900 dark:text-green-300">Iframe</span>
//                       </div>
//                       <p className="text-xs text-green-800 dark:text-green-400">Incorporar em sites</p>
//                     </div>
//                   </div>
//                 </div>
//               </div>

//               {/* Informações de Segurança */}
//               <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
//                 <div className="flex gap-3">
//                   <svg className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
//                   </svg>
//                   <div>
//                     <h4 className="font-semibold text-amber-900 dark:text-amber-300 mb-1">⚠️ Informações de Segurança</h4>
//                     <ul className="text-sm text-amber-800 dark:text-amber-400 space-y-1">
//                       <li>• Token de autenticação incluído - uso autorizado apenas</li>
//                       <li>• QR Code abre diretamente no navegador</li>
//                       <li>• Não compartilhe com pessoas não autorizadas</li>
//                       <li>• Dados atualizados em tempo real</li>
//                     </ul>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}
//     </>
//   )
// }

// src/components/layout/Layout.tsx
import { useState, useEffect } from 'react'
import Header from './Header'
import Menu from './Menu'
import { useSearchParams, useLocation } from 'react-router-dom'
import { QRCodeSVG } from 'qrcode.react'
import { useTranslation } from 'react-i18next'

interface LayoutProps {
  children: React.ReactNode
  showEmbedButton?: boolean
}

export default function Layout({ children, showEmbedButton = true }: LayoutProps) {
  const { t } = useTranslation()
  const [menuOpen, setMenuOpen] = useState(false)
  const [searchParams] = useSearchParams()
  const location = useLocation()
  
  const isEmbedded = searchParams.get('embedded') === 'true' || searchParams.get('e') === 'true'

  const [showEmbedModal, setShowEmbedModal] = useState(false)
  const [embedUrl, setEmbedUrl] = useState('')
  const [shortUrl, setShortUrl] = useState('')
  const [copySuccess, setCopySuccess] = useState(false)
  const [generatingQR, setGeneratingQR] = useState(false)

  // Detectar e normalizar token
  useEffect(() => {
    const urlToken = searchParams.get('token')
    const shortToken = searchParams.get('t')
    
    if (shortToken && !urlToken) {
      sessionStorage.setItem('token', shortToken)
    } else if (urlToken) {
      sessionStorage.setItem('token', urlToken)
    }
  }, [searchParams])

  const shortenUrlWithBackend = async (longUrl: string): Promise<string> => {
    try {
      const response = await fetch('https://apinode.smartxhub.cloud/api/dashboard/api/shorten', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: longUrl })
      })

      if (response.ok) {
        const data = await response.json()
        return data.shortUrl
      }
      
      return longUrl
    } catch (error) {
      console.error(t('embed.errors.shortenFailed'), error)
      return longUrl
    }
  }

  const generateEmbedUrl = async () => {
    setGeneratingQR(true)
    const token = sessionStorage.getItem('token')
    const baseUrl = window.location.origin
    const currentPath = location.pathname
    const embedUrlWithParams = `${baseUrl}${currentPath}?embedded=true&token=${token}`
    
    setEmbedUrl(embedUrlWithParams)
    
    const shortened = await shortenUrlWithBackend(embedUrlWithParams)
    setShortUrl(shortened)
    
    setGeneratingQR(false)
    setShowEmbedModal(true)
  }

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(embedUrl)
      setCopySuccess(true)
      setTimeout(() => setCopySuccess(false), 2000)
    } catch (err) {
      console.error(t('embed.errors.copyFailed'), err)
    }
  }

  const copyIframeCode = async () => {
    const iframeCode = `<iframe src="${embedUrl}" width="100%" height="800" frameborder="0" allowfullscreen></iframe>`
    try {
      await navigator.clipboard.writeText(iframeCode)
      setCopySuccess(true)
      setTimeout(() => setCopySuccess(false), 2000)
    } catch (err) {
      console.error(t('embed.errors.copyFailed'), err)
    }
  }

  const downloadQRCode = () => {
    const svg = document.getElementById('qr-code-svg')
    if (!svg) return

    const svgData = new XMLSerializer().serializeToString(svg)
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const img = new Image()

    img.onload = () => {
      canvas.width = img.width
      canvas.height = img.height
      ctx?.drawImage(img, 0, 0)
      const pngFile = canvas.toDataURL('image/png')

      const downloadLink = document.createElement('a')
      downloadLink.download = 'dashboard-qrcode.png'
      downloadLink.href = pngFile
      downloadLink.click()
    }

    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)))
  }

  return (
    <>
      {isEmbedded ? (
        <div className="w-full sm:px-2 lg:px-1 sm:py-1">
          {children}
        </div>
      ) : (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
          <Header onMenuClick={() => setMenuOpen(!menuOpen)} />
          <div className="flex flex-col lg:flex-row">
            <Menu isOpen={menuOpen} onClose={() => setMenuOpen(false)} />
            <main className="flex-1 w-full min-w-0 relative">
              <div className="w-full sm:px-2 lg:px-1 sm:py-1">
                <div className="relative">
                  {showEmbedButton && (
                    <div className="absolute top-2 right-2 z-30">
                      <button
                        onClick={generateEmbedUrl}
                        disabled={generatingQR}
                        className="cursor-pointer flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-green-600 text-white rounded-full hover:from-green-700 hover:to-blue-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105 group disabled:opacity-50 disabled:cursor-not-allowed"
                        title={t('embed.button.title')}
                      >
                        {generatingQR ? (
                          <>
                            <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            <span className="font-medium text-sm hidden sm:inline">{t('embed.button.generating')}</span>
                          </>
                        ) : (
                          <>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75 22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3-4.5 16.5" />
                            </svg>
                            <span className="font-medium text-sm hidden sm:inline">{t('embed.button.label')}</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}
                  {children}
                </div>
              </div>
            </main>
          </div>
        </div>
      )}

      {/* MODAL DE EMBED */}
      {showEmbedModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto animate-fadeIn">
            <div className="p-6">
              {/* Header do Modal */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-3 rounded-lg">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-slate-800 dark:text-white">{t('embed.modal.title')}</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">{t('embed.modal.subtitle')}</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowEmbedModal(false)
                    setCopySuccess(false)
                  }}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors hover:bg-slate-100 dark:hover:bg-gray-700 rounded-full p-2"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Grid com QR Code e Informações */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                {/* QR Code Section */}
                <div className="lg:col-span-1 flex flex-col items-center justify-center">
                  <div className="bg-white dark:bg-gray-700 p-4 rounded-xl shadow-lg border-2 border-slate-200 dark:border-gray-600">
                    {shortUrl ? (
                      <QRCodeSVG
                        id="qr-code-svg"
                        value={shortUrl}
                        size={200}
                        level="M"
                        includeMargin={true}
                        className="w-full h-auto"
                      />
                    ) : (
                      <div className="w-[200px] h-[200px] flex items-center justify-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                      </div>
                    )}
                  </div>
                  {shortUrl && (
                    <>
                      <button
                        onClick={downloadQRCode}
                        className="mt-4 flex items-center gap-2 px-4 py-2 bg-slate-700 dark:bg-slate-600 text-white rounded-lg hover:bg-slate-800 dark:hover:bg-slate-500 transition-colors text-sm font-medium"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        {t('embed.qrCode.download')}
                      </button>
                      <p className="text-xs text-slate-500 dark:text-slate-400 text-center mt-2 px-2">
                        {t('embed.qrCode.scanInfo')}
                      </p>
                    </>
                  )}
                </div>

                {/* URL e iFrame Section */}
                <div className="lg:col-span-2 space-y-6">
                  {/* URL Completa */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                      🔗 {t('embed.url.full')}
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={embedUrl}
                        readOnly
                        className="flex-1 px-4 py-3 bg-slate-50 dark:bg-gray-700 border border-slate-200 dark:border-gray-600 rounded-lg text-sm text-slate-600 dark:text-slate-300 font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
                        onClick={(e) => e.currentTarget.select()}
                      />
                      <button
                        onClick={copyToClipboard}
                        className={`px-6 py-3 rounded-lg font-medium transition-all ${
                          copySuccess
                            ? 'bg-green-500 text-white'
                            : 'bg-blue-600 text-white hover:bg-blue-700'
                        }`}
                      >
                        {copySuccess ? t('embed.url.copied') : t('embed.url.copy')}
                      </button>
                    </div>
                  </div>

                  {/* Código iFrame */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                      📋 {t('embed.iframe.title')}
                    </label>
                    <div className="relative">
                      <textarea
                        value={`<iframe src="${embedUrl}" width="100%" height="800" frameborder="0" allowfullscreen></iframe>`}
                        readOnly
                        rows={3}
                        className="w-full px-4 py-3 bg-slate-50 dark:bg-gray-700 border border-slate-200 dark:border-gray-600 rounded-lg text-sm text-slate-600 dark:text-slate-300 font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                        onClick={(e) => e.currentTarget.select()}
                      />
                      <button
                        onClick={copyIframeCode}
                        className="absolute top-3 right-3 px-4 py-2 bg-white dark:bg-gray-600 border border-slate-200 dark:border-gray-500 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-gray-500 transition-colors shadow-sm"
                      >
                        {copySuccess ? t('embed.url.copied') : t('embed.iframe.copy')}
                      </button>
                    </div>
                  </div>

                  {/* Info Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 p-3 rounded-lg border border-blue-200 dark:border-blue-700">
                      <div className="flex items-center gap-2 mb-1">
                        <svg className="w-4 h-4 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        <span className="text-xs font-semibold text-blue-900 dark:text-blue-300">{t('embed.features.qrCode.title')}</span>
                      </div>
                      <p className="text-xs text-blue-800 dark:text-blue-400">{t('embed.features.qrCode.description')}</p>
                    </div>

                    <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 p-3 rounded-lg border border-purple-200 dark:border-purple-700">
                      <div className="flex items-center gap-2 mb-1">
                        <svg className="w-4 h-4 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                        </svg>
                        <span className="text-xs font-semibold text-purple-900 dark:text-purple-300">{t('embed.features.url.title')}</span>
                      </div>
                      <p className="text-xs text-purple-800 dark:text-purple-400">{t('embed.features.url.description')}</p>
                    </div>

                    <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 p-3 rounded-lg border border-green-200 dark:border-green-700">
                      <div className="flex items-center gap-2 mb-1">
                        <svg className="w-4 h-4 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                        </svg>
                        <span className="text-xs font-semibold text-green-900 dark:text-green-300">{t('embed.features.iframe.title')}</span>
                      </div>
                      <p className="text-xs text-green-800 dark:text-green-400">{t('embed.features.iframe.description')}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Informações de Segurança */}
              <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
                <div className="flex gap-3">
                  <svg className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <div>
                    <h4 className="font-semibold text-amber-900 dark:text-amber-300 mb-1">{t('embed.security.title')}</h4>
                    <ul className="text-sm text-amber-800 dark:text-amber-400 space-y-1">
                      <li>• {t('embed.security.tokenIncluded')}</li>
                      <li>• {t('embed.security.shortUrlInfo')}</li>
                      <li>• {t('embed.security.qrCodeDirect')}</li>
                      <li>• {t('embed.security.realTimeData')}</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}