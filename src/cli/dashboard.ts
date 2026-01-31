import { Command } from 'commander';
import { startServer } from '../server';

export function registerDashboard(program: Command): void {
  program
    .command('dashboard')
    .description('簡易Webダッシュボードを起動（日付別・拡張子別の件数とファイル一覧）')
    .option('--port <n>', 'ポート番号', '3840')
    .action((options: { port: string }) => {
      const port = parseInt(options.port, 10) || 3840;
      startServer(port);
    });
}
