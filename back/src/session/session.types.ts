import { SessionState } from "./state-store";

export type BroadcastInstruction = {
  event: string;
  data: unknown;
};

export type NextTimerAction = "reveal" | "advance" | "restart";

export type TimerHint = {
  delayMs: number;
  nextAction: NextTimerAction;
};

export type FlowResult = {
  state: SessionState;
  instructions: BroadcastInstruction[];
  timer?: TimerHint;
};
