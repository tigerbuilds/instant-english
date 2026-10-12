import "./style.css";

const questions = [
  { id: 1, japanese: "昨日の会議、ちょっと長かったよね" },
  { id: 2, japanese: "週末は何か予定ある？" },
  { id: 3, japanese: "それ、あとでメールで送っておくね" },
];

let index = 0;

const questionEl = document.querySelector<HTMLParagraphElement>("#question")!;
const formEl = document.querySelector<HTMLFormElement>("#answer-form")!;
const answerEl = document.querySelector<HTMLInputElement>("#answer")!;
const resultEl = document.querySelector<HTMLElement>("#result")!;
const yourAnswerEl = document.querySelector<HTMLSpanElement>("#your-answer")!;
const nextEl = document.querySelector<HTMLButtonElement>("#next")!;

function showQuestion() {
  questionEl.textContent = questions[index].japanese;
  answerEl.value = "";
  resultEl.hidden = true;
  answerEl.focus();
}

formEl.addEventListener("submit", (event) => {
  event.preventDefault();
  yourAnswerEl.textContent = answerEl.value;
  resultEl.hidden = false;
});

nextEl.addEventListener("click", () => {
  index = (index + 1) % questions.length;
  showQuestion();
});

showQuestion();