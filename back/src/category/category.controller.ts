import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from "@nestjs/common";
import { AuthGuard } from "../auth/auth.guard";
import { CategoryService } from "./category.service";
import { CreateCategoryDto } from "./dto/create-category.dto";
import { UpdateCategoryDto } from "./dto/update-category.dto";

@Controller("categories")
@UseGuards(AuthGuard)
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Get(":id")
  get(@Param("id") id: string) {
    return this.categoryService.get(Number(id));
  }

  @Get("quiz/:quizId")
  listByQuiz(@Param("quizId") quizId: string) {
    return this.categoryService.listByQuiz(Number(quizId));
  }

  @Post("quiz/:quizId")
  create(@Param("quizId") quizId: string, @Body() dto: CreateCategoryDto) {
    return this.categoryService.create(Number(quizId), dto);
  }

  @Patch(":id")
  update(@Param("id") id: string, @Body() dto: UpdateCategoryDto) {
    return this.categoryService.update(Number(id), dto);
  }

  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.categoryService.remove(Number(id));
  }
}
