// // // // src/components/AI/AIFloatingButton.tsx
// // // // Botão flutuante global que abre um chat de IA contextualizado com a página atual.
// // // // Adicione <AIFloatingButton /> no Layout.tsx para aparecer em todas as páginas.

// // // import { useState, useRef, useEffect, useCallback } from 'react'
// // // import { useLocation } from 'react-router-dom'
// // // import { useCompany } from '../../hooks/useCompany'
// // // import { getPageContext } from '../../config/aiPageContext'
// // // import {
// // //   XMarkIcon,
// // //   PaperAirplaneIcon,
// // //   ArrowPathIcon,
// // //   TrashIcon,
// // //   ChevronDownIcon,
// // // } from '@heroicons/react/24/outline'

// // // const API_BASE_URL = 'https://apinode.smartxhub.cloud/api'
// // // const TYPEWRITER_SPEED_MS = 16

// // // interface ChatMessage {
// // //   role: 'user' | 'assistant'
// // //   content: string
// // // }

// // // function Cursor() {
// // //   return (
// // //     <span
// // //       className="inline-block w-[2px] h-[12px] ml-[2px] align-middle rounded-sm"
// // //       style={{ background: '#63b973', animation: 'aifb-blink 0.9s step-end infinite' }}
// // //     />
// // //   )
// // // }

// // // function Markdown({ text, streaming = false }: { text: string; streaming?: boolean }) {
// // //   const lines = text.split('\n')
// // //   return (
// // //     <>
// // //       {lines.map((line, i) => {
// // //         const isLast = i === lines.length - 1
// // //         const cursor = isLast && streaming ? <Cursor /> : null
// // //         if (line.startsWith('## ')) return (
// // //           <p key={i} style={{ fontSize: 10, fontWeight: 700, color: '#63b973', margin: '8px 0 3px', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
// // //             {line.slice(3)}{cursor}
// // //           </p>
// // //         )
// // //         if (line.startsWith('### ')) return (
// // //           <p key={i} style={{ fontSize: 10, fontWeight: 600, color: '#e8f4e8', margin: '4px 0 2px' }}>
// // //             {line.slice(4)}{cursor}
// // //           </p>
// // //         )
// // //         if (line.match(/^\*\*(.+)\*\*$/)) return (
// // //           <p key={i} style={{ fontSize: 10, fontWeight: 600, color: '#e8f4e8' }}>
// // //             {line.replace(/\*\*/g, '')}{cursor}
// // //           </p>
// // //         )
// // //         if (line.match(/^(\d+\.|-|•)\s/)) return (
// // //           <p key={i} style={{ fontSize: 10, color: '#c8d8c8', lineHeight: 1.6, display: 'flex', gap: 5 }}>
// // //             <span style={{ color: '#63b973', flexShrink: 0 }}>›</span>
// // //             {line.replace(/^(\d+\.|-|•)\s/, '')}{cursor}
// // //           </p>
// // //         )
// // //         if (line.trim() === '') return <div key={i} style={{ height: 5 }} />
// // //         return <p key={i} style={{ fontSize: 10, color: '#c8d8c8', lineHeight: 1.7 }}>{line}{cursor}</p>
// // //       })}
// // //     </>
// // //   )
// // // }

// // // export default function AIFloatingButton() {
// // //   const location = useLocation()
// // //   const { companyId } = useCompany()
// // //   const [open, setOpen] = useState(false)
// // //   const [input, setInput] = useState('')
// // //   const [showContext, setShowContext] = useState(false)
// // //   const [messages, setMessages] = useState<ChatMessage[]>([])
// // //   const [loading, setLoading] = useState(false)
// // //   const [error, setError] = useState<string | null>(null)
// // //   const [contextUsed, setContextUsed] = useState<string[]>([])
// // //   const messagesEndRef = useRef<HTMLDivElement>(null)
// // //   const inputRef = useRef<HTMLTextAreaElement>(null)

// // //   // Typewriter refs
// // //   const bufferRef = useRef('')
// // //   const displayedRef = useRef('')
// // //   const typewriterRef = useRef<ReturnType<typeof setInterval> | null>(null)
// // //   const streamingRef = useRef(false)

// // //   const id = companyId || 1
// // //   const ctx = getPageContext(location.pathname)

// // //   const lastMsg = messages[messages.length - 1]
// // //   const isStreaming = loading && lastMsg?.role === 'assistant'
// // //   const assistantCount = messages.filter(m => m.role === 'assistant').length

// // //   useEffect(() => {
// // //     messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
// // //   }, [messages])

// // //   useEffect(() => {
// // //     if (open) setTimeout(() => inputRef.current?.focus(), 100)
// // //   }, [open])

// // //   // Limpa histórico ao trocar de página
// // //   useEffect(() => {
// // //     clearMessages()
// // //     setShowContext(false)
// // //   }, [location.pathname])

// // //   // ── Typewriter ─────────────────────────────────────────────────────
// // //   const startTypewriter = useCallback(() => {
// // //     if (typewriterRef.current) return
// // //     typewriterRef.current = setInterval(() => {
// // //       const buf = bufferRef.current
// // //       const disp = displayedRef.current
// // //       if (disp.length < buf.length) {
// // //         const next = buf.slice(0, disp.length + 1)
// // //         displayedRef.current = next
// // //         setMessages(prev => {
// // //           const updated = [...prev]
// // //           updated[updated.length - 1] = { role: 'assistant', content: next }
// // //           return updated
// // //         })
// // //       } else if (!streamingRef.current) {
// // //         clearInterval(typewriterRef.current!)
// // //         typewriterRef.current = null
// // //       }
// // //     }, TYPEWRITER_SPEED_MS)
// // //   }, [])

// // //   // ── Envia mensagem via context-chat-stream ─────────────────────────
// // //   const sendMessage = useCallback(async (content: string) => {
// // //     if (!content.trim() || loading) return

// // //     const userMsg: ChatMessage = { role: 'user', content }
// // //     const updatedMessages = [...messages, userMsg]
// // //     setMessages(updatedMessages)
// // //     setLoading(true)
// // //     setError(null)

// // //     bufferRef.current = ''
// // //     displayedRef.current = ''
// // //     streamingRef.current = true
// // //     if (typewriterRef.current) { clearInterval(typewriterRef.current); typewriterRef.current = null }

// // //     setMessages(prev => [...prev, { role: 'assistant', content: '' }])

// // //     try {
// // //       const response = await fetch(`${API_BASE_URL}/dashboard/ai/context-chat-stream`, {
// // //         method: 'POST',
// // //         headers: { 'Content-Type': 'application/json' },
// // //         body: JSON.stringify({
// // //           companyId: id,
// // //           messages: updatedMessages,
// // //           // Monta pageContext a partir do aiPageContext.ts
// // //           pageContext: {
// // //             route: location.pathname,
// // //             pageName: ctx.title,
// // //             domain: ctx.domain,
// // //             description: ctx.description,
// // //             // Converte metrics + commonQuestions em systemKnowledge
// // //             dataTopics: getDataTopicsFromDomain(ctx.domain),
// // //             systemKnowledge: buildSystemKnowledge(ctx),
// // //           },
// // //         }),
// // //       })

// // //       if (!response.ok) throw new Error(`HTTP ${response.status}`)
// // //       if (!response.body) throw new Error('Stream não disponível')

// // //       const reader = response.body.getReader()
// // //       const decoder = new TextDecoder()
// // //       startTypewriter()

// // //       while (true) {
// // //         const { done, value } = await reader.read()
// // //         if (done) break
// // //         const text = decoder.decode(value, { stream: true })
// // //         for (const line of text.split('\n').filter(l => l.startsWith('data: '))) {
// // //           try {
// // //             const data = JSON.parse(line.replace('data: ', ''))
// // //             if (data.chunk) bufferRef.current += data.chunk
// // //             if (data.done) setContextUsed(data.contextUsed || [])
// // //             if (data.error) setError('Erro ao processar resposta da IA.')
// // //           } catch { }
// // //         }
// // //       }
// // //     } catch (err: any) {
// // //       setMessages(prev => prev.slice(0, -1))
// // //       setError('Erro ao conectar com a IA.')
// // //       console.error('[AIFloating] Erro:', err)
// // //     } finally {
// // //       streamingRef.current = false
// // //       setLoading(false)
// // //     }
// // //   }, [messages, loading, id, location.pathname, ctx, startTypewriter])

// // //   const clearMessages = useCallback(() => {
// // //     if (typewriterRef.current) { clearInterval(typewriterRef.current); typewriterRef.current = null }
// // //     bufferRef.current = ''; displayedRef.current = ''; streamingRef.current = false
// // //     setMessages([]); setContextUsed([]); setError(null)
// // //   }, [])

// // //   const handleSend = useCallback(async () => {
// // //     if (!input.trim() || loading) return
// // //     const text = input
// // //     setInput('')
// // //     await sendMessage(text)
// // //   }, [input, loading, sendMessage])

// // //   const handleSuggestion = useCallback(async (text: string) => {
// // //     await sendMessage(text)
// // //   }, [sendMessage])

// // //   const handleKeyDown = (e: React.KeyboardEvent) => {
// // //     if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() }
// // //   }

// // //   return (
// // //     <>
// // //       <style>{`
// // //         @keyframes aifb-blink { 0%,100%{opacity:1} 50%{opacity:0} }
// // //         @keyframes aifb-fade { from{opacity:0;transform:translateY(5px)} to{opacity:1;transform:translateY(0)} }
// // //         @keyframes aifb-slide { from{opacity:0;transform:translateY(16px) scale(0.97)} to{opacity:1;transform:translateY(0) scale(1)} }
// // //         @keyframes aifb-pulse { 0%{box-shadow:0 0 0 0 rgba(99,185,115,0.45)} 70%{box-shadow:0 0 0 10px rgba(99,185,115,0)} 100%{box-shadow:0 0 0 0 rgba(99,185,115,0)} }
// // //         @keyframes spin { to{transform:rotate(360deg)} }
// // //         .aifb-msg { animation: aifb-fade 0.2s ease forwards; }
// // //         .aifb-drawer { animation: aifb-slide 0.25s cubic-bezier(0.34,1.4,0.64,1) forwards; }
// // //       `}</style>

// // //       {/* Botão flutuante */}
// // //       <button onClick={() => setOpen(v => !v)} title="Perguntar à IA sobre esta tela"
// // //         style={{
// // //           position: 'fixed', bottom: 24, right: 24,
// // //           width: 52, height: 52, borderRadius: '50%',
// // //           background: open ? '#111620' : 'linear-gradient(135deg, #1a2a1a, #0f1f0f)',
// // //           border: `1.5px solid ${open ? 'rgba(99,185,115,0.6)' : 'rgba(99,185,115,0.4)'}`,
// // //           cursor: 'pointer', zIndex: 9998,
// // //           display: 'flex', alignItems: 'center', justifyContent: 'center',
// // //           transition: 'all 0.2s',
// // //           animation: !open ? 'aifb-pulse 3s infinite' : 'none',
// // //           boxShadow: '0 4px 24px rgba(0,0,0,0.5)',
// // //         }}>
// // //         {open
// // //           ? <XMarkIcon style={{ width: 20, height: 20, color: '#63b973' }} />
// // //           : <img src="/logoSmartxAI.png" alt="AI" style={{ width: 30, height: 30, objectFit: 'contain' }} />
// // //         }
// // //         {!open && assistantCount > 0 && (
// // //           <div style={{
// // //             position: 'absolute', top: 1, right: 1,
// // //             width: 14, height: 14, borderRadius: '50%',
// // //             background: '#63b973', border: '2px solid #0a0d12',
// // //             fontSize: 8, color: '#0a0d12', fontWeight: 700,
// // //             display: 'flex', alignItems: 'center', justifyContent: 'center',
// // //           }}>
// // //             {assistantCount}
// // //           </div>
// // //         )}
// // //       </button>

// // //       {/* Drawer */}
// // //       {open && (
// // //         <div className="aifb-drawer" style={{
// // //           position: 'fixed', bottom: 88, right: 24,
// // //           width: 360, height: 520,
// // //           background: '#0a0d12',
// // //           border: '1px solid rgba(99,185,115,0.18)',
// // //           borderRadius: 12, zIndex: 9997,
// // //           display: 'flex', flexDirection: 'column', overflow: 'hidden',
// // //           boxShadow: '0 24px 64px rgba(0,0,0,0.65)',
// // //           fontFamily: "'JetBrains Mono','Fira Code',monospace",
// // //         }}>

// // //           {/* Cantos decorativos */}
// // //           {[
// // //             { top: 0, left: 0, borderWidth: '1px 0 0 1px' },
// // //             { top: 0, right: 0, borderWidth: '1px 1px 0 0' },
// // //             { bottom: 0, left: 0, borderWidth: '0 0 1px 1px' },
// // //             { bottom: 0, right: 0, borderWidth: '0 1px 1px 0' },
// // //           ].map((s, i) => (
// // //             <div key={i} style={{ position: 'absolute', width: 8, height: 8, borderStyle: 'solid', borderColor: '#63b973', opacity: 0.45, ...s }} />
// // //           ))}

// // //           {/* Header */}
// // //           <div style={{ padding: '10px 14px', borderBottom: '1px solid rgba(99,185,115,0.12)', background: '#111620', flexShrink: 0 }}>
// // //             <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
// // //               <img src="/logoSmartxAI.png" alt="AI" style={{ width: 22, height: 22, objectFit: 'contain' }} />
// // //               <div style={{ flex: 1 }}>
// // //                 <p style={{ fontSize: 10, fontWeight: 700, color: '#63b973', letterSpacing: '0.1em', textTransform: 'uppercase' }}>SmartX AI</p>
// // //                 <p style={{ fontSize: 8.5, color: '#3a4a3a', letterSpacing: '0.04em', marginTop: 1 }}>{ctx.title}</p>
// // //               </div>
// // //               <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
// // //                 <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#63b973', animation: 'aifb-pulse 2s infinite' }} />
// // //                 <span style={{ fontSize: 8, color: '#63b973', letterSpacing: '0.06em' }}>ONLINE</span>
// // //               </div>
// // //             </div>

// // //             {/* Toggle de contexto */}
// // //             <button onClick={() => setShowContext(v => !v)}
// // //               style={{ marginTop: 7, display: 'flex', alignItems: 'center', gap: 4, background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', padding: 0 }}>
// // //               <ChevronDownIcon style={{ width: 9, height: 9, color: '#3a4a3a', transition: 'transform 0.2s', transform: showContext ? 'rotate(180deg)' : 'none' }} />
// // //               <span style={{ fontSize: 8.5, color: '#3a4a3a', letterSpacing: '0.06em', textTransform: 'uppercase' }}>Contexto da tela</span>
// // //             </button>

// // //             {showContext && (
// // //               <div style={{ marginTop: 6, padding: '7px 10px', background: 'rgba(99,185,115,0.04)', border: '1px solid rgba(99,185,115,0.1)', borderRadius: 4 }}>
// // //                 <p style={{ fontSize: 9, color: '#c8d8c8', lineHeight: 1.6 }}>{ctx.description}</p>
// // //                 {ctx.metrics.length > 0 && (
// // //                   <div style={{ marginTop: 5, display: 'flex', flexWrap: 'wrap', gap: 3 }}>
// // //                     {ctx.metrics.map(m => (
// // //                       <span key={m} style={{ fontSize: 8, color: '#63b973', background: 'rgba(99,185,115,0.07)', border: '1px solid rgba(99,185,115,0.18)', borderRadius: 3, padding: '1px 5px' }}>
// // //                         {m}
// // //                       </span>
// // //                     ))}
// // //                   </div>
// // //                 )}
// // //                 {ctx.howToRead && (
// // //                   <p style={{ fontSize: 8.5, color: '#556655', lineHeight: 1.5, marginTop: 5, fontStyle: 'italic' }}>
// // //                     💡 {ctx.howToRead}
// // //                   </p>
// // //                 )}
// // //               </div>
// // //             )}
// // //           </div>

// // //           {/* Messages */}
// // //           <div style={{ flex: 1, overflowY: 'auto', padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: 8, scrollbarWidth: 'thin', scrollbarColor: 'rgba(99,185,115,0.1) transparent' }}>

// // //             {/* Empty state */}
// // //             {messages.length === 0 && (
// // //               <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
// // //                 <p style={{ fontSize: 8.5, color: '#3a4a3a', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 2 }}>
// // //                   › Perguntas sobre esta tela
// // //                 </p>
// // //                 {ctx.suggestions.map((s, i) => (
// // //                   <button key={i} onClick={() => handleSuggestion(s)} disabled={loading}
// // //                     style={{ textAlign: 'left', fontSize: 9.5, color: '#556655', padding: '6px 10px', background: 'transparent', border: '1px solid rgba(99,185,115,0.1)', borderRadius: 4, cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s' }}
// // //                     onMouseEnter={e => { const el = e.currentTarget; el.style.color = '#63b973'; el.style.borderColor = 'rgba(99,185,115,0.35)'; el.style.background = 'rgba(99,185,115,0.04)' }}
// // //                     onMouseLeave={e => { const el = e.currentTarget; el.style.color = '#556655'; el.style.borderColor = 'rgba(99,185,115,0.1)'; el.style.background = 'transparent' }}
// // //                   >
// // //                     {s}
// // //                   </button>
// // //                 ))}
// // //                 {ctx.commonQuestions.length > 0 && (
// // //                   <>
// // //                     <p style={{ fontSize: 8.5, color: '#3a4a3a', letterSpacing: '0.08em', textTransform: 'uppercase', marginTop: 4, marginBottom: 2 }}>
// // //                       › Dúvidas frequentes
// // //                     </p>
// // //                     {ctx.commonQuestions.map((q, i) => (
// // //                       <button key={i} onClick={() => handleSuggestion(q)} disabled={loading}
// // //                         style={{ textAlign: 'left', fontSize: 9.5, color: '#556655', padding: '6px 10px', background: 'transparent', border: '1px solid rgba(99,185,115,0.1)', borderRadius: 4, cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s' }}
// // //                         onMouseEnter={e => { const el = e.currentTarget; el.style.color = '#63b973'; el.style.borderColor = 'rgba(99,185,115,0.35)'; el.style.background = 'rgba(99,185,115,0.04)' }}
// // //                         onMouseLeave={e => { const el = e.currentTarget; el.style.color = '#556655'; el.style.borderColor = 'rgba(99,185,115,0.1)'; el.style.background = 'transparent' }}
// // //                       >
// // //                         {q}
// // //                       </button>
// // //                     ))}
// // //                   </>
// // //                 )}
// // //               </div>
// // //             )}

// // //             {/* Mensagens */}
// // //             {messages.map((msg, i) => {
// // //               const isThisStreaming = isStreaming && i === messages.length - 1
// // //               return (
// // //                 <div key={i} className="aifb-msg" style={{ display: 'flex', gap: 6, justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
// // //                   {msg.role === 'assistant' && (
// // //                     <img src="/logoSmartxAI.png" alt="AI" style={{ width: 16, height: 16, objectFit: 'contain', flexShrink: 0, marginTop: 2 }} />
// // //                   )}
// // //                   <div style={{
// // //                     maxWidth: '86%', padding: '7px 10px', borderRadius: 4,
// // //                     ...(msg.role === 'user'
// // //                       ? { background: 'rgba(99,185,115,0.09)', border: '1px solid rgba(99,185,115,0.22)', borderTopRightRadius: 1 }
// // //                       : { background: '#111620', border: '1px solid rgba(99,185,115,0.1)', borderTopLeftRadius: 1 }
// // //                     )
// // //                   }}>
// // //                     {msg.role === 'user'
// // //                       ? <p style={{ fontSize: 10, color: '#e8f4e8', lineHeight: 1.6 }}>{msg.content}</p>
// // //                       : msg.content === '' && isThisStreaming
// // //                         ? <p style={{ fontSize: 10, color: '#3a4a3a' }}><Cursor /></p>
// // //                         : <Markdown text={msg.content} streaming={isThisStreaming} />
// // //                     }
// // //                   </div>
// // //                 </div>
// // //               )
// // //             })}

// // //             {/* Loading dots */}
// // //             {loading && !isStreaming && (
// // //               <div className="aifb-msg" style={{ display: 'flex', gap: 6 }}>
// // //                 <img src="/logoSmartxAI.png" alt="AI" style={{ width: 16, height: 16, objectFit: 'contain', flexShrink: 0, marginTop: 2 }} />
// // //                 <div style={{ padding: '8px 12px', background: '#111620', border: '1px solid rgba(99,185,115,0.1)', borderRadius: 4, borderTopLeftRadius: 1 }}>
// // //                   <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
// // //                     {[0, 150, 300].map(d => (
// // //                       <div key={d} style={{ width: 4, height: 4, borderRadius: '50%', background: '#63b973', animation: `aifb-blink 1s ${d}ms step-end infinite` }} />
// // //                     ))}
// // //                   </div>
// // //                 </div>
// // //               </div>
// // //             )}

// // //             {error && (
// // //               <p style={{ fontSize: 9.5, color: '#f87171', background: 'rgba(248,113,113,0.07)', border: '1px solid rgba(248,113,113,0.18)', borderRadius: 4, padding: '6px 10px' }}>
// // //                 ✕ {error}
// // //               </p>
// // //             )}

// // //             {contextUsed.length > 0 && !loading && (
// // //               <div style={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
// // //                 {contextUsed.map(c => (
// // //                   <span key={c} style={{ fontSize: 8, color: '#63b973', background: 'rgba(99,185,115,0.06)', border: '1px solid rgba(99,185,115,0.18)', borderRadius: 3, padding: '1px 6px', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
// // //                     ◈ {c}
// // //                   </span>
// // //                 ))}
// // //               </div>
// // //             )}

// // //             <div ref={messagesEndRef} />
// // //           </div>

// // //           {/* Input */}
// // //           <div style={{ padding: '8px 12px', borderTop: '1px solid rgba(99,185,115,0.1)', background: '#111620', flexShrink: 0 }}>
// // //             {messages.length > 0 && (
// // //               <button onClick={clearMessages}
// // //                 style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 6, background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', color: '#3a4a3a', fontSize: 8.5, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
// // //                 <TrashIcon style={{ width: 9, height: 9 }} />
// // //                 Limpar sessão
// // //               </button>
// // //             )}
// // //             <div
// // //               style={{ display: 'flex', gap: 6, alignItems: 'flex-end', border: '1px solid rgba(99,185,115,0.18)', borderRadius: 4, padding: '7px 10px', background: '#0a0d12', transition: 'border-color 0.2s' }}
// // //               onFocus={e => (e.currentTarget.style.borderColor = 'rgba(99,185,115,0.45)')}
// // //               onBlur={e => (e.currentTarget.style.borderColor = 'rgba(99,185,115,0.18)')}
// // //             >
// // //               <span style={{ fontSize: 10, color: '#63b973', marginBottom: 1, flexShrink: 0 }}>›</span>
// // //               <textarea
// // //                 ref={inputRef}
// // //                 value={input}
// // //                 onChange={e => setInput(e.target.value)}
// // //                 onKeyDown={handleKeyDown}
// // //                 placeholder={`Pergunte sobre ${ctx.title.toLowerCase()}...`}
// // //                 rows={1}
// // //                 style={{ flex: 1, resize: 'none', background: 'transparent', border: 'none', outline: 'none', color: '#e8f4e8', fontFamily: 'inherit', fontSize: 10, lineHeight: 1.6, maxHeight: 60 }}
// // //               />
// // //               <button onClick={handleSend} disabled={!input.trim() || loading}
// // //                 style={{ width: 28, height: 28, borderRadius: 3, background: '#63b973', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, opacity: (!input.trim() || loading) ? 0.3 : 1, transition: 'opacity 0.15s' }}>
// // //                 {loading
// // //                   ? <ArrowPathIcon style={{ width: 12, height: 12, color: '#0a0d12', animation: 'spin 1s linear infinite' }} />
// // //                   : <PaperAirplaneIcon style={{ width: 12, height: 12, color: '#0a0d12' }} />
// // //                 }
// // //               </button>
// // //             </div>
// // //             <p style={{ fontSize: 8, color: '#2a3a2a', marginTop: 4, letterSpacing: '0.03em' }}>
// // //               Enter · contexto: {ctx.title}
// // //             </p>
// // //           </div>
// // //         </div>
// // //       )}
// // //     </>
// // //   )
// // // }

// // // // ─────────────────────────────────────────────
// // // // Helpers — converte PageContext do aiPageContext.ts
// // // // para o formato esperado pelo context-chat-stream
// // // // ─────────────────────────────────────────────

// // // function getDataTopicsFromDomain(domain: string): string[] {
// // //   const map: Record<string, string[]> = {
// // //     certificates: ['certificates'],
// // //     assets:       ['assets'],
// // //     temperature:  ['temperature'],
// // //     boundary:     ['boundary'],
// // //     alerts:       ['alerts'],
// // //     people:       ['boundary', 'alerts'],
// // //     gps:          ['boundary'],
// // //     risk:         ['alerts', 'temperature'],
// // //     logistics:    ['assets'],
// // //     geral:        ['certificates', 'assets', 'alerts'],
// // //     ai:           ['certificates', 'assets', 'temperature', 'boundary', 'alerts'],
// // //   }
// // //   return map[domain] || ['certificates', 'assets', 'alerts']
// // // }

// // // function buildSystemKnowledge(ctx: ReturnType<typeof getPageContext>): string {
// // //   const parts: string[] = [ctx.description]

// // //   if (ctx.metrics.length > 0) {
// // //     parts.push(`\nMétricas exibidas nesta tela: ${ctx.metrics.join(', ')}.`)
// // //   }
// // //   if (ctx.howToRead) {
// // //     parts.push(`\nComo interpretar: ${ctx.howToRead}`)
// // //   }
// // //   if (ctx.commonQuestions.length > 0) {
// // //     parts.push(`\nDúvidas frequentes dos usuários: ${ctx.commonQuestions.join(' | ')}`)
// // //   }

// // //   return parts.join('\n')
// // // }


// // // src/components/AI/AIFloatingButton.tsx
// // // Botão flutuante global com cores dinâmicas do tema da empresa.
// // // Adicione <AIFloatingButton /> no Layout.tsx para aparecer em todas as páginas.

// // import { useState, useRef, useEffect, useCallback } from 'react'
// // import { useLocation } from 'react-router-dom'
// // import { useCompany } from '../../hooks/useCompany'
// // import { getPageContext } from '../../config/aiPageContext'
// // import {
// //   XMarkIcon,
// //   PaperAirplaneIcon,
// //   ArrowPathIcon,
// //   TrashIcon,
// //   ChevronDownIcon,
// // } from '@heroicons/react/24/outline'

// // const API_BASE_URL = 'https://apinode.smartxhub.cloud/api'
// // const TYPEWRITER_SPEED_MS = 16

// // interface ChatMessage {
// //   role: 'user' | 'assistant'
// //   content: string
// // }

// // // ─── Cursor piscando ──────────────────────────────────────────────
// // function Cursor() {
// //   return (
// //     <span
// //       className="inline-block w-[2px] h-[12px] ml-[2px] align-middle rounded-sm"
// //       style={{ background: 'var(--color-primary)', animation: 'aifb-blink 0.9s step-end infinite' }}
// //     />
// //   )
// // }

// // // ─── Renderiza markdown ───────────────────────────────────────────
// // function Markdown({ text, streaming = false }: { text: string; streaming?: boolean }) {
// //   const lines = text.split('\n')
// //   return (
// //     <>
// //       {lines.map((line, i) => {
// //         const isLast = i === lines.length - 1
// //         const cursor = isLast && streaming ? <Cursor /> : null
// //         if (line.startsWith('## ')) return (
// //           <p key={i} style={{ fontSize: 10.5, fontWeight: 700, color: 'var(--color-primary)', margin: '8px 0 3px', letterSpacing: '0.03em' }}>
// //             {line.slice(3)}{cursor}
// //           </p>
// //         )
// //         if (line.startsWith('### ')) return (
// //           <p key={i} style={{ fontSize: 10.5, fontWeight: 600, color: '#1a1a2e', margin: '4px 0 2px' }}
// //             className="dark:text-gray-100">
// //             {line.slice(4)}{cursor}
// //           </p>
// //         )
// //         if (line.match(/^\*\*(.+)\*\*$/)) return (
// //           <p key={i} style={{ fontSize: 10.5, fontWeight: 600, color: '#1a1a2e' }}
// //             className="dark:text-gray-100">
// //             {line.replace(/\*\*/g, '')}{cursor}
// //           </p>
// //         )
// //         if (line.match(/^(\d+\.|-|•)\s/)) return (
// //           <p key={i} style={{ fontSize: 10.5, color: '#374151', lineHeight: 1.6, display: 'flex', gap: 5 }}
// //             className="dark:text-gray-300">
// //             <span style={{ color: 'var(--color-primary)', flexShrink: 0 }}>›</span>
// //             {line.replace(/^(\d+\.|-|•)\s/, '')}{cursor}
// //           </p>
// //         )
// //         if (line.trim() === '') return <div key={i} style={{ height: 5 }} />
// //         return (
// //           <p key={i} style={{ fontSize: 10.5, color: '#374151', lineHeight: 1.7 }}
// //             className="dark:text-gray-300">
// //             {line}{cursor}
// //           </p>
// //         )
// //       })}
// //     </>
// //   )
// // }

// // // ─── Componente principal ─────────────────────────────────────────
// // export default function AIFloatingButton() {
// //   const location = useLocation()
// //   const { companyId } = useCompany()
// //   const [open, setOpen] = useState(false)
// //   const [input, setInput] = useState('')
// //   const [showContext, setShowContext] = useState(false)
// //   const [messages, setMessages] = useState<ChatMessage[]>([])
// //   const [loading, setLoading] = useState(false)
// //   const [error, setError] = useState<string | null>(null)
// //   const [contextUsed, setContextUsed] = useState<string[]>([])
// //   const messagesEndRef = useRef<HTMLDivElement>(null)
// //   const inputRef = useRef<HTMLTextAreaElement>(null)

// //   const bufferRef = useRef('')
// //   const displayedRef = useRef('')
// //   const typewriterRef = useRef<ReturnType<typeof setInterval> | null>(null)
// //   const streamingRef = useRef(false)

// //   const id = companyId || 1
// //   const ctx = getPageContext(location.pathname)
// //   const lastMsg = messages[messages.length - 1]
// //   const isStreaming = loading && lastMsg?.role === 'assistant'
// //   const assistantCount = messages.filter(m => m.role === 'assistant').length

// //   useEffect(() => {
// //     messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
// //   }, [messages])

// //   useEffect(() => {
// //     if (open) setTimeout(() => inputRef.current?.focus(), 100)
// //   }, [open])

// //   useEffect(() => {
// //     clearMessages()
// //     setShowContext(false)
// //   }, [location.pathname])

// //   const startTypewriter = useCallback(() => {
// //     if (typewriterRef.current) return
// //     typewriterRef.current = setInterval(() => {
// //       const buf = bufferRef.current
// //       const disp = displayedRef.current
// //       if (disp.length < buf.length) {
// //         const next = buf.slice(0, disp.length + 1)
// //         displayedRef.current = next
// //         setMessages(prev => {
// //           const updated = [...prev]
// //           updated[updated.length - 1] = { role: 'assistant', content: next }
// //           return updated
// //         })
// //       } else if (!streamingRef.current) {
// //         clearInterval(typewriterRef.current!)
// //         typewriterRef.current = null
// //       }
// //     }, TYPEWRITER_SPEED_MS)
// //   }, [])

// //   const sendMessage = useCallback(async (content: string) => {
// //     if (!content.trim() || loading) return

// //     const userMsg: ChatMessage = { role: 'user', content }
// //     const updatedMessages = [...messages, userMsg]
// //     setMessages(updatedMessages)
// //     setLoading(true)
// //     setError(null)

// //     bufferRef.current = ''
// //     displayedRef.current = ''
// //     streamingRef.current = true
// //     if (typewriterRef.current) { clearInterval(typewriterRef.current); typewriterRef.current = null }

// //     setMessages(prev => [...prev, { role: 'assistant', content: '' }])

// //     try {
// //       const response = await fetch(`${API_BASE_URL}/dashboard/ai/context-chat-stream`, {
// //         method: 'POST',
// //         headers: { 'Content-Type': 'application/json' },
// //         body: JSON.stringify({
// //           companyId: id,
// //           messages: updatedMessages,
// //           pageContext: {
// //             route: location.pathname,
// //             pageName: ctx.title,
// //             domain: ctx.domain,
// //             description: ctx.description,
// //             dataTopics: getDataTopicsFromDomain(ctx.domain),
// //             systemKnowledge: buildSystemKnowledge(ctx),
// //           },
// //         }),
// //       })

// //       if (!response.ok) throw new Error(`HTTP ${response.status}`)
// //       if (!response.body) throw new Error('Stream não disponível')

// //       const reader = response.body.getReader()
// //       const decoder = new TextDecoder()
// //       startTypewriter()

// //       while (true) {
// //         const { done, value } = await reader.read()
// //         if (done) break
// //         const text = decoder.decode(value, { stream: true })
// //         for (const line of text.split('\n').filter(l => l.startsWith('data: '))) {
// //           try {
// //             const data = JSON.parse(line.replace('data: ', ''))
// //             if (data.chunk) bufferRef.current += data.chunk
// //             if (data.done) setContextUsed(data.contextUsed || [])
// //             if (data.error) setError('Erro ao processar resposta da IA.')
// //           } catch { }
// //         }
// //       }
// //     } catch (err: any) {
// //       setMessages(prev => prev.slice(0, -1))
// //       setError('Erro ao conectar com a IA.')
// //       console.error('[AIFloating] Erro:', err)
// //     } finally {
// //       streamingRef.current = false
// //       setLoading(false)
// //     }
// //   }, [messages, loading, id, location.pathname, ctx, startTypewriter])

// //   const clearMessages = useCallback(() => {
// //     if (typewriterRef.current) { clearInterval(typewriterRef.current); typewriterRef.current = null }
// //     bufferRef.current = ''; displayedRef.current = ''; streamingRef.current = false
// //     setMessages([]); setContextUsed([]); setError(null)
// //   }, [])

// //   const handleSend = useCallback(async () => {
// //     if (!input.trim() || loading) return
// //     const text = input
// //     setInput('')
// //     await sendMessage(text)
// //   }, [input, loading, sendMessage])

// //   const handleSuggestion = useCallback(async (text: string) => {
// //     await sendMessage(text)
// //   }, [sendMessage])

// //   const handleKeyDown = (e: React.KeyboardEvent) => {
// //     if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() }
// //   }

// //   return (
// //     <>
// //       <style>{`
// //         @keyframes aifb-blink { 0%,100%{opacity:1} 50%{opacity:0} }
// //         @keyframes aifb-fade { from{opacity:0;transform:translateY(5px)} to{opacity:1;transform:translateY(0)} }
// //         @keyframes aifb-slide { from{opacity:0;transform:translateY(16px) scale(0.97)} to{opacity:1;transform:translateY(0) scale(1)} }
// //         @keyframes aifb-pulse { 0%{box-shadow:0 0 0 0 color-mix(in srgb, var(--color-primary) 45%, transparent)} 70%{box-shadow:0 0 0 10px transparent} 100%{box-shadow:0 0 0 0 transparent} }
// //         @keyframes spin { to{transform:rotate(360deg)} }
// //         .aifb-msg { animation: aifb-fade 0.2s ease forwards; }
// //         .aifb-drawer { animation: aifb-slide 0.25s cubic-bezier(0.34,1.4,0.64,1) forwards; }
// //         .aifb-suggestion {
// //           text-align: left; font-size: 10px; color: #6b7280;
// //           padding: 7px 11px; background: transparent;
// //           border: 1px solid #e5e7eb; border-radius: 6px;
// //           cursor: pointer; font-family: inherit; transition: all 0.15s; width: 100%;
// //         }
// //         .aifb-suggestion:hover {
// //           color: var(--color-primary);
// //           border-color: var(--color-primary);
// //           background: color-mix(in srgb, var(--color-primary) 6%, transparent);
// //         }
// //         .aifb-input-wrap:focus-within {
// //           border-color: var(--color-primary) !important;
// //         }
// //         .dark .aifb-suggestion { color: #9ca3af; border-color: #374151; }
// //         .dark .aifb-suggestion:hover { color: var(--color-primary); border-color: var(--color-primary); }
// //       `}</style>

// //       {/* ── Botão flutuante ── */}
// //       <button
// //         onClick={() => setOpen(v => !v)}
// //         title="Perguntar à IA sobre esta tela"
// //         style={{
// //           position: 'fixed', bottom: 24, right: 24,
// //           width: 52, height: 52, borderRadius: '50%',
// //           background: open
// //             ? 'white'
// //             : 'var(--color-primary)',
// //           border: `2px solid ${open ? 'var(--color-primary)' : 'transparent'}`,
// //           cursor: 'pointer', zIndex: 9998,
// //           display: 'flex', alignItems: 'center', justifyContent: 'center',
// //           transition: 'all 0.2s',
// //           animation: !open ? 'aifb-pulse 3s infinite' : 'none',
// //           boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
// //         }}
// //       >
// //         {open
// //           ? <XMarkIcon style={{ width: 20, height: 20, color: 'var(--color-primary)' }} />
// //           : <img src="/logoSmartxAI.png" alt="AI" style={{ width: 30, height: 30, objectFit: 'contain', filter: 'brightness(10)' }} />
// //         }
// //         {!open && assistantCount > 0 && (
// //           <div style={{
// //             position: 'absolute', top: 0, right: 0,
// //             width: 16, height: 16, borderRadius: '50%',
// //             background: '#ef4444', border: '2px solid white',
// //             fontSize: 8, color: 'white', fontWeight: 700,
// //             display: 'flex', alignItems: 'center', justifyContent: 'center',
// //           }}>
// //             {assistantCount}
// //           </div>
// //         )}
// //       </button>

// //       {/* ── Drawer ── */}
// //       {open && (
// //         <div
// //           className="aifb-drawer bg-white dark:bg-gray-900"
// //           style={{
// //             position: 'fixed', bottom: 88, right: 24,
// //             width: 368, height: 540,
// //             border: '1px solid #e5e7eb',
// //             borderRadius: 16, zIndex: 9997,
// //             display: 'flex', flexDirection: 'column', overflow: 'hidden',
// //             boxShadow: '0 20px 60px rgba(0,0,0,0.15), 0 4px 12px rgba(0,0,0,0.08)',
// //             fontFamily: 'inherit',
// //           }}
// //         >
// //           {/* Barra colorida no topo */}
// //           <div style={{ height: 3, background: 'linear-gradient(90deg, var(--color-primary), var(--color-primary-dark, var(--color-primary)))', flexShrink: 0 }} />

// //           {/* Header */}
// //           <div
// //             className="bg-white dark:bg-gray-900"
// //             style={{ padding: '12px 16px', borderBottom: '1px solid #f3f4f6', flexShrink: 0 }}
// //           >
// //             <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
// //               <div
// //                 style={{
// //                   width: 34, height: 34, borderRadius: 10,
// //                   background: 'color-mix(in srgb, var(--color-primary) 10%, transparent)',
// //                   border: '1.5px solid color-mix(in srgb, var(--color-primary) 25%, transparent)',
// //                   display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
// //                 }}
// //               >
// //                 <img src="/logoSmartxAI.png" alt="AI" style={{ width: 22, height: 22, objectFit: 'contain' }} />
// //               </div>
// //               <div style={{ flex: 1, minWidth: 0 }}>
// //                 <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-primary)', letterSpacing: '-0.01em' }}>
// //                   SmartX AI
// //                 </p>
// //                 <p className="text-gray-400 dark:text-gray-500" style={{ fontSize: 10, marginTop: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
// //                   {ctx.title}
// //                 </p>
// //               </div>
// //               <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
// //                 <div style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '3px 8px', borderRadius: 20, background: 'color-mix(in srgb, var(--color-primary) 10%, transparent)' }}>
// //                   <div style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--color-primary)', animation: 'aifb-pulse 2s infinite' }} />
// //                   <span style={{ fontSize: 9, color: 'var(--color-primary)', fontWeight: 600, letterSpacing: '0.05em' }}>ONLINE</span>
// //                 </div>
// //               </div>
// //             </div>

// //             {/* Toggle contexto */}
// //             <button
// //               onClick={() => setShowContext(v => !v)}
// //               className="text-gray-400 hover:text-gray-600 dark:text-gray-600 dark:hover:text-gray-400"
// //               style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 4, background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', padding: 0, fontSize: 10 }}
// //             >
// //               <ChevronDownIcon style={{ width: 10, height: 10, transition: 'transform 0.2s', transform: showContext ? 'rotate(180deg)' : 'none' }} />
// //               Ver contexto da tela
// //             </button>

// //             {showContext && (
// //               <div
// //                 className="dark:bg-gray-800 dark:border-gray-700"
// //                 style={{ marginTop: 8, padding: '9px 12px', background: '#f9fafb', border: '1px solid #f3f4f6', borderRadius: 8 }}
// //               >
// //                 <p className="text-gray-600 dark:text-gray-400" style={{ fontSize: 10, lineHeight: 1.6 }}>{ctx.description}</p>
// //                 {ctx.metrics.length > 0 && (
// //                   <div style={{ marginTop: 6, display: 'flex', flexWrap: 'wrap', gap: 4 }}>
// //                     {ctx.metrics.map(m => (
// //                       <span key={m} style={{ fontSize: 9, color: 'var(--color-primary)', background: 'color-mix(in srgb, var(--color-primary) 8%, transparent)', border: '1px solid color-mix(in srgb, var(--color-primary) 20%, transparent)', borderRadius: 4, padding: '2px 7px' }}>
// //                         {m}
// //                       </span>
// //                     ))}
// //                   </div>
// //                 )}
// //                 {ctx.howToRead && (
// //                   <p className="text-gray-400 dark:text-gray-500" style={{ fontSize: 9.5, lineHeight: 1.5, marginTop: 6, fontStyle: 'italic' }}>
// //                     💡 {ctx.howToRead}
// //                   </p>
// //                 )}
// //               </div>
// //             )}
// //           </div>

// //           {/* Messages */}
// //           <div
// //             className="dark:bg-gray-900"
// //             style={{ flex: 1, overflowY: 'auto', padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 10, scrollbarWidth: 'thin' }}
// //           >
// //             {/* Empty state — sugestões */}
// //             {messages.length === 0 && (
// //               <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
// //                 <p className="text-gray-400 dark:text-gray-600" style={{ fontSize: 10, letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: 4 }}>
// //                   Perguntas sobre esta tela
// //                 </p>
// //                 {ctx.suggestions.map((s, i) => (
// //                   <button key={i} className="aifb-suggestion" onClick={() => handleSuggestion(s)} disabled={loading}>
// //                     {s}
// //                   </button>
// //                 ))}
// //                 {ctx.commonQuestions.length > 0 && (
// //                   <>
// //                     <p className="text-gray-400 dark:text-gray-600" style={{ fontSize: 10, letterSpacing: '0.05em', textTransform: 'uppercase', marginTop: 6, marginBottom: 4 }}>
// //                       Dúvidas frequentes
// //                     </p>
// //                     {ctx.commonQuestions.map((q, i) => (
// //                       <button key={i} className="aifb-suggestion" onClick={() => handleSuggestion(q)} disabled={loading}>
// //                         {q}
// //                       </button>
// //                     ))}
// //                   </>
// //                 )}
// //               </div>
// //             )}

// //             {/* Mensagens */}
// //             {messages.map((msg, i) => {
// //               const isThisStreaming = isStreaming && i === messages.length - 1
// //               return (
// //                 <div key={i} className="aifb-msg" style={{ display: 'flex', gap: 8, justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
// //                   {msg.role === 'assistant' && (
// //                     <div style={{ width: 24, height: 24, borderRadius: 8, background: 'color-mix(in srgb, var(--color-primary) 10%, transparent)', border: '1px solid color-mix(in srgb, var(--color-primary) 20%, transparent)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2 }}>
// //                       <img src="/logoSmartxAI.png" alt="AI" style={{ width: 15, height: 15, objectFit: 'contain' }} />
// //                     </div>
// //                   )}
// //                   <div
// //                     className={msg.role === 'user' ? 'dark:bg-opacity-20' : 'bg-gray-50 dark:bg-gray-800'}
// //                     style={{
// //                       maxWidth: '84%', padding: '9px 12px', borderRadius: 10,
// //                       ...(msg.role === 'user'
// //                         ? { background: 'color-mix(in srgb, var(--color-primary) 12%, transparent)', border: '1px solid color-mix(in srgb, var(--color-primary) 25%, transparent)', borderTopRightRadius: 3 }
// //                         : { border: '1px solid #f3f4f6', borderTopLeftRadius: 3 }
// //                       )
// //                     }}
// //                   >
// //                     {msg.role === 'user'
// //                       ? <p style={{ fontSize: 11, color: 'var(--color-primary-dark, var(--color-primary))', lineHeight: 1.6, fontWeight: 500 }}>{msg.content}</p>
// //                       : msg.content === '' && isThisStreaming
// //                         ? <p style={{ fontSize: 10 }}><Cursor /></p>
// //                         : <Markdown text={msg.content} streaming={isThisStreaming} />
// //                     }
// //                   </div>
// //                 </div>
// //               )
// //             })}

// //             {/* Loading dots */}
// //             {loading && !isStreaming && (
// //               <div className="aifb-msg" style={{ display: 'flex', gap: 8 }}>
// //                 <div style={{ width: 24, height: 24, borderRadius: 8, background: 'color-mix(in srgb, var(--color-primary) 10%, transparent)', border: '1px solid color-mix(in srgb, var(--color-primary) 20%, transparent)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
// //                   <img src="/logoSmartxAI.png" alt="AI" style={{ width: 15, height: 15, objectFit: 'contain' }} />
// //                 </div>
// //                 <div className="bg-gray-50 dark:bg-gray-800" style={{ padding: '10px 14px', border: '1px solid #f3f4f6', borderRadius: 10, borderTopLeftRadius: 3 }}>
// //                   <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
// //                     {[0, 150, 300].map(d => (
// //                       <div key={d} style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--color-primary)', opacity: 0.6, animation: `aifb-blink 1s ${d}ms step-end infinite` }} />
// //                     ))}
// //                   </div>
// //                 </div>
// //               </div>
// //             )}

// //             {error && (
// //               <p style={{ fontSize: 10, color: '#ef4444', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, padding: '8px 12px' }}>
// //                 ✕ {error}
// //               </p>
// //             )}

// //             {/* Tags de contexto usado */}
// //             {contextUsed.length > 0 && !loading && (
// //               <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
// //                 {contextUsed.map(c => (
// //                   <span key={c} style={{ fontSize: 9, color: 'var(--color-primary)', background: 'color-mix(in srgb, var(--color-primary) 8%, transparent)', border: '1px solid color-mix(in srgb, var(--color-primary) 20%, transparent)', borderRadius: 4, padding: '2px 8px', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
// //                     ◈ {c}
// //                   </span>
// //                 ))}
// //               </div>
// //             )}

// //             <div ref={messagesEndRef} />
// //           </div>

// //           {/* Input */}
// //           <div
// //             className="bg-white dark:bg-gray-900"
// //             style={{ padding: '10px 14px', borderTop: '1px solid #f3f4f6', flexShrink: 0 }}
// //           >
// //             {messages.length > 0 && (
// //               <button
// //                 onClick={clearMessages}
// //                 className="text-gray-400 hover:text-gray-600 dark:text-gray-600 dark:hover:text-gray-400"
// //                 style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 8, background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: 10 }}
// //               >
// //                 <TrashIcon style={{ width: 11, height: 11 }} />
// //                 Limpar conversa
// //               </button>
// //             )}
// //             <div
// //               className="aifb-input-wrap dark:bg-gray-800 dark:border-gray-700"
// //               style={{ display: 'flex', gap: 8, alignItems: 'flex-end', border: '1.5px solid #e5e7eb', borderRadius: 10, padding: '8px 12px', background: '#f9fafb', transition: 'border-color 0.2s' }}
// //             >
// //               <textarea
// //                 ref={inputRef}
// //                 value={input}
// //                 onChange={e => setInput(e.target.value)}
// //                 onKeyDown={handleKeyDown}
// //                 placeholder={`Pergunte sobre ${ctx.title.toLowerCase()}...`}
// //                 rows={1}
// //                 className="dark:bg-transparent dark:text-gray-200 dark:placeholder-gray-600"
// //                 style={{ flex: 1, resize: 'none', background: 'transparent', border: 'none', outline: 'none', color: '#111827', fontFamily: 'inherit', fontSize: 11, lineHeight: 1.6, maxHeight: 72, placeholder: '#9ca3af' }}
// //               />
// //               <button
// //                 onClick={handleSend}
// //                 disabled={!input.trim() || loading}
// //                 style={{ width: 30, height: 30, borderRadius: 8, background: 'var(--color-primary)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, opacity: (!input.trim() || loading) ? 0.4 : 1, transition: 'opacity 0.15s' }}
// //               >
// //                 {loading
// //                   ? <ArrowPathIcon style={{ width: 13, height: 13, color: 'white', animation: 'spin 1s linear infinite' }} />
// //                   : <PaperAirplaneIcon style={{ width: 13, height: 13, color: 'white' }} />
// //                 }
// //               </button>
// //             </div>
// //             <p className="text-gray-300 dark:text-gray-700" style={{ fontSize: 9, marginTop: 5 }}>
// //               Enter para enviar · Shift+Enter nova linha
// //             </p>
// //           </div>
// //         </div>
// //       )}
// //     </>
// //   )
// // }

// // // ─── Helpers ──────────────────────────────────────────────────────

// // function getDataTopicsFromDomain(domain: string): string[] {
// //   const map: Record<string, string[]> = {
// //     certificates: ['certificates'],
// //     assets:       ['assets'],
// //     temperature:  ['temperature'],
// //     boundary:     ['boundary'],
// //     alerts:       ['alerts'],
// //     people:       ['boundary', 'alerts'],
// //     gps:          ['boundary'],
// //     risk:         ['alerts', 'temperature'],
// //     logistics:    ['assets'],
// //     geral:        ['certificates', 'assets', 'alerts'],
// //     ai:           ['certificates', 'assets', 'temperature', 'boundary', 'alerts'],
// //   }
// //   return map[domain] || ['certificates', 'assets', 'alerts']
// // }

// // function buildSystemKnowledge(ctx: ReturnType<typeof getPageContext>): string {
// //   const parts: string[] = [ctx.description]
// //   if (ctx.metrics.length > 0)
// //     parts.push(`\nMétricas exibidas: ${ctx.metrics.join(', ')}.`)
// //   if (ctx.howToRead)
// //     parts.push(`\nComo interpretar: ${ctx.howToRead}`)
// //   if (ctx.commonQuestions.length > 0)
// //     parts.push(`\nDúvidas frequentes: ${ctx.commonQuestions.join(' | ')}`)
// //   return parts.join('\n')
// // }



// // // src/components/AI/AIFloatingButton.tsx
// // // Botão flutuante global com cores dinâmicas do tema da empresa.
// // // Adicione <AIFloatingButton /> no Layout.tsx para aparecer em todas as páginas.

// // import { useState, useRef, useEffect, useCallback } from 'react'
// // import { useLocation } from 'react-router-dom'
// // import { useCompany } from '../../hooks/useCompany'
// // import { getPageContext } from '../../config/aiPageContext'
// // import {
// //   XMarkIcon,
// //   PaperAirplaneIcon,
// //   ArrowPathIcon,
// //   TrashIcon,
// //   ChevronDownIcon,
// // } from '@heroicons/react/24/outline'

// // const API_BASE_URL = 'https://apinode.smartxhub.cloud/api'
// // const TYPEWRITER_SPEED_MS = 16

// // interface ChatMessage {
// //   role: 'user' | 'assistant'
// //   content: string
// // }

// // // ─── Cursor piscando ──────────────────────────────────────────────
// // function Cursor() {
// //   return (
// //     <span
// //       className="inline-block w-[2px] h-[12px] ml-[2px] align-middle rounded-sm"
// //       style={{ background: 'var(--color-primary)', animation: 'aifb-blink 0.9s step-end infinite' }}
// //     />
// //   )
// // }

// // // ─── Renderiza markdown ───────────────────────────────────────────
// // function Markdown({ text, streaming = false }: { text: string; streaming?: boolean }) {
// //   const lines = text.split('\n')
// //   return (
// //     <>
// //       {lines.map((line, i) => {
// //         const isLast = i === lines.length - 1
// //         const cursor = isLast && streaming ? <Cursor /> : null
// //         if (line.startsWith('## ')) return (
// //           <p key={i} style={{ fontSize: 10.5, fontWeight: 700, color: 'var(--color-primary)', margin: '8px 0 3px', letterSpacing: '0.03em' }}>
// //             {line.slice(3)}{cursor}
// //           </p>
// //         )
// //         if (line.startsWith('### ')) return (
// //           <p key={i} style={{ fontSize: 10.5, fontWeight: 600, color: '#1a1a2e', margin: '4px 0 2px' }}
// //             className="dark:text-gray-100">
// //             {line.slice(4)}{cursor}
// //           </p>
// //         )
// //         if (line.match(/^\*\*(.+)\*\*$/)) return (
// //           <p key={i} style={{ fontSize: 10.5, fontWeight: 600, color: '#1a1a2e' }}
// //             className="dark:text-gray-100">
// //             {line.replace(/\*\*/g, '')}{cursor}
// //           </p>
// //         )
// //         if (line.match(/^(\d+\.|-|•)\s/)) return (
// //           <p key={i} style={{ fontSize: 10.5, color: '#374151', lineHeight: 1.6, display: 'flex', gap: 5 }}
// //             className="dark:text-gray-300">
// //             <span style={{ color: 'var(--color-primary)', flexShrink: 0 }}>›</span>
// //             {line.replace(/^(\d+\.|-|•)\s/, '')}{cursor}
// //           </p>
// //         )
// //         if (line.trim() === '') return <div key={i} style={{ height: 5 }} />
// //         return (
// //           <p key={i} style={{ fontSize: 10.5, color: '#374151', lineHeight: 1.7 }}
// //             className="dark:text-gray-300">
// //             {line}{cursor}
// //           </p>
// //         )
// //       })}
// //     </>
// //   )
// // }

// // // ─── Componente principal ─────────────────────────────────────────
// // export default function AIFloatingButton() {
// //   const location = useLocation()
// //   const { companyId } = useCompany()
// //   const [open, setOpen] = useState(false)
// //   const [input, setInput] = useState('')
// //   const [showContext, setShowContext] = useState(false)
// //   const [messages, setMessages] = useState<ChatMessage[]>([])
// //   const [loading, setLoading] = useState(false)
// //   const [error, setError] = useState<string | null>(null)
// //   const [contextUsed, setContextUsed] = useState<string[]>([])
// //   const messagesEndRef = useRef<HTMLDivElement>(null)
// //   const inputRef = useRef<HTMLTextAreaElement>(null)

// //   const bufferRef = useRef('')
// //   const displayedRef = useRef('')
// //   const typewriterRef = useRef<ReturnType<typeof setInterval> | null>(null)
// //   const streamingRef = useRef(false)

// //   const id = companyId || 1
// //   const ctx = getPageContext(location.pathname)
// //   const lastMsg = messages[messages.length - 1]
// //   const isStreaming = loading && lastMsg?.role === 'assistant'
// //   const assistantCount = messages.filter(m => m.role === 'assistant').length

// //   useEffect(() => {
// //     messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
// //   }, [messages])

// //   useEffect(() => {
// //     if (open) setTimeout(() => inputRef.current?.focus(), 100)
// //   }, [open])

// //   useEffect(() => {
// //     clearMessages()
// //     setShowContext(false)
// //   }, [location.pathname])

// //   const startTypewriter = useCallback(() => {
// //     if (typewriterRef.current) return
// //     typewriterRef.current = setInterval(() => {
// //       const buf = bufferRef.current
// //       const disp = displayedRef.current
// //       if (disp.length < buf.length) {
// //         const next = buf.slice(0, disp.length + 1)
// //         displayedRef.current = next
// //         setMessages(prev => {
// //           const updated = [...prev]
// //           updated[updated.length - 1] = { role: 'assistant', content: next }
// //           return updated
// //         })
// //       } else if (!streamingRef.current) {
// //         clearInterval(typewriterRef.current!)
// //         typewriterRef.current = null
// //       }
// //     }, TYPEWRITER_SPEED_MS)
// //   }, [])

// //   const sendMessage = useCallback(async (content: string) => {
// //     if (!content.trim() || loading) return

// //     const userMsg: ChatMessage = { role: 'user', content }
// //     const updatedMessages = [...messages, userMsg]
// //     setMessages(updatedMessages)
// //     setLoading(true)
// //     setError(null)

// //     bufferRef.current = ''
// //     displayedRef.current = ''
// //     streamingRef.current = true
// //     if (typewriterRef.current) { clearInterval(typewriterRef.current); typewriterRef.current = null }

// //     setMessages(prev => [...prev, { role: 'assistant', content: '' }])

// //     try {
// //       const response = await fetch(`${API_BASE_URL}/dashboard/ai/context-chat-stream`, {
// //         method: 'POST',
// //         headers: { 'Content-Type': 'application/json' },
// //         body: JSON.stringify({
// //           companyId: id,
// //           messages: updatedMessages,
// //           pageContext: {
// //             route: location.pathname,
// //             pageName: ctx.title,
// //             domain: ctx.domain,
// //             description: ctx.description,
// //             dataTopics: getDataTopicsFromDomain(ctx.domain),
// //             systemKnowledge: buildSystemKnowledge(ctx),
// //           },
// //         }),
// //       })

// //       if (!response.ok) throw new Error(`HTTP ${response.status}`)
// //       if (!response.body) throw new Error('Stream não disponível')

// //       const reader = response.body.getReader()
// //       const decoder = new TextDecoder()
// //       startTypewriter()

// //       while (true) {
// //         const { done, value } = await reader.read()
// //         if (done) break
// //         const text = decoder.decode(value, { stream: true })
// //         for (const line of text.split('\n').filter(l => l.startsWith('data: '))) {
// //           try {
// //             const data = JSON.parse(line.replace('data: ', ''))
// //             if (data.chunk) bufferRef.current += data.chunk
// //             if (data.done) setContextUsed(data.contextUsed || [])
// //             if (data.error) setError('Erro ao processar resposta da IA.')
// //           } catch { }
// //         }
// //       }
// //     } catch (err: any) {
// //       setMessages(prev => prev.slice(0, -1))
// //       setError('Erro ao conectar com a IA.')
// //       console.error('[AIFloating] Erro:', err)
// //     } finally {
// //       streamingRef.current = false
// //       setLoading(false)
// //     }
// //   }, [messages, loading, id, location.pathname, ctx, startTypewriter])

// //   const clearMessages = useCallback(() => {
// //     if (typewriterRef.current) { clearInterval(typewriterRef.current); typewriterRef.current = null }
// //     bufferRef.current = ''; displayedRef.current = ''; streamingRef.current = false
// //     setMessages([]); setContextUsed([]); setError(null)
// //   }, [])

// //   const handleSend = useCallback(async () => {
// //     if (!input.trim() || loading) return
// //     const text = input
// //     setInput('')
// //     await sendMessage(text)
// //   }, [input, loading, sendMessage])

// //   const handleSuggestion = useCallback(async (text: string) => {
// //     await sendMessage(text)
// //   }, [sendMessage])

// //   const handleKeyDown = (e: React.KeyboardEvent) => {
// //     if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() }
// //   }

// //   return (
// //     <>
// //       <style>{`
// //         @keyframes aifb-blink { 0%,100%{opacity:1} 50%{opacity:0} }
// //         @keyframes aifb-fade { from{opacity:0;transform:translateY(5px)} to{opacity:1;transform:translateY(0)} }
// //         @keyframes aifb-slide { from{opacity:0;transform:translateY(16px) scale(0.97)} to{opacity:1;transform:translateY(0) scale(1)} }
// //         @keyframes aifb-pulse { 0%{box-shadow:0 0 0 0 color-mix(in srgb, var(--color-primary) 45%, transparent)} 70%{box-shadow:0 0 0 10px transparent} 100%{box-shadow:0 0 0 0 transparent} }
// //         @keyframes spin { to{transform:rotate(360deg)} }
// //         .aifb-msg { animation: aifb-fade 0.2s ease forwards; }
// //         .aifb-drawer { animation: aifb-slide 0.25s cubic-bezier(0.34,1.4,0.64,1) forwards; }
// //         .aifb-suggestion {
// //           text-align: left; font-size: 10px; color: #6b7280;
// //           padding: 7px 11px; background: transparent;
// //           border: 1px solid #e5e7eb; border-radius: 6px;
// //           cursor: pointer; font-family: inherit; transition: all 0.15s; width: 100%;
// //         }
// //         .aifb-suggestion:hover {
// //           color: var(--color-primary);
// //           border-color: var(--color-primary);
// //           background: color-mix(in srgb, var(--color-primary) 6%, transparent);
// //         }
// //         .aifb-input-wrap:focus-within {
// //           border-color: var(--color-primary) !important;
// //         }
// //         .dark .aifb-suggestion { color: #9ca3af; border-color: #374151; }
// //         .dark .aifb-suggestion:hover { color: var(--color-primary); border-color: var(--color-primary); }
// //       `}</style>

// //       {/* ── Botão flutuante ── */}
// //       <button
// //         onClick={() => setOpen(v => !v)}
// //         title="Perguntar à IA sobre esta tela"
// //         style={{
// //           position: 'fixed', bottom: 24, right: 24,
// //           width: 52, height: 52, borderRadius: '50%',
// //           background: open
// //             ? 'white'
// //             : 'var(--color-primary)',
// //           border: `2px solid ${open ? 'var(--color-primary)' : 'transparent'}`,
// //           cursor: 'pointer', zIndex: 9998,
// //           display: 'flex', alignItems: 'center', justifyContent: 'center',
// //           transition: 'all 0.2s',
// //           animation: !open ? 'aifb-pulse 3s infinite' : 'none',
// //           boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
// //         }}
// //       >
// //         {open
// //           ? <XMarkIcon style={{ width: 20, height: 20, color: 'var(--color-primary)' }} />
// //           : <img src="/logoSmartxAI.png" alt="AI" style={{ width: 30, height: 30, objectFit: 'contain', filter: 'brightness(10)' }} />
// //         }
// //         {!open && assistantCount > 0 && (
// //           <div style={{
// //             position: 'absolute', top: 0, right: 0,
// //             width: 16, height: 16, borderRadius: '50%',
// //             background: '#ef4444', border: '2px solid white',
// //             fontSize: 8, color: 'white', fontWeight: 700,
// //             display: 'flex', alignItems: 'center', justifyContent: 'center',
// //           }}>
// //             {assistantCount}
// //           </div>
// //         )}
// //       </button>

// //       {/* ── Drawer ── */}
// //       {open && (
// //         <div
// //           className="aifb-drawer bg-white dark:bg-gray-900"
// //           style={{
// //             position: 'fixed', bottom: 88, right: 24,
// //             width: 368, height: 540,
// //             border: '1px solid #e5e7eb',
// //             borderRadius: 16, zIndex: 9997,
// //             display: 'flex', flexDirection: 'column', overflow: 'hidden',
// //             boxShadow: '0 20px 60px rgba(0,0,0,0.15), 0 4px 12px rgba(0,0,0,0.08)',
// //             fontFamily: 'inherit',
// //           }}
// //         >
// //           {/* Barra colorida no topo */}
// //           <div style={{ height: 3, background: 'linear-gradient(90deg, var(--color-primary), var(--color-primary-dark, var(--color-primary)))', flexShrink: 0 }} />

// //           {/* Header */}
// //           <div
// //             className="bg-white dark:bg-gray-900"
// //             style={{ padding: '12px 16px', borderBottom: '1px solid #f3f4f6', flexShrink: 0 }}
// //           >
// //             <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
// //               <div
// //                 style={{
// //                   width: 34, height: 34, borderRadius: 10,
// //                   background: 'color-mix(in srgb, var(--color-primary) 10%, transparent)',
// //                   border: '1.5px solid color-mix(in srgb, var(--color-primary) 25%, transparent)',
// //                   display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
// //                 }}
// //               >
// //                 <img src="/logoSmartxAI.png" alt="AI" style={{ width: 22, height: 22, objectFit: 'contain' }} />
// //               </div>
// //               <div style={{ flex: 1, minWidth: 0 }}>
// //                 <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-primary)', letterSpacing: '-0.01em' }}>
// //                   SmartX AI
// //                 </p>
// //                 <p className="text-gray-400 dark:text-gray-500" style={{ fontSize: 10, marginTop: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
// //                   {ctx.title}
// //                 </p>
// //               </div>
// //               <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
// //                 <div style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '3px 8px', borderRadius: 20, background: 'color-mix(in srgb, var(--color-primary) 10%, transparent)' }}>
// //                   <div style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--color-primary)', animation: 'aifb-pulse 2s infinite' }} />
// //                   <span style={{ fontSize: 9, color: 'var(--color-primary)', fontWeight: 600, letterSpacing: '0.05em' }}>ONLINE</span>
// //                 </div>
// //               </div>
// //             </div>

// //             {/* Toggle contexto */}
// //             <button
// //               onClick={() => setShowContext(v => !v)}
// //               className="text-gray-400 hover:text-gray-600 dark:text-gray-600 dark:hover:text-gray-400"
// //               style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 4, background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', padding: 0, fontSize: 10 }}
// //             >
// //               <ChevronDownIcon style={{ width: 10, height: 10, transition: 'transform 0.2s', transform: showContext ? 'rotate(180deg)' : 'none' }} />
// //               Ver contexto da tela
// //             </button>

// //             {showContext && (
// //               <div
// //                 className="dark:bg-gray-800 dark:border-gray-700"
// //                 style={{ marginTop: 8, padding: '9px 12px', background: '#f9fafb', border: '1px solid #f3f4f6', borderRadius: 8 }}
// //               >
// //                 <p className="text-gray-600 dark:text-gray-400" style={{ fontSize: 10, lineHeight: 1.6 }}>{ctx.description}</p>
// //                 {ctx.metrics.length > 0 && (
// //                   <div style={{ marginTop: 6, display: 'flex', flexWrap: 'wrap', gap: 4 }}>
// //                     {ctx.metrics.map(m => (
// //                       <span key={m} style={{ fontSize: 9, color: 'var(--color-primary)', background: 'color-mix(in srgb, var(--color-primary) 8%, transparent)', border: '1px solid color-mix(in srgb, var(--color-primary) 20%, transparent)', borderRadius: 4, padding: '2px 7px' }}>
// //                         {m}
// //                       </span>
// //                     ))}
// //                   </div>
// //                 )}
// //                 {ctx.howToRead && (
// //                   <p className="text-gray-400 dark:text-gray-500" style={{ fontSize: 9.5, lineHeight: 1.5, marginTop: 6, fontStyle: 'italic' }}>
// //                     💡 {ctx.howToRead}
// //                   </p>
// //                 )}
// //               </div>
// //             )}
// //           </div>

// //           {/* Messages */}
// //           <div
// //             className="dark:bg-gray-900"
// //             style={{ flex: 1, overflowY: 'auto', padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 10, scrollbarWidth: 'thin' }}
// //           >
// //             {/* Empty state — sugestões */}
// //             {messages.length === 0 && (
// //               <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
// //                 <p className="text-gray-400 dark:text-gray-600" style={{ fontSize: 10, letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: 4 }}>
// //                   Perguntas sobre esta tela
// //                 </p>
// //                 {ctx.suggestions.map((s, i) => (
// //                   <button key={i} className="aifb-suggestion" onClick={() => handleSuggestion(s)} disabled={loading}>
// //                     {s}
// //                   </button>
// //                 ))}
// //                 {ctx.commonQuestions.length > 0 && (
// //                   <>
// //                     <p className="text-gray-400 dark:text-gray-600" style={{ fontSize: 10, letterSpacing: '0.05em', textTransform: 'uppercase', marginTop: 6, marginBottom: 4 }}>
// //                       Dúvidas frequentes
// //                     </p>
// //                     {ctx.commonQuestions.map((q, i) => (
// //                       <button key={i} className="aifb-suggestion" onClick={() => handleSuggestion(q)} disabled={loading}>
// //                         {q}
// //                       </button>
// //                     ))}
// //                   </>
// //                 )}
// //               </div>
// //             )}

// //             {/* Mensagens */}
// //             {messages.map((msg, i) => {
// //               const isThisStreaming = isStreaming && i === messages.length - 1
// //               return (
// //                 <div key={i} className="aifb-msg" style={{ display: 'flex', gap: 8, justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
// //                   {msg.role === 'assistant' && (
// //                     <div style={{ width: 24, height: 24, borderRadius: 8, background: 'color-mix(in srgb, var(--color-primary) 10%, transparent)', border: '1px solid color-mix(in srgb, var(--color-primary) 20%, transparent)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2 }}>
// //                       <img src="/logoSmartxAI.png" alt="AI" style={{ width: 15, height: 15, objectFit: 'contain' }} />
// //                     </div>
// //                   )}
// //                   <div
// //                     className={msg.role === 'user' ? 'dark:bg-opacity-20' : 'bg-gray-50 dark:bg-gray-800'}
// //                     style={{
// //                       maxWidth: '84%', padding: '9px 12px', borderRadius: 10,
// //                       ...(msg.role === 'user'
// //                         ? { background: 'color-mix(in srgb, var(--color-primary) 12%, transparent)', border: '1px solid color-mix(in srgb, var(--color-primary) 25%, transparent)', borderTopRightRadius: 3 }
// //                         : { border: '1px solid #f3f4f6', borderTopLeftRadius: 3 }
// //                       )
// //                     }}
// //                   >
// //                     {msg.role === 'user'
// //                       ? <p style={{ fontSize: 11, color: 'var(--color-primary-dark, var(--color-primary))', lineHeight: 1.6, fontWeight: 500 }}>{msg.content}</p>
// //                       : msg.content === '' && isThisStreaming
// //                         ? <p style={{ fontSize: 10 }}><Cursor /></p>
// //                         : <Markdown text={msg.content} streaming={isThisStreaming} />
// //                     }
// //                   </div>
// //                 </div>
// //               )
// //             })}

// //             {/* Loading dots */}
// //             {loading && !isStreaming && (
// //               <div className="aifb-msg" style={{ display: 'flex', gap: 8 }}>
// //                 <div style={{ width: 24, height: 24, borderRadius: 8, background: 'color-mix(in srgb, var(--color-primary) 10%, transparent)', border: '1px solid color-mix(in srgb, var(--color-primary) 20%, transparent)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
// //                   <img src="/logoSmartxAI.png" alt="AI" style={{ width: 15, height: 15, objectFit: 'contain' }} />
// //                 </div>
// //                 <div className="bg-gray-50 dark:bg-gray-800" style={{ padding: '10px 14px', border: '1px solid #f3f4f6', borderRadius: 10, borderTopLeftRadius: 3 }}>
// //                   <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
// //                     {[0, 150, 300].map(d => (
// //                       <div key={d} style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--color-primary)', opacity: 0.6, animation: `aifb-blink 1s ${d}ms step-end infinite` }} />
// //                     ))}
// //                   </div>
// //                 </div>
// //               </div>
// //             )}

// //             {error && (
// //               <p style={{ fontSize: 10, color: '#ef4444', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, padding: '8px 12px' }}>
// //                 ✕ {error}
// //               </p>
// //             )}

// //             {/* Tags de contexto usado */}
// //             {contextUsed.length > 0 && !loading && (
// //               <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
// //                 {contextUsed.map(c => (
// //                   <span key={c} style={{ fontSize: 9, color: 'var(--color-primary)', background: 'color-mix(in srgb, var(--color-primary) 8%, transparent)', border: '1px solid color-mix(in srgb, var(--color-primary) 20%, transparent)', borderRadius: 4, padding: '2px 8px', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
// //                     ◈ {c}
// //                   </span>
// //                 ))}
// //               </div>
// //             )}

// //             <div ref={messagesEndRef} />
// //           </div>

// //           {/* Input */}
// //           <div
// //             className="bg-white dark:bg-gray-900"
// //             style={{ padding: '10px 14px', borderTop: '1px solid #f3f4f6', flexShrink: 0 }}
// //           >
// //             {messages.length > 0 && (
// //               <button
// //                 onClick={clearMessages}
// //                 className="text-gray-400 hover:text-gray-600 dark:text-gray-600 dark:hover:text-gray-400"
// //                 style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 8, background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: 10 }}
// //               >
// //                 <TrashIcon style={{ width: 11, height: 11 }} />
// //                 Limpar conversa
// //               </button>
// //             )}
// //             <div
// //               className="aifb-input-wrap dark:bg-gray-800 dark:border-gray-700"
// //               style={{ display: 'flex', gap: 8, alignItems: 'flex-end', border: '1.5px solid #e5e7eb', borderRadius: 10, padding: '8px 12px', background: '#f9fafb', transition: 'border-color 0.2s' }}
// //             >
// //               <textarea
// //                 ref={inputRef}
// //                 value={input}
// //                 onChange={e => setInput(e.target.value)}
// //                 onKeyDown={handleKeyDown}
// //                 placeholder={`Pergunte sobre ${ctx.title.toLowerCase()}...`}
// //                 rows={1}
// //                 className="dark:bg-transparent dark:text-gray-200 dark:placeholder-gray-600"
// //                 style={{ flex: 1, resize: 'none', background: 'transparent', border: 'none', outline: 'none', color: '#111827', fontFamily: 'inherit', fontSize: 11, lineHeight: 1.6, maxHeight: 72 }}
// //               />
// //               <button
// //                 onClick={handleSend}
// //                 disabled={!input.trim() || loading}
// //                 style={{ width: 30, height: 30, borderRadius: 8, background: 'var(--color-primary)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, opacity: (!input.trim() || loading) ? 0.4 : 1, transition: 'opacity 0.15s' }}
// //               >
// //                 {loading
// //                   ? <ArrowPathIcon style={{ width: 13, height: 13, color: 'white', animation: 'spin 1s linear infinite' }} />
// //                   : <PaperAirplaneIcon style={{ width: 13, height: 13, color: 'white' }} />
// //                 }
// //               </button>
// //             </div>
// //             <p className="text-gray-300 dark:text-gray-700" style={{ fontSize: 9, marginTop: 5 }}>
// //               Enter para enviar · Shift+Enter nova linha
// //             </p>
// //           </div>
// //         </div>
// //       )}
// //     </>
// //   )
// // }

// // // ─── Helpers ──────────────────────────────────────────────────────

// // function getDataTopicsFromDomain(domain: string): string[] {
// //   const map: Record<string, string[]> = {
// //     certificates: ['certificates'],
// //     assets:       ['assets'],
// //     temperature:  ['temperature'],
// //     boundary:     ['boundary'],
// //     alerts:       ['alerts'],
// //     people:       ['boundary', 'alerts'],
// //     gps:          ['boundary'],
// //     risk:         ['alerts', 'temperature'],
// //     logistics:    ['assets'],
// //     geral:        ['certificates', 'assets', 'alerts'],
// //     ai:           ['certificates', 'assets', 'temperature', 'boundary', 'alerts'],
// //   }
// //   return map[domain] || ['certificates', 'assets', 'alerts']
// // }

// // function buildSystemKnowledge(ctx: ReturnType<typeof getPageContext>): string {
// //   const parts: string[] = [ctx.description]
// //   if (ctx.metrics.length > 0)
// //     parts.push(`\nMétricas exibidas: ${ctx.metrics.join(', ')}.`)
// //   if (ctx.howToRead)
// //     parts.push(`\nComo interpretar: ${ctx.howToRead}`)
// //   if (ctx.commonQuestions.length > 0)
// //     parts.push(`\nDúvidas frequentes: ${ctx.commonQuestions.join(' | ')}`)
// //   return parts.join('\n')
// // }

// // src/components/AI/AIFloatingButton.tsx
// // Botão flutuante global com cores dinâmicas do tema da empresa.
// // Adicione <AIFloatingButton /> no Layout.tsx para aparecer em todas as páginas.

// import { useState, useRef, useEffect, useCallback } from 'react'
// import { useLocation } from 'react-router-dom'
// import { useCompany } from '../../hooks/useCompany'
// import { getPageContext } from '../../config/aiPageContext'
// import {
//   XMarkIcon,
//   PaperAirplaneIcon,
//   ArrowPathIcon,
//   TrashIcon,
//   ChevronDownIcon,
// } from '@heroicons/react/24/outline'

// const API_BASE_URL = 'https://apinode.smartxhub.cloud/api'
// const TYPEWRITER_SPEED_MS = 16

// interface ChatMessage {
//   role: 'user' | 'assistant'
//   content: string
// }

// // ─── Cursor piscando ──────────────────────────────────────────────
// function Cursor() {
//   return (
//     <span
//       className="inline-block w-[2px] h-[12px] ml-[2px] align-middle rounded-sm"
//       style={{ background: 'var(--color-primary)', animation: 'aifb-blink 0.9s step-end infinite' }}
//     />
//   )
// }

// // ─── Renderiza markdown ───────────────────────────────────────────
// function Markdown({ text, streaming = false }: { text: string; streaming?: boolean }) {
//   const lines = text.split('\n')
//   return (
//     <>
//       {lines.map((line, i) => {
//         const isLast = i === lines.length - 1
//         const cursor = isLast && streaming ? <Cursor /> : null
//         if (line.startsWith('## ')) return (
//           <p key={i} style={{ fontSize: 10.5, fontWeight: 700, color: 'var(--color-primary)', margin: '8px 0 3px', letterSpacing: '0.03em' }}>
//             {line.slice(3)}{cursor}
//           </p>
//         )
//         if (line.startsWith('### ')) return (
//           <p key={i} style={{ fontSize: 10.5, fontWeight: 600, color: '#1a1a2e', margin: '4px 0 2px' }}
//             className="dark:text-gray-100">
//             {line.slice(4)}{cursor}
//           </p>
//         )
//         if (line.match(/^\*\*(.+)\*\*$/)) return (
//           <p key={i} style={{ fontSize: 10.5, fontWeight: 600, color: '#1a1a2e' }}
//             className="dark:text-gray-100">
//             {line.replace(/\*\*/g, '')}{cursor}
//           </p>
//         )
//         if (line.match(/^(\d+\.|-|•)\s/)) return (
//           <p key={i} style={{ fontSize: 10.5, color: '#374151', lineHeight: 1.6, display: 'flex', gap: 5 }}
//             className="dark:text-gray-300">
//             <span style={{ color: 'var(--color-primary)', flexShrink: 0 }}>›</span>
//             {line.replace(/^(\d+\.|-|•)\s/, '')}{cursor}
//           </p>
//         )
//         if (line.trim() === '') return <div key={i} style={{ height: 5 }} />
//         return (
//           <p key={i} style={{ fontSize: 10.5, color: '#374151', lineHeight: 1.7 }}
//             className="dark:text-gray-300">
//             {line}{cursor}
//           </p>
//         )
//       })}
//     </>
//   )
// }

// // ─── Componente principal ─────────────────────────────────────────
// export default function AIFloatingButton() {
//   const location = useLocation()
//   const { companyId } = useCompany()
//   const [open, setOpen] = useState(false)
//   const [input, setInput] = useState('')
//   const [showContext, setShowContext] = useState(false)
//   const [messages, setMessages] = useState<ChatMessage[]>([])
//   const [loading, setLoading] = useState(false)
//   const [error, setError] = useState<string | null>(null)
//   const [contextUsed, setContextUsed] = useState<string[]>([])
//   const messagesEndRef = useRef<HTMLDivElement>(null)
//   const inputRef = useRef<HTMLTextAreaElement>(null)

//   const bufferRef = useRef('')
//   const displayedRef = useRef('')
//   const typewriterRef = useRef<ReturnType<typeof setInterval> | null>(null)
//   const streamingRef = useRef(false)

//   const id = companyId || 1
//   const ctx = getPageContext(location.pathname)
//   const lastMsg = messages[messages.length - 1]
//   const isStreaming = loading && lastMsg?.role === 'assistant'
//   const assistantCount = messages.filter(m => m.role === 'assistant').length

//   useEffect(() => {
//     messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
//   }, [messages])

//   useEffect(() => {
//     if (open) setTimeout(() => inputRef.current?.focus(), 100)
//   }, [open])

//   useEffect(() => {
//     clearMessages()
//     setShowContext(false)
//   }, [location.pathname])

//   const startTypewriter = useCallback(() => {
//     if (typewriterRef.current) return
//     typewriterRef.current = setInterval(() => {
//       const buf = bufferRef.current
//       const disp = displayedRef.current
//       if (disp.length < buf.length) {
//         const next = buf.slice(0, disp.length + 1)
//         displayedRef.current = next
//         setMessages(prev => {
//           const updated = [...prev]
//           updated[updated.length - 1] = { role: 'assistant', content: next }
//           return updated
//         })
//       } else if (!streamingRef.current) {
//         clearInterval(typewriterRef.current!)
//         typewriterRef.current = null
//       }
//     }, TYPEWRITER_SPEED_MS)
//   }, [])

//   const sendMessage = useCallback(async (content: string) => {
//     if (!content.trim() || loading) return

//     const userMsg: ChatMessage = { role: 'user', content }
//     const updatedMessages = [...messages, userMsg]
//     setMessages(updatedMessages)
//     setLoading(true)
//     setError(null)

//     bufferRef.current = ''
//     displayedRef.current = ''
//     streamingRef.current = true
//     if (typewriterRef.current) { clearInterval(typewriterRef.current); typewriterRef.current = null }

//     setMessages(prev => [...prev, { role: 'assistant', content: '' }])

//     try {
//       const response = await fetch(`${API_BASE_URL}/dashboard/ai/context-chat-stream`, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({
//           companyId: id,
//           messages: updatedMessages,
//           pageContext: {
//             route: location.pathname,
//             pageName: ctx.title,
//             domain: ctx.domain,
//             description: ctx.description,
//             dataTopics: getDataTopicsFromDomain(ctx.domain),
//             systemKnowledge: buildSystemKnowledge(ctx),
//           },
//         }),
//       })

//       if (!response.ok) throw new Error(`HTTP ${response.status}`)
//       if (!response.body) throw new Error('Stream não disponível')

//       const reader = response.body.getReader()
//       const decoder = new TextDecoder()
//       startTypewriter()

//       while (true) {
//         const { done, value } = await reader.read()
//         if (done) break
//         const text = decoder.decode(value, { stream: true })
//         for (const line of text.split('\n').filter(l => l.startsWith('data: '))) {
//           try {
//             const data = JSON.parse(line.replace('data: ', ''))
//             if (data.chunk) bufferRef.current += data.chunk
//             if (data.done) setContextUsed(data.contextUsed || [])
//             if (data.error) setError('Erro ao processar resposta da IA.')
//           } catch { }
//         }
//       }
//     } catch (err: any) {
//       setMessages(prev => prev.slice(0, -1))
//       setError('Erro ao conectar com a IA.')
//       console.error('[AIFloating] Erro:', err)
//     } finally {
//       streamingRef.current = false
//       setLoading(false)
//     }
//   }, [messages, loading, id, location.pathname, ctx, startTypewriter])

//   const clearMessages = useCallback(() => {
//     if (typewriterRef.current) { clearInterval(typewriterRef.current); typewriterRef.current = null }
//     bufferRef.current = ''; displayedRef.current = ''; streamingRef.current = false
//     setMessages([]); setContextUsed([]); setError(null)
//   }, [])

//   const handleSend = useCallback(async () => {
//     if (!input.trim() || loading) return
//     const text = input
//     setInput('')
//     await sendMessage(text)
//   }, [input, loading, sendMessage])

//   const handleSuggestion = useCallback(async (text: string) => {
//     await sendMessage(text)
//   }, [sendMessage])

//   const handleKeyDown = (e: React.KeyboardEvent) => {
//     if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() }
//   }

//   return (
//     <>
//       <style>{`
//         @keyframes aifb-blink { 0%,100%{opacity:1} 50%{opacity:0} }
//         @keyframes aifb-fade { from{opacity:0;transform:translateY(5px)} to{opacity:1;transform:translateY(0)} }
//         @keyframes aifb-slide { from{opacity:0;transform:translateY(16px) scale(0.97)} to{opacity:1;transform:translateY(0) scale(1)} }
//         @keyframes aifb-pulse { 0%{box-shadow:0 0 0 0 color-mix(in srgb, var(--color-primary) 45%, transparent)} 70%{box-shadow:0 0 0 10px transparent} 100%{box-shadow:0 0 0 0 transparent} }
//         @keyframes spin { to{transform:rotate(360deg)} }
//         .aifb-msg { animation: aifb-fade 0.2s ease forwards; }
//         .aifb-drawer { animation: aifb-slide 0.25s cubic-bezier(0.34,1.4,0.64,1) forwards; }
//         .aifb-suggestion {
//           text-align: left; font-size: 10px; color: #6b7280;
//           padding: 7px 11px; background: transparent;
//           border: 1px solid #e5e7eb; border-radius: 6px;
//           cursor: pointer; font-family: inherit; transition: all 0.15s; width: 100%;
//         }
//         .aifb-suggestion:hover {
//           color: var(--color-primary);
//           border-color: var(--color-primary);
//           background: color-mix(in srgb, var(--color-primary) 6%, transparent);
//         }
//         .aifb-input-wrap:focus-within {
//           border-color: var(--color-primary) !important;
//         }
//         .dark .aifb-suggestion { color: #9ca3af; border-color: #374151; }
//         .dark .aifb-suggestion:hover { color: var(--color-primary); border-color: var(--color-primary); }
//       `}</style>

//       {/* ── Botão flutuante ── */}
//       <button
//         onClick={() => setOpen(v => !v)}
//         title="Perguntar à IA sobre esta tela"
//         style={{
//           position: 'fixed', bottom: 20, right: 16,
//           width: 52, height: 52, borderRadius: '50%',
//           background: open
//             ? 'white'
//             : 'var(--color-primary)',
//           border: `2px solid ${open ? 'var(--color-primary)' : 'transparent'}`,
//           cursor: 'pointer', zIndex: 9998,
//           display: 'flex', alignItems: 'center', justifyContent: 'center',
//           transition: 'all 0.2s',
//           animation: !open ? 'aifb-pulse 3s infinite' : 'none',
//           boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
//         }}
//       >
//         {open
//           ? <XMarkIcon style={{ width: 20, height: 20, color: 'var(--color-primary)' }} />
//           : <img src="/logoSmartxAI.png" alt="AI" style={{ width: 30, height: 30, objectFit: 'contain', filter: 'brightness(10)' }} />
//         }
//         {!open && assistantCount > 0 && (
//           <div style={{
//             position: 'absolute', top: 0, right: 0,
//             width: 16, height: 16, borderRadius: '50%',
//             background: '#ef4444', border: '2px solid white',
//             fontSize: 8, color: 'white', fontWeight: 700,
//             display: 'flex', alignItems: 'center', justifyContent: 'center',
//           }}>
//             {assistantCount}
//           </div>
//         )}
//       </button>

//       {/* ── Drawer ── */}
//       {open && (
//         <div
//           className="aifb-drawer bg-white dark:bg-gray-900"
//           style={{
//             position: 'fixed', bottom: 88, right: 12, left: 12,
//             width: 'auto', maxWidth: 368, marginLeft: 'auto',
//             height: 'min(540px, calc(100dvh - 120px))',
//             borderRadius: 16, zIndex: 9997,
//             display: 'flex', flexDirection: 'column', overflow: 'hidden',
//             boxShadow: '0 20px 60px rgba(0,0,0,0.15), 0 4px 12px rgba(0,0,0,0.08)',
//             fontFamily: 'inherit',
//           }}
//         >
//           {/* Barra colorida no topo */}
//           <div style={{ height: 3, background: 'linear-gradient(90deg, var(--color-primary), var(--color-primary-dark, var(--color-primary)))', flexShrink: 0 }} />

//           {/* Header */}
//           <div
//             className="bg-white dark:bg-gray-900"
//             style={{ padding: '12px 16px', borderBottom: '1px solid #f3f4f6', flexShrink: 0 }}
//           >
//             <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
//               <div
//                 style={{
//                   width: 34, height: 34, borderRadius: 10,
//                   background: 'color-mix(in srgb, var(--color-primary) 10%, transparent)',
//                   border: '1.5px solid color-mix(in srgb, var(--color-primary) 25%, transparent)',
//                   display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
//                 }}
//               >
//                 <img src="/logoSmartxAI.png" alt="AI" style={{ width: 22, height: 22, objectFit: 'contain' }} />
//               </div>
//               <div style={{ flex: 1, minWidth: 0 }}>
//                 <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-primary)', letterSpacing: '-0.01em' }}>
//                   SmartX AI
//                 </p>
//                 <p className="text-gray-400 dark:text-gray-500" style={{ fontSize: 10, marginTop: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
//                   {ctx.title}
//                 </p>
//               </div>
//               <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
//                 <div style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '3px 8px', borderRadius: 20, background: 'color-mix(in srgb, var(--color-primary) 10%, transparent)' }}>
//                   <div style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--color-primary)', animation: 'aifb-pulse 2s infinite' }} />
//                   <span style={{ fontSize: 9, color: 'var(--color-primary)', fontWeight: 600, letterSpacing: '0.05em' }}>ONLINE</span>
//                 </div>
//               </div>
//             </div>

//             {/* Toggle contexto */}
//             <button
//               onClick={() => setShowContext(v => !v)}
//               className="text-gray-400 hover:text-gray-600 dark:text-gray-600 dark:hover:text-gray-400"
//               style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 4, background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', padding: 0, fontSize: 10 }}
//             >
//               <ChevronDownIcon style={{ width: 10, height: 10, transition: 'transform 0.2s', transform: showContext ? 'rotate(180deg)' : 'none' }} />
//               Ver contexto da tela
//             </button>

//             {showContext && (
//               <div
//                 className="dark:bg-gray-800 dark:border-gray-700"
//                 style={{ marginTop: 8, padding: '9px 12px', background: '#f9fafb', border: '1px solid #f3f4f6', borderRadius: 8 }}
//               >
//                 <p className="text-gray-600 dark:text-gray-400" style={{ fontSize: 10, lineHeight: 1.6 }}>{ctx.description}</p>
//                 {ctx.metrics.length > 0 && (
//                   <div style={{ marginTop: 6, display: 'flex', flexWrap: 'wrap', gap: 4 }}>
//                     {ctx.metrics.map(m => (
//                       <span key={m} style={{ fontSize: 9, color: 'var(--color-primary)', background: 'color-mix(in srgb, var(--color-primary) 8%, transparent)', border: '1px solid color-mix(in srgb, var(--color-primary) 20%, transparent)', borderRadius: 4, padding: '2px 7px' }}>
//                         {m}
//                       </span>
//                     ))}
//                   </div>
//                 )}
//                 {ctx.howToRead && (
//                   <p className="text-gray-400 dark:text-gray-500" style={{ fontSize: 9.5, lineHeight: 1.5, marginTop: 6, fontStyle: 'italic' }}>
//                     💡 {ctx.howToRead}
//                   </p>
//                 )}
//               </div>
//             )}
//           </div>

//           {/* Messages */}
//           <div
//             className="dark:bg-gray-900"
//             style={{ flex: 1, overflowY: 'auto', padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 10, scrollbarWidth: 'thin' }}
//           >
//             {/* Empty state — sugestões */}
//             {messages.length === 0 && (
//               <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
//                 <p className="text-gray-400 dark:text-gray-600" style={{ fontSize: 10, letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: 4 }}>
//                   Perguntas sobre esta tela
//                 </p>
//                 {ctx.suggestions.map((s, i) => (
//                   <button key={i} className="aifb-suggestion" onClick={() => handleSuggestion(s)} disabled={loading}>
//                     {s}
//                   </button>
//                 ))}
//                 {ctx.commonQuestions.length > 0 && (
//                   <>
//                     <p className="text-gray-400 dark:text-gray-600" style={{ fontSize: 10, letterSpacing: '0.05em', textTransform: 'uppercase', marginTop: 6, marginBottom: 4 }}>
//                       Dúvidas frequentes
//                     </p>
//                     {ctx.commonQuestions.map((q, i) => (
//                       <button key={i} className="aifb-suggestion" onClick={() => handleSuggestion(q)} disabled={loading}>
//                         {q}
//                       </button>
//                     ))}
//                   </>
//                 )}
//               </div>
//             )}

//             {/* Mensagens */}
//             {messages.map((msg, i) => {
//               const isThisStreaming = isStreaming && i === messages.length - 1
//               return (
//                 <div key={i} className="aifb-msg" style={{ display: 'flex', gap: 8, justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
//                   {msg.role === 'assistant' && (
//                     <div style={{ width: 24, height: 24, borderRadius: 8, background: 'color-mix(in srgb, var(--color-primary) 10%, transparent)', border: '1px solid color-mix(in srgb, var(--color-primary) 20%, transparent)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2 }}>
//                       <img src="/logoSmartxAI.png" alt="AI" style={{ width: 15, height: 15, objectFit: 'contain' }} />
//                     </div>
//                   )}
//                   <div
//                     className={msg.role === 'user' ? 'dark:bg-opacity-20' : 'bg-gray-50 dark:bg-gray-800'}
//                     style={{
//                       maxWidth: '84%', padding: '9px 12px', borderRadius: 10,
//                       ...(msg.role === 'user'
//                         ? { background: 'color-mix(in srgb, var(--color-primary) 12%, transparent)', border: '1px solid color-mix(in srgb, var(--color-primary) 25%, transparent)', borderTopRightRadius: 3 }
//                         : { border: '1px solid #f3f4f6', borderTopLeftRadius: 3 }
//                       )
//                     }}
//                   >
//                     {msg.role === 'user'
//                       ? <p style={{ fontSize: 11, color: 'var(--color-primary-dark, var(--color-primary))', lineHeight: 1.6, fontWeight: 500 }}>{msg.content}</p>
//                       : msg.content === '' && isThisStreaming
//                         ? <p style={{ fontSize: 10 }}><Cursor /></p>
//                         : <Markdown text={msg.content} streaming={isThisStreaming} />
//                     }
//                   </div>
//                 </div>
//               )
//             })}

//             {/* Loading dots */}
//             {loading && !isStreaming && (
//               <div className="aifb-msg" style={{ display: 'flex', gap: 8 }}>
//                 <div style={{ width: 24, height: 24, borderRadius: 8, background: 'color-mix(in srgb, var(--color-primary) 10%, transparent)', border: '1px solid color-mix(in srgb, var(--color-primary) 20%, transparent)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
//                   <img src="/logoSmartxAI.png" alt="AI" style={{ width: 15, height: 15, objectFit: 'contain' }} />
//                 </div>
//                 <div className="bg-gray-50 dark:bg-gray-800" style={{ padding: '10px 14px', border: '1px solid #f3f4f6', borderRadius: 10, borderTopLeftRadius: 3 }}>
//                   <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
//                     {[0, 150, 300].map(d => (
//                       <div key={d} style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--color-primary)', opacity: 0.6, animation: `aifb-blink 1s ${d}ms step-end infinite` }} />
//                     ))}
//                   </div>
//                 </div>
//               </div>
//             )}

//             {error && (
//               <p style={{ fontSize: 10, color: '#ef4444', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, padding: '8px 12px' }}>
//                 ✕ {error}
//               </p>
//             )}

//             {/* Tags de contexto usado */}
//             {contextUsed.length > 0 && !loading && (
//               <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
//                 {contextUsed.map(c => (
//                   <span key={c} style={{ fontSize: 9, color: 'var(--color-primary)', background: 'color-mix(in srgb, var(--color-primary) 8%, transparent)', border: '1px solid color-mix(in srgb, var(--color-primary) 20%, transparent)', borderRadius: 4, padding: '2px 8px', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
//                     ◈ {c}
//                   </span>
//                 ))}
//               </div>
//             )}

//             <div ref={messagesEndRef} />
//           </div>

//           {/* Input */}
//           <div
//             className="bg-white dark:bg-gray-900"
//             style={{ padding: '10px 14px', borderTop: '1px solid #f3f4f6', flexShrink: 0 }}
//           >
//             {messages.length > 0 && (
//               <button
//                 onClick={clearMessages}
//                 className="text-gray-400 hover:text-gray-600 dark:text-gray-600 dark:hover:text-gray-400"
//                 style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 8, background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: 10 }}
//               >
//                 <TrashIcon style={{ width: 11, height: 11 }} />
//                 Limpar conversa
//               </button>
//             )}
//             <div
//               className="aifb-input-wrap dark:bg-gray-800 dark:border-gray-700"
//               style={{ display: 'flex', gap: 8, alignItems: 'flex-end', border: '1.5px solid #e5e7eb', borderRadius: 10, padding: '8px 12px', background: '#f9fafb', transition: 'border-color 0.2s' }}
//             >
//               <textarea
//                 ref={inputRef}
//                 value={input}
//                 onChange={e => setInput(e.target.value)}
//                 onKeyDown={handleKeyDown}
//                 placeholder={`Pergunte sobre ${ctx.title.toLowerCase()}...`}
//                 rows={1}
//                 className="dark:bg-transparent dark:text-gray-200 dark:placeholder-gray-600"
//                 style={{ flex: 1, resize: 'none', background: 'transparent', border: 'none', outline: 'none', color: '#111827', fontFamily: 'inherit', fontSize: 11, lineHeight: 1.6, maxHeight: 72 }}
//               />
//               <button
//                 onClick={handleSend}
//                 disabled={!input.trim() || loading}
//                 style={{ width: 30, height: 30, borderRadius: 8, background: 'var(--color-primary)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, opacity: (!input.trim() || loading) ? 0.4 : 1, transition: 'opacity 0.15s' }}
//               >
//                 {loading
//                   ? <ArrowPathIcon style={{ width: 13, height: 13, color: 'white', animation: 'spin 1s linear infinite' }} />
//                   : <PaperAirplaneIcon style={{ width: 13, height: 13, color: 'white' }} />
//                 }
//               </button>
//             </div>
//             <p className="text-gray-300 dark:text-gray-700" style={{ fontSize: 9, marginTop: 5 }}>
//               Enter para enviar · Shift+Enter nova linha
//             </p>
//           </div>
//         </div>
//       )}
//     </>
//   )
// }

// // ─── Helpers ──────────────────────────────────────────────────────

// function getDataTopicsFromDomain(domain: string): string[] {
//   const map: Record<string, string[]> = {
//     certificates: ['certificates'],
//     assets:       ['assets'],
//     temperature:  ['temperature'],
//     boundary:     ['boundary'],
//     alerts:       ['alerts'],
//     people:       ['boundary', 'alerts'],
//     gps:          ['boundary'],
//     risk:         ['alerts', 'temperature'],
//     logistics:    ['assets'],
//     geral:        ['certificates', 'assets', 'alerts'],
//     ai:           ['certificates', 'assets', 'temperature', 'boundary', 'alerts'],
//   }
//   return map[domain] || ['certificates', 'assets', 'alerts']
// }

// function buildSystemKnowledge(ctx: ReturnType<typeof getPageContext>): string {
//   const parts: string[] = [ctx.description]
//   if (ctx.metrics.length > 0)
//     parts.push(`\nMétricas exibidas: ${ctx.metrics.join(', ')}.`)
//   if (ctx.howToRead)
//     parts.push(`\nComo interpretar: ${ctx.howToRead}`)
//   if (ctx.commonQuestions.length > 0)
//     parts.push(`\nDúvidas frequentes: ${ctx.commonQuestions.join(' | ')}`)
//   return parts.join('\n')
// }


// src/components/AI/AIFloatingButton.tsx
// Botão flutuante global com cores dinâmicas do tema da empresa.
// Adicione <AIFloatingButton /> no Layout.tsx para aparecer em todas as páginas.

import { useState, useRef, useEffect, useCallback } from 'react'
import { useLocation } from 'react-router-dom'
import { useCompany } from '../../hooks/useCompany'
import { getPageContext } from '../../config/aiPageContext'
import {
  XMarkIcon,
  PaperAirplaneIcon,
  ArrowPathIcon,
  TrashIcon,
  ChevronDownIcon,
} from '@heroicons/react/24/outline'

const API_BASE_URL = 'https://apinode.smartxhub.cloud/api'
const TYPEWRITER_SPEED_MS = 16

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

// ─── Cursor piscando ──────────────────────────────────────────────
function Cursor() {
  return (
    <span
      className="inline-block w-[2px] h-[12px] ml-[2px] align-middle rounded-sm"
      style={{ background: 'var(--color-primary)', animation: 'aifb-blink 0.9s step-end infinite' }}
    />
  )
}

// ─── Renderiza markdown ───────────────────────────────────────────
function Markdown({ text, streaming = false }: { text: string; streaming?: boolean }) {
  const lines = text.split('\n')
  return (
    <>
      {lines.map((line, i) => {
        const isLast = i === lines.length - 1
        const cursor = isLast && streaming ? <Cursor /> : null
        if (line.startsWith('## ')) return (
          <p key={i} style={{ fontSize: 10.5, fontWeight: 700, color: 'var(--color-primary)', margin: '8px 0 3px', letterSpacing: '0.03em' }}>
            {line.slice(3)}{cursor}
          </p>
        )
        if (line.startsWith('### ')) return (
          <p key={i} style={{ fontSize: 10.5, fontWeight: 600, color: '#1a1a2e', margin: '4px 0 2px' }}
            className="dark:text-gray-100">
            {line.slice(4)}{cursor}
          </p>
        )
        if (line.match(/^\*\*(.+)\*\*$/)) return (
          <p key={i} style={{ fontSize: 10.5, fontWeight: 600, color: '#1a1a2e' }}
            className="dark:text-gray-100">
            {line.replace(/\*\*/g, '')}{cursor}
          </p>
        )
        if (line.match(/^(\d+\.|-|•)\s/)) return (
          <p key={i} style={{ fontSize: 10.5, color: '#374151', lineHeight: 1.6, display: 'flex', gap: 5 }}
            className="dark:text-gray-300">
            <span style={{ color: 'var(--color-primary)', flexShrink: 0 }}>›</span>
            {line.replace(/^(\d+\.|-|•)\s/, '')}{cursor}
          </p>
        )
        if (line.trim() === '') return <div key={i} style={{ height: 5 }} />
        return (
          <p key={i} style={{ fontSize: 10.5, color: '#374151', lineHeight: 1.7 }}
            className="dark:text-gray-300">
            {line}{cursor}
          </p>
        )
      })}
    </>
  )
}

// ─── Componente principal ─────────────────────────────────────────
export default function AIFloatingButton() {
  const location = useLocation()
  const { companyId } = useCompany()
  const [open, setOpen] = useState(false)
  const [input, setInput] = useState('')
  const [showContext, setShowContext] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [contextUsed, setContextUsed] = useState<string[]>([])
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  const bufferRef = useRef('')
  const displayedRef = useRef('')
  const typewriterRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const streamingRef = useRef(false)

  const id = companyId || 1
  const ctx = getPageContext(location.pathname)
  const lastMsg = messages[messages.length - 1]

  // Páginas onde o botão flutuante não deve aparecer
  const HIDDEN_ROUTES = ['/', '/analytics/ai', '/login', '/register']
  if (HIDDEN_ROUTES.includes(location.pathname)) return null
  const isStreaming = loading && lastMsg?.role === 'assistant'
  const assistantCount = messages.filter(m => m.role === 'assistant').length

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 100)
  }, [open])

  useEffect(() => {
    clearMessages()
    setShowContext(false)
  }, [location.pathname])

  const startTypewriter = useCallback(() => {
    if (typewriterRef.current) return
    typewriterRef.current = setInterval(() => {
      const buf = bufferRef.current
      const disp = displayedRef.current
      if (disp.length < buf.length) {
        const next = buf.slice(0, disp.length + 1)
        displayedRef.current = next
        setMessages(prev => {
          const updated = [...prev]
          updated[updated.length - 1] = { role: 'assistant', content: next }
          return updated
        })
      } else if (!streamingRef.current) {
        clearInterval(typewriterRef.current!)
        typewriterRef.current = null
      }
    }, TYPEWRITER_SPEED_MS)
  }, [])

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim() || loading) return

    const userMsg: ChatMessage = { role: 'user', content }
    const updatedMessages = [...messages, userMsg]
    setMessages(updatedMessages)
    setLoading(true)
    setError(null)

    bufferRef.current = ''
    displayedRef.current = ''
    streamingRef.current = true
    if (typewriterRef.current) { clearInterval(typewriterRef.current); typewriterRef.current = null }

    setMessages(prev => [...prev, { role: 'assistant', content: '' }])

    try {
      const response = await fetch(`${API_BASE_URL}/dashboard/ai/context-chat-stream`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyId: id,
          messages: updatedMessages,
          pageContext: {
            route: location.pathname,
            pageName: ctx.title,
            domain: ctx.domain,
            description: ctx.description,
            dataTopics: getDataTopicsFromDomain(ctx.domain),
            systemKnowledge: buildSystemKnowledge(ctx),
          },
        }),
      })

      if (!response.ok) throw new Error(`HTTP ${response.status}`)
      if (!response.body) throw new Error('Stream não disponível')

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      startTypewriter()

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const text = decoder.decode(value, { stream: true })
        for (const line of text.split('\n').filter(l => l.startsWith('data: '))) {
          try {
            const data = JSON.parse(line.replace('data: ', ''))
            if (data.chunk) bufferRef.current += data.chunk
            if (data.done) setContextUsed(data.contextUsed || [])
            if (data.error) setError('Erro ao processar resposta da IA.')
          } catch { }
        }
      }
    } catch (err: any) {
      setMessages(prev => prev.slice(0, -1))
      setError('Erro ao conectar com a IA.')
      console.error('[AIFloating] Erro:', err)
    } finally {
      streamingRef.current = false
      setLoading(false)
    }
  }, [messages, loading, id, location.pathname, ctx, startTypewriter])

  const clearMessages = useCallback(() => {
    if (typewriterRef.current) { clearInterval(typewriterRef.current); typewriterRef.current = null }
    bufferRef.current = ''; displayedRef.current = ''; streamingRef.current = false
    setMessages([]); setContextUsed([]); setError(null)
  }, [])

  const handleSend = useCallback(async () => {
    if (!input.trim() || loading) return
    const text = input
    setInput('')
    await sendMessage(text)
  }, [input, loading, sendMessage])

  const handleSuggestion = useCallback(async (text: string) => {
    await sendMessage(text)
  }, [sendMessage])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() }
  }

  return (
    <>
      <style>{`
        @keyframes aifb-blink { 0%,100%{opacity:1} 50%{opacity:0} }
        @keyframes aifb-fade { from{opacity:0;transform:translateY(5px)} to{opacity:1;transform:translateY(0)} }
        @keyframes aifb-slide { from{opacity:0;transform:translateY(16px) scale(0.97)} to{opacity:1;transform:translateY(0) scale(1)} }
        @keyframes aifb-pulse { 0%{box-shadow:0 0 0 0 color-mix(in srgb, var(--color-primary) 45%, transparent)} 70%{box-shadow:0 0 0 10px transparent} 100%{box-shadow:0 0 0 0 transparent} }
        @keyframes spin { to{transform:rotate(360deg)} }
        .aifb-msg { animation: aifb-fade 0.2s ease forwards; }
        .aifb-drawer { animation: aifb-slide 0.25s cubic-bezier(0.34,1.4,0.64,1) forwards; }
        .aifb-suggestion {
          text-align: left; font-size: 10px; color: #6b7280;
          padding: 7px 11px; background: transparent;
          border: 1px solid #e5e7eb; border-radius: 6px;
          cursor: pointer; font-family: inherit; transition: all 0.15s; width: 100%;
        }
        .aifb-suggestion:hover {
          color: var(--color-primary);
          border-color: var(--color-primary);
          background: color-mix(in srgb, var(--color-primary) 6%, transparent);
        }
        .aifb-input-wrap:focus-within {
          border-color: var(--color-primary) !important;
        }
        .dark .aifb-suggestion { color: #9ca3af; border-color: #374151; }
        .dark .aifb-suggestion:hover { color: var(--color-primary); border-color: var(--color-primary); }
      `}</style>

      {/* ── Botão flutuante ── */}
      <button
        onClick={() => setOpen(v => !v)}
        title="Perguntar à IA sobre esta tela"
        style={{
          position: 'fixed', bottom: 20, right: 16,
          width: 52, height: 52, borderRadius: '50%',
          background: open
            ? 'white'
            : 'var(--color-primary)',
          border: `2px solid ${open ? 'var(--color-primary)' : 'transparent'}`,
          cursor: 'pointer', zIndex: 9998,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'all 0.2s',
          animation: !open ? 'aifb-pulse 3s infinite' : 'none',
          boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
        }}
      >
        {open
          ? <XMarkIcon style={{ width: 20, height: 20, color: 'var(--color-primary)' }} />
          : <img src="/logoSmartxAI.png" alt="AI" style={{ width: 30, height: 30, objectFit: 'contain', filter: 'brightness(10)' }} />
        }
        {!open && assistantCount > 0 && (
          <div style={{
            position: 'absolute', top: 0, right: 0,
            width: 16, height: 16, borderRadius: '50%',
            background: '#ef4444', border: '2px solid white',
            fontSize: 8, color: 'white', fontWeight: 700,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            {assistantCount}
          </div>
        )}
      </button>

      {/* ── Drawer ── */}
      {open && (
        <div
          className="aifb-drawer bg-white dark:bg-gray-900"
          style={{
            position: 'fixed', bottom: 88, right: 12, left: 12,
            width: 'auto', maxWidth: 368, marginLeft: 'auto',
            height: 'min(540px, calc(100dvh - 120px))',
            borderRadius: 16, zIndex: 9997,
            display: 'flex', flexDirection: 'column', overflow: 'hidden',
            boxShadow: '0 20px 60px rgba(0,0,0,0.15), 0 4px 12px rgba(0,0,0,0.08)',
            fontFamily: 'inherit',
          }}
        >
          {/* Barra colorida no topo */}
          <div style={{ height: 3, background: 'linear-gradient(90deg, var(--color-primary), var(--color-primary-dark, var(--color-primary)))', flexShrink: 0 }} />

          {/* Header */}
          <div
            className="bg-white dark:bg-gray-900"
            style={{ padding: '12px 16px', borderBottom: '1px solid #f3f4f6', flexShrink: 0 }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div
                style={{
                  width: 34, height: 34, borderRadius: 10,
                  background: 'color-mix(in srgb, var(--color-primary) 10%, transparent)',
                  border: '1.5px solid color-mix(in srgb, var(--color-primary) 25%, transparent)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }}
              >
                <img src="/logoSmartxAI.png" alt="AI" style={{ width: 22, height: 22, objectFit: 'contain' }} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-primary)', letterSpacing: '-0.01em' }}>
                  SmartX AI
                </p>
                <p className="text-gray-400 dark:text-gray-500" style={{ fontSize: 10, marginTop: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {ctx.title}
                </p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '3px 8px', borderRadius: 20, background: 'color-mix(in srgb, var(--color-primary) 10%, transparent)' }}>
                  <div style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--color-primary)', animation: 'aifb-pulse 2s infinite' }} />
                  <span style={{ fontSize: 9, color: 'var(--color-primary)', fontWeight: 600, letterSpacing: '0.05em' }}>ONLINE</span>
                </div>
              </div>
            </div>

            {/* Toggle contexto */}
            <button
              onClick={() => setShowContext(v => !v)}
              className="text-gray-400 hover:text-gray-600 dark:text-gray-600 dark:hover:text-gray-400"
              style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 4, background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', padding: 0, fontSize: 10 }}
            >
              <ChevronDownIcon style={{ width: 10, height: 10, transition: 'transform 0.2s', transform: showContext ? 'rotate(180deg)' : 'none' }} />
              Ver contexto da tela
            </button>

            {showContext && (
              <div
                className="dark:bg-gray-800 dark:border-gray-700"
                style={{ marginTop: 8, padding: '9px 12px', background: '#f9fafb', border: '1px solid #f3f4f6', borderRadius: 8 }}
              >
                <p className="text-gray-600 dark:text-gray-400" style={{ fontSize: 10, lineHeight: 1.6 }}>{ctx.description}</p>
                {ctx.metrics.length > 0 && (
                  <div style={{ marginTop: 6, display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                    {ctx.metrics.map(m => (
                      <span key={m} style={{ fontSize: 9, color: 'var(--color-primary)', background: 'color-mix(in srgb, var(--color-primary) 8%, transparent)', border: '1px solid color-mix(in srgb, var(--color-primary) 20%, transparent)', borderRadius: 4, padding: '2px 7px' }}>
                        {m}
                      </span>
                    ))}
                  </div>
                )}
                {ctx.howToRead && (
                  <p className="text-gray-400 dark:text-gray-500" style={{ fontSize: 9.5, lineHeight: 1.5, marginTop: 6, fontStyle: 'italic' }}>
                    💡 {ctx.howToRead}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Messages */}
          <div
            className="dark:bg-gray-900"
            style={{ flex: 1, overflowY: 'auto', padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 10, scrollbarWidth: 'thin' }}
          >
            {/* Empty state — sugestões */}
            {messages.length === 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                <p className="text-gray-400 dark:text-gray-600" style={{ fontSize: 10, letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: 4 }}>
                  Perguntas sobre esta tela
                </p>
                {ctx.suggestions.map((s, i) => (
                  <button key={i} className="aifb-suggestion" onClick={() => handleSuggestion(s)} disabled={loading}>
                    {s}
                  </button>
                ))}
                {ctx.commonQuestions.length > 0 && (
                  <>
                    <p className="text-gray-400 dark:text-gray-600" style={{ fontSize: 10, letterSpacing: '0.05em', textTransform: 'uppercase', marginTop: 6, marginBottom: 4 }}>
                      Dúvidas frequentes
                    </p>
                    {ctx.commonQuestions.map((q, i) => (
                      <button key={i} className="aifb-suggestion" onClick={() => handleSuggestion(q)} disabled={loading}>
                        {q}
                      </button>
                    ))}
                  </>
                )}
              </div>
            )}

            {/* Mensagens */}
            {messages.map((msg, i) => {
              const isThisStreaming = isStreaming && i === messages.length - 1
              return (
                <div key={i} className="aifb-msg" style={{ display: 'flex', gap: 8, justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
                  {msg.role === 'assistant' && (
                    <div style={{ width: 24, height: 24, borderRadius: 8, background: 'color-mix(in srgb, var(--color-primary) 10%, transparent)', border: '1px solid color-mix(in srgb, var(--color-primary) 20%, transparent)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2 }}>
                      <img src="/logoSmartxAI.png" alt="AI" style={{ width: 15, height: 15, objectFit: 'contain' }} />
                    </div>
                  )}
                  <div
                    className={msg.role === 'user' ? 'dark:bg-opacity-20' : 'bg-gray-50 dark:bg-gray-800'}
                    style={{
                      maxWidth: '84%', padding: '9px 12px', borderRadius: 10,
                      ...(msg.role === 'user'
                        ? { background: 'color-mix(in srgb, var(--color-primary) 12%, transparent)', border: '1px solid color-mix(in srgb, var(--color-primary) 25%, transparent)', borderTopRightRadius: 3 }
                        : { border: '1px solid #f3f4f6', borderTopLeftRadius: 3 }
                      )
                    }}
                  >
                    {msg.role === 'user'
                      ? <p style={{ fontSize: 11, color: 'var(--color-primary-dark, var(--color-primary))', lineHeight: 1.6, fontWeight: 500 }}>{msg.content}</p>
                      : msg.content === '' && isThisStreaming
                        ? <p style={{ fontSize: 10 }}><Cursor /></p>
                        : <Markdown text={msg.content} streaming={isThisStreaming} />
                    }
                  </div>
                </div>
              )
            })}

            {/* Loading dots */}
            {loading && !isStreaming && (
              <div className="aifb-msg" style={{ display: 'flex', gap: 8 }}>
                <div style={{ width: 24, height: 24, borderRadius: 8, background: 'color-mix(in srgb, var(--color-primary) 10%, transparent)', border: '1px solid color-mix(in srgb, var(--color-primary) 20%, transparent)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <img src="/logoSmartxAI.png" alt="AI" style={{ width: 15, height: 15, objectFit: 'contain' }} />
                </div>
                <div className="bg-gray-50 dark:bg-gray-800" style={{ padding: '10px 14px', border: '1px solid #f3f4f6', borderRadius: 10, borderTopLeftRadius: 3 }}>
                  <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                    {[0, 150, 300].map(d => (
                      <div key={d} style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--color-primary)', opacity: 0.6, animation: `aifb-blink 1s ${d}ms step-end infinite` }} />
                    ))}
                  </div>
                </div>
              </div>
            )}

            {error && (
              <p style={{ fontSize: 10, color: '#ef4444', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, padding: '8px 12px' }}>
                ✕ {error}
              </p>
            )}

            {/* Tags de contexto usado */}
            {contextUsed.length > 0 && !loading && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                {contextUsed.map(c => (
                  <span key={c} style={{ fontSize: 9, color: 'var(--color-primary)', background: 'color-mix(in srgb, var(--color-primary) 8%, transparent)', border: '1px solid color-mix(in srgb, var(--color-primary) 20%, transparent)', borderRadius: 4, padding: '2px 8px', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                    ◈ {c}
                  </span>
                ))}
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div
            className="bg-white dark:bg-gray-900"
            style={{ padding: '10px 14px', borderTop: '1px solid #f3f4f6', flexShrink: 0 }}
          >
            {messages.length > 0 && (
              <button
                onClick={clearMessages}
                className="text-gray-400 hover:text-gray-600 dark:text-gray-600 dark:hover:text-gray-400"
                style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 8, background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: 10 }}
              >
                <TrashIcon style={{ width: 11, height: 11 }} />
                Limpar conversa
              </button>
            )}
            <div
              className="aifb-input-wrap dark:bg-gray-800 dark:border-gray-700"
              style={{ display: 'flex', gap: 8, alignItems: 'flex-end', border: '1.5px solid #e5e7eb', borderRadius: 10, padding: '8px 12px', background: '#f9fafb', transition: 'border-color 0.2s' }}
            >
              <textarea
                ref={inputRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={`Pergunte sobre ${ctx.title.toLowerCase()}...`}
                rows={1}
                className="dark:bg-transparent dark:text-gray-200 dark:placeholder-gray-600"
                style={{ flex: 1, resize: 'none', background: 'transparent', border: 'none', outline: 'none', color: '#111827', fontFamily: 'inherit', fontSize: 11, lineHeight: 1.6, maxHeight: 72 }}
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || loading}
                style={{ width: 30, height: 30, borderRadius: 8, background: 'var(--color-primary)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, opacity: (!input.trim() || loading) ? 0.4 : 1, transition: 'opacity 0.15s' }}
              >
                {loading
                  ? <ArrowPathIcon style={{ width: 13, height: 13, color: 'white', animation: 'spin 1s linear infinite' }} />
                  : <PaperAirplaneIcon style={{ width: 13, height: 13, color: 'white' }} />
                }
              </button>
            </div>
            <p className="text-gray-300 dark:text-gray-700" style={{ fontSize: 9, marginTop: 5 }}>
              Enter para enviar · Shift+Enter nova linha
            </p>
          </div>
        </div>
      )}
    </>
  )
}

// ─── Helpers ──────────────────────────────────────────────────────

function getDataTopicsFromDomain(domain: string): string[] {
  const map: Record<string, string[]> = {
    certificates: ['certificates'],
    assets:       ['assets'],
    temperature:  ['temperature'],
    boundary:     ['boundary'],
    alerts:       ['alerts'],
    people:       ['boundary', 'alerts'],
    gps:          ['boundary'],
    risk:         ['alerts', 'temperature'],
    logistics:    ['assets'],
    geral:        ['certificates', 'assets', 'alerts'],
    ai:           ['certificates', 'assets', 'temperature', 'boundary', 'alerts'],
  }
  return map[domain] || ['certificates', 'assets', 'alerts']
}

function buildSystemKnowledge(ctx: ReturnType<typeof getPageContext>): string {
  const parts: string[] = [ctx.description]
  if (ctx.metrics.length > 0)
    parts.push(`\nMétricas exibidas: ${ctx.metrics.join(', ')}.`)
  if (ctx.howToRead)
    parts.push(`\nComo interpretar: ${ctx.howToRead}`)
  if (ctx.commonQuestions.length > 0)
    parts.push(`\nDúvidas frequentes: ${ctx.commonQuestions.join(' | ')}`)
  return parts.join('\n')
}