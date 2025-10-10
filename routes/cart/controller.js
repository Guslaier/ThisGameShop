import express from 'express';
import Providers from './service.js'
const providers = new Providers();
import Authentication from '../authentication.js';
import db from '../databace/db.js';
const { isAuthenticated } = Authentication;
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('cart', { activePage: 'cart' });
});


// ==============================
// 🛒 CART SYSTEM
// ==============================

// ✅ ดึงตะกร้าของผู้ใช้
router.get('/u-cart', isAuthenticated, async (req, res) => {
  if(req.session.user){
    const cart = await providers.getCart(req.session.user.id);
    console.log(cart)
    res.json({ status: true, data: cart.rows });
  }else
    res.json({ status: false, data: null });
});

// ✅ เพิ่มสินค้าเข้าตะกร้า
router.post('/add', isAuthenticated, async (req, res) => {
  const { game_id, quantity } = req.body;
  if (!game_id) return res.status(400).json({ status: false, message: 'Missing game_id' });

  const q = quantity && quantity > 0 ? quantity : 1;
  const result = await providers.addToCart(req.session.user.id, game_id, q);
  console.log(result)
  res.json(result);
});

// ✅ ลบสินค้าออกจากตะกร้า
router.post('/remove', isAuthenticated, async (req, res) => {
  const { game_id } = req.body;
  const result = await providers.removeFromCart(req.session.user.id, game_id);
  res.json(result);
});

// ✅ แก้ไขจำนวนสินค้าในตะกร้า
router.post('/update', isAuthenticated, async (req, res) => {
  const { game_id, quantity } = req.body;
  const result = await providers.updateCartItem(req.session.user.id, game_id, quantity);
  res.json(result);
});

// ==============================
// 📦 ORDER SYSTEM
// ==============================

// ✅ สร้างออเดอร์จากตะกร้า
router.post("/order/checkout", isAuthenticated, async (req, res) => {
  try {
    const user_id = req.session.user?.id;
    if (!user_id) {
      return res.status(401).json({ status: false, message: "Unauthorized: No user found" });
    }

    const { items } = req.body; // ✅ รับเฉพาะสินค้าที่เลือกจากฝั่ง client
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ status: false, message: "No items selected for checkout" });
    }

    // ✅ เรียก service เพื่อสร้างออเดอร์
    const result = await providers.createOrderFromCart(user_id, items);

    // ✅ ส่งผลลัพธ์กลับให้ client
    return res.json({
      status: true,
      message: "Order created successfully",
      order_no: result.order_no,
      total: (result.total_cents / 100).toFixed(2),
      order_id: result.order_id,
    });

  } catch (error) {
    console.error("❌ Checkout error:", error);
    res.status(500).json({
      status: false,
      message: error.message || "Failed to create order",
    });
  }
});

// ✅ ดูออเดอร์ทั้งหมดของผู้ใช้
router.get('/order', isAuthenticated, async (req, res) => {
  const orders = await providers.listOrdersByUser(req.session.user.id);
  res.json({ status: true, data: orders });
});

// ✅ ดูรายละเอียดออเดอร์
router.get('/order/:id', isAuthenticated, async (req, res) => {
  const { id } = req.params;
  const order = await providers.getOrderDetail(id, req.session.user.id);
  if (!order) return res.status(404).json({ status: false, message: 'Order not found' });
  res.json({ status: true, data: order });
});

// ✅ ฟังก์ชันสร้าง Fake Key
function generateFakeKey(title) {
  const part = () => Math.random().toString(36).substring(2, 6).toUpperCase();
  const short = title.replace(/\s+/g, '').substring(0, 4).toUpperCase();
  return `${short}-${part()}-${part()}`;
}

// ✅ เมื่อผู้ใช้ยืนยันการชำระเงิน (หลังสแกน QR ปลอม)
router.post("/payment/confirm", isAuthenticated, async (req, res) => {
  const { order_id } = req.body;
  const user_id = req.session.user.id;

  try {
    // ตรวจสอบว่า order เป็นของผู้ใช้
    const order = await db.QQuery(
      `SELECT * FROM orders WHERE id=$1 AND user_id=$2;`,
      [order_id, user_id]
    );

    if (order.rowCount === 0) {
      return res.status(404).json({ status: false, message: "Order not found" });
    }

    // ✅ อัปเดตสถานะเป็น paid
    await db.QQuery(
      `UPDATE orders SET status='paid', paid_at=NOW() WHERE id=$1;`,
      [order_id]
    );

    // ✅ ดึงรายการสินค้าทั้งหมดจาก order_items
    const items = await db.QQuery(`
      SELECT oi.*, g.title
      FROM order_items oi
      JOIN games g ON oi.game_id = g.id
      WHERE oi.order_id=$1;
    `, [order_id]);

    // ✅ สำหรับแต่ละสินค้า ให้สร้าง key ปลอมตามจำนวน qty
    for (const item of items.rows) {
      for (let i = 0; i < item.qty; i++) {
        const fakeKey = generateFakeKey(item.title);
        await db.QQuery(`
          INSERT INTO library_items (user_id, game_id, order_item_id, cd_key)
          VALUES ($1, $2, $3, $4);
        `, [user_id, item.game_id, item.id, fakeKey]);
      }

      // ✅ อัปเดตจำนวน stock
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
});

export default  router;
