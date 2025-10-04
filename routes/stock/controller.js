import express from 'express';
import Providers from './service.js'
import multer from 'multer';
import db from '../databace/db.js';
const providers = new Providers();
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.json({ title: 'Stock API', data: 'This is stock API' });
});

// ✅ ดึงข้อมูลเกม===============================
router.get('/games', async (req, res) => {
  const result = await providers.listGames();
  res.json(result);
});

router.get('/games/:id', async (req, res) => {
  const { id } = req.params;
  const result = await providers.getGameById(id);
  res.json(result);
});

router.get("/image/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const rows = await db.QQuery("SELECT image_poster FROM games WHERE id = $1;", [id]);

    // ✅ ตรวจ array แทน object
    if (!rows || rows.rowCount === 0 || !rows.rows[0].image_poster) {
      return res.status(404).send("❌ No image found");
    }

    res.set("Content-Type", "image/jpeg"); // หรือ image/png ตามจริง
    res.send(rows.rows[0].image_poster);
  } catch (err) {
    console.error("Error fetching image:", err);
    res.status(500).send("Error fetching image");
  }
});



// ✅ เพิ่มเกมใหม่======================================
router.post('/games', async (req, res) => {
  const { title, price, stock , description_md, release_date, platform_flags} = req.body;
  if (!title || !price || !stock) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  const newGame = await providers.createGame(title, price, stock, description_md, release_date, platform_flags);
  res.status(201).json(newGame);
});

// สำหรับอัปโหลดรูปภาพ

const upload = multer({ storage: multer.memoryStorage() });
router.post('/games/:id/img', upload.single("image"), async (req, res) => {
  const { id } = req.params;
  const file = req.file;
console.log(req.file);
  const result = await providers.getGameById(id);
  if (!result.status) {
    return res.status(404).json({ status:false, message: "Game not found" });
  }
  if (!file) {
    return res.status(400).json({ message: "No file uploaded" });
  }
  try {
    await db.QQuery(
      "UPDATE games SET image_poster = $1 WHERE id = $2",
      [file.buffer, id]
    );
    res.json({ status: true, message: "Image uploaded successfully" });
  } catch (err) {
    console.error("Error uploading image:", err);
    res.status(500).json({ status: false, error: err.message });
  }
});





// ✅ เพิ่ม/ลด stock =============================

router.put('/games/:id/stock', async (req, res) => {
  const { id } = req.params;
  const { action } = req.body; // action: "increase" หรือ "decrease"
  if (!action || (action !== 'increase' && action !== 'decrease')) {
    return res.status(400).json({ error: 'Invalid action' });
  }
  try {
    const updated = await providers.updateStock(id, action);
    res.json(updated[0]);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// ✅ ปรับราคาเกม===================================
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


// ✅ ลบเกม=========================================

router.delete('/games/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const deleted = await providers.deleteGame(id);
    res.json(deleted.rows[0]);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});


// ✅ อัปเดตคำอธิบาย, วันที่วางจำหน่าย, แพลตฟอร์ม =============================
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

export default  router;
