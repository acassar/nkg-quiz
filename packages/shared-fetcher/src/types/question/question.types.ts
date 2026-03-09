import { Choice, ChoiceInput } from "../choice/choice.types";

export type Question = {
  id: number;
  categoryId: number;
  prompt: string;
  timeLimitSec: number | null;
  points: number | null;
  choices: Choice[];
};

export type QuestionInput = Omit<Question, "id" | "categoryId" | "choices"> & {
  id: number | undefined;
  categoryId: number;
  choices: ChoiceInput[];
};
