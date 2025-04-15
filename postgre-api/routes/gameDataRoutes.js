import express from "express";
const router = express.Router();
import {
  validatePlayer,
  saveLevelCompletion,
} from "../controllers/gameDataController.js";

router.get("/api/game/validatePlayer", validatePlayer);
router.get("/api/game/saveLevelCompletion", saveLevelCompletion);

export default router;
