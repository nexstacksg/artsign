import { Router } from "express";
import {
  createQuotation,
  getQuotations,
  getQuotationById,
  updateQuotation,
  deleteQuotation,
  getMyQuotations,
  getQuotationByNumber,
  updateQuotationStatus,
  sendQuotation,
  acceptQuotation,
  rejectQuotation,
  convertToOrder,
} from "../../../controllers/quotation/quotationController";
import { authenticate } from "../../../middleware/auth/authenticate";
import { authorize, authorizeSelfOrManager } from "../../../middleware/auth/authorize";
import { UserRole } from "@app/shared-types";

const router = Router();

// Protected routes (require authentication)
router.use(authenticate);

// Customer routes
router.get("/my-quotations", getMyQuotations);
router.patch("/:id/accept", acceptQuotation); // Customers can accept their own quotations
router.patch("/:id/reject", rejectQuotation); // Customers can reject their own quotations

// Admin/Manager routes (require higher privileges)
router.post("/", authorize(UserRole.MANAGER, UserRole.SUPER_ADMIN), createQuotation);
router.get("/", authorize(UserRole.MANAGER, UserRole.SUPER_ADMIN), getQuotations);
router.get("/:id", authorizeSelfOrManager("customerId"), getQuotationById);
router.get("/number/:quotationNumber", authorize(UserRole.MANAGER, UserRole.SUPER_ADMIN), getQuotationByNumber);
router.put("/:id", authorize(UserRole.MANAGER, UserRole.SUPER_ADMIN), updateQuotation);
router.delete("/:id", authorize(UserRole.SUPER_ADMIN), deleteQuotation);

// Quotation management routes
router.patch("/:id/status", authorize(UserRole.MANAGER, UserRole.SUPER_ADMIN), updateQuotationStatus);
router.patch("/:id/send", authorize(UserRole.MANAGER, UserRole.SUPER_ADMIN), sendQuotation);
router.post("/:id/convert-to-order", authorize(UserRole.MANAGER, UserRole.SUPER_ADMIN), convertToOrder);

export default router;