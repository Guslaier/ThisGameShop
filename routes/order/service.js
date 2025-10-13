import db from "../databace/db.js";

export default class OrderService {
  async createOrderFromCart(user_id, selectedItems = []) {
    const cart = await db.QQuery(`SELECT id FROM carts WHERE user_id=$1;`, [user_id]);
    if (cart.rowCount === 0) throw new Error("Cart not found");
    const cart_id = cart.rows[0].id;

    const gameIds = selectedItems.map(i => i.game_id);
    const items = await db.QQuery(`
      SELECT ci.*, g.title
      FROM cart_items ci
      JOIN games g ON ci.game_id = g.id
      WHERE ci.cart_id=$1 AND ci.game_id = ANY($2);
    `, [cart_id, gameIds]);

    if (items.rowCount === 0) throw new Error("No selected items found");

    const total_cents = items.rows.reduce((sum, i) => sum + i.qty * i.unit_price_cents, 0);
    const order_no = `ORD-${Date.now()}-${Math.floor(Math.random() * 9999)}`;

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

    // ✅ ลบรายการที่ซื้อออกจากตะกร้า
    await db.QQuery(`
      DELETE FROM cart_items
      WHERE cart_id=$1 AND game_id = ANY($2);
    `, [cart_id, gameIds]);

    return { status: true, order_id, order_no, total_cents };
  }

  async listOrdersByUser(user_id) {
    return await db.QQuery(`
      SELECT id, order_no, status,
             (total_cents / 100)::numeric AS total,
             to_char(created_at, 'YYYY-MM-DD HH24:MI') AS created_at
      FROM orders
      WHERE user_id=$1 AND deleted_at IS NULL
      ORDER BY created_at DESC;
    `, [user_id]);
  }

  async getOrderDetail(order_id) {
    const order = await db.QQuery(`
      SELECT o.*, u.display_name AS customer_name, u.email AS customer_email
      FROM orders o
      JOIN users u ON o.user_id = u.id
      WHERE o.id=$1;
    `, [order_id]);

    if (order.rowCount === 0) return null;

    const items = await db.QQuery(`
      SELECT oi.*, g.title
      FROM order_items oi
      JOIN games g ON oi.game_id = g.id
      WHERE oi.order_id=$1;
    `, [order_id]);

    const orderData = order.rows[0];
    orderData.items = items.rows;
    return orderData;
  }

  async listOrders() {
    return await db.QQuery(`
      SELECT o.id, o.order_no, o.status, o.total_cents, o.paid_at,
             o.created_at, u.display_name AS customer_name
      FROM orders o
      JOIN users u ON o.user_id = u.id
      ORDER BY o.created_at DESC;
    `);
  }
}
