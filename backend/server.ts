import express from "express";
import { readFileSync } from "node:fs";

type Question = { id: number; japanese: string };

const questions: Question[] = JSON.parse(readFileSync("data/questions.json", "utf-8"));

const app = express();

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

app.listen(3000, () => {
  console.log("listening on http://localhost:3000");
});