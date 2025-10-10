// 📁 routes/admin.js
import express from "express";
import ProvidersAcc from "../account/service.js";
import ProvidersStock from "../stock/service.js";
import Providers from "../service.js";
import Authentication from "../authentication.js";

const { authorize } = Authentication;
const router = express.Router();

const accProviders = new ProvidersAcc();
const stockProviders = new ProvidersStock();
const appProviders = new Providers();

// ===============================
// 🧭 Shared Admin/Staff Dashboard Pages
// ===============================

// ✅ หน้า Dashboard (admin + staff ใช้ร่วมกัน)
router.get("/", authorize(["admin", "staff"]), (req, res) => {
  res.render("admin/index", {
    title: "Dashboard",
    user: req.session.user,
  });
});

// ✅ หน้า "ผู้ใช้" (admin + staff ดูได้)
router.get("/user", authorize(["admin", "staff"]), (req, res) => {
  res.render("admin/user", {
    title: "User Management",
    user: req.session.user,
  });
});

// ✅ หน้า "เกม"
router.get("/games", authorize(["admin", "staff"]), (req, res) => {
  res.render("admin/games", {
    title: "Game Management",
    user: req.session.user,
  });
});

// ✅ หน้า "คำสั่งซื้อ"
router.get("/orders", authorize(["admin", "staff"]), (req, res) => {
  res.render("admin/orders", {
    title: "Orders",
    user: req.session.user,
  });
});

// ✅ หน้า "รายงาน"
router.get("/reports", authorize(["admin", "staff"]), (req, res) => {
  res.render("admin/reports", {
    title: "Reports",
    user: req.session.user,
  });
});

// ===============================
// 👤 USER MANAGEMENT (admin/staff)
// ===============================

// ✅ ดึงรายชื่อผู้ใช้ (admin + staff ดูได้)
router.get("/api/users", authorize(["admin", "staff"]), async (req, res) => {
  try {
    const users = await accProviders.listUsers();
    res.json({ status: true, data: users.rows });
  } catch (err) {
    res.status(500).json({ status: false, error: err.message });
  }
});

// ✅ เปิด/ปิดการใช้งานผู้ใช้ (เฉพาะ admin)
router.put("/api/users/:id/active", authorize(["admin"]), async (req, res) => {
  const { id } = req.params;
  const { is_active } = req.body;
  try {
    const updated = await accProviders.setUserActiveStatus(id, is_active);
    res.json({ status: true, data: updated[0] });
  } catch (err) {
    res.status(500).json({ status: false, error: err.message });
  }
});

// ✅ ลบผู้ใช้ (เฉพาะ admin)
router.delete("/api/users/:id", authorize(["admin"]), async (req, res) => {
  const { id } = req.params;
  try {
    const deleted = await accProviders.deleteUser(id);
    res.json({ status: true, data: deleted });
  } catch (err) {
    res.status(500).json({ status: false, error: err.message });
  }
});

// ===============================
// 🎮 GAME MANAGEMENT (admin/staff)
// ===============================

// ✅ ดึงข้อมูลเกมทั้งหมด
router.get("/api/games", authorize(["admin", "staff"]), async (req, res) => {
  try {
    const result = await stockProviders.listGames();
    res.json({ status: true, data: result.rows });
  } catch (err) {
    res.status(500).json({ status: false, error: err.message });
  }
});

// ✅ เพิ่มเกม (admin, staff)
router.post("/api/games", authorize(["admin", "staff"]), async (req, res) => {
  try {
    const { title, price, stock } = req.body;
    const newGame = await stockProviders.createGame(title, price, stock);
    res.json({ status: true, data: newGame });
  } catch (err) {
    res.status(500).json({ status: false, error: err.message });
  }
});

// ✅ เพิ่ม/ลด stock (admin, staff)
router.put("/api/games/:id/stock", authorize(["admin", "staff"]), async (req, res) => {
  const { id } = req.params;
  const { action } = req.body;
  if (!["increase", "decrease"].includes(action))
    return res.status(400).json({ status: false, error: "Invalid action" });

  try {
    const updated = await stockProviders.updateStock(id, action);
    res.json({ status: true, data: updated[0] });
  } catch (err) {
    res.status(500).json({ status: false, error: err.message });
  }
});

// ✅ ลบเกม (เฉพาะ admin)
router.delete("/api/games/:id", authorize(["admin"]), async (req, res) => {
  const { id } = req.params;
  try {
    const deleted = await stockProviders.deleteGame(id);
    res.json({ status: true, data: deleted });
  } catch (err) {
    res.status(500).json({ status: false, error: err.message });
  }
});

export default router;
