import { Router } from "express";
import {
  createInvoice,
  getInvoices,
  getInvoiceById,
  updateInvoice,
  deleteInvoice,
  getMyInvoices,
  getInvoiceByNumber,
  markAsPaid,
  markAsUnpaid,
  getOverdueInvoices,
  getInvoicesByOrder,
  generateInvoiceFromOrder,
} from "../../../controllers/invoice/invoiceController";
import { authenticate } from "../../../middleware/auth/authenticate";
import { authorize, authorizeSelfOrManager } from "../../../middleware/auth/authorize";
import { UserRole } from "@app/shared-types";

const router = Router();

// Protected routes (require authentication)
router.use(authenticate);

// Customer routes
router.get("/my-invoices", getMyInvoices);

// Admin/Manager routes (require higher privileges)
router.post("/", authorize(UserRole.MANAGER, UserRole.SUPER_ADMIN), createInvoice);
router.get("/", authorize(UserRole.MANAGER, UserRole.SUPER_ADMIN), getInvoices);
router.get("/overdue", authorize(UserRole.MANAGER, UserRole.SUPER_ADMIN), getOverdueInvoices);
router.get("/:id", authorizeSelfOrManager("customerId"), getInvoiceById);
router.get("/number/:invoiceNumber", authorize(UserRole.MANAGER, UserRole.SUPER_ADMIN), getInvoiceByNumber);
router.get("/order/:orderId", authorize(UserRole.MANAGER, UserRole.SUPER_ADMIN), getInvoicesByOrder);
router.put("/:id", authorize(UserRole.MANAGER, UserRole.SUPER_ADMIN), updateInvoice);
router.delete("/:id", authorize(UserRole.SUPER_ADMIN), deleteInvoice);

// Invoice management routes
router.patch("/:id/mark-paid", authorize(UserRole.MANAGER, UserRole.SUPER_ADMIN), markAsPaid);
router.patch("/:id/mark-unpaid", authorize(UserRole.MANAGER, UserRole.SUPER_ADMIN), markAsUnpaid);
router.post("/generate-from-order/:orderId", authorize(UserRole.MANAGER, UserRole.SUPER_ADMIN), generateInvoiceFromOrder);

export default router;