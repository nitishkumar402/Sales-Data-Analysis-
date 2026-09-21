import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { SaleRecord } from '../types/sales';
import { formatCurrency, formatDate } from './formatting';

/**
 * Generate a comprehensive Sales Analytics PDF Report
 */
export function exportSalesToPDF(
  sales: SaleRecord[],
  reportTitle: string = 'Sales Analytics Report',
  dateRangeText: string = 'All Time',
  currencySymbol: string = '₹',
  currencyCode: string = 'INR'
) {
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'pt',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // Primary Header Banner
  doc.setFillColor(15, 23, 42); // #0F172A Dark Navy
  doc.rect(0, 0, pageWidth, 75, 'F');

  // App Brand & Tagline
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.text('SalesFlow Analytics', 36, 34);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(148, 163, 184); // slate-400
  doc.text('Track. Analyze. Grow.  |  Local-first Intelligence', 36, 52);

  // Report Title & Meta on the right
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(56, 189, 248); // sky-400
  doc.text(reportTitle, pageWidth - 36, 32, { align: 'right' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(203, 213, 225);
  const nowStr = new Date().toLocaleString();
  doc.text(`Generated: ${nowStr}   |   Period: ${dateRangeText}`, pageWidth - 36, 48, {
    align: 'right',
  });

  // Calculate Summary KPIs for header cards
  const totalRev = sales.reduce((acc, s) => acc + s.totalAmount, 0);
  const totalOrders = sales.length;
  const aov = totalOrders > 0 ? totalRev / totalOrders : 0;
  const totalUnits = sales.reduce((acc, s) => acc + s.quantity, 0);

  // KPI Summary Bar
  const kpiTop = 88;
  const kpiHeight = 52;
  const cardWidth = (pageWidth - 72 - 36) / 4;

  const kpis = [
    { label: 'Total Revenue', value: formatCurrency(totalRev, currencyCode, currencySymbol) },
    { label: 'Total Orders', value: totalOrders.toLocaleString() },
    { label: 'Avg Order Value', value: formatCurrency(aov, currencyCode, currencySymbol) },
    { label: 'Total Units Sold', value: totalUnits.toLocaleString() },
  ];

  kpis.forEach((kpi, idx) => {
    const x = 36 + idx * (cardWidth + 12);
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(x, kpiTop, cardWidth, kpiHeight, 4, 4, 'F');
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(x, kpiTop, cardWidth, kpiHeight, 4, 4, 'S');

    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.setFont('helvetica', 'bold');
    doc.text(kpi.label.toUpperCase(), x + 10, kpiTop + 16);

    doc.setFontSize(13);
    doc.setTextColor(15, 23, 42);
    doc.text(kpi.value, x + 10, kpiTop + 36);
  });

  // Sales Data Table
  const tableRows = sales.map((s) => [
    s.invoiceNumber,
    s.saleDate,
    s.customerName,
    s.productName,
    s.category,
    s.quantity.toString(),
    formatCurrency(s.unitPrice, currencyCode, currencySymbol),
    `${s.discount}%`,
    `${s.tax}%`,
    formatCurrency(s.totalAmount, currencyCode, currencySymbol),
    s.paymentMethod,
    s.salesPerson,
    s.status,
  ]);

  autoTable(doc, {
    startY: 152,
    head: [[
      'Invoice #',
      'Date',
      'Customer',
      'Product',
      'Category',
      'Qty',
      'Price',
      'Disc',
      'Tax',
      'Total',
      'Payment',
      'Sales Rep',
      'Status',
    ]],
    body: tableRows,
    theme: 'striped',
    headStyles: {
      fillColor: [30, 41, 59], // slate-800
      textColor: [255, 255, 255],
      fontSize: 8,
      fontStyle: 'bold',
      halign: 'left',
    },
    styles: {
      fontSize: 7.5,
      cellPadding: 4,
      textColor: [30, 41, 59],
      overflow: 'linebreak',
    },
    columnStyles: {
      0: { cellWidth: 55, fontStyle: 'bold' },
      1: { cellWidth: 50 },
      2: { cellWidth: 75 },
      3: { cellWidth: 90 },
      4: { cellWidth: 55 },
      5: { cellWidth: 28, halign: 'right' },
      6: { cellWidth: 48, halign: 'right' },
      7: { cellWidth: 32, halign: 'right' },
      8: { cellWidth: 30, halign: 'right' },
      9: { cellWidth: 55, halign: 'right', fontStyle: 'bold' },
      10: { cellWidth: 50 },
      11: { cellWidth: 55 },
      12: { cellWidth: 45 },
    },
    didDrawPage: (data) => {
      // Footer
      const str = `Page ${data.pageNumber} of ${doc.getNumberOfPages()}`;
      doc.setFontSize(8);
      doc.setTextColor(148, 163, 184);
      doc.text(str, pageWidth / 2, pageHeight - 15, { align: 'center' });
      doc.text('SalesFlow Analytics — Confidential Internal Report', 36, pageHeight - 15);
    },
    margin: { left: 36, right: 36, bottom: 25 },
  });

  const todayStr = new Date().toISOString().split('T')[0];
  doc.save(`Sales_Report_${todayStr}.pdf`);
}

/**
 * Export executive summary PDF report with KPIs
 */
export function exportSalesSummaryPDF(
  sales: SaleRecord[],
  kpis?: any,
  currencySymbol: string = '₹',
  currencyCode: string = 'INR',
  dateRangeText: string = 'All Time'
) {
  exportSalesToPDF(
    sales,
    'SalesFlow Executive Summary Report',
    dateRangeText,
    currencySymbol,
    currencyCode
  );
}

/**
 * Export table register PDF report
 */
export function exportSalesTablePDF(
  sales: SaleRecord[],
  currencySymbol: string = '₹',
  currencyCode: string = 'INR',
  reportTitle: string = 'Sales Transactions Register'
) {
  exportSalesToPDF(
    sales,
    reportTitle,
    'Current Filter Selection',
    currencySymbol,
    currencyCode
  );
}

/**
 * Generate a standalone printable Tax Invoice PDF for a single sale
 */
export function exportSingleInvoicePDF(
  sale: SaleRecord,
  currencySymbol: string = '₹',
  currencyCode: string = 'INR'
) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'pt',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // Header
  doc.setFillColor(15, 23, 42);
  doc.rect(0, 0, pageWidth, 90, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.text('SalesFlow Analytics', 40, 42);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(148, 163, 184);
  doc.text('Track. Analyze. Grow.  |  Authorized Commercial Invoice', 40, 60);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(56, 189, 248);
  doc.text('TAX INVOICE', pageWidth - 40, 44, { align: 'right' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(226, 232, 240);
  doc.text(`Invoice #: ${sale.invoiceNumber}`, pageWidth - 40, 62, { align: 'right' });
  doc.text(`Date: ${formatDate(sale.saleDate)}`, pageWidth - 40, 76, { align: 'right' });

  // Bill To & Details Block
  doc.setTextColor(30, 41, 59);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('BILLED TO:', 40, 115);
  doc.text('TRANSACTION DETAILS:', pageWidth / 2 + 20, 115);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text(sale.customerName, 40, 130);
  if (sale.customerEmail) doc.text(`Email: ${sale.customerEmail}`, 40, 144);
  if (sale.customerPhone) doc.text(`Phone: ${sale.customerPhone}`, 40, 158);
  doc.text(`Region: ${sale.region} India`, 40, 172);

  doc.text(`Payment Method: ${sale.paymentMethod}`, pageWidth / 2 + 20, 130);
  doc.text(`Sales Representative: ${sale.salesPerson}`, pageWidth / 2 + 20, 144);
  doc.text(`Status: ${sale.status.toUpperCase()}`, pageWidth / 2 + 20, 158);
  doc.text(`Date Generated: ${new Date().toLocaleDateString()}`, pageWidth / 2 + 20, 172);

  // Line item table
  autoTable(doc, {
    startY: 195,
    head: [[
      'Item & Description',
      'Category',
      'Qty',
      'Unit Price',
      'Subtotal',
      'Discount',
      'Tax',
      'Total',
    ]],
    body: [
      [
        sale.productName,
        sale.category,
        sale.quantity.toString(),
        formatCurrency(sale.unitPrice, currencyCode, currencySymbol),
        formatCurrency(sale.subtotal, currencyCode, currencySymbol),
        `${sale.discount}% (-${formatCurrency(sale.discountAmount, currencyCode, currencySymbol)})`,
        `${sale.tax}% (+${formatCurrency(sale.taxAmount, currencyCode, currencySymbol)})`,
        formatCurrency(sale.totalAmount, currencyCode, currencySymbol),
      ],
    ],
    theme: 'grid',
    headStyles: {
      fillColor: [30, 41, 59],
      textColor: [255, 255, 255],
      fontSize: 9,
      fontStyle: 'bold',
    },
    styles: {
      fontSize: 9,
      cellPadding: 7,
    },
    margin: { left: 40, right: 40 },
  });

  // Financial summary block
  const summaryY = (doc as any).lastAutoTable.finalY + 20;
  const summaryLeft = pageWidth - 240;

  doc.setFontSize(9);
  doc.setTextColor(71, 85, 105);

  doc.text('Subtotal:', summaryLeft, summaryY);
  doc.text(formatCurrency(sale.subtotal, currencyCode, currencySymbol), pageWidth - 40, summaryY, {
    align: 'right',
  });

  doc.text(`Discount (${sale.discount}%):`, summaryLeft, summaryY + 16);
  doc.text(`- ${formatCurrency(sale.discountAmount, currencyCode, currencySymbol)}`, pageWidth - 40, summaryY + 16, {
    align: 'right',
  });

  doc.text(`Tax / GST (${sale.tax}%):`, summaryLeft, summaryY + 32);
  doc.text(`+ ${formatCurrency(sale.taxAmount, currencyCode, currencySymbol)}`, pageWidth - 40, summaryY + 32, {
    align: 'right',
  });

  doc.setDrawColor(203, 213, 225);
  doc.line(summaryLeft, summaryY + 40, pageWidth - 40, summaryY + 40);

  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('Grand Total:', summaryLeft, summaryY + 56);
  doc.text(formatCurrency(sale.totalAmount, currencyCode, currencySymbol), pageWidth - 40, summaryY + 56, {
    align: 'right',
  });

  // Notes & terms
  if (sale.notes) {
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 41, 59);
    doc.text('Notes / Memo:', 40, summaryY);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139);
    doc.text(sale.notes, 40, summaryY + 14, { maxWidth: 260 });
  }

  // Footer
  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184);
  doc.text('Thank you for your business! This is a system-generated official invoice.', pageWidth / 2, pageHeight - 30, {
    align: 'center',
  });

  doc.save(`Invoice_${sale.invoiceNumber}.pdf`);
}
