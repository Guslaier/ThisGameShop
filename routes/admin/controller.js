// admin.js
import express from "express";
import ProvidersAcc from "../account/service.js";
import Providersstock from "../stock/service.js";
import Providers from "../service.js";
const router = express.Router();

// ✅ แสดงหน้า admin (เฉพาะ role = admin)
router.get("/", (req, res) => {
  res.render("admin/index");
});

router.get("/user", (req, res) => {
  res.render("admin/user");
});

router.get("/Games", (req, res) => { 
  res.render("admin/games");
});

router.get("/Orders", (req, res) => {
  res.render("admin/orders");
});

router.get("/Reports", (req, res) => {
  res.render("admin/reports");
});




// ✅ ดึงรายชื่อผู้ใช้
router.get("/api/users", async (req, res) => {
  if (req.session.role !== "admin") {
    return res.status(403).json({ error: "Access denied" });
  }
  const users = await ProvidersAcc.listUsers();
  res.json(users);
});

// ✅ เปิด/ปิดการใช้งานผู้ใช้
router.put("/api/users/:id/active", async (req, res) => {
  const { id } = req.params;
  const { is_active } = req.body;
  const updated = await ProvidersAcc.setUserActiveStatus(id, is_active);
  res.json(updated[0]);
});

// ✅ ดึงข้อมูลเกม
router.get("/api/games", async (req, res) => {
  const result = await Providersstock.listGames(); // ← สร้าง method นี้ใน service
  res.json(result);
});

// ✅ เพิ่ม/ลด stock
router.put("/api/games/:id/stock", async (req, res) => {
  const { id } = req.params;
  const { action } = req.body;
  const updated = await Providersstock.updateStock(id, action);
  res.json(updated[0]);
}); 

export default router;
