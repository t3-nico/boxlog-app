/**
 * 🖥️ コンソール出力
 */

import { getFormatter } from '../formatters';
import type { LogEntry, LogOutput } from '../types';

export class ConsoleOutput implements LogOutput {
  name = 'console';
  private formatter;

  constructor(format: 'json' | 'pretty' | 'simple' = 'pretty') {
    this.formatter = getFormatter(format);
  }

  write(entry: LogEntry): void {
    const formatted = this.formatter(entry);

    // ログレベルに応じた出力先選択
    if (entry.level === 'error') {
      console.error(formatted);
    } else if (entry.level === 'warn') {
      console.warn(formatted);
    } else {
      console.log(formatted);
    }
  }
}
