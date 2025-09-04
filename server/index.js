// server/index.js
import dotenv from "dotenv";
dotenv.config();

import express from "express";
import bodyParser from "body-parser";
import employeeRoute from "./routes/employee.js";

import path from "path";
import { fileURLToPath } from "url";

const app = express();
app.use(bodyParser.json());

// Routes
app.use("/copilot/employee", employeeRoute);

const __dirname = path.dirname(fileURLToPath(import.meta.url));
app.use(express.static(path.join(__dirname, "../public")));

app.listen(3000, () => {
  console.log("✅ ICM Copilot API running at http://localhost:3000");
  console.log("🔑 API key length:", process.env.OPENAI_API_KEY?.length || "not found");
});
