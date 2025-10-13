import express from "express";
import { OrderController } from "./controller.js";
import Authentication from "../authentication.js";
const { isAuthenticated } = Authentication;

const router = express.Router();

// ✅ Order routes
router.post("/checkout", isAuthenticated, OrderController.checkout);
router.get("/detail/:id", isAuthenticated, OrderController.listDetail);
router.get("/all", isAuthenticated, OrderController.listAll);
router.put("/update-status/:id", isAuthenticated, OrderController.listAll);
router.post("/payment/confirm", isAuthenticated, OrderController.paymentConfirm);

export default router;
