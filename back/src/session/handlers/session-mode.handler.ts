import { BadRequestException } from "@nestjs/common";
import { FlowResult } from "../session.types";

export abstract class SessionModeHandler {
  abstract start(code: string): Promise<FlowResult>;
  abstract advance(code: string): Promise<FlowResult>;
  abstract end(code: string): Promise<FlowResult>;

  reveal(_code: string): Promise<FlowResult> {
    return Promise.reject(
      new BadRequestException("Reveal is not supported in this mode"),
    );
  }

  restart(_code: string, _keepAnswers?: boolean): Promise<FlowResult> {
    return Promise.reject(
      new BadRequestException("Restart is not supported in this mode"),
    );
  }
}
