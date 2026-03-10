import { Prisma, Session } from "@prisma/client";
import { SessionState } from "../state-store";
import { CreateSessionDto } from "../dto/create-session.dto";
import { JoinSessionDto } from "../dto/join-session.dto";

type StartSessionReturn = {
  state: SessionState;
  question: Prisma.QuestionGetPayload<{
    include: { choices: { select: { text: true; id: true } } };
  }>;
};

export interface ISessionService {
  startSession(code: string): Promise<StartSessionReturn>;
  restartSession(code: string): Promise<StartSessionReturn>;
  archiveSession(code: string): Promise<Session>;
  createSession(
    dto: CreateSessionDto,
  ): Promise<{ session: Session; state: SessionState }>;
  userActiveSessions(userId: number): Promise<Session[]>;
  joinSession(code: string, dto: JoinSessionDto): Promise<{ playerId: number }>;
  getState(code: string): Promise<{ state: SessionState }>;
  nextQuestion(code: string): Promise<{ state: SessionState }>;
  revealAnswer(code: string): Promise<{ state: SessionState }>;
  endSession(code: string): Promise<{ state: SessionState }>;
}
