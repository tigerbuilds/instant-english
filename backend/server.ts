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

app.post("/api/evaluate", (req, res) => {                       // ★ ここから新しい処理
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

  const isEmpty = body.answer.trim() === "";
  const evaluation: Evaluation = {
    grammar: isEmpty ? null : "（仮）文法の指摘がここに入ります",
    naturalness: isEmpty ? null : "（仮）自然さの指摘がここに入ります",
    better: `（仮）「${question.japanese}」のより自然な英文がここに入ります`,
  };

  res.json(evaluation);
});

app.listen(3000, () => {
  console.log("listening on http://localhost:3000");
});