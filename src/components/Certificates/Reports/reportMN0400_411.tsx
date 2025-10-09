import { useState, useEffect, useMemo, useRef } from 'react';
import { 
  MagnifyingGlassIcon, 
  FunnelIcon, 
  ArrowDownTrayIcon, 
  ExclamationTriangleIcon, 
  CheckCircleIcon, 
  XCircleIcon, 
  ClockIcon, 
  ChevronLeftIcon, 
  ChevronRightIcon
} from '@heroicons/react/24/outline';

interface CertificateReport {
  item_name: string;
  item_code: string;
  certificate_type: string;
  certificate_description: string;
  category_name: string;
  certificate_status_name: string;
  Home_Area_city: string;
  Home_Area_State: string;
  Home_site_name: string;
  validity_status: string;
  days_until_expiration: number;
  expiration_date: string;
  issue_date: string;
  renewal_urgency_level: string;
  combined_risk_score: string;
  compliance_score: number;
  operational_impact_score: number;
  expiration_risk_score: number;
  ai_recommendation: string;
  recommended_action: string;
  action_priority: number;
  needs_immediate_action: number;
  recertification_probability: number;
  renewal_probability_score: number;
  automation_readiness_score: number;
  pattern_confidence_score: number;
  asset_value_at_risk: string;
  financial_risk_value: string;
  purchase_cost: string;
  purchase_currency: string;
  issuer_company_name: string;
  issuer_reliability_score: number;
  automation_candidate: number;
  trend_direction: string;
  risk_trend: string;
  brand: string;
  model: string;
  serial: string;
  custody_name: string;
  custody_email: string;
  department_name: string;
  cost_center_name: string;
  is_expiring_this_week: number;
  is_expiring_90_days: number;
  is_expired: number;
  is_high_value_asset: number;
  is_critical_compliance: number;
  in_optimal_renewal_window: number;
  concurrent_renewals_same_period: number;
  department_workload_index: number;
  resource_availability_score: number;
  recommended_start_date: string;
  days_until_recommended_start: number;
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



export default function CertificateReportGrid() {
  const [data, setData] = useState<CertificateReport[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo>({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10,
    hasNextPage: false,
    hasPreviousPage: false
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    validityStatus: 'ALL',
    urgencyLevel: 'ALL',
    riskTrend: 'ALL',
    location: 'ALL',
    certificateType: 'ALL',
    needsAction: 'ALL'
  });
  const [columnFilters, setColumnFilters] = useState<Record<string, string[]>>({});
  const [activeColumnFilter, setActiveColumnFilter] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState('action_priority');
  const [sortOrder, setSortOrder] = useState<'ASC' | 'DESC'>('DESC');
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportType, setExportType] = useState<'excel' | 'pdf'>('excel');
  const companyId = 10;
  const filterRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const fetchData = async (page: number = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: itemsPerPage.toString(),
        sortBy,
        sortOrder
      });

      const response = await fetch(
        `http://localhost:3306/api/dashboard/certificates/reports/${companyId}?${params}`
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
  }, [itemsPerPage, sortBy, sortOrder]);

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
        item.certificate_type.toLowerCase().includes(searchTerm.toLowerCase());

      const matchValidity = filters.validityStatus === 'ALL' || item.validity_status === filters.validityStatus;
      const matchUrgency = filters.urgencyLevel === 'ALL' || item.renewal_urgency_level === filters.urgencyLevel;
      const matchRisk = filters.riskTrend === 'ALL' || item.risk_trend === filters.riskTrend;
      const matchLocation = filters.location === 'ALL' || item.Home_Area_city === filters.location;
      const matchCertType = filters.certificateType === 'ALL' || item.certificate_type === filters.certificateType;
      const matchAction = filters.needsAction === 'ALL' || 
        (filters.needsAction === 'YES' && item.needs_immediate_action === 1) ||
        (filters.needsAction === 'NO' && item.needs_immediate_action === 0);

      const matchColumnFilters = Object.entries(columnFilters).every(([column, values]) => {
        if (values.length === 0) return true;
        const itemValue = String(item[column as keyof CertificateReport]);
        return values.includes(itemValue);
      });

      return matchSearch && matchValidity && matchUrgency && matchRisk && matchLocation && matchCertType && matchAction && matchColumnFilters;
    });
  }, [data, searchTerm, filters, columnFilters]);

  const uniqueValues = useMemo(() => ({
    locations: Array.from(new Set(data.map(item => item.Home_Area_city))).filter(Boolean),
    certificateTypes: Array.from(new Set(data.map(item => item.certificate_type))).filter(Boolean),
  }), [data]);

  const stats = useMemo(() => ({
    total: filteredData.length,
    expired: filteredData.filter(item => item.is_expired === 1).length,
    expiringSoon: filteredData.filter(item => item.is_expiring_90_days === 1).length,
    needsAction: filteredData.filter(item => item.needs_immediate_action === 1).length,
    highRisk: filteredData.filter(item => item.risk_trend === 'HIGH_RISK').length,
  }), [filteredData]);

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
          `https://api-dashboards-u1oh.onrender.com/api/dashboard/certificates/reports/${companyId}?${params}`
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
        'Status', 'Nome do Item', 'Código', 'Tipo de Certificado', 'Descrição',
        'Categoria', 'Cidade', 'Estado', 'Dias até Expiração', 'Data de Expiração',
        'Urgência', 'Risco', 'Prioridade', 'Ação Imediata', 'Recomendação IA',
        'Ação Recomendada', 'Valor em Risco', 'Responsável', 'Email', 'Departamento'
      ];
      
      const dataRows = dataToExport.map(item => [
        item.validity_status,
        item.item_name,
        item.item_code,
        item.certificate_type,
        item.certificate_description,
        item.category_name,
        item.Home_Area_city,
        item.Home_Area_State,
        item.days_until_expiration,
        formatDate(item.expiration_date),
        item.renewal_urgency_level,
        item.risk_trend,
        item.action_priority,
        item.needs_immediate_action === 1 ? 'Sim' : 'Não',
        item.ai_recommendation,
        item.recommended_action,
        item.asset_value_at_risk,
        item.custody_name,
        item.custody_email,
        item.department_name
      ]);

      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.aoa_to_sheet([headers, ...dataRows]);

      const colWidths = headers.map(() => ({ wch: 20 }));
      ws['!cols'] = colWidths;

      XLSX.utils.book_append_sheet(wb, ws, 'Certificados');

      const summaryData = [
        { 'Métrica': 'Total de Certificados', 'Valor': dataToExport.length },
        { 'Métrica': 'Certificados Expirados', 'Valor': dataToExport.filter(item => item.is_expired === 1).length },
        { 'Métrica': 'Expirando em 90 Dias', 'Valor': dataToExport.filter(item => item.is_expiring_90_days === 1).length },
        { 'Métrica': 'Necessitam Ação', 'Valor': dataToExport.filter(item => item.needs_immediate_action === 1).length },
        { 'Métrica': 'Alto Risco', 'Valor': dataToExport.filter(item => item.risk_trend === 'HIGH_RISK').length },
        { 'Métrica': 'Data de Exportação', 'Valor': new Date().toLocaleString('pt-BR') }
      ];

      const wsSummary = XLSX.utils.json_to_sheet(summaryData);
      wsSummary['!cols'] = [{ wch: 30 }, { wch: 20 }];
      XLSX.utils.book_append_sheet(wb, wsSummary, 'Resumo');

      const fileName = `certificate-report-${new Date().toISOString().split('T')[0]}.xlsx`;
      XLSX.writeFile(wb, fileName);
    }).catch(error => {
      console.error('Erro ao carregar biblioteca XLSX:', error);
      alert('Erro ao exportar para Excel.');
    });
  };


const exportPDF = async (dataToExport: CertificateReport[]) => {
  try {
    const { jsPDF } = await import('jspdf');
    
    // Usar tipo específico do jsPDF
    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4'
    }) as import('jspdf').jsPDF;

    // Configurações da página - CORREÇÃO AQUI
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 10;
    let yPosition = margin;

    // Cores
    const primaryColor = [37, 99, 235]; // Azul
    const lightGray = [245, 247, 250];
    const darkGray = [107, 114, 128];

    // Título principal
    doc.setFontSize(20);
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.text('Certificate Analytics Report', margin, yPosition);
    yPosition += 8;

    // Subtítulo e data
    doc.setFontSize(10);
    doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
    doc.text('Análise Preditiva de Certificados', margin, yPosition);
    doc.text(`Data de exportação: ${new Date().toLocaleDateString('pt-BR')} ${new Date().toLocaleTimeString('pt-BR')}`, pageWidth - margin, yPosition, { align: 'right' });
    yPosition += 15;

    // Estatísticas
    doc.setFontSize(9);
    doc.setTextColor(0, 0, 0);
    
    const stats = [
      `Total: ${dataToExport.length}`,
      `Expirados: ${dataToExport.filter(item => item.is_expired === 1).length}`,
      `Expirando em 90 dias: ${dataToExport.filter(item => item.is_expiring_90_days === 1).length}`,
      `Ação Imediata: ${dataToExport.filter(item => item.needs_immediate_action === 1).length}`,
      `Alto Risco: ${dataToExport.filter(item => item.risk_trend === 'HIGH_RISK').length}`
    ];

    stats.forEach((stat, index) => {
      const x = margin + (index * ((pageWidth - 2 * margin) / stats.length));
      doc.text(stat, x, yPosition);
    });
    
    yPosition += 12;

    // Cabeçalho da tabela
    const headers = [
      { text: 'Status', width: 15 },
      { text: 'Item', width: 35 },
      { text: 'Certificado', width: 30 },
      { text: 'Categoria', width: 25 },
      { text: 'Localização', width: 25 },
      { text: 'Dias', width: 12 },
      { text: 'Risco', width: 18 },
      { text: 'Prior.', width: 12 },
      { text: 'Valor Risco', width: 22 },
      { text: 'Ação Recomendada', width: 35 }
    ];

    // Desenhar cabeçalho
    doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.rect(margin, yPosition, pageWidth - 2 * margin, 8, 'F');
    
    doc.setFontSize(8);
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');

    let xPosition = margin + 2;
    headers.forEach(header => {
      doc.text(header.text, xPosition, yPosition + 5);
      xPosition += header.width;
    });

    yPosition += 10;
    doc.setFont('helvetica', 'normal');

    // Dados da tabela
    doc.setFontSize(7);
    doc.setTextColor(0, 0, 0);

    dataToExport.forEach((item, index) => {
      // Verificar se precisa de nova página
      if (yPosition > pageHeight - 15) {
        doc.addPage();
        yPosition = margin;
        
        // Redesenhar cabeçalho na nova página
        doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
        doc.rect(margin, yPosition, pageWidth - 2 * margin, 8, 'F');
        
        doc.setFontSize(8);
        doc.setTextColor(255, 255, 255);
        doc.setFont('helvetica', 'bold');
        
        xPosition = margin + 2;
        headers.forEach(header => {
          doc.text(header.text, xPosition, yPosition + 5);
          xPosition += header.width;
        });
        
        yPosition += 10;
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7);
        doc.setTextColor(0, 0, 0);
      }

      // Cor de fundo alternada para linhas
      if (index % 2 === 0) {
        doc.setFillColor(lightGray[0], lightGray[1], lightGray[2]);
        doc.rect(margin, yPosition - 3, pageWidth - 2 * margin, 6, 'F');
      }

      // Dados da linha
      const rowData = [
        item.validity_status,
        truncateText(item.item_name, 30),
        truncateText(item.certificate_type, 25),
        truncateText(item.category_name, 20),
        truncateText(item.Home_Area_city, 20),
        item.days_until_expiration.toString(),
        item.risk_trend.replace('_RISK', ''),
        item.action_priority.toString(),
        formatCurrency(item.asset_value_at_risk, item.purchase_currency),
        truncateText(item.recommended_action, 40)
      ];

      xPosition = margin + 2;
      rowData.forEach((data, colIndex) => {
        // Configurações específicas por coluna
        let align: "left" | "center" | "right" = "left";
        if (colIndex === 5 || colIndex === 7) align = "center";
        if (colIndex === 8) align = "right";

        doc.text(data, xPosition, yPosition, { align });
        xPosition += headers[colIndex].width;
      });

      yPosition += 6;
    });

    // Adicionar página de resumo se houver dados
    if (dataToExport.length > 0) {
      doc.addPage();
      yPosition = margin;

      // Título do resumo
      doc.setFontSize(16);
      doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.setFont('helvetica', 'bold');
      doc.text('Resumo Detalhado', margin, yPosition);
      yPosition += 10;

      // Estatísticas detalhadas
      const detailedStats = [
        ['Total de Certificados', dataToExport.length.toString()],
        ['Certificados Expirados', dataToExport.filter(item => item.is_expired === 1).length.toString()],
        ['Expirando em 90 Dias', dataToExport.filter(item => item.is_expiring_90_days === 1).length.toString()],
        ['Necessitam Ação Imediata', dataToExport.filter(item => item.needs_immediate_action === 1).length.toString()],
        ['Alto Risco', dataToExport.filter(item => item.risk_trend === 'HIGH_RISK').length.toString()],
        ['Médio Risco', dataToExport.filter(item => item.risk_trend === 'MEDIUM_RISK').length.toString()],
        ['Baixo Risco', dataToExport.filter(item => item.risk_trend === 'LOW_RISK').length.toString()],
        ['Ativos de Alto Valor', dataToExport.filter(item => item.is_high_value_asset === 1).length.toString()],
        ['Compliance Crítico', dataToExport.filter(item => item.is_critical_compliance === 1).length.toString()],
        ['Prontos para Renovação', dataToExport.filter(item => item.in_optimal_renewal_window === 1).length.toString()]
      ];

      doc.setFontSize(10);
      doc.setTextColor(0, 0, 0);
      doc.setFont('helvetica', 'normal');

      detailedStats.forEach(([label, value], index) => {
        if (yPosition > pageHeight - 15) {
          doc.addPage();
          yPosition = margin;
        }

        // Cor de fundo alternada
        if (index % 2 === 0) {
          doc.setFillColor(lightGray[0], lightGray[1], lightGray[2]);
          doc.rect(margin, yPosition - 2, pageWidth - 2 * margin, 6, 'F');
        }

        doc.text(label, margin + 5, yPosition);
        doc.text(value, pageWidth - margin - 5, yPosition, { align: 'right' });
        yPosition += 6;
      });
    }

    // Adicionar numeração de páginas em todas as páginas - CORREÇÃO AQUI
    // const totalPages = doc.internal.getNumberOfPages();
    // for (let i = 1; i <= totalPages; i++) {
    //   doc.setPage(i);
    //   doc.setFontSize(8);
    //   doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
    //   doc.text(
    //     `Página ${i} de ${totalPages}`,
    //     pageWidth / 2,
    //     pageHeight - 5,
    //     { align: 'center' }
    //   );
    // }

    // Salvar o arquivo
    const fileName = `certificate-report-${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(fileName);

  } catch (error) {
    console.error('Erro ao gerar PDF:', error);
    alert('Erro ao exportar para PDF. Tente novamente.');
  }
};

// Função auxiliar para truncar texto
const truncateText = (text: string, maxLength: number): string => {
  if (!text) return '';
  return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
};

// Função para formatar moeda
const formatCurrency = (value: string, currency: string): string => {
  if (!value) return 'R$ 0,00';
  
  try {
    const numericValue = parseFloat(value);
    if (isNaN(numericValue)) return 'R$ 0,00';
    
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: currency || 'BRL'
    }).format(numericValue);
  } catch {
    return 'R$ 0,00';
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
          className={`ml-1 p-1 rounded hover:bg-gray-200 ${isFiltered ? 'text-blue-600' : 'text-gray-400'}`}
        >
          <FunnelIcon className="w-4 h-4" />
        </button>
        
        {activeColumnFilter === column && (
          <div className="absolute top-full left-0 mt-1 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
            <div className="p-3 border-b">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Filtrar por {displayName}</span>
                {isFiltered && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      clearColumnFilter(column);
                    }}
                    className="text-xs text-blue-600 hover:text-blue-800"
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
                  className="w-full pl-8 pr-3 py-1.5 text-sm border rounded focus:ring-2 focus:ring-blue-500"
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
                    className="flex items-center px-2 py-1.5 hover:bg-gray-50 rounded cursor-pointer"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <input
                      type="checkbox"
                      checked={selectedValues.includes(value)}
                      onChange={() => handleColumnFilterChange(column, value)}
                      className="mr-2 rounded"
                    />
                    <span className="text-sm truncate">{value}</span>
                  </label>
                ))
              )}
            </div>
            
            <div className="p-2 border-t bg-gray-50 text-xs text-gray-600">
              {isFiltered ? `${selectedValues.length} de ${uniqueValues.length} selecionado(s)` : `${uniqueValues.length} disponível(is)`}
            </div>
          </div>
        )}
      </div>
    );
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'EXPIRED':
        return <XCircleIcon className="w-5 h-5 text-red-500" />;
      case 'VALID':
        return <CheckCircleIcon className="w-5 h-5 text-green-500" />;
      default:
        return <ClockIcon className="w-5 h-5 text-yellow-500" />;
    }
  };

  const getRiskBadgeColor = (risk: string) => {
    switch (risk) {
      case 'HIGH_RISK':
        return 'bg-red-100 text-red-800';
      case 'MEDIUM_RISK':
        return 'bg-yellow-100 text-yellow-800';
      case 'LOW_RISK':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

//   const formatCurrencys = (value: string, currency: string) => {
//     return new Intl.NumberFormat('pt-BR', {
//       style: 'currency',
//       currency: currency || 'BRL'
//     }).format(parseFloat(value));
//   };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Certificate Analytics Report</h1>
          <p className="text-gray-600">Análise preditiva de certificados</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-sm text-gray-600 mb-1">Total</div>
            <div className="text-2xl font-bold text-gray-900">{pagination.totalItems}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-sm text-gray-600 mb-1">Expirados</div>
            <div className="text-2xl font-bold text-red-600">{stats.expired}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-sm text-gray-600 mb-1">Expira 90d</div>
            <div className="text-2xl font-bold text-yellow-600">{stats.expiringSoon}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-sm text-gray-600 mb-1">Ação Imediata</div>
            <div className="text-2xl font-bold text-orange-600">{stats.needsAction}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-sm text-gray-600 mb-1">Alto Risco</div>
            <div className="text-2xl font-bold text-red-600">{stats.highRisk}</div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow mb-6 p-4">
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <div className="flex-1 relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Buscar..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex gap-2">
              <select
                value={itemsPerPage}
                onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
                className="px-3 py-2 border rounded-lg"
              >
                <option value={10}>10 / pág</option>
                <option value={25}>25 / pág</option>
                <option value={50}>50 / pág</option>
                <option value={100}>100 / pág</option>
              </select>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg"
              >
                <FunnelIcon className="w-5 h-5" />
                Filtros
              </button>
              <button
                onClick={exportToExcel}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
              >
                <ArrowDownTrayIcon className="w-5 h-5" />
                Excel
              </button>
              <button
                onClick={exportToPDF}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg"
              >
                <ArrowDownTrayIcon className="w-5 h-5" />
                PDF
              </button>
            </div>
          </div>

          {showExportModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Exportar para {exportType === 'excel' ? 'Excel' : 'PDF'}
                </h3>
                <p className="text-gray-600 mb-6">
                  Escolha como deseja exportar:
                </p>
                
                <div className="space-y-3 mb-6">
                  <button
                    onClick={() => handleExport(false)}
                    className="w-full flex items-start gap-3 p-4 border-2 border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50"
                  >
                    <div className="flex-shrink-0 mt-1">
                      <FunnelIcon className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="text-left">
                      <div className="font-medium text-gray-900">Dados Filtrados</div>
                      <div className="text-sm text-gray-600">
                        Exportar {filteredData.length} registros visíveis
                      </div>
                    </div>
                  </button>

                  <button
                    onClick={() => handleExport(true)}
                    className="w-full flex items-start gap-3 p-4 border-2 border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50"
                  >
                    <div className="flex-shrink-0 mt-1">
                      <ArrowDownTrayIcon className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="text-left">
                      <div className="font-medium text-gray-900">Todos os Dados</div>
                      <div className="text-sm text-gray-600">
                        Exportar todos os {pagination.totalItems} registros
                      </div>
                    </div>
                  </button>
                </div>

                <button
                  onClick={() => setShowExportModal(false)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancelar
                </button>
              </div>
            </div>
          )}

          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
              <select
                value={filters.validityStatus}
                onChange={(e) => setFilters({...filters, validityStatus: e.target.value})}
                className="px-3 py-2 border rounded-lg"
              >
                <option value="ALL">Status - Todos</option>
                <option value="VALID">Válido</option>
                <option value="EXPIRED">Expirado</option>
                <option value="EXPIRING_SOON">Expirando</option>
              </select>

              <select
                value={filters.urgencyLevel}
                onChange={(e) => setFilters({...filters, urgencyLevel: e.target.value})}
                className="px-3 py-2 border rounded-lg"
              >
                <option value="ALL">Urgência - Todas</option>
                <option value="EXPIRED">Expirado</option>
                <option value="CRITICAL">Crítico</option>
                <option value="HIGH">Alto</option>
                <option value="MEDIUM">Médio</option>
                <option value="LOW">Baixo</option>
              </select>

              <select
                value={filters.riskTrend}
                onChange={(e) => setFilters({...filters, riskTrend: e.target.value})}
                className="px-3 py-2 border rounded-lg"
              >
                <option value="ALL">Risco - Todos</option>
                <option value="HIGH_RISK">Alto</option>
                <option value="MEDIUM_RISK">Médio</option>
                <option value="LOW_RISK">Baixo</option>
              </select>

              <select
                value={filters.location}
                onChange={(e) => setFilters({...filters, location: e.target.value})}
                className="px-3 py-2 border rounded-lg"
              >
                <option value="ALL">Localização - Todas</option>
                {uniqueValues.locations.map(loc => (
                  <option key={loc} value={loc}>{loc}</option>
                ))}
              </select>

              <select
                value={filters.certificateType}
                onChange={(e) => setFilters({...filters, certificateType: e.target.value})}
                className="px-3 py-2 border rounded-lg"
              >
                <option value="ALL">Tipo - Todos</option>
                {uniqueValues.certificateTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>

              <select
                value={filters.needsAction}
                onChange={(e) => setFilters({...filters, needsAction: e.target.value})}
                className="px-3 py-2 border rounded-lg"
              >
                <option value="ALL">Ação Imediata - Todos</option>
                <option value="YES">Sim</option>
                <option value="NO">Não</option>
              </select>
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b sticky top-0 z-10">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    <div className="flex items-center">
                      Status
                      <ColumnFilterDropdown column="validity_status" displayName="Status" />
                    </div>
                  </th>
                  <th 
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('item_name')}
                  >
                    <div className="flex items-center">
                      Item {sortBy === 'item_name' && (sortOrder === 'ASC' ? '↑' : '↓')}
                      <ColumnFilterDropdown column="item_name" displayName="Item" />
                    </div>
                  </th>
                  <th 
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('certificate_type')}
                  >
                    <div className="flex items-center">
                      Certificado {sortBy === 'certificate_type' && (sortOrder === 'ASC' ? '↑' : '↓')}
                      <ColumnFilterDropdown column="certificate_type" displayName="Certificado" />
                    </div>
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    <div className="flex items-center">
                      Categoria
                      <ColumnFilterDropdown column="category_name" displayName="Categoria" />
                    </div>
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    <div className="flex items-center">
                      Localização
                      <ColumnFilterDropdown column="Home_Area_city" displayName="Localização" />
                    </div>
                  </th>
                  <th 
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('days_until_expiration')}
                  >
                    Dias p/ Expirar {sortBy === 'days_until_expiration' && (sortOrder === 'ASC' ? '↑' : '↓')}
                  </th>
                  <th 
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('combined_risk_score')}
                  >
                    <div className="flex items-center">
                      Risco {sortBy === 'combined_risk_score' && (sortOrder === 'ASC' ? '↑' : '↓')}
                      <ColumnFilterDropdown column="risk_trend" displayName="Risco" />
                    </div>
                  </th>
                  <th 
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('action_priority')}
                  >
                    Prioridade {sortBy === 'action_priority' && (sortOrder === 'ASC' ? '↑' : '↓')}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Valor Risco</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    <div className="flex items-center">
                      Recomendação
                      <ColumnFilterDropdown column="recommended_action" displayName="Ação" />
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredData.map((item, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(item.validity_status)}
                        <span className="text-sm font-medium">{item.validity_status}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="text-sm font-medium text-gray-900">{item.item_name}</div>
                      <div className="text-xs text-gray-500">{item.item_code}</div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="text-sm font-medium text-gray-900">{item.certificate_type}</div>
                      <div className="text-xs text-gray-500">{item.certificate_description}</div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="text-sm text-gray-900">{item.category_name}</div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="text-sm text-gray-900">{item.Home_Area_city}</div>
                      <div className="text-xs text-gray-500">{item.Home_Area_State}</div>
                    </td>
                    <td className="px-4 py-4">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        item.days_until_expiration < 0 
                          ? 'bg-red-100 text-red-800' 
                          : item.days_until_expiration < 30 
                          ? 'bg-yellow-100 text-yellow-800' 
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {item.days_until_expiration} dias
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getRiskBadgeColor(item.risk_trend)}`}>
                        {item.risk_trend.replace('_', ' ')}
                      </span>
                      <div className="text-xs text-gray-500 mt-1">Score: {item.combined_risk_score}</div>
                    </td>
                    <td className="px-4 py-4 text-center">
                      {item.needs_immediate_action === 1 && (
                        <ExclamationTriangleIcon className="w-5 h-5 text-red-500 mx-auto" />
                      )}
                      <div className="text-xs font-medium mt-1">{item.action_priority}</div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        {formatCurrency(item.asset_value_at_risk, item.purchase_currency)}
                      </div>
                    </td>
                    <td className="px-4 py-4 max-w-xs">
                      <div className="text-sm text-gray-700 truncate" title={item.ai_recommendation}>
                        {item.ai_recommendation}
                      </div>
                      <div className="text-xs text-blue-600 font-medium mt-1">{item.recommended_action}</div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredData.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">Nenhum certificado encontrado.</p>
            </div>
          )}

          <div className="bg-gray-50 px-4 py-3 border-t">
            <div className="flex items-center justify-between">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() => handlePageChange(pagination.currentPage - 1)}
                  disabled={!pagination.hasPreviousPage}
                  className={`px-4 py-2 border rounded-md ${
                    pagination.hasPreviousPage
                      ? 'text-gray-700 bg-white hover:bg-gray-50'
                      : 'text-gray-400 bg-gray-100 cursor-not-allowed'
                  }`}
                >
                  Anterior
                </button>
                <button
                  onClick={() => handlePageChange(pagination.currentPage + 1)}
                  disabled={!pagination.hasNextPage}
                  className={`ml-3 px-4 py-2 border rounded-md ${
                    pagination.hasNextPage
                      ? 'text-gray-700 bg-white hover:bg-gray-50'
                      : 'text-gray-400 bg-gray-100 cursor-not-allowed'
                  }`}
                >
                  Próxima
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Mostrando{' '}
                    <span className="font-medium">
                      {(pagination.currentPage - 1) * pagination.itemsPerPage + 1}
                    </span>{' '}
                    até{' '}
                    <span className="font-medium">
                      {Math.min(pagination.currentPage * pagination.itemsPerPage, pagination.totalItems)}
                    </span>{' '}
                    de{' '}
                    <span className="font-medium">{pagination.totalItems}</span> resultados
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                    <button
                      onClick={() => handlePageChange(pagination.currentPage - 1)}
                      disabled={!pagination.hasPreviousPage}
                      className={`relative inline-flex items-center px-2 py-2 rounded-l-md border ${
                        pagination.hasPreviousPage
                          ? 'text-gray-500 bg-white hover:bg-gray-50'
                          : 'text-gray-300 bg-gray-100 cursor-not-allowed'
                      }`}
                    >
                      <ChevronLeftIcon className="h-5 w-5" />
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
                          className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                            pagination.currentPage === pageNumber
                              ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                              : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                          }`}
                        >
                          {pageNumber}
                        </button>
                      );
                    })}

                    <button
                      onClick={() => handlePageChange(pagination.currentPage + 1)}
                      disabled={!pagination.hasNextPage}
                      className={`relative inline-flex items-center px-2 py-2 rounded-r-md border ${
                        pagination.hasNextPage
                          ? 'text-gray-500 bg-white hover:bg-gray-50'
                          : 'text-gray-300 bg-gray-100 cursor-not-allowed'
                      }`}
                    >
                      <ChevronRightIcon className="h-5 w-5" />
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}