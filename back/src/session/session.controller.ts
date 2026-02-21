import { Body, Controller, Get, Param, Post, UseGuards } from "@nestjs/common";
import { AuthGuard } from "../auth/auth.guard";
import { CreateSessionDto } from "./dto/create-session.dto";
import { JoinSessionDto } from "./dto/join-session.dto";
import { SessionService } from "./session.service";

@Controller("sessions")
export class SessionController {
  constructor(private readonly sessionService: SessionService) {}

  @UseGuards(AuthGuard)
  @Post()
  create(@Body() dto: CreateSessionDto) {
    return this.sessionService.createSession(dto);
  }

  @Post(":code/join")
  join(@Param("code") code: string, @Body() dto: JoinSessionDto) {
    return this.sessionService.joinSession(code, dto);
  }

  @Get(":code/state")
  getState(@Param("code") code: string) {
    return this.sessionService.getState(code);
  }

  @UseGuards(AuthGuard)
  @Post(":code/start")
  start(@Param("code") code: string) {
    return this.sessionService.startSession(code);
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
}
