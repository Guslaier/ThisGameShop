import db from "../databace/db.js";

class Providers {
  /** 🟩 ดึงข้อมูลเกมทั้งหมด */
  async listGames() {
    const games = await db.QQuery(`
    SELECT 
      g.id, 
      g.title, 
      g.description_md, 
      g.release_date,
      g.stock_managed, 
      g.platform_flags, 
      g.image_poster,
      p.amount_cents AS price_cents,
      g.created_at, 
      g.updated_at
    FROM games g
    JOIN prices p ON g.id = p.game_id
    WHERE 
      p.is_active = TRUE
      AND g.deleted_at IS NULL
      AND p.deleted_at IS NULL
    ORDER BY g.updated_at DESC;
  `);

    return games;
  }


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
  /** 🟩 สร้างเกมใหม่ + เพิ่มราคา */
  async createGame(
    title,
    price,
    stock = 0,
    description_md = "",
    release_date = null,
    platform_flags = ""
  ) {
    // เพิ่มข้อมูลในตาราง games
    const result = await db.QQuery(
      `INSERT INTO games 
   (title, stock_managed, description_md, release_date, platform_flags)
   VALUES ($1, $2, $3, $4, $5)
   RETURNING *;`,
      [title, stock, description_md, release_date, platform_flags]

    );
    const gameId = result.rows[0].id;

    // เพิ่มราคาในตาราง prices
    await db.QQuery(
      `
      INSERT INTO prices (game_id, amount_cents, is_active)
      VALUES ($1, $2, TRUE);
      `,
      [gameId, price]
    );

    console.log(`✅ Added Game: ${title} (฿${price}) | Stock: ${stock}`);
    return { id: gameId, title, price, stock };
  }

  /** 🟩 เพิ่มหรือลด stock */
  async updateStock(id, action) {
    const game = await db.QQuery("SELECT * FROM games WHERE id = $1;", [id]);
    if (game.rowCount === 0) throw new Error("Game not found");

    let newStock = game[0].stock_managed || 0;
    if (action === "increase") newStock += 1;
    else if (action === "decrease" && newStock > 0) newStock -= 1;
    else throw new Error("Invalid action or stock cannot be negative");

    const updatedGame = await db.QQuery(
      "UPDATE games SET stock_managed = $1 WHERE id = $2 RETURNING *;",
      [newStock, id]
    );
    return updatedGame;
  }

  /** 🟩 อัปเดตราคา */
  async updatePrice(id, price) {
    const game = await db.QQuery("SELECT * FROM games WHERE id = $1;", [id]);
    if (game.rowCount === 0) throw new Error("Game not found");

    const updated = await db.QQuery(
      `
      UPDATE prices
      SET amount_cents = $1
      WHERE game_id = $2
      RETURNING *;
      `,
      [price, id]
    );
    return updated;
  }

  /** 🟩 อัปเดตรูป */
  async updateImage(id, img) {
    const game = await db.QQuery("SELECT * FROM games WHERE id = $1;", [id]);
    if (game.rowCount === 0) throw new Error("Game not found");

    const updated = await db.QQuery(
      "UPDATE games SET image_poster = $1 WHERE id = $2 RETURNING *;",
      [img, id]
    );
    return updated;
  }

  /** 🟩 อัปเดตคำอธิบาย */
  async updataeddescription_md(id, description_md) {
    const game = await db.QQuery("SELECT * FROM games WHERE id = $1;", [id]);
    if (game.rowCount === 0) throw new Error("Game not found");

    const updated = await db.QQuery(
      "UPDATE games SET description_md = $1 WHERE id = $2 RETURNING *;",
      [description_md, id]
    );
    return updated;
  }

  /** 🟩 อัปเดตวันวางจำหน่าย */
  async updataerelease_date(id, release_date) {
    const game = await db.QQuery("SELECT * FROM games WHERE id = $1;", [id]);
    if (game.rowCount === 0) throw new Error("Game not found");

    const updated = await db.QQuery(
      "UPDATE games SET release_date = $1 WHERE id = $2 RETURNING *;",
      [release_date, id]
    );
    return updated;
  }

  /** 🟩 อัปเดต platform */
  async updateplatform_flags(id, platform_flags) {
    const game = await db.QQuery("SELECT * FROM games WHERE id = $1;", [id]);
    if (game.rowCount === 0) throw new Error("Game not found");

    const updated = await db.QQuery(
      "UPDATE games SET platform_flags = $1 WHERE id = $2 RETURNING *;",
      [platform_flags, id]
    );
    return updated;
  }

  /** 🟥 ลบเกม (พร้อมราคา) */
  async deleteGame(id) {
    const game = await db.QQuery("SELECT * FROM games WHERE id = $1;", [id]);

    if (game.length === 0) {
      return { status: false, rows: ["Game not found"] };
    }

    const deleted = await db.QQuery(
      "UPDATE games SET deleted_at = NOW() WHERE id = $1 RETURNING *;",
      [id]
    );

    return { status: true, data: deleted[0] };
  }
  async addGameImage(gameId, title, imgPath) {
    const result = await db.QQuery(
      "INSERT INTO game_img (game_id, title, scr) VALUES ($1, $2, $3) RETURNING *",
      [gameId, title, imgPath]
    );
    return result.rows[0];
  }

  // ✅ ดึงรูปทั้งหมด
  async listGameImages(gameId) {
    const result = await db.QQuery("SELECT * FROM game_img WHERE game_id = $1", [gameId]);
    return result.rows;
  }

  // ✅ ดึงรูปเดียว
  async getGameImage(gameId, imgId) {
    const result = await db.QQuery(
      "SELECT * FROM game_img WHERE game_id = $1 AND id = $2",
      [gameId, imgId]
    );
    return { status: true, data: result.rows[0] };
  }

// ✅ ลบรูป
  async deleteGameImage(gameId, imgId) {
  const result = await db.QQuery(
    "SELECT scr FROM game_img WHERE game_id = $1 AND id = $2",
    [gameId, imgId]
  );

  if (result.rowCount === 0) {
    return { status: false, message: "Image not found" };
  }

  const imgPath = result.rows[0].scr; // เช่น /images/uploads/game-1730.jpg
  const filePath = path.join("public", imgPath); // รวม path จริงบนเครื่อง

  try {
    // ลบจาก DB ก่อน
    await db.QQuery(
      "DELETE FROM game_img WHERE game_id = $1 AND id = $2",
      [gameId, imgId]
    );

    // ลบไฟล์จริง (ถ้ามี)
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log("🗑️ Deleted file:", filePath);
    } else {
      console.log("⚠️ File not found on disk:", filePath);
    }

    return { status: true, message: "Image deleted successfully" };
  } catch (err) {
    console.error("Error deleting game image:", err);
    return { status: false, error: err.message };
  }
}


}
export default Providers;
