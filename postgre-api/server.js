import express, { json } from "express";
import cors from "cors";
import {
  gameDataRoutes,
  leaderboardRoutes,
  attributesRoutes,
  statsRoutes,
  playersRoutes,
} from "./routes/index.js"; // Import the routes
import dotenv from "dotenv";
import { loadAttributes } from "./init/loadAttributes.js";

dotenv.config();

const app = express();

await loadAttributes();

app.use(cors());
app.use(json());
app.use(gameDataRoutes);
app.use(leaderboardRoutes);
app.use(attributesRoutes);
app.use(statsRoutes);
app.use(playersRoutes);

app.listen(process.env.API_PORT, () => {
  console.log(`API server running on port: ${process.env.API_PORT}`);
});
