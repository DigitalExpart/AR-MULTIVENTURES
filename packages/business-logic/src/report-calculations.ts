import type {
  ReportPeriod,
  DateRangeFilter,
  ReceivablesAgingRow,
  ReceivablesAgingReportData,
} from '@ar-multiventures/types';

/**
 * Calculates deterministic Receivables Aging buckets based on invoice due date and balance.
 * Buckets: Current (not yet due), 1–30 days, 31–60 days, 61–90 days, 90+ days.
 */
export function calculateReceivablesAging(
  invoices: Array<{
    id: string;
    customerId: string;
    customerName: string;
    customerReference?: string;
    dueDate: string;
    totalAmount: number;
    amountPaid: number;
  }>,
  asOfDateStr: string = new Date().toISOString()
): ReceivablesAgingReportData {
  const asOf = new Date(asOfDateStr);
  const customerMap = new Map<string, ReceivablesAgingRow>();

  for (const inv of invoices) {
    const outstanding = Math.max(0, Number(inv.totalAmount || 0) - Number(inv.amountPaid || 0));
    if (outstanding <= 0) continue;

    if (!customerMap.has(inv.customerId)) {
      customerMap.set(inv.customerId, {
        customerId: inv.customerId,
        customerName: inv.customerName,
        customerReference: inv.customerReference || 'CUS-REF',
        currentAmount: 0,
        days1To30: 0,
        days31To60: 0,
        days61To90: 0,
        days90Plus: 0,
        totalOutstanding: 0,
      });
    }

    const row = customerMap.get(inv.customerId)!;
    const dueDate = new Date(inv.dueDate);
    const diffMs = asOf.getTime() - dueDate.getTime();
    const daysOverdue = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    row.totalOutstanding = Number((row.totalOutstanding + outstanding).toFixed(2));

    if (daysOverdue <= 0) {
      row.currentAmount = Number((row.currentAmount + outstanding).toFixed(2));
    } else if (daysOverdue <= 30) {
      row.days1To30 = Number((row.days1To30 + outstanding).toFixed(2));
    } else if (daysOverdue <= 60) {
      row.days31To60 = Number((row.days31To60 + outstanding).toFixed(2));
    } else if (daysOverdue <= 90) {
      row.days61To90 = Number((row.days61To90 + outstanding).toFixed(2));
    } else {
      row.days90Plus = Number((row.days90Plus + outstanding).toFixed(2));
    }
  }

  const rows = Array.from(customerMap.values());
  const totalOutstanding = Number(rows.reduce((sum, r) => sum + r.totalOutstanding, 0).toFixed(2));
  const totalCurrent = Number(rows.reduce((sum, r) => sum + r.currentAmount, 0).toFixed(2));
  const total1To30 = Number(rows.reduce((sum, r) => sum + r.days1To30, 0).toFixed(2));
  const total31To60 = Number(rows.reduce((sum, r) => sum + r.days31To60, 0).toFixed(2));
  const total61To90 = Number(rows.reduce((sum, r) => sum + r.days61To90, 0).toFixed(2));
  const total90Plus = Number(rows.reduce((sum, r) => sum + r.days90Plus, 0).toFixed(2));

  return {
    totalOutstanding,
    totalCurrent,
    total1To30,
    total31To60,
    total61To90,
    total90Plus,
    customersCount: rows.length,
    rows,
  };
}

/**
 * Computes period-over-period percentage variance safely.
 */
export function calculatePeriodComparison(
  current: number,
  previous?: number
): { percentageChange?: number; isPositive: boolean } {
  if (previous === undefined || previous === 0) {
    return { percentageChange: undefined, isPositive: current >= 0 };
  }
  const change = Number((((current - previous) / previous) * 100).toFixed(1));
  return {
    percentageChange: change,
    isPositive: change >= 0,
  };
}

/**
 * Computes fleet truck utilization rate (actual completed trips vs capacity potential).
 */
export function calculateFleetUtilizationRate(
  tripsCompleted: number,
  activeOperatingDays: number = 26,
  targetTripsPerDay: number = 1.5
): number {
  const targetTrips = activeOperatingDays * targetTripsPerDay;
  if (targetTrips <= 0) return 0;
  const rate = (tripsCompleted / targetTrips) * 100;
  return Number(Math.min(100, Math.max(0, rate)).toFixed(1));
}

/**
 * Standard date range helper for report period selector.
 */
export function getDateRangeForPeriod(
  period: ReportPeriod,
  customStart?: string,
  customEnd?: string,
  now: Date = new Date('2026-08-26T12:00:00Z')
): DateRangeFilter {
  const y = now.getFullYear();
  const m = now.getMonth();
  const d = now.getDate();

  switch (period) {
    case 'today':
      return {
        period,
        startDate: new Date(y, m, d).toISOString(),
        endDate: new Date(y, m, d, 23, 59, 59).toISOString(),
      };
    case 'yesterday':
      return {
        period,
        startDate: new Date(y, m, d - 1).toISOString(),
        endDate: new Date(y, m, d - 1, 23, 59, 59).toISOString(),
      };
    case 'this_week': {
      const dayOfWeek = now.getDay();
      const diff = now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
      const start = new Date(now.setDate(diff));
      return {
        period,
        startDate: new Date(start.setHours(0, 0, 0, 0)).toISOString(),
        endDate: new Date(y, m, d, 23, 59, 59).toISOString(),
      };
    }
    case 'last_week': {
      const dayOfWeek = now.getDay();
      const start = new Date(y, m, d - dayOfWeek - 6, 0, 0, 0);
      const end = new Date(y, m, d - dayOfWeek, 23, 59, 59);
      return { period, startDate: start.toISOString(), endDate: end.toISOString() };
    }
    case 'this_month':
      return {
        period,
        startDate: new Date(y, m, 1, 0, 0, 0).toISOString(),
        endDate: new Date(y, m, d, 23, 59, 59).toISOString(),
      };
    case 'last_month':
      return {
        period,
        startDate: new Date(y, m - 1, 1, 0, 0, 0).toISOString(),
        endDate: new Date(y, m, 0, 23, 59, 59).toISOString(),
      };
    case 'this_quarter': {
      const qStartMonth = Math.floor(m / 3) * 3;
      return {
        period,
        startDate: new Date(y, qStartMonth, 1, 0, 0, 0).toISOString(),
        endDate: new Date(y, m, d, 23, 59, 59).toISOString(),
      };
    }
    case 'this_year':
      return {
        period,
        startDate: new Date(y, 0, 1, 0, 0, 0).toISOString(),
        endDate: new Date(y, m, d, 23, 59, 59).toISOString(),
      };
    case 'custom':
    default:
      return {
        period: 'custom',
        startDate: customStart || new Date(y, m, 1).toISOString(),
        endDate: customEnd || new Date(y, m, d, 23, 59, 59).toISOString(),
      };
  }
}
