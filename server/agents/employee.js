import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import express from "express";
import { openai } from "../config/openai.js";

const router = express.Router();
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Load MEOS snippets
const meosData = JSON.parse(
  fs.readFileSync(path.join(__dirname, "../data/meos/meos.json"), "utf8")
);
console.log("MEOS data loaded:", meosData);


router.post("/", async (req, res) => {
  const { message, context } = req.body;

  // Try to match MEOS snippet (simple keyword search for now)
  const meosSnippet =
    meosData.find(d =>
      message.toLowerCase().includes(d.topic.toLowerCase())
    )?.snippet || "No direct MEOS data found.";

  const systemContext = `
You must always use the following MEOS data exactly as provided, quoting numbers and trends directly if they appear.

Page context: ${JSON.stringify(context || {}, null, 2)}
MEOS reference data (authoritative, do not paraphrase numbers):
"${meosSnippet}"
`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4.1",
      messages: [
        { role: "system", content: employeeSystemPrompt },
        { role: "system", content: systemContext },
        { role: "user", content: message }
      ]
    });

    res.json({ reply: completion.choices[0].message.content });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;

export const employeeSystemPrompt = `
You are the Employee Career Copilot.
- Help employees explore internal roles, skills, and training paths.
- Always use MEOS reference data exactly as provided.
- Quote numbers and trends precisely, do not paraphrase them away.
- Be supportive, clear, and practical.
`;
