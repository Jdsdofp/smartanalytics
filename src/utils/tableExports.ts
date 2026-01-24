// src/utils/tableExports.ts
import jsPDF from 'jspdf';
//@ts-ignore
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
//@ts-ignore
import { saveAs } from 'file-saver';

// =====================================
// 📝 TYPES
// =====================================

interface ExportColumn<T> {
  header: string;
  key: keyof T;
  width?: number;
}

// Atualizar a interface para aceitar metadata opcional
interface ExportMetadata {
  subject?: string;
  status_job?: string;
  job_type_name?: string;
  job_class_name?: string;
  to_custody_name?: string;
  to_zone_name?: string;
  percentual_concluido?: number;
  items_concluidos?: number;
  items_pendentes?: number;
  total_items?: number;
  due_date?: string;
  code_user_job?: string;
}


// =====================================
// 📄 PDF EXPORT
// =====================================

// export const exportToPDF = <T extends Record<string, any>>(
//   data: T[],
//   columns: ExportColumn<T>[],
//   fileName: string,
//   title?: string
// ): void => {
  
//     const doc = new jsPDF({
//     orientation: 'landscape', // 'portrait' (padrão) ou 'landscape'
//     unit: 'mm',
//     format: 'a4'
//   });
  
//   // Add title
//   if (title) {
//     doc.setFontSize(16);
//     doc.text(title, 14, 15);
//   }

//   // Add metadata
//   doc.setFontSize(10);
//   doc.text(`Generated: ${new Date().toLocaleString()}`, 14, title ? 25 : 15);
//   doc.text(`Total Records: ${data.length}`, 14, title ? 32 : 22);

//   // Prepare table data
//   const headers = columns.map(col => col.header);
//   const rows = data.map(item =>
//     columns.map(col => {
//       const value = item[col.key];
//       if (value === null || value === undefined) return '-';
//       //@ts-ignore
//       if (value instanceof Date) return value.toLocaleDateString();
//       return String(value);
//     })
//   );

//   // Add table
//   autoTable(doc, {
//     head: [headers],
//     body: rows,
//     startY: title ? 38 : 28,
//     styles: { fontSize: 8, cellPadding: 2 },
//     headStyles: { fillColor: [59, 130, 246], fontStyle: 'bold' },
//     alternateRowStyles: { fillColor: [248, 250, 252] },
//     columnStyles: columns.reduce((acc, col, index) => {
//       if (col.width) {
//         acc[index] = { cellWidth: col.width };
//       }
//       return acc;
//     }, {} as Record<number, { cellWidth: number }>),
//   });

//   doc.save(`${fileName}_${new Date().getTime()}.pdf`);
// };

// export const exportToPDF = <T extends Record<string, any>>(
//   data: T[],
//   columns: ExportColumn<T>[],
//   fileName: string,
//   title?: string,
//   metadata?: ExportMetadata
// ): void => {
//   const doc = new jsPDF({
//     orientation: 'landscape',
//     unit: 'mm',
//     format: 'a4'
//   });
  
//   let currentY = 15;

//   // Add title
//   if (title) {
//     doc.setFontSize(16);
//     doc.setFont(undefined, 'bold');
    
//     // Split title by newlines for multi-line headers
//     const titleLines = title.split('\n');
//     titleLines.forEach((line, index) => {
//       doc.text(line, 14, currentY + (index * 7));
//     });
    
//     currentY += titleLines.length * 7 + 3;
//   }

//   // Add metadata if provided
//   if (metadata) {
//     doc.setFontSize(9);
//     doc.setFont(undefined, 'normal');
//     doc.setTextColor(60, 60, 60);
    
//     const metadataText = [
//       metadata.subject && `Subject: ${metadata.subject}`,
//       metadata.job_type_name && `Job Type: ${metadata.job_type_name}`,
//       metadata.job_class_name && `Class: ${metadata.job_class_name}`,
//       metadata.status_job && `Status: ${metadata.status_job.replace(/_/g, ' ').toUpperCase()}`,
//       metadata.to_custody_name && `Custody: ${metadata.to_custody_name}`,
//       metadata.to_zone_name && `Zone: ${metadata.to_zone_name}`,
//       metadata.percentual_concluido !== undefined && `Progress: ${Number(metadata.percentual_concluido).toFixed(1)}%`,
//       metadata.total_items && `Items: ${metadata.items_concluidos || 0}/${metadata.total_items} completed`,
//       metadata.due_date && `Due: ${new Date(metadata.due_date).toLocaleDateString()}`
//     ].filter(Boolean);

//     metadataText.forEach((text, index) => {
//       const x = 14 + (index % 2) * 140;
//       const y = currentY + Math.floor(index / 2) * 5;
//       doc.text(text!, x, y);
//     });

//     currentY += Math.ceil(metadataText.length / 2) * 5 + 5;
//   }

//   // Reset text color
//   doc.setTextColor(0, 0, 0);

//   // Add generation info
//   doc.setFontSize(8);
//   doc.setFont(undefined, 'normal');
//   doc.text(`Generated: ${new Date().toLocaleString()}`, 14, currentY);
//   doc.text(`Total Records: ${data.length}`, 150, currentY);
//   currentY += 6;

//   // Prepare table data
//   const headers = columns.map(col => col.header);
//   const rows = data.map(item =>
//     columns.map(col => {
//       const value = item[col.key];
//       if (value === null || value === undefined) return '-';
//       //@ts-ignore
//       if (value instanceof Date) return value.toLocaleDateString();
//       return String(value);
//     })
//   );

//   // Add table
//   autoTable(doc, {
//     head: [headers],
//     body: rows,
//     startY: currentY,
//     styles: { fontSize: 8, cellPadding: 2 },
//     headStyles: { fillColor: [59, 130, 246], fontStyle: 'bold' },
//     alternateRowStyles: { fillColor: [248, 250, 252] },
//     columnStyles: columns.reduce((acc, col, index) => {
//       if (col.width) {
//         acc[index] = { cellWidth: col.width };
//       }
//       return acc;
//     }, {} as Record<number, { cellWidth: number }>),
//   });

//   doc.save(`${fileName}_${new Date().getTime()}.pdf`);
// };


// export const exportToPDF = <T extends Record<string, any>>(
//   data: T[],
//   columns: ExportColumn<T>[],
//   fileName: string,
//   title?: string,
//   metadata?: ExportMetadata
// ): void => {
//   const doc = new jsPDF({
//     orientation: 'landscape',
//     unit: 'mm',
//     format: 'a4'
//   });
  
//   let currentY = 15;

//   // ===== HEADER SECTION =====
//   if (title || metadata) {
//     // Background box for header
//     doc.setFillColor(37, 99, 235); // Blue-600
//     doc.roundedRect(10, 10, 277, metadata ? 55 : 25, 3, 3, 'F');

//     // Title
//     if (title) {
//       doc.setFontSize(18);
//       //@ts-ignore
//       doc.setFont(undefined, 'bold');
//       doc.setTextColor(255, 255, 255);
//       doc.text(title.split('\n')[0], 15, 20);
//       currentY = 28;
//     }

//     // Metadata section
//     if (metadata) {
//       // Divider line
//       doc.setDrawColor(255, 255, 255);
//       doc.setLineWidth(0.3);
//       doc.line(15, currentY, 282, currentY);
//       currentY += 6;

//       doc.setFontSize(9);
//       //@ts-ignore
//       doc.setFont(undefined, 'normal');
//       doc.setTextColor(255, 255, 255);

//       // Column 1
//       let col1Y = currentY;
//       if (metadata.code_user_job) {
//         doc.setFont('helvetica', 'bold');
//         doc.text('Order Code:', 15, col1Y);
//         doc.setFont('helvetica', 'normal');
//         doc.text(metadata.code_user_job, 38, col1Y);
//         col1Y += 5;
//       }

//       if (metadata.subject) {
//         doc.setFont('helvetica', 'bold');
//         doc.text('Subject:', 15, col1Y);
//         doc.setFont('helvetica', 'normal');
//         const subjectText = metadata.subject.length > 35 
//           ? metadata.subject.substring(0, 35) + '...' 
//           : metadata.subject;
//         doc.text(subjectText, 38, col1Y);
//         col1Y += 5;
//       }

//       if (metadata.job_type_name) {
//         doc.setFont('helvetica', 'bold');
//         doc.text('Job Type:', 15, col1Y);
//         doc.setFont('helvetica', 'normal');
//         doc.text(metadata.job_type_name, 38, col1Y);
//         col1Y += 5;
//       }

//       if (metadata.status_job) {
//         doc.setFont('helvetica', 'bold');
//         doc.text('Status:', 15, col1Y);
//         doc.setFont('helvetica', 'normal');
//         doc.text(metadata.status_job.replace(/_/g, ' ').toUpperCase(), 38, col1Y);
//       }

//       // Column 2
//       let col2Y = currentY;
//       if (metadata.to_custody_name) {
//         doc.setFont('helvetica', 'bold');
//         doc.text('Custody:', 95, col2Y);
//         doc.setFont('helvetica', 'normal');
//         doc.text(metadata.to_custody_name, 115, col2Y);
//         col2Y += 5;
//       }

//       if (metadata.to_zone_name) {
//         doc.setFont('helvetica', 'bold');
//         doc.text('Zone:', 95, col2Y);
//         doc.setFont('helvetica', 'normal');
//         doc.text(metadata.to_zone_name, 115, col2Y);
//         col2Y += 5;
//       }

//       if (metadata.due_date) {
//         doc.setFont('helvetica', 'bold');
//         doc.text('Due Date:', 95, col2Y);
//         doc.setFont('helvetica', 'normal');
//         doc.text(new Date(metadata.due_date).toLocaleDateString('en-US', {
//           month: 'short',
//           day: 'numeric',
//           year: 'numeric',
//           hour: '2-digit',
//           minute: '2-digit'
//         }), 115, col2Y);
//       }

//       // Column 3 - Progress Box
//       if (metadata.percentual_concluido !== undefined && metadata.total_items) {
//         const progressX = 180;
//         const progressY = currentY;
        
//         // Progress background
//         doc.setFillColor(255, 255, 255);
//         doc.roundedRect(progressX, progressY - 4, 45, 18, 2, 2, 'F');
        
//         // Progress text
//         doc.setTextColor(37, 99, 235);
//         doc.setFont('helvetica', 'bold');
//         doc.setFontSize(10);
//         doc.text('PROGRESS', progressX + 22.5, progressY + 1, { align: 'center' });
        
//         // Progress bar
//         const barWidth = 40;
//         const barHeight = 4;
//         const barX = progressX + 2.5;
//         const barY = progressY + 3;
        
//         // Background bar
//         doc.setFillColor(229, 231, 235); // Gray-200
//         doc.roundedRect(barX, barY, barWidth, barHeight, 1, 1, 'F');
        
//         // Progress bar fill
//         const fillWidth = (metadata.percentual_concluido / 100) * barWidth;
//         const progressColor = metadata.percentual_concluido >= 80 ? [34, 197, 94] : // Green
//                              metadata.percentual_concluido >= 50 ? [234, 179, 8] : // Yellow
//                              metadata.percentual_concluido >= 25 ? [249, 115, 22] : // Orange
//                              [239, 68, 68]; // Red
//         //@ts-ignore                     
//         doc.setFillColor(...progressColor);
//         doc.roundedRect(barX, barY, fillWidth, barHeight, 1, 1, 'F');
        
//         // Percentage text
//         doc.setFontSize(11);
//         //@ts-ignore
//         doc.setFont(undefined, 'bold');
//         doc.text(`${Number(metadata.percentual_concluido).toFixed(1)}%`, progressX + 22.5, barY + barHeight + 4, { align: 'center' });
//       }

//       // Column 4 - Items Stats Box
//       if (metadata.total_items) {
//         const statsX = 235;
//         const statsY = currentY;
        
//         // Stats background
//         doc.setFillColor(255, 255, 255);
//         doc.roundedRect(statsX, statsY - 4, 47, 20, 2, 2, 'F');
        
//         // Stats title
//         doc.setTextColor(37, 99, 235);
//         doc.setFont('helvetica', 'bold');
//         doc.setFontSize(10);
//         doc.text('ITEMS', statsX + 23.5, statsY + 1, { align: 'center' });
        
//         // Items counts
//         doc.setFontSize(8);
//         doc.setTextColor(60, 60, 60);
        
//         // Total
//         doc.setFont('helvetica', 'normal');
//         doc.text('Total:', statsX + 3, statsY + 6);
//         doc.setFont('helvetica', 'bold');
//         doc.text(String(metadata.total_items), statsX + 44, statsY + 6, { align: 'right' });
        
//         // Completed
//         doc.setFont('helvetica', 'normal');
//         doc.setTextColor(34, 197, 94); // Green
//         doc.text('Done:', statsX + 3, statsY + 10);
//         doc.setFont('helvetica', 'bold');
//         doc.text(String(metadata.items_concluidos || 0), statsX + 44, statsY + 10, { align: 'right' });
        
//         // Pending
//         doc.setFont('helvetica', 'normal');
//         doc.setTextColor(249, 115, 22); // Orange
//         doc.text('Pending:', statsX + 3, statsY + 14);
//         doc.setFont('helvetica', 'bold');
//         doc.text(String(metadata.items_pendentes || 0), statsX + 44, statsY + 14, { align: 'right' });
//       }

//       currentY = 67;
//     } else {
//       currentY = 37;
//     }
//   }

//   // Generation info
//   doc.setFontSize(8);
//   doc.setFont('helvetica', 'normal');
//   doc.setTextColor(107, 114, 128); // Gray-500
//   doc.text(`Generated: ${new Date().toLocaleString()}`, 15, currentY+1);
//   doc.text(`Total Records: ${data.length}`, 200, currentY+1);
//   currentY += 8;

//   // Prepare table data
//   const headers = columns.map(col => col.header);
//   const rows = data.map(item =>
//     columns.map(col => {
//       const value = item[col.key];
//       if (value === null || value === undefined) return '-';
//       //@ts-ignore
//       if (value instanceof Date) return value.toLocaleDateString();
//       return String(value);
//     })
//   );

//   // Add table
//   autoTable(doc, {
//     head: [headers],
//     body: rows,
//     startY: currentY,
//     styles: { 
//       fontSize: 8, 
//       cellPadding: 2,
//       lineColor: [229, 231, 235],
//       lineWidth: 0.1,
//       font: 'helvetica'
//     },
//     headStyles: { 
//       fillColor: [37, 99, 235],
//       textColor: [255, 255, 255],
//       fontStyle: 'bold',
//       halign: 'left'
//     },
//     alternateRowStyles: { 
//       fillColor: [248, 250, 252] 
//     },
//     columnStyles: columns.reduce((acc, col, index) => {
//       if (col.width) {
//         acc[index] = { cellWidth: col.width };
//       }
//       return acc;
//     }, {} as Record<number, { cellWidth: number }>),
//   });

//   doc.save(`${fileName}_${new Date().getTime()}.pdf`);
// };

// src/utils/tableExports.ts

// src/utils/tableExports.ts

export const exportToPDF = <T extends Record<string, any>>(
  data: T[],
  columns: ExportColumn<T>[],
  fileName: string,
  title?: string,
  metadata?: ExportMetadata,
  companyLogoBase64?: string
): void => {
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4'
  });
  
  let currentY = 15;

  // ===== HEADER SECTION =====
  if (title || metadata) {
    // Background box for header
    doc.setFillColor(37, 99, 235); // Blue-600
    doc.roundedRect(10, 10, 277, metadata ? 55 : 25, 3, 3, 'F');

    // ⭐ ADD COMPANY LOGO - CANTO SUPERIOR ESQUERDO
    if (companyLogoBase64) {
      try {
        let finalBase64 = companyLogoBase64;
        
        // Função auxiliar para verificar se é base64 válido de imagem PNG
        const isPngBase64 = (str: string): boolean => {
          return str.startsWith('iVBORw0KGgo') || str.includes('PNG');
        };
        
        // Tentar decodificar até 2 vezes se necessário
        let attempts = 0;
        while (attempts < 2) {
          try {
            const decoded = atob(finalBase64);
            
            if (isPngBase64(finalBase64)) {
              break;
            }
            
            if (isPngBase64(decoded)) {
              finalBase64 = decoded;
              break;
            } else if (decoded.length > 100 && !decoded.includes('\x00')) {
              finalBase64 = decoded;
              attempts++;
            } else {
              finalBase64 = decoded;
              break;
            }
          } catch (e) {
            break;
          }
        }
        
        // ⭐ POSIÇÃO NO CANTO SUPERIOR ESQUERDO
        const logoWidth = 35;
        const logoHeight = 20;
        const logoX = 13; // ⭐ 13mm da margem esquerda
        const logoY = 13; // 13mm do topo
        
        // Fundo branco arredondado para a logo
        doc.setFillColor(255, 255, 255);
        doc.roundedRect(logoX - 2, logoY - 2, logoWidth + 4, logoHeight + 4, 2, 2, 'F');
        
        doc.addImage(
          `data:image/png;base64,${finalBase64}`,
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
        console.error('❌ Error adding logo to PDF:', error);
      }
    }

    // Title - ⭐ Ajustado para não sobrepor a logo
    if (title) {
      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(255, 255, 255);
      // Posicionar o título à direita da logo
      doc.text(title.split('\n')[0], 55, 25); // ⭐ Movido para direita e centralizado verticalmente com a logo
      currentY = 28;
    }

    // Metadata section
    if (metadata) {
      // Divider line
      doc.setDrawColor(255, 255, 255);
      doc.setLineWidth(0.3);
      doc.line(15, currentY, 282, currentY);
      currentY += 6;

      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(255, 255, 255);

      // Column 1
      let col1Y = currentY;
      if (metadata.code_user_job) {
        doc.setFont('helvetica', 'bold');
        doc.text('Order Code:', 15, col1Y);
        doc.setFont('helvetica', 'normal');
        doc.text(metadata.code_user_job, 38, col1Y);
        col1Y += 5;
      }

      if (metadata.subject) {
        doc.setFont('helvetica', 'bold');
        doc.text('Subject:', 15, col1Y);
        doc.setFont('helvetica', 'normal');
        const subjectText = metadata.subject.length > 35 
          ? metadata.subject.substring(0, 35) + '...' 
          : metadata.subject;
        doc.text(subjectText, 38, col1Y);
        col1Y += 5;
      }

      if (metadata.job_type_name) {
        doc.setFont('helvetica', 'bold');
        doc.text('Job Type:', 15, col1Y);
        doc.setFont('helvetica', 'normal');
        doc.text(metadata.job_type_name, 38, col1Y);
        col1Y += 5;
      }

      if (metadata.status_job) {
        doc.setFont('helvetica', 'bold');
        doc.text('Status:', 15, col1Y);
        doc.setFont('helvetica', 'normal');
        doc.text(metadata.status_job.replace(/_/g, ' ').toUpperCase(), 38, col1Y);
      }

      // Column 2
      let col2Y = currentY;
      if (metadata.to_custody_name) {
        doc.setFont('helvetica', 'bold');
        doc.text('Custody:', 95, col2Y);
        doc.setFont('helvetica', 'normal');
        doc.text(metadata.to_custody_name, 115, col2Y);
        col2Y += 5;
      }

      if (metadata.to_zone_name) {
        doc.setFont('helvetica', 'bold');
        doc.text('Zone:', 95, col2Y);
        doc.setFont('helvetica', 'normal');
        doc.text(metadata.to_zone_name, 115, col2Y);
        col2Y += 5;
      }

      if (metadata.due_date) {
        doc.setFont('helvetica', 'bold');
        doc.text('Due Date:', 95, col2Y);
        doc.setFont('helvetica', 'normal');
        doc.text(new Date(metadata.due_date).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        }), 115, col2Y);
      }

      // Column 3 - Progress Box
      if (metadata.percentual_concluido !== undefined && metadata.total_items) {
        const progressX = 180;
        const progressY = currentY;
        
        // Progress background
        doc.setFillColor(255, 255, 255);
        doc.roundedRect(progressX, progressY - 4, 45, 18, 2, 2, 'F');
        
        // Progress text
        doc.setTextColor(37, 99, 235);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        doc.text('PROGRESS', progressX + 22.5, progressY + 1, { align: 'center' });
        
        // Progress bar
        const barWidth = 40;
        const barHeight = 4;
        const barX = progressX + 2.5;
        const barY = progressY + 3;
        
        // Background bar
        doc.setFillColor(229, 231, 235);
        doc.roundedRect(barX, barY, barWidth, barHeight, 1, 1, 'F');
        
        // Progress bar fill
        const fillWidth = (metadata.percentual_concluido / 100) * barWidth;
        const progressColor = metadata.percentual_concluido >= 80 ? [34, 197, 94] :
                             metadata.percentual_concluido >= 50 ? [234, 179, 8] :
                             metadata.percentual_concluido >= 25 ? [249, 115, 22] :
                             [239, 68, 68];
        //@ts-ignore                     
        doc.setFillColor(...progressColor);
        doc.roundedRect(barX, barY, fillWidth, barHeight, 1, 1, 'F');
        
        // Percentage text
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.text(`${Number(metadata.percentual_concluido).toFixed(1)}%`, progressX + 22.5, barY + barHeight + 4, { align: 'center' });
      }

      // Column 4 - Items Stats Box
      if (metadata.total_items) {
        const statsX = 235;
        const statsY = currentY;
        
        // Stats background
        doc.setFillColor(255, 255, 255);
        doc.roundedRect(statsX, statsY - 4, 47, 20, 2, 2, 'F');
        
        // Stats title
        doc.setTextColor(37, 99, 235);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        doc.text('ITEMS', statsX + 23.5, statsY + 1, { align: 'center' });
        
        // Items counts
        doc.setFontSize(8);
        doc.setTextColor(60, 60, 60);
        
        // Total
        doc.setFont('helvetica', 'normal');
        doc.text('Total:', statsX + 3, statsY + 6);
        doc.setFont('helvetica', 'bold');
        doc.text(String(metadata.total_items), statsX + 44, statsY + 6, { align: 'right' });
        
        // Completed
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(34, 197, 94);
        doc.text('Done:', statsX + 3, statsY + 10);
        doc.setFont('helvetica', 'bold');
        doc.text(String(metadata.items_concluidos || 0), statsX + 44, statsY + 10, { align: 'right' });
        
        // Pending
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(249, 115, 22);
        doc.text('Pending:', statsX + 3, statsY + 14);
        doc.setFont('helvetica', 'bold');
        doc.text(String(metadata.items_pendentes || 0), statsX + 44, statsY + 14, { align: 'right' });
      }

      currentY = 67;
    } else {
      currentY = 37;
    }
  }

  // Generation info
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(107, 114, 128);
  doc.text(`Generated: ${new Date().toLocaleString()}`, 15, currentY+1);
  doc.text(`Total Records: ${data.length}`, 200, currentY+1);
  currentY += 8;

  // Prepare table data
  const headers = columns.map(col => col.header);
  const rows = data.map(item =>
    columns.map(col => {
      const value = item[col.key];
      if (value === null || value === undefined) return '-';
      //@ts-ignore
      if (value instanceof Date) return value.toLocaleDateString();
      return String(value);
    })
  );

  // Add table
  autoTable(doc, {
    head: [headers],
    body: rows,
    startY: currentY,
    styles: { 
      fontSize: 8, 
      cellPadding: 2,
      lineColor: [229, 231, 235],
      lineWidth: 0.1,
      font: 'helvetica'
    },
    headStyles: { 
      fillColor: [37, 99, 235],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      halign: 'left'
    },
    alternateRowStyles: { 
      fillColor: [248, 250, 252] 
    },
    columnStyles: columns.reduce((acc, col, index) => {
      if (col.width) {
        acc[index] = { cellWidth: col.width };
      }
      return acc;
    }, {} as Record<number, { cellWidth: number }>),
  });

  doc.save(`${fileName}_${new Date().getTime()}.pdf`);
};


// =====================================
// 📊 EXCEL EXPORT
// =====================================



export const exportToExcel = <T extends Record<string, any>>(
  data: T[],
  columns: ExportColumn<T>[],
  fileName: string,
  sheetName: string = 'Sheet1',
  metadata?: ExportMetadata
): void => {
  const worksheetData: any[][] = [];

  // Add metadata rows if provided
  if (metadata) {
    worksheetData.push(['ORDER INFORMATION']);
    worksheetData.push(['']);
    
    if (metadata.subject) {
      worksheetData.push(['Subject:', metadata.subject]);
    }
    if (metadata.job_type_name) {
      worksheetData.push(['Job Type:', metadata.job_type_name]);
    }
    if (metadata.job_class_name) {
      worksheetData.push(['Job Class:', metadata.job_class_name]);
    }
    if (metadata.status_job) {
      worksheetData.push(['Status:', metadata.status_job.replace(/_/g, ' ').toUpperCase()]);
    }
    if (metadata.to_custody_name) {
      worksheetData.push(['Custody:', metadata.to_custody_name]);
    }
    if (metadata.to_zone_name) {
      worksheetData.push(['Zone:', metadata.to_zone_name]);
    }
    if (metadata.percentual_concluido !== undefined) {
      worksheetData.push(['Progress:', `${Number(metadata.percentual_concluido).toFixed(1)}%`]);
    }
    if (metadata.total_items) {
      worksheetData.push(['Items Completed:', `${metadata.items_concluidos || 0} / ${metadata.total_items}`]);
    }
    if (metadata.due_date) {
      worksheetData.push(['Due Date:', new Date(metadata.due_date).toLocaleDateString()]);
    }
    
    worksheetData.push(['']);
    worksheetData.push(['Generated:', new Date().toLocaleString()]);
    worksheetData.push(['']);
    worksheetData.push(['ITEMS']);
    worksheetData.push(['']);
  }

  // Add headers
  const headers = columns.map(col => col.header);
  worksheetData.push(headers);

  // Add data rows
  const rows = data.map(item =>
    columns.map(col => {
      const value = item[col.key];
      if (value === null || value === undefined) return '';
      //@ts-ignore
      if (value instanceof Date) return value.toLocaleDateString();
      return value;
    })
  );
  worksheetData.push(...rows);

  // Create workbook and worksheet
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet(worksheetData);

  // Set column widths
  const colWidths = columns.map(col => ({
    wch: Math.max(col.header.length, 15)
  }));
  ws['!cols'] = colWidths;

  // Add worksheet to workbook
  XLSX.utils.book_append_sheet(wb, ws, sheetName);

  // Save file
  XLSX.writeFile(wb, `${fileName}_${new Date().getTime()}.xlsx`);
};


// =====================================
// 📋 CSV EXPORT
// =====================================

// export const exportToCSV = <T extends Record<string, any>>(
//   data: T[],
//   columns: ExportColumn<T>[],
//   fileName: string
// ): void => {
//   // Prepare CSV content
//   const headers = columns.map(col => col.header).join(',');
//   const rows = data.map(item =>
//     columns.map(col => {
//       const value = item[col.key];
//       if (value === null || value === undefined) return '';
      
//       // Escape commas and quotes
//       let stringValue = String(value);
//       if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
//         stringValue = `"${stringValue.replace(/"/g, '""')}"`;
//       }
//       return stringValue;
//     }).join(',')
//   ).join('\n');

//   const csvContent = `${headers}\n${rows}`;

//   // Create blob and download
//   const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
//   saveAs(blob, `${fileName}_${new Date().getTime()}.csv`);
// };

// export const exportToCSV = <T extends Record<string, any>>(
//   data: T[],
//   columns: ExportColumn<T>[],
//   fileName: string,
//   metadata?: ExportMetadata
// ): void => {
//   let csvContent = '';

//   // Add metadata header if provided
//   if (metadata) {
//     csvContent += 'ORDER INFORMATION\n';
//     csvContent += '\n';
    
//     if (metadata.subject) csvContent += `Subject,${metadata.subject}\n`;
//     if (metadata.job_type_name) csvContent += `Job Type,${metadata.job_type_name}\n`;
//     if (metadata.job_class_name) csvContent += `Job Class,${metadata.job_class_name}\n`;
//     if (metadata.status_job) csvContent += `Status,${metadata.status_job.replace(/_/g, ' ').toUpperCase()}\n`;
//     if (metadata.to_custody_name) csvContent += `Custody,${metadata.to_custody_name}\n`;
//     if (metadata.to_zone_name) csvContent += `Zone,${metadata.to_zone_name}\n`;
//     if (metadata.percentual_concluido !== undefined) csvContent += `Progress,${Number(metadata.percentual_concluido).toFixed(1)}%\n`;
//     if (metadata.total_items) csvContent += `Items Completed,${metadata.items_concluidos || 0} / ${metadata.total_items}\n`;
//     if (metadata.due_date) csvContent += `Due Date,${new Date(metadata.due_date).toLocaleDateString()}\n`;
    
//     csvContent += '\n';
//     csvContent += `Generated,${new Date().toLocaleString()}\n`;
//     csvContent += '\n';
//     csvContent += 'ITEMS\n';
//     csvContent += '\n';
//   }

//   // Prepare CSV content
//   const headers = columns.map(col => col.header).join(',');
//   const rows = data.map(item =>
//     columns.map(col => {
//       const value = item[col.key];
//       if (value === null || value === undefined) return '';
      
//       // Escape commas and quotes
//       let stringValue = String(value);
//       if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
//         stringValue = `"${stringValue.replace(/"/g, '""')}"`;
//       }
//       return stringValue;
//     }).join(',')
//   ).join('\n');

//   csvContent += `${headers}\n${rows}`;

//   // Create blob and download
//   const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
//   saveAs(blob, `${fileName}_${new Date().getTime()}.csv`);
// };


export const exportToCSV = <T extends Record<string, any>>(
  data: T[],
  columns: ExportColumn<T>[],
  fileName: string,
  metadata?: ExportMetadata
): void => {
  let csvContent = '';

  // Add metadata header if provided
  if (metadata) {
    csvContent += '╔══════════════════════════════════════════════════════════════╗\n';
    csvContent += '║         ORDER INFORMATION - DETAILED REPORT                  ║\n';
    csvContent += '╚══════════════════════════════════════════════════════════════╝\n';
    csvContent += '\n';
    
    if (metadata.code_user_job) csvContent += `Order Code,${metadata.code_user_job}\n`;
    if (metadata.subject) csvContent += `Subject,"${metadata.subject}"\n`;
    if (metadata.job_type_name) csvContent += `Job Type,${metadata.job_type_name}\n`;
    if (metadata.job_class_name) csvContent += `Job Class,${metadata.job_class_name}\n`;
    if (metadata.status_job) csvContent += `Status,${metadata.status_job.replace(/_/g, ' ').toUpperCase()}\n`;
    
    csvContent += '\n';
    
    if (metadata.to_custody_name) csvContent += `Custody,${metadata.to_custody_name}\n`;
    if (metadata.to_zone_name) csvContent += `Zone,${metadata.to_zone_name}\n`;
    if (metadata.due_date) csvContent += `Due Date,${new Date(metadata.due_date).toLocaleString()}\n`;
    
    csvContent += '\n';
    
    if (metadata.total_items) {
      csvContent += `Total Items,${metadata.total_items}\n`;
      csvContent += `Items Completed,${metadata.items_concluidos || 0} (${Number(metadata.percentual_concluido)?.toFixed(1)}%)\n`;
      csvContent += `Items Pending,${metadata.items_pendentes || 0}\n`;
    }
    
    csvContent += '\n';
    csvContent += `📅 Generated,${new Date().toLocaleString()}\n`;
    csvContent += `📊 Total Records,${data.length}\n`;
    csvContent += '\n';
    csvContent += '═══════════════════════════════════════════════════════════════\n';
    csvContent += '                       ITEMS LIST                              \n';
    csvContent += '═══════════════════════════════════════════════════════════════\n';
    csvContent += '\n';
  }

  // Prepare CSV content
  const headers = columns.map(col => col.header).join(',');
  const rows = data.map(item =>
    columns.map(col => {
      const value = item[col.key];
      if (value === null || value === undefined) return '';
      
      // Escape commas and quotes
      let stringValue = String(value);
      if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
        stringValue = `"${stringValue.replace(/"/g, '""')}"`;
      }
      return stringValue;
    }).join(',')
  ).join('\n');

  csvContent += `${headers}\n${rows}`;

  // Create blob and download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  saveAs(blob, `${fileName}_${new Date().getTime()}.csv`);
};


// =====================================
// 📝 TEXT TABULAR EXPORT
// =====================================

// export const exportToTextTabular = <T extends Record<string, any>>(
//   data: T[],
//   columns: ExportColumn<T>[],
//   fileName: string
// ): void => {
//   // Calculate column widths
//   const colWidths = columns.map((col) => {
//     const headerLength = col.header.length;
//     const maxDataLength = Math.max(
//       ...data.map(item => {
//         const value = item[col.key];
//         return String(value || '').length;
//       })
//     );
//     return col.width || Math.max(headerLength, maxDataLength, 10);
//   });

//   // Helper to pad strings
//   const pad = (str: string, width: number): string => {
//     return str.padEnd(width, ' ').substring(0, width);
//   };

//   // Create separator line
//   const separator = '+' + colWidths.map(w => '-'.repeat(w + 2)).join('+') + '+';

//   // Create header
//   const header = '| ' + columns.map((col, i) => pad(col.header, colWidths[i])).join(' | ') + ' |';

//   // Create rows
//   const rows = data.map(item =>
//     '| ' + columns.map((col, i) => {
//       const value = item[col.key];
//       const stringValue = value === null || value === undefined ? '' : String(value);
//       return pad(stringValue, colWidths[i]);
//     }).join(' | ') + ' |'
//   );

//   // Combine all parts
//   const textContent = [
//     separator,
//     header,
//     separator,
//     ...rows,
//     separator,
//     '',
//     `Total Records: ${data.length}`,
//     `Generated: ${new Date().toLocaleString()}`
//   ].join('\n');

//   // Create blob and download
//   const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8;' });
//   saveAs(blob, `${fileName}_${new Date().getTime()}.txt`);
// };

// export const exportToTextTabular = <T extends Record<string, any>>(
//   data: T[],
//   columns: ExportColumn<T>[],
//   fileName: string,
//   metadata?: ExportMetadata
// ): void => {
//   let textContent = '';

//   // Add metadata header if provided
//   if (metadata) {
//     textContent += '═'.repeat(80) + '\n';
//     textContent += 'ORDER INFORMATION\n';
//     textContent += '═'.repeat(80) + '\n\n';
    
//     if (metadata.subject) textContent += `Subject: ${metadata.subject}\n`;
//     if (metadata.job_type_name) textContent += `Job Type: ${metadata.job_type_name}\n`;
//     if (metadata.job_class_name) textContent += `Job Class: ${metadata.job_class_name}\n`;
//     if (metadata.status_job) textContent += `Status: ${metadata.status_job.replace(/_/g, ' ').toUpperCase()}\n`;
//     if (metadata.to_custody_name) textContent += `Custody: ${metadata.to_custody_name}\n`;
//     if (metadata.to_zone_name) textContent += `Zone: ${metadata.to_zone_name}\n`;
//     if (metadata.percentual_concluido !== undefined) textContent += `Progress: ${Number(metadata.percentual_concluido).toFixed(1)}%\n`;
//     if (metadata.total_items) textContent += `Items: ${metadata.items_concluidos || 0} / ${metadata.total_items} completed\n`;
//     if (metadata.due_date) textContent += `Due Date: ${new Date(metadata.due_date).toLocaleDateString()}\n`;
    
//     textContent += '\n';
//     textContent += `Generated: ${new Date().toLocaleString()}\n`;
//     textContent += '\n';
//     textContent += '═'.repeat(80) + '\n';
//     textContent += 'ITEMS LIST\n';
//     textContent += '═'.repeat(80) + '\n\n';
//   }

//   // Calculate column widths
//   const colWidths = columns.map((col) => {
//     const headerLength = col.header.length;
//     const maxDataLength = Math.max(
//       ...data.map(item => {
//         const value = item[col.key];
//         return String(value || '').length;
//       })
//     );
//     return col.width || Math.max(headerLength, maxDataLength, 10);
//   });

//   // Helper to pad strings
//   const pad = (str: string, width: number): string => {
//     return str.padEnd(width, ' ').substring(0, width);
//   };

//   // Create separator line
//   const separator = '+' + colWidths.map(w => '-'.repeat(w + 2)).join('+') + '+';

//   // Create header
//   const header = '| ' + columns.map((col, i) => pad(col.header, colWidths[i])).join(' | ') + ' |';

//   // Create rows
//   const rows = data.map(item =>
//     '| ' + columns.map((col, i) => {
//       const value = item[col.key];
//       const stringValue = value === null || value === undefined ? '' : String(value);
//       return pad(stringValue, colWidths[i]);
//     }).join(' | ') + ' |'
//   );

//   // Combine all parts
//   textContent += [
//     separator,
//     header,
//     separator,
//     ...rows,
//     separator,
//     '',
//     `Total Records: ${data.length}`,
//   ].join('\n');

//   // Create blob and download
//   const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8;' });
//   saveAs(blob, `${fileName}_${new Date().getTime()}.txt`);
// };

export const exportToTextTabular = <T extends Record<string, any>>(
  data: T[],
  columns: ExportColumn<T>[],
  fileName: string,
  metadata?: ExportMetadata
): void => {
  let textContent = '';

  // Add metadata header if provided
  if (metadata) {
    textContent += '╔══════════════════════════════════════════════════════════════════════════════╗\n';
    textContent += '║                   ORDER INFORMATION - DETAILED REPORT                        ║\n';
    textContent += '╚══════════════════════════════════════════════════════════════════════════════╝\n\n';
    
    const addField = (label: string, value: string, width: number = 78) => {
      const padding = width - label.length - value.length;
      return `  ${label}${'·'.repeat(Math.max(1, padding))}${value}\n`;
    };

    if (metadata.code_user_job) {
      textContent += addField('📋 Order Code ', metadata.code_user_job);
    }
    if (metadata.subject) {
      textContent += addField('📝 Subject ', metadata.subject.substring(0, 50));
    }
    if (metadata.job_type_name) {
      textContent += addField('🏷️  Job Type ', metadata.job_type_name);
    }
    if (metadata.job_class_name) {
      textContent += addField('📂 Job Class ', metadata.job_class_name);
    }
    if (metadata.status_job) {
      textContent += addField('⚡ Status ', metadata.status_job.replace(/_/g, ' ').toUpperCase());
    }
    
    textContent += '\n';
    
    if (metadata.to_custody_name) {
      textContent += addField('👤 Custody ', metadata.to_custody_name);
    }
    if (metadata.to_zone_name) {
      textContent += addField('📍 Zone ', metadata.to_zone_name);
    }
    if (metadata.due_date) {
      textContent += addField('📅 Due Date ', new Date(metadata.due_date).toLocaleString());
    }
    
    textContent += '\n';
    textContent += '  ┌─────────────────────────────────────────────────────────────────────────┐\n';
    textContent += '  │                          PROGRESS SUMMARY                               │\n';
    textContent += '  ├─────────────────────────────────────────────────────────────────────────┤\n';
    
    if (metadata.total_items) {
      const percentage = metadata.percentual_concluido || 0;
      const barLength = 50;
      const filledLength = Math.round((percentage / 100) * barLength);
      const progressBar = '█'.repeat(filledLength) + '░'.repeat(barLength - filledLength);
      
      textContent += `  │  Total Items········································${String(metadata.total_items).padStart(5)} │\n`;
      textContent += `  │  Items Completed····································${String(metadata.items_concluidos || 0).padStart(5)} │\n`;
      textContent += `  │  Items Pending······································${String(metadata.items_pendentes || 0).padStart(5)} │\n`;
      textContent += '  │                                                                         │\n';
      textContent += `  │  Progress: [${progressBar}] ${Number(percentage).toFixed(1)}%     │\n`;
    }
    
    textContent += '  └─────────────────────────────────────────────────────────────────────────┘\n\n';
    
    textContent += `  📅 Generated: ${new Date().toLocaleString()}\n`;
    textContent += `  📊 Total Records: ${data.length}\n\n`;
    
    textContent += '╔══════════════════════════════════════════════════════════════════════════════╗\n';
    textContent += '║                              ITEMS LIST                                      ║\n';
    textContent += '╚══════════════════════════════════════════════════════════════════════════════╝\n\n';
  }

  // Calculate column widths
  const colWidths = columns.map((col) => {
    const headerLength = col.header.length;
    const maxDataLength = Math.max(
      ...data.map(item => {
        const value = item[col.key];
        return String(value || '').length;
      })
    );
    return col.width || Math.max(headerLength, maxDataLength, 10);
  });

  // Helper to pad strings
  const pad = (str: string, width: number): string => {
    return str.padEnd(width, ' ').substring(0, width);
  };

  // Create separator line
  const separator = '┌' + colWidths.map(w => '─'.repeat(w + 2)).join('┬') + '┐';
  const middleSeparator = '├' + colWidths.map(w => '─'.repeat(w + 2)).join('┼') + '┤';
  const endSeparator = '└' + colWidths.map(w => '─'.repeat(w + 2)).join('┴') + '┘';

  // Create header
  const header = '│ ' + columns.map((col, i) => pad(col.header, colWidths[i])).join(' │ ') + ' │';

  // Create rows
  const rows = data.map(item =>
    '│ ' + columns.map((col, i) => {
      const value = item[col.key];
      const stringValue = value === null || value === undefined ? '' : String(value);
      return pad(stringValue, colWidths[i]);
    }).join(' │ ') + ' │'
  );

  // Combine all parts
  textContent += [
    separator,
    header,
    middleSeparator,
    ...rows,
    endSeparator,
    '',
    `📊 Total Records: ${data.length}`,
  ].join('\n');

  // Create blob and download
  const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8;' });
  saveAs(blob, `${fileName}_${new Date().getTime()}.txt`);
};