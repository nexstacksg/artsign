import { Request, Response, NextFunction } from "express";
import orderService from "../../services/order/orderService";
import { AuthRequest } from "../../middleware/auth/authenticate";
import { ApiError } from "../../middleware/error/errorHandler";
import {
  Order,
  OrderStatus,
  PaymentStatus,
  ICreateOrderService,
  IUpdateOrderService,
  IOrderFilterService,
  ErrorCode,
  HttpStatus,
  ApiResponse,
  PaginationParams,
  PaginatedResponse,
} from "@app/shared-types";

export const createOrder = async (
  req: Request<{}, {}, ICreateOrderService>,
  res: Response<ApiResponse<Order>>,
  next: NextFunction
): Promise<void> => {
  try {
    const order = await orderService.createOrder(req.body);

    const response: ApiResponse<Order> = {
      success: true,
      data: order,
      message: "Order created successfully",
    };

    res.status(HttpStatus.CREATED).json(response);
  } catch (error) {
    next(error);
  }
};

export const getOrders = async (
  req: Request<{}, {}, {}, PaginationParams & IOrderFilterService>,
  res: Response<ApiResponse<PaginatedResponse<Order>>>,
  next: NextFunction
): Promise<void> => {
  try {
    const { page = 1, limit = 10, sortBy = "createdAt", sortOrder = "desc", ...filters } = req.query;
    
    const pagination = { page: Number(page), limit: Number(limit), sortBy, sortOrder };
    const result = await orderService.getOrders(pagination, filters);

    const response: ApiResponse<PaginatedResponse<Order>> = {
      success: true,
      data: result,
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
};

export const getOrderById = async (
  req: Request<{ id: string }>,
  res: Response<ApiResponse<Order>>,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const order = await orderService.getOrderById(id);

    if (!order) {
      throw new ApiError(
        "Order not found",
        HttpStatus.NOT_FOUND,
        ErrorCode.NOT_FOUND
      );
    }

    const response: ApiResponse<Order> = {
      success: true,
      data: order,
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
};

export const updateOrder = async (
  req: Request<{ id: string }, {}, IUpdateOrderService>,
  res: Response<ApiResponse<Order>>,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const order = await orderService.updateOrder(id, req.body);

    const response: ApiResponse<Order> = {
      success: true,
      data: order,
      message: "Order updated successfully",
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
};

export const deleteOrder = async (
  req: Request<{ id: string }>,
  res: Response<ApiResponse>,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    await orderService.deleteOrder(id);

    const response: ApiResponse = {
      success: true,
      message: "Order deleted successfully",
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
};

export const getMyOrders = async (
  req: AuthRequest<{}, {}, {}, PaginationParams>,
  res: Response<ApiResponse<PaginatedResponse<Order>>>,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw new ApiError(
        "Authentication required",
        HttpStatus.UNAUTHORIZED,
        ErrorCode.AUTH_REQUIRED
      );
    }

    const { page = 1, limit = 10, sortBy = "createdAt", sortOrder = "desc" } = req.query;
    const pagination = { page: Number(page), limit: Number(limit), sortBy, sortOrder };
    
    const result = await orderService.getUserOrders(req.user.id, pagination);

    const response: ApiResponse<PaginatedResponse<Order>> = {
      success: true,
      data: result,
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
};

export const getOrderByNumber = async (
  req: Request<{ orderNumber: string }>,
  res: Response<ApiResponse<Order>>,
  next: NextFunction
): Promise<void> => {
  try {
    const { orderNumber } = req.params;
    const order = await orderService.getOrderByNumber(orderNumber);

    if (!order) {
      throw new ApiError(
        "Order not found",
        HttpStatus.NOT_FOUND,
        ErrorCode.NOT_FOUND
      );
    }

    const response: ApiResponse<Order> = {
      success: true,
      data: order,
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
};

export const updateOrderStatus = async (
  req: Request<{ id: string }, {}, { status: OrderStatus }>,
  res: Response<ApiResponse<Order>>,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const order = await orderService.updateOrderStatus(id, status);

    const response: ApiResponse<Order> = {
      success: true,
      data: order,
      message: "Order status updated successfully",
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
};

export const updatePaymentStatus = async (
  req: Request<{ id: string }, {}, { paymentStatus: PaymentStatus }>,
  res: Response<ApiResponse<Order>>,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const { paymentStatus } = req.body;

    const order = await orderService.updatePaymentStatus(id, paymentStatus);

    const response: ApiResponse<Order> = {
      success: true,
      data: order,
      message: "Payment status updated successfully",
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
};

export const addTrackingNumber = async (
  req: Request<{ id: string }, {}, { trackingNumber: string }>,
  res: Response<ApiResponse<Order>>,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const { trackingNumber } = req.body;

    const order = await orderService.addTrackingNumber(id, trackingNumber);

    const response: ApiResponse<Order> = {
      success: true,
      data: order,
      message: "Tracking number added successfully",
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
};

export const cancelOrder = async (
  req: Request<{ id: string }>,
  res: Response<ApiResponse<Order>>,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const order = await orderService.cancelOrder(id);

    const response: ApiResponse<Order> = {
      success: true,
      data: order,
      message: "Order cancelled successfully",
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
};