import { ProductCategory, ProductStatus, PricingModel } from '../enums';

export interface IProduct {
  id: string;
  name: string;
  description: string;
  category: ProductCategory;
  stock: string; // e.g., "5000 pcs", "500 sq.ft."
  pricingModel: PricingModel;
  status: ProductStatus;
  basePrice?: number;
  specifications?: string | null;
  materials?: string | null;
  finishOptions?: string | null;
  minQuantity?: number;
  maxQuantity?: number;
  leadTime?: number; // in days
  tags?: string[];
  images?: string[];
  sku?: string;
  isActive?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICreateProduct {
  name: string;
  description: string;
  category: ProductCategory;
  stock: string;
  pricingModel: PricingModel;
  basePrice?: number;
  specifications?: string;
  materials?: string;
  finishOptions?: string;
  minQuantity?: number;
  maxQuantity?: number;
  leadTime?: number;
  tags?: string[];
  images?: string[];
  sku?: string;
}

export interface IUpdateProduct {
  name?: string;
  description?: string;
  category?: ProductCategory;
  stock?: string;
  pricingModel?: PricingModel;
  status?: ProductStatus;
  basePrice?: number;
  specifications?: string;
  materials?: string;
  finishOptions?: string;
  minQuantity?: number;
  maxQuantity?: number;
  leadTime?: number;
  tags?: string[];
  images?: string[];
  sku?: string;
  isActive?: boolean;
}

export interface IProductFilter {
  category?: ProductCategory;
  status?: ProductStatus;
  pricingModel?: PricingModel;
  minPrice?: number;
  maxPrice?: number;
  tags?: string[];
  search?: string;
}

// Filter utilities for admin UI
export interface FilterField {
  id: string;
  label: string;
  type: "text" | "select" | "date-range" | "number-range";
  placeholder?: string;
  options?: string[];
}

export interface FilterValues {
  [key: string]: string | number | string[];
}

// Product specifications for dynamic pricing
export interface ProductSpecification {
  id: string;
  productId: string;
  name: string; // e.g., "width", "height", "quantity", "material"
  type: "number" | "select" | "text";
  required: boolean;
  options?: string[]; // for select type
  unit?: string; // e.g., "mm", "pcs", "sqft"
  defaultValue?: string | number;
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
  };
}

export interface ProductPricing {
  id: string;
  productId: string;
  pricingModel: PricingModel;
  rules: PricingRule[];
  basePrice: number;
  currency: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface PricingRule {
  id: string;
  condition: PricingCondition;
  multiplier: number;
  additionalCost: number;
  description: string;
}

export interface PricingCondition {
  field: string; // specification field name
  operator: "eq" | "gt" | "gte" | "lt" | "lte" | "range";
  value: string | number | [number, number]; // for range
}

// Additional product service interfaces
export interface ICreateProductService {
  name: string;
  description: string;
  categoryId: string;
  price: number;
  pricingModel?: string;
  trackStock?: boolean;
  currentStock?: number;
  lowStockThreshold?: number;
  imageUrls?: string[];
  specifications?: Record<string, any>;
  features?: string[];
  colorOptions?: string[];
  sizeOptions?: string[];
}

export interface IUpdateProductService {
  name?: string;
  description?: string;
  categoryId?: string;
  price?: number;
  pricingModel?: string;
  trackStock?: boolean;
  currentStock?: number;
  lowStockThreshold?: number;
  status?: string;
  featured?: boolean;
  imageUrls?: string[];
  specifications?: Record<string, any>;
  features?: string[];
  colorOptions?: string[];
  sizeOptions?: string[];
}

export interface IProductFilterService {
  categoryId?: string;
  status?: string;
  featured?: boolean;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  search?: string;
}

// Backward compatibility - keep existing Product interface
export type Product = IProduct;