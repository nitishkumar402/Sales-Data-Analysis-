import * as XLSX from 'xlsx';
import { SaleRecord, ImportValidationRow } from '../types/sales';
import { calculateSaleTotals } from './calculations';

/**
 * Export sales data to a clean Excel (.xlsx) file
 */
export function exportSalesToExcel(
  sales: SaleRecord[],
  filename?: string,
  currencySymbol: string = '₹'
) {
  const exportData = sales.map((s) => ({
    'Invoice Number': s.invoiceNumber,
    'Sale Date': s.saleDate,
    'Customer Name': s.customerName,
    'Customer Email': s.customerEmail || '—',
    'Customer Phone': s.customerPhone || '—',
    'Product Name': s.productName,
    'Category': s.category,
    'Quantity': s.quantity,
    [`Unit Price (${currencySymbol})`]: s.unitPrice,
    [`Subtotal (${currencySymbol})`]: s.subtotal,
    'Discount (%)': s.discount,
    [`Discount Amount (${currencySymbol})`]: s.discountAmount,
    'Tax (%)': s.tax,
    [`Tax Amount (${currencySymbol})`]: s.taxAmount,
    [`Total Amount (${currencySymbol})`]: s.totalAmount,
    'Payment Method': s.paymentMethod,
    'Salesperson': s.salesPerson,
    'Region': s.region,
    'Status': s.status,
    'Notes': s.notes || '',
  }));

  const worksheet = XLSX.utils.json_to_sheet(exportData);

  // Set nice column widths
  const colWidths = [
    { wch: 16 }, // Invoice
    { wch: 12 }, // Date
    { wch: 22 }, // Customer Name
    { wch: 25 }, // Email
    { wch: 16 }, // Phone
    { wch: 26 }, // Product
    { wch: 16 }, // Category
    { wch: 10 }, // Qty
    { wch: 14 }, // Unit Price
    { wch: 14 }, // Subtotal
    { wch: 12 }, // Disc %
    { wch: 14 }, // Disc Amt
    { wch: 10 }, // Tax %
    { wch: 14 }, // Tax Amt
    { wch: 16 }, // Total
    { wch: 16 }, // Payment
    { wch: 18 }, // Salesperson
    { wch: 12 }, // Region
    { wch: 14 }, // Status
    { wch: 30 }, // Notes
  ];
  worksheet['!cols'] = colWidths;

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Sales Data');

  const todayStr = new Date().toISOString().split('T')[0];
  const finalFilename = filename || `Sales_Report_${todayStr}.xlsx`;
  XLSX.writeFile(workbook, finalFilename);
}

/**
 * Generate and download a starter Sample Excel Template for easy user importing
 */
export function downloadSampleExcelTemplate() {
  const sampleData = [
    {
      'Invoice Number': 'INV-2026-9001',
      'Sale Date': new Date().toISOString().split('T')[0],
      'Customer Name': 'Karan Johar Enterprises',
      'Customer Email': 'procure@karanenterprises.in',
      'Customer Phone': '+91 98200 45678',
      'Product Name': 'MacBook Pro 16" M3 Max',
      'Category': 'Electronics',
      'Quantity': 2,
      'Unit Price': 249900,
      'Discount (%)': 5,
      'Tax (%)': 18,
      'Payment Method': 'Bank Transfer',
      'Salesperson': 'Nitish Kumar',
      'Region': 'West',
      'Status': 'Completed',
      'Notes': 'Sample imported record from official template',
    },
    {
      'Invoice Number': 'INV-2026-9002',
      'Sale Date': new Date().toISOString().split('T')[0],
      'Customer Name': 'Shilpa Shetty Wellness',
      'Customer Email': 'shilpa@wellnesskart.com',
      'Customer Phone': '+91 99887 66554',
      'Product Name': 'Herman Miller Aeron Ergonomic Chair',
      'Category': 'Furniture',
      'Quantity': 1,
      'Unit Price': 115000,
      'Discount (%)': 10,
      'Tax (%)': 18,
      'Payment Method': 'Card',
      'Salesperson': 'Meera Joshi',
      'Region': 'South',
      'Status': 'Completed',
      'Notes': 'Office studio equipment',
    }
  ];

  const worksheet = XLSX.utils.json_to_sheet(sampleData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Template');
  XLSX.writeFile(workbook, 'SalesFlow_Import_Template.xlsx');
}

/**
 * Parse an uploaded Excel / CSV file from ArrayBuffer
 */
export function parseExcelFile(
  data: ArrayBuffer,
  existingInvoices: Set<string>
): {
  rows: ImportValidationRow[];
  headers: string[];
  totalRows: number;
  validCount: number;
  errorCount: number;
} {
  const workbook = XLSX.read(data, { type: 'array', cellDates: true });
  const firstSheetName = workbook.SheetNames[0];
  if (!firstSheetName) {
    throw new Error('The uploaded file does not contain any worksheets.');
  }

  const worksheet = workbook.Sheets[firstSheetName];
  const rawRows: Record<string, any>[] = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

  if (!rawRows || rawRows.length === 0) {
    throw new Error('The uploaded worksheet is empty.');
  }

  const headers = Object.keys(rawRows[0] || {});
  const seenInvoicesInFile = new Set<string>();

  const rows: ImportValidationRow[] = rawRows.map((raw, index) => {
    const rowNum = index + 2; // considering 1-based header row
    const errors: string[] = [];

    // Fuzzy field matching
    const findField = (patterns: string[]): any => {
      for (const key of Object.keys(raw)) {
        const cleanKey = key.toLowerCase().replace(/[^a-z0-9]/g, '');
        for (const pattern of patterns) {
          if (cleanKey.includes(pattern)) {
            return raw[key];
          }
        }
      }
      return '';
    };

    let invoiceNumber = String(findField(['invoicenumber', 'invoice', 'invno', 'inv']) || '').trim();
    if (!invoiceNumber) {
      errors.push('Missing invoice number');
    } else {
      const lowerInv = invoiceNumber.toLowerCase();
      if (seenInvoicesInFile.has(lowerInv)) {
        errors.push(`Duplicate invoice in file (${invoiceNumber})`);
      } else if (existingInvoices.has(lowerInv)) {
        errors.push(`Invoice already exists in database (${invoiceNumber})`);
      } else {
        seenInvoicesInFile.add(lowerInv);
      }
    }

    // Date
    let rawDate = findField(['saledate', 'date', 'orderdate']);
    let saleDate = '';
    if (rawDate instanceof Date && !isNaN(rawDate.getTime())) {
      saleDate = rawDate.toISOString().split('T')[0];
    } else if (typeof rawDate === 'string' && rawDate.trim()) {
      const parsed = new Date(rawDate.trim());
      if (!isNaN(parsed.getTime())) {
        saleDate = parsed.toISOString().split('T')[0];
      } else {
        saleDate = rawDate.trim();
      }
    } else if (typeof rawDate === 'number') {
      // Excel serial date format
      const parsedDate = new Date(Math.round((rawDate - 25569) * 86400 * 1000));
      if (!isNaN(parsedDate.getTime())) {
        saleDate = parsedDate.toISOString().split('T')[0];
      }
    }

    if (!saleDate) {
      errors.push('Missing or invalid sale date');
    }

    // Customer
    const customerName = String(findField(['customername', 'customer', 'client', 'buyer']) || '').trim();
    if (!customerName) {
      errors.push('Missing customer name');
    }

    const customerEmail = String(findField(['customeremail', 'email', 'mail']) || '').trim();
    if (customerEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail)) {
      errors.push('Invalid customer email format');
    }

    const customerPhone = String(findField(['customerphone', 'phone', 'mobile', 'contact']) || '').trim();

    // Product & Category
    const productName = String(findField(['productname', 'product', 'itemname', 'item']) || '').trim();
    if (!productName) {
      errors.push('Missing product name');
    }

    const category = String(findField(['category', 'type', 'group']) || 'General').trim();

    // Quantity
    const rawQty = findField(['quantity', 'qty', 'units', 'count']);
    const quantity = Number(rawQty);
    if (isNaN(quantity) || quantity <= 0) {
      errors.push('Quantity must be greater than 0');
    }

    // Unit Price
    const rawPrice = findField(['unitprice', 'price', 'rate', 'cost']);
    const unitPrice = Number(rawPrice);
    if (isNaN(unitPrice) || unitPrice < 0) {
      errors.push('Unit price must be 0 or higher');
    }

    // Discount & Tax
    const rawDiscount = findField(['discount', 'disc']);
    const discount = Math.max(0, Math.min(100, Number(rawDiscount) || 0));

    const rawTax = findField(['tax', 'gst', 'vat']);
    const tax = Math.max(0, Number(rawTax) || 0);

    // Totals
    const totals = calculateSaleTotals(quantity, unitPrice, discount, tax);

    // Payment method
    const rawPayment = String(findField(['paymentmethod', 'payment', 'paymode', 'mode']) || 'UPI').trim();
    const validPayments = ['Cash', 'UPI', 'Card', 'Bank Transfer', 'Other'];
    const matchedPayment = validPayments.find((p) => p.toLowerCase() === rawPayment.toLowerCase()) || 'Other';

    // Salesperson
    const salesPerson = String(findField(['salesperson', 'salesrep', 'rep', 'agent']) || 'Nitish Kumar').trim();

    // Region
    const rawRegion = String(findField(['region', 'zone', 'territory', 'location']) || 'North').trim();
    const validRegions = ['North', 'South', 'East', 'West', 'Central'];
    const matchedRegion = (validRegions.find((r) => r.toLowerCase() === rawRegion.toLowerCase()) || 'North') as any;

    // Status
    const rawStatus = String(findField(['status', 'state']) || 'Completed').trim();
    const validStatuses = ['Completed', 'Pending', 'Cancelled', 'Processing'];
    const matchedStatus = (validStatuses.find((s) => s.toLowerCase() === rawStatus.toLowerCase()) || 'Completed') as any;

    const notes = String(findField(['notes', 'comments', 'remark']) || '').trim();

    const saleRecord: Partial<SaleRecord> = {
      invoiceNumber,
      saleDate,
      customerName,
      customerEmail,
      customerPhone,
      productName,
      category,
      quantity,
      unitPrice,
      discount,
      tax,
      subtotal: totals.subtotal,
      discountAmount: totals.discountAmount,
      taxAmount: totals.taxAmount,
      totalAmount: totals.totalAmount,
      paymentMethod: matchedPayment as any,
      salesPerson,
      region: matchedRegion,
      status: matchedStatus,
      notes,
    };

    return {
      rowNumber: rowNum,
      data: saleRecord,
      errors,
      isValid: errors.length === 0,
    };
  });

  const validCount = rows.filter((r) => r.isValid).length;
  const errorCount = rows.length - validCount;

  return {
    rows,
    headers,
    totalRows: rows.length,
    validCount,
    errorCount,
  };
}
