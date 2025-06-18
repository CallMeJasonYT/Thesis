import express from "express";
const router = express.Router();
import {
  validatePlayer,
  saveLevelCompletion,
  saveHint,
} from "../controllers/gameDataController.js";

router.post("/api/game/validatePlayer", validatePlayer);
router.post("/api/game/saveLevelCompletion", saveLevelCompletion);
router.post("/api/game/saveHint", saveHint);

export default router;
