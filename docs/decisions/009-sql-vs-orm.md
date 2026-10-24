# ADR 009: SQL 直書きか ORM か

- 日付: 2026-10-24
- ステータス: Accepted

## Context

ADR 008 で SQLite（`node:sqlite`）を採用した。裏側から Database を扱う方法として、SQL を直接書くか、ORM（Object-Relational Mapper。Table の行を TypeScript のオブジェクトとして扱い、SQL を書かずに済ませる道具。Java の JPA / Hibernate に相当）を使うかを決める。

現状の規模は、Table が 2 つ、必要な SQL が 5 本程度（DDL、問題の取り込み、回答の保存、件数、日付一覧）。開発者は SQL を理解している。

## Options

| | SQL 直書き（`node:sqlite`） | Drizzle | Prisma |
|---|---|---|---|
| 書き方 | SQL を文字列で書く | TypeScript で SQL に近い形を書く | 独自のスキーマ定義から型付きの関数を生成 |
| 追加するもの | 無し | ライブラリ 1 つ | ライブラリと生成ツール |
| 型の恩恵 | 自分で型を付ける | 定義から自動 | 定義から自動 |
| Migration | 自分で管理 | 付属 | 付属 |
| 学べること | SQL そのもの | SQL を知っている前提で楽をする方法 | ORM 流の抽象化 |
| 実務 | 小規模や性能重視で普通 | 伸びている | 最も普及 |
| 費用 | 0 円 | 0 円 | 0 円 |

## Decision

**SQL 直書き**。`node:sqlite` の prepared statement を使い、Database を扱うコードは `backend/db.ts` に閉じ込める。

## Why

- ORM が解決する問題（SQL の量、型のずれ、Migration の管理）が、この規模ではまだ発生していない。「面倒を味わってから道具を入れる」順番を守る（Express、React と同じ）。
- 開発者が SQL を理解しているので、抽象化で隠す必要がない。
- 追加するものが無く、`node:sqlite` だけで完結する。

## Trade-offs

- 行の型は自分で宣言し、SQL と手で合わせる。列を足したときに型の更新を忘れると実行時まで気づかない。`db.ts` に閉じ込めることで影響範囲を限る。
- Table の変更履歴（Migration）の仕組みが無い。当面は `CREATE TABLE IF NOT EXISTS` と、変更時は手で `ALTER TABLE` を書く。Table が増えて変更が頻繁になった時点で Drizzle を再検討する。
- 値の埋め込みは必ずプレースホルダ（`?`）で行い、文字列連結で SQL を組み立てない（SQL インジェクション対策）。
