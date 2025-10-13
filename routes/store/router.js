import express from 'express';
import Providers from '../stock/service.js'; // ✅ ดึงจาก stock/service.js
import Authentication from '../authentication.js';

const providers = new Providers();
const { isAuthenticated } = Authentication;
const router = express.Router();

// 🌐 แสดงหน้า store
router.get('/', async (req, res) => {
  try {
    // ดึงข้อมูลเกมทั้งหมด (เฉพาะที่ยังไม่ลบ)
    const games = await providers.listGames();

    res.render('store', { 
      title: 'ThisGameShop Store',
      activePage: 'store',
      user: req.session.user || null,
      games: games.rows || [] 
    });
  } catch (err) {
    console.error("❌ Error loading store:", err);
    res.status(500).send("Server error while loading store.");
  }
});

// 🌐 ดึงข้อมูลเกมทั้งหมด (API ใช้ใน client fetch)
router.get('/api/games', async (req, res) => {
  try {
    const games = await providers.listGames();
    res.json({ status: true, data: games.rows });
  } catch (err) {
    console.error("❌ Error fetching games:", err);
    res.status(500).json({ status: false, message: err.message });
  }
});

// 🌐 ดึงข้อมูลเกมตาม ID (ใช้ตอนกดดูรายละเอียด)
router.get('/api/game/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await providers.getGameById(id);
    if (!result.status) return res.status(404).json(result);
    res.json({ status: true, data: result.game });
  } catch (err) {
    console.error("❌ Error fetching game:", err);
    res.status(500).json({ status: false, message: err.message });
  }
});

export default router;
