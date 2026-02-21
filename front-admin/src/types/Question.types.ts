export type ChoiceInput = { text: string; isCorrect: boolean };
export type QuestionInput = {
  prompt: string;
  timeLimitSec: number | null;
  points: number | null;
  choices: ChoiceInput[];
};
