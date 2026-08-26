export type DomainErrorCode =
  | 'AUTH_REQUIRED'
  | 'PERMISSION_DENIED'
  | 'VALIDATION_FAILED'
  | 'NOT_FOUND'
  | 'CONFLICT'
  | 'FINANCIAL_CLEARANCE_REQUIRED'
  | 'PRICE_CHANGED'
  | 'PRICE_REVIEW_REQUIRED'
  | 'CREDIT_LIMIT_EXCEEDED'
  | 'TRUCK_UNAVAILABLE'
  | 'DRIVER_UNAVAILABLE'
  | 'INVALID_STATUS_TRANSITION'
  | 'PAYMENT_FAILED'
  | 'NETWORK_ERROR'
  | 'SERVICE_UNAVAILABLE';

export interface AppError {
  code: DomainErrorCode;
  message: string;
  details?: any;
  timestamp: string;
  fieldErrors?: Record<string, string[]>;
}

export class DomainError extends Error {
  public readonly code: DomainErrorCode;
  public readonly details?: any;
  public readonly timestamp: string;

  constructor(code: DomainErrorCode, message: string, details?: any) {
    super(message);
    this.name = 'DomainError';
    this.code = code;
    this.details = details;
    this.timestamp = new Date().toISOString();
  }

  toJSON(): AppError {
    return {
      code: this.code,
      message: this.message,
      details: this.details,
      timestamp: this.timestamp,
    };
  }
}
