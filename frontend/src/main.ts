import "./style.css";

const TIME_LIMIT_SECONDS = 30;                                            // ★

const questions = [
  { id: 1, japanese: "昨日の会議、ちょっと長かったよね" },
  { id: 2, japanese: "週末は何か予定ある？" },
  { id: 3, japanese: "それ、あとでメールで送っておくね" },
];

let index = 0;
let remaining = TIME_LIMIT_SECONDS;                                       // ★
let timerId: number | undefined;                                          // ★

const questionEl = document.querySelector<HTMLParagraphElement>("#question")!;
const timerEl = document.querySelector<HTMLParagraphElement>("#timer")!;  // ★
const formEl = document.querySelector<HTMLFormElement>("#answer-form")!;
const answerEl = document.querySelector<HTMLInputElement>("#answer")!;
const resultEl = document.querySelector<HTMLElement>("#result")!;
const yourAnswerEl = document.querySelector<HTMLSpanElement>("#your-answer")!;
const nextEl = document.querySelector<HTMLButtonElement>("#next")!;

function startTimer() {                                                   // ★
  remaining = TIME_LIMIT_SECONDS;
  timerEl.textContent = `残り ${remaining} 秒`;
  timerId = window.setInterval(() => {
    remaining -= 1;
    timerEl.textContent = `残り ${remaining} 秒`;
    if (remaining <= 0) {
      submitAnswer();
    }
  }, 1000);
}

function stopTimer() {                                                    // ★
  window.clearInterval(timerId);
}

function showQuestion() {
  questionEl.textContent = questions[index].japanese;
  answerEl.value = "";
  answerEl.disabled = false;                                              // ★
  resultEl.hidden = true;
  answerEl.focus();
  startTimer();                                                           // ★
}

function submitAnswer() {                                                 // ★
  stopTimer();
  yourAnswerEl.textContent = answerEl.value || "（未回答）";
  resultEl.hidden = false;
  answerEl.disabled = true;
}

formEl.addEventListener("submit", (event) => {
  event.preventDefault();
  submitAnswer();                                                         // ★
});

nextEl.addEventListener("click", () => {
  index = (index + 1) % questions.length;
  showQuestion();
});

showQuestion();