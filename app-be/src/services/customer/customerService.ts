import prisma from "../../database/client";
import { ApiError } from "../../middleware/error/errorHandler";
import {
  ICustomer,
  ICreateCustomer,
  IUpdateCustomer,
  ICustomerFilter,
  CustomerType,
  CustomerStatus,
  PaymentTerms,
  ErrorCode,
  HttpStatus,
  PaginationParams,
  PaginatedResponse,
  AuditAction,
} from "@app/shared-types";

export class CustomerService {
  private mapToCustomer(customer: any): ICustomer {
    return {
      id: customer.id,
      userId: customer.userId,
      companyName: customer.companyName,
      taxId: customer.taxId,
      customerType: customer.customerType as CustomerType,
      creditLimit: customer.creditLimit,
      creditUsed: customer.creditUsed,
      totalSpent: customer.totalSpent,
      paymentTerms: customer.paymentTerms as PaymentTerms,
      contactPerson: customer.contactPerson,
      salesman: customer.salesman,
      customerStatus: customer.customerStatus as CustomerStatus,
      notes: customer.notes,
      createdAt: customer.createdAt,
      updatedAt: customer.updatedAt,
    };
  }

  async createCustomer(data: ICreateCustomer): Promise<ICustomer> {
    // Check if customer already exists for this user
    const existingCustomer = await prisma.customer.findUnique({
      where: { userId: data.userId },
    });

    if (existingCustomer) {
      throw new ApiError(
        "Customer profile already exists for this user",
        HttpStatus.CONFLICT,
        ErrorCode.CONFLICT
      );
    }

    // Verify user exists
    const user = await prisma.user.findUnique({
      where: { id: data.userId },
    });

    if (!user) {
      throw new ApiError(
        "User not found",
        HttpStatus.NOT_FOUND,
        ErrorCode.USER_NOT_FOUND
      );
    }

    const customer = await prisma.customer.create({
      data: {
        userId: data.userId,
        companyName: data.companyName,
        taxId: data.taxId,
        customerType: data.customerType || CustomerType.INDIVIDUAL,
        creditLimit: data.creditLimit || 0,
        paymentTerms: data.paymentTerms || PaymentTerms.IMMEDIATE,
        contactPerson: data.contactPerson,
        salesman: data.salesman,
        notes: data.notes,
      },
    });

    // Log audit
    await prisma.auditLog.create({
      data: {
        userId: data.userId,
        action: AuditAction.CREATE,
        entity: "Customer",
        entityId: customer.id,
        changes: JSON.stringify(data),
      },
    });

    return this.mapToCustomer(customer);
  }

  async getCustomers(
    pagination: PaginationParams,
    filters: ICustomerFilter
  ): Promise<PaginatedResponse<ICustomer>> {
    const { page = 1, limit = 10, sortBy = "createdAt", sortOrder = "desc" } = pagination;
    const skip = (page - 1) * limit;

    const where: any = {};

    // Apply filters
    if (filters.customerStatus) {
      where.customerStatus = filters.customerStatus;
    }
    if (filters.customerType) {
      where.customerType = filters.customerType;
    }
    if (filters.minCreditLimit !== undefined) {
      where.creditLimit = { gte: filters.minCreditLimit };
    }
    if (filters.maxCreditLimit !== undefined) {
      where.creditLimit = { ...where.creditLimit, lte: filters.maxCreditLimit };
    }
    if (filters.minTotalSpent !== undefined) {
      where.totalSpent = { gte: filters.minTotalSpent };
    }
    if (filters.maxTotalSpent !== undefined) {
      where.totalSpent = { ...where.totalSpent, lte: filters.maxTotalSpent };
    }
    if (filters.salesman) {
      where.salesman = filters.salesman;
    }

    const [customers, total] = await Promise.all([
      prisma.customer.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              phone: true,
            },
          },
        },
      }),
      prisma.customer.count({ where }),
    ]);

    return {
      data: customers.map(this.mapToCustomer),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async getCustomerById(id: string): Promise<ICustomer | null> {
    const customer = await prisma.customer.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
          },
        },
      },
    });

    return customer ? this.mapToCustomer(customer) : null;
  }

  async getCustomerByUserId(userId: string): Promise<ICustomer | null> {
    const customer = await prisma.customer.findUnique({
      where: { userId },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
          },
        },
      },
    });

    return customer ? this.mapToCustomer(customer) : null;
  }

  async updateCustomer(id: string, data: IUpdateCustomer): Promise<ICustomer> {
    const existingCustomer = await prisma.customer.findUnique({
      where: { id },
    });

    if (!existingCustomer) {
      throw new ApiError(
        "Customer not found",
        HttpStatus.NOT_FOUND,
        ErrorCode.NOT_FOUND
      );
    }

    const customer = await prisma.customer.update({
      where: { id },
      data,
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
          },
        },
      },
    });

    // Log audit
    await prisma.auditLog.create({
      data: {
        userId: customer.userId,
        action: AuditAction.UPDATE,
        entity: "Customer",
        entityId: customer.id,
        changes: JSON.stringify(data),
      },
    });

    return this.mapToCustomer(customer);
  }

  async updateCustomerByUserId(userId: string, data: IUpdateCustomer): Promise<ICustomer> {
    const existingCustomer = await prisma.customer.findUnique({
      where: { userId },
    });

    if (!existingCustomer) {
      throw new ApiError(
        "Customer profile not found",
        HttpStatus.NOT_FOUND,
        ErrorCode.NOT_FOUND
      );
    }

    const customer = await prisma.customer.update({
      where: { userId },
      data,
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
          },
        },
      },
    });

    // Log audit
    await prisma.auditLog.create({
      data: {
        userId: customer.userId,
        action: AuditAction.UPDATE,
        entity: "Customer",
        entityId: customer.id,
        changes: JSON.stringify(data),
      },
    });

    return this.mapToCustomer(customer);
  }

  async deleteCustomer(id: string): Promise<void> {
    const existingCustomer = await prisma.customer.findUnique({
      where: { id },
    });

    if (!existingCustomer) {
      throw new ApiError(
        "Customer not found",
        HttpStatus.NOT_FOUND,
        ErrorCode.NOT_FOUND
      );
    }

    await prisma.customer.delete({
      where: { id },
    });

    // Log audit
    await prisma.auditLog.create({
      data: {
        userId: existingCustomer.userId,
        action: AuditAction.DELETE,
        entity: "Customer",
        entityId: id,
      },
    });
  }

  async updateCustomerStats(userId: string, orderAmount: number): Promise<void> {
    await prisma.customer.update({
      where: { userId },
      data: {
        totalSpent: {
          increment: orderAmount,
        },
      },
    });
  }

  async updateCreditUsed(userId: string, amount: number): Promise<void> {
    const customer = await prisma.customer.findUnique({
      where: { userId },
    });

    if (!customer) {
      throw new ApiError(
        "Customer not found",
        HttpStatus.NOT_FOUND,
        ErrorCode.NOT_FOUND
      );
    }

    const newCreditUsed = customer.creditUsed + amount;
    
    if (newCreditUsed > customer.creditLimit) {
      throw new ApiError(
        "Credit limit exceeded",
        HttpStatus.BAD_REQUEST,
        ErrorCode.BAD_REQUEST
      );
    }

    await prisma.customer.update({
      where: { userId },
      data: {
        creditUsed: newCreditUsed,
      },
    });
  }
}

export default new CustomerService();