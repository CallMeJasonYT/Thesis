import express from "express";
const router = express.Router();
import { getGroupStats } from "../controllers/playersController.js";

router.post("/api/web/groupStats", getGroupStats);

export default router;
