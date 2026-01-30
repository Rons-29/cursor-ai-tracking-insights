import { describe, it, expect } from 'vitest';
import * as path from 'path';
import * as os from 'os';
import * as fs from 'fs';
import { getSummary, getDbPath, openDbReadOnly } from './reader';

describe('getDbPath', () => {
  it('returns TRACKING_DB_PATH if set', () => {
    const p = path.join(os.tmpdir(), 'test.db');
    process.env.TRACKING_DB_PATH = p;
    expect(getDbPath()).toBe(p);
    delete process.env.TRACKING_DB_PATH;
  });

  it('resolves default path with os.homedir() when TRACKING_DB_PATH is not set', () => {
    delete process.env.TRACKING_DB_PATH;
    const got = getDbPath();
    expect(got).toContain(path.join(os.homedir(), '.cursor', 'ai-tracking', 'ai-code-tracking.db'));
  });
});

describe('openDbReadOnly', () => {
  it('throws with plan message when DB file does not exist', () => {
    const badPath = path.join(os.tmpdir(), 'nonexistent-ai-tracking.db');
    expect(() => openDbReadOnly(badPath)).toThrow(/指定した DB が見つかりません。パスを確認してください:/);
  });

  it('throws with plan message when path is a directory', () => {
    expect(() => openDbReadOnly(os.tmpdir())).toThrow(/DB を開けませんでした。パスを確認してください:/);
  });
});

describe('getSummary', () => {
    const realDbPath = path.join(os.homedir(), '.cursor', 'ai-tracking', 'ai-code-tracking.db');

    it('returns totalCount and items with correct shape', () => {
    if (!fs.existsSync(realDbPath)) {
      console.warn('Skipping getSummary test: real DB not found');
      return;
    }
    const result = getSummary(realDbPath, '/', { days: 7, limit: 5 });
    expect(result).toHaveProperty('totalCount');
    expect(typeof result.totalCount).toBe('number');
    expect(result).toHaveProperty('items');
    expect(Array.isArray(result.items)).toBe(true);
    for (const item of result.items) {
      expect(item).toHaveProperty('id');
      expect(item).toHaveProperty('repoPath');
      expect(item).toHaveProperty('fileName');
      expect(item).toHaveProperty('fileExtension');
      expect(item).toHaveProperty('language');
      expect(item).toHaveProperty('hash');
      expect(item).toHaveProperty('model');
      expect(item).toHaveProperty('source');
      expect(item).toHaveProperty('createdAt');
      expect(typeof item.createdAt).toBe('string');
    }
  });

  it('filters by repoPath prefix', () => {
    if (!fs.existsSync(realDbPath)) return;
    const result = getSummary(realDbPath, os.homedir(), { days: 30, limit: 3 });
    for (const item of result.items) {
      expect(item.fileName.startsWith(item.repoPath) || item.repoPath === item.fileName).toBe(true);
    }
  });
});
