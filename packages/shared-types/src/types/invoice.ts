import { InvoiceStatus } from '../enums';
import { ICustomer } from './customer';

export interface Invoice {
  id: string;
  customerId: string;
  customer?: ICustomer;
  invoiceNumber: string;
  status: InvoiceStatus;
  amount: number;
  dueDate?: Date;
  paidDate?: Date;
  created?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

// Invoice service interfaces
export interface ICreateInvoiceService {
  orderId: string;
  userId: string;
  amount: number;
  dueDate: Date;
}

export interface IUpdateInvoiceService {
  status?: InvoiceStatus;
  amount?: number;
  dueDate?: Date;
  paidDate?: Date;
}

export interface IInvoiceFilterService {
  status?: InvoiceStatus;
  userId?: string;
  orderId?: string;
  dateFrom?: Date;
  dateTo?: Date;
  dueDateFrom?: Date;
  dueDateTo?: Date;
  minAmount?: number;
  maxAmount?: number;
  overdue?: boolean;
  search?: string;
}