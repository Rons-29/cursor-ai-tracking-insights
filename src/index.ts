#!/usr/bin/env node
import { Command } from 'commander';
import { registerSummary } from './cli/commands';
import { registerDashboard } from './cli/dashboard';

const program = new Command();

program
  .name('cursor-ai-insights')
  .description('Cursor AI コード利用状況のローカル可視化 CLI')
  .version('0.1.0');

registerSummary(program);
registerDashboard(program);

program.parse();
