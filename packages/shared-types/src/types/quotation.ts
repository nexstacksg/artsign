import { QuotationStatus } from '../enums';
import { Customer } from './customer';

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
  customer?: Customer | {
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