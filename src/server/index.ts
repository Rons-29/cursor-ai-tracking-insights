import * as path from 'path';
import express, { Request, Response } from 'express';
import { getDbPath } from '../db/reader';
import {
  getSummary,
  getStatsByDate,
  getStatsByExtension,
} from '../db/reader';

export function createApp(): express.Express {
  const app = express();

  app.get('/api/stats', (req: Request, res: Response) => {
    const repo = (req.query.repo as string)?.trim();
    const days = Math.min(
      365,
      Math.max(1, parseInt(String(req.query.days || '30'), 10) || 30)
    );

    if (!repo) {
      res.status(400).json({ error: 'クエリ repo を指定してください。' });
      return;
    }

    try {
      const dbPath = getDbPath();
      const byDate = getStatsByDate(dbPath, repo, days);
      const byExtension = getStatsByExtension(dbPath, repo, days);
      const { totalCount, items } = getSummary(dbPath, repo, {
        days,
        limit: 200,
      });

      res.json({
        byDate,
        byExtension,
        totalCount,
        items,
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      res.status(500).json({ error: msg });
    }
  });

  const publicDir = path.join(process.cwd(), 'public');
  app.use(express.static(publicDir));

  app.get('/', (_req: Request, res: Response) => {
    res.sendFile(path.join(publicDir, 'dashboard', 'index.html'));
  });

  return app;
}

export function startServer(port: number): void {
  const app = createApp();
  app.listen(port, () => {
    console.log(`ダッシュボード: http://localhost:${port}`);
  });
}
