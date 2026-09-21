/**
 * Format currency with Indian grouping (e.g., ₹1,25,000) or standard international
 */
export function formatCurrency(
  amount: number,
  currencyCode: string = 'INR',
  currencySymbol: string = '₹'
): string {
  const safeAmount = Number.isFinite(amount) ? amount : 0;
  
  try {
    if (currencyCode === 'INR') {
      const formatted = new Intl.NumberFormat('en-IN', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
      }).format(safeAmount);
      return `${currencySymbol}${formatted}`;
    }

    const formatted = new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(safeAmount);
    return `${currencySymbol}${formatted}`;
  } catch {
    return `${currencySymbol}${safeAmount.toFixed(2)}`;
  }
}

/**
 * Format date nicely according to format
 */
export function formatDate(dateString: string, format: string = 'YYYY-MM-DD'): string {
  if (!dateString) return '—';
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;

    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();

    if (format === 'DD/MM/YYYY') {
      return `${day}/${month}/${year}`;
    }
    if (format === 'MM/DD/YYYY') {
      return `${month}/${day}/${year}`;
    }
    return `${year}-${month}-${day}`;
  } catch {
    return dateString;
  }
}

/**
 * Calculate percentage difference between current value and previous value
 */
export function calculatePercentageChange(current: number, previous: number): number {
  if (previous === 0) {
    return current > 0 ? 100 : 0;
  }
  const change = ((current - previous) / previous) * 100;
  return Math.round((change + Number.EPSILON) * 10) / 10;
}

/**
 * Format compact numbers (e.g. 1.2M, 45K)
 */
export function formatCompactNumber(num: number): string {
  if (!num) return '0';
  if (num >= 10000000) {
    return `${(num / 10000000).toFixed(1)}Cr`;
  }
  if (num >= 100000) {
    return `${(num / 100000).toFixed(1)}L`;
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}k`;
  }
  return num.toString();
}
