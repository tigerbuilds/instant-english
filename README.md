# instant-english

日常会話に特化した瞬間英作文 Web アプリ。日本語の文を見て、制限時間内に英語で答え、ローカル LLM から「文法」「自然さ」「より自然な言い方」のフィードバックを受ける。

**開発中（Phase 5 完了 / 13）。** 画面だけで「日本語問題 → 英語入力 → 回答表示 → 次へ」と 30 秒の制限時間が動く。LLM 評価と裏側との接続はまだ。

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
| LLM | Ollama（ローカル） | [ADR 003](docs/decisions/003-llm-runtime.md) |
| 開発環境 | Node.js 24, npm, VS Code, Docker なし | [ADR 004](docs/decisions/004-development-environment.md) |

## ドキュメント

- [要件定義](docs/product-requirements.md)
- [アーキテクチャ](docs/architecture.md)
- [意思決定の記録（ADR）](docs/decisions/)

## 構成

```text
instant-english/
├── docs/        要件・設計・ADR
├── frontend/    画面（React + Vite + TypeScript）
├── backend/     API（Node.js + Express + TypeScript）
└── README.md
```

## ローカルで動かす

前提: Node.js 24 以上。

裏側と画面は別のプログラムなので、端末を 2 枚使う。

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

Windows の PowerShell で `npm` が「スクリプトの実行が無効」で止まる場合は、`Set-ExecutionPolicy -Scope CurrentUser RemoteSigned` を実行するか、cmd を使う。

## 開発の進め方

- 文書だけの変更は `main` に直接 Commit。
- コードの変更はブランチを切り、Pull Request で `main` に取り込む。
- Commit メッセージは Conventional Commits（`feat:` `fix:` `docs:` など）。

詳細は [ADR 005](docs/decisions/005-git-github-workflow.md)。
