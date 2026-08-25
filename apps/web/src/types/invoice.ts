export interface Invoice {
  id: string;
  invoiceNumber: string;
  orderId: string;
  orderReference: string;
  customerId: string;
  items: InvoiceItem[];
  subtotal: number;
  tax: number;
  total: number;
  status: 'draft' | 'issued' | 'paid' | 'overdue' | 'cancelled';
  dueDate: string;
  issuedAt: string;
  paidAt?: string;
}

export interface InvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}
