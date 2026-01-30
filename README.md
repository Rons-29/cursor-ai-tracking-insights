# cursor-ai-tracking-insights

Cursor AI コード利用状況をローカルで可視化する CLI です。`~/.cursor/ai-tracking/ai-code-tracking.db` を**読み取り専用**で参照し、サマリと一覧を表示します。

## 前提

- **Node.js**: 18 以上
- **pnpm**: 本プロジェクトでは pnpm を使用します
- **Cursor**: DB は Cursor が更新します。スキーマは Cursor に依存し、変更時は要対応です

## セットアップ

```bash
pnpm install
pnpm run build
```

## 使い方

```bash
# サマリ表示（table、直近 7 日・最大 20 件）
node dist/index.js summary --repo /path/to/your/repo

# 日数・件数・出力形式を指定
node dist/index.js summary --repo /path/to/repo --days 7 --limit 20 --output json

# DB パスを指定（未指定時は TRACKING_DB_PATH または ~/.cursor/ai-tracking/ai-code-tracking.db）
node dist/index.js summary --repo /path/to/repo --db-path /path/to/ai-code-tracking.db
```

`pnpm run start` で起動する場合、サブコマンドとオプションは `--` の後に続けます。

```bash
pnpm run start -- summary --repo /Users/you/project --days 7 --limit 20
```

## 環境変数

| 変数 | 説明 |
|------|------|
| `TRACKING_DB_PATH` | DB ファイルの絶対パス。未設定時は `~/.cursor/ai-tracking/ai-code-tracking.db`（`~` はアプリ内で `os.homedir()` により解決） |

`.env` は git に含めません。`env.example` をコピーして `.env` を作成してください。

## 注意事項

- DB は**読み取り専用**で参照します。書き込み・スキーマ変更は行いません
- スキーマは Cursor のバージョンに依存します。変更時は `src/db/schema.ts` と `docs/project-setup.md` を更新してください
- DB が存在しない場合や他プロセスでロックされている場合は、計画で定めたエラーメッセージを表示して終了します

## テスト

```bash
pnpm test
```

## 次のステップ（Phase 2 以降・計画より）

| Phase | 内容 |
|-------|------|
| **Phase 2** | `list` / `stats` サブコマンド、拡張子別・日付別集計、CSV/JSON エクスポート、簡易 Web ダッシュボード（静的 HTML または Express） |
| **Phase 3** | `daily-summary` サブコマンドで当日分を集計し、Slack/Teams の Incoming Webhook に送信。cron で日次実行する運用例を README に記載 |
| **Phase 4** | 監査用エクスポート（固定フォーマット）、出力先（ローカル or S3/Sheets）、ファイルパスの匿名化オプション |

詳細は `docs/project-setup.md` を参照してください。

## Git 連携（このリポジトリ: cursor-ai-tracking-insights）

**このフォルダ（cursor-ai-tracking-insights）** のみが 1 つの Git リポジトリです。親の `project` フォルダとは別です。

- `git init` 済み・初回コミット済み（main ブランチ）
- **リモート（GitHub/GitLab 等）は未設定**です。追加する手順は以下です。

### 1. リモートの追加とプッシュ

GitHub 等で **cursor-ai-tracking-insights** 用のリポジトリを新規作成したあと、このフォルダで実行します。

```bash
cd /path/to/cursor-ai-tracking-insights   # このリポジトリのルート
git remote add origin https://github.com/<あなたのユーザ名>/cursor-ai-tracking-insights.git
git branch -M main
git push -u origin main
```

（SSH の場合は `git@github.com:<ユーザ名>/cursor-ai-tracking-insights.git` を使用してください。）

### 2. 今後

- `.env` はコミットしない（`.gitignore` に含まれています）
- `node_modules/` と `dist/` も `.gitignore` 済みです

## ライセンス

未定（個人利用を想定）
