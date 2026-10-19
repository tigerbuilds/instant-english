import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import type { Question, Evaluation } from "../../shared/types.ts";

const TIME_LIMIT_SECONDS = 30;

type Status = "answering" | "evaluating" | "done" | "error";           // ★

export function App() {
  const [question, setQuestion] = useState<Question | null>(null);
  const [answer, setAnswer] = useState("");
  const [remaining, setRemaining] = useState(TIME_LIMIT_SECONDS);
  const [status, setStatus] = useState<Status>("answering");           // ★ submitted の代わり
  const [evaluation, setEvaluation] = useState<Evaluation | null>(null); // ★
  const [errorMessage, setErrorMessage] = useState("");                // ★
  const inputRef = useRef<HTMLInputElement>(null);

  async function loadQuestion(id: number) {
    const res = await fetch(`/api/questions/${id}`);
    const data: Question = await res.json();
    setQuestion(data);
    setAnswer("");
    setRemaining(TIME_LIMIT_SECONDS);
    setStatus("answering");                                            // ★
    setEvaluation(null);                                               // ★
  }

  async function submitAnswer() {                                      // ★ 送信と評価待ち
    if (!question) return;
    setStatus("evaluating");
    try {
      const res = await fetch("/api/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questionId: question.id, answer }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data: Evaluation = await res.json();
      setEvaluation(data);
      setStatus("done");
    } catch (e) {
      setErrorMessage(e instanceof Error ? e.message : String(e));
      setStatus("error");
    }
  }

  useEffect(() => {
    loadQuestion(1);
  }, []);

  useEffect(() => {
    if (status !== "answering" || question === null) return;           // ★
    const id = window.setInterval(() => {
      setRemaining((r) => r - 1);
    }, 1000);
    return () => window.clearInterval(id);
  }, [question, status]);                                              // ★

  useEffect(() => {
    if (remaining <= 0 && status === "answering") submitAnswer();      // ★ 時間切れ
  }, [remaining]);

  useEffect(() => {
    if (status === "answering") inputRef.current?.focus();             // ★
  }, [question, status]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    submitAnswer();                                                    // ★
  }

  function handleNext() {
    if (question) loadQuestion(question.nextId);
  }

  if (question === null) return <p>読み込み中...</p>;

  const answering = status === "answering";                            // ★

  return (
    <>
      <h1>瞬間英作文</h1>
      <p id="question">{question.japanese}</p>
      <p>残り {remaining} 秒</p>

      <form onSubmit={handleSubmit}>
        <input
          id="answer"
          type="text"
          placeholder="英語で答える"
          autoComplete="off"
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          disabled={!answering}                                        // ★
          ref={inputRef}
        />
        <button type="submit" disabled={!answering}>送信</button>       {/* ★ */}
      </form>

      {status === "evaluating" && <p>評価中...</p>}                      {/* ★ */}

      {status === "error" && (                                         // ★
        <section>
          <p>評価に失敗しました（{errorMessage}）</p>
          <button type="button" onClick={handleNext}>次へ</button>
        </section>
      )}

      {status === "done" && evaluation && (                            // ★
        <section>
          <p>あなたの回答：{answer || "（未回答）"}</p>
          <p>より自然な英文：{evaluation.better}</p>
          {evaluation.grammar && <p>文法：{evaluation.grammar}</p>}
          {evaluation.naturalness && <p>自然さ：{evaluation.naturalness}</p>}
          <button type="button" onClick={handleNext}>次へ</button>
        </section>
      )}
    </>
  );
}