import { Request, Response, NextFunction } from "express";
import quotationService from "../../services/quotation/quotationService";
import { AuthRequest } from "../../middleware/auth/authenticate";
import { ApiError } from "../../middleware/error/errorHandler";
import {
  Quotation,
  QuotationStatus,
  ICreateQuotationService,
  IUpdateQuotationService,
  IQuotationFilterService,
  ErrorCode,
  HttpStatus,
  ApiResponse,
  PaginationParams,
  PaginatedResponse,
} from "@app/shared-types";

export const createQuotation = async (
  req: Request<{}, {}, ICreateQuotationService>,
  res: Response<ApiResponse<Quotation>>,
  next: NextFunction
): Promise<void> => {
  try {
    const quotation = await quotationService.createQuotation(req.body);

    const response: ApiResponse<Quotation> = {
      success: true,
      data: quotation,
      message: "Quotation created successfully",
    };

    res.status(HttpStatus.CREATED).json(response);
  } catch (error) {
    next(error);
  }
};

export const getQuotations = async (
  req: Request<{}, {}, {}, PaginationParams & IQuotationFilterService>,
  res: Response<ApiResponse<PaginatedResponse<Quotation>>>,
  next: NextFunction
): Promise<void> => {
  try {
    const { page = 1, limit = 10, sortBy = "createdAt", sortOrder = "desc", ...filters } = req.query;
    
    const pagination = { page: Number(page), limit: Number(limit), sortBy, sortOrder };
    const result = await quotationService.getQuotations(pagination, filters);

    const response: ApiResponse<PaginatedResponse<Quotation>> = {
      success: true,
      data: result,
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
};

export const getQuotationById = async (
  req: Request<{ id: string }>,
  res: Response<ApiResponse<Quotation>>,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const quotation = await quotationService.getQuotationById(id);

    if (!quotation) {
      throw new ApiError(
        "Quotation not found",
        HttpStatus.NOT_FOUND,
        ErrorCode.NOT_FOUND
      );
    }

    const response: ApiResponse<Quotation> = {
      success: true,
      data: quotation,
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
};

export const updateQuotation = async (
  req: Request<{ id: string }, {}, IUpdateQuotationService>,
  res: Response<ApiResponse<Quotation>>,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const quotation = await quotationService.updateQuotation(id, req.body);

    const response: ApiResponse<Quotation> = {
      success: true,
      data: quotation,
      message: "Quotation updated successfully",
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
};

export const deleteQuotation = async (
  req: Request<{ id: string }>,
  res: Response<ApiResponse>,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    await quotationService.deleteQuotation(id);

    const response: ApiResponse = {
      success: true,
      message: "Quotation deleted successfully",
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
};

export const getMyQuotations = async (
  req: AuthRequest<{}, {}, {}, PaginationParams>,
  res: Response<ApiResponse<PaginatedResponse<Quotation>>>,
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
    
    const result = await quotationService.getUserQuotations(req.user.id, pagination);

    const response: ApiResponse<PaginatedResponse<Quotation>> = {
      success: true,
      data: result,
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
};

export const getQuotationByNumber = async (
  req: Request<{ quotationNumber: string }>,
  res: Response<ApiResponse<Quotation>>,
  next: NextFunction
): Promise<void> => {
  try {
    const { quotationNumber } = req.params;
    const quotation = await quotationService.getQuotationByNumber(quotationNumber);

    if (!quotation) {
      throw new ApiError(
        "Quotation not found",
        HttpStatus.NOT_FOUND,
        ErrorCode.NOT_FOUND
      );
    }

    const response: ApiResponse<Quotation> = {
      success: true,
      data: quotation,
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
};

export const updateQuotationStatus = async (
  req: Request<{ id: string }, {}, { status: QuotationStatus }>,
  res: Response<ApiResponse<Quotation>>,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const quotation = await quotationService.updateQuotationStatus(id, status);

    const response: ApiResponse<Quotation> = {
      success: true,
      data: quotation,
      message: "Quotation status updated successfully",
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
};

export const sendQuotation = async (
  req: Request<{ id: string }>,
  res: Response<ApiResponse<Quotation>>,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const quotation = await quotationService.sendQuotation(id);

    const response: ApiResponse<Quotation> = {
      success: true,
      data: quotation,
      message: "Quotation sent successfully",
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
};

export const acceptQuotation = async (
  req: Request<{ id: string }>,
  res: Response<ApiResponse<Quotation>>,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const quotation = await quotationService.acceptQuotation(id);

    const response: ApiResponse<Quotation> = {
      success: true,
      data: quotation,
      message: "Quotation accepted successfully",
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
};

export const rejectQuotation = async (
  req: Request<{ id: string }>,
  res: Response<ApiResponse<Quotation>>,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const quotation = await quotationService.rejectQuotation(id);

    const response: ApiResponse<Quotation> = {
      success: true,
      data: quotation,
      message: "Quotation rejected",
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
};

export const convertToOrder = async (
  req: Request<{ id: string }>,
  res: Response<ApiResponse<{ quotation: Quotation; orderId: string }>>,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const result = await quotationService.convertToOrder(id);

    const response: ApiResponse<{ quotation: Quotation; orderId: string }> = {
      success: true,
      data: result,
      message: "Quotation converted to order successfully",
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
};