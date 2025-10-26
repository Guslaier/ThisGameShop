// 📁 /routes/account/controller.js
import Providers from "./service.js";
import db from "../databace/db.js";
import otpGenerator from "otp-generator";
import nodemailer from "nodemailer";
import multer from "multer";

const providers = new Providers();
let otpStore = {}; // เก็บ OTP ชั่วคราวในหน่วยความจำ

// ===============================
// 📦 OTP SYSTEM
// ===============================
export const OTPController = {
  async generate(req, res) {
    const { email } = req.body;
    const otp = otpGenerator.generate(6, { upperCase: false, specialChars: false });
    const expires = Date.now() + 30 * 60 * 1000;
    otpStore[email] = { code: otp, expires };

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "665021001003@mail.rmutk.ac.th",
        pass: "wquiovycnijiwnji",
      },
    });

    try {
      await transporter.sendMail({
        from: "ThisGameShop <665021001003@mail.rmutk.ac.th>",
        to: email,
        subject: "Your OTP Code",
        text: `Your OTP is ${otp} (valid 30 minutes)`,
      });
      res.json({ status: true, message: "OTP sent successfully" });
    } catch (err) {
      res.status(500).json({ status: false, message: "Send mail failed" });
    }
  },

  verify(req, res) {
    const { email, otp } = req.body;
    const record = otpStore[email];
    if (!record) return res.status(400).json({ status: false, message: "No OTP found" });
    if (Date.now() > record.expires)
      return res.status(400).json({ status: false, message: "OTP expired" });
    if (record.code !== otp)
      return res.status(400).json({ status: false, message: "Invalid OTP" });

    if (!req.session.otpVerified) req.session.otpVerified = {};
    req.session.otpVerified[email] = true;
    delete otpStore[email];

    res.json({ status: true, message: "OTP verified successfully" });
  },
};

// ===============================
// 👤 USER ACCOUNT SYSTEM
// ===============================
export const UserController = {
  async getsession(req, res) {
    if (req.session.user) {
      res.json({ loggedIn: true, user: req.session.user });
    } else {
      res.json({ loggedIn: false });
    }
  },

  async getImage(req, res) {
    const { id } = req.params;

    try {
      const result = await providers.getUserById(id);
      if (!result || result.rowCount === 0 || !result.rows[0].profile_image)
        return res.status(404).json({ status: false, message: "No image found" });

      res.json({ status: true, image: result.rows[0].profile_image });
    } catch (err) {
      console.error("❌ Error fetching image:", err);
      res.status(500).json({ status: false, message: err.message });
    }
  },
  async UpImge(req, res) {
    const { id } = req.params;
    const file = req.file;

    if (!file)
      return res.status(400).json({ status: false, message: "No file uploaded" });

    // ตรวจว่าผู้ใช้นี้มีอยู่จริงไหม
    const user = await providers.getUserById(id);
    if (!user || user.rowCount === 0)
      return res.status(404).json({ status: false, message: "User not found" });

    try {
      const imgPath = `/images/uploads/${file.filename}`;
      await providers.updateProfileImage(id, imgPath);
      res.json({ status: true, message: "Profile image updated", image: imgPath });
    } catch (err) {
      console.error("❌ Error updating profile image:", err);
      res.status(500).json({ status: false, message: err.message });
    }
  },
  async registerAdmod(req, res) {
    const { email, password, display_name, role } = req.body;

    if (!email || !password || !display_name || !role)
      return res.status(400).json({ status: false, message: 'Missing fields' });
    const user = await providers.getUserByEmail(email);

    if (user.rowCount > 0) {
      return res.status(400).json({ message: 'Email already registered', status: false });
    }

    if (role === 'root')
      return res.status(403).json({ status: false, message: 'Cannot create root user' });

    try {
      // ตรวจสอบอีเมลซ้ำ 
      const check = await db.QQuery('SELECT id FROM users WHERE email=$1', [email]);
      if (check.rowCount > 0)
        return res.status(400).json({ status: false, message: 'Email already exists' });

      // เพิ่มผู้ใช้ใหม่ 
      const result = await db.QQuery(
        `INSERT INTO users (email, password_hash, display_name, role, is_active) 
      VALUES ($1, crypt($2, gen_salt('bf')), $3, $4, true) RETURNING id,
        email, display_name, role, is_active, created_at`,
        [email, password, display_name, role]);
      res.json({ status: true, data: result.rows[0] });

    }
    catch (err) {
      console.error("Add user error:", err);
      res.status(500).json({ status: false, message: 'Database error' });
    }
  },


  async register(req, res) {
    const { email, password, display_name } = req.body;

    if (!req.session.otpVerified?.[email])
      return res.status(403).json({ status: false, message: "Email not verified by OTP" });

    const exists = await providers.getUserByEmail(email);
    if (exists.rowCount > 0)
      return res.status(400).json({ status: false, message: "Email already exists" });

    const user = await providers.register(email, password, display_name);
    await providers.setUserRole(user.rows[0].id, "user");

    delete req.session.otpVerified[email];
    res.json({ status: true, message: "Registered successfully", user: user.rows[0] });
  },

  async login(req, res) {
    const { email, password } = req.body;
    const result = await providers.login(email, password);

    if (result.rowCount === 0)
      return res.status(401).json({ status: false, message: "Invalid credentials" });

    const user = result.rows[0];
    if (!user.is_active)
      return res.status(403).json({ status: false, message: "Account blocked" });

    req.session.user = {
      id: user.id,
      email: user.email,
      display_name: user.display_name,
      role: user.role,
    };

    const redirectTo = ["admin", "staff"].includes(user.role) ? "/ad-m" : "/";
    res.json({ status: true, message: "Login success", redirectTo, user: req.session.user });
  },

  logout(req, res) {
    req.session.destroy();
    res.redirect("/");
  },

  async profile(req, res) {
    if (!req.session.user) {
      return res.render("profile", {
        title: 'Profile', activePage: 'profile',
        "id": 999,
        "email": "123",
        "display_name": "123",
        "role": "123",
        "profile_image": '',
        "created_at": ""
      })
    }
    const user = await providers.getUserById(req.session.user.id);
    return res.render("profile", {
      title: 'Profile', activePage: 'profile',
      "id": user.rows[0].id,
      "email": user.rows[0].email,
      "display_name": user.rows[0].display_name,
      "role": user.rows[0].role,
      "profile_image": user.rows[0].profile_image,
      "created_at": user.rows[0].created_at
    });
  },

  async update(req, res) {
    const { id, display_name, password } = req.body;
    if (display_name) {
      const user = await providers.updateUser(id, display_name);
      return res.json({ status: true, user: user.rows[0] });
    }
    res.status(400).json({ status: false, message: "No valid fields to update" });
  },

  async list(req, res) {
    const users = await providers.listUsers();
    res.json({ status: true, data: users.rows });
  },

  async changeRole(req, res) {
    const { id, role } = req.body;
    if (id == 1 || role === "root")
      return res.status(403).json({ status: false, message: "Cannot modify root admin" });

    await providers.setUserRole(id, role);
    res.json({ status: true, message: "Role updated" });
  },

  async changeActive(req, res) {
    const { id } = req.params;
    const { is_active } = req.body;
    await providers.setUserActiveStatus(id, is_active);
    res.json({ status: true, message: "User status updated" });
  },

  async delete(req, res) {
    const { id } = req.params;
    await providers.deleteUser(id);
    res.json({ status: true, message: "User deleted" });
  },

  async reUser(req, res) {
    const { id } = req.params;
    await providers.ReUser(id);
    res.json({ status: true, message: "User reactivated" });
  },
  async resetPassword(req, res) {
    try {
      const { email, otp, new_password } = req.body;

      // ตรวจสอบฟิลด์เบื้องต้น
      if (!email || !new_password) {
        return res.status(400).json({ status: false, message: "Missing email or new_password" });
      }
      if (String(new_password).length < 8) {
        return res.status(400).json({ status: false, message: "Password must be at least 8 characters" });
      }

      // ตรวจสอบสถานะการยืนยัน OTP
      let verified = false;

      // 1) เคสที่กดยืนยัน OTP มาก่อนแล้ว (verify endpoint) จะมีธงใน session
      if (req.session?.otpVerified?.[email]) {
        verified = true;
      } else {
        // 2) เคสยังไม่ verify แต่อยากยืนยันในคำขอ reset นี้เลย (ต้องมี otp ตรงกับ otpStore และยังไม่หมดอายุ)
        const record = otpStore[email];
        if (!otp) {
          return res.status(403).json({ status: false, message: "OTP not verified" });
        }
        if (!record) {
          return res.status(400).json({ status: false, message: "No OTP found" });
        }
        if (Date.now() > record.expires) {
          delete otpStore[email];
          return res.status(400).json({ status: false, message: "OTP expired" });
        }
        if (record.code !== otp) {
          return res.status(400).json({ status: false, message: "Invalid OTP" });
        }
        // ผ่าน OTP ในคำขอนี้
        verified = true;
      }

      if (!verified) {
        return res.status(403).json({ status: false, message: "OTP verification required" });
      }

      // ตรวจว่ามีผู้ใช้งานจริง
      const user = await providers.getUserByEmail(email);
      if (!user || user.rowCount === 0) {
        return res.status(404).json({ status: false, message: "User not found" });
      }

      await db.QQuery(
        `UPDATE users
           SET password_hash = crypt($2, gen_salt('bf')),
               updated_at = NOW()
         WHERE email = $1;`,
        [email, new_password]
      );

      // เคลียร์สถานะ OTP
      if (req.session?.otpVerified) delete req.session.otpVerified[email];
      if (otpStore[email]) delete otpStore[email];

      return res.json({ status: true, message: "Password reset successful" });
    } catch (err) {
      console.error("❌ Reset password error:", err);
      return res.status(500).json({ status: false, message: "Internal Server Error" });
    }
  }
};
