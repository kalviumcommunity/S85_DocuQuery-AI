import express from "express";
import { answerQuestions } from "../services/rag.service.js";

const router = express.Router();

// POST /ask  { document: "uploads/123.pdf" | "https://..." , questions: [ ... ], model, concepts, settings }
router.post("/", async (req, res) => {
  try {
    const { document, questions, model, concepts, settings } = req.body;
    if (!document || !Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({ error: "Provide 'document' and non-empty 'questions' array." });
    }

    const results = await answerQuestions(document, questions, {
      model,
      concepts: concepts || [],
      settings: settings || {}
    });
    return res.json(results);
  } catch (err) {
    console.error("Ask error:", err);
    return res.status(500).json({ error: err.message || "Internal Server Error" });
  }
});

export default router;
