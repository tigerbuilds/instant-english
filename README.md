# instant-english

日常会話に特化した瞬間英作文 Web アプリ。日本語の文を見て、制限時間内に英語で答え、ローカル LLM から「文法」「自然さ」「より自然な言い方」のフィードバックを受ける。

**開発中（Phase 7 完了 / 13）。** MVP の核が動き、回答と評価は SQLite に保存される。累計・継続日数の表示（Phase 9）はこれから。

## このプロジェクトの目的

完成を急ぐことではなく、Web アプリ開発に使う技術・設計・実装を一つずつ理解し、自分で説明できるようになること。そのため、要件定義 → 技術選定 → 設計 → 実装 → テスト → 改善の過程をすべてこのリポジトリに残している。

## 制約

- 開発・運用コストは 0 円。有料 API、従量課金、クレジットカード登録を必要とするサービスは使わない。
- すべて自分の PC 上で動く。LLM は Ollama でローカル実行する。

## 技術

| 役割 | 選定 | 理由 |
|---|---|---|
| 画面 | React + Vite + TypeScript | [ADR 001](docs/decisions/001-app-structure-and-language.md), [ADR 006](docs/decisions/006-frontend-ui-library.md) |
| 裏側 | Node.js + Express + TypeScript | [ADR 001](docs/decisions/001-app-structure-and-language.md), [ADR 002](docs/decisions/002-backend-framework.md) |
| LLM | Ollama + qwen3.5:4b（ローカル） | [ADR 003](docs/decisions/003-llm-runtime.md), [ADR 007](docs/decisions/007-llm-model.md) |
| Database | SQLite（Node.js 標準の `node:sqlite`、SQL 直書き） | [ADR 008](docs/decisions/008-database.md), [ADR 009](docs/decisions/009-sql-vs-orm.md) |
| 開発環境 | Node.js 24, npm, VS Code, Docker なし | [ADR 004](docs/decisions/004-development-environment.md) |

## ドキュメント

- [要件定義](docs/product-requirements.md)
- [アーキテクチャ](docs/architecture.md)
- [API 設計](docs/api-design.md)
- [Database 設計](docs/database-design.md)
- [意思決定の記録（ADR）](docs/decisions/)

## 構成

```text
instant-english/
├── docs/        要件・設計・ADR
├── frontend/    画面（React + Vite + TypeScript）
├── backend/     API（Node.js + Express + TypeScript）
├── shared/      画面と裏側で共有する型（API の取り決め）
└── README.md
```

## ローカルで動かす

前提: Node.js 24 以上、Ollama。

初回のみ、モデルを取得する。

```bash
ollama pull qwen3.5:4b
```

裏側の設定は `backend/.env.example` を `backend/.env` にコピーする（既定値のままなら省略可）。

Ollama、裏側、画面は別のプログラムなので、端末を 3 枚使う。Windows 版 Ollama は常駐していることが多く、`http://localhost:11434` で「Ollama is running」と出れば起動不要。

```bash
# 端末 0: Ollama（常駐していなければ）
ollama serve
```

```bash
# 端末 1: 裏側 API（http://localhost:3000）
cd backend
npm install
npm run dev
```

```bash
# 端末 2: 画面（http://localhost:5173）
cd frontend
npm install
npm run dev
```

型検査は `backend`、`frontend` それぞれで `npm run check`。

画面に「評価に失敗しました（HTTP 502）」と出たら、まず `http://localhost:11434` を開いて Ollama が動いているか確認する。PC の再起動後は常駐が消えていることがある。

回答の記録は `backend/data/app.db`（SQLite）に保存される。Git には入らない。中身は `backend` で `node scripts/sql-repl.ts data/app.db` を実行して SQL で見られる。

Windows の PowerShell で `npm` が「スクリプトの実行が無効」で止まる場合は、`Set-ExecutionPolicy -Scope CurrentUser RemoteSigned` を実行するか、cmd を使う。

## 開発の進め方

- 文書だけの変更は `main` に直接 Commit。
- コードの変更はブランチを切り、Pull Request で `main` に取り込む。
- Commit メッセージは Conventional Commits（`feat:` `fix:` `docs:` など）。

詳細は [ADR 005](docs/decisions/005-git-github-workflow.md)。
