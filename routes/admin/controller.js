// 📁 /routes/admin/controller.js
import AdminService from "./service.js";
const adminService = new AdminService();

export const AdminController = {
  // ==========================
  // 🧭 DASHBOARD PAGES
  // ==========================
  index(req, res) {
    res.render("admin/index", {
      title: "Dashboard",
      user: req.session.user,
    });
  },

  usersPage(req, res) {
    res.render("admin/user", {
      title: "User Management",
      user: req.session.user,
    });
  },

  gamesPage(req, res) {
    res.render("admin/games", {
      title: "Game Management",
      user: req.session.user,
    });
  },

  ordersPage(req, res) {
    res.render("admin/orders", {
      title: "Orders",
      user: req.session.user,
    });
  },

  reportsPage(req, res) {
    res.render("admin/reports", {
      title: "Reports",
      user: req.session.user,
    });
  },

  // ==========================
  // 👤 USER API
  // ==========================
  async listUsers(req, res) {
    try {
      const users = await adminService.listUsers();
      res.json({ status: true, data: users.rows });
    } catch (err) {
      res.status(500).json({ status: false, message: err.message });
    }
  },

  async setUserActive(req, res) {
    const { id } = req.params;
    const { is_active } = req.body;
    try {
      const result = await adminService.setUserActiveStatus(id, is_active);
      res.json({ status: true, data: result.rows[0] });
    } catch (err) {
      res.status(500).json({ status: false, message: err.message });
    }
  },

  async deleteUser(req, res) {
    const { id } = req.params;
    try {
      const result = await adminService.deleteUser(id);
      res.json({ status: true, data: result.rows[0] });
    } catch (err) {
      res.status(500).json({ status: false, message: err.message });
    }
  },

  // ==========================
  // 🎮 GAME API
  // ==========================
  async listGames(req, res) {
    try {
      const result = await adminService.listGames();
      res.json({ status: true, data: result.rows });
    } catch (err) {
      res.status(500).json({ status: false, message: err.message });
    }
  },

  async createGame(req, res) {
    const { title, price, stock } = req.body;
    try {
      const result = await adminService.createGame(title, price, stock);
      res.json({ status: true, data: result.rows[0] });
    } catch (err) {
      res.status(500).json({ status: false, message: err.message });
    }
  },

  async updateStock(req, res) {
    const { id } = req.params;
    const { action } = req.body;
    if (!["increase", "decrease"].includes(action))
      return res.status(400).json({ status: false, message: "Invalid action" });

    try {
      const result = await adminService.updateStock(id, action);
      res.json({ status: true, data: result.rows[0] });
    } catch (err) {
      res.status(500).json({ status: false, message: err.message });
    }
  },

  async deleteGame(req, res) {
    const { id } = req.params;
    try {
      const result = await adminService.deleteGame(id);
      res.json({ status: true, data: result.rows[0] });
    } catch (err) {
      res.status(500).json({ status: false, message: err.message });
    }
  },

  // ==========================
  // 📊 REPORTS
  // ==========================
  async getStats(req, res) {
    try {
      const result = await adminService.getStats();
      res.json({ status: true, data: result.rows[0] });
    } catch (err) {
      res.status(500).json({ status: false, message: err.message });
    }
  },
};
