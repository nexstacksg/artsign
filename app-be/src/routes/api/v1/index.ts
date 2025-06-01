import { Router } from "express";
import authRoutes from "./auth";
import userRoutes from "./users";
import customerRoutes from "./customers";
import productRoutes from "./products";
import orderRoutes from "./orders";
import invoiceRoutes from "./invoices";
import quotationRoutes from "./quotations";
import testRoutes from "./test";

const router = Router();

// Welcome message
router.get("/", (_req, res) => {
  res.json({
    message: "ArtSign API v1",
    endpoints: {
      auth: "/api/v1/auth",
      users: "/api/v1/users",
      customers: "/api/v1/customers",
      products: "/api/v1/products",
      orders: "/api/v1/orders",
      invoices: "/api/v1/invoices",
      quotations: "/api/v1/quotations",
      test: "/api/v1/test",
    },
  });
});

// Route modules
router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/customers", customerRoutes);
router.use("/products", productRoutes);
router.use("/orders", orderRoutes);
router.use("/invoices", invoiceRoutes);
router.use("/quotations", quotationRoutes);
router.use("/test", testRoutes);

export default router;
