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

// =====================================
// 📄 PDF EXPORT
// =====================================

export const exportToPDF = <T extends Record<string, any>>(
  data: T[],
  columns: ExportColumn<T>[],
  fileName: string,
  title?: string
): void => {
  
    const doc = new jsPDF({
    orientation: 'landscape', // 'portrait' (padrão) ou 'landscape'
    unit: 'mm',
    format: 'a4'
  });
  
  // Add title
  if (title) {
    doc.setFontSize(16);
    doc.text(title, 14, 15);
  }

  // Add metadata
  doc.setFontSize(10);
  doc.text(`Generated: ${new Date().toLocaleString()}`, 14, title ? 25 : 15);
  doc.text(`Total Records: ${data.length}`, 14, title ? 32 : 22);

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
    startY: title ? 38 : 28,
    styles: { fontSize: 8, cellPadding: 2 },
    headStyles: { fillColor: [59, 130, 246], fontStyle: 'bold' },
    alternateRowStyles: { fillColor: [248, 250, 252] },
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
  sheetName: string = 'Sheet1'
): void => {
  // Prepare data with headers
  const headers = columns.map(col => col.header);
  const rows = data.map(item =>
    columns.map(col => {
      const value = item[col.key];
      if (value === null || value === undefined) return '';
      //@ts-ignore
      if (value instanceof Date) return value.toLocaleDateString();
      return value;
    })
  );

  const worksheetData = [headers, ...rows];

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

export const exportToCSV = <T extends Record<string, any>>(
  data: T[],
  columns: ExportColumn<T>[],
  fileName: string
): void => {
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

  const csvContent = `${headers}\n${rows}`;

  // Create blob and download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  saveAs(blob, `${fileName}_${new Date().getTime()}.csv`);
};

// =====================================
// 📝 TEXT TABULAR EXPORT
// =====================================

export const exportToTextTabular = <T extends Record<string, any>>(
  data: T[],
  columns: ExportColumn<T>[],
  fileName: string
): void => {
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
  const separator = '+' + colWidths.map(w => '-'.repeat(w + 2)).join('+') + '+';

  // Create header
  const header = '| ' + columns.map((col, i) => pad(col.header, colWidths[i])).join(' | ') + ' |';

  // Create rows
  const rows = data.map(item =>
    '| ' + columns.map((col, i) => {
      const value = item[col.key];
      const stringValue = value === null || value === undefined ? '' : String(value);
      return pad(stringValue, colWidths[i]);
    }).join(' | ') + ' |'
  );

  // Combine all parts
  const textContent = [
    separator,
    header,
    separator,
    ...rows,
    separator,
    '',
    `Total Records: ${data.length}`,
    `Generated: ${new Date().toLocaleString()}`
  ].join('\n');

  // Create blob and download
  const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8;' });
  saveAs(blob, `${fileName}_${new Date().getTime()}.txt`);
};