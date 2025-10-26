import express from "express";
import { LibraryController } from "./controller.js";
import Authentication from "../authentication.js";
const { isAuthenticated, authorize } = Authentication;

const router = express.Router();

// 🌐 หน้า My Library ของผู้ใช้
router.get("/", isAuthenticated, LibraryController.page);

// 📦 API ของผู้ใช้
router.get("/api/library", isAuthenticated, LibraryController.list);
router.get("/api/:id", isAuthenticated, LibraryController.detail);

// 👑 สำหรับ admin/staff
router.get("/api/all", authorize(["admin", "staff"]), LibraryController.listAll);

export default router;
