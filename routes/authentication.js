// 📁 authentication.js
export default class Authentication {
  static isAuthenticated(req, res, next) {
    if (req.session && req.session.user) return next();
    return res.redirect('/'); // กลับหน้า login
  }

  static authorize(roles = []) {
    return (req, res, next) => {
      if (!req.session || !req.session.user) {
        if (req.xhr || req.headers.accept?.includes('application/json')) {
          return res.status(401).json({ status: false, message: "กรุณาเข้าสู่ระบบ" });
        }
        return res.redirect('/');
      }

      const userRole = req.session.user.role;

      if (roles.length === 0 || roles.includes(userRole)) {
        return next();
      }

      // ถ้าไม่มีสิทธิ์
      if (req.xhr || req.headers.accept?.includes('application/json') || req.method !== 'GET') {
        // 🔹 ตอบ JSON แทน redirect
        return res.status(403).json({
          status: false,
          message: "คุณไม่มีสิทธิ์เข้าถึงหน้านี้",
          role: userRole,
          allowed: roles
        });
      }

      // 🔹 ถ้าเป็น request ปกติ (เปิดหน้าใน browser)
      return res.redirect('/no-access');
    };
  }

}