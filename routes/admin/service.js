// 📁 /routes/admin/service.js
import db from "../databace/db.js";

export default class AdminService {
  // ==========================
  // 👤 USER MANAGEMENT
  // ==========================
  async listUsers() {
    return await db.QQuery(`SELECT * FROM users ORDER BY id ASC`);
  }

  async setUserActiveStatus(id, is_active) {
    return await db.QQuery(
      `UPDATE users SET is_active=$1, updated_at=NOW() WHERE id=$2 RETURNING *`,
      [is_active, id]
    );
  }

  async deleteUser(id) {
    return await db.QQuery(`DELETE FROM users WHERE id=$1 RETURNING *`, [id]);
  }

  // ==========================
  // 🎮 GAME MANAGEMENT
  // ==========================
  async listGames() {
    return await db.QQuery(`SELECT * FROM games ORDER BY id ASC`);
  }

  async createGame(title, price, stock) {
    return await db.QQuery(
      `INSERT INTO games (title, price, stock_managed)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [title, price, stock]
    );
  }

  async updateStock(id, action) {
    const operator = action === "increase" ? "+" : "-";
    return await db.QQuery(
      `UPDATE games 
       SET stock_managed = stock_managed ${operator} 1, updated_at=NOW()
       WHERE id=$1
       RETURNING *`,
      [id]
    );
  }

  async deleteGame(id) {
    return await db.QQuery(`DELETE FROM games WHERE id=$1 RETURNING *`, [id]);
  }

  // ==========================
  // 📊 REPORTS / STATS
  // ==========================
  async getStats() {
    return await db.QQuery(`
      SELECT COUNT(*) AS total_orders, SUM(total_cents) AS total_amount 
      FROM orders;
    `);
  }
}
