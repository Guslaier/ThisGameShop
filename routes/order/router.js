import express from "express";
import { OrderController } from "./controller.js";
import Authentication from "../authentication.js";
const { isAuthenticated,authorize } = Authentication;

const router = express.Router();

// ✅ Order routes
router.post("/checkout", isAuthenticated, OrderController.checkout);
router.get("/detail/:id", isAuthenticated, OrderController.listDetail);
router.get("/all", authorize(["admin", "staff"]), OrderController.listAll);
router.put("/update-status/:id", authorize(["admin", "staff"]), OrderController.updataStatus);
router.post("/payment/confirm", isAuthenticated, OrderController.paymentConfirm);
router.delete("/delete/:id", authorize(["admin", "staff"]), OrderController.deleteOrder);

export default router;
