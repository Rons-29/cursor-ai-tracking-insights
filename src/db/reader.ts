import * as path from 'path';
import * as os from 'os';
import * as fs from 'fs';
import Database from 'better-sqlite3';
import type { AiCodeHash, AiCodeHashRow } from './schema';
import { extensionToLanguage } from './schema';

const ERR_DB_NOT_FOUND =
  '指定した DB が見つかりません。パスを確認してください: ';
const ERR_DB_OPEN_FAILED = 'DB を開けませんでした。パスを確認してください: ';
const ERR_DB_LOCKED =
  'DB が使用中かもしれません。Cursor を一時終了するか、しばらくして再試行してください。';

export function getDbPath(override?: string): string {
  if (override) return resolvePath(override);
  const env = process.env.TRACKING_DB_PATH;
  if (env) return resolvePath(env);
  return path.join(
    os.homedir(),
    '.cursor',
    'ai-tracking',
    'ai-code-tracking.db'
  );
}

function resolvePath(p: string): string {
  if (p.startsWith('~')) {
    return path.join(os.homedir(), p.slice(1));
  }
  return p;
}

export function openDbReadOnly(dbPath: string): Database.Database {
  const resolved = path.resolve(dbPath);
  if (!fs.existsSync(resolved)) {
    throw new Error(ERR_DB_NOT_FOUND + resolved);
  }
  const stat = fs.statSync(resolved);
  if (!stat.isFile()) {
    throw new Error(ERR_DB_OPEN_FAILED + resolved);
  }
  try {
    return new Database(resolved, { readonly: true });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.includes('SQLITE_BUSY') || msg.includes('locked')) {
      throw new Error(ERR_DB_LOCKED);
    }
    throw new Error(ERR_DB_OPEN_FAILED + resolved);
  }
}

export interface GetSummaryOptions {
  days?: number;
  limit?: number;
}

export function getSummary(
  dbPath: string,
  repoPath: string,
  options: GetSummaryOptions = {}
): { totalCount: number; items: AiCodeHash[] } {
  const { days = 7, limit = 20 } = options;
  const db = openDbReadOnly(dbPath);

  try {
    const sinceMs =
      days > 0 ? Date.now() - days * 24 * 60 * 60 * 1000 : 0;
    const repoNorm = repoPath.replace(/[/\\]$/, '') || repoPath;
    const repoLike = repoNorm + '%';

    const countRow = db
      .prepare(
        `SELECT COUNT(*) AS c FROM ai_code_hashes
         WHERE fileName LIKE ? AND createdAt >= ?`
      )
      .get(repoLike, sinceMs) as { c: number };
    const totalCount = countRow.c;

    const rows = db
      .prepare(
        `SELECT rowid AS id, hash, source, fileExtension, fileName, model, createdAt
         FROM ai_code_hashes
         WHERE fileName LIKE ? AND createdAt >= ?
         ORDER BY createdAt DESC
         LIMIT ?`
      )
      .all(repoLike, sinceMs, limit) as (AiCodeHashRow & { id: number })[];

    const items: AiCodeHash[] = rows.map((row) => ({
      id: row.id,
      repoPath: repoNorm || path.dirname(row.fileName || ''),
      fileName: row.fileName || '',
      fileExtension: row.fileExtension ?? '',
      language: extensionToLanguage(row.fileExtension),
      hash: row.hash,
      model: row.model ?? '',
      source: row.source,
      createdAt: new Date(row.createdAt).toISOString(),
    }));

    return { totalCount, items };
  } finally {
    db.close();
  }
}

/** 日付別件数（日単位、createdAt は Unix ms） */
export interface DateCount {
  date: string; // YYYY-MM-DD
  count: number;
}

export function getStatsByDate(
  dbPath: string,
  repoPath: string,
  days: number = 30
): DateCount[] {
  const db = openDbReadOnly(dbPath);
  try {
    const sinceMs =
      days > 0 ? Date.now() - days * 24 * 60 * 60 * 1000 : 0;
    const repoNorm = repoPath.replace(/[/\\]$/, '') || repoPath;
    const repoLike = repoNorm + '%';

    const rows = db
      .prepare(
        `SELECT date(createdAt / 1000, 'unixepoch') AS date, COUNT(*) AS count
         FROM ai_code_hashes
         WHERE fileName LIKE ? AND createdAt >= ?
         GROUP BY date
         ORDER BY date ASC`
      )
      .all(repoLike, sinceMs) as { date: string; count: number }[];

    return rows.map((r) => ({ date: r.date, count: r.count }));
  } finally {
    db.close();
  }
}

/** 拡張子別件数 */
export interface ExtensionCount {
  extension: string;
  count: number;
}

export function getStatsByExtension(
  dbPath: string,
  repoPath: string,
  days: number = 30
): ExtensionCount[] {
  const db = openDbReadOnly(dbPath);
  try {
    const sinceMs =
      days > 0 ? Date.now() - days * 24 * 60 * 60 * 1000 : 0;
    const repoNorm = repoPath.replace(/[/\\]$/, '') || repoPath;
    const repoLike = repoNorm + '%';

    const rows = db
      .prepare(
        `SELECT COALESCE(fileExtension, '') AS extension, COUNT(*) AS count
         FROM ai_code_hashes
         WHERE fileName LIKE ? AND createdAt >= ?
         GROUP BY extension
         ORDER BY count DESC`
      )
      .all(repoLike, sinceMs) as { extension: string; count: number }[];

    return rows.map((r) => ({
      extension: r.extension || '(none)',
      count: r.count,
    }));
  } finally {
    db.close();
  }
}
