import { InvoiceStatus } from '../enums';
import { Customer } from './customer';

export interface Invoice {
  id: string;
  customerId: string;
  customer?: Customer;
  invoiceNumber: string;
  status: InvoiceStatus;
  amount: number;
  dueDate?: Date;
  paidDate?: Date;
  created?: string;
  createdAt?: Date;
  updatedAt?: Date;
}