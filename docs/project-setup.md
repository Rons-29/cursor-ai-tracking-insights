# プロジェクト構成・DB スキーマ・Phase 方針

## 構成

```
cursor-ai-tracking-insights/
├── .cursor/rules/     # プロジェクト用ルール
├── src/
│   ├── index.ts      # CLI エントリ（Commander 起動）
│   ├── db/
│   │   ├── schema.ts # テーブル型・定数
│   │   ├── reader.ts # DB 読み取り専用
│   │   └── reader.spec.ts
│   └── cli/
│       └── commands.ts # summary サブコマンド
└── docs/
    └── project-setup.md
```

## 実 DB スキーマ（参照用）

参照元: `~/.cursor/ai-tracking/ai-code-tracking.db`  
**スキーマは Cursor に依存します。変更時は要対応**（`src/db/schema.ts` と本ドキュメントを更新すること）。

### ai_code_hashes（Phase 1 で利用）

| カラム | 型 | 説明 |
|--------|-----|------|
| hash | TEXT | PRIMARY KEY |
| source | TEXT | NOT NULL |
| fileExtension | TEXT | |
| fileName | TEXT | 絶対パス |
| requestId | TEXT | |
| conversationId | TEXT | |
| timestamp | INTEGER | |
| createdAt | INTEGER | NOT NULL（Unix ミリ秒） |
| model | TEXT | |

インデックス: `idx_ai_code_hashes_createdAt ON ai_code_hashes(createdAt)`

### conversation_summaries（型参照用）

| カラム | 型 |
|--------|-----|
| conversationId | TEXT PRIMARY KEY |
| title | TEXT |
| tldr | TEXT |
| overview | TEXT |
| summaryBullets | TEXT |
| model | TEXT |
| mode | TEXT |
| updatedAt | INTEGER NOT NULL |

### その他テーブル（Phase 1 では未使用）

- `scored_commits`: commitHash, branchName, scoredAt
- `tracking_state`: key, value

## Phase 名の対応

- **Phase 1**: 今回の CLI（summary サブコマンド）
- **Phase 2**: 集計・CSV/JSON エクスポート、簡易 Web ダッシュボード
- **Phase 3**: Slack/Teams 日次サマリ
- **Phase 4**: 監査用エクスポート

## Phase 2 / Phase 3 への拡張方針

- **Phase 2**: `list` / `stats` サブコマンド追加、`listByRepo` / `countByExtension` 相当のクエリ、`export`、静的 HTML または軽量 Express API
- **Phase 3**: `daily-summary` サブコマンド、当日分の集計、Slack/Teams Incoming Webhook、cron 運用例を README に記載
