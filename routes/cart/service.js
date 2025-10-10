import db from "../databace/db.js";

class Providers {
  // =========================================================
  // 🛒 CART MANAGEMENT
  // =========================================================

  // ✅ ดึงตะกร้าของผู้ใช้
  async getCart(user_id) {
    return await db.QQuery(`
      SELECT 
        g.id AS game_id, 
        g.title, 
        g.image_poster,
        g.stock_managed,  -- ✅ เพิ่มบรรทัดนี้
        (ci.unit_price_cents / 100)::numeric AS price,
        ci.qty,
        (ci.qty * ci.unit_price_cents / 100)::numeric AS total
      FROM cart_items ci
      JOIN games g ON ci.game_id = g.id
      JOIN carts c ON c.id = ci.cart_id
      WHERE c.user_id = $1;
    `, [user_id]);
  }

  // ✅ เพิ่มเกมเข้าตะกร้า
  async addToCart(user_id, game_id, qty = 1) {
    // สร้าง cart ให้ user ถ้ายังไม่มี
    await db.QQuery(`
      INSERT INTO carts (user_id) VALUES ($1)
      ON CONFLICT (user_id) DO NOTHING;
    `, [user_id]);
    const cart = await db.QQuery(`SELECT id FROM carts WHERE user_id=$1;`, [user_id]);
    const cart_id = cart.rows[0];
    // เพิ่มเกมเข้า cart_items
    await db.QQuery(`
      INSERT INTO cart_items (cart_id, game_id, qty, unit_price_cents)
      VALUES (
        $1, $2, $3,
        (SELECT amount_cents FROM prices WHERE game_id=$2 AND is_active=TRUE LIMIT 1)
      )
      ON CONFLICT (cart_id, game_id)
      DO UPDATE SET qty = cart_items.qty + EXCLUDED.qty;
    `, [cart_id.id, game_id, qty]);

    return { status: true, message: "Added to cart" };
  }

  // ✅ ลบเกมจากตะกร้า
  async removeFromCart(user_id, game_id) {
    const cart = await db.QQuery(`SELECT id FROM carts WHERE user_id=$1;`, [user_id]);
    if (cart.rowCount === 0) return { status: false, message: "Cart not found" };

    await db.QQuery(`DELETE FROM cart_items WHERE cart_id=$1 AND game_id=$2;`, [cart.rows[0].id, game_id]);
    return { status: true, message: "Removed from cart" };
  }

  // ✅ ปรับจำนวนเกมในตะกร้า
  async updateCartItem(user_id, game_id, qty) {
    const cart = await db.QQuery(`SELECT id FROM carts WHERE user_id=$1;`, [user_id]);
    if (cart.rowCount === 0) return { status: false, message: "Cart not found" };

    await db.QQuery(`UPDATE cart_items SET qty=$1 WHERE cart_id=$2 AND game_id=$3;`, [qty, cart.rows[0].id, game_id]);
    return { status: true, message: "Updated quantity" };
  }

  // =========================================================
  // 📦 ORDER MANAGEMENT
  // =========================================================

  // ✅ สร้างออเดอร์จากตะกร้า
  async createOrderFromCart(user_id, selectedItems = []) {
    const cart = await db.QQuery(`SELECT id FROM carts WHERE user_id=$1;`, [user_id]);
    if (cart.rowCount === 0) throw new Error("Cart not found");

    const cart_id = cart.rows[0].id;
    const gameIds = selectedItems.map(i => i.game_id);

    const items = await db.QQuery(`
    SELECT ci.*, g.title, g.stock_managed
    FROM cart_items ci
    JOIN games g ON ci.game_id = g.id
    WHERE ci.cart_id=$1 AND ci.game_id = ANY($2);
  `, [cart_id, gameIds]);

    if (items.rowCount === 0) throw new Error("No selected items found");

    const total_cents = items.rows.reduce((sum, i) => sum + i.qty * i.unit_price_cents, 0);
    const order_no = `ORD-${Date.now()}-${Math.floor(Math.random() * 9999)}`;

    // ✅ ยังไม่จ่าย → สถานะ pending
    const order = await db.QQuery(`
    INSERT INTO orders (user_id, order_no, total_cents, status)
    VALUES ($1, $2, $3, 'pending')
    RETURNING id;
  `, [user_id, order_no, total_cents]);

    const order_id = order.rows[0].id;

    for (const item of items.rows) {
      await db.QQuery(`
      INSERT INTO order_items (order_id, game_id, qty, unit_price_cents)
      VALUES ($1, $2, $3, $4);
    `, [order_id, item.game_id, item.qty, item.unit_price_cents]);
    }

    // ✅ ลบเฉพาะรายการที่สั่งซื้อออกจากตะกร้า
    await db.QQuery(`
    DELETE FROM cart_items
    WHERE cart_id=$1 AND game_id = ANY($2);
  `, [cart_id, gameIds]);

    return { status: true, order_id, order_no, total_cents };
  }


  // ✅ ดึงรายการออเดอร์ของผู้ใช้
  async listOrdersByUser(user_id) {
    return await db.QQuery(`
      SELECT id, order_no, status, (total_cents / 100)::numeric AS total,
             to_char(created_at, 'YYYY-MM-DD HH24:MI') AS created_at
      FROM orders
      WHERE user_id=$1 AND deleted_at IS NULL
      ORDER BY created_at DESC;
    `, [user_id]);
  }

  // ✅ ดึงรายละเอียดออเดอร์
  async getOrderDetail(order_id, user_id) {
    const order = await db.QQuery(`
      SELECT id, order_no, status, (total_cents / 100)::numeric AS total,
             to_char(created_at, 'YYYY-MM-DD HH24:MI') AS created_at
      FROM orders
      WHERE id=$1 AND user_id=$2;
    `, [order_id, user_id]);

    if (order.rowCount === 0) return null;

    const items = await db.QQuery(`
      SELECT g.title, oi.qty, (oi.unit_price_cents / 100)::numeric AS price
      FROM order_items oi
      JOIN games g ON g.id = oi.game_id
      WHERE oi.order_id=$1;
    `, [order_id]);

    return { ...order.rows[0], items: items.rows };
  }

  // =========================================================
  // 🎮 LIBRARY SYSTEM (หลังชำระเงิน)
  // =========================================================
  async grantLibraryFromOrder(order_id) {
    await db.QQuery(`
      INSERT INTO library_items (user_id, game_id, order_item_id, cd_key)
      SELECT o.user_id, oi.game_id, oi.id,
             md5(random()::text || clock_timestamp()::text)
      FROM order_items oi
      JOIN orders o ON o.id = oi.order_id
      WHERE o.id = $1
      ON CONFLICT DO NOTHING;
    `, [order_id]);
  }

  async getUserLibrary(user_id) {
    return await db.QQuery(`
      SELECT g.title, li.cd_key, li.acquired_at
      FROM library_items li
      JOIN games g ON li.game_id = g.id
      WHERE li.user_id=$1 AND li.deleted_at IS NULL;
    `, [user_id]);
  }

}

export default Providers;
