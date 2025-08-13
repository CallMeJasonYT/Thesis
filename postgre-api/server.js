import express, { json } from "express";
import cors from "cors";
import { ariadniRoutes } from "./routes/index.js"; // Import the routes
import dotenv from "dotenv";
import { loadAttributes } from "./init/loadAttributes.js";

dotenv.config();

const app = express();

await loadAttributes();

app.use(cors());
app.use(json());
app.use(ariadniRoutes);

app.listen(process.env.API_PORT, () => {
  console.log(`API server running on port: ${process.env.API_PORT}`);
});
