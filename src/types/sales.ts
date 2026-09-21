export type PaymentMethod = 'Cash' | 'UPI' | 'Card' | 'Bank Transfer' | 'Other';
export type SaleStatus = 'Completed' | 'Pending' | 'Cancelled' | 'Processing';
export type Region = 'North' | 'South' | 'East' | 'West' | 'Central';

export interface SaleRecord {
  id: string;
  invoiceNumber: string;
  saleDate: string; // YYYY-MM-DD
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  productName: string;
  category: string;
  quantity: number;
  unitPrice: number;
  discount: number; // percentage, e.g. 10 for 10%
  tax: number; // percentage, e.g. 18 for 18% GST
  subtotal: number;
  discountAmount: number;
  taxAmount: number;
  totalAmount: number;
  paymentMethod: PaymentMethod;
  salesPerson: string;
  region: Region;
  status: SaleStatus;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export type DateRangePreset = 
  | 'today' 
  | 'this_week' 
  | 'this_month' 
  | 'this_quarter' 
  | 'this_year' 
  | 'all' 
  | 'custom';

export interface FilterState {
  search: string;
  dateRange: DateRangePreset;
  startDate: string;
  endDate: string;
  customer: string;
  product: string;
  category: string;
  salesPerson: string;
  region: string;
  paymentMethod: string;
  status: string;
  minAmount: number | null;
  maxAmount: number | null;
}

export interface SortConfig {
  key: keyof SaleRecord;
  direction: 'asc' | 'desc';
}

export interface AppSettings {
  currency: 'INR' | 'USD' | 'EUR' | 'GBP';
  currencySymbol: string;
  dateFormat: 'YYYY-MM-DD' | 'DD/MM/YYYY' | 'MM/DD/YYYY';
  rowsPerPage: number;
  theme: 'dark' | 'light';
}

export interface KPIData {
  totalSales: number; // Revenue
  totalOrders: number;
  averageOrderValue: number;
  totalUnitsSold: number;
  totalDiscount: number;
  totalTax: number;
  pendingOrders: number;
  completedOrders: number;
  revenueChange: number; // percentage vs prior period
  ordersChange: number;
  aovChange: number;
  unitsChange: number;
}

export interface ColumnMapping {
  excelColumn: string;
  field: keyof SaleRecord | 'skip';
}

export interface ImportValidationRow {
  rowNumber: number;
  data: Partial<SaleRecord>;
  errors: string[];
  isValid: boolean;
}

export type ActiveTab = 
  | 'dashboard'
  | 'sales'
  | 'customers'
  | 'products'
  | 'analytics'
  | 'reports'
  | 'import-export'
  | 'settings';
