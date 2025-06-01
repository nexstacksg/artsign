import { Request, Response, NextFunction } from "express";
import invoiceService from "../../services/invoice/invoiceService";
import { AuthRequest } from "../../middleware/auth/authenticate";
import { ApiError } from "../../middleware/error/errorHandler";
import {
  Invoice,
  ICreateInvoiceService,
  IUpdateInvoiceService,
  IInvoiceFilterService,
  ErrorCode,
  HttpStatus,
  ApiResponse,
  PaginationParams,
  PaginatedResponse,
} from "@app/shared-types";

export const createInvoice = async (
  req: Request<{}, {}, ICreateInvoiceService>,
  res: Response<ApiResponse<Invoice>>,
  next: NextFunction
): Promise<void> => {
  try {
    const invoice = await invoiceService.createInvoice(req.body);

    const response: ApiResponse<Invoice> = {
      success: true,
      data: invoice,
      message: "Invoice created successfully",
    };

    res.status(HttpStatus.CREATED).json(response);
  } catch (error) {
    next(error);
  }
};

export const getInvoices = async (
  req: Request<{}, {}, {}, PaginationParams & IInvoiceFilterService>,
  res: Response<ApiResponse<PaginatedResponse<Invoice>>>,
  next: NextFunction
): Promise<void> => {
  try {
    const { page = 1, limit = 10, sortBy = "createdAt", sortOrder = "desc", ...filters } = req.query;
    
    const pagination = { page: Number(page), limit: Number(limit), sortBy, sortOrder };
    const result = await invoiceService.getInvoices(pagination, filters);

    const response: ApiResponse<PaginatedResponse<Invoice>> = {
      success: true,
      data: result,
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
};

export const getInvoiceById = async (
  req: Request<{ id: string }>,
  res: Response<ApiResponse<Invoice>>,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const invoice = await invoiceService.getInvoiceById(id);

    if (!invoice) {
      throw new ApiError(
        "Invoice not found",
        HttpStatus.NOT_FOUND,
        ErrorCode.NOT_FOUND
      );
    }

    const response: ApiResponse<Invoice> = {
      success: true,
      data: invoice,
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
};

export const updateInvoice = async (
  req: Request<{ id: string }, {}, IUpdateInvoiceService>,
  res: Response<ApiResponse<Invoice>>,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const invoice = await invoiceService.updateInvoice(id, req.body);

    const response: ApiResponse<Invoice> = {
      success: true,
      data: invoice,
      message: "Invoice updated successfully",
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
};

export const deleteInvoice = async (
  req: Request<{ id: string }>,
  res: Response<ApiResponse>,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    await invoiceService.deleteInvoice(id);

    const response: ApiResponse = {
      success: true,
      message: "Invoice deleted successfully",
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
};

export const getMyInvoices = async (
  req: AuthRequest<{}, {}, {}, PaginationParams>,
  res: Response<ApiResponse<PaginatedResponse<Invoice>>>,
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
    
    const result = await invoiceService.getUserInvoices(req.user.id, pagination);

    const response: ApiResponse<PaginatedResponse<Invoice>> = {
      success: true,
      data: result,
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
};

export const getInvoiceByNumber = async (
  req: Request<{ invoiceNumber: string }>,
  res: Response<ApiResponse<Invoice>>,
  next: NextFunction
): Promise<void> => {
  try {
    const { invoiceNumber } = req.params;
    const invoice = await invoiceService.getInvoiceByNumber(invoiceNumber);

    if (!invoice) {
      throw new ApiError(
        "Invoice not found",
        HttpStatus.NOT_FOUND,
        ErrorCode.NOT_FOUND
      );
    }

    const response: ApiResponse<Invoice> = {
      success: true,
      data: invoice,
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
};

export const markAsPaid = async (
  req: Request<{ id: string }, {}, { paidDate?: Date }>,
  res: Response<ApiResponse<Invoice>>,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const { paidDate } = req.body;

    const invoice = await invoiceService.markAsPaid(id, paidDate);

    const response: ApiResponse<Invoice> = {
      success: true,
      data: invoice,
      message: "Invoice marked as paid",
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
};

export const markAsUnpaid = async (
  req: Request<{ id: string }>,
  res: Response<ApiResponse<Invoice>>,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const invoice = await invoiceService.markAsUnpaid(id);

    const response: ApiResponse<Invoice> = {
      success: true,
      data: invoice,
      message: "Invoice marked as unpaid",
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
};

export const getOverdueInvoices = async (
  req: Request<{}, {}, {}, PaginationParams>,
  res: Response<ApiResponse<PaginatedResponse<Invoice>>>,
  next: NextFunction
): Promise<void> => {
  try {
    const { page = 1, limit = 10, sortBy = "dueDate", sortOrder = "asc" } = req.query;
    const pagination = { page: Number(page), limit: Number(limit), sortBy, sortOrder };
    
    const result = await invoiceService.getOverdueInvoices(pagination);

    const response: ApiResponse<PaginatedResponse<Invoice>> = {
      success: true,
      data: result,
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
};

export const getInvoicesByOrder = async (
  req: Request<{ orderId: string }, {}, {}, PaginationParams>,
  res: Response<ApiResponse<PaginatedResponse<Invoice>>>,
  next: NextFunction
): Promise<void> => {
  try {
    const { orderId } = req.params;
    const { page = 1, limit = 10, sortBy = "createdAt", sortOrder = "desc" } = req.query;
    const pagination = { page: Number(page), limit: Number(limit), sortBy, sortOrder };
    
    const result = await invoiceService.getInvoicesByOrder(orderId, pagination);

    const response: ApiResponse<PaginatedResponse<Invoice>> = {
      success: true,
      data: result,
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
};

export const generateInvoiceFromOrder = async (
  req: Request<{ orderId: string }, {}, { dueDate?: Date }>,
  res: Response<ApiResponse<Invoice>>,
  next: NextFunction
): Promise<void> => {
  try {
    const { orderId } = req.params;
    const { dueDate } = req.body;

    const invoice = await invoiceService.generateInvoiceFromOrder(orderId, dueDate);

    const response: ApiResponse<Invoice> = {
      success: true,
      data: invoice,
      message: "Invoice generated from order successfully",
    };

    res.status(HttpStatus.CREATED).json(response);
  } catch (error) {
    next(error);
  }
};