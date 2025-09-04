// server/routes/employee.js
import express from "express";
import OpenAI from "openai";
import { employeeSystemPrompt } from "../agents/employee.js";

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { message, context } = req.body;
    console.log("💬 Employee asked:", message);

    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const systemPrompt = employeeSystemPrompt(context);

    const completion = await client.chat.completions.create({
      model: "gpt-4.1-mini", // fast + cost effective; switch to gpt-4.1 for richer answers
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: message },
      ],
      temperature: 0.7,
    });

    const reply = completion.choices[0].message.content;
    console.log("🤖 Copilot grounded reply:", reply);

    // Signal to frontend that this is "grounded"
    res.json({ reply, grounded: true });

  } catch (error) {
    console.error("❌ Error in /copilot/employee:", error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
