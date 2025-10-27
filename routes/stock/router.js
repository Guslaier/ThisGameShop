import express from "express";
import { StockController } from "./controller.js";
import Authentication from "../authentication.js";
import multer from "multer";

const { authorize } = Authentication;
const router = express.Router();

// Upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "public/images/uploads/"),
  filename: (req, file, cb) => {
    const ext = file.originalname.split(".").pop();
    cb(null, `game-${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`);
  },
});
const upload = multer({ storage });

// Routes
router.get("/games", StockController.list);
router.get("/games/:id", StockController.getById);
router.post("/games", authorize(["admin", "staff"]), upload.single("image"), StockController.create);
router.delete("/games/:id", authorize(["admin", "staff"]), StockController.delete);
router.put("/games/:id/stock", authorize(["admin", "staff"]), StockController.updateStock);
router.put("/games/:id/price", authorize(["admin", "staff"]), StockController.updatePrice);
router.get("/random-slide", StockController.randomSlide);
router.put('/games/:id', authorize(['admin', "staff"]), StockController.updateAll);

// =====================================================
// 🖼️ GAME IMAGE ROUTES
// =====================================================
router.get("/games/image/:id", StockController.getMainImage);
router.post("/games/:id/img", authorize(["admin", "staff"]), upload.single("image"), StockController.uploadMainImage);

// =====================================================
// 🖼️ GAME GALLERY ROUTES
// =====================================================
router.post("/games/:id/gallery", authorize(["admin", "staff"]), upload.single("image"), StockController.addGallery);
router.get("/games/:id/gallery", StockController.listGallery);
router.delete("/games/:id/gallery/:img_id", authorize(["admin", "staff"]), StockController.deleteGallery);

// =====================================================
// 🎲 RANDOM SLIDE
// =====================================================
router.get("/random-slide", StockController.randomSlide);
export default router;
