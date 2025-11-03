// import * as XLSX from 'xlsx-js-style';
// import jsPDF from 'jspdf';
// import autoTable from 'jspdf-autotable';

// // ==========================================
// // 📊 EXPORTAÇÃO PARA EXCEL
// // ==========================================

// interface ExportToExcelOptions {
//   data: any[];
//   filename: string;
//   sheetName?: string;
//   includeFilters?: boolean;
//   filters?: any;
// }

// export const exportToExcel = ({
//   data,
//   filename,
//   sheetName = 'Dados',
//   includeFilters = false,
//   filters
// }: ExportToExcelOptions) => {
//   // Criar workbook
//   const wb = XLSX.utils.book_new();

//   // Preparar dados formatados
//   const formattedData = data.map((device) => ({
//     'Pessoa': device.person_name || '-',
//     'Device UID': device.dev_uid || '-',
//     'Modelo': device.sensor_model || '-',
    
//     // Bateria
//     'Bateria (%)': device.battery_level || 0,
//     'Status Bateria': device.battery_status || '-',
//     'Score Bateria': device.battery_score || 0,
//     'Carregando': device.battery_charging === 'YES' ? 'Sim' : 'Não',
//     'Bateria Atualizada': device.battery_last_updated 
//       ? new Date(device.battery_last_updated).toLocaleString('pt-BR')
//       : '-',
//     'Bateria (min atrás)': device.battery_minutes_ago || 0,
//     'Freshness Bateria': device.battery_freshness || '-',
    
//     // Temperatura
//     'Temperatura': device.temperature ? `${device.temperature}°${device.temperature_unit}` : '-',
//     'Temp Atualizada': device.temperature_last_updated
//       ? new Date(device.temperature_last_updated).toLocaleString('pt-BR')
//       : '-',
//     'Temp (min atrás)': device.temperature_minutes_ago || 0,
//     'Freshness Temp': device.temperature_freshness || '-',
    
//     // Movimento
//     'Status Movimento': device.motion_status || '-',
//     'Valor Movimento': device.motion_status_numeric || 0,
//     'Movimento Atualizado': device.motion_last_updated
//       ? new Date(device.motion_last_updated).toLocaleString('pt-BR')
//       : '-',
//     'Movimento Alterado': device.motion_last_changed
//       ? new Date(device.motion_last_changed).toLocaleString('pt-BR')
//       : '-',
//     'Movimento (min atrás)': device.motion_minutes_ago || 0,
//     'Freshness Movimento': device.motion_freshness || '-',
    
//     // Relatório
//     'Último Relatório': device.last_report_datetime
//       ? new Date(device.last_report_datetime).toLocaleString('pt-BR')
//       : '-',
//     'Minutos desde Report': device.minutes_since_report || 0,
//     'Horas desde Report': device.hours_since_report || 0,
//     'Dias desde Report': device.days_since_report || 0,
//     'Freshness Report': device.report_freshness || '-',
//     'Status Report': device.report_status || '-',
//     'Score Freshness': device.freshness_score || 0,
    
//     // GPS
//     'GPS Age (min)': device.gps_age !== null ? device.gps_age : '-',
//     'Falha GPS': device.loc_fail_reason_descr || 'OK'
//   }));

//   // Criar worksheet principal
//   const ws = XLSX.utils.json_to_sheet(formattedData);

//   // Aplicar estilos ao cabeçalho
//   const range = XLSX.utils.decode_range(ws['!ref'] || 'A1');
//   for (let C = range.s.c; C <= range.e.c; ++C) {
//     const address = XLSX.utils.encode_col(C) + "1";
//     if (!ws[address]) continue;
    
//     ws[address].s = {
//       font: { bold: true, color: { rgb: "FFFFFF" } },
//       fill: { fgColor: { rgb: "4472C4" } },
//       alignment: { horizontal: "center", vertical: "center" },
//       border: {
//         top: { style: "thin", color: { rgb: "000000" } },
//         bottom: { style: "thin", color: { rgb: "000000" } },
//         left: { style: "thin", color: { rgb: "000000" } },
//         right: { style: "thin", color: { rgb: "000000" } }
//       }
//     };
//   }

//   // Aplicar cores de fundo alternadas
//   for (let R = range.s.r + 1; R <= range.e.r; ++R) {
//     for (let C = range.s.c; C <= range.e.c; ++C) {
//       const address = XLSX.utils.encode_cell({ r: R, c: C });
//       if (!ws[address]) continue;
      
//       ws[address].s = {
//         fill: { fgColor: { rgb: R % 2 === 0 ? "F2F2F2" : "FFFFFF" } },
//         border: {
//           top: { style: "thin", color: { rgb: "CCCCCC" } },
//           bottom: { style: "thin", color: { rgb: "CCCCCC" } },
//           left: { style: "thin", color: { rgb: "CCCCCC" } },
//           right: { style: "thin", color: { rgb: "CCCCCC" } }
//         },
//         alignment: { vertical: "center" }
//       };
//     }
//   }

//   // Ajustar largura das colunas
//   const colWidths = [
//     { wch: 20 }, // Pessoa
//     { wch: 18 }, // Device UID
//     { wch: 15 }, // Modelo
//     { wch: 12 }, // Bateria %
//     { wch: 15 }, // Status Bateria
//     { wch: 12 }, // Score Bateria
//     { wch: 12 }, // Carregando
//     { wch: 20 }, // Bateria Atualizada
//     { wch: 15 }, // Bateria min atrás
//     { wch: 18 }, // Freshness Bateria
//     { wch: 12 }, // Temperatura
//     { wch: 20 }, // Temp Atualizada
//     { wch: 15 }, // Temp min atrás
//     { wch: 18 }, // Freshness Temp
//     { wch: 18 }, // Status Movimento
//     { wch: 15 }, // Valor Movimento
//     { wch: 20 }, // Movimento Atualizado
//     { wch: 20 }, // Movimento Alterado
//     { wch: 15 }, // Movimento min atrás
//     { wch: 18 }, // Freshness Movimento
//     { wch: 20 }, // Último Relatório
//     { wch: 18 }, // Minutos desde Report
//     { wch: 18 }, // Horas desde Report
//     { wch: 18 }, // Dias desde Report
//     { wch: 18 }, // Freshness Report
//     { wch: 15 }, // Status Report
//     { wch: 15 }, // Score Freshness
//     { wch: 15 }, // GPS Age
//     { wch: 20 }  // Falha GPS
//   ];
//   ws['!cols'] = colWidths;

//   // Adicionar worksheet ao workbook
//   XLSX.utils.book_append_sheet(wb, ws, sheetName);

//   // Se incluir filtros, criar aba adicional
//   if (includeFilters && filters) {
//     const filterData = [
//       { 'Filtro': 'Nome da Pessoa', 'Valor': filters.personName || 'Nenhum' },
//       { 'Filtro': 'Bateria Mínima (%)', 'Valor': filters.batteryLevelMin },
//       { 'Filtro': 'Bateria Máxima (%)', 'Valor': filters.batteryLevelMax },
//       { 'Filtro': 'Status Bateria', 'Valor': filters.batteryStatus.length > 0 ? filters.batteryStatus.join(', ') : 'Todos' },
//       { 'Filtro': 'Status Movimento', 'Valor': filters.motionStatus.length > 0 ? filters.motionStatus.join(', ') : 'Todos' },
//       { 'Filtro': 'Temperatura Mínima (°C)', 'Valor': filters.temperatureMin ?? 'Nenhum' },
//       { 'Filtro': 'Temperatura Máxima (°C)', 'Valor': filters.temperatureMax ?? 'Nenhum' },
//       { 'Filtro': 'Freshness', 'Valor': filters.reportFreshness.length > 0 ? filters.reportFreshness.join(', ') : 'Todos' },
//       { 'Filtro': 'Data de Exportação', 'Valor': new Date().toLocaleString('pt-BR') }
//     ];

//     const wsFilters = XLSX.utils.json_to_sheet(filterData);
    
//     // Estilizar aba de filtros
//     const filterRange = XLSX.utils.decode_range(wsFilters['!ref'] || 'A1');
//     for (let C = filterRange.s.c; C <= filterRange.e.c; ++C) {
//       const address = XLSX.utils.encode_col(C) + "1";
//       if (!wsFilters[address]) continue;
      
//       wsFilters[address].s = {
//         font: { bold: true, color: { rgb: "FFFFFF" } },
//         fill: { fgColor: { rgb: "E67E22" } },
//         alignment: { horizontal: "center", vertical: "center" }
//       };
//     }

//     wsFilters['!cols'] = [{ wch: 30 }, { wch: 50 }];
//     XLSX.utils.book_append_sheet(wb, wsFilters, 'Filtros Aplicados');
//   }

//   // Gerar arquivo e fazer download
//   XLSX.writeFile(wb, `${filename}.xlsx`);
// };

// // ==========================================
// // 📄 EXPORTAÇÃO PARA PDF
// // ==========================================

// interface ExportToPDFOptions {
//   data: any[];
//   filename: string;
//   title?: string;
//   includeFilters?: boolean;
//   filters?: any;
//   orientation?: 'portrait' | 'landscape';
// }

// export const exportToPDF = ({
//   data,
//   filename,
//   title = 'Relatório de Bateria Baixa',
//   includeFilters = false,
//   filters,
//   orientation = 'landscape'
// }: ExportToPDFOptions) => {
//   // Criar documento PDF
//   const doc = new jsPDF({
//     orientation,
//     unit: 'mm',
//     format: 'a4'
//   });

//   // Configurações
//   const pageWidth = doc.internal.pageSize.getWidth();
//   const pageHeight = doc.internal.pageSize.getHeight();
//   let yPosition = 15;

//   // ===== CABEÇALHO =====
//   doc.setFontSize(18);
//   doc.setFont('helvetica', 'bold');
//   doc.text(title, pageWidth / 2, yPosition, { align: 'center' });
//   yPosition += 10;

//   doc.setFontSize(10);
//   doc.setFont('helvetica', 'normal');
//   doc.text(
//     `Gerado em: ${new Date().toLocaleString('pt-BR')}`,
//     pageWidth / 2,
//     yPosition,
//     { align: 'center' }
//   );
//   yPosition += 3;

//   doc.text(
//     `Total de Registros: ${data.length}`,
//     pageWidth / 2,
//     yPosition,
//     { align: 'center' }
//   );
//   yPosition += 10;

//   // ===== FILTROS APLICADOS =====
//   if (includeFilters && filters) {
//     doc.setFillColor(230, 126, 34);
//     doc.rect(10, yPosition, pageWidth - 20, 8, 'F');
    
//     doc.setTextColor(255, 255, 255);
//     doc.setFontSize(12);
//     doc.setFont('helvetica', 'bold');
//     doc.text('Filtros Aplicados', pageWidth / 2, yPosition + 5.5, { align: 'center' });
    
//     yPosition += 12;
//     doc.setTextColor(0, 0, 0);
//     doc.setFontSize(9);
//     doc.setFont('helvetica', 'normal');

//     const activeFilters: string[] = [];
//     if (filters.personName) activeFilters.push(`Nome: ${filters.personName}`);
//     if (filters.batteryLevelMin !== 0 || filters.batteryLevelMax !== 100) {
//       activeFilters.push(`Bateria: ${filters.batteryLevelMin}% - ${filters.batteryLevelMax}%`);
//     }
//     if (filters.batteryStatus.length > 0) {
//       activeFilters.push(`Status: ${filters.batteryStatus.join(', ')}`);
//     }
//     if (filters.motionStatus.length > 0) {
//       activeFilters.push(`Movimento: ${filters.motionStatus.join(', ')}`);
//     }
//     if (filters.temperatureMin !== undefined || filters.temperatureMax !== undefined) {
//       activeFilters.push(`Temp: ${filters.temperatureMin ?? '-∞'}°C - ${filters.temperatureMax ?? '∞'}°C`);
//     }
//     if (filters.reportFreshness.length > 0) {
//       activeFilters.push(`Freshness: ${filters.reportFreshness.join(', ')}`);
//     }

//     if (activeFilters.length > 0) {
//       activeFilters.forEach((filter) => {
//         doc.text(`• ${filter}`, 15, yPosition);
//         yPosition += 5;
//       });
//     } else {
//       doc.text('• Nenhum filtro aplicado', 15, yPosition);
//       yPosition += 5;
//     }

//     yPosition += 5;
//   }

//   // ===== TABELA DE DADOS =====
//   const tableData = data.map((device) => [
//     device.person_name || '-',
//     device.dev_uid || '-',
//     `${device.battery_level}%`,
//     device.battery_status || '-',
//     device.temperature ? `${device.temperature}°${device.temperature_unit}` : '-',
//     device.motion_status || '-',
//     device.minutes_since_report || '0',
//     device.report_freshness || '-',
//     device.gps_age !== null ? `${device.gps_age}m` : '-'
//   ]);

//   autoTable(doc, {
//     startY: yPosition,
//     head: [[
//       'Pessoa',
//       'Device UID',
//       'Bateria',
//       'Status',
//       'Temp',
//       'Movimento',
//       'Min Report',
//       'Freshness',
//       'GPS Age'
//     ]],
//     body: tableData,
//     styles: {
//       fontSize: 8,
//       cellPadding: 2,
//       overflow: 'linebreak',
//       halign: 'center'
//     },
//     headStyles: {
//       fillColor: [68, 114, 196],
//       textColor: 255,
//       fontStyle: 'bold',
//       halign: 'center'
//     },
//     alternateRowStyles: {
//       fillColor: [245, 245, 245]
//     },
//     columnStyles: {
//       0: { cellWidth: 30, halign: 'left' },
//       1: { cellWidth: 30, halign: 'left' },
//       2: { cellWidth: 20 },
//       3: { cellWidth: 25 },
//       4: { cellWidth: 20 },
//       5: { cellWidth: 25 },
//       6: { cellWidth: 20 },
//       7: { cellWidth: 25 },
//       8: { cellWidth: 20 }
//     },
//     didDrawPage: (data) => {
//       // Adicionar número de página no rodapé
//       const pageCount = (doc as any).internal.getNumberOfPages();
//       const currentPage = (doc as any).internal.getCurrentPageInfo().pageNumber;
      
//       doc.setFontSize(8);
//       doc.text(
//         `Página ${currentPage} de ${pageCount}`,
//         pageWidth / 2,
//         pageHeight - 10,
//         { align: 'center' }
//       );
//     }
//   });

//   // ===== RODAPÉ COM ESTATÍSTICAS =====
//   const finalY = (doc as any).lastAutoTable.finalY + 10;
  
//   if (finalY < pageHeight - 30) {
//     doc.setFillColor(240, 240, 240);
//     doc.rect(10, finalY, pageWidth - 20, 20, 'F');
    
//     doc.setFontSize(10);
//     doc.setFont('helvetica', 'bold');
//     doc.text('Estatísticas', 15, finalY + 7);
    
//     doc.setFont('helvetica', 'normal');
//     doc.setFontSize(9);
    
//     const criticalCount = data.filter(d => d.battery_status === 'CRITICAL').length;
//     const warningCount = data.filter(d => d.battery_status === 'WARNING').length;
//     const movingCount = data.filter(d => d.motion_status === 'MOVING').length;
    
//     doc.text(`• Críticos: ${criticalCount}`, 15, finalY + 13);
//     doc.text(`• Alertas: ${warningCount}`, 15, finalY + 18);
//     doc.text(`• Em Movimento: ${movingCount}`, 80, finalY + 13);
//     doc.text(`• Bateria Média: ${(data.reduce((acc, d) => acc + (d.battery_level || 0), 0) / data.length).toFixed(1)}%`, 80, finalY + 18);
//   }

//   // Salvar PDF
//   doc.save(`${filename}.pdf`);
// };

// // ==========================================
// // 📋 EXPORTAÇÃO SIMPLIFICADA (RESUMO)
// // ==========================================

// export const exportSummaryToExcel = (data: any[], filters: any) => {
//   const wb = XLSX.utils.book_new();

//   // Resumo estatístico
//   const summary = [
//     { 'Métrica': 'Total de Dispositivos', 'Valor': data.length },
//     { 'Métrica': 'Bateria Crítica', 'Valor': data.filter(d => d.battery_status === 'CRITICAL').length },
//     { 'Métrica': 'Bateria Alerta', 'Valor': data.filter(d => d.battery_status === 'WARNING').length },
//     { 'Métrica': 'Bateria Saudável', 'Valor': data.filter(d => d.battery_status === 'HEALTHY').length },
//     { 'Métrica': 'Em Movimento', 'Valor': data.filter(d => d.motion_status === 'MOVING').length },
//     { 'Métrica': 'Parados', 'Valor': data.filter(d => d.motion_status === 'STATIC').length },
//     { 'Métrica': 'Bateria Média', 'Valor': `${(data.reduce((acc, d) => acc + (d.battery_level || 0), 0) / data.length).toFixed(1)}%` },
//     { 'Métrica': 'Temperatura Média', 'Valor': `${(data.reduce((acc, d) => acc + (d.temperature || 0), 0) / data.length).toFixed(1)}°C` }
//   ];

//   const ws = XLSX.utils.json_to_sheet(summary);
  
//   // Estilizar
//   ws['A1'].s = { font: { bold: true }, fill: { fgColor: { rgb: "4472C4" } } };
//   ws['B1'].s = { font: { bold: true }, fill: { fgColor: { rgb: "4472C4" } } };
//   ws['!cols'] = [{ wch: 30 }, { wch: 20 }];

//   XLSX.utils.book_append_sheet(wb, ws, 'Resumo');
//   XLSX.writeFile(wb, `resumo_bateria_${new Date().toISOString().split('T')[0]}.xlsx`);
// };

import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
// @ts-ignore
import autoTable from 'jspdf-autotable';

// ==========================================
// 🌍 TRADUÇÕES PARA EXPORTAÇÃO
// ==========================================

interface ExportTranslations {
  columns: {
    person: string;
    deviceUid: string;
    model: string;
    battery: string;
    batteryStatus: string;
    batteryScore: string;
    charging: string;
    batteryUpdated: string;
    batteryMinutesAgo: string;
    batteryFreshness: string;
    temperature: string;
    tempUpdated: string;
    tempMinutesAgo: string;
    tempFreshness: string;
    motionStatus: string;
    motionValue: string;
    motionUpdated: string;
    motionChanged: string;
    motionMinutesAgo: string;
    motionFreshness: string;
    lastReport: string;
    minutesSinceReport: string;
    hoursSinceReport: string;
    daysSinceReport: string;
    reportFreshness: string;
    reportStatus: string;
    freshnessScore: string;
    gpsAge: string;
    gpsFailure: string;
  };
  values: {
    yes: string;
    no: string;
    ok: string;
    none: string;
    all: string;
  };
  filters: {
    title: string;
    personName: string;
    batteryMin: string;
    batteryMax: string;
    batteryStatus: string;
    motionStatus: string;
    tempMin: string;
    tempMax: string;
    freshness: string;
    exportDate: string;
  };
  pdf: {
    title: string;
    generatedAt: string;
    totalRecords: string;
    filtersApplied: string;
    noFilters: string;
    statistics: string;
    critical: string;
    warnings: string;
    moving: string;
    avgBattery: string;
    page: string;
    of: string;
  };
  summary: {
    sheet: string;
    metric: string;
    value: string;
    totalDevices: string;
    criticalBattery: string;
    warningBattery: string;
    healthyBattery: string;
    moving: string;
    static: string;
    avgBattery: string;
    avgTemp: string;
  };
}

const translations: Record<'pt' | 'es' | 'en', ExportTranslations> = {
  pt: {
    columns: {
      person: 'Pessoa',
      deviceUid: 'Device UID',
      model: 'Modelo',
      battery: 'Bateria (%)',
      batteryStatus: 'Status Bateria',
      batteryScore: 'Score Bateria',
      charging: 'Carregando',
      batteryUpdated: 'Bateria Atualizada',
      batteryMinutesAgo: 'Bateria (min atrás)',
      batteryFreshness: 'Freshness Bateria',
      temperature: 'Temperatura',
      tempUpdated: 'Temp Atualizada',
      tempMinutesAgo: 'Temp (min atrás)',
      tempFreshness: 'Freshness Temp',
      motionStatus: 'Status Movimento',
      motionValue: 'Valor Movimento',
      motionUpdated: 'Movimento Atualizado',
      motionChanged: 'Movimento Alterado',
      motionMinutesAgo: 'Movimento (min atrás)',
      motionFreshness: 'Freshness Movimento',
      lastReport: 'Último Relatório',
      minutesSinceReport: 'Minutos desde Report',
      hoursSinceReport: 'Horas desde Report',
      daysSinceReport: 'Dias desde Report',
      reportFreshness: 'Freshness Report',
      reportStatus: 'Status Report',
      freshnessScore: 'Score Freshness',
      gpsAge: 'GPS Age (min)',
      gpsFailure: 'Falha GPS'
    },
    values: {
      yes: 'Sim',
      no: 'Não',
      ok: 'OK',
      none: 'Nenhum',
      all: 'Todos'
    },
    filters: {
      title: 'Filtros Aplicados',
      personName: 'Nome da Pessoa',
      batteryMin: 'Bateria Mínima (%)',
      batteryMax: 'Bateria Máxima (%)',
      batteryStatus: 'Status Bateria',
      motionStatus: 'Status Movimento',
      tempMin: 'Temperatura Mínima (°C)',
      tempMax: 'Temperatura Máxima (°C)',
      freshness: 'Freshness',
      exportDate: 'Data de Exportação'
    },
    pdf: {
      title: 'Relatório de Alertas de Bateria Baixa',
      generatedAt: 'Gerado em',
      totalRecords: 'Total de Registros',
      filtersApplied: 'Filtros Aplicados',
      noFilters: 'Nenhum filtro aplicado',
      statistics: 'Estatísticas',
      critical: 'Críticos',
      warnings: 'Alertas',
      moving: 'Em Movimento',
      avgBattery: 'Bateria Média',
      page: 'Página',
      of: 'de'
    },
    summary: {
      sheet: 'Resumo',
      metric: 'Métrica',
      value: 'Valor',
      totalDevices: 'Total de Dispositivos',
      criticalBattery: 'Bateria Crítica',
      warningBattery: 'Bateria Alerta',
      healthyBattery: 'Bateria Saudável',
      moving: 'Em Movimento',
      static: 'Parados',
      avgBattery: 'Bateria Média',
      avgTemp: 'Temperatura Média'
    }
  },
  es: {
    columns: {
      person: 'Persona',
      deviceUid: 'UID del Dispositivo',
      model: 'Modelo',
      battery: 'Batería (%)',
      batteryStatus: 'Estado de Batería',
      batteryScore: 'Puntuación de Batería',
      charging: 'Cargando',
      batteryUpdated: 'Batería Actualizada',
      batteryMinutesAgo: 'Batería (min atrás)',
      batteryFreshness: 'Frescura de Batería',
      temperature: 'Temperatura',
      tempUpdated: 'Temp Actualizada',
      tempMinutesAgo: 'Temp (min atrás)',
      tempFreshness: 'Frescura de Temp',
      motionStatus: 'Estado de Movimiento',
      motionValue: 'Valor de Movimiento',
      motionUpdated: 'Movimiento Actualizado',
      motionChanged: 'Movimiento Cambiado',
      motionMinutesAgo: 'Movimiento (min atrás)',
      motionFreshness: 'Frescura de Movimiento',
      lastReport: 'Último Informe',
      minutesSinceReport: 'Minutos desde el Informe',
      hoursSinceReport: 'Horas desde el Informe',
      daysSinceReport: 'Días desde el Informe',
      reportFreshness: 'Frescura del Informe',
      reportStatus: 'Estado del Informe',
      freshnessScore: 'Puntuación de Frescura',
      gpsAge: 'Edad GPS (min)',
      gpsFailure: 'Fallo GPS'
    },
    values: {
      yes: 'Sí',
      no: 'No',
      ok: 'OK',
      none: 'Ninguno',
      all: 'Todos'
    },
    filters: {
      title: 'Filtros Aplicados',
      personName: 'Nombre de la Persona',
      batteryMin: 'Batería Mínima (%)',
      batteryMax: 'Batería Máxima (%)',
      batteryStatus: 'Estado de Batería',
      motionStatus: 'Estado de Movimiento',
      tempMin: 'Temperatura Mínima (°C)',
      tempMax: 'Temperatura Máxima (°C)',
      freshness: 'Frescura',
      exportDate: 'Fecha de Exportación'
    },
    pdf: {
      title: 'Informe de Alertas de Batería Baja',
      generatedAt: 'Generado en',
      totalRecords: 'Total de Registros',
      filtersApplied: 'Filtros Aplicados',
      noFilters: 'Sin filtros aplicados',
      statistics: 'Estadísticas',
      critical: 'Críticos',
      warnings: 'Alertas',
      moving: 'En Movimiento',
      avgBattery: 'Batería Promedio',
      page: 'Página',
      of: 'de'
    },
    summary: {
      sheet: 'Resumen',
      metric: 'Métrica',
      value: 'Valor',
      totalDevices: 'Total de Dispositivos',
      criticalBattery: 'Batería Crítica',
      warningBattery: 'Batería Alerta',
      healthyBattery: 'Batería Saludable',
      moving: 'En Movimiento',
      static: 'Estáticos',
      avgBattery: 'Batería Promedio',
      avgTemp: 'Temperatura Promedio'
    }
  },
  en: {
    columns: {
      person: 'Person',
      deviceUid: 'Device UID',
      model: 'Model',
      battery: 'Battery (%)',
      batteryStatus: 'Battery Status',
      batteryScore: 'Battery Score',
      charging: 'Charging',
      batteryUpdated: 'Battery Updated',
      batteryMinutesAgo: 'Battery (min ago)',
      batteryFreshness: 'Battery Freshness',
      temperature: 'Temperature',
      tempUpdated: 'Temp Updated',
      tempMinutesAgo: 'Temp (min ago)',
      tempFreshness: 'Temp Freshness',
      motionStatus: 'Motion Status',
      motionValue: 'Motion Value',
      motionUpdated: 'Motion Updated',
      motionChanged: 'Motion Changed',
      motionMinutesAgo: 'Motion (min ago)',
      motionFreshness: 'Motion Freshness',
      lastReport: 'Last Report',
      minutesSinceReport: 'Minutes Since Report',
      hoursSinceReport: 'Hours Since Report',
      daysSinceReport: 'Days Since Report',
      reportFreshness: 'Report Freshness',
      reportStatus: 'Report Status',
      freshnessScore: 'Freshness Score',
      gpsAge: 'GPS Age (min)',
      gpsFailure: 'GPS Failure'
    },
    values: {
      yes: 'Yes',
      no: 'No',
      ok: 'OK',
      none: 'None',
      all: 'All'
    },
    filters: {
      title: 'Applied Filters',
      personName: 'Person Name',
      batteryMin: 'Minimum Battery (%)',
      batteryMax: 'Maximum Battery (%)',
      batteryStatus: 'Battery Status',
      motionStatus: 'Motion Status',
      tempMin: 'Minimum Temperature (°C)',
      tempMax: 'Maximum Temperature (°C)',
      freshness: 'Freshness',
      exportDate: 'Export Date'
    },
    pdf: {
      title: 'Low Battery Alerts Report',
      generatedAt: 'Generated at',
      totalRecords: 'Total Records',
      filtersApplied: 'Applied Filters',
      noFilters: 'No filters applied',
      statistics: 'Statistics',
      critical: 'Critical',
      warnings: 'Warnings',
      moving: 'Moving',
      avgBattery: 'Average Battery',
      page: 'Page',
      of: 'of'
    },
    summary: {
      sheet: 'Summary',
      metric: 'Metric',
      value: 'Value',
      totalDevices: 'Total Devices',
      criticalBattery: 'Critical Battery',
      warningBattery: 'Warning Battery',
      healthyBattery: 'Healthy Battery',
      moving: 'Moving',
      static: 'Static',
      avgBattery: 'Average Battery',
      avgTemp: 'Average Temperature'
    }
  }
};

// Helper para detectar idioma
const getLocale = (): 'pt' | 'es' | 'en' => {
  const browserLang = navigator.language.toLowerCase();
  if (browserLang.startsWith('pt')) return 'pt';
  if (browserLang.startsWith('es')) return 'es';
  return 'en';
};

// ==========================================
// 📊 EXPORTAÇÃO PARA EXCEL COM i18n
// ==========================================

interface ExportToExcelOptions {
  data: any[];
  filename: string;
  sheetName?: string;
  includeFilters?: boolean;
  filters?: any;
  locale?: 'pt' | 'es' | 'en';
}

export const exportToExcel = ({
  data,
  filename,
  sheetName,
  includeFilters = false,
  filters,
  locale
}: ExportToExcelOptions) => {
  const lang = locale || getLocale();
  const t = translations[lang];
  
  // Nome da aba principal traduzido
  const mainSheetName = sheetName || (lang === 'pt' ? 'Dados' : lang === 'es' ? 'Datos' : 'Data');

  // Criar workbook
  const wb = XLSX.utils.book_new();

  // Preparar dados formatados com traduções
  const formattedData = data.map((device) => ({
    [t.columns.person]: device.person_name || '-',
    [t.columns.deviceUid]: device.dev_uid || '-',
    [t.columns.model]: device.sensor_model || '-',
    
    // Bateria
    [t.columns.battery]: device.battery_level || 0,
    [t.columns.batteryStatus]: device.battery_status || '-',
    [t.columns.batteryScore]: device.battery_score || 0,
    [t.columns.charging]: device.battery_charging === 'YES' ? t.values.yes : t.values.no,
    [t.columns.batteryUpdated]: device.battery_last_updated 
      ? new Date(device.battery_last_updated).toLocaleString(lang === 'pt' ? 'pt-BR' : lang === 'es' ? 'es-ES' : 'en-US')
      : '-',
    [t.columns.batteryMinutesAgo]: device.battery_minutes_ago || 0,
    [t.columns.batteryFreshness]: device.battery_freshness || '-',
    
    // Temperatura
    [t.columns.temperature]: device.temperature ? `${device.temperature}°${device.temperature_unit}` : '-',
    [t.columns.tempUpdated]: device.temperature_last_updated
      ? new Date(device.temperature_last_updated).toLocaleString(lang === 'pt' ? 'pt-BR' : lang === 'es' ? 'es-ES' : 'en-US')
      : '-',
    [t.columns.tempMinutesAgo]: device.temperature_minutes_ago || 0,
    [t.columns.tempFreshness]: device.temperature_freshness || '-',
    
    // Movimento
    [t.columns.motionStatus]: device.motion_status || '-',
    [t.columns.motionValue]: device.motion_status_numeric || 0,
    [t.columns.motionUpdated]: device.motion_last_updated
      ? new Date(device.motion_last_updated).toLocaleString(lang === 'pt' ? 'pt-BR' : lang === 'es' ? 'es-ES' : 'en-US')
      : '-',
    [t.columns.motionChanged]: device.motion_last_changed
      ? new Date(device.motion_last_changed).toLocaleString(lang === 'pt' ? 'pt-BR' : lang === 'es' ? 'es-ES' : 'en-US')
      : '-',
    [t.columns.motionMinutesAgo]: device.motion_minutes_ago || 0,
    [t.columns.motionFreshness]: device.motion_freshness || '-',
    
    // Relatório
    [t.columns.lastReport]: device.last_report_datetime
      ? new Date(device.last_report_datetime).toLocaleString(lang === 'pt' ? 'pt-BR' : lang === 'es' ? 'es-ES' : 'en-US')
      : '-',
    [t.columns.minutesSinceReport]: device.minutes_since_report || 0,
    [t.columns.hoursSinceReport]: device.hours_since_report || 0,
    [t.columns.daysSinceReport]: device.days_since_report || 0,
    [t.columns.reportFreshness]: device.report_freshness || '-',
    [t.columns.reportStatus]: device.report_status || '-',
    [t.columns.freshnessScore]: device.freshness_score || 0,
    
    // GPS
    [t.columns.gpsAge]: device.gps_age !== null ? device.gps_age : '-',
    [t.columns.gpsFailure]: device.loc_fail_reason_descr || t.values.ok
  }));

  // Criar worksheet principal
  const ws = XLSX.utils.json_to_sheet(formattedData);

  // Ajustar largura das colunas
  const colWidths = Array(29).fill({ wch: 18 });
  ws['!cols'] = colWidths;

  // Adicionar worksheet ao workbook
  XLSX.utils.book_append_sheet(wb, ws, mainSheetName);

  // Aba de filtros
  if (includeFilters && filters) {
    const filterData = [
      { [t.summary.metric]: t.filters.personName, [t.summary.value]: filters.personName || t.values.none },
      { [t.summary.metric]: t.filters.batteryMin, [t.summary.value]: filters.batteryLevelMin },
      { [t.summary.metric]: t.filters.batteryMax, [t.summary.value]: filters.batteryLevelMax },
      { [t.summary.metric]: t.filters.batteryStatus, [t.summary.value]: filters.batteryStatus?.length > 0 ? filters.batteryStatus.join(', ') : t.values.all },
      { [t.summary.metric]: t.filters.motionStatus, [t.summary.value]: filters.motionStatus?.length > 0 ? filters.motionStatus.join(', ') : t.values.all },
      { [t.summary.metric]: t.filters.tempMin, [t.summary.value]: filters.temperatureMin ?? t.values.none },
      { [t.summary.metric]: t.filters.tempMax, [t.summary.value]: filters.temperatureMax ?? t.values.none },
      { [t.summary.metric]: t.filters.freshness, [t.summary.value]: filters.reportFreshness?.length > 0 ? filters.reportFreshness.join(', ') : t.values.all },
      { [t.summary.metric]: t.filters.exportDate, [t.summary.value]: new Date().toLocaleString(lang === 'pt' ? 'pt-BR' : lang === 'es' ? 'es-ES' : 'en-US') }
    ];

    const wsFilters = XLSX.utils.json_to_sheet(filterData);
    wsFilters['!cols'] = [{ wch: 30 }, { wch: 50 }];
    XLSX.utils.book_append_sheet(wb, wsFilters, t.filters.title);
  }

  // Gerar arquivo e fazer download
  XLSX.writeFile(wb, `${filename}.xlsx`);
};

// ==========================================
// 📄 EXPORTAÇÃO PARA PDF COM i18n
// ==========================================

interface ExportToPDFOptions {
  data: any[];
  filename: string;
  title?: string;
  includeFilters?: boolean;
  filters?: any;
  orientation?: 'portrait' | 'landscape';
  locale?: 'pt' | 'es' | 'en';
}

export const exportToPDF = ({
  data,
  filename,
  title,
  includeFilters = false,
  filters,
  orientation = 'landscape',
  locale
}: ExportToPDFOptions) => {
  const lang = locale || getLocale();
  const t = translations[lang];
  const pdfTitle = title || t.pdf.title;

  // Criar documento PDF
  const doc = new jsPDF({ orientation, unit: 'mm', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  let yPosition = 15;

  // Cabeçalho
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text(pdfTitle, pageWidth / 2, yPosition, { align: 'center' });
  yPosition += 10;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(
    `${t.pdf.generatedAt}: ${new Date().toLocaleString(lang === 'pt' ? 'pt-BR' : lang === 'es' ? 'es-ES' : 'en-US')}`,
    pageWidth / 2,
    yPosition,
    { align: 'center' }
  );
  yPosition += 3;

  doc.text(
    `${t.pdf.totalRecords}: ${data.length}`,
    pageWidth / 2,
    yPosition,
    { align: 'center' }
  );
  yPosition += 10;

  // Filtros
  if (includeFilters && filters) {
    doc.setFillColor(230, 126, 34);
    doc.rect(10, yPosition, pageWidth - 20, 8, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(t.pdf.filtersApplied, pageWidth / 2, yPosition + 5.5, { align: 'center' });
    
    yPosition += 12;
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');

    const activeFilters: string[] = [];
    if (filters.personName) activeFilters.push(`${t.filters.personName}: ${filters.personName}`);
    if (filters.batteryLevelMin !== 0 || filters.batteryLevelMax !== 100) {
      activeFilters.push(`${t.filters.batteryStatus}: ${filters.batteryLevelMin}% - ${filters.batteryLevelMax}%`);
    }
    if (filters.batteryStatus?.length > 0) {
      activeFilters.push(`${t.filters.batteryStatus}: ${filters.batteryStatus.join(', ')}`);
    }
    if (filters.motionStatus?.length > 0) {
      activeFilters.push(`${t.filters.motionStatus}: ${filters.motionStatus.join(', ')}`);
    }
    if (filters.temperatureMin !== undefined || filters.temperatureMax !== undefined) {
      activeFilters.push(`${t.filters.tempMin}: ${filters.temperatureMin ?? '-∞'}°C - ${filters.temperatureMax ?? '∞'}°C`);
    }

    if (activeFilters.length > 0) {
      activeFilters.forEach((filter) => {
        doc.text(`• ${filter}`, 15, yPosition);
        yPosition += 5;
      });
    } else {
      doc.text(`• ${t.pdf.noFilters}`, 15, yPosition);
      yPosition += 5;
    }

    yPosition += 5;
  }

  // Tabela
  const tableData = data.map((device) => [
    device.person_name || '-',
    device.dev_uid || '-',
    `${device.battery_level}%`,
    device.battery_status || '-',
    device.temperature ? `${device.temperature}°${device.temperature_unit}` : '-',
    device.motion_status || '-',
    device.minutes_since_report || '0',
    device.report_freshness || '-',
    device.gps_age !== null ? `${device.gps_age}m` : '-'
  ]);

  autoTable(doc, {
    startY: yPosition,
    head: [[
      t.columns.person,
      t.columns.deviceUid,
      t.columns.battery,
      t.columns.batteryStatus,
      t.columns.temperature,
      t.columns.motionStatus,
      t.columns.minutesSinceReport,
      t.columns.reportFreshness,
      t.columns.gpsAge
    ]],
    body: tableData,
    styles: { fontSize: 8, cellPadding: 2, overflow: 'linebreak', halign: 'center' },
    headStyles: { fillColor: [68, 114, 196], textColor: 255, fontStyle: 'bold', halign: 'center' },
    alternateRowStyles: { fillColor: [245, 245, 245] },
    columnStyles: {
      0: { cellWidth: 30, halign: 'left' },
      1: { cellWidth: 30, halign: 'left' },
      2: { cellWidth: 20 },
      3: { cellWidth: 25 },
      4: { cellWidth: 20 },
      5: { cellWidth: 25 },
      6: { cellWidth: 20 },
      7: { cellWidth: 25 },
      8: { cellWidth: 20 }
    },
    didDrawPage: () => {
      const pageCount = (doc as any).internal.getNumberOfPages();
      const currentPage = (doc as any).internal.getCurrentPageInfo().pageNumber;
      doc.setFontSize(8);
      doc.text(`${t.pdf.page} ${currentPage} ${t.pdf.of} ${pageCount}`, pageWidth / 2, pageHeight - 10, { align: 'center' });
    }
  });

  // Estatísticas
  const finalY = (doc as any).lastAutoTable.finalY + 10;
  if (finalY < pageHeight - 30) {
    doc.setFillColor(240, 240, 240);
    doc.rect(10, finalY, pageWidth - 20, 20, 'F');
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text(t.pdf.statistics, 15, finalY + 7);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    
    const criticalCount = data.filter(d => d.battery_status === 'CRITICAL').length;
    const warningCount = data.filter(d => d.battery_status === 'WARNING').length;
    const movingCount = data.filter(d => d.motion_status === 'MOVING').length;
    
    doc.text(`• ${t.pdf.critical}: ${criticalCount}`, 15, finalY + 13);
    doc.text(`• ${t.pdf.warnings}: ${warningCount}`, 15, finalY + 18);
    doc.text(`• ${t.pdf.moving}: ${movingCount}`, 80, finalY + 13);
    doc.text(`• ${t.pdf.avgBattery}: ${(data.reduce((acc, d) => acc + (d.battery_level || 0), 0) / data.length).toFixed(1)}%`, 80, finalY + 18);
  }

  doc.save(`${filename}.pdf`);
};

// ==========================================
// 📋 EXPORTAÇÃO RESUMO COM i18n
// ==========================================

export const exportSummaryToExcel = (data: any[], locale?: 'pt' | 'es' | 'en') => {
  const lang = locale || getLocale();
  const t = translations[lang];
  
  const wb = XLSX.utils.book_new();

  const summary = [
    { [t.summary.metric]: t.summary.totalDevices, [t.summary.value]: data.length },
    { [t.summary.metric]: t.summary.criticalBattery, [t.summary.value]: data.filter(d => d.battery_status === 'CRITICAL').length },
    { [t.summary.metric]: t.summary.warningBattery, [t.summary.value]: data.filter(d => d.battery_status === 'WARNING').length },
    { [t.summary.metric]: t.summary.healthyBattery, [t.summary.value]: data.filter(d => d.battery_status === 'HEALTHY').length },
    { [t.summary.metric]: t.summary.moving, [t.summary.value]: data.filter(d => d.motion_status === 'MOVING').length },
    { [t.summary.metric]: t.summary.static, [t.summary.value]: data.filter(d => d.motion_status === 'STATIC').length },
    { [t.summary.metric]: t.summary.avgBattery, [t.summary.value]: `${(data.reduce((acc, d) => acc + (d.battery_level || 0), 0) / data.length).toFixed(1)}%` },
    { [t.summary.metric]: t.summary.avgTemp, [t.summary.value]: `${(data.reduce((acc, d) => acc + (d.temperature || 0), 0) / data.length).toFixed(1)}°C` }
  ];

  const ws = XLSX.utils.json_to_sheet(summary);
  ws['!cols'] = [{ wch: 30 }, { wch: 20 }];

  XLSX.utils.book_append_sheet(wb, ws, t.summary.sheet);
  XLSX.writeFile(wb, `${lang === 'pt' ? 'resumo' : lang === 'es' ? 'resumen' : 'summary'}_bateria_${new Date().toISOString().split('T')[0]}.xlsx`);
};

// ==========================================
// 📊 EXPORTAÇÃO CSV COM i18n
// ==========================================

export const exportToCSV = (data: any[], filename: string, locale?: 'pt' | 'es' | 'en') => {
  const lang = locale || getLocale();
  const t = translations[lang];
  
  const formattedData = data.map((device) => ({
    [t.columns.person]: device.person_name || '-',
    [t.columns.deviceUid]: device.dev_uid || '-',
    [t.columns.battery]: device.battery_level || 0,
    [t.columns.batteryStatus]: device.battery_status || '-',
    [t.columns.temperature]: device.temperature || '-',
    [t.columns.motionStatus]: device.motion_status || '-',
    [t.columns.lastReport]: device.last_report_datetime 
      ? new Date(device.last_report_datetime).toLocaleString(lang === 'pt' ? 'pt-BR' : lang === 'es' ? 'es-ES' : 'en-US')
      : '-'
  }));

  const ws = XLSX.utils.json_to_sheet(formattedData);
  const csv = XLSX.utils.sheet_to_csv(ws);

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};