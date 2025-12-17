import { useState, useEffect, useMemo, useRef } from 'react';
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  ArrowDownTrayIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChartBarIcon,
  InformationCircleIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';
import { useCompany } from '../../../hooks/useCompany';

interface CertificateReport {
  id: number;
  Home_site_name: string;
  code_area: string;
  code_zone: string;
  certificate_description: string;
  item_code: string;
  item_name: string;
  brand: string;
  model: string;
  serial: string;
  expiration_date: string;
  certificate_status_name: string;
}

interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

interface ApiResponse {
  data: CertificateReport[];
  pagination: PaginationInfo;
}

interface CriticalAnalysis {
  totalCertificates: number;
  approved: number;
  expired: number;
  expiringIn30Days: number;
  expiringIn60Days: number;
  expiringIn90Days: number;
  expiringIn180Days: number;
  critical: number;
  warning: number;
  safe: number;
  averageDaysToExpiration: number;
  sitesWithMostCertificates: Array<{ site: string; count: number }>;
  certificateTypeDistribution: Array<{ type: string; count: number }>;
  urgentActionRequired: number;
  complianceRate: number;
  riskScore: number;
}

interface CertificateFilters {
  statuses: string[];
  sites: string[];
  descriptions: string[];
  zones: Array<{ code: string; label: string }>;
  areas: Array<{ code: string; label: string }>;
  categories: Array<{ code: string; label: string }>;
  brands: Array<{ code: string; label: string }>;
}


// ✅ TRADUÇÕES DE STATUS
const STATUS_TRANSLATIONS: Record<string, string> = {
  'APPROVED': 'Aprovado',
  'REJECTED': 'Rejeitado',
  'PENDING': 'Pendente',
  'EXPIRED': 'Expirado',
  'IN PROGRESS': 'Em Andamento',
  'CANCELLED': 'Cancelado',
  'DRAFT': 'Rascunho',
  'COMPLETED': 'Concluído',
  'ACTIVE': 'Ativo',
  'INACTIVE': 'Inativo',
  'NOT APPROVED': 'Não Aprovado',
  'OPEN': 'Aberto'
};

// ✅ FUNÇÃO PARA TRADUZIR STATUS (mantém a original mas adiciona fallback)
const translateStatus = (status: string): string => {
  if (!status) return '';
  const translated = STATUS_TRANSLATIONS[status];
  return translated || status;
};

const SearchableSelect = ({
  label,
  value,
  onChange,
  options,
  loading,
  translate = false
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Array<{ code: string; label: string }> | string[];
  loading: boolean;
  translate: boolean;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // ✅ ADICIONAR PROTEÇÃO
  const safeOptions = options || [];

  const normalizedOptions = safeOptions.map(opt => {
    if (typeof opt === 'string') {
      const translatedLabel = translate ? translateStatus(opt) : opt;
      return { code: opt, label: translatedLabel };
    } else {
      const translatedLabel = translate ? translateStatus(opt.label) : opt.label;
      return { code: opt.code, label: translatedLabel };
    }
  });



  const filteredOptions = normalizedOptions.filter(option =>
    option.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getDisplayValue = () => {
    if (value === 'ALL') return `${label} - Todos`;
    const selected = normalizedOptions.find(opt => opt.code === value);
    return selected ? selected.label : (translate ? translateStatus(value) : value);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-left flex items-center justify-between hover:border-blue-300 transition-all font-medium"
      >
        <span className="truncate text-sm">{getDisplayValue()}</span>
        <ChevronRightIcon
          className={`w-4 h-4 transition-transform flex-shrink-0 ${isOpen ? 'rotate-90' : ''}`}
        />
      </button>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border-2 border-gray-200 rounded-xl shadow-xl max-h-80 overflow-hidden">
          <div className="p-3 border-b-2 sticky top-0 bg-gradient-to-r from-gray-50 to-blue-50">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder={`Buscar ${label.toLowerCase()}...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm border-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          </div>

          <div className="overflow-y-auto max-h-60">
            {loading ? (
              <div className="px-3 py-4 text-center text-sm text-gray-500">
                <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                Carregando...
              </div>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => {
                    onChange('ALL');
                    setIsOpen(false);
                    setSearchTerm('');
                  }}
                  className={`w-full px-4 py-2.5 text-left text-sm hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 font-medium transition-all ${value === 'ALL' ? 'bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700 font-bold' : ''
                    }`}
                >
                  ✓ Todos
                </button>

                {filteredOptions.length === 0 ? (
                  <div className="px-3 py-4 text-center text-sm text-gray-500">
                    Nenhum resultado encontrado
                  </div>
                ) : (
                  filteredOptions.map((option) => (
                    <button
                      key={option.code}
                      type="button"
                      onClick={() => {
                        onChange(option.code);
                        setIsOpen(false);
                        setSearchTerm('');
                      }}
                      className={`w-full px-4 py-2.5 text-left text-sm hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all ${value === option.code ? 'bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700 font-bold' : ''
                        }`}
                    >
                      {value === option.code && '✓ '}{option.label}
                    </button>
                  ))
                )}
              </>
            )}
          </div>

          <div className="px-3 py-2 border-t-2 bg-gradient-to-r from-gray-50 to-blue-50 text-xs text-gray-600 font-medium">
            {filteredOptions.length} de {normalizedOptions.length} disponível(is)
          </div>
        </div>
      )}
    </div>
  );
};

export default function CertificateReportGrid() {
  const [data, setData] = useState<CertificateReport[]>([]);
  const [allData, setAllData] = useState<CertificateReport[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo>({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10,
    hasNextPage: false,
    hasPreviousPage: false
  });
  const [loading, setLoading] = useState(true);
  const [loadingAnalysis, setLoadingAnalysis] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    status: 'ALL',
    site: 'ALL',
    certificateType: 'ALL',
    expirationRange: 'ALL',
    zone: 'ALL',
    area: 'ALL'
  });
  const [columnFilters, setColumnFilters] = useState<Record<string, string[]>>({});
  const [activeColumnFilter, setActiveColumnFilter] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [showAnalysis, setShowAnalysis] = useState(true);
  const [sortBy, setSortBy] = useState('id');
  const [sortOrder, setSortOrder] = useState<'ASC' | 'DESC'>('DESC');
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportType, setExportType] = useState<'excel' | 'pdf'>('excel');
  const { companyId } = useCompany()
  const filterRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const [dateFilter, setDateFilter] = useState({
    startDate: '',
    endDate: ''
  });

  const [showExportProgramacaoMenu, setShowExportProgramacaoMenu] = useState(false);

  // ============= FUNÇÕES DE EXPORTAÇÃO DE PROGRAMAÇÃO ATUALIZADAS =============
  //@ts-ignore
  const getExecutionDate = (expirationDate: string) => {
    const date = new Date(expirationDate);
    date.setFullYear(date.getFullYear() - 1);
    return date.toLocaleDateString('pt-BR');
  };

  const exportProgramacaoExcel = async (dataToExport: CertificateReport[]) => {
    import('xlsx').then(async (XLSX) => {
      // ✅ CABEÇALHOS EXATAMENTE COMO NA TABELA
      const headers = [
        'Site',
        'Área',
        'Zona',
        'Certificado',
        'Código',
        'Item',
        'Marca',
        'Modelo',
        'Serial',
        'Expiração',
        'Dias p/ Expirar',
        'Status',
        'Criticidade'
      ];

      // ✅ DADOS EXATAMENTE COMO NA TABELA
      const dataRows = dataToExport.map(item => {
        const daysUntilExpiration = getDaysUntilExpiration(item.expiration_date);
        const criticalityBadge = getCriticalityBadge(daysUntilExpiration);

        return [
          item.Home_site_name,
          item.code_zone,
          item.code_area,
          item.certificate_description,
          item.item_code,
          item.item_name,
          item.brand || '-',
          item.model || '-',
          item.serial,
          `${formatDate(item.expiration_date)} ${new Date(item.expiration_date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`,
          `${daysUntilExpiration} dias`,
          translateStatus(item.certificate_status_name),
          criticalityBadge.label
        ];
      });

      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.aoa_to_sheet([headers, ...dataRows]);

      // ✅ LARGURAS DAS COLUNAS
      const colWidths = [
        { wch: 25 }, // Site
        { wch: 20 }, // Área
        { wch: 20 }, // Zona
        { wch: 30 }, // Certificado
        { wch: 15 }, // Código
        { wch: 40 }, // Item
        { wch: 15 }, // Marca
        { wch: 15 }, // Modelo
        { wch: 20 }, // Serial
        { wch: 20 }, // Expiração
        { wch: 15 }, // Dias
        { wch: 15 }, // Status
        { wch: 15 }  // Criticidade
      ];
      ws['!cols'] = colWidths;

      XLSX.utils.book_append_sheet(wb, ws, 'Certificados');

      const fileName = `certificados-${new Date().toISOString().split('T')[0]}.xlsx`;
      XLSX.writeFile(wb, fileName);
    }).catch(error => {
      console.error('Erro ao carregar biblioteca XLSX:', error);
      alert('Erro ao exportar para Excel.');
    });
  };

  // const exportProgramacaoPDF = async (dataToExport: CertificateReport[]) => {
  //   try {
  //     const { jsPDF } = await import('jspdf');
  //     const doc = new jsPDF({
  //       orientation: 'landscape',
  //       unit: 'mm',
  //       format: 'a4'
  //     }) as import('jspdf').jsPDF;

  //     const pageWidth = doc.internal.pageSize.getWidth();
  //     const pageHeight = doc.internal.pageSize.getHeight();
  //     const margin = 10;
  //     let yPosition = margin;

  //     // ✅ CABEÇALHO DO DOCUMENTO
  //     doc.setFontSize(16);
  //     doc.setFont('helvetica', 'bold');
  //     doc.text('RELATÓRIO DE CERTIFICADOS', margin, yPosition);
  //     yPosition += 8;

  //     doc.setFontSize(9);
  //     doc.setFont('helvetica', 'normal');
  //     doc.text(new Date().toLocaleDateString('pt-BR'), margin, yPosition);
  //     doc.text(`Total de Registros: ${dataToExport.length}`, pageWidth - margin, yPosition, { align: 'right' });
  //     yPosition += 10;

  //     // ✅ CABEÇALHOS EXATAMENTE COMO NA TABELA
  //     const headers = [
  //       'Site',
  //       'Área',
  //       'Zona',
  //       'Certificado',
  //       'Código',
  //       'Item',
  //       'Marca',
  //       'Modelo',
  //       'Serial',
  //       'Expiração',
  //       'Dias',
  //       'Status',
  //       'Criticidade'
  //     ];

  //     // ✅ LARGURAS DAS COLUNAS (ajustadas para caber na página)
  //     const colWidths = [18, 15, 15, 22, 12, 30, 12, 12, 18, 18, 10, 15, 15];

  //     // ✅ DESENHAR CABEÇALHO DA TABELA
  //     doc.setFillColor(220, 220, 220);
  //     doc.rect(margin, yPosition - 4, pageWidth - 2 * margin, 6, 'F');

  //     doc.setFontSize(7);
  //     doc.setFont('helvetica', 'bold');

  //     let xPosition = margin + 1;
  //     headers.forEach((header, index) => {
  //       doc.text(header, xPosition, yPosition);
  //       xPosition += colWidths[index];
  //     });

  //     yPosition += 6;

  //     // ✅ DESENHAR LINHAS DE DADOS
  //     doc.setFont('helvetica', 'normal');
  //     doc.setFontSize(6);

  //     dataToExport.forEach((item, index) => {
  //       // ✅ VERIFICAR SE PRECISA DE NOVA PÁGINA
  //       if (yPosition > pageHeight - 20) {
  //         doc.addPage();
  //         yPosition = margin;

  //         // Redesenhar cabeçalho
  //         doc.setFillColor(220, 220, 220);
  //         doc.rect(margin, yPosition - 4, pageWidth - 2 * margin, 6, 'F');

  //         doc.setFont('helvetica', 'bold');
  //         doc.setFontSize(7);
  //         xPosition = margin + 1;
  //         headers.forEach((header, index) => {
  //           doc.text(header, xPosition, yPosition);
  //           xPosition += colWidths[index];
  //         });
  //         yPosition += 6;
  //         doc.setFont('helvetica', 'normal');
  //         doc.setFontSize(6);
  //       }

  //       // ✅ CALCULAR DADOS EXATAMENTE COMO NA TABELA
  //       const daysUntilExpiration = getDaysUntilExpiration(item.expiration_date);
  //       const criticalityBadge = getCriticalityBadge(daysUntilExpiration);

  //       xPosition = margin + 1;
  //       const rowData = [
  //         item.Home_site_name,
  //         item.code_zone,
  //         item.code_area,
  //         item.certificate_description.substring(0, 20),
  //         item.item_code,
  //         item.item_name.substring(0, 28),
  //         item.brand || '-',
  //         item.model || '-',
  //         item.serial.substring(0, 16),
  //         formatDate(item.expiration_date),
  //         `${daysUntilExpiration}`,
  //         translateStatus(item.certificate_status_name),
  //         criticalityBadge.label
  //       ];

  //       // ✅ APLICAR COR BASEADA NA CRITICIDADE
  //       if (criticalityBadge.label === 'EXPIRADO' || criticalityBadge.label === 'CRÍTICO') {
  //         doc.setFillColor(254, 226, 226); // Vermelho claro
  //       } else if (criticalityBadge.label === 'ATENÇÃO') {
  //         doc.setFillColor(254, 243, 199); // Laranja claro
  //       } else if (criticalityBadge.label === 'ALERTA') {
  //         doc.setFillColor(254, 249, 195); // Amarelo claro
  //       } else {
  //         doc.setFillColor(220, 252, 231); // Verde claro
  //       }
  //       doc.rect(margin, yPosition - 3, pageWidth - 2 * margin, 5, 'F');

  //       // ✅ ESCREVER DADOS
  //       rowData.forEach((text, colIndex) => {
  //         const maxWidth = colWidths[colIndex] - 2;
  //         const lines = doc.splitTextToSize(text, maxWidth);

  //         // ✅ COR ESPECIAL PARA COLUNA DE DIAS
  //         if (colIndex === 10) { // Coluna "Dias"
  //           if (daysUntilExpiration < 0) {
  //             doc.setTextColor(220, 38, 38); // Vermelho
  //           } else if (daysUntilExpiration <= 30) {
  //             doc.setTextColor(249, 115, 22); // Laranja
  //           } else if (daysUntilExpiration <= 90) {
  //             doc.setTextColor(234, 179, 8); // Amarelo
  //           } else {
  //             doc.setTextColor(34, 197, 94); // Verde
  //           }
  //           doc.setFont('helvetica', 'bold');
  //         } else {
  //           doc.setTextColor(0, 0, 0);
  //           doc.setFont('helvetica', 'normal');
  //         }

  //         doc.text(lines[0], xPosition, yPosition);
  //         xPosition += colWidths[colIndex];
  //       });

  //       yPosition += 5;
  //     });

  //     // ✅ RODAPÉ
  //     doc.setFontSize(7);
  //     doc.setTextColor(128, 128, 128);
  //     doc.text(
  //       `Gerado em ${new Date().toLocaleString('pt-BR')}`,
  //       pageWidth / 2,
  //       pageHeight - 5,
  //       { align: 'center' }
  //     );

  //     doc.save(`certificados-${new Date().toISOString().split('T')[0]}.pdf`);
  //   } catch (error) {
  //     console.error('Erro ao gerar PDF:', error);
  //     alert('Erro ao exportar para PDF.');
  //   }
  // };

  // const exportProgramacaoPDF = async (dataToExport: CertificateReport[]) => {
  //   try {
  //     const { jsPDF } = await import('jspdf');
  //     const doc = new jsPDF({
  //       orientation: 'landscape',
  //       unit: 'mm',
  //       format: 'a4'
  //     }) as import('jspdf').jsPDF;

  //     const pageWidth = doc.internal.pageSize.getWidth();
  //     const pageHeight = doc.internal.pageSize.getHeight();
  //     const margin = 10;
  //     let yPosition = margin;

  //     doc.setFontSize(16);
  //     doc.setFont('helvetica', 'bold');
  //     doc.text('PROGRAMAÇÃO DE CALIBRAÇÃO', margin, yPosition);
  //     yPosition += 8;

  //     doc.setFontSize(9);
  //     doc.setFont('helvetica', 'normal');
  //     doc.text(new Date().toLocaleDateString('pt-BR'), margin, yPosition);
  //     yPosition += 5;

  //     const currentDate = new Date();
  //     const nextYear = new Date(currentDate);
  //     nextYear.setFullYear(currentDate.getFullYear() + 1);

  //     doc.text(
  //       `Período: ${currentDate.getMonth() + 1}/${currentDate.getFullYear()} a ${nextYear.getMonth() + 1}/${nextYear.getFullYear()}, Ordenação: Código, Quant. Registros: ${dataToExport.length}`,
  //       margin,
  //       yPosition
  //     );
  //     yPosition += 5;

  //     doc.text('Filtros: Controlado: Sim', margin, yPosition);
  //     yPosition += 8;

  //     const headers = [
  //       'Nº. Patrim.',
  //       'Código',
  //       'Descrição',
  //       'Departamento',
  //       'Fabricante',
  //       'Modelo',
  //       'Nº. Série',
  //       'Comod.',
  //       'Dt. Exec.',
  //       'Dt. Valid.',
  //       'N. Conf.',
  //       'Fornec.'
  //     ];

  //     const colWidths = [15, 18, 35, 40, 22, 22, 25, 12, 18, 18, 12, 20];

  //     doc.setFillColor(220, 220, 220);
  //     doc.rect(margin, yPosition - 4, pageWidth - 2 * margin, 6, 'F');

  //     doc.setFontSize(7);
  //     doc.setFont('helvetica', 'bold');

  //     let xPosition = margin + 1;
  //     headers.forEach((header, index) => {
  //       doc.text(header, xPosition, yPosition);
  //       xPosition += colWidths[index];
  //     });

  //     yPosition += 6;

  //     doc.setFont('helvetica', 'normal');
  //     doc.setFontSize(6);

  //     // @ts-ignore
  //     dataToExport.forEach((item, index) => {
  //       if (yPosition > pageHeight - 20) {
  //         doc.addPage();
  //         yPosition = margin;

  //         doc.setFillColor(220, 220, 220);
  //         doc.rect(margin, yPosition - 4, pageWidth - 2 * margin, 6, 'F');

  //         doc.setFont('helvetica', 'bold');
  //         doc.setFontSize(7);
  //         xPosition = margin + 1;
  //         headers.forEach((header, index) => {
  //           doc.text(header, xPosition, yPosition);
  //           xPosition += colWidths[index];
  //         });
  //         yPosition += 6;
  //         doc.setFont('helvetica', 'normal');
  //         doc.setFontSize(6);
  //       }

  //       xPosition = margin + 1;
  //       const rowData = [
  //         '---',
  //         item.item_code,
  //         item.item_name.substring(0, 30),
  //         item.code_area.substring(0, 35),
  //         item.brand || '---',
  //         item.model || '---',
  //         item.serial || '---',
  //         'Não',
  //         getExecutionDate(item.expiration_date),
  //         formatDate(item.expiration_date),
  //         '---',
  //         '---'
  //       ];

  //       rowData.forEach((text, colIndex) => {
  //         const maxWidth = colWidths[colIndex] - 2;
  //         const lines = doc.splitTextToSize(text, maxWidth);
  //         doc.text(lines[0], xPosition, yPosition);
  //         xPosition += colWidths[colIndex];
  //       });

  //       yPosition += 5;
  //     });

  //     doc.setFontSize(7);
  //     doc.text(`Pág. 1 / 1`, pageWidth - margin - 15, pageHeight - 5);

  //     doc.save(`programacao-calibracao-${new Date().toISOString().split('T')[0]}.pdf`);
  //   } catch (error) {
  //     console.error('Erro ao gerar PDF:', error);
  //     alert('Erro ao exportar para PDF.');
  //   }
  // };


  // const exportProgramacaoPDF = async (dataToExport: CertificateReport[]) => {
  //   try {
  //     const { jsPDF } = await import('jspdf');
  //     const doc = new jsPDF({
  //       orientation: 'landscape',
  //       unit: 'mm',
  //       format: 'a4'
  //     }) as import('jspdf').jsPDF;

  //     const pageWidth = doc.internal.pageSize.getWidth();
  //     const pageHeight = doc.internal.pageSize.getHeight();
  //     const margin = 10;
  //     let yPosition = margin;

  //     // ✅ CABEÇALHO DO DOCUMENTO
  //     doc.setFontSize(16);
  //     doc.setFont('helvetica', 'bold');
  //     doc.text('RELATÓRIO DE CERTIFICADOS', margin, yPosition);
  //     yPosition += 8;

  //     doc.setFontSize(9);
  //     doc.setFont('helvetica', 'normal');
  //     doc.text(new Date().toLocaleDateString('pt-BR'), margin, yPosition);
  //     doc.text(`Total de Registros: ${dataToExport.length}`, pageWidth - margin, yPosition, { align: 'right' });
  //     yPosition += 10;

  //     // ✅ CABEÇALHOS EXATAMENTE COMO NA TABELA
  //     const headers = [
  //       'Site',
  //       'Área',
  //       'Zona',
  //       'Certificado',
  //       'Código',
  //       'Item',
  //       'Marca',
  //       'Modelo',
  //       'Serial',
  //       'Expiração',
  //       'Dias',
  //       'Status',
  //       'Criticidade'
  //     ];

  //     // ✅ LARGURAS DAS COLUNAS (ajustadas para caber na página)
  //     const colWidths = [18, 40, 40, 22, 12, 30, 12, 12, 18, 18, 10, 15, 15];

  //     // ✅ FUNÇÃO AUXILIAR PARA DESENHAR CABEÇALHO
  //     const drawTableHeader = () => {
  //       doc.setFillColor(220, 220, 220);
  //       doc.rect(margin, yPosition - 4, pageWidth - 2 * margin, 6, 'F');

  //       doc.setFontSize(7);
  //       doc.setFont('helvetica', 'bold');

  //       let xPos = margin + 1;
  //       headers.forEach((header, index) => {
  //         doc.text(header, xPos, yPosition);
  //         xPos += colWidths[index];
  //       });

  //       yPosition += 6;
  //       doc.setFont('helvetica', 'normal');
  //       doc.setFontSize(6);
  //     };

  //     // ✅ DESENHAR CABEÇALHO INICIAL
  //     drawTableHeader();

  //     // ✅ DESENHAR LINHAS DE DADOS
  //     dataToExport.forEach((item, index) => {
  //       // ✅ CALCULAR DADOS EXATAMENTE COMO NA TABELA
  //       const daysUntilExpiration = getDaysUntilExpiration(item.expiration_date);
  //       const criticalityBadge = getCriticalityBadge(daysUntilExpiration);

  //       // ✅ PREPARAR DADOS DA LINHA COM QUEBRA DE TEXTO
  //       const rowData = [
  //         { text: item.Home_site_name, maxWidth: colWidths[0] - 2 },
  //         { text: item.code_zone, maxWidth: colWidths[1] - 2 }, // Área - com quebra
  //         { text: item.code_area, maxWidth: colWidths[2] - 2 }, // Zona - com quebra
  //         { text: item.certificate_description, maxWidth: colWidths[3] - 2 },
  //         { text: item.item_code, maxWidth: colWidths[4] - 2 },
  //         { text: item.item_name, maxWidth: colWidths[5] - 2 },
  //         { text: item.brand || '-', maxWidth: colWidths[6] - 2 },
  //         { text: item.model || '-', maxWidth: colWidths[7] - 2 },
  //         { text: item.serial, maxWidth: colWidths[8] - 2 },
  //         { text: formatDate(item.expiration_date), maxWidth: colWidths[9] - 2 },
  //         { text: `${daysUntilExpiration}`, maxWidth: colWidths[10] - 2 },
  //         { text: translateStatus(item.certificate_status_name), maxWidth: colWidths[11] - 2 },
  //         { text: criticalityBadge.label, maxWidth: colWidths[12] - 2 }
  //       ];

  //       // ✅ CALCULAR ALTURA DA LINHA (baseado na maior quantidade de linhas de texto)
  //       let maxLines = 1;
  //       const splitTexts = rowData.map((data) => {
  //         const lines = doc.splitTextToSize(data.text, data.maxWidth);
  //         maxLines = Math.max(maxLines, lines.length);
  //         return lines;
  //       });

  //       const rowHeight = maxLines * 4; // 4mm por linha de texto

  //       // ✅ VERIFICAR SE PRECISA DE NOVA PÁGINA
  //       if (yPosition + rowHeight > pageHeight - 15) {
  //         doc.addPage();
  //         yPosition = margin;
  //         drawTableHeader();
  //       }

  //       // ✅ APLICAR COR BASEADA NA CRITICIDADE
  //       if (criticalityBadge.label === 'EXPIRADO' || criticalityBadge.label === 'CRÍTICO') {
  //         doc.setFillColor(254, 226, 226); // Vermelho claro
  //       } else if (criticalityBadge.label === 'ATENÇÃO') {
  //         doc.setFillColor(254, 243, 199); // Laranja claro
  //       } else if (criticalityBadge.label === 'ALERTA') {
  //         doc.setFillColor(254, 249, 195); // Amarelo claro
  //       } else {
  //         doc.setFillColor(220, 252, 231); // Verde claro
  //       }
  //       doc.rect(margin, yPosition - 3, pageWidth - 2 * margin, rowHeight, 'F');

  //       // ✅ ESCREVER DADOS COM QUEBRA DE LINHA
  //       let xPosition = margin + 1;

  //       splitTexts.forEach((lines, colIndex) => {
  //         let textYPosition = yPosition;

  //         // ✅ COR ESPECIAL PARA COLUNA DE DIAS
  //         if (colIndex === 10) { // Coluna "Dias"
  //           if (daysUntilExpiration < 0) {
  //             doc.setTextColor(220, 38, 38); // Vermelho
  //           } else if (daysUntilExpiration <= 30) {
  //             doc.setTextColor(249, 115, 22); // Laranja
  //           } else if (daysUntilExpiration <= 90) {
  //             doc.setTextColor(234, 179, 8); // Amarelo
  //           } else {
  //             doc.setTextColor(34, 197, 94); // Verde
  //           }
  //           doc.setFont('helvetica', 'bold');
  //         } else {
  //           doc.setTextColor(0, 0, 0);
  //           doc.setFont('helvetica', 'normal');
  //         }

  //         // ✅ ESCREVER CADA LINHA DE TEXTO
  //         lines.forEach((line: string) => {
  //           doc.text(line, xPosition, textYPosition);
  //           textYPosition += 4; // Espaçamento entre linhas
  //         });

  //         xPosition += colWidths[colIndex];
  //       });

  //       yPosition += rowHeight;
  //     });

  //     // ✅ RODAPÉ
  //     doc.setFontSize(7);
  //     doc.setTextColor(128, 128, 128);
  //     doc.text(
  //       `Gerado em ${new Date().toLocaleString('pt-BR')}`,
  //       pageWidth / 2,
  //       pageHeight - 5,
  //       { align: 'center' }
  //     );

  //     doc.save(`certificados-${new Date().toISOString().split('T')[0]}.pdf`);
  //   } catch (error) {
  //     console.error('Erro ao gerar PDF:', error);
  //     alert('Erro ao exportar para PDF.');
  //   }
  // };


  // const exportProgramacaoPDF = async (dataToExport: CertificateReport[]) => {
  //   try {
  //     const { jsPDF } = await import('jspdf');
  //     const doc = new jsPDF({
  //       orientation: 'landscape',
  //       unit: 'mm',
  //       format: 'a4'
  //     }) as import('jspdf').jsPDF;

  //     const pageWidth = doc.internal.pageSize.getWidth();
  //     const pageHeight = doc.internal.pageSize.getHeight();
  //     const margin = 10;
  //     let yPosition = margin;

  //     // ✅ CABEÇALHO DO DOCUMENTO
  //     doc.setFontSize(16);
  //     doc.setFont('helvetica', 'bold');
  //     doc.text('RELATÓRIO DE CERTIFICADOS', margin, yPosition);
  //     yPosition += 8;

  //     doc.setFontSize(9);
  //     doc.setFont('helvetica', 'normal');
  //     doc.text(new Date().toLocaleDateString('pt-BR'), margin, yPosition);
  //     doc.text(`Total de Registros: ${dataToExport.length}`, pageWidth - margin, yPosition, { align: 'right' });
  //     yPosition += 10;

  //     // ✅ CABEÇALHOS EXATAMENTE COMO NA TABELA
  //     const headers = [
  //       'Site',
  //       'Área',
  //       'Zona',
  //       'Certificado',
  //       'Código',
  //       'Item',
  //       'Marca',
  //       'Modelo',
  //       'Serial',
  //       'Expiração',
  //       'Dias',
  //       'Status',
  //       'Criticidade'
  //     ];

  //     // ✅ LARGURAS DAS COLUNAS (ajustadas para caber na página)
  //     const colWidths = [18, 40, 40, 22, 12, 30, 12, 12, 18, 18, 10, 15, 15];

  //     // ✅ FUNÇÃO AUXILIAR PARA DESENHAR CABEÇALHO
  //     const drawTableHeader = () => {
  //       doc.setFillColor(220, 220, 220);
  //       doc.rect(margin, yPosition - 4, pageWidth - 2 * margin, 6, 'F');

  //       doc.setFontSize(7);
  //       doc.setFont('helvetica', 'bold');
  //       doc.setTextColor(0, 0, 0);

  //       let xPos = margin + 1;
  //       headers.forEach((header, index) => {
  //         doc.text(header, xPos, yPosition);
  //         xPos += colWidths[index];
  //       });

  //       yPosition += 6;

  //       // ✅ LINHA HORIZONTAL ABAIXO DO CABEÇALHO - MAIS VISÍVEL
  //       doc.setDrawColor(180, 180, 180); // Cinza mais escuro
  //       doc.setLineWidth(0.5); // Linha mais grossa
  //       doc.line(margin, yPosition, pageWidth - margin, yPosition);

  //       yPosition += 1; // Espaço após a linha

  //       doc.setFont('helvetica', 'normal');
  //       doc.setFontSize(6);
  //     };

  //     // ✅ DESENHAR CABEÇALHO INICIAL
  //     drawTableHeader();

  //     // ✅ DESENHAR LINHAS DE DADOS
  //     dataToExport.forEach((item, index) => {
  //       // ✅ CALCULAR DADOS EXATAMENTE COMO NA TABELA
  //       const daysUntilExpiration = getDaysUntilExpiration(item.expiration_date);
  //       const criticalityBadge = getCriticalityBadge(daysUntilExpiration);

  //       // ✅ PREPARAR DADOS DA LINHA COM QUEBRA DE TEXTO
  //       const rowData = [
  //         { text: item.Home_site_name, maxWidth: colWidths[0] - 2 },
  //         { text: item.code_zone, maxWidth: colWidths[1] - 2 }, // Área - com quebra
  //         { text: item.code_area, maxWidth: colWidths[2] - 2 }, // Zona - com quebra
  //         { text: item.certificate_description, maxWidth: colWidths[3] - 2 },
  //         { text: item.item_code, maxWidth: colWidths[4] - 2 },
  //         { text: item.item_name, maxWidth: colWidths[5] - 2 },
  //         { text: item.brand || '-', maxWidth: colWidths[6] - 2 },
  //         { text: item.model || '-', maxWidth: colWidths[7] - 2 },
  //         { text: item.serial, maxWidth: colWidths[8] - 2 },
  //         { text: formatDate(item.expiration_date), maxWidth: colWidths[9] - 2 },
  //         { text: `${daysUntilExpiration}`, maxWidth: colWidths[10] - 2 },
  //         { text: translateStatus(item.certificate_status_name), maxWidth: colWidths[11] - 2 },
  //         { text: criticalityBadge.label, maxWidth: colWidths[12] - 2 }
  //       ];

  //       // ✅ CALCULAR ALTURA DA LINHA (baseado na maior quantidade de linhas de texto)
  //       let maxLines = 1;
  //       const splitTexts = rowData.map((data) => {
  //         const lines = doc.splitTextToSize(data.text, data.maxWidth);
  //         maxLines = Math.max(maxLines, lines.length);
  //         return lines;
  //       });

  //       const rowHeight = maxLines * 4 + 1; // 4mm por linha de texto + 1mm padding

  //       // ✅ VERIFICAR SE PRECISA DE NOVA PÁGINA
  //       if (yPosition + rowHeight > pageHeight - 15) {
  //         doc.addPage();
  //         yPosition = margin;
  //         drawTableHeader();
  //       }

  //       // ✅ APLICAR COR BASEADA NA CRITICIDADE
  //       if (criticalityBadge.label === 'EXPIRADO' || criticalityBadge.label === 'CRÍTICO') {
  //         doc.setFillColor(254, 226, 226); // Vermelho claro
  //       } else if (criticalityBadge.label === 'ATENÇÃO') {
  //         doc.setFillColor(254, 243, 199); // Laranja claro
  //       } else if (criticalityBadge.label === 'ALERTA') {
  //         doc.setFillColor(254, 249, 195); // Amarelo claro
  //       } else {
  //         doc.setFillColor(220, 252, 231); // Verde claro
  //       }
  //       doc.rect(margin, yPosition, pageWidth - 2 * margin, rowHeight, 'F');

  //       // ✅ ESCREVER DADOS COM QUEBRA DE LINHA
  //       let xPosition = margin + 1;

  //       splitTexts.forEach((lines, colIndex) => {
  //         let textYPosition = yPosition + 3; // Padding top

  //         // ✅ COR ESPECIAL PARA COLUNA DE DIAS
  //         if (colIndex === 10) { // Coluna "Dias"
  //           if (daysUntilExpiration < 0) {
  //             doc.setTextColor(220, 38, 38); // Vermelho
  //           } else if (daysUntilExpiration <= 30) {
  //             doc.setTextColor(249, 115, 22); // Laranja
  //           } else if (daysUntilExpiration <= 90) {
  //             doc.setTextColor(234, 179, 8); // Amarelo
  //           } else {
  //             doc.setTextColor(34, 197, 94); // Verde
  //           }
  //           doc.setFont('helvetica', 'bold');
  //         } else {
  //           doc.setTextColor(0, 0, 0);
  //           doc.setFont('helvetica', 'normal');
  //         }

  //         // ✅ ESCREVER CADA LINHA DE TEXTO
  //         lines.forEach((line: string) => {
  //           doc.text(line, xPosition, textYPosition);
  //           textYPosition += 4; // Espaçamento entre linhas
  //         });

  //         xPosition += colWidths[colIndex];
  //       });

  //       yPosition += rowHeight;

  //       // ✅ LINHA HORIZONTAL ENTRE AS LINHAS - MAIS VISÍVEL
  //       doc.setDrawColor(200, 200, 200); // Cinza médio
  //       doc.setLineWidth(0.2); // Linha um pouco mais grossa
  //       doc.line(margin, yPosition, pageWidth - margin, yPosition);

  //       yPosition += 0.5; // Pequeno espaço após a linha
  //     });

  //     // ✅ RODAPÉ
  //     doc.setFontSize(7);
  //     doc.setTextColor(128, 128, 128);
  //     doc.text(
  //       `Gerado em ${new Date().toLocaleString('pt-BR')}`,
  //       pageWidth / 2,
  //       pageHeight - 5,
  //       { align: 'center' }
  //     );

  //     doc.save(`certificados-${new Date().toISOString().split('T')[0]}.pdf`);
  //   } catch (error) {
  //     console.error('Erro ao gerar PDF:', error);
  //     alert('Erro ao exportar para PDF.');
  //   }
  // };


  // const exportProgramacaoPDF = async (dataToExport: CertificateReport[]) => {
  //   try {
  //     const { jsPDF } = await import('jspdf');
  //     const doc = new jsPDF({
  //       orientation: 'landscape',
  //       unit: 'mm',
  //       format: 'a4'
  //     }) as import('jspdf').jsPDF;

  //     const pageWidth = doc.internal.pageSize.getWidth();
  //     const pageHeight = doc.internal.pageSize.getHeight();
  //     const margin = 10;
  //     let yPosition = margin;

  //     // ✅ CALCULAR ESTATÍSTICAS ANALÍTICAS
  //     const analytics = {
  //       total: dataToExport.length,
  //       expired: 0,
  //       expiringIn30Days: 0,
  //       expiringIn60Days: 0,
  //       expiringIn90Days: 0,
  //       safe: 0,
  //       bySite: {} as Record<string, number>,
  //       byCertificateType: {} as Record<string, number>,
  //       byStatus: {} as Record<string, number>,
  //       byBrand: {} as Record<string, number>,
  //       criticalItems: [] as any[]
  //     };

  //     dataToExport.forEach(item => {
  //       const days = getDaysUntilExpiration(item.expiration_date);

  //       // Contagem por período
  //       if (days < 0) analytics.expired++;
  //       else if (days <= 30) analytics.expiringIn30Days++;
  //       else if (days <= 60) analytics.expiringIn60Days++;
  //       else if (days <= 90) analytics.expiringIn90Days++;
  //       else analytics.safe++;

  //       // Agregar por site
  //       analytics.bySite[item.Home_site_name] = (analytics.bySite[item.Home_site_name] || 0) + 1;

  //       // Agregar por tipo de certificado
  //       analytics.byCertificateType[item.certificate_description] = 
  //         (analytics.byCertificateType[item.certificate_description] || 0) + 1;

  //       // Agregar por status
  //       analytics.byStatus[item.certificate_status_name] = 
  //         (analytics.byStatus[item.certificate_status_name] || 0) + 1;

  //       // Agregar por marca
  //       if (item.brand) {
  //         analytics.byBrand[item.brand] = (analytics.byBrand[item.brand] || 0) + 1;
  //       }

  //       // Itens críticos (expirados ou expirando em 30 dias)
  //       if (days <= 30) {
  //         analytics.criticalItems.push({
  //           item: item.item_name,
  //           code: item.item_code,
  //           days,
  //           site: item.Home_site_name
  //         });
  //       }
  //     });

  //     // Ordenar itens críticos por dias
  //     analytics.criticalItems.sort((a, b) => a.days - b.days);

  //     // Top 5 sites
  //     const topSites = Object.entries(analytics.bySite)
  //       .sort((a, b) => b[1] - a[1])
  //       .slice(0, 5);

  //     // Top 5 tipos de certificado
  //     const topCertTypes = Object.entries(analytics.byCertificateType)
  //       .sort((a, b) => b[1] - a[1])
  //       .slice(0, 5);

  //     // ✅ CABEÇALHO DO DOCUMENTO COM RESUMO
  //     doc.setFontSize(18);
  //     doc.setFont('helvetica', 'bold');
  //     doc.setTextColor(37, 99, 235); // Azul
  //     doc.text('RELATÓRIO DE CERTIFICADOS', margin, yPosition);
  //     yPosition += 8;

  //     doc.setFontSize(10);
  //     doc.setFont('helvetica', 'normal');
  //     doc.setTextColor(0, 0, 0);
  //     doc.text(new Date().toLocaleDateString('pt-BR'), margin, yPosition);
  //     doc.text(`Total de Registros: ${dataToExport.length}`, pageWidth - margin, yPosition, { align: 'right' });
  //     yPosition += 8;

  //     // ✅ RESUMO EXECUTIVO NO CABEÇALHO
  //     doc.setFillColor(245, 247, 250); // Cinza claro
  //     doc.rect(margin, yPosition, pageWidth - 2 * margin, 35, 'F');

  //     yPosition += 5;
  //     doc.setFontSize(11);
  //     doc.setFont('helvetica', 'bold');
  //     doc.setTextColor(51, 51, 51);
  //     doc.text('RESUMO EXECUTIVO', margin + 3, yPosition);
  //     yPosition += 6;

  //     // Primeira linha de métricas
  //     doc.setFontSize(8);
  //     doc.setFont('helvetica', 'normal');
  //     let xPos = margin + 3;
  //     const metrics = [
  //       { label: 'Total', value: analytics.total, color: [59, 130, 246] },
  //       { label: 'Expirados', value: analytics.expired, color: [239, 68, 68] },
  //       { label: '≤ 30 dias', value: analytics.expiringIn30Days, color: [249, 115, 22] },
  //       { label: '31-60 dias', value: analytics.expiringIn60Days, color: [234, 179, 8] },
  //       { label: '61-90 dias', value: analytics.expiringIn90Days, color: [34, 197, 94] },
  //       { label: '> 90 dias', value: analytics.safe, color: [16, 185, 129] }
  //     ];

  //     metrics.forEach((metric, index) => {
  //       doc.setTextColor(100, 100, 100);
  //       doc.text(metric.label + ':', xPos, yPosition);
  //       doc.setFont('helvetica', 'bold');
  //       doc.setTextColor(metric.color[0], metric.color[1], metric.color[2]);
  //       doc.text(metric.value.toString(), xPos + 18, yPosition);
  //       doc.setFont('helvetica', 'normal');
  //       xPos += 45;
  //     });

  //     yPosition += 6;

  //     // Top Sites
  //     doc.setFont('helvetica', 'bold');
  //     doc.setTextColor(51, 51, 51);
  //     doc.text('Top Sites:', margin + 3, yPosition);
  //     doc.setFont('helvetica', 'normal');
  //     doc.setTextColor(80, 80, 80);
  //     xPos = margin + 20;
  //     topSites.forEach(([site, count], index) => {
  //       if (index < 3) {
  //         doc.text(`${site.substring(0, 20)} (${count})`, xPos, yPosition);
  //         xPos += 85;
  //       }
  //     });

  //     yPosition += 6;

  //     // Top Tipos de Certificado
  //     doc.setFont('helvetica', 'bold');
  //     doc.setTextColor(51, 51, 51);
  //     doc.text('Top Tipos:', margin + 3, yPosition);
  //     doc.setFont('helvetica', 'normal');
  //     doc.setTextColor(80, 80, 80);
  //     xPos = margin + 20;
  //     topCertTypes.forEach(([type, count], index) => {
  //       if (index < 3) {
  //         doc.text(`${type.substring(0, 20)} (${count})`, xPos, yPosition);
  //         xPos += 85;
  //       }
  //     });

  //     yPosition += 6;

  //     // Status Distribution
  //     doc.setFont('helvetica', 'bold');
  //     doc.setTextColor(51, 51, 51);
  //     doc.text('Status:', margin + 3, yPosition);
  //     doc.setFont('helvetica', 'normal');
  //     doc.setTextColor(80, 80, 80);
  //     xPos = margin + 20;
  //     Object.entries(analytics.byStatus).forEach(([status, count]) => {
  //       doc.text(`${translateStatus(status)}: ${count}`, xPos, yPosition);
  //       xPos += 70;
  //     });

  //     yPosition += 10;

  //     // ✅ CABEÇALHOS EXATAMENTE COMO NA TABELA
  //     const headers = [
  //       'Site',
  //       'Área',
  //       'Zona',
  //       'Certificado',
  //       'Código',
  //       'Item',
  //       'Marca',
  //       'Modelo',
  //       'Serial',
  //       'Expiração',
  //       'Dias',
  //       'Status',
  //       'Criticidade'
  //     ];

  //     // ✅ LARGURAS DAS COLUNAS (ajustadas para caber na página)
  //     const colWidths = [18, 40, 40, 22, 12, 30, 12, 12, 18, 18, 10, 15, 15];

  //     // ✅ FUNÇÃO AUXILIAR PARA DESENHAR CABEÇALHO
  //     const drawTableHeader = () => {
  //       doc.setFillColor(220, 220, 220);
  //       doc.rect(margin, yPosition - 4, pageWidth - 2 * margin, 6, 'F');

  //       doc.setFontSize(7);
  //       doc.setFont('helvetica', 'bold');
  //       doc.setTextColor(0, 0, 0);

  //       let xPos = margin + 1;
  //       headers.forEach((header, index) => {
  //         doc.text(header, xPos, yPosition);
  //         xPos += colWidths[index];
  //       });

  //       yPosition += 6;

  //       // ✅ LINHA HORIZONTAL ABAIXO DO CABEÇALHO
  //       doc.setDrawColor(180, 180, 180);
  //       doc.setLineWidth(0.5);
  //       doc.line(margin, yPosition, pageWidth - margin, yPosition);

  //       yPosition += 1;

  //       doc.setFont('helvetica', 'normal');
  //       doc.setFontSize(6);
  //     };

  //     // ✅ DESENHAR CABEÇALHO INICIAL
  //     drawTableHeader();

  //     // ✅ DESENHAR LINHAS DE DADOS
  //     dataToExport.forEach((item, index) => {
  //       const daysUntilExpiration = getDaysUntilExpiration(item.expiration_date);
  //       const criticalityBadge = getCriticalityBadge(daysUntilExpiration);

  //       const rowData = [
  //         { text: item.Home_site_name, maxWidth: colWidths[0] - 2 },
  //         { text: item.code_zone, maxWidth: colWidths[1] - 2 },
  //         { text: item.code_area, maxWidth: colWidths[2] - 2 },
  //         { text: item.certificate_description, maxWidth: colWidths[3] - 2 },
  //         { text: item.item_code, maxWidth: colWidths[4] - 2 },
  //         { text: item.item_name, maxWidth: colWidths[5] - 2 },
  //         { text: item.brand || '-', maxWidth: colWidths[6] - 2 },
  //         { text: item.model || '-', maxWidth: colWidths[7] - 2 },
  //         { text: item.serial, maxWidth: colWidths[8] - 2 },
  //         { text: formatDate(item.expiration_date), maxWidth: colWidths[9] - 2 },
  //         { text: `${daysUntilExpiration}`, maxWidth: colWidths[10] - 2 },
  //         { text: translateStatus(item.certificate_status_name), maxWidth: colWidths[11] - 2 },
  //         { text: criticalityBadge.label, maxWidth: colWidths[12] - 2 }
  //       ];

  //       let maxLines = 1;
  //       const splitTexts = rowData.map((data) => {
  //         const lines = doc.splitTextToSize(data.text, data.maxWidth);
  //         maxLines = Math.max(maxLines, lines.length);
  //         return lines;
  //       });

  //       const rowHeight = maxLines * 4 + 1;

  //       if (yPosition + rowHeight > pageHeight - 15) {
  //         doc.addPage();
  //         yPosition = margin;
  //         drawTableHeader();
  //       }

  //       if (criticalityBadge.label === 'EXPIRADO' || criticalityBadge.label === 'CRÍTICO') {
  //         doc.setFillColor(254, 226, 226);
  //       } else if (criticalityBadge.label === 'ATENÇÃO') {
  //         doc.setFillColor(254, 243, 199);
  //       } else if (criticalityBadge.label === 'ALERTA') {
  //         doc.setFillColor(254, 249, 195);
  //       } else {
  //         doc.setFillColor(220, 252, 231);
  //       }
  //       doc.rect(margin, yPosition, pageWidth - 2 * margin, rowHeight, 'F');

  //       let xPosition = margin + 1;

  //       splitTexts.forEach((lines, colIndex) => {
  //         let textYPosition = yPosition + 3;

  //         if (colIndex === 10) {
  //           if (daysUntilExpiration < 0) {
  //             doc.setTextColor(220, 38, 38);
  //           } else if (daysUntilExpiration <= 30) {
  //             doc.setTextColor(249, 115, 22);
  //           } else if (daysUntilExpiration <= 90) {
  //             doc.setTextColor(234, 179, 8);
  //           } else {
  //             doc.setTextColor(34, 197, 94);
  //           }
  //           doc.setFont('helvetica', 'bold');
  //         } else {
  //           doc.setTextColor(0, 0, 0);
  //           doc.setFont('helvetica', 'normal');
  //         }

  //         lines.forEach((line: string) => {
  //           doc.text(line, xPosition, textYPosition);
  //           textYPosition += 4;
  //         });

  //         xPosition += colWidths[colIndex];
  //       });

  //       yPosition += rowHeight;

  //       doc.setDrawColor(200, 200, 200);
  //       doc.setLineWidth(0.2);
  //       doc.line(margin, yPosition, pageWidth - margin, yPosition);

  //       yPosition += 0.5;
  //     });

  //     // ✅ PÁGINA FINAL COM ANÁLISE DETALHADA
  //     doc.addPage();
  //     yPosition = margin;

  //     // Título da página de análise
  //     doc.setFontSize(16);
  //     doc.setFont('helvetica', 'bold');
  //     doc.setTextColor(37, 99, 235);
  //     doc.text('ANÁLISE DETALHADA', margin, yPosition);
  //     yPosition += 10;

  //     // Seção 1: Distribuição por Período
  //     doc.setFontSize(12);
  //     doc.setFont('helvetica', 'bold');
  //     doc.setTextColor(51, 51, 51);
  //     doc.text('Distribuição por Período de Expiração', margin, yPosition);
  //     yPosition += 6;

  //     doc.setFillColor(239, 68, 68, 20);
  //     doc.rect(margin, yPosition, 60, 8, 'F');
  //     doc.setFontSize(9);
  //     doc.setFont('helvetica', 'normal');
  //     doc.text(`Certificados Expirados: ${analytics.expired}`, margin + 2, yPosition + 5);

  //     doc.setFillColor(249, 115, 22, 20);
  //     doc.rect(margin + 65, yPosition, 60, 8, 'F');
  //     doc.text(`Expirando em 30 dias: ${analytics.expiringIn30Days}`, margin + 67, yPosition + 5);

  //     doc.setFillColor(234, 179, 8, 20);
  //     doc.rect(margin + 130, yPosition, 60, 8, 'F');
  //     doc.text(`Expirando 31-60 dias: ${analytics.expiringIn60Days}`, margin + 132, yPosition + 5);

  //     yPosition += 10;

  //     doc.setFillColor(16, 185, 129, 20);
  //     doc.rect(margin, yPosition, 60, 8, 'F');
  //     doc.text(`Expirando 61-90 dias: ${analytics.expiringIn90Days}`, margin + 2, yPosition + 5);

  //     doc.setFillColor(34, 197, 94, 20);
  //     doc.rect(margin + 65, yPosition, 60, 8, 'F');
  //     doc.text(`Válidos (> 90 dias): ${analytics.safe}`, margin + 67, yPosition + 5);

  //     yPosition += 15;

  //     // Seção 2: Top 5 Sites
  //     doc.setFontSize(12);
  //     doc.setFont('helvetica', 'bold');
  //     doc.text('Top 5 Sites com Mais Certificados', margin, yPosition);
  //     yPosition += 6;

  //     doc.setFontSize(9);
  //     doc.setFont('helvetica', 'normal');
  //     topSites.forEach(([site, count], index) => {
  //       const percentage = ((count / analytics.total) * 100).toFixed(1);
  //       doc.text(`${index + 1}. ${site}`, margin + 2, yPosition);
  //       doc.setFont('helvetica', 'bold');
  //       doc.text(`${count} (${percentage}%)`, margin + 150, yPosition);
  //       doc.setFont('helvetica', 'normal');
  //       yPosition += 5;
  //     });

  //     yPosition += 5;

  //     // Seção 3: Distribuição por Tipo de Certificado
  //     doc.setFontSize(12);
  //     doc.setFont('helvetica', 'bold');
  //     doc.text('Distribuição por Tipo de Certificado', margin, yPosition);
  //     yPosition += 6;

  //     doc.setFontSize(9);
  //     doc.setFont('helvetica', 'normal');
  //     topCertTypes.forEach(([type, count], index) => {
  //       const percentage = ((count / analytics.total) * 100).toFixed(1);
  //       doc.text(`${index + 1}. ${type}`, margin + 2, yPosition);
  //       doc.setFont('helvetica', 'bold');
  //       doc.text(`${count} (${percentage}%)`, margin + 150, yPosition);
  //       doc.setFont('helvetica', 'normal');
  //       yPosition += 5;
  //     });

  //     yPosition += 5;

  //     // Seção 4: Top 5 Marcas
  //     const topBrands = Object.entries(analytics.byBrand)
  //       .sort((a, b) => b[1] - a[1])
  //       .slice(0, 5);

  //     doc.setFontSize(12);
  //     doc.setFont('helvetica', 'bold');
  //     doc.text('Top 5 Marcas', margin, yPosition);
  //     yPosition += 6;

  //     doc.setFontSize(9);
  //     doc.setFont('helvetica', 'normal');
  //     topBrands.forEach(([brand, count], index) => {
  //       const percentage = ((count / analytics.total) * 100).toFixed(1);
  //       doc.text(`${index + 1}. ${brand}`, margin + 2, yPosition);
  //       doc.setFont('helvetica', 'bold');
  //       doc.text(`${count} (${percentage}%)`, margin + 150, yPosition);
  //       doc.setFont('helvetica', 'normal');
  //       yPosition += 5;
  //     });

  //     yPosition += 5;

  //     // Seção 5: Itens Críticos (Ação Urgente)
  //     if (analytics.criticalItems.length > 0) {
  //       doc.setFontSize(12);
  //       doc.setFont('helvetica', 'bold');
  //       doc.setTextColor(239, 68, 68);
  //       doc.text('⚠ ITENS CRÍTICOS - AÇÃO URGENTE NECESSÁRIA', margin, yPosition);
  //       yPosition += 6;

  //       doc.setFontSize(8);
  //       doc.setTextColor(0, 0, 0);
  //       doc.setFont('helvetica', 'normal');

  //       const criticalToShow = analytics.criticalItems.slice(0, 10);
  //       criticalToShow.forEach((critical, index) => {
  //         const statusColor = critical.days < 0 ? [239, 68, 68] : [249, 115, 22];
  //         const statusText = critical.days < 0 ? 'EXPIRADO' : `${critical.days} dias`;

  //         doc.text(`${index + 1}. ${critical.item.substring(0, 40)}`, margin + 2, yPosition);
  //         doc.text(`[${critical.code}]`, margin + 110, yPosition);
  //         doc.setTextColor(statusColor[0], statusColor[1], statusColor[2]);
  //         doc.setFont('helvetica', 'bold');
  //         doc.text(statusText, margin + 150, yPosition);
  //         doc.setTextColor(0, 0, 0);
  //         doc.setFont('helvetica', 'normal');
  //         doc.text(critical.site.substring(0, 20), margin + 175, yPosition);
  //         yPosition += 5;
  //       });

  //       if (analytics.criticalItems.length > 10) {
  //         doc.setFontSize(8);
  //         doc.setTextColor(100, 100, 100);
  //         doc.text(`... e mais ${analytics.criticalItems.length - 10} itens críticos`, margin + 2, yPosition);
  //         yPosition += 5;
  //       }
  //     }

  //     // ✅ RODAPÉ EM TODAS AS PÁGINAS
  //     const totalPages = doc.getNumberOfPages();
  //     for (let i = 1; i <= totalPages; i++) {
  //       doc.setPage(i);
  //       doc.setFontSize(7);
  //       doc.setTextColor(128, 128, 128);
  //       doc.text(
  //         `Gerado em ${new Date().toLocaleString('pt-BR')} - Página ${i} de ${totalPages}`,
  //         pageWidth / 2,
  //         pageHeight - 5,
  //         { align: 'center' }
  //       );
  //     }

  //     doc.save(`certificados-relatorio-completo-${new Date().toISOString().split('T')[0]}.pdf`);
  //   } catch (error) {
  //     console.error('Erro ao gerar PDF:', error);
  //     alert('Erro ao exportar para PDF.');
  //   }
  // };


  // const exportProgramacaoPDF = async (dataToExport: CertificateReport[]) => {
  //   try {
  //     const { jsPDF } = await import('jspdf');
  //     const doc = new jsPDF({
  //       orientation: 'landscape',
  //       unit: 'mm',
  //       format: 'a4'
  //     }) as import('jspdf').jsPDF;

  //     const pageWidth = doc.internal.pageSize.getWidth();
  //     const pageHeight = doc.internal.pageSize.getHeight();
  //     const margin = 10;
  //     let yPosition = margin;

  //     // ✅ CALCULAR ESTATÍSTICAS ANALÍTICAS
  //     const analytics = {
  //       total: dataToExport.length,
  //       expired: 0,
  //       expiringIn30Days: 0,
  //       expiringIn60Days: 0,
  //       expiringIn90Days: 0,
  //       safe: 0,
  //       bySite: {} as Record<string, number>,
  //       byCertificateType: {} as Record<string, number>,
  //       byStatus: {} as Record<string, number>,
  //       byBrand: {} as Record<string, number>,
  //       criticalItems: [] as any[]
  //     };

  //     dataToExport.forEach(item => {
  //       const days = getDaysUntilExpiration(item.expiration_date);

  //       if (days < 0) analytics.expired++;
  //       else if (days <= 30) analytics.expiringIn30Days++;
  //       else if (days <= 60) analytics.expiringIn60Days++;
  //       else if (days <= 90) analytics.expiringIn90Days++;
  //       else analytics.safe++;

  //       analytics.bySite[item.Home_site_name] = (analytics.bySite[item.Home_site_name] || 0) + 1;
  //       analytics.byCertificateType[item.certificate_description] = 
  //         (analytics.byCertificateType[item.certificate_description] || 0) + 1;
  //       analytics.byStatus[item.certificate_status_name] = 
  //         (analytics.byStatus[item.certificate_status_name] || 0) + 1;

  //       if (item.brand) {
  //         analytics.byBrand[item.brand] = (analytics.byBrand[item.brand] || 0) + 1;
  //       }

  //       if (days <= 30) {
  //         analytics.criticalItems.push({
  //           item: item.item_name,
  //           code: item.item_code,
  //           days,
  //           site: item.Home_site_name
  //         });
  //       }
  //     });

  //     analytics.criticalItems.sort((a, b) => a.days - b.days);

  //     const topSites = Object.entries(analytics.bySite)
  //       .sort((a, b) => b[1] - a[1])
  //       .slice(0, 5);

  //     const topCertTypes = Object.entries(analytics.byCertificateType)
  //       .sort((a, b) => b[1] - a[1])
  //       .slice(0, 5);

  //     // ✅ CABEÇALHO DO DOCUMENTO
  //     doc.setFontSize(18);
  //     doc.setFont('helvetica', 'bold');
  //     doc.setTextColor(37, 99, 235);
  //     doc.text('RELATÓRIO DE CERTIFICADOS', margin, yPosition);

  //     doc.setFontSize(10);
  //     doc.setFont('helvetica', 'normal');
  //     doc.setTextColor(0, 0, 0);
  //     doc.text(`Total de Registros: ${dataToExport.length}`, pageWidth - margin, yPosition, { align: 'right' });
  //     yPosition += 8;

  //     doc.setFontSize(9);
  //     doc.text(new Date().toLocaleDateString('pt-BR'), margin, yPosition);
  //     yPosition += 8;

  //     // ✅ RESUMO EXECUTIVO - LAYOUT MELHORADO
  //     doc.setFillColor(245, 247, 250);
  //     doc.rect(margin, yPosition, pageWidth - 2 * margin, 40, 'F');

  //     yPosition += 6;
  //     doc.setFontSize(11);
  //     doc.setFont('helvetica', 'bold');
  //     doc.setTextColor(51, 51, 51);
  //     doc.text('RESUMO EXECUTIVO', margin + 3, yPosition);
  //     yPosition += 7;

  //     // ✅ MÉTRICAS EM LINHA - ORGANIZADO
  //     doc.setFontSize(8);
  //     doc.setFont('helvetica', 'normal');
  //     doc.setTextColor(80, 80, 80);

  //     let xPos = margin + 3;

  //     // Total
  //     doc.text('Total:', xPos, yPosition);
  //     doc.setFont('helvetica', 'bold');
  //     doc.setTextColor(59, 130, 246);
  //     doc.text(analytics.total.toString(), xPos + 15, yPosition);

  //     // Expirados
  //     xPos += 40;
  //     doc.setFont('helvetica', 'normal');
  //     doc.setTextColor(80, 80, 80);
  //     doc.text('Expirados:', xPos, yPosition);
  //     doc.setFont('helvetica', 'bold');
  //     doc.setTextColor(239, 68, 68);
  //     doc.text(analytics.expired.toString(), xPos + 22, yPosition);

  //     // ≤ 30 dias
  //     xPos += 50;
  //     doc.setFont('helvetica', 'normal');
  //     doc.setTextColor(80, 80, 80);
  //     doc.text('< 30 dias: ', xPos, yPosition);
  //     doc.setFont('helvetica', 'bold');
  //     doc.setTextColor(249, 115, 22);
  //     doc.text(analytics.expiringIn30Days.toString(), xPos + 20, yPosition);

  //     // 31-60 dias
  //     xPos += 45;
  //     doc.setFont('helvetica', 'normal');
  //     doc.setTextColor(80, 80, 80);
  //     doc.text('31-60 dias:', xPos, yPosition);
  //     doc.setFont('helvetica', 'bold');
  //     doc.setTextColor(234, 179, 8);
  //     doc.text(analytics.expiringIn60Days.toString(), xPos + 22, yPosition);

  //     // 61-90 dias
  //     xPos += 50;
  //     doc.setFont('helvetica', 'normal');
  //     doc.setTextColor(80, 80, 80);
  //     doc.text('61-90 dias:', xPos, yPosition);
  //     doc.setFont('helvetica', 'bold');
  //     doc.setTextColor(34, 197, 94);
  //     doc.text(analytics.expiringIn90Days.toString(), xPos + 22, yPosition);

  //     // > 90 dias
  //     xPos += 50;
  //     doc.setFont('helvetica', 'normal');
  //     doc.setTextColor(80, 80, 80);
  //     doc.text('> 90 dias:', xPos, yPosition);
  //     doc.setFont('helvetica', 'bold');
  //     doc.setTextColor(16, 185, 129);
  //     doc.text(analytics.safe.toString(), xPos + 20, yPosition);

  //     yPosition += 7;

  //     // ✅ TOP SITES - ORGANIZADO
  //     doc.setFont('helvetica', 'bold');
  //     doc.setTextColor(51, 51, 51);
  //     doc.text('Top Sites:', margin + 3, yPosition);

  //     doc.setFont('helvetica', 'normal');
  //     doc.setTextColor(80, 80, 80);
  //     doc.setFontSize(7);

  //     xPos = margin + 3;
  //     yPosition += 5;
  //     topSites.slice(0, 3).forEach(([site, count], index) => {
  //       doc.text(`${index + 1}. ${site.substring(0, 25)} (${count})`, xPos, yPosition);
  //       xPos += 90;
  //     });

  //     yPosition += 6;

  //     // ✅ TOP TIPOS - ORGANIZADO
  //     doc.setFontSize(8);
  //     doc.setFont('helvetica', 'bold');
  //     doc.setTextColor(51, 51, 51);
  //     doc.text('Top Tipos:', margin + 3, yPosition);

  //     doc.setFont('helvetica', 'normal');
  //     doc.setTextColor(80, 80, 80);
  //     doc.setFontSize(7);

  //     xPos = margin + 3;
  //     yPosition += 5;
  //     topCertTypes.slice(0, 3).forEach(([type, count], index) => {
  //       doc.text(`${index + 1}. ${type.substring(0, 25)} (${count})`, xPos, yPosition);
  //       xPos += 90;
  //     });

  //     yPosition += 6;

  //     // ✅ STATUS - ORGANIZADO
  //     doc.setFontSize(8);
  //     doc.setFont('helvetica', 'bold');
  //     doc.setTextColor(51, 51, 51);
  //     doc.text('Status:', margin + 3, yPosition);

  //     doc.setFont('helvetica', 'normal');
  //     doc.setTextColor(80, 80, 80);
  //     doc.setFontSize(7);

  //     xPos = margin + 20;
  //     Object.entries(analytics.byStatus).forEach(([status, count]) => {
  //       doc.text(`${translateStatus(status)}: ${count}`, xPos, yPosition);
  //       xPos += 60;
  //     });

  //     yPosition += 10;

  //     // ✅ CABEÇALHOS DA TABELA
  //     const headers = [
  //       'Site',
  //       'Área',
  //       'Zona',
  //       'Certificado',
  //       'Código',
  //       'Item',
  //       'Marca',
  //       'Modelo',
  //       'Serial',
  //       'Expiração',
  //       'Dias',
  //       'Status',
  //       'Criticidade'
  //     ];

  //     const colWidths = [18, 40, 40, 22, 12, 30, 12, 12, 18, 18, 10, 15, 15];

  //     const drawTableHeader = () => {
  //       doc.setFillColor(220, 220, 220);
  //       doc.rect(margin, yPosition - 4, pageWidth - 2 * margin, 6, 'F');

  //       doc.setFontSize(7);
  //       doc.setFont('helvetica', 'bold');
  //       doc.setTextColor(0, 0, 0);

  //       let xPos = margin + 1;
  //       headers.forEach((header, index) => {
  //         doc.text(header, xPos, yPosition);
  //         xPos += colWidths[index];
  //       });

  //       yPosition += 6;

  //       doc.setDrawColor(180, 180, 180);
  //       doc.setLineWidth(0.5);
  //       doc.line(margin, yPosition, pageWidth - margin, yPosition);

  //       yPosition += 1;

  //       doc.setFont('helvetica', 'normal');
  //       doc.setFontSize(6);
  //     };

  //     drawTableHeader();

  //     // ✅ DESENHAR LINHAS DE DADOS
  //     dataToExport.forEach((item, index) => {
  //       const daysUntilExpiration = getDaysUntilExpiration(item.expiration_date);
  //       const criticalityBadge = getCriticalityBadge(daysUntilExpiration);

  //       const rowData = [
  //         { text: item.Home_site_name, maxWidth: colWidths[0] - 2 },
  //         { text: item.code_zone, maxWidth: colWidths[1] - 2 },
  //         { text: item.code_area, maxWidth: colWidths[2] - 2 },
  //         { text: item.certificate_description, maxWidth: colWidths[3] - 2 },
  //         { text: item.item_code, maxWidth: colWidths[4] - 2 },
  //         { text: item.item_name, maxWidth: colWidths[5] - 2 },
  //         { text: item.brand || '-', maxWidth: colWidths[6] - 2 },
  //         { text: item.model || '-', maxWidth: colWidths[7] - 2 },
  //         { text: item.serial, maxWidth: colWidths[8] - 2 },
  //         { text: formatDate(item.expiration_date), maxWidth: colWidths[9] - 2 },
  //         { text: `${daysUntilExpiration}`, maxWidth: colWidths[10] - 2 },
  //         { text: translateStatus(item.certificate_status_name), maxWidth: colWidths[11] - 2 },
  //         { text: criticalityBadge.label, maxWidth: colWidths[12] - 2 }
  //       ];

  //       let maxLines = 1;
  //       const splitTexts = rowData.map((data) => {
  //         const lines = doc.splitTextToSize(data.text, data.maxWidth);
  //         maxLines = Math.max(maxLines, lines.length);
  //         return lines;
  //       });

  //       const rowHeight = maxLines * 4 + 1;

  //       if (yPosition + rowHeight > pageHeight - 15) {
  //         doc.addPage();
  //         yPosition = margin;
  //         drawTableHeader();
  //       }

  //       if (criticalityBadge.label === 'EXPIRADO' || criticalityBadge.label === 'CRÍTICO') {
  //         doc.setFillColor(254, 226, 226);
  //       } else if (criticalityBadge.label === 'ATENÇÃO') {
  //         doc.setFillColor(254, 243, 199);
  //       } else if (criticalityBadge.label === 'ALERTA') {
  //         doc.setFillColor(254, 249, 195);
  //       } else {
  //         doc.setFillColor(220, 252, 231);
  //       }
  //       doc.rect(margin, yPosition, pageWidth - 2 * margin, rowHeight, 'F');

  //       let xPosition = margin + 1;

  //       splitTexts.forEach((lines, colIndex) => {
  //         let textYPosition = yPosition + 3;

  //         if (colIndex === 10) {
  //           if (daysUntilExpiration < 0) {
  //             doc.setTextColor(220, 38, 38);
  //           } else if (daysUntilExpiration <= 30) {
  //             doc.setTextColor(249, 115, 22);
  //           } else if (daysUntilExpiration <= 90) {
  //             doc.setTextColor(234, 179, 8);
  //           } else {
  //             doc.setTextColor(34, 197, 94);
  //           }
  //           doc.setFont('helvetica', 'bold');
  //         } else {
  //           doc.setTextColor(0, 0, 0);
  //           doc.setFont('helvetica', 'normal');
  //         }

  //         lines.forEach((line: string) => {
  //           doc.text(line, xPosition, textYPosition);
  //           textYPosition += 4;
  //         });

  //         xPosition += colWidths[colIndex];
  //       });

  //       yPosition += rowHeight;

  //       doc.setDrawColor(200, 200, 200);
  //       doc.setLineWidth(0.2);
  //       doc.line(margin, yPosition, pageWidth - margin, yPosition);

  //       yPosition += 0.5;
  //     });

  //     // ✅ PÁGINA FINAL - ANÁLISE DETALHADA - LAYOUT MELHORADO
  //     doc.addPage();
  //     yPosition = margin;

  //     doc.setFontSize(18);
  //     doc.setFont('helvetica', 'bold');
  //     doc.setTextColor(37, 99, 235);
  //     doc.text('ANÁLISE DETALHADA', margin, yPosition);
  //     yPosition += 12;

  //     // ✅ SEÇÃO 1: DISTRIBUIÇÃO POR PERÍODO
  //     doc.setFontSize(11);
  //     doc.setFont('helvetica', 'bold');
  //     doc.setTextColor(51, 51, 51);
  //     doc.text('Distribuição por Período de Expiração', margin, yPosition);
  //     yPosition += 7;

  //     const distributionData = [
  //       { label: 'Certificados Expirados:', value: analytics.expired, color: [254, 226, 226] },
  //       { label: 'Expirando em 30 dias:', value: analytics.expiringIn30Days, color: [254, 243, 199] },
  //       { label: 'Expirando 31-60 dias:', value: analytics.expiringIn60Days, color: [254, 249, 195] },
  //       { label: 'Expirando 61-90 dias:', value: analytics.expiringIn90Days, color: [220, 252, 231] },
  //       { label: 'Válidos (> 90 dias):', value: analytics.safe, color: [209, 250, 229] }
  //     ];

  //     distributionData.forEach((item) => {
  //       doc.setFillColor(item.color[0], item.color[1], item.color[2]);
  //       doc.rect(margin, yPosition - 2, pageWidth - 2 * margin, 7, 'F');

  //       doc.setFontSize(9);
  //       doc.setFont('helvetica', 'normal');
  //       doc.setTextColor(51, 51, 51);
  //       doc.text(item.label, margin + 3, yPosition + 2);

  //       doc.setFont('helvetica', 'bold');
  //       doc.text(item.value.toString(), pageWidth - margin - 20, yPosition + 2);

  //       yPosition += 8;
  //     });

  //     yPosition += 5;

  //     // ✅ SEÇÃO 2: TOP 5 SITES
  //     doc.setFontSize(11);
  //     doc.setFont('helvetica', 'bold');
  //     doc.setTextColor(51, 51, 51);
  //     doc.text('Top 5 Sites com Mais Certificados', margin, yPosition);
  //     yPosition += 7;

  //     doc.setFontSize(9);
  //     doc.setFont('helvetica', 'normal');
  //     topSites.forEach(([site, count], index) => {
  //       const percentage = ((count / analytics.total) * 100).toFixed(1);

  //       doc.setTextColor(80, 80, 80);
  //       doc.text(`${index + 1}. ${site}`, margin + 5, yPosition);

  //       doc.setFont('helvetica', 'bold');
  //       doc.setTextColor(37, 99, 235);
  //       doc.text(`${count} (${percentage}%)`, pageWidth - margin - 35, yPosition);

  //       doc.setFont('helvetica', 'normal');
  //       yPosition += 6;
  //     });

  //     yPosition += 5;

  //     // ✅ SEÇÃO 3: DISTRIBUIÇÃO POR TIPO
  //     doc.setFontSize(11);
  //     doc.setFont('helvetica', 'bold');
  //     doc.setTextColor(51, 51, 51);
  //     doc.text('Distribuição por Tipo de Certificado', margin, yPosition);
  //     yPosition += 7;

  //     doc.setFontSize(9);
  //     doc.setFont('helvetica', 'normal');
  //     topCertTypes.forEach(([type, count], index) => {
  //       const percentage = ((count / analytics.total) * 100).toFixed(1);

  //       doc.setTextColor(80, 80, 80);
  //       doc.text(`${index + 1}. ${type}`, margin + 5, yPosition);

  //       doc.setFont('helvetica', 'bold');
  //       doc.setTextColor(37, 99, 235);
  //       doc.text(`${count} (${percentage}%)`, pageWidth - margin - 35, yPosition);

  //       doc.setFont('helvetica', 'normal');
  //       yPosition += 6;
  //     });

  //     yPosition += 5;

  //     // ✅ SEÇÃO 4: TOP 5 MARCAS
  //     const topBrands = Object.entries(analytics.byBrand)
  //       .sort((a, b) => b[1] - a[1])
  //       .slice(0, 5);

  //     doc.setFontSize(11);
  //     doc.setFont('helvetica', 'bold');
  //     doc.setTextColor(51, 51, 51);
  //     doc.text('Top 5 Marcas', margin, yPosition);
  //     yPosition += 7;

  //     doc.setFontSize(9);
  //     doc.setFont('helvetica', 'normal');
  //     topBrands.forEach(([brand, count], index) => {
  //       const percentage = ((count / analytics.total) * 100).toFixed(1);

  //       doc.setTextColor(80, 80, 80);
  //       doc.text(`${index + 1}. ${brand}`, margin + 5, yPosition);

  //       doc.setFont('helvetica', 'bold');
  //       doc.setTextColor(37, 99, 235);
  //       doc.text(`${count} (${percentage}%)`, pageWidth - margin - 35, yPosition);

  //       doc.setFont('helvetica', 'normal');
  //       yPosition += 6;
  //     });

  //     yPosition += 8;

  //     // ✅ SEÇÃO 5: ITENS CRÍTICOS
  //     if (analytics.criticalItems.length > 0) {
  //       doc.setFontSize(11);
  //       doc.setFont('helvetica', 'bold');
  //       doc.setTextColor(239, 68, 68);
  //       doc.text('⚠ ITENS CRÍTICOS - AÇÃO URGENTE NECESSÁRIA', margin, yPosition);
  //       yPosition += 7;

  //       doc.setFontSize(8);
  //       doc.setFont('helvetica', 'normal');

  //       // Cabeçalho da tabela de críticos
  //       doc.setFillColor(254, 226, 226);
  //       doc.rect(margin, yPosition - 2, pageWidth - 2 * margin, 6, 'F');

  //       doc.setFont('helvetica', 'bold');
  //       doc.setTextColor(51, 51, 51);
  //       doc.text('Item', margin + 3, yPosition + 2);
  //       doc.text('Código', margin + 90, yPosition + 2);
  //       doc.text('Status', margin + 130, yPosition + 2);
  //       doc.text('Site', margin + 160, yPosition + 2);
  //       yPosition += 7;

  //       doc.setFont('helvetica', 'normal');
  //       const criticalToShow = analytics.criticalItems.slice(0, 15);
  //       criticalToShow.forEach((critical, index) => {
  //         if (yPosition > pageHeight - 20) return;

  //         const bgColor = index % 2 === 0 ? [255, 255, 255] : [250, 250, 250];
  //         doc.setFillColor(bgColor[0], bgColor[1], bgColor[2]);
  //         doc.rect(margin, yPosition - 2, pageWidth - 2 * margin, 5, 'F');

  //         doc.setTextColor(51, 51, 51);
  //         doc.text(`${index + 1}. ${critical.item.substring(0, 35)}`, margin + 3, yPosition + 1);
  //         doc.text(critical.code, margin + 90, yPosition + 1);

  //         const statusColor = critical.days < 0 ? [239, 68, 68] : [249, 115, 22];
  //         const statusText = critical.days < 0 ? 'EXPIRADO' : `${critical.days} dias`;
  //         doc.setTextColor(statusColor[0], statusColor[1], statusColor[2]);
  //         doc.setFont('helvetica', 'bold');
  //         doc.text(statusText, margin + 130, yPosition + 1);

  //         doc.setTextColor(51, 51, 51);
  //         doc.setFont('helvetica', 'normal');
  //         doc.text(critical.site.substring(0, 25), margin + 160, yPosition + 1);

  //         yPosition += 6;
  //       });

  //       if (analytics.criticalItems.length > 15) {
  //         doc.setFontSize(8);
  //         doc.setTextColor(100, 100, 100);
  //         doc.text(`... e mais ${analytics.criticalItems.length - 15} itens críticos`, margin + 3, yPosition + 2);
  //       }
  //     }

  //     // ✅ RODAPÉ EM TODAS AS PÁGINAS
  //     const totalPages = doc.getNumberOfPages();
  //     for (let i = 1; i <= totalPages; i++) {
  //       doc.setPage(i);
  //       doc.setFontSize(7);
  //       doc.setTextColor(128, 128, 128);
  //       doc.text(
  //         `Gerado em ${new Date().toLocaleString('pt-BR')} - Página ${i} de ${totalPages}`,
  //         pageWidth / 2,
  //         pageHeight - 5,
  //         { align: 'center' }
  //       );
  //     }

  //     doc.save(`certificados-relatorio-completo-${new Date().toISOString().split('T')[0]}.pdf`);
  //   } catch (error) {
  //     console.error('Erro ao gerar PDF:', error);
  //     alert('Erro ao exportar para PDF.');
  //   }
  // };


  // const exportProgramacaoPDF = async (dataToExport: CertificateReport[]) => {
  //   try {
  //     const { jsPDF } = await import('jspdf');
  //     const doc = new jsPDF({
  //       orientation: 'landscape',
  //       unit: 'mm',
  //       format: 'a4'
  //     }) as import('jspdf').jsPDF;

  //     const pageWidth = doc.internal.pageSize.getWidth();
  //     const pageHeight = doc.internal.pageSize.getHeight();
  //     const margin = 10;
  //     let yPosition = margin;

  //     // ✅ CALCULAR ESTATÍSTICAS ANALÍTICAS
  //     const analytics = {
  //       total: dataToExport.length,
  //       expired: 0,
  //       expiringIn30Days: 0,
  //       expiringIn60Days: 0,
  //       expiringIn90Days: 0,
  //       safe: 0,
  //       bySite: {} as Record<string, number>,
  //       byCertificateType: {} as Record<string, number>,
  //       byStatus: {} as Record<string, number>,
  //       byBrand: {} as Record<string, number>,
  //       criticalItems: [] as any[]
  //     };

  //     dataToExport.forEach(item => {
  //       const days = getDaysUntilExpiration(item.expiration_date);

  //       if (days < 0) analytics.expired++;
  //       else if (days <= 30) analytics.expiringIn30Days++;
  //       else if (days <= 60) analytics.expiringIn60Days++;
  //       else if (days <= 90) analytics.expiringIn90Days++;
  //       else analytics.safe++;

  //       analytics.bySite[item.Home_site_name] = (analytics.bySite[item.Home_site_name] || 0) + 1;
  //       analytics.byCertificateType[item.certificate_description] = 
  //         (analytics.byCertificateType[item.certificate_description] || 0) + 1;
  //       analytics.byStatus[item.certificate_status_name] = 
  //         (analytics.byStatus[item.certificate_status_name] || 0) + 1;

  //       if (item.brand) {
  //         analytics.byBrand[item.brand] = (analytics.byBrand[item.brand] || 0) + 1;
  //       }

  //       if (days <= 30) {
  //         analytics.criticalItems.push({
  //           item: item.item_name,
  //           code: item.item_code,
  //           days,
  //           site: item.Home_site_name
  //         });
  //       }
  //     });

  //     analytics.criticalItems.sort((a, b) => a.days - b.days);

  //     const topSites = Object.entries(analytics.bySite)
  //       .sort((a, b) => b[1] - a[1])
  //       .slice(0, 5);

  //     const topCertTypes = Object.entries(analytics.byCertificateType)
  //       .sort((a, b) => b[1] - a[1])
  //       .slice(0, 5);

  //     // ✅ CABEÇALHO MELHORADO COM DESIGN MODERNO
  //     // Faixa superior azul com gradiente simulado
  //     doc.setFillColor(37, 99, 235);
  //     doc.rect(0, 0, pageWidth, 12, 'F');

  //     // Título em branco
  //     doc.setFontSize(20);
  //     doc.setFont('helvetica', 'bold');
  //     doc.setTextColor(255, 255, 255);
  //     doc.text('RELATÓRIO DE CERTIFICADOS', margin + 2, 8);

  //     // Badge com total de registros
  //     const badgeX = pageWidth - margin - 50;
  //     doc.setFillColor(255, 255, 255, 0.2);
  //     doc.roundedRect(badgeX, 3, 45, 6, 2, 2, 'F');
  //     doc.setFontSize(9);
  //     doc.setFont('helvetica', 'bold');
  //     doc.text(`${dataToExport.length} REGISTROS`, badgeX + 22.5, 7, { align: 'center' });

  //     yPosition = 15;

  //     // Linha de informações secundárias
  //     doc.setFontSize(8);
  //     doc.setFont('helvetica', 'normal');
  //     doc.setTextColor(100, 100, 100);
  //     doc.text(`${new Date().toLocaleDateString('pt-BR', { 
  //       weekday: 'long', 
  //       year: 'numeric', 
  //       month: 'long', 
  //       day: 'numeric' 
  //     })}`, margin, yPosition);

  //     doc.text(`${new Date().toLocaleTimeString('pt-BR')}`, pageWidth - margin, yPosition, { align: 'right' });
  //     yPosition += 6;

  //     // Linha decorativa
  //     doc.setDrawColor(37, 99, 235);
  //     doc.setLineWidth(0.5);
  //     doc.line(margin, yPosition, pageWidth - margin, yPosition);
  //     yPosition += 6;

  //     // ✅ RESUMO EXECUTIVO - DESIGN APRIMORADO
  //     // Card com sombra simulada
  //     doc.setFillColor(250, 250, 250);
  //     doc.roundedRect(margin, yPosition, pageWidth - 2 * margin, 38, 2, 2, 'F');

  //     // Borda do card
  //     doc.setDrawColor(220, 220, 220);
  //     doc.setLineWidth(0.3);
  //     doc.roundedRect(margin, yPosition, pageWidth - 2 * margin, 38, 2, 2, 'S');

  //     yPosition += 6;

  //     // Título do resumo com ícone
  //     doc.setFontSize(11);
  //     doc.setFont('helvetica', 'bold');
  //     doc.setTextColor(37, 99, 235);
  //     doc.text('📊 RESUMO EXECUTIVO', margin + 3, yPosition);
  //     yPosition += 7;

  //     // ✅ MÉTRICAS COM BADGES COLORIDOS
  //     doc.setFontSize(8);
  //     let xPos = margin + 3;
  //     const badgeSpacing = 43;

  //     const metricsData = [
  //       { label: 'Total', value: analytics.total, bgColor: [59, 130, 246], textColor: [255, 255, 255] },
  //       { label: 'Expirados', value: analytics.expired, bgColor: [239, 68, 68], textColor: [255, 255, 255] },
  //       { label: '≤ 30 dias', value: analytics.expiringIn30Days, bgColor: [249, 115, 22], textColor: [255, 255, 255] },
  //       { label: '31-60 dias', value: analytics.expiringIn60Days, bgColor: [234, 179, 8], textColor: [255, 255, 255] },
  //       { label: '61-90 dias', value: analytics.expiringIn90Days, bgColor: [34, 197, 94], textColor: [255, 255, 255] },
  //       { label: '> 90 dias', value: analytics.safe, bgColor: [16, 185, 129], textColor: [255, 255, 255] }
  //     ];

  //     metricsData.forEach((metric) => {
  //       // Badge colorido
  //       doc.setFillColor(metric.bgColor[0], metric.bgColor[1], metric.bgColor[2]);
  //       doc.roundedRect(xPos, yPosition - 4, 40, 6, 1.5, 1.5, 'F');

  //       // Label
  //       doc.setFontSize(7);
  //       doc.setFont('helvetica', 'normal');
  //       doc.setTextColor(metric.textColor[0], metric.textColor[1], metric.textColor[2]);
  //       doc.text(metric.label, xPos + 2, yPosition - 0.5);

  //       // Valor
  //       doc.setFont('helvetica', 'bold');
  //       doc.setFontSize(8);
  //       doc.text(metric.value.toString(), xPos + 38, yPosition - 0.5, { align: 'right' });

  //       xPos += badgeSpacing;
  //     });

  //     yPosition += 7;

  //     // ✅ TOP SITES COM ÍCONE
  //     doc.setFont('helvetica', 'bold');
  //     doc.setFontSize(8);
  //     doc.setTextColor(51, 51, 51);
  //     doc.text('🏢 Top Sites:', margin + 3, yPosition);

  //     doc.setFont('helvetica', 'normal');
  //     doc.setTextColor(80, 80, 80);
  //     doc.setFontSize(7);

  //     xPos = margin + 3;
  //     yPosition += 5;
  //     topSites.slice(0, 3).forEach(([site, count], index) => {
  //       doc.text(`${index + 1}. ${site.substring(0, 24)} (${count})`, xPos, yPosition);
  //       xPos += 90;
  //     });

  //     yPosition += 6;

  //     // ✅ TOP TIPOS COM ÍCONE
  //     doc.setFontSize(8);
  //     doc.setFont('helvetica', 'bold');
  //     doc.setTextColor(51, 51, 51);
  //     doc.text('📋 Top Tipos:', margin + 3, yPosition);

  //     doc.setFont('helvetica', 'normal');
  //     doc.setTextColor(80, 80, 80);
  //     doc.setFontSize(7);

  //     xPos = margin + 3;
  //     yPosition += 5;
  //     topCertTypes.slice(0, 3).forEach(([type, count], index) => {
  //       doc.text(`${index + 1}. ${type.substring(0, 24)} (${count})`, xPos, yPosition);
  //       xPos += 90;
  //     });

  //     yPosition += 6;

  //     // ✅ STATUS COM ÍCONE
  //     doc.setFontSize(8);
  //     doc.setFont('helvetica', 'bold');
  //     doc.setTextColor(51, 51, 51);
  //     doc.text('✓ Status:', margin + 3, yPosition);

  //     doc.setFont('helvetica', 'normal');
  //     doc.setTextColor(80, 80, 80);
  //     doc.setFontSize(7);

  //     xPos = margin + 20;
  //     Object.entries(analytics.byStatus).forEach(([status, count]) => {
  //       doc.text(`${translateStatus(status)}: ${count}`, xPos, yPosition);
  //       xPos += 60;
  //     });

  //     yPosition += 10;

  //     // ✅ CABEÇALHOS DA TABELA
  //     const headers = [
  //       'Site',
  //       'Área',
  //       'Zona',
  //       'Certificado',
  //       'Código',
  //       'Item',
  //       'Marca',
  //       'Modelo',
  //       'Serial',
  //       'Expiração',
  //       'Dias',
  //       'Status',
  //       'Criticidade'
  //     ];

  //     const colWidths = [18, 40, 40, 22, 12, 30, 12, 12, 18, 18, 10, 15, 15];

  //     const drawTableHeader = () => {
  //       doc.setFillColor(37, 99, 235);
  //       doc.rect(margin, yPosition - 4, pageWidth - 2 * margin, 6, 'F');

  //       doc.setFontSize(7);
  //       doc.setFont('helvetica', 'bold');
  //       doc.setTextColor(255, 255, 255);

  //       let xPos = margin + 1;
  //       headers.forEach((header, index) => {
  //         doc.text(header, xPos, yPosition);
  //         xPos += colWidths[index];
  //       });

  //       yPosition += 6;

  //       doc.setDrawColor(37, 99, 235);
  //       doc.setLineWidth(0.5);
  //       doc.line(margin, yPosition, pageWidth - margin, yPosition);

  //       yPosition += 1;

  //       doc.setFont('helvetica', 'normal');
  //       doc.setFontSize(6);
  //     };

  //     drawTableHeader();

  //     // ✅ DESENHAR LINHAS DE DADOS
  //     dataToExport.forEach((item, index) => {
  //       const daysUntilExpiration = getDaysUntilExpiration(item.expiration_date);
  //       const criticalityBadge = getCriticalityBadge(daysUntilExpiration);

  //       const rowData = [
  //         { text: item.Home_site_name, maxWidth: colWidths[0] - 2 },
  //         { text: item.code_zone, maxWidth: colWidths[1] - 2 },
  //         { text: item.code_area, maxWidth: colWidths[2] - 2 },
  //         { text: item.certificate_description, maxWidth: colWidths[3] - 2 },
  //         { text: item.item_code, maxWidth: colWidths[4] - 2 },
  //         { text: item.item_name, maxWidth: colWidths[5] - 2 },
  //         { text: item.brand || '-', maxWidth: colWidths[6] - 2 },
  //         { text: item.model || '-', maxWidth: colWidths[7] - 2 },
  //         { text: item.serial, maxWidth: colWidths[8] - 2 },
  //         { text: formatDate(item.expiration_date), maxWidth: colWidths[9] - 2 },
  //         { text: `${daysUntilExpiration}`, maxWidth: colWidths[10] - 2 },
  //         { text: translateStatus(item.certificate_status_name), maxWidth: colWidths[11] - 2 },
  //         { text: criticalityBadge.label, maxWidth: colWidths[12] - 2 }
  //       ];

  //       let maxLines = 1;
  //       const splitTexts = rowData.map((data) => {
  //         const lines = doc.splitTextToSize(data.text, data.maxWidth);
  //         maxLines = Math.max(maxLines, lines.length);
  //         return lines;
  //       });

  //       const rowHeight = maxLines * 4 + 1;

  //       if (yPosition + rowHeight > pageHeight - 20) {
  //         doc.addPage();
  //         yPosition = margin;
  //         drawTableHeader();
  //       }

  //       if (criticalityBadge.label === 'EXPIRADO' || criticalityBadge.label === 'CRÍTICO') {
  //         doc.setFillColor(254, 226, 226);
  //       } else if (criticalityBadge.label === 'ATENÇÃO') {
  //         doc.setFillColor(254, 243, 199);
  //       } else if (criticalityBadge.label === 'ALERTA') {
  //         doc.setFillColor(254, 249, 195);
  //       } else {
  //         doc.setFillColor(220, 252, 231);
  //       }
  //       doc.rect(margin, yPosition, pageWidth - 2 * margin, rowHeight, 'F');

  //       let xPosition = margin + 1;

  //       splitTexts.forEach((lines, colIndex) => {
  //         let textYPosition = yPosition + 3;

  //         if (colIndex === 10) {
  //           if (daysUntilExpiration < 0) {
  //             doc.setTextColor(220, 38, 38);
  //           } else if (daysUntilExpiration <= 30) {
  //             doc.setTextColor(249, 115, 22);
  //           } else if (daysUntilExpiration <= 90) {
  //             doc.setTextColor(234, 179, 8);
  //           } else {
  //             doc.setTextColor(34, 197, 94);
  //           }
  //           doc.setFont('helvetica', 'bold');
  //         } else {
  //           doc.setTextColor(0, 0, 0);
  //           doc.setFont('helvetica', 'normal');
  //         }

  //         lines.forEach((line: string) => {
  //           doc.text(line, xPosition, textYPosition);
  //           textYPosition += 4;
  //         });

  //         xPosition += colWidths[colIndex];
  //       });

  //       yPosition += rowHeight;

  //       doc.setDrawColor(230, 230, 230);
  //       doc.setLineWidth(0.1);
  //       doc.line(margin, yPosition, pageWidth - margin, yPosition);

  //       yPosition += 0.5;
  //     });

  //     // ✅ PÁGINA FINAL - ANÁLISE DETALHADA
  //     doc.addPage();
  //     yPosition = margin;

  //     // Cabeçalho da página de análise
  //     doc.setFillColor(37, 99, 235);
  //     doc.rect(0, 0, pageWidth, 12, 'F');

  //     doc.setFontSize(20);
  //     doc.setFont('helvetica', 'bold');
  //     doc.setTextColor(255, 255, 255);
  //     doc.text('ANÁLISE DETALHADA', margin + 2, 8);

  //     yPosition = 18;

  //     // ✅ SEÇÃO 1: DISTRIBUIÇÃO POR PERÍODO
  //     doc.setFontSize(12);
  //     doc.setFont('helvetica', 'bold');
  //     doc.setTextColor(37, 99, 235);
  //     doc.text('📊 Distribuição por Período de Expiração', margin, yPosition);
  //     yPosition += 8;

  //     const distributionData = [
  //       { label: 'Certificados Expirados', value: analytics.expired, color: [239, 68, 68], icon: '❌' },
  //       { label: 'Expirando em 30 dias', value: analytics.expiringIn30Days, color: [249, 115, 22], icon: '⚠️' },
  //       { label: 'Expirando 31-60 dias', value: analytics.expiringIn60Days, color: [234, 179, 8], icon: '⏰' },
  //       { label: 'Expirando 61-90 dias', value: analytics.expiringIn90Days, color: [34, 197, 94], icon: '✓' },
  //       { label: 'Válidos (> 90 dias)', value: analytics.safe, color: [16, 185, 129], icon: '✓✓' }
  //     ];

  //     distributionData.forEach((item) => {
  //       doc.setFillColor(item.color[0], item.color[1], item.color[2], 0.1);
  //       doc.roundedRect(margin, yPosition - 2, pageWidth - 2 * margin, 7, 1.5, 1.5, 'F');

  //       doc.setDrawColor(item.color[0], item.color[1], item.color[2]);
  //       doc.setLineWidth(0.5);
  //       doc.roundedRect(margin, yPosition - 2, pageWidth - 2 * margin, 7, 1.5, 1.5, 'S');

  //       doc.setFontSize(9);
  //       doc.setFont('helvetica', 'normal');
  //       doc.setTextColor(51, 51, 51);
  //       doc.text(`${item.icon} ${item.label}`, margin + 3, yPosition + 2);

  //       doc.setFont('helvetica', 'bold');
  //       doc.setTextColor(item.color[0], item.color[1], item.color[2]);
  //       doc.text(item.value.toString(), pageWidth - margin - 20, yPosition + 2);

  //       yPosition += 8;
  //     });

  //     yPosition += 5;

  //     // ✅ SEÇÃO 2: TOP 5 SITES
  //     doc.setFontSize(12);
  //     doc.setFont('helvetica', 'bold');
  //     doc.setTextColor(37, 99, 235);
  //     doc.text('🏢 Top 5 Sites com Mais Certificados', margin, yPosition);
  //     yPosition += 8;

  //     doc.setFontSize(9);
  //     doc.setFont('helvetica', 'normal');
  //     topSites.forEach(([site, count], index) => {
  //       const percentage = ((count / analytics.total) * 100).toFixed(1);

  //       // Barra de progresso
  //       const barWidth = (count / analytics.total) * (pageWidth - 2 * margin - 100);
  //       doc.setFillColor(59, 130, 246, 0.3);
  //       doc.roundedRect(margin + 5, yPosition - 3, barWidth, 5, 1, 1, 'F');

  //       doc.setTextColor(80, 80, 80);
  //       doc.text(`${index + 1}. ${site.substring(0, 60)}`, margin + 5, yPosition);

  //       doc.setFont('helvetica', 'bold');
  //       doc.setTextColor(37, 99, 235);
  //       doc.text(`${count} (${percentage}%)`, pageWidth - margin - 35, yPosition);

  //       doc.setFont('helvetica', 'normal');
  //       yPosition += 7;
  //     });

  //     yPosition += 5;

  //     // ✅ SEÇÃO 3: DISTRIBUIÇÃO POR TIPO
  //     doc.setFontSize(12);
  //     doc.setFont('helvetica', 'bold');
  //     doc.setTextColor(37, 99, 235);
  //     doc.text('📋 Distribuição por Tipo de Certificado', margin, yPosition);
  //     yPosition += 8;

  //     doc.setFontSize(9);
  //     doc.setFont('helvetica', 'normal');
  //     topCertTypes.forEach(([type, count], index) => {
  //       const percentage = ((count / analytics.total) * 100).toFixed(1);

  //       const barWidth = (count / analytics.total) * (pageWidth - 2 * margin - 100);
  //       doc.setFillColor(139, 92, 246, 0.3);
  //       doc.roundedRect(margin + 5, yPosition - 3, barWidth, 5, 1, 1, 'F');

  //       doc.setTextColor(80, 80, 80);
  //       doc.text(`${index + 1}. ${type.substring(0, 60)}`, margin + 5, yPosition);

  //       doc.setFont('helvetica', 'bold');
  //       doc.setTextColor(139, 92, 246);
  //       doc.text(`${count} (${percentage}%)`, pageWidth - margin - 35, yPosition);

  //       doc.setFont('helvetica', 'normal');
  //       yPosition += 7;
  //     });

  //     yPosition += 5;

  //     // ✅ SEÇÃO 4: TOP 5 MARCAS
  //     const topBrands = Object.entries(analytics.byBrand)
  //       .sort((a, b) => b[1] - a[1])
  //       .slice(0, 5);

  //     doc.setFontSize(12);
  //     doc.setFont('helvetica', 'bold');
  //     doc.setTextColor(37, 99, 235);
  //     doc.text('🏭 Top 5 Marcas', margin, yPosition);
  //     yPosition += 8;

  //     doc.setFontSize(9);
  //     doc.setFont('helvetica', 'normal');
  //     topBrands.forEach(([brand, count], index) => {
  //       const percentage = ((count / analytics.total) * 100).toFixed(1);

  //       const barWidth = (count / analytics.total) * (pageWidth - 2 * margin - 100);
  //       doc.setFillColor(16, 185, 129, 0.3);
  //       doc.roundedRect(margin + 5, yPosition - 3, barWidth, 5, 1, 1, 'F');

  //       doc.setTextColor(80, 80, 80);
  //       doc.text(`${index + 1}. ${brand}`, margin + 5, yPosition);

  //       doc.setFont('helvetica', 'bold');
  //       doc.setTextColor(16, 185, 129);
  //       doc.text(`${count} (${percentage}%)`, pageWidth - margin - 35, yPosition);

  //       doc.setFont('helvetica', 'normal');
  //       yPosition += 7;
  //     });

  //     yPosition += 8;

  //     // ✅ SEÇÃO 5: ITENS CRÍTICOS
  //     if (analytics.criticalItems.length > 0) {
  //       doc.setFontSize(12);
  //       doc.setFont('helvetica', 'bold');
  //       doc.setTextColor(239, 68, 68);
  //       doc.text('⚠️ ITENS CRÍTICOS - AÇÃO URGENTE NECESSÁRIA', margin, yPosition);
  //       yPosition += 8;

  //       doc.setFontSize(8);
  //       doc.setFont('helvetica', 'normal');

  //       // Cabeçalho da tabela
  //       doc.setFillColor(239, 68, 68);
  //       doc.rect(margin, yPosition - 2, pageWidth - 2 * margin, 6, 'F');

  //       doc.setFont('helvetica', 'bold');
  //       doc.setTextColor(255, 255, 255);
  //       doc.text('Item', margin + 3, yPosition + 2);
  //       doc.text('Código', margin + 90, yPosition + 2);
  //       doc.text('Status', margin + 130, yPosition + 2);
  //       doc.text('Site', margin + 160, yPosition + 2);
  //       yPosition += 7;

  //       doc.setFont('helvetica', 'normal');
  //       const criticalToShow = analytics.criticalItems.slice(0, 15);
  //       criticalToShow.forEach((critical, index) => {
  //         if (yPosition > pageHeight - 25) return;

  //         const bgColor = index % 2 === 0 ? [255, 255, 255] : [254, 242, 242];
  //         doc.setFillColor(bgColor[0], bgColor[1], bgColor[2]);
  //         doc.rect(margin, yPosition - 2, pageWidth - 2 * margin, 5, 'F');

  //         doc.setTextColor(51, 51, 51);
  //         doc.text(`${index + 1}. ${critical.item.substring(0, 35)}`, margin + 3, yPosition + 1);
  //         doc.text(critical.code, margin + 90, yPosition + 1);

  //         const statusColor = critical.days < 0 ? [239, 68, 68] : [249, 115, 22];
  //         const statusText = critical.days < 0 ? 'EXPIRADO' : `${critical.days} dias`;
  //         doc.setTextColor(statusColor[0], statusColor[1], statusColor[2]);
  //         doc.setFont('helvetica', 'bold');
  //         doc.text(statusText, margin + 130, yPosition + 1);

  //         doc.setTextColor(51, 51, 51);
  //         doc.setFont('helvetica', 'normal');
  //         doc.text(critical.site.substring(0, 25), margin + 160, yPosition + 1);

  //         yPosition += 6;
  //       });

  //       if (analytics.criticalItems.length > 15) {
  //         doc.setFontSize(8);
  //         doc.setTextColor(100, 100, 100);
  //         doc.text(`... e mais ${analytics.criticalItems.length - 15} itens críticos`, margin + 3, yPosition + 2);
  //       }
  //     }

  //     // ✅ RODAPÉ MELHORADO EM TODAS AS PÁGINAS
  //     const totalPages = doc.getNumberOfPages();
  //     for (let i = 1; i <= totalPages; i++) {
  //       doc.setPage(i);

  //       // Linha decorativa superior do rodapé
  //       doc.setDrawColor(37, 99, 235);
  //       doc.setLineWidth(0.5);
  //       doc.line(margin, pageHeight - 12, pageWidth - margin, pageHeight - 12);

  //       // Fundo do rodapé
  //       doc.setFillColor(248, 250, 252);
  //       doc.rect(0, pageHeight - 11, pageWidth, 11, 'F');

  //       // Informações do rodapé
  //       doc.setFontSize(7);
  //       doc.setFont('helvetica', 'normal');
  //       doc.setTextColor(100, 100, 100);

  //       // Esquerda - Data e hora
  //       doc.text(
  //         `📅 Gerado em ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}`,
  //         margin,
  //         pageHeight - 5
  //       );

  //       // Centro - Nome do relatório
  //       doc.setFont('helvetica', 'bold');
  //       doc.setTextColor(37, 99, 235);
  //       doc.text(
  //         'SmartX Hub - Relatório de Certificados',
  //         pageWidth / 2,
  //         pageHeight - 5,
  //         { align: 'center' }
  //       );

  //       // Direita - Paginação com badge
  //       doc.setFont('helvetica', 'normal');
  //       doc.setTextColor(100, 100, 100);
  //       const pageText = `Página ${i} de ${totalPages}`;
  //       const pageTextWidth = doc.getTextWidth(pageText);

  //       doc.setFillColor(37, 99, 235, 0.1);
  //       doc.roundedRect(pageWidth - margin - pageTextWidth - 4, pageHeight - 7.5, pageTextWidth + 4, 4, 1, 1, 'F');

  //       doc.setTextColor(37, 99, 235);
  //       doc.setFont('helvetica', 'bold');
  //       doc.text(pageText, pageWidth - margin, pageHeight - 5, { align: 'right' });
  //     }

  //     doc.save(`certificados-relatorio-completo-${new Date().toISOString().split('T')[0]}.pdf`);
  //   } catch (error) {
  //     console.error('Erro ao gerar PDF:', error);
  //     alert('Erro ao exportar para PDF.');
  //   }
  // };


  const exportProgramacaoPDF = async (dataToExport: CertificateReport[]) => {
    try {
      const { jsPDF } = await import('jspdf');
      const doc = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
      }) as import('jspdf').jsPDF;

      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 10;
      let yPosition = margin;

      // ✅ CALCULAR ESTATÍSTICAS ANALÍTICAS
      const analytics = {
        total: dataToExport.length,
        expired: 0,
        expiringIn30Days: 0,
        expiringIn60Days: 0,
        expiringIn90Days: 0,
        safe: 0,
        bySite: {} as Record<string, number>,
        byCertificateType: {} as Record<string, number>,
        byStatus: {} as Record<string, number>,
        byBrand: {} as Record<string, number>,
        criticalItems: [] as any[]
      };

      dataToExport.forEach(item => {
        const days = getDaysUntilExpiration(item.expiration_date);

        if (days < 0) analytics.expired++;
        else if (days <= 30) analytics.expiringIn30Days++;
        else if (days <= 60) analytics.expiringIn60Days++;
        else if (days <= 90) analytics.expiringIn90Days++;
        else analytics.safe++;

        analytics.bySite[item.Home_site_name] = (analytics.bySite[item.Home_site_name] || 0) + 1;
        analytics.byCertificateType[item.certificate_description] =
          (analytics.byCertificateType[item.certificate_description] || 0) + 1;
        analytics.byStatus[item.certificate_status_name] =
          (analytics.byStatus[item.certificate_status_name] || 0) + 1;

        if (item.brand) {
          analytics.byBrand[item.brand] = (analytics.byBrand[item.brand] || 0) + 1;
        }

        if (days <= 30) {
          analytics.criticalItems.push({
            item: item.item_name,
            code: item.item_code,
            days,
            site: item.Home_site_name
          });
        }
      });

      analytics.criticalItems.sort((a, b) => a.days - b.days);

      const topSites = Object.entries(analytics.bySite)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);

      const topCertTypes = Object.entries(analytics.byCertificateType)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);

      // ✅ CABEÇALHO MELHORADO COM DESIGN MODERNO
      // Faixa superior azul
      doc.setFillColor(37, 99, 235);
      doc.rect(0, 0, pageWidth, 12, 'F');

      // Título em branco
      doc.setFontSize(20);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(255, 255, 255);
      doc.text('RELATORIO DE CERTIFICADOS', margin + 2, 8);

      // Badge com total de registros
      const badgeX = pageWidth - margin - 50;
      doc.setFillColor(255, 255, 255, 0.2);
      doc.roundedRect(badgeX, 3, 45, 6, 2, 2, 'F');
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.text(`${dataToExport.length} REGISTROS`, badgeX + 22.5, 7, { align: 'center' });

      yPosition = 15;

      // Linha de informações secundárias
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 100, 100);
      doc.text(`Data: ${new Date().toLocaleDateString('pt-BR', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })}`, margin, yPosition);

      doc.text(`Horario: ${new Date().toLocaleTimeString('pt-BR')}`, pageWidth - margin, yPosition, { align: 'right' });
      yPosition += 6;

      // Linha decorativa
      doc.setDrawColor(37, 99, 235);
      doc.setLineWidth(0.5);
      doc.line(margin, yPosition, pageWidth - margin, yPosition);
      yPosition += 6;

      // ✅ RESUMO EXECUTIVO - DESIGN APRIMORADO
      // Card com sombra simulada
      doc.setFillColor(250, 250, 250);
      doc.roundedRect(margin, yPosition, pageWidth - 2 * margin, 38, 2, 2, 'F');

      // Borda do card
      doc.setDrawColor(220, 220, 220);
      doc.setLineWidth(0.3);
      doc.roundedRect(margin, yPosition, pageWidth - 2 * margin, 38, 2, 2, 'S');

      yPosition += 6;

      // Título do resumo
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(37, 99, 235);
      doc.text('RESUMO EXECUTIVO', margin + 3, yPosition);
      yPosition += 7;

      // ✅ MÉTRICAS COM BADGES COLORIDOS
      doc.setFontSize(8);
      let xPos = margin + 3;
      const badgeSpacing = 43;

      const metricsData = [
        { label: 'Total', value: analytics.total, bgColor: [59, 130, 246], textColor: [255, 255, 255] },
        { label: 'Expirados', value: analytics.expired, bgColor: [239, 68, 68], textColor: [255, 255, 255] },
        { label: '< 30 dias', value: analytics.expiringIn30Days, bgColor: [249, 115, 22], textColor: [255, 255, 255] },
        { label: '31-60 dias', value: analytics.expiringIn60Days, bgColor: [234, 179, 8], textColor: [255, 255, 255] },
        { label: '61-90 dias', value: analytics.expiringIn90Days, bgColor: [34, 197, 94], textColor: [255, 255, 255] },
        { label: '> 90 dias', value: analytics.safe, bgColor: [16, 185, 129], textColor: [255, 255, 255] }
      ];

      metricsData.forEach((metric) => {
        // Badge colorido
        doc.setFillColor(metric.bgColor[0], metric.bgColor[1], metric.bgColor[2]);
        doc.roundedRect(xPos, yPosition - 4, 40, 6, 1.5, 1.5, 'F');

        // Label
        doc.setFontSize(7);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(metric.textColor[0], metric.textColor[1], metric.textColor[2]);
        doc.text(metric.label, xPos + 2, yPosition - 0.5);

        // Valor
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8);
        doc.text(metric.value.toString(), xPos + 38, yPosition - 0.5, { align: 'right' });

        xPos += badgeSpacing;
      });

      yPosition += 7;

      // ✅ TOP SITES
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(51, 51, 51);
      doc.text('Top Sites:', margin + 3, yPosition);

      doc.setFont('helvetica', 'normal');
      doc.setTextColor(80, 80, 80);
      doc.setFontSize(7);

      xPos = margin + 3;
      yPosition += 5;
      topSites.slice(0, 3).forEach(([site, count], index) => {
        doc.text(`${index + 1}. ${site.substring(0, 24)} (${count})`, xPos, yPosition);
        xPos += 90;
      });

      yPosition += 6;

      // ✅ TOP TIPOS
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(51, 51, 51);
      doc.text('Top Tipos:', margin + 3, yPosition);

      doc.setFont('helvetica', 'normal');
      doc.setTextColor(80, 80, 80);
      doc.setFontSize(7);

      xPos = margin + 3;
      yPosition += 5;
      topCertTypes.slice(0, 3).forEach(([type, count], index) => {
        doc.text(`${index + 1}. ${type.substring(0, 24)} (${count})`, xPos, yPosition);
        xPos += 90;
      });

      yPosition += 6;

      // ✅ STATUS
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(51, 51, 51);
      doc.text('Status:', margin + 3, yPosition);

      doc.setFont('helvetica', 'normal');
      doc.setTextColor(80, 80, 80);
      doc.setFontSize(7);

      xPos = margin + 20;
      Object.entries(analytics.byStatus).forEach(([status, count]) => {
        doc.text(`${translateStatus(status)}: ${count}`, xPos, yPosition);
        xPos += 60;
      });

      yPosition += 10;

      // ✅ CABEÇALHOS DA TABELA
      const headers = [
        'Site',
        'Area',
        'Zona',
        'Certificado',
        'Codigo',
        'Item',
        'Marca',
        'Modelo',
        'Serial',
        'Expiracao',
        'Dias',
        'Status',
        'Criticidade'
      ];

      const colWidths = [18, 40, 40, 22, 12, 30, 12, 12, 18, 18, 10, 15, 15];

      const drawTableHeader = () => {
        doc.setFillColor(37, 99, 235);
        doc.rect(margin, yPosition - 4, pageWidth - 2 * margin, 6, 'F');

        doc.setFontSize(7);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(255, 255, 255);

        let xPos = margin + 1;
        headers.forEach((header, index) => {
          doc.text(header, xPos, yPosition);
          xPos += colWidths[index];
        });

        yPosition += 6;

        doc.setDrawColor(37, 99, 235);
        doc.setLineWidth(0.5);
        doc.line(margin, yPosition, pageWidth - margin, yPosition);

        yPosition += 1;

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(6);
      };

      drawTableHeader();

      // ✅ DESENHAR LINHAS DE DADOS
      //@ts-ignore
      dataToExport.forEach((item, index) => {
        const daysUntilExpiration = getDaysUntilExpiration(item.expiration_date);
        const criticalityBadge = getCriticalityBadge(daysUntilExpiration);

        const rowData = [
          { text: item.Home_site_name, maxWidth: colWidths[0] - 2 },
          { text: item.code_zone, maxWidth: colWidths[1] - 2 },
          { text: item.code_area, maxWidth: colWidths[2] - 2 },
          { text: item.certificate_description, maxWidth: colWidths[3] - 2 },
          { text: item.item_code, maxWidth: colWidths[4] - 2 },
          { text: item.item_name, maxWidth: colWidths[5] - 2 },
          { text: item.brand || '-', maxWidth: colWidths[6] - 2 },
          { text: item.model || '-', maxWidth: colWidths[7] - 2 },
          { text: item.serial, maxWidth: colWidths[8] - 2 },
          { text: formatDate(item.expiration_date), maxWidth: colWidths[9] - 2 },
          { text: `${daysUntilExpiration}`, maxWidth: colWidths[10] - 2 },
          { text: translateStatus(item.certificate_status_name), maxWidth: colWidths[11] - 2 },
          { text: criticalityBadge.label, maxWidth: colWidths[12] - 2 }
        ];

        let maxLines = 1;
        const splitTexts = rowData.map((data) => {
          const lines = doc.splitTextToSize(data.text, data.maxWidth);
          maxLines = Math.max(maxLines, lines.length);
          return lines;
        });

        const rowHeight = maxLines * 4 + 1;

        if (yPosition + rowHeight > pageHeight - 20) {
          doc.addPage();
          yPosition = margin;
          drawTableHeader();
        }

        if (criticalityBadge.label === 'EXPIRADO' || criticalityBadge.label === 'CRÍTICO') {
          doc.setFillColor(254, 226, 226);
        } else if (criticalityBadge.label === 'ATENÇÃO') {
          doc.setFillColor(254, 243, 199);
        } else if (criticalityBadge.label === 'ALERTA') {
          doc.setFillColor(254, 249, 195);
        } else {
          doc.setFillColor(220, 252, 231);
        }
        doc.rect(margin, yPosition, pageWidth - 2 * margin, rowHeight, 'F');

        let xPosition = margin + 1;

        splitTexts.forEach((lines, colIndex) => {
          let textYPosition = yPosition + 3;

          if (colIndex === 10) {
            if (daysUntilExpiration < 0) {
              doc.setTextColor(220, 38, 38);
            } else if (daysUntilExpiration <= 30) {
              doc.setTextColor(249, 115, 22);
            } else if (daysUntilExpiration <= 90) {
              doc.setTextColor(234, 179, 8);
            } else {
              doc.setTextColor(34, 197, 94);
            }
            doc.setFont('helvetica', 'bold');
          } else {
            doc.setTextColor(0, 0, 0);
            doc.setFont('helvetica', 'normal');
          }

          lines.forEach((line: string) => {
            doc.text(line, xPosition, textYPosition);
            textYPosition += 4;
          });

          xPosition += colWidths[colIndex];
        });

        yPosition += rowHeight;

        doc.setDrawColor(230, 230, 230);
        doc.setLineWidth(0.1);
        doc.line(margin, yPosition, pageWidth - margin, yPosition);

        yPosition += 0.5;
      });

      // ✅ PÁGINA FINAL - ANÁLISE DETALHADA
      doc.addPage();
      yPosition = margin;

      // Cabeçalho da página de análise
      doc.setFillColor(37, 99, 235);
      doc.rect(0, 0, pageWidth, 12, 'F');

      doc.setFontSize(20);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(255, 255, 255);
      doc.text('ANALISE DETALHADA', margin + 2, 8);

      yPosition = 18;

      // ✅ SEÇÃO 1: DISTRIBUIÇÃO POR PERÍODO
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(37, 99, 235);
      doc.text('>> Distribuicao por Periodo de Expiracao', margin, yPosition);
      yPosition += 8;

      const distributionData = [
        { label: 'Certificados Expirados', value: analytics.expired, color: [239, 68, 68], icon: 'X' },
        { label: 'Expirando em 30 dias', value: analytics.expiringIn30Days, color: [249, 115, 22], icon: '!' },
        { label: 'Expirando 31-60 dias', value: analytics.expiringIn60Days, color: [234, 179, 8], icon: '~' },
        { label: 'Expirando 61-90 dias', value: analytics.expiringIn90Days, color: [34, 197, 94], icon: '+' },
        { label: 'Validos (> 90 dias)', value: analytics.safe, color: [16, 185, 129], icon: 'OK' }
      ];

      distributionData.forEach((item) => {
        doc.setFillColor(item.color[0], item.color[1], item.color[2], 0.1);
        doc.roundedRect(margin, yPosition - 2, pageWidth - 2 * margin, 7, 1.5, 1.5, 'F');

        doc.setDrawColor(item.color[0], item.color[1], item.color[2]);
        doc.setLineWidth(0.5);
        doc.roundedRect(margin, yPosition - 2, pageWidth - 2 * margin, 7, 1.5, 1.5, 'S');

        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(51, 51, 51);
        doc.text(`[${item.icon}] ${item.label}`, margin + 3, yPosition + 2);

        doc.setFont('helvetica', 'bold');
        doc.setTextColor(item.color[0], item.color[1], item.color[2]);
        doc.text(item.value.toString(), pageWidth - margin - 20, yPosition + 2);

        yPosition += 8;
      });

      yPosition += 5;

      // ✅ SEÇÃO 2: TOP 5 SITES
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(37, 99, 235);
      doc.text('>> Top 5 Sites com Mais Certificados', margin, yPosition);
      yPosition += 8;

      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      topSites.forEach(([site, count], index) => {
        const percentage = ((count / analytics.total) * 100).toFixed(1);

        // Barra de progresso
        const barWidth = (count / analytics.total) * (pageWidth - 2 * margin - 100);
        doc.setFillColor(59, 130, 246, 0.3);
        doc.roundedRect(margin + 5, yPosition - 3, barWidth, 5, 1, 1, 'F');

        doc.setTextColor(80, 80, 80);
        doc.text(`${index + 1}. ${site.substring(0, 60)}`, margin + 5, yPosition);

        doc.setFont('helvetica', 'bold');
        doc.setTextColor(37, 99, 235);
        doc.text(`${count} (${percentage}%)`, pageWidth - margin - 35, yPosition);

        doc.setFont('helvetica', 'normal');
        yPosition += 7;
      });

      yPosition += 5;

      // ✅ SEÇÃO 3: DISTRIBUIÇÃO POR TIPO
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(37, 99, 235);
      doc.text('>> Distribuicao por Tipo de Certificado', margin, yPosition);
      yPosition += 8;

      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      topCertTypes.forEach(([type, count], index) => {
        const percentage = ((count / analytics.total) * 100).toFixed(1);

        const barWidth = (count / analytics.total) * (pageWidth - 2 * margin - 100);
        doc.setFillColor(139, 92, 246, 0.3);
        doc.roundedRect(margin + 5, yPosition - 3, barWidth, 5, 1, 1, 'F');

        doc.setTextColor(80, 80, 80);
        doc.text(`${index + 1}. ${type.substring(0, 60)}`, margin + 5, yPosition);

        doc.setFont('helvetica', 'bold');
        doc.setTextColor(139, 92, 246);
        doc.text(`${count} (${percentage}%)`, pageWidth - margin - 35, yPosition);

        doc.setFont('helvetica', 'normal');
        yPosition += 7;
      });

      yPosition += 5;

      // ✅ SEÇÃO 4: TOP 5 MARCAS
      const topBrands = Object.entries(analytics.byBrand)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);

      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(37, 99, 235);
      doc.text('>> Top 5 Marcas', margin, yPosition);
      yPosition += 8;

      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      topBrands.forEach(([brand, count], index) => {
        const percentage = ((count / analytics.total) * 100).toFixed(1);

        const barWidth = (count / analytics.total) * (pageWidth - 2 * margin - 100);
        doc.setFillColor(16, 185, 129, 0.3);
        doc.roundedRect(margin + 5, yPosition - 3, barWidth, 5, 1, 1, 'F');

        doc.setTextColor(80, 80, 80);
        doc.text(`${index + 1}. ${brand}`, margin + 5, yPosition);

        doc.setFont('helvetica', 'bold');
        doc.setTextColor(16, 185, 129);
        doc.text(`${count} (${percentage}%)`, pageWidth - margin - 35, yPosition);

        doc.setFont('helvetica', 'normal');
        yPosition += 7;
      });

      yPosition += 8;

      // ✅ SEÇÃO 5: ITENS CRÍTICOS
      if (analytics.criticalItems.length > 0) {
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(239, 68, 68);
        doc.text('>> ITENS CRITICOS - ACAO URGENTE NECESSARIA', margin, yPosition);
        yPosition += 8;

        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');

        // Cabeçalho da tabela
        doc.setFillColor(239, 68, 68);
        doc.rect(margin, yPosition - 2, pageWidth - 2 * margin, 6, 'F');

        doc.setFont('helvetica', 'bold');
        doc.setTextColor(255, 255, 255);
        doc.text('Item', margin + 3, yPosition + 2);
        doc.text('Codigo', margin + 90, yPosition + 2);
        doc.text('Status', margin + 130, yPosition + 2);
        doc.text('Site', margin + 160, yPosition + 2);
        yPosition += 7;

        doc.setFont('helvetica', 'normal');
        const criticalToShow = analytics.criticalItems.slice(0, 15);
        criticalToShow.forEach((critical, index) => {
          if (yPosition > pageHeight - 25) return;

          const bgColor = index % 2 === 0 ? [255, 255, 255] : [254, 242, 242];
          doc.setFillColor(bgColor[0], bgColor[1], bgColor[2]);
          doc.rect(margin, yPosition - 2, pageWidth - 2 * margin, 5, 'F');

          doc.setTextColor(51, 51, 51);
          doc.text(`${index + 1}. ${critical.item.substring(0, 35)}`, margin + 3, yPosition + 1);
          doc.text(critical.code, margin + 90, yPosition + 1);

          const statusColor = critical.days < 0 ? [239, 68, 68] : [249, 115, 22];
          const statusText = critical.days < 0 ? 'EXPIRADO' : `${critical.days} dias`;
          doc.setTextColor(statusColor[0], statusColor[1], statusColor[2]);
          doc.setFont('helvetica', 'bold');
          doc.text(statusText, margin + 130, yPosition + 1);

          doc.setTextColor(51, 51, 51);
          doc.setFont('helvetica', 'normal');
          doc.text(critical.site.substring(0, 25), margin + 160, yPosition + 1);

          yPosition += 6;
        });

        if (analytics.criticalItems.length > 15) {
          doc.setFontSize(8);
          doc.setTextColor(100, 100, 100);
          doc.text(`... e mais ${analytics.criticalItems.length - 15} itens criticos`, margin + 3, yPosition + 2);
        }
      }

      // ✅ RODAPÉ MELHORADO EM TODAS AS PÁGINAS
      const totalPages = doc.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);

        // Linha decorativa superior do rodapé
        doc.setDrawColor(37, 99, 235);
        doc.setLineWidth(0.5);
        doc.line(margin, pageHeight - 12, pageWidth - margin, pageHeight - 12);

        // Fundo do rodapé
        doc.setFillColor(248, 250, 252);
        doc.rect(0, pageHeight - 11, pageWidth, 11, 'F');

        // Informações do rodapé
        doc.setFontSize(7);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(100, 100, 100);

        // Esquerda - Data e hora
        doc.text(
          `Gerado em ${new Date().toLocaleDateString('pt-BR')} as ${new Date().toLocaleTimeString('pt-BR')}`,
          margin,
          pageHeight - 5
        );

        // Centro - Nome do relatório
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(37, 99, 235);
        doc.text(
          'SmartX Hub - Relatorio de Certificados',
          pageWidth / 2,
          pageHeight - 5,
          { align: 'center' }
        );

        // Direita - Paginação com badge

        doc.setFontSize(7);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(255, 255, 255);
        const pageText = `Pagina ${i} de ${totalPages}`;
        // const pageTextWidth = doc.getTextWidth(pageText);

        // doc.setFillColor(37, 99, 235, 1);
        // doc.roundedRect(pageWidth - margin - pageTextWidth - 4, pageHeight - 7.5, pageTextWidth + 4, 4, 1, 1, 'F');

        doc.setTextColor(37, 99, 235);
        doc.setFont('helvetica', 'bold');
        doc.text(pageText, pageWidth - margin, pageHeight - 5, { align: 'right' });
      }

      doc.save(`certificados-relatorio-completo-${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      alert('Erro ao exportar para PDF.');
    }
  };



  // ✅ ATUALIZAR A FUNÇÃO handleExportProgramacao
  const handleExportProgramacao = async (format: 'excel' | 'pdf', exportAll: boolean) => {
    setShowExportProgramacaoMenu(false);

    let dataToExport = filteredData;

    // ✅ BUSCAR TODOS OS DADOS SE exportAll FOR TRUE
    if (exportAll) {
      try {
        const params = new URLSearchParams({
          page: '1',
          limit: '999999',
          sortBy,
          sortOrder
        });

        // ✅ APLICAR OS MESMOS FILTROS DA TELA
        if (filters.status !== 'ALL') {
          params.append('certificateStatus', filters.status);
        }
        if (filters.site !== 'ALL') {
          params.append('homeSiteName', filters.site);
        }
        if (filters.certificateType !== 'ALL') {
          params.append('certificateDescription', filters.certificateType);
        }
        if (filters.zone !== 'ALL') {
          params.append('homeZoneCode', filters.zone);
        }
        if (filters.area !== 'ALL') {
          params.append('homeArea', filters.area);
        }
        if (dateFilter.startDate) {
          params.append('startDate', dateFilter.startDate);
        }
        if (dateFilter.endDate) {
          params.append('endDate', dateFilter.endDate);
        }

        const response = await fetch(
          `https://apinode.smartxhub.cloud/api/dashboard/${companyId}/certificates/reports?${params}`
        );

        if (!response.ok) {
          throw new Error('Failed to fetch all data');
        }

        const result: ApiResponse = await response.json();
        dataToExport = result.data;

        console.log('✅ Dados carregados para exportação:', {
          total: dataToExport.length,
          exportAll,
          filtrosAplicados: filters
        });
      } catch (error) {
        console.error('❌ Error fetching all data:', error);
        alert('Erro ao buscar todos os dados. Exportando dados visíveis.');
        dataToExport = filteredData;
      }
    }

    // ✅ CHAMAR A FUNÇÃO DE EXPORTAÇÃO CORRETA
    if (format === 'excel') {
      await exportProgramacaoExcel(dataToExport);
    } else {
      await exportProgramacaoPDF(dataToExport);
    }
  };

  const [availableFilters, setAvailableFilters] = useState<CertificateFilters>({
    statuses: [],
    sites: [],
    descriptions: [],
    zones: [],
    areas: [],
    categories: [],
    brands: []
  });
  const [loadingFilters, setLoadingFilters] = useState(true);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };



  const fetchFilters = async () => {
    setLoadingFilters(true);
    try {
      let url = `https://apinode.smartxhub.cloud/api/dashboard/${companyId}/certificates/filters`;

      if (filters.site && filters.site !== 'ALL') {
        url += `?site=${filters.site}`;

        if (filters.area && filters.area !== 'ALL') {
          url += `&area=${filters.area}`;
        }
      }

      console.log('🔍 Buscando filtros de:', url);

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error('Failed to fetch filters');
      }

      const result = await response.json();
      console.log('✅ Resposta da API:', result);

      // ✅ TRADUZIR OS STATUS AO CARREGAR
      // const translatedStatuses = (result.data?.statuses || []).map((status: string) => ({
      //   code: status,
      //   label: translateStatus(status)
      // }));

      // ✅ GARANTIR que sempre tenha arrays vazios
      setAvailableFilters({
        statuses: result.data?.statuses || [],
        sites: result.data?.sites || [],
        descriptions: result.data?.descriptions || [],
        zones: result.data?.zones || [],
        areas: result.data?.areas || [],
        categories: [],
        brands: []
      });
    } catch (error) {
      console.error('Error fetching filters:', error);
      setAvailableFilters({
        statuses: [],
        sites: [],
        descriptions: [],
        zones: [],
        areas: [],
        categories: [],
        brands: []
      });
    } finally {
      setLoadingFilters(false);
    }
  };


  const fetchTypeFilters = async () => {
    setLoadingFilters(true);
    try {
      // Nova rota para status, tipos, categorias e marcas
      const url = `https://apinode.smartxhub.cloud/api/dashboard/${companyId}/certificates/filters/types`;

      console.log('🔍 Buscando filtros de tipos:', url);

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error('Failed to fetch type filters');
      }

      const result = await response.json();
      console.log('✅ Filtros de tipos recebidos:', result);

      // ✅ ATUALIZAR APENAS OS CAMPOS DA NOVA ROTA
      setAvailableFilters(prev => ({
        ...prev, // Mantém todos os filtros existentes (sites, áreas, zonas)
        statuses: result.data?.statuses || [],
        descriptions: result.data?.descriptions || [],
        categories: result.data?.categories || [],
        brands: result.data?.brands || []
      }));
    } catch (error) {
      console.error('❌ Error fetching type filters:', error);
      // Em caso de erro, não limpa os filtros existentes
    } finally {
      setLoadingFilters(false);
    }
  };


  const getDaysUntilExpiration = (expirationDate: string) => {
    const now = new Date();
    const expiration = new Date(expirationDate);
    const diffTime = expiration.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const truncateText = (text: string, maxLength: number): string => {
    if (!text) return '';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return <CheckCircleIcon className="w-5 h-5 text-green-500" />;
      case 'REJECTED':
        return <XCircleIcon className="w-5 h-5 text-red-500" />;
      case 'PENDING':
        return <ClockIcon className="w-5 h-5 text-yellow-500" />;
      default:
        return <ClockIcon className="w-5 h-5 text-gray-500" />;
    }
  };

  const getCriticalityBadge = (days: number) => {
    if (days < 0) {
      return {
        label: 'EXPIRADO',
        color: 'bg-gradient-to-r from-red-100 to-red-200 text-red-800 border-2 border-red-300 shadow-md',
        icon: <XCircleIcon className="w-4 h-4" />
      };
    } else if (days <= 30) {
      return {
        label: 'CRÍTICO',
        color: 'bg-gradient-to-r from-red-100 to-red-200 text-red-800 border-2 border-red-300 shadow-md',
        icon: <ExclamationTriangleIcon className="w-4 h-4" />
      };
    } else if (days <= 90) {
      return {
        label: 'ATENÇÃO',
        color: 'bg-gradient-to-r from-orange-100 to-orange-200 text-orange-800 border-2 border-orange-300 shadow-md',
        icon: <ExclamationTriangleIcon className="w-4 h-4" />
      };
    } else if (days <= 180) {
      return {
        label: 'ALERTA',
        color: 'bg-gradient-to-r from-yellow-100 to-yellow-200 text-yellow-800 border-2 border-yellow-300 shadow-md',
        icon: <ClockIcon className="w-4 h-4" />
      };
    } else {
      return {
        label: 'SEGURO',
        color: 'bg-gradient-to-r from-green-100 to-green-200 text-green-800 border-2 border-green-300 shadow-md',
        icon: <CheckCircleIcon className="w-4 h-4" />
      };
    }
  };

  const getRiskScoreColor = (score: number) => {
    if (score > 50) return 'text-red-600';
    if (score > 25) return 'text-orange-600';
    return 'text-green-600';
  };

  const fetchAllDataForAnalysis = async () => {
    setLoadingAnalysis(true);
    try {
      const response = await fetch(
        `https://apinode.smartxhub.cloud/api/dashboard/${companyId}/certificates/reports?page=1&limit=999999&sortBy=${sortBy}&sortOrder=${sortOrder}`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch all data');
      }

      const result: ApiResponse = await response.json();
      setAllData(result.data);
    } catch (error) {
      console.error('Error fetching all data for analysis:', error);
    } finally {
      setLoadingAnalysis(false);
    }
  };

  const fetchData = async (page: number = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: itemsPerPage.toString(),
        sortBy,
        sortOrder
      });

      if (dateFilter.startDate) {
        params.append('startDate', dateFilter.startDate);
      }
      if (dateFilter.endDate) {
        params.append('endDate', dateFilter.endDate);
      }

      if (filters.status !== 'ALL') {
        params.append('certificateStatus', filters.status);
      }

      if (filters.site !== 'ALL') {
        params.append('homeSiteName', filters.site);
      }

      if (filters.certificateType !== 'ALL') {
        params.append('certificateDescription', filters.certificateType);
      }

      if (filters.zone !== 'ALL') {
        params.append('homeZoneCode', filters.zone);
      }

      if (filters.area !== 'ALL') {
        params.append('homeArea', filters.area);
      }

      const response = await fetch(
        `https://apinode.smartxhub.cloud/api/dashboard/${companyId}/certificates/reports?${params}`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch data');
      }

      const result: ApiResponse = await response.json();
      setData(result.data);
      setPagination(result.pagination);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(1);
    fetchAllDataForAnalysis();
    fetchFilters();
    fetchTypeFilters();
  }, [itemsPerPage, sortBy, sortOrder, filters.status, filters.site, filters.certificateType, filters.zone, filters.area]);

  // 4. CRIAR HANDLERS PARA OS FILTROS HIERÁRQUICOS
  const handleSiteChange = (newSite: string) => {
    setFilters({
      ...filters,
      site: newSite,
      area: 'ALL',  // Limpa área quando muda site
      zone: 'ALL'   // Limpa zona quando muda site
    });
  };

  const handleAreaChange = (newArea: string) => {
    setFilters({
      ...filters,
      area: newArea,
      zone: 'ALL'  // Limpa zona quando muda área
    });
  };

  const handleZoneChange = (newZone: string) => {
    setFilters({
      ...filters,
      zone: newZone
    });
  };

  const handleDateFilterApply = () => {
    fetchData(1);
  };

  const handleDateFilterClear = () => {
    setDateFilter({
      startDate: '',
      endDate: ''
    });
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (activeColumnFilter && filterRefs.current[activeColumnFilter]) {
        const filterElement = filterRefs.current[activeColumnFilter];
        if (filterElement && !filterElement.contains(event.target as Node)) {
          setActiveColumnFilter(null);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [activeColumnFilter]);

  const filteredData = useMemo(() => {
    return data.filter(item => {
      const matchSearch = searchTerm === '' ||
        item.item_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.item_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.certificate_description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.serial.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.model.toLowerCase().includes(searchTerm.toLowerCase());



      const matchStatus = filters.status === 'ALL' || item.certificate_status_name === filters.status;
      const matchSite = filters.site === 'ALL' || item.Home_site_name === filters.site;
      const matchCertType = filters.certificateType === 'ALL' || item.certificate_description === filters.certificateType;

      let matchExpirationRange = true;
      if (filters.expirationRange !== 'ALL') {
        const days = getDaysUntilExpiration(item.expiration_date);
        switch (filters.expirationRange) {
          case 'EXPIRED':
            matchExpirationRange = days < 0;
            break;
          case '30_DAYS':
            matchExpirationRange = days >= 0 && days <= 30;
            break;
          case '60_DAYS':
            matchExpirationRange = days > 30 && days <= 60;
            break;
          case '90_DAYS':
            matchExpirationRange = days > 60 && days <= 90;
            break;
          case '180_DAYS':
            matchExpirationRange = days > 90 && days <= 180;
            break;
          case 'SAFE':
            matchExpirationRange = days > 180;
            break;
        }
      }

      const matchColumnFilters = Object.entries(columnFilters).every(([column, values]) => {
        if (values.length === 0) return true;
        const itemValue = String(item[column as keyof CertificateReport]);
        return values.includes(itemValue);
      });

      return matchSearch && matchStatus && matchSite && matchCertType && matchExpirationRange && matchColumnFilters;
    });
  }, [data, searchTerm, filters, columnFilters]);

  //@ts-ignore
  const uniqueValues = useMemo(() => ({
    sites: Array.from(new Set(data.map(item => item.Home_site_name))).filter(Boolean),
    certificateTypes: Array.from(new Set(data.map(item => item.certificate_description))).filter(Boolean),
    statuses: Array.from(new Set(data.map(item => item.certificate_status_name))).filter(Boolean),
  }), [data]);

  const criticalAnalysis = useMemo((): CriticalAnalysis => {
    const now = new Date();

    const dataToAnalyze = allData.length > 0 ? allData : data;

    const expired = dataToAnalyze.filter(item => {
      const expirationDate = new Date(item.expiration_date);
      return expirationDate < now;
    }).length;

    const expiringIn30Days = dataToAnalyze.filter(item => {
      const days = getDaysUntilExpiration(item.expiration_date);
      return days >= 0 && days <= 30;
    }).length;

    const expiringIn60Days = dataToAnalyze.filter(item => {
      const days = getDaysUntilExpiration(item.expiration_date);
      return days > 30 && days <= 60;
    }).length;

    const expiringIn90Days = dataToAnalyze.filter(item => {
      const days = getDaysUntilExpiration(item.expiration_date);
      return days > 60 && days <= 90;
    }).length;

    const expiringIn180Days = dataToAnalyze.filter(item => {
      const days = getDaysUntilExpiration(item.expiration_date);
      return days > 90 && days <= 180;
    }).length;

    const critical = expired + expiringIn30Days;
    const warning = expiringIn60Days + expiringIn90Days;
    const safe = dataToAnalyze.length - critical - warning;

    const totalDays = dataToAnalyze.reduce((sum, item) => {
      return sum + Math.max(0, getDaysUntilExpiration(item.expiration_date));
    }, 0);
    const averageDaysToExpiration = dataToAnalyze.length > 0 ? Math.round(totalDays / dataToAnalyze.length) : 0;

    const siteCount: Record<string, number> = {};
    dataToAnalyze.forEach(item => {
      siteCount[item.Home_site_name] = (siteCount[item.Home_site_name] || 0) + 1;
    });
    const sitesWithMostCertificates = Object.entries(siteCount)
      .map(([site, count]) => ({ site, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    const certTypeCount: Record<string, number> = {};
    dataToAnalyze.forEach(item => {
      certTypeCount[item.certificate_description] = (certTypeCount[item.certificate_description] || 0) + 1;
    });
    const certificateTypeDistribution = Object.entries(certTypeCount)
      .map(([type, count]) => ({ type, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    const urgentActionRequired = expired + expiringIn30Days;

    const compliant = dataToAnalyze.filter(item => {
      const days = getDaysUntilExpiration(item.expiration_date);
      return days > 90;
    }).length;
    const complianceRate = dataToAnalyze.length > 0 ? (compliant / dataToAnalyze.length) * 100 : 0;

    const expiredWeight = expired * 10;
    const expiring30Weight = expiringIn30Days * 7;
    const expiring60Weight = expiringIn60Days * 4;
    const expiring90Weight = expiringIn90Days * 2;
    const totalRiskPoints = expiredWeight + expiring30Weight + expiring60Weight + expiring90Weight;
    const maxPossibleRisk = dataToAnalyze.length * 10;
    const riskScore = maxPossibleRisk > 0 ? Math.min(100, (totalRiskPoints / maxPossibleRisk) * 100) : 0;

    return {
      totalCertificates: dataToAnalyze.length,
      approved: dataToAnalyze.filter(item => item.certificate_status_name === 'APPROVED').length,
      expired,
      expiringIn30Days,
      expiringIn60Days,
      expiringIn90Days,
      expiringIn180Days,
      critical,
      warning,
      safe,
      averageDaysToExpiration,
      sitesWithMostCertificates,
      certificateTypeDistribution,
      urgentActionRequired,
      complianceRate,
      riskScore
    };
  }, [allData, data]);

  // @ts-ignore
  const stats = useMemo(() => {
    const now = new Date();
    const expiringSoon = filteredData.filter(item => {
      const expirationDate = new Date(item.expiration_date);
      const diffTime = expirationDate.getTime() - now.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays <= 90 && diffDays > 0;
    }).length;

    const expired = filteredData.filter(item => {
      const expirationDate = new Date(item.expiration_date);
      return expirationDate < now;
    }).length;

    return {
      total: filteredData.length,
      approved: filteredData.filter(item => item.certificate_status_name === 'APPROVED').length,
      expiringSoon,
      expired,
    };
  }, [filteredData]);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      fetchData(newPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleItemsPerPageChange = (newLimit: number) => {
    setItemsPerPage(newLimit);
  };

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'ASC' ? 'DESC' : 'ASC');
    } else {
      setSortBy(field);
      setSortOrder('DESC');
    }
  };

  const toggleColumnFilter = (column: string) => {
    setActiveColumnFilter(activeColumnFilter === column ? null : column);
  };

  const getUniqueColumnValues = (column: keyof CertificateReport) => {
    const values = Array.from(new Set(data.map(item => String(item[column])))).filter(Boolean);
    return values.sort();
  };

  const handleColumnFilterChange = (column: string, value: string) => {
    setColumnFilters(prev => {
      const currentFilters = prev[column] || [];
      const newFilters = currentFilters.includes(value)
        ? currentFilters.filter(v => v !== value)
        : [...currentFilters, value];

      if (newFilters.length === 0) {
        const { [column]: _, ...rest } = prev;
        return rest;
      }

      return { ...prev, [column]: newFilters };
    });
  };

  const clearColumnFilter = (column: string) => {
    setColumnFilters(prev => {
      const { [column]: _, ...rest } = prev;
      return rest;
    });
    setActiveColumnFilter(null);
  };

  const exportToExcel = () => {
    setExportType('excel');
    setShowExportModal(true);
  };

  const exportToPDF = () => {
    setExportType('pdf');
    setShowExportModal(true);
  };

  const handleExport = async (exportAll: boolean) => {
    setShowExportModal(false);

    let dataToExport = filteredData;

    if (exportAll) {
      try {
        const params = new URLSearchParams({
          page: '1',
          limit: '999999',
          sortBy,
          sortOrder
        });

        const response = await fetch(
          `https://apinode.smartxhub.cloud/api/dashboard/${companyId}/certificates/reports?${params}`
        );

        if (!response.ok) {
          throw new Error('Failed to fetch all data');
        }

        const result: ApiResponse = await response.json();
        dataToExport = result.data;
      } catch (error) {
        console.error('Error fetching all data:', error);
        alert('Erro ao buscar todos os dados. Exportando dados visíveis.');
      }
    }

    if (exportType === 'excel') {
      await exportExcel(dataToExport);
    } else {
      await exportPDF(dataToExport);
    }
  };

  const exportExcel = async (dataToExport: CertificateReport[]) => {
    import('xlsx').then(async (XLSX) => {
      const headers = [
        'ID', 'Site', 'Área', 'Zona', 'Certificado', 'Código Item',
        'Nome Item', 'Marca', 'Modelo', 'Serial', 'Data Expiração', 'Dias p/ Expirar', 'Status Criticidade', 'Status'
      ];

      const dataRows = dataToExport.map(item => {
        const days = getDaysUntilExpiration(item.expiration_date);
        let criticality = 'SEGURO';
        if (days < 0) criticality = 'EXPIRADO';
        else if (days <= 30) criticality = 'CRÍTICO';
        else if (days <= 90) criticality = 'ATENÇÃO';
        else if (days <= 180) criticality = 'ALERTA';

        return [
          item.id,
          item.Home_site_name,
          item.code_area,
          item.code_zone,
          item.certificate_description,
          item.item_code,
          item.item_name,
          item.brand || '-',
          item.model || '-',
          item.serial,
          formatDate(item.expiration_date),
          days,
          criticality,
          item.certificate_status_name
        ];
      });

      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.aoa_to_sheet([headers, ...dataRows]);

      const colWidths = headers.map(() => ({ wch: 20 }));
      ws['!cols'] = colWidths;

      XLSX.utils.book_append_sheet(wb, ws, 'Certificados');

      const analysisData = [
        { 'Métrica': 'Total de Certificados', 'Valor': criticalAnalysis.totalCertificates },
        { 'Métrica': 'Certificados Aprovados', 'Valor': criticalAnalysis.approved },
        { 'Métrica': '--- ANÁLISE DE RISCO ---', 'Valor': '' },
        { 'Métrica': 'Score de Risco Geral', 'Valor': `${criticalAnalysis.riskScore.toFixed(1)}%` },
        { 'Métrica': 'Taxa de Compliance', 'Valor': `${criticalAnalysis.complianceRate.toFixed(1)}%` },
        { 'Métrica': 'Ação Urgente Necessária', 'Valor': criticalAnalysis.urgentActionRequired },
        { 'Métrica': '--- DISTRIBUIÇÃO ---', 'Valor': '' },
        { 'Métrica': 'Certificados Expirados', 'Valor': criticalAnalysis.expired },
        { 'Métrica': 'Expirando em 30 dias', 'Valor': criticalAnalysis.expiringIn30Days },
        { 'Métrica': 'Expirando em 60 dias', 'Valor': criticalAnalysis.expiringIn60Days },
        { 'Métrica': 'Expirando em 90 dias', 'Valor': criticalAnalysis.expiringIn90Days },
        { 'Métrica': 'Expirando em 180 dias', 'Valor': criticalAnalysis.expiringIn180Days },
        { 'Métrica': '--- NÍVEIS ---', 'Valor': '' },
        { 'Métrica': 'Nível Crítico', 'Valor': criticalAnalysis.critical },
        { 'Métrica': 'Nível Alerta', 'Valor': criticalAnalysis.warning },
        { 'Métrica': 'Nível Seguro', 'Valor': criticalAnalysis.safe },
        { 'Métrica': '--- ESTATÍSTICAS ---', 'Valor': '' },
        { 'Métrica': 'Média de Dias até Expiração', 'Valor': criticalAnalysis.averageDaysToExpiration },
        { 'Métrica': 'Data de Exportação', 'Valor': new Date().toLocaleString('pt-BR') }
      ];

      const wsAnalysis = XLSX.utils.json_to_sheet(analysisData);
      wsAnalysis['!cols'] = [{ wch: 35 }, { wch: 25 }];
      XLSX.utils.book_append_sheet(wb, wsAnalysis, 'Análise Crítica');

      const siteData = criticalAnalysis.sitesWithMostCertificates.map(s => ({
        'Site': s.site,
        'Quantidade': s.count,
        'Percentual': `${((s.count / criticalAnalysis.totalCertificates) * 100).toFixed(1)}%`
      }));
      const wsSites = XLSX.utils.json_to_sheet(siteData);
      wsSites['!cols'] = [{ wch: 40 }, { wch: 15 }, { wch: 15 }];
      XLSX.utils.book_append_sheet(wb, wsSites, 'Top Sites');

      const certTypeData = criticalAnalysis.certificateTypeDistribution.map(c => ({
        'Tipo de Certificado': c.type,
        'Quantidade': c.count,
        'Percentual': `${((c.count / criticalAnalysis.totalCertificates) * 100).toFixed(1)}%`
      }));
      const wsCertTypes = XLSX.utils.json_to_sheet(certTypeData);
      wsCertTypes['!cols'] = [{ wch: 40 }, { wch: 15 }, { wch: 15 }];
      XLSX.utils.book_append_sheet(wb, wsCertTypes, 'Tipos de Certificado');

      const fileName = `certificate-critical-report-${new Date().toISOString().split('T')[0]}.xlsx`;
      XLSX.writeFile(wb, fileName);
    }).catch(error => {
      console.error('Erro ao carregar biblioteca XLSX:', error);
      alert('Erro ao exportar para Excel.');
    });
  };

  const exportPDF = async (dataToExport: CertificateReport[]) => {
    try {
      const { jsPDF } = await import('jspdf');

      const doc = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
      }) as import('jspdf').jsPDF;

      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 10;
      let yPosition = margin;

      const primaryColor = [37, 99, 235];
      const lightGray = [245, 247, 250];
      const darkGray = [107, 114, 128];
      const redColor = [220, 38, 38];
      const orangeColor = [249, 115, 22];

      doc.setFontSize(20);
      doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.text('Relatório Crítico de Certificados', margin, yPosition);
      yPosition += 8;

      doc.setFontSize(10);
      doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
      doc.text('Análise Detalhada e Score de Risco', margin, yPosition);
      doc.text(`Data: ${new Date().toLocaleDateString('pt-BR')} ${new Date().toLocaleTimeString('pt-BR')}`, pageWidth - margin, yPosition, { align: 'right' });
      yPosition += 12;

      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');

      const riskColor = criticalAnalysis.riskScore > 50 ? redColor : criticalAnalysis.riskScore > 25 ? orangeColor : [34, 197, 94];
      doc.setTextColor(riskColor[0], riskColor[1], riskColor[2]);
      doc.text(`Score de Risco: ${criticalAnalysis.riskScore.toFixed(1)}%`, margin, yPosition);

      doc.setTextColor(34, 197, 94);
      doc.text(`Taxa de Compliance: ${criticalAnalysis.complianceRate.toFixed(1)}%`, pageWidth / 2, yPosition);

      if (criticalAnalysis.urgentActionRequired > 0) {
        doc.setTextColor(redColor[0], redColor[1], redColor[2]);
        doc.text(`⚠ Ação Urgente: ${criticalAnalysis.urgentActionRequired} certificados`, pageWidth - margin, yPosition, { align: 'right' });
      }

      yPosition += 10;
      doc.setFont('helvetica', 'normal');

      doc.setFontSize(9);
      doc.setTextColor(0, 0, 0);

      const statsData = [
        `Total: ${criticalAnalysis.totalCertificates}`,
        `Expirados: ${criticalAnalysis.expired}`,
        `30d: ${criticalAnalysis.expiringIn30Days}`,
        `60d: ${criticalAnalysis.expiringIn60Days}`,
        `90d: ${criticalAnalysis.expiringIn90Days}`,
        `180d: ${criticalAnalysis.expiringIn180Days}`,
        `Crítico: ${criticalAnalysis.critical}`,
        `Alerta: ${criticalAnalysis.warning}`,
        `Seguro: ${criticalAnalysis.safe}`,
        `Média: ${criticalAnalysis.averageDaysToExpiration}d`
      ];

      const colWidth = (pageWidth - 2 * margin) / statsData.length;
      statsData.forEach((stat, index) => {
        const x = margin + (index * colWidth);
        doc.text(stat, x, yPosition);
      });

      yPosition += 10;

      const headers = [
        { text: 'ID', width: 12 },
        { text: 'Item', width: 30 },
        { text: 'Certificado', width: 28 },
        { text: 'Site', width: 20 },
        { text: 'Serial', width: 22 },
        { text: 'Expiração', width: 20 },
        { text: 'Dias', width: 12 },
        { text: 'Criticidade', width: 22 },
        { text: 'Status', width: 18 }
      ];

      doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.rect(margin, yPosition, pageWidth - 2 * margin, 8, 'F');

      doc.setFontSize(7);
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');

      let xPosition = margin + 2;
      headers.forEach(header => {
        doc.text(header.text, xPosition, yPosition + 5);
        xPosition += header.width;
      });

      yPosition += 10;
      doc.setFont('helvetica', 'normal');

      doc.setFontSize(6);
      doc.setTextColor(0, 0, 0);

      dataToExport.forEach((item, index) => {
        if (yPosition > pageHeight - 15) {
          doc.addPage();
          yPosition = margin;

          doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
          doc.rect(margin, yPosition, pageWidth - 2 * margin, 8, 'F');

          doc.setFontSize(7);
          doc.setTextColor(255, 255, 255);
          doc.setFont('helvetica', 'bold');

          xPosition = margin + 2;
          headers.forEach(header => {
            doc.text(header.text, xPosition, yPosition + 5);
            xPosition += header.width;
          });

          yPosition += 10;
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(6);
          doc.setTextColor(0, 0, 0);
        }

        const days = getDaysUntilExpiration(item.expiration_date);
        let criticality = 'SEGURO';
        let criticalityColor = [34, 197, 94];

        if (days < 0) {
          criticality = 'EXPIRADO';
          criticalityColor = [220, 38, 38];
        } else if (days <= 30) {
          criticality = 'CRÍTICO';
          criticalityColor = [220, 38, 38];
        } else if (days <= 90) {
          criticality = 'ATENÇÃO';
          criticalityColor = [249, 115, 22];
        } else if (days <= 180) {
          criticality = 'ALERTA';
          criticalityColor = [234, 179, 8];
        }

        if (index % 2 === 0) {
          doc.setFillColor(lightGray[0], lightGray[1], lightGray[2]);
          doc.rect(margin, yPosition - 3, pageWidth - 2 * margin, 6, 'F');
        }

        const rowData = [
          { text: item.id.toString(), color: [0, 0, 0] },
          { text: truncateText(item.item_name, 25), color: [0, 0, 0] },
          { text: truncateText(item.certificate_description, 23), color: [0, 0, 0] },
          { text: truncateText(item.Home_site_name, 18), color: [0, 0, 0] },
          { text: truncateText(item.serial, 18), color: [0, 0, 0] },
          { text: formatDate(item.expiration_date), color: [0, 0, 0] },
          { text: days.toString(), color: criticalityColor },
          { text: criticality, color: criticalityColor },
          { text: item.certificate_status_name, color: [0, 0, 0] }
        ];

        xPosition = margin + 2;
        rowData.forEach((data, colIndex) => {
          let align: "left" | "center" | "right" = "left";
          if (colIndex === 0 || colIndex === 6) align = "center";

          doc.setTextColor(data.color[0], data.color[1], data.color[2]);
          if (colIndex === 7) doc.setFont('helvetica', 'bold');
          doc.text(data.text, xPosition, yPosition, { align });
          doc.setFont('helvetica', 'normal');
          doc.setTextColor(0, 0, 0);
          xPosition += headers[colIndex].width;
        });

        yPosition += 6;
      });

      doc.addPage();
      yPosition = margin;

      doc.setFontSize(18);
      doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.setFont('helvetica', 'bold');
      doc.text('Análise Crítica Detalhada', margin, yPosition);
      yPosition += 12;

      doc.setFontSize(14);
      doc.text('Score de Risco e Compliance', margin, yPosition);
      yPosition += 8;

      const riskAnalysis = [
        ['Score de Risco Geral', `${criticalAnalysis.riskScore.toFixed(1)}%`],
        ['Taxa de Compliance', `${criticalAnalysis.complianceRate.toFixed(1)}%`],
        ['Certificados Requerendo Ação Urgente', criticalAnalysis.urgentActionRequired.toString()],
        ['Média de Dias até Expiração', `${criticalAnalysis.averageDaysToExpiration} dias`],
      ];

      doc.setFontSize(10);
      doc.setTextColor(0, 0, 0);
      doc.setFont('helvetica', 'normal');

      riskAnalysis.forEach(([label, value], index) => {
        if (index % 2 === 0) {
          doc.setFillColor(lightGray[0], lightGray[1], lightGray[2]);
          doc.rect(margin, yPosition - 2, pageWidth - 2 * margin, 6, 'F');
        }

        doc.text(label, margin + 5, yPosition);
        doc.setFont('helvetica', 'bold');
        doc.text(value, pageWidth - margin - 5, yPosition, { align: 'right' });
        doc.setFont('helvetica', 'normal');
        yPosition += 6;
      });

      yPosition += 8;

      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Distribuição por Criticidade', margin, yPosition);
      yPosition += 8;

      const criticalityDist = [
        ['Nível Crítico (Expirados + 30 dias)', criticalAnalysis.critical.toString(), `${((criticalAnalysis.critical / criticalAnalysis.totalCertificates) * 100).toFixed(1)}%`],
        ['Nível Alerta (60-90 dias)', criticalAnalysis.warning.toString(), `${((criticalAnalysis.warning / criticalAnalysis.totalCertificates) * 100).toFixed(1)}%`],
        ['Nível Seguro (>180 dias)', criticalAnalysis.safe.toString(), `${((criticalAnalysis.safe / criticalAnalysis.totalCertificates) * 100).toFixed(1)}%`],
      ];

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');

      criticalityDist.forEach(([label, value, percent], index) => {
        if (index % 2 === 0) {
          doc.setFillColor(lightGray[0], lightGray[1], lightGray[2]);
          doc.rect(margin, yPosition - 2, pageWidth - 2 * margin, 6, 'F');
        }

        doc.text(label, margin + 5, yPosition);
        doc.text(value, pageWidth / 2 + 20, yPosition);
        doc.setFont('helvetica', 'bold');
        doc.text(percent, pageWidth - margin - 5, yPosition, { align: 'right' });
        doc.setFont('helvetica', 'normal');
        yPosition += 6;
      });

      yPosition += 8;

      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Top 5 Sites com Mais Certificados', margin, yPosition);
      yPosition += 8;

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');

      criticalAnalysis.sitesWithMostCertificates.forEach(({ site, count }, index) => {
        if (yPosition > pageHeight - 15) {
          doc.addPage();
          yPosition = margin;
        }

        if (index % 2 === 0) {
          doc.setFillColor(lightGray[0], lightGray[1], lightGray[2]);
          doc.rect(margin, yPosition - 2, pageWidth - 2 * margin, 6, 'F');
        }

        doc.text(`${index + 1}. ${truncateText(site, 50)}`, margin + 5, yPosition);
        doc.setFont('helvetica', 'bold');
        doc.text(`${count} (${((count / criticalAnalysis.totalCertificates) * 100).toFixed(1)}%)`, pageWidth - margin - 5, yPosition, { align: 'right' });
        doc.setFont('helvetica', 'normal');
        yPosition += 6;
      });

      yPosition += 8;

      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Top 5 Tipos de Certificados', margin, yPosition);
      yPosition += 8;

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');

      criticalAnalysis.certificateTypeDistribution.forEach(({ type, count }, index) => {
        if (yPosition > pageHeight - 15) {
          doc.addPage();
          yPosition = margin;
        }

        if (index % 2 === 0) {
          doc.setFillColor(lightGray[0], lightGray[1], lightGray[2]);
          doc.rect(margin, yPosition - 2, pageWidth - 2 * margin, 6, 'F');
        }

        doc.text(`${index + 1}. ${truncateText(type, 50)}`, margin + 5, yPosition);
        doc.setFont('helvetica', 'bold');
        doc.text(`${count} (${((count / criticalAnalysis.totalCertificates) * 100).toFixed(1)}%)`, pageWidth - margin - 5, yPosition, { align: 'right' });
        doc.setFont('helvetica', 'normal');
        yPosition += 6;
      });

      const fileName = `certificate-critical-report-${new Date().toISOString().split('T')[0]}.pdf`;
      doc.save(fileName);

    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      alert('Erro ao exportar para PDF. Tente novamente.');
    }
  };

  const ColumnFilterDropdown = ({ column, displayName }: { column: keyof CertificateReport; displayName: string }) => {
    const [searchFilter, setSearchFilter] = useState('');
    const uniqueValues = getUniqueColumnValues(column);
    const selectedValues = columnFilters[column] || [];
    const isFiltered = selectedValues.length > 0;

    const filteredValues = uniqueValues.filter(value =>
      value.toLowerCase().includes(searchFilter.toLowerCase())
    );

    return (
      <div className="relative inline-block" ref={(el: any) => filterRefs.current[column] = el}>
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleColumnFilter(column);
          }}
          className={`ml-1 p-1 rounded hover:bg-gray-200 transition-colors ${isFiltered ? 'text-blue-600 bg-blue-100' : 'text-gray-400'}`}
        >
          <FunnelIcon className="w-4 h-4" />
        </button>

        {activeColumnFilter === column && (
          <div className="absolute top-full left-0 mt-1 w-64 bg-white border-2 border-gray-200 rounded-xl shadow-xl z-50">
            <div className="p-3 border-b-2 bg-gradient-to-r from-gray-50 to-blue-50">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-bold">Filtrar por {displayName}</span>
                {isFiltered && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      clearColumnFilter(column);
                    }}
                    className="text-xs text-blue-600 hover:text-blue-800 font-semibold"
                  >
                    Limpar
                  </button>
                )}
              </div>

              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Buscar..."
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                  className="w-full pl-8 pr-3 py-1.5 text-sm border-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div className="overflow-y-auto max-h-60 p-2">
              {filteredValues.length === 0 ? (
                <div className="text-sm text-gray-500 p-2">Nenhum resultado</div>
              ) : (
                filteredValues.map(value => (
                  <label
                    key={value}
                    className="flex items-center px-2 py-2 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 rounded-lg cursor-pointer transition-all"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <input
                      type="checkbox"
                      checked={selectedValues.includes(value)}
                      onChange={() => handleColumnFilterChange(column, value)}
                      className="mr-2 rounded"
                    />
                    <span className="text-sm truncate font-medium">{value}</span>
                  </label>
                ))
              )}
            </div>

            <div className="p-2 border-t-2 bg-gradient-to-r from-gray-50 to-blue-50 text-xs text-gray-600 font-medium">
              {isFiltered ? `${selectedValues.length} de ${uniqueValues.length} selecionado(s)` : `${uniqueValues.length} disponível(is)`}
            </div>
          </div>
        )}
      </div>
    );
  };

  if (loading && data.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-600 via-blue-500 to-indigo-600">
        <div className="text-center bg-white p-8 rounded-2xl shadow-2xl">
          <div className="relative w-20 h-20 mx-auto mb-6">
            <div className="absolute inset-0 border-4 border-blue-200 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
          <p className="text-gray-700 font-semibold text-lg">Carregando certificados...</p>
          <p className="text-gray-500 text-sm mt-2">Processando análise crítica</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-3 sm:p-4 md:p-6">
      <div className="w-full max-w-full overflow-x-hidden">

        {/* Cabeçalho Moderno */}
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center gap-4 mb-3">
            <div className="bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-600 p-4 rounded-2xl shadow-lg transform hover:scale-105 transition-transform">
              <ChartBarIcon className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Análise Crítica de Certificados
              </h1>
              <p className="text-sm sm:text-base text-gray-600 mt-1">Relatório detalhado com score de risco e análise preditiva</p>
            </div>
          </div>
        </div>

        {/* Painel de Análise Crítica - Mantém o código existente mas com cards melhorados */}
        {showAnalysis && (
          <div className="mb-6 space-y-4">
            {/* Score de Risco e Compliance */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-2xl shadow-xl p-6 border-2 border-red-200 hover:shadow-2xl transition-all transform hover:-translate-y-1">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-bold text-red-900 uppercase tracking-wide">Score de Risco</span>
                  <div className="bg-red-500 p-3 rounded-xl">
                    <ExclamationTriangleIcon className="w-6 h-6 text-white" />
                  </div>
                </div>
                <div className={`text-4xl font-bold ${getRiskScoreColor(criticalAnalysis.riskScore)}`}>
                  {criticalAnalysis.riskScore.toFixed(1)}%
                </div>
                <div className="mt-2 text-xs font-semibold text-red-700">
                  {criticalAnalysis.riskScore > 50 ? 'Risco Crítico' : criticalAnalysis.riskScore > 25 ? 'Risco Moderado' : 'Risco Baixo'}
                </div>
              </div>

              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl shadow-xl p-6 border-2 border-green-200 hover:shadow-2xl transition-all transform hover:-translate-y-1">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-bold text-green-900 uppercase tracking-wide">Taxa de Compliance</span>
                  <div className="bg-green-500 p-3 rounded-xl">
                    <CheckCircleIcon className="w-6 h-6 text-white" />
                  </div>
                </div>
                <div className="text-4xl font-bold text-green-600">
                  {criticalAnalysis.complianceRate.toFixed(1)}%
                </div>
                <div className="mt-2 text-xs font-semibold text-green-700">
                  Certificados válidos &gt; 90 dias
                </div>
              </div>

              <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl shadow-xl p-6 border-2 border-orange-200 sm:col-span-2 lg:col-span-1 hover:shadow-2xl transition-all transform hover:-translate-y-1">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-bold text-orange-900 uppercase tracking-wide">Ação Urgente</span>
                  <div className="bg-orange-500 p-3 rounded-xl">
                    <ClockIcon className="w-6 h-6 text-white" />
                  </div>
                </div>
                <div className="text-4xl font-bold text-orange-600">
                  {criticalAnalysis.urgentActionRequired}
                </div>
                <div className="mt-2 text-xs font-semibold text-orange-700">
                  Certificados requerem ação imediata
                </div>
              </div>
            </div>

            {/* Estatísticas Detalhadas */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="bg-white rounded-xl shadow-lg p-4 border-l-4 border-red-500 hover:shadow-xl transition-all">
                <div className="text-xs text-gray-600 mb-1 font-semibold">Expirados</div>
                <div className="text-2xl font-bold text-red-600">{criticalAnalysis.expired}</div>
              </div>
              <div className="bg-white rounded-xl shadow-lg p-4 border-l-4 border-orange-500 hover:shadow-xl transition-all">
                <div className="text-xs text-gray-600 mb-1 font-semibold">30 Dias</div>
                <div className="text-2xl font-bold text-orange-600">{criticalAnalysis.expiringIn30Days}</div>
              </div>
              <div className="bg-white rounded-xl shadow-lg p-4 border-l-4 border-yellow-500 hover:shadow-xl transition-all">
                <div className="text-xs text-gray-600 mb-1 font-semibold">60 Dias</div>
                <div className="text-2xl font-bold text-yellow-600">{criticalAnalysis.expiringIn60Days}</div>
              </div>
              <div className="bg-white rounded-xl shadow-lg p-4 border-l-4 border-blue-500 hover:shadow-xl transition-all">
                <div className="text-xs text-gray-600 mb-1 font-semibold">90 Dias</div>
                <div className="text-2xl font-bold text-blue-600">{criticalAnalysis.expiringIn90Days}</div>
              </div>
              <div className="bg-white rounded-xl shadow-lg p-4 border-l-4 border-green-500 hover:shadow-xl transition-all">
                <div className="text-xs text-gray-600 mb-1 font-semibold">Média Dias</div>
                <div className="text-2xl font-bold text-green-600">{criticalAnalysis.averageDaysToExpiration}</div>
              </div>
            </div>

            {/* Distribuição por Níveis */}
            <div className="bg-white rounded-2xl shadow-xl p-6 border-2 border-gray-200">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <ChartBarIcon className="w-6 h-6 text-blue-600" />
                Distribuição por Nível de Criticidade
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-5 bg-gradient-to-br from-red-50 to-red-100 rounded-xl border-2 border-red-200 hover:shadow-lg transition-all">
                  <div className="text-4xl font-bold text-red-600">{criticalAnalysis.critical}</div>
                  <div className="text-sm font-bold text-red-700 mt-2">Nível Crítico</div>
                  <div className="text-xs text-gray-600 mt-1 font-medium">
                    {((criticalAnalysis.critical / criticalAnalysis.totalCertificates) * 100).toFixed(1)}% do total
                  </div>
                </div>
                <div className="text-center p-5 bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl border-2 border-yellow-200 hover:shadow-lg transition-all">
                  <div className="text-4xl font-bold text-yellow-600">{criticalAnalysis.warning}</div>
                  <div className="text-sm font-bold text-yellow-700 mt-2">Nível Alerta</div>
                  <div className="text-xs text-gray-600 mt-1 font-medium">
                    {((criticalAnalysis.warning / criticalAnalysis.totalCertificates) * 100).toFixed(1)}% do total
                  </div>
                </div>
                <div className="text-center p-5 bg-gradient-to-br from-green-50 to-green-100 rounded-xl border-2 border-green-200 hover:shadow-lg transition-all">
                  <div className="text-4xl font-bold text-green-600">{criticalAnalysis.safe}</div>
                  <div className="text-sm font-bold text-green-700 mt-2">Nível Seguro</div>
                  <div className="text-xs text-gray-600 mt-1 font-medium">
                    {((criticalAnalysis.safe / criticalAnalysis.totalCertificates) * 100).toFixed(1)}% do total
                  </div>
                </div>
              </div>
            </div>

            {/* Top Sites e Tipos */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white rounded-2xl shadow-xl p-6 border-2 border-gray-200">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Top 5 Sites</h3>
                <div className="space-y-3">
                  {criticalAnalysis.sitesWithMostCertificates.map((site, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl hover:shadow-md transition-all">
                      <span className="text-sm font-semibold text-gray-700 truncate flex-1">{site.site}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-gray-900">{site.count}</span>
                        <span className="text-xs text-gray-500 font-medium">
                          ({((site.count / criticalAnalysis.totalCertificates) * 100).toFixed(1)}%)
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-xl p-6 border-2 border-gray-200">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Top 5 Tipos de Certificado</h3>
                <div className="space-y-3">
                  {criticalAnalysis.certificateTypeDistribution.map((cert, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl hover:shadow-md transition-all">
                      <span className="text-sm font-semibold text-gray-700 truncate flex-1">{cert.type}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-gray-900">{cert.count}</span>
                        <span className="text-xs text-gray-500 font-medium">
                          ({((cert.count / criticalAnalysis.totalCertificates) * 100).toFixed(1)}%)
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowAnalysis(false)}
              className="w-full py-3 text-sm text-gray-600 hover:text-gray-900 flex items-center justify-center gap-2 font-semibold rounded-xl hover:bg-gray-100 transition-all"
            >
              <ChevronLeftIcon className="w-5 h-5" />
              Ocultar Análise Detalhada
            </button>
          </div>
        )}

        {!showAnalysis && (
          <button
            onClick={() => setShowAnalysis(true)}
            className="mb-6 w-full py-4 bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 text-blue-700 rounded-xl flex items-center justify-center gap-2 transition-all font-bold shadow-md hover:shadow-lg border-2 border-blue-200"
          >
            <InformationCircleIcon className="w-6 h-6" />
            Mostrar Análise Crítica Detalhada
          </button>
        )}

        {/* Cards de Estatísticas Rápidas - MELHORADOS */}


        {/* Continua com o resto do código... */}
        {/* (Mantém toda a parte de filtros, tabela, paginação igual ao código original) */}

        <div className="min-h-screen bg-gray-50 p-3 sm:p-4 md:p-6">

          <div className="w-full max-w-full overflow-x-hidden ">

            <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-xl mb-6 mx-4 border-2 border-gray-200 overflow-hidden">
              {/* Barra de Busca e Controles Principais */}
              <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 p-6">
                <div className="flex flex-col md:flex-row gap-4">
                  {/* Campo de Busca Melhorado */}
                  <div className="flex-1 relative group">
                    <div className="absolute inset-0 bg-white rounded-xl opacity-10 group-hover:opacity-20 transition-opacity"></div>
                    <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/70 w-5 h-5 z-10" />
                    <input
                      type="text"
                      placeholder="Buscar por item, código, certificado, serial, marca ou modelo..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="relative w-full pl-12 pr-4 py-3.5 bg-white/10 backdrop-blur-sm border-2 border-white/20 rounded-xl focus:ring-2 focus:ring-white/50 focus:border-white/40 text-white placeholder-white/60 font-medium transition-all hover:bg-white/15"
                    />
                  </div>

                  {/* Controles de Ação */}
                  <div className="flex flex-wrap gap-3">
                    {/* Items por Página */}
                    <select
                      value={itemsPerPage}
                      onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
                      className="px-4 py-3 bg-white/10 backdrop-blur-sm border-2 border-white/20 rounded-xl text-white font-semibold focus:ring-2 focus:ring-white/50 hover:bg-white/15 transition-all cursor-pointer"
                    >
                      <option value={10} className="text-gray-900">10 / pág</option>
                      <option value={25} className="text-gray-900">25 / pág</option>
                      <option value={50} className="text-gray-900">50 / pág</option>
                      <option value={100} className="text-gray-900">100 / pág</option>
                    </select>

                    {/* Botão Refresh */}
                    <button
                      onClick={() => {
                        fetchData(1);
                        fetchAllDataForAnalysis();
                      }}
                      className="flex items-center gap-2 px-5 py-3 bg-white/10 backdrop-blur-sm border-2 border-white/20 text-white rounded-xl font-bold transition-all transform hover:scale-105 hover:bg-white/15 shadow-lg group"
                      title="Atualizar dados"
                    >
                      <svg
                        className="w-5 h-5 group-hover:rotate-180 transition-transform duration-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      <span className="hidden lg:inline">Atualizar</span>
                    </button>

                    {/* Botão Filtros */}
                    <button
                      onClick={() => setShowFilters(!showFilters)}
                      className={`flex items-center gap-2 px-5 py-3 rounded-xl font-bold transition-all transform hover:scale-105 shadow-lg ${showFilters
                        ? 'bg-white text-blue-700 shadow-white/20'
                        : 'bg-white/10 backdrop-blur-sm border-2 border-white/20 text-white hover:bg-white/15'
                        }`}
                    >
                      <FunnelIcon className="w-5 h-5" />
                      Filtros
                      {(filters.status !== 'ALL' || filters.site !== 'ALL' || filters.certificateType !== 'ALL' || filters.expirationRange !== 'ALL' || filters.zone !== 'ALL' || filters.area !== 'ALL') && (
                        <span className="ml-1 px-2 py-0.5 bg-red-500 text-white text-xs rounded-full font-bold animate-pulse">
                          •
                        </span>
                      )}
                    </button>

                    {/* Botão Excel */}
                    <button
                      onClick={exportToExcel}
                      className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-xl font-bold transition-all transform hover:scale-105 shadow-lg hover:shadow-green-500/50"
                    >
                      <ArrowDownTrayIcon className="w-5 h-5" />
                      <span className="hidden sm:inline">Excel</span>
                    </button>

                    {/* Botão PDF */}
                    <button
                      onClick={exportToPDF}
                      className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white rounded-xl font-bold transition-all transform hover:scale-105 shadow-lg hover:shadow-red-500/50"
                    >
                      <ArrowDownTrayIcon className="w-5 h-5" />
                      <span className="hidden sm:inline">PDF</span>
                    </button>

                    {/* Botão Programação */}
                    <div className="relative">
                      <button
                        onClick={() => setShowExportProgramacaoMenu(!showExportProgramacaoMenu)}
                        className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-purple-500 to-violet-600 hover:from-purple-600 hover:to-violet-700 text-white rounded-xl font-bold transition-all transform hover:scale-105 shadow-lg hover:shadow-purple-500/50"
                      >
                        <DocumentTextIcon className="w-5 h-5" />
                        <span className="hidden lg:inline">Programação</span>
                      </button>


                    </div>
                  </div>
                </div>
              </div>
              {/* Menu Dropdown Programação - MELHORADO */}
              {showExportProgramacaoMenu && (
                <div className="absolute right-0 mt-4 w-80 bg-white rounded-2xl shadow-2xl border-2 border-purple-200 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                  {/* Header do Menu */}
                  <div className="bg-gradient-to-r from-purple-500 to-violet-600 p-5">
                    <h3 className="font-bold text-white text-lg flex items-center gap-2">
                      <DocumentTextIcon className="w-6 h-6" />
                      Programação de Calibração
                    </h3>
                    <p className="text-purple-100 text-sm mt-1">Exportar no formato padrão</p>
                  </div>

                  {/* Opções de Exportação */}
                  <div className="p-4 space-y-3">
                    {/* Excel - Filtrados */}
                    <button
                      onClick={() => handleExportProgramacao('excel', false)}
                      className="w-full flex items-start gap-4 p-4 border-2 border-gray-200 rounded-xl hover:border-green-500 hover:bg-gradient-to-r hover:from-green-50 hover:to-emerald-50 transition-all group"
                    >
                      <div className="bg-green-100 p-3 rounded-xl group-hover:bg-green-500 transition-all">
                        <DocumentTextIcon className="w-6 h-6 text-green-600 group-hover:text-white transition-all" />
                      </div>
                      <div className="text-left flex-1">
                        <div className="font-bold text-gray-900 mb-1">Excel - Dados Filtrados</div>
                        <div className="text-sm text-gray-600">
                          <span className="font-semibold text-green-600">{filteredData.length}</span> registros visíveis
                        </div>
                      </div>
                    </button>

                    {/* Excel - Todos */}
                    <button
                      onClick={() => handleExportProgramacao('excel', true)}
                      className="w-full flex items-start gap-4 p-4 border-2 border-gray-200 rounded-xl hover:border-green-500 hover:bg-gradient-to-r hover:from-green-50 hover:to-emerald-50 transition-all group"
                    >
                      <div className="bg-green-100 p-3 rounded-xl group-hover:bg-green-500 transition-all">
                        <DocumentTextIcon className="w-6 h-6 text-green-600 group-hover:text-white transition-all" />
                      </div>
                      <div className="text-left flex-1">
                        <div className="font-bold text-gray-900 mb-1">Excel - Todos os Dados</div>
                        <div className="text-sm text-gray-600">
                          <span className="font-semibold text-green-600">{pagination.totalItems}</span> registros totais
                        </div>
                      </div>
                    </button>

                    {/* PDF - Filtrados */}
                    <button
                      onClick={() => handleExportProgramacao('pdf', false)}
                      className="w-full flex items-start gap-4 p-4 border-2 border-gray-200 rounded-xl hover:border-red-500 hover:bg-gradient-to-r hover:from-red-50 hover:to-rose-50 transition-all group"
                    >
                      <div className="bg-red-100 p-3 rounded-xl group-hover:bg-red-500 transition-all">
                        <DocumentTextIcon className="w-6 h-6 text-red-600 group-hover:text-white transition-all" />
                      </div>
                      <div className="text-left flex-1">
                        <div className="font-bold text-gray-900 mb-1">PDF - Dados Filtrados</div>
                        <div className="text-sm text-gray-600">
                          <span className="font-semibold text-red-600">{filteredData.length}</span> registros visíveis
                        </div>
                      </div>
                    </button>

                    {/* PDF - Todos */}
                    <button
                      onClick={() => handleExportProgramacao('pdf', true)}
                      className="w-full flex items-start gap-4 p-4 border-2 border-gray-200 rounded-xl hover:border-red-500 hover:bg-gradient-to-r hover:from-red-50 hover:to-rose-50 transition-all group"
                    >
                      <div className="bg-red-100 p-3 rounded-xl group-hover:bg-red-500 transition-all">
                        <DocumentTextIcon className="w-6 h-6 text-red-600 group-hover:text-white transition-all" />
                      </div>
                      <div className="text-left flex-1">
                        <div className="font-bold text-gray-900 mb-1">PDF - Todos os Dados</div>
                        <div className="text-sm text-gray-600">
                          <span className="font-semibold text-red-600">{pagination.totalItems}</span> registros totais
                        </div>
                      </div>
                    </button>
                  </div>

                  {/* Footer */}
                  <div className="p-4 border-t-2 border-gray-200 bg-gray-50">
                    <button
                      onClick={() => setShowExportProgramacaoMenu(false)}
                      className="w-full px-4 py-2.5 text-sm text-gray-700 hover:text-gray-900 font-bold rounded-lg hover:bg-gray-200 transition-all"
                    >
                      Fechar Menu
                    </button>
                  </div>
                </div>
              )}

              {/* Modal de Exportação - MELHORADO */}
              {showExportModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
                  <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-200">
                    {/* Header do Modal */}
                    <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6">
                      <h3 className="text-2xl font-bold text-white flex items-center gap-3">
                        <ArrowDownTrayIcon className="w-7 h-7" />
                        Exportar para {exportType === 'excel' ? 'Excel' : 'PDF'}
                      </h3>
                      <p className="text-blue-100 mt-2">
                        Escolha o tipo de exportação desejado
                      </p>
                    </div>

                    {/* Opções */}
                    <div className="p-6 space-y-4">
                      {/* Dados Filtrados */}
                      <button
                        onClick={() => handleExport(false)}
                        className="w-full flex items-start gap-4 p-5 border-2 border-gray-300 rounded-xl hover:border-blue-500 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all group transform hover:scale-[1.02]"
                      >
                        <div className="bg-blue-100 p-3 rounded-xl group-hover:bg-blue-500 transition-all flex-shrink-0">
                          <FunnelIcon className="w-6 h-6 text-blue-600 group-hover:text-white transition-all" />
                        </div>
                        <div className="text-left">
                          <div className="font-bold text-gray-900 text-lg mb-1">Dados Filtrados</div>
                          <div className="text-sm text-gray-600">
                            Exportar <span className="font-bold text-blue-600">{filteredData.length}</span> registros visíveis
                          </div>
                        </div>
                      </button>

                      {/* Todos os Dados */}
                      <button
                        onClick={() => handleExport(true)}
                        className="w-full flex items-start gap-4 p-5 border-2 border-gray-300 rounded-xl hover:border-blue-500 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all group transform hover:scale-[1.02]"
                      >
                        <div className="bg-blue-100 p-3 rounded-xl group-hover:bg-blue-500 transition-all flex-shrink-0">
                          <ArrowDownTrayIcon className="w-6 h-6 text-blue-600 group-hover:text-white transition-all" />
                        </div>
                        <div className="text-left">
                          <div className="font-bold text-gray-900 text-lg mb-1">Todos os Dados + Análise</div>
                          <div className="text-sm text-gray-600">
                            Exportar todos os <span className="font-bold text-blue-600">{pagination.totalItems}</span> registros + análise crítica completa
                          </div>
                        </div>
                      </button>
                    </div>

                    {/* Footer */}
                    <div className="p-6 border-t-2 border-gray-200 bg-gray-50">
                      <button
                        onClick={() => setShowExportModal(false)}
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl hover:bg-gray-100 font-bold text-gray-700 transition-all"
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Seção de Filtros Expandida - MELHORADA */}
              {showFilters && (
                <div className="border-t-2 border-gray-200">
                  {/* Filtros Principais */}
                  <div className="p-6 bg-gradient-to-br from-gray-50 to-blue-50">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                        <FunnelIcon className="w-6 h-6 text-blue-600" />
                        Filtros Avançados
                      </h3>
                      <button
                        onClick={() => {
                          setFilters({
                            status: 'ALL',
                            site: 'ALL',
                            certificateType: 'ALL',
                            expirationRange: 'ALL',
                            zone: 'ALL',
                            area: 'ALL',
                          });
                          handleDateFilterClear();
                        }}
                        className="flex items-center gap-2 px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg font-semibold transition-all transform hover:scale-105"
                      >
                        <XCircleIcon className="w-4 h-4" />
                        Limpar Tudo
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {/* Filtro de Status */}
                      {/* Filtro de Status - AGORA COM TRADUÇÃO */}
                      <div className="space-y-2">
                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide">
                          Status do Certificado
                        </label>
                        <SearchableSelect
                          label="Status"
                          value={filters.status}
                          onChange={(value) => setFilters({ ...filters, status: value })}
                          options={availableFilters.statuses}
                          loading={loadingFilters}
                          translate={true}
                        />
                      </div>



                      {/* Filtro de Site */}
                      {/* Filtro de Site */}
                      <div className="space-y-2">
                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide">
                          Site / Localização
                        </label>
                        <select
                          value={filters.site}
                          onChange={(e) => handleSiteChange(e.target.value)}
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-medium hover:border-blue-300 transition-all"
                        >
                          <option value="ALL">✓ Todos os Sites</option>
                          {loadingFilters ? (
                            <option disabled>Carregando...</option>
                          ) : (
                            availableFilters.sites.map(site => (
                              <option key={site} value={site}>{site}</option>
                            ))
                          )}
                        </select>
                      </div>

                      {/* Filtro de Área */}
                      <div className="space-y-2">
                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide">
                          Área
                        </label>
                        <SearchableSelect
                          label="Área"
                          value={filters.area}
                          onChange={handleAreaChange}
                          options={availableFilters.areas}
                          loading={loadingFilters}
                          translate
                        />
                        {filters.site === 'ALL' && (
                          <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                            <InformationCircleIcon className="w-4 h-4" />
                            Selecione um site para filtrar áreas
                          </p>
                        )}
                      </div>

                      {/* Filtro de Zona */}
                      <div className="space-y-2">
                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide">
                          Zona
                        </label>
                        <SearchableSelect
                          label="Zona"
                          value={filters.zone}
                          onChange={handleZoneChange}
                          options={availableFilters.zones}
                          loading={loadingFilters}
                          translate
                        />
                        {filters.site === 'ALL' && (
                          <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                            <InformationCircleIcon className="w-4 h-4" />
                            Selecione um site para filtrar zonas
                          </p>
                        )}
                      </div>


                      {/* Filtro de Tipo de Certificado */}
                      <div className="space-y-2">
                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide">
                          Tipo de Certificado
                        </label>
                        <select
                          value={filters.certificateType}
                          onChange={(e) => setFilters({ ...filters, certificateType: e.target.value })}
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-medium hover:border-blue-300 transition-all"
                        >
                          <option value="ALL">✓ Todos os Tipos</option>
                          {loadingFilters ? (
                            <option disabled>Carregando...</option>
                          ) : (
                            availableFilters.descriptions.map(type => (
                              <option key={type} value={type}>{type}</option>
                            ))
                          )}
                        </select>
                      </div>

                      {/* Filtro de Range de Expiração */}
                      <div className="space-y-2">
                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide">
                          Período de Expiração
                        </label>
                        <select
                          value={filters.expirationRange}
                          onChange={(e) => setFilters({ ...filters, expirationRange: e.target.value })}
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-medium hover:border-blue-300 transition-all"
                        >
                          <option value="ALL">✓ Todos os Períodos</option>
                          <option value="EXPIRED">🔴 Expirados</option>
                          <option value="30_DAYS">🟠 0-30 dias</option>
                          <option value="60_DAYS">🟡 31-60 dias</option>
                          <option value="90_DAYS">🔵 61-90 dias</option>
                          <option value="180_DAYS">🟢 91-180 dias</option>
                          <option value="SAFE">✅ Mais de 180 dias</option>
                        </select>
                      </div>
                    </div>


                    {/* Contador de Filtros Disponíveis */}
                    {!loadingFilters && (
                      <div className="mt-4 p-4 bg-white rounded-xl border-2 border-blue-200 shadow-sm">
                        <div className="flex items-center gap-2 text-sm text-blue-800 flex-wrap">
                          <ChartBarIcon className="w-5 h-5 text-blue-600" />
                          <span className="font-bold">Dados Disponíveis:</span>
                          <span className="px-2 py-1 bg-blue-100 rounded-lg font-bold">{availableFilters.statuses.length} status</span>
                          <span className="text-gray-400">•</span>
                          <span className="px-2 py-1 bg-blue-100 rounded-lg font-bold">{availableFilters.sites.length} sites</span>
                          <span className="text-gray-400">•</span>
                          <span className="px-2 py-1 bg-blue-100 rounded-lg font-bold">{availableFilters.zones.length} zonas</span>
                          <span className="text-gray-400">•</span>
                          <span className="px-2 py-1 bg-blue-100 rounded-lg font-bold">{availableFilters.areas.length} áreas</span>
                          <span className="text-gray-400">•</span>
                          <span className="px-2 py-1 bg-blue-100 rounded-lg font-bold">{availableFilters.descriptions.length} tipos</span>
                          <span className="text-gray-400">•</span>
                          <span className="px-2 py-1 bg-blue-100 rounded-lg font-bold">{availableFilters.categories.length} categorias</span>
                          <span className="text-gray-400">•</span>
                          <span className="px-2 py-1 bg-blue-100 rounded-lg font-bold">{availableFilters.brands.length} marcas</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Filtro de Data - MELHORADO */}
                  <div className="p-6 bg-white border-t-2 border-gray-200">
                    <div className="mb-4">
                      <label className="block text-lg font-bold text-gray-900 mb-2 flex items-center gap-2">
                        <ClockIcon className="w-6 h-6 text-blue-600" />
                        Filtrar por Data de Expiração
                      </label>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                      {/* Data Inicial */}
                      <div className="space-y-2">
                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide">
                          Data Inicial
                        </label>
                        <input
                          type="datetime-local"
                          value={dateFilter.startDate}
                          onChange={(e) => setDateFilter({ ...dateFilter, startDate: e.target.value })}
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-medium hover:border-blue-300 transition-all"
                          max={dateFilter.endDate || undefined}
                        />
                      </div>

                      {/* Data Final */}
                      <div className="space-y-2">
                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide">
                          Data Final
                        </label>
                        <input
                          type="datetime-local"
                          value={dateFilter.endDate}
                          onChange={(e) => setDateFilter({ ...dateFilter, endDate: e.target.value })}
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-medium hover:border-blue-300 transition-all disabled:bg-gray-100 disabled:cursor-not-allowed"
                          min={dateFilter.startDate || undefined}
                          disabled={!dateFilter.startDate}
                        />
                      </div>

                      {/* Botões de Ação */}
                      <div className="flex gap-3">
                        <button
                          onClick={handleDateFilterApply}
                          disabled={!dateFilter.startDate || !dateFilter.endDate}
                          className={`flex-1 px-5 py-3 rounded-xl font-bold transition-all transform ${dateFilter.startDate && dateFilter.endDate
                            ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:scale-105'
                            : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                            }`}
                          title={!dateFilter.startDate || !dateFilter.endDate ? 'Preencha ambas as datas' : ''}
                        >
                          Aplicar
                        </button>

                        {(dateFilter.startDate || dateFilter.endDate) && (
                          <button
                            onClick={handleDateFilterClear}
                            className="px-5 py-3 bg-red-100 hover:bg-red-200 text-red-700 rounded-xl font-bold transition-all transform hover:scale-105"
                          >
                            Limpar
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Indicador de Filtro Ativo */}
                    {dateFilter.startDate && dateFilter.endDate && (
                      <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl shadow-sm animate-in fade-in slide-in-from-top-2 duration-200">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3 text-sm text-blue-900 flex-1">
                            <div className="bg-blue-500 p-2 rounded-lg">
                              <ClockIcon className="w-5 h-5 text-white" />
                            </div>
                            <span className="font-bold">
                              Filtrando entre {new Date(dateFilter.startDate).toLocaleString('pt-BR', {
                                day: '2-digit',
                                month: '2-digit',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })} e {new Date(dateFilter.endDate).toLocaleString('pt-BR', {
                                day: '2-digit',
                                month: '2-digit',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                          </div>
                          <button
                            onClick={handleDateFilterClear}
                            className="text-blue-600 hover:text-blue-800 text-sm font-bold hover:underline ml-4"
                          >
                            Remover
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Badge de Filtros Ativos */}
                  {(filters.status !== 'ALL' || filters.site !== 'ALL' || filters.certificateType !== 'ALL' || filters.expirationRange !== 'ALL' || filters.zone !== 'ALL' || filters.area !== 'ALL') && (
                    <div className="px-6 py-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-t-2 border-blue-200">
                      <div className="flex items-center gap-2 text-sm">
                        <span className="flex items-center gap-2 px-3 py-2 bg-blue-500 text-white rounded-lg font-bold shadow-md">
                          <FunnelIcon className="w-4 h-4" />
                          Filtros Ativos
                        </span>
                        <span className="text-gray-600 font-medium">Visualizando dados filtrados</span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            <style>{`
    @keyframes fade-in {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    
    @keyframes slide-in-from-top-2 {
      from { transform: translateY(-0.5rem); }
      to { transform: translateY(0); }
    }
    
    @keyframes zoom-in-95 {
      from { transform: scale(0.95); }
      to { transform: scale(1); }
    }
    
    .animate-in {
      animation-duration: 200ms;
      animation-fill-mode: both;
    }
    
    .fade-in {
      animation-name: fade-in;
    }
    
    .slide-in-from-top-2 {
      animation-name: slide-in-from-top-2;
    }
    
    .zoom-in-95 {
      animation-name: zoom-in-95;
    }
  `}</style>



            <div className="bg-white rounded-lg shadow overflow-hidden mx-4">

              <div className="overflow-x-auto">
                <div className="max-h-[550px] overflow-y-auto">

                  <table className="min-w-full w-full table-fixed">
                    <thead className="bg-gray-50 border-b sticky top-0 z-10">
                      <tr>
                        <th className="w-48 px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                          <div className="flex items-center">
                            Site
                            <ColumnFilterDropdown column="Home_site_name" displayName="Site" />
                          </div>
                        </th>
                        <th className="w-48 px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                          Área
                        </th>
                        <th className="w-48 px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                          Zona
                        </th>
                        <th
                          className="w-56 px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wide cursor-pointer hover:bg-gray-100"
                          onClick={() => handleSort('certificate_description')}
                        >
                          <div className="flex items-center">
                            Certificado {sortBy === 'certificate_description' && (sortOrder === 'ASC' ? '↑' : '↓')}
                            <ColumnFilterDropdown column="certificate_description" displayName="Certificado" />
                          </div>
                        </th>
                        <th className="w-40 px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                          <div className="flex items-center">
                            Código
                          </div>
                        </th>
                        <th
                          className="w-72 px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wide cursor-pointer hover:bg-gray-100"
                          onClick={() => handleSort('item_name')}
                        >
                          <div className="flex items-center">
                            Item {sortBy === 'item_name' && (sortOrder === 'ASC' ? '↑' : '↓')}
                            <ColumnFilterDropdown column="item_name" displayName="Item" />
                          </div>
                        </th>
                        <th className="w-40 px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                          <div className="flex items-center">
                            Marca
                            <ColumnFilterDropdown column="brand" displayName="Marca" />
                          </div>
                        </th>
                        <th className="w-40 px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                          <div className="flex items-center">
                            Modelo
                            <ColumnFilterDropdown column="model" displayName="Modelo" />
                          </div>
                        </th>
                        <th className="w-48 px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                          <div className="flex items-center">
                            Serial
                            <ColumnFilterDropdown column="serial" displayName="Serial" />
                          </div>
                        </th>
                        <th
                          className="w-40 px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wide cursor-pointer hover:bg-gray-100"
                          onClick={() => handleSort('expiration_date')}
                        >
                          Expiração {sortBy === 'expiration_date' && (sortOrder === 'ASC' ? '↑' : '↓')}
                        </th>
                        <th className="w-32 px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wide">
                          Dias p/ Expirar
                        </th>
                        <th className="w-40 px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                          <div className="flex items-center">
                            Status
                            <ColumnFilterDropdown column="certificate_status_name" displayName="Status" />
                          </div>
                        </th>
                        <th className="w-36 px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wide">
                          Criticidade
                        </th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-gray-200 bg-white">
                      {/* Loading no meio da tabela */}
                      {(loading || loadingAnalysis) ? (
                        <tr>
                          <td colSpan={13} className="px-3 py-12 text-center">
                            <div className="flex flex-col items-center justify-center">
                              <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-3"></div>
                              <p className="text-gray-600 text-sm font-medium">
                                {loadingAnalysis ? 'Carregando análise crítica...' : 'Carregando certificados...'}
                              </p>
                            </div>
                          </td>
                        </tr>
                      ) : filteredData.length === 0 ? (
                        <tr>
                          <td colSpan={13} className="px-3 py-8 text-center">
                            <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-gray-100 mb-2">
                              <ExclamationTriangleIcon className="w-5 h-5 text-gray-400" />
                            </div>
                            <p className="text-gray-500 text-xs font-medium">Nenhum certificado encontrado.</p>
                            <p className="text-gray-400 text-xs mt-1">Tente ajustar os filtros de busca</p>
                          </td>
                        </tr>
                      ) : (
                        filteredData.map((item, index) => {
                          const daysUntilExpiration = getDaysUntilExpiration(item.expiration_date);
                          const criticalityBadge = getCriticalityBadge(daysUntilExpiration);

                          return (
                            <tr
                              key={item.id}
                              className={`hover:bg-blue-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                                }`}
                            >
                              {/* ... células da tabela ... */}
                              <td className="px-3 py-2">
                                <div className="text-xs font-medium text-gray-900 leading-none">{item.Home_site_name}</div>
                              </td>
                              <td className="px-3 py-2">
                                <div className="text-xs font-semibold text-gray-800 leading-none">
                                  {item.code_zone}
                                </div>
                              </td>
                              <td className="px-3 py-2">
                                <div className="text-xs text-gray-600 leading-none">
                                  {item.code_area}
                                </div>
                              </td>
                              <td className="px-3 py-2">
                                <div className="text-xs font-medium text-gray-900 leading-none">{item.certificate_description}</div>
                              </td>
                              <td className="px-3 py-2">
                                <div className="text-xs font-mono font-medium text-gray-900 bg-gray-100 px-1.5 py-0.5 rounded inline-block leading-none">
                                  {item.item_code}
                                </div>
                              </td>
                              <td className="px-3 py-2">
                                <div className="text-xs font-medium text-gray-900 leading-none">{item.item_name}</div>
                              </td>
                              <td className="px-3 py-2">
                                <div className="text-xs text-gray-700 leading-none">
                                  {item.brand || <span className="text-gray-400 italic">-</span>}
                                </div>
                              </td>
                              <td className="px-3 py-2">
                                <div className="text-xs text-gray-700 leading-none">
                                  {item.model || <span className="text-gray-400 italic">-</span>}
                                </div>
                              </td>
                              <td className="px-3 py-2">
                                <div className="text-xs font-mono text-gray-900 bg-gray-100 px-1.5 py-0.5 rounded inline-block leading-none">
                                  {item.serial}
                                </div>
                              </td>
                              <td className="px-3 py-2 whitespace-nowrap">
                                <div className="text-xs font-medium text-gray-900 leading-none">
                                  {formatDate(item.expiration_date)} {new Date(item.expiration_date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                                </div>
                              </td>
                              <td className="px-3 py-2 text-center">
                                <span className={`inline-flex items-center justify-center px-1.5 py-0.5 rounded-full text-xs font-bold leading-none ${daysUntilExpiration < 0
                                  ? 'bg-red-100 text-red-800 border border-red-200'
                                  : daysUntilExpiration < 30
                                    ? 'bg-orange-100 text-orange-800 border border-orange-200'
                                    : daysUntilExpiration < 90
                                      ? 'bg-yellow-100 text-yellow-800 border border-yellow-200'
                                      : daysUntilExpiration < 180
                                        ? 'bg-blue-100 text-blue-800 border border-blue-200'
                                        : 'bg-green-100 text-green-800 border border-green-200'
                                  }`}>
                                  {daysUntilExpiration} dias
                                </span>
                              </td>
                              <td className="px-3 py-2">
                                <div className="flex items-center gap-1.5">
                                  {getStatusIcon(item.certificate_status_name)}
                                  <span className="text-xs font-medium leading-none">{translateStatus(item.certificate_status_name)}</span>
                                </div>
                              </td>
                              <td className="px-3 py-2 text-center">
                                <span className={`inline-flex items-center justify-center gap-1 px-1.5 py-1 rounded text-xs font-bold shadow-sm leading-none ${criticalityBadge.color}`}>
                                  {criticalityBadge.icon}
                                  {criticalityBadge.label}
                                </span>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {filteredData.length === 0 && (
                <div className="text-center py-8">
                  <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-gray-100 mb-2">
                    <ExclamationTriangleIcon className="w-5 h-5 text-gray-400" />
                  </div>
                  {
                    loading || loadingAnalysis && (
                      <div className="flex items-center justify-center min-h-screen">
                        <div className="text-center">
                          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                          <p className="text-gray-600">Carregando análise crítica...</p>
                        </div>
                      </div>
                    )
                  }
                  <p className="text-gray-500 text-xs font-medium">Nenhum certificado encontrado.</p>
                  <p className="text-gray-400 text-xs mt-1">Tente ajustar os filtros de busca</p>
                </div>
              )}

              <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-4 py-2 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex-1 flex justify-between sm:hidden">
                    <button
                      onClick={() => handlePageChange(pagination.currentPage - 1)}
                      disabled={!pagination.hasPreviousPage}
                      className={`px-3 py-1.5 border rounded text-xs font-medium transition-all ${pagination.hasPreviousPage
                        ? 'text-gray-700 bg-white hover:bg-gray-50 border-gray-300 shadow-sm'
                        : 'text-gray-400 bg-gray-100 cursor-not-allowed border-gray-200'
                        }`}
                    >
                      Anterior
                    </button>
                    <button
                      onClick={() => handlePageChange(pagination.currentPage + 1)}
                      disabled={!pagination.hasNextPage}
                      className={`ml-2 px-3 py-1.5 border rounded text-xs font-medium transition-all ${pagination.hasNextPage
                        ? 'text-gray-700 bg-white hover:bg-gray-50 border-gray-300 shadow-sm'
                        : 'text-gray-400 bg-gray-100 cursor-not-allowed border-gray-200'
                        }`}
                    >
                      Próxima
                    </button>
                  </div>
                  <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                    <div>
                      <p className="text-xs text-gray-700 font-medium">
                        Mostrando{' '}
                        <span className="font-bold text-blue-600">
                          {(pagination.currentPage - 1) * pagination.itemsPerPage + 1}
                        </span>{' '}
                        até{' '}
                        <span className="font-bold text-blue-600">
                          {Math.min(pagination.currentPage * pagination.itemsPerPage, pagination.totalItems)}
                        </span>{' '}
                        de{' '}
                        <span className="font-bold text-gray-900">{pagination.totalItems}</span> resultados
                      </p>
                    </div>
                    <div>
                      <nav className="relative z-0 inline-flex rounded-lg shadow-sm -space-x-px">
                        <button
                          onClick={() => handlePageChange(pagination.currentPage - 1)}
                          disabled={!pagination.hasPreviousPage}
                          className={`relative inline-flex items-center px-2 py-1 rounded-l-lg border text-xs font-medium transition-all ${pagination.hasPreviousPage
                            ? 'text-gray-700 bg-white hover:bg-gray-50 border-gray-300'
                            : 'text-gray-300 bg-gray-100 cursor-not-allowed border-gray-200'
                            }`}
                        >
                          <ChevronLeftIcon className="h-3 w-3" />
                        </button>

                        {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                          let pageNumber;
                          if (pagination.totalPages <= 5) {
                            pageNumber = i + 1;
                          } else if (pagination.currentPage <= 3) {
                            pageNumber = i + 1;
                          } else if (pagination.currentPage >= pagination.totalPages - 2) {
                            pageNumber = pagination.totalPages - 4 + i;
                          } else {
                            pageNumber = pagination.currentPage - 2 + i;
                          }

                          return (
                            <button
                              key={pageNumber}
                              onClick={() => handlePageChange(pageNumber)}
                              className={`relative inline-flex items-center px-2 py-1 border text-xs font-semibold transition-all ${pagination.currentPage === pageNumber
                                ? 'z-10 bg-blue-600 border-blue-600 text-white shadow-md'
                                : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                                }`}
                            >
                              {pageNumber}
                            </button>
                          );
                        })}

                        <button
                          onClick={() => handlePageChange(pagination.currentPage + 1)}
                          disabled={!pagination.hasNextPage}
                          className={`relative inline-flex items-center px-2 py-1 rounded-r-lg border text-xs font-medium transition-all ${pagination.hasNextPage
                            ? 'text-gray-700 bg-white hover:bg-gray-50 border-gray-300'
                            : 'text-gray-300 bg-gray-100 cursor-not-allowed border-gray-200'
                            }`}
                        >
                          <ChevronRightIcon className="h-3 w-3" />
                        </button>
                      </nav>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

