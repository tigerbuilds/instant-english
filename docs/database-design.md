# Database Design

- 作成日: 2026-10-24
- ステータス: Accepted（Phase 7）
- Database: SQLite（ADR 008）。ファイルは `backend/data/app.db`、Git には入れない。

---

## 1. 方針

- **事実だけを記録し、集計は計算で出す。** 累計問題数、継続日数、最新利用日は保存しない。回答の記録から毎回計算する。真実の置き場を 2 つにしないため。
- **正誤のフラグは持たない。** このアプリの評価は正誤ではなく指摘なので、評価の 3 項目をそのまま保存し、「指摘が付いた回答」は `grammar` か `naturalness` が `NULL` でない行として後から抽出する。
- **ユーザーの表は持たない。** 単一ユーザー前提（product-requirements.md 2 章）。複数ユーザー化のときに `answers` に `user_id` を足す。
- **SQL は標準的な書き方に寄せる。** PostgreSQL への移行を容易にするため（ADR 008）。

---

## 2. Table

```text
questions 1 ──── * answers
```

### questions

問題。`backend/data/questions.json` の内容を起動時に取り込む（3 章）。

| Column | 型 | 制約 | 意味 |
|---|---|---|---|
| `id` | INTEGER | PRIMARY KEY | 問題番号。JSON の `id` をそのまま使う |
| `japanese` | TEXT | NOT NULL | 日本語の問題文 |

### answers

回答の記録。1 回の送信につき 1 行。

| Column | 型 | 制約 | 意味 |
|---|---|---|---|
| `id` | INTEGER | PRIMARY KEY | 自動採番 |
| `question_id` | INTEGER | NOT NULL, REFERENCES questions(id) | どの問題への回答か |
| `answer` | TEXT | NOT NULL | ユーザーの英文。時間切れは空文字 |
| `grammar` | TEXT | | 文法の指摘。問題なしは NULL |
| `naturalness` | TEXT | | 自然さの指摘。問題なしは NULL |
| `better` | TEXT | NOT NULL | より自然な英文 |
| `answered_at` | TEXT | NOT NULL, DEFAULT (datetime('now')) | 回答日時（UTC、`YYYY-MM-DD HH:MM:SS`） |

### DDL

```sql
CREATE TABLE IF NOT EXISTS questions (
  id       INTEGER PRIMARY KEY,
  japanese TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS answers (
  id          INTEGER PRIMARY KEY,
  question_id INTEGER NOT NULL REFERENCES questions(id),
  answer      TEXT NOT NULL,
  grammar     TEXT,
  naturalness TEXT,
  better      TEXT NOT NULL,
  answered_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_answers_answered_at ON answers(answered_at);
```

- `IF NOT EXISTS` により、起動のたびに実行しても既存の表を壊さない。
- `answered_at` の Index は、日付順の集計（継続日数）と「最近の回答」の取得のため。件数が数千件なら無くても困らないが、Index が何のためにあるかを示す目的で置く。

### SQLite 固有の注意

- Foreign Key の検査は既定で無効。接続のたびに `PRAGMA foreign_keys = ON` を実行する。
- 日時は文字列として保持する。`datetime('now')` は UTC。「日」の区切りは集計時に `localtime`（裏側を動かしている PC のタイムゾーン）で補正する（4 章）。

---

## 3. 問題の取り込み

問題の正本は引き続き `backend/data/questions.json`（FR-1.2、コードを変えずに編集できる）。裏側は起動時に JSON を読み、`questions` に取り込む。

```sql
INSERT INTO questions (id, japanese) VALUES (?, ?)
ON CONFLICT(id) DO UPDATE SET japanese = excluded.japanese;
```

- JSON にある問題は追加または更新される。JSON から消した問題は `questions` に残す（過去の回答が参照しているため）。
- 「正本は JSON、Database は写し」という関係にしたのは、問題の編集を Git で追えるようにするため。

---

## 4. 集計の SQL

### 累計問題数

```sql
SELECT COUNT(*) AS total FROM answers;
```

### 回答した日の一覧（PC のタイムゾーン）

```sql
SELECT DISTINCT date(answered_at, 'localtime') AS day
FROM answers
ORDER BY day DESC;
```

### 継続日数

「今日（または昨日）から遡って、回答のある日が途切れずに続いている日数」。SQL だけで書くと読みにくいので、上の日付一覧を裏側のコードで走査して数える。

```text
days = 上の SQL の結果（新しい順）
today = PC のタイムゾーンでの今日
if days[0] が today でも today-1 でもない → 0
streak = 1
days を順に見て、前の日と 1 日差なら streak += 1、違えば終了
```

### 指摘が付いた回答（将来の復習用）

```sql
SELECT a.id, q.japanese, a.answer, a.grammar, a.naturalness, a.better, a.answered_at
FROM answers a
JOIN questions q ON q.id = a.question_id
WHERE a.grammar IS NOT NULL OR a.naturalness IS NOT NULL
ORDER BY a.answered_at DESC;
```

---

## 5. 裏側での扱い

- Database を扱うコードは `backend/db.ts` に閉じ込める（ADR 008）。他の部分は「問題を取り込む」「回答を保存する」「集計を取る」の関数だけを呼ぶ。
- 起動時に `db.ts` が DDL を実行し、JSON から問題を取り込む。
- `POST /api/evaluate` は、Ollama の評価が成功したら `answers` に 1 行入れてから返事を返す。保存に失敗しても評価は返す（記録より練習のリズムを優先、product-requirements.md 1 章）。

---

## 変更履歴

| 日付 | 内容 |
|------|------|
| 2026-10-24 | Phase 7 初版 |
