import { evaluateWithOllama } from "./ollama.ts";
import express from "express";
import { readFileSync } from "node:fs";
import type { Question, EvaluateRequest, Evaluation } from "../shared/types.ts";


const questions: Omit<Question, "nextId">[] = JSON.parse(readFileSync("data/questions.json", "utf-8"));

const app = express();
app.use(express.json());                                        // ★ 本文の JSON を req.body に入れる関所


app.get("/api/questions/:id", (req, res) => {
  const id = Number(req.params.id);
  const index = questions.findIndex((q) => q.id === id);

  if (index === -1) {
    res.status(404).json({ error: "question not found" });
    return;
  }

  const question = questions[index];
  const next = questions[(index + 1) % questions.length];
  res.json({ id: question.id, japanese: question.japanese, nextId: next.id });
});

app.post("/api/evaluate", async (req, res) => {
  const body = req.body as Partial<EvaluateRequest>;

  if (typeof body.questionId !== "number" || typeof body.answer !== "string") {
    res.status(400).json({ error: "questionId (number) and answer (string) are required" });
    return;
  }

  const question = questions.find((q) => q.id === body.questionId);
  if (!question) {
    res.status(404).json({ error: "question not found" });
    return;
  }

  const startedAt = Date.now();
  try {
    const evaluation = await evaluateWithOllama(question.japanese, body.answer);
    if (body.answer.trim() === "") {
      evaluation.grammar = null;
      evaluation.naturalness = null;
    }
    console.log(`evaluate: question ${question.id}, ${Date.now() - startedAt} ms`);
    res.json(evaluation);
  } catch (e) {
    console.error("evaluate failed:", e);
    res.status(502).json({ error: "evaluation failed" });
  }
});

app.listen(3000, () => {
  console.log("listening on http://localhost:3000");
});