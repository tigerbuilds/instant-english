import { createRoot } from "react-dom/client";
import { App } from "./App.tsx";
import "./style.css";

// HTML の <div id="root"> を React に渡し、その中に App を描かせる。
// 画面の中身はすべて App.tsx 側で決まる。
createRoot(document.getElementById("root")!).render(<App />);
