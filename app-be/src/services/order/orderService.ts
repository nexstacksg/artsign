import prisma from "../../database/client";
import { ApiError } from "../../middleware/error/errorHandler";
import {
  Order,
  OrderItem,
  OrderStatus,
  PaymentStatus,
  ICreateOrderService,
  IUpdateOrderService,
  IOrderFilterService,
  ErrorCode,
  HttpStatus,
  PaginationParams,
  PaginatedResponse,
  AuditAction,
} from "@app/shared-types";

export class OrderService {
  private mapToOrder(order: any): Order {
    return {
      id: order.id,
      orderNumber: order.orderNumber,
      customer: order.user ? `${order.user.firstName} ${order.user.lastName}` : "",
      customerId: order.userId,
      date: order.createdAt.toISOString(),
      totalAmount: order.totalAmount,
      status: order.status as OrderStatus,
      paymentStatus: order.paymentStatus as PaymentStatus,
      shippingAddress: order.shippingAddress ? this.formatAddress(order.shippingAddress) : "",
      billingAddress: order.billingAddress ? this.formatAddress(order.billingAddress) : "",
      items: order.orderItems?.map(this.mapToOrderItem) || [],
      notes: order.notes,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
    };
  }

  private mapToOrderItem(item: any): OrderItem {
    return {
      id: item.id,
      orderId: item.orderId,
      productId: item.productId,
      productName: item.product?.name || "",
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      totalPrice: item.totalPrice,
      specifications: item.specifications,
    };
  }

  private formatAddress(address: any): string {
    return `${address.street}, ${address.city}, ${address.state} ${address.postalCode}`;
  }

  private generateOrderNumber(): string {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, "0");
    return `ORD-${timestamp}-${random}`;
  }

  async createOrder(data: ICreateOrderService): Promise<Order> {
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
    const orderItems = [];

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

      // Check stock if tracking is enabled
      if (product.trackStock && product.currentStock < item.quantity) {
        throw new ApiError(
          `Insufficient stock for product ${product.name}`,
          HttpStatus.BAD_REQUEST,
          ErrorCode.BAD_REQUEST
        );
      }

      const totalPrice = item.quantity * item.unitPrice;
      subtotal += totalPrice;

      orderItems.push({
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        totalPrice,
        specifications: item.specifications,
      });
    }

    const taxAmount = subtotal * 0.07; // 7% tax (configurable)
    const shippingCost = 0; // Can be calculated based on shipping method
    const totalAmount = subtotal + taxAmount + shippingCost;

    // Create order with items
    const order = await prisma.order.create({
      data: {
        orderNumber: this.generateOrderNumber(),
        userId: data.userId,
        subtotal,
        taxAmount,
        shippingCost,
        totalAmount,
        shippingMethod: data.shippingMethod || "STANDARD",
        shippingAddressId: data.shippingAddressId,
        billingAddressId: data.billingAddressId,
        paymentMethodId: data.paymentMethodId,
        notes: data.notes,
        orderItems: {
          create: orderItems,
        },
      },
      include: {
        user: true,
        orderItems: {
          include: {
            product: true,
          },
        },
        shippingAddress: true,
        billingAddress: true,
        paymentMethod: true,
      },
    });

    // Update product stock if tracking is enabled
    for (const item of data.items) {
      const product = await prisma.product.findUnique({
        where: { id: item.productId },
      });

      if (product?.trackStock) {
        await prisma.product.update({
          where: { id: item.productId },
          data: {
            currentStock: {
              decrement: item.quantity,
            },
          },
        });
      }
    }

    // Log audit
    await prisma.auditLog.create({
      data: {
        userId: data.userId,
        action: AuditAction.CREATE,
        entity: "Order",
        entityId: order.id,
        changes: JSON.stringify(data),
      },
    });

    return this.mapToOrder(order);
  }

  async getOrders(
    pagination: PaginationParams,
    filters: IOrderFilterService
  ): Promise<PaginatedResponse<Order>> {
    const { page = 1, limit = 10, sortBy = "createdAt", sortOrder = "desc" } = pagination;
    const skip = (page - 1) * limit;

    const where: any = {};

    // Apply filters
    if (filters.status) {
      where.status = filters.status;
    }
    if (filters.paymentStatus) {
      where.paymentStatus = filters.paymentStatus;
    }
    if (filters.userId) {
      where.userId = filters.userId;
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
        { orderNumber: { contains: filters.search, mode: "insensitive" } },
        { user: { firstName: { contains: filters.search, mode: "insensitive" } } },
        { user: { lastName: { contains: filters.search, mode: "insensitive" } } },
        { user: { email: { contains: filters.search, mode: "insensitive" } } },
      ];
    }

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          user: true,
          orderItems: {
            include: {
              product: true,
            },
          },
          shippingAddress: true,
          billingAddress: true,
          paymentMethod: true,
        },
      }),
      prisma.order.count({ where }),
    ]);

    return {
      data: orders.map(this.mapToOrder),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async getOrderById(id: string): Promise<Order | null> {
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        user: true,
        orderItems: {
          include: {
            product: true,
          },
        },
        shippingAddress: true,
        billingAddress: true,
        paymentMethod: true,
      },
    });

    return order ? this.mapToOrder(order) : null;
  }

  async getOrderByNumber(orderNumber: string): Promise<Order | null> {
    const order = await prisma.order.findUnique({
      where: { orderNumber },
      include: {
        user: true,
        orderItems: {
          include: {
            product: true,
          },
        },
        shippingAddress: true,
        billingAddress: true,
        paymentMethod: true,
      },
    });

    return order ? this.mapToOrder(order) : null;
  }

  async getUserOrders(
    userId: string,
    pagination: PaginationParams
  ): Promise<PaginatedResponse<Order>> {
    const { page = 1, limit = 10, sortBy = "createdAt", sortOrder = "desc" } = pagination;
    const skip = (page - 1) * limit;

    const where = { userId };

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          user: true,
          orderItems: {
            include: {
              product: true,
            },
          },
          shippingAddress: true,
          billingAddress: true,
          paymentMethod: true,
        },
      }),
      prisma.order.count({ where }),
    ]);

    return {
      data: orders.map(this.mapToOrder),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async updateOrder(id: string, data: IUpdateOrderService): Promise<Order> {
    const existingOrder = await prisma.order.findUnique({
      where: { id },
    });

    if (!existingOrder) {
      throw new ApiError(
        "Order not found",
        HttpStatus.NOT_FOUND,
        ErrorCode.NOT_FOUND
      );
    }

    const order = await prisma.order.update({
      where: { id },
      data,
      include: {
        user: true,
        orderItems: {
          include: {
            product: true,
          },
        },
        shippingAddress: true,
        billingAddress: true,
        paymentMethod: true,
      },
    });

    // Log audit
    await prisma.auditLog.create({
      data: {
        userId: order.userId,
        action: AuditAction.UPDATE,
        entity: "Order",
        entityId: order.id,
        changes: JSON.stringify(data),
      },
    });

    return this.mapToOrder(order);
  }

  async updateOrderStatus(id: string, status: OrderStatus): Promise<Order> {
    return this.updateOrder(id, { status });
  }

  async updatePaymentStatus(id: string, paymentStatus: PaymentStatus): Promise<Order> {
    return this.updateOrder(id, { paymentStatus });
  }

  async addTrackingNumber(id: string, trackingNumber: string): Promise<Order> {
    const order = await this.updateOrder(id, { trackingNumber });
    
    // Auto-update status to SHIPPED if not already
    if (order.status === OrderStatus.PROCESSING) {
      return this.updateOrderStatus(id, OrderStatus.IN_PROGRESS);
    }

    return order;
  }

  async cancelOrder(id: string): Promise<Order> {
    const existingOrder = await prisma.order.findUnique({
      where: { id },
      include: {
        orderItems: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!existingOrder) {
      throw new ApiError(
        "Order not found",
        HttpStatus.NOT_FOUND,
        ErrorCode.NOT_FOUND
      );
    }

    // Only allow cancellation if order is pending or processing
    if (!["PENDING", "PROCESSING"].includes(existingOrder.status)) {
      throw new ApiError(
        "Order cannot be cancelled at this stage",
        HttpStatus.BAD_REQUEST,
        ErrorCode.BAD_REQUEST
      );
    }

    // Restore product stock if tracking is enabled
    for (const item of existingOrder.orderItems) {
      if (item.product.trackStock) {
        await prisma.product.update({
          where: { id: item.productId },
          data: {
            currentStock: {
              increment: item.quantity,
            },
          },
        });
      }
    }

    return this.updateOrderStatus(id, OrderStatus.CANCELLED);
  }

  async deleteOrder(id: string): Promise<void> {
    const existingOrder = await prisma.order.findUnique({
      where: { id },
    });

    if (!existingOrder) {
      throw new ApiError(
        "Order not found",
        HttpStatus.NOT_FOUND,
        ErrorCode.NOT_FOUND
      );
    }

    await prisma.order.delete({
      where: { id },
    });

    // Log audit
    await prisma.auditLog.create({
      data: {
        userId: existingOrder.userId,
        action: AuditAction.DELETE,
        entity: "Order",
        entityId: id,
      },
    });
  }
}

export default new OrderService();