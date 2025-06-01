import { Router } from "express";
import {
  createOrder,
  getOrders,
  getOrderById,
  updateOrder,
  deleteOrder,
  getMyOrders,
  getOrderByNumber,
  updateOrderStatus,
  updatePaymentStatus,
  addTrackingNumber,
  cancelOrder,
} from "../../../controllers/order/orderController";
import { authenticate } from "../../../middleware/auth/authenticate";
import { authorize, authorizeSelfOrManager } from "../../../middleware/auth/authorize";
import { UserRole } from "@app/shared-types";

const router = Router();

// Protected routes (require authentication)
router.use(authenticate);

// Customer routes
router.post("/", createOrder);
router.get("/my-orders", getMyOrders);

// Admin/Manager routes (require higher privileges)
router.get("/", authorize(UserRole.MANAGER, UserRole.SUPER_ADMIN), getOrders);
router.get("/:id", authorizeSelfOrManager("customerId"), getOrderById);
router.get("/number/:orderNumber", authorize(UserRole.MANAGER, UserRole.SUPER_ADMIN), getOrderByNumber);
router.put("/:id", authorize(UserRole.MANAGER, UserRole.SUPER_ADMIN), updateOrder);
router.delete("/:id", authorize(UserRole.SUPER_ADMIN), deleteOrder);

// Order management routes
router.patch("/:id/status", authorize(UserRole.MANAGER, UserRole.SUPER_ADMIN), updateOrderStatus);
router.patch("/:id/payment-status", authorize(UserRole.MANAGER, UserRole.SUPER_ADMIN), updatePaymentStatus);
router.patch("/:id/tracking", authorize(UserRole.MANAGER, UserRole.SUPER_ADMIN), addTrackingNumber);
router.patch("/:id/cancel", authorize(UserRole.MANAGER, UserRole.SUPER_ADMIN), cancelOrder);

export default router;