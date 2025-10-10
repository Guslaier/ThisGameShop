// 📁 authentication.js
export default class Authentication {
  static isAuthenticated(req, res, next) {
    return next()
    if (req.session && req.session.user) return next();
    return res.redirect('/'); // กลับหน้า login
  }

  static authorize(roles = []) {
    return (req, res, next) => {
      return next()
      if (!req.session || !req.session.user) {
        return res.redirect('/');
      }

      const userRole = req.session.user.role;

      if (roles.length === 0 || roles.includes(userRole)) {
        return next();
      }

      // ถ้าไม่มีสิทธิ์
      if (req.xhr || req.headers.accept?.includes('application/json')) {
        // 🔸 ตอบ JSON (ไว้ให้ script ดัก)
        return res.status(403).json({
          status: false,
          message: "คุณไม่มีสิทธิ์เข้าถึงหน้านี้",
          role: userRole,
          allowed: roles
        });
      }

      // 🔸 ถ้าเปิด URL เอง → redirect ไปหน้า error
      return res.redirect('/no-access');
    };
  }
}