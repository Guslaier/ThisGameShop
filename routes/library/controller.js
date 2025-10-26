import LibraryService from "./service.js";
const service = new LibraryService();


function sendError(res, err, code = 500, fallback = "Internal Server Error") {
  console.error("[LibraryController]", err);
  const message = typeof err?.message === "string" ? err.message : fallback;
  return res.status(code).json({ status: false, message });
}

export const LibraryController = {
  // 🧭 หน้าเว็บ Library ของผู้ใช้
  page(req, res) {
    try {
      res.render("library", {
        title: "My Library",
        user: req.session.user,
        activePage: "library",
      });
    } catch (err) {
      sendError(res, err, 500, "Render error");
    }
  },

  // ✅ ดึงรายการเกมในคลัง
  async list(req, res) {
    try {
      // const user_id = req.session.user?.id;
      // if (!user_id) return res.status(401).json({ status: false, message: "Unauthorized" });

      const result = await service.listUserLibrary(2); // <-- ใช้ตามที่คุณเทสต์อยู่
      return res.json({ status: true, data: result.rows });
    } catch (err) {
      return sendError(res, err);
    }
  },

  // ✅ ดึงรายละเอียดเกมในคลัง
  async detail(req, res) {
    try {
      const user_id = req.session.user?.id;
      if (!user_id) {
        return res
          .status(401)
          .json({ status: false, message: "Unauthorized" });
      }

      const { id } = req.params;
      if (!id || Number.isNaN(Number(id))) {
        return res
          .status(400)
          .json({ status: false, message: "Invalid library item id" });
      }

      const result = await service.getLibraryItemById(user_id, id);
      if (result.rowCount === 0) {
        return res
          .status(404)
          .json({ status: false, message: "Item not found" });
      }

      return res.json({ status: true, data: result.rows[0] });
    } catch (err) {
      return sendError(res, err);
    }
  },

  // ✅ สำหรับ admin: ดูคลังทั้งหมด
  async listAll(req, res) {
    try {
      const result = await service.listAllLibrary();
      return res.json({ status: true, data: result.rows });
    } catch (err) {
      return sendError(res, err);
    }
  },
};
