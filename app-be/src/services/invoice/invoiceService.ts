import prisma from "../../database/client";
import { ApiError } from "../../middleware/error/errorHandler";
import {
  Invoice,
  InvoiceStatus,
  ICreateInvoiceService,
  IUpdateInvoiceService,
  IInvoiceFilterService,
  ErrorCode,
  HttpStatus,
  PaginationParams,
  PaginatedResponse,
  AuditAction,
} from "@app/shared-types";

export class InvoiceService {
  private mapToInvoice(invoice: any): Invoice {
    return {
      id: invoice.id,
      customerId: invoice.userId,
      customer: invoice.user ? {
        id: invoice.user.id,
        userId: invoice.user.id,
        companyName: invoice.user.customer?.companyName || null,
        taxId: invoice.user.customer?.taxId || null,
        customerType: invoice.user.customer?.customerType || "INDIVIDUAL",
        creditLimit: invoice.user.customer?.creditLimit || 0,
        creditUsed: invoice.user.customer?.creditUsed || 0,
        totalSpent: invoice.user.customer?.totalSpent || 0,
        paymentTerms: invoice.user.customer?.paymentTerms || "IMMEDIATE",
        contactPerson: invoice.user.customer?.contactPerson || null,
        salesman: invoice.user.customer?.salesman || null,
        customerStatus: invoice.user.customer?.customerStatus || "ACTIVE",
        notes: invoice.user.customer?.notes || null,
        createdAt: invoice.user.customer?.createdAt || new Date(),
        updatedAt: invoice.user.customer?.updatedAt || new Date(),
      } : undefined,
      invoiceNumber: invoice.invoiceNumber,
      status: invoice.status as InvoiceStatus,
      amount: invoice.amount,
      dueDate: invoice.dueDate,
      paidDate: invoice.paidDate,
      created: invoice.createdAt.toISOString(),
      createdAt: invoice.createdAt,
      updatedAt: invoice.updatedAt,
    };
  }

  private generateInvoiceNumber(): string {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, "0");
    return `INV-${timestamp}-${random}`;
  }

  async createInvoice(data: ICreateInvoiceService): Promise<Invoice> {
    // Verify order exists
    const order = await prisma.order.findUnique({
      where: { id: data.orderId },
    });

    if (!order) {
      throw new ApiError(
        "Order not found",
        HttpStatus.NOT_FOUND,
        ErrorCode.NOT_FOUND
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

    // Check if invoice already exists for this order
    const existingInvoice = await prisma.invoice.findFirst({
      where: { orderId: data.orderId },
    });

    if (existingInvoice) {
      throw new ApiError(
        "Invoice already exists for this order",
        HttpStatus.CONFLICT,
        ErrorCode.CONFLICT
      );
    }

    const invoice = await prisma.invoice.create({
      data: {
        invoiceNumber: this.generateInvoiceNumber(),
        orderId: data.orderId,
        userId: data.userId,
        amount: data.amount,
        dueDate: data.dueDate,
      },
      include: {
        user: {
          include: {
            customer: true,
          },
        },
        order: true,
      },
    });

    // Log audit
    await prisma.auditLog.create({
      data: {
        userId: data.userId,
        action: AuditAction.CREATE,
        entity: "Invoice",
        entityId: invoice.id,
        changes: JSON.stringify(data),
      },
    });

    return this.mapToInvoice(invoice);
  }

  async getInvoices(
    pagination: PaginationParams,
    filters: IInvoiceFilterService
  ): Promise<PaginatedResponse<Invoice>> {
    const { page = 1, limit = 10, sortBy = "createdAt", sortOrder = "desc" } = pagination;
    const skip = (page - 1) * limit;

    const where: any = {};

    // Apply filters
    if (filters.status) {
      where.status = filters.status;
    }
    if (filters.userId) {
      where.userId = filters.userId;
    }
    if (filters.orderId) {
      where.orderId = filters.orderId;
    }
    if (filters.dateFrom) {
      where.createdAt = { gte: filters.dateFrom };
    }
    if (filters.dateTo) {
      where.createdAt = { ...where.createdAt, lte: filters.dateTo };
    }
    if (filters.dueDateFrom) {
      where.dueDate = { gte: filters.dueDateFrom };
    }
    if (filters.dueDateTo) {
      where.dueDate = { ...where.dueDate, lte: filters.dueDateTo };
    }
    if (filters.minAmount !== undefined) {
      where.amount = { gte: filters.minAmount };
    }
    if (filters.maxAmount !== undefined) {
      where.amount = { ...where.amount, lte: filters.maxAmount };
    }
    if (filters.overdue) {
      where.dueDate = { lt: new Date() };
      where.status = { not: InvoiceStatus.PAID };
    }
    if (filters.search) {
      where.OR = [
        { invoiceNumber: { contains: filters.search, mode: "insensitive" } },
        { user: { firstName: { contains: filters.search, mode: "insensitive" } } },
        { user: { lastName: { contains: filters.search, mode: "insensitive" } } },
        { user: { email: { contains: filters.search, mode: "insensitive" } } },
        { order: { orderNumber: { contains: filters.search, mode: "insensitive" } } },
      ];
    }

    const [invoices, total] = await Promise.all([
      prisma.invoice.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          user: {
            include: {
              customer: true,
            },
          },
          order: true,
        },
      }),
      prisma.invoice.count({ where }),
    ]);

    return {
      data: invoices.map(this.mapToInvoice),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async getInvoiceById(id: string): Promise<Invoice | null> {
    const invoice = await prisma.invoice.findUnique({
      where: { id },
      include: {
        user: {
          include: {
            customer: true,
          },
        },
        order: true,
      },
    });

    return invoice ? this.mapToInvoice(invoice) : null;
  }

  async getInvoiceByNumber(invoiceNumber: string): Promise<Invoice | null> {
    const invoice = await prisma.invoice.findUnique({
      where: { invoiceNumber },
      include: {
        user: {
          include: {
            customer: true,
          },
        },
        order: true,
      },
    });

    return invoice ? this.mapToInvoice(invoice) : null;
  }

  async getUserInvoices(
    userId: string,
    pagination: PaginationParams
  ): Promise<PaginatedResponse<Invoice>> {
    const { page = 1, limit = 10, sortBy = "createdAt", sortOrder = "desc" } = pagination;
    const skip = (page - 1) * limit;

    const where = { userId };

    const [invoices, total] = await Promise.all([
      prisma.invoice.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          user: {
            include: {
              customer: true,
            },
          },
          order: true,
        },
      }),
      prisma.invoice.count({ where }),
    ]);

    return {
      data: invoices.map(this.mapToInvoice),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async getInvoicesByOrder(
    orderId: string,
    pagination: PaginationParams
  ): Promise<PaginatedResponse<Invoice>> {
    const { page = 1, limit = 10, sortBy = "createdAt", sortOrder = "desc" } = pagination;
    const skip = (page - 1) * limit;

    // Verify order exists
    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      throw new ApiError(
        "Order not found",
        HttpStatus.NOT_FOUND,
        ErrorCode.NOT_FOUND
      );
    }

    const where = { orderId };

    const [invoices, total] = await Promise.all([
      prisma.invoice.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          user: {
            include: {
              customer: true,
            },
          },
          order: true,
        },
      }),
      prisma.invoice.count({ where }),
    ]);

    return {
      data: invoices.map(this.mapToInvoice),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async updateInvoice(id: string, data: IUpdateInvoiceService): Promise<Invoice> {
    const existingInvoice = await prisma.invoice.findUnique({
      where: { id },
    });

    if (!existingInvoice) {
      throw new ApiError(
        "Invoice not found",
        HttpStatus.NOT_FOUND,
        ErrorCode.NOT_FOUND
      );
    }

    const invoice = await prisma.invoice.update({
      where: { id },
      data,
      include: {
        user: {
          include: {
            customer: true,
          },
        },
        order: true,
      },
    });

    // Log audit
    await prisma.auditLog.create({
      data: {
        userId: invoice.userId,
        action: AuditAction.UPDATE,
        entity: "Invoice",
        entityId: invoice.id,
        changes: JSON.stringify(data),
      },
    });

    return this.mapToInvoice(invoice);
  }

  async markAsPaid(id: string, paidDate?: Date): Promise<Invoice> {
    const updateData: IUpdateInvoiceService = {
      status: InvoiceStatus.PAID,
      paidDate: paidDate || new Date(),
    };

    return this.updateInvoice(id, updateData);
  }

  async markAsUnpaid(id: string): Promise<Invoice> {
    const updateData: IUpdateInvoiceService = {
      status: InvoiceStatus.UNPAID,
      paidDate: undefined,
    };

    return this.updateInvoice(id, updateData);
  }

  async getOverdueInvoices(pagination: PaginationParams): Promise<PaginatedResponse<Invoice>> {
    const filters: IInvoiceFilterService = {
      overdue: true,
    };

    return this.getInvoices(pagination, filters);
  }

  async generateInvoiceFromOrder(orderId: string, dueDate?: Date): Promise<Invoice> {
    // Get order details
    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      throw new ApiError(
        "Order not found",
        HttpStatus.NOT_FOUND,
        ErrorCode.NOT_FOUND
      );
    }

    // Calculate due date (default: 30 days from now)
    const defaultDueDate = new Date();
    defaultDueDate.setDate(defaultDueDate.getDate() + 30);

    const invoiceData: ICreateInvoiceService = {
      orderId: order.id,
      userId: order.userId,
      amount: order.totalAmount,
      dueDate: dueDate || defaultDueDate,
    };

    return this.createInvoice(invoiceData);
  }

  async deleteInvoice(id: string): Promise<void> {
    const existingInvoice = await prisma.invoice.findUnique({
      where: { id },
    });

    if (!existingInvoice) {
      throw new ApiError(
        "Invoice not found",
        HttpStatus.NOT_FOUND,
        ErrorCode.NOT_FOUND
      );
    }

    // Don't allow deletion of paid invoices
    if (existingInvoice.status === InvoiceStatus.PAID) {
      throw new ApiError(
        "Cannot delete paid invoices",
        HttpStatus.BAD_REQUEST,
        ErrorCode.BAD_REQUEST
      );
    }

    await prisma.invoice.delete({
      where: { id },
    });

    // Log audit
    await prisma.auditLog.create({
      data: {
        userId: existingInvoice.userId,
        action: AuditAction.DELETE,
        entity: "Invoice",
        entityId: id,
      },
    });
  }

  async updateOverdueStatus(): Promise<number> {
    // This method can be called by a scheduled job to update overdue invoices
    const result = await prisma.invoice.updateMany({
      where: {
        dueDate: { lt: new Date() },
        status: InvoiceStatus.UNPAID,
      },
      data: {
        status: InvoiceStatus.OVERDUE,
      },
    });

    return result.count;
  }
}

export default new InvoiceService();