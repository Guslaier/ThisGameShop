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
    ORDER BY g.id ASC;
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
    img = null,
    description_md = "",
    release_date = null,
    platform_flags = ""
  ) {
    // เพิ่มข้อมูลในตาราง games
    const result = await db.QQuery(
      `INSERT INTO games 
   (title, stock_managed, image_poster, description_md, release_date, platform_flags)
   VALUES ($1, $2, $3, $4, $5, $6)
   RETURNING *;`,
      [title, stock, img, description_md, release_date, platform_flags]

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
}

export default Providers;
