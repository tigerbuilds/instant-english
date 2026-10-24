import { DatabaseSync } from "node:sqlite";
import type { Evaluation } from "../shared/types.ts";

const DB_PATH = process.env.DB_PATH ?? "data/app.db";

const db = new DatabaseSync(DB_PATH);
db.exec("PRAGMA foreign_keys = ON");

db.exec(`
  CREATE TABLE IF NOT EXISTS questions (
    id       INTEGER PRIMARY KEY,
    japanese TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS answers (
    id          INTEGER PRIMARY KEY,
    question_id INTEGER NOT NULL REFERENCES questions(id),
    answer      TEXT NOT NULL,
    grammar     TEXT,
    naturalness TEXT,
    better      TEXT NOT NULL,
    answered_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE INDEX IF NOT EXISTS idx_answers_answered_at ON answers(answered_at);
`);

const upsertQuestion = db.prepare(`
  INSERT INTO questions (id, japanese) VALUES (?, ?)
  ON CONFLICT(id) DO UPDATE SET japanese = excluded.japanese
`);

const insertAnswer = db.prepare(`
  INSERT INTO answers (question_id, answer, grammar, naturalness, better)
  VALUES (?, ?, ?, ?, ?)
`);

export function upsertQuestions(questions: { id: number; japanese: string }[]) {
  for (const q of questions) {
    upsertQuestion.run(q.id, q.japanese);
  }
}

export function saveAnswer(questionId: number, answer: string, evaluation: Evaluation) {
  insertAnswer.run(questionId, answer, evaluation.grammar, evaluation.naturalness, evaluation.better);
}