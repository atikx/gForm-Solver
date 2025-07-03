import express from "express";
import cors from "cors";
import "dotenv/config";
import { getans } from "./solver.js";

const app = express();

app.use(cors({ origin: "*", credentials: true }));
app.use(express.json());

app.post("/api/get-answers", async (req, res) => {
  const { questions } = req.body;

  if (!questions || !Array.isArray(questions)) {
    return res.status(400).json({ error: "Invalid or empty questions array" });
  }

  try {
    const questionsWithAnswers = await getans(questions);
    console.log("🧠 Gemini answers sent:", questionsWithAnswers);
    return res.status(200).json({ answer: questionsWithAnswers });
  } catch (error) {
    console.error("❌ Error processing questions:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
