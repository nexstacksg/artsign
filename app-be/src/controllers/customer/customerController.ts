import { Request, Response, NextFunction } from "express";
import customerService from "../../services/customer/customerService";
import { AuthRequest } from "../../middleware/auth/authenticate";
import { ApiError } from "../../middleware/error/errorHandler";
import {
  ICreateCustomer,
  IUpdateCustomer,
  ICustomerFilter,
  ErrorCode,
  HttpStatus,
  ApiResponse,
  PaginationParams,
  PaginatedResponse,
  ICustomer,
} from "@app/shared-types";

export const createCustomer = async (
  req: Request<{}, {}, ICreateCustomer>,
  res: Response<ApiResponse<ICustomer>>,
  next: NextFunction
): Promise<void> => {
  try {
    const customer = await customerService.createCustomer(req.body);

    const response: ApiResponse<ICustomer> = {
      success: true,
      data: customer,
      message: "Customer created successfully",
    };

    res.status(HttpStatus.CREATED).json(response);
  } catch (error) {
    next(error);
  }
};

export const getCustomers = async (
  req: Request<{}, {}, {}, PaginationParams & ICustomerFilter>,
  res: Response<ApiResponse<PaginatedResponse<ICustomer>>>,
  next: NextFunction
): Promise<void> => {
  try {
    const { page = 1, limit = 10, sortBy = "createdAt", sortOrder = "desc", ...filters } = req.query;
    
    const pagination = { page: Number(page), limit: Number(limit), sortBy, sortOrder };
    const result = await customerService.getCustomers(pagination, filters);

    const response: ApiResponse<PaginatedResponse<ICustomer>> = {
      success: true,
      data: result,
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
};

export const getCustomerById = async (
  req: Request<{ id: string }>,
  res: Response<ApiResponse<ICustomer>>,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const customer = await customerService.getCustomerById(id);

    if (!customer) {
      throw new ApiError(
        "Customer not found",
        HttpStatus.NOT_FOUND,
        ErrorCode.NOT_FOUND
      );
    }

    const response: ApiResponse<ICustomer> = {
      success: true,
      data: customer,
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
};

export const updateCustomer = async (
  req: Request<{ id: string }, {}, IUpdateCustomer>,
  res: Response<ApiResponse<ICustomer>>,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const customer = await customerService.updateCustomer(id, req.body);

    const response: ApiResponse<ICustomer> = {
      success: true,
      data: customer,
      message: "Customer updated successfully",
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
};

export const deleteCustomer = async (
  req: Request<{ id: string }>,
  res: Response<ApiResponse>,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    await customerService.deleteCustomer(id);

    const response: ApiResponse = {
      success: true,
      message: "Customer deleted successfully",
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
};

export const getCustomerByUserId = async (
  req: Request<{ userId: string }>,
  res: Response<ApiResponse<ICustomer>>,
  next: NextFunction
): Promise<void> => {
  try {
    const { userId } = req.params;
    const customer = await customerService.getCustomerByUserId(userId);

    if (!customer) {
      throw new ApiError(
        "Customer profile not found",
        HttpStatus.NOT_FOUND,
        ErrorCode.NOT_FOUND
      );
    }

    const response: ApiResponse<ICustomer> = {
      success: true,
      data: customer,
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
};

export const getMyCustomerProfile = async (
  req: AuthRequest,
  res: Response<ApiResponse<ICustomer>>,
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

    const customer = await customerService.getCustomerByUserId(req.user.id);

    if (!customer) {
      throw new ApiError(
        "Customer profile not found",
        HttpStatus.NOT_FOUND,
        ErrorCode.NOT_FOUND
      );
    }

    const response: ApiResponse<ICustomer> = {
      success: true,
      data: customer,
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
};

export const updateMyCustomerProfile = async (
  req: AuthRequest<{}, {}, IUpdateCustomer>,
  res: Response<ApiResponse<ICustomer>>,
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

    const customer = await customerService.updateCustomerByUserId(req.user.id, req.body);

    const response: ApiResponse<ICustomer> = {
      success: true,
      data: customer,
      message: "Customer profile updated successfully",
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
};