export type BillingCategory = 'Appointments' | 'Consultations' | 'Laboratory' | 'Radiology' | 'Pharmacy' | 'Vaccination' | 'Procedures' | 'Hospitalization' | 'Telemedicine' | 'Home Care' | 'Custom Services';
export type PaymentMethod = 'Cash' | 'Credit Card' | 'Debit Card' | 'UPI' | 'Net Banking' | 'Wallet' | 'Bank Transfer' | 'Insurance' | 'Corporate Billing' | 'Split Payment';
export type BillingStatus = 'Draft' | 'Pending' | 'Billed' | 'Overdue' | 'Paid' | 'Cancelled';
export type PaymentStatus = 'Pending' | 'Processing' | 'Completed' | 'Failed' | 'Refunded' | 'Partially Refunded';
export type ClaimStatus = 'Draft' | 'Submitted' | 'Processing' | 'Approved' | 'Partially Approved' | 'Rejected' | 'Appealed';
export type InvoiceStatus = 'Draft' | 'Issued' | 'Paid' | 'Partially Paid' | 'Overdue' | 'Voided';
export type RefundStatus = 'Requested' | 'Processing' | 'Approved' | 'Completed' | 'Rejected';
export type PaymentGateway = 'Stripe' | 'Razorpay' | 'PayPal' | 'Custom';

export interface Tax {
  id: string;
  name: string;
  rate: number;
  amount: number;
  type: 'Percentage' | 'Fixed';
}

export interface Discount {
  id: string;
  name: string;
  value: number;
  amount: number;
  type: 'Percentage' | 'Fixed';
}

export interface InvoiceItem {
  id: string;
  category: BillingCategory;
  description: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  taxes: Tax[];
  discounts: Discount[];
  total: number;
  referenceId?: string; // e.g., Appointment ID
}

export interface Invoice {
  id: string;
  patientId: string;
  facilityId: string;
  status: InvoiceStatus;
  items: InvoiceItem[];
  subtotal: number;
  totalTax: number;
  totalDiscount: number;
  totalAmount: number;
  amountPaid: number;
  amountDue: number;
  issueDate: string;
  dueDate: string;
  metadata: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentTransaction {
  id: string;
  gateway: PaymentGateway;
  gatewayTransactionId?: string;
  status: PaymentStatus;
  errorCode?: string;
  errorMessage?: string;
}

export interface Payment {
  id: string;
  invoiceId: string;
  patientId: string;
  amount: number;
  method: PaymentMethod;
  status: PaymentStatus;
  transaction?: PaymentTransaction;
  date: string;
  metadata: Record<string, unknown>;
}

export interface RefundRequest {
  id: string;
  paymentId: string;
  reason: string;
  amount: number;
  requestedBy: string;
  requestedAt: string;
}

export interface Refund {
  id: string;
  request: RefundRequest;
  status: RefundStatus;
  processedAt?: string;
  processedBy?: string;
  gatewayRefundId?: string;
}

export interface Quotation {
  id: string;
  patientId: string;
  items: InvoiceItem[];
  validUntil: string;
  totalAmount: number;
}

export interface Estimate {
  id: string;
  patientId: string;
  category: BillingCategory;
  estimatedAmount: number;
  variancePercentage: number;
}

export interface InsuranceProvider {
  id: string;
  name: string;
  contactInfo: string;
  portalUrl?: string;
}

export interface Benefit {
  category: BillingCategory;
  coveragePercentage: number;
  maxLimit?: number;
}

export interface Deductible {
  amount: number;
  remainingAmount: number;
  period: 'Annual' | 'Lifetime';
}

export interface CoPayment {
  category: BillingCategory;
  amount: number;
  type: 'Percentage' | 'Fixed';
}

export interface Coverage {
  id: string;
  policyId: string;
  benefits: Benefit[];
  deductibles: Deductible[];
  coPayments: CoPayment[];
}

export interface InsurancePolicy {
  id: string;
  patientId: string;
  providerId: string;
  policyNumber: string;
  groupNumber?: string;
  validFrom: string;
  validTo: string;
  status: 'Active' | 'Expired' | 'Suspended';
}

export interface ClaimLineItem {
  invoiceItemId: string;
  claimedAmount: number;
  approvedAmount?: number;
  reasonCode?: string;
}

export interface InsuranceClaim {
  id: string;
  policyId: string;
  invoiceId: string;
  status: ClaimStatus;
  totalClaimed: number;
  totalApproved?: number;
  lineItems: ClaimLineItem[];
  submittedAt: string;
  processedAt?: string;
}

export interface PreAuthorization {
  id: string;
  policyId: string;
  category: BillingCategory;
  estimatedCost: number;
  approvedAmount?: number;
  status: 'Requested' | 'Approved' | 'Denied';
  validUntil?: string;
}

export interface Receipt {
  id: string;
  paymentId: string;
  invoiceId: string;
  receiptNumber: string;
  generatedAt: string;
  url: string;
}

export interface LedgerEntry {
  id: string;
  accountId: string;
  type: 'Debit' | 'Credit';
  amount: number;
  balanceAfter: number;
  referenceId: string; // e.g. PaymentId, InvoiceId
  description: string;
  timestamp: string;
}

export interface BillingProfile {
  id: string;
  patientId: string;
  primaryPolicyId?: string;
  secondaryPolicyId?: string;
  defaultPaymentMethod?: PaymentMethod;
  taxExempt: boolean;
}

export interface BillingAccount {
  id: string;
  profileId: string;
  balance: number;
  currency: string;
  status: 'Active' | 'Suspended' | 'Closed';
}

export interface Installment {
  id: string;
  amount: number;
  dueDate: string;
  status: PaymentStatus;
  paymentId?: string;
}

export interface PaymentPlan {
  id: string;
  invoiceId: string;
  totalAmount: number;
  installments: Installment[];
  status: 'Active' | 'Completed' | 'Defaulted';
}

export interface FinancialSummary {
  periodStart: string;
  periodEnd: string;
  totalBilled: number;
  totalCollected: number;
  totalRefunded: number;
  totalOutstanding: number;
}

export interface RevenueMetrics {
  totalRevenue: number;
  revenueByCategory: Record<BillingCategory, number>;
  collectionRate: number;
}

export interface OutstandingBalance {
  patientId: string;
  totalAmount: number;
  oldestInvoiceDate: string;
  invoiceCount: number;
}
