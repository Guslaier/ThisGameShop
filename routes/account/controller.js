import express from 'express';
import Providers from './service.js';
import multer from 'multer';
import db from '../databace/db.js';
import otpGenerator from 'otp-generator';
import nodemailer from 'nodemailer';
import Authentication from '../authentication.js';

const { isAuthenticated, authorize } = Authentication;
const providers = new Providers();
const router = express.Router();

// ===============================
// 📦 OTP SYSTEM
// ===============================
let otpStore = {}; // { email: { code: '123456', expires: <timestamp> } }

router.post("/generate-otp", async (req, res) => {
  const { email } = req.body;
  const otp = otpGenerator.generate(6, { upperCase: false, specialChars: false });
  const expiresAt = Date.now() + 30 * 60 * 1000;
  otpStore[email] = { code: otp, expires: expiresAt };

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "665021001003@mail.rmutk.ac.th",
      pass: "wquiov ycnijiw nji".replace(/\s/g, ""),
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

router.post("/verify-otp", (req, res) => {
  const { email, otp } = req.body;
  const record = otpStore[email];
  if (!record) return res.status(400).send("No OTP found for this email!");
  if (Date.now() > record.expires) {
    delete otpStore[email];
    return res.status(400).send("OTP expired! Please request a new one.");
  }
  if (otp === record.code) {
    delete otpStore[email];
    res.send("OTP verified successfully!");
  } else {
    res.status(400).send("Invalid OTP!");
  }
});

// ===============================
// 📁 Upload Config
// ===============================
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'public/images/uploads/'),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = file.originalname.split('.').pop();
    cb(null, `profile-${uniqueSuffix}.${ext}`);
  }
});
const upload = multer({ storage });

// ===============================
// 🌐 Page Routes
// ===============================
router.get('/', (req, res) => res.render('login', { title: 'Login' , activePage: 'login' }));
router.get('/register', (req, res) => res.render('register', { title: 'Register',activePage: 'register' }));
router.get('/profile', isAuthenticated, (req, res) => {
  res.render('profile', { title: 'Profile', user: req.session.user ,activePage: 'profile' });
});

// ===============================
// 👤 Authentication
// ===============================
router.post('/register-sum', async (req, res) => {
  const { email, password, display_name } = req.body;
  const user = await providers.getUserByEmail(email);
  if (user.rowCount > 0)
    return res.status(400).json({ message: 'Email already registered', status: false });
  if (!email || !password || password.length < 6)
    return res.status(400).json({ message: 'Invalid email or password', status: false });

  const newUser = await providers.register(email, password, display_name);
  await providers.setUserRole(newUser.rows[0].id, 'user');
  res.json({ status: true });
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await providers.login(email, password);
  if (user.rowCount === 0)
    return res.status(401).json({ message: 'Invalid email or password', status: false });

  req.session.user = {
    id: user.rows[0].id,
    email: user.rows[0].email,
    display_name: user.rows[0].display_name,
    role: user.rows[0].role,
  };

  // ✅ redirect ตาม role
  let redirectTo = '/';
  if (user.rows[0].role === 'admin') redirectTo = '/ad-m';
  else if (user.rows[0].role === 'staff') redirectTo = '/ad-m';

  res.json({ message: 'Login successful', redirectTo, user: req.session.user, status: true });
});

router.post('/session', (req, res) => {
  if (req.session.user) {
    res.json({ loggedIn: true, user: req.session.user });
  } else {
    res.json({ loggedIn: false });
  }
});

router.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/');
});

// ===============================
// 📇 User Profile
// ===============================
router.get('/user', isAuthenticated, async (req, res) => {
  const user = await providers.getUserById(req.session.user.id);
  res.json(user[0]);
});

// ✅ ดูรายชื่อผู้ใช้ (admin, staff)
router.get('/list', authorize(['admin', 'staff']), async (req, res) => {
  const users = await providers.listUsers();
  res.json(users.rows);
});

// ✅ อัปเดตชื่อ/รหัสผ่าน (ทุก role ที่ล็อกอิน)
router.post('/update', isAuthenticated, async (req, res) => {
  const { display_name, password } = req.body;
  if (display_name) {
    const user = await providers.updateUser(req.session.user.id, display_name);
    return res.json(user[0]);
  }
  if (password && password.length >= 6) {
    const user = await providers.updatePassword(req.session.user.id, password);
    return res.json(user[0]);
  }
  res.status(400).json({ message: 'No valid fields to update', status: false });
});

// ✅ ลบ user (เฉพาะ admin)
router.post('/delete', authorize(['admin']), async (req, res) => {
  const { id } = req.body;
  await providers.deleteUser(id);
  res.json({ message: 'Account deleted by admin', status: true });
});

// ===============================
// 🖼️ Profile Image
// ===============================
router.post('/image/:id', isAuthenticated, upload.single("image"), async (req, res) => {
  const { id } = req.params;
  const file = req.file;
  if (!file) return res.status(400).json({ status: false, message: "No file uploaded" });

  const user = await providers.getUserById(id);
  if (!user || user.rowCount === 0)
    return res.status(404).json({ status: false, message: "User not found" });

  try {
    const imgPath = `/images/uploads/${file.filename}`;
    await db.QQuery("UPDATE USERS SET profile_image = $1 WHERE id = $2", [imgPath, id]);
    res.json({ status: true, message: "Profile image updated successfully", image: imgPath });
  } catch (err) {
    console.error("Error uploading profile image:", err);
    res.status(500).json({ status: false, error: err.message });
  }
});

router.get("/image/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const rows = await db.QQuery("SELECT profile_image FROM USERS WHERE id = $1;", [id]);
    if (!rows || rows.rowCount === 0 || !rows.rows[0].profile_image)
      return res.status(404).json({ status: false, message: "❌ No image found" });
    res.json({ status: true, image: rows.rows[0].profile_image });
  } catch (err) {
    console.error("Error fetching image:", err);
    res.status(500).json({ status: false, error: err.message });
  }
});

export default router;
