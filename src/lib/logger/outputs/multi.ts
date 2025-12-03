/**
 * 📊 複数出力先への配信
 */

import type { LogEntry, LogOutput } from '../types'

export class MultiOutput implements LogOutput {
  name = 'multi'

  constructor(private outputs: LogOutput[]) {}

  write(entry: LogEntry): void {
    this.outputs.forEach((output) => {
      try {
        output.write(entry)
      } catch (error) {
        console.error(`Output ${output.name} write error:`, error)
      }
    })
  }

  async flush(): Promise<void> {
    await Promise.all(
      this.outputs
        .filter((output) => output.flush)
        .map((output) => Promise.resolve(output.flush!()).catch(console.error))
    )
  }

  async close(): Promise<void> {
    await Promise.all(
      this.outputs
        .filter((output) => output.close)
        .map((output) => Promise.resolve(output.close!()).catch(console.error))
    )
  }
}
