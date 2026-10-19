import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";

const TIME_LIMIT_SECONDS = 30;

type Question = { id: number; japanese: string; nextId: number };     // ★

export function App() {
  const [question, setQuestion] = useState<Question | null>(null);     // ★ index の代わり
  const [answer, setAnswer] = useState("");
  const [remaining, setRemaining] = useState(TIME_LIMIT_SECONDS);
  const [submitted, setSubmitted] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function loadQuestion(id: number) {                            // ★
    const res = await fetch(`/api/questions/${id}`);
    const data: Question = await res.json();
    setQuestion(data);
    setAnswer("");
    setRemaining(TIME_LIMIT_SECONDS);
    setSubmitted(false);
  }

  useEffect(() => {                                                    // ★ 起動時に 1 問目
    loadQuestion(1);
  }, []);

  useEffect(() => {
    if (submitted || question === null) return;                        // ★
    const id = window.setInterval(() => {
      setRemaining((r) => r - 1);
    }, 1000);
    return () => window.clearInterval(id);
  }, [question, submitted]);                                           // ★

  useEffect(() => {
    if (remaining <= 0) setSubmitted(true);
  }, [remaining]);

  useEffect(() => {
    if (!submitted) inputRef.current?.focus();
  }, [question, submitted]);                                           // ★

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitted(true);
  }

  function handleNext() {                                              // ★
    if (question) loadQuestion(question.nextId);
  }

  if (question === null) return <p>読み込み中...</p>;                  // ★

  return (
    <>
      <h1>瞬間英作文</h1>
      <p id="question">{question.japanese}</p>                         {/* ★ */}
      <p>残り {remaining} 秒</p>

      <form onSubmit={handleSubmit}>
        <input
          id="answer"
          type="text"
          placeholder="英語で答える"
          autoComplete="off"
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          disabled={submitted}
          ref={inputRef}
        />
        <button type="submit" disabled={submitted}>送信</button>
      </form>

      {submitted && (
        <section>
          <p>あなたの回答：{answer || "（未回答）"}</p>
          <button type="button" onClick={handleNext}>次へ</button>
        </section>
      )}
    </>
  );
}