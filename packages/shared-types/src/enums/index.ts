// EXISTING AUTH SYSTEM - DO NOT CHANGE
export const UserRole = {
  USER: "USER",
  MANAGER: "MANAGER",
  SUPER_ADMIN: "SUPER_ADMIN",
} as const;

export const UserStatus = {
  ACTIVE: "ACTIVE",
  INACTIVE: "INACTIVE",
  SUSPENDED: "SUSPENDED",
  PENDING_VERIFICATION: "PENDING_VERIFICATION",
} as const;

export type UserRole = (typeof UserRole)[keyof typeof UserRole];
export type UserStatus = (typeof UserStatus)[keyof typeof UserStatus];

// Customer related enums
export const CustomerType = {
  INDIVIDUAL: "INDIVIDUAL",
  CORPORATE: "CORPORATE",
} as const;

export const CustomerStatus = {
  ACTIVE: "ACTIVE",
  INACTIVE: "INACTIVE",
} as const;

export const InvoiceStatus = {
  PAID: "PAID",
  UNPAID: "UNPAID",
  OVERDUE: "OVERDUE",
} as const;

export const OrderStatus = {
  COMPLETED: "COMPLETED",
  PROCESSING: "PROCESSING",
  CANCELLED: "CANCELLED",
  PENDING_PAYMENT: "PENDING_PAYMENT",
  IN_PROGRESS: "IN_PROGRESS",
  ASSIGNED: "ASSIGNED",
} as const;

export const PaymentStatus = {
  PAID: "PAID",
  UNPAID: "UNPAID",
  OVERDUE: "OVERDUE",
  PENDING: "PENDING",
  PARTIAL: "PARTIAL",
} as const;

export const PaymentTerms = {
  IMMEDIATE: "IMMEDIATE",
  NET_30: "NET_30",
  NET_60: "NET_60",
} as const;

export const RefundStatus = {
  PENDING: "PENDING",
  APPROVED: "APPROVED",
  REJECTED: "REJECTED",
  PROCESSED: "PROCESSED",
} as const;

export const QuotationStatus = {
  PENDING: "PENDING",
  APPROVED: "APPROVED",
  REJECTED: "REJECTED",
  DRAFT: "DRAFT",
  SENT: "SENT",
  ACCEPTED: "ACCEPTED",
  EXPIRED: "EXPIRED",
} as const;

export type CustomerType = (typeof CustomerType)[keyof typeof CustomerType];
export type CustomerStatus = (typeof CustomerStatus)[keyof typeof CustomerStatus];
export type InvoiceStatus = (typeof InvoiceStatus)[keyof typeof InvoiceStatus];
export type OrderStatus = (typeof OrderStatus)[keyof typeof OrderStatus];
export type PaymentStatus = (typeof PaymentStatus)[keyof typeof PaymentStatus];
export type PaymentTerms = (typeof PaymentTerms)[keyof typeof PaymentTerms];
export type RefundStatus = (typeof RefundStatus)[keyof typeof RefundStatus];
export type QuotationStatus = (typeof QuotationStatus)[keyof typeof QuotationStatus];

// Product related enums
export const ProductCategory = {
  FLYERS: "FLYERS",
  BUSINESS_CARDS: "BUSINESS_CARDS",
  BANNERS: "BANNERS",
  CUSTOM: "CUSTOM",
  POSTERS: "POSTERS",
  STICKERS: "STICKERS",
  LABELS: "LABELS",
  BROCHURES: "BROCHURES",
  ENVELOPES: "ENVELOPES",
  SIGNAGE: "SIGNAGE",
  WRAPS: "WRAPS",
  MAGNETS: "MAGNETS",
} as const;

export const ProductStatus = {
  IN_STOCK: "IN_STOCK",
  LOW_STOCK: "LOW_STOCK",
  OUT_OF_STOCK: "OUT_OF_STOCK",
  DISCONTINUED: "DISCONTINUED",
} as const;

export const PricingModel = {
  MULTI_FACTOR: "MULTI_FACTOR",
  QUANTITY_BASED: "QUANTITY_BASED",
  AREA_BASED: "AREA_BASED",
  CUSTOM: "CUSTOM",
} as const;

export type ProductCategory = (typeof ProductCategory)[keyof typeof ProductCategory];
export type ProductStatus = (typeof ProductStatus)[keyof typeof ProductStatus];
export type PricingModel = (typeof PricingModel)[keyof typeof PricingModel];

// Custom enums not in Prisma
export enum ErrorCode {
  // Auth errors
  INVALID_CREDENTIALS = "INVALID_CREDENTIALS",
  USER_EXISTS = "USER_EXISTS",
  USER_NOT_FOUND = "USER_NOT_FOUND",
  INVALID_TOKEN = "INVALID_TOKEN",
  TOKEN_EXPIRED = "TOKEN_EXPIRED",
  NO_TOKEN = "NO_TOKEN",
  AUTH_REQUIRED = "AUTH_REQUIRED",
  EMAIL_NOT_VERIFIED = "EMAIL_NOT_VERIFIED",

  // Permission errors
  FORBIDDEN = "FORBIDDEN",
  ACCOUNT_INACTIVE = "ACCOUNT_INACTIVE",

  // Validation errors
  VALIDATION_ERROR = "VALIDATION_ERROR",

  // General errors
  NOT_FOUND = "NOT_FOUND",
  INTERNAL_ERROR = "INTERNAL_ERROR",
  BAD_REQUEST = "BAD_REQUEST",
  CONFLICT = "CONFLICT",
}

export enum HttpStatus {
  OK = 200,
  CREATED = 201,
  NO_CONTENT = 204,
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  CONFLICT = 409,
  UNPROCESSABLE_ENTITY = 422,
  TOO_MANY_REQUESTS = 429,
  INTERNAL_SERVER_ERROR = 500,
  SERVICE_UNAVAILABLE = 503,
}

export enum AuditAction {
  CREATE = "CREATE",
  UPDATE = "UPDATE",
  DELETE = "DELETE",
  LOGIN = "LOGIN",
  LOGOUT = "LOGOUT",
  EXPORT = "EXPORT",
}
