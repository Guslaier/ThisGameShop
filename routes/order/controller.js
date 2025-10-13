// routes/order/controller.js
import OrderService from "./service.js";
import db from "../databace/db.js";

const service = new OrderService();

// ✅ ฟังก์ชันสร้าง Fake Key (เหมือนของคุณ)
function generateFakeKey(title) {
  const part = () => Math.random().toString(36).substring(2, 6).toUpperCase();
  const short = title.replace(/\s+/g, '').substring(0, 4).toUpperCase();
  return `${short}-${part()}-${part()}`;
}

export const OrderController = {
  // =========================================================
  // 🧾 สร้างคำสั่งซื้อจากตะกร้า
  // =========================================================
  async checkout(req, res) {
    try {
      const { items } = req.body;
      const user_id = req.session.user?.id;

      if (!user_id)
        return res.status(401).json({ status: false, message: "Unauthorized" });

      if (!items || !Array.isArray(items) || items.length === 0)
        return res.status(400).json({ status: false, message: "No items selected" });

      const result = await service.createOrderFromCart(user_id, items);

      res.json({
        status: true,
        message: "Order created successfully",
        order_no: result.order_no,
        total: (result.total_cents / 100).toFixed(2),
        order_id: result.order_id
      });
    } catch (error) {
      console.error("❌ Checkout error:", error);
      res.status(500).json({ status: false, message: error.message });
    }
  },

  // =========================================================
  // 📋 ดึงรายการออเดอร์ของผู้ใช้
  // =========================================================
  async listByUser(req, res) {
    try {
      const result = await service.listOrdersByUser(req.session.user.id);
      res.json({ status: true, data: result.rows });
    } catch (err) {
      res.status(500).json({ status: false, message: err.message });
    }
  },

  // =========================================================
  // 📦 ดึงรายละเอียดออเดอร์
  // =========================================================
  async listDetail(req, res) {
    try {
      const { id } = req.params;
      const result = await service.getOrderDetail(id);
      if (!result) return res.status(404).json({ status: false, message: "Order not found" });

      res.json({ status: true, data: result });
    } catch (err) {
      console.error("❌ Order Detail Error:", err);
      res.status(500).json({ status: false, message: err.message });
    }
  },

  // =========================================================
  // 🧾 ดึงรายการออเดอร์ทั้งหมด (Admin)
  // =========================================================
  async listAll(req, res) {
    try {
      const result = await service.listOrders();
      res.json({ status: true, data: result.rows });
    } catch (err) {
      console.error("❌ ListAll error:", err);
      res.status(500).json({ status: false, message: err.message });
    }
  },

  // =========================================================
  // 💳 ยืนยันการชำระเงิน
  // =========================================================
  async paymentConfirm(req, res) {
    const { order_id } = req.body;
    const user_id = req.session.user.id;
    try {
      // ตรวจสอบว่า order เป็นของผู้ใช้คนนี้
      const order = await db.QQuery(
        `SELECT * FROM orders WHERE id=$1 AND user_id=$2;`,
        [order_id, user_id]
      );

      if (order.rowCount === 0)
        return res.status(404).json({ status: false, message: "Order not found" });

      // ✅ อัปเดตสถานะเป็น "paid"
      await db.QQuery(
        `UPDATE orders SET status='paid', paid_at=NOW() WHERE id=$1;`,
        [order_id]
      );

      // ✅ ดึงสินค้าที่อยู่ใน order
      const items = await db.QQuery(`
        SELECT oi.*, g.title
        FROM order_items oi
        JOIN games g ON oi.game_id = g.id
        WHERE oi.order_id=$1;
      `, [order_id]);

      // ✅ สร้าง Fake Key + ลด stock
      for (const item of items.rows) {
        for (let i = 0; i < item.qty; i++) {
          const fakeKey = generateFakeKey(item.title);
          await db.QQuery(`
            INSERT INTO library_items (user_id, game_id, order_item_id, cd_key)
            VALUES ($1, $2, $3, $4);
          `, [user_id, item.game_id, item.id, fakeKey]);
        }

        // ✅ ลด stock
        await db.QQuery(`
          UPDATE games
          SET stock_managed = GREATEST(stock_managed - $1, 0)
          WHERE id = $2;
        `, [item.qty, item.game_id]);
      }

      res.json({ status: true, message: "Payment successful — Fake Keys generated!" });
    } catch (err) {
      console.error("❌ Payment confirm error:", err);
      res.status(500).json({ status: false, message: err.message });
    }
  }
};
