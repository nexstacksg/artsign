// Compatibility utilities for transitioning between old and new type formats

import {
  CustomerType as NewCustomerType,
  CustomerStatus as NewCustomerStatus,
  OrderStatus as NewOrderStatus,
  PaymentStatus as NewPaymentStatus,
  InvoiceStatus as NewInvoiceStatus,
  ProductCategory as NewProductCategory,
  ProductStatus as NewProductStatus,
  PricingModel as NewPricingModel,
} from '../enums';

// Legacy type definitions (from artSign-admin)
export type LegacyCustomerType = "Individual" | "Corporate";
export type LegacyCustomerStatus = "Active" | "Inactive";
export type LegacyOrderStatus = "Completed" | "Processing" | "Cancelled" | "Pending Payment";
export type LegacyPaymentStatus = "Paid" | "Unpaid" | "Overdue" | "Pending";
export type LegacyInvoiceStatus = "Paid" | "Unpaid" | "Overdue";
export type LegacyProductStatus = "In Stock" | "Low Stock" | "Out of Stock";

// Conversion functions from legacy to new format
export const convertCustomerType = (legacy: LegacyCustomerType): NewCustomerType => {
  switch (legacy) {
    case "Individual":
      return NewCustomerType.INDIVIDUAL;
    case "Corporate":
      return NewCustomerType.CORPORATE;
    default:
      throw new Error(`Unknown customer type: ${legacy}`);
  }
};

export const convertCustomerStatus = (legacy: LegacyCustomerStatus): NewCustomerStatus => {
  switch (legacy) {
    case "Active":
      return NewCustomerStatus.ACTIVE;
    case "Inactive":
      return NewCustomerStatus.INACTIVE;
    default:
      throw new Error(`Unknown customer status: ${legacy}`);
  }
};

export const convertOrderStatus = (legacy: LegacyOrderStatus): NewOrderStatus => {
  switch (legacy) {
    case "Completed":
      return NewOrderStatus.COMPLETED;
    case "Processing":
      return NewOrderStatus.PROCESSING;
    case "Cancelled":
      return NewOrderStatus.CANCELLED;
    case "Pending Payment":
      return NewOrderStatus.PENDING_PAYMENT;
    default:
      throw new Error(`Unknown order status: ${legacy}`);
  }
};

export const convertPaymentStatus = (legacy: LegacyPaymentStatus): NewPaymentStatus => {
  switch (legacy) {
    case "Paid":
      return NewPaymentStatus.PAID;
    case "Unpaid":
      return NewPaymentStatus.UNPAID;
    case "Overdue":
      return NewPaymentStatus.OVERDUE;
    case "Pending":
      return NewPaymentStatus.PENDING;
    default:
      throw new Error(`Unknown payment status: ${legacy}`);
  }
};

export const convertInvoiceStatus = (legacy: LegacyInvoiceStatus): NewInvoiceStatus => {
  switch (legacy) {
    case "Paid":
      return NewInvoiceStatus.PAID;
    case "Unpaid":
      return NewInvoiceStatus.UNPAID;
    case "Overdue":
      return NewInvoiceStatus.OVERDUE;
    default:
      throw new Error(`Unknown invoice status: ${legacy}`);
  }
};

export const convertProductStatus = (legacy: LegacyProductStatus): NewProductStatus => {
  switch (legacy) {
    case "In Stock":
      return NewProductStatus.IN_STOCK;
    case "Low Stock":
      return NewProductStatus.LOW_STOCK;
    case "Out of Stock":
      return NewProductStatus.OUT_OF_STOCK;
    default:
      throw new Error(`Unknown product status: ${legacy}`);
  }
};

// Conversion functions from new to legacy format (for backward compatibility)
export const toLegacyCustomerType = (status: NewCustomerType): LegacyCustomerType => {
  switch (status) {
    case NewCustomerType.INDIVIDUAL:
      return "Individual";
    case NewCustomerType.CORPORATE:
      return "Corporate";
    default:
      throw new Error(`Unknown customer type: ${status}`);
  }
};

export const toLegacyCustomerStatus = (status: NewCustomerStatus): LegacyCustomerStatus => {
  switch (status) {
    case NewCustomerStatus.ACTIVE:
      return "Active";
    case NewCustomerStatus.INACTIVE:
      return "Inactive";
    default:
      throw new Error(`Unknown customer status: ${status}`);
  }
};

export const toLegacyOrderStatus = (status: NewOrderStatus): LegacyOrderStatus => {
  switch (status) {
    case NewOrderStatus.COMPLETED:
      return "Completed";
    case NewOrderStatus.PROCESSING:
      return "Processing";
    case NewOrderStatus.CANCELLED:
      return "Cancelled";
    case NewOrderStatus.PENDING_PAYMENT:
      return "Pending Payment";
    default:
      throw new Error(`Unknown order status: ${status}`);
  }
};

export const toLegacyPaymentStatus = (status: NewPaymentStatus): LegacyPaymentStatus => {
  switch (status) {
    case NewPaymentStatus.PAID:
      return "Paid";
    case NewPaymentStatus.UNPAID:
      return "Unpaid";
    case NewPaymentStatus.OVERDUE:
      return "Overdue";
    case NewPaymentStatus.PENDING:
      return "Pending";
    default:
      throw new Error(`Unknown payment status: ${status}`);
  }
};

export const toLegacyInvoiceStatus = (status: NewInvoiceStatus): LegacyInvoiceStatus => {
  switch (status) {
    case NewInvoiceStatus.PAID:
      return "Paid";
    case NewInvoiceStatus.UNPAID:
      return "Unpaid";
    case NewInvoiceStatus.OVERDUE:
      return "Overdue";
    default:
      throw new Error(`Unknown invoice status: ${status}`);
  }
};

export const toLegacyProductStatus = (status: NewProductStatus): LegacyProductStatus => {
  switch (status) {
    case NewProductStatus.IN_STOCK:
      return "In Stock";
    case NewProductStatus.LOW_STOCK:
      return "Low Stock";
    case NewProductStatus.OUT_OF_STOCK:
      return "Out of Stock";
    default:
      throw new Error(`Unknown product status: ${status}`);
  }
};

// Category conversion for products
export const convertProductCategory = (legacy: string): NewProductCategory => {
  const categoryMap: Record<string, NewProductCategory> = {
    "Flyers": NewProductCategory.FLYERS,
    "Business Cards": NewProductCategory.BUSINESS_CARDS,
    "Banners": NewProductCategory.BANNERS,
    "Custom": NewProductCategory.CUSTOM,
    "Posters": NewProductCategory.POSTERS,
    "Stickers": NewProductCategory.STICKERS,
    "Labels": NewProductCategory.LABELS,
    "Brochures": NewProductCategory.BROCHURES,
    "Envelopes": NewProductCategory.ENVELOPES,
    "Signage": NewProductCategory.SIGNAGE,
    "Wraps": NewProductCategory.WRAPS,
    "Magnets": NewProductCategory.MAGNETS,
  };
  
  if (legacy in categoryMap) {
    return categoryMap[legacy];
  }
  throw new Error(`Unknown product category: ${legacy}`);
};

export const convertPricingModel = (legacy: string): NewPricingModel => {
  const modelMap: Record<string, NewPricingModel> = {
    "multi-factor": NewPricingModel.MULTI_FACTOR,
    "quantity-based": NewPricingModel.QUANTITY_BASED,
    "area-based": NewPricingModel.AREA_BASED,
    "custom": NewPricingModel.CUSTOM,
  };
  
  if (legacy in modelMap) {
    return modelMap[legacy];
  }
  throw new Error(`Unknown pricing model: ${legacy}`);
};