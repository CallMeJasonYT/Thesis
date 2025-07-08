import express from "express";
const router = express.Router();
import {
  getUsers,
  getLevelStages,
  getQuizTimes,
  //getStatAttributes,
} from "../controllers/ariadniController.js";

router.get("/api/ariadni/players", getUsers);
router.get("/api/ariadni/LevelStages", getLevelStages);
router.post("/api/ariadni/QuizTimes", getQuizTimes);
//router.get("/api/ariadni/statsAttributes", getStatAttributes);

export default router;
