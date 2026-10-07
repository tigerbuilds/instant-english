# ADR 003: LLM の実行方法

- 日付: 2026-10-07
- ステータス: Accepted

## Context

回答の評価（product-requirements.md FR-3）はローカルで動く LLM が行う。費用 0 円が必須条件（NFR-1）であり、有料 LLM API は使わない。自分の PC 上で LLM を動かし、裏側（Node.js）から HTTP で呼び出せる仕組みを選ぶ。

前提となるハードウェア（NFR-2）:

- AMD Ryzen 5 PRO 7545U（6 コア）、内蔵 GPU Radeon 740M、専用 GPU なし、メモリ 16 GB。
- 推論は基本的に CPU で行う。LLM に割り当てられるメモリは実質 8 GB 前後。

### 背景知識

ローカル LLM は「モデルファイル（数 GB の数値データ、GGUF 形式が一般的）」と「それを読み込んで計算する推論エンジン」で動く。推論エンジンの事実上の標準は OSS の **llama.cpp** であり、以下の候補はいずれも内部で llama.cpp を使っている。候補の違いは計算そのものではなく、モデルの入手・管理・呼び出しの手軽さにある。

## Options

| | Ollama | llama.cpp を直接 | LM Studio | Jan |
|---|---|---|---|---|
| 正体 | llama.cpp を包んだ CLI + HTTP サーバー | 推論エンジンそのもの | llama.cpp を包んだ GUI アプリ | llama.cpp を包んだ GUI アプリ |
| ライセンス | MIT（OSS） | MIT（OSS） | 無料だが非 OSS。2025 年 7 月に業務利用も無料化 | Apache 2.0（OSS） |
| 費用 | 0 円 | 0 円 | 0 円 | 0 円 |
| モデルの入手 | `ollama pull` の 1 コマンド | 自分でファイルを探して配置 | GUI で検索・取得 | GUI で検索・取得 |
| アプリからの呼び出し | `localhost:11434` に HTTP で JSON | 付属サーバーを自分で起動 | OpenAI 互換 HTTP サーバー内蔵 | 同左 |
| Windows 対応 | 公式 | 公式 | 公式 | 公式 |
| 内蔵 GPU（Radeon 740M） | 既定は CPU。`OLLAMA_VULKAN=1` で Vulkan を有効化可能 | Vulkan ビルドで使用可 | Vulkan 対応 | Vulkan 対応 |
| 実務での利用度 | ローカル LLM の開発用途で最も一般的 | 組み込み・研究寄り | 個人利用中心 | 個人利用中心 |
| 学習価値 | HTTP API、プロンプト、JSON 出力を直接扱える | 最も低レベルだが手間が学習の邪魔になる | GUI が仕組みを隠す | 同左 |

## Decision

**Ollama** を採用する。

- 裏側（Node.js）から `http://localhost:11434` に HTTP リクエストを送って呼び出す。
- 使用するモデルは Phase 8 で、3B クラスと 7〜8B クラスを実測して決める。モデル自体のライセンスもその時点で確認する。
- 内蔵 GPU の利用（Vulkan）は Phase 8 で CPU と比較する実験として扱う。既定は CPU。

## Why

1. **OSS（MIT）で課金リスクがゼロ。** LM Studio も無料だが非 OSS であり、方針変更のリスクを「0 円必須」のプロジェクトで抱える理由がない。
2. **「HTTP で JSON を送り JSON を受け取る」形そのもの。** Phase 6 で Express に対して学ぶ構造を、LLM に対しても繰り返すことになり、理解が重なる。
3. **モデルの入れ替えが 1 コマンド。** Phase 8 で複数モデルの速度と質を比べる作業が避けられないため、手軽さが実際に効く。

llama.cpp を直接使う案は仕組みが最も見えるが、ビルドやファイル配置の手間が JavaScript 学習の邪魔になる。ただし「Ollama の中身は llama.cpp である」ことは本 ADR に明記し、ブラックボックスにしない。

## Trade-offs

- Ollama が間に入る分、llama.cpp のパラメータを細かく制御しにくい。MVP では不要。
- 常駐プログラムが 1 つ増える。メモリ 16 GB の PC では、使わないときは終了しておく運用を検討する。
- CPU 推論のため応答が遅い。NFR-3（15 秒以内）はモデルの大きさとのトレードオフになる（product-requirements.md のリスク参照）。

## セキュリティ上の確認事項

- 入力した英文も LLM の返答も PC の外に出ない。インターネット通信はモデルのダウンロード時のみ。
- 既定で `127.0.0.1` にのみ待ち受けるため、同一ネットワークの他の機器やインターネットからは接続できない。
- `OLLAMA_HOST=0.0.0.0` のような外部公開の設定は行わない。外部公開状態を狙った脆弱性の報告が過去にあるため。
- 更新通知には従う。
- モデルは Ollama の公式ライブラリからのみ取得する。出所不明のモデルファイルは使わない。
- モデルファイル（GGUF）は数値データであり、それ自体がプログラムとして実行されることはない。

## 参考

- Ollama GPU documentation: https://docs.ollama.com/gpu.md
- Ollama での AMD 内蔵 GPU（Vulkan）有効化の事例: https://administrator.de/tutorial/ollama-amd-radeon-890m-gpu-beschleunigung-ryzen-ai-678152.html
- LM Studio の業務利用無料化: https://simonwillison.net/2025/Jul/8/lm-studio-is-free-for-use-at-work
- llama.cpp Vulkan backend と AMD iGPU: https://github.com/ggml-org/llama.cpp/issues/13565
