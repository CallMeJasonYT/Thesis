import express from "express";
const router = express.Router();
import {
  validatePlayer,
  saveLevelCompletion,
} from "../controllers/gameDataController.js";

router.post("/api/game/validatePlayer", validatePlayer);
router.post("/api/game/saveLevelCompletion", saveLevelCompletion);

export default router;
