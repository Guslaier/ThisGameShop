import express from "express";
import { GameDetailController } from "./controller.js";

const router = express.Router();

// /gamedetail/:id
router.get("/:id", GameDetailController.showGameDetail);

export default router;
