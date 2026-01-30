// src/Distribution/componentMN0400_332.tsx

import { useEffect, useRef, useState } from 'react';
import * as echarts from 'echarts';
import { ClockIcon, ArrowPathIcon, DocumentArrowDownIcon } from '@heroicons/react/24/outline';
import { usePackingDistribution } from '../../hooks/usePackingDistribution';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
//@ts-ignore
interface CustodyGroups {
    [custody: string]: {
        [category: string]: number[];
    };
}

const custodyConfig = [
    { name: 'FORD', gradient: 'from-[#4A90E2] to-[#357ABD]', mainColor: '#4A90E2' },
    { name: 'GM', gradient: 'from-[#F5A623] to-[#E08E00]', mainColor: '#F5A623' },
    { name: 'GM ROSÁRIO', gradient: 'from-[#50E3C2] to-[#2DB89A]', mainColor: '#50E3C2' },
    { name: 'HONDA', gradient: 'from-[#7ED321] to-[#6AB01A]', mainColor: '#7ED321' },
    { name: 'HPE', gradient: 'from-[#5A5A5A] to-[#3A3A3A]', mainColor: '#5A5A5A' },
    { name: 'MAN', gradient: 'from-[#5AC8FA] to-[#3BA3D1]', mainColor: '#5AC8FA' },
    { name: 'RENAULT', gradient: 'from-[#BD10E0] to-[#9A0CB8]', mainColor: '#BD10E0' },
    { name: 'VOLKSWAGEN', gradient: 'from-[#B8E986] to-[#95C662]', mainColor: '#B8E986' },
    { name: 'NSG GROUP', gradient: 'from-[#FF6B6B] to-[#E84A4A]', mainColor: '#FF6B6B' },
];

const ageColors = [
    { base: '#5B9BD5', light: '#7CB5E8', dark: '#4A8AC4' },
    { base: '#70AD47', light: '#8DC663', dark: '#5E9539' },
    { base: '#FFC000', light: '#FFD24D', dark: '#E6AC00' },
    { base: '#A6A6A6', light: '#BFBFBF', dark: '#8C8C8C' },
];

export default function PackagingDistribution({ autoRefresh = false, refreshInterval = 600000 }) {
    const chartRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
    const chartInstances = useRef<{ [key: string]: echarts.ECharts }>({});
    const [showPercentage, setShowPercentage] = useState(false);
    const [exportingPDF, setExportingPDF] = useState(false);
    
    // 🎯 Filtros de períodos (todos ativos por padrão)
    const [activeFilters, setActiveFilters] = useState({
        period0: true,  // <30 DIAS
        period1: true,  // 30-60 DIAS
        period2: true,  // 60-90 DIAS
        period3: true   // >90 DIAS
    });

    // 🔄 Alternar filtro individual
    const toggleFilter = (period: string) => {
        setActiveFilters(prev => ({
            ...prev,
            [period]: !prev[period as keyof typeof prev]
        }));
    };

    // 🔄 Selecionar/Desselecionar todos
    const toggleAllFilters = () => {
        const allActive = Object.values(activeFilters).every(v => v);
        setActiveFilters({
            period0: !allActive,
            period1: !allActive,
            period2: !allActive,
            period3: !allActive
        });
    };

    //@ts-ignore
    const { custodyGroups, totalStats, updateTime, loading, error, refetch, exportData } = usePackingDistribution({
        autoFetch: true,
        refetchInterval: autoRefresh ? refreshInterval : undefined
    });

    // 📄 Função para exportar PDF
    const exportToPDF = async () => {
        try {
            setExportingPDF(true);
            const doc = new jsPDF('landscape', 'mm', 'a4');
            const pageWidth = doc.internal.pageSize.getWidth();
            const pageHeight = doc.internal.pageSize.getHeight();
            let yPosition = 20;

            // 🎨 HEADER - Azul escuro
            doc.setFillColor(30, 60, 114);
            doc.rect(0, 0, pageWidth, 35, 'F');
            
            doc.setTextColor(255, 255, 255);
            doc.setFontSize(24);
            doc.setFont('helvetica', 'bold');
            doc.text('ONE PAGE REPORT', pageWidth / 2, 15, { align: 'center' });
            
            doc.setFontSize(14);
            doc.setTextColor(168, 216, 255);
            doc.text('EMBALAGEM', pageWidth / 2, 25, { align: 'center' });

            // Badge "LOGÍSTICA"
            doc.setFillColor(255, 255, 255);
            doc.roundedRect(pageWidth - 40, 10, 32, 10, 2, 2, 'F');
            doc.setTextColor(30, 60, 114);
            doc.setFontSize(9);
            doc.setFont('helvetica', 'bold');
            doc.text('LOGÍSTICA', pageWidth - 24, 16, { align: 'center' });

            yPosition = 45;

            // 📊 ESTATÍSTICAS GERAIS
            doc.setTextColor(0, 0, 0);
            doc.setFontSize(12);
            doc.setFont('helvetica', 'bold');
            doc.text('Resumo Geral:', 14, yPosition);
            yPosition += 3;

            const statsData = [
                ['Período', 'Quantidade', 'Percentual'],
                [
                    '<30 DIAS',
                    totalStats[0].toString(),
                    `${((totalStats[0] / totalStats.reduce((a, b) => a + b, 0)) * 100).toFixed(1)}%`
                ],
                [
                    '30-60 DIAS',
                    totalStats[1].toString(),
                    `${((totalStats[1] / totalStats.reduce((a, b) => a + b, 0)) * 100).toFixed(1)}%`
                ],
                [
                    '60-90 DIAS',
                    totalStats[2].toString(),
                    `${((totalStats[2] / totalStats.reduce((a, b) => a + b, 0)) * 100).toFixed(1)}%`
                ],
                [
                    '>90 DIAS',
                    totalStats[3].toString(),
                    `${((totalStats[3] / totalStats.reduce((a, b) => a + b, 0)) * 100).toFixed(1)}%`
                ],
                [
                    'TOTAL',
                    totalStats.reduce((a, b) => a + b, 0).toString(),
                    '100.0%'
                ]
            ];

            (doc as any).autoTable({
                startY: yPosition,
                head: [statsData[0]],
                body: statsData.slice(1),
                theme: 'grid',
                headStyles: {
                    fillColor: [30, 60, 114],
                    textColor: 255,
                    fontStyle: 'bold',
                    halign: 'center'
                },
                bodyStyles: {
                    halign: 'center'
                },
                columnStyles: {
                    0: { fontStyle: 'bold', halign: 'left' },
                    1: { halign: 'right' },
                    2: { halign: 'right', fontStyle: 'bold' }
                },
                margin: { left: 14, right: 14 },
                didParseCell: (data: any) => {
                    if (data.row.index === statsData.length - 2) {
                        data.cell.styles.fillColor = [240, 240, 240];
                        data.cell.styles.fontStyle = 'bold';
                    }
                }
            });

            yPosition = (doc as any).lastAutoTable.finalY + 10;

            // 📈 TABELAS DE CADA CUSTÓDIA
            for (const config of custodyConfig) {
                const categories = custodyGroups[config.name];
                if (!categories) continue;

                // Verificar espaço na página
                if (yPosition > pageHeight - 60) {
                    doc.addPage();
                    yPosition = 20;
                }

                // Título da Custódia
                const hexColor = config.mainColor.replace('#', '');
                const r = parseInt(hexColor.substr(0, 2), 16);
                const g = parseInt(hexColor.substr(2, 2), 16);
                const b = parseInt(hexColor.substr(4, 2), 16);

                doc.setFillColor(r, g, b);
                doc.roundedRect(14, yPosition - 5, pageWidth - 28, 10, 2, 2, 'F');
                doc.setTextColor(255, 255, 255);
                doc.setFontSize(12);
                doc.setFont('helvetica', 'bold');
                doc.text(config.name, pageWidth / 2, yPosition + 1, { align: 'center' });

                yPosition += 10;

                // Preparar dados da tabela
                const catEntries = Object.entries(categories)
                    .map(([name, values]) => ({
                        name,
                        values,
                        total: values.reduce((a, b) => a + b, 0)
                    }))
                    .sort((a, b) => b.total - a.total);

                const tableData = catEntries.map(cat => {
                    const total = cat.total;
                    return [
                        cat.name,
                        cat.values[0].toString(),
                        `${((cat.values[0] / total) * 100).toFixed(1)}%`,
                        cat.values[1].toString(),
                        `${((cat.values[1] / total) * 100).toFixed(1)}%`,
                        cat.values[2].toString(),
                        `${((cat.values[2] / total) * 100).toFixed(1)}%`,
                        cat.values[3].toString(),
                        `${((cat.values[3] / total) * 100).toFixed(1)}%`,
                        total.toString()
                    ];
                });

                (doc as any).autoTable({
                    startY: yPosition,
                    head: [[
                        'Categoria',
                        '<30', '%',
                        '30-60', '%',
                        '60-90', '%',
                        '>90', '%',
                        'Total'
                    ]],
                    body: tableData,
                    theme: 'striped',
                    headStyles: {
                        fillColor: [100, 100, 100],
                        textColor: 255,
                        fontStyle: 'bold',
                        fontSize: 8,
                        halign: 'center'
                    },
                    bodyStyles: {
                        fontSize: 7,
                        halign: 'center'
                    },
                    columnStyles: {
                        0: { cellWidth: 40, halign: 'left', fontStyle: 'bold' },
                        1: { cellWidth: 15, fillColor: [240, 248, 255] },
                        2: { cellWidth: 12, fillColor: [240, 248, 255], textColor: [91, 155, 213] },
                        3: { cellWidth: 15, fillColor: [240, 255, 240] },
                        4: { cellWidth: 12, fillColor: [240, 255, 240], textColor: [112, 173, 71] },
                        5: { cellWidth: 15, fillColor: [255, 250, 240] },
                        6: { cellWidth: 12, fillColor: [255, 250, 240], textColor: [255, 192, 0] },
                        7: { cellWidth: 15, fillColor: [245, 245, 245] },
                        8: { cellWidth: 12, fillColor: [245, 245, 245], textColor: [166, 166, 166] },
                        9: { cellWidth: 20, fontStyle: 'bold', fillColor: [250, 250, 250] }
                    },
                    margin: { left: 14, right: 14 },
                    didDrawPage: (data: any) => {
                        yPosition = data.cursor.y;
                    }
                });

                yPosition = (doc as any).lastAutoTable.finalY + 8;
            }

            // 📅 FOOTER - Data de atualização
            const totalPages = doc.getNumberOfPages();
            for (let i = 1; i <= totalPages; i++) {
                doc.setPage(i);
                doc.setFillColor(240, 240, 240);
                doc.rect(0, pageHeight - 15, pageWidth, 15, 'F');
                
                doc.setTextColor(60, 60, 60);
                doc.setFontSize(8);
                doc.setFont('helvetica', 'normal');
                doc.text(`Atualização: ${updateTime || 'N/A'}`, 14, pageHeight - 8);
                doc.text(`Página ${i} de ${totalPages}`, pageWidth - 14, pageHeight - 8, { align: 'right' });
                
                // Legenda de cores
                doc.setFontSize(7);
                let xLegend = pageWidth / 2 - 60;
                const legends = [
                    { label: '<30 DIAS', color: [91, 155, 213] },
                    { label: '30-60 DIAS', color: [112, 173, 71] },
                    { label: '60-90 DIAS', color: [255, 192, 0] },
                    { label: '>90 DIAS', color: [166, 166, 166] }
                ];
                
                legends.forEach(leg => {
                    doc.setFillColor(leg.color[0], leg.color[1], leg.color[2]);
                    doc.rect(xLegend, pageHeight - 10, 8, 3, 'F');
                    doc.setTextColor(60, 60, 60);
                    doc.text(leg.label, xLegend + 10, pageHeight - 8);
                    xLegend += 30;
                });
            }

            // 💾 Salvar PDF
            const fileName = `Relatorio_Embalagem_${new Date().toISOString().split('T')[0]}.pdf`;
            doc.save(fileName);

            console.log('✅ PDF exportado com sucesso!');
        } catch (error) {
            console.error('❌ Erro ao gerar PDF:', error);
            alert('Erro ao gerar PDF. Verifique o console para mais detalhes.');
        } finally {
            setExportingPDF(false);
        }
    };

    useEffect(() => {
        if (Object.keys(custodyGroups).length === 0) return;

        custodyConfig.forEach((config) => {
            const categories = custodyGroups[config.name];
            if (!categories) return;

            const chartElement = chartRefs.current[config.name];
            if (!chartElement) return;

            let myChart = chartInstances.current[config.name];
            if (!myChart || myChart.isDisposed()) {
                myChart = echarts.init(chartElement);
                chartInstances.current[config.name] = myChart;
            }

            const catEntries = Object.entries(categories)
                .map(([name, values]) => ({ name, values, total: values.reduce((a, b) => a + b, 0) }))
                .sort((a, b) => b.total - a.total);

            const totalCats = catEntries.length;
            const limit = totalCats > 50 ? 15 : totalCats > 20 ? 20 : totalCats;
            const topCats = catEntries.slice(0, limit);
            
            if (catEntries.length > limit) {
                const others = catEntries.slice(limit);
                const othersVals = [0, 0, 0, 0];
                others.forEach(c => {
                    othersVals[0] += c.values[0];
                    othersVals[1] += c.values[1];
                    othersVals[2] += c.values[2];
                    othersVals[3] += c.values[3];
                });
                topCats.push({ name: 'OUTROS', values: othersVals, total: othersVals.reduce((a, b) => a + b, 0) });
            }

            const catNames = topCats.map(c => c.name);
            const catData = topCats.reduce((acc, c) => { acc[c.name] = c.values; return acc; }, {} as any);

            const labelFormatter = (params: any) => {
                if (params.value > 0) {
                    const total = catData[params.name].reduce((a: number, b: number) => a + b, 0);
                    const pct = ((params.value / total) * 100).toFixed(1);
                    
                    if (showPercentage) {
                        return (params.value / total >= 0.03) ? `${pct}%` : '';
                    } else {
                        return (params.value / total >= 0.03) ? `${params.value}` : '';
                    }
                }
                return '';
            };

            // 🎯 Séries base (todas)
            const allSeries = [
                { 
                    key: 'period0',
                    name: '<30 DIAS', 
                    type: 'bar', 
                    data: catNames.map(c => catData[c][0]), 
                    barGap: '10%',
                    itemStyle: { 
                        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                            { offset: 0, color: ageColors[0].light },
                            { offset: 1, color: ageColors[0].dark }
                        ]),
                        borderRadius: [4, 4, 0, 0],
                        shadowColor: 'rgba(91, 155, 213, 0.3)',
                        shadowBlur: 5
                    }, 
                    label: { 
                        show: true, 
                        position: 'top', 
                        fontSize: showPercentage ? 10 : 9,
                        fontWeight: 'bold',
                        color: '#333',
                        formatter: labelFormatter
                    },
                    emphasis: {
                        itemStyle: {
                            color: ageColors[0].base,
                            shadowBlur: 10,
                            shadowColor: 'rgba(91, 155, 213, 0.5)'
                        }
                    }
                },
                { 
                    key: 'period1',
                    name: '30-60 DIAS', 
                    type: 'bar', 
                    data: catNames.map(c => catData[c][1]), 
                    itemStyle: { 
                        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                            { offset: 0, color: ageColors[1].light },
                            { offset: 1, color: ageColors[1].dark }
                        ]),
                        borderRadius: [4, 4, 0, 0],
                        shadowColor: 'rgba(112, 173, 71, 0.3)',
                        shadowBlur: 5
                    }, 
                    label: { 
                        show: true, 
                        position: 'top', 
                        fontSize: showPercentage ? 10 : 9,
                        fontWeight: 'bold',
                        color: '#333',
                        formatter: labelFormatter
                    },
                    emphasis: {
                        itemStyle: {
                            color: ageColors[1].base,
                            shadowBlur: 10,
                            shadowColor: 'rgba(112, 173, 71, 0.5)'
                        }
                    }
                },
                { 
                    key: 'period2',
                    name: '60-90 DIAS', 
                    type: 'bar', 
                    data: catNames.map(c => catData[c][2]), 
                    itemStyle: { 
                        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                            { offset: 0, color: ageColors[2].light },
                            { offset: 1, color: ageColors[2].dark }
                        ]),
                        borderRadius: [4, 4, 0, 0],
                        shadowColor: 'rgba(255, 192, 0, 0.3)',
                        shadowBlur: 5
                    }, 
                    label: { 
                        show: true, 
                        position: 'top', 
                        fontSize: showPercentage ? 10 : 9,
                        fontWeight: 'bold',
                        color: '#333',
                        formatter: labelFormatter
                    },
                    emphasis: {
                        itemStyle: {
                            color: ageColors[2].base,
                            shadowBlur: 10,
                            shadowColor: 'rgba(255, 192, 0, 0.5)'
                        }
                    }
                },
                { 
                    key: 'period3',
                    name: '>90 DIAS', 
                    type: 'bar', 
                    data: catNames.map(c => catData[c][3]), 
                    itemStyle: { 
                        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                            { offset: 0, color: ageColors[3].light },
                            { offset: 1, color: ageColors[3].dark }
                        ]),
                        borderRadius: [4, 4, 0, 0],
                        shadowColor: 'rgba(166, 166, 166, 0.3)',
                        shadowBlur: 5
                    }, 
                    label: { 
                        show: true, 
                        position: 'top', 
                        fontSize: showPercentage ? 10 : 9,
                        fontWeight: 'bold',
                        color: '#333',
                        formatter: labelFormatter
                    },
                    emphasis: {
                        itemStyle: {
                            color: ageColors[3].base,
                            shadowBlur: 10,
                            shadowColor: 'rgba(166, 166, 166, 0.5)'
                        }
                    }
                },
            ];

            // 🎯 Filtrar séries baseado nos filtros ativos
            const series = allSeries.filter(s => activeFilters[s.key as keyof typeof activeFilters]);

            const height = catNames.length > 15 ? 600 : catNames.length > 10 ? 500 : 400;
            chartElement.style.height = `${height}px`;

            myChart.setOption({
                backgroundColor: 'transparent',
                tooltip: {
                    trigger: 'axis',
                    axisPointer: { 
                        type: 'shadow',
                        shadowStyle: {
                            color: 'rgba(0, 0, 0, 0.05)'
                        }
                    },
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    borderColor: config.mainColor,
                    borderWidth: 2,
                    padding: 12,
                    textStyle: {
                        fontSize: 12
                    },
                    formatter: (params: any) => {
                        const name = params[0].axisValue;
                        let total = 0;
                        params.forEach((p: any) => { total += p.value || 0; });
                        let r = `<div style="font-weight:bold;margin-bottom:8px;font-size:14px;color:${config.mainColor};">${name}</div>`;
                        r += `<div style="margin-bottom:6px;border-bottom:2px solid ${config.mainColor};"></div>`;
                        params.forEach((p: any) => {
                            if (p.value > 0) {
                                const pct = ((p.value / total) * 100).toFixed(1);
                                r += `<div style="margin:5px 0;display:flex;justify-content:space-between;align-items:center;">`;
                                r += `<span>${p.marker} <b>${p.seriesName}:</b></span>`;
                                r += `<span style="margin-left:12px;"><b>${p.value}</b> <span style="color:#888;">(${pct}%)</span></span>`;
                                r += `</div>`;
                            }
                        });
                        r += `<div style="margin:6px 0;border-top:2px solid ${config.mainColor};padding-top:6px;"></div>`;
                        r += `<div style="font-weight:bold;font-size:13px;color:${config.mainColor};">Total: ${total}</div>`;
                        return r;
                    },
                },
                grid: { 
                    left: '3%', 
                    right: '4%', 
                    bottom: catNames.length > 10 ? '22%' : '16%', 
                    top: '10%', 
                    containLabel: true 
                },
                xAxis: { 
                    type: 'category', 
                    data: catNames, 
                    axisLabel: { 
                        rotate: catNames.length > 10 ? 45 : 35, 
                        fontSize: 10,
                        fontWeight: 'bold',
                        color: '#444',
                        interval: 0, 
                        overflow: 'truncate', 
                        width: catNames.length > 15 ? 65 : 85
                    },
                    axisLine: {
                        lineStyle: {
                            color: '#ddd',
                            width: 2
                        }
                    },
                    axisTick: {
                        show: true,
                        lineStyle: {
                            color: '#ddd'
                        }
                    }
                },
                yAxis: { 
                    type: 'value', 
                    axisLabel: { 
                        fontSize: 11,
                        color: '#666',
                        fontWeight: '500'
                    },
                    splitLine: {
                        lineStyle: {
                            color: '#f0f0f0',
                            type: 'dashed'
                        }
                    },
                    axisLine: {
                        show: true,
                        lineStyle: {
                            color: '#ddd'
                        }
                    }
                },
                legend: { show: false },
                series,
                animationDuration: 800,
                animationEasing: 'cubicOut'
            }, true);
            
            myChart.resize();
        });

        return () => { 
            Object.values(chartInstances.current).forEach(c => { 
                if (c && !c.isDisposed()) c.dispose(); 
            }); 
            chartInstances.current = {}; 
        };
    }, [custodyGroups, showPercentage, activeFilters]);

    useEffect(() => {
        const resize = () => { 
            Object.values(chartInstances.current).forEach(c => { 
                if (c && !c.isDisposed()) c.resize(); 
            }); 
        };
        window.addEventListener('resize', resize);
        return () => window.removeEventListener('resize', resize);
    }, []);

    if (loading && Object.keys(custodyGroups).length === 0) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
                <div className="text-center bg-white p-10 rounded-2xl shadow-2xl">
                    <ArrowPathIcon className="w-20 h-20 text-blue-500 animate-spin mx-auto mb-4" />
                    <p className="text-gray-700 text-xl font-semibold">Carregando dados...</p>
                </div>
            </div>
        );
    }

    if (error && Object.keys(custodyGroups).length === 0) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
                <div className="text-center bg-white p-10 rounded-2xl shadow-2xl max-w-md">
                    <div className="text-red-500 text-6xl mb-4">⚠️</div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-3">Erro ao Carregar Dados</h2>
                    <p className="text-red-600 mb-6 text-lg">{error}</p>
                    <button 
                        onClick={refetch} 
                        className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-8 py-3 rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all font-semibold shadow-lg hover:shadow-xl transform hover:scale-105"
                    >
                        Tentar Novamente
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
            <div className="mx-auto">
                {/* Header */}
                <div className="bg-gradient-to-br from-[#1e3c72] via-[#2a5298] to-[#1e3c72] rounded-t-xl p-6 shadow-2xl relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-10"></div>
                    <h1 className="text-white text-4xl font-bold text-center mb-1 tracking-[3px] relative z-10 drop-shadow-lg">
                        ONE PAGE REPORT
                    </h1>
                    <h2 className="text-[#a8d8ff] text-xl text-center tracking-wide relative z-10">EMBALAGEM</h2>
                    <div className="absolute right-5 top-1/2 -translate-y-1/2 bg-white px-6 py-3 rounded-lg font-bold text-[#1e3c72] text-sm shadow-xl">
                        LOGÍSTICA
                    </div>
                </div>

                {/* Controls */}
                <div className="bg-white rounded-b-xl p-6 shadow-xl">
                    <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
                        <div className="flex gap-3 flex-wrap">
                            <button 
                                onClick={refetch} 
                                disabled={loading} 
                                className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-semibold transition-all shadow-md hover:shadow-lg ${
                                    loading 
                                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                                        : 'bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 transform hover:scale-105'
                                }`}
                            >
                                <ArrowPathIcon className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                                {loading ? 'Atualizando...' : 'Atualizar'}
                            </button>
                            
                            <button 
                                onClick={exportData} 
                                className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-green-600 text-white px-5 py-2.5 rounded-lg hover:from-green-600 hover:to-green-700 transition-all font-semibold shadow-md hover:shadow-lg transform hover:scale-105"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                Exportar CSV
                            </button>

                            {/* 📄 BOTÃO EXPORTAR PDF */}
                            <button 
                                onClick={exportToPDF}
                                disabled={exportingPDF}
                                className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-semibold transition-all shadow-md hover:shadow-lg ${
                                    exportingPDF
                                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                        : 'bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 transform hover:scale-105'
                                }`}
                            >
                                <DocumentArrowDownIcon className={`w-5 h-5 ${exportingPDF ? 'animate-bounce' : ''}`} />
                                {exportingPDF ? 'Gerando PDF...' : 'Exportar PDF'}
                            </button>

                            <button
                                onClick={() => setShowPercentage(!showPercentage)}
                                className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-semibold transition-all shadow-md hover:shadow-lg transform hover:scale-105 ${
                                    showPercentage
                                        ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white'
                                        : 'bg-gradient-to-r from-orange-500 to-orange-600 text-white'
                                }`}
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                                </svg>
                                {showPercentage ? 'Mostrar Números' : 'Mostrar Percentuais'}
                            </button>
                        </div>

                        {autoRefresh && (
                            <div className="text-sm text-gray-600 flex items-center gap-2 bg-green-50 px-4 py-2 rounded-lg border border-green-200">
                                <div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse shadow-md"></div>
                                <span className="font-medium">Atualização automática ativa</span>
                            </div>
                        )}
                    </div>

                    {/* 🎯 FILTROS DE PERÍODOS */}
                    <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border-2 border-blue-200">
                        <div className="flex flex-wrap items-center gap-4">
                            <div className="flex items-center gap-2">
                                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                                </svg>
                                <span className="font-bold text-gray-700 text-sm">Filtrar por Período:</span>
                            </div>

                            <div className="flex flex-wrap gap-3">
                                {[
                                    { key: 'period0', label: '<30 DIAS', color: '#5B9BD5', gradient: 'from-[#5B9BD5] to-[#4A8AC4]' },
                                    { key: 'period1', label: '30-60 DIAS', color: '#70AD47', gradient: 'from-[#70AD47] to-[#5E9539]' },
                                    { key: 'period2', label: '60-90 DIAS', color: '#FFC000', gradient: 'from-[#FFC000] to-[#E6AC00]' },
                                    { key: 'period3', label: '>90 DIAS', color: '#A6A6A6', gradient: 'from-[#A6A6A6] to-[#8C8C8C]' }
                                ].map((filter) => {
                                    const isActive = activeFilters[filter.key as keyof typeof activeFilters];
                                    return (
                                        <button
                                            key={filter.key}
                                            onClick={() => toggleFilter(filter.key)}
                                            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm transition-all shadow-md hover:shadow-lg transform hover:scale-105 ${
                                                isActive
                                                    ? `bg-gradient-to-r ${filter.gradient} text-white`
                                                    : 'bg-white text-gray-400 border-2 border-gray-300'
                                            }`}
                                        >
                                            <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                                                isActive ? 'bg-white border-white' : 'border-gray-400'
                                            }`}>
                                                {isActive && (
                                                    <svg className="w-3 h-3" style={{ color: filter.color }} fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                    </svg>
                                                )}
                                            </div>
                                            {filter.label}
                                        </button>
                                    );
                                })}
                            </div>

                            <button
                                onClick={toggleAllFilters}
                                className="ml-auto flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm bg-gray-700 text-white hover:bg-gray-800 transition-all shadow-md hover:shadow-lg"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                </svg>
                                {Object.values(activeFilters).every(v => v) ? 'Desmarcar Todos' : 'Marcar Todos'}
                            </button>
                        </div>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 p-6 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl shadow-inner">
                        {[
                            { label: '<30 DIAS', color: 'text-[#5B9BD5]', bgGradient: 'from-[#5B9BD5]/10 to-[#5B9BD5]/20', value: totalStats[0] },
                            { label: '30-60 DIAS', color: 'text-[#70AD47]', bgGradient: 'from-[#70AD47]/10 to-[#70AD47]/20', value: totalStats[1] },
                            { label: '60-90 DIAS', color: 'text-[#FFC000]', bgGradient: 'from-[#FFC000]/10 to-[#FFC000]/20', value: totalStats[2] },
                            { label: '>90 DIAS', color: 'text-[#A6A6A6]', bgGradient: 'from-[#A6A6A6]/10 to-[#A6A6A6]/20', value: totalStats[3] },
                        ].map((stat, i) => (
                            <div 
                                key={i} 
                                className={`text-center p-5 bg-gradient-to-br ${stat.bgGradient} rounded-xl shadow-md hover:shadow-xl transition-all transform hover:scale-105 border border-white/50`}
                            >
                                <div className={`text-4xl font-bold mb-2 ${stat.color} drop-shadow-sm`}>
                                    {stat.value.toLocaleString('pt-BR')}
                                </div>
                                <div className="text-xs text-gray-700 uppercase font-bold tracking-wide">
                                    {stat.label}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Charts Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {custodyConfig.map((config) => {
                            if (!custodyGroups[config.name]) return null;
                            return (
                                <div 
                                    key={config.name} 
                                    className="bg-white rounded-xl overflow-hidden shadow-lg border-2 border-gray-100 hover:shadow-2xl hover:border-gray-200 transition-all transform hover:scale-[1.02]"
                                >
                                    <div className={`bg-gradient-to-br ${config.gradient} text-white text-center font-bold text-lg py-4 px-4 shadow-md`}>
                                        {config.name}
                                    </div>
                                    <div className="bg-gradient-to-r from-gray-50 to-gray-100 text-center text-xs text-gray-700 py-2 px-3 border-b-2 border-gray-200 font-medium">
                                        <span className="inline-block px-3 py-1 bg-white/70 rounded-full">
                                            📊 Distribuição por idade (dias desde última movimentação)
                                        </span>
                                    </div>
                                    <div 
                                        ref={(el: any) => (chartRefs.current[config.name] = el)} 
                                        className="w-full p-3" 
                                    />
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Footer */}
                <div className="bg-white p-6 rounded-xl mt-6 shadow-xl flex flex-wrap justify-between items-center gap-5 border-2 border-gray-100">
                    <div className="flex items-center gap-3 text-sm font-bold text-gray-800 bg-blue-50 px-4 py-2 rounded-lg border border-blue-200">
                        <ClockIcon className="w-5 h-5 text-blue-600" />
                        <span>ATUALIZAÇÃO: {updateTime || 'Carregando...'}</span>
                    </div>
                    <div className="flex flex-wrap gap-6">
                        {[
                            { label: '<30 DIAS', gradient: 'from-[#7CB5E8] to-[#4A8AC4]' },
                            { label: '30 - 60 DIAS', gradient: 'from-[#8DC663] to-[#5E9539]' },
                            { label: '60 - 90 DIAS', gradient: 'from-[#FFD24D] to-[#E6AC00]' },
                            { label: '>90 DIAS', gradient: 'from-[#BFBFBF] to-[#8C8C8C]' },
                        ].map((l, i) => (
                            <div key={i} className="flex items-center gap-2">
                                <div 
                                    className={`w-14 h-6 rounded-md shadow-md bg-gradient-to-br ${l.gradient} border border-white/50`} 
                                />
                                <span className="text-sm font-bold text-gray-700">{l.label}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}