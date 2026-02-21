import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import Redis from "ioredis";
import { SessionStatus } from "@prisma/client";

export type SessionState = {
  code: string;
  status: SessionStatus;
  currentQuestionIndex: number | null;
  updatedAt: string;
};

@Injectable()
export class SessionStateStore {
  private readonly redis?: Redis;
  private readonly memory = new Map<string, string>();

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
      await this.redis.set(key, payload);
    } else {
      this.memory.set(key, payload);
    }

    return state;
  }

  private key(code: string) {
    return `session:${code}:state`;
  }
}
