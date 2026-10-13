# ADR 006: 画面側の UI ライブラリ

- 日付: 2026-10-13
- ステータス: Accepted

## Context

ADR 001 で画面側を「React + Vite + TypeScript」と決めたが、React 自体を他の選択肢と比較していなかった。Phase 5 で、まず素の TypeScript（`document.querySelector` と `addEventListener`）で「問題表示 → 入力 → 回答表示 → 次へ」と制限時間の UI を作り、その上で UI ライブラリが解決する問題を確認してから選び直す。

### 素の TypeScript で作って分かった問題

状態は `index`（何問目か）、`remaining`（残り秒数）、`timerId`（タイマー）の 3 つだった。

1. **更新し忘れ**。状態が変わるたびに、画面のどこを直すか（`textContent`、`hidden`、`disabled`、`value`）を自分で全部覚えて書く必要がある。Phase 6 で「評価待ち」「評価結果」「エラー」の状態が増えると、組み合わせが手に負えなくなる。
2. **描画の分散**。`showQuestion` と `submitAnswer` が同じ部品を別々の場所で書き換えていた。「結果欄が見えているのに入力欄が触れる」のような矛盾した画面を防ぐ仕組みが無い。
3. **HTML と処理の分離**。`<p id="timer">` を HTML に書き忘れても TypeScript は気づかず、実行時に `null` で落ちた。部品の定義と、それを使う処理が別ファイルにある。

## Options

| | React | Vue | Svelte | 素の TypeScript |
|---|---|---|---|---|
| 考え方 | 状態 → 画面の関数。JSX | HTML 寄りのテンプレート | 変換時に素の JS に落とす | 自分で全部 |
| 上の問題 1〜3 | 解決する | 解決する | 解決する | 解決しない |
| 学習資料 | 最多 | 多い | 増えている | － |
| 実務での利用度 | 最も高い。Next.js の土台 | 高い（国内でも多い） | 伸びているが少数 | － |
| 学習の転用先 | Next.js、React Native | Nuxt | 少ない | － |
| 費用 | 0 円 | 0 円 | 0 円 | 0 円 |

## Decision

**React** を採用する。雛形を作り直すのではなく、Phase 4 の `vanilla-ts` プロジェクトに `react`、`react-dom`、`@vitejs/plugin-react` を追加する形で導入した。

## Why

- 上の 3 つの問題を、次の形で解決する。
  1. 状態は `useState` で宣言し、画面は状態から計算する対応表（JSX）として 1 回書く。状態を変えれば React が画面を作り直すので、更新し忘れが起きない。
  2. 描画は `App` 関数 1 か所に集まる。`disabled={submitted}` のように、各部品の見え方が状態との対応として 1 行で決まる。
  3. 画面の構造（JSX）と処理が同じ TypeScript ファイルにある。存在しない部品や型の不一致は検査で捕まる。
- 選定基準は Express（ADR 002）と同じく「困ったときに答えが見つかる量」と「学習の転用先の広さ」。Vue も十分に良いが、2 つ学ぶ余裕は無く、資料と求人が最多の方を取る。
- 雛形を作り直さず追加導入にしたのは、「React を入れると何が増えるのか」（`vite.config.ts`、`jsx` 設定、`main.tsx`、`App.tsx`）を見えるようにするため。

## Trade-offs

- JSX は HTML ではなく関数呼び出しに変換される書き方であり、`class` → `className`、`onclick` → `onClick` など HTML と微妙に違う点を覚える必要がある。
- `useEffect` の依存配列や片付け関数など、React 固有の決まりがある。タイマーのような「描画以外の仕事」はここに書く。
- 素の TypeScript 版より、読み込むコードの量（`node_modules`）は増える。MVP の規模では体感差は無い。
- 素の TypeScript 版は Commit 履歴（`f19bb67`、`45c0cf8`）に残しており、React 版（`b747e0e`）と比較できる。
