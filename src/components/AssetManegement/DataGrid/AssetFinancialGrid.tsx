// // src/components/AssetManagement/DataGrid/AssetFinancialGrid.tsx
// import React, { useEffect, useState } from 'react';
// import useAssetManagement from '../../../hooks/useAssetManagement';
// import { 
//   MagnifyingGlassIcon, 
//   FunnelIcon, 
//   ArrowPathIcon,
//   ChevronLeftIcon,
//   ChevronRightIcon,
//   ArrowDownTrayIcon,
//   XMarkIcon,
//   ChevronUpIcon,
//   ChevronDownIcon,
//   ArrowsUpDownIcon
// } from '@heroicons/react/24/outline';
// import jsPDF from 'jspdf';
// //@ts-ignore
// import autoTable from 'jspdf-autotable';
// import * as XLSX from 'xlsx';
// //@ts-ignore
// import { saveAs } from 'file-saver';
// import { useCompany } from '../../../hooks/useCompany';

// interface AssetDetailsTableProps {
//   initialFilters?: {
//     categories?: string[];
//     departments?: string[];
//     active_status?: string[];
//     insurance_status?: string[];
//     owners?: string[];
//     cost_centers?: string[];
//     depreciation_enabled?: number;
//     condition_status?: string[];
//   };
// }

// const AssetFinancialGrid: React.FC<AssetDetailsTableProps> = ({ initialFilters }) => {
//   const { assetDetails } = useAssetManagement();
//   const {logo} = useCompany()
//   const [filters, setFilters] = useState(initialFilters || {});
//   const [searchTerm, setSearchTerm] = useState('');
//   const [showFilters, setShowFilters] = useState(false);
//   const [currentPage, setCurrentPage] = useState(1);
//   const [itemsPerPage, setItemsPerPage] = useState(10);
//   //@ts-ignore
//   const [selectedAsset, setSelectedAsset] = useState<any>(null);
//   const [sortField, setSortField] = useState<string>('');
//   const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
//   const [showExportModal, setShowExportModal] = useState(false);

//   // Load initial data
//   useEffect(() => {
//     assetDetails.fetch(filters, itemsPerPage, 0);
//     setCurrentPage(1);
//   }, []);

//   // Handle filter changes
//   const handleFilterChange = (newFilters: any) => {
//     const updatedFilters = { ...filters, ...newFilters };
//     setFilters(updatedFilters);
//     setCurrentPage(1);
//     assetDetails.fetch(updatedFilters, itemsPerPage, 0);
//   };

//   // Handle search with debounce
//   const handleSearch = (term: string) => {
//     setSearchTerm(term);
//     setCurrentPage(1);
//     assetDetails.fetch({ ...filters, searchTerm: term }, itemsPerPage, 0);
//   };

//   // Handle page change
//   const handlePageChange = (newPage: number) => {
//     setCurrentPage(newPage);
//     const offset = (newPage - 1) * itemsPerPage;
//     assetDetails.fetch({ ...filters, searchTerm }, itemsPerPage, offset);
//     window.scrollTo({ top: 0, behavior: 'smooth' });
//   };

//   // Handle items per page change
//   const handleItemsPerPageChange = (newItemsPerPage: number) => {
//     setItemsPerPage(newItemsPerPage);
//     setCurrentPage(1);
//     assetDetails.fetch({ ...filters, searchTerm }, newItemsPerPage, 0);
//   };

//   // Clear all filters
//   const clearFilters = () => {
//     setFilters({});
//     setSearchTerm('');
//     setCurrentPage(1);
//     assetDetails.fetch({}, itemsPerPage, 0);
//   };

//   // Handle sort
//   const handleSort = (field: string) => {
//     const newDirection = sortField === field && sortDirection === 'asc' ? 'desc' : 'asc';
//     setSortField(field);
//     setSortDirection(newDirection);
//   };

//   // Sort data based on current sort field and direction
//   const sortedData = React.useMemo(() => {
//     if (!sortField) return assetDetails.data;
    
//     return [...assetDetails.data].sort((a: any, b: any) => {
//       let aValue = a[sortField];
//       let bValue = b[sortField];
      
//       // Handle null/undefined values
//       if (aValue === null || aValue === undefined) return 1;
//       if (bValue === null || bValue === undefined) return -1;
      
//       // Parse currency values for numeric comparison
//       if (sortField.includes('cost') || sortField.includes('value')) {
//         aValue = parseFloat(String(aValue).replace(/[^0-9.-]+/g, '')) || 0;
//         bValue = parseFloat(String(bValue).replace(/[^0-9.-]+/g, '')) || 0;
//       }
      
//       // String comparison
//       if (typeof aValue === 'string' && typeof bValue === 'string') {
//         aValue = aValue.toLowerCase();
//         bValue = bValue.toLowerCase();
//       }
      
//       if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
//       if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
//       return 0;
//     });
//   }, [assetDetails.data, sortField, sortDirection]);

//   // Export functions
//   const handleExport = async (format: 'excel' | 'pdf', scope: 'filtered' | 'all') => {
//     try {
//       let exportData: any[] = [];
      
//       if (scope === 'filtered') {
//         // Use current filtered/sorted data on screen
//         exportData = sortedData;
//       } else {
//         // Fetch ALL data from API
//         setShowExportModal(false);
        
//         // Get companyId from first asset or from context
//         const currentCompanyId = assetDetails.data[0]?.company_id;
        
//         if (!currentCompanyId) {
//           alert('Unable to determine company ID');
//           return;
//         }
        
//         // Show loading message
//         const loadingMessage = document.createElement('div');
//         loadingMessage.className = 'fixed top-4 right-4 bg-primary-500 text-white px-6 py-3 rounded-lg shadow-lg z-[10000] flex items-center gap-3';
//         loadingMessage.innerHTML = `
//           <svg class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
//             <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
//             <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
//           </svg>
//           <span>Fetching all ${assetDetails.pagination.total.toLocaleString()} assets...</span>
//         `;
//         document.body.appendChild(loadingMessage);
        
//         try {
//           // Build query string with current filters
//           const queryParams = new URLSearchParams({
//             limit: assetDetails.pagination.total.toString(),
//             offset: '0'
//           });

//           // Add current filters if any
//           if (filters) {
//             if (filters.categories?.length) {
//               queryParams.append('categories', filters.categories.join(','));
//             }
//             if (filters.departments?.length) {
//               queryParams.append('departments', filters.departments.join(','));
//             }
//             if (filters.owners?.length) {
//               queryParams.append('owners', filters.owners.join(','));
//             }
//             if (filters.cost_centers?.length) {
//               queryParams.append('cost_centers', filters.cost_centers.join(','));
//             }
//             if (filters.depreciation_enabled !== undefined) {
//               queryParams.append('depreciation_enabled', filters.depreciation_enabled.toString());
//             }
//             if (filters.insurance_status?.length) {
//               queryParams.append('insurance_status', filters.insurance_status.join(','));
//             }
//             if (filters.condition_status?.length) {
//               queryParams.append('condition_status', filters.condition_status.join(','));
//             }
//             if (filters.active_status?.length) {
//               queryParams.append('active_status', filters.active_status.join(','));
//             }
//           }

//           // Add search term if present
//           if (searchTerm) {
//             queryParams.append('searchTerm', searchTerm);
//           }
          
//           // Fetch all data
//           const response = await fetch(
//             `https://apinode.smartxhub.cloud/api/dashboard/asset/${currentCompanyId}/asset-details?${queryParams.toString()}`
//           );
          
//           if (!response.ok) {
//             throw new Error('Failed to fetch all data');
//           }
          
//           const result = await response.json();
          
//           if (result.success && result.data) {
//             exportData = result.data;
//           } else {
//             throw new Error('Invalid API response');
//           }
//         } catch (error) {
//           document.body.removeChild(loadingMessage);
//           throw error;
//         }
        
//         // Remove loading message
//         document.body.removeChild(loadingMessage);
//       }
      
//       if (format === 'excel') {
//         await exportToExcel(exportData, scope);
//       } else {
//         await exportToPDF(exportData, scope);
//       }
      
//     } catch (error) {
//       console.error('Export error:', error);
//       alert('Error exporting data. Please try again.');
//     }
//   };

//   const exportToExcel = async (data: any[], scope: string) => {
//     // Prepare data for Excel
//     const excelData = data.map(asset => ({
//       'Asset Code': asset.asset_code || '',
//       'Asset Name': asset.asset_name || '',
//       'Category': asset.category || '',
//       'Department': asset.department || '',
//       'Owner': asset.owner || '',
//       'Cost Center': asset.cost_center || '',
//       'Purchase Date': asset.purchase_date || '',
//       'Purchased From': asset.purchased_from || '',
//       'Purchase Cost': asset.purchase_cost || '',
//       'Replacement Cost': asset.replacement_cost || '',
//       'Current Book Value': asset.current_book_value || '',
//       'Depreciation Enabled': asset.depreciation_enabled || '',
//       'In Service Date': asset.in_service_date || '',
//       'Depreciation Months': asset.depreciation_months || '',
//       'Depreciated Value': asset.depreciated_value || '',
//       'Salvage Value': asset.salvage_value || '',
//       'Insurance Status': asset.insurance_status || '',
//       'Policy Number': asset.policy_number || '',
//       'Insurance Company': asset.insurance_company || '',
//       'Insurance Cost': asset.insurance_cost || '',
//       'Insurance Expiry': asset.insurance_expiry || '',
//       'Condition Status': asset.condition_status || '',
//       'Disposition': asset.disposition || '',
//       'Active Status': asset.active_status || '',
//       'Last Activity': asset.last_activity || '',
//       'Last Modified': asset.last_modified || ''
//     }));

//     // Create workbook and worksheet
//     const ws = XLSX.utils.json_to_sheet(excelData);
//     const wb = XLSX.utils.book_new();
//     XLSX.utils.book_append_sheet(wb, ws, 'Asset Financial Data');

//     // Set column widths
//     const colWidths = [
//       { wch: 15 }, // Asset Code
//       { wch: 30 }, // Asset Name
//       { wch: 20 }, // Category
//       { wch: 20 }, // Department
//       { wch: 20 }, // Owner
//       { wch: 15 }, // Cost Center
//       { wch: 12 }, // Purchase Date
//       { wch: 25 }, // Purchased From
//       { wch: 15 }, // Purchase Cost
//       { wch: 18 }, // Replacement Cost
//       { wch: 18 }, // Current Book Value
//       { wch: 12 }, // Depreciation Enabled
//       { wch: 15 }, // In Service Date
//       { wch: 12 }, // Depreciation Months
//       { wch: 15 }, // Depreciated Value
//       { wch: 15 }, // Salvage Value
//       { wch: 12 }, // Insurance Status
//       { wch: 15 }, // Policy Number
//       { wch: 25 }, // Insurance Company
//       { wch: 15 }, // Insurance Cost
//       { wch: 15 }, // Insurance Expiry
//       { wch: 15 }, // Condition Status
//       { wch: 15 }, // Disposition
//       { wch: 12 }, // Active Status
//       { wch: 15 }, // Last Activity
//       { wch: 15 }  // Last Modified
//     ];
//     ws['!cols'] = colWidths;

//     // Generate Excel file
//     const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
//     const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    
//     // Save file
//     const fileName = `asset-financial-${scope}-${new Date().toISOString().split('T')[0]}.xlsx`;
//     saveAs(blob, fileName);
//   };


// // Adicione essa função helper no início do componente, após os imports
// function normalizeBase64Image(base64: string): string {
//   if (!base64) return '';

//   let result = base64.trim();

//   // Se vier com prefixo data:image/...
//   if (result.startsWith('data:')) {
//     result = result.split(',')[1];
//   }

//   // Se NÃO começa com assinatura PNG, mas quando decodifica vira PNG → decode 1x
//   if (!result.startsWith('iVBORw0KGgo')) {
//     try {
//       const decoded = atob(result);

//       if (decoded.startsWith('iVBORw0KGgo')) {
//         result = decoded;
//       }
//     } catch (e) {
//       console.warn('Erro ao tentar decodificar base64 da logo');
//     }
//   }

//   return result;
// }

//   const exportToPDF = async (data: any[], scope: string) => {
//     const doc = new jsPDF({
//       orientation: 'landscape',
//       unit: 'mm',
//       format: 'a4'
//     });
    
//     let currentY = 15;

//     // ===== HEADER SECTION =====
//     // Background box for header
//     doc.setFillColor(37, 99, 235); // Blue-600
//     doc.roundedRect(10, 10, 277, 55, 3, 3, 'F');

//     // Add Logo (if available)
//     if (logo) {
//       try {
//         const finalBase64 = normalizeBase64Image(logo);

//         const logoWidth = 40;
//         const logoHeight = 12;
//         const logoX = 15;
//         const logoY = 14; //15

//         // Fundo branco para a logo
//         doc.setFillColor(255, 255, 255);
//         doc.roundedRect(logoX - 2, logoY - 2, logoWidth + 4, logoHeight + 4, 2, 2, 'F');

//         doc.addImage(
//           finalBase64,
//           'PNG',
//           logoX,
//           logoY,
//           logoWidth,
//           logoHeight,
//           undefined,
//           'FAST'
//         );

//         console.log('✅ Logo adicionada com sucesso ao PDF');
//       } catch (error) {
//         console.error('❌ Error adding logo to PDF:', error);
//       }
//     }

//     // Title - Posicionado à direita da logo
//     doc.setFontSize(18);
//     doc.setFont('helvetica', 'bold');
//     doc.setTextColor(255, 255, 255);
//     doc.text('Asset Financial Report', logo ? 60 : 15, 25);
//     currentY = 28;

//     // Divider line
//     doc.setDrawColor(255, 255, 255);
//     doc.setLineWidth(0.3);
//     doc.line(15, currentY, 282, currentY);
//     currentY += 6;

//     // Metadata section
//     doc.setFontSize(9);
//     doc.setFont('helvetica', 'normal');
//     doc.setTextColor(255, 255, 255);

//     // Column 1
//     let col1Y = currentY;
//     doc.setFont('helvetica', 'bold');
//     doc.text('Export Date:', 15, col1Y);
//     doc.setFont('helvetica', 'normal');
//     doc.text(new Date().toLocaleString('pt-BR'), 43, col1Y);
//     col1Y += 5;

//     doc.setFont('helvetica', 'bold');
//     doc.text('Scope:', 15, col1Y);
//     doc.setFont('helvetica', 'normal');
//     doc.text(scope === 'filtered' ? 'Filtered Results' : 'All Assets', 43, col1Y);
//     col1Y += 5;

//     doc.setFont('helvetica', 'bold');
//     doc.text('Total Assets:', 15, col1Y);
//     doc.setFont('helvetica', 'normal');
//     doc.text(data.length.toLocaleString(), 43, col1Y);

//     // Calculate statistics
//     const totalPurchaseCost = data.reduce((sum, asset) => {
//       const cost = parseFloat(String(asset.purchase_cost || '0').replace(/[^0-9.-]+/g, '')) || 0;
//       return sum + cost;
//     }, 0);

//     // Group by category
//     const categoryStats = data.reduce((acc, asset) => {
//       const category = asset.category || 'Uncategorized';
//       if (!acc[category]) {
//         acc[category] = 0;
//       }
//       acc[category]++;
//       return acc;
//     }, {} as Record<string, number>);

//     // Group by department
//     const departmentStats = data.reduce((acc, asset) => {
//       const department = asset.department || 'Unassigned';
//       if (!acc[department]) {
//         acc[department] = 0;
//       }
//       acc[department]++;
//       return acc;
//     }, {} as Record<string, number>);

//     // Column 2 - Financial Summary
//     const financialX = 90;
//     const financialY = currentY;
    
//     doc.setFillColor(255, 255, 255);
//     doc.roundedRect(financialX, financialY - 4, 65, 20, 2, 2, 'F');
    
//     doc.setTextColor(37, 99, 235);
//     doc.setFont('helvetica', 'bold');
//     doc.setFontSize(10);
//     doc.text('FINANCIAL SUMMARY', financialX + 32.5, financialY + 1, { align: 'center' });
    
//     doc.setFontSize(8);
//     doc.setTextColor(60, 60, 60);
//     doc.setFont('helvetica', 'normal');
//     doc.text('Total Purchase Cost:', financialX + 3, financialY + 7);
//     doc.setFont('helvetica', 'bold');
//     doc.setFontSize(11);
//     doc.setTextColor(34, 197, 94);
//     doc.text(`R$ ${totalPurchaseCost.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, financialX + 32.5, financialY + 13, { align: 'center' });

//     // Column 3 - Category Distribution
//     const categoryX = 165;
//     const categoryY = currentY;
    
//     doc.setFillColor(255, 255, 255);
//     doc.roundedRect(categoryX, categoryY - 4, 55, 20, 2, 2, 'F');
    
//     doc.setTextColor(37, 99, 235);
//     doc.setFont('helvetica', 'bold');
//     doc.setFontSize(10);
//     doc.text('BY CATEGORY', categoryX + 27.5, categoryY + 1, { align: 'center' });
    
//     doc.setFontSize(7);
//     doc.setTextColor(60, 60, 60);
    
//     const topCategories = Object.entries(categoryStats)
//     //@ts-ignore
//       .sort(([, a], [, b]) => b - a)
//       .slice(0, 2);
    
//     let catY = categoryY + 6;
//     topCategories.forEach(([category, count]) => {
//       doc.setFont('helvetica', 'normal');
//       doc.text(category.substring(0, 20) + ':', categoryX + 3, catY);
//       doc.setFont('helvetica', 'bold');
//       doc.text(String(count), categoryX + 52, catY, { align: 'right' });
//       catY += 4;
//     });
    
//     if (Object.keys(categoryStats).length > 2) {
//       doc.setFont('helvetica', 'italic');
//       doc.setTextColor(107, 114, 128);
//       doc.text(`+${Object.keys(categoryStats).length - 2} more...`, categoryX + 3, catY);
//     }

//     // Column 4 - Department Distribution
//     const deptX = 230;
//     const deptY = currentY;
    
//     doc.setFillColor(255, 255, 255);
//     doc.roundedRect(deptX, deptY - 4, 52, 20, 2, 2, 'F');
    
//     doc.setTextColor(37, 99, 235);
//     doc.setFont('helvetica', 'bold');
//     doc.setFontSize(10);
//     doc.text('BY DEPARTMENT', deptX + 26, deptY + 1, { align: 'center' });
    
//     doc.setFontSize(7);
//     doc.setTextColor(60, 60, 60);
    
//     const topDepartments = Object.entries(departmentStats)
//     //@ts-ignore
//       .sort(([, a], [, b]) => b - a)
//       .slice(0, 2);
    
//     let deptYPos = deptY + 6;
//     topDepartments.forEach(([department, count]) => {
//       doc.setFont('helvetica', 'normal');
//       doc.text(department.substring(0, 18) + ':', deptX + 3, deptYPos);
//       doc.setFont('helvetica', 'bold');
//       doc.text(String(count), deptX + 49, deptYPos, { align: 'right' });
//       deptYPos += 4;
//     });
    
//     if (Object.keys(departmentStats).length > 2) {
//       doc.setFont('helvetica', 'italic');
//       doc.setTextColor(107, 114, 128);
//       doc.text(`+${Object.keys(departmentStats).length - 2} more...`, deptX + 3, deptYPos);
//     }

//     currentY = 67;

//     // Filters applied (if any)
//     if (Object.keys(filters).length > 0) {
//       doc.setFontSize(8);
//       doc.setFont('helvetica', 'normal');
//       doc.setTextColor(107, 114, 128);
//       doc.text(`Filters Applied: ${Object.keys(filters).length}`, 15, currentY);
//       currentY += 3;
//     }

//     currentY += 5;

//     // Prepare table data
//     const tableData = data.map(asset => [
//       asset.asset_code || '',
//       asset.asset_name || '',
//       asset.category || '',
//       asset.department || '',
//       asset.purchase_cost || '',
//       asset.purchased_from || '',
//       asset.insurance_status || '',
//       asset.active_status || ''
//     ]);

//     // Add table using autoTable
//     autoTable(doc, {
//       head: [['Asset Code', 'Asset Name', 'Category', 'Department', 'Purchase Cost', 'Purchased From', 'Insurance', 'Status']],
//       body: tableData,
//       startY: currentY,
//       theme: 'striped',
//       styles: { 
//         fontSize: 7, 
//         cellPadding: 2,
//         lineColor: [229, 231, 235],
//         lineWidth: 0.1,
//         font: 'helvetica',
//         textColor: [31, 41, 55]
//       },
//       headStyles: {
//         fillColor: [37, 99, 235],
//         textColor: [255, 255, 255],
//         fontStyle: 'bold',
//         fontSize: 8,
//         halign: 'left'
//       },
//       alternateRowStyles: {
//         fillColor: [248, 250, 252]
//       },
//       columnStyles: {
//         0: { cellWidth: 25 },
//         1: { cellWidth: 55 },
//         2: { cellWidth: 35 },
//         3: { cellWidth: 35 },
//         4: { cellWidth: 28 },
//         5: { cellWidth: 28 },
//         6: { cellWidth: 22 },
//         7: { cellWidth: 20 }
//       },
//       margin: { top: 10, right: 10, bottom: 10, left: 14 },
//       didDrawCell: (data: any) => {
//         if (data.column.index === 6 && data.cell.section === 'body') {
//           const value = data.cell.raw;
//           if (value === 'Active') {
//             doc.setFillColor(209, 250, 229);
//             doc.setTextColor(6, 95, 70);
//           } else if (value === 'Expired') {
//             doc.setFillColor(254, 226, 226);
//             doc.setTextColor(153, 27, 27);
//           }
//         }
//         if (data.column.index === 7 && data.cell.section === 'body') {
//           const value = data.cell.raw;
//           if (value === 'Active') {
//             doc.setFillColor(219, 234, 254);
//             doc.setTextColor(30, 64, 175);
//           } else {
//             doc.setFillColor(243, 244, 246);
//             doc.setTextColor(107, 114, 128);
//           }
//         }
//       }
//     });

//     // Add footer with statistics and page numbers
//     const pageCount = doc.internal.pages.length - 1;
//     for (let i = 1; i <= pageCount; i++) {
//       doc.setPage(i);
      
//       const pageHeight = doc.internal.pageSize.getHeight();
//       doc.setFillColor(249, 250, 251);
//       doc.rect(10, pageHeight - 15, 277, 10, 'F');
      
//       doc.setFontSize(8);
//       doc.setTextColor(107, 114, 128);
//       doc.text(
//         `Page ${i} of ${pageCount}`,
//         doc.internal.pageSize.getWidth() / 2,
//         pageHeight - 8,
//         { align: 'center' }
//       );
      
//       doc.setFontSize(7);
//       doc.text(
//         `Generated: ${new Date().toLocaleDateString('pt-BR')} | SmartX Asset Management`,
//         15,
//         pageHeight - 8
//       );
      
//       doc.text(
//         `Total: ${data.length} assets`,
//         doc.internal.pageSize.getWidth() - 15,
//         pageHeight - 8,
//         { align: 'right' }
//       );
//     }

//     doc.save(`asset-financial-${scope}-${new Date().toISOString().split('T')[0]}.pdf`);
//   };

//   // Calculate pagination values
//   const totalPages = Math.ceil(assetDetails.pagination.total / itemsPerPage);
//   const startItem = (currentPage - 1) * itemsPerPage + 1;
//   const endItem = Math.min(currentPage * itemsPerPage, assetDetails.pagination.total);

//   // SortHeader component
//   const SortHeader = ({ field, children }: { field: string; children: React.ReactNode }) => (
//     <th 
//       className="px-3 py-1.5 text-left text-[10px] font-bold text-gray-700 uppercase tracking-wide cursor-pointer hover:bg-gray-200 transition-colors select-none"
//       onClick={() => handleSort(field)}
//     >
//       <div className="flex items-center gap-1">
//         <span>{children}</span>
//         {sortField === field ? (
//           sortDirection === 'asc' ? (
//             <ChevronUpIcon className="w-3 h-3" />
//           ) : (
//             <ChevronDownIcon className="w-3 h-3" />
//           )
//         ) : (
//           <ArrowsUpDownIcon className="w-3 h-3 opacity-30" />
//         )}
//       </div>
//     </th>
//   );

//   // Generate page numbers to display
//   const getPageNumbers = () => {
//     const pages = [];
//     const maxVisible = 5;
    
//     if (totalPages <= maxVisible) {
//       for (let i = 1; i <= totalPages; i++) {
//         pages.push(i);
//       }
//     } else {
//       if (currentPage <= 3) {
//         for (let i = 1; i <= 4; i++) pages.push(i);
//         pages.push('...');
//         pages.push(totalPages);
//       } else if (currentPage >= totalPages - 2) {
//         pages.push(1);
//         pages.push('...');
//         for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
//       } else {
//         pages.push(1);
//         pages.push('...');
//         pages.push(currentPage - 1);
//         pages.push(currentPage);
//         pages.push(currentPage + 1);
//         pages.push('...');
//         pages.push(totalPages);
//       }
//     }
    
//     return pages;
//   };

//   if (assetDetails.loading && assetDetails.data.length === 0) {
//     return (
//       <div className="bg-white rounded-xl shadow-sm p-12">
//         <div className="flex flex-col items-center justify-center">
//           <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary-500 mb-4"></div>
//           <p className="text-gray-600 font-medium">Loading asset details...</p>
//           <p className="text-gray-500 text-sm mt-2">Please wait while we fetch the data</p>
//         </div>
//       </div>
//     );
//   }

//   if (assetDetails.error) {
//     return (
//       <div className="bg-white rounded-xl shadow-sm p-6">
//         <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
//           <div className="flex items-center">
//             <div className="flex-shrink-0">
//               <XMarkIcon className="h-5 w-5 text-red-500" />
//             </div>
//             <div className="ml-3">
//               <p className="text-sm text-red-800 font-medium">Error loading data</p>
//               <p className="text-sm text-red-700 mt-1">{assetDetails.error}</p>
//             </div>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="space-y-5">
//       {/* Header Section */}
//       <div className="bg-white rounded-xl shadow-sm p-6">
//         <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
//           <div>
//             <h2 className="text-xl font-bold text-gray-900">Asset Financial Details</h2>
//             <p className="text-sm text-gray-600 mt-1">
//               Complete financial information for all assets
//             </p>
//           </div>
          
//           <div className="flex items-center gap-3">
//             <button
//               onClick={() => assetDetails.fetch(filters, itemsPerPage, (currentPage - 1) * itemsPerPage)}
//               disabled={assetDetails.loading}
//               className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
//             >
//               <ArrowPathIcon className={`w-4 h-4 ${assetDetails.loading ? 'animate-spin' : ''}`} />
//               <span className="text-sm font-medium">Refresh</span>
//             </button>
            
//             <button
//               onClick={() => setShowExportModal(true)}
//               className="flex items-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
//             >
//               <ArrowDownTrayIcon className="w-4 h-4" />
//               <span className="text-sm font-medium">Export</span>
//             </button>
//           </div>
//         </div>

//         {/* Search and Filters */}
//         <div className="space-y-4">
//           <div className="flex flex-col md:flex-row gap-3">
//             {/* Search Bar */}
//             <div className="flex-1 relative">
//               <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
//               <input
//                 type="text"
//                 value={searchTerm}
//                 onChange={(e) => handleSearch(e.target.value)}
//                 placeholder="Search by code, name, category, department..."
//                 className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
//               />
//             </div>

//             {/* Filter Toggle */}
//             <button
//               onClick={() => setShowFilters(!showFilters)}
//               className={`flex items-center gap-2 px-4 py-2.5 border rounded-lg transition-all ${
//                 showFilters 
//                   ? 'bg-primary-50 border-primary-500 text-primary-700' 
//                   : 'bg-white border-gray-300 hover:bg-gray-50'
//               }`}
//             >
//               <FunnelIcon className="w-5 h-5" />
//               <span className="text-sm font-medium">Filters</span>
//               {Object.keys(filters).length > 0 && (
//                 <span className="px-2 py-0.5 bg-primary-500 text-white text-xs rounded-full">
//                   {Object.keys(filters).length}
//                 </span>
//               )}
//             </button>
//           </div>

//           {/* Filter Panel */}
//           {showFilters && (
//             <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
//               {/* Active Status Filter */}
//               <div>
//                 <label className="block text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">
//                   Status
//                 </label>
//                 <select
//                   onChange={(e) => {
//                     const value = e.target.value;
//                     handleFilterChange({
//                       active_status: value ? [value] : undefined,
//                     });
//                   }}
//                   className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white"
//                 >
//                   <option value="">All Status</option>
//                   <option value="Active">Active</option>
//                   <option value="Inactive">Inactive</option>
//                 </select>
//               </div>

//               {/* Insurance Status Filter */}
//               <div>
//                 <label className="block text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">
//                   Insurance
//                 </label>
//                 <select
//                   onChange={(e) => {
//                     const value = e.target.value;
//                     handleFilterChange({
//                       insurance_status: value ? [value] : undefined,
//                     });
//                   }}
//                   className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white"
//                 >
//                   <option value="">All Insurance</option>
//                   <option value="Active">Active</option>
//                   <option value="Expired">Expired</option>
//                 </select>
//               </div>

//               {/* Depreciation Filter */}
//               <div>
//                 <label className="block text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">
//                   Depreciation
//                 </label>
//                 <select
//                   onChange={(e) => {
//                     const value = e.target.value;
//                     handleFilterChange({
//                       depreciation_enabled: value ? parseInt(value) : undefined,
//                     });
//                   }}
//                   className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white"
//                 >
//                   <option value="">All Assets</option>
//                   <option value="1">Enabled</option>
//                   <option value="0">Disabled</option>
//                 </select>
//               </div>

//               {/* Clear Filters */}
//               <div className="flex items-end">
//                 <button
//                   onClick={clearFilters}
//                   className="w-full px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
//                 >
//                   Clear All
//                 </button>
//               </div>
//             </div>
//           )}
//         </div>

//         {/* Results Summary */}
//         <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
//           <div className="text-sm text-gray-600">
//             Showing <span className="font-semibold text-gray-900">{startItem}</span> to{' '}
//             <span className="font-semibold text-gray-900">{endItem}</span> of{' '}
//             <span className="font-semibold text-gray-900">{assetDetails.pagination.total}</span> assets
//           </div>
          
//           <div className="flex items-center gap-2">
//             <label className="text-sm text-gray-600">Show:</label>
//             <select
//               value={itemsPerPage}
//               onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
//               className="px-3 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm"
//             >
//               <option value={10}>10</option>
//               <option value={25}>25</option>
//               <option value={50}>50</option>
//               <option value={100}>100</option>
//             </select>
//           </div>
//         </div>
//       </div>

//       {/* Table */}
//       <div className="bg-white rounded-xl shadow-sm overflow-hidden">
//         <div className={`overflow-x-auto ${assetDetails.pagination.total > 50 ? 'max-h-[600px] overflow-y-auto' : ''}`}>
//           <table className="min-w-full divide-y divide-gray-200">
//             <thead className="bg-gradient-to-r from-gray-50 to-gray-100 sticky top-0 z-10">
//               <tr>
//                 <SortHeader field="asset_code">Asset Code</SortHeader>
//                 <SortHeader field="asset_name">Asset Name</SortHeader>
//                 <SortHeader field="category">Category</SortHeader>
//                 <SortHeader field="department">Department</SortHeader>
//                 <SortHeader field="purchase_cost">Purchase Cost</SortHeader>
//                 <SortHeader field="purchased_from">Purchased From</SortHeader>
//                 <SortHeader field="insurance_status">Insurance</SortHeader>
//                 <SortHeader field="active_status">Status</SortHeader>
//                 <SortHeader field="condition_status">Condition Status</SortHeader>
//               </tr>
//             </thead>
//             <tbody className="bg-white divide-y divide-gray-200">
//               {sortedData.map((asset: any, index: number) => (
//                 <tr 
//                   key={asset.asset_code} 
//                   className={`hover:bg-primary-50 transition-colors ${
//                     index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
//                   }`}
//                 >
//                   <td className="px-3 py-1 whitespace-nowrap">
//                     <div className="text-[10px] font-semibold text-gray-900">{asset.asset_code}</div>
//                   </td>
//                   <td className="px-3 py-1">
//                     <div className="text-[10px] font-medium text-gray-900 truncate max-w-[200px]">{asset.asset_name}</div>
//                   </td>
//                   <td className="px-3 py-1 whitespace-nowrap">
//                     <div className="text-[10px] text-gray-700">{asset.category}</div>
//                   </td>
//                   <td className="px-3 py-1 whitespace-nowrap">
//                     <div className="text-[10px] text-gray-700">{asset.department || '-'}</div>
//                   </td>
//                   <td className="px-3 py-1 whitespace-nowrap">
//                     <div className="text-[10px] font-semibold text-gray-900">{asset.purchase_cost}</div>
//                   </td>
//                   <td className="px-3 py-1 whitespace-nowrap">
//                     <div className="text-[10px] font-semibold text-primary-600">
//                       {asset.purchased_from}
//                     </div>
//                   </td>
//                   <td className="px-3 py-1 whitespace-nowrap">
//                     <span
//                       className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-semibold ${
//                         asset.insurance_status === 'Active'
//                           ? 'bg-emerald-100 text-emerald-800'
//                           : 'bg-red-100 text-red-800'
//                       }`}
//                     >
//                       {asset.insurance_status}
//                     </span>
//                   </td>
//                   <td className="px-3 py-1 whitespace-nowrap">
//                     <span
//                       className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-semibold ${
//                         asset.active_status === 'Active'
//                           ? 'bg-blue-100 text-blue-800'
//                           : 'bg-gray-100 text-gray-800'
//                       }`}
//                     >
//                       {asset.active_status}
//                     </span>
//                   </td>


//                   <td  className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-[5px] font-semibold bg-emerald-100 text-emerald-800`}>
//                     <div className="text-[8px] font-medium text-gray-900 truncate max-w-[200px]">{asset.condition_status}</div>
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>

//         {/* Loading Overlay */}
//         {assetDetails.loading && assetDetails.data.length > 0 && (
//           <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center">
//             <div className="flex flex-col items-center">
//               <div className="animate-spin rounded-full h-10 w-10 border-b-3 border-primary-500"></div>
//               <p className="text-sm text-gray-600 mt-2">Loading...</p>
//             </div>
//           </div>
//         )}
//       </div>

//       {/* Pagination */}
//       {assetDetails.pagination.total > 0 && (
//         <div className="bg-white rounded-xl shadow-sm p-4">
//           <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
//             {/* Page Info */}
//             <div className="text-sm text-gray-600">
//               Page <span className="font-semibold text-gray-900">{currentPage}</span> of{' '}
//               <span className="font-semibold text-gray-900">{totalPages}</span>
//             </div>

//             {/* Page Numbers */}
//             <div className="flex items-center gap-1">
//               {/* Previous Button */}
//               <button
//                 onClick={() => handlePageChange(currentPage - 1)}
//                 disabled={currentPage === 1 || assetDetails.loading}
//                 className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
//               >
//                 <ChevronLeftIcon className="w-5 h-5" />
//               </button>

//               {/* Page Numbers */}
//               {getPageNumbers().map((page, index) => (
//                 <React.Fragment key={index}>
//                   {page === '...' ? (
//                     <span className="px-3 py-2 text-gray-400">...</span>
//                   ) : (
//                     <button
//                       onClick={() => handlePageChange(page as number)}
//                       disabled={assetDetails.loading}
//                       className={`min-w-[40px] px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
//                         currentPage === page
//                           ? 'bg-primary-500 text-white'
//                           : 'border border-gray-300 hover:bg-gray-50 text-gray-700'
//                       } disabled:opacity-50`}
//                     >
//                       {page}
//                     </button>
//                   )}
//                 </React.Fragment>
//               ))}

//               {/* Next Button */}
//               <button
//                 onClick={() => handlePageChange(currentPage + 1)}
//                 disabled={currentPage === totalPages || assetDetails.loading}
//                 className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
//               >
//                 <ChevronRightIcon className="w-5 h-5" />
//               </button>
//             </div>

//             {/* Quick Jump */}
//             <div className="flex items-center gap-2">
//               <label className="text-sm text-gray-600">Go to:</label>
//               <input
//                 type="number"
//                 min={1}
//                 max={totalPages}
//                 value={currentPage}
//                 onChange={(e) => {
//                   const page = parseInt(e.target.value);
//                   if (page >= 1 && page <= totalPages) {
//                     handlePageChange(page);
//                   }
//                 }}
//                 className="w-16 px-2 py-1.5 border border-gray-300 rounded-lg text-sm text-center focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
//               />
//             </div>
//           </div>
//         </div>
//       )}

//       {/* No Results */}
//       {sortedData.length === 0 && !assetDetails.loading && (
//         <div className="bg-white rounded-xl shadow-sm p-12">
//           <div className="text-center">
//             <svg
//               className="mx-auto h-16 w-16 text-gray-400"
//               fill="none"
//               viewBox="0 0 24 24"
//               stroke="currentColor"
//             >
//               <path
//                 strokeLinecap="round"
//                 strokeLinejoin="round"
//                 strokeWidth={1.5}
//                 d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
//               />
//             </svg>
//             <h3 className="mt-4 text-lg font-semibold text-gray-900">No assets found</h3>
//             <p className="mt-2 text-sm text-gray-500">
//               Try adjusting your search or filter criteria to find what you're looking for.
//             </p>
//             <button
//               onClick={clearFilters}
//               className="mt-6 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors text-sm font-medium"
//             >
//               Clear Filters
//             </button>
//           </div>
//         </div>
//       )}

//       {/* Export Modal */}
//       {showExportModal && (
//         <div className="fixed inset-0 z-[9999] overflow-y-auto">
//           <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center">
//             {/* Background overlay */}
//             <div
//               className="fixed inset-0 bg-gray-900 bg-opacity-50 transition-opacity"
//               onClick={() => setShowExportModal(false)}
//             />

//             {/* Modal panel */}
//             <div className="relative inline-block w-full max-w-lg my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-2xl rounded-xl z-[10000]">
//               {/* Header */}
//               <div className="bg-gradient-to-r from-primary-500 to-primary-600 px-6 py-4">
//                 <div className="flex items-center justify-between">
//                   <div className="flex items-center gap-3">
//                     <ArrowDownTrayIcon className="w-6 h-6 text-white" />
//                     <h3 className="text-lg font-bold text-white">Export Asset Data</h3>
//                   </div>
//                   <button
//                     onClick={() => setShowExportModal(false)}
//                     className="text-white hover:text-gray-200 transition-colors"
//                   >
//                     <XMarkIcon className="w-6 h-6" />
//                   </button>
//                 </div>
//               </div>

//               {/* Content */}
//               <div className="px-6 py-6">
//                 <p className="text-sm text-gray-600 mb-6">
//                   Choose the format and scope of data to export
//                 </p>

//                 {/* Export Options Grid */}
//                 <div className="grid grid-cols-2 gap-4">
//                   {/* Excel - Filtered */}
//                   <button
//                     onClick={() => handleExport('excel', 'filtered')}
//                     className="flex flex-col items-center gap-3 p-6 border-2 border-gray-200 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-all group"
//                   >
//                     <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center group-hover:bg-green-200 transition-colors">
//                       <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 24 24">
//                         <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zm4 18H6V4h7v5h5v11z"/>
//                         <path d="M8 12h8v2H8zm0 4h8v2H8zm0-8h5v2H8z"/>
//                       </svg>
//                     </div>
//                     <div className="text-center">
//                       <div className="font-semibold text-gray-900 text-sm">Excel (CSV)</div>
//                       <div className="text-xs text-gray-600 mt-1">Filtered Results</div>
//                       <div className="text-xs text-primary-600 font-medium mt-1">
//                         {sortedData.length} assets
//                       </div>
//                     </div>
//                   </button>

//                   {/* Excel - All */}
//                   <button
//                     onClick={() => handleExport('excel', 'all')}
//                     className="flex flex-col items-center gap-3 p-6 border-2 border-gray-200 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-all group"
//                   >
//                     <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center group-hover:bg-green-200 transition-colors">
//                       <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 24 24">
//                         <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zm4 18H6V4h7v5h5v11z"/>
//                         <path d="M8 12h8v2H8zm0 4h8v2H8zm0-8h5v2H8z"/>
//                       </svg>
//                     </div>
//                     <div className="text-center">
//                       <div className="font-semibold text-gray-900 text-sm">Excel (CSV)</div>
//                       <div className="text-xs text-gray-600 mt-1">All Data</div>
//                       <div className="text-xs text-primary-600 font-medium mt-1">
//                         {assetDetails.pagination.total} assets
//                       </div>
//                     </div>
//                   </button>

//                   {/* PDF - Filtered */}
//                   <button
//                     onClick={() => handleExport('pdf', 'filtered')}
//                     className="flex flex-col items-center gap-3 p-6 border-2 border-gray-200 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-all group"
//                   >
//                     <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center group-hover:bg-red-200 transition-colors">
//                       <svg className="w-6 h-6 text-red-600" fill="currentColor" viewBox="0 0 24 24">
//                         <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zm4 18H6V4h7v5h5v11z"/>
//                         <path d="M9 13h6v2H9zm0 4h6v2H9z"/>
//                       </svg>
//                     </div>
//                     <div className="text-center">
//                       <div className="font-semibold text-gray-900 text-sm">PDF Report</div>
//                       <div className="text-xs text-gray-600 mt-1">Filtered Results</div>
//                       <div className="text-xs text-primary-600 font-medium mt-1">
//                         {sortedData.length} assets
//                       </div>
//                     </div>
//                   </button>

//                   {/* PDF - All */}
//                   <button
//                     onClick={() => handleExport('pdf', 'all')}
//                     className="flex flex-col items-center gap-3 p-6 border-2 border-gray-200 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-all group"
//                   >
//                     <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center group-hover:bg-red-200 transition-colors">
//                       <svg className="w-6 h-6 text-red-600" fill="currentColor" viewBox="0 0 24 24">
//                         <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zm4 18H6V4h7v5h5v11z"/>
//                         <path d="M9 13h6v2H9zm0 4h6v2H9z"/>
//                       </svg>
//                     </div>
//                     <div className="text-center">
//                       <div className="font-semibold text-gray-900 text-sm">PDF Report</div>
//                       <div className="text-xs text-gray-600 mt-1">All Data</div>
//                       <div className="text-xs text-primary-600 font-medium mt-1">
//                         {assetDetails.pagination.total} assets
//                       </div>
//                     </div>
//                   </button>
//                 </div>

//                 {/* Info Notice */}
//                 <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
//                   <div className="flex gap-3">
//                     <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
//                       <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
//                     </svg>
//                     <div className="text-xs text-blue-800">
//                       <strong>Filtered Results:</strong> Exports only visible data based on current search and filters
//                       <br />
//                       <strong>All Data:</strong> Exports complete dataset ({assetDetails.pagination.total} assets)
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default AssetFinancialGrid;


// src/components/AssetManagement/DataGrid/AssetFinancialGrid.tsx
import React, { useEffect, useState } from 'react';
import useAssetManagement from '../../../hooks/useAssetManagement';
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
  MapPinIcon
} from '@heroicons/react/24/outline';
import jsPDF from 'jspdf';
//@ts-ignore
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
//@ts-ignore
import { saveAs } from 'file-saver';
import { useCompany } from '../../../hooks/useCompany';

interface AssetDetailsTableProps {
  initialFilters?: {
    categories?: string[];
    departments?: string[];
    active_status?: string[];
    insurance_status?: string[];
    owners?: string[];
    cost_centers?: string[];
    depreciation_enabled?: number;
    condition_status?: string[];
    sites?: string[];
    areas?: string[];
    zones?: string[];
  };
}

const AssetFinancialGrid: React.FC<AssetDetailsTableProps> = ({ initialFilters }) => {
  const { assetDetails } = useAssetManagement();
  const {logo} = useCompany()
  const [filters, setFilters] = useState(initialFilters || {});
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  //@ts-ignore
  const [selectedAsset, setSelectedAsset] = useState<any>(null);
  const [sortField, setSortField] = useState<string>('');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [showExportModal, setShowExportModal] = useState(false);

  // Load initial data
  useEffect(() => {
    assetDetails.fetch(filters, itemsPerPage, 0);
    setCurrentPage(1);
  }, []);

  // Handle filter changes
  const handleFilterChange = (newFilters: any) => {
    const updatedFilters = { ...filters, ...newFilters };
    setFilters(updatedFilters);
    setCurrentPage(1);
    assetDetails.fetch(updatedFilters, itemsPerPage, 0);
  };

  // Handle search with debounce
  const handleSearch = (term: string) => {
    setSearchTerm(term);
    setCurrentPage(1);
    assetDetails.fetch({ ...filters, searchTerm: term }, itemsPerPage, 0);
  };

  // Handle page change
  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    const offset = (newPage - 1) * itemsPerPage;
    assetDetails.fetch({ ...filters, searchTerm }, itemsPerPage, offset);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handle items per page change
  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
    assetDetails.fetch({ ...filters, searchTerm }, newItemsPerPage, 0);
  };

  // Clear all filters
  const clearFilters = () => {
    setFilters({});
    setSearchTerm('');
    setCurrentPage(1);
    assetDetails.fetch({}, itemsPerPage, 0);
  };

  // Handle sort
  const handleSort = (field: string) => {
    const newDirection = sortField === field && sortDirection === 'asc' ? 'desc' : 'asc';
    setSortField(field);
    setSortDirection(newDirection);
  };

  // Sort data based on current sort field and direction
  const sortedData = React.useMemo(() => {
    if (!sortField) return assetDetails.data;
    
    return [...assetDetails.data].sort((a: any, b: any) => {
      let aValue = a[sortField];
      let bValue = b[sortField];
      
      // Handle null/undefined values
      if (aValue === null || aValue === undefined) return 1;
      if (bValue === null || bValue === undefined) return -1;
      
      // Parse currency values for numeric comparison
      if (sortField.includes('cost') || sortField.includes('value')) {
        aValue = parseFloat(String(aValue).replace(/[^0-9.-]+/g, '')) || 0;
        bValue = parseFloat(String(bValue).replace(/[^0-9.-]+/g, '')) || 0;
      }
      
      // String comparison
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }
      
      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [assetDetails.data, sortField, sortDirection]);

  // Get unique values for location filters
  const uniqueSites = React.useMemo(() => {
    const sites = new Set(assetDetails.data.map((a: any) => a.location_site_current_name).filter(Boolean));
    return Array.from(sites).sort();
  }, [assetDetails.data]);

  const uniqueAreas = React.useMemo(() => {
    const areas = new Set(assetDetails.data.map((a: any) => a.location_area_current_description).filter(Boolean));
    return Array.from(areas).sort();
  }, [assetDetails.data]);

  const uniqueZones = React.useMemo(() => {
    const zones = new Set(assetDetails.data.map((a: any) => a.location_zone_current_description).filter(Boolean));
    return Array.from(zones).sort();
  }, [assetDetails.data]);

  // Export functions (updated with location fields)
  const handleExport = async (format: 'excel' | 'pdf', scope: 'filtered' | 'all') => {
    try {
      let exportData: any[] = [];
      
      if (scope === 'filtered') {
        exportData = sortedData;
      } else {
        setShowExportModal(false);
        
        const currentCompanyId = assetDetails.data[0]?.company_id;
        
        if (!currentCompanyId) {
          alert('Unable to determine company ID');
          return;
        }
        
        const loadingMessage = document.createElement('div');
        loadingMessage.className = 'fixed top-4 right-4 bg-primary-500 text-white px-6 py-3 rounded-lg shadow-lg z-[10000] flex items-center gap-3';
        loadingMessage.innerHTML = `
          <svg class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span>Fetching all ${assetDetails.pagination.total.toLocaleString()} assets...</span>
        `;
        document.body.appendChild(loadingMessage);
        
        try {
          const queryParams = new URLSearchParams({
            limit: assetDetails.pagination.total.toString(),
            offset: '0'
          });

          if (filters) {
            if (filters.categories?.length) queryParams.append('categories', filters.categories.join(','));
            if (filters.departments?.length) queryParams.append('departments', filters.departments.join(','));
            if (filters.owners?.length) queryParams.append('owners', filters.owners.join(','));
            if (filters.cost_centers?.length) queryParams.append('cost_centers', filters.cost_centers.join(','));
            if (filters.depreciation_enabled !== undefined) queryParams.append('depreciation_enabled', filters.depreciation_enabled.toString());
            if (filters.insurance_status?.length) queryParams.append('insurance_status', filters.insurance_status.join(','));
            if (filters.condition_status?.length) queryParams.append('condition_status', filters.condition_status.join(','));
            if (filters.active_status?.length) queryParams.append('active_status', filters.active_status.join(','));
            if (filters.sites?.length) queryParams.append('sites', filters.sites.join(','));
            if (filters.areas?.length) queryParams.append('areas', filters.areas.join(','));
            if (filters.zones?.length) queryParams.append('zones', filters.zones.join(','));
          }

          if (searchTerm) {
            queryParams.append('searchTerm', searchTerm);
          }
          
          const response = await fetch(
            `https://apinode.smartxhub.cloud/api/dashboard/asset/${currentCompanyId}/asset-details?${queryParams.toString()}`
          );
          
          if (!response.ok) {
            throw new Error('Failed to fetch all data');
          }
          
          const result = await response.json();
          
          if (result.success && result.data) {
            exportData = result.data;
          } else {
            throw new Error('Invalid API response');
          }
        } catch (error) {
          document.body.removeChild(loadingMessage);
          throw error;
        }
        
        document.body.removeChild(loadingMessage);
      }
      
      if (format === 'excel') {
        await exportToExcel(exportData, scope);
      } else {
        await exportToPDF(exportData, scope);
      }
      
    } catch (error) {
      console.error('Export error:', error);
      alert('Error exporting data. Please try again.');
    }
  };

  const exportToExcel = async (data: any[], scope: string) => {
    const excelData = data.map(asset => ({
      'Asset Code': asset.asset_code || '',
      'Asset Name': asset.asset_name || '',
      'Brand': asset.brand || '',
      'Model': asset.model || '',
      'Site': asset.location_site_current_name || '',
      'Area': asset.location_area_current_description || '',
      'Zone': asset.location_zone_current_description || '',
      'Category': asset.category || '',
      'Department': asset.department || '',
      'Owner': asset.owner || '',
      'Cost Center': asset.cost_center || '',
      'Purchase Date': asset.purchase_date || '',
      'Purchased From': asset.purchased_from || '',
      'Purchase Cost': asset.purchase_cost || '',
      'Replacement Cost': asset.replacement_cost || '',
      'Current Book Value': asset.current_book_value || '',
      'Depreciation Enabled': asset.depreciation_enabled || '',
      'In Service Date': asset.in_service_date || '',
      'Depreciation Months': asset.depreciation_months || '',
      'Depreciated Value': asset.depreciated_value || '',
      'Salvage Value': asset.salvage_value || '',
      'Insurance Status': asset.insurance_status || '',
      'Policy Number': asset.policy_number || '',
      'Insurance Company': asset.insurance_company || '',
      'Insurance Cost': asset.insurance_cost || '',
      'Insurance Expiry': asset.insurance_expiry || '',
      'Condition Status': asset.condition_status || '',
      'Disposition': asset.disposition || '',
      'Active Status': asset.active_status || '',
      'Last Activity': asset.last_activity || '',
      'Last Modified': asset.last_modified || ''
    }));

    const ws = XLSX.utils.json_to_sheet(excelData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Asset Financial Data');

    const colWidths = [
      { wch: 15 }, // Asset Code
      { wch: 30 }, // Asset Name
      { wch: 15 }, // Brand
      { wch: 15 }, // Model
      { wch: 25 }, // Site
      { wch: 25 }, // Area
      { wch: 25 }, // Zone
      { wch: 20 }, // Category
      { wch: 20 }, // Department
      { wch: 20 }, // Owner
      { wch: 15 }, // Cost Center
      { wch: 12 }, // Purchase Date
      { wch: 25 }, // Purchased From
      { wch: 15 }, // Purchase Cost
      { wch: 18 }, // Replacement Cost
      { wch: 18 }, // Current Book Value
      { wch: 12 }, // Depreciation Enabled
      { wch: 15 }, // In Service Date
      { wch: 12 }, // Depreciation Months
      { wch: 15 }, // Depreciated Value
      { wch: 15 }, // Salvage Value
      { wch: 12 }, // Insurance Status
      { wch: 15 }, // Policy Number
      { wch: 25 }, // Insurance Company
      { wch: 15 }, // Insurance Cost
      { wch: 15 }, // Insurance Expiry
      { wch: 15 }, // Condition Status
      { wch: 15 }, // Disposition
      { wch: 12 }, // Active Status
      { wch: 15 }, // Last Activity
      { wch: 15 }  // Last Modified
    ];
    ws['!cols'] = colWidths;

    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    
    const fileName = `asset-financial-${scope}-${new Date().toISOString().split('T')[0]}.xlsx`;
    saveAs(blob, fileName);
  };

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
      console.warn('Erro ao tentar decodificar base64 da logo');
    }
  }
  return result;
}

  const exportToPDF = async (data: any[], scope: string) => {
    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4'
    });
    
    let currentY = 15;

    // Header
    doc.setFillColor(37, 99, 235);
    doc.roundedRect(10, 10, 277, 55, 3, 3, 'F');

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
    doc.text('Asset Financial Report', logo ? 60 : 15, 25);
    currentY = 28;

    doc.setDrawColor(255, 255, 255);
    doc.setLineWidth(0.3);
    doc.line(15, currentY, 282, currentY);
    currentY += 6;

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(255, 255, 255);

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
    doc.text(data.length.toLocaleString(), 43, col1Y);

    currentY = 67;

    if (Object.keys(filters).length > 0) {
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(107, 114, 128);
      doc.text(`Filters Applied: ${Object.keys(filters).length}`, 15, currentY);
      currentY += 3;
    }

    currentY += 5;

    // Updated table with location columns
    const tableData = data.map(asset => [
      asset.asset_code || '',
      asset.asset_name || '',
      asset.location_site_current_name || '',
      asset.location_area_current_description || '',
      asset.category || '',
      asset.purchase_cost || '',
      asset.insurance_status || '',
      asset.active_status || ''
    ]);

    autoTable(doc, {
      head: [['Code', 'Name', 'Site', 'Area', 'Category', 'Cost', 'Insurance', 'Status']],
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
        0: { cellWidth: 20 },
        1: { cellWidth: 50 },
        2: { cellWidth: 35 },
        3: { cellWidth: 35 },
        4: { cellWidth: 30 },
        5: { cellWidth: 25 },
        6: { cellWidth: 22 },
        7: { cellWidth: 20 }
      },
      margin: { top: 10, right: 10, bottom: 10, left: 14 }
    });

    const pageCount = doc.internal.pages.length - 1;
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      const pageHeight = doc.internal.pageSize.getHeight();
      doc.setFillColor(249, 250, 251);
      doc.rect(10, pageHeight - 15, 277, 10, 'F');
      
      doc.setFontSize(8);
      doc.setTextColor(107, 114, 128);
      doc.text(`Page ${i} of ${pageCount}`, doc.internal.pageSize.getWidth() / 2, pageHeight - 8, { align: 'center' });
      
      doc.setFontSize(7);
      doc.text(`Generated: ${new Date().toLocaleDateString('pt-BR')} | SmartX Asset Management`, 15, pageHeight - 8);
      doc.text(`Total: ${data.length} assets`, doc.internal.pageSize.getWidth() - 15, pageHeight - 8, { align: 'right' });
    }

    doc.save(`asset-financial-${scope}-${new Date().toISOString().split('T')[0]}.pdf`);
  };

  const totalPages = Math.ceil(assetDetails.pagination.total / itemsPerPage);
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, assetDetails.pagination.total);

  const SortHeader = ({ field, children }: { field: string; children: React.ReactNode }) => (
    <th 
      className="px-3 py-1.5 text-left text-[10px] font-bold text-gray-700 uppercase tracking-wide cursor-pointer hover:bg-gray-200 transition-colors select-none"
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

  if (assetDetails.loading && assetDetails.data.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-12">
        <div className="flex flex-col items-center justify-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary-500 mb-4"></div>
          <p className="text-gray-600 font-medium">Loading asset details...</p>
          <p className="text-gray-500 text-sm mt-2">Please wait while we fetch the data</p>
        </div>
      </div>
    );
  }

  if (assetDetails.error) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <XMarkIcon className="h-5 w-5 text-red-500" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-800 font-medium">Error loading data</p>
              <p className="text-sm text-red-700 mt-1">{assetDetails.error}</p>
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
            <h2 className="text-xl font-bold text-gray-900">Asset Financial Details</h2>
            <p className="text-sm text-gray-600 mt-1">
              Complete financial information for all assets
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={() => assetDetails.fetch(filters, itemsPerPage, (currentPage - 1) * itemsPerPage)}
              disabled={assetDetails.loading}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              <ArrowPathIcon className={`w-4 h-4 ${assetDetails.loading ? 'animate-spin' : ''}`} />
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
                placeholder="Search by code, name, category, department..."
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
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                {/* Active Status Filter */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">
                    Status
                  </label>
                  <select
                    onChange={(e) => {
                      const value = e.target.value;
                      handleFilterChange({
                        active_status: value ? [value] : undefined,
                      });
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white"
                  >
                    <option value="">All Status</option>
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>

                {/* Insurance Status Filter */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">
                    Insurance
                  </label>
                  <select
                    onChange={(e) => {
                      const value = e.target.value;
                      handleFilterChange({
                        insurance_status: value ? [value] : undefined,
                      });
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white"
                  >
                    <option value="">All Insurance</option>
                    <option value="Active">Active</option>
                    <option value="Expired">Expired</option>
                  </select>
                </div>

                {/* Depreciation Filter */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">
                    Depreciation
                  </label>
                  <select
                    onChange={(e) => {
                      const value = e.target.value;
                      handleFilterChange({
                        depreciation_enabled: value ? parseInt(value) : undefined,
                      });
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white"
                  >
                    <option value="">All Assets</option>
                    <option value="1">Enabled</option>
                    <option value="0">Disabled</option>
                  </select>
                </div>

                {/* Clear Filters */}
                <div className="flex items-end">
                  <button
                    onClick={clearFilters}
                    className="w-full px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
                  >
                    Clear All
                  </button>
                </div>
              </div>

              {/* Location Filters Section */}
              <div className="pt-4 border-t border-gray-200">
                <div className="flex items-center gap-2 mb-3">
                  <MapPinIcon className="w-4 h-4 text-primary-600" />
                  <span className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
                    Location Filters
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Site Filter */}
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-2">
                      Site
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
                    <label className="block text-xs font-medium text-gray-600 mb-2">
                      Area
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
                      <option value="">All Areas</option>
                      {uniqueAreas.map(area => (
                        <option key={area} value={area}>{area}</option>
                      ))}
                    </select>
                  </div>

                  {/* Zone Filter */}
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-2">
                      Zone
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
                      <option value="">All Zones</option>
                      {uniqueZones.map(zone => (
                        <option key={zone} value={zone}>{zone}</option>
                      ))}
                    </select>
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
            <span className="font-semibold text-gray-900">{assetDetails.pagination.total}</span> assets
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
        <div className={`overflow-x-auto ${assetDetails.pagination.total > 50 ? 'max-h-[600px] overflow-y-auto' : ''}`}>
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gradient-to-r from-gray-50 to-gray-100 sticky top-0 z-10">
              <tr>
                <SortHeader field="asset_code">Asset Code</SortHeader>
                <SortHeader field="asset_name">Asset Name</SortHeader>
                <SortHeader field="location_site_current_name">Site</SortHeader>
                <SortHeader field="location_area_current_description">Area</SortHeader>
                <SortHeader field="location_zone_current_description">Zone</SortHeader>
                <SortHeader field="category">Category</SortHeader>
                <SortHeader field="department">Department</SortHeader>
                <SortHeader field="purchase_cost">Purchase Cost</SortHeader>
                <SortHeader field="insurance_status">Insurance</SortHeader>
                <SortHeader field="active_status">Status</SortHeader>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sortedData.map((asset: any, index: number) => (
                <tr 
                  key={asset.asset_code} 
                  className={`hover:bg-primary-50 transition-colors ${
                    index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                  }`}
                >
                  <td className="px-3 py-1 whitespace-nowrap">
                    <div className="text-[10px] font-semibold text-gray-900">{asset.asset_code}</div>
                  </td>
                  <td className="px-3 py-1">
                    <div className="text-[10px] font-medium text-gray-900 truncate max-w-[200px]">{asset.asset_name}</div>
                  </td>
                  <td className="px-3 py-1 whitespace-nowrap">
                    <div className="text-[10px] text-gray-700">{asset.location_site_current_name || '-'}</div>
                  </td>
                  <td className="px-3 py-1 whitespace-nowrap">
                    <div className="text-[10px] text-gray-700">{asset.location_area_current_description || '-'}</div>
                  </td>
                  <td className="px-3 py-1 whitespace-nowrap">
                    <div className="text-[10px] text-gray-700">{asset.location_zone_current_description || '-'}</div>
                  </td>
                  <td className="px-3 py-1 whitespace-nowrap">
                    <div className="text-[10px] text-gray-700">{asset.category}</div>
                  </td>
                  <td className="px-3 py-1 whitespace-nowrap">
                    <div className="text-[10px] text-gray-700">{asset.department || '-'}</div>
                  </td>
                  <td className="px-3 py-1 whitespace-nowrap">
                    <div className="text-[10px] font-semibold text-gray-900">{asset.purchase_cost}</div>
                  </td>
                  <td className="px-3 py-1 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-semibold ${
                        asset.insurance_status === 'Active'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {asset.insurance_status}
                    </span>
                  </td>
                  <td className="px-3 py-1 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-semibold ${
                        asset.active_status === 'Active'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {asset.active_status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Loading Overlay */}
        {assetDetails.loading && assetDetails.data.length > 0 && (
          <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center">
            <div className="flex flex-col items-center">
              <div className="animate-spin rounded-full h-10 w-10 border-b-3 border-primary-500"></div>
              <p className="text-sm text-gray-600 mt-2">Loading...</p>
            </div>
          </div>
        )}
      </div>

      {/* Pagination */}
      {assetDetails.pagination.total > 0 && (
        <div className="bg-white rounded-xl shadow-sm p-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-sm text-gray-600">
              Page <span className="font-semibold text-gray-900">{currentPage}</span> of{' '}
              <span className="font-semibold text-gray-900">{totalPages}</span>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1 || assetDetails.loading}
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
                      disabled={assetDetails.loading}
                      className={`min-w-[40px] px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        currentPage === page
                          ? 'bg-primary-500 text-white'
                          : 'border border-gray-300 hover:bg-gray-50 text-gray-700'
                      } disabled:opacity-50`}
                    >
                      {page}
                    </button>
                  )}
                </React.Fragment>
              ))}

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages || assetDetails.loading}
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
      {sortedData.length === 0 && !assetDetails.loading && (
        <div className="bg-white rounded-xl shadow-sm p-12">
          <div className="text-center">
            <svg
              className="mx-auto h-16 w-16 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
              />
            </svg>
            <h3 className="mt-4 text-lg font-semibold text-gray-900">No assets found</h3>
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
            {/* Background overlay */}
            <div
              className="fixed inset-0 bg-gray-900 bg-opacity-50 transition-opacity"
              onClick={() => setShowExportModal(false)}
            />

            {/* Modal panel */}
            <div className="relative inline-block w-full max-w-lg my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-2xl rounded-xl z-[10000]">
              {/* Header */}
              <div className="bg-gradient-to-r from-primary-500 to-primary-600 px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <ArrowDownTrayIcon className="w-6 h-6 text-white" />
                    <h3 className="text-lg font-bold text-white">Export Asset Data</h3>
                  </div>
                  <button
                    onClick={() => setShowExportModal(false)}
                    className="text-white hover:text-gray-200 transition-colors"
                  >
                    <XMarkIcon className="w-6 h-6" />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="px-6 py-6">
                <p className="text-sm text-gray-600 mb-6">
                  Choose the format and scope of data to export
                </p>

                {/* Export Options Grid */}
                <div className="grid grid-cols-2 gap-4">
                  {/* Excel - Filtered */}
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
                      <div className="font-semibold text-gray-900 text-sm">Excel (CSV)</div>
                      <div className="text-xs text-gray-600 mt-1">Filtered Results</div>
                      <div className="text-xs text-primary-600 font-medium mt-1">
                        {sortedData.length} assets
                      </div>
                    </div>
                  </button>

                  {/* Excel - All */}
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
                      <div className="font-semibold text-gray-900 text-sm">Excel (CSV)</div>
                      <div className="text-xs text-gray-600 mt-1">All Data</div>
                      <div className="text-xs text-primary-600 font-medium mt-1">
                        {assetDetails.pagination.total} assets
                      </div>
                    </div>
                  </button>

                  {/* PDF - Filtered */}
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
                        {sortedData.length} assets
                      </div>
                    </div>
                  </button>

                  {/* PDF - All */}
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
                        {assetDetails.pagination.total} assets
                      </div>
                    </div>
                  </button>
                </div>

                {/* Info Notice */}
                <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex gap-3">
                    <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                    <div className="text-xs text-blue-800">
                      <strong>Filtered Results:</strong> Exports only visible data based on current search and filters
                      <br />
                      <strong>All Data:</strong> Exports complete dataset ({assetDetails.pagination.total} assets)
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

export default AssetFinancialGrid;





