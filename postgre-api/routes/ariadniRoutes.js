import express from "express";
const router = express.Router();
import {
  getUsers,
  getLevelStages,
  getQuizTimes,
  getStatAttributes,
  getOverviewStats,
} from "../controllers/ariadniController.js";

router.get("/api/ariadni/players", getUsers);
router.get("/api/ariadni/LevelStages", getLevelStages);
router.post("/api/ariadni/QuizTimes", getQuizTimes);
router.get("/api/ariadni/statsAttributes", getStatAttributes);
router.get("/api/ariadni/overviewStats", getOverviewStats);

export default router;
