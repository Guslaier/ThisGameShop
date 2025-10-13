import express from "express";
import { CartController } from "./controller.js";
import Authentication from "../authentication.js";
const { isAuthenticated } = Authentication;

const router = express.Router();

router.get("/", (req, res) => res.render("cart", { activePage: "cart" }));
router.get("/u-cart", isAuthenticated, CartController.getUserCart);
router.post("/add", isAuthenticated, CartController.addItem);
router.post("/remove", isAuthenticated, CartController.removeItem);
router.post("/update", isAuthenticated, CartController.updateItem);

export default router;
