/**
 * Phase 1 で利用するテーブル: ai_code_hashes のみ。
 * スキーマは Cursor に依存。変更時は要対応。
 * @see docs/project-setup.md
 */

/** DB の ai_code_hashes 行（createdAt は Unix ms） */
export interface AiCodeHashRow {
  hash: string;
  source: string;
  fileExtension: string | null;
  fileName: string | null;
  requestId: string | null;
  conversationId: string | null;
  timestamp: number | null;
  createdAt: number;
  model: string | null;
}

/** summary 出力用（id, repoPath, language はアプリで付与） */
export interface AiCodeHash {
  id: number;
  repoPath: string;
  fileName: string;
  fileExtension: string;
  language: string;
  hash: string;
  model: string;
  source: string;
  createdAt: string; // ISO 8601
}

/** 拡張子 → language 名（実 DB に language が無い場合の推定用） */
export const EXTENSION_TO_LANGUAGE: Record<string, string> = {
  '.ts': 'typescript',
  '.tsx': 'typescript',
  '.js': 'javascript',
  '.jsx': 'javascript',
  '.py': 'python',
  '.md': 'markdown',
  '.json': 'json',
  '.html': 'html',
  '.css': 'css',
  '.sql': 'sql',
  '.sh': 'shell',
  '.yml': 'yaml',
  '.yaml': 'yaml',
};

export function extensionToLanguage(ext: string | null): string {
  if (!ext) return 'unknown';
  const normalized = ext.startsWith('.') ? ext : `.${ext}`;
  return EXTENSION_TO_LANGUAGE[normalized] ?? (normalized.slice(1) || 'unknown');
}
