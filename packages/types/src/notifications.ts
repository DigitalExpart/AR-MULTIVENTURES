export type NotificationChannel = 'IN_APP' | 'EMAIL' | 'SMS' | 'WHATSAPP';

export type NotificationTemplateType =
  | 'REQUISITION_SUBMITTED'
  | 'REQUISITION_APPROVED'
  | 'REQUISITION_REJECTED'
  | 'PAYMENT_REQUIRED'
  | 'PAYMENT_CONFIRMED'
  | 'LOADING_SCHEDULED'
  | 'TRIP_LOADED'
  | 'TRIP_DISPATCHED'
  | 'DELIVERY_COMPLETED'
  | 'POD_AVAILABLE'
  | 'CREDIT_LIMIT_WARNING'
  | 'DOCUMENT_EXPIRY_WARNING'
  | 'LOADING_VARIANCE_ALERT';

export interface AppNotification {
  id: string;
  userId?: string;
  customerId?: string;
  title: string;
  message: string;
  templateType: NotificationTemplateType;
  channel: NotificationChannel;
  entityType?: 'requisition' | 'invoice' | 'payment' | 'trip' | 'truck' | 'driver';
  entityId?: string;
  link?: string;
  isRead: boolean;
  readAt?: string;
  createdAt: string;
}

export interface NotificationPreference {
  id: string;
  userId: string;
  channel: NotificationChannel;
  templateType: NotificationTemplateType;
  isEnabled: boolean;
}
