import express from "express";
const router = express.Router();
import {
  getGroupStats,
  getUserStats,
  getOverviewStats,
} from "../controllers/statsController.js";

router.get("/api/web/overviewStats", getOverviewStats);
router.post("/api/web/groupStats", getGroupStats);
router.post("/api/web/userStats", getUserStats);

export default router;
