import { Question, QuestionInput } from "../question/question.types";

export type Category = {
  id: number;
  quizId: number;
  name: string;
  questions: Question[];
};

export type CategoryInput = Omit<Category, "id" | "quizId" | "questions"> & {
  id?: number;
  quizId?: number;
  questions: QuestionInput[];
};
