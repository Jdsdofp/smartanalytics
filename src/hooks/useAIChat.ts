// src/hooks/useAIChat.ts
import { useState, useCallback } from 'react'
import axios from 'axios'

const API_BASE_URL = 'https://apinode.smartxhub.cloud/api'

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

export interface SmartChatResponse {
  success: boolean
  message: string
  contextUsed: string[]
  model: string
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

  const sendMessage = useCallback(async (content: string, model?: string) => {
    if (!content.trim() || loading) return

    const userMessage: ChatMessage = { role: 'user', content }
    const updatedMessages = [...messages, userMessage]
    setMessages(updatedMessages)
    setLoading(true)
    setError(null)

    try {
      const { data } = await axios.post<SmartChatResponse>(
        `${API_BASE_URL}/dashboard/ai/smart-chat`,
        { companyId, messages: updatedMessages, model }
      )

      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: data.message,
      }

      setMessages(prev => [...prev, assistantMessage])
      setContextUsed(data.contextUsed || [])
    } catch (err: any) {
      setError('Erro ao conectar com a IA. Tente novamente.')
      console.error('[useAIChat] Erro:', err)
    } finally {
      setLoading(false)
    }
  }, [messages, loading, companyId])

  const clearMessages = useCallback(() => {
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
        { companyId, topic, extraContext, model }
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
