import { Module } from "@nestjs/common";
import { AutonomousModeHandler } from "./handlers/autonomous.handler";
import { SynchronizedModeHandler } from "./handlers/synchronized.handler";
import { SessionCrudService } from "./services/session-crud.service";
import { SessionStatsService } from "./services/session-stats.service";
import { SessionTimerService } from "./services/session-timer.service";
import { SessionController } from "./session.controller";
import { SessionGateway } from "./session.gateway";
import { SessionService } from "./session.service";
import { SessionStateStore } from "./state-store";

@Module({
  controllers: [SessionController],
  providers: [
    SessionService,
    SessionGateway,
    SessionStateStore,
    SessionCrudService,
    SessionStatsService,
    SessionTimerService,
    SynchronizedModeHandler,
    AutonomousModeHandler,
  ],
})
export class SessionModule {}
