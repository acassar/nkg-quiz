import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from "@nestjs/common";
import { AuthGuard } from "../auth/auth.guard";
import { AuthenticatedRequest } from "../common/types/authenticated-request.type";
import { CreateSessionDto } from "./dto/create-session.dto";
import { JoinSessionDto } from "./dto/join-session.dto";
import { SessionService } from "./session.service";
import { Session } from "@prisma/client";

@Controller("sessions")
export class SessionController {
  constructor(private readonly sessionService: SessionService) {}

  @UseGuards(AuthGuard)
  @Post()
  create(@Body() dto: CreateSessionDto) {
    return this.sessionService.createSession(dto);
  }

  @Get("active")
  @UseGuards(AuthGuard)
  userActiveSessions(@Req() req: AuthenticatedRequest): Promise<Session[]> {
    return this.sessionService.userActiveSessions(req.user.sub);
  }

  @Post(":code/join")
  join(@Param("code") code: string, @Body() dto: JoinSessionDto) {
    return this.sessionService.joinSession(code, dto);
  }

  @Get(":code/state")
  getState(@Param("code") code: string) {
    return this.sessionService.getState(code);
  }

  @Get(":code/quiz")
  getQuiz(@Param("code") code: string) {
    return this.sessionService.getQuiz(code);
  }

  @UseGuards(AuthGuard)
  @Post(":code/start")
  start(@Param("code") code: string) {
    return this.sessionService.startSession(code);
  }

  @UseGuards(AuthGuard)
  @Post(":code/restart")
  restart(@Param("code") code: string) {
    return this.sessionService.restartSession(code);
  }

  @UseGuards(AuthGuard)
  @Post(":code/next")
  next(@Param("code") code: string) {
    return this.sessionService.nextQuestion(code);
  }

  @UseGuards(AuthGuard)
  @Post(":code/reveal")
  reveal(@Param("code") code: string) {
    return this.sessionService.revealAnswer(code);
  }

  @UseGuards(AuthGuard)
  @Post(":code/end")
  end(@Param("code") code: string) {
    return this.sessionService.endSession(code);
  }

  @UseGuards(AuthGuard)
  @Post(":code/archive")
  archive(@Param("code") code: string) {
    return this.sessionService.archiveSession(code);
  }
}
