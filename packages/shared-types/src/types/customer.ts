import { CustomerType, CustomerStatus, PaymentTerms } from '../enums';

export interface ICustomer {
  id: string;
  userId: string;
  companyName?: string | null;
  taxId?: string | null;
  customerType: CustomerType;
  creditLimit: number;
  creditUsed: number;
  totalSpent: number;
  paymentTerms: PaymentTerms;
  contactPerson?: string | null;
  salesman?: string | null;
  customerStatus: CustomerStatus;
  notes?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICreateCustomer {
  userId: string;
  companyName?: string;
  taxId?: string;
  customerType?: CustomerType;
  creditLimit?: number;
  paymentTerms?: PaymentTerms;
  contactPerson?: string;
  salesman?: string;
  notes?: string;
}

export interface IUpdateCustomer {
  companyName?: string;
  taxId?: string;
  customerType?: CustomerType;
  creditLimit?: number;
  creditUsed?: number;
  totalSpent?: number;
  paymentTerms?: PaymentTerms;
  contactPerson?: string;
  salesman?: string;
  customerStatus?: CustomerStatus;
  notes?: string;
}

export interface ICustomerFilter {
  customerStatus?: CustomerStatus;
  customerType?: CustomerType;
  minCreditLimit?: number;
  maxCreditLimit?: number;
  minTotalSpent?: number;
  maxTotalSpent?: number;
  salesman?: string;
}