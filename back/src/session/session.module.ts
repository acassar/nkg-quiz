import { Module } from "@nestjs/common";
import { SessionController } from "./session.controller";
import { SessionGateway } from "./session.gateway";
import { SessionService } from "./session.service";
import { SessionStateStore } from "./state-store";

@Module({
  controllers: [SessionController],
  providers: [SessionService, SessionGateway, SessionStateStore],
})
export class SessionModule {}
