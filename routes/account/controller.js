import express from 'express';
import Providers from './service.js';
import multer from 'multer';
import db from '../databace/db.js';
import otpGenerator from 'otp-generator';
import nodemailer from 'nodemailer';
const providers = new Providers();
const router = express.Router();

let otpStore = {}; // { email: { code: '123456', expires: <timestamp> } }

// ✅ Generate OTP (มีอายุ 30 นาที)
router.post("/generate-otp", async (req, res) => {
  const { email } = req.body;

  // สร้าง OTP 6 หลัก
  const otp = otpGenerator.generate(6, { upperCase: false, specialChars: false });

  // ตั้งเวลาหมดอายุ (30 นาที)
  const expiresAt = Date.now() + 30 * 60 * 1000;

  // เก็บใน store
  otpStore[email] = { code: otp, expires: expiresAt };

  // ✅ ส่งอีเมล
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "665021001003@mail.rmutk.ac.th",
      pass: "wquiov ycnijiw nji".replace(/\s/g, ""), // app password 16 ตัว (ไม่มีช่องว่าง)
    },
  });

  try {
    await transporter.sendMail({
      from: "665021001003@mail.rmutk.ac.th",
      to: email,
      subject: "Your OTP Code",
      text: `Your OTP is ${otp}\n\n(Valid for 30 minutes)`,
    });

    res.send("OTP sent successfully!");
  } catch (error) {
    console.error("error:", error);
    res.status(500).send("Failed to send OTP");
  }
});

// ✅ Verify OTP
router.post("/verify-otp", (req, res) => {
  const { email, otp } = req.body;
  const record = otpStore[email];

  if (!record) {
    return res.status(400).send("No OTP found for this email!");
  }

  // ตรวจสอบหมดอายุ
  if (Date.now() > record.expires) {
    delete otpStore[email]; // ลบออกเมื่อหมดเวลา
    return res.status(400).send("OTP expired! Please request a new one.");
  }

  // ตรวจสอบรหัสถูกไหม
  if (otp === record.code) {
    delete otpStore[email]; // ลบหลังใช้สำเร็จ
    res.send("OTP verified successfully!");
  } else {
    res.status(400).send("Invalid OTP!");
  }
});


// ===============================
// 🧠 Initial Setup
// ===============================

// 🧱 ตั้งค่า multer ให้เก็บรูปใน public/images/uploads/
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/images/uploads/'); // 📁 เก็บในโฟลเดอร์นี้
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = file.originalname.split('.').pop();
    cb(null, `profile-${uniqueSuffix}.${ext}`);
  }
});

const upload = multer({ storage });

// =====================================================
// 🔰 0. PAGE ROUTES (Render Views)
// =====================================================

// 🏠 หน้าแรก → login page
router.get('/', (req, res) => {
  res.render('login', { title: 'Login' });
});

// 🧍 หน้าโปรไฟล์
router.get('/profile', (req, res) => {
  res.render('profile', { title: 'Profile' });
});

// 📝 หน้า register
router.get('/register', (req, res) => {
  res.render('register', { title: 'Register' });
});

// =====================================================
// 👤 1. AUTHENTICATION (สมัครสมาชิก / เข้าสู่ระบบ / ออกจากระบบ)
// =====================================================

// 🟩 สมัครสมาชิก (Register)
router.post('/register-sum', async (req, res) => {
  const { email, password, display_name } = req.body;

  // ตรวจว่า email ซ้ำไหม
  const user = await providers.getUserByEmail(email);

  if (user.rowCount > 0) {
    return res.status(400).json({ message: 'Email already registered', status: false });
  }

  // ตรวจความถูกต้องของข้อมูล
  if (!email || !password || password.length < 6) {
    return res.status(400).json({ message: 'Invalid email or password', status: false });
  }

  // สร้างผู้ใช้ใหม่ + ตั้ง role = "user"
  const newUser = await providers.register(email, password, display_name);
  console.log("dsfd ==" + newUser)
  const updatedUser = await providers.setUserRole(newUser.rows[0].id, 'user');

  res.json({ status: true });
});

// 🟩 เข้าสู่ระบบ (Login)
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await providers.login(email, password);

  if (user.rowCount > 0) {
    req.session.user = {
      id: user.rows[0].id,
      email: user.rows[0].email,
      display_name: user.rows[0].display_name,
      role: user.rows[0].role,
    };
    res.json({ message: 'Login successful', user: req.session.user, status: true });
  } else {
    res.status(401).json({ message: 'Invalid email or password', status: false });
  }
});

// 🟩 ตรวจสอบ session ปัจจุบัน
router.post('/session', (req, res) => {
  if (req.session.user) {
    res.json({
      loggedIn: true,
      user: {
        id: req.session.user.id,
        display_name: req.session.user.display_name,
        role: req.session.user.role,
      },
    });
  } else {
    res.json({ loggedIn: false });
  }
});

// 🟥 ออกจากระบบ (Logout)
router.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/');
});

// =====================================================
// 📇 2. USER PROFILE (ดูข้อมูล / อัปเดต / ลบ)
// =====================================================

// ✅ ดึงข้อมูลโปรไฟล์ของ user ปัจจุบัน
router.get('/user', async (req, res) => {
  if (!req.session.user) return res.status(401).json({ message: 'Unauthorized' });
  const user = await providers.getUserById(req.session.user.id);
  res.json(user[0]);
});

// ✅ แสดงรายชื่อผู้ใช้ทั้งหมด (admin)
router.get('/list', async (req, res) => {
  const users = await providers.listUsers();
  res.json(users.rows);
});

// ✅ อัปเดตชื่อ / รหัสผ่าน
router.post('/update', async (req, res) => {
  const { display_name, password } = req.body;

  if (!req.session.user) return res.status(401).json({ message: 'Unauthorized' });

  // อัปเดตชื่อ
  if (display_name) {
    const user = await providers.updateUser(req.session.user.id, display_name);
    return res.json(user[0]);
  }

  // อัปเดตรหัสผ่าน
  if (password && password.length >= 6) {
    const user = await providers.updatePassword(req.session.user.id, password);
    return res.json(user[0]);
  }

  res.status(400).json({ message: 'No valid fields to update', status: false });
});

// 🟥 ลบบัญชีผู้ใช้
router.post('/delete', async (req, res) => {
  if (!req.session.user) return res.status(401).json({ message: 'Unauthorized' });
  await providers.deleteUser(req.session.user.id);
  req.session.destroy();
  res.json({ message: 'Account deleted', status: true });
});

// =====================================================
// 🖼️ 3. USER PROFILE IMAGE (อัปโหลด / ดึงรูป)
// =====================================================

// ✅ อัปโหลดรูปโปรไฟล์ (เก็บ path)
router.post('/image/:id', upload.single("image"), async (req, res) => {
  const { id } = req.params;
  const file = req.file;

  if (!file) return res.status(400).json({ status: false, message: "No file uploaded" });

  const user = await providers.getUserById(id);
  if (!user || user.rowCount === 0) {
    return res.status(404).json({ status: false, message: "User not found" });
  }

  try {
    // ✅ เก็บเฉพาะ path ของรูป เช่น "/images/uploads/profile-123456.jpg"
    const imgPath = `/images/uploads/${file.filename}`;
    await db.QQuery("UPDATE USERS SET profile_image = $1 WHERE id = $2", [imgPath, id]);

    res.json({
      status: true,
      message: "Profile image updated successfully",
      image: imgPath
    });
  } catch (err) {
    console.error("Error uploading profile image:", err);
    res.status(500).json({ status: false, error: err.message });
  }
});

// ✅ ดึงรูปโปรไฟล์ผู้ใช้ (ส่งเป็น path)
router.get("/image/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const rows = await db.QQuery("SELECT profile_image FROM USERS WHERE id = $1;", [id]);

    if (!rows || rows.rowCount === 0 || !rows.rows[0].profile_image) {
      return res.status(404).json({ status: false, message: "❌ No image found" });
    }
    // ✅ ส่ง path ของรูปไปให้ frontend ใช้ได้ทันที
    res.json({
      status: true,
      image: rows.rows[0].profile_image
    });

  } catch (err) {
    console.error("Error fetching image:", err);
    res.status(500).json({ status: false, error: err.message });
  }
});

export default router;
