import express from 'express';
import Providers from './service.js'
import e from 'express';
const providers = new Providers();
var router = express.Router();

// หน้าแรก -> render หน้า login
router.get('/', function (req, res, next) {
  res.render('login', { title: 'Login' });
});

router.get('profile', function (req, res, next) {
  res.render('profile', { title: 'Profile' });
});

// หน้า register -> render หน้า register
router.get('/register', function (req, res, next) {
  res.render('register', { title: 'register' });
});

// สมัครสมาชิก (Register)
router.post('/register-sum', async function (req, res, next) {
  const { email, password, display_name } = req.body;

  // ตรวจสอบว่า email มีอยู่แล้วหรือยัง
  const user = await providers.getUserByEmail(email);
  if (user.length > 0) {
    return res.status(400).json({ message: 'Email already registered', status: false });
  }

  // ตรวจสอบความถูกต้องของ email และ password
  if (!email || !password || password.length < 6) {
    return res.status(400).json({ message: 'Invalid email or password', status: false });
  }

  // สร้างผู้ใช้ใหม่
  const newUser = await providers.register(email, password, display_name);
  // กำหนด role เป็น "user"
  const updatedUser = await providers.setUserRole(newUser.rows[0].id, 'user');

  // ส่งผลลัพธ์กลับ
  res.json(updatedUser[0]);
});

// เข้าสู่ระบบ (Login)
router.post('/login', async function (req, res, next) {
  const { email, password } = req.body;
  const user = await providers.login(email, password);

  // ถ้า login สำเร็จ
  if (user.rowCount > 0) {
    req.session.user = {
      id: user.rows[0].id,
      email: user.rows[0].email,
      display_name: user.rows[0].display_name,
      role: user.rows[0].role
    };
    res.json({ message: 'Login successful', user: req.session.user, status: true });
  } else {
    // ถ้า login ไม่สำเร็จ
    res.status(401).json({ message: 'Invalid email or password', status: false });
  }
});
router.post('/session', (req, res) => {
    if (req.session.user) {
    res.json({
      loggedIn: true,
      user: {
        id: req.session.user.id,
        display_name: req.session.user.display_name,
        role: req.session.user.role
      }
    });
  } else {
    res.json({ loggedIn: false });
  }
});
// ออกจากระบบ (Logout)
router.get('/logout', function (req, res, next) {
  req.session.destroy();
  res.redirect('/');
});

// ข้อมูลโปรไฟล์ของ user ปัจจุบัน
router.get('/user', async function (req, res, next) {
  const user = await providers.getUserById(req.session.user.id);
  res.json(user[0]);
});

// แสดงรายการผู้ใช้ทั้งหมด
router.get('/list', async function (req, res, next) {
  const users = await providers.listUsers();
  console.log(users.rows);
  res.json(users.rows);
});

// อัปเดตข้อมูลผู้ใช้ (ชื่อ / รหัสผ่าน)
router.post('/update', async function (req, res, next) {
  const { display_name, password } = req.body;

  // อัปเดต display_name
  if (display_name) {
    let user = await providers.updateUser(req.session.user.id, display_name);
    return res.json(user[0]);
  }

  // อัปเดตรหัสผ่าน
  if (password && password.length >= 6) {
    let user = await providers.updatePassword(req.session.user.id, password);
    return res.json(user[0]);
  }

  // ถ้าไม่ส่ง field ที่ valid มา
  res.status(400).json({ message: 'No valid fields to update', status: false });
});

// ลบผู้ใช้ (Delete Account)
router.post('/delete', async function (req, res, next) {
  await providers.deleteUser(req.session.user.id);  
  req.session.destroy();
  res.json({ message: 'Account deleted', status: true });
});

export default router;
