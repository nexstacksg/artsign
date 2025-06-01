export interface Product {
  id: string;
  name: string;
  description: string;
  category: string;
  price?: number;
  stock: number | string;
  sku?: string;
  images?: string[];
  specifications?: Record<string, any>;
  isActive?: boolean;
  pricingModel?: string;
  status?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface FilterField {
  id?: string;
  key?: string;
  label: string;
  type: 'text' | 'select' | 'number' | 'date' | 'range' | 'date-range';
  placeholder?: string;
  options?: Array<{ value: string; label: string }> | string[];
}

export interface FilterValues {
  [key: string]: any;
}