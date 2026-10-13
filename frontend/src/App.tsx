import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";

const TIME_LIMIT_SECONDS = 30;

const questions = [
  { id: 1, japanese: "昨日の会議、ちょっと長かったよね" },
  { id: 2, japanese: "週末は何か予定ある？" },
  { id: 3, japanese: "それ、あとでメールで送っておくね" },
];

export function App() {
  const [index, setIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [remaining, setRemaining] = useState(TIME_LIMIT_SECONDS);
  const [submitted, setSubmitted] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (submitted) return;
    const id = window.setInterval(() => {
      setRemaining((r) => r - 1);
    }, 1000);
    return () => window.clearInterval(id);
  }, [index, submitted]);

  useEffect(() => {
    if (remaining <= 0) setSubmitted(true);
  }, [remaining]);

  useEffect(() => {
  if (!submitted) inputRef.current?.focus();
  }, [index, submitted]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitted(true);
  }

  function handleNext() {
    setIndex((i) => (i + 1) % questions.length);
    setAnswer("");
    setRemaining(TIME_LIMIT_SECONDS);
    setSubmitted(false);
  }

  return (
    <>
      <h1>瞬間英作文</h1>
      <p id="question">{questions[index].japanese}</p>
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