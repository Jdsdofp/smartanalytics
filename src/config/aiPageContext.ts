// src/config/aiPageContext.ts
// Mapa de contexto por rota — a IA usa isso para se situar na tela do usuário
// e responder com conhecimento específico sobre aquele módulo/gráfico

export interface PageContext {
  title: string
  domain: string
  description: string
  metrics: string[]
  howToRead: string
  commonQuestions: string[]
  suggestions: string[]
}

export const PAGE_CONTEXT_MAP: Record<string, PageContext> = {

  // ── Dashboard principal ──────────────────────────────────────────
  '/': {
    title: 'Dashboard Principal',
    domain: 'geral',
    description: 'Visão geral consolidada de todos os módulos do SmartX Analytics. Exibe KPIs de ativos, pessoas, certificados e infraestrutura.',
    metrics: ['Total de ativos', 'Certificados vencidos', 'Pessoas monitoradas', 'Alertas ativos'],
    howToRead: 'Os cards no topo mostram os indicadores mais críticos. Clique em qualquer card para ir ao módulo detalhado.',
    commonQuestions: ['O que significam os números em vermelho?', 'Como interpretar o score de risco?'],
    suggestions: ['Qual é a situação geral dos ativos?', 'Tem algum alerta crítico hoje?', 'Resumo da operação'],
  },

  // ── Assets ───────────────────────────────────────────────────────
  '/MN0400_013': {
    title: 'Asset Management Overview',
    domain: 'assets',
    description: 'Visão geral do inventário de ativos. Mostra total de ativos, distribuição por status (em uso, disponível, em trânsito), valor total do patrimônio e itens extraviados.',
    metrics: ['Total de ativos', 'Em uso', 'Disponíveis', 'Em trânsito', 'Extraviados', 'Manutenção pendente', 'Investimento total'],
    howToRead: 'O gráfico de rosca mostra a distribuição por status. Barras verticais indicam distribuição por departamento. Números em vermelho indicam situações críticas.',
    commonQuestions: ['Por que tem ativos extraviados?', 'O que é "manutenção pendente"?', 'Como melhorar o índice de utilização?'],
    suggestions: ['Quantos ativos estão disponíveis (parados)?', 'Qual departamento tem mais ativos extraviados?', 'Qual o valor total em risco?'],
  },
  '/MN0400_012': {
    title: 'ISO 55000 Compliance Overview',
    domain: 'assets',
    description: 'Painel de conformidade com a norma ISO 55000 de gestão de ativos. Avalia o nível de maturidade da gestão em relação aos requisitos da norma.',
    metrics: ['Score de conformidade', 'Requisitos atendidos', 'Gaps identificados', 'Nível de maturidade'],
    howToRead: 'O gauge central mostra o percentual de conformidade geral. Barras por categoria mostram quais requisitos precisam de atenção.',
    commonQuestions: ['O que é ISO 55000?', 'Como melhorar o score de conformidade?', 'Quais são os requisitos mais críticos?'],
    suggestions: ['Como está meu nível de conformidade ISO 55000?', 'Quais gaps preciso corrigir primeiro?'],
  },

  // ── Certificados ─────────────────────────────────────────────────
  '/MN0400_412': {
    title: 'Certificate Analytics',
    domain: 'certificates',
    description: 'Análise preditiva de certificados. Mostra certificados vencidos, a vencer, score de risco de renovação e distribuição por tipo e departamento.',
    metrics: ['Certificados válidos', 'Vencidos', 'A vencer (30 dias)', 'Score de risco', 'Probabilidade de renovação'],
    howToRead: 'O timeline mostra a projeção de vencimentos. A tabela lista os certificados por criticidade. Cores: vermelho=vencido, amarelo=atenção, verde=válido.',
    commonQuestions: ['Como é calculado o score de risco?', 'O que é "probabilidade de renovação"?', 'Como priorizar renovações?'],
    suggestions: ['Quantos certificados vencem esse mês?', 'Quais departamentos têm mais risco?', 'Qual o impacto financeiro dos vencidos?'],
  },
  '/MN0400_413': {
    title: 'Certificate Reports',
    domain: 'certificates',
    description: 'Relatórios detalhados de certificados com filtros por site, área, status e tipo. Permite exportar dados para análise.',
    metrics: ['Total filtrado', 'Por status', 'Por tipo', 'Por localização'],
    howToRead: 'Use os filtros no topo para segmentar os dados. A tabela mostra todos os certificados com seus indicadores de risco.',
    commonQuestions: ['Como filtrar por departamento?', 'Como exportar os dados?'],
    suggestions: ['Mostre os certificados mais críticos', 'Analise os certificados vencidos do mês'],
  },
  '/MN0400_511': {
    title: 'Calibration Schedule',
    domain: 'certificates',
    description: 'Calendário de calibrações programadas e realizadas. Acompanha o cumprimento do cronograma de calibração de instrumentos e equipamentos.',
    metrics: ['Calibrações programadas', 'Realizadas no prazo', 'Atrasadas', 'Taxa de cumprimento'],
    howToRead: 'O calendário mostra os vencimentos por dia. Barras mensais indicam o volume de calibrações. Verde=no prazo, vermelho=atrasado.',
    commonQuestions: ['Como é definido o intervalo de calibração?', 'O que fazer com calibrações atrasadas?'],
    suggestions: ['Quantas calibrações estão atrasadas?', 'Qual o cronograma do próximo mês?'],
  },

  // ── People / Infraestrutura ──────────────────────────────────────
  '/MN0400_131': {
    title: 'Real-time People Visibility',
    domain: 'boundary',
    description: 'Visibilidade em tempo real da localização de pessoas nas instalações. Mostra quem está em cada zona, tempo de permanência e movimentações recentes.',
    metrics: ['Pessoas presentes', 'Por zona/área', 'Tempo médio de permanência', 'Entradas/saídas'],
    howToRead: 'O mapa mostra a distribuição de pessoas por área. A lista lateral exibe quem está em cada zona. Ícones coloridos indicam status.',
    commonQuestions: ['Como funciona o rastreamento?', 'O que é tempo de permanência?', 'Como identificar anomalias?'],
    suggestions: ['Quantas pessoas estão na planta agora?', 'Qual área tem mais concentração?', 'Há alguma movimentação anormal?'],
  },
  '/MN0400_132': {
    title: 'GPS Tracking',
    domain: 'boundary',
    description: 'Rastreamento GPS de pessoas e ativos em campo. Exibe rotas percorridas, posição atual e histórico de movimentação.',
    metrics: ['Ativos rastreados', 'Distância percorrida', 'Tempo em campo', 'Zonas visitadas'],
    howToRead: 'O mapa mostra as rotas em linhas coloridas por pessoa/ativo. O painel lateral lista os últimos pontos registrados.',
    commonQuestions: ['Como funciona o GPS dos dispositivos?', 'Com que frequência atualiza a posição?'],
    suggestions: ['Onde está a equipe agora?', 'Qual foi a rota percorrida hoje?'],
  },
  '/MN0400_133': {
    title: 'Boundary Access Analytics',
    domain: 'boundary',
    description: 'Análise de acesso a zonas delimitadas (boundary). Mostra frequência de visitas, tempo de permanência por zona, transições entre áreas e anomalias de acesso.',
    metrics: ['Visitas por zona', 'Tempo médio de permanência', 'Transições', 'Anomalias detectadas', 'Taxa de alertas'],
    howToRead: 'O Sankey diagram mostra o fluxo de pessoas entre zonas. O heatmap indica horários de pico. Anomalias aparecem destacadas em vermelho.',
    commonQuestions: ['O que é uma anomalia de boundary?', 'Como é calculado o Z-score de anomalia?', 'O que são transições?'],
    suggestions: ['Qual zona tem mais movimentação?', 'Tem alguma permanência anormalmente longa?', 'Qual o padrão de acesso nos turnos?'],
  },
  '/MN0400_134': {
    title: 'Temperature Compliance',
    domain: 'temperature',
    description: 'Monitoramento de exposição térmica dos trabalhadores conforme NR-15. Registra eventos de temperatura acima dos limites, identifica pessoas em risco e classifica por severidade.',
    metrics: ['Total de eventos', 'Eventos críticos', 'Pessoas afetadas', 'Temperatura média/máxima', 'Taxa de conformidade NR-15'],
    howToRead: 'O gráfico de barras mostra eventos por severidade (LOW/MEDIUM/HIGH/CRITICAL). A linha temporal indica tendência. Tabela lista as pessoas mais expostas.',
    commonQuestions: ['O que é NR-15?', 'Quais são os limites de temperatura?', 'O que fazer quando há eventos críticos?', 'Como calcular o tempo máximo de exposição?'],
    suggestions: ['Tem alguém em situação crítica de exposição?', 'Como está a conformidade NR-15?', 'Quais trabalhadores mais precisam de atenção?'],
  },
  '/MN0400_135': {
    title: 'Risk Management',
    domain: 'alerts',
    description: 'Gestão de riscos operacionais. Mapeia riscos identificados, probabilidade de ocorrência, impacto e status dos planos de mitigação.',
    metrics: ['Riscos mapeados', 'Por severidade', 'Por categoria', 'Planos de ação ativos'],
    howToRead: 'A matriz de risco posiciona cada item por probabilidade x impacto. Quadrante vermelho = ação imediata necessária.',
    commonQuestions: ['Como priorizar os riscos?', 'O que é a matriz de risco?', 'Como criar um plano de mitigação?'],
    suggestions: ['Quais são os riscos mais críticos?', 'Como está o status dos planos de ação?'],
  },
  '/MN0400_211': {
    title: 'Device Logs & Monitoring',
    domain: 'assets',
    description: 'Monitoramento de dispositivos IoT conectados ao sistema. Logs de conectividade, bateria, sinal e status operacional de cada dispositivo.',
    metrics: ['Dispositivos online', 'Offline', 'Bateria crítica', 'Sinal fraco', 'Últimas leituras'],
    howToRead: 'A tabela lista todos os dispositivos com status em tempo real. Ícones coloridos indicam conectividade. Clique em um dispositivo para ver o histórico.',
    commonQuestions: ['O que fazer com dispositivos offline?', 'Com que frequência os dados são sincronizados?'],
    suggestions: ['Quantos dispositivos estão offline?', 'Tem dispositivos com bateria crítica?'],
  },

  // ── Logistics ────────────────────────────────────────────────────
  '/MN0400_312': {
    title: 'Stock Distribution by Location',
    domain: 'assets',
    description: 'Distribuição de estoque por localização. Mapa e tabela mostrando onde cada item está armazenado, quantidades disponíveis e movimentações recentes.',
    metrics: ['Total em estoque', 'Por localização', 'Itens em movimento', 'Ocupação de armazém'],
    howToRead: 'O mapa mostra a distribuição geográfica. Barras indicam volume por localização. Clique numa localização para ver o detalhamento.',
    commonQuestions: ['Como é feito o controle de estoque?', 'O que é um item em movimento?'],
    suggestions: ['Qual localização tem mais estoque?', 'Tem itens abaixo do estoque mínimo?'],
  },
  '/MN0400_344': {
    title: 'Orders Analytics',
    domain: 'assets',
    description: 'Análise de pedidos e ordens de serviço. Acompanha status de pedidos, tempo de processamento, taxa de conclusão e gargalos no fluxo.',
    metrics: ['Pedidos abertos', 'Concluídos', 'Atrasados', 'Tempo médio de processamento', 'Taxa de conclusão'],
    howToRead: 'O funil mostra as etapas do processo de pedidos. Barras temporais indicam tendência de volume. Tabela lista pedidos com maior atraso.',
    commonQuestions: ['O que causa atrasos nos pedidos?', 'Como calcular o tempo de processamento?'],
    suggestions: ['Quantos pedidos estão atrasados?', 'Qual etapa é o maior gargalo?'],
  },
  '/MN0400_332': {
    title: 'Distribution Analytics',
    domain: 'assets',
    description: 'Análise de distribuição e packaging. Monitora eficiência de embalagem, volumes distribuídos, rotas e performance de entrega.',
    metrics: ['Volume distribuído', 'Taxa de eficiência', 'Rotas ativas', 'Desvios de entrega'],
    howToRead: 'Gráficos de linha mostram tendência de volume. Mapa de rotas exibe os caminhos de distribuição. KPIs no topo indicam performance geral.',
    commonQuestions: ['Como é calculada a eficiência de distribuição?', 'O que são desvios de entrega?'],
    suggestions: ['Como está a eficiência de distribuição?', 'Tem rotas com problema?'],
  },

  // ── Fallback para páginas não mapeadas ───────────────────────────
  'default': {
    title: 'SmartX Analytics',
    domain: 'geral',
    description: 'Sistema de monitoramento industrial SmartX Analytics. Plataforma integrada de gestão de ativos, pessoas, certificados e infraestrutura.',
    metrics: [],
    howToRead: 'Navegue pelo menu lateral para acessar os diferentes módulos de análise.',
    commonQuestions: ['Como navegar pelo sistema?', 'O que cada módulo faz?'],
    suggestions: ['Como funciona esse módulo?', 'O que os dados desta tela indicam?', 'Como interpretar este gráfico?'],
  },
}

export function getPageContext(pathname: string): PageContext {
  return PAGE_CONTEXT_MAP[pathname] || PAGE_CONTEXT_MAP['default']
}
