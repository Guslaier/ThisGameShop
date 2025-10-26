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
      const result = await service.listOrdersByUser(2);
      res.json({ status: true, data: result.rows });
    } catch (err) {
      res.status(500).json({ status: false, message: err.message });
    }
  },
  // routes/order/controller.js
  async cancelByOwner(req, res) {
    try {
      const { id } = req.params;
      const user_id = req.session.user?.id;
      if (!user_id) return res.status(401).json({ status: false, message: 'Unauthorized' });

      // หาออเดอร์ของ user เอง
      const orderRes = await db.QQuery(`SELECT * FROM orders WHERE id=$1 AND user_id=$2;`, [id, user_id]);
      if (orderRes.rowCount === 0) return res.status(404).json({ status: false, message: 'Order not found' });

      const order = orderRes.rows[0];
      if (order.status !== 'pending') {
        return res.status(400).json({ status: false, message: 'Order cannot be cancelled (not pending)' });
      }

      // คืน stock (เพราะตอน checkout ลดไว้แล้ว)
      const items = await db.QQuery(`
      SELECT oi.game_id, oi.qty
      FROM order_items oi
      WHERE oi.order_id = $1;
    `, [id]);

      for (const it of items.rows) {
        await db.QQuery(`
        UPDATE games
        SET stock_managed = stock_managed + $1
        WHERE id = $2;
      `, [it.qty, it.game_id]);
      }

      // อัปเดตสถานะเป็น cancelled
      await db.QQuery(`UPDATE orders SET status='cancelled', updated_at=NOW() WHERE id=$1;`, [id]);

      return res.json({ status: true, message: 'Order cancelled' });
    } catch (err) {
      console.error('❌ CancelByOwner error:', err);
      return res.status(500).json({ status: false, message: err.message });
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

  async updataStatus(req, res) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      // 🔹 ตรวจสอบค่าว่าง
      if (!status) {
        return res.status(400).json({ status: false, message: "Missing status value" });
      }

      // 🔹 อนุญาตเฉพาะสถานะที่กำหนดไว้
      const allowedStatuses = ['pending', 'paid', 'cancelled'];
      if (!allowedStatuses.includes(status)) {
        return res.status(400).json({ status: false, message: "Invalid status" });
      }

      // 🔹 ตรวจสอบว่ามี order จริงไหม
      const orderRes = await db.QQuery(`SELECT * FROM orders WHERE id=$1;`, [id]);
      if (orderRes.rowCount === 0) {
        return res.status(404).json({ status: false, message: "Order not found" });
      }

      const order = orderRes.rows[0];

      // ❌ ถ้าออเดอร์นี้ถูกยกเลิกไปแล้ว → ห้ามแก้ไขอีก
      if (order.status === 'cancelled') {
        return res.status(400).json({
          status: false,
          message: "This order is already cancelled and cannot be modified."
        });
      }

      // ======================================================
      // ✅ ถ้าเปลี่ยนเป็น cancelled → คืน stock
      // ======================================================
      if (status === 'cancelled') {
        const items = await db.QQuery(`
        SELECT oi.game_id, oi.qty 
        FROM order_items oi 
        WHERE oi.order_id=$1;
      `, [id]);

        for (const item of items.rows) {
          await db.QQuery(`
          UPDATE games 
          SET stock_managed = stock_managed + $1 
          WHERE id = $2;
        `, [item.qty, item.game_id]);
        }
      }

      // ======================================================
      // ✅ ถ้าเปลี่ยนเป็น paid → สร้าง fake key + ลด stock
      // ======================================================
      if (status === 'paid') {
        const items = await db.QQuery(`
        SELECT oi.*, g.title
        FROM order_items oi
        JOIN games g ON oi.game_id = g.id
        WHERE oi.order_id=$1;
      `, [id]);

        for (const item of items.rows) {
          for (let i = 0; i < item.qty; i++) {
            const fakeKey = generateFakeKey(item.title);
            await db.QQuery(`
            INSERT INTO library_items (user_id, game_id, order_item_id, cd_key)
            VALUES ($1, $2, $3, $4);
          `, [order.user_id, item.game_id, item.id, fakeKey]);
          }
        }

        // เพิ่ม paid_at เวลา
        await db.QQuery(`
        UPDATE orders SET paid_at = NOW() WHERE id=$1;
      `, [id]);
      }

      // ======================================================
      // ✅ อัปเดตสถานะสุดท้าย
      // ======================================================
      await db.QQuery(`
      UPDATE orders 
      SET status=$1, updated_at=NOW() 
      WHERE id=$2;
    `, [status, id]);

      res.json({ status: true, message: "Order status updated successfully" });

    } catch (err) {
      console.error("❌ Update Order Status Error:", err);
      res.status(500).json({ status: false, message: err.message });
    }
  },


  async deleteOrder(req, res) {
    try {
      const { id } = req.params;

      // 🔹 ตรวจสอบว่า order มีอยู่ไหม
      const orderRes = await db.QQuery(`SELECT * FROM orders WHERE id=$1;`, [id]);
      if (orderRes.rowCount === 0) {
        return res.status(404).json({ status: false, message: "Order not found" });
      }

      const order = orderRes.rows[0];

      // 🔹 ตรวจสอบสถานะ ต้องเป็น cancelled เท่านั้น
      if (order.status !== 'cancelled') {
        return res.status(400).json({
          status: false,
          message: "Only cancelled orders can be deleted",
        });
      }

      // 🔹 คืน stock เฉพาะกรณีที่ยังไม่คืน
      const items = await db.QQuery(`
      SELECT oi.game_id, oi.qty
      FROM order_items oi
      WHERE oi.order_id = $1;
    `, [id]);

      for (const item of items.rows) {
        await db.QQuery(`
        UPDATE games
        SET stock_managed = stock_managed + $1
        WHERE id = $2;
      `, [item.qty, item.game_id]);
      }

      // 🔹 ลบ library_items ที่อ้างถึง order_items
      await db.QQuery(`
      DELETE FROM library_items
      WHERE order_item_id IN (
        SELECT id FROM order_items WHERE order_id=$1
      );
    `, [id]);

      // 🔹 ลบ order_items ก่อน
      await db.QQuery(`DELETE FROM order_items WHERE order_id=$1;`, [id]);

      // 🔹 ลบ order หลัก
      await db.QQuery(`DELETE FROM orders WHERE id=$1;`, [id]);

      // ✅ ส่ง response ปลอดภัย (ไม่มี circular JSON)
      res.json({ status: true, message: "Order deleted successfully" });

    } catch (err) {
      console.error("❌ Delete Order Error:", err);
      res.status(500).json({ status: false, message: err.message });
    }
  },


  // =========================================================
  // 💳 ยืนยันการชำระเงิน
  // =========================================================
  async paymentConfirm(req, res) {
    try {
      const { order_id } = req.body;
      const user_id = req.session.user.id;
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
      }

      res.json({ status: true, message: "Payment successful — Fake Keys generated!" });
    } catch (err) {
      console.error("❌ Payment confirm error:", err);
      res.status(500).json({ status: false, message: err.message });
    }
  }
};
