export type ExceptionSeverity = 'CRITICAL' | 'WARNING' | 'INFO';

export interface OperationalException {
  id: string;
  exceptionType: string;
  severity: ExceptionSeverity;
  title: string;
  description: string;
  entityType: 'pricing' | 'haulage' | 'credit' | 'payment' | 'weighbridge' | 'truck' | 'driver' | 'trip' | 'destination';
  entityId: string;
  resolutionRoute: string;
  isResolved: boolean;
  resolvedBy?: string;
  resolvedAt?: string;
  resolutionNotes?: string;
  createdAt: string;
}
