import { CreateQuizDto } from "../../dto/create-quiz.dto";
import { QuizWithCategories } from "../model/quiz.model";
import { UpdateQuizDto } from "../../dto/update-quiz.dto";
import { Category, Quiz } from "@prisma/client";

export interface IQuizService {
  list(userId: number): Promise<QuizWithCategories[]>;
  get(id: number): Promise<QuizWithCategories>;
  create(dto: CreateQuizDto, userId: number): Promise<QuizWithCategories>;
  update(id: number, dto: UpdateQuizDto): Promise<Quiz>;
  remove(id: number): Promise<Quiz>;
  createCategory(quizId: number, name: string): Promise<Category>;
  deleteCategory(categoryId: number): Promise<Category>;
}
