import prisma from "../../database/client";
import { ApiError } from "../../middleware/error/errorHandler";
import {
  Product,
  ICreateProductService,
  IUpdateProductService,
  IProductFilterService,
  ErrorCode,
  HttpStatus,
  PaginationParams,
  PaginatedResponse,
} from "@app/shared-types";

export class ProductService {
  private mapToProduct(product: any): Product {
    return {
      id: product.id,
      name: product.name,
      description: product.description,
      category: product.category?.name || "",
      basePrice: product.price,
      stock: product.currentStock,
      sku: product.sku,
      images: product.imageUrls ? JSON.parse(product.imageUrls) : [],
      specifications: product.specifications ? JSON.parse(product.specifications) : {},
      isActive: product.status === "ACTIVE",
      pricingModel: product.pricingModel,
      status: product.status,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
    };
  }

  async createProduct(data: ICreateProductService): Promise<Product> {
    // Verify category exists
    const category = await prisma.category.findUnique({
      where: { id: data.categoryId },
    });

    if (!category) {
      throw new ApiError(
        "Category not found",
        HttpStatus.NOT_FOUND,
        ErrorCode.NOT_FOUND
      );
    }

    // Generate SKU if not provided
    const sku = `PRD-${Date.now()}`;

    const product = await prisma.product.create({
      data: {
        name: data.name,
        description: data.description,
        categoryId: data.categoryId,
        price: data.price,
        pricingModel: data.pricingModel || "fixed",
        trackStock: data.trackStock || false,
        currentStock: data.currentStock || 0,
        lowStockThreshold: data.lowStockThreshold || 10,
        sku,
        imageUrls: JSON.stringify(data.imageUrls || []),
        specifications: JSON.stringify(data.specifications || {}),
        features: JSON.stringify(data.features || []),
        colorOptions: JSON.stringify(data.colorOptions || []),
        sizeOptions: JSON.stringify(data.sizeOptions || []),
      },
      include: {
        category: true,
      },
    });

    return this.mapToProduct(product);
  }

  async getProducts(
    pagination: PaginationParams,
    filters: IProductFilterService
  ): Promise<PaginatedResponse<Product>> {
    const { page = 1, limit = 10, sortBy = "createdAt", sortOrder = "desc" } = pagination;
    const skip = (page - 1) * limit;

    const where: any = {};

    // Apply filters
    if (filters.categoryId) {
      where.categoryId = filters.categoryId;
    }
    if (filters.status) {
      where.status = filters.status;
    }
    if (filters.featured !== undefined) {
      where.featured = filters.featured;
    }
    if (filters.minPrice !== undefined) {
      where.price = { gte: filters.minPrice };
    }
    if (filters.maxPrice !== undefined) {
      where.price = { ...where.price, lte: filters.maxPrice };
    }
    if (filters.inStock) {
      where.currentStock = { gt: 0 };
    }
    if (filters.search) {
      where.OR = [
        { name: { contains: filters.search, mode: "insensitive" } },
        { description: { contains: filters.search, mode: "insensitive" } },
        { sku: { contains: filters.search, mode: "insensitive" } },
      ];
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          category: true,
        },
      }),
      prisma.product.count({ where }),
    ]);

    return {
      data: products.map(this.mapToProduct),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async getProductById(id: string): Promise<Product | null> {
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
      },
    });

    return product ? this.mapToProduct(product) : null;
  }

  async updateProduct(id: string, data: IUpdateProductService): Promise<Product> {
    const existingProduct = await prisma.product.findUnique({
      where: { id },
    });

    if (!existingProduct) {
      throw new ApiError(
        "Product not found",
        HttpStatus.NOT_FOUND,
        ErrorCode.NOT_FOUND
      );
    }

    // Verify category exists if updating categoryId
    if (data.categoryId) {
      const category = await prisma.category.findUnique({
        where: { id: data.categoryId },
      });

      if (!category) {
        throw new ApiError(
          "Category not found",
          HttpStatus.NOT_FOUND,
          ErrorCode.NOT_FOUND
        );
      }
    }

    const updateData: any = { ...data };

    // Handle JSON fields
    if (data.imageUrls) {
      updateData.imageUrls = JSON.stringify(data.imageUrls);
    }
    if (data.specifications) {
      updateData.specifications = JSON.stringify(data.specifications);
    }
    if (data.features) {
      updateData.features = JSON.stringify(data.features);
    }
    if (data.colorOptions) {
      updateData.colorOptions = JSON.stringify(data.colorOptions);
    }
    if (data.sizeOptions) {
      updateData.sizeOptions = JSON.stringify(data.sizeOptions);
    }

    const product = await prisma.product.update({
      where: { id },
      data: updateData,
      include: {
        category: true,
      },
    });

    return this.mapToProduct(product);
  }

  async deleteProduct(id: string): Promise<void> {
    const existingProduct = await prisma.product.findUnique({
      where: { id },
    });

    if (!existingProduct) {
      throw new ApiError(
        "Product not found",
        HttpStatus.NOT_FOUND,
        ErrorCode.NOT_FOUND
      );
    }

    await prisma.product.delete({
      where: { id },
    });
  }

  async getFeaturedProducts(limit: number = 10): Promise<Product[]> {
    const products = await prisma.product.findMany({
      where: {
        featured: true,
        status: "ACTIVE",
      },
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        category: true,
      },
    });

    return products.map(this.mapToProduct);
  }

  async getProductsByCategory(
    categoryId: string,
    pagination: PaginationParams
  ): Promise<PaginatedResponse<Product>> {
    const { page = 1, limit = 10, sortBy = "createdAt", sortOrder = "desc" } = pagination;
    const skip = (page - 1) * limit;

    // Verify category exists
    const category = await prisma.category.findUnique({
      where: { id: categoryId },
    });

    if (!category) {
      throw new ApiError(
        "Category not found",
        HttpStatus.NOT_FOUND,
        ErrorCode.NOT_FOUND
      );
    }

    const where = { categoryId, status: "ACTIVE" };

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          category: true,
        },
      }),
      prisma.product.count({ where }),
    ]);

    return {
      data: products.map(this.mapToProduct),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async updateProductStock(
    id: string,
    quantity: number,
    operation: "add" | "subtract" | "set"
  ): Promise<Product> {
    const existingProduct = await prisma.product.findUnique({
      where: { id },
    });

    if (!existingProduct) {
      throw new ApiError(
        "Product not found",
        HttpStatus.NOT_FOUND,
        ErrorCode.NOT_FOUND
      );
    }

    if (!existingProduct.trackStock) {
      throw new ApiError(
        "Stock tracking is not enabled for this product",
        HttpStatus.BAD_REQUEST,
        ErrorCode.BAD_REQUEST
      );
    }

    let newStock: number;

    switch (operation) {
      case "add":
        newStock = existingProduct.currentStock + quantity;
        break;
      case "subtract":
        newStock = existingProduct.currentStock - quantity;
        if (newStock < 0) {
          throw new ApiError(
            "Insufficient stock",
            HttpStatus.BAD_REQUEST,
            ErrorCode.BAD_REQUEST
          );
        }
        break;
      case "set":
        newStock = quantity;
        break;
      default:
        throw new ApiError(
          "Invalid operation",
          HttpStatus.BAD_REQUEST,
          ErrorCode.BAD_REQUEST
        );
    }

    const product = await prisma.product.update({
      where: { id },
      data: { currentStock: newStock },
      include: {
        category: true,
      },
    });

    return this.mapToProduct(product);
  }

  async searchProducts(
    query: string,
    pagination: PaginationParams
  ): Promise<PaginatedResponse<Product>> {
    const { page = 1, limit = 10, sortBy = "createdAt", sortOrder = "desc" } = pagination;
    const skip = (page - 1) * limit;

    const where = {
      OR: [
        { name: { contains: query, mode: "insensitive" as const } },
        { description: { contains: query, mode: "insensitive" as const } },
        { sku: { contains: query, mode: "insensitive" as const } },
      ],
      status: "ACTIVE",
    };

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          category: true,
        },
      }),
      prisma.product.count({ where }),
    ]);

    return {
      data: products.map(this.mapToProduct),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async checkLowStock(): Promise<Product[]> {
    const products = await prisma.product.findMany({
      where: {
        trackStock: true,
        status: "ACTIVE",
        currentStock: {
          lte: prisma.product.fields.lowStockThreshold,
        },
      },
      include: {
        category: true,
      },
    });

    return products.map(this.mapToProduct);
  }
}

export default new ProductService();