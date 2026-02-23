export type Choice = {
  id: number;
  text: string;
  isCorrect: boolean;
};

export type Question = {
  id: number;
  prompt: string;
  timeLimitSec?: number;
  points?: number;
  choices: Choice[];
};

export type Category = {
  id: number;
  name: string;
  questions: Question[];
};

export type Quiz = {
  id: number;
  title: string;
  status: "DRAFT" | "PUBLISHED";
  categories: Category[];
  questions: Question[];
};
