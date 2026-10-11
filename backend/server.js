const express = require("express");

const app = express();

app.get("/", (req, res) => {
  res.send("Hello from backend");
});

app.get("/questions", (req, res) => {
  res.json({ id: 1, japanese: "昨日の会議、ちょっと長かったよね" });
});

app.listen(3000, () => {
  console.log("listening on http://localhost:3000");
});