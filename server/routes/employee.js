import express from "express";
import fs from "fs";
import path from "path";
import OpenAI from "openai";

const router = express.Router();
const __dirname = path.resolve();

// Load MEOS JSON at startup
const meosPath = path.join(__dirname, "server/data/meos/meos.json");
let meosData = [];
try {
  const raw = fs.readFileSync(meosPath, "utf8");
  meosData = JSON.parse(raw);
  console.log(`✅ Loaded ${meosData.length} MEOS snippets`);
} catch (err) {
  console.error("❌ Failed to load meos.json:", err);
}

// --- Improved keyword-based retrieval ---
function findRelevantSnippet(userMessage, meosData) {
  const lowerMsg = userMessage.toLowerCase();

  // Simple keyword buckets
  const keywords = {
    global: ["global", "worldwide", "overall"],
    apac: ["apac", "asia", "asia-pacific"],
    emea: ["emea", "europe", "middle east", "africa"],
    latam: ["latam", "latin america"],
    revops: ["revops", "revenue operations"],
    skills: ["skills", "training", "upskilling"],
    outlook: ["outlook", "forecast", "hiring intention"],
  };

  // Match user input to categories
  let matchedCategory = null;
  for (const [category, words] of Object.entries(keywords)) {
    if (words.some((w) => lowerMsg.includes(w))) {
      matchedCategory = category;
      break;
    }
  }

  if (!matchedCategory) return null;

  // Look for a snippet containing the keyword
  const snippet = meosData.find((d) =>
    d.snippet.toLowerCase().includes(matchedCategory)
  );

  return snippet ? snippet.snippet : null;
}

router.post("/", async (req, res) => {
  const { message, context } = req.body;

  try {
    // Use smarter retrieval
    const meosSnippet =
      findRelevantSnippet(message, meosData) || "No direct MEOS data found.";

    // Debug log
    console.log("🔍 MEOS snippet sent to GPT:", meosSnippet);

    // Structured but adaptive system prompt
const systemContext = `
You are the Employee Career Copilot.
You must ground all numeric facts in the MEOS reference snippet below.
Do not invent or approximate numbers, percentages, or statistics.

Allowed:
- Repeating numbers and percentages exactly as in the snippet.
- Expanding with qualitative interpretation, e.g. what the figure implies for employees, companies, or hiring sentiment.
- Using general business language to make the response engaging (e.g. "this reflects confidence in the labor market").

Forbidden:
- Never make up or guess numbers, percentages, or rankings.
- If a numeric detail is missing, do not speculate — focus on qualitative context instead.

Structure:
- Start with the headline figure (if available).
- Follow with 1–3 short sentences of interpretation in plain language.
- Use bullet points if multiple aspects are mentioned.
- Keep tone professional and concise.

Page context: ${JSON.stringify(context || {}, null, 2)}

MEOS reference (authoritative source):
"""${meosSnippet}"""
`;


    // ✅ Create OpenAI client *inside the request handler*
    const client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    // Call OpenAI
    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemContext },
        { role: "user", content: message },
      ],
    });

    const reply = completion.choices[0].message.content;
    res.json({ reply });
  } catch (err) {
    console.error("❌ Error in /copilot/employee:", err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
