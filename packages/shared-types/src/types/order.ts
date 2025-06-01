import { OrderStatus, PaymentStatus } from '../enums';

export interface OrderItem {
  id?: string;
  orderId?: string;
  productId?: string;
  productName?: string;
  name?: string;
  quantity: number;
  price?: number;
  unitPrice?: number;
  totalPrice?: number;
  specifications?: string;
  options?: Record<string, string>;
}

export interface Order {
  id: string;
  customerId?: string;
  customer?: string;
  orderNumber?: string;
  project?: string;
  size?: string;
  date: string;
  total?: string;
  totalAmount?: number;
  status: OrderStatus;
  payment?: PaymentStatus;
  paymentStatus?: PaymentStatus;
  shippingAddress?: string;
  billingAddress?: string;
  items?: OrderItem[];
  notes?: string;
  createdAt?: Date;
  updatedAt?: Date;
  shippedAt?: Date;
  deliveredAt?: Date;
  contactInfo?: {
    name: string;
    email: string;
    phone: string;
    address: string;
  };
  details?: {
    description: string;
    quantity: number;
    unitPrice: number;
    tax: number;
    items?: OrderItem[];
  };
}

export interface OrderFilter {
  orderId?: string;
  status?: string;
  paymentStatus?: PaymentStatus;
  customer?: string;
  customerId?: string;
  project?: string;
  startDate?: string;
  endDate?: string;
  payment?: string;
  dateRange?: {
    start: Date;
    end: Date;
  };
  minAmount?: number;
  maxAmount?: number;
}