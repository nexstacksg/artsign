import { RefundStatus } from '../enums';

export interface RefundItem {
  id?: string;
  refundId?: string;
  productId?: string;
  productName?: string;
  product?: string;
  quantity: number | string;
  refundAmount?: number;
  price?: string;
  subtotal?: string;
  reason?: string;
  status?: string;
  customer?: string;
  startDate?: string;
  endDate?: string;
  minAmount?: string;
  maxAmount?: string;
}

export interface RefundRequest {
  id: string;
  orderId: string;
  orderNumber?: string;
  customerId: string;
  customerName: string;
  email?: string;
  accountStatus?: string;
  orderDate?: string;
  orderTotal?: string;
  paymentMethod?: string;
  items: RefundItem[];
  totalRefundAmount?: number;
  amount?: string;
  reason: string;
  status: RefundStatus;
  requestedAt?: Date;
  processedAt?: Date;
  date?: string;
  notes?: string;
}