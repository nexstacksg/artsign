import { QuotationStatus } from '../enums';
import { ICustomer } from './customer';

export interface QuotationItem {
  id: string;
  productId: string;
  productName: string;
  description: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  specifications?: string;
}

export interface Quotation {
  id: string;
  customerId?: string;
  customer?: ICustomer | {
    name: string;
    email: string;
    phone: string;
    address: string;
  };
  salesman?: string;
  project?: string;
  size?: string;
  date?: string;
  quotationNumber?: string;
  title?: string;
  description?: string;
  items?: QuotationItem[];
  subtotal?: number;
  tax?: number;
  total: string | number;
  validUntil?: Date;
  status: QuotationStatus;
  notes?: string;
  createdAt?: Date;
  updatedAt?: Date;
  details?: {
    description: string;
    quantity: number;
    unitPrice: number;
    tax: number;
  };
}

// Quotation service interfaces
export interface ICreateQuotationService {
  userId: string;
  title: string;
  description?: string;
  salesman?: string;
  validUntil: Date;
  items: Array<{
    productId: string;
    description: string;
    quantity: number;
    unitPrice: number;
    specifications?: string;
  }>;
  notes?: string;
}

export interface IUpdateQuotationService {
  title?: string;
  description?: string;
  salesman?: string;
  status?: QuotationStatus;
  validUntil?: Date;
  notes?: string;
}

export interface IQuotationFilterService {
  status?: QuotationStatus;
  userId?: string;
  salesman?: string;
  dateFrom?: Date;
  dateTo?: Date;
  minAmount?: number;
  maxAmount?: number;
  search?: string;
}