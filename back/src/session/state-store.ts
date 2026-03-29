import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import Redis from "ioredis";
import { SessionStatus } from "@prisma/client";

export type SessionState = {
  code: string;
  status: SessionStatus;
  currentQuestionIndex: number | null;
  restartAt?: string | null;
  updatedAt: string;
};

@Injectable()
export class SessionStateStore {
  private readonly redis?: Redis;
  private readonly memory = new Map<string, string>();
  private readonly TTL_SECONDS = 24 * 60 * 60; // 24 hours

  constructor(private readonly config: ConfigService) {
    const redisUrl = this.config.get<string>("REDIS_URL");
    if (redisUrl) {
      this.redis = new Redis(redisUrl);
    }
  }

  async get(code: string): Promise<SessionState | null> {
    const key = this.key(code);
    const raw = this.redis ? await this.redis.get(key) : this.memory.get(key);
    return raw ? (JSON.parse(raw) as SessionState) : null;
  }

  async set(state: SessionState): Promise<SessionState> {
    const key = this.key(state.code);
    const payload = JSON.stringify(state);

    if (this.redis) {
      await this.redis.set(key, payload, "EX", this.TTL_SECONDS);
    } else {
      this.memory.set(key, payload);
    }

    return state;
  }

  // ==================== Cleanup ====================

  /**
   * Remove all cached data for a session
   */
  async cleanup(code: string): Promise<void> {
    const stateKey = this.key(code);

    if (this.redis) {
      await this.redis.del(stateKey);
    } else {
      this.memory.delete(stateKey);
    }
  }

  // ==================== Private Helpers ====================

  private key(code: string) {
    return `session:${code}:state`;
  }
}
