import { Category } from "../category/category.types";
import { Question } from "../question/question.types";
import { Session } from "../session/session.types";

export type QuizOptions = {
  autoRestart: boolean;
  revealAnswers: boolean;
  showLeaderboard: boolean;
  showScores: boolean;
  showFullRanking: boolean;
};

export type Quiz = {
  id: number;
  title: string;
  status: "DRAFT" | "PUBLISHED";
  options: QuizOptions | null;
  categories: Category[];
  questions: Question[];
  sessions?: Session[];
};
