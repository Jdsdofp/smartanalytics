// // src/Distribution/componentMN0400_332.tsx

// import { useEffect, useRef, useState, useMemo } from 'react';
// import * as echarts from 'echarts';
// import { ClockIcon, ArrowPathIcon, DocumentArrowDownIcon, XMarkIcon, ArrowsPointingOutIcon } from '@heroicons/react/24/outline';
// import { usePackingDistribution } from '../../hooks/usePackingDistribution';
// import { useCompany } from '../../hooks/useCompany';
// import jsPDF from 'jspdf';
// import 'jspdf-autotable';
// //@ts-ignore
// interface CustodyGroups {
//     [custody: string]: {
//         [category: string]: number[];
//     };
// }

// // 🎨 Paleta de cores para gerar dinamicamente
// const colorPalette = [
//     { gradient: 'from-[#4A90E2] to-[#357ABD]', mainColor: '#4A90E2' },
//     { gradient: 'from-[#F5A623] to-[#E08E00]', mainColor: '#F5A623' },
//     { gradient: 'from-[#50E3C2] to-[#2DB89A]', mainColor: '#50E3C2' },
//     { gradient: 'from-[#7ED321] to-[#6AB01A]', mainColor: '#7ED321' },
//     { gradient: 'from-[#5A5A5A] to-[#3A3A3A]', mainColor: '#5A5A5A' },
//     { gradient: 'from-[#5AC8FA] to-[#3BA3D1]', mainColor: '#5AC8FA' },
//     { gradient: 'from-[#BD10E0] to-[#9A0CB8]', mainColor: '#BD10E0' },
//     { gradient: 'from-[#B8E986] to-[#95C662]', mainColor: '#B8E986' },
//     { gradient: 'from-[#FF6B6B] to-[#E84A4A]', mainColor: '#FF6B6B' },
//     { gradient: 'from-[#9B59B6] to-[#8E44AD]', mainColor: '#9B59B6' },
//     { gradient: 'from-[#3498DB] to-[#2980B9]', mainColor: '#3498DB' },
//     { gradient: 'from-[#E74C3C] to-[#C0392B]', mainColor: '#E74C3C' },
//     { gradient: 'from-[#1ABC9C] to-[#16A085]', mainColor: '#1ABC9C' },
//     { gradient: 'from-[#F39C12] to-[#D68910]', mainColor: '#F39C12' },
//     { gradient: 'from-[#34495E] to-[#2C3E50]', mainColor: '#34495E' },
// ];

// const ageColors = [
//     { base: '#5B9BD5', light: '#7CB5E8', dark: '#4A8AC4' },
//     { base: '#70AD47', light: '#8DC663', dark: '#5E9539' },
//     { base: '#FFC000', light: '#FFD24D', dark: '#E6AC00' },
//     { base: '#A6A6A6', light: '#BFBFBF', dark: '#8C8C8C' },
// ];

// export default function PackagingDistribution({ autoRefresh = false, refreshInterval = 600000 }) {
//     const chartRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
//     const chartInstances = useRef<{ [key: string]: echarts.ECharts }>({});
//     const modalChartRef = useRef<HTMLDivElement | null>(null);
//     const modalChartInstance = useRef<echarts.ECharts | null>(null);

//     const [showPercentage, setShowPercentage] = useState(false);
//     const [exportingPDF, setExportingPDF] = useState(false);
//     const [expandedChart, setExpandedChart] = useState<string | null>(null);

//     const { company } = useCompany();

//     const [activeFilters, setActiveFilters] = useState({
//         period0: true,
//         period1: true,
//         period2: true,
//         period3: true
//     });

//     const toggleFilter = (period: string) => {
//         setActiveFilters(prev => ({
//             ...prev,
//             [period]: !prev[period as keyof typeof prev]
//         }));
//     };

//     const toggleAllFilters = () => {
//         const allActive = Object.values(activeFilters).every(v => v);
//         setActiveFilters({
//             period0: !allActive,
//             period1: !allActive,
//             period2: !allActive,
//             period3: !allActive
//         });
//     };

//     //@ts-ignore
//     const { custodyGroups, totalStats, updateTime, loading, error, refetch, exportData } = usePackingDistribution({
//         autoFetch: true,
//         refetchInterval: autoRefresh ? refreshInterval : undefined
//     });

//     // 🎯 GERAR CONFIGURAÇÃO DINÂMICA DAS CUSTÓDIAS
//     const custodyConfig = useMemo(() => {
//         if (!custodyGroups || Object.keys(custodyGroups).length === 0) return [];

//         const custodyNames = Object.keys(custodyGroups).sort();

//         return custodyNames.map((name, index) => ({
//             name,
//             gradient: colorPalette[index % colorPalette.length].gradient,
//             mainColor: colorPalette[index % colorPalette.length].mainColor
//         }));
//     }, [custodyGroups]);

//     const normalizeBase64Image = (base64: string): string => {
//         if (!base64) return '';

//         let result = base64.trim();

//         if (result.startsWith('data:')) {
//             result = result.split(',')[1];
//         }

//         if (!result.startsWith('iVBORw0KGgo')) {
//             try {
//                 const decoded = atob(result);
//                 if (decoded.startsWith('iVBORw0KGgo')) {
//                     result = decoded;
//                 }
//             } catch (e) {
//                 console.warn('Erro ao tentar decodificar base64 da logo');
//             }
//         }

//         return result;
//     };

//     // 🎯 FUNÇÃO PARA CRIAR CONFIGURAÇÃO DO GRÁFICO
//     const createChartOption = (custodyName: string, config: any, isModal = false) => {
//         const categories = custodyGroups[custodyName];
//         if (!categories) return null;

//         const catEntries = Object.entries(categories)
//             .map(([name, values]) => ({ name, values, total: values.reduce((a, b) => a + b, 0) }))
//             .sort((a, b) => b.total - a.total);

//         const totalCats = catEntries.length;
//         const limit = isModal ? totalCats : (totalCats > 50 ? 15 : totalCats > 20 ? 20 : totalCats);
//         const topCats = catEntries.slice(0, limit);

//         if (!isModal && catEntries.length > limit) {
//             const others = catEntries.slice(limit);
//             const othersVals = [0, 0, 0, 0];
//             others.forEach(c => {
//                 othersVals[0] += c.values[0];
//                 othersVals[1] += c.values[1];
//                 othersVals[2] += c.values[2];
//                 othersVals[3] += c.values[3];
//             });
//             topCats.push({ name: 'OUTROS', values: othersVals, total: othersVals.reduce((a, b) => a + b, 0) });
//         }

//         const catNames = topCats.map(c => c.name);
//         const catData = topCats.reduce((acc, c) => { acc[c.name] = c.values; return acc; }, {} as any);

//         const labelFormatter = (params: any) => {
//             if (params.value > 0) {
//                 const total = catData[params.name].reduce((a: number, b: number) => a + b, 0);
//                 const pct = ((params.value / total) * 100).toFixed(1);

//                 if (showPercentage) {
//                     return (params.value / total >= 0.03) ? `${pct}%` : '';
//                 } else {
//                     return (params.value / total >= 0.03) ? `${params.value}` : '';
//                 }
//             }
//             return '';
//         };

//         const allSeries = [
//             { 
//                 key: 'period0',
//                 name: '<30 DIAS', 
//                 type: 'bar', 
//                 data: catNames.map(c => catData[c][0]), 
//                 barGap: '10%',
//                 itemStyle: { 
//                     color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
//                         { offset: 0, color: ageColors[0].light },
//                         { offset: 1, color: ageColors[0].dark }
//                     ]),
//                     borderRadius: [4, 4, 0, 0],
//                     shadowColor: 'rgba(91, 155, 213, 0.3)',
//                     shadowBlur: 5
//                 }, 
//                 label: { 
//                     show: true, 
//                     position: 'top', 
//                     fontSize: isModal ? 12 : (showPercentage ? 10 : 9),
//                     fontWeight: 'bold',
//                     color: '#333',
//                     formatter: labelFormatter
//                 },
//                 emphasis: {
//                     itemStyle: {
//                         color: ageColors[0].base,
//                         shadowBlur: 10,
//                         shadowColor: 'rgba(91, 155, 213, 0.5)'
//                     }
//                 }
//             },
//             { 
//                 key: 'period1',
//                 name: '30-60 DIAS', 
//                 type: 'bar', 
//                 data: catNames.map(c => catData[c][1]), 
//                 itemStyle: { 
//                     color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
//                         { offset: 0, color: ageColors[1].light },
//                         { offset: 1, color: ageColors[1].dark }
//                     ]),
//                     borderRadius: [4, 4, 0, 0],
//                     shadowColor: 'rgba(112, 173, 71, 0.3)',
//                     shadowBlur: 5
//                 }, 
//                 label: { 
//                     show: true, 
//                     position: 'top', 
//                     fontSize: isModal ? 12 : (showPercentage ? 10 : 9),
//                     fontWeight: 'bold',
//                     color: '#333',
//                     formatter: labelFormatter
//                 },
//                 emphasis: {
//                     itemStyle: {
//                         color: ageColors[1].base,
//                         shadowBlur: 10,
//                         shadowColor: 'rgba(112, 173, 71, 0.5)'
//                     }
//                 }
//             },
//             { 
//                 key: 'period2',
//                 name: '60-90 DIAS', 
//                 type: 'bar', 
//                 data: catNames.map(c => catData[c][2]), 
//                 itemStyle: { 
//                     color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
//                         { offset: 0, color: ageColors[2].light },
//                         { offset: 1, color: ageColors[2].dark }
//                     ]),
//                     borderRadius: [4, 4, 0, 0],
//                     shadowColor: 'rgba(255, 192, 0, 0.3)',
//                     shadowBlur: 5
//                 }, 
//                 label: { 
//                     show: true, 
//                     position: 'top', 
//                     fontSize: isModal ? 12 : (showPercentage ? 10 : 9),
//                     fontWeight: 'bold',
//                     color: '#333',
//                     formatter: labelFormatter
//                 },
//                 emphasis: {
//                     itemStyle: {
//                         color: ageColors[2].base,
//                         shadowBlur: 10,
//                         shadowColor: 'rgba(255, 192, 0, 0.5)'
//                     }
//                 }
//             },
//             { 
//                 key: 'period3',
//                 name: '>90 DIAS', 
//                 type: 'bar', 
//                 data: catNames.map(c => catData[c][3]), 
//                 itemStyle: { 
//                     color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
//                         { offset: 0, color: ageColors[3].light },
//                         { offset: 1, color: ageColors[3].dark }
//                     ]),
//                     borderRadius: [4, 4, 0, 0],
//                     shadowColor: 'rgba(166, 166, 166, 0.3)',
//                     shadowBlur: 5
//                 }, 
//                 label: { 
//                     show: true, 
//                     position: 'top', 
//                     fontSize: isModal ? 12 : (showPercentage ? 10 : 9),
//                     fontWeight: 'bold',
//                     color: '#333',
//                     formatter: labelFormatter
//                 },
//                 emphasis: {
//                     itemStyle: {
//                         color: ageColors[3].base,
//                         shadowBlur: 10,
//                         shadowColor: 'rgba(166, 166, 166, 0.5)'
//                     }
//                 }
//             },
//         ];

//         const series = allSeries.filter(s => activeFilters[s.key as keyof typeof activeFilters]);

//         // 📐 Determinar se precisa de scroll baseado na quantidade de categorias
//         const needsScroll = catNames.length > 10;

//         return {
//             catNames,
//             series,
//             config,
//             needsScroll,
//             option: {
//                 backgroundColor: 'transparent',
//                 tooltip: {
//                     trigger: 'axis',
//                     axisPointer: { 
//                         type: 'shadow',
//                         shadowStyle: {
//                             color: 'rgba(0, 0, 0, 0.05)'
//                         }
//                     },
//                     backgroundColor: 'rgba(255, 255, 255, 0.95)',
//                     borderColor: config.mainColor,
//                     borderWidth: 2,
//                     padding: 12,
//                     textStyle: {
//                         fontSize: isModal ? 14 : 12
//                     },
//                     formatter: (params: any) => {
//                         const name = params[0].axisValue;
//                         let total = 0;
//                         params.forEach((p: any) => { total += p.value || 0; });
//                         let r = `<div style="font-weight:bold;margin-bottom:8px;font-size:${isModal ? 16 : 14}px;color:${config.mainColor};">${name}</div>`;
//                         r += `<div style="margin-bottom:6px;border-bottom:2px solid ${config.mainColor};"></div>`;
//                         params.forEach((p: any) => {
//                             if (p.value > 0) {
//                                 const pct = ((p.value / total) * 100).toFixed(1);
//                                 r += `<div style="margin:5px 0;display:flex;justify-content:space-between;align-items:center;">`;
//                                 r += `<span>${p.marker} <b>${p.seriesName}:</b></span>`;
//                                 r += `<span style="margin-left:12px;"><b>${p.value}</b> <span style="color:#888;">(${pct}%)</span></span>`;
//                                 r += `</div>`;
//                             }
//                         });
//                         r += `<div style="margin:6px 0;border-top:2px solid ${config.mainColor};padding-top:6px;"></div>`;
//                         r += `<div style="font-weight:bold;font-size:${isModal ? 15 : 13}px;color:${config.mainColor};">Total: ${total}</div>`;
//                         return r;
//                     },
//                 },
//                 // 📊 DataZoom para scroll horizontal
//                 dataZoom: needsScroll ? [
//                     {
//                         type: 'slider',
//                         show: true,
//                         xAxisIndex: 0,
//                         start: 0,
//                         end: isModal ? 100 : Math.min(100, (10 / catNames.length) * 100),
//                         bottom: isModal ? 60 : 40,
//                         height: 25,
//                         handleSize: '80%',
//                         handleStyle: {
//                             color: config.mainColor,
//                             shadowBlur: 3,
//                             shadowColor: 'rgba(0, 0, 0, 0.3)',
//                             shadowOffsetX: 2,
//                             shadowOffsetY: 2
//                         },
//                         textStyle: {
//                             color: '#666',
//                             fontSize: 10
//                         },
//                         borderColor: '#ddd',
//                         fillerColor: `${config.mainColor}30`,
//                         dataBackground: {
//                             lineStyle: {
//                                 color: config.mainColor,
//                                 width: 1
//                             },
//                             areaStyle: {
//                                 color: `${config.mainColor}20`
//                             }
//                         },
//                         selectedDataBackground: {
//                             lineStyle: {
//                                 color: config.mainColor
//                             },
//                             areaStyle: {
//                                 color: `${config.mainColor}40`
//                             }
//                         }
//                     },
//                     {
//                         type: 'inside',
//                         xAxisIndex: 0,
//                         start: 0,
//                         end: isModal ? 100 : Math.min(100, (10 / catNames.length) * 100),
//                         zoomOnMouseWheel: false,
//                         moveOnMouseMove: true,
//                         moveOnMouseWheel: true
//                     }
//                 ] : undefined,
//                 grid: { 
//                     left: isModal ? '5%' : '3%', 
//                     right: isModal ? '5%' : '4%', 
//                     bottom: needsScroll ? (isModal ? '120px' : '100px') : (catNames.length > 10 ? '22%' : '16%'),
//                     top: isModal ? '15%' : '10%', 
//                     containLabel: true 
//                 },
//                 xAxis: { 
//                     type: 'category', 
//                     data: catNames, 
//                     axisLabel: { 
//                         rotate: 45,
//                         fontSize: isModal ? 12 : 10,
//                         fontWeight: 'bold',
//                         color: '#444',
//                         interval: 0,
//                         formatter: (value: string) => {
//                             const maxLen = isModal ? 20 : 12;
//                             return value.length > maxLen ? value.substring(0, maxLen) + '...' : value;
//                         }
//                     },
//                     axisLine: {
//                         lineStyle: {
//                             color: '#ddd',
//                             width: 2
//                         }
//                     },
//                     axisTick: {
//                         show: true,
//                         lineStyle: {
//                             color: '#ddd'
//                         }
//                     }
//                 },
//                 yAxis: { 
//                     type: 'value', 
//                     axisLabel: { 
//                         fontSize: isModal ? 13 : 11,
//                         color: '#666',
//                         fontWeight: '500'
//                     },
//                     splitLine: {
//                         lineStyle: {
//                             color: '#f0f0f0',
//                             type: 'dashed'
//                         }
//                     },
//                     axisLine: {
//                         show: true,
//                         lineStyle: {
//                             color: '#ddd'
//                         }
//                     }
//                 },
//                 legend: { show: false },
//                 series,
//                 animationDuration: 800,
//                 animationEasing: 'cubicOut'
//             }
//         };
//     };

//     // 🔍 FUNÇÃO PARA EXPANDIR GRÁFICO
//     const handleExpandChart = (custodyName: string) => {
//         setExpandedChart(custodyName);
//     };

//     // ❌ FUNÇÃO PARA FECHAR MODAL
//     const handleCloseModal = () => {
//         if (modalChartInstance.current && !modalChartInstance.current.isDisposed()) {
//             modalChartInstance.current.dispose();
//             modalChartInstance.current = null;
//         }
//         setExpandedChart(null);
//     };

//     const exportToPDF = async () => {
//         try {
//             setExportingPDF(true);
//             const doc = new jsPDF('landscape', 'mm', 'a4');
//             const pageWidth = doc.internal.pageSize.getWidth();
//             const pageHeight = doc.internal.pageSize.getHeight();
//             let yPosition = 10;

//             // HEADER
//             doc.setFillColor(37, 99, 235);
//             doc.roundedRect(10, yPosition, pageWidth - 20, 35, 3, 3, 'F');

//             const logoX = 15;
//             const logoY = yPosition + 5;
//             const logoWidth = 40;
//             const logoHeight = 12;

//             doc.setFillColor(255, 255, 255);
//             doc.roundedRect(logoX - 2, logoY - 2, logoWidth + 4, logoHeight + 4, 2, 2, 'F');

//             const companyLogoBase64 = company?.details?.logo ?? '';
//             if (companyLogoBase64) {
//                 try {
//                     const finalBase64 = normalizeBase64Image(companyLogoBase64);
//                     doc.addImage(
//                         finalBase64,
//                         'PNG',
//                         logoX,
//                         logoY,
//                         logoWidth,
//                         logoHeight,
//                         undefined,
//                         'FAST'
//                     );
//                     console.log('✅ Logo adicionada com sucesso ao PDF');
//                 } catch (error) {
//                     console.error('❌ Erro ao adicionar logo:', error);
//                     doc.setTextColor(37, 99, 235);
//                     doc.setFontSize(8);
//                     doc.setFont('helvetica', 'bold');
//                     doc.text('SMARTX', logoX + logoWidth / 2, logoY + 4, { align: 'center' });
//                     doc.setFontSize(6);
//                     doc.setFont('helvetica', 'normal');
//                     doc.text('Logistics System', logoX + logoWidth / 2, logoY + 8, { align: 'center' });
//                 }
//             } else {
//                 doc.setTextColor(37, 99, 235);
//                 doc.setFontSize(8);
//                 doc.setFont('helvetica', 'bold');
//                 doc.text('SMARTX', logoX + logoWidth / 2, logoY + 4, { align: 'center' });
//                 doc.setFontSize(6);
//                 doc.setFont('helvetica', 'normal');
//                 doc.text('Logistics System', logoX + logoWidth / 2, logoY + 8, { align: 'center' });
//             }

//             doc.setTextColor(255, 255, 255);
//             doc.setFontSize(18);
//             doc.setFont('helvetica', 'bold');
//             doc.text('Packaging Distribution - Report', logoX + logoWidth + 15, yPosition + 12);

//             doc.setDrawColor(255, 255, 255);
//             doc.setLineWidth(0.3);
//             doc.line(15, yPosition + 22, pageWidth - 15, yPosition + 22);

//             const infoY = yPosition + 28;
//             doc.setFontSize(9);

//             doc.setFont('helvetica', 'bold');
//             doc.text('Report Code:', 15, infoY);
//             doc.setFont('helvetica', 'normal');
//             doc.text(`PKG-${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`, 42, infoY);

//             doc.setFont('helvetica', 'bold');
//             doc.text('Subject:', 15, infoY + 5);
//             doc.setFont('helvetica', 'normal');
//             doc.text('Packaging Age Analysis', 42, infoY + 5);

//             doc.setFont('helvetica', 'bold');
//             doc.text('Zone:', 95, infoY);
//             doc.setFont('helvetica', 'normal');
//             doc.text('ALL CUSTODIES', 115, infoY);

//             if (company?.details?.full_name) {
//                 doc.setFont('helvetica', 'bold');
//                 doc.text('Company:', 95, infoY + 5);
//                 doc.setFont('helvetica', 'normal');
//                 doc.text(company.details.full_name.toUpperCase(), 115, infoY + 5);
//             }

//             const totalItems = totalStats.reduce((a, b) => a + b, 0);
//             yPosition = 50;

//             doc.setFontSize(8);
//             doc.setFont('helvetica', 'normal');
//             doc.setTextColor(107, 114, 128);
//             doc.text(`Generated: ${new Date().toLocaleString('pt-BR')}`, 15, yPosition);
//             doc.text(`Total Records: ${totalItems}`, 200, yPosition);
//             yPosition += 8;

//             doc.setTextColor(0, 0, 0);
//             doc.setFontSize(12);
//             doc.setFont('helvetica', 'bold');
//             doc.text('Summary by Period:', 14, yPosition);
//             yPosition += 3;

//             const statsData = [
//                 ['Period', 'Quantity', 'Percentage'],
//                 ['<30 DAYS', totalStats[0].toString(), `${((totalStats[0] / totalItems) * 100).toFixed(1)}%`],
//                 ['30-60 DAYS', totalStats[1].toString(), `${((totalStats[1] / totalItems) * 100).toFixed(1)}%`],
//                 ['60-90 DAYS', totalStats[2].toString(), `${((totalStats[2] / totalItems) * 100).toFixed(1)}%`],
//                 ['>90 DAYS', totalStats[3].toString(), `${((totalStats[3] / totalItems) * 100).toFixed(1)}%`],
//                 ['TOTAL', totalItems.toString(), '100.0%']
//             ];

//             (doc as any).autoTable({
//                 startY: yPosition,
//                 head: [statsData[0]],
//                 body: statsData.slice(1),
//                 theme: 'grid',
//                 headStyles: {
//                     fillColor: [37, 99, 235],
//                     textColor: 255,
//                     fontStyle: 'bold',
//                     halign: 'center'
//                 },
//                 bodyStyles: {
//                     halign: 'center'
//                 },
//                 columnStyles: {
//                     0: { fontStyle: 'bold', halign: 'left' },
//                     1: { halign: 'right' },
//                     2: { halign: 'right', fontStyle: 'bold' }
//                 },
//                 margin: { left: 14, right: 14 },
//                 didParseCell: (data: any) => {
//                     if (data.row.index === statsData.length - 2) {
//                         data.cell.styles.fillColor = [240, 240, 240];
//                         data.cell.styles.fontStyle = 'bold';
//                     }
//                 }
//             });

//             yPosition = (doc as any).lastAutoTable.finalY + 10;

//             for (const config of custodyConfig) {
//                 const categories = custodyGroups[config.name];
//                 if (!categories) continue;

//                 if (yPosition > pageHeight - 60) {
//                     doc.addPage();
//                     yPosition = 20;
//                 }

//                 const hexColor = config.mainColor.replace('#', '');
//                 const r = parseInt(hexColor.substr(0, 2), 16);
//                 const g = parseInt(hexColor.substr(2, 2), 16);
//                 const b = parseInt(hexColor.substr(4, 2), 16);

//                 doc.setFillColor(r, g, b);
//                 doc.roundedRect(14, yPosition - 5, pageWidth - 28, 10, 2, 2, 'F');
//                 doc.setTextColor(255, 255, 255);
//                 doc.setFontSize(12);
//                 doc.setFont('helvetica', 'bold');
//                 doc.text(config.name, pageWidth / 2, yPosition + 1, { align: 'center' });

//                 yPosition += 10;

//                 const catEntries = Object.entries(categories)
//                     .map(([name, values]) => ({
//                         name,
//                         values,
//                         total: values.reduce((a, b) => a + b, 0)
//                     }))
//                     .sort((a, b) => b.total - a.total);

//                 const tableData = catEntries.map(cat => {
//                     const total = cat.total;
//                     return [
//                         cat.name,
//                         cat.values[0].toString(),
//                         `${((cat.values[0] / total) * 100).toFixed(1)}%`,
//                         cat.values[1].toString(),
//                         `${((cat.values[1] / total) * 100).toFixed(1)}%`,
//                         cat.values[2].toString(),
//                         `${((cat.values[2] / total) * 100).toFixed(1)}%`,
//                         cat.values[3].toString(),
//                         `${((cat.values[3] / total) * 100).toFixed(1)}%`,
//                         total.toString()
//                     ];
//                 });

//                 (doc as any).autoTable({
//                     startY: yPosition,
//                     head: [['Category', '<30', '%', '30-60', '%', '60-90', '%', '>90', '%', 'Total']],
//                     body: tableData,
//                     theme: 'striped',
//                     headStyles: {
//                         fillColor: [100, 100, 100],
//                         textColor: 255,
//                         fontStyle: 'bold',
//                         fontSize: 8,
//                         halign: 'center'
//                     },
//                     bodyStyles: {
//                         fontSize: 7,
//                         halign: 'center'
//                     },
//                     columnStyles: {
//                         0: { cellWidth: 40, halign: 'left', fontStyle: 'bold' },
//                         1: { cellWidth: 15, fillColor: [240, 248, 255] },
//                         2: { cellWidth: 12, fillColor: [240, 248, 255], textColor: [91, 155, 213] },
//                         3: { cellWidth: 15, fillColor: [240, 255, 240] },
//                         4: { cellWidth: 12, fillColor: [240, 255, 240], textColor: [112, 173, 71] },
//                         5: { cellWidth: 15, fillColor: [255, 250, 240] },
//                         6: { cellWidth: 12, fillColor: [255, 250, 240], textColor: [255, 192, 0] },
//                         7: { cellWidth: 15, fillColor: [245, 245, 245] },
//                         8: { cellWidth: 12, fillColor: [245, 245, 245], textColor: [166, 166, 166] },
//                         9: { cellWidth: 20, fontStyle: 'bold', fillColor: [250, 250, 250] }
//                     },
//                     margin: { left: 14, right: 14 },
//                     didDrawPage: (data: any) => {
//                         yPosition = data.cursor.y;
//                     }
//                 });

//                 yPosition = (doc as any).lastAutoTable.finalY + 8;
//             }

//             const totalPages = doc.getNumberOfPages();
//             for (let i = 1; i <= totalPages; i++) {
//                 doc.setPage(i);
//                 doc.setFillColor(240, 240, 240);
//                 doc.rect(0, pageHeight - 15, pageWidth, 15, 'F');

//                 doc.setTextColor(60, 60, 60);
//                 doc.setFontSize(8);
//                 doc.setFont('helvetica', 'normal');
//                 doc.text(`Update: ${updateTime || new Date().toLocaleString('pt-BR')}`, 14, pageHeight - 8);
//                 doc.text(`Page ${i} of ${totalPages}`, pageWidth - 14, pageHeight - 8, { align: 'right' });

//                 doc.setFontSize(7);
//                 let xLegend = pageWidth / 2 - 60;
//                 const legends = [
//                     { label: '<30 DAYS', color: [91, 155, 213] },
//                     { label: '30-60 DAYS', color: [112, 173, 71] },
//                     { label: '60-90 DAYS', color: [255, 192, 0] },
//                     { label: '>90 DAYS', color: [166, 166, 166] }
//                 ];

//                 legends.forEach(leg => {
//                     doc.setFillColor(leg.color[0], leg.color[1], leg.color[2]);
//                     doc.rect(xLegend, pageHeight - 10, 8, 3, 'F');
//                     doc.setTextColor(60, 60, 60);
//                     doc.text(leg.label, xLegend + 10, pageHeight - 8);
//                     xLegend += 30;
//                 });
//             }

//             const fileName = `Packaging_Distribution_${new Date().toISOString().split('T')[0]}.pdf`;
//             doc.save(fileName);

//             console.log('✅ PDF exported successfully!');
//         } catch (error) {
//             console.error('❌ Error generating PDF:', error);
//             alert('Error generating PDF. Check console for details.');
//         } finally {
//             setExportingPDF(false);
//         }
//     };

//     // 📊 RENDERIZAR GRÁFICOS NORMAIS
//     useEffect(() => {
//         if (Object.keys(custodyGroups).length === 0 || custodyConfig.length === 0) return;

//         custodyConfig.forEach((config) => {
//             const chartElement = chartRefs.current[config.name];
//             if (!chartElement) return;

//             let myChart = chartInstances.current[config.name];
//             if (!myChart || myChart.isDisposed()) {
//                 myChart = echarts.init(chartElement);
//                 chartInstances.current[config.name] = myChart;
//             }

//             const chartData = createChartOption(config.name, config, false);
//             if (!chartData) return;

//             // 📏 Altura dinâmica baseada na quantidade de categorias
//             const height = chartData.catNames.length > 15 ? 700 : chartData.catNames.length > 10 ? 600 : 500;
//             chartElement.style.height = `${height}px`;
//             //@ts-ignore
//             myChart.setOption(chartData.option, true);
//             myChart.resize();
//         });

//         return () => { 
//             Object.values(chartInstances.current).forEach(c => { 
//                 if (c && !c.isDisposed()) c.dispose(); 
//             }); 
//             chartInstances.current = {}; 
//         };
//     }, [custodyGroups, custodyConfig, showPercentage, activeFilters]);

//     // 📊 RENDERIZAR GRÁFICO DO MODAL COM LEGENDA
//     useEffect(() => {
//         if (!expandedChart || !modalChartRef.current) return;

//         const config = custodyConfig.find(c => c.name === expandedChart);
//         if (!config) return;

//         if (modalChartInstance.current && !modalChartInstance.current.isDisposed()) {
//             modalChartInstance.current.dispose();
//         }

//         modalChartInstance.current = echarts.init(modalChartRef.current);
//         const chartData = createChartOption(expandedChart, config, true);

//         if (chartData) {
//             // ⭐ ADICIONAR LEGENDA VISUAL NO GRÁFICO DO MODAL
//             const optionWithLegend = {
//                 ...chartData.option,
//                 legend: {
//                     show: true,
//                     top: 20,
//                     left: 'center',
//                     itemWidth: 35,
//                     itemHeight: 22,
//                     textStyle: {
//                         fontSize: 14,
//                         fontWeight: 'bold',
//                         color: '#333'
//                     },
//                     itemGap: 40,
//                     padding: [10, 20],
//                     backgroundColor: 'rgba(255, 255, 255, 0.9)',
//                     borderRadius: 8,
//                     shadowBlur: 10,
//                     shadowColor: 'rgba(0, 0, 0, 0.1)',
//                     shadowOffsetY: 2,
//                     data: [
//                         {
//                             name: '<30 DIAS',
//                             icon: 'roundRect',
//                             itemStyle: {
//                                 color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
//                                     { offset: 0, color: ageColors[0].light },
//                                     { offset: 1, color: ageColors[0].dark }
//                                 ]),
//                                 borderRadius: 4
//                             }
//                         },
//                         {
//                             name: '30-60 DIAS',
//                             icon: 'roundRect',
//                             itemStyle: {
//                                 color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
//                                     { offset: 0, color: ageColors[1].light },
//                                     { offset: 1, color: ageColors[1].dark }
//                                 ]),
//                                 borderRadius: 4
//                             }
//                         },
//                         {
//                             name: '60-90 DIAS',
//                             icon: 'roundRect',
//                             itemStyle: {
//                                 color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
//                                     { offset: 0, color: ageColors[2].light },
//                                     { offset: 1, color: ageColors[2].dark }
//                                 ]),
//                                 borderRadius: 4
//                             }
//                         },
//                         {
//                             name: '>90 DIAS',
//                             icon: 'roundRect',
//                             itemStyle: {
//                                 color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
//                                     { offset: 0, color: ageColors[3].light },
//                                     { offset: 1, color: ageColors[3].dark }
//                                 ]),
//                                 borderRadius: 4
//                             }
//                         }
//                     ].filter(item => {
//                         // Mostrar apenas legendas dos períodos ativos
//                         const periodKey = item.name === '<30 DIAS' ? 'period0' :
//                                          item.name === '30-60 DIAS' ? 'period1' :
//                                          item.name === '60-90 DIAS' ? 'period2' : 'period3';
//                         return activeFilters[periodKey as keyof typeof activeFilters];
//                     })
//                 },
//                 // Ajustar o grid para dar espaço à legenda
//                 grid: {
//                     ...chartData.option.grid,
//                     top: 85
//                 }
//             };
//             //@ts-ignore
//             modalChartInstance.current.setOption(optionWithLegend, true);
//             modalChartInstance.current.resize();
//         }

//         return () => {
//             if (modalChartInstance.current && !modalChartInstance.current.isDisposed()) {
//                 modalChartInstance.current.dispose();
//                 modalChartInstance.current = null;
//             }
//         };
//     }, [expandedChart, custodyConfig, showPercentage, activeFilters]);

//     useEffect(() => {
//         const resize = () => { 
//             Object.values(chartInstances.current).forEach(c => { 
//                 if (c && !c.isDisposed()) c.resize(); 
//             });
//             if (modalChartInstance.current && !modalChartInstance.current.isDisposed()) {
//                 modalChartInstance.current.resize();
//             }
//         };
//         window.addEventListener('resize', resize);
//         return () => window.removeEventListener('resize', resize);
//     }, []);

//     if (loading && Object.keys(custodyGroups).length === 0) {
//         return (
//             <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
//                 <div className="text-center bg-white p-10 rounded-2xl shadow-2xl">
//                     <ArrowPathIcon className="w-20 h-20 text-blue-500 animate-spin mx-auto mb-4" />
//                     <p className="text-gray-700 text-xl font-semibold">Carregando dados...</p>
//                 </div>
//             </div>
//         );
//     }

//     if (error && Object.keys(custodyGroups).length === 0) {
//         return (
//             <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
//                 <div className="text-center bg-white p-10 rounded-2xl shadow-2xl max-w-md">
//                     <div className="text-red-500 text-6xl mb-4">⚠️</div>
//                     <h2 className="text-2xl font-bold text-gray-800 mb-3">Erro ao Carregar Dados</h2>
//                     <p className="text-red-600 mb-6 text-lg">{error}</p>
//                     <button 
//                         onClick={refetch} 
//                         className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-8 py-3 rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all font-semibold shadow-lg hover:shadow-xl transform hover:scale-105"
//                     >
//                         Tentar Novamente
//                     </button>
//                 </div>
//             </div>
//         );
//     }

//     return (
//         <>
//             <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
//                 <div className="mx-auto">
//                     {/* Header */}
//                     <div className="bg-gradient-to-br from-[#1e3c72] via-[#2a5298] to-[#1e3c72] rounded-t-xl p-6 shadow-2xl relative overflow-hidden">
//                         <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-10"></div>
//                         <h1 className="text-white text-4xl font-bold text-center mb-1 tracking-[3px] relative z-10 drop-shadow-lg">
//                             ONE PAGE REPORT
//                         </h1>
//                         <h2 className="text-[#a8d8ff] text-xl text-center tracking-wide relative z-10">EMBALAGEM</h2>
//                         <div className="absolute right-5 top-1/2 -translate-y-1/2 bg-white px-6 py-3 rounded-lg font-bold text-[#1e3c72] text-sm shadow-xl">
//                             LOGÍSTICA
//                         </div>
//                     </div>

//                     {/* Controls */}
//                     <div className="bg-white rounded-b-xl p-6 shadow-xl">
//                         <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
//                             <div className="flex gap-3 flex-wrap">
//                                 <button 
//                                     onClick={refetch} 
//                                     disabled={loading} 
//                                     className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-semibold transition-all shadow-md hover:shadow-lg ${
//                                         loading 
//                                             ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
//                                             : 'bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 transform hover:scale-105'
//                                     }`}
//                                 >
//                                     <ArrowPathIcon className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
//                                     {loading ? 'Atualizando...' : 'Atualizar'}
//                                 </button>

//                                 <button 
//                                     onClick={exportData} 
//                                     className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-green-600 text-white px-5 py-2.5 rounded-lg hover:from-green-600 hover:to-green-700 transition-all font-semibold shadow-md hover:shadow-lg transform hover:scale-105"
//                                 >
//                                     <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
//                                     </svg>
//                                     Exportar CSV
//                                 </button>

//                                 <button 
//                                     onClick={exportToPDF}
//                                     disabled={exportingPDF}
//                                     className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-semibold transition-all shadow-md hover:shadow-lg ${
//                                         exportingPDF
//                                             ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
//                                             : 'bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 transform hover:scale-105'
//                                     }`}
//                                 >
//                                     <DocumentArrowDownIcon className={`w-5 h-5 ${exportingPDF ? 'animate-bounce' : ''}`} />
//                                     {exportingPDF ? 'Gerando PDF...' : 'Exportar PDF'}
//                                 </button>

//                                 <button
//                                     onClick={() => setShowPercentage(!showPercentage)}
//                                     className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-semibold transition-all shadow-md hover:shadow-lg transform hover:scale-105 ${
//                                         showPercentage
//                                             ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white'
//                                             : 'bg-gradient-to-r from-orange-500 to-orange-600 text-white'
//                                     }`}
//                                 >
//                                     <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
//                                     </svg>
//                                     {showPercentage ? 'Mostrar Números' : 'Mostrar Percentuais'}
//                                 </button>
//                             </div>

//                             {autoRefresh && (
//                                 <div className="text-sm text-gray-600 flex items-center gap-2 bg-green-50 px-4 py-2 rounded-lg border border-green-200">
//                                     <div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse shadow-md"></div>
//                                     <span className="font-medium">Atualização automática ativa</span>
//                                 </div>
//                             )}
//                         </div>

//                         {/* FILTROS DE PERÍODOS */}
//                         <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border-2 border-blue-200">
//                             <div className="flex flex-wrap items-center gap-4">
//                                 <div className="flex items-center gap-2">
//                                     <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
//                                     </svg>
//                                     <span className="font-bold text-gray-700 text-sm">Filtrar por Período:</span>
//                                 </div>

//                                 <div className="flex flex-wrap gap-3">
//                                     {[
//                                         { key: 'period0', label: '<30 DIAS', color: '#5B9BD5', gradient: 'from-[#5B9BD5] to-[#4A8AC4]' },
//                                         { key: 'period1', label: '30-60 DIAS', color: '#70AD47', gradient: 'from-[#70AD47] to-[#5E9539]' },
//                                         { key: 'period2', label: '60-90 DIAS', color: '#FFC000', gradient: 'from-[#FFC000] to-[#E6AC00]' },
//                                         { key: 'period3', label: '>90 DIAS', color: '#A6A6A6', gradient: 'from-[#A6A6A6] to-[#8C8C8C]' }
//                                     ].map((filter) => {
//                                         const isActive = activeFilters[filter.key as keyof typeof activeFilters];
//                                         return (
//                                             <button
//                                                 key={filter.key}
//                                                 onClick={() => toggleFilter(filter.key)}
//                                                 className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm transition-all shadow-md hover:shadow-lg transform hover:scale-105 ${
//                                                     isActive
//                                                         ? `bg-gradient-to-r ${filter.gradient} text-white`
//                                                         : 'bg-white text-gray-400 border-2 border-gray-300'
//                                                 }`}
//                                             >
//                                                 <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
//                                                     isActive ? 'bg-white border-white' : 'border-gray-400'
//                                                 }`}>
//                                                     {isActive && (
//                                                         <svg className="w-3 h-3" style={{ color: filter.color }} fill="currentColor" viewBox="0 0 20 20">
//                                                             <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
//                                                         </svg>
//                                                     )}
//                                                 </div>
//                                                 {filter.label}
//                                             </button>
//                                         );
//                                     })}
//                                 </div>

//                                 <button
//                                     onClick={toggleAllFilters}
//                                     className="ml-auto flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm bg-gray-700 text-white hover:bg-gray-800 transition-all shadow-md hover:shadow-lg"
//                                 >
//                                     <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
//                                     </svg>
//                                     {Object.values(activeFilters).every(v => v) ? 'Desmarcar Todos' : 'Marcar Todos'}
//                                 </button>
//                             </div>
//                         </div>

//                         {/* Stats Cards */}
//                         <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 p-6 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl shadow-inner">
//                             {[
//                                 { label: '<30 DIAS', color: 'text-[#5B9BD5]', bgGradient: 'from-[#5B9BD5]/10 to-[#5B9BD5]/20', value: totalStats[0] },
//                                 { label: '30-60 DIAS', color: 'text-[#70AD47]', bgGradient: 'from-[#70AD47]/10 to-[#70AD47]/20', value: totalStats[1] },
//                                 { label: '60-90 DIAS', color: 'text-[#FFC000]', bgGradient: 'from-[#FFC000]/10 to-[#FFC000]/20', value: totalStats[2] },
//                                 { label: '>90 DIAS', color: 'text-[#A6A6A6]', bgGradient: 'from-[#A6A6A6]/10 to-[#A6A6A6]/20', value: totalStats[3] },
//                             ].map((stat, i) => (
//                                 <div 
//                                     key={i} 
//                                     className={`text-center p-5 bg-gradient-to-br ${stat.bgGradient} rounded-xl shadow-md hover:shadow-xl transition-all transform hover:scale-105 border border-white/50`}
//                                 >
//                                     <div className={`text-4xl font-bold mb-2 ${stat.color} drop-shadow-sm`}>
//                                         {stat.value.toLocaleString('pt-BR')}
//                                     </div>
//                                     <div className="text-xs text-gray-700 uppercase font-bold tracking-wide">
//                                         {stat.label}
//                                     </div>
//                                 </div>
//                             ))}
//                         </div>

//                         {/* Charts Grid */}
//                         <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
//                             {custodyConfig.map((config) => {
//                                 if (!custodyGroups[config.name]) return null;

//                                 // Verificar se tem muitas categorias
//                                 const categories = custodyGroups[config.name];
//                                 const categoryCount = Object.keys(categories).length;
//                                 const hasScroll = categoryCount > 10;

//                                 return (
//                                     <div 
//                                         key={config.name} 
//                                         className="bg-white rounded-xl overflow-hidden shadow-lg border-2 border-gray-100 hover:shadow-2xl hover:border-gray-200 transition-all"
//                                     >
//                                         <div className={`bg-gradient-to-br ${config.gradient} text-white font-bold text-lg py-4 px-4 shadow-md flex items-center justify-between`}>
//                                             <span className="flex-1 text-center">{config.name}</span>
//                                             <button
//                                                 onClick={() => handleExpandChart(config.name)}
//                                                 className="ml-2 p-2 hover:bg-white/20 rounded-lg transition-all transform hover:scale-110"
//                                                 title="Expandir gráfico"
//                                             >
//                                                 <ArrowsPointingOutIcon className="w-5 h-5" />
//                                             </button>
//                                         </div>
//                                         <div className="bg-gradient-to-r from-gray-50 to-gray-100 text-center text-xs text-gray-700 py-2 px-3 border-b-2 border-gray-200 font-medium">
//                                             <span className="inline-block px-3 py-1 bg-white/70 rounded-full">
//                                                 📊 Distribuição por idade (dias desde última movimentação)
//                                                 {hasScroll && <span className="ml-2 text-blue-600 font-bold">• Use scroll horizontal →</span>}
//                                             </span>
//                                         </div>
//                                         <div 
//                                             ref={(el: any) => (chartRefs.current[config.name] = el)} 
//                                             className="w-full p-3" 
//                                         />
//                                     </div>
//                                 );
//                             })}
//                         </div>
//                     </div>

//                     {/* Footer */}
//                     <div className="bg-white p-6 rounded-xl mt-6 shadow-xl flex flex-wrap justify-between items-center gap-5 border-2 border-gray-100">
//                         <div className="flex items-center gap-3 text-sm font-bold text-gray-800 bg-blue-50 px-4 py-2 rounded-lg border border-blue-200">
//                             <ClockIcon className="w-5 h-5 text-blue-600" />
//                             <span>ATUALIZAÇÃO: {updateTime || 'Carregando...'}</span>
//                         </div>
//                         <div className="flex flex-wrap gap-6">
//                             {[
//                                 { label: '<30 DIAS', gradient: 'from-[#7CB5E8] to-[#4A8AC4]' },
//                                 { label: '30 - 60 DIAS', gradient: 'from-[#8DC663] to-[#5E9539]' },
//                                 { label: '60 - 90 DIAS', gradient: 'from-[#FFD24D] to-[#E6AC00]' },
//                                 { label: '>90 DIAS', gradient: 'from-[#BFBFBF] to-[#8C8C8C]' },
//                             ].map((l, i) => (
//                                 <div key={i} className="flex items-center gap-2">
//                                     <div 
//                                         className={`w-14 h-6 rounded-md shadow-md bg-gradient-to-br ${l.gradient} border border-white/50`} 
//                                     />
//                                     <span className="text-sm font-bold text-gray-700">{l.label}</span>
//                                 </div>
//                             ))}
//                         </div>
//                     </div>
//                 </div>
//             </div>

//             {/* 🔍 MODAL DE GRÁFICO EXPANDIDO */}
//             {expandedChart && (
//                 <div 
//                     className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn"
//                     onClick={handleCloseModal}
//                 >
//                     <div 
//                         className="bg-white rounded-2xl shadow-2xl w-full max-w-7xl max-h-[95vh] overflow-hidden animate-scaleIn"
//                         onClick={(e) => e.stopPropagation()}
//                     >
//                         {/* Modal Header */}
//                         <div className={`bg-gradient-to-br ${custodyConfig.find(c => c.name === expandedChart)?.gradient} text-white p-6 flex items-center justify-between shadow-lg`}>
//                             <div>
//                                 <h2 className="text-3xl font-bold mb-1">{expandedChart}</h2>
//                                 <p className="text-sm opacity-90">Visualização Expandida - Todas as Categorias</p>
//                             </div>
//                             <button
//                                 onClick={handleCloseModal}
//                                 className="p-3 hover:bg-white/20 rounded-xl transition-all transform hover:scale-110 hover:rotate-90"
//                                 title="Fechar"
//                             >
//                                 <XMarkIcon className="w-8 h-8" />
//                             </button>
//                         </div>

//                         {/* Modal Body */}
//                         <div className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(95vh - 100px)' }}>
//                             <div 
//                                 ref={modalChartRef}
//                                 style={{ width: '100%', height: '75vh', minHeight: '600px' }}
//                             />
//                         </div>
//                     </div>
//                 </div>
//             )}

//             <style>{`
//                 @keyframes fadeIn {
//                     from {
//                         opacity: 0;
//                     }
//                     to {
//                         opacity: 1;
//                     }
//                 }

//                 @keyframes scaleIn {
//                     from {
//                         opacity: 0;
//                         transform: scale(0.9);
//                     }
//                     to {
//                         opacity: 1;
//                         transform: scale(1);
//                     }
//                 }

//                 .animate-fadeIn {
//                     animation: fadeIn 0.2s ease-out;
//                 }

//                 .animate-scaleIn {
//                     animation: scaleIn 0.3s ease-out;
//                 }
//             `}</style>
//         </>
//     );
// }

// src/Distribution/componentMN0400_332.tsx

import { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import * as echarts from 'echarts';
import { ClockIcon, ArrowPathIcon, DocumentArrowDownIcon, XMarkIcon, ArrowsPointingOutIcon, ChartBarSquareIcon, PhotoIcon } from '@heroicons/react/24/outline';
import { usePackingDistribution } from '../../hooks/usePackingDistribution';
import { useCompany } from '../../hooks/useCompany';
import { useTranslation } from 'react-i18next'; // ou seu hook de tradução
import jsPDF from 'jspdf';
import 'jspdf-autotable';

//@ts-ignore
interface CustodyGroups {
    [custody: string]: {
        [category: string]: number[];
    };
}

// 🎨 Paleta de cores para gerar dinamicamente
const colorPalette = [
    { gradient: 'from-[#4A90E2] to-[#357ABD]', mainColor: '#4A90E2' },
    { gradient: 'from-[#F5A623] to-[#E08E00]', mainColor: '#F5A623' },
    { gradient: 'from-[#50E3C2] to-[#2DB89A]', mainColor: '#50E3C2' },
    { gradient: 'from-[#7ED321] to-[#6AB01A]', mainColor: '#7ED321' },
    { gradient: 'from-[#5A5A5A] to-[#3A3A3A]', mainColor: '#5A5A5A' },
    { gradient: 'from-[#5AC8FA] to-[#3BA3D1]', mainColor: '#5AC8FA' },
    { gradient: 'from-[#BD10E0] to-[#9A0CB8]', mainColor: '#BD10E0' },
    { gradient: 'from-[#B8E986] to-[#95C662]', mainColor: '#B8E986' },
    { gradient: 'from-[#FF6B6B] to-[#E84A4A]', mainColor: '#FF6B6B' },
    { gradient: 'from-[#9B59B6] to-[#8E44AD]', mainColor: '#9B59B6' },
    { gradient: 'from-[#3498DB] to-[#2980B9]', mainColor: '#3498DB' },
    { gradient: 'from-[#E74C3C] to-[#C0392B]', mainColor: '#E74C3C' },
    { gradient: 'from-[#1ABC9C] to-[#16A085]', mainColor: '#1ABC9C' },
    { gradient: 'from-[#F39C12] to-[#D68910]', mainColor: '#F39C12' },
    { gradient: 'from-[#34495E] to-[#2C3E50]', mainColor: '#34495E' },
];

const ageColors = [
    { base: '#5B9BD5', light: '#7CB5E8', dark: '#4A8AC4' },
    { base: '#70AD47', light: '#8DC663', dark: '#5E9539' },
    { base: '#FFC000', light: '#FFD24D', dark: '#E6AC00' },
    { base: '#A6A6A6', light: '#BFBFBF', dark: '#8C8C8C' },
];


// 🆕 Componente de Filtro por Range Temporal
const TimeRangeFilter = ({ 
    onRangeChange, 
    currentRange 
}: { 
    onRangeChange: (range: '30' | '60' | '90' | 'all') => void;
    currentRange: string;
}) => {
    const { t } = useTranslation();

    const ranges = [
        { value: 'all', label: t('packagingDistribution.ranges.all') },
        { value: '30', label: t('packagingDistribution.ranges.last30') },
        { value: '60', label: t('packagingDistribution.ranges.last60') },
        { value: '90', label: t('packagingDistribution.ranges.last90') }
    ];

    return (
        <div className="mb-4 flex items-center gap-2 flex-wrap">
            <span className="text-sm font-medium text-gray-600">
                {t('packagingDistribution.timeRangeFilter')}:
            </span>
            {ranges.map((range) => (
                <button
                    key={range.value}
                    onClick={() => onRangeChange(range.value as '30' | '60' | '90' | 'all')}
                    className={`
                        px-3 py-1.5 rounded text-sm font-medium transition-colors
                        ${currentRange === range.value
                            ? 'bg-blue-600 text-white'
                            : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                        }
                    `}
                >
                    {range.label}
                </button>
            ))}
        </div>
    );
};

export default function PackagingDistribution({ autoRefresh = false, refreshInterval = 600000 }) {
    const { t } = useTranslation(); // ou useI18n(), dependendo da sua configuração
    const chartRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
    const chartInstances = useRef<{ [key: string]: echarts.ECharts }>({});
    const modalChartRef = useRef<HTMLDivElement | null>(null);
    const modalChartInstance = useRef<echarts.ECharts | null>(null);
        const [currentRange, setCurrentRange] = useState<'30' | '60' | '90' | 'all'>('all');


    const [showPercentage, setShowPercentage] = useState(false);
    const [exportingPDF, setExportingPDF] = useState(false);
    const [expandedChart, setExpandedChart] = useState<string | null>(null);

    const { company } = useCompany();

    const [activeFilters, setActiveFilters] = useState({
        period0: true,
        period1: true,
        period2: true,
        period3: true
    });

    const toggleFilter = (period: string) => {
        setActiveFilters(prev => ({
            ...prev,
            [period]: !prev[period as keyof typeof prev]
        }));
    };



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
    const { custodyGroups, totalStats, updateTime, loading, error, refetch, exportData, fetchWithFilters, appliedRange  } = usePackingDistribution({
        autoFetch: true,
        refetchInterval: autoRefresh ? refreshInterval : undefined
    });


         // 🆕 Handler para mudança de range
    const handleRangeChange = useCallback((range: '30' | '60' | '90' | 'all') => {
        setCurrentRange(range);
        if (range === 'all') {
            refetch(); // Buscar todos os dados
        } else {
            fetchWithFilters({ lastSeenRange: range });
        }
    }, [refetch, fetchWithFilters]);

    const custodyConfig = useMemo(() => {
        if (!custodyGroups || Object.keys(custodyGroups).length === 0) return [];

        const custodyNames = Object.keys(custodyGroups).sort();

        return custodyNames.map((name, index) => ({
            name,
            gradient: colorPalette[index % colorPalette.length].gradient,
            mainColor: colorPalette[index % colorPalette.length].mainColor
        }));
    }, [custodyGroups]);

    const normalizeBase64Image = (base64: string): string => {
        if (!base64) return '';

        let result = base64.trim();

        if (result.startsWith('data:')) {
            result = result.split(',')[1];
        }

        if (!result.startsWith('iVBORw0KGgo')) {
            try {
                const decoded = atob(result);
                if (decoded.startsWith('iVBORw0KGgo')) {
                    result = decoded;
                }
            } catch (e) {
                console.warn('Erro ao tentar decodificar base64 da logo');
            }
        }

        return result;
    };

    // 🎯 FUNÇÃO PARA CRIAR CONFIGURAÇÃO DO GRÁFICO
    const createChartOption = (custodyName: string, config: any, isModal = false) => {
        const categories = custodyGroups[custodyName];
        if (!categories) return null;

        const catEntries = Object.entries(categories)
            .map(([name, values]) => ({ name, values, total: values.reduce((a, b) => a + b, 0) }))
            .sort((a, b) => b.total - a.total);

        const totalCats = catEntries.length;
        const limit = isModal ? totalCats : (totalCats > 50 ? 15 : totalCats > 20 ? 20 : totalCats);
        const topCats = catEntries.slice(0, limit);

        if (!isModal && catEntries.length > limit) {
            const others = catEntries.slice(limit);
            const othersVals = [0, 0, 0, 0];
            others.forEach(c => {
                othersVals[0] += c.values[0];
                othersVals[1] += c.values[1];
                othersVals[2] += c.values[2];
                othersVals[3] += c.values[3];
            });
            topCats.push({ name: t('packagingDistribution.others'), values: othersVals, total: othersVals.reduce((a, b) => a + b, 0) });
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

        const allSeries = [
            {
                key: 'period0',
                name: t('packagingDistribution.periods.period0'),
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
                    fontSize: isModal ? 12 : (showPercentage ? 10 : 9),
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
                name: t('packagingDistribution.periods.period1'),
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
                    fontSize: isModal ? 12 : (showPercentage ? 10 : 9),
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
                name: t('packagingDistribution.periods.period2'),
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
                    fontSize: isModal ? 12 : (showPercentage ? 10 : 9),
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
                name: t('packagingDistribution.periods.period3'),
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
                    fontSize: isModal ? 12 : (showPercentage ? 10 : 9),
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

        const series = allSeries.filter(s => activeFilters[s.key as keyof typeof activeFilters]);

        const needsScroll = catNames.length > 10;

        return {
            catNames,
            series,
            config,
            needsScroll,
            option: {
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
                        fontSize: isModal ? 14 : 12
                    },
                    formatter: (params: any) => {
                        const name = params[0].axisValue;
                        let total = 0;
                        params.forEach((p: any) => { total += p.value || 0; });
                        let r = `<div style="font-weight:bold;margin-bottom:8px;font-size:${isModal ? 16 : 14}px;color:${config.mainColor};">${name}</div>`;
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
                        r += `<div style="font-weight:bold;font-size:${isModal ? 15 : 13}px;color:${config.mainColor};">${t('packagingDistribution.total')}: ${total}</div>`;
                        return r;
                    },
                },
                dataZoom: needsScroll ? [
                    {
                        type: 'slider',
                        show: true,
                        xAxisIndex: 0,
                        start: 0,
                        end: isModal ? 100 : Math.min(100, (10 / catNames.length) * 100),
                        bottom: isModal ? 60 : 40,
                        height: 25,
                        handleSize: '80%',
                        handleStyle: {
                            color: config.mainColor,
                            shadowBlur: 3,
                            shadowColor: 'rgba(0, 0, 0, 0.3)',
                            shadowOffsetX: 2,
                            shadowOffsetY: 2
                        },
                        textStyle: {
                            color: '#666',
                            fontSize: 10
                        },
                        borderColor: '#ddd',
                        fillerColor: `${config.mainColor}30`,
                        dataBackground: {
                            lineStyle: {
                                color: config.mainColor,
                                width: 1
                            },
                            areaStyle: {
                                color: `${config.mainColor}20`
                            }
                        },
                        selectedDataBackground: {
                            lineStyle: {
                                color: config.mainColor
                            },
                            areaStyle: {
                                color: `${config.mainColor}40`
                            }
                        }
                    },
                    {
                        type: 'inside',
                        xAxisIndex: 0,
                        start: 0,
                        end: isModal ? 100 : Math.min(100, (10 / catNames.length) * 100),
                        zoomOnMouseWheel: false,
                        moveOnMouseMove: true,
                        moveOnMouseWheel: true
                    }
                ] : undefined,
                grid: {
                    left: isModal ? '5%' : '3%',
                    right: isModal ? '5%' : '4%',
                    bottom: needsScroll ? (isModal ? '120px' : '100px') : (catNames.length > 10 ? '22%' : '16%'),
                    top: isModal ? '15%' : '10%',
                    containLabel: true
                },
                xAxis: {
                    type: 'category',
                    data: catNames,
                    axisLabel: {
                        rotate: 45,
                        fontSize: isModal ? 12 : 10,
                        fontWeight: 'bold',
                        color: '#444',
                        interval: 0,
                        formatter: (value: string) => {
                            const maxLen = isModal ? 20 : 12;
                            return value.length > maxLen ? value.substring(0, maxLen) + '...' : value;
                        }
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
                        fontSize: isModal ? 13 : 11,
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
            }
        };
    };

    const handleExpandChart = (custodyName: string) => {
        setExpandedChart(custodyName);
    };

    const handleCloseModal = () => {
        if (modalChartInstance.current && !modalChartInstance.current.isDisposed()) {
            modalChartInstance.current.dispose();
            modalChartInstance.current = null;
        }
        setExpandedChart(null);
    };

    const exportToPDF = async () => {
        try {
            setExportingPDF(true);
            const doc = new jsPDF('landscape', 'mm', 'a4');
            const pageWidth = doc.internal.pageSize.getWidth();
            const pageHeight = doc.internal.pageSize.getHeight();
            let yPosition = 10;

            // HEADER
            doc.setFillColor(37, 99, 235);
            doc.roundedRect(10, yPosition, pageWidth - 20, 35, 3, 3, 'F');

            const logoX = 15;
            const logoY = yPosition + 5;
            const logoWidth = 40;
            const logoHeight = 12;

            doc.setFillColor(255, 255, 255);
            doc.roundedRect(logoX - 2, logoY - 2, logoWidth + 4, logoHeight + 4, 2, 2, 'F');

            const companyLogoBase64 = company?.details?.logo ?? '';
            if (companyLogoBase64) {
                try {
                    const finalBase64 = normalizeBase64Image(companyLogoBase64);
                    doc.addImage(
                        finalBase64,
                        'PNG',
                        logoX,
                        logoY,
                        logoWidth,
                        logoHeight,
                        undefined,
                        'FAST'
                    );
                    console.log('✅ Logo adicionada com sucesso ao PDF');
                } catch (error) {
                    console.error('❌ Erro ao adicionar logo:', error);
                    doc.setTextColor(37, 99, 235);
                    doc.setFontSize(8);
                    doc.setFont('helvetica', 'bold');
                    doc.text('SMARTX', logoX + logoWidth / 2, logoY + 4, { align: 'center' });
                    doc.setFontSize(6);
                    doc.setFont('helvetica', 'normal');
                    doc.text('Logistics System', logoX + logoWidth / 2, logoY + 8, { align: 'center' });
                }
            } else {
                doc.setTextColor(37, 99, 235);
                doc.setFontSize(8);
                doc.setFont('helvetica', 'bold');
                doc.text('SMARTX', logoX + logoWidth / 2, logoY + 4, { align: 'center' });
                doc.setFontSize(6);
                doc.setFont('helvetica', 'normal');
                doc.text('Logistics System', logoX + logoWidth / 2, logoY + 8, { align: 'center' });
            }

            doc.setTextColor(255, 255, 255);
            doc.setFontSize(18);
            doc.setFont('helvetica', 'bold');
            doc.text(`${t('packagingDistribution.subtitle')} - ${t('packagingDistribution.title').split(' ')[0]} ${t('packagingDistribution.title').split(' ').slice(1).join(' ')}`, logoX + logoWidth + 15, yPosition + 12);

            doc.setDrawColor(255, 255, 255);
            doc.setLineWidth(0.3);
            doc.line(15, yPosition + 22, pageWidth - 15, yPosition + 22);

            const infoY = yPosition + 28;
            doc.setFontSize(9);

            doc.setFont('helvetica', 'bold');
            doc.text(`${t('packagingDistribution.reportCode')}:`, 15, infoY);
            doc.setFont('helvetica', 'normal');
            doc.text(`PKG-${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`, 42, infoY);

            doc.setFont('helvetica', 'bold');
            doc.text(`${t('packagingDistribution.subject')}:`, 15, infoY + 5);
            doc.setFont('helvetica', 'normal');
            doc.text(t('packagingDistribution.packagingAgeAnalysis'), 42, infoY + 5);

            doc.setFont('helvetica', 'bold');
            doc.text(`${t('packagingDistribution.zone')}:`, 95, infoY);
            doc.setFont('helvetica', 'normal');
            doc.text(t('packagingDistribution.allCustodies'), 115, infoY);

            if (company?.details?.full_name) {
                doc.setFont('helvetica', 'bold');
                doc.text(`${t('packagingDistribution.company')}:`, 95, infoY + 5);
                doc.setFont('helvetica', 'normal');
                doc.text(company.details.full_name.toUpperCase(), 115, infoY + 5);
            }

            const totalItems = totalStats.reduce((a, b) => a + b, 0);
            yPosition = 50;

            doc.setFontSize(8);
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(107, 114, 128);
            doc.text(`${t('packagingDistribution.generated')}: ${new Date().toLocaleString('pt-BR')}`, 15, yPosition);
            doc.text(`${t('packagingDistribution.totalRecords')}: ${totalItems}`, 200, yPosition);
            yPosition += 8;

            doc.setTextColor(0, 0, 0);
            doc.setFontSize(12);
            doc.setFont('helvetica', 'bold');
            doc.text(`${t('packagingDistribution.summaryByPeriod')}`, 14, yPosition);
            yPosition += 3;

            const statsData = [
                [t('packagingDistribution.period'), t('packagingDistribution.quantity'), t('packagingDistribution.percentage')],
                [t('packagingDistribution.periods.period0'), totalStats[0].toString(), `${((totalStats[0] / totalItems) * 100).toFixed(1)}%`],
                [t('packagingDistribution.periods.period1'), totalStats[1].toString(), `${((totalStats[1] / totalItems) * 100).toFixed(1)}%`],
                [t('packagingDistribution.periods.period2'), totalStats[2].toString(), `${((totalStats[2] / totalItems) * 100).toFixed(1)}%`],
                [t('packagingDistribution.periods.period3'), totalStats[3].toString(), `${((totalStats[3] / totalItems) * 100).toFixed(1)}%`],
                [t('packagingDistribution.total').toUpperCase(), totalItems.toString(), '100.0%']
            ];

            (doc as any).autoTable({
                startY: yPosition,
                head: [statsData[0]],
                body: statsData.slice(1),
                theme: 'grid',
                headStyles: {
                    fillColor: [37, 99, 235],
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

            for (const config of custodyConfig) {
                const categories = custodyGroups[config.name];
                if (!categories) continue;

                if (yPosition > pageHeight - 60) {
                    doc.addPage();
                    yPosition = 20;
                }

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
                    head: [[t('packagingDistribution.category'), '<30', '%', '30-60', '%', '60-90', '%', '>90', '%', t('packagingDistribution.total')]],
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

            const totalPages = doc.getNumberOfPages();
            for (let i = 1; i <= totalPages; i++) {
                doc.setPage(i);
                doc.setFillColor(240, 240, 240);
                doc.rect(0, pageHeight - 15, pageWidth, 15, 'F');

                doc.setTextColor(60, 60, 60);
                doc.setFontSize(8);
                doc.setFont('helvetica', 'normal');
                doc.text(`${t('packagingDistribution.update')}: ${updateTime || new Date().toLocaleString('pt-BR')}`, 14, pageHeight - 8);
                doc.text(`${t('packagingDistribution.page')} ${i} ${t('packagingDistribution.of')} ${totalPages}`, pageWidth - 14, pageHeight - 8, { align: 'right' });

                doc.setFontSize(7);
                let xLegend = pageWidth / 2 - 60;
                const legends = [
                    { label: t('packagingDistribution.periods.period0'), color: [91, 155, 213] },
                    { label: t('packagingDistribution.periods.period1'), color: [112, 173, 71] },
                    { label: t('packagingDistribution.periods.period2'), color: [255, 192, 0] },
                    { label: t('packagingDistribution.periods.period3'), color: [166, 166, 166] }
                ];

                legends.forEach(leg => {
                    doc.setFillColor(leg.color[0], leg.color[1], leg.color[2]);
                    doc.rect(xLegend, pageHeight - 10, 8, 3, 'F');
                    doc.setTextColor(60, 60, 60);
                    doc.text(leg.label, xLegend + 10, pageHeight - 8);
                    xLegend += 30;
                });
            }

            const fileName = `Packaging_Distribution_${new Date().toISOString().split('T')[0]}.pdf`;
            doc.save(fileName);

            console.log(t('packagingDistribution.pdfExported'));
        } catch (error) {
            console.error('❌ Error generating PDF:', error);
            alert(t('packagingDistribution.pdfError'));
        } finally {
            setExportingPDF(false);
        }
    };

    // Adicione esta nova função após a função exportToPDF existente
    // const exportToPDFWithCharts = async () => {
    //     try {
    //         setExportingPDF(true);
    //         const doc = new jsPDF('landscape', 'mm', 'a4');
    //         const pageWidth = doc.internal.pageSize.getWidth();
    //         const pageHeight = doc.internal.pageSize.getHeight();
    //         let yPosition = 10;

    //         // ==================== HEADER ====================
    //         doc.setFillColor(37, 99, 235);
    //         doc.roundedRect(10, yPosition, pageWidth - 20, 35, 3, 3, 'F');

    //         const logoX = 15;
    //         const logoY = yPosition + 5;
    //         const logoWidth = 40;
    //         const logoHeight = 12;

    //         doc.setFillColor(255, 255, 255);
    //         doc.roundedRect(logoX - 2, logoY - 2, logoWidth + 4, logoHeight + 4, 2, 2, 'F');

    //         const companyLogoBase64 = company?.details?.logo ?? '';
    //         if (companyLogoBase64) {
    //             try {
    //                 const finalBase64 = normalizeBase64Image(companyLogoBase64);
    //                 doc.addImage(finalBase64, 'PNG', logoX, logoY, logoWidth, logoHeight, undefined, 'FAST');
    //             } catch (error) {
    //                 console.error('❌ Erro ao adicionar logo:', error);
    //                 doc.setTextColor(37, 99, 235);
    //                 doc.setFontSize(8);
    //                 doc.setFont('helvetica', 'bold');
    //                 doc.text('SMARTX', logoX + logoWidth / 2, logoY + 4, { align: 'center' });
    //                 doc.setFontSize(6);
    //                 doc.setFont('helvetica', 'normal');
    //                 doc.text('Logistics System', logoX + logoWidth / 2, logoY + 8, { align: 'center' });
    //             }
    //         } else {
    //             doc.setTextColor(37, 99, 235);
    //             doc.setFontSize(8);
    //             doc.setFont('helvetica', 'bold');
    //             doc.text('SMARTX', logoX + logoWidth / 2, logoY + 4, { align: 'center' });
    //             doc.setFontSize(6);
    //             doc.setFont('helvetica', 'normal');
    //             doc.text('Logistics System', logoX + logoWidth / 2, logoY + 8, { align: 'center' });
    //         }

    //         doc.setTextColor(255, 255, 255);
    //         doc.setFontSize(18);
    //         doc.setFont('helvetica', 'bold');
    //         doc.text(`${t('packagingDistribution.subtitle')} - ${t('packagingDistribution.title')} (${t('packagingDistribution.charts')})`, logoX + logoWidth + 15, yPosition + 12);

    //         doc.setDrawColor(255, 255, 255);
    //         doc.setLineWidth(0.3);
    //         doc.line(15, yPosition + 22, pageWidth - 15, yPosition + 22);

    //         const infoY = yPosition + 28;
    //         doc.setFontSize(9);

    //         doc.setFont('helvetica', 'bold');
    //         doc.text(`${t('packagingDistribution.reportCode')}:`, 15, infoY);
    //         doc.setFont('helvetica', 'normal');
    //         doc.text(`PKG-CHARTS-${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`, 42, infoY);

    //         doc.setFont('helvetica', 'bold');
    //         doc.text(`${t('packagingDistribution.subject')}:`, 15, infoY + 5);
    //         doc.setFont('helvetica', 'normal');
    //         doc.text(t('packagingDistribution.packagingAgeAnalysis'), 42, infoY + 5);

    //         doc.setFont('helvetica', 'bold');
    //         doc.text(`${t('packagingDistribution.zone')}:`, 95, infoY);
    //         doc.setFont('helvetica', 'normal');
    //         doc.text(t('packagingDistribution.allCustodies'), 115, infoY);

    //         if (company?.details?.full_name) {
    //             doc.setFont('helvetica', 'bold');
    //             doc.text(`${t('packagingDistribution.company')}:`, 95, infoY + 5);
    //             doc.setFont('helvetica', 'normal');
    //             doc.text(company.details.full_name.toUpperCase(), 115, infoY + 5);
    //         }

    //         const totalItems = totalStats.reduce((a, b) => a + b, 0);
    //         yPosition = 50;

    //         doc.setFontSize(8);
    //         doc.setFont('helvetica', 'normal');
    //         doc.setTextColor(107, 114, 128);
    //         doc.text(`${t('packagingDistribution.generated')}: ${new Date().toLocaleString('pt-BR')}`, 15, yPosition);
    //         doc.text(`${t('packagingDistribution.totalRecords')}: ${totalItems}`, 200, yPosition);
    //         yPosition += 8;

    //         // ==================== SUMMARY STATS ====================
    //         doc.setTextColor(0, 0, 0);
    //         doc.setFontSize(12);
    //         doc.setFont('helvetica', 'bold');
    //         doc.text(`${t('packagingDistribution.summaryByPeriod')}`, 14, yPosition);
    //         yPosition += 3;

    //         const statsData = [
    //             [t('packagingDistribution.period'), t('packagingDistribution.quantity'), t('packagingDistribution.percentage')],
    //             [t('packagingDistribution.periods.period0'), totalStats[0].toString(), `${((totalStats[0] / totalItems) * 100).toFixed(1)}%`],
    //             [t('packagingDistribution.periods.period1'), totalStats[1].toString(), `${((totalStats[1] / totalItems) * 100).toFixed(1)}%`],
    //             [t('packagingDistribution.periods.period2'), totalStats[2].toString(), `${((totalStats[2] / totalItems) * 100).toFixed(1)}%`],
    //             [t('packagingDistribution.periods.period3'), totalStats[3].toString(), `${((totalStats[3] / totalItems) * 100).toFixed(1)}%`],
    //             [t('packagingDistribution.total').toUpperCase(), totalItems.toString(), '100.0%']
    //         ];

    //         (doc as any).autoTable({
    //             startY: yPosition,
    //             head: [statsData[0]],
    //             body: statsData.slice(1),
    //             theme: 'grid',
    //             headStyles: {
    //                 fillColor: [37, 99, 235],
    //                 textColor: 255,
    //                 fontStyle: 'bold',
    //                 halign: 'center'
    //             },
    //             bodyStyles: {
    //                 halign: 'center'
    //             },
    //             columnStyles: {
    //                 0: { fontStyle: 'bold', halign: 'left' },
    //                 1: { halign: 'right' },
    //                 2: { halign: 'right', fontStyle: 'bold' }
    //             },
    //             margin: { left: 14, right: 14 },
    //             didParseCell: (data: any) => {
    //                 if (data.row.index === statsData.length - 2) {
    //                     data.cell.styles.fillColor = [240, 240, 240];
    //                     data.cell.styles.fontStyle = 'bold';
    //                 }
    //             }
    //         });

    //         yPosition = (doc as any).lastAutoTable.finalY + 10;

    //         // ==================== GRÁFICOS (SCREENSHOTS) - UM POR PÁGINA ====================
    //         for (let index = 0; index < custodyConfig.length; index++) {
    //             const config = custodyConfig[index];
    //             const chartInstance = chartInstances.current[config.name];

    //             if (!chartInstance || chartInstance.isDisposed()) {
    //                 console.warn(`Gráfico ${config.name} não disponível`);
    //                 continue;
    //             }

    //             // Adicionar nova página para cada gráfico
    //             doc.addPage();
    //             yPosition = 15;

    //             // Header do gráfico com a cor correspondente
    //             const hexColor = config.mainColor.replace('#', '');
    //             const r = parseInt(hexColor.substr(0, 2), 16);
    //             const g = parseInt(hexColor.substr(2, 2), 16);
    //             const b = parseInt(hexColor.substr(4, 2), 16);

    //             doc.setFillColor(r, g, b);
    //             doc.roundedRect(14, yPosition - 3, pageWidth - 28, 10, 2, 2, 'F');
    //             doc.setTextColor(255, 255, 255);
    //             doc.setFontSize(14);
    //             doc.setFont('helvetica', 'bold');
    //             doc.text(config.name, pageWidth / 2, yPosition + 3, { align: 'center' });

    //             yPosition += 15;

    //             try {
    //                 // 🎯 CAPTURAR IMAGEM DO GRÁFICO EM ALTA RESOLUÇÃO
    //                 const chartImageBase64 = chartInstance.getDataURL({
    //                     type: 'png',
    //                     pixelRatio: 3, // Alta qualidade (era 2, agora é 3)
    //                     backgroundColor: '#ffffff'
    //                 });

    //                 // 📏 DIMENSÕES OTIMIZADAS - UM GRÁFICO POR PÁGINA
    //                 const chartWidth = pageWidth - 28; // Margem de 14 de cada lado
    //                 const chartHeight = pageHeight - yPosition - 25; // Altura máxima disponível (deixando espaço para footer)

    //                 // Adicionar imagem ao PDF
    //                 doc.addImage(
    //                     chartImageBase64,
    //                     'PNG',
    //                     14,
    //                     yPosition,
    //                     chartWidth,
    //                     chartHeight,
    //                     undefined,
    //                     'FAST'
    //                 );

    //                 // Número do gráfico
    //                 doc.setTextColor(100, 100, 100);
    //                 doc.setFontSize(9);
    //                 doc.setFont('helvetica', 'normal');
    //                 doc.text(
    //                     `${t('packagingDistribution.chart')} ${index + 1} ${t('packagingDistribution.of')} ${custodyConfig.length}`,
    //                     pageWidth / 2,
    //                     yPosition + chartHeight + 5,
    //                     { align: 'center' }
    //                 );

    //             } catch (error) {
    //                 console.error(`❌ Erro ao capturar gráfico ${config.name}:`, error);
    //                 doc.setTextColor(255, 0, 0);
    //                 doc.setFontSize(12);
    //                 doc.setFont('helvetica', 'bold');
    //                 doc.text(t('packagingDistribution.chartError'), pageWidth / 2, yPosition + 50, { align: 'center' });
    //             }
    //         }

    //         // ==================== FOOTER EM TODAS AS PÁGINAS ====================
    //         const totalPages = doc.getNumberOfPages();
    //         for (let i = 1; i <= totalPages; i++) {
    //             doc.setPage(i);
    //             doc.setFillColor(240, 240, 240);
    //             doc.rect(0, pageHeight - 15, pageWidth, 15, 'F');

    //             doc.setTextColor(60, 60, 60);
    //             doc.setFontSize(8);
    //             doc.setFont('helvetica', 'normal');
    //             doc.text(`${t('packagingDistribution.update')}: ${updateTime || new Date().toLocaleString('pt-BR')}`, 14, pageHeight - 8);
    //             doc.text(`${t('packagingDistribution.page')} ${i} ${t('packagingDistribution.of')} ${totalPages}`, pageWidth - 14, pageHeight - 8, { align: 'right' });

    //             // Legenda de cores
    //             doc.setFontSize(7);
    //             let xLegend = pageWidth / 2 - 60;
    //             const legends = [
    //                 { label: t('packagingDistribution.periods.period0'), color: [91, 155, 213] },
    //                 { label: t('packagingDistribution.periods.period1'), color: [112, 173, 71] },
    //                 { label: t('packagingDistribution.periods.period2'), color: [255, 192, 0] },
    //                 { label: t('packagingDistribution.periods.period3'), color: [166, 166, 166] }
    //             ];

    //             legends.forEach(leg => {
    //                 doc.setFillColor(leg.color[0], leg.color[1], leg.color[2]);
    //                 doc.rect(xLegend, pageHeight - 10, 8, 3, 'F');
    //                 doc.setTextColor(60, 60, 60);
    //                 doc.text(leg.label, xLegend + 10, pageHeight - 8);
    //                 xLegend += 30;
    //             });
    //         }

    //         const fileName = `Packaging_Distribution_Charts_${new Date().toISOString().split('T')[0]}.pdf`;
    //         doc.save(fileName);

    //         console.log(t('packagingDistribution.pdfExported'));
    //     } catch (error) {
    //         console.error('❌ Error generating PDF with charts:', error);
    //         alert(t('packagingDistribution.pdfError'));
    //     } finally {
    //         setExportingPDF(false);
    //     }
    // };

    const exportToPDFWithCharts = async () => {
    // Atualizar o estado e dar tempo para o React renderizar
    setExportingPDF(true);
    
    // Aguardar um ciclo de renderização
    await new Promise(resolve => setTimeout(resolve, 100));
    
    try {
        const doc = new jsPDF('landscape', 'mm', 'a4');
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        let yPosition = 10;

        // ==================== HEADER ====================
        doc.setFillColor(37, 99, 235);
        doc.roundedRect(10, yPosition, pageWidth - 20, 35, 3, 3, 'F');

        const logoX = 15;
        const logoY = yPosition + 5;
        const logoWidth = 40;
        const logoHeight = 12;
        
        doc.setFillColor(255, 255, 255);
        doc.roundedRect(logoX - 2, logoY - 2, logoWidth + 4, logoHeight + 4, 2, 2, 'F');
        
        const companyLogoBase64 = company?.details?.logo ?? '';
        if (companyLogoBase64) {
            try {
                const finalBase64 = normalizeBase64Image(companyLogoBase64);
                doc.addImage(finalBase64, 'PNG', logoX, logoY, logoWidth, logoHeight, undefined, 'FAST');
            } catch (error) {
                console.error('❌ Erro ao adicionar logo:', error);
                doc.setTextColor(37, 99, 235);
                doc.setFontSize(8);
                doc.setFont('helvetica', 'bold');
                doc.text('SMARTX', logoX + logoWidth / 2, logoY + 4, { align: 'center' });
                doc.setFontSize(6);
                doc.setFont('helvetica', 'normal');
                doc.text('Logistics System', logoX + logoWidth / 2, logoY + 8, { align: 'center' });
            }
        } else {
            doc.setTextColor(37, 99, 235);
            doc.setFontSize(8);
            doc.setFont('helvetica', 'bold');
            doc.text('SMARTX', logoX + logoWidth / 2, logoY + 4, { align: 'center' });
            doc.setFontSize(6);
            doc.setFont('helvetica', 'normal');
            doc.text('Logistics System', logoX + logoWidth / 2, logoY + 8, { align: 'center' });
        }

        doc.setTextColor(255, 255, 255);
        doc.setFontSize(18);
        doc.setFont('helvetica', 'bold');
        doc.text(`${t('packagingDistribution.subtitle')} - ${t('packagingDistribution.title')} (${t('packagingDistribution.charts')})`, logoX + logoWidth + 15, yPosition + 12);

        doc.setDrawColor(255, 255, 255);
        doc.setLineWidth(0.3);
        doc.line(15, yPosition + 22, pageWidth - 15, yPosition + 22);

        const infoY = yPosition + 28;
        doc.setFontSize(9);
        
        doc.setFont('helvetica', 'bold');
        doc.text(`${t('packagingDistribution.reportCode')}:`, 15, infoY);
        doc.setFont('helvetica', 'normal');
        doc.text(`PKG-CHARTS-${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`, 42, infoY);
        
        doc.setFont('helvetica', 'bold');
        doc.text(`${t('packagingDistribution.subject')}:`, 15, infoY + 5);
        doc.setFont('helvetica', 'normal');
        doc.text(t('packagingDistribution.packagingAgeAnalysis'), 42, infoY + 5);

        doc.setFont('helvetica', 'bold');
        doc.text(`${t('packagingDistribution.zone')}:`, 95, infoY);
        doc.setFont('helvetica', 'normal');
        doc.text(t('packagingDistribution.allCustodies'), 115, infoY);

        if (company?.details?.full_name) {
            doc.setFont('helvetica', 'bold');
            doc.text(`${t('packagingDistribution.company')}:`, 95, infoY + 5);
            doc.setFont('helvetica', 'normal');
            doc.text(company.details.full_name.toUpperCase(), 115, infoY + 5);
        }

        const totalItems = totalStats.reduce((a, b) => a + b, 0);
        yPosition = 50;

        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(107, 114, 128);
        doc.text(`${t('packagingDistribution.generated')}: ${new Date().toLocaleString('pt-BR')}`, 15, yPosition);
        doc.text(`${t('packagingDistribution.totalRecords')}: ${totalItems}`, 200, yPosition);
        yPosition += 8;

        // ==================== SUMMARY STATS ====================
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text(`${t('packagingDistribution.summaryByPeriod')}`, 14, yPosition);
        yPosition += 3;

        const statsData = [
            [t('packagingDistribution.period'), t('packagingDistribution.quantity'), t('packagingDistribution.percentage')],
            [t('packagingDistribution.periods.period0'), totalStats[0].toString(), `${((totalStats[0] / totalItems) * 100).toFixed(1)}%`],
            [t('packagingDistribution.periods.period1'), totalStats[1].toString(), `${((totalStats[1] / totalItems) * 100).toFixed(1)}%`],
            [t('packagingDistribution.periods.period2'), totalStats[2].toString(), `${((totalStats[2] / totalItems) * 100).toFixed(1)}%`],
            [t('packagingDistribution.periods.period3'), totalStats[3].toString(), `${((totalStats[3] / totalItems) * 100).toFixed(1)}%`],
            [t('packagingDistribution.total').toUpperCase(), totalItems.toString(), '100.0%']
        ];

        (doc as any).autoTable({
            startY: yPosition,
            head: [statsData[0]],
            body: statsData.slice(1),
            theme: 'grid',
            headStyles: {
                fillColor: [37, 99, 235],
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

        // ==================== GRÁFICOS (SCREENSHOTS) - UM POR PÁGINA ====================
        for (let index = 0; index < custodyConfig.length; index++) {
            const config = custodyConfig[index];
            const chartInstance = chartInstances.current[config.name];
            
            if (!chartInstance || chartInstance.isDisposed()) {
                console.warn(`Gráfico ${config.name} não disponível`);
                continue;
            }

            // Adicionar nova página para cada gráfico
            doc.addPage();
            yPosition = 15;

            // Header do gráfico com a cor correspondente
            const hexColor = config.mainColor.replace('#', '');
            const r = parseInt(hexColor.substr(0, 2), 16);
            const g = parseInt(hexColor.substr(2, 2), 16);
            const b = parseInt(hexColor.substr(4, 2), 16);

            doc.setFillColor(r, g, b);
            doc.roundedRect(14, yPosition - 3, pageWidth - 28, 10, 2, 2, 'F');
            doc.setTextColor(255, 255, 255);
            doc.setFontSize(14);
            doc.setFont('helvetica', 'bold');
            doc.text(config.name, pageWidth / 2, yPosition + 3, { align: 'center' });

            yPosition += 15;

            try {
                // 🎯 CAPTURAR IMAGEM DO GRÁFICO EM ALTA RESOLUÇÃO
                const chartImageBase64 = chartInstance.getDataURL({
                    type: 'png',
                    pixelRatio: 3,
                    backgroundColor: '#ffffff'
                });

                // 📏 DIMENSÕES OTIMIZADAS - UM GRÁFICO POR PÁGINA
                const chartWidth = pageWidth - 28;
                const chartHeight = pageHeight - yPosition - 25;

                // Adicionar imagem ao PDF
                doc.addImage(
                    chartImageBase64,
                    'PNG',
                    14,
                    yPosition,
                    chartWidth,
                    chartHeight,
                    undefined,
                    'FAST'
                );

                // Número do gráfico
                doc.setTextColor(100, 100, 100);
                doc.setFontSize(9);
                doc.setFont('helvetica', 'normal');
                doc.text(
                    `${t('packagingDistribution.chart')} ${index + 1} ${t('packagingDistribution.of')} ${custodyConfig.length}`,
                    pageWidth / 2,
                    yPosition + chartHeight + 5,
                    { align: 'center' }
                );

                // Dar uma pausa entre cada gráfico para não travar a UI
                if (index < custodyConfig.length - 1) {
                    await new Promise(resolve => setTimeout(resolve, 50));
                }

            } catch (error) {
                console.error(`❌ Erro ao capturar gráfico ${config.name}:`, error);
                doc.setTextColor(255, 0, 0);
                doc.setFontSize(12);
                doc.setFont('helvetica', 'bold');
                doc.text(t('packagingDistribution.chartError'), pageWidth / 2, yPosition + 50, { align: 'center' });
            }
        }

        // ==================== FOOTER EM TODAS AS PÁGINAS ====================
        const totalPages = doc.getNumberOfPages();
        for (let i = 1; i <= totalPages; i++) {
            doc.setPage(i);
            doc.setFillColor(240, 240, 240);
            doc.rect(0, pageHeight - 15, pageWidth, 15, 'F');
            
            doc.setTextColor(60, 60, 60);
            doc.setFontSize(8);
            doc.setFont('helvetica', 'normal');
            doc.text(`${t('packagingDistribution.update')}: ${updateTime || new Date().toLocaleString('pt-BR')}`, 14, pageHeight - 8);
            doc.text(`${t('packagingDistribution.page')} ${i} ${t('packagingDistribution.of')} ${totalPages}`, pageWidth - 14, pageHeight - 8, { align: 'right' });
            
            // Legenda de cores
            doc.setFontSize(7);
            let xLegend = pageWidth / 2 - 60;
            const legends = [
                { label: t('packagingDistribution.periods.period0'), color: [91, 155, 213] },
                { label: t('packagingDistribution.periods.period1'), color: [112, 173, 71] },
                { label: t('packagingDistribution.periods.period2'), color: [255, 192, 0] },
                { label: t('packagingDistribution.periods.period3'), color: [166, 166, 166] }
            ];
            
            legends.forEach(leg => {
                doc.setFillColor(leg.color[0], leg.color[1], leg.color[2]);
                doc.rect(xLegend, pageHeight - 10, 8, 3, 'F');
                doc.setTextColor(60, 60, 60);
                doc.text(leg.label, xLegend + 10, pageHeight - 8);
                xLegend += 30;
            });
        }

        const fileName = `Packaging_Distribution_Charts_${new Date().toISOString().split('T')[0]}.pdf`;
        doc.save(fileName);

        console.log(t('packagingDistribution.pdfExported'));
    } catch (error) {
        console.error('❌ Error generating PDF with charts:', error);
        alert(t('packagingDistribution.pdfError'));
    } finally {
        setExportingPDF(false);
    }
};

    // Renderizar gráficos normais
    useEffect(() => {
        if (Object.keys(custodyGroups).length === 0 || custodyConfig.length === 0) return;

        custodyConfig.forEach((config) => {
            const chartElement = chartRefs.current[config.name];
            if (!chartElement) return;

            let myChart = chartInstances.current[config.name];
            if (!myChart || myChart.isDisposed()) {
                myChart = echarts.init(chartElement);
                chartInstances.current[config.name] = myChart;
            }

            const chartData = createChartOption(config.name, config, false);
            if (!chartData) return;

            const height = chartData.catNames.length > 15 ? 700 : chartData.catNames.length > 10 ? 600 : 500;
            chartElement.style.height = `${height}px`;
            //@ts-ignore
            myChart.setOption(chartData.option, true);
            myChart.resize();
        });

        return () => {
            Object.values(chartInstances.current).forEach(c => {
                if (c && !c.isDisposed()) c.dispose();
            });
            chartInstances.current = {};
        };
    }, [custodyGroups, custodyConfig, showPercentage, activeFilters, t]);

    // Renderizar gráfico modal com legenda
    useEffect(() => {
        if (!expandedChart || !modalChartRef.current) return;

        const config = custodyConfig.find(c => c.name === expandedChart);
        if (!config) return;

        if (modalChartInstance.current && !modalChartInstance.current.isDisposed()) {
            modalChartInstance.current.dispose();
        }

        modalChartInstance.current = echarts.init(modalChartRef.current);
        const chartData = createChartOption(expandedChart, config, true);

        if (chartData) {
            const optionWithLegend = {
                ...chartData.option,
                legend: {
                    show: true,
                    top: 20,
                    left: 'center',
                    itemWidth: 35,
                    itemHeight: 22,
                    textStyle: {
                        fontSize: 14,
                        fontWeight: 'bold',
                        color: '#333'
                    },
                    itemGap: 40,
                    padding: [10, 20],
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    borderRadius: 8,
                    shadowBlur: 10,
                    shadowColor: 'rgba(0, 0, 0, 0.1)',
                    shadowOffsetY: 2,
                    data: [
                        {
                            name: t('packagingDistribution.periods.period0'),
                            icon: 'roundRect',
                            itemStyle: {
                                color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                                    { offset: 0, color: ageColors[0].light },
                                    { offset: 1, color: ageColors[0].dark }
                                ]),
                                borderRadius: 4
                            }
                        },
                        {
                            name: t('packagingDistribution.periods.period1'),
                            icon: 'roundRect',
                            itemStyle: {
                                color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                                    { offset: 0, color: ageColors[1].light },
                                    { offset: 1, color: ageColors[1].dark }
                                ]),
                                borderRadius: 4
                            }
                        },
                        {
                            name: t('packagingDistribution.periods.period2'),
                            icon: 'roundRect',
                            itemStyle: {
                                color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                                    { offset: 0, color: ageColors[2].light },
                                    { offset: 1, color: ageColors[2].dark }
                                ]),
                                borderRadius: 4
                            }
                        },
                        {
                            name: t('packagingDistribution.periods.period3'),
                            icon: 'roundRect',
                            itemStyle: {
                                color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                                    { offset: 0, color: ageColors[3].light },
                                    { offset: 1, color: ageColors[3].dark }
                                ]),
                                borderRadius: 4
                            }
                        }
                    ].filter(item => {
                        const periodKey = item.name === t('packagingDistribution.periods.period0') ? 'period0' :
                            item.name === t('packagingDistribution.periods.period1') ? 'period1' :
                                item.name === t('packagingDistribution.periods.period2') ? 'period2' : 'period3';
                        return activeFilters[periodKey as keyof typeof activeFilters];
                    })
                },
                grid: {
                    ...chartData.option.grid,
                    top: 85
                }
            };
            //@ts-ignore
            modalChartInstance.current.setOption(optionWithLegend, true);
            modalChartInstance.current.resize();
        }

        return () => {
            if (modalChartInstance.current && !modalChartInstance.current.isDisposed()) {
                modalChartInstance.current.dispose();
                modalChartInstance.current = null;
            }
        };
    }, [expandedChart, custodyConfig, showPercentage, activeFilters, t]);

    useEffect(() => {
        const resize = () => {
            Object.values(chartInstances.current).forEach(c => {
                if (c && !c.isDisposed()) c.resize();
            });
            if (modalChartInstance.current && !modalChartInstance.current.isDisposed()) {
                modalChartInstance.current.resize();
            }
        };
        window.addEventListener('resize', resize);
        return () => window.removeEventListener('resize', resize);
    }, []);

    if (loading && Object.keys(custodyGroups).length === 0) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
                <div className="text-center bg-white p-10 rounded-2xl shadow-2xl">
                    <ArrowPathIcon className="w-20 h-20 text-blue-500 animate-spin mx-auto mb-4" />
                    <p className="text-gray-700 text-xl font-semibold">{t('packagingDistribution.loading')}</p>
                </div>
            </div>
        );
    }

    if (error && Object.keys(custodyGroups).length === 0) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
                <div className="text-center bg-white p-10 rounded-2xl shadow-2xl max-w-md">
                    <div className="text-red-500 text-6xl mb-4">⚠️</div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-3">{t('packagingDistribution.error')}</h2>
                    <p className="text-red-600 mb-6 text-lg">{error}</p>
                    <button
                        onClick={refetch}
                        className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-8 py-3 rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all font-semibold shadow-lg hover:shadow-xl transform hover:scale-105"
                    >
                        {t('packagingDistribution.tryAgain')}
                    </button>
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
                <div className="mx-auto">
                    {/* Header */}
                    <div className="bg-gradient-to-br from-[#1e3c72] via-[#2a5298] to-[#1e3c72] rounded-t-xl p-6 shadow-2xl relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-10"></div>
                        <h1 className="text-white text-4xl font-bold text-center mb-1 tracking-[3px] relative z-10 drop-shadow-lg">
                            {t('packagingDistribution.title')}
                        </h1>
                        <h2 className="text-[#a8d8ff] text-xl text-center tracking-wide relative z-10">{t('packagingDistribution.subtitle')}</h2>
                        <div className="absolute right-5 top-1/2 -translate-y-1/2 bg-white px-6 py-3 rounded-lg font-bold text-[#1e3c72] text-sm shadow-xl">
                            {t('packagingDistribution.logistics')}
                        </div>
                    </div>

                    {/* Controls */}
                    <div className="bg-white rounded-b-xl p-6 shadow-xl">
                        <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
                            <div className="flex gap-3 flex-wrap">
                                <button
                                    onClick={refetch}
                                    disabled={loading}
                                    className={`cursor-pointer flex items-center gap-2 px-5 py-2.5 rounded-lg font-semibold transition-all shadow-md hover:shadow-lg ${loading
                                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                            : 'bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 transform hover:scale-105'
                                        }`}
                                >
                                    <ArrowPathIcon className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                                    {loading ? t('packagingDistribution.updating') : t('packagingDistribution.update')}
                                </button>

                                <button
                                    onClick={exportData}
                                    className="cursor-pointer flex items-center gap-2 bg-gradient-to-r from-green-500 to-green-600 text-white px-5 py-2.5 rounded-lg hover:from-green-600 hover:to-green-700 transition-all font-semibold shadow-md hover:shadow-lg transform hover:scale-105"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                    {t('packagingDistribution.exportCSV')}
                                </button>

                                <button
                                    onClick={exportToPDF}
                                    disabled={exportingPDF}
                                    className={`cursor-pointer flex items-center gap-2 px-5 py-2.5 rounded-lg font-semibold transition-all shadow-md hover:shadow-lg ${exportingPDF
                                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                            : 'bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 transform hover:scale-105'
                                        }`}
                                >
                                    <DocumentArrowDownIcon className={`w-5 h-5 ${exportingPDF ? 'animate-bounce' : ''}`} />
                                    {exportingPDF ? t('packagingDistribution.generatingPDF') : t('packagingDistribution.exportPDF')}
                                </button>

<button
    onClick={exportToPDFWithCharts}
    disabled={exportingPDF}
    className={`cursor-pointer flex items-center gap-2 px-5 py-2.5 rounded-lg font-semibold transition-all shadow-md hover:shadow-lg ${
        exportingPDF
            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
            : 'bg-gradient-to-r from-purple-500 to-purple-600 text-white hover:from-purple-600 hover:to-purple-700 transform hover:scale-105'
    }`}
>
    {exportingPDF ? (
        <ArrowPathIcon className="w-5 h-5 animate-spin" />
    ) : (
        <PhotoIcon className="w-5 h-5" />
    )}
    <span>
        {exportingPDF ? t('packagingDistribution.generatingPDF') : t('packagingDistribution.exportPDFWithCharts')}
    </span>
</button>

                                <button
                                    onClick={() => setShowPercentage(!showPercentage)}
                                    className={`cursor-pointer flex items-center gap-2 px-5 py-2.5 rounded-lg font-semibold transition-all shadow-md hover:shadow-lg transform hover:scale-105 ${showPercentage
                                            ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white'
                                            : 'bg-gradient-to-r from-orange-500 to-orange-600 text-white'
                                        }`}
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                                    </svg>
                                    {showPercentage ? t('packagingDistribution.showNumbers') : t('packagingDistribution.showPercentage')}
                                </button>
                        {/* 🆕 FILTRO DE RANGE TEMPORAL */}
                        <TimeRangeFilter 
                            onRangeChange={handleRangeChange}
                            currentRange={currentRange}
                        />
                                
                            </div>

                            {autoRefresh && (
                                <div className="text-sm text-gray-600 flex items-center gap-2 bg-green-50 px-4 py-2 rounded-lg border border-green-200">
                                    <div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse shadow-md"></div>
                                    <span className="font-medium">{t('packagingDistribution.autoRefreshActive')}</span>
                                </div>
                            )}
                        </div>

                        {/* FILTROS DE PERÍODOS */}
                        <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border-2 border-blue-200">
                            <div className="flex flex-wrap items-center gap-4">
                                <div className="flex items-center gap-2">
                                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                                    </svg>
                                    <span className="font-bold text-gray-700 text-sm">{t('packagingDistribution.filterByPeriod')}</span>
                                </div>

                                <div className="flex flex-wrap gap-3">
                                    {[
                                        { key: 'period0', label: t('packagingDistribution.periods.period0'), color: '#5B9BD5', gradient: 'from-[#5B9BD5] to-[#4A8AC4]' },
                                        { key: 'period1', label: t('packagingDistribution.periods.period1'), color: '#70AD47', gradient: 'from-[#70AD47] to-[#5E9539]' },
                                        { key: 'period2', label: t('packagingDistribution.periods.period2'), color: '#FFC000', gradient: 'from-[#FFC000] to-[#E6AC00]' },
                                        { key: 'period3', label: t('packagingDistribution.periods.period3'), color: '#A6A6A6', gradient: 'from-[#A6A6A6] to-[#8C8C8C]' }
                                    ].map((filter) => {
                                        const isActive = activeFilters[filter.key as keyof typeof activeFilters];
                                        return (
                                            <button
                                                key={filter.key}
                                                onClick={() => toggleFilter(filter.key)}
                                                className={`cursor-pointer flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm transition-all shadow-md hover:shadow-lg transform hover:scale-105 ${isActive
                                                        ? `bg-gradient-to-r ${filter.gradient} text-white`
                                                        : 'bg-white text-gray-400 border-2 border-gray-300'
                                                    }`}
                                            >
                                                <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${isActive ? 'bg-white border-white' : 'border-gray-400'
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
                                    className="cursor-pointer ml-auto flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm bg-gray-700 text-white hover:bg-gray-800 transition-all shadow-md hover:shadow-lg"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                    </svg>
                                    {Object.values(activeFilters).every(v => v) ? t('packagingDistribution.deselectAll') : t('packagingDistribution.selectAll')}
                                </button>
                            </div>
                        </div>

                        {/* Stats Cards */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 p-6 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl shadow-inner">
                            {[
                                { label: t('packagingDistribution.periods.period0'), color: 'text-[#5B9BD5]', bgGradient: 'from-[#5B9BD5]/10 to-[#5B9BD5]/20', value: totalStats[0] },
                                { label: t('packagingDistribution.periods.period1'), color: 'text-[#70AD47]', bgGradient: 'from-[#70AD47]/10 to-[#70AD47]/20', value: totalStats[1] },
                                { label: t('packagingDistribution.periods.period2'), color: 'text-[#FFC000]', bgGradient: 'from-[#FFC000]/10 to-[#FFC000]/20', value: totalStats[2] },
                                { label: t('packagingDistribution.periods.period3'), color: 'text-[#A6A6A6]', bgGradient: 'from-[#A6A6A6]/10 to-[#A6A6A6]/20', value: totalStats[3] },
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

                                const categories = custodyGroups[config.name];
                                const categoryCount = Object.keys(categories).length;
                                const hasScroll = categoryCount > 10;

                                return (
                                    <div
                                        key={config.name}
                                        className="bg-white rounded-xl overflow-hidden shadow-lg border-2 border-gray-100 hover:shadow-2xl hover:border-gray-200 transition-all"
                                    >
                                        <div className={`bg-gradient-to-br ${config.gradient} text-white font-bold text-lg py-4 px-4 shadow-md flex items-center justify-between`}>
                                            <span className="flex-1 text-center">{config.name}</span>
                                            <button
                                                onClick={() => handleExpandChart(config.name)}
                                                className="cursor-pointer ml-2 p-2 hover:bg-white/20 rounded-lg transition-all transform hover:scale-110"
                                                title={t('packagingDistribution.expandChart')}
                                            >
                                                <ArrowsPointingOutIcon className="w-5 h-5" />
                                            </button>
                                        </div>
                                        <div className="bg-gradient-to-r from-gray-50 to-gray-100 text-center text-xs text-gray-700 py-2 px-3 border-b-2 border-gray-200 font-medium">
                                            <span className="inline-block px-3 py-1 bg-white/70 rounded-full">
                                                <ChartBarSquareIcon className="w-4 h-4 inline mr-1 text-primary-500" /> {t('packagingDistribution.distributionByAge')}
                                                {hasScroll && <span className="ml-2 text-blue-600 font-bold">• {t('packagingDistribution.useHorizontalScroll')}</span>}
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
                            <span>{t('packagingDistribution.lastUpdate')}: {updateTime || t('packagingDistribution.loading')}</span>
                        </div>
                        <div className="flex flex-wrap gap-6">
                            {[
                                { label: t('packagingDistribution.periods.period0'), gradient: 'from-[#7CB5E8] to-[#4A8AC4]' },
                                { label: t('packagingDistribution.periods.period1'), gradient: 'from-[#8DC663] to-[#5E9539]' },
                                { label: t('packagingDistribution.periods.period2'), gradient: 'from-[#FFD24D] to-[#E6AC00]' },
                                { label: t('packagingDistribution.periods.period3'), gradient: 'from-[#BFBFBF] to-[#8C8C8C]' },
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

            {/* MODAL DE GRÁFICO EXPANDIDO */}
            {expandedChart && (
                <div
                    className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn"
                    onClick={handleCloseModal}
                >
                    <div
                        className="bg-white rounded-2xl shadow-2xl w-full max-w-7xl max-h-[95vh] overflow-hidden animate-scaleIn"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className={`bg-gradient-to-br ${custodyConfig.find(c => c.name === expandedChart)?.gradient} text-white p-6 flex items-center justify-between shadow-lg`}>
                            <div>
                                <h2 className="text-3xl font-bold mb-1">{expandedChart}</h2>
                                <p className="text-sm opacity-90">{t('packagingDistribution.expandedView')}</p>
                            </div>
                            <button
                                onClick={handleCloseModal}
                                className="cursor-pointer p-3 hover:bg-white/20 rounded-full transition-all transform hover:scale-110 hover:rotate-90"
                                title={t('packagingDistribution.close')}
                            >
                                <XMarkIcon className="w-8 h-8" />
                            </button>
                        </div>

                        <div className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(95vh - 100px)' }}>
                            <div
                                ref={modalChartRef}
                                style={{ width: '100%', height: '75vh', minHeight: '600px' }}
                            />
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                @keyframes fadeIn {
                    from {
                        opacity: 0;
                    }
                    to {
                        opacity: 1;
                    }
                }

                @keyframes scaleIn {
                    from {
                        opacity: 0;
                        transform: scale(0.9);
                    }
                    to {
                        opacity: 1;
                        transform: scale(1);
                    }
                }

                .animate-fadeIn {
                    animation: fadeIn 0.2s ease-out;
                }

                .animate-scaleIn {
                    animation: scaleIn 0.3s ease-out;
                }
            `}</style>
        </>
    );
}