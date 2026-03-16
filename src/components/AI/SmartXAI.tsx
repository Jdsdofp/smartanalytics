// // // src/components/AI/SmartXAI.tsx
// // import { useState, useRef, useEffect } from 'react'
// // import { useAIChat, useAnalyticsReport, type ReportTopic } from '../../hooks/useAIChat'
// // import { useCompany } from '../../hooks/useCompany'
// // import {
// //   ChatBubbleLeftRightIcon,
// //   DocumentChartBarIcon,
// //   PaperAirplaneIcon,
// //   ArrowPathIcon,
// //   XMarkIcon,
// //   SparklesIcon,
// //   ChevronDownIcon,
// // } from '@heroicons/react/24/outline'
// // import { SparklesIcon as SparklesSolid } from '@heroicons/react/24/solid'

// // const REPORT_TOPICS: { key: ReportTopic; label: string; icon: string; description: string }[] = [
// //   { key: 'certificates', label: 'Certificados', icon: '📄', description: 'Compliance, vencimentos e riscos' },
// //   { key: 'assets', label: 'Ativos', icon: '🏭', description: 'Inventário, valor e utilização' },
// //   { key: 'temperature', label: 'Temperatura', icon: '🌡️', description: 'Exposição térmica e NR-15' },
// //   { key: 'boundary', label: 'Movimentação', icon: '📍', description: 'Fluxo de pessoas por zona' },
// //   { key: 'alerts', label: 'Alertas', icon: '🚨', description: 'Alarmes e status operacional' },
// // ]

// // const SUGGESTIONS = [
// //   'Quantos certificados estão vencidos?',
// //   'Tem algum alarme ativo agora?',
// //   'Quais ativos estão parados?',
// //   'Como está a temperatura dos trabalhadores?',
// //   'Qual área tem mais movimentação hoje?',
// // ]

// // // ─────────────────────────────────────────────
// // // Cursor piscando — aparece no final da mensagem enquanto escreve
// // // ─────────────────────────────────────────────
// // function BlinkingCursor() {
// //   return (
// //     <span
// //       className="inline-block w-0.5 h-3 bg-primary-500 ml-0.5 align-middle"
// //       style={{ animation: 'blink 0.8s step-end infinite' }}
// //     />
// //   )
// // }

// // // ─────────────────────────────────────────────
// // // Formata markdown simples em JSX
// // // Suporta ##, ###, **bold**, listas, parágrafos
// // // ─────────────────────────────────────────────
// // function formatMessage(text: string, isStreaming = false) {
// //   const lines = text.split('\n')
// //   const elements = lines.map((line, i) => {
// //     const isLast = i === lines.length - 1

// //     if (line.startsWith('## ')) {
// //       return (
// //         <h3 key={i} className="text-sm font-bold text-primary-700 dark:text-primary-300 mt-3 mb-1">
// //           {line.replace('## ', '')}
// //           {isLast && isStreaming && <BlinkingCursor />}
// //         </h3>
// //       )
// //     }
// //     if (line.startsWith('### ')) {
// //       return (
// //         <h4 key={i} className="text-xs font-semibold text-gray-700 dark:text-gray-300 mt-2 mb-1">
// //           {line.replace('### ', '')}
// //           {isLast && isStreaming && <BlinkingCursor />}
// //         </h4>
// //       )
// //     }
// //     if (line.startsWith('**') && line.endsWith('**')) {
// //       return (
// //         <p key={i} className="text-xs font-semibold text-gray-800 dark:text-gray-200">
// //           {line.replace(/\*\*/g, '')}
// //           {isLast && isStreaming && <BlinkingCursor />}
// //         </p>
// //       )
// //     }
// //     if (line.match(/^\d+\.\s/)) {
// //       return (
// //         <p key={i} className="text-xs text-gray-700 dark:text-gray-300 ml-2">
// //           • {line.replace(/^\d+\.\s/, '')}
// //           {isLast && isStreaming && <BlinkingCursor />}
// //         </p>
// //       )
// //     }
// //     if (line.startsWith('- ') || line.startsWith('• ')) {
// //       return (
// //         <p key={i} className="text-xs text-gray-700 dark:text-gray-300 ml-2">
// //           • {line.replace(/^[-•]\s/, '')}
// //           {isLast && isStreaming && <BlinkingCursor />}
// //         </p>
// //       )
// //     }
// //     if (line.trim() === '') {
// //       return <br key={i} />
// //     }
// //     return (
// //       <p key={i} className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed">
// //         {line}
// //         {isLast && isStreaming && <BlinkingCursor />}
// //       </p>
// //     )
// //   })

// //   return elements
// // }

// // export default function SmartXAI() {
// //   const { companyId } = useCompany()
// //   const [activeTab, setActiveTab] = useState<'chat' | 'report'>('chat')
// //   const [input, setInput] = useState('')
// //   const [selectedTopic, setSelectedTopic] = useState<ReportTopic>('certificates')
// //   const [extraContext, setExtraContext] = useState('')
// //   const [showExtraContext, setShowExtraContext] = useState(false)
// //   const messagesEndRef = useRef<HTMLDivElement>(null)
// //   const inputRef = useRef<HTMLTextAreaElement>(null)

// //   const id = companyId || 1

// //   const { messages, loading: chatLoading, error: chatError, contextUsed, sendMessage, clearMessages } = useAIChat(id)
// //   const { report, loading: reportLoading, error: reportError, currentTopic, generateReport, clearReport, topicLabels, topicIcons } = useAnalyticsReport(id)

// //   useEffect(() => {
// //     messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
// //   }, [messages, chatLoading])

// //   const handleSend = async () => {
// //     if (!input.trim()) return
// //     const text = input
// //     setInput('')
// //     await sendMessage(text)
// //   }

// //   const handleKeyDown = (e: React.KeyboardEvent) => {
// //     if (e.key === 'Enter' && !e.shiftKey) {
// //       e.preventDefault()
// //       handleSend()
// //     }
// //   }

// //   const handleSuggestion = (text: string) => {
// //     setInput(text)
// //     inputRef.current?.focus()
// //   }

// //   // Detecta se a última mensagem do assistant ainda está sendo escrita
// //   const lastMsg = messages[messages.length - 1]
// //   const isLastMsgStreaming = chatLoading && lastMsg?.role === 'assistant'

// //   return (
// //     <>
// //       {/* Injetar CSS do cursor piscando */}
// //       <style>{`
// //         @keyframes blink {
// //           0%, 100% { opacity: 1; }
// //           50% { opacity: 0; }
// //         }
// //       `}</style>

// //       <div className="flex flex-col h-full bg-white dark:bg-gray-900 rounded-2xl shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700">

// //         {/* Header */}
// //         <div className="flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-primary-600 to-primary-700 text-white">
// //           <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-white/20">
// //             <SparklesSolid className="w-4 h-4 text-white" />
// //           </div>
// //           <div className="flex-1">
// //             <p className="text-sm font-semibold leading-tight">SmartX AI</p>
// //             <p className="text-xs text-primary-200 leading-tight">Assistente Inteligente</p>
// //           </div>
// //           <div className="flex items-center gap-1 px-2 py-1 bg-white/10 rounded-full">
// //             <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
// //             <span className="text-xs text-white/80">Online</span>
// //           </div>
// //         </div>

// //         {/* Tabs */}
// //         <div className="flex border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
// //           <button
// //             onClick={() => setActiveTab('chat')}
// //             className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-xs font-medium transition-all ${
// //               activeTab === 'chat'
// //                 ? 'text-primary-600 border-b-2 border-primary-600 bg-white dark:bg-gray-900'
// //                 : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'
// //             }`}
// //           >
// //             <ChatBubbleLeftRightIcon className="w-4 h-4" />
// //             Chat Inteligente
// //           </button>
// //           <button
// //             onClick={() => setActiveTab('report')}
// //             className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-xs font-medium transition-all ${
// //               activeTab === 'report'
// //                 ? 'text-primary-600 border-b-2 border-primary-600 bg-white dark:bg-gray-900'
// //                 : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'
// //             }`}
// //           >
// //             <DocumentChartBarIcon className="w-4 h-4" />
// //             Relatórios
// //           </button>
// //         </div>

// //         {/* ──────────── CHAT TAB ──────────── */}
// //         {activeTab === 'chat' && (
// //           <>
// //             <div className="flex-1 overflow-y-auto p-3 space-y-3 min-h-0">

// //               {messages.length === 0 && (
// //                 <div className="flex flex-col items-center justify-center h-full gap-4 py-6">
// //                   <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-primary-50 dark:bg-primary-900/30">
// //                     <SparklesIcon className="w-6 h-6 text-primary-500" />
// //                   </div>
// //                   <div className="text-center">
// //                     <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Como posso ajudar?</p>
// //                     <p className="text-xs text-gray-400 mt-1">Faça perguntas sobre seus dados em tempo real</p>
// //                   </div>
// //                   <div className="flex flex-col gap-1.5 w-full">
// //                     {SUGGESTIONS.map((s, i) => (
// //                       <button
// //                         key={i}
// //                         onClick={() => handleSuggestion(s)}
// //                         className="text-left text-xs px-3 py-2 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 hover:text-primary-600 dark:hover:text-primary-400 transition-all border border-transparent hover:border-primary-200 dark:hover:border-primary-800"
// //                       >
// //                         {s}
// //                       </button>
// //                     ))}
// //                   </div>
// //                 </div>
// //               )}

// //               {messages.map((msg, i) => {
// //                 const isThisStreaming = isLastMsgStreaming && i === messages.length - 1
// //                 return (
// //                   <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
// //                     {msg.role === 'assistant' && (
// //                       <div className="flex items-center justify-center w-6 h-6 rounded-lg bg-primary-100 dark:bg-primary-900/40 mr-2 mt-0.5 flex-shrink-0">
// //                         <SparklesSolid className="w-3 h-3 text-primary-600 dark:text-primary-400" />
// //                       </div>
// //                     )}
// //                     <div className={`max-w-[82%] rounded-2xl px-3 py-2 ${
// //                       msg.role === 'user'
// //                         ? 'bg-primary-600 text-white rounded-tr-sm'
// //                         : 'bg-gray-100 dark:bg-gray-800 rounded-tl-sm'
// //                     }`}>
// //                       {msg.role === 'user'
// //                         ? <p className="text-xs leading-relaxed">{msg.content}</p>
// //                         : (
// //                           <div className="space-y-0.5">
// //                             {msg.content === '' && isThisStreaming
// //                               // Mensagem ainda vazia — mostra só o cursor
// //                               ? <p className="text-xs text-gray-400"><BlinkingCursor /></p>
// //                               // Mensagem com conteúdo — formata com cursor no final se streaming
// //                               : formatMessage(msg.content, isThisStreaming)
// //                             }
// //                           </div>
// //                         )
// //                       }
// //                     </div>
// //                   </div>
// //                 )
// //               })}

// //               {/* Loading dots — só aparece antes do primeiro chunk chegar */}
// //               {chatLoading && !isLastMsgStreaming && (
// //                 <div className="flex justify-start">
// //                   <div className="flex items-center justify-center w-6 h-6 rounded-lg bg-primary-100 dark:bg-primary-900/40 mr-2 flex-shrink-0">
// //                     <SparklesSolid className="w-3 h-3 text-primary-600 dark:text-primary-400" />
// //                   </div>
// //                   <div className="bg-gray-100 dark:bg-gray-800 rounded-2xl rounded-tl-sm px-3 py-2">
// //                     <div className="flex gap-1 items-center h-4">
// //                       <div className="w-1.5 h-1.5 rounded-full bg-primary-400 animate-bounce" style={{ animationDelay: '0ms' }} />
// //                       <div className="w-1.5 h-1.5 rounded-full bg-primary-400 animate-bounce" style={{ animationDelay: '150ms' }} />
// //                       <div className="w-1.5 h-1.5 rounded-full bg-primary-400 animate-bounce" style={{ animationDelay: '300ms' }} />
// //                     </div>
// //                   </div>
// //                 </div>
// //               )}

// //               {chatError && (
// //                 <div className="text-center">
// //                   <p className="text-xs text-red-500 bg-red-50 dark:bg-red-900/20 rounded-xl px-3 py-2">{chatError}</p>
// //                 </div>
// //               )}

// //               {contextUsed.length > 0 && !chatLoading && (
// //                 <div className="flex flex-wrap gap-1 justify-center">
// //                   {contextUsed.map(ctx => (
// //                     <span key={ctx} className="text-xs px-2 py-0.5 rounded-full bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 border border-primary-200 dark:border-primary-800">
// //                       🔍 {ctx}
// //                     </span>
// //                   ))}
// //                 </div>
// //               )}

// //               <div ref={messagesEndRef} />
// //             </div>

// //             {/* Input */}
// //             <div className="p-3 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
// //               {messages.length > 0 && (
// //                 <button
// //                   onClick={clearMessages}
// //                   className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 mb-2 transition-colors"
// //                 >
// //                   <XMarkIcon className="w-3 h-3" />
// //                   Limpar conversa
// //                 </button>
// //               )}
// //               <div className="flex gap-2">
// //                 <textarea
// //                   ref={inputRef}
// //                   value={input}
// //                   onChange={e => setInput(e.target.value)}
// //                   onKeyDown={handleKeyDown}
// //                   placeholder="Pergunte sobre seus dados..."
// //                   rows={1}
// //                   className="flex-1 resize-none text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-200 px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent placeholder-gray-400 dark:placeholder-gray-500"
// //                   style={{ maxHeight: '80px' }}
// //                 />
// //                 <button
// //                   onClick={handleSend}
// //                   disabled={!input.trim() || chatLoading}
// //                   className="flex items-center justify-center w-9 h-9 rounded-xl bg-primary-600 hover:bg-primary-700 disabled:opacity-40 disabled:cursor-not-allowed text-white transition-all"
// //                 >
// //                   {chatLoading
// //                     ? <ArrowPathIcon className="w-4 h-4 animate-spin" />
// //                     : <PaperAirplaneIcon className="w-4 h-4" />
// //                   }
// //                 </button>
// //               </div>
// //             </div>
// //           </>
// //         )}

// //         {/* ──────────── REPORT TAB ──────────── */}
// //         {activeTab === 'report' && (
// //           <div className="flex-1 flex flex-col overflow-hidden min-h-0">
// //             <div className="p-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
// //               <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">Escolha o domínio:</p>
// //               <div className="grid grid-cols-5 gap-1.5">
// //                 {REPORT_TOPICS.map(topic => (
// //                   <button
// //                     key={topic.key}
// //                     onClick={() => { setSelectedTopic(topic.key); clearReport() }}
// //                     title={topic.description}
// //                     className={`flex flex-col items-center gap-0.5 py-2 px-1 rounded-xl text-xs font-medium transition-all ${
// //                       selectedTopic === topic.key
// //                         ? 'bg-primary-600 text-white shadow-sm'
// //                         : 'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 border border-gray-200 dark:border-gray-600'
// //                     }`}
// //                   >
// //                     <span className="text-base">{topic.icon}</span>
// //                     <span className="text-[10px] leading-tight text-center">{topic.label}</span>
// //                   </button>
// //                 ))}
// //               </div>

// //               <button
// //                 onClick={() => setShowExtraContext(v => !v)}
// //                 className="flex items-center gap-1 text-xs text-gray-400 hover:text-primary-600 mt-2 transition-colors"
// //               >
// //                 <ChevronDownIcon className={`w-3 h-3 transition-transform ${showExtraContext ? 'rotate-180' : ''}`} />
// //                 Adicionar foco específico
// //               </button>

// //               {showExtraContext && (
// //                 <textarea
// //                   value={extraContext}
// //                   onChange={e => setExtraContext(e.target.value)}
// //                   placeholder="Ex: Quero focar nos departamentos com mais risco financeiro..."
// //                   rows={2}
// //                   className="mt-1.5 w-full resize-none text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 placeholder-gray-400 dark:placeholder-gray-500"
// //                 />
// //               )}

// //               <button
// //                 onClick={() => generateReport(selectedTopic, extraContext || undefined)}
// //                 disabled={reportLoading}
// //                 className="mt-2 w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-primary-600 hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-medium transition-all"
// //               >
// //                 {reportLoading ? (
// //                   <>
// //                     <ArrowPathIcon className="w-3.5 h-3.5 animate-spin" />
// //                     Gerando relatório...
// //                   </>
// //                 ) : (
// //                   <>
// //                     <SparklesIcon className="w-3.5 h-3.5" />
// //                     Gerar Relatório com IA
// //                   </>
// //                 )}
// //               </button>
// //             </div>

// //             <div className="flex-1 overflow-y-auto p-3 min-h-0">
// //               {!report && !reportLoading && !reportError && (
// //                 <div className="flex flex-col items-center justify-center h-full gap-3 text-center">
// //                   <DocumentChartBarIcon className="w-10 h-10 text-gray-300 dark:text-gray-600" />
// //                   <div>
// //                     <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
// //                       {topicIcons[selectedTopic]} {topicLabels[selectedTopic]}
// //                     </p>
// //                     <p className="text-xs text-gray-400 mt-1">
// //                       Clique em "Gerar Relatório" para analisar os dados em tempo real
// //                     </p>
// //                   </div>
// //                 </div>
// //               )}

// //               {reportLoading && (
// //                 <div className="flex flex-col items-center justify-center h-full gap-3">
// //                   <div className="w-10 h-10 rounded-2xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
// //                     <ArrowPathIcon className="w-5 h-5 text-primary-600 dark:text-primary-400 animate-spin" />
// //                   </div>
// //                   <div className="text-center">
// //                     <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Buscando dados do banco...</p>
// //                     <p className="text-xs text-gray-400 mt-1">A IA está analisando os dados da empresa</p>
// //                   </div>
// //                 </div>
// //               )}

// //               {reportError && (
// //                 <div className="flex items-center justify-center h-full">
// //                   <p className="text-xs text-red-500 bg-red-50 dark:bg-red-900/20 rounded-xl px-4 py-3 text-center">{reportError}</p>
// //                 </div>
// //               )}

// //               {report && !reportLoading && (
// //                 <div>
// //                   <div className="flex items-center gap-2 mb-3">
// //                     <span className="text-base">{topicIcons[currentTopic!]}</span>
// //                     <p className="text-xs font-semibold text-gray-700 dark:text-gray-300">
// //                       Relatório — {topicLabels[currentTopic!]}
// //                     </p>
// //                     <button onClick={clearReport} className="ml-auto text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
// //                       <XMarkIcon className="w-3.5 h-3.5" />
// //                     </button>
// //                   </div>
// //                   <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-3 space-y-0.5">
// //                     {formatMessage(report)}
// //                   </div>
// //                   <button
// //                     onClick={() => generateReport(selectedTopic, extraContext || undefined)}
// //                     className="mt-2 w-full flex items-center justify-center gap-1.5 py-1.5 rounded-xl border border-primary-200 dark:border-primary-800 text-primary-600 dark:text-primary-400 text-xs hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-all"
// //                   >
// //                     <ArrowPathIcon className="w-3 h-3" />
// //                     Regenerar
// //                   </button>
// //                 </div>
// //               )}
// //             </div>
// //           </div>
// //         )}
// //       </div>
// //     </>
// //   )
// // }



// // src/components/AI/SmartXAI.tsx
// import { useState, useRef, useEffect } from 'react'
// import { useAIChat, useAnalyticsReport, type ReportTopic } from '../../hooks/useAIChat'
// import { useCompany } from '../../hooks/useCompany'
// import {
//   ChatBubbleLeftRightIcon,
//   DocumentChartBarIcon,
//   PaperAirplaneIcon,
//   ArrowPathIcon,
//   XMarkIcon,
//   SparklesIcon,
//   ChevronDownIcon,
// } from '@heroicons/react/24/outline'
// import { SparklesIcon as SparklesSolid } from '@heroicons/react/24/solid'

// const REPORT_TOPICS: { key: ReportTopic; label: string; icon: string; description: string }[] = [
//   { key: 'certificates', label: 'Certificados', icon: '📄', description: 'Compliance, vencimentos e riscos' },
//   { key: 'assets', label: 'Ativos', icon: '🏭', description: 'Inventário, valor e utilização' },
//   { key: 'temperature', label: 'Temperatura', icon: '🌡️', description: 'Exposição térmica e NR-15' },
//   { key: 'boundary', label: 'Movimentação', icon: '📍', description: 'Fluxo de pessoas por zona' },
//   { key: 'alerts', label: 'Alertas', icon: '🚨', description: 'Alarmes e status operacional' },
// ]

// const SUGGESTIONS = [
//   'Quantos certificados estão vencidos?',
//   'Tem algum alarme ativo agora?',
//   'Quais ativos estão parados?',
//   'Como está a temperatura dos trabalhadores?',
//   'Qual área tem mais movimentação hoje?',
// ]

// function BlinkingCursor() {
//   return (
//     <span
//       className="inline-block w-0.5 h-3 bg-primary-500 ml-0.5 align-middle"
//       style={{ animation: 'blink 0.8s step-end infinite' }}
//     />
//   )
// }

// function formatMessage(text: string, isStreaming = false) {
//   const lines = text.split('\n')
//   return lines.map((line, i) => {
//     const isLast = i === lines.length - 1

//     if (line.startsWith('## ')) return (
//       <h3 key={i} className="text-sm font-bold text-primary-700 dark:text-primary-300 mt-3 mb-1">
//         {line.replace('## ', '')}{isLast && isStreaming && <BlinkingCursor />}
//       </h3>
//     )
//     if (line.startsWith('### ')) return (
//       <h4 key={i} className="text-xs font-semibold text-gray-700 dark:text-gray-300 mt-2 mb-1">
//         {line.replace('### ', '')}{isLast && isStreaming && <BlinkingCursor />}
//       </h4>
//     )
//     if (line.startsWith('**') && line.endsWith('**')) return (
//       <p key={i} className="text-xs font-semibold text-gray-800 dark:text-gray-200">
//         {line.replace(/\*\*/g, '')}{isLast && isStreaming && <BlinkingCursor />}
//       </p>
//     )
//     if (line.match(/^\d+\.\s/)) return (
//       <p key={i} className="text-xs text-gray-700 dark:text-gray-300 ml-2">
//         • {line.replace(/^\d+\.\s/, '')}{isLast && isStreaming && <BlinkingCursor />}
//       </p>
//     )
//     if (line.startsWith('- ') || line.startsWith('• ')) return (
//       <p key={i} className="text-xs text-gray-700 dark:text-gray-300 ml-2">
//         • {line.replace(/^[-•]\s/, '')}{isLast && isStreaming && <BlinkingCursor />}
//       </p>
//     )
//     if (line.trim() === '') return <br key={i} />
//     return (
//       <p key={i} className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed">
//         {line}{isLast && isStreaming && <BlinkingCursor />}
//       </p>
//     )
//   })
// }

// export default function SmartXAI() {
//   const { companyId } = useCompany()
//   const [activeTab, setActiveTab] = useState<'chat' | 'report'>('chat')
//   const [input, setInput] = useState('')
//   const [selectedTopic, setSelectedTopic] = useState<ReportTopic>('certificates')
//   const [extraContext, setExtraContext] = useState('')
//   const [showExtraContext, setShowExtraContext] = useState(false)
//   const messagesEndRef = useRef<HTMLDivElement>(null)
//   const inputRef = useRef<HTMLTextAreaElement>(null)

//   const id = companyId || 1

//   const { messages, loading: chatLoading, error: chatError, contextUsed, sendMessage, clearMessages } = useAIChat(id)
//   const { report, loading: reportLoading, error: reportError, currentTopic, generateReport, clearReport, topicLabels, topicIcons } = useAnalyticsReport(id)

//   useEffect(() => {
//     messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
//   }, [messages, chatLoading])

//   const handleSend = async () => {
//     if (!input.trim()) return
//     const text = input
//     setInput('')
//     await sendMessage(text)
//   }

//   const handleKeyDown = (e: React.KeyboardEvent) => {
//     if (e.key === 'Enter' && !e.shiftKey) {
//       e.preventDefault()
//       handleSend()
//     }
//   }

//   const handleSuggestion = (text: string) => {
//     setInput(text)
//     inputRef.current?.focus()
//   }

//   const lastMsg = messages[messages.length - 1]
//   const isLastMsgStreaming = chatLoading && lastMsg?.role === 'assistant'

//   return (
//     <>
//       <style>{`
//         @keyframes blink {
//           0%, 100% { opacity: 1; }
//           50% { opacity: 0; }
//         }
//         @keyframes spin {
//           from { transform: rotate(0deg); }
//           to { transform: rotate(360deg); }
//         }
//       `}</style>

//       <div className="flex flex-col h-full bg-white dark:bg-gray-900 rounded-2xl shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700">

//         {/* Header */}
//         <div className="flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-primary-600 to-primary-700 text-white">
//           <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-white/20">
//             <SparklesSolid className="w-4 h-4 text-white" />
//           </div>
//           <div className="flex-1">
//             <p className="text-sm font-semibold leading-tight">SmartX AI</p>
//             <p className="text-xs text-primary-200 leading-tight">Assistente Inteligente</p>
//           </div>
//           <div className="flex items-center gap-1 px-2 py-1 bg-white/10 rounded-full">
//             <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
//             <span className="text-xs text-white/80">Online</span>
//           </div>
//         </div>

//         {/* Tabs */}
//         <div className="flex border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
//           <button
//             onClick={() => setActiveTab('chat')}
//             className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-xs font-medium transition-all ${
//               activeTab === 'chat'
//                 ? 'text-primary-600 border-b-2 border-primary-600 bg-white dark:bg-gray-900'
//                 : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'
//             }`}
//           >
//             <ChatBubbleLeftRightIcon className="w-4 h-4" />
//             Chat Inteligente
//           </button>
//           <button
//             onClick={() => setActiveTab('report')}
//             className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-xs font-medium transition-all ${
//               activeTab === 'report'
//                 ? 'text-primary-600 border-b-2 border-primary-600 bg-white dark:bg-gray-900'
//                 : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'
//             }`}
//           >
//             <DocumentChartBarIcon className="w-4 h-4" />
//             Relatórios
//           </button>
//         </div>

//         {/* ──────────── CHAT TAB ──────────── */}
//         {activeTab === 'chat' && (
//           <>
//             <div className="flex-1 overflow-y-auto p-3 space-y-3 min-h-0">

//               {messages.length === 0 && (
//                 <div className="flex flex-col items-center justify-center h-full gap-4 py-6">
//                   <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-primary-50 dark:bg-primary-900/30">
//                     <SparklesIcon className="w-6 h-6 text-primary-500" />
//                   </div>
//                   <div className="text-center">
//                     <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Como posso ajudar?</p>
//                     <p className="text-xs text-gray-400 mt-1">Faça perguntas sobre seus dados em tempo real</p>
//                   </div>
//                   <div className="flex flex-col gap-1.5 w-full">
//                     {SUGGESTIONS.map((s, i) => (
//                       <button
//                         key={i}
//                         onClick={() => handleSuggestion(s)}
//                         className="text-left text-xs px-3 py-2 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 hover:text-primary-600 dark:hover:text-primary-400 transition-all border border-transparent hover:border-primary-200 dark:hover:border-primary-800"
//                       >
//                         {s}
//                       </button>
//                     ))}
//                   </div>
//                 </div>
//               )}

//               {messages.map((msg, i) => {
//                 const isThisStreaming = isLastMsgStreaming && i === messages.length - 1
//                 return (
//                   <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
//                     {msg.role === 'assistant' && (
//                       <div className="flex items-center justify-center w-6 h-6 rounded-lg bg-primary-100 dark:bg-primary-900/40 mr-2 mt-0.5 flex-shrink-0">
//                         <SparklesSolid className="w-3 h-3 text-primary-600 dark:text-primary-400" />
//                       </div>
//                     )}
//                     <div className={`max-w-[82%] rounded-2xl px-3 py-2 ${
//                       msg.role === 'user'
//                         ? 'bg-primary-600 text-white rounded-tr-sm'
//                         : 'bg-gray-100 dark:bg-gray-800 rounded-tl-sm'
//                     }`}>
//                       {msg.role === 'user'
//                         ? <p className="text-xs leading-relaxed">{msg.content}</p>
//                         : (
//                           <div className="space-y-0.5">
//                             {msg.content === '' && isThisStreaming
//                               ? <p className="text-xs text-gray-400"><BlinkingCursor /></p>
//                               : formatMessage(msg.content, isThisStreaming)
//                             }
//                           </div>
//                         )
//                       }
//                     </div>
//                   </div>
//                 )
//               })}

//               {/* Loading dots — antes do primeiro chunk */}
//               {chatLoading && !isLastMsgStreaming && (
//                 <div className="flex justify-start">
//                   <div className="flex items-center justify-center w-6 h-6 rounded-lg bg-primary-100 dark:bg-primary-900/40 mr-2 flex-shrink-0">
//                     <SparklesSolid className="w-3 h-3 text-primary-600 dark:text-primary-400" />
//                   </div>
//                   <div className="bg-gray-100 dark:bg-gray-800 rounded-2xl rounded-tl-sm px-3 py-2">
//                     <div className="flex gap-1 items-center h-4">
//                       <div className="w-1.5 h-1.5 rounded-full bg-primary-400 animate-bounce" style={{ animationDelay: '0ms' }} />
//                       <div className="w-1.5 h-1.5 rounded-full bg-primary-400 animate-bounce" style={{ animationDelay: '150ms' }} />
//                       <div className="w-1.5 h-1.5 rounded-full bg-primary-400 animate-bounce" style={{ animationDelay: '300ms' }} />
//                     </div>
//                   </div>
//                 </div>
//               )}

//               {chatError && (
//                 <div className="text-center">
//                   <p className="text-xs text-red-500 bg-red-50 dark:bg-red-900/20 rounded-xl px-3 py-2">{chatError}</p>
//                 </div>
//               )}

//               {contextUsed.length > 0 && !chatLoading && (
//                 <div className="flex flex-wrap gap-1 justify-center">
//                   {contextUsed.map(ctx => (
//                     <span key={ctx} className="text-xs px-2 py-0.5 rounded-full bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 border border-primary-200 dark:border-primary-800">
//                       🔍 {ctx}
//                     </span>
//                   ))}
//                 </div>
//               )}

//               <div ref={messagesEndRef} />
//             </div>

//             {/* Input */}
//             <div className="p-3 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
//               {messages.length > 0 && (
//                 <button
//                   onClick={clearMessages}
//                   className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 mb-2 transition-colors"
//                 >
//                   <XMarkIcon className="w-3 h-3" />
//                   Limpar conversa
//                 </button>
//               )}
//               <div className="flex gap-2">
//                 <textarea
//                   ref={inputRef}
//                   value={input}
//                   onChange={e => setInput(e.target.value)}
//                   onKeyDown={handleKeyDown}
//                   placeholder="Pergunte sobre seus dados..."
//                   rows={1}
//                   className="flex-1 resize-none text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-200 px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent placeholder-gray-400 dark:placeholder-gray-500"
//                   style={{ maxHeight: '80px' }}
//                 />
//                 <button
//                   onClick={handleSend}
//                   disabled={!input.trim() || chatLoading}
//                   className="flex items-center justify-center w-9 h-9 rounded-xl bg-primary-600 hover:bg-primary-700 disabled:opacity-40 disabled:cursor-not-allowed text-white transition-all"
//                 >
//                   {chatLoading
//                     ? <ArrowPathIcon className="w-4 h-4 animate-spin" />
//                     : <PaperAirplaneIcon className="w-4 h-4" />
//                   }
//                 </button>
//               </div>
//             </div>
//           </>
//         )}

//         {/* ──────────── REPORT TAB ──────────── */}
//         {activeTab === 'report' && (
//           <div className="flex-1 flex flex-col overflow-hidden min-h-0">
//             <div className="p-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
//               <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">Escolha o domínio:</p>
//               <div className="grid grid-cols-5 gap-1.5">
//                 {REPORT_TOPICS.map(topic => (
//                   <button
//                     key={topic.key}
//                     onClick={() => { setSelectedTopic(topic.key); clearReport() }}
//                     title={topic.description}
//                     className={`flex flex-col items-center gap-0.5 py-2 px-1 rounded-xl text-xs font-medium transition-all ${
//                       selectedTopic === topic.key
//                         ? 'bg-primary-600 text-white shadow-sm'
//                         : 'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 border border-gray-200 dark:border-gray-600'
//                     }`}
//                   >
//                     <span className="text-base">{topic.icon}</span>
//                     <span className="text-[10px] leading-tight text-center">{topic.label}</span>
//                   </button>
//                 ))}
//               </div>

//               <button
//                 onClick={() => setShowExtraContext(v => !v)}
//                 className="flex items-center gap-1 text-xs text-gray-400 hover:text-primary-600 mt-2 transition-colors"
//               >
//                 <ChevronDownIcon className={`w-3 h-3 transition-transform ${showExtraContext ? 'rotate-180' : ''}`} />
//                 Adicionar foco específico
//               </button>

//               {showExtraContext && (
//                 <textarea
//                   value={extraContext}
//                   onChange={e => setExtraContext(e.target.value)}
//                   placeholder="Ex: Quero focar nos departamentos com mais risco financeiro..."
//                   rows={2}
//                   className="mt-1.5 w-full resize-none text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 placeholder-gray-400 dark:placeholder-gray-500"
//                 />
//               )}

//               <button
//                 onClick={() => generateReport(selectedTopic, extraContext || undefined)}
//                 disabled={reportLoading}
//                 className="mt-2 w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-primary-600 hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-medium transition-all"
//               >
//                 {reportLoading ? (
//                   <>
//                     <ArrowPathIcon className="w-3.5 h-3.5 animate-spin" />
//                     Gerando relatório...
//                   </>
//                 ) : (
//                   <>
//                     <SparklesIcon className="w-3.5 h-3.5" />
//                     Gerar Relatório com IA
//                   </>
//                 )}
//               </button>
//             </div>

//             <div className="flex-1 overflow-y-auto p-3 min-h-0">
//               {!report && !reportLoading && !reportError && (
//                 <div className="flex flex-col items-center justify-center h-full gap-3 text-center">
//                   <DocumentChartBarIcon className="w-10 h-10 text-gray-300 dark:text-gray-600" />
//                   <div>
//                     <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
//                       {topicIcons[selectedTopic]} {topicLabels[selectedTopic]}
//                     </p>
//                     <p className="text-xs text-gray-400 mt-1">
//                       Clique em "Gerar Relatório" para analisar os dados em tempo real
//                     </p>
//                   </div>
//                 </div>
//               )}

//               {reportLoading && (
//                 <div className="flex flex-col items-center justify-center h-full gap-3">
//                   <div className="w-10 h-10 rounded-2xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
//                     <ArrowPathIcon className="w-5 h-5 text-primary-600 dark:text-primary-400 animate-spin" />
//                   </div>
//                   <div className="text-center">
//                     <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Buscando dados do banco...</p>
//                     <p className="text-xs text-gray-400 mt-1">A IA está analisando os dados da empresa</p>
//                   </div>
//                 </div>
//               )}

//               {reportError && (
//                 <div className="flex items-center justify-center h-full">
//                   <p className="text-xs text-red-500 bg-red-50 dark:bg-red-900/20 rounded-xl px-4 py-3 text-center">{reportError}</p>
//                 </div>
//               )}

//               {report && !reportLoading && (
//                 <div>
//                   <div className="flex items-center gap-2 mb-3">
//                     <span className="text-base">{topicIcons[currentTopic!]}</span>
//                     <p className="text-xs font-semibold text-gray-700 dark:text-gray-300">
//                       Relatório — {topicLabels[currentTopic!]}
//                     </p>
//                     <button onClick={clearReport} className="ml-auto text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
//                       <XMarkIcon className="w-3.5 h-3.5" />
//                     </button>
//                   </div>
//                   <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-3 space-y-0.5">
//                     {formatMessage(report)}
//                   </div>
//                   <button
//                     onClick={() => generateReport(selectedTopic, extraContext || undefined)}
//                     className="mt-2 w-full flex items-center justify-center gap-1.5 py-1.5 rounded-xl border border-primary-200 dark:border-primary-800 text-primary-600 dark:text-primary-400 text-xs hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-all"
//                   >
//                     <ArrowPathIcon className="w-3 h-3" />
//                     Regenerar
//                   </button>
//                 </div>
//               )}
//             </div>
//           </div>
//         )}
//       </div>
//     </>
//   )
// }


// src/components/AI/SmartXAI.tsx
import { useState, useRef, useEffect } from 'react'
import { useAIChat, useAnalyticsReport, type ReportTopic } from '../../hooks/useAIChat'
import { useCompany } from '../../hooks/useCompany'
import {
  ChatBubbleLeftRightIcon,
  DocumentChartBarIcon,
  PaperAirplaneIcon,
  ArrowPathIcon,
  XMarkIcon,
  ChevronDownIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline'

const REPORT_TOPICS: { key: ReportTopic; label: string; icon: string; description: string }[] = [
  { key: 'certificates', label: 'Certificados', icon: '📄', description: 'Compliance, vencimentos e riscos' },
  { key: 'assets', label: 'Ativos', icon: '🏭', description: 'Inventário, valor e utilização' },
  { key: 'temperature', label: 'Temperatura', icon: '🌡️', description: 'Exposição térmica e NR-15' },
  { key: 'boundary', label: 'Movimentação', icon: '📍', description: 'Fluxo de pessoas por zona' },
  { key: 'alerts', label: 'Alertas', icon: '🚨', description: 'Alarmes e status operacional' },
]

const SUGGESTIONS = [
  'Quantos certificados estão vencidos?',
  'Tem algum alarme ativo agora?',
  'Quais ativos estão parados?',
  'Como está a temperatura dos trabalhadores?',
  'Qual área tem mais movimentação hoje?',
]

function BlinkingCursor() {
  return (
    <span
      className="inline-block w-0.5 h-3 bg-primary-500 ml-0.5 align-middle"
      style={{ animation: 'blink 0.8s step-end infinite' }}
    />
  )
}

function formatMessage(text: string, isStreaming = false) {
  const lines = text.split('\n')
  return lines.map((line, i) => {
    const isLast = i === lines.length - 1

    if (line.startsWith('## ')) return (
      <h3 key={i} className="text-sm font-bold text-primary-700 dark:text-primary-300 mt-3 mb-1">
        {line.replace('## ', '')}{isLast && isStreaming && <BlinkingCursor />}
      </h3>
    )
    if (line.startsWith('### ')) return (
      <h4 key={i} className="text-xs font-semibold text-gray-700 dark:text-gray-300 mt-2 mb-1">
        {line.replace('### ', '')}{isLast && isStreaming && <BlinkingCursor />}
      </h4>
    )
    if (line.startsWith('**') && line.endsWith('**')) return (
      <p key={i} className="text-xs font-semibold text-gray-800 dark:text-gray-200">
        {line.replace(/\*\*/g, '')}{isLast && isStreaming && <BlinkingCursor />}
      </p>
    )
    if (line.match(/^\d+\.\s/)) return (
      <p key={i} className="text-xs text-gray-700 dark:text-gray-300 ml-2">
        • {line.replace(/^\d+\.\s/, '')}{isLast && isStreaming && <BlinkingCursor />}
      </p>
    )
    if (line.startsWith('- ') || line.startsWith('• ')) return (
      <p key={i} className="text-xs text-gray-700 dark:text-gray-300 ml-2">
        • {line.replace(/^[-•]\s/, '')}{isLast && isStreaming && <BlinkingCursor />}
      </p>
    )
    if (line.trim() === '') return <br key={i} />
    return (
      <p key={i} className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed">
        {line}{isLast && isStreaming && <BlinkingCursor />}
      </p>
    )
  })
}

export default function SmartXAI() {
  const { companyId } = useCompany()
  const [activeTab, setActiveTab] = useState<'chat' | 'report'>('chat')
  const [input, setInput] = useState('')
  const [selectedTopic, setSelectedTopic] = useState<ReportTopic>('certificates')
  const [extraContext, setExtraContext] = useState('')
  const [showExtraContext, setShowExtraContext] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  const id = companyId || 1

  const { messages, loading: chatLoading, error: chatError, contextUsed, sendMessage, clearMessages } = useAIChat(id)
  const { report, loading: reportLoading, error: reportError, currentTopic, generateReport, clearReport, topicLabels, topicIcons } = useAnalyticsReport(id)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, chatLoading])

  const handleSend = async () => {
    if (!input.trim()) return
    const text = input
    setInput('')
    await sendMessage(text)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleSuggestion = (text: string) => {
    setInput(text)
    inputRef.current?.focus()
  }

  const lastMsg = messages[messages.length - 1]
  const isLastMsgStreaming = chatLoading && lastMsg?.role === 'assistant'

  return (
    <>
      <style>{`
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>

      <div className="flex flex-col h-full bg-white dark:bg-gray-900 rounded-2xl shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700">

        {/* Header */}
        <div className="flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-primary-600 to-primary-700 text-white">
          <div className="flex items-center justify-center w-9 h-9 rounded-full bg-white overflow-hidden">
            <img src="/logoSmartxAI.png" alt="SmartX AI" className="w-7 h-7 object-contain" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold leading-tight">ASK AI</p>
            <p className="text-xs text-primary-200 leading-tight">Assistente Inteligente</p>
          </div>
          <div className="flex items-center gap-1 px-2 py-1 bg-white/10 rounded-full">
            <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            <span className="text-xs text-white/80">Online</span>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
          <button
            onClick={() => setActiveTab('chat')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-xs font-medium transition-all ${
              activeTab === 'chat'
                ? 'text-primary-600 border-b-2 border-primary-600 bg-white dark:bg-gray-900'
                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'
            }`}
          >
            <ChatBubbleLeftRightIcon className="w-4 h-4" />
            Chat Inteligente
          </button>
          <button
            onClick={() => setActiveTab('report')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-xs font-medium transition-all ${
              activeTab === 'report'
                ? 'text-primary-600 border-b-2 border-primary-600 bg-white dark:bg-gray-900'
                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'
            }`}
          >
            <DocumentChartBarIcon className="w-4 h-4" />
            Relatórios
          </button>
        </div>

        {/* ──────────── CHAT TAB ──────────── */}
        {activeTab === 'chat' && (
          <>
            <div className="flex-1 overflow-y-auto p-3 space-y-3 min-h-0">

              {messages.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full gap-4 py-6">
                  <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-primary-50 dark:bg-primary-900/30 overflow-hidden">
                    <img src="/logoSmartxAI.png" alt="SmartX AI" className="w-10 h-10 object-contain" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Como posso ajudar?</p>
                    <p className="text-xs text-gray-400 mt-1">Faça perguntas sobre seus dados em tempo real</p>
                  </div>
                  <div className="flex flex-col gap-1.5 w-full">
                    {SUGGESTIONS.map((s, i) => (
                      <button
                        key={i}
                        onClick={() => handleSuggestion(s)}
                        className="text-left text-xs px-3 py-2 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 hover:text-primary-600 dark:hover:text-primary-400 transition-all border border-transparent hover:border-primary-200 dark:hover:border-primary-800"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {messages.map((msg, i) => {
                const isThisStreaming = isLastMsgStreaming && i === messages.length - 1
                return (
                  <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    {msg.role === 'assistant' && (
                      <div className="flex items-center justify-center w-6 h-6 rounded-lg bg-primary-100 dark:bg-primary-900/40 mr-2 mt-0.5 flex-shrink-0 overflow-hidden">
                        <img src="/logoSmartxAI.png" alt="AI" className="w-5 h-5 object-contain" />
                      </div>
                    )}
                    <div className={`max-w-[82%] rounded-2xl px-3 py-2 ${
                      msg.role === 'user'
                        ? 'bg-primary-600 text-white rounded-tr-sm'
                        : 'bg-gray-100 dark:bg-gray-800 rounded-tl-sm'
                    }`}>
                      {msg.role === 'user'
                        ? <p className="text-xs leading-relaxed">{msg.content}</p>
                        : (
                          <div className="space-y-0.5">
                            {msg.content === '' && isThisStreaming
                              ? <p className="text-xs text-gray-400"><BlinkingCursor /></p>
                              : formatMessage(msg.content, isThisStreaming)
                            }
                          </div>
                        )
                      }
                    </div>
                  </div>
                )
              })}

              {/* Loading dots — antes do primeiro chunk */}
              {chatLoading && !isLastMsgStreaming && (
                <div className="flex justify-start">
                  <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary-100 dark:bg-primary-900/40 mr-2 flex-shrink-0 overflow-hidden">
                    <img src="/logoSmartxAI.png" alt="AI" className="w-5 h-5 object-contain" />
                  </div>
                  <div className="bg-gray-100 dark:bg-gray-800 rounded-2xl rounded-tl-sm px-3 py-2">
                    <div className="flex gap-1 items-center h-4">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-1.5 h-1.5 rounded-full bg-primary-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-1.5 h-1.5 rounded-full bg-primary-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              )}

              {chatError && (
                <div className="text-center">
                  <p className="text-xs text-red-500 bg-red-50 dark:bg-red-900/20 rounded-xl px-3 py-2">{chatError}</p>
                </div>
              )}

              {contextUsed.length > 0 && !chatLoading && (
                <div className="flex flex-wrap gap-1 justify-center">
                  {contextUsed.map(ctx => (
                    <span key={ctx} className="text-xs px-2 py-0.5 rounded-full bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 border border-primary-200 dark:border-primary-800">
                      🔍 {ctx}
                    </span>
                  ))}
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-3 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
              {messages.length > 0 && (
                <button
                  onClick={clearMessages}
                  className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 mb-2 transition-colors"
                >
                  <XMarkIcon className="w-3 h-3" />
                  Limpar conversa
                </button>
              )}
              <div className="flex gap-2">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Pergunte sobre seus dados..."
                  rows={1}
                  className="flex-1 resize-none text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-200 px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent placeholder-gray-400 dark:placeholder-gray-500"
                  style={{ maxHeight: '80px' }}
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim() || chatLoading}
                  className="flex items-center justify-center w-9 h-9 rounded-xl bg-primary-600 hover:bg-primary-700 disabled:opacity-40 disabled:cursor-not-allowed text-white transition-all"
                >
                  {chatLoading
                    ? <ArrowPathIcon className="w-4 h-4 animate-spin" />
                    : <PaperAirplaneIcon className="w-4 h-4" />
                  }
                </button>
              </div>
            </div>
          </>
        )}

        {/* ──────────── REPORT TAB ──────────── */}
        {activeTab === 'report' && (
          <div className="flex-1 flex flex-col overflow-hidden min-h-0">
            <div className="p-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">Escolha o domínio:</p>
              <div className="grid grid-cols-5 gap-1.5">
                {REPORT_TOPICS.map(topic => (
                  <button
                    key={topic.key}
                    onClick={() => { setSelectedTopic(topic.key); clearReport() }}
                    title={topic.description}
                    className={`flex flex-col items-center gap-0.5 py-2 px-1 rounded-xl text-xs font-medium transition-all ${
                      selectedTopic === topic.key
                        ? 'bg-primary-600 text-white shadow-sm'
                        : 'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 border border-gray-200 dark:border-gray-600'
                    }`}
                  >
                    <span className="text-base">{topic.icon}</span>
                    <span className="text-[10px] leading-tight text-center">{topic.label}</span>
                  </button>
                ))}
              </div>

              <button
                onClick={() => setShowExtraContext(v => !v)}
                className="flex items-center gap-1 text-xs text-gray-400 hover:text-primary-600 mt-2 transition-colors"
              >
                <ChevronDownIcon className={`w-3 h-3 transition-transform ${showExtraContext ? 'rotate-180' : ''}`} />
                Adicionar foco específico
              </button>

              {showExtraContext && (
                <textarea
                  value={extraContext}
                  onChange={e => setExtraContext(e.target.value)}
                  placeholder="Ex: Quero focar nos departamentos com mais risco financeiro..."
                  rows={2}
                  className="mt-1.5 w-full resize-none text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 placeholder-gray-400 dark:placeholder-gray-500"
                />
              )}

              <button
                onClick={() => generateReport(selectedTopic, extraContext || undefined)}
                disabled={reportLoading}
                className="mt-2 w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-primary-600 hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-medium transition-all"
              >
                {reportLoading ? (
                  <>
                    <ArrowPathIcon className="w-3.5 h-3.5 animate-spin" />
                    Gerando relatório...
                  </>
                ) : (
                  <>
                    <SparklesIcon className="w-3.5 h-3.5" />
                    Gerar Relatório com IA
                  </>
                )}
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-3 min-h-0">
              {!report && !reportLoading && !reportError && (
                <div className="flex flex-col items-center justify-center h-full gap-3 text-center">
                  <DocumentChartBarIcon className="w-10 h-10 text-gray-300 dark:text-gray-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      {topicIcons[selectedTopic]} {topicLabels[selectedTopic]}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      Clique em "Gerar Relatório" para analisar os dados em tempo real
                    </p>
                  </div>
                </div>
              )}

              {reportLoading && (
                <div className="flex flex-col items-center justify-center h-full gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                    <ArrowPathIcon className="w-5 h-5 text-primary-600 dark:text-primary-400 animate-spin" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Buscando dados do banco...</p>
                    <p className="text-xs text-gray-400 mt-1">A IA está analisando os dados da empresa</p>
                  </div>
                </div>
              )}

              {reportError && (
                <div className="flex items-center justify-center h-full">
                  <p className="text-xs text-red-500 bg-red-50 dark:bg-red-900/20 rounded-xl px-4 py-3 text-center">{reportError}</p>
                </div>
              )}

              {report && !reportLoading && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-base">{topicIcons[currentTopic!]}</span>
                    <p className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                      Relatório — {topicLabels[currentTopic!]}
                    </p>
                    <button onClick={clearReport} className="ml-auto text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                      <XMarkIcon className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-3 space-y-0.5">
                    {formatMessage(report)}
                  </div>
                  <button
                    onClick={() => generateReport(selectedTopic, extraContext || undefined)}
                    className="mt-2 w-full flex items-center justify-center gap-1.5 py-1.5 rounded-xl border border-primary-200 dark:border-primary-800 text-primary-600 dark:text-primary-400 text-xs hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-all"
                  >
                    <ArrowPathIcon className="w-3 h-3" />
                    Regenerar
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  )
}