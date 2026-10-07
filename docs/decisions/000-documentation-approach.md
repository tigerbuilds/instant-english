# ADR 000: 仕様・設計ドキュメントの管理方式

- 日付: 2026-10-07
- ステータス: Accepted

## Context

このプロジェクトは学習と GitHub ポートフォリオを目的としており、「何を選んだか」だけでなく「なぜ選んだか」を後から追える状態にしたい。コードと同じリポジトリに、仕様・設計・意思決定の記録を残す方式を決める必要がある。

## Options

### 1. Markdown + ADR

- `docs/` に要件・設計ドキュメントを Markdown で置く。
- `docs/decisions/` に番号付きの ADR（Architecture Decision Record）を置く。
- 道具は不要。GitHub 上でそのまま読める。

### 2. OpenSpec

- 仕様の変更提案を定型フォルダ構成で管理する仕組み。AI 支援開発での仕様駆動を想定。
- 複数人での開発や、頻繁な仕様変更の追跡に向く。
- 専用の手順と CLI を覚える必要がある。

### 3. GitHub Wiki / Issues

- リポジトリ外の管理画面に書く。
- Git の履歴には残らない。

## Decision

**Markdown + ADR** を採用する。

構成:

```text
docs/
├── product-requirements.md
├── architecture.md            （Phase 2 で作成）
├── api-design.md              （Phase 6 で作成）
├── database-design.md         （Database 導入時に作成）
└── decisions/
    ├── 000-documentation-approach.md
    ├── 001-....md
    └── ...
```

ADR の形式は次の見出しを最低限含める。

```text
Context
Options
Decision
Why
Trade-offs
```

## Why

- 学習目的に対して道具の学習コストがゼロで、本質（設計判断）に集中できる。
- Git の履歴にドキュメントの変遷が残り、「要件定義 → 技術選定 → 設計 → 実装」の過程をリポジトリだけで示せる。
- 1 人開発では OpenSpec の提案・承認フローは過剰である。

## Trade-offs

- 仕様変更が増えると、どのドキュメントが最新かの管理を手動で行う必要がある。
- OpenSpec が提供する「仕様とコードの対応づけ」は得られない。仕様変更が頻繁になった段階で OpenSpec を再検討する。
