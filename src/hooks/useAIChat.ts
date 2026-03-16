// // src/hooks/useAIChat.ts
// import { useState, useCallback } from 'react'
// import axios from 'axios'

// const API_BASE_URL = 'https://apinode.smartxhub.cloud/api'

// export interface ChatMessage {
//   role: 'user' | 'assistant'
//   content: string
// }

// export interface AnalyticsReportResponse {
//   success: boolean
//   topic: string
//   companyId: number
//   data: Record<string, any>
//   report: string
//   generatedAt: string
// }

// export type ReportTopic = 'certificates' | 'assets' | 'temperature' | 'boundary' | 'alerts'

// const TOPIC_LABELS: Record<ReportTopic, string> = {
//   certificates: 'Certificados',
//   assets: 'Ativos',
//   temperature: 'Temperatura',
//   boundary: 'Movimentação',
//   alerts: 'Alertas',
// }

// const TOPIC_ICONS: Record<ReportTopic, string> = {
//   certificates: '📄',
//   assets: '🏭',
//   temperature: '🌡️',
//   boundary: '📍',
//   alerts: '🚨',
// }

// // ─────────────────────────────────────────────
// // useAIChat — chat com streaming SSE
// // Resolve timeout do Stackhero enviando chunks em tempo real
// // ─────────────────────────────────────────────

// export function useAIChat(companyId: number) {
//   const [messages, setMessages] = useState<ChatMessage[]>([])
//   const [loading, setLoading] = useState(false)
//   const [error, setError] = useState<string | null>(null)
//   const [contextUsed, setContextUsed] = useState<string[]>([])

//   const sendMessage = useCallback(async (content: string, model?: string) => {
//     if (!content.trim() || loading) return

//     const userMessage: ChatMessage = { role: 'user', content }
//     const updatedMessages = [...messages, userMessage]
//     setMessages(updatedMessages)
//     setLoading(true)
//     setError(null)

//     // Adiciona mensagem vazia do assistant que vai sendo preenchida em tempo real
//     setMessages(prev => [...prev, { role: 'assistant', content: '' }])

//     try {
//       const response = await fetch(
//         `${API_BASE_URL}/dashboard/ai/smart-chat-stream`,
//         {
//           method: 'POST',
//           headers: { 'Content-Type': 'application/json' },
//           body: JSON.stringify({ companyId, messages: updatedMessages, model }),
//         }
//       )

//       if (!response.ok) throw new Error(`HTTP ${response.status}`)
//       if (!response.body) throw new Error('Stream não disponível')

//       const reader = response.body.getReader()
//       const decoder = new TextDecoder()
//       let fullContent = ''

//       while (true) {
//         const { done, value } = await reader.read()
//         if (done) break

//         const text = decoder.decode(value, { stream: true })
//         const lines = text.split('\n').filter(l => l.startsWith('data: '))

//         for (const line of lines) {
//           try {
//             const data = JSON.parse(line.replace('data: ', ''))

//             if (data.chunk) {
//               fullContent += data.chunk
//               // Atualiza a última mensagem (assistant) em tempo real
//               setMessages(prev => {
//                 const updated = [...prev]
//                 updated[updated.length - 1] = { role: 'assistant', content: fullContent }
//                 return updated
//               })
//             }

//             if (data.done) {
//               setContextUsed(data.contextUsed || [])
//             }

//             if (data.error) {
//               setError('Erro ao processar resposta da IA.')
//             }
//           } catch {
//             // linha incompleta ou ping, ignora
//           }
//         }
//       }
//     } catch (err: any) {
//       setError('Erro ao conectar com a IA. Tente novamente.')
//       // Remove a mensagem vazia do assistant em caso de erro
//       setMessages(prev => prev.filter((_, i) => i !== prev.length - 1))
//       console.error('[useAIChat] Erro:', err)
//     } finally {
//       setLoading(false)
//     }
//   }, [messages, loading, companyId])

//   const clearMessages = useCallback(() => {
//     setMessages([])
//     setContextUsed([])
//     setError(null)
//   }, [])

//   return { messages, loading, error, contextUsed, sendMessage, clearMessages }
// }

// // ─────────────────────────────────────────────
// // useAnalyticsReport — relatório por tópico
// // ─────────────────────────────────────────────

// export function useAnalyticsReport(companyId: number) {
//   const [report, setReport] = useState<string | null>(null)
//   const [reportData, setReportData] = useState<Record<string, any> | null>(null)
//   const [loading, setLoading] = useState(false)
//   const [error, setError] = useState<string | null>(null)
//   const [currentTopic, setCurrentTopic] = useState<ReportTopic | null>(null)

//   const generateReport = useCallback(async (
//     topic: ReportTopic,
//     extraContext?: string,
//     model?: string
//   ) => {
//     setLoading(true)
//     setError(null)
//     setCurrentTopic(topic)

//     try {
//       const { data } = await axios.post<AnalyticsReportResponse>(
//         `${API_BASE_URL}/dashboard/ai/analytics-report`,
//         { companyId, topic, extraContext, model },
//         { timeout: 300000 } // 5 minutos
//       )
//       setReport(data.report)
//       setReportData(data.data)
//     } catch (err: any) {
//       setError('Erro ao gerar relatório. Tente novamente.')
//       console.error('[useAnalyticsReport] Erro:', err)
//     } finally {
//       setLoading(false)
//     }
//   }, [companyId])

//   const clearReport = useCallback(() => {
//     setReport(null)
//     setReportData(null)
//     setCurrentTopic(null)
//     setError(null)
//   }, [])

//   return {
//     report, reportData, loading, error, currentTopic,
//     generateReport, clearReport,
//     topicLabels: TOPIC_LABELS,
//     topicIcons: TOPIC_ICONS,
//   }
// }


// src/hooks/useAIChat.ts
import { useState, useCallback, useRef } from 'react'
import axios from 'axios'

const API_BASE_URL = 'https://apinode.smartxhub.cloud/api'

// ─────────────────────────────────────────────
// Velocidade do efeito de digitação
// Menor = mais rápido | Maior = mais lento
// ─────────────────────────────────────────────
const TYPEWRITER_SPEED_MS = 18 // ms por caractere

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

export interface AnalyticsReportResponse {
  success: boolean
  topic: string
  companyId: number
  data: Record<string, any>
  report: string
  generatedAt: string
}

export type ReportTopic = 'certificates' | 'assets' | 'temperature' | 'boundary' | 'alerts'

const TOPIC_LABELS: Record<ReportTopic, string> = {
  certificates: 'Certificados',
  assets: 'Ativos',
  temperature: 'Temperatura',
  boundary: 'Movimentação',
  alerts: 'Alertas',
}

const TOPIC_ICONS: Record<ReportTopic, string> = {
  certificates: '📄',
  assets: '🏭',
  temperature: '🌡️',
  boundary: '📍',
  alerts: '🚨',
}

export function useAIChat(companyId: number) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [contextUsed, setContextUsed] = useState<string[]>([])

  // Buffer de chunks recebidos do stream
  const bufferRef = useRef<string>('')
  // Conteúdo já renderizado na tela
  const displayedRef = useRef<string>('')
  // Controle do intervalo do typewriter
  const typewriterRef = useRef<ReturnType<typeof setInterval> | null>(null)
  // Flag: stream ainda recebendo chunks
  const streamingRef = useRef(false)

  const startTypewriter = useCallback(() => {
    if (typewriterRef.current) return

    typewriterRef.current = setInterval(() => {
      const buffer = bufferRef.current
      const displayed = displayedRef.current

      if (displayed.length < buffer.length) {
        const next = buffer.slice(0, displayed.length + 1)
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

  const sendMessage = useCallback(async (content: string, model?: string) => {
    if (!content.trim() || loading) return

    const userMessage: ChatMessage = { role: 'user', content }
    const updatedMessages = [...messages, userMessage]
    setMessages(updatedMessages)
    setLoading(true)
    setError(null)

    bufferRef.current = ''
    displayedRef.current = ''
    streamingRef.current = true
    if (typewriterRef.current) {
      clearInterval(typewriterRef.current)
      typewriterRef.current = null
    }

    setMessages(prev => [...prev, { role: 'assistant', content: '' }])

    try {
      const response = await fetch(
        `${API_BASE_URL}/dashboard/ai/smart-chat-stream`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ companyId, messages: updatedMessages, model }),
        }
      )

      if (!response.ok) throw new Error(`HTTP ${response.status}`)
      if (!response.body) throw new Error('Stream não disponível')

      const reader = response.body.getReader()
      const decoder = new TextDecoder()

      startTypewriter()

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const text = decoder.decode(value, { stream: true })
        const lines = text.split('\n').filter(l => l.startsWith('data: '))

        for (const line of lines) {
          try {
            const data = JSON.parse(line.replace('data: ', ''))
            if (data.chunk) bufferRef.current += data.chunk
            if (data.done) setContextUsed(data.contextUsed || [])
            if (data.error) setError('Erro ao processar resposta da IA.')
          } catch { }
        }
      }
    } catch (err: any) {
      setError('Erro ao conectar com a IA. Tente novamente.')
      setMessages(prev => prev.slice(0, -1))
      console.error('[useAIChat] Erro:', err)
    } finally {
      streamingRef.current = false
      setLoading(false)
    }
  }, [messages, loading, companyId, startTypewriter])

  const clearMessages = useCallback(() => {
    if (typewriterRef.current) {
      clearInterval(typewriterRef.current)
      typewriterRef.current = null
    }
    bufferRef.current = ''
    displayedRef.current = ''
    streamingRef.current = false
    setMessages([])
    setContextUsed([])
    setError(null)
  }, [])

  return { messages, loading, error, contextUsed, sendMessage, clearMessages }
}

export function useAnalyticsReport(companyId: number) {
  const [report, setReport] = useState<string | null>(null)
  const [reportData, setReportData] = useState<Record<string, any> | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currentTopic, setCurrentTopic] = useState<ReportTopic | null>(null)

  const generateReport = useCallback(async (
    topic: ReportTopic,
    extraContext?: string,
    model?: string
  ) => {
    setLoading(true)
    setError(null)
    setCurrentTopic(topic)

    try {
      const { data } = await axios.post<AnalyticsReportResponse>(
        `${API_BASE_URL}/dashboard/ai/analytics-report`,
        { companyId, topic, extraContext, model },
        { timeout: 300000 }
      )
      setReport(data.report)
      setReportData(data.data)
    } catch (err: any) {
      setError('Erro ao gerar relatório. Tente novamente.')
      console.error('[useAnalyticsReport] Erro:', err)
    } finally {
      setLoading(false)
    }
  }, [companyId])

  const clearReport = useCallback(() => {
    setReport(null)
    setReportData(null)
    setCurrentTopic(null)
    setError(null)
  }, [])

  return {
    report, reportData, loading, error, currentTopic,
    generateReport, clearReport,
    topicLabels: TOPIC_LABELS,
    topicIcons: TOPIC_ICONS,
  }
}