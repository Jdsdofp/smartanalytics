// src/utils/exportGPSPointToPDF.ts
import jsPDF from 'jspdf';
import 'jspdf-autotable';

interface GPSPoint {
  id: number;
  dev_eui: string;
  timestamp: string;
  gps_latitude: number | string;
  gps_longitude: number | string;
  gps_accuracy: number;
  battery_level?: number;
  dynamic_motion_state?: string;
}


export const exportGPSPointToPDF = (point: GPSPoint) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  let yPosition = 20;
  

  // ====================================
  // 🎨 CORES E ESTILOS
  // ====================================
  const colors = {
    primary: { r: 59, g: 130, b: 246 }, // blue-500
    success: { r: 16, g: 185, b: 129 }, // green-500
    warning: { r: 245, g: 158, b: 11 }, // amber-500
    danger: { r: 239, g: 68, b: 68 }, // red-500
    gray: {
      50: { r: 249, g: 250, b: 251 },
      100: { r: 243, g: 244, b: 246 },
      200: { r: 229, g: 231, b: 235 },
      300: { r: 209, g: 213, b: 219 },
      600: { r: 75, g: 85, b: 99 },
      700: { r: 55, g: 65, b: 81 },
      900: { r: 17, g: 24, b: 39 },
    }
  };

  // Helper para aplicar cores
  const setFillColor = (color: { r: number, g: number, b: number }) => {
    doc.setFillColor(color.r, color.g, color.b);
  };

  const setTextColor = (color: { r: number, g: number, b: number }) => {
    doc.setTextColor(color.r, color.g, color.b);
  };

  const setDrawColor = (color: { r: number, g: number, b: number }) => {
    doc.setDrawColor(color.r, color.g, color.b);
  };

  // ====================================
  // 📋 CABEÇALHO DO DOCUMENTO
  // ====================================
  const addHeader = () => {
    // Fundo azul no topo
    setFillColor(colors.primary);
    doc.rect(0, 0, pageWidth, 35, 'F');

    // Círculo com marcador de localização
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(28);
    doc.circle(20, 17, 8, 'F');
    doc.setFontSize(20);
    doc.text('>', 17, 20);

    // Título
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('Relatorio de Localizacao GPS', 35, 17);

    // Subtítulo
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('Rastreamento de Dispositivo', 35, 24);

    // Data de geração
    doc.setFontSize(8);
    doc.text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, 35, 30);

    yPosition = 45;
  };

  // ====================================
  // 📊 CARD COM INFORMAÇÕES
  // ====================================
  const addInfoCard = (title: string, icon: string, data: Array<{ label: string, value: string, color?: { r: number, g: number, b: number } } >) => {
    // Título do card
    setFillColor(colors.gray[50]);
    doc.roundedRect(15, yPosition, pageWidth - 30, 10, 2, 2, 'F');
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    setTextColor(colors.gray[900]);
    doc.text(`${icon} ${title}`, 20, yPosition + 7);

    yPosition += 15;

    // Dados do card
    data.forEach((item, index) => {
      const cardY = yPosition + (index * 18);
      
      // Fundo do item
      setFillColor(colors.gray[50]);
      doc.roundedRect(20, cardY, pageWidth - 40, 15, 2, 2, 'F');
      
      // Borda
      setDrawColor(colors.gray[200]);
      doc.roundedRect(20, cardY, pageWidth - 40, 15, 2, 2, 'S');

      // Label
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      setTextColor(colors.gray[600]);
      doc.text(item.label, 25, cardY + 6);

      // Valor
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      if (item.color) {
        setTextColor(item.color);
      } else {
        setTextColor(colors.gray[900]);
      }
      doc.text(item.value, 25, cardY + 12);
    });

    yPosition += (data.length * 18) + 5;
  };

  // ====================================
  // 📈 GRÁFICO DE PRECISÃO GPS
  // ====================================
  const addAccuracyChart = () => {
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    setTextColor(colors.gray[900]);
    doc.text('Analise de Precisao GPS', 20, yPosition);

    yPosition += 10;

    const accuracy = point.gps_accuracy;
    const maxAccuracy = 50; // metros
    const barWidth = ((pageWidth - 60) * Math.min(accuracy, maxAccuracy)) / maxAccuracy;

    // Fundo da barra
    setFillColor(colors.gray[200]);
    doc.roundedRect(25, yPosition, pageWidth - 50, 15, 2, 2, 'F');

    // Barra de precisão (cor baseada no valor)
    let barColor = colors.success;
    if (accuracy >= 25) barColor = colors.danger;
    else if (accuracy >= 10) barColor = colors.warning;

    setFillColor(barColor);
    doc.roundedRect(25, yPosition, barWidth, 15, 2, 2, 'F');

    // Valor sobre a barra
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(255, 255, 255);
    doc.text(`${accuracy}m`, 30, yPosition + 10);

    // Escala
    doc.setFontSize(7);
    setTextColor(colors.gray[600]);
    doc.text('0m', 25, yPosition + 20);
    doc.text('Excelente', 25, yPosition + 25);
    
    doc.text('25m', pageWidth / 2 - 5, yPosition + 20);
    doc.text('Bom', pageWidth / 2 - 5, yPosition + 25);
    
    doc.text('50m+', pageWidth - 35, yPosition + 20);
    doc.text('Regular', pageWidth - 40, yPosition + 25);

    yPosition += 35;
  };

  // ====================================
  // 🔋 GRÁFICO DE BATERIA
  // ====================================
  const addBatteryChart = () => {
    if (!point.battery_level) return;

    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    setTextColor(colors.gray[900]);
    doc.text('Nivel de Bateria', 20, yPosition);

    yPosition += 10;

    const batteryLevel = point.battery_level;
    const batteryWidth = ((pageWidth - 60) * batteryLevel) / 100;

    // Fundo da barra
    setFillColor(colors.gray[200]);
    doc.roundedRect(25, yPosition, pageWidth - 50, 20, 3, 3, 'F');

    // Barra de bateria (cor baseada no valor)
    let batteryColor = colors.success;
    if (batteryLevel <= 20) batteryColor = colors.danger;
    else if (batteryLevel <= 50) batteryColor = colors.warning;

    setFillColor(batteryColor);
    doc.roundedRect(25, yPosition, batteryWidth, 20, 3, 3, 'F');

    // Valor sobre a barra
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(255, 255, 255);
    doc.text(`${batteryLevel}%`, pageWidth / 2 - 10, yPosition + 13);

    // Status
    doc.setFontSize(8);
    setTextColor(colors.gray[600]);
    let status = 'Bateria em bom estado';
    if (batteryLevel <= 20) status = 'Bateria fraca - recarregar';
    else if (batteryLevel <= 50) status = 'Bateria moderada';
    
    doc.text(status, 25, yPosition + 27);

    yPosition += 37;
  };

  // ====================================
  // 🗺️ MINI MAPA (REPRESENTAÇÃO)
  // ====================================
  const addMapRepresentation = () => {
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    setTextColor(colors.gray[900]);
    doc.text('Visualizacao de Localizacao', 20, yPosition);

    yPosition += 10;

    // Caixa do "mapa"
    doc.setFillColor(240, 248, 255); // Alice blue
    setDrawColor(colors.gray[300]);
    doc.roundedRect(25, yPosition, pageWidth - 50, 40, 3, 3, 'FD');

    // Marcador de localização (círculo + ponto)
    const centerX = pageWidth / 2;
    const centerY = yPosition + 20;
    
    // Círculo externo
    setFillColor(colors.danger);
    doc.circle(centerX, centerY, 4, 'F');
    
    // Ponto interno
    doc.setFillColor(255, 255, 255);
    doc.circle(centerX, centerY, 1.5, 'F');

    // Coordenadas
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    setTextColor(colors.gray[700]);
    const coordText = `${point.gps_latitude}, ${point.gps_longitude}`;
    const textWidth = doc.getTextWidth(coordText);
    doc.text(coordText, (pageWidth - textWidth) / 2, yPosition + 35);

    yPosition += 50;
  };

  // ====================================
  // 📋 TABELA DE INFORMAÇÕES TÉCNICAS
  // ====================================
  const addTechnicalTable = () => {
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    setTextColor(colors.gray[900]);
    doc.text('Informacoes Tecnicas', 20, yPosition);

    yPosition += 5;

    const tableData = [
      ['DEV_EUI', point.dev_eui],
      ['ID do Registro', `#${point.id}`],
      ['Timestamp Original', new Date(point.timestamp).toISOString()],
      ['Tipo de Dispositivo', 'Tracker GPS'],
      ['Status da Conexao', 'Online'],
      ['Ultima Atualizacao', new Date(point.timestamp).toLocaleString('pt-BR')],
    ];

    (doc as any).autoTable({
      startY: yPosition,
      head: [['Campo', 'Valor']],
      body: tableData,
      theme: 'grid',
      headStyles: {
        fillColor: [colors.primary.r, colors.primary.g, colors.primary.b],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 10,
      },
      bodyStyles: {
        fontSize: 8,
        textColor: [colors.gray[900].r, colors.gray[900].g, colors.gray[900].b],
      },
      alternateRowStyles: {
        fillColor: [colors.gray[50].r, colors.gray[50].g, colors.gray[50].b],
      },
      margin: { left: 20, right: 20 },
      columnStyles: {
        0: { cellWidth: 60, fontStyle: 'bold' },
        1: { cellWidth: 'auto' },
      },
    });

    yPosition = (doc as any).lastAutoTable.finalY + 10;
  };

  // ====================================
  // 📄 RODAPÉ
  // ====================================
  const addFooter = () => {
    const footerY = pageHeight - 20;
    
    setDrawColor(colors.gray[200]);
    doc.line(20, footerY - 5, pageWidth - 20, footerY - 5);

    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    setTextColor(colors.gray[600]);
    
    doc.text('Sistema de Rastreamento GPS', 20, footerY);
    doc.text(`Pagina 1 | Confidencial`, pageWidth - 60, footerY);
  };

  // ====================================
  // 🎬 MONTAGEM DO DOCUMENTO
  // ====================================
  addHeader();

  // Informações de Localização
  const qualidade = point.gps_accuracy < 10 ? 'Excelente' :
                   point.gps_accuracy < 25 ? 'Boa' : 'Regular';
  
  const accuracyColor = point.gps_accuracy < 10 ? colors.success :
                       point.gps_accuracy < 25 ? colors.warning : colors.danger;

  addInfoCard('Informacoes de Localizacao', '', [
    { label: 'Latitude', value: String(point.gps_latitude) },
    { label: 'Longitude', value: String(point.gps_longitude) },
    { label: 'Precisao do GPS', value: `${point.gps_accuracy} metros`, color: accuracyColor },
    { label: 'Qualidade do Sinal', value: qualidade },
  ]);

  // Informações do Dispositivo
  const deviceData: any = [
    { 
      label: 'Data e Hora da Leitura', 
      value: new Date(point.timestamp).toLocaleString('pt-BR', { 
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }) 
    },
  ];

  if (point.battery_level) {
    deviceData.push({
      label: 'Nivel da Bateria',
      value: `${point.battery_level}%`,
      color: point.battery_level > 50 ? colors.success :
             point.battery_level > 20 ? colors.warning : colors.danger
    });
  }

  if (point.dynamic_motion_state) {
    deviceData.push({
      label: 'Status de Movimento',
      value: point.dynamic_motion_state === 'MOVING' ? 'Em movimento' : 'Parado',
      color: point.dynamic_motion_state === 'MOVING' ? colors.success : colors.gray[600]
    });
  }

  addInfoCard('Status do Dispositivo', '', deviceData);

  // Gráficos
  addAccuracyChart();
  
  if (point.battery_level) {
    addBatteryChart();
  }

  // Mapa representativo
  addMapRepresentation();

  // Nova página para informações técnicas se necessário
  if (yPosition > pageHeight - 80) {
    doc.addPage();
    yPosition = 20;
  }

  addTechnicalTable();
  addFooter();

  // ====================================
  // 💾 SALVAR DOCUMENTO
  // ====================================
  const filename = `GPS_Report_${point.dev_eui}_${new Date(point.timestamp).toISOString().split('T')[0]}.pdf`;
  doc.save(filename);
};

export default exportGPSPointToPDF;