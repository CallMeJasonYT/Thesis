import express from "express";
const router = express.Router();
import {
  getUserStats,
  getOverviewStats,
  getGroupStats,
} from "../controllers/statsController.js";

router.get("/api/web/overviewStats", getOverviewStats);
router.post("/api/web/userStats", getUserStats);
router.post("/api/web/groupStats", getGroupStats);

export default router;
