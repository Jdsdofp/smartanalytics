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
  InformationCircleIcon
} from '@heroicons/react/24/outline';

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
    expirationRange: 'ALL'
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
  const companyId = 610;
  const filterRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // IMPORTANTE: Declarar funções utilitárias ANTES dos useMemo
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
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
        color: 'bg-red-100 text-red-800 border border-red-300',
        icon: <XCircleIcon className="w-4 h-4" />
      };
    } else if (days <= 30) {
      return {
        label: 'CRÍTICO',
        color: 'bg-red-100 text-red-800 border border-red-300',
        icon: <ExclamationTriangleIcon className="w-4 h-4" />
      };
    } else if (days <= 90) {
      return {
        label: 'ATENÇÃO',
        color: 'bg-orange-100 text-orange-800 border border-orange-300',
        icon: <ExclamationTriangleIcon className="w-4 h-4" />
      };
    } else if (days <= 180) {
      return {
        label: 'ALERTA',
        color: 'bg-yellow-100 text-yellow-800 border border-yellow-300',
        icon: <ClockIcon className="w-4 h-4" />
      };
    } else {
      return {
        label: 'SEGURO',
        color: 'bg-green-100 text-green-800 border border-green-300',
        icon: <CheckCircleIcon className="w-4 h-4" />
      };
    }
  };

  const getRiskScoreColor = (score: number) => {
    if (score > 50) return 'text-red-600';
    if (score > 25) return 'text-orange-600';
    return 'text-green-600';
  };

  // Buscar todos os dados para análise crítica
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

      const response = await fetch(
        `http://localhost:4000/api/dashboard/${companyId}/certificates/reports?${params}`
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
        item.certificate_description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.serial.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.model.toLowerCase().includes(searchTerm.toLowerCase());

      const matchStatus = filters.status === 'ALL' || item.certificate_status_name === filters.status;
      const matchSite = filters.site === 'ALL' || item.Home_site_name === filters.site;
      const matchCertType = filters.certificateType === 'ALL' || item.certificate_description === filters.certificateType;

      // Filtro de range de expiração
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

  const uniqueValues = useMemo(() => ({
    sites: Array.from(new Set(data.map(item => item.Home_site_name))).filter(Boolean),
    certificateTypes: Array.from(new Set(data.map(item => item.certificate_description))).filter(Boolean),
    statuses: Array.from(new Set(data.map(item => item.certificate_status_name))).filter(Boolean),
  }), [data]);

  // Análise Crítica Completa
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

    // Calcular média de dias até expiração
    const totalDays = dataToAnalyze.reduce((sum, item) => {
      return sum + Math.max(0, getDaysUntilExpiration(item.expiration_date));
    }, 0);
    const averageDaysToExpiration = dataToAnalyze.length > 0 ? Math.round(totalDays / dataToAnalyze.length) : 0;

    // Sites com mais certificados
    const siteCount: Record<string, number> = {};
    dataToAnalyze.forEach(item => {
      siteCount[item.Home_site_name] = (siteCount[item.Home_site_name] || 0) + 1;
    });
    const sitesWithMostCertificates = Object.entries(siteCount)
      .map(([site, count]) => ({ site, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Distribuição de tipos de certificado
    const certTypeCount: Record<string, number> = {};
    dataToAnalyze.forEach(item => {
      certTypeCount[item.certificate_description] = (certTypeCount[item.certificate_description] || 0) + 1;
    });
    const certificateTypeDistribution = Object.entries(certTypeCount)
      .map(([type, count]) => ({ type, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Ação urgente requerida
    const urgentActionRequired = expired + expiringIn30Days;

    // Taxa de compliance (certificados válidos por mais de 90 dias)
    const compliant = dataToAnalyze.filter(item => {
      const days = getDaysUntilExpiration(item.expiration_date);
      return days > 90;
    }).length;
    const complianceRate = dataToAnalyze.length > 0 ? (compliant / dataToAnalyze.length) * 100 : 0;

    // Score de risco (0-100, onde 0 é sem risco e 100 é risco máximo)
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
          `http://localhost:4000/api/dashboard/${companyId}/certificates/reports?${params}`
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

      // Aba de Análise Crítica
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

      // Aba de Sites
      const siteData = criticalAnalysis.sitesWithMostCertificates.map(s => ({
        'Site': s.site,
        'Quantidade': s.count,
        'Percentual': `${((s.count / criticalAnalysis.totalCertificates) * 100).toFixed(1)}%`
      }));
      const wsSites = XLSX.utils.json_to_sheet(siteData);
      wsSites['!cols'] = [{ wch: 40 }, { wch: 15 }, { wch: 15 }];
      XLSX.utils.book_append_sheet(wb, wsSites, 'Top Sites');

      // Aba de Tipos de Certificado
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

      // Título principal
      doc.setFontSize(20);
      doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.text('Relatório Crítico de Certificados', margin, yPosition);
      yPosition += 8;

      // Subtítulo e data
      doc.setFontSize(10);
      doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
      doc.text('Análise Detalhada e Score de Risco', margin, yPosition);
      doc.text(`Data: ${new Date().toLocaleDateString('pt-BR')} ${new Date().toLocaleTimeString('pt-BR')}`, pageWidth - margin, yPosition, { align: 'right' });
      yPosition += 12;

      // Score de Risco e Compliance
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');

      // Score de Risco
      const riskColor = criticalAnalysis.riskScore > 50 ? redColor : criticalAnalysis.riskScore > 25 ? orangeColor : [34, 197, 94];
      doc.setTextColor(riskColor[0], riskColor[1], riskColor[2]);
      doc.text(`Score de Risco: ${criticalAnalysis.riskScore.toFixed(1)}%`, margin, yPosition);

      // Taxa de Compliance
      doc.setTextColor(34, 197, 94);
      doc.text(`Taxa de Compliance: ${criticalAnalysis.complianceRate.toFixed(1)}%`, pageWidth / 2, yPosition);

      // Ação Urgente
      if (criticalAnalysis.urgentActionRequired > 0) {
        doc.setTextColor(redColor[0], redColor[1], redColor[2]);
        doc.text(`⚠ Ação Urgente: ${criticalAnalysis.urgentActionRequired} certificados`, pageWidth - margin, yPosition, { align: 'right' });
      }

      yPosition += 10;
      doc.setFont('helvetica', 'normal');

      // Estatísticas detalhadas
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

      // Cabeçalho da tabela
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

      // Desenhar cabeçalho
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

      // Dados da tabela
      doc.setFontSize(6);
      doc.setTextColor(0, 0, 0);

      dataToExport.forEach((item, index) => {
        if (yPosition > pageHeight - 15) {
          doc.addPage();
          yPosition = margin;

          // Redesenhar cabeçalho na nova página
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
        let criticalityColor = [34, 197, 94]; // green

        if (days < 0) {
          criticality = 'EXPIRADO';
          criticalityColor = [220, 38, 38]; // red
        } else if (days <= 30) {
          criticality = 'CRÍTICO';
          criticalityColor = [220, 38, 38]; // red
        } else if (days <= 90) {
          criticality = 'ATENÇÃO';
          criticalityColor = [249, 115, 22]; // orange
        } else if (days <= 180) {
          criticality = 'ALERTA';
          criticalityColor = [234, 179, 8]; // yellow
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

      // Página de Análise Detalhada
      doc.addPage();
      yPosition = margin;

      doc.setFontSize(18);
      doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.setFont('helvetica', 'bold');
      doc.text('Análise Crítica Detalhada', margin, yPosition);
      yPosition += 12;

      // Análise de Risco
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

      // Distribuição por Nível de Criticidade
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

      // Top 5 Sites
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

      // Top 5 Tipos de Certificado
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

  if (loading || loadingAnalysis) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando análise crítica...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Análise Crítica de Certificados</h1>
          <p className="text-gray-600">Relatório detalhado com score de risco e análise preditiva</p>
        </div>

        {/* Painel de Análise Crítica */}
        {showAnalysis && (
          <div className="mb-6 space-y-4">
            {/* Score de Risco e Compliance */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg shadow-lg p-6 border-2 border-red-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-red-900">Score de Risco</span>
                  <ExclamationTriangleIcon className="w-6 h-6 text-red-600" />
                </div>
                <div className={`text-4xl font-bold ${getRiskScoreColor(criticalAnalysis.riskScore)}`}>
                  {criticalAnalysis.riskScore.toFixed(1)}%
                </div>
                <div className="mt-2 text-xs text-red-700">
                  {criticalAnalysis.riskScore > 50 ? 'Risco Crítico' : criticalAnalysis.riskScore > 25 ? 'Risco Moderado' : 'Risco Baixo'}
                </div>
              </div>

              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg shadow-lg p-6 border-2 border-green-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-green-900">Taxa de Compliance</span>
                  <CheckCircleIcon className="w-6 h-6 text-green-600" />
                </div>
                <div className="text-4xl font-bold text-green-600">
                  {criticalAnalysis.complianceRate.toFixed(1)}%
                </div>
                <div className="mt-2 text-xs text-green-700">
                  Certificados válidos &gt; 90 dias
                </div>
              </div>

              <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg shadow-lg p-6 border-2 border-orange-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-orange-900">Ação Urgente</span>
                  <ClockIcon className="w-6 h-6 text-orange-600" />
                </div>
                <div className="text-4xl font-bold text-orange-600">
                  {criticalAnalysis.urgentActionRequired}
                </div>
                <div className="mt-2 text-xs text-orange-700">
                  Certificados requerem ação imediata
                </div>
              </div>
            </div>

            {/* Estatísticas Detalhadas */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="bg-white rounded-lg shadow p-4 border-l-4 border-red-500">
                <div className="text-xs text-gray-600 mb-1">Expirados</div>
                <div className="text-2xl font-bold text-red-600">{criticalAnalysis.expired}</div>
              </div>
              <div className="bg-white rounded-lg shadow p-4 border-l-4 border-orange-500">
                <div className="text-xs text-gray-600 mb-1">30 Dias</div>
                <div className="text-2xl font-bold text-orange-600">{criticalAnalysis.expiringIn30Days}</div>
              </div>
              <div className="bg-white rounded-lg shadow p-4 border-l-4 border-yellow-500">
                <div className="text-xs text-gray-600 mb-1">60 Dias</div>
                <div className="text-2xl font-bold text-yellow-600">{criticalAnalysis.expiringIn60Days}</div>
              </div>
              <div className="bg-white rounded-lg shadow p-4 border-l-4 border-blue-500">
                <div className="text-xs text-gray-600 mb-1">90 Dias</div>
                <div className="text-2xl font-bold text-blue-600">{criticalAnalysis.expiringIn90Days}</div>
              </div>
              <div className="bg-white rounded-lg shadow p-4 border-l-4 border-green-500">
                <div className="text-xs text-gray-600 mb-1">Média Dias</div>
                <div className="text-2xl font-bold text-green-600">{criticalAnalysis.averageDaysToExpiration}</div>
              </div>
            </div>

            {/* Distribuição por Níveis */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <ChartBarIcon className="w-5 h-5" />
                Distribuição por Nível de Criticidade
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-red-50 rounded-lg border border-red-200">
                  <div className="text-3xl font-bold text-red-600">{criticalAnalysis.critical}</div>
                  <div className="text-sm text-red-700 mt-1">Nível Crítico</div>
                  <div className="text-xs text-gray-600 mt-1">
                    {((criticalAnalysis.critical / criticalAnalysis.totalCertificates) * 100).toFixed(1)}% do total
                  </div>
                </div>
                <div className="text-center p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                  <div className="text-3xl font-bold text-yellow-600">{criticalAnalysis.warning}</div>
                  <div className="text-sm text-yellow-700 mt-1">Nível Alerta</div>
                  <div className="text-xs text-gray-600 mt-1">
                    {((criticalAnalysis.warning / criticalAnalysis.totalCertificates) * 100).toFixed(1)}% do total
                  </div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
                  <div className="text-3xl font-bold text-green-600">{criticalAnalysis.safe}</div>
                  <div className="text-sm text-green-700 mt-1">Nível Seguro</div>
                  <div className="text-xs text-gray-600 mt-1">
                    {((criticalAnalysis.safe / criticalAnalysis.totalCertificates) * 100).toFixed(1)}% do total
                  </div>
                </div>
              </div>
            </div>

            {/* Top Sites e Tipos */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Top 5 Sites</h3>
                <div className="space-y-3">
                  {criticalAnalysis.sitesWithMostCertificates.map((site, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <span className="text-sm font-medium text-gray-700 truncate flex-1">{site.site}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-gray-900">{site.count}</span>
                        <span className="text-xs text-gray-500">
                          ({((site.count / criticalAnalysis.totalCertificates) * 100).toFixed(1)}%)
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Top 5 Tipos de Certificado</h3>
                <div className="space-y-3">
                  {criticalAnalysis.certificateTypeDistribution.map((cert, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <span className="text-sm font-medium text-gray-700 truncate flex-1">{cert.type}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-gray-900">{cert.count}</span>
                        <span className="text-xs text-gray-500">
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
              className="w-full py-2 text-sm text-gray-600 hover:text-gray-900 flex items-center justify-center gap-2"
            >
              <ChevronLeftIcon className="w-4 h-4" />
              Ocultar Análise Detalhada
            </button>
          </div>
        )}

        {!showAnalysis && (
          <button
            onClick={() => setShowAnalysis(true)}
            className="mb-6 w-full py-3 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg flex items-center justify-center gap-2 transition-colors"
          >
            <InformationCircleIcon className="w-5 h-5" />
            Mostrar Análise Crítica Detalhada
          </button>
        )}

        {/* Cards de Estatísticas Rápidas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4 px-4">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-sm text-gray-600 mb-1">Total</div>
            <div className="text-2xl font-bold text-gray-900">{pagination.totalItems}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-sm text-gray-600 mb-1">Aprovados</div>
            <div className="text-2xl font-bold text-green-600">{stats.approved}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-sm text-gray-600 mb-1">Expira 90d</div>
            <div className="text-2xl font-bold text-yellow-600">{stats.expiringSoon}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-sm text-gray-600 mb-1">Expirados</div>
            <div className="text-2xl font-bold text-red-600">{stats.expired}</div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow mb-4 mx-4 p-4">
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <div className="flex-1 relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Buscar por item, código, certificado, serial, marca ou modelo..."
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
                      <div className="font-medium text-gray-900">Todos os Dados com Análise Completa</div>
                      <div className="text-sm text-gray-600">
                        Exportar todos os {pagination.totalItems} registros + análise crítica detalhada
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
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
              <select
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                className="px-3 py-2 border rounded-lg"
              >
                <option value="ALL">Status - Todos</option>
                {uniqueValues.statuses.map(status => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>

              <select
                value={filters.site}
                onChange={(e) => setFilters({ ...filters, site: e.target.value })}
                className="px-3 py-2 border rounded-lg"
              >
                <option value="ALL">Site - Todos</option>
                {uniqueValues.sites.map(site => (
                  <option key={site} value={site}>{site}</option>
                ))}
              </select>

              <select
                value={filters.certificateType}
                onChange={(e) => setFilters({ ...filters, certificateType: e.target.value })}
                className="px-3 py-2 border rounded-lg"
              >
                <option value="ALL">Tipo - Todos</option>
                {uniqueValues.certificateTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>

              <select
                value={filters.expirationRange}
                onChange={(e) => setFilters({ ...filters, expirationRange: e.target.value })}
                className="px-3 py-2 border rounded-lg"
              >
                <option value="ALL">Expiração - Todos</option>
                <option value="EXPIRED">Expirados</option>
                <option value="30_DAYS">0-30 dias</option>
                <option value="60_DAYS">31-60 dias</option>
                <option value="90_DAYS">61-90 dias</option>
                <option value="180_DAYS">91-180 dias</option>
                <option value="SAFE">&gt; 180 dias</option>
              </select>
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden mx-4">
          <div className="overflow-x-auto">
            <div className="max-h-[700px] overflow-y-auto">
              <table className="min-w-full w-full table-fixed">
                <thead className="bg-gray-50 border-b sticky top-0 z-10">
                  <tr>
                    <th className="w-40 px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">
                      <div className="flex items-center">
                        Site
                        <ColumnFilterDropdown column="Home_site_name" displayName="Site" />
                      </div>
                    </th>
                    <th className="w-80 px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">
                      <div className="flex items-center">
                        Área / Zona
                      </div>
                    </th>
                    <th
                      className="w-48 px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('certificate_description')}
                    >
                      <div className="flex items-center">
                        Certificado {sortBy === 'certificate_description' && (sortOrder === 'ASC' ? '↑' : '↓')}
                        <ColumnFilterDropdown column="certificate_description" displayName="Certificado" />
                      </div>
                    </th>
                    <th className="w-32 px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">
                      <div className="flex items-center">
                        Código
                      </div>
                    </th>
                    <th
                      className="w-64 px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('item_name')}
                    >
                      <div className="flex items-center">
                        Item {sortBy === 'item_name' && (sortOrder === 'ASC' ? '↑' : '↓')}
                        <ColumnFilterDropdown column="item_name" displayName="Item" />
                      </div>
                    </th>
                    <th className="w-32 px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">
                      <div className="flex items-center">
                        Marca
                        <ColumnFilterDropdown column="brand" displayName="Marca" />
                      </div>
                    </th>
                    <th className="w-32 px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">
                      <div className="flex items-center">
                        Modelo
                        <ColumnFilterDropdown column="model" displayName="Modelo" />
                      </div>
                    </th>
                    <th className="w-40 px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">
                      <div className="flex items-center">
                        Serial
                        <ColumnFilterDropdown column="serial" displayName="Serial" />
                      </div>
                    </th>
                    <th
                      className="w-32 px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('expiration_date')}
                    >
                      Expiração {sortBy === 'expiration_date' && (sortOrder === 'ASC' ? '↑' : '↓')}
                    </th>
                    <th className="w-28 px-6 py-4 text-center text-xs font-medium text-gray-500 uppercase">
                      Dias p/ Expirar
                    </th>
                    <th className="w-32 px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">
                      <div className="flex items-center">
                        Status
                        <ColumnFilterDropdown column="certificate_status_name" displayName="Status" />
                      </div>
                    </th>
                    <th className="w-32 px-6 py-4 text-center text-xs font-medium text-gray-500 uppercase">
                      Criticidade
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {filteredData.map((item, index) => {
                    const daysUntilExpiration = getDaysUntilExpiration(item.expiration_date);
                    const criticalityBadge = getCriticalityBadge(daysUntilExpiration);

                    return (
                      <tr
                        key={item.id}
                        className={`hover:bg-blue-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                          }`}
                      >
                        <td className="px-6 py-5">
                          <div className="text-sm font-medium text-gray-900">{item.Home_site_name}</div>
                        </td>
                        <td className="px-6 py-5">
                          <div className="space-y-1">
                            <div className="text-xs font-semibold text-gray-800 leading-tight">{item.code_area}</div>
                            <div className="text-xs text-gray-600 leading-tight">{item.code_zone}</div>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <div className="text-sm font-medium text-gray-900 leading-relaxed">{item.certificate_description}</div>
                        </td>
                        <td className="px-6 py-5">
                          <div className="text-sm font-mono font-medium text-gray-900 bg-gray-100 px-2 py-1 rounded inline-block">
                            {item.item_code}
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <div className="text-sm font-medium text-gray-900 leading-tight">{item.item_name}</div>
                        </td>
                        <td className="px-6 py-5">
                          <div className="text-sm text-gray-700">
                            {item.brand || <span className="text-gray-400 italic">-</span>}
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <div className="text-sm text-gray-700">
                            {item.model || <span className="text-gray-400 italic">-</span>}
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <div className="text-sm font-mono text-gray-900 bg-gray-100 px-2 py-1 rounded inline-block">
                            {item.serial}
                          </div>
                        </td>
                        <td className="px-6 py-5 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{formatDate(item.expiration_date)}</div>
                        </td>
                        <td className="px-6 py-5 text-center">
                          <span className={`inline-flex items-center justify-center px-3 py-1.5 rounded-full text-xs font-bold ${daysUntilExpiration < 0
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
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-2">
                            {getStatusIcon(item.certificate_status_name)}
                            <span className="text-sm font-medium">{item.certificate_status_name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-5 text-center">
                          <span className={`inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold shadow-sm ${criticalityBadge.color}`}>
                            {criticalityBadge.icon}
                            {criticalityBadge.label}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {filteredData.length === 0 && (
            <div className="text-center py-16">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                <ExclamationTriangleIcon className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-500 text-lg font-medium">Nenhum certificado encontrado.</p>
              <p className="text-gray-400 text-sm mt-2">Tente ajustar os filtros de busca</p>
            </div>
          )}

          <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() => handlePageChange(pagination.currentPage - 1)}
                  disabled={!pagination.hasPreviousPage}
                  className={`px-4 py-2 border rounded-lg font-medium transition-all ${pagination.hasPreviousPage
                      ? 'text-gray-700 bg-white hover:bg-gray-50 border-gray-300 shadow-sm'
                      : 'text-gray-400 bg-gray-100 cursor-not-allowed border-gray-200'
                    }`}
                >
                  Anterior
                </button>
                <button
                  onClick={() => handlePageChange(pagination.currentPage + 1)}
                  disabled={!pagination.hasNextPage}
                  className={`ml-3 px-4 py-2 border rounded-lg font-medium transition-all ${pagination.hasNextPage
                      ? 'text-gray-700 bg-white hover:bg-gray-50 border-gray-300 shadow-sm'
                      : 'text-gray-400 bg-gray-100 cursor-not-allowed border-gray-200'
                    }`}
                >
                  Próxima
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700 font-medium">
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
                      className={`relative inline-flex items-center px-3 py-2 rounded-l-lg border font-medium transition-all ${pagination.hasPreviousPage
                          ? 'text-gray-700 bg-white hover:bg-gray-50 border-gray-300'
                          : 'text-gray-300 bg-gray-100 cursor-not-allowed border-gray-200'
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
                          className={`relative inline-flex items-center px-4 py-2 border text-sm font-semibold transition-all ${pagination.currentPage === pageNumber
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
                      className={`relative inline-flex items-center px-3 py-2 rounded-r-lg border font-medium transition-all ${pagination.hasNextPage
                          ? 'text-gray-700 bg-white hover:bg-gray-50 border-gray-300'
                          : 'text-gray-300 bg-gray-100 cursor-not-allowed border-gray-200'
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