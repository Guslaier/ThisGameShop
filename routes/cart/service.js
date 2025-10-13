import db from "../databace/db.js";

export default class CartService {
  async getCart(user_id) {
    return await db.QQuery(`
      SELECT 
        g.id AS game_id, 
        g.title, 
        g.image_poster,
        g.stock_managed,
        (ci.unit_price_cents / 100)::numeric AS price,
        ci.qty,
        (ci.qty * ci.unit_price_cents / 100)::numeric AS total
      FROM cart_items ci
      JOIN games g ON ci.game_id = g.id
      JOIN carts c ON c.id = ci.cart_id
      WHERE c.user_id = $1;
    `, [user_id]);
  }



  async addToCart(user_id, game_id, qty = 1) {
    // ✅ หา cart ของ user
    const cartRes = await db.QQuery(`SELECT id FROM carts WHERE user_id = $1;`, [user_id]);
    let cart_id;

    // ถ้า user ยังไม่มี cart ให้สร้างใหม่
    if (cartRes.rowCount === 0) {
      const newCart = await db.QQuery(
        `INSERT INTO carts (user_id, created_at) VALUES ($1, NOW()) RETURNING id;`,
        [user_id]
      );
      cart_id = newCart.rows[0].id;
    } else {
      cart_id = cartRes.rows[0].id;
    }

    // ✅ ดึงราคาเกม
    const priceRes = await db.QQuery(
      `SELECT amount_cents FROM prices WHERE game_id=$1 AND is_active=TRUE LIMIT 1;`,
      [game_id]
    );
    if (priceRes.rowCount === 0)
      throw new Error("Game price not found");

    const unit_price_cents = priceRes.rows[0].amount_cents;

    // ✅ เพิ่มหรืออัปเดตสินค้าใน cart
    return await db.QQuery(`
    INSERT INTO cart_items (cart_id, game_id, qty, unit_price_cents)
    VALUES ($1, $2, $3, $4)
    ON CONFLICT (cart_id, game_id)
    DO UPDATE 
      SET qty = cart_items.qty + EXCLUDED.qty,
          updated_at = NOW()
    RETURNING *;
  `, [cart_id, game_id, qty, unit_price_cents]);
  }


  async removeFromCart(user_id, game_id) {
  // ✅ หาตะกร้าของผู้ใช้ก่อน
  const cartRes = await db.QQuery(`SELECT id FROM carts WHERE user_id = $1 LIMIT 1;`, [user_id]);
  if (cartRes.rowCount === 0) {
    return { status: false, message: "Cart not found for this user" };
  }

  const cart_id = cartRes.rows[0].id;

  // ✅ ลบสินค้าจากตะกร้า
  const result = await db.QQuery(`
    DELETE FROM cart_items
    WHERE cart_id = $1 AND game_id = $2
    RETURNING *;
  `, [cart_id, game_id]);

  return result;
}


  async updateCartItem(user_id, game_id, quantity) {
  // ✅ หาตะกร้าของผู้ใช้
  const cartRes = await db.QQuery(`SELECT id FROM carts WHERE user_id = $1 LIMIT 1;`, [user_id]);
  if (cartRes.rowCount === 0) {
    throw new Error("Cart not found for this user");
  }

  const cart_id = cartRes.rows[0].id;

  // ✅ อัปเดตจำนวนสินค้าใน cart_items
  const result = await db.QQuery(`
    UPDATE cart_items
    SET qty = $3, updated_at = NOW()
    WHERE cart_id = $1 AND game_id = $2
    RETURNING *;
  `, [cart_id, game_id, quantity]);

  // ✅ ถ้าไม่เจอแถวที่จะอัปเดต
  if (result.rowCount === 0) {
    return { status: false, message: "Item not found in cart" };
  }

  return { status: true, data: result };
}

}
