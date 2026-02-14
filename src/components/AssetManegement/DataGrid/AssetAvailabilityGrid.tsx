// src/components/AssetManagement/DataGrid/AssetAvailabilityGrid.tsx
import React, { useEffect, useState } from 'react';
import { 
  MagnifyingGlassIcon, 
  FunnelIcon, 
  ArrowPathIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ArrowDownTrayIcon,
  XMarkIcon,
  ChevronUpIcon,
  ChevronDownIcon,
  ArrowsUpDownIcon,
  CalendarIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import jsPDF from 'jspdf';
//@ts-ignore
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
//@ts-ignore
import { saveAs } from 'file-saver';
import { useCompany } from '../../../hooks/useCompany';
import useAssetAvailability from '../../../hooks/useAssetAvailability';

interface AssetAvailabilityGridProps {
  initialFilters?: {
    sites?: string[];
    areas?: string[];
    zones?: string[];
    categories?: string[];
    custody?: string[];
    types?: string[];
    search_by?: string;
    date_from?: string;
    date_to?: string;
  };
}

const AssetAvailabilityGrid: React.FC<AssetAvailabilityGridProps> = ({ initialFilters }) => {
  const { logo, companyId } = useCompany();
  
  // Use the custom hook
  const {
    data,
    //@ts-ignore
    statistics,
    pagination,
    loading,
    error,
    filterOptions,
    fetchAssetAvailability,
    fetchStatistics,
    fetchAllFilterOptions
  } = useAssetAvailability();
  
  // State Management
  const [filters, setFilters] = useState(initialFilters || {});
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  
  const [sortField, setSortField] = useState<string>('');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [showExportModal, setShowExportModal] = useState(false);

  // Date filters
  const [searchBy, setSearchBy] = useState('LAST_SEEN');
  const [dateFrom, setDateFrom] = useState('2026-01-23T17:30');
  const [dateTo, setDateTo] = useState('2026-02-07T17:30');

  // Load initial data
  useEffect(() => {
    if (companyId) {
      fetchData();
      fetchAllFilterOptions(companyId);
    }
  }, [companyId]);

  const fetchData = async () => {
    if (!companyId) return;

    const offset = (currentPage - 1) * itemsPerPage;
    
    const apiFilters = {
      ...filters,
      searchTerm,
      searchBy,
      dateFrom,
      dateTo
    };

    await fetchAssetAvailability(companyId, apiFilters, itemsPerPage, offset);
    await fetchStatistics(companyId, apiFilters);
  };

  // Get unique values for filters from API
  const uniqueSites = React.useMemo(() => {
    return filterOptions.sites.map(s => s.name);
  }, [filterOptions.sites]);

  const uniqueAreas = React.useMemo(() => {
    return filterOptions.areas.map(a => a.name);
  }, [filterOptions.areas]);

  const uniqueZones = React.useMemo(() => {
    return filterOptions.zones.map(z => z.name);
  }, [filterOptions.zones]);
  //@ts-ignore
  const uniqueTypes = React.useMemo(() => {
    return filterOptions.types.map(t => t.name);
  }, [filterOptions.types]);

  const uniqueCategories = React.useMemo(() => {
    return filterOptions.categories.map(c => c.name);
  }, [filterOptions.categories]);

  const uniqueCustody = React.useMemo(() => {
    return filterOptions.custody.map(c => c.name);
  }, [filterOptions.custody]);

  // Apply filters
  const applyFilters = () => {
    setCurrentPage(1);
    fetchData();
  };

  useEffect(() => {
    if (companyId) {
      fetchData();
    }
  }, [filters, searchTerm, currentPage, itemsPerPage]);

  // Handle filter changes
  const handleFilterChange = (newFilters: any) => {
    setFilters({ ...filters, ...newFilters });
    setCurrentPage(1);
  };

  // Handle search
  const handleSearch = (term: string) => {
    setSearchTerm(term);
    setCurrentPage(1);
  };

  // Clear all filters
  const clearFilters = () => {
    setFilters({});
    setSearchTerm('');
    setSearchBy('LAST_SEEN');
    setDateFrom('2026-01-23T17:30');
    setDateTo('2026-02-07T17:30');
    setCurrentPage(1);
  };

  // Handle sort
  const handleSort = (field: string) => {
    const newDirection = sortField === field && sortDirection === 'asc' ? 'desc' : 'asc';
    setSortField(field);
    setSortDirection(newDirection);
  };

  // Sort data (client-side sorting on current page)
  const sortedData = React.useMemo(() => {
    if (!sortField) return data;
    
    return [...data].sort((a: any, b: any) => {
      let aValue = a[sortField];
      let bValue = b[sortField];
      
      if (aValue === null || aValue === undefined) return 1;
      if (bValue === null || bValue === undefined) return -1;
      
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }
      
      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [data, sortField, sortDirection]);

  // Pagination values from API
  const totalPages = pagination.totalPages;
  const startItem = pagination.offset + 1;
  const endItem = Math.min(pagination.offset + pagination.limit, pagination.total);
  const paginatedData = sortedData; // Data is already paginated from API

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
  };

  // Export functions
  function normalizeBase64Image(base64: string): string {
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
        console.warn('Error decoding base64 logo');
      }
    }
    return result;
  }

  const handleExport = async (format: 'excel' | 'pdf', scope: 'filtered' | 'all') => {
    let exportData = [];
    
    if (scope === 'filtered') {
      exportData = sortedData;
    } else {
      // Fetch all data for export
      if (!companyId) return;
      
      try {
        const apiFilters = {
          ...filters,
          searchTerm,
          searchBy,
          dateFrom,
          dateTo
        };
        
        const response = await fetch(
          `https://apinode.smartxhub.cloud/api/dashboard/asset/${companyId}/asset-availability?limit=${pagination.total}&offset=0&${buildQueryString(apiFilters)}`
        );
        
        const result = await response.json();
        if (result.success) {
          exportData = result.data;
        }
      } catch (error) {
        console.error('Error fetching all data for export:', error);
        alert('Error fetching data for export');
        return;
      }
    }
    
    if (format === 'excel') {
      exportToExcel(exportData, scope);
    } else {
      exportToPDF(exportData, scope);
    }
    
    setShowExportModal(false);
  };

  // Helper to build query string
  const buildQueryString = (filters: any) => {
    const params = new URLSearchParams();
    if (filters.sites?.length) params.append('sites', filters.sites.join(','));
    if (filters.areas?.length) params.append('areas', filters.areas.join(','));
    if (filters.zones?.length) params.append('zones', filters.zones.join(','));
    if (filters.categories?.length) params.append('categories', filters.categories.join(','));
    if (filters.custody?.length) params.append('custody', filters.custody.join(','));
    if (filters.searchTerm) params.append('searchTerm', filters.searchTerm);
    if (filters.searchBy) params.append('searchBy', filters.searchBy);
    if (filters.dateFrom) params.append('dateFrom', filters.dateFrom);
    if (filters.dateTo) params.append('dateTo', filters.dateTo);
    return params.toString();
  };

  const exportToExcel = (exportData: any[], scope: string) => {
    const excelData = exportData.map(asset => ({
      'Asset Code': asset.asset_code,
      'Asset Name': asset.asset_name,
      'Last Seen': asset.last_seen_formatted,
      'Category': `[${asset.category_code}] - ${asset.category_name}`,
      'Condition': `[${asset.condition_code}] - ${asset.condition_name}`,
      'Custody': `[${asset.custody_assigned_code}] - ${asset.custody_assigned_name}`,
      'Site': `[${asset.site_current_code}] - ${asset.site_current_name}`,
      'Area': `[${asset.area_current_code}] - ${asset.area_current_name}`,
      'Zone': `[${asset.zone_current_code}] - ${asset.zone_current_name}`,
      'Next Service': asset.next_service_formatted || '-',
      'Expiration Date': asset.expiration_date_formatted || '-',
      'Warranty Ends': asset.warranty_end_formatted || '-',
      'Service Ends': asset.service_end_formatted || '-',
      'Insured Ends': asset.insured_end_formatted || '-',
      'Group': asset.group_name,
      'Cost Center': asset.cost_center_name,
      'Department': asset.department_name,
      'Model': asset.model,
      'Brand': asset.brand,
      'Status': asset.status,
      'Serial': asset.serial_number,
      'Created': asset.created_date_formatted,
      'Modified': asset.modified_date_formatted
    }));

    const ws = XLSX.utils.json_to_sheet(excelData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Asset Availability');

    const colWidths = [
      { wch: 15 }, { wch: 30 }, { wch: 20 }, { wch: 35 },
      { wch: 30 }, { wch: 35 }, { wch: 35 }, { wch: 35 },
      { wch: 35 }, { wch: 12 }, { wch: 15 }, { wch: 15 },
      { wch: 15 }, { wch: 15 }, { wch: 20 }, { wch: 15 },
      { wch: 20 }, { wch: 15 }, { wch: 15 }, { wch: 12 },
      { wch: 15 }, { wch: 15 }, { wch: 15 }
    ];
    ws['!cols'] = colWidths;

    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { 
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
    });
    
    const fileName = `asset-availability-${scope}-${new Date().toISOString().split('T')[0]}.xlsx`;
    saveAs(blob, fileName);
  };

  const exportToPDF = (exportData: any[], scope: string) => {
    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4'
    });
    
    let currentY = 15;

    // Header
    doc.setFillColor(37, 99, 235);
    doc.roundedRect(10, 10, 277, 50, 3, 3, 'F');

    if (logo) {
      try {
        const finalBase64 = normalizeBase64Image(logo);
        const logoWidth = 40;
        const logoHeight = 12;
        const logoX = 15;
        const logoY = 14;
        doc.setFillColor(255, 255, 255);
        doc.roundedRect(logoX - 2, logoY - 2, logoWidth + 4, logoHeight + 4, 2, 2, 'F');
        doc.addImage(finalBase64, 'PNG', logoX, logoY, logoWidth, logoHeight, undefined, 'FAST');
      } catch (error) {
        console.error('Error adding logo to PDF:', error);
      }
    }

    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(255, 255, 255);
    doc.text('Asset Availability Report', logo ? 60 : 15, 25);
    currentY = 28;

    doc.setDrawColor(255, 255, 255);
    doc.setLineWidth(0.3);
    doc.line(15, currentY, 282, currentY);
    currentY += 6;

    // Metadata
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    
    let col1Y = currentY;
    doc.setFont('helvetica', 'bold');
    doc.text('Export Date:', 15, col1Y);
    doc.setFont('helvetica', 'normal');
    doc.text(new Date().toLocaleString('pt-BR'), 43, col1Y);
    col1Y += 5;

    doc.setFont('helvetica', 'bold');
    doc.text('Scope:', 15, col1Y);
    doc.setFont('helvetica', 'normal');
    doc.text(scope === 'filtered' ? 'Filtered Results' : 'All Assets', 43, col1Y);
    col1Y += 5;

    doc.setFont('helvetica', 'bold');
    doc.text('Total Assets:', 15, col1Y);
    doc.setFont('helvetica', 'normal');
    doc.text(exportData.length.toLocaleString(), 43, col1Y);

    currentY = 62;

    if (Object.keys(filters).length > 0) {
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(107, 114, 128);
      doc.text(`Filters Applied: ${Object.keys(filters).length}`, 15, currentY);
      currentY += 3;
    }

    currentY += 5;

    // Table data
    const tableData = exportData.map(asset => [
      asset.asset_code,
      asset.asset_name,
      asset.last_seen_formatted,
      asset.category_name,
      asset.condition_name,
      `${asset.site_current_name} / ${asset.zone_current_name}`,
      asset.next_service_formatted || '-',
      asset.warranty_end_formatted || '-'
    ]);

    autoTable(doc, {
      head: [['Code', 'Name', 'Last Seen', 'Category', 'Condition', 'Location', 'Next Service', 'Warranty']],
      body: tableData,
      startY: currentY,
      theme: 'striped',
      styles: { 
        fontSize: 7, 
        cellPadding: 2,
        lineColor: [229, 231, 235],
        lineWidth: 0.1,
        font: 'helvetica',
        textColor: [31, 41, 55]
      },
      headStyles: {
        fillColor: [37, 99, 235],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 8,
        halign: 'left'
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252]
      },
      columnStyles: {
        0: { cellWidth: 25 },
        1: { cellWidth: 50 },
        2: { cellWidth: 35 },
        3: { cellWidth: 40 },
        4: { cellWidth: 30 },
        5: { cellWidth: 45 },
        6: { cellWidth: 25 },
        7: { cellWidth: 25 }
      },
      margin: { top: 10, right: 10, bottom: 10, left: 14 }
    });

    // Footer
    const pageCount = doc.internal.pages.length - 1;
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      const pageHeight = doc.internal.pageSize.getHeight();
      doc.setFillColor(249, 250, 251);
      doc.rect(10, pageHeight - 15, 277, 10, 'F');
      
      doc.setFontSize(8);
      doc.setTextColor(107, 114, 128);
      doc.text(
        `Page ${i} of ${pageCount}`,
        doc.internal.pageSize.getWidth() / 2,
        pageHeight - 8,
        { align: 'center' }
      );
      
      doc.setFontSize(7);
      doc.text(
        `Generated: ${new Date().toLocaleDateString('pt-BR')} | SmartX Asset Management`,
        15,
        pageHeight - 8
      );
      doc.text(
        `Total: ${exportData.length} assets`,
        doc.internal.pageSize.getWidth() - 15,
        pageHeight - 8,
        { align: 'right' }
      );
    }

    doc.save(`asset-availability-${scope}-${new Date().toISOString().split('T')[0]}.pdf`);
  };

  // SortHeader component
  const SortHeader = ({ field, children }: { field: string; children: React.ReactNode }) => (
    <th 
      className="px-3 py-3 text-left text-[11px] font-bold text-gray-700 uppercase tracking-wide cursor-pointer hover:bg-gray-200 transition-colors select-none"
      onClick={() => handleSort(field)}
    >
      <div className="flex items-center gap-1">
        <span>{children}</span>
        {sortField === field ? (
          sortDirection === 'asc' ? (
            <ChevronUpIcon className="w-3 h-3" />
          ) : (
            <ChevronDownIcon className="w-3 h-3" />
          )
        ) : (
          <ArrowsUpDownIcon className="w-3 h-3 opacity-30" />
        )}
      </div>
    </th>
  );

  // Page numbers
  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push('...');
        pages.push(currentPage - 1);
        pages.push(currentPage);
        pages.push(currentPage + 1);
        pages.push('...');
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  // Loading state
  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-12">
        <div className="flex flex-col items-center justify-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary-500 mb-4"></div>
          <p className="text-gray-600 font-medium">Loading asset availability data...</p>
          <p className="text-gray-500 text-sm mt-2">Please wait while we fetch the data</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <XMarkIcon className="h-5 w-5 text-red-500" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-800 font-medium">Error loading data</p>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Header Section */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2 text-gray-500 text-sm mb-2">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
              </svg>
              <span>Reports › <strong>Asset Availability</strong></span>
            </div>
            <h2 className="text-xl font-bold text-gray-900">Asset Availability Report</h2>
            <p className="text-sm text-gray-600 mt-1">
              Track asset locations, conditions, and maintenance schedules
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={fetchData}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              <ArrowPathIcon className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span className="text-sm font-medium">Refresh</span>
            </button>
            
            <button
              onClick={() => setShowExportModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
            >
              <ArrowDownTrayIcon className="w-4 h-4" />
              <span className="text-sm font-medium">Export</span>
            </button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="space-y-4">
          <div className="flex flex-col md:flex-row gap-3">
            {/* Search Bar */}
            <div className="flex-1 relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="Search by asset code, name, category, location..."
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
              />
            </div>

            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-2.5 border rounded-lg transition-all ${
                showFilters 
                  ? 'bg-primary-50 border-primary-500 text-primary-700' 
                  : 'bg-white border-gray-300 hover:bg-gray-50'
              }`}
            >
              <FunnelIcon className="w-5 h-5" />
              <span className="text-sm font-medium">Filters</span>
              {Object.keys(filters).length > 0 && (
                <span className="px-2 py-0.5 bg-primary-500 text-white text-xs rounded-full">
                  {Object.keys(filters).length}
                </span>
              )}
            </button>
          </div>

          {/* Filter Panel */}
          {showFilters && (
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              {/* Basic Filters */}
              <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-4">
                {/* Site Filter */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">
                    Current Site
                  </label>
                  <select
                    onChange={(e) => {
                      const value = e.target.value;
                      handleFilterChange({
                        sites: value ? [value] : undefined,
                      });
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white text-sm"
                  >
                    <option value="">All Sites</option>
                    {uniqueSites.map(site => (
                      <option key={site} value={site}>{site}</option>
                    ))}
                  </select>
                </div>

                {/* Area Filter */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">
                    Current Area
                  </label>
                  <select
                    onChange={(e) => {
                      const value = e.target.value;
                      handleFilterChange({
                        areas: value ? [value] : undefined,
                      });
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white text-sm"
                  >
                    <option value="">Nothing selected</option>
                    {uniqueAreas.map(area => (
                      <option key={area} value={area}>{area}</option>
                    ))}
                  </select>
                </div>

                {/* Zone Filter */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">
                    Current Location
                  </label>
                  <select
                    onChange={(e) => {
                      const value = e.target.value;
                      handleFilterChange({
                        zones: value ? [value] : undefined,
                      });
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white text-sm"
                  >
                    <option value="">Nothing selected</option>
                    {uniqueZones.map(zone => (
                      <option key={zone} value={zone}>{zone}</option>
                    ))}
                  </select>
                </div>

                {/* Type/Category Filter */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">
                    Type
                  </label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white text-sm"
                  >
                    <option value="">All Types</option>
                  </select>
                </div>

                {/* Category Filter */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">
                    Category
                  </label>
                  <select
                    onChange={(e) => {
                      const value = e.target.value;
                      handleFilterChange({
                        categories: value ? [value] : undefined,
                      });
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white text-sm"
                  >
                    <option value="">Nothing selected</option>
                    {uniqueCategories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>

                {/* Custody Filter */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">
                    Custody
                  </label>
                  <select
                    onChange={(e) => {
                      const value = e.target.value;
                      handleFilterChange({
                        custody: value ? [value] : undefined,
                      });
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white text-sm"
                  >
                    <option value="">Nothing selected</option>
                    {uniqueCustody.map(custody => (
                      <option key={custody} value={custody}>{custody}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Date Filters */}
              <div className="pt-4 border-t border-gray-200">
                <div className="flex items-center gap-2 mb-3">
                  <CalendarIcon className="w-4 h-4 text-primary-600" />
                  <span className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
                    Date Range Filters
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-7 gap-4 items-end">
                  {/* Search By */}
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-2">
                      Search By
                    </label>
                    <select
                      value={searchBy}
                      onChange={(e) => setSearchBy(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white text-sm"
                    >
                      <option value="LAST_SEEN">LAST SEEN</option>
                      <option value="CREATED_ON">CREATED ON</option>
                      <option value="MODIFIED_ON">MODIFIED ON</option>
                      <option value="EXPIRATION_DATE">EXPIRATION DATE</option>
                      <option value="NEXT_SERVICE">NEXT SERVICE</option>
                      <option value="WARRANTY_DATE">WARRANTY DATE</option>
                      <option value="INSURANCE_DATE">INSURANCE DATE</option>
                    </select>
                  </div>

                  {/* Date From */}
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-2">
                      Date Interval
                    </label>
                    <input
                      type="datetime-local"
                      value={dateFrom}
                      onChange={(e) => setDateFrom(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white text-sm"
                    />
                  </div>

                  {/* To Label */}
                  <div className="text-center text-sm text-gray-600 pb-2">
                    to
                  </div>

                  {/* Date To */}
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-2">
                      &nbsp;
                    </label>
                    <input
                      type="datetime-local"
                      value={dateTo}
                      onChange={(e) => setDateTo(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white text-sm"
                    />
                  </div>

                  {/* Additional Filter */}
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-2">
                      Filter
                    </label>
                    <input
                      type="text"
                      placeholder=""
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white text-sm"
                    />
                  </div>

                  {/* Apply Filter Button */}
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-2">
                      &nbsp;
                    </label>
                    <button
                      onClick={applyFilters}
                      className="w-full px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors text-sm font-medium"
                    >
                      Apply Filter
                    </button>
                  </div>

                  {/* Clear Filters Button */}
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-2">
                      &nbsp;
                    </label>
                    <button
                      onClick={clearFilters}
                      className="w-full px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
                    >
                      Clear All
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Results Summary */}
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
          <div className="text-sm text-gray-600">
            Showing <span className="font-semibold text-gray-900">{startItem}</span> to{' '}
            <span className="font-semibold text-gray-900">{endItem}</span> of{' '}
            <span className="font-semibold text-gray-900">{pagination.total}</span> records
          </div>
          
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600">Show:</label>
            <select
              value={itemsPerPage}
              onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
              className="px-3 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
              <tr>
                <SortHeader field="asset_name">Name</SortHeader>
                <SortHeader field="last_seen">Last Seen</SortHeader>
                <SortHeader field="category_name">Category</SortHeader>
                <SortHeader field="condition_name">Condition</SortHeader>
                <SortHeader field="custody_name">Custody Assigned</SortHeader>
                <th className="px-3 py-3 text-left text-[11px] font-bold text-gray-700 uppercase tracking-wide">
                  Current Location
                </th>
                <SortHeader field="next_service">Next Service</SortHeader>
                <SortHeader field="expiration_date">Expiration Date</SortHeader>
                <SortHeader field="warranty_ends">Warranty Ends</SortHeader>
                <SortHeader field="service_ends">Service Ends</SortHeader>
                <SortHeader field="insured_ends">Insured Ends</SortHeader>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedData.map((asset, index) => (
                <tr 
                  key={asset.asset_code} 
                  className={`hover:bg-primary-50 transition-colors ${
                    index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                  }`}
                >
                  <td className="px-3 py-4">
                    <div className="font-semibold text-sm text-primary-700">
                      [{asset.asset_code}] - {asset.asset_name}
                    </div>
                  </td>
                  <td className="px-3 py-2whitespace-nowrap">
                    <div className="text-sm text-gray-900">{asset.last_seen_formatted}</div>
                  </td>
                  <td className="px-3 py-4">
                    <div className="text-xs text-gray-700">[{asset.category_code}] -</div>
                    <div className="text-xs text-gray-600">{asset.category_name}</div>
                  </td>
                  <td className="px-3 py-2whitespace-nowrap">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold bg-yellow-100 text-yellow-800">
                      [{asset.condition_code}] - {asset.condition_name}
                    </span>
                  </td>
                  <td className="px-3 py-4">
                    <div className="text-sm text-gray-900">
                      [{asset.custody_assigned_code}] - {asset.custody_assigned_name}
                    </div>
                  </td>
                  <td className="px-3 py-4">
                    <div className="text-xs text-gray-700 leading-tight">
                      <div>[{asset.site_current_code}] - {asset.site_current_name} /</div>
                      <div>[{asset.area_current_code}] - {asset.area_current_name} /</div>
                      <div className="font-semibold">[{asset.zone_current_code}] - {asset.zone_current_name}</div>
                    </div>
                  </td>
                  <td className="px-3 py-2whitespace-nowrap">
                    <div className="text-sm text-gray-900">{asset.next_service_formatted || '-'}</div>
                  </td>
                  <td className="px-3 py-2whitespace-nowrap">
                    <div className="text-sm text-gray-900">{asset.expiration_date_formatted || '-'}</div>
                  </td>
                  <td className="px-3 py-2whitespace-nowrap">
                    <div className="text-sm text-gray-900">{asset.warranty_end_formatted || '-'}</div>
                  </td>
                  <td className="px-3 py-2whitespace-nowrap">
                    <div className="text-sm text-gray-900">{asset.service_end_formatted || '-'}</div>
                  </td>
                  <td className="px-3 py-2whitespace-nowrap">
                    <div className="text-sm text-gray-900">{asset.insured_end_formatted || '-'}</div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {sortedData.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm p-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-sm text-gray-600">
              Page <span className="font-semibold text-gray-900">{currentPage}</span> of{' '}
              <span className="font-semibold text-gray-900">{totalPages}</span>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeftIcon className="w-5 h-5" />
              </button>

              {getPageNumbers().map((page, index) => (
                <React.Fragment key={index}>
                  {page === '...' ? (
                    <span className="px-3 py-2 text-gray-400">...</span>
                  ) : (
                    <button
                      onClick={() => handlePageChange(page as number)}
                      className={`min-w-[40px] px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        currentPage === page
                          ? 'bg-primary-500 text-white'
                          : 'border border-gray-300 hover:bg-gray-50 text-gray-700'
                      }`}
                    >
                      {page}
                    </button>
                  )}
                </React.Fragment>
              ))}

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRightIcon className="w-5 h-5" />
              </button>
            </div>

            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-600">Go to:</label>
              <input
                type="number"
                min={1}
                max={totalPages}
                value={currentPage}
                onChange={(e) => {
                  const page = parseInt(e.target.value);
                  if (page >= 1 && page <= totalPages) {
                    handlePageChange(page);
                  }
                }}
                className="w-16 px-2 py-1.5 border border-gray-300 rounded-lg text-sm text-center focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
          </div>
        </div>
      )}

      {/* No Results */}
      {sortedData.length === 0 && (
        <div className="bg-white rounded-xl shadow-sm p-12">
          <div className="text-center">
            <ExclamationTriangleIcon className="mx-auto h-16 w-16 text-gray-400" />
            <h3 className="mt-4 text-lg font-semibold text-gray-900">No matching records found</h3>
            <p className="mt-2 text-sm text-gray-500">
              Try adjusting your search or filter criteria to find what you're looking for.
            </p>
            <button
              onClick={clearFilters}
              className="mt-6 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors text-sm font-medium"
            >
              Clear Filters
            </button>
          </div>
        </div>
      )}

      {/* Export Modal */}
      {showExportModal && (
        <div className="fixed inset-0 z-[9999] overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center">
            <div
              className="fixed inset-0 bg-gray-900 bg-opacity-50 transition-opacity"
              onClick={() => setShowExportModal(false)}
            />

            <div className="relative inline-block w-full max-w-lg my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-2xl rounded-xl z-[10000]">
              <div className="bg-gradient-to-r from-primary-500 to-primary-600 px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <ArrowDownTrayIcon className="w-6 h-6 text-white" />
                    <h3 className="text-lg font-bold text-white">Export Asset Availability</h3>
                  </div>
                  <button
                    onClick={() => setShowExportModal(false)}
                    className="text-white hover:text-gray-200 transition-colors"
                  >
                    <XMarkIcon className="w-6 h-6" />
                  </button>
                </div>
              </div>

              <div className="px-6 py-6">
                <p className="text-sm text-gray-600 mb-6">
                  Choose the format and scope of data to export
                </p>

                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => handleExport('excel', 'filtered')}
                    className="flex flex-col items-center gap-3 p-6 border-2 border-gray-200 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-all group"
                  >
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center group-hover:bg-green-200 transition-colors">
                      <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zm4 18H6V4h7v5h5v11z"/>
                        <path d="M8 12h8v2H8zm0 4h8v2H8zm0-8h5v2H8z"/>
                      </svg>
                    </div>
                    <div className="text-center">
                      <div className="font-semibold text-gray-900 text-sm">Excel (XLSX)</div>
                      <div className="text-xs text-gray-600 mt-1">Filtered Results</div>
                      <div className="text-xs text-primary-600 font-medium mt-1">
                        {sortedData.length} records
                      </div>
                    </div>
                  </button>

                  <button
                    onClick={() => handleExport('excel', 'all')}
                    className="flex flex-col items-center gap-3 p-6 border-2 border-gray-200 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-all group"
                  >
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center group-hover:bg-green-200 transition-colors">
                      <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zm4 18H6V4h7v5h5v11z"/>
                        <path d="M8 12h8v2H8zm0 4h8v2H8zm0-8h5v2H8z"/>
                      </svg>
                    </div>
                    <div className="text-center">
                      <div className="font-semibold text-gray-900 text-sm">Excel (XLSX)</div>
                      <div className="text-xs text-gray-600 mt-1">All Data</div>
                      <div className="text-xs text-primary-600 font-medium mt-1">
                        {pagination.total} records
                      </div>
                    </div>
                  </button>

                  <button
                    onClick={() => handleExport('pdf', 'filtered')}
                    className="flex flex-col items-center gap-3 p-6 border-2 border-gray-200 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-all group"
                  >
                    <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center group-hover:bg-red-200 transition-colors">
                      <svg className="w-6 h-6 text-red-600" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zm4 18H6V4h7v5h5v11z"/>
                        <path d="M9 13h6v2H9zm0 4h6v2H9z"/>
                      </svg>
                    </div>
                    <div className="text-center">
                      <div className="font-semibold text-gray-900 text-sm">PDF Report</div>
                      <div className="text-xs text-gray-600 mt-1">Filtered Results</div>
                      <div className="text-xs text-primary-600 font-medium mt-1">
                        {sortedData.length} records
                      </div>
                    </div>
                  </button>

                  <button
                    onClick={() => handleExport('pdf', 'all')}
                    className="flex flex-col items-center gap-3 p-6 border-2 border-gray-200 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-all group"
                  >
                    <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center group-hover:bg-red-200 transition-colors">
                      <svg className="w-6 h-6 text-red-600" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zm4 18H6V4h7v5h5v11z"/>
                        <path d="M9 13h6v2H9zm0 4h6v2H9z"/>
                      </svg>
                    </div>
                    <div className="text-center">
                      <div className="font-semibold text-gray-900 text-sm">PDF Report</div>
                      <div className="text-xs text-gray-600 mt-1">All Data</div>
                      <div className="text-xs text-primary-600 font-medium mt-1">
                        {pagination.total} records
                      </div>
                    </div>
                  </button>
                </div>

                <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex gap-3">
                    <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                    <div className="text-xs text-blue-800">
                      <strong>Filtered Results:</strong> Exports only visible data based on current search and filters
                      <br />
                      <strong>All Data:</strong> Exports complete dataset ({pagination.total} records)
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssetAvailabilityGrid;