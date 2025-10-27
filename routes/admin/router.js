// 📁 /routes/admin/router.js
import express from "express";
import { AdminController } from "./controller.js";
import Authentication from "../authentication.js";
const { authorize } = Authentication;

const router = express.Router();

// ====== PAGES ======
router.get("/", authorize(["admin", "staff"]), AdminController.index);
router.get("/user", authorize(["admin", "staff"]), AdminController.usersPage);
router.get("/games", authorize(["admin", "staff"]), AdminController.gamesPage);
router.get("/orders", authorize(["admin", "staff"]), AdminController.ordersPage);
router.get("/reports", authorize(["admin", "staff"]), AdminController.reportsPage);

// ====== USERS ======
router.get("/api/users", authorize(["admin", "staff"]), AdminController.listUsers);
router.put("/api/users/:id/active", authorize(["admin"]), AdminController.setUserActive);
router.delete("/api/users/:id", authorize(["admin"]), AdminController.deleteUser);

// ====== GAMES ======
router.get("/api/games", authorize(["admin", "staff"]), AdminController.listGames);
router.post("/api/games", authorize(["admin", "staff"]), AdminController.createGame);
router.put("/api/games/:id/stock", authorize(["admin", "staff"]), AdminController.updateStock);
router.delete("/api/games/:id", authorize(["admin"]), AdminController.deleteGame);

// ====== REPORTS ======
router.get("/stats/purchases", authorize(["admin", "staff"]), AdminController.getStats);

export default router;
