import { Router } from "express";
import {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  getFeaturedProducts,
  getProductsByCategory,
  updateProductStock,
  searchProducts,
} from "../../../controllers/product/productController";
import { authenticate } from "../../../middleware/auth/authenticate";
import { authorize } from "../../../middleware/auth/authorize";
import { UserRole } from "@app/shared-types";

const router = Router();

// Public routes
router.get("/", getProducts);
router.get("/featured", getFeaturedProducts);
router.get("/search", searchProducts);
router.get("/category/:categoryId", getProductsByCategory);
router.get("/:id", getProductById);

// Protected routes (require authentication)
router.use(authenticate);

// Admin/Manager routes (require higher privileges)
router.post("/", authorize(UserRole.MANAGER, UserRole.SUPER_ADMIN), createProduct);
router.put("/:id", authorize(UserRole.MANAGER, UserRole.SUPER_ADMIN), updateProduct);
router.delete("/:id", authorize(UserRole.SUPER_ADMIN), deleteProduct);

// Stock management routes
router.patch("/:id/stock", authorize(UserRole.MANAGER, UserRole.SUPER_ADMIN), updateProductStock);

export default router;