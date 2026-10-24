// SQL を手で打って試すための小さな対話ツール。
// 使い方:  node scripts/sql-repl.ts            → メモリ上の使い捨て Database
//          node scripts/sql-repl.ts data/app.db → ファイルの Database
// 1 行 1 文で入力し、Enter で実行。空行で終了。

import { DatabaseSync } from "node:sqlite";
import { createInterface } from "node:readline";

const path = process.argv[2] ?? ":memory:";
const db = new DatabaseSync(path);
console.log(`connected: ${path}  (empty line to quit)`);

const rl = createInterface({ input: process.stdin, output: process.stdout, prompt: "sql> " });
rl.prompt();

rl.on("line", (line) => {
  const sql = line.trim();
  if (sql === "") {
    rl.close();
    return;
  }
  try {
    if (/^\s*(select|pragma|with|explain)/i.test(sql)) {
      console.table(db.prepare(sql).all());
    } else {
      const result = db.prepare(sql).run();
      console.log(`ok (changes: ${result.changes})`);
    }
  } catch (e) {
    console.error("error:", e instanceof Error ? e.message : e);
  }
  rl.prompt();
});

rl.on("close", () => {
  db.close();
  console.log("bye");
});
