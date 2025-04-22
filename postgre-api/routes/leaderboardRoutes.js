import express from "express";
const router = express.Router();
import { getLeaderboardRecords } from "../controllers/leaderboardController.js";

router.post("/api/web/getLeaderboardRecords", getLeaderboardRecords);
export default router;
