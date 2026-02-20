// BoundaryTrackingTable.tsx
import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useCompany } from "../../../hooks/useCompany";
import {
  ArrowPathIcon,
  TableCellsIcon,
  FunnelIcon,
  XMarkIcon,
  MagnifyingGlassIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  MapPinIcon,
  ClockIcon,
  UserGroupIcon,
  ArrowDownTrayIcon,
} from "@heroicons/react/24/outline";
import jsPDF from "jspdf";
// @ts-ignore
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
// @ts-ignore
import { saveAs } from "file-saver";

interface TrackingRow {
  item_code: string;
  item_name: string;
  boundary_name: string;
  group_name: string;
  entry_datetime: string;
  exit_datetime: string | null;
  current_status: string;
  duration_formatted: string;
  duration_category: string;
  work_shift: string;
  time_period_detailed: string;
  activity_period: string;
  entry_time_range: string;
  latitude: number | null;
  longitude: number | null;
}

interface Pagination {
  currentPage: number;
  totalPages: number;
  totalRecords: number;
  limit: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

interface Filters {
  itemCode: string;
  itemName: string;
  boundaryName: string;
  groupName: string;
  currentStatus: string;
  workShift: string;
  durationCategory: string;
  startDate: string;
  endDate: string;
}

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  INSIDE: {
    label: "Inside",
    className: "bg-emerald-100 text-emerald-800 border border-emerald-200",
  },
  EXITED: {
    label: "Exited",
    className: "bg-gray-100 text-gray-600 border border-gray-200",
  },
  ALERT: {
    label: "Alert",
    className: "bg-red-100 text-red-700 border border-red-200",
  },
};

const DURATION_CONFIG: Record<string, { label: string; className: string }> = {
  very_short: {
    label: "Muito curta",
    className: "bg-orange-100 text-orange-700 border border-orange-200",
  },
  short: {
    label: "Curta",
    className: "bg-yellow-100 text-yellow-700 border border-yellow-200",
  },
  medium: {
    label: "Média",
    className: "bg-blue-100 text-blue-700 border border-blue-200",
  },
  long: {
    label: "Longa",
    className: "bg-purple-100 text-purple-700 border border-purple-200",
  },
  very_long: {
    label: "Muito longa",
    className: "bg-red-100 text-red-700 border border-red-200",
  },
};

const SHIFT_CONFIG: Record<string, { label: string; dot: string }> = {
  MORNING: { label: "Manhã", dot: "bg-amber-400" },
  AFTERNOON: { label: "Tarde", dot: "bg-blue-400" },
  NIGHT: { label: "Noite", dot: "bg-indigo-500" },
};

const INITIAL_FILTERS: Filters = {
  itemCode: "",
  itemName: "",
  boundaryName: "",
  groupName: "",
  currentStatus: "",
  workShift: "",
  durationCategory: "",
  startDate: "",
  endDate: "",
};

const inputClass =
  "w-full border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-400 transition-all";

const selectClass =
  "w-full border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all";

export default function BoundaryTrackingTable() {
  const { companyId, logo } = useCompany();
  const [data, setData] = useState<TrackingRow[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [filters, setFilters] = useState<Filters>(INITIAL_FILTERS);
  const [appliedFilters, setAppliedFilters] = useState<Filters>(INITIAL_FILTERS);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(true);
  const [showExportModal, setShowExportModal] = useState(false);
  // Estado de loading exclusivo para o export "all"
  const [exporting, setExporting] = useState(false);

  const fetchData = useCallback(
    async (currentPage: number, f: Filters) => {
      setLoading(true);
      try {
        const params = new URLSearchParams({
          page: String(currentPage),
          limit: "50",
          ...Object.fromEntries(Object.entries(f).filter(([, v]) => v !== "")),
        });
        const res = await axios.get(
          `https://apinode.smartxhub.cloud/api/dashboard/boundary/${companyId}/tracking?${params}`
        );
        setData(res.data.data);
        setPagination(res.data.pagination);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    },
    [companyId]
  );

  useEffect(() => {
    fetchData(page, appliedFilters);
  }, [page, appliedFilters, fetchData]);

  const handleApply = () => {
    setPage(1);
    setAppliedFilters(filters);
  };

  const handleClear = () => {
    setFilters(INITIAL_FILTERS);
    setAppliedFilters(INITIAL_FILTERS);
    setPage(1);
  };

  const formatDate = (dt: string | null) => {
    if (!dt) return "—";
    return new Date(dt).toLocaleString("pt-BR", {
      dateStyle: "short",
      timeStyle: "short",
    });
  };

  const activeFilterCount = Object.values(appliedFilters).filter(
    (v) => v !== ""
  ).length;

  const insideCount = data.filter((r) => r.current_status === "INSIDE").length;
  const alertCount = data.filter((r) => r.current_status === "ALERT").length;
  const uniqueBoundaries = new Set(data.map((r) => r.boundary_name)).size;

  const showEmpty = !loading && data.length === 0;
  const showData = !loading && data.length > 0;

  // ─────────────────────────────────────────────
  // LOGO — resolve para data URL completa
  // ─────────────────────────────────────────────
  /**
   * jsPDF.addImage aceita:
   *   - string base64 pura (sem prefixo)  → formato deve ser informado explicitamente
   *   - data URL completa (data:image/png;base64,...) → detecta formato automaticamente
   *
   * A logo que vem do useCompany() pode chegar de ambas as formas.
   * Esta função normaliza para data URL completa.
   */
  const resolveLogoDataUrl = (): { dataUrl: string; format: "PNG" | "JPEG" } | null => {
    if (!logo) return null;
    const s = logo.trim();

    if (s.startsWith("data:image/png")) return { dataUrl: s, format: "PNG" };
    if (s.startsWith("data:image/jpeg") || s.startsWith("data:image/jpg"))
      return { dataUrl: s, format: "JPEG" };

    // base64 pura sem prefixo — assume PNG
    if (s.length > 100 && !s.startsWith("<") && !s.startsWith("http")) {
      return { dataUrl: `data:image/png;base64,${s}`, format: "PNG" };
    }

    // URL remota — não suportada diretamente pelo jsPDF no browser
    return null;
  };

  // ─────────────────────────────────────────────
  // EXPORT — busca todos os registros
  // ─────────────────────────────────────────────
  const fetchAllForExport = async (): Promise<TrackingRow[]> => {
    const total = pagination?.totalRecords ?? 0;
    if (total === 0) return [];

    // Busca em lotes de 500 para não sobrecarregar a API
    const BATCH = 500;
    const batches = Math.ceil(total / BATCH);
    const results: TrackingRow[] = [];

    for (let b = 1; b <= batches; b++) {
      const params = new URLSearchParams({
        page: String(b),
        limit: String(BATCH),
        ...Object.fromEntries(
          Object.entries(appliedFilters).filter(([, v]) => v !== "")
        ),
      });
      const res = await axios.get(
        `https://apinode.smartxhub.cloud/api/dashboard/boundary/${companyId}/tracking?${params}`
      );
      const rows: TrackingRow[] = res.data.data ?? [];
      results.push(...rows);
      if (rows.length < BATCH) break; // última página
    }

    return results;
  };

  const handleExport = async (
    format: "excel" | "pdf",
    scope: "filtered" | "all"
  ) => {
    setExporting(true);
    try {
      let exportData: TrackingRow[];

      if (scope === "filtered") {
        exportData = data;
      } else {
        exportData = await fetchAllForExport();
      }

      if (exportData.length === 0) {
        alert("Nenhum dado para exportar.");
        return;
      }

      if (format === "excel") {
        exportToExcel(exportData, scope);
      } else {
        exportToPDF(exportData, scope);
      }

      setShowExportModal(false);
    } catch (err) {
      console.error("Erro ao exportar:", err);
      alert("Ocorreu um erro durante a exportação. Verifique o console.");
    } finally {
      setExporting(false);
    }
  };

  // ─────────────────────────────────────────────
  // EXCEL
  // ─────────────────────────────────────────────
  const exportToExcel = (rows: TrackingRow[], scope: string) => {
    const excelData = rows.map((r) => ({
      Código: r.item_code,
      Nome: r.item_name,
      Boundary: r.boundary_name,
      Grupo: r.group_name || "—",
      Entrada: formatDate(r.entry_datetime),
      Saída: formatDate(r.exit_datetime),
      Status: r.current_status,
      Duração: r.duration_formatted,
      Categoria: r.duration_category,
      Turno: r.work_shift,
      Período: r.time_period_detailed,
      "Activity Period": r.activity_period,
      "Entry Time Range": r.entry_time_range,
    }));

    const ws = XLSX.utils.json_to_sheet(excelData);
    ws["!cols"] = [
      { wch: 14 }, { wch: 28 }, { wch: 28 }, { wch: 20 },
      { wch: 18 }, { wch: 18 }, { wch: 10 }, { wch: 14 },
      { wch: 14 }, { wch: 12 }, { wch: 22 }, { wch: 18 }, { wch: 18 },
    ];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Boundary Tracking");
    const buf = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    saveAs(
      new Blob([buf], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      }),
      `boundary-tracking-${scope}-${new Date().toISOString().split("T")[0]}.xlsx`
    );
  };

  // ─────────────────────────────────────────────
  // PDF
  // ─────────────────────────────────────────────
  const exportToPDF = (rows: TrackingRow[], scope: string) => {
    const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });

    // Header bar azul
    doc.setFillColor(37, 99, 235);
    doc.roundedRect(10, 10, 277, 45, 3, 3, "F");

    // Logo
    const logoResolved = resolveLogoDataUrl();
    let titleX = 15; // posição X do título sem logo
    if (logoResolved) {
      try {
        // Fundo branco para a logo
        doc.setFillColor(255, 255, 255);
        doc.roundedRect(13, 13, 44, 16, 2, 2, "F");
        // addImage com data URL completa — jsPDF detecta o formato
        doc.addImage(
          logoResolved.dataUrl,
          logoResolved.format,
          14, 14,   // x, y
          42, 14,   // width, height
          undefined,
          "FAST"
        );
        titleX = 62; // desloca o título para a direita da logo
      } catch (e) {
        console.warn("PDF: erro ao inserir logo →", e);
        // Fallback: título sem logo
        titleX = 15;
      }
    }

    // Título
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(255, 255, 255);
    doc.text("Boundary Tracking Report", titleX, 24);

    // Linha separadora
    doc.setDrawColor(255, 255, 255);
    doc.setLineWidth(0.3);
    doc.line(15, 30, 282, 30);

    // Metadados
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.text(`Data: ${new Date().toLocaleString("pt-BR")}`, 15, 37);
    doc.text(
      `Escopo: ${scope === "filtered" ? "Resultados filtrados" : "Todos os registros"}`,
      90, 37
    );
    doc.text(`Total: ${rows.length} registros`, 210, 37);

    // Tabela
    autoTable(doc, {
      head: [["Código", "Nome", "Boundary", "Grupo", "Entrada", "Saída", "Status", "Duração", "Categoria", "Turno"]],
      body: rows.map((r) => [
        r.item_code,
        r.item_name,
        r.boundary_name,
        r.group_name || "—",
        formatDate(r.entry_datetime),
        formatDate(r.exit_datetime),
        r.current_status,
        r.duration_formatted,
        r.duration_category,
        r.work_shift,
      ]),
      startY: 62,
      theme: "striped",
      styles: {
        fontSize: 7,
        cellPadding: 2,
        lineColor: [229, 231, 235] as [number, number, number],
        lineWidth: 0.1,
        font: "helvetica",
        textColor: [31, 41, 55] as [number, number, number],
      },
      headStyles: {
        fillColor: [37, 99, 235] as [number, number, number],
        textColor: [255, 255, 255] as [number, number, number],
        fontStyle: "bold",
        fontSize: 7.5,
        halign: "left",
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252] as [number, number, number],
      },
      columnStyles: {
        0: { cellWidth: 20 }, 1: { cellWidth: 38 }, 2: { cellWidth: 38 },
        3: { cellWidth: 25 }, 4: { cellWidth: 28 }, 5: { cellWidth: 28 },
        6: { cellWidth: 16 }, 7: { cellWidth: 20 }, 8: { cellWidth: 20 }, 9: { cellWidth: 18 },
      },
      margin: { top: 10, right: 10, bottom: 15, left: 14 },
    });

    // Footer em cada página
    const pageCount = (doc.internal as any).pages.length - 1;
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      const ph = doc.internal.pageSize.getHeight();
      const pw = doc.internal.pageSize.getWidth();
      doc.setFillColor(249, 250, 251);
      doc.rect(10, ph - 14, 277, 9, "F");
      doc.setFontSize(7);
      doc.setTextColor(107, 114, 128);
      doc.text(`Página ${i} de ${pageCount}`, pw / 2, ph - 8, { align: "center" });
      doc.text(`Gerado: ${new Date().toLocaleDateString("pt-BR")} | SmartX`, 15, ph - 8);
      doc.text(`Total: ${rows.length} registros`, pw - 15, ph - 8, { align: "right" });
    }

    doc.save(`boundary-tracking-${scope}-${new Date().toISOString().split("T")[0]}.pdf`);
  };

  // ─────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────
  return (
    <div className="bg-white rounded-2xl border-2 border-[#E2E8F0] shadow-lg overflow-hidden mb-6">

      {/* ── Header ── */}
      <div className="bg-gradient-to-r from-[#3b82f6] to-[#2563eb] p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center">
              <TableCellsIcon className="w-8 h-8 text-white" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-white mb-1">Tracking de Boundaries</h3>
              <p className="text-white/80 text-sm">Histórico de entradas e saídas por pessoa e área</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowExportModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 border border-white/30 text-white rounded-xl text-sm font-semibold transition-colors backdrop-blur-sm"
            >
              <ArrowDownTrayIcon className="w-4 h-4" />
              Exportar
            </button>

            {showData && (
              <div className="hidden lg:flex items-center gap-3">
                <div className="px-5 py-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20">
                  <p className="text-xs text-white/80 font-medium">Total</p>
                  <p className="text-xl font-bold text-white">{pagination?.totalRecords.toLocaleString("pt-BR") ?? "—"}</p>
                  <p className="text-xs text-white/70">registros</p>
                </div>
                <div className="px-5 py-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20">
                  <p className="text-xs text-white/80 font-medium">Dentro</p>
                  <p className="text-xl font-bold text-white">{insideCount}</p>
                  <p className="text-xs text-white/70">nesta página</p>
                </div>
                <div className="px-5 py-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20">
                  <p className="text-xs text-white/80 font-medium">Boundaries</p>
                  <p className="text-xl font-bold text-white">{uniqueBoundaries}</p>
                  <p className="text-xs text-white/70">nesta página</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="p-6 bg-gradient-to-b from-blue-50/30 to-white space-y-5">

        {/* ── Filtros ── */}
        <div className="bg-white rounded-xl border-2 border-[#E2E8F0] overflow-hidden shadow-sm">
          <button
            onClick={() => setShowFilters((v) => !v)}
            className="w-full flex items-center justify-between px-5 py-3 bg-gray-50 border-b border-gray-100 hover:bg-gray-100 transition-colors"
          >
            <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
              <FunnelIcon className="w-4 h-4 text-blue-500" />
              Filtros
              {activeFilterCount > 0 && (
                <span className="ml-1 px-2 py-0.5 bg-blue-600 text-white rounded-full text-xs font-bold">
                  {activeFilterCount}
                </span>
              )}
            </div>
            <span className="text-xs text-gray-400">{showFilters ? "Recolher ▲" : "Expandir ▼"}</span>
          </button>

          {showFilters && (
            <div className="p-5 space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="relative">
                  <MagnifyingGlassIcon className="absolute left-3 top-2.5 w-4 h-4 text-gray-400 pointer-events-none" />
                  <input className={`${inputClass} pl-9`} placeholder="Código item" value={filters.itemCode}
                    onChange={(e) => setFilters((f) => ({ ...f, itemCode: e.target.value }))} />
                </div>
                <div className="relative">
                  <MagnifyingGlassIcon className="absolute left-3 top-2.5 w-4 h-4 text-gray-400 pointer-events-none" />
                  <input className={`${inputClass} pl-9`} placeholder="Nome item" value={filters.itemName}
                    onChange={(e) => setFilters((f) => ({ ...f, itemName: e.target.value }))} />
                </div>
                <div className="relative">
                  <MapPinIcon className="absolute left-3 top-2.5 w-4 h-4 text-gray-400 pointer-events-none" />
                  <input className={`${inputClass} pl-9`} placeholder="Boundary" value={filters.boundaryName}
                    onChange={(e) => setFilters((f) => ({ ...f, boundaryName: e.target.value }))} />
                </div>
                <div className="relative">
                  <UserGroupIcon className="absolute left-3 top-2.5 w-4 h-4 text-gray-400 pointer-events-none" />
                  <input className={`${inputClass} pl-9`} placeholder="Grupo" value={filters.groupName}
                    onChange={(e) => setFilters((f) => ({ ...f, groupName: e.target.value }))} />
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <select className={selectClass} value={filters.currentStatus}
                  onChange={(e) => setFilters((f) => ({ ...f, currentStatus: e.target.value }))}>
                  <option value="">Todos os Status</option>
                  <option value="INSIDE">Inside</option>
                  <option value="EXITED">Exited</option>
                  <option value="ALERT">Alert</option>
                </select>
                <select className={selectClass} value={filters.workShift}
                  onChange={(e) => setFilters((f) => ({ ...f, workShift: e.target.value }))}>
                  <option value="">Todos os Turnos</option>
                  <option value="MORNING">Manhã</option>
                  <option value="AFTERNOON">Tarde</option>
                  <option value="NIGHT">Noite</option>
                </select>
                <input type="date" className={inputClass} value={filters.startDate}
                  onChange={(e) => setFilters((f) => ({ ...f, startDate: e.target.value }))} />
                <input type="date" className={inputClass} value={filters.endDate}
                  onChange={(e) => setFilters((f) => ({ ...f, endDate: e.target.value }))} />
              </div>

              <div className="flex gap-2 pt-1">
                <button onClick={handleApply}
                  className="px-5 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors shadow-sm">
                  Aplicar filtros
                </button>
                <button onClick={handleClear}
                  className="flex items-center gap-1.5 px-4 py-2 bg-gray-100 text-gray-600 rounded-xl text-sm font-semibold hover:bg-gray-200 transition-colors">
                  <XMarkIcon className="w-4 h-4" />
                  Limpar
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ── Loading ── */}
        {loading && (
          <div className="flex items-center justify-center h-64">
            <div className="flex flex-col items-center gap-3">
              <ArrowPathIcon className="w-8 h-8 text-blue-500 animate-spin" />
              <p className="text-gray-500 text-sm">Carregando registros...</p>
            </div>
          </div>
        )}

        {/* ── Empty ── */}
        {showEmpty && (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <TableCellsIcon className="w-16 h-16 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 font-medium">Nenhum registro encontrado</p>
              <p className="text-gray-400 text-sm mt-1">Ajuste os filtros para ver resultados</p>
            </div>
          </div>
        )}

        {/* ── Tabela ── */}
        {showData && (
          <div className="relative bg-white rounded-xl border-2 border-[#E2E8F0] shadow-sm overflow-hidden">
            <div className="overflow-x-auto overflow-y-auto max-h-[500px]">
              <table className="w-full text-sm">
                <thead className="sticky top-0 z-10">
                  <tr className="bg-gray-50 border-b-2 border-gray-100">
                    {["Código", "Nome", "Boundary", "Grupo", "Entrada", "Saída",
                      "Status", "Duração", "Categoria", "Turno", "Período"].map((h) => (
                      <th key={h}
                        className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {data.map((row, i) => {
                    const statusCfg = STATUS_CONFIG[row.current_status] ?? STATUS_CONFIG.EXITED;
                    const durationCfg = DURATION_CONFIG[row.duration_category];
                    const shiftCfg = SHIFT_CONFIG[row.work_shift];
                    return (
                      <tr key={i} className="hover:bg-blue-50/40 transition-colors">
                        <td className="px-4 py-3">
                          <span className="font-mono text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-lg">
                            {row.item_code}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-semibold text-gray-800 whitespace-nowrap">{row.item_name}</td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="flex items-center gap-1.5">
                            <MapPinIcon className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                            <span className="text-gray-700">{row.boundary_name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                          {row.group_name || <span className="text-gray-300">—</span>}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="flex items-center gap-1.5">
                            <ClockIcon className="w-3.5 h-3.5 text-green-400 shrink-0" />
                            <span className="text-gray-600 text-xs">{formatDate(row.entry_datetime)}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          {row.exit_datetime ? (
                            <div className="flex items-center gap-1.5">
                              <ClockIcon className="w-3.5 h-3.5 text-red-300 shrink-0" />
                              <span className="text-gray-600 text-xs">{formatDate(row.exit_datetime)}</span>
                            </div>
                          ) : (
                            <span className="text-gray-300 text-xs">Em curso</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${statusCfg.className}`}>
                            {statusCfg.label}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-700 font-medium whitespace-nowrap">
                          {row.duration_formatted}
                        </td>
                        <td className="px-4 py-3">
                          {durationCfg ? (
                            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${durationCfg.className}`}>
                              {durationCfg.label}
                            </span>
                          ) : (
                            <span className="text-gray-400 text-xs">{row.duration_category}</span>
                          )}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          {shiftCfg ? (
                            <div className="flex items-center gap-1.5">
                              <span className={`w-2 h-2 rounded-full ${shiftCfg.dot}`} />
                              <span className="text-gray-600 text-xs">{shiftCfg.label}</span>
                            </div>
                          ) : (
                            <span className="text-gray-400 text-xs">{row.work_shift || "—"}</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">
                          {row.time_period_detailed || "—"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Paginação */}
            {pagination && pagination.totalPages > 1 && (
              <div className="flex items-center justify-between px-5 py-3 bg-gray-50 border-t-2 border-gray-100">
                <span className="text-sm text-gray-500">
                  Página <strong className="text-gray-700">{pagination.currentPage}</strong> de{" "}
                  <strong className="text-gray-700">{pagination.totalPages}</strong>{" "}
                  — <span className="text-gray-400">{pagination.totalRecords.toLocaleString("pt-BR")} registros</span>
                </span>
                <div className="flex items-center gap-2">
                  <button disabled={!pagination.hasPrevPage} onClick={() => setPage((p) => p - 1)}
                    className="flex items-center gap-1 px-3 py-1.5 text-sm font-semibold rounded-xl border border-gray-200 bg-white text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                    <ChevronLeftIcon className="w-4 h-4" /> Anterior
                  </button>
                  <button disabled={!pagination.hasNextPage} onClick={() => setPage((p) => p + 1)}
                    className="flex items-center gap-1 px-3 py-1.5 text-sm font-semibold rounded-xl border border-gray-200 bg-white text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                    Próxima <ChevronRightIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── Stats cards ── */}
        {showData && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border-2 border-blue-200">
              <p className="text-xs text-blue-600 font-semibold mb-1">Total de registros</p>
              <p className="text-2xl font-bold text-blue-900">{pagination?.totalRecords.toLocaleString("pt-BR") ?? "—"}</p>
            </div>
            <div className="p-4 bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl border-2 border-emerald-200">
              <p className="text-xs text-emerald-600 font-semibold mb-1">Inside (página)</p>
              <p className="text-2xl font-bold text-emerald-900">{insideCount}</p>
            </div>
            <div className="p-4 bg-gradient-to-br from-red-50 to-red-100 rounded-xl border-2 border-red-200">
              <p className="text-xs text-red-600 font-semibold mb-1">Alertas (página)</p>
              <p className="text-2xl font-bold text-red-900">{alertCount}</p>
            </div>
            <div className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl border-2 border-purple-200">
              <p className="text-xs text-purple-600 font-semibold mb-1">Boundaries (página)</p>
              <p className="text-2xl font-bold text-purple-900">{uniqueBoundaries}</p>
            </div>
          </div>
        )}

        {/* ── Footer ── */}
        {showData && (
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-xl border border-blue-200">
              <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                  clipRule="evenodd" />
              </svg>
              <span className="text-xs text-blue-700 font-medium">
                50 registros por página · ordenado por entrada desc
              </span>
            </div>
            <div className="text-xs text-gray-400">
              Atualizado em {new Date().toLocaleString("pt-BR")}
            </div>
          </div>
        )}
      </div>

      {/* ══════════════════════════════════════════
          EXPORT MODAL
      ══════════════════════════════════════════ */}
      {showExportModal && (
        <div className="fixed inset-0 z-[9999] overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            {/* Backdrop — desabilitado durante export para evitar fechar acidentalmente */}
            <div
              className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm"
              onClick={() => { if (!exporting) setShowExportModal(false); }}
            />

            <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl z-[10000] overflow-hidden">
              {/* Modal header */}
              <div className="bg-gradient-to-r from-[#3b82f6] to-[#2563eb] px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <ArrowDownTrayIcon className="w-6 h-6 text-white" />
                    <h3 className="text-lg font-bold text-white">Exportar Tracking</h3>
                  </div>
                  <button
                    onClick={() => { if (!exporting) setShowExportModal(false); }}
                    className="text-white/80 hover:text-white transition-colors disabled:opacity-40"
                    disabled={exporting}
                  >
                    <XMarkIcon className="w-6 h-6" />
                  </button>
                </div>
              </div>

              <div className="px-6 py-6">
                {/* ── Tela de loading durante export ── */}
                {exporting ? (
                  <div className="flex flex-col items-center justify-center py-12 gap-4">
                    <div className="relative">
                      <div className="w-14 h-14 rounded-full border-4 border-blue-100" />
                      <div className="absolute inset-0 w-14 h-14 rounded-full border-4 border-transparent border-t-blue-500 border-r-blue-500 animate-spin" />
                    </div>
                    <div className="text-center">
                      <p className="text-gray-800 font-semibold">Gerando arquivo...</p>
                      <p className="text-gray-500 text-sm mt-1">Buscando todos os registros, aguarde</p>
                    </div>
                  </div>
                ) : (
                  <>
                    <p className="text-sm text-gray-500 mb-6">
                      Escolha o formato e o escopo dos dados para exportação
                    </p>

                    <div className="grid grid-cols-2 gap-4">
                      {/* Excel — Filtrado */}
                      <button
                        onClick={() => handleExport("excel", "filtered")}
                        className="flex flex-col items-center gap-3 p-5 border-2 border-gray-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all group"
                      >
                        <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center group-hover:bg-green-200 transition-colors">
                          <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zm4 18H6V4h7v5h5v11z" />
                            <path d="M8 12h8v2H8zm0 4h8v2H8zm0-8h5v2H8z" />
                          </svg>
                        </div>
                        <div className="text-center">
                          <div className="font-semibold text-gray-900 text-sm">Excel (XLSX)</div>
                          <div className="text-xs text-gray-500 mt-0.5">Resultados filtrados</div>
                          <div className="text-xs text-blue-600 font-semibold mt-1">{data.length} registros</div>
                        </div>
                      </button>

                      {/* Excel — Todos */}
                      <button
                        onClick={() => handleExport("excel", "all")}
                        className="flex flex-col items-center gap-3 p-5 border-2 border-gray-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all group"
                      >
                        <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center group-hover:bg-green-200 transition-colors">
                          <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zm4 18H6V4h7v5h5v11z" />
                            <path d="M8 12h8v2H8zm0 4h8v2H8zm0-8h5v2H8z" />
                          </svg>
                        </div>
                        <div className="text-center">
                          <div className="font-semibold text-gray-900 text-sm">Excel (XLSX)</div>
                          <div className="text-xs text-gray-500 mt-0.5">Todos os dados</div>
                          <div className="text-xs text-blue-600 font-semibold mt-1">
                            {pagination?.totalRecords.toLocaleString("pt-BR") ?? "—"} registros
                          </div>
                        </div>
                      </button>

                      {/* PDF — Filtrado */}
                      <button
                        onClick={() => handleExport("pdf", "filtered")}
                        className="flex flex-col items-center gap-3 p-5 border-2 border-gray-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all group"
                      >
                        <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center group-hover:bg-red-200 transition-colors">
                          <svg className="w-6 h-6 text-red-600" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zm4 18H6V4h7v5h5v11z" />
                            <path d="M9 13h6v2H9zm0 4h6v2H9z" />
                          </svg>
                        </div>
                        <div className="text-center">
                          <div className="font-semibold text-gray-900 text-sm">PDF Report</div>
                          <div className="text-xs text-gray-500 mt-0.5">Resultados filtrados</div>
                          <div className="text-xs text-blue-600 font-semibold mt-1">{data.length} registros</div>
                        </div>
                      </button>

                      {/* PDF — Todos */}
                      <button
                        onClick={() => handleExport("pdf", "all")}
                        className="flex flex-col items-center gap-3 p-5 border-2 border-gray-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all group"
                      >
                        <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center group-hover:bg-red-200 transition-colors">
                          <svg className="w-6 h-6 text-red-600" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zm4 18H6V4h7v5h5v11z" />
                            <path d="M9 13h6v2H9zm0 4h6v2H9z" />
                          </svg>
                        </div>
                        <div className="text-center">
                          <div className="font-semibold text-gray-900 text-sm">PDF Report</div>
                          <div className="text-xs text-gray-500 mt-0.5">Todos os dados</div>
                          <div className="text-xs text-blue-600 font-semibold mt-1">
                            {pagination?.totalRecords.toLocaleString("pt-BR") ?? "—"} registros
                          </div>
                        </div>
                      </button>
                    </div>

                    {/* Info */}
                    <div className="mt-5 p-4 bg-blue-50 border border-blue-200 rounded-xl flex gap-3">
                      <svg className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd"
                          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                          clipRule="evenodd" />
                      </svg>
                      <div className="text-xs text-blue-800 leading-relaxed">
                        <strong>Resultados filtrados:</strong> exporta apenas os dados visíveis conforme os filtros aplicados.<br />
                        <strong>Todos os dados:</strong> busca e exporta o dataset completo ({pagination?.totalRecords.toLocaleString("pt-BR") ?? "—"} registros) em lotes.
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}