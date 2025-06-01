import { CustomerType, CustomerStatus, PaymentStatus, OrderStatus, PaymentTerms } from '../enums';

export interface Customer {
  id: string;
  name: string;
  email: string;
  contactPerson: string;
  salesman: string;
  type: CustomerType;
  orders: number;
  totalSpent: number;
  status: CustomerStatus;
  address?: string;
  phone?: string;
  createdAt: string;
  creditLimit?: number;
  creditUsed?: number;
  paymentTerms?: PaymentTerms;
  notes?: string;
}

export interface CustomerFilterOptions {
  status: CustomerStatus | "All";
  type: CustomerType | "All";
  minSpent?: number;
  maxSpent?: number;
  dateFrom?: string;
  dateTo?: string;
  customer?: string;
  paymentStatus?: PaymentStatus;
  orderStatus?: OrderStatus;
}