// src/components/BoundaryTransitionSankey.tsx
import React, { useEffect, useRef } from 'react';
import * as echarts from 'echarts';
import { ArrowPathIcon, MapPinIcon } from '@heroicons/react/24/outline';

interface BoundaryTransitionByDuration {
  from_boundary: string;
  to_boundary: string;
  duration_range: string;
  transition_count: number;
  avg_duration: number | string;
  sample_users: string;
}

interface Props {
  data: BoundaryTransitionByDuration[];
  loading: boolean;
  title?: string;
}

const BoundaryTransitionSankey: React.FC<Props> = ({
  data,
  loading,
  title = 'Fluxo de Transições entre Áreas'
}) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstanceRef = useRef<echarts.ECharts | null>(null);

  useEffect(() => {
    if (data && data.length > 0 && chartRef.current && !loading) {
      initChart();
    }

    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.dispose();
      }
    };
  }, [data, loading]);

  useEffect(() => {
    const handleResize = () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.resize();
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const initChart = () => {
    if (!chartRef.current || !data || data.length === 0) return;

    if (chartInstanceRef.current) {
      chartInstanceRef.current.dispose();
    }

    const chart = echarts.init(chartRef.current);
    chartInstanceRef.current = chart;

    const option = getChartOption();
    chart.setOption(option);
  };
  //teste de nova função
  const getChartOption = (): echarts.EChartsOption => {
    if (!data || data.length === 0) return {};

    // ✅ DETECTAR E REMOVER CICLOS
    const processedData = removeCycles(data);

    // Extrair todas as boundaries únicas
    const boundariesSet = new Set<string>();
    processedData.forEach(item => {
      boundariesSet.add(item.from_boundary);
      boundariesSet.add(item.to_boundary);
    });

    const boundaries = Array.from(boundariesSet);

    // Criar nós
    const nodes = boundaries.map(boundary => ({
      name: boundary,
      itemStyle: {
        color: getColorForBoundary(boundary),
        borderColor: getDarkerColor(getColorForBoundary(boundary)),
        borderWidth: 2
      },
      label: {
        fontSize: 11,
        fontWeight: 'bold' as const,
        formatter: (params: any) => {
          const maxLength = 15;
          if (params.name.length > maxLength) {
            return params.name.substring(0, maxLength) + '...';
          }
          return params.name;
        }
      }
    }));

    // Criar links agrupados por faixa de duração
    const links = processedData.map(item => {
      const avgDuration = typeof item.avg_duration === 'string'
        ? parseFloat(item.avg_duration)
        : item.avg_duration;

      return {
        source: item.from_boundary,
        target: item.to_boundary,
        value: item.transition_count,
        lineStyle: {
          color: getColorForDuration(item.duration_range),
          opacity: 0.4,
          curveness: 0.5
        },
        label: {
          show: item.transition_count > 5,
          formatter: '{c}',
          fontSize: 10,
          color: '#1f2937'
        },
        duration_range: item.duration_range,
        avg_duration: avgDuration,
        sample_users: item.sample_users
      };
    });

    return {
      tooltip: {
        trigger: 'item',
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderColor: '#e5e7eb',
        borderWidth: 1,
        textStyle: {
          color: '#1f2937'
        },
        formatter: (params: any) => {
          if (params.dataType === 'edge') {
            const users = params.data.sample_users.split('|||').slice(0, 5);

            let tooltip = `<div style="font-weight: bold; margin-bottom: 8px; color: #111827;">`;
            tooltip += `${params.data.source} → ${params.data.target}</div>`;
            tooltip += `<div style="margin-bottom: 4px;">Transições: <strong>${params.value}</strong></div>`;
            tooltip += `<div style="margin-bottom: 4px;">Duração: <strong>${params.data.duration_range}</strong></div>`;
            tooltip += `<div style="margin-bottom: 8px;">Média: <strong>${params.data.avg_duration.toFixed(2)}h</strong></div>`;

            tooltip += '<div style="font-weight: 600; margin-bottom: 4px; border-top: 1px solid #e5e7eb; padding-top: 4px;">Exemplos de Usuários:</div>';
            users.forEach((user: string) => {
              tooltip += `<div style="font-size: 11px; color: #4b5563;">• ${user}</div>`;
            });

            if (params.data.sample_users.split('|||').length > 5) {
              tooltip += `<div style="font-size: 11px; color: #6b7280; font-style: italic; margin-top: 4px;">... e mais ${params.data.sample_users.split('|||').length - 5}</div>`;
            }

            return tooltip;
          }

          const boundaryData = data.filter(d =>
            d.from_boundary === params.name || d.to_boundary === params.name
          );

          const totalFrom = boundaryData
            .filter(d => d.from_boundary === params.name)
            .reduce((sum, d) => sum + d.transition_count, 0);

          const totalTo = boundaryData
            .filter(d => d.to_boundary === params.name)
            .reduce((sum, d) => sum + d.transition_count, 0);

          return `<div style="font-weight: bold; margin-bottom: 8px; color: #111827;">${params.name}</div>
                <div style="margin-bottom: 4px;">Saídas: <strong>${totalFrom}</strong></div>
                <div>Entradas: <strong>${totalTo}</strong></div>`;
        }
      },
      series: [
        {
          type: 'sankey',
          data: nodes,
          links: links,
          emphasis: {
            focus: 'adjacency',
            lineStyle: {
              opacity: 0.7
            }
          },
          levels: [
            {
              depth: 0,
              lineStyle: {
                color: 'source',
                opacity: 0.4
              }
            },
            {
              depth: 1,
              lineStyle: {
                color: 'target',
                opacity: 0.5
              }
            }
          ],
          lineStyle: {
            curveness: 0.5,
            opacity: 0.3
          },
          label: {
            color: '#1f2937',
            fontSize: 11,
            fontWeight: 'bold' as const
          },
          nodeAlign: 'justify',
          nodeGap: 12,
          nodeWidth: 25,
          layoutIterations: 32,
          orient: 'horizontal',
          draggable: false
        }
      ]
    };
  };

// ✅ FUNÇÃO MELHORADA: Detecta e remove TODOS os ciclos
const removeCycles = (data: BoundaryTransitionByDuration[]): BoundaryTransitionByDuration[] => {
  const cleanLinks: BoundaryTransitionByDuration[] = [];
  
  // Função para verificar se adicionar este link criaria um ciclo
  const wouldCreateCycle = (
    newLink: BoundaryTransitionByDuration,
    existingLinks: BoundaryTransitionByDuration[]
  ): boolean => {
    // Construir grafo com os links existentes + novo link
    const graph = new Map<string, string[]>();
    
    [...existingLinks, newLink].forEach(link => {
      if (!graph.has(link.from_boundary)) {
        graph.set(link.from_boundary, []);
      }
      graph.get(link.from_boundary)!.push(link.to_boundary);
    });

    // DFS para detectar ciclo
    const visited = new Set<string>();
    const recursionStack = new Set<string>();

    const hasCycleDFS = (node: string): boolean => {
      visited.add(node);
      recursionStack.add(node);

      const neighbors = graph.get(node) || [];
      for (const neighbor of neighbors) {
        if (!visited.has(neighbor)) {
          if (hasCycleDFS(neighbor)) return true;
        } else if (recursionStack.has(neighbor)) {
          return true; // Ciclo detectado!
        }
      }

      recursionStack.delete(node);
      return false;
    };

    // Verificar todos os nós
    for (const [node] of graph) {
      if (!visited.has(node)) {
        if (hasCycleDFS(node)) return true;
      }
    }

    return false;
  };

  // Ordenar por volume (maior primeiro) para priorizar transições mais importantes
  const sortedData = [...data].sort((a, b) => b.transition_count - a.transition_count);

  // Adicionar links um por um, pulando os que causam ciclos
  for (const link of sortedData) {
    if (!wouldCreateCycle(link, cleanLinks)) {
      cleanLinks.push(link);
    } else {
      console.warn(
        `⚠️ Link removido (criaria ciclo): ${link.from_boundary} → ${link.to_boundary} (${link.transition_count} transições)`
      );
    }
  }

  console.log(`✅ Links processados: ${data.length} → ${cleanLinks.length} (${data.length - cleanLinks.length} removidos)`);
  
  return cleanLinks;
};

  const getColorForBoundary = (boundary: string): string => {
    const colors = [
      '#3b82f6', '#8b5cf6', '#10b981', '#f59e0b',
      '#ef4444', '#06b6d4', '#ec4899', '#84cc16'
    ];

    let hash = 0;
    for (let i = 0; i < boundary.length; i++) {
      hash = boundary.charCodeAt(i) + ((hash << 5) - hash);
    }

    return colors[Math.abs(hash) % colors.length];
  };

  const getColorForDuration = (range: string): string => {
    const colorMap: { [key: string]: string } = {
      '0-30min': '#10b981',
      '30min-1h': '#3b82f6',
      '1-2h': '#8b5cf6',
      '2-4h': '#f59e0b',
      '4-8h': '#ef4444',
      '8h+': '#dc2626'
    };
    return colorMap[range] || '#64748b';
  };

  const getDarkerColor = (color: string): string => {
    const darkerMap: { [key: string]: string } = {
      '#3b82f6': '#2563eb',
      '#8b5cf6': '#7c3aed',
      '#10b981': '#059669',
      '#f59e0b': '#d97706',
      '#ef4444': '#dc2626',
      '#06b6d4': '#0891b2',
      '#ec4899': '#db2777',
      '#84cc16': '#65a30d'
    };
    return darkerMap[color] || '#475569';
  };

  const showLoading = loading;
  const showEmpty = !loading && (!data || data.length === 0);
  const showChart = !loading && data && data.length > 0;

  return (
    <div className="bg-white rounded-2xl border-2 border-[#E2E8F0] shadow-lg overflow-hidden">
      <div className="bg-gradient-to-r from-[#8b5cf6] to-[#7c3aed] p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div>
              <h3 className="text-2xl font-bold text-white mb-1">{title}</h3>
              <p className="text-white/80 text-sm">
                Movimentação entre áreas com tempo de permanência
              </p>
            </div>
          </div>

          {showChart && (
            <div className="hidden lg:flex items-center gap-2 px-6 py-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20">
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
              </svg>
              <div>
                <p className="text-xs text-white/80 font-medium">Total Transições</p>
                <p className="text-xl font-bold text-white">
                  {data.reduce((sum, d) => sum + d.transition_count, 0)}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="p-6 bg-gradient-to-b from-purple-50/30 to-white">
        {/* Loading State */}
        {showLoading && (
          <div className="flex items-center justify-center h-[700px]">
            <div className="flex flex-col items-center gap-3">
              <ArrowPathIcon className="w-8 h-8 text-blue-500 animate-spin" />
              <p className="text-gray-600 text-sm">Carregando fluxo de transições...</p>
            </div>
          </div>
        )}

        {/* Empty State */}
        {showEmpty && (
          <div className="flex items-center justify-center h-[700px]">
            <div className="text-center">
              <MapPinIcon className="w-16 h-16 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 font-medium">Nenhuma transição registrada</p>
              <p className="text-gray-400 text-sm mt-1">
                Não há dados de movimentação entre áreas hoje
              </p>
            </div>
          </div>
        )}

        {/* Chart Container - SEMPRE RENDERIZADO */}
        <div className={showChart ? 'block' : 'hidden'}>
          <div className="relative bg-white rounded-xl border-2 border-[#E2E8F0] p-6 shadow-sm">
            <div
              ref={chartRef}
              className="w-full"
              style={{ height: '700px' }}
            />
          </div>

          <div className="mt-6 p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl border-2 border-purple-200">
            <p className="text-sm font-bold text-purple-900 mb-3">Legenda de Tempo de Permanência:</p>
            <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
              {[
                { range: '0-30min', color: '#10b981', label: '< 30min' },
                { range: '30min-1h', color: '#3b82f6', label: '30min - 1h' },
                { range: '1-2h', color: '#8b5cf6', label: '1 - 2h' },
                { range: '2-4h', color: '#f59e0b', label: '2 - 4h' },
                { range: '4-8h', color: '#ef4444', label: '4 - 8h' },
                { range: '8h+', color: '#dc2626', label: '> 8h' }
              ].map(({ range, color, label }) => (
                <div key={range} className="flex items-center gap-2">
                  <div
                    className="w-4 h-4 rounded-full shadow-sm"
                    style={{ backgroundColor: color }}
                  ></div>
                  <span className="text-xs font-medium text-gray-700">{label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between px-2">
            <div className="flex items-center gap-2 px-4 py-2 bg-purple-50 rounded-xl border border-purple-200">
              <svg className="w-4 h-4 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <span className="text-xs text-purple-700 font-medium">
                A espessura das linhas representa o volume de transições
              </span>
            </div>

            <div className="text-xs text-gray-500">
              Dados de hoje: <span className="font-semibold text-gray-700">{new Date().toLocaleDateString('pt-BR')}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BoundaryTransitionSankey;