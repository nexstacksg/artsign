import prisma from "../../database/client";
import { ApiError } from "../../middleware/error/errorHandler";
import {
  Quotation,
  QuotationItem,
  QuotationStatus,
  ICreateQuotationService,
  IUpdateQuotationService,
  IQuotationFilterService,
  ErrorCode,
  HttpStatus,
  PaginationParams,
  PaginatedResponse,
  AuditAction,
} from "@app/shared-types";

export class QuotationService {
  private mapToQuotation(quotation: any): Quotation {
    return {
      id: quotation.id,
      quotationNumber: quotation.quotationNumber,
      customerId: quotation.userId,
      customer: quotation.user ? {
        name: `${quotation.user.firstName} ${quotation.user.lastName}`,
        email: quotation.user.email,
        phone: quotation.user.phone || "",
        address: "",
      } : undefined,
      salesman: quotation.salesman,
      title: quotation.title,
      description: quotation.description,
      date: quotation.createdAt.toISOString(),
      items: quotation.items?.map(this.mapToQuotationItem) || [],
      subtotal: quotation.subtotal,
      tax: quotation.taxAmount,
      total: quotation.totalAmount,
      validUntil: quotation.validUntil,
      status: quotation.status as QuotationStatus,
      notes: quotation.notes,
      createdAt: quotation.createdAt,
      updatedAt: quotation.updatedAt,
    };
  }

  private mapToQuotationItem(item: any): QuotationItem {
    return {
      id: item.id,
      productId: item.productId,
      productName: item.product?.name || "",
      description: item.description,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      totalPrice: item.totalPrice,
      specifications: item.specifications,
    };
  }

  private generateQuotationNumber(): string {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, "0");
    return `QUO-${timestamp}-${random}`;
  }

  async createQuotation(data: ICreateQuotationService): Promise<Quotation> {
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

    // Verify products exist and calculate totals
    let subtotal = 0;
    const quotationItems = [];

    for (const item of data.items) {
      const product = await prisma.product.findUnique({
        where: { id: item.productId },
      });

      if (!product) {
        throw new ApiError(
          `Product with ID ${item.productId} not found`,
          HttpStatus.NOT_FOUND,
          ErrorCode.NOT_FOUND
        );
      }

      const totalPrice = item.quantity * item.unitPrice;
      subtotal += totalPrice;

      quotationItems.push({
        productId: item.productId,
        description: item.description,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        totalPrice,
        specifications: item.specifications,
      });
    }

    const taxAmount = subtotal * 0.07; // 7% tax (configurable)
    const totalAmount = subtotal + taxAmount;

    // Create quotation with items
    const quotation = await prisma.quotation.create({
      data: {
        quotationNumber: this.generateQuotationNumber(),
        userId: data.userId,
        title: data.title,
        description: data.description,
        salesman: data.salesman,
        validUntil: data.validUntil,
        subtotal,
        taxAmount,
        totalAmount,
        notes: data.notes,
        items: {
          create: quotationItems,
        },
      },
      include: {
        user: true,
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    // Log audit
    await prisma.auditLog.create({
      data: {
        userId: data.userId,
        action: AuditAction.CREATE,
        entity: "Quotation",
        entityId: quotation.id,
        changes: JSON.stringify(data),
      },
    });

    return this.mapToQuotation(quotation);
  }

  async getQuotations(
    pagination: PaginationParams,
    filters: IQuotationFilterService
  ): Promise<PaginatedResponse<Quotation>> {
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
    if (filters.salesman) {
      where.salesman = filters.salesman;
    }
    if (filters.dateFrom) {
      where.createdAt = { gte: filters.dateFrom };
    }
    if (filters.dateTo) {
      where.createdAt = { ...where.createdAt, lte: filters.dateTo };
    }
    if (filters.minAmount !== undefined) {
      where.totalAmount = { gte: filters.minAmount };
    }
    if (filters.maxAmount !== undefined) {
      where.totalAmount = { ...where.totalAmount, lte: filters.maxAmount };
    }
    if (filters.search) {
      where.OR = [
        { quotationNumber: { contains: filters.search, mode: "insensitive" } },
        { title: { contains: filters.search, mode: "insensitive" } },
        { user: { firstName: { contains: filters.search, mode: "insensitive" } } },
        { user: { lastName: { contains: filters.search, mode: "insensitive" } } },
        { user: { email: { contains: filters.search, mode: "insensitive" } } },
      ];
    }

    const [quotations, total] = await Promise.all([
      prisma.quotation.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          user: true,
          items: {
            include: {
              product: true,
            },
          },
        },
      }),
      prisma.quotation.count({ where }),
    ]);

    return {
      data: quotations.map(this.mapToQuotation),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async getQuotationById(id: string): Promise<Quotation | null> {
    const quotation = await prisma.quotation.findUnique({
      where: { id },
      include: {
        user: true,
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    return quotation ? this.mapToQuotation(quotation) : null;
  }

  async getQuotationByNumber(quotationNumber: string): Promise<Quotation | null> {
    const quotation = await prisma.quotation.findUnique({
      where: { quotationNumber },
      include: {
        user: true,
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    return quotation ? this.mapToQuotation(quotation) : null;
  }

  async getUserQuotations(
    userId: string,
    pagination: PaginationParams
  ): Promise<PaginatedResponse<Quotation>> {
    const { page = 1, limit = 10, sortBy = "createdAt", sortOrder = "desc" } = pagination;
    const skip = (page - 1) * limit;

    const where = { userId };

    const [quotations, total] = await Promise.all([
      prisma.quotation.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          user: true,
          items: {
            include: {
              product: true,
            },
          },
        },
      }),
      prisma.quotation.count({ where }),
    ]);

    return {
      data: quotations.map(this.mapToQuotation),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async updateQuotation(id: string, data: IUpdateQuotationService): Promise<Quotation> {
    const existingQuotation = await prisma.quotation.findUnique({
      where: { id },
    });

    if (!existingQuotation) {
      throw new ApiError(
        "Quotation not found",
        HttpStatus.NOT_FOUND,
        ErrorCode.NOT_FOUND
      );
    }

    const quotation = await prisma.quotation.update({
      where: { id },
      data,
      include: {
        user: true,
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    // Log audit
    await prisma.auditLog.create({
      data: {
        userId: quotation.userId,
        action: AuditAction.UPDATE,
        entity: "Quotation",
        entityId: quotation.id,
        changes: JSON.stringify(data),
      },
    });

    return this.mapToQuotation(quotation);
  }

  async updateQuotationStatus(id: string, status: QuotationStatus): Promise<Quotation> {
    return this.updateQuotation(id, { status });
  }

  async sendQuotation(id: string): Promise<Quotation> {
    const quotation = await this.updateQuotationStatus(id, QuotationStatus.SENT);
    
    // Here you could add email sending logic
    // await emailService.sendQuotation(quotation);
    
    return quotation;
  }

  async acceptQuotation(id: string): Promise<Quotation> {
    const existingQuotation = await prisma.quotation.findUnique({
      where: { id },
    });

    if (!existingQuotation) {
      throw new ApiError(
        "Quotation not found",
        HttpStatus.NOT_FOUND,
        ErrorCode.NOT_FOUND
      );
    }

    // Check if quotation is still valid
    if (new Date() > existingQuotation.validUntil) {
      throw new ApiError(
        "Quotation has expired",
        HttpStatus.BAD_REQUEST,
        ErrorCode.BAD_REQUEST
      );
    }

    // Only allow acceptance if quotation is SENT or PENDING
    if (!["SENT", "PENDING"].includes(existingQuotation.status)) {
      throw new ApiError(
        "Quotation cannot be accepted at this stage",
        HttpStatus.BAD_REQUEST,
        ErrorCode.BAD_REQUEST
      );
    }

    return this.updateQuotationStatus(id, QuotationStatus.ACCEPTED);
  }

  async rejectQuotation(id: string): Promise<Quotation> {
    return this.updateQuotationStatus(id, QuotationStatus.REJECTED);
  }

  async convertToOrder(id: string): Promise<{ quotation: Quotation; orderId: string }> {
    const existingQuotation = await prisma.quotation.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!existingQuotation) {
      throw new ApiError(
        "Quotation not found",
        HttpStatus.NOT_FOUND,
        ErrorCode.NOT_FOUND
      );
    }

    // Check if quotation is accepted
    if (existingQuotation.status !== QuotationStatus.ACCEPTED) {
      throw new ApiError(
        "Only accepted quotations can be converted to orders",
        HttpStatus.BAD_REQUEST,
        ErrorCode.BAD_REQUEST
      );
    }

    // Check if quotation is still valid
    if (new Date() > existingQuotation.validUntil) {
      throw new ApiError(
        "Quotation has expired",
        HttpStatus.BAD_REQUEST,
        ErrorCode.BAD_REQUEST
      );
    }

    // Generate order number
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, "0");
    const orderNumber = `ORD-${timestamp}-${random}`;

    // Create order from quotation
    const order = await prisma.order.create({
      data: {
        orderNumber,
        userId: existingQuotation.userId,
        subtotal: existingQuotation.subtotal,
        taxAmount: existingQuotation.taxAmount,
        totalAmount: existingQuotation.totalAmount,
        notes: `Created from quotation ${existingQuotation.quotationNumber}`,
        orderItems: {
          create: existingQuotation.items.map(item => ({
            productId: item.productId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            totalPrice: item.totalPrice,
            specifications: item.specifications,
          })),
        },
      },
    });

    // Log audit
    await prisma.auditLog.create({
      data: {
        userId: existingQuotation.userId,
        action: AuditAction.CREATE,
        entity: "Order",
        entityId: order.id,
        changes: JSON.stringify({ convertedFromQuotation: id }),
      },
    });

    const quotation = this.mapToQuotation(existingQuotation);

    return {
      quotation,
      orderId: order.id,
    };
  }

  async deleteQuotation(id: string): Promise<void> {
    const existingQuotation = await prisma.quotation.findUnique({
      where: { id },
    });

    if (!existingQuotation) {
      throw new ApiError(
        "Quotation not found",
        HttpStatus.NOT_FOUND,
        ErrorCode.NOT_FOUND
      );
    }

    await prisma.quotation.delete({
      where: { id },
    });

    // Log audit
    await prisma.auditLog.create({
      data: {
        userId: existingQuotation.userId,
        action: AuditAction.DELETE,
        entity: "Quotation",
        entityId: id,
      },
    });
  }
}

export default new QuotationService();