# AR Multiventures — React Native Mobile API Contract
**Version:** 9.0 (Architecture Specification)  
**Date:** 2026-08-26  
**Target Clients:** Customer Mobile App & Driver Mobile Companion App  

---

## 1. Overview & Architecture
The React Native apps consume the existing domain repositories and Supabase RPC endpoints without requiring an intermediate backend proxy. Authentication is managed via Supabase JWT tokens passed in standard `Authorization: Bearer <token>` headers.

---

## 2. Customer Mobile App Endpoints

### 2.1 Authentication & Profile
| Operation | Method / RPC | Inputs | Outputs | Errors |
|---|---|---|---|---|
| `login` | `auth.signInWithPassword` | `{ email, password }` | `{ user, session }` | `INVALID_CREDENTIALS`, `ACCOUNT_DISABLED` |
| `register` | `auth.signUp` | `{ email, password, companyName, phone, rcNumber }` | `{ user, session }` | `VALIDATION_FAILED`, `CONFLICT` |
| `getProfile` | `customerApi.getProfile` | `customerId: UUID` | `CustomerProfile` | `NOT_FOUND`, `AUTH_REQUIRED` |
| `getFinancialSummary` | `financeApi.getCustomerFinancialSummary` | `customerId: UUID` | `CustomerFinancialSummary` | `NOT_FOUND`, `AUTH_REQUIRED` |

### 2.2 Commercial Requisitions & Pricing
| Operation | Method / RPC | Inputs | Outputs | Errors |
|---|---|---|---|---|
| `calculatePriceQuote` | `requisitionApi.calculatePriceQuote` | `{ quarryId, materialId, quantity, transportationType, truckTypeId, destinationId }` | `PriceQuoteBreakdown` | `PRICE_REVIEW_REQUIRED`, `NOT_FOUND` |
| `createRequisition` | `requisitionApi.create` | `NewRequisitionPayload` | `Requisition` | `CREDIT_LIMIT_EXCEEDED`, `VALIDATION_FAILED` |
| `listRequisitions` | `requisitionApi.list` | `{ customerId?: UUID, status?: string }` | `Requisition[]` | `AUTH_REQUIRED` |
| `getRequisitionById`| `requisitionApi.getById` | `id: UUID` | `Requisition` | `NOT_FOUND` |

### 2.3 Payments & Settlements
| Operation | Method / RPC | Inputs | Outputs | Errors |
|---|---|---|---|---|
| `initializePaystack` | `financeApi.initializeOnlinePayment` | `{ requisitionId, invoiceId, amount, customerEmail }` | `{ authorizationUrl, reference }` | `PAYMENT_FAILED`, `NETWORK_ERROR` |
| `verifyPaystack` | `financeApi.verifyOnlinePayment` | `{ reference: string }` | `PaymentVerifyResponse` | `PAYMENT_FAILED`, `NOT_FOUND` |
| `submitBankTransfer` | `financeApi.submitBankTransfer` | `BankTransferSubmissionPayload` | `PaymentRecord` | `VALIDATION_FAILED`, `STORAGE_ERROR` |
| `getInvoices` | `financeApi.getInvoices` | `{ customerId: UUID, status?: string }` | `InvoiceRecord[]` | `AUTH_REQUIRED` |

### 2.4 Delivery Tracking
| Operation | Method / RPC | Inputs | Outputs | Errors |
|---|---|---|---|---|
| `getOrderFulfillment` | `deliveryApi.getOrderFulfillmentSummary` | `requisitionId: UUID` | `OrderFulfillmentSummary` | `NOT_FOUND` |
| `getDeliveryTrips` | `deliveryApi.getTrips` | `{ requisitionId: UUID }` | `DeliveryTripRecord[]` | `AUTH_REQUIRED` |

---

## 3. Driver Mobile Companion App Endpoints

### 3.1 Trip Execution & Telemetry
| Operation | Method / RPC | Inputs | Outputs | Errors |
|---|---|---|---|---|
| `getAssignedTrips` | `deliveryApi.getDriverTrips` | `driverId: UUID` | `DeliveryTripRecord[]` | `AUTH_REQUIRED` |
| `getTripDetail` | `deliveryApi.getTripById` | `tripId: UUID` | `DeliveryTripRecord` | `NOT_FOUND` |
| `quarryCheckin` | `deliveryApi.recordQuarryCheckin` | `tripId: UUID` | `DeliveryTripRecord` | `INVALID_STATUS_TRANSITION` |
| `dispatchTrip` | `deliveryApi.dispatchTrip` | `tripId: UUID` | `DeliveryTripRecord` | `INVALID_STATUS_TRANSITION` |

### 3.2 Proof of Delivery (POD) Submission
| Operation | Method / RPC | Inputs | Outputs | Errors |
|---|---|---|---|---|
| `submitPod` | `deliveryApi.recordTripPod` | `PodSubmissionPayload` | `DeliveryTripRecord` | `INVALID_STATUS_TRANSITION`, `VALIDATION_FAILED` |

**`PodSubmissionPayload` Specification:**
```typescript
interface PodSubmissionPayload {
  tripId: string;
  receiverName: string;
  receiverPhone?: string;
  receiverDesignation?: string;
  deliveredQuantityTonnes: number;
  signatureStoragePath: string; // Private Storage URL path
  photoStoragePaths?: string[]; // Array of photo storage paths
  driverRemarks?: string;
  receiverRemarks?: string;
}
```

---

## 4. Mobile File Upload Contract

| Media Category | Storage Bucket | Path Convention | Max Size | Allowed MIME Types |
|---|---|---|---|---|
| **POD Signature** | `trip-pod-signatures` | `signatures/{trip_id}/sig_{timestamp}.png` | $500\text{ KB}$ | `image/png` |
| **Delivery Offload Photo** | `trip-pod-photos` | `photos/{trip_id}/img_{uuid}.jpg` | $5\text{ MB}$ | `image/jpeg`, `image/webp` |
| **Bank Deposit Slip** | `payment-proofs` | `proofs/{customer_id}/pay_{uuid}.pdf\|jpg` | $5\text{ MB}$ | `image/jpeg`, `image/png`, `application/pdf` |
