import { Injectable, Logger } from "@nestjs/common";

@Injectable()
export class SessionTimerService {
  private readonly logger = new Logger(SessionTimerService.name);
  private readonly timers = new Map<string, NodeJS.Timeout>();

  schedule(code: string, delayMs: number, callback: () => Promise<void>): void {
    this.cancel(code);
    const timeout = setTimeout(async () => {
      this.timers.delete(code);
      try {
        await callback();
      } catch (e) {
        this.logger.error(`Timer callback failed for session ${code}`, e);
      }
    }, delayMs);
    this.timers.set(code, timeout);
  }

  cancel(code: string): void {
    const timer = this.timers.get(code);
    if (timer) {
      clearTimeout(timer);
      this.timers.delete(code);
    }
  }
}
