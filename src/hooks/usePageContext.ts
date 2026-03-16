// src/hooks/usePageContext.ts
// Detecta a rota atual e retorna contexto rico sobre a página
// para que a IA saiba onde o usuário está e o que está vendo.

import { useLocation } from 'react-router-dom'

export interface PageContext {
  route: string
  pageName: string
  domain: string
  description: string
  dataTopics: string[]        // domínios de dados relevantes para a página
  suggestedQuestions: string[] // sugestões de perguntas para aquela tela
  systemKnowledge: string      // conhecimento do sistema sobre aquela funcionalidade
}

// ─────────────────────────────────────────────
// Mapeamento completo de rotas → contexto
// ─────────────────────────────────────────────
const PAGE_CONTEXTS: Record<string, Omit<PageContext, 'route'>> = {

  // ── Dashboard principal ──────────────────────────────────────────
  '/': {
    pageName: 'Dashboard Principal',
    domain: 'geral',
    description: 'Visão geral do sistema SmartX Analytics com KPIs consolidados da empresa.',
    dataTopics: ['certificates', 'assets', 'alerts'],
    suggestedQuestions: [
      'Como está a saúde geral da operação?',
      'Quais são os principais alertas do momento?',
      'O que devo priorizar hoje?',
    ],
    systemKnowledge: `O Dashboard Principal exibe os indicadores mais críticos da empresa em tempo real: 
status de certificados, inventário de ativos, alertas ativos e métricas de pessoas. 
Os cartões de KPI mostram valores consolidados que podem ser explorados em detalhes nas subpáginas.`,
  },

  // ── Assets ───────────────────────────────────────────────────────
  '/MN0400_013': {
    pageName: 'Asset Management Overview',
    domain: 'assets',
    description: 'Visão geral do inventário de ativos com KPIs operacionais, distribuição por departamento e aging.',
    dataTopics: ['assets'],
    suggestedQuestions: [
      'Quantos ativos estão disponíveis (parados)?',
      'Quais departamentos têm mais ativos?',
      'Como está o aging do inventário?',
      'Qual o valor total do patrimônio?',
    ],
    systemKnowledge: `Asset Management Overview exibe KPIs operacionais de ativos: total de ativos, 
valor de investimento, itens extraviados, manutenção pendente, taxa de serialização, 
distribuição por status (em uso, disponível, em trânsito, alarme) e análise de aging por faixas etárias. 
Os dados vêm da view echart_daily_operations_kpi e echart_asset_aging_brackets.`,
  },

  '/MN0400_011': {
    pageName: 'ISO 55000 Compliance Overview',
    domain: 'assets',
    description: 'Dashboard de conformidade ISO 55000 para gestão de ativos.',
    dataTopics: ['assets'],
    suggestedQuestions: [
      'Qual o nível de conformidade ISO 55000?',
      'Quais requisitos estão em não conformidade?',
      'Como melhorar o score de compliance?',
    ],
    systemKnowledge: `A página ISO 55000 Compliance Overview avalia o nível de conformidade da empresa 
com a norma ISO 55000 de gestão de ativos. Exibe scores por categoria, gaps identificados 
e recomendações para atingir conformidade total.`,
  },

  '/MN0400_012': {
    pageName: 'ISO 55001 Requirements Status',
    domain: 'assets',
    description: 'Status detalhado dos requisitos da norma ISO 55001.',
    dataTopics: ['assets'],
    suggestedQuestions: [
      'Quais requisitos ISO 55001 estão pendentes?',
      'Qual a prioridade para atingir certificação?',
    ],
    systemKnowledge: `ISO 55001 Requirements Status detalha o atendimento a cada requisito da norma ISO 55001, 
que especifica os critérios para sistemas de gestão de ativos. Exibe status por cláusula da norma.`,
  },

  // ── People Analytics ─────────────────────────────────────────────
  '/MN0400_111': {
    pageName: 'Workforce Composition',
    domain: 'people',
    description: 'Composição da força de trabalho por departamento, função e localização.',
    dataTopics: ['boundary', 'alerts'],
    suggestedQuestions: [
      'Como está distribuída a força de trabalho?',
      'Quais departamentos têm mais pessoas?',
      'Onde estão concentradas as pessoas agora?',
    ],
    systemKnowledge: `Workforce Composition exibe a distribuição de pessoas por departamento, cargo, 
localização e turno. Permite identificar concentrações de pessoal e otimizar alocação de recursos humanos.`,
  },

  // ── Certificados ─────────────────────────────────────────────────
  '/MN0400_412': {
    pageName: 'Certificate Analytics',
    domain: 'certificates',
    description: 'Analytics preditivo de certificados com scores de risco, renovação e compliance.',
    dataTopics: ['certificates'],
    suggestedQuestions: [
      'Quais certificados têm maior risco de vencimento?',
      'Qual o score de compliance atual?',
      'Quais departamentos têm mais certificados em risco?',
      'Qual o impacto financeiro dos certificados vencidos?',
    ],
    systemKnowledge: `Certificate Analytics usa modelos preditivos para avaliar risco de cada certificado. 
Os scores incluem: expiration_risk_score (risco de vencimento), renewal_probability_score (probabilidade de renovação), 
combined_risk_score (risco combinado) e financial_risk_value (valor em risco). 
A tabela echart_predictive_certificate_data alimenta todos os indicadores.
Status possíveis: VALID (válido), EXPIRING_SOON (vencendo em breve), EXPIRED (vencido).`,
  },

  '/MN0400_413': {
    pageName: 'Certificate Compliance Dashboard',
    domain: 'certificates',
    description: 'Dashboard de compliance de certificados com KPIs de renovação e backlog.',
    dataTopics: ['certificates'],
    suggestedQuestions: [
      'Qual o percentual de compliance atual?',
      'Quantos certificados estão no backlog?',
      'Quais vencem esse mês?',
      'Como está a tendência de renovações?',
    ],
    systemKnowledge: `Certificate Compliance Dashboard exibe KPIs de renovação: BACKLOG (vencidos sem renovação), 
PENDING_THIS_MONTH (vencem esse mês), RENEWED_THIS_MONTH (renovados esse mês). 
O compliance score é calculado com base na proporção de certificados válidos vs total. 
Fonte: echart_certificate_renewal_status e echart_predictive_certificate_data.`,
  },

  '/MN0400_511': {
    pageName: 'Calibration Schedule Report',
    domain: 'certificates',
    description: 'Relatório de agenda de calibração de equipamentos e instrumentos.',
    dataTopics: ['certificates'],
    suggestedQuestions: [
      'Quais equipamentos precisam de calibração urgente?',
      'Qual a agenda de calibrações do próximo mês?',
      'Há equipamentos com calibração vencida?',
    ],
    systemKnowledge: `Calibration Schedule Report foca em certificados do tipo CALIBRAÇÃO, 
exibindo cronograma de calibrações programadas e vencidas para instrumentos e equipamentos de medição. 
Essencial para conformidade com normas metrológicas e ISO 17025.`,
  },

  // ── Infraestrutura / People Sensors ──────────────────────────────
  '/MN0400_211': {
    pageName: 'Boundary Tracking & Access Analytics',
    domain: 'boundary',
    description: 'Rastreamento de pessoas por zonas/áreas com análise de tempo de permanência e fluxo.',
    dataTopics: ['boundary'],
    suggestedQuestions: [
      'Quais áreas têm mais movimentação agora?',
      'Tem alguém com permanência anormal em alguma zona?',
      'Como é o fluxo de pessoas entre áreas?',
      'Quais zonas têm acesso fora do horário?',
    ],
    systemKnowledge: `Boundary Tracking Analytics monitora a localização e movimentação de pessoas 
através de sensores IoT. Exibe: visitas por zona (visits_today), tempo de permanência (duration_today_hours), 
transições entre áreas, heatmap de ocupação e anomalias de permanência. 
Fonte: echart_boundary_tracking e echart_boundary_transitions.`,
  },

  '/MN0400_132': {
    pageName: 'Real-time People Visibility',
    domain: 'people',
    description: 'Visualização em tempo real da localização das pessoas no mapa.',
    dataTopics: ['boundary', 'alerts'],
    suggestedQuestions: [
      'Onde estão as pessoas agora?',
      'Tem alguém em área restrita?',
      'Como está a distribuição atual de pessoas?',
    ],
    systemKnowledge: `Real-time People Visibility exibe no mapa a posição atual de cada pessoa 
rastreada pelos sensores IoT. Permite identificar concentrações, acessos não autorizados 
e monitorar a movimentação em tempo real dentro da planta industrial.`,
  },

  '/MN0400_133': {
    pageName: 'Temperature Compliance',
    domain: 'temperature',
    description: 'Monitoramento de exposição térmica dos trabalhadores com análise de conformidade NR-15.',
    dataTopics: ['temperature'],
    suggestedQuestions: [
      'Quem está exposto a temperatura crítica?',
      'Quantos eventos de calor extremo ocorreram essa semana?',
      'Estamos em conformidade com a NR-15?',
      'Quais áreas têm maior risco térmico?',
    ],
    systemKnowledge: `Temperature Compliance monitora a exposição térmica dos trabalhadores usando sensores corporais. 
Classifica eventos por severidade: CRITICAL (>40°C), HIGH (35-40°C), MEDIUM (30-35°C), LOW (<30°C). 
Compara com os limites da NR-15 (Norma Regulamentadora de Insalubridade) do MTE. 
Fonte: echart_person_temperature_exposure_events.`,
  },

  '/MN0400_134': {
    pageName: 'GPS Tracking',
    domain: 'gps',
    description: 'Rastreamento GPS de ativos e pessoas com histórico de rotas.',
    dataTopics: ['boundary'],
    suggestedQuestions: [
      'Onde estão os ativos rastreados agora?',
      'Qual foi a rota percorrida hoje?',
      'Tem ativo fora do perímetro?',
    ],
    systemKnowledge: `GPS Tracking exibe a localização geográfica em tempo real de ativos e pessoas 
equipados com dispositivos GPS. Permite visualizar histórico de rotas, distâncias percorridas 
e alertas de geofence quando saem de áreas permitidas.`,
  },

  '/MN0400_135': {
    pageName: 'Risks Management',
    domain: 'risk',
    description: 'Dashboard de gestão de riscos operacionais e de segurança.',
    dataTopics: ['alerts', 'temperature'],
    suggestedQuestions: [
      'Quais são os riscos mais críticos agora?',
      'Como está o índice geral de risco?',
      'Quais riscos precisam de ação imediata?',
    ],
    systemKnowledge: `Risks Management consolida indicadores de risco operacional e de segurança do trabalho. 
Avalia exposição a riscos físicos (temperatura, queda), químicos e ergonômicos. 
Integra dados de sensores corporais, boundary tracking e histórico de incidentes.`,
  },

  '/MN0400_312': {
    pageName: 'Asset GPS Map',
    domain: 'assets',
    description: 'Mapa de localização geográfica de ativos com rastreamento GPS.',
    dataTopics: ['assets'],
    suggestedQuestions: [
      'Onde estão os ativos no mapa?',
      'Tem ativo deslocado da localização esperada?',
      'Quais ativos estão em movimento?',
    ],
    systemKnowledge: `Asset GPS Map exibe a localização geográfica dos ativos rastreados por GPS, 
permitindo visualizar distribuição espacial, identificar ativos extraviados e monitorar movimentação 
entre sites e zonas da planta industrial.`,
  },

  '/MN0400_344': {
    pageName: 'Logistics & Distribution',
    domain: 'logistics',
    description: 'Analytics de logística e distribuição com pedidos, rotas e KPIs de entrega.',
    dataTopics: ['assets'],
    suggestedQuestions: [
      'Como estão os pedidos em andamento?',
      'Qual a eficiência de distribuição?',
      'Tem pedidos atrasados?',
    ],
    systemKnowledge: `Logistics & Distribution Analytics monitora o fluxo de pedidos e entregas, 
exibindo KPIs de prazo de entrega, taxa de avarias, eficiência de rotas e status de pedidos em tempo real.`,
  },

  // ── AI Page ───────────────────────────────────────────────────────
  '/analytics/ai': {
    pageName: 'SmartX AI',
    domain: 'ai',
    description: 'Assistente de IA para análise inteligente dos dados industriais.',
    dataTopics: ['certificates', 'assets', 'temperature', 'boundary', 'alerts'],
    suggestedQuestions: [
      'O que você consegue analisar?',
      'Como usar o sistema de relatórios?',
      'Qual modelo de IA está sendo usado?',
    ],
    systemKnowledge: `SmartX AI é o assistente inteligente do SmartX Analytics. 
Usa o modelo qwen2.5:7b rodando localmente em uma Tesla T4 GPU. 
Tem acesso em tempo real ao banco de dados MySQL para responder perguntas sobre: 
certificados, ativos, temperatura, boundary tracking e alertas.`,
  },
}

// Contexto padrão para rotas não mapeadas
const DEFAULT_CONTEXT: Omit<PageContext, 'route'> = {
  pageName: 'SmartX Analytics',
  domain: 'geral',
  description: 'Sistema de monitoramento industrial SmartX Analytics.',
  dataTopics: ['certificates', 'assets', 'alerts'],
  suggestedQuestions: [
    'Como está a operação geral da empresa?',
    'Quais dados você consegue analisar?',
    'Me dê um resumo dos principais indicadores.',
  ],
  systemKnowledge: `SmartX Analytics é uma plataforma de monitoramento industrial que integra: 
gestão de ativos (ISO 55000), rastreamento de pessoas e ativos via IoT/GPS, 
compliance de certificados, segurança do trabalho (temperatura, NR-15) e analytics preditivo. 
Todos os dados são em tempo real via MySQL.`,
}

// ─────────────────────────────────────────────
// Hook principal
// ─────────────────────────────────────────────
export function usePageContext(): PageContext {
  const location = useLocation()
  const route = location.pathname

  const ctx = PAGE_CONTEXTS[route] || DEFAULT_CONTEXT

  return {
    route,
    ...ctx,
  }
}

// Exporta o mapa para uso no backend
export { PAGE_CONTEXTS }
