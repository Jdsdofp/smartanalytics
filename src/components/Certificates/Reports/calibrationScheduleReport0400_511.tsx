import { useState, useEffect } from 'react';
import {
    ArrowDownTrayIcon,
    PrinterIcon,
    FunnelIcon,
    CalendarIcon,
    BuildingOfficeIcon,
    DocumentTextIcon
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

    // const formatDate = (dateString: string) => {
    //     return new Date(dateString).toLocaleDateString('pt-BR');
    // };

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
            <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600 font-medium">Carregando dados...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/20 to-gray-50 p-6">
            <div className="max-w-[1600px] mx-auto">
                {/* Cabeçalho */}
                <div className="bg-white rounded-xl shadow-lg p-6 mb-6 print:hidden border border-gray-100">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                                <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-3 rounded-xl shadow-lg">
                                    <DocumentTextIcon className="w-8 h-8 text-white" />
                                </div>
                                Programação de Calibração
                            </h1>
                            <p className="text-sm text-gray-600 ml-14 mt-1">
                                Relatório completo de certificados e equipamentos
                            </p>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowFilters(!showFilters)}
                                className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-all font-medium"
                            >
                                <FunnelIcon className="w-5 h-5" />
                                Filtros
                            </button>
                            <button
                                onClick={printReport}
                                className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-all shadow-md"
                            >
                                <PrinterIcon className="w-5 h-5" />
                                Imprimir
                            </button>
                            <button
                                onClick={exportToPDF}
                                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all shadow-md"
                            >
                                <ArrowDownTrayIcon className="w-5 h-5" />
                                Exportar PDF
                            </button>
                        </div>
                    </div>

                    {showFilters && (
                        <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 mb-2 uppercase">
                                        <BuildingOfficeIcon className="w-4 h-4 inline mr-1" />
                                        Empresa
                                    </label>
                                    <select
                                        value={filters.company}
                                        onChange={(e) => setFilters({ ...filters, company: e.target.value })}
                                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                                    >
                                        <option value="ALL">Todas</option>
                                        {uniqueCompanies.map(company => (
                                            <option key={company} value={company}>
                                                {company.length > 40 ? company.substring(0, 40) + '...' : company}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 mb-2 uppercase">
                                        Site
                                    </label>
                                    <select
                                        value={filters.site}
                                        onChange={(e) => setFilters({ ...filters, site: e.target.value })}
                                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                                    >
                                        <option value="ALL">Todos</option>
                                        {uniqueSites.map(site => (
                                            <option key={site} value={site}>{site}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 mb-2 uppercase">
                                        <CalendarIcon className="w-4 h-4 inline mr-1" />
                                        Data Início
                                    </label>
                                    <input
                                        type="date"
                                        value={filters.dateFrom}
                                        onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
                                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 mb-2 uppercase">
                                        Data Fim
                                    </label>
                                    <input
                                        type="date"
                                        value={filters.dateTo}
                                        onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
                                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                                        min={filters.dateFrom}
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-100">
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-700">
                                Total: <strong className="text-blue-600 text-lg">{filteredData.length}</strong> registros
                            </span>
                            <span className="text-gray-600">
                                Ordenação: <strong className="text-gray-900">Código</strong>
                            </span>
                        </div>
                    </div>
                </div>

                {/* Relatório */}
                <div className="bg-white rounded-xl shadow-2xl overflow-hidden print:shadow-none">
                    {/* Cabeçalho do relatório */}
                    <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 print:bg-white print:p-4">
                        <h2 className="text-2xl font-bold text-white print:text-gray-900 mb-3">
                            PROGRAMAÇÃO DE CALIBRAÇÃO
                        </h2>
                        <div className="text-sm text-blue-50 print:text-gray-600 space-y-1">
                            <p>Data: {new Date().toLocaleDateString('pt-BR')}</p>
                            <p>Período: {new Date().getMonth() + 1}/{new Date().getFullYear()} a {new Date().getMonth() + 1}/{new Date().getFullYear() + 1} | Registros: {filteredData.length}</p>
                            <p>Filtros: Controlado: Sim</p>
                        </div>
                    </div>

                    {/* Tabela */}
                    <div className="overflow-x-auto">
                        <table className="w-full text-xs">
                            <thead className="bg-gradient-to-r from-gray-100 to-gray-50 border-b-2 border-blue-500">
                                <tr>
                                    <th className="px-3 py-3 text-left font-bold text-gray-700 border-r border-gray-300 uppercase">Nº. Patrimônio</th>
                                    <th className="px-3 py-3 text-left font-bold text-gray-700 border-r border-gray-300 uppercase">Código</th>
                                    <th className="px-3 py-3 text-left font-bold text-gray-700 border-r border-gray-300 uppercase">Descrição</th>
                                    <th className="px-3 py-3 text-left font-bold text-gray-700 border-r border-gray-300 uppercase">Departamento</th>
                                    <th className="px-3 py-3 text-left font-bold text-gray-700 border-r border-gray-300 uppercase">Fabricante</th>
                                    <th className="px-3 py-3 text-left font-bold text-gray-700 border-r border-gray-300 uppercase">Modelo</th>
                                    <th className="px-3 py-3 text-left font-bold text-gray-700 border-r border-gray-300 uppercase">Nº. Série</th>
                                    <th className="px-3 py-3 text-left font-bold text-gray-700 border-r border-gray-300 uppercase">Comodato</th>
                                    <th className="px-3 py-3 text-left font-bold text-gray-700 border-r border-gray-300 uppercase">Dt. Execução</th>
                                    <th className="px-3 py-3 text-left font-bold text-gray-700 border-r border-gray-300 uppercase">Dt. Validade</th>
                                    <th className="px-3 py-3 text-left font-bold text-gray-700 border-r border-gray-300 uppercase">Não Conf.</th>
                                    <th className="px-3 py-3 text-left font-bold text-gray-700 uppercase">Fornecedor</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {filteredData.map((item, index) => (
                                    <tr
                                        key={item.id}
                                        className={`hover:bg-blue-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}
                                    >
                                        <td className="px-3 py-3 text-gray-500 border-r border-gray-200 text-center">---</td>
                                        <td className="px-3 py-3 border-r border-gray-200">
                                            <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 rounded font-mono font-semibold">
                                                {item.item_code}
                                            </span>
                                        </td>
                                        <td className="px-3 py-3 text-gray-900 border-r border-gray-200 font-medium">{item.item_name}</td>
                                        <td className="px-3 py-3 text-gray-600 border-r border-gray-200 text-[11px]">{item.code_area}</td>
                                        <td className="px-3 py-3 text-gray-700 border-r border-gray-200">{item.brand || '---'}</td>
                                        <td className="px-3 py-3 text-gray-700 border-r border-gray-200">{item.model || '---'}</td>
                                        <td className="px-3 py-3 border-r border-gray-200">
                                            <span className="font-mono text-gray-800 bg-gray-100 px-2 py-0.5 rounded">
                                                {item.serial || '---'}
                                            </span>
                                        </td>
                                        <td className="px-3 py-3 text-gray-600 border-r border-gray-200 text-center">Não</td>
                                        <td className="px-3 py-3 text-gray-700 border-r border-gray-200">{getExecutionDate(item.expiration_date)}</td>
                                        <td className="px-3 py-3 border-r border-gray-200">
                                            <span className="inline-block px-2 py-1 bg-green-50 text-green-700 rounded font-medium border border-green-200">
                                                {formatDateTime(item.expiration_date)}
                                            </span>
                                        </td>
                                        <td className="px-3 py-3 text-gray-500 border-r border-gray-200 text-center">---</td>
                                        <td className="px-3 py-3 text-gray-500 text-center">---</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Rodapé */}
                    <div className="bg-gray-50 px-6 py-4 border-t-2 border-blue-500">
                        <div className="flex items-center justify-between text-xs">
                            <span className="text-gray-600">
                                Emitido em: {new Date().toLocaleDateString('pt-BR')}
                            </span>
                            <span className="text-gray-600 font-medium">Página 1 de 1</span>
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
          .bg-gradient-to-r { background: white !important; }
        }
      `}</style>
        </div>
    );
}