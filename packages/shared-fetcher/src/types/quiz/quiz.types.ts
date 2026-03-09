import { Category } from "../category/category.types";
import { Question } from "../question/question.types";
import { Session } from "../session/session.types";

export type Quiz = {
  id: number;
  title: string;
  status: "DRAFT" | "PUBLISHED";
  categories: Category[];
  questions?: Question[];
  sessions?: Session[];
};
