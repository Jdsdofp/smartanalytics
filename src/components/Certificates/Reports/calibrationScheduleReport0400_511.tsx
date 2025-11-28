import { useState, useEffect } from 'react';
import {
    ArrowDownTrayIcon,
    PrinterIcon,
    FunnelIcon,
    CalendarIcon,
    BuildingOfficeIcon,
    DocumentTextIcon,
    ChartBarIcon,
    ClockIcon,
    CheckCircleIcon,
    XCircleIcon
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

interface ApiResponse {
    data: CertificateReport[];
    pagination: {
        currentPage: number;
        totalPages: number;
        totalItems: number;
        itemsPerPage: number;
        hasNextPage: boolean;
        hasPreviousPage: boolean;
    };
}

export default function CalibrationScheduleReport() {
    const [data, setData] = useState<CertificateReport[]>([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        company: 'ALL',
        site: 'ALL',
        dateFrom: '',
        dateTo: ''
    });
    const [showFilters, setShowFilters] = useState(false);

    const companyId = 610;

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const response = await fetch(
                `https://apinode.smartxhub.cloud/api/dashboard/${companyId}/certificates/reports?page=1&limit=999999&sortBy=item_code&sortOrder=ASC`
            );

            if (!response.ok) throw new Error('Failed to fetch data');

            const result: ApiResponse = await response.json();
            setData(result.data);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatDateTime = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    const getExecutionDate = (expirationDate: string) => {
        const date = new Date(expirationDate);
        date.setFullYear(date.getFullYear() - 1);
        return formatDateTime(date.toISOString());
    };

    const isExpiringSoon = (expirationDate: string) => {
        const expDate = new Date(expirationDate);
        const today = new Date();
        const diffDays = Math.ceil((expDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        return diffDays <= 30 && diffDays >= 0;
    };

    const isExpired = (expirationDate: string) => {
        const expDate = new Date(expirationDate);
        const today = new Date();
        return expDate < today;
    };

    const filteredData = data.filter(item => {
        const matchCompany = filters.company === 'ALL' || item.code_area.includes(filters.company);
        const matchSite = filters.site === 'ALL' || item.Home_site_name === filters.site;

        let matchDate = true;
        if (filters.dateFrom && filters.dateTo) {
            const itemDate = new Date(item.expiration_date);
            const fromDate = new Date(filters.dateFrom);
            const toDate = new Date(filters.dateTo);
            matchDate = itemDate >= fromDate && itemDate <= toDate;
        }

        return matchCompany && matchSite && matchDate;
    });

    const uniqueCompanies = Array.from(new Set(data.map(item => item.code_area))).sort();
    const uniqueSites = Array.from(new Set(data.map(item => item.Home_site_name))).sort();

    // Estatísticas
    const stats = {
        total: filteredData.length,
        expiringSoon: filteredData.filter(item => isExpiringSoon(item.expiration_date)).length,
        expired: filteredData.filter(item => isExpired(item.expiration_date)).length,
        valid: filteredData.filter(item => !isExpired(item.expiration_date) && !isExpiringSoon(item.expiration_date)).length
    };

    const exportToPDF = async () => {
        try {
            const { jsPDF } = await import('jspdf');
            const doc = new jsPDF({
                orientation: 'landscape',
                unit: 'mm',
                format: 'a4'
            });

            const pageWidth = doc.internal.pageSize.getWidth();
            const pageHeight = doc.internal.pageSize.getHeight();
            const margin = 10;
            let yPosition = margin;

            doc.setFontSize(16);
            doc.setFont('helvetica', 'bold');
            doc.text('PROGRAMAÇÃO DE CALIBRAÇÃO', margin, yPosition);
            yPosition += 8;

            doc.setFontSize(9);
            doc.setFont('helvetica', 'normal');
            doc.text(new Date().toLocaleDateString('pt-BR'), margin, yPosition);
            yPosition += 5;

            const currentDate = new Date();
            const nextYear = new Date(currentDate);
            nextYear.setFullYear(currentDate.getFullYear() + 1);

            doc.text(
                `Período: ${currentDate.getMonth() + 1}/${currentDate.getFullYear()} a ${nextYear.getMonth() + 1}/${nextYear.getFullYear()}, Ordenação: Código, Quant. Registros: ${filteredData.length}`,
                margin,
                yPosition
            );
            yPosition += 5;

            doc.text('Filtros: Controlado: Sim', margin, yPosition);
            yPosition += 8;

            const headers = [
                'Nº. Patrim.', 'Código', 'Descrição', 'Departamento', 'Fabricante',
                'Modelo', 'Nº. Série', 'Comod.', 'Dt. Exec.', 'Dt. Valid.', 'N. Conf.', 'Fornec.'
            ];

            const colWidths = [15, 18, 35, 40, 22, 22, 25, 12, 18, 18, 12, 20];

            doc.setFillColor(220, 220, 220);
            doc.rect(margin, yPosition - 4, pageWidth - 2 * margin, 6, 'F');

            doc.setFontSize(7);
            doc.setFont('helvetica', 'bold');

            let xPosition = margin + 1;
            headers.forEach((header, index) => {
                doc.text(header, xPosition, yPosition);
                xPosition += colWidths[index];
            });

            yPosition += 6;

            doc.setFont('helvetica', 'normal');
            doc.setFontSize(6);

            filteredData.forEach((item) => {
                if (yPosition > pageHeight - 20) {
                    doc.addPage();
                    yPosition = margin;

                    doc.setFillColor(220, 220, 220);
                    doc.rect(margin, yPosition - 4, pageWidth - 2 * margin, 6, 'F');

                    doc.setFont('helvetica', 'bold');
                    doc.setFontSize(7);
                    xPosition = margin + 1;
                    headers.forEach((header, index) => {
                        doc.text(header, xPosition, yPosition);
                        xPosition += colWidths[index];
                    });
                    yPosition += 6;
                    doc.setFont('helvetica', 'normal');
                    doc.setFontSize(6);
                }

                xPosition = margin + 1;
                const rowData = [
                    '---',
                    item.item_code,
                    item.item_name.substring(0, 30),
                    item.code_area.substring(0, 35),
                    item.brand || '---',
                    item.model || '---',
                    item.serial || '---',
                    'Não',
                    getExecutionDate(item.expiration_date),
                    formatDateTime(item.expiration_date),
                    '---',
                    '---'
                ];

                rowData.forEach((text, colIndex) => {
                    const maxWidth = colWidths[colIndex] - 2;
                    const lines = doc.splitTextToSize(text, maxWidth);
                    doc.text(lines[0], xPosition, yPosition);
                    xPosition += colWidths[colIndex];
                });

                yPosition += 5;
            });

            doc.setFontSize(7);
            doc.text(`Pág. 1 / 1`, pageWidth - margin - 15, pageHeight - 5);

            doc.save(`programacao-calibracao-${new Date().toISOString().split('T')[0]}.pdf`);
        } catch (error) {
            console.error('Erro ao gerar PDF:', error);
            alert('Erro ao exportar para PDF.');
        }
    };

    const printReport = () => {
        window.print();
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-600 via-blue-500 to-indigo-600">
                <div className="text-center bg-white p-8 rounded-2xl shadow-2xl">
                    <div className="relative w-20 h-20 mx-auto mb-6">
                        <div className="absolute inset-0 border-4 border-blue-200 rounded-full"></div>
                        <div className="absolute inset-0 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                    <p className="text-gray-700 font-semibold text-lg">Carregando dados...</p>
                    <p className="text-gray-500 text-sm mt-2">Processando certificados</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
            <div className="max-w-[1600px] mx-auto">
                {/* Cabeçalho Moderno */}
                <div className="bg-white rounded-2xl shadow-xl p-8 mb-6 print:hidden border border-gray-100">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-4">
                            <div className="bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-600 p-4 rounded-2xl shadow-lg transform hover:scale-105 transition-transform">
                                <DocumentTextIcon className="w-10 h-10 text-white" />
                            </div>
                            <div>
                                <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                                    Programação de Calibração
                                </h1>
                                <p className="text-gray-600 mt-1 flex items-center gap-2">
                                    <ChartBarIcon className="w-4 h-4" />
                                    Relatório completo de certificados e equipamentos
                                </p>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowFilters(!showFilters)}
                                className={`flex items-center gap-2 px-5 py-3 rounded-xl transition-all font-semibold shadow-md hover:shadow-lg transform hover:-translate-y-0.5 ${
                                    showFilters 
                                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white' 
                                        : 'bg-white border-2 border-gray-200 text-gray-700 hover:border-blue-300'
                                }`}
                            >
                                <FunnelIcon className="w-5 h-5" />
                                Filtros
                            </button>
                            <button
                                onClick={printReport}
                                className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-xl transition-all shadow-md hover:shadow-lg font-semibold transform hover:-translate-y-0.5"
                            >
                                <PrinterIcon className="w-5 h-5" />
                                Imprimir
                            </button>
                            <button
                                onClick={exportToPDF}
                                className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl transition-all shadow-md hover:shadow-lg font-semibold transform hover:-translate-y-0.5"
                            >
                                <ArrowDownTrayIcon className="w-5 h-5" />
                                Exportar PDF
                            </button>
                        </div>
                    </div>

                    {/* Cards de Estatísticas */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-5 rounded-xl border-2 border-blue-200 hover:shadow-md transition-all">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-blue-600 text-sm font-semibold uppercase tracking-wide">Total</p>
                                    <p className="text-3xl font-bold text-blue-900 mt-1">{stats.total}</p>
                                </div>
                                <div className="bg-blue-500 p-3 rounded-xl">
                                    <ChartBarIcon className="w-8 h-8 text-white" />
                                </div>
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-green-50 to-green-100 p-5 rounded-xl border-2 border-green-200 hover:shadow-md transition-all">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-green-600 text-sm font-semibold uppercase tracking-wide">Válidos</p>
                                    <p className="text-3xl font-bold text-green-900 mt-1">{stats.valid}</p>
                                </div>
                                <div className="bg-green-500 p-3 rounded-xl">
                                    <CheckCircleIcon className="w-8 h-8 text-white" />
                                </div>
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-amber-50 to-amber-100 p-5 rounded-xl border-2 border-amber-200 hover:shadow-md transition-all">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-amber-600 text-sm font-semibold uppercase tracking-wide">Vencendo</p>
                                    <p className="text-3xl font-bold text-amber-900 mt-1">{stats.expiringSoon}</p>
                                </div>
                                <div className="bg-amber-500 p-3 rounded-xl">
                                    <ClockIcon className="w-8 h-8 text-white" />
                                </div>
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-red-50 to-red-100 p-5 rounded-xl border-2 border-red-200 hover:shadow-md transition-all">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-red-600 text-sm font-semibold uppercase tracking-wide">Vencidos</p>
                                    <p className="text-3xl font-bold text-red-900 mt-1">{stats.expired}</p>
                                </div>
                                <div className="bg-red-500 p-3 rounded-xl">
                                    <XCircleIcon className="w-8 h-8 text-white" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Filtros Melhorados */}
                    {showFilters && (
                        <div className="mt-6 p-6 bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl border-2 border-blue-100 shadow-inner">
                            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                                <FunnelIcon className="w-5 h-5 text-blue-600" />
                                Filtros Avançados
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-2 uppercase tracking-wide flex items-center gap-1">
                                        <BuildingOfficeIcon className="w-4 h-4 text-blue-600" />
                                        Empresa
                                    </label>
                                    <select
                                        value={filters.company}
                                        onChange={(e) => setFilters({ ...filters, company: e.target.value })}
                                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm font-medium transition-all hover:border-blue-300"
                                    >
                                        <option value="ALL">Todas as empresas</option>
                                        {uniqueCompanies.map(company => (
                                            <option key={company} value={company}>
                                                {company.length > 40 ? company.substring(0, 40) + '...' : company}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-2 uppercase tracking-wide">
                                        Site
                                    </label>
                                    <select
                                        value={filters.site}
                                        onChange={(e) => setFilters({ ...filters, site: e.target.value })}
                                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm font-medium transition-all hover:border-blue-300"
                                    >
                                        <option value="ALL">Todos os sites</option>
                                        {uniqueSites.map(site => (
                                            <option key={site} value={site}>{site}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-2 uppercase tracking-wide flex items-center gap-1">
                                        <CalendarIcon className="w-4 h-4 text-blue-600" />
                                        Data Início
                                    </label>
                                    <input
                                        type="date"
                                        value={filters.dateFrom}
                                        onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
                                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm font-medium transition-all hover:border-blue-300"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-2 uppercase tracking-wide">
                                        Data Fim
                                    </label>
                                    <input
                                        type="date"
                                        value={filters.dateTo}
                                        onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
                                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm font-medium transition-all hover:border-blue-300"
                                        min={filters.dateFrom}
                                    />
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Relatório Melhorado */}
                <div className="bg-white rounded-2xl shadow-2xl overflow-hidden print:shadow-none border border-gray-200">
                    {/* Cabeçalho do relatório */}
                    <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 p-8 print:bg-white print:p-4 relative overflow-hidden">
                        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjEpIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-20"></div>
                        <div className="relative z-10">
                            <h2 className="text-3xl font-bold text-white print:text-gray-900 mb-4 flex items-center gap-3">
                                <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
                                    <DocumentTextIcon className="w-8 h-8" />
                                </div>
                                PROGRAMAÇÃO DE CALIBRAÇÃO
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-white print:text-gray-600">
                                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-lg">
                                    <CalendarIcon className="w-5 h-5" />
                                    <span><strong>Data:</strong> {new Date().toLocaleDateString('pt-BR')}</span>
                                </div>
                                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-lg">
                                    <ClockIcon className="w-5 h-5" />
                                    <span><strong>Período:</strong> {new Date().getMonth() + 1}/{new Date().getFullYear()} a {new Date().getMonth() + 1}/{new Date().getFullYear() + 1}</span>
                                </div>
                                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-lg">
                                    <ChartBarIcon className="w-5 h-5" />
                                    <span><strong>Registros:</strong> {filteredData.length}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Tabela Melhorada */}
                    <div className="overflow-x-auto">
                        <table className="w-full text-xs">
                            <thead>
                                <tr className="bg-gradient-to-r from-slate-100 via-blue-50 to-slate-100 border-b-2 border-blue-600">
                                    <th className="px-4 py-4 text-left font-bold text-gray-800 border-r border-gray-300 uppercase tracking-wide text-[10px]">Nº. Patrimônio</th>
                                    <th className="px-4 py-4 text-left font-bold text-gray-800 border-r border-gray-300 uppercase tracking-wide text-[10px]">Código</th>
                                    <th className="px-4 py-4 text-left font-bold text-gray-800 border-r border-gray-300 uppercase tracking-wide text-[10px]">Descrição</th>
                                    <th className="px-4 py-4 text-left font-bold text-gray-800 border-r border-gray-300 uppercase tracking-wide text-[10px]">Departamento</th>
                                    <th className="px-4 py-4 text-left font-bold text-gray-800 border-r border-gray-300 uppercase tracking-wide text-[10px]">Fabricante</th>
                                    <th className="px-4 py-4 text-left font-bold text-gray-800 border-r border-gray-300 uppercase tracking-wide text-[10px]">Modelo</th>
                                    <th className="px-4 py-4 text-left font-bold text-gray-800 border-r border-gray-300 uppercase tracking-wide text-[10px]">Nº. Série</th>
                                    <th className="px-4 py-4 text-left font-bold text-gray-800 border-r border-gray-300 uppercase tracking-wide text-[10px]">Comodato</th>
                                    <th className="px-4 py-4 text-left font-bold text-gray-800 border-r border-gray-300 uppercase tracking-wide text-[10px]">Dt. Execução</th>
                                    <th className="px-4 py-4 text-left font-bold text-gray-800 border-r border-gray-300 uppercase tracking-wide text-[10px]">Dt. Validade</th>
                                    <th className="px-4 py-4 text-left font-bold text-gray-800 border-r border-gray-300 uppercase tracking-wide text-[10px]">Não Conf.</th>
                                    <th className="px-4 py-4 text-left font-bold text-gray-800 uppercase tracking-wide text-[10px]">Fornecedor</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {filteredData.map((item, index) => {
                                    const expiringSoon = isExpiringSoon(item.expiration_date);
                                    const expired = isExpired(item.expiration_date);
                                    
                                    return (
                                        <tr
                                            key={item.id}
                                            className={`transition-all duration-150 hover:shadow-md ${
                                                expired 
                                                    ? 'bg-red-50 hover:bg-red-100' 
                                                    : expiringSoon 
                                                    ? 'bg-amber-50 hover:bg-amber-100' 
                                                    : index % 2 === 0 
                                                    ? 'bg-white hover:bg-blue-50' 
                                                    : 'bg-slate-50 hover:bg-blue-50'
                                            }`}
                                        >
                                            <td className="px-4 py-4 text-gray-500 border-r border-gray-200 text-center">
                                                <span className="text-gray-400">---</span>
                                            </td>
                                            <td className="px-4 py-4 border-r border-gray-200">
                                                <span className="inline-flex items-center px-3 py-1.5 bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 rounded-lg font-mono font-bold text-xs shadow-sm">
                                                    {item.item_code}
                                                </span>
                                            </td>
                                            <td className="px-4 py-4 text-gray-900 border-r border-gray-200 font-semibold">
                                                {item.item_name}
                                            </td>
                                            <td className="px-4 py-4 text-gray-600 border-r border-gray-200 text-[11px]">
                                                {item.code_area}
                                            </td>
                                            <td className="px-4 py-4 text-gray-700 border-r border-gray-200 font-medium">
                                                {item.brand || <span className="text-gray-400">---</span>}
                                            </td>
                                            <td className="px-4 py-4 text-gray-700 border-r border-gray-200">
                                                {item.model || <span className="text-gray-400">---</span>}
                                            </td>
                                            <td className="px-4 py-4 border-r border-gray-200">
                                                <span className="inline-flex items-center font-mono text-gray-800 bg-slate-100 px-3 py-1 rounded-lg text-xs font-semibold">
                                                    {item.serial || '---'}
                                                </span>
                                            </td>
                                            <td className="px-4 py-4 text-gray-600 border-r border-gray-200 text-center">
                                                <span className="inline-flex items-center px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs font-medium">
                                                    Não
                                                </span>
                                            </td>
                                            <td className="px-4 py-4 text-gray-700 border-r border-gray-200 font-medium">
                                                {getExecutionDate(item.expiration_date)}
                                            </td>
                                            <td className="px-4 py-4 border-r border-gray-200">
                                                <span className={`inline-flex items-center px-3 py-1.5 rounded-lg font-semibold text-xs border-2 ${
                                                    expired 
                                                        ? 'bg-red-100 text-red-700 border-red-300' 
                                                        : expiringSoon 
                                                        ? 'bg-amber-100 text-amber-700 border-amber-300' 
                                                        : 'bg-green-100 text-green-700 border-green-300'
                                                }`}>
                                                    {formatDateTime(item.expiration_date)}
                                                </span>
                                            </td>
                                            <td className="px-4 py-4 text-gray-500 border-r border-gray-200 text-center">
                                                <span className="text-gray-400">---</span>
                                            </td>
                                            <td className="px-4 py-4 text-gray-500 text-center">
                                                <span className="text-gray-400">---</span>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    {/* Rodapé Melhorado */}
                    <div className="bg-gradient-to-r from-slate-100 via-blue-50 to-slate-100 px-8 py-5 border-t-2 border-blue-600">
                        <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2 text-gray-700">
                                <CalendarIcon className="w-5 h-5 text-blue-600" />
                                <span className="font-medium">
                                    Emitido em: <strong className="text-gray-900">{new Date().toLocaleDateString('pt-BR')}</strong>
                                </span>
                            </div>
                            <span className="text-gray-700 font-semibold flex items-center gap-2">
                                <DocumentTextIcon className="w-5 h-5 text-blue-600" />
                                Página 1 de 1
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                @media print {
                    body { background: white; }
                    .print\\:hidden { display: none !important; }
                    .print\\:shadow-none { box-shadow: none !important; }
                    .print\\:bg-white { background: white !important; }
                    .print\\:text-gray-900 { color: #111827 !important; }
                    .print\\:text-gray-600 { color: #4b5563 !important; }
                    .bg-gradient-to-r, .bg-gradient-to-br { background: white !important; }
                }
                
                @keyframes slideIn {
                    from {
                        opacity: 0;
                        transform: translateY(10px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                
                tbody tr {
                    animation: slideIn 0.3s ease-out;
                }
            `}</style>
        </div>
    );
}