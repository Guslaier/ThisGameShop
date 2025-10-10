import express from 'express';
import Providers from './service.js';
import multer from 'multer';
import db from '../databace/db.js';
import Authentication from '../authentication.js'; // ✅ เพิ่มส่วนนี้

// ===============================
// 🧠 Initial Setup
// ===============================
const providers = new Providers();
const router = express.Router();
const { isAuthenticated, authorize } = Authentication; // ✅ ใช้ middleware ตรวจสิทธิ์

// 🧱 ตั้งค่า multer ให้บันทึกไฟล์ใน /public/images/uploads/
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/images/uploads/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = file.originalname.split('.').pop();
    cb(null, `${file.fieldname}-${uniqueSuffix}.${ext}`);
  }
});
const upload = multer({ storage });

// =====================================================
// 🔰 TEST API
// =====================================================
router.get('/', (req, res) => {
  res.json({ title: 'Stock API', data: 'This is stock API' });
});

// =====================================================
// 🎮 GAME CRUD (ข้อมูลเกมหลัก)
// =====================================================

// ✅ ดึงข้อมูลเกมทั้งหมด (ทุกคนดูได้)
router.get('/games', async (req, res) => {
  const result = await providers.listGames();
  res.json(result.rows);
});

// ✅ ดึงข้อมูลเกมตาม ID (ทุกคนดูได้)
router.get('/games/:id', async (req, res) => {
  const { id } = req.params;
  const result = await providers.getGameById(id);
  res.json(result);
});

// ✅ เพิ่มเกมใหม่ (admin เท่านั้น)
router.post(
  '/games',
  authorize(['admin']),
  upload.single('image'),
  async (req, res) => {
    try {
      const { title, platform_flags, price, stock, release_date, description_md } = req.body;
      const file = req.file;

      if (!title || !price) {
        return res.status(400).json({ message: 'Missing required fields' }); // ✅ return!
      }

      const newGame = await db.QQuery(
        `INSERT INTO games (title, platform_flags, description_md, release_date, stock_managed)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING *;`,
        [title, platform_flags, description_md, release_date || null, parseInt(stock)]
      );

      await db.QQuery(
        `INSERT INTO prices (game_id, amount_cents) VALUES ($1, $2);`,
        [newGame.rows[0].id, parseInt(price) * 100]
      );

      return res.json({ status: true, data: newGame.rows[0] }); // ✅ return!
    } catch (error) {
      console.error('❌ Error adding game:', error);
      return res.status(500).json({ status: false, error: error.message });
    }
  }
);


// ✅ ลบเกม (เฉพาะ admin)
router.delete('/games/:id', authorize(['admin']), async (req, res) => {
  const { id } = req.params;
  try {
    const deleted = await providers.deleteGame(id);
    res.json(deleted.rows?.[0] || deleted);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// =====================================================
// 📦 STOCK & PRICE MANAGEMENT
// =====================================================

// ✅ เพิ่ม/ลดสต็อก (admin)
router.put('/games/:id/stock', authorize(['admin']), async (req, res) => {
  const { id } = req.params;
  const { action } = req.body; // increase / decrease
  if (!['increase', 'decrease'].includes(action))
    return res.status(400).json({ error: 'Invalid action' });
  try {
    const updated = await providers.updateStock(id, action);
    res.json(updated[0]);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// ✅ อัปเดตราคาเกม (admin)
router.put('/games/:id/price', authorize(['admin']), async (req, res) => {
  const { id } = req.params;
  const { price } = req.body;
  if (price === undefined || price < 0)
    return res.status(400).json({ error: 'Invalid price' });
  try {
    const updated = await providers.updatePrice(id, price);
    res.json(updated[0]);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// =====================================================
// 🧩 GAME DETAILS UPDATE (description / release / platform)
// =====================================================

// ✅ อัปเดตคำอธิบาย (admin)
router.put('/games/:id/description_md', authorize(['admin']), async (req, res) => {
  const { id } = req.params;
  const { description_md } = req.body;
  if (description_md === undefined)
    return res.status(400).json({ error: 'Invalid description_md' });
  try {
    const updated = await providers.updataeddescription_md(id, description_md);
    res.json(updated.rows[0]);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// ✅ อัปเดตวันวางจำหน่าย (admin)
router.put('/games/:id/release_date', authorize(['admin']), async (req, res) => {
  const { id } = req.params;
  const { release_date } = req.body;
  if (release_date === undefined)
    return res.status(400).json({ error: 'Invalid release_date' });
  try {
    const updated = await providers.updataerelease_date(id, release_date);
    res.json(updated.rows[0]);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// ✅ อัปเดตแพลตฟอร์ม (admin)
router.put('/games/:id/platform_flags', authorize(['admin']), async (req, res) => {
  const { id } = req.params;
  const { platform_flags } = req.body;
  if (platform_flags === undefined)
    return res.status(400).json({ error: 'Invalid platform_flags' });
  try {
    const updated = await providers.updateplatform_flags(id, platform_flags);
    res.json(updated.rows[0]);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// =====================================================
// 🖼️ GAME MAIN IMAGE (image_poster)
// =====================================================

// ✅ ดึงรูปหลักของเกม (ทุกคนดูได้)
router.get("/games/image/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const rows = await db.QQuery("SELECT image_poster FROM games WHERE id = $1;", [id]);
    if (!rows || rows.rowCount === 0 || !rows.rows[0].image_poster)
      return res.status(404).json({ status: false, message: "❌ No image found" });
    res.json({ status: true, image: rows.rows[0].image_poster });
  } catch (err) {
    console.error("Error fetching image:", err);
    res.status(500).json({ status: false, error: err.message });
  }
});

// ✅ อัปโหลด/เปลี่ยนรูปหลักของเกม (admin)
router.post("/games/:id/img", authorize(['admin']), upload.single("image"), async (req, res) => {
  const { id } = req.params;
  const file = req.file;
  if (!file)
    return res.status(400).json({ status: false, message: "No file uploaded" });

  const result = await providers.getGameById(id);
  if (!result.status)
    return res.status(404).json({ status: false, message: "Game not found" });

  try {
    const imgPath = `/images/uploads/${file.filename}`;
    await db.QQuery("UPDATE games SET image_poster = $1 WHERE id = $2", [imgPath, id]);
    res.json({ status: true, message: "Image uploaded successfully", image_poster: imgPath });
  } catch (err) {
    console.error("Error uploading image:", err);
    res.status(500).json({ status: false, error: err.message });
  }
});

// =====================================================
// 🖼️ GAME GALLERY (game_img)
// =====================================================
// ✅ ดึงเกมแบบสุ่มระหว่าง 1–6 เกม
router.get("/random-slide", async (req, res) => {
  try {
    const countResult = await db.QQuery(`SELECT COUNT(*) FROM games WHERE stock_managed > 0 AND deleted_at IS NULL;`);
    const totalGames = parseInt(countResult.rows[0].count, 10);

    if (totalGames === 0) {
      return res.json({
        status: false,
        data: [], // ไม่มีเกมเลย
        message: "No games available, use default"
      });
    }

    // จำนวนที่ต้องการสุ่ม (อย่างน้อย 1 มากสุด 6)
    const randomCount = Math.floor(Math.random() * 6) + 1;

    // ✅ สุ่มเกมจาก DB
    const result = await db.QQuery(`
      SELECT id, title, image_poster
      FROM games
      WHERE stock_managed > 0 AND deleted_at IS NULL
      ORDER BY RANDOM()
      LIMIT $1;
    `, [randomCount]);

    res.json({ status: true, data: result.rows });
  } catch (err) {
    console.error("Error fetching random slide:", err);
    res.status(500).json({ status: false, message: err.message });
  }
});

// ✅ เพิ่มรูปใน gallery (admin)
router.post('/games/:id/gallery', authorize(['admin']), upload.single("image"), async (req, res) => {
  const { id } = req.params;
  const { title } = req.body;
  const file = req.file;

  const game = await providers.getGameById(id);
  if (!game.status) return res.status(404).json({ error: "Game not found" });
  if (!file) return res.status(400).json({ error: "No image uploaded" });

  try {
    const imgPath = `/images/uploads/${file.filename}`;
    const newImg = await providers.addGameImage(id, title || "Untitled", imgPath);
    res.status(201).json({ status: true, data: newImg });
  } catch (err) {
    console.error("Error uploading gallery image:", err);
    res.status(500).json({ error: err.message });
  }
});

// ✅ ดึงรูปทั้งหมดใน gallery (ทุกคนดูได้)
router.get('/games/:id/gallery', async (req, res) => {
  const { id } = req.params;
  const game = await providers.getGameById(id);
  if (!game.status) return res.status(404).json({ error: "Game not found" });
  try {
    const imgs = await providers.listGameImages(id);
    res.json({ status: true, data: imgs });
  } catch (err) {
    res.status(500).json({ status: false, error: err.message });
  }
});

// ✅ ลบรูปออกจาก gallery (admin)
router.delete('/games/:id/gallery/:img_id', authorize(['admin']), async (req, res) => {
  const { id, img_id } = req.params;
  const game = await providers.getGameById(id);
  if (!game.status) return res.status(404).json({ error: "Game not found" });

  try {
    const deleted = await providers.deleteGameImage(id, img_id);
    if (!deleted.status)
      return res.status(404).json({ status: false, message: deleted.message });
    res.json({ status: true, data: deleted.data });
  } catch (err) {
    console.error("Error deleting gallery image:", err);
    res.status(500).json({ status: false, error: err.message });
  }
});

export default router;
