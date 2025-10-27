// 📁 /routes/account/router.js
import express from "express";
import { OTPController, UserController } from "./controller.js";
import Authentication from "../authentication.js";
import multer from "multer";

const { isAuthenticated, authorize } = Authentication;
const router = express.Router();
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'public/images/uploads/'),
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = file.originalname.split('.').pop();
    cb(null, `profile-${unique}.${ext}`);
  }
});
const upload = multer({ storage });

// 🔐 OTP
router.post("/generate-otp", OTPController.generate);
router.post("/verify-otp", OTPController.verify);

// 👤 AUTH
router.post("/register-sum", UserController.register);
router.get('/login', (req, res) => res.render('login', { title: 'Login' , activePage: 'login' })); 
router.get('/register', (req, res) => res.render('register', { title: 'Register',activePage: 'register' }))
router.post("/login-sm", UserController.login);
router.get("/logout", UserController.logout);
router.get('/session',UserController.getsession);

// 👥 USERS
router.post("/password/reset", UserController.resetPassword);
router.post("/add", authorize(["admin", "staff"]), UserController.registerAdmod);
router.get("/list", authorize(["admin", "staff"]), UserController.list);
router.put("/update", authorize(["admin", "staff"]), UserController.update);
router.put("/update-role", authorize(["admin"]), UserController.changeRole);
router.put("/:id/status", authorize(["admin"]), UserController.changeActive);
router.delete("/delete/:id", authorize(["admin"]), UserController.delete);
router.post("/re-de/:id", authorize(["admin"]), UserController.reUser);
router.get("/profile", isAuthenticated, UserController.profile);
router.put('/profile/:id', isAuthenticated, UserController.updateProfile);
router.put('/password/:id', isAuthenticated, UserController.changePassword);
router.get("/libery-oder", isAuthenticated, (req, res) => res.render('libery-oder', { title: 'libery-oder',activePage: 'libery' }));


/** ✅ POST /account/image/:id — อัปโหลดหรืออัปเดตรูปโปรไฟล์ */
router.post('/image/:id', isAuthenticated, upload.single("image"),UserController.UpImge );

/** ✅ GET /account/image/:id — ดึงรูปโปรไฟล์ */
router.get('/image/:id', isAuthenticated, UserController.getImage);

//  DELETE /account/image/:id — ลบรูปโปรไฟล์ */
router.delete('/image/:id', isAuthenticated, UserController.deleteImage);

export default router;


