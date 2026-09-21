import { SaleRecord } from '../types/sales';

/**
 * Calculates subtotal, discount amount, tax amount, and grand total.
 * - Subtotal = quantity * unitPrice
 * - Discount Amount = (Subtotal * discount%) / 100
 * - Taxable Amount = Subtotal - Discount Amount
 * - Tax Amount = (Taxable Amount * tax%) / 100
 * - Total Amount = Taxable Amount + Tax Amount
 */
export function calculateSaleTotals(
  quantity: number,
  unitPrice: number,
  discountPercent: number = 0,
  taxPercent: number = 0
): {
  subtotal: number;
  discountAmount: number;
  taxAmount: number;
  totalAmount: number;
} {
  const safeQty = Math.max(0, Number(quantity) || 0);
  const safePrice = Math.max(0, Number(unitPrice) || 0);
  const safeDiscount = Math.min(100, Math.max(0, Number(discountPercent) || 0));
  const safeTax = Math.max(0, Number(taxPercent) || 0);

  const subtotal = round2(safeQty * safePrice);
  const discountAmount = round2((subtotal * safeDiscount) / 100);
  const taxable = Math.max(0, subtotal - discountAmount);
  const taxAmount = round2((taxable * safeTax) / 100);
  const totalAmount = round2(taxable + taxAmount);

  return {
    subtotal,
    discountAmount,
    taxAmount,
    totalAmount,
  };
}

export function round2(num: number): number {
  return Math.round((num + Number.EPSILON) * 100) / 100;
}

/**
 * Generates an invoice number like INV-2026-0084
 */
export function generateInvoiceNumber(existingCount: number = 0): string {
  const currentYear = new Date().getFullYear();
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  const seq = String(existingCount + 1).padStart(4, '0');
  return `INV-${currentYear}-${seq || randomSuffix}`;
}
