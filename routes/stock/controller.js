// 📁 /routes/stock/controller.js
import StockService from "./service.js";
import db from "../databace/db.js";
import Providers from "../account/service.js";
const service = new StockService();

export const StockController = {
  async list(req, res) {
    const result = await service.listGames();
    res.json({ status: true, data: result.rows });
  },

  async getById(req, res) {
    const { id } = req.params;
    const result = await service.getGameById(id);
    res.json(result);
  },

  async create(req, res) {
    try {
      const { title, platform_flags, price, stock, release_date, description_md } = req.body;
      const file = req.file;
      if (!title || !price) {
        return res.status(400).json({ message: 'Missing required fields' }); // ✅ return! 
      } const newGame = await db.QQuery(`
        INSERT INTO games (title, platform_flags, description_md, release_date, stock_managed) 
        VALUES ($1, $2, $3, $4, $5) RETURNING *;`,
        [title, platform_flags, description_md, release_date || null, parseInt(stock)]);

      await db.QQuery(`INSERT INTO prices (game_id, amount_cents) VALUES ($1, $2);`,
        [newGame.rows[0].id, parseInt(price) * 100]);
      return res.json({ status: true, data: newGame.rows[0] }); // ✅ return! 
    } catch (error) {
      console.error('❌ Error adding game:', error);
      return res.status(500).json({ status: false, error: error.message });
    }
  },

  async delete(req, res) {
    const { id } = req.params;
    const result = await service.deleteGame(id);
    res.json({ status: true, data: result.rows[0] });
  },

  async updateStock(req, res) {
    const { id } = req.params;
    const { action } = req.body;
    const result = await service.updateStock(id, action);
    res.json(result);
  },

  async updatePrice(req, res) {
    const { id } = req.params;
    const { price } = req.body;
    const result = await service.updatePrice(id, price);
    res.json({ status: true, data: result.rows[0] });
  },

  async updateField(req, res) {
    const { id, field } = req.params;
    const { value } = req.body;
    const result = await service.updateField(id, field, value);
    res.json({ status: true, data: result.rows[0] });
  },
  async updateAll(req, res) {
  const { id } = req.params;
  const { title, platform_flags, price, stock, release_date, description_md } = req.body;

  try {
    await db.QQuery(`
      UPDATE games
      SET title=$1, platform_flags=$2, description_md=$3, release_date=$4, stock_managed=$5, updated_at=NOW()
      WHERE id=$6;
    `, [title, platform_flags, description_md, release_date || null, stock, id]);

    if (price) {
      await db.QQuery(`
        UPDATE prices SET amount_cents=$1 WHERE game_id=$2 AND is_active=TRUE;
      `, [parseInt(price) * 100, id]);
    }

    res.json({ status: true, message: "Game updated successfully" });
  } catch (err) {
    console.error("❌ Update game error:", err);
    res.status(500).json({ status: false, message: err.message });
  }
},

  async getMainImage(req, res) {
    const { id } = req.params;
    try {
      const rows = await providers.getMainImage(id);
      if (!rows || rows.rowCount === 0 || !rows.rows[0].image_poster)
        return res.status(404).json({ status: false, message: "❌ No image found" });

      res.json({ status: true, image: rows.rows[0].image_poster });
    } catch (err) {
      res.status(500).json({ status: false, error: err.message });
    }
  },

  /** ✅ อัปโหลดหรือเปลี่ยนรูปหลักของเกม */
  async uploadMainImage(req, res) {
    const { id } = req.params;
    const file = req.file;

    if (!file)
      return res.status(400).json({ status: false, message: "No file uploaded" });

    const result = await service.getGameById(id);
    if (!result.status)
      return res.status(404).json({ status: false, message: "Game not found" });

    const imgPath = `/images/uploads/${file.filename}`;
    await service.updateMainImage(id, imgPath);
    res.json({ status: true, message: "Image uploaded successfully", image_poster: imgPath });
  },

  /** ✅ เพิ่มรูปเข้า gallery */
  async addGallery(req, res) {
    const { id } = req.params;
    const { title } = req.body;
    const file = req.file;

    if (!file)
      return res.status(400).json({ error: "No image uploaded" });

    const game = await service.getGameById(id);
    if (!game.status)
      return res.status(404).json({ error: "Game not found" });

    const imgPath = `/images/uploads/${file.filename}`;
    const newImg = await service.addGameImage(id, title || "Untitled", imgPath);
    res.status(201).json({ status: true, data: newImg.rows[0] });
  },

  /** ✅ ดึงรูปทั้งหมดใน gallery */
  async listGallery(req, res) {
    const { id } = req.params;
    const game = await service.getGameById(id);
    if (!game.status)
      return res.status(404).json({ error: "Game not found" });

    const imgs = await service.listGameImages(id);
    res.json({ status: true, data: imgs.rows });
  },

  /** ✅ ลบรูปออกจาก gallery */
  async deleteGallery(req, res) {
    const { id, img_id } = req.params;
    const game = await service.getGameById(id);
    if (!game.status)
      return res.status(404).json({ error: "Game not found" });

    const deleted = await service.deleteGameImage(id, img_id);
    if (!deleted.status)
      return res.status(404).json({ status: false, message: deleted.message });

    res.json({ status: true, message: "Image deleted successfully" });
  },

  /** ✅ เกมสุ่มสำหรับสไลด์ */
  async randomSlide(req, res) {
    try {
      const count = await service.getRandomSlide(6);
      if (count.rowCount === 0)
        return res.json({ status: false, data: [], message: "No games available" });

      res.json({ status: true, data: count.rows });
    } catch (err) {
      res.status(500).json({ status: false, message: err.message });
    }
  }
};
