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
router.post("/games", authorize(["admin"]), upload.single("image"), StockController.create);
router.delete("/games/:id", authorize(["admin"]), StockController.delete);
router.put("/games/:id/stock", authorize(["admin"]), StockController.updateStock);
router.put("/games/:id/price", authorize(["admin"]), StockController.updatePrice);
router.get("/random-slide", StockController.randomSlide);
router.put('/games/:id', authorize(['admin']), StockController.updateAll);

// =====================================================
// 🖼️ GAME IMAGE ROUTES
// =====================================================
router.get("/games/image/:id", StockController.getMainImage);
router.post("/games/:id/img", authorize(["admin"]), upload.single("image"), StockController.uploadMainImage);

// =====================================================
// 🖼️ GAME GALLERY ROUTES
// =====================================================
router.post("/games/:id/gallery", authorize(["admin"]), upload.single("image"), StockController.addGallery);
router.get("/games/:id/gallery", StockController.listGallery);
router.delete("/games/:id/gallery/:img_id", authorize(["admin"]), StockController.deleteGallery);

// =====================================================
// 🎲 RANDOM SLIDE
// =====================================================
router.get("/random-slide", StockController.randomSlide);
export default router;
