# ADR 004: 開発環境

- 日付: 2026-10-07
- ステータス: Accepted

## Context

ADR 001〜003 で TypeScript（React + Vite / Node.js + Express）と Ollama を使うと決めた。これらを動かすための開発環境（Node.js の版、パッケージ管理、Docker の要否、エディタ）を決める。費用 0 円が必須条件（NFR-1）。

決定時点で PC に入っていたもの:

| 道具 | 版 |
|---|---|
| Node.js | v24.18.0 |
| npm | 11.16.0 |
| Ollama | 0.33.2 |
| GitHub CLI（gh） | 2.96.0 |
| VS Code | 1.139.1 |
| Docker | 未導入 |

## Options

### Node.js の版

Node.js は偶数番号が LTS（長期サポート版）、奇数番号が試験版。実務では LTS を使うのが原則。v24 は 2025 年 10 月から LTS。

### パッケージ管理

Java の Maven に相当し、外部ライブラリの取得と管理を行う。

| | npm | pnpm | yarn |
|---|---|---|---|
| 入手 | Node.js に同梱 | 別途導入 | 別途導入 |
| 速さ・容量 | 普通 | 速く、ディスク効率が良い | 普通 |
| 実務 | 最も基本。全員が読める | 大規模モノレポで人気 | 減少傾向 |
| 費用 | 0 円 | 0 円 | 0 円 |

### Docker の要否

Docker は「アプリと、その動作に必要な環境を箱に詰めて、どの PC でも同じように動かす」道具。解決する問題は「自分の PC では動くのに他では動かない」と「PostgreSQL のような外部ソフトを PC を汚さずに入れる」の 2 つ。

| | Docker あり | Docker なし |
|---|---|---|
| MVP で解決する問題 | 無い（Database 無し、Ollama は直接導入済み） | － |
| 学習負荷 | 概念が 1 つ増える | 増えない |
| 費用 | Docker Desktop は個人利用無料。企業利用は有料条件あり | 0 円 |

### エディタ

VS Code（無料、OSS ベース）。元の計画どおり。

## Decision

- Node.js: 導入済みの **v24（LTS）** をそのまま使う。
- パッケージ管理: **npm**。
- Docker: **MVP では導入しない**。Database 導入時に「PostgreSQL を直接入れるか Docker で動かすか」として再検討する。
- エディタ: **VS Code**。

## Why

- npm はすでにあり、学習資料のコマンド例はほぼ npm で書かれている。pnpm の利点は規模が大きくなってから効くもので、現時点では発生していない問題への対処になる。
- Docker が解決する問題が MVP にはまだ一つも無い。「必要になったタイミングで導入する」方針の適用。
- VS Code は無料で、TypeScript の補完とエラー表示が標準で動く。

## Trade-offs

- npm は pnpm に比べて `node_modules` の容量が大きく、インストールが遅い。MVP の規模では体感差は無い。
- Docker を使わないため、環境の再現性は「README に手順を書く」ことで担保する。他の PC での再現は手作業になる。
- Docker Desktop の企業利用有料条件は、このプロジェクト（個人・学習目的）では該当しないが、再検討時に改めて確認する。

## 補足: Git の改行設定

Git の `core.autocrlf` が `true` になっており、Commit 時に「LF will be replaced by CRLF」の警告が出る。実害は無いが、Phase 3 で `.gitattributes` を置いて改行コードをリポジトリ側で統一する。
