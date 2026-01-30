import { Command } from 'commander';
import { getSummary, getDbPath } from '../db/reader';
import type { AiCodeHash } from '../db/schema';

const ERR_REPO_REQUIRED = '--repo でリポジトリパスを指定してください。';

function formatTable(items: AiCodeHash[]): string {
  if (items.length === 0) return '';
  const cols = ['id', 'repoPath', 'fileName', 'fileExtension', 'language', 'hash', 'model', 'source', 'createdAt'];
  const rowToRecord = (r: AiCodeHash): Record<string, unknown> =>
    ({ id: r.id, repoPath: r.repoPath, fileName: r.fileName, fileExtension: r.fileExtension, language: r.language, hash: r.hash, model: r.model, source: r.source, createdAt: r.createdAt });
  const widths = cols.map((c) => Math.max(c.length, ...items.map((r) => String(rowToRecord(r)[c] ?? '').length)));
  const line = widths.map((w) => '-'.repeat(Math.min(w, 40))).join('-+-');
  const header = cols.map((c, i) => String(c).padEnd(widths[i]).slice(0, 40)).join(' | ');
  const rows = items.map((row) =>
    cols.map((c, i) => String(rowToRecord(row)[c] ?? '').padEnd(widths[i]).slice(0, 40)).join(' | ')
  );
  return [header, line, ...rows].join('\n');
}

export function registerSummary(program: Command): void {
  program
    .command('summary')
    .description('指定リポジトリの AI コード利用サマリ（総件数・直近 N 件）を表示する')
    .requiredOption('--repo <path>', 'リポジトリの絶対パス')
    .option('--days <n>', '直近 N 日で絞る', '7')
    .option('--limit <n>', '一覧の最大件数', '20')
    .option('--db-path <path>', 'DB ファイルのパス（未指定時は TRACKING_DB_PATH または ~/.cursor/ai-tracking/ai-code-tracking.db）')
    .option('--output <format>', '出力形式: table | json', 'table')
    .action((options: { repo?: string; days: string; limit: string; dbPath?: string; output: string }) => {
      const repo = options.repo;
      if (!repo) {
        console.error(ERR_REPO_REQUIRED);
        process.exit(1);
      }
      const dbPath = options.dbPath ? getDbPath(options.dbPath) : getDbPath();
      const days = parseInt(options.days, 10) || 7;
      const limit = parseInt(options.limit, 10) || 20;
      const outputFormat = (options.output || 'table').toLowerCase();

      try {
        const { totalCount, items } = getSummary(dbPath, repo, { days, limit });
        if (outputFormat === 'json') {
          console.log(JSON.stringify({ totalCount, items }, null, 2));
        } else {
          console.log(`totalCount: ${totalCount}`);
          console.log(formatTable(items));
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        console.error(msg);
        process.exit(1);
      }
    });
}
