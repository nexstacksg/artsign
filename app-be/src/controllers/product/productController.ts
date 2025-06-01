import { Request, Response, NextFunction } from "express";
import productService from "../../services/product/productService";
import { ApiError } from "../../middleware/error/errorHandler";
import {
  Product,
  ICreateProductService,
  IUpdateProductService,
  IProductFilterService,
  ErrorCode,
  HttpStatus,
  ApiResponse,
  PaginationParams,
  PaginatedResponse,
} from "@app/shared-types";

export const createProduct = async (
  req: Request<{}, {}, ICreateProductService>,
  res: Response<ApiResponse<Product>>,
  next: NextFunction
): Promise<void> => {
  try {
    const product = await productService.createProduct(req.body);

    const response: ApiResponse<Product> = {
      success: true,
      data: product,
      message: "Product created successfully",
    };

    res.status(HttpStatus.CREATED).json(response);
  } catch (error) {
    next(error);
  }
};

export const getProducts = async (
  req: Request<{}, {}, {}, PaginationParams & IProductFilterService>,
  res: Response<ApiResponse<PaginatedResponse<Product>>>,
  next: NextFunction
): Promise<void> => {
  try {
    const { page = 1, limit = 10, sortBy = "createdAt", sortOrder = "desc", ...filters } = req.query;
    
    const pagination = { page: Number(page), limit: Number(limit), sortBy, sortOrder };
    const result = await productService.getProducts(pagination, filters);

    const response: ApiResponse<PaginatedResponse<Product>> = {
      success: true,
      data: result,
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
};

export const getProductById = async (
  req: Request<{ id: string }>,
  res: Response<ApiResponse<Product>>,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const product = await productService.getProductById(id);

    if (!product) {
      throw new ApiError(
        "Product not found",
        HttpStatus.NOT_FOUND,
        ErrorCode.NOT_FOUND
      );
    }

    const response: ApiResponse<Product> = {
      success: true,
      data: product,
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
};

export const updateProduct = async (
  req: Request<{ id: string }, {}, IUpdateProductService>,
  res: Response<ApiResponse<Product>>,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const product = await productService.updateProduct(id, req.body);

    const response: ApiResponse<Product> = {
      success: true,
      data: product,
      message: "Product updated successfully",
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
};

export const deleteProduct = async (
  req: Request<{ id: string }>,
  res: Response<ApiResponse>,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    await productService.deleteProduct(id);

    const response: ApiResponse = {
      success: true,
      message: "Product deleted successfully",
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
};

export const getFeaturedProducts = async (
  req: Request<{}, {}, {}, { limit?: number }>,
  res: Response<ApiResponse<Product[]>>,
  next: NextFunction
): Promise<void> => {
  try {
    const { limit = 10 } = req.query;
    const products = await productService.getFeaturedProducts(Number(limit));

    const response: ApiResponse<Product[]> = {
      success: true,
      data: products,
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
};

export const getProductsByCategory = async (
  req: Request<{ categoryId: string }, {}, {}, PaginationParams>,
  res: Response<ApiResponse<PaginatedResponse<Product>>>,
  next: NextFunction
): Promise<void> => {
  try {
    const { categoryId } = req.params;
    const { page = 1, limit = 10, sortBy = "createdAt", sortOrder = "desc" } = req.query;
    
    const pagination = { page: Number(page), limit: Number(limit), sortBy, sortOrder };
    const result = await productService.getProductsByCategory(categoryId, pagination);

    const response: ApiResponse<PaginatedResponse<Product>> = {
      success: true,
      data: result,
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
};

export const updateProductStock = async (
  req: Request<{ id: string }, {}, { quantity: number; operation: "add" | "subtract" | "set" }>,
  res: Response<ApiResponse<Product>>,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const { quantity, operation } = req.body;

    const product = await productService.updateProductStock(id, quantity, operation);

    const response: ApiResponse<Product> = {
      success: true,
      data: product,
      message: "Product stock updated successfully",
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
};

export const searchProducts = async (
  req: Request<{}, {}, {}, { q: string } & PaginationParams>,
  res: Response<ApiResponse<PaginatedResponse<Product>>>,
  next: NextFunction
): Promise<void> => {
  try {
    const { q: query, page = 1, limit = 10, sortBy = "createdAt", sortOrder = "desc" } = req.query;
    
    if (!query) {
      throw new ApiError(
        "Search query is required",
        HttpStatus.BAD_REQUEST,
        ErrorCode.BAD_REQUEST
      );
    }

    const pagination = { page: Number(page), limit: Number(limit), sortBy, sortOrder };
    const result = await productService.searchProducts(query, pagination);

    const response: ApiResponse<PaginatedResponse<Product>> = {
      success: true,
      data: result,
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
};