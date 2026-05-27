import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export type HistoryPdfKpi = {
  label: string;
  value: string;
};

export type HistoryPdfRow = {
  code: string;
  route: string;
  cargo: string;
  value: string;
  status: string;
  finalized: string;
  distance: string;
};

export type HistoryPdfOptions = {
  title: string;
  periodLabel: string;
  generatedAt: string;
  kpis: HistoryPdfKpi[];
  columns: string[];
  rows: HistoryPdfRow[];
  footerLabel: string;
};

export function exportHistoryPdf(options: HistoryPdfOptions, filename: string) {
  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();

  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text(options.title, 14, 18);

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(80, 80, 80);
  doc.text(`${options.periodLabel}  •  ${options.generatedAt}`, 14, 26);
  doc.setTextColor(0, 0, 0);

  const kpiColumns = 2;
  const kpiBoxWidth = (pageWidth - 28 - 6) / kpiColumns;
  const kpiStartY = 34;

  options.kpis.forEach((kpi, index) => {
    const column = index % kpiColumns;
    const row = Math.floor(index / kpiColumns);
    const x = 14 + column * (kpiBoxWidth + 6);
    const y = kpiStartY + row * 16;

    doc.setDrawColor(220, 220, 220);
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(x, y, kpiBoxWidth, 12, 2, 2, "FD");

    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100, 100, 100);
    doc.text(kpi.label, x + 4, y + 5);

    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(0, 0, 0);
    doc.text(kpi.value, x + 4, y + 10);
  });

  const tableStartY = kpiStartY + Math.ceil(options.kpis.length / kpiColumns) * 16 + 6;

  autoTable(doc, {
    startY: tableStartY,
    head: [options.columns],
    body: options.rows.map((row) => [
      row.code,
      row.route,
      row.cargo,
      row.value,
      row.status,
      row.finalized,
      row.distance,
    ]),
    styles: {
      fontSize: 8,
      cellPadding: 2,
      overflow: "linebreak",
    },
    headStyles: {
      fillColor: [17, 83, 57],
      textColor: 255,
      fontStyle: "bold",
    },
    columnStyles: {
      0: { cellWidth: 28 },
      1: { cellWidth: 52 },
      3: { halign: "right" },
      6: { halign: "right" },
    },
    margin: { left: 14, right: 14 },
  });

  const finalY = (doc as jsPDF & { lastAutoTable?: { finalY: number } }).lastAutoTable?.finalY ?? tableStartY;
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100, 100, 100);
  doc.text(options.footerLabel, 14, finalY + 8);

  doc.save(filename);
}
