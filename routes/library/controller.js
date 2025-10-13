import LibraryService from "./service.js";
const service = new LibraryService();

export const LibraryController = {
  // 🧭 หน้าเว็บ Library ของผู้ใช้
  page(req, res) {
    res.render("library", {
      title: "My Library",
      user: req.session.user,
      activePage: "library",
    });
  },

  // ✅ ดึงรายการเกมในคลัง
  async list(req, res) {
    const user_id = req.session.user?.id;
    if (!user_id) return res.status(401).json({ status: false, message: "Unauthorized" });

    const result = await service.listUserLibrary(user_id);
    res.json({ status: true, data: result.rows });
  },

  // ✅ ดึงรายละเอียดเกมในคลัง
  async detail(req, res) {
    const user_id = req.session.user?.id;
    const { id } = req.params;

    const result = await service.getLibraryItemById(user_id, id);
    if (result.rowCount === 0)
      return res.status(404).json({ status: false, message: "Item not found" });

    res.json({ status: true, data: result.rows[0] });
  },

  // ✅ สำหรับ admin: ดูคลังทั้งหมด
  async listAll(req, res) {
    const result = await service.listAllLibrary();
    res.json({ status: true, data: result.rows });
  },
};
