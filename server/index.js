import dotenv from "dotenv";
dotenv.config();
console.log("DEBUG API key:", process.env.OPENAI_API_KEY);
console.log("DEBUG API key length:", process.env.OPENAI_API_KEY?.length || "not found");

import express from "express";
import bodyParser from "body-parser";
import employeeRoute from "./routes/employee.js";
import employerRoute from "./routes/employer.js";


const app = express();
app.use(bodyParser.json());

app.use("/copilot/employee", employeeRoute);
app.use("/copilot/employer", employerRoute);
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
app.use(express.static(path.join(__dirname, "../public")));

app.listen(3000, () => {
  console.log("ICM Copilot API running at http://localhost:3000");
});
