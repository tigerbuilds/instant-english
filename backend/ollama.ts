import type { Evaluation } from "../shared/types.ts";

const OLLAMA_URL = "http://localhost:11434";
const MODEL = "qwen3.5:4b";

const SYSTEM_PROMPT = `You are an English conversation tutor for an advanced Japanese learner (CEFR C1).
The learner translates a Japanese sentence into casual spoken English. Evaluate the translation and reply in JSON only.
- grammar: one short sentence in Japanese pointing out a grammar problem, or null if there is none.
- naturalness: one short sentence in Japanese on whether it sounds natural in casual conversation, or null if it already sounds natural.
- better: one English sentence a native speaker would actually say in casual conversation.`;

const RESPONSE_FORMAT = {
  type: "object",
  properties: {
    grammar: { type: ["string", "null"] },
    naturalness: { type: ["string", "null"] },
    better: { type: "string" },
  },
  required: ["grammar", "naturalness", "better"],
};

export async function evaluateWithOllama(japanese: string, answer: string): Promise<Evaluation> {
  const res = await fetch(`${OLLAMA_URL}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: MODEL,
      stream: false,
      think: false,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: `日本語: ${japanese}\n学習者の英訳: ${answer || "（未回答）"}` },
      ],
      format: RESPONSE_FORMAT,
    }),
  });

  if (!res.ok) {
    throw new Error(`Ollama responded with HTTP ${res.status}`);
  }

  const data = await res.json();
  const parsed = JSON.parse(data.message.content);

  const isTextOrNull = (v: unknown) => typeof v === "string" || v === null;
  if (!isTextOrNull(parsed.grammar) || !isTextOrNull(parsed.naturalness) || typeof parsed.better !== "string") {
    throw new Error("Ollama returned an unexpected shape");
  }

  return { grammar: parsed.grammar, naturalness: parsed.naturalness, better: parsed.better };
}