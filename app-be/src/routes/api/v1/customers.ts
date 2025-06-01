import { Router } from "express";
import {
  createCustomer,
  getCustomers,
  getCustomerById,
  updateCustomer,
  deleteCustomer,
  getCustomerByUserId,
  getMyCustomerProfile,
  updateMyCustomerProfile,
} from "../../../controllers/customer/customerController";
import { authenticate } from "../../../middleware/auth/authenticate";
import { authorize } from "../../../middleware/auth/authorize";
import { UserRole } from "@app/shared-types";

const router = Router();

// Public routes
router.post("/", createCustomer);

// Protected routes (require authentication)
router.use(authenticate);

// Customer self-service routes
router.get("/me", getMyCustomerProfile);
router.put("/me", updateMyCustomerProfile);

// Admin/Manager routes (require higher privileges)
router.get("/", authorize(UserRole.MANAGER, UserRole.SUPER_ADMIN), getCustomers);
router.get("/:id", authorize(UserRole.MANAGER, UserRole.SUPER_ADMIN), getCustomerById);
router.put("/:id", authorize(UserRole.MANAGER, UserRole.SUPER_ADMIN), updateCustomer);
router.delete("/:id", authorize(UserRole.SUPER_ADMIN), deleteCustomer);

// Get customer by user ID (useful for order processing)
router.get("/user/:userId", authorize(UserRole.MANAGER, UserRole.SUPER_ADMIN), getCustomerByUserId);

export default router;