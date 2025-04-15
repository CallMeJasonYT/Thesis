import express from "express";
const router = express.Router();
import { getGroupedPlayers } from "../controllers/leaderboardController.js";

router.get("/api/web/getGroupedPlayers", getGroupedPlayers);

export default router;
