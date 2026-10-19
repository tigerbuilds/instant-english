// 画面（frontend）と裏側（backend）で共有する型。
// API の取り決め（docs/api-design.md）を TypeScript で表したもの。
// ここだけを直せば、両側の検査でずれが見つかる。

// GET /api/questions/{id} の返事
export type Question = {
  id: number;
  japanese: string;
  nextId: number;
};

// POST /api/evaluate の頼み方
export type EvaluateRequest = {
  questionId: number;
  answer: string;
};

// POST /api/evaluate の返事
export type Evaluation = {
  grammar: string | null;
  naturalness: string | null;
  better: string;
};
