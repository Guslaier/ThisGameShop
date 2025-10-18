// 📁 /routes/stock/service.js
import db from "../databace/db.js";
import path from "path";
import fs from "fs";

export default class StockService {
  /** 🟩 ดึงข้อมูลเกมทั้งหมด */
  async listGames() {
    return await db.QQuery(`
      SELECT 
        g.id, g.title, g.description_md, g.release_date,
        g.stock_managed, g.platform_flags, g.image_poster,
        p.amount_cents AS price_cents,
        g.created_at, g.updated_at
      FROM games g
      JOIN prices p ON g.id = p.game_id
      WHERE p.is_active = TRUE 
        AND g.deleted_at IS NULL 
        AND p.deleted_at IS NULL
      ORDER BY g.updated_at DESC;
    `);
  }

  /** 🟩 ดึงเกมตาม ID */
  async getGameById(id) {
    const game = await db.QQuery(`
      SELECT g.id, g.title, g.description_md, g.release_date,
             g.stock_managed, g.platform_flags, g.image_poster,
             p.amount_cents
      FROM games g
      JOIN prices p ON g.id = p.game_id
      WHERE g.id = $1 
        AND p.is_active = TRUE
        AND g.deleted_at IS NULL 
        AND p.deleted_at IS NULL;
    `, [id]);
    if (game.rowCount === 0)
      return { status: false, message: "Game not found" };
    return { status: true, game: game.rows[0] };
  }

  /** 🟩 เพิ่มเกมใหม่ */
  async createGame(title, price, stock, desc, release, platform) {
    const result = await db.QQuery(`
      INSERT INTO games (title, stock_managed, description_md, release_date, platform_flags)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *;
    `, [title, stock, desc, release, platform]);
    const gameId = result.rows[0].id;
    await db.QQuery(`
      INSERT INTO prices (game_id, amount_cents, is_active)
      VALUES ($1, $2, TRUE);
    `, [gameId, price * 100]);
    return result.rows[0];
  }

  /** 🟩 เพิ่ม/ลด stock */
  async updateStock(id, action) {
    const game = await db.QQuery("SELECT * FROM games WHERE id=$1;", [id]);
    if (game.rowCount === 0) throw new Error("Game not found");
    let stock = game.rows[0].stock_managed;
    if (action === "increase") stock++;
    else if (action === "decrease" && stock > 0) stock--;
    await db.QQuery("UPDATE games SET stock_managed=$1 WHERE id=$2", [stock, id]);
    return { status: true, stock };
  }

  /** 🟩 อัปเดตราคา */
  async updatePrice(id, price) {
    return await db.QQuery(`
      UPDATE prices 
      SET amount_cents=$1 
      WHERE game_id=$2
      RETURNING *;
    `, [price * 100, id]);
  }

  /** 🟩 อัปเดตคำอธิบาย/วันวางจำหน่าย/platform */
  async updateField(id, field, value) {
    return await db.QQuery(
      `UPDATE games SET ${field}=$1 WHERE id=$2 RETURNING *;`,
      [value, id]
    );
  }

  /** 🟥 ลบเกม (soft delete) */
  async deleteGame(id) {
    return await db.QQuery(`
      DELETE FROM games WHERE id=$1 RETURNING *;
    `, [id]);
  }

  // =========================
  // 🖼️ รูปภาพ
  // =========================
  async updateMainImage(id, imgPath) {
    return await db.QQuery(
      `UPDATE games SET image_poster=$1, updated_at=NOW() WHERE id=$2 RETURNING image_poster;`,
      [imgPath, id]
    );
  }

  // ✅ ดึงรูปหลักของเกม
  async getMainImage(id) {
    return await db.QQuery(`SELECT image_poster FROM games WHERE id=$1;`, [id]);
  }

  // ✅ เพิ่มรูปเข้า gallery
  async addGameImage(gameId, title, scr) {
    return await db.QQuery(
      `INSERT INTO game_img (game_id, title, scr) VALUES ($1, $2, $3) RETURNING *;`,
      [gameId, title, scr]
    );
  }

  // ✅ ดึงรูปทั้งหมดใน gallery
  async listGameImages(gameId) {
    return await db.QQuery(`SELECT * FROM game_img WHERE game_id=$1;`, [gameId]);
  }

  // ✅ ลบรูปใน gallery
  async deleteGameImage(gameId, imgId) {
    const result = await db.QQuery(
      `SELECT scr FROM game_img WHERE game_id=$1 AND id=$2;`,
      [gameId, imgId]
    );

    if (result.rowCount === 0)
      return { status: false, message: "Image not found" };

    const imgPath = result.rows[0].scr;
    const filePath = path.join("public", imgPath);

    try {
      await db.QQuery(`DELETE FROM game_img WHERE game_id=$1 AND id=$2;`, [gameId, imgId]);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      return { status: true };
    } catch (err) {
      return { status: false, message: err.message };
    }
  }

  // ✅ สุ่มเกมแสดงสไลด์
  async getRandomSlide(limit = 6) {
    return await db.QQuery(`
      SELECT id, title, image_poster 
      FROM games 
      WHERE stock_managed > 0 AND deleted_at IS NULL
      ORDER BY RANDOM()
      LIMIT $1;
    `, [limit]);
  }
}
