import express from "express";
const router = express.Router();
import {
  getGroups,
  getLevelStages,
  getStatAttributes,
} from "../controllers/attributesController.js";

router.get("/api/web/groups", getGroups);
router.get("/api/web/levelStages", getLevelStages);
router.get("/api/web/statsAttributes", getStatAttributes);

export default router;
