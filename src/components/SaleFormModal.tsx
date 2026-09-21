import { useState, useEffect, useMemo } from 'react';
import { X, Calculator, Sparkles, AlertCircle } from 'lucide-react';
import { SaleRecord, PaymentMethod, Region, SaleStatus } from '../types/sales';
import { calculateSaleTotals, generateInvoiceNumber } from '../utils/calculations';
import { formatCurrency } from '../utils/formatting';
import * as db from '../db/indexedDB';

interface SaleFormModalProps {
  isOpen: boolean;
  saleToEdit?: SaleRecord | null;
  onClose: () => void;
  onSave: (sale: SaleRecord) => Promise<void>;
  existingSalesCount: number;
  currencySymbol: string;
  currencyCode: string;
}

export function SaleFormModal({
  isOpen,
  saleToEdit,
  onClose,
  onSave,
  existingSalesCount,
  currencySymbol,
  currencyCode,
}: SaleFormModalProps) {
  const isEditing = Boolean(saleToEdit);

  // Form fields
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [saleDate, setSaleDate] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [productName, setProductName] = useState('');
  const [category, setCategory] = useState('Electronics');
  const [quantity, setQuantity] = useState<number>(1);
  const [unitPrice, setUnitPrice] = useState<number>(0);
  const [discount, setDiscount] = useState<number>(0);
  const [tax, setTax] = useState<number>(18);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('UPI');
  const [salesPerson, setSalesPerson] = useState('Nitish Kumar');
  const [region, setRegion] = useState<Region>('North');
  const [status, setStatus] = useState<SaleStatus>('Completed');
  const [notes, setNotes] = useState('');

  // Validation errors & submitting state
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [duplicateInvoiceError, setDuplicateInvoiceError] = useState<string | null>(null);

  // Reset or populate form when opened / saleToEdit changes
  useEffect(() => {
    if (isOpen) {
      setErrors({});
      setDuplicateInvoiceError(null);
      if (saleToEdit) {
        setInvoiceNumber(saleToEdit.invoiceNumber);
        setSaleDate(saleToEdit.saleDate);
        setCustomerName(saleToEdit.customerName);
        setCustomerEmail(saleToEdit.customerEmail || '');
        setCustomerPhone(saleToEdit.customerPhone || '');
        setProductName(saleToEdit.productName);
        setCategory(saleToEdit.category);
        setQuantity(saleToEdit.quantity);
        setUnitPrice(saleToEdit.unitPrice);
        setDiscount(saleToEdit.discount);
        setTax(saleToEdit.tax);
        setPaymentMethod(saleToEdit.paymentMethod);
        setSalesPerson(saleToEdit.salesPerson);
        setRegion(saleToEdit.region);
        setStatus(saleToEdit.status);
        setNotes(saleToEdit.notes || '');
      } else {
        // Defaults for new sale
        setInvoiceNumber(generateInvoiceNumber(existingSalesCount));
        setSaleDate(new Date().toISOString().split('T')[0]);
        setCustomerName('');
        setCustomerEmail('');
        setCustomerPhone('');
        setProductName('');
        setCategory('Electronics');
        setQuantity(1);
        setUnitPrice(10000);
        setDiscount(0);
        setTax(18);
        setPaymentMethod('UPI');
        setSalesPerson('Nitish Kumar');
        setRegion('North');
        setStatus('Completed');
        setNotes('');
      }
    }
  }, [isOpen, saleToEdit, existingSalesCount]);

  // Real-time automatic calculations
  const totals = useMemo(() => {
    return calculateSaleTotals(quantity, unitPrice, discount, tax);
  }, [quantity, unitPrice, discount, tax]);

  // Real-time invoice duplicate checker
  useEffect(() => {
    let active = true;
    if (!invoiceNumber.trim()) {
      setDuplicateInvoiceError(null);
      return;
    }
    const timer = setTimeout(async () => {
      try {
        const exists = await db.checkInvoiceExists(
          invoiceNumber,
          saleToEdit ? saleToEdit.id : undefined
        );
        if (active) {
          if (exists) {
            setDuplicateInvoiceError('Invoice number already exists.');
          } else {
            setDuplicateInvoiceError(null);
          }
        }
      } catch (e) {}
    }, 250);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [invoiceNumber, saleToEdit]);

  if (!isOpen) return null;

  const validate = (): boolean => {
    const errs: Record<string, string> = {};

    if (!invoiceNumber.trim()) {
      errs.invoiceNumber = 'Invoice number is required';
    }
    if (!saleDate) {
      errs.saleDate = 'Sale date is required';
    }
    if (!customerName.trim()) {
      errs.customerName = 'Customer name is required';
    }
    if (customerEmail.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail.trim())) {
      errs.customerEmail = 'Please enter a valid email address';
    }
    if (!productName.trim()) {
      errs.productName = 'Product name is required';
    }
    if (quantity <= 0) {
      errs.quantity = 'Quantity must be greater than 0';
    }
    if (unitPrice < 0) {
      errs.unitPrice = 'Unit price cannot be negative';
    }
    if (discount < 0 || discount > 100) {
      errs.discount = 'Discount must be between 0% and 100%';
    }
    if (tax < 0) {
      errs.tax = 'Tax cannot be negative';
    }

    if (duplicateInvoiceError) {
      errs.invoiceNumber = duplicateInvoiceError;
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      setIsSubmitting(true);
      const now = new Date().toISOString();
      const saleRecord: SaleRecord = {
        id: saleToEdit ? saleToEdit.id : `sale-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`,
        invoiceNumber: invoiceNumber.trim().toUpperCase(),
        saleDate,
        customerName: customerName.trim(),
        customerEmail: customerEmail.trim(),
        customerPhone: customerPhone.trim(),
        productName: productName.trim(),
        category,
        quantity: Number(quantity),
        unitPrice: Number(unitPrice),
        discount: Number(discount),
        tax: Number(tax),
        subtotal: totals.subtotal,
        discountAmount: totals.discountAmount,
        taxAmount: totals.taxAmount,
        totalAmount: totals.totalAmount,
        paymentMethod,
        salesPerson,
        region,
        status,
        notes: notes.trim(),
        createdAt: saleToEdit ? saleToEdit.createdAt : now,
        updatedAt: now,
      };

      await onSave(saleRecord);
      onClose();
    } catch (err: any) {
      console.error('Failed to save sale:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGenerateInvoice = () => {
    setInvoiceNumber(generateInvoiceNumber(existingSalesCount + Math.floor(Math.random() * 500)));
  };

  const categoryOptions = [
    'Electronics',
    'Software',
    'Hardware',
    'Accessories',
    'Services',
    'Furniture',
    'Other',
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/75 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div
        id="sale-form-modal"
        className="w-full max-w-3xl my-auto rounded-2xl glass-modal border border-white/15 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-slate-900/60">
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight">
              {isEditing ? 'Edit Sale Record' : 'Add New Sale'}
            </h2>
            <p className="text-xs text-slate-400">
              {isEditing
                ? 'Update sale information and recalculate ledger'
                : 'Enter sales transaction details to record in IndexedDB'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-white/5 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {/* Section 1: Invoice & Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-300">
                  Invoice Number <span className="text-rose-400">*</span>
                </label>
                {!isEditing && (
                  <button
                    type="button"
                    onClick={handleGenerateInvoice}
                    className="text-[11px] text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
                  >
                    <Sparkles className="w-3 h-3" />
                    Auto-Generate
                  </button>
                )}
              </div>
              <input
                id="form-invoice-number"
                type="text"
                value={invoiceNumber}
                onChange={(e) => setInvoiceNumber(e.target.value)}
                placeholder="INV-2026-0001"
                className={`w-full px-3.5 py-2 text-sm rounded-xl glass-input ${
                  errors.invoiceNumber || duplicateInvoiceError ? 'border-rose-500' : ''
                }`}
              />
              {(errors.invoiceNumber || duplicateInvoiceError) && (
                <p className="text-xs text-rose-400 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.invoiceNumber || duplicateInvoiceError}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Sale Date <span className="text-rose-400">*</span>
              </label>
              <input
                id="form-sale-date"
                type="date"
                value={saleDate}
                onChange={(e) => setSaleDate(e.target.value)}
                className={`w-full px-3.5 py-2 text-sm rounded-xl glass-input ${
                  errors.saleDate ? 'border-rose-500' : ''
                }`}
              />
              {errors.saleDate && (
                <p className="text-xs text-rose-400 mt-1">{errors.saleDate}</p>
              )}
            </div>
          </div>

          {/* Section 2: Customer Details */}
          <div className="pt-2 border-t border-white/5">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-cyan-400 mb-3">
              Customer Information
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Customer Name <span className="text-rose-400">*</span>
                </label>
                <input
                  id="form-customer-name"
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="e.g. Rajesh Sharma"
                  className={`w-full px-3.5 py-2 text-sm rounded-xl glass-input ${
                    errors.customerName ? 'border-rose-500' : ''
                  }`}
                />
                {errors.customerName && (
                  <p className="text-xs text-rose-400 mt-1">{errors.customerName}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Customer Email
                </label>
                <input
                  id="form-customer-email"
                  type="email"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  placeholder="rajesh@company.in"
                  className={`w-full px-3.5 py-2 text-sm rounded-xl glass-input ${
                    errors.customerEmail ? 'border-rose-500' : ''
                  }`}
                />
                {errors.customerEmail && (
                  <p className="text-xs text-rose-400 mt-1">{errors.customerEmail}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Customer Phone
                </label>
                <input
                  id="form-customer-phone"
                  type="tel"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="+91 98200 12345"
                  className="w-full px-3.5 py-2 text-sm rounded-xl glass-input"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Product, Quantity, Pricing */}
          <div className="pt-2 border-t border-white/5">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-cyan-400 mb-3">
              Item Details & Pricing
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Product Name <span className="text-rose-400">*</span>
                </label>
                <input
                  id="form-product-name"
                  type="text"
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  placeholder="e.g. MacBook Pro 16 M3 Max"
                  className={`w-full px-3.5 py-2 text-sm rounded-xl glass-input ${
                    errors.productName ? 'border-rose-500' : ''
                  }`}
                />
                {errors.productName && (
                  <p className="text-xs text-rose-400 mt-1">{errors.productName}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Category
                </label>
                <select
                  id="form-category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm rounded-xl glass-input bg-slate-900"
                >
                  {categoryOptions.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Quantity <span className="text-rose-400">*</span>
                </label>
                <input
                  id="form-quantity"
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full px-3.5 py-2 text-sm rounded-xl glass-input"
                />
                {errors.quantity && (
                  <p className="text-xs text-rose-400 mt-1">{errors.quantity}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Unit Price ({currencySymbol}) <span className="text-rose-400">*</span>
                </label>
                <input
                  id="form-unit-price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={unitPrice}
                  onChange={(e) => setUnitPrice(Math.max(0, parseFloat(e.target.value) || 0))}
                  className="w-full px-3.5 py-2 text-sm rounded-xl glass-input"
                />
                {errors.unitPrice && (
                  <p className="text-xs text-rose-400 mt-1">{errors.unitPrice}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Discount (%)
                </label>
                <input
                  id="form-discount"
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={discount}
                  onChange={(e) => setDiscount(Math.min(100, Math.max(0, parseFloat(e.target.value) || 0)))}
                  className="w-full px-3.5 py-2 text-sm rounded-xl glass-input"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Tax / GST (%)
                </label>
                <input
                  id="form-tax"
                  type="number"
                  min="0"
                  max="100"
                  step="0.5"
                  value={tax}
                  onChange={(e) => setTax(Math.max(0, parseFloat(e.target.value) || 0))}
                  className="w-full px-3.5 py-2 text-sm rounded-xl glass-input"
                />
              </div>
            </div>
          </div>

          {/* Real-time Calculated Summary Bar */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-cyan-950/40 via-slate-900/60 to-indigo-950/40 border border-cyan-500/20 backdrop-blur-md">
            <div className="flex items-center gap-2 mb-2 text-cyan-400 font-semibold text-xs uppercase tracking-wider">
              <Calculator className="w-4 h-4" />
              <span>Automated Financial Calculation</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              <div className="p-2 rounded-lg bg-black/20">
                <span className="block text-[11px] text-slate-400">Subtotal</span>
                <span className="text-sm font-semibold text-slate-200">
                  {formatCurrency(totals.subtotal, currencyCode, currencySymbol)}
                </span>
              </div>
              <div className="p-2 rounded-lg bg-black/20">
                <span className="block text-[11px] text-slate-400">Discount ({discount}%)</span>
                <span className="text-sm font-semibold text-amber-300">
                  -{formatCurrency(totals.discountAmount, currencyCode, currencySymbol)}
                </span>
              </div>
              <div className="p-2 rounded-lg bg-black/20">
                <span className="block text-[11px] text-slate-400">Tax ({tax}%)</span>
                <span className="text-sm font-semibold text-slate-300">
                  +{formatCurrency(totals.taxAmount, currencyCode, currencySymbol)}
                </span>
              </div>
              <div className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/30">
                <span className="block text-[11px] text-cyan-300 font-medium">Grand Total</span>
                <span className="text-base font-bold text-white">
                  {formatCurrency(totals.totalAmount, currencyCode, currencySymbol)}
                </span>
              </div>
            </div>
          </div>

          {/* Section 4: Operational & Assignment */}
          <div className="pt-2 border-t border-white/5">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-cyan-400 mb-3">
              Fulfillment & Payment
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Payment Method
                </label>
                <select
                  id="form-payment-method"
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                  className="w-full px-3.5 py-2 text-sm rounded-xl glass-input bg-slate-900"
                >
                  <option value="UPI">UPI</option>
                  <option value="Card">Card</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="Cash">Cash</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Salesperson
                </label>
                <input
                  id="form-salesperson"
                  type="text"
                  value={salesPerson}
                  onChange={(e) => setSalesPerson(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm rounded-xl glass-input"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Region
                </label>
                <select
                  id="form-region"
                  value={region}
                  onChange={(e) => setRegion(e.target.value as Region)}
                  className="w-full px-3.5 py-2 text-sm rounded-xl glass-input bg-slate-900"
                >
                  <option value="North">North</option>
                  <option value="South">South</option>
                  <option value="East">East</option>
                  <option value="West">West</option>
                  <option value="Central">Central</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Order Status
                </label>
                <select
                  id="form-status"
                  value={status}
                  onChange={(e) => setStatus(e.target.value as SaleStatus)}
                  className="w-full px-3.5 py-2 text-sm rounded-xl glass-input bg-slate-900"
                >
                  <option value="Completed">Completed</option>
                  <option value="Processing">Processing</option>
                  <option value="Pending">Pending</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 5: Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Notes / Delivery Instructions
            </label>
            <textarea
              id="form-notes"
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Optional notes or reference numbers..."
              className="w-full px-3.5 py-2 text-sm rounded-xl glass-input resize-none"
            />
          </div>

          {/* Footer Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 text-sm font-medium text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700 border border-white/10 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              id="form-save-btn"
              disabled={isSubmitting}
              className="px-6 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 shadow-lg shadow-cyan-500/25 rounded-xl transition-all disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : isEditing ? 'Update Sale' : 'Save Sale'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
