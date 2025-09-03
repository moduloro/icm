import express from "express";
import { openai } from "../config/openai.js";
import { employeeSystemPrompt } from "../agents/employee.js";

const router = express.Router();

router.post("/", async (req, res) => {
  const { message } = req.body;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4.1",
      messages: [
        { role: "system", content: employeeSystemPrompt },
        { role: "user", content: message }
      ]
    });
    res.json({ reply: completion.choices[0].message.content });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
