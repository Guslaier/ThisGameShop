import express from 'express';
import Providers from './service.js';
import multer from 'multer';
import db from '../databace/db.js';

// ===============================
// 🧠 Initial Setup
// ===============================
const providers = new Providers();
const router = express.Router();
// 🧱 ตั้งค่า multer ให้บันทึกไฟล์ใน /public/images/uploads/
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/images/uploads/'); // ⬅ เก็บรูปในโฟลเดอร์นี้
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = file.originalname.split('.').pop();
    cb(null, `${file.fieldname}-${uniqueSuffix}.${ext}`);
  }
});
const upload = multer({ storage });

// =====================================================
// 🔰 0. TEST / ROOT API
// =====================================================
router.get('/', (req, res) => {
  res.json({ title: 'Stock API', data: 'This is stock API' });
});

// =====================================================
//GAME CRUD (ข้อมูลเกมหลัก)
// =====================================================

// ✅ ดึงข้อมูลเกมทั้งหมด
router.get('/games', async (req, res) => {
  const result = await providers.listGames();
  console.log(result.rows);
  res.json(result.rows);
});

// ✅ ดึงข้อมูลเกมตาม ID
router.get('/games/:id', async (req, res) => {
  const { id } = req.params;
  const result = await providers.getGameById(id);
  res.json(result);
});

// ✅ เพิ่มเกมใหม่
router.post('/games', upload.single('image'), async (req, res) => {
  const { title, platform_flags, price, stock, release_date, description_md } = req.body;
  const file = req.file;

  console.log(title, price, release_date, platform_flags); // ตรวจค่าที่นี่

  if (!title || !price) return res.status(400).json({ message: 'Missing required fields' });

  const newGame = await db.QQuery(`
    INSERT INTO games (title, platform_flags, description_md, release_date, stock_managed)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING *;
  `, [
    title,
    platform_flags,
    description_md,
    release_date || null,
    parseInt(stock)
  ]);

  await db.QQuery(`
    INSERT INTO prices (game_id, amount_cents) VALUES ($1, $2);
  `, [newGame.rows[0].id, parseInt(price) * 100]);

  res.json({ status: true, data: newGame.rows[0] });
});

// ✅ ลบเกม (soft delete)
router.delete('/games/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const deleted = await providers.deleteGame(id);
    res.json(deleted.rows?.[0] || deleted);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// =====================================================
//STOCK & PRICE MANAGEMENT
// =====================================================

// ✅ เพิ่ม/ลดสต็อก
router.put('/games/:id/stock', async (req, res) => {
  const { id } = req.params;
  const { action } = req.body; // increase / decrease
  if (!['increase', 'decrease'].includes(action)) {
    return res.status(400).json({ error: 'Invalid action' });
  }
  try {
    const updated = await providers.updateStock(id, action);
    res.json(updated[0]);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// ✅ อัปเดตราคาเกม
router.put('/games/:id/price', async (req, res) => {
  const { id } = req.params;
  const { price } = req.body;
  if (price === undefined || price < 0) {
    return res.status(400).json({ error: 'Invalid price' });
  }
  try {
    const updated = await providers.updatePrice(id, price);
    res.json(updated[0]);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// =====================================================
// GAME DETAILS UPDATE (description / release / platform)
// =====================================================

// ✅ อัปเดตคำอธิบาย
router.put('/games/:id/description_md', async (req, res) => {
  const { id } = req.params;
  const { description_md } = req.body;
  if (description_md === undefined) {
    return res.status(400).json({ error: 'Invalid description_md' });
  }
  try {
    const updated = await providers.updataeddescription_md(id, description_md);
    res.json(updated.rows[0]);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// ✅ อัปเดตวันวางจำหน่าย
router.put('/games/:id/release_date', async (req, res) => {
  const { id } = req.params;
  const { release_date } = req.body;
  if (release_date === undefined) {
    return res.status(400).json({ error: 'Invalid release_date' });
  }
  try {
    const updated = await providers.updataerelease_date(id, release_date);
    res.json(updated.rows[0]);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// ✅ อัปเดตแพลตฟอร์ม
router.put('/games/:id/platform_flags', async (req, res) => {
  const { id } = req.params;
  const { platform_flags } = req.body;
  if (platform_flags === undefined) {
    return res.status(400).json({ error: 'Invalid platform_flags' });
  }
  try {
    const updated = await providers.updateplatform_flags(id, platform_flags);
    res.json(updated.rows[0]);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// =====================================================
// GAME MAIN IMAGE (image_poster)
// =====================================================

// ✅ ดึงรูปหลักของเกม
router.get("/games/image/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const rows = await db.QQuery(
      "SELECT image_poster FROM games WHERE id = $1;",
      [id]
    );

    if (!rows || rows.rowCount === 0 || !rows.rows[0].image_poster) {
      return res.status(404).json({ status: false, message: "❌ No image found" });
    }

    // ✅ ตอนนี้ image_poster เป็น path เช่น /images/uploads/game-1234.jpg
    res.json({ status: true, image: rows.rows[0].image_poster });
  } catch (err) {
    console.error("Error fetching image:", err);
    res.status(500).json({ status: false, error: err.message });
  }
});

// ✅ อัปโหลด/เปลี่ยนรูปหลักของเกม (เก็บ path ใน DB)
router.post("/games/:id/img", upload.single("image"), async (req, res) => {
  const { id } = req.params;
  const file = req.file;

  if (!file) {
    return res.status(400).json({ status: false, message: "No file uploaded" });
  }

  const result = await providers.getGameById(id);
  if (!result.status) {
    return res.status(404).json({ status: false, message: "Game not found" });
  }

  try {
    // ✅ สร้าง path สำหรับเก็บใน DB (frontend จะใช้ path นี้)
    const imgPath = `/images/uploads/${file.filename}`;
    await db.QQuery("UPDATE games SET image_poster = $1 WHERE id = $2", [
      imgPath,
      id,
    ]);

    res.json({
      status: true,
      message: "Image uploaded successfully",
      image_poster: imgPath,
    });
  } catch (err) {
    console.error("Error uploading image:", err);
    res.status(500).json({ status: false, error: err.message });
  }
});


// =====================================================
// 5. GAME GALLERY (ตาราง game_img)
// =====================================================

// ✅ เพิ่มรูปเข้าคลัง gallery
router.post('/games/:id/gallery', upload.single("image"), async (req, res) => {
  const { id } = req.params;
  const { title } = req.body;
  const file = req.file;

  const game = await providers.getGameById(id);
  if (!game.status) return res.status(404).json({ error: "Game not found" });
  if (!file) return res.status(400).json({ error: "No image uploaded" });

  try {
    // เก็บเฉพาะ path ของไฟล์
    const imgPath = `/images/uploads/${file.filename}`;
    const newImg = await providers.addGameImage(id, title || "Untitled", imgPath);
    res.status(201).json({ status: true, data: newImg });
  } catch (err) {
    console.error("Error uploading gallery image:", err);
    res.status(500).json({ error: err.message });
  }
});


// ✅ ดึงรายการรูปของเกม
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


// ✅ ดึงรูปเดี่ยวจาก gallery (ตอนนี้ไม่ต้องส่งไฟล์จริงจาก DB แล้ว)
router.get('/games/:id/gallery/:img_id', async (req, res) => {
  const { id, img_id } = req.params;
  const game = await providers.getGameById(id);
  if (!game.status) return res.status(404).json({ error: "Game not found" });
  try {
    const result = await providers.getGameImage(id, img_id);
    if (!result.status || !result.data)
      return res.status(404).json({ error: "❌ Image not found" });

    // ✅ ส่งแค่ path ให้ frontend ไปโหลดเอง
    res.json({ status: true, data: result.data });
  } catch (err) {
    console.error("Error fetching gallery image:", err);
    res.status(500).send("Error fetching image");
  }
});


// ✅ ลบรูปออกจาก gallery
router.delete('/games/:id/gallery/:img_id', async (req, res) => {
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
