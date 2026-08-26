import type { IExceptionRepository } from '../interfaces';
import type { OperationalException } from '@ar-multiventures/types';

export const mockExceptions: OperationalException[] = [
  {
    id: 'exc-01',
    exceptionType: 'MISSING_HAULAGE_TARIFF',
    severity: 'CRITICAL',
    title: 'Missing Haulage Tariff on Epe Corridor',
    description: 'No active 30T haulage tariff configured for Sagamu Quarry to Epe Expressway Flyover Site.',
    entityType: 'haulage',
    entityId: 'dest-02',
    resolutionRoute: '/admin/pricing/haulage',
    isResolved: false,
    createdAt: '2026-08-26T07:00:00Z',
  },
  {
    id: 'exc-02',
    exceptionType: 'PAYMENT_REVIEW_PENDING',
    severity: 'WARNING',
    title: 'Direct Bank Transfer Awaiting Allocation (₦3.2M)',
    description: 'Julius Berger uploaded NIP bank proof for invoice INV-2026-000042. Finance officer confirmation required.',
    entityType: 'payment',
    entityId: 'pay-03',
    resolutionRoute: '/admin/finance/payments',
    isResolved: false,
    createdAt: '2026-08-26T08:30:00Z',
  },
  {
    id: 'exc-03',
    exceptionType: 'TRUCK_DOCUMENT_EXPIRY',
    severity: 'WARNING',
    title: 'Insurance Policy Renewal Due — Truck BDG-301-QK',
    description: 'Heavy tipper roadworthiness certificate expires in 14 days (2026-09-01). Schedule inspection.',
    entityType: 'truck',
    entityId: 'trk-05',
    resolutionRoute: '/admin/fleet/trucks',
    isResolved: false,
    createdAt: '2026-08-25T10:00:00Z',
  },
  {
    id: 'exc-04',
    exceptionType: 'LOADING_VARIANCE_WARNING',
    severity: 'INFO',
    title: 'High Loading Variance on Trip TRP-2026-000078 (+1.2T)',
    description: 'Net weight 31.20T exceeded planned 30.00T capacity by 4.0%. Verified safe within axle limit.',
    entityType: 'weighbridge',
    entityId: 'wb-99',
    resolutionRoute: '/admin/operations/dispatch',
    isResolved: true,
    resolvedBy: 'Engr. Segun Adeyemi',
    resolvedAt: '2026-08-25T14:30:00Z',
    resolutionNotes: 'Axle load checked and cleared for transit.',
    createdAt: '2026-08-25T11:00:00Z',
  },
];

export class MockExceptionRepository implements IExceptionRepository {
  private exceptions = [...mockExceptions];

  async getExceptions(filters?: { isResolved?: boolean; severity?: string }): Promise<OperationalException[]> {
    await new Promise((r) => setTimeout(r, 80));
    return this.exceptions.filter((e) => {
      if (filters?.isResolved !== undefined && e.isResolved !== filters.isResolved) return false;
      if (filters?.severity && e.severity !== filters.severity) return false;
      return true;
    });
  }

  async resolveException(id: string, notes?: string): Promise<void> {
    await new Promise((r) => setTimeout(r, 100));
    const exc = this.exceptions.find((e) => e.id === id);
    if (exc) {
      exc.isResolved = true;
      exc.resolvedAt = new Date().toISOString();
      exc.resolvedBy = 'Executive Admin Officer';
      exc.resolutionNotes = notes;
    }
  }
}
